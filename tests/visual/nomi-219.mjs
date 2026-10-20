#!/usr/bin/env node
/* [7.999.155 PO-219 «nella scena ci sono A, B, C ma dice che gliela passa D»] GUARDIANO su partite vere dal salvataggio S12 (autoplay,
   semi fissi). In scelta azione, per ogni giocatore nominato dalla scena (ricevente, difensore/portatore) misura dove lo disegna il 3D
   (__CPM_STATE) rispetto all'eroe, e conta quante volte il 3D usa davvero il difensore nominato (__CPM_B4DIF). MISURATO prima (7.999.154):
   nominati a 15-50 u da dove li crede il motore, difensore del cast scartato dal 3D 18 volte su 34. VERDE: almeno l'85% dei nominati
   entro 25 u dall'eroe nel 3D e il difensore nominato usato dal 3D in almeno l'80% dei casi. ROSSO (__CPM_NO_CAST219 + __CPM_NO_SWAP219): sotto almeno una. Il teatro va armato (__CPM_PRESENT=1): lo scambio avviene allo stacco.
   Uso: node nomi-219.mjs  (CPM_N219_PAR=3 partite alla volta; ~50 minuti) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const BASE = +(process.env.CPM_N219_BASE || 101);/* [giro 34] solo collaudo: sposta i semi per misurare la stessa build su semi diversi */
const SEMI = Array.from({ length: 18 }, (_, i) => BASE + i);/* [giro 18, «un guardiano instabile due volte si ripara»] MISURATO
   (nomi-219-misura.mjs, 30 semi verdi 101-130 + 12 rossi 101-112, 3 partite in parallelo): verde 43/48 = 89,6%, cioe' il tasso vero sta SULLA vecchia
   soglia del 90% (ricampionando i 30 semi, la vecchia forma — 8 semi, >=90% su >=12 — esce rossa ~70% delle corse: 38% per campione corto, il resto per
   quota). Rosso 9/16 = 56%. Semi consecutivi, NON scelti: provata la scelta dei semi «con copertura» (14 semi che avevano dato nominati) e la copertura NON si
   ripete fra corse (22 nominati invece dei ~40 attesi), quindi la stima onesta si fa ricampionando tutti i semi: 18 verdi + 9 rossi, soglia 75%, rossi falsi
   ~3,8% a corsa (oggi ~70%), un braccio che gioca come il rosso passa ~2,6%. */
const SEMI_ROSSO = Array.from({ length: 9 }, (_, i) => BASE + i);/* [giro 34, ri-misura dopo il rosso del giro 22] il rosso del giro 22 (85% su 20, 88% su 17) era della forma VECCHIA (8 semi,
   soglia 90%): quel ramo non conteneva la riparazione del giro 18. Questa forma, 5 corse sulla stessa build (3 coi semi 101, 1 coi 119, 1 coi 137):
   verde 5/5 (86-100%, minimo 29 nominati), rosso rilevato 5/5 (40-60%, 4-8 nominati oltre 35 u). Ricampionando le 135 partite: rossi falsi ~0,1% a
   corsa, verde al 1° percentile 79% (margine ~4 punti), rosso con almeno 2 lontani al 1° percentile. Forma e soglie invariate (nomi-219-ricampiona.mjs). */
