#!/usr/bin/env node
/* [PO-252/5 giro 22] GUARDIANO: IL PORTIERE PARTE IN TEMPO E DALLA PARTE GIUSTA (codici 111/112; banco PO-248 difetto #5: 8 portieri su
   43 — punizione 4/11, cross 2/3, testa 1/7, volee 1/12). Criterio IDENTICO al banco (funzione analizzaPortiere copiata da
   banco-highlight-248.mjs, che a sua volta e' quello di gk-miss-229): tempo di SCENA, testimone __CPM_GK229, bruciapelo < 0,20 s non
   giudicato. GLB acceso, pagina nuova per scena. Uso: node portiere-252.mjs [--verbose]  (CPM_SOLO=verde|rosso)
   Verde: nessun portiere «tardi» o «verso opposto» nel braccio verde; rosso __CPM_NO_GK252: almeno 1 difetto (intermittente).                       */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { pagina252, scena252, kDi } from './lib/scena-252.mjs';
const S = { GK_TARDI: 0.05, GK_REAZ: 0.20, GK_PORTATA: 4.5 };
const CASI = [[13, 'fail', null], [13, 'fail', 'saved'], [15, 'fail', null], [15, 'fail', 'saved'], [16, 'fail', 'intercepted'], [67, 'success', null], [1, 'fail', 'saved'], [9, 'fail', null]];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const bracci = process.env.CPM_SOLO ? [process.env.CPM_SOLO] : ['verde', 'rosso'];
const ris = {};
for (const br of bracci) { ris[br] = [];
  for (const [gi, out, kind] of CASI) {
    const page = await pagina252(b, port, br === 'rosso' ? { __CPM_NO_GK252: 1, __CPM_NO_PARATA258: 1 } : {});/* [giro 40 PO-258] l'arco della parata ora finisce sul piano del portiere: z finale = z al piano, e col solo NO_GK252 il difetto non si riproduce piu' (misurato: rosso 0/8; con entrambi gi15 KO come sulla base) */
    const k = await kDi(page, gi, null);
    const r = await scena252(page, { gi, k, out, kind, secondi: 4, prima: () => { window.__CPM_GK229 = []; }, raccogli: () => ({ gk: (window.__CPM_GK229 || []).slice(), kind: window.__CPM_OUTCOME ? window.__CPM_OUTCOME.outKind || null : null, dbg: window.__CPM_GK252 || null }) });
    await page.close();
    const p = analizzaPortiere((r && r.gk) || [], { kind: (r && r.kind) || null }, { kind });
    const ko = !p.nonGiud && (p.tardi || p.verso || p.fermo);
    ris[br].push({ gi, out, kind, p, ko });
    console.log(`  ${br.padEnd(5)} gi${gi} ${(kind || out).padEnd(11)} ${p.nonGiud ? 'n.g. (' + p.nonGiud + ')' : (ko ? 'KO' : 'ok')} · ${JSON.stringify(p)}${process.argv.includes('--verbose') && r && r.dbg ? ' · ' + JSON.stringify(r.dbg).slice(0, 300) : ''}`);
  } }
await Promise.race([b.close(), new Promise(r => setTimeout(r, 5000))]); srv.close();
if (process.env.CPM_SOLO) setTimeout(() => process.exit(0), 100);
else { const V = ris.verde.filter(x => !x.p.nonGiud), R = ris.rosso.filter(x => !x.p.nonGiud);
  if (V.length < 4) { console.log('❌ CIECO: ' + V.length + ' portieri giudicati'); setTimeout(() => process.exit(2), 100); }
  else { const ok = V.every(x => !x.ko) && R.filter(x => x.ko).length >= 1;/* il difetto vecchio e' intermittente: in catena il rosso ha dato 2/8, 2/8, 2/8 e 1/7 — ne basta uno per provare che il guardiano vede */
    console.log(`\nverde: KO ${V.filter(x => x.ko).length}/${V.length} · rosso: KO ${R.filter(x => x.ko).length}/${R.length}`);
    console.log(ok ? '✅ portiere-252 VERDE' : '❌ portiere-252 ROSSO'); setTimeout(() => process.exit(ok ? 0 : 1), 100); } }

