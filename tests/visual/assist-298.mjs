#!/usr/bin/env node
/* [giro 93 PO-298 «un buon 90/95% degli assist dell'eroe falliscono!»] GUARDIANO su partite vere dal salvataggio S12 (pilota automatico
   con la politica «assist»: sceglie la giocata da assist quando c'e'). Per ogni scena d'assist dell'eroe legge il testimone __CPM_RES218
   (solo __CPM_REC): esito deciso dal motore (giocaScena: intercettato / tiro del compagno), chiave e tipo d'errore che consumano 3D e
   riquadro (M1: outcome.outKey/outKind), riquadro mostrato (testo, categoria, tono), fatti del motore (tabellino).
   Giudica:
     · nessun passaggio RIUSCITO raccontato come fallimento del passaggio (riquadro «intercetta/palla persa», tono «cattivo» senza dire
       che il compagno ha sbagliato) e nessun 3D che fa intercettare un passaggio arrivato;
     · gol del compagno ⟺ assist registrato nel tabellino del motore (gol con assist dell'eroe);
     · quota di passaggi riusciti e quota di gol del compagno dentro bande larghe (misurate, dichiarate in testa al rapporto).
   Rosso: __CPM_NO_ASSIST298 (il difetto deve vedersi). Uso: node assist-298.mjs   (CPM_ARMI=verde|rosso per un braccio solo,
   CPM_SEMI=1,2,3 per altri semi, CPM_MISURA=1 stampa e non giudica). */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const SEMI_V = (process.env.CPM_SEMI || '1234,2021,7,99').split(',').map(Number), SEMI_R = (process.env.CPM_SEMI_ROSSO || process.env.CPM_SEMI || '1234,2021').split(',').map(Number);
