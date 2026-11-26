/* [giro 385 PO-521] LA FESTA DA UNA PARTITA VINTA GIOCANDO. Decisione PO 18/11 16:40 (giro 266, dubbio 1): «Sì, controllo a parte»,
   con partite vinte GIOCANDO (autoplay seedato, nessun risultato forzato); «persa → nessuna festa» e' un esito valido e va verificato.
   Il giro 266 provocava la vittoria dalla sonda (__CPM_SALTA297) e le statistiche dell'eroe (__CPM_FESTA942_FORCE): qui NIENTE dei due.
   Ogni partita si gioca intera col pilota automatico seedato, sul percorso vero del fischio (_goEndOrCeremony, src/15).

   REGOLA GIUDICATA (src/15, 23/09 POC): festa ⇔ vinta E (partita importante mw>=7 / coppa-KO  OPPURE  prestazione super: voto>=8,
   almeno 2 gol, gol+assist>=3). Prima vengono la premiazione (titleStakes) e la «big win» (finale KO o mw>=9), che sono cerimonie
   anch'esse e nascono solo da una vittoria (titleStakes.late a parte: non capita nelle partite di questo guardiano, e se capitasse
   la partita e' «non giudicata»).
   Per ogni partita:
     - il tabellone al fischio (__CPM_SCORE, home = squadra dell'eroe) dice vinta / pari / persa;
     - la festa la si VEDE: fase `ceremony` campionata ogni 250 ms dal fischio a `ended`, e la fascia `[data-cpm="box-fischio"]` letta
       dal DOM (il punteggio mostrato, ordine casa–ospite);
     - gli ingressi della regola (gol, assist, voto, mw) dal testimone inerte __CPM_FESTA942 (scritto al fischio, src/15).
   VERDE: vinta con merito → festa, col punteggio a schermo uguale al tabellone; vinta senza merito, pari, persa → nessuna festa; e la
   COPERTURA: almeno una vinta con festa e almeno una partita NON vinta (pari o persa), tutte giocate. Senza copertura = non giudicato = rosso.
   ROSSO (CPM_ROSSO=1 → window.__CPM_PROVA385=1, gancio letto SOLO sotto ?cpmtest=1): il gioco fa la festa anche su una partita non
   vinta e mostra il punteggio rovesciato; il guardiano deve vederlo.
   ⚠️ Il risultato di una partita giocata NON e' riproducibile su questo banco (tabellino-228: il sotto-tick del motore segue l'orologio
   da polso). I semi (CPM_SEMI) sono quelli della ricerca del giro 385 (rapporto), ma l'esito di ciascuno puo' cambiare: per questo il
   guardiano gioca la lista finche' ha la copertura, e la lista e' lunga.
   Uso: node festa-385.mjs                  (verde poi rosso)
        CPM_SOLO=verde|rosso node festa-385.mjs
        CPM_CERCA=1 CPM_SEMI=p:1,p:2,c:3 node festa-385.mjs   (solo misura: esito per partita, nessun giudizio)
   Seme «p:N» = provino (nome Festa385-N, seme autoplay N); «c:N» = partita di campionato dal salvataggio c177-s5w20 (nome + ' F<N>', seme autoplay N). */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

/* salvataggio del PO a meta' stagione (giro 337: professionista, stagione 5, giornata 20, attaccante OVR 74, FC Frankfurt p79): nessun titolo in palio.
   Il salvataggio S12 (giornata 38) NON va: e' l'ultima giornata, la premiazione del titolo scatta anche sulla sconfitta (titleStakes.late, misurato 0-1). */
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-c177-s5w20.json', import.meta.url)));
const SEMI = (process.env.CPM_SEMI || 'c:2,c:1,p:3,c:3,p:2,c:4,p:1,c:5,c:6,c:7,p:4,p:5').split(',').map(s => s.trim()).filter(Boolean);
const CERCA = !!process.env.CPM_CERCA;
const PAR = Math.max(1, Math.min(3, +(process.env.CPM_PAR || 3)));
const MAXP = Math.max(1, +(process.env.CPM_MAXP || 12));

