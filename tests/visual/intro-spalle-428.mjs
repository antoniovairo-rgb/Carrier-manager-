#!/usr/bin/env node
/* [giro 428 · PO-691 «nel video intro l'eroe non ha le spalle larghe e la corporatura uniforme, correggi subito e' il biglietto da visita!»]
   GUARDIANO NON-gate, CORPI ACCESI (__CPM_GLB=true), sul video intro vero (evento cpm-replay-intro, lo stesso del menu).
   Misura l'eroe (e il portiere) con __misura146 (spalle-146-misura.mjs) in MOLTI momenti lungo TUTTE le battute del video (un campione
   ogni ~350 ms di orologio reale, dall'aggancio del corpo alla chiusura), piu' i segmenti del corpo per la corporatura:
     · spalle/anche alle articolazioni (Sj/Aj) dentro la fascia della regola unica [2,34 · 2,62] (giro 146) in OGNI campione;
     · corporatura: scala del mondo del corpo dell'eroe x/y e z/y uguali al girth dell'eroe in partita (_heroAppr/_aspetto240 → cgCorporatura),
       e la stessa per tutto il video (nessun campione con proporzioni diverse dagli altri: omero, avambraccio, coscia, gamba, busto / anche alle
       articolazioni (il bacino e' rigido; la statura cambia con la posa) con spread max/min <= 1,03);
     · la regola delle spalle e' passata davvero sul corpo (testimone __CPM_N146 cresce durante il video).
   Due ambienti, perche' il difetto stava li': SITO (pagina normale) e APP (come l'app Android/TWA e la build store, che non scrivono
   __CPM_INTRO_CG23/__CPM_INTRO_GLB: e' li' che la regola delle spalle NON girava, il permesso stava dietro quel flag). Il braccio APP
   tiene vuoti i due flag; __CPM_STORE_BUILD vero non si puo' usare, spegne il banco di prova e il testimone.
   Due formati: telefono 390x844 e PC 1920x1080 (CPM_FORMATI=390x844,1920x1080).
   Bracci: VERDE (sito + app) · ROSSO window.__CPM_NO_G428 (app, = intro di prima) → deve CADERE. «Non giudicato» (copertura sotto 20 campioni
   eroe o battute coperte < 5) = rosso. Il verde e il rosso si stampano per ultimi.
   CPM_FOTO=prima|dopo salva le foto in docs/collaudo-po/428-<fase>-<formato>-<battuta>.png (prima = braccio rosso app, dopo = verde app).
   CPM_SOLO=verde|rosso gira un braccio solo (misura; il guardiano li vuole entrambi).
   Uso: cd tests/visual && node intro-spalle-428.mjs */
import fs from 'node:fs';
import path from 'node:path';
if (!process.env.CPM_CHROME && fs.existsSync('/opt/pw-browsers/chromium')) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const { ROOT, startServer, launchBrowser, installCdnRoutes, sleep } = await import('./lib/harness.mjs');
const { INIETTA146 } = await import('./spalle-146-misura.mjs');
const FORMATI = (process.env.CPM_FORMATI || '390x844,1920x1080').split(',').map(s => s.split('x').map(Number));
const FOTO = process.env.CPM_FOTO || '', SOLO = process.env.CPM_SOLO || '';
const DIR = path.join(ROOT, 'docs', 'collaudo-po'); if (FOTO) fs.mkdirSync(DIR, { recursive: true });
/* la fascia della regola unica (_SPALLE146) con la SUA tolleranza: _spalle146 si ferma entro 0,002·Aj dal bordo */
const SJAJ = [2.34 - 0.002, 2.62 + 0.002], SPREAD = 1.03, GIRTH_TOL = 0.01, MIN_EROE = 20, MIN_BATTUTE = 5;
/* corporatura dell'eroe in partita, stessa formula di src/12 (_heroAppr, avatarId) — il guardiano la ricalcola per confrontarla */
const AVATAR = 0;
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();

const SEG = `window.__seg428 = (root) => { try { const T = THREE; root.updateMatrixWorld(true); const o = {}; root.traverse(b => { if (b.isBone && !o[b.name]) o[b.name] = b; });
  const W = n => o[n] ? o[n].getWorldPosition(new T.Vector3()) : null; const d = (a, b) => { const p = W(a), q = W(b); return p && q ? p.distanceTo(q) : null; };
  const m = (a, b) => (a == null || b == null) ? null : (a + b) / 2;
  let vis = null; root.traverse(x => { if (!vis && x.isSkinnedMesh) vis = x; }); const ws = new T.Vector3(); (vis || root).matrixWorld.decompose(new T.Vector3(), new T.Quaternion(), ws);
  return { coscia: m(d('thigh_l', 'calf_l'), d('thigh_r', 'calf_r')), gamba: m(d('calf_l', 'foot_l'), d('calf_r', 'foot_r')), busto: d('pelvis', 'neck_01'), sx: +(ws.x / ws.y).toFixed(4), sz: +(ws.z / ws.y).toFixed(4) }; } catch (e) { return { errore: String(e.message || e) }; } };`;

