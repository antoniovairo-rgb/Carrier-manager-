# Giro 360 — uno script di sola prova non è mai un guardiano del treno

Base: `lavoro/201` @ `db4da95e` (7.999.210 + vagone 355 + giro 358). Ramo di consegna: `sviluppo/giro360-finto`.
Non toccati: `GAME_VERSION`, `src/`, soglie.

## 1. Causa (misurata dai log pubblici)

Corsa del treno **45550618332** (trenino su `db4da95e`, 8 parti). Job «parte 06 di 8 (20 guardiani, ~68 min)» (id 138991027471),
riepilogo della parte (righe `CPM_PARTE330` del log, decodificate):

| guardiano | esito | s |
|---|---|---|
| intervista-231 · rosa-angoli-299 · scelte-201 · rigorista-257 | verde | 554 · 486 · 513 · 208 |
| **finto-358** | **tetto** | **4819** — «finto-358: parto e non finisco … fermato al bilancio della parte (4819 s)» |
| rilascio-312, trenino-317, interviste-183, salienti-229, difficolta-156, infortunio-263, procuratore-253, render-3d-023, impulsi-memoria-154, mister-215, backup-167, anteprima-212, rinvio-coppe-107, simulata-272, scene-190 | non partito | 0 — «bilancio della parte esaurito prima della partenza» |

Bilancio della parte 6600 s; il passo dei guardiani è durato 05:04:14 → 06:53:54. I 16 non giudicati sono finto-358 + i 15 dopo di lui.

Perché è stato scelto: il vagone del giro 358 cambia `tests/visual/package.json` solo negli script; la regola d del trenino
(`tools/trenino-317.mjs`, «package.json solo-script → gli script cambiati») gioca ogni script nuovo/cambiato, e il giro 358 ha aggiunto
due script: `treno-tempo-358` (guardiano vero) e `finto-358` (`node treno-tempo-358.mjs finto`: il guardiano finto che non finisce mai,
usato SOLO dentro `treno-tempo-358`, vedi RAPPORTO-giro358 §3). L'unico filtro era `FUORI = /^ci(:|$)/`.
Verificato col guardiano: `scegli` sul package.json di `db4da95` contro il suo primo genitore dà `["treno-tempo-358","finto-358"]`
col comportamento di prima.

## 2. Correzione (un punto solo)

`tools/trenino-317.mjs`: elenco **dichiarato** `PROVA_360 = ['finto-358']` e `fuoriTreno360(n)` (= `ci`/`ci:*` ∪ `PROVA_360`).
Lo usano tutti i filtri del trenino (scelta per script, per file, per ci-runner, elenco finale) e — importato da lì, nessuna copia —
il `piano` di `tests/visual/ci-treno-308.mjs` (anche un `CPM_TRENO_ELENCO` a mano non mette più uno script di prova in una parte).
Nessun guardiano vero tolto: nessuno dei 379 nomi di catene + mappa sta in `PROVA_360` (controllato dal guardiano).
Rosso: `CPM_NO_G360=1` = filtro di prima.

**Guardiano che si blocca nella stessa parte (dichiarato, non cambiato).** Oggi un guardiano riceve come tetto *tutto* il resto del
bilancio della parte (`corri(n, resto)`): se non finisce, chi viene dopo è «non partito». Col giro 358 il riepilogo progressivo
salva l'esito e il job non viene annullato, ma i guardiani dopo restano non giudicati (= rosso). Un tetto per guardiano tarato sulla
sua durata (es. k × `DURATE-GUARDIANI.json`) eviterebbe la cascata: **non fatto in questo giro** (cambia l'esecutore del treno e va
tarato contro i guardiani lenti del runner; da decidere col PO). Con la correzione di questo giro la causa di oggi non si ripresenta.

## 3. Guardiano (riga della macchina del treno: `trenino-317`, sezione H)

- caso vero: vagone del giro 358 (`db4da95^1` → `db4da95`) — `treno-tempo-358` scelto, `finto-358` escluso;
- elenco completo: ogni script npm con «finto» nel nome o che chiama `<x>.mjs finto` sta in `PROVA_360`;
- `fuoriTreno360` tiene i guardiani veri; nessun guardiano di catene/mappa è dichiarato di prova;
- `ci-treno-308 piano` con `CPM_TRENO_ELENCO="finto-358 tema-unico"` mette in parte solo `tema-unico`.

| braccio | esito |
|---|---|
| verde | uscita 0 (tutto il guardiano, sezioni A-H) |
| rosso `CPM_NO_G360=1` | uscita 1 — 3 controlli H falliti (finto-358 scelto, filtro, piano) |

⚠️ Il caso vero legge `db4da95` dalla storia: in una copia superficiale il controllo esce rosso dichiarando «NON GIUDICATO».

## 4. Banco (sessione cloud, dopo `git fetch --unshallow` e `npm install`)

| guardiano | esito | s |
|---|---|---|
| trenino-317 | verde (rosso CPM_NO_G360=1: rosso) | — |
| rilascio-312 | verde | — |
| treno-tempo-358 | verde | 164 |
| mappa-unica · deploy-326 · notte-333 | verde | 1 · 0 · 12 |
| interviste-183 · salienti-229 · procuratore-253 · infortunio-263 | verde | 290 · 203 · 88 · 90 |
| render-3d-023 · impulsi-memoria-154 · mister-215 · backup-167 | verde | 39 · 44 · 30 · 26 |
| anteprima-212 · rinvio-coppe-107 · simulata-272 · scene-190 | verde | 26 · 18 · 10 · 1 |
| difficolta-156 | **rosso** («CURVA FUORI BERSAGLIO») — già in `ROSSI-DICHIARATI.json` come «rosso identico alla base»: il treno lo classifica rosso noto, non blocca. Non toccato da questo giro (nessun file del gioco cambiato). |

Note d'ambiente: la prima corsa di `rilascio-312` era rossa per la copia superficiale (oggetto `234aa9f` mancante), verde dopo
`--unshallow`; la prima corsa dei guardiani di gioco era rossa per `node_modules` assenti (ERR_MODULE_NOT_FOUND), verde dopo
`npm install`. Nessuna delle due dipende dalla correzione.
