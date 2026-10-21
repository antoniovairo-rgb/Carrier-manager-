/* [collaudo 177 carriera 2] nucleo del pilota: legge lo schermo come un giocatore e risolve una cosa per volta. Solo collaudo. */
import fs from 'fs'; import path from 'path';
import * as L from './c177-car2-lib.mjs';
const { sleep, clickTesto, testo, foto, difetto, registra, DATI } = L;

export const NAV = /^(Salva|⚡ Vivi la Settimana|🏁 Avvia Stagione|⚽ Gioca vs|Calendario|La tua settimana|Obiettivi della stagione|Ultime notizie|☕ Sostieni|💡 Idee|Home$|Stagione$|Club$|Carriera$|Agente$|Ufficio$|Opzioni$)/;
/* bottoni cliccabili davvero (visibili, non coperti) con testo */
export const cliccabili = page => page.evaluate(() => [...document.querySelectorAll('button,[role=button]')].filter(x => {
  if (x.offsetParent === null || x.disabled) return false; const q = x.getBoundingClientRect(); if (q.width < 4 || q.height < 4) return false;
  const cx = q.left + q.width / 2, cy = q.top + q.height / 2; if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) return false; const e = document.elementFromPoint(cx, cy); return e && (x === e || x.contains(e)); })
  .map(x => (x.textContent || '').trim().replace(/\s+/g, ' ')));

export async function stato(S) {
  return S.page.evaluate(() => { const C = window.__CPM_CAREER; if (!C) return null; const s = C.snapshot(); if (!s || typeof s === 'string') return null;
    const mh = (s.matchHistory || []); const ult = mh[mh.length - 1] || {};
    return { st: s.season, wk: s.week, age: s.age, club: s.club && s.club.n, lg: s.club && s.club.lg, pro: s.proStatus, ovr: s.ovr, g: s.goals, a: s.assists, m: s.matches, tg: s.totalGoals, ta: s.totalAssists, tm: s.totalMatches,
      voto: ult.rating, ult: ult.season + 'S' + ult.week, bank: s.bankBalance, mor: s.morale, form: s.form, fat: s.fatigue, pop: s.popularity, contr: s.contract && (s.contract.expiresAtSeason + '/' + s.contract.wage), lived: s.weekLived, inj: s.injury ? s.injury.weeksRemaining : 0, prestito: !!s.loan, tr: (s.trophies || []).length, screen: C.screen(), scoutNat: s.nationalCaps }; });
}


