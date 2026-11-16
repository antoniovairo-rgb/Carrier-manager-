# Rapporto giro 202 — PO-461 (rassegna di fine partita: tabellino nella scheda 1, tasti fissi in fondo)

Ramo `sviluppo/giro202-rassegna2`, partito da `lavoro/195` (contiene il giro 200: rassegna a quattro schede, guardiano `rassegna-200`).
`GAME_VERSION` non toccato (nel codice resta quello di `lavoro/195`). Rosso unico: `window.__CPM_NO_G202` (torna la rassegna del giro 200).

Decisioni del PO (questionario 14/11) e cosa ne ho fatto:

| # | Decisione | Fatto |
|---|---|---|
| 1 | Dopo «Simula» niente rassegna, resta l'avviso col risultato | **non cambiato**; il guardiano lo verifica (C) |
| 2 | Tabellino della gara dalla scheda 4 alla **scheda 1**, accorciato, scheda 1 entro 1,3 schermi a 375×667 anche con molti eventi e con la festa, nessuna informazione tolta | **fatto** (vedi sotto, e il dubbio 1) |
| 3 | «Salta» = salva e torna alla carriera | **non cambiato** (verificato da `rassegna-200` B) |
| 4 | Avanti/Salta e puntini **fissi in fondo allo schermo** su ogni scheda, contenuto che scorre sopra senza finire coperto, area sicura rispettata | **fatto** |

## Misura prima

Sonda nuova `tests/visual/misura-202.mjs` (partita di campionato da professionista dal prompt vero, lib `partita-166`, pilota
seedato; festa forzata con `__CPM_FORCE_CEREMONY` e saltata con Invio; misura la scheda 1 come `rassegna-200`: (contenuto + piede) /
altezza della finestra; il tabellino, che stava nella scheda 4, si misura andando nella scheda 4).

**Partita con molti eventi.** Ho provato 13 partite (semi 7300-7306 a soli highlight, 7300-7305 intere a velocità 2): i momenti chiave
(marcatori, cartellini, cambi, pali, occasioni) sono stati **0-3** per partita. Le più alte: seme **7304** (2-0, 3 momenti) e 7301-7305
(3 momenti). La lista ha un tetto di 12 (`pushMatchEvent`, `slice(-12)`): una partita così non è uscita da nessuno dei 13 giri.

Prima (giro 200), seme 7300 con festa:

| Vista | scheda 1 (senza tabellino) | piede | tabellino della gara (scheda 4) |
|---|---|---|---|
| 360×640 | 1,14 schermi | fondo a **732 px su 640**: fuori schermo | — |
| 375×667 | 1,08 | fondo a 718 su 667: fuori schermo | **484 px** |
| 390×844 | 0,85 | fondo a 718 su 844: a metà schermo | — |
| PC 1366×768 | 0,93 | fondo a 733 su 768 | — |

Primo passo misurato (tabellino nella scheda 1 su due colonne, 343 px; 12 momenti chiave provocati; seme 7300; 375×667): **1,88
schermi**. Da lì le riduzioni sotto, ognuna rimisurata (1,67 → 1,57 → 1,50 con i 12 momenti; poi la partita vera).
Foto prima: `docs/sviluppo/giro202/prima-*.png` (braccio rosso del guardiano = rassegna del giro 200).

## Correzione (`src/15-live-match.jsx`, solo presentazione, tutto sotto `_g202()`)

- **Tabellino della gara nella scheda 1** (`data-cpm="tabellino202"`), fra risultato e pagella. Stesse voci di prima, stesso ordine,
  stesse barre colorate (`barra286-a/b`, più sottili): le voci stanno **in fila** («casa · voce · ospiti», più voci per riga dove ci
  stanno) invece di una per riga. 484 → **239 px** a 375×667.
- **Scheda 1 più bassa senza togliere righe**: la festa del trofeo diventa una banda (trofeo accanto al titolo, stesse tre righe);
  nella testata del risultato «competizione» e «fischio finale» stanno sulla stessa riga quando ci stanno, cifre del risultato 44 px
  invece di 64, margini più stretti; «PAGELLA» entra nel riquadro del voto; i momenti chiave vanno su due colonne (da tre in su), in
  ordine di minuto. Restano righe di testo distinte (`rassegna-200` «contenuto di prima»: 96/96).
- **Piede fisso in fondo**: nella fase `ended` lo scorrimento esterno (`.cpm-scroll`, aperto dal 7.184.3 per le fasi DOM) resta chiuso
  come nelle fasi col 3D; la rassegna riempie lo schermo, il contenuto scorre nella sua colonna e il piede (`data-cpm="piede202"`)
  sta sotto, con `padding-bottom: calc(… + env(safe-area-inset-bottom,0px))`.
- Strumento di sola prova: `window.__CPM_PUSH_MEV202(min,tipo,testo)` (solo `?cpmtest=1`, accanto a `__CPM_FORCE_CEREMONY`) per
  provocare i momenti chiave che il pilota non produce.

## Misura dopo (seme 7304, festa, 3 momenti chiave)

| Vista | scheda 1 | tabellino | piede in fondo (4 schede) | ultimo testo sopra il piede (scorsa fino in fondo) |
|---|---|---|---|---|
| 360×640 | **1,27** | 239 px | 640/640/640/640 | sì |
| 375×667 | **1,20** | 239 px | 667 ×4 | sì |
| 390×844 | **1,00** | 219 px | 844 ×4 | sì |
| PC 1366×768 | **0,98** | 115 px | 768 ×4 | sì |

