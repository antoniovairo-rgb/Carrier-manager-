/* [collaudo 177 carriera 2] nucleo del pilota: legge lo schermo come un giocatore e risolve una cosa per volta. Solo collaudo. */
import fs from 'fs'; import path from 'path';
import * as L from './c177-car2-lib.mjs';
const { sleep, clickTesto, testo, foto, difetto, registra, DATI } = L;

export const NAV = /^(Salva|⏭️ Avanza Settimana|🎉 Festeggia|⚡ Vivi la Settimana|🏁 Avvia Stagione|[^ ]{1,4} Gioca vs|Calendario|La tua settimana|Obiettivi della stagione|Ultime notizie|☕ Sostieni|💡 Idee|Home$|Stagione$|Club$|Carriera$|Agente$|Ufficio$|Opzioni$)/;
/* bottoni cliccabili davvero (visibili, non coperti) con testo */
export const cliccabili = page => page.evaluate(() => [...document.querySelectorAll('button,[role=button]')].filter(x => {
  if (x.offsetParent === null || x.disabled) return false; const q = x.getBoundingClientRect(); if (q.width < 4 || q.height < 4) return false;
  const cx = q.left + q.width / 2, cy = q.top + q.height / 2; if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) return false; const e = document.elementFromPoint(cx, cy); return e && (x === e || x.contains(e)); })
  .map(x => (x.textContent || '').trim().replace(/\s+/g, ' ')));


