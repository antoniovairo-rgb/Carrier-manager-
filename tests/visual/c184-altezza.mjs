#!/usr/bin/env node
/* [collaudo 184 · PO 07/11 «Sfrutta tutta l'altezza nelle schermate!»] CENSIMENTO dell'altezza vuota, schermata per schermata, a 360x800,
   412x915 (tocco) e 1440x900 (mouse), club FC Merseyside (il caso della foto del PO). Riusa il banco del collaudo 180 (salvataggio,
   calendario vero, misura180 = contrasto sui pixel + aree di tocco effettive) e aggiunge ALTEZZA() di c184-lib.
   Uso: C180_FORMATI=s360,s412,pc  C184_PARTE=fuori,carriera,finestre,partita  (default tutte). Dati in C180_DATI, foto in C180_FOTO.
   Non tocca src/. */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, SAVE, INIT, entraInCarriera } from './c178-graf-lib.mjs';
import { scelti, saveDi, misura180, premi, NOME_LUNGO, preparaCalendario, DATI_DIR } from './c180-lib.mjs';
import { ALTEZZA, classe } from './c184-lib.mjs';
const OVL = () => { const W = innerWidth, H = innerHeight; let o = null; for (const e of document.body.querySelectorAll('*')) { const c = getComputedStyle(e); if (c.position !== 'fixed' || c.display === 'none' || +c.opacity < 0.1) continue; const r = e.getBoundingClientRect(); if (r.width * r.height < 0.5 * W * H) continue; if ((parseInt(c.zIndex) || 0) >= 50 && e.querySelector('button')) o = e; }
  if (!o) return null; const t = (o.innerText || '').split('\n').map(x => x.trim()).filter(x => x.length > 3); return { nome: (t.find(x => !/^[⚡🏆]/.test(x) && x.length > 6) || t[0] || 'finestra').toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) }; };
const CHIUDI_OVL = () => { const W = innerWidth, H = innerHeight; let o = null; for (const e of document.body.querySelectorAll('*')) { const c = getComputedStyle(e); if (c.position !== 'fixed' || c.display === 'none') continue; const r = e.getBoundingClientRect(); if (r.width * r.height >= 0.5 * W * H && (parseInt(c.zIndex) || 0) >= 50 && e.querySelector('button')) o = e; }
  if (o) { const b = [...o.querySelectorAll('button')].filter(x => x.getBoundingClientRect().width > 0); (b.find(x => /chiudi|continua|ok|✕/i.test(x.textContent || '')) || b[0]).click(); } };
