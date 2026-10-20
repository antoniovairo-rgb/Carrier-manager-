# PO-289 · Censimento degli impulsi/eventi che doppiano l'Ufficio (giro 84)

Base: main (src/03-eventi-narrativi.jsx, src/08-panchina-derby-meteo-cori.jsx, src/18-career-app.jsx). Righe = main prima delle modifiche.
Stato vero dell'Ufficio: STAFF24 (src/08:42, `perkTrainer/perkNutrition/perkMental` + `…Lv`), accademia (`player.academy24`, `academyCost24`: apertura max(150k, 8 stipendi), gestione max(400, 2% stipendio)/sett.),
BENI24 (src/08:125: casa 250k, auto 150k, barca 700k, fondazione 300k, `player.beni24`), investimento della stagione (`player.invest24`, src/08:113), sponsor a fasce di fama del Procuratore (`player.sponsors`, `sponsorView`, src/18:2441).
Regola scelta: la voce compare solo se ha senso (Ufficio aperto = pro, cosa non ancora posseduta, patrimonio sufficiente), l'effetto e' quello dell'Ufficio (stesso stato, stesso costo, stessi bonus), niente cifre inventate.
Prudente: una funzione nuova mai creata per collegare; dove serviva (sponsor) si e' solo spostato `sponsorView` da dentro CareerApp al modulo (src/08), invariato.

## A. Collegati allo stato vero dell'Ufficio (8)

