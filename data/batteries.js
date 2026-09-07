// Parametry przeniesione z zakładki „Baza AGM” skoroszytu źródłowego.
const SOURCE_BATTERY_MODELS = [
  {
    "sku": "AGM04",
    "name": "Akumulator VRLA AGM Cube Green Cell 7 Ah 12 V",
    "voltage": 12,
    "capacityAh": 7,
    "maxDischargeCurrentA": 21,
    "maxChargeCurrentA": 2.1
  },
  {
    "sku": "AGM05",
    "name": "Akumulator VRLA AGM Cube Green Cell 7.2 Ah 12 V",
    "voltage": 12,
    "capacityAh": 7.2,
    "maxDischargeCurrentA": 21.6,
    "maxChargeCurrentA": 2.1
  },
  {
    "sku": "AGM06",
    "name": "Akumulator VRLA AGM Cube Green Cell 9 Ah 12 V",
    "voltage": 12,
    "capacityAh": 9,
    "maxDischargeCurrentA": 27,
    "maxChargeCurrentA": 2.7
  },
  {
    "sku": "AGM07",
    "name": "Akumulator VRLA AGM Cube Green Cell 12 Ah 12 V",
    "voltage": 12,
    "capacityAh": 12,
    "maxDischargeCurrentA": 36,
    "maxChargeCurrentA": 3.6
  },
  {
    "sku": "AGM08",
    "name": "Akumulator VRLA AGM Cube Green Cell 14 Ah 12 V",
    "voltage": 12,
    "capacityAh": 14,
    "maxDischargeCurrentA": 42,
    "maxChargeCurrentA": 4.7
  },
  {
    "sku": "AGM09",
    "name": "Akumulator VRLA AGM Cube Green Cell 18 Ah 12 V",
    "voltage": 12,
    "capacityAh": 18,
    "maxDischargeCurrentA": 54,
    "maxChargeCurrentA": 5.4
  },
  {
    "sku": "AGM10",
    "name": "Akumulator VRLA AGM Cube Green Cell 20 Ah 12 V",
    "voltage": 12,
    "capacityAh": 20,
    "maxDischargeCurrentA": 60,
    "maxChargeCurrentA": 6
  },
  {
    "sku": "AGM17",
    "name": "Akumulator VRLA AGM Cube Green Cell 1.2 Ah 12 V",
    "voltage": 12,
    "capacityAh": 1.2,
    "maxDischargeCurrentA": 3.6,
    "maxChargeCurrentA": 0.36
  },
  {
    "sku": "AGM18",
    "name": "Akumulator VRLA AGM Cube Green Cell 2.3 Ah 12 V",
    "voltage": 12,
    "capacityAh": 2.3,
    "maxDischargeCurrentA": 6.9,
    "maxChargeCurrentA": 0.69
  },
  {
    "sku": "AGM19",
    "name": "Akumulator VRLA AGM Cube Green Cell 3.3 Ah 12 V",
    "voltage": 12,
    "capacityAh": 3.3,
    "maxDischargeCurrentA": 9.9,
    "maxChargeCurrentA": 0.96
  },
  {
    "sku": "AGM21",
    "name": "Akumulator VRLA AGM Cube Green Cell 33 Ah 12 V",
    "voltage": 12,
    "capacityAh": 33,
    "maxDischargeCurrentA": 99,
    "maxChargeCurrentA": 9.9
  },
  {
    "sku": "AGM22",
    "name": "Akumulator VRLA AGM Cube Green Cell 40 Ah 12 V",
    "voltage": 12,
    "capacityAh": 40,
    "maxDischargeCurrentA": 120,
    "maxChargeCurrentA": 12
  },
  {
    "sku": "AGM23",
    "name": "Akumulator VRLA AGM Cube Green Cell 44 Ah 12 V",
    "voltage": 12,
    "capacityAh": 44,
    "maxDischargeCurrentA": 132,
    "maxChargeCurrentA": 11
  },
  {
    "sku": "AGM25",
    "name": "Akumulator VRLA AGM Cube Green Cell 75 Ah 12 V",
    "voltage": 12,
    "capacityAh": 75,
    "maxDischargeCurrentA": 225,
    "maxChargeCurrentA": 22.5
  },
  {
    "sku": "AGM27",
    "name": "Akumulator VRLA AGM Cube Green Cell 5 Ah 12 V",
    "voltage": 12,
    "capacityAh": 5,
    "maxDischargeCurrentA": 15,
    "maxChargeCurrentA": 1.5
  },
  {
    "sku": "AGM28",
    "name": "Akumulator VRLA AGM Cube Green Cell 65 Ah 12 V",
    "voltage": 12,
    "capacityAh": 65,
    "maxDischargeCurrentA": 195,
    "maxChargeCurrentA": 19.5
  },
  {
    "sku": "AGM29",
    "name": "Akumulator VRLA AGM Cube Green Cell 90 Ah 12 V",
    "voltage": 12,
    "capacityAh": 90,
    "maxDischargeCurrentA": 270,
    "maxChargeCurrentA": 27
  },
  {
    "sku": "AGM30",
    "name": "Akumulator VRLA AGM Cube Green Cell 100 Ah 12 V",
    "voltage": 12,
    "capacityAh": 100,
    "maxDischargeCurrentA": 300,
    "maxChargeCurrentA": 27
  },
  {
    "sku": "AGM31",
    "name": "Akumulator VRLA AGM Cube Green Cell 120 Ah 12 V",
    "voltage": 12,
    "capacityAh": 120,
    "maxDischargeCurrentA": 360,
    "maxChargeCurrentA": 36
  },
  {
    "sku": "AGM32",
    "name": "Akumulator VRLA AGM Cube Green Cell 150 Ah 12 V",
    "voltage": 12,
    "capacityAh": 150,
    "maxDischargeCurrentA": 450,
    "maxChargeCurrentA": 45
  },
  {
    "sku": "AGM33",
    "name": "Akumulator VRLA AGM Cube Green Cell 200 Ah 12 V",
    "voltage": 12,
    "capacityAh": 200,
    "maxDischargeCurrentA": 600,
    "maxChargeCurrentA": 60
  },
  {
    "sku": "AGM35",
    "name": "Akumulator VRLA AGM Cube Green Cell 28 Ah 12 V",
    "voltage": 12,
    "capacityAh": 28,
    "maxDischargeCurrentA": 84,
    "maxChargeCurrentA": 7.8
  },
  {
    "sku": "AGM41",
    "name": "Akumulator VRLA AGM Cube Green Cell 1.3 Ah 12 V",
    "voltage": 12,
    "capacityAh": 1.3,
    "maxDischargeCurrentA": 3.9,
    "maxChargeCurrentA": 0.38
  },
  {
    "sku": "AGM42",
    "name": "Akumulator VRLA AGM Cube Green Cell 2.8 Ah 12 V",
    "voltage": 12,
    "capacityAh": 2.8,
    "maxDischargeCurrentA": 8.4,
    "maxChargeCurrentA": 0.84
  },
  {
    "sku": "AGM43",
    "name": "Akumulator VRLA AGM Cube Green Cell 3.4 Ah 12 V",
    "voltage": 12,
    "capacityAh": 3.4,
    "maxDischargeCurrentA": 10.2,
    "maxChargeCurrentA": 1.02
  },
  {
    "sku": "AGM44",
    "name": "Akumulator VRLA AGM Cube Green Cell 4.5 Ah 12 V",
    "voltage": 12,
    "capacityAh": 4.5,
    "maxDischargeCurrentA": 13.5,
    "maxChargeCurrentA": 1.35
  },
  {
    "sku": "AGM45",
    "name": "Akumulator VRLA AGM Cube Green Cell 5.3 Ah 12 V",
    "voltage": 12,
    "capacityAh": 5.3,
    "maxDischargeCurrentA": 15.9,
    "maxChargeCurrentA": 1.59
  },
  {
    "sku": "AGM46",
    "name": "Akumulator VRLA AGM Cube Green Cell 8 Ah 12 V",
    "voltage": 12,
    "capacityAh": 8,
    "maxDischargeCurrentA": 24,
    "maxChargeCurrentA": 2.1
  },
  {
    "sku": "AGM47",
    "name": "Akumulator VRLA AGM Cube Green Cell 8.5 Ah 12 V",
    "voltage": 12,
    "capacityAh": 8.5,
    "maxDischargeCurrentA": 25.5,
    "maxChargeCurrentA": 2.4
  },
  {
    "sku": "AGM48",
    "name": "Akumulator VRLA AGM Cube Green Cell 10 Ah 12 V",
    "voltage": 12,
    "capacityAh": 10,
    "maxDischargeCurrentA": 30,
    "maxChargeCurrentA": 3
  },
  {
    "sku": "AGM49",
    "name": "Akumulator VRLA AGM Cube Green Cell 55 Ah 12 V",
    "voltage": 12,
    "capacityAh": 55,
    "maxDischargeCurrentA": 165,
    "maxChargeCurrentA": 16.5
  },
  {
    "sku": "AGM50",
    "name": "Akumulator VRLA AGM Cube Green Cell 10 Ah 12 V",
    "voltage": 12,
    "capacityAh": 10,
    "maxDischargeCurrentA": 30,
    "maxChargeCurrentA": 2.7
  },
  {
    "sku": "AGM51",
    "name": "Akumulator VRLA AGM Cube Green Cell 17 Ah 12 V",
    "voltage": 12,
    "capacityAh": 17,
    "maxDischargeCurrentA": 51,
    "maxChargeCurrentA": 5.1
  },
  {
    "sku": "AGM53",
    "name": "Akumulator VRLA AGM Cube Green Cell 15 Ah 12 V",
    "voltage": 12,
    "capacityAh": 15,
    "maxDischargeCurrentA": 45,
    "maxChargeCurrentA": 4.5
  },
  {
    "sku": "AGM54",
    "name": "Akumulator VRLA AGM Cube Green Cell 22 Ah 12 V",
    "voltage": 12,
    "capacityAh": 22,
    "maxDischargeCurrentA": 66,
    "maxChargeCurrentA": 6.6
  },
  {
    "sku": "AGM55",
    "name": "Akumulator VRLA AGM Cube Green Cell 28 Ah 12 V",
    "voltage": 12,
    "capacityAh": 28,
    "maxDischargeCurrentA": 84,
    "maxChargeCurrentA": 8.4
  },
  {
    "sku": "AGM56",
    "name": "Akumulator VRLA AGM Cube Green Cell 50 Ah 12 V",
    "voltage": 12,
    "capacityAh": 50,
    "maxDischargeCurrentA": 150,
    "maxChargeCurrentA": 12.5
  },
  {
    "sku": "AGM57",
    "name": "Akumulator VRLA AGM Cube Green Cell 80 Ah 12 V",
    "voltage": 12,
    "capacityAh": 80,
    "maxDischargeCurrentA": 240,
    "maxChargeCurrentA": 20
  },
  {
    "sku": "AGM58",
    "name": "Akumulator VRLA AGM Cube Green Cell 110 Ah 12 V",
    "voltage": 12,
    "capacityAh": 110,
    "maxDischargeCurrentA": 330,
    "maxChargeCurrentA": 27.5
  },
  {
    "sku": "AGM59",
    "name": "Akumulator VRLA AGM Cube Green Cell 4 Ah 12 V",
    "voltage": 12,
    "capacityAh": 4,
    "maxDischargeCurrentA": 12,
    "maxChargeCurrentA": 1.2
  },
  {
    "sku": "AGM12V5AH-J",
    "name": "Akumulator VRLA AGM Cube Green Cell 5 Ah 12 V",
    "voltage": 12,
    "capacityAh": 5,
    "maxDischargeCurrentA": 15,
    "maxChargeCurrentA": 1.5
  },
  {
    "sku": "AGM12V12AH-J",
    "name": "Akumulator VRLA AGM Cube Green Cell 12.72 Ah 12 V",
    "voltage": 12,
    "capacityAh": 12.72,
    "maxDischargeCurrentA": 38.16,
    "maxChargeCurrentA": 3.6
  },
  {
    "sku": "AGM12V33AH-J",
    "name": "Akumulator VRLA AGM Cube Green Cell 33 Ah 12 V",
    "voltage": 12,
    "capacityAh": 33,
    "maxDischargeCurrentA": 99,
    "maxChargeCurrentA": 9.9
  },
  {
    "sku": "AGM12V40AH-J",
    "name": "Akumulator VRLA AGM Cube Green Cell 40 Ah 12 V",
    "voltage": 12,
    "capacityAh": 40,
    "maxDischargeCurrentA": 120,
    "maxChargeCurrentA": 12
  },
  {
    "sku": "AGM12V55AH-J",
    "name": "Akumulator VRLA AGM Cube Green Cell 55 Ah 12 V",
    "voltage": 12,
    "capacityAh": 55,
    "maxDischargeCurrentA": 165,
    "maxChargeCurrentA": 16.5
  },
  {
    "sku": "AGM12V65AH-J",
    "name": "Akumulator VRLA AGM Cube Green Cell 65 Ah 12 V",
    "voltage": 12,
    "capacityAh": 65,
    "maxDischargeCurrentA": 195,
    "maxChargeCurrentA": 19.5
  },
  {
    "sku": "AGM12V75AH-J",
    "name": "Akumulator VRLA AGM Cube Green Cell 75 Ah 12 V",
    "voltage": 12,
    "capacityAh": 75,
    "maxDischargeCurrentA": 225,
    "maxChargeCurrentA": 22.5
  },
  {
    "sku": "AGM12V90AH-J",
    "name": "Akumulator VRLA AGM Cube Green Cell 90 Ah 12 V",
    "voltage": 12,
    "capacityAh": 90,
    "maxDischargeCurrentA": 270,
    "maxChargeCurrentA": 27
  },
  {
    "sku": "AGM12V120AH-J",
    "name": "Akumulator VRLA AGM Cube Green Cell 120 Ah 12 V",
    "voltage": 12,
    "capacityAh": 120,
    "maxDischargeCurrentA": 360,
    "maxChargeCurrentA": 36
  },
  {
    "sku": "AGM12V150AH-J",
    "name": "Akumulator VRLA AGM Cube Green Cell 150 Ah 12 V",
    "voltage": 12,
    "capacityAh": 150,
    "maxDischargeCurrentA": 450,
    "maxChargeCurrentA": 45
  },
  {
    "sku": "AGM12V200AH-J",
    "name": "Akumulator VRLA AGM Cube Green Cell 200 Ah 12 V",
    "voltage": 12,
    "capacityAh": 200,
    "maxDischargeCurrentA": 600,
    "maxChargeCurrentA": 60
  },
  {
    "sku": "AGM12V250AH-J",
    "name": "Akumulator VRLA AGM Cube Green Cell 250 Ah 12 V",
    "voltage": 12,
    "capacityAh": 250,
    "maxDischargeCurrentA": 750,
    "maxChargeCurrentA": 75
  },
  {
    "sku": "AGM12V2-3AH-H",
    "name": "Akumulator VRLA AGM Cube Green Cell 2.3 Ah 12 V",
    "voltage": 12,
    "capacityAh": 2.3,
    "maxDischargeCurrentA": 6.9,
    "maxChargeCurrentA": 0.69
  },
  {
    "sku": "AGM12V4-5AH-H",
    "name": "Akumulator VRLA AGM Cube Green Cell 4.5 Ah 12 V",
    "voltage": 12,
    "capacityAh": 4.5,
    "maxDischargeCurrentA": 13.5,
    "maxChargeCurrentA": 1.35
  },
  {
    "sku": "AGM12V12AH-H",
    "name": "Akumulator VRLA AGM Cube Green Cell 12 Ah 12 V",
    "voltage": 12,
    "capacityAh": 12,
    "maxDischargeCurrentA": 36,
    "maxChargeCurrentA": 3.6
  },
  {
    "sku": "AGM12V18AH-H",
    "name": "Akumulator VRLA AGM Cube Green Cell 18 Ah 12 V",
    "voltage": 12,
    "capacityAh": 18,
    "maxDischargeCurrentA": 54,
    "maxChargeCurrentA": 5.4
  },
  {
    "sku": "AGM12V50AH-H",
    "name": "Akumulator VRLA AGM Cube Green Cell 50 Ah 12 V",
    "voltage": 12,
    "capacityAh": 50,
    "maxDischargeCurrentA": 150,
    "maxChargeCurrentA": 12
  },
  {
    "sku": "AGM12V80AH-H",
    "name": "Akumulator VRLA AGM Cube Green Cell 80 Ah 12 V",
    "voltage": 12,
    "capacityAh": 80,
    "maxDischargeCurrentA": 240,
    "maxChargeCurrentA": 24
  },
  {
    "sku": "AGM12V100AH-H",
    "name": "Akumulator VRLA AGM Cube Green Cell 100 Ah 12 V",
    "voltage": 12,
    "capacityAh": 100,
    "maxDischargeCurrentA": 300,
    "maxChargeCurrentA": 30
  },
  {
    "sku": "AGM12V135AH-H",
    "name": "Akumulator VRLA AGM Cube Green Cell 135 Ah 12 V",
    "voltage": 12,
    "capacityAh": 135,
    "maxDischargeCurrentA": 405,
    "maxChargeCurrentA": 40.5
  },
  {
    "sku": "AGM12V175AH-H",
    "name": "Akumulator VRLA AGM Cube Green Cell 175 Ah 12 V",
    "voltage": 12,
    "capacityAh": 175,
    "maxDischargeCurrentA": 525,
    "maxChargeCurrentA": 52.5
  },
  {
    "sku": "AGM12V250AH-H",
    "name": "Akumulator VRLA AGM Cube Green Cell 250 Ah 12 V",
    "voltage": 12,
    "capacityAh": 250,
    "maxDischargeCurrentA": 750,
    "maxChargeCurrentA": 60
  }
];

// Arkusz nie zawiera tabel stałej mocy ani wykładników Peukerta. Silnik rozpoznaje
// brak tych pól i korzysta z jawnych, konfigurowalnych wartości zastępczych.
export const BATTERY_MODELS = SOURCE_BATTERY_MODELS.map((battery) => ({
  ...battery,
  finalDischargeVoltageV: 10.5,
}));
