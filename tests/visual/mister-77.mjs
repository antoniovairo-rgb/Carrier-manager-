#!/usr/bin/env node
/* [7.999.77+ Parte 1 prompt PO «le braccia del mister sono storte o incrociate nelle feste»] SONDA DI MISURA.
   Per ogni festa (league/cup/int/promo/bigwin + fine partita leggera) e per i due corpi del mister (attore 3D
   actor-presenter con CPM_GLB=1, manichino di riserva con CPM_GLB=0) salta al centro di ogni beat
   (__CPM_CERT_SET) e legge le posizioni MONDO dal testimone __CPM_COACH77. Misure per fotogramma:
   distanza fra le mani · mano oltre la linea mediana (verso il lato opposto) · avambraccio dentro il torso ·
   angolo del gomito (180 = teso) · scarto fra l'avanti del gruppo e l'avanti anatomico (bacino→punte).
   Uso: CPM_GLB=1 node mister-77.mjs  (CPM_ONLY=league,promo per restringere) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const GLB = process.env.CPM_GLB !== '0';
const ROSSO = !!process.env.CPM_ROSSO77;
const TAG = (GLB ? 'glb' : 'lp') + (ROSSO ? '-rosso' : '');
const KINDS = (process.env.CPM_ONLY || 'league,cup,int,promo,bigwin,light').split(',');
const OUT = 'out/mister77'; fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const sub = (a, c) => [a[0] - c[0], a[1] - c[1], a[2] - c[2]], dot = (a, c) => a[0] * c[0] + a[1] * c[1] + a[2] * c[2];
const len = a => Math.hypot(a[0], a[1], a[2]), nrm = a => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
function misura(f) {
  if (!f.sL || !f.sR || !f.hL || !f.hR) return null;
  const mid = [(f.sL[0] + f.sR[0]) / 2, (f.sL[1] + f.sR[1]) / 2, (f.sL[2] + f.sR[2]) / 2];
  const lat = nrm([f.sR[0] - f.sL[0], 0, f.sR[2] - f.sL[2]]);           /* da sinistra a destra del corpo */
  const fwdG = [Math.sin(f.ry), 0, Math.cos(f.ry)];                     /* avanti del GRUPPO */
  let fwdA = null; if (f.pe && f.tL && f.tR) fwdA = nrm([(f.tL[0] + f.tR[0]) / 2 - f.pe[0], 0, (f.tL[2] + f.tR[2]) / 2 - f.pe[2]]);
  const fwd = fwdA || fwdG;
  const lx = p => dot(sub(p, mid), lat), fz = p => dot(sub(p, mid), fwd);
  const r = { mani: +len(sub(f.hL, f.hR)).toFixed(3),
    /* attraversamento: la mano sinistra dovrebbe stare a lx<0; quanto va oltre la mediana dal lato sbagliato */
    oltreL: +Math.max(0, lx(f.hL)).toFixed(3), oltreR: +Math.max(0, -lx(f.hR)).toFixed(3),
    scartoAvanti: fwdA ? +(Math.acos(Math.max(-1, Math.min(1, dot(fwdA, fwdG)))) * 180 / Math.PI).toFixed(1) : null,
    spalle: +len(sub(f.sL, f.sR)).toFixed(3) };
  /* avambraccio dentro il torso: campioni gomito→mano dentro la scatola del busto (mezza larghezza 0,17,
     profondita' -0,12..+0,14, dal bacino alle spalle) */
  const yLo = f.pe ? f.pe[1] : mid[1] - 0.55;
  const dentro = (e, h) => { if (!e) return 0; let n = 0; for (let t = 0; t <= 1.0001; t += 0.25) { const p = [e[0] + (h[0] - e[0]) * t, e[1] + (h[1] - e[1]) * t, e[2] + (h[2] - e[2]) * t];
      if (Math.abs(lx(p)) < 0.17 && fz(p) > -0.12 && fz(p) < 0.14 && p[1] > yLo && p[1] < mid[1]) n++; } return n / 5; };
  r.dentroL = dentro(f.eL, f.hL); r.dentroR = dentro(f.eR, f.hR);
  const gom = (s, e, h) => { if (!e) return null; const a = nrm(sub(s, e)), c = nrm(sub(h, e)); return +(Math.acos(Math.max(-1, Math.min(1, dot(a, c)))) * 180 / Math.PI).toFixed(1); };
  r.gomL = gom(f.sL, f.eL, f.hL); r.gomR = gom(f.sR, f.eR, f.hR);
  /* mani: altezza rispetto alle spalle e avanti/indietro */
  r.hY = [+(f.hL[1] - mid[1]).toFixed(2), +(f.hR[1] - mid[1]).toFixed(2)]; r.hZ = [+fz(f.hL).toFixed(2), +fz(f.hR).toFixed(2)]; r.hX = [+lx(f.hL).toFixed(2), +lx(f.hR).toFixed(2)];
  return r;
}
const tutto = {};
const DUR = { light: 9500, int: 26500, cup: 17500, promo: 19500, league: 23500, bigwin: 23500 };/* i timer della cerimonia in src/15 */
for (const kind of KINDS) {
  const p = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(p);
  await p.addInitScript(([g, r]) => { window.__CPM_GLB = g; window.__CPM_REC = 1; window.__CPM_CER_HOLD = 1; if (r) window.__CPM_NO_BRACCIA77 = 1; }, [GLB, ROSSO]);
  await openMatch(p, port, { skipLoadAll: true, name: 'Mister77' }); await sleep(1200);
  if (GLB) await p.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  await p.addStyleTag({ content: '[data-cpm="voci"],button{visibility:hidden!important}' }).catch(() => {});
  const cdp = await p.context().newCDPSession(p); let ult = null;
  cdp.on('Page.screencastFrame', e => { ult = Buffer.from(e.data, 'base64'); cdp.send('Page.screencastFrameAck', { sessionId: e.sessionId }).catch(() => {}); });
  await cdp.send('Page.startScreencast', { format: 'png', maxWidth: 412, maxHeight: 915, everyNthFrame: 1 });
  await p.evaluate(k => { window.__CPM_COACH77 = null; window.__CPM_CER425 = null; window.__CPM_FORCE_CEREMONY(k === 'light' ? { light: true } : { kind: k }); }, kind);
  let tForce = Date.now();
  await p.waitForFunction(() => window.__CPM_CER425 && window.__CPM_CER425.beats, null, { timeout: 30000 }).catch(() => {});
  const cer = await p.evaluate(() => window.__CPM_CER425);
  /* il mister carica il suo GLB in modo asincrono: si aspetta che il testimone dica glb=1 */
  if (GLB) await p.waitForFunction(() => { const W = window.__CPM_COACH77; return W && W.fr.some(f => f.glb === 1); }, null, { timeout: 30000 }).catch(() => {});
  const perBeat = {};
  if (cer && cer.beats) {
    let t0 = 0;
    for (let i = 0; i < cer.beats.length; i++) {
      const bk = cer.beats[i], d = cer.beatsD[i] || 2;
      /* la cerimonia si chiude con un timer in TEMPO REALE (9,5-26,5 s): se e' finita la si riapre, poi si salta al beat */
      /* se alla chiusura mancano meno di 6 s, si aspetta che chiuda e la si riapre: la misura e la foto stanno dentro */
      if (Date.now() - tForce > DUR[kind] - 6000) { for (let w = 0; w < 40; w++) { const ph = await p.evaluate(() => { try { return window.__CPM_PHASE(); } catch (_e) { return null; } }); if (ph !== 'ceremony') break; await sleep(300); } }
      const fase = await p.evaluate(() => { try { return window.__CPM_PHASE ? window.__CPM_PHASE() : null; } catch (_e) { return null; } });
      if (fase !== 'ceremony') { await p.evaluate(k => { window.__CPM_FORCE_CEREMONY(k === 'light' ? { light: true } : { kind: k }); }, kind); tForce = Date.now(); await sleep(900); }
      await p.evaluate(t => { window.__CPM_COACH77 = { fr: [] }; window.__CPM_CERT_SET = t; }, t0 + d * 0.5);
      await sleep(1500);
      /* la camera libera si punta sul mister (davanti a lui, 5,5u) DENTRO la stessa finestra della misura */
      /* la camera SEGUE il mister fino allo scatto (lui cammina verso il suo posto dopo il salto di fase) */
      for (let q = 0; q < 12; q++) {
        await p.evaluate(() => { const W = window.__CPM_COACH77; const f = W && W.fr[W.fr.length - 1]; if (!f || !f.g) return;
          const fw = [Math.sin(f.ry), Math.cos(f.ry)], la = [Math.cos(f.ry), -Math.sin(f.ry)], g = f.g;
          window.__CPM_CAM904 = { x: g[0] + fw[0] * 4.2 + la[0] * 3.0, y: 1.55, z: g[2] + fw[1] * 4.2 + la[1] * 3.0, lx: g[0], ly: 1.1, lz: g[2] }; });
        await sleep(200); }
      await sleep(400);
      const inCer = await p.evaluate(() => { try { return window.__CPM_PHASE() === 'ceremony'; } catch (_e) { return false; } });
      if (!inCer) console.log('   (foto saltata: cerimonia chiusa)', kind, bk, !!ult);
      if (ult && inCer) fs.writeFileSync(`${OUT}/${TAG}-${kind}-${i}-${bk}.png`, ult);
      await p.evaluate(() => { delete window.__CPM_CAM904; });
      const fr = await p.evaluate(() => (window.__CPM_COACH77 || { fr: [] }).fr);
      const ok = fr.filter(f => f.b === bk && (!GLB || f.glb === 1));
      const m = ok.map(misura).filter(Boolean);
      const f = ok[ok.length - 1];
      const W = m.length ? { mani: Math.min(...m.map(x => x.mani)), oltre: Math.max(...m.map(x => Math.max(x.oltreL, x.oltreR))),
        dentro: Math.max(...m.map(x => Math.max(x.dentroL, x.dentroR))),
        gomMin: GLB ? Math.min(...m.map(x => Math.min(x.gomL, x.gomR))) : null, gomMax: GLB ? Math.max(...m.map(x => Math.max(x.gomL, x.gomR))) : null } : null;
      perBeat[`${i}:${bk}`] = { n: m.length, peggio: W, ultimo: m[m.length - 1] || null, f };
      t0 += d;
    }
  }
  tutto[kind] = { beats: cer && cer.beats, perBeat };
  const righe = Object.entries(perBeat).map(([k, v]) => { const w = v.peggio; return w ? `  ${k.padEnd(12)} n${String(v.n).padStart(3)} · PEGGIORE: mani ${w.mani.toFixed(3)} · oltre la mediana ${w.oltre.toFixed(3)} · avambraccio nel busto ${w.dentro} · gomito ${w.gomMin}°-${w.gomMax}°` : `  ${k.padEnd(12)} (nessun fotogramma)`; });
  console.log(`${GLB ? 'ATTORE 3D' : 'MANICHINO'}${ROSSO ? ' ROSSO' : ''} · ${kind} · ${cer && cer.beats ? cer.beats.join('>') : 'CIECO'}\n` + righe.join('\n'));
  await p.close();
}
fs.writeFileSync(`${OUT}/${TAG}.json`, JSON.stringify(tutto, null, 1));
/* GIUDIZIO — limiti anatomici: nessuna mano oltre la mediana di piu' di 2 cm; avambraccio mai dentro il busto;
   mani mai a meno di 4 cm (compenetrazione); gomito fra 30° (flessione massima) e 180° (teso). Il braccio che
   non ha fotogrammi e' CIECO e non passa. */
