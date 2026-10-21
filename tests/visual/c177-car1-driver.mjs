/* Collaudo 177 carriera 1 — pilota della carriera intera (telefono 412x915), riprendibile.
   Uso: node c177-car1-driver.mjs <salvataggio.json> [--min=minuti] [--stop=S<stagione>W<settimana>] [--live=N] [--glb=0|1]
   Gioca dalla UI vera (tasto principale data-cpm=avanza23, finestre, partita dal vivo con gli highlight) e scrive:
   dati-carriera-177-1/registro.jsonl (una riga a settimana), eventi.jsonl (finestre e scelte), highlight.jsonl, difetti-grezzi.jsonl.
   Salva lo stato in dati-carriera-177-1/stato-corrente.json a ogni settimana. */
import { apri, shot, testo, sleep, DATI, FOTO, caricaCarriera, bottoni, clic, overlay, clicIn, cta, snap, giocaPartita, dumpLS, log, dif, scrollSu } from './c177-car1-lib.mjs';
import fs from 'node:fs'; import path from 'node:path';

const arg = Object.fromEntries(process.argv.slice(3).map(a => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a, true]; }));
const SAVE = process.argv[2];
const MIN = +(arg.min || 100); const T_END = Date.now() + MIN * 60000;
const LIVE_EVERY = +(arg.live || 4);
const AUTO = process.env.FOTOAUTO || '/tmp/claude-0/-home-user/394ea3c3-9288-5fc6-bf47-a074e31528b0/scratchpad/fotoauto';
fs.mkdirSync(AUTO, { recursive: true }); fs.mkdirSync(path.join(AUTO, 'hl'), { recursive: true });
const EV = path.join(DATI, 'eventi.jsonl'), HL = path.join(DATI, 'highlight.jsonl'), STATO = path.join(DATI, 'stato-corrente.json'), DRV = path.join(DATI, 'driver-stato.json');
const app = (f, o) => fs.appendFileSync(f, JSON.stringify(o) + '\n');

let drv = fs.existsSync(DRV) ? JSON.parse(fs.readFileSync(DRV, 'utf8')) : { partiteViste: 0, live: 0, sim: 0, vistiKind: {}, foto: 0, impIdx: 0, ultimaSettimanaLog: null };
const saveDrv = () => fs.writeFileSync(DRV, JSON.stringify(drv));

const save = JSON.parse(fs.readFileSync(SAVE, 'utf8')); save['cpm-match-speed'] = '2';
const g = await apri({ save, glb: arg.glb !== '0' });
const { page } = g;
await caricaCarriera(page);

const hash = s => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
const fotoAuto = async (nome) => { try { await page.screenshot({ path: path.join(AUTO, nome + '.png') }); } catch (e) {} };
const P = () => snap(page);
const ctxNow = async () => { const p = await P(); return p && typeof p === 'object' ? { s: p.season, w: p.week, club: p.club && p.club.n } : {}; };

