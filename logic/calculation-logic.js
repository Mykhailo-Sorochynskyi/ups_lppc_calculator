// Orkiestracja doboru: zastosowanie → UPS → opcjonalny zewnętrzny układ akumulatorów AGM.
// Szczegółowe wzory znajdują się w wyspecjalizowanych modułach silnika.

import { CALCULATION_ASSUMPTIONS } from "../data/calculation-assumptions.js";
import { UPS_MANUFACTURER_CONSTRAINTS } from "../data/ups-constraints.js";
import { selectBatteryConfiguration } from "./battery-sizing-engine.js";
import {
  calculateBatteryCurrentAtCutoff,
  calculateDcPower,
  calculateMaximumContinuousOutputPower,
  estimateBatteryRuntime,
} from "./runtime-engine.js";

const POWERPROOF_APPLICATIONS = new Set([
  "powerproof-modified-sine",
  "powerproof-aio-modified-sine",
  "powerproof-pure-sine",
]);

function supportsExternalBattery(ups) {
  return Boolean(
    ups?.category === "PowerCore" &&
    ups.externalBattery &&
    ups.externalBattery.supported !== false &&
    Number.isFinite(ups.externalBattery.minCapacityAh) &&
    Number.isFinite(ups.externalBattery.maxCapacityAh)
  );
}

function positiveNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) throw new RangeError(`${label} musi być liczbą większą od 0.`);
  return number;
}

/**
 * Obciążenie wejściowe jest łączną mocą użytkownika.
 * Wymagana moc czynna: P_req = P × (1 + reserve).
 */
export function calculateUpsRequirements(loadPowerW, assumptions = CALCULATION_ASSUMPTIONS) {
  const powerW = positiveNumber(loadPowerW, "Moc obciążenia");
  return {
    loadPowerW: powerW,
    requiredActivePowerW: powerW * (1 + assumptions.upsPowerReserve),
  };
}

/**
 * Każdy UPS ma własny PF wyliczony bezpośrednio z parametrów bazy:
 * PF_UPS = P_nominalna [W] / S_nominalna [VA].
 * Dla danego kandydata kontrola VA używa: S_req = P_req / PF_UPS.
 */
export function calculateUpsApparentRequirement(requirements, ups) {
  const upsPowerFactor = ups.activePower / ups.apparentPower;
  return {
    upsPowerFactor,
    requiredApparentPowerVa: requirements.requiredActivePowerW / upsPowerFactor,
  };
}

function powerRequirementRatio(requirements, ups) {
  const apparentRequirement = calculateUpsApparentRequirement(requirements, ups);
  const overloadFactor = ups.continuousOverloadFactor ?? 1;
  return Math.max(
    requirements.requiredActivePowerW / calculateMaximumContinuousOutputPower(ups),
    apparentRequirement.requiredApparentPowerVa / (ups.apparentPower * overloadFactor),
  );
}

function findNearestPowerUps(upsDatabase, applicationId, requirements) {
  return upsDatabase
    .filter((ups) => ups.applicationId === applicationId)
    // Nie pokazujemy modelu zastępczego, jeśli rzeczywiste obciążenie przekroczyłoby
    // 100% jego znamionowej mocy czynnej. Rezerwa wpływa na zalecenie, ale nie może
    // usprawiedliwiać proponowania przeciążonego urządzenia.
    .filter((ups) => requirements.loadPowerW <= ups.activePower)
    .sort((a, b) =>
      powerRequirementRatio(requirements, a) - powerRequirementRatio(requirements, b) ||
      b.activePower - a.activePower ||
      a.sku.localeCompare(b.sku)
    )[0] ?? null;
}

/**
 * Wbudowany układ akumulatorów jest liczony tym samym silnikiem rozładowania co układ zewnętrzny.
 * Moduły 12 V w UPS-ie tworzą jeden string szeregowy: U_układu = U_modułu × liczba,
 * pojemność Ah stringu pozostaje bez zmian, a E_nom = U_układu × Ah.
 */
