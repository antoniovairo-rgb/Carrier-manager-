#!/usr/bin/env node
/* [giro 228 · PO-493] SONDA (non guardiano) misura-228: nella Rosa del Club, a 360 e 412 px, quanti NOMI sono tagliati
   (scrollWidth > clientWidth sullo span del nome) su molte rose generate. Gioco vero (?cpmtest=1), salvataggio sintetico
   (misura-199) + __CPM_CAREER.patch({club}) per scorrere i club. CPM_FLAG228=<nome> accende un interruttore (es. __CPM_NO_G228).
   CPM_N228=<n> club per larghezza (default 60). Stampa JSON riassuntivo. Esporta misuraRosa(page) per il guardiano rosa-228. */
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { salva, apri } from './misura-199.mjs';
import { pathToFileURL } from 'node:url';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
/* righe della Rosa: la fisarmonica il cui bottone dice «Rosa»; il nome e' lo span flex:1 con ellissi */
export async function misuraRosa(page) {
  return page.evaluate(() => {
    const fis = [...document.querySelectorAll('[data-cpm-fis]')].find(f => /^\s*Rosa\b/i.test((f.querySelector('button') || {}).innerText || ''));
    if (!fis) return null;
    const out = [];
    for (const s of fis.querySelectorAll('span')) {
      const st = s.style; if (st.textOverflow !== 'ellipsis' || st.flexGrow !== '1') continue;
      const row = s.parentElement; const sp = [...row.children];
      /* [giro 268] la «R» del rigorista (SegnoR257, giro 257, decisione PO-496 «Sì, segnato nella Rosa») sta fra nome e ruolo: si salta */
      /* [giro 299] anche «C» e «VC» (SegnoFascia299, PO-563 «C e VC come la R») stanno fra nome e ruolo: si saltano come la «R» */
      const ruolo = sp.slice(sp.indexOf(s) + 1).find(e => e.getAttribute('data-cpm') !== 'rigorista257' && e.getAttribute('data-cpm') !== 'fascia299');
      out.push({ nome: (s.innerText || '').replace(/^★ /, ''), tagliato: s.scrollWidth > s.clientWidth + 0.5, w: s.clientWidth, sw: s.scrollWidth,
        ruolo: ruolo ? (ruolo.innerText || '').replace(/\s+/g, ' ').trim() : null, ruoloTitolo: ruolo ? ruolo.getAttribute("aria-label") : null, ruoloTitle: ruolo ? ruolo.getAttribute("title") : null,
        rigaOk: row.scrollWidth <= row.clientWidth + 1 });
    }
    return out;
  });
}
async function main() {
  const N = +(process.env.CPM_N228 || 60); const FL = ['__CPM_FIS_APERTE', ...(process.env.CPM_FLAG228 ? [process.env.CPM_FLAG228] : [])];
  const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
  const tot = {};
  try {
    for (const w of [360, 412]) {
      const a = await apri(browser, port, salva({}), FL, w, 800);
      const clubs = await a.page.evaluate(() => (window.__CPM_CLUBS || []).map(c => c));
      const step = Math.max(1, Math.floor(clubs.length / N)); const R = { club: 0, righe: 0, tagliati: 0, tagliatiCorti: 0, esempi: [], ruoli: {}, nomeMax: 0 };
      for (let k = 0; k < clubs.length && R.club < N; k += step) {
        await a.page.evaluate((c) => { window.__CPM_CAREER.patch({ club: c }); window.__CPM_CAREER.goTab('club'); }, clubs[k]); await sleep(350);
        const m = await misuraRosa(a.page); if (!m) continue; R.club++;
        for (const r of m) { R.righe++; R.nomeMax = Math.max(R.nomeMax, r.nome.length); R.ruoli[r.ruolo] = (R.ruoli[r.ruolo] || 0) + 1;
          if (r.tagliato) { R.tagliati++; if (r.nome.length < 18) R.tagliatiCorti++; if (R.esempi.length < 8) R.esempi.push(`${r.nome} [${r.ruolo}] ${r.w}/${r.sw}`); } }
      }
      R.errori = a.errors; tot[w] = R; await a.page.close();
    }
  } finally { await browser.close(); srv.close(); }
  console.log(JSON.stringify(tot, null, 1));
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
