/** Moc pobierana z baterii: P_DC = P_AC / sprawność UPS. */
export function calculateDcPower(loadPowerW, efficiency) {
  return loadPowerW / efficiency;
}

/**
 * Maksymalna ciągła moc wyjściowa uwzględnia dopuszczalne przeciążenie UPS.
 * Dla modeli bez jawnie podanego parametru przyjmujemy 100% mocy znamionowej.
 */
export function calculateMaximumContinuousOutputPower(ups) {
  return ups.activePower * (ups.continuousOverloadFactor ?? 1);
}

/**
 * Konserwatywny prąd jednego stringu przy napięciu odcięcia:
 * I_string = P_DC / (U_cutoff × liczba_stringów_równoległych).
 */
export function calculateBatteryCurrentAtCutoff({ dcPowerW, cutoffBankVoltageV, parallel }) {
  return dcPowerW / cutoffBankVoltageV / parallel;
}

/**
 * Ciągły limit rozładowania jest najniższym z limitów: baterii, elektroniki UPS
 * i przewodu. Moc podajemy po stronie wyjścia AC, dlatego uwzględniamy sprawność.
 */
export function calculateContinuousDischargeLimit({
  ups,
  batteryMaximumCurrentA,
  cutoffBankVoltageV,
  cableCurrentLimitA,
}) {
  const efficiency = ups.efficiency?.batteryMinimum ?? 0.8;
  const maximumContinuousOutputPowerW = calculateMaximumContinuousOutputPower(ups);
  const upsCurrentLimitA = maximumContinuousOutputPowerW / (cutoffBankVoltageV * efficiency);
  const limits = [batteryMaximumCurrentA, upsCurrentLimitA, cableCurrentLimitA]
    .filter((value) => Number.isFinite(value) && value > 0);
  const maximumCurrentA = Math.min(...limits);
  const maximumPowerW = Math.min(
    maximumContinuousOutputPowerW,
    maximumCurrentA * cutoffBankVoltageV * efficiency,
  );

  return { maximumCurrentA, maximumPowerW };
}

function interpolateConstantPowerRuntime(table, requiredPowerPerBatteryW, cutoffVoltagePerBatteryV) {
  const points = table
    .filter((point) => Math.abs(point.cutoffVoltagePerBatteryV - cutoffVoltagePerBatteryV) < 0.01)
    .sort((a, b) => a.wattsPerBattery - b.wattsPerBattery);
  if (!points.length) return null;
  if (requiredPowerPerBatteryW <= points[0].wattsPerBattery) return points[0].minutes;
  if (requiredPowerPerBatteryW > points.at(-1).wattsPerBattery) return 0;

  for (let index = 1; index < points.length; index += 1) {
    const low = points[index - 1];
    const high = points[index];
    if (requiredPowerPerBatteryW <= high.wattsPerBattery) {
      const share = (requiredPowerPerBatteryW - low.wattsPerBattery) /
        (high.wattsPerBattery - low.wattsPerBattery);
      return low.minutes + share * (high.minutes - low.minutes);
    }
  }
  return 0;
}

/**
 * Preferuje tabelę stałej mocy producenta. Gdy jej brak, stosuje model Peukerta:
 * t = H × (C_skorygowana / (I × H))^k / margines_bezpieczeństwa
 * C_skorygowana = C × DoD / współczynnik_starzenia.
 */
export function estimateBatteryRuntime({
  battery,
  count,
  parallel,
  currentPerStringA,
  dcPowerW,
  cutoffVoltagePerBatteryV,
  assumptions,
  designDerating = false,
}) {
  if (Array.isArray(battery.constantPowerDischargeTable) && battery.constantPowerDischargeTable.length) {
    // Tabela producenta opisuje świeży akumulator w temperaturze odniesienia.
    // Współczynniki starzenia i zapasu stosujemy tylko przy weryfikacji doboru,
    // a nie przy prezentowaniu czasu szacowanego dla 25°C.
    const designPowerMultiplier = designDerating
      ? assumptions.agingFactor * assumptions.safetyMargin
      : 1;
    const requiredPowerPerBatteryW = dcPowerW * designPowerMultiplier / count;
    const tableMinutes = interpolateConstantPowerRuntime(
      battery.constantPowerDischargeTable,
      requiredPowerPerBatteryW,
      cutoffVoltagePerBatteryV,
    );
    return {
      // Tabela do napięcia odcięcia już uwzględnia dostępny zakres rozładowania;
      // ponowne mnożenie przez DoD skracałoby wynik drugi raz.
      minutes: tableMinutes,
      method: "constant-power-table",
      peukertExponentUsed: null,
      warnings: [],
    };
  }

  const exponent = battery.peukertExponent ?? assumptions.defaultPeukertExponent;
  const ratingHours = battery.capacityRatingHours ?? assumptions.defaultCapacityRatingHours;
  const adjustedCapacityAh = battery.capacityAh * assumptions.depthOfDischarge /
    (designDerating ? assumptions.agingFactor : 1);
  const hours = ratingHours * (
    adjustedCapacityAh / (currentPerStringA * ratingHours)
  ) ** exponent / (designDerating ? assumptions.safetyMargin : 1);

  return {
    minutes: hours * 60,
    method: "peukert-fallback",
    peukertExponentUsed: exponent,
    warnings: [
      "Brak tabeli Constant Power producenta AGM — użyto konfigurowalnego modelu Peukerta.",
      ...(battery.peukertExponent == null
        ? [`Brak wykładnika Peukerta w bazie AGM — użyto wartości zastępczej ${exponent}.`]
        : []),
    ],
  };
}
