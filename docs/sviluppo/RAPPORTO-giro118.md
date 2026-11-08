# Rapporto giro 118 — portiere dell'intro (PO-325) e privacy in Opzioni (PO-322)

Ramo `sviluppo/giro118-portiere-privacy`, base `lavoro/184`. `GAME_VERSION` non toccata.

## PO-325 «Il portiere sembra che voli»
**Misura** (`tests/visual/intro-118-misura.mjs`, GLB acceso, 360x800 · 412x915 · 1440x900; testimone `__CPM_INTRO118`, solo `?cpmtest=1`):
- scala del portiere = quella dell'attaccante (1,166), z = -11,6 (palo a z = -12, 0,4 davanti alla linea), |x| < 3,66: **posizione e scala sane**.
- osso `ball_l/ball_r` più basso: **portiere +0,086..0,096** per tutta l'attesa (clip `gk-ready`, piedi in aria; la foto del PO e il ritaglio ingrandito lo mostrano sulle punte, sollevato); attaccante in appoggio −0,047..+0,047.
- dopo il tuffo (el ≥ 9,5) nessuno riportava `y` a 0: restava l'ultimo valore dell'arco `sin(...)·0,62` — **0,221 a 1440 px (8 fps)**, a 360/412 0 per caso di campionamento.

**Causa**: clip `gk-ready` a piedi sollevati (~9 cm) + `y` del portiere mai azzerata dopo il tuffo.
**Correzione** (src/19, interruttore rosso `__CPM_NO_G118`): a riposo l'osso `ball` più basso si riporta al prato (tetto 0,3); dopo el = 9,5 `y` = 0.
**Dopo**: osso più basso del portiere 0,000 in tutti e tre i formati (attaccante 0,046..0,047); `y` dopo il tuffo 0,000.

**Guardiano `intro-118`** (`npm run intro-118`): soglia |osso più basso| ≤ 0,05 (a metà fra il contatto sano ±0,047 e il difetto 0,086+, misurato col braccio rosso 0,115); dopo il tuffo y = 0; z fra −12,1 e −11,2, |x| < 3,66; campioni insufficienti = rosso. Verde 3/3 formati; rosso (`__CPM_NO_G118`+`__CPM_NO_G118P`) atteso: portiere a 0,115-0,116 in tutti e tre.

## PO-322 Informativa privacy dentro l'app
Voce «🔒 Privacy → Informativa sulla privacy» in Opzioni (`SettingsScreen`, src/19): `<a href=PRIVACY_URL target="_blank" rel="noopener noreferrer">`, clic → `openPrivacy()` = `window.open(url,"_blank","noopener,noreferrer")`, lo stesso meccanismo di `openDonation` (src/07). URL: https://antoniovairo-rgb.github.io/Carrier-manager-/privacy.html. Tocco: minHeight 44 (misurato 298x44 · 350x44 · 698x44). Interruttore rosso `__CPM_NO_G118P`.
Nota: Opzioni è un overlay `position:fixed` con scroll proprio, non un figlio di `.cpm-scroll`, quindi `.cpm-piena` non si applica; `altezza-114` resta verde (opzioni: vuoto 14 px = 1,5% a 412x915).
Verificato nel guardiano per i 3 formati: voce presente, href esatto, target/rel, ≥ 44 px, clic = `window.open` con l'URL. **Non verificato qui**: l'uscita effettiva dalla WebView nella build Capacitor (si usa lo stesso meccanismo della donazione; da confermare sul dispositivo).

## Rituali (uno alla volta, `CPM_CI_PAR=0`)
intro-118 verde+rosso · flussi-115 verde 54/54 + rosso atteso · altezza-114 PASS (verde+rosso) · scena3d-96 VERDE 31/31, 0 errori · test:logic 43/43 · save-compat 12/12 · build-dist + validate-dist OK · check-src identico.
Prima passata di flussi-115 interrotta dal mio `timeout 590` (non un rosso): rifatta da capo senza tetto.
