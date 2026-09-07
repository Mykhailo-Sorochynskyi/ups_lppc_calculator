// Ograniczenia producenta dotyczą tylko serii PowerCore z akumulatorami zewnętrznymi.
// Surowe oznaczenie przewodu zachowujemy bez interpretacyjnego poprawiania zapisu instrukcji.
const selector500And1200 = [
  { level: "L", minCapacityAh: 20, maxCapacityAh: 45, currentRangeA: [3, 6] },
  { level: "M", minCapacityAh: 50, maxCapacityAh: 100, currentRangeA: [7, 9] },
  { level: "H", minCapacityAh: 100, maxCapacityAh: 200, currentRangeA: [11, 14] },
];

const selector800And1000 = [
  { level: "L", minCapacityAh: 20, maxCapacityAh: 45, currentRangeA: [4, 7] },
  { level: "M", minCapacityAh: 50, maxCapacityAh: 100, currentRangeA: [8, 12] },
  { level: "H", minCapacityAh: 100, maxCapacityAh: 200, currentRangeA: [15, 19] },
];

export const UPS_MANUFACTURER_CONSTRAINTS = {
  UPSLPPC500: {
    requiredBankVoltageV: 12,
    cutoffVoltageV: 10.5,
    chargingSelectors: selector500And1200,
    manufacturerCableSpecRaw: "6 AWG / 2 × 13.3 mm²",
  },
  UPSLPPC800: {
    requiredBankVoltageV: 12,
    cutoffVoltageV: 10.5,
    chargingSelectors: selector800And1000,
    manufacturerCableSpecRaw: "2 × 6 AWG / 2 × 13.3 mm²",
  },
  UPSLPPC1000: {
    requiredBankVoltageV: 12,
    cutoffVoltageV: 10.5,
    chargingSelectors: selector800And1000,
    manufacturerCableSpecRaw: "2 × 6 AWG / 2 × 13.3 mm²",
  },
  UPSLPPC1200: {
    requiredBankVoltageV: 24,
    cutoffVoltageV: 21,
    chargingSelectors: selector500And1200,
    manufacturerCableSpecRaw: "2 × 8 AWG / 2 × 13.3 mm²",
  },
};
