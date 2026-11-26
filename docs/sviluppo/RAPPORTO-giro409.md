# Rapporto giro 409 · PO-675 — «dopo un trasferimento non mi si chiede subito se sto bene»

Base: `lavoro/202` (7.999.216 + giro 401). Ramo di consegna: `sviluppo/giro409-dopo-trasferimento`.
GAME_VERSION e `docs/governo` non toccati.

Parole del PO (26/11): «Dopo che mi sono trasferito in un club, la gente non può chiedermi se sto bene in quel club, è troppo
prematuro». Foto: `docs/collaudo-po/216-cornice-agente.jpg` («Il confronto», «Dimmi sinceramente: sei felice qui?»).

## 1. Censimento: chi chiede il gradimento del club

Ricerca nei testi (`grep` su «felice qui», «ti trovi», «ambientalmente», «stai bene», «contento», «ti piace», «resti/restare qui»,
«futuro qui», domande di presidente/giornalisti/compagni) e nelle condizioni di chi le serve:

| Fonte | Testo | Come veniva servita | Esito del giro |
|---|---|---|---|
| Procuratore, «Il confronto» (src/06 `agentCheckinDue` → src/18 `weeklyEconomyFields`) | «Dimmi sinceramente: sei felice qui?» | cadenza 16-20 settimane dall'**ultimo confronto**, a prescindere dal club | frenata |
| Intervista settimanale (src/07 `INTERVIEW_QS`) | «Come ti trovi a {club}? Ti trovi bene ambientalmente?» | nessuna condizione | frenata (`cond`) |
| Evento settimanale `wi_ex_club` (src/03) | «Ti mancano i vecchi tempi?» → «Sì, ma sono felice qui» | serve un ex club (proprio il caso dopo un trasferimento) | frenato |
| Dialogo del mister (src/03 `COACH_DIALOGUES`) | «Stai valutando altre offerte di mercato?» → «Sono felice qui» | **mai mostrato**: non è `proactive`, e il gioco pesca solo i dialoghi proattivi (src/18) | non toccato (codice morto) |
| Intervista rinnovo (src/07, ctx `contract`) | «Sono felice qui. Se il club vorrà ancora me…» | solo a contratto in scadenza, che dopo una firma non arriva | non toccato |

Presidente, giornalisti di mercato e compagni: nessuna domanda sul gradimento del club trovata.

## 2. Misura prima/dopo (guardiano `dopo-trasferimento-409`, handler veri, salvataggi sintetici)

Tre carriere seedate in stagione 2, con un procuratore che non ti sentiva da mesi (il confronto è già maturo); offerta vera di
`generateTransferOffer` accettata con `acceptTransfer`, poi settimane avanzate col tasto vero (`__CPM_CAREER.step`).
«Prima comparsa» = settimane dall'arrivo / partite giocate col club nuovo.

| Carriera | Prima (rosso `__CPM_NO_G409` = regola spenta) | Dopo |
|---|---|---|
| A · trasferimento d'estate (S2 W2) | confronto **1 sett./0 partite** · intervista 1/0 · evento 1/0 | confronto 11 sett./9 partite · intervista 10/8 · evento 10/8 |
| B · trasferimento d'inverno (S2 W20) | confronto **1 sett./0 partite** · intervista 1/0 · evento 1/0 | confronto 11/9 · intervista 10/8 · evento 10/8 |
| C · nessun trasferimento | confronto 1 settimana | confronto 1 settimana (nessun freno di troppo) |

Verde: exit 0. Rosso: exit 1 (6 problemi, tutti «chiede il gradimento dopo 1 settimane e 0 partite»).
Il confronto arriva una settimana dopo le altre due perché il suo flag si scrive al passaggio di settimana (chokepoint
`weeklyEconomyFields`), le altre due sono condizioni lette al momento.

## 3. La regola (CONSIGLIATA, già applicata)

Nessuna domanda sul gradimento prima di **10 settimane nel club nuovo E 6 partite giocate con lui**; a **16 settimane** si sblocca
comunque. Motivo dei numeri: un girone d'andata ha 13-14 giornate in 19 settimane, quindi 6 partite ≈ metà del girone d'andata;
10 settimane ≈ due mesi e mezzo; 16 settimane = quattro mesi, il minimo della cadenza del confronto (§4 del procuratore,
16-20 settimane), così un infortunio lungo non spegne il procuratore per sempre. Nella misura il vincolo che ha deciso è stato
quello delle settimane (a 10 settimane le partite erano già 8).

