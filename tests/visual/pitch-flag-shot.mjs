/* [7.158.0] SHOT centrocampo walkout coi colori bandiera: gara di Lega A (nat 🇮🇹) → il tappeto cerimoniale
   a centrocampo dev'essere un gradiente TRICOLORE (verde/bianco/rosso). Naviga fino al walkout, cattura frame. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { execSync } from 'node:child_process';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 480, height: 900 } });
await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
const base = { phase: 'career', player: { name: 'Flag Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 1, weekLived: false, age: 24, ovr: 80, tutorialDone: true, campDone: true, jerseyNum: 10, presidentModalSeason: 3, drawSeen: 3, mercatoSeen: 3, jerseyNumSeason: 3, seasonPledge: { season: 3, tone: 'equilibrato' },
  club: { id: 'nap', n: 'FC Partenope', a: 'NAP', p: 82, c: '#1e9bd7', c2: '#ffffff', nat: '🇮🇹', lg: 'Lega A' },
  stats: { 'velocità': 80, tecnica: 79, fisico: 78, 'mentalità': 80, tiro: 82, passaggio: 79, dribbling: 81, posizionamento: 80 },
  form: 74, morale: 72, fatigue: 8, contract: { duration: 3, wage: 9000, expiresAtSeason: 6 } } };
await page.addInitScript((sv) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, base);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1600);
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
await sleep(1200);
const fhw = await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3') || 'null'); const ws = ((s && s.player.calendar) || []).filter(m => m && !m.type && m.isHome).map(m => m.week); return ws.length ? Math.min(...ws) : null; });
console.log('prima casalinga di lega: W' + fhw);
await page.close();
const page2 = await browser.newPage({ viewport: { width: 480, height: 900 } });
await installCdnRoutes(page2);
page2.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
await page2.addInitScript((sv) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, { ...base, player: { ...base.player, week: fhw, weekLived: true } });
await page2.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
await page2.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1600);
const click = async (rx) => page2.evaluate((x) => { const r = new RegExp(x, 'i'); const el = [...document.querySelectorAll('button,a,[role=button]')].find(e => r.test((e.textContent || '').trim()) && e.offsetParent !== null); if (el) { el.click(); return (el.textContent || '').slice(0, 26); } return null; }, rx);
await click('^CONTINUA'); await sleep(1000);
await click('Gioca vs|Gioca partita|Gioca'); await sleep(1000);
await click('Gioca la partita'); await sleep(1400);
await click('Formazioni'); await sleep(1400);
await click('Entra in campo|ENTRA|Scendi in campo|In campo'); await sleep(1500);
// durante il walkout la camera orbita: cattura alcuni frame
let shot = 0;
for (let t = 0; t < 8; t++) {
  await page2.screenshot({ path: `out/pitchflag-${t}.png` });
  shot++;
  await sleep(700);
}
console.log('frame walkout catturati:', shot, '· pageerror:', errors.length);
await browser.close(); srv.close();
// monta i frame per una vista d'insieme
try { execSync(`python3 - <<'PY'
from PIL import Image
ims=[Image.open(f'out/pitchflag-{t}.png') for t in range(8)]
w=ims[0].width; cell_h=int(ims[0].height*0.55)
grid=Image.new('RGB',(w*2, cell_h*4),(15,17,22))
for i,im in enumerate(ims):
    c=im.crop((0,int(im.height*0.30),w,int(im.height*0.30)+cell_h))
    grid.paste(c,((i%2)*w,(i//2)*cell_h))
grid.save('out/pitchflag-grid.png'); print('grid',grid.size)
PY`, { stdio: 'inherit' }); } catch (e) { console.error('grid fail', e.message); }
console.log(errors.length ? '⚠️ pageerror:\n' + errors.join('\n') : '→ out/pitchflag-grid.png');