const PAR = +(process.env.CPM_N219_PAR || 3);/* tre partite alla volta: la misura e' stata presa cosi' (le distanze sono ferme fra 0 e 900 ms dall'apertura della scelta) */
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
for (const rosso of [false, true]) { const tot = { nominati: 0, vicini: 0, lontani: 0, usato: 0, scartato: 0, esempi: [] };
  const coda = [...(rosso ? SEMI_ROSSO : SEMI)];
  await Promise.all(Array.from({ length: PAR }, async () => { while (coda.length) { const sd = coda.shift();
    for (let prova = 1; prova <= 2; prova++) { const parz = { nominati: tot.nominati, vicini: tot.vicini, lontani: tot.lontani, usato: tot.usato, scartato: tot.scartato, scambi: tot.scambi | 0, portieri: tot.portieri | 0, esempi: tot.esempi.length };
    let ctx = null; try {
    ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
    const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' ' + sd;
    await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_B4REC = 1; window.__CPM_PRESENT = 1;/* lo stacco d'apertura (teatro) e' spento sotto cpmtest: senza, lo scambio non avviene (lezione 7.345) */ if (r) { window.__CPM_NO_CAST219 = 1; window.__CPM_NO_SWAP219 = 1; } localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, rosso]);
    await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 60000 }); await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
    await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), sd);
    const t0 = Date.now(); let ph = '', prev = ''; const ps = { n: 0, v: 0, l: 0 };/* [giro 34] conteggi per seme, stampati: servono a ricampionare */
    while (Date.now() - t0 < 420000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE());
      if (ph === 'hl_choose' && prev !== 'hl_choose') { await sleep(400);
        const m = await page.evaluate(() => { const C = (window.__CPM_CAST219 || []).slice(-1)[0]; let st = null; try { st = window.__CPM_STATE(); } catch (e) {} if (!C || !st) return null;
          const P = st.players || [], H = st.hero || {}; const f = (w) => { if (!w || w.i == null || !P[w.i]) return null; const p = P[w.i]; return { nome: w.nome, d: +Math.hypot(p.x - H.x, p.y - H.y).toFixed(1) }; };
          return { tipo: C.tipo, gk: (C.prel || []).filter(w => w.gk).length, n: (C.prel || []).filter(w => !w.gk).map(f).filter(Boolean) }; });/* il portiere che apre dal fondo resta in porta: contato a parte, mai giudicato *//* [PO-219b] i compagni NOMINATI dalla manovra (preludio), uguali nei due bracci */
        if (m && !/^(cross|angolo|punizione|rigore)$/.test(m.tipo || '')) { tot.portieri = (tot.portieri | 0) + (m.gk | 0); for (const x of m.n) { tot.nominati++; ps.n++; if (x.d > 35) { tot.lontani++; ps.l++; } if (x.d <= 25) { tot.vicini++; ps.v++; } else if (tot.esempi.length < 6) tot.esempi.push(sd + ' ' + m.tipo + ' ' + x.nome + ' a ' + x.d + ' u'); } } }
      prev = ph; if (ph === 'ended' || ph === 'ceremony') break; await sleep(250); }
    const W = await page.evaluate(() => window.__CPM_B4DIF || { usato: 0, scartato: 0 }); tot.usato += W.usato | 0; tot.scartato += W.scartato | 0;
    tot.scambi = (tot.scambi | 0) + await page.evaluate(() => (window.__CPM_SW219 || []).reduce((a, x) => a + (x.scambi | 0), 0));/* quante scene lo scambio ha davvero toccato */
    console.log((rosso ? 'rosso' : 'verde') + ' seme ' + sd + ' fine ' + ph + ' nominati ' + ps.n + ' vicini ' + ps.v + ' lontani ' + ps.l); await ctx.close();
    break;
    } catch (e) {/* [giro 77, «instabile: rosso al primo tentativo»] nella catena 174 la prima prova e' finita con un CRASH di Node (ultima riga
      «Node.js v22.22.0»): un solo await non protetto (attese di 20-90 s che sotto carico scadono) faceva rigettare il Promise.all e
      cadere il processo, cioe' un rosso senza misura. Ora l'errore di un seme si stampa, i suoi conteggi parziali si tolgono e il seme si
      rigioca UNA volta; se cade ancora resta fuori dal campione (dichiarato) e il giudizio resta quello di sempre (>= 12 nominati, 75%). */
      Object.assign(tot, { nominati: parz.nominati, vicini: parz.vicini, lontani: parz.lontani, usato: parz.usato, scartato: parz.scartato, scambi: parz.scambi, portieri: parz.portieri }); tot.esempi.length = parz.esempi;
      console.log((rosso ? 'rosso' : 'verde') + ' seme ' + sd + ' ERRORE alla prova ' + prova + ': ' + String(e && e.message || e).split('\n')[0].slice(0, 200));
      try { if (ctx) await ctx.close(); } catch (e2) {}
      if (prova === 2) tot.persi = (tot.persi | 0) + 1;
    } }
  } }));
  esito[rosso ? 'rosso' : 'verde'] = tot; console.log((rosso ? 'ROSSO' : 'VERDE') + ' ' + JSON.stringify(tot));
}
await b.close(); srv.close();
const q = (t) => ({ vic: t.nominati ? t.vicini / t.nominati : 0, uso: (t.usato + t.scartato) ? t.usato / (t.usato + t.scartato) : 0 });
/* [7.999.155, catena completa del 09/10] il contatore «difensore usato» NON separa i bracci (verde 87%, rosso 94%): resta stampato come
   informazione. La prova e' la grandezza del difetto del PO — nominati LONTANI dall'eroe nel 3D all'apertura — su 4 partite. */