async function giro(vw, vh, app, rosso) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: 1 }); await installCdnRoutes(ctx); const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(INIETTA146); await page.addInitScript(SEG);
  await page.addInitScript(([app, rosso]) => { window.__CPM_GLB = true;
    /* APP: la build store/TWA non scrive __CPM_INTRO_CG23 ne' __CPM_INTRO_GLB (src/19). __CPM_STORE_BUILD vero spegnerebbe anche il banco (_CPM_TEST)
       e il testimone: si riproduce l'unica differenza che conta per l'intro, i due flag che restano vuoti. */
    if (app) for (const k of ['__CPM_INTRO_CG23', '__CPM_INTRO_GLB']) Object.defineProperty(window, k, { get() { return undefined; }, set() {}, configurable: true }); if (rosso) window.__CPM_NO_G428 = 1; window.__CPM_N146 = [0, 0];
    try { localStorage.setItem('cpm-intro-seen', '1'); } catch (e) {} }, [app, rosso]);
  const S = []; let n146 = null, foto = 0;
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1000);
    await page.evaluate(() => { window.__CPM_INTRO115 = {}; window.__CPM_INTRO118 = {}; window.dispatchEvent(new CustomEvent('cpm-replay-intro')); });
    await page.waitForFunction(() => window.__CPM_INTRO118 && window.__CPM_INTRO118.av && window.__CPM_INTRO118.av.hero, null, { timeout: 120000 });
    await page.evaluate(() => { window.__CPM_N146 = [0, 0]; });
    const fotoB = new Set();
    for (let k = 0; k < 80; k++) { await sleep(350);
      const r = await page.evaluate(() => { const A = window.__CPM_INTRO118 && window.__CPM_INTRO118.av, I = window.__CPM_INTRO115 || {}; if (!A || I.chiusa) return null;
        return { el: I.el, beat: I.beat, eroe: { ...window.__misura146(A.hero), ...window.__seg428(A.hero) }, gk: window.__misura146(A.gk) }; });
      if (!r) break; S.push(r);
      if (FOTO && [1, 4, 5].includes(r.beat) && !fotoB.has(r.beat)) { fotoB.add(r.beat); await page.screenshot({ path: path.join(DIR, `428-${FOTO}-${vw < 800 ? 'telefono' : 'pc'}-battuta${r.beat}.png`) }).catch(() => {}); foto++; }
    }
    n146 = await page.evaluate(() => window.__CPM_N146);
  } catch (e) { S.push({ errore: String(e.message || e).slice(0, 140) }); }
  await ctx.close();
  return { S, n146, errs };
}

