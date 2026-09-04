import { UPS_DATABASE } from "./data/ups.js";
import { BATTERY_MODELS, BATTERY_TECHNICAL_DATA } from "./data/batteries.js";

(function () {
  const AGM_DATABASE = BATTERY_TECHNICAL_DATA.supportedSeries.flatMap((series) =>
    BATTERY_MODELS.map(({ sku, capacityAh }) => {
      const parallel = Math.ceil(BATTERY_TECHNICAL_DATA.minBankCapacityAh / capacityAh);
      const bankCapacityAh = round(capacityAh * parallel, 3);
      const systemVoltage = BATTERY_TECHNICAL_DATA.singleVoltage * series;
      const nominalEnergyWh = round(capacityAh * systemVoltage * parallel, 3);
      return {
        sku,
        singleVoltage: BATTERY_TECHNICAL_DATA.singleVoltage,
        capacityAh,
        bankCapacityAh,
        systemVoltage,
        chargeVoltage: BATTERY_TECHNICAL_DATA.chargeVoltagePerBattery * series,
        dischargeVoltage: BATTERY_TECHNICAL_DATA.dischargeVoltagePerBattery * series,
        nominalEnergyWh,
        usableEnergyWh: round(nominalEnergyWh * BATTERY_TECHNICAL_DATA.usableEnergyFactor, 3),
        dischargeCurrentA: round(capacityAh * BATTERY_TECHNICAL_DATA.dischargeCurrentFactor, 3),
        chargeCurrentA: round(capacityAh * BATTERY_TECHNICAL_DATA.chargeCurrentFactor, 3),
        parallel,
        series,
        stock: BATTERY_TECHNICAL_DATA.defaultStock,
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
        item.bankCapacityAh >= BATTERY_TECHNICAL_DATA.minBankCapacityAh &&
        item.bankCapacityAh <= BATTERY_TECHNICAL_DATA.maxBankCapacityAh &&
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
      metrics: {
        usefulPower: Math.round(ups.usefulPower),
        batteryCount: batteryCount(battery),
        usableEnergy: battery.usableEnergyWh,
        currentRuntime: Math.round((battery.usableEnergyWh * ups.efficiency * 60) / numericPower),
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
    return `${count} x ${battery.sku} — GC AGM 12V; ${formatPlain(battery.capacityAh)} Ah`;
  }

  function batteryCount(battery) {
    return battery.series * battery.parallel;
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

  function formatDuration(totalMinutes) {
    if (totalMinutes === undefined || totalMinutes === null || Number.isNaN(totalMinutes)) return "-";
    const roundedMinutes = Math.max(0, Math.round(totalMinutes));
    const hours = Math.floor(roundedMinutes / 60);
    const minutes = roundedMinutes % 60;
    return hours > 0 ? `${hours} godz. ${minutes} min` : `${minutes} min`;
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

    const upsName = result.ups ? `${result.ups.sku} — ${result.ups.name}` : "brak";
    const selectedBatteryUnits = result.battery ? batteryUnits(result.battery) : "brak";
    document.querySelector("#ups-name").textContent = upsName;
    document.querySelector("#battery-units").textContent = selectedBatteryUnits;

    const metrics = result.metrics || {};
    document.querySelector("#useful-power").textContent = formatNumber(metrics.usefulPower, "W");
    document.querySelector("#battery-count").textContent = formatNumber(metrics.batteryCount, "szt.");
    document.querySelector("#usable-energy").textContent = formatNumber(metrics.usableEnergy, "Wh");
    document.querySelector("#current-runtime").textContent = formatDuration(metrics.currentRuntime);
    document.querySelector("#full-runtime").textContent = formatDuration(metrics.fullRuntime);
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
    render(calculateSelection(power, runtime));
  }

  function clearResults() {
    const status = document.querySelector("#status-pill");
    const message = document.querySelector("#message-box");
    const resultPanel = document.querySelector("#result-panel");
    if (resultPanel) {
      resultPanel.hidden = true;
    }
    const advancedParameters = document.querySelector("#advanced-parameters");
    if (advancedParameters) {
      advancedParameters.removeAttribute("open");
    }
    const featureSection = document.querySelector("#feature-section");
    if (featureSection) {
      featureSection.hidden = true;
    }
    status.className = "status-pill";
    status.textContent = "";
    message.className = "message-box";
    message.hidden = true;
    message.textContent = "";
    [
      "#ups-name",
      "#battery-units",
      "#useful-power",
      "#battery-count",
      "#usable-energy",
      "#current-runtime",
      "#full-runtime",
      "#charge-min",
      "#charge-max",
      "#load-percent",
      "#efficiency",
    ].forEach((selector) => {
      document.querySelector(selector).textContent = "-";
    });
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
    formatDuration,
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