| id | file:riga (main) | cosa promette | cosa fa davvero (prima) | decisione |
|---|---|---|---|---|
| wi_scuola_calcio | src/03:728 | «Scuola calcio col tuo nome», «Ci metto faccia e soldi» | -30.000 fissi, +9 pop, +6 morale; nessuna accademia (`academy24` mai toccato) | COLLEGATO. Compare solo se pro, senza accademia e col conto >= costo d'apertura dell'Ufficio. «Faccia e soldi» fonda davvero `academy24` e paga `academyCost24(p).found`; il testo dice «La trovi nell'Ufficio». «Presto solo il nome» = licenza (soldi + 3 pop), il testo dice che nessuna accademia e' tua. |
| wi_mental_coach | src/03:767 | «Un mental coach propone due giorni di lavoro» | +6 morale +3 forma -3 fatica una tantum, nessun mental coach | COLLEGATO a `perkMental` (livello 1, costo Ufficio). Compare solo se pro, mental coach non attivo, conto >= 8 settimane di costo. «Lo ingaggio» lo attiva davvero (lo si congeda dall'Ufficio); effetto = quello dell'Ufficio (pressione e bivi di tensione). |
| wi_personal_chef | src/03:457 | «Uno chef di nutrizione sportiva, un mese di prova. Costa.» | -15.000, -10 fatica, +3 forma, nessuno staff | COLLEGATO a `perkNutrition` (preparatore atletico, il vecchio nutrizionista fuso nel PO-281). Stesse condizioni del mental coach. |
| wi_seg_chef | src/03:902 | seguito del chef: «Ti propone di restare», -20.000 | spese inventate | RISCRITTO (il mese di prova non esiste piu': il testo parla del preparatore atletico preso nello Staff privato, «Seguo il suo piano» senza i 20.000 inventati; la condizione del seguito e' invariata, cosi' resta coerente con la regola dei seguiti PO-154). |
| wi_casa_citta | src/03:783 | «Puoi comprare casa in città» -45.000 | -45.000, +6 morale, +4 pop, nessuna casa | COLLEGATO al bene `casa` (250.000, +1 pop, +2 fiducia, +0,5 morale/sett. e reazioni nel tempo). Compare solo se non gia' tua e col conto >= 250.000. |
| vita_casa | src/03:1044 | «Le chiavi della prima casa TUA» -180.000 | -180.000, +12 morale, nessun bene | COLLEGATO al bene `casa` (stesso costo/effetti dell'Ufficio; non esce se gia' tua). |
| vita_auto | src/03:1043 | «Ti concedi l'auto dei sogni» -45.000 | -45.000, +10 morale, nessun bene | COLLEGATO al bene `auto` (150.000, +3 pop, -2 fiducia del mister; non esce se gia' tua). |
| vita_agente_sponsor | src/03:1056 | «Uno sponsor di scarpini ha chiesto di te… accettavi» | +15.000 una tantum, +3 pop; il sistema sponsor del Procuratore ignorato | COLLEGATO a `player.sponsors` (stessa fascia/brand/cifra settimanale dell'offerta del Procuratore, `sponsorView`). Compare solo con procuratore, offerta reale in corso e nessuno sponsor firmato; firma davvero il contratto (registro, diario). Il seguito vita_agente_shooting torna coerente (c'e' uno sponsor vero). |

## B. Gia' collegati dal giro 70 (PO-223/265/281), non toccati (3)

| id | file:riga | note |
|---|---|---|
| wi_investimento | src/03:437 | `flag:"investment"` + `inv`: registro `investimenti223`, chiusura unica `chiudiInvestimenti281` (stesso registro `investHist24`, stessa notizia di stampa dell'investimento dell'Ufficio). Soldi veri (meta' del conto, PO-265). |
| wi_ristorante_socio | src/03:819 | idem, profilo bilanciato. |
| wi_cripto | src/03:759 | idem, profilo rischioso. |
PUNTO APERTO: non aprono il riquadro «Investimento» dell'Ufficio (`invest24`): hanno un registro parallelo con formule proprie (PO-223). Unificare gli stati cambierebbe gli importi dei guardiani investimento-223 / meta-conto-265: scelta prudente = lasciare.

## C. Staff DEL CLUB, non doppioni: lasciati, testo reso inequivocabile (6)

Il «preparatore atletico»/«nutrizionista»/«preparatore» che propone una seduta e' il personale del club, non lo staff privato dell'Ufficio. Gratis, una tantum. Si aggiunge «del club» al testo (solo senza __CPM_NO_IMP289).
wi_ciclo_forza (src/03:564), wi_staff (614), wi_analisi_video (679), wi_crioterapia (683), wi_sosta_nazionali (815), wi_dieta_ferrea (388).
Lasciati senza modifica: wi_extra_portieri (src/03:408, preparatore dei portieri del club), wi_veterano_allenamento (un compagno), WEEKLY_EVENTS riga 33/36/42/45/142 (flavor di allenamento di squadra, nessuna promessa di acquisto).

## D. Una tantum che non esistono come sistema nell'Ufficio: LASCIATI (elenco richiesto)

Sponsor/spot/endorsement: wi_sponsor_pers (src/03:429, +35.000), wi_sponsor (630), wi_sponsor_auto (703), wi_bonus_gol_social (779, +8.000), wi_dieta_brand (831, +12.000), wi_scommessa_social (465, +18.000), wi_auto_lusso (720, auto in prestito per post), wi_videogioco (735, +25.000), wi_esports (795, +18.000), wi_addio_docu (540, +40.000), wi_biografia (400, +20.000), cm_stella_brand_globale (1244, +900.000), cm_stella_volto_lega (1253), WEEKLY_EVENTS riga 122/124/227/228/230/231 (sponsor e accordi DEL CLUB / spot personali: cosmetici, gia' senza promesse di soldi). Riga 229 «Il tuo agente finalizza un accordo commerciale secondario. Entrate extra.»: promette soldi che non arrivano (ef solo morale/pop/valore); NON toccata (e' uno dei flavor settimanali, chiave anti-ripetizione evSeen sui primi 48 caratteri, nessun guardiano la misura): PUNTO APERTO, candidata a un giro dedicato.
Gesti benefici/regali: wi_beneficenza (441, campetto -25.000), wi_asta_maglia (384), wi_donazione (671), wi_bimbo_sogno, wi_orologio, wi_orologi_squadra, wi_massaggiatore_addio, wi_compagno_prestito: non sono la Fondazione dell'Ufficio (300.000, bene permanente).
Il club e la scuola calcio del club: wi_giovani_accademia (695, «visitare la scuola calcio» del club), wi_seg_accademia (906), wi_addio_bimbi (548), wi_seg_podcast: non e' l'accademia del giocatore.
Procuratore: wi_pro_procuratore (508), wi_procuratore (582, gia' collega a `transferListed` dal 7.430), wi_procuratore_push (445), wi_amichevole (556), wi_opinionista (775): il procuratore compare gia' solo con `hasAgent` o non promette nulla d'altro.
Seguito: wi_seg_scuola (934): «La scuola calcio in cui hai messo faccia e soldi» resta vero (ora e' l'accademia vera).

## E. Tolti

Nessun impulso tolto dal pool: tutto cio' che si poteva collegare con stato/funzioni gia' esistenti e' stato collegato; un seguito riscritto (wi_seg_chef, vedi A).

## Interruttore e determinismo
`window.__CPM_NO_IMP289=true` = comportamento della 7.999.176: condizioni, testi, effetti, costi, seguiti come prima (le varianti nuove vivono sotto `v289`/`uff289` e sono ignorate). Nessun Math.random nuovo; la selezione resta `pick` su pool filtrato da `cond` (cambia solo la composizione del pool quando le condizioni sono piu' strette).
