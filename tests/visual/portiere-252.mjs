#!/usr/bin/env node
/* [PO-252/5 giro 22] GUARDIANO: IL PORTIERE PARTE IN TEMPO E DALLA PARTE GIUSTA (codici 111/112; banco PO-248 difetto #5: 8 portieri su
   43 — punizione 4/11, cross 2/3, testa 1/7, volee 1/12). Criterio IDENTICO al banco (funzione analizzaPortiere copiata da
   banco-highlight-248.mjs, che a sua volta e' quello di gk-miss-229): tempo di SCENA, testimone __CPM_GK229, bruciapelo < 0,20 s non
   giudicato. GLB acceso, pagina nuova per scena. Uso: node portiere-252.mjs [--verbose]  (CPM_SOLO=verde|rosso)
   Verde: nessun portiere «tardi» o «verso opposto» nel braccio verde; rosso __CPM_NO_GK252: almeno 1 difetto (intermittente).                       */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { pagina252, scena252, kDi } from './lib/scena-252.mjs';
const S = { GK_TARDI: 0.05, GK_REAZ: 0.20, GK_PORTATA: 4.5 };
const CASI = [[13, 'fail', null], [13, 'fail', 'saved'], [15, 'fail', null], [15, 'fail', 'saved'], [16, 'fail', 'intercepted'], [67, 'success', null], [1, 'fail', 'saved'], [9, 'fail', null],
  /* [giro 138 PO-316] TIRI ANGOLATI FISSATI. Il braccio rosso era cieco (0 KO su 7, misurato 10/11 e qui: il difetto vecchio compare solo se
     il punto in cui il pallone attraversa il piano del portiere e il punto d'arrivo dell'arco cadono da lati opposti del portiere, e con
     le posizioni di partenza casuali delle scene questo non capita quasi mai). La sonda FISSA la posizione di partenza dell'eroe
     (startZone di quella scena, nella sua pagina: il gioco non cambia) vicino al fondo, sulla fascia: x 88, y 14 / y 86. Misurato in
     esplorazione col solo braccio rosso: gi13 da (88,14) KO «verso» 2 su 2, gi1 da (88,86) KO «tardi». Gli stessi casi girano nel braccio
     verde, che deve restare senza KO. Il seme del bersaglio e' quello del caso base (stessa scena, stesso esito). */
  [13, 'fail', null, [88, 14]], [13, 'fail', 'saved', [88, 14]], [1, 'fail', 'saved', [88, 86]],
  /* [giro 271] PORTIERE SULLA LINEA: le tre scene che nella partita «Validator» del banco (portiere nato a x 97) si giudicano ancora.
     Tutte le altre righe qui sopra girano nella partita col portiere avanzato (la geometria su cui il guardiano e' stato tarato fino al
     giro 148); sulla linea 5 delle 8 scene base non sono piu' giudicabili («il pallone non arriva al portiere», vedi rapporto 271). */
  [13, 'fail', null, null, 'L'], [13, 'fail', 'saved', null, 'L'], [67, 'success', null, null, 'L']];
/* [giro 111 PO-311] SEME FISSO: il bersaglio dei tiri e' Math.random del gioco; la sonda lo rende una sequenza fissa (ripristinata prima
   di OGNI scena), cosi' le stesse 8 scene danno gli stessi angoli a ogni giro e verde e rosso sono confrontabili. CPM_SEME252=0 lo spegne
   (come prima del giro 111); CPM_SEME252=<n> cambia la serie. */
/* [giro 271] IL ROSSO ERA CIECO DAL GIRO 175 (0 KO su 4-7 da allora; bisezione: 5a2b17e6 portiere a x 41 e KO 2/2, 878cc43c x 47 e KO 0).
   CAUSA MISURATA: il difetto vecchio nasce solo se il pallone ATTRAVERSA il piano del portiere prima di finire l'arco (allora il punto
   al piano e il punto d'arrivo possono cadere da lati opposti). Il portiere in scena sta alla x con cui e' nato al calcio d'inizio
   (x 94 ± 4, tetto 97). Fino al giro 174 quello scarto era Math.random, cioe' il seme di questa sonda: usciva 91 (mondo 41), davanti
   all'arrivo dell'arco (x 46). Dal giro 175 lo scarto viene dal seme della PARTITA (avversario+stagione+settimana+nome): nella partita
   «Validator» del banco esce 97 (mondo 47), DIETRO l'arrivo dell'arco — il pallone non attraversa mai il suo piano e il difetto non
   puo' nascere. Con __CPM_NO_G175 torna a 41 e torna il KO (2 su 2). Il gioco non cambia: i tiri angolati girano in una partita
   il cui seme fa nascere il portiere ospite AVANZATO (nome in NOMI_AVANTI; verificato a ogni scena all'armo del gesto: x mondo <= GX_AVANTI).
   Se nessun nome lo da' piu' (un giro futuro cambia il seme), la scena e' «non giudicata» col motivo scritto, cioe' rossa. */