/* ---- analisi testi ---- */
const SOSPETTI = [
  [/undefined|NaN|\[object|null\b/i, 'valore tecnico visibile'],
  [/Finalizzatore|Stile di gioco|Enfant/i, 'residuo stile (PO-287)'],
  [/\b1 gols\b|\b1 partite\b|\b1 assists\b|\b1 stagioni\b|\b1 anni\b|\b0 gol\b.*\b1 gol\b/i, 'concordanza numero'],
  [/  +[a-zà-ù]/, 'doppio spazio'],
  [/\bun'[a-z]*[ao]\b(?=.*maschile)/i, 'apostrofo'],
  [/[.]{4,}|!!|\?\?/, 'punteggiatura'],
  [/Non posso confermarlo|prototipo|TODO|debug|__CPM/i, 'nota interna'],
  [/€\s*-|-\s*€\s*\d.*-\s*€|NaN€/, 'importo strano'],
];
async function scanTesto(txt, dove) {
  const c = await ctxNow();
  for (const [rx, nome] of SOSPETTI) { const m = txt.match(rx); if (m) dif({ tipo: 'testo', nome, estratto: txt.slice(Math.max(0, m.index - 60), m.index + 90).replace(/\n/g, ' | '), dove, ...c }); }
}

/* ---- gestione finestre ---- */
const DANGER = /^(Rifiuta|Non ora|Chiudi|Salta|Annulla|No\b|Lascia)/i;
async function gestisciOverlay(o, contesto) {
  const c = await ctxNow(); const txt = o.txt; const kind = (txt.replace(/\n/g, ' ').slice(0, 40) + '|' + o.btns.length);
  await scanTesto(txt, 'finestra');
  let idx = 0, tipo = 'altro';
  const b = o.btns;
  const iv = b.findIndex(x => /Gioca la partita|Gioca · parti dalla panchina/.test(x));
  if (iv >= 0 && b.some(x => /Simula/.test(x))) {
    tipo = 'prompt-partita';
    drv.partiteViste++;
    const live = (drv.partiteViste % LIVE_EVERY === 1) || drv.forzaLive;
    drv.forzaLive = false;
    idx = live ? iv : b.findIndex(x => /Simula/.test(x));
    drv.prossima = live ? 'live' : 'sim'; saveDrv();
  } else if (/Impulso della settimana|Tensione|Opportunit|Scelta|Conseguenza|Il seguito|Esordio/i.test(txt.slice(0, 200)) && b.length >= 2) {
    tipo = 'impulso'; drv.impIdx++; idx = (hash(txt) + drv.impIdx) % b.length;
    for (let k = 0; k < b.length && (DANGER.test(b[idx]) || /🔒/.test(b[idx])); k++) idx = (idx + 1) % b.length;
  } else if (/Offerta|offre|trasferimento|Proposta|prestito/i.test(txt.slice(0, 300)) && b.some(x => /Accett/i.test(x))) {
    tipo = 'offerta'; idx = decidiOfferta(txt, b);
  } else if (/rinnov|contratto/i.test(txt.slice(0, 300)) && b.some(x => /Accett|Rinnova|Firma/i.test(x))) {
    tipo = 'rinnovo'; idx = b.findIndex(x => /Accett|Rinnova|Firma/i.test(x));
  } else {
    // scelta generica: primo bottone non "distruttivo"; se tutti lo sono, il primo
    const nd = b.findIndex(x => !DANGER.test(x) && !/^Chiudi/.test(x));
    idx = nd >= 0 ? nd : 0;
    if (b.length >= 3 && /\?|scegli|decidi/i.test(txt)) { tipo = 'scelta'; drv.impIdx++; idx = (hash(txt) + drv.impIdx) % (b.length - (DANGER.test(b[b.length - 1]) ? 1 : 0)); }
  }
  if (idx < 0) idx = 0;
  if (/🔒/.test(b[idx])) { const f = b.findIndex(x => !/🔒/.test(x) && !DANGER.test(x)); if (f >= 0) idx = f; }
  const rec = { ...c, tipo, txt: txt.slice(0, 700), btns: b, scelta: b[idx] };
  app(EV, rec);
  if (!drv.vistiKind[kind] && drv.foto < 400) { drv.vistiKind[kind] = 1; drv.foto++; await fotoAuto(`ev-S${c.s}W${c.w}-${tipo}-${hash(kind) % 9999}`); }
  await clicIn(page, idx); await sleep(tipo === 'prompt-partita' ? 1200 : 600);
  return tipo;
}
function decidiOfferta(txt, b) {
  // accetta se l'offerta nomina un club con prestigio maggiore (si legge "Prestigio N") o una promozione da Primavera a prima squadra
  const acc = b.findIndex(x => /Accett/i.test(x)); const ri = b.findIndex(x => /Rifiut/i.test(x));
  const m = [...txt.matchAll(/Prestigio\s*(\d+)/gi)].map(x => +x[1]);
  if (m.length >= 2 && m[0] > m[1] + 3) return acc >= 0 ? acc : 0;
  if (/prima squadra|professionist|contratto pro/i.test(txt)) return acc >= 0 ? acc : 0;
  return ri >= 0 ? ri : 0;
}

/* ---- partita dal vivo ---- */
async function partitaLive() {
  const c = await ctxNow(); const p0 = await P(); drv.live++; saveDrv();
  // pre-partita: formazioni -> ingresso (si guarda l'ingresso 1 volta su 5, altrimenti si salta)
  let guardaIngresso = (drv.live % 8 === 1);
  for (let i = 0; i < 12; i++) { const ph = await page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null); if (ph === 'matchday') { await clic(page, /Vedi le formazioni/); await sleep(1200); break; } await sleep(600); }
  const tIng = Date.now();
  if (guardaIngresso) {
    await clic(page, /Ingresso in campo/); let k = 0;
    while (Date.now() - tIng < 200000) { await sleep(2000); k++; if (k % 3 === 1) await fotoAuto(`ingresso-S${c.s}W${c.w}-${k}`); const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph === 'playing' || ph === 'hl_intro') break; }
    app(EV, { ...c, tipo: 'ingresso', msIngresso: Date.now() - tIng });
  } else { await clic(page, /Salta l'ingresso/); await sleep(1500); }
  const r = await giocaPartita(page, { tag: '', politica: (n, sc) => (hash(c.s + ':' + c.w) + n) % sc.length, foto: 0, tag: `S${c.s}W${c.w}-`, fotoDir: path.join(AUTO, 'hl') });
  if (r.ph === 'timeout') dif({ tipo: 'partita', nome: 'timeout partita live', ...c });
  await fotoAuto(`fine-S${c.s}W${c.w}`);
  const fine = (await testo(page));
  app(HL, { ...c, tipo: 'partita', n: r.hls.length, ms: r.ms, hls: r.hls, schede: r.schede, fine: fine.slice(0, 1800) });
  await scanTesto(fine, 'post-partita');
  // post-partita: porta fuori fino alla dashboard
  await ripulisci('post');
  const p1 = await P();
  verificaPartita(c, p0, p1, r, fine);
  return r;
}
function verificaPartita(c, p0, p1, r, fine) {
  try {
    const g0 = p0.matchHistory.length, g1 = p1.matchHistory.length;
    const mh = p1.matchHistory[p1.matchHistory.length - 1];
    if (g1 !== g0 + 1) dif({ tipo: 'coerenza', nome: 'matchHistory non cresce di 1 dopo partita live', g0, g1, ...c });
    const sc = fine.match(/(\d+)\s*[–-]\s*(\d+)/); const tab = fine.match(/⚽\n?(\d+)\nGol\n.*🎯\n?(\d+)\nAssist/s);
    const ge = fine.match(/IL TUO TABELLINO[\s\S]*?⚽\s*(\d+)\s*Gol\s*🎯\s*(\d+)\s*Assist/);
    if (mh && ge) {
      if (+ge[1] !== mh.goals) dif({ tipo: 'coerenza', nome: 'gol del tabellino != gol registrati', tab: ge[1], reg: mh.goals, ...c });
      if (+ge[2] !== mh.assists) dif({ tipo: 'coerenza', nome: 'assist del tabellino != registrati', tab: ge[2], reg: mh.assists, ...c });
    }
    if (mh && sc) { const a = +sc[1], b = +sc[2]; const ex = mh.isHome === false ? [mh.awayScore, mh.homeScore] : [mh.homeScore, mh.awayScore]; if (!(a === ex[0] && b === ex[1])) dif({ tipo: 'coerenza', nome: 'punteggio finale != registrato', fine: sc[0], reg: `${mh.homeScore}-${mh.awayScore}`, ...c }); }
    // gol dell'eroe negli highlight vs tabellino
    const golHl = r.hls.filter(h => /\bGOL\b|GOOOL|Gol!/i.test(h.esitoTxt || '') && !/Fallito|NON TROVA|MANCATA|RESPINT|PARATA/i.test((h.esitoTxt || '').slice(0, 400))).length;
    if (ge && golHl > +ge[1]) dif({ tipo: 'coerenza', nome: 'gol negli highlight piu del tabellino', hl: golHl, tab: ge[1], ...c });
  } catch (e) { dif({ tipo: 'driver', nome: 'verificaPartita errore ' + e.message }); }
}

/* ---- ripulisce schermate fino al cruscotto ---- */
const BTN_PRIO = [/Torna alla dashboard/i, /^Continua/i, /^Avanti/i, /^Prosegui/i, /^Capito/i, /Che la stagione cominci/i, /^Torna alla home/i, /^Vai/i, /^Inizia/i, /^Conferma/i, /^OK/i, /^Chiudi/i, /^Fine/i, /^Salta/i];
async function ripulisci(dove, maxIter = 25) {
  let last = '', stuck = 0;
  for (let i = 0; i < maxIter; i++) {
    const o = await overlay(page);
    if (o) { const t = await gestisciOverlay(o, dove); if (t === 'prompt-partita') return 'prompt'; continue; }
    const c = await cta(page);
    if (c && c.t) return 'cruscotto';
    const screen = await page.evaluate(() => window.__CPM_CAREER && window.__CPM_CAREER.screen());
    const bt = await bottoni(page); const t = (await testo(page)).slice(0, 600);
    const key = screen + '|' + bt.join(',') + t.slice(0, 80);
    if (key === last) stuck++; else { stuck = 0; last = key; }
    if (stuck >= 5) { dif({ tipo: 'blocco', nome: 'schermata ferma', screen, btns: bt.slice(0, 8), estratto: t.slice(0, 200).replace(/\n/g, ' | '), dove, ...(await ctxNow()) }); if (drv.nBlocco = (drv.nBlocco || 0) + 1, drv.nBlocco < 8) await fotoAuto(`blocco-${Date.now()}`); await page.evaluate(() => window.__CPM_CAREER.dismiss()); stuck = 0; if (i > 20) return 'blocco'; }
    await scanTesto(t, 'schermata ' + screen);
    app(EV, { ...(await ctxNow()), tipo: 'schermata', screen, txt: t.slice(0, 500), btns: bt.slice(0, 10) });
    const kind = 'scr:' + screen + ':' + bt.slice(0, 2).join('/');
    if (!drv.vistiKind[kind]) { drv.vistiKind[kind] = 1; await fotoAuto(`scr-${screen}-${hash(kind) % 9999}`); }
    let pick = null;
    for (const rx of BTN_PRIO) { pick = bt.find(b => rx.test(b)); if (pick) break; }
    if (!pick) { await sleep(800); continue; }
    await page.evaluate(p => { const e = [...document.querySelectorAll('button')].find(b => b.offsetParent && b.innerText.trim().slice(0, 60) === p); if (e) e.click(); }, pick);
    await sleep(700);
  }
  return 'maxiter';
}

/* ---- registro settimanale + invarianti ---- */
function regRiga(p, extra = {}) {
  const st = (p.standings || []); const me = st.find(r => (r.id) === (p.club && p.club.id));
  const pos = me ? 1 + st.filter(r => (r.pts || 0) > (me.pts || 0)).length : null;
  const mhS = (p.matchHistory || []).filter(m => m.season === p.season);
  return { s: p.season, w: p.week, club: p.club && p.club.n, lega: p.club && p.club.lg, pro: p.proStatus, ruolo: p.position, eta: p.age, ovr: p.ovr, gol: p.goals, ass: p.assists, pres: p.matches, golTot: p.totalGoals, assTot: p.totalAssists, presTot: p.totalMatches, ultimoVoto: mhS.length ? mhS[mhS.length - 1].rating : null, conto: p.bankBalance, morale: p.morale, forma: p.form, fatica: p.fatigue, pop: p.popularity, fiducia: p.coachTrust, ruoloSq: p.squadRole, stato: p.matchStatus, inf: !!p.injured, pos, pts: me && me.pts, gG: me && me.played, contratto: p.contract && { d: p.contract.duration, sal: p.contract.wage }, agente: !!p.hasAgent, tutorial: p.tutorialDone, t: Math.round(Date.now() / 1000), ...extra };
}
async function invarianti(p) {
  const c = { s: p.season, w: p.week };
  const st = p.standings || [];
  const gf = st.reduce((a, t) => a + (t.gf || 0), 0), ga = st.reduce((a, t) => a + (t.ga || 0), 0);
  if (gf !== ga) dif({ tipo: 'coerenza', nome: 'somma GF != GA in classifica', gf, ga, ...c });
  for (const t of st) { if ((t.wins || 0) * 3 + (t.draws || 0) !== (t.pts || 0) && !(t.pen)) { dif({ tipo: 'coerenza', nome: 'punti != 3V+N', team: t.n, wins: t.wins, draws: t.draws, pts: t.pts, ...c }); break; } if ((t.wins || 0) + (t.draws || 0) + (t.losses || 0) !== (t.played || 0)) { dif({ tipo: 'coerenza', nome: 'V+N+P != giocate', team: t.n, ...c }); break; } }
  if ((p.bankBalance || 0) < 0) dif({ tipo: 'coerenza', nome: 'conto negativo', bank: p.bankBalance, ...c });
  if (!(p.ovr >= 40 && p.ovr <= 99)) dif({ tipo: 'coerenza', nome: 'OVR fuori range', ovr: p.ovr, ...c });
  for (const k of ['morale', 'form', 'fatigue', 'popularity', 'coachTrust']) if (p[k] != null && (p[k] < 0 || p[k] > 100)) dif({ tipo: 'coerenza', nome: k + ' fuori 0-100', v: p[k], ...c });
  const mhS = (p.matchHistory || []).filter(m => m.season === p.season);
  const sg = mhS.reduce((a, m) => a + (m.goals || 0), 0), sa = mhS.reduce((a, m) => a + (m.assists || 0), 0);
  if (sg !== p.goals && (p.matchHistory || []).length < 400) dif({ tipo: 'coerenza', nome: 'gol stagione != somma partite', somma: sg, campo: p.goals, ...c });
  if (sa !== p.assists && (p.matchHistory || []).length < 400) dif({ tipo: 'coerenza', nome: 'assist stagione != somma partite', somma: sa, campo: p.assists, ...c });
  if ((p.totalGoals || 0) < (p.goals || 0)) dif({ tipo: 'coerenza', nome: 'gol totali < gol stagione', ...c });
}

/* ---- salva e ricarica ---- */
function diffProfondo(a, b, pth = '', out = []) {
  if (out.length > 25) return out;
  if (a === b) return out;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') { out.push({ pth, a: JSON.stringify(a)?.slice(0, 80), b: JSON.stringify(b)?.slice(0, 80) }); return out; }
  const ks = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of ks) { if (['savedAt'].includes(k)) continue; diffProfondo(a[k], b[k], pth + '.' + k, out); }
  return out;
}
async function salvaRicarica(etichetta) {
  const c = await ctxNow();
  await clic(page, /^Salva/); await sleep(800);
  const A = await P(); const lsA = await dumpLS(page);
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1500);
  const lsB0 = await dumpLS(page);
  await caricaCarriera(page);
  const B = await P();
  const d = diffProfondo(A, B);
  app(EV, { ...c, tipo: 'salva-ricarica', etichetta, differenze: d.length, esempio: d.slice(0, 8) });
  if (d.length) dif({ tipo: 'salvataggio', nome: 'stato diverso dopo salva e ricarica', n: d.length, esempio: d.slice(0, 6), ...c });
  if (!lsB0['cpm-v3']) dif({ tipo: 'salvataggio', nome: 'cpm-v3 assente dopo ricarica', ...c });
  fs.writeFileSync(path.join(DATI, `save-S${c.s}W${c.w}.json`), JSON.stringify(lsA));
  return d.length;
}

