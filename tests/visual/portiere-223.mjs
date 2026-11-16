#!/usr/bin/env node
/* GUARDIANO giro 223 (PO-487) — «CODICE 111: PORTIERE FUORI TEMPO» SUI TIRI SBAGLIATI (fuori e palo), TUTTE LE FAMIGLIE DI TIRO.

   TACCUINO PO 7.999.195: S.16 W.1 74' vs FC Stamford, «💥 Palla buona al limite dell'area!» → «⚡ Conclusione di prima», esito miss:
   «codice 111 — portiere fuori tempo su gli highlights». Nasce da gk-miss-229 (stesso testimone __CPM_GK229, stesso tempo di scena,
   pagina fresca per scena) e aggiunge la scena del motore «conclusione» al limite (P6C, costruita con scenaDalMotoreConclusione come
   la costruisce il gioco) e tre misure nuove, nate dal censimento del giro 223 (86 tiri sbagliati, 43 scene, rapporto
   docs/sviluppo/RAPPORTO-giro223.md):
     ✗ «attraverso»  il pallone passa a meno di 0,7 u dal centro del portiere (quota <= 2 u) fra il calcio e la linea: su un tiro
                     sbagliato non puo' passargli nel corpo (prima della correzione: 29 casi su 86);
     ✗ «presto»      il portiere e' gia' disteso piu' di 0,25 s di scena prima che il pallone arrivi sul suo piano;
     ✗ «rialzato»    il gesto e' gia' finito quando un pallone a portata gli passa (prima: 30 casi su 86).
   Restano le quattro del 229: «fermo» (nessun gesto con pallone a portata, <= 4,5 u di lato e <= 2,6 di quota), «in ritardo» (corpo
   che parte oltre +0,05 s dal passaggio sul piano), «verso» (tuffo dalla parte opposta), «largo» (tuffo su un pallone lontano che
   esce a piu' di 2 u dal palo). A bruciapelo (pallone sul portiere meno di 0,20 s dopo il calcio) non si giudica.
   CAMPIONE DICHIARATO (CPM_SCENE per cambiarlo): la scena del taccuino P6C «Conclusione di prima» + sei scene del catalogo che nel
   censimento erano rosse, una per famiglia (volee gi1, di prima gi62, potenza gi165, a giro gi17, primo palo gi90, secondo palo gi86),
   ciascuna con esito fuori (wide) e palo (post) = 14 tiri. Una scena non giudicabile e' dichiarata; sotto meta' giudicate = cieco (rosso).

     CPM_CHROME=… node tests/visual/portiere-223.mjs [--verbose]
     CPM_ROSSO=1 → __CPM_NO_G223 (comportamento prima della correzione): deve tornare ROSSO (uscita 0 se rosso, 3 se verde).
     CPM_KINDS=wide,post (default) · CPM_GLB=1 per i corpi GLB · CPM_DUMP=prefisso per i fotogrammi. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const VERB = process.argv.includes('--verbose');
const ROSSO = !!process.env.CPM_ROSSO;
const ROSSO_L = false;
const DUMPN = {};
const LENTO = +(process.env.CPM_LENTO || 0);
const KINDS = (process.env.CPM_KINDS || 'wide,post').split(',');
/* scene: gi:ai:famiglia (dal censimento delle scene: gi88 a0 e' proprio «Volée di collo potente» del taccuino;
   «girata» e' la scena del motore «Spalle alla porta», costruita in pagina con scenaDalMotoreSpalle come la costruisce il gioco) */
