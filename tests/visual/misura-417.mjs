/* [giro 417 PO-681] «se il gioco e' in pausa i pulsanti non devono essere cliccabili».
   Misura, su PC (1920x1080) e telefono (390x844), cosa succede ai comandi di partita mentre la partita e' in PAUSA:
     A  scelte dell'highlight (hl_choose): N clic VERI del mouse (hit-test del browser) sui tasti delle scelte,
        N clic da DOM (element.click(), cioe' Invio/Spazio su un tasto a fuoco) e i tasti 1/2/3/Invio da tastiera.
        Si conta quante volte la scelta e' stata ESEGUITA (ActionResolved nel bus __CPM_TIMELINE o fase uscita da hl_choose).
     B  aspetto: i tasti delle scelte in pausa sono spenti (aria-disabled="true" + opacita' <= 0,5)?
     C  ripresa: tolta la pausa (tasto P), un clic sulla scelta la esegue (la scelta in corso non e' persa).
     D  velocita' (in gioco fluido): in pausa un clic sul tasto della velocita' la cambia?
     E  il tasto di pausa e il velo «per riprendere» restano usabili (riprendono).
   Uso: node misura-417.mjs  ·  CPM_ROSSO=1 arma window.__CPM_NO_G417  ·  CPM_FOTO=<dir> scrive le foto.
   Esce 0 e stampa le misure; il giudizio sta in pausa-417.mjs. */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const N = +(process.env.CPM_N || 6);
const FOTO = process.env.CPM_FOTO || null; const PREF = process.env.CPM_PREF || '417';
const GLB = process.env.CPM_GLB !== '0';

