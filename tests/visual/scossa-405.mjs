#!/usr/bin/env node
/* GUARDIANO giro 405 (PO-582) — LA SCOSSA DELLA CAMERA ARRIVA SULLO SCHERMO.

   Domanda del PO: la scossa (gol, legni) arriva davvero sullo schermo o la smorzano l'arbitro d'inerzia (7.521) e le altre passate di
   camera? Le camere sono due (giro 241): REGIA e fotogramma DISEGNATO (dopo il «QUADRO DELL'EROE» del giro 96a).
   Testimone __CPM_SCOSSA405 (src/12, subito prima del disegno): per fotogramma la scossa chiesta (offset sulla posizione della camera) e
   dove cade sullo schermo un punto fermo (lo sguardo al primo fotogramma registrato, fermo per tutta la scena) visto dalla regia, dalla camera disegnata e dalla
   regia spostata della scossa chiesta («chiesta», cioe' cio' che si vedrebbe se la scossa arrivasse intera).
   Misura: passa-alto a seconda differenza (toglie il movimento lento della regia) sui fotogrammi con la scossa viva; RESA = guadagno in
   fase della posizione della camera (disegnata e di regia) sulla scossa chiesta: sum(hp(camera)·hp(chiesta)) / sum(hp(chiesta)^2).
   ⚠️ Lo strumento dichiarato per primo (energia del passa-alto di un punto fermo proiettato, meno il fondo in quadratura) NON misurava:
   nel verde, dove la scossa e' sommata per costruzione, dava 0,00 su 3 scene su 5 (punto fermo fuori quadro, proiezione non lineare;
   fondo dei 15 fotogrammi prima piu' mosso della scossa). Resta stampato come informativo; la soglia 0,50 non e' cambiata.
   SOGLIA DICHIARATA PRIMA DELLA MISURA (docs/sviluppo/giro405-soglia.md): VERDE se sulla camera disegnata la resa e' >= 0,50 in ogni
   scena; ROSSO (window.__CPM_NO_G405, la scossa di prima sul bersaglio di posizione) deve stare sotto 0,50 in almeno una scena.
   Una scena senza scossa, o con meno di 4 fotogrammi di scossa, o senza fondo, e' NON GIUDICATA = rosso.
   Corpi GLB accesi, __CPM_PRESENT=1, una pagina (e un browser) nuova per scena.
     CPM_CHROME=… node scossa-405.mjs     CPM_SOLO=verde|rosso   CPM_PAR=n (default 3)   CPM_OUT=file.json */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const SOLO = process.env.CPM_SOLO || '', PAR = +(process.env.CPM_PAR || 3), SOGLIA = 0.50;
const SCENE = [
  { gi: '8', ai: '0', nome: 'gol tiro da fuori', ok: 'success', kind: null },
  { gi: '86', ai: '0', nome: 'gol di testa', ok: 'success', kind: null },
  { gi: '5', ai: '0', nome: 'rigore segnato', ok: 'success', kind: null },
  { gi: '8', ai: '0', nome: 'palo tiro da fuori', ok: 'fail', kind: 'post' },
  { gi: '3', ai: '1', nome: 'palo tiro potenza', ok: 'fail', kind: 'post' },
];
const f = (x, n = 2) => x == null || !isFinite(x) ? '—' : (+x).toFixed(n);

