#!/usr/bin/env node
/* [giro 291 PO-550] «QUANDO SI INTERCETTA IL PALLONE L'EROE CORRE NELLA DIREZIONE SBAGLIATA E NON VERSO LA PORTA AVVERSARIA».
   Sonda + guardiano. GLB ACCESO, __CPM_PRESENT=1, __CPM_CINE=1 (il vincitore dell'esito _post31 e' spento sotto ?cpmtest=1 senza
   questo), tempo di scena reale (__CPM_DTREAL), UNA PAGINA NUOVA PER SCENA (lezione 7.483).
   Per ogni scena difensiva (SITUATIONS type def) forzata e risolta RIUSCITA (__CPM_FORCE_OUTCOME='success') legge il registratore
   del gioco __CPM_REC_BUF (eroe h, pallone b, arco, fase, chiave) e — dove c'e' — il testimone __CPM_G291W (chi scrive il bersaglio
   dell'eroe: vincitore _post31 e suo verso, appoggio _hold31, orientamento del corpo, mira latchata).
   Il frame di gioco e' eroe-centrico: la squadra dell'eroe attacca SEMPRE x crescente (la porta avversaria e' a x +48,6 · z 0), nei
   due tempi e in casa come in trasferta (alla ripresa gira lo stadio, 7.732) — la sonda lo verifica coi lati dei portieri.
   MISURA per scena: tratto «pallone al piede» = fotogrammi di hl_result dopo l'arco d'esito con pallone entro 1,6 u dall'eroe;
     sp   = spostamento dell'eroe nel tratto (u Three.js) · cosP = coseno fra lo spostamento e la retta eroe→porta avversaria
     dxE/dzE · dxB = spostamento del pallone nell'intero esito · rot = scarto fra orientamento del corpo e porta a fine tratto.
   VERDETTO di scena: «avanti» se sp >= 1,0 u e cosP >= 0,5 (entro 60° dalla porta) · «sbagliata» se sp >= 1,0 u e cosP < 0,5 ·
     «ferma» se sp < 1,0 u · «non portata» se l'eroe non ha mai il pallone al piede (lo vince un compagno: non e' questa nota).
   GUARDIANO (--guardiano): due bracci sulle stesse scene. VERDE: almeno 8 scene portate dall'eroe, di almeno 4 famiglie, TUTTE
     «avanti» (N su N; «ferma» e «non giudicata» = rosso). ROSSO (__CPM_NO_G291): almeno meta' delle scene portate «sbagliata».
   Uso: node intercetto-291.mjs [--guardiano]   GIS=31:0,32:1   ROSSO=__CPM_NO_G291   OUT=file.jsonl   FLOW=K1,K2 (partite vere) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import { loadSituations } from './lib/situations.mjs';

const GUARD = process.argv.includes('--guardiano');
const OUT = process.env.OUT || null;
const GLX = 48.6;
const FAM = {}; for (const g of [31, 34, 54, 127, 128, 129, 131, 137, 138, 139, 146, 168, 183, 189, 190]) FAM[g] = 'portatore';
for (const g of [33, 45, 132, 157, 136]) FAM[g] = 'tiro-in-volo'; for (const g of [36, 44, 134]) FAM[g] = 'aereo'; for (const g of [32, 130, 155, 184]) FAM[g] = 'linea-passaggio'; for (const g of [35, 133, 135]) FAM[g] = 'rientro-copertura';
const DEF_GIS = '31:0,34:0,127:0,131:0,168:0,32:0,130:0,155:0,35:0,133:0,135:0,33:0,45:0,36:0,44:0,54:0';
const SPEC = (process.env.GIS || DEF_GIS).split(',').map(s => s.split(':').map(Number));
const DT_CAP = 0.3;

export function analizza(sc) {
  const F = (sc.frames || []).filter(f => f.ph === 'hl_result'); const o = { id: sc.id, gi: sc.gi, fam: sc.fam || FAM[sc.gi] || '?', ok: sc.ok, key: sc.outKey || null, meta: sc.tempo || null };
  if (sc.errore) { o.verdetto = 'non giudicata'; o.perche = sc.errore; return o; }
  if (F.length < 6) { o.verdetto = 'non giudicata'; o.perche = `solo ${F.length} fotogrammi di esito`; return o; }
  let t = 0; const T = F.map((f, i) => { if (i) t += Math.min(DT_CAP, Math.max(0, (f.t - F[i - 1].t) / 1000)); return t; });
  o.durata = +t.toFixed(2); o.n = F.length;
  let iArc = F.findIndex(f => f.arc); let iEnd = 0; if (iArc >= 0) { iEnd = iArc; while (iEnd < F.length && F[iEnd].arc) iEnd++; }
  const d = (f) => Math.hypot(f.h[0] - f.b[0], f.h[1] - f.b[1]);
  const car = []; for (let i = Math.min(iEnd, F.length - 1); i < F.length; i++) if (d(F[i]) <= 1.6) car.push(i);
  o.dxB = +(F[F.length - 1].b[0] - F[0].b[0]).toFixed(1);
  o.dxEtot = +(F[F.length - 1].h[0] - F[0].h[0]).toFixed(1); o.dzEtot = +(F[F.length - 1].h[1] - F[0].h[1]).toFixed(1);
  const W = (sc.w291 || []); const wl = W.length ? W[W.length - 1] : null;
  if (wl) { o.chi = wl.q; o.v = [wl.vx, wl.vz]; o.win = wl.win; if (typeof o.ok !== 'boolean' && wl.ok != null) o.ok = wl.ok === 1; }
  /* [verifica 198, blocco D] la regola scritta sopra («non portata» se lo vince un compagno) si legge dal vincitore dichiarato dal gioco,
     non solo dalla distanza: in gi34 il vincitore dell'esito (_w31, giro 31) a volte e' un compagno («appoggio») e il pallone si ferma a ~2 u
     dall'eroe, cosi' la sola distanza dava una volta «non portata» e una «ferma» (rosso finto, 2 volte nella verifica). Nessuna soglia cambiata. */
  if (wl && wl.win === 'altro') { o.verdetto = 'non portata'; o.dFine = +d(F[F.length - 1]).toFixed(1); return o; }
  if (car.length < 3) { o.verdetto = 'non portata'; o.dFine = +d(F[F.length - 1]).toFixed(1); return o; }
  const a = F[car[0]], b = F[car[car.length - 1]];
  const dx = b.h[0] - a.h[0], dz = b.h[1] - a.h[1], sp = Math.hypot(dx, dz);
  const gx = GLX - a.h[0], gz = 0 - a.h[1], gl = Math.hypot(gx, gz) || 1;
  o.tPiede = +(T[car[car.length - 1]] - T[car[0]]).toFixed(2); o.sp = +sp.toFixed(1); o.dxE = +dx.toFixed(1); o.dzE = +dz.toFixed(1);
  o.cosP = sp > 0.05 ? +((dx * gx + dz * gz) / (sp * gl)).toFixed(2) : null; o.x0 = +a.h[0].toFixed(1);
  if (wl && wl.rot != null) { const want = Math.atan2(gx, gz); let e = ((wl.rot - want + Math.PI * 3) % (Math.PI * 2)) - Math.PI; o.rotErr = +Math.abs(e * 180 / Math.PI).toFixed(0); }
  o.verdetto = sp < 1.0 ? 'ferma' : (o.cosP >= 0.5 ? 'avanti' : 'sbagliata');
  return o;
}

