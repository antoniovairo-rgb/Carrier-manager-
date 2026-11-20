# Verifica della 7.999.198 — parte R3 (residui)

Ramo `sviluppo/verifica198-r3`, partito da `prova/198-finale` (0f0b13d8 = lavoro/198 + giri 293–296, 298–302).
Controlli eseguiti uno alla volta (`CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`), tetto 30 minuti l'uno.
Nessuna correzione: solo esiti. Base di confronto: `lavoro/198` (b3b75b9d), in un albero di lavoro separato.

| controllo | esito su finale | esito sulla base | nato da quale giro | nota |
|---|---|---|---|---|
| corpi-073 (braccio 284f) | INSTABILE = ROSSO: 3 corse, 2 verdi e 1 rossa (corsa 3, seme 29: codice 001 in 16/16 campioni di 1 apertura su 6, battitore 8, compagno più vicino ≥ 3,7 u, «primo scatto del pallone a 35,8 u») | VERDE 3/3 | NON ATTRIBUITO: una corsa per interruttore (`__CPM_NO_G293`, 294, 295, 296, 298, 299, 300, 301, 302 — il 297 non esiste nel codice) → 9 verdi su 9 | vedi «corpi-073» sotto |
| camera-241 | VERDE (verde col verde; rosso di prova visibile: eroe fuori dal quadro della regia in 5/8 testimoni, minimo 3; non giudicate 0) | — | — | 854 s, exit 0 |
| rassegna-202 | VERDE (9/9; rosso `__CPM_NO_G202` bocciato su 2/2 schermi) | — | — | 265 s, exit 0 |
| avviso3d-209 | ROSSO (35/36): «pc · riprova: corpi pronti in 150,1 s» = l'attesa della sonda (150 s) scaduta senza corpi pronti dopo il tasto «riprova» a schermo da pc; a schermo da telefono lo stesso passo è verde (48,0 s). Rosso di prova `__CPM_NO_G209` bocciato | ROSSO (34/36): stesso passo «pc · riprova» scaduto a 150,4 s, più «la scena 3D si rimonta da capo: false»; telefono verde (50,1 s) | nessuno: non nasce dall'unione (la base è rossa sullo stesso passo) | 345 s su finale, 363 s sulla base, exit 1 entrambe. Una corsa per lato |
| riproduci-187 | VERDE (verde passa: 2/2 partite uguali; rosso di prova cade come deve) | — | — | 209 s, exit 0 |

## corpi-073

Conto complessivo delle corse del braccio 284f (V2d + R3):

| dove | corse | rosse |
|---|---|---|
| finale (0f0b13d8), sonda così com'è | 5 (2 della V2d + 3 di R3) | 2 |
| finale, un interruttore `__CPM_NO_G…` acceso per corsa | 9 | 0 |
| base lavoro/198 (b3b75b9d) | 5 (2 della V2d + 3 di R3) | 0 |

- Le due corse rosse hanno la stessa firma: seme 29, una sola apertura su 6 col codice 001 in quasi tutti i campioni (14/18 nella V2d, 16/16 qui), primo scatto del pallone a 35,8 u dal punto. Nella rossa di R3 il battitore è il numero 8 e il compagno più vicino al pallone resta a 3,7 u o più; in tutte le aperture verdi il compagno più vicino è a 0,0 u.
- Il «primo scatto lontano dal punto» (35,8 u o 74,2 u) da solo NON fa il rosso: compare in molte aperture verdi, sia su finale sia sulla base (base: 6 aperture su 18 in R3).
- Sulla base il codice 001 non è mai uscito in 5 corse (30 aperture). Sull'unione è uscito in 2 corse su 5. Questo indica che il difetto nasce dall'unione, ma con 5 corse per lato non è una prova: resta un'indicazione.
- Gli interruttori: nessuno dei 9, acceso da solo per una corsa, ha dato rosso. Con un rosso che esce circa 2 volte su 5, una sola corsa verde per interruttore non scagiona né accusa nessun giro: **quale giro lo causa non posso confermarlo**. Servirebbero più corse per interruttore (ordine di 5–10 l'una, circa 3 minuti a corsa).
- Come sono stati accesi gli interruttori: la sonda non ha un comando per farlo, quindi ho usato una copia temporanea di `corpi-073.mjs` con una sola riga in più (`addInitScript` che mette a 1 la variabile indicata), non salvata nel ramo. La sonda del ramo non è stata toccata.
- Durate: circa 165–185 s a corsa.

## Riepilogo

- Eseguiti tutti e 5 i controlli chiesti: **3 verdi** (camera-241, rassegna-202, riproduci-187), **1 rosso** (avviso3d-209), **1 instabile** (corpi-073, che per regola conta rosso). Nessuno ha superato i 30 minuti (il più lungo: camera-241, 854 s).
- **avviso3d-209**: rosso su finale e rosso sulla base sullo stesso passo («pc · riprova», attesa di 150 s scaduta) → **non nasce dall'unione**. Una sola corsa per lato: non so dire se sia un rosso fisso o instabile. Sulla base cade un passo in più («tela 3D nuova: false»), che su finale è verde.
- **corpi-073**: sull'unione 2 corse rosse su 5, sulla base 0 su 5 → indizio che nasca dall'unione, non prova. Il giro responsabile **non è individuato**: i 9 interruttori, una corsa l'uno, sono tutti verdi.
- Dalla V2d resta aperto anche **interazioni-226** (rosso identico sulla base, non rieseguito qui).
- Nessuna correzione, nessuna soglia toccata, `GAME_VERSION` invariata. rassegna-202 ha rigenerato 8 foto in `docs/sviluppo/giro202/`: rimesse con `git restore`.

## Verdetto

**R3 pronto: NO** — corpi-073 è instabile solo sull'unione (2 rosse su 5 contro 0 su 5 della base) e il giro che lo causa non è individuato; avviso3d-209 è rosso, ma lo era già sulla base.