function analizzaPortiere(R, act, e) {
  if (!R.length) return { nonGiud: 'nessun campione del portiere' };
  const ops = [...new Set(R.filter(r => r.op).map(r => r.op))];
  const i0 = R.findIndex(r => r.at); if (i0 < 0) return { ops, nonGiud: 'arco mai armato' };
  const iK = R.findIndex((r, i) => i >= i0 && r.at && r.aT >= 0); if (iK < 0) return { ops, nonGiud: 'calcio non campionato' };
  const ckKick = R[iK].ck - R[iK].aT; const gz0 = R[iK].gz;
  /* PIANO del portiere: il pallone raggiunge la x del portiere, interpolato fra i due fotogrammi a cavallo (gk-miss-229) */
  let piano = null;
  for (let i = iK; i < R.length; i++) {
    if (R[i].bx < R[i].gx) continue;
    if (i > iK) { const a = R[i - 1], c = R[i]; const da = a.gx - a.bx, dc = c.gx - c.bx; const w = da / Math.max(1e-6, da - dc); piano = { ck: a.ck + w * (c.ck - a.ck), z: a.bz + w * (c.bz - a.bz), y: a.by + w * (c.by - a.by), passo: c.ck - a.ck }; }
    else piano = { ck: R[i].ck, z: R[i].bz, y: R[i].by, passo: 0 };
    break;
  }
  /* il pallone puo' fermarsi prima del piano (parata in presa, respinta, murato): si giudica al massimo avvicinamento se e' entro 2u */
  if (!piano) { let iM = -1, dM = 1e9; for (let i = iK; i < R.length; i++) { const d = Math.abs(R[i].gx - R[i].bx); if (d < dM) { dM = d; iM = i; } } if (iM >= 0 && dM <= 2) piano = { ck: R[iM].ck, z: R[iM].bz, y: R[iM].by, passo: 0, avvicinamento: +dM.toFixed(2) }; }
  let iMov = -1; for (let i = iK; i < R.length; i++) if (Math.abs(R[i].gz - gz0) > 0.05) { iMov = i; break; }
  const iF = R.length - 1; const zFin = R[iF].gz;
  const out = { ops, gesto: ops.length > 0, kickToPiano: piano ? +(piano.ck - ckKick).toFixed(3) : null, dzPiano: piano ? +Math.abs(piano.z - gz0).toFixed(2) : null };
  if (!piano) { out.nonGiud = 'il pallone non arriva al portiere'; return out; }
  if (piano.avvicinamento != null) out.avvicinamento = piano.avvicinamento;
  if (piano.ck - ckKick < S.GK_REAZ) { out.nonGiud = 'bruciapelo (< ' + S.GK_REAZ + ' s)'; return out; }
  const aPortata = Math.abs(piano.z - gz0) <= S.GK_PORTATA && piano.y <= 2.6;
  out.aPortata = aPortata;
  out.partenza = iMov >= 0 ? +(R[iMov].ck - piano.ck).toFixed(3) : null; // negativo = prima che il pallone passi
  /* RIFLESSO (gk_block, src/12 r.~7439): per costruzione si sposta appena, il pallone gli arriva addosso. Il tempo si giudica
     sull'ARMO del gesto rispetto all'arrivo; lo spostamento solo se il pallone passa oltre 1,2u. TUFFO: il corpo deve partire
     prima che il pallone passi (gk-miss-229). */
  const iArm = R.findIndex((r, i) => i >= iK && r.op);
  out.armato = iArm >= 0 ? +(R[iArm].ck - piano.ck).toFixed(3) : null;
  const soloRiflesso = ops.length > 0 && ops.every(o => o === 'gk_block');
  out.riflesso = soloRiflesso;
  out.tardi = soloRiflesso
    ? ((iArm >= 0 && R[iArm].ck - piano.ck > S.GK_TARDI) || (Math.abs(piano.z - gz0) > 1.2 && iMov >= 0 && R[iMov].ck - piano.ck > S.GK_TARDI))
    : (iMov >= 0 && R[iMov].ck - piano.ck > S.GK_TARDI);
  out.fermo = aPortata && iMov < 0 && !out.gesto;
  const latoP = Math.sign(piano.z - gz0), latoG = Math.sign(zFin - gz0);
  out.verso = Math.abs(piano.z - gz0) > 0.6 && Math.abs(zFin - gz0) > 0.3 && latoP !== latoG;
  out.parataSenzaGesto = (e.kind === 'saved' || act.kind === 'saved') && !out.gesto;
  /* [giro 22] posizione del portiere al piano e 0,4 s dopo: separa una reazione sbagliata dal riposizionamento a gesto finito */
  { const at = ck => { let r = R[R.length - 1]; for (const x of R) if (x.ck >= ck) { r = x; break; } return +(+r.gz).toFixed(2); }; out.gz = [+(+gz0).toFixed(2), at(piano.ck), at(piano.ck + 0.4), +(+zFin).toFixed(2)]; out.pz = +(+piano.z).toFixed(2); }
  return out;
}
