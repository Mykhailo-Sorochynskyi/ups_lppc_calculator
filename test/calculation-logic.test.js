import test from "node:test";
import assert from "node:assert/strict";
import { UPS_DATABASE } from "../data/ups.js";
import { BATTERY_MODELS } from "../data/batteries.js";
import { APPLICATION_DATABASE } from "../data/applications.js";
import { CALCULATION_ASSUMPTIONS } from "../data/calculation-assumptions.js";
import { UPS_MANUFACTURER_CONSTRAINTS } from "../data/ups-constraints.js";
import {
  calculateSelection,
  calculateUpsApparentRequirement,
  calculateUpsRequirements,
} from "../logic/calculation-logic.js";
import { selectBatteryConfiguration } from "../logic/battery-sizing-engine.js";
import { selectChargingProfile, validateChargingCompatibility } from "../logic/charging-compatibility-engine.js";
import { validateCable } from "../logic/cable-validation-engine.js";
import { calculateMaximumContinuousOutputPower, estimateBatteryRuntime } from "../logic/runtime-engine.js";
import { resolveUpsImage } from "../ui/ups-images.js";

test("bazy zawierają komplet rekordów z trzech zakładek", () => {
  assert.equal(UPS_DATABASE.length, 25);
  assert.equal(BATTERY_MODELS.length, 62);
  assert.equal(APPLICATION_DATABASE.length, 5);
});

test("każdy generalUse ma podpowiedź professionalUse i typicalLoads", () => {
  for (const application of APPLICATION_DATABASE) {
    assert.ok(application.generalUse.length > 20);
    assert.ok(application.professionalUse.length > 20);
    assert.ok(application.typicalLoads.length > 20);
  }
});

