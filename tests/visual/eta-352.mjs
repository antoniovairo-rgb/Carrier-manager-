#!/usr/bin/env node
/* [giro 352 · PO-613, foto docs/collaudo-po/201-evento-scarpini-veterano.jpg — «Fuori luogo per l'età dell'eroe, ha oltre 30 anni!»]
 * GUARDIANO «OGNI EVENTO HA L'ETA' GIUSTA» — non-gate, carriera, gira sulle tabelle e sulle condizioni VERE della pagina.
 *
 * Simula carriere sintetiche ma complete (16..37 anni, salto fra i pro, trasferimenti, capitano, Nazionale) e a ogni
 * settimana valuta i cinque mazzi settimanali di src/03 (WEEKLY_EVENTS · WEEKLY_RANDOM_EVENTS · SPOGLIATOIO_MOMENTS ·
 * WEEKLY_IMPULSES · VITA_EVENTS) col testo RISOLTO per quell'eroe. Il giudice e' indipendente dalle condizioni del
 * gioco: legge il testo e lo confronta con l'eta' e con gli anni nel club che la sonda conosce per costruzione.
 *   A  nessun evento «da giovane» (lo scherzo del veterano, la lezione del capitano, il premio miglior giovane...) e'
 *      eleggibile per un eroe oltre i 27 anni; nessun evento «da nuovo arrivato» per chi ha gia' chiuso una stagione
 *      nel club; nessun «per la prima volta» fuori dai primi anni; nessuna variante «dal lato del veterano» a un ragazzo.
 *   B  le estrazioni VERE del motore di vita (pickVitaEvent + markVitaEvent, 15% a settimana) non danno nulla fuori eta'.
 *   C  copertura: ogni testo dei cinque mazzi che parla di eta' o anzianita' e' classificato (regola o neutro dichiarato);
 *      la sonda deve riconoscere almeno 20 eventi (altrimenti e' cieca).
 *   D  i trentenni hanno la loro parte: varianti dal lato del veterano eleggibili e uscite davvero.
 * Rosso: window.__CPM_NO_G352 = condizioni e testi di prima (A e B devono cadere).
 * Uso: node eta-352.mjs  ·  CPM_PROVA_ROSSO=1 node eta-352.mjs (gira anche il rosso e pretende che cada). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

/* ── il giudice: testo → pubblico ── */
const REGOLE = [
  { k: 'giovane', re: /Il veterano fischietta|Un veterano dello spogliatoio ti svela|Un veterano della squadra si offre di allenarti|Il capitano ti trattiene a fine allenamento|futuro da titolare|miglior giovane|giovani europei|under-23|talento del momento|Il veterano ti si siede accanto|Battesimo dello spogliatoio dei grandi|l'esordiente canta|vecchio professore/ },
  { k: 'nuovo', re: /ti porta in giro per la città|Trovi casa vicino al centro sportivo|Inizi a studiare la lingua locale|l'unico senza «l'orologio della squadra»|non c'erano ancora le tue/ },
  { k: 'primi', re: /per la prima volta nello stadio grande|al primo anno parla il campo/ },
  { k: 'primaNaz', re: /per la prima volta in una lista ufficiale della nazionale/ },
  { k: 'veterano', re: /la tradizione l'hai portata tu|ti chiede i segreti del mestiere|trattieni il ragazzo/ },
];
const GIUDICE = {
  giovane: (s) => s.age <= 27,
  nuovo: (s) => s.anniClub === 0,
  primi: (s) => s.age <= 23 || (s.pro && s.anniPro <= 1),
  primaNaz: (s) => s.caps === 0,
  veterano: (s) => s.age >= 27,
};
/* testi che nominano eta' o anzianita' ma non la presuppongono nell'eroe (dichiarati, col perche') */
const NEUTRI = [
  [/ragazzo della Primavera ti chiede|giocatore della primavera ti chiede/i, "l'eroe e' il piu' grande: condizione «pro»"],
  [/vecchio video da ragazzino/, 'ricordo, vale a ogni eta\''],
  [/ragazzi della scuola calcio|ai suoi ragazzi|Due ragazzi del tuo primo|ispirare i giovani|i ragazzi ripetono/, "i ragazzi sono altri, l'eroe e' il modello"],
  [/karaoke d'iniziazione per i nuovi/, "l'eroe guarda, non e' il nuovo"],
  [/vecchio idolo|vecchio massaggiatore|vecchi tempi/, "il vecchio e' un altro"],
  [/Rimarrai qui con noi per anni|il ritiro|appendo gli scarpini|ultima stagione|L'ultima/i, 'addio: condizione sulla stagione annunciata'],
];
const ETA_RE = /veteran|giovan|esordient|ragazz|primo anno|da anni|iniziazion|prima volta|vecchi[oa]? |under-2/i;

const SIM = ({ rosso, N }) => {
  if (rosso) window.__CPM_NO_G352 = true; else delete window.__CPM_NO_G352;
  let seed = 352; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const realRandom = Math.random; Math.random = rnd;
  const T = (t, p) => { try { return typeof t === 'function' ? t(p) : (t || ''); } catch (e) { return ''; } };
  const ok = (e, p) => { if (!e.cond) return true; try { return !!e.cond(p); } catch (_e) { return false; } };
  const testo = (e, p) => { const ev = e.event || {}; return [T(e.txt, p) || T(ev.txt, p) || T(e.text, p), ...(e.choices || []).map(c => T(c.txt, p))].join(' ¦ '); };
  const POOLS = { WEEKLY_EVENTS, WEEKLY_RANDOM_EVENTS, SPOGLIATOIO_MOMENTS, WEEKLY_IMPULSES, VITA_EVENTS };
  const CLUBS = [{ id: 'z1', n: 'FC Uno', lg: 'Lega A', p: 70 }, { id: 'z2', n: 'FC Due', lg: 'Lega A', p: 76 }, { id: 'z3', n: 'FC Tre', lg: 'Lega A', p: 80 }, { id: 'z4', n: 'FC Quattro', lg: 'Lega A', p: 66 }];
  const out = { righe: [], vita: [], settimane: 0, vitaUscite: 0, vetVita: 0, vetEleg: 0 };
  const chiave = (pool, e, i) => pool + ':' + (e.id || i);
  for (let c = 0; c < N; c++) {
    const proS = 2 + (c % 2), capAt = (c % 3 === 0) ? 99 : 28 + (c % 4), capsAt = (c % 2) ? 22 : 99;
    const trasf = [5 + (c % 4), 10 + (c % 5), 15 + (c % 3)];
    let clubIdx = c % CLUBS.length, anniClub = 0, history = [], vitaState = {};
    for (let s = 1; s <= 22; s++) {
      if (s > 1 && (trasf.includes(s) || (s === proS && c % 2))) { clubIdx = (clubIdx + 1) % CLUBS.length; anniClub = 0; }/* meta' delle carriere passa fra i pro in un altro club */
      const age = 15 + s, pro = s >= proS, anniPro = pro ? s - proS : -1;
      const ovr = Math.round(Math.min(84, 58 + s * 2.2) - Math.max(0, age - 31) * 2);
      for (let w = 1; w <= 38; w++) {
        const club = pro ? CLUBS[clubIdx] : { ...CLUBS[clubIdx], n: CLUBS[clubIdx].n + ' Primavera', isU18: true };/* come U18_CLUBS (src/02): la Primavera ha lo STESSO id del club */
        const p = { name: 'Eroe ' + c, nation: 'Italia', age, season: s, week: w, proStatus: pro ? 'pro' : 'u18', proSeason: pro ? proS : undefined, club,
          ovr, popularity: Math.min(90, 15 + s * 4), coachTrust: 50 + ((c * 7 + s) % 30), form: 40 + ((c * 11 + w) % 45), morale: 60,
          squadRole: age < 19 ? 'primavera' : (age > 32 ? 'rotazione' : (s % 3 ? 'titolare' : 'rotazione')), isCaptain: age >= capAt,
          nationalCaps: age >= capsAt ? (age - capsAt) * 4 + 1 : 0, goals: (w * 3 + c) % 9, matches: Math.floor(w * 0.7), totalMatches: s * 25,
          matchHistory: [{ goals: (w + c) % 3 === 0 ? 1 : 0, won: w % 2 === 0 }], history: history.slice(), hasAgent: age >= 20, agent: age >= 20 ? { name: 'Ag' } : null,
          bankBalance: s * 120000, calendar: [], ...vitaState };
        const st = { age, anniClub, pro, anniPro, caps: p.nationalCaps };
        out.settimane++;
        for (const [pool, arr] of Object.entries(POOLS)) {
          const eleg = arr.filter(e => ok(e, p));
          const wTot = eleg.reduce((a, e) => a + (pool === 'WEEKLY_EVENTS' ? (e.w || 1) : 1), 0) || 1;
          for (const e of eleg) {
            const tx = testo(e, p);
            const r = out.righe; r.push([chiave(pool, e, arr.indexOf(e)), tx.slice(0, 160), st.age, st.anniClub, st.pro ? 1 : 0, st.anniPro, st.caps, pool === 'VITA_EVENTS' ? 0 : ((pool === 'WEEKLY_EVENTS' ? (e.w || 1) : 1) / wTot)]);
          }
        }
        /* estrazione vera del motore di vita */
        if (rnd() < 0.15) { const v = pickVitaEvent(p); if (v && v.ev) { out.vitaUscite++; const tx = testo(v.ev, p); out.vita.push([v.ev.id, tx.slice(0, 160), st.age, st.anniClub, st.pro ? 1 : 0, st.anniPro, st.caps]); vitaState = { ...vitaState, ...markVitaEvent(p, v.ev) }; } }
      }
      history.push({ season: s, clubId: CLUBS[clubIdx].id }); anniClub++;
    }
  }
  Math.random = realRandom;
  /* compressione: una riga per (evento, testo, stato) */
  const m = new Map(); for (const r of out.righe) { const k = r.slice(0, 7).join('|'); const x = m.get(k); if (x) { x[7] += r[7]; x[8]++; } else m.set(k, [...r.slice(0, 8), 1]); }
  out.righe = [...m.values()];
  /* tutti i testi, risolti per un ragazzo e per un veterano: per la copertura */
  const tutti = new Set();
  for (const p of [{ age: 17, season: 1, week: 5, proStatus: 'u18', club: CLUBS[0], history: [] }, { age: 33, season: 18, week: 5, proStatus: 'pro', proSeason: 3, club: CLUBS[1], history: [{ clubId: 'z2' }, { clubId: 'z2' }, { clubId: 'z2' }] }])
    for (const [pool, arr] of Object.entries(POOLS)) arr.forEach((e, i) => tutti.add(chiave(pool, e, i) + '\t' + testo(e, p)));
  out.tutti = [...tutti];
  delete window.__CPM_NO_G352;
  return out;
};

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
async function braccio(rosso) {
  const page = await (await browser.newContext()).newPage(); await installCdnRoutes(page);
  const err = []; page.on('pageerror', e => err.push(String(e.message).slice(0, 140)));
  for (let t = 0; t < 3; t++) { try { await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); break; } catch (e) { if (t === 2) throw e; } }
  await sleep(600);
  const d = await page.evaluate(SIM, { rosso, N: 16 });
  await page.close();
  const guasti = [];
  const classe = (tx) => REGOLE.filter(r => r.re.test(tx)).map(r => r.k);
  const sbagli = new Map(); let attese = 0, riconosciuti = new Set(), vetEleg = 0;
  for (const [k, tx, age, anniClub, pro, anniPro, caps, peso, n] of d.righe) {
    const st = { age, anniClub, pro: !!pro, anniPro, caps };
    const cl = classe(tx); if (cl.length) riconosciuti.add(k);
    if (cl.includes('veterano') && age >= 30) vetEleg += n;
    const fuori = cl.filter(c => !GIUDICE[c](st));
    if (fuori.length) { const x = sbagli.get(k) || { tx, n: 0, att: 0, eta: new Set(), cl: fuori }; x.n += n; x.att += peso; x.eta.add(age); sbagli.set(k, x); attese += peso; }
  }
  let vitaFuori = 0, vetVita = 0; const vitaSb = {};
  for (const [id, tx, age, anniClub, pro, anniPro, caps] of d.vita) {
    const cl = classe(tx); const st = { age, anniClub, pro: !!pro, anniPro, caps };
    if (cl.includes('veterano') && age >= 30) vetVita++;
    if (cl.some(c => !GIUDICE[c](st))) { vitaFuori++; vitaSb[id] = (vitaSb[id] || 0) + 1; }
  }
  /* copertura */
  const scoperti = [];
  for (const riga of d.tutti) { const [k, tx] = riga.split('\t'); if (!ETA_RE.test(tx)) continue; if (classe(tx).length) { riconosciuti.add(k); continue; }
    if (NEUTRI.some(([re]) => re.test(tx))) continue; scoperti.push(k + ' — ' + tx.slice(0, 90)); }
  const tag = rosso ? 'ROSSO' : 'VERDE';
  console.log(`\n── braccio ${tag}: ${d.settimane} settimane di carriera (16 carriere × 22 stagioni × 38) · estrazioni vere di vita ${d.vitaUscite}`);
  console.log(`   A eventi eleggibili fuori eta': ${sbagli.size} distinti · settimane-evento ${[...sbagli.values()].reduce((a, x) => a + x.n, 0)} · uscite attese (una pescata a settimana per mazzo) ${attese.toFixed(1)}`);
  [...sbagli.entries()].sort((a, b) => b[1].n - a[1].n).forEach(([k, x]) => console.log(`     ✗ ${k} [${x.cl}] ${x.n} sett. · età ${Math.min(...x.eta)}-${Math.max(...x.eta)} · ${x.tx.slice(0, 70)}`));
  console.log(`   B estrazioni vere di vita fuori eta': ${vitaFuori} ${JSON.stringify(vitaSb)}`);
  console.log(`   C eventi riconosciuti dal giudice: ${riconosciuti.size} · testi d'eta' non classificati: ${scoperti.length}`);
  scoperti.forEach(s => console.log('     ? ' + s));
  console.log(`   D trentenni: varianti del veterano eleggibili ${vetEleg} settimane-evento · uscite davvero dal motore di vita ${vetVita}`);
  if (err.length) guasti.push('errori di pagina: ' + err.slice(0, 2).join(' · '));
  if (sbagli.size) guasti.push(`A: ${sbagli.size} eventi eleggibili per un eroe dell'eta' sbagliata`);
  if (vitaFuori) guasti.push(`B: ${vitaFuori} estrazioni vere di vita fuori eta'`);
  if (riconosciuti.size < 20) guasti.push(`C: solo ${riconosciuti.size} eventi riconosciuti (sonda cieca)`);
  if (scoperti.length) guasti.push(`C: ${scoperti.length} testi d'eta' senza classe`);
  if (!vetEleg || !vetVita) guasti.push(`D: ai trentenni non tocca nessuna variante dal lato del veterano (eleggibili ${vetEleg}, uscite ${vetVita})`);
  if (d.vitaUscite < 500) guasti.push(`B: solo ${d.vitaUscite} estrazioni di vita (non giudicato)`);
  console.log(`   ${guasti.length ? '✗ ' + guasti.join(' | ') : '✓ verde'}`);
  return guasti;
}
const gv = await braccio(false);
let esito = gv.length === 0;
if (process.env.CPM_PROVA_ROSSO) {
  const gr = await braccio(true);
  const cade = gr.some(g => g.startsWith('A:')) && gr.some(g => g.startsWith('B:') || g.startsWith('D:'));
  console.log(`\nprova del rosso (__CPM_NO_G352): ${cade ? 'cade come deve ✓' : 'NON cade ✗ (guardiano cieco)'}`);
  esito = esito && cade;
}
await browser.close(); srv.close();
console.log(`\neta-352: ${esito ? 'VERDE' : 'ROSSO'}`);
process.exit(esito ? 0 : 1);