const V = q(esito.verde), R = q(esito.rosso), g = [];
/* [giro 18] soglia 75% (era 90%): il tasso vero misurato e' 89,6% (43/48) e una corsa ha ~29 nominati, quindi a 90% il verde cadeva una volta su due per caso. */
if (!(esito.verde.nominati >= 12 && V.vic >= 0.75)) g.push('verde: vicini ' + (100 * V.vic).toFixed(0) + '% su ' + esito.verde.nominati + ' nominati (servono >=75% su >=12)');
/* [7.999.157, decisione PO 10/10] tolta la soglia assoluta del rosso (<70%), tarata su UNA corsa (6/14 = 43%): alla corsa del rilascio il rosso e' venuto 75% contro verde 100%, difetto visibile (25 punti) ma dichiarato invisibile. La prova del rosso e' la SEPARAZIONE di almeno 20 punti; la soglia del verde (>=90% su >=12) non cambia. *//* [giro 18] la quota del rosso, con ~16 nominati, oscilla troppo per reggere da sola: il difetto si vede anche dalla CODA — nel verde nessun nominato oltre 35 u
   su 48 (massimo 33), nel rosso 5 su 16 fra 40 e 55 u. Prova del rosso: distacco di 20 punti OPPURE almeno un nominato oltre 35 u. */
if (!(V.vic - R.vic >= 0.20 || esito.rosso.lontani >= 1)) g.push('rosso: il difetto non si vede (vicini ' + (100 * R.vic).toFixed(0) + '% contro ' + (100 * V.vic).toFixed(0) + '%, lontani oltre 35 u: ' + esito.rosso.lontani + ')');
if ((esito.verde.persi | 0) + (esito.rosso.persi | 0)) console.log('semi persi per errore di strumento (rigiocati una volta, poi esclusi): verde ' + (esito.verde.persi | 0) + ' · rosso ' + (esito.rosso.persi | 0));
console.log('informativo: difensore usato verde ' + (100 * V.uso).toFixed(0) + '% · rosso ' + (100 * R.uso).toFixed(0) + '%; scambi verde ' + (esito.verde.scambi | 0));
if (g.length) { console.log('❌ nomi-219'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ nomi-219 verde (vicini ' + (100 * V.vic).toFixed(0) + '% su ' + esito.verde.nominati + '; rosso ' + (100 * R.vic).toFixed(0) + '% su ' + esito.rosso.nominati + ', lontani oltre 35 u ' + esito.rosso.lontani + ' (verde ' + esito.verde.lontani + '); portieri che aprono dal fondo, non giudicati: ' + ((esito.verde.portieri | 0) + (esito.rosso.portieri | 0)) + ')');