const guasti = []; let beatVisti = 0;
for (const [k, v] of Object.entries(tutto)) { if (!v.beats) { guasti.push(`${k}: cerimonia non partita (cieco)`); continue; }
  for (const [b, x] of Object.entries(v.perBeat)) { const w = x.peggio; if (!w) { guasti.push(`${k} ${b}: nessun fotogramma del mister (cieco)`); continue; } beatVisti++;
    if (w.oltre > 0.02) guasti.push(`${k} ${b}: mano oltre la mediana di ${w.oltre.toFixed(3)}`);
    if (w.dentro > 0) guasti.push(`${k} ${b}: avambraccio dentro il busto (${w.dentro})`);
    if (w.mani < 0.04) guasti.push(`${k} ${b}: mani compenetrate (${w.mani.toFixed(3)})`);
    if (w.gomMin != null && (w.gomMin < 30 || w.gomMax > 181)) guasti.push(`${k} ${b}: gomito fuori limite ${w.gomMin}°-${w.gomMax}°`); } }
console.log(`\n${beatVisti} beat misurati · ${guasti.length} fuori dai limiti anatomici`);
guasti.slice(0, 12).forEach(g => console.log('  ✗ ' + g));
if (ROSSO) { const ok = guasti.length > 0; console.log(ok ? '✅ il rosso si vede (braccia fuori dai limiti col vecchio sistema)' : '❌ rosso CIECO: il vecchio sistema passerebbe'); process.exit(ok ? 0 : 1); }
console.log(guasti.length ? '❌ mister-77 ROSSO' : '✅ mister-77 verde: braccia del mister nei limiti anatomici in ogni festa'); process.exit(guasti.length ? 1 : 0);
await b.close(); srv.close();
