# RAPPORTO — giro 68 (7.999.173) · schermate L7 + Crediti + mappa del gioco

Ramo `sviluppo/schermate-mappa-giro68`, base `lavoro/172` (46cdcdc, 7.999.172). `GAME_VERSION` **non** cambiato (resta
"7.999.172": il bump lo fa la sessione principale all'unione). Zona G, motore e highlight non toccati.

## 1. PO-066 — riquadri della home

**Prima (misura).** `home-066` sulla base: 112 riquadri in 7 situazioni, 0 fuori standard, a 412 e a 360 px. Il guardiano
era verde, ma la foto mostrava un difetto che non misurava: **le fisarmoniche ripetevano il proprio titolo** — «La tua storia»
in testa e, aperta, l'occhiello maiuscolo «LA TUA STORIA» come prima riga (idem «Il progetto del club», «La tua settimana»,
«Duello capocannoniere», «Vita privata», e il titolo dei passaggi di carriera ripetuto in grassetto).

**Controllo nuovo D1** in `tests/visual/home-066.mjs`: dentro una fisarmonica aperta, un testo identico al suo titolo.
Misurato col rosso `CPM_ROSSO068=1` (`__CPM_NO_DUP068`) a 412 px: **45 fuori standard** (26 D1 + i 19 ricorrenti nei sette
scenari). Prima stesura della correzione (solo nel `Card` del kit): 19 rimasti, quattro casi con markup diverso
(«duello capocannoniere» ×5, «la tua settimana» ×7, «è arrivato uno che gioca nel tuo ruolo» ×5, «❤️ vita privata» ×2).

**Correzione.**
- `src/11-ui-kit-highlight.jsx` — `Card`: se il primo figlio di una fisarmonica (`momento`) è un `<div>` di solo testo uguale
  al titolo, non si mostra. Gli occhielli che aggiungono un dato («CLASSIFICA · W.2/38», «VOCI DI MERCATO — W.2») restano.
- `src/18-career-app.jsx` — i quattro casi con markup diverso, spenti a mano col medesimo rosso (`dup068On()`); nel duello
  resta il segnale «🔥 SORPASSO».

**Dopo.** `home-066` verde: **112 riquadri, 0 fuori standard** a 412 e a 360 px; rosso `CPM_ROSSO068=1` → 45, esce 1.

Foto (`docs/sviluppo/foto/giro68/`): `home-pro-inizio-prima-412.jpg` / `home-pro-inizio-dopo-412.jpg`,
`home-pro-inizio-{prima,dopo}-360.jpg`, `home-u18-inizio-{prima,dopo}-{412,360}.jpg`.

## 2. PO-217 — analisi pre-partita

`analisi-217` sulla base, carriera U18 e pro, a 412×915 e 360×780: **verde, nessuna violazione** (vuoto massimo 28 px,
pulsante «Entra in campo» ultimo blocco e dentro lo schermo, figurina del mister nella card del consiglio). Foto
`analisi-pro-412.jpg`, `analisi-pro-360.jpg`. **Nessuna modifica**: non ho trovato nulla fuori dal kit.

Osservazione dalla foto, non un difetto del kit: i due stemmi hanno taglie diverse (nostro 64 px, avversario 96 px,
`src/13-prepartita-formazioni.jsx:126-128`) e forme diverse (scudo / cerchio). È una gerarchia voluta del giro 30.

**Decisione per la sessione principale (PO-217):**
1. **Lasciare così** (consigliata): la gerarchia mette in primo piano l'avversario, che è il soggetto della schermata.
2. Stemmi della stessa taglia (64/64), simmetria «partita» al posto di «analisi dell'avversario».
3. Chiedere al PO con le due foto affiancate.

## 3. PO-267 — Crediti, voci DiceBear

**Prima (7.999.171).** «Non posso confermarlo» non si mostrava più, ma le due voci restavano fuori formato: Avataaars senza
riga Licenza (la licenza stava nella descrizione come citazione), Micah senza fonte né link della licenza che la CC BY chiede.

