#!/usr/bin/env node
/* [giro 132 · PO-332 guardiano — «Nella premiazione braccia a T anziche' alzate e compagni di squadra rivolti dal lato opposto»]
   Foto del PO sulla 7.999.186 (finale di Coppa delle Nazioni vinta): l'eroe sul podio col trofeo sopra la testa ma le braccia
   ORIZZONTALI; i compagni dietro mostrano i numeri della schiena alla camera e al podio.
   CORPI 3D ACCESI (direttiva PO 2026-07-29). Per ogni premiazione di squadra — Nazionale (int), Coppa (cup), campionato (league) —
   forza la cerimonia, porta il tempo dentro l'alzata (`lift`) e legge il testimone __CPM_G132:
     · eroe: quota delle mani vere rispetto alla TESTA (maniSuTesta > 0 = mani sopra la testa) e ai piedi;
     · compagni: angolo fra il DAVANTI del corpo 3D (dalle spalle) e la direzione del podio.
   VERDE  → in ogni premiazione: mani sopra la testa di almeno SOGLIA_MANI e ogni compagno entro SOGLIA_ANG gradi dal podio.
   ROSSO (__CPM_NO_G132 = com'e' oggi) → deve CADERE (mani sotto la testa o compagni girati). Un campione mancante = non giudicato = rosso.
   DUE CORPI. CGTrader (quello di partita): Nazionale + Coppa + campionato — qui la causa misurata e' la clip (mx-victory-jump
   congelata al 45% invece di mx-victory). «regular» (__CPM_NO_CGDEFAULT, senza pacchetto Mixamo): solo la Nazionale — e' il banco
   della RETE DELL'ALZATA, perche' li' la clip `throwin` lascia le mani 0,6 m sotto la testa, la posa della foto del PO.
   [giro 137 · PO-339 «Guarda la camera»] il CAPITANO davanti al podio, durante `lift` e `fest`, guarda la CAMERA (com'era prima
   del giro 132): si misura l'angolo fra il davanti del suo corpo 3D e la camera vera, in `lift` e in `fest`, e deve stare entro
   SOGLIA_CAP. I compagni dietro restano giudicati verso il podio (SOGLIA_ANG invariata, il capitano non entra piu' nel loro massimo).
   Secondo rosso: __CPM_NO_G137C (capitano rivolto al podio = giro 132) → deve CADERE sul capitano.
   Uso: node premiazione-132.mjs   (CPM_CORPI=cg,regular · CPM_KINDS=int,cup,league per il corpo cg · CPM_SOLO=verde|rosso) */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const KINDS = (process.env.CPM_KINDS || 'int,cup,league').split(',');
const SOGLIA_MANI = 0.15;   /* metri: le mani (la piu' bassa) stanno almeno 15 cm sopra l'osso della testa */
const SOGLIA_ANG = 35;      /* gradi: il davanti di ogni compagno guarda il podio entro 35° */
const SOGLIA_CAP = 40;      /* gradi: il davanti del capitano guarda la camera. Fissata dopo la misura del giro 137 (corpo CGTrader, 360x800):
                               verde 5-23° · col verso del giro 132 111-126° */
