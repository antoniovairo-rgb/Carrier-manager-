# Rapporto giro 61 — residui L1-bis: regia e credibilità degli highlight (verso la 7.999.173)

Ramo `sviluppo/regia-highlight-giro61`, base `lavoro/172` (7.999.172, commit `46cdcdc`). `GAME_VERSION` e `SAVE_VERSION`
**invariati** (il numero lo dà l'unione di rilascio). Zona G non toccata. Toccati: `src/12-three-match-view.jsx` (+ build
`CARRIER-MANAGER-AV.html`, `check-src` identico ai frammenti) e `tests/visual/` (due guardiani nuovi, `package.json`,
MAPPA `src/12-` di `ci-runner.mjs`). Non toccati: interazioni 2D col mister, PO-220, PO-228, la taglia dell'eroe (PO-261,
decisione PO).

Misure «prima» sulla 172 prese in una copia di lavoro separata (`git worktree` di `lavoro/172`), così il build della 172
non è mai cambiato sotto le sonde.

## Sintesi

| Voce | Sulla 172 (prima) | Intervento | Dopo | Guardiano (verde · rosso) |
|---|---|---|---|---|
| Salto di avvicinamento in intro/move/scelta (giro 53) | pallone verso il portatore difensivo a **209-320 u/s** di scena (passo 10-16 u); in lettura a **10,5-16 u** dal portatore | tetto 22 u/s nelle fasi in moto, aggancio in lettura | **22 u/s**, in lettura **0 u** | `avvicinamento-61` · 22 u/s, gap 0 · 249 u/s, gap 10,5-16 u |
| Eroe fuori quadro in `hl_result` «fra le linee» (giro 53) | coda del post-arco: soggetto sull'eroe **47,8%**, eroe fuori **40%** (braccio rosso = 172) | soggetto all'eroe dopo 0,9 s di post-arco + tetto guardia-palla | soggetto sull'eroe **100%** (192/192), eroe fuori **0%** (0/100) | `linee-61` · 100%/0% · 47,8%/40% |
| PO-261 apertura del primo highlight | `apertura-261` verde: prima immagine sull'eroe **4/4**, aperture vuote 0, scarto 0 u, 0 teletrasporti | nessuno (taglia: decisione PO) | invariato | `apertura-261` (esistente) |
| PO-262 determinismo | `match-sequence` verde: **80/80 = 100%** su 1x/1x, 2x/2x, 1x/2x, minuto 92, fischio 4/4 | nessuno (chiuso dal giro 36) | identico sul ramo | `match-sequence` (esistente) |
| PO-207 ripartenza dal centro | `ripartenza-207` verde (kickoff@50,50, rossi visibili) · `ripartenza-piazzato` verde (rigore e punizione) | nessuno | `ripartenza-207` verde sul ramo (542 s) | esistenti |
| PO-266 nominato lontano | `nomi-219` verde: 18/19 vicini, **1 lontano** (seme 102, «spalle», RUSSELL a 44,1 u); 2 riprove del seme 102: 0 lontani | **non corretto** (non riprodotto) | — | `nomi-219` (esistente) |
| PO-252 banco dei 10 difetti | vedi §3 | voci 7 e 10 toccate da questo giro | vedi §4 | suite `*-252` |
| PO-022 parte residua | vedi §3 | nessuno | `catalogo-022` verde sul ramo: **12/12 scene dal motore (100%)**, 5 catene del secondo tempo generate | `catalogo-022` |
| PO-229 / PO-248 | ombrello delle voci sopra | — | — | — |

## 1. Salto di avvicinamento in `hl_intro`/`hl_move`/`hl_choose` (annotato dal giro 53)

**Causa (lettura del codice, confermata dalla misura).** `src/12`, ramo «avvicinamento» del pallone: col portatore difensivo
(`_tackleCarrier`) il pallone lo raggiungeva con `min(1, aDt·10)`. A passo di scena ≥ 0,1 s (headless, telefono lento) è un
passo intero.

