# PRONTEZZA alla pubblicazione (rilascio/consolidamento)

Aggiornato: 2026-10-10. Sessione rilascio CPM. Base: origin/poc/marioprada-character-system (ec8f073).

_Il rapporto cresce punto per punto; ogni voce dichiara misura, file:riga e frequenza._

## 1. Copyright / de-branding — `node tools/audit-copyright.mjs`

**Esito del gate: 0 riferimenti (EXIT 0, «✅ OK»).** Log: `docs/rilascio/copyright-raw.txt`. Build di riferimento: worktree `/tmp/cpm` su `origin/poc/marioprada-character-system` (ec8f073), build `CPM_FORZA_BUILD=1 node tools/build-src.mjs` → 56.511 righe.

⚠️ **Il gate passa, ma un controllo indipendente trova riferimenti reali che la blocklist non copre.** La blocklist (`_CR_BRANDS` / `_CR_PLAYERS`, `src/09-audio-scout-anagrafiche.jsx:915-921`) cerca nomi COMPLETI (es. «Juventus», «Bundesliga», «Serie A»). Non cerca slug, nomignoli né nomi di derby. Riferimenti trovati con `grep` (file:riga):

| Tipo | Esempi (file:riga) | Gravità proposta |
|---|---|---|
| Derby con nome di rivalità reale | `src/08-panchina-derby-meteo-cori.jsx:116` «Derby d'Italia» (juve-inter) · `:117` «Derby di Milano» · `:118` «Derby della Capitale» · `:120` «Derby del Sole» | da discutere (BLOCCANTE per un rilascio «de-branded») |
| Slug di club reali come ID interni | `src/02-club-leghe-albo.jsx:27-31` `inter`, `milan`, `napoli`, `lazio` · `:102` `psg` · `src/05-cronaca-stadi-formazioni.jsx:458-485` `juve`, `inter`, `milan`, `roma`, `lazio`, `psg`, `marse`, `bvb`, `bay` | probabile visibile solo se il slug finisce a schermo — **da verificare** |
| Nomignoli reali di club | `src/02-club-leghe-albo.jsx:27` «FC Nerazzurri» · `:28` «AC Rossoneri» · `:31` «FC Biancoceleste» · `:29` «FC Partenope» · `:102` «FC Paris» | da discutere (nomignolo = riferimento riconoscibile) |
| Stadi con nome di città reale | `src/05-cronaca-stadi-formazioni.jsx:458-474` «Stadio Sabaudo», «Stadio Meneghino», «Stadio Vesuvio», «Stadio Capitolino», «Parc Royal», «Stade Phocéen» | estetico/da verificare |
| Commenti con nomi reali | molte righe `src/07-versione-save-interviste.jsx` (es. `:317` «Inter», `:746` nota Serie B) | nessuno (solo commenti, non visibili) |

**Non posso confermare** che i slug e i nomignoli compaiano a schermo: serve la verifica di quali stringhe escono nel DOM (lavoro del team, non fatto qui). Il rapporto non ritocca nulla.

**Frequenza:** conteggio per grep su `src/*.jsx` (righe che contengono uno dei termini): 02=9, 05=5, 07=28, 08=10, 12=94 (slug/testo 3D), 15=50 (inclusi commenti). Il conteggio include commenti: non è il numero di riferimenti visibili.

## 2. Build offline — `node tools/build-dist.mjs` + `node tools/validate-dist.mjs`

- **Build:** `dist/index.html` 5.934 KB da sorgente 6.879 KB · CDN residui: nessuno · Babel-in-browser: rimosso · tempo 9,1 s · EXIT 0. Log: `docs/rilascio/build-dist.log`.
- **Validazione (offline bloccante):** React montato ✅ · home raggiunta (5 bottoni, «Nuova carriera» presente) ✅ · richieste esterne tentate: **nessuna** ✅ · errori console: **nessuno** ✅ · flag store (feature AI off) attivo ✅ · **EXIT 0**. Log: `docs/rilascio/validate-dist.log`.
- Prerequisiti: `npm install` in `tests/visual` (node_modules non presenti nel worktree; eseguito, EXIT 0).

Esito punti 1–2: **verde**. Il punto 1 ha però una riserva di copertura del gate (vedi tabella).

