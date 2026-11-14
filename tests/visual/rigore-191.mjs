#!/usr/bin/env node
/* [giro 191 PO-399] GUARDIANO: LO STESSO RIGORE DELL'EROE NON SI CALCIA DUE VOLTE QUANDO LA SCENA ARRIVA DALLA SCENA PROGRAMMATA.
   Caso di partenza (giro 187, sonda-rigore-139): «r187d-11», seme d'autoplay 12, salvataggio 190, RIG190_K=1 — rigore offerto al 58',
   fatto corrente al 59' ma non inserito (tetto delle scene), il motore lo calcia fra il 59' e il 60' (in produzione un compagno), e al
   60' la scena programmata («motore-occasione») apre il rigore dell'eroe: due calci dello stesso rigore.
   Il guardiano gioca la partita vera con sonda-rigore-139 (nessuno stato scritto nel motore: il rigore lo concede un fallo in area) e
   legge la misura `dopo191` (scena del rigore dell'eroe con il motore che aveva gia' battuto quel rigore) e i doppi del giro 139.
     VERDE produzione (CPM_PROD: il rigore fuori scena lo batte un compagno) e VERDE banco del 139 (l'eroe batte anche nel motore):
           r187d-11 giudicata, dopo191 = 0, doppi = 0, almeno una battuta dell'eroe in scena (il rigore si gioca, non sparisce).
     ROSSO __CPM_NO_G191A (produzione): dopo191 >= 1 — il difetto si deve vedere, altrimenti «rosso non visto» = rosso.
   Le tre partite girano insieme (tre processi), circa 4-5 minuti. */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const OUT = process.env.CPM_TMP || '/tmp';
const gioca = (nome, env) => new Promise((ok) => { const f = `${OUT}/rigore-191-${nome}.json`; try { fs.unlinkSync(f); } catch (e) {}
  const p = spawn('node', ['sonda-rigore-139.mjs'], { env: { ...process.env, CPM_NOMI: 'r187d-11', CPM_SEMI: '12', CPM_K: '1', CPM_OUT: f, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = ''; p.stdout.on('data', d => { log += d; }); p.stderr.on('data', d => { log += d; });
  p.on('close', () => { let J = null; try { J = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) {} ok({ nome, J, log }); }); });
const [vp, vb, rp] = await Promise.all([gioca('verde-prod', { CPM_PROD: '1' }), gioca('verde-banco', {}), gioca('rosso-prod', { CPM_PROD: '1', CPM_ROSSO191: '1' })]);
const riga = (r) => { const S = r.J && r.J.S; const P = (r.J && r.J.res && r.J.res[0] && r.J.res[0].pen) || [];
  return { S, pen: P.map(e => e.min + "'" + e.t + (e.eroe ? '*' : '') + (e.fermo ? '[' + e.fermo + ']' : '')).join(' '),
    scena: P.filter(e => e.t === 'piazzato_giocato').length }; };
let ok = true; const esiti = [];
for (const r of [vp, vb]) { const x = riga(r); console.log(`${r.nome}: ${JSON.stringify(x.S && { giudicate: x.S.giudicate, dopo191: x.S.dopo191, doppi: x.S.doppi, battuteEroe: x.S.battuteEroe })}\n   ${x.pen}`);
  const pass = !!(x.S && x.S.giudicate === 1 && x.S.dopo191 === 0 && x.S.doppi === 0 && x.scena >= 1);
  esiti.push(`${pass ? '✅' : '❌'} ${r.nome}: ${pass ? 'un rigore, un calcio, giocato in scena' : 'NON verde (o non giudicato)'}`); ok = ok && pass; }
{ const x = riga(rp); console.log(`${rp.nome}: ${JSON.stringify(x.S && { giudicate: x.S.giudicate, dopo191: x.S.dopo191, doppi: x.S.doppi })}\n   ${x.pen}`);
  const visto = !!(x.S && x.S.giudicate === 1 && x.S.dopo191 >= 1);
  esiti.push(`${visto ? '✅' : '❌'} rosso __CPM_NO_G191A: ${visto ? 'la scena ricalcia il rigore gia\' battuto (il difetto si vede)' : 'rosso NON visto'}`); ok = ok && visto; }
for (const e of esiti) console.log(e);
if (!ok) for (const r of [vp, vb, rp]) if (!r.J) console.log(`--- ${r.nome} (nessun json) ---\n${r.log.slice(-1500)}`);
console.log(ok ? '✅ rigore-191 verde (e il rosso si vede)' : '❌ rigore-191 rosso');
process.exit(ok ? 0 : 1);
