#!/usr/bin/env node
/* [giro 249 PO-496 seguito, decisione PO 17/11 «Senza premio tira un compagno»] GUARDIANO DEL RIGORISTA.
   Il giro 238 ha misurato che l'eroe vinceva sempre la scelta del battitore del rigore (ruolo «AT» + 6): il premio del patto «il
   rigorista sei tu» non cambiava nulla. Ora senza premio il rigore lo batte il compagno piu' adatto, con il premio l'eroe.
   A · MOTORE (sonda-rigorista-249, 20 partite, brainLive, richiesta dei piazzati accesa come nel live, K=1: ogni fallo in area e'
       rigore, per avere campioni; la regola del battitore e' la stessa del gioco). Rigori «dell'eroe» = battute dell'eroe + occasioni
       di scena da rigore offerte all'eroe (nel live diventano la sua scena interattiva).
       VERDE: senza premio 0 rigori dell'eroe su >= 5 rigori; con premio rigori dell'eroe = rigori della squadra (>= 5).
       ROSSO __CPM_NO_G249: senza premio i rigori sono dell'eroe (= rigori della squadra, >= 5): il premio non cambia nulla.
   B · PARTITA VERA (sonda-rigore-139: salvataggio S12, «r187d-11» seme 12, K=1, produzione; rigore della squadra al 59').
       VERDE senza premio: almeno un rigore della squadra, ognuno con la scena di sola visione del compagno (testimone __CPM_RIG249),
         racconto in pagina in gioco fluido con «<nome> sul dischetto» e l'esito scritto uguale al motore, battitore 3D = compagno, e
         nessun rigore dell'eroe (ne' battuta ne' scena giocata).
       VERDE con premio (premiPatto227.rig = club del salvataggio): almeno una scena del rigore giocata dall'eroe, nessuna scena del
         compagno.
       ROSSO __CPM_NO_G249 senza premio: il rigore e' dell'eroe (scena giocata) e nessuna scena del compagno.
   Meno campioni = NON GIUDICATO = rosso. Le tre partite girano insieme (~4-6 minuti). Verde e rosso stampati per ultimi. */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch } from './lib/harness.mjs';
