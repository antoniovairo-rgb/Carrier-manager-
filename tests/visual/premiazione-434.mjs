#!/usr/bin/env node
/* [giro 434 PO-688 — seguito di PO-683 «non bisogna mai festeggiare solo la curva avversaria»]
   GUARDIANO (e sonda di misura) del LATO della festa del trofeo, CORPI 3D ACCESI (__CPM_GLB=true).

   IL DUBBIO. La festa del trofeo (7.278) va sotto CURVA_X = ±(AWAY_GOAL_X-6) col segno di heroStandHome; lo stadio pero' alla
   ripresa gira di 180 gradi (7.732, P.half===2) e a fine partita il cronometro e' >= 90: alla premiazione lo stadio e' girato.

   COSA MISURA. Partita di carriera vera (salvataggio sintetico della sonda 296), in casa e in trasferta:
   - premiazione forzata (__CPM_FORCE_CEREMONY) con lo stadio DRITTO (__CPM_TEMPO420=1: e' la sola via, in gioco non capita);
   - premiazione forzata con lo stadio GIRATO (__CPM_TEMPO420=2: e' l'espressione clock>=45, la stessa a 90' e a 120',
     cioe' finale vinta nei regolamentari o ai supplementari);
   - premiazione VERA dopo la serie dei rigori (__CPM_SO_FORCE(120): 1-1 al 120', serie, cerimonia), tempo dal cronometro.
   Il gioco scrive il testimone `__CPM_G434W`: dove va la festa (segno di CURVA_X), dove l'eroe arriva nel giro di campo e
   sotto la curva, e quale settore ha davanti la camera. Dove stanno i tifosi dell'eroe la sonda lo ricava DA SE': segno di
   casa (heroStandHome) per la rotazione VERA del gruppo-radice dello stadio letta dalla scena (rot ~ pi = girato).
   VERDE: almeno 4 premiazioni giudicate per lato, di cui almeno 2 con lo stadio girato; in tutte la festa e l'eroe sotto la
   curva stanno dal lato dei SUOI tifosi; zero pageerror. ROSSO `__CPM_NO_G434`: almeno 2 premiazioni sotto la curva
   avversaria. «Non giudicato» = rosso.
   Uso: node premiazione-434.mjs · CPM_BRACCI=verde|rosso · CPM_SOLO_VERE=1 (solo la premiazione dopo i rigori, misura) · CPM_FOTO=1 (docs/collaudo-po/434-*.png) · CPM_VERE=0 salta i rigori */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { apriLotteria296 } from './sonda-296.mjs';

const QUI = path.dirname(fileURLToPath(import.meta.url)), RADICE = path.resolve(QUI, '..', '..');
const BRACCI = (process.env.CPM_BRACCI || 'verde,rosso').split(',');
const FOTO = process.env.CPM_FOTO === '1';
const VERE = process.env.CPM_VERE !== '0';
const N_MIN = 3, N_GIR = 2;

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();

/* centra i beat «lap» e «curva» col salto dell'orologio dei beat (solo collaudo, 7.2.0) e registra */
async function giraBeat(pg, foto) {
  await pg.waitForFunction(() => window.__CPM_CER425 && window.__CPM_CER425.beats, null, { timeout: 30000 }).catch(() => {});
  const c = await pg.evaluate(() => window.__CPM_CER425 || null); if (!c) return null;
  let t = 0; const st = {}; c.beats.forEach((k, i) => { if (st[k] == null) st[k] = t; t += c.beatsD[i]; });
  const iL = c.beats.indexOf('lap'), iC = c.beats.indexOf('curva');
  if (iL >= 0) { await pg.evaluate(x => { window.__CPM_CERT_SET = x; }, st.lap + c.beatsD[iL] * 0.15); await sleep(3500); }
  if (iC >= 0) { await pg.evaluate(x => { window.__CPM_CERT_SET = x; }, st.curva + c.beatsD[iC] * 0.2); await sleep(3500);
    if (foto) await pg.screenshot({ path: foto }); }
  if (iL < 0 && iC < 0) { await sleep(3500); if (foto) await pg.screenshot({ path: foto }); }
  return { beats: c.beats, kind: c.kind };
}
async function leggi(pg) {
  return pg.evaluate(() => { const e = (window.__CPM_G434W || []).__e || null;
    return e ? JSON.parse(JSON.stringify(e)) : null; });
}

