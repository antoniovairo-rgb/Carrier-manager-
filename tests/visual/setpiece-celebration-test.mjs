#!/usr/bin/env node
/* [7.373.0] GUARDIANO §14/§15 — IL GOL DA RIGORE E DA PUNIZIONE DEVE ESULTARE.

   Il Celebration System (7.371) ha una sola porta: `fireGoalCeleb`. Ma il ramo dei piazzati
   (`handleSetPiece`) non la attraversa — il commento nel codice lo dichiara da sempre: «boato sul
   gol da rigore (non passa da fireGoalCeleb)». Conseguenza misurata: su un rigore segnato non
   parte NIENTE — ne' piano d'esultanza, ne' boato del pubblico, ne' coriandoli, ne' `celebT` nel
   render-loop (che si arma dal cambio di `waveEvent`). Non e' una lacuna della feature nuova: e'
   un buco piu' vecchio che la feature nuova ha reso visibile.

   Il piazzato non si puo' pilotare con `__CPM_RESOLVE` (quella strada porta a `handleAction`):
   la scelta si fa da overlay, quindi la sonda CLICCA come farebbe il giocatore.
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node setpiece-celebration-test.mjs             */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const issues = [];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 130)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port);
await sleep(900);

/* le scene di piazzato: rigore e punizione diretta */
const SP = await page.evaluate(() => {
  const out = { pen: [], fk: [] }; const S = window.__CPM_SITS || [];
  for (let i = 0; i < S.length; i++) {
    const s = S[i]; if (!s) continue;
    const it = (typeof window.deriveIntent === 'function') ? window.deriveIntent(s) : null;
    if (it === 'penalty' && out.pen.length < 3) out.pen.push(i);
    else if (it === 'freekick' && out.fk.length < 3) out.fk.push(i);
  }
  return out;
});
console.log(`scene: rigori ${SP.pen.join(',') || '—'} · punizioni ${SP.fk.join(',') || '—'}`);

let misurati = 0, senzaPiano = 0, senzaBoato = 0; const righe = [];
for (const [tipo, gis] of [['rigore', SP.pen], ['punizione', SP.fk]]) {
  for (const gi of gis) {
    await page.evaluate(g => { window.__CPM_CELEB = null; window.__CPM_WAVE_SEEN = 0; window.__CPM_FORCE_SIT(g, true); }, gi);
    await sleep(900);
    /* la scelta del piazzato e' un overlay di bottoni: si clicca il primo disponibile */
    const cliccato = await page.evaluate(() => {
      const bs = [...document.querySelectorAll('button')].filter(b => {
        const t = (b.textContent || '').trim();
        return t && /incrocio|potenza|angolo|cucchiaio|barriera|piazzat|curva|rasoterra|forte|preciso/i.test(t);
      });
      if (!bs.length) return null;
      bs[0].click(); return (bs[0].textContent || '').trim().slice(0, 40);
    });
    if (!cliccato) continue;
    await sleep(4200);
    const r = await page.evaluate(() => ({
      cel: window.__CPM_CELEB || null,
      /* il boato/coriandoli si armano dal cambio di waveEvent: se il piano non c'e' nemmeno quello parte */
      goals: (window.__CPM_STATE && window.__CPM_STATE()) ? 1 : 0,
    }));
    misurati++;
    const ok = !!r.cel;
    if (!ok) senzaPiano++;
    righe.push(`  ${tipo} gi${gi} «${cliccato}» → piano ${ok ? r.cel.pick + ' (' + r.cel.ctx.tier + ')' : 'NESSUNO'}`);
  }
}
righe.forEach(r => console.log(r));
console.log(`\npiazzati misurati ${misurati} · senza piano d'esultanza ${senzaPiano}`);

if (misurati < 2) issues.push(`solo ${misurati} piazzati osservati: la misura non e' stata fatta (overlay non trovato?)`);
else if (senzaPiano > 0) issues.push(`${senzaPiano} gol da piazzato su ${misurati} non producono nessuna esultanza (§14/§15: rigore e punizione devono esultare come ogni altro gol)`);

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ ' + issues.length + ' problemi:'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ PIAZZATI OK — anche rigori e punizioni esultano');
