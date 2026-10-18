#!/usr/bin/env node
/* [giro 52 PO-226] SONDA (strumento, non guardiano): perche' «la risolvo io» resta vuota. Rigioca le partite di misura-226 indicate
   (stessi nomi, semi, scelta i%3) e campiona dal motore, ogni 250 ms in gioco fluido: minuto, chi ha palla (eroe si/no), x dell'eroe e
   della palla, ultima occasione dell'eroe (_ultOccV2), richiesta s259 (gap/cerca), highlight giocati.
   Uso: CPM_IDX_PARTITE=2,5,17 node sonda-promessa52.mjs → out/sonda-promessa52/<i>.json */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const OUT = path.join(path.dirname(new URL(import.meta.url).pathname), 'out', 'sonda-promessa52'); fs.mkdirSync(OUT, { recursive: true });
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
const NOMI = ['Rossi', 'Bianchi', 'Verdi', 'Neri', 'Galli', 'Conti', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Costa', 'Fontana', 'Moretti', 'Barbieri', 'Lombardi', 'Rinaldi', 'Caruso', 'Ferrara', 'Serra', 'Fabbri', 'Villa', 'Mancini', 'Longo'];
const IDX = (process.env.CPM_IDX_PARTITE || '2,5,17').split(',').map(Number); const ROSSI = process.env.CPM_ROSSI || '';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function partita(i) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  const save = JSON.parse(JSON.stringify(SAVE)); save.player.name = 'Prova ' + NOMI[i % NOMI.length] + ' ' + i;
  await page.addInitScript((o) => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; window.__CPM_SCMS681 = 1500; window.__CPM_INT226_IDX = o.idx;
    for (const k of (o.rossi || '').split(',').filter(Boolean)) window[k] = 1;
    localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(o.save)); }, { save, idx: i % 3, rossi: ROSSI });
  const camp = {}; const out = { i, nome: save.player.name, hl: [] };
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
  await sleep(1200); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }).catch(() => {});
  await sleep(2500); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 90000 }).catch(() => {});
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 2590 + i * 37);
  const t1 = Date.now(); let phP = null;
  while (Date.now() - t1 < 480000) { await sleep(250);
    const d = await page.evaluate(() => { const ph = window.__CPM_PHASE && window.__CPM_PHASE(), ck = window.__CPM_CLOCK && window.__CPM_CLOCK();
      let m = null; try { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); const S = M._S, g = M._g; const h = g.findIndex(p => p.eroe);
        const pd = S.poss.padrone; m = { min: S.min, eroePalla: pd != null && pd === h, latoPalla: pd != null ? g[pd].team : null, hx: h >= 0 ? +g[h].x.toFixed(0) : null, team: h >= 0 ? g[h].team : null,
          bx: +S.palla.x.toFixed(0), occ: S._ultOccV2, req: S.richieste && S.richieste.s259 ? { gap: S.richieste.s259.gap, cerca: S.richieste.s259.cerca } : null, espulsi: (M.espulsi && M.espulsi()) || null }; } catch (e) { m = { err: String(e.message).slice(0, 80) }; }
      return { ph, ck, m }; });
    if (d.ph === 'hl_intro' && phP !== 'hl_intro') out.hl.push(d.ck); phP = d.ph;
    if (d.ph === 'playing' && d.ck != null) { const c = camp[d.ck] || (camp[d.ck] = { n: 0, eroe: 0, noi: 0, hx: [], occ: null, req: null }); c.n++; if (d.m) { if (d.m.eroePalla) c.eroe++; if (d.m.latoPalla === d.m.team) c.noi++; c.hx.push(d.m.hx); c.occ = d.m.occ; c.req = d.m.req; c.err = d.m.err; } }
    if (d.ph === 'ended' || d.ph === 'ceremony') break; }
  out.s259 = await page.evaluate(() => window.__CPM_S259 || null); out.camp = camp; await page.close();
  fs.writeFileSync(path.join(OUT, i + '.json'), JSON.stringify(out));
  const r = (out.s259 && out.s259.scelte || []).filter(s => s.idx === 2);
  console.log(`p${i} hl ${JSON.stringify(out.hl)} scelte eroe ${r.map(s => s.min + "'").join(',')}`);
  for (const s of r) { const rows = []; for (let k = s.min; k <= Math.min(s.min + 12, 90); k++) { const c = camp[k]; if (!c) { rows.push(k + "' -"); continue; }
    const hx = c.hx.filter(x => x != null); rows.push(`${k}' palla-noi ${c.noi}/${c.n} eroe ${c.eroe} hx ${hx.length ? Math.min(...hx) + '-' + Math.max(...hx) : '?'} occ ${c.occ} req ${JSON.stringify(c.req)}${c.err ? ' ERR ' + c.err : ''}`); }
    console.log('  ' + rows.join('\n  ')); }
}
for (const i of IDX) await partita(i);
await b.close(); srv.close();