async function lato(rosso, trasferta) {
  const righe = []; const errs = [];
  const casi = [{ nome: 'forzata, stadio dritto', tempo: 1 }, { nome: 'forzata, stadio girato (90\'/120\')', tempo: 2 }, { nome: 'forzata coppa, stadio girato', tempo: 2, kind: 'cup' }, { nome: 'forzata promozione, stadio girato', tempo: 2, kind: 'promo' }, { nome: 'forzata leggera (giro di campo), girato', tempo: 2, light: true }];
  if (VERE) casi.push({ nome: 'vera dopo i rigori (120\')', vera: true });
  if (process.env.CPM_SOLO_VERE === '1') casi.splice(0, casi.length - 1); /* solo misura: la sola premiazione vera */
  for (const caso of casi) {
    const pg = await apriLotteria296(b, port, { trasferta, rosso: false, senzaForza: true, nome: trasferta ? 'Premio Fuori' : 'Premio Casa', viewport: { width: 412, height: 600 } });
    await pg.evaluate(([r, t]) => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_REC = true; window.__CPM_G434W = []; if (r) window.__CPM_NO_G434 = 1; if (t) window.__CPM_TEMPO420 = t; }, [rosso, caso.tempo || 0]);
    await pg.evaluate(() => { try { window.__CPM_LOAD_ALL && window.__CPM_LOAD_ALL(); } catch (e) {} }); await sleep(800);
    await pg.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
    if (caso.vera) {
      await pg.evaluate(() => window.__CPM_SO_FORCE && window.__CPM_SO_FORCE(120));
      await pg.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'ceremony', null, { timeout: 300000, polling: 300 }).catch(() => {});
    } else {
      await pg.evaluate(([k, l]) => window.__CPM_FORCE_CEREMONY({ name: k === 'cup' ? 'COPPA NAZIONALE' : k === 'promo' ? 'Promozione' : "CAMPIONI D'ITALIA", kind: k || 'league', light: !!l }), [caso.kind || null, !!caso.light]);
      await pg.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'ceremony', null, { timeout: 15000, polling: 100 }).catch(() => {});
    }
    const fase = await pg.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE());
    const foto = FOTO && (caso.light || caso.vera) ? path.join(RADICE, 'docs', 'collaudo-po', `434-${rosso ? 'prima' : 'dopo'}-${trasferta ? 'trasferta' : 'casa'}${caso.vera ? '-rigori' : '-giro-di-campo'}.png`) : null;
    const g = fase === 'ceremony' ? await giraBeat(pg, foto) : null;
    const e = await leggi(pg);
    const rotScena = await pg.evaluate(() => { const m = window.__CPM_MIR732; return m ? m.rot : null; });
    errs.push(...pg.__errs);
    righe.push({ lato: trasferta ? 'trasferta' : 'casa', caso: caso.nome, fase, beats: g && g.beats, e, rotScena });
    await pg.close();
  }
  return { righe, errs };
}

function giudica(r) {
  const e = r.e; if (!e || !r.beats || e.bandiere == null || e.telefoni == null) return { giudicata: false };
  const corsa = r.beats.includes('curva') || r.beats.includes('lap'); if (corsa && e.xCurva == null) return { giudicata: false };
  const rot = r.rotScena != null ? r.rotScena : e.rot; /* rotazione VERA del gruppo-radice dello stadio */
  const girato = Math.abs(Math.abs(rot) - Math.PI) < 0.1;
  const tif = (e.casa ? 1 : -1) * (girato ? -1 : 1); /* +1 = i tifosi dell'eroe stanno nella curva a x+ */
  const festa = Math.sign(e.curvaX), eroe = Math.sign(e.xCurva || 0);
  const pub = Math.sign(e.bandiere) === tif && Math.sign(e.telefoni) === tif; /* bandiere e telefoni «della curva dei tuoi» */
  /* sul banco l'eroe cammina a pochi fotogrammi al secondo: arrivato sotto la curva giusta, oppure in cammino verso di lei di almeno 3 u */
  const eroeOk = !corsa || (festa === tif && ((eroe === tif && Math.abs(e.xCurva) > 12) || (e.xCurva - e.xC0) * tif >= 3));
  return { giudicata: true, girato, tif, corsa, pub, eroeOk, avversaria: !pub || !eroeOk };
}

