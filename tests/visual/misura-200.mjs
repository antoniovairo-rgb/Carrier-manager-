#!/usr/bin/env node
/* [giro 200 · PO-385] SONDA (non guardiano) misura-200: quanto e' lunga la schermata di fine partita (rassegna stampa, fase `ended`
   di LiveMatch) e quanto e' alto ogni suo blocco. Partita di campionato della carriera da professionista dal prompt vero (lib
   partita-166), giocata a SOLI HIGHLIGHT (stessa schermata finale della partita intera, giro 166 controllo 11) col pilota seedato.
   Viewport 375x667 e 390x844 (mobile, dpr 2). Stampa JSON: altezza del contenuto scorrevole in schermi, blocchi in ordine.
   CPM_FLAG200=<nome> accende un interruttore (es. __CPM_NO_G200). CPM_FOTO200=<file.png> fotografa la schermata. */
import { apriCarriera166, apriPrompt166, gioca166, sleep } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
export async function misuraFine(page) {
  return page.evaluate(() => {
    const H = window.innerHeight;
    const btn = document.querySelector('[data-cpm="post-continua-v2"]');
    const root = document.querySelector('[data-cpm="rassegna200"]') || (btn && btn.parentElement && btn.parentElement.parentElement);
    if (!root) return null;
    const sc = root.firstElementChild; const card = sc && sc.firstElementChild;
    const r = (el) => Math.round(el.getBoundingClientRect().height);
    const blocchi = card ? [...card.children].filter(c => r(c) > 0).map(c => ({ h: r(c), cpm: c.getAttribute('data-cpm') || (c.querySelector('[data-cpm]') || {}).getAttribute?.('data-cpm') || null, t: (c.innerText || '').replace(/\s+/g, ' ').slice(0, 50) })) : [];
    const cont = sc ? sc.scrollHeight : 0; const foot = root.lastElementChild ? r(root.lastElementChild) : 0;
    const tit = (document.querySelector('[data-cpm="titolo200"]') || {}).innerText || null;
    return { H, W: window.innerWidth, contenuto: cont, piede: foot, schermi: +((cont + foot) / H).toFixed(2), schermiContenuto: +(cont / H).toFixed(2), scheda: tit, blocchi };
  });
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const flags = (process.env.CPM_FLAG200 || '').split(',').filter(Boolean); const init = {}; for (const f of flags) init[f] = true;
  for (const [w, h] of [[375, 667], [390, 844]]) {
    const A = await apriCarriera166({ vp: { width: w, height: h }, mobile: true, init, nome: 'Collaudo Salienti' });
    try {
      await apriPrompt166(A.page); const g = await gioca166(A.page, 'solo', { seme: 7300 });
      await sleep(1200);
      for (let k = 0; k < 4; k++) {
        const m = await misuraFine(A.page);
        if (process.env.CPM_FOTO200) await A.page.screenshot({ path: process.env.CPM_FOTO200.replace('.png', `-${w}-${k + 1}.png`), fullPage: false });
        console.log(JSON.stringify({ w, h, k: k + 1, finita: g.finita, score: g.score, errori: A.errs, ...m, blocchi: m && m.blocchi.map(b => b.h + ':' + (b.cpm || b.t.slice(0, 18))).join(' ') }));
        const av = await A.page.$('[data-cpm="avanti200"]'); if (!av) break; await av.click(); await sleep(500);
      }
    } finally { await A.b.close(); A.srv.close(); }
  }
}