const SCENE = (process.env.CPM_SCENE_FILE ? (await import('node:fs')).readFileSync(process.env.CPM_SCENE_FILE, 'utf8').trim() : (process.env.CPM_SCENE || 'P6C:prima:prima,1:0:volee,62:1:prima,165:0:potenza,17:2:giro,90:0:primo-palo,86:0:secondo-palo')).split(',').map(s => { const [gi, ai, fam, y] = s.split(':'); return { gi, ai, fam, y }; });
/* BRACCIO «PALO, LATO E BASSO FPS» (giro 12). Il rosso della catena mirata (13/10, «alvolo gi6 post: gk_block dalla parte opposta») NON
   dipende dal frame-rate: il passo di scena e' tappato a 0,05 s (src/12, _rdt) e la stessa scena a CPU x6 e' verde 3/3. Dipende dal
   bersaglio dell'arco, che non e' seedato: quando muore davanti al portiere appena oltre lo zero, il post-arco del palo porta il
   pallone dall'altra parte rispetto alla velocita' dell'arco. Qui la geometria si FORZA (__CPM_GK229GEO: bersaglio z -0,3, portiere
   z 0,5, arco che muore 2,5u prima del suo piano), e la pagina gira a CPU rallentata (CPM_LENTO_GEO, default 4): il caso diventa
   ripetibile. Verde col gioco; rosso con CPM_ROSSO=L (__CPM_NO_GK229L). CPM_GEO=0 lo spegne. */
const GEO = +(process.env.CPM_GEO || 0); /* il braccio geometrico del palo appartiene a gk-miss-229 */
const LENTO_GEO = +(process.env.CPM_LENTO_GEO || 4);
const GEO_SC = { gi: '6', ai: '1', fam: 'palo-geo', geo: { tz: -0.3, gz: 0.5, dx: 2.5 } };
const PALO = 3.35;           /* mezza luce della porta in unita' di mondo (z) */
const LONTANO = PALO + 2;    /* oltre: tiro chiaramente fuori dallo specchio */
const SOGLIA_X = 48.6 - 1.2; /* linea di porta (_GLX 48,6) meno un pallone pieno contro il palo */
const REAZIONE = 0.20;       /* tempo di reazione di un portiere (s): un pallone che gli arriva prima da calcio a bruciapelo non si giudica */
const ATTRAVERSO = 0.7;     /* [giro 223] sotto questa distanza orizzontale (u) dal centro del portiere, a quota <= 2u, il pallone gli passa nel corpo */
const PRESTO = 0.25;        /* [giro 223] distesa completa piu' di 0,25 s di scena prima che il pallone arrivi sul suo piano = tuffo anticipato */
const PORTATA = 4.5;         /* distanza laterale entro cui un portiere in tuffo arriva al pallone (il morsetto ±4,5 dei siti del tuffo) */

/* CPM_OFFLINE=prefisso: rigiudica i fotogrammi salvati con CPM_DUMP, senza browser */
const OFF = process.env.CPM_OFFLINE || null;
const srv = OFF ? null : await startServer(); const port = OFF ? 0 : srv.address().port;
const b = OFF ? null : await launchBrowser();

