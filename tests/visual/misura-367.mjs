#!/usr/bin/env node
/* SONDA giro 367 (PO-651) — DI QUANTO ESCE UN TIRO SBAGLIATO DELL'EROE.
   Per ogni conclusione dell'eroe con esito «fuori» (wide: l'unico esito fuori dallo specchio che il motore assegna a tiro, testa,
   punizione e rigore) registra la traccia del pallone fotogramma per fotogramma (testimone __CPM_GK229: posizione della MESH del pallone,
   tempo di SCENA) e la confronta con la porta letta dalle MESH della stessa scena (testimone __CPM_PORTA367: pali anteriori e traversa).
   Misure, tutte al punto d'uscita (primo fotogramma col pallone entro mezza unita' dal piano dei pali):
     lato   = quanto passa oltre il palo (0 se fra i pali)        sopra = quanto passa sopra la traversa (0 se sotto)
     scarto = distanza dal telaio della porta (ipotenusa di lato e sopra)   — in unita' di scena = metri (la porta e' costruita 7,32 x 2,44)
   e dove finisce: x massima raggiunta (cartelloni di fondo), |z| massima, quota massima, punto di riposo.
   Corpi GLB accesi, una pagina nuova per tiro (una pagina stanca non e' il gioco).
     CPM_CHROME=… node misura-367.mjs            CPM_ROSSO=1 → window.__CPM_NO_G367 (comportamento di prima)
     CPM_SCENE=gi:ai:famiglia,…  CPM_REP=n (ripetizioni per scena, default 3)  CPM_PAR=n (pagine in parallelo, default 3)
     CPM_OUT=file.json (tracce e misure)  */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

export const SCENE_367 = '8:0:tiro-da-fuori,11:0:tiro-da-fuori,165:0:tiro-potenza,3:1:tiro-potenza,62:1:di-prima,2:0:di-prima,0:0:uno-contro-uno,3:0:a-giro,17:2:a-giro,12:0:a-giro,0:2:pallonetto,169:1:pallonetto,1:0:volee,6:1:volee,7:0:testa,86:0:testa,171:0:testa,13:0:punizione,78:0:punizione,81:0:punizione,5:0:rigore,5:2:rigore,5:1:rigore';
const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : null; };
export const stat = a => ({ n: a.length, med: pct(a, 0.5), p90: pct(a, 0.9), max: a.length ? Math.max(...a) : null });
const f = (x, n = 2) => x == null ? '—' : (+x).toFixed(n);

