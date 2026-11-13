#!/usr/bin/env node
/* [giro 183 · PO-375, decisione PO «Meno e più varie»] GUARDIANO interviste-183 — e strumento di misura.
   Gioca una stagione di PRIMAVERA e una da PROFESSIONISTA con gli handler veri della carriera (__CPM_CAREER.step,
   partite simulate e Nazionale simulata con __CPM_SIM_NAT) e, dopo ogni partita, chiede al gioco se ci sarebbe
   l'intervista post partita e con quale domanda (window.intervista183, la stessa funzione del percorso vero),
   portandosi dietro la memoria della stagione come farebbe il salvataggio. Conta anche le interviste della
   settimana (15% da pro, 4% in Primavera, sorteggio seedato dalla sonda) con window.intervistaSett183.
   Misure per stagione: interviste post partita · interviste della settimana · domande diverse · RIPETIZIONI
   (stessa domanda nella stessa stagione) · quota di domande legate ai FATTI della partita.
   VERDE (giro 183 acceso): ripetizioni 0 · post partita <= 45% delle partite · fatti >= 60% del post partita.
   ROSSO (__CPM_NO_G183 = il comportamento di prima: intervista dopo OGNI partita, scelta col solo ricordo delle
   ultime 10) → deve fallire su frequenza e ripetizioni. «Non giudicato» (meno di 20 partite o nessuna
   intervista) = rosso. Uso: node interviste-183.mjs   ·   CPM_ARM=verde|rosso per un braccio solo. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const SAVES = {
  primavera: { phase: 'career', player: { name: 'Luca Prova', nation: 'Italia', avatarId: 0, proStatus: 'u18', season: 1, week: 1, age: 17, ovr: 58, tutorialDone: true,
    club: { id: 'ven', n: 'FC Laguna Primavera', a: 'LAG', p: 36, c: '#0f0f0f', c2: '#f97316', nat: '🇮🇹', lg: 'Primavera 2', isU18: true },
    stats: { 'velocità': 60, tecnica: 58, fisico: 57, 'mentalità': 58, tiro: 60, passaggio: 57, dribbling: 59, posizionamento: 58 },
    form: 70, morale: 72, fatigue: 10 } },
  pro: { phase: 'career', player: { name: 'Marco Prova', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 1, age: 20, ovr: 74, tutorialDone: true,
    club: { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' },
    stats: { 'velocità': 74, tecnica: 73, fisico: 72, 'mentalità': 74, tiro: 76, passaggio: 73, dribbling: 75, posizionamento: 74 },
    form: 70, morale: 72, fatigue: 10, contract: { duration: 3, wage: 6000, expiresAtSeason: 5 } } },
};

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();

async function stagione(tipo, rosso) {
  const ctx = await b.newContext({ viewport: { width: 900, height: 900 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errori = []; page.on('pageerror', e => errori.push(String(e.message).slice(0, 160)));
  await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; if (r) window.__CPM_NO_G183 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [SAVES[tipo], rosso]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1500);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(1200);
  const ha = await page.evaluate(() => ({ iv: typeof window.intervista183, sett: typeof window.intervistaSett183, pick: typeof window.pickInterviewByCtx, posta: typeof window.posta165 }));
  /* la memoria della stagione la tiene la sonda e la rimette nel giocatore prima di ogni domanda (le partite simulate non
     aprono la finestra dell'intervista, quindi il salvataggio non la scriverebbe da solo) */
  const out = await page.evaluate(async ([tipo]) => {
    const C = () => window.__CPM_CAREER; const sn0 = C().get().season;
    let mem = null; const reg = []; let sett = 0, iter = 0, rngS = 183 + (tipo === 'pro' ? 7 : 0);
    const rnd = () => { rngS = (rngS * 1103515245 + 12345) >>> 0; return (rngS >>> 8) / 16777216; };
    const fattiQ = q => !!(q && ((q.ctx || []).some(c => /^f_/.test(c)) || (q.cond && /matchResult|isHome/.test(String(q.cond)))));
    const prima = !!window.__CPM_NO_G183 || typeof window.intervista183 !== 'function';
    while (iter++ < 400) {
      const pre = C().snapshot(); if (typeof pre !== 'object') break;
      if ((pre.season || 1) !== sn0) break;
      const p0 = { ...pre, ...(mem ? { ivMem183: mem } : {}) };
      const nMh = (pre.matchHistory || []).length, lived = !!pre.weekLived;
      const res = C().step(); await new Promise(r => setTimeout(r, 120)); try { C().dismiss(); } catch (e) {}
      await new Promise(r => setTimeout(r, 120));
      if (res === 'seasonEnd' || /^error/.test(String(res))) break;
      /* intervista della settimana: stesso tasso del gioco, sorteggio della sonda (le due braccia vedono gli stessi sorteggi) */
      if (!lived && res === 'lived') { const tasso = (pre.proStatus || 'u18') === 'pro' ? 0.15 : 0.04;
        if (rnd() < tasso) { let q = null;
          if (prima) { q = window.pickInterviewByCtx(p0).q; } else { const r2 = window.intervistaSett183(p0); q = r2 && r2.q; if (q) mem = window.memIv183(p0, q).ivMem183; }
          if (q) { sett++; reg.push({ k: 'sett', w: pre.week, q: q.q, fatti: false }); } } }
      const post = C().snapshot(); const mh = (post.matchHistory || []).slice(nMh);
      for (const m of mh) {
        if ((m.season || pre.season) !== sn0) continue;
        const md = (pre.calendar || []).find(x => x && x.week === (pre.week || 1) && !x.played && ((m.national ? 'national' : m.euro ? 'euro' : m.cup ? 'cup' : 'league') === (x.type || 'league'))) || { type: m.national ? 'national' : m.euro ? 'euro' : m.cup ? 'cup' : 'league', opponentName: m.opponent };
        const r = { goals: m.goals | 0, assists: m.assists | 0, rating: m.rating, won: !!m.won, drew: !!m.drew, homeScore: m.homeScore, awayScore: m.awayScore, isHome: m.isHome, opponent: m.opponent,
          context: m.national ? 'national' : m.euro ? 'euro_group' : (md.type === 'cup' ? 'cup' : 'career') };
        let d;
        if (prima) { const iw = window.pickInterviewByCtx(p0, r); d = { si: true, q: iw.q, motivo: 'sempre (prima)' }; }
        else { d = window.intervista183(p0, md, r); if (d && d.si && d.q) mem = window.memIv183(p0, d.q).ivMem183; }
        reg.push({ k: 'post', w: pre.week, si: !!(d && d.si), q: d && d.si && d.q ? d.q.q : null, motivo: d && d.motivo, fatti: !!(d && d.si && fattiQ(d.q)) });
      }
    }
    return { reg, sett, iter };
  }, [tipo]);
  await ctx.close();
  const post = out.reg.filter(x => x.k === 'post'), iv = post.filter(x => x.si), tutte = out.reg.filter(x => x.q);
  const conta = {}; tutte.forEach(x => { conta[x.q] = (conta[x.q] || 0) + 1; });
  const ripetute = Object.values(conta).reduce((a, n) => a + (n - 1), 0);
  const motivi = {}; iv.forEach(x => { const k = String(x.motivo || '').replace(/[0-9]+/g, '#'); motivi[k] = (motivi[k] || 0) + 1; });
  return { tipo, braccio: rosso ? 'rosso' : 'verde', ha, partite: post.length, postIv: iv.length, sett: out.sett, totali: tutte.length,
    diverse: Object.keys(conta).length, ripetute, quotaRip: tutte.length ? +(ripetute / tutte.length * 100).toFixed(1) : null,
    fatti: iv.filter(x => x.fatti).length, quotaFatti: iv.length ? +(iv.filter(x => x.fatti).length / iv.length * 100).toFixed(1) : null,
    quotaPost: post.length ? +(iv.length / post.length * 100).toFixed(1) : null, motivi, errori: errori.slice(0, 3), esempi: iv.slice(0, 6).map(x => x.q) };
}

