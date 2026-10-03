# Risposta del team ai collaudi Codex del 3 ottobre

Base del team: `GAME_VERSION="7.999.117"`, rilasciata con `main` **86160d1e**. I dati di prova citati sotto sono entrati dopo: usa `main` **8e573bc9** o successivo (stesso gioco, 7.999.117). Le versioni dopo la tua base (7.999.112) sono:

- 7.999.113: conferenza pre-partita e partita già giocata (PO-194);
- 7.999.114: calendario e offerte;
- 7.999.115: walkout (PO-197);
- 7.999.116 e 7.999.117: premiazione (PO-191).

Nessuna tocca il motore della partita né i colpi di testa.

## 1. Cosa abbiamo riprodotto e cosa resta ipotesi

**PO-077, scena 171: riprodotto.** Il nostro guardiano `tests/visual/testa-tempismo-test.mjs`, rilanciato sulla 7.999.117, dà per gi171:

| Caso gi171 | Scarto picco–contatto | Distanza testa–pallone |
| --- | ---: | ---: |
| primo | 0,1 s | 0,219 u |
| secondo | 0 s | 0,091 u |

Concorda con i tuoi 80 ms e 0,162 u. Il tuo rosso (591 ms con `__CPM_NO_TUFFO109`) conferma che l'effetto viene dalla correzione 7.999.109.

- **Chiuse solo per le scene misurate:** gi6, gi7 e gi55, sulla base dei tuoi tre success e tre fail.
- **Ancora aperte:** gi64 (non ho letto la serie completa), **gi86** (parziale) e **gi90** (mancante).
- **PO-077 resta aperto.**
- I «passi del pallone oltre 85 u/s» su gi6 e gi7 restano **ipotesi**. Il tuo testimone non li lega allo stacco né agli stacchi neri. Per attribuirli serve `__CPM_BJ478`, il varco che indica la sorgente di ogni riassegnazione secca e lo stato dello stacco nero: vedi `npm run ball-jump-census`.

**PO-190, goleade: il tuo campione non lo riproduce, ma non lo esclude.**
- Le tue 612 gare sono **tutte simulate**, con eroi da OVR 64 a 76.
- Nel salvataggio del PO (S12, eroe OVR 93) le partite di campionato registrate sono 29. Di queste, **27 sono vissute e 2 simulate**, e le 4 con 6 o più gol fatti (8-0, 10-0, 6-1, 6-0) sono **tutte senza la marca `simulated`**, quindi vissute.
- L'ipotesi da verificare è quindi: **gli highlight dell'eroe nelle partite vissute aggiungono gol** oltre a quelli del motore. Il tuo braccio simulato non può vederlo per costruzione.
- Il nostro braccio vissuto è nella sezione 4.

**Difesa 3D: non sommiamo nulla.** Prendiamo atto dell'orologio verificato (300/300/300), e i casi raccolti con il vecchio orologio restano separati. Ad oggi non c'è nessun rilievo da riprodurre.

**PO-191, premiazione: misurata dal team sulla 7.999.116 e sulla 7.999.117.** I dettagli sono nella sezione 3.

## 2. Non chiudiamo nulla su campioni parziali

Nel backlog lo stato resta:
- **PO-077:** aperto;
- **PO-190:** DA MISURARE;
- **PO-191:** PARZIALE (restano la posa delle gambe e un avversario che corre davanti al palco);
- **ricollaudo difesa:** aperto.

## 3. Nuovi testimoni e agganci, tutti attivi in `?cpmtest=1`

- **`window.__CPM_CERT_SET = <secondi>`** sposta il tempo della cerimonia. In headless la cerimonia 3D gira a circa 1 fotogramma al secondo e il tempo di scena è limitato a 0,05 s per fotogramma: senza questo aggancio non si arriva mai al sollevamento.
  - Le durate dei momenti sono in `window.__CPM_CER425.beats/beatsD`.
  - Prima di leggerle, aspetta `!!window.__CPM_CER425`: la cerimonia può partire con qualche secondo di ritardo.
- **`window.__CPM_CER476`** è un campione per fotogramma della cerimonia. I campi nuovi sono:
  - `podio.rot` e `podio.rett`: rotazione e forma del palco. Il palco è **rettangolare** dalla 7.997: corpo 6,4 × 2,8 alto 1,05, gradino 7,4 × 3,8 alto 0,28. Il vecchio test sul cerchio di raggio 1,7 non è più valido.
  - `mates`: distanza di ogni corpo dal centro del podio.
  - `mani`: `dL`, `dR`, `lY`, `rY`, `tY`, `testaY`, cioè coppa e mani nello stesso fotogramma.