import { misuraRigorista } from './sonda-rigorista-249.mjs';
const OUT = process.env.CPM_TMP || '/tmp';
const esiti = []; let ok = true;
const ESITO_TXT = { goal: 'GOOOL!', saved: 'PARATO!', blocked: 'PARATO!', wide: 'FUORI!', post: 'PALO!' };
const gioca = (nome, env) => new Promise((fine) => { const f = `${OUT}/rigorista-249-${nome}.json`; try { fs.unlinkSync(f); } catch (e) {}
  const p = spawn('node', ['sonda-rigore-139.mjs'], { env: { ...process.env, CPM_NOMI: 'r187d-11', CPM_SEMI: '12', CPM_K: '1', CPM_PROD: '1', CPM_OUT: f, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = ''; p.stdout.on('data', d => { log += d; }); p.stderr.on('data', d => { log += d; });
  p.on('close', () => { let J = null; try { J = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) {} fine({ nome, J, log }); }); });
const leggi = (r) => { const x = r.J && r.J.res && r.J.res[0]; if (!x || !(x.fine === 'ended' || x.fine === 'ceremony')) return null;
  const P = x.pen || []; const rig = P.filter(e => e.t === 'rigore' && e.per === 'home').length;
  const battEroe = P.filter(e => e.t === 'battuta' && e.eroe).length;
  let occ = -99; let scene = 0; for (const e of P) { if (e.t === 'occasione_eroe') occ = e.min; if (e.t === 'piazzato_giocato' && e.min - occ <= 6) scene++; }
  const comp = (x.rig249 || []).map(c => { const dom = (x.visDom || []).filter(q => q.min >= c.min - 1 && q.min <= c.min + 1); const esitoDom = (dom.find(q => q.esito) || {}).esito || null;
    const nomeDom = dom.some(q => c.nome && q.txt.indexOf(c.nome + ' sul dischetto') >= 0); const fasi = [...new Set(dom.map(q => q.ph))];
    return { ...c, esitoDom, nomeDom, fasi }; });
  const v3 = (x.vis3d || []).filter(q => q.f >= 1); const k3 = [...new Set(v3.map(q => q.kicker))];
  return { rig, battEroe, scene, comp, k3, errs: x.errs, score: x.score }; };

/* B · le tre partite in parallelo, mentre A gira nel processo principale */
const pB = Promise.all([gioca('senza', { CPM_SENZA_PREMIO: '1' }), gioca('con', {}), gioca('rosso', { CPM_SENZA_PREMIO: '1', CPM_ROSSO249: '1' })]);
/* A · motore */
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const A = {};
for (const braccio of ['verde', 'rosso']) { const page = await b.newPage(); await installCdnRoutes(page);
  if (braccio === 'rosso') await page.addInitScript(() => { window.__CPM_NO_G249 = 1; });
  await openMatch(page, port, { skipLoadAll: true, name: 'Rigorista249' });
  await page.waitForFunction(() => typeof creaMotorePossesso === 'function', null, { timeout: 60000 });
  A[braccio] = await misuraRigorista(page, 20, 1); await page.close(); }
await b.close(); srv.close();
const eroe = (T) => T.penEroe + T.occScena;
console.log('A ' + JSON.stringify(A));
{ const s = A.verde.senza, c = A.verde.con; const pass = s.pen >= 5 && eroe(s) === 0 && c.pen >= 5 && eroe(c) === c.pen;
  esiti.push(`${pass ? '✅' : '❌'} A verde (motore, 20 partite): senza premio rigori dell'eroe ${eroe(s)}/${s.pen} (battitori ${JSON.stringify(s.battitori)}) · con premio ${eroe(c)}/${c.pen}`); ok = ok && pass; }
{ const s = A.rosso.senza; const pass = s.pen >= 5 && eroe(s) === s.pen;
  esiti.push(`${pass ? '✅' : '❌'} A rosso __CPM_NO_G249: senza premio rigori dell'eroe ${eroe(s)}/${s.pen} (il premio non cambia nulla)`); ok = ok && pass; }
const [rs, rc, rr] = await pB; const S = leggi(rs), C = leggi(rc), R = leggi(rr);
console.log('B senza ' + JSON.stringify(S)); console.log('B con ' + JSON.stringify(C)); console.log('B rosso ' + JSON.stringify(R));
{ const pass = !!S && S.errs === 0 && S.rig >= 1 && S.comp.length >= S.rig && S.comp.every(q => q.nomeDom && q.esitoDom === ESITO_TXT[q.esito] && q.fasi.length === 1 && q.fasi[0] === 'playing') && S.k3.length === 1 && S.k3[0] === 'compagno' && S.battEroe === 0 && S.scene === 0;
  esiti.push(`${pass ? '✅' : '❌'} B verde senza premio: ${S ? `rigori della squadra ${S.rig} · scene del compagno ${S.comp.map(q => `${q.min}' ${q.nome} ${q.esito} -> «${q.esitoDom}» nome in pagina ${q.nomeDom ? 'si' : 'NO'} fasi ${q.fasi.join('/')}`).join(' | ') || '0'} · battitore 3D ${S.k3.join('/') || '—'} · rigori dell'eroe: battute ${S.battEroe}, scene ${S.scene}` : 'NON GIUDICATO (partita non finita)'}`); ok = ok && pass; }
{ const pass = !!C && C.errs === 0 && C.scene >= 1 && C.comp.length === 0;
  esiti.push(`${pass ? '✅' : '❌'} B verde con premio: ${C ? `rigori ${C.rig} · scene del rigore dell'eroe ${C.scene} · scene del compagno ${C.comp.length}` : 'NON GIUDICATO'}`); ok = ok && pass; }
{ const pass = !!R && R.scene >= 1 && R.comp.length === 0;
  esiti.push(`${pass ? '✅' : '❌'} B rosso __CPM_NO_G249 senza premio: ${R ? `scene del rigore dell'eroe ${R.scene} · scene del compagno ${R.comp.length}` : 'NON GIUDICATO'}`); ok = ok && pass; }
if (!ok) for (const q of [rs, rc, rr]) if (!q.J) console.log(`--- ${q.nome} (nessun json) ---\n${q.log.slice(-1500)}`);
for (const e of esiti) console.log(e);
console.log(ok ? '✅ rigorista-249 verde (e il rosso si vede)' : '❌ rigorista-249 rosso');
process.exit(ok ? 0 : 1);
