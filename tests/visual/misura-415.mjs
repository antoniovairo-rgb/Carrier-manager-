#!/usr/bin/env node
/* [giro 415, PO-679] SONDA (non guardiano): «Cross a rientrare» dalla fascia, assist riuscito, il compagno segna.
   GLB ACCESO, teatro acceso (apri() di misura-364). Per ogni scena costruita dal motore (scenaDalMotoreFascia) x seme:
   - orientamento del finalizzatore rispetto alla porta durante il gesto di conclusione (testimone __CPM_FIN415): angolo fra il
     davanti del corpo DISEGNATO (spalle e anche) e la direzione della porta, al primo fotogramma del gesto, al contatto (pallone che
     riparte) e massimo nel gesto; anche la rotazione della mesh logica;
   - salto della camera fuori dallo stacco (metriche di misura-364: passo > 40*dt + 2 u).
   Uso: node misura-415.mjs · CPM_ROSSO=__CPM_NO_G415 · CPM_SEMI=3,7,11 · CPM_OUT=file.json */
import fs from 'node:fs';
import { startServer, launchBrowser } from './lib/harness.mjs';
import { apri, gioca, metriche } from './misura-364.mjs';

const ROSSO = (process.env.CPM_ROSSO || '').split(',').filter(Boolean);
/* scene del motore che offrono «Cross a rientrare» (enumerate sui semi 1-120): due lati, due pressioni */
export const SCENE415 = [[[72, 84, 1.2], 1], [[72, 84, 1.2], 4], [[72, 84, 1.2], 13], [[72, 84, 1.2], 19], [[72, 16, 1.2], 2], [[72, 16, 1.2], 17], [[72, 16, 1.2], 23], [[72, 16, 1.2], 41], [[78, 82, 0.6], 3], [[78, 82, 0.6], 7], [[78, 82, 0.6], 11], [[78, 82, 0.6], 15]]
  .slice(0, +(process.env.CPM_MAX || 99));
const OUT = process.env.CPM_OUT || 'out/misura-415.json';
const deg = r => r == null ? null : Math.abs(((r * 180 / Math.PI) % 360 + 540) % 360 - 180);

/* angoli (gradi) fra il davanti e la porta, fotogramma per fotogramma; il «contatto» e' il fotogramma in cui il pallone riparte dal corpo */
export function orient(W) {
  if (!W || !W.length) return null;
  const k = W[0].k; const G = W.filter(w => w.k === k && w.g === 'kick'); if (!G.length) return { g: W[0].g, nonKick: 1 };
  const a = G.map(w => ({ c: w.c, sh: deg(w.sh != null ? w.sh - w.gy : null), hp: deg(w.hp != null ? w.hp - w.gy : null), ry: deg(w.ry - w.gy), d: Math.hypot(w.bx - w.x, w.bz - w.z), gt: w.gt }));
  /* corpo = media fra spalle e anche (le due linee ruotano insieme in un calcio vero) */
  for (const f of a) f.co = (f.sh != null && f.hp != null) ? (f.sh + f.hp) / 2 : (f.sh ?? f.hp);
  let iC = a.findIndex((f, i) => i > 0 && f.d > a[i - 1].d + 0.15 && f.d > 0.9); if (iC < 0) iC = Math.min(a.length - 1, Math.floor(a.length / 2));
  return { n: a.length, inizio: +a[0].co.toFixed(0), contatto: +a[iC].co.toFixed(0), contattoRy: +a[iC].ry.toFixed(0), max: +Math.max(...a.map(f => f.co)).toFixed(0), tC: +(a[iC].c - a[0].c).toFixed(2), x: G[0].x, z: G[0].z };
}

/* passo piu' lungo della camera fra due fotogrammi fuori dallo stacco, col tempo di scena (dichiarativo: il giudizio e' saltoCam) */
export function camMax(run) { const F = run.F || []; let b = null;
  for (let i = 1; i < F.length; i++) { const a = F[i - 1], c = F[i]; if (a.cut || c.cut || a.sk !== c.sk) continue; const dt = c.ck - a.ck; if (!(dt > 0)) continue;
    const d = Math.hypot(c.c[0] - a.c[0], c.c[1] - a.c[1], c.c[2] - a.c[2]); if (!b || d > b.d) b = { d: +d.toFixed(2), v: +(d / dt).toFixed(0), a: +c.ck.toFixed(2) }; } return b; }
