# CPM — Style Audit (Fase 1)

**Target reale:** `CARRIER-MANAGER-AV.html` (single-file; JSX dentro `<script type="text/babel">`).
Nel repo NON esistono `src/main.jsx` né `/mnt/user-data/outputs` — audit adattato al file reale (approvato dal PO).
**Metodo:** censimento fattuale con riferimenti a riga + conteggi `grep`. Nessuna proposta di soluzione.
**Versione al momento dell'audit:** `GAME_VERSION="7.72.2"`.

> Nota sui conteggi: i valori `#hex` includono anche DATI (colori sociali dei club `c/c2`, palette 3D) e SVG, non solo UI. Dove rilevante è segnalato.

---

## A) Meccanismo di styling

| Meccanismo | Occorrenze (grep) | Dove prevale |
|---|---|---|
| **`style={{…}}` inline** | **3243** | Ovunque — è il meccanismo dominante (~**97%**) |
| `className="…"` | 91 | Solo utility/animazioni: `cpm-num` (47, cifre tabellari), `kbd` (10), `cpm-press/rise/fade` (animazioni), `cpm-nav-*`/`cpm-scroll`/`cpm-root` (struttura) |
| CSS-in-JS (styled-components/emotion) | 0 | Assente |

- Le **classi CSS** vivono in un unico `<style>` nell'`<head>` (keyframe + utility come `.cpm-num`, `.cpm-press`, `.cpm-scroll`, nav). Non ci sono classi "di componente".
- Esiste già un **design-token layer** in testa al file (vedi §B/§C): `TH`/`TH_DARK` (colori) + `FS`/`FW`/`SP`/`RAD`/`MO` (scale). **Adozione parziale:** `TH.` è referenziato **1867** volte (colori ben tokenizzati), ma le scale numeriche quasi no — `FS.` 59 · `FW.` 87 · `SP.` 22 · `RAD.` 52. → **size/spacing/radius sono per lo più hardcoded inline**, i colori spesso sì-token spesso no.

---

## B) Colori

### Token ufficiali — LIGHT (`TH`, righe 266–298)
| Ruolo | Token | Hex |
|---|---|---|
| **Brand primario (bordeaux)** | `TH.primary` | **`#8e1f33`** (riga 270) |
| Brand scuro | `TH.primaryDk` | `#6a1326` (270) |
| Brand tint / bordo | `TH.primaryTint` / `primaryBorder` | `#f7e9ec` / `#e3c3cb` (289) |
| Success | `TH.success` | `#16a34a` (271) |
| Danger | `TH.danger` | `#dc2626` (271) |
| Warning | `TH.warning` | `#d97706` (271) |
| Gold | `TH.gold` / `goldText` | `#b45309` (272/291) |
| Accent (viola) | `TH.accent` | `#7c3aed` (272) |
| bg / card / bordo | `TH.bg` / `card` / `cardBorder` | `#f0f7ff` / `#ffffff` / `#dde6f0` (267–268) |
| testo / muted / faint | `TH.text` / `muted` / `faint` | `#1e293b` / `#64748b` / `#94a3b8` (269) |
| Superfici extra | `surface2/3`, `divider`, `track`, `scrim` | `#f4f7fb` / `#ffffff` / `#e6edf5` / `#e2e8f0` / `rgba(15,23,42,.45)` (284) |
| Semantici bg/bd/tx | `bgBlue/bdBlue/txBlue` … (blue/green/red/amber/purple) | righe 275–279 |
| Esito | `winFg/Bg/Bd`, `drawFg/Bg/Bd`, `lossFg/Bg/Bd` | righe 293–295 |
| Dominio | `growth/regression/energy/injury/suspension/record` | righe 296–297 |

### Token ufficiali — DARK (`TH_DARK`, righe 301–318)
Override di `bg #0f172a`, `card #1e293b`, `text #f1f5f9`, ecc. + varianti scure di tutti i semantici. Applicato **mutando `TH` in place** (vedi §F).