- **`window.__CPM_WALK197 = {}`**, da armare prima del caricamento: per ogni corpo nel walkout registra `sp` (velocità vera), `spS`, `locB` e `run` (peso della clip di corsa).
- Nuovi guardiani, utili come modello di sonda:
  - `premiazione-palco-191.mjs`;
  - `coppa-mani-191.mjs`;
  - `walkout-fermi-197.mjs`;
  - `partita-rigiocata-194.mjs`;
  - `calendario-offerte-195.mjs`.
- **Dati di prova** in `tests/visual/fixtures/`:
  - `save-190-s12-ovr93.json`: il salvataggio del PO, S12, eroe OVR 93, Premier Division, settimana 38;
  - `save-194-primavera-w38.json`;
  - `save-195-primavera-w39.json`.
  - Si caricano con `localStorage.setItem('cpm-v3', JSON.stringify(save))` in `addInitScript`.
- **Registro degli eventi** `__CPM_EV()`:
  - le voci sono **piatte**: `{ev:'goal', side, src, min}`, non sotto `.d`;
  - `side:'home'` è sempre la squadra dell'eroe;
  - `src` vale `microsim`, `cronaca`, `highlight` (gol dell'eroe su azione) o `setpiece` (gol dell'eroe da palla ferma).

## 4. PO-190: braccio vissuto (team)

Misurato dal team sulla **7.999.117** (`main` 86160d1e) con 12 partite vissute dal salvataggio `save-190-s12-ovr93.json`.

**Metodo**
- La partita è la stessa per tutte e 12: settimana 38, stesso avversario. Cambia solo il nome dell'eroe, e quindi il seme.
- Si entra con `__CPM_CAREER.playMatch()` e si gioca con `__CPM_AUTOPLAY(true,{policy:'seeded'})` a velocità 4.
- I gol si leggono da `__CPM_EV()`.

**Risultati**
- **1,00 gol fatti e 0,42 subiti a partita.**
- Nessuna partita con 6 o più gol, nessuno scarto di 5 o più.
- Gol della squadra dell'eroe:

  | Fonte | Gol |
  | --- | ---: |
  | `highlight` | 7 |
  | `setpiece` | 2 |
  | `cronaca` (motore) | 3 |

  L'eroe segna quindi il 75% dei gol della squadra (9 su 12).
- Gol subiti: 5, tutti da `cronaca`.

**Cosa se ne può concludere**
- Sulla versione attuale le goleade della stagione del PO **non si riproducono** in questo campione.
- Il campione però è piccolo e ha un solo avversario e una sola settimana, quindi **non le esclude**.
- Non sappiamo con quale versione il PO abbia giocato l'8-0 e il 10-0 della S12: **non posso confermarlo**. La gestione del vantaggio a gradini è entrata nella 7.999.98, il 01/10.
- Un segnale da verificare in senso **opposto**: nelle partite vissute il motore segna poco per una squadra di vertice (0,25 a partita), e la quota dell'eroe è del 75%, contro il 52% della stagione del PO.

Grezzo e sonda: `/tmp` della sessione del team, non nel repository. Il metodo è descritto sopra ed è ripetibile con il salvataggio in `fixtures`.

## 5. Richiesta a Codex

1. **PO-190, nell'ordine:**
   - braccio vissuto dal salvataggio `save-190-s12-ovr93.json`, almeno 30 partite con nomi diversi (il seme nasce da avversario + stagione + settimana + nome), separando i gol per `src`;
   - poi una carriera con rinnovi accettati dalla UI prima della scadenza, fino a OVR ≥ 85, con le partite vissute e quelle simulate in colonne separate.
2. **PO-077:** completa gi64, gi86 e gi90 (tre success e tre fail), e il rosso della 171 almeno 3 volte.
3. **PO-191:** sulla base 7.999.117, usa `__CPM_CERT_SET` per ogni momento della cerimonia. Misura nel riferimento del palco (`podio.rot`):
   - quota dei piedi rispetto al piano sotto i piedi;
   - corpi dentro il rettangolo con quota 0, cioè dentro il solido;
   - avversari o arbitro che passano davanti al palco.
4. Per ogni rilievo indica commit, `GAME_VERSION`, comando esatto e grezzo, come hai fatto finora.
