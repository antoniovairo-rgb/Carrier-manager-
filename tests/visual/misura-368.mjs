#!/usr/bin/env node
/* [giro 368 PO-417] SONDA di misura (non guardiano): «nomi senza equivoci».
   A · cognomi uguali nelle due squadre: tutte le coppie di club della stessa lega (CLUBS e Primavera), stagioni 1..S,
       rosa intera (23) e undici titolari, eroe nello slot 10 della sua squadra; dopo, la stessa misura passando per contro368.
   B · cognomi che sono parole della cronaca: vocabolario dai letterali di src/04, 05, 14, 15 (cronaca, scene, esiti),
       incrociato con tutti i cognomi delle rose generate.
   Uso: node misura-368.mjs [stagioni]   (CPM_NO_G368=1 = braccio rosso) */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, ROOT } from './lib/harness.mjs';
export function vocabolarioCronaca() {
  const voc = new Map();
  for (const f of ['04-situazioni-zone-piazzati.jsx', '05-cronaca-stadi-formazioni.jsx', '14-motore-possesso.jsx', '15-live-match.jsx']) {
    let s = fs.readFileSync(path.join(ROOT, 'src', f), 'utf8');
    s = s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:"'`\\])\/\/[^\n]*/g, '$1 ');
    const lit = s.match(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g) || [];
    for (const l of lit) if ((l.match(/\p{L}+/gu) || []).length >= 3) for (const w of (l.match(/\p{L}+/gu) || [])) { if (w.length < 2) continue; if (w !== w.toLowerCase()) continue; voc.set(w, (voc.get(w) || 0) + 1); }
  }
  return voc;
}
export async function misura(b, port, { stagioni = 3, rosso = false } = {}) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 800 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G368 = 1; }, rosso);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => typeof generateTeamRoster === 'function' && typeof CLUBS !== 'undefined', null, { timeout: 90000 });
  const r = await page.evaluate(({ S }) => {
    const cog = n => String(n || '').trim().split(/\s+/).slice(-1)[0];
    const eroe = 'Marco Vairo';
    const ligas = {}; for (const c of CLUBS) (ligas[c.lg] = ligas[c.lg] || []).push(c);
    try { for (const c of U18_CLUBS) (ligas['U18 ' + c.lg] = ligas['U18 ' + c.lg] || []).push(c); } catch (e) {}
    const out = { coppie: 0, xi: 0, rosa: 0, xiDopo: 0, rosaDopo: 0, esempi: [], cognomi: {}, contro: typeof contro368 === 'function' };
    for (const lg in ligas) { const L = ligas[lg];
      for (let s = 1; s <= S; s++) { const R = new Map(L.map(c => [c, generateTeamRoster(c, s)]));
        for (const a of L) for (const o of L) { if (a === o) continue; out.coppie++;
          const own = R.get(a).map((x, i) => i === 10 ? { ...x, name: eroe } : x); const opp = R.get(o);
          const so = new Set(own.map(x => cog(x.name))), sx = new Set(own.slice(0, 11).map(x => cog(x.name)));
          const ixi = opp.slice(0, 11).filter(x => sx.has(cog(x.name))), iro = opp.filter(x => so.has(cog(x.name)));
          if (ixi.length) { out.xi++; if (out.esempi.length < 6) out.esempi.push(lg + ' S' + s + ': ' + a.n + ' / ' + o.n + ' → ' + ixi.map(x => x.name).join(', ')); }
          if (iro.length) out.rosa++;
          if (out.contro) { const d = contro368(opp, own, o, s); const dxi = d.slice(0, 11).filter(x => sx.has(cog(x.name))), dro = d.filter(x => so.has(cog(x.name)));
            if (dxi.length) out.xiDopo++; if (dro.length) out.rosaDopo++; }
        }
        for (const [c, ro] of R) for (const x of ro) { const k = cog(x.name); out.cognomi[k] = (out.cognomi[k] || 0) + 1; }
      } }
    return out;
  }, { S: stagioni });
  await ctx.close(); return r;
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const S = +(process.argv[2] || 3);
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  const m = await misura(b, port, { stagioni: S, rosso: !!process.env.CPM_NO_G368 });
  const voc = vocabolarioCronaca();
  const eq = Object.keys(m.cognomi).filter(k => voc.has(k.toLowerCase())).map(k => ({ cognome: k, giocatori: m.cognomi[k], voltePar: voc.get(k.toLowerCase()) })).sort((a, b) => b.voltePar - a.voltePar);
  console.log(JSON.stringify({ coppie: m.coppie, xiStesso: m.xi, rosaStesso: m.rosa, xiDopo: m.xiDopo, rosaDopo: m.rosaDopo, contro: m.contro, esempi: m.esempi }, null, 1));
  console.log('equivoci (cognome · giocatori generati · volte nei testi):'); console.log(eq.map(e => `${e.cognome}·${e.giocatori}·${e.voltePar}`).join('  '));
  await b.close(); srv.close();
}