function calculateInternalBatteryInfo(ups, batteries, loadPowerW, assumptions) {
  const configuration = ups.internalBattery;
  if (!configuration?.quantity || !configuration.voltageV || !configuration.capacityAh) return null;

  const battery = batteries.find((candidate) =>
    candidate.voltage === configuration.voltageV &&
    Math.abs(candidate.capacityAh - configuration.capacityAh) < 1e-9
  ) ?? null;
  if (!battery) return null;

  const count = configuration.quantity;
  const series = count;
  const parallel = 1;
  const bankVoltageV = configuration.voltageV * series;
  const bankCapacityAh = configuration.capacityAh;
  const efficiency = ups.efficiency?.batteryMinimum ?? 0.8;
  const dcPowerW = calculateDcPower(loadPowerW, efficiency);
  const cutoffVoltagePerBatteryV = battery.finalDischargeVoltageV ?? 10.5;
  const currentPerStringA = calculateBatteryCurrentAtCutoff({
    dcPowerW,
    cutoffBankVoltageV: cutoffVoltagePerBatteryV * series,
    parallel,
  });
  const runtime = estimateBatteryRuntime({
    battery,
    count,
    parallel,
    currentPerStringA,
    dcPowerW,
    cutoffVoltagePerBatteryV,
    assumptions,
  });
  const maximumContinuousOutputPowerW = calculateMaximumContinuousOutputPower(ups);
  const maximumLoadDcPowerW = calculateDcPower(maximumContinuousOutputPowerW, efficiency);
  const maximumLoadCurrentPerStringA = calculateBatteryCurrentAtCutoff({
    dcPowerW: maximumLoadDcPowerW,
    cutoffBankVoltageV: cutoffVoltagePerBatteryV * series,
    parallel,
  });
  const maximumLoadRuntime = estimateBatteryRuntime({
    battery,
    count,
    parallel,
    currentPerStringA: maximumLoadCurrentPerStringA,
    dcPowerW: maximumLoadDcPowerW,
    cutoffVoltagePerBatteryV,
    assumptions,
  });
  const nominalEnergyWh = bankVoltageV * bankCapacityAh;

  return {
    configuration,
    battery,
    count,
    series,
    parallel,
    configurationDescription: `${series}S${parallel}P — ${count} × ${configuration.voltageV} V / ${configuration.capacityAh} Ah`,
    bankVoltageV,
    bankCapacityAh,
    nominalEnergyWh,
    // Energia użyteczna uwzględnia DoD i starzenie, identycznie jak dla układu LPPC.
    usableEnergyWh: nominalEnergyWh * assumptions.depthOfDischarge / assumptions.agingFactor,
    estimatedRuntimeMinutes: runtime.minutes,
    estimatedRuntimeAtMaximumLoadMinutes: maximumLoadRuntime.minutes,
    runtimeMethod: runtime.method,
    maximumChargeTimeMinutes: configuration.maximumChargeTimeMinutes,
  };
}

function recommendPowerCore(input, reason) {
  const fallback = calculateSelection({
    ...input,
    applicationId: "powercore-pure-sine",
  });
  return {
    ...fallback,
    applicationFallback: true,
    originalApplicationId: input.applicationId,
    recommendationText: fallback.noSolution
      ? `Uwaga: ${reason} Pokazujemy najbliższe możliwe rozwiązanie z serii PowerCore.`
      : `Uwaga: ${reason} Proponujemy rozwiązanie z serii PowerCore.`,
  };
}

/**
 * Użytkownik wybiera generalUse, które wskazuje applicationId. UPS-y są filtrowane
 * wyłącznie w tej kategorii, następnie według W i VA. Czas może podnieść wybór do
 * większego modelu, jeśli mniejszy nie zapewni wymaganej autonomii.
 */
