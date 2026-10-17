#!/usr/bin/env node
/* [giro 31 PO-220 «Correggi tutto in un giro»] GUARDIANO delle chiusure difensive dell'eroe nel 3D, sulle STESSE metriche del collaudo
   docs/collaudi/RAPPORTO-difesa-220.md. Riusa la sonda del collaudo (collaudo-difesa-220-3d.mjs): partite vere dal salvataggio S12,
   autoplay seedato, GLB ACCESO, una scena difensiva ogni OGNI minuti (__CPM_DIF220_OGNI), tempo di scena REALE (__CPM_DTREAL) e una
   pagina nuova per partita. Due bracci in parallelo sugli stessi semi:
     VERDE  = gioco com'e';
     ROSSO  = __CPM_NO_POSTO31 + __CPM_NO_TIENI31 + __CPM_NO_ARRIVO31 (comportamento della 7.999.170).
   Misure per braccio (scene con contatto del gesto): distanza eroe-portatore DICHIARATA dal motore all'apertura · eroe-portatore
   all'inizio del risultato · eroe-portatore e eroe-pallone al contatto · casi (A) · casi (B) forti e pallone di nessuno a +2 s ·
   «ritorno indietro» dell'eroe. Soglie (VERDE): mediana eroe-portatore all'apertura <= 3,0 u e entro 1,5 u dalla dichiarata;
   mediana eroe-portatore al contatto <= 3,0 u; (A) <= 45%; (B) forti <= 15%; pallone di nessuno a +2 s <= 25%; ritorno <= 25%.
   (Misurato al giro 31 sui semi 21-26: prima 90% · 24% · 62% · 85%, dopo 26% · 5% · 5% · 0%.)
   ROSSO: deve violarne almeno tre (la prova che il guardiano vede). Pavimento di copertura: >= 8 scene giudicabili per braccio,
   altrimenti esce != 0 dichiarandosi CIECO. Uso: node difesa-220-giro31.mjs  (K=31,32,33,34 OGNI=6 per cambiare semi/densita').
   Durata: quattro partite per braccio, i bracci in parallelo: ~22 minuti. «Ritorno» senza nessuna scena con escursione >= 1,5 u
   (l'eroe parte gia' sull'uomo e non si allontana) non e' una violazione: non c'e' niente da cui tornare. */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const HERE = path.dirname(new URL(import.meta.url).pathname);
const K = process.env.K || '31,32,33,34'; const OGNI = process.env.OGNI || '6';
const ROSSI = '__CPM_NO_POSTO31,__CPM_NO_TIENI31,__CPM_NO_ARRIVO31';
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'd220g31-'));
const corsa = (nome, rosso) => new Promise(res => { const out = path.join(dir, nome + '.jsonl');
  const env = { ...process.env, DTREAL: '1', MODE: 'flow', K, OGNI, OUT: out, ROSSO: rosso ? ROSSI : '', MAXSEC: process.env.MAXSEC || '420',
    CPM_CHROME: process.env.CPM_CHROME || '/opt/pw-browsers/chromium', PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers' };
  if (process.env.FOTO) env.FOTO = path.join(process.env.FOTO, nome); else delete env.FOTO;
  const ch = spawn(process.execPath, [path.join(HERE, 'collaudo-difesa-220-3d.mjs')], { env, cwd: HERE }); let log = '';
  ch.stdout.on('data', d => { log += d; }); ch.stderr.on('data', d => { log += d; });
  ch.on('close', () => res({ out, log })); });
const [V, R] = await Promise.all([corsa('verde', false), corsa('rosso', true)]);
const analisi = (f) => { if (!fs.existsSync(f)) return [];
  const r = spawnSync(process.execPath, [path.join(HERE, 'collaudo-difesa-220-3d.mjs')], { env: { ...process.env, ANALIZZA: f }, encoding: 'utf8', maxBuffer: 64e6 });
  return r.stdout.split('\n').filter(Boolean).map(s => { try { return JSON.parse(s); } catch { return null; } }).filter(a => a && !a.errore && a.contatto); };
const med = (a) => { const b = a.filter(x => x != null && isFinite(x)).sort((x, y) => x - y); return b.length ? b[Math.floor(b.length / 2)] : null; };
const pct = (n, d) => d ? Math.round(100 * n / d) : null;
const misura = (A) => { const comp = A.filter(a => a.esitoCompleto); const rit = A.filter(a => a.ritorno != null);
  return { scene: A.length, complete: comp.length,
    dDichiarata: med(A.map(a => a.dDecl)), dApertura: med(A.map(a => a.dHeroPortRes)), dContattoPort: med(A.map(a => a.dHeroPortC)), dContattoPalla: med(A.map(a => a.dHeroPalC)),
    A: pct(A.filter(a => a.A.length).length, A.length), Bforte: pct(A.filter(a => a.Bforte).length, A.length), nessuno2s: pct(A.filter(a => a.Bindet).length, A.length),
    recuperateNostre2s: (() => { const r = comp.filter(a => a.ok === true); return r.length ? `${r.filter(a => a.esito3D === 'nostro').length}/${r.length}` : '0/0'; })(),
    fallileLoro2s: (() => { const r = comp.filter(a => a.ok === false); return r.length ? `${r.filter(a => a.esito3D === 'loro').length}/${r.length}` : '0/0'; })(),
    ritorno: pct(rit.filter(a => a.ritorno).length, rit.length), ritornoN: `${rit.filter(a => a.ritorno).length}/${rit.length}` }; };
const mv = misura(analisi(V.out)), mr = misura(analisi(R.out));
console.log('VERDE ' + JSON.stringify(mv)); console.log('ROSSO ' + JSON.stringify(mr));
const viola = (m) => { const v = [];
  if (m.dApertura == null || m.dApertura > 3.0) v.push(`apertura ${m.dApertura} u > 3`);
  if (m.dApertura != null && m.dDichiarata != null && Math.abs(m.dApertura - m.dDichiarata) > 1.5) v.push(`apertura ${m.dApertura} lontana dalla dichiarata ${m.dDichiarata}`);
  if (m.dContattoPort == null || m.dContattoPort > 3.0) v.push(`contatto ${m.dContattoPort} u > 3`);
  if (m.A > 45) v.push(`(A) ${m.A}% > 45`); if (m.Bforte > 15) v.push(`(B) forti ${m.Bforte}% > 15`);
  if (m.nessuno2s > 25) v.push(`pallone di nessuno ${m.nessuno2s}% > 25`); if (m.ritorno != null && m.ritorno > 25) v.push(`ritorno ${m.ritorno}% > 25 (${m.ritornoN})`);
  return v; };
const vv = viola(mv), vr = viola(mr); let ok = true;
if (mv.scene < 8 || mr.scene < 8) { console.log(`CIECO: copertura insufficiente (verde ${mv.scene}, rosso ${mr.scene} scene con contatto; servono >= 8)`); console.log(V.log.slice(-600)); ok = false; }
if (vv.length) { console.log('VERDE VIOLA: ' + vv.join(' · ')); ok = false; }
if (vr.length < 3) { console.log('ROSSO NON SI DISTINGUE (viola solo ' + vr.length + ' soglie: ' + vr.join(' · ') + ')'); ok = false; } else console.log('ROSSO viola come atteso: ' + vr.join(' · '));
console.log(ok ? '✅ difesa-220-giro31 VERDE' : '❌ difesa-220-giro31 ROSSO'); process.exit(ok ? 0 : 1);