const PARTI = (process.env.C184_PARTE || 'fuori,carriera,finestre,partita').split(',');
const SOLO = process.env.C184_SOLO ? new RegExp(process.env.C184_SOLO) : null;
const club = 'rosso';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function apri(f, init, query, errs) {
  const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1, serviceWorkers: 'block' }; if (f.touch) { opt.isMobile = true; opt.hasTouch = true; }
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(`${f.k} · ${String(e.message).slice(0, 140)}`));
  await page.addInitScript(INIT, { seme: 4242, tema: 'chiaro', rossi: [], ...(init || {}) });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html${query || ''}`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
  return { ctx, page };
}
const fase = p => p.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null).catch(() => null);
const aspettaFase = async (p, rx, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const f = await fase(p); if (f && rx.test(f)) return f; await sleep(250); } return null; };
for (const f of scelti()) {
  const R = {}, A = {}, errs = [], mancanti = []; const t0 = Date.now();
  console.log(`\n=== ${f.nome}`);
  const M = async (page, sch, o) => { if (SOLO && !SOLO.test(sch)) return null; const r = await misura180(page, f, sch, club, R, { noFondo: true, ...(o || {}) });
    const a = await page.evaluate(ALTEZZA).catch(e => ({ errore: String(e.message).slice(0, 80) }));
    A[sch] = { ...a, classe: classe(a), foto: r && r.foto, ctr: r ? r.nSottoCtr : null, ctrEs: r ? (r.sottoCtr || []).slice(0, 4).map(c => `«${c.t}» ${c.rap}:1 (${c.testo} su ${c.fondo})`) : [], tocchi: r && r.x108 ? (r.x108.tocchi || []) : [], hs: r ? r.hs : null };
    console.log(`     ↳ altezza: ${a.scorre ? 'SCORRE (' + a.scorre + ')' : 'vuoto ' + a.vuoto + ' px = ' + a.pct + '%'} · barra ${a.barra} · ultimo «${a.ultimo}» · ${A[sch].classe}`); return r; };
  if (PARTI.includes('fuori')) {
    const { ctx, page } = await apri(f, {}, '?cpmtest=1', errs); await sleep(1500);
    await M(page, 'menu');
    if (await premi(page, 'Crediti')) { await sleep(600); await M(page, 'menu-crediti'); await page.keyboard.press('Escape'); await premi(page, '^✕$|Chiudi'); await sleep(500); } else mancanti.push('menu-crediti');
    if (await premi(page, 'Opzioni')) { await sleep(600); await M(page, 'menu-opzioni'); await premi(page, '^✕$|Chiudi'); await sleep(500); } else mancanti.push('menu-opzioni');
    if (await premi(page, 'Nuova carriera')) { await sleep(700);
      await M(page, 'creazione-vuota');
      await page.evaluate(n => { const i = document.querySelector('input[type="text"],input:not([type])'); if (i) { const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; s.call(i, n); i.dispatchEvent(new Event('input', { bubbles: true })); } }, NOME_LUNGO.slice(0, 22)); await sleep(400);
      if (await premi(page, 'INIZIA|Inizia')) { await sleep(1200); await M(page, 'provini-intro'); } else mancanti.push('provini-intro');
    } else mancanti.push('creazione');
    await ctx.close();
  }
  const S = saveDi(SAVE, club);
  if (PARTI.includes('carriera') || PARTI.includes('finestre')) {
    const { ctx, page } = await apri(f, { save: S }, '?cpmtest=1', errs);
    if (!(await entraInCarriera(page, errs))) mancanti.push('carriera'); else {
      const cal = await preparaCalendario(page, S); if (!cal.md) mancanti.push('gara: ' + JSON.stringify(cal));
      await page.evaluate(() => { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.goTab('dashboard'); }); await sleep(500);
      for (let i = 0; i < 4; i++) { const ov = await page.evaluate(OVL); if (!ov) break; await M(page, 'auto-' + ov.nome); await page.evaluate(CHIUDI_OVL); await sleep(900); }
      if (PARTI.includes('carriera')) for (const [id, tab] of [['home', 'dashboard'], ['stagione-classifica', 'standings'], ['stagione-calendario', 'calendar'], ['stagione-coppe', 'coppe'], ['club', 'club'], ['carriera-profilo', 'profile'], ['carriera-nazionale', 'nazionale'], ['agente', 'agente'], ['ufficio', 'ufficio']]) {
        await page.evaluate(() => window.__CPM_CAREER.dismiss()).catch(() => {});
        const r = await page.evaluate(x => window.__CPM_CAREER.goTab(x), tab); if (r !== true) { mancanti.push(id); continue; } await sleep(400); await M(page, id); }
      if (PARTI.includes('finestre')) {
        const fin = [
          ['settimana-impulso', () => window.__CPM_CAREER.apriSettimana('impulso')], ['settimana-spogliatoio', () => window.__CPM_CAREER.apriSettimana('spogliatoio')], ['settimana-vissuta', () => window.__CPM_CAREER.apriSettimana('vissuta')],
          ['partita-titolare', () => window.__CPM_CAREER.apriPartita('starter')], ['partita-panchina', () => window.__CPM_CAREER.apriPartita('bench')],
          ['offerta-mercato', () => window.__CPM_CAREER.forceOffer()], ['intervista-vittoria', () => window.__CPM_CAREER.forceInterview('win')],
          ['procuratore-intro', () => window.__CPM_CAREER.apriIntro253()], ['festa-nazionale', () => window.__CPM_CAREER.festa251('nation')],
          ['presentazione-0', () => window.__CPM_CAREER.apriPresentazione(0)], ['presentazione-2', () => window.__CPM_CAREER.apriPresentazione(2)], ['gala', () => window.__CPM_CAREER.apriGala()],
          ['saga-capitano', () => window.__CPM_CAREER.forceSaga('capitano')], ['notifica', () => window.__CPM_CAREER.notify247()],
        ];
        for (const [id, fn] of fin) {
          await page.evaluate(() => { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.goTab('dashboard'); }); await sleep(300);
          const r = await page.evaluate(fn).catch(e => 'err ' + e.message); if (r !== true && r !== 'ok' && !(r && typeof r === 'object')) { mancanti.push(`${id} → ${String(r).slice(0, 40)}`); continue; }
          await sleep(900); await M(page, id); await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(300); }
        for (const sc of ['seasonAwards', 'proTransition']) { await page.evaluate(() => { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.goTab('dashboard'); }); await sleep(300);
          const r = await page.evaluate(x => window.__CPM_CAREER.goScreen(x), sc); if (r !== true) { mancanti.push('sch-' + sc); continue; } await sleep(1000); await M(page, 'sch-' + sc); await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(400); }
      }
    }
    await ctx.close();
  }
  if (PARTI.includes('partita')) {
    const { ctx, page } = await apri(f, { save: S }, '?cpmtest=1', errs);
    const passo = async (nome, fn) => { try { await fn(); } catch (e) { mancanti.push(nome + ': ' + String(e.message).slice(0, 80)); } };
    try {
      if (!(await entraInCarriera(page, errs))) throw new Error('carriera non aperta');
      const cal = await preparaCalendario(page, S); if (!cal.md) throw new Error('nessuna gara');
      await page.evaluate(() => window.__CPM_CAREER.dismiss());
      for (let i = 0; i < 4; i++) { const ov = await page.evaluate(OVL); if (!ov) break; await page.evaluate(CHIUDI_OVL); await sleep(900); }
      await passo('conferenza', async () => { await page.evaluate(() => window.__CPM_CAREER.playMatch(true)); await sleep(1500); if (await fase(page)) return; await M(page, 'conferenza-prepartita'); });
      if (!(await fase(page))) { await page.evaluate(() => window.__CPM_CAREER.dismiss()); await page.evaluate(() => window.__CPM_CAREER.playMatch()); }
      await aspettaFase(page, /./, 30000); await sleep(1200);
      await passo('prepartita', async () => { await M(page, 'prepartita', { vivo: true, fermaMs: 1500 }); });
      await passo('analisi', async () => { if (await premi(page, 'Analisi')) { await sleep(900); await M(page, 'analisi-avversario', { vivo: true, fermaMs: 1500 }); await premi(page, 'Entra in campo'); await sleep(1500); } else mancanti.push('analisi-avversario'); });
      if (!/formations/.test(await fase(page) || '')) { await premi(page, 'Vedi le formazioni'); await sleep(1500); }
      await passo('formazioni', async () => { if (/formations/.test(await fase(page) || '')) await M(page, 'formazioni', { vivo: true, fermaMs: 1500 }); else mancanti.push('formazioni (fase ' + await fase(page) + ')'); });
      await page.keyboard.press('Enter'); await sleep(1200); if (/formations/.test(await fase(page) || '')) { await page.keyboard.press('Enter'); await sleep(1200); }
      for (let i = 0; i < 40; i++) { const ok = await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(q => /Salta ingresso/.test(q.textContent || '')); if (x) { x.click(); return true; } return false; }); if (ok) break; await sleep(500); }
      await aspettaFase(page, /^playing$/, 60000); await page.evaluate(() => window.__CPM_SET_NUMHL && window.__CPM_SET_NUMHL(0)); await sleep(800);
      await passo('post', async () => { await page.evaluate(() => window.__CPM_SO_FORCE && window.__CPM_SO_FORCE()); await sleep(4500); await M(page, 'post-partita', { vivo: true, fermaMs: 1500 });
        /* quello che segue il post-partita (pagelle/intervista/ritorno alla carriera): si fotografano fino a tre schermate */
        for (let i = 0; i < 3; i++) { const ok = await premi(page, 'Continua|Avanti|Torna alla carriera|Chiudi'); if (!ok) break; await sleep(1800); await M(page, 'dopo-partita-' + (i + 1), { vivo: true, fermaMs: 1500 }); } });
    } catch (e) { mancanti.push('eccezione: ' + String(e.message).slice(0, 120)); }
    await ctx.close();
  }
  fs.writeFileSync(path.join(DATI_DIR, `altezza-${f.k}-${PARTI.join("+")}.json`), JSON.stringify({ A, mancanti, errs, ms: Date.now() - t0 }, null, 1));
  console.log(`  mancanti: ${JSON.stringify(mancanti)} · errori: ${errs.length} · ${Math.round((Date.now() - t0) / 1000)} s`);
}
await b.close(); srv.close();