async function gioca(b, port, seme, rosso) {
  const [tipo, nS] = seme.split(':'); const n = +nS | 0; const rec = { seme, err: null };
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const t0 = Date.now();
  try {
    await page.addInitScript(([s, r, car]) => {
      window.__CPM_GLB = false; window.__CPM_REC = true;
      if (r) window.__CPM_PROVA385 = 1;
      localStorage.setItem('cpm-match-speed', '2');
      if (car) { for (const k of Object.keys(s)) { try { localStorage.setItem(k, s[k]); } catch (e) {} } try { localStorage.removeItem('cpm-match-resume'); } catch (e) {} localStorage.setItem('cpm-match-speed', '2'); }
    }, [tipo === 'c' ? (() => { const S = JSON.parse(JSON.stringify(save)); const v = JSON.parse(S['cpm-v3']); const pl = v.player || v; pl.name = pl.name + ' F' + n; S['cpm-v3'] = JSON.stringify(v); return S; })() : null, !!rosso, tipo === 'c']);
    if (tipo === 'c') {
      await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
      await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
      try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
      await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
      try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
      await page.evaluate(() => window.__CPM_CAREER.playMatch());
    } else {
      await openMatch(page, port, { skipLoadAll: true, name: 'Festa385-' + n });
    }
    await page.waitForFunction(() => window.__CPM_PHASE && ['matchday', 'formations', 'walkout', 'playing'].includes(window.__CPM_PHASE()), null, { timeout: 60000 });
    await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), n || 1);
    let ph = '', festa = null, vistaCer = false, fineVista = false; const tp = Date.now();
    while (Date.now() - tp < 540000) {
      const o = await page.evaluate(() => { const ph = window.__CPM_PHASE && window.__CPM_PHASE(); const bx = document.querySelector('[data-cpm="box-fischio"]');
        return { ph, box: bx ? (bx.firstElementChild ? bx.firstElementChild.textContent : '') : null, f47: !!document.querySelector('[data-cpm="festa47"]') }; }).catch(() => ({ ph: null }));
      ph = o.ph;
      if (ph === 'ceremony') { vistaCer = true; if (o.box != null && festa == null) festa = { punteggio: o.box.trim(), fascia: o.f47 }; }
      if (ph === 'ended') { fineVista = true; break; }
      await sleep(vistaCer ? 250 : 400);
    }
    rec.fine = ph; rec.vistoFischio = fineVista || vistaCer; rec.festa = vistaCer; rec.schermo = festa;
    Object.assign(rec, await page.evaluate(() => ({ score: window.__CPM_SCORE && window.__CPM_SCORE(), d: window.__CPM_FESTA942 || null, f385: window.__CPM_FESTA385 || null,
      fischio: ((window.__CPM_EV && window.__CPM_EV()) || []).filter(e => e.ev === 'fine').map(e => e.causa || null) })).catch(() => ({})));
  } catch (e) { rec.err = String(e.message).slice(0, 200); }
  rec.s = Math.round((Date.now() - t0) / 1000);
  await ctx.close().catch(() => {});
  return rec;
}

function giudica(r) {
  if (r.err || !r.vistoFischio || !r.score || !r.f385) return { esito: 'non giudicata', perche: r.err || (!r.vistoFischio ? 'fischio non visto' : !r.score ? 'tabellone assente' : 'testimone __CPM_FESTA385 assente (il fischio non e\' passato da _goEndOrCeremony?)') };
  const vinta = r.score.home > r.score.away; const pari = r.score.home === r.score.away;
  const risultato = vinta ? 'vinta' : pari ? 'pari' : 'persa'; const ramo = r.f385.ramo;
  const out = { risultato, ramo, vista: r.festa };
  if (r.f385.home !== r.score.home || r.f385.away !== r.score.away) return { ...out, esito: 'rosso', perche: `il fischio ha deciso su ${r.f385.home}-${r.f385.away}, il tabellone dice ${r.score.home}-${r.score.away}` };
  if (r.f385.late) return { ...out, esito: 'non giudicata', perche: 'titolo gia\' deciso (titleStakes.late): la premiazione non dipende dal risultato' };
  if (ramo === 'titolo' || ramo === 'bigwin') {
    if (!vinta) return { ...out, esito: 'rosso', perche: `cerimonia «${ramo}» su una partita ${risultato}` };
    if (!r.festa) return { ...out, esito: 'rosso', perche: `ramo «${ramo}» deciso ma nessuna cerimonia a schermo` };
    return { ...out, merito: true, attesa: true, esito: 'verde' };
  }
  if (!r.d) return { ...out, esito: 'non giudicata', perche: 'testimone __CPM_FESTA942 assente' };
  const merito = (r.d.mw >= 7) || !!r.d.importante || (r.d.voto >= 8) || ((r.d.gol | 0) >= 2) || (((r.d.gol | 0) + (r.d.assist | 0)) >= 3);
  const attesa = vinta && merito; Object.assign(out, { merito, attesa });
  if (r.d.vinta !== vinta) return { ...out, esito: 'rosso', perche: `il gioco ha deciso la festa su vinta=${r.d.vinta}, il tabellone dice ${r.score.home}-${r.score.away}` };
  if (attesa !== r.festa) return { ...out, esito: 'rosso', perche: attesa ? 'vinta con merito ma NESSUNA festa' : `FESTA su una partita ${risultato}${vinta ? ' senza merito' : ''}` };
  if (r.festa) {
    if (!r.schermo) return { ...out, esito: 'rosso', perche: 'festa senza la fascia del punteggio a schermo' };
    const casa = r.d.casa; const atteso = (casa ? r.score.home : r.score.away) + ' – ' + (casa ? r.score.away : r.score.home);
    if (r.schermo.punteggio !== atteso) return { ...out, esito: 'rosso', perche: `punteggio a schermo «${r.schermo.punteggio}», tabellone ${atteso}` };
  }
  return { ...out, esito: 'verde' };
}

