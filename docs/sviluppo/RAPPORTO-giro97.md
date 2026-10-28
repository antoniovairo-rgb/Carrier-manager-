# Giro 97 — schermate e layout dal collaudo grafico 7.999.178 (PO-299)

Ramo `sviluppo/giro97-schermate` da `lavoro/178`. File toccati: `src/11`, `src/16`, `src/17`, `src/18`, `src/19` (+ build). Non toccati: `src/12`, `src/14`, `src/15` (giro 95/96), `GAME_VERSION`, `docs/governo/`.
Misure via DOM, Chromium headless, formati telefono 412×915, tablet 820×1180, tablet 1180×820, PC 1440×900. «Base» = build di `lavoro/178`.

| Punto | Prima (base) | Causa | Correzione | Dopo | Rosso |
|---|---|---|---|---|---|
| D1 | a 820 px barra 74..746 contro contenuto 16..805 | `.cpm-nav-bar{max-width:600px}` (×1,12 di zoom = 672) e sidebar solo da 900 px | sotto i 900 px `max-width:none` | barra 0..820 | `__CPM_NO_G97D1` |
| D16 | telefono: Salva 24, strisce 27, Licenzia 24, testate 31-36, linguette 32, −/+ 34, campi 36-38, «Altra variante» 28, × Crediti 32 (altezza dell'area che riceve il tocco) | `_tocco292()` vale solo da 640 px | `.cpm-t40`: pseudo-elemento trasparente 42×42 centrato (la grafica non cambia); altezza vera dove l'area allargata non basta: linguette e campi 42, testate delle fisarmoniche 36 dentro lo zoom (=40 a schermo); spazio 12 fra − e +; strisce allargate solo verso l'alto; 16 px d'aria in fondo alla colonna (80→96) perche' l'area delle strisce copriva l'ultima riga | 0 controlli sotto 40 su 11 schermate × 3 formati a tocco | `__CPM_NO_G97D16` |
| D17 | PC e tablet orizzontale: strisce 122 px, «Sostieni il pro…» troncato, in cima alla sidebar | riga orizzontale in una sidebar da 246 | a ≥900 px una sotto l'altra, a tutta larghezza, in fondo alla sidebar | 245 px, nessun troncamento | `__CPM_NO_G97D17` |
| D18 | Opzioni 15,7 · Fine stagione/offerte 16,8 · intervista 12 · procuratore 13,4 | `gap:14`; margine 8 della Card sommato al gap di `.cpm-proto`; `marginBottom:12`; `marginBottom:SP.md` | `_sb(...)` (SP.box del giro 91), margine 0 dentro `.cpm-proto` | 7,8-9 px | `__CPM_NO_SPAZIO296` (quello del giro 91) |
| D19 | a 412 px «posto» a capo da solo 3/3 schede | spazi normali dentro «14° posto» | spazi non divisibili dentro ogni voce | 0/3 (360 px: 0/3 prima e dopo) | — |
| D22 | — | **falso positivo**: lo scrollHeight 271 conta il cerchio decorativo (`bottom:-40`), il contenuto (258 a schermo = 231 × 1,12) coincide col riquadro | nessuna | — | — |

## D14 — non riprodotto, punto aperto

Cinque misure, sempre luminosita' media 115-157 e 0% di pixel neri nell'area di gioco fra +50 ms e +9 s: cerimonia leggera forzata da `playing` (GLB spento e acceso) e **partita di carriera vera** (salvataggio `save-194-primavera-w38`, CH38 acceso, `__CPM_PRESENT=1`, autoplay fino al fischio, con e senza `__CPM_CER_HOLD`). Unico indizio: all'ingresso in cerimonia il canvas 3D cambia altezza (811 → 849 px); un cambio di misura svuota il disegno fino al fotogramma successivo, e in headless col CH38 un fotogramma puo' durare secondi. **Non posso confermarlo** come causa della foto del collaudo. Se lo e', vive in `src/15` (altezza del contenitore in cerimonia) o `src/12` (`setSize`), fuori dal mio ambito. Senza autoplay-hold la cerimonia nel flusso vero si chiude in ~0,2 s (osservato, non indagato: `src/15`). `schermate-97` la misura (4 campioni) ma non ha interruttore rosso.

## Guardiani

- `schermate-97` (nuovo): VERDE 4 formati (D1 2 · D16 44 · D17 4 · D14 4 misure); ROSSO con `__CPM_NO_G97D1/D16/D17`: cadono tutti e tre (D1 ritrova 74..746). In `package.json`, catene `carriera` e `completa`, passi lenti, MAPPA.
- `spazio-296` esteso (intervista, procuratore, Opzioni di carriera, Fine stagione/offerte, ciascuna su pagina nuova): VERDE 44 schermate; ROSSO giro 91 ok (39 su 42); sulla base cade su 7 schermate coi numeri del collaudo.
- Verdi sulla build nuova: design-system, griglia-mobile, piccoli-85, barra-360-72, crea-home-295, livello-79, finestra-230, crediti-254, popup-224, procuratore-253, chip-269, badge-255, stile-unico-75, neutro-287, toast-256, pc-tablet-292.
- `home-066`: ROSSO identico anche sulla base (fisarmonica «… ti dice» nella situazione «pro-svincolato»): preesistente.
- `intervista-231`: 1 rosso («nazionale rosso: il difetto non si vede») e 1 verde sulla build nuova, verde sulla base: instabile, il braccio rosso dipende dall'esito della partita della Nazionale.