const HOOK = () => { window.__MY_FR = [];
  const loop = () => { try { const dd = window.__CPM_REC_DRAIN && window.__CPM_REC_DRAIN(); if (dd && dd.length) for (const f of dd) window.__MY_FR.push({ t: f.t, ph: f.ph, sk: f.sk, h: f.h, b: f.b, arc: f.arc, pa: f.pa }); } catch (e) {} requestAnimationFrame(loop); };
  requestAnimationFrame(loop); window.__MY_DRAIN = () => { const a = window.__MY_FR; window.__MY_FR = []; return a; }; };
const INIT = ([rossi]) => { window.__CPM_DTREAL = 1; window.__CPM_GLB = true; window.__CPM_REC = true; window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_REALWAIT = 1; window.__CPM_TIENI31ON = 1; window.__CPM_G291ON = 1; for (const r of rossi) window[r] = 1; };

async function segui(page, sc, { maxReal = 30000, flow = false } = {}) {
  const t0 = Date.now(); let tRes = 0, last = null, visto = false, stop = false;
  while (Date.now() - t0 < maxReal && !stop) {
    const fr = await page.evaluate(() => window.__MY_DRAIN());
    for (const f of fr) { if (f.ph === 'hl_result') { if (flow && visto && last && f.sk !== last.sk) { stop = true; break; } visto = true; if (last && last.ph === 'hl_result') tRes += Math.min(DT_CAP, Math.max(0, (f.t - last.t) / 1000)); sc.frames.push(f); last = f; if (tRes >= 5.5) { stop = true; break; } }
      else if (visto) { stop = true; break; } }
    if (!stop) await sleep(80);
  }
  const c = await page.evaluate(() => { const o = window.__CPM_OUTCOME || null; const mp = window.__CPM_MP ? window.__CPM_MP() : [];
    const gk = mp.map((q, i) => q && q.gk ? [q.t, i] : null).filter(Boolean);
    return { out: o ? { ok: o.ok, key: o.outKey || o.key || null, lbl: o.actionLabel || null } : null, w: (window.__CPM_G291W || []).slice(), gk, ck: (window.__CPM_STATE && window.__CPM_STATE() || {}).clock }; });
  if (c.out) { sc.ok = c.out.ok; sc.outKey = c.out.key; sc.lbl = sc.lbl || c.out.lbl; } sc.w291 = c.w.filter(w => !sc.frames.length || w.k === sc.frames[0].sk).slice(-400); sc.ck = c.ck;
  return sc;
}

