# Verifica della 7.999.198 — parte R6

Base: `prova/198-finale` (0f0b13d8). Ramo: `sviluppo/verifica198-r6`. Banco: sessione cloud, un controllo alla volta
(`CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`), 16 GB di memoria, 59 GB liberi su disco all'avvio.
Nessuna correzione: solo misura e rapporto.

## Tabella

| # | Controllo | Origine | Esito sul banco (0f0b13d8) | Durata | Numeri letti dal registro | Nasce dall'unione? |
|---|---|---|---|---|---|---|
| 1 | fila-227 | parte 13 rossa su Actions (corsa 44830113928) | **VERDE** (uscita 0, rosso visibile) | 384 s | verde: 7040 campioni, fermi in corsa 0 (quota 0) · rosso `__CPM_NO_FILA227`: fermi in corsa 2660 (quota 1) | non applicabile (verde sul banco) |
| 2 | rinvio-252 | parte 13 rossa su Actions | **VERDE** (uscita 0) | 222 s | verde: v max 26,1 u/s (soglia 32) · rosso `__CPM_NO_RINVIO252`: v max 42,7 u/s, 1 scena oltre 40 (gi36 42,7; gi35 38,7). Braccio rosso debole come da storia PO-271: una sola scena supera la soglia | non applicabile (verde sul banco) |

## Verdetto

In corso.
