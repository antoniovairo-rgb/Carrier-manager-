# Rapporto giro 161 — audio: cerimonie, gol subito, «ohh», licenza Mixkit

**Decisioni PO dell'11/11** (dopo il rapporto del giro 149): (1) musica fuori partita **solo nelle cerimonie** (premiazioni, presentazione,
fine stagione), brani CC0 letti alla fonte con crediti; (2) **fischi della curva sul gol subito**, emettendo l'evento `GoalAgainst` senza
cambiare la sequenza della partita; (3) riprovare la registrazione CC0 dell'**«ohh»** su Wikimedia Commons; (4) leggere **per intero** la
licenza Mixkit e riportarne il testo esatto, **senza togliere il file e senza decidere**.
Ramo `sviluppo/giro161-audio` da `lavoro/190` (4f9363a). `GAME_VERSION` non toccato (resta 7.999.190 nel codice). Rosso `__CPM_NO_G161`,
guardiano `npm run audio-161`.

## In breve

- **Gol subito:** l'evento `GoalAgainst` ora parte da **un solo punto** (`golSubito161`, `src/09`), chiamato dai due scrittori del gol
  subito in `src/15` (cronaca/microsim e scena difensiva, tre chiamate). Suona i **fischi CC0** già presenti dal giro 149
  (`crowd.boo`, a 1,8× del guadagno del fallo) e abbassa il letto della folla. **Nessun generatore pseudo-casuale e nessuno stato di partita
  toccati**: misurato, la stessa partita giocata col verde e col rosso dà **297/297 voci del libro mastro identiche** e lo stesso risultato.
- **«Ohh»:** l'originale `.ogg` su `upload.wikimedia.org` risponde **ancora 429** (tre tentativi alle 08:59-09:00 UTC, anche via
  `Special:FilePath`). Risponde invece **200 la trascodifica MP3 che Wikimedia stessa pubblica** per quel file (link nella pagina del file):
  è la stessa registrazione, stessa licenza CC0, ricodificata da Wikimedia. L'ho usata **dichiarandolo** nel registro. Taglio di 4 s.
- **Cerimonie:** due brani CC0 da OpenGameArt — «Triumphant» (Emma_MA) per le **premiazioni**, «The World Is Ours» (Zane Little Music,
  primi 48 s con dissolvenza di 3 s) per **presentazione e fine stagione**. Suonano **una volta**, non in loop, entrano in dissolvenza e si
  spengono all'uscita. Fuori dalle cerimonie la musica resta spenta (decisione del 23/09 intatta).
- **Mixkit:** testo integrale della «Sound Effects Free License» e degli «User Terms» letto alla fonte e salvato nel repo; clausole
  riportate sotto parola per parola. **File non toccato, nessuna decisione presa.**
- Peso audio: **5,40 MB** (tetto del guardiano 6 MB; era 3,24); al primo avvio il service worker precarica **2,5 MB** di audio (era 1,5).

## 1. Gol subito (`GoalAgainst`)

**Misura prima:** `grep` sul giro 149 = zero emissioni; `AudioMgr` aveva il ramo ma nessuno lo chiamava. Nella partita del guardiano (seme
7300, nome «Pv») l'avversario segna una volta e la folla taceva.

**Dove:** i gol subiti entrano nel tabellone in tre righe di `src/15-live-match.jsx`, tutte già accompagnate dalla riga di verità
`cpmEv("goal",{side:"away"})`:

| Scrittore | Riga | Quando suonano i fischi |
|---|---|---|
| cronaca / microsim (gol ambientale) | accanto a `cpmEv("goal",{…side:"away",src:…})` nel tick di `playing` | quando il punteggio cambia |
| scena difensiva persa | effetto `golSubito85` | quando l'esito si vede (lo stesso istante del tabellone, regola 7.999.85) |
| scena difensiva col rosso `__CPM_NO_GA85` | ramo `else` dello stesso punto | quando il punteggio cambia |

