#!/usr/bin/env node
/* Collaudo carriera 178 n.5 — ciclo di carriera COL TELEFONO (412x915): tutto via interfaccia, come un giocatore.
   Uso: C178_STATO=<dump localStorage> [C178_MAXIT=n] [C178_STAGMAX=n] [C178_MATCHIDX=n] [C178_CONTA=n] node c178-car5-carriera.mjs */
import { avvia, nuovaPagina, foto, testo, bottoni, sleep, clickByText, jl, evalSafe, fase, overlay, DATI, FOTO, SCR, ROOT } from './c178-car5-lib.mjs';
import { giocaLive } from './c178-car5-live.mjs';
import { visita, azioni } from './c178-car5-visite.mjs';
import fs from 'node:fs'; import path from 'node:path'; import zlib from 'node:zlib';
const MAXIT = +(process.env.C178_MAXIT || 100000), STAGMAX = +(process.env.C178_STAGMAX || 99);
const conta = { n: +(process.env.C178_CONTA || 0) }; let matchIdx = +(process.env.C178_MATCHIDX || 0);
const S = await avvia(); let page = await nuovaPagina(S, { glb: false });
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
await sleep(1500);
const apriCarriera = async () => {
  await clickByText(page, 'Continua →', 6000);
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }); await sleep(1500);
};
await apriCarriera();
const CAR = (m, ...a) => evalSafe(page, ([m, a]) => { const C = window.__CPM_CAREER; return C && C[m] ? C[m](...a) : null; }, [m, a]);
const compat = p => p && { s: p.season, w: p.week, wl: !!p.weekLived, age: p.age, ovr: p.ovr, club: p.club && p.club.n, lg: p.club && p.club.lg, form: p.form, morale: p.morale, fat: p.fatigue, pop: p.popularity, trust: p.coachTrust, g: p.goals, a: p.assists, m: p.matches, tg: p.totalGoals, ta: p.totalAssists, tm: p.totalMatches, bank: p.bankBalance, val: p.value, ct: p.contract, inj: p.injury && p.injury.weeksRemaining, caps: p.nationalCaps, pos: p.position, mh: (p.matchHistory || []).length, diary: (p.diary || []).length, trophies: (p.trophies || []).length };
const snap = async () => { const s = await CAR('snapshot'); return (s && !s.__err && typeof s === 'object') ? s : null; };
const rot = { imp: 0, int: 0, other: 0, ag: 0, uf: 0 };
const volte = new Map();
let STUCKED = false, RITIRATO = false;
let it = 0, lastSig = '', same = 0, lastSeason = 0, lastP = null, prevP = null, visitato = new Set();
const salvaStato = async (nome) => {
  const st = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map(k => [k, localStorage.getItem(k)])));
  fs.writeFileSync(path.join(SCR, 'stato-corrente.json'), JSON.stringify(st));
  if (nome) fs.writeFileSync(path.join(DATI, nome + '.json.gz'), zlib.gzipSync(JSON.stringify(st)));
};
/* confronto salva/ricarica: stesse cifre prima e dopo */
async function salvaRicarica(tag) {
  const A = await snap(); if (!A) return;
  await clickByText(page, '^Salva', 2000); await sleep(800);
  await salvaStato(tag);
  await page.reload({ waitUntil: 'load', timeout: 90000 }); await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1500);
  const bt = await bottoni(page);
  if (!await clickByText(page, 'Continua →', 6000)) { log('RICARICA: nessun Continua', bt.slice(0, 6)); jl('difetti-raw.jsonl', { tag, cosa: 'dopo-ricarica-nessun-continua', bt: bt.slice(0, 8) }); await foto(page, 'ricarica-' + tag); }
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }).catch(() => {}); await sleep(1500);
  const B = await snap(); if (!B) { jl('difetti-raw.jsonl', { tag, cosa: 'ricarica-snapshot-nullo' }); return; }
  const diff = []; const ks = new Set([...Object.keys(A), ...Object.keys(B)]);
  for (const k of ks) { const a = JSON.stringify(A[k]) || '', b = JSON.stringify(B[k]) || ''; if (a !== b) { let i = 0; while (i < a.length && a[i] === b[i]) i++; diff.push({ k, i, a: a.slice(Math.max(0, i - 40), i + 100), b: b.slice(Math.max(0, i - 40), i + 100) }); } }
  jl('salva-ricarica.jsonl', { tag, s: A.season, w: A.week, nDiff: diff.length, diff: diff.slice(0, 25) }); log('SALVA/RICARICA', tag, 'diff', diff.length, diff.slice(0, 5).map(d => d.k).join(','));
}
async function pumpPost() { /* dopo la partita: torna alla dashboard cliccando i soliti tasti di chiusura */
  for (let k = 0; k < 25; k++) {
    const sc = await CAR('screen'); const ov = await overlay(page); const ph = await fase(page);
    if (sc === 'dashboard' && !ov && (ph == null)) return true;
    if (ov) { await gestisciOverlay(ov); continue; }
    const ok = await clickByText(page, '^\\W*(Continua|Chiudi|Ok|OK|Salta|Avanti|Capito|Torna alla home|Torna alla dashboard|Fine|Esci|Vai|Prosegui|Conferma)', 1500); await sleep(800);
    if (!ok) { await foto(page, 'pump-' + k); await sleep(1500); }
  }
  return false;
}
async function gestisciOverlay(ov) {
  const sigK = (ov.dc || '') + '|' + ov.testo.slice(0, 50); volte.set(sigK, (volte.get(sigK) || 0) + 1);
  const n = volte.get(sigK);
  const isInt = ov.dc === 'intervista231' || /INTERVISTA/i.test(ov.testo.slice(0, 200));
  const isImp = /Impulso della settimana|SETTIMANA \d+ ·/i.test(ov.testo.slice(0, 160)) && !(/Simula e avanza/.test(ov.testo) && /Non ora/.test(ov.testo));
  const isMatchPrompt = /Simula e avanza/.test(ov.testo) && /Gioca/.test(ov.testo) && /Non ora/.test(ov.testo);
  const P = lastP;
  let scelta = null, tipo = 'altro';
  const op = ov.opz.filter(o => !o.dis);
  const chiudi = op.find(o => /^(Chiudi|Ok|OK|Capito|Continua|Avanti|Salta)/i.test(o.txt) && !/riprendi quando vuoi/i.test(o.txt)) || op.find(o => /^Chiudi/i.test(o.txt));
  if (isMatchPrompt) { tipo = 'prompt-partita'; matchIdx++; const live = (matchIdx - 1) % 4 === 0; scelta = op.find(o => live ? /^Gioca/.test(o.txt) : /^Simula e avanza/.test(o.txt)); ov._live = live; }
  else if (isInt) { tipo = 'intervista'; const nonCh = op.filter(o => !/^(Chiudi|Ok)/i.test(o.txt)); scelta = nonCh.length ? nonCh[(rot.int++) % nonCh.length] : chiudi; }
  else if (isImp) { tipo = 'impulso'; const nonCh = op.filter(o => !/^(Chiudi)/i.test(o.txt)); scelta = nonCh.length ? nonCh[(rot.imp++) % nonCh.length] : chiudi; }
  else if (op.some(o => /^Accetta/.test(o.txt)) && op.some(o => /^Rifiuta/.test(o.txt))) { /* offerta di trasferimento/prestito: ne accetta una su tre, controproposta una su tre, rifiuta il resto */
    tipo = 'offerta'; const j = (rot.off = (rot.off || 0) + 1) % 3; const pr = /prestito/i.test(ov.testo);
    scelta = (j === 0 && !pr ? op.find(o => /^Accetta/.test(o.txt)) : j === 1 ? (op.find(o => /controproposta/i.test(o.txt)) || op.find(o => /^Rifiuta/.test(o.txt))) : op.find(o => /^Rifiuta/.test(o.txt))); }
  else { const prefer = op.find(o => /^\W*(Torna alla dashboard|Resto qui|Estrai|Si parte|Benvenuti|Accetta|Firma|Rinnova|Conferma|Capito|Tieni|Avanti|Continua|Salta|Vai allo stadio|Scegli)/i.test(o.txt)); scelta = (n > 5 && chiudi && !/riprendi quando vuoi/i.test(chiudi.txt) ? chiudi : null) || prefer || op[(rot.other++) % Math.max(1, op.length)] || chiudi; }
  if (n > 12) scelta = op.find(o => /Chiudi|Salta|Non ora|Annulla|Rifiuta|Indietro/i.test(o.txt)) || op[0];
  const A = await snap();
  jl('overlay.jsonl', { s: P && P.season, w: P && P.week, tipo, dc: ov.dc, testo: ov.testo.slice(0, 500), opz: ov.opz.map(o => o.txt), scelta: scelta && scelta.txt, n });
  if (!scelta) {
    const ok = await clickByText(page, '^\\W*(Inizia Stagione|Nuova stagione|Continua|Avanti|Prosegui|Chiudi|Capito|Ok|OK|Conferma|Salta|Vai)', 1500);
    if (!ok) { log('overlay senza opzioni', ov.testo.slice(0, 120)); }
    await sleep(1000); return false; }
  if (!volte.has('foto:' + tipo + ':' + sigK) && tipo !== 'intervista' || (tipo === 'intervista' && !volte.has('foto:int'))) { volte.set('foto:' + tipo + ':' + sigK, 1); volte.set('foto:int', 1); await foto(page, `ov-${tipo}-s${P && P.season}w${P && P.week}`, SCR); }
  const T0 = (tipo === 'impulso' || tipo === 'intervista') ? await evalSafe(page, () => document.body.innerText) : '';
  await page.mouse.click(scelta.x, scelta.y); await sleep(350);
  const T1 = (tipo === 'impulso' || tipo === 'intervista') ? await evalSafe(page, () => document.body.innerText) : ''; await sleep(350);
  const nuove = (typeof T1 === 'string' && typeof T0 === 'string') ? T1.split('\n').filter(l => l.trim() && !T0.includes(l) && /[+\u2212-]\s?\d|\+|\u2212/.test(l)).slice(0, 6) : [];
  if (tipo === 'impulso' || tipo === 'intervista') { const B = await snap(); if (A && B) { const d = {}; for (const k of ['form', 'morale', 'fatigue', 'popularity', 'coachTrust', 'bankBalance', 'value', 'ovr']) if (A[k] !== B[k]) d[k] = [A[k], B[k]]; jl('overlay-effetti.jsonl', { s: A.season, w: A.week, tipo, scelta: scelta.txt, toast: nuove, d }); } }
  return { tipo, live: ov._live };
}
const t0 = Date.now(); let hb = Date.now(), hbIt = 0;
setInterval(() => { if (it !== hbIt) { hbIt = it; hb = Date.now(); } else if (Date.now() - hb > 7 * 60 * 1000) { console.log('WATCHDOG: nessun avanzamento in 7 minuti, esco (5)'); process.exit(5); } }, 20000);
while (it < MAXIT) {
  it++; if (it % 10 === 0) { await salvaStato(); fs.writeFileSync(path.join(DATI, 'progress.json'), JSON.stringify({ matchIdx, conta, lastSeason })); }
  const ov = await overlay(page); const ph = await fase(page);
  const P = await snap(); if (P) { prevP = lastP; lastP = P; }
  const sc = await CAR('screen');
  const sig = [P && P.season, P && P.week, P && P.weekLived, sc, ph, ov && ov.testo.slice(0, 40)].join('|');
  if (sig === lastSig) same++; else { same = 0; lastSig = sig; }
  if (same > 40) { log('STUCK', sig); await foto(page, 'stuck'); console.log((await testo(page)).replace(/\n+/g, ' / ').slice(0, 900)); console.log(JSON.stringify(await bottoni(page))); STUCKED = true; break; }
  if (P && P.season !== lastSeason) {
    if (lastSeason) { log('=== fine S' + lastSeason, JSON.stringify(compat(prevP)), '| inizio S' + P.season, JSON.stringify(compat(P))); await salvaRicarica('s' + lastSeason); }
    lastSeason = P.season; log('STAGIONE', P.season, P.club && P.club.n, 'età', P.age, 'ovr', P.ovr);
    if (lastSeason > STAGMAX) break;
  }
  if (sc === 'careerEnd' || (P && P.retired)) { log('RITIRO'); await foto(page, 'ritiro'); RITIRATO = true; break; }
  if (ph && ph !== 'ended') { /* partita in corso non gestita (es. ripresa): giocala */
    const rec = await giocaLive(page, { tag: 'ripresa', stagione: P && P.season, settimana: P && P.week, conta }); log('partita ripresa', JSON.stringify(rec.sc1)); await pumpPost(); continue; }
  if (ov) {
    const r = await gestisciOverlay(ov);
    if (r && r.tipo === 'prompt-partita' && r.live) {
      await sleep(1500);
      /* match screen: «Salta e gioca» */
      for (let k = 0; k < 6; k++) { const ph2 = await fase(page); if (ph2 && ph2 !== 'ended') break; await clickByText(page, 'Salta e gioca', 2000); await sleep(1500); }
      const pb = lastP; const rec = await giocaLive(page, { tag: `s${pb.season}w${pb.week}`, stagione: pb.season, settimana: pb.week, conta });
      jl('partite.jsonl', { ...rec, hl: rec.hl.length });
      log('  LIVE finita', JSON.stringify({ hl: rec.hl.length, sc: rec.sc1, fl: rec.flags, fine: rec.fine, s: Math.round(rec.ms / 1000) }));
      await pumpPost();
      const Q = await snap(); if (Q) jl('post-live.jsonl', { s: Q.season, w: Q.week, sc: rec.sc1, g: Q.goals, a: Q.assists, m: Q.matches, ult: (Q.matchHistory || []).slice(-1)[0] });
    }
    continue;
  }
  if (sc === 'dashboard') {
    const pend = await CAR('openingPending');
    if (Array.isArray(pend) && pend.length) { await clickByText(page, 'Avvia Stagione', 2500); await sleep(900); continue; }
    if (P && [6, 20, 33].includes(P.week) && !P.weekLived && !visitato.has(P.season + ':' + P.week)) { visitato.add(P.season + ':' + P.week); const v = await visita(page, `s${P.season}w${P.week}`, P, log); if (P.week !== 33 && P.proStatus === 'pro') { const az = await azioni(page, P, snap, rot, log); log('azioni', JSON.stringify({ naz: az.nazionale && az.nazionale.clic, ag: az.agente.map(x => x.compito || x.rinnovo || x.scelta), uf: az.ufficio.map(x => x.azione || x.scelta) })); }
    log('visita', JSON.stringify(Object.fromEntries(Object.entries(v.tab).map(([k, x]) => [k, x.sz && (x.sz.anom || x.sz.scrollX || x.sz.fuori.length) ? x.sz : 'ok']))), v.classifica ? JSON.stringify(v.classifica) : ''); continue; }
    /* carte della home con una scelta («… →»): una per giro, al massimo due volte per stagione ciascuna */
    const cart = (await bottoni(page)).filter(b => /→\s*$/.test(b) && !/Avvia Stagione|Vivi la Settimana|Inizia Stagione/.test(b));
    for (const c of cart) { const k = 'carta:' + (P && P.season) + ':' + c.slice(0, 30); if ((volte.get(k) || 0) >= 2) continue; volte.set(k, (volte.get(k) || 0) + 1); jl('carte.jsonl', { s: P.season, w: P.week, carta: c }); const okc = await clickByText(page, c.slice(0, 24).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 2000); if (okc) { await sleep(900); break; } }
    if (cart.some(c => (volte.get('carta:' + (P && P.season) + ':' + c.slice(0, 30)) || 0) === 1 || (volte.get('carta:' + (P && P.season) + ':' + c.slice(0, 30)) || 0) === 2) && (await overlay(page))) continue;
    const ok = await clickByText(page, 'Chiudi la stagione|Vivi la Settimana|Avvia Stagione|Gioca vs|Gioca|Avanza|Prossima settimana', 2500);
    if (!ok) { const bs = await bottoni(page); if (it % 10 === 0) log('dashboard senza CTA', bs.slice(0, 8)); await sleep(800); }
    else await sleep(1000);
    continue;
  }
  /* schermate speciali (fine stagione, premi, nazionale, ...) */
  const tx = (await testo(page)).replace(/\n+/g, ' / ').slice(0, 400);
  if (!volte.has('scr:' + sc + ':' + (P && P.season))) { volte.set('scr:' + sc + ':' + (P && P.season), 1); jl('schermate.jsonl', { s: P && P.season, w: P && P.week, sc, tx, bs: (await bottoni(page)).slice(0, 10) }); await foto(page, `scr-${sc}-s${P && P.season}`, SCR); log('schermata', sc, tx.slice(0, 120)); }
  const ok = await clickByText(page, '^\\W*(Continua|Avanti|Nuova stagione|Prosegui|Inizia|Vai|Capito|Chiudi|Conferma|Salta|Ok|OK|Entra|Accetta|Fine|Torna)', 2000); await sleep(ok ? 900 : 1500);
}
await salvaStato('ultimo');
log('fine ciclo it', it, 'min', Math.round((Date.now() - t0) / 60000), 'errori', page._err.filter(e => !/BABEL/.test(e)).slice(0, 5));
fs.writeFileSync(path.join(DATI, 'progress.json'), JSON.stringify({ matchIdx, conta, lastSeason }));
await S.browser.close(); process.exit(RITIRATO ? 10 : STUCKED ? 4 : 0);
