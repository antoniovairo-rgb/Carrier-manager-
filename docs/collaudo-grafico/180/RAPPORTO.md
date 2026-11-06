# Collaudo grafico 180 — qualità grafica, visiva e coerenza di schermate e finestre

Richiesta PO 06/11: «fai una verifica di qualità grafica, visiva e coerenza su tutte le schermate e pop up».
Base: `lavoro/180` = 7.999.179 + foto del PO (999eb19), **codice del gioco non modificato** su questo ramo (`collaudo/180-grafica`).
Sessione figlia: nessuna decisione di prodotto; i rimedi sono **proposte**.

## Come è stato misurato

- **Tre formati**: 360x800 e 412x915 (tocco), 1440x900 (mouse). **Tre club**, letti dal database del gioco (`src/02`):
  `rosso` = FC Merseyside #dc2626 (il caso della foto del PO), `giallo` = FC Wolverhampton #f59e0b (chiaro, **nome di 16 caratteri**),
  `scuro` = FC Tyneside #0f0f0f. Giocatore **Massimiliano Bartolomucci** (25 caratteri). Carriera stagione 12, Premier Division.
- Sonde (solo lettura, nel ramo): `tests/visual/c180-schermate.mjs` (carriera e fuori carriera), `c180-partita.mjs` (partita),
  `c180-lib.mjs` (misure), `c180-sintesi.mjs` (raggruppa i rilievi), `c180-comprimi.py` (foto a 128 colori, dopo la misura).
