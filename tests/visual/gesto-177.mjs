#!/usr/bin/env node
/* [giro 177 PO-367 — prova pilota: il rigore. Rosso __CPM_NO_G177] GUARDIANO «NEL RIGORE IL PALLONE PARTE DAL PIEDE» (npm run gesto-177).
   Difetto misurato dal giro 170b e rimisurato qui (12 esecuzioni, 4 semi): il pallone partiva 11 fotogrammi (0,18 s) prima del picco
   del piede, il piede che calcia non scendeva sotto 1 m dal pallone, il piede d'appoggio scorreva 16 cm per fotogramma e stava in aria.
   Correzione in src/12 (_g177Prof: profilo ricavato dalla clip → tempo di partenza del pallone e posizione dell'eroe).

   Banco: quello del 170b (lib/gesti-170b.mjs), corpi 3D accesi, tempo virtuale (un fotogramma = 1/60 s di scena), ossa lette a ogni
   fotogramma; registrazione accesa gia' in attesa (lib/gesto-177.mjs, dove stanno le definizioni di ogni grandezza).
   Scene: gi5 az.0 (angolato), gi58 az.0, gi5 az.1 (cucchiaio).

   VERDE (gioco com'e'), 3 scene x 2 semi = 6 esecuzioni, tutte valide (una non valida = «non giudicato» = rosso). Ogni esecuzione deve
   rispettare TUTTE le soglie:
     1 sincronia       |dtPicco| <= 2 fotogrammi (picco di velocita' del piede che calcia ↔ partenza del pallone)
     2 contatto        punta - punto di battuta nel fotogramma di partenza <= 20 cm in 3D e <= 15 cm in pianta
                       (il piede fa 27 cm per fotogramma: a 60 fotogrammi al secondo meglio di ±14 cm in pianta non si puo' garantire;
                        la punta passa ~9 cm sotto il centro del pallone, quindi in 3D il massimo geometrico e' ~17 cm)
     3 piede d'appoggio caviglia non piu' di 20 cm sopra la sua quota in attesa · scorrimento mediano <= 3 cm per fotogramma
                       (soglia fissata DOPO la misura a copertura piena: verde 11,8-16,2 cm, rosso 35,6-50,9. Dei ~15 cm del verde, ~13
                        sono della clip `penalty`, che tiene i piedi piu' alti della posa d'attesa a bacino fermo: residuo dichiarato
                        nel rapporto, non e' il saltello che il giro ha tolto)
     4 pallone fermo   spostamento <= 15 cm nei 30 fotogrammi prima della partenza (non si «bara» portando il pallone al piede)
     5 nessuno scatto  al via: salto del bacino <= 12 cm e giro del busto <= 8° fra due fotogrammi; fino a 20 fotogrammi dopo la
                       partenza: giro del busto <= 12° per fotogramma
   ROSSO (window.__CPM_NO_G177), 3 scene x 1 seme: deve ridare il difetto in TUTTE — dtPicco >= 6 fotogrammi E contatto >= 60 cm —
   altrimenti «rosso non visto» = rosso.
   Uscita 0 solo con verde pulito e rosso visto. ~7 minuti. Braccio e motivo sono stampati per ultimi.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node gesto-177.mjs
        CPM_SOLO=verde|rosso · CPM_SEMI=1,2 · CPM_CASI='[[5,0]]' · CPM_FLAGS='{"__CPM_SI_PUN177":1}' (banco: nessun giudizio sul rosso)
        CPM_OUT=nome → scrive out/giro177/<nome>.json con ogni esecuzione */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, __dirname as LIBDIR } from './lib/harness.mjs';
import { pagina170 } from './lib/gesti-170b.mjs';
import { scena177, misura177, via177, riassunto177, fmt } from './lib/gesto-177.mjs';

