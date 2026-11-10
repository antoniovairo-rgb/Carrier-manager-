#!/usr/bin/env node
/* [giro 152 PO-355 — «occhio ai festeggiamenti dopo un gol, a volte l'eroe vola con le braccia alzate»]
   GUARDIANO (e sonda di misura) dell'esultanza dell'eroe, CORPI 3D ACCESI (GLB-ON: sotto il CH38 parlano solo le clip).

   COSA MISURA. Il gioco scrive un testimone per fotogramma (`__CPM_G152W`, solo sotto ?cpmtest=1) mentre l'eroe esulta in
   campo (`cel`) o festeggia a fine partita (`cer`): posizione, quota, piede piu' basso sopra il prato (rispetto al piede da
   fermo misurato in partita), clip montata, suo tempo e pausa, peso del gesto e della corsa.
   Su ogni fotogramma (tempo di SCENA, mai di parete):
     · VELOCITA' dell'eroe = spostamento / dt di scena fra due fotogrammi consecutivi dello stesso contesto (oltre 40 u/s e'
       uno stacco/snap, non moto);
     · (a) SCIVOLATA: si sposta oltre V_MAX u/s con le braccia al cielo (`lift`) montate a peso > 0,5 (in pausa o no), oppure
       con la corsa (jog + scatto) sotto R_MIN di peso, cioe' senza ciclo di passi. «In volo» se la scivolata percorre di
       fila piu' di D_VOLO unita' (sotto e' la dissolvenza posa→corsa all'avvio di uno scatto, misurata 0,3-0,75u);
     · (b) SOSPESO: il piede piu' basso sta oltre F_MAX sopra il prato con la clip FERMA o mentre si sposta, per piu' di T_MAX s
       di scena di fila. Escluso il salto previsto (quota procedurale del corpo) e il saltello della clip mentre suona.
   PERCORSI: scene forzate di gol con l'esultanza imposta (tutte le voci di CELEBRATIONS, a turno), le stesse scene seguite
   da «CONTINUA» (ripresa dal centro), festa di fine partita forzata (leggera e con coppa), tenuta aperta per 16 s di scena.
   Partite vere seedate (autoplay, nomi diversi): CPM_VERE=1 o CPM_SOLO=vere — misurate nel giro 152, fuori dal default
   perche' l'autoplay chiude l'esultanza dopo pochi fotogrammi (1 esultanza su 3 partite, 5 fotogrammi) e costano 10 min.
   VERDE: zero esultanze in volo su almeno N_MIN giudicate (>= 6 fotogrammi) e zero pageerror. ROSSO `__CPM_NO_G152`: il volo
   deve ricomparire. «Non giudicato» (meno di N_MIN esultanze) = rosso. Braccio e motivo stampati per ultimi.
   Uso: node esultanza-152.mjs  ·  CPM_BRACCI=verde (corsa parziale, non vale come verdetto)  ·  CPM_MISURA=1 (solo tabella)
        CPM_SOLO=forzate|ripresa|vere|festa|coppa  ·  CPM_DUMP=<prefisso> (fotogrammi grezzi in JSON) */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

/* soglie fissate DOPO la misura (vedi docs/sviluppo/RAPPORTO-giro152.md) */
const V_MAX = 1.5;   /* u/s: la stessa soglia con cui la festa (7.999.80, _muove80) lascia la parola alla locomozione */
const R_MIN = 0.30;  /* peso della corsa sotto cui non c'e' ciclo di passi */
const F_MAX = 0.10;  /* piede piu' basso sopra il prato */
const T_MAX = 0.40;  /* s di scena di fila coi piedi sollevati (corpo appeso) */
const D_VOLO = 1.0;  /* u percorse di fila in scivolata (circa un passo): sotto, e' la dissolvenza fra braccia al cielo/posa ferma e corsa all'avvio di uno scatto (misurata 0,3-0,75u) */
const N_MIN = +(process.env.CPM_NMIN || 8);
const MISURA = !!process.env.CPM_MISURA;

const PICKS = ['run_to_crowd', 'run_wide', 'jump_arms_up', 'arms_up', 'contained', 'run_to_mates', 'knee_slide'];

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();