export const overlayBtns = page => page.evaluate(() => {
  const all = [...document.querySelectorAll('button,[role=button]')];
  const hdr = [...document.querySelectorAll('div,span,p')].find(x => x.children.length < 6 && /^K.?rward/.test((x.textContent || '').trim()) && (x.textContent || '').length < 30);
  return all.filter(x => {
    if (x.offsetParent === null || x.disabled) return false; const q = x.getBoundingClientRect(); if (q.width < 4 || q.height < 4) return false;
    const cx = q.left + q.width / 2, cy = q.top + q.height / 2; if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) return false; const e = document.elementFromPoint(cx, cy); if (!(e && (x === e || x.contains(e)))) return false;
    if (hdr && !(hdr.compareDocumentPosition(x) & Node.DOCUMENT_POSITION_PRECEDING)) return false; return true; })
    .map(x => (x.textContent || '').trim().replace(/\s+/g, ' '));
});

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
  const p = S.page; const cl = await cliccabili(p); const t = await testo(p); const modali = cl.filter(x => !NAV.test(x) && !/›\s*$/.test(x) && x.length > 0);
  const tag = (s, extra) => { ctx.ultimo = s; if (extra) ctx.log(s, extra); return s; };
  /* 0. offerta di trasferimento sul tavolo (Accetta / Rifiuta) e presentazione del nuovo club */
  if (cl.some(x => /^Accetta/.test(x)) && cl.some(x => /^Rifiuta/.test(x))) {
    const tx = t.replace(/\n+/g, ' | '); const rigaClub = tx.split(' | ').slice(0, 4).join(' | '); const rinnovo = /rinnov/i.test(tx.slice(0, 600));
    const dec = ctx.decidiOfferta ? ctx.decidiOfferta(tx, rinnovo) : 'accetta'; ctx.log('offerta', { testa: [...tx.slice(0, 1100)].join(''), decisione: dec });
    const prima = await stato(S);
    await clickTesto(p, dec === 'accetta' ? /^Accetta/ : /^Rifiuta/); await sleep(2200);
    if (dec === 'accetta') { ctx.trasferimenti = (ctx.trasferimenti || 0) + 1; ctx.log('trasferimento', { da: prima && prima.club, st: prima && prima.st, wk: prima && prima.wk }); }
    return tag('offerta-' + dec);
  }
  if (cl.some(x => /^🏟️ Inizia la tua storia/.test(x))) { ctx.log('presentazione-club', { t: [...t.replace(/\n+/g, ' | ').slice(0, 600)].join('') }); await clickTesto(p, /Inizia la tua storia/); await sleep(1800); return tag('presentazione'); }
  /* 1. finestra partita */
  if (cl.some(x => /^Gioca( la partita| ·)/.test(x)) && cl.some(x => /^Simula e avanza/.test(x))) {
    ctx.nPartite = (ctx.nPartite || 0) + 1;
    const live = ctx.forzaLive != null ? ctx.forzaLive : ((ctx.nPartite - 1) % 4 === 0);
    const intro = t.slice(t.indexOf('SETTIMANA'), t.indexOf('SETTIMANA') + 300).replace(/\n+/g, ' | ');
    if (live) { await clickTesto(p, /^Gioca( la partita| ·)/); await sleep(1200); return 'LIVE'; }
    await clickTesto(p, /Simula e avanza/); await sleep(1500); return tag('sim', intro.slice(0, 160));
  }
  /* 2. impulso della settimana */
  if (/Impulso della settimana|IMPULSO/.test(t) && modali.length) {
    const sc = modali.filter(x => !/🔒/.test(x)); const i = (rot++) % sc.length; const testoI = t.replace(/\n+/g, ' | ').slice(t.indexOf('Impulso della settimana'), t.indexOf('Impulso della settimana') + 330);
    await clickTesto(p, new RegExp(sc[i].slice(0, 25).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    await sleep(700); return tag('impulso', { q: testoI, scelte: modali, scelta: sc[i] });
  }
  /* 3. intervista */
  const tutti = cl.filter(x => !NAV.test(x) && !/›\s*$/.test(x) && x.length > 0);
  /* 3a. «Il confronto» col procuratore (PO-253): scheda in linea nella home, con risposte sul club e proposta di sponsor */
  if (/Il confronto/.test(t) && tutti.some(x => /^(Sto benissimo qui|Sto bene, ma vorrei|Credo sia il momento|Voglio cambiare completamente|Vediamo|Più tardi)/.test(x))) {
    const dom = [...t.replace(/\n+/g, ' | ').slice(t.indexOf('Il confronto'), t.indexOf('Il confronto') + 600)].join('');
    let pickRx = null; const has = rx => tutti.some(x => rx.test(x));
    if (has(/^Sto benissimo qui/)) pickRx = ctx.vogliaCambiare ? /^Voglio cambiare completamente/ : ((rot++ % 2) ? /^Sto bene, ma vorrei/ : /^Sto benissimo qui/);
    else if (has(/^Vediamo/)) pickRx = /^Vediamo/;
    else pickRx = /^Più tardi/;
    const r = await clickTesto(p, pickRx); await sleep(800); ctx.log('confronto-agente', { testo: dom, scelta: r }); return tag('confronto');
  }
  const risposte = tutti.filter(x => /^\S{1,4}\s?(Ambizioso|Diplomatico|Umile|No comment|Aggressivo|Polemico|Ironico|Sincero)[^«]{0,3}«/.test(x));
  if ((risposte.length >= 2 || (/INTERVISTA|GIORNALIST|RISPONDI TU|ZONA MISTA/i.test(t) && tutti.length >= 2 && tutti.length <= 6)) && !/Gioca la partita|Impulso della settimana/.test(t)) {
    const o = (risposte.length >= 2 ? risposte : tutti).filter(x => !/^(Chiudi|Salva|Non ora)/.test(x)); let i = (rot++) % o.length; const dom = t.replace(/\n+/g, ' | ').match(/«[^»]{5,160}»/);
    const vuoleVia = o.findIndex(x => /guardarci intorno|cambiare completamente aria|andare via|lasciare il club/i.test(x)); if (ctx.vogliaCambiare && vuoleVia >= 0) i = vuoleVia;
    await clickTesto(p, new RegExp([...o[i]].slice(0, 14).join('').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))); await sleep(650); return tag('intervista', { q: dom && dom[0], r: [...o[i]].slice(0, 90).join(''), tutte: o.length > 3 ? undefined : o });
  }
  const overlayAttivo = !cl.some(x => /^Home$/.test(x));   /* una finestra copre la barra di navigazione: se «Home» non è cliccabile c'è un velo */
  /* 4. nulla di bloccante: chiusure comuni */
  if (overlayAttivo && modali.length === 1 && /^(✅ ?)?(Chiudi|OK|Ok|Continua|Avanti|Capito|Prosegui|Torna alla dashboard|🏟️ Torna alla dashboard)/.test(modali[0])) { await clickTesto(p, new RegExp(modali[0].slice(0, 10).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))); await sleep(800); return tag('chiudi:' + modali[0].slice(0, 30)); }
  if (modali.length === 0 || !overlayAttivo) return null;
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
  if (!/Simula e avanza/.test((await cliccabili(p)).join('|')) && s0 && s0.screen !== 'dashboard') { await clickTesto(p, /^Home$/); await sleep(500); }
  for (let it = 0; it < 80; it++) {
    const sc0 = await stato(S);
    if (ctx.cerca && sc0 && sc0.screen === 'dashboard' && !it) { const m = await cercaMercato(S, ctx); if (m) { await clickTesto(p, /^Home$/); await sleep(500); } }
    if (sc0 && sc0.screen && !/^(dashboard|stagione|club|carriera|agente|ufficio|opzioni|calendar|standings|coppe)$/.test(sc0.screen)) return 'SCHERMATA:' + sc0.screen;
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
      const s = await stato(S); if (!s) return 'bloccato:nostato'; const cl0 = await cliccabili(p); if (ctx.sponsorVisto && ctx.sponsorVisto.split(':')[0] !== String(s.st)) ctx.sponsorVisto = null;
      if (s0 && (s.st !== s0.st || s.wk !== s0.wk)) return s.screen && /seasonEnd|seasonAwards/.test(s.screen) ? 'fine-stagione' : 'ok';
      if (s.screen && /seasonEnd|seasonAwards|careerEnd/.test(s.screen)) return 'fine-stagione';
      if (cl0.some(x => /^Offerta di sponsor/.test(x)) && !ctx.sponsorVisto) { ctx.sponsorVisto = s.st + ':' + s.wk; await clickTesto(p, /^Offerta di sponsor/); await sleep(700); const tt = (await testo(p)).replace(/\n+/g, ' | '); const i = tt.indexOf('SPONSOR'); const f = await clickTesto(p, /^✍️|Firmo|Accetto/); ctx.log('sponsor', { t: [...tt.slice(i, i + 260)].join(''), firmato: f }); await sleep(700); continue; }
      if (cl0.some(x => /^🎙️ Vai in sala stampa/.test(x))) { await clickTesto(p, /Vai in sala stampa/); ctx.log('sala-stampa', { st: s.st, wk: s.wk, club: s.club }); await sleep(900); continue; }
      if (await clickTesto(p, /Vivi la Settimana|Avvia Stagione/)) { await sleep(900); continue; }
      if (await clickTesto(p, /Avanza Settimana/)) { await sleep(1200); continue; }
      if (await clickTesto(p, /^🎉 Festeggia/)) { ctx.log('festa', await testo(p).then(x => x.slice(0, 200))); await sleep(1500); continue; }
      if (await clickTesto(p, /Gioca vs|Gioca la partita della|Gioca (il|la) /)) { await sleep(800); continue; }
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

/* settimana d'apertura (ritiro, raduno, presidente, maglia, presentazione...): si percorre come un giocatore, prima opzione non di salto */
export async function wizardApertura(S, ctx, { scelta = 0 } = {}) {
  const p = S.page; const passi = [];
  for (let i = 0; i < 40; i++) {
    const t = await testo(p); const cl = await cliccabili(p); const m = cl.filter(x => !NAV.test(x) && x && !/^Chiudi — riprendi|^Salva/.test(x)); if (!m.length || /^(\S+ \| )?K⚽rward/.test(t)) break;
    const testa = [...t.replace(/\n+/g, ' | ').slice(0, 380)].join('');
    const scelte = m.filter(x => !/^Salta|^Chiudi|^Vai al finale/.test(x)); const pick = (scelte.length ? scelte[Math.min(scelta, scelte.length - 1)] : m[0]);
    if (!pick) { passi.push({ testa, nessuno: true }); break; }
    passi.push({ testa, scelte: m, pick }); ctx.log('apertura', { testa, scelte: m, pick });
    await clickTesto(p, new RegExp([...pick].slice(0, 20).join('').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))); await sleep(1200);
    const st = await stato(S); if (st && st.screen && !/^(dashboard|stagione|club|carriera|agente|ufficio|opzioni)$/.test(st.screen)) { passi.push({ schermata: st.screen }); break; }
  }
  return passi;
}

