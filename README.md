# Kalkulator doboru UPS

Kalkulator dobiera UPS w wybranej kategorii, a następnie sprawdza wymagany czas
podtrzymania. Dla serii PowerCore dobiera zewnętrzny układ akumulatorów AGM;
dla pozostałych serii oblicza parametry akumulatorów wbudowanych.

## Struktura projektu

```text
data/                  bazy UPS, AGM, zastosowań i ograniczeń producenta
logic/                 obliczenia i reguły doboru
public/assets/images/  wszystkie lokalne obrazy produktów i przewodów
test/                  testy logiki obliczeniowej
ui/                    obsługa interfejsu, style i mapowanie zdjęć
index.html             struktura strony
```

Najważniejszym punktem wejścia logiki jest `logic/calculation-logic.js`.
Interfejs uruchamia go z `ui/app.js`. Pliki w `data/` nie zawierają wzorów — są
wyłącznie źródłem parametrów wejściowych.

## Najważniejsze zasady

- rzeczywiste obciążenie UPS nie może przekraczać 100% mocy znamionowej;
- wymagana moc zalecanego modelu uwzględnia rezerwę z `data/calculation-assumptions.js`;
- czas pracy jest liczony z tabeli Constant Power, jeśli jest dostępna, albo
  metodą Peukerta;
- dla PowerCore sprawdzane są napięcie układu, prąd ładowania, prąd rozładowania
  i obciążalność przewodu;
- konfiguracje akumulatorów są porównywane najpierw według liczby sztuk, potem
  według pojemności i nadmiaru czasu podtrzymania.

## Uruchamianie

```text
npm run dev
npm test
npm run build
```
