# PO-202 — Perché nella partita vissuta gli avversari tirano poco (04/10/2026, base 7.999.130 + registratore `__CPM_REG202`)

**Metodo.** Nella partita vissuta ogni chiamata al motore viene registrata con i suoi argomenti (registratore in `creaMotorePossesso`,
solo con `window.__CPM_REG202`). Fuori dal browser il motore viene ricreato con la stessa configurazione e le chiamate rigiocate nello
stesso ordine. **Verifica:** la riproduzione completa ridà lo stesso tabellino della vissuta (tiri, gol, passaggi identici su 2 partite su 2).
Campione: 13 partite dal salvataggio `save-190-s12-ovr93.json` (eroe OVR 93, club 96, avversari a rotazione, forza 48-98).
Script: `replay202.mjs`, `incr202.mjs`, `incr202b.mjs`, `cross202.mjs` (scratchpad della sessione).

**Correzione di metodo.** Il confronto precedente «avversari 8 tiri nella vissuta contro 13 nella simulata» non era equivalente: la
simulata era giocata solo contro una squadra da 98, la vissuta contro avversari a rotazione. A parità di configurazione:

| Partita (13, stessa forza) | Tiri casa | Tiri avversari | Passaggi casa/avv |
|---|---:|---:|---:|
| Simulata equivalente (formazione standard, nessuna tattica) | 11,2 | 8,8 | 214 / 194 |
| Vissuta: configurazione vera, tick della simulata | 7,7 | 11,7 | 211 / 210 |
| Vissuta: solo i tick, nessun comando | 7,5 | 9,2 | 197 / 188 |
| **Vissuta completa (tutti i comandi)** | 14,8 | **5,2** | 146 / 162 |

**Attribuzione, aggiungendo un comando alla volta (tiri avversari):** solo tick 9,2 → + scena/riprendi 8,5 → + eroe/atteggiamento 8,4 →
+ piazzato 7,9 → + origini 6,8 → + scenaEroe 6,0 → + risolviEroe 5,7 → + addebita 5,2. Nessuna singola classe spiega il calo: e' il
sistema delle scene dell'eroe nel suo insieme (pausa, piazzati dell'eroe, occasioni con origine, richiesta di scena, debito) che da' palla
e tempo alla sua squadra. Le riprese dopo le scene contano poco (tutte all'avversario: 9,0; tutte all'eroe: 6,7).

Non verificato: il valore «giusto» di tiri subiti da una squadra di vertice (nessuna fonte consultata in questa misura).

## Leve provate per «compensare gli avversari» (decisione PO 04/10), con la stessa riproduzione (13 partite)

| Leva (solo partita vissuta) | Tiri avversari (base 5,2) |
|---|---|
| Propensione al tiro avversaria ×1,4 / ×1,7 / ×2,0 / ×2,4 | 5,2 / 5,0 / 5,5 / 5,5 — nessun effetto: non arrivano in zona |
| Atteggiamento offensivo avversario +0,3 / +0,6 / +1 | 5,2 / 4,6 / 4,6 — nessun effetto |
| Ripresa all'avversario dopo le scene a x 50 / 40 / 30 | 6,9 / 5,9 / 6,1 — al massimo +1,6 |
| Forza avversaria +5 / +10 / +15 | 7,3 / 6,7 / 6,2 — non crescente |
| Recupero di 4 minuti | 5,9 |

Struttura dei tick nella vissuta (una partita): 22 per minuto, ma **0 nei minuti delle scene** (6 minuti) e **fine all'89'** senza recupero:
84 minuti di gioco del motore contro 94 della simulata.
