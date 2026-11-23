#!/usr/bin/env node
/* [giro 343, PO-587 + PO-611 — rosso __CPM_NO_G343] GUARDIANO «L'INTERVENTO PARTE AL CONTATTO · LA PUNIZIONE SI BATTE FUORI AREA».

   PO-587 — «In alcuni tiri i difensori scivolano ed intervengono prima dell'effettivo tiro, non è sincronizzato».
     Causa misurata: la reazione di reparto (7.519, canale _mateFx) e il muro (giro 41) si armavano quando l'arco si ARMA; il pallone
     parte dopo il caricamento del gesto. Ora la richiesta aspetta il fotogramma del contatto (src/12, _dif343 / _pend343).
   PO-611 — «punizione in area!» (foto docs/collaudo-po/200-punizione-in-area.webp).
     Causa misurata: l'area disegnata (avanzamento >= 82,1 · |y-50| <= 29,65) e' piu' grande della regola del rigore del motore
     (>= 84 · <= 20): nella cornice il fallo era punizione; e la scena nasceva nel punto del fallo ±2 di profondita'. Ora il punto
     esce dall'area (src/14 fuoriArea343, in fermoSet) e la scena di punizione nasce sul punto esatto (src/04 _p6Costruisci).

   (A) node — banco del motore (24 configurazioni S12 x CPM_SEMI, default 8 = 192 partite): ogni fermo «foul» e ogni occasione
       «punizione» dell'eroe si misura contro l'area disegnata.
       VERDE: 0 punizioni in area, 0 occasioni in area. ROSSO: almeno 20 punizioni in area. Cieco sotto 500 punizioni.
   (B) browser, GLB ACCESO — punizioni: da 4 punti di fallo nella cornice (piu' 1 di controllo fuori) si costruisce la scena VERA
       (scenaDalMotorePiazzato) e la si apre nel punto piu' avanzato della sua zona di partenza; testimone __CPM_PUN343 (src/12):
       pallone nel mondo, in area si/no, uomini di barriera e distanza del piu' vicino misurata sui corpi.
       VERDE: 0 in area, barriera di almeno 3 uomini mai sotto 6 u dal pallone (mediana di 6 s); la distanza esatta si dichiara e
       non si giudica. ROSSO: almeno 3 su 4 in area.
   (C) browser, GLB ACCESO — tiri, colpi di testa e cross falliti (anche «murato»): testimone __CPM_DIF343 (src/12), tempi di SCENA:
       int = l'intervento parte · cont = contatto (l'arco passa da <=0 a >0) · g = il corpo GLB chiede la clip.
       VERDE: scarto int-cont >= 0 su tutte, g-cont >= 0 dove c'e'. ROSSO: almeno l'80% sotto zero, mediana <= -0,2 s.
       Almeno 6 interventi giudicati e almeno 4 con la clip GLB; un intervento senza contatto o mai partito = NON GIUDICATO = rosso.
   Uso: node difesa-343.mjs (verde poi rosso) · CPM_SOLO=verde|rosso · CPM_SEMI=8 · CPM_FOTO=1 (foto in docs/sviluppo/giro343). */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';

const SEMI = +(process.env.CPM_SEMI || 8), FOTO = !!process.env.CPM_FOTO;
const DIR_FOTO = path.join(ROOT, 'docs', 'sviluppo', 'giro343');
const AREA = { adv: 82.1 - 0.05, hy: 20.16 / 0.68 };/* la linea e' area: 0,05 di tolleranza sull'arrotondamento */
const inArea = (adv, y) => adv >= AREA.adv && Math.abs(y - 50) <= AREA.hy;

