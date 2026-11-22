# Giro 328 — trenini più corti (PO-621, priorità 1)

Ramo: `sviluppo/giro328-trenini-corti` (da `lavoro/201` = 3cb166a). Non tocca `src/` né `GAME_VERSION`. Niente browser: si è lavorato
su mappa, storia git (clone intero, 5.411 commit senza unioni) ed esiti pubblici dei treni.

## In breve

Il PO chiedeva trenini più corti. Ho tre risultati, e uno va contro quello che speravo:

1. **src/16 ha una riga sua:** 109 → **63 guardiani** (67 contando i 4 orfani collocati lì, vedi punto 3). Le prove dicono che 46 guardiani
   della vecchia riga `src/18|16|10` guardano solo src/18.
2. **Le sonde non fanno più partire il treno completo.** In 3 vagoni su 8 (311, 320 e 316 per i file in tools/) il treno completo
   partiva solo perché il vagone aggiungeva o spostava **sonde che nessuno esegue** (`misura-309-*`, `foto-320`, `archivio/*`). Ora una
   sonda che nessuno nomina è neutra; una importata da un guardiano gioca quel guardiano.
3. **Il tetto di 4 macchine è il vero limite** (giro 326). Un trenino da più di ~130 guardiani su 4 macchine finisce **dopo** la mappa
   intera su 15. Per questo ho aggiunto una regola: se il trenino finirebbe dopo la mappa intera, si gira la mappa intera. In più ho
   trovato **46 guardiani senza nessuna riga** (giravano solo di notte). Li ho messi nelle righe dei file su cui hanno prove, come
   chiedeva la consegna. Effetto netto: i vagoni che toccano src/12, 15 o 18 diventano tutti «treno completo». Il tempo di parete resta
   pari (~135 min contro 128-158), ma si usano **circa 4 volte le macchine**. Dubbio 1 per il PO.

## Come ho misurato cosa guarda un guardiano

`node tools/mappa-stretta-328.mjs` (strumento di misura; non scrive la mappa). Per ogni guardiano prende il testo dello script npm e
dei moduli locali che importa (tranne `lib/harness.mjs`). Per ogni file di src/ cerca cinque prove:

| prova | cosa |
|---|---|
| A hook | un `__CPM_*` del guardiano che compare nel file e in **al più 2** file di src/ (es. `__CPM_GLB` sta in 5 file ed è usato da 550 sonde: non dice niente) |
| B storia | un commit (senza unioni, che tocca al più 4 file di src/) ha toccato insieme lo script del guardiano e il file. Non vale per src/07, che porta `GAME_VERSION` e viene toccato da ogni giro |
| C nome | il guardiano nomina `src/NN` o il file |
| D simboli | il guardiano nomina un simbolo dichiarato in testa al file (≥ 6 caratteri) o un suo `data-cpm` |
| K dominio | (solo src/16) una parola delle sue schermate: presentazione, intervista, conferenza, gala, parata, pullman, fine stagione, premiazione, sponsor, saluto, figurina, pelle, serata, busta, ritratto… |

Un guardiano lascia la riga di un file solo se ha prove su **altri** file e nessuna su quello. Chi non ha prove da nessuna parte resta
dov'era.