export async function giocaCutback(pg, sc) {
  /* l'azione «Cross a rientrare» si cerca per testo: compare solo con la variante del giro 17 attiva e la scena la offre a seme */
  const az = await pg.evaluate(([sc]) => { const s = scenaDalMotoreFascia({ tipo: 'fascia', x: sc.occ[0], y: sc.occ[1], press: sc.occ[2], liberi: 2, cast: { ricevente: { nome: 'Rossi' }, difensore: { nome: 'Knapp' } } }, { name: 'Fasce364', stats: { tiro: 70, tecnica: 70, passaggio: 70, dribbling: 70, velocità: 70, fisico: 70 }, ovr: 70 }, sc.seme); return s ? s.actions.map(a => a.label || a.l || a.text) : null; }, [sc]);
  if (!az) return { err: 'scena non costruita' };
  const k = az.findIndex(t => /cross a rientrare/i.test(t || '')); if (k < 0) return { err: 'nessun «Cross a rientrare»', az };
  await pg.evaluate(() => { window.__CPM_FIN415 = []; });
  const run = await gioca(pg, sc, k, 'success', { kind: 'goal' });
  run.W = await pg.evaluate(() => (window.__CPM_FIN415 || []).slice());
  return run;
}

async function main() {
  const server = await startServer(); const port = server.address().port; const b = await launchBrowser();
  let pg = await apri(b, port, ROSSO); const R = []; let n = 0;
  console.log(`misura-415${ROSSO.length ? ' [ROSSO ' + ROSSO.join(',') + ']' : ''}`);
  for (const [p, seme] of SCENE415) {
    const sc = { occ: p, seme };
    if (n && n % 5 === 0) { await pg.close(); pg = await apri(b, port, ROSSO); }
    let run; try { run = await giocaCutback(pg, sc); } catch (e) { run = { err: String(e && e.message).slice(0, 100) }; try { await pg.close(); } catch (_e) { } pg = await apri(b, port, ROSSO); }
    if (run.err && /nessun/.test(run.err)) { continue; } n++;
    if (run.err) { console.log(`  (${p}) s${seme}: ${run.err}`); R.push({ p, seme, err: run.err }); continue; }
    const m = metriche(run), o = orient(run.W); m.camMax = camMax(run);
    R.push({ p, seme, m: { ht: m.ht, hv: m.hv, kd: m.kd, inRete: m.inRete, saltoCam: m.saltoCam, camMax: m.camMax, cieco: m.cieco }, o, W: process.env.CPM_GREZZO ? run.W : undefined });
    console.log(`  (${p}) s${seme}: ${m.cieco || `${m.ht}/${m.hv} ${m.kd} rete ${m.inRete}`} | finalizzatore ${o ? (o.nonKick ? 'gesto ' + o.g : `a x ${o.x} z ${o.z}: inizio ${o.inizio}° contatto ${o.contatto}° (mesh ${o.contattoRy}°) max ${o.max}° [${o.n} fot.]`) : 'NESSUN GESTO'} | camera ${m.saltoCam ? `salto ${m.saltoCam.d} u/${Math.round(m.saltoCam.dt * 1000)} ms a ${m.saltoCam.a}s` : 'ok'} (passo max ${m.camMax ? m.camMax.d + ' u a ' + m.camMax.v + ' u/s di scena, ' + m.camMax.a + 's' : '-'})`);
  }
  const _o = new URL(OUT, import.meta.url).pathname; fs.mkdirSync(new URL('out/', import.meta.url).pathname, { recursive: true }); fs.writeFileSync(OUT.startsWith('/') ? OUT : _o, JSON.stringify(R));
  await b.close(); server.close();
}
if (import.meta.url === `file://${process.argv[1]}`) main().catch(e => { console.error(e); process.exit(1); });
