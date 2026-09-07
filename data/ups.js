// Parametry przeniesione z zakładki „Baza UPS” skoroszytu źródłowego.
// Pola obliczeniowe pozostają liczbami, aby logika nie musiała parsować opisów.
export const UPS_DATABASE = [
  {
    "sku": "UPSLPPC500",
    "name": "Zasilacz Awaryjny UPS Power Core Green Cell 800 VA 500 W Czysty Sinus",
    "category": "PowerCore",
    "applicationId": "powercore-pure-sine",
    "externalBattery": {
      "minCapacityAh": 20,
      "maxCapacityAh": 200,
    },
    "internalBattery": null,
    "activePower": 500,
    "apparentPower": 800,
    "continuousOverloadFactor": 1.1,
    "efficiency": {
      "batteryMinimum": 0.888,
    }
  },
  {
    "sku": "UPSLPPC800",
    "name": "Zasilacz Awaryjny UPS Power Core Green Cell 1200 VA 800 W Czysty Sinus",
    "category": "PowerCore",
    "applicationId": "powercore-pure-sine",
    "externalBattery": {
      "minCapacityAh": 20,
      "maxCapacityAh": 200,
    },
    "internalBattery": null,
    "activePower": 800,
    "apparentPower": 1200,
    "continuousOverloadFactor": 1.1,
    "efficiency": {
      "batteryMinimum": 0.888,
    }
  },
  {
    "sku": "UPSLPPC1000",
    "name": "Zasilacz Awaryjny UPS Power Core Green Cell 1500 VA 1000 W Czysty Sinus",
    "category": "PowerCore",
    "applicationId": "powercore-pure-sine",
    "externalBattery": {
      "minCapacityAh": 20,
      "maxCapacityAh": 200,
    },
    "internalBattery": null,
    "activePower": 1000,
    "apparentPower": 1500,
    "continuousOverloadFactor": 1.1,
    "efficiency": {
      "batteryMinimum": 0.888,
    }
  },
  {
    "sku": "UPSLPPC1200",
    "name": "Zasilacz Awaryjny UPS Power Core Green Cell 2000 VA 1200 W Czysty Sinus",
    "category": "PowerCore",
    "applicationId": "powercore-pure-sine",
    "externalBattery": {
      "minCapacityAh": 20,
      "maxCapacityAh": 200,
    },
    "internalBattery": null,
    "activePower": 1200,
    "apparentPower": 2000,
    "continuousOverloadFactor": 1.1,
    "efficiency": {
      "batteryMinimum": 0.888,
    }
  },
  {
    "sku": "UPS01LCD",
    "name": "Zasilacz Awaryjny UPS PowerProof Green Cell 600 VA 360 W Modyfikowana Sinusoida",
    "category": "PowerProof",
    "applicationId": "powerproof-modified-sine",
    "externalBattery": {
      "supported": false,
      "minCapacityAh": null,
      "maxCapacityAh": null,
    },
    "internalBattery": {
      "quantity": 1,
      "voltageV": 12,
      "capacityAh": 7,
      "maximumChargeTimeMinutes": 480,
    },
    "activePower": 360,
    "apparentPower": 600,
    "efficiency": {
      "batteryMinimum": 0.8,
    }
  },
  {
    "sku": "UPS02",
    "name": "Zasilacz Awaryjny UPS PowerProof Green Cell 800 VA 480 W Modyfikowana Sinusoida",
    "category": "PowerProof",
    "applicationId": "powerproof-modified-sine",
    "externalBattery": {
      "supported": false,
      "minCapacityAh": null,
      "maxCapacityAh": null,
    },
    "internalBattery": {
      "quantity": 1,
      "voltageV": 12,
      "capacityAh": 9,
      "maximumChargeTimeMinutes": 480,
    },
    "activePower": 480,
    "apparentPower": 800,
    "efficiency": {
      "batteryMinimum": 0.8,
    }
  },
  {
    "sku": "UPS03",
    "name": "Zasilacz Awaryjny UPS PowerProof Green Cell 1000 VA 600 W Modyfikowana Sinusoida",
    "category": "PowerProof",
    "applicationId": "powerproof-modified-sine",
    "externalBattery": {
      "supported": false,
      "minCapacityAh": null,
      "maxCapacityAh": null,
    },
    "internalBattery": {
      "quantity": 2,
      "voltageV": 12,
      "capacityAh": 7,
      "maximumChargeTimeMinutes": 480,
    },
    "activePower": 600,
    "apparentPower": 1000,
    "efficiency": {
      "batteryMinimum": 0.8,
    }
  },
  {
    "sku": "UPS04",
    "name": "Zasilacz Awaryjny UPS PowerProof Green Cell 1500 VA 900 W Modyfikowana Sinusoida",
    "category": "PowerProof",
    "applicationId": "powerproof-modified-sine",
    "externalBattery": {
      "supported": false,
      "minCapacityAh": null,
      "maxCapacityAh": null,
    },
    "internalBattery": {
      "quantity": 2,
      "voltageV": 12,
      "capacityAh": 9,
      "maximumChargeTimeMinutes": 480,
    },
    "activePower": 900,
    "apparentPower": 1500,
    "efficiency": {
      "batteryMinimum": 0.8,
    }
  },
  {
    "sku": "UPS05",
    "name": "Zasilacz Awaryjny UPS PowerProof Green Cell 2000 VA 1200 W Modyfikowana Sinusoida",
    "category": "PowerProof",
    "applicationId": "powerproof-modified-sine",
    "externalBattery": {
      "supported": false,
      "minCapacityAh": null,
      "maxCapacityAh": null,
    },
    "internalBattery": {
      "quantity": 2,
      "voltageV": 12,
      "capacityAh": 9,
      "maximumChargeTimeMinutes": 480,
    },
    "activePower": 1200,
    "apparentPower": 2000,
    "efficiency": {
      "batteryMinimum": 0.8,
    }
  },
  {
    "sku": "UPS08",
    "name": "Zasilacz Awaryjny UPS PowerProof Green Cell 1000 VA 700 W Czysta Sinusoida",
    "category": "PowerProof",
    "applicationId": "powerproof-pure-sine",
    "externalBattery": {
      "supported": false,
      "minCapacityAh": null,
      "maxCapacityAh": null,
    },
    "internalBattery": {
      "quantity": 2,
      "voltageV": 12,
      "capacityAh": 7,
      "maximumChargeTimeMinutes": 480,
    },
    "activePower": 700,
    "apparentPower": 1000,
    "efficiency": {
      "batteryMinimum": 0.8,
    }
  },
  {
    "sku": "UPS09",
    "name": "Zasilacz Awaryjny UPS PowerProof Green Cell 2000 VA 1400 W Czysta Sinusoida",
    "category": "PowerProof",
    "applicationId": "powerproof-pure-sine",
    "externalBattery": {
      "supported": false,
      "minCapacityAh": null,
      "maxCapacityAh": null,
    },
    "internalBattery": {
      "quantity": 2,
      "voltageV": 12,
      "capacityAh": 9,
      "maximumChargeTimeMinutes": 480,
    },
    "activePower": 1400,
    "apparentPower": 2000,
    "efficiency": {
      "batteryMinimum": 0.8,
    }
  },
  {
    "sku": "UPSLM1200",
    "name": "Zasilacz Awaryjny UPS PowerProof Green Cell 2000 VA 1200 W Modyfikowana Sinusoida",
    "category": "PowerProof",
    "applicationId": "powerproof-modified-sine",
    "externalBattery": {
      "supported": false,
      "minCapacityAh": null,
      "maxCapacityAh": null,
    },
    "internalBattery": {
      "quantity": 2,
      "voltageV": 12,
      "capacityAh": 9,
      "maximumChargeTimeMinutes": 480,
    },
    "activePower": 1200,
    "apparentPower": 2000,
    "efficiency": {
      "batteryMinimum": 0.8,
    }
  },
  {
    "sku": "UPSLM360",
    "name": "Zasilacz Awaryjny UPS PowerProof Green Cell 650 VA 360 W Modyfikowana Sinusoida",
    "category": "PowerProof",
    "applicationId": "powerproof-modified-sine",
    "externalBattery": {
      "supported": false,
      "minCapacityAh": null,
      "maxCapacityAh": null,
    },
    "internalBattery": {
      "quantity": 1,
      "voltageV": 12,
      "capacityAh": 7,
      "maximumChargeTimeMinutes": 480,
    },
    "activePower": 360,
    "apparentPower": 650,
    "efficiency": {
      "batteryMinimum": 0.8,
    }
  },
  {
    "sku": "UPSLM480",
    "name": "Zasilacz Awaryjny UPS PowerProof Green Cell 850 VA 480 W Modyfikowana Sinusoida",
    "category": "PowerProof",
    "applicationId": "powerproof-modified-sine",
    "externalBattery": {
      "supported": false,
      "minCapacityAh": null,
      "maxCapacityAh": null,
    },
    "internalBattery": {
      "quantity": 1,
      "voltageV": 12,
      "capacityAh": 9,
      "maximumChargeTimeMinutes": 480,
    },
    "activePower": 480,
    "apparentPower": 850,
    "efficiency": {
      "batteryMinimum": 0.8,
    }
  },
  {
    "sku": "UPSLM600",
    "name": "Zasilacz Awaryjny UPS PowerProof Green Cell 1000 VA 600 W Modyfikowana Sinusoida",
    "category": "PowerProof",
    "applicationId": "powerproof-modified-sine",
    "externalBattery": {
      "supported": false,
      "minCapacityAh": null,
      "maxCapacityAh": null,
    },
    "internalBattery": {
      "quantity": 2,
      "voltageV": 12,
      "capacityAh": 7,
      "maximumChargeTimeMinutes": 480,
    },
    "activePower": 600,
    "apparentPower": 1000,
    "efficiency": {
      "batteryMinimum": 0.8,
    }
  },
  {
    "sku": "UPSLM900",
    "name": "Zasilacz Awaryjny UPS PowerProof Green Cell 1500 VA 900 W Modyfikowana Sinusoida",
    "category": "PowerProof",
    "applicationId": "powerproof-modified-sine",
    "externalBattery": {
      "supported": false,
      "minCapacityAh": null,
      "maxCapacityAh": null,
    },
    "internalBattery": {
      "quantity": 2,
      "voltageV": 12,
      "capacityAh": 9,
      "maximumChargeTimeMinutes": 480,
    },
    "activePower": 900,
    "apparentPower": 1500,
    "efficiency": {
      "batteryMinimum": 0.8,
    }
  },
  {
    "sku": "UPSLP1050",
    "name": "Zasilacz Awaryjny UPS PowerProof Green Cell 1500 VA 1050 W Czysta Sinusoida",
    "category": "PowerProof",
    "applicationId": "powerproof-pure-sine",
    "externalBattery": {
      "supported": false,
      "minCapacityAh": null,
      "maxCapacityAh": null,
    },
    "internalBattery": {
      "quantity": 2,
      "voltageV": 12,
      "capacityAh": 9,
      "maximumChargeTimeMinutes": 480,
    },
    "activePower": 1050,
    "apparentPower": 1500,
    "efficiency": {
      "batteryMinimum": 0.8,
    }
  },
  {
    "sku": "UPSLP1400",
    "name": "Zasilacz Awaryjny UPS PowerProof Green Cell 2000 VA 1400 W Czysta Sinusoida",
    "category": "PowerProof",
    "applicationId": "powerproof-pure-sine",
    "externalBattery": {
      "supported": false,
      "minCapacityAh": null,
      "maxCapacityAh": null,
    },
    "internalBattery": {
      "quantity": 2,
      "voltageV": 12,
      "capacityAh": 9,
      "maximumChargeTimeMinutes": 480,
    },
    "activePower": 1400,
    "apparentPower": 2000,
    "efficiency": {
      "batteryMinimum": 0.8,
    }
  },
  {
    "sku": "UPSLP480",
    "name": "Zasilacz Awaryjny UPS PowerProof Green Cell 750 VA 480 W Czysta Sinusoida",
    "category": "PowerProof",
    "applicationId": "powerproof-pure-sine",
    "externalBattery": {
      "supported": false,
      "minCapacityAh": null,
      "maxCapacityAh": null,
    },
    "internalBattery": {
      "quantity": 1,
      "voltageV": 12,
      "capacityAh": 9,
      "maximumChargeTimeMinutes": 480,
    },
    "activePower": 480,
    "apparentPower": 750,
    "efficiency": {
      "batteryMinimum": 0.8,
    }
  },
  {
    "sku": "UPSLP700",
    "name": "Zasilacz Awaryjny UPS PowerProof Green Cell 1000 VA 700 W Czysta Sinusoida",
    "category": "PowerProof",
    "applicationId": "powerproof-pure-sine",
    "externalBattery": {
      "supported": false,
      "minCapacityAh": null,
      "maxCapacityAh": null,
    },
    "internalBattery": {
      "quantity": 2,
      "voltageV": 12,
      "capacityAh": 7,
      "maximumChargeTimeMinutes": 480,
    },
    "activePower": 700,
    "apparentPower": 1000,
    "efficiency": {
      "batteryMinimum": 0.8,
    }
  },
  {
    "sku": "UPS06",
    "name": "Zasilacz Awaryjny UPS AiO Green Cell 600 VA 360 W Modyfikowana Sinusoida",
    "category": "AiO",
    "applicationId": "powerproof-aio-modified-sine",
    "externalBattery": {
      "supported": false,
      "minCapacityAh": null,
      "maxCapacityAh": null,
    },
    "internalBattery": {
      "quantity": 1,
      "voltageV": 12,
      "capacityAh": 7,
      "maximumChargeTimeMinutes": 480,
    },
    "activePower": 360,
    "apparentPower": 600,
    "efficiency": {
      "batteryMinimum": 0.8,
    }
  },
  {
    "sku": "UPS07",
    "name": "Zasilacz Awaryjny UPS AiO Green Cell 800 VA 480 W Modyfikowana Sinusoida",
    "category": "AiO",
    "applicationId": "powerproof-aio-modified-sine",
    "externalBattery": {
      "supported": false,
      "minCapacityAh": null,
      "maxCapacityAh": null,
    },
    "internalBattery": {
      "quantity": 1,
      "voltageV": 12,
      "capacityAh": 9,
      "maximumChargeTimeMinutes": 480,
    },
    "activePower": 480,
    "apparentPower": 800,
    "efficiency": {
      "batteryMinimum": 0.8,
    }
  },
  {
    "sku": "UPS13",
    "name": "Zasilacz Awaryjny UPS RTII Rack Online Green Cell 1000 VA 900 W Czysty Sinus",
    "category": "RTII Rack Online",
    "applicationId": "rtii-rack-online",
    "externalBattery": {
      "supported": false,
      "minCapacityAh": null,
      "maxCapacityAh": null,
    },
    "internalBattery": {
      "quantity": 2,
      "voltageV": 12,
      "capacityAh": 9,
      "maximumChargeTimeMinutes": 480,
    },
    "activePower": 900,
    "apparentPower": 1000,
    "efficiency": {
      "batteryMinimum": 0.8,
    }
  },
  {
    "sku": "UPS14",
    "name": "Zasilacz Awaryjny UPS RTII Rack Online Green Cell 2000 VA 1800 W Czysty Sinus",
    "category": "RTII Rack Online",
    "applicationId": "rtii-rack-online",
    "externalBattery": {
      "supported": false,
      "minCapacityAh": null,
      "maxCapacityAh": null,
    },
    "internalBattery": {
      "quantity": 4,
      "voltageV": 12,
      "capacityAh": 9,
      "maximumChargeTimeMinutes": 480,
    },
    "activePower": 1800,
    "apparentPower": 2000,
    "efficiency": {
      "batteryMinimum": 0.8,
    }
  },
  {
    "sku": "UPS15",
    "name": "Zasilacz Awaryjny UPS RTII Rack Online Green Cell 3000 VA 2700 W Czysty Sinus",
    "category": "RTII Rack Online",
    "applicationId": "rtii-rack-online",
    "externalBattery": {
      "supported": false,
      "minCapacityAh": null,
      "maxCapacityAh": null,
    },
    "internalBattery": {
      "quantity": 6,
      "voltageV": 12,
      "capacityAh": 9,
      "maximumChargeTimeMinutes": 480,
    },
    "activePower": 2700,
    "apparentPower": 3000,
    "efficiency": {
      "batteryMinimum": 0.8,
    }
  }
];
