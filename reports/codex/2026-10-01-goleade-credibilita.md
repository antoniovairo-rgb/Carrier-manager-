# Goleade e credibilità del risultato — collaudo numerico

Base verificata: `main` ccabb486d7bc957edc8d7a39ef45d2c51bb80d32, GAME_VERSION 7.999.96. Ramo del rapporto: `codex/2026-10-01-goleade-credibilita`.

**Esito:** parte A completa (700/700 partite); parte B non verificata (0/20 partite vere completate).
Il guardiano su 95–50 era già verde secondo la consegna; questo è un campione indipendente su sette accoppiamenti.

## Metodo e riproduzione

Il motore e il percorso di simulazione sono quelli di `tests/visual/goleade-test.mjs`: `creaPartita`, `creaMotoreV2`, `occasioniV2:false`, `v2:true`, `registra:false`, `eroeLato:home`, `tuttaSubito()`. Questo audit varia le forze e imposta `eroe.ovr` alla forza della squadra di casa; il guardiano originale prova solo 95–50 con eroe OVR 95. Per ogni coppia i 100 semi sono `960100 + 1000 × indiceCoppia + i`, con `i=0…99` nell’ordine della tabella. I valori vengono dal tabellino del motore e dagli eventi di gol.

Comando completo: `node tests/codex/goleade-credibilita.mjs A`. Analisi: `node tests/codex/goleade-report.mjs`. Dati partita per partita: `tests/codex/goleade-credibilita.json.gz`.

## Parte A — motore senza grafica

| Forze casa–ospite | N | Gol medi C–O | 7+ gol di una squadra | Scarto ≥5 | V/N/P favorito¹ | Tiri C–O | In porta C–O | Possesso C–O | Falli C–O |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 50-50 | 100 | 1,49–1,46 | 0 (0,0%) | 2 (2,0%) | 30,0%/27,0%/43,0% | 11,95–12,81 | 4,42–4,57 | 51,28–48,72 | 10,15–13,35 |
| 60-50 | 100 | 1,51–0,95 | 0 (0,0%) | 0 (0,0%) | 50,0%/26,0%/24,0% | 12,83–9,53 | 4,63–3,02 | 54,15–45,85 | 9,18–10,26 |
| 70-50 | 100 | 1,79–0,73 | 0 (0,0%) | 6 (6,0%) | 56,0%/26,0%/18,0% | 15,35–7,90 | 5,75–2,62 | 55,16–44,84 | 9,69–10,51 |
| 80-50 | 100 | 1,93–0,58 | 0 (0,0%) | 4 (4,0%) | 64,0%/23,0%/13,0% | 15,14–6,65 | 5,82–2,07 | 55,47–44,53 | 8,71–10,37 |
| 95-50 | 100 | 2,45–0,45 | 0 (0,0%) | 8 (8,0%) | 79,0%/11,0%/10,0% | 17,82–5,19 | 7,02–1,65 | 56,66–43,34 | 8,54–10,12 |
| 95-80 | 100 | 2,04–0,90 | 0 (0,0%) | 2 (2,0%) | 63,0%/21,0%/16,0% | 14,32–8,29 | 5,32–2,74 | 54,48–45,52 | 9,14–9,65 |
| 50-95 | 100 | 0,65–2,46 | 2 (2,0%) | 9 (9,0%) | 69,0%/21,0%/10,0% | 5,61–20,75 | 1,71–7,71 | 44,38–55,62 | 10,15–10,81 |

¹ Per 50–50 non c’è un favorito: la colonna riporta V/N/P della squadra di casa. Per 50–95 riporta la squadra ospite.

Nel 50–50: 10/100 risultati 0–0; 19/100 partite con almeno 5 gol totali.

Nel confronto con ospite a forza 50, passando da casa 50 a 95 i gol medi della casa vanno da 1,49 a 2,45, i tiri da 11,95 a 17,82 e il possesso da 51,28% a 56,66% (medie dei 100 semi per coppia nella tabella). Questo è un andamento misurato, non una valutazione esterna di realismo.

### Dieci risultati più frequenti per accoppiamento