async function scena(sc, kind) {
  if (OFF) { const fs = await import('node:fs'); const f = `${OFF}-${sc.fam}-${sc.gi}-${kind}.json`; if (!fs.existsSync(f)) return { sc, kind, skip: 'nessun dump ' + f }; const J = JSON.parse(fs.readFileSync(f, 'utf8')); return { sc, kind, label: J.label, R: J.R, T: J.T, tardi: J.tardi | 0, cam: J.cam || [] }; }
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  /* BRACCIO A BASSO FPS (giro 12): CPM_LENTO=<k> rallenta la CPU della pagina di k volte via CDP — riproduce in modo ripetibile la
     macchina carica della catena mirata (e il telefono lento) senza un secondo processo in parallelo. */
  const lento = sc.geo ? LENTO_GEO : LENTO;
  if (lento > 1) { const cdp = await page.context().newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: lento }); }
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(([r, glb, geo]) => { window.__CPM_GLB = !!glb; window.__CPM_REC = true; window.__CPM_CINE = 1; window.__CPM_CAMSTEP93ON = 1; if (r === 1) window.__CPM_NO_G223 = 1; if (r === 2) window.__CPM_NO_GK229L = 1; if (geo) window.__CPM_GK229GEO = geo; }, [ROSSO_L ? 2 : ROSSO ? 1 : 0, process.env.CPM_GLB ? 1 : 0, sc.geo || null]);
  try {
    await openMatch(page, port); await sleep(800);
    let gi = sc.gi, ai = /^\d+$/.test(String(sc.ai)) ? +sc.ai : sc.ai;
    if (sc.gi === 'P6C') {
      /* [giro 223] scena del motore «conclusione» al limite, costruita come la costruisce il gioco: si cercano seed con il titolo del
         taccuino («Palla buona al limite dell'area!») e l'azione chiesta (sc.ai = chiave del registro P6_CONCLUSIONE) */
      const r = await page.evaluate(([k, y]) => { try { const lab = (P6_CONCLUSIONE.find(t => t.k === k) || {}).l; if (!lab) return { err: 'chiave ' + k };
        for (let seed = 1; seed < 2000; seed++) {
          const s = scenaDalMotoreConclusione({ tipo: 'conclusione', zona: 'limite', x: 78, y, press: 2, liberi: 0, cast: {} }, { stats: {} }, seed);
          if (!s) continue; const i = s.actions.findIndex(a => a.label === lab || a.l === lab); if (i < 0) continue;
          if (k === 'prima' && !/Palla buona al limite/.test(s.text)) continue;
          SITUATIONS.push(s); return { gi: SITUATIONS.length - 1, ai: i, text: s.text };
        } return null; } catch (e) { return { err: String(e.message || e) }; } }, [sc.ai, +(sc.y || 39)]);
      if (!r || r.err) { await page.close(); return { sc, kind, skip: 'conclusione non costruibile: ' + (r && r.err) }; }
      gi = r.gi; ai = r.ai;
    }
    if (sc.gi === 'P6S') {
      const r = await page.evaluate(() => { try {
        for (let seed = 1; seed < 400; seed++) {
          const s = scenaDalMotoreSpalle({ tipo: 'spalle', zona: 'area', x: 86, y: 46, press: 3, liberi: 0, cast: {} }, { stats: {} }, seed);
          if (!s) continue; const i = s.actions.findIndex(a => /girata/i.test(a.label)); if (i < 0) continue;
          SITUATIONS.push(s); return { gi: SITUATIONS.length - 1, ai: i };
        } return null; } catch (e) { return { err: String(e.message || e) }; } });
      if (!r || r.err) { await page.close(); return { sc, kind, skip: 'girata non costruibile: ' + (r && r.err) }; }
      gi = r.gi; ai = r.ai;
    }
    const ok = await page.evaluate(g => window.__CPM_FORCE_SIT(+g, true), gi).catch(() => false);
    if (!ok) { await page.close(); return { sc, kind, skip: 'force fallito' }; }
    await sleep(400);
    const label = await page.evaluate(a => (window.__CPM_ACTS() || [])[a] || null, ai);
    await page.evaluate(k => { window.__CPM_FROZEN = false; window.__CPM_GK229 = []; window.__CPM_GK799 = []; window.__CPM_GK229TARDI = 0; window.__CPM_REC229 = 1; window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_FORCE_KIND = k; }, kind);
    await page.evaluate(a => window.__CPM_RESOLVE(a), ai);
    /* si aspetta in TEMPO DI SCENA: arco finito + 2,5 s di scena (tetto di parete 90 s) */
    const t0 = Date.now();
    while (Date.now() - t0 < 90000) {
      await sleep(400);
      const st = await page.evaluate(() => { const R = window.__CPM_GK229 || []; const L = R[R.length - 1]; let iE = -1, armed = false;
        for (let i = 0; i < R.length; i++) { if (R[i].at) armed = true; if (armed && !R[i].at) { iE = i; break; } }
        return { ck: L ? L.ck : 0, ckE: iE >= 0 ? R[iE].ck : null }; });
      if (st.ckE != null && st.ck - st.ckE > 2.5) break;
    }
    const R = await page.evaluate(() => (window.__CPM_GK229 || []).slice());
    const T = await page.evaluate(() => (window.__CPM_GK799 || []).map(g => g.tag));
    const tardi = await page.evaluate(() => window.__CPM_GK229TARDI | 0);
    const fps = await page.evaluate(() => Math.round(window.__CPM_FPS708 || 0)).catch(() => 0);
    const arm = await page.evaluate(() => ({ a: window.__CPM_GK229ARM || null, g: window.__CPM_G223ARC || null, gc: window.__CPM_GKACT || null })).catch(() => null);
    /* 007 (solo annotazione, non giudicato): passi della camera oltre 2,5u fra due fotogrammi durante l'esito, con la velocita' in u/s di
       scena — al telefono (~30 fps) 2,6-5,6u in un fotogramma sono 80-170 u/s; un passo lungo in headless con dt grande non e' un salto */
    const cam = await page.evaluate(() => (window.__CPM_CAMSTEP93 || []).filter(e => e.ph === 'hl_result' && !e.cut && !e.snap && !e.sc && e.dt > 0).map(e => ({ st: e.st, v: Math.round(e.st / (e.dt / 1000)) })).filter(e => e.v >= 150));
    await page.close();
    if (process.env.CPM_DUMP) { const fs = await import('node:fs'); fs.writeFileSync(`${process.env.CPM_DUMP}-${sc.fam}-${sc.gi}-${kind}${(DUMPN[`${sc.gi}${kind}`] = (DUMPN[`${sc.gi}${kind}`] | 0) + 1) > 1 ? '-' + DUMPN[`${sc.gi}${kind}`] : ''}.json`, JSON.stringify({ label, T, R, tardi, cam, fps, arm })); }
    return { sc, kind, label, R, T, tardi, cam, errs, fps };
  } catch (e) { try { await page.close(); } catch (_e) {} return { sc, kind, skip: 'errore: ' + String(e.message || e).slice(0, 120) }; }
}

