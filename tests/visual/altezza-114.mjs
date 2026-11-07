#!/usr/bin/env node
/* [giro 114 · PO-320 «Sfrutta tutta l'altezza nelle schermate!»] GUARDIANO altezza-114 (non-gate, catena «solo grafica»).
   Per ogni schermata del perimetro (menu, Opzioni, offerte, pre-partita, finestre della settimana e della partita, «momento», Coppe vuota,
   passaggio ai professionisti) misura lo spazio verticale VUOTO sotto l'ultimo contenuto (ALTEZZA() di c184-lib: radice, barra tolta,
   «scorre» solo se contenuto oltre il bordo utile) e pretende: vuoto <= 12% dell'area utile, oppure pagina che scorre.
   In piu' il TOCCO (area effettiva = rettangolo U ::after, EXTRA108 del 180): chiusura ✕ e interruttori delle Opzioni (solo formati
   a tocco: sul PC col mouse l'::after non c'e'), tasti del pre-partita, «Gioca ›» del calendario >= 44 px.
   Formati 360x800 · 412x915 · 1440x900. BRACCIO ROSSO: __CPM_NO_G114 (il comportamento della 7.999.183) — deve far fallire.
   Eccezioni dichiarate (scenografia, non misurate): feste, gala, presentazione, saga, intro, provini (giro 115).
   Uso: C114_FORMATI=s360,s412,pc  C114_BRACCI=verde,rosso  C114_FOTO=<cartella>  C114_SOLO=<regex schermata>. Esce !=0 se un controllo e' rosso nel verde o se il rosso non fa fallire. */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, SAVE, INIT, entraInCarriera } from './c178-graf-lib.mjs';
