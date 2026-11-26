#!/usr/bin/env node
/* [giro 364, PO-650 «le azioni sulle fasce sono terribili e confusionarie»] SONDA DI MISURA (non guardiano) delle scene di fascia.
   GLB ACCESO, teatro acceso (__CPM_PRESENT + __CPM_CINE), una pagina NUOVA ogni CPM_PER scene (una pagina stanca non e' il gioco).
   Tutto dal testimone __CPM_F364 (src/12): eroe, pallone, camera e riceventi letti dalle mesh nello stesso fotogramma.
   Scene: (M) costruite dal motore (scenaDalMotoreFascia) in 4 punti di fascia x semi; (C) schede del catalogo con zona o testo di fascia.
   Per ogni scena x azione x esito: lato dichiarato, z dell'eroe (apertura / minimo |z| prima del contatto / contatto), accentramento,
   fermo del pallone prima del volo, salto massimo del pallone fuori dallo stacco (con lo scrittore), arco (lunghezza, quota, durata,
   punto di caduta), ricevente (c'e'? nel quadro all'armo? distanza dal punto di caduta, distanza dal pallone all'arrivo),
   esito dichiarato contro pallone in rete, salto massimo della camera fuori dallo stacco.
   Uso: node misura-364.mjs · CPM_ROSSO=__CPM_NO_G364 · CPM_SOLO=M|C · CPM_MAX=n · CPM_OUT=file.json · CPM_GREZZO=1 (salva i fotogrammi) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const ROSSO = (process.env.CPM_ROSSO || '').split(',').filter(Boolean);
const SOLO = process.env.CPM_SOLO || '', MAX = +(process.env.CPM_MAX || 0), PER = +(process.env.CPM_PER || 6);
const OUT = process.env.CPM_OUT || 'out/misura-364.json';
const PUNTI = [[72, 84, 1.2], [72, 16, 1.2], [80, 80, 0.4], [66, 22, 2.0]];
const SEMI = (process.env.CPM_SEMI || '7,19,43').split(',').map(Number);
export const GLX = 48.6, PALO = 3.35;

export async function apri(b, port, rossi, extra) {
  const pg = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(pg);
  pg.__err364 = []; pg.on('pageerror', e => { if (pg.__err364.length < 5) pg.__err364.push(String(e && e.message).slice(0, 200)); });
  await pg.addInitScript(([r, x]) => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_REC364 = 1; window.__CPM_REC241 = 1; window.__CPM_F364 = []; for (const k of r) window[k] = 1; if (x) for (const k in x) window[k] = x[k]; }, [rossi, extra || null]);
  await openMatch(pg, port, { skipLoadAll: true, name: 'Fasce364' }); await sleep(800);
  await pg.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  return pg;
}

/* apre la scena (indice del catalogo o occasione del motore), aspetta la scelta, risolve, aspetta la fine vera */
export async function gioca(pg, sc, k, esito, { letturaMs = 2500, kind = null, dove = 'centro' } = {}) {
  const st = await pg.evaluate(([sc]) => { try {
    let idx = sc.gi, temp = false;
    if (sc.occ) { const sit = scenaDalMotoreFascia({ tipo: 'fascia', x: sc.occ[0], y: sc.occ[1], press: sc.occ[2], liberi: 2, cast: { ricevente: { nome: 'Rossi' }, difensore: { nome: 'Langer' } } }, { name: 'Fasce364', stats: { tiro: 70, tecnica: 70, passaggio: 70, dribbling: 70, velocità: 70, fisico: 70 }, ovr: 70 }, sc.seme);
      if (!sit) return { err: 'scena non costruita' }; idx = SITUATIONS.push(sit) - 1; temp = true; }
    const sit = SITUATIONS[idx]; const z = sit.startZone, mz = sit.moveZone || z; const pos = { x: (z.x[0] + z.x[1]) / 2, y: (z.y[0] + z.y[1]) / 2 };
    /* 'interno': il giocatore ha portato l'eroe al bordo interno e avanzato della zona di movimento (quello che fa chi punta la porta) */
    if (sc.dove === 'interno') { pos.x = mz.x[1]; pos.y = pos.y > 50 ? mz.y[0] : mz.y[1]; }
    window.__CPM_F364.length = 0; if (window.__CPM_G241W) window.__CPM_G241W.length = 0; window.__CPM_FINE241 = null; window.__CPM_BJ478 = [];
    window.__CPM_FROZEN = false; window.__CPM_FORCE_INTRO = sc.intro ? 1 : 0; window.__CPM_FORCE_INTRO_MS = 2200; window.__CPM_FORCE_SIT(idx, true, pos);
    return { idx, temp, pos, y0: (z.y[0] + z.y[1]) / 2, text: sit.text, zones: sit.zones, az: sit.actions.map(a => a.label || a.l || a.text), rew: sit.actions.map(a => a.reward || a.rew) };
  } catch (e) { return { err: String(e && e.message) }; } }, [{ ...sc, dove, intro: !process.env.CPM_NO_INTRO }]);
  if (st.err) return { err: st.err };
  if (k >= st.az.length) { if (st.temp) await pg.evaluate(() => SITUATIONS.pop()); return { err: 'azione assente', st }; }
  await pg.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
  await sleep(letturaMs);
  const nScelta = await pg.evaluate(([k, e, kd]) => { window.__CPM_FORCE_OUTCOME = e; window.__CPM_FORCE_KIND = kd || undefined; const n = window.__CPM_F364.length; window.__CPM_RESOLVE(k); return n; }, [k, esito, kind]);
  await pg.waitForFunction(() => window.__CPM_FINE241 != null, null, { timeout: 30000 }).catch(() => {});
  await sleep(900);
  const r = await pg.evaluate(() => ({ F: window.__CPM_F364.slice(), fine: window.__CPM_FINE241, bj: (window.__CPM_BJ478 || []).slice(), out: window.__CPM_OUTCOME || null }));
  await pg.evaluate((t) => { window.__CPM_FORCE_KIND = undefined; if (t) SITUATIONS.pop(); }, st.temp);
  return { st, nScelta, ...r, errori: (pg.__err364 || []).slice() };
}

