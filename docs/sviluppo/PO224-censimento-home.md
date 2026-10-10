# PO-224 — Censimento dei riquadri della home (solo misura)

Versione misurata: **7.999.156** (`GAME_VERSION` in `CARRIER-MANAGER-AV.html`). Nessuna modifica al gioco: decide il PO sull'elenco.

## Come è stato misurato

- Sonda: `tests/visual/po224-home-census.mjs` (nuova). Avanza una stagione con gli handler veri
  (`window.__CPM_CAREER.step()`, come `career-sim-test.mjs`), viewport **375×915**.
- Per ogni settimana: misura la dashboard **con la finestra aperta** e poi **a finestra chiusa** (`dismiss()`).
- Conteggio **per settimana distinta**: più passi nella stessa settimana contano una volta.
- «Sopra la piega» = il riquadro sta tutto dentro 915 px; «top» = distanza dall'alto del documento (px).
- Due carriere misurate, **una stagione ciascuna**:
  - **Pro** (`CPM_PRO=1`): stagione completa, chiusa con `seasonEnd` (39 settimane, nessuno stallo).
  - **U18** (default, avvio di gioco): 39 settimane misurate; la stagione **non si chiude** col solo passo del banco
    (`advanced` ripetuto alla settimana 39, interrotto dalla sonda dopo 6 ripetizioni). Il pulsante reale di fine
    stagione U18 non l'ho verificato.
- Dati grezzi: `docs/sviluppo/foto/po224/censimento-pro.json` e `censimento-u18.json`
  (riepilogo testuale: `docs/sviluppo/foto/po224/riepilogo-testi.txt`). Foto: `docs/sviluppo/foto/po224/home-*.png`.
- Log delle corse: `docs/sviluppo/foto/po224-run-pro.txt`, `po224-run-u18.txt`.

## Risposta alla domanda sugli impulsi

**Gli impulsi NON compaiono come riquadro in home.** «Impulso della settimana» compare solo nella **finestra**
(misurato a finestra aperta: 23 settimane in pro, 31 in U18; a finestra chiusa: mai). Il punto di codice che apre
la finestra è `src/18-career-app.jsx` (`apriSettimana`, circa r.1352, e il ramo `isImpulse` nel modale, r.~6218).
Le scelte degli impulsi stanno nel modale stesso (`weekLiveModal.choices`).

## Tabella dei riquadri (pro, 39 settimane · U18 dove diverso)

«Settimane» = in quante settimane distinte il titolo è presente. «Sopra» = settimane in cui è tutto entro 915 px.
«Scelta» = **da verificare** salvo dove indicato (vedi nota sotto la tabella).

| Riquadro | Ambito | Settimane pro / U18 | Sopra la piega (pro) | Top px (pro) | Scelta? | Codice (file:riga) | Se ignorato |
|---|---|---|---|---|---|---|---|
| Impulso della settimana | **finestra** | 23 / 31 | 23 | 312 | sì (modale) | `18-career-app.jsx` `apriSettimana` ~1352 | non verificato |
| Questa settimana | finestra | 7 / 3 | 7 | ~309 | sì (modale) | `18-career-app.jsx` ~6163 | non verificato |
| Scelta · Esordio · Conseguenza · Tensione · Lo spogliatoio · compagno | finestra (sotto-passi impulso) | 1–7 | sì | 333–356 | sì | come sopra | non verificato |
| Il tuo procuratore: boutique o global? | home | 39 | 21 | 638 | **sì** (testo di scelta, pulsanti) | `18-career-app.jsx:7798` | non verificato |
| La tua storia | home | 25 | 25 | 502 | sì (pulsante) | non localizzato per titolo letterale | non verificato |
| «Sono pronto. Da sempre.» · «Ho un po' di paura, mister.» (+ «Rimarrà nella storia») | home | 31 | 31 | 487–602 | **sì** (risposte a scelta) | `18-career-app.jsx:6292` (riga di memoria) | non verificato |
| Patrick Witte ti prende da parte | home | 24 | 24 | 579 | no (testo) | non localizzato per titolo letterale | non verificato |
| LO SPOGLIATOIO · «Il gruppo prima di tutto →» | home | 30 | 30 (11 per la scelta) | 496 / 600 | sì (freccia) | `03-eventi-narrativi.jsx:250` · `18-career-app.jsx:1780` | non verificato |
| Sponsor | home | 33 | 15 | 571 | sì (pulsante) | `18-career-app.jsx:7606` | non verificato |
| L'errore che hanno visto tutti | home | 33 | 6 | 710 | sì (pulsante) | `18-career-app.jsx:2429` | non verificato |
| Il progetto del club | home | 39 | 21 | 504 | sì (pulsante) | `18-career-app.jsx:7589` | non verificato |
| Il mondo fuori | home | 38 | 4 | 786 | sì (pulsante) | `18-career-app.jsx:7849` | non verificato |
| Il posto non te lo regala nessuno | home | 28 | 2 | 886 | sì (pulsante) | `18-career-app.jsx:2434` | non verificato |
| Obiettivi della stagione (+ «Obiettivi personali») | home | 39 | **0** (top 915) | 915 | sì (pulsante) | `18-career-app.jsx:8331` | non verificato |
| Ultime notizie | home | 39 | 0 | 1121 (U18: 678, 11 sett. sopra) | sì (pulsante) | `18-career-app.jsx:8565` | non verificato |
| Notizie della settimana | home | 38 | 0 | 1170 | sì (pulsante) | `18-career-app.jsx:8407` | non verificato |
| Voci di mercato | home | 39 | 0 | 1232 | sì (pulsante) | `18-career-app.jsx:8424` | non verificato |
| Classifica | home | 39 | 0 | 1294 | sì (pulsante) | `18-career-app.jsx:8544` | non verificato |
| Ultima chance U18 · Resta → · Accetta → | home | 1 (solo U18, S1W39) | — | 439–1215 | sì | non localizzato | non verificato |
| 💼 Vai dal procuratore | home | 4 | 4 | 595 | sì | non localizzato | non verificato |
| Mercato Estivo / Invernale aperto | home | 5 / 6 | 1 / 0 | 846 / 1457 | no | non localizzato | non verificato |

