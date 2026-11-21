#!/usr/bin/env node
/* [giro 308 PO-517/527/528] DURATE MISURATE dei guardiani → docs/governo/DURATE-GUARDIANI.json
   Tre fonti, ognuna citata voce per voce:
     banco   — docs/governo/STABILITA.json (giri di ci-runner.mjs sul banco cloud): mediana dei passi verdi o rossi con s > 0
     runner  — docs/governo/misure/runner-44830113928.json (taratura 198 su GitHub Actions + corse del giro 303)
     rapporti— RAPPORTO-giro293…307 e VERIFICA198-* letti dai loro rami (git show), estrazione automatica: una riga che
               nomina UN solo guardiano e porta una durata («123 s», «12 min»); «rc 124»/«tetto» = fermato al tetto
   La durata usata per tagliare le parti e' la piu' recente: mediana dei rapporti; se manca, quella del runner (che sul banco
   vale circa 1:1, RAPPORTO-giro303 §2); se manca, la mediana del banco; se manca tutto: «stimata» a 300 s.
   Uso: node tools/durate-guardiani-308.mjs   (serve `git fetch` dei rami sviluppo/giro29x-30x e sviluppo/verifica198-*) */
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import { spawnSync } from 'node:child_process';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const git = (...a) => spawnSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 });
const med = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y), k = s.length >> 1; return s.length % 2 ? s[k] : Math.round((s[k - 1] + s[k]) / 2); };
/* nomi: CATENE + MAPPA (sabbiera) */
const L = fs.readFileSync(path.join(ROOT, 'tests/visual/ci-runner.mjs'), 'utf8').split('\n');
const a = L.findIndex(l => l.startsWith('const CATENE = {')), m = L.findIndex(l => l.startsWith('const MAPPA = [')), z = L.findIndex((l, i) => i > m && l.startsWith('];'));
const ctx = {}; vm.createContext(ctx); vm.runInContext(L.slice(a, z + 1).join('\n').replace('const CATENE', 'var CATENE').replace('const MAPPA', 'var MAPPA'), ctx);
const script = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests/visual/package.json'), 'utf8')).scripts;
const nomi = [...new Set([...Object.values(ctx.CATENE).flat(), ...ctx.MAPPA.flatMap(r => r[1])])].filter(n => script[n]).sort();
const set = new Set(Object.keys(script));
/* banco */
const banco = {}; for (const g of JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/governo/STABILITA.json'), 'utf8'))) for (const p of g.passi || []) if (p.s > 0 && !p.gia_verde) (banco[p.passo] ||= []).push(p.s);
/* runner */
const runner = {};/* [taratura 308] tutte le corse trascritte in docs/governo/misure/runner-*.json */
for (const f of fs.readdirSync(path.join(ROOT, 'docs/governo/misure')).filter(f => /^runner-\d+\.json$/.test(f))) {
  const R = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/governo/misure', f), 'utf8'));
  for (const [n, s] of Object.entries(R.durate_s || {})) (runner[n] ||= []).push(s); for (const [n, l] of Object.entries(R.giro303_s || {})) (runner[n] ||= []).push(...l); }
/* rapporti */
const rami = git('branch', '-r').stdout.split('\n').map(s => s.trim()).filter(b => /^origin\/(sviluppo\/(giro(29[3-9]|30[0-7])|verifica198)|prova-ci\/giro303)/.test(b));
const rap = {}, tetto = {}, fonti = [];
for (const b of rami) for (const f of git('ls-tree', '-r', '--name-only', b, '--', 'docs/sviluppo').stdout.split('\n').filter(f => /RAPPORTO-giro(29[3-9]|30[0-7])|VERIFICA198/.test(f))) {
  const nomeF = path.basename(f); if (fonti.includes(nomeF)) continue; fonti.push(nomeF);
  for (const riga of git('show', `${b}:${f}`).stdout.split('\n')) {
    const qui = [...new Set((riga.match(/[a-z][a-z0-9:]*(?:-[a-z0-9]+)+|test:logic/g) || []).filter(n => set.has(n)))]; if (qui.length !== 1) continue;
    const n = qui[0];
    if (/rc 124|tetto dei 30 minuti|fermato al tetto/.test(riga)) { (tetto[n] ||= []).push(nomeF); continue; }
    const d = [...riga.matchAll(/\b(\d+(?:[.,]\d+)?)\s?(s|min)\b/g)].map(x => Math.round(parseFloat(x[1].replace(',', '.')) * (x[2] === 'min' ? 60 : 1))).filter(x => x >= 1 && x < 6 * 3600);
    if (d.length) (rap[n] ||= []).push({ s: d[0], fonte: nomeF });
  }
}
const voci = {};
for (const n of nomi) {
  const b = banco[n] || [], r = runner[n] || [], p = (rap[n] || []).map(x => x.s);
  /* piu' recente prima: i rapporti sono del 19-21/11, il runner del 20/11, STABILITA.json per lo piu' di ottobre (versioni vecchie dei
     guardiani: corpi-073 1935 s sul banco di ottobre, 433 s nei rapporti del 20/11). Un valore del runner sotto 5 s e' un guardiano
     caduto all'avvio (avvio-233: 1 s), non una durata. */
  const r5 = r.filter(x => x >= 5);
  let s, fonte; if (p.length) { s = med(p); fonte = 'rapporti'; } else if (r5.length) { s = med(r5); fonte = 'runner'; } else if (b.length) { s = med(b); fonte = 'banco'; } else { s = 300; fonte = 'stimata'; }
  if (tetto[n] && s < 1800) { s = 1800; fonte += '+tetto'; }
  voci[n] = { s, fonte, banco: b.length ? { mediana: med(b), n: b.length } : undefined, runner: r.length ? r : undefined,
    rapporti: p.length ? { mediana: med(p), n: p.length, da: [...new Set(rap[n].map(x => x.fonte))] } : undefined, tetto30: tetto[n] };
}
const oltre30 = Object.entries(voci).filter(([, v]) => v.s >= 1800 || (v.runner || []).some(x => x >= 1800) || v.tetto30).map(([n, v]) => ({ n, s: v.s, runner_max: v.runner ? Math.max(...v.runner) : null, fonte: v.fonte })).sort((x, y) => y.s - x.s);
const out = { _: 'giro 308: durata di ogni guardiano (secondi). `s` = valore usato dal taglio in parti (ci-parti-303.mjs); `fonte` (in ordine di precedenza, la piu\' recente prima) = rapporti (mediana delle durate scritte nei rapporti dei giri 293-307 e delle verifiche 198, 19-21/11) | runner (taratura 44830113928 + giro 303, 20/11) | banco (mediana di STABILITA.json, giri 10-11/2026) | stimata (nessuna misura: 300 s). «+tetto» = un rapporto dice che e\' stato fermato al tetto dei 30 minuti. Rigenerare: node tools/durate-guardiani-308.mjs',
  generato: new Date().toISOString().slice(0, 16), fonti_rapporti: fonti.sort(), totale: { guardiani: nomi.length, somma_s: Object.values(voci).reduce((a, v) => a + v.s, 0), per_fonte: Object.values(voci).reduce((o, v) => (o[v.fonte] = (o[v.fonte] || 0) + 1, o), {}) },
  oltre_30_minuti: oltre30, voci };
fs.writeFileSync(path.join(ROOT, 'docs/governo/DURATE-GUARDIANI.json'), JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify(out.totale), '\noltre 30 min:', oltre30.map(o => `${o.n} ${o.s}`).join(' · '));