**Misura prima.** Sonda/guardiano nuovo `avvicinamento-61` (GLB spento, teatro acceso, pagina nuova per scena: gi168 «Tackle
duro», gi138, gi33, gi146), testimone `__CPM_AVV61` scritto in **entrambi i bracci**: velocità di SCENA del pallone nelle fasi
in moto (grandezza indipendente dagli fps) e distanza pallone→portatore all'ultimo fotogramma scritto (quello che resta a
schermo nella lettura ferma della scelta).

| braccio | gi168 | gi138 | gi33 | gi146 |
|---|---|---|---|---|
| rosso `__CPM_NO_AVV61` (= codice 172) | gap 11,5 u in lettura | **249 u/s** in hl_move (passo 12,5 u) | — | — |
| altra corsa del rosso (stesso codice della 172) | 233 u/s | 249 u/s | 320,6 u/s | 209,5 u/s |

Una prima stesura col solo tetto di velocità è stata **scartata dalla misura**: in scelta la scena si legge ferma (il giro 3D
disegna 1-2 fotogrammi e si ferma) e il pallone restava a **20-31 u** dal portatore per tutta la lettura (col lerp della 172:
11-16 u, a metà strada).

**Correzione** (`src/12`, rosso `__CPM_NO_AVV61`): nelle fasi in moto il pallone raggiunge il portatore rotolando a **22 u/s di
scena** al massimo (sopra i 15 u/s di corsa dei giocatori); sotto lo stacco nero (stesso criterio della maschera 7.471/7.504)
l'aggancio intero resta (invisibile); in **scelta** il pallone va ai piedi del portatore in un passo (fotogramma fermo).

**Dopo.** Guardiano sul build finale (`bdd9194`):

| braccio | gi168 | gi138 | gi33 | gi146 |
|---|---|---|---|---|
| verde | gap 0 | **22 u/s** (hl_move), gap 0 | gap 0 | gap 0 |
| rosso `__CPM_NO_AVV61` | gap **11,5 u** | **249 u/s**, passo 12,5 u | gap **16,0 u** | gap **10,5 u** |

Verde = tutte le scene con vmax ≤ 23 u/s e gap ≤ 1,5 u; rosso = almeno una scena oltre 40 u/s o 5 u. Verde e rosso
riprodotti in tre corse. ⚠️ Quante fotogrammi la scena scrive in scelta varia col carico (1-21): il guardiano giudica la
grandezza (velocità di scena, distanza finale), non il conteggio.

## 2. Eroe fuori quadro in `hl_result` su «Ricevi fra le linee» (annotato dal giro 53)

**Misura prima.** Sonda/guardiano nuovo `linee-61` (partite vere Coll1-4, GLB acceso, teatro, attesa reale, 412×915), ogni
fotogramma (`__CPM_FR73`, a cui ho aggiunto arco vivo `ar`, tipo e tempo di scena del post-arco `pa`/`pt`, esito `ok`, tenuta
`kp` — solo collaudo). Sulla build con il solo strumento (comportamento 172), 9 scene «fra le linee»: eroe fuori **8,0%** dei
fotogrammi col pallone in volo, **25,8%** a pallone non in volo. I fotogrammi fuori sono **tutti nel post-arco di un tiro**
(parata `deflect`, fuori, gol `in_net`) con il soggetto della regia rimasto sul pallone (`_subj520`): esempio p2 3' 40/40,
p1 71' 17/17. Non è la consegna al compagno (lì la regia sul ricevente è voluta, 7.522).

**Correzione** (`src/12`, rosso `__CPM_NO_LINEE61`):
1. passati **0,9 s di scena** di post-arco, il soggetto torna all'eroe (chi ha tirato) fino alla fine della scena — anche sul
   suo gol. Esclusi: autogol, compagno che finalizza (`assist_recv`), cross-gol, ritorno dell'uno-due, highlight difensivi;
