# RAPPORTO collaudo 3D — 7.999.173

Collaudo del 19/10/2026 · ramo `collaudo/7.999.173-3d` (da `main` 60c227d, `GAME_VERSION` 7.999.173) · **solo misura**: né `src/` né `CARRIER-MANAGER-AV.html` sono stati toccati.
Ambiente: Chromium headless, GL software, **GLB acceso** (`__CPM_GLB=true`) per le partite e le scene di campo, `__CPM_PRESENT=1`, foto **412×915**, pagina nuova per ogni partita/prova (lezione 7.483). La galleria degli stadi è GLB spento (misura solo architettura/cartelloni, non corpi).
Strumenti nuovi (solo collaudo): `tests/visual/collaudo-173-partite.mjs` (3 partite intere con foto a ogni fase), `tests/visual/collaudo-173-etichetta.mjs` (scheda Club). Per il resto sono stati rilanciati i guardiani del repo (log citati nella colonna «Prova»).

## 1. Esito per voce del BACKLOG

| Voce | Esito | Prova |
|---|---|---|
| PO-218 esiti dell'eroe nelle scene difensive | **Confermato corretto** nel campione | `esiti-218`: braccio verde 0 contraddizioni su 12 scene (2 partite vere); braccio rosso (`__CPM_NO_ESITI218`) 4 contraddizioni su 13 (es. «Uno-due» intercettato raccontato «Conclusione murata»), quindi lo strumento vede il difetto. Nelle 3 mie partite GLB: scena difensiva p1-s02 «Chiusura immediata → Intercetto netto — palla nostra» coerente col riquadro (`partite/p1-s02-hl_result.png`). |
| Avvicinamento all'highlight senza salti | **Confermato** | `avvicinamento-61`: verde vmax ≤ 22 u/s e gap 0 su gi168/138/33/146; rosso (`__CPM_NO_AVV61`) vmax 249 u/s su gi138 e gap 3,46 u su gi168. |
| Eroe in quadro in hl_result su «Ricevi fra le linee» | **Parziale** — vedi difetto D1 | `linee-61`: PASS (coda post-arco: soggetto sull'eroe 191/191, eroe fuori 0/107), ma sul totale delle 8 scene «fra le linee» l'eroe è fuori quadro nel **25,0%** dei fotogrammi a pallone non in volo (87/348) e nel 12,1% con pallone in volo (35/290). |
| PO-276 nessun campo vuoto all'ingresso | **Confermato** (con riserva D3) | `ingresso-276`: verde, finestra 3–12 s di scena «vuoto» 0% (rosso `__CPM_NO_ING276`: 74,8%); fila a fine ingresso hMed 0,065 ≥ 0,045. |
| PO-071 tipologia dello stadio (etichetta) | **Confermato** | Scheda Club → Stadio: «Mersey Stadium · **Arena** · 100k» (`etichetta/club-club.png`); il club del salvataggio ha kind `arena`. Le altre due schermate col dato (scheda prepartita, 2 punti) non fotografate: vedi «Non verificato». |
| PO-071 cartelloni per tipologia | **Confermato a occhio, non misurato** | `stadi/foglio-porta.png`: borgo, catino, mattoni, arena, provincia, moderno_it mostrano perimetri e profili di tribuna diversi (borgo: insegne chiare/dipinte sul basso; arena: tribuna alta a due anelli e striscia LED). Nessun contatore automatico del carattere dei cartelloni. |
| PO-071 tunnel d'ingresso/camera per tipologia | **Confermato** | `ingresso-stadi/*`: tunnel borgo = pensilina L0,1; catino = telescopico L0,6; arena = vetro L9,4; camera d'orbita diversa per tipologia; zero errori di pagina. |
| PO-002/137 palco della premiazione | **Parziale** (palco visto, sequenza non giudicabile) | Palco rettangolare dorato/bianco con squadra schierata in fila e coppa visibile, in `partite/p*-s06-ceremony.png` (campionato) e `premiazione/foglio-euro.png` (Europeo): a t=3 s l'eroe regge la coppa sul palco, a t=7 s due compagni la sollevano. `premiazione-palco-191` verde per l'eroe (0 campioni «in volo» su 14; rosso 5 su 16) ma esce ROSSO per copertura: vedi D2. |

## 2. Tre partite intere (GLB acceso, seme 1234 / 2021 / 777, S12 vs FC Tyneside)

Tutte e tre sono arrivate alla premiazione senza errori di pagina (0 `pageerror`): 6 highlight ciascuna, 185 / 174 / 182 s reali. 38 fotogrammi di fase in `partite/`.
- **Highlight**: 6 scene per partita, tutte giocate fino a `hl_result` (tiro da fuori, finta, stacco, intercetto, uno-due, raddoppio, filtrante, testa, punizione, sponda, conduzione e tiro).
- **Esiti** (riquadro letto sul testo a schermo): coerenti con la scena in tutte quelle verificate a vista (intercetto/palla persa/gol/«Conclusione murata»). Riserva: su p2 55' «Botta sopra la barriera → Conclusione murata» il riquadro è plausibile ma non confrontato con i fatti del motore (nella mia pagina `__CPM_RES218` era vuoto, vedi «Non verificato»); la stessa scena nel braccio rosso del guardiano era una contraddizione.
- **Cronaca/tabellone**: tabellone interno e testata coerenti (hero = MER a sinistra, es. 3–0 a 55'); il testo del DOM elenca le squadre in ordine casa/ospite, non è un errore. Nella premiazione la testata riporta TYN–MER «1–3»/«1–5»/«0–2», coerente col risultato finale (MER vincitore).
- **Festa/premiazione**: raggiunta in 3/3 (`partite/p1-s06-ceremony.png`: titolo «CAMPIONI! Premier Division», fuochi, squadra in fila). La festa dopo il gol (esultanza) non è stata fotografata in modo mirato: vedi «Non verificato».

## 3. Difetti per gravità

| ID | Gravità | Difetto | Prova |
|---|---|---|---|
| D1 | **Media** | «Ricevi fra le linee / Fra le linee, X esce in ritardo»: in `hl_result` l'eroe esce dal quadro in una scena su quattro. Il guardiano `linee-61` passa perché giudica solo la coda del post-arco (pt ≥ 1,6 s, 0/107); sul totale, a pallone non in volo l'eroe è fuori nel **25,0%** dei fotogrammi (87/348, vicino al 25,8% annotato nel commento del giro 61 come misura «prima»). Scene peggiori: p1 71' 30/38 (79%), p2 3' 26/40 (65%), p3 3' 19/54 (35%), p4 5' 11/53 (21%). | `/tmp/.../linee.log` (8 scene, 4 partite vere GLB, righe «fermo/post fuori») |
| D2 | **Bassa** (probabile artefatto di strumento) | `premiazione-palco-191` termina ❌ perché raccoglie **14 campioni** sotto la soglia di copertura 20; la misura sostanziale è favorevole (verde 0 in volo, rosso 5). Girava in parallelo con altre prove (load ~4,5 su 4 core): non riprovato da solo. | log `palco.log`: `VERDE campioni 14 inVolo 0 sulCorpo 6 / ROSSO campioni 16 inVolo 5` |
| D3 | **Bassa** | Ingresso a stadio forzato «borgo» (3000): la prima foto dell'ingresso (≈2,5 s reali) mostra il campo senza alcun calciatore nel quadro, camera a quota 3,3 sul prato (`ingresso-stadi/borgo-3000-nuovo-0.png`). L'arena nello stesso istante mostra i giocatori al tunnel. Il guardiano `ingresso-276` copre il salvataggio S12 (stadio non-borgo), non il borgo; con tempo di scena lento in headless non si può dire se sia il «campo vuoto» di PO-276 o l'istante di partenza. | `ingresso-stadi/borgo-3000-nuovo-0.png` + `ingr071.log` (quote camera 3.3 3.3 17.82…) |

Nessun difetto di gravità alta trovato nel campione.

## 4. Scelta da prendere (per la sessione principale)

D1 — chiudere o no la regia «fra le linee» sul 25%:
- **A (consigliata)**: estendere il guardiano `linee-61` al totale a pallone non in volo (soglia ≤ 15% come il caso 7.482) e correggere la mira nelle scene p1 71' / p2 3' prima della prossima release; costo: una sonda e un ritocco al soggetto di regia.
- **B**: lasciare com'è e dichiarare il 25% come residuo noto nel BACKLOG (PO-218/regia), con nuova misura a 4 partite alla release successiva.
- **C**: restringere il quadro (taglia 0,18→0,24) sulle sole scene «fra le linee»: rischia di ripetere la bocciatura del 7.509 («zoom troppo stretto»).

## 5. Non verificato

- **Esiti raccontati vs fatti del motore nelle mie 3 partite GLB**: `__CPM_RES218` è risultato vuoto (0 scene) nella mia pagina con GLB acceso e `__CPM_PRESENT=1`; il confronto riquadro↔fatti è quindi quello di `esiti-218` (GLB spento, 2 partite), non delle mie.
- Etichetta della tipologia nella **scheda prepartita** (matchday card) e nell'altro punto del codice (line 25285/25362): non fotografata (un tentativo cambiando `isHome` non ha portato alla scheda); verificata solo la scheda Club.
- **Cartelloni «diversi per tipologia»**: giudizio visivo su 6 stadi, GLB spento, nessun contatore.
- **Sequenza capitano → passaggio coppa all'eroe** (PO-002): cinque istanti per cerimonia Europeo e un solo istante per quelle di campionato; in headless il tempo di cerimonia non è giudicabile a occhio. Nessuna verifica del palco per Coppa Nazionale/Nazionale (PO-150 varianti).
- **Festa dopo il gol** delle 3 partite: nessuna foto mirata all'istante dell'esultanza.
- Fluidità e fps reali: l'headless gira a pochi fps; il verdetto sul movimento (avvicinamento, ingresso) è sui testimoni di scena, non sul telefono.
- D2 non riprodotto in isolamento.
