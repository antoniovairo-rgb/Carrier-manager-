/* [giro 110] foto prima/dopo dei difetti del collaudo 180 (prima = tutti gli interruttori __CPM_NO_G110_* accesi, dopo = codice nuovo).
   Uso: node foto-110.mjs  -> docs/sviluppo/foto-giro110/<difetto>-<formato>-<prima|dopo>.jpg. Non tocca src/. */
import * as L from './lib/misura-110.mjs';
import path from 'node:path'; import { fileURLToPath } from 'node:url';
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../docs/sviluppo/foto-giro110');
const srv = await L.startServer(); const port = srv.address().port; const b = await L.launchBrowser();
const TUTTI = [11, 17, 20, 23, 24, 25, 27, 31].map(n => '__CPM_NO_G110_' + n);
const shot = (page, nome, clip) => page.screenshot({ path: path.join(OUT, nome + '.jpg'), type: 'jpeg', quality: 72, clip });
for (const arm of ['prima', 'dopo']) {
  const flags = arm === 'prima' ? TUTTI : [];
  { const f = L.FORMATI[2]; const { ctx, page } = await L.apriCarriera(b, port, f, 'rosso', { flags }); 
    await page.evaluate(() => window.__CPM_CAREER.goTab('standings')); await L.sleep(800); await shot(page, `G180-11-classifica-pc-${arm}`, { x: 0, y: 150, width: 1100, height: 620 });
    await page.evaluate(() => window.__CPM_CAREER.goTab('calendar')); await L.sleep(800); await shot(page, `G180-20-calendario-pc-${arm}`, { x: 0, y: 0, width: 1440, height: 500 });
    await ctx.close(); }
  { const f = L.FORMATI[0]; const { ctx, page } = await L.apriCarriera(b, port, f, 'rosso', { flags });
    await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await L.sleep(800); await shot(page, `G180-25-home-360-${arm}`, undefined);
    await ctx.close(); }
  { const f = L.FORMATI[1]; const { ctx, page } = await L.apriCarriera(b, port, f, 'giallo', { flags, anim: true });
    await L.portaPartita(page, 'playing', {
      formations: async () => { await L.sleep(500); await shot(page, `G180-24-formazioni-412-${arm}`, undefined); },
      walkout: async () => { await L.sleep(600); await shot(page, `G180-33-ingresso-412-${arm}`, undefined); } });
    await shot(page, `G180-27-possesso-412-${arm}`, undefined);
    await page.evaluate(() => window.__CPM_CAREER && 0);
    if (await L.portaScelta(page) && await L.risolvi(page, 'gol')) { for (let k = 0; k < 40; k++) { const w = await page.evaluate(() => { const p = document.querySelector('[data-cpm="pillola-esito"]'); return p ? p.getBoundingClientRect().width : 0; }); if (w > 0) { await L.sleep(250); await shot(page, `G180-17-esito-412-${arm}`, undefined); break; } await L.sleep(170); } }
    await ctx.close(); }
  { const f = L.FORMATI[2]; const { ctx, page } = await L.apriCarriera(b, port, f, 'giallo', { flags, anim: true });
    await L.portaPartita(page, 'playing'); if (await L.portaScelta(page)) await shot(page, `G180-31-giocate-pc-${arm}`, { x: 990, y: 60, width: 450, height: 840 });
    await ctx.close(); }
  console.log('foto', arm, 'fatte');
}
await b.close(); srv.close();