Rosso `__CPM_NO_G202`, stessa partita: tabellino nella scheda 4, piede a 786/474/684/834 su 640 (360×640), bocciato su 2/2 viste.
Foto dopo: `docs/sviluppo/giro202/dopo-*.png` (schede 1 e 4 per vista).

## Guardiano nuovo `rassegna-202` (in `package.json`, catene `completa` e `carriera`, mappa di `src/15-`, lenti)

Verde: (A) mobile 360×640 · 375×667 · 390×844 e (B) PC 1366×768 sulla partita del seme 7304 con festa: tabellino nella scheda 1,
visibile, voci presenti; scheda 1 entro 1,3 schermi; su ognuna delle 4 schede il fondo del piede coincide col fondo della finestra
(±2 px), la colonna che scorre finisce sopra il piede e, scorsa fino in fondo, l'ultimo testo resta sopra il piede; il piede porta
`safe-area-inset-bottom`; puntini e Avanti/Salta; zero errori. (C) Simula: partita salvata, nessuna rassegna.
Rosso `__CPM_NO_G202`: deve essere bocciato. «Non giudicato» (partita non finita, meno di 3 momenti, rassegna o piede non trovati) = rosso.
`rassegna-200` **non modificato**: non misura la posizione del tabellino (controlla solo che le 4 schede contengano tutte le righe
della pagina unica, ovunque stiano).

## Controlli (uno alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`, `free -m`/`df -h` prima di ognuno)

Build finale: `node tools/build-src.mjs` + `node tools/check-src.mjs` → **IDENTICO BYTE PER BYTE** (7.413.660 byte, 21 frammenti).

| # | Controllo | Esito |
|---|---|---|
| 1 | `rassegna-202` | **verde 9/9**, rosso `__CPM_NO_G202` bocciato 2/2 (informativo: 12 momenti → 1,45) |
| 2 | `rassegna-200` | **verde 14/14** (contenuto di prima 96/96, schede 1,01 · 1 · 1,02 · 1), rosso `__CPM_NO_G200` bocciato |
| 3 | `rifiniture-200` | **verde 10/10**, rosso bocciato 10/10 |
| 4 | `solo-highlight-166` | **verde** (controllo 11 «tabellino, pagella e statistiche identici»: schermata finale 1793 = 1793 car.); rosso cade su 3, 7, 8 come deve |
| 5 | `momento-194` | **verde** (A, B, C), rossi bocciati |
| 6 | `gioca-188` | **verde 6 ok, 0 ko** (braccio verde; il rosso `CPM_ROSSO188` non rilanciato: area non toccata) |
| 7 | `griglia-mobile` | **uscita 0**, misura completa 14 schermate × 5 larghezze (non contiene la fase di fine partita) |
| 8 | `career-critical` | **uscita 0**, nessun ❌ |
| 9 | `test:logic` | **51/51** |
| 10 | `save-compat` | **12 pass · 0 fail** |

Le corse di `rassegna-200`, `rifiniture-200`, `momento-194` e `griglia-mobile` riscrivono foto/rapporti dei loro giri
(`docs/sviluppo/giro194`, `giro200`, `docs/collaudo-grafico/g0`): li ho riportati alla versione committata, non fanno parte di questo giro.

## Dubbi per il PO (nessuna decisione presa)

1. **«Tabellino (marcatori, cartellini, cambi)».** Il blocco che stava nella scheda 4 col titolo «Tabellino della gara» sono le
   **statistiche** delle due squadre (gol, possesso, tiri, xG, falli, ammonizioni, espulsioni…): l'ho spostato quello. Marcatori,
   cartellini e cambi con nome e minuto sono i **«Momenti chiave»**, che erano **già** nella scheda 1 (li ho messi su due colonne in
   ordine di minuto, non casa/ospiti: il tipo di evento non dice sempre di che squadra è — es. `red` vale sia per l'eroe sia per
   «Espulsione avversaria»). Se il PO intendeva un tabellino «alla giornale» per squadra (marcatori / ammoniti / sostituzioni casa e
   ospiti), è un blocco nuovo: da decidere.
2. **Con il tetto della lista (12 momenti chiave, provocati) la scheda 1 a 375×667 è 1,45 schermi**, sopra 1,3. Nelle 13 partite vere
   provate i momenti non hanno mai superato 3, quindi il guardiano giudica la partita vera più alta (seme 7304) e **stampa senza
   giudicarlo** il caso dei 12. Per stare sotto 1,3 anche con 12 momenti servirebbe togliere o spostare qualcosa dalla scheda 1
   (es. il commento del mister alla scheda 2): da decidere.
3. La scheda 1 a **360×640 è 1,27**: entro 1,3, ma col margine stretto (un nome di squadra o un commento del mister più lunghi la
   alzano). Il tetto 1,3 il PO l'ha dato per 375×667; il guardiano lo pretende su tutte e quattro le viste.
4. Per accorciare la scheda 1 ho rimpicciolito anche parti che il PO non ha nominato: festa (banda unica, trofeo 34 px), cifre del
   risultato (64 → 44 px), «PAGELLA» dentro il riquadro, voto 46 → 36 px. Nessun testo tolto. Da guardare sul telefono.
5. Il piede fisso vale per tutte le schede, anche per la scheda 4 col tasto «Torna alla Home»; su PC il piede sta in fondo alla
   colonna della partita (larghezza della colonna, non dello schermo).
6. Roadmap e `GAME_VERSION` non aggiornati (regola del giro); la riga di roadmap va scritta quando il giro viene promosso.