const CASI = process.env.CPM_CASI ? JSON.parse(process.env.CPM_CASI) : [[5, 0], [58, 0], [5, 1]];
const SEMI = (process.env.CPM_SEMI || '1,2').split(',').map(Number);
const SOLO = process.env.CPM_SOLO || ''; const EXTRA = process.env.CPM_FLAGS ? JSON.parse(process.env.CPM_FLAGS) : {};
const S = { dt: 2, d3: 20, dp: 15, cav: 20, scorre: 3, fermo: 15, saltoVia: 12, giroVia: 8, giro: 12, rossoDt: 6, rossoD: 60 };

async function braccio(b, port, rosso) {
  const flags = { ...EXTRA }; if (rosso) flags.__CPM_NO_G177 = true;
  const out = []; let page = null, n = 0;
  for (const seme of (rosso ? [SEMI[0]] : SEMI)) for (const [gi, k] of CASI) {
    try {
      if (!page || n >= 4) { if (page) await page.context().close(); page = await pagina170(b, port, { flags }); n = 0; }
      n++;
      const R = await scena177(page, { gi, k, seme });
      const m = R.errore ? { errore: R.errore } : misura177(R); const v = R.errore ? null : via177(R);
      out.push({ gi, k, seme, ...m, ...(v || {}), g177: R.g177 ? { clip: R.g177.clip, tc: R.g177.tc, uPicco: R.g177.uPicco, pre: R.g177.pre, rincorsa: R.g177.rincorsa, scartoVia: R.g177.scartoVia } : null, errs: (page._errs || []).slice(0, 3), glb: page._glb });
      const x = out[out.length - 1];
      console.log(`${rosso ? 'rosso' : 'verde'} gi${gi} az.${k} seme ${seme}: ` + (x.errore ? 'NON VALIDA — ' + x.errore : `clip ${x.clip} · dtPicco ${x.dtPiccoF} f · contatto ${x.dContattoCm} cm (pianta ${x.dPiantaCm}) · appoggio caviglia +${x.appoggioCavigliaSuCm} cm, scorre ${x.appoggioScorreCmF} cm/f · pallone fermo ${x.palloneFermoCm} cm · via salto ${x.saltoViaCmF} cm giro ${x.giroViaGradiF}° · giro ${x.giroMaxGradiF}°`));
    } catch (e) { out.push({ gi, k, seme, errore: 'eccezione: ' + String(e.message).slice(0, 120) }); console.log(`gi${gi} az.${k} seme ${seme}: ERRORE ${String(e.message).slice(0, 120)}`); try { await page.context().close(); } catch (_) {} page = null; }
  }
  if (page) await page.context().close();
  return out;
}
const giudicaVerde = x => { const f = [];
  if (x.errore) return ['non valida: ' + x.errore]; if (!x.glb) f.push('corpi 3D non caricati'); if (x.errs && x.errs.length) f.push('errore di pagina: ' + x.errs[0]);
  if (x.gesto !== 'penalty') f.push('gesto alla partenza: ' + x.gesto);
  if (!(Math.abs(x.dtPiccoF) <= S.dt)) f.push(`sincronia ${x.dtPiccoF} f (soglia ±${S.dt})`);
  if (!(x.dContattoCm <= S.d3)) f.push(`contatto ${x.dContattoCm} cm (soglia ${S.d3})`); if (!(x.dPiantaCm <= S.dp)) f.push(`contatto in pianta ${x.dPiantaCm} cm (soglia ${S.dp})`);
  if (!(x.appoggioCavigliaSuCm != null && x.appoggioCavigliaSuCm <= S.cav)) f.push(`caviglia d'appoggio +${x.appoggioCavigliaSuCm} cm (soglia ${S.cav})`);
  if (!(x.appoggioScorreCmF <= S.scorre)) f.push(`appoggio scorre ${x.appoggioScorreCmF} cm/f (soglia ${S.scorre})`);
  if (!(x.palloneFermoCm <= S.fermo)) f.push(`pallone spostato ${x.palloneFermoCm} cm (soglia ${S.fermo})`);
  if (!(x.saltoViaCmF != null && x.saltoViaCmF <= S.saltoVia)) f.push(`salto al via ${x.saltoViaCmF} cm (soglia ${S.saltoVia})`);
  if (!(x.giroViaGradiF != null && x.giroViaGradiF <= S.giroVia)) f.push(`giro al via ${x.giroViaGradiF}° (soglia ${S.giroVia})`);
  if (!(x.giroMaxGradiF <= S.giro)) f.push(`giro del busto ${x.giroMaxGradiF}°/f (soglia ${S.giro})`);
  return f; };

