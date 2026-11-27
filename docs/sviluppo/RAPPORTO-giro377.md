# Giro 377 — Gli impulsi della settimana: promesse che si mantengono, condizioni realistiche (PO-646)

**Voce:** PO-646 — «Rivedere tutti gli impulsi e renderli logici e realistici, credo che questo impulso sia solo abbellimento
inutile» (foto `docs/collaudo-po/207-impulso-procuratore.jpg`: S.17 sett. 37/38, «Il tuo procuratore ti dice che c'è un club
interessato, ma serve pazienza» · «Aspettiamo — la pazienza paga» / «No, voglio muovermi ora — mettimi in lista»).
**Base:** `lavoro/201` @ 8543a9c · **ramo:** `sviluppo/giro377-impulsi` · GAME_VERSION non toccata (rilascio automatico del vagone).

## 1. Misura (No Blind Fix)

**Lettura del codice.** Gli impulsi sono **130** (`WEEKLY_IMPULSES`, `src/03-eventi-narrativi.jsx`). Per ognuno ho letto testo,
condizione (`cond`) e scelte con i loro effetti (`ef`), e l'applicazione degli effetti (`handleImpulseChoice`, `src/18`).
La grande maggioranza (118) muove solo stati del giocatore (morale, forma, fatica, fiducia, popolarità, soldi, chimica) e **non
promette un fatto**: lì testo ed effetto sono coerenti. I difetti sono di due classi:

- **promessa vuota**: la scelta annuncia un fatto (un club, un prestito, un numero di maglia, un contratto pagato) che il codice
  non produce mai;
- **condizione irrealistica**: l'impulso esce in un momento in cui il suo testo è falso (fuori finestra di mercato, avversario
  che non è un ex club, raduno nella settimana della partita, «il tuo agente» a chi non ce l'ha…).

**Simulazione** (`tests/visual/misura-377.mjs`, handler veri `__CPM_CAREER`: vivi la settimana → simula → avanza → rollover;
6 carriere con 6 nomi = 6 semi, 3 stagioni ciascuna, sempre la prima scelta; stesso comando prima e dopo):

| impulso | prima: uscite (in condizione irrealistica) | dopo: uscite (irrealistiche) |
|---|---|---|
| `wi_procuratore` | 5 (3: W9, W29, W29 — nessuna finestra vicina) | 3 (0: W35, W37, W3) |
| `wi_dirigente_idolo` | 5 (5: W11, W26, W5, W22, W25) | 2 (0: W33, W37) |
| `wi_maglia_dieci` | 5 (5: a chi aveva già la 10) | 0 |
| `wi_ex_compagno_cena` | 3 (3: avversario che non era un ex club) | 0 |
| `wi_nazionale_b` | 1 (1: nella settimana di una partita) | 0 |
| `wi_sponsor` | 4 (contratto senza un euro) | 4 (ora +6.000 €) |
| `wi_prestito_inverno` · `wi_amichevole` · `wi_addio_cambio` | 0 (profili della sonda: non idonei) | 0 |
| **totale impulsi usciti** | 386 (99 voci distinte) | 364 (95 voci distinte) |
| **promesse di un club scelte → fatti** | 0 testimoni: nessun fatto collegato, per costruzione | **5 scelte → 3 offerte arrivate, 1 sfumata (dichiarata), 1 ancora in attesa a fine simulazione** |

Sui difettosi: **prima 17 uscite irrealistiche su 19 uscite**, dopo **0 su 5**. Il numero totale cala di poco perché le voci
escluse lasciano il posto ad altre (il pool resta ampio: 95 voci distinte).

## 2. Correzioni (alla sorgente)

### 2.1 Le promesse di mercato si mantengono (`attesa377`)
`src/03`: `ATTESE377` (tabella delle scelte che promettono un club: `wi_procuratore` «Aspettiamo», `wi_dirigente_idolo` «Ascolto
la proposta», `wi_prestito_inverno` «Vado»), `finestra377` (la prima finestra di mercato — settimane 1-5 o 19-23 — dopo la
settimana della scelta), `vicino377`, `attesa377`, `tiro377`, `offerta377`, `MSG377`.
`src/18` (`CareerApp`): un solo effetto all'arrivo di ogni settimana, qualunque percorso l'abbia fatta avanzare.

- **Probabilità dichiarata:** in ogni settimana della finestra il club si fa vivo con **P377 = 45%** → **~95% su una finestra
  intera di 5 settimane** (70% se la scelta arriva con 2 settimane di finestra). Tiro **deterministico** sul seme della carriera
  (nome + nazione) + impulso + settimana assoluta.