export async function tiro(b, port, sc, { rosso = false, kind = 'wide', foto = null, pz = null, no393 = false } = {}) {
  /* un browser per tiro: con piu' pagine GLB nello stesso browser la scheda grafica software cade (misurato: «Failed to open a new tab») */
  const mio = !b; let ctx = null; const errs = [];
  try {
    if (mio) b = await launchBrowser();
    ctx = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: foto ? 2 : 1 });
    const page = await ctx.newPage(); await installCdnRoutes(page);
    page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
    await page.addInitScript(([r, z, pr, n393]) => { if (n393) window.__CPM_NO_G393 = 1; window.__CPM_GLB = true; window.__CPM_REC = true; window.__CPM_CINE = 1; window.__CPM_TOD = 'day'; if (r) window.__CPM_NO_G367 = 1; if (z != null) window.__CPM_PZ367 = z; if (pr) window.__CPM_PRESENT = 1; }, [rosso, pz, !!process.env.CPM_PRESENT, no393 || !!process.env.CPM_NO393]);
    await openMatch(page, port, { name: 'Tiri367' });
    await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 90000 }).catch(() => {});
    const glb = await page.evaluate(() => !!window.__CPM_GLB && (window.__CPM_MXCLIP | 0) > 0);
    const ok = await page.evaluate(g => window.__CPM_FORCE_SIT(+g, true), sc.gi).catch(() => false);
    if (!ok) { await ctx.close(); if (mio) await b.close(); return { sc, skip: 'forzatura fallita' }; }
    /* si aspetta che la scena forzata sia davvero quella in campo (le sue etichette), non un tempo fisso: letta troppo presto l'etichetta
       era quella della scena precedente (misurato nel primo censimento) */
    await page.waitForFunction(g => { try { const a = window.__CPM_ACTS() || [], s = SITUATIONS[g]; return !!s && a.length === s.actions.length && a.every((l, i) => l === String(s.actions[i].label || '')); } catch (e) { return false; } }, +sc.gi, { timeout: 8000 }).catch(() => {});
    await sleep(300);
    const label = await page.evaluate(a => (window.__CPM_ACTS() || [])[a] || null, +sc.ai);
    const punti0 = await page.evaluate(() => { try { return JSON.stringify(window.__CPM_SCORE ? window.__CPM_SCORE() : null); } catch (e) { return null; } });
    await page.evaluate(k => { window.__CPM_FROZEN = false; window.__CPM_GK229 = []; window.__CPM_REC229 = 1; window.__CPM_V241 = {}; window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_FORCE_KIND = k; }, kind);
    await page.evaluate(a => window.__CPM_RESOLVE(a), +sc.ai);
    /* attesa in TEMPO DI SCENA: arco finito + 3,2 s di scena (il post-arco dura 2,5), tetto di parete 120 s */
    const t0 = Date.now(); let fotoFatta = null;
    while (Date.now() - t0 < 120000) {
      await sleep(300);
      const st = await page.evaluate(() => { const R = window.__CPM_GK229 || []; const L = R[R.length - 1]; let iE = -1, armed = false;
        for (let i = 0; i < R.length; i++) { if (R[i].at && R[i].aT >= 0) armed = true; if (armed && !R[i].at) { iE = i; break; } }
        return { ck: L ? L.ck : 0, ckE: iE >= 0 ? R[iE].ck : null, bx: L ? L.bx : null }; });
      if (st.ckE != null && st.ck - st.ckE > 3.2) break;
    }
    const R0 = await page.evaluate(() => (window.__CPM_GK229 || []).length);
    if (foto) { /* foto a pallone fermo, DOPO la misura: la scena si ferma solo per lo scatto */
      await page.evaluate(() => { window.__CPM_FROZEN = true; }); await sleep(350);
      try { await page.screenshot({ path: foto, timeout: 60000 }); fotoFatta = foto; } catch (e) { fotoFatta = 'errore'; } }
    const R = await page.evaluate(n => (window.__CPM_GK229 || []).slice(0, n).map(r => ({ ck: r.ck, ph: r.ph, ok: r.ok, at: r.at, aT: r.aT, aD: r.aD, bx: r.bx, bz: r.bz, by: r.by, atx: r.atx, atz: r.atz, pa: r.pa, ht: r.ht })), R0);
    const porta = await page.evaluate(() => window.__CPM_PORTA367 || null);
    const w367 = await page.evaluate(() => (window.__CPM_TIRI367 || []).slice(-1)[0] || null);
    const esito = await page.evaluate(() => { try { const s = window.__CPM_SCORE ? window.__CPM_SCORE() : null; const tl = (window.__CPM_TIMELINE ? window.__CPM_TIMELINE() : []).filter(e => e.type === 'ActionResolved').pop() || null; return { score: JSON.stringify(s), tl: tl ? { ok: tl.ok, key: tl.key } : null }; } catch (e) { return null; } });
    if (esito) esito.score0 = punti0;
    await ctx.close(); if (mio) await b.close();
    return { sc, label, R, porta, glb, esito, errs, w367, foto: fotoFatta };
  } catch (e) { try { if (ctx) await ctx.close(); } catch (_e) {} try { if (mio && b) await b.close(); } catch (_e) {} return { sc, skip: 'errore: ' + String(e.message || e).split('\n')[0].slice(0, 100) }; }
}