async function scena(port, sc, rosso) {
  let b = null, ctx = null; const errs = [];
  try {
    b = await launchBrowser();
    ctx = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage(); await installCdnRoutes(page);
    page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
    await page.addInitScript(r => { window.__CPM_GLB = true; window.__CPM_REC = true; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; window.__CPM_TOD = 'day'; if (r) window.__CPM_NO_G405 = 1; }, rosso);
    await openMatch(page, port, { name: 'Scossa405' });
    await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 90000 }).catch(() => {});
    const glb = await page.evaluate(() => !!window.__CPM_GLB && (window.__CPM_MXCLIP | 0) > 0);
    const ok = await page.evaluate(g => window.__CPM_FORCE_SIT(+g, true), sc.gi).catch(() => false);
    if (!ok) return { skip: 'forzatura fallita' };
    await page.waitForFunction(g => { try { const a = window.__CPM_ACTS() || [], s = SITUATIONS[g]; return !!s && a.length === s.actions.length; } catch (e) { return false; } }, +sc.gi, { timeout: 8000 }).catch(() => {});
    await sleep(300);
    await page.evaluate(([o, k]) => { window.__CPM_FROZEN = false; window.__CPM_SCOSSA405 = []; window.__CPM_FORCE_OUTCOME = o; if (k) window.__CPM_FORCE_KIND = k; }, [sc.ok, sc.kind]);
    await page.evaluate(a => window.__CPM_RESOLVE(a), +sc.ai);
    /* si aspetta un EVENTO: la scossa e' partita ed e' finita da 12 fotogrammi; tetto di parete 120 s */
    const t0 = Date.now(); let st = null;
    while (Date.now() - t0 < 120000) {
      await sleep(400);
      st = await page.evaluate(() => { const W = window.__CPM_SCOSSA405 || []; let i0 = -1, i1 = -1; for (let i = 0; i < W.length; i++) { if (W[i].p > 0) { if (i0 < 0) i0 = i; i1 = i; } } return { n: W.length, i0, i1 }; });
      if (st.i0 >= 0 && st.n - st.i1 > 12) break;
    }
    const W = await page.evaluate(() => window.__CPM_SCOSSA405 || []);
    return { glb, W, errs };
  } catch (e) { return { skip: 'errore: ' + String(e.message || e).split('\n')[0].slice(0, 100) }; }
  finally { try { if (ctx) await ctx.close(); } catch (_e) {} try { if (b) await b.close(); } catch (_e) {} }
}

/* passa-alto a seconda differenza su un vettore (x,y) campionato per fotogramma */
const hp = (W, i, kx, ky) => [W[i][kx] - (W[i - 1][kx] + W[i + 1][kx]) / 2, W[i][ky] - (W[i - 1][ky] + W[i + 1][ky]) / 2];
const rms = L => L.length ? Math.sqrt(L.reduce((a, v) => a + v[0] * v[0] + v[1] * v[1], 0) / L.length) : null;

export function misura(o) {
  if (o.skip) return { nonGiud: o.skip };
  if (!o.glb) return { nonGiud: 'corpi GLB non accesi' };
  const W = o.W || []; const S = []; for (let i = 1; i < W.length - 1; i++) if (W[i].p > 0.05) S.push(i);
  if (S.length < 4) return { nonGiud: `scossa assente o troppo corta (${S.length} fotogrammi)` };
  const i0 = S[0], B = []; for (let i = Math.max(1, i0 - 15); i < i0; i++) if (W[i].p === 0 && W[i - 1].p === 0 && W[i + 1].p === 0) B.push(i);
  if (B.length < 4) return { nonGiud: `fondo troppo corto (${B.length} fotogrammi prima della scossa)` };
  const jq = rms(S.map(i => hp(W, i, 'qx', 'qy')));
  if (!(jq > 1e-6)) return { nonGiud: 'scossa chiesta nulla sullo schermo' };
  /* guadagno in fase (misura ausiliaria, non giudica): regressione del passa-alto dello schermo su quello della scossa chiesta */
  const gain = (kx, ky) => { let a = 0, q = 0; for (const i of S) { const h = hp(W, i, kx, ky), r = hp(W, i, 'qx', 'qy'); a += h[0] * r[0] + h[1] * r[1]; q += r[0] * r[0] + r[1] * r[1]; } return a / q; };
  const res = (kx, ky) => { const j = rms(S.map(i => hp(W, i, kx, ky))), bb = rms(B.map(i => hp(W, i, kx, ky))); return { j, b: bb, resa: Math.sqrt(Math.max(0, j * j - bb * bb)) / jq, g: gain(kx, ky) }; };
  const dis = res('dx', 'dy'), reg = res('rx', 'ry');
  const pmax = Math.max(...S.map(i => W[i].p)), durS = (W[S[S.length - 1]].t - W[i0].t) / 1000, dtMed = S.map(i => W[i].dt).sort((a, b) => a - b)[S.length >> 1];
  /* ampiezza chiesta e resa in unita' di scena (posizione della camera disegnata, passa-alto) */
  const jo = rms(S.map(i => [W[i].ox - (W[i - 1].ox + W[i + 1].ox) / 2, W[i].oz - (W[i - 1].oz + W[i + 1].oz) / 2]));
  const jc = rms(S.map(i => hp(W, i, 'cx', 'cz'))), bc = rms(B.map(i => hp(W, i, 'cx', 'cz')));
  /* LA MISURA CHE GIUDICA: guadagno in fase della POSIZIONE della camera (disegnata cx/cz, regia gx/gz) sulla scossa chiesta (ox/oz).
     Una traslazione della camera sposta l'immagine di o/profondita': lo stesso fattore per chiesta e resa, quindi e' la resa a schermo. */
  const gp = (kx, kz) => { let a = 0, q = 0; for (const i of S) { const h = hp(W, i, kx, kz), r = [W[i].ox - (W[i - 1].ox + W[i + 1].ox) / 2, W[i].oz - (W[i - 1].oz + W[i + 1].oz) / 2]; a += h[0] * r[0] + h[1] * r[1]; q += r[0] * r[0] + r[1] * r[1]; } return a / q; };
  return { n: S.length, pmax, durS, dtMed, jq, dis, reg, resaPos: Math.sqrt(Math.max(0, jc * jc - bc * bc)) / jo, gDis: gp('cx', 'cz'), gReg: gp('gx', 'gz'), amp: Math.max(...S.map(i => Math.hypot(W[i].ox, W[i].oz))), fasi: [...new Set(S.map(i => W[i].ph))] };
}

