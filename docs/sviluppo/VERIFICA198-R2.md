# Verifica della 7.999.198 — parte R2 (residui)

- Ramo verificato: `prova/198-finale` (`0f0b13d8`) · base di confronto per i rossi: `lavoro/198` (`b3b75b9d`)
- Ramo di lavoro: `sviluppo/verifica198-r2` · data: 20/11/2026
- Modo: un controllo alla volta (`CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`), tetto 30 minuti a controllo, nessuna correzione.
- Macchina a inizio giro: 15,4 GB di memoria libera, 59 GB di disco liberi.

| controllo | esito su finale | esito sulla base (se rosso) | nato da quale giro | nota |
|---|---|---|---|---|
| momento-194 | VERDE (uscita 0, 104 s) | — | — | bracci A/B/C verdi, tutti i rossi bocciati |
| nomi-190 | VERDE (uscita 0, 22 s) | — | — | 23 ok · 0 ko |
| nomi-211 | VERDE (uscita 0, 190 s) | — | — | 22 ok · 0 ko · viste giudicate 4 su 4 |
| nomi-219 | **NON GIUDICATO = ROSSO** (fermato al tetto dei 30 minuti, uscita 124) | non rieseguito (vedi nota) | non attribuibile | Il controllo dichiara da sé «~50 minuti» (27 partite, 3 alla volta): non sta nel tetto. Al momento dello stop: braccio verde 12 semi su 18 chiusi (101-112), 65 nominati, 64 vicini (98%), 0 oltre 35 u; semi 113-115 in corsa, 116-118 mai partiti; **braccio rosso mai giocato** (0 semi su 9). Nessun difetto misurato nella parte giocata. ⚠️ Difetto dello STRUMENTO da segnalare: dopo lo stop il processo ha stampato «✅ nomi-219 verde (… rosso 0% su 0 …)» — con il braccio rosso a zero campioni la regola «distacco ≥ 20 punti» passa da sola (98% − 0%). È un falso verde: non va contato. Non rieseguito sulla base perché finirebbe allo stesso tetto senza dire nulla sull’unione. |
| nomi-salvati-190 | VERDE (uscita 0, 36 s) | — | — | 19 ok · 0 ko · salvataggi giudicati 4 |
| passaggi-228 | VERDE (uscita 0, 71 s) | — | — | banco Node; tiri +1,0 % · xG +2,0 % · gol +3,5 % · simulazione rapida identica al bit. Il braccio rosso (`CPM_ROSSO=1`) non fa parte dello script npm: non eseguito |
