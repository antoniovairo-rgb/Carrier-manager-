/* [giro 306] SONDA DI MISURA — il percorso del GIOCATORE nella serata di presentazione, con tocchi veri (page.mouse): il tasto audio apre il
   pannello sopra la serata, «Chiudi» lo chiude, «Avanti» porta in fondo. Dice anche quale tasto prendeva il vecchio ripiego di testi-190. */
import fs from 'fs';
import { startServer, launchBrowser, installCdnRoutes } from './lib/harness.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const save = JSON.parse(fs.readFileSync(new URL('./testi-190.mjs', import.meta.url), 'utf8').match(/const save = (\{[\s\S]*?\}\s*\});?\nconst srv/)[1].replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/'/g, '"'));
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript((o) => { window.__CPM_GLB = false; if (!sessionStorage.getItem('t190')) { sessionStorage.setItem('t190', '1'); localStorage.setItem('cpm-v3', JSON.stringify(o.s)); } }, { s: save });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await sleep(3500); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 3000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(1200);
await page.getByText(/Avvia Stagione|Vivi la Settimana/i).first().click({ timeout: 5000 }); await sleep(1800);
const BOTT = () => [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => { const r = b.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { t: (b.textContent || '').trim().slice(0, 22), al: b.getAttribute('aria-label'), dis: b.disabled, x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), sopra: top ? (b.contains(top) ? 'ok' : (top.getAttribute('data-cpm') || top.tagName)) : 'fuori' }; });
for (let i = 0; i < 30; i++) {
  const t = await page.evaluate(() => document.body.innerText || '');
  if (await page.evaluate(() => !!document.querySelector('[data-cpm="audio-serata299"]'))) break;
  let av = false;
  for (const re of [/^\W*Avanza/i, /Salta il racconto/i, /^\W*Tieni #/i, /^\W*Capito/i, /^\W*(Avanti|Prosegui|Continua)/i]) { try { const L = page.getByRole('button', { name: re }); if (await L.count()) { await L.last().click({ timeout: 2000 }); av = true; break; } } catch (e) {} }
  if (!av) await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0); const fine = bs.findIndex(b => /Vai al prossimo momento|Chiudi — riprendi/i.test(b.textContent)); const c = bs.slice(0, fine < 0 ? bs.length : fine).find(b => (b.textContent || '').trim() && !/Chiudi|Parti per/i.test(b.textContent)); if (c) c.click(); });
  await sleep(900);
}
await sleep(1500); console.log('SERATA — tasti:', JSON.stringify((await page.evaluate(BOTT)).filter(b => b.sopra !== 'fuori' && b.sopra !== 'DIV')));
for (const re of [/^\W*Avanza/i, /Salta il racconto/i, /^\W*Tieni #/i, /^\W*Capito/i, /^\W*(Avanti|Prosegui|Continua)/i]) { const L = page.getByRole('button', { name: re }); console.log('  getByRole', String(re), await L.count()); }
const primo = await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0); const c = bs.find(b => (b.textContent || '').trim() && !/Chiudi|Parti per/i.test(b.textContent)); return c ? (c.getAttribute('data-cpm') + ' «' + c.textContent.trim() + '»') : null; });
console.log('  primo tasto che il ripiego della sonda sceglierebbe:', primo);
// percorso del giocatore: tocchi veri
const tocca = async (re) => { const b = await page.evaluate((src) => { const re = new RegExp(src, 'i'); const b = [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0 && re.test((b.textContent || '').trim()) || re.test(b.getAttribute('data-cpm') || '')).pop(); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, re.source); if (!b) return false; await page.mouse.click(b.x, b.y); return true; };
try { await page.getByRole('button', { name: /^\W*(Avanti|Prosegui|Continua)/i }).last().click({ timeout: 2000, trial: true }); console.log('  clic di Playwright su «Avanti» (prova a vuoto): riuscito'); } catch (e) { console.log('  clic di Playwright su «Avanti» FALLITO:', String(e.message).replace(/\s+/g, ' ').slice(0, 600)); }
console.log('  animazione del tasto Avanti:', await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => /^Avanti/i.test(b.textContent.trim())); const cs = getComputedStyle(b); return cs.animationName + ' ' + cs.animationDuration + ' ' + cs.animationIterationCount; }));
console.log('tocco vero sul tasto audio:', await tocca(/audio-serata299/)); await sleep(600);
console.log('  pannello aperto:', await page.evaluate(() => { const p = document.querySelector('[data-cpm="audio-pannello"]'); if (!p) return null; const r = p.getBoundingClientRect(); const top = document.elementFromPoint(206, 450); return { w: r.width, h: r.height, sopraAlCentro: p.contains(top) }; }));
await page.screenshot({ path: (process.env.CPM_FOTO306 || 'out') + '/serata-audio-aperto.png' });
console.log('tocco vero su Chiudi:', await tocca(/^Chiudi$/)); await sleep(600);
console.log('  pannello ancora aperto:', await page.evaluate(() => !!document.querySelector('[data-cpm="audio-pannello"]')));
let n = 0; for (; n < 25; n++) { const dentro = await page.evaluate(() => /AVANTI|Salta/.test([...document.querySelectorAll('button')].map(b => b.textContent).join('|')) && !!document.querySelector('[data-cpm="audio-serata299"]')); if (!dentro) break; if (!(await tocca(/^AVANTI/))) await tocca(/^Salta$/); await sleep(900); }
console.log('serata chiusa dopo', n, 'tocchi veri su AVANTI; tasto audio ancora in pagina:', await page.evaluate(() => !!document.querySelector('[data-cpm="audio-serata299"]')), '· testo:', (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 160));
await browser.close(); srv.close();
