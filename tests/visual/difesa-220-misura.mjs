/* [giro 16 PO-220] «LE CHIUSURE DIFENSIVE NON SONO PER NULLA PRECISE» — MISURA SULLE SCENE DIFENSIVE VERE.
   Partite vere dal salvataggio S12 (autoplay seedato, velocita' 4). __CPM_DIF220_OGNI (src/14, solo sonde) concede una scena
   difensiva del motore ogni N minuti invece di una a partita, per avere un campione; il testimone __CPM_TK220 (src/12, armato da
   __CPM_TK220ON) registra per ogni scena difensiva risolta col gesto del contrasto:
     att  = attesa prima che il gesto parta (aggancio 7.415, tetto 1,4 s: chi ci arriva gioca il gesto «nel vuoto»)
     dC   = distanza eroe-pallone quando la posa arriva a piena estensione (u=0,18 della vita 1,7 s) — il CONTATTO
     dP   = distanza del portatore avversario piu' vicino dal pallone in quell'istante
     dMin/tMin = minimo eroe-pallone nella posa tenuta e quando
     gEff = gesto effettivo (col degrado a «press» oltre 8 u, 7.440/7.999.159)
     fine = a fine gesto: distanza dal pallone dell'eroe, dei nostri e dei loro → l'ESITO 3D, da confrontare con ok/kind (raccontato)
   Uso: K=1,2,3,4,5,6 OGNI=8 [ROSSO=__CPM_NO_X] [OUT=file.jsonl] node difesa-220-misura.mjs   ·   RIASSUMI=file.jsonl node difesa-220-misura.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

export function riassumi(scene, etichetta = '') {
  const med = (a) => { const b = a.filter(Number.isFinite).sort((x, y) => x - y); return b.length ? b[Math.floor((b.length - 1) / 2)] : NaN; };
  const q = (a, p) => { const b = a.filter(Number.isFinite).sort((x, y) => x - y); return b.length ? b[Math.min(b.length - 1, Math.floor(p * b.length))] : NaN; };
  const f = (x) => Number.isFinite(x) ? x.toFixed(1).replace('.', ',') : '—';
  /* [giro 50 PO-271] «mai partito» si conta SOLO quando l'ATTESA ha mangiato la scena (att >= 0,4 s, tetto 0,5): e' il difetto del
     giro 16. MISURATO sulla 7.999.171 a carico alto (load 15-20 su 4 CPU): 3 scene su 3 con att = 0 e gesto fermo a u = 0,08-0,09
     (0,13-0,15 s di scena) — il gesto era PARTITO subito, e' la finestra d'esito (tempo reale, sotto ?cpmtest=1) che si chiude prima
     che il clock di scena (dt tappato a 0,05) arrivi a piena estensione: lo strumento, non il gioco. Quelli si dichiarano «troncati». */
  const _mai = scene.filter(s => s && s.tC == null && (!s.ph || s.ph === 'hl_result'));
  const maiPartiti = _mai.filter(s => (s.att || 0) >= 0.4).length, troncati = _mai.length - maiPartiti;
  const S = scene.filter(s => s && s.tC != null).map(s => s.fine || !s.ult ? s : Object.assign({}, s, { fine: s.ult }));/* senza u>=0,95 (gesto troncato dal cambio di fase) vale l'ultimo fotogramma del gesto */
  const dC = S.map(s => s.dC), dMin = S.map(s => s.dMin), att = S.map(s => s.att);
  const vuoto = S.filter(s => s.att >= 1.35).length;
  const lontani = S.filter(s => s.dC > 3).length;
  /* coerenza raccontato ↔ 3D: riuscito = a fine gesto il pallone e' piu' vicino a un nostro (eroe compreso) che a loro ed entro 3 u;
     fallito = piu' vicino a loro */
  const giud = S.filter(s => s.fine && typeof s.ok === 'boolean');
  const incoer = giud.filter(s => s.ok ? !(s.fine.dNostri < s.fine.dLoro && s.fine.dNostri <= 3) : !(s.fine.dLoro < s.fine.dNostri));
  const gesti = {}; for (const s of S) gesti[s.gEff || '?'] = (gesti[s.gEff || '?'] || 0) + 1;
  const R = { n: S.length, tutte: scene.filter(Boolean).length, maiPartiti, troncati, dCmed: med(dC), dCp75: q(dC, 0.75), dMinMed: med(dMin), tCmed: med(S.map(s => s.tC)), attMed: med(att), vuoto, lontani, giudicate: giud.length, incoerenti: incoer.length,
    incOk: incoer.filter(s => s.ok).length, incKo: incoer.filter(s => !s.ok).length, gesti };
  console.log(`${etichetta}scene ${R.n} (+${R.maiPartiti} col gesto mai partito per l'attesa, +${R.troncati} troncati dalla finestra d'esito: strumento) · contatto dC mediana ${f(R.dCmed)} u (p75 ${f(R.dCp75)}) · oltre 3 u ${R.lontani}/${R.n} · minimo mediano ${f(R.dMinMed)} u · tC ${f(R.tCmed)} s · attesa mediana ${f(R.attMed)} s, gesto nel vuoto (attesa al tetto) ${R.vuoto}/${R.n} · esito raccontato contro 3D: ${R.incoerenti}/${R.giudicate} incoerenti (riusciti ${R.incOk}, falliti ${R.incKo}) · gesti ${JSON.stringify(R.gesti)}`);
  return R;
}

