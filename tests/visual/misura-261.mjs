#!/usr/bin/env node
/* [giro 261] SONDA della serata di presentazione (misure condivise col guardiano serata-261.mjs). Tre misure, ognuna su una pagina nuova:
     A) traccia LUNGA della fila al beat 1: stesso campione e stesso criterio di presentazione-142 (ossa head/hand/spine_03/upperarm, spostamento
        massimo < 1,5 mm fra due campioni = fermo), per `dur` ms, con la velocita' (mm/s di scena) accanto: dice DOVE e QUANTO un corpo si ferma;
     B) `pro` (teste degli omeri davanti al torace) e `nuca` per corpo in tre momenti (stessa scena e stesso metro di spalle-146);
     C) il saluto al rallentatore (come misura-256 --lento, stesso salvataggio e stesso chiamato del battito 3): salti256 a saluto in corso
        (peso > 0,02) e in piu' l'INGRESSO, cioe' i passi dal fotogramma a peso 0 in poi, che salti256 non guarda.
   Uso: node misura-261.mjs [A|B|C|ABC] [giri]
        CPM_NO=__CPM_NO_G261[,nome=valore] accende i rossi e gli interruttori di prova · CPM_DUR/CPM_PASSO per A · CPM_CLIP per C · CPM_TUTTI=1 tutti i passi di C.
   Strumento di misura, non guardiano. E' la sonda usata per il bisect dei due rossi della serata (docs/sviluppo/giro261/). */
import fs from 'node:fs';
if (!process.env.CPM_CHROME && fs.existsSync('/opt/pw-browsers/chromium')) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const { startServer, launchBrowser, installCdnRoutes, sleep } = await import('./lib/harness.mjs');
export { startServer, launchBrowser };
const PRO = { id: 'parm', n: 'FC Parmense', a: 'PAR', p: 62, c: '#facc15', c2: '#2563eb', nat: '🇮🇹', lg: 'Lega A' };
/* lo stesso salvataggio di presentazione-142 */
const SAVE142 = { phase: 'career', player: { name: 'Presenta Probe', nation: 'Italia', avatarId: 0, proStatus: 'u18', season: 1, week: 1, age: 16, ovr: 60,
  tutorialDone: true, campDone: true, jerseyNum: 9, jerseyNumSeason: 1, presidentModalSeason: 1, drawSeen: 1, mercatoSeen: 1, coachPactSeason: 1, presentedClub: PRO.id, presentSeason: 1,
  seasonPledge: { season: 1, tone: 'equilibrato' }, squadRole: 'titolare', club: PRO,
  stats: { 'velocità': 60, tecnica: 60, fisico: 60, 'mentalità': 60, tiro: 60, passaggio: 60, dribbling: 60, posizionamento: 60 },
  form: 70, morale: 70, fatigue: 20, coachTrust: 60, teamChemistry: 60, popularity: 10, bankBalance: 1000, goals: 0, assists: 0, matches: 0, totalMatches: 0, totalGoals: 0, matchHistory: [],
  contract: { duration: 3, wage: 1000, expiresAtSeason: 4 } } };
/* interruttori: «nome» → 1, «nome=valore» → numero */
const INIT = ([o, no, extra]) => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; for (const k of no) { const [a, v] = String(k).split('='); window[a] = v != null ? +v : 1; }
  for (const k in (extra || {})) window[k] = extra[k]; localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); };
async function carriera(p, port, attesa) {
  await p.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: attesa, timeout: 120000 });
  await p.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); await sleep(1500);
  try { await p.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await p.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }); await sleep(1000);
  try { await p.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
}
const serata = (p, n) => p.evaluate(x => window.__CPM_CAREER.apriPresentazione(x), n).then(() => p.waitForFunction(() => window.__CPM_PRES142 && window.__CPM_PRES142.men && window.__CPM_PRES142.men.length >= 2, null, { timeout: 90000 }));