/* dalla traccia alle misure. Tutto dal pallone (mesh) e dalla porta (mesh): una sorgente sola. */
export function misura(o) {
  if (o.skip) return { nonGiud: o.skip };
  if (!o.glb) return { nonGiud: 'corpi GLB non accesi' };
  const P = o.porta; if (!P || !P.pali || P.pali.length < 2) return { nonGiud: 'porta non letta dalle mesh' };
  const GLX = P.pali[0].x, HW = Math.max(...P.pali.map(p => Math.abs(p.z))), H = P.pali[0].h;
  const R = o.R || []; const iK = R.findIndex(r => r.at && r.aT >= 0); if (iK < 0) return { nonGiud: 'calcio non campionato' };
  const kind = R[iK].ok; if (kind !== 'wide') return { nonGiud: 'esito ' + kind };
  const T = R.slice(iK); const k0 = T[0];
  /* il pallone di un tiro fuori si ferma sul fondo a x 48,5 (AWAY_GOAL_X + 2,5), un decimo PRIMA del piano dei pali (misurato): il punto
     d'uscita e' il primo fotogramma entro mezza unita' dal piano; se non ci arriva mai resta «non alla linea» e si dichiara. */
  let cross = null;
  const iA = T.findIndex(r => !r.at); const A = iA > 0 ? T[iA - 1] : null; /* ultimo fotogramma dell'arco */
  /* l'uscita e' l'arrivo sul fondo: primo fotogramma col pallone a x >= piano dei pali - 0,15 (il pallone si ferma a 48,5); punizione e
     rigore si fermano un decimo prima (misurato 48,4): per loro vale il primo fotogramma entro mezza unita' dal piano */
  let iX = -1; for (const soglia of [0.15, 0.5]) { const i = T.findIndex(r => r.bx >= GLX - soglia); if (i >= 0) { iX = i; cross = { z: T[i].bz, y: T[i].by, ck: T[i].ck - k0.ck, inArco: !!T[i].at }; break; } }
  const L = T[T.length - 1];
  /* |z| massima DOPO l'uscita (prima conta il punto del calcio: un tiro dalla fascia parte gia' largo) */
  const D = iX >= 0 ? T.slice(iX) : [];
  const xMax = Math.max(...T.map(r => r.bx)), zMax = D.length ? Math.max(...D.map(r => Math.abs(r.bz))) : null, yMax = Math.max(...T.map(r => r.by));
  /* L'ESITO NON CAMBIA: tipo dichiarato dal motore in ogni fotogramma, post-arco mai di rete o di legno, pallone mai dentro la porta */
  const tipi = [...new Set(T.map(r => r.ok))], post = [...new Set(T.map(r => r.pa).filter(Boolean))];
  const inRete = T.some(r => r.bx > GLX && Math.abs(r.bz) < HW && r.by < H);
  const out = { tipi, post, inRete, GLX, HW, H, fondo: P.fondo, kx: k0.bx, kz: k0.bz, dist: +Math.hypot(GLX - k0.bx, k0.bz).toFixed(1), atx: k0.atx, atz: k0.atz, xMax, zMax, yMax, fx: L.bx, fz: L.bz, fy: L.by, n: T.length, ax: A ? A.bx : null, az: A ? A.bz : null, ay: A ? A.by : null, durArco: A ? +(A.ck - k0.ck).toFixed(2) : null, riposoLato: +Math.max(0, Math.abs(L.bz) - HW).toFixed(2), dopoLato: zMax == null ? null : +Math.max(0, zMax - HW).toFixed(2) };
  if (!cross) return { ...out, nonLinea: true, lato: null, sopra: null, scarto: null };
  const lato = Math.max(0, Math.abs(cross.z) - HW), sopra = Math.max(0, cross.y - H);
  return { ...out, cz: +cross.z.toFixed(2), cy: +cross.y.toFixed(2), lato: +lato.toFixed(2), sopra: +sopra.toFixed(2), scarto: +Math.hypot(lato, sopra).toFixed(2), nelloSpecchio: lato === 0 && sopra === 0, daBersaglio: +Math.abs(cross.z - k0.atz).toFixed(2) /* quanto l'arrivo sul fondo dista dal bersaglio dell'arco al calcio */ };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const ROSSO = !!process.env.CPM_ROSSO, REP = +(process.env.CPM_REP || 3), PAR = +(process.env.CPM_PAR || 3);
  const SC = (process.env.CPM_SCENE || SCENE_367).split(',').map(s => { const [gi, ai, fam] = s.split(':'); return { gi, ai, fam }; });
  const srv = await startServer(); const port = srv.address().port;
  const lavori = []; for (const sc of SC) for (let r = 0; r < REP; r++) lavori.push(sc);
  const ris = []; let nx = 0;
  await Promise.all(Array.from({ length: PAR }, async () => { while (nx < lavori.length) { const sc = lavori[nx++]; let o = await tiro(null, port, sc, { rosso: ROSSO }); if (o.skip && /^errore/.test(o.skip)) o = await tiro(null, port, sc, { rosso: ROSSO }); /* un guasto del browser si riprova una volta, dichiarato */ const m = misura(o); ris.push({ sc, label: o.label, m, esito: o.esito, errs: o.errs, w: o.w367 });
    console.log(`  gi${sc.gi} a${sc.ai} ${sc.fam.padEnd(15)} ${String(o.label || '').slice(0, 26).padEnd(26)} ` + (m.nonGiud ? 'NON GIUDICATO: ' + m.nonGiud : m.nonLinea ? `non arriva alla linea (x max ${f(m.xMax, 1)}, riposo ${f(m.fx, 1)};${f(m.fz, 1)})` : `${o.w367 ? (o.w367.oltre ? '[OLTRE] ' : '') : '[fuori dal blocco 223] '}da ${f(m.dist, 0)}u · sul piano z ${f(m.cz)} y ${f(m.cy)} → lato ${f(m.lato)} sopra ${f(m.sopra)} scarto ${f(m.scarto)}${m.nelloSpecchio ? ' NELLO SPECCHIO' : ''} · x max ${f(m.xMax, 1)} · dopo l'uscita fino a ${f(m.dopoLato)} dal palo · quota max ${f(m.yMax, 1)} · riposo ${f(m.fx, 1)};${f(m.fz, 1)}`)); } }));
  srv.close();
  const P0 = (ris.find(r => r.m.GLX) || {}).m;
  if (P0) console.log(`\n  porta dalle mesh: piano dei pali x ${P0.GLX} · mezza luce ${P0.HW} · traversa ${P0.H} · primo ostacolo dietro: ${P0.fondo ? P0.fondo.k + ' a x ' + P0.fondo.x + ' (alto ' + P0.fondo.y + ')' : 'nessuno etichettato'}`);
  const fam = {}; for (const r of ris) (fam[r.sc.fam] = fam[r.sc.fam] || []).push(r);
  console.log(`\n  ${ROSSO ? 'PRIMA (__CPM_NO_G367)' : 'DOPO'} — scarto dal telaio sul piano dei pali, in metri (famiglia: n · mediana · 90° · massimo | sopra max | dopo l'uscita: mediana · massimo dal palo | x max | non alla linea | nello specchio | non giudicati)`);
  const riga = (nome, L) => { const g = L.filter(r => !r.m.nonGiud), v = g.filter(r => r.m.scarto != null); const s = stat(v.map(r => r.m.scarto));
    console.log(`  ${nome.padEnd(15)} ${String(s.n).padStart(3)} · ${f(s.med)} · ${f(s.p90)} · ${f(s.max)} | ${f(v.length ? Math.max(...v.map(r => r.m.sopra)) : null)} | ${f(stat(v.map(r => r.m.dopoLato)).med)} · ${f(stat(v.map(r => r.m.dopoLato)).max)} | ${f(g.length ? Math.max(...g.map(r => r.m.xMax)) : null, 1)} | ${g.filter(r => r.m.nonLinea).length} | ${v.filter(r => r.m.nelloSpecchio).length} | ${L.length - g.length}`); };
  for (const k of Object.keys(fam)) riga(k, fam[k]); riga('TUTTE', ris);
  if (process.env.CPM_OUT) fs.writeFileSync(process.env.CPM_OUT, JSON.stringify(ris));
  process.exit(0);
}