const VW = (process.env.CPM_VW || '412x915').split('x').map(Number); const FOTO = process.env.CPM_FOTO || '';
const NOMI = { int: 'COPPA DELLE NAZIONI', cup: 'COPPA NAZIONALE', league: 'CAMPIONI PREMIER DIVISION' };
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const errs = [];
async function braccio(rosso, corpo, KINDS, rossoCap) {
  const out = {};
  const page = await b.newPage({ viewport: { width: VW[0], height: VW[1] } }); await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(({ r, c, rc }) => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_CER_HOLD = true; if (r) window.__CPM_NO_G132 = 1; if (rc) window.__CPM_NO_G137C = 1; if (c === 'regular') window.__CPM_NO_CGDEFAULT = 1; }, { r: rosso, c: corpo, rc: !!rossoCap });
  await openMatch(page, port, { skipLoadAll: true, name: 'Premio132' });
  await page.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 60000 }).catch(() => {}); await sleep(1500);
  for (const k of KINDS) {
    await page.evaluate(() => { window.__CPM_CER425 = null; });
    await page.evaluate(([n, k]) => window.__CPM_FORCE_CEREMONY({ name: n, kind: k }), [NOMI[k], k]);
    await page.waitForFunction(() => window.__CPM_CER425 && window.__CPM_CER425.beatsD, null, { timeout: 30000 }).catch(() => {});
    const sc = await page.evaluate(() => window.__CPM_CER425 || null);
    if (!sc) { out[k] = { campione: false, motivo: 'cerimonia assente' }; continue; }
    const i = sc.beats.indexOf('lift'); if (i < 0) { out[k] = { campione: false, motivo: 'nessun beat lift: ' + sc.beats.join('>') }; continue; }
    const t0 = sc.beatsD.slice(0, i).reduce((a, x) => a + x, 0);
    let w = null;
    for (const f of [0.55, 0.75]) {/* si tiene il tempo a meta' alzata e si lascia assestare la clip (avanza di aDt*1,4 a fotogramma) */
      await page.evaluate(t => { window.__CPM_CERT_SET = t; }, t0 + sc.beatsD[i] * f); await sleep(2500);
      await page.evaluate(() => { window.__CPM_G132 = { fr: [] }; }); await sleep(1500);
      const F = (await page.evaluate(() => (window.__CPM_G132 || { fr: [] }).fr)).filter(x => x.beat === 'lift' && x.eroe && x.eroe.maniSuTesta != null && x.cmp && x.cmp.length);
      if (F.length) w = F[F.length - 1];
    }
    if (FOTO && w && k === 'int') await page.screenshot({ path: FOTO.replace('%s', `${rossoCap ? 'rosso137c' : rosso ? 'rosso132' : 'verde'}-${corpo}-alzata-${VW[0]}x${VW[1]}`) });
    const capL = w ? (w.cmp.find(c => c.c === 'cap') || null) : null;
    let capF = null; const j = sc.beats.indexOf('fest');
    if (j >= 0) {/* la festa dopo l'alzata: il capitano e' ancora davanti al palco */
      const tj = sc.beatsD.slice(0, j).reduce((a, x) => a + x, 0);
      await page.evaluate(t => { window.__CPM_CERT_SET = t; }, tj + sc.beatsD[j] * 0.5); await sleep(2500);
      await page.evaluate(() => { window.__CPM_G132 = { fr: [] }; }); await sleep(1500);
      const G = (await page.evaluate(() => (window.__CPM_G132 || { fr: [] }).fr)).filter(x => x.beat === 'fest' && x.cmp && x.cmp.some(c => c.c === 'cap'));
      if (G.length) capF = G[G.length - 1].cmp.find(c => c.c === 'cap');
    }
    if (!w) { out[k] = { campione: false, motivo: 'testimone vuoto nel lift' }; }
    else {
      const altri = w.cmp.filter(c => c.c !== 'cap'); const angMax = altri.length ? Math.max(...altri.map(c => c.ang)) : 999;
      out[k] = { campione: true, maniSuTesta: w.eroe.maniSuTesta, maniSuPiedi: w.eroe.maniSuPiedi, testa: w.eroe.testaSuPiedi, clip: w.eroe.clip, nm: w.eroe.nm, tC: w.eroe.tC, peso: w.eroe.peso,
        compagni: altri.length, angMax, capLift: capL ? capL.cam : null, capFest: capF ? capF.cam : null, capLiftPod: capL ? capL.ang : null, fest: j >= 0, angCam: w.eroe.angCam, angoli: w.cmp.map(c => c.c + ":" + c.ang), nm: w.eroe.nm };
    }
    await page.keyboard.press('Enter'); await sleep(1200);
  }
  await page.close();
  return out;
}
const capOk = (x) => x.capLift != null && x.capLift <= SOGLIA_CAP && (!x.fest || (x.capFest != null && x.capFest <= SOGLIA_CAP)); /* capitano assente in lift (o in fest, dove il beat c'e') = non giudicato = rosso. La Coppa nazionale si chiude sull'alzata: niente fest */
const giudica = (o, K) => K.every(k => o[k] && o[k].campione && o[k].maniSuTesta >= SOGLIA_MANI && o[k].angMax <= SOGLIA_ANG && capOk(o[k]));
const cadeCap = (o, K) => K.every(k => o[k] && o[k].campione && o[k].capLift != null && (!o[k].fest || o[k].capFest != null)) && K.some(k => !capOk(o[k]));
const cade = (o, K) => K.every(k => o[k] && o[k].campione) && K.some(k => o[k].maniSuTesta < SOGLIA_MANI || o[k].angMax > SOGLIA_ANG);
const SOLO = process.env.CPM_SOLO || '';
const CORPI = (process.env.CPM_CORPI || 'cg,regular').split(',');
const ris = [];
for (const c of CORPI) {
  const K = c === 'regular' ? ['int'] : KINDS;
  const v = SOLO === 'rosso' ? null : await braccio(false, c, K);
  const r = (SOLO === 'verde' || SOLO === 'rosso137c') ? null : await braccio(true, c, K);
  const rc = (SOLO === 'verde' || SOLO === 'rosso') ? null : await braccio(false, c, K, true);
  ris.push({ c, K, v, r, rc });
}
await b.close(); srv.close();
console.log(`soglie: mani >= ${SOGLIA_MANI} m sopra la testa · compagni <= ${SOGLIA_ANG}° dal podio · capitano <= ${SOGLIA_CAP}° dalla camera in lift e fest`);
if (errs.length) console.log('pageerror:', errs[0]);
let ok = !errs.length;
const riga = (o, K) => K.map(k => o[k] && o[k].campione ? `${k}: mani ${o[k].maniSuTesta} (${o[k].nm}) · compagni max ${o[k].angMax}° · capitano→camera lift ${o[k].capLift}° fest ${o[k].fest ? o[k].capFest + '°' : '— (nessun beat)'} (→podio ${o[k].capLiftPod}°)` : `${k}: NON GIUDICATO (${o[k] && o[k].motivo})`).join(' | ');
for (const x of ris) { if (x.v) { const g = giudica(x.v, x.K); ok = ok && g; x.gv = g; } if (x.r) { const g = cade(x.r, x.K); ok = ok && g; x.gr = g; } if (x.rc) { const g = cadeCap(x.rc, x.K); ok = ok && g; x.grc = g; } }
for (const x of ris) if (x.v) console.log(`VERDE [${x.c}] ${x.gv ? 'ok' : 'FALLITO'} — ${riga(x.v, x.K)}`);
for (const x of ris) if (x.r) console.log(`ROSSO [${x.c}] (__CPM_NO_G132) ${x.gr ? 'cade, come deve' : 'NON CADE'} — ${riga(x.r, x.K)}`);
for (const x of ris) if (x.rc) console.log(`ROSSO [${x.c}] (__CPM_NO_G137C) ${x.grc ? 'cade, come deve' : 'NON CADE'} — ${riga(x.rc, x.K)}`);
console.log(ok ? '✅ premiazione-132 verde (e il rosso cade)' : '❌ premiazione-132 ROSSO'); process.exit(ok ? 0 : 1);
