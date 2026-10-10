# Q — Effetti delle scelte degli impulsi settimanali (PO-154, giro 3, zona Q)

**Build:** ramo `poc/marioprada-character-system` (commit `61c4134`), worktree separato `/tmp/cpm157`. **GAME_VERSION verificata: `7.999.157`** (`src/07-versione-save-interviste.jsx:35`). Build: `CPM_FORZA_BUILD=1 node tools/build-src.mjs` → `CARRIER-MANAGER-AV.html` ricomposto da 21 frammenti (56.511 righe), nessuna modifica ai frammenti.
**Varco usato:** `window.__CPM_CAREER.apriImpulso(id)` (`src/18-career-app.jsx:1360`), che restituisce `true` per tutti gli id letti.
**Catalogo:** `WEEKLY_IMPULSES` (`src/03-eventi-narrativi.jsx:332`) = **106 impulsi, 221 scelte** (letti da `window.__CPM_IMPULSES` in pagina, 0 scelte senza `ef`).

## Esito

**Misura: CHIUSA** — tutti i 106 impulsi e tutte e 221 le scelte sono state aperte dal varco, cliccate dall'interfaccia (`button.click()` sul bottone della scelta), con stato letto prima e dopo ogni clic. Nessun errore di pagina, nessuna scelta bloccata, ogni clic applicato **una sola volta** (contatore `__CPM_TAP449`: 221/221 a 1).

**Giro: NON CHIUSO** per due difetti riproducibili, motivo in una riga ciascuno (dettaglio sotto): (1) 5 scelte (6 chiavi) dichiarano statistiche che il gestore non legge; (2) il riquadro «⭐» mostra la popolarità **dichiarata** (+8), non quella **applicata** (+3), in 67 scelte.

## Metodo

- Stato di partenza fisso: salvataggio `cpm-v3` con morale 70, forma 70, fatica 30, fiducia 60, popolarità 50, conto 5.000.000, stagione 3, 0 partite.
- Per ogni scelta: lettura di tutti i campi di `player` da `localStorage["cpm-v3"]` **prima** del clic; clic; attesa 900 ms; lettura **dopo**; testo nuovo comparso nella pagina (riquadri di notifica).
- Aspettativa calcolata per campo: `clamp(prima + dichiarato)` con i limiti del gestore (morale/fatica/fiducia/chimica 0–100, forma 30–95, valore min 0,5, conto min 0); per la **popolarità** la formula reale `popGain` (`src/05-cronaca-stadi-formazioni.jsx:536`), che attenua i guadagni positivi.
- Le pagine sono state condivise a blocchi di ~40 impulsi: lo stato deriva fra un impulso e l'altro. Ogni confronto usa i valori **del momento**, non quelli di partenza; per questo le aspettative tengono conto dei tetti.

## Riepilogo

| Verifica | Esito |
|---|---|
| Scelte aperte / cliccate / chiuse | 221 / 221 / 221 |
| Scelte il cui stato dopo il clic corrisponde all'aspettativa | 216 su 221 |
| Scelte con effetto dichiarato e **nessun effetto osservato** | 0 (per i campi letti) |
| Scelte con effetto dichiarato su statistiche **non lette** dal gestore (nessun effetto osservato) | 5 scelte, 6 chiavi |
| Scelte applicate più di una volta | 0 |
| Scelte con effetto diverso dal dichiarato **nello stato** | 0 dopo l'attenuazione `popGain` (la differenza è voluta, vedi sotto) |
| Scelte in cui il riquadro «⭐» mostra un valore diverso da quello applicato | 67 |

## Rilievo 1 — statistiche dichiarate e non applicate (riproducibile)

Il gestore delle scelte d'impulso `handleImpulseChoice` (`src/18-career-app.jsx:3844-3926`) legge solo: `morale`, `fatigue`, `form`, `popularity`, `coachTrust`, `value`, `bank`, `chem`, `transferListed`, il flag `investment`, e `bond` (solo con un compagno). **Non legge** `tecnica`, `fisico`, `mentalità`, `posizionamento`, che nel catalogo compaiono in 5 scelte:

| Impulso | Scelta | Chiave dichiarata | Osservato |
|---|---|---|---|
| `wi_analisi_video` | 📽️ Lo faccio — ogni dettaglio conta | forma +6, fatica +6, mentalità +1, posizionamento +1 | nessun cambio di alcun campo |
| `wi_campo_bagnato` | ⛈️ All'aperto — il vero campo si gioca in tutte le condizioni | fisico +1, fatica +13, forma +5 | nessun cambio di alcun campo |
| `wi_campo_bagnato` | 🏋️ Al coperto — tecnica e tattica senza rischi | tecnica +1, fatica +7, forma +3 | nessun cambio di alcun campo |
| `wi_derby_semana` | 🎯 Resto concentrato e in silenzio | mentalità +1, forma +4, fatica -3 | nessun cambio di alcun campo |
| `wi_derby_semana` | 😰 Ammetto di essere un po' teso | mentalità +1, fiducia +4, morale -4 | nessun cambio di alcun campo |

Causa: la chiave esiste nel catalogo (`ef:{mentalità:…}` ecc.) ma nessun ramo del gestore la scrive. Il codice `ef.mentalità` non compare in `handleImpulseChoice`. **Riproduzione:** `grep -n "mentalit\|posizionamento\|fisico\|tecnica" src/18-career-app.jsx` non trova nulla nel gestore (3844–3926). Il rimedio è di chi scrive il gioco: o il gestore applica le statistiche, o il catalogo smette di dichiararle.

## Rilievo 2 — il riquadro «⭐» mostra il dichiarato, non l'applicato (riproducibile, visibile al giocatore)

Dopo ogni scelta il gestore compone il riquadro di notifica dai valori **grezzi** del catalogo (`src/18-career-app.jsx:3909-3913`: `bits.push(\`⭐${ef.popularity}\`)`), mentre lo stato usa `popGain(p, ef.popularity)` (`:3883`). Con popolarità 50 e prima stagione il guadagno reale è circa il 40% del dichiarato. Esempio misurato:

- `wi_docufilm` · «🎬 Accetto — mi racconto»: il riquadro dice **⭐+8**, la popolarità passa da 50 a **53** (+3).
- `wi_asta_maglia` · «❤️ Aggiungo gli scarpini autografati»: riquadro **⭐+9**, popolarità **+4**.