Dati: un campo opzionale `clubArrivo409 {id,s,w}` (nessun SAVE bump, additivo). Lo timbra **un solo punto** (useEffect di
`CareerApp` su `club.id`, src/18), quindi vale per ogni percorso che cambia club: offerta accettata, prestito e rientro dal
prestito, passaggio pro. Le partite si contano da `matchHistory` (righe con voto dopo la settimana d'arrivo).
Salvataggi senza timbro: «arrivo sconosciuto» = nessun freno, tranne quando l'ultima riga di `history` è di un altro club della
stagione in corso o della precedente (club cambiato da poco): arrivo a settimana 1, il limite più indulgente.
Cambiando club, un confronto già in sospeso col club di prima decade.

Rosso `window.__CPM_NO_G409`: la regola non frena (comportamento di prima; il timbro si scrive comunque).

## 4. File e funzioni toccate

- `src/06-archetipi-agenti-sponsor.jsx`: nuove `GRAD409`, `_no409`, `arrivoClub409`, `timbroArrivo409`, `gradimento409`,
  `gradimentoOk409`, gancio di sola lettura `window.__CPM_Q409`; `agentCheckinDue` (una riga: niente confronto prima del tempo).
- `src/07-versione-save-interviste.jsx`: `INTERVIEW_QS`, domanda «Come ti trovi a {club}?» (aggiunta `cond`).
- `src/03-eventi-narrativi.jsx`: `WEEKLY_IMPULSES`, evento `wi_ex_club` (condizione).
- `src/18-career-app.jsx`: `CareerApp`, nuovo useEffect del timbro d'arrivo (accanto a quello di `premiPulisci238`).
- `CARRIER-MANAGER-AV.html`: ricomposto con `tools/build-src.mjs`.
- `tests/visual/dopo-trasferimento-409.mjs` (nuovo), `tests/visual/package.json` (script `dopo-trasferimento-409`),
  `tests/visual/ci-runner.mjs` (il guardiano nelle righe della MAPPA esistenti `src/0[0-8]-` e `src/18-|src/10-`).

Fuori ambito: la grafica della finestra del procuratore (giro 408), portiere, tunnel, aspetto 3D.

## 5. Verifiche

- `npm run dopo-trasferimento-409`: verde exit 0, rosso (`CPM_ROSSO=1`) exit 1.
- `npm run mappa-unica`: verde.
- `node tripath-chokepoint-test.mjs`: PASS.
- `node ci-runner.mjs giro dopo-trasferimento-409` (guardiano + 17 sentinelle) e guardiani carriera: esito in §7.

## 6. Dubbi per il PO

1. **Soglia** — (a, CONSIGLIATA, applicata) 10 settimane + 6 partite, sblocco a 16 settimane; (b) solo «metà del girone» in
   settimane (19 settimane dall'arrivo); (c) solo partite (10 partite col club, senza tetto in settimane); (d) fino al mercato
   successivo (il confronto ha senso quando il mercato lo può raccogliere).
2. **Evento «Ti mancano i vecchi tempi?»** — (a, CONSIGLIATA, applicata) frenato come le domande, perché la risposta «Sì, ma sono
   felice qui» è un giudizio sul club nuovo; (b) lasciarlo libero (un ex compagno che scrive subito dopo un trasferimento è
   credibile) togliendo solo quella risposta; (c) farlo arrivare APPOSTA nelle prime settimane con risposte da nuovo arrivato
   («Mi sto ambientando»).
3. **Il dialogo del mister «Stai valutando altre offerte?»** — (a, CONSIGLIATA, applicata) non toccarlo: oggi non compare mai
   (non è proattivo); (b) toglierlo come codice morto; (c) renderlo proattivo con la stessa regola del giro 409.
4. **Salvataggi vecchi senza timbro** — (a, CONSIGLIATA, applicata) nessun freno, salvo club cambiato da poco secondo lo storico
   (arrivo a settimana 1); (b) nessun freno in assoluto; (c) freno pieno dalla settimana di caricamento (troppo severo: blocca
   per 10 settimane chi è nel club da anni).

## 7. Esiti (build 7.999.216 + giro 409)

- `node ci-runner.mjs giro dopo-trasferimento-409`: **18/18 verdi** (dopo-trasferimento-409 68 s · mappa-unica · test:logic ·
  save-compat · replay · migrazione-194 · design-system · tema-unico · griglia-mobile · render-3d-023 · tunnel-285 · home-298 ·
  web-237 · career-critical · battito-264 · partita-vera · gk-dive-sync · schermate-97), nessuna ripetizione.
- Guardiani carriera: `career-invariants` ✅ · `stab-nat-trigger-test` ✅ (la prima corsa era partita senza `CPM_CHROME` ed era
  morta al lancio del browser: rifatta con l'ambiente giusto) · `career-sim-test` ✅ (2 stagioni) · `tripath-chokepoint-test` ✅.
