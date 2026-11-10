# Catena 189-delta — verifica del giro 147 (src/12 `initTexture`, rosso `__CPM_NO_G147`)

Ramo `catena/189-delta` da `lavoro/189` (HEAD 0d4915e9). Build rigenerato con `tools/build-src.mjs`; `tools/check-src.mjs`: allineato.
Ambiente: `CPM_CHROME=/opt/pw-browsers/chromium`, `CPM_CI_PAR=0`, un controllo alla volta.

| # | Controllo | Uscita | Durata | Braccio / motivo | free / df |
|---|---|---|---|---|---|
| 1 | folla (1/2) | 0 | 177 s | verde passa · rosso visto | free 15105 MB, df 29G liberi |
| 2 | folla (2/2) | 0 | 175 s | verde passa · rosso visto | free 14721 MB, df 29G liberi |
| 3 | validate-situations | 0 | 707 s | PASS, impronta 00001505, 0 failure | free 14712 MB, df 29G liberi |
| 4 | scena3d-96 (tel) | 0 | 644 s | VERDE, 16/16 scene giudicate, 0 errori di pagina | free 14711 MB, df 29G liberi |
| 5 | scena3d-96 (pc) | 0 | 966 s | VERDE, 9/9 scene giudicate, 0 errori di pagina (un primo lancio per errore di percorso mio, non del controllo, scartato e rifatto) | free 14631 MB, df 29G liberi |
| 6 | scena3d-96 (tabv+tabo) | 0 | 334 s | VERDE, 6/6 scene giudicate, 0 errori di pagina | free 14633 MB, df 29G liberi |
| 7 | presentazione-142 | 0 | 191 s | verde, il rosso cade | free 14628 MB, df 29G liberi |
| 8 | premiazione-132 | 0 | 387 s | verde, i rossi (G132, G137C) cadono | free 14584 MB, df 29G liberi |
| 9 | intro-118 | 0 | 119 s | VERDE, braccio verde | free 14611 MB, df 29G liberi |
| 10 | panchina-127 (CPM_P127_FORMATI=tel) | 0 | 328 s | verde + rosso visto (412x915, casa e trasferta) | free 14608 MB, df 29G liberi |
| 11 | test:logic | 0 | 3 s | 43 pass, 0 fail | free 14613 MB, df 29G liberi |
| 12 | save-compat | 0 | 12s | 12 pass, 0 fail (nota benigna sul club sintetico della 2ª migration) | free 14437 MB, df 29G liberi |

## Esito

Tutti i controlli richiesti sono verdi al primo giro, nessun rosso da rigiocare, nessuna soglia toccata, nessun "non giudicato". Il cambio del giro 147 (`renderer.initTexture` su numeri di maglia e targhette, rosso `__CPM_NO_G147`) regge sul build nuovo: `folla` due volte verde con il braccio rosso visto (nel braccio verde 0 tele ridisegnate e 0 caricamenti di texture in 6 s; nel rosso 17-26 e 20-42), `validate-situations` PASS con impronta 00001505 e 0 failure. Il numero di giri è 12 righe perché scena3d-96 è diviso in tre formati.

Nota di metodo: un lancio di scena3d-96 (pc) è fallito per un mio errore di percorso nel lancio (non del controllo); l'ho scartato e rifatto, e la riga 5 riporta il giro valido.