function giudica(fr) {
  /* fr: fotogrammi in ordine; si spezza in esultanze per cambio contesto / piano / buco */
  const ese = []; let cur = null, prev = null;
  for (const f of fr) {
    const chiave = f.c + '|' + (f.pk || '') + '|' + (f.tag || '');
    if (!cur || cur.k !== chiave || (prev && f.i !== prev.i + 1)) { cur = { k: chiave, c: f.c, pk: f.pk, tag: f.tag, f: [] }; ese.push(cur); prev = null; }
    cur.f.push(f); prev = f;
  }
  const out = [];
  for (const e of ese) {
    let t = 0, vMax = 0, voliA = 0, scia = 0, sciaMax = 0, aria = 0, ariaMax = 0, fMax = -9, liftFr = 0, movLift = 0, n = 0;
    const esempi = [];
    for (let i = 0; i < e.f.length; i++) {
      const f = e.f[i]; t += f.dt || 0; n++;
      if (f.f != null && f.f > fMax) fMax = f.f;
      const lift = f.g === 'lift' && f.gw > 0.5;
      if (lift) liftFr++;
      if (i === 0) continue;
      const p = e.f[i - 1]; const dt = f.dt || 0; if (dt <= 0) continue;
      const v = Math.hypot(f.x - p.x, f.z - p.z) / dt;
      if (v > 40) { scia = 0; aria = 0; continue; } /* stacco/snap: non e' moto */
      if (v > vMax) vMax = v;
      /* (a) si SPOSTA senza passi: braccia al cielo montate (congelate o no), oppure nessun gesto e corsa sotto R_MIN */
      const senzaPassi = (f.rw == null ? 0 : f.rw) < R_MIN;
      const glide = v > V_MAX && (lift || senzaPassi);
      if (v > V_MAX && lift) movLift++;
      if (glide) { scia += v * dt; voliA++; if (scia > sciaMax) sciaMax = scia; if (esempi.length < 3 && scia > D_VOLO) esempi.push(`v ${v.toFixed(1)} clip ${f.gn}@${f.gt}${f.gp ? 'P' : ''} gesto ${f.g} gw ${f.gw} corsa ${f.rw}`); } else scia = 0;
      /* (b) SOSPESO: piede piu' basso oltre F_MAX con la clip FERMA (tempo che non avanza) o mentre si sposta.
         Escluso il salto previsto: la quota procedurale del corpo (y, mezzo secondo per costruzione) e il saltello della clip
         mentre la clip SUONA (e' il suo movimento, non un corpo appeso) */
      const salto = (f.y || 0) > 0.02;
      const ferma = f.gt != null && p.gt != null && f.gn === p.gn && Math.abs(f.gt - p.gt) < 1e-3;
      if (f.f != null && f.f > F_MAX && !salto && (ferma || v > V_MAX)) { aria += dt; if (aria > ariaMax) ariaMax = aria; } else aria = 0;
    }
    const volo = sciaMax > D_VOLO || ariaMax > T_MAX;
    out.push({ c: e.c, pk: e.pk, tag: e.tag, n, t: +t.toFixed(2), vMax: +vMax.toFixed(1), liftFr, movLift, voliA, sciaMax: +sciaMax.toFixed(2), ariaMax: +ariaMax.toFixed(2), fMax: +fMax.toFixed(3), volo, esempi });
  }
  return out;
}

async function pagina(rosso) {
  const page = await b.newPage({ viewport: { width: 380, height: 300 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_G152W = []; if (r) window.__CPM_NO_G152 = 1; }, rosso);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 140)));
  return { page, errors };
}

async function forzate(rosso, continua, quante) {
  const { page, errors } = await pagina(rosso);
  await openMatch(page, port, { name: continua ? 'Ripresa152' : 'Esulta152' }); await sleep(1400);
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  const gis = await page.evaluate((LIM) => { const out = []; const S = window.__CPM_SITS || [];
    for (let i = 0; i < S.length && out.length < LIM; i++) { const s = S[i]; if (s && s.actions && s.actions[0] && s.actions[0].rew === 'goal' && !s.def) out.push(i); }
    return out; }, quante);
  /* l'esultanza si IMPONE avvolgendo la scelta del gioco (pura): si collaudano tutte le voci, non solo quelle che il seed pesca */
  await page.evaluate(() => { const o = window.pickCelebration; window.__G152_ORIG = o;
    window.pickCelebration = function (c, opt) { const id = window.__G152_PICK; const x = id && (window.CELEBRATIONS || []).find(y => y.id === id); return x || o(c, opt); }; });
  const ris = [];
  for (let k = 0; k < gis.length; k++) {
    const gi = gis[k], pk = PICKS[k % PICKS.length];
    const W0 = await page.evaluate(() => (window.__CPM_G152W || []).length);
    await page.evaluate(([g, p]) => { window.__G152_PICK = p; window.__CPM_CELEB = null; window.__CPM_CELDONE84 = 0; window.__CPM_FORCED_MODE = true; window.__CPM_FORCE_SIT(g, true); }, [gi, pk]);
    await sleep(700);
    await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; try { window.__CPM_RESOLVE(0); } catch (e) {} });
    if (continua) {
      await page.waitForFunction(() => !!window.__CPM_CELEB, null, { timeout: 60000 }).catch(() => {});
      await sleep(500);
      await page.evaluate(() => { window.__CPM_FORCED_MODE = false; });
      try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 2500 }); } catch (e) { await page.keyboard.press('Enter').catch(() => {}); }
    }
    await page.waitForFunction(() => window.__CPM_CELDONE84 === 1, null, { timeout: 120000 }).catch(() => {});
    await sleep(600);
    const fr = await page.evaluate(([a, tag]) => (window.__CPM_G152W || []).slice(a).map((f, i) => ({ ...f, i: a + i, tag })), [W0, `gi${gi}`]);
    const c = await page.evaluate(() => window.__CPM_CELEB && window.__CPM_CELEB.pick);
    ris.push({ gi, voluta: pk, scelta: c, fr });
    const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
    if (ph === 'ended' || ph === 'ceremony') break;
  }
  await page.close();
  return { ris, errors };
}

