#!/usr/bin/env node
/* [giro 444 · PO-686 ter] SONDA DEI BAFFI: larghezza e spessore contro la figurina, sugli stessi punti del viso del giro 440
   (azimut/elevazione attorno al centro della testa; griglia GRIGLIA440, 1,5 gradi x 1 grado).
   Decisione PO 28/11 sulle foto del 440: «baffi troppo piccoli e sottili rispetto alla figurina (Quinn, Russell, Carr)».
   Metodo (MEZZA INTENSITA', la stessa definizione sui due lati, cosi' scala e contrasto diversi fra ritratto e 3D non contano):
     · scurimento per punto: figurina D = L*pelle delle guance - L* del punto; 3D D = L* senza barba - L* con barba (stesso fotogramma:
       e' il solo contributo dei baffi, l'ombra del naso della testa non conta).
     · nucleo = media di D su |az| <= 6, el -32..-30 (sotto il naso, sopra il labbro); soglia = meta' del nucleo.
     · LARGHEZZA: per ogni riga da -36 a -26, l'estensione continua da az 0 verso ciascun lato con D >= soglia; la larghezza e' il
       massimo fra le righe (sinistra + destra, gradi di azimut).
     · SPESSORE: per ogni colonna |az| <= 12, quante righe consecutive (da -38 a -24, partendo dal nucleo) hanno D >= soglia; mediana.
     · LABBRO: quota dei punti-labbro (texture della testa, misura del 440) coperti dai baffi con alfa >= 0,25 → «bocca» del 440.
   Uso: node misura-444.mjs [nomi...] · CPM_TOD=night|day · CPM_ROSSO=1 (__CPM_NO_G444 = baffi del 440) */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { scatta440, analizza440 } from './misura-440.mjs';
import { apriEPronti } from './misura-432.mjs';
import { preparaEtichette } from './misura-414.mjs';
import fs from 'node:fs';

const media = A => A.length ? A.reduce((s, v) => s + v, 0) / A.length : NaN;
const mediana = A => { const s = [...A].sort((a, b) => a - b); return s.length ? s[s.length >> 1] : NaN; };
/* figurina → testa 3D in elevazione: i due punti tarati del 440 (narici -25 della figurina = base del naso -29 della testa; rima -39 = -39) */
export const elFig2Testa = elF => -29 + (elF + 25) * (10 / 14);
export const SOGLIA_MIN444 = 6; /* L*: sotto questo scurimento non e' pelo (rumore e ombre della FIGURINA, misurato sulle guance) */
export const PAV3D444 = 2; /* L*: sul 3D la misura e' una differenza esatta (stesso fotogramma con e senza baffi, zero fuori dallo strato): il pavimento
   della figurina, applicato qui, valeva il 62% del nucleo sui baffi chiari (Gary Howard, nucleo 9,7) invece della meta' dichiarata */
/* M = Map 'az,el' → scurimento; righe = elenco delle elevazioni della zona, conv = elevazione → gradi della testa */
function lato444(M, AZ, righe, nucRighe, conv, pav = SOGLIA_MIN444) {
  const nuc = []; for (const az of AZ) if (Math.abs(az) >= 3 && Math.abs(az) <= 15) for (const el of nucRighe) { const v = M.get(az + ',' + el); if (v != null) nuc.push(v); }
  const n = media(nuc); const s = Math.max(pav, n / 2); if (!(n > pav)) return { nucleo: +(n || 0).toFixed(1), soglia: s, larghezza: 0, spessore: 0 };
  let larg = 0;
  for (const el of righe) { let w = 0;
    for (const seg of [AZ.filter(x => x >= 6), AZ.filter(x => x <= -6).reverse()]) { let last = 0; for (const az of seg) { const v = M.get(az + ',' + el); if (v != null && v >= s) last = Math.abs(az); else if (Math.abs(az) > 7.5) break; } w += last; }
    larg = Math.max(larg, w); }
  const sp = []; for (const az of AZ.filter(x => Math.abs(x) >= 6 && Math.abs(x) <= 14)) { let best = [], run = []; for (const el of righe) { const v = M.get(az + ',' + el); if (v != null && v >= s) { run.push(el); if (run.length > best.length) best = run.slice(); } else run = []; } sp.push(best.length ? Math.abs(conv(best[0]) - conv(best[best.length - 1])) + Math.abs(conv(righe[0]) - conv(righe[1])) : 0); }
  return { nucleo: +n.toFixed(1), soglia: +s.toFixed(1), larghezza: +larg.toFixed(1), spessore: +mediana(sp).toFixed(1) };
}
/* LARGHEZZA: per riga, estensione continua da |az| 6 verso ciascun lato (il filtro al centro puo' essere piu' chiaro) con D >= soglia;
   massimo fra le righe. SPESSORE: colonne 6 <= |az| <= 14, la corsa piu' lunga di righe con D >= soglia, in gradi DELLA TESTA; mediana.
   Soglia = meta' del nucleo (3 <= |az| <= 15, sotto il naso), mai sotto 6 L*. Righe: figurina -25,5..-38 (narici escluse), testa
   -28..-38 (il volo dei peli scende di 1-2 gradi). */
