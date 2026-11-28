#!/usr/bin/env node
/* [giro 420 PO-683 — «non bisogna mai festeggiare solo la curva avversaria, e' un gesto antisportivo»]
   GUARDIANO (e sonda di misura) della DIREZIONE dell'esultanza, CORPI 3D ACCESI (__CPM_GLB=true).

   COSA MISURA. Partita di carriera vera (salvataggio sintetico della sonda 296), in casa e in trasferta; per ciascuna il
   primo e il secondo tempo (gancio solo collaudo __CPM_TEMPO420: e' la stessa espressione che fa girare lo stadio, 7.732).
   Su scene di gol forzate con l'esultanza imposta (corsa sotto la curva · corsa alla bandierina · scivolata) il gioco scrive
   il testimone `__CPM_G420W`: partenza e arrivo dell'eroe, bersaglio della corsa, dove stanno i suoi tifosi (own: +1 dietro
   la porta attaccata x+, -1 dietro la propria) e, fotogramma per fotogramma, il settore davanti alla camera.
   Una corsa e' «sotto la curva avversaria» se i tifosi dell'eroe stanno dietro la propria porta (own -1), l'esultanza finisce
   a meno di 20 u dalla linea di fondo della curva altrui e la corsa non lo ha portato via di almeno VIA_MIN (5) u.
   Il settore davanti alla camera si STAMPA (misura per il PO), non si giudica: la camera guarda l'eroe, non sceglie il settore.

   TESTI. Scansione statica dei frammenti src/*.jsx: nessun testo di esultanza «verso/sotto/davanti alla curva» senza dire
   di chi, nessun riferimento festoso alla panchina avversaria. Il rosso dei testi e' la stessa scansione sulla base
   (git show <base>:src/..., CPM_BASE, default 49769faf = la base del giro 420; giro 442): deve trovare i testi di prima.

   VERDE: almeno 4 corse giudicate per lato (casa/trasferta), di cui almeno 2 con i tifosi dietro la PROPRIA porta (i casi
   del difetto), zero corse sotto la curva avversaria, zero pageerror, zero testi colpevoli.
   ROSSO `__CPM_NO_G420`: le corse sotto la curva avversaria devono ricomparire (almeno 2). «Non giudicato» = rosso.
   Uso: node esultanza-420.mjs · CPM_BRACCI=verde|rosso · CPM_FOTO=1 (foto in docs/collaudo-po/420-*.png) */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { apriLotteria296 } from './sonda-296.mjs';

const QUI = path.dirname(fileURLToPath(import.meta.url)), RADICE = path.resolve(QUI, '..', '..');
const BRACCI = (process.env.CPM_BRACCI || 'verde,rosso').split(',');
const FOTO = process.env.CPM_FOTO === '1';
const PICKS = ['run_to_crowd', 'run_wide', 'knee_slide'];
const N_MIN = 4, N_DIF = 2, VIA_MIN = 5;

