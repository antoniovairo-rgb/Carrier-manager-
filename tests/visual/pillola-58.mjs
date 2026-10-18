#!/usr/bin/env node
/* [giro 58 — segnalazione del giro 54 «pillola PALLA PERSA sopra il tabellone»] guardiano della pillola d'esito degli highlight
   (`floatGoal`, data-cpm="pillola-esito", src/15): e' la stessa per GOL!/PARATA/PALLA PERSA, quindi si misura la prima che compare.
   Geometria, non cronometro: a pillola comparsa si legge il rettangolo a riposo e quello di FINE CORSA di floatUp (translateY -60px,
   applicato per un istante con l'animazione sospesa), e si confronta col fondo del tabellone [data-cpm="barra"].
   Due altezze: 412x915 e 412x740 (telefono con le barre del browser). VERDE: a fine corsa ≥ 8 px sotto il tabellone a entrambe.
   ROSSO (__CPM_NO_PILLOLA58): ≤ 3 px ad almeno una. Uso: node pillola-58.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const br = await launchBrowser();
async function misura(rosso, h) {
  const ctx = await br.newContext({ viewport: { width: 412, height: h }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript((r) => { if (r) window.__CPM_NO_PILLOLA58 = 1; }, rosso);
  const { total } = await openMatch(page, port);
  for (let gi = 0; gi < Math.min(total, 40); gi++) {
    await page.evaluate(([i]) => window.__CPM_FORCE_SIT(i, true), [gi]); await sleep(400);
    await page.evaluate(() => window.__CPM_RESOLVE(0)); const t0 = Date.now();
    while (Date.now() - t0 < 4000) {
      const m = await page.evaluate(() => { const p = document.querySelector('[data-cpm="pillola-esito"]'), barra = document.querySelector('[data-cpm="barra"]'); if (!p || !barra) return null;
        const inn = p.firstElementChild || p, an = p.style.animation, tf = p.style.transform;
        p.style.animation = 'none'; p.style.transform = 'none'; const a = inn.getBoundingClientRect();
        p.style.transform = 'translateY(-60px)'; const f = inn.getBoundingClientRect(); p.style.transform = tf; p.style.animation = an;
        return { testo: (p.innerText || '').slice(0, 30), barraFondo: Math.round(barra.getBoundingClientRect().bottom), riposo: Math.round(a.top), fine: Math.round(f.top) }; });
      if (m) { await ctx.close(); return { h, gi, ...m, distanza: m.fine - m.barraFondo }; }
      await sleep(100); } }
  await ctx.close(); return { h, cieco: true };
}
const ris = []; for (const rosso of [false, true]) for (const h of [915, 740]) ris.push({ rosso, ...(await misura(rosso, h)) });
for (const x of ris) console.log((x.rosso ? 'ROSSO ' : 'VERDE ') + JSON.stringify(x));
const v = ris.filter(x => !x.rosso), r = ris.filter(x => x.rosso);
const cieco = ris.some(x => x.cieco); const ok = !cieco && v.every(x => x.distanza >= 8) && r.some(x => x.distanza <= 3);
await br.close(); srv.close();
console.log(cieco ? '❌ pillola-58 CIECO (nessuna pillola comparsa)' : ok ? '✅ pillola-58 verde (e il rosso si vede)' : '❌ pillola-58 ROSSO'); process.exit(ok ? 0 : 1);
