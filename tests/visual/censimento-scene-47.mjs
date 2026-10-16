#!/usr/bin/env node
/* [giro 47 · PO-137] CENSIMENTO FOTOGRAFICO DELLE SCENE 3D FUORI DALLA PARTITA (corpi veri accesi): galà, pullman, festa del trofeo.
   Strumento di collaudo, non guardiano: produce i fotogrammi in CPM_OUT (default docs/sviluppo/foto-giro47) a 360 e 412 px.
   CPM_SCENE=gala,parata,festa · CPM_TAG prefisso (es. prima/dopo) · CPM_ROSSO=__CPM_NO_X accende un rosso.                     */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const OUT = process.env.CPM_OUT || '../../docs/sviluppo/foto-giro47'; fs.mkdirSync(OUT, { recursive: true });
const WS = (process.env.CPM_W || '360,412').split(',').map(Number);
const SCENE = (process.env.CPM_SCENE || 'gala,parata,festa').split(',');
const TAG = process.env.CPM_TAG || 'censimento', ROSSO = process.env.CPM_ROSSO || '';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const errs = [];
const shot = async (p, nm) => { await p.screenshot({ path: `${OUT}/${TAG}-${nm}.png` }); console.log('  foto', nm); };
async function apriCarriera(W) {
  const p = await b.newPage({ viewport: { width: W, height: Math.round(W * 2.22) } }); await installCdnRoutes(p);
  p.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await p.addInitScript(o => { if (o.r) window[o.r] = 1; localStorage.setItem('cpm-v3', JSON.stringify(o.s)); }, { s: SAVE, r: ROSSO });
  await p.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await p.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await p.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await p.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(2000);
  try { await p.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  return p;
}
for (const W of WS) {
  if (SCENE.includes('gala')) {
    const p = await apriCarriera(W);
    await p.evaluate(() => window.__CPM_CAREER.apriGala()); await sleep(4000); await shot(p, `gala-1-apertura-${W}`);
    await sleep(5000); await shot(p, `gala-2-presentatori-${W}`);
    try { await p.getByText('Apri la busta', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await sleep(5000); await shot(p, `gala-3-premio-${W}`); await sleep(6000); await shot(p, `gala-4-palco-${W}`);
    await p.close();
  }
  if (SCENE.includes('parata')) {
    const p = await b.newPage({ viewport: { width: W, height: Math.round(W * 2.22) } }); await installCdnRoutes(p);
    p.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
    if (ROSSO) await p.addInitScript(r => { window[r] = 1; }, ROSSO);
    await p.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await p.waitForFunction(() => typeof window.__CPM_PARATA198_C === 'function', null, { timeout: 60000 });
    await p.evaluate(() => { document.body.innerHTML = '<div id="parata" style="position:fixed;inset:0"></div>';
      const club = { id: 'mer', n: 'FC Merseyside', a: 'MER', p: 80, c: '#c8102e', c2: '#ffffff', nat: '🏴', lg: 'Premier Division' };
      ReactDOM.createRoot(document.getElementById('parata')).render(React.createElement(window.__CPM_PARATA198_C, { club, euroWin: false, avatarId: 0, heroNum: 77 })); });
    for (let t = 0; t < 30; t++) { await sleep(1000); const c = await p.evaluate(() => (window.__CPM_PARATA || {}).cg23 || 0); if (c >= 8) break; }
    for (let i = 1; i <= 4; i++) { await shot(p, `parata-${i}-${W}`); await sleep(6000); }
    await p.close();
  }
  if (SCENE.includes('festa')) {
    const p = await apriCarriera(W);
    for (const k of ['league', 'nation']) {
      await p.evaluate(k => window.__CPM_CAREER.festa251(k), k); await sleep(1500); await shot(p, `festa-${k}-1-schermata-${W}`);
      await p.evaluate(() => { const bt = [...document.querySelectorAll('button')].find(x => /Festeggia$/.test((x.textContent || '').trim())); if (bt) bt.click(); });
      await sleep(5000); await shot(p, `festa-${k}-2-dopo-festeggia-${W}`); await sleep(6000); await shot(p, `festa-${k}-3-${W}`);
      try { await p.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {} await sleep(800);
    }
    await p.close();
  }
}
await b.close(); srv.close();
console.log(errs.length ? 'pageerror: ' + errs.slice(0, 3).join(' | ') : 'zero pageerror');
