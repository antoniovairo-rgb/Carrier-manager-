#!/usr/bin/env node
/* [giro 433 · PO-687] GUARDIANO pelle-scura-433: la carnagione «scura» non resta piu' chiara del ritratto, e le altre non si muovono.
   Misura (misura-433.mjs, testimone del giro 240 misuraPelle240 con raggio 0,18, GLB acceso, ingresso in campo, ora congelata — default
   notte, CPM_TOD=dusk|day per le altre): i ventidue corpi della fila prendono a turno la pelle di volti dell'indice scelti per carnagione
   (deterministico, GIRI giri da 8 scure + 5 ambrate + 4 olivastre + 5 chiare). Per ogni viso: la grandezza di pelle-240 (centro del
   viso, CIE76) e la pelle dell'INTERO viso (mediana di L* sui pixel color pelle, 3D contro ritratto).
   Due bracci nello stesso comando, sugli STESSI volti: verde (gioco) e rosso (window.__CPM_NO_G433 = la tinta del giro 240).
   Verde:
     · ECCESSO delle scure = mediana ΔL*(viso intero) delle scure − mediana delle chiare <= ECCESSO_MAX (2,5 L*). Misurato prima del giro:
       +5,1 notte · +4,8 tramonto · +4,9 giorno; dopo: −0,5 di notte.
     · nessuna scura oltre la soglia di pelle-240 (CIE76 <= 12): la correzione non deve scurire oltre il ritratto.
     · le altre carnagioni NON si muovono: per ambrata, olivastra e chiara la mediana di |L*3D verde − L*3D rosso| sullo stesso volto
       <= FERMO_MAX (1,0 L*, il rumore fra due giri: la fila respira) — mentre le scure si spostano di almeno SPOSTA_MIN (3 L*).
   Rosso: l'eccesso delle scure > ECCESSO_MAX (il difetto si vede). «Non giudicato» = rosso: meno di N_MIN visi per classe giudicata.
   Soglie fissate dopo la misura, mai da abbassare. Uso: node pelle-scura-433.mjs · CPM_GIRI=4 · CPM_SOLO=verde|rosso
   GIRI 4 e non 3: misurato sui dati «prima» del giro, l'eccesso delle scure con 2-3 giri oscilla fra 2,5 e 3,3 (campione piccolo: il rosso
   finiva sul filo della soglia), con 4 giri sta a 4,8-4,9 in tutte e tre le ore, con 8 a 4,7-5,1. Due pagine per braccio in entrambi i casi. */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { braccio433, stampa } from './misura-433.mjs';
import fs from 'node:fs';
const GIRI = +(process.env.CPM_GIRI || 4), TOD = process.env.CPM_TOD || 'night', SOLO = (process.env.CPM_SOLO || 'verde,rosso').split(',');
const ECCESSO_MAX = 2.5, FERMO_MAX = 1.0, SPOSTA_MIN = 3, DE_PELLE = 12, N_MIN = { s: 12, c: 8, a: 8, o: 6 };
const med = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[s.length >> 1] : null; };
fs.mkdirSync('out/g433', { recursive: true });
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const out = {}; const g = [];
for (const [nome, rosso] of [['verde', false], ['rosso', true]]) { if (!SOLO.includes(nome)) continue; const R = await braccio433(b, port, rosso, GIRI, false); out[nome] = R;
  if (R.errore) { g.push(`${nome}: non giudicato — ${R.errore}`); continue; } R.righe.forEach(m => delete m.foto);
  R.eccesso = (R.tab.s.dLvisoMed != null && R.tab.c.dLvisoMed != null) ? +(R.tab.s.dLvisoMed - R.tab.c.dLvisoMed).toFixed(1) : null;
  stampa(`${nome.toUpperCase()} (ora ${TOD}, visi ${R.righe.length}) · eccesso delle scure sulle chiare ${R.eccesso} L*`, R.tab);
  for (const k of ['s', 'c']) if (!(R.tab[k].n >= N_MIN[k])) g.push(`${nome}: non giudicato — visi ${k} misurati ${R.tab[k].n} < ${N_MIN[k]}`);
  if ((R.err || []).length) g.push(`${nome}: errori di pagina ${JSON.stringify(R.err.slice(0, 3))}`); }
await b.close(); srv.close();
fs.writeFileSync(`out/g433/pelle-scura-433-${TOD}.json`, JSON.stringify(out, null, 1));
const V = out.verde, Ro = out.rosso;
if (V && !V.errore) { if (!(V.eccesso != null && V.eccesso <= ECCESSO_MAX)) g.push(`verde: eccesso delle scure ${V.eccesso} > ${ECCESSO_MAX} L*`);
  const ko = V.righe.filter(x => x.k === 's' && !(x.dE240 <= DE_PELLE)); if (ko.length) g.push(`verde: scure oltre la soglia di pelle-240: ${ko.map(x => `volto ${x.n} ${x.dE240}`).join(', ')}`); }
if (Ro && !Ro.errore && !(Ro.eccesso != null && Ro.eccesso > ECCESSO_MAX)) g.push(`rosso: il difetto non si vede (eccesso ${Ro.eccesso} <= ${ECCESSO_MAX})`);
if (V && Ro && !V.errore && !Ro.errore) { const m = new Map(Ro.righe.map(r => [r.n, r]));
  for (const k of ['s', 'a', 'o', 'c']) { const d = V.righe.filter(r => r.k === k && r.Lviso3D != null && m.get(r.n) && m.get(r.n).Lviso3D != null).map(r => r.Lviso3D - m.get(r.n).Lviso3D);
    if (!(d.length >= N_MIN[k])) { g.push(`verde contro rosso · ${k}: non giudicato — coppie ${d.length} < ${N_MIN[k]}`); continue; }
    const x = med(d), ax = med(d.map(Math.abs)); console.log(`  spostamento verde−rosso · ${k}: L*3D mediana ${x.toFixed(2)} · |mediana| ${ax.toFixed(2)} (coppie ${d.length})`);
    if (k === 's') { if (!(x <= -SPOSTA_MIN)) g.push(`le scure non si sono scurite: ${x.toFixed(2)} > −${SPOSTA_MIN}`); }
    else if (!(ax <= FERMO_MAX)) g.push(`la carnagione ${k} si e' mossa: |ΔL*| mediana ${ax.toFixed(2)} > ${FERMO_MAX}`); } }
else if (SOLO.length === 2) g.push('confronto verde/rosso non giudicato');
if (g.length) { console.log('❌ pelle-scura-433'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ pelle-scura-433 verde (e il rosso si vede)');
