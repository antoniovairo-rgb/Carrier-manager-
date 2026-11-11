# Rapporto giro 149 — audio CC0 (PO-351)

**Richiesta PO (10/11):** «altra cosa da migliorare è l'audio, riesci a trovare effetti e musica più belle ed efficaci?» — fonti **solo CC0**,
ambito **tutto insieme**, versione 190. Ramo `sviluppo/giro149-audio` da `lavoro/189`. `GAME_VERSION` non toccato.

## In breve

- **51 file nuovi** (Ogg/Opus + MP3 di riserva, **3,24 MB** contro un tetto di 6 MB) per 37 eventi sonori: pallone, arbitro, folla,
  interfaccia, carriera, cerimonie, musica. Tutti da fonti **CC0 lette alla fonte** il 10/11/2026, con hash; nessun file generato da IA,
  nessun account creato.
- Il gioco suona il **file** e, se un file non carica, ripiega sulla **sintesi di oggi** (stesso meccanismo `_tryFetchDecode` di `URL_SFX`).
- **Varianti deterministiche** (4 calci, 3 passaggi, 2 teste, 2 pali, 2 parate, 2 contrasti, 2 fischi, 2 boati, 2 applausi, 3 click):
  `hashStr(chiave | seme di partita | contatore)`, mai la stessa due volte di fila. Seme = `bgSimSeedRef` della partita, passato a
  `AudioMgr.enterMatch(seed)`. **Nessun `Math.random` nuovo.**
- **Rosso `__CPM_NO_G149`** = audio di oggi (sintesi + boato Mixkit, Crediti di prima).
- **Guardiano `npm run audio-149`**: verde 8/8, rosso cade (0/51 file, 0/36 eventi da file).
- **Pagina d'ascolto** prima/dopo: `docs/sviluppo/giro149/ascolto.html`, sul sito in `prototipi/audio-149/` (dopo il deploy).

## 1. Inventario (evento → sorgente → misura)

Misure: registrazioni fatte **dal gioco vero** (`tests/visual/ascolto-149.mjs`, uscita del master con i volumi di categoria di
default), durata = finestra di registrazione, picco/RMS in dBFS, LUFS integrati dove il suono è abbastanza lungo, spettro grossolano =
baricentro spettrale e quota di energia gravi (<250 Hz) / medi (250-2000) / acuti (>2000).