### Hardcoded inline — top 30 `#rrggbb` per frequenza (grep sull'intero file)
```
182 #f59e0b   172 #dc2626   147 #f5f5f5   109 #1d4ed8    85 #16a34a
 57 #7c3aed    51 #0f0f0f    43 #f87171    40 #fde68a    39 #4ade80
 36 #2563eb    34 #92400e    33 #ffffff    33 #93c5fd    32 #eff6ff
 29 #ef4444    29 #15803d    27 #f0fdf4    27 #bfdbfe    24 #f97316
 24 #d97706    23 #e2e8f0    23 #64748b    22 #fee2e2    22 #fca5a5
 20 #fef3c7    20 #3b82f6    19 #b45309    19 #1e40af    18 #f1f5f9
```
Osservazioni fattuali:
- **`#f59e0b` (182)** è il colore più usato in assoluto ed è **hardcoded** (non è un token con quel nome: `TH.warning`=`#d97706`, `TH.gold`=`#b45309`). Nel codice è l'"ambra/accento" (bottone `gold`, evidenziazioni, badge). Usato inline ~ovunque.
- **`#dc2626` (172)** = valore di `TH.danger` ma scritto a mano; **`#16a34a` (85)** = `TH.success` a mano; **`#7c3aed` (57)** = `TH.accent` a mano → **stessi colori semantici duplicati come literal invece del token**.
- **`#1d4ed8` (109)** / `#2563eb` (36) / `#3b82f6` (20) / `#eff6ff` (32) / `#bfdbfe` (27) = famiglia **blu "info"** hardcoded (usata per Nations Cup, europei, box informativi).
- **`#f5f5f5` (147)** è in larga parte **DATO** (colore kit `c2` dei club), non UI.
- Presenti più varianti dello stesso ruolo: rosso `#dc2626`/`#ef4444`/`#f87171`/`#b91c1c`; verde `#16a34a`/`#4ade80`/`#15803d`/`#166534`; ambra `#f59e0b`/`#d97706`/`#92400e`/`#fde68a`.

---

## C) Radius, shadow, spacing, tipografia

### Scale ufficiali (righe 322–326) — **definite ma poco consumate**
- `FS={caption:11,small:12,body:13,bodyLg:15,subhead:17,title:20,h:24,display:32,displayLg:44,hero:64}` (322)
- `FW={regular:400,medium:500,semibold:600,bold:700,black:800}` (323)
- `SP={xs:4,sm:8,md:12,lg:16,xl:20,xxl:24,xxxl:32}` (324) — griglia 4pt
- `RAD={xs:6,sm:8,md:12,lg:16,xl:20,pill:999}` (325)
- `MO={fast:120,base:200,slow:320,cine:550,easeStd/easeOut/easeIn}` (326)

### border-radius — 502 usi; valori inline (top)
```
113 :8   67 :10   37 :20   28 :6   26 :3   25 :4   25 :2   22 :12   17 :9   16 :7
```
- Valori **fuori scala** frequenti (`3`,`4`,`2`,`9`,`7`). Le primitive stesse hardcodano: `Card` borderRadius **14** (riga 6651), `Btn` **10** (6669), `Notif` **40** (6684) → non usano `RAD`.

### font-size — 1853 usi; valori inline (top)
```
642 :10   360 :11   197 :12   99 :13   66 :9   63 :8   53 :14   42 :20   36 :15   31 :18   31 :16   30 :22
```
- **`fontSize:10` (642)** e `:9`/`:8` sono i più diffusi ma **sotto il floor `FS.caption`=11** → l'UI vive per lo più a 8–12px con valori non nella scala.

### font-weight — 875 usi. letter-spacing — 346 usi; valori (top)
```
letterSpacing: 129 :1.5   81 :1   47 :2   13 :3   12 :1.2   10 :0.5   6 :.3   5 :.5
```
- **Nessuna regola unica**: gli header uppercase usano tracking `1`, `1.5`, `2`, `3` in modo intercambiabile (conferma la nota del PO «alcuni header tracking largo, altri no»).

