/* [giro 189] Libreria del collaudo «idee»: apre UNA pagina del gioco (telefono 390x844 o PC 1366x768), tocca i tasti
   per testo come farebbe una persona, fotografa e salva/ricarica il localStorage fra un passo e l'altro.
   Solo lettura sul gioco: non tocca src/. Ogni script gira in primo piano e chiude il browser alla fine. */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from '../../../../tests/visual/lib/harness.mjs';
export { sleep };
const QUI = path.dirname(new URL(import.meta.url).pathname);
export const FOTO = path.join(QUI, '..');
export const STATI = process.env.G193_STATI || path.join(QUI, 'stati');
fs.mkdirSync(STATI, { recursive: true });

export async function apri({ fmt = 'tel', stato = null, test = false, extra = '' } = {}) {
  const srv = await startServer(); const port = srv.address().port;
  const browser = await launchBrowser();
  const ctx = await browser.newContext(fmt === 'pc' ? { viewport: { width: 1366, height: 768 } } : { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  const errori = []; page.on('pageerror', e => errori.push(String(e.message).slice(0, 200)));
  if (stato) { const s = JSON.parse(fs.readFileSync(path.join(STATI, stato + '.json'), 'utf8'));
    await page.addInitScript(s => { if (!sessionStorage.getItem('g193')) { for (const k in s) localStorage.setItem(k, s[k]); sessionStorage.setItem('g193', '1'); } }, s); }
  const url = `http://localhost:${port}/CARRIER-MANAGER-AV.html` + (test ? '?cpmtest=1' : '') + extra;
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
  await sleep(2500);
  const tocca = async (x, y) => { if (fmt === 'pc') await page.mouse.click(x, y); else await page.touchscreen.tap(x, y); };
  const H = {
    page, errori, fmt, sleep,
    async chiudi() { await browser.close(); srv.close(); },
    async salva(nome) { const s = await page.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; }); fs.writeFileSync(path.join(STATI, nome + '.json'), JSON.stringify(s)); },
    /* tasti visibili (testo); [coperto] = un altro elemento sta sopra al centro del tasto */
    async btns() { return await page.evaluate(() => { const H = innerHeight, W = innerWidth, out = [];
        for (const e of document.querySelectorAll('button,[role="button"],a[href],input,select')) { const c = getComputedStyle(e); if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity < 0.1 || e.disabled) continue; const r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > H || r.right < 0 || r.left > W) continue;
          const t = document.elementFromPoint(Math.min(W - 1, Math.max(0, r.left + r.width / 2)), Math.min(H - 1, Math.max(0, r.top + r.height / 2))); const top = !!t && (t === e || e.contains(t) || t.contains(e));
          out.push(((e.textContent || e.getAttribute('aria-label') || e.placeholder || e.tagName).trim().replace(/\s+/g, ' ').slice(0, 70)) + (top ? '' : ' [coperto]')); } return out; }); },
    async txt(n = 1500) { return (await page.evaluate(() => document.body.innerText)).replace(/\n\s*\n+/g, '\n').slice(0, n); },
    /* tocca il tasto il cui testo combacia; fra piu' candidati sceglie il primo in primo piano. null se non c'e' */
    async tap(pat, idx = 0) { const src = pat instanceof RegExp ? pat.source : pat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); const fl = pat instanceof RegExp ? pat.flags : 'i';
      const p = await page.evaluate(({ src, fl, idx }) => { const re = new RegExp(src, fl); const H = innerHeight, W = innerWidth; const c = [];
        for (const e of document.querySelectorAll('button,[role="button"],a[href]')) { if (e.disabled) continue; const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden') continue; const r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4) continue; const t = (e.textContent || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' '); if (!re.test(t)) continue; c.push({ e, t }); }
        if (!c.length) return null;
        const inPiano = k => { const r = k.e.getBoundingClientRect(); if (r.bottom < 0 || r.top > H) return false; const t = document.elementFromPoint(Math.min(W - 1, Math.max(0, r.left + r.width / 2)), Math.min(H - 1, Math.max(0, r.top + r.height / 2))); return !!t && (t === k.e || k.e.contains(t) || t.contains(k.e)); };
        const buoni = c.filter(inPiano); const lista = buoni.length ? buoni : c; const k = lista[Math.min(idx, lista.length - 1)]; if (!buoni.length) k.e.scrollIntoView({ block: 'center' }); const r = k.e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, t: k.t.slice(0, 60), n: lista.length }; }, { src, fl, idx });
      if (!p) return null; await sleep(150); await tocca(p.x, p.y); await sleep(500); return p.t; },
    tocca,
    /* [giro 193] tocca l'elemento piu' interno e visibile il cui testo combacia (anche se non e' un <button>) */
    async tapTesto(pat) { const src = pat instanceof RegExp ? pat.source : pat; const p = await page.evaluate((src) => { const re = new RegExp(src, 'i'); let best = null;
        for (const e of document.querySelectorAll('body *')) { const t = (e.textContent || '').trim().replace(/\s+/g, ' '); if (!t || t.length > 90 || !re.test(t)) continue; const r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4) continue; if (!best || best.e.contains(e)) best = { e, t }; }
        if (!best) return null; best.e.scrollIntoView({ block: 'center' }); const r = best.e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, t: best.t.slice(0, 60) }; }, src);
      if (!p) return null; await sleep(200); await tocca(p.x, p.y); await sleep(600); return p.t; },
    async foto(nome, full) { const f = path.join(FOTO, nome + '-' + fmt + '.png'); await page.screenshot({ path: f, fullPage: !!full }); return f; },
    async stato() { return await page.evaluate(() => { try { const p = JSON.parse(localStorage.getItem('cpm-v3') || '{}').player || {}; return { n: p.name, club: p.club && (p.club.name || p.club.n), lg: p.club && p.club.lg, s: p.season, w: p.week, lived: p.weekLived, pro: p.proStatus, ovr: p.ovr, g: p.goals, a: p.assists, m: p.matches, tg: p.totalGoals, age: p.age, trust: p.coachTrust, mor: p.morale, pop: p.popularity, bank: p.bankBalance, fase: window.__CPM_PHASE ? window.__CPM_PHASE() : null }; } catch (e) { return String(e); } }); },
  };
  return H;
}