/* ---------- testi ---------- */
const COLPEVOLI = [
  /(verso|sotto|davanti al)l?a curva(?! dei (suoi|propri|nostri))[^"]{0,80}(esult|bracci|festa|lo stadio)/i,
  /panchina avversaria molto meno/i,
  /sotto la curva:? i compagni/i,
];
function scansiona(leggi) {
  const out = [];
  for (const f of fs.readdirSync(path.join(RADICE, 'src')).filter(x => x.endsWith('.jsx'))) {
    const t = leggi(f); if (!t) continue;
    t.split('\n').forEach((r, i) => { for (const re of COLPEVOLI) { const m = r.match(re); if (m) out.push(`${f}:${i + 1} «${m[0].slice(0, 90)}»`); } });
  }
  return out;
}
const testiOra = scansiona(f => fs.readFileSync(path.join(RADICE, 'src', f), 'utf8'));
/* [giro 442] la base del rosso dei testi e' FISSA: 49769faf, il genitore del commit del giro 420 (fb3c71f). Con `origin/main` il rosso e'
   diventato rosso da solo appena la 7.999.219 ha portato i testi nuovi su main (treno 46082124679: «trova i testi di prima (0: )»).
   Se il commit non c'e' (clone corto) si leggono le due righe di allora da fixtures/testi-esultanza-420-49769faf.txt. */
const BASE = process.env.CPM_BASE || '49769faf';
let testiBase = scansiona(f => { try { return execSync(`git show ${BASE}:src/${f}`, { cwd: RADICE, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64e6 }); } catch (e) { return ''; } });
if (!testiBase.length && !process.env.CPM_BASE) { const fx = fs.readFileSync(path.join(QUI, 'fixtures', 'testi-esultanza-420-49769faf.txt'), 'utf8'); testiBase = scansiona(f => f === '15-live-match.jsx' ? fx : ''); }

/* ---------- 3D ---------- */
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();

async function lato(rosso, trasferta) {
  const pg = await apriLotteria296(b, port, { trasferta, rosso: false, senzaForza: true, nome: trasferta ? 'Esulta Fuori' : 'Esulta Casa', viewport: { width: 412, height: 600 } });
  const errs = pg.__errs;
  await pg.evaluate(r => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_REC = true; window.__CPM_G420W = []; if (r) window.__CPM_NO_G420 = 1; }, rosso);
  await pg.evaluate(() => { try { window.__CPM_LOAD_ALL && window.__CPM_LOAD_ALL(); } catch (e) {} }); await sleep(800);
  await pg.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  const gis = await pg.evaluate(() => { const o = [], S = window.__CPM_SITS || []; for (let i = 0; i < S.length && o.length < 12; i++) { const s = S[i]; if (s && s.actions && s.actions[0] && s.actions[0].rew === 'goal' && !s.def) o.push(i); } return o; });
  await pg.evaluate(() => { const o = window.pickCelebration; window.pickCelebration = function (c, opt) { const id = window.__G420_PICK; const x = id && (window.CELEBRATIONS || []).find(y => y.id === id); return x || o(c, opt); }; });
  const righe = []; let k = 0;
  for (const tempo of [1, 2]) {
    await pg.evaluate(t => { window.__CPM_TEMPO420 = t; }, tempo); await sleep(300);
    for (let j = 0; j < 3 && k < gis.length; j++, k++) {
      const gi = gis[k], pk = PICKS[(k + (trasferta ? 1 : 0)) % PICKS.length];
      const n0 = await pg.evaluate(() => window.__CPM_G420W.length);
      await pg.evaluate(([g, p]) => { window.__G420_PICK = p; window.__CPM_CELEB = null; window.__CPM_CELDONE84 = 0; window.__CPM_FORCED_MODE = true; window.__CPM_FORCE_SIT(g, true); }, [gi, pk]);
      await sleep(700);
      await pg.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; try { window.__CPM_RESOLVE(0); } catch (e) {} });
      await pg.waitForFunction(() => window.__CPM_CELDONE84 === 1, null, { timeout: 120000 }).catch(() => {});
      if (FOTO && j === 0) await pg.screenshot({ path: path.join(RADICE, 'docs', 'collaudo-po', `420-${rosso ? 'prima' : 'dopo'}-${trasferta ? 'trasferta' : 'casa'}-t${tempo}.png`) });
      await sleep(400);
      const W = await pg.evaluate(n => window.__CPM_G420W.slice(n), n0);
      const mis = await pg.evaluate(() => ({ mir: window.__CPM_MIR732 || null }));
      for (const e of W) righe.push({ lato: trasferta ? 'trasferta' : 'casa', tempo, gi, voluta: pk, ...e, mir: mis.mir });
    }
  }
  await pg.close();
  return { righe, errs };
}

function giudica(r) {
  const dx = (r.x1 ?? r.x0) - r.x0, own = r.own || 1;
  /* il gol si segna a 5-7 u dalla linea di fondo: l'eroe e' GIA' sotto la curva che sta dietro quella porta. Se quella curva non e'
     dei suoi tifosi (own < 0), l'esultanza e' «sotto la curva avversaria» finche' la corsa non lo porta via di almeno VIA_MIN u
     (misurato nel rosso: la corsa resta fra -2,2 e +4,4 u, cioe' resta li') e finisce entro 20 u da quella linea di fondo. */
  const x1 = r.x1 ?? r.x0, via = dx * own; /* u percorse verso i propri tifosi (positivo = si allontana dalla curva altrui) */
  const vicina = (-own) * x1 > 0 && (48.6 - Math.abs(x1)) < 20;
  return { dx: +dx.toFixed(1), avversaria: own < 0 && vicina && via < VIA_MIN, corsa: Math.hypot(dx, (r.z1 ?? r.z0) - r.z0) > 2 };
}