### box-shadow — 52 usi
- Via token (`TH.shadow`/`el1/el2/el3`): **11**. Inline `rgba(…)`: **27**. → ombre in prevalenza ad-hoc.

---

## D) Pattern di card/box (per similarità)

Il componente **`Card`** (riga 6647) è la primitiva ufficiale ed è **usato 222 volte** — buona adozione. Firma: `radius 14` fisso, `padding` per densità (`tight 10/12` · default `16/18` · `loose 20/22`, riga 6650), `bg/border` da `TH` o `tone` (`_CARD_TONE`), ombra `TH.shadow`/`el1-3`.

Varianti che fanno "una card" in modi diversi coesistono:
1. **`<Card>`** ufficiale (222 usi).
2. **`<div>` con stile-card inline**: `background:TH.card/surface2` + `border:1px solid …` + `borderRadius:8/10/12` + `padding` — pattern ripetuto a mano in molti box (deducibile dai 113 `borderRadius:8` + 502 radius totali su 222 Card).
3. **Box semantici colorati inline**: `background:"#eff6ff"`/`"#f0fdf4"`/`"#fef3c7"` + bordo coordinato, scritti a mano invece di `Card tone=…` o dei token `bg*/bd*` (righe 275–279). Es. i box blu Nations/Europa, verdi success, ambra warning.
4. **Card "hero"/gradient**: header giocatore, walkout, gala — gradienti bordeaux/competizione hardcoded.

→ Stesso scopo (contenitore) con radius (8/10/12/14/20), padding e sorgente-colore (token vs literal) non uniformi.

---

## E) Tab, header di sezione, bottoni — componente riusato o duplicato?

| Primitiva | Riga def | Usi `<Comp` | Stato |
|---|---|---|---|
| `Card` | 6647 | **222** | Riusata (bene) |
| `Btn` | 6657 | **106** | Riusata (bene) |
| `Badge` | 6724 | 8 | Poco usata |
| `StatBar` | 6673 | 2 | Quasi inutilizzata |
| `Meter` | 6740 | 2 | Quasi inutilizzata |
| `SectionHeader` | 6710 | **2** | Quasi inutilizzata |
| `Tabs` | 6814 | **0** | Mai usata |
| `Modal` | 6787 | **0** | Mai usata |
| `DataTable` | 6828 | **0** | Mai usata |
| `KpiTile` | 6753 | **0** | Mai usata |

- **Header di sezione:** `SectionHeader` esiste ma è usato 2 volte; ci sono **252** occorrenze di `textTransform:"uppercase"` (il "look" header) fatte a mano inline con tracking/colori variabili → header di sezione **duplicati**, non componentizzati.
- **Tab:** `Tabs` (6814) **mai** usata. La barra di navigazione e i sotto-tab (dashboard/stagione/club/carriera/agente; sotto-tab Classifica/Calendario/Coppe) sono **costruiti a mano** (classi `cpm-nav-bar`/`cpm-nav-tabs` + stile inline).
- **Modali:** `Modal` (6787) **mai** usata; i popup (es. **Coppa delle Nazioni** ~riga 22839, rinnovo, intervista) sono **overlay inline** costruiti a mano (`position:fixed` + `zIndex:9999` + card centrata/bottom-sheet).
- **Bottoni / CTA:** `Btn` (6657) è riusato, ma le **varianti** confondono la gerarchia: `primary` (bordeaux `TH.primary`), **`green`** (`TH.success`), **`gold`** (gradiente `#f59e0b→#d97706`), `secondary`, `success` (verde chiaro), `danger`, `ghost` (righe 6658–6666). `primary`, `green` e `gold` sono tutti leggibili come "CTA principale" → conferma «verde e rosso/oro usati entrambi come primario». Dentro `Btn` ci sono anche **hex hardcoded** (`#dcfce7`,`#bbf7d0`,`#fee2e2`,`#fecaca`,`#f59e0b`,`#d97706`) invece dei token esistenti.

