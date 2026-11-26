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
| 7.999.192 | giro 185 tasto momento: in corsa al titolo solo le partite decisive (PO-384) | sviluppo | claude-opus-5-5 | 0,8 | 3,08 $ | 33324 | 1 | completo (un solo avvio) |
| 7.999.192 | giro 186 strumenti dopo la partita riproducibile (audio-161, tifosi-171, box-fischio-169) | sviluppo | claude-opus-5-5 | 1,7 | 3,51 $ | 26928 | 1 | completo (un solo avvio) |
| 7.999.192 | giro 187 dopo la partita riproducibile: rigore-139, solo-highlight-166, minuto 0/1 (PO-372) — worker riavviato, costo forse parziale | sviluppo | claude-opus-5-5 | 5,5 | 5,12 $ | 39046 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.193 | giro 188 «Gioca» quando il tasto momento si ferma (PO-400) | sviluppo | claude-opus-5-5 | 0,7 | 2,05 $ | 13906 | 1 | completo (un solo avvio) |
| 7.999.194 | giro 189 idee e migliorie, seconda tornata | collaudo | claude-fable-5-2 | 1,4 | 15,64 $ | 95672 | 1 | completo (un solo avvio) |
| 7.999.194 | giro 190 testi, frase del mister, nomi U19, barra a 375 px (PO-380, PO-396, PO-397) | sviluppo | claude-opus-5-5 | 1,6 | 9,47 $ | 88355 | 1 | completo (un solo avvio) |
| 7.999.194 | giro 193 idee, terza tornata: tifoso esigente, carriera lunga | collaudo | claude-fable-5-2 | 1,4 | 15,52 $ | 101421 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.194 | giro 191 rigori: doppio calcio e lotteria (PO-399, PO-403) | sviluppo | claude-opus-5-5 | 4,9 | 10,59 $ | 88024 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.194 | giro 192 cerimonie: mister, coppa, presentazione, parata (PO-402, 404, 406, 407) | sviluppo | claude-opus-5-5 | 3,8 | 17,31 $ | 135605 | 1 | completo (un solo avvio) |
| 7.999.194 | giro 194 tasto momento e convocazione-235 (PO-405, 410, 411, 431) | sviluppo | claude-opus-5-5 | 1,2 | 4,67 $ | 42990 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.194 | giro 195 grafica, fruibilità e usabilità (analisi, 15 proposte G195-01…15) | collaudo | claude-fable-5-2 | 0,7 | 11,73 $ | 88427 | 1 | completo (un solo avvio) |
| 7.999.195 | giro 198 Agente «da fare ora», tasto che porta al rinnovo, svincolato (PO-456, 446, 432) | sviluppo | claude-opus-5-5 | 1,0 | 7,72 $ | 72742 | 1 | completo (un solo avvio) |
| 7.999.195 | giro 199 scelte «Da decidere» in cima alla Home, figurina compatta (PO-408, 409) | sviluppo | claude-opus-5-5 | 0,9 | 4,77 $ | 41639 | 1 | completo (un solo avvio) |
| 7.999.194 | giro 196 mai T-pose né corpi non CGTrader: attesa con barra, poi 2D (PO-449) | sviluppo | claude-opus-5-5 | 4,5 | 10,03 $ | 83281 | 1 | completo (un solo avvio) |
| 7.999.195 | giro 200 rassegna a quattro schede e rifiniture degli anni lunghi (PO-385, 448) | sviluppo | claude-opus-5-5 | 1,7 | 15,75 $ | 124915 | 1 | completo (un solo avvio) |
| 7.999.195 | giro 197 scelte dell'azione sempre in vista sui telefoni bassi (PO-452) | sviluppo | claude-opus-5-5 | 3,1 | 4,66 $ | 34159 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.195 | giro 201 provini stabili e spiegati, scelte che tornano dopo la chiusura dell'app (PO-418, 428) | sviluppo | claude-opus-5-5 | 1,0 | 6,47 $ | 55732 | 1 | completo (un solo avvio) |
| 7.999.195 | giro 202 rassegna: tabellino nella scheda 1, tasti fissi in fondo (PO-461) | sviluppo | claude-opus-5-5 | 1,8 | 8,70 $ | 78667 | 1 | completo (un solo avvio) |
| 7.999.195 | giro 205 partita 2D di riserva: lotteria, premiazione, rassegna (PO-465) | sviluppo | claude-opus-5-5 | 2,1 | 8,23 $ | 58897 | 1 | completo (un solo avvio) |
| 7.999.195 | giro 203 sigle intere nella barra, clip Rohr sotto 3 MB (PO-460, 464) | sviluppo | claude-opus-5-5 | 3,6 | 2,23 $ | 15304 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.195 | giro 204 piazzato di sola visione, lotteria senza 90', maglie e piedistallo del pullman (PO-450, 451) | sviluppo | claude-opus-5-5 | 4,2 | 15,91 $ | 106321 | 1 | completo (un solo avvio) |
| 7.999.195 | giro 207 misura delle diagonali negli highlight dell'eroe e proposta (PO-401) | misura | claude-opus-5-5 | 3,5 | 6,99 $ | 56924 | 1 | completo (un solo avvio) |
| 7.999.195 | giro 206 scene 3D: notte e ingresso in campo scenico (PO-373, 412, 367) | sviluppo | claude-fable-5-2 | 6,8 | 27,19 $ | 169921 | 1 | completo (un solo avvio) |
| 7.999.195 | giro 208 maxischermo RIGORI nella lotteria, colore solo sulla maglia (PO-468, 469) | sviluppo | claude-opus-5-5 | 2,1 | 4,50 $ | 39589 | 1 | completo (un solo avvio) |
| 7.999.195 | giro 209 niente ripiego 2D: avviso connessione con Riprova e Simula (PO-470) | sviluppo | claude-opus-5-5 | 3,6 | 7,49 $ | 60695 | 1 | completo (un solo avvio) |
| 7.999.195 | giro 210 diagonali nel pad e pad che resta sul telefono (PO-401, 471) | sviluppo | claude-opus-5-5 | 3,9 | 13,92 $ | 119525 | 1 | completo (un solo avvio) |
| 7.999.195 | giro 211 gradino del nome corto, domande coerenti col risultato (PO-472, 473) | sviluppo | claude-opus-5-5 | 1,9 | 8,30 $ | 89699 | 1 | completo (un solo avvio) |
| 7.999.195 | giro 212 gigante in campo: guardalinee alla statura giusta (PO-474) | sviluppo | claude-opus-5-5 | 4,1 | 10,10 $ | 80399 | 1 | completo (un solo avvio) |
| 7.999.195 | giro 214 lotteria: tabellone opaco e striscia con la serie (PO-477) | sviluppo | claude-opus-5-5 | 1,8 | 6,03 $ | 49200 | 1 | completo (un solo avvio) |
| 7.999.195 | giro 215 Simula a partita iniziata tiene il parziale (PO-478) | sviluppo | claude-opus-5-5 | 1,4 | 7,93 $ | 64668 | 1 | completo (un solo avvio) |
| 7.999.195 | giro 216 lotteria: striscia con l'eroe a sinistra come il tabellone (PO-482) | sviluppo | claude-opus-5-5 | 1,9 | 3,85 $ | 33990 | 1 | completo (un solo avvio) |
| 7.999.195 | giro 213 riscontro al tocco su tutti i pulsanti, ingresso-277, design-system (PO-475) | sviluppo | claude-opus-5-5 | 4,0 | 14,34 $ | 133881 | 1 | completo (un solo avvio) |
| 7.999.195 | giro 217 guardiano piazzato-204 stabile (campionamento dello stacco nero) | sviluppo | claude-opus-5-5 | 1,3 | 3,22 $ | 25806 | 1 | completo (un solo avvio) |
| 7.999.195 | giro 218 calendario della coppa leggibile (PO-483) | sviluppo | claude-opus-5-5 | 0,8 | 4,88 $ | 40535 | 1 | completo (un solo avvio) |
| 7.999.195 | verifica 7.999.195 parte H: highlight-95 | verifica | claude-opus-5-5 | 3,1 | 2,76 $ | 9010 | 1 | completo (un solo avvio) |
| 7.999.195 | verifica 7.999.195 parte S: scene 3D lente (interrotta) | verifica | claude-opus-5-5 | 4,0 | 2,16 $ | 11286 | 1 | completo (un solo avvio) |
| 7.999.196 | giro 220 · moves-budget (PO-485) | giro | claude-opus-5-5 | 3,6 | 5,87 $ | 48212 | 1 | completo (un solo avvio) |
| 7.999.196 | giro 221 · barra Pressione e tasti spenti (PO-480, 486) | giro | claude-opus-5-5 | 3,8 | 6,29 $ | 51444 | 1 | completo (un solo avvio) |
| 7.999.196 | giro 227 · patto col mister coerente (PO-492) | giro | claude-opus-5-5 | 0,6 | 4,88 $ | 32555 | 1 | completo (un solo avvio) |
| 7.999.196 | giro 228 · rosa: ruoli in sigla (PO-493) | giro | claude-opus-5-5 | 0,7 | 3,08 $ | 22863 | 1 | completo (un solo avvio) |
| 7.999.196 | giro 222 · guardalinee e interviste ultima del girone (PO-481, 479) | giro | claude-opus-5-5 | 2,9 | 13,21 $ | 105450 | 1 | completo (un solo avvio) |
| 7.999.196 | giro 224 · rassegna: statistiche e scheda 4 (PO-488, 490) | giro | claude-opus-5-5 | 1,7 | 7,00 $ | 64007 | 1 | completo (un solo avvio) |
| 7.999.196 | giro 229 · salienti in ogni partita e pausa (PO-494, 495) | giro | claude-opus-5-5 | 2,4 | 9,68 $ | 80558 | 1 | completo (un solo avvio) |
| 7.999.196 | giro 230 · anteprima solo bilancio (PO-490) | giro | claude-opus-5-5 | 0,4 | 2,24 $ | 15793 | 1 | completo (un solo avvio) |
| 7.999.196 | giro 225 · serata di presentazione (PO-489) | giro | claude-fable-5-2 | 3,1 | 20,15 $ | 158965 | 1 | completo (un solo avvio) |
| 7.999.196 | giro 231 · riparazione guardiani del rinnovo (momento-165/165b/173) | riparazione | claude-opus-5-5 | 1,2 | 3,21 $ | 25633 | 1 | completo (un solo avvio) |
| 7.999.196 | giro 219 · tocco lento nelle scene 3D (PO-484) | giro | claude-fable-5-2 | 7,9 | 24,50 $ | 182960 | 3 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.196 | giro 223 · portiere fuori tempo sui tiri falliti (PO-487) | giro | claude-opus-5-5 | 7,6 | 14,37 $ | 127893 | 1 | completo (un solo avvio) |
| 7.999.196 | giro 226 · dribbling (PO-491) | giro | claude-fable-5-2 | 7,8 | 25,32 $ | 157851 | 1 | completo (un solo avvio) |
| 7.999.196 | giro 232 · rassegna della competizione giocata (PO-503) | giro | claude-opus-5-5 | 1,2 | 5,82 $ | 56520 | 1 | completo (un solo avvio) |
| 7.999.196 | verifica 7.999.196 parte C | verifica | claude-opus-5-5 |  | 1,29 $ | 5757 | 1 | completo (un solo avvio) |
| 7.999.196 | verifica 7.999.196 parte S | verifica | claude-opus-5-5 |  | 1,37 $ | 4463 | 1 | completo (un solo avvio) |
| 7.999.196 | verifica 7.999.196 parte H (highlight-95) | verifica | claude-opus-5-5 |  | 1,43 $ | 2731 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 234 · accessibilità (PO-393, 455, 459) | giro | claude-opus-5-5 | 0,9 | 10,44 $ | 93775 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 243 · salienti con la Nazionale (PO-508) | giro | claude-opus-5-5 | 0,8 | 3,70 $ | 30755 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 233 · primo avvio leggero (PO-453) | giro | claude-fable-5-2 | 3,6 | 17,71 $ | 131845 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.197 | giro 238 · patto e rinnovo (PO-496, 501) | giro | claude-opus-5-5 | 3,9 | 18,64 $ | 115385 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 247 · proposta nomi club (PO-511) | giro | claude-opus-5-5 | 0,1 | 1,79 $ | 22786 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 250 · proposta nomi di tutti i club (PO-512) | giro | claude-opus-5-5 | 0,2 | 3,30 $ | 60777 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 244 · coreografie sempre diverse (PO-509) | giro | claude-fable-5-2 | 3,1 | 8,86 $ | 71281 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 248 · 16 nomi dei club (PO-511) | giro | claude-opus-5-5 | 2,3 | 7,77 $ | 65754 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 246 · solo salienti in un unico punto (PO-508) | giro | claude-opus-5-5 | 2,5 | 8,67 $ | 77818 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 245 · tunnel a metà campo (PO-510) | giro | claude-fable-5-2 | 3,7 | 10,97 $ | 76738 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 240 · pelle e capelli, saluto con clip (PO-500, 499) | giro | claude-fable-5-2 | 8,4 | 37,80 $ | 255374 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 249 · rigorista dal patto (PO-496) | giro | claude-opus-5-5 | 3,8 | 10,62 $ | 78852 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 252 · coreografie piccole (PO-509) | giro | claude-opus-5-5 | 2,1 | 3,86 $ | 32741 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 251 · nomi definitivi di tutti i club (PO-512) | giro | claude-opus-5-5 | 2,6 | 9,04 $ | 85550 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 254 · sigle-203 e voto-79 | giro | claude-opus-5-5 | 1,4 | 3,89 $ | 29485 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 253 · salienti dalla panchina, salienti-229 (PO-508) | giro | claude-opus-5-5 | 3,9 | 16,18 $ | 124117 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 236 · store (PO-430, 322) | giro | claude-opus-5-5 | 0,5 | 9,98 $ | 83279 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 235 · profilo e grafica (PO-457, 458) | giro | claude-opus-5-5 | 1,9 | 19,15 $ | 141037 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 256 · saluto alternato (PO-499) | giro | claude-fable-5-2 | 3,0 | 14,54 $ | 121491 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 258 · nomi nel calendario e sonde | giro | claude-opus-5-5 | 1,6 | 5,14 $ | 39432 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 257 · rigorista visibile (PO-496) | giro | claude-opus-5-5 | 3,9 | 10,37 $ | 75444 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 260 · TWA, titoli, Primavera (PO-322, 458) | giro | claude-opus-5-5 | 1,0 | 9,43 $ | 70232 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 255 · schieramento al centro (PO-510) | giro | claude-fable-5-2 | 5,1 | 10,34 $ | 74093 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 239 · interviste, forma, fumetto ruolo (PO-497, 498, 507) | giro | claude-opus-5-5 | 2,0 | 8,97 $ | 76156 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 259 · sorpresa e classifica | giro | claude-opus-5-5 | 2,1 | 7,41 $ | 57208 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 262 · formazioni senza rigorista (PO-513) | giro | claude-opus-5-5 | 0,9 | 3,88 $ | 26396 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 242 · proposte clip dribbling e inno (PO-505, 476) | giro | claude-opus-5-5 | 0,2 | 5,82 $ | 61235 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 237 · web già tradotta e controlli più veloci (PO-502, 504) | giro | claude-opus-5-5 | 17,6 | 13,35 $ | 84299 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 241 · eroe sempre in quadro dopo un'azione fallita (PO-506) | giro | claude-fable-5-2 | 5,4 | 26,45 $ | 172000 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 261 · serata: corpi fermi e spalle | giro | claude-fable-5-2 | 5,8 | 5,92 $ | 26867 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.197 | giro 266 · gigante-212 festa sempre giudicata | giro | claude-opus-5-5 | 2,4 | 3,92 $ | 25151 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 263 · pulsanti Home stessa misura (PO-514) | giro | claude-opus-5-5 | 8,1 | 1,18 $ | 6954 | 4 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.197 | giro 267 · anteprime dei 3 inni (PO-476) | giro | claude-opus-5-5 | 0,1 | 1,57 $ | 11363 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.197 | giro 265 · portiere-223 niente tuffo sul pallone largo | giro | claude-fable-5-2 | 7,1 | 2,81 $ | 12530 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.197 | giro 269 · rossi base Home, Club, difficoltà | giro | claude-opus-5-5 | 1,2 | 4,85 $ | 32264 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 264 · solo-highlight-166: battito del motore e scena deterministici | giro | claude-fable-5-2 | 12,8 | 13,06 $ | 65194 | 3 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.197 | giro 268 · rossi base Rosa, Agente, Profilo | giro | claude-opus-5-5 | 6,4 | 4,64 $ | 30318 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.197 | giro 270 · rossi base post-partita e coppa | giro | claude-opus-5-5 | 6,4 | 14,71 $ | 92770 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 271 · portiere-252 cieco, esiti-241 e validate-situations instabili | giro | claude-fable-5-2 | 7,9 | 20,38 $ | 120419 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 273 · squalifica-222 nato nella 197 | giro | claude-opus-5-5 | 0,8 | 2,46 $ | 20099 | 1 | completo (un solo avvio) |
| 7.999.197 | verifica 197 · blocco V2a | verifica | claude-opus-5-5 | 0,1 | 2,00 $ | 13078 | 1 | completo (un solo avvio) |
| 7.999.197 | verifica 197 · blocco V2b | verifica | claude-opus-5-5 | 0,1 | 1,71 $ | 11220 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 272 · tabellone-214 e ripartenza-235 | giro | claude-opus-5-5 | 2,7 | 5,60 $ | 46815 | 1 | completo (un solo avvio) |
| 7.999.197 | verifica 197 · blocco V1c | verifica | claude-opus-5-5 | 4,6 | 3,99 $ | 22592 | 1 | completo (un solo avvio) |
| 7.999.197 | verifica 197 · blocco V3b | verifica | claude-opus-5-5 | 1,1 | 1,65 $ | 9622 | 1 | completo (un solo avvio) |
| 7.999.197 | verifica 197 · blocco V3c2 | verifica | claude-opus-5-5 | 1,5 | 2,17 $ | 16156 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 275 · career-critical/playing-mdref | giro | claude-opus-5-5 | 0,3 | 2,71 $ | 14954 | 1 | completo (un solo avvio) |
| 7.999.197 | verifica 197 · blocco V3d | verifica | claude-opus-5-5 | 2,3 | 2,62 $ | 16092 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 274 · salti-274 (colpo di testa su angolo) | giro | claude-fable-5-2 | 2,2 | 8,08 $ | 61890 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 278 · analisi-217 (tasto in maiuscolo) | giro | claude-opus-5-5 | 0,1 | 2,05 $ | 12069 | 1 | completo (un solo avvio) |
| 7.999.197 | verifica 197 · blocco V3e1 | verifica | claude-opus-5-5 | 3,7 | 2,63 $ | 17403 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 276 · memoria-275 (scena vecchia non liberata) | giro | claude-fable-5-2 | 1,8 | 4,79 $ | 30785 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 277 · schermate-97 e schede-246 | giro | claude-fable-5-2 | 1,5 | 0,37 $ | 2860 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.197 | verifica 197 · blocco V1a | verifica | claude-opus-5-5 | 3,9 | 4,29 $ | 25448 | 1 | completo (un solo avvio) |
| 7.999.197 | verifica 197 · blocco V1b | verifica | claude-opus-5-5 | 7,3 | 7,07 $ | 48219 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.197 | verifica 197 · blocco V3c1 | verifica | claude-opus-5-5 | 3,4 | 2,62 $ | 16709 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 279 · riserva-104 (scene provocate) | giro | claude-fable-5-2 | 1,5 | 1,16 $ | 10779 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.197 | verifica 197 · blocco V3e2 | verifica | claude-opus-5-5 | 4,6 | 4,30 $ | 23060 | 3 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.197 | verifica 197 · blocco V3f | verifica | claude-opus-5-5 | 2,0 | 1,04 $ | 6568 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.197 | giro 280 · schede-246 (scenario provocato) | giro | claude-opus-5-5 | 2,0 | 2,63 $ | 18739 | 1 | completo (un solo avvio) |
| 7.999.197 | verifica 197 · blocco V1d | verifica | claude-opus-5-5 | 2,4 | 3,01 $ | 18678 | 1 | completo (un solo avvio) |
| 7.999.197 | verifica 197 · blocco V3a (highlight-95) | verifica | claude-opus-5-5 | 6,4 | 0,86 $ | 6283 | 3 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.197 | giro 281 · render-3d-023 (home già montata al DCL) | giro | claude-opus-5-5 | 0,1 | 1,48 $ | 7739 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 283 · schermate-97 (stacco nero letto da due segnali) | giro | claude-opus-5-5 | 0,2 | 2,20 $ | 19520 | 1 | completo (un solo avvio) |
| 7.999.197 | giro 282 · highlight-95 (rete D4 conta dall'esito a schermo) | giro | claude-fable-5-2 | 3,5 | 7,28 $ | 49640 | 1 | completo (un solo avvio) |
| 7.999.197 | verifica 197 · blocco V4 (guardiani vicini al giro 282) | verifica | claude-opus-5-5 | 1,9 | 2,06 $ | 9644 | 1 | completo (un solo avvio) |
| 7.999.198 | giro 284 · Home da PC e liste leggibili | giro | claude-opus-5-5 | 0,3 | 2,94 $ | 27491 | 1 | completo (un solo avvio) |
| 7.999.198 | giro 287 · pre-partita da PC, nota nel pulsante | giro | claude-opus-5-5 | 0,6 | 3,51 $ | 26974 | 1 | completo (un solo avvio) |
| 7.999.198 | giro 288 · togliere «[0]» dai pulsanti | giro | claude-opus-5-5 | 0,2 | 2,40 $ | 16490 | 1 | completo (un solo avvio) |
| 7.999.198 | giro 290 · avviso salienti nelle finestre Gioca | giro | claude-opus-5-5 | 0,4 | 3,29 $ | 30646 | 1 | completo (un solo avvio) |
| 7.999.198 | giro 285 · fascia nera davanti al tunnel (nastro della competizione) | giro | claude-fable-5-2 | 1,7 | 8,20 $ | 53658 | 1 | completo (un solo avvio) |
| 7.999.198 | giro 289 · censimento schermate da PC e Offerte compatte | giro | claude-opus-5-5 | 1,9 | 7,19 $ | 69247 | 1 | completo (un solo avvio) |
| 7.999.198 | giro 286 · portatore fermo prima della scelta | giro | claude-fable-5-2 | 2,7 | 9,89 $ | 60637 | 3 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.198 | giro 291 · eroe verso la porta avversaria dopo il recupero | giro | claude-fable-5-2 | 3,0 | 10,61 $ | 61551 | 1 | completo (un solo avvio) |
| 7.999.198 | verifica 198 rapida · blocco F1 | verifica | claude-opus-5-5 | 1,8 | 2,61 $ | 16696 | 1 | completo (un solo avvio) |
| 7.999.198 | verifica 198 rapida · blocco F2 (highlight-95) | verifica | claude-opus-5-5 | 2,0 | 1,54 $ | 7283 | 1 | completo (un solo avvio) |
| 7.999.198 | verifica 198 rapida · blocco D (286/291) | verifica | claude-opus-5-5 | 1,3 | 2,01 $ | 14380 | 1 | completo (un solo avvio) |
| 7.999.200 | giro 310 bilanciamento | sviluppo | claude-opus-5-5 | 2,1 | 12,24 $ | 94225 | 1 | completo (un solo avvio) |
| 7.999.200 | giro 311 ritocchi | sviluppo | claude-opus-5-5 | 0,4 | 3,39 $ | 24151 | 1 | completo (un solo avvio) |
| 7.999.201 | giro 312 rilascio automatico | sviluppo | claude-opus-5-5 | 1,3 | 4,98 $ | 69402 | 1 | completo (un solo avvio) |
| 7.999.201 | giro 314 serata tifosi | sviluppo | claude-fable-5-2 | 1,0 | 4,22 $ | 22643 | 1 | completo (un solo avvio) |
| 7.999.201 | giro 315 musica candidati | sviluppo | claude-opus-5-5 | 0,1 | 1,64 $ | 12075 | 1 | completo (un solo avvio) |
| 7.999.201 | giro 313 pulizia backlog | sviluppo | claude-opus-5-5 | 0,2 | 4,59 $ | 33868 | 1 | completo (un solo avvio) |
| 7.999.201 | giro 319 scheda Club (fermato) | sviluppo | claude-opus-5-5 | 0,1 | 2,24 $ | 18498 | 1 | completo (un solo avvio) |
| 7.999.201 | verifica 201 rossi | verifica | claude-opus-5-5 | 0,3 | 1,31 $ | 7670 | 1 | completo (un solo avvio) |
| 7.999.202 | giro 316 musica serata | sviluppo | claude-opus-5-5 | 1,0 | 3,43 $ | 24012 | 1 | completo (un solo avvio) |
| 7.999.202 | giro 317 trenini | sviluppo | claude-opus-5-5 | 0,5 | 5,51 $ | 71311 | 1 | completo (un solo avvio) |
| 7.999.202 | giro 318 testi | sviluppo | claude-opus-5-5 | 0,9 | 2,02 $ | 13411 | 1 | completo (un solo avvio) |
| 7.999.202 | giro 320 nome intro | sviluppo | claude-opus-5-5 | 0,9 | 2,49 $ | 15692 | 1 | completo (un solo avvio) |
| 7.999.202 | verifica 202 rossi | verifica | claude-opus-5-5 | 0,6 | 3,23 $ | 20461 | 1 | completo (un solo avvio) |
| 7.999.202 | verifica 202 bis rossi | verifica | claude-opus-5-5 | 0,5 | 4,90 $ | 33437 | 1 | completo (un solo avvio) |
| 7.999.199 | giro 293 · portatore che oscilla prima della scelta (PO-562) | sviluppo | claude-fable-5-2 | 1,8 | 12,11 $ | 80017 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.199 | giro 294 · ingresso in campo: pallone, audio, Indietro (PO-556/567/566) | sviluppo | claude-fable-5-2 | 1,0 | 10,19 $ | 71080 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.199 | giro 295 · portiere: guida unica, parata corta (PO-518/519/520/530; fermato dal limite delle 5 ore) | sviluppo | claude-fable-5-2 | 3,2 | 24,44 $ | 146155 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.199 | giro 296 · rigori e coppa (PO-534/535/536) | sviluppo | claude-fable-5-2 | 2,0 | 17,49 $ | 100372 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.199 | giro 297 · valutazione skill gamedev (sola lettura) | sviluppo | claude-fable-5-2 | 0,1 | 6,34 $ | 30617 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.199 | verifica giro 294 · controlli mancanti prima dell'unione (fermata dal limite delle 5 ore) | verifica | claude-fable-5-2 | 1,1 | 2,44 $ | 7474 | 1 | completo (un solo avvio) |
| 7.999.199 | giro 298 · Home ripulita, riga obiettivo (PO-558/559/568/571/572; fermato dal limite delle 5 ore) | sviluppo | claude-fable-5-2 | 0,5 | 6,02 $ | 41879 | 1 | completo (un solo avvio) |
| 7.999.199 | giro 299 · Rosa C/VC, angoli, audio nella presentazione (PO-563/564/567; fermato dal limite delle 5 ore) | sviluppo | claude-fable-5-2 | 0,6 | 0,26 $ | 735 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.199 | giro 295 (ripresa) · portiere: controlli e rapporto | sviluppo | claude-fable-5-2 | 1,7 | 3,44 $ | 16927 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.199 | giro 298 (ripresa) · Home: controlli e rapporto | sviluppo | claude-fable-5-2 | 1,8 | 4,31 $ | 22906 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.199 | giro 299 (ripresa) · Rosa C/VC, angoli, audio: controlli e rapporto | sviluppo | claude-fable-5-2 | 1,3 | 4,84 $ | 25108 | 1 | completo (un solo avvio) |
| 7.999.199 | giro 300 · pre-partita e PC (PO-565/551/552/553) | sviluppo | claude-fable-5-2 | 2,1 | 12,54 $ | 71225 | 1 | completo (un solo avvio) |
| 7.999.199 | giro 301 · esito «miss» con pallone in rete (PO-588) | sviluppo | claude-fable-5-2 | 1,2 | 11,09 $ | 71919 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.199 | verifica 198 normale blocco 1 · V1 (mappa di src/12) | verifica | claude-fable-5-2 | 3,8 | 5,53 $ | 28869 | 1 | completo (un solo avvio) |
| 7.999.199 | giro 302 · ritocchi: via tasti 1-2-3, striscia, capitano (PO-552/589/590) | sviluppo | claude-fable-5-2 | 0,9 | 11,19 $ | 69050 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.199 | verifica 198 normale · V2 (mappa di src/15) | verifica | claude-fable-5-2 | 2,4 | 3,92 $ | 17907 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.199 | verifica 198 normale · V3 (unione 295×301, highlight-95) | verifica | claude-fable-5-2 | 4,4 | 9,15 $ | 24696 | 3 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.199 | verifica 198 normale · V4 (schermate) | verifica | claude-fable-5-2 | 3,1 | 6,36 $ | 38209 | 1 | completo (un solo avvio) |
| 7.999.199 | verifica 198 normale · V2a (src/15, 1 di 4) | verifica | claude-fable-5-2 | 2,5 | 3,71 $ | 16568 | 1 | completo (un solo avvio) |
| 7.999.199 | verifica 198 normale · V2b (src/15, 2 di 4) | verifica | claude-fable-5-2 | 1,9 | 3,76 $ | 16785 | 1 | completo (un solo avvio) |
| 7.999.199 | verifica 198 normale · V2c (src/15, 3 di 4) | verifica | claude-fable-5-2 | 2,6 | 4,13 $ | 16935 | 1 | completo (un solo avvio) |
| 7.999.199 | verifica 198 normale · V2d (src/15, 4 di 4) | verifica | claude-fable-5-2 | 2,4 | 3,36 $ | 15568 | 1 | completo (un solo avvio) |
| 7.999.199 | giro 303 · prova GitHub Actions per la verifica (PO-592) | sviluppo | claude-fable-5-2 | 1,3 | 7,43 $ | 47978 | 1 | completo (un solo avvio) |
| 7.999.199 | giro 304 · tunnel-245 rosso sull'unione | sviluppo | claude-fable-5-2 | 2,3 | 6,79 $ | 54711 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.199 | verifica 198 normale · R1 (residui V4, parte 1) | verifica | claude-fable-5-2 | 1,7 | 3,21 $ | 16365 | 1 | completo (un solo avvio) |
| 7.999.199 | verifica 198 normale · R2 (residui V4, parte 2) | verifica | claude-fable-5-2 | 2,4 | 4,15 $ | 21953 | 1 | completo (un solo avvio) |
| 7.999.199 | verifica 198 normale · R3 (residui V2d, corpi-073) | verifica | claude-fable-5-2 | 1,5 | 3,56 $ | 15355 | 1 | completo (un solo avvio) |
| 7.999.199 | verifica 198 normale · V3b (chiusura V3, parte 9 di Actions) | verifica | claude-fable-5-2 | 3,2 | 5,42 $ | 27751 | 1 | completo (un solo avvio) |
| 7.999.199 | giro 305 · corpi-073 instabile sull'unione | sviluppo | claude-fable-5-2 | 1,1 | 6,79 $ | 42147 | 1 | completo (un solo avvio) |
| 7.999.199 | verifica 198 normale · R4 (parte 6 di Actions) | verifica | claude-fable-5-2 | 1,4 | 3,68 $ | 18802 | 1 | completo (un solo avvio) |
| 7.999.199 | verifica 198 normale · R5 (parti 8 e 12 di Actions) | verifica | claude-fable-5-2 | 2,5 | 4,39 $ | 23492 | 1 | completo (un solo avvio) |
| 7.999.199 | verifica 198 normale · R6 (parte 13 di Actions) | verifica | claude-fable-5-2 | 3,0 | 5,61 $ | 23384 | 1 | completo (un solo avvio) |
| 7.999.199 | giro 306 · testi-190 rosso per il giro 299 | sviluppo | claude-fable-5-2 | 0,6 | 4,14 $ | 29362 | 1 | completo (un solo avvio) |
| 7.999.199 | verifica finale 198 normale · F1 | verifica | claude-fable-5-2 | 2,2 | 4,44 $ | 23020 | 1 | completo (un solo avvio) |
| 7.999.199 | verifica finale 198 normale · F2 | verifica | claude-fable-5-2 | 3,7 | 4,63 $ | 25357 | 1 | completo (un solo avvio) |
| 7.999.199 | giro 307 · tunnel-304 instabile | sviluppo | claude-fable-5-2 | 1,8 | 3,85 $ | 24766 | 1 | completo (un solo avvio) |
| 7.999.199 | verifica 198 normale · R7 (gol-eroe-154, chiusura-99) | verifica | claude-fable-5-2 | 1,7 | 2,43 $ | 10133 | 1 | completo (un solo avvio) |
| 7.999.200 | giro 308 · metodo di rilascio: sentinelle, mappa unica, Actions (PO-592) | sviluppo | claude-opus-5-5 | 3,1 | 8,16 $ | 76708 | 1 | completo (un solo avvio) |
| 7.999.200 | giro 309 · misura del bilanciamento (PO-596/560/583/584) | sviluppo | claude-opus-5-5 | 0,5 | 8,54 $ | 79950 | 4 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.203 | giro 321 · giornata contata due volte al caricamento (PO-349) | sviluppo | claude-opus-5-5 | 0,8 | 3,34 $ | 23248 | 1 | completo (un solo avvio) |
| 7.999.204 | giro 322 · proposte Primavera (PO-356, solo proposta) | sviluppo | claude-opus-5-5 | 0,1 | 1,99 $ | 16848 | 1 | completo (un solo avvio) |
| 7.999.204 | giro 323 · Primavera: salto a gennaio per merito (PO-356 B) | sviluppo | claude-opus-5-5 | 1,2 | 7,58 $ | 64060 | 1 | completo (un solo avvio) |
| non attribuita | giro 324 · highlight dalle fasce, misura (PO-376) | sviluppo | claude-fable-5-2 | 1,1 | 7,45 $ | 39483 | 1 | completo (un solo avvio) |
| 7.999.205 | giro 325 · marcatore unico fra cronaca e avviso (PO-377) | sviluppo | claude-fable-5-2 | 2,2 | 6,70 $ | 31539 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.204 | giro 326 · deploy mai dietro ai treni (PO-624) | sviluppo | claude-opus-5-5 | 0,3 | 5,09 $ | 49155 | 1 | completo (un solo avvio) |
| 7.999.205 | giro 327 · ritocchi: curva del salto, Validate Situations a mano | sviluppo | claude-opus-5-5 | 1,4 | 3,06 $ | 18028 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.205 | giro 328 · trenini più corti (PO-621) | sviluppo | claude-opus-5-5 | 0,3 | 6,46 $ | 80071 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.205 | giro 329 · trenini fino a 15 macchine (PO-621) | sviluppo | claude-opus-5-5 | 0,2 | 3,36 $ | 31329 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.206 | giro 330 · treno: parti robuste (PO-624) + notturno, margine 10%, carriera di giorno (PO-626) | sviluppo | claude-opus-5-5 | 0,7 | 6,64 $ | 61232 | 1 | completo (un solo avvio) |
| 7.999.207 (in viaggio) | giro 331 · guardiani instabili delle scene 3D (PO-610, PO-620) | sviluppo | claude-fable-5-2 | 4,6 | 19,77 $ | 101698 | 1 | completo (un solo avvio) |
| 7.999.206 | giro 332 · guardiani instabili di schermate e logica (PO-620) | sviluppo | claude-opus-5-5 | 3,6 | 15,87 $ | 107524 | 1 | completo (un solo avvio) |
| 7.999.207 (in viaggio) | giro 333 · treno notturno mai partito (PO-630) + riga in pagina (PO-631) | sviluppo | claude-opus-5-5 | 0,7 | 6,29 $ | 63536 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.207 (in viaggio) | giro 334 · ellisse d'attesa dei compagni (PO-610) | sviluppo | claude-fable-5-2 | 3,3 | 8,04 $ | 43168 | 1 | completo (un solo avvio) |
| 7.999.207 (in viaggio) | giro 335 · Home: tasti rossi in conflitto (PO-623) + decisioni in sospeso (PO-615) | sviluppo | claude-opus-5-5 | 0,9 | 4,97 $ | 38166 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.207 (in viaggio) | giro 336 · pre-partita chiaro (PO-608) + classifica a fine partita (PO-609) | sviluppo | claude-opus-5-5 | 1,2 | 5,43 $ | 42944 | 1 | completo (un solo avvio) |
| 7.999.207 (in viaggio) | giro 337 · scheda Club: «La stagione» (PO-606), via il contratto (PO-617) | sviluppo | claude-opus-5-5 | 0,7 | 3,87 $ | 29359 | 3 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.207 (in viaggio) | giro 338 · tutto su main, via il ramo poc (PO-603) | sviluppo | claude-opus-5-5 | 1,3 | 5,55 $ | 49037 | 1 | completo (un solo avvio) |
| 7.999.207 (in viaggio) | giro 339 · Formazioni: maglia dell'eroe (PO-614) + titolo centrato (PO-595) | sviluppo | claude-opus-5-5 | 0,7 | 3,13 $ | 27836 | 2 | parziale: solo l'ultimo avvio del contenitore |
| 7.999.207 (in viaggio) | giro 340 · Albo d'oro della lega scelta (PO-616, 569, 570) | sviluppo | claude-opus-5-5 | 0,7 | 5,57 $ | 46638 | 1 | completo (un solo avvio) |
| 7.999.207 (in viaggio) | giro 341 · «Stagione per stagione» (PO-618) + «consigliato» (PO-622) | sviluppo | claude-opus-5-5 | 0,7 | 4,09 $ | 29618 | 1 | completo (un solo avvio) |
| 7.999.207 (in viaggio) | verifica 207 · 6 rossi nuovi del treno | verifica | claude-opus-5-5 | 0,9 | 1,78 $ | 11706 | 1 | completo (un solo avvio) |
| 7.999.207 (in viaggio) | giro 342 · colpi di testa sincronizzati (PO-629) | sviluppo (in corso, usage assente) | claude-fable-5-2 | 2,2 | 0,00 $ | 0 | 1 | completo (un solo avvio) |
| 7.999.207 (in viaggio) | giro 343 · difensori che scivolano (PO-587) + punizione in area (PO-611) | sviluppo | claude-fable-5-2 | 1,9 | 12,49 $ | 87978 | 1 | completo (un solo avvio) |
| 7.999.207 (in viaggio) | giro 344 · rossi del treno 208: verifica e riparazione | sviluppo (in corso, usage assente) | claude-opus-5-5 | 0,5 | 0,00 $ | 0 | 1 | completo (un solo avvio) |
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
| 7.999.192 | **TOTALE 7.999.192** (23 sessioni) |  |  |  | almeno 236,54 $ |  |  | 6 sessioni parziali: totale minimo |
| 7.999.193 | **TOTALE 7.999.193** (1 sessioni) |  |  |  | 2,05 $ |  |  | tutte complete |
| 7.999.194 | **TOTALE 7.999.194** (8 sessioni) |  |  |  | almeno 94,96 $ |  |  | 3 sessioni parziali: totale minimo |
| 7.999.195 | **TOTALE 7.999.195** (24 sessioni) |  |  |  | almeno 198,09 $ |  |  | 2 sessioni parziali: totale minimo |
| 7.999.196 | **TOTALE 7.999.196** (17 sessioni) |  |  |  | almeno 149,71 $ |  |  | 1 sessioni parziali: totale minimo |
| 7.999.197 | **TOTALE 7.999.197** (66 sessioni) |  |  |  | almeno 473,90 $ |  |  | 13 sessioni parziali: totale minimo |
| 7.999.198 | **TOTALE 7.999.198** (11 sessioni) |  |  |  | almeno 54,21 $ |  |  | 1 sessioni parziali: totale minimo |
| 7.999.199 | **TOTALE 7.999.199** (37 sessioni) |  |  |  | almeno 237,13 $ |  |  | 13 sessioni parziali: totale minimo |
| 7.999.200 | **TOTALE 7.999.200** (4 sessioni) |  |  |  | almeno 32,33 $ |  |  | 1 sessioni parziali: totale minimo |
| 7.999.201 | **TOTALE 7.999.201** (6 sessioni) |  |  |  | 18,98 $ |  |  | tutte complete |
| 7.999.202 | **TOTALE 7.999.202** (6 sessioni) |  |  |  | 21,58 $ |  |  | tutte complete |
| 7.999.203 | **TOTALE 7.999.203** (1 sessioni) |  |  |  | 3,34 $ |  |  | tutte complete |
| 7.999.204 | **TOTALE 7.999.204** (3 sessioni) |  |  |  | 14,67 $ |  |  | tutte complete |
| 7.999.205 | **TOTALE 7.999.205** (4 sessioni) |  |  |  | almeno 19,58 $ |  |  | 4 sessioni parziali: totale minimo |
| 7.999.206 | **TOTALE 7.999.206** (2 sessioni) |  |  |  | 22,52 $ |  |  | tutte complete |
| 7.999.207 (in viaggio) | **TOTALE 7.999.207 (in viaggio)** (14 sessioni) |  |  |  | almeno 80,99 $ |  |  | 4 sessioni parziali: totale minimo |
| non attribuita | **TOTALE non attribuita** (1 sessioni) |  |  |  | 7,45 $ |  |  | tutte complete |