if (process.env.GIUDICA_DA) {/* [giro 50] giudizio da righe gia' raccolte (OUT=…, una partita per chiamata): stesso verdetto della corsa intera */
  const righe = fs.readFileSync(process.env.GIUDICA_DA, 'utf8').split('\n').filter(Boolean).map(s => JSON.parse(s)); const es = {};
  for (const modo of ['verde', 'rosso']) { const t = righe.filter(r => r.modo === modo).flatMap(r => r.scene || []); es[modo] = { R: riassumi(t, modo + ' · '), fuori: t.filter(s => s.ph && s.ph !== 'hl_result') }; }
  process.exit(giudica(es));
}
if (process.env.RIASSUMI) {
  const righe = fs.readFileSync(process.env.RIASSUMI, 'utf8').split('\n').filter(Boolean).map(s => JSON.parse(s));
  for (const modo of [...new Set(righe.map(r => r.modo))]) riassumi(righe.filter(r => r.modo === modo).flatMap(r => r.scene || []), modo + ' · ');
  process.exit(0);
}

const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const KS = (process.env.K || '1,2,3,4,5,6').split(',').map(s => +s.trim()).filter(Boolean);
const OGNI = +(process.env.OGNI || 8);
const ROSSO = (process.env.ROSSO || '').split(',').filter(Boolean);
const GIUDICA = process.env.GIUDICA === '1';
const BRACCI = GIUDICA ? [{ modo: 'verde', rosso: [] }, { modo: 'rosso', rosso: ['__CPM_NO_INTRO220'] }] : [{ modo: process.env.MODO || (ROSSO.length ? 'rosso' : 'verde'), rosso: ROSSO }];
const OUT = process.env.OUT || null;
const srv = await startServer(); const b = await launchBrowser();
const url = `http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
const esiti = {};
for (const { modo: MODO, rosso: ROSSI } of BRACCI) { const tutte = [];
for (const k of KS) {
  const t0 = Date.now(); const rec = { k, modo: MODO, err: null };
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  try {
    const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' D220-' + k;
    await page.addInitScript(([s, ogni, rosso]) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_PRESENT = 1; window.__CPM_TK220ON = 1; window.__CPM_DIF220_OGNI = ogni; for (const r of rosso) window[r] = 1;
      localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, OGNI, ROSSI]);
    await page.goto(url, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
    await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), k);
    let ph = ''; while (Date.now() - t0 < 520000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph === 'ended' || ph === 'ceremony') break; await sleep(700); }
    rec.fine = ph;
    rec.scene = await page.evaluate(() => (window.__CPM_TK220 || []).slice());
  } catch (e) { rec.err = String(e).slice(0, 240); }
  rec.sec = Math.round((Date.now() - t0) / 1000); await ctx.close();
  if (OUT) fs.appendFileSync(OUT, JSON.stringify(rec) + '\n');
  tutte.push(...(rec.scene || []));
  console.log(`k${k} ${MODO}: ${(rec.scene || []).length} scene, fine ${rec.fine}, ${rec.sec}s${rec.err ? ' ERR ' + rec.err : ''} ${JSON.stringify((rec.scene || []).map(s => [s.gEff, s.att, s.dC, s.dMin, s.ok, (s.fine || s.ult || {}).dNostri, (s.fine || s.ult || {}).dLoro, (s.fine || s.ult || {}).u, s.tMin, s.kind, s.ph, s.lbl, s.k]))}`);
}
esiti[MODO] = { R: riassumi(tutte, MODO + ' · '), fuori: tutte.filter(s => s.ph && s.ph !== 'hl_result') };
}
await b.close(); srv.close();
if (!GIUDICA) process.exit(0);
/* [giro 16 PO-220 guardiano «difesa-220-scena»] VERDE: nessun contrasto giocato fuori dalla sua scena (fase diversa da hl_result) su
   almeno 3 scene difensive misurate, e al piu' il 15 % (minimo 1) di scene col gesto mai partito (__CPM_NO_ATT220 le riporta a 5
   su 26). ROSSO (__CPM_NO_INTRO220): almeno un contrasto in hl_intro — BLOCCANTE dal giro 50 (misurato: 1 per partita su k1-k3,
   3 su 3 corse); prima era solo dichiarato e il guardiano poteva passare cieco. */
process.exit(giudica(esiti));
function giudica(esiti) {
const V = esiti.verde, Rr = esiti.rosso, g = [];
/* [giro 50] il controllo «fuori scena» vale su OGNI scena registrata (la fase si legge alla nascita del record), anche se il gesto e'
   stato troncato dallo strumento: il campione minimo si conta su quelle, non solo sulle scene arrivate a piena estensione. */
if (!(V.R.tutte >= 3)) g.push(`verde: solo ${V.R.tutte} scene difensive registrate (servono almeno 3)`);
if (V.R.maiPartiti > Math.max(1, Math.round(0.15 * V.R.tutte))) g.push(`verde: ${V.R.maiPartiti} scene col contrasto mai partito nella sua scena (attesa del pallone, tetto 0,5 s)`);
if (!V.R.n && V.R.troncati) console.log(`⚠️ verde: tutti i ${V.R.troncati} gesti troncati dalla finestra d'esito (fps bassi): la meta' «mai partito per attesa» non ha potuto giudicare, resta giudicato il «fuori scena»`);
if (V.fuori.length) g.push(`verde: ${V.fuori.length} contrasti giocati fuori dalla loro scena (${V.fuori.map(s => s.ph).join(', ')})`);
/* [giro 50 PO-271] la prova del rosso diventa BLOCCANTE: il guardiano che non vede il difetto spento e' cieco. */
if (!Rr.fuori.length) g.push('rosso CIECO: nessun contrasto fuori scena con __CPM_NO_INTRO220 nel campione');
/* il runner della catena tiene le ultime 3 righe tagliate a 240 caratteri: le righe di riassunto sono lunghe e il motivo del rosso
   finiva fuori (giro 16, prima prova rossa in catena non diagnosticabile). L'ultima riga porta da sola esito e motivi. */
console.log(`verde n=${V.R.tutte} fuori=${V.fuori.length} mai=${V.R.maiPartiti} troncati=${V.R.troncati} · rosso n=${Rr.R.tutte} fuori=${Rr.fuori.length}`);
if (g.length) { console.log('❌ difesa-220-scena · ' + g.join(' · ')); return 1; }
console.log(`✅ difesa-220-scena verde: ${V.R.tutte} scene, 0 contrasti fuori scena, ${V.R.maiPartiti} mai partiti per attesa (rosso: ${Rr.fuori.length} contrasti fuori scena)`);
return 0;
}