**Determinismo:** `golSubito161` fa solo due cose — incrementa un contatore su `window` (`__CPM_GA161`, testimone del guardiano) e chiama
`AudioMgr.event`. Sotto `?cpmtest` l'AudioMgr è muto (`SILENT`) quindi in gate e nei guardiani di partita non suona niente; fuori da
`cpmtest` la scelta della variante usa `hashStr` col contatore proprio dell'AudioMgr (giro 149), mai `_rndM`/`Math.random`. Il guardiano
verifica anche che nel blocco del giro 161 non ci sia `Math.random`.

**Misura dopo (dal guardiano):** gol subiti nel libro mastro 1 · emissioni 1 (`cronaca`) · sequenza verde = sequenza rosso (297 voci) ·
risultato 0-1 in entrambi. **Non esercitato dalla partita del guardiano:** il percorso «scena difensiva» (nessuna scena difensiva persa con
quel seme); è coperto solo dal controllo statico (tre chiamate presenti).

**Nota di metodo, dichiarata:** il primo confronto verde/rosso differiva in 8 voci su 297, **tutte nel solo campo `npd`**. Ho rifatto la
prova **verde contro verde** (stessa build, `CPM_A161_AA=1`): stesse 8 voci, stesso campo. `npd` è una distanza letta da `matchPlayers`,
che usa `Math.random` per costruzione (CLAUDE.md, 7.523) — è rumore dello strumento, non della partita. Il guardiano lo esclude dal
confronto, con la motivazione scritta accanto. Nel giro finale anche `npd` è risultato identico.

## 2. «Ohh» dello stadio

