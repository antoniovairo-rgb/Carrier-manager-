# Rapporto giro 172 — audio del pubblico, suoni dei menu, audio in partita (PO-369, PO-370, verso la 7.999.192)

Ramo `sviluppo/giro172-audio-pubblico` da `lavoro/191` (b58d70e). `GAME_VERSION` non toccata. Rosso `window.__CPM_NO_G172`,
guardiano `npm run audio-172` (da `tests/visual`). Roadmap non aggiornata da questa sessione (figlia): la riga spetta alla sessione madre.

## In breve

| | prima (rosso = giro 161b) | dopo (giro 172) |
|---|---|---|
| Letto della folla | file **sintetico** (`brusio-folla-korward.wav`, giro 20) 23,8 s in loop fisso | registrazione **CC0 vera** dello Stade de France (Romainbehar), 2 strati suonati a **grani seedati** |
| Ripetizione del letto in 10 minuti | lo stesso file 25,2 volte (periodo fisso 23,8 s) | 71 grani da 7-11 s, **0 porzioni uguali di fila** |
| Giunto del loop (salto / passo tipico) | 1,61 | 0,12-1,13 (4 file) |
| Livello letto vs effetti di gioco (loudness momentanea) | −29,0 contro −27,9 LUFS: **margine 1,0-1,2 dB** | −36,8/−36,9 contro −27,6/−28,0: **margine 8,8-9,3 dB** |
| Stesso campione due volte di fila (~10 min di partita vera) | «ohh» 7, fischi 3, applausi 2 | **0** per ogni evento |
| Suoni di menu su 100 tocchi di navigazione | **100** (`ui.click` a ogni tocco) | **0** |
| Durata dei suoni di menu suonati | 0,29-0,61 s (conferma, finestra, notifiche, settimana) | 0,09-0,14 s |
| Picco in uscita dei suoni di menu | −13,6 / −15,2 dBFS | −20,1 / −23,8 dBFS |
| Audio in partita | nessun accesso | icona 🔊 nella barra (2D e 3D), pannello Pubblico/Effetti/Musica + Muto, partita in pausa |
| Peso audio del registro | 5,40 MB (54 file) | **5,82 MB** (67 file), tetto 6 MB **non alzato** |

## 1. Misure PRIMA (punto 1 del compito)

Strumenti nuovi: `tools/audio-172/misura-file.py` (file: durata, picco, LUFS, energia <100 Hz e >8 kHz, piattezza spettrale 100-8000 Hz,
giunto del loop) e `tests/visual/misura-172.mjs` + `tests/visual/lib/audio-172.mjs` (gioco vero su `dist-web`: registrazione del master,
loudness momentanea EBU a 400 ms, 100 tocchi, flusso degli eventi di una partita vera seedata).

**Letto della folla (file):** `brusio-folla-korward.wav` 23,777 s · picco −5,7 dBFS · −20,0 LUFS · <100 Hz 0,09% · >8 kHz 0,02% ·
piattezza 0,030 · giunto: salto 0,0564 = **1,61 volte** il passo tipico fra campioni vicini (99° percentile), ΔRMS 50 ms −1,13 dB.
Lettura onesta: il giunto **non** è un clic forte (1,6 volte il passo tipico) e il fruscio fuori banda è quasi nullo; ciò che le misure
mostrano come difetto vero è la **sorgente sintetica** (rumore modellato + grani vocali, nessuna voce vera) e il **periodo fisso** di
23,8 s (25 ripetizioni identiche in 10 minuti). «Sporco/finto» non è misurabile direttamente: la piattezza spettrale è il mio indicatore
(rumore = alto, voci = basso) e separa poco (0,030 contro 0,003 della registrazione nuova).