/* A) la fila al beat 1, traccia lunga */
export async function misuraA(browser, port, NO = [], { dur = +(process.env.CPM_DUR || 30000), passo = +(process.env.CPM_PASSO || 120), beat = 1 } = {}) {
  const page = await browser.newPage({ viewport: { width: 360, height: 800 } }); await installCdnRoutes(page); await page.addInitScript(INIT, [SAVE142, NO, null]);
  let out;
  try {
    await carriera(page, port, 'domcontentloaded'); await serata(page, beat);
    const T = await page.evaluate(async ([dur, passo]) => { const P = window.__CPM_PRES142, v = new THREE.Vector3(), S = [];
      const snap = () => ({ el: P.el, pz: P.men.map(m => { const a = []; m.updateMatrixWorld(true); m.traverse(o => { if (o.isBone && /^(head|hand_[lr]|spine_03|upperarm_[lr])$/.test(o.name)) { o.getWorldPosition(v); a.push(v.x, v.y, v.z); } }); return a; }) });
      const t0 = performance.now(); while (performance.now() - t0 < dur) { S.push(snap()); await new Promise(r => setTimeout(r, passo)); }
      const corpi = P.men.map((_, i) => { let best = 0, run = 0, r0 = 0, bestDa = 0; const lente = [];
        for (let k = 1; k < S.length; k++) { const a = S[k - 1].pz[i], b = S[k].pz[i]; let mx = 0; for (let j = 0; j < a.length; j += 3) mx = Math.max(mx, Math.hypot(a[j] - b[j], a[j + 1] - b[j + 1], a[j + 2] - b[j + 2]));
          const dt = (S[k].el || 0) - (S[k - 1].el || 0); if (mx < 0.0015) { if (run === 0) r0 = S[k - 1].el; run += dt; if (run > best) { best = run; bestDa = r0; } } else run = 0; if (dt > 0) lente.push(mx / dt * 1000); }
        lente.sort((p, q) => p - q); return { fermo: +best.toFixed(2), da: +bestDa.toFixed(2), vMed: lente.length ? +lente[Math.floor(lente.length / 2)].toFixed(1) : null, v10: lente.length ? +lente[Math.floor(lente.length / 10)].toFixed(1) : null }; });
      return { el0: +S[0].el.toFixed(2), el1: +S[S.length - 1].el.toFixed(2), campioni: S.length, passoScena: +((S[S.length - 1].el - S[0].el) / S.length).toFixed(3), corpi }; }, [dur, passo]);
    out = { no: NO, max: Math.max(...T.corpi.map(x => x.fermo)), ...T };
  } catch (e) { out = { errore: 'A: ' + String(e.message || e).slice(0, 200) }; }
  await page.close(); return out;
}

/* B) protrazione e nuca nel tempo (scena e metro di spalle-146) */
export async function misuraB(browser, port, NO = []) {
  const M = await import('./spalle-146-scene.mjs');
  const S = await M.scenaPresentazione(browser, port, { width: 360, height: 800 }, NO.length ? NO.join(',') : false, 'misura261' + (NO.length ? '-rosso' : ''));
  const ok = S.filter(x => !x.errore), E = ok.filter(x => x.chi === 'eroe').map(x => x.nuca).sort((a, b) => a - b);
  /* deriva nel tempo, per corpo: pro all'ultimo campione − pro al primo */
  const chi = [...new Set(ok.map(x => x.chi))], der = chi.map(c => { const L = ok.filter(x => x.chi === c); return L.length >= 2 ? +(L[L.length - 1].pro - L[0].pro).toFixed(4) : null; }).filter(x => x != null);
  return { no: NO, errori: S.filter(x => x.errore).map(x => x.errore), n: ok.length, proMin: ok.length ? Math.min(...ok.map(x => x.pro)) : null, proMax: ok.length ? Math.max(...ok.map(x => x.pro)) : null, sotto: ok.filter(x => !(x.pro >= 0.008)).length,
    derivaMax: der.length ? Math.max(...der.map(Math.abs)) : null, SjAj: ok.length ? [Math.min(...ok.map(x => x.SjAj)), Math.max(...ok.map(x => x.SjAj))] : null, SjAjEroe: ok.filter(x => x.chi === 'eroe').map(x => x.SjAj),
    quota: ok.length ? [Math.min(...ok.map(x => +(x.qS * x.H / x.Aj).toFixed(3))), Math.max(...ok.map(x => +(x.qS * x.H / x.Aj).toFixed(3)))] : null, spiovV: ok.length ? [Math.min(...ok.map(x => x.spiovV)), Math.max(...ok.map(x => x.spiovV))] : null, nucaEroe: E, nucaMed: E.length ? E[Math.floor(E.length / 2)] : null, pro: ok.map(x => `${x.fase}/${x.chi} ${x.pro}`) };
}

