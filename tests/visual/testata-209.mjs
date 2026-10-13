#!/usr/bin/env node
/* [giro 11 PO-209/PO-211 «intestazione FC Laguna dopo il cambio di squadra»] GUARDIANO sul flusso vero (S12 portato alla settimana 20).
   RIPRODOTTO: l'eroe gioca col club A (FC Laguna); dopo il fischio arriva l'offerta del club B (FC Moreira) e l'intervista resta in coda
   finche' l'offerta e' aperta (src/18-career-app.jsx, blocco intervista). Firmata l'offerta, l'intervista leggeva player.club AL MOMENTO in
   cui la si guarda: «MRA 0-0 FC Sicania» per una partita giocata da FC Laguna — lo schema della foto PO-211. Il tabellino era giusto.
   Ora onMatchEnd congela nell'intervista il club con cui si e' giocato. VERDE: tabellino «FC Laguna» ed edicola «LAG …». ROSSO
   (__CPM_NO_TESTA209): edicola «MRA …». Uso: node testata-209.mjs  (un braccio solo: node testata-209.mjs post [rosso]) */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
if (!process.argv[2]) {
  const es = {};
  for (const r of ['verde', 'rosso']) { let o = ''; try { o = execFileSync(process.execPath, [new URL(import.meta.url).pathname, 'post', r === 'rosso' ? 'rosso' : 'verde'], { encoding: 'utf8', timeout: 560000 }); } catch (e) { o = String(e.stdout || '') + String(e.message || ''); }
    const iv0 = (o.match(/INTERVISTA\[0\] ([^\n]*)/) || [])[1] || ''; const ed = (o.match(/EDICOLA: ([^\n]*)/) || [])[1] || null, ta = (o.match(/TESTATA TABELLINO: ([^\n]*)/) || [])[1] || null;
    es[r] = { ed, ta, scena: /MOREIRA|MRA/.test(iv0) ? 'FC Moreira' : /LAGUNA|LAG/.test(iv0) ? 'FC Laguna' : 'n.d.' }; console.log(r.toUpperCase() + ' tabellino ' + ta + ' · edicola «' + ed + '» · scena dell\'intervista ' + es[r].scena); }
  const g = [];
  if (!(es.verde.ta && /FC Laguna/.test(es.verde.ta))) g.push('verde: tabellino non letto o senza FC Laguna');
  if (!(es.verde.ed && /· LAG /i.test(es.verde.ed) && !/MRA/.test(es.verde.ed))) g.push('verde: edicola «' + es.verde.ed + '»');
  if (es.verde.scena !== 'FC Laguna') g.push('verde: scena dell\'intervista ' + es.verde.scena);
  if (!(es.rosso.ed && /MRA/.test(es.rosso.ed))) g.push('rosso: il difetto non si vede («' + es.rosso.ed + '»)');
  if (g.length) { console.log('❌ testata-209'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
  console.log('✅ testata-209 verde (intervista col club della partita) e il rosso si vede'); process.exit(0);
}
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const SC = process.argv[2] || 'post'; const ROSSO = process.argv[3] === 'rosso';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
page.on('pageerror', e => console.log('PAGEERROR', e.message.slice(0, 160)));
const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player; pl.week = 20; pl.weekLived = false; pl.matchHistory = []; delete pl.playedMd;
await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; window.__CPM_REC = true; if (r) window.__CPM_NO_TESTA209 = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, ROSSO]);
await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
const dismiss = async () => { try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {} };
await dismiss();
const club = () => page.evaluate(() => { const g = window.__CPM_CAREER.get(); return null; });
const pClub = async () => page.evaluate(() => { try { const s = JSON.parse(localStorage.getItem('cpm-v3')); const p = s.player || s; return { club: p.club && p.club.n, a: p.club && p.club.a, lg: p.club && p.club.lg, week: p.week, loan: p.loan ? (p.loan.parentClub && p.loan.parentClub.n) : null }; } catch (e) { return 'err ' + e.message; } });
const firma = async (id, type) => {
  const ok = await page.evaluate(([id, type]) => { const c = CLUBS.find(x => x.id === id); return window.__CPM_CAREER.setOffer({ club: c, type, minutaggio: 70, moralBonus: 8, growthBonus: 8, prestigeRatio: 1, wage: 900, duration: 2, ...(type.startsWith('prestito') ? { buyClause: null } : {}) }); }, [id, type]);
  await sleep(800);
  await page.getByRole('button', { name: 'Accetta', exact: true }).first().click({ timeout: 8000 });
  await sleep(1500);
  for (let i = 0; i < 4; i++) { try { await page.getByText(/Continua|Inizia|Avanti/).first().click({ timeout: 2500 }); await sleep(700); } catch (e) { break; } }
  await dismiss(); await sleep(1500);
  console.log('dopo firma', id, type, JSON.stringify(await pClub()));
};
const gioca = async () => {
  const wks = await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3')); const p = s.player || s; return (p.calendar || []).filter(m => !m.played && !m.type && m.week >= (p.week || 1)).sort((a, b) => a.week - b.week).map(m => [m.week, m.opponentName, m.isHome]); });
  let ok = false;
  for (const [w, o, h] of wks.slice(0, 8)) {
    await page.evaluate((w) => window.__CPM_CAREER.patch({ week: w, weekLived: false, playedMd: null }), w); await sleep(1300); await dismiss(); await sleep(400);
    let r = await page.evaluate(() => window.__CPM_CAREER.playMatch());
    if (r === 'opening') { await page.evaluate(() => window.__CPM_CAREER.resolveOpening()); await sleep(800); r = await page.evaluate(() => window.__CPM_CAREER.playMatch()); }
    console.log('settimana', w, 'vs', o, h ? 'casa' : 'trasferta', 'playMatch ->', r);
    if (r === true) { ok = true; break; }
  }
  if (!ok) return false;
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 2021, policy: 'seeded', tickMs: 150 }));
  const t0 = Date.now(); let ph = '';
  while (Date.now() - t0 < 400000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph === 'ended') break; await sleep(1000); }
  await sleep(2500);
  const t = await page.evaluate(() => { const sp = [...document.querySelectorAll('span')].filter(s => s.textContent === '—'); const r = sp.map(s => { const p = s.parentElement; return [...p.children].map(c => c.textContent).join(' | '); }); return r; });
  console.log('fase', ph, Math.round((Date.now() - t0) / 1000) + 's', 'TESTATA TABELLINO:', JSON.stringify(t));
  return ph === 'ended';
};
const leggiIntervista = async () => {
  for (let k = 0; k < 5; k++) {
    const iv = await page.evaluate(() => { const el = document.querySelector('[data-cpm="intervista231"]'); return el ? el.innerText.replace(/\s+/g, ' ').slice(0, 600) : null; });
    console.log('INTERVISTA[' + k + ']', iv, 'blk=', await page.evaluate(() => window.__CPM_IVBLK231));
    if (!iv) return;
    if (/Domani in edicola/i.test(iv)) { console.log('EDICOLA:', (iv.match(/Domani in edicola.{0,40}/i) || [])[0]); return; }
    try { await page.locator('[data-cpm="intervista231"] button').filter({ hasText: /«/ }).first().click({ timeout: 4000 }); } catch (e) { console.log('click risposta fallito', e.message.slice(0, 80)); return; }
    await sleep(900);
  }
};
const fine = async () => { await page.getByText('Torna alla dashboard').first().click({ timeout: 10000 }); };

