# Rapporto giro 209 — PO-470 «niente ripiego 2D: se il 3D non va, avvisare il giocatore»

Ramo `sviluppo/giro209-avviso3d`, partito da `lavoro/195` (3247f9e, 7.999.195). `GAME_VERSION` non toccata (regola fissa).
Rosso unico: `window.__CPM_NO_G209` (= comportamento della 194: ripiego 2D). Guardiano nuovo: `npm run avviso3d-209`.

Decisione del PO (15/11): «Eviterei proprio il ripiego 2D, se non va il 3D avvisare il player che non può procedere perché ha la
connessione lenta o non ne ha proprio, altrimenti entriamo in un vortice infinito e impattante».

## 1. Misura prima (build di `lavoro/195`)

Sonda `tests/visual/avviso3d-209.mjs` in modalità misura (`CPM_MISURA=1`), percorso vero: salvataggio da professionista con una gara
di Coppa (ottavi) in settimana → `__CPM_CAREER.playMatch` → pilota seedato. Due casi, telefono 375×667 e PC 1366×768:

- **lento**: i file `assets/cgtrader-*.glb` restano appesi (non rispondono) e il tetto è basso (`__CPM_CAP196=4000`);
- **fallito**: gli stessi file falliscono (richiesta abortita), tetto di sempre (120 s).

| caso | telefono 375×667 | PC 1366×768 |
|---|---|---|
| lento | partita **in 2D** dopo 12,2 s, fase `playing`, nessun avviso | partita **in 2D** dopo 17,5 s, nessun avviso |
| fallito | partita **in 2D** dopo 10,3 s, nessun avviso | partita **in 2D** dopo 13,0 s, nessun avviso |

0 errori di pagina. Uscita: `giro209/prima.txt`; foto `giro209/prima-*.png` (il campo dall'alto al posto della scena dell'eroe).
I tempi contano dall'accensione del pilota (non dall'apertura della pagina) e comprendono pre-partita e formazioni.

## 2. Correzione (src/15, src/18 — rosso `__CPM_NO_G209`)

**src/15 (LiveMatch)**
- `_vai2D196` (l'unico punto da cui partiva il 2D: tetto `__CPM_CAP196` superato o `__CPM_PRONTI196().fallito`) ora, per il
  giocatore, **non passa al 2D**: apre l'avviso (`_avv209`). Il ripiego 2D resta nel codice e si accende solo con
  `?cpmtest=1` + `window.__CPM_RISERVA2D209` (bandiera di collaudo dichiarata) oppure col rosso `__CPM_NO_G209`.
- Sotto l'avviso il 3D resta fermo e non si disegna (`__CPM_ATT196` tenuto acceso), il cronometro resta fermo (trattenuta
  `corpiHold232` mantenuta) e i controlli di prontezza si fermano: decide il giocatore.
- **Avviso** (`data-cpm="avviso3d209"`, `role="alertdialog"`), opaco, con area sicura del telefono (`env(safe-area-inset-*)`):
  - titolo «La partita in 3D non si carica»;
  - lento: «Internet va troppo piano: i giocatori non sono arrivati in tempo.» · fallito: «Non riusciamo a scaricare i giocatori.
    Forse internet non c'è.»;
  - «Puoi riprovare, oppure simulare la partita e vedere subito il risultato.»;
  - due tasti larghi alti 60 px: **↻ Riprova** («Carica di nuovo la partita in 3D») e **Simula** («La partita si gioca da sola:
    vedi subito il risultato»).
- **Riprova** (`_riprova209`): rimonta la scena 3D da capo (stessa chiave `glbTry` del «Riprova» 7.264), azzera lo stato di
  caricamento e riarma l'attesa da zero con lo stesso tetto (l'effetto dell'ingresso ora dipende anche da `glbTry`).
- **Simula** (`_simula209`, una volta sola): toglie la ripresa `cpm-match-resume` e chiama `onSimula209`; senza quella prop (provino)
  costruisce il risultato col motore (`simulateMatch` + `_pSimStats` + `votoSimEroe`, seedati) e lo passa a `onMatchEnd`.