const ARM = process.env.CPM_ARM || 'entrambe';
const ris = [];
for (const rosso of (ARM === 'verde' ? [false] : ARM === 'rosso' ? [true] : [false, true]))
  for (const tipo of ['primavera', 'pro']) { const r = await stagione(tipo, rosso); ris.push(r); console.log(JSON.stringify(r)); }
await b.close(); srv.close();
fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL('./out/interviste-183.json', import.meta.url), JSON.stringify(ris, null, 1));
console.log('\n| stagione | braccio | partite | interviste post | % partite | settimana | domande | diverse | ripetute | % ripetute | legate ai fatti |');
console.log('|---|---|---|---|---|---|---|---|---|---|---|');
for (const r of ris) console.log(`| ${r.tipo} | ${r.braccio} | ${r.partite} | ${r.postIv} | ${r.quotaPost}% | ${r.sett} | ${r.totali} | ${r.diverse} | ${r.ripetute} | ${r.quotaRip}% | ${r.fatti} (${r.quotaFatti}%) |`);
const g = [];
for (const r of ris) {
  const nome = r.tipo + ' ' + r.braccio;
  if (r.partite < 20) { g.push(nome + ': NON GIUDICATO (solo ' + r.partite + ' partite)'); continue; }
  if (r.errori.length) g.push(nome + ': errori di pagina ' + JSON.stringify(r.errori));
  const ok = r.postIv > 0 && r.ripetute === 0 && r.quotaPost <= 45 && r.quotaFatti >= 60;
  if (r.braccio === 'verde' && r.ha.iv !== 'function') g.push(nome + ': window.intervista183 non esiste');
  if (r.braccio === 'verde' && !ok) g.push(nome + ': ' + (r.postIv === 0 ? 'NON GIUDICATO (nessuna intervista)' : 'ripetute ' + r.ripetute + ' · post ' + r.quotaPost + '% · fatti ' + r.quotaFatti + '%'));
  if (r.braccio === 'rosso' && ok) g.push(nome + ': il rosso non si vede (passa anche col comportamento di prima)');
}
if (ARM !== 'entrambe') { console.log(g.length ? '⚠️ ' + g.join(' · ') : 'misura completata'); process.exit(0); }
if (g.length) { console.log('❌ interviste-183'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ interviste-183 verde (meno interviste, nessuna domanda ripetuta nella stagione, domande sui fatti) e il rosso si vede');