export function calculateSelection({
  loadPowerW,
  powerW,
  runtimeMinutes,
  applicationId,
  upsDatabase,
  batteryDatabase,
  assumptions = CALCULATION_ASSUMPTIONS,
  manufacturerConstraints = UPS_MANUFACTURER_CONSTRAINTS,
}) {
  const runtime = positiveNumber(runtimeMinutes, "Czas podtrzymania");
  if (!applicationId) throw new RangeError("Wybierz zastosowanie UPS.");
  const requirements = calculateUpsRequirements(loadPowerW ?? powerW, assumptions);

  const powerCandidates = upsDatabase
    .filter((ups) => ups.applicationId === applicationId)
    .filter((ups) => requirements.loadPowerW <= ups.activePower)
    .filter((ups) => calculateMaximumContinuousOutputPower(ups) >= requirements.requiredActivePowerW)
    .filter((ups) => {
      const apparentRequirement = calculateUpsApparentRequirement(requirements, ups);
      const continuousOverloadFactor = ups.continuousOverloadFactor ?? 1;
      return ups.apparentPower * continuousOverloadFactor >= apparentRequirement.requiredApparentPowerVa;
    })
    .sort((a, b) =>
      a.activePower - b.activePower ||
      a.apparentPower - b.apparentPower ||
      a.sku.localeCompare(b.sku)
    );

  if (!powerCandidates.length) {
    if (POWERPROOF_APPLICATIONS.has(applicationId)) {
      return recommendPowerCore({
        loadPowerW: requirements.loadPowerW,
        runtimeMinutes: runtime,
        applicationId,
        upsDatabase,
        batteryDatabase,
        assumptions,
        manufacturerConstraints,
      }, "W wybranej kategorii PowerProof / AiO nie ma UPS-a odpowiedniego dla podanej mocy i czasu.");
    }

    const nearestUps = findNearestPowerUps(upsDatabase, applicationId, requirements);
    const nearestBatterySizing = supportsExternalBattery(nearestUps)
      ? selectBatteryConfiguration({
          ups: nearestUps,
          batteries: batteryDatabase,
          constraint: manufacturerConstraints[nearestUps.sku],
          loadPowerW: requirements.loadPowerW,
          requiredRuntimeMinutes: runtime,
          assumptions,
        })
      : null;
    const nearestBattery = nearestBatterySizing?.recommended ?? nearestBatterySizing?.nearest ?? null;
    const nearestInternalBatteryInfo = nearestUps?.internalBattery
      ? calculateInternalBatteryInfo(
          nearestUps,
          batteryDatabase,
          requirements.loadPowerW,
          assumptions,
        )
      : null;
    return {
      configurationStatus: "NOT COMPLIANT",
      noSolution: true,
      nearestAlternative: Boolean(nearestUps),
      failureReason: "power",
      noSolutionMessage: nearestUps
        ? "Brak wymaganego rozwiązania: żaden UPS w wybranej kategorii nie spełnia wymaganej mocy czynnej i pozornej. Poniżej dobrano model UPS o parametrach najbliższych wymaganym. Praca przy maksymalnym ciągłym obciążeniu nie gwarantuje ciągłości podtrzymania i może przyspieszyć zużycie akumulatora."
        : "Brak rozwiązania: podane obciążenie przekracza 100% mocy każdego UPS-a dostępnego w wybranej kategorii. Ze względów bezpieczeństwa kalkulator nie proponuje urządzenia ani układu akumulatorów.",
      recommendationText: nearestUps
        ? "Najbliższe możliwe rozwiązanie — przed zastosowaniem sprawdź wymagany zapas mocy."
        : null,
      requirements,
      ups: nearestUps,
      // Wynik zastępczy korzysta z tego samego silnika akumulatorów i czasu pracy
      // co wynik zalecany. Status pozostaje niezgodny, bo sam UPS ma za małą moc.
      battery: nearestBattery,
      internalBatteryInfo: nearestInternalBatteryInfo,
    };
  }

  if (applicationId === "powercore-pure-sine") {
    const evaluated = powerCandidates.map((ups) => ({
      ups,
      batterySizing: selectBatteryConfiguration({
        ups,
        batteries: batteryDatabase,
        constraint: manufacturerConstraints[ups.sku],
        loadPowerW: requirements.loadPowerW,
        requiredRuntimeMinutes: runtime,
        assumptions,
      }),
    }));
    const selected = evaluated.find((item) => item.batterySizing?.recommended) ?? null;

    if (!selected) {
      const nearest = evaluated
        .filter((item) => item.batterySizing?.nearest)
        .sort((a, b) =>
          b.batterySizing.nearest.designRuntimeMinutes - a.batterySizing.nearest.designRuntimeMinutes ||
          a.ups.activePower - b.ups.activePower
        )[0] ?? null;
      return {
        configurationStatus: "NOT COMPLIANT",
        noSolution: true,
        nearestAlternative: Boolean(nearest),
        failureReason: "runtime",
        noSolutionMessage: "Brak pełnego rozwiązania: żaden zgodny układ akumulatorów AGM nie zapewnia wymaganego czasu podtrzymania. Poniżej pokazano zgodny elektrycznie układ o najdłuższym osiągalnym czasie.",
        recommendationText: "Najbliższe możliwe rozwiązanie — zapewnia najdłuższy dostępny czas podtrzymania.",
        requirements,
        ups: nearest?.ups ?? powerCandidates[0],
        battery: nearest?.batterySizing.nearest ?? null,
      };
    }

    const battery = selected.batterySizing.recommended;
    return {
      configurationStatus: battery.overallStatus,
      requirements,
      ups: selected.ups,
      battery,
    };
  }

  // Dla pozostałych rodzin nie dobieramy zewnętrznych akumulatorów AGM. Czas służy
  // wyłącznie do sprawdzenia fabrycznego układu i ewentualnego wyboru większego UPS-a.
  const evaluated = powerCandidates.map((ups) => {
    const internalBatteryInfo = calculateInternalBatteryInfo(
      ups,
      batteryDatabase,
      requirements.loadPowerW,
      assumptions,
    );
    return {
      ups,
      internalBatteryInfo,
      estimatedInternalRuntimeMinutes: internalBatteryInfo?.estimatedRuntimeMinutes ?? null,
    };
  });
  const selected = evaluated.find((item) =>
    item.estimatedInternalRuntimeMinutes != null && item.estimatedInternalRuntimeMinutes >= runtime
  ) ?? null;

  if (!selected) {
    if (POWERPROOF_APPLICATIONS.has(applicationId)) {
      return recommendPowerCore({
        loadPowerW: requirements.loadPowerW,
        runtimeMinutes: runtime,
        applicationId,
        upsDatabase,
        batteryDatabase,
        assumptions,
        manufacturerConstraints,
      }, "W wybranej kategorii PowerProof / AiO wbudowany układ akumulatorów nie zapewnia wymaganego czasu podtrzymania.");
    }
    const fallback = evaluated
      .filter((item) => Number.isFinite(item.estimatedInternalRuntimeMinutes))
      .sort((a, b) => b.estimatedInternalRuntimeMinutes - a.estimatedInternalRuntimeMinutes)[0]
      ?? evaluated[0];
    return {
      configurationStatus: "NOT COMPLIANT",
      noSolution: true,
      nearestAlternative: Boolean(fallback),
      failureReason: "runtime",
      noSolutionMessage: "Brak pełnego rozwiązania: wbudowane układy akumulatorów nie zapewniają wymaganego czasu podtrzymania. Poniżej pokazano model o najdłuższym osiągalnym czasie.",
      recommendationText: "Najbliższe możliwe rozwiązanie — zapewnia najdłuższy dostępny czas podtrzymania.",
      requirements,
      ups: fallback.ups,
      battery: null,
      internalBatteryInfo: fallback.internalBatteryInfo,
    };
  }

  return {
    configurationStatus: "WARNING",
    requirements,
    ups: selected.ups,
    battery: null,
    internalBatteryInfo: selected.internalBatteryInfo,
  };
}