**Livello in partita (master, volumi di default, letto all'avvio 0,30):** letto −29,0 LUFS momentanei (mediana), picco −18,4 dBFS.
Effetti (massimo momentaneo): calcio −27,1 · passaggio −31,5 · testa −29,2 · parata −27,9 · fischio −15,9 · palo −22,7 ·
contrasto −28,6 → mediana −27,9. **Margine 1,1 dB** («troppo forte», confermato).
**Cronaca:** la telecronaca è solo testo; nel gioco non esiste una voce audio (interruttore `tel` predisposto, nessuna sorgente), quindi
il confronto «letto vs cronaca» **non è misurabile**: lo dichiaro invece di inventarlo.

**Altri suoni di folla (file):** applausi-1/2 3,0 s · boato-1/2 4,6 s · esulta-1 2,2 s · fischi-1 1,55 s · ohh-1 4,0 s; tutti −18-−19,5 LUFS,
>8 kHz ≤ 0,6%. **Varianti:** esultanza 1, fischi 1, «ohh» 1 → lo stesso campione a ogni evento.

**Ripetizioni in una partita vera:** partita seedata (seme 7300, nome «Pv», `?cpmtest` con autoplay): 19 eventi, 9 verso la folla
(2 parate, 1 respinta, 1 fuori, 1 gol subito, 4 tiri), 0-1. Suonata 4 volte (~10 minuti di partita, assunzione dichiarata: il gioco a 1×
non si accelera, il flusso è quello registrato) → «ohh» 8 volte con 1 campione (**7 di fila**), fischi 4 volte con 1 campione (**3 di
fila**), applausi 2 campioni ma 2 volte di fila al cambio di partita (la memoria dell'ultimo campione si azzerava a ogni partita).

**Menu:** 100 tocchi (pointerdown) sulla home → **100 suoni** `ui.click`. Durate: click 40-97 ms, conferma 290, popup 380, notifiche
491-539, settimana 608 ms; «chiudi» e «nav» con 88-92% dell'energia sopra 8 kHz (acuti taglienti, oggi non usati sui tocchi).

### Soglie dichiarate (nessuna abbassata)
- Livello: letto ≥ **6 dB** sotto la mediana dei massimi degli effetti (dal compito).
- Menu: suoni < **150 ms** (dal compito), energia >8 kHz ≤ 10%, picco in uscita ≤ **−18 dBFS**, **0** suoni su 100 tocchi di navigazione.
- Varietà: **0** ripetizioni di fila, ≥ 2 campioni per evento di folla; letto: **0** porzioni uguali di fila in 600 s.
- Letto (file): giunto ≤ 1,5 volte il passo tipico e |ΔRMS| ≤ 1,5 dB; >8 kHz ≤ 1%; <100 Hz ≤ 1%; piattezza ≤ 0,025.
  **Dichiaro:** queste ultime soglie le ho fissate dopo aver misurato sia il file vecchio sia i primi file nuovi; il vecchio sta appena
  fuori (1,61 e 0,030). Sono le più deboli del guardiano: il peso vero lo portano livello, varietà e sorgente registrata.

## 2. Pubblico

**Sorgenti (solo CC0, lette alla fonte l'11/11, registro `assets/audio/LICENZE.json`, pipeline `tools/audio-149/prepara-audio.py`):**

| File | Evento | Sorgente | Taglio | Durata | Peso ogg+mp3 |
|---|---|---|---|---|---|
| `sfx/crowd/letto-1` | `crowd.bed` | Commons, Romainbehar, «Match amical France-USA — 58241 spectateurs» (CC0, stessa dell'«ohh» del giro 161) | 0,6-22,6 s, coda fusa in testa (2 s) | 20,0 s | 55+98 KB |
| `sfx/crowd/letto-2` | `crowd.bed` | idem | 22,6-30,6 + 43,6-49,6 s (unite in dissolvenza 1 s), coda fusa | 11,0 s | 31+54 KB |
| `sfx/crowd/caldo-1` | `crowd.swell` | idem | 35,2-41,6 s (folla agitata dopo l'azione) | 6,4 s | 18+32 KB |
| `sfx/crowd/caldo-2` | `crowd.swell` | archive.org, Nicholas A. Judy, The Designer's Choice «Ambiences», «Prize Fight At Large Arena…» (CC0; md5 = metadati) | 68-74 s | 6,0 s | 17+30 KB |
| `sfx/crowd/esulta-2` | `crowd.cheer` | TDC «Crowds» (già nel registro) | 116,0-118,2 s | 2,2 s | 13+18 KB |
| `sfx/crowd/fischi-2` | `crowd.boo` | TDC «Whistles», «Crowd Element» (già nel registro) | 0,0-1,15 s (la prima raffica; il giro 149 usava la seconda) | 1,15 s | 7+9 KB |
| `sfx/crowd/ohh-2` | `crowd.ohh` | **derivato** da ohh-1 (stessa registrazione, −7% di velocità e altezza) | 31,0-35,0 s | 4,3 s | 12+22 KB |

Tagli scelti **sulle misure** (inviluppo, creste a 20 ms per escludere colpi, picchi tonali per escludere campanelle/sirene dell'arena),
**non all'ascolto**: vanno giudicati nella pagina d'ascolto. Filtro sul letto: passa-alto 110 Hz, passa-basso 7 kHz. La registrazione
dello stadio è la **trascodifica MP3** di Wikimedia (l'originale .ogg risponde 429, come nel giro 161): non contiene nulla sopra ~8 kHz.
Cercate e **scartate** perché non CC0: «Arrowhead Stadium crowd noise» (CC BY-SA 4.0), «WWS Football Austria vs Sweden» (CC BY 4.0),
«Score Strasbourg-PSG…» (CC BY-SA 4.0), «Noonelikesus» (pubblico dominio dichiarato, non CC0, e coro di un club reale).

**Nel gioco (`src/09-audio-scout-anagrafiche.jsx`, AudioMgr):**
- **Letto a grani** (`_bedPlan172`, `_bedGrain172`, `_bedStart172`): porzioni di 7-11 s da uno dei due strati, offset scelto da
  `hashStr(seme di partita | contatore)`, dissolvenza a potenza costante 2,5 s; se il grano precedente era dello stesso strato a meno di
  4 s, l'offset salta di mezzo strato. Il piano è una funzione pura (il guardiano la percorre per 600 s). Se i file arrivano dopo il
  calcio d'inizio, il letto passa ai grani in dissolvenza (`_swapBed172`). Il vecchio brusio resta la riserva.
- **Livello:** `_bedGain172(t)=0,125·(0,55+1,5·t)` → ~8-9 dB sotto gli effetti all'avvio.
- **Reattività:** occasione (tiro/punizione/rigore/testa/cross) → letto +0,20 e strato caldo; altre azioni +0,06; gol → boato e letto a
  0,85; **calo nei momenti morti**: ogni secondo il letto torna verso 0,16 (τ 8 s); «ohh» sul tiro fuori/respinta/palo/angolo (già dal
  161); fischi su gol subito (161) e sul fallo (149). Mai lo stesso campione due volte di fila, **anche al cambio di partita** (col verde
  `enterMatch` non azzera più l'ultimo campione).
- **Rosso:** non carica le voci nuove né le varianti nuove (`K172`/`N172`), sceglie solo fra i campioni di prima con la stessa formula,
  letto sintetico come prima.
- **Nessun Math.random nuovo** (controllo statico del guardiano); il flusso della partita è lo stesso fra verde e rosso (19 eventi, 0-1;
  `audio-161` 297/297 voci identiche).

**Non fatto, dichiarato:** «fischi sui falli **contro**»: l'evento `CoherenceCheck foul` non dice chi ha commesso il fallo, quindi i
fischi suonano su ogni fallo come dal giro 149. Distinguere richiede di toccare il motore (vedi domande).

## 3. Menu

- Sei suoni nuovi da Kenney «Interface Sounds» (CC0, già nel registro): `conferma-morbida` (bong_001), `apri-morbida` (toggle_001),
  `positiva-morbida` (glass_005), `negativa-morbida` (back_004), `info-morbida` (glass_003), `settimana-morbida` (toggle_002); tagliati a
  ≤ 140 ms con coda in dissolvenza, passa-basso 4,5 kHz, `g` circa la metà. Col verde `ui.confirm/ui.popup/notify.*/week.advance`
  suonano questi (alias `ALIAS172`).
- **Niente suono sulla navigazione:** il listener delegato dei tocchi (`src/19`) chiama `AudioMgr.tocco()`, che col verde suona solo su
  elementi marcati `data-suono`: il tasto pieno della vista (`Btn` primario/verde/oro/festa → «conferma», `src/11`) e il tasto
  Impostazioni («apri»). Mai due suoni d'interfaccia entro 450 ms (anche per le notifiche). Rosso: `ui.click` a ogni tocco come prima.

## 4. Audio in partita

- `src/15-live-match.jsx`: icona 🔊/🔇 (`data-cpm="audio-partita"`) in entrambe le barre (V2 e quella del rosso `__CPM_NO901`), nelle fasi
  `playing` (campo 2D) e `hl_*` (3D). Il tocco ricorda se la partita era già in pausa, la mette in pausa e apre il pannello; alla chiusura
  riprende solo se prima non era in pausa. Il riquadro di pausa non si sovrappone al pannello.
- `src/09`: `PannelloAudio172` — Muto + tre cursori: **Pubblico** (bus `crowd`), **Effetti** (bus `match`: pallone, parate, pali),
  **Musica** (bus `music`). Scrive con `AudioMgr.setVol/setOn/toggleMute` → la stessa chiave `cpm-audio` delle Impostazioni.
- `src/19` (Impostazioni): col verde le voci sono Pubblico · Effetti di partita · Musica · Arbitro · Suoni dei menu (prima: Audio
  partite · Effetti sonori · Pubblico · Arbitro, senza Musica).
- `src/17` (Crediti): due descrizioni aggiornate col verde (brusio dalla registrazione di Romainbehar, grida dell'arena TDC).

Foto (`docs/sviluppo/giro172/foto/`): `tel375-2d-icona.png`, `tel375-pannello-aperto.png`, `tel375-3d-icona.png`, `tel375-3d-pannello.png`,
le stesse `pc1280-*`, e `*-3d-icona-rosso.png` (rosso: nessuna icona).

## 5. Guardiano `npm run audio-172` — uscita completa in `docs/sviluppo/giro172/audio-172-uscita.txt`

Verde: **PASSA** tutti i 13 controlli × 2 risoluzioni. Rosso `__CPM_NO_G172`: **CADE** su 3, 4, 6, 7, 8, 9, 10, 11 (e su 12-13, senza icona).
Numeri del verde: letto a grani attivo (2 grani in 14 s) · margine 9,3 dB · occasione 0,284→0,484 + strato caldo, dopo 25 s senza eventi
0,174 · gol → boato + 0,85 · «ohh», fischi su gol subito e fallo da file · varietà: strato caldo 16 volte, «ohh» 8, applausi 8, fischi 4,
sempre 2 campioni e 0 di fila; letto 71 grani in 10 minuti, 0 porzioni ripetute · 100 tocchi su 4 elementi di navigazione → 0 suoni (2
elementi marcati esclusi), conferma 1, notifica 1, due notifiche a 100 ms → 1 · picchi menu −20,3/−23,7 dBFS · icona in 2D e 3D a 375 e
1280 px, pausa: fase e minuto fermi per 4 s, ripresa alla chiusura, cursore e Muto in `localStorage` = `getCfg`.

**Errori miei di strumento trovati durante il giro (corretti, nessuna soglia toccata):**
1. La loudness momentanea non veniva letta (`framelog=verbose` non stampa a livello info) → `framelog=info`.
2. Il conteggio dei suoni di menu sommava il nome chiamato e l'alias «…172» (2 al posto di 1) → si contano i nomi chiamati.
3. **Cieco**: la sonda dei tocchi avvolgeva `AudioMgr.play`, ma dal giro 172 il listener chiama `play` dall'interno → anche il rosso
   dava 0 su 100. Ora conta dal contatore del gioco (`__CPM_AUDIO149().plays`): rosso 100, verde 0. La misura «prima» (100 su 100) era
   stata presa sul codice di prima, dove l'involucro funzionava.
4. «Riparte» si giudicava dal minuto, che negli highlight è fermo per costruzione: aprendo il pannello al 3' era partito un highlight,
   rimasto in `hl_intro` per tutta la pausa e passato a `hl_choose` alla chiusura. Ora si giudica la coppia (fase, minuto); se alla
   chiusura si è in `hl_choose` la scelta la fa l'autoplay (sul PC era «non giudicato»).
5. Le ripetizioni «di fila» del primo verde stavano tutte al confine fra due partite: corretto nel **gioco** (memoria dell'ultimo campione).
6. La sonda dei tocchi pescava anche il tasto pieno della home (conferma, suona di proposito): ora tocca solo gli elementi non marcati.

**Difetto preesistente corretto:** `tools/audio-149/prepara-audio.py` sul ramo di partenza **non si compilava** (il giro 161b aveva tolto
la riga Mixkit insieme alle due graffe di chiusura del registro). Rimesse le graffe; le 54 righe vecchie del registro escono identiche.

## 6. Esito dei controlli (uno alla volta, `free -m` e `df -h` prima di ognuno: ~14,5-15,5 GB liberi di RAM, 29 GB di disco)

Sorgente: `node tools/build-src.mjs` + `node tools/check-src.mjs` → **IDENTICO BYTE PER BYTE** (7.245.124 byte, 21 frammenti).

| Controllo | Esito |
|---|---|
| `audio-172` | ✅ verde passa · rosso cade su 3, 4, 6, 7, 8, 9, 10, 11 |
| `audio-149` | ✅ verde (135 file con licenza, 67 CC0, 5,82 MB, 67/67 decodificati anche senza rete, 45/45 eventi da file) · rosso cade |
| `audio-161` | ✅ verde · rosso cade su 4-8 · sequenza 297/297 identica, 0-1 |
| `audio-161b` | ✅ verde (nessun Mixkit, rosso G149 sintetizzato) |
| `brusio-238` | ✅ verde (il vecchio brusio resta caricato come riserva) |
| `crediti-254` | ✅ verde (23 voci a 360 e 412 px) |
| `sw-cache-120` | ✅ verde (audio al primo avvio 2,6 MB, era 2,5) · rosso ✅ |
| `twa-120` | ✅ 12/12 |
| `partita-vera` | ✅ 12 bande tenute, 2/2 partite finite |
| `test:vision` / `test:logic` | ✅ 43/43 · 51/51 |
| `typing-shortcuts` | ✅ PASS |
| `validate-situations` | ✅ PASS, fingerprint 00001505, 0 failure |
| `save-compat` | ✅ 12/12 |
| `replay` | ✅ 8 highlight |
| `career-critical` | ✅ PASS (26 passi) — la prima esecuzione l'ho interrotta io col tetto di 580 s: non vale, rifatta da capo |
| `design-system` | ✅ |
| `griglia-mobile` | ✅ 14 schermate × 5 larghezze (i provini che riscrive nel repo NON sono stati committati) |
| `match-sequence` | ✅ le tre velocità raccontano la stessa partita |
| `build-dist` + `validate-dist` | ✅ dist offline funzionante |
| `audit-copyright` | ✅ 0 riferimenti |

## 7. Peso

Registro: **5,82 MB** (6.097.665 byte, 67 file; +0,42 MB). Tetto 6 MB del guardiano 149 **non alzato**; per starci il letto e gli strati
sono codificati più leggeri (Opus 24 kb/s, MP3 40 kb/s a 24 kHz: la sorgente non ha nulla sopra ~8 kHz). Margine residuo 0,18 MB.

## 8. Pagina d'ascolto

`docs/sviluppo/giro172/ascolto.html` — 12 registrazioni prima/dopo dal gioco vero (`node tests/visual/ascolto-172.mjs`): letto 20 s,
occasione + «ohh», gol, gol subito, fallo, tre tiri fuori di fila, 10 tocchi di menu, conferma, finestra, tre notifiche. Misure in
`misure.json` e sotto ogni riga. Nota: nei «10 tocchi» il «dopo» non è silenzio assoluto: sotto c'è l'ambiente della home (brusio
sintetico con applausi sparsi, preesistente e con `Math.random`), che non ho toccato.

## Domande per la sessione madre

1. **Ascolto:** i tagli (letto, strati caldi, `ohh-2` derivato) sono scelti sulle misure, non all'orecchio: il PO li conferma?
2. **«Effetti» nel pannello** regola il bus `match` (pallone, parate, pali); l'arbitro ha il suo bus e resta solo nelle Impostazioni.
   Va bene, o «Effetti» deve includere anche il fischietto?
3. **Fischi sui falli contro:** oggi su ogni fallo. Distinguere chi ha commesso il fallo richiede di passare il lato nell'evento del motore
   (`src/15`): lo si fa?
4. **Suono sulle conferme:** ho marcato come «conferma» ogni `Btn` pieno (primario/verde/oro/festa). Se in qualche schermata il tasto pieno
   è di fatto navigazione («Avanti» nei passaggi), lì suonerà: si vuole un elenco esplicito invece della regola?
5. **Brusio dei menu:** l'ambiente della home/carriera è ancora sintetico (rumore filtrato + applausi casuali). Il PO non l'ha citato;
   va trattato come il letto della partita?
6. **Vecchio brusio:** `brusio-folla-korward.wav` (1 MB) col verde serve solo da riserva e continua a scaricarsi. Toglierlo dal download
   del verde (resterebbe per il rosso) è una riga, ma cambia `brusio-238`: decisione?
7. **Peso:** restano 0,18 MB sotto il tetto di 6 MB. Altre varianti di folla lo supererebbero: si alza il tetto o si sostituisce qualcosa?
8. **Crediti:** `docs/governo/CREDITI-fonti.md` non ha la riga TDC «Ambiences» né quelle del giro 161 (`crediti-254` conta le righe del
   documento): aggiungerle tocca il guardiano dei crediti.
