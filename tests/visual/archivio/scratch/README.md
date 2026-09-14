# Scratch — sonde usa-e-getta

Script nati per **una** indagine e mai promossi a guardiano. Non li lancia nessuno: non sono nel gate, non
sono negli `npm scripts`, nessun altro file li referenzia (verificato). Stavano in `tests/visual/` col
prefisso `_` e inquinavano l'inventario degli strumenti veri — chi cercava «quale probe misura X» ne trovava
16 che non misurano più nulla.

**Regola:** una sonda che serve una volta sola nasce qui. Se una seconda indagine la riusa, allora è un
guardiano: si sposta in `tests/visual/`, prende un nome parlante (`<cosa>-test.mjs`) e un'intestazione che
dice quale difetto impedisce di tornare.

Possono essere obsoleti rispetto al gioco di oggi: prima di riusarne uno, verifica che gli hook che chiama
esistano ancora.