export function baffi444(a) {
  const P = a.punti; const F = new Map(), R = new Map();
  /* figurina: riferimento = pelle della STESSA riga e dello STESSO lato (mediana di L* a 33-42 gradi): toglie la luce di lato del ritratto
     (Aaron Lane: meta' viso 20 L* piu' chiara) e le ombre della mascella (Dylan Gray), che facevano «baffi» larghi 130 gradi */
  const rif = new Map(); for (const p of P) if (p.f && Math.abs(p.az) >= 33 && Math.abs(p.az) <= 42) { const k = Math.sign(p.az) + ',' + p.el; if (!rif.has(k)) rif.set(k, []); rif.get(k).push(p.f[0]); }
  for (const p of P) { const k = p.az + ',' + p.el; const rr = rif.get(Math.sign(p.az || 1) + ',' + p.el); if (p.f && rr) F.set(k, mediana(rr) - p.f[0]); if (p.r && p.r0) R.set(k, p.r0[0] - p.r[0]); }
  const AZ = [...new Set(P.map(p => p.az))].sort((x, y) => x - y);
  const rF = []; for (let el = -26; el >= -38; el--) rF.push(el); const rR = []; for (let el = -28; el >= -38; el--) rR.push(el);
  return { fig: lato444(F, AZ, rF, [-26, -27, -28, -29], elFig2Testa), d3: lato444(R, AZ, rR, [-30, -31, -32], e => e, PAV3D444) };
}

export async function misura444(b, port, flags, tod, nomi) {
  const { ctx, p, ok, err } = await apriEPronti(b, port, flags, tod);
  if (!ok) { await ctx.close(); return { giudicato: false, motivo: 'ingresso non raggiunto', err }; }
  await preparaEtichette(p);
  const tutti = await p.evaluate(() => { const S = window.__CPM3D.scene, o = []; S.traverseVisible(x => { const c = x.userData && x.userData.chi240; if (c && c.nome) o.push(c.nome); }); return o; });
  const righe = [];
  /* scatto di riscaldamento, scartato: il PRIMO primo piano della pagina usciva a volte senza i baffi (Dylan Gray, primo dei 22: nucleo 3,9
     contro 11,6-11,9 di tre scatti ripetuti sulla stessa pagina). Misurato, non spiegato: dichiarato nel rapporto del giro 444. */
  if (tutti.length) await scatta440(p, tutti[0]).catch(() => null);
  for (const n of (nomi && nomi.length ? nomi : tutti)) {
    const s = await scatta440(p, n); if (!s) { righe.push({ nome: n, giudicato: false }); continue; }
    const tipo = s.tipo440 || s.bar; if (!/baffi/.test(tipo || '')) { righe.push({ nome: n, b: s.b, tipo, senza: true }); continue; }
    const a = analizza440(s); const m = baffi444(a);
    righe.push({ nome: n, b: s.b, tipo, giudicato: !!(a.bocca != null && m.fig.nucleo > 2), bocca: a.bocca, dEc: a.dEc, sdR: a.sdR, ...m });
  }
  await ctx.close(); return { giudicato: true, righe, err };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const TOD = process.env.CPM_TOD || 'night'; fs.mkdirSync('out/g444', { recursive: true });
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  const r = await misura444(b, port, process.env.CPM_ROSSO ? ['__CPM_NO_G444'] : [], TOD, process.argv.slice(2));
  await b.close(); srv.close();
  fs.writeFileSync(`out/g444/misura-444-${TOD}${process.env.CPM_ROSSO ? '-rosso' : ''}.json`, JSON.stringify(r, null, 1));
  if (!r.giudicato) { console.log('NON GIUDICATO', r.motivo); process.exit(1); }
  console.log('nome | tipo | larghezza fig / 3D | spessore fig / 3D | nucleo fig / 3D | labbra visibili | colore | sd');
  for (const x of r.righe) if (!x.senza) console.log([x.nome, x.tipo, `${x.fig.larghezza} / ${x.d3.larghezza}`, `${x.fig.spessore} / ${x.d3.spessore}`, `${x.fig.nucleo} / ${x.d3.nucleo}`, x.bocca, x.dEc, x.sdR].join(' | '));
}
