# RAPPORTO — giro 354 · PO-522 «Vai al rinnovo →» mai coperto

Base: `lavoro/201` (= 7.999.209). Ramo: `sviluppo/giro354-rinnovo`. GAME_VERSION non toccata (rilascio del vagone).
Decisione PO (questionario, 18/11 16:40): l'evento della settimana che copre «Vai al rinnovo →» → **«Mai coperto»: l'evento
aspetta finché il rinnovo non è gestito.**

## 1. Misura (prima di toccare)

Sonda nuova `tests/visual/misura-354.mjs` (solo misura): salvataggio professionista a fine contratto, settimana 27 vissuta, tasto
«Vai al prossimo momento» → la corsa si ferma entrando nella settimana 28 sul rinnovo; per 3 s dopo la fermata registra quali
finestre (`.cpm-velo150`) compaiono e quando. `Math.random` seedato per corsa, così i due bracci vedono le stesse estrazioni.

| braccio | fermate sul rinnovo | con una finestra sopra il tasto | quale, quando |
|---|---|---|---|
| prima (`__CPM_NO_G354`) | 4/4 | **2** | «⚡ Un momento che ricorderai» (momento di carriera), **248-249 ms dopo la fermata** |
| dopo | 8/8 | **0** | le stesse due estrazioni (corse 1 e 3) risultano **tenute in coda** (`__CPM_ATT354.tenute = ["momento"]`) |

Causa (src/18): la corsa controlla il rinnovo (righe del passo di `_saltaStop163`) **prima** delle finestre aperte, ma le
finestre della settimana arrivano con un ritardo: il sorteggio dei momenti di carriera apre la finestra 450 ms dopo il cambio di
settimana (`setTimeout(...,450)`), mentre il passo della corsa gira ogni 220-320 ms. Quindi la fermata avviene prima e il momento
si apre dopo, sopra il riquadro col tasto. Stessa famiglia, con altri ritardi: eventi della settimana di `doAdvanceWeek`
(100/250 ms), «Il mister ti cerca» (900 ms), traguardi (1200 ms), verifica del mister.

## 2. Correzione (un punto: la coda `attesa354` in src/18)

- Alla fermata per «rinnovo» (`_saltaStop163`) si accende la coda, legata alla settimana in cui nasce
  (`stagione|settimana|vissuta|partite`).
- Finché la coda è attiva **e** il rinnovo è da gestire (`contractExpired`, oppure rinnovo aperto non rifiutato) **o** la
  trattativa è aperta, cinque finestre non si disegnano: settimana vissuta, momento di carriera, «Il mister ti cerca»,
  traguardo, verifica del mister. È lo stesso schema della «coda 23» che già esisteva (il momento aspetta l'offerta).
- **Nessun evento perso:** le finestre restano nel loro stato React, quindi anche nella copia salvata del giro 201
  (`scelte201`): a un ricaricamento riappaiono normalmente.
- Esce da sola appena il rinnovo è firmato o rifiutato; finisce anche alla prossima azione (cambio settimana/vissuta/partite)
  e al tocco su «Avanza»/«Simula», che **mostra** la finestra in coda invece di non fare nulla (il freno 23 bloccherebbe
  il tasto davanti a una finestra invisibile).
- Testimone solo-collaudo `window.__CPM_ATT354` (`attivo`, `chiave`, `tenute`). Rosso `window.__CPM_NO_G354` = come prima.

Fuori ambito, non toccati: src/03 (testi degli eventi), «Tua storia», src/14, src/12/16, l'intervista (non è nella coda),
offerte/chiamate (hanno la loro fermata).

## 3. Guardiano `npm run rinnovo-354` (riga MAPPA esistente `src/18-|src/10-`, tra i LENTI)

Pagina nuova per braccio; le finestre si **provocano** (momento «L'Offerta della Notte» + evento della settimana) invece di
sperare nel caso.
- Verde A: dopo la fermata «Vai al rinnovo →» è il primo elemento sotto il dito, nessuna finestra, entrambe tenute.
- Verde B: il tasto porta all'Agente (ancora scoperto) → rinnovo rifiutato col gestore vero → la finestra si apre; si risponde a
  entrambe (escono una alla volta, coda 23) e il momento risulta vissuto (`momentsFired`).
- Verde C: con la coda attiva, «Avanza» mostra la finestra e non salta la settimana.
- Rosso `__CPM_NO_G354`: «SETTIMANA 28 · FC MERSEYSIDE» sopra il tasto → **bocciato**. Mancata fermata o finestre non
  provocate = «non giudicato» = rosso.

## 4. Verifica

`node ci-runner.mjs giro rinnovo-354 career-critical` (+ 17 sentinelle): esito in fondo.

## Dubbi per il PO

1. **Quali finestre aspettano.** Ho messo in coda le cinque finestre «di racconto» (settimana, momento, mister, traguardo,
   verifica). Opzioni: **(a) queste cinque — consigliata e applicata**; (b) solo la settimana vissuta e il momento di carriera
   (le due viste davvero); (c) anche intervista e chiamata della Nazionale (sono decisioni con la loro urgenza e la loro
   fermata: rischio di nasconderle).
2. **Il tocco su «Avanza» con la coda.** Opzioni: **(a) il tocco mostra la finestra in coda e non avanza — consigliata e
   applicata** (con una finestra aperta «Avanza» già non avanza: freno 23); (b) il tocco avanza e la finestra si apre dopo;
   (c) «Avanza» spento con motivo «Prima rispondi al rinnovo» finché il rinnovo non è gestito.
3. **Motivo «Prima rispondi al rinnovo» sotto il tasto spento (parte B2 di agente-198).** Non è il tasto «Vai al rinnovo →»
   e non l'ho toccato: lì la coda non si accende (non c'è fermata). Opzioni: **(a) lasciarlo com'è — consigliata e applicata**;
   (b) accendere la coda anche quando il rinnovo è aperto senza corsa; (c) decidere dopo un collaudo sul telefono.
