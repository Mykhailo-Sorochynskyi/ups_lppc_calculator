// Wspólne założenia obliczeniowe. Wartości domyślne Peukerta są używane tylko
// wtedy, gdy baza AGM nie zawiera odpowiednich danych producenta.
export const CALCULATION_ASSUMPTIONS = {
  upsPowerReserve: 0.2,
  depthOfDischarge: 0.8,
  agingFactor: 1.2,
  safetyMargin: 1.15,
  defaultPeukertExponent: 1.2,
  defaultCapacityRatingHours: 20,
  lowRuntimeMarginWarning: 0.1,
};