import { scelti, saveDi, premi, preparaCalendario, EXTRA108 } from './c180-lib.mjs';
import { ALTEZZA } from './c184-lib.mjs';
const MAXV = +(process.env.C114_MAXV || 12);
const SOLO = process.env.C114_SOLO ? new RegExp(process.env.C114_SOLO) : null;
const BRACCI = (process.env.C114_BRACCI || 'verde,rosso').split(',');
const FOTO = process.env.C114_FOTO || '';
const fase = p => p.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null).catch(() => null);
const aspettaFase = async (p, rx, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const f = await fase(p); if (f && rx.test(f)) return f; await sleep(250); } return null; };
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function apri(f, init, query, rosso, errs) {
  const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1, serviceWorkers: 'block' }; if (f.touch) { opt.isMobile = true; opt.hasTouch = true; }
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(`${f.k} · ${String(e.message).slice(0, 140)}`));
  await page.addInitScript(INIT, { seme: 4242, tema: 'chiaro', rossi: rosso ? ['__CPM_NO_G114'] : [], ...(init || {}) });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html${query || ''}`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
  return { ctx, page };
}
const OVL = () => { const W = innerWidth, H = innerHeight; let o = null; for (const e of document.body.querySelectorAll('*')) { const c = getComputedStyle(e); if (c.position !== 'fixed' || c.display === 'none' || +c.opacity < 0.1) continue; const r = e.getBoundingClientRect(); if (r.width * r.height < 0.5 * W * H) continue; if ((parseInt(c.zIndex) || 0) >= 50 && e.querySelector('button')) o = e; }
  return o ? ((o.innerText || '').split('\n').map(x => x.trim()).filter(x => x.length > 3)[1] || 'momento').toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').slice(0, 24) : null; };
const CHIUDI_OVL = () => { const W = innerWidth, H = innerHeight; let o = null; for (const e of document.body.querySelectorAll('*')) { const c = getComputedStyle(e); if (c.position !== 'fixed' || c.display === 'none') continue; const r = e.getBoundingClientRect(); if (r.width * r.height >= 0.5 * W * H && (parseInt(c.zIndex) || 0) >= 50 && e.querySelector('button')) o = e; }
  if (o) { const bt = [...o.querySelectorAll('button')].filter(x => x.getBoundingClientRect().width > 0); (bt.find(x => /chiudi|continua|ok|✕/i.test(x.textContent || '')) || bt[0]).click(); } };
const T = 'ZZ'; const esito = [];
for (const braccio of BRACCI) for (const f of scelti()) {
  const rosso = braccio === 'rosso', errs = [], R = [], mancanti = []; const t0 = Date.now(); console.log(`\n=== ${braccio} · ${f.nome}`);
  const M = async (page, sch, tocco) => { if (SOLO && !SOLO.test(sch)) return; const a = await page.evaluate(ALTEZZA).catch(e => ({ errore: String(e.message).slice(0, 80) }));
    const x = await page.evaluate(EXTRA108).catch(() => ({ tocchi: [] }));
    const piccoli = (x.tocchi || []).filter(t => tocco && tocco(t, f)); const centrata = f.w >= 900 && /^(settimana|partita|momento)/.test(sch); /* finestre centrate da 900 px: il vuoto sopra e sotto e' voluto */ const ok = !!a.scorre || centrata || (a.pct != null && a.pct <= MAXV);
    R.push({ sch, pct: a.pct, scorre: a.scorre, ok, piccoli }); console.log(`  ${ok && !piccoli.length ? '✓' : '✗'} ${sch}: ${a.scorre ? 'scorre' : 'vuoto ' + a.vuoto + ' px = ' + a.pct + '%'}${piccoli.length ? ' · TOCCO<44: ' + piccoli.map(t => `«${t.t}» ${t.ew}x${t.eh}`).join(', ') : ''}`);
    if (FOTO) await page.screenshot({ path: path.join(FOTO, `${sch}-${f.k}-${braccio}.png`) }).catch(() => {}); };
  /* ── fuori dalla carriera: menu, Opzioni, offerte ── */
  { const { ctx, page } = await apri(f, {}, '?cpmtest=1', rosso, errs); await sleep(1500);
    await M(page, 'menu');
    if (await premi(page, 'Opzioni')) { await sleep(700); await M(page, 'opzioni', (t, ff) => (t.t === '✕' || t.t === 'Chiudi' || (t.t === '' && t.w === 42)) && (ff.touch || t.t === '✕' || t.t === 'Chiudi')); } else mancanti.push('opzioni');
    await ctx.close(); }
  const S = saveDi(SAVE, 'rosso');
  { const { ctx, page } = await apri(f, {}, '', rosso, errs); await sleep(1000);
    const env = { ph: 'offers', p: S.player, res: [{ goals: 2, assists: 1, rating: 7.4 }, { goals: 2, assists: 0, rating: 7.6 }, { goals: 3, assists: 1, rating: 8.1 }], slot: 0 };
    await page.evaluate(e => localStorage.setItem('cpm-trial-prog', JSON.stringify(e)), env); await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load' }); await sleep(3500);
    if (/Offerte ricevute/.test(await page.evaluate(() => document.body.innerText))) await M(page, 'offerte'); else mancanti.push('offerte'); await ctx.close(); }
  /* ── in carriera: finestre, momento, Coppe, passaggio pro, calendario ── */
  { const { ctx, page } = await apri(f, { save: S }, '?cpmtest=1', rosso, errs);
    if (!(await entraInCarriera(page, errs))) mancanti.push('carriera'); else {
      const cal = await preparaCalendario(page, S); if (!cal.md) mancanti.push('gara');
      await page.evaluate(() => { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.goTab('dashboard'); }); await sleep(500);
      for (let i = 0; i < 4; i++) { const ov = await page.evaluate(OVL); if (!ov) break; await M(page, 'momento-' + ov); await page.evaluate(CHIUDI_OVL); await sleep(900); }
      await page.evaluate(() => { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.goTab('calendar'); }); await sleep(600);
      await M(page, 'calendario', (t) => /^Gioca/.test(t.t));
      await page.evaluate(() => { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.goTab('coppe'); }); await sleep(600); await M(page, 'coppe-vuota');
      for (const [id, fn] of [['settimana-impulso', () => window.__CPM_CAREER.apriSettimana('impulso')], ['settimana-spogliatoio', () => window.__CPM_CAREER.apriSettimana('spogliatoio')], ['settimana-vissuta', () => window.__CPM_CAREER.apriSettimana('vissuta')], ['partita-titolare', () => window.__CPM_CAREER.apriPartita('starter')], ['partita-panchina', () => window.__CPM_CAREER.apriPartita('bench')]]) {
        await page.evaluate(() => { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.goTab('dashboard'); }); await sleep(300);
        const r = await page.evaluate(fn).catch(e => 'err ' + e.message); if (r !== true) { mancanti.push(id); continue; } await sleep(900); await M(page, id); await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(300); }
      await page.evaluate(() => { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.goTab('dashboard'); }); await sleep(300);
      if (await page.evaluate(() => window.__CPM_CAREER.goScreen('proTransition')) === true) { await sleep(1000); await M(page, 'passaggio-pro'); } else mancanti.push('passaggio-pro');
    }
    await ctx.close(); }
  /* ── pre-partita ── */
  { const { ctx, page } = await apri(f, { save: S }, '?cpmtest=1', rosso, errs);
    try { if (!(await entraInCarriera(page, errs))) throw new Error('carriera'); const cal = await preparaCalendario(page, S); if (!cal.md) throw new Error('gara');
      await page.evaluate(() => window.__CPM_CAREER.dismiss()); for (let i = 0; i < 4; i++) { if (!(await page.evaluate(OVL))) break; await page.evaluate(CHIUDI_OVL); await sleep(900); }
      await page.evaluate(() => window.__CPM_CAREER.playMatch()); await aspettaFase(page, /matchday/, 30000); await sleep(1500);
      await M(page, 'prepartita', t => /Analisi|Salta e gioca|Torna alla home|Simula|Vedi le formazioni/.test(t.t));
    } catch (e) { mancanti.push('prepartita: ' + String(e.message).slice(0, 60)); }
    await ctx.close(); }
  const rossi = R.filter(r => !r.ok || r.piccoli.length); esito.push({ braccio, f: f.nome, n: R.length, rossi: rossi.map(r => r.sch), mancanti, errs: errs.length });
  console.log(`  schermate ${R.length} · fuori regola ${rossi.length} · mancanti ${JSON.stringify(mancanti)} · errori pagina ${errs.length} · ${Math.round((Date.now() - t0) / 1000)} s`);
}
await b.close(); srv.close();
let ko = 0; const righe = [];
for (const e of esito) { const verde = e.braccio === 'verde'; const manc = e.mancanti.length || e.errs; if (verde && (e.rossi.length || manc)) { ko++; righe.push(`✗ verde ${e.f}: fuori regola [${e.rossi.join(', ')}] mancanti [${e.mancanti.join('; ')}] errori ${e.errs}`); } else if (!verde && !e.rossi.length) { ko++; righe.push(`✗ rosso ${e.f}: __CPM_NO_G114 NON fa fallire nulla (il guardiano e' cieco)`); } else righe.push(`✓ ${e.braccio} ${e.f}: ${verde ? e.n + ' schermate in regola' : e.rossi.length + ' schermate fuori regola col rosso (' + e.rossi.slice(0, 5).join(', ') + ')'}`); }
console.log('\n' + righe.join('\n')); console.log(ko ? `\nFAIL altezza-114 — braccio e motivo: ${righe.filter(r => r[0] === '✗').join(' | ')}` : `\nPASS altezza-114 (vuoto <= ${MAXV}% o pagina che scorre, tocco >= 44) — bracci ${BRACCI.join('+')}`);
process.exit(ko ? 1 : 0);
