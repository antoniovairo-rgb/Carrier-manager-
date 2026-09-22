/* [23/09] VISION TEST DA GIOCATORE — review CGTrader ottimizzata, partita REALE (niente situazioni forzate).
   Si gioca come un utente: al momento della scelta si clicca il pulsante dell'azione (a rotazione prima/seconda/
   terza), si guarda l'esito, si preme «Continua». Teatro di presentazione acceso (`__CPM_PRESENT=1`) e attese
   reali (`__CPM_REALWAIT`), perche' sotto cpmtest sono spenti e il giocatore invece li vede.
   Fotografa in `vision-player/`: gioco fluido ogni ~20 s, scelta, esito a 0,8 / 2 / 3,5 s. Per ogni foto annota
   fase, testo della situazione, azione scelta, taglia dell'eroe e corpi disegnati (testimone attori). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'vision-player');
fs.mkdirSync(out, { recursive: true });
for (const f of fs.readdirSync(out)) if (f.endsWith('.png')) fs.unlinkSync(path.join(out, f));
const DURATA = Number(process.env.CPM_SEC || 420) * 1000;
const MAXHL = Number(process.env.CPM_MAXHL || 6);
const server = await startServer();
const browser = await launchBrowser();
const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const errori = [];
page.on('pageerror', e => errori.push(String(e.message).slice(0, 200)));
const log = [];
let n = 0;
const foto = async (tag, extra = {}) => {
  const s = await page.evaluate(() => {
    const a = window.__CPM_CGTRADER_ACTORS_AUDIT ? window.__CPM_CGTRADER_ACTORS_AUDIT() : null;
    const h = a && a.actors.find(x => x.hero);
    return { fase: window.__CPM_PHASE?.() || null, minuto: window.__CPM_STATE?.()?.minute ?? null, situazione: window.__CPM_CURSIT?.()?.text ?? null,
      eroe: h ? { gesto: h.gesture, taglia: h.height, inQuadro: h.inFrame, lod: h.lod } : null, corpi: a ? a.actors.length : null,
      hud: (document.body.innerText.match(/\d+ fps[^\n]*/) || [null])[0] };
  }).catch(() => ({}));
  const f = `${String(++n).padStart(2, '0')}-${tag}.png`;
  await page.screenshot({ path: path.join(out, f) });
  log.push({ f, t: Math.round((Date.now() - t0) / 1000), ...s, ...extra });
  console.log(f, JSON.stringify({ ...s, ...extra }).slice(0, 220));
};
let t0 = Date.now();
try {
  await page.addInitScript(() => { window.__CPM_PRESENT = 1; window.__CPM_REALWAIT = 1; });
  await installCdnRoutes(page);
  await openMatch(page, server.address().port, { skipLoadAll: true, name: 'Giocatore Vero', query: { hyperCharacter: 'cgtrader-highlight-optimized' } });
  await page.waitForFunction(() => window.__CPM_HYPER_CASUAL_STATUS === 'ready-lineup' || String(window.__CPM_HYPER_CASUAL_STATUS || '').startsWith('fallback'), null, { timeout: 180000 }).catch(() => {});
  t0 = Date.now();
  await foto('avvio');
  let hl = 0, ultimaFluida = Date.now(), faseAnte = null;
  while (Date.now() - t0 < DURATA && hl < MAXHL) {
    const fase = await page.evaluate(() => window.__CPM_PHASE?.() || null).catch(() => null);
    if (fase === 'ended') { await foto('fischio-finale'); break; }
    if (fase === 'hl_choose' && faseAnte !== 'hl_choose') {
      await sleep(900);
      await foto(`hl${hl + 1}-scelta`);
      const scelta = await page.evaluate(k => {
        const acts = (window.__CPM_CURSIT?.()?.actions || []).map(a => String(a.label || a.l || a.text || ''));
        const want = acts.length ? acts[k % acts.length] : null;
        const key = want ? want.replace(/^[^\p{L}]+/u, '').slice(0, 14) : null;
        const btn = [...document.querySelectorAll('button')].filter(b => key && (b.textContent || '').includes(key)).pop();
        if (btn) { btn.click(); return { via: 'clic', azione: want }; }
        if (typeof window.__CPM_RESOLVE === 'function') { window.__CPM_RESOLVE(k % Math.max(1, acts.length)); return { via: 'hook', azione: want }; }
        return { via: 'nessuna', azione: want };
      }, hl).catch(e => ({ via: 'errore ' + e.message }));
      hl++;
      await sleep(800); await foto(`hl${hl}-esito-0_8s`, { scelta });
      await sleep(1200); await foto(`hl${hl}-esito-2s`);
      await sleep(1500); await foto(`hl${hl}-esito-3_5s`);
      await sleep(1500);
      const cont = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Continua/i.test(x.textContent || '')); if (b) { b.click(); return true; } return false; }).catch(() => false);
      if (cont) { await sleep(1500); await foto(`hl${hl}-dopo-continua`); }
      faseAnte = null; ultimaFluida = Date.now();
      continue;
    }
    if (fase === 'playing' && Date.now() - ultimaFluida > 20000) { await foto('gioco'); ultimaFluida = Date.now(); }
    faseAnte = fase;
    await sleep(400);
  }
  await foto('fine-sonda');
} finally {
  fs.writeFileSync(path.join(out, 'log.json'), JSON.stringify({ log, errori }, null, 1));
  console.log('errori:', errori.length, errori.slice(0, 3));
  await browser.close(); server.close();
}