function giudica(R, nome) {
  const ko = [], E = R.S.filter(x => x.eroe && !x.eroe.errore && x.eroe.SjAj != null), r3 = x => x == null ? null : +(+x).toFixed(3);
  R.S.filter(x => x.errore).forEach(x => ko.push('non giudicato: ' + x.errore));
  const battute = new Set(E.map(x => x.beat));
  if (E.length < MIN_EROE || battute.size < MIN_BATTUTE) ko.push(`non giudicato: ${E.length}/${MIN_EROE} campioni eroe, ${battute.size}/${MIN_BATTUTE} battute`);
  const fuori = E.filter(x => !(x.eroe.SjAj >= SJAJ[0] && x.eroe.SjAj <= SJAJ[1]));
  if (fuori.length) ko.push(`eroe: spalle/anche fuori da [${SJAJ}] su ${fuori.length}/${E.length} campioni (battute ${[...new Set(fuori.map(x => x.beat))]}; ${fuori.slice(0, 4).map(x => x.eroe.SjAj).join(' ')})`);
  /* portiere: giudicato PRIMA del tuffo (battute 0-2). Nel tuffo (battute 3-6, corpo steso) la regola 146 non tiene la fascia: preesistente,
     misurato anche nel sito prima del giro 428 (17/56 campioni, minimo 1,21), dichiarato nel rapporto e lasciato fuori ambito. */
  const G = R.S.filter(x => x.gk && x.gk.SjAj != null), G0 = G.filter(x => x.beat <= 2), gf = G.filter(x => !(x.gk.SjAj >= SJAJ[0] && x.gk.SjAj <= SJAJ[1])), gf0 = gf.filter(x => x.beat <= 2);
  if (G0.length < 8) ko.push(`non giudicato: portiere prima del tuffo ${G0.length}/8 campioni`);
  if (gf0.length) ko.push(`portiere (prima del tuffo): spalle/anche fuori da [${SJAJ}] su ${gf0.length}/${G0.length} campioni`);
  const girth = 0.97 + ((AVATAR * 131) % 100) / 100 * 0.10, gOk = Math.max(0.90, Math.min(1.08, girth));
  const gB = E.filter(x => !(Math.abs(x.eroe.sx - gOk) <= GIRTH_TOL && Math.abs(x.eroe.sz - gOk) <= GIRTH_TOL));
  if (gB.length) ko.push(`corporatura: scala x/y ${E[0] && E[0].eroe.sx}, z/y ${E[0] && E[0].eroe.sz} contro il girth dell'eroe in partita ${gOk.toFixed(3)} su ${gB.length}/${E.length} campioni`);
  const spread = {}; for (const k of ['ua', 'fa', 'coscia', 'gamba', 'busto']) { const v = E.map(x => x.eroe[k] / x.eroe.Aj).filter(Number.isFinite); if (v.length) spread[k + 'Aj'] = r3(Math.max(...v) / Math.min(...v)); else ko.push('non giudicato: segmento ' + k); }
  for (const [k, v] of Object.entries(spread)) if (!(v <= SPREAD)) ko.push(`corporatura non uniforme: ${k} max/min ${v} > ${SPREAD}`);
  if (!R.n146 || !(R.n146[0] + R.n146[1] > E.length)) ko.push(`regola delle spalle non passata sul corpo (__CPM_N146 ${JSON.stringify(R.n146)})`);
  if (R.errs.length) ko.push('errori di pagina: ' + R.errs.slice(0, 2).join(' | '));
  const med = a => { a = a.filter(Number.isFinite).sort((p, q) => p - q); return a.length ? a[Math.floor(a.length / 2)] : null; };
  const rias = { campioni: E.length, battute: [...battute].sort(), SjAj: { min: r3(Math.min(...E.map(x => x.eroe.SjAj))), med: r3(med(E.map(x => x.eroe.SjAj))), max: r3(Math.max(...E.map(x => x.eroe.SjAj))) },
    SjH: r3(med(E.map(x => x.eroe.SjH))), uaH: r3(med(E.map(x => x.eroe.uaH))), faH: r3(med(E.map(x => x.eroe.faH))), uaAj: r3(med(E.map(x => x.eroe.ua / x.eroe.Aj))), cosciaAj: r3(med(E.map(x => x.eroe.coscia / x.eroe.Aj))), gambaAj: r3(med(E.map(x => x.eroe.gamba / x.eroe.Aj))), bustoAj: r3(med(E.map(x => x.eroe.busto / x.eroe.Aj))),
    scala: E[0] ? [E[0].eroe.sx, E[0].eroe.sz] : null, spread, gkSjAj: G.length ? r3(med(G.map(x => x.gk.SjAj))) : null, gkMin: G.length ? r3(Math.min(...G.map(x => x.gk.SjAj))) : null, gkFuoriBattute: [...new Set(gf.map(x => x.beat))], n146: R.n146 };
  return { nome, rias, ko };
}

const OUT = [];
for (const [vw, vh] of FORMATI) {
  if (SOLO !== 'rosso') { for (const app of [false, true]) { const f0 = process.env.CPM_FOTO; if (!app && FOTO) delete process.env.CPM_FOTO;
      OUT.push({ rosso: false, ...giudica(await giro(vw, vh, app, false), `VERDE ${app ? 'app' : 'sito'} ${vw}x${vh}`) }); if (f0) process.env.CPM_FOTO = f0; } }
  if (SOLO !== 'verde') OUT.push({ rosso: true, ...giudica(await giro(vw, vh, true, true), `ROSSO __CPM_NO_G428 app ${vw}x${vh}`) });
}
await browser.close(); srv.close();
let ok = true; const motivi = [];
for (const o of OUT) { const cade = o.ko.length > 0 && !o.ko.every(x => /^non giudicato/.test(x));
  if (!o.rosso && o.ko.length) { ok = false; motivi.push(o.nome + ' con rilievi'); } if (o.rosso && !cade) { ok = false; motivi.push(o.nome + ' non cade'); } }
for (const o of OUT.filter(x => !x.rosso)) console.log(o.nome + ' ' + JSON.stringify(o.rias) + (o.ko.length ? ' RILIEVI: ' + o.ko.join(' · ') : ''));
for (const o of OUT.filter(x => x.rosso)) console.log(o.nome + ' ' + JSON.stringify(o.rias) + ' RILIEVI: ' + o.ko.join(' · '));
if (!ok) { console.log('❌ intro-spalle-428 — ' + motivi.join(' · ')); process.exit(1); }
console.log('✅ intro-spalle-428 verde' + (SOLO ? ` (solo ${SOLO})` : ' (e il rosso __CPM_NO_G428 cade)'));
