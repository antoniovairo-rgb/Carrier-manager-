# Censimento PC delle schermate — giro 289 (PO-548)

Decisioni PO del 19/11: «Censimento PC di tutte» e «Riquadro compatto». Base: `lavoro/198`, ramo `sviluppo/giro289-pc`.
Strumento: `tests/visual/pc-289.mjs` (`npm run pc-289-censimento`), Chromium headless a **1366×768** e **1920×1080**, mouse e
tastiera, salvataggio di prova `lib/banco-g0.mjs` (stagione 12, Lega B) e provini conclusi con 2 gol e voto medio 6,8 (la riga della foto
del PO). Non è un PC vero. La tabella qui sotto è **dopo** il giro 289; i numeri **prima** sono in `censimento-prima.json` e le foto
«prima» in `foto-prima/` (stessa sonda col rosso `__CPM_NO_G289`).

## Cosa misura (dal DOM, non a occhio)

| Sigla | Misura | Soglia |
|---|---|---|
| V | riquadro decorato (fondo, bordo od ombra) alto più di 2× il suo contenuto (unione dei rettangoli di testi e immagini) e con più di 120 px di vuoto; si conta il più interno; esclusi gli strati decorativi `aria-hidden` e i velini assoluti senza tocco | 0 |
| L | righe di testo rese oltre 100 caratteri (caratteri stimati con la larghezza media del nodo; i pezzi della stessa riga dello stesso blocco si sommano) | 0 |
| P | pulsanti con la stessa scritta e stili diversi (fondo, colore, maiuscolo, peso, bordo) | 0 |
| A | tasto largo (≥ 300 px) staccato più di 160 px dall'ultimo contenuto sopra di lui nella stessa colonna | 0 |
| C | colonna non centrata: margini sx/dx del contenuto nell'area libera dalla barra laterale, scarto > 40 px | 0 |
| S | la pagina scorre e il vuoto dei riquadri segnati basterebbe a non farla scorrere | no |

Radice della misura: lo strato fisso in primo piano se c'è (finestre col velo, Opzioni), altrimenti la pagina; gli elementi dentro uno
strato fisso (barra laterale) non contano per la colonna.

## Prima → dopo (solo le righe che cambiano)

| Schermata | 1366 prima → dopo | 1920 prima → dopo |
|---|---|---|
| Offerte ricevute | V 2 (890/79 px) · L max 231 · P 1 («Scegli» 2 stili) → tutto 0, max 85 | V 2 · L max 246 · P 1 → tutto 0, max 85 |
| Stagione · Coppe (vuota) | V 1 (874/220 px) · L 3, max 168 → 0, max 88 | V 1 · L 3, max 216 → 0, max 88 |
| Stagione · Calendario | L 1, max 172 → 0, max 87 | uguale |
| Stagione · Classifica | L 1, max 109 → 0, max 82 | uguale |
| Carriera · Profilo | L 2, max 187 → 0, max 87 | L 1, max 239 → 0, max 87 |
| Carriera · Nazionale | L 1, max 104 → 0, max 83 | uguale |
| Agente | L 2, max 124 → 0, max 82 | uguale |
| Fine stagione | L 3, max 137 → 0, max 83 | uguale |

## Tabella completa (dopo)

