/* [STRUMENTO] GLI ARRIVI DEL PIANO SONO CUSTODITI? — collaudo PO: «non ci sono azioni ben manovrate».
   Un'azione manovrata e' passaggio -> uomo -> controllo -> passaggio. Il piano nomina un ricevente per
   ogni tempo (`chi`), ma nessuna banda sorveglia le costruzioni: il testimone della custodia le ESCLUDE
   per progetto, quindi le sole scene che il PO guarda sono le sole non guardate da nessun metro.
   Qui: a ogni riga di piano (rk manovra-gol) si misura, DUE campioni dopo (il volo), la distanza fra il
   pallone e l'uomo piu' vicino della squadra che attacca. Arrivo custodito = sotto 4u. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const arrivi = [];
for (const seme of [7300, 9200]) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_REC = true; });
  await openMatch(page, port, { skipLoadAll: true, name: 'Ar' });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), seme);
  let nPrev = 0;
  for (let k = 0; k < 900; k++) {
    await sleep(250);
    const r = await page.evaluate(() => { try {
      const ev = (window.__CPM_EV && window.__CPM_EV()) || [];
      const st = window.__CPM_STATE && window.__CPM_STATE();
      const piani = ev.filter(e => e.ev === 'chronicle' && (e.rk === 'manovra-gol'));
      return { n: piani.length, c: st ? st.clock : null };
    } catch (_e) { return null; } });
    if (!r) continue;
    if (r.n > nPrev) { nPrev = r.n;
      await sleep(700); /* il volo: ~2 campioni */
      const m = await page.evaluate(() => { try {
        const st = window.__CPM_STATE && window.__CPM_STATE(); if (!st || !st.players || !st.ball) return null;
        const h = window.__CPM_HOLD && window.__CPM_HOLD();
        const d = (h && h.pgDir) || 1; const lato = d > 0 ? 'home' : 'away';
        const bx = st.ball.x + 50, by = st.ball.z / 0.68 + 50;
        let md = 1e9; st.players.forEach(p => { if (p.team !== lato || p.gk) return; const dd = Math.hypot(p.x - bx, p.y - by); if (dd < md) md = dd; });
        return { md: +md.toFixed(1) };
      } catch (e) { return null; } });
      if (m) arrivi.push(m.md);
    }
    if (r.c != null && r.c >= 89) break;
  }
  await page.close();
}
await b.close(); srv.close();
const ord = arrivi.slice().sort((a, c) => a - c);
console.log(`\n=== GLI ARRIVI DEL PIANO SONO CUSTODITI? ${process.env.CPM_ROSSO ? '· ROSSO ' + process.env.CPM_ROSSO : '· VERDE'} ===\n`);
console.log(`  arrivi misurati: ${arrivi.length}`);
if (arrivi.length) {
  console.log(`  distanza uomo-piu'-vicino → pallone: mediana ${ord[ord.length >> 1]}u · p90 ${ord[Math.floor(ord.length * 0.9)]}u · max ${ord[ord.length - 1]}u`);
  console.log(`  arrivi CUSTODITI (<4u): ${arrivi.filter(v => v < 4).length}/${arrivi.length}`);
}
console.log('');
