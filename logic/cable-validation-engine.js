import { calculateMaximumContinuousOutputPower } from "./runtime-engine.js";

/**
 * Konserwatywny prąd projektowy przewodu:
 * I_DC_max = P_ciągła_max_UPS / (U_cutoff × sprawność_DC).
 */
export function validateCable({ ups, constraint }) {
  const efficiency = ups.efficiency?.batteryMinimum ?? 0.8;
  const maximumCurrentA = calculateMaximumContinuousOutputPower(ups) /
    (constraint.cutoffVoltageV * efficiency);
  return {
    // Jedno pole jest jednocześnie limitem używanym w obliczeniach i minimalną
    // wymaganą obciążalnością prądową przewodu prezentowaną użytkownikowi.
    maximumCurrentA,
    type: "Przewód akumulatorowy miedziany",
    specification: constraint.manufacturerCableSpecRaw,
  };
}