const NOMI_AVANTI = (process.env.CPM_NOMI252 || 'Portiere C,Portiere D,Portiere C').split(','), GX_AVANTI = 42.5;/* mondo: 42,5 = x logica 92,5; l'arco di tiri e punizioni finisce a x 42-46,5 */
const gkOspite = page => page.evaluate(() => { try { const g = (window.__CPM_MP() || []).find(q => q && q.gk && q.t === 'away'); return g ? g.x : null; } catch (e) { return null; } });
const SEME = process.env.CPM_SEME252 != null ? +process.env.CPM_SEME252 : 1;
const SZ = process.env.CPM_SZ252 ? process.env.CPM_SZ252.split(',').map(Number) : null;/* [giro 138] esplorazione: posizione di partenza dell'eroe fissata (x,y logici) */
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const bracci = process.env.CPM_SOLO ? [process.env.CPM_SOLO] : ['verde', 'rosso'];
const ris = {};
for (const br of bracci) { ris[br] = [];
  for (const [gi, out, kind, sz0, lin0] of CASI.filter(c => !process.env.CPM_GI || process.env.CPM_GI.split(',').map(Number).includes(c[0])).filter(c => !process.env.CPM_SOLO_ANGOLATI || c[3])) {
    const szC = sz0 || SZ;
    const fl271 = Object.assign(br === 'rosso' ? { __CPM_NO_GK252: 1, __CPM_NO_PARATA258: 1 } : {}, Object.fromEntries((process.env.CPM_FLAG252 || '').split(',').filter(Boolean).map(f => [f, 1]))/* [giro 271] esplorazione: interruttori in piu' per ENTRAMBI i bracci (mai usato dal guardiano) */, SEME ? { __SEME252: SEME * 7919 + CASI.findIndex(c => c[0] === gi && c[1] === out && c[2] === kind) } : {});/* [giro 40 PO-258] l'arco della parata ora finisce sul piano del portiere: z finale = z al piano, e col solo NO_GK252 il difetto non si riproduce piu' (misurato: rosso 0/8; con entrambi gi15 KO come sulla base) */
    /* [giro 271] av = scena nella partita col portiere AVANZATO. La precondizione si legge DOVE NASCE: la x del portiere all'armo del
       suo gesto (__CPM_GKACT.d148.gx, mondo). Letta prima della scena da __CPM_MP non basta: la partita scorre mentre la pagina carica
       e il portiere puo' essersi mosso (misurato: 1 pagina su 22 con x 93 al posto di 91). Se all'armo non e' davanti (gx > GX_AVANTI)
       si riprova col nome successivo; finiti i nomi la scena e' non giudicata. */
    const av = lin0 !== 'L' || !!sz0;
    let r = null, gkx = null, gxArmo = null, prove = 0;
    for (const nome of (av ? NOMI_AVANTI : [null])) { prove++;
      const page = await pagina252(b, port, fl271, nome ? { name: nome } : null); gkx = await gkOspite(page);
      const k = await kDi(page, gi, null);
      if (szC) await page.evaluate(([g, z]) => { SITUATIONS[g].startZone = { x: [z[0], z[0]], y: [z[1], z[1]] }; }, [gi, szC]);
      r = await scena252(page, { gi, k, out, kind, secondi: 4, prima: () => { window.__CPM_GK229 = []; if (window.__SEME252_RESET) window.__SEME252_RESET(window.__SEME252); }, raccogli: () => ({ gk: (window.__CPM_GK229 || []).slice(), kind: window.__CPM_OUTCOME ? window.__CPM_OUTCOME.outKind || null : null, dbg: { gkact: window.__CPM_GKACT || null, t23: (window.__CPM_TIRO23 || []).slice(-1)[0] || null, hero: (() => { try { const p = window.__CPM_PROBE && window.__CPM_PROBE(); return p && p.hero ? [+p.hero.world.x.toFixed(1), +p.hero.world.z.toFixed(1)] : null; } catch (e) { return null; } })() } }) });
      await page.close();
      const d = r && r.dbg && r.dbg.gkact && r.dbg.gkact.d148; gxArmo = d ? d.gx : null;
      if (!av || gxArmo == null || gxArmo <= GX_AVANTI) break; r = null; }
    if (!r) { const p = { nonGiud: 'nessuna partita col portiere avanzato all\'armo (x mondo <= ' + GX_AVANTI + '; ultima ' + gxArmo + ', nomi ' + NOMI_AVANTI.join('/') + ')' }; ris[br].push({ gi, out, kind, sz: szC, p, ko: false, avanti: true }); console.log(`  ${br.padEnd(5)} gi${gi}${szC ? '@' + szC.join(',') : ''} ${(kind || out).padEnd(11)} n.g. (${p.nonGiud})`); continue; }
    const p = analizzaPortiere((r && r.gk) || [], { kind: (r && r.kind) || null }, { kind });
    const ko = !p.nonGiud && (p.tardi || p.verso || p.fermo);
    p.gk271 = { nascita: gkx, armo: gxArmo, prove };
    ris[br].push({ gi, out, kind, sz: szC, p, ko, avanti: av });
    console.log(`  ${br.padEnd(5)} gi${gi}${szC ? '@' + szC.join(',') : ''}${av ? '' : ' [linea]'} ${(kind || out).padEnd(11)} ${p.nonGiud ? 'n.g. (' + p.nonGiud + ')' : (ko ? 'KO' : 'ok')} · ${JSON.stringify(p)}${process.argv.includes('--verbose') && r && r.dbg ? ' · ' + JSON.stringify(r.dbg).slice(0, 300) : ''}`);
  } }