const esiti = {};
for (const braccio of BRACCI) {
  const rosso = braccio === 'rosso';
  const tutte = [], errs = [];
  for (const trasferta of [false, true]) { const r = await lato(rosso, trasferta); tutte.push(...r.righe); errs.push(...r.errs); }
  console.log(`\n=== braccio ${braccio} ===`);
  for (const r of tutte) { const g = giudica(r); Object.assign(r, g);
    console.log(`${r.lato.padEnd(9)} t${r.tempo} gi${r.gi} ${String(r.pk).padEnd(12)} tifosi ${r.own > 0 ? 'dietro la porta attaccata' : 'dietro la propria porta '} · da (${r.x0},${r.z0}) a (${r.x1},${r.z1}) dx ${g.dx} · ${g.avversaria ? 'SOTTO LA CURVA AVVERSARIA' : 'ok'} · camera ${JSON.stringify(r.cam)} (${r.n} fot.) · stadio ${JSON.stringify(r.mir)}`); }
  const corse = tutte.filter(r => r.corsa && r.n >= 6);
  const perLato = l => corse.filter(r => r.lato === l);
  const dif = corse.filter(r => r.own < 0);
  const avv = corse.filter(r => r.avversaria);
  esiti[braccio] = { corse: corse.length, casa: perLato('casa').length, trasferta: perLato('trasferta').length, dif: dif.length, avv: avv.length, errs: errs.length,
    cam: corse.reduce((a, r) => { for (const k in r.cam) a[k] = (a[k] || 0) + r.cam[k]; return a; }, {}) };
  console.log(`riepilogo ${braccio}: ${JSON.stringify(esiti[braccio])}${errs.length ? ' errori: ' + errs.slice(0, 2).join(' | ') : ''}`);
}
await b.close(); srv.close();

const err = []; const ok = (c, m) => { if (!c) err.push(m); console.log((c ? 'ok   ' : 'NO   ') + m); };
console.log('');
ok(testiOra.length === 0, `testi: nessuna esultanza verso la curva altrui o la panchina avversaria (${testiOra.length}${testiOra.length ? ': ' + testiOra.slice(0, 3).join(' · ') : ''})`);
ok(testiBase.length >= 2, `rosso dei testi: sulla base ${BASE} la scansione trova i testi di prima (${testiBase.length}: ${testiBase.slice(0, 3).join(' · ')})`);
if (esiti.verde) { const v = esiti.verde;
  ok(v.casa >= N_MIN && v.trasferta >= N_MIN, `verde: corse giudicate in casa ${v.casa} e in trasferta ${v.trasferta} (>= ${N_MIN} ciascuna)`);
  ok(v.dif >= N_DIF, `verde: corse coi tifosi dietro la propria porta ${v.dif} (>= ${N_DIF}, i casi del difetto)`);
  ok(v.avv === 0, `verde: corse sotto la curva avversaria ${v.avv} (= 0)`);
  ok(v.errs === 0, `verde: errori di pagina ${v.errs}`); }
if (esiti.rosso) { const r = esiti.rosso;
  ok(r.dif >= N_DIF, `rosso: corse giudicate coi tifosi dietro la propria porta ${r.dif} (>= ${N_DIF})`);
  ok(r.avv >= 2, `rosso __CPM_NO_G420: le corse sotto la curva avversaria ricompaiono (${r.avv} >= 2)`); }
const bracci = BRACCI.join('+');
if (err.length) { console.log(`\n❌ esultanza-420 ROSSO (bracci ${bracci}, ${err.length}): ${err.join(' | ')}`); process.exit(1); }
console.log(`\n✅ esultanza-420 verde (bracci ${bracci}): l'esultanza non va mai sotto la curva avversaria, in casa e in trasferta, nei due tempi; i testi parlano dei propri tifosi; il rosso si vede`);
process.exit(0);
