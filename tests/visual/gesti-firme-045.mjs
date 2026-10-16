#!/usr/bin/env node
/* [giro 45 PO-068] CENSIMENTO DELLE FIRME DEI GESTI, GLB ACCESO (direttiva PO 29/07: le pose procedurali sono invisibili sotto il
   personaggio, parlano solo le CLIP). Per ogni variante della tabella GESTI si forza una scheda del catalogo che la produce (deriveHL),
   si risolve con esito riuscito e si legge dal testimone __CPM_GST quale clip VERA monta l'eroe (campo `cn`, solo __CPM_REC).
   Poi, per ogni clip vista: contatto e piede in CONTATTO_CLIP (hook __CPM_GESTI_CLIP045). Infine le varianti di una stessa famiglia
   con la STESSA firma (clip viste + profilo del volo + ramo proprio di traiettoria/posa nel sorgente) sono dichiarate indistinguibili.
   Non e' un guardiano: stampa il censimento e scrive out/gesti-firme-045.json. Uso: node gesti-firme-045.mjs [CPM_SOLO=shot,cross] */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const DIR = path.dirname(fileURLToPath(import.meta.url));
const SRC12 = fs.readFileSync(path.join(DIR, '../../src/12-three-match-view.jsx'), 'utf8').split('\n');
const SOLO = (process.env.CPM_SOLO || '').split(',').filter(Boolean);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
/* UNA PAGINA NUOVA PER SCENA (lezione 7.483, misurata qui: sulla stessa pagina pass_ground/pass_lofted/one_two/cross_far_post non
   montavano nessuna clip; su pagina nuova pass_ground monta shortPass:pass per 18 fotogrammi). */
const apri = async () => { const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(() => { window.__CPM_GLB = true; window.__CPM_REC = 1; window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; });
  await openMatch(page, port, { skipLoadAll: true, name: 'Firme 045' }); await sleep(1500);
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0 && window.__CPM_GESTI_CLIP045 && window.__CPM_GESTI_CLIP045(), null, { timeout: 120000 }).catch(() => {}); return page; };
let page = await apri();
const INFO = await page.evaluate(() => window.__CPM_GESTI_CLIP045 && window.__CPM_GESTI_CLIP045());
const CASI = await page.evaluate(() => { const G = window.__CPM_GESTI(); const out = {};
  for (let gi = 0; gi < SITUATIONS.length; gi++) { const s = SITUATIONS[gi]; const A = s.actions || [];
    for (let k = 0; k < A.length; k++) { let hl = null; try { hl = deriveHL(s, A[k]); } catch (e) { continue; } if (!hl || !hl.type || !G[hl.type]) continue;
      const vv = (hl.type === 'tackle' && A[k].defGesto) ? A[k].defGesto : hl.variant; const key = hl.type + '/' + (vv && G[hl.type][vv] ? vv : 'base');
      (out[key] = out[key] || []).push({ gi, k, label: A[k].label, pre: hl.pre || null }); } }
  const sel = {}; for (const key in out) { const L = out[key]; sel[key] = [L[0], L[Math.floor(L.length / 2)]].filter((x, i, a) => a.findIndex(y => y.gi === x.gi && y.k === x.k) === i); }
  return { sel, G }; });