await Promise.race([b.close(), new Promise(r => setTimeout(r, 5000))]); srv.close();
if (process.env.CPM_SOLO) setTimeout(() => process.exit(0), 100);
else { const V = ris.verde.filter(x => !x.p.nonGiud), R = ris.rosso.filter(x => !x.p.nonGiud);
  if (V.length < 8) { console.log('❌ CIECO: ' + V.length + ' portieri giudicati nel verde (minimo 8; misurati 11 su 14 nel giro 271, erano 5 su 11 col portiere sulla linea)'); console.log('BRACCIO verde · MOTIVO ' + V.length + ' portieri giudicati, minimo 8'); setTimeout(() => process.exit(2), 100); }
  else { const ok = V.every(x => !x.ko) && R.filter(x => x.ko).length >= 1;/* il difetto vecchio e' intermittente: in catena il rosso ha dato 2/8, 2/8, 2/8 e 1/7 — ne basta uno per provare che il guardiano vede */
    console.log(`\nverde: KO ${V.filter(x => x.ko).length}/${V.length} · rosso: KO ${R.filter(x => x.ko).length}/${R.length}`);
    /* [giro 111 PO-311] braccio e motivo per ULTIMI: la coda dice chi ha fallito e perche' */
    const why = []; V.filter(x => x.ko).forEach(x => why.push(`verde KO su gi${x.gi} ${x.kind || x.out} (${['tardi', 'verso', 'fermo'].filter(f => x.p[f]).join('+')})`));
    if (!R.filter(x => x.ko).length) why.push(`rosso NON VISTO: 0 KO su ${R.length} portieri giudicati (seme ${SEME}, ${CASI.length} scene)`);
    if (!ok) ris.rosso.filter(x => x.avanti && x.p.nonGiud).forEach(x => why.push(`rosso gi${x.gi}${x.sz ? '@' + x.sz.join(',') : ''} non giudicato: ${x.p.nonGiud}`));/* [giro 271] */
    const koR = R.filter(x => x.ko).map(x => `gi${x.gi}${x.sz ? '@' + x.sz.join(',') : ''} ${x.kind || x.out} (${['tardi', 'verso', 'fermo'].filter(f => x.p[f]).join('+')})`);
    console.log(ok ? `✅ portiere-252 VERDE (seme ${SEME}; rosso visto: ${koR.length} KO — ${koR.join(', ')})` : '❌ portiere-252 ROSSO — ' + why.join(' · '));
    console.log(`BRACCIO verde+rosso · MOTIVO ${ok ? 'nessuno' : why.join(' · ')}`); setTimeout(() => process.exit(ok ? 0 : 1), 100); } }

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
  /* [giro 111 PO-311] «VERSO L'OPPOSTO» si giudica sulla REAZIONE (posizione 0,4 s di scena dopo il piano), non sulla z di FINE scena: a
     parata fatta il portiere si riposiziona (cammina via dal pallone) e la z finale misurava quel ritorno, non la reazione. Misurato nel
     censimento (5 giri): gi9 «riflesso» dava KO nel braccio verde in 3 giri su 5 con la reazione GIUSTA (verso il pallone, +0,3…+0,9u)
     e la z finale a 1,1…1,3u dalla partenza dall'altra parte. Nessuna soglia cambiata (0,6 e 0,3 invariate): cambia SOLO il campione.
     Il KO vero (rosso gi1: reazione +2,5u dal lato opposto al pallone) resta KO. */
  const at04 = ck => { let r = R[R.length - 1]; for (const x of R) if (x.ck >= ck) { r = x; break; } return +r.gz; };
  const zReaz = at04(piano.ck + 0.4);
  const latoP = Math.sign(piano.z - gz0), latoG = Math.sign(zReaz - gz0);
  out.verso = Math.abs(piano.z - gz0) > 0.6 && Math.abs(zReaz - gz0) > 0.3 && latoP !== latoG;
  out.parataSenzaGesto = (e.kind === 'saved' || act.kind === 'saved') && !out.gesto;
  /* [giro 22] posizione del portiere al piano e 0,4 s dopo: separa una reazione sbagliata dal riposizionamento a gesto finito */
  { const at = ck => { let r = R[R.length - 1]; for (const x of R) if (x.ck >= ck) { r = x; break; } return +(+r.gz).toFixed(2); }; out.gz = [+(+gz0).toFixed(2), at(piano.ck), at(piano.ck + 0.4), +(+zFin).toFixed(2)]; out.pz = +(+piano.z).toFixed(2); }
  return out;
}