- **Il fatto:** l'offerta vera (stesso `generateTransferOffer` del mercato, quindi le regole del giro 351 valgono), una riga nel
  registro («📞 Il procuratore aveva ragione: FC … presenta un'offerta ufficiale») e la notifica. Per il prestito: club meno
  blasonato, contratto di prestito secco.
- **Se non arriva:** a finestra chiusa la pista è dichiarata **sfumata** (registro + notifica): «serve pazienza» resta vero anche
  quando va male, e il giocatore lo sa.
- **Un'offerta già aperta** fa slittare il tiro alla settimana dopo (testimone `rinvio`).
- **Salvataggio:** nessun campo nuovo. L'esito sta in `f377` dentro la voce `impMem[id]` che esiste già (PO-154): assente =
  promessa aperta, `>0` = settimana dell'arrivo, `<0` = sfumata. Salvataggi vecchi: nessuna voce `f377`; una scelta «Aspettiamo»
  fatta prima di questo giro vale come promessa solo se la sua finestra non è chiusa da più di 4 settimane (altrimenti è ignorata,
  senza annunci tardivi).

### 2.2 Condizioni realistiche
| impulso | prima | dopo |
|---|---|---|
| `wi_procuratore` | qualsiasi settimana, anche in prestito o in Primavera | pro, non in prestito, mercato aperto per lui (`_mktOk`), finestra che comincia entro 6 settimane e dura almeno 2 (W1-3, W13-21, W33-38); testo «…se ne riparla alla prossima finestra di mercato» |
| `wi_dirigente_idolo` | qualsiasi settimana | + finestra vicina, non in prestito |
| `wi_prestito_inverno` | tutto l'anno, anche in Primavera; «Vado» dava +8 forma/+9 morale e nessun prestito | settimane 13-21, pro, non in prestito; «Vado» = morale +6, fiducia −5 **e l'offerta di prestito vera** nella finestra di gennaio; testo «un club meno blasonato… nel mercato di gennaio» |
| `wi_ex_compagno_cena` | bastava avere un ex club qualsiasi | l'avversario della settimana è davvero un ex club |
| `wi_nazionale_b` | anche nella settimana di una partita | solo nella sosta |
| `wi_maglia_dieci` | anche a chi aveva già la 10; «La prendo» non cambiava il numero | mai a chi la ha (anche col numero non scelto, che il gioco mostra come 10); «La prendo» → `jerseyNum` 10 (campo esistente) |
| `wi_amichevole` | «Il tuo agente segnala…» anche senza agente | «il club gioca un'amichevole internazionale all'estero, il mister lascia scegliere chi partire» |
| `wi_sponsor` | contratto di endorsement senza soldi | +6.000 € |

**Rosso** `window.__CPM_NO_G377`: condizioni, testi, offerte e maglia di prima (non `wi_sponsor`, che è un dato).

## 3. Tabella di tutti gli impulsi

Classe: **coerente** = il testo non promette fatti oltre agli effetti di stato · **seguito coerente** = seguito PO-154 che ricorda
la scelta d'origine · le altre classi come sopra. Gli effetti sono quelli del codice (`ef`).

| # | id | cat | scelte → effetti (ef) | classe | nota |
|---|---|---|---|---|---|
| 1 | `wi_docufilm` | opportunità | 🎬 Accetto — mi racconto → {popularity:8,fatigue:5,coachTrust:-3} · 🚪 No grazie, prima il campo → {coachTrust:3} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 2 | `wi_asta_maglia` | scelta | ❤️ Aggiungo gli scarpini autografati → {popularity:9,morale:5,bank:-5000} · 👕 Va bene la maglia → {popularity:3} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 3 | `wi_dieta_ferrea` | scelta | 🥗 La seguo alla lettera → {form:5,morale:-3} · 🍕 Uno sgarro me lo concedo → {morale:4,form:-2} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 4 | `wi_ex_compagno_cena` | tensione | 🍽 Ci vado — l'amicizia viene prima → {morale:5,coachTrust:-3} · 📵 Rimandiamo a dopo la partita → {coachTrust:3,morale:-2} | condizione irrealistica | «ex compagno, avversario della prossima giornata»: bastava avere un ex club qualsiasi → CORRETTO: l'avversario della settimana è un ex club |
| 5 | `wi_torneo_padel` | scelta | 🎾 Gioco per vincere → {chem:7,fatigue:7} · 🛋 Tifo dal divano → {fatigue:-5,chem:-3} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 6 | `wi_biografia` | opportunità | 📖 Firmo il contratto → {bank:20000,popularity:6,coachTrust:-4} · ⌛ È troppo presto → {coachTrust:4} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 7 | `wi_murale` | scelta | 🎨 Vado di persona → {popularity:8,morale:6,fatigue:5} · 🙏 Ringrazio con un video → {popularity:3} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 8 | `wi_extra_portieri` | scelta | 🥅 Resto e calcio finché fa buio → {form:6,fatigue:7,coachTrust:4} · ⏱ Oggi ho già dato tutto → {fatigue:-2} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 9 | `wi_influencer` | conseguenza | 📱 Porte aperte → {popularity:10,coachTrust:-6,fatigue:4} · 🚫 Il centro sportivo è sacro → {coachTrust:4,popularity:-2} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 10 | `wi_ospedale` | scelta | 🏥 Ci vado con i regali → {morale:8,popularity:6,fatigue:4} · 💸 Dono in silenzio → {bank:-10000,morale:4} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 11 | `wi_recupero_hitech` | scelta | ❄️ Ci vivo dentro → {fatigue:-8,form:3,chem:-2} · 👥 Preferisco stare col gruppo → {chem:4} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 12 | `wi_carita_anonima` | conseguenza | 📰 Che esca pure → {popularity:8,morale:-2} · 🤫 Resti anonima, o niente → {morale:5} | seguito coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 13 | `wi_sponsor_pers` | opportunità | 💰 Firmo — è il mio momento → {bank:35000,popularity:8,coachTrust:-6} · 🙏 Rifiuto con eleganza → {coachTrust:6,morale:-2} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 14 | `wi_cena_squadra` | scelta | 🍝 Ci vado — il gruppo conta → {chem:8,morale:6,fatigue:8} · 🛌 Salto — devo recuperare → {fatigue:-6,chem:-4} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 15 | `wi_investimento` | conseguenza | 📈 Investo metà del conto → {bank:-40000,quotaConto265:0.5,morale:3} · 🏦 Tengo i soldi fermi → {morale:1} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 16 | `wi_beneficenza` | scelta | ❤️ Lo pago io → {bank:-25000,popularity:12,morale:8} · 🤝 Partecipo solo all'evento → {popularity:4} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 17 | `wi_procuratore_push` | tensione | 📰 Dagli il via libera → {value:0.25,popularity:6,coachTrust:-8} · ✋ Fermalo — non è il momento → {coachTrust:4} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 18 | `wi_giovane_aiuto` | scelta | 🎓 Resto un'ora con lui → {chem:6,coachTrust:5,fatigue:6} · ⏱ Non oggi → {fatigue:-2,chem:-2} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 19 | `wi_intervista_scomoda` | tensione | 🔥 Dico quello che penso → {popularity:9,coachTrust:-10,morale:4} · 🧊 Glissa con diplomazia → {coachTrust:5,popularity:-2} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 20 | `wi_personal_chef` | opportunità | 🥗 Lo assumo → {bank:-15000,fatigue:-10,form:3} · 🥗 Lo assumo — {SETT}, lo gestisco dall'U → {} · 🍕 Sto bene così → {} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 21 | `wi_famiglia_visita` | scelta | 👨‍👩‍👦 Li ospito — le radici contano → {morale:12,fatigue:6} · 📅 Rimandiamo di un mese → {morale:-4,fatigue:-3} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 22 | `wi_scommessa_social` | conseguenza | 😂 Ci sto — ridiamoci su → {bank:18000,popularity:10,coachTrust:-3} · 🚫 Preferisco il basso profilo → {coachTrust:2} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 23 | `wi_compagno_lite` | tensione | 🕊 Faccio da paciere stasera → {chem:10,coachTrust:6,fatigue:5} · 🙈 Non mi immischio → {chem:-5} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 24 | `wi_es_busta` | esordio | 📸 Foto alla busta, dritta in famiglia → {morale:6} · 🏦 Da parte, testa bassa: è solo l'inizio → {morale:3,form:2} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 25 | `wi_es_canzone` | esordio | 🎤 Salgo e canto: playlist della nonna, s → {morale:7,chem:6} · 🙈 Stono apposta per farla finire prima → {chem:3,morale:3} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 26 | `wi_es_autografo` | esordio | 😂 Firmo con dedica: «Al mio primo tifoso → {morale:6,popularity:2} · 😤 Un giorno la fila la farà per me → {form:2,morale:2} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 27 | `wi_es_bar` | esordio | 🥹 Passo a firmare la cornice di persona → {popularity:4,morale:5} · ☕ Caffè pagato per tutti, una volta sola → {popularity:5,bank:-1500,morale:3} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 28 | `wi_es_prof` | esordio | 📚 Studio nei ritiri — promesso davvero → {morale:4,fatigue:2} · ⚽ Il campo è la mia scuola adesso, prof → {form:3,morale:2} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 29 | `wi_es_muretto` | esordio | ⚽ Glielo lascio: è cominciato tutto lì → {morale:6,popularity:3} · 🛒 Ne porto uno NUOVO per tutti, domani → {bank:-1000,popularity:5,morale:4} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 30 | `wi_pro_firma` | primopro | ✒️ Gliela chiedo in regalo: va in cornic → {morale:6} · 🧊 Conta la firma, non la penna → {form:2,morale:3} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 31 | `wi_pro_armadietto` | primopro | 🥹 Resta attaccato lì per tutta la mia ca → {morale:7} · 🖼️ Lo faccio incorniciare per il museo d → {popularity:4,chem:3} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 32 | `wi_pro_procuratore` | primopro | 🧊 Non ora: al primo anno parla il campo → {coachTrust:4,morale:2} · 📇 Prendo il biglietto — mai dire mai → {popularity:2} | promessa debole (RESIDUO) | «Prendo il biglietto»: nessun contatto successivo con quel procuratore |
| 33 | `wi_pro_store` | primopro | 🛍️ Due: una per me e una per mamma → {bank:-3000,morale:7} · 😎 Chiedo al commesso se vende: «benino», → {popularity:3,morale:4} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 34 | `wi_pro_regola` | primopro | 🥐 Giovedì: cornetti per tutti, anche il  → {chem:7,morale:3,bank:-500} · 📓 Prendo appunti. Letteralmente. → {morale:4,coachTrust:3} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 35 | `wi_pro_battesimo` | primopro | 😂 Rido più forte di loro: adesso sono de → {chem:8,morale:5} · 🧊 Recupero tutto in silenzio. Domani mi  → {chem:4,form:2} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 36 | `wi_addio_maglia_gk` | addio | 😄 Gliela prometto — e gli firmo anche i  → {morale:5,popularity:4} · 🧊 Dopo la partita, come si è sempre fatt → {form:2,morale:2} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 37 | `wi_addio_cambio` | addio | 👏 Accetto: quell'applauso vale una carri → {morale:8,coachTrust:4,fatigue:-3} · ⚔️ Voglio i novanta minuti: mi salutano  → {form:4,coachTrust:-2,morale:3} | promessa vuota (RESIDUO) | «ti cambio all'85' nella prossima in casa»: la partita non lo fa |
| 38 | `wi_addio_scarpini` | addio | 🥹 Autorizzato — e la teca la firmiamo in → {morale:6,chem:4} · 😅 Solo se ci mette anche quelli della pa → {morale:5,popularity:3} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 39 | `wi_addio_docu` | addio | 🎬 Che sia un bel finale → {popularity:9,bank:40000,fatigue:4} · 🚪 L'ultima è mia: niente telecamere nell → {morale:5,chem:3} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 40 | `wi_addio_capitani` | addio | 🥂 Rispondo a tutti, uno per uno → {morale:7,popularity:5} · 🤫 Lo riguardo da solo. Dieci volte. → {morale:9} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 41 | `wi_addio_bimbi` | addio | ⚽ Un pomeriggio intero, palloni per tutt → {morale:8,popularity:6,fatigue:3} · 📅 Dopo il ritiro avremo tutto il tempo — → {morale:2} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 42 | `wi_orologio` | conseguenza | ⌚ Lo compro — rito di passaggio → {bank:-30000,chem:7,morale:4} · 💸 Follia — passo → {chem:-3,morale:1} | condizione da rivedere (RESIDUO) | «costa un mese d'ingaggio» ma il costo è fisso 30.000 € |
| 43 | `wi_amichevole` | opportunità | ✅ Ci vado — voglio farmi vedere → {popularity:12,fatigue:14,form:3} · ❌ Rimango a riposare → {fatigue:-10,morale:5} | condizione irrealistica | «il tuo agente» anche a chi non ne ha, e un agente non iscrive a un'amichevole → CORRETTO: la organizza il club |
| 44 | `wi_media` | opportunità | 📺 Accetto — è riconoscimento → {popularity:14,value:0.08,fatigue:5} · ⚽ No, preferisco allenarmi → {form:4,coachTrust:3} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 45 | `wi_ciclo_forza` | scelta | 💪 Ciclo completo — massimo impegno → {fatigue:15,form:7} · 🧘 Solo sessione leggera → {fatigue:4,form:2,morale:3} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 46 | `wi_riposo` | scelta | 🏋️ Mi alleno da solo — non mi fermo mai → {form:6,fatigue:8,coachTrust:3} · 🌴 Mi riposo davvero → {fatigue:-18,morale:10} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 47 | `wi_tensione_spo` | tensione | 🤝 Mediate tra i due → {coachTrust:8,morale:5,popularity:5} · 😶 Non ti impicci → {morale:-3} · 🗣️ Segnali la cosa al mister → {coachTrust:6,morale:-4} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 48 | `wi_fan_aggression` | tensione | 😤 Rispondi a tono → {morale:5,popularity:-8} · 🙏 «Scusi, farò meglio» → {popularity:6,morale:-3} · 🚶 Vai avanti senza rispondere → {morale:2} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 49 | `wi_procuratore` | conseguenza | ⏳ Aspettiamo — la pazienza paga → {morale:4} + ora l'offerta vera alla finestra · 📢 No, voglio muovermi ora — mettimi in l → {popularity:4,coachTrust:-5,morale:-4,transferListed:true} | promessa vuota + condizione | «Aspettiamo»: solo morale +4, il club non arrivava mai; usciva in qualsiasi settimana (anche a W9, W29), anche in prestito → CORRETTO: offerta vera nella prima finestra (45%/settimana, ~95% su 5 settimane), esce solo con la finestra entro 6 settimane |
| 50 | `wi_giovane` | opportunità | ✅ Certo — è bello trasmettere → {morale:8,coachTrust:5,popularity:4} · ❌ Non ho tempo per questo → {morale:-2} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 51 | `wi_intervista_sorpresa` | scelta | 🔥 Dico tutto — la verità libera → {popularity:14,coachTrust:-6,morale:5} · 🤝 Rispondo con diplomazia → {popularity:6,coachTrust:3} · ❌ Declino → {popularity:-3,morale:3} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 52 | `wi_social` | conseguenza | 🗑️ Cancello e mi scuso → {popularity:-4,morale:-3} · 😏 Lascio stare — era ironico → {popularity:6,coachTrust:-4} · 📝 Chiarisco con un comunicato → {popularity:2,morale:4} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 53 | `wi_viaggio` | scelta | 🎮 Ti rilassi con i compagni → {morale:9,fatigue:-6} · 📊 Studi il video dell'avversario → {form:5,coachTrust:4} · 🏃 Fai un allenamento extra in palestra → {form:4,fatigue:6} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 54 | `wi_sogno` | conseguenza | 🔥 Cavalco l'onda — oggi è un gran giorno → {morale:10,form:5} · 😐 Era solo un sogno. Al lavoro. → {form:2,fatigue:-4} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 55 | `wi_ex_club` | tensione | ❤️ «Sì, ma sono felice qui» → {morale:8} · 😐 «È il calcio. Si va avanti» → {morale:3} · 😔 «Onestamente, un po' sì» → {morale:-4,popularity:3} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 56 | `wi_staff` | opportunità | 🧪 Lo provo — sono curioso → {fatigue:-14,form:4} · 😐 Resto al metodo classico → {fatigue:-6} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 57 | `wi_capitano_sfida` | scelta | 🎯 Accetto — e do il massimo → {form:6,popularity:7,coachTrust:3} · 🚶 Non mi interessa → {form:1,morale:-3} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 58 | `wi_insonnia` | tensione | 📱 Guardi video motivazionali fino all'al → {morale:6,fatigue:10} · 🧘 Rispiri, lasci andare, dormi → {morale:4,fatigue:-5,form:3} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 59 | `wi_tifosi` | opportunità | 📸 Mi fermo 20 minuti con loro → {popularity:12,morale:7,fatigue:4} · 🚗 Sorrido e saluto di corsa → {popularity:4,morale:3} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 60 | `wi_sponsor` | opportunità | ✅ Firmo — è riconoscimento → {popularity:9,value:0.05,morale:5,bank:6000} · ⏳ Aspetto qualcosa di più grande → {morale:2} | promessa vuota | «Firmo» un contratto di endorsement senza un euro → CORRETTO: +6.000 € |
| 61 | `wi_polemica` | tensione | 💪 La prendo come motivazione → {morale:5,form:4} · 😤 Mi incazzo — e si vede → {morale:-4,popularity:-6,coachTrust:-3} · 😶 Silenzio stampa totale → {popularity:-3,morale:2} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 62 | `wi_ct_radar` | opportunità | 🔥 Mi supero — voglio essere visto → {form:8,coachTrust:4,fatigue:6} · 😐 Mi alleno normalmente → {form:2} | promessa debole (RESIDUO) | «voglio essere visto»: non pesa sulle convocazioni |
| 63 | `wi_giornalista_mercato` | tensione | 🤐 Resto focalizzato sulla squadra → {coachTrust:6,popularity:3,morale:2} · 📢 Ammetto che ci sto pensando → {coachTrust:-8,popularity:7,morale:-4} · 😏 Dico che decido a fine stagione → {coachTrust:-2,popularity:4} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 64 | `wi_vice_infortunato` | leadership | 💪 Prendo le responsabilità — sono pronto → {coachTrust:10,morale:6,fatigue:5,form:4} · 😐 Faccio il mio — nient'altro → {coachTrust:2,morale:2} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 65 | `wi_prestito_inverno` | opportunità | ✅ Vado — ho bisogno di giocare → prima {form:8,morale:9,coachTrust:-5,value:0.06}, ora {morale:6,coachTrust:-5} + offerta di prestito · ❌ Resto e mi batto qui → {coachTrust:5,morale:4,fatigue:5} | promessa vuota + condizione | «Vado»: +8 forma/+9 morale e nessun prestito; usciva tutto l'anno → CORRETTO: offerta di PRESTITO vera nella finestra di gennaio, esce nelle settimane 13-21, mai in Primavera |
| 66 | `wi_nazionale_b` | opportunità | 🌍 Vado — mi metto in mostra → {popularity:12,form:6,morale:10,fatigue:8} · 🏠 Resto con il club — è un momento delic → {coachTrust:8,morale:3,form:3} | condizione irrealistica | raduno anche nella settimana di una partita del club → CORRETTO: solo nella sosta |
| 67 | `wi_podcast` | personale | 🎙️ Accetto — voglio raccontarmi → {popularity:14,morale:7,value:0.08} · 😶 Sono riservato — preferisco il campo → {morale:4,coachTrust:3} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 68 | `wi_donazione` | personale | 💖 Lo faccio — sport e solidarietà → {popularity:10,morale:9,fatigue:7} · 🏃 Passo — ho bisogno di recuperare → {fatigue:-8,morale:3} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 69 | `wi_fan_speciale` | personale | 💛 Mi fermo, parlo con lui, selfie e firm → {morale:14,popularity:8,value:0.03} · 😔 Sono di fretta — un sorriso e via → {morale:3} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 70 | `wi_analisi_video` | formazione | 📽️ Lo faccio — ogni dettaglio conta → {form:6,fatigue:6,mentalità:1,posizionamento:1} · 😪 Ho già troppe cose in testa → {morale:4,fatigue:-5} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 71 | `wi_crioterapia` | formazione | 🧊 Ci provo — tutto per la forma → {fatigue:-16,form:6,morale:3} · 🚿 Preferisco la doccia calda normale → {fatigue:-7,morale:5} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 72 | `wi_veterano_allenamento` | formazione | 💪 Accetto subito — esperienza preziosa → {form:7,coachTrust:5,morale:7,fatigue:6} · 😐 Ho già il mio programma → {morale:2} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 73 | `wi_cena_capitano` | sociale | 🍽️ Ci sono — la squadra prima di tutto → {morale:9,coachTrust:5,fatigue:4} · 🏠 Resto a casa — ho bisogno di riposare → {fatigue:-8,morale:3} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 74 | `wi_giovani_accademia` | sociale | 👶 Vado — è un gesto che vale → {popularity:9,morale:11,value:0.05} · 😐 Non è il momento giusto per me → {morale:2} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 75 | `wi_campo_bagnato` | scelta | ⛈️ All'aperto — il vero campo si gioca i → {fisico:1,fatigue:13,form:5} · 🏋️ Al coperto — tecnica e tattica senza  → {tecnica:1,fatigue:7,form:3} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 76 | `wi_sponsor_auto` | opportunità | 🚗 Firmo — è un bel riconoscimento → {popularity:8,value:0.08,morale:7} · 🤝 Passo — voglio restare autentico → {morale:5,coachTrust:3} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 77 | `wi_derby_semana` | tensione | 🔥 Mi carico — per questi momenti esisto → {form:8,morale:9,fatigue:5} · 🎯 Resto concentrato e in silenzio → {mentalità:1,form:4,fatigue:-3} · 😰 Ammetto di essere un po' teso → {mentalità:1,coachTrust:4,morale:-4} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 78 | `wi_figlia_mister` | personale | 😊 «È un onore. Gli sarò sempre grato.» → {coachTrust:9,morale:8} · 😅 Ridi imbarazzato e cambi argomento → {morale:4} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 79 | `wi_auto_lusso` | scelta | 🚗 Accetto — che spettacolo → {popularity:6,morale:4,coachTrust:-3} · 🚙 Tengo la mia, niente distrazioni → {coachTrust:4,morale:-1} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 80 | `wi_polemica_social` | tensione | 🔥 Rispondo per le rime → {popularity:5,morale:-3,coachTrust:-4} · 🤐 Ignoro, parlerò in campo → {coachTrust:4,morale:2} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 81 | `wi_scuola_calcio` | opportunità | ⚽ Ci metto faccia e soldi → {bank:-30000,popularity:9,morale:6} · ⚽ Ci metto faccia e soldi: apro l'Accade → {popularity:3} · 🤝 Presto solo il nome → {popularity:3,bank:6000} · 🤝 Presto solo il nome: una licenza, ness → {popularity:3,bank:6000} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 82 | `wi_giornata_libera` | scelta | 🏖 Mare col gruppo → {chem:7,morale:6,fatigue:3} · 🏋️ Palestra e focus → {form:5,fatigue:5,chem:-2} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 83 | `wi_videogioco` | opportunità | 🎮 Firmo — sarò un personaggio → {bank:25000,popularity:8} · 🕹 Chiedo troppo, salta tutto → {morale:-2} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 84 | `wi_genitori_tribuna` | personale | ✈️ Li porto in tribuna d'onore → {bank:-6000,morale:9} · 📞 Li sento al telefono, ora no → {morale:2,fatigue:-2} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 85 | `wi_infortunato_posto` | tensione | 🤝 Parlo col mister: se lo merita → {chem:6,coachTrust:-2} · 😤 Il posto se lo riprende in campo → {coachTrust:4,chem:-5} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 86 | `wi_tv_primaserata` | opportunità | 📺 Ci vado — occasione unica → {popularity:9,fatigue:4,form:-2} · 🛌 Prima la partita, sempre → {coachTrust:4,popularity:-2} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 87 | `wi_cripto` | conseguenza | 🚀 Ci punto una fetta → {bank:-20000,morale:2} · 🧊 Non è roba per me → {morale:1} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 88 | `wi_bimbo_sogno` | scelta | 💙 Lo invito all'allenamento → {morale:9,popularity:5,fatigue:2} · 🎁 Gli mando maglia e videomessaggio → {morale:4,bank:-2000} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 89 | `wi_mental_coach` | scelta | 🧘 Ci provo — testa libera → {morale:6,form:3,fatigue:-3} · 🧘 Lo ingaggio — {SETT}, lo gestisco dall → {} · ⚽ Preferisco il campo → {form:2} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 90 | `wi_orologi_squadra` | scelta | ⌚ Li prendo per tutti → {bank:-22000,chem:10,morale:3} · 🍻 Basta una cena insieme → {bank:-4000,chem:4} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 91 | `wi_opinionista` | tensione | 🔥 Rispondo in conferenza → {popularity:3,coachTrust:-4,morale:-2} · 💪 Uso la rabbia in campo → {form:4,morale:3} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 92 | `wi_bonus_gol_social` | opportunità | 💸 Ci sto → {bank:8000,popularity:4,coachTrust:-2} · 🚫 Niente vetrine sui social → {coachTrust:3} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 93 | `wi_casa_citta` | conseguenza | 🏠 Compro — è casa mia → {bank:-45000,morale:6,popularity:4} · 🏠 Compro — è casa mia ({COSTO}) → {popularity:1,coachTrust:2} · 🔑 Resto in affitto, più libero → {morale:1} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 94 | `wi_primo_mister` | personale | 🎓 Ci vado di persona → {morale:7,fatigue:4,chem:2} · 💌 Mando due parole di stima → {morale:2} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 95 | `wi_tifoso_fisso` | tensione | 🤝 Gli dedico cinque minuti → {popularity:5,morale:2,fatigue:1} · 🚗 Passo dritto, ho fretta → {morale:-1,popularity:-2} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 96 | `wi_esports` | opportunità | 🎮 Divento ambassador → {bank:18000,popularity:7} · 🧢 Non fa per me → {morale:1} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 97 | `wi_compagno_prestito` | tensione | 🤝 Lo aiuto, senza dirlo a nessuno → {bank:-15000,chem:9,morale:4} · 💬 Gli trovo un consulente serio → {chem:3} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 98 | `wi_pioggia_scelta` | scelta | 🌧 Esco a lavorare duro → {form:5,fatigue:6,coachTrust:4} · 🏋️ Palestra, niente rischi → {fatigue:2,form:2} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 99 | `wi_scommessa_amici` | tensione | 🚫 Rifiuto netto — è la regola → {morale:3,coachTrust:3} · 🤫 Solo una piccola, che sarà mai… → {morale:-4,coachTrust:-8,popularity:-3} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 100 | `wi_maglia_dieci` | scelta | 🔟 La prendo — me la merito → {morale:6,popularity:5,form:-1,jerseyNum:10} · 🙅 Tengo il mio numero → {morale:2} | promessa vuota + condizione | «La prendo»: il numero non cambiava; usciva anche a chi aveva già la 10 → CORRETTO: jerseyNum 10, mai a chi la ha |
| 101 | `wi_sosta_nazionali` | scelta | 😴 Stacco e ricarico → {fatigue:-10,form:-1} · 🏃 Lavoro sui dettagli → {form:5,fatigue:4} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 102 | `wi_ristorante_socio` | conseguenza | 🍽 Investo e ci metto la faccia → {bank:-28000,popularity:6} · 🤔 Troppo rischio adesso → {morale:1} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 103 | `wi_dirigente_idolo` | conseguenza | 👂 Ascolto la proposta → {value:0.2,coachTrust:-4,morale:3} + ora l'offerta vera alla finestra · 🔒 Sono concentrato qui → {coachTrust:5} | promessa vuota + condizione | «Ascolto la proposta»: solo valore +0,2, nessun club → CORRETTO come sopra |
| 104 | `wi_compleanno_tifosi` | scelta | 🎂 Esco a salutarli tutti → {popularity:7,morale:6,fatigue:3} · 🏠 Festeggio in famiglia → {morale:5,fatigue:-3} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 105 | `wi_dieta_brand` | scelta | 🥦 Accetto e mi adatto → {bank:12000,form:-2,morale:-2} · 🍖 Non cambio alimentazione ora → {form:2} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 106 | `wi_massaggiatore_addio` | scelta | 🎉 Organizzo tutto io → {bank:-8000,chem:8,morale:5} · 👏 Un applauso in spogliatoio → {chem:2} | coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 107 | `wi_seg_docu_puntata` | seguito | 🍿 Organizzo la proiezione per la squadra → {chem:6,popularity:4,fatigue:2} · 🙊 Chiedo scusa a chi si è sentito esclus → {chem:3,coachTrust:2} | seguito coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 108 | `wi_seg_docu_premio` | seguito | 🎤 Ci vado con due compagni → {popularity:8,chem:3,fatigue:2} · 📨 Ringrazio per iscritto → {morale:3} | seguito coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 109 | `wi_seg_docu_rifiuto` | seguito | 🤝 «Grazie mister, era la scelta giusta» → {coachTrust:4,morale:2} · 😶 Un po' mi rode → {morale:-2,form:2} | seguito coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 110 | `wi_seg_ospedale_lettera` | seguito | 🖼️ Li appendo nello spogliatoio → {morale:8,chem:3} · 📸 Li pubblico con un grazie → {popularity:6,morale:4} | seguito coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 111 | `wi_seg_cripto` | seguito | 🧊 Non guardo il grafico fino a fine stag → {morale:2} · 📱 Controllo il telefono anche nell'inter → {morale:-3,form:-2} | seguito coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 112 | `wi_seg_cantiere` | seguito | 🦺 Faccio un giro col casco → {morale:3,fatigue:1} · 📄 Mi bastano le carte → {morale:1} | seguito coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 113 | `wi_seg_prestito_reso` | seguito | 🤝 Gli dico di tenerla ancora → {chem:6,morale:4} · ✅ La accetto, così siamo pari → {chem:3,bank:5000,morale:2} | seguito coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 114 | `wi_seg_lite_pace` | seguito | 😊 Me la godo → {morale:6,chem:4} · 🎯 Ora tocca vincere → {form:3,coachTrust:2} | seguito coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 115 | `wi_seg_lite_clan` | seguito | 🕊 Mi siedo a un tavolo nuovo, in mezzo → {chem:5,fatigue:2} · 🙈 Mangio in camera → {chem:-4,morale:-2} | seguito coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 116 | `wi_seg_lite_mister` | seguito | 🗣️ Parlo al gruppo prima dell'allenament → {chem:8,coachTrust:5,morale:-1} · 😶 Non tocca a me → {coachTrust:-5,chem:-3} | seguito coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 117 | `wi_seg_scommessa` | seguito | 🗣️ Ammetto lo sbaglio e chiedo scusa → {popularity:-4,coachTrust:3,morale:-2} · 🚫 Nego tutto → {popularity:-2,coachTrust:-6,morale:-3} | seguito coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 118 | `wi_seg_intervista` | seguito | 🤝 Chiarisco a quattr'occhi → {coachTrust:5,morale:-1} · 🔥 Confermo ogni parola → {popularity:5,coachTrust:-6} | seguito coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 119 | `wi_seg_podcast` | seguito | 🎙️ Registro un saluto per loro → {popularity:5,morale:5} · ⚽ Passo a trovarli dopo la partita → {popularity:7,morale:6,fatigue:3} | seguito coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 120 | `wi_seg_famiglia` | seguito | 👨‍👩‍👦 Stavolta li ospito → {morale:10,fatigue:3} · 📅 Rimando ancora → {morale:-6} | seguito coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 121 | `wi_seg_mental` | seguito | 🧘 La faccio nel tunnel → {form:3,morale:4} · 😅 Me la sono già dimenticata → {morale:1} | seguito coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 122 | `wi_seg_chef` | seguito | 🥗 Lo confermo → {bank:-20000,fatigue:-8,form:3} · 🥗 Seguo il suo piano → {fatigue:-8,form:3} · 🍳 Ho imparato le ricette, faccio da me → {form:1,morale:3} | seguito coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 123 | `wi_seg_accademia` | seguito | 🏆 Vado alla premiazione → {morale:9,popularity:5,fatigue:2} · 📹 Mando un videomessaggio → {morale:5,popularity:2} | seguito coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 124 | `wi_seg_fan` | seguito | 👋 Gli dedico il riscaldamento → {morale:8,popularity:4} · 🎽 Gli lancio la maglia a fine gara → {morale:6,popularity:6} | seguito coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 125 | `wi_seg_idolo` | seguito | 🔒 «Sono concentrato qui» → {coachTrust:4,morale:1} · 🤷 «Ascoltare non è firmare» → {coachTrust:-4,value:0.05} | seguito coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 126 | `wi_seg_primo_mister` | seguito | 🥹 Lo invito alla prossima partita → {morale:9,bank:-1000} · 📞 Gli prometto che ci rivediamo → {morale:5} | seguito coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 127 | `wi_seg_cena` | seguito | 😂 La prossima la offro io → {chem:5,bank:-2000,morale:2} · 🙃 Incasso e sorrido → {chem:1,morale:-1} | seguito coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 128 | `wi_seg_social` | seguito | 😂 Lo cavalco con un video → {popularity:6,coachTrust:-2} · 🧊 Silenzio, passerà → {morale:-1} | seguito coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 129 | `wi_seg_forza` | seguito | 🧊 Due giorni di scarico → {fatigue:-10,form:1} · 💪 Continuo così → {form:3,fatigue:6} | seguito coerente | effetti di stato coerenti col testo (nessun fatto promesso) |
| 130 | `wi_seg_scuola` | seguito | ⚽ Il primo allenamento lo faccio io → {popularity:6,morale:8,fatigue:3} · 🏷️ Basta il taglio del nastro → {popularity:3,morale:3} | seguito coerente | effetti di stato coerenti col testo (nessun fatto promesso) |

## 4. Residui dichiarati (non corretti in questo giro)

1. `wi_addio_cambio` — «alla prossima in casa ti cambio all'85'»: la partita non fa la sostituzione promessa (tocca il motore
   della partita, fuori dalla mia zona). Esce solo nella stagione d'addio: 0 uscite misurate.
2. `wi_orologio` — «costa quanto un mese del tuo ingaggio» ma il costo è fisso a 30.000 €.
3. `wi_pro_procuratore` — «Prendo il biglietto — mai dire mai»: quel procuratore non si rifà vivo.
4. `wi_ct_radar` / `wi_nazionale_b` — «voglio essere visto / mi metto in mostra» non pesano sulle convocazioni.
5. Due promesse di mercato aperte nella stessa finestra: si tira solo per la più vecchia (la seconda ha meno settimane).
6. Collisione rara: se nella settimana del tiro il mercato normale apre un'offerta nello stesso fotogramma per un'altra strada
   (effetto della settimana, non `doAdvanceWeek`), resta quella e la promessa risulta mantenuta lo stesso nel registro.

## 5. File e funzioni toccati

- `src/03-eventi-narrativi.jsx`: nuovi `no377`, `ATTESE377`, `P377`, `finestra377`, `vicino377`, `attesa377`, `tiro377`,
  `offerta377`, `MSG377` (dopo `_sg154`); impulsi `wi_procuratore`, `wi_dirigente_idolo`, `wi_prestito_inverno`,
  `wi_ex_compagno_cena`, `wi_nazionale_b`, `wi_maglia_dieci`, `wi_amichevole`, `wi_sponsor`. Testi del mister del 372 non toccati.
- `src/18-career-app.jsx`: `handleImpulseChoice` (applica `ef.jerseyNum`), nuovo effetto `_att377Ref` prima di `_mktDoneRef`.
- `CARRIER-MANAGER-AV.html`: ricomposto con `tools/build-src.mjs`.
- `tests/visual/impulsi-377.mjs` (guardiano), `tests/visual/misura-377.mjs` (sonda), `package.json` (`impulsi-377`),
  `ci-runner.mjs` (riga della MAPPA `src/03` che esisteva già).

## 6. Verifiche

- `npm run impulsi-377`: **verde 13/13**, **rosso `__CPM_NO_G377`: cadono 11/11** (i 2 controlli «giudicato» restano veri anche
  nel rosso, a prova che il rosso è stato giudicato). Il flusso B1 (S3 W37 → «Aspettiamo») porta l'offerta di FC Nottingham a S4 W2,
  la settimana che il guardiano ricalcola in node con la stessa formula; B2 (S3 W15 → «Vado») porta un prestito a S3 W22.
- `node ci-runner.mjs giro impulsi-377` (guardiano + 17 sentinelle) sul build finale: **18/18 verdi**, nessun passo instabile
  (impulsi-377 135 s · mappa-unica · test:logic · save-compat · replay · migrazione-194 · design-system · tema-unico ·
  griglia-mobile · render-3d-023 · tunnel-285 · home-298 · web-237 · career-critical · battito-264 · partita-vera · gk-dive-sync ·
  schermate-97).
- **Guardiani della zona NON girati** (li giudica il treno): riga `src/03` — `eta-352`, `impulsi-289`, `piccoli-85`,
  `acquisti-281`, `trainer-288`, `impulsi-memoria-154`, `impulsi-contesto`, `investimento-223`, `meta-conto-265`,
  `classifica-102`, `partita-rigiocata-194`; riga `src/18` (`rinnovo-354` e gli altri della sua riga); `offerte-351`,
  `career-sim`, `career-invariants`, `stab-nat-trigger`.

## 7. Dubbi per il PO (la consigliata è la prima, GIÀ APPLICATA)

**D1. Quanto deve essere sicuro il club promesso dal procuratore?**
1. **(consigliata, applicata)** 45% per settimana di finestra (~95% sulla finestra intera); se non arriva, la pista è dichiarata
   sfumata. Realistico: un procuratore a volte sbaglia, ma il gioco lo dice.
2. Sempre (100%) alla prima settimana di finestra: prevedibile, la scelta «Aspettiamo» diventa un pulsante «offerta».
3. Probabilità legata al rendimento (OVR, voti): più realistica, ma meno leggibile per chi sceglie.

**D2. Quando può uscire l'impulso del procuratore?**
1. **(consigliata, applicata)** Solo quando la prossima finestra comincia entro 6 settimane (W1-3, W13-21, W33-38).
2. Sempre, con la promessa rinviata alla prima finestra utile (anche 15 settimane dopo): «pazienza» lunga.
3. Solo dentro la finestra di mercato: l'offerta arriva entro pochi giorni, ma l'impulso diventa raro.

**D3. Gli impulsi con promesse residue (§4)?**
1. **(consigliata)** Correggerli in un giro dedicato, partendo da `wi_addio_cambio` (serve il motore della partita).
2. Riscriverne il testo perché non prometta (più rapido, meno ricco).
3. Toglierli dal mazzo.

**D4. Il prestito d'inverno porta a un club «meno blasonato», non necessariamente di una categoria inferiore.**
1. **(consigliata, applicata)** Testo cambiato in «un club meno blasonato»: dice ciò che succede.
2. Scegliere il club solo nella lega inferiore della stessa nazione (serve una mappa delle leghe per nazione).
