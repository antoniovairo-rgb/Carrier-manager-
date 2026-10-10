# PO-222 — decisione prepartita vs contatore presenze (misura parziale)

**Stato: PARZIALE.** La parte sulla distribuzione delle decisioni è misurata. La parte sulle presenze contro le partite giocate **non è stata completata**: ho 1 sola partita simulata utile, non 30. La prova «Non convocato ma presenza accreditata» **non è riuscita** (vedi §3). Build: `GAME_VERSION = "7.999.157"`, come nel rapporto PO-218.

**Non posso confermare** che la simulazione di una partita da non convocato accrediti una presenza: la lettura del codice lo suggerisce, la misura non lo ha ancora verificato.

## 1. Cosa ho misurato, e cosa no

- **Misurato:** la decisione prepartita (`calcCoachDecision`, `CARRIER-MANAGER-AV.html:7499`) su 30 varianti del giocatore completo del salvataggio 190. Sono **varianti di un solo salvataggio**, non 30 carriere diverse.
- **Non misurato:** le 30 partite giocate con presenze lette dopo ciascuna. Il salvataggio 190 è alla settimana 38: la stagione finisce dopo pochi passi (`seasonEnd`), quindi non arrivo a 30 partite da un solo salvataggio.

## 2. Distribuzione delle decisioni (30 varianti, parte pura)

Varianti: fiducia (`coachTrust`) 3–98, forma 35–92, fatica 0–95, ruolo ciclico fra `leader/titolare/rotazione/riserva/primavera`, ovr 55–85; passo deterministico. Nessuna partita giocata.

| Decisione | Varianti | Quota |
|---|---|---|
| Titolare (`starter`) | 9 | 30% |
| Panchina (`bench`) | 14 | 47% |
| Non convocato (`not_called`) | 7 | 23% |

Riferimento: `probe-P222-decisioni.mjs`, dato in `giro4-po218/dati-P222/P222-decisioni-30.json`. Questa quota dice **quante partenze da titolare la regola produce su quelle varianti**, non quante ne produce una carriera vera.

## 3. Prova «Non convocato ma presenza accreditata» — NON riuscita

Run con fiducia del salvataggio portata a 5 (decisione `not_called` su tutti i passi, letta dal salvataggio persistito). Passi di `__CPM_CAREER.step()`:

| Passo | Esito | Settimana | Presenze prima → dopo |
|---|---|---|---|
| 0 | `lived` | 38 | 35 → 35 |
| 1 | `simulated` | 38 | 35 → 35 |
| 2 | `lived` | 38 | 35 → 35 |
| 3 | `advanced` | 39 | 36 → 36 |
| 4 | `seasonEnd` | 39 | — |

Perché non è una prova:
- Al passo 1 `step()` ha chiamato `simulateAndAdvance()`, ma nel suo aggiornamento lo stato, se non trova una giornata non giocata (`md2` nullo), **avanza la settimana senza incrementare `matches`** (`CARRIER-MANAGER-AV.html:47060–47062`). Quindi la settimana 38 non ha simulato alcuna partita.
- L'incremento (35 → 36) è comparso nel passo `advanced`, cioè su un altro percorso (`doAdvanceWeek`), che non ho letto.
- Una prova vera richiede una giornata con `md2` trovata, con decisione `not_called`, e il conteggio prima/dopo quella simulazione.

## 4. Lettura del codice (non misurata)

- Il percorso simulato di `simulateAndAdvance` (`CARRIER-MANAGER-AV.html:47051`) **non consulta** la decisione prepartita: nessun controllo su `not_called` tra 47051 e 47200.
- Il contatore viene incrementato a riga 47196: `matches: (p.matches||0) + (p.contractExpired ? 0 : 1)`. Solo lo svincolo lo esclude.
- Nel pulsante del gioco, con stato `not_called`, l'etichetta è «Simula partita (non convocato)» (riga 50549): la UI offre esplicitamente la simulazione a chi non è convocato.
- **IPOTESI:** una simulazione da non convocato accredita comunque la presenza. Per confermarla serve una giornata con `md2` trovata e il conteggio prima/dopo, da una UI o da una sonda che non dipenda dal passo ambiguo.

## 5. Limiti dichiarati

- Un solo salvataggio, non carriere diverse.
- Una sola partita simulata utile: il campione per il contatore è vuoto.
- La distribuzione in §2 è sulle varianti, non sulle carriere.

## 6. Riproduzione

```bash
cd docs/collaudi/giro4-po218
CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
  node probe-P222-decisioni.mjs dati-P222            # distribuzione (30 varianti, ≈1 min)
CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
  node probe-P222.mjs 5 16 dati-P222                 # run a fiducia 5, 16 passi (si ferma a seasonEnd)
```