/* ---------- (A) banco del motore ---------- */
const s14 = fs.readFileSync(path.join(ROOT, 'src', '14-motore-possesso.jsx'), 'utf8');
const code = s14.slice(s14.indexOf('/* CMAV-SRC-HEADER-END */') + '/* CMAV-SRC-HEADER-END */'.length);
const carica = (W) => Function('decideExecution', 'window', code + '\nreturn {crea:creaMotorePossesso};')(undefined, W);
const CFG = JSON.parse(fs.readFileSync(new URL('./fixtures/cfg-202-s12.json', import.meta.url)));
function banco(W) {
  const { crea } = carica(W); const R = { partite: 0, pun: 0, inArea: 0, occ: 0, occIn: 0, max: 0, es: [], gol: 0, rig: 0 };
  for (let s = 0; s < CFG.length * SEMI; s++) {
    const c0 = CFG[s % CFG.length];
    const M = crea(Object.assign({}, c0, { occasioniV2: true, brainLive: false, fin202: null, seed: (((c0.seed >>> 0) ^ ((1 + Math.floor(s / CFG.length)) * 2654435761)) >>> 0) }));
    M.chiedi.origini(true, 6, true);/* il live chiede anche la scena dei piazzati dell'eroe */
    let last = null; R.partite++;
    for (let m = 1; m <= 93; m++) {
      if (m === 46) M.chiedi.riprendi({ centro: true, lato: 'away' });
      for (let b = 0; b < 22; b++) {
        const ev = M.tick({ min: Math.min(m, 90), dt: 1 / 22, dec: true }) || [];
        const f = M._S.fermo;
        if (f && f !== last && f.kind === 'foul') { last = f; const adv = f.lato === 'home' ? f.x : 100 - f.x; R.pun++;
          if (inArea(adv, f.y)) { R.inArea++; R.max = Math.max(R.max, adv - 82.1); if (R.es.length < 3) R.es.push(`seme ${s} ${m}' ${f.lato} avanzamento ${adv.toFixed(1)} y ${f.y.toFixed(1)}`); } }
        if (!f) last = null;
        for (const e of ev) { if (e.t === 'rigore') R.rig++; if (e.t === 'occasione_eroe' && e.tipo === 'punizione') { R.occ++; if (inArea(e.x, e.y)) R.occIn++; } }
      }
    }
    const t = M.tabellino(); R.gol += (t.home.gol | 0) + (t.away.gol | 0);
  }
  return R;
}

/* ---------- (B)+(C) browser ---------- */
const PUNTI = [[83.6, 46], [83.9, 56], [82.6, 50], [83.0, 38], [79, 50]];/* gli ultimi: controllo fuori area */
const SCENE = process.env.CPM_SOLO_B ? [] : [[65, 'blocked'], [67, null], [70, null], [93, null], [103, 'blocked'], [171, null], [83, null], [100, null], [115, null], [143, null]];
async function braccio(b, port, rosso) {
  /* due pagine: (B) giudica POSIZIONI, quindi col teatro acceso (__CPM_PRESENT + __CPM_CINE: sul banco lo stacco di scena e' spento e
     i corpi sarebbero in viaggio dalla scena precedente, vedi barriera-73); (C) giudica TEMPI sul banco ordinario. */
  const apri = async (teatro) => { const pg = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(pg);
    await pg.addInitScript(([r, t]) => { window.__CPM_GLB = true; window.__CPM_DIF343 = []; window.__CPM_PUN343 = []; if (t) { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; } if (r) window.__CPM_NO_G343 = 1; }, [rosso, teatro]);
    await openMatch(pg, port, teatro ? { skipLoadAll: true, name: 'Dif343' } : undefined); await sleep(800);/* (B) da partita vera, come barriera-73 */
    await pg.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
    return pg; };
  let page = await apri(true);
  let glb = await page.evaluate(() => !!window.__CPM_GLB && (window.__CPM_MXCLIP | 0) > 0);
  const foto = async (nome) => { if (!FOTO) return; fs.mkdirSync(DIR_FOTO, { recursive: true }); try { await page.screenshot({ path: path.join(DIR_FOTO, nome), type: 'jpeg', quality: 82, timeout: 30000 }); } catch (e) { console.log('  (foto non riuscita: ' + nome + ')'); } };
  /* (B) punizioni */
  const pun = [];
  for (let i = 0; i < PUNTI.length; i++) {
    const [x, y] = PUNTI[i];
    const st = await page.evaluate(([x, y]) => { try { const sit = scenaDalMotorePiazzato({ tipo: 'punizione', x, y, cast: {} }, { name: 'Validator', stats: { tiro: 70, tecnica: 70, passaggio: 70 }, ovr: 70 }, 7);
      if (!sit) return { err: 'scena non costruita' }; const idx = SITUATIONS.push(sit) - 1; const z = sit.startZone; window.__CPM_PUN343.length = 0;
      const pos = { x: z.x[1], y: Math.round((z.y[0] + z.y[1]) / 2 * 10) / 10 }; window.__CPM_FORCE_SIT(idx, true, pos); return { idx, pos, text: sit.text, sz: z }; } catch (e) { return { err: String(e && e.message) }; } }, [x, y]);
    if (st.err) { pun.push({ x, y, err: st.err }); continue; }
    await page.evaluate(() => { window.__CPM_FROZEN = false; });
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
    /* la scena e' in lettura (evento atteso sopra); i corpi della barriera hanno l'attesa attiva e non stanno mai fermi: la distanza
       si CAMPIONA per 6 s e si giudica la mediana, insieme al minimo e al massimo visti */
    let w = null; const dd = []; { const t0 = Date.now();
      while (Date.now() - t0 < 6000) { await sleep(300); w = await page.evaluate(() => { const W = window.__CPM_PUN343; return W.length ? { ...W[W.length - 1] } : null; }); if (w && w.muro != null && Date.now() - t0 >= 2400) dd.push(w.muro); } }
    if (w) { dd.sort((p, q) => p - q); w.med = dd.length ? dd[Math.floor(dd.length / 2)] : null; w.lo = dd.length ? dd[0] : null; w.hi = dd.length ? dd[dd.length - 1] : null; }
    pun.push({ x, y, pos: st.pos, w, ctrl: i >= 4 });
    if (i === 0) await foto(`punizione-${rosso ? 'prima' : 'dopo'}.jpg`);
    await page.evaluate(() => { SITUATIONS.pop(); });
  }
  /* (C) interventi difensivi */
  await page.close(); page = await apri(false); glb = glb && await page.evaluate(() => !!window.__CPM_GLB && (window.__CPM_MXCLIP | 0) > 0);
  const dif = []; let fotoFatta = false;
  for (const [gi, kind] of SCENE) {
    await page.evaluate(() => { window.__CPM_DIF343.length = 0; window.__CPM_FROZEN = false; });
    await forceSituation(page, gi, { settle: 900, choose: true });
    const fotoQui = FOTO && !fotoFatta && gi === 67;
    await page.evaluate(([k, fz]) => { window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_FORCE_KIND = k || undefined;
      if (fz) { const L = () => { if ((window.__CPM_DIF343 || []).some(w => w.cont != null)) { window.__CPM_FROZEN = true; return; } requestAnimationFrame(L); }; requestAnimationFrame(L); }
      window.__CPM_RESOLVE(0); }, [kind, fotoQui]);
    const t0 = Date.now(); let d = [];
    while (Date.now() - t0 < 14000) { await sleep(200); d = await page.evaluate(() => (window.__CPM_DIF343 || []).map(w => ({ ...w }))); if (d.length && d.every(w => w.cont != null && w.int != null)) break; }
    if (fotoQui) { fotoFatta = true; await sleep(400); await foto(`intervento-${rosso ? 'prima' : 'dopo'}.jpg`); await page.evaluate(() => { window.__CPM_FROZEN = false; }); await sleep(600); }
    dif.push({ gi, kind, d });
    await page.evaluate(() => { window.__CPM_FORCE_KIND = undefined; });
  }
  await page.close();
  return { glb, pun, dif };
}