async function corsa(rossi, etichetta) {
  const srv = await startServer(); const b = await launchBrowser(); const port = srv.address().port; const S = loadSituations(); const R = [];
  for (const [gi, k] of SPEC) { const id = `F-gi${gi}-k${k}`; const sc = { id, gi, k, fam: FAM[gi] || '?', frames: [], braccio: etichetta };
    const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
    try { await page.addInitScript(INIT, [rossi]); await page.addInitScript(HOOK);
      await openMatch(page, port, { name: 'G291 ' + gi + '-' + k }); await page.evaluate(() => window.__CPM_LOAD_ALL && window.__CPM_LOAD_ALL()); await sleep(500);
      await page.evaluate(([g]) => window.__CPM_FORCE_SIT(g, true), [gi]); await sleep(+(process.env.SETTLE || 2500));
      sc.lbl = S[gi] && S[gi].actions[k] && S[gi].actions[k].label; sc.titolo = S[gi] && (S[gi].title || S[gi].t || '').slice(0, 40);
      await page.evaluate(() => { window.__MY_DRAIN(); window.__CPM_G291W = []; });
      await page.evaluate(([kk]) => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(kk); }, [k]);
      await segui(page, sc);
    } catch (e) { sc.errore = String(e).slice(0, 200); }
    await ctx.close(); if (OUT) fs.appendFileSync(OUT, JSON.stringify(sc) + '\n');
    const a = analizza(sc); a.lbl = sc.lbl; R.push(a); console.log(`${etichetta} ${JSON.stringify(a)}`); }
  await b.close(); srv.close(); return R;
}

/* partite vere: salvataggio S12, autoplay seedato, una scena difensiva ogni OGNI minuti; si giudicano le scene difensive riuscite */
async function flusso(rossi, etichetta, KS) {
  const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
  const srv = await startServer(); const b = await launchBrowser(); const port = srv.address().port; const R = [];
  for (const kk of KS) { const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page); const t0 = Date.now(); let n = 0;
    try { const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' G291-' + kk;
      await page.addInitScript(INIT, [rossi]); await page.addInitScript(([s, ogni]) => { window.__CPM_DIF220_OGNI = ogni; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, +(process.env.OGNI || 6)]); await page.addInitScript(HOOK);
      await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
      await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
      try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
      await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
      try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
      await page.evaluate(() => window.__CPM_CAREER.playMatch());
      await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
      await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), kk);
      const LIM = +(process.env.MAXSEC || 480) * 1000;
      while (Date.now() - t0 < LIM) { const st = await page.evaluate(() => ({ ph: window.__CPM_PHASE && window.__CPM_PHASE(), c: ((window.__CPM_CAST219 || []).slice(-1)[0] || {}), ck: (window.__CPM_STATE && window.__CPM_STATE() || {}).clock, gk: (window.__CPM_MP ? window.__CPM_MP() : []).map((q, i) => q && q.gk ? [q.t, +(+q.x).toFixed(0)] : null).filter(Boolean) }));
        if (st.ph === 'ended' || st.ph === 'ceremony') break;
        if (/^hl_/.test(st.ph || '') && st.c.tipo === 'difesa') { const sc = { id: `V-k${kk}-s${++n}`, gi: st.c.hl, k: kk, fam: 'vera', frames: [], braccio: etichetta, tempo: { min: st.c.min, t: (st.c.min || 0) > 45 ? 2 : 1, gk: st.gk } };
          await segui(page, sc, { flow: true, maxReal: 40000 }); if (OUT) fs.appendFileSync(OUT, JSON.stringify(sc) + '\n'); const a = analizza(sc); a.lbl = sc.lbl; R.push(a); console.log(`${etichetta} ${JSON.stringify(a)}`); continue; }
        await page.evaluate(() => window.__MY_DRAIN()); await sleep(250); }
      console.log(`${etichetta} k${kk}: ${n} scene difensive in ${Math.round((Date.now() - t0) / 1000)} s`);
    } catch (e) { console.log('ERR k' + kk, String(e).slice(0, 200)); }
    await ctx.close(); }
  await b.close(); srv.close(); return R;
}

