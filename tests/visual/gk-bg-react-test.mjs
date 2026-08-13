#!/usr/bin/env node
/* [collaudo PO «il portiere non accenna e tenta la parata/tuffo in nessun highlights, sembra imbabolato»]
   GUARDIANO: gli archi della CRONACA AMBIENTALE (fase "playing" — cio' che si guarda per la maggior parte
   della partita live) devono innescare la reazione del portiere bersaglio: tiro → tuffo corto (accenna,
   non indovina sempre), parata raccontata → riflesso a corpo se centrale / tuffo disteso se angolata.
   Misurato il rosso (pre-fix): 60s di cronaca, tiro a x=83 con reazione nulla, 0/220 fotogrammi GK attivi.
   Strumenti: __CPM_BG_INJECT (iniettore test-only, stesso setBgAction del feed reale) + collettore
   __CPM_BGARC {tipo, destinazione, reazione al lancio}. Fase A: con l'interruttore __CPM_NO439 il difetto
   deve RIPRODURSI (rosso provato) — se non si riproduce, lo strumento non sta misurando nulla. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

async function openPage(no439) {
  const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
  await page.addInitScript(flag => { window.__CPM_REC = 1; if (flag) window.__CPM_NO439 = 1; }, no439);
  await openMatch(page, port);
  await page.waitForFunction(() => !!window.__CPM_BG_INJECT, null, { timeout: 60000 });
  return page;
}

/* inietta un'azione BG e aspetta che l'arco parta (nuova riga in __CPM_BGARC che matcha ex/ey);
   ritenta se l'arco precedente era ancora in volo (il lancio richiede !ballArcActive). */
async function inject(page, ty, x, y) {
  for (let tryN = 0; tryN < 6; tryN++) {
    const before = await page.evaluate(() => (window.__CPM_BGARC || []).length);
    await page.evaluate(a => window.__CPM_BG_INJECT(a.ty, a.x, a.y), { ty, x, y });
    for (let w = 0; w < 20; w++) {
      await sleep(500);
      const row = await page.evaluate(({ b, x, y }) => {
        const arr = window.__CPM_BGARC || [];
        for (let i = b; i < arr.length; i++) if (arr[i].ex === x && arr[i].ey === y) return arr[i];
        return null;
      }, { b: before, x, y });
      if (row) return row;
    }
    await sleep(2500); // arco precedente forse ancora in volo: lascia atterrare e ritenta
  }
  return null;
}

/* ── Fase A: rosso provato — con l'interruttore la reazione NON deve esserci ── */
{
  const page = await openPage(true);
  const r = await inject(page, 'shot', 93, 62);
  if (!r) issues.push('fase A: arco non lanciato (iniettore muto)');
  else if (r.gk) issues.push(`fase A: con __CPM_NO439 la reazione c'e' comunque (${r.gk}) — l'interruttore non riproduce il rosso`);
  else console.log('fase A (rosso riprodotto): tiro in cronaca senza reazione GK, come pre-fix ✓');
  await page.close();
}

/* ── Fase B: comportamento corretto ── */
{
  const page = await openPage(false);
  /* la scelta riflesso/tuffo dipende da dove sta DAVVERO il portiere (dz registrato dal collettore):
     il contratto e' semantico — save con palla addosso (dz<2.4) → gk_block, save angolata → gk_dive,
     shot in porta → gk_dive (corto), conclusione lontana dalle porte → nessuna reazione. */
  const cases = [
    { ty: 'shot', x: 93, y: 62, why: 'tiro verso la porta ospite' },
    { ty: 'save', x: 8, y: 50, why: 'parata del portiere di casa (palla al centro)' },
    { ty: 'save', x: 8, y: 76, why: 'parata angolata' },
    { ty: 'shot', x: 52, y: 50, why: 'conclusione da centrocampo' },
  ];
  let blockSeen = 0, diveSeen = 0;
  for (const c of cases) {
    const r = await inject(page, c.ty, c.x, c.y);
    if (!r) { issues.push(`fase B: arco ${c.ty}@${c.x},${c.y} non lanciato`); continue; }
    const toGoal = c.x >= 70 || c.x <= 30;
    const want = !toGoal ? null : (c.ty === 'save' && r.dz != null && r.dz < 2.4) ? 'gk_block' : 'gk_dive';
    if ((r.gk || null) !== want) issues.push(`fase B: ${c.why} (dz=${r.dz}) — atteso ${want || 'null'}, avuto ${r.gk || 'null'}`);
    else console.log(`fase B: ${c.why} ✓ (${r.gk || 'nessuna'}${r.dz != null ? `, dz=${r.dz}` : ''})`);
    if (r.gk === 'gk_block') blockSeen++; if (r.gk === 'gk_dive') diveSeen++;
  }
  if (!diveSeen) issues.push('fase B: nessun tuffo osservato su tiri/parate in porta');
  /* il gesto GLB deve seguire il trigger: almeno un fotogramma del portiere con clip dive/block montata */
  const glb = await page.evaluate(() => {
    const tl = window.__CPM_GKTL || [];
    return { tot: tl.length, conGesto: tl.filter(f => f.isOpp && f.cur).length, conTrigger: tl.filter(f => f.opp).length };
  });
  console.log(`GLB: ${glb.conGesto} fotogrammi con clip montata · ${glb.conTrigger} con trigger attivo · ${glb.tot} campionati`);
  if (glb.conTrigger > 0 && glb.conGesto === 0) issues.push('il trigger scatta ma la clip GLB del portiere non si monta mai (imbabolato con altro vestito)');
  await page.close();
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ PORTIERE IN CRONACA OK (tiro → tuffo · parata → riflesso/tuffo · centrocampo → niente · rosso riproducibile con __CPM_NO439)');
process.exit(issues.length ? 1 : 0);