- Misure per ogni schermata: **contrasto sui pixel** (per ogni riga di testo visibile e non coperta da un altro elemento, il fondo è
  la mediana dei pixel dello screenshot dentro la riga: vale anche su gradienti, tinte del club, foto e campo; colore del testo dal CSS;
  soglia WCAG 4,5:1, 3:1 per corpo ≥18 px o ≥14 px grassetto; l'ombra del testo non è contata), **parole spezzate** senza trattino,
  testi tagliati, testi sovrapposti, scorrimento orizzontale, elementi fuori schermo, **contenuto coperto da una fascia fissa a fine
  scorrimento**, **tasti < 44 px**, caratteri, raggi, colori della tavolozza V1 tolta alla tappa 4 (avorio f5f3ef/f7f5f1/f1efe9,
  granata 8e1f33/6a1326, tinte f7e9ec/e3c3cb, ardesia 0f172a/1e293b, rosa ee9aaa — valori letti dal diff di 75ffedd), fondi chiari.
- **Gravità**: **alta** = illeggibile (rapporto < 2:1) o coperto; **media** = sotto soglia WCAG ma leggibile, tocco < 44 px su
  telefono, parola spezzata, resto della grafica vecchia visibile, dato incoerente; **bassa** = scostamento dalle tavole senza danno
  alla lettura, tocco piccolo solo col mouse.
- Foto: `docs/collaudo-grafico/180/<schermata>-<formato>-<club>.png` (formato 360 · 412 · pc). Il PC è dimezzato (720x450).

### Lezione della 179 applicata al banco

Il banco di carriera usato finora (G0, ereditato dalla 178) **non aveva il calendario**: senza, la Home non rende la card della
**prossima partita**, cioè proprio il blocco che il PO ha bocciato (foto `docs/collaudo-po/179-home-telefono-merseyside.jpg`). Qui il
calendario è generato con la funzione vera del gioco (`generateSeasonCalendar`) sulla lega del club, con storico, classifica e registro
delle giornate allineati (le guardie anti-ripetizione ritiravano la giornata altrimenti). Con la card accesa la sonda ritrova i difetti
della foto: nome del club spezzato, testi rosa su rosso (G180-01, G180-05).

## Copertura

**Carriera** (3 formati x 3 club, 37 schermate o finestre ciascuno, 0 errori di pagina): Home, Stagione (Classifica, Calendario, Coppe),
Club, Carriera (Profilo, Nazionale), Agente, Ufficio; opzioni della carriera; figurina grande; finestre: settimana (impulso, spogliatoio,
vissuta), partita da titolare e da panchina, offerta di mercato, intervista (vittoria, sconfitta), presentazione del procuratore, festa
della nazionale, presentazione del club (passi 0 e 2), galà, saga del capitano, notifica, il «momento» che il gioco apre da sé all'arrivo
nella settimana (telefonata del CT). **Fuori carriera** (club rosso, 3 formati): menu, crediti, opzioni, creazione, offerte dei provini.
**Partita** (vedi sezione dedicata): pre-partita e conferenza, formazioni, ingresso, partita 2D (pannello chiuso, pagelle, statistiche),
pausa, highlight (presentazione, scelta, esito gol, esito parata), festa del titolo, post-partita.

**Non coperto (dichiarato):**
- schermate raggiunte col gancio `goScreen` (conferenza stampa, post-partita di carriera, fine stagione, premi di stagione, fine carriera,
  convocazione, presentazione del club, passaggio ai professionisti): **sei su otto hanno raggi e caratteri identici** e la foto di
  «fine carriera» mostra la presentazione del club ancora aperta sopra — il gancio non chiude quella finestra. Le foto `sch-*` restano
  nella cartella ma **non le giudico**, tranne `sch-proTransition` e `sch-seasonAwards`, che rendono il loro contenuto (G180-02, G180-03);
- opzioni della carriera (tasto non trovato dalla sonda), «momento esordio» (il gancio risponde `false`), Coppa delle Nazioni
  (`no-nc`: nessun torneo in coda), schermata d'avvio dei provini (non trovata a 412 e 1440);
- **rigori**: in una gara di campionato `__CPM_SO_FORCE` chiude a 1-1 e porta al post-partita; servono una coppa a eliminazione;
- tutorial e salvataggi (finestra di salvataggio/importazione) non sono stati aperti;
- «FC Test» nell'intervista è l'avversario finto del gancio `forceInterview` di collaudo, non un difetto del gioco.

## Tabella dei difetti

| id | schermata | formato | club | foto | misura | gravità | proposta |
|---|---|---|---|---|---|---|---|
| G180-01 | testata di **tutte le schede** di carriera (19 schermate) | 360 (tutti e 3 i club); 412 (giallo) | tutti | home-360-rosso.png, home-412-giallo.png | nome del club **spezzato a metà parola**: «MERSEY/SIDE», «WOLVERHAMP/TON», «TYNE/SIDE» (lettere della stessa parola su due righe) | media (è il difetto bocciato dal PO sulla 179) | `overflow-wrap:normal` + `hyphens:none` sul nome e riduzione del corpo (o ellissi su una riga) quando non ci sta; la testata è **condivisa**: il giro 106 deve coprire tutte le schede, non solo la Home |
| G180-02 | Galà e Premi di stagione | 360, 412, pc | tutti | gala-412-giallo.png, sch-seasonAwards-412-giallo.png | «Chiara Loreti apre la prima busta» #f4f1ea su card bianca (rgba 255,255,255,0.95) **1,03–1,04:1**; «Trofeo d'Oro» #9aa3b2 su bianco 2,31:1 | **alta** | card della busta sulla superficie V2 (#1a1e27) con testo #f4f1ea, oppure testo scuro sulla card chiara |
| G180-03 | Passaggio ai professionisti (fine stagione U18) | 360, 412, pc | tutti | sch-proTransition-412-giallo.png | card su **fondi chiari V1** (#eff6ff, #fefce8; pillole #dcfce7, #f3e8ff) con testo chiaro: nome del giocatore **1,04:1**, club 1,09:1, «14» gol #fbbf24 1,53:1; «Puoi ancora restare» in granata V1 #8e1f33 | **alta** | portare le card a TINTE.sup/inc e le pillole ai colori di stato V2 |
| G180-04 | Carriera › Nazionale | 360, 412, pc | tutti | nazionale-412-rosso.png | numero delle presenze «14» in **#003399** (blu della bandiera) su fondo scuro **1,64:1** (corpo 20/900) | **alta** | numero in TINTE.testo; il colore della nazione solo come accento (filo o icona) |
| G180-05 | Home, card «Prossima partita» | 360, 412, pc | rosso | home-412-rosso.png | testi rosa sul rosso del club: «Prossima · Premier Division · 11ª giornata», «2ª in classifica», «Forza 98/99» #fae0e0 su #de3131 **3,66:1** (11–12 px); «VS» #f2adad 2,47:1 (32 px, soglia 3) | media (bocciato dal PO; in carico al giro 106) | inchiostro #ffffff a piena opacità sui fondi club saturi, o fascia scura sotto i testi; scurire la tinta del club oltre una luminanza data |
| G180-06 | Home, card «Prossima partita» | 360, 412, pc | giallo | home-412-giallo.png | «SETT. 12 · CASA» #ffffff su #b17611 **3,84:1** | media | sul giallo l'etichetta in inchiostro scuro (la card usa già inchiostro scuro per il resto) |
| G180-07 | Pre-partita | 412 | rosso | prepartita-412-rosso.png | pillola della competizione «PREMIER DIVISION» bianca su sfumatura bianco→rosso **1,40:1** | **alta** | pillola su fondo pieno scuro o testo scuro; verificare con tutte le leghe (la sfumatura usa i colori della bandiera) |
| G180-08 | Creazione e figurina grande | 360, 412, pc | tutti | creazione-360-rosso.png, figurina-412-giallo.png | etichetta «KORWARD» sulla cornice d'argento: #ffffff su #ccd1d7 **1,54:1** | **alta** (illeggibile; è decorazione) | inchiostro scuro sulla cornice argento (come la cornice oro) o togliere la scritta |
| G180-09 | Momento «La telefonata del CT» (aperto dal gioco) | 360, 412, pc | tutti | auto-la-telefonata-del-ct-412-giallo.png | note «Rimarrà nella storia: …» #606992 su #1a1e27 **3,12:1** (11 px) | media | TINTE.sec (#9aa3b2, 6,6:1 su #1a1e27) |
| G180-10 | Intervista, presentazione del procuratore | 360, 412, pc | tutti | intervista-sconfitta-360-giallo.png | sala stampa illustrata con **fondo chiaro** (pannello sponsor bianco, banco chiaro); sigla «Elite» #92400e su grigio 3,3:1; targa del nome sul banco troncata «MASSIMILIANO BAR» (foto) | media | sala in toni notte (coerente con le tavole V2Intervista); targa col solo cognome |
| G180-11 | Classifica | 360, pc | rosso; giallo | classifica-pc-rosso.png, classifica-pc-giallo.png | posizione «5» #f97316 su #563522 3,89:1; «17» #ef4444 su #1a1e27 4,43:1 | bassa | colori di stato V2 (#f87171, #fbbf24) |
| G180-12 | fascia «Sostieni il progetto · Idee e feedback» (tutte le schede) | 360, 412 | tutti | home-360-rosso.png | tasti **180x26 px** (sotto i 44); testo «Sostieni il progetto» in **rosa V1 #ee9aaa** | media | fascia alta 44 px o voci spostate nelle Opzioni; testo TINTE.sec/oro |
| G180-13 | partita: tasti del tabellone (avviso ⚠️, velocità «1×», pausa ⏸) | 412 (360 uguale) | tutti | partita2d-chiuso-412-rosso.png | ⚠️ 22x33, «1×» **22x19**, ⏸ 14x33 px | media | zona di tocco 44x44 (come la freccia del giro 107) senza ingrandire il disegno |
| G180-14 | partita 2D: freccetta e linguette Statistiche/Pagelle | 360, 412, pc | tutti | partita2d-pagelle-412-rosso.png | freccia 34x27, linguette 25 px, simbolo invertito rispetto al verso del pannello | media | **corretto** nel giro 107 (`sviluppo/giro107-freccetta`, `docs/sviluppo/RAPPORTO-giro107.md`) |
| G180-15 | partita: tabellone a 820x1180 (tablet verticale) | 820 (fuori dai tre formati, osservato nel giro 107) | — | ../../sviluppo/foto-giro107/freccia-t820-trasf-2-aperto.png | il tasto «1×» **copre il punteggio «0 - 0»**; «PRIMAVERA 2» tagliato | **alta** (coperto) | il tasto velocità fuori dal blocco del punteggio |
| G180-16 | partita: tabellone | 360, 412 | tutti | partita2d-chiuso-412-rosso.png | nomi delle squadre troncati con i puntini: «FC MANCHE…», «FC MERSEY…» | bassa | sigla (MER) sotto una larghezza, nome intero sopra |
| G180-17 | highlight: esito gol | 412 | rosso | hl-esito-gol-412-rosso.png | riquadro del banner «GOOOOL! Bartolomucci» più largo del contenitore: 427 px su 410 | media | `max-width:100%` e a capo sul nome |
| G180-18 | Galà e Premi di stagione | 360, 412 | tutti | gala-412-giallo.png | «Salta il galà» **60x14 px** | media | tasto testuale con zona di tocco 44 px |
| G180-19 | Agente | 360, 412 | tutti | agente-412-rosso.png | «✂️ Licenzia il procuratore» 157x24 px | media | altezza 44 px |
| G180-20 | Stagione (Classifica/Calendario/Coppe), Carriera (Profilo/Nazionale), righe-fisarmonica di Agente e Calendario | pc | tutti | calendario-pc-giallo.png, agente-pc-giallo.png | sottoschede 357x32 e 537x32; righe-fisarmonica 1086x31 | bassa (mouse) | 44 px per coerenza col telefono |
| G180-21 | **resti V1 — rosa #ee9aaa** (brandText del vecchio tema scuro) | tutti | tutti | agente-412-rosso.png, calendario-412-rosso.png | colore di testo in 24 schermate: «€45 mln» (Agente), «▶ vs FC Manchester» (Calendario), «Sostieni il progetto», tasti della barra in basso (colore dichiarato del tasto) | media | sostituire con TINTE.oro (valori) o TINTE.sec (etichette) |
| G180-22 | **resti V1 — granata #8e1f33** | tutti | tutti | home-412-giallo.png, gala-412-rosso.png, menu-412-rosso.png, ufficio-412-rosso.png | barra di avanzamento della stagione in Home (granata anche col club giallo o scuro), pillola «Stasera 1 premio» del galà, tasto del preparatore in Ufficio, riga dell'eroe nelle pagelle 2D (rgba 142,31,51,0.38), riquadro di testa del **menu iniziale** (gradiente granata) | media | colore del club (barra, riga dell'eroe) o oro (premi); il menu sulla tavola V2 |
| G180-23 | resti V1 — ardesia #0f172a | 412 (partita); tutti | tutti | partita2d-chiuso-412-rosso.png, notifica-412-rosso.png | fondo della colonna di cronaca della partita (`colonna-partita-v2`, #0f172a); tasti «Salta» rgba(15,23,42,0.72) di presentazione/notifica/saga; inchiostro #0f172a sulle card club chiare | bassa | TINTE.bg/inc |
| G180-24 | Formazioni | 412 | rosso | formazioni-412-rosso.png | i nomi sul campo sono in **Arial** (44 nodi), unico carattere fuori dalle tavole (Barlow / Barlow Condensed); «HILL» #dae6da su prato #2f7334 4,49:1 | bassa | `fontFamily` del tema |
| G180-25 | tutte | tutti | tutti | — | raggi in uso: 6 px (364 elementi), 12 (181), 8 (176), 14 (138), 20 (59), 16 (57); le tavole dicono **14–24 px** per i riquadri | bassa | allineare RAD.sm/md dei riquadri-carta a 14–16, tenere 6–8 per pillole e tasti piccoli |
| G180-26 | Home, card «Prossima partita» (dato) | tutti | — | `docs/collaudo-po/179-home-telefono-merseyside.jpg`; codice `src/18-career-app.jsx` r.~7562 | «⚠️ Zona retrocessione» si accende quando è **l'avversario** in zona (`op>=st.length-2`, posizione dell'avversario), ma è scritta senza soggetto e nella foto del PO sta sotto la sua squadra (7ª) | media | «Avversario in zona retrocessione» o etichetta sotto lo scudo avversario |
| G180-27 | partita 2D, striscia alta (dato) | 360, 412, 820, pc | — | ../../sviluppo/foto-giro107/freccia-s412-trasf-1-chiuso.png | al 1'–2' il possesso è «100% · 0%» (misurato in casa e in trasferta) | bassa | mostrare «–» finché non ci sono abbastanza tocchi |

## Coerenza fra schermate (cosa torna)

- **Caratteri**: Barlow e Barlow Condensed su tutte le schermate di carriera e partita (Arial solo nelle formazioni, G180-24; il
  numero di versione in monospace e il logo in corsivo «KWScript» sono voluti).
- **Dati incrociati**: posizione in classifica uguale fra testata («1° posto»), card della prossima partita («1ª in classifica») e
  Classifica; presenze in Nazionale uguali fra riquadro e lista del CT (14); giornata del pre-partita («11 di 34») coerente col
  calendario a 18 squadre.
- **Nessuno** scorrimento orizzontale, elemento fuori schermo, `undefined`/`NaN` o carattere sostitutivo in nessuna delle 334 misure;
  **nessun contenuto coperto** dalla barra in basso a fine scorrimento.

## Partita

_Sezione completata al termine del censimento della partita (vedi sotto)._