async function vera(rosso, nome, seed) {
  /* partita VERA seedata (autoplay), nome diverso = partita diversa (il seed di partita nasce anche dal nome) */
  const { page, errors } = await pagina(rosso);
  await openMatch(page, port, { skipLoadAll: true, name: nome }); await sleep(1200);
  await page.evaluate(sd => { window.__CPM_G152W = []; window.__CPM_AUTOPLAY(true, { seed: sd, policy: 'seeded', tickMs: 300 }); }, seed);
  const t0 = Date.now();
  while (Date.now() - t0 < +(process.env.CPM_TVERA || 300000)) {
    const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => 'ERRORE');
    if (ph === 'ended' || ph === 'ERRORE') break;
    await sleep(2000);
  }
  const fr = await page.evaluate(t => (window.__CPM_G152W || []).map((f, i) => ({ ...f, i, tag: t })), nome).catch(() => []);
  const gol = await page.evaluate(() => window.__CPM_SCORE && window.__CPM_SCORE()).catch(() => null);
  await page.close();
  return { ris: [{ gi: nome, fr, gol }], errors };
}

async function festa(rosso, light) {
  const { page, errors } = await pagina(rosso);
  await openMatch(page, port, { skipLoadAll: true, name: light ? 'Festa152' : 'Coppa152' }); await sleep(1200);
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  /* la festa si tiene aperta (__CPM_CER_HOLD, del gioco, solo sotto cpmtest) finche' non ha percorso T_FESTA s di SCENA: a fps
     headless la parete non dice quanta festa si e' vista, e i beat in cui l'eroe si sposta arrivano tardi */
  await page.evaluate(l => { window.__CPM_CER_HOLD = 1; window.__CPM_G152W = []; window.__CPM_FORCE_CEREMONY(l ? { light: true } : {}); }, light);
  await page.waitForFunction(T => (window.__CPM_G152W || []).reduce((a, f) => a + (f.dt || 0), 0) >= T, +(process.env.CPM_TFESTA || 16), { timeout: 240000, polling: 1000 }).catch(() => {});
  const fr = await page.evaluate(t => (window.__CPM_G152W || []).map((f, i) => ({ ...f, i, tag: t })), light ? 'festa' : 'coppa');
  await page.close();
  return { ris: [{ gi: light ? 'festa' : 'coppa', fr }], errors };
}