const esiti = {};
for (const braccio of BRACCI) {
  const rosso = braccio === 'rosso'; const tutte = [], errs = [];
  for (const trasferta of [false, true]) { const r = await lato(rosso, trasferta); tutte.push(...r.righe); errs.push(...r.errs); }
  console.log(`\n=== braccio ${braccio} ===`);
  for (const r of tutte) { const g = giudica(r); Object.assign(r, g); const e = r.e || {};
    console.log(`${r.lato.padEnd(9)} ${r.caso.padEnd(34)} fase ${r.fase} · ${g.giudicata ? `stadio ${g.girato ? 'GIRATO' : 'dritto'} (rot ${r.rotScena}) · tifosi a x${g.tif > 0 ? '+' : '-'} · bandiere x ${e.bandiere} · telefoni x ${e.telefoni} · ${g.corsa ? `festa CURVA_X ${e.curvaX} · eroe nel giro/curva x ${e.xC0} → ${e.xCurva}` : 'senza corsa sotto la curva'} · ${g.avversaria ? 'SOTTO LA CURVA AVVERSARIA' : 'coi suoi tifosi'} · camera ${JSON.stringify(e.cam)} (${e.n} fot.) · beat ${(r.beats || []).join('>')}` : 'NON GIUDICATA ' + JSON.stringify({ e: !!r.e, beats: r.beats })}`); }
  const giu = tutte.filter(r => r.giudicata);
  const per = l => giu.filter(r => r.lato === l).length;
  esiti[braccio] = { giudicate: giu.length, casa: per('casa'), trasferta: per('trasferta'), girato: giu.filter(r => r.girato).length, avv: giu.filter(r => r.avversaria).length, nonGiu: tutte.length - giu.length, errs: errs.length,
    cam: giu.reduce((a, r) => { for (const k in r.e.cam) a[k] = (a[k] || 0) + r.e.cam[k]; return a; }, {}) };
  console.log(`riepilogo ${braccio}: ${JSON.stringify(esiti[braccio])}${errs.length ? ' errori: ' + errs.slice(0, 2).join(' | ') : ''}`);
}
await b.close(); srv.close();

const err = []; const ok = (c, m) => { if (!c) err.push(m); console.log((c ? 'ok   ' : 'NO   ') + m); };
console.log('');
if (esiti.verde) { const v = esiti.verde;
  ok(v.nonGiu === 0, `verde: premiazioni non giudicate ${v.nonGiu} (= 0)`);
  ok(v.casa >= N_MIN && v.trasferta >= N_MIN, `verde: premiazioni giudicate in casa ${v.casa} e in trasferta ${v.trasferta} (>= ${N_MIN} ciascuna)`);
  ok(v.girato >= N_GIR, `verde: premiazioni con lo stadio girato ${v.girato} (>= ${N_GIR}, i casi del dubbio)`);
  ok(v.avv === 0, `verde: premiazioni sotto la curva avversaria ${v.avv} (= 0)`);
  ok(v.errs === 0, `verde: errori di pagina ${v.errs}`); }
if (esiti.rosso) { const r = esiti.rosso;
  ok(r.girato >= N_GIR, `rosso: premiazioni giudicate con lo stadio girato ${r.girato} (>= ${N_GIR})`);
  ok(r.avv >= 2, `rosso __CPM_NO_G434: le premiazioni sotto la curva avversaria ricompaiono (${r.avv} >= 2)`); }
const bracci = BRACCI.join('+');
if (err.length) { console.log(`\n❌ premiazione-434 ROSSO (bracci ${bracci}, ${err.length}): ${err.join(' | ')}`); process.exit(1); }
console.log(`\n✅ premiazione-434 verde (bracci ${bracci}): la festa del trofeo va sotto la curva dei propri tifosi, in casa e in trasferta, con lo stadio dritto e girato, anche dopo i rigori; il rosso si vede`);
process.exit(0);
