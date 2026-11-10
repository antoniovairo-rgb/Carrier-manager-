# Catena 189-finale — verifica sul build 7.999.189 (HEAD eba3b48, check-src allineato)

Sessione di sola verifica. Un controllo alla volta (CPM_CI_PAR=0), CPM_CHROME=/opt/pw-browsers/chromium. Un rosso è rigiocato una volta (righe «ripetizione»). Ogni comando git è lanciato dalla radice del repo.

| # | controllo | uscita | durata (s) | braccio / motivo (righe finali) | free / df |
|---|---|---|---|---|---|
| 1 | logic | 0 | 3 | # skipped 0 # todo 0 # duration_ms 3070.705372  | free=15609/16086MB df=29G libero |
| 2 | save-compat | 0 | 13 |  ℹ️ nota: 2ª migration changed=true senza nuovi campi — rigenerazione calendario/standings perché il club sintetico del test non è nel pool lega (benigno; i save reali con club valido convergono a changed=false). === SAVE-COMPAT === 12 pass · 0 fail ✅ PASS  | free=15491/16086MB df=29G libero |