/* un numero per difetto, tutto dai fotogrammi del testimone */
export function metriche(run) {
  let F = run.F, n0 = run.nScelta; if (!F || F.length < 10) return { cieco: 'pochi fotogrammi (' + (F ? F.length : 0) + ')' };
  /* i primi fotogrammi possono essere della scena di prima: si parte dall'ultimo azzeramento del tempo di scena prima della scelta */
  { let i0 = 0; for (let i = 1; i < n0; i++) if (F[i].ck < F[i - 1].ck) i0 = i; F = F.slice(i0); n0 -= i0; }
  const lato = Math.sign(run.st.y0 - 50) || 1;/* lato del testo: y > 50 → z > 0 */
  if (run.fine != null && run.fine > n0 + 10 && run.fine < F.length) F = F.slice(0, run.fine);/* scena forzata: oltre il punto in cui il gioco vero l'avrebbe chiusa non si giudica */
  const pre = F.slice(0, n0), post = F.slice(n0);
  const ap = pre.length ? pre[pre.length - 1] : F[0];
  const iArc = post.findIndex(f => f.arc), fArc = iArc >= 0 ? post[iArc] : null;
  const finoA = iArc >= 0 ? post.slice(0, iArc + 1) : post;
  const ult = post[post.length - 1] || ap;
  const m = { lato, testo: run.st.text, zApe: +(ap.h[1] * lato).toFixed(1), xApe: ap.h[0], zPallaApe: +(ap.b[2] * lato).toFixed(1), ht: ult.ht || null, hv: ult.hv || null, kd: ult.kd || (ult.ok ? 'goal' : null), ok: ult.ok };
  m.zCont = fArc ? +(fArc.h[1] * lato).toFixed(1) : null; m.xCont = fArc ? fArc.h[0] : null;
  m.zMin = +Math.min(...finoA.map(f => f.h[1] * lato)).toFixed(1);
  m.accentra = +(m.zApe - (m.zCont != null ? m.zCont : m.zMin)).toFixed(1);
  m.tCont = fArc ? +(fArc.ck - post[0].ck).toFixed(2) : null;
  /* fermo del pallone dopo la scelta e prima che finisca la scena: striscia piu' lunga (tempo di scena) col pallone a terra che si
     sposta meno di 0,02 u per fotogramma mentre l'eroe NON gli sta addosso (pallone lontano oltre 1,5 u dall'eroe) */
  let fermo = 0, cur = 0, fermoA = null; let iUlt = post.length - 1; while (iUlt > 1 && Math.hypot(post[iUlt].b[0] - post[iUlt - 1].b[0], post[iUlt].b[2] - post[iUlt - 1].b[2]) < 0.02) iUlt--;/* il riposo finale non e' un fermo */
  for (let i = 1; i <= iUlt; i++) { const a = post[i - 1], b = post[i]; const d = Math.hypot(b.b[0] - a.b[0], b.b[2] - a.b[2]), dh = Math.hypot(b.b[0] - b.h[0], b.b[2] - b.h[1]);
    const inR = b.b[0] >= 46 && Math.abs(b.b[2]) <= 3.6;/* fermo in rete non e' un fermo */
    if (d < 0.02 && dh > 1.5 && !b.cut && !inR && b.ck > a.ck) { cur += b.ck - a.ck; if (cur > fermo) { fermo = cur; fermoA = +(b.ck - post[0].ck).toFixed(2); } } else cur = 0; }
  m.fermo = +fermo.toFixed(2); m.fermoA = fermoA;
  /* il fermo che il PO vede («freezato per qualche istante poi interviene il compagno»): pallone fermo lontano dall'eroe PRIMA che l'esito
     sia deciso, cioe' durante costruzione, volo e consegna (cross_goal / assist_recv), non il riposo del pallone a esito avvenuto */
  { let fa = 0, c = 0; const deciso = post.findIndex(f => f.pa && f.pa !== 'cross_goal' && f.pa !== 'assist_recv' && f.pa !== 'onetwo_back'); const lim = deciso < 0 ? iUlt : Math.min(iUlt, deciso);
    for (let i = 1; i <= lim; i++) { const a = post[i - 1], b = post[i]; const d = Math.hypot(b.b[0] - a.b[0], b.b[2] - a.b[2]), dh = Math.hypot(b.b[0] - b.h[0], b.b[2] - b.h[1]); if (d < 0.02 && dh > 1.5 && !b.cut && b.ck > a.ck) { c += b.ck - a.ck; if (c > fa) fa = c; } else c = 0; }
    m.fermoAzione = +fa.toFixed(2); }
  /* salti: passo fra due fotogrammi consecutivi fuori dallo stacco; si dichiara col tempo di scena del passo e la velocita' */
  let sb = { d: 0 }, scam = { d: 0 }, sh = { d: 0 };
  for (let i = 1; i < F.length; i++) { const a = F[i - 1], b = F[i]; if (a.cut || b.cut || a.sk !== b.sk) continue; const dt = b.ck - a.ck;
    const db = Math.hypot(b.b[0] - a.b[0], b.b[2] - a.b[2]); const passoArco = (b.arc && b.arc[3] > 0) ? Math.hypot(b.arc[0] - a.b[0], b.arc[1] - a.b[2]) : 0;
    /* un passo lungo dentro un arco e' velocita' x intervallo: salto solo se supera di 3 u il passo atteso a 60 u/s di scena */
    if (db > sb.d && db > 60 * dt + 3) sb = { d: +db.toFixed(1), dt: +dt.toFixed(3), ws: b.ws, src: b.src, a: +(b.ck).toFixed(2), dopo: i >= n0 ? 1 : 0, arc: b.arc ? 1 : 0 };
    const dc = Math.hypot(b.c[0] - a.c[0], b.c[1] - a.c[1], b.c[2] - a.c[2]); if (dc > scam.d && dc > 40 * dt + 2) scam = { d: +dc.toFixed(1), dt: +dt.toFixed(3), a: +b.ck.toFixed(2), dopo: i >= n0 ? 1 : 0 };
    const dhh = Math.hypot(b.h[0] - a.h[0], b.h[1] - a.h[1]); if (dhh > sh.d && dhh > 20 * dt + 1.5) sh = { d: +dhh.toFixed(1), dt: +dt.toFixed(3), a: +b.ck.toFixed(2), dopo: i >= n0 ? 1 : 0 }; }
  m.saltoPalla = sb.d ? sb : null; m.saltoCam = scam.d ? scam : null; m.saltoEroe = sh.d ? sh : null;
  /* arco: il primo dopo la scelta */
  if (fArc) { const seg = []; for (let i = iArc; i < post.length && post[i].arc && post[i].arc[0] === fArc.arc[0] && post[i].arc[1] === fArc.arc[1]; i++) seg.push(post[i]);
    const p0 = iArc > 0 ? post[iArc - 1] : fArc, fin = seg[seg.length - 1];
    m.arco = { lung: +Math.hypot(fArc.arc[0] - p0.b[0], fArc.arc[1] - p0.b[2]).toFixed(1), quota: +Math.max(...seg.map(f => f.b[1])).toFixed(2), dur: fArc.arc[3], h: fArc.arc[4], tx: fArc.arc[0], tz: +(fArc.arc[1] * lato).toFixed(1), zPart: +(p0.b[2] * lato).toFixed(1), xPart: p0.b[0] };
    m.arco.inArea = (fArc.arc[0] >= 32.1 && Math.abs(fArc.arc[1]) <= 20.2) ? 1 : 0;
    const iDopo = Math.min(post.length - 1, iArc + seg.length), dopo = post[iDopo];/* il primo fotogramma DOPO il volo: l'arrivo */
    const ric = fArc.cr || fArc.pr, ricF = dopo.cr || dopo.pr || fin.cr || fin.pr;
    /* il ricevente PRIMA della scelta: dov'era e se era nel quadro nell'ultimo fotogramma di lettura; e quanti compagni in area */
    const idR = (fin.hm || []).find(h => h[4]) || (fArc.hm || []).find(h => h[4]); const apR = idR ? (ap.hm || []).find(h => h[0] === idR[0]) : null;
    m.ricApe = apR ? { x: apR[1], z: +(apR[2] * lato).toFixed(1), inQuadro: apR[3], inArea: (apR[1] >= 32.1 && Math.abs(apR[2]) <= 20.2) ? 1 : 0 } : null;
    const volo = seg.filter(f => f.cr || f.pr); m.ricQuadroVolo = volo.length ? +(volo.filter(f => (f.cr || f.pr)[2]).length / volo.length).toFixed(2) : null;/* quota del volo col ricevente nel quadro */
    m.eroeQuadro = +(post.filter(f => f.h[2]).length / post.length).toFixed(2);
    m.ric = ric ? { tipo: fArc.cr ? 'cross' : 'pass', inQuadro: ric[2], visibile: ric[3], dCaduta: +Math.hypot(ric[0] - fArc.arc[0], ric[1] - fArc.arc[1]).toFixed(1), v: ric[4], dArrivo: ricF ? +Math.hypot(ricF[0] - dopo.b[0], ricF[1] - dopo.b[2]).toFixed(1) : null, yArrivo: dopo.b[1] } : null; }
  /* esito dichiarato contro il pallone: e' mai entrato in rete (oltre la linea, fra i pali, sotto la traversa)? */
  m.pt = ult.pt || null; m.pp = ult.pp || null; m.compagniInArea = (ap.hm || []).filter(h => h[1] >= 32.1 && Math.abs(h[2]) <= 20.2).length; m.compagniInAreaQuadro = (ap.hm || []).filter(h => h[1] >= 32.1 && Math.abs(h[2]) <= 20.2 && h[3]).length;
  m.inRete = post.some(f => f.b[0] >= GLX && Math.abs(f.b[2]) <= PALO && f.b[1] <= 2.6) ? 1 : 0;
  m.xMaxPalla = +Math.max(...post.map(f => f.b[0])).toFixed(1);
  m.nF = F.length; m.durScena = +(F[F.length - 1].ck).toFixed(1);
  return m;
}

