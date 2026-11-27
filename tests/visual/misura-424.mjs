#!/usr/bin/env node
/* [giro 424, PO-653 «quando l'eroe fa un passaggio ad un compagno, in particolare tentativi di assist, quest'ultimo non e' gia' nella
   scena!»] SONDA DI MISURA (non guardiano). GLB ACCESO, teatro acceso (__CPM_PRESENT + __CPM_CINE), pagina nuova ogni CPM_PER scene.
   Tutto dal testimone __CPM_F364 (src/12, corpi e camera DISEGNATA nello stesso fotogramma). Per ogni scena di passaggio/assist
   dell'eroe x azione di passaggio: chi riceve (passTargetMesh al primo fotogramma dopo la scelta in cui esiste), dove stava
   nell'ultimo fotogramma della lettura (hl_choose), se era nel quadro, quota della lettura con lui nel quadro, quanto corre fra la
   lettura e l'armo del passaggio, distanza dall'eroe.
   Uso: node misura-424.mjs · CPM_ROSSO=__CPM_NO_G424 · CPM_MAX=n · CPM_OUT=file.json · CPM_SOLO=i,j */
import fs from 'node:fs';
import { startServer, launchBrowser } from './lib/harness.mjs';
import { apri, gioca } from './misura-364.mjs';

const ROSSO = (process.env.CPM_ROSSO || '').split(',').filter(Boolean);
const MAX = +(process.env.CPM_MAX || 0), PER = +(process.env.CPM_PER || 6), OUT = process.env.CPM_OUT || 'out/misura-424.json';
const SOLO = (process.env.CPM_SOLO || '').split(',').filter(Boolean).map(Number);
export const RE_PASS = /passaggio|passa|filtrant|assist|appoggi|scarico|scarica|servi|uno-due|dai e vai|sponda|imbucat|verticalizz|lancio|tocco per|triangol|cambio di gioco|palla (al|a|per|in)/i;

export async function catalogo(pg) {
  return pg.evaluate((src) => { const re = new RegExp(src, 'i'); const o = [];
    SITUATIONS.forEach((s, i) => { if (s.type === 'def' || !s.startZone) return; (s.actions || []).forEach((a, k) => { const l = a.label || a.l || a.text || '';
      const rw = a.reward || a.rew; if (rw === 'assist' || re.test(l)) o.push({ gi: i, k, l, rw, t: s.text }); }); }); return o; }, RE_PASS.source);
}

export function metriche424(run) {
  let F = run.F, n0 = run.nScelta; if (!F || F.length < 10) return { cieco: 'pochi fotogrammi (' + (F ? F.length : 0) + ')' };
  { let i0 = 0; for (let i = 1; i < n0; i++) if (F[i].ck < F[i - 1].ck) i0 = i; F = F.slice(i0); n0 -= i0; }
  const pre = F.slice(0, n0).filter(f => f.ph === 'hl_choose'), post = F.slice(n0);
  if (!pre.length) return { cieco: 'nessun fotogramma di lettura' };
  const iA = post.findIndex(f => f.pr || f.cr), fA = iA >= 0 ? post[iA] : null;
  const ult = post[post.length - 1] || pre[pre.length - 1];
  const m = { ht: (fA || ult).ht, at: fA ? fA.at : null, kd: ult.kd, ok: ult.ok };
  if (!fA) { m.senzaRicevente = 1; return m; }
  const rx = (fA.hm || []).find(h => h[4]); if (!rx) { m.ricEroe = 1; return m; }/* passTargetMesh = eroe (uno-due di ritorno) o non della casa */
  const id = rx[0]; const ap = pre[pre.length - 1]; const ra = (ap.hm || []).find(h => h[0] === id);
  if (!ra) return { ...m, cieco: 'ricevente assente in lettura' };
  m.id = id; m.ric = { xA: ra[1], zA: ra[2], qA: ra[3], xArmo: rx[1], zArmo: rx[2] };
  m.corsa = +Math.hypot(rx[1] - ra[1], rx[2] - ra[2]).toFixed(2);
  m.dEroe = +Math.hypot(ra[1] - ap.h[0], ra[2] - ap.h[1]).toFixed(2);
  m.quotaQuadro = +(pre.filter(f => { const q = (f.hm || []).find(h => h[0] === id); return q && q[3]; }).length / pre.length).toFixed(2);
  m.nPre = pre.length; m.tArmo = +(fA.ck - (post[0] ? post[0].ck : fA.ck)).toFixed(2);
  return m;
}

async function main() {
  const server = await startServer(); const port = server.address().port; const b = await launchBrowser();
  let pg = await apri(b, port, ROSSO); let lista = await catalogo(pg);
  if (SOLO.length) lista = lista.filter(e => SOLO.includes(e.gi)); if (MAX) lista = lista.slice(0, MAX); if (process.env.CPM_DA) lista = lista.slice(+process.env.CPM_DA, +(process.env.CPM_A || 1e9));
  console.log(`misura-424${ROSSO.length ? ' [ROSSO ' + ROSSO.join(',') + ']' : ''}: ${lista.length} azioni di passaggio/assist`);
  const R = []; let n = 0;
  for (const e of lista) {
    if (n && n % PER === 0) { await pg.close().catch(() => {}); pg = await apri(b, port, ROSSO); } n++;
    let run; try { run = await gioca(pg, { gi: e.gi }, e.k, 'success', { letturaMs: 2500 }); } catch (er) { run = { err: String(er.message || er).slice(0, 120) }; }
    const m = run.err ? { cieco: run.err } : metriche424(run);
    R.push({ ...e, m }); const r = m.ric;
    console.log(`  gi${e.gi}/${e.k} «${String(e.l).slice(0, 34)}» ${m.cieco ? 'CIECO ' + m.cieco : m.senzaRicevente ? 'senza ricevente' : m.ricEroe ? 'ricevente=eroe' : `ric#${m.id} lettura (${r.xA},${r.zA}) quadro ${r.qA} quota ${m.quotaQuadro} · corsa fino all'armo ${m.corsa} u · dist eroe ${m.dEroe}`}`);
  }
  await pg.close().catch(() => {}); await b.close(); server.close();
  fs.mkdirSync('out', { recursive: true }); fs.writeFileSync(OUT, JSON.stringify(R, null, 1));
  const V = R.filter(r => r.m.ric), med = a => { const s = a.filter(x => x != null).sort((p, q) => p - q); return s.length ? s[Math.floor(s.length / 2)] : null; };
  const q = (a, f) => a.filter(f).length + '/' + a.length;
  console.log(`SINTESI: con ricevente ${V.length} · ciechi ${R.filter(r => r.m.cieco).length} · senza ricevente ${R.filter(r => r.m.senzaRicevente).length} · ricevente=eroe ${R.filter(r => r.m.ricEroe).length}`);
  console.log(`  fuori dal quadro a fine lettura ${q(V, r => !r.m.ric.qA)} · nel quadro per meno di meta' della lettura ${q(V, r => r.m.quotaQuadro < 0.5)} · corsa >6 u dopo la scelta ${q(V, r => r.m.corsa > 6)} · mediana corsa ${med(V.map(r => r.m.corsa))} · mediana quota ${med(V.map(r => r.m.quotaQuadro))}`);
}
if (import.meta.url === `file://${process.argv[1]}`) main().catch(e => { console.error(e); process.exit(1); });
