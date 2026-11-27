# Rapporto giro 435 — riparazione dei tre rossi del treno 7.999.219

Base `lavoro/203` (9eb6a5b4). Ramo `sviluppo/giro435-riparazione-219`. Treno di riferimento: corsa 46015182581 (33 parti).
Toccati **solo tre guardiani** (`tests/visual/`): `trenino-317.mjs`, `musica-avvio-430.mjs`, `gigante-212.mjs`. Gioco, `tools/`,
`GAME_VERSION`, `docs/governo` e licenze **invariati**. In tutti e tre il rosso del giro è `CPM_NO_G435=1`.
(La consegna nomina `window.__CPM_NO_G435`, ma nessuno dei tre difetti è nel gioco, quindi un interruttore della pagina non serve:
il rosso vive nella sonda.)

## 1. `musica-avvio-430` (parte 29) — gara della sonda, non del gioco

**Correzione alla diagnosi della consegna.** Le righe citate («musiche in corso ["null 2s loop=true g=0.0425"]», «buffer assente»,
controlli 1-5 e 7 caduti) sono del **braccio ROSSO** (`__CPM_NO_G430` = 7.999.217): lì devono cadere, e sono identiche sul banco.
Nel log della parte 29 (job 140561562077) il braccio **VERDE** passa 1, 2, 3, 4, 6 e 7. Sul runner il brano A **c'è**: decodificato,
54 s, in loop, g 0,1649. **Cade solo il controllo 5:**

`partita {"prima":0,"mezzo":0.0013,"finito":true}`, mentre la carriera era corretta (`prima 0,165 → mezzo 0,0865`).

**Causa misurata.** Dopo `AudioMgr.scene('home')` la sonda aspettava solo che A fosse *partito*. A riparte da guadagno 0,0001 con
la sua dissolvenza d'entrata (τ 0,6 s), e la sonda misurava subito l'uscita verso la partita. Sul banco il primo campione cadeva a
g 0,0032 e il secondo a 0,003, quindi «mezzo < prima» passava per un soffio. Sul runner il primo campione cadeva a 0 e il secondo
(0,0013) era *più alto*: rosso. Con un testimone sul banco: A partito a 47 957 ms, misurato a 47 962 ms (5 ms dopo).
L'AudioContext è `running` e il gioco fa la cosa giusta. Le quattro ipotesi della consegna (file non servito, formato, gara col
caricamento, unione 427/428) sono **escluse**: il file è servito e decodificato sul runner stesso (controlli 1-3 verdi).