const srv = await startServer(); const b = await launchBrowser(); const port = srv.address().port; const t0 = Date.now();
const verde = SOLO === 'rosso' ? null : await braccio(b, port, false);
const rosso = SOLO === 'verde' ? null : await braccio(b, port, true);
await b.close(); srv.close();
const stampa = (nome, L) => { const r = riassunto177(L); console.log(`\n${nome}: valide ${r.valide}/${r.esecuzioni} · clip ${r.clip.join(',')}\n  sincronia dtPicco ${fmt(r.dtPiccoF)} f · contatto ${fmt(r.dContattoCm)} cm · in pianta ${fmt(r.dPiantaCm)} cm · quota punta ${fmt(r.puntaQuotaCm)} cm\n  appoggio: caviglia +${fmt(r.appoggioCavigliaSuCm)} cm · quota punta ${fmt(r.appoggioQuotaCm)} cm · scorre ${fmt(r.appoggioScorreCmF)} cm/f\n  pallone fermo ${fmt(r.palloneFermoCm)} cm · giro del busto ${fmt(r.giroMaxGradiF)}°/f (dopo: ${fmt(r.giroDopoGradiF)}) · salto bacino ${fmt(r.saltoBacinoMaxCmF)} cm/f`); return r; };
const rv = verde ? stampa('VERDE', verde) : null, rr = rosso ? stampa('ROSSO (__CPM_NO_G177)', rosso) : null;
if (process.env.CPM_OUT) { const d = path.join(LIBDIR, '..', 'out', 'giro177'); fs.mkdirSync(d, { recursive: true }); fs.writeFileSync(path.join(d, process.env.CPM_OUT + '.json'), JSON.stringify({ soglie: S, flags: EXTRA, verde, rosso, riassunto: { verde: rv, rosso: rr } }, null, 1)); }
const motivi = [];
if (verde) { verde.forEach(x => { const f = giudicaVerde(x); if (f.length) motivi.push(`verde gi${x.gi} az.${x.k} seme ${x.seme}: ${f.join(' · ')}`); }); if (verde.length < CASI.length * SEMI.length) motivi.push('verde: esecuzioni mancanti (non giudicato)'); }
if (rosso && !process.env.CPM_FLAGS) { rosso.forEach(x => { if (x.errore) motivi.push(`rosso gi${x.gi} az.${x.k}: non valida (${x.errore})`); else if (!(x.dtPiccoF >= S.rossoDt && x.dContattoCm >= S.rossoD)) motivi.push(`ROSSO NON VISTO gi${x.gi} az.${x.k}: dtPicco ${x.dtPiccoF} f, contatto ${x.dContattoCm} cm (attesi >= ${S.rossoDt} f e >= ${S.rossoD} cm)`); }); }
console.log(`\n${((Date.now() - t0) / 60000).toFixed(1)} min`);
if (SOLO) console.log(`braccio unico (${SOLO}): solo misura, il guardiano completo vuole verde e rosso`);
if (motivi.length) { console.log('gesto-177: ROSSO'); for (const m of motivi) console.log('  ' + m); process.exit(1); }
if (SOLO) { console.log(`gesto-177: braccio ${SOLO} pulito (giudizio parziale: non vale come guardiano)`); process.exit(0); }
console.log('gesto-177: VERDE — verde pulito su ' + verde.length + ' esecuzioni, rosso visto su ' + rosso.length);
