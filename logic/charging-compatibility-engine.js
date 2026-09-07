/** Wybór L/M/H według pojemności Ah całego układu przy jego napięciu systemowym. */
export function selectChargingProfile(bankCapacityAh, chargingSelectors) {
  const matches = chargingSelectors
    .filter((profile) => bankCapacityAh >= profile.minCapacityAh && bankCapacityAh <= profile.maxCapacityAh)
    .sort((a, b) => b.minCapacityAh - a.minCapacityAh);
  return matches[0] ?? null;
}

/**
 * Maksymalny prąd ładowania układu rośnie tylko z liczbą stringów równoległych.
 * Połączenie szeregowe nie zwiększa dopuszczalnego prądu ładowania.
 */
export function validateChargingCompatibility({ battery, parallel, chargingProfile }) {
  if (!chargingProfile) {
    const batteryMaxChargeCurrentA = battery.maxChargeCurrentA * parallel;
    return {
      status: "ERROR",
      batteryMaxChargeCurrentA,
      maximumUsableChargeCurrentA: batteryMaxChargeCurrentA,
    };
  }

  const batteryMaxChargeCurrentA = battery.maxChargeCurrentA * parallel;
  const [upsMinimumA, upsMaximumA] = chargingProfile.currentRangeA;
  // Prąd użyty do obliczeń nie może przekroczyć ani górnej wartości selektora
  // UPS L/M/H ani maksymalnego prądu dopuszczalnego przez układ akumulatorów.
  const maximumUsableChargeCurrentA = Math.min(upsMaximumA, batteryMaxChargeCurrentA);
  if (upsMinimumA > batteryMaxChargeCurrentA) {
    return {
      status: "ERROR",
      batteryMaxChargeCurrentA,
      maximumUsableChargeCurrentA,
    };
  }
  if (upsMaximumA > batteryMaxChargeCurrentA) {
    return {
      status: "WARNING",
      batteryMaxChargeCurrentA,
      maximumUsableChargeCurrentA,
    };
  }
  return {
    status: "OK",
    batteryMaxChargeCurrentA,
    maximumUsableChargeCurrentA,
  };
}