**Correzione** (sonda): prima di misurare la dissolvenza verso la partita si aspetta l'**evento** «A arrivato ad almeno il 90%
del guadagno finale del controllo 1» (tetto 15 s solo contro un'attesa appesa). Aggiunto `CPM_CPU_LENTO` (solo misura, CDP).

| braccio | partita `prima → mezzo` | esito |
|---|---|---|
| prima (banco) | 0,0032 → 0,003 | verde per un soffio |
| prima (runner) | 0 → 0,0013 | **rosso** |
| dopo, banco | 0,1491 → 0,080 | verde |
| dopo, CPU ×4 | 0,1505 → 0,0768 | verde |

Il rosso storico `__CPM_NO_G430` cade sempre sul controllo 1. Il rosso del giro `CPM_NO_G435=1` ripristina l'attesa vecchia, che
misura nel primo istante della dissolvenza. ⚠️ Sul banco il vecchio controllo passa comunque per un soffio: la gara si vede col
numero `prima` (0,003 contro 0,15), non con un rosso garantito. Neanche con CPU ×4 l'ho fatto cadere sul banco.

## 2. `trenino-317` (parte 33) — stesso difetto del giro 426

Lo scenario D costruiva il main finto da HEAD del banco ed ereditava il `BLOCCO-RILASCI.json` vero (attivo, corsa 45920908452:
`tiro-caricato`, `rilascio-312`), e `CPM_REF_BLOCCO` passava dall'ambiente. **Correzione** come la 426: nel commit di governo del
main finto lo scenario scrive il **suo** blocco spento e `CPM_REF_BLOCCO=''`. `tools/` intatti.
- verde: tutti i controlli A-D9 → «✅ VERDE»;
- rosso del giro `CPM_NO_G435=1`: «❌ D1 trenino pulito: fermo — rilasci BLOCCATI dal treno grande (docs/governo/BLOCCO-RILASCI.json,
  corsa 45920908452): tiro-caricato, rilascio-312 …», cioè lo **stesso messaggio del treno**.

Gli altri guardiani dello strumento: `notte-333` legge `git show ${BASE}` su una base fissa (GitHub finto), `deploy-326` e
`via-poc-338` sono statici. Nessuno legge il blocco o i rossi dichiarati veri di main: tutti verdi e non toccati. `rilascio-312`:
verde (correzione del 426 già presente).

## 3. `gigante-212` (parte 26) — tetto fisso di 240 s + ingresso più lungo col tunnel del 411

Sul runner casa-pc: `playMatch` 15:43:13 → «finiti (fase hl_intro, highlight 0)» 15:47:13, cioè i 240 s del tetto **fisso** scaduti
mentre il primo highlight si apriva. Misura sul banco (testimone nuovo: tempo di ogni cambio di fase), scenario casa-pc:

| build | inizio ingresso | inizio gioco | 1° `hl_choose` | 2° highlight risolto |
|---|---|---|---|---|
| main 7.999.218 | 13 s | 95 s | 111 s | ~128 s |
| lavoro/203 | 16 s | 113 s | 132 s | ~150 s |
| lavoro/203, CPU ×4 | 16 s | 163-178 s | 222 s | ~235-257 s |

Il tunnel del giro 411 allunga l'ingresso di ~15 s (82 → 97 s) e l'apertura di ~21 s. Da solo non basta a far cadere il guardiano:
sul banco resta sotto i 240 s. Lo fa cadere la lentezza del runner (circa ×2), che porta l'apertura oltre il tetto. **Il gioco
non ha un difetto**: l'ingresso è più lungo per scelta del 411. **Correzione** (sonda): la raccolta finisce all'evento (due
highlight risolti e guardati, o fase `ended`). Il tetto sale a 900 s solo contro una partita appesa. La soglia `MINF` è invariata
e «non giudicata» resta rosso.
- CPU ×4 corretto: highlight 62 fotogrammi, PASS (col tetto vecchio sarebbe caduto, secondo highlight a ~257 s);
- rosso del giro `CPM_NO_G435=1` + CPU ×6: «✗ casa-pc:highlight NON GIUDICATA (0 fotogrammi)» → FAIL, come il treno.

⚠️ In una corsa con CPU ×4 (prima della correzione) è caduta anche `casa-pc:festa` (2 fotogrammi). Alla corsa dopo la festa ne aveva
25, e sul runner 14. La festa forzata si chiude col suo timer: su una macchina molto lenta raccoglie pochi fotogrammi. Non l'ho
toccata (vedi dubbio 3).

## Verifiche

- `node ci-runner.mjs giro musica-avvio-430 trenino-317 gigante-212 rilascio-312 audio-avvio-427` → **«catena giro su 7.999.218:
  22/22 verdi»** (i 5 guardiani + le 17 sentinelle, tra cui `partita-vera`, `career-critical`, `web-237`, `griglia-mobile`).
  Nessun passo rilanciato.
- `intro-spalle-428`: verde, e il rosso `__CPM_NO_G428` cade.
- Rossi visibili: `musica-avvio-430` (rosso storico `__CPM_NO_G430` cade su 1-5 e 7) · `trenino-317` `CPM_NO_G435=1` → messaggio
  del treno · `gigante-212` (`npm run`: braccio `CPM_PROVA_ROSSO` incluso) e `CPM_NO_G435=1` → highlight non giudicata · `rilascio-312`
  verde (il rosso `CPM_NO_G426` è del giro 426, non rieseguito qui).
- Nota di ambiente: il clone era superficiale. Per il percorso B di `rilascio-312` serve `git fetch --deepen` (vedi giro 426).

## Dubbi per il PO

1. **(consigliata, applicata)** Correggere le tre sonde perché aspettino l'evento e portino il loro stato, senza toccare gioco e
   strumenti. Tre rossi, tre difetti di misura, nessun difetto del gioco.
2. Il treno riassume l'esito di un guardiano con le ultime righe stampate. In `musica-avvio-430` sono quelle del braccio ROSSO, che
   cade per costruzione: la diagnosi «il buffer di A non c'è sul runner» è nata da lì. Opzione: far stampare ai guardiani a due
   bracci prima il braccio che ha deciso il rosso, oppure far mettere al riepilogo del treno la prima riga «✗» del braccio verde.
   Non applicata: tocca lo strumento del treno (`ci-treno-308.mjs`) o tutti i guardiani.
3. `gigante-212`: la festa forzata (`light: true`) si chiude col suo timer, e su un runner molto conteso potrebbe restare sotto
   `MINF`. Opzioni: tenere aperta la festa sotto `cpmtest` finché la sonda non ha i suoi fotogrammi (gancio solo collaudo), oppure
   lasciare com'è (sul runner 14 fotogrammi, margine sopra 8). Per ora non toccata.
4. Il tunnel del 411 allunga l'apertura di ~21 s anche nella partita vera. Se il PO la trova lunga sul telefono, è una decisione di
   regia del 411, non un difetto di questo giro.
