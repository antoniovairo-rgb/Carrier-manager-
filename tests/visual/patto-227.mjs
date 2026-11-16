#!/usr/bin/env node
/* [giro 227 · PO-492] GUARDIANO patto-227 — «Il patto col mister» promette solo cio' che il giocatore NON ha gia', e se il patto
   riesce il premio promesso viene DATO nei dati del gioco. Foto PO 7.999.195: al capitano «la fascia da vice-capitano è tua».
   Due parti, gioco vero (?cpmtest=1):
   A) CENSIMENTO su 3000 carriere sintetiche (capitano/ruolo/premi gia' avuti/club diversi, seme casuale) che passano per le
      funzioni vere del gioco (window.__CPM_PATTO227.scegli/assegna). Il GIUDICE e' scritto qui, indipendente dal gioco, sui
      dati grezzi: fascia = isCaptain; voce = capitano o ruolo leader; maglia = ruolo titolare/leader (calcSquadRole del gioco);
      rigori/piazzati/vice/voce = premiPatto227[id] uguale al club attuale. Verde: 0 promesse di cio' che si ha gia', 0 premi non
      assegnati, ogni premio (anche «fiducia») promesso almeno una volta, almeno 300 capitani giudicati.
   B) INTERFACCIA (due carriere): un capitano titolare che ha gia' rigori e piazzati → la proposta promette la fiducia; una
      riserva senza nulla → la proposta promette qualcosa che non ha. «Ci sto» → patto riuscito (gare finte) → «Una stretta di
      mano» → il premio e' nei dati (o la fiducia sale di 13 = 8 + 5). Zero errori di pagina.
   Rosso window.__CPM_NO_G227 (cinque frasi a seme, nessun premio dato) → DEVE essere bocciato. «Non giudicato» = rosso.
   Uscita 0 solo se il verde passa E il rosso e' bocciato.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node patto-227.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const CLUB = { id: 'liv', n: 'FC Merseyside', a: 'MER', p: 80, c: '#dc2626', c2: '#f5f5f5', nat: '🏴', lg: 'Premier Division' };
const AP = { campDone: true, presidentModalSeason: 3, jerseyNumSeason: 3, drawSeen: 3, mercatoSeen: 3, presentSeason: 3 };
function salva(over = {}) {
  const s = 82;
  const mh = [6, 7, 8, 9].map(w => ({ week: w, goals: 1, assists: 1, rating: 7.6, opponent: 'X', result: 'W' }));
  return { name: 'Guardiano Patto', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 10, weekLived: false, age: 28, ovr: s, tutorialDone: true, position: 'CEN',
    club: CLUB, stats: { 'velocità': s, tecnica: s, fisico: s, 'mentalità': s, tiro: s, passaggio: s, dribbling: s, posizionamento: s },
    form: 70, morale: 72, fatigue: 10, coachTrust: 80, popularity: 40, contract: { duration: 3, wage: 9000, expiresAtSeason: 5 }, matchHistory: mh, matches: 4, goals: 4, assists: 4, bankBalance: 80000, u18Seasons: 1,
    history: [], worldMemory: [], rival: null, totalMatches: 140, totalGoals: 31, log: [], ...AP, ...over };
}
async function apri(browser, port, player, flags) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await installCdnRoutes(page);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
  await page.addInitScript(([pl, fl]) => { window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; for (const f of fl) window[f] = 1; localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: pl })); }, [player, flags]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER && !!window.__CPM_PATTO227, null, { timeout: 25000 });
  await sleep(900);
  await page.evaluate(() => { try { window.__CPM_CAREER.resolveOpening(); } catch (e) {} try { window.__CPM_CAREER.dismiss(); } catch (e) {} try { window.__CPM_CAREER.goTab('dashboard'); } catch (e) {} });
  await sleep(700);
  return { page, errors };
}
/* A — censimento con giudice indipendente */
async function censimento(page) {
  return page.evaluate(() => {
    const P = window.__CPM_PATTO227; const csr = (typeof calcSquadRole === 'function') ? calcSquadRole : null;
    let s = 12345; const rnd = () => { s = (s * 1103515245 + 12345) >>> 0; return s / 4294967296; };
    const RUOLI = ['primavera', 'riserva', 'rotazione', 'titolare', 'leader'];
    const giaHa = (p, id) => { const cl = p.club.id, pr = p.premiPatto227 || {}; const r = csr ? csr(p) : p.squadRole; const r2 = p.squadRole;
      if (id === 'vice') return p.isCaptain === true || pr.vice === cl;
      if (id === 'voce') return p.isCaptain === true || r === 'leader' || r2 === 'leader' || pr.voce === cl;
      if (id === 'maglia') return ['titolare', 'leader'].includes(r) || ['titolare', 'leader'].includes(r2) || (pr.maglia === cl && pr.magliaS === p.season);
      if (id === 'rig' || id === 'piaz') return pr[id] === cl;
      return false; };
    const out = { n: 0, capitani: 0, incoerenti: 0, nonDati: 0, perId: {}, esempi: [], capViceProm: 0 };
    for (let i = 0; i < 3000; i++) {
      const cap = rnd() < 0.3; const ovr = 55 + Math.floor(rnd() * 35), tr = 35 + Math.floor(rnd() * 65);
      const clubs = ['liv', 'ars', 'mil']; const cl = clubs[Math.floor(rnd() * 3)];
      const pr = {}; for (const id of ['rig', 'piaz', 'vice', 'voce']) if (rnd() < 0.35) pr[id] = rnd() < 0.8 ? cl : 'altro';
      if (rnd() < 0.2) { pr.maglia = cl; pr.magliaS = rnd() < 0.7 ? 3 : 2; }
      const p = { name: 'C' + i, proStatus: 'pro', season: 3, week: 10, club: { id: cl }, isCaptain: cap, ovr, coachTrust: tr, squadRole: RUOLI[Math.floor(rnd() * 5)],
        matchHistory: [{ rating: 6 + rnd() * 2.5 }, { rating: 6 + rnd() * 2.5 }, { rating: 6 + rnd() * 2.5 }], premiPatto227: pr };
      const seed = Math.floor(rnd() * 2147483647);
      const r = P.scegli(p, seed); out.n++; if (cap) out.capitani++;
      out.perId[r.id] = (out.perId[r.id] || 0) + 1;
      if (cap && /vice-capitano/.test(r.tx)) out.capViceProm++;
      const inc = r.id !== 'fiducia' && giaHa(p, r.id);
      if (inc) { out.incoerenti++; if (out.esempi.length < 4) out.esempi.push(`${cap ? 'capitano' : p.squadRole} → ${r.tx}`); }
      const a = P.assegna(p, r.id); const q = { ...p, ...(a.campi || {}) };
      const dato = (r.id === 'fiducia' || (a.id === 'fiducia')) ? (q.coachTrust || 0) > (p.coachTrust || 0) || p.coachTrust >= 100 : giaHa(q, r.id);
      if (!dato) out.nonDati++;
    }
    return out;
  });
}
/* B — interfaccia: proposta → Ci sto → patto riuscito → verdetto */
async function flusso(browser, port, over, flags) {
  const { page, errors } = await apri(browser, port, salva(over), flags);
  const res = { ok: false, motivo: '' };
  try {
    const leggi = () => page.evaluate(() => { const d = [...document.querySelectorAll('div')].filter(x => /ti ferma dopo l'allenamento/.test(x.innerText || '')); d.sort((a, b) => a.innerText.length - b.innerText.length); return d[0] ? d[0].innerText : null; });
    let tx = null; for (let k = 0; k < 10 && !tx; k++) { tx = await leggi(); if (!tx) await sleep(400); }
    res.proposta = tx; if (!tx) { res.motivo = 'proposta del patto non trovata (non giudicato)'; return res; }
    await page.getByText('«Ci sto»', { exact: false }).first().click({ timeout: 8000 });
    await sleep(600);
    const s1 = await page.evaluate(() => window.__CPM_CAREER.snapshot());
    const pact = s1.coachPact; res.rew = pact && pact.rew; res.trust0 = s1.coachTrust;
    if (!pact || pact.status !== 'active') { res.motivo = 'patto non attivo dopo «Ci sto»'; return res; }
    const from = pact.fromWeek || 10;
    const mh = [...(s1.matchHistory || []), ...[1, 2, 3, 4, 5, 6].map(k => ({ week: from + k, goals: 3, assists: 3, rating: 8.4, opponent: 'Y', result: 'W' }))];
    await page.evaluate(([mh]) => { window.__CPM_CAREER.patch({ matchHistory: mh, week: mh[mh.length - 1].week + 1 }); window.__CPM_CAREER.goTab('dashboard'); }, [mh]);
    await sleep(900);
    try { await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); } catch (e) {} }); } catch (e) {}
    await page.getByText('Una stretta di mano', { exact: false }).first().click({ timeout: 8000 });
    await sleep(700);
    const s2 = await page.evaluate(() => window.__CPM_CAREER.snapshot());
    res.premi = s2.premiPatto227 || null; res.trust1 = s2.coachTrust; res.stato = s2.coachPact && s2.coachPact.status; res.squadRole = s2.squadRole; res.ruoloPromesso = s2.ruoloPromesso94 || null;
    res.errori = errors.length;
    res.ok = true;
  } catch (e) { res.motivo = 'flusso interrotto: ' + String(e.message).slice(0, 120); }
  finally { res.errori = errors.length; await page.close(); }
  return res;
}
function giudicaFlussi(capo, ris) {
  const f = [];
  if (!capo.ok) f.push('capitano: ' + capo.motivo);
  else {
    if (/vice-capitano|spogliatoio parli tu|il rigorista sei tu|piazzati da qui|quella maglia/.test(capo.proposta)) f.push('capitano: promessa di cio\' che ha gia\' — «' + capo.proposta.slice(-90) + '»');
    if (capo.rew !== 'fiducia') f.push('capitano: premio salvato nel patto ' + capo.rew + ' (atteso fiducia)');
    if (capo.stato !== 'kept') f.push('capitano: verdetto non registrato (' + capo.stato + ')');
    if (capo.trust1 - capo.trust0 !== 13 && capo.trust1 !== 100) f.push(`capitano: fiducia +${capo.trust1 - capo.trust0} (attesa +13 = 8 + 5)`);
    if (capo.errori) f.push('capitano: errori di pagina ' + capo.errori);
  }
  if (!ris.ok) f.push('riserva: ' + ris.motivo);
  else {
    const id = ris.rew;
    if (!id || id === 'fiducia') f.push('riserva: premio salvato nel patto ' + id + ' (atteso un premio vero: non ha nulla)');
    else {
      const pr = ris.premi || {};
      const dato = id === 'maglia' ? (pr.maglia === CLUB.id && ris.ruoloPromesso && ris.ruoloPromesso.r === 'titolare' && ris.squadRole === 'titolare') : pr[id] === CLUB.id;
      if (!dato) f.push(`riserva: premio «${id}» promesso ma non dato (premi ${JSON.stringify(pr)})`);
    }
    if (ris.stato !== 'kept') f.push('riserva: verdetto non registrato (' + ris.stato + ')');
    if (ris.errori) f.push('riserva: errori di pagina ' + ris.errori);
  }
  return f;
}
function giudicaCensimento(c) {
  const f = [];
  if (c.n < 3000) f.push('censimento incompleto ' + c.n);
  if (c.capitani < 300) f.push('capitani giudicati ' + c.capitani + ' < 300 (non giudicato)');
  if (c.incoerenti > 0) f.push(`${c.incoerenti} promesse di cio' che il giocatore ha gia' (es. ${c.esempi.join(' | ')})`);
  if (c.nonDati > 0) f.push(`${c.nonDati} premi promessi e non assegnati a patto riuscito`);
  for (const id of ['rig', 'piaz', 'maglia', 'vice', 'voce', 'fiducia']) if (!c.perId[id]) f.push(`premio «${id}» mai promesso (non giudicato)`);
  return f;
}
const CAPO = { isCaptain: true, captainSince: 2, squadRole: 'leader', coachTrust: 80, premiPatto227: { rig: CLUB.id, piaz: CLUB.id } };
const RIS = { isCaptain: false, squadRole: 'riserva', ovr: 62, coachTrust: 50 };
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const esito = {};
try {
  for (const [braccio, flags] of [['verde', []], ['rosso', ['__CPM_NO_G227']]]) {
    console.log(`— braccio ${braccio}${flags.length ? ' (' + flags.join(',') + ')' : ''}`);
    const { page, errors } = await apri(browser, port, salva(), flags);
    const c = await censimento(page); await page.close();
    console.log(`  censimento: ${c.n} carriere · capitani ${c.capitani} · promesse incoerenti ${c.incoerenti} · al capitano «vice-capitano» ${c.capViceProm} · premi non dati ${c.nonDati} · per premio ${JSON.stringify(c.perId)} · errori ${errors.length}`);
    const capo = await flusso(browser, port, CAPO, flags);
    const ris = await flusso(browser, port, RIS, flags);
    console.log(`  capitano: premio ${capo.rew} · fiducia ${capo.trust0}→${capo.trust1} · «${(capo.proposta || '').slice(-80)}» ${capo.motivo || ''}`);
    console.log(`  riserva:  premio ${ris.rew} · premi ${JSON.stringify(ris.premi)} · ruolo ${ris.squadRole} · «${(ris.proposta || '').slice(-80)}» ${ris.motivo || ''}`);
    const f = [...giudicaCensimento(c), ...giudicaFlussi(capo, ris), ...(errors.length ? ['errori di pagina ' + errors.length] : [])];
    esito[braccio] = f;
    for (const m of f) console.log('  ✗ ' + m);
    if (!f.length) console.log('  ✓ tutto verde');
  }
} finally { await browser.close(); srv.close(); }
const verdeOk = esito.verde && esito.verde.length === 0;
const rossoBocciato = esito.rosso && esito.rosso.length > 0;
console.log(`\nverde: ${verdeOk ? 'PASSA' : 'BOCCIATO'} · rosso (__CPM_NO_G227): ${rossoBocciato ? 'BOCCIATO come deve' : 'PASSA — il guardiano non vede il difetto'}`);
console.log(verdeOk && rossoBocciato ? '✅ patto-227 VERDE' : '❌ patto-227 ROSSO');
process.exit(verdeOk && rossoBocciato ? 0 : 1);
