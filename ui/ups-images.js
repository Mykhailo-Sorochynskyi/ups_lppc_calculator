const POWERCORE_IMAGE =
  "https://greencell.global/72475-thickbox_default/greencell-zasilacz-awaryjny-avr-ups-800va-500w-powercore-12-vdc-z-wyswietlaczem-lcd.jpg";

/**
 * Przypisuje zdjęcie do rodziny produktu. Reguły szczegółowe są sprawdzane
 * przed ogólnymi, dlatego UPS06/UPS07 nie wpadają do grupy pozostałych UPS0…,
 * a UPSLPPC (PowerCore) nie jest traktowany jak rodzina UPSLP z baterią wbudowaną.
 */
export function resolveUpsImage(ups) {
  if (!ups) return null;
  if (ups.sku === "UPS06" || ups.sku === "UPS07") return "/assets/images/ups-aio.png";
  if (ups.category === "RTII Rack Online") return "/assets/images/ups-rtii.png";
  if (ups.sku.startsWith("UPSLM")) return "/assets/images/ups-lm.png";
  if (/^UPSLP\d/.test(ups.sku)) return "/assets/images/ups-lp.png";
  if (ups.sku.startsWith("UPS0")) return "/assets/images/ups-powerproof.png";
  return POWERCORE_IMAGE;
}