function analizza(o) {
  const R = o.R || []; if (!R.length) return { ...o, nonGiud: 'nessun fotogramma' };
  const i0 = R.findIndex(f => f.at); if (i0 < 0) return { ...o, nonGiud: 'arco mai armato' };
  const iK = R.findIndex((f, i) => i >= i0 && f.at && f.aT >= 0); if (iK < 0) return { ...o, nonGiud: 'calcio non campionato' };
  const ckKick = R[iK].ck - R[iK].aT;
  /* attraversamento di una soglia in x, interpolato fra i due fotogrammi a cavallo */
  const passa = (soglia) => {
    for (let i = iK; i < R.length; i++) {
      if (R[i].bx < soglia(R[i])) continue;
      if (i > iK) { const a = R[i - 1], c = R[i]; const da = soglia(a) - a.bx, dc = soglia(c) - c.bx; const w = da / Math.max(1e-6, da - dc);
        return { ck: a.ck + w * (c.ck - a.ck), z: a.bz + w * (c.bz - a.bz), y: a.by + w * (c.by - a.by), gz: a.gz + w * (c.gz - a.gz), passo: c.ck - a.ck }; }
      return { ck: R[i].ck, z: R[i].bz, y: R[i].by, gz: R[i].gz, passo: 0 };
    }
    return null;
  };
  const Li = passa(() => SOGLIA_X);
  /* PASSAGGIO DAL PORTIERE = minimo avvicinamento del pallone al punto in cui il portiere stava al calcio (x,z), fra il calcio e
     la linea: regge anche i tiri da posizione defilata, dove il pallone corre parallelo al piano del portiere. Si raffina
     fra i due fotogrammi a cavallo del minimo con l'interpolazione lineare. */
  const gx0 = R[iK].gx, gz0k = R[iK].gz, dist = f => Math.hypot(f.bx - gx0, f.bz - gz0k);
  const ckFine = Li ? Li.ck : R[iK].ck + 3;
  /* si guarda solo il pallone gia' partito (oltre 1,5u dal punto di calcio): un tiro calciato a un passo dal portiere e che se ne
     allontana subito non «gli passa» accanto — misurato su una girata GLB: minimo a 0,07 s dal calcio, pallone uscito a z 11. */
  const kx = R[iK].bx, kz = R[iK].bz, partito = f => Math.hypot(f.bx - kx, f.bz - kz) >= 1.5;
  let iP = -1; for (let i = iK; i < R.length && R[i].ck <= ckFine; i++) if (partito(R[i]) && (iP < 0 || dist(R[i]) < dist(R[iP]))) iP = i;
  if (iP < 0) return { ...o, nonGiud: 'il pallone non parte dal piede (o non arriva sulla linea)' };
  let P = { ck: R[iP].ck, z: R[iP].bz, y: R[iP].by, gz: gz0k, passo: iP > iK ? R[iP].ck - R[iP - 1].ck : 0 };
  if (iP > iK && iP + 1 < R.length) { let best = dist(R[iP]); for (const [a, c] of [[R[iP - 1], R[iP]], [R[iP], R[iP + 1]]]) for (let w = 0.1; w < 1; w += 0.1) {
    const f = { bx: a.bx + w * (c.bx - a.bx), bz: a.bz + w * (c.bz - a.bz) }; const d = dist(f); if (d < best) { best = d; P = { ck: a.ck + w * (c.ck - a.ck), z: f.bz, y: a.by + w * (c.by - a.by), gz: gz0k, passo: c.ck - a.ck }; } } }
  if (P.passo > 0.15) return { ...o, nonGiud: `passaggio dal portiere fra due fotogrammi distanti ${P.passo.toFixed(2)}s di scena` };
  const dPiano = dist({ bx: R[iP].bx, bz: P.z }) , portata = Math.abs(P.z - P.gz) <= PORTATA && P.y <= 2.6 && dPiano <= PORTATA + 1;
  const r = { ...o, ckKick, ckPiano: P.ck, zPiano: +P.z.toFixed(2), yPiano: +P.y.toFixed(2), dPiano: +dPiano.toFixed(2), portata,
    ckLinea: Li ? Li.ck : null, zLinea: Li ? +Li.z.toFixed(2) : null, arcD: R[i0].aD };
  /* gesto del portiere: il primo armato dall'inizio dell'arco; PARTENZA del corpo = primo spostamento laterale oltre 5 cm */
  /* [giro 223] ATTRAVERSO: fra il calcio e la linea (o 1,5 s), distanza orizzontale minima fra il pallone (sotto i 2u di quota) e il
     corpo del portiere nella sua posizione di QUEL fotogramma. Su un tiro sbagliato il pallone non puo' passare dentro il portiere. */
  let dMin = 1e9, ckMin = null, yMin = null;
  for (let i = iK; i < R.length && R[i].ck <= (Li ? Li.ck : R[iK].ck + 1.5); i++) { const f = R[i]; if (f.by > 2.0 || !partito(f)) continue;
    const d = Math.hypot(f.bx - f.gx, f.bz - f.gz); if (d < dMin) { dMin = d; ckMin = f.ck; yMin = f.by; } }
  r.dMin = +dMin.toFixed(2); r.ckMin = ckMin; r.yMin = yMin;
  const iA = R.findIndex((f, i) => i >= i0 && f.op); if (iA < 0) return { ...r, gesto: null };
  /* verso = il bersaglio FINALE del gesto (il riflesso del 7.999.162 v2 rimira il pallone fino al suo passaggio) */
  let iZ = iA; for (let i = iA; i < R.length && R[i].op === R[iA].op; i++) iZ = i;
  const z0 = R[iA].gz, tz = R[iZ].tz; /* la z del portiere nel fotogramma in cui il gesto si arma: prima puo' ancora scivolare col piazzamento */
  const iS = R.findIndex((f, i) => i >= iA && f.op && Math.abs(f.gz - z0) > 0.05);
  const span = tz == null ? 0 : Math.abs(tz - z0);
  const iF = span > 0.3 ? R.findIndex((f, i) => i >= iA && Math.abs(f.gz - z0) >= 0.95 * span) : -1;
  const ckS = iS >= 0 ? (iS > 0 ? (R[iS - 1].ck + R[iS].ck) / 2 : R[iS].ck) : null;
  /* VERSO: si confronta col punto in cui il pallone attraversa il piano del portiere venendo da DAVANTI. Se il tiro parte gia' al
     suo livello o dietro (dal fondo, da posizione defilata: gi86, pallone da z 17 che taglia lo specchio alle sue spalle) il pallone
     passa da entrambi i lati del portiere: il verso non e' giudicabile e si dichiara (lato 0, «laterale»). Misurato: col punto di
     minimo avvicinamento il riflesso verso il pallone in arrivo risultava «sbagliato», col punto sulla linea lo era il tuffo verso
     la porta — due letture opposte della stessa scena, cioe' nessuna delle due e' un metro. */
  const davanti = R[iK].bx < R[iK].gx - 0.3; const Xp = davanti ? passa(f => f.gx) : null;
  const lato = (!Xp || tz == null || Math.abs(Xp.z - z0) < 0.8) ? 0 : (Math.sign(tz - z0) === Math.sign(Xp.z - z0) ? 1 : -1);
  const gestoAlPiano = (() => { let best = null; for (const f of R) { if (f.ck <= P.ck) best = f; else break; } return best ? best.op : null; })();
  return { ...r, gesto: R[iA].op, ckS, ckF: iF >= 0 ? R[iF].ck : null, z0: +z0.toFixed(2), tz, lato, gestoAlPiano };
}
const f2 = v => v == null ? '—' : (v >= 0 ? '+' : '') + v.toFixed(2);