export async function misura417({ rosso = false, misure = [[1920, 1080, 'pc'], [390, 844, 'tel']], log = console.log } = {}) {
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const ris = {};
  try {
    for (const [W, H, tipo] of misure) {
      const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, serviceWorkers: 'block', hasTouch: tipo === 'tel', isMobile: tipo === 'tel' });
      const page = await ctx.newPage(); await installCdnRoutes(page); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
      await page.addInitScript(({ r, g }) => { window.__CPM_GLB = g; if (r) window.__CPM_NO_G417 = true; }, { r: rosso, g: GLB });
      const r = { W, H, tipo }; ris[tipo] = r;
      try {
        await openMatch(page, port, { skipLoadAll: true }); await sleep(800);
        const fase = () => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
        const risolte = () => page.evaluate(() => (window.__CPM_TIMELINE ? window.__CPM_TIMELINE() : []).filter(e => e.type === 'ActionResolved').length).catch(() => -1);
        const inPausa = () => page.evaluate(() => /per riprendere/i.test(document.body.innerText)).catch(() => false);
        const pausa = async voglio => { for (let t = 0; t < 3; t++) { if ((await inPausa()) === voglio) return true; await page.keyboard.press('p'); for (let i = 0; i < 20; i++) { await sleep(120); if ((await inPausa()) === voglio) return true; } } return false; };
        const foto = async nome => { if (!FOTO) return; fs.mkdirSync(FOTO, { recursive: true }); await page.screenshot({ path: path.join(FOTO, `${PREF}-${nome}-${tipo}-${W}x${H}.png`) }).catch(() => {}); };

        /* D: velocita' in gioco fluido */
        for (let i = 0; i < 60 && (await fase()) !== 'playing'; i++) await sleep(250);
        r.D = { fase: await fase() };
        if (r.D.fase === 'playing') {
          r.D.pausaSu = await pausa(true);
          const sp0 = await page.evaluate(() => localStorage.getItem('cpm-match-speed'));
          const vel = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /^\s*(1|1,5|1\.5|2)\s*[x×]\s*$/i.test(x.textContent || '') && x.getBoundingClientRect().width > 0); if (!b) return null; const q = b.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2, t: b.textContent.trim(), ad: b.getAttribute('aria-disabled'), op: +getComputedStyle(b).opacity }; });
          r.D.tasto = vel;
          if (vel) { for (let k = 0; k < 3; k++) { await page.mouse.click(vel.x, vel.y); await sleep(150); } }
          r.D.cambiata = (await page.evaluate(() => localStorage.getItem('cpm-match-speed'))) !== sp0;
          await foto('velocita-pausa');
          r.D.pausaGiu = await pausa(false);
        }

        /* A-C: scena con le scelte */
        const gi = await page.evaluate(() => { for (let i = 0; i < SITUATIONS.length; i++) { const s = SITUATIONS[i]; if (s.type !== 'def' && !(typeof isAimSit === 'function' && isAimSit(s)) && (s.actions || []).length >= 2) return i; } return 0; });
        await page.evaluate(() => { window.__CPM_TIMELINE_RESET && window.__CPM_TIMELINE_RESET(); });
        await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi);
        let ph = null; for (let i = 0; i < 80 && (ph = await fase()) !== 'hl_choose'; i++) await sleep(150);
        r.gi = gi; r.fase = ph;
        if (ph !== 'hl_choose') { r.err = 'scena delle scelte mai raggiunta (' + ph + ')'; }
        else {
          await sleep(900);
          const scelte = () => page.evaluate(gi => { const vis = el => { const cs = getComputedStyle(el); const q = el.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && q.width > 0 && q.height > 0 && q.bottom > 0 && q.top < innerHeight; };
            const scelta = b => { const k = Object.keys(b).find(k => k.startsWith('__reactProps$')); const f = k && b[k] && b[k].onClick; return !!f && /handleAction|handleSetPiece|\.go\(|handleRigore/.test(String(f)); };/* la scelta si riconosce dal suo gestore, non dal testo (le etichette a schermo sono riscritte) */
            return [...document.querySelectorAll('button')].filter(b => vis(b) && scelta(b)).map((b, i) => { b.setAttribute('data-m417', String(i)); const q = b.getBoundingClientRect(); let op = 1; for (let e = b; e; e = e.parentElement) op *= +getComputedStyle(e).opacity; return { i, t: (b.textContent || '').trim().slice(0, 40), x: q.left + q.width / 2, y: q.top + q.height / 2, ad: b.getAttribute('aria-disabled'), dis: b.disabled, op: +op.toFixed(2), pe: getComputedStyle(b).pointerEvents, sopra: (() => { const h = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); return h ? (b.contains(h) ? 'tasto' : (h.closest('button') ? 'altro-tasto' : (h.tagName + '.' + String(h.className || '').slice(0, 20)))) : null; })() }; }); }, gi);
          r.prima = await scelte();
          await foto('scelte');
          r.pausaSu = await pausa(true); await sleep(400);
          r.inPausa = await scelte(); await foto('scelte-pausa');
          const n0 = await risolte();
          let eseguiteMouse = 0, eseguiteDom = 0, eseguiteTast = 0; const tent = { mouse: 0, dom: 0, tast: 0 };
          const eseguita = async () => (await risolte()) > n0 || (await fase()) !== 'hl_choose';
          for (let k = 0; k < N; k++) { const s = r.inPausa[k % Math.max(1, r.inPausa.length)]; if (!s) break; tent.mouse++; if (tipo === 'tel') await page.touchscreen.tap(s.x, s.y); else await page.mouse.click(s.x, s.y); await sleep(250); if (await eseguita()) { eseguiteMouse++; break; } if (!(await inPausa())) { r.pausaTolta = 'clic ' + k; await pausa(true); } }
          if (!(await eseguita())) for (let k = 0; k < N; k++) { tent.dom++; await page.evaluate(i => { const b = document.querySelector(`[data-m417="${i}"]`); if (b) { b.focus(); b.click(); } }, k % Math.max(1, r.inPausa.length)); await sleep(250); if (await eseguita()) { eseguiteDom++; break; } }
          if (!(await eseguita())) for (const k of ['1', '2', '3', 'Enter', ' ']) { tent.tast++; await page.keyboard.press(k); await sleep(250); if (await eseguita()) { eseguiteTast++; break; } }
          r.A = { tent, eseguiteMouse, eseguiteDom, eseguiteTast, ancoraPausa: await inPausa(), fase: await fase() };
          /* C: ripresa */
          if (r.A.fase === 'hl_choose') {
            /* E: il tasto di pausa della barra (▶) resta usabile e riprende */
            const play = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => (x.textContent || '').trim() === '▶' && x.getBoundingClientRect().width > 0); if (!b) return null; const q = b.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2, ad: b.getAttribute('aria-disabled') }; });
            if (play) { if (tipo === 'tel') await page.touchscreen.tap(play.x, play.y); else await page.mouse.click(play.x, play.y); }
            let ripresa = false; for (let i = 0; i < 20 && !ripresa; i++) { await sleep(120); ripresa = !(await inPausa()); }
            r.E = { tasto: !!play, ad: play && play.ad, ripresa };
            r.pausaGiu = await pausa(false); await sleep(400);
            r.dopo = await scelte(); await foto('scelte-ripresa');
            const s = r.dopo[0];
            if (s) { if (tipo === 'tel') await page.touchscreen.tap(s.x, s.y); else await page.mouse.click(s.x, s.y); }
            let ok = false; for (let i = 0; i < 30 && !ok; i++) { await sleep(150); ok = await eseguita(); }
            r.C = { cliccata: s ? s.t : null, eseguita: ok, fase: await fase() };
          }
        }
      } catch (e) { r.err = String(e.message || e).slice(0, 200); }
      r.errs = errs.slice(0, 4); await ctx.close().catch(() => {});
      log(`[${tipo} ${W}x${H}] ` + JSON.stringify(r));
    }
  } finally { await b.close().catch(() => {}); srv.close(); }
  return ris;
}

if (import.meta.url === `file://${process.argv[1]}`) { await misura417({ rosso: !!process.env.CPM_ROSSO }); }