| Evento | Sorgente prima | Misura prima | Sorgente dopo | Misura dopo |
|---|---|---|---|---|
| Calcio / tiro | sintesi: rumore passa-basso 0,09 s + tonfo sinusoidale 180→55 Hz, 4 varianti (Math.random) | 1.06 s · pk -12.1 · RMS -34.4 · -32.6 LUFS · 428 Hz (gravi/medi/acuti 54/43/3%) | 4 file: guanto da boxe (Designer's Choice) filtrato | 1.06 s · pk -8.5 · RMS -29.9 · -27.2 LUFS · 1078 Hz (40/45/14%) |
| Passaggio | sintesi: rumore passa-basso 0,06 s | 0.94 s · pk -24.8 · RMS -40.4 · 660 Hz (gravi/medi/acuti 37/56/7%) | 3 file: guanto da boxe, piu' leggero | 0.94 s · pk -11.9 · RMS -28.6 · 997 Hz (39/48/13%) |
| Colpo di testa | sintesi: rumore 700 Hz + tonfo 150→75 Hz | 0.94 s · pk -15.9 · RMS -30.7 · 414 Hz (gravi/medi/acuti 52/45/2%) | 2 file: guanto da boxe, piu' sordo | 0.94 s · pk -8.5 · RMS -29.3 · 720 Hz (32/60/7%) |
| Palo (con la folla) | sintesi: triangolo 190-220 Hz 0,5 s + «ohh» sintetico | 2.02 s · pk -10.1 · RMS -24.6 · 1093 Hz (gravi/medi/acuti 25/60/15%) | 2 file: ringhiera metallica + «ohh» sintetico (nessun «ohh» CC0 trovato) | 2.02 s · pk -9.2 · RMS -29.3 · -28.1 LUFS · 1591 Hz (38/41/21%) |
| Parata (con la folla) | sintesi: rumore 2,4 kHz + tonfo + «ohh» sintetico | 2.02 s · pk -17.2 · RMS -31.9 · 1232 Hz (gravi/medi/acuti 19/62/19%) | 2 file: schiaffo di guanto + applausi veri | 2.02 s · pk -7.5 · RMS -31.0 · -27.3 LUFS · 2989 Hz (2/50/48%) |
| Contrasto | sintesi: rumore passa-basso 0,05 s | 1.42 s · pk -28.4 · RMS -42.2 · 400 Hz (gravi/medi/acuti 43/55/2%) | 2 file: caduta sull'erba, rimbalzo di pallone | 1.42 s · pk -10.8 · RMS -27.9 · 1038 Hz (33/50/18%) |
| Gol: rete + boato | sintesi rete + boato Mixkit (licenza Mixkit, non CC0) | 5.14 s · pk -2.3 · RMS -21.1 · -17.5 LUFS · 1334 Hz (gravi/medi/acuti 2/82/16%) | file rete (fruscio di stoffa) + 2 boati (Designer's Choice) | 5.14 s · pk -7.8 · RMS -22.9 · -18.6 LUFS · 2853 Hz (2/53/45%) |
| Fischietto (fallo) | sintesi: sinusoide 2,1 kHz con vibrato 17 Hz | 1.66 s · pk -13.1 · RMS -17.7 · 2123 Hz (gravi/medi/acuti 0/4/96%) | 2 file: fischietto a pallina reale | 1.66 s · pk -15.3 · RMS -23.1 · -16.5 LUFS · 3216 Hz (0/2/98%) |
| Fischio doppio (fuorigioco) | sintesi, 2 soffi | 1.42 s · pk -13.0 · RMS -18.5 · 2125 Hz (gravi/medi/acuti 0/5/95%) | file: Fox 40 reale, due soffi | 1.42 s · pk -7.4 · RMS -21.6 · -14.9 LUFS · 4744 Hz (0/0/100%) |
| Triplice fischio | sintesi, 3 soffi | 5.74 s · pk -13.0 · RMS -16.9 · -11.3 LUFS · 2140 Hz (gravi/medi/acuti 0/5/95%) | file: tre soffi reali, l'ultimo lungo | 5.74 s · pk -13.6 · RMS -21.8 · -15.8 LUFS · 3201 Hz (0/3/97%) |
| Fallo: fischio + fischi della curva | solo fischietto sintetico | 2.14 s · pk -13.0 · RMS -17.7 · 2123 Hz (gravi/medi/acuti 0/4/96%) | fischietto reale + fischi della folla (nuovo) | 2.14 s · pk -12.8 · RMS -24.7 · -18.3 LUFS · 3295 Hz (0/2/98%) |
| Applausi | sintesi: rumore passa-alto con tremolo 9-12 Hz | 3.46 s · pk -20.5 · RMS -35.4 · -29.7 LUFS · 5095 Hz (gravi/medi/acuti 0/26/73%) | 2 file: applausi veri | 3.46 s · pk -10.4 · RMS -26.9 · -22.6 LUFS · 2793 Hz (3/52/45%) |
| Esultanza | sintesi: come gli applausi, piu' corti | 2.62 s · pk -18.7 · RMS -34.0 · -28.1 LUFS · 5076 Hz (gravi/medi/acuti 0/27/73%) | file: esultanza vera | 2.62 s · pk -11.6 · RMS -25.6 · -21.2 LUFS · 2854 Hz (2/54/45%) |
| Tocco di un pulsante | sintesi (oscillatori) | 0.62 s · pk -23.2 · RMS -36.4 · 852 Hz (gravi/medi/acuti 6/88/5%) | file CC0 (Kenney / cynicmusic / OGA) | 0.62 s · pk -18.2 · RMS -38.6 · 3311 Hz (9/41/50%) |
| Conferma | sintesi (oscillatori) | 0.82 s · pk -19.8 · RMS -32.4 · 673 Hz (gravi/medi/acuti 3/95/2%) | file CC0 (Kenney / cynicmusic / OGA) | 0.82 s · pk -13.7 · RMS -24.4 · 742 Hz (3/97/1%) |
| Errore | sintesi (oscillatori) | 0.7 s · pk -20.5 · RMS -31.8 · 3330 Hz (gravi/medi/acuti 23/31/46%) | file CC0 (Kenney / cynicmusic / OGA) | 0.74 s · pk -14.6 · RMS -29.7 · 2645 Hz (9/48/43%) |
| Finestra che si apre | sintesi (oscillatori) | 0.82 s · pk -21.6 · RMS -34.2 · 563 Hz (gravi/medi/acuti 7/91/2%) | file CC0 (Kenney / cynicmusic / OGA) | 0.82 s · pk -15.1 · RMS -28.3 · 415 Hz (8/92/0%) |
| Notifica positiva | sintesi (oscillatori) | 1.06 s · pk -19.0 · RMS -32.3 · 950 Hz (gravi/medi/acuti 1/98/1%) | file CC0 (Kenney / cynicmusic / OGA) | 1.06 s · pk -13.8 · RMS -27.8 · -23.2 LUFS · 2898 Hz (0/30/70%) |
| Avanza la settimana | sintesi (oscillatori) | 1.06 s · pk -22.7 · RMS -34.9 · 677 Hz (gravi/medi/acuti 3/95/2%) | file CC0 (Kenney / cynicmusic / OGA) | 0.98 s · pk -14.9 · RMS -30.6 · 2472 Hz (1/75/24%) |
| Firma del contratto | sintesi (oscillatori) | 1.82 s · pk -17.8 · RMS -30.8 · -27.2 LUFS · 1567 Hz (gravi/medi/acuti 1/82/17%) | file CC0 (Kenney / cynicmusic / OGA) | 1.82 s · pk -14.1 · RMS -28.4 · -24.5 LUFS · 1349 Hz (1/78/21%) |
| Convocazione | sintesi (oscillatori) | 1.42 s · pk -18.9 · RMS -32.1 · -28.4 LUFS · 1829 Hz (gravi/medi/acuti 0/82/17%) | file CC0 (Kenney / cynicmusic / OGA) | 1.42 s · pk -19.1 · RMS -28.4 · -24.9 LUFS · 1621 Hz (1/81/19%) |
| Record | sintesi (oscillatori) | 1.54 s · pk -17.1 · RMS -29.7 · -25.5 LUFS · 2075 Hz (gravi/medi/acuti 0/82/18%) | file CC0 (Kenney / cynicmusic / OGA) | 1.54 s · pk -14.5 · RMS -28.1 · -24.4 LUFS · 1166 Hz (2/80/18%) |
| Retrocessione | sintesi (oscillatori) | 1.7 s · pk -17.1 · RMS -31.3 · -28.9 LUFS · 781 Hz (gravi/medi/acuti 22/70/8%) | file CC0 (Kenney / cynicmusic / OGA) | 1.7 s · pk -14.4 · RMS -28.4 · -24.9 LUFS · 1046 Hz (8/78/14%) |
| Trofeo / promozione (cerimonia) | sintesi (oscillatori) | 9.14 s · pk -11.7 · RMS -30.3 · -26.1 LUFS · 5032 Hz (gravi/medi/acuti 0/27/73%) | file CC0 (Kenney / cynicmusic / OGA) | 9.14 s · pk -11.9 · RMS -29.2 · -25.9 LUFS · 2416 Hz (6/57/37%) |
| Musica dei menu (8 s) | sintesi (oscillatori) | 8.14 s · pk -23.5 · RMS -38.4 · -36.5 LUFS · 700 Hz (gravi/medi/acuti 45/48/7%) | file CC0 (Kenney / cynicmusic / OGA) | 8.14 s · pk -18.7 · RMS -37.2 · -36 LUFS · 2326 Hz (35/35/30%) |
| Musica della carriera (8 s) | sintesi (oscillatori) | 7.94 s · pk -23.9 · RMS -38.5 · -36.6 LUFS · 691 Hz (gravi/medi/acuti 46/48/6%) | file CC0 (Kenney / cynicmusic / OGA) | 8.14 s · pk -19.0 · RMS -33.2 · -34.4 LUFS · 2090 Hz (54/23/24%) |

**Giudizio sul prima, dalle misure:** gli impatti sintetici erano **quasi solo gravi** (calcio 54% sotto 250 Hz, 3% sopra 2 kHz: un «tonfo»,
manca lo schiocco del cuoio) e **molto bassi** (passaggio −40 dB RMS, contrasto −43: di fatto inudibili sopra il brusio). Gli applausi
sintetici stavano a −35 dB RMS. Il fischietto era il suono più forte del gioco (−17,6 dB RMS, tono puro): dopo è un fischio reale a −23 dB.

**Dove manca un suono (oggi e dopo):**
- **«ohh» della folla** (palo, tiro fuori, respinta): resta sintetico. L'unica registrazione di stadio CC0 trovata (Commons, «Match amical
  France-USA — 58241 spectateurs — Action ratée sur faute», autore Romainbehar, CC0 letta sulla pagina) **non è scaricabile da qui**:
  `upload.wikimedia.org` risponde **429 Too Many Requests** (limite condiviso dell'IP dell'ambiente). Non aggirato.
- **Gol subito (`GoalAgainst`)**: `AudioMgr` lo gestisce ma **nessuno lo emette** nel codice (grep: zero `cpmEmit("GoalAgainst"`), quindi
  sul gol avversario la folla tace. I fischi CC0 ci sono (`crowd.boo`): oggi suonano sul fallo.
- **Cori**: nessuna fonte CC0 di cori da stadio trovata; restano assenti come prima.
- **Telecronaca**: predisposta (interruttore), nessuna sorgente — fuori ambito.
- **Musica fuori partita**: resta **spenta** per la decisione PO del 23/09 («musica menu da eliminare», rosso `__CPM_NO_MUSICA23`). I due
  loop sono pronti e suonano dal file solo dove la musica suona (vedi domande aperte).

## 2. Ricerca delle fonti CC0

| Fonte | Esito dalla rete dell'ambiente |
|---|---|
| kenney.nl | **403** da nginx del sito (non dal proxy). Non aggirato; i pacchetti Kenney presi da **OpenGameArt**, dove Kenney stesso li ha pubblicati (CC0 sulla pagina e `License.txt` nel pacchetto) |
| freesound.org, cdn.freesound.org | **403** (risposta vuota). Non aggirato; nessun account |
| pixabay.com | **403** (pagina di verifica anti-bot «Just a moment…»). Non aggirato — e comunque la licenza Pixabay non è CC0 |
| sonniss.com, zapsplat.com | **403** |
| commons.wikimedia.org (API) | **429** costante (`x-envoy-ratelimited`, IP condiviso); pagine HTML raggiungibili lentamente |
| upload.wikimedia.org | **429** sul file dello stadio |
| opengameart.org | 200 — filtro licenza CC0 |
| archive.org | 200 — usata **solo** la collezione *The Designer's Choice*, caricata dall'autore stesso (Nicholas A. Judy) con `licenseurl` CC0 e descrizione «recorded, edited and designed by Nicholas A. Judy». Scartati gli oggetti archive.org con CC0 dichiarato da chi non ne è autore (es. «Red Library», «SSE Library»: librerie commerciali ricaricate da terzi) |

### Tabella delle licenze (una riga per sorgente; il registro file per file è `assets/audio/LICENZE.json`)

| Sorgente | Autore | Pagina | Licenza letta | Data | sha256 sorgente | File del gioco |
|---|---|---|---|---|---|---|
| tdc-fight-glove | Nicholas A. Judy (The Designer's Choice) | [pagina](https://archive.org/details/Designers-Choice-Collection-Fight) | CC0 1.0 | 2026-11-10 | `ff1eba4769ac435e…` | calcio-1, calcio-2, calcio-3, calcio-4, passaggio-1, passaggio-2, passaggio-3, testa-1, testa-2 |
| tdc-metal-railing1 | Nicholas A. Judy (The Designer's Choice) | [pagina](https://archive.org/details/Designers-Choice-Collection-Metal) | CC0 1.0 | 2026-11-10 | `f0a211fffdac8461…` | palo-1 |
| tdc-metal-railing2 | Nicholas A. Judy (The Designer's Choice) | [pagina](https://archive.org/details/Designers-Choice-Collection-Metal) | CC0 1.0 | 2026-11-10 | `50fe48f9e75452b9…` | palo-2 |
| tdc-cloth-swish | Nicholas A. Judy (The Designer's Choice) | [pagina](https://archive.org/details/Designers-Choice-Collection-Cloth) | CC0 1.0 | 2026-11-10 | `5d45f3485d6ffa51…` | rete-1 |
| tdc-fight-bodyfall | Nicholas A. Judy (The Designer's Choice) | [pagina](https://archive.org/details/Designers-Choice-Collection-Fight) | CC0 1.0 | 2026-11-10 | `f597a039523aa8ee…` | contrasto-1 |
| tdc-sports-bounce | Nicholas A. Judy (The Designer's Choice) | [pagina](https://archive.org/details/Designers-Choice-Collection-Sports) | CC0 1.0 | 2026-11-10 | `71100fd5bcb787cf…` | contrasto-2 |
| tdc-cloth-slap | Nicholas A. Judy (The Designer's Choice) | [pagina](https://archive.org/details/Designers-Choice-Collection-Cloth) | CC0 1.0 | 2026-11-10 | `8483eb1f3eabe18b…` | parata-1 |
| tdc-fight-smacks | Nicholas A. Judy (The Designer's Choice) | [pagina](https://archive.org/details/Designers-Choice-Collection-Fight) | CC0 1.0 | 2026-11-10 | `d9f7fd3074f0afe4…` | parata-2 |
| tdc-whistles-pea | Nicholas A. Judy (The Designer's Choice) | [pagina](https://archive.org/details/Designers-Choice-Collection-Whistles) | CC0 1.0 | 2026-11-10 | `8a075e48be2aa1e9…` | fischio-1, fischio-2, fischio-finale |
| tdc-whistles-fox40 | Nicholas A. Judy (The Designer's Choice) | [pagina](https://archive.org/details/Designers-Choice-Collection-Whistles) | CC0 1.0 | 2026-11-10 | `ea2f0be4659399dc…` | fischio-doppio |
| tdc-crowds-applause | Nicholas A. Judy (The Designer's Choice) | [pagina](https://archive.org/details/Designers-Choice-Collection-Crowds) | CC0 1.0 | 2026-11-10 | `726f452c461dd73f…` | boato-1, boato-2, applausi-1, applausi-2, esulta-1 |
| tdc-whistles-crowd | Nicholas A. Judy (The Designer's Choice) | [pagina](https://archive.org/details/Designers-Choice-Collection-Whistles) | CC0 1.0 | 2026-11-10 | `aa592af5f69c834d…` | fischi-1 |
| kenney-interface | Kenney (www.kenney.nl) | [pagina](https://opengameart.org/content/interface-sounds) | CC0 | 2026-11-10 | `f2193d072726d675…` | click-1, click-2, click-3, nav-1, indietro-1, conferma-1, errore-1, popup-1, chiudi-1, positiva-1, negativa-1, info-1, settimana-1, busta-1 |
| kenney-jingles | Kenney Vleugels (www.kenney.nl) | [pagina](https://opengameart.org/content/85-short-music-jingles) | CC0 | 2026-11-10 | `be324b6cf26e35c9…` | contratto-1, rinnovo-1, record-1, convocazione-1, traguardo-1, livello-1, retrocessione-1, rivelazione-1 |
| oga-victory-fanfare | cynicmusic | [pagina](https://opengameart.org/content/victory-fanfare-short) | CC0 | 2026-11-10 | `cf7aca1193530c80…` | fanfara-1 |
| oga-beach-sports | Trex0n (nota sulla pagina: Cal McEachern) | [pagina](https://opengameart.org/content/beach-sports-theme-loop) | CC0 | 2026-11-10 | `45b2d7d397c70f42…` | spiaggia-loop |
| oga-happy-adventure | TinyWorlds | [pagina](https://opengameart.org/content/happy-adventure-loop) | CC0 | 2026-11-10 | `50aa6a32625fe856…` | avventura-loop |

Per gli oggetti archive.org l'md5 del file scaricato coincide con quello pubblicato nei metadati dell'oggetto (verificato su tutti e 12).

### Il boato Mixkit (la domanda del PO)

`mixkit-stadium-joy-shouting-crowd-3022.wav` **non è CC0**: la pagina mixkit.co/license lo mette sotto la «Sound Effects Free License»,
licenza propria Mixkit/Envato. **Non posso confermare il testo esatto delle clausole**: sulla pagina il testo è caricato da script e non
compare nell'HTML scaricabile. Con la regola «solo CC0» va sostituito: **nel verde il gioco non lo scarica più** (usa i due boati CC0) e
nei Crediti la sua voce resta solo col rosso. **Il file è ancora nel repo** (2,7 MB): toglierlo è una decisione del PO (domanda 1).

## 3. Innesto

- **Pipeline riproducibile**: `tools/audio-149/sorgenti.json` (URL, autore, licenza, data, sha256) + `tools/audio-149/prepara-audio.py`
  (scarica nella cache, **verifica l'hash** e si ferma se la sorgente è cambiata, taglia, filtra, normalizza, codifica). Due esecuzioni
  danno **file identici byte per byte** (`-fflags +bitexact`, numero di serie Ogg fisso).
- **Livelli** (dichiarati nel registro): suoni sostenuti ≥1 s a **−18 LUFS integrati** con picco ≤ −1,5 dBFS; impatti <1 s (dove i LUFS
  integrati non sono definiti, gating su blocchi da 400 ms) a **picco −3 dBFS**. Il livello in partita lo dà il guadagno `g` di ogni
  evento, tarato sulla registrazione prima/dopo: fischietto alzato di 7 dB, calcio e click abbassati.
- **Formati**: Ogg/Opus 48 kb/s mono (96 kb/s stereo per musica e fanfara) + MP3 64/128 kb/s di riserva per i browser che non
  decodificano Opus. Il gioco prova l'ogg, poi l'mp3, poi la sintesi.
- **Loop**: tolto dalla musica il silenzio di testa del codificatore mp3 della sorgente (29,7 ms misurati su «Happy Adventure»): il giunto
  non ha buco. «Beach Sports» chiude in un vuoto del suo ritmo staccato (−42 dB) e riparte sul battere: salto di campione al giunto 0,004.
- **Offline**: `sw.js` precarica i 51 ogg nel guscio (l'audio si scarica al primo gesto, che può arrivare prima che il service worker
  controlli la pagina); costo misurato da `sw-cache-120`: **+1,5 MB al primo avvio**. L'mp3 di riserva non si precarica.
- **Build**: `build-dist` copia `assets/` intera → i file ci sono in `dist/` e `dist-web/` (verificato).
- **Crediti** del gioco: cinque voci CC0 nella sezione Suoni (rosso: torna la voce Mixkit).

File toccati: `src/09-audio-scout-anagrafiche.jsx` (AudioMgr), `src/15-live-match.jsx` (una riga: il seme a `enterMatch`),
`src/17-menu-creazione-pannelli.jsx` (Crediti), `sw.js`, `.github/workflows/deploy-pages.yml`, `assets/audio/**`, `tools/audio-149/**`,
`tests/visual/audio-149.mjs`, `tests/visual/ascolto-149.mjs`, `docs/sviluppo/giro149/**`. **Non toccati**: motore, partita, carriera,
salvataggi, `GAME_VERSION`.

## 4. Guardiano `npm run audio-149`

Statico: ogni file audio del repo ha la riga di licenza e ogni riga il suo file (104/104) · tutti i file del giro CC0 con fonte completa ·
peso sotto il tetto · livelli in fascia · tabella del gioco e precarica di `sw.js` uguali al registro. Browser, sul sito servito come su
GitHub Pages: prima apertura con 51/51 file decodificati e livelli in uscita fra −40 e −1 dBFS di picco, 36/36 eventi che partono da
file (compresi fanfara+applausi e i due loop) · seconda apertura **senza rete** con 51/51 decodificati dalla cache. Verde e rosso in fondo
all'uscita; «non giudicato» (sonda assente, pagina che non monta) = rosso.

## 5. Catena dei controlli (uno alla volta, `free -m` e `df -h` prima di ognuno: ~14 GB liberi, 29 GB di disco)

| Controllo | Esito | Build |
|---|---|---|
| `audio-149` | ✅ verde 8/8 · rosso cade (0/51 file, 0/36 eventi da file) | finale |
| `sw-cache-120` | ✅ verde (2ª e 3ª apertura senza rete montano, 0 file persi; primo avvio +1,5 MB di audio) · rosso ✅ | prima dei Crediti |
| `twa-120` | ✅ 12/12 | prima dei Crediti |
| build web (`build-dist --web`) | ✅ | finale |
| build store (`build-dist` + `validate-dist`) | ✅ dist offline funzionante, i file audio sono in `dist/assets/audio` | finale |
| `audit-copyright` | ✅ 0 riferimenti al mondo reale | finale |
| `validate-situations` | ✅ 14/14, fingerprint 00001505, 0 failure (due volte: prima e dopo i Crediti) | finale |
| `partita-vera` | ✅ 12 bande tenute, 2/2 partite finite | finale |
| `test:logic` | ✅ 43/43 | finale |
| `save-compat` | ✅ 12/12 | finale |

Dichiarato: `sw-cache-120` e `twa-120` sono girati sul build **prima** dell'aggiunta delle cinque voci ai Crediti (solo testo della
schermata Crediti; `sw.js` e il service worker invariati da allora). Un mio errore di metodo, corretto subito: un'attesa scritta con
`pgrep -f` (vietato dal compito) è stata fermata dopo pochi secondi e sostituita da un'attesa sul file di log; non ha toccato il gate.

## Domande aperte per il PO

1. **Il file Mixkit** (non CC0, 2,7 MB) va tolto dal repo? Oggi non si scarica più, serve solo al rosso.
2. **Musica fuori partita**: la decisione del 23/09 la spegne. Con due loop veri (ascoltabili nella pagina) vuoi riaccenderla, e dove
   (menu, carriera, solo cerimonie)?
3. **Gol subito**: vuoi i fischi della curva sul gol avversario? Serve emettere l'evento dal motore della partita (oggi non esiste), quindi
   tocca la partita e la catena completa.
4. **«Ohh» e stadio**: la registrazione CC0 dello stadio di Commons è bloccata dal limite di richieste dell'ambiente. Va riprovata da
   un'altra rete (basta rilanciare il download con l'hash nel rapporto) — oppure si tiene l'«ohh» sintetico?
5. **Calcio dal guanto da boxe**: nessuna registrazione CC0 di un pallone da calcio è raggiungibile da qui; il «pop» è cuoio su cuoio
   filtrato. Ti convince all'ascolto?

## Ascolto

`docs/sviluppo/giro149/ascolto.html` — 26 eventi, pulsanti ▶ prima / ▶ dopo, «tutti prima» / «tutti dopo», misure sotto ogni riga.
Registrazioni rifatte con `node tests/visual/ascolto-149.mjs` (dopo `node tools/build-dist.mjs --web`).