**Riscontro sugli esiti dei treni** (riepiloghi pubblici, riga `RIEPILOGO_JSON` del job «Riepilogo»):
- il treno grande del vagone 314 (corsa 44947424529, src/11 + src/16) ha 27 rossi nuovi;
- il treno del 308 (corsa 44904478144, **nessun file di src/**) ne ha 23, e 19 sono gli stessi: quasi tutti i rossi del runner sono
  instabilità, non effetto del vagone;
- degli 8 rossi presenti solo nel 314, **uno solo** (`rigorista-249`) è fra i guardiani tolti da src/16. Era già rosso nel treno della
  7.999.200 (44926206097, prima del 314: `ROSSI-DICHIARATI.json`).

Quindi nessun rosso del treno del 314 contraddice lo stringimento. Non posso dire di più: i riepiloghi non separano un rosso causato dal
vagone da un rosso del runner.

## Cosa è cambiato

| file | cosa |
|---|---|
| `tests/visual/ci-runner.mjs` (MAPPA) | riga `src/18\|16\|10` → `src/18\|10` (invariata) + `src/16` (63 guardiani); 4 guardiani di `carriera` e 46 di `grafica`/`guardiani` senza riga collocati nelle righe dei file dove hanno prove (`node tools/mappa-stretta-328.mjs orfani`) |
| `tools/trenino-317.mjs` | regola f2 «sonde»: `SONDA328`, `riferimentiDaGit` (git grep del nome alla punta in tests/visual, tools, .github, src, package.json, ricomposto). Una sonda neutra, o nominata solo da sonde neutre del vagone, è neutra. Nominata solo da file eseguiti da script npm: si giocano quegli script. Altrimenti resta non coperta. Regola «più lento → completo» (`pareteAttesa`, stesso taglio di `ci-treno-308 piano`, tetti 4/15 controllati dal guardiano, durate di `DURATE-GUARDIANI.json` alla punta). `decidi` ricalcola con la stessa `sceltaDaGit`, quindi piano e decisione coincidono. Rosso: `CPM_NO_G328=1` |
| `tests/visual/trenino-317.mjs` | sezione **E** (10 controlli); col rosso legge la mappa di prima dalla copia ferma `fixtures/ci-runner-lavoro201-prima328.mjs.txt` |
| `tools/mappa-stretta-328.mjs` | strumento: proposta per file, `orfani`, `confronta <prima> <unioni…>` |
| `CLAUDE.md` | una riga nel paragrafo del trenino |

src/19 resta larga: è `...CATENE.completa` per scelta (la radice dell'app, da cui passa ogni flusso). Con lo strumento
(`--stringi 16,19`) scenderebbe da 188 a 109 (120 tenendo chi resterebbe senza riga). Dubbio 3.
Restano larghe anche le altre righe. Sono fondamenta usate da molti file: `simulateMatch` in src/10, i kit e `appearanceFromSeed` in
src/13 (usati dal 3D di src/12 e src/16), `migratePlayer` in src/17, `hashStr`/`seededRng`/`updateStandings` in src/09, il kit UI in
src/11.

## Prima / dopo su vagoni reali

`node tools/mappa-stretta-328.mjs confronta origin/lavoro/201 <unioni>`. Vagone = `git diff m^1 m` di ogni unione; scelta = `scegli`
del trenino. Le parti sono tagliate come `ci-treno-308 piano` (obiettivo 4.200 s per parte). La parete è simulata con 4 macchine per il
trenino e 15 per la mappa intera, con le durate di `DURATE-GUARDIANI.json`, senza installazione né code.
Calibrazione: per il 321 la parete calcolata è 64 min; la corsa vera 45033490326 ha fatto **1 h 04** (35 guardiani, 3 parti).

Formato: guardiani · parti · somma · parete

| vagone | src | prima | dopo, solo src/16 + sonde + regola «più lento» | dopo, anche con i 46+4 orfani (commit finale) |
|---|---|---|---|---|
| 323 salto-gennaio | 08 18 | 133 · 7 · 485 min · ~128 min | 133 · 7 · 485 · ~128 | completo 356 · 29 · 2000 · ~136 |
| 326 deploy | — | 20 · 1 · 65 · ~65 | uguale | uguale |
| 321 salvataggio-giornata | 09 | 35 · 3 · 190 · ~64 | uguale | uguale |
| 320 nome-intro | 09 17 19 | completo (4 sonde) 353 · 29 · 1985 · ~135 | completo (trenino da 209 più lento: ~398 min) | completo, uguale |
| 318 testi | 11 18 | 137 · 8 · 505 · ~158 | completo 353 · 29 · 1985 · ~135 | completo, uguale |
| 316 musica-serata | 09 17 | completo (assets/audio, tools/audio-149) | uguale | uguale |
| 314 serata-tifosi | 11 16 | 136 · 8 · 500 · ~157 | **107 · 7 · 480 · ~126** | completo 351 · 29 · 1975 · ~134 |
| 311 ritocchi | 09 10 14 15 18 | completo (15 sonde) 349 · 29 · 1965 · ~133 | completo (trenino da 214 più lento: ~340 min) | completo, uguale |

La colonna di mezzo è stata misurata sul file di lavoro prima di collocare gli orfani. Non è un commit a sé.

Come leggerla:
- **parete**: il guadagno vero è sul 314 (−31 min) e sul 318 (−23 min, passando a mappa intera). Gli altri restano uguali.
- **macchine**: dove il trenino diventa completo si usano ~4 volte i minuti-macchina (≈ 2.000 contro ≈ 500).
- **orfani**: non accorciano niente. Rendono il trenino **più completo**, perché da oggi un vagone su src/12 o src/15 gioca anche
  `piedi-203`, `gesti-scena-p1b`, `movimento-147`, `post-210`… che prima giravano solo di notte. Ed è proprio questo che fa sforare il
  tetto.

## Prove

- `npm run trenino-317`: **verde, 60 controlli** (50 di prima + 10 della sezione E). Con `CPM_NO_G328=1`: **rosso, 8 controlli
  falliti** (riga di src/16 = 109, orfani, sonde, più lento). Con `CPM_NO_G317=1`: rosso (uscita 1), come prima.
- `npm run mappa-unica`: verde col verde, rosso con la mappa vecchia.
- `npm run rilascio-312`: verde. `npm run deploy-326`: verde.
- Ogni guardiano delle catene (tranne nucleo/sentinelle) ha ora almeno una riga: lo controlla la sezione E.
- Note d'ambiente: sul clone della sessione `trenino-317` e `rilascio-312` cadevano per riferimenti mancanti (`origin/main`, `origin/poc/…`,
  `origin/lavoro/200`), non per il codice. Dopo `git fetch` di quei rami sono verdi. Sul runner il guardiano gira già così: invariato.
- Non provato su Actions: questo giro non fa push su `lavoro/**`, quindi nessun trenino vero ha ancora usato la regola nuova. Il primo
  treno dopo l'unione lo dirà. Il riepilogo del piano stampa il motivo «trenino … più lento della mappa intera».

## Dubbi per il PO

1. **Tetto 4 contro guardiani in più.** Oggi un vagone che tocca src/12, 15 o 18 sceglie più di 130 guardiani, e su 4 macchine il
   trenino non batte la mappa intera su 15. Ho scelto la parete più corta (si gira la mappa intera, ~135 min, ~2.000 minuti-macchina).
   Il treno grande + trenino + deploy stanno ancora nelle 20 macchine, ma solo se di giorno non c'è un treno grande in corsa. Le
   alternative sono decisioni del PO: alzare il tetto del trenino (es. 8: 15+8+1 non sta nelle 20 quando gira il treno grande), oppure
   preferire sempre il trenino (più lento, meno macchine). Per tornare al comportamento di prima basta `CPM_NO_G328=1`, che però spegne
   anche le sonde neutre: se serve, si separano.
2. **Orfani.** I 46+4 guardiani senza riga erano un buco **preesistente**: il trenino non li giocava mai, solo il treno grande di notte.
   Li ho collocati come chiedeva la consegna, ma sono lunghi (somma ~3 h). Se il PO preferisce che restino solo notturni, si tolgono e
   il controllo «ogni guardiano ha una riga» va riscritto come eccezione dichiarata.
3. **src/19 resta larga** (`...CATENE.completa`). Le prove direbbero 188 → 109. Non l'ho fatto perché la radice dell'app (router,
   impostazioni, montaggio) è attraversata da ogni flusso e la sua larghezza è una scelta scritta (giro 26).
4. **Le prove sono statiche.** Un guardiano può attraversare codice di src/16 senza nominarlo. Esempio: un flusso di carriera che apre
   una schermata di fine stagione senza hook propri. La rete di sicurezza resta il treno grande notturno, che gira la mappa intera e
   blocca i rilasci sui rossi nuovi.
5. **Simboli condivisi di src/16.** `aspettoFigurina225`, `_pelle225`, `misuraPelle240`, `resa240` sono usati dal 3D di partita
   (src/12). Un ritocco di quelle funzioni tocca le partite: i guardiani della pelle (`pelle-240`, `presentazione-225`, `serata-261`)
   restano sulla riga di src/16, quelli del motore no.
6. **assets/** resta non coperta (316: musica nuova → treno completo). Per gli audio potrebbe bastare una riga
   `assets/audio/** → musica-316, audio-149, brusio-238, licenze-184`, ma non ho prove solide su chi legge cosa. La lascio larga.
