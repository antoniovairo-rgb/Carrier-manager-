#!/usr/bin/env node
/* [giro 139] GUARDIANO: NESSUNA SECONDA BATTUTA DI RIGORE DELL'EROE ENTRO 5 MINUTI DA UN SUO RIGORE (npm run rigore-139).
   Difetto misurato con sonda-rigore-139 su 124 partite (docs/sviluppo/RAPPORTO-giro139.md): rigore all'88'-89' per la squadra
   dell'eroe, occasione d'eroe all'89'-90'; dal 90' il live spegne la richiesta dei piazzati dell'eroe e il motore calciava lui il
   rigore gia' offerto mentre la scena veniva inserita → battuta del motore (gol) + battuta in scena (gol). Correzione in src/14
   (_piaz27), rosso __CPM_NO_G139.
   N = 5 minuti: i doppi misurati distano 1 minuto (90' motore → 91' scena; giro 111: 77' → 78'); l'unica coppia di rigori distinti
   della squadra dell'eroe osservata nel campione dista 27 minuti.
   Due bracci, sulle stesse partite di carriera vere (salvataggio 190, nome+seme fissi ⇒ partita fissa, rigore CONCESSO DAL MOTORE da un
   fallo in area, __CPM_RIG190_K=1 per la sola frequenza):
     verde (4 partite, compresa la testimone «r187d-56», dal giro 187 provocata — vedi sotto): 0 doppi; GIUDICATO solo se ≥3 battute di rigore dell'eroe in tutto E la testimone
           ha davvero il rigore offerto dall'89' in poi — altrimenti «NON GIUDICATO» = rosso;
     rosso (testimone con __CPM_NO_G139): deve riprodurre il doppio, altrimenti «ROSSO NON VISTO» = rosso.
   Uscita 0 solo con verde giudicato pulito e rosso visto. ~8-9 minuti.
   [giro 187] Con la partita riproducibile (giri 175/187) le partite di prima non davano piu' il caso: «k1d-11» non aveva piu' il rigore
   all'89' e le quattro partite davano 2 battute. Criterio e minimi INVARIATI; cambiano le partite. Ricerca nel braccio rosso su 173 partite
   naturali (docs/sviluppo/RAPPORTO-giro187.md §3): un solo rigore offerto all'89' (r187d-25) e nessun doppio del meccanismo 139. Quindi,
   come vuole PROCESSO.md («cio' che il gioco non produce si provoca dalla sonda»), la TESTIMONE e' provocata: «r187d-56» seme 57, al
   minuto 89 del motore la sonda chiede un rigore per la squadra dell'eroe con l'eroe battitore (sonda-rigore-139 CPM_PROVOCA=89); offerta,
   attesa, scena e battuta seguono il gioco. Le altre tre partite sono naturali e una (r187d-25) ha il rigore offerto all'89' da sola. */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const N = 5, TESTE = 'r187d-56', SEME_TESTE = '57', PROVOCA = '89';
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rig139-'));
function corri(env, out) { return new Promise((res) => { const p = spawn(process.execPath, [new URL('./sonda-rigore-139.mjs', import.meta.url).pathname],
  { env: { ...process.env, CPM_K: '1', CPM_SPEED: '2', CPM_OUT: out, ...env }, stdio: ['ignore', 'pipe', 'pipe'] }); let log = '';
  p.stdout.on('data', d => { log += d; }); p.stderr.on('data', d => { log += d; }); p.on('close', c => res({ c, log })); }); }
const fv = path.join(dir, 'verde.json'), fr = path.join(dir, 'rosso.json');
const ft = path.join(dir, 'teste.json');
const [V, T, R] = await Promise.all([
  corri({ CPM_NOMI: 'r187d-25,r187d-40,r187a-22', CPM_SEMI: '26,41,23', CPM_PAR: '3' }, fv),
  corri({ CPM_NOMI: TESTE, CPM_SEMI: SEME_TESTE, CPM_PAR: '1', CPM_PROVOCA: PROVOCA }, ft),
  corri({ CPM_NOMI: TESTE, CPM_SEMI: SEME_TESTE, CPM_PAR: '1', CPM_ROSSO: '1', CPM_ROSSO191: '1', CPM_PROVOCA: PROVOCA }, fr)]);/* [giro 191] il rosso spegne anche __CPM_NO_G191A: dal giro 191 la scena che arriva dopo il calcio del motore non si apre piu', quindi il doppio del 139 si vede solo con entrambe le difese spente (misurato: con il solo rosso 139, 90' battuta* tiro* · 91' scena_negata191) */
const leggi = (f, r) => { try { return JSON.parse(fs.readFileSync(f)); } catch (e) { console.log(r.log.slice(-1500)); return null; } };
const dv0 = leggi(fv, V), dt = leggi(ft, T), dr = leggi(fr, R);
const dv = (dv0 && dt) ? { res: [...dt.res, ...dv0.res] } : null;
function battute(P) { const out = []; let occ = -99;
  for (const e of P) { if (e.t === 'occasione_eroe') occ = e.min; if (e.t === 'battuta' && e.eroe) out.push({ min: e.min, via: 'motore' });
    if (e.t === 'piazzato_giocato' && e.min - occ <= 6) out.push({ min: e.min, via: 'scena' }); } return out; }
function doppi(d) { const o = []; for (const r of (d ? d.res : [])) { const b = battute(r.pen || []); for (let i = 1; i < b.length; i++) if (b[i].min - b[i - 1].min <= N) o.push(`${r.nome}: ${b[i - 1].min}'${b[i - 1].via} + ${b[i].min}'${b[i].via}`); } return o; }
const err = []; const ok = (c, m) => { if (!c) err.push(m); console.log((c ? 'ok   ' : 'NO   ') + m); };
if (dv) for (const r of dv.res) console.log(`verde ${r.nome}: fine=${r.fine} errs=${r.errs} ` + (r.pen || []).map(e => e.min + "'" + e.t + (e.eroe ? '*' : '')).join(' '));
if (dr) for (const r of dr.res) console.log(`rosso ${r.nome}: fine=${r.fine} errs=${r.errs} ` + (r.pen || []).map(e => e.min + "'" + e.t + (e.eroe ? '*' : '')).join(' '));
const fin = d => !!d && d.res.every(r => r.fine === 'ended' || r.fine === 'ceremony');
const nb = dv ? dv.res.reduce((a, r) => a + battute(r.pen || []).length, 0) : 0;
const teste = dv && dv.res.find(r => r.nome === TESTE);
const caso = !!(teste && (teste.pen || []).some(e => e.t === 'occasione_eroe' && e.min >= 89));
const giud = fin(dv) && nb >= 3 && caso;
ok(giud, `verde GIUDICATO: partite finite ${fin(dv)}, battute di rigore dell'eroe ${nb} (minimo 3), testimone ${TESTE} col rigore offerto dall'89' ${caso}`);
const dV = doppi(dv); ok(giud && dV.length === 0, `verde: nessuna seconda battuta di rigore dell'eroe entro ${N}' (${dV.length} doppi${dV.length ? ': ' + dV.join(' | ') : ''})`);
ok(!!dv && dv.res.every(r => !r.errs), 'verde: nessun errore di pagina');
const dR = doppi(dr); ok(fin(dr) && dR.length >= 1, `rosso (__CPM_NO_G139) VISTO: il doppio si riproduce (${dR.length}${dR.length ? ': ' + dR.join(' | ') : ''})`);
console.log(err.length ? `\nrigore-139: FALLITO (${err.length})` : '\nrigore-139: VERDE (verde giudicato pulito, rosso visto)');
process.exit(err.length ? 1 : 0);
