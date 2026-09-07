import { UPS_DATABASE } from "../data/ups.js";
import { BATTERY_MODELS } from "../data/batteries.js";
import { APPLICATION_DATABASE } from "../data/applications.js";
import { CALCULATION_ASSUMPTIONS } from "../data/calculation-assumptions.js";
import { UPS_MANUFACTURER_CONSTRAINTS } from "../data/ups-constraints.js";
import { calculateSelection } from "../logic/calculation-logic.js";
import { calculateMaximumContinuousOutputPower } from "../logic/runtime-engine.js";
import { resolveUpsImage } from "./ups-images.js";

(function () {
  const RESULT_FIELDS = [
    "#ups-name", "#battery-units", "#ups-load-percent", "#maximum-load",
    "#estimated-runtime", "#main-usable-energy", "#bank-configuration", "#maximum-charge-power",
    "#maximum-discharge-power", "#maximum-charge-current", "#maximum-discharge-current",
    "#maximum-charge-time", "#battery-system-parameters", "#nominal-energy",
    "#maximum-load-runtime", "#cable-type", "#cable-specification", "#cable-current-rating",
  ];

  function formatNumber(value, unit, maximumFractionDigits = 1) {
    if (!Number.isFinite(value)) return "-";
    const formatted = new Intl.NumberFormat("pl-PL", { maximumFractionDigits }).format(value);
    return unit ? `${formatted} ${unit}` : formatted;
  }

  function formatDuration(totalMinutes) {
    if (!Number.isFinite(totalMinutes)) return "-";
    const roundedMinutes = Math.max(0, Math.round(totalMinutes));
    const hours = Math.floor(roundedMinutes / 60);
    const minutes = roundedMinutes % 60;
    return hours ? `${hours} godz. ${minutes} min` : `${minutes} min`;
  }

  function formatOptionalNumber(value, unit, maximumFractionDigits = 1) {
    return Number.isFinite(value) ? formatNumber(value, unit, maximumFractionDigits) : null;
  }

  function formatOptionalDuration(value) {
    return Number.isFinite(value) ? formatDuration(value) : null;
  }

  function selectedApplicationId() {
    return document.querySelector(".application-checkbox:checked")?.value ?? "";
  }

  function setMetric(selector, value) {
    const element = document.querySelector(selector);
    const hasValue = value !== null && value !== undefined && value !== "";
    element.closest("div").hidden = !hasValue;
    element.textContent = hasValue ? value : "-";
  }

  function selectedBatterySystem(result) {
    return result.battery ?? result.internalBatteryInfo ?? null;
  }

  function renderBatteryMetrics(system, configurationText) {
    const displayedCable = system?.cable ?? null;
    setMetric("#maximum-load-runtime", formatOptionalDuration(system?.estimatedRuntimeAtMaximumLoadMinutes));
    setMetric("#bank-configuration", configurationText);
    setMetric("#maximum-charge-power", formatOptionalNumber(system?.maximumChargePowerW, "W", 1));
    setMetric("#maximum-discharge-power", formatOptionalNumber(system?.maximumDischargePowerW, "W", 1));
    setMetric("#maximum-charge-current", formatOptionalNumber(system?.maximumChargeCurrentA, "A", 1));
    setMetric("#maximum-discharge-current", formatOptionalNumber(system?.maximumDischargeCurrentA, "A", 1));
    setMetric("#maximum-charge-time", formatOptionalDuration(system?.maximumChargeTimeMinutes));
    setMetric("#battery-system-parameters", system
      ? `${formatNumber(system.bankVoltageV, "V", 0)} / ${formatNumber(system.bankCapacityAh, "Ah", 2)}`
      : null);
    setMetric("#nominal-energy", formatOptionalNumber(system?.nominalEnergyWh, "Wh", 1));
    setMetric("#cable-type", displayedCable?.type);
    setMetric("#cable-specification", displayedCable?.specification);
    setMetric("#cable-current-rating", displayedCable
      ? formatNumber(displayedCable.maximumCurrentA, "A", 1)
      : null);
  }

  function renderBattery(result) {
    const battery = result.battery;
    const internal = result.internalBatteryInfo;
    const batteryCard = document.querySelector("#battery-result-item");
    const batteryLabel = document.querySelector("#battery-result-label");
    batteryCard.hidden = !battery && !internal;

    if (battery) {
      batteryLabel.textContent = "Zalecany układ akumulatorów zewnętrznych";
      document.querySelector("#battery-units").textContent =
        `${battery.count} × ${battery.battery.sku} — ${battery.battery.name}`;
      renderBatteryMetrics(battery, battery.configuration);
      return;
    }

    if (internal) {
      batteryLabel.textContent = "Wbudowany układ akumulatorów";
      document.querySelector("#battery-units").textContent =
        `${internal.count} × ${internal.battery.sku} — ${internal.battery.name}`;
      renderBatteryMetrics(internal, internal.configurationDescription);
      return;
    }

    batteryLabel.textContent = "Układ akumulatorów";
    document.querySelector("#battery-units").textContent = "-";
    renderBatteryMetrics(null, null);
  }

  function chargingLevelLabel(level) {
    return { L: "Niski", M: "Średni", H: "Wysoki" }[level] ?? level;
  }

  function renderChargingSelector(result) {
    const section = document.querySelector("#charging-section");
    const options = document.querySelector("#charging-options");
    const battery = result.battery;
    const constraint = result.ups ? UPS_MANUFACTURER_CONSTRAINTS[result.ups.sku] : null;
    section.hidden = !battery || !constraint;
    options.replaceChildren();
    if (!battery || !constraint) return;

    constraint.chargingSelectors.forEach((profile) => {
      const row = document.createElement("tr");
      const modelCell = document.createElement("td");
      const capacityCell = document.createElement("td");
      const levelCell = document.createElement("td");
      const currentCell = document.createElement("td");
      const levelSummary = document.createElement("div");
      const level = document.createElement("strong");
      const marker = document.createElement("span");
      const selected = battery.chargingProfile?.level === profile.level;

      modelCell.textContent = result.ups.sku;
      capacityCell.textContent = `${profile.minCapacityAh}–${profile.maxCapacityAh} Ah`;
      level.textContent = `${profile.level} — ${chargingLevelLabel(profile.level)}`;
      marker.className = "calculation-marker";
      marker.textContent = "✓ Użyto w obliczeniach";
      marker.hidden = !selected;
      levelSummary.className = "charging-mode-summary";
      levelSummary.append(level, marker);
      levelCell.append(levelSummary);
      currentCell.textContent = `${profile.currentRangeA[0]}–${profile.currentRangeA[1]} A`;
      row.append(modelCell, capacityCell, levelCell, currentCell);
      row.classList.toggle("is-calculation-source", selected);
      if (selected) row.setAttribute("aria-current", "true");
      options.append(row);
    });
  }

  function renderCableSafety(result) {
    const card = document.querySelector("#cable-safety-card");
    const battery = result.battery;
    card.hidden = !(battery?.count > 1);
    if (!battery || battery.count <= 1) return;

    document.querySelector("#cable-selection-summary").textContent =
      `Do układu ${battery.configuration}, zawierającego ${battery.count} szt. akumulatorów, dobierz komplet przewodów o specyfikacji ${battery.cable.specification}. Obciążalność prądowa przewodów musi wynosić co najmniej ${formatNumber(battery.cable.maximumCurrentA, "A", 1)}.`;
  }

  function render(result) {
    const noSolutionMessage = document.querySelector("#no-solution-message");
    noSolutionMessage.hidden = !result.noSolution;
    noSolutionMessage.textContent = result.noSolution
      ? (result.noSolutionMessage || "Brak rozwiązania.")
      : "";
    if (result.noSolution && !result.nearestAlternative) {
      document.querySelector("#result-panel").hidden = true;
      return;
    }

    document.querySelector("#result-panel").hidden = false;
    document.querySelector("#ups-result-label").textContent = result.nearestAlternative
      ? "Najbliższy dostępny UPS"
      : "Zalecany UPS";
    const recommendation = document.querySelector("#powercore-recommendation");
    recommendation.hidden = !result.recommendationText;
    recommendation.textContent = result.recommendationText ?? "";

    document.querySelector("#ups-name").textContent = result.ups
      ? `${result.ups.sku} — ${result.ups.name}`
      : "Brak odpowiedniego UPS-a";
    const upsImage = document.querySelector("#ups-image");
    upsImage.hidden = !result.ups;
    if (result.ups) {
      upsImage.src = resolveUpsImage(result.ups);
      upsImage.alt = `Zasilacz awaryjny ${result.ups.sku} — ${result.ups.name}`;
    }
    document.querySelector("#ups-load-percent").textContent = result.ups && result.requirements
      ? formatNumber(result.requirements.loadPowerW / result.ups.activePower * 100, "%", 1)
      : "-";
    document.querySelector("#maximum-load").textContent = result.ups
      ? formatNumber(calculateMaximumContinuousOutputPower(result.ups), "W", 0)
      : "-";
    document.querySelector("#estimated-runtime").textContent = formatDuration(
      result.battery?.estimatedRuntimeMinutes ?? result.internalBatteryInfo?.estimatedRuntimeMinutes,
    );
    document.querySelector("#main-usable-energy").textContent =
      formatNumber(selectedBatterySystem(result)?.usableEnergyWh, "Wh", 1);

    renderBattery(result);
    renderChargingSelector(result);
    renderCableSafety(result);
  }

  function currentInput() {
    const hours = Number(document.querySelector("#runtime-hours-input").value) || 0;
    const minutes = Number(document.querySelector("#runtime-minutes-input").value) || 0;
    return {
      applicationId: selectedApplicationId(),
      loadPowerW: document.querySelector("#power-input").value,
      runtimeMinutes: hours * 60 + minutes,
      upsDatabase: UPS_DATABASE,
      batteryDatabase: BATTERY_MODELS,
    };
  }

  function handleSubmit(event) {
    event.preventDefault();
    let result;
    try {
      result = calculateSelection(currentInput());
    } catch (error) {
      result = {
        configurationStatus: "NOT COMPLIANT",
        noSolution: true,
        noSolutionMessage: error.message,
        ups: null,
        battery: null,
      };
    }
    render(result);
    window.requestAnimationFrame(() => {
      const target = result.noSolution ? "#no-solution-message" : "#result-panel";
      document.querySelector(target).scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function clearResults() {
    document.querySelector("#result-panel").hidden = true;
    document.querySelector("#no-solution-message").hidden = true;
    document.querySelector("#no-solution-message").textContent = "";
    document.querySelector("#advanced-parameters")?.removeAttribute("open");
    document.querySelector("#charging-section").hidden = true;
    document.querySelector("#charging-options").replaceChildren();
    document.querySelector("#cable-safety-card").hidden = true;
    document.querySelector("#powercore-recommendation").hidden = true;
    document.querySelector("#powercore-recommendation").textContent = "";
    RESULT_FIELDS.forEach((selector) => {
      const element = document.querySelector(selector);
      element.textContent = "-";
    });
  }

  function populateApplications() {
    const container = document.querySelector("#application-options");
    APPLICATION_DATABASE.forEach((application) => {
      const option = document.createElement("div");
      option.className = "application-option";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "application-checkbox";
      checkbox.name = "application";
      checkbox.value = application.id;
      checkbox.id = `application-${application.id}`;
      checkbox.checked = application.id === "powercore-pure-sine";

      const imageLabel = document.createElement("label");
      imageLabel.className = "application-images";
      imageLabel.htmlFor = checkbox.id;
      imageLabel.setAttribute("aria-label", `Wybierz: ${application.generalUse}`);
      const familyImages = new Map();
      UPS_DATABASE
        .filter((ups) => ups.applicationId === application.id)
        .forEach((ups) => {
          const source = resolveUpsImage(ups);
          if (!familyImages.has(source)) familyImages.set(source, ups);
        });
      familyImages.forEach((ups, source) => {
        const image = document.createElement("img");
        image.className = "application-thumbnail";
        image.src = source;
        image.alt = `UPS ${ups.sku}`;
        image.loading = "lazy";
        imageLabel.append(image);
      });

      const label = document.createElement("label");
      label.className = "application-choice-label";
      label.htmlFor = checkbox.id;
      label.textContent = application.generalUse;

      const help = document.createElement("button");
      help.type = "button";
      help.className = "application-help";
      help.textContent = "?";
      help.setAttribute("aria-label", `Pokaż szczegóły zastosowania: ${application.generalUse}`);
      help.setAttribute("aria-expanded", "false");

      const tooltip = document.createElement("div");
      tooltip.className = "application-tooltip";
      tooltip.setAttribute("role", "tooltip");
      tooltip.innerHTML = `<p>${application.professionalUse}</p><p class="application-loads"><strong>Typowe odbiorniki:</strong> ${application.typicalLoads}</p>`;
      help.setAttribute("aria-describedby", `${checkbox.id}-tooltip`);
      tooltip.id = `${checkbox.id}-tooltip`;

      help.addEventListener("click", () => {
        const willOpen = !option.classList.contains("is-open");
        document.querySelectorAll(".application-option.is-open").forEach((other) => {
          other.classList.remove("is-open");
          other.querySelector(".application-help")?.setAttribute("aria-expanded", "false");
        });
        option.classList.toggle("is-open", willOpen);
        help.setAttribute("aria-expanded", String(willOpen));
      });

      option.append(checkbox, imageLabel, label, help, tooltip);
      container.append(option);
    });
  }

  function setupFormFlow() {
    const inputs = [
      ...document.querySelectorAll(".application-checkbox"),
      document.querySelector("#power-input"),
      document.querySelector("#runtime-hours-input"),
      document.querySelector("#runtime-minutes-input"),
    ];
    const button = document.querySelector("#calculate-button");

    function synchronize() {
      const data = currentInput();
      const hours = Number(document.querySelector("#runtime-hours-input").value) || 0;
      const minutes = Number(document.querySelector("#runtime-minutes-input").value) || 0;
      button.disabled = !data.applicationId ||
        !(Number(data.loadPowerW) > 0) ||
        !Number.isInteger(hours) || hours < 0 ||
        !Number.isInteger(minutes) || minutes < 0 || minutes > 59 ||
        !(data.runtimeMinutes > 0);
      clearResults();
    }

    document.querySelectorAll(".application-checkbox").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          document.querySelectorAll(".application-checkbox").forEach((other) => {
            if (other !== checkbox) other.checked = false;
          });
        }
      });
    });

    inputs.forEach((input) => input.addEventListener("input", synchronize));
    inputs.forEach((input) => input.addEventListener("change", synchronize));
    synchronize();
  }

  if (typeof document !== "undefined") {
    populateApplications();
    document.querySelector("#calculator-form").addEventListener("submit", handleSubmit);
    setupFormFlow();
  }

  if (typeof window !== "undefined") {
    window.upsCalculator = {
      calculateSelection: (input) => calculateSelection({
        ...input,
        upsDatabase: UPS_DATABASE,
        batteryDatabase: BATTERY_MODELS,
      }),
      assumptions: CALCULATION_ASSUMPTIONS,
      applications: APPLICATION_DATABASE,
    };
  }
})();