/* ---- ciclo principale ---- */
let ultima = null, fermo = 0, iter = 0, saveCount = 0;
const fine = async (motivo) => { fs.writeFileSync(STATO, JSON.stringify(await dumpLS(page))); console.log('FINE', motivo); await g.close(); process.exit(0); };
while (Date.now() < T_END) {
  iter++;
  try {
    const o = await overlay(page);
    if (o) {
      const t = await gestisciOverlay(o, 'ciclo');
      if (t === 'prompt-partita') {
        if (drv.prossima === 'live') { await partitaLive(); }
        else { drv.sim++; saveDrv(); await sleep(1200); await ripulisci('sim'); }
      }
      continue;
    }
    const screen = await page.evaluate(() => window.__CPM_CAREER.screen());
    const p = await P();
    if (!p || typeof p !== 'object') { dif({ tipo: 'driver', nome: 'snapshot non disponibile', p: String(p).slice(0, 100) }); await sleep(1000); continue; }
    if (p.retired || screen === 'careerEnd') { const t = await testo(page); app(EV, { tipo: 'ritiro', txt: t.slice(0, 2500) }); await fotoAuto('careerEnd'); await shot(page, 'ZZ-ritiro-schermata'); await fine('RITIRATO'); }
    const c = await cta(page);
    if (screen !== 'dashboard' || !c) {
      const r = await ripulisci('schermata'); if (r === 'blocco') { await fine('BLOCCO'); }
      continue;
    }
    // dashboard: registra la settimana una volta
    const key = p.season + ':' + p.week + ':' + (p.weekLived ? 1 : 0);
    if (key !== ultima) {
      ultima = key; fermo = 0;
      const ctxt = await testo(page);
      const intest = ctxt.split('\n').slice(0, 14).join(' | ');
      log(regRiga(p, { vissuta: !!p.weekLived, cta: c.t }));
      if (!p.weekLived) { await invarianti(p); await scanTesto(ctxt, 'cruscotto'); }
      saveCount++;
      if (!p.weekLived && p.week % 1 === 0) fs.writeFileSync(STATO, JSON.stringify(await dumpLS(page)));
      if (arg.stop && new RegExp('^' + arg.stop.replace('S', 'S').replace('W', 'W') + '$').test('S' + p.season + 'W' + p.week) && !p.weekLived) await fine('STOP ' + arg.stop);
    } else { fermo++; if (fermo > 8) { dif({ tipo: 'blocco', nome: 'il tasto principale non fa avanzare', cta: c.t, ...(await ctxNow()) }); await fotoAuto('fermo-' + Date.now()); await page.evaluate(() => window.__CPM_CAREER.dismiss()); fermo = 0; if (iter > 3000) await fine('FERMO'); } }
    if (!p.weekLived && p.week === 20 && drv.ricaricatoStagione !== p.season) { drv.ricaricatoStagione = p.season; saveDrv(); await salvaRicarica('w20'); continue; }
    if (c.dis) { await sleep(1300); continue; }
    await page.click('[data-cpm="avanza23"]', { timeout: 4000 }).catch(() => {});
    await sleep(1300);
  } catch (e) {
    dif({ tipo: 'driver', nome: 'eccezione: ' + String(e.message).slice(0, 200) });
    if (/closed|Target/.test(e.message)) await fine('BROWSER');
    await sleep(1500);
  }
  if (g.errs.length) { const er = g.errs.filter(e => !/BABEL/.test(e)); if (er.length) { for (const x of er) dif({ tipo: 'console', nome: x, ...(await ctxNow()) }); g.errs.length = 0; } }
}
await fine('TEMPO');