const med = a => { const s = [...a].sort((p, q) => p - q); return s.length ? s[Math.floor(s.length / 2)] : null; };
function giudica(nome, A, Br) {
  const rosso = nome === 'rosso'; const motivi = [];
  console.log(`\n[${nome}] (A) motore, ${A.partite} partite: punizioni ${A.pun} · in area ${A.inArea}${A.inArea ? ' (fino a ' + A.max.toFixed(1) + ' u oltre la linea; ' + A.es.join(' · ') + ')' : ''} · occasioni «punizione» dell'eroe ${A.occ}, in area ${A.occIn} · gol ${A.gol} · rigori ${A.rig}`);
  if (A.pun < 500) motivi.push(`A cieco: solo ${A.pun} punizioni nel banco`);
  if (!rosso) { if (A.inArea > 0) motivi.push(`A: ${A.inArea} punizioni battute in area`); if (A.occIn > 0) motivi.push(`A: ${A.occIn} occasioni di punizione in area`); }
  else if (A.inArea < 20) motivi.push(`A rosso cieco: solo ${A.inArea} punizioni in area`);
  if (!Br) return motivi;
  if (!Br.glb) motivi.push('GLB spento: la misura non vale');
  /* (B) */
  const gap = Br.pun.filter(p => !p.ctrl), ctrl = Br.pun.filter(p => p.ctrl);
  for (const p of Br.pun) console.log(`[${nome}] (B) fallo a (${p.x};${p.y}) → ` + (p.err ? 'NON GIUDICATA: ' + p.err : !p.w ? 'NON GIUDICATA: testimone vuoto' : `scena aperta a (${p.pos.x};${p.pos.y}) · pallone mondo x ${p.w.x} z ${p.w.z} · ${p.w.area ? 'IN AREA (' + (p.w.x - 32.1).toFixed(1) + ' u oltre la linea)' : 'fuori area (' + (32.1 - p.w.x).toFixed(1) + ' u dalla linea)'} · barriera ${p.w.n} uomini, il piu' vicino a ${p.w.med} u dal pallone (mediana; ${p.w.lo}-${p.w.hi})`) + (p.ctrl ? '  [controllo]' : ''));
  const ng = Br.pun.filter(p => p.err || !p.w).length; if (ng) motivi.push(`B: ${ng} punizioni non giudicate`);
  const inA = gap.filter(p => p.w && p.w.area).length;
  if (ctrl.some(p => p.w && p.w.area)) motivi.push('B: il punto di controllo fuori area risulta in area (strumento rotto)');
  if (!rosso) { if (inA > 0) motivi.push(`B: ${inA} scene di punizione col pallone in area`);
    /* la barriera: almeno 3 uomini e mai sotto 6 u dal pallone (il minimo che il codice stesso si da': src/12 «clamp(palla+9, palla+6, 93)»).
       La distanza esatta NON si giudica qui: si dichiara (vedi rapporto del giro 343, dubbio 2) */
    const bar = Br.pun.filter(p => p.w && !(p.w.n >= 3 && p.w.med != null && p.w.med >= 6)); if (bar.length) motivi.push(`B: barriera assente o addosso al pallone in ${bar.length} scene (${bar.map(p => (p.w.n | 0) + ' uomini a ' + p.w.med + ' u').join(', ')})`); }
  else if (inA < 3) motivi.push(`B rosso cieco: solo ${inA} scene in area su ${gap.length}`);
  /* (C) */
  const tutte = []; let senza = 0;
  for (const s of Br.dif) { if (!s.d.length) { senza++; console.log(`[${nome}] (C) gi${s.gi}${s.kind ? '/' + s.kind : ''}: nessun intervento (difensore oltre 9 u)`); continue; }
    console.log(`[${nome}] (C) gi${s.gi}${s.kind ? '/' + s.kind : ''}: ` + s.d.map(w => `${w.chi}/${w.t} intervento ${w.int} contatto ${w.cont} clip GLB ${w.g} → scarto ${w.int != null && w.cont != null ? (w.int - w.cont).toFixed(2) + ' s' : 'NON GIUDICATO'}`).join(' | '));
    for (const w of s.d) tutte.push(w); }
  const ngC = tutte.filter(w => w.int == null || w.cont == null), ok = tutte.filter(w => w.int != null && w.cont != null);
  const sc = ok.map(w => w.int - w.cont), conG = ok.filter(w => w.g != null), scG = conG.map(w => w.g - w.cont);
  console.log(`[${nome}] (C) interventi giudicati ${ok.length} (non giudicati ${ngC.length}, scene senza intervento ${senza}) · scarto intervento-contatto: minimo ${sc.length ? Math.min(...sc).toFixed(2) : '—'} s, mediano ${sc.length ? med(sc).toFixed(2) : '—'} s · clip GLB ${conG.length}: scarto minimo ${scG.length ? Math.min(...scG).toFixed(2) : '—'} s`);
  if (ngC.length) motivi.push(`C: ${ngC.length} interventi non giudicati (mai partiti o senza contatto)`);
  if (ok.length < 6) motivi.push(`C cieco: solo ${ok.length} interventi giudicati (servono 6)`);
  if (conG.length < 4) motivi.push(`C cieco: solo ${conG.length} interventi con la clip GLB (servono 4)`);
  if (!rosso) { const neg = sc.filter(v => v < 0).length, negG = scG.filter(v => v < 0).length; if (neg) motivi.push(`C: ${neg} interventi partiti PRIMA del contatto (minimo ${Math.min(...sc).toFixed(2)} s)`); if (negG) motivi.push(`C: ${negG} clip GLB chieste prima del contatto`); }
  else if (sc.length) { const neg = sc.filter(v => v < 0).length; if (neg < 0.8 * sc.length || med(sc) > -0.2) motivi.push(`C rosso cieco: ${neg}/${sc.length} sotto zero, mediana ${med(sc).toFixed(2)} s`); }
  return motivi;
}

const bracci = process.env.CPM_SOLO ? [process.env.CPM_SOLO] : ['verde', 'rosso'];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const esito = {};
for (const nome of bracci) {
  const rosso = nome === 'rosso';
  const A = banco(rosso ? { __CPM_NO_G343: 1 } : {});
  let Br = null; try { Br = await braccio(b, port, rosso); } catch (e) { console.log(`[${nome}] browser: ${e && e.message}`); }
  const motivi = giudica(nome, A, Br); if (!Br) motivi.push('browser non giudicato');
  esito[nome] = motivi;
}
await b.close(); srv.close();
let okTutto = true;
for (const nome of bracci) { const m = esito[nome]; if (m.length) okTutto = false;
  console.log(`\nbraccio ${nome}: ${m.length ? '❌ ' + m.join(' · ') : (nome === 'rosso' ? '✅ il rosso vede i due difetti (intervento prima del contatto, punizione in area)' : '✅ intervento mai prima del contatto, nessuna punizione in area')}`); }
console.log(okTutto ? '✅ difesa-343 VERDE' + (bracci.length === 2 ? ' (e il rosso vede il difetto)' : '') : '❌ difesa-343 ROSSO');
process.exit(okTutto ? 0 : 1);