/* C) il saluto al rallentatore */
export async function misuraC(browser, port, NO = [], { clip = process.env.CPM_CLIP || 'rohr-clapping-hands-up', tutti = !!process.env.CPM_TUTTI } = {}) {
  const { salti256, provaSalti256 } = await import('./lib/saluto-256.mjs');
  const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, serviceWorkers: 'block' }); await installCdnRoutes(ctx); const p = await ctx.newPage();
  await p.addInitScript(INIT, [SAVE, NO, { __CPM_LENTO256: 0.125, __CPM_CLIP240: clip }]);
  let out;
  try {
    await carriera(p, port, 'load');
    await serata(p, 1); await p.waitForFunction(() => !!window.__CPM_PRES142.cam, null, { timeout: 90000 }); await sleep(2600); await serata(p, 3);
    const S = await p.evaluate(async () => { const P = window.__CPM_PRES142; const S = []; const t0 = performance.now(); let visto = false, fuori = false;
      while (performance.now() - t0 < 150000) { await new Promise(r => requestAnimationFrame(r)); const i = P.pi144; if (i == null || i < 0) continue; const m = P.men[i];
        S.push({ t: P.t144, w: P.w144 || 0, ts: P.ts240 || 0, z: m.position.z, or: P.orient256 ? P.orient256(i) : null, r261: m.userData.r261v != null ? m.userData.r261v : null, m261: m.userData.m261, d256: m.userData.d256 ? JSON.stringify(m.userData.d256) : null }); return o || (m.userData.d256 ? JSON.stringify(m.userData.d256) : null); })() });
        const z = m.position.z; if (z > 6.5) visto = true; if (visto && z < 6.02 && (P.t144 || 0) > 3) { if (fuori) break; fuori = true; } if ((P.t144 || 0) > 60) break; }
      return S; });
    const nrm = q => { const m = Math.hypot(...q); return q.map(x => x / m); }, aq = (a, c) => { a = nrm(a); c = nrm(c); return 2 * Math.acos(Math.min(1, Math.abs(a[0] * c[0] + a[1] * c[1] + a[2] * c[2] + a[3] * c[3]))) * 180 / Math.PI; };
    const O = ['u_l', 'u_r', 'f_l', 'f_r'], A = S.filter(s => s.or); let k0 = -1; for (let k = 1; k < A.length; k++) if (A[k].w > 0 && A[k - 1].w === 0 && A[k].ts < 0.2) { k0 = k; break; }
    /* un passo = [tempo del saluto, peso, omero sx, omero dx, avambraccio sx, avambraccio dx (gradi dal fotogramma prima), peso della rampa 261, la regola ha mosso] */
    const passi = (a, b) => { const R = []; for (let k = Math.max(1, a); k <= b && k < A.length; k++) R.push([+A[k].ts.toFixed(3), +A[k].w.toFixed(3), ...O.map(o => +aq(A[k].or[o], A[k - 1].or[o]).toFixed(1)), A[k].r261 != null ? +A[k].r261.toFixed(2) : null, A[k].m261, A[k].d256 || undefined]); return R; };
    let k1 = k0; while (k1 >= 0 && k1 < A.length && A[k1].ts < 0.25) k1++;
    const ing = k0 >= 0 ? passi(k0, k1) : [];
    /* IL PRIMO FOTOGRAMMA DEL SALUTO, braccio DESTRO (il sinistro in quel fotogramma sta ancora finendo l'oscillazione del cammino, che non e' rallentato:
       li' un passo grande e' velocita' x intervallo, non un salto). Si confronta col secondo piu' grande dei quattro passi successivi, come salti256. */
    let primo = null; if (ing.length >= 5) { const v = c => { const vic = [1, 2, 3, 4].map(j => ing[j][c]).sort((a, b) => b - a); return +(ing[0][c] - vic[1]).toFixed(2); }; primo = { ts: ing[0][0], peso: ing[0][1], omeroDx: ing[0][3], avambraccioDx: ing[0][5], eccOmeroDx: v(3), eccAvambraccioDx: v(5) }; }
    const pv = provaSalti256(S, 30);
    out = { no: NO, clip, campioni: S.length, salti: salti256(S), prova: pv ? pv.max : null, primo, primi: ing.slice(0, 12), tutti: tutti ? passi(1, A.length - 1) : undefined };
  } catch (e) { out = { errore: 'C: ' + String(e.message || e).slice(0, 200) }; }
  await ctx.close(); return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const cosa = process.argv[2] || 'ABC', giri = +(process.argv[3] || 1), NO = (process.env.CPM_NO || '').split(',').filter(Boolean);
  fs.mkdirSync('out', { recursive: true });
  const srv = await startServer(), port = srv.address().port, browser = await launchBrowser();
  for (let g = 0; g < giri; g++) {
    if (/A/.test(cosa)) console.log('A ' + JSON.stringify(await misuraA(browser, port, NO)));
    if (/B/.test(cosa)) console.log('B ' + JSON.stringify(await misuraB(browser, port, NO)));
    if (/C/.test(cosa)) console.log('C ' + JSON.stringify(await misuraC(browser, port, NO)));
  }
  await browser.close(); srv.close();
}
