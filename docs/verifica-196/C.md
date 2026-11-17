# Verifica 7.999.196 — parte C

Solo controllo: nessuna modifica al gioco né ai guardiani.

- **Commit di partenza:** `fda5aa54c6ea84f22b3418033fde9251fb04864e` (lavoro/196: catene, rimesse portiere-223 e dribbling-226 perse nelle unioni), ramo `verifica/196-c`.
- **build-src:** «CARRIER-MANAGER-AV.html ricomposto da 21 frammenti — 7479 KB, 65984 righe. (byte identici a prima: nessuna modifica nei frammenti)»
- **check-src:** «✓ IDENTICO BYTE PER BYTE — 7658265 byte ricomposti da 21 frammenti.» · privacy allineata · HTML allineato a HEAD.
- **Setup:** `cd tests/visual && npm install --no-package-lock && mkdir -p out`.
- **Comando:** `CPM_CI_PAR=0 CPM_CHROME=/opt/pw-browsers/chromium npm run -s <nome>`, uno alla volta, nell'ordine richiesto.
- **Risorse prima di ogni controllo:** RAM libera 14.6–15.0 GB su 16 GB (swap 0), disco 29 GB liberi (27% usato) — invariate fra i quattro.

| # | Controllo | Uscita | Durata | Esito |
|---|---|---|---|---|
| 1 | career-critical | 0 | 636 s | VERDE — 11/11 sotto-guardiani |
| 2 | partita-vera | 0 | 404 s | VERDE — 12/12 bande |
| 3 | solo-highlight-166 | 0 | 672 s | VERDE (rosso cade come deve) |
| 4 | esiti-96 | 0 | 739 s | VERDE (rosso atteso cade) |

Nessun rosso: nessuna ripetizione eseguita, nessun log di rosso da riportare.

## Righe finali

**career-critical** (una riga per sotto-guardiano):
```
✅ RECOVERY PER COMPETIZIONE OK
✅ PERSISTENZA MONOTONA OK
✅ CICLO DI VITA DEL RIFERIMENTO OK
✅ DOPPIO TAP OK
✅ PASS — la partita gia' giocata non passa da nessuna porta, e le legittime passano tutte
✅ PASS — una giornata committata non può essere riproposta, e il registro sopravvive al reload
✅ tutti gli invarianti di carriera tengono
✅ SIDECAR DUREVOLE OK
✅ PASS — un turno di coppa gia' giocato non torna, e quello da giocare arriva
✅ PASS — il trofeo si alza una volta sola, e solo vincendo la finale.
✅ PASS — una Coppa intera si chiude, la coda non si allunga due volte, il trofeo si alza solo in finale.
```

**partita-vera:**
```
✅ PARTITA-VERA OK — le bande d'accettazione tengono.
ESITO partita-vera: uscita 0 · BRACCIO verde · MOTIVO tutte le 12 bande giudicate e tenute (partite finite 2/2)
```

**solo-highlight-166:**
```
MISURA — durata reale: intera 194.9 s · soli highlight 57.0 s (7 scene) · partita 57.0 s · gioco fluido 9.2 s · scene 42.8 s · prepartita 5.0 s
VERDE: PASSA
ROSSO: CADE (come deve) su 3, 7 e 8
```

**esiti-96:**
```
VERDE OK: D1, D2, D3, B15, D6, D7, D12, D15, D14
ROSSO ATTESO OK: con __CPM_NO_G96B_* cadono D1, D2, D3, B15, D6, D7, D12, D15, D14
✅ esiti-96 PASS
```
(Le righe «✗» che precedono nel registro di esiti-96 appartengono al braccio rosso atteso.)

Foto in `docs/` rigenerate: ripristinate con `git checkout -- docs`, non committate.
