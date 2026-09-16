/* [C12 · 7.919] La scelta è una scena: il pop-up con la faccia di chi parla.
   VERDE: pop-up. ROSSO __CPM_NO919: i bottoni in cronaca, come nella foto del PO del 16/09.
   Misura: il pop-up compare quando c'è una scelta aperta? copre TUTTO lo schermo (la difesa contro il
   tocco involontario dopo il D-pad)? i bottoni nascono disarmati? la faccia c'è? e i bottoni in cronaca
   sono spariti? Più il fondo del pannello statistiche, del D-pad e della scheda azione, in chiaro
   (richiesta del PO: «renderei un po' più chiari»). Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'out', 'pop919');
fs.mkdirSync(OUT, { recursive: true });
const server = await startServer(); const port = server.address().port;
const ris = {};
for (const braccio of ['verde', 'rosso']) {
  const browser = await launchBrowser();
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
  await installCdnRoutes(ctx);
  const page = await ctx.newPage();
  let errori = 0; const messaggi = [];
  page.on('pageerror', (e) => { errori++; if (messaggi.length < 4) messaggi.push(String(e).slice(0, 200)); });
  await page.addInitScript((rosso) => { window.__CPM_GLB = true; if (rosso) window.__CPM_NO919 = true;
    /* il disarmo dura 450 ms: un sondaggio ogni 800 ms non puo' vederlo. Si guarda NASCERE il pop-up. */
    window.__CPM_POP919_NASCITA = null;
    const mo = new MutationObserver(() => {
      if (window.__CPM_POP919_NASCITA) return;
      const p = document.querySelector('[data-cpm="pop919"]');
      if (!p) return;
      const b = Array.from(p.querySelectorAll('button'));
      window.__CPM_POP919_NASCITA = { bottoni: b.length, disarmati: b.filter(x => x.disabled).length };
      setTimeout(() => { const q = document.querySelector('[data-cpm="pop919"]');
        const c = q ? Array.from(q.querySelectorAll('button')) : [];
        window.__CPM_POP919_DOPO = { bottoni: c.length, disarmati: c.filter(x => x.disabled).length }; }, 700);
    });
    const arma = () => { if (document.body) mo.observe(document.body, { childList: true, subtree: true }); else setTimeout(arma, 50); };
    arma();
  }, braccio === 'rosso');
  await openMatch(page, port, { skipLoadAll: true, name: 'Vairo' });
  await page.evaluate(() => { if (window.__CPM_AUTOPLAY) window.__CPM_AUTOPLAY(true, { seed: 4242, policy: 'seeded', tickMs: 260 }); }).catch(() => {});
  try { await page.waitForFunction(() => window.__CPM_GLB_READY === true, { timeout: 90000 }); } catch (_e) {}
  for (let i = 0; i < 40; i++) { const f = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (f === 'playing') break; await sleep(500); }
  /* i fondi, misurati subito: non dipendono dalla scelta */
  const fondi = await page.evaluate(() => {
    const lum = (s) => { const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(s || ''); if (!m) return null;
      return Math.round((0.2126 * +m[1] + 0.7152 * +m[2] + 0.0722 * +m[3]) / 255 * 1000) / 10; };
    const g = (sel, prop) => { const n = document.querySelector(sel); if (!n) return null; const cs = getComputedStyle(n);
      return { bg: cs[prop || 'backgroundColor'], lum: lum(cs[prop || 'backgroundColor']), img: (cs.backgroundImage || '').slice(0, 60) }; };
    const dp = document.querySelector('[data-cpm="dpad"] button');
    return { pannello: g('[data-cpm="pannello918"] > div'), dpad: dp ? { img: getComputedStyle(dp).backgroundImage.slice(0, 70), bg: getComputedStyle(dp).backgroundColor } : null,
      mossa: g('[data-cpm="mossa"]') };
  });
  /* si aspetta una scelta: arrivano 2-3 volte a partita e, quando arrivano, la partita si ferma */
  let apparso = false;
  for (let i = 0; i < 150; i++) {
    const c = await page.evaluate(() => ({ pop: !!document.querySelector('[data-cpm="pop919"]'), sc: !!document.querySelector('[data-cpm="sc681"]') }));
    if (c.pop || c.sc) { apparso = true; break; }
    await sleep(800);
  }
  const r = await page.evaluate(() => {
    const p = document.querySelector('[data-cpm="pop919"]');
    const b = p ? p.getBoundingClientRect() : null;
    const btn = p ? Array.from(p.querySelectorAll('button')) : [];
    const faccia = p ? !!p.querySelector('svg,img,div[style*="border-radius: 50%"]') : false;
    const testa = p ? String((p.innerText || '').split('\n')[0] || '').slice(0, 40) : '';
    return { pop: !!p, quota: b ? Math.round(100 * (b.width * b.height) / (innerWidth * innerHeight)) : 0,
      bottoni: btn.length, disarmati: btn.filter(x => x.disabled).length, faccia, testa,
      sc681: !!document.querySelector('[data-cpm="sc681"]'),
      nascita: window.__CPM_POP919_NASCITA || null, dopoNascita: window.__CPM_POP919_DOPO || null,
      panchina: !!document.querySelector('[data-cpm="panchina"]'), fase: window.__CPM_PHASE && window.__CPM_PHASE() };
  });
  await page.screenshot({ path: path.join(OUT, `${braccio}.png`) }).catch(() => {});
  if (braccio === 'verde' && r.pop) { await sleep(900); /* dopo 450 ms i bottoni devono essere ARMATI */
    const dopo = await page.evaluate(() => { const p = document.querySelector('[data-cpm="pop919"]'); const b = p ? Array.from(p.querySelectorAll('button')) : [];
      return { bottoni: b.length, disarmati: b.filter(x => x.disabled).length }; });
    r.dopo = dopo;
    await page.screenshot({ path: path.join(OUT, `${braccio}-armato.png`) }).catch(() => {});
  }
  ris[braccio] = { ...r, fondi, apparso, errori, messaggi };
  console.log(`${braccio.toUpperCase()}: scelta comparsa ${apparso} · pop-up ${r.pop} (${r.quota}% dello schermo, ${r.bottoni} opzioni, ${r.disarmati} disarmate all'apertura${r.dopo ? ', ' + r.dopo.disarmati + ' dopo 900 ms' : ''}) · faccia ${r.faccia} · «${r.testa}» · bottoni in cronaca ${r.sc681} · riga panchina ${r.panchina} · errori ${errori}${messaggi.length ? ' → ' + messaggi[0] : ''}`);
  console.log(`  fondi (chiarezza %): pannello ${fondi.pannello ? fondi.pannello.lum + ' (' + fondi.pannello.bg + ')' : 'n/d'} · scheda azione ${fondi.mossa ? (fondi.mossa.img || fondi.mossa.bg).slice(0, 54) : 'n/d'} · D-pad ${fondi.dpad ? (fondi.dpad.img || fondi.dpad.bg).slice(0, 54) : 'n/d'}`);
  await browser.close();
}
console.log(`\n=== C12: la scelta è una scena ===`);
console.log(`  pop-up: ${ris.verde.pop ? ris.verde.quota + '% dello schermo' : 'ASSENTE'} (rosso: ${ris.rosso.pop ? 'presente' : 'assente, come atteso'})`);
console.log(`  bottoni in cronaca: verde ${ris.verde.sc681} · rosso ${ris.rosso.sc681}`);
console.log(`  opzioni disarmate ALLA NASCITA: ${ris.verde.nascita ? ris.verde.nascita.disarmati + '/' + ris.verde.nascita.bottoni : 'non osservata'} -> ${ris.verde.dopoNascita ? ris.verde.dopoNascita.disarmati + '/' + ris.verde.dopoNascita.bottoni + ' dopo 700 ms' : 'n/d'}`);
console.log(`  errori di pagina: verde ${ris.verde.errori} · rosso ${ris.rosso.errori}`);
console.log(`  foto: ${OUT}/verde.png · ${OUT}/rosso.png`);
server.close();