export async function apertura(S, ctx) {
  const p = S.page; const out = [];
  for (let i = 0; i < 10; i++) {
    const cl = await cliccabili(p);
    if (cl.some(x => /^🏁 Avvia Stagione/.test(x))) { await clickTesto(p, /Avvia Stagione/); await sleep(1300); const r = await wizardApertura(S, ctx); out.push(...r.map(x => (x.pick || x.schermata || '?'))); continue; }
    break;
  }
  return out;
}

/* gala di fine stagione: si apre ogni busta come un giocatore, e si registra il testo di ogni premio */
export async function galaFinale(S, ctx) {
  const p = S.page; const visti = []; let last = '';
  for (let i = 0; i < 70; i++) {
    const t = (await testo(p)).replace(/\n+/g, ' | ');
    if ((await cliccabili(p)).some(x => /^Vai al bilancio/.test(x))) { visti.push(t.slice(0, 1400)); break; }
    const h = t.slice(0, 260); if (h !== last) { last = h; visti.push(h); }
    const c = await clickTesto(p, /Apri la busta|Svela|E il vincitore|Prossimo premio|Avanti →|Continua/);
    await sleep(c ? 1100 : 1800);
    const st = await stato(S); if (st && st.screen && !/seasonAwards/.test(st.screen)) break;
  }
  ctx.log('gala', { passi: visti }); return visti;
}