- L'avviso del 7.264 («Modelli 3D non caricati», CH38 lento o in errore, coi tasti «Riprova» e «Gioca la partita in 2D») per il
  giocatore è sostituito dallo stesso avviso nuovo, e il suo tetto «lento» passa da 12 s al tetto del PO (`__CPM_CAP196`, 120 s).
  Col rosso resta com'era.
- Correzione collaterale: `glbFail`/`glbTry` dichiarati prima del blocco 196 (servivano all'effetto dell'ingresso; la prima stesura
  dava `ReferenceError` ed è stata vista dal guardiano).

**src/18 (CareerApp)** — prop `onSimula209`: chiude la partita (ripresa tolta, `_playingMdRef` a null, si torna alla home) e dopo
80 ms chiama lo **stesso percorso del tasto Simula**: `simulateNationsCupMatch` / `simulateEuroMondialeMatch` per i tornei della
Nazionale, `simulateAndAdvance` per tutto il resto (campionato, coppa, coppe europee, amichevole della Nazionale). Quel percorso
segna la gara giocata, scrive la voce di storico, avanza la settimana e mostra il suo avviso del risultato. `onMatchEnd` della
partita dal vivo non è mai partito: niente doppio conteggio.

Nessun campo nuovo nel salvataggio, nessun asset nuovo.

## 3. Dopo

Uscita `giro209/guardiano.txt`, foto `giro209/dopo-*.png`.

| caso | telefono 375×667 | PC 1366×768 |
|---|---|---|
| fallito | avviso «fallito» dopo 11,7 s, mai 2D | avviso «fallito» dopo 13,5 s, mai 2D |
| fallito → Riprova | 6 richieste CGTrader nuove, l'avviso torna (il file fallisce ancora) | idem |
| fallito → Simula | carriera, «Quarti di Finale (sim): 1–2 vs FC Valmora — ❌ ELIMINATO», matchHistory 0→1, Coppa 1→2, settimana 12→13, stabile dopo 8 s e dopo il ricaricamento, nessuna ripresa | idem |
| lento | avviso «lento» dopo 12,9 s, 3D sospeso, mai 2D | avviso «lento» dopo 17,1 s |
| lento → Riprova (rete tornata) | tela 3D nuova, corpi pronti in 3,2 s, partita in 3D fino a `hl_choose` | tela nuova, pronti in 15,0 s, fino a `hl_intro` |

Tasti: 321×60 px (telefono), 340×60 px (PC), dentro lo schermo. 0 errori di pagina.

## 4. Guardiano `avviso3d-209`

Verde (telefono e PC, per ciascuno fallito+Simula e lento+Riprova): avviso col motivo giusto (fallito entro 20 s), mai `__CPM_2D196`
né campo dall'alto al posto di una scena 3D (la mappa dall'alto del gioco fluido `playing` è normale e non conta), tasti ≥ 48 px
dentro lo schermo, testo; lento: l'avviso resta e il 3D resta sospeso; Riprova: un tocco, tela 3D nuova, corpi pronti e partita in
3D; fallito: Riprova richiede di nuovo i file e l'avviso torna; Simula: un tocco, carriera, avviso del risultato, matchHistory +1,
voce di Coppa +1, gara giocata, settimana +1, dopo 8 s e dopo il ricaricamento, nessuna ripresa; 0 errori.
Rosso (`__CPM_NO_G209`, telefono, entrambi i casi): deve essere bocciato. «Non giudicato» = rosso.

Esito: **verde 36/36 · rosso bocciato** (fallito: 2D dopo 9,6 s; lento: 2D dopo 12,7 s).

Registrato in `package.json` e in `ci-runner.mjs`: catene **completa** e **carriera** (una volta sola ciascuna, verificato), mappa
di `src/15` e lenti; `node --check` ok.

Sonde aggiornate solo per accendere il ripiego 2D dal banco (nessuna soglia toccata): `misura-205.mjs` (quindi `riserva2d-205`)
mette `__CPM_RISERVA2D209=1` accanto a `__CPM_CAP196=1`; `tpose-196.mjs` lo mette solo quando si passa `CPM_CAP196` (il suo ramo 2D).

## 5. Controlli (uno alla volta, `free -m` e `df -h` prima di ciascuno)