const righe = [];
const GIRO = [...SCENE.flatMap(sc => KINDS.map(k => [sc, k])), ...Array.from({ length: GEO }, () => [GEO_SC, 'post'])];
for (const [sc, k] of GIRO) {
  const o = await scena(sc, k); const a = o.skip ? o : analizza(o); righe.push(a);
  if (a.skip) { console.log(`  ⚠ ${sc.fam} gi${sc.gi} ${k}: ${a.skip}`); continue; }
  if (a.nonGiud) { console.log(`  ⚠ ${sc.fam} gi${sc.gi} ${k}: NON GIUDICABILE (${a.nonGiud})`); continue; }
  console.log(`  · ${a.sc.fam.padEnd(7)} gi${a.sc.gi} «${a.label}» ${k.padEnd(4)} · arco ${a.arcD}s · calcio→piano ${(a.ckPiano - a.ckKick).toFixed(2)}s · calcio→linea ${a.ckLinea == null ? '—' : (a.ckLinea - a.ckKick).toFixed(2) + 's'} · sul piano z ${a.zPiano} y ${a.yPiano}, a ${a.dPiano}u dal portiere${a.portata ? ' (A PORTATA)' : ''} · sulla linea z ${a.zLinea} · minimo pallone↔portiere ${a.dMin}u`);
  console.log(`      ${a.gesto ? `${a.gesto}: corpo parte ${f2(a.ckS == null ? null : a.ckS - a.ckKick)}s dal calcio = ${f2(a.ckS == null ? null : a.ckS - a.ckPiano)}s dal passaggio sul piano · disteso ${f2(a.ckF == null ? null : a.ckF - a.ckPiano)}s dal piano · verso ${a.lato === 1 ? 'giusto' : a.lato === -1 ? 'SBAGLIATO' : 'centrale o laterale (non giudicato)'} (z ${a.z0} → ${a.tz})` : 'nessun gesto'} · fps reali ~${a.fps | 0} · tuffi tardivi annullati ${a.tardi} · camera 007 ${a.cam && a.cam.length ? a.cam.map(c => c.st + 'u@' + c.v + 'u/s').join(' ') : 'nessun salto'} · siti ${(a.T || []).join(',') || '-'}`);
  if (VERB) for (const e of (a.errs || []).slice(0, 2)) console.log('     pageerror: ' + e);
}
if (!OFF) { await b.close(); srv.close(); }

