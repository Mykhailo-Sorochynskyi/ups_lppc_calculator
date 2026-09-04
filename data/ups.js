// Dane techniczne UPS używane przez kalkulator.
// Aby dodać model, skopiuj jeden obiekt i uzupełnij jego parametry.
export const UPS_DATABASE = [
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
