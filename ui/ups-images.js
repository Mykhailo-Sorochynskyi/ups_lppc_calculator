const POWERCORE_IMAGE =
  "https://greencell.global/72475-thickbox_default/greencell-zasilacz-awaryjny-avr-ups-800va-500w-powercore-12-vdc-z-wyswietlaczem-lcd.jpg";
const LOCAL_IMAGE_DIRECTORY = `${import.meta.env?.BASE_URL ?? "./"}assets/images/`;

function localImage(filename) {
  return `${LOCAL_IMAGE_DIRECTORY}${filename}`;
}

/**
 * Przypisuje zdjęcie do rodziny produktu. Reguły szczegółowe są sprawdzane
 * przed ogólnymi, dlatego UPS06/UPS07 nie wpadają do grupy pozostałych UPS0…,
 * a UPSLPPC (PowerCore) nie jest traktowany jak rodzina UPSLP z baterią wbudowaną.
 */
export function resolveUpsImage(ups) {
  if (!ups) return null;
  if (ups.sku === "UPS06" || ups.sku === "UPS07") return localImage("ups-aio.png");
  if (ups.category === "RTII Rack Online") return localImage("ups-rtii.png");
  if (ups.sku.startsWith("UPSLM")) return localImage("ups-lm.png");
  if (/^UPSLP\d/.test(ups.sku)) return localImage("ups-lp.png");
  if (ups.sku.startsWith("UPS0")) return localImage("ups-powerproof.png");
  return POWERCORE_IMAGE;
}
