/* [giro 306] SONDA DI MISURA — non un guardiano. Ripete il percorso di testi-190 (apertura di stagione, poi le schede) e dice, scheda
   per scheda: la scheda del contratto c'e'? quanto e' grande? cosa c'e' sopra? E per l'impulso: il tasto della scelta c'e', si vede,
   cosa c'e' nel suo centro?  Uso: node misura-306.mjs [rosso1,rosso2]   CPM_FOTO306=<cartella> per le foto.
   CPM_VECCHIO=1 = il ripiego della sonda com'era prima del giro 306 (prende il primo tasto con del testo, audio compreso). */
import fs from 'fs';
import { startServer, launchBrowser, installCdnRoutes } from './lib/harness.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ROSSI = (process.argv[2] || '').split(',').filter(Boolean);
const FOTO = process.env.CPM_FOTO306 || ''; if (FOTO) fs.mkdirSync(FOTO, { recursive: true });
const ET = process.env.CPM_ET306 || (process.env.CPM_VECCHIO ? 'prima' : 'dopo');
const SALTA = !!process.env.CPM_SALTA_APERTURA;
const save = JSON.parse(fs.readFileSync(new URL('./testi-190.mjs', import.meta.url), 'utf8').match(/const save = (\{[\s\S]*?\}\s*\});?\nconst srv/)[1].replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/'/g, '"'));
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: FOTO ? 2 : 1 });
await installCdnRoutes(page); const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
await page.addInitScript((o) => { window.__CPM_GLB = false; for (const r of o.r) window[r] = 1; if (!sessionStorage.getItem('t190')) { sessionStorage.setItem('t190', '1'); localStorage.setItem('cpm-v3', JSON.stringify(o.s)); } }, { r: ROSSI, s: save });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
await sleep(2500); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 3000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(1200);
if (!SALTA) {
  try { await page.getByText(/Avvia Stagione|Vivi la Settimana/i).first().click({ timeout: 5000 }); } catch (e) {} await sleep(1800);
  for (let i = 0; i < 14; i++) { const t = await page.evaluate(() => document.body.innerText || ''); let av = false;
    for (const re of [/^\W*Avanza/i, /Salta il racconto/i, /^\W*Tieni #/i, /^\W*Capito/i, /^\W*(Avanti|Prosegui|Continua)/i]) { try { const L = page.getByRole('button', { name: re }); if (await L.count()) { await L.last().click({ timeout: 2000 }); av = true; break; } } catch (e) {} }
    if (av) av = 'tasto col nome atteso';
    if (!av) av = await page.evaluate((vecchio) => { const pa = document.querySelector('[data-cpm="audio-pannello"]');
      if (pa && !vecchio) { const ch = [...pa.querySelectorAll('button')].find(b => /^Chiudi$/i.test((b.textContent || '').trim())); if (ch) ch.click(); }
      const bs = [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0 && (vecchio || (!b.closest('[data-cpm="audio-pannello"]') && !/^audio-/.test(b.getAttribute('data-cpm') || ''))));
      const fine = bs.findIndex(b => /Vai al prossimo momento|Chiudi — riprendi/i.test(b.textContent)); const c = bs.slice(0, fine < 0 ? bs.length : fine).find(b => (b.textContent || '').trim() && !/Chiudi|Parti per/i.test(b.textContent)); if (!c) return false; c.click(); return 'RIPIEGO su «' + c.textContent.trim().slice(0, 30) + '» {' + (c.getAttribute('data-cpm') || '') + '}'; }, !!process.env.CPM_VECCHIO);
    console.log(`  passo ${i}: avanzato ${av} · «${t.replace(/\s+/g, ' ').slice(0, 70)}»`);
    if (!av) break; await sleep(900); }
}
/* cosa c'e' SOPRA tutto, adesso? (uno strato fisso che copre lo schermo) */
const STRATO = () => { const o = []; for (const el of document.querySelectorAll('body *')) { const cs = getComputedStyle(el); if (cs.position !== 'fixed') continue; const r = el.getBoundingClientRect(); if (r.width >= innerWidth * 0.9 && r.height >= innerHeight * 0.6 && cs.display !== 'none' && cs.visibility !== 'hidden') o.push({ cpm: el.getAttribute('data-cpm') || el.className || el.tagName, z: cs.zIndex, t: (el.innerText || '').replace(/\s+/g, ' ').slice(0, 90) }); } return o; };
console.log('strati fissi a tutto schermo dopo l\'apertura:', JSON.stringify(await page.evaluate(STRATO)));
if (FOTO) await page.screenshot({ path: `${FOTO}/dopo-apertura-${ET}.png` });
for (const t of ['dashboard', 'carriera', 'profile', 'agente', 'ufficio', 'club']) {
  try { await page.evaluate((t) => window.__CPM_CAREER.goTab(t), t); } catch (e) {}
  await sleep(900); await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await sleep(300);
  const m = await page.evaluate(() => { const el = document.querySelector('[data-cpm="contratto-v2"]'); if (!el) return { c: false, v2: document.querySelectorAll('[data-cpm$="-v2"]').length, testo: (document.body.innerText || '').replace(/\s+/g, ' ').slice(0, 140) };
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); let p = el, tagli = []; while (p && p !== document.body) { const c = getComputedStyle(p); const rr = p.getBoundingClientRect(); if (c.overflow !== 'visible' && (rr.height < r.height || rr.width < r.width)) tagli.push((p.getAttribute('data-cpm') || p.tagName) + ' ' + Math.round(rr.width) + 'x' + Math.round(rr.height)); p = p.parentElement; }
    el.scrollIntoView({ block: 'center' }); const r2 = el.getBoundingClientRect(); const top = document.elementFromPoint(r2.left + r2.width / 2, r2.top + Math.min(20, r2.height / 2));
    return { c: true, w: Math.round(r.width), h: Math.round(r.height), disp: cs.display, vis: cs.visibility, op: cs.opacity, ov: cs.overflow, txt: (el.innerText || '').replace(/\s+/g, ' ').slice(0, 120), tc: (el.textContent || '').slice(0, 60), tagli, sopra: top ? (el.contains(top) ? 'se stessa' : (top.getAttribute('data-cpm') || top.tagName + '.' + top.className)) : null }; });
  console.log(`scheda ${t}:`, JSON.stringify(m));
  if (FOTO && m.c) { await page.screenshot({ path: `${FOTO}/contratto-pagina-${ET}.png` }); const el = await page.$('[data-cpm="contratto-v2"]'); try { await el.screenshot({ path: `${FOTO}/contratto-${ET}.png` }); } catch (e) {} }
  if (FOTO && !m.c) await page.screenshot({ path: `${FOTO}/scheda-${t}-${ET}.png` });
}
const imp = await page.evaluate(() => { for (const im of (WEEKLY_IMPULSES || [])) for (const c of (im.choices || [])) { const ef = c.ef || {}; if ((ef.morale | 0) < 0 && Object.keys(ef).length <= 3) return { id: im.id, txt: c.txt, m: ef.morale }; } return null; });
const ap = await page.evaluate((id) => window.__CPM_CAREER.apriImpulso(id), imp.id); await sleep(900);
const mi = await page.evaluate((txt) => { const k = txt.slice(0, 18); const b = [...document.querySelectorAll('button,[role=button]')].filter(x => (x.textContent || '').includes(k));
  const ovunque = [...document.querySelectorAll('body *')].filter(x => x.children.length === 0 && (x.textContent || '').includes(k)).map(x => { let p = x; const via = []; while (p && via.length < 5) { via.push(p.tagName + (p.getAttribute('role') ? '[' + p.getAttribute('role') + ']' : '') + (p.getAttribute('data-cpm') ? '{' + p.getAttribute('data-cpm') + '}' : '')); p = p.parentElement; } return via.join(' < '); });
  const t = b[b.length - 1]; let d = null; if (t) { t.scrollIntoView({ block: 'center' }); const r = t.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); d = { w: Math.round(r.width), h: Math.round(r.height), sopra: top ? (t.contains(top) ? 'se stesso' : (top.getAttribute('data-cpm') || top.tagName)) : null }; }
  return { chiave: k, tasti: b.length, tasto: d, testoTrovatoIn: ovunque, pagina: (document.body.innerText || '').replace(/\s+/g, ' ').slice(0, 200) }; }, imp.txt);
console.log('impulso', imp.id, 'aperto', ap, JSON.stringify(mi));
console.log('strati fissi con l\'impulso:', JSON.stringify(await page.evaluate(STRATO)));
if (FOTO) await page.screenshot({ path: `${FOTO}/impulso-${ET}.png` });
console.log('errori di pagina', errors.length, errors.slice(0, 2).join(' | '));
await browser.close(); srv.close();