| Schermata | Larghezza | V riquadri vuoti (alto/contenuto) | L righe >100 car. | P pulsanti gemelli | A azione staccata | C margini sx/dx | S scorre px | Foto |
|---|---|---|---|---|---|---|---|---|
| Home fuori carriera | 1366 | 1 — 528/202 px div «K⚽rward Elite SIMULATORE DI CARRIERA CAL» | 1 (max 115) | 0 | «NUOVA CARRIERA» 556 px | 48 / 54 (larga 1045) | 0 | [foto](foto/1366/home.jpg) |
| Home fuori carriera | 1920 | 1 — 840/202 px div «K⚽rward Elite SIMULATORE DI CARRIERA CAL» | 1 (max 115) | 0 | «NUOVA CARRIERA» 868 px | 48 / 54 (larga 1599) | 0 | [foto](foto/1920/home.jpg) |
| Opzioni | 1366 | 0 | 0 (max 48) | 0 | 0 | 319 / 319 (larga 728) | 233 | [foto](foto/1366/impostazioni.jpg) |
| Opzioni | 1920 | 0 | 0 (max 48) | 0 | 0 | 596 / 596 (larga 728) | 0 | [foto](foto/1920/impostazioni.jpg) |
| Creazione | 1366 | 0 | 0 (max 72) | 0 | 0 | 179 / 179 (larga 1008) | 138 | [foto](foto/1366/creazione.jpg) |
| Creazione | 1920 | 0 | 0 (max 72) | 0 | 0 | 456 / 456 (larga 1008) | 0 | [foto](foto/1920/creazione.jpg) |
| Provini · prima del provino | 1366 | 0 | 0 (max 97) | 0 | 0 | 369 / 369 (larga 627) | 0 | [foto](foto/1366/provini.jpg) |
| Provini · prima del provino | 1920 | 0 | 0 (max 97) | 0 | «⚡ INIZIA IL PROVINO» 250 px | 646 / 646 (larga 627) | 0 | [foto](foto/1920/provini.jpg) |
| Offerte ricevute | 1366 | 0 | 0 (max 85) | 0 | 0 | 271 / 271 (larga 824) | 0 | [foto](foto/1366/offerte.jpg) |
| Offerte ricevute | 1920 | 0 | 0 (max 85) | 0 | 0 | 548 / 548 (larga 824) | 0 | [foto](foto/1920/offerte.jpg) |
| Home di carriera | 1366 | 0 | 1 (max 139) | 0 | 0 | 54 / 54 (larga 1012) | 1078 | [foto](foto/1366/dashboard.jpg) |
| Home di carriera | 1920 | 0 | 1 (max 139) | 0 | 0 | 176 / 176 (larga 1322) | 800 | [foto](foto/1920/dashboard.jpg) |
| Stagione · Classifica | 1366 | 0 | 0 (max 82) | 0 | 0 | 54 / 54 (larga 1012) | 481 | [foto](foto/1366/stagione-classifica.jpg) |
| Stagione · Classifica | 1920 | 0 | 0 (max 82) | 0 | 0 | 176 / 176 (larga 1322) | 203 | [foto](foto/1920/stagione-classifica.jpg) |
| Stagione · Calendario | 1366 | 0 | 0 (max 87) | 0 | 0 | 54 / 54 (larga 1012) | 524 | [foto](foto/1366/stagione-calendario.jpg) |
| Stagione · Calendario | 1920 | 0 | 0 (max 87) | 0 | 0 | 176 / 176 (larga 1322) | 246 | [foto](foto/1920/stagione-calendario.jpg) |
| Stagione · Coppe | 1366 | 0 | 0 (max 88) | 0 | 0 | 54 / 54 (larga 1012) | 0 | [foto](foto/1366/stagione-coppe.jpg) |
| Stagione · Coppe | 1920 | 0 | 0 (max 88) | 0 | 0 | 176 / 176 (larga 1322) | 0 | [foto](foto/1920/stagione-coppe.jpg) |
| Club · rosa | 1366 | 0 | 0 (max 69) | 0 | 0 | 54 / 54 (larga 1012) | 399 | [foto](foto/1366/club.jpg) |
| Club · rosa | 1920 | 0 | 0 (max 69) | 0 | 0 | 176 / 176 (larga 1322) | 121 | [foto](foto/1920/club.jpg) |
| Carriera · Profilo | 1366 | 0 | 0 (max 87) | 0 | 0 | 54 / 54 (larga 1012) | 605 | [foto](foto/1366/carriera-profilo.jpg) |
| Carriera · Profilo | 1920 | 0 | 0 (max 87) | 0 | 0 | 176 / 176 (larga 1322) | 327 | [foto](foto/1920/carriera-profilo.jpg) |
| Carriera · Nazionale | 1366 | 0 | 0 (max 83) | 0 | 0 | 54 / 54 (larga 1012) | 246 | [foto](foto/1366/carriera-nazionale.jpg) |
| Carriera · Nazionale | 1920 | 0 | 0 (max 83) | 0 | 0 | 176 / 176 (larga 1322) | 0 | [foto](foto/1920/carriera-nazionale.jpg) |
| Agente | 1366 | 0 | 0 (max 82) | 0 | 0 | 54 / 54 (larga 1012) | 553 | [foto](foto/1366/agente.jpg) |
| Agente | 1920 | 0 | 0 (max 82) | 0 | 0 | 176 / 176 (larga 1322) | 275 | [foto](foto/1920/agente.jpg) |
| Ufficio | 1366 | 0 | 5 (max 158) | 0 | 0 | 54 / 54 (larga 1012) | 332 | [foto](foto/1366/ufficio.jpg) |
| Ufficio | 1920 | 0 | 5 (max 169) | 0 | 0 | 176 / 176 (larga 1322) | 0 | [foto](foto/1920/ufficio.jpg) |
| Finestra · offerta di trasferimento | 1366 | 0 | 0 (max 50) | 0 | 0 | 423 / 423 (larga 520) | 262 | [foto](foto/1366/offerta-trasferimento.jpg) |
| Finestra · offerta di trasferimento | 1920 | 0 | 0 (max 50) | 0 | 0 | 700 / 700 (larga 520) | 0 | [foto](foto/1920/offerta-trasferimento.jpg) |
| Finestra · il mister ti cerca | 1366 | 0 | 0 (max 63) | 0 | 0 | 423 / 423 (larga 520) | 0 | [foto](foto/1366/mister.jpg) |
| Finestra · il mister ti cerca | 1920 | 0 | 0 (max 63) | 0 | 0 | 700 / 700 (larga 520) | 0 | [foto](foto/1920/mister.jpg) |
| Cerimonia 2D · festa del trofeo | 1366 | 0 | 0 (max 33) | 0 | 0 | 601 / 601 (larga 164) | 0 | [foto](foto/1366/festa-trofeo.jpg) |
| Cerimonia 2D · festa del trofeo | 1920 | 0 | 0 (max 33) | 0 | 0 | 878 / 878 (larga 164) | 0 | [foto](foto/1920/festa-trofeo.jpg) |
| Fine stagione | 1366 | 0 | 0 (max 83) | 0 | 0 | 54 / 54 (larga 1259) | 671 | [foto](foto/1366/fine-stagione.jpg) |
| Fine stagione | 1920 | 0 | 0 (max 83) | 0 | 0 | 54 / 54 (larga 1813) | 393 | [foto](foto/1920/fine-stagione.jpg) |

## Annotate e non toccate (fuori ambito per mandato)

- **Home fuori carriera** (giro 284): V 1 (riquadro del menu 840 px per 202 di contenuto a 1920), L 1 (115 caratteri, «Crea il tuo
  calciatore, supera i provini…»), A 1 («NUOVA CARRIERA» staccato 556/868 px dal contenuto).
- **Home di carriera** (giro 284): L 1 (139 caratteri, «2 assist tuoi nelle ultime gare…»).
- **Pre-partita** (giro 287), **menu a tendina** (giro 284), **scritte «[0]»** (giro 288): non misurati né toccati.