test("zdjęcia UPS są przypisane do właściwych rodzin SKU", () => {
  const bySku = (sku) => UPS_DATABASE.find((ups) => ups.sku === sku);
  assert.equal(resolveUpsImage(bySku("UPS01LCD")), "/assets/images/ups-powerproof.png");
  assert.equal(resolveUpsImage(bySku("UPS06")), "/assets/images/ups-aio.png");
  assert.equal(resolveUpsImage(bySku("UPS07")), "/assets/images/ups-aio.png");
  assert.equal(resolveUpsImage(bySku("UPSLP1050")), "/assets/images/ups-lp.png");
  assert.equal(resolveUpsImage(bySku("UPSLM1200")), "/assets/images/ups-lm.png");
  assert.equal(resolveUpsImage(bySku("UPS13")), "/assets/images/ups-rtii.png");
  assert.match(resolveUpsImage(bySku("UPSLPPC500")), /^https:\/\//);
});

test("kontrola VA używa współczynnika mocy wyliczonego z parametrów danego UPS", () => {
  const ups = UPS_DATABASE.find((item) => item.sku === "UPS09");
  const requirements = calculateUpsRequirements(1000);
  const apparent = calculateUpsApparentRequirement(requirements, ups);
  assert.equal(requirements.requiredActivePowerW, 1200);
  assert.equal(apparent.upsPowerFactor, 1400 / 2000);
  assert.equal(apparent.requiredApparentPowerVa, 1200 / (1400 / 2000));
  assert.equal("loadPowerFactor" in CALCULATION_ASSUMPTIONS, false);
});

test("dobór UPS odbywa się wyłącznie w kategorii wybranego generalUse", () => {
  const result = calculateSelection({
    loadPowerW: 100,
    runtimeMinutes: 10,
    applicationId: "powerproof-modified-sine",
    upsDatabase: UPS_DATABASE,
    batteryDatabase: BATTERY_MODELS,
  });
  assert.equal(result.ups.applicationId, "powerproof-modified-sine");
  assert.equal(result.battery, null);
  assert.ok(result.internalBatteryInfo);
  assert.equal(result.internalBatteryInfo.battery.voltage, result.ups.internalBattery.voltageV);
  assert.equal(result.internalBatteryInfo.battery.capacityAh, result.ups.internalBattery.capacityAh);
  assert.equal(
    result.internalBatteryInfo.nominalEnergyWh,
    result.internalBatteryInfo.bankVoltageV * result.internalBatteryInfo.bankCapacityAh,
  );
  assert.equal(result.internalBatteryInfo.runtimeMethod, "peukert-fallback");
  assert.equal(result.internalBatteryInfo.maximumChargeTimeMinutes, 8 * 60);
  assert.equal("maximumChargePowerW" in result.internalBatteryInfo, false);
  assert.equal("maximumDischargePowerW" in result.internalBatteryInfo, false);
  assert.equal("maximumChargeCurrentA" in result.internalBatteryInfo, false);
  assert.equal("maximumDischargeCurrentA" in result.internalBatteryInfo, false);
  assert.ok(result.internalBatteryInfo.estimatedRuntimeAtMaximumLoadMinutes > 0);
  assert.ok(
    result.internalBatteryInfo.estimatedRuntimeAtMaximumLoadMinutes <=
      result.internalBatteryInfo.estimatedRuntimeMinutes,
  );
});

test("każdy UPS z akumulatorami wbudowanymi ma w bazie czas ładowania 8 godzin", () => {
  const internalBatteryModels = UPS_DATABASE.filter((ups) => ups.internalBattery);
  assert.ok(internalBatteryModels.length > 0);
  for (const ups of internalBatteryModels) {
    assert.equal(ups.internalBattery.maximumChargeTimeMinutes, 480, ups.sku);
  }
});

test("wynik RTII niespełniający czasu nadal zawiera parametry baterii wbudowanej", () => {
  const result = calculateSelection({
    loadPowerW: 100,
    runtimeMinutes: 24 * 60,
    applicationId: "rtii-rack-online",
    upsDatabase: UPS_DATABASE,
    batteryDatabase: BATTERY_MODELS,
  });
  assert.equal(result.configurationStatus, "NOT COMPLIANT");
  assert.ok(result.internalBatteryInfo?.battery.name);
  assert.ok(result.internalBatteryInfo.estimatedRuntimeMinutes > 0);
});

test("zewnętrzny AGM jest dobierany tylko dla PowerCore", () => {
  const result = calculateSelection({
    loadPowerW: 240,
    runtimeMinutes: 120,
    applicationId: "powercore-pure-sine",
    upsDatabase: UPS_DATABASE,
    batteryDatabase: BATTERY_MODELS,
  });
  assert.equal(result.ups.category, "PowerCore");
  assert.ok(result.battery);
  assert.ok(["constant-power-table", "peukert-fallback"].includes(result.battery.runtimeMethod));
});

test("w układzie 24 V pojemność Ah nie sumuje się przez połączenie szeregowe", () => {
  const ups = UPS_DATABASE.find((item) => item.sku === "UPSLPPC1200");
  const result = selectBatteryConfiguration({
    ups,
    batteries: BATTERY_MODELS,
    constraint: UPS_MANUFACTURER_CONSTRAINTS[ups.sku],
    loadPowerW: 400,
    requiredRuntimeMinutes: 60,
    assumptions: CALCULATION_ASSUMPTIONS,
  }).recommended;
  assert.equal(result.series, 2);
  assert.equal(result.bankVoltageV, 24);
  assert.equal(result.bankCapacityAh, result.battery.capacityAh * result.parallel);
  assert.equal(result.nominalEnergyWh, 24 * result.bankCapacityAh);
  assert.equal(result.count, result.series * result.parallel);
  assert.equal(
    result.maximumChargeCurrentA,
    Math.min(
      result.chargingProfile.currentRangeA[1],
      result.battery.maxChargeCurrentA * result.parallel,
    ),
  );
  assert.ok(result.maximumDischargeCurrentA <= result.battery.maxDischargeCurrentA * result.parallel);
  assert.ok(result.maximumDischargeCurrentA <= result.cable.maximumCurrentA);
  assert.equal(result.maximumChargePowerW, result.bankVoltageV * result.maximumChargeCurrentA);
  assert.ok(result.maximumDischargePowerW <= calculateMaximumContinuousOutputPower(ups));
  assert.ok(result.estimatedRuntimeAtMaximumLoadMinutes > 0);
  assert.equal(result.maximumChargeTimeMinutes, result.bankCapacityAh / result.maximumChargeCurrentA * 60);
});

test("dla 100 Ah selektor producenta wybiera konserwatywnie H", () => {
  const profile = selectChargingProfile(
    100,
    UPS_MANUFACTURER_CONSTRAINTS.UPSLPPC1000.chargingSelectors,
  );
  assert.equal(profile.level, "H");
  assert.deepEqual(profile.currentRangeA, [15, 19]);
});

test("częściowe przekroczenie prądu ładowania AGM daje WARNING", () => {
  const result = validateChargingCompatibility({
    battery: { maxChargeCurrentA: 15, recommendedChargeCurrentA: null },
    parallel: 1,
    chargingProfile: { currentRangeA: [15, 19] },
  });
  assert.equal(result.status, "WARNING");
  assert.equal(result.maximumUsableChargeCurrentA, 15);
});

test("prąd ładowania układu rośnie z liczbą stringów równoległych", () => {
  const result = validateChargingCompatibility({
    battery: { maxChargeCurrentA: 6, recommendedChargeCurrentA: null },
    parallel: 2,
    chargingProfile: { currentRangeA: [7, 9] },
  });
  assert.equal(result.batteryMaxChargeCurrentA, 12);
  assert.equal(result.maximumUsableChargeCurrentA, 9);
  assert.equal(result.status, "OK");
});

test("silnik preferuje tabelę Constant Power producenta", () => {
  const result = estimateBatteryRuntime({
    battery: {
      capacityAh: 20,
      constantPowerDischargeTable: [
        { cutoffVoltagePerBatteryV: 10.5, wattsPerBattery: 50, minutes: 120 },
        { cutoffVoltagePerBatteryV: 10.5, wattsPerBattery: 100, minutes: 60 },
      ],
    },
    count: 1,
    parallel: 1,
    currentPerStringA: 5,
    dcPowerW: 75,
    cutoffVoltagePerBatteryV: 10.5,
    assumptions: { ...CALCULATION_ASSUMPTIONS, agingFactor: 1, safetyMargin: 1 },
  });
  assert.equal(result.method, "constant-power-table");
  assert.equal(result.minutes, 90);
});

test("brak tabeli rozładowania uruchamia jawny fallback Peukerta", () => {
  const result = estimateBatteryRuntime({
    battery: { capacityAh: 100, capacityRatingHours: 20, peukertExponent: null, constantPowerDischargeTable: null },
    count: 1,
    parallel: 1,
    currentPerStringA: 20,
    dcPowerW: 240,
    cutoffVoltagePerBatteryV: 10.5,
    assumptions: CALCULATION_ASSUMPTIONS,
  });
  assert.equal(result.method, "peukert-fallback");
  assert.equal(result.peukertExponentUsed, 1.2);
  assert.ok(result.warnings.length >= 2);
});

test("prąd projektowy przewodu używa napięcia odcięcia, nie nominalnego", () => {
  const ups = UPS_DATABASE.find((item) => item.sku === "UPSLPPC500");
  const result = validateCable({ ups, constraint: UPS_MANUFACTURER_CONSTRAINTS.UPSLPPC500 });
  assert.ok(Math.abs(result.maximumCurrentA - 550 / (10.5 * 0.888)) < 1e-9);
  assert.equal(result.specification, "6 AWG / 2 × 13.3 mm²");
});

test("PowerCore LPPC używa sprawności 88,8% i ciągłego limitu 110%", () => {
  const powerCoreModels = UPS_DATABASE.filter((ups) => ups.category === "PowerCore");
  assert.equal(powerCoreModels.length, 4);
  for (const ups of powerCoreModels) {
    assert.equal(ups.efficiency.batteryMinimum, 0.888, ups.sku);
    assert.equal(ups.continuousOverloadFactor, 1.1, ups.sku);
    assert.equal(calculateMaximumContinuousOutputPower(ups), ups.activePower * 1.1, ups.sku);
  }
});

test("brak odpowiedniej autonomii PowerProof proponuje zestaw PowerCore", () => {
  const result = calculateSelection({
    loadPowerW: 100,
    runtimeMinutes: 120,
    applicationId: "powerproof-modified-sine",
    upsDatabase: UPS_DATABASE,
    batteryDatabase: BATTERY_MODELS,
  });
  assert.equal(result.applicationFallback, true);
  assert.equal(result.originalApplicationId, "powerproof-modified-sine");
  assert.equal(result.ups?.category, "PowerCore");
  assert.match(result.recommendationText, /PowerCore/);
  assert.equal("alternativeRecommendations" in result, false);
});

test("obciążenie powyżej 100% nie proponuje UPS-a ani akumulatorów", () => {
  const result = calculateSelection({
    loadPowerW: 1400,
    runtimeMinutes: 1,
    applicationId: "powerproof-modified-sine",
    upsDatabase: UPS_DATABASE,
    batteryDatabase: BATTERY_MODELS,
  });
  assert.equal(result.noSolution, true);
  assert.equal(result.nearestAlternative, false);
  assert.equal(result.failureReason, "power");
  assert.match(result.noSolutionMessage, /przekracza 100% mocy/);
  assert.equal(result.ups, null);
  assert.equal(result.battery, null);
  assert.equal(result.internalBatteryInfo, null);
});

test("PowerCore przy dokładnie 100% obciążenia oblicza akumulatory i parametry", () => {
  const result = calculateSelection({
    loadPowerW: 1200,
    runtimeMinutes: 1,
    applicationId: "powercore-pure-sine",
    upsDatabase: UPS_DATABASE,
    batteryDatabase: BATTERY_MODELS,
  });

  assert.equal(result.noSolution, true);
  assert.equal(result.nearestAlternative, true);
  assert.equal(result.ups?.sku, "UPSLPPC1200");
  assert.equal(result.requirements.loadPowerW / result.ups.activePower, 1);
  assert.ok(result.battery);
  assert.ok(result.battery.estimatedRuntimeMinutes > 0);
  assert.ok(result.battery.usableEnergyWh > 0);
  assert.ok(result.battery.nominalEnergyWh > 0);
  assert.ok(result.battery.cable);
});

test("najbliższy RTII zachowuje obliczenia wbudowanego układu akumulatorów", () => {
  const result = calculateSelection({
    loadPowerW: 2400,
    runtimeMinutes: 1,
    applicationId: "rtii-rack-online",
    upsDatabase: UPS_DATABASE,
    batteryDatabase: BATTERY_MODELS,
  });

  assert.equal(result.noSolution, true);
  assert.equal(result.nearestAlternative, true);
  assert.equal(result.failureReason, "power");
  assert.equal(result.ups?.category, "RTII Rack Online");
  assert.ok(result.requirements.loadPowerW / result.ups.activePower <= 1);
  assert.ok(calculateMaximumContinuousOutputPower(result.ups) < result.requirements.requiredActivePowerW);
  assert.match(result.noSolutionMessage, /parametrach najbliższych wymaganym/);
  assert.match(result.noSolutionMessage, /może przyspieszyć zużycie akumulatora/);
  assert.ok(result.internalBatteryInfo);
  assert.ok(result.internalBatteryInfo.estimatedRuntimeMinutes > 0);
  assert.ok(result.internalBatteryInfo.nominalEnergyWh > 0);
  assert.equal(result.internalBatteryInfo.maximumChargeTimeMinutes, 8 * 60);
});

test("całkowity brak rozwiązania wskazuje niewystarczający czas podtrzymania", () => {
  const result = calculateSelection({
    loadPowerW: 100,
    runtimeMinutes: 24 * 60,
    applicationId: "powercore-pure-sine",
    upsDatabase: UPS_DATABASE,
    batteryDatabase: BATTERY_MODELS,
  });
  assert.equal(result.noSolution, true);
  assert.equal(result.nearestAlternative, true);
  assert.equal(result.failureReason, "runtime");
  assert.match(result.noSolutionMessage, /czasu podtrzymania/);
  assert.ok(result.ups);
  assert.ok(result.battery);
  assert.ok(result.battery.designRuntimeMinutes < 24 * 60);
});

test("czas prezentowany dla 25°C nie zawiera zapasu projektowego drugi raz", () => {
  const common = {
    battery: { capacityAh: 100, capacityRatingHours: 20, peukertExponent: 1.2 },
    count: 1,
    parallel: 1,
    currentPerStringA: 20,
    dcPowerW: 240,
    cutoffVoltagePerBatteryV: 10.5,
    assumptions: CALCULATION_ASSUMPTIONS,
  };
  const estimated = estimateBatteryRuntime(common);
  const design = estimateBatteryRuntime({ ...common, designDerating: true });
  assert.ok(estimated.minutes > design.minutes);
});

test("bazy nie przechowują redundantnych pól obliczeniowych", () => {
  for (const ups of UPS_DATABASE) {
    assert.equal("powerFactor" in ups, false, ups.sku);
    assert.equal("systemVoltage" in ups, false, ups.sku);
    assert.equal("waveform" in ups, false, ups.sku);
    assert.equal("topology" in ups, false, ups.sku);
  }
  for (const battery of BATTERY_MODELS) {
    assert.equal("nominalEnergyWh" in battery, false, battery.sku);
    assert.equal("chemistry" in battery, false, battery.sku);
  }
});
