#!/usr/bin/env node
/* [collaudo PO gi146 «Si tuffa a terra senza nemmeno guardare o avvicinarsi al pallone/avversario»]
   GUARDIANO: il gesto difensivo di famiglia a terra (slide/lunge) NON deve partire quando il pallone
   e' lontano — misurato su gi146 az.0: fallback 7.415 a 1,4s col pallone mai sotto 11,6u, spinta 7.420
   (tetto 5,2u) incapace di chiudere il gap → scivolata/affondo nel vuoto. Dal fix, oltre 6,5u la
   famiglia degrada a `press` (= locomozione GLB-ON per la mappa 7.245: l'eroe CORRE addosso al
   portatore invece di buttarsi a terra). Fase A: con __CPM_NO440 il rosso deve riprodursi (clip
   montata col pallone lontano). Fase B: senza interruttore, nessuna clip e l'eroe accorcia. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

/* GLB-ON (direttiva CH38: le verifiche percettive si fanno col vestito vero). __CPM_REC accende
   __CPM_GST (stato del gesto GLB dell'eroe, scritto DENTRO il loop). */
async function runScene(no440) {
  const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
  await page.addInitScript(flag => { window.__CPM_PRESENT = 1; window.__CPM_REC = 1; if (flag) window.__CPM_NO440 = 1; }, no440);
  await openMatch(page, port);
  await page.waitForFunction(() => !!window.__CPM_FORCE_SIT && !!window.__CPM_SITS, null, { timeout: 90000 });
  await sleep(4000); // avatar GLB montati
  await page.evaluate(() => { window.__CPM_FORCE_INTRO = 0; window.__CPM_FORCE_SIT(146, true); });
  await sleep(1000);
  /* campiona __CPM_GST + distanza eroe-palla per tutta la risoluzione */
  await page.evaluate(() => {
    window.__CPM_146 = [];
    const tick = () => {
      try {
        const g = window.__CPM_GST, s = window.__CPM_STATE && window.__CPM_STATE();
        if (s && window.__CPM_146.length < 800) {
          window.__CPM_146.push({ at: g ? g.at : null, want: g ? g.want : null, cur: g ? g.cur : null,
            db: +Math.hypot(s.hero.x - s.ball.x, s.hero.y - s.ball.y).toFixed(1) });
        }
      } catch (e) {}
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.evaluate(() => window.__CPM_RESOLVE(0)); // az.0 «Blocca con tutto il fisico» (lunge, palla a 11u)
  /* headless GLB-ON gira a frazioni di fps: si ASPETTA che i frame di gesto compaiano e si ferma
     quando smettono di crescere (o al tetto), invece di uno sleep fisso che campiona il nulla */
  let last = -1;
  for (let w = 0; w < 30; w++) {
    await sleep(2000);
    const n = await page.evaluate(() => (window.__CPM_146 || []).filter(f => f.at === 'tackle').length);
    if (n > 0 && n === last) break;
    last = n;
  }
  const tl = await page.evaluate(() => { const a = window.__CPM_146 || []; window.__CPM_146 = []; return a; });
  console.log(`  (campioni totali ${tl.length}, con at: ${[...new Set(tl.map(f => f.at))].join(',') || '—'})`);
  await page.close();
  return tl;
}

/* ── Fase A: rosso riprodotto — con l'interruttore la clip parte col pallone lontano ── */
{
  const tl = await runScene(true);
  const act = tl.filter(f => f.at === 'tackle');
  const farClip = act.filter(f => (f.want || f.cur) && f.db > 6.5);
  console.log(`fase A: ${act.length} frame di gesto · ${farClip.length} con clip montata a >6,5u (min d.palla ${act.length ? Math.min(...act.map(f => f.db)) : '—'})`);
  if (!act.length) issues.push('fase A: il gesto difensivo non e\' mai partito (strumento muto)');
  else if (!farClip.length) issues.push('fase A: con __CPM_NO440 la clip lontana non si riproduce — l\'interruttore non riapre il rosso');
  else console.log('fase A (rosso riprodotto): gesto tecnico montato col pallone a distanza doppia cifra, come pre-fix ✓');
}

/* ── Fase B: col fix, niente clip lontana e l'eroe accorcia ── */
{
  const tl = await runScene(false);
  const act = tl.filter(f => f.at === 'tackle');
  const farClip = act.filter(f => (f.want || f.cur) && f.db > 6.5);
  const dbs = act.map(f => f.db);
  console.log(`fase B: ${act.length} frame di gesto · ${farClip.length} con clip a >6,5u · d.palla ${dbs.length ? dbs[0] + '→' + dbs[dbs.length - 1] : '—'}`);
  if (!act.length) issues.push('fase B: il gesto difensivo non e\' mai partito');
  if (farClip.length) issues.push(`fase B: ${farClip.length} frame con clip tecnica montata col pallone oltre 6,5u — il tuffo cieco di gi146 e' ancora li'`);
  if (dbs.length >= 4 && dbs[dbs.length - 1] > dbs[0] + 1) issues.push(`fase B: l'eroe NON accorcia verso il pallone (${dbs[0]}→${dbs[dbs.length - 1]}u)`);
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ GESTO DIFENSIVO LONTANO OK (a >6,5u niente corpo a terra: pressing in corsa · rosso riproducibile con __CPM_NO440)');
process.exit(issues.length ? 1 : 0);
