(function () {
  const UPS_DATABASE = [
    {
      sku: "UPSLPPC500",
      name: "GC UPS PowerCore AVR 500W (800VA) 12 VDC z wyświetlaczem LCD",
      systemVoltage: 12,
      activePower: 500,
      apparentPower: 800,
      minCurrents: [3, 7, 11],
      maxCurrents: [6, 9, 14],
      efficiency: 0.95,
    },
    {
      sku: "UPSLPPC800",
      name: "GC UPS PowerCore AVR 800W (1200VA) 12 VDC z wyświetlaczem LCD",
      systemVoltage: 12,
      activePower: 800,
      apparentPower: 1200,
      minCurrents: [4, 8, 15],
      maxCurrents: [7, 12, 19],
      efficiency: 0.95,
    },
    {
      sku: "UPSLPPC1000",
      name: "GC UPS PowerCore AVR 1000W (1500VA) 12 VDC z wyświetlaczem LCD",
      systemVoltage: 12,
      activePower: 1000,
      apparentPower: 1500,
      minCurrents: [4, 8, 15],
      maxCurrents: [7, 12, 19],
      efficiency: 0.95,
    },
    {
      sku: "UPSLPPC1200",
      name: "GC UPS PowerCore AVR 1200W (2000VA) 24 VDC z wyświetlaczem LCD",
      systemVoltage: 24,
      activePower: 1200,
      apparentPower: 2000,
      minCurrents: [3, 7, 11],
      maxCurrents: [6, 9, 14],
      efficiency: 0.95,
    },
  ];

  const BATTERY_MODELS = [
    ["AGM04", 7],
    ["AGM05", 7.2],
    ["AGM46", 8],
    ["AGM47", 8.5],
    ["AGM06", 9],
    ["AGM48", 10],
    ["AGM50", 10],
    ["AGM07", 12],
    ["AGM08", 14],
    ["AGM53", 15],
    ["AGM51", 17],
    ["AGM09", 18],
    ["AGM10", 20],
    ["AGM54", 22],
    ["AGM35", 26],
    ["AGM55", 28],
    ["AGM21", 33],
    ["AGM22", 40],
    ["AGM12V40AH-J", 40],
    ["AGM23", 44],
    ["AGM56", 50],
    ["AGM49", 55],
    ["AGM12V55AH-J", 55],
    ["AGM28", 65],
    ["AGM25", 75],
    ["AGM12V75AH-J", 75],
    ["AGM57", 80],
    ["AGM26", 84],
    ["AGM29", 90],
    ["AGM12V90AH-J", 90],
    ["AGM30", 100],
    ["AGM58", 110],
    ["AGM31", 120],
    ["AGM32", 150],
    ["AGM60", 180],
    ["AGM33", 200],
  ];

  const AGM_DATABASE = [1, 2].flatMap((series) =>
    BATTERY_MODELS.map(([sku, capacityAh]) => {
      const parallel = Math.ceil(20 / capacityAh);
      const bankCapacityAh = round(capacityAh * parallel, 3);
      const systemVoltage = 12 * series;
      const nominalEnergyWh = round(capacityAh * systemVoltage * parallel, 3);
      return {
        sku,
        singleVoltage: 12,
        capacityAh,
        bankCapacityAh,
        systemVoltage,
        chargeVoltage: 14.4 * series,
        dischargeVoltage: 9.6 * series,
        nominalEnergyWh,
        usableEnergyWh: round(nominalEnergyWh * 0.8, 3),
        dischargeCurrentA: round(capacityAh * 0.3, 3),
        chargeCurrentA: round(capacityAh * 0.2, 3),
        parallel,
        series,
        stock: 1000,
      };
    })
  );

  function calculateSelection(powerW, runtimeMinutes) {
    const numericPower = Number(powerW);
    const numericRuntime = Number(runtimeMinutes);

    if (!Number.isFinite(numericPower) || numericPower <= 0) {
      return { status: "error", message: "Podaj dodatnią moc czynną urządzeń." };
    }

    if (!Number.isFinite(numericRuntime) || numericRuntime <= 0) {
      return { status: "error", message: "Podaj dodatni czas podtrzymania." };
    }

    const ups = UPS_DATABASE.map((item) => ({
      ...item,
      usefulPower: item.activePower * item.efficiency,
    }))
      .filter((item) => item.usefulPower >= numericPower)
      .sort((a, b) => a.usefulPower - b.usefulPower)[0];

    if (!ups) {
      return {
        status: "error",
        message: "Skontaktuj się z dostawcą w celu dobrania innego rozwiązania.",
      };
    }

    const requiredBatteryEnergy = (numericPower * numericRuntime) / 60 / ups.efficiency;
    const battery = AGM_DATABASE.filter(
      (item) =>
        item.systemVoltage === ups.systemVoltage &&
        item.bankCapacityAh >= 20 &&
        item.bankCapacityAh <= 200 &&
        item.stock >= item.parallel * item.series &&
        item.usableEnergyWh >= requiredBatteryEnergy
    ).sort((a, b) => {
      const energyDifference = a.usableEnergyWh - b.usableEnergyWh;
      if (energyDifference !== 0) return energyDifference;
      return batteryCount(a) - batteryCount(b);
    })[0];

    if (!battery) {
      return {
        status: "warning",
        ups,
        message: "Brak odpowiedniego zestawu akumulatorów dla wskazanego czasu podtrzymania.",
      };
    }

    const minUpsChargingCurrent = Math.min(...ups.minCurrents);
    const maxUpsChargingCurrent = Math.max(...ups.maxCurrents);
    const bankCapacity = battery.capacityAh * battery.parallel;
    const minChargeTime = bankCapacity / Math.min(battery.chargeCurrentA, maxUpsChargingCurrent);
    const maxChargeTime = bankCapacity / Math.min(battery.chargeCurrentA, minUpsChargingCurrent);

    return {
      status: numericRuntime > 200 ? "warning" : "success",
      message:
        numericRuntime > 200
          ? "W arkuszu opisano czas powyżej 200 min jako bardzo długi. Wynik jest policzony, ale warto potwierdzić dobór z dostawcą."
          : "",
      ups,
      battery,
      batteryAlternatives: findBatteryAlternatives(battery),
      metrics: {
        usefulPower: Math.round(ups.usefulPower),
        batteryCount: batteryCount(battery),
        usableEnergy: battery.usableEnergyWh,
        fullRuntime: Math.round((battery.usableEnergyWh * ups.efficiency * 60) / ups.usefulPower),
        minChargeTime: round(minChargeTime, 1),
        maxChargeTime: round(maxChargeTime, 1),
        loadPercent: Math.round((numericPower / ups.usefulPower) * 100),
        efficiencyPercent: ups.efficiency * 100,
      },
    };
  }

  function batteryName(battery) {
    if (!battery) return "brak";
    return `${batteryLayout(battery)} - ${batteryUnits(battery)}`;
  }

  function batteryLayout(battery) {
    if (!battery) return "brak";
    return `${battery.series}s ${battery.parallel}p ${battery.systemVoltage}V; ${formatPlain(
      battery.bankCapacityAh
    )}Ah; ${formatPlain(battery.nominalEnergyWh)} Wh`;
  }

  function batteryUnits(battery) {
    if (!battery) return "brak";
    const count = batteryCount(battery);
    return `${count} x GC AGM 12V; ${formatPlain(battery.capacityAh)} Ah`;
  }

  function batteryCount(battery) {
    return battery.series * battery.parallel;
  }

  function findBatteryAlternatives(selectedBattery) {
    if (!selectedBattery) return [];
    const alternatives = AGM_DATABASE.filter(
      (item) =>
        item !== selectedBattery &&
        item.systemVoltage === selectedBattery.systemVoltage &&
        item.bankCapacityAh === selectedBattery.bankCapacityAh &&
        item.nominalEnergyWh === selectedBattery.nominalEnergyWh &&
        batteryCount(item) !== batteryCount(selectedBattery)
    )
      .sort((a, b) => batteryCount(a) - batteryCount(b))
      .map((item) => `${batteryLayout(item)} (${batteryUnits(item)})`);
    return [...new Set(alternatives)];
  }

  function round(value, decimals) {
    const scale = 10 ** decimals;
    return Math.round((value + Number.EPSILON) * scale) / scale;
  }

  function formatPlain(value) {
    return Number.isInteger(value) ? String(value) : String(value).replace(".", ",");
  }

  function formatNumber(value, unit) {
    if (value === undefined || value === null || Number.isNaN(value)) return "-";
    const formatted = new Intl.NumberFormat("pl-PL", {
      maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
    }).format(value);
    return unit ? `${formatted} ${unit}` : formatted;
  }

  function render(result) {
    const status = document.querySelector("#status-pill");
    const message = document.querySelector("#message-box");

    status.className = "status-pill";
    message.className = "message-box";
    message.hidden = !result.message;
    message.textContent = result.message || "";

    if (result.status === "error") {
      status.classList.add("error");
      message.classList.add("error");
      status.textContent = "Brak doboru";
    } else if (result.status === "warning") {
      status.classList.add("warning");
      status.textContent = "Do weryfikacji";
    } else {
      status.textContent = "";
    }

    const upsName = result.ups ? result.ups.name : "brak";
    const selectedBatteryLayout = result.battery ? batteryLayout(result.battery) : "brak";
    const selectedBatteryUnits = result.battery ? batteryUnits(result.battery) : "brak";
    const alternatives = result.batteryAlternatives || [];
    document.querySelector("#ups-name").textContent = upsName;
    document.querySelector("#battery-layout").textContent = selectedBatteryLayout;
    document.querySelector("#battery-units").textContent = selectedBatteryUnits;
    const batteryAlternative = document.querySelector("#battery-alternative");
    batteryAlternative.hidden = alternatives.length === 0;
    batteryAlternative.textContent = alternatives.length
      ? `*Możliwy również układ: ${alternatives.join("; ")}`
      : "";

    const metrics = result.metrics || {};
    document.querySelector("#useful-power").textContent = formatNumber(metrics.usefulPower, "W");
    document.querySelector("#battery-count").textContent = formatNumber(metrics.batteryCount, "szt.");
    document.querySelector("#usable-energy").textContent = formatNumber(metrics.usableEnergy, "Wh");
    document.querySelector("#full-runtime").textContent = formatNumber(metrics.fullRuntime, "min");
    document.querySelector("#charge-min").textContent = formatNumber(metrics.minChargeTime, "h");
    document.querySelector("#charge-max").textContent = formatNumber(metrics.maxChargeTime, "h");
    document.querySelector("#load-percent").textContent = formatNumber(metrics.loadPercent, "%");
    document.querySelector("#efficiency").textContent = formatNumber(metrics.efficiencyPercent, "%");
  }

  function handleSubmit(event) {
    event.preventDefault();
    const power = document.querySelector("#power-input").value;
    const runtime = document.querySelector("#runtime-input").value;
    document.querySelector("#result-panel").hidden = false;
    document.querySelector("#feature-section").hidden = false;
    document.querySelector("#charging-section").hidden = false;
    render(calculateSelection(power, runtime));
  }

  function clearResults() {
    const status = document.querySelector("#status-pill");
    const message = document.querySelector("#message-box");
    const resultPanel = document.querySelector("#result-panel");
    if (resultPanel) {
      resultPanel.hidden = true;
    }
    const featureSection = document.querySelector("#feature-section");
    if (featureSection) {
      featureSection.hidden = true;
    }
    const chargingSection = document.querySelector("#charging-section");
    if (chargingSection) {
      chargingSection.hidden = true;
    }
    status.className = "status-pill";
    status.textContent = "";
    message.className = "message-box";
    message.hidden = true;
    message.textContent = "";
    [
      "#ups-name",
      "#battery-layout",
      "#battery-units",
      "#battery-alternative",
      "#useful-power",
      "#battery-count",
      "#usable-energy",
      "#full-runtime",
      "#charge-min",
      "#charge-max",
      "#load-percent",
      "#efficiency",
    ].forEach((selector) => {
      document.querySelector(selector).textContent = "-";
    });
    document.querySelector("#battery-alternative").hidden = true;
    document.querySelector("#battery-alternative").textContent = "";
  }

  function setupFormFlow() {
    const powerInput = document.querySelector("#power-input");
    const runtimeInput = document.querySelector("#runtime-input");
    const calculateButton = document.querySelector("#calculate-button");

    function canCalculate() {
      const power = Number(powerInput.value);
      const runtime = Number(runtimeInput.value);
      return Number.isFinite(power) && power > 0 && Number.isFinite(runtime) && runtime > 0;
    }

    function syncCalculateButton() {
      calculateButton.disabled = !canCalculate();
    }

    powerInput.addEventListener("input", () => {
      syncCalculateButton();
      clearResults();
    });

    runtimeInput.addEventListener("input", () => {
      syncCalculateButton();
      clearResults();
    });

    syncCalculateButton();
  }

  const api = {
    calculateSelection,
    batteryName,
    batteryLayout,
    batteryUnits,
    batteryCount,
    findBatteryAlternatives,
    UPS_DATABASE,
    AGM_DATABASE,
  };

  if (typeof document !== "undefined") {
    document.querySelector("#calculator-form").addEventListener("submit", handleSubmit);
    setupFormFlow();
    clearResults();
  }

  if (typeof window !== "undefined") {
    window.upsCalculator = api;
  }

  if (typeof module !== "undefined") {
    module.exports = api;
  }
})();