const ARMI = (process.env.CPM_ARMI || 'verde,rosso').split(',');
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
const _PERSO = /intercett|palla persa|anticipat|legge la giocata|fuori misura|non arriva|lungo|corto|chius/i;
const classifica = (r) => {
  const g = r.g137, ev = r.ev || [];
  const pasOk = g ? g.esito !== 'intercettato' : null;
  const golCompagno = ev.some(e => e.startsWith('gol')) && !(r.key === 'goal');
  const motoreGol = !!(g && g.ok);
  const difetti = [];
  if (pasOk === true) {
    if (!r.ok && /intercept|dispos|beaten/.test(String(r.outKind || '')) ) difetti.push('3D: passaggio arrivato ma mostrato intercettato (' + r.outKind + ')');
    if (!r.ok && _PERSO.test(String(r.ovl || '')) && !/compagno|spreca|sbaglia|para|fuori|palo|traversa|mura/i.test(String(r.ovl || ''))) difetti.push('riquadro: passaggio arrivato raccontato come perso «' + r.ovl + '»');
    if (ev.some(e => e.startsWith('intercetto'))) difetti.push('motore: passaggio arrivato registrato come intercetto');
  }
  if (pasOk === true && !motoreGol) {
    const m = { saved: 'saved', wide: 'fuori', post: 'post', blocked: 'blocked' }[g.esito];
    if (!ev.some(e => e.startsWith('tiro:' + m))) difetti.push('tabellino: il tiro del compagno (' + g.esito + ') non e\' registrato');
    if (!/perfett|servit|da gol/i.test(String(r.ovl || ''))) difetti.push('riquadro: passaggio arrivato senza dirlo «' + r.ovl + '»');
    if (r.key !== 'chance' || !r.ok) difetti.push('3D: chiave ' + r.key + ' ok=' + r.ok + ' (atteso passaggio riuscito, occasione non convertita)');
  }
  if (pasOk === false && /perfett|servit/i.test(String(r.ovl || ''))) difetti.push('riquadro: passaggio intercettato raccontato come riuscito «' + r.ovl + '»');
  if (motoreGol && !golCompagno) difetti.push('il motore dice gol del compagno ma il tabellino non lo registra (' + r.key + ')');
  if (motoreGol && r.key !== 'assist') difetti.push('gol del compagno senza assist accreditato (chiave ' + r.key + ')');
  if (golCompagno && !ev.some(e => /^gol/.test(e)) ) difetti.push('gol senza evento');
  return { pasOk, motoreGol, golCompagno, visto: r.tone || null, difetti };
};
for (const arm of ARMI) { const rosso = arm === 'rosso'; const tot = { scene: 0, giudicate: 0, pasOk: 0, gol: 0, golTab: 0, bad: 0, badPasOk: 0, chance: 0, difetti: [], righe: [], pas: [], gr: [], esiti: {} };
  for (const sd of (rosso ? SEMI_R : SEMI_V)) {
    const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
    const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' ' + sd;
    await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; window.__CPM_REC = true; if (r) window.__CPM_NO_ASSIST298 = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, rosso]);
    await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
    await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'assist', tickMs: 150 }), sd);
    const t0 = Date.now(); let ph = '';
    while (Date.now() - t0 < 420000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph === 'ended' || ph === 'ceremony') break; await sleep(1000); }
    const R = (await page.evaluate(() => window.__CPM_RES218 || [])).filter(r => r.rew === 'assist');
    for (const r of R) { tot.scene++; if (!r.g137) continue; tot.giudicate++; const c = classifica(r);
      if (r.det && r.det.pas != null) { tot.pas.push(r.det.pas); tot.gr.push(r.det.gr); }
      tot.esiti[r.g137.esito] = (tot.esiti[r.g137.esito] | 0) + 1;
      if (c.pasOk) tot.pasOk++; if (c.motoreGol) tot.gol++; if (c.golCompagno) tot.golTab++; if (r.key === 'chance') tot.chance++;
      if (c.visto === 'bad') { tot.bad++; if (c.pasOk) tot.badPasOk++; }
      c.difetti.forEach(d => tot.difetti.push(sd + ' «' + r.label + '» ' + d));
      tot.righe.push(sd + ' «' + String(r.label).slice(0, 28) + '» motore=' + r.g137.esito + ' key=' + r.key + ' kind=' + (r.outKind || '-') + ' tono=' + r.tone + ' «' + r.ovl + '» ev=' + (r.ev || []).join(',')); }
    console.log(arm + ' seme ' + sd + ' fine ' + ph + ' scene assist ' + R.length); await ctx.close();
  }
  esito[arm] = tot;
  const pc = (a, n) => n ? (100 * a / n).toFixed(1) + '%' : '-'; const med = (v) => v.length ? (v.reduce((a, x) => a + x, 0) / v.length).toFixed(3) : '-';
  console.log(arm.toUpperCase() + ' scene ' + tot.scene + ' giudicate ' + tot.giudicate + ' · passaggi riusciti ' + pc(tot.pasOk, tot.giudicate) + ' · gol compagno (motore) ' + pc(tot.gol, tot.giudicate) + ' · gol nel tabellino ' + pc(tot.golTab, tot.giudicate) + ' · visti «fallito» ' + pc(tot.bad, tot.giudicate) + ' (di cui con passaggio riuscito ' + tot.badPasOk + ') · occasione ' + tot.chance + ' · pas medio ' + med(tot.pas) + ' gr medio ' + med(tot.gr) + ' · esiti ' + JSON.stringify(tot.esiti) + ' · difetti ' + tot.difetti.length);
  if (process.env.CPM_RIGHE) tot.righe.forEach(x => console.log('    ' + x));
  tot.difetti.slice(0, 10).forEach(x => console.log('  · ' + x));
}
await b.close(); srv.close();
if (process.env.CPM_MISURA) process.exit(0);
const g = [], V = esito.verde, R = esito.rosso;
if (V) {
  if (V.giudicate < 15) g.push('verde: solo ' + V.giudicate + ' scene d\'assist giudicate (pavimento 15)');
  if (V.difetti.length) g.push('verde: ' + V.difetti.length + ' difetti (passaggio riuscito raccontato fallito, gol non registrato)');
  const qp = V.pasOk / Math.max(1, V.giudicate), qg = V.gol / Math.max(1, V.giudicate);
  if (!(qp >= 0.70)) g.push('verde: passaggi riusciti ' + (100 * qp).toFixed(1) + '% (pavimento 70%)');
  if (!(qg >= 0.25 && qg <= 0.70)) g.push('verde: gol del compagno ' + (100 * qg).toFixed(1) + '% (banda 25-70%)');
  if (V.badPasOk) g.push('verde: ' + V.badPasOk + ' passaggi riusciti mostrati col tono «fallito»');
}
if (R && !(R.difetti.length >= 1 || R.badPasOk >= 1)) g.push('rosso: il difetto non si vede (' + R.giudicate + ' scene)');
if (g.length) { console.log('❌ assist-298'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ assist-298 verde' + (R ? ' (e il rosso si vede)' : ''));