Per riferimento (non sono riquadri «da decidere»): «Vivi la Settimana» (38 settimane, sopra la piega, pulsante di apertura),
«Calendario», «PROSSIMA PARTITA», «Sostieni il gioco», «Idee e feedback», la barra di navigazione.

## Cosa è verificato e cosa no

- **Verificato dalla misura:** presenza per settimana, posizione verticale a 375 px, sopra/sotto la piega, impulso
  solo in finestra. Per la carriera pro la stagione è completa; per la U18 fino alla settimana 39.
- **NON verificato:** la colonna «Scelta». Il flag della sonda dice se il *titolo* sta dentro un pulsante, non se il
  riquadro offre scelte; la scelta nella tabella è deducita dal testo (frecce «→», risposte tra virgolette, pulsanti
  presenti). Da confermare leggendo ogni riquadro.
- **NON verificato:** la colonna «Se ignorato» (scade? si perde?). Ho letto solo il dato di scadenza del **contratto**
  (`src/18-career-app.jsx:79-82`, `_contratto49`), che non è un riquadro della home. Per ogni riquadro serve leggere il
  suo gestore di stato: non l'ho fatto.
- **Non localizzati nel codice:** i riquadri senza file:riga (es. «La tua storia», «Patrick Witte ti prende da parte»,
  «UN MOMENTO CHE RICORDERAI»): il titolo non compare come stringa letterale nei frammenti `src/`; è composto altrove.

## Proposte (per decisione del PO, non applicate)

1. **Impulsi:** già in finestra, nessun riquadro «Impulso» in home da spostare. Non so dire da questa misura perché il PO
   li percepisce come riquadri: la misura dice che gli impulsi veri sono in finestra; le voci in home con scelta sono
   quelle del punto 2. Da chiedere al PO quale schermata ha in mente.
2. **Risposte a scelta** («Sono pronto…», «Ho un po' di paura…», «Il gruppo prima di tutto», «Il tuo procuratore»):
   sono le voci che chiedono una scelta **e** stanno in home, 31–39 settimane su 39. Candidate a una finestra dentro
   «Vivi la Settimana»; da decidere dopo aver letto cosa succede se si ignorano.
3. **Notizie** («Ultime notizie», «Notizie della settimana», «Voci di mercato», «Classifica»): informative, senza scelta,
   sotto la piega (top 1121–1294). Candidate a «Novità» o a restare in home.
4. **Storie e dialoghi** («La tua storia», «Patrick Witte ti prende da parte»): senza scelta o con scelta, sopra la piega.
   Da leggere prima di decidere.

Prossimo passo: leggere il gestore di ciascun riquadro della colonna «Scelta»/«Se ignorato» (una sola passata per
riquadro) e, se il PO lo chiede, una sonda che clicca ogni scelta e misura cosa cambia.
