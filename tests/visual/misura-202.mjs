#!/usr/bin/env node
/* [giro 202 · PO-461] SONDA (non guardiano) misura-202: altezza della SCHEDA 1 della rassegna di fine partita col tabellino della gara
   e con la festa (cerimonia forzata con __CPM_FORCE_CEREMONY e saltata con Invio), su una partita a soli highlight seedata (lib
   partita-166). Viewport 360x640 · 375x667 · 390x844 (mobile dpr 2, stessa pagina ridimensionata) e PC 1366x768 (contesto desktop, stessa
   partita: il pilota e' seedato). Per ogni viewport: schermi della scheda 1 (contenuto + piede) / altezza viewport, altezza del tabellino
   della gara (dovunque sia), scheda in cui sta, momenti chiave e righe del tabellino.
   CPM_SEMI=7300,7301 semi da provare (sceglie e stampa quello con piu' eventi) · CPM_FLAG202=__CPM_NO_G202 interruttori · CPM_FOTO202=<prefisso>
   CPM_FESTA=0 senza festa · CPM_MODO=intera (partita intera) · CPM_VEL=2 velocita'. Uscita sempre 0 (e' una sonda). */
import { apriCarriera166, apriPrompt166, gioca166, sleep } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
export async function misuraScheda1(page) {
  return page.evaluate(() => {
    const H = window.innerHeight, r = (el) => Math.round(el.getBoundingClientRect().height);
    const root = document.querySelector('[data-cpm="rassegna200"]'); if (!root) return null;
    const sc = root.firstElementChild; const foot = root.lastElementChild;
    const fis = [...document.querySelectorAll('[data-cpm-fis]')].find(f => /Tabellino della gara/i.test((f.querySelector('button') || {}).textContent || ''));
    const tab = document.querySelector('[data-cpm="tabellino202"]') || fis || null;
    const sch = tab ? (tab.closest('[data-scheda200]') || {}).getAttribute?.('data-scheda200') || null : null;
    const mk = [...document.querySelectorAll('[data-scheda200="1"] div')].find(d => d.textContent === 'MOMENTI CHIAVE');
    const nMom = mk && mk.nextElementSibling ? mk.nextElementSibling.children.length : 0;
    const fr = foot.getBoundingClientRect(), sr = sc.getBoundingClientRect();
    return { H, W: window.innerWidth, contenuto: sc.scrollHeight, piede: r(foot), schermi: +((sc.scrollHeight + r(foot)) / H).toFixed(2),
      tabH: tab ? r(tab) : 0, tabScheda: sch, tabVisibile: !!(tab && tab.offsetParent), momenti: nMom, festa: !!document.querySelector('[data-cpm="festa-v2"]'),
      piedeBottom: Math.round(fr.bottom), scrollBottom: Math.round(sr.bottom), titolo: (document.querySelector('[data-cpm="titolo200"]') || {}).innerText || null };
  });
}
export async function festa(page) {
  await page.evaluate(() => window.__CPM_FORCE_CEREMONY && window.__CPM_FORCE_CEREMONY({ name: 'CAMPIONI!', kind: 'league' })); await sleep(900);
  await page.keyboard.press('Enter'); await sleep(900);
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const flags = (process.env.CPM_FLAG202 || '').split(',').filter(Boolean); const init = {}; for (const f of flags) init[f] = true;
  const semi = (process.env.CPM_SEMI || '7300').split(',').map(Number); const conFesta = process.env.CPM_FESTA !== '0';
  const VPS = [[360, 640], [375, 667], [390, 844]];
  for (const seme of semi) {
    for (const pc of (process.env.CPM_PC === '0' ? [false] : process.env.CPM_PC === 'solo' ? [true] : [false, true])) {
      const A = await apriCarriera166({ vp: pc ? { width: 1366, height: 768 } : { width: 375, height: 667 }, mobile: !pc, init, nome: 'Collaudo Salienti', vel: process.env.CPM_VEL || '1' });
      try {
        await apriPrompt166(A.page); const g = await gioca166(A.page, process.env.CPM_MODO || 'solo', { seme }); await sleep(1200);
        if (conFesta) await festa(A.page);
        for (const [w, h] of (pc ? [[1366, 768]] : VPS)) {
          await A.page.setViewportSize({ width: w, height: h }); await sleep(600);
          const m = await misuraScheda1(A.page);
          if (m && !m.tabVisibile) { /* il tabellino sta in un'altra scheda: si misura li' e si torna alla 1 */
            const k = +(m.tabScheda || 4) - 1; await A.page.evaluate((k) => { const d = document.querySelectorAll('[data-cpm="puntino200"]'); if (d[k]) d[k].click(); }, k); await sleep(400);
            const m2 = await misuraScheda1(A.page); m.tabH = m2 ? m2.tabH : 0; m.tabAltrove = true;
            await A.page.evaluate(() => { const d = document.querySelectorAll('[data-cpm="puntino200"]'); if (d[0]) d[0].click(); }); await sleep(400); }
          if (process.env.CPM_FOTO202) await A.page.screenshot({ path: `${process.env.CPM_FOTO202}-${w}x${h}.png` });
          console.log(JSON.stringify({ seme, w, h, finita: g.finita, score: g.score, errori: A.errs.length, ...m }));
        }
      } finally { await A.b.close(); A.srv.close(); }
    }
  }
}
