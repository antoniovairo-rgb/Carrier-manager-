/* Prova isolata N7: dopo una settimana SIMULATA (nessuna partita dal vivo interrotta) il ricaricamento mostra «Risultato recuperato»? */
import { avvia, nuovaPagina, foto, testo, bottoni, sleep, clickByText, evalSafe, overlay } from './c178-car5-lib.mjs';
const S = await avvia(); const page = await nuovaPagina(S); await sleep(1500);
await clickByText(page, 'Continua →', 4000); await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(2000);
const bannerRx = /Risultato recuperato/;
const stato = async (k) => console.log(k, JSON.stringify(await evalSafe(page, () => { const s = window.__CPM_CAREER.snapshot(); return { w: s.week, wl: s.weekLived, m: s.matches, resume: localStorage.getItem('cpm-match-resume') ? localStorage.getItem('cpm-match-resume').slice(0, 120) : null, banner: /Risultato recuperato/.test(document.body.innerText) }; })));
await stato('inizio');
/* 1 settimana: Vivi → (interviste/impulsi) → Simula e avanza */
for (let i = 0; i < 30; i++) {
  const ov = await overlay(page);
  if (ov) { const o = ov.opz.find(x => /Simula e avanza/.test(x.txt)) || ov.opz.find(x => !/^Chiudi/.test(x.txt)) || ov.opz[0]; if (o) await page.mouse.click(o.x, o.y); await sleep(700); if (ov.opz.some(x => /Simula e avanza/.test(x.txt))) break; continue; }
  await clickByText(page, 'Vivi la Settimana|Gioca vs|Gioca', 2000); await sleep(900);
}
await sleep(2500); await stato('dopo-simula');
console.log('KEYS', JSON.stringify(await evalSafe(page, () => Object.keys(localStorage))));
await page.reload({ waitUntil: 'load' }); await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1500);
await clickByText(page, 'Continua →', 4000); await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(1500);
await stato('dopo-ricarica'); await foto(page, 'ricarica-sim');
await S.browser.close(); process.exit(0);
