#!/usr/bin/env node
/* SONDA giro 367 (PO-651) — I TIRI SBAGLIATI DELL'EROE NELLE PARTITE VERE. Non giudica: stampa.
   Partite vere dai salvataggi di collaudo (come misura-295), corpi GLB accesi, pagina nuova per partita, regime «gioco»
   (__CPM_PRESENT=1 + __CPM_REALWAIT). Il pilota automatico sceglie la conclusione quando la scena la offre (politica «re»): gli esiti li
   decide il motore, niente e' forzato. Un registratore nella pagina svuota a ogni fotogramma il testimone __CPM_GK229; per ogni scena
   con esito «wide» su tiro/testa/punizione/rigore la traccia passa dalla stessa funzione `misura` di misura-367 (pallone e porta
   dalle mesh, tempo di scena).
   Uso: CPM_CHROME=… node partite-367.mjs   (CPM_SEMI=7,2021,33 · CPM_SALVA=s5,s12 · CPM_ROSSO=1 → __CPM_NO_G367 · CPM_TETTO=540 · CPM_OUT=file) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { misura, stat } from './misura-367.mjs';
const FX = (f) => JSON.parse(fs.readFileSync(new URL('./fixtures/' + f, import.meta.url)));
const SALVA = { s1: 'save-c177-s1w15.json', s5: 'save-c177-s5w20.json', s12: 'save-190-s12-ovr93.json' };
const SEMI = (process.env.CPM_SEMI || '7,2021').split(',').map(Number), SAVES = (process.env.CPM_SALVA || 's5').split(',');
const TETTO = +(process.env.CPM_TETTO || 540) * 1000, ROSSO = !!process.env.CPM_ROSSO, PAR = +(process.env.CPM_PAR || 2);
const RE = 'Tir|Conclu|Collo|Piazz|testa|Stacco|Vol[eé]e|Pallonetto|Rovesciata|Punizione|Botta|Bordata|giro|Incroci|Angolat|Potenz|Cucchiaio|Girata|Spingila|Deviazione';
const f = (x, n = 2) => x == null ? '—' : (+x).toFixed(n);
const srv = await startServer(); const port = srv.address().port;

async function gioca(sk, sd) {
  let b = null;
  try {
    b = await launchBrowser(); const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
    const raw = FX(SALVA[sk]); let ls;
    if (raw['cpm-v3']) { ls = { ...raw }; const sv = JSON.parse(ls['cpm-v3']); (sv.player || sv).name += ' ' + sd; ls['cpm-v3'] = JSON.stringify(sv); delete ls['cpm-v3-riserva']; delete ls['cpm-match-resume']; }
    else { const sv = JSON.parse(JSON.stringify(raw)); (sv.player || sv).name += ' ' + sd; ls = { 'cpm-v3': JSON.stringify(sv) }; }
    ls['cpm-match-speed'] = '2';
    await page.addInitScript(([s, r]) => { window.__CPM_GLB = true; window.__CPM_REC = true; window.__CPM_REALWAIT = 1; window.__CPM_PARETE103 = 150000; window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_REC229 = 1; if (r) window.__CPM_NO_G367 = 1;
      if (!sessionStorage.getItem('__m367')) { for (const k of Object.keys(s)) localStorage.setItem(k, s[k]); sessionStorage.setItem('__m367', '1'); }
      const L = window.__M367 = [];
      const g = () => { try { const R = window.__CPM_GK229; if (R && R.length) { for (const q of R) if (L.length < 80000 && /^hl_/.test(q.ph || '')) L.push({ ck: q.ck, ph: q.ph, ok: q.ok, at: q.at, aT: q.aT, aD: q.aD, bx: q.bx, bz: q.bz, by: q.by, atx: q.atx, atz: q.atz, pa: q.pa, ht: q.ht, hk: q.hk }); window.__CPM_GK229 = []; } } catch (e) {} requestAnimationFrame(g); }; requestAnimationFrame(g); }, [ls, ROSSO]);
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 90000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 90000 }).catch(() => {});
    await page.evaluate(([s, re]) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 're', re, tickMs: 150 }), [sd, RE]);
    const t0 = Date.now(); let ph = '';
    while (Date.now() - t0 < TETTO) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => 'x'); if (ph === 'ended' || ph === 'ceremony' || ph === 'x') break; await sleep(400); }
    const L = await page.evaluate(() => window.__M367 || []).catch(() => []);
    const porta = await page.evaluate(() => window.__CPM_PORTA367 || null).catch(() => null);
    const W = await page.evaluate(() => ({ t: window.__CPM_TIRI367 || [], g: window.__CPM_G223ARC || [] })).catch(() => ({ t: [], g: [] }));
    const glb = await page.evaluate(() => !!window.__CPM_GLB && (window.__CPM_MXCLIP | 0) > 0).catch(() => false);
    const min = await page.evaluate(() => { try { return window.__CPM_STATE ? (window.__CPM_STATE().minute ?? null) : null; } catch (e) { return null; } }).catch(() => null);
    await b.close();
    return { L, porta, glb, W, ph, min, sec: Math.round((Date.now() - t0) / 1000) };
  } catch (e) { try { if (b) await b.close(); } catch (_e) {} return { err: String(e.message || e).split('\n')[0].slice(0, 120) }; }
}

/* CPM_COPPIE=s5:7,s12:2021 sceglie le partite una per una */
const lavori = []; if (process.env.CPM_COPPIE) process.env.CPM_COPPIE.split(',').forEach(c => { const [sk, sd] = c.split(':'); lavori.push([sk, +sd]); }); else for (const sk of SAVES) for (const sd of SEMI) lavori.push([sk, sd]);
const tutti = []; let nx = 0, concl = 0;
await Promise.all(Array.from({ length: PAR }, async () => { while (nx < lavori.length) { const [sk, sd] = lavori[nx++]; const G = await gioca(sk, sd);
  if (G.err) { console.log(`  ${sk} seme ${sd}: NON GIOCATA (${G.err})`); continue; }
  /* scene = fotogrammi consecutivi con la stessa chiave */
  const scene = {}; for (const q of G.L) (scene[q.hk] = scene[q.hk] || []).push(q);
  let n = 0, w = 0; const righe = [];
  for (const hk of Object.keys(scene)) { const R = scene[hk]; if (!R.some(r => r.at && r.aT >= 0 && /^(shot|header|penalty|freekick)$/.test(r.ht || ''))) continue; n++;
    const kind = (R.find(r => r.at && r.aT >= 0) || {}).ok; if (kind !== 'wide') continue; w++;
    const K = R.find(r => r.at && r.aT >= 0), wt = G.W.t.filter(x => x.sk === String(hk)).pop() || null, g2 = G.W.g.filter(x => x.sk === String(hk)).pop() || null;
    const m = misura({ R, porta: G.porta, glb: G.glb }); tutti.push({ sk, sd, hk, ht: K.ht, m, w: wt, g2 });
    righe.push(m.nonGiud ? `non giudicato (${m.nonGiud})` : m.nonLinea ? `${K.ht} non alla linea (x max ${f(m.xMax, 1)})` : `${K.ht}${wt ? '/' + wt.v : ''} da ${f(m.dist, 0)} m: esce a ${f(m.lato)} m dal palo (bersaglio z ${f(m.atz)}${wt ? `, tetto ${f(wt.tetto)}, ${wt.oltre ? 'nessun punto libero sotto il tetto' : 'sotto il tetto'}` : ', FUORI dal blocco 223'}), dopo fino a ${f(m.dopoLato)}`); }
  concl += n;
  console.log(`  ${sk} seme ${sd}: fase finale ${G.ph} al ${G.min}' in ${G.sec} s · ${n} conclusioni dell'eroe, ${w} fuori${righe.length ? ' → ' + righe.join(' | ') : ''}`); } }));
srv.close();
const v = tutti.filter(r => r.m.lato != null); const s1 = stat(v.map(r => r.m.lato)), s2 = stat(v.map(r => r.m.dopoLato));
console.log(`\n  ${ROSSO ? 'PRIMA (__CPM_NO_G367)' : 'DOPO'} — partite vere: ${lavori.length} partite · ${concl} conclusioni dell'eroe · ${tutti.length} fuori · ${v.length} misurate`);
console.log(`  scarto dal palo all'uscita (m): mediana ${f(s1.med)} · 90° ${f(s1.p90)} · massimo ${f(s1.max)}   |   dopo l'uscita, dal palo: mediana ${f(s2.med)} · massimo ${f(s2.max)}   |   non alla linea ${tutti.filter(r => r.m.nonLinea).length} · non giudicati ${tutti.filter(r => r.m.nonGiud).length}`);
if (process.env.CPM_OUT) fs.writeFileSync(process.env.CPM_OUT, JSON.stringify(tutti));
process.exit(0);