const SCARTA = /^(Salva|Chiudi|Non ora|Annulla|Rifiuta|No grazie|Esci|Torna|← )/i;
let rot = 0;
/* un passo: ritorna una etichetta di ciò che ha fatto, o null se non c'è nulla da risolvere (dashboard pulita) */
export async function passo(S, ctx) {
  const p = S.page; const cl = await cliccabili(p); const t = await testo(p); const modali = cl.filter(x => !NAV.test(x) && x.length > 0);
  const tag = (s, extra) => { ctx.ultimo = s; if (extra) ctx.log(s, extra); return s; };
  /* 1. finestra partita */
  if (cl.some(x => /^Gioca la partita/.test(x))) {
    ctx.nPartite = (ctx.nPartite || 0) + 1;
    const live = ctx.forzaLive != null ? ctx.forzaLive : ((ctx.nPartite - 1) % 4 === 0);
    const intro = t.slice(t.indexOf('SETTIMANA'), t.indexOf('SETTIMANA') + 300).replace(/\n+/g, ' | ');
    if (live) { await clickTesto(p, /^Gioca la partita/); await sleep(1200); return 'LIVE'; }
    await clickTesto(p, /Simula e avanza/); await sleep(1500); return tag('sim', intro.slice(0, 160));
  }
  /* 2. impulso della settimana */
  if (/Impulso della settimana|IMPULSO/.test(t) && modali.length) {
    const sc = modali.filter(x => !/🔒/.test(x)); const i = (rot++) % sc.length; const testoI = t.replace(/\n+/g, ' | ').slice(t.indexOf('Impulso della settimana'), t.indexOf('Impulso della settimana') + 330);
    await clickTesto(p, new RegExp(sc[i].slice(0, 25).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    await sleep(700); return tag('impulso', { q: testoI, scelte: modali, scelta: sc[i] });
  }
  /* 3. intervista */
  if (/INTERVISTA|GIORNALISTA INCALZA|RISPONDI TU/.test(t) && modali.some(x => /Ambizioso|Diplomatico|Umile|No comment|Aggressivo|Polemico/.test(x))) {
    const o = modali.filter(x => /Ambizioso|Diplomatico|Umile|No comment|Aggressivo|Polemico|Sincero|Ironico/.test(x)); const i = (rot++) % o.length; const dom = t.replace(/\n+/g, ' | ').match(/«[^»]{5,160}»/);
    await clickTesto(p, new RegExp(o[i].slice(0, 12).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))); await sleep(650); return tag('intervista', { q: dom && dom[0], r: o[i].slice(0, 80) });
  }
  /* 4. nulla di bloccante: chiusure comuni */
  if (modali.length === 1 && /^(Chiudi|OK|Ok|Continua|Avanti|Capito|Prosegui|Torna alla dashboard|🏟️ Torna alla dashboard)/.test(modali[0])) { await clickTesto(p, new RegExp('^' + modali[0].slice(0, 10).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))); await sleep(800); return tag('chiudi:' + modali[0].slice(0, 30)); }
  if (modali.length === 0) return null;
  /* 5. finestra non catalogata: se non è un flusso pesante (mercato/contratto) si sceglie a rotazione e si registra */
  const testaM = t.replace(/\n+/g, ' | ').slice(0, 260);
  if (!/offert|trasferi|contratto|rinnov|cession|prestito|svincol|procurator|presentazion|ritir|Nazionale|convocaz|premio|gala|trofe|promoz|retroc/i.test(testaM) && !ctx.fermaSuGenerico) {
    const sc = modali.filter(x => !SCARTA.test(x) && !/🔒/.test(x)); const pool = sc.length ? sc : modali; const i = (rot++) % pool.length;
    const sig = testaM.slice(0, 70); ctx.sigViste = ctx.sigViste || new Set();
    if (!ctx.sigViste.has(sig)) { ctx.sigViste.add(sig); ctx.log('modale-generico', { q: testaM, scelte: modali }); }
    await clickTesto(p, new RegExp(pool[i].slice(0, 22).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))); await sleep(1100); return tag('generico');
  }
  return 'IGNOTO:' + JSON.stringify(modali.slice(0, 8));
}

export function mkCtx() {
  const ctx = { eventi: [], nPartite: 0, nLive: 0 };
  ctx.log = (k, o) => { const r = { k, ...(typeof o === 'string' ? { t: o } : o), ts: new Date().toISOString() }; ctx.eventi.push(r); fs.appendFileSync(path.join(DATI, 'eventi.jsonl'), JSON.stringify(r) + '\n'); };
  return ctx;
}
/* una settimana intera di gioco; ritorna 'ok' | 'fine-stagione' | 'IGNOTO:...' | 'bloccato' */
export async function giocaSettimana(S, ctx) {
  const p = S.page; const s0 = await stato(S);
  if (!/^(Gioca la partita)/.test((await cliccabili(p)).join('|'))) await clickTesto(p, /^Home$/);
  for (let it = 0; it < 80; it++) {
    const r = await passo(S, ctx);
    if (r === 'LIVE') {
      const res = await L.giocaLive(S, { scelte: ctx.scelte || [0, 1, 2, -1], ingresso: ctx.nLive % 3 === 0, foto: async n => (ctx.fotoLive ? await foto(S, '_' + ctx.fotoLive + n) : null) });
      ctx.nLive++; res.st = s0 && s0.st; res.wk = s0 && s0.wk; ctx.log('live', { st: res.st, wk: res.wk, sc: res.scoreFine, hls: res.hls, tl: res.tl.slice(-14), tab: (res.testoFine.match(/IL TUO TABELLINO[\s\S]{0,120}/) || [''])[0].replace(/\n+/g, ' | '), cer: res.cer });
      ctx.ultimaLive = res; await sleep(500);
      for (let j = 0; j < 4; j++) { const c = await clickTesto(p, /Torna alla dashboard|Salta festeggiamenti|Continua/); if (!c) break; await sleep(900); }
      continue;
    }
    if (r && r.startsWith('IGNOTO')) return r;
    if (r === null) {
      const s = await stato(S); if (!s) return 'bloccato:nostato';
      if (s0 && (s.st !== s0.st || s.wk !== s0.wk)) return s.screen && /seasonEnd|seasonAwards/.test(s.screen) ? 'fine-stagione' : 'ok';
      if (s.screen && /seasonEnd|seasonAwards|careerEnd/.test(s.screen)) return 'fine-stagione';
      if (await clickTesto(p, /Vivi la Settimana|Avvia Stagione/)) { await sleep(900); continue; }
      if (await clickTesto(p, /^⚽ Gioca vs/)) { await sleep(800); continue; }
      return 'bloccato:dashboard';
    }
  }
  return 'bloccato:loop';
}