**Fonte verificabile trovata nel repo:** la libreria inclusa `assets/dicebear-avatars.min.js` porta i metadati di entrambi
gli stili — Avataaars: `creator "Pablo Stanley"`, `license.name "Free for personal and commercial use"`, `url
https://avataaars.com/`; Avatar Illustration System: `creator "Micah Lanier"`, `source
figma.com/community/file/829741575478342595`, `license "CC BY 4.0"`, `url creativecommons.org/licenses/by/4.0/`.

**Correzione** (`src/17-menu-creazione-pannelli.jsx`, `CREDITI254`): le due voci con autore, fonte e riga Licenza, come le
altre. Rosso `__CPM_NO_CRED267B` (tornano le voci della 7.999.171). `docs/governo/CREDITI-fonti.md` aggiornato con la fonte.

**Guardiano** `crediti-254` (nuovo controllo DiceBear): verde a 360 e 412 px; `CPM_ROSSO=__CPM_NO_CRED267B` → 4 violazioni,
esce 1. Foto `crediti-prima-{412,360}.jpg` (braccio rosso) e `crediti-dopo-{412,360}.jpg`.

## 4. PO-205 — mappa del gioco

`docs/governo/MAPPA_GIOCO.md` rigenerata da `tools/mappa-gioco.py` alla build 7.999.173 (era 7.999.126): **62% → 64%**
(media semplice e pesata). Salti dovuti soprattutto alla chiusura di PO-183 e PO-176 (cadono quattro tetti del 50%). Resa
del giro 68 dichiarata come misura del team: Home 3.1 64→70, Pre-partita 5.3 70→72, nodo nuovo 1.6 Crediti 70 (tetto 80%
finché le voci sono «da verificare dal PO»). Nodi più deboli: 13.10 Gestione degli errori 35, 13.9 Prestazioni 42, 7.4 Stile
di gioco 49. Rigenerata anche `docs/MAPPA.md` (mappa del sorgente). Nessuna modifica al gioco per questa parte.
Lo script aveva i percorsi fissi su `/home/user/cm-poc` (inesistente): ora sono relativi al repo.

## 5. Verifiche

| Suite | Esito |
|---|---|
| test:logic | verde (0 fail) |
| save-compat | verde, 12 pass · 0 fail |
| design-system | verde («SISTEMA GRAFICO OK») |
| griglia-mobile | eseguita, 65 scatti; «NON misurato: prepartita: playMatch → nomatch» (vedi Non verificato) |
| home-066 | verde 412/360; rosso D1 → 45, esce 1 |
| analisi-217 | verde 412×915 e 360×780 (U18 e pro) |
| crediti-254 | verde; rosso `__CPM_NO_CRED267B` esce 1 |
| catena mirata (52 passi, MAPPA di `ci-runner.mjs` per src/11, 17, 18 — include career-critical) | **52/52 verdi** (giro composto: 7 prima del riavvio + 45 dopo; career-critical 1013 s verde) |

## Non verificato

- La resa sul telefono del PO: le foto sono headless a 412/360.
- `griglia-mobile` dichiara non misurata la schermata del pre-partita (`playMatch → nomatch`); non ho verificato se accade
  anche sulla base 7.999.172. La copre `analisi-217`.
- La licenza originale su avataaars.com: Non posso confermarlo (sito non raggiungibile da qui); la riga Licenza riporta quella
  dichiarata dai metadati della libreria DiceBear inclusa.
- Mappa: la Resa resta «Non posso confermarlo» su 63 nodi; nessuna navigazione nuova oltre ai guardiani citati.
- Segnalato dall'aggiornamento della mappa: PO-268 risulta APERTO nel BACKLOG ma il codice toglie già numero d'ordine e data
  dai Crediti (`src/17-menu-creazione-pannelli.jsx:154`); da allineare nella sessione principale.
- Il container si è riavviato a metà della catena mirata: la catena è stata ripresa come giro composto (`CPM_CI_FATTI` coi
  7 passi già verdi), secondo la decisione PO del 14/10 «Rifai solo le mancanti».
