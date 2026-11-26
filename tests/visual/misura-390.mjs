#!/usr/bin/env node
/* [giro 390, PO-653] SONDA sulle PARTITE VERE (non guardiano): «quando l'eroe fa un passaggio ad un compagno, in particolare
   tentativi di assist, quest'ultimo non e' gia' nella scena». GLB acceso, costruzione e teatro accesi (__CPM_CINE, __CPM_PRESENT:
   sul banco sono spenti), salvataggi veri x semi (il nome cambia col seme, quindi cambia la partita). A ogni scelta la sonda prende,
   se c'e', un'azione di passaggio/assist (premio «assist» o etichetta da passaggio) e, quando la scena si chiude, legge i fotogrammi
   del testimone __CPM_W390 (mesh e camera DISEGNATA, una sola sorgente) e misura per il RICEVENTE (il nominato del motore in
   lettura, passTargetMesh dal lancio):
   - dove sta all'apertura (primo fotogramma fuori dallo stacco nero) e se e' nel quadro disegnato;
   - quota dei fotogrammi di lettura (intro/move/choose, fuori stacco) col ricevente nel quadro;
   - quanto corre fra l'apertura e il lancio, e fra l'apertura e la ricezione (distanza in pianta).
   CPM_FLAGS (bracci), CPM_SALVA, CPM_SEMI, CPM_PAR, CPM_OUT, CPM_RADICE (cartella servita). */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const FX = (f) => JSON.parse(fs.readFileSync(new URL('./fixtures/' + f, import.meta.url)));
const SALVA = { s1: 'save-c177-s1w15.json', s5: 'save-c177-s5w20.json', s12: 'save-190-s12-ovr93.json' };
const FLAGS = (process.env.CPM_FLAGS || '').split(',').filter(Boolean);
const SEMI = (process.env.CPM_SEMI || '1,2').split(',').map(Number), SAVES = (process.env.CPM_SALVA || 's1,s5,s12').split(',');
const PAR = +(process.env.CPM_PAR || 3), OUT = process.env.CPM_OUT || 'out/misura-390.json';
const TMAX = +(process.env.CPM_TMAX || 1200000), STALLO = +(process.env.CPM_STALLO || 240000);
const RX_PASS = /pass|assist|filtr|imbuc|lancio|appogg|servi|scaric|uno-due|dai e vai|sponda|tocco|verticaliz|chip|tacco|scambi|lob|cambio/i;

/* misure di una scena dai fotogrammi del testimone __CPM_W390 (camera disegnata): «nel quadro» = piedi E testa dentro il 92 % del
   semiquadro orizzontale e il 95 % del verticale, davanti alla camera */
