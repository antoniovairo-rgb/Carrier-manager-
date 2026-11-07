# Rapporto giro 113 — PO-318 «cambio Tab del menù → la posizione si azzera su»

Lotto 7.999.183 dedicato, ramo `sviluppo/giro113-scorri` (base lavoro/183 = 7.999.182). GAME_VERSION non toccata.

## Causa misurata
A scorrere è **solo `.cpm-scroll`** (la finestra resta sempre a 0, colonna «win»). `goTab` (src/18) faceva `setTab/setScreen` senza toccare lo scorrimento: sul cambio di scheda del menù la posizione restava dov'era (o veniva solo clampata dalla nuova altezza).

## Correzione
Un solo punto, `React.useLayoutEffect` sul cambio di `screen` in `CareerApp` (copre barra, sottoschede, ripresa `cpm-active-tab`, ritorno da partita): `.cpm-scroll.scrollTo({top:0,behavior:'instant'})`. Con le sottoschede (Stagione/Carriera, componente `Tabs` che chiama `goTab`) la parte sotto riparte dalla loro cima: le sottoschede (`.cpm-tabs40`) vengono portate in vista, mai nascoste. Ripetere il tocco sulla scheda già attiva: nessun cambio di `screen`, scorre solo come sopra senza altri effetti. Barra e grafica non toccate. Interruttore rosso `__CPM_NO_G113` (= comportamento 182). Guardiano: `npm run scorri-113` (attese a evento: scheda attiva + 2 fotogrammi; braccio e motivo per ultimi).

## Misura prima (rosso `__CPM_NO_G113`) / dopo (verde) — scrollTop di `.cpm-scroll` dopo il cambio, partendo da scorso in basso


### t360

| Cambio | prima | dopo |
|---|---|---|
| menù «Stagione»→«Home» | 590 | 0 |
| menù «Club»→«Stagione» | 579 | 0 |
| menù «Carriera»→«Club» | 579 | 0 |
| menù «Agente»→«Carriera» | 876 | 0 |
| menù «Ufficio»→«Agente» | 876 | 0 |
| menù «Home»→«Ufficio» | 900 | 0 |
| sotto stagione/Calendario (tabs a px dalla cima) | 0 (178) | 0 (178) |
| sotto stagione/Coppe (tabs a px dalla cima) | 0 (178) | 0 (178) |
| sotto stagione/Classifica (tabs a px dalla cima) | 31 (143) | 31 (143) |
| sotto carriera/Nazionale (tabs a px dalla cima) | 0 (116) | 0 (116) |
| sotto carriera/Profilo (tabs a px dalla cima) | 0 (116) | 0 (116) |

### t412

| Cambio | prima | dopo |
|---|---|---|
| menù «Stagione»→«Home» | 488 | 0 |
| menù «Club»→«Stagione» | 391 | 0 |
| menù «Carriera»→«Club» | 391 | 0 |
| menù «Agente»→«Carriera» | 726 | 0 |
| menù «Ufficio»→«Agente» | 689 | 0 |
| menù «Home»→«Ufficio» | 689 | 0 |
| sotto stagione/Calendario (tabs a px dalla cima) | 0 (178) | 0 (178) |
| sotto stagione/Coppe (tabs a px dalla cima) | 0 (178) | 0 (178) |
| sotto stagione/Classifica (tabs a px dalla cima) | 0 (178) | 0 (178) |
| sotto carriera/Nazionale (tabs a px dalla cima) | 0 (116) | 0 (116) |
| sotto carriera/Profilo (tabs a px dalla cima) | 0 (116) | 0 (116) |

### pc

| Cambio | prima | dopo |
|---|---|---|
| menù «Stagione»→«Home» | 364 | 0 |
| menù «Club»→«Stagione» | 244 | 0 |
| menù «Carriera»→«Club» | 244 | 0 |
| menù «Agente»→«Carriera» | 528 | 0 |
| menù «Ufficio»→«Agente» | 179 | 0 |
| menù «Home»→«Ufficio» | 179 | 0 |
| sotto stagione/Calendario (tabs a px dalla cima) | 0 (185) | 0 (185) |
| sotto stagione/Coppe (tabs a px dalla cima) | 0 (185) | 0 (185) |
| sotto stagione/Classifica (tabs a px dalla cima) | 0 (185) | 0 (185) |
| sotto carriera/Nazionale (tabs a px dalla cima) | 0 (123) | 0 (123) |
| sotto carriera/Profilo (tabs a px dalla cima) | 84 (29) | 84 (29) |

Nota: nelle sottoschede la «prima» era già spesso a 0 (il contenuto della sottoscheda si rimonta); il caso residuo (es. Profilo su PC 84→84, Classifica a 360 31→31) restava com'era e ora è governato dallo stesso punto, con le sottoschede sempre visibili. Finestra (`window.scrollY`) = 0 in ogni misura.

## Catena rigiocata (una alla volta, `CPM_CI_PAR=0`, `free -m`/`df -h` registrati prima di ognuna: ~13,4–14,5 GB liberi, 29 GB di disco)
scorri-113 ✅ (verde 0 difetti · rosso 18) · collaudo-110 ✅ · lineetta-181 ✅ · pc-tablet-292 ✅ · griglia-mobile ✅ · formazioni-204 ✅ · career-critical ✅ · test:logic ✅ · save-compat ✅ (12/12) · validate-situations ✅ PASS 14/14 (fingerprint 00001505, 0 failure). `build-src`/`check-src`: IDENTICO BYTE PER BYTE.

## Scelte prudenti
- Il guardiano parte da una scheda diversa, scorsa in basso (≤900 px), e giudica solo le destinazioni con >150 px di scorrimento disponibile; «nessuna scheda alta» = rosso (non giudicato).
- Criterio sottoschede: le sottoschede devono stare nella metà alta dell'area scorrevole (visibili) e non essere scese dopo il cambio.
- Fuori ambito: barra, grafica, GAME_VERSION, roadmap (da fare alla promozione del lotto).