In totale **67 scelte** hanno questo scarto. La formula è deliberata (commento a `src/05-cronaca-stadi-formazioni.jsx:533-535`: «freno inizio carriera» e «rendimenti decrescenti»), quindi lo stato è corretto per progetto; è il **riquadro** che promette un guadagno che non arriva. Due riletture oneste: il riquadro mostra sempre il valore del catalogo anche quando l'attenuazione lo riduce a zero o quasi; e l'incoerenza è tutta a carico della popolarità (morale, forma, fatica e fiducia sono applicati senza attenuazione e il riquadro coincide).

## Altri punti di visibilità (non difetti dimostrati)

- Il riquadro di notifica compare solo per morale, forma, fatica, popolarità e fiducia (`:3909-3913`). Chimica di squadra, valore, conto e lista trasferimenti **non** hanno riquadro: il loro effetto si vedrebbe solo nelle schermate di profilo/conto. **Non verificato a schermo** in questo giro.
- Durata del riquadro di notifica: non misurata.

## Limiti dichiarati

- Il varco `apriImpulso` **non applica** le condizioni `cond`, né `once` né `impulseSeen`: questa misura dice cosa fa ogni scelta, **non** quali impulsi escono al giocatore nel gioco normale (quello è il filtro del pool, fuori da questo giro).
- Lo stato dopo il clic è letto da `localStorage` (autosave): corrisponde allo stato React solo se l'autosave è sincrono; il valore è coerente su 221 casi, ma non è una prova formale.
- Visibilità = testo comparso nel DOM dopo il clic. Non è una verifica visiva (nessuno screenshot in questo giro).
- Probe headless, nessun GLB richiesto (la carriera è UI, non render 3D).

## Tabella completa — 221 scelte

Legenda «effetto dichiarato»: valore dal catalogo. «osservato»: valore prima→dopo nello stato; «atteso» indicato solo se diverso. «visibile»: riquadro dopo il clic.