async function braccio(rosso) {
  const parti = [];
  const N = +(process.env.CPM_GOALS || 14), SOLO = process.env.CPM_SOLO || '';
  if (!SOLO || SOLO === 'forzate') parti.push(await forzate(rosso, false, N));
  if (!SOLO || SOLO === 'ripresa') parti.push(await forzate(rosso, true, Math.max(3, N >> 2)));
  if ((!SOLO && process.env.CPM_VERE) || SOLO === 'vere') { const NOMI = (process.env.CPM_NOMI || 'Vera152a,Vera152b,Vera152c').split(','); for (let k = 0; k < NOMI.length; k++) parti.push(await vera(rosso, NOMI[k], 1520 + k * 37)); }
  if (!SOLO || SOLO === 'festa') parti.push(await festa(rosso, true));
  if (!SOLO || SOLO === 'coppa') parti.push(await festa(rosso, false));
  if (process.env.CPM_DUMP) { const fs = await import('fs'); fs.writeFileSync(process.env.CPM_DUMP + (rosso ? '-rosso' : '-verde') + '.json', JSON.stringify(parti.map(p => p.ris))); }
  const tutte = [], errori = [];
  for (const p of parti) { errori.push(...p.errors); for (const r of p.ris) { for (const e of giudica(r.fr)) tutte.push({ ...e, gi: r.gi, voluta: r.voluta, scelta: r.scelta }); } }
  /* la PREMIAZIONE CON COPPA si misura e si stampa ma non entra nel verdetto: la salita sul palco col trofeo al cielo (2,7u in
     0,55 s, quota fino a 1,05, posa congelata) e' preesistente, identica nei due bracci, fuori dai percorsi «dopo un gol» e
     sotto i guardiani del giro 191 — domanda aperta al PO nel rapporto del giro 152 */
  const giud = tutte.filter(e => e.n >= 6 && e.gi !== 'coppa');
  return { tutte, giud, voli: giud.filter(e => e.volo), coppa: tutte.filter(e => e.gi === 'coppa'), errori };
}

function stampa(nome, r) {
  console.log(`\n── ${nome} ──`);
  for (const e of r.tutte) console.log(`${e.volo ? '🪂' : '  '} ${String(e.gi).padEnd(6)} ${e.c} ${String(e.pk || '-').padEnd(13)} fr ${String(e.n).padStart(4)} · t ${String(e.t).padStart(5)}s · vMax ${String(e.vMax).padStart(5)} · lift ${String(e.liftFr).padStart(3)} · lift+moto ${String(e.movLift).padStart(3)} · scivolata ${String(e.voliA).padStart(3)} fr (max ${e.sciaMax}u) · aria ${e.ariaMax}s (piede max ${e.fMax})${e.esempi.length ? ' · ' + e.esempi[0] : ''}`);
  const perC = {}; r.giud.forEach(e => { const k = e.c + ':' + (e.pk || '-'); perC[k] = perC[k] || [0, 0]; perC[k][0]++; if (e.volo) perC[k][1]++; });
  if (r.coppa.length) console.log(`premiazione con coppa (FUORI GIUDIZIO): ${r.coppa.map(e => `scivolata max ${e.sciaMax}u, sospeso ${e.ariaMax}s`).join(' · ')}`);
  console.log(`esultanze giudicate ${r.giud.length} · in volo ${r.voli.length} · per percorso: ${Object.entries(perC).map(([k, v]) => `${k} ${v[1]}/${v[0]}`).join(' · ')}${r.errori.length ? ' · pageerror ' + r.errori.length + ': ' + r.errori[0] : ''}`);
}

const BR = (process.env.CPM_BRACCI || 'verde,rosso').split(',');
const v = BR.includes('verde') ? await braccio(false) : null; if (v) stampa('VERDE', v);
const r = BR.includes('rosso') ? await braccio(true) : null; if (r) stampa('ROSSO __CPM_NO_G152', r);
await Promise.race([b.close(), sleep(5000)]); srv.close();
if (MISURA) process.exit(0);
const why = [];
const okV = !!v && v.giud.length >= N_MIN && v.voli.length === 0 && v.errori.length === 0;
const okR = !!r && r.giud.length >= N_MIN && r.voli.length > 0;
if (v && !okV) why.push(v.giud.length < N_MIN ? `verde non giudicato: ${v.giud.length} esultanze < ${N_MIN}` : v.errori.length ? `verde: ${v.errori.length} pageerror` : `verde: ${v.voli.length} esultanze in volo (${v.voli.map(e => e.gi + ':' + e.pk).join(', ')})`);
if (r && !okR) why.push(r.giud.length < N_MIN ? `rosso non giudicato: ${r.giud.length} esultanze` : 'rosso __CPM_NO_G152: il volo non ricompare');
console.log(okV ? `✅ VERDE: ${v.giud.length} esultanze, nessun fotogramma in volo` : '❌ VERDE non passa');
console.log(okR ? `✅ ROSSO __CPM_NO_G152 cade: ${r.voli.length} esultanze in volo su ${r.giud.length}` : '❌ il ROSSO non cade');
const tutti = BR.includes('verde') && BR.includes('rosso');
console.log(`BRACCI ${BR.join('+')} · MOTIVO ${why.length ? why.join(' · ') : 'nessuno'}${tutti ? '' : ' · corsa PARZIALE: non vale come verdetto'}`);
process.exit(tutti && okV && okR ? 0 : 1);