export async function elencoCatalogo(pg) {
  return pg.evaluate(() => SITUATIONS.map((s, i) => ({ i, t: s.text, z: s.zones, y: s.startZone && s.startZone.y, x: s.startZone && s.startZone.x, ty: s.type, n: (s.actions || []).length }))
    .filter(s => s.ty !== 'def' && s.y && (/fascia|cross|esterno|sovrapposizione|sul fondo/i.test(s.t) || (s.z || []).includes('fascia')) && Math.abs((s.y[0] + s.y[1]) / 2 - 50) >= 18 && !/punizione|angolo|corner/i.test(s.t)));
}

async function main() {
  const server = await startServer(); const port = server.address().port; const b = await launchBrowser();
  let pg = await apri(b, port, ROSSO); const cat = SOLO === 'M' ? [] : await elencoCatalogo(pg);
  const lista = [];
  if (SOLO !== 'C') {
    for (const p of PUNTI) for (const s of SEMI) for (let k = 0; k < 3; k++) lista.push({ nome: `M(${p[0]},${p[1]})s${s}`, sc: { occ: p, seme: s }, k, esito: 'success' });
    for (const p of PUNTI.slice(0, 2)) for (const s of SEMI) for (let k = 0; k < 3; k++) lista.push({ nome: `M(${p[0]},${p[1]})s${s}`, sc: { occ: p, seme: s }, k, esito: 'success', kind: 'chance' });
    for (const p of PUNTI) for (let k = 0; k < 3; k++) lista.push({ nome: `M(${p[0]},${p[1]})s${SEMI[1]}i`, sc: { occ: p, seme: SEMI[1] }, k, esito: 'success', kind: 'chance', dove: 'interno' });
    for (const p of PUNTI.slice(0, 2)) for (let k = 0; k < 3; k++) lista.push({ nome: `M(${p[0]},${p[1]})s${SEMI[0]}`, sc: { occ: p, seme: SEMI[0] }, k, esito: 'fail' });
  }
  for (const c of cat) for (let k = 0; k < Math.min(c.n, 3); k++) lista.push({ nome: `C${c.i}`, sc: { gi: c.i }, k, esito: k === 1 ? 'success' : 'success', kind: k === 1 ? 'chance' : null });
  const L = MAX ? lista.slice(0, MAX) : lista; const R = []; let n = 0;
  console.log(`misura-364${ROSSO.length ? ' [ROSSO ' + ROSSO.join(',') + ']' : ''}: ${L.length} esecuzioni (${cat.length} schede di catalogo)`);
  for (const e of L) {
    if (n && n % PER === 0) { await pg.close(); pg = await apri(b, port, ROSSO); } n++;
    let run; try { run = await gioca(pg, e.sc, e.k, e.esito, { kind: e.kind || null, dove: e.dove || 'centro' }); } catch (err) { run = { err: String(err && err.message).slice(0, 120) }; try { await pg.close(); } catch (_e) { } pg = await apri(b, port, ROSSO); }
    if (run.err) { console.log(`  ${e.nome} k${e.k} ${e.esito}: ${run.err}`); R.push({ ...e, err: run.err }); continue; }
    const m = metriche(run); R.push({ ...e, az: run.st.az[e.k], m, ...(process.env.CPM_GREZZO ? { F: run.F, nScelta: run.nScelta } : {}) });
    console.log(`  ${e.nome} k${e.k} ${e.esito[0]}${e.kind ? '/' + e.kind : ''} «${(run.st.az[e.k] || '').slice(0, 26)}» ${m.cieco ? 'CIECO ' + m.cieco : `${m.ht}/${m.hv || '-'} ${m.kd} | z ape ${m.zApe} min ${m.zMin} cont ${m.zCont} (acc ${m.accentra}) | fermo ${m.fermoAzione}s (tot ${m.fermo}) | salto palla ${m.saltoPalla ? m.saltoPalla.d + 'u/' + Math.round(m.saltoPalla.dt * 1000) + 'ms ' + (m.saltoPalla.src || 'ws' + m.saltoPalla.ws) : '-'} | cam ${m.saltoCam ? m.saltoCam.d + 'u' : '-'} | arco ${m.arco ? `${m.arco.lung}u q${m.arco.quota} ${m.arco.dur}s →(${m.arco.tx},${m.arco.tz}) area ${m.arco.inArea}` : 'MAI'} | ric ${m.ric ? `${m.ric.tipo} quadroVolo ${m.ricQuadroVolo} dCad ${m.ric.dCaduta} dArr ${m.ric.dArrivo}` : 'NESSUNO'} | ricApe ${m.ricApe ? `(${m.ricApe.x},${m.ricApe.z}) q${m.ricApe.inQuadro} a${m.ricApe.inArea}` : '-'} inArea ${m.compagniInArea}/${m.compagniInAreaQuadro} | rete ${m.inRete} | ${m.pt}`}`);
  }
  fs.mkdirSync('out', { recursive: true }); fs.writeFileSync(OUT, JSON.stringify(R));
  riepilogo(R);
  await b.close(); server.close();
}