/* finestra di mercato (settimane 1-5 e 19-23): una volta per finestra si fa girare il nome e si assegna «Cerca offerte» */
export async function cercaMercato(S, ctx) {
  const s = await stato(S); if (!s || s.pro !== 'pro') return null;
  const win = (s.wk >= 1 && s.wk <= 5) ? 'E' : (s.wk >= 19 && s.wk <= 23) ? 'I' : null; if (!win) return null;
  const k = s.st + win; ctx.finestre = ctx.finestre || {}; if (ctx.finestre[k]) return null; ctx.finestre[k] = 1;
  const p = S.page; await clickTesto(p, /^Agente$/); await sleep(900);
  const a = await clickTesto(p, /Fai girare il nome/); await sleep(900);
  const b = await clickTesto(p, /Cerca offerte/); await sleep(700);
  ctx.log('mercato', { st: s.st, wk: s.wk, finestra: win, faiGirare: a, compito: b });
  return 'mercato';
}

/* fine stagione: «Chiudi la stagione» → galà → bilancio → parata/film → «Inizia Stagione N»; ritorna 'ok' a stagione nuova, o 'SCHERMATA:x' se serve la mano */
export async function fineStagione(S, ctx) {
  const p = S.page; const s0 = await stato(S); let giri = 0;
  for (let i = 0; i < 40; i++) {
    const st = await stato(S); if (!st) return 'nostato';
    if (s0 && st.st > s0.st && st.screen === 'dashboard') return 'ok';
    if (st.screen === 'seasonAwards') { const cl = await cliccabili(p); if (cl.some(x => /^Vai al bilancio/.test(x))) { await clickTesto(p, /^Vai al bilancio/); await sleep(2500); continue; } await galaFinale(S, ctx); continue; }
    if (st.screen === 'seasonEnd') {
      const t = (await testo(p)).replace(/\n+/g, ' | '); ctx.fineSig = ctx.fineSig || new Set(); const sg = t.slice(0, 70); if (!ctx.fineSig.has(sg + st.st)) { ctx.fineSig.add(sg + st.st); ctx.log('fine-stagione-schermata', { st: st.st, t: [...t.slice(0, 2400)].join('') }); if (ctx.fotoFine) await foto(S, '_fs' + st.st + '-' + (giri++)); }
      const c = await clickTesto(p, /Inizia Stagione \d+|Continua →|Continua|Avanti/); await sleep(c ? 2200 : 1500); if (!c) return 'SCHERMATA:seasonEnd-senza-bottone'; continue; }
    if (st.screen !== 'dashboard') return 'SCHERMATA:' + st.screen;
    const cl = await cliccabili(p);
    if (cl.some(x => /Chiudi la stagione/.test(x))) { await clickTesto(p, /Chiudi la stagione/); await sleep(2500); continue; }
    const r = await passo(S, ctx); if (r && r.startsWith('IGNOTO')) return r; if (r === 'LIVE') return 'SCHERMATA:partita'; if (r === null) { if (await clickTesto(p, /Vivi la Settimana|Avanza Settimana/)) { await sleep(1200); continue; } return 'bloccato:fine'; }
  }
  return 'loop';
}