---

## F) Schermate/Tab principali e stile dominante (light/dark) attuale

**Tema = toggle globale utente**, non per-superficie: `darkMode` (state, riga **18484**, persistito `cpm-dark`) → `Object.assign(TH, darkMode?TH_DARK:TH_LIGHT_ORIG)` (riga **18486**) muta `TH` in place per tutta l'app. Default = **LIGHT** (`TH.bg=#f0f7ff`, riga 267).

Router `App` (righe 27316–27322):

| Fase / Schermata | Componente | Superficie attuale |
|---|---|---|
| `loading` | inline (27316) | segue `TH` (light/dark globale) |
| `home` | `HomeScreen` (27317) | segue `TH` |
| `create` | `CreateScreen` (27318) | segue `TH` |
| `cinematic` | `IntroCinematic` (27319) | **DARK hardcoded** (scena Three notturna, indipendente dal toggle) |
| `trial` | `TrialFlow` (27320) | segue `TH` (il 3D del match interno è dark) |
| `offers` | `OffersScreen` (27321) | segue `TH` |
| `career` | `CareerApp` (27322) | segue `TH` |

Dentro `CareerApp` (tab, conteggi `tab===`): `dashboard` (42), `standings` (5), `calendar` (2), `coppe` (3), `club` (1), `training` (1), `nazionale` (2), `agente` (1), `profile` (3). → tutti seguono `TH` (light di default), tranne le superfici cinematiche montate al loro interno:
- **Match view / `LiveMatch`**: contenitore **`background:"#050810"`** hardcoded (righe 10508–10509, 13811, 14449) + HUD scuro — **DARK sempre**, indipendente dal toggle. Il canvas Three usa `setClearColor(0x050810)`.
- **Gala / premi (`GalaStage3D`)** e **intervista (`InterviewStage3D`)**: scene Three **dark** dedicate.

→ Oggi la dicotomia "content light / cinematic dark" **esiste di fatto** ma è ottenuta con **due meccanismi scollegati**: (a) un toggle globale `TH` light↔dark per i contenuti, (b) superfici cinematiche con **dark hardcoded** (`#050810`) fuori dal sistema di token. Non c'è un concetto di "superficie light" vs "superficie dark" selezionabile per-schermata dentro i token.

---

## Sintesi fattuale (senza proposte)
1. Styling ~97% **inline** `style={{}}`; classi CSS solo utility/animazioni.
2. Esiste già un token layer completo (`TH`/`TH_DARK` + `FS/FW/SP/RAD/MO`), ma **le scale numeriche e molti colori semantici sono duplicati come literal** (`#f59e0b` 182, `#dc2626` 172, `#16a34a` 85, `#7c3aed` 57 …).
3. Brand bordeaux = **`#8e1f33`** (`TH.primary`, riga 270).
4. Radius/font-size/letter-spacing **fuori scala** e non uniformi (radius 2–20 misti; fontSize per lo più 8–12 sotto il floor 11; letter-spacing 0.5–3 intercambiabili).
5. Primitive ricche presenti ma **quasi inutilizzate** (`Tabs/Modal/DataTable/KpiTile` = 0 usi; `SectionHeader` 2). Header (252 uppercase inline), tab, modali, tabelle → **fatti a mano**.
6. CTA: `primary`/`green`/`gold` tutte "primarie" → **gerarchia ambigua**; `Btn` contiene hex hardcoded.
7. Tema = **toggle globale** `TH` (18484/18486); cinematica (`#050810`, righe 10508+) è **dark hardcoded** fuori dai token.

---

**STOP — Fase 1 completata.** In attesa di "ok" per procedere alla **Fase 2 (theme.js / TOKENS)**.