| controllo | esito |
|---|---|
| avviso3d-209 | verde 36/36, rosso bocciato |
| tpose-196 | verde 4/4 scenari (0 T-pose, 0 non CGTrader, 0 procedurali; attesa vista, nessun 2D), rosso visto (105 fotogrammi sbagliati) |
| riserva2d-205 | verde 36/36, rosso bocciato (porta 0%, campo congelato 100%) |
| simula-v2 | verde, rosso atteso visto |
| gioca-188 | verde 6 ok, 0 ko |
| rassegna-200 | verde 14/14, rosso bocciato |
| rassegna-202 | verde 9/9, rosso bocciato |
| highlight-95 | **verde per somma di tre parti** (`CPM_SALVA=s1`, `s5`, `s12`; registri `giro209/h95-*.log`), come nel giro 207. Verde: 110 highlight, **0 difetti**, D4 0, 0 non giudicabili, passaggi 32 giudicati (pavimento 12) e 29 arrivati = 90,6% (pavimento 70%), finte 4 (pavimento 4). Rosso: difetti visti in ogni parte (74 · 48 · 71). ⚠️ Ogni parte da sola esce `❌` **solo** per i pavimenti di copertura pensati per la passata intera (s1: 2 finte; s5: 8 passaggi, 62,5% arrivati — identico al giro 207; s12: 11 passaggi, 0 finte): il verde nasce dalla somma, non da un'uscita 0. Rispetto al 207 la somma ha 110 highlight invece di 118 e 4 finte invece di 6; i registri per parte del 207 non sono nel repo, quindi non posso dire quale parte è cambiata |
| career-critical | verde: 12 passi, 0 ❌ (una prima corsa fermata dal tetto di 10 minuti della chiamata non vale ed è stata rifatta da capo in sottofondo con attesa sul file) |
| test:logic | 51/51 |
| save-compat | 12 pass · 0 fail |

Le sonde di altri giri riscrivono le loro foto (`giro196`, `giro200`, `giro202`): riportate come erano.

Incidente di sessione, dichiarato: per verificare `ci-runner.mjs` ho per sbaglio importato il modulo, che ha avviato una catena;
l'ho fermata entro due minuti, nessun processo rimasto, nessun file cambiato (verificato con `git status`). Non è un esito.

## Dubbi per il PO (non decisi)

1. **Simula a partita iniziata.** Se il 3D cede a metà gara (attesa prima di una scena dell'eroe), «Simula» rigioca col motore
   l'**intera** partita: il punteggio dal vivo fino a quel minuto si perde. È la scelta più semplice e senza doppio conteggio; se il
   PO preferisce tenere il parziale, va deciso.
2. **Simula dalla panchina.** Se la gara dal vivo partiva dalla panchina (`benchStart`), non ho verificato come il percorso Simula
   tratta quella decisione del mister (il prompt è già chiuso quando si arriva all'avviso): non posso confermare che la presenza
   venga contata nello stesso modo.
3. **Provino.** Nel provino «Simula» dà un risultato del motore al riepilogo del provino (gol, assist, voto). Non so se il PO vuole
   che un provino si possa simulare; ho scelto di non bloccare mai il percorso.
4. **Avviso del CH38 a 12 s.** Per il giocatore il vecchio avviso «Modelli 3D non caricati» (7.264) è sostituito dal nuovo e scatta
   al tetto del PO (120 s) invece che a 12 s. Durante quell'attesa si vede il riquadro «Le squadre completano il riscaldamento…».
5. **Testi e aspetto**: proposta mia (icona 📶, due tasti uno sotto l'altro). Nessuna alternativa fatta scegliere.
6. Dopo un «Riprova» su rete ancora assente l'avviso torna quasi subito (il file fallisce in meno di un secondo): è il comportamento
   chiesto («subito, senza aspettare»), ma visivamente può sembrare che il tasto non abbia fatto nulla.
7. Con «3D spento» dall'utente (`cpm-glb=0`) nulla cambia (come nel giro 196).
8. Non ho aggiunto la riga in `docs/governo/ROADMAP.md`: il giro non ha numero di versione (`GAME_VERSION` fuori perimetro) e non è
   promosso su `main`.
