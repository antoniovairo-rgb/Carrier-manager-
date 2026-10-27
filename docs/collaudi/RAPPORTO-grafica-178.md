# Rapporto collaudo grafico 7.999.178 (PO-299)

Richiesta PO 27/10: «check molto approfondito sulla grafica di tutte le schermate e degli highlights, contorni delle figurine, impulsi, scene 3D; riduci lo spazio dei box se non lo ha già fatto».
Base: `lavoro/178` (7.999.178 assemblata con `node tools/build-src.mjs`, non pubblicata). Collaudo DAL VIVO, Chromium headless (software GL), GLB acceso per le scene 3D. **Non ho toccato `src/`, `GAME_VERSION`, `docs/governo/`.**
Strumenti (tutti in `tests/visual/`): `c178-graf-lib.mjs` (rilevatore in pagina), `c178-graf-schermate.mjs` + `c178-graf-schermate2.mjs` (censimento), `c178-graf-hl.mjs` (highlight 3D), `c178-graf-partita.mjs` (partita intera), `c178-graf-analisi.mjs`. Foto: `docs/collaudi/foto-grafica-178/` (44 file; le foto «lunghe» sono pagine intere con viewport alzato; i «fogli» di highlight hanno 6 fotogrammi: apertura, +0,5 s, +1,4 s, +2,4 s, +3,6 s di tempo di scena, banner d'esito).

## Sintesi

- **Schermate censite: 49 voci × 4 formati** (telefono 412×915, tablet 820×1180 verticale, tablet 1180×820 orizzontale, PC 1440×900) + partita completa su telefono e PC (26 fotografie per formato). Elenco e esito nella sezione «Censimento».
- **Highlight 3D: 68 esecuzioni al telefono** (2 serie da 34 con semi di partita diversi: «Marco Rossi» e «Luca Verdi»; 10 famiglie: tiro, testa, volée, cross, passaggio/assist, dribbling, contrasto, rigore, punizione, difesa) + 10 su PC + 4 su tablet verticale = **82**. Tutte arrivate a `hl_result`, 0 errori di pagina, 0 scene senza portiere.
- **Difetti: 5 alti, 12 medi, 7 bassi** (tabella D1…D24).
- **Spazio fra i box (PO-296):** la riduzione c'è e regge sulle schede principali (mediana 7,8 px, massimo 9 px). **Restano larghi:** Opzioni di carriera (15,7 px), Fine stagione/offerte (16,8 px su telefono e tablet verticale), finestre di intervista (12 px) e primo incontro col procuratore (13,4 px).
- Nessuno scorrimento orizzontale, nessun elemento fuori schermo, nessuna immagine rotta, nessun «undefined/NaN», nessun carattere sostitutivo, testo minimo 11 px (tranne 15 nodi <10 px per formato, vedi D20) in nessuno dei 4 formati.

## Tabella difetti

Gravità: **alta** = si vede subito e rovina l'esperienza o la regola «highlight perfetti»; **media** = difetto chiaro ma non bloccante; **bassa** = rifinitura. «Foto» è relativa a `docs/collaudi/foto-grafica-178/`.

| ID | Gr. | Schermata | Formato | Cosa si vede | Come riprodurlo | Foto | File:riga probabile |
|---|---|---|---|---|---|---|---|
| D1 | alta | Tutte le schede di carriera | Tablet verticale 820 (601–899 px) | La barra inferiore (Sostieni/Idee + navigazione) è larga 600 px mentre il contenuto è ~786 px: ai lati della barra restano visibili le card che scorrono sotto («Il mon…» tagliato a sinistra, freccia › a destra fuori dalla barra). | Salvataggio SAVE di `lib/banco-g0.mjs`, viewport 820×1180, scheda Home. | `foto-grafica-178/tabv-barra-inferiore.jpg`, `foto-grafica-178/tabv-home.jpg` | `src/19-app-root.jsx:933` (`.cpm-nav-bar … max-width:600px`; la sidebar scatta solo da 900 px, riga ~937) |
| D2 | alta | Highlight 3D (dribbling gi18) | PC 1440×900 | L'eroe esce dal quadro: in 5 fotogrammi su 6 si vede solo la testa con l'etichetta «10 ROSSI» sul bordo inferiore (quota fuori quadro 0,96); metà dell'immagine è tribuna. Anche gi31 (0,26). Nel formato verticale le stesse scene hanno l'eroe in quadro. La camera è tarata sul verticale. | `C178_FORMATO=pc C178_LISTA="18:riesce" node tests/visual/c178-graf-hl.mjs` | `foto-grafica-178/hl-pc-gi18-eroe-tagliato.jpg` | `src/12-three-match-view.jsx` (taglia/bersaglio di camera negli highlight, «taglia è regia» 7.505) |
| D3 | alta | Highlight punizione/cross | Telefono | A fine azione la camera inquadra tribuna, bandierina d'angolo o campo vuoto: l'eroe è fuori quadro nel 50-68% dei fotogrammi (gi15 «Giocata corta» 0,50 · gi15 «Cross alto/portiere blocca» 0,68). Il risultato («occasione creata», «il portiere blocca») non si vede. | `C178_LISTA="15:parata,15:gol"` | `foto-grafica-178/hl-gi15-punizione-camera-sul-vuoto.jpg`, `foto-grafica-178/hl-gi15-gi16.jpg` | `src/12-three-match-view.jsx` (camera highlight su set-piece) |
| D4 | alta | Highlight rigore (esito parata) | Telefono | Al +0,5 s il portiere è già a terra sul lato mentre il pallone è ancora ai piedi dell'eroe; al +1,4 s è di nuovo in piedi al centro e il tiro parte dopo: tuffo anticipato e poi annullato (esito scritto «parata» ma il 3D non mostra una parata). Osservato su gi5 (serie B); da confermare sulle altre 5 scene di rigore. | `C178_LISTA="5:parata" node c178-graf-hl.mjs` | `foto-grafica-178/hl-rigore-portiere-prima-del-tiro.jpg` | `src/12-three-match-view.jsx` (tuffo GK sui rigori; famiglia codici 111/112) |
| D5 | alta | Highlight, tutte le famiglie | Telefono | **Compenetrazione fra corpi**: in 21 scene su 68 almeno 4 fotogrammi con due giocatori a meno di 0,45 u; in 7 scene a meno di 0,1 u (gi3 assist: 0,02 u per 24 fotogrammi; gi15 punizione 0,05; gi13 0,07; gi63 0,07; gi16 0,08). Anche all'apertura: corpi sovrapposti (gi3, gi31, gi128: etichette «10 ROSSI / 10 SANTORO / 2 BIANCHI» impilate). | `c178-graf-hl.mjs` (campo `an.compFrames`/`compMin` in `risultati.json`) | `foto-grafica-178/hl-gi3-assist-compenetrazione.jpg`, `foto-grafica-178/hl-gi5-gi58-gi13.jpg`, `foto-grafica-178/hl-gi31-gi128-gi5.jpg` | `src/12-three-match-view.jsx` (repulsione anti-ammucchiata, esenzione dei fotogrammi di festa/esito) |
| D6 | media | Highlight, banner d'esito | Telefono | Il pannello d'esito sale fino a 40vh e copre piedi e pallone dell'eroe in molte scene (gi26, gi71, gi31, gi136: eroe a metà sotto il pannello). | qualunque highlight a `hl_result` | `foto-grafica-178/hl-gi26-gi71-gi100.jpg`, `foto-grafica-178/hl-gi31-gi128-gi5.jpg` | `src/15-live-match.jsx:11705` (`maxHeight:"40vh"`) |
| D7 | media | Highlight, banner d'esito | Telefono | Il titolo del banner è troncato con «…»: «Dribbling nett…», «Blocca il cross con il cor…», «Scatto diagonale —…», «Giratone e condu…». Ricorre in almeno 12 scene su 68. | come sopra | `foto-grafica-178/hl-gi18-gi123-gi174.jpg`, `foto-grafica-178/hl-gi30-gi136.jpg` | `src/15-live-match.jsx:11692-11705` |
| D8 | media | Highlight | Telefono, PC | Camera troppo alta/larga: 35-45% del quadro è tribuna e tabellone 3D, il tabellone è quasi sempre tagliato dal bordo o dalla barra del risultato; in gi30, gi128, gi100 si vede cielo ed esterno dello stadio. A fine scena la camera si allontana e l'eroe diventa una figurina (gi64, gi128). | qualunque highlight | `foto-grafica-178/hl-gi30-gi136.jpg`, `foto-grafica-178/hl-gi64-testa-parata.jpg`, `foto-grafica-178/hl-gi6-volee.jpg` | `src/12-three-match-view.jsx` (pitch/quota camera) |
| D9 | media | Highlight gol | Telefono | La scritta «GOOOOL!» è rossa su cartelloni rossi/marroni, inclinata e in parte coperta dalla traversa: poco leggibile (gi100, gi103, gi1, gi5). | forzare un gol | `foto-grafica-178/hl-gi26-gi71-gi100.jpg`, `foto-grafica-178/hl-gi5-gi58-gi13.jpg` | `src/12-three-match-view.jsx` (sprite «GOOOOL» in porta) |
| D10 | media | Highlight | Telefono, PC | Etichette dei giocatori (numero+cognome) di taglia molto diversa: giganti in primo piano («9 COLOMBO», «11 FERRARI», «7 LUCA») e coprono i corpi; a coppie si sovrappongono o si tagliano («2 PELLEGRIN» sotto «7 LUCA»). | gi27, gi32, gi123 | `foto-grafica-178/hl-gi118-gi32.jpg`, `foto-grafica-178/hl-pc-gi0.jpg` | `src/12-three-match-view.jsx` (sprite nome, scala per distanza) |
| D11 | media | Highlight: salti del pallone | Telefono | 3 scene su 68 con teletrasporto del pallone (>3 u in <0,06 s di scena, fuori dagli stacchi): gi16 cross, gi16 intercetto, gi89 intercetto (2 salti ciascuna). | `an.saltiPalla` | `foto-grafica-178/hl-gi15-gi16.jpg` | `src/12-three-match-view.jsx` (post-arco cross/BG) |
| D12 | media | Highlight PC | PC 1440×900 | Il pannello destro (≈30% dello schermo) è quasi vuoto: tre righe di testo minuscole in alto e il resto nero; l'esito è una striscia rossa sottile. | highlight su PC | `foto-grafica-178/hl-pc-gi0.jpg`, `foto-grafica-178/partita-pc-sequenza.jpg` | `src/15-live-match.jsx` (colonna laterale `_largo292`) |
| D13 | media | Ingresso in campo | Telefono, PC | Il logo «Korward Elite» del cerchio di centrocampo è specchiato/capovolto vista dalla camera (walkout t3-t8); a t20 resta il pittogramma. | partita di carriera, fase `walkout` | `foto-grafica-178/partita-tel-pre-ingresso-gioco.jpg`, `foto-grafica-178/partita-pc-sequenza.jpg` | `src/16-scene-3d-cerimonie.jsx` / `src/12-three-match-view.jsx` (decal del cerchio) |
| D14 | media | Fischio finale (cerimonia) | Telefono | Sfondo nero pieno con solo la scheda «Fischio finale — colpo fuori casa» e «Salta festeggiamenti»: la scena 3D della cerimonia non compare nei primi secondi. | fine partita, fase `ceremony` | `foto-grafica-178/partita-tel-highlight-fine.jpg` (terza immagine) | `src/16-scene-3d-cerimonie.jsx` |
| D15 | media | Partita in gioco | Telefono | Comandi sotto i 40 px: pausa ⏸ 14×33, velocità «1×» **22×19**, ⚠️ 22×33, «Salta ingresso» 131×36, «Salta festeggiamenti» 169×36. | partita | `foto-grafica-178/partita-tel-pre-ingresso-gioco.jpg` | `src/15-live-match.jsx:11301` (salta-ingresso) e barra del cronometro |
| D16 | media | Schede di carriera, finestre | Telefono | Tasti <40 px: «Salva · hh:mm» 96×23, strisce «Sostieni il progetto»/«Idee e feedback» 26 px, «Licenzia il procuratore» 157×24, «Calendario ›» 71×16, intestazioni delle fisarmoniche 31-36 px, linguette Classifica/Calendario/Coppe 32 px, «Altra variante» 252×27, campi di testo della creazione 34-36 px, × dei Crediti 18×31. 10-26 controlli <40 px per scheda (su 17-37). | `c178-graf-schermate.mjs` (campo `piccoli`) | `foto-grafica-178/tel-home.jpg`, `foto-grafica-178/tel-agente-lungo.jpg`, `foto-grafica-178/tel-crediti.jpg` | `src/18-career-app.jsx:11920` (strisce), intestazioni Card/Fisarmonica in `src/11-ui-kit-highlight.jsx` |
| D17 | media | Strisce Sostieni/Idee | PC, tablet orizzontale | Le due strisce finiscono schiacciate in alto a sinistra (122 px ciascuna) sopra la sidebar e il testo è troncato («Sostieni il pro…»). | viewport 1440×900 o 1180×820 | `foto-grafica-178/pc-home.jpg`, `foto-grafica-178/tabo-home.jpg` | `src/18-career-app.jsx:11920` + regole `.cpm-nav-bar` a ≥900 px in `src/19-app-root.jsx:938` |
| D18 | media | Spazio fra i box | Telefono, tablet verticale | Distanze ancora larghe: Opzioni di carriera **15,7 px** (Audio→Strumenti→Sessione), Fine stagione/offerte **16,8 px**, finestre d'intervista **12 px**, primo incontro col procuratore **13,4 px**. | vedi sezione «Spazio» | `foto-grafica-178/tel-carriera-opzioni.jpg`, `foto-grafica-178/tel-fine-stagione-offerte.jpg`, `foto-grafica-178/tel-fin-intervista.jpg` | `src/19-app-root.jsx:612`, `src/16-scene-3d-cerimonie.jsx:78`, `src/18-career-app.jsx:6688` |
| D19 | bassa | Intestazione di carriera | Telefono 412 | «FC Salernum · Lega B · St. 12 · Sett. 11/38 · 14° posto»: «posto» va a capo da solo su ogni scheda. | qualsiasi scheda | `foto-grafica-178/tel-home.jpg` | `src/18-career-app.jsx:7409` |
| D20 | bassa | Tutte | Tutti | 15 nodi di testo sotto i 10 px per formato (minimo reale 9 px) e il testo base a 11 px; sui banner d'esito delle partite i dettagli («voto», chip) sono minuscoli. | `nSotto10` nel JSON | `foto-grafica-178/tel-agente-lungo.jpg` | token `FS.caption` in `src/01-bootstrap-tema-avatar.jsx` |
| D21 | bassa | Creazione | Telefono | I riquadri degli avatar sono a 4,5 px (mediana su 258 coppie), sotto il resto del gioco (7,8 px). | Nuova carriera | `foto-grafica-178/tel-creazione.jpg` | `src/17-menu-creazione-pannelli.jsx` (griglia avatar) |
| D22 | bassa | Home fuori carriera | Tutti | Il riquadro del logo ha contenuto più alto del contenitore (271 vs 231 px): la riga col numero di versione/sottotitolo è tagliata in verticale (40 px). | aprire il gioco | `foto-grafica-178/tel-menu-home.jpg` | `src/17-menu-creazione-pannelli.jsx` (card d'avvio) |
| D23 | bassa | Presentazione / schermata d'ingresso | Telefono | Marchio in basso scritto «K O rward Elite» con spazi larghi attorno al pallone-O, diverso dal marchio compatto di testata. | `apriPresentazione(3)` | `foto-grafica-178/tel-presentazione.jpg` | `src/16-scene-3d-cerimonie.jsx` (piè di pagina) |
| D24 | bassa | Post-partita | Tutti | La testata del giornale riporta «TuttoSport», che compare nella lista dei nomi reali bloccati (`src/09-audio-scout-anagrafiche.jsx:943`). **Non posso confermare** che sia il testo mostrato in gioco da quella lista o un'altra sorgente: da verificare col controllo copyright. | partita fino al tabellino | `foto-grafica-178/partita-pc-sequenza.jpg` (ultima immagine) | da cercare |

Note di metodo (verificate, non difetti): (a) la figurina — 21 figurine, rapporto 0,708–0,721 contro 5:7 = 0,714 (scarto <1%), raggio 6 px (12 px da grande), cornice grigia, nessuna immagine rotta, nessun testo che esce dal riquadro; unica anomalia: 3 figurine in «Club» (scheda aperta) con immagine non ancora caricata allo scatto (`naturalWidth` 0), nello scatto chiuso la foto c'è. (b) Sui banner d'esito «esito scritto ≠ 3D» **non è giudicabile** sulle esecuzioni a tipo forzato (parata/fuori/intercetto): il riquadro non segue il tipo forzato (limite dichiarato dal banco 248); l'ho giudicato solo a livello di D4. (c) Le scritte «FC Test» nelle interviste forzate sono un artefatto del gancio di prova.

## Spazio fra i box (PO-296)

Misura via DOM (stesso criterio di `spazio-296.mjs`: riquadri fratelli con cornice/ombra/fondo e raggio ≥6, alti ≥28 e larghi ≥100 px). **Telefono, tablet verticale e PC danno gli stessi numeri** sulle schede (il contenuto è una colonna centrale di larghezza fissa); su PC e tablet orizzontale le offerte e il Fine stagione stanno in riga (spazio orizzontale 7,8-9 px, ok). Le finestre (Modal) sono misurate da sole. Le coppie a 0 px sono la testata di una fisarmonica + il suo corpo (stesso riquadro): non sono difetti.

| Schermata | n. coppie | mediana V (px) | min–max V | coppie >10 px | dettaglio >10 px (stile responsabile) |
|---|---|---|---|---|---|
| menu-home | 3 | 7.8 | 7.8–9 | 0 | — |
| menu-crediti | 3 | 7.8 | 7.8–9 | 0 | — |
| creazione | 258 | 4.5 | 4.5–6.7 | 0 | — |
| offerte | 2 | 7.8 | 7.8–7.8 | 0 | — |
| home | 20 | 7.8 | 0–9 | 0 | — |
| stagione-classifica | 12 | 5 | 0–9 | 0 | — |
| stagione-calendario | 6 | 7.8 | 0–7.8 | 0 | — |
| stagione-coppe | 4 | 8.4 | 7.8–9 | 0 | — |
| club | 11 | 7.8 | 0–7.8 | 0 | — |
| carriera-profilo | 15 | 7.8 | 0–7.8 | 0 | — |
| carriera-nazionale | 10 | 6.699999999999999 | 0–7.8 | 0 | — |
| agente | 12 | 6.7 | 0–9 | 0 | — |
| ufficio | 5 | 0 | 0–7.8 | 0 | — |
| carriera-opzioni | 6 | 9 | 6.7–15.7 | 2 | 15.7 px · div«🎧 Audio🔇 Silenzia tutto → div«🧰 Strumenti📋 Copia Riepi; 15.7 px · div«🧰 Strumenti📋 Copia Riepi → div«🚪 SessioneIl gioco ripre → `src/19-app-root.jsx:612` (colonna `gap:14` + margine della Card) |
| sch-proTransition | 4 | 16.8 | 5.6–16.8 | 3 | 16.8 px · div«SALFC Salernum🇮🇹 Lega B  → div«FIAFC Fiandria🇧🇪 Liga Be; 16.8 px · div«FIAFC Fiandria🇧🇪 Liga Be → div«CNRFC Canario🇪🇸 Liga Ibé → `src/16-scene-3d-cerimonie.jsx:78` (`marginBottom:8` sommato al margine della Card) |
| home-ap | 20 | 7.8 | 0–9 | 0 | — |
| stagione-classifica-ap | 14 | 5 | 0–9 | 0 | — |
| stagione-calendario-ap | 16 | 6.7 | 0–7.8 | 0 | — |
| stagione-coppe-ap | 4 | 8.4 | 7.8–9 | 0 | — |
| club-ap | 30 | 5.6 | 0–7.8 | 0 | — |
| carriera-profilo-ap | 29 | 6.7 | 0–7.8 | 0 | — |
| carriera-nazionale-ap | 11 | 5.6 | 0–7.8 | 0 | — |
| agente-ap | 14 | 6.7 | 0–9 | 0 | — |
| ufficio-ap | 5 | 0 | 0–7.8 | 0 | — |
| prepartita | 4 | 7 | 7–7 | 0 | — |
| fin-impulso (finestra) | 4 | 8.4 | 7.8–9 | 0 | — |
| fin-spogliatoio (finestra) | 3 | 7.8 | 7.8–9 | 0 | — |
| fin-settimana-vissuta (finestra) | 2 | 7.8 | 7.8–7.8 | 0 | — |
| fin-partita-titolare (finestra) | 3 | 9 | 7.8–9 | 0 | — |
| fin-partita-panchina (finestra) | 3 | 9 | 7.8–9 | 0 | — |
| fin-offerta (finestra) | 3 | 7.8 | 7.8–9 | 0 | — |
| fin-intervista-vittoria (finestra) | 5 | 8 | 8–12 | 1 | 12 px · div««Come descrivi il tuo pe → div[eroe-intervista23]«Rispo → `src/18-career-app.jsx:6688` (`marginBottom:8` sotto la figurina dell eroe, oltre al gap del Modal) |
| fin-intervista-sconfitta (finestra) | 5 | 8 | 8–12 | 1 | 12 px · div««Come descrivi il tuo pe → div[eroe-intervista23]«Rispo |
| fin-procuratore-intro (finestra) | 5 | 9 | 9–13.4 | 1 | 13.4 px · div«Andrea TuratiProcuratore → div««Finalmente ci conosciam |
| fin-intervista-pareggio (finestra) | 5 | 8 | 8–12 | 1 | 12 px · div««Come descrivi il tuo pe → div[eroe-intervista23]«Rispo |

**Schermate dove resta >10 px:** Opzioni di carriera (15,7 px), Fine stagione/offerte (16,8 px, solo telefono e tablet verticale), Intervista post-partita (12 px), Primo incontro col procuratore (13,4 px). **Nessuna sovrapposizione** fra riquadri in nessuna schermata; **nessuna coppia a contatto** a parte testata+corpo. Il minimo «vero» fra carte è 4,5 px nella griglia avatar della creazione, 5 px fra i blocchi della Classifica.

## Censimento schermate

Come raggiungerle: contesto A = gioco aperto con `?cpmtest=1` (home); B = `trial` salvato (offerte); C = salvataggio `SAVE` (stagione 12, Lega B) + `__CPM_CAREER.goTab(…)`; D = finestre via `__CPM_CAREER.apriSettimana/apriPartita/forceOffer/forceInterview/apriIntro253/forceMoment/forceSaga/apriPresentazione/apriGala/festa251/notify247`; E = partita di carriera dal salvataggio `save-194-primavera-w38` (`playMatch()` → pre-partita → ingresso → gioco → fischio → tabellino); F = highlight forzati (`__CPM_FORCE_SIT`).

| # | Schermata / pannello | Come | Esito (4 formati) |
|---|---|---|---|
| 1 | Home fuori carriera | A | ok · D22 |
| 2 | Crediti | A, «Crediti» | ok · D16 (× 18×31) |
| 3 | Opzioni (menu) | A, «Opzioni» | ok |
| 4 | Creazione calciatore | A, «Nuova carriera» | difetti D16, D21 |
| 5 | Offerte (fine provini) | B | ok |
| 6 | Home carriera | C `dashboard` | difetti D1 (tablet v.), D16, D17, D19 |
| 7-9 | Stagione: Classifica · Calendario · Coppe | C `standings/calendar/coppe` | ok · D16 |
| 10 | Club | C `club` | ok (chiuso e aperto) · D16 |
| 11-12 | Carriera: Profilo · Nazionale | C `profile/nazionale` | ok · D16 |
| 13 | Agente | C `agente` | ok · D16 |
| 14 | Ufficio (patrimonio, staff privato/personal trainer, acquisti) | C `ufficio` | ok · D16 (±, comandi del trainer 34 px) |
| 15 | Opzioni di carriera | C, footer «Opzioni» | difetto D18 |
| 16 | Figurina grande | C, tocco sulla figurina in testata | ok (figurina nitida, 291×408, raggio 12) |
| 17 | Fisarmoniche aperte ×9 schede | C con `fisAperte` | ok |
| 18 | Pre-partita (scheda partita) | E | ok |
| 19-20 | Finestra «Questa settimana»: impulso · spogliatoio | D | ok |
| 21 | Settimana vissuta | D | ok |
| 22-23 | Invito alla partita (titolare/panchina) | D | ok |
| 24 | Offerta di trasferimento | D | ok |
| 25-28 | Intervista post-partita (vittoria/sconfitta/pareggio) + primo incontro col procuratore | D | difetto D18 |
| 29 | Momento di carriera (2 id) | D `forceMoment` | ok (una chiamata non riuscita per id) |
| 30 | Saga (il capitano) | D `forceSaga` | ok |
| 31 | Presentazione serata (battiti 0 e 3) | D | ok · D23 |
| 32 | Galà dei premi | D | ok |
| 33-34 | Festa trofeo (Nazionale, Lega) | D `festa251` | ok |
| 35 | Notifica (toast) | D `notify247` | ok |
| 36 | Fine stagione Under 18 / offerte | `goScreen('proTransition')` | difetto D18 |
| 37-38 | Richiedi cessione · Licenzia procuratore · Cambia procuratore (conferme) | clic | ok |
| 39 | Ufficio «Fonda» accademia | clic | ok |
| 40 | Prepartita → formazioni → ingresso (walkout) → gioco 2D → highlight → fischio → cerimonia → tabellino/pagelle | E | difetti D13, D14, D15 |
| 41 | Tabellino, «connessioni», pagelle, tabellino in numeri | E, fase `ended` | ok · D24 |
| 42-49 | Highlight 3D (hl_intro/hl_move/hl_choose/hl_result) per le 10 famiglie | F | difetti D2-D12 |

**Non raggiungibili da collaudo (richiedono un flusso che il banco non innesca):** `goScreen('press'|'postmatch'|'seasonEnd'|'careerEnd'|'nationalCallup'|'clubPresentation')` restituiscono la dashboard (nessun dato di fine stagione/carriera), il torneo della Nazionale in corso (`apriNaz55` → «no-em»), «Importa» salvataggio e «Rivedi intro» (selettore di file / video). Restano da collaudare dal vivo a fine stagione.

## Limiti del collaudo

Chromium headless con GL software: gli fps non dicono nulla e il tempo di scena scorre a 1/10-1/30 del reale (le foto sono a tempo di SCENA, con la scena congelata per lo scatto; la fluidità vera la giudica il telefono). Esiti `parata/fuori/intercetto` forzati: il riquadro non li segue (limite noto). Le serie del telefono sono due partite diverse ma 4 pagine fresche ogni 3 scene, mai 191 scene sulla stessa pagina. PC e tablet orizzontale: schermate e partita sì, highlight solo su PC (10) e tablet verticale (4).