/* ---------- monitor: invarianti sullo stato, lettura della classifica dalla UI, lint dei testi ---------- */
const ANOM = path.join(DATI, 'anomalie-auto.jsonl');
export function anomalia(ctx, st, wk, tipo, msg, extra) { const k = tipo + '|' + msg.slice(0, 60); ctx.visti = ctx.visti || new Set(); if (ctx.visti.has(k)) return; ctx.visti.add(k);
  const r = { st, wk, tipo, msg, ...(extra || {}) }; fs.appendFileSync(ANOM, JSON.stringify(r) + '\n'); console.log('  ⚑ anomalia', tipo, msg.slice(0, 140)); }

export async function invarianti(S, ctx) {
  const snap = await S.page.evaluate(() => { const s = window.__CPM_CAREER && window.__CPM_CAREER.snapshot(); return typeof s === 'object' ? s : null; });
  if (!snap) return null; const prev = ctx.prevSnap; const st = snap.season, wk = snap.week; const A = (t, m, e) => anomalia(ctx, st, wk, t, m, e);
  const mh = (snap.matchHistory || []).filter(h => (h.season || 1) === st);
  if (prev) {
    if (st === prev.season && wk < prev.week) A('settimana', `settimana regredita ${prev.week}→${wk}`);
    if (st > prev.season && wk !== 1) A('settimana', `rollover stagione ${prev.season}→${st} ma settimana ${wk}`);
    if (st > prev.season + 1) A('settimana', `salto di stagione ${prev.season}→${st}`);
    if (st > prev.season && snap.age !== prev.age + 1) A('eta', `età ${prev.age}→${snap.age} al cambio stagione`);
    if (st === prev.season && snap.age !== prev.age) A('eta', `età cambiata in stagione ${prev.age}→${snap.age}`);
    if (snap.totalGoals < prev.totalGoals || snap.totalAssists < prev.totalAssists || snap.totalMatches < prev.totalMatches) A('totali', `totali carriera diminuiti g${prev.totalGoals}→${snap.totalGoals} a${prev.totalAssists}→${snap.totalAssists} m${prev.totalMatches}→${snap.totalMatches}`);
    if (st === prev.season && (snap.totalGoals - prev.totalGoals) !== (snap.goals - prev.goals)) A('gol', `gol stagione ${prev.goals}→${snap.goals} ma totali ${prev.totalGoals}→${snap.totalGoals}`);
  }
  const sg = mh.reduce((a, h) => a + (h.goals | 0), 0), sa = mh.reduce((a, h) => a + (h.assists | 0), 0);
  if ((snap.proStatus || 'u18') && snap.goals !== sg && !snap.loan) A('gol', `goals stagione ${snap.goals} ≠ somma storico partite ${sg}`, { club: snap.club && snap.club.n });
  if (snap.assists !== sa && !snap.loan) A('assist', `assist stagione ${snap.assists} ≠ somma storico ${sa}`);
  for (const h of mh) if (h.rating != null && (h.rating < 3 || h.rating > 10)) A('voto', `voto fuori scala ${h.rating} a settimana ${h.week}`);
  for (const [k, lo, hi] of [['ovr', 30, 99], ['morale', 0, 100], ['form', 0, 100], ['fatigue', 0, 100], ['popularity', 0, 100]]) if (!(snap[k] >= lo && snap[k] <= hi)) A('range', `${k}=${snap[k]} fuori [${lo},${hi}]`);
  if (!(snap.bankBalance >= 0)) A('conto', `conto negativo/nullo non numerico ${snap.bankBalance}`);
  if (snap.contract && snap.contract.expiresAtSeason < st && !snap.contractExpired) A('contratto', `contratto scaduto alla stagione ${snap.contract.expiresAtSeason} ma siamo in ${st} e non svincolato`);
  if (snap.contract && !(snap.contract.wage >= 0)) A('contratto', `ingaggio non valido ${snap.contract.wage}`);
  const nan = JSON.stringify(snap, (k, v) => (typeof v === 'number' && !isFinite(v)) ? '__NAN__' : v).includes('__NAN__'); if (nan) A('nan', 'NaN/Infinity nello stato giocatore');
  if (snap.standings && snap.club) { const mine = snap.standings.find(r => (r.id || r.clubId) === snap.club.id); if (!mine && !snap.loan) A('classifica', `il club ${snap.club.n} non è nella classifica salvata`); const gf = snap.standings.reduce((a, r) => a + (r.gf || 0), 0), gs = snap.standings.reduce((a, r) => a + (r.ga != null ? r.ga : (r.gs || 0)), 0); if (gf !== gs) A('classifica', `somma gol fatti ${gf} ≠ subiti ${gs}`); }
  ctx.prevSnap = snap; return snap;
}
/* classifica dalla scheda Stagione (UI) → controlli di coerenza; riporta alla Home */
export async function controllaClassificaUI(S, ctx) {
  const p = S.page; const s = ctx.prevSnap || {}; const st = s.season, wk = s.week;
  await clickTesto(p, /^Stagione$/); await sleep(900);
  const raw = await testo(p).then(x => x.replace(/\u2212/g, '-'));
  const righe = []; const rx = /(?:^|\n)\t?(\d{1,2})\t\n([^\n]+)\n[^\n]*?\t(\d+)\t(\d+)\t(\d+)\t(\d+)\t(\d+)\t(\d+)\t([+-]?\d+)\t(\d+)/g; let m;
  while ((m = rx.exec(raw))) righe.push([m[1], m[2].trim(), m[3], m[4], m[5], m[6], m[7], m[8], m[9], m[10]]);
  if (righe.length) {
    let gf = 0, gs = 0; const G = new Set();
    righe.forEach((c, i) => { const [g, v, nn, pp, f, a, d, pt] = [c[c.length - 8], c[c.length - 7], c[c.length - 6], c[c.length - 5], c[c.length - 4], c[c.length - 3], c[c.length - 2], c[c.length - 1]].map(x => parseInt(String(x).replace('+', ''), 10));
      gf += f; gs += a; G.add(g);
      if (v + nn + pp !== g) anomalia(ctx, st, wk, 'classifica-ui', `riga ${c[0]} ${c[1]}: V+N+P=${v + nn + pp} ≠ G=${g}`);
      if (3 * v + nn !== pt) anomalia(ctx, st, wk, 'classifica-ui', `riga ${c[0]} ${c[1]}: punti ${pt} ≠ 3V+N=${3 * v + nn}`);
      if (f - a !== d) anomalia(ctx, st, wk, 'classifica-ui', `riga ${c[0]} ${c[1]}: DIFF ${d} ≠ GF-GS=${f - a}`);
      if (i > 0) { const q = righe[i - 1]; const ppt = parseInt(q[q.length - 1], 10); if (ppt < pt) anomalia(ctx, st, wk, 'classifica-ui', `ordine: ${q[1]} ${ppt}pt sotto ${c[1]} ${pt}pt`); }
    });
    if (gf !== gs) anomalia(ctx, st, wk, 'classifica-ui', `somma GF ${gf} ≠ GS ${gs} (squadre ${righe.length})`);
    if (G.size > 2) anomalia(ctx, st, wk, 'classifica-ui', `partite giocate molto diverse tra squadre: ${[...G].join(',')}`);
    ctx.ultimaClassifica = { st, wk, n: righe.length, righe: righe.slice(0, 20).map(c => c.join(' ')) };
  } else anomalia(ctx, st, wk, 'classifica-ui', 'nessuna tabella di classifica trovata');
  await clickTesto(p, /^Home$/); await sleep(700);
}
const LINT = [
  [/\b(undefined|NaN|\[object|Infinity|null)\b/, 'valore tecnico a schermo'],
  [/\b1 (partite|gol segnati|giornate|stagioni|settimane|anni|assists)\b/i, 'plurale dopo 1'],
  [/\b([2-9]|\d{2,}) (partita|giornata|stagione|settimana|anno|goal)\b/i, 'singolare dopo numero >1'],
  [/\b(un|lo|il|la) (FC|AC|AS|SS|US)\b/, 'articolo prima della sigla'],
  [/ {3,}|\.\.\.\.+|,,|\.\.(?!\.)/, 'punteggiatura doppia'],
  [/\bil (Real|Inter|Juve|Milan)\b/, 'nome reale'],
  [/€\s?-\d|-\d+ ?€|\bgli (stagioni|settimane)\b/, 'importo/testo anomalo'],
  [/\bperde (-|\+)?0\b/i, 'variazione nulla scritta'],
];
export async function lintTesti(S, ctx) {
  const t = await testo(S.page); const s = ctx.prevSnap || {};
  for (const [rx, nome] of LINT) { const m = t.match(rx); if (m) { const i = t.indexOf(m[0]); anomalia(ctx, s.season, s.week, 'testo', `${nome}: «${t.slice(Math.max(0, i - 50), i + 60).replace(/\n+/g, ' | ')}»`); } }
}

export async function salvaCheckpoint(S, nome) {
  const dump = await S.page.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });
  fs.writeFileSync(path.join(DATI, 'cp-' + nome + '.json'), JSON.stringify(dump)); return Object.keys(dump).length;
}
/* gioca N settimane; si ferma al primo imprevisto. ctx.opzioni: { classificaOgni } */
export async function giro(S, ctx, n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const r = await giocaSettimana(S, ctx);
    const snap = await invarianti(S, ctx); const s = await stato(S);
    if (s) { registra({ ...s, esito: r, live: ctx.nLive, partite: ctx.nPartite }); }
    if (S.errors.length > (ctx.erroriVisti || 0)) { const nuovi = S.errors.slice(ctx.erroriVisti || 0); ctx.erroriVisti = S.errors.length; nuovi.forEach(e => anomalia(ctx, s && s.st, s && s.wk, 'pageerror', e.m)); }
    if (S.cons.length > (ctx.consVisti || 0)) { const nuovi = S.cons.slice(ctx.consVisti || 0); ctx.consVisti = S.cons.length; nuovi.filter(e => !/BABEL\] Note/.test(e.m)).forEach(e => anomalia(ctx, s && s.st, s && s.wk, 'console-error', e.m)); }
    await lintTesti(S, ctx);
    if (s && (s.wk % 6 === 0) && ctx.ultimaClassSett !== s.st + ':' + s.wk) { ctx.ultimaClassSett = s.st + ':' + s.wk; await controllaClassificaUI(S, ctx); }
    out.push(r);
    if (r !== 'ok') break;
  }
  return out;
}