async function braccio(port, nome) {
  const rosso = nome === 'rosso', ris = []; let nx = 0;
  await Promise.all(Array.from({ length: PAR }, async () => { while (nx < SCENE.length) { const sc = SCENE[nx++];
    let o = await scena(port, sc, rosso); if (o.skip && /^errore/.test(o.skip)) o = await scena(port, sc, rosso); /* un guasto del browser si riprova una volta, dichiarato */
    const m = misura(o); ris.push({ sc, m, errs: o.errs || [] });
    console.log(`  [${nome}] gi${sc.gi} ${sc.nome.padEnd(20)} ` + (m.nonGiud ? 'NON GIUDICATO: ' + m.nonGiud : `${m.n} fotogrammi di scossa (${f(m.durS)} s, potenza max ${f(m.pmax)}, dt ${f(m.dtMed, 3)}) · fasi ${m.fasi.join('/')} · RESA camera DISEGNATA ${f(m.gDis)} · regia ${f(m.gReg)} (scossa chiesta fino a ${f(m.amp)} u) | informativi: energia in posizione ${f(m.resaPos)} · punto fermo a schermo disegnata ${f(m.dis.resa)}/${f(m.dis.g)} regia ${f(m.reg.resa)}/${f(m.reg.g)}`)); } }));
  return ris;
}

function giudica(nome, ris) {
  const motivi = [];
  for (const r of ris) { const chi = `gi${r.sc.gi} ${r.sc.nome}`;
    if (r.m.nonGiud) { motivi.push(`${chi}: non giudicato (${r.m.nonGiud})`); continue; }
    if (r.errs.length) motivi.push(`${chi}: errore di pagina ${r.errs[0]}`);
    if (nome === 'verde' && !(r.m.gDis >= SOGLIA)) motivi.push(`${chi}: resa sulla camera disegnata ${f(r.m.gDis)} < ${f(SOGLIA)}`); }
  if (nome === 'rosso') { const g = ris.filter(r => !r.m.nonGiud), sotto = g.filter(r => r.m.gDis < SOGLIA).length;
    if (!sotto) motivi.push(`il rosso non riproduce: nessuna scena sotto ${f(SOGLIA)} sulla camera disegnata`); }
  return motivi;
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const srv = await startServer(); const port = srv.address().port; let esito = 0; const righe = [], tutto = {};
  for (const nome of ['verde', 'rosso']) { if (SOLO && SOLO !== nome) continue;
    const ris = await braccio(port, nome); tutto[nome] = ris.map(r => ({ sc: r.sc, m: r.m })); const motivi = giudica(nome, ris);
    righe.push(motivi.length ? `✗ braccio ${nome}: ${motivi.join(' · ')}` : `✓ braccio ${nome}: ${nome === 'rosso' ? 'con la scossa di prima la camera disegnata ne mostra meno della meta\'' : 'la scossa arriva sulla camera disegnata per almeno la meta\' in ogni scena'}`);
    if (motivi.length) esito = 1; }
  if (process.env.CPM_OUT) fs.writeFileSync(process.env.CPM_OUT, JSON.stringify(tutto));
  /* braccio e motivo stampati per ultimi */
  console.log('\n' + righe.join('\n')); console.log(esito ? '\n❌ scossa-405 ROSSO' : '\n✅ scossa-405 VERDE (verde + rosso)');
  srv.close(); setTimeout(() => process.exit(esito), 200);
}