if (SC === 'post') { // gioca col club A, firma per B tra fischio e intervista
  await firma('ven', 'trasferimento definitivo');
  if (await gioca()) {
    await fine(); await sleep(300);
    await page.evaluate(() => { const c = CLUBS.find(x => x.id === 'morei'); window.__CPM_CAREER.setOffer({ club: c, type: 'trasferimento definitivo', minutaggio: 70, moralBonus: 8, growthBonus: 8, prestigeRatio: 1, wage: 900, duration: 2 }); });
    await sleep(1500); console.log('blocco intervista prima di firmare:', await page.evaluate(() => window.__CPM_IVBLK231));
    await page.getByRole('button', { name: 'Accetta', exact: true }).first().click({ timeout: 8000 }); await sleep(1500);
    for (let i = 0; i < 4; i++) { try { await page.getByText(/Continua|Inizia|Avanti/).first().click({ timeout: 2500 }); await sleep(700); } catch (e) { break; } }
    await sleep(1500); console.log('club ora', JSON.stringify(await pClub()));
    await leggiIntervista();
  }
} else if (SC === 'prestito') { // proprietario Moreira, prestito a Laguna
  await firma('morei', 'trasferimento definitivo');
  await firma('ven', 'prestito secco');
  if (await gioca()) { await fine(); await sleep(2500); await leggiIntervista(); }
} else if (SC === 'cambio') { // Laguna -> Moreira prima della partita
  await firma('ven', 'trasferimento definitivo');
  await firma('morei', 'trasferimento definitivo');
  if (await gioca()) { await fine(); await sleep(2500); await leggiIntervista(); }
} else if (SC === 'mezzo') { // il club cambia mentre il tabellino e' montato (patch del player)
  await firma('morei', 'trasferimento definitivo');
  if (await gioca()) {
    await page.evaluate(() => { const c = CLUBS.find(x => x.id === 'ven'); window.__CPM_CAREER.patch({ club: { ...c, transferType: 'x' } }); }); await sleep(800);
    const t = await page.evaluate(() => [...document.querySelectorAll('span')].filter(s => s.textContent === '—').map(s => [...s.parentElement.children].map(c => c.textContent).join(' | ')));
    console.log('TESTATA DOPO CAMBIO CLUB A SCHERMATA MONTATA:', JSON.stringify(t));
  }
}
await ctx.close(); await b.close(); srv.close();