export function riepilogo(R) {
  const V = R.filter(r => r.m && !r.m.cieco), ok = V.filter(r => r.esito === 'success');
  const q = (a, f) => a.length ? (a.filter(f).length + '/' + a.length) : '0/0';
  const med = a => { const s = a.filter(x => x != null).sort((p, q) => p - q); return s.length ? s[Math.floor(s.length / 2)] : null; };
  const cross = V.filter(r => r.m.ht === 'cross');
  console.log(`\nRIEPILOGO (${V.length} giudicate, ${R.length - V.length} non giudicate)`);
  console.log(`  eroe al contatto dentro |z| 12 (non sulla fascia): ${q(V.filter(r => r.m.zCont != null), r => r.m.zCont < 12)} · mediana z contatto ${med(V.map(r => r.m.zCont))} · mediana accentramento ${med(V.map(r => r.m.accentra))} u`);
  console.log(`  apertura dentro |z| 12: ${q(V, r => r.m.zApe < 12)} · mediana z apertura ${med(V.map(r => r.m.zApe))}`);
  console.log(`  pallone fermo oltre 0,5 s di scena prima dell'esito: ${q(V, r => r.m.fermoAzione > 0.5)} · massimo ${Math.max(0, ...V.map(r => r.m.fermoAzione))} s`);
  console.log(`  salto del pallone fuori stacco: ${q(V, r => r.m.saltoPalla)} · massimo ${Math.max(0, ...V.map(r => r.m.saltoPalla ? r.m.saltoPalla.d : 0))} u`);
  console.log(`  salto della camera fuori stacco: ${q(V, r => r.m.saltoCam)} · massimo ${Math.max(0, ...V.map(r => r.m.saltoCam ? r.m.saltoCam.d : 0))} u`);
  console.log(`  conclusione mai partita (nessun arco): ${q(V, r => !r.m.arco)}`);
  console.log(`  cross (${cross.length}): caduta fuori area ${q(cross.filter(r => r.m.arco), r => !r.m.arco.inArea)} · quota mediana ${med(cross.map(r => r.m.arco && r.m.arco.quota))} · senza ricevente ${q(cross.filter(r => r.m.arco), r => !r.m.ric)} · ricevente nel quadro per meno di meta' del volo ${q(cross.filter(r => r.m.ricQuadroVolo != null), r => r.m.ricQuadroVolo < 0.5)} (mediana ${med(cross.map(r => r.m.ricQuadroVolo))}) · ricevente oltre 2 u dal pallone all'arrivo ${q(cross.filter(r => r.m.ric), r => r.m.ric.dArrivo > 2)}`);
  console.log(`  esito «chance»/«assist» riuscito col pallone IN RETE: ${q(ok.filter(r => r.m.kd === 'chance'), r => r.m.inRete)} (chance) · dichiarato non-gol in rete (tutte): ${q(V.filter(r => r.m.kd && r.m.kd !== 'goal'), r => r.m.inRete)}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch(e => { console.error(e); process.exit(1); });
