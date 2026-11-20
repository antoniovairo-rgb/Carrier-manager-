# Verifica della 7.999.198 — parte R4

- **Base:** `prova/198-finale` (`0f0b13d8`), ramo di lavoro `sviluppo/verifica198-r4`.
- **Perché:** su GitHub Actions (corsa 44830113928, ramo `prova-ci/198-finale`, stesso codice) la parte 6 di 16 è fallita senza dire quale guardiano.
- **Metodo:** i sei guardiani della parte 6 eseguiti sul banco uno alla volta (`CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`, tetto 30 minuti ciascuno, `npm run <nome>`). Un rosso si riesegue su `lavoro/198` (`b3b75b9d`) per dire se nasce dall'unione. Nessuna correzione: solo rapporto.
- **Banco:** 16 GB di memoria (15,4 GB liberi all'avvio), 59 GB di disco liberi.

## Tabella

| # | Guardiano | Esito su `0f0b13d8` | Durata | Misura letta dall'uscita | Su `lavoro/198` |
|---|---|---|---|---|---|
| 1 | `ingresso-277` | ✅ verde (rc 0) | 474 s | verde: ingresso 167,5 s, velo 0 s, pulsante presente, corpi pronti a fine ingresso · salta: uscita a 10,8 s · rosso `visto` (velo 3,4 s, pulsante assente) | non serve |
| 2 | `carriera3-94` | ✅ verde (rc 0) | 169 s | tutte le righe `ok`, nessuna `ko`; D4 possesso/passaggi scarto max 0 su 48 partite · D6 0 frasi sbagliate su 2232 · D9 titolare 8 gare su 8 | non serve |
| 3 | `ingresso-285` | in corso | | | |
| 4 | `portatore-293` | da fare | | | |
| 5 | `tpose-196` | da fare | | | |
| 6 | `analisi-217` | da fare | | | |

## Verdetto

In corso (2 su 6).