const giud = righe.filter(r => !r.skip && !r.nonGiud);
if (giud.length < Math.max(3, Math.ceil(righe.length / 2))) { console.log(`❌ solo ${giud.length}/${righe.length} scene giudicabili: il guardiano e' cieco, non verde`); process.exit(2); }
const errori = [];
for (const r of giud) {
  const id = `${r.sc.fam} gi${r.sc.gi} ${r.kind}`;
  if (r.ckPiano - r.ckKick < REAZIONE) { console.log(`  · ${id}: a bruciapelo (pallone sul portiere ${(r.ckPiano - r.ckKick).toFixed(2)}s dopo il calcio, sotto il tempo di reazione): non giudicato`); continue; }
  if (r.dMin < ATTRAVERSO) errori.push(`${id}: il pallone ATTRAVERSA il portiere (${r.dMin}u dal suo corpo a quota ${r.yMin}, ${f2(r.ckMin - r.ckPiano)}s dal piano) su un tiro sbagliato`);
  if (!r.gesto && r.portata) errori.push(`${id}: portiere FERMO su un pallone che gli passa a ${r.dPiano}u (quota ${r.yPiano})`);
  if (!r.gesto) continue;
  if (r.ckS != null && r.ckS - r.ckPiano > 0.05) errori.push(`${id}: ${r.gesto} parte ${(r.ckS - r.ckPiano).toFixed(2)}s DOPO che il pallone l'ha superato`);
  if (r.ckS == null && r.gesto === 'gk_dive') errori.push(`${id}: tuffo armato ma il corpo non si sposta`);
  if (r.lato === -1) errori.push(`${id}: ${r.gesto} dalla parte opposta al pallone`);
  if (r.sc.geo && r.lato === 0) errori.push(`${id}: geometria forzata ma verso non giudicabile (il braccio non guarda)`);
  if (r.ckF != null && r.ckF - r.ckPiano < -PRESTO) errori.push(`${id}: ${r.gesto} gia' disteso ${(r.ckPiano - r.ckF).toFixed(2)}s PRIMA che il pallone arrivi (troppo presto)`);
  if (r.gesto && !r.gestoAlPiano && r.portata) errori.push(`${id}: ${r.gesto} gia' finito quando il pallone gli passa (rialzato troppo presto)`);
  if (r.gesto === 'gk_dive' && !r.portata && r.zLinea != null && Math.abs(r.zLinea) > LONTANO) errori.push(`${id}: tuffo su un pallone largo (passa a ${r.dPiano}u, esce a ${Math.abs(r.zLinea).toFixed(1)}u dal centro)`);
}
const con = giud.filter(r => r.gesto && r.ckS != null && r.ckPiano - r.ckKick >= REAZIONE);
console.log(`\n=== ${giud.length} tiri sbagliati giudicati · ${giud.filter(r => r.gesto).length} con un gesto del portiere · ${giud.filter(r => r.portata).length} a portata ===`);
if (con.length) { const d = con.map(r => r.ckS - r.ckPiano).sort((x, y) => x - y); console.log(`partenza del corpo − passaggio sul piano (s di scena): mediano ${f2(d[d.length >> 1])} · min ${f2(d[0])} · max ${f2(d[d.length - 1])}`); }
if (errori.length) { console.log(`\n❌ ROSSO${ROSSO ? ' (atteso: __CPM_NO_G223)' : ''} — ${errori.length} difetti:`); for (const e of errori) console.log('  · ' + e); process.exit(ROSSO ? 0 : 1); }
console.log(`\n✅ VERDE${ROSSO ? ' — ma era atteso ROSSO: il guardiano non separa' : ''} — sui tiri sbagliati il pallone non attraversa il portiere, che si muove in tempo (ne' tardi ne' gia' rialzato) verso i palloni a portata e guarda uscire quelli lontani.`);
process.exit(ROSSO ? 3 : 0);