const G = CASI.G; const RIS = {};
for (const key of Object.keys(CASI.sel).sort()) {
  if (SOLO.length && !SOLO.some(f => key.startsWith(f + '/'))) continue;
  RIS[key] = { casi: [], clip: {} };
  for (const c of CASI.sel[key].slice(0, +(process.env.CPM_CASI || 1))) {
    if (page._usata) { await page.close(); page = await apri(); } page._usata = true;
    await page.evaluate(gi => { window.__CPM_P1B2 = null; window.__CPM_FORCE_SIT(gi, false); window.__CPM_FROZEN = false; }, c.gi);
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
    await sleep(600);
    await page.evaluate(k => { window.__CPM_P1B2 = []; window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(k); }, c.k);
    const t0 = Date.now();
    while (Date.now() - t0 < 25000) { await sleep(400); const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (!/^hl_/.test(ph || '')) break; }
    /* testimone per FOTOGRAMMA (__CPM_P1B2: gesto, clip, frazione, distanza piede sx/dx dal pallone): niente campionamento a orologio */
    const visti = await page.evaluate(() => { const V = {}; for (const r of (window.__CPM_P1B2 || [])) { if (/^(lift|celebrate|trip|fallen|standUp|miss)$/.test(r[0])) continue; const k = r[0] + ':' + r[1]; const o = V[k] = V[k] || { n: 0, dmin: 99 }; o.n++; o.dmin = Math.min(o.dmin, r[3], r[4]); } window.__CPM_P1B2 = null; return V; });
    RIS[key].casi.push({ gi: c.gi, k: c.k, label: c.label, pre: c.pre, visti });
    for (const v in visti) RIS[key].clip[v] = (RIS[key].clip[v] | 0) + visti[v].n;
  }
  console.log(key.padEnd(28) + ' ' + (Object.keys(RIS[key].clip).join(' · ') || '— nessuna clip montata'));
}
await b.close(); srv.close();
/* ramo proprio nel sorgente: righe di src/12 che nominano la variante fuori dalle tabelle GESTI / GESTI_ALIAS */
const ramo = v => SRC12.filter(l => l.includes('"' + v + '"') || l.includes("'" + v + "'")).filter(l => !/GESTI=\{|GESTI_ALIAS=|^\s*(shot|cross|dribble|pass|header|tackle|penalty):\{base/.test(l)).length;
const C = (INFO && INFO.contatto) || {}; const righe = [];
const CALCIA = /^(shot|penalty|freekick|cross|pass)\//;
for (const key in RIS) { const [f, v] = key.split('/'); const row = (G[f] && G[f][v === 'base' ? 'base' : v]) || {};
  const clipVere = [...new Set(Object.keys(RIS[key].clip).map(x => x.split(':')[1]))];
  const senzaContatto = CALCIA.test(key) ? clipVere.filter(n => !C[n]) : [];
  righe.push({ key, want: row.clip || null, prof: row.prof || null, ramo: v === 'base' ? 0 : ramo(v), clipVere, senzaContatto, contatto: clipVere.map(n => C[n] ? n + ' u' + C[n].u + (C[n].dx ? ' dx' : ' sx') : n + ' —').join(', '), casi: RIS[key].casi.map(c => c.gi + '/' + c.k + ' ' + c.label) }); }
const firma = r => r.key.split('/')[0] + '|' + r.clipVere.slice().sort().join('+') + '|' + r.prof + '|' + (r.ramo > 0 ? 'ramo' : 'nessun-ramo');
const gruppi = {}; for (const r of righe) (gruppi[firma(r)] = gruppi[firma(r)] || []).push(r.key);
const indist = Object.values(gruppi).filter(g => g.length > 1);
console.log('\n— contatto/piede per le clip che calciano:');
for (const r of righe.filter(r => CALCIA.test(r.key))) console.log('  ' + r.key.padEnd(26) + ' ' + (r.contatto || '— nessuna clip montata'));
console.log('\n— varianti con la STESSA firma (clip vista + profilo + ramo): ' + (indist.length ? '' : 'nessuna'));
indist.forEach(g => console.log('  ' + g.join(' = ')));
const corpoUguale = {}; for (const r of righe) { if (!r.clipVere.length) continue; const k = r.key.split('/')[0] + '|' + r.clipVere.slice().sort().join('+'); (corpoUguale[k] = corpoUguale[k] || []).push(r.key); }
console.log('\n— varianti con lo STESSO CORPO (solo clip vista, GLB acceso):');
Object.values(corpoUguale).filter(g => g.length > 1).forEach(g => console.log('  ' + g.join(' = ')));
const mute = righe.filter(r => !r.clipVere.length).map(r => r.key);
console.log('\n— varianti senza nessuna clip montata in scena: ' + (mute.join(', ') || 'nessuna'));
fs.mkdirSync(path.join(DIR, 'out'), { recursive: true });
fs.writeFileSync(path.join(DIR, 'out/gesti-firme-045' + (SOLO.length ? '-' + SOLO.join('_') : '') + '.json'), JSON.stringify({ info: INFO, righe, indist, corpoUguale, mute }, null, 1));
console.log('scritto out/gesti-firme-045.json');
