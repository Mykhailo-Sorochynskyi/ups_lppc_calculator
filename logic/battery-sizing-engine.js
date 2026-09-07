import {
  calculateBatteryCurrentAtCutoff,
  calculateContinuousDischargeLimit,
  calculateDcPower,
  calculateMaximumContinuousOutputPower,
  estimateBatteryRuntime,
} from "./runtime-engine.js";
import { selectChargingProfile, validateChargingCompatibility } from "./charging-compatibility-engine.js";
import { validateCable } from "./cable-validation-engine.js";
import { overallConfigurationStatus } from "./configuration-validator.js";

/**
 * Dobiera identyczne akumulatory w układzie nS × nP. Najpierw minimalizuje liczbę
 * fizycznych sztuk, następnie pojemność układu i nadmiar czasu podtrzymania.
 */
export function selectBatteryConfiguration({
  ups,
  batteries,
  constraint,
  loadPowerW,
  requiredRuntimeMinutes,
  assumptions,
}) {
  if (!constraint || !ups.externalBattery || ups.category !== "PowerCore") return null;

  const efficiency = ups.efficiency?.batteryMinimum ?? 0.8;
  const dcPowerW = calculateDcPower(loadPowerW, efficiency);
  const minimumCapacityAh = ups.externalBattery.minCapacityAh;
  const maximumCapacityAh = ups.externalBattery.maxCapacityAh;

  const candidates = [];
  for (const battery of batteries) {
    const exactSeries = constraint.requiredBankVoltageV / battery.voltage;
    const series = Math.round(exactSeries);
    if (series < 1 || Math.abs(exactSeries - series) > 1e-9) continue;

    const minimumParallel = Math.max(1, Math.ceil(minimumCapacityAh / battery.capacityAh));
    const maximumParallel = Math.floor(maximumCapacityAh / battery.capacityAh);
    for (let parallel = minimumParallel; parallel <= maximumParallel; parallel += 1) {
      const count = series * parallel;
      const bankVoltageV = battery.voltage * series;
      const bankCapacityAh = battery.capacityAh * parallel;
      const cutoffVoltagePerBatteryV = constraint.cutoffVoltageV / series;
      const currentPerStringA = calculateBatteryCurrentAtCutoff({
        dcPowerW,
        cutoffBankVoltageV: constraint.cutoffVoltageV,
        parallel,
      });
      const dischargeStatus = currentPerStringA <= battery.maxDischargeCurrentA
        ? "OK"
        : "ERROR";

      const runtime = estimateBatteryRuntime({
        battery,
        count,
        parallel,
        currentPerStringA,
        dcPowerW,
        cutoffVoltagePerBatteryV,
        assumptions,
      });
      // Dobór sprawdzamy konserwatywnie po starzeniu i zapasie, ale użytkownikowi
      // pokazujemy szacunek dla świeżej baterii w 25°C.
      const designRuntime = estimateBatteryRuntime({
        battery,
        count,
        parallel,
        currentPerStringA,
        dcPowerW,
        cutoffVoltagePerBatteryV,
        assumptions,
        designDerating: true,
      });
      const runtimeMarginPercent = (designRuntime.minutes / requiredRuntimeMinutes - 1) * 100;
      const runtimeStatus = designRuntime.minutes >= requiredRuntimeMinutes
        ? (runtimeMarginPercent < assumptions.lowRuntimeMarginWarning * 100 ? "WARNING" : "OK")
        : "ERROR";
      const chargingProfile = selectChargingProfile(bankCapacityAh, constraint.chargingSelectors);
      const charging = validateChargingCompatibility({ battery, parallel, chargingProfile });
      // Limity całego układu rosną wyłącznie z liczbą stringów równoległych.
      // Maksymalny prąd ładowania wynika z aktywnego poziomu selektora L/M/H,
      // ale jest ograniczony parametrem maksymalnym dobranego układu AGM.
      const maximumChargeCurrentA = charging.maximumUsableChargeCurrentA;
      const batteryMaximumDischargeCurrentA = battery.maxDischargeCurrentA * parallel;
      const maximumChargePowerW = bankVoltageV * maximumChargeCurrentA;
      // Teoretyczny czas ładowania przy maksymalnym dopuszczalnym prądzie: t = C / I.
      const maximumChargeTimeMinutes = bankCapacityAh / maximumChargeCurrentA * 60;
      const cable = validateCable({ ups, constraint });
      const dischargeLimit = calculateContinuousDischargeLimit({
        ups,
        batteryMaximumCurrentA: batteryMaximumDischargeCurrentA,
        cutoffBankVoltageV: constraint.cutoffVoltageV,
        cableCurrentLimitA: cable.maximumCurrentA,
      });
      const maximumDischargeCurrentA = dischargeLimit.maximumCurrentA;
      const maximumDischargePowerW = dischargeLimit.maximumPowerW;
      const maximumLoadDcPowerW = calculateDcPower(
        calculateMaximumContinuousOutputPower(ups),
        efficiency,
      );
      const maximumLoadCurrentPerStringA = calculateBatteryCurrentAtCutoff({
        dcPowerW: maximumLoadDcPowerW,
        cutoffBankVoltageV: constraint.cutoffVoltageV,
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
      const voltageStatus = bankVoltageV === constraint.requiredBankVoltageV ? "OK" : "ERROR";
      const dataStatus = runtime.warnings.length ? "WARNING" : "OK";
      const overallStatus = overallConfigurationStatus([
        voltageStatus,
        dischargeStatus,
        runtimeStatus,
        charging.status,
        dataStatus,
      ]);

      candidates.push({
        battery,
        series,
        parallel,
        count,
        configuration: `${series}S${parallel}P`,
        bankVoltageV,
        bankCapacityAh,
        nominalEnergyWh: bankVoltageV * bankCapacityAh,
        usableEnergyWh: bankVoltageV * bankCapacityAh * assumptions.depthOfDischarge / assumptions.agingFactor,
        estimatedRuntimeMinutes: runtime.minutes,
        estimatedRuntimeAtMaximumLoadMinutes: maximumLoadRuntime.minutes,
        designRuntimeMinutes: designRuntime.minutes,
        runtimeMarginPercent,
        runtimeMethod: runtime.method,
        peukertExponentUsed: runtime.peukertExponentUsed,
        chargingProfile,
        maximumChargeCurrentA,
        maximumDischargeCurrentA,
        maximumChargePowerW,
        maximumDischargePowerW,
        maximumChargeTimeMinutes,
        cable,
        overallStatus,
        isElectricallyCompatible:
          voltageStatus !== "ERROR" && dischargeStatus !== "ERROR" && charging.status !== "ERROR",
      });
    }
  }

  const compliant = candidates
    .filter((candidate) => candidate.overallStatus !== "NOT COMPLIANT")
    .sort((a, b) =>
      a.count - b.count ||
      a.bankCapacityAh - b.bankCapacityAh ||
      a.runtimeMarginPercent - b.runtimeMarginPercent ||
      a.battery.sku.localeCompare(b.battery.sku)
    );

  const nearest = candidates
    .filter((candidate) => candidate.isElectricallyCompatible)
    .sort((a, b) =>
      b.designRuntimeMinutes - a.designRuntimeMinutes ||
      a.count - b.count ||
      a.battery.sku.localeCompare(b.battery.sku)
    )[0] ?? null;

  return {
    candidates,
    recommended: compliant[0] ?? null,
    nearest,
  };
}