export function riassunto(R, et) { const ok = R.filter(a => a.ok === true); const por = ok.filter(a => ['avanti', 'sbagliata', 'ferma'].includes(a.verdetto));
  const c = (v) => ok.filter(a => a.verdetto === v).length; const indietro = por.filter(a => a.dxE < -1).length;
  const m = { scene: R.length, riuscite: ok.length, portate: por.length, avanti: c('avanti'), sbagliata: c('sbagliata'), ferma: c('ferma'), nonPortata: c('non portata'), nonGiudicata: R.filter(a => a.verdetto === 'non giudicata').length, versoPropriaMeta: indietro, famiglie: [...new Set(por.map(a => a.fam))].length };
  console.log(`${et} RIASSUNTO ${JSON.stringify(m)}`); return m; }

if (process.env.ANALIZZA) { const R = fs.readFileSync(process.env.ANALIZZA, 'utf8').split('\n').filter(Boolean).map(s => analizza(JSON.parse(s))); for (const a of R) console.log(JSON.stringify(a)); riassunto(R, 'file'); process.exit(0); }

const ROSSI = (process.env.ROSSO || '').split(',').filter(Boolean);
if (!GUARD) { const et = ROSSI.length ? 'rosso' : 'verde';
  const R = process.env.FLOW ? await flusso(ROSSI, et, process.env.FLOW.split(',').map(Number)) : await corsa(ROSSI, et); riassunto(R, et); process.exit(0); }

const V = riassunto(await corsa([], 'verde'), 'verde'); const Rr = riassunto(await corsa(['__CPM_NO_G291'], 'rosso'), 'rosso'); const g = [];
if (V.portate < 8) g.push(`verde: solo ${V.portate} scene col pallone al piede dell'eroe (servono almeno 8)`);
if (V.famiglie < 4) g.push(`verde: solo ${V.famiglie} famiglie (servono almeno 4)`);
if (V.avanti !== V.portate) g.push(`verde: ${V.avanti} scene su ${V.portate} verso la porta avversaria (sbagliate ${V.sbagliata}, ferme ${V.ferma})`);
if (V.nonGiudicata) g.push(`verde: ${V.nonGiudicata} scene non giudicate`);
if (Rr.portate < 8) g.push(`rosso: solo ${Rr.portate} scene portate (servono almeno 8)`);
else if (Rr.sbagliata * 2 < Rr.portate) g.push(`rosso CIECO: solo ${Rr.sbagliata} scene sbagliate su ${Rr.portate} con __CPM_NO_G291`);
console.log(`verde ${V.avanti}/${V.portate} avanti (famiglie ${V.famiglie}) · rosso ${Rr.sbagliata}/${Rr.portate} sbagliate`);
if (g.length) { console.log('❌ intercetto-291 · ' + g.join(' · ')); process.exit(1); }
console.log(`✅ intercetto-291 verde: ${V.avanti} scene su ${V.portate} verso la porta avversaria, ${V.famiglie} famiglie (rosso: ${Rr.sbagliata} su ${Rr.portate} nella direzione sbagliata)`);