async function braccio(rosso) {
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  const recs = []; let i = 0; const coda = SEMI.slice(0, MAXP);
  const copertura = () => { const g = recs.map(giudica); return { vf: g.some(x => x.esito !== 'non giudicata' && x.risultato === 'vinta' && x.vista), nv: g.some(x => x.esito !== 'non giudicata' && x.risultato !== 'vinta') }; };
  const rossoVisto = () => recs.some(r => giudica(r).esito === 'rosso');
  async function lavoratore() {
    while (i < coda.length) {
      if (!CERCA) { const c = copertura(); if (c.vf && c.nv && !rosso) return; if (rosso && rossoVisto()) return; }
      const s = coda[i++]; const r = await gioca(b, port, s, rosso); recs.push(r); const g = giudica(r);
      console.log(`  [${rosso ? 'rosso' : 'verde'}] ${s}: ${r.score ? r.score.home + '-' + r.score.away : '?'} (${g.risultato || '?'}) · ramo ${r.f385 ? r.f385.ramo : '?'} mw ${r.f385 ? r.f385.mw : '?'} · festa ${r.festa ? 'SI «' + (r.schermo && r.schermo.punteggio) + '»' : 'no'} · gol ${r.d ? r.d.gol : '?'} assist ${r.d ? r.d.assist : '?'} voto ${r.d ? r.d.voto : '?'} mw ${r.d ? r.d.mw : '?'} casa ${r.d ? r.d.casa : '?'} · fischio ${JSON.stringify(r.fischio || [])} · ${r.s} s → ${g.esito}${g.perche ? ' (' + g.perche + ')' : ''}`);
    }
  }
  await Promise.all(Array.from({ length: PAR }, lavoratore));
  await b.close(); srv.close();
  return recs;
}

const solo = process.env.CPM_SOLO || '';
let ok = true;
if (CERCA) { await braccio(!!process.env.CPM_ROSSO); process.exit(0); }
if (solo !== 'rosso') {
  console.log('VERDE (gioco com\'e\')');
  const recs = await braccio(false); const g = recs.map(giudica);
  const rossi = g.filter(x => x.esito === 'rosso'); const vf = g.filter(x => x.esito === 'verde' && x.risultato === 'vinta' && x.vista).length;
  const nv = g.filter(x => x.esito === 'verde' && x.risultato !== 'vinta').length; const ng = g.filter(x => x.esito === 'non giudicata').length;
  console.log(`VERDE: partite ${recs.length} · vinte con festa ${vf} · non vinte senza festa ${nv} · difetti ${rossi.length} · non giudicate ${ng}`);
  if (rossi.length || !vf || !nv) { ok = false; console.log('VERDE ROSSO: ' + (rossi.length ? rossi.map(x => x.perche).join(' | ') : 'copertura mancante (serve una vinta con festa e una non vinta, giocate) = non giudicato')); }
}
if (solo !== 'verde') {
  console.log('ROSSO (CPM_ROSSO: __CPM_PROVA385=1, festa anche da non vinta + punteggio rovesciato)');
  const recs = await braccio(true); const g = recs.map(giudica);
  const visto = g.filter(x => x.esito === 'rosso');
  console.log(`ROSSO: partite ${recs.length} · difetti visti ${visto.length}${visto.length ? ' → ' + visto.map(x => x.perche).join(' | ') : ''}`);
  if (!visto.length) { ok = false; console.log('ROSSO NON VISTO: il guardiano e\' cieco al difetto provocato'); }
}
console.log(ok ? 'FESTA-385 VERDE' : 'FESTA-385 ROSSO');
process.exit(ok ? 0 : 1);