2. in quel tratto vale il tetto della guardia-palla che tiene l'eroe nel 94% del semiquadro (7.999.74/PO-273). Misurato
   senza il punto 2 (p1 4'): il pallone respinto passava a 9 u dalla camera e la guardia ruotava lo sguardo verso di lui,
   eroe a ndc x −7.

**Dopo.** Il giudizio si fa in **tempo di scena del post-arco** (`pt`), mai in fotogrammi: a 4-8 fps headless il primo tratto (0,9 s di
regia sul pallone, voluto) dura molti fotogrammi, e **sotto carico il post-arco non arriva in fondo prima della chiusura della
finestra d'esito** (misurato con load 15: braccio verde cieco, 0 fotogrammi oltre 1,3 s). Il guardiano va fatto girare da solo.

| braccio (4 partite, 6-9 scene «fra le linee») | soggetto sull'eroe, `pt` ≥ 1,0 s | eroe fuori, `pt` ≥ 1,6 s | fuori a pallone non in volo (tutto il result) |
|---|---|---|---|
| verde | **192/192 = 100%** | **0/100 = 0%** | 84/380 = 22,1% |
| rosso `__CPM_NO_LINEE61` | 43/90 = 47,8% | 14/35 = **40,0%** | 127/234 = 54,3% |

Il residuo del verde nel totale (22%) è il primo 0,9 s di post-arco, cioè la parata/il gol visti sul pallone — scelta di
regia lasciata com'è (vedi §6, decisione 1). Prove intermedie: col solo cambio di soggetto (senza il punto 2) il verde era
25,7%; senza il gol dell'eroe incluso, 33,2% (scena p2 3', gol, eroe a ndc 1,03-1,13 per 40 fotogrammi).
Soglie: verde soggetto ≥ 90% ed eroe fuori ≤ 15% (se ≥ 10 fotogrammi); rosso soggetto ≤ 60% (il soggetto torna anche da
solo quando il pallone respinto passa vicino all'eroe: 33-48% misurato); cieco sotto 10 fotogrammi.

## 3. Voci del compito

**PO-261 — apertura del primo highlight.** Sulla 172 `apertura-261` è verde: prima immagine della prima scena sull'eroe
**4/4**, aperture vuote (eroe fuori ≥ metà del tempo) **0** su 2 prime e 3 seconde scene, scarto dello sguardo allo snap
**0 u** su 9 snap, 8 salti scoperti in conclusione tutti spiegati dalla velocità (0 teletrasporti). La parte R02 (eroe piccolo,
mediana 0,059) è la taglia di regia: decisione PO, **non toccata**. Dalla R04 («26 episodi di pallone lontano da tutti
all'apertura, da confermare») questo giro ha corretto il caso misurabile delle scene difensive (§1): in lettura il pallone
stava a 10,5-16 u dal portatore, ora ai suoi piedi. Gli altri episodi R04 non li ho misurati: **Non posso confermarne** lo stato.

**PO-229 / PO-248 — credibilità e fluidità.** Sono l'ombrello: le correzioni di questo giro sono le due voci §1 e §2
(fluidità del pallone in apertura, inquadratura dell'eroe a fine scena). Il «codice 111» del taccuino resta da verificare dal PO
sul dispositivo (headless non lo prova).

**PO-252 — banco dei 10 difetti.** Stato per voce dopo questo giro (guardiani sul build finale, §4):
1 piedi che pattinano → `piedi-252` verde, mediane verde 0,309 · rosso 0,525 (soglia verde ≤ 0,36); 2 pallone che si teletrasporta
in rete → `rete-252` verde; 3 eroe immobile in difesa → `difesa-252` verde; 4 rinvio veloce → `rinvio-252` verde (26,1 contro 47,8 u/s); 5 portiere 111/112 →
`portiere-252` verde; 6 pallone indietro nel build-up aereo → `aereo-252` verde; **7 eroe fuori quadro → corretto il caso a fine
scena dei tiri (§2, `linee-61`)**; 8 reparto che non reagisce → `reazione-252` verde; 9 salto isolato della camera → `camera-252`
verde; **10 pallone lontano dai piedi all'apertura → corretto il caso del portatore difensivo (§1, `avvicinamento-61`)**. Il banco
pesato intero (`banco-248`) non l'ho rigirato: la classifica aggiornata dei 10 non c'è.

**PO-022 — un solo motore, parte residua.** `catalogo-022` sul ramo: **12/12 scene nate dal motore**, le 5 catene del secondo tempo
generate. Il residuo dichiarato dal giro 45 (posizione dell'eroe RESA dal 3D che entra nel motore a `riprendi`, `seme-a`) è coperto
dal punto di ripresa LOGICO della 7.999.161 (`ripresaSemeRef`, src/15 r.2245) e il giro 50 non ha più riprodotto la divergenza;
`seme-a` non l'ho rigirato in questo giro. Resta il catalogo SITUATIONS come scorta del gate (PO-093): togliere le schede scritte
è un cantiere a sé (decisione 3).

**PO-266 — cronaca che nomina un giocatore lontano.** Sulla 172 `nomi-219` (braccio verde, 18 semi): **18/19 nominati entro 25 u**
(94,7%, verde), **1 lontano oltre 35 u**: seme 102, scena «spalle alla porta», RUSSELL a 44,1 u. Riprovato il seme 102 due volte con
`sonda-nomi-266` (testimone `__CPM_W266`): 0 lontani (le partite non tornano identiche, dipendono dai tempi). **Non corretto**:
senza una riproduzione non ho la causa. Ipotesi da verificare, non misurata: nella scena «spalle» l'opzione «Proteggi palla e
scarica su X» nomina il ricevente del motore anche quando non è libero (`_p6Nomi`: `ricVicino` non guarda `liberi`, src/04 r.920).
`spot-266` fuori catena per decisione PO, non rigirato.

**PO-262 — determinismo.** `match-sequence` verde sulla 172 e sul ramo: **80/80 = 100%** nei tre confronti, minuto 92, fischio
4/4. Le due correzioni di questo giro toccano solo il pallone e la camera del 3D, che il motore non legge (la ripresa usa il punto
logico, 7.999.161): misurato, la sequenza non cambia.

**PO-207 — ripartenza dal centro dopo il gol.** Sulla 172: `ripartenza-207` verde (ripartenza 1, pallone a 50,50 in «kickoff»;
rossi visibili: nessuna ripartenza / «tenuta@27,40»), `ripartenza-piazzato` verde (rigore e punizione: ripresa dal centro,
squadre nella propria metà). Sul ramo `ripartenza-207` verde. Nessuna modifica: lo stato misurabile è chiuso; la resa nella 2D
**non l'ho vista a occhio** (nessuno screenshot della 2D dopo un gol in questo giro).

## 4. Verifiche

Tutte sul build finale del ramo (`bdd9194`; `node tools/check-src.mjs`: identico byte per byte ai 21 frammenti).

| passo | esito |
|---|---|
| `validate-situations` (gate) | ✅ **14/14 PASS**, fingerprint **00001505**, 0 failure |
| `test:logic` · `save-compat` · `design-system` · `career-critical` | ✅ 43/43 · ✅ 12/12 · ✅ · ✅ |
| `avvicinamento-61` (nuovo) | ✅ verde 22 u/s, gap 0 · rosso 249 u/s, gap 10,5-16 u |
| `linee-61` (nuovo) | ✅ verde 100% / 0% · ✅ rosso 47,8% / 40% |
| `match-sequence` (PO-262) | ✅ 80/80 = 100% ×3, minuto 92 |
| `ripartenza-207` (PO-207) · `catalogo-022` (PO-022) | ✅ · ✅ 12/12 dal motore |
| `apertura-261` (PO-261) | ✅ prima immagine sull'eroe 4/4, 0 teletrasporti |
| `piedi-252` · `rete-252` · `portiere-252` · `aereo-252` · `reazione-252` · `camera-252` | ✅ tutti (piedi: mediane 0,309 · 0,525) |
| `difesa-252` · `rinvio-252` · `goal-postarc` | ✅ **da soli**: difesa reale 0/4, prova 0/3, rosso 3/3 · rinvio 26,1 vs 47,8 u/s · 6/6 gol in porta |
| `gk-dive-sync` | ✅ |
| `inquadra-273` | partite 2,4: ⚠️ **cieca** (nessuna scena aerea uscita: le scene dipendono dai tempi); partite 1,3: ✅ **13,3%** (2/15, soglia 20%). Sulla 172, partite 2,4, stessa ora: ✅ 0/7. Le mie modifiche non toccano le fasi di presentazione delle scene aeree (il pallone in scelta cambia solo con un portatore difensivo; il tetto della guardia vale solo in `hl_result`) |

⚠️ **Sotto carico (load 11-15, tre catene in parallelo) quattro guardiani GLB sono usciti rossi o ciechi** e tutti verdi rifatti da
soli: `difesa-252` (gi31 «fermo 1» → 0,02 da solo; la stessa corsa sulla 172 sotto lo stesso carico ha dato «fermo 1» su
tutte le scene), `goal-postarc` (classe C a ~1 fps, «clock di scena 0,55 s in 28,8 s reali»), `rinvio-252` e `inquadra-273`
(ciechi). Stessa trappola del giro 50: questi guardiani si giudicano solo a macchina scarica.

## 5. Non verificato

- **Tutto sul telefono**: nessuna misura su dispositivo. Le due correzioni si giudicano in grandezze adimensionali o in tempo di
  scena; il «salto di avvicinamento» a 60 fps era già un rotolamento rapido (lerp ≈ 0,16 per fotogramma) e il guadagno vero è sui
  dispositivi lenti — **Non posso confermarlo** senza il taccuino del PO.
- **PO-266**: il caso lontano (seme 102) non si è ripetuto in 2 riprove; causa non trovata, nessuna correzione.
- **PO-207 nella 2D a occhio**: solo guardiani (stato del motore), nessuno screenshot.
- **PO-252 classifica pesata aggiornata** (`banco-248`) e **`seme-a`**: non rigirati.
- **Catena `mirata` completa** di `ci-runner.mjs` per `src/12` (45 passi): non eseguita per intero; eseguiti i passi elencati in §4.
- I guardiani fuori dalla lista di §4 nella MAPPA `src/12-` (es. `esiti-218`, `cross-218`, `scene-221`, `partita-vera`,
  `stadi-071`, `cerimonie`, `kit-061`, `salti-274`, `memoria-275`, `pallone-278`, `ingresso-277`): **non eseguiti** in questo giro.

## 6. Decisioni per la sessione principale

1. **Regia del primo tratto del post-arco** (eroe fuori mentre la camera segue parata/gol per 0,9 s di scena). Opzioni:
   (a) **lasciare 0,9 s** — la parata e il pallone in rete restano la storia per un attimo, poi il tiratore (consigliata: è la
   grammatica TV e il verde è già 0% nella coda); (b) scendere a 0,5 s — meno tempo sulla parata; (c) inquadratura a due (eroe e
   pallone insieme) — più lavoro, tocca la taglia che è decisione PO.
2. **Catena**: `avvicinamento-61` (~4 min, GLB spento, stabile in tre corse) può entrare nella `completa`; `linee-61` (~12 min,
   GLB acceso) **non** — sotto carico diventa cieco: (a) solo MAPPA (consigliata), (b) nella completa fra i passi lenti da soli.
3. **PO-022, catalogo SITUATIONS**: il flusso vero è 100% dal motore; resta da decidere se ritirare le schede scritte (oggi
   servono al gate, che le forza) — (a) tenerle come banco del gate (consigliata), (b) cantiere PO-093 dedicato.

## File

- `src/12-three-match-view.jsx`: tetto di velocità e aggancio in lettura del pallone verso il portatore difensivo
  (`__CPM_NO_AVV61`, testimone `__CPM_AVV61`); ritorno del soggetto all'eroe nella coda del post-arco + tetto della guardia-palla
  (`__CPM_NO_LINEE61`); campi `ar/pa/pt/ok/kp` in `__CPM_FR73` (solo collaudo).
- `tests/visual/avvicinamento-61.mjs`, `tests/visual/linee-61.mjs` (nuovi); `package.json` (due script); `ci-runner.mjs`
  (MAPPA `src/12-`, `linee-61` fra i passi lenti). Non aggiunti alla catena `completa` (la decide il PO).