| Tentativo (11/11, UTC) | URL | Esito |
|---|---|---|
| API Commons (ricerca) | `commons.wikimedia.org/w/api.php` | 429 |
| pagina del file (HTML) | `commons.wikimedia.org/wiki/File:Match_amical_France-USA_-_58241_spectateurs_-_Action_ratée_sur_faute_21h38.ogg` | 200 (licenza letta) |
| originale, 3 tentativi con attesa 8/16 s | `upload.wikimedia.org/wikipedia/commons/1/17/…21h38.ogg` | 429, 429, 429 |
| `Special:FilePath` (reindirizza all'originale) | `commons.wikimedia.org/wiki/Special:FilePath/…` | 429 |
| **trascodifica MP3 di Wikimedia** | `upload.wikimedia.org/wikipedia/commons/transcoded/1/17/…21h38.ogg/…21h38.ogg.mp3` | **200**, 828.550 byte, 49,8 s, 44,1 kHz stereo |

**Licenza letta sulla pagina del file:** «Author: Romainbehar» · «Source: Own work» · «Date: 9 June 2018» · «I, the copyright holder of
this work, hereby publish it under the following license: This file is made available under the Creative Commons CC0 1.0 Universal Public
Domain Dedication.» sha256 del file scaricato `b633231a2ff9d15a5c15f0369bfa4691c67a2182d8e037c50dc3c2b1d8aa5dae`.

**Cosa ho scelto e cosa non so:** la trascodifica è una ricodifica lossy (MP3 ~132 kb/s) dell'originale da 432 KB; per un «ohh» di folla
la differenza non è misurabile da qui. Il **taglio** (31,0-35,0 s) l'ho scelto **sull'inviluppo** (RMS sale da −19 a −13,7 dB fra 31,5 e
33,5 s e ricade a −18,6 a 34,5 s), **non all'ascolto**: non posso confermare che sia proprio l'«ohh» e non un altro rumore della curva.
Va giudicato nella pagina d'ascolto. Se non convince: `__CPM_NO_G161` rimette la sintesi, oppure si cambia il taglio in
`tools/audio-149/prepara-audio.py` e si rigenera.

**Dove suona:** palo (prima: sintesi `crowdSwell`), tiro fuori/respinto (×0,8), calcio d'angolo (×0,55). Parata e fallo invariati.

## 3. Musica nelle cerimonie

| Cerimonia | Dove nel codice | Brano | Fonte e licenza (lette l'11/11) |
|---|---|---|---|
| Premiazioni | `screen==="seasonAwards"` (SeasonAwardsScreen, gala compreso) | «Triumphant», 27,4 s | [opengameart.org/content/triumphant](https://opengameart.org/content/triumphant) · Emma_MA · campo License: **CC0** · «A short celebratory theme using strings and horns» · sha256 `2da7ebd1…` |
| Presentazione | overlay `presEvent` (serata di presentazione) e `screen==="clubPresentation"` | «The World Is Ours», primi 48 s | [opengameart.org/content/the-world-is-ours](https://opengameart.org/content/the-world-is-ours) · Zane Little Music · campo License: **CC0** · sha256 `a446cbf5…` |
| Fine stagione | `screen==="seasonEnd"` | come la presentazione | come sopra |

- **Un solo effetto** in `CareerApp` dichiara quale cerimonia è in scena (`null` = nessuna), prima dei `return` anticipati (ordine degli
  hook invariato); l'AudioMgr (`ceremony()`) accende il brano o lo spegne in dissolvenza. Una cerimonia in corso tiene la sua musica anche
  se nel frattempo arriva un cambio di fase (il ramo `_mus23` non la spegne).
- **Una volta, non in loop**: un tema celebrativo che riparte dopo 27 s suonerebbe come un difetto; finito il brano resta l'ambiente.
  Scelta mia di realizzazione, reversibile.
- **Fuori ambito, dichiarato:** la schermata di fine carriera (ritiro) non è nell'elenco del PO e resta senza musica. La fanfara del trofeo
  nella gala (giro 149) suona sopra il brano delle premiazioni, senza abbassarlo: è da ascoltare dal vivo.
- **Crediti:** tre voci nuove nella sezione Suoni (assenti col rosso).

## 4. Licenza Mixkit — testo esatto

Il giro 149 non era riuscito a leggerla: la pagina `mixkit.co/license/` non contiene il testo, lo carica in un riquadro via script.
Leggendo lo script della pagina (`assets.mixkit.co/build/controllers-…js`) l'indirizzo del riquadro è `/license/modal/<tipo>/`;
`https://mixkit.co/license/modal/sfxFree/` risponde 200. Testi salvati nel repo, estratti dall'HTML senza altre modifiche:
`docs/sviluppo/giro161/mixkit-sfx-free-license.txt` (sha256 della risposta `c156b9d3…`) e `docs/sviluppo/giro161/mixkit-user-terms.txt`
(«Last revised: October 2, 2025», sha256 `1059c7d6…`).

**«Sound Effects Free License»** (fonte: https://mixkit.co/license/modal/sfxFree/, letta l'11/11/2026) — clausole su uso e redistribuzione:

> Items under the Mixkit Sound Effects Free License can be used in your commercial and non-commercial projects for free.
>
> You are licensed to use the Item to create an End Product that incorporates the Item as well as other things, so that it is larger in
> scope and different in nature than the Item. You’re permitted to download, copy, modify, distribute and publicly perform the Sound Effect
> Items on any web or social media platform, in podcasts and in video games, as well as in films and presentations distributed on CDs,
> DVDs, via TV or radio broadcast or internet based video on demand services.
>
> You can’t redistribute the Item on its own, as stock, in a tool or template, or with source files. You’re also not allowed to claim them
> as your own or register them on any rights management service.
>
> There are some important limits to these rights, described in our User Terms.

L'elenco d'uso in testa al riquadro comprende, tra gli altri, «Video games» e «Commercial projects» (testo completo nel file salvato).

**«User Terms»** (fonte: https://mixkit.co/terms/, «Last revised: October 2, 2025») — le clausole che toccano la redistribuzione:

> 2. About us: […] It is important to understand that by downloading Items on Mixkit you are only receiving a non-exclusive license to use
> that Item. You do not acquire any rights of ownership in that Item.
>
> 9. Restrictions: You must not (either in your own right or through any third party), and you must not permit any third party to: […]
> rent, license, sublicense, sell, resell or otherwise commercially exploit or make Mixkit or any Item available to any third party (except
> as expressly contemplated by these User Terms) including aggregate or collate an Item(s) and make available on a stock or inventory
> basis; […]
>
> 10. Mixkit License: Your use of our Items is subject to the applicable Mixkit License. Subject to Clause 10, the provisions of the Mixkit
> License applies to all use of the licensed Item, even if you sub-license or transfer use of the Item to a third party.
>
> 11. Termination: In addition to any other legal rights we have, we can terminate your rights under the Mixkit License (and require that
> you cease all use of Items) if you breach the Mixkit License or these User Terms.
>
> 25. Changes to these terms: We may change these User Terms (and any terms or policies referenced in these User Terms) at any time. […]

**Cosa il testo NON dice:** né la licenza né gli User Terms nominano esplicitamente le **app**, gli **store** o i **repository pubblici**
(cercato: «app», «application», «repository», «open source» compaiono solo nella definizione di Mixkit e nella clausola 13 sui componenti
di terzi). Il testo parla di «video games» fra gli usi ammessi e vieta di ridistribuire l'Item «on its own» o «with source files».
**Non posso confermare** come queste clausole si applichino a un file `.wav` tenuto in chiaro in un repository GitHub pubblico e servito
da GitHub Pages: è una lettura giuridica, non una misura, e resta al PO. Stato del file oggi: **nel repo** (2,7 MB), **non scaricato dal
gioco** nel verde dal giro 149, usato solo dal rosso `__CPM_NO_G149`; copiato in `dist/` e `dist-web/` da `build-dist` (che copia
`assets/` intera). Non l'ho toccato.

## 5. Inventario dei file nuovi (registro `assets/audio/LICENZE.json`)

| File | Evento | Durata | LUFS | Picco | g | Peso ogg+mp3 |
|---|---|---|---|---|---|---|
| `sfx/crowd/ohh-1` | `crowd.ohh` | 4,0 s mono | −18,0 | −5,5 dBFS | 0,70 | 23 + 32 KB |
| `music/awards/trionfo` | `music.premiazioni` | 27,4 s stereo | −18,0 | −5,9 dBFS | 0,55 | 343 + 429 KB |
| `music/ceremony/il-mondo-e-nostro` | `music.cerimonia` | 48,0 s stereo | −18,0 | −2,6 dBFS | 0,55 | 633 + 751 KB |

Pipeline: le tre sorgenti aggiunte a `tools/audio-149/sorgenti.json` (URL, autore, licenza, data, sha256); `prepara-audio.py` ha un'opzione
nuova `--solo` che rielabora solo le uscite indicate e fonde nel registro: verificato che **le 51 righe del giro 149 sono rimaste identiche**
(confronto riga per riga col registro di prima). Le sorgenti non sono nel repo (cache fuori dal repo), come nel giro 149.

## 6. Pagina d'ascolto prima/dopo

`docs/sviluppo/giro161/ascolto.html` (sul sito, dopo il deploy: `prototipi/audio-161/`), registrata dal gioco vero con
`tests/visual/ascolto-161.mjs`. «Prima» = rosso `__CPM_NO_G161` sullo stesso build = audio del giro 149.

| Evento | Prima (picco · RMS · LUFS) | Dopo (picco · RMS · LUFS) |
|---|---|---|
| Gol subito | ≈ silenzio: −42,1 · −55,7 · −53,8 (residuo d'ambiente, l'evento non partiva) | −15,2 · −29,7 · −21,8 (fischi) |
| Palo: legno + «ohh» | −10,2 · −29,5 · −28,3 | −8,4 · −23,1 · −20,4 |
| Tiro fuori: «ohh» | −21,6 · −35,2 · n.d. | −12,9 · −25,4 · −22,5 |
| Calcio d'angolo: fischio + «ohh» | −15,2 · −23,4 · −16,7 | −11,5 · −25,9 · −21,3 |
| Premiazioni (15 s) | silenzio | −23,3 · −38,1 · −34,5 |
| Presentazione / fine stagione (15 s) | silenzio | −23,2 · −41,0 · −38,7 |

La musica esce a −34/−39 LUFS con i volumi di categoria di default: è lo stesso ordine dei loop dei menu misurati nel giro 149 (−36 LUFS).

## 7. Guardiano `npm run audio-161`

Statico (registro CC0 completo per i tre file · un solo punto di emissione e tre chiamate, niente `Math.random` · un solo effetto in
CareerApp) · sito servito come su Pages (tre file decodificati · `GoalAgainst` → fischi da file · palo/fuori → «ohh» da file · musica
assente in home e carriera, presente e giusta in ciascuna cerimonia, spenta all'uscita) · partita vera seedata (ogni gol subito ha la sua
emissione, almeno uno — zero = **non giudicato** = rosso · sequenza del libro mastro e risultato identici fra verde e rosso).
**Verde passa; rosso cade su 4-8** e il controllo 9 (sequenza) resta verde anche nel rosso, perché è il confronto fra i due bracci.

## 8. Catena dei controlli (uno alla volta, `free -m` e `df -h` prima di ognuno: ~13,5 GB liberi, 29 GB di disco)

Tutti sullo stesso sorgente (build `node tools/build-src.mjs` + `node tools/check-src.mjs` = **IDENTICO BYTE PER BYTE**).

| Controllo | Esito |
|---|---|
| `audio-149` | ✅ verde 8/8 (110 file con licenza, 54 CC0, 5,40 MB, 40 eventi, 54/54 decodificati anche senza rete, 37/37 eventi da file) · rosso cade |
| `audio-161` | ✅ verde · rosso cade su 4-8, sequenza identica (297 voci, 0-1) |
| `sw-cache-120` | ✅ verde (2ª e 3ª apertura senza rete montano, 0 file persi, audio al primo avvio 2,5 MB) · rosso ✅ |
| `twa-120` | ✅ 12/12 |
| build web (`build-dist --web`) | ✅ (file nuovi in `dist-web/assets/audio`) |
| build store (`build-dist` + `validate-dist`) | ✅ dist offline funzionante, 0 richieste esterne |
| `audit-copyright` | ✅ 0 riferimenti al mondo reale |
| `validate-situations` | ✅ 14/14, fingerprint 00001505, 0 failure (696 s) |
| `partita-vera` | ✅ 12 bande tenute, 2/2 partite finite |
| `match-sequence` | ✅ 1x/1x, 2x/2x, 1x/2x: 81/81 righe identiche, fischio finale 4/4 giri (minuto 92) |
| `replay` | ✅ 8 highlight, replay completi e coerenti |
| `test:logic` | ✅ 43/43 |
| `save-compat` | ✅ 12/12 |

Dichiarato: la prima esecuzione di `sw-cache-120` è caduta **prima di giudicare** per un `ENOENT` sulla cartella `tests/visual/out/`
(assente nel clone nuovo, è ignorata da git): creata la cartella, rilanciato da capo, verde. La prima esecuzione di `audio-161` è caduta per
i `node_modules` mancanti del banco (`npm install` in `tests/visual`). La prima esecuzione di `match-sequence` ha superato
il tetto di 10 minuti di una chiamata ed è stata interrotta (uscita 124, nessun verdetto): **non vale**, rifatta da capo in sottofondo con
attesa in primo piano sul file, verde.

## File toccati

`src/09-audio-scout-anagrafiche.jsx` (AudioMgr: tre voci in `F149`, `ceremony()`, ramo cerimonia di `musicStart`, `GoalAgainst`, «ohh»,
testimone `__CPM_AUDIO161`, `golSubito161`) · `src/15-live-match.jsx` (tre chiamate) · `src/18-career-app.jsx` (un effetto) ·
`src/17-menu-creazione-pannelli.jsx` (Crediti) · `CARRIER-MANAGER-AV.html` (ricomposto) · `sw.js` (+3 ogg nella precarica) ·
`assets/audio/**` (6 file + registro) · `tools/audio-149/**` (3 sorgenti, `--solo`) · `tests/visual/audio-161.mjs`,
`tests/visual/ascolto-161.mjs`, `tests/visual/package.json` · `docs/sviluppo/giro161/**` · `.github/workflows/deploy-pages.yml` (pagina
d'ascolto) · `docs/governo/ROADMAP.md`. **Non toccati:** motore della partita (nessun sorteggio, nessuno stato), carriera, salvataggi,
`GAME_VERSION`, il file Mixkit.

## Aperto per il PO (informazioni, nessuna decisione presa)

- **Mixkit:** il testo è sopra e nei file salvati; la scelta su repo pubblico/app resta tua.
- **«Ohh»:** taglio scelto sull'inviluppo, da confermare all'ascolto.
- **Gala:** fanfara del trofeo sopra il brano delle premiazioni senza abbassamento, da sentire dal vivo.
