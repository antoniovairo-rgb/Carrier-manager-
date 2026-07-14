#!/usr/bin/env node
/* [7.51.0 SET-PIECE 2.0] PROBE — rigori/punizioni a scelte:
   (A) MOTORE (in-page, window.__CPM_SP): determinismo · cucchiaio gated · monotonia skill
       (élite converte ≥ mediocre su ogni scelta) · nessuna scelta dominante (spread EV bounded)
       · rigore ≫ punizione · pressione riduce la conversione.
   (B) UI: sit RIGORE forzata → bottoni di STILE (non più griglia frecce) → click «incrocio»
       → hl_result con outcome + ActionResolved intent penalty in timeline.
   (C) UI: punizione TIRO DIRETTO → opzioni diverse (giro/bordata/rasoterra + consegna). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
await installCdnRoutes(page);
const issues = [];
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 160)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port);

// ── (A) motore puro ──
const eng = await page.evaluate(() => {
  const SP = window.__CPM_SP; if (!SP) return { err: 'no __CPM_SP' };
  const mk = v => ({ 'velocità': v, tecnica: v, fisico: v, 'mentalità': v, tiro: v, passaggio: v, dribbling: v, posizionamento: v });
  const MED = mk(58), ELI = mk(88);
  const ctx0 = { oppPrestige: 70, clock: 30, scoreDiff: 0, mw: 5, morale: 60, form: 70, fatigue: 20 };
  const out = { det: true, gate: null, mono: [], ev: {}, penVsFk: null, press: null };
  // determinismo
  for (let i = 0; i < 60; i++) {
    const c = SP.setPieceChoices('penalty', ELI)[i % 4];
    const a = SP.resolveSetPieceShot('penalty', c, { ...ctx0, attrs: ELI, seed: 1000 + i });
    const b = SP.resolveSetPieceShot('penalty', c, { ...ctx0, attrs: ELI, seed: 1000 + i });
    if (a.outKind !== b.outKind) out.det = false;
  }
  // gating cucchiaio
  out.gate = { med: SP.setPieceChoices('penalty', MED).some(c => c.id === 'pen_chip'), eli: SP.setPieceChoices('penalty', ELI).some(c => c.id === 'pen_chip') };
  // conversioni per scelta/profilo (2000 seed)
  const conv = (kind, choice, attrs, extra) => { let g = 0; for (let i = 0; i < 2000; i++) { const r = SP.resolveSetPieceShot(kind, choice, { ...ctx0, ...(extra || {}), attrs, seed: 7777 + i * 13 }); if (r.ok) g++; } return g / 2000; };
  for (const c of SP.setPieceChoices('penalty', ELI)) {
    const e = conv('penalty', c, ELI), m = conv('penalty', c, MED);
    out.ev[c.id] = { eli: +e.toFixed(3), med: +m.toFixed(3) };
    out.mono.push({ id: c.id, ok: e >= m - 0.02 });
  }
  const evs = Object.values(out.ev).map(x => x.eli);
  out.spreadEli = +(Math.max(...evs) - Math.min(...evs)).toFixed(3);
  // rigore >> punizione (stessa scelta "curl"≈"precise" di famiglia)
  const fkC = SP.setPieceChoices('fk_near', ELI)[0];
  out.penVsFk = { pen: out.ev.pen_precise.eli, fk: +conv('fk_near', fkC, ELI).toFixed(3) };
  // pressione riduce (profilo MEDIO: mentalità bassa non smorza)
  const cLow = SP.setPieceChoices('penalty', MED)[0];
  out.press = { calm: +conv('penalty', cLow, MED).toFixed(3), hot: +conv('penalty', cLow, MED, { clock: 88, scoreDiff: 0, mw: 9, decisive: true }).toFixed(3) };
  // IA: sceglie nel set disponibile, deterministica
  const a1 = SP.pickSetPieceChoiceAI('penalty', ELI, ctx0, 42), a2 = SP.pickSetPieceChoiceAI('penalty', ELI, ctx0, 42);
  out.ai = { same: a1.id === a2.id, id: a1.id };
  return out;
});
console.log('(A) motore:', JSON.stringify(eng));
if (eng.err) issues.push(eng.err);
else {
  if (!eng.det) issues.push('(A) resolveSetPieceShot NON deterministico');
  if (eng.gate.med || !eng.gate.eli) issues.push('(A) gating cucchiaio rotto: ' + JSON.stringify(eng.gate));
  for (const m of eng.mono) if (!m.ok) issues.push('(A) monotonia skill violata su ' + m.id);
  if (eng.spreadEli > 0.16) issues.push('(A) scelta dominante al rigore (spread EV élite ' + eng.spreadEli + ' > 0.16)');
  if (!(eng.penVsFk.pen > eng.penVsFk.fk + 0.15)) issues.push('(A) rigore NON ≫ punizione: ' + JSON.stringify(eng.penVsFk));
  if (!(eng.press.calm > eng.press.hot + 0.02)) issues.push('(A) la pressione non riduce la conversione: ' + JSON.stringify(eng.press));
  if (!eng.ai.same) issues.push('(A) IA non deterministica');
}

// ── (B) UI rigore ──
const gis = await page.evaluate(() => {
  const S = window.__CPM_SITS || []; const f = (re) => S.findIndex(s => re.test(s.text || ''));
  return { pen: f(/RIGORE! Sul dischetto\./), fk: f(/Punizione dal limite — tiro diretto/) };
});
if (gis.pen < 0 || gis.fk < 0) issues.push('(B) sit rigore/punizione non trovate: ' + JSON.stringify(gis));
else {
  await page.evaluate(() => window.__CPM_TIMELINE_RESET && window.__CPM_TIMELINE_RESET());
  await forceSituation(page, gis.pen, { settle: 600, choose: true });
  const ui1 = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')].map(b => b.innerText || '');
    return { styles: btns.filter(t => /angolato e preciso|Tiro potente|incrocio|Cucchiaio/i.test(t)).length, arrows: btns.filter(t => /Alto SX|Basso CTR/i.test(t)).length };
  });
  console.log('(B) rigore UI:', JSON.stringify(ui1));
  if (ui1.styles < 3) issues.push('(B) bottoni di stile assenti sul rigore (' + ui1.styles + ')');
  if (ui1.arrows > 0) issues.push('(B) la vecchia griglia frecce è ancora renderizzata');
  try { await page.getByRole('button').filter({ hasText: /incrocio/i }).first().click({ timeout: 4000 }); } catch (e) { issues.push('(B) click incrocio fallito'); }
  await sleep(2300);
  const res1 = await page.evaluate(() => ({ phase: window.__CPM_PHASE ? window.__CPM_PHASE() : null, tl: (window.__CPM_TIMELINE ? window.__CPM_TIMELINE() : []).filter(e => e.type === 'ActionResolved').map(e => ({ intent: e.intent, key: e.key })) }));
  console.log('(B) esito:', JSON.stringify(res1));
  if (res1.phase !== 'hl_result') issues.push('(B) fase attesa hl_result, trovata ' + res1.phase);
  if (!res1.tl.some(e => e.intent === 'penalty' && (e.key === 'goal' || e.key === 'miss'))) issues.push('(B) ActionResolved penalty assente/incoerente');

  // ── (C) UI punizione diretta ──
  await forceSituation(page, gis.fk, { settle: 600, choose: true });
  const ui2 = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')].map(b => b.innerText || '');
    return { fk: btns.filter(t => /Giro sopra la barriera|Bordata potente|Rasoterra sotto/i.test(t)).length, delivery: btns.filter(t => /Palla in area/i.test(t)).length, pen: btns.filter(t => /Cucchiaio/i.test(t)).length };
  });
  console.log('(C) punizione UI:', JSON.stringify(ui2));
  if (ui2.fk < 3) issues.push('(C) opzioni punizione mancanti (' + ui2.fk + ')');
  if (ui2.delivery < 1) issues.push('(C) opzione di consegna assente');
  if (ui2.pen > 0) issues.push('(C) opzioni da RIGORE sulla punizione');
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ SET-PIECE 2.0 OK (motore deterministico/bilanciato · UI a scelte · timeline coerente)');
process.exit(issues.length ? 1 : 0);