export const dentro390 = (r) => !!r && [r[0], r[1]].every(p => p[2] === 1 && Math.abs(p[0]) <= 0.92 && Math.abs(p[1]) <= 0.95);
export function metriche390(F) {
  if (!F || !F.length) return { cieco: 'senza fotogrammi' };
  /* l'APERTURA e' il primo fotogramma visibile DOPO lo stacco nero d'apertura: il primo fotogramma della scena (prima dello stacco) ha
     ancora l'eroe della scena di prima, e lo scatto «staging» lo porta sul suo punto sotto lo stacco */
  const lr = (f) => /^hl_(intro|move|choose)$/.test(f.ph);
  const iCut = F.findIndex(f => lr(f) && f.cut && f.ck <= 0.8);
  const i0 = iCut >= 0 ? iCut : 0;
  const lett = F.filter((f, i) => i >= i0 && lr(f) && !f.cut);
  const iA = F.findIndex((f, i) => i >= i0 && lr(f) && !f.cut);
  const iD = F.findIndex(f => f.dsp && f.src === 2);
  if (iD < 0) return { cieco: 'nessun passaggio lanciato a un compagno' };
  if (iA < 0) return { cieco: 'apertura non vista' };
  const A = F[iA], D = F[iD];
  if (!A.r) return { cieco: 'nessun ricevente nominato in lettura' };
  const volo = F.slice(iD).filter(f => f.src === 2 && !f.cut);
  const lettR = lett.filter(f => f.r);
  const iC = F.findIndex(f => f.ph === 'hl_choose' && !f.cut && f.r);
  /* distanza del ricevente dal suo posto credibile (12 u davanti all'eroe) all'apertura: avanti negativo = dietro l'eroe */
  const q = (a) => a.length ? +(a.filter(f => dentro390(f.r)).length / a.length).toFixed(2) : null;
  /* il ricevente VERO (quello del lancio) all'apertura e nella lettura, dall'elenco di tutti i compagni */
  const vero = (f) => { const e = (f.a || []).find(z => z[0] === D.i); return e ? [e[1], e[2], e[3], e[4]] : null; };
  const vA = vero(A), vL = lett.map(vero).filter(Boolean);
  return { idxLett: A.i, idxLancio: D.i, stesso: A.i === D.i ? 1 : 0, ht: D.ht,
    ape: { q: dentro390(A.r) ? 1 : 0, nx: A.r[0][0], dEroe: +Math.hypot(A.r[2] - A.h[2], A.r[3] - A.h[3]).toFixed(1), avanti: +(A.r[2] - A.h[2]).toFixed(1), fov: A.fov },
    sce: iC >= 0 ? { q: dentro390(F[iC].r) ? 1 : 0, nx: F[iC].r[0][0] } : null,
    quotaLettura: q(lettR), nLett: lettR.length, lancio: { q: dentro390(D.r) ? 1 : 0, nx: D.r[0][0], fov: D.fov }, quotaVolo: q(volo), nVolo: volo.length,
    eroeFuori: +(lett.concat(volo).filter(f => !dentro390(f.h)).length / Math.max(1, lett.length + volo.length)).toFixed(2),
    corsaAlLancio: A.i === D.i ? +Math.hypot(D.r[2] - A.r[2], D.r[3] - A.r[3]).toFixed(1) : null,
    veroApe: vA ? (dentro390(vA) ? 1 : 0) : null, veroLett: vL.length ? +(vL.filter(dentro390).length / vL.length).toFixed(2) : null,
    fovMedLett: lettR.length ? +(lettR.reduce((s, f) => s + f.fov, 0) / lettR.length).toFixed(1) : null };
}
export function riepilogo390(righe) {
  const g = righe.filter(r => r.m && !r.m.cieco); const c = righe.filter(r => !r.m || r.m.cieco);
  const med = (a) => { const s = a.filter(v => v != null).sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
  const fuoriApe = g.filter(r => r.m.ape.q !== 1).length, fuoriSce = g.filter(r => r.m.sce && r.m.sce.q !== 1).length, fuoriLancio = g.filter(r => r.m.lancio.q !== 1).length;
  const lunghe = g.filter(r => r.m.corsaAlLancio > 8).length;
  console.log(`\nRICEVENTE (${g.length} scene giudicate, ${c.length} cieche: ${c.map(r => r.m ? r.m.cieco : 'err').join(' · ') || '-'})`);
  const quote = g.map(r => r.m.quotaLettura ?? 1), voli = g.map(r => r.m.quotaVolo ?? 1), veri = g.map(r => r.m.veroLett ?? 0), veroFuoriApe = g.filter(r => r.m.veroApe !== 1).length;
  console.log(`  ricevente VERO (quello del lancio) fuori dal quadro all'apertura: ${veroFuoriApe} su ${g.length} · quota della lettura nel quadro: mediana ${med(veri)} · minima ${Math.min(...veri)}`);
  console.log(`  ricevente FUORI dal quadro all'apertura: ${fuoriApe} su ${g.length} · alla scelta: ${fuoriSce} su ${g.filter(r => r.m.sce).length} · al lancio: ${fuoriLancio} su ${g.length}`);
  console.log(`  quota della lettura col ricevente nel quadro: mediana ${med(quote)} · minima ${Math.min(...quote)} · quota del volo: mediana ${med(voli)} · minima ${Math.min(...voli)}`);
  console.log(`  ricevente della lettura = ricevente del lancio: ${g.filter(r => r.m.stesso).length} su ${g.length} · corsa apertura→lancio mediana ${med(g.map(r => r.m.corsaAlLancio))} u (oltre 8 u: ${lunghe}) · distanza dall'eroe all'apertura mediana ${med(g.map(r => r.m.ape.dEroe))} u`);
  console.log(`  eroe fuori dal quadro (lettura+volo): mediana ${med(g.map(r => r.m.eroeFuori))} · massima ${Math.max(0, ...g.map(r => r.m.eroeFuori))} · ottica media in lettura (mediana) ${med(g.map(r => r.m.fovMedLett))}°`);
  return { g: g.length, cieche: c.length, fuoriApe, fuoriSce, fuoriLancio, lunghe, minLett: Math.min(...quote), minVolo: Math.min(...voli), eroeFuoriMax: Math.max(0, ...g.map(r => r.m.eroeFuori)), veroFuoriApe, minVero: Math.min(...veri) };
}

async function gioca(b, srv, sk, sd, flags) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  const raw = FX(SALVA[sk]); let ls; const ritocca = (sv) => { const p = sv.player || sv; p.name += ' ' + sd; return sv; };
  if (raw['cpm-v3']) { ls = { ...raw }; ls['cpm-v3'] = JSON.stringify(ritocca(JSON.parse(ls['cpm-v3']))); delete ls['cpm-v3-riserva']; delete ls['cpm-match-resume']; }
  else ls = { 'cpm-v3': JSON.stringify(ritocca(JSON.parse(JSON.stringify(raw)))) };
  ls['cpm-match-speed'] = '2';
  await page.addInitScript(([s, arm]) => { window.__CPM_GLB = true; window.__CPM_REC = true; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; window.__CPM_REC390 = 1; window.__CPM_W390 = []; window.__CPM_REALWAIT = 1; window.__CPM_PARETE103 = 150000;
    for (const f of arm) window[f] = 1; for (const k in s) { try { localStorage.setItem(k, s[k]); } catch (e) {} } }, [ls, flags]);
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 90000 });
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 120000 }).catch(() => {});
  await page.evaluate((s) => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'mano', tickMs: 150 }), sd);
  const t0 = Date.now(), fatte = {}, righe = []; let prog = '', tProg = t0, chiusa = 'tetto', mMax = 0, aperta = null;
  while (Date.now() - t0 < TMAX) {
    const st = await page.evaluate(() => ({ ph: window.__CPM_PHASE(), c: window.__CPM_CURSIT(), a: window.__CPM_ACTSO ? (window.__CPM_ACTSO() || []) : [], m: window.__CPM_CLOCK ? window.__CPM_CLOCK() : null })).catch(() => null);
    if (!st) { chiusa = 'pagina'; break; } if (st.m > mMax) mMax = st.m;
    const inHL = /^hl_/.test(st.ph || '');
    if (aperta && !inHL) {
      const F = await page.evaluate((k) => (window.__CPM_W390 || []).filter(f => f.sk === k), aperta.sk);
      righe.push({ nome: `${sk}/${sd} ${aperta.min}'`, testo: aperta.t, az: aperta.az, rew: aperta.rew, m: metriche390(F), ...(process.env.CPM_GREZZO ? { F } : {}) });
      aperta = null; await page.evaluate(() => { window.__CPM_W390.length = 0; });
    }
    if (st.ph === 'ended' || st.ph === 'ceremony') { chiusa = 'fine'; break; }
    const k = st.ph + '|' + st.m + '|' + (st.c ? st.c.i : ''); if (k !== prog) { prog = k; tProg = Date.now(); } else if (Date.now() - tProg > STALLO) { chiusa = 'stallo'; break; }
    if (st.ph === 'hl_choose' && st.c && !fatte[st.c.i] && st.a.length && !st.c.def) {
      const cand = st.a.filter(a => a.rew === 'assist' || RX_PASS.test(a.label || ''));
      fatte[st.c.i] = 1; const sk2 = await page.evaluate(() => { const W = window.__CPM_W390 || []; return W.length ? W[W.length - 1].sk : null; });
      if (cand.length) {
        const a = cand[(sd + st.c.i) % cand.length];
        await sleep(1200);/* si lascia leggere, come fa chi gioca */
        await page.evaluate((k) => { const R = window.__CPM_RESEED; window.__CPM_RESEED = undefined; try { return window.__CPM_RESOLVE(k); } finally { window.__CPM_RESEED = R; } }, a.i);
        aperta = { sk: sk2, t: st.c.t, az: a.label, rew: a.rew, min: st.m };
      } else await page.evaluate(() => { window.__CPM_W390.length = 0; });
    }
    await sleep(100);
  }
  await ctx.close();
  return { sk, sd, chiusa, mMax, errs, s: Math.round((Date.now() - t0) / 1000), righe };
}
export async function corsa390({ flags = FLAGS, saves = SAVES, semi = SEMI, par = PAR, radice = process.env.CPM_RADICE } = {}) {
  const srv = radice ? await startServer(radice) : await startServer(); const b = await launchBrowser();
  const lavori = []; for (const sk of saves) for (const sd of semi) lavori.push({ sk, sd });
  const fatti = []; let p = 0;
  await Promise.all(Array.from({ length: Math.min(par, lavori.length) }, async () => { while (p < lavori.length) { const i = p++;
    try { fatti[i] = await gioca(b, srv, lavori[i].sk, lavori[i].sd, [...flags]);/* i flag viaggiano con la partita: due bracci nello stesso processo non se li scambiano */ } catch (e) { fatti[i] = { ...lavori[i], err: String(e).slice(0, 160), righe: [] }; }
    const f = fatti[i]; console.log(`${f.sk} seme ${f.sd} (${f.chiusa || 'err'}, ${f.s || '-'} s, ${f.mMax || '-'}') scene di passaggio ${f.righe.length}${f.err ? ' ERR ' + f.err : ''}${f.errs && f.errs.length ? ' pageerror ' + f.errs[0] : ''}`);
    for (const r of f.righe) { const m = r.m; console.log(`  ${r.nome} «${(r.testo || '').slice(0, 34)}» → «${(r.az || '').slice(0, 24)}» ${m.cieco ? 'CIECO ' + m.cieco : `${m.ht} ric#${m.idxLett}/${m.idxLancio} ape q${m.ape.q} nx ${m.ape.nx} dEroe ${m.ape.dEroe} av ${m.ape.avanti} fov ${m.ape.fov} | scelta q${m.sce ? m.sce.q + ' nx ' + m.sce.nx : '-'} | lettura ${m.quotaLettura} (${m.nLett}) | lancio q${m.lancio.q} nx ${m.lancio.nx} | volo ${m.quotaVolo} (${m.nVolo}) | corsa ${m.corsaAlLancio} | eroe fuori ${m.eroeFuori} | VERO ape q${m.veroApe} lett ${m.veroLett}`}`); } } }));
  await b.close(); srv.close();
  return fatti;
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const fatti = await corsa390();
  fs.mkdirSync('out', { recursive: true }); fs.writeFileSync(OUT, JSON.stringify({ flags: FLAGS, fatti: process.env.CPM_GREZZO ? fatti : fatti.map(f => ({ ...f, righe: f.righe.map(r => ({ ...r, F: undefined })) })) }));
  console.log(`\nmisura-390 ${FLAGS.join(',') || 'verde'}: partite ${fatti.length}, finite ${fatti.filter(f => f && f.chiusa === 'fine').length}`);
  riepilogo390(fatti.flatMap(f => (f && f.righe) || []));
}