| Impulso | Scelta | Effetto dichiarato | Effetto osservato | Visibile al giocatore |
|---|---|---|---|---|
| `wi_docufilm` | 🎬 Accetto — mi racconto | popolarità +8, fatica +5, fiducia -3 | popolarità 50→53, fatica 30→35, fiducia 60→57 | sì — riquadro in alto dopo il clic |
| `wi_docufilm` | 🚪 No grazie, prima il campo | fiducia +3 | fiducia 57→60 | no — nessun riquadro |
| `wi_asta_maglia` | ❤️ Aggiungo gli scarpini autografati | popolarità +9, morale +5, conto -5000 | popolarità 53→57, morale 70→75, conto 5000000→4995000 | no riquadro · conto/profilo, non verificato |
| `wi_asta_maglia` | 👕 Va bene la maglia | popolarità +3 | popolarità 57→58 | no — nessun riquadro |
| `wi_dieta_ferrea` | 🥗 La seguo alla lettera | forma +5, morale -3 | forma 70→75, morale 75→72 | no — nessun riquadro |
| `wi_dieta_ferrea` | 🍕 Uno sgarro me lo concedo | morale +4, forma -2 | morale 72→76, forma 75→73 | no — nessun riquadro |
| `wi_ex_compagno_cena` | 🍽 Ci vado — l'amicizia viene prima | morale +5, fiducia -3 | morale 76→81, fiducia 60→57 | sì — riquadro in alto dopo il clic |
| `wi_ex_compagno_cena` | 📵 Rimandiamo a dopo la partita | fiducia +3, morale -2 | fiducia 57→60, morale 81→79 | no — nessun riquadro |
| `wi_torneo_padel` | 🎾 Gioco per vincere | chimica +7, fatica +7 | chimica 60→67, fatica 35→42 | no riquadro · conto/profilo, non verificato |
| `wi_torneo_padel` | 🛋 Tifo dal divano | fatica -5, chimica -3 | fatica 42→37, chimica 67→64 | no riquadro · conto/profilo, non verificato |
| `wi_biografia` | 📖 Firmo il contratto | conto +20000, popolarità +6, fiducia -4 | conto 4995000→5015000, popolarità 58→60, fiducia 60→56 | sì — riquadro in alto dopo il clic |
| `wi_biografia` | ⌛ È troppo presto | fiducia +4 | fiducia 56→60 | no — nessun riquadro |
| `wi_murale` | 🎨 Vado di persona | popolarità +8, morale +6, fatica +5 | popolarità 60→63, morale 79→85, fatica 37→42 | sì — riquadro in alto dopo il clic |
| `wi_murale` | 🙏 Ringrazio con un video | popolarità +3 | popolarità 63→64 | sì — riquadro in alto dopo il clic |
| `wi_extra_portieri` | 🥅 Resto e calcio finché fa buio | forma +6, fatica +7, fiducia +4 | forma 73→79, fatica 42→49, fiducia 60→64 | no — nessun riquadro |
| `wi_extra_portieri` | ⏱ Oggi ho già dato tutto | fatica -2 | fatica 49→47 | no — nessun riquadro |
| `wi_influencer` | 📱 Porte aperte | popolarità +10, fiducia -6, fatica +4 | popolarità 64→68, fiducia 64→58, fatica 47→51 | no — nessun riquadro |
| `wi_influencer` | 🚫 Il centro sportivo è sacro | fiducia +4, popolarità -2 | fiducia 58→62, popolarità 68→66 | sì — riquadro in alto dopo il clic |
| `wi_ospedale` | 🏥 Ci vado con i regali | morale +8, popolarità +6, fatica +4 | morale 85→93, popolarità 66→67, fatica 51→55 | no — nessun riquadro |
| `wi_ospedale` | 💸 Dono in silenzio | conto -10000, morale +4 | conto 5015000→5005000, morale 93→97 | sì — riquadro in alto dopo il clic |
| `wi_recupero_hitech` | ❄️ Ci vivo dentro | fatica -8, forma +3, chimica -2 | fatica 55→47, forma 79→82, chimica 64→62 | no riquadro · conto/profilo, non verificato |
| `wi_recupero_hitech` | 👥 Preferisco stare col gruppo | chimica +4 | chimica 62→66 | no riquadro · conto/profilo, non verificato |
| `wi_carita_anonima` | 📰 Che esca pure | popolarità +8, morale -2 | popolarità 67→69, morale 97→95 | no — nessun riquadro |
| `wi_carita_anonima` | 🤫 Resti anonima, o niente | morale +5 | morale 95→100 | sì — riquadro in alto dopo il clic |
| `wi_sponsor_pers` | 💰 Firmo — è il mio momento | conto +35000, popolarità +8, fiducia -6 | conto 5005000→5040000, popolarità 69→71, fiducia 62→56 | sì — riquadro in alto dopo il clic |
| `wi_sponsor_pers` | 🙏 Rifiuto con eleganza | fiducia +6, morale -2 | fiducia 56→62, morale 100→98 | no — nessun riquadro |
| `wi_cena_squadra` | 🍝 Ci vado — il gruppo conta | chimica +8, morale +6, fatica +8 | chimica 66→74, morale 98→100, fatica 47→55 | sì — riquadro in alto dopo il clic |
| `wi_cena_squadra` | 🛌 Salto — devo recuperare | fatica -6, chimica -4 | fatica 55→49, chimica 74→70 | no riquadro · conto/profilo, non verificato |
| `wi_investimento` | 📈 Investo metà del conto | conto -40000, morale +3 | conto 5040000→5000000, morale 100→100 | sì — riquadro in alto dopo il clic |
| `wi_investimento` | 🏦 Tengo i soldi fermi | morale +1 | morale 100→100 | no — nessun riquadro |
| `wi_beneficenza` | ❤️ Lo pago io | conto -25000, popolarità +12, morale +8 | conto 5000000→4975000, popolarità 71→74, morale 100→100 | sì — riquadro in alto dopo il clic |
| `wi_beneficenza` | 🤝 Partecipo solo all'evento | popolarità +4 | popolarità 74→75 | no — nessun riquadro |
| `wi_procuratore_push` | 📰 Dagli il via libera | valore 0.25, popolarità +6, fiducia -8 | valore 19.76→20.01, popolarità 75→76, fiducia 62→54 | sì — riquadro in alto dopo il clic |
| `wi_procuratore_push` | ✋ Fermalo — non è il momento | fiducia +4 | fiducia 54→58 | no — nessun riquadro |
| `wi_giovane_aiuto` | 🎓 Resto un'ora con lui | chimica +6, fiducia +5, fatica +6 | chimica 70→76, fiducia 58→63, fatica 49→55 | no riquadro · conto/profilo, non verificato |
| `wi_giovane_aiuto` | ⏱ Non oggi | fatica -2, chimica -2 | fatica 55→53, chimica 76→74 | no riquadro · conto/profilo, non verificato |
| `wi_intervista_scomoda` | 🔥 Dico quello che penso | popolarità +9, fiducia -10, morale +4 | popolarità 76→78, fiducia 63→53, morale 100→100 | sì — riquadro in alto dopo il clic |
| `wi_intervista_scomoda` | 🧊 Glissa con diplomazia | fiducia +5, popolarità -2 | fiducia 53→58, popolarità 78→76 | sì — riquadro in alto dopo il clic |
| `wi_personal_chef` | 🥗 Lo assumo | conto -15000, fatica -10, forma +3 | conto 4975000→4960000, fatica 53→43, forma 82→85 | no riquadro · conto/profilo, non verificato |
| `wi_personal_chef` | 🍕 Sto bene così | — | nessun cambio | no — nessun riquadro |
| `wi_famiglia_visita` | 👨‍👩‍👦 Li ospito — le radici contano | morale +12, fatica +6 | morale 100→100, fatica 43→49 | no — nessun riquadro |
| `wi_famiglia_visita` | 📅 Rimandiamo di un mese | morale -4, fatica -3 | morale 100→96, fatica 49→46 | no — nessun riquadro |
| `wi_scommessa_social` | 😂 Ci sto — ridiamoci su | conto +18000, popolarità +10, fiducia -3 | conto 4960000→4978000, popolarità 76→78, fiducia 58→55 | no riquadro · conto/profilo, non verificato |
| `wi_scommessa_social` | 🚫 Preferisco il basso profilo | fiducia +2 | fiducia 55→57 | sì — riquadro in alto dopo il clic |
| `wi_compagno_lite` | 🕊 Faccio da paciere stasera | chimica +10, fiducia +6, fatica +5 | chimica 74→84, fiducia 57→63, fatica 46→51 | no riquadro · conto/profilo, non verificato |
| `wi_compagno_lite` | 🙈 Non mi immischio | chimica -5 | chimica 84→79 | no riquadro · conto/profilo, non verificato |
| `wi_es_busta` | 📸 Foto alla busta, dritta in famiglia | morale +6 | morale 96→100 | no — nessun riquadro |
| `wi_es_busta` | 🏦 Da parte, testa bassa: è solo l'inizio | morale +3, forma +2 | morale 100→100, forma 85→87 | sì — riquadro in alto dopo il clic |
| `wi_es_canzone` | 🎤 Salgo e canto: playlist della nonna, senza vergogna | morale +7, chimica +6 | morale 100→100, chimica 79→85 | no riquadro · conto/profilo, non verificato |
| `wi_es_canzone` | 🙈 Stono apposta per farla finire prima | chimica +3, morale +3 | chimica 85→88, morale 100→100 | sì — riquadro in alto dopo il clic |
| `wi_es_autografo` | 😂 Firmo con dedica: «Al mio primo tifoso per sbaglio» | morale +6, popolarità +2 | morale 100→100, popolarità 78→79 | no — nessun riquadro |
| `wi_es_autografo` | 😤 Un giorno la fila la farà per me | forma +2, morale +2 | forma 87→89, morale 100→100 | no — nessun riquadro |
| `wi_es_bar` | 🥹 Passo a firmare la cornice di persona | popolarità +4, morale +5 | popolarità 79→80, morale 100→100 | sì — riquadro in alto dopo il clic |
| `wi_es_bar` | ☕ Caffè pagato per tutti, una volta sola | popolarità +5, conto -1500, morale +3 | popolarità 80→81, conto 4978000→4976500, morale 100→100 | no riquadro · conto/profilo, non verificato |
| `wi_es_prof` | 📚 Studio nei ritiri — promesso davvero | morale +4, fatica +2 | morale 100→100, fatica 51→53 | sì — riquadro in alto dopo il clic |
| `wi_es_prof` | ⚽ Il campo è la mia scuola adesso, prof | forma +3, morale +2 | forma 89→92, morale 100→100 | no — nessun riquadro |
| `wi_es_muretto` | ⚽ Glielo lascio: è cominciato tutto lì | morale +6, popolarità +3 | morale 100→100, popolarità 81→82 | no — nessun riquadro |
| `wi_es_muretto` | 🛒 Ne porto uno NUOVO per tutti, domani | conto -1000, popolarità +5, morale +4 | conto 4976500→4975500, popolarità 82→83, morale 100→100 | no riquadro · conto/profilo, non verificato |
| `wi_pro_firma` | ✒️ Gliela chiedo in regalo: va in cornice | morale +6 | morale 100→100 | sì — riquadro in alto dopo il clic |
| `wi_pro_firma` | 🧊 Conta la firma, non la penna | forma +2, morale +3 | forma 92→94, morale 100→100 | no — nessun riquadro |
| `wi_pro_armadietto` | 🥹 Resta attaccato lì per tutta la mia carriera | morale +7 | morale 100→100 | sì — riquadro in alto dopo il clic |
| `wi_pro_armadietto` | 🖼️ Lo faccio incorniciare per il museo del club | popolarità +4, chimica +3 | popolarità 83→84, chimica 88→91 | no riquadro · conto/profilo, non verificato |
| `wi_pro_procuratore` | 🧊 Non ora: al primo anno parla il campo | fiducia +4, morale +2 | fiducia 63→67, morale 100→100 | sì — riquadro in alto dopo il clic |
| `wi_pro_procuratore` | 📇 Prendo il biglietto — mai dire mai | popolarità +2 | popolarità 84→85 | no — nessun riquadro |
| `wi_pro_store` | 🛍️ Due: una per me e una per mamma | conto -3000, morale +7 | conto 4975500→4972500, morale 100→100 | sì — riquadro in alto dopo il clic |
| `wi_pro_store` | 😎 Chiedo al commesso se vende: «benino», dice | popolarità +3, morale +4 | popolarità 85→86, morale 100→100 | no — nessun riquadro |
| `wi_pro_regola` | 🥐 Giovedì: cornetti per tutti, anche il mister | chimica +7, morale +3, conto -500 | chimica 91→98, morale 100→100, conto 4972500→4972000 | no riquadro · conto/profilo, non verificato |
| `wi_pro_regola` | 📓 Prendo appunti. Letteralmente. | morale +4, fiducia +3 | morale 100→100, fiducia 67→70 | no — nessun riquadro |
| `wi_pro_battesimo` | 😂 Rido più forte di loro: adesso sono dentro | chimica +8, morale +5 | chimica 98→100, morale 100→100 | no riquadro · conto/profilo, non verificato |
| `wi_pro_battesimo` | 🧊 Recupero tutto in silenzio. Domani mi vendico. | chimica +4, forma +2 | chimica 100→100, forma 94→95 | sì — riquadro in alto dopo il clic |
| `wi_addio_maglia_gk` | 😄 Gliela prometto — e gli firmo anche i guanti | morale +5, popolarità +4 | morale 100→100, popolarità 86→87 | no — nessun riquadro |
| `wi_addio_maglia_gk` | 🧊 Dopo la partita, come si è sempre fatto | forma +2, morale +2 | forma 95→95, morale 100→100 | no — nessun riquadro |
| `wi_addio_cambio` | 👏 Accetto: quell'applauso vale una carriera | morale +8, fiducia +4, fatica -3 | morale 100→100, fiducia 70→74, fatica 53→50 | no — nessun riquadro |
| `wi_addio_cambio` | ⚔️ Voglio i novanta minuti: mi salutano al fischio finale | forma +4, fiducia -2, morale +3 | forma 95→95, fiducia 74→72, morale 100→100 | no — nessun riquadro |
| `wi_addio_scarpini` | 🥹 Autorizzato — e la teca la firmiamo insieme | morale +6, chimica +4 | morale 100→100, chimica 100→100 | no riquadro · conto/profilo, non verificato |
| `wi_addio_scarpini` | 😅 Solo se ci mette anche quelli della papera col Rovigo | morale +5, popolarità +3 | morale 100→100, popolarità 87→88 | sì — riquadro in alto dopo il clic |
| `wi_addio_docu` | 🎬 Che sia un bel finale | popolarità +9, conto +40000, fatica +4 | popolarità 88→89, conto 4972000→5012000, fatica 50→54 | no riquadro · conto/profilo, non verificato |
| `wi_addio_docu` | 🚪 L'ultima è mia: niente telecamere nello spogliatoio | morale +5, chimica +3 | morale 100→100, chimica 100→100 | sì — riquadro in alto dopo il clic |
| `wi_addio_capitani` | 🥂 Rispondo a tutti, uno per uno | morale +7, popolarità +5 | morale 100→100, popolarità 89→90 | sì — riquadro in alto dopo il clic |
| `wi_addio_capitani` | 🤫 Lo riguardo da solo. Dieci volte. | morale +9 | morale 100→100 | no — nessun riquadro |
| `wi_addio_bimbi` | ⚽ Un pomeriggio intero, palloni per tutti | morale +8, popolarità +6, fatica +3 | morale 70→78, popolarità 50→52, fatica 30→33 | sì — riquadro in alto dopo il clic |
| `wi_addio_bimbi` | 📅 Dopo il ritiro avremo tutto il tempo — promesso | morale +2 | morale 78→80 | no — nessun riquadro |
| `wi_orologio` | ⌚ Lo compro — rito di passaggio | conto -30000, chimica +7, morale +4 | conto 5000000→4970000, chimica 60→67, morale 80→84 | no riquadro · conto/profilo, non verificato |
| `wi_orologio` | 💸 Follia — passo | chimica -3, morale +1 | chimica 67→64, morale 84→85 | no riquadro · conto/profilo, non verificato |
| `wi_amichevole` | ✅ Ci vado — voglio farmi vedere | popolarità +12, fatica +14, forma +3 | popolarità 52→57, fatica 33→47, forma 70→73 | sì — riquadro in alto dopo il clic |
| `wi_amichevole` | ❌ Rimango a riposare | fatica -10, morale +5 | fatica 47→37, morale 85→90 | no — nessun riquadro |
| `wi_media` | 📺 Accetto — è riconoscimento | popolarità +14, valore 0.08, fatica +5 | popolarità 57→63, valore 19.76→19.84, fatica 37→42 | no riquadro · conto/profilo, non verificato |
| `wi_media` | ⚽ No, preferisco allenarmi | forma +4, fiducia +3 | forma 73→77, fiducia 60→63 | no — nessun riquadro |
| `wi_ciclo_forza` | 💪 Ciclo completo — massimo impegno | fatica +15, forma +7 | fatica 42→57, forma 77→84 | no — nessun riquadro |
| `wi_ciclo_forza` | 🧘 Solo sessione leggera | fatica +4, forma +2, morale +3 | fatica 57→61, forma 84→86, morale 90→93 | no — nessun riquadro |
| `wi_riposo` | 🏋️ Mi alleno da solo — non mi fermo mai | forma +6, fatica +8, fiducia +3 | forma 86→92, fatica 61→69, fiducia 63→66 | sì — riquadro in alto dopo il clic |
| `wi_riposo` | 🌴 Mi riposo davvero | fatica -18, morale +10 | fatica 69→51, morale 93→100 | no — nessun riquadro |
| `wi_tensione_spo` | 🤝 Mediate tra i due | fiducia +8, morale +5, popolarità +5 | fiducia 66→74, morale 100→100, popolarità 63→65 | sì — riquadro in alto dopo il clic |
| `wi_tensione_spo` | 😶 Non ti impicci | morale -3 | morale 100→97 | sì — riquadro in alto dopo il clic |
| `wi_tensione_spo` | 🗣️ Segnali la cosa al mister | fiducia +6, morale -4 | fiducia 74→80, morale 97→93 | no — nessun riquadro |
| `wi_fan_aggression` | 😤 Rispondi a tono | morale +5, popolarità -8 | morale 93→98, popolarità 65→57 | sì — riquadro in alto dopo il clic |
| `wi_fan_aggression` | 🙏 «Scusi, farò meglio» | popolarità +6, morale -3 | popolarità 57→59, morale 98→95 | no — nessun riquadro |
| `wi_fan_aggression` | 🚶 Vai avanti senza rispondere | morale +2 | morale 95→97 | sì — riquadro in alto dopo il clic |
| `wi_procuratore` | ⏳ Aspettiamo — la pazienza paga | morale +4 | morale 97→100 | no — nessun riquadro |
| `wi_procuratore` | 📢 No, voglio muovermi ora — mettimi in lista | popolarità +4, fiducia -5, morale -4, in lista trasferimenti | popolarità 59→61, fiducia 80→75, morale 100→96, in lista | sì — riquadro in alto dopo il clic |
| `wi_giovane` | ✅ Certo — è bello trasmettere | morale +8, fiducia +5, popolarità +4 | morale 96→100, fiducia 75→80, popolarità 61→63 | no — nessun riquadro |
| `wi_giovane` | ❌ Non ho tempo per questo | morale -2 | morale 100→98 | sì — riquadro in alto dopo il clic |
| `wi_intervista_sorpresa` | 🔥 Dico tutto — la verità libera | popolarità +14, fiducia -6, morale +5 | popolarità 63→69, fiducia 80→74, morale 98→100 | no — nessun riquadro |
| `wi_intervista_sorpresa` | 🤝 Rispondo con diplomazia | popolarità +6, fiducia +3 | popolarità 69→70, fiducia 74→77 | sì — riquadro in alto dopo il clic |
| `wi_intervista_sorpresa` | ❌ Declino | popolarità -3, morale +3 | popolarità 70→67, morale 100→100 | no — nessun riquadro |
| `wi_social` | 🗑️ Cancello e mi scuso | popolarità -4, morale -3 | popolarità 67→63, morale 100→97 | sì — riquadro in alto dopo il clic |
| `wi_social` | 😏 Lascio stare — era ironico | popolarità +6, fiducia -4 | popolarità 63→65, fiducia 77→73 | sì — riquadro in alto dopo il clic |
| `wi_social` | 📝 Chiarisco con un comunicato | popolarità +2, morale +4 | popolarità 65→66, morale 97→100 | no — nessun riquadro |
| `wi_viaggio` | 🎮 Ti rilassi con i compagni | morale +9, fatica -6 | morale 100→100, fatica 51→45 | no — nessun riquadro |
| `wi_viaggio` | 📊 Studi il video dell'avversario | forma +5, fiducia +4 | forma 92→95, fiducia 73→77 | no — nessun riquadro |
| `wi_viaggio` | 🏃 Fai un allenamento extra in palestra | forma +4, fatica +6 | forma 95→95, fatica 45→51 | sì — riquadro in alto dopo il clic |
| `wi_sogno` | 🔥 Cavalco l'onda — oggi è un gran giorno | morale +10, forma +5 | morale 100→100, forma 95→95 | no — nessun riquadro |
| `wi_sogno` | 😐 Era solo un sogno. Al lavoro. | forma +2, fatica -4 | forma 95→95, fatica 51→47 | sì — riquadro in alto dopo il clic |
| `wi_ex_club` | ❤️ «Sì, ma sono felice qui» | morale +8 | morale 100→100 | no — nessun riquadro |
| `wi_ex_club` | 😐 «È il calcio. Si va avanti» | morale +3 | morale 100→100 | sì — riquadro in alto dopo il clic |
| `wi_ex_club` | 😔 «Onestamente, un po' sì» | morale -4, popolarità +3 | morale 100→96, popolarità 66→67 | no — nessun riquadro |
| `wi_staff` | 🧪 Lo provo — sono curioso | fatica -14, forma +4 | fatica 47→33, forma 95→95 | sì — riquadro in alto dopo il clic |
| `wi_staff` | 😐 Resto al metodo classico | fatica -6 | fatica 33→27 | sì — riquadro in alto dopo il clic |
| `wi_capitano_sfida` | 🎯 Accetto — e do il massimo | forma +6, popolarità +7, fiducia +3 | forma 95→95, popolarità 67→69, fiducia 77→80 | no — nessun riquadro |
| `wi_capitano_sfida` | 🚶 Non mi interessa | forma +1, morale -3 | forma 95→95, morale 96→93 | sì — riquadro in alto dopo il clic |
| `wi_insonnia` | 📱 Guardi video motivazionali fino all'alba | morale +6, fatica +10 | morale 93→99, fatica 27→37 | no — nessun riquadro |
| `wi_insonnia` | 🧘 Rispiri, lasci andare, dormi | morale +4, fatica -5, forma +3 | morale 99→100, fatica 37→32, forma 95→95 | sì — riquadro in alto dopo il clic |
| `wi_tifosi` | 📸 Mi fermo 20 minuti con loro | popolarità +12, morale +7, fatica +4 | popolarità 69→72, morale 100→100, fatica 32→36 | no — nessun riquadro |
| `wi_tifosi` | 🚗 Sorrido e saluto di corsa | popolarità +4, morale +3 | popolarità 72→73, morale 100→100 | sì — riquadro in alto dopo il clic |
| `wi_sponsor` | ✅ Firmo — è riconoscimento | popolarità +9, valore 0.05, morale +5 | popolarità 73→75, valore 19.84→19.89, morale 100→100 | no riquadro · conto/profilo, non verificato |
| `wi_sponsor` | ⏳ Aspetto qualcosa di più grande | morale +2 | morale 100→100 | sì — riquadro in alto dopo il clic |
| `wi_polemica` | 💪 La prendo come motivazione | morale +5, forma +4 | morale 100→100, forma 95→95 | no — nessun riquadro |
| `wi_polemica` | 😤 Mi incazzo — e si vede | morale -4, popolarità -6, fiducia -3 | morale 100→96, popolarità 75→69, fiducia 80→77 | sì — riquadro in alto dopo il clic |
| `wi_polemica` | 😶 Silenzio stampa totale | popolarità -3, morale +2 | popolarità 69→66, morale 96→98 | no — nessun riquadro |
| `wi_ct_radar` | 🔥 Mi supero — voglio essere visto | forma +8, fiducia +4, fatica +6 | forma 95→95, fiducia 77→81, fatica 36→42 | sì — riquadro in alto dopo il clic |
| `wi_ct_radar` | 😐 Mi alleno normalmente | forma +2 | forma 95→95 | no — nessun riquadro |
| `wi_giornalista_mercato` | 🤐 Resto focalizzato sulla squadra | fiducia +6, popolarità +3, morale +2 | fiducia 81→87, popolarità 66→67, morale 98→100 | sì — riquadro in alto dopo il clic |
| `wi_giornalista_mercato` | 📢 Ammetto che ci sto pensando | fiducia -8, popolarità +7, morale -4 | fiducia 87→79, popolarità 67→69, morale 100→96 | no — nessun riquadro |
| `wi_giornalista_mercato` | 😏 Dico che decido a fine stagione | fiducia -2, popolarità +4 | fiducia 79→77, popolarità 69→70 | no — nessun riquadro |
| `wi_vice_infortunato` | 💪 Prendo le responsabilità — sono pronto | fiducia +10, morale +6, fatica +5, forma +4 | fiducia 77→87, morale 96→100, fatica 42→47, forma 95→95 | sì — riquadro in alto dopo il clic |
| `wi_vice_infortunato` | 😐 Faccio il mio — nient'altro | fiducia +2, morale +2 | fiducia 87→89, morale 100→100 | no — nessun riquadro |
| `wi_prestito_inverno` | ✅ Vado — ho bisogno di giocare | forma +8, morale +9, fiducia -5, valore 0.06 | forma 95→95, morale 100→100, fiducia 89→84, valore 19.89→19.95 | sì — riquadro in alto dopo il clic |
| `wi_prestito_inverno` | ❌ Resto e mi batto qui | fiducia +5, morale +4, fatica +5 | fiducia 84→89, morale 100→100, fatica 47→52 | no — nessun riquadro |
| `wi_nazionale_b` | 🌍 Vado — mi metto in mostra | popolarità +12, forma +6, morale +10, fatica +8 | popolarità 70→73, forma 95→95, morale 100→100, fatica 52→60 | sì — riquadro in alto dopo il clic |
| `wi_nazionale_b` | 🏠 Resto con il club — è un momento delicato | fiducia +8, morale +3, forma +3 | fiducia 89→97, morale 100→100, forma 95→95 | no — nessun riquadro |
| `wi_podcast` | 🎙️ Accetto — voglio raccontarmi | popolarità +14, morale +7, valore 0.08 | popolarità 73→76, morale 100→100, valore 19.95→20.03 | sì — riquadro in alto dopo il clic |
| `wi_podcast` | 😶 Sono riservato — preferisco il campo | morale +4, fiducia +3 | morale 100→100, fiducia 97→100 | no — nessun riquadro |
| `wi_donazione` | 💖 Lo faccio — sport e solidarietà | popolarità +10, morale +9, fatica +7 | popolarità 76→78, morale 100→100, fatica 60→67 | sì — riquadro in alto dopo il clic |
| `wi_donazione` | 🏃 Passo — ho bisogno di recuperare | fatica -8, morale +3 | fatica 67→59, morale 100→100 | no — nessun riquadro |
| `wi_fan_speciale` | 💛 Mi fermo, parlo con lui, selfie e firma | morale +14, popolarità +8, valore 0.03 | morale 100→100, popolarità 78→80, valore 20.03→20.06 | sì — riquadro in alto dopo il clic |
| `wi_fan_speciale` | 😔 Sono di fretta — un sorriso e via | morale +3 | morale 100→100 | no — nessun riquadro |
| `wi_analisi_video` | 📽️ Lo faccio — ogni dettaglio conta | forma +6, fatica +6, mentalità +1, posizionamento +1 | nessun cambio (la chiave non è letta) | no — nessun riquadro, nessuna stat cambia |
| `wi_analisi_video` | 😪 Ho già troppe cose in testa | morale +4, fatica -5 | morale 100→100, fatica 65→60 | sì — riquadro in alto dopo il clic |
| `wi_crioterapia` | 🧊 Ci provo — tutto per la forma | fatica -16, forma +6, morale +3 | fatica 60→44, forma 95→95, morale 100→100 | no — nessun riquadro |
| `wi_crioterapia` | 🚿 Preferisco la doccia calda normale | fatica -7, morale +5 | fatica 44→37, morale 100→100 | sì — riquadro in alto dopo il clic |
| `wi_veterano_allenamento` | 💪 Accetto subito — esperienza preziosa | forma +7, fiducia +5, morale +7, fatica +6 | forma 95→95, fiducia 100→100, morale 100→100, fatica 37→43 | no — nessun riquadro |
| `wi_veterano_allenamento` | 😐 Ho già il mio programma | morale +2 | morale 100→100 | sì — riquadro in alto dopo il clic |
| `wi_cena_capitano` | 🍽️ Ci sono — la squadra prima di tutto | morale +9, fiducia +5, fatica +4 | morale 100→100, fiducia 100→100, fatica 43→47 | no — nessun riquadro |
| `wi_cena_capitano` | 🏠 Resto a casa — ho bisogno di riposare | fatica -8, morale +3 | fatica 47→39, morale 100→100 | sì — riquadro in alto dopo il clic |
| `wi_giovani_accademia` | 👶 Vado — è un gesto che vale | popolarità +9, morale +11, valore 0.05 | popolarità 80→81, morale 100→100, valore 20.06→20.11 | no riquadro · conto/profilo, non verificato |
| `wi_giovani_accademia` | 😐 Non è il momento giusto per me | morale +2 | morale 100→100 | sì — riquadro in alto dopo il clic |
| `wi_campo_bagnato` | ⛈️ All'aperto — il vero campo si gioca in tutte le condizioni | fisico +1, fatica +13, forma +5 | nessun cambio (la chiave non è letta) | no — nessun riquadro, nessuna stat cambia |
| `wi_campo_bagnato` | 🏋️ Al coperto — tecnica e tattica senza rischi | tecnica +1, fatica +7, forma +3 | nessun cambio (la chiave non è letta) | sì — riquadro in alto dopo il clic |
| `wi_sponsor_auto` | 🚗 Firmo — è un bel riconoscimento | popolarità +8, valore 0.08, morale +7 | popolarità 81→82, valore 20.11→20.19, morale 100→100 | no riquadro · conto/profilo, non verificato |
| `wi_sponsor_auto` | 🤝 Passo — voglio restare autentico | morale +5, fiducia +3 | morale 100→100, fiducia 100→100 | sì — riquadro in alto dopo il clic |
| `wi_derby_semana` | 🔥 Mi carico — per questi momenti esisto | forma +8, morale +9, fatica +5 | forma 95→95, morale 100→100, fatica 59→64 | sì — riquadro in alto dopo il clic |
| `wi_derby_semana` | 🎯 Resto concentrato e in silenzio | mentalità +1, forma +4, fatica -3 | nessun cambio (la chiave non è letta) | no — nessun riquadro, nessuna stat cambia |
| `wi_derby_semana` | 😰 Ammetto di essere un po' teso | mentalità +1, fiducia +4, morale -4 | nessun cambio (la chiave non è letta) | no — nessun riquadro, nessuna stat cambia |
| `wi_figlia_mister` | 😊 «È un onore. Gli sarò sempre grato.» | fiducia +9, morale +8 | fiducia 100→100, morale 96→100 | no — nessun riquadro |
| `wi_figlia_mister` | 😅 Ridi imbarazzato e cambi argomento | morale +4 | morale 100→100 | sì — riquadro in alto dopo il clic |
| `wi_auto_lusso` | 🚗 Accetto — che spettacolo | popolarità +6, morale +4, fiducia -3 | popolarità 82→83, morale 100→100, fiducia 100→97 | no — nessun riquadro |
| `wi_auto_lusso` | 🚙 Tengo la mia, niente distrazioni | fiducia +4, morale -1 | fiducia 97→100, morale 100→99 | sì — riquadro in alto dopo il clic |
| `wi_polemica_social` | 🔥 Rispondo per le rime | popolarità +5, morale -3, fiducia -4 | popolarità 83→84, morale 99→96, fiducia 100→96 | no — nessun riquadro |
| `wi_polemica_social` | 🤐 Ignoro, parlerò in campo | fiducia +4, morale +2 | fiducia 96→100, morale 96→98 | sì — riquadro in alto dopo il clic |
| `wi_scuola_calcio` | ⚽ Ci metto faccia e soldi | conto -30000, popolarità +9, morale +6 | conto 5000000→4970000, popolarità 50→54, morale 70→76 | sì — riquadro in alto dopo il clic |
| `wi_scuola_calcio` | 🤝 Presto solo il nome | popolarità +3, conto +6000 | popolarità 54→55, conto 4970000→4976000 | no riquadro · conto/profilo, non verificato |
| `wi_giornata_libera` | 🏖 Mare col gruppo | chimica +7, morale +6, fatica +3 | chimica 60→67, morale 76→82, fatica 30→33 | no riquadro · conto/profilo, non verificato |
| `wi_giornata_libera` | 🏋️ Palestra e focus | forma +5, fatica +5, chimica -2 | forma 70→75, fatica 33→38, chimica 67→65 | no riquadro · conto/profilo, non verificato |
| `wi_videogioco` | 🎮 Firmo — sarò un personaggio | conto +25000, popolarità +8 | conto 4976000→5001000, popolarità 55→58 | no riquadro · conto/profilo, non verificato |
| `wi_videogioco` | 🕹 Chiedo troppo, salta tutto | morale -2 | morale 82→80 | no — nessun riquadro |
| `wi_genitori_tribuna` | ✈️ Li porto in tribuna d'onore | conto -6000, morale +9 | conto 5001000→4995000, morale 80→89 | sì — riquadro in alto dopo il clic |
| `wi_genitori_tribuna` | 📞 Li sento al telefono, ora no | morale +2, fatica -2 | morale 89→91, fatica 38→36 | no — nessun riquadro |
| `wi_infortunato_posto` | 🤝 Parlo col mister: se lo merita | chimica +6, fiducia -2 | chimica 65→71, fiducia 60→58 | sì — riquadro in alto dopo il clic |
| `wi_infortunato_posto` | 😤 Il posto se lo riprende in campo | fiducia +4, chimica -5 | fiducia 58→62, chimica 71→66 | no riquadro · conto/profilo, non verificato |
| `wi_tv_primaserata` | 📺 Ci vado — occasione unica | popolarità +9, fatica +4, forma -2 | popolarità 58→62, fatica 36→40, forma 75→73 | no — nessun riquadro |
| `wi_tv_primaserata` | 🛌 Prima la partita, sempre | fiducia +4, popolarità -2 | fiducia 62→66, popolarità 62→60 | no — nessun riquadro |
| `wi_cripto` | 🚀 Ci punto una fetta | conto -20000, morale +2 | conto 4995000→4975000, morale 91→93 | sì — riquadro in alto dopo il clic |
| `wi_cripto` | 🧊 Non è roba per me | morale +1 | morale 93→94 | no — nessun riquadro |
| `wi_bimbo_sogno` | 💙 Lo invito all'allenamento | morale +9, popolarità +5, fatica +2 | morale 94→100, popolarità 60→62, fatica 40→42 | no — nessun riquadro |
| `wi_bimbo_sogno` | 🎁 Gli mando maglia e videomessaggio | morale +4, conto -2000 | morale 100→100, conto 4975000→4973000 | no riquadro · conto/profilo, non verificato |
| `wi_mental_coach` | 🧘 Ci provo — testa libera | morale +6, forma +3, fatica -3 | morale 100→100, forma 73→76, fatica 42→39 | no — nessun riquadro |
| `wi_mental_coach` | ⚽ Preferisco il campo | forma +2 | forma 76→78 | sì — riquadro in alto dopo il clic |
| `wi_orologi_squadra` | ⌚ Li prendo per tutti | conto -22000, chimica +10, morale +3 | conto 4973000→4951000, chimica 66→76, morale 100→100 | no riquadro · conto/profilo, non verificato |
| `wi_orologi_squadra` | 🍻 Basta una cena insieme | conto -4000, chimica +4 | conto 4951000→4947000, chimica 76→80 | no riquadro · conto/profilo, non verificato |
| `wi_opinionista` | 🔥 Rispondo in conferenza | popolarità +3, fiducia -4, morale -2 | popolarità 62→63, fiducia 66→62, morale 100→98 | no — nessun riquadro |
| `wi_opinionista` | 💪 Uso la rabbia in campo | forma +4, morale +3 | forma 78→82, morale 98→100 | sì — riquadro in alto dopo il clic |
| `wi_bonus_gol_social` | 💸 Ci sto | conto +8000, popolarità +4, fiducia -2 | conto 4947000→4955000, popolarità 63→65, fiducia 62→60 | no riquadro · conto/profilo, non verificato |
| `wi_bonus_gol_social` | 🚫 Niente vetrine sui social | fiducia +3 | fiducia 60→63 | sì — riquadro in alto dopo il clic |
| `wi_casa_citta` | 🏠 Compro — è casa mia | conto -45000, morale +6, popolarità +4 | conto 4955000→4910000, morale 100→100, popolarità 65→66 | no riquadro · conto/profilo, non verificato |
| `wi_casa_citta` | 🔑 Resto in affitto, più libero | morale +1 | morale 100→100 | sì — riquadro in alto dopo il clic |
| `wi_primo_mister` | 🎓 Ci vado di persona | morale +7, fatica +4, chimica +2 | morale 100→100, fatica 39→43, chimica 80→82 | sì — riquadro in alto dopo il clic |
| `wi_primo_mister` | 💌 Mando due parole di stima | morale +2 | morale 100→100 | no — nessun riquadro |
| `wi_tifoso_fisso` | 🤝 Gli dedico cinque minuti | popolarità +5, morale +2, fatica +1 | popolarità 66→67, morale 100→100, fatica 43→44 | sì — riquadro in alto dopo il clic |
| `wi_tifoso_fisso` | 🚗 Passo dritto, ho fretta | morale -1, popolarità -2 | morale 100→99, popolarità 67→65 | no — nessun riquadro |
| `wi_esports` | 🎮 Divento ambassador | conto +18000, popolarità +7 | conto 4910000→4928000, popolarità 65→67 | no riquadro · conto/profilo, non verificato |
| `wi_esports` | 🧢 Non fa per me | morale +1 | morale 99→100 | no — nessun riquadro |
| `wi_compagno_prestito` | 🤝 Lo aiuto, senza dirlo a nessuno | conto -15000, chimica +9, morale +4 | conto 4928000→4913000, chimica 82→91, morale 100→100 | sì — riquadro in alto dopo il clic |
| `wi_compagno_prestito` | 💬 Gli trovo un consulente serio | chimica +3 | chimica 91→94 | no riquadro · conto/profilo, non verificato |
| `wi_pioggia_scelta` | 🌧 Esco a lavorare duro | forma +5, fatica +6, fiducia +4 | forma 82→87, fatica 44→50, fiducia 63→67 | sì — riquadro in alto dopo il clic |
| `wi_pioggia_scelta` | 🏋️ Palestra, niente rischi | fatica +2, forma +2 | fatica 50→52, forma 87→89 | no — nessun riquadro |
| `wi_scommessa_amici` | 🚫 Rifiuto netto — è la regola | morale +3, fiducia +3 | morale 100→100, fiducia 67→70 | sì — riquadro in alto dopo il clic |
| `wi_scommessa_amici` | 🤫 Solo una piccola, che sarà mai… | morale -4, fiducia -8, popolarità -3 | morale 100→96, fiducia 70→62, popolarità 67→64 | sì — riquadro in alto dopo il clic |
| `wi_maglia_dieci` | 🔟 La prendo — me la merito | morale +6, popolarità +5, forma -1 | morale 96→100, popolarità 64→66, forma 89→88 | no — nessun riquadro |
| `wi_maglia_dieci` | 🙅 Tengo il mio numero | morale +2 | morale 100→100 | no — nessun riquadro |
| `wi_sosta_nazionali` | 😴 Stacco e ricarico | fatica -10, forma -1 | fatica 52→42, forma 88→87 | no — nessun riquadro |
| `wi_sosta_nazionali` | 🏃 Lavoro sui dettagli | forma +5, fatica +4 | forma 87→92, fatica 42→46 | sì — riquadro in alto dopo il clic |
| `wi_ristorante_socio` | 🍽 Investo e ci metto la faccia | conto -28000, popolarità +6 | conto 4913000→4885000, popolarità 66→67 | no riquadro · conto/profilo, non verificato |
| `wi_ristorante_socio` | 🤔 Troppo rischio adesso | morale +1 | morale 100→100 | sì — riquadro in alto dopo il clic |
| `wi_dirigente_idolo` | 👂 Ascolto la proposta | valore 0.20, fiducia -4, morale +3 | valore 19.76→19.96, fiducia 62→58, morale 100→100 | no riquadro · conto/profilo, non verificato |
| `wi_dirigente_idolo` | 🔒 Sono concentrato qui | fiducia +5 | fiducia 58→63 | sì — riquadro in alto dopo il clic |
| `wi_compleanno_tifosi` | 🎂 Esco a salutarli tutti | popolarità +7, morale +6, fatica +3 | popolarità 67→69, morale 100→100, fatica 46→49 | no — nessun riquadro |
| `wi_compleanno_tifosi` | 🏠 Festeggio in famiglia | morale +5, fatica -3 | morale 100→100, fatica 49→46 | sì — riquadro in alto dopo il clic |
| `wi_dieta_brand` | 🥦 Accetto e mi adatto | conto +12000, forma -2, morale -2 | conto 4885000→4897000, forma 92→90, morale 100→98 | no riquadro · conto/profilo, non verificato |
| `wi_dieta_brand` | 🍖 Non cambio alimentazione ora | forma +2 | forma 90→92 | no — nessun riquadro |
| `wi_massaggiatore_addio` | 🎉 Organizzo tutto io | conto -8000, chimica +8, morale +5 | conto 4897000→4889000, chimica 94→100, morale 98→100 | no riquadro · conto/profilo, non verificato |
| `wi_massaggiatore_addio` | 👏 Un applauso in spogliatoio | chimica +2 | chimica 100→100 | no riquadro · conto/profilo, non verificato |

## Esito per cantiere

- Q-1 impulsi — misura: **CHIUSA** (221/221). Difetti: **2 aperti** (rilievi 1 e 2), entrambi riproducibili.

_Dati grezzi e sonde in `docs/collaudi/Q-impulsi-dati/`._