- **50-50:** 0-1 (11), 0-0 (10), 1-1 (9), 1-2 (9), 2-2 (8), 3-0 (7), 0-2 (6), 0-3 (4), 1-0 (4), 1-3 (4).
- **60-50:** 2-1 (13), 1-0 (12), 1-1 (11), 0-0 (10), 2-0 (9), 0-1 (8), 3-0 (6), 1-2 (5), 2-3 (4), 1-3 (3).
- **70-50:** 3-0 (12), 2-0 (11), 0-0 (10), 0-1 (10), 1-0 (10), 1-1 (9), 2-2 (6), 2-1 (5), 0-2 (4), 3-1 (4).
- **80-50:** 2-0 (15), 3-0 (15), 1-1 (14), 1-0 (9), 0-0 (7), 0-1 (7), 2-1 (6), 4-0 (6), 3-1 (4), 5-0 (4).
- **95-50:** 1-0 (16), 3-0 (14), 4-0 (14), 2-0 (12), 1-1 (5), 2-1 (5), 5-0 (5), 0-0 (4), 0-1 (4), 1-2 (3).
- **95-80:** 3-0 (14), 2-1 (11), 0-0 (10), 1-0 (9), 1-1 (7), 2-0 (7), 1-2 (5), 4-1 (5), 3-1 (4), 4-0 (4).
- **50-95:** 0-3 (17), 0-2 (12), 1-1 (12), 0-1 (8), 1-3 (7), 0-4 (6), 0-5 (6), 1-0 (4), 1-4 (4), 2-2 (4).

### Semi delle goleade e degli scarti ≥5

- **50-50:** 960104 → 0-5 [scarto≥5]; 960107 → 5-0 [scarto≥5].
- **60-50:** nessuno nei 100 semi.
- **70-50:** 962109 → 5-0 [scarto≥5]; 962132 → 5-0 [scarto≥5]; 962142 → 0-5 [scarto≥5]; 962194 → 5-0 [scarto≥5]; 962196 → 5-0 [scarto≥5]; 962199 → 6-1 [scarto≥5].
- **80-50:** 963113 → 5-0 [scarto≥5]; 963126 → 5-0 [scarto≥5]; 963138 → 5-0 [scarto≥5]; 963197 → 5-0 [scarto≥5].
- **95-50:** 964100 → 5-0 [scarto≥5]; 964132 → 5-0 [scarto≥5]; 964137 → 6-0 [scarto≥5]; 964138 → 6-1 [scarto≥5]; 964176 → 5-0 [scarto≥5]; 964184 → 5-0 [scarto≥5]; 964186 → 6-0 [scarto≥5]; 964193 → 5-0 [scarto≥5].
- **95-80:** 965194 → 5-0 [scarto≥5]; 965196 → 5-0 [scarto≥5].
- **50-95:** 966105 → 1-7 [7+] [scarto≥5]; 966108 → 0-5 [scarto≥5]; 966127 → 0-5 [scarto≥5]; 966145 → 0-5 [scarto≥5]; 966146 → 0-6 [scarto≥5]; 966160 → 0-5 [scarto≥5]; 966175 → 0-5 [scarto≥5]; 966187 → 0-5 [scarto≥5]; 966196 → 1-7 [7+] [scarto≥5].

Controllo interno: 0 partite hanno un numero di eventi «gol» diverso dalla somma dei gol del risultato.

## Parte B — partita nel percorso carriera

Non verificato. Il primo avvio di Chrome è stato interrotto quando la memoria libera è scesa a 0,71 GB (misura con `node -e "console.log((require('os').freemem()/2**30).toFixed(2))"`). Nessun risultato di quella partita viene contato. La coda di goleade nel percorso carriera e la sorgente dei gol in eccesso restano non verificati.

## Verdetto e limiti

Nel motore senza grafica, la coda 7+ è presente; gli scarti ≥5 sono presenti. Il campione non dimostra una probabilità zero fuori dai semi provati.
Questi numeri descrivono il motore con occasioni dell’eroe disattivate. La corrispondenza con le partite vere, e la credibilità percepita dei singoli risultati, non sono verificate da questa parte.
Le anomalie osservate restano ipotesi fino alla riproduzione del team. Nessuna modifica al gioco.
