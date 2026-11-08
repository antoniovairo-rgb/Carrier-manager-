# Costi delle sessioni figlie (PO-310)

Generato da `node tools/costi-sessioni.mjs` dai dati di `docs/governo/COSTI.json`. Fonte: `get_session` della piattaforma (campo usage.cost_usd).
Una riga con più di un avvio del contenitore copre solo l'ultimo avvio: il totale della versione è allora un minimo. La sessione madre non è conteggiata.

| Versione | Sessione | Tipo | Modello | Ore | Costo dichiarato | Token d'uscita | Avvii | Affidabilità |
|---|---|---|---|---|---|---|---|---|
| 7.999.180 | giro 106 · Home sul telefono | sviluppo | claude-opus-5-5 | 1,1 | 5,64 $ | 48871 | 1 | completo (un solo avvio) |
| 7.999.180 | collaudo 180 · qualità grafica | collaudo | claude-opus-5-5 | 2,5 | 21,80 $ | 143067 | 1 | completo (un solo avvio) |
| 7.999.180 | giro 108 · difetti alti e medi G180 | sviluppo | claude-opus-5-5 | 3,2 | 13,04 $ | 91480 | 1 | completo (un solo avvio) |
| 7.999.180 | verifica finale 7.999.180 | catena | claude-sonnet-5-5 | 2,2 | 1,07 $ | 6886 | 3 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.181 | giro 109 · spalti coi colori dei club | sviluppo | claude-opus-5-5 | 2,1 | 0,72 $ | 4688 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.182 | giro 112 · moduli (fermato dopo ~1 minuto, piano superato) | sviluppo | claude-opus-5-5 | 0,0 | 0,95 $ | 1793 | 1 | completo (un solo avvio) |
| 7.999.182 | giro 110 · difetti grafici bassi G180 | sviluppo | claude-sonnet-5-5 | 2,4 | 4,93 $ | 79936 | 1 | completo (un solo avvio) |
| 7.999.182 | giro 111 · controlli instabili e rigore dell'eroe | sviluppo | claude-sonnet-5-5 | 3,6 | 3,28 $ | 66621 | 1 | completo (un solo avvio) |
| 7.999.182 | giro 112b · ogni club col suo modulo | sviluppo | claude-opus-5-5 | 3,8 | 11,39 $ | 110567 | 1 | completo (un solo avvio) |
| 7.999.182 | verifica finale 7.999.182 | catena | claude-sonnet-5-5 | 4,0 | 1,27 $ | 11143 | 1 | completo (un solo avvio) |
| 7.999.183 | giro 113 · pagina in cima al cambio scheda | sviluppo | claude-sonnet-5-5 | 0,9 | 1,46 $ | 20522 | 1 | completo (un solo avvio) |
| 7.999.184 | collaudo 184 · altezza, intro, provini, creazione | collaudo | claude-opus-5-5 | 1,2 | 7,48 $ | 77617 | 1 | completo (un solo avvio) |
| 7.999.184 | verifica uscita Play Store | collaudo | claude-sonnet-5-5 | 0,1 | 1,27 $ | 35229 | 1 | completo (un solo avvio) |
| 7.999.184 | giro 114 · schermata piena | sviluppo | claude-sonnet-5-5 | 2,3 | 3,88 $ | 57457 | 1 | completo (un solo avvio) |
| 7.999.184 | giro 116 · pacchetto Android | sviluppo | claude-sonnet-5-5 | 0,3 | 1,76 $ | 32478 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.184 | giro 115 · intro, provini, creazione | sviluppo | claude-opus-5-5 | 2,8 | 10,44 $ | 90416 | 1 | completo (un solo avvio) |
| 7.999.184 | giro 118 · portiere dell'intro e privacy in app | sviluppo | claude-sonnet-5-5 | 1,2 | 2,29 $ | 33135 | 1 | completo (un solo avvio) |
| 7.999.184 | giro 117 · angolo di testa e tabellone | sviluppo | claude-opus-5-5 | 3,9 | 6,95 $ | 63503 | 1 | completo (un solo avvio) |
| 7.999.184 | verifica finale 7.999.184 | catena | claude-sonnet-5-5 | 3,6 | 1,19 $ | 12019 | 1 | completo (un solo avvio) |
| 7.999.185 | giro 119 · angolo e parata (per la 185) | sviluppo | claude-opus-5-5 | 3,7 | 8,31 $ | 71739 | 1 | completo (un solo avvio) |
| 7.999.180 | **TOTALE 7.999.180** (4 sessioni) |  |  |  | almeno 41,55 $ |  |  | 1 sessioni parziali: totale minimo |
| 7.999.181 | **TOTALE 7.999.181** (1 sessioni) |  |  |  | almeno 0,72 $ |  |  | 1 sessioni parziali: totale minimo |
| 7.999.182 | **TOTALE 7.999.182** (5 sessioni) |  |  |  | 21,81 $ |  |  | tutte complete |
| 7.999.183 | **TOTALE 7.999.183** (1 sessioni) |  |  |  | 1,46 $ |  |  | tutte complete |
| 7.999.184 | **TOTALE 7.999.184** (8 sessioni) |  |  |  | almeno 35,27 $ |  |  | 1 sessioni parziali: totale minimo |
| 7.999.185 | **TOTALE 7.999.185** (1 sessioni) |  |  |  | 8,31 $ |  |  | tutte complete |
