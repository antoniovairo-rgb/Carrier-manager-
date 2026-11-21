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
| 3 | `ingresso-285` | ✅ verde (rc 0) | 375 s | verde: scena 15,95 s con 3 stacchi, passo max in quadro 2,2 u/s (tetto 2,3), residuo a fine 0 · rosso `visto` (scena 23,1 s, 0 stacchi) | non serve |
| 4 | `portatore-293` | ✅ verde (rc 0) | 611 s | braccio verde: 0 difetti su 14 scene · braccio rosso `__CPM_NO_G293`: difetto in 5 casi «foto» su 5 (attesi ≥ 4), pallone che cambia padrone in 2 scene difensive su 2 (attesa ≥ 1) | non serve |
| 5 | `tpose-196` | ⚠️ **instabile**: ❌ rosso alla 1ª corsa (rc 1), ✅ verde alla 2ª (rc 0, sole scene di coppa) | 1402 s · 751 s | vedi «Dettaglio di `tpose-196`» | ❌ rosso anche lì (rc 1): **non nasce dall'unione** |
| 6 | `analisi-217` | ✅ verde (rc 0) | 13 s | 412×915 e 360×780: nessuna violazione, pulsante ultimo in pagina | non serve |

## Dettaglio di `tpose-196`

Il controllo non ha mai trovato un corpo sbagliato: in tutte le corse 0 fotogrammi cattivi, 0 pose a T, 0 corpi non CGTrader, 0 procedurali. Il rosso è sempre e solo «non giudicato»: nelle scene di coppa i fotogrammi di highlight raccolti restano sotto il minimo di 20 (`MINF`, riga 24 e riga 101 di `tests/visual/tpose-196.mjs`). Il file del controllo è identico sui due rami (`git diff b3b75b9d 0f0b13d8 -- tests/visual/tpose-196.mjs` vuoto).

| Corsa | Ramo | Scenari | Fotogrammi di highlight (minimo 20) | Esito |
|---|---|---|---|---|
| 1ª | unione `0f0b13d8` | tutti e quattro (`npm run tpose-196`) | campionato-notte 27 · coppa-notte **14** · campionato-giorno 26 · coppa-giorno **14** | ❌ rc 1, 1402 s; prova del rosso non partita |
| confronto | `lavoro/198` `b3b75b9d` | `CPM_SCENARI=coppa-notte,coppa-giorno` | coppa-notte **16** · coppa-giorno 41 | ❌ rc 1, 646 s |
| 2ª | unione `0f0b13d8` | `CPM_SCENARI=coppa-notte,coppa-giorno` | coppa-notte 35 · coppa-giorno 37 | ✅ rc 0, 751 s |
| braccio rosso | unione `0f0b13d8` | `CPM_PROVA_ROSSO=1 CPM_SCENARI=campionato-notte` | 73 fotogrammi cattivi all'ingresso (21 senza CGTrader, 1 posa a T) | ✅ rosso atteso, rc 0, 428 s |

Limiti dichiarati:
- la 2ª corsa e il confronto su `lavoro/198` sono sulle **sole due scene di coppa** (quelle fallite), non sui quattro scenari: la corsa intera più la prova del rosso supera i 30 minuti di tetto (la 1ª, senza prova del rosso, è durata 23 minuti);
- nelle scene di coppa le due scene chieste arrivano presto (durata 259-266 s nelle corse rosse, 364-371 s nelle verdi) e gli highlight sono corti: il numero di fotogrammi va da 14 a 41 sullo stesso codice. Perché oscilli **non è stato misurato** (la consegna vieta di correggere);
- poiché il rosso c'è anche su `lavoro/198`, non ho cercato il giro con gli interruttori `__CPM_NO_G293…G302`: quella ricerca serve solo per un rosso nato dall'unione.

## Incidente di questa verifica

Il commit `26f8f3d` ha preso per errore (`git commit -a`) otto foto di `docs/sviluppo/giro196/` rigenerate dal controllo. Il commit successivo `Verifica 198 R4: rimesse le foto…` le riporta identiche a `0f0b13d8` (`git diff --stat 0f0b13d8 HEAD` mostra solo questo rapporto). Le altre foto rigenerate (`giro196`, `foto/analisi217`) sono state rimesse con `git restore` prima di ogni commit successivo.

## Verdetto

- **Cinque guardiani su sei sono verdi sul banco** alla prima corsa: `ingresso-277`, `carriera3-94`, `ingresso-285`, `portatore-293`, `analisi-217`.
- **`tpose-196` è instabile** (1 rosso e 1 verde sull'unione) e, per regola, «non giudicato» vale rosso. Lo stesso rosso esce su `lavoro/198` (`b3b75b9d`): **non nasce dall'unione** e nessun giro 293-302 ne è chiamato in causa da questa verifica.
- **Sul fallimento di Actions (corsa 44830113928, parte 6 di 16):** non posso scrivere «è del runner», perché i sei non sono tutti verdi sul banco. Il candidato è `tpose-196`: è l'unico dei sei che fallisce anche qui, e fallisce per un conteggio di fotogrammi che dipende dal tempo. **Non posso confermarlo**: ho letto la coda (ultime 40 righe) dei registri dei lavori falliti della corsa, ma contiene solo il caricamento degli artefatti e la pulizia, non il nome del guardiano rosso. Il nome sta nell'artefatto `guardiani-parte-6` (ID 14676864601), che da questa sessione non è stato scaricato. Dallo stesso elenco: nella corsa i lavori falliti sono **cinque** su 18 (parti 6, 8, 9, 12 e 13), non la sola parte 6.
- **Da decidere (PO):** `tpose-196` è instabile due volte su tre corse viste; secondo la decisione del 13/10 «un guardiano instabile due volte si ripara, non si ripete». Nessuna correzione è stata fatta qui.
