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
| 7.999.185 | giro 120 · app Android come PLINTO (TWA) | sviluppo | claude-opus-5-5 | 1,0 | 7,51 $ | 75192 | 1 | completo (un solo avvio) |
| 7.999.185 | giro 122 · Albo d'oro per lega | sviluppo | claude-sonnet-5-5 | 1,1 | 1,24 $ | 23642 | 1 | completo (un solo avvio) |
| 7.999.186 | giro 121 · angolo di testa (per la 186) | sviluppo | claude-opus-5-5 | 4,4 | 6,88 $ | 69992 | 1 | completo (un solo avvio) |
| 7.999.186 | giro 124 · bambini (fermato dopo ~1 minuto, istruzione superata) | sviluppo | claude-sonnet-5-5 | 0,0 | 0,38 $ | 1433 | 1 | completo (un solo avvio) |
| 7.999.186 | giro 124b · colori dei bambini | sviluppo | claude-sonnet-5-5 | 0,7 | 1,20 $ | 18753 | 1 | completo (un solo avvio) |
| 7.999.186 | giro 125 · censimento distanze degli highlight | collaudo | claude-sonnet-5-5 | 1,9 | 1,84 $ | 31848 | 1 | completo (un solo avvio) |
| 7.999.185 | verifica finale 7.999.185 | catena | claude-sonnet-5-5 | 3,6 | 1,12 $ | 14350 | 1 | completo (un solo avvio) |
| 7.999.186 | giro 123 · parata del tiro e angolo | sviluppo | claude-opus-5-5 | 4,6 | 5,87 $ | 51380 | 1 | completo (un solo avvio) |
| 7.999.186 | giro 126 · distanze dei tiri | sviluppo | claude-opus-5-5 | 3,7 | 4,48 $ | 36110 | 1 | completo (un solo avvio) |
| 7.999.186 | verifica finale 7.999.186 (interrotta per la pausa, nulla salvato) | catena | claude-sonnet-5-5 | 1,6 | 0,83 $ | 8295 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.187 | giro 128 studio tifosi più umani (PO-330) | collaudo | claude-opus-5-5 | 0,6 | 5,95 $ | 71119 | 1 | completo (un solo avvio) |
| 7.999.187 | giro 127 ingresso dalla panchina inquadrato dal prato (PO-329) | sviluppo | claude-opus-5-5 | 2,4 | 7,14 $ | 59356 | 1 | completo (un solo avvio) |
| 7.999.187 | giro 129 folla a sagome (PO-330 A) | sviluppo | claude-opus-5-5 | 1,0 | 9,28 $ | 97710 | 1 | completo (un solo avvio) |
| 7.999.186 | verifica finale 7.999.186 (ripresa dopo la pausa) | catena | claude-sonnet-5-5 | 4,8 | 1,47 $ | 17804 | 1 | completo (un solo avvio) |
| 7.999.186 | giro 130 sonda collaudo-110 G180-17 | collaudo | claude-opus-5-5 | 0,6 | 1,60 $ | 11171 | 1 | completo (un solo avvio) |
| 7.999.188 | giro 131 card Prossima con la Nazionale (PO-331) | sviluppo | claude-opus-5-5 | 1,1 | 3,57 $ | 26738 | 1 | completo (un solo avvio) |
| 7.999.188 | giro 133 amichevoli della Nazionale nella card Prossima (PO-333) | sviluppo | claude-opus-5-5 | 0,4 | 2,38 $ | 17363 | 1 | completo (un solo avvio) |
| 7.999.188 | giro 132 premiazione braccia alzate e compagni al podio (PO-332) | sviluppo | claude-opus-5-5 | 2,0 | 7,50 $ | 65526 | 1 | completo (un solo avvio) |
| 7.999.188 | giro 134 privacy dentro l app e poi nel pulsante amichevole (PO-334, PO-335) | sviluppo | claude-opus-5-5 | 0,6 | 4,05 $ | 36451 | 1 | completo (un solo avvio) |
| 7.999.187 | verifica finale 7.999.187 | catena | claude-sonnet-5-5 | 5,9 | 1,93 $ | 20357 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.187 | giro 135 sonda distanze-126 e costo della folla | collaudo | claude-opus-5-5 | 2,5 | 0,76 $ | 7676 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.188 | giro 136 riconciliazione del backlog | collaudo | claude-opus-5-5 | 0,8 | 3,63 $ | 26856 | 1 | completo (un solo avvio) |
| 7.999.189 | giro 142 (fermato dopo 1 minuto, rilanciato come 142b) | sviluppo | claude-opus-5-5 | 0,0 | 0,52 $ | 290 | 1 | completo (un solo avvio) |
| 7.999.188 | verifica finale 7.999.188 | catena | claude-sonnet-5-5 | 6,3 | 1,48 $ | 14879 | 1 | completo (un solo avvio) |
| 7.999.189 | giro 137 capitano verso la camera e club W.N (PO-339, PO-340) | sviluppo | claude-opus-5-5 | 1,4 | 3,88 $ | 31557 | 1 | completo (un solo avvio) |
| 7.999.189 | giro 140 verifica dei bassi PO-337 e PO-338 | collaudo | claude-opus-5-5 | 0,4 | 11,43 $ | 75898 | 1 | completo (un solo avvio) |
| 7.999.189 | giro 141 partita 2D cartelloni e tifosi (PO-341, PO-342) | sviluppo | claude-opus-5-5 | 1,2 | 5,98 $ | 63631 | 1 | completo (un solo avvio) |
| 7.999.189 | giro 142b presentazione della squadra e marchio (PO-343, D23) | sviluppo | claude-opus-5-5 | 1,1 | 6,05 $ | 57599 | 1 | completo (un solo avvio) |
| 7.999.189 | giro 138 lotto strumenti (festa-57, portiere-252, contatto-103, riserva-103, griglia-mobile) | collaudo | claude-opus-5-5 | 4,0 | 13,19 $ | 121653 | 1 | completo (un solo avvio) |
| 7.999.189 | giro 139 doppio rigore (PO-315) | sviluppo | claude-opus-5-5 | 3,7 | 5,90 $ | 55718 | 1 | completo (un solo avvio) |
| 7.999.189 | giro 143 curve 2D al secondo tempo (PO-345) | sviluppo | claude-opus-5-5 | 0,7 | 3,20 $ | 30290 | 1 | completo (un solo avvio) |
| 7.999.189 | giro 144 saluto del chiamato e marchio sala stampa (PO-347, PO-346) | sviluppo | claude-opus-5-5 | 1,0 | 5,40 $ | 49838 | 1 | completo (un solo avvio) |
| 7.999.189 | giro 145 strumenti 2 (contatto-103, griglia-mobile, partita-vera) | collaudo | claude-opus-5-5 | 3,1 | 6,68 $ | 56375 | 1 | completo (un solo avvio) |
| 7.999.189 | giro 147 rossi della 189 (folla, portiere-252) | collaudo | claude-opus-5-5 | 1,3 | 4,10 $ | 37205 | 1 | completo (un solo avvio) |
| 7.999.190 | giro 146 spalle braccia mani (PO-348) | sviluppo | claude-opus-5-5 | 4,1 | 11,20 $ | 115689 | 1 | completo (un solo avvio) |
| 7.999.189 | verifica 189 delta (dopo il giro 147) | catena | claude-sonnet-5-5 | 1,2 | 1,28 $ | 13144 | 1 | completo (un solo avvio) |
| 7.999.189 | verifica finale 7.999.189 | catena | claude-sonnet-5-5 | 7,9 | 5,24 $ | 28762 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.190 | giro 146b spalle senza gobba (PO-348) | sviluppo | claude-opus-5-5 | 3,7 | 13,68 $ | 107526 | 1 | completo (un solo avvio) |
| 7.999.190 | giro 148 portiere a bruciapelo (PO-350) | sviluppo | claude-opus-5-5 | 3,8 | 5,34 $ | 48469 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.190 | giro 149 audio CC0 (PO-351) | sviluppo | claude-opus-5-5 | 1,3 | 12,22 $ | 112395 | 1 | completo (un solo avvio) |
| 7.999.190 | giro 150 finestre PC (PO-352) | sviluppo | claude-opus-5-5 | 1,6 | 0,92 $ | 8448 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.190 | giro 155 difetti bassi, Legacy, testi (PO-337/338/358/359) | sviluppo | claude-opus-5-5 | 1,2 | 0,78 $ | 9090 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.190 | giro 156 misura simulate + Ultime notizie (PO-360/361) | sviluppo | claude-opus-5-5 | 1,3 | 2,51 $ | 24756 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.190 | giro 157 risultati di squadra nelle simulate (PO-360) | sviluppo | claude-opus-5-5 | 0,8 | 1,06 $ | 11165 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.191 | giro 153 progetto Primavera (PO-356) | progetto | claude-opus-5-5 | 0,2 | 3,98 $ | 43233 | 1 | completo (un solo avvio) |
| 7.999.190 | giro 151 scie 2D e cronaca (PO-353/354) | sviluppo | claude-opus-5-5 | 3,2 | 1,27 $ | 10959 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.190 | giro 152 esultanza (PO-355) | sviluppo | claude-opus-5-5 | 3,7 | 1,28 $ | 7061 | 3 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.190 | giro 154 gol eroe solo negli highlight (PO-357) | sviluppo | claude-opus-5-5 | 3,7 | 2,07 $ | 13836 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.191 | giro 154b chiusura controlli PO-357 | sviluppo | claude-opus-5-5 | 3,6 | 4,16 $ | 25669 | 1 | completo (un solo avvio) |
| 7.999.190 | verifica 190 distanze-126 intero | catena | claude-sonnet-5-5 | 1,2 | 0,81 $ | 6280 | 1 | completo (un solo avvio) |
| 7.999.191 | giro 158 simulate (prima parte, Opus, interrotto per passaggio a Fable) | sviluppo | claude-opus-5-5 | 3,3 | 10,31 $ | 110815 | 1 | completo (un solo avvio) |
| 7.999.190 | verifica finale 7.999.190 | catena | claude-sonnet-5-5 | 12,2 | 5,18 $ | 41168 | 1 | completo (un solo avvio) |
| 7.999.191 | giro 159 seguiti dei bassi (PO-358/359) | sviluppo | claude-opus-5-5 | 0,5 | 4,60 $ | 36997 | 1 | completo (un solo avvio) |
| 7.999.191 | giro 160 testo 12 px | sviluppo | claude-opus-5-5 | 1,9 | 5,33 $ | 45443 | 1 | completo (un solo avvio) |
| 7.999.191 | giro 161 audio cerimonie, fischi, Ohh, licenza Mixkit | sviluppo | claude-opus-5-5 | 1,5 | 7,96 $ | 73066 | 1 | completo (un solo avvio) |
| 7.999.191 | giro 162 spalle alla porta e strumenti bg-sync/bg-decision (PO-362) | sviluppo | claude-opus-5-5 | 8,2 | 8,78 $ | 67341 | 1 | completo (un solo avvio) |
| 7.999.191 | giro 163 Primavera Indice e avanti veloce (PO-356) | sviluppo | claude-opus-5-5 | 1,4 | 8,42 $ | 80091 | 1 | completo (un solo avvio) |
| 7.999.191 | giro 164 misura stagione pro (PO-364) | collaudo | claude-opus-5-5 | 0,3 | 3,92 $ | 42160 | 1 | completo (un solo avvio) |
| 7.999.191 | giro 159b scadenza rinnovi e finestra estiva | sviluppo | claude-opus-5-5 | 0,5 | 2,65 $ | 25794 | 1 | completo (un solo avvio) |
| 7.999.191 | giro 161b file Mixkit tolto (PO-351) | sviluppo | claude-opus-5-5 | 1,2 | 5,73 $ | 45350 | 1 | completo (un solo avvio) |
| 7.999.191 | giro 158b simulate: voto dal motore e squadra simulata (PO-360) | sviluppo | claude-fable-5-2 | 9,1 | 18,17 $ | 119640 | 1 | completo (un solo avvio) |
| 7.999.191 | giro 165 tasto Vai al prossimo momento da pro (PO-364 B) | sviluppo | claude-opus-5-5 | 1,6 | 6,89 $ | 67623 | 1 | completo (un solo avvio) |
| 7.999.191 | giro 168 riga tua nel colore del club (PO-363) | sviluppo | claude-opus-5-5 | 0,9 | 3,17 $ | 26750 | 1 | completo (un solo avvio) |
| 7.999.191 | giro 165b tasto momento: scelte di storia, rinnovo | sviluppo | claude-opus-5-5 | 1,7 | 6,96 $ | 60020 | 1 | completo (un solo avvio) |
| 7.999.191 | giro 166 partite a soli momenti salienti (PO-364 C) — worker riavviato, costo forse parziale | sviluppo | claude-fable-5-2 | 10,5 | 4,66 $ | 22571 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.191 | giro 169 riquadro fischio finale e voto (PO-365/366) | sviluppo | claude-opus-5-5 | 5,1 | 5,12 $ | 37022 | 1 | completo (un solo avvio) |
| 7.999.192 | giro 170 analisi scene 3D (PO-367) | collaudo | claude-fable-5-2 | 0,9 | 20,08 $ | 145845 | 1 | completo (un solo avvio) |
| 7.999.192 | giro 170b analisi gesti negli highlight (PO-367) | collaudo | claude-fable-5-2 | 3,2 | 19,13 $ | 162877 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.192 | giro 171 tifosi nel colore del club (PO-368) | sviluppo | claude-opus-5-5 | 1,9 | 7,76 $ | 68541 | 1 | completo (un solo avvio) |
| 7.999.192 | giro 172 audio pubblico, menù, icona in partita (PO-369/370) | sviluppo | claude-opus-5-5 | 2,7 | 15,09 $ | 133724 | 1 | completo (un solo avvio) |
| 7.999.192 | giro 179 ricerca animazioni con licenza libera (PO-367) | collaudo | claude-opus-5-5 | 0,1 | 3,83 $ | 61411 | 1 | completo (un solo avvio) |
| 7.999.192 | giro 180 pacchetto Anderson Rohr (fermo: download chiede email) — worker riavviato, costo forse parziale | sviluppo | claude-opus-5-5 | 0,1 | 1,33 $ | 9653 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.192 | giro 178 intro sul telefono e colore unico (PO-367 D3/D6) | sviluppo | claude-opus-5-5 | 2,5 | 12,25 $ | 118637 | 1 | completo (un solo avvio) |
| 7.999.192 | giro 180b clip Rohr importate (9/12) (PO-367) | sviluppo | claude-opus-5-5 | 0,8 | 6,35 $ | 73493 | 1 | completo (un solo avvio) |
| 7.999.192 | giro 180c altre clip Rohr, correzione mani (PO-367) | sviluppo | claude-opus-5-5 | 0,7 | 7,35 $ | 70231 | 1 | completo (un solo avvio) |
| 7.999.192 | giro 177 prova pilota rigore (PO-367) | sviluppo | claude-fable-5-2 | 7,3 | 27,70 $ | 193247 | 1 | completo (un solo avvio) |
| 7.999.191 | giro 173 rifiniture tasto momento e soli highlight (PO-364) | sviluppo | claude-opus-5-5 | 11,5 | 11,94 $ | 78664 | 1 | completo (un solo avvio) |
| 7.999.191 | verifica finale 7.999.191 (interrotta, 3 riavvii) — worker riavviato, costo parziale | catena | claude-sonnet-5-5 | 9,1 | 0,14 $ | 4000 | 4 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.192 | giro 167 strumenti della cronaca (PO-362) — worker riavviato, costo parziale | sviluppo | claude-opus-5-5 | 29,1 | 2,39 $ | 12365 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.192 | giro 181 idee e migliorie — worker riavviato, costo forse parziale | collaudo | claude-fable-5-2 | 1,6 | 24,50 $ | 91358 | 4 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.192 | giro 174 rossi preesistenti catena grafica e parata-100 (PO-371) | sviluppo | claude-opus-5-5 | 9,4 | 17,02 $ | 114546 | 1 | completo (un solo avvio) |
| 7.999.192 | giro 175 partita riproducibile (PO-372) | sviluppo | claude-fable-5-2 | 5,8 | 24,09 $ | 142985 | 1 | completo (un solo avvio) |
| 7.999.192 | giro 176 regia azioni salienti (PO-367) — worker riavviato, costo parziale | sviluppo | claude-opus-5-5 | 15,9 | 1,35 $ | 6498 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.192 | giro 184 licenze: originali CGTrader fuori, clip Rohr 180d (PO-374, PO-367) | sviluppo | claude-opus-5-5 | 0,5 | 6,10 $ | 53986 | 1 | completo (un solo avvio) |
| 7.999.192 | giro 183 interviste — fermo senza salvare, rifatto col 183b | sviluppo | claude-opus-5-5 | 1,0 | 12,83 $ | 78209 | 1 | completo (un solo avvio) |
| 7.999.192 | giro 182 spogliatoio e nomi — fermo senza salvare, rifatto col 182b (costo non letto: la sessione non lo riporta) | sviluppo | claude-opus-5-5 | 1,0 | 0,00 $ | 0 | 1 | completo (un solo avvio) |
| 7.999.192 | giro 182b spogliatoio, nomi abbreviati, offerte (PO-379, PO-378) | sviluppo | claude-opus-5-5 | 1,6 | 7,39 $ | 77047 | 1 | completo (un solo avvio) |
| 7.999.192 | giro 183b interviste meno e più varie (PO-375) | sviluppo | claude-opus-5-5 | 1,4 | 8,28 $ | 76425 | 1 | completo (un solo avvio) |
| 7.999.180 | **TOTALE 7.999.180** (4 sessioni) |  |  |  | almeno 41,55 $ |  |  | 1 sessioni parziali: totale minimo |
| 7.999.181 | **TOTALE 7.999.181** (1 sessioni) |  |  |  | almeno 0,72 $ |  |  | 1 sessioni parziali: totale minimo |
| 7.999.182 | **TOTALE 7.999.182** (5 sessioni) |  |  |  | 21,81 $ |  |  | tutte complete |
| 7.999.183 | **TOTALE 7.999.183** (1 sessioni) |  |  |  | 1,46 $ |  |  | tutte complete |
| 7.999.184 | **TOTALE 7.999.184** (8 sessioni) |  |  |  | almeno 35,27 $ |  |  | 1 sessioni parziali: totale minimo |
| 7.999.185 | **TOTALE 7.999.185** (4 sessioni) |  |  |  | 18,18 $ |  |  | tutte complete |
| 7.999.186 | **TOTALE 7.999.186** (9 sessioni) |  |  |  | almeno 24,55 $ |  |  | 1 sessioni parziali: totale minimo |
| 7.999.187 | **TOTALE 7.999.187** (5 sessioni) |  |  |  | almeno 25,05 $ |  |  | 2 sessioni parziali: totale minimo |
| 7.999.188 | **TOTALE 7.999.188** (6 sessioni) |  |  |  | 22,61 $ |  |  | tutte complete |
| 7.999.189 | **TOTALE 7.999.189** (13 sessioni) |  |  |  | almeno 72,87 $ |  |  | 1 sessioni parziali: totale minimo |
| 7.999.190 | **TOTALE 7.999.190** (13 sessioni) |  |  |  | almeno 58,34 $ |  |  | 8 sessioni parziali: totale minimo |
| 7.999.191 | **TOTALE 7.999.191** (19 sessioni) |  |  |  | almeno 122,89 $ |  |  | 2 sessioni parziali: totale minimo |
| 7.999.192 | **TOTALE 7.999.192** (20 sessioni) |  |  |  | almeno 224,83 $ |  |  | 5 sessioni parziali: totale minimo |
