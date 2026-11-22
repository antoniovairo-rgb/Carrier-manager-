# Rapporto giro 327 — due ritocchi decisi dal PO (22/11 18:55)

Ramo `sviluppo/giro327-ritocchi`, partito da `lavoro/201` (3cb166a: contiene i giri 323 e 326). GAME_VERSION non toccata.

## 1. Curva del salto a gennaio addolcita

**Cosa cambia.** `SALTO323` in `src/08-panchina-derby-meteo-cori.jsx`: metà da 66,4 → **69**, pendenza da 2 → **3**.
Restano uguali la soglia minima (Indice < 60 → 0) e il tetto (0,92). Il dado `u` resta quello seedato (nome, nazione,
stagione, settimana): nessun `Math.random`, stesso giocatore → stessa scelta.

| Indice | prima (66,4 / 2) | dopo (69 / 3) |
|---|---|---|
| 60 | 0,039 | 0,047 |
| 62 | 0,100 | 0,088 |
| 67 | 0,574 | 0,339 |
| 69 | 0,786 | 0,500 |
| 75 | 0,920 | 0,881 |

(valori letti dal gioco con `__CPM_CAREER.prob323`, nel guardiano)

**Guardiano `salto-323`.** Nessuna soglia toccata. Aggiunto un controllo sulla curva (P a 59,9/60/62/67/69/75/90 contro la
formula decisa, scarto < 0,002) e un rosso nuovo `CPM_ROSSO327=1` → `__CPM_NO_G327` (il gioco torna alla curva del 323).
- verde: 23 ok · 0 ko (exit 0)
- rosso `CPM_ROSSO327=1`: 22 ok · 1 ko, il controllo della curva (exit 1)
- rosso `CPM_ROSSO323=1`: 10 ok · 7 ko (exit 1), come prima
I casi deterministici restano verdi: Indice 16 → 0 salti su 24 semi; Indice 94 → 19/24; il flusso B usa il primo seme che salta.

**Sonda `misura-323`, 12 nomi per profilo** (stagione intera di Primavera sugli handler veri, 36 corse, ~26 s ciascuna).
Il controfattuale «prima» usa lo stesso Indice alla W19 e lo stesso dado `u` di ogni corsa con la curva del 323 (la curva
non cambia l'Indice, solo la soglia del dado).

| Profilo | Indice W19 (12 nomi) | P media dopo | salti osservati dopo | P media prima | salti prima (controfattuale) |
|---|---|---|---|---|---|
| OVR 58 | 41-50 | 0 | **0/12** | 0 | 0/12 |
| OVR 66 | 61-64 | 0,097 | **0/12** | 0,117 | 0/12 |
| OVR 74 | 65-72 | 0,327 | **2/12** (W20, W20) | 0,520 | 5/12 |

I due salti osservati coincidono con il ricalcolo dal dado (2/12). Con 12 nomi la frequenza vera **non posso confermarla**
oltre la P media: sull'OVR 66 una P di ~0,10 su 12 corse dà 0 salti con probabilità ~0,29, quindi lo 0/12 è compatibile.
Nota (già nel rapporto 323, dubbio 2): i dodici dadi sono gli stessi per i tre profili, perché il seme non dipende dall'OVR.

## 2. «Validate Situations» solo a mano

`.github/workflows/validate-situations.yml`: tolti `push` (main, staging, claude/**) e `pull_request`; resta solo
`workflow_dispatch`. Altri workflow non toccati; nessun altro workflow richiamava questo.
- prima: eventi `push`, `pull_request`, `workflow_dispatch`
- dopo: solo `workflow_dispatch`

`deploy-326` non leggeva quel file: gli ho aggiunto la **sezione E**, che lo legge e pretende un solo evento
`workflow_dispatch`. Verde: 0 controlli falliti; rosso `CPM_NO_G326=1` (file letti da c0dd9cf): 14 falliti, fra cui la E.
CLAUDE.md: aggiunta la riga della decisione accanto al paragrafo «IL GATE NON E' LA CI».

## Controlli

- `node tools/build-src.mjs` + `node tools/check-src.mjs`: IDENTICO byte per byte.
- `salto-323` verde + due rossi (sopra) · `deploy-326` verde + rosso · `trenino-317` verde · `rilascio-312` verde
  (al primo lancio rosso per un ramo remoto non scaricato nel clone, `origin/main` e `origin/lavoro/200`: scaricati in sola
  lettura, poi verde; nessuna modifica al guardiano).
- `node ci-runner.mjs giro salto-323` (CPM_CI_PAR=0): **18/18 verdi** sul build del ramo (salto-323 + 17 sentinelle, nessun passo instabile).
- Foto di collaudo rigenerate dalle sentinelle (`docs/collaudo-grafico/g0/…`) rimesse com'erano.
