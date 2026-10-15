// COLLAUDO L6 fase 1-bis — aggregazione dei JSON (solo lettura). Scrive riepilogo-bis.json e stampa i numeri del rapporto.
// Uso: node riepilogo-bis.mjs   (legge docs/collaudi/dati-carriere-l6-bis/{syn,u18,naz,gem}-*.json e, per confronto, la fase 1)
import fs from 'fs'; import path from 'path'; import { ROOT } from '../lib/harness.mjs';
const DIR = path.join(ROOT, 'docs', 'collaudi', 'dati-carriere-l6-bis');
const DIR1 = path.join(ROOT, 'docs', 'collaudi', 'dati-carriere-l6');
const load = (d, rx) => fs.existsSync(d) ? fs.readdirSync(d).filter(f => rx.test(f)).sort().map(f => ({ f, ...JSON.parse(fs.readFileSync(path.join(d, f), 'utf-8')) })) : [];
const avg = a => a.length ? +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(2) : null;
const sum = a => a.reduce((x, y) => x + y, 0);
const pct = (a, b) => b ? +(100 * a / b).toFixed(1) : null;
const band = age => age <= 20 ? 'gavetta 17-20' : age <= 25 ? 'affermazione 21-25' : age <= 30 ? 'élite 26-30' : 'declino 31+';
const goalsOf = s => sum((s.mh || []).map(m => m.g || 0));

function gruppo(C, nome) {
  const out = { gruppo: nome, carriere: C.length, stagioni: sum(C.map(c => c.seasonsDone)), fine: {}, pageerrors: sum(C.map(c => (c.pageerrors || []).length)) };
  for (const c of C) out.fine[c.endReason] = (out.fine[c.endReason] || 0) + 1;
  const S = [];
  for (const c of C) {
    let prevBank = c.start ? c.start.bank : 0, prevCaps = 0;
    c.seasons.forEach((s, i) => {
      const mh = s.mh || [];
      const giocate = mh.filter(m => !m.sv && m.r != null).length;
      const caps = s.nationalCaps || 0;
      const wk = s.weekly || [];
      const expWeeks = wk.filter(x => x[9] === 1).length;
      S.push({ f: c.f, k: c.cfg.k, tier: c.cfg.tier || c.cfg.mode, role: c.cfg.role, arch: c.cfg.archetype, nation: c.cfg.nation, idx: i + 1, season: s.season, age: s.age, band: band(s.age), ovr: s.ovr, pro: s.proStatus,
        partite: mh.length, giocate, svincolatoPartite: mh.filter(m => m.sv).length, gol: goalsOf(s), assist: sum(mh.map(m => m.a || 0)),
        golSquadra: sum(mh.map(m => m.hs || 0)), golSubiti: sum(mh.map(m => m.as || 0)),
        dur: s.contract ? s.contract.duration : null, expFine: !!s.contractExpired, expWeeks, club: s.club.id, clubP: s.club.p,
        bank: s.bankBalance || 0, dBank: (s.bankBalance || 0) - prevBank, caps, dCaps: caps - prevCaps, natSeason: (s.natHistory || []).length,
        callupEval: (s.callup || []).length, callupPassa: (s.callup || []).filter(x => x.passa).length, callupWeeks: (s.callup || []).map(x => x.w),
        morale: s.morale, trust: s.coachTrust, pop: s.popularity, role: s.squadRole, injWeeks: wk.filter(x => x[5] === 1).length,
        moraleMedia: avg(wk.map(x => x[3]).filter(x => x != null)), fatigueMedia: avg(wk.map(x => x[4]).filter(x => x != null)), legacy: s.legacy ? s.legacy.score : null,
        trofei: s.trophies });
      prevBank = s.bankBalance || 0; prevCaps = caps;
    });
  }
  out.S_n = S.length;
  // contratto e rinnovi
  const R = C.flatMap(c => (c.renewals || []).map(r => ({ ...r, f: c.f })));
  out.rinnovi = {
    tentativi: R.length, accettati: R.filter(r => /^accettato/.test(r.esito)).length, rifiutatiDalClub: R.filter(r => r.esito === 'rifiutato').length, ctaAssente: R.filter(r => r.esito === 'cta-assente').length, altro: R.filter(r => !/accettato|rifiutato|cta-assente/.test(r.esito)).length,
    carriereConAccettato: C.filter(c => (c.renewals || []).some(r => /^accettato/.test(r.esito))).length,
    carriereSenzaOfferta: C.filter(c => !(c.renewals || []).some(r => /^accettato/.test(r.esito))).length,
    carriereSenzaOffertaDettaglio: C.filter(c => !(c.renewals || []).some(r => /^accettato/.test(r.esito))).map(c => ({ f: c.f, tentativi: (c.renewals || []).length, rifiuti: (c.renewals || []).filter(r => r.esito === 'rifiutato').length, cta: (c.renewals || []).filter(r => r.esito === 'cta-assente').length, trustMin: Math.min(...(c.renewals || []).map(r => r.trust ?? 99)) })),
    durataAccettata: R.filter(r => /^accettato/.test(r.esito)).reduce((a, r) => { const d = r.contratto ? r.contratto.dur : '?'; a[d] = (a[d] || 0) + 1; return a; }, {}),
    unAnnoInutile: R.filter(r => /^accettato/.test(r.esito) && !r.exp && r.dur === 1 && r.contratto && r.contratto.dur === 1).length,
    daSvincolato: R.filter(r => r.exp && /^accettato/.test(r.esito)).length,
    trustRifiuti: avg(R.filter(r => r.esito === 'rifiutato').map(r => r.trust)), trustAccettati: avg(R.filter(r => /^accettato/.test(r.esito)).map(r => r.trust)),
  };
  out.contratto = { stagioniScaduteAFine: S.filter(s => s.expFine).length, settimaneDaSvincolato: sum(S.map(s => s.expWeeks)), settimaneTot: sum(S.map(s => (s.expWeeks >= 0 ? 1 : 0))) , partiteDaSvincolato: sum(S.map(s => s.svincolatoPartite)), partiteTot: sum(S.map(s => s.partite)) };
  // offerte e trasferimenti
  const O = C.flatMap(c => (c.offers || []).map(o => ({ ...o, f: c.f })));
  out.offerte = { totali: O.length, perCarriera: avg(C.map(c => (c.offers || []).length)), carriereConOfferta: C.filter(c => (c.offers || []).length).length, accettate: O.filter(o => o.decisione === 'accetta').length,
    accettateConCambioClub: O.filter(o => o.decisione === 'accetta' && o.after && o.after.club !== o.club).length, rifiutate: O.filter(o => o.decisione === 'rifiuta').length,
    perStagione: Object.fromEntries([...new Set(O.map(o => o.s))].sort((a, b) => a - b).map(s => [s, O.filter(o => o.s === s).length])),
    cambiClubStagionali: sum(C.map(c => c.seasons.reduce((a, s, i) => a + (i && s.club.id !== c.seasons[i - 1].club.id ? 1 : 0), 0))) };
  // saldo
  const pro = S.filter(s => s.pro === 'pro');
  out.saldo = { stagioniPro: pro.length, stagioniVariazioneZero: pro.filter(s => s.dBank === 0).length, variazioneMedia: avg(pro.map(s => s.dBank)), variazioneMediaContrattoValido: avg(pro.filter(s => !s.expFine && s.expWeeks === 0).map(s => s.dBank)),
    saldoFinaleMedio: avg(C.map(c => (c.seasons.slice(-1)[0] || {}).bankBalance || 0)), saldoFinaleMax: Math.max(0, ...C.map(c => (c.seasons.slice(-1)[0] || {}).bankBalance || 0)) };
  // gol per fascia, per indice stagione, per livello, per archetipo, per ruolo
  const by = (key, list = S) => { const g = {}; for (const s of list) { const k = s[key]; (g[k] = g[k] || []).push(s); } return Object.fromEntries(Object.entries(g).sort().map(([k, v]) => [k, { stagioni: v.length, ovr: avg(v.map(x => x.ovr)), gol: avg(v.map(x => x.gol)), assist: avg(v.map(x => x.assist)), giocate: avg(v.map(x => x.giocate)), partite: avg(v.map(x => x.partite)), golPerGiocata: +(sum(v.map(x => x.gol)) / Math.max(1, sum(v.map(x => x.giocate)))).toFixed(3) }])); };
  out.perFascia = by('band'); out.perIndice = by('idx'); out.perLivello = by('tier'); out.perArchetipo = by('arch'); out.perRuolo = by('role');
  // quota gol eroe / squadra
  out.partita = { golEroePerPartita: +(sum(S.map(s => s.gol)) / Math.max(1, sum(S.map(s => s.partite)))).toFixed(3), golEroePerGiocata: +(sum(S.map(s => s.gol)) / Math.max(1, sum(S.map(s => s.giocate)))).toFixed(3), quotaEroe: pct(sum(S.map(s => s.gol)), sum(S.map(s => s.golSquadra))) };
  // titolarita' (decisione del mister su ogni gara di campionato)
  const D = C.flatMap(c => (c.decisions || []).filter(d => d.type === 'league' && d.st));
  const minuti = d => d.st === 'starter' ? 90 : d.st === 'bench' ? Math.max(0, 90 - (d.em || 60)) : 0;
  const Dc = D.filter(d => !d.exp && !d.inj);
  out.titolarita = { gareValutate: D.length, conContratto: Dc.length, titolare: pct(Dc.filter(d => d.st === 'starter').length, Dc.length), panchina: pct(Dc.filter(d => d.st === 'bench').length, Dc.length), nonConvocato: pct(Dc.filter(d => d.st === 'not_called').length, Dc.length),
    minutiTeoriciMedi: avg(Dc.map(minuti)), daSvincolato: D.filter(d => d.exp).length,
    perStagione: Object.fromEntries([...new Set(Dc.map(d => d.s))].sort((a, b) => a - b).map(s => { const v = Dc.filter(d => d.s === s); return [s, { gare: v.length, titolare: pct(v.filter(d => d.st === 'starter').length, v.length), minuti: avg(v.map(minuti)) }]; })),
    perRuoloSquadra: Object.fromEntries([...new Set(Dc.map(d => d.role))].map(r => { const v = Dc.filter(d => d.role === r); return [r, { gare: v.length, titolare: pct(v.filter(d => d.st === 'starter').length, v.length) }]; })) };
  // Nazionale
  const capsUp = S.filter(s => s.dCaps > 0);
  out.nazionale = { carriereConPresenza: C.filter(c => (c.seasons.slice(-1)[0] || {}).nationalCaps > 0).length, presenzeMax: Math.max(0, ...C.map(c => (c.seasons.slice(-1)[0] || {}).nationalCaps || 0)), presenzeTot: sum(C.map(c => (c.seasons.slice(-1)[0] || {}).nationalCaps || 0)),
    stagioniConPresenzeNuove: capsUp.length, presenzeNuove: sum(capsUp.map(s => s.dCaps)), stagioniConPresenzeNuoveDaSvincolatoTuttaStagione: capsUp.filter(s => s.expWeeks >= 30).length, presenzeDaSvincolatoTuttaStagione: sum(capsUp.filter(s => s.expWeeks >= 30).map(s => s.dCaps)),
    stagioniConPresenzeNuoveConSettimaneSvincolato: capsUp.filter(s => s.expWeeks > 0).length,
    primaPresenza: C.map(c => { const i = c.seasons.findIndex(s => (s.nationalCaps || 0) > 0); return i < 0 ? null : { f: c.f, idx: i + 1, age: c.seasons[i].age, ovr: c.seasons[i].ovr, nation: c.cfg.nation }; }).filter(Boolean),
    valutazioniCancello: sum(S.map(s => s.callupEval)), valutazioniPerStagione: avg(S.filter(s => s.pro === 'pro').map(s => s.callupEval)), valutazioniPassate: sum(S.map(s => s.callupPassa)),
    settimaneValutate: Object.entries(S.flatMap(s => s.callupWeeks).reduce((a, w) => (a[w] = (a[w] || 0) + 1, a), {})).sort((a, b) => b[1] - a[1]).slice(0, 12) };
  const NL = C.flatMap(c => (c.natLive || []).map(n => ({ ...n, f: c.f })));
  out.nazionaleGiocata = { partite: NL.length, schermateConvocazione: NL.filter(n => n.callupScreen).length, primaConvocazione: NL.filter(n => /prima convocazione/i.test(n.callupTxt || '')).length, partiteLiveArrivateInCampo: NL.filter(n => n.screen2 === 'match').length,
    presenzeContate: NL.filter(n => n.after && n.after.caps > n.capsPrima).length, daSvincolato: NL.filter(n => n.exp).length, msMedi: avg(NL.map(n => n.ms)), etaDebutto: null,
    dettaglio: NL.map(n => ({ f: n.f, s: n.s, w: n.w, exp: n.exp, ovr: n.ovr, callup: n.callupScreen, caps: n.after && n.after.caps, g: n.after && n.after.last && n.after.last.g, r: n.after && n.after.last && n.after.last.r, sim: n.after && n.after.last && n.after.last.sim, ms: n.ms })) };
  // impulsi
  const cat = (C[0] && C[0].catalog) || []; const noCond = new Set(cat.filter(x => !x.cond).map(x => x.id));
  const IE = C.flatMap(c => c.impEvents || []);
  out.impulsi = { catalogo: cat.length, senzaCondizioneCatalogo: noCond.size, eventi: IE.length, perStagione: +(IE.length / Math.max(1, out.stagioni)).toFixed(2), eventiSenzaCondizione: IE.filter(e => noCond.has(e.id)).length, quotaSenzaCondizione: pct(IE.filter(e => noCond.has(e.id)).length, IE.length),
    unicPerCarriera: avg(C.map(c => new Set((c.impEvents || []).map(e => e.id)).size)), ripetizioni: sum(C.map(c => (c.impEvents || []).length - new Set((c.impEvents || []).map(e => e.id)).size)) };
  out.creazione = C.filter(c => c.creation).map(c => ({ f: c.f, ms: c.creation.ms, provini: c.creation.partiteProvino, arch: c.start.archetype, ovr: c.start.ovr, club: c.start.club && c.start.club.n, clubP: c.start.club && c.start.club.p, pro: (c.proTrans || []).map(p => p.s + ':' + p.click) }));
  out._S = S;
  return out;
}

function gemelli(G) {
  const rows = G.map(c => { const s = c.seasons, last = s.slice(-1)[0] || {}; const wk = s.flatMap(x => x.weekly || []);
    return { f: c.f, base: c.cfg.k, arm: c.cfg.arm, stagioni: c.seasonsDone, ovrFine: last.ovr, dOvr: (last.ovr || 0) - (c.start.ovr || 0), statsFine: last.stats ? sum(Object.values(last.stats)) : null,
      settimaneInfortunio: wk.filter(x => x[5] === 1).length, moraleMedia: avg(wk.map(x => x[3]).filter(x => x != null)), fatigueMedia: avg(wk.map(x => x[4]).filter(x => x != null)),
      popFine: last.popularity, trustFine: last.coachTrust, saldoFine: last.bankBalance, legacy: last.legacy ? last.legacy.score : null, patrimonio: last.legacy && last.legacy.pat ? last.legacy.pat.pts : null,
      gol: sum(s.map(goalsOf)), accademiaRagazzi: last.academy24 ? last.academy24.tot : 0, investimenti: (last.investHist24 || []).map(x => x.gain), rinnoviOk: (c.renewals || []).filter(r => /^accettato/.test(r.esito)).length, exp: s.filter(x => x.contractExpired).length };
  });
  const out = { righe: rows, delta: {} };
  for (const b of [...new Set(rows.map(r => r.base))]) {
    const base = rows.find(r => r.base === b && r.arm === 'nessuna'); if (!base) continue;
    out.delta[b] = rows.filter(r => r.base === b && r.arm !== 'nessuna').map(r => ({ arm: r.arm, dOvr: r.ovrFine - base.ovrFine, dStats: r.statsFine - base.statsFine, dInf: r.settimaneInfortunio - base.settimaneInfortunio, dMorale: +(r.moraleMedia - base.moraleMedia).toFixed(2), dFatica: +(r.fatigueMedia - base.fatigueMedia).toFixed(2), dPop: +((r.popFine || 0) - (base.popFine || 0)).toFixed(1), dTrust: +((r.trustFine || 0) - (base.trustFine || 0)).toFixed(1), dSaldo: r.saldoFine - base.saldoFine, dLegacy: (r.legacy ?? 0) - (base.legacy ?? 0), dGol: r.gol - base.gol }));
  }
  return out;
}

// fase 1, ricalcolata con le stesse funzioni dove i campi esistono
function fase1() {
  const C = load(DIR1, /^carriera-\d+\.json$/); if (!C.length) return null;
  const S = []; for (const c of C) { let pb = 0, pc = 0; c.seasons.forEach((s, i) => { const mh = s.mh || []; S.push({ idx: i + 1, age: s.age, band: band(s.age), gol: sum(mh.map(m => m.g || 0)), partite: mh.length, giocate: mh.filter(m => m.r != null).length, golSquadra: sum(mh.map(m => m.hs || 0)), dur: s.contract ? s.contract.duration : null, dBank: (s.bankBalance || 0) - pb, caps: s.nationalCaps || 0, dCaps: (s.nationalCaps || 0) - pc }); pb = s.bankBalance || 0; pc = s.nationalCaps || 0; }); }
  const g = {}; S.forEach(s => (g[s.band] = g[s.band] || []).push(s));
  return { carriere: C.length, stagioni: S.length, durataZero: S.filter(s => s.dur === 0).length, variazioneZero: S.filter(s => s.idx > 1 && s.dBank === 0).length,
    perFascia: Object.fromEntries(Object.entries(g).sort().map(([k, v]) => [k, { stagioni: v.length, gol: avg(v.map(x => x.gol)), golPerGiocata: +(sum(v.map(x => x.gol)) / Math.max(1, sum(v.map(x => x.giocate)))).toFixed(3) }])),
    golEroePerPartita: +(sum(S.map(s => s.gol)) / Math.max(1, sum(S.map(s => s.partite)))).toFixed(3), quotaEroe: pct(sum(S.map(s => s.gol)), sum(S.map(s => s.golSquadra))),
    offerte: sum(C.map(c => (c.seasons.slice(-1)[0] || {}).transferOffersLen || 0)), carriereConPresenza: C.filter(c => (c.seasons.slice(-1)[0] || {}).nationalCaps > 0).length };
}

const R = { generato: new Date().toISOString(), syn: gruppo(load(DIR, /^syn-\d+\.json$/), 'sintetiche'), u18: gruppo(load(DIR, /^u18-\d+\.json$/), 'creazione U18'), naz: gruppo(load(DIR, /^naz-\d+\.json$/), 'Nazionale giocata'),
  gemelli: gemelli(load(DIR, /^gem-\d+-.+\.json$/)), fase1: fase1() };
// gemelli Nazionale: stessa carriera sintetica col Nazionale simulata (syn) e giocata (naz)
R.nazVsSyn = load(DIR, /^naz-\d+\.json$/).map(n => { const s = load(DIR, new RegExp('^syn-' + String(n.cfg.k).padStart(2, '0') + '\\.json$'))[0]; const caps = c => c ? ((c.seasons.slice(-1)[0] || {}).nationalCaps || 0) : null;
  return { k: n.cfg.k, nation: n.cfg.nation, capsGiocata: caps(n), capsSimulata: caps(s), stagioniGiocata: n.seasonsDone, stagioniSimulata: s ? s.seasonsDone : null }; });
const strip = o => JSON.parse(JSON.stringify(o, (k, v) => k === '_S' ? undefined : v));
fs.writeFileSync(path.join(DIR, 'riepilogo-bis.json'), JSON.stringify(strip(R), null, 1));
const flat = []; for (const g of ['syn', 'u18', 'naz']) for (const s of R[g]._S) flat.push({ g, ...s, callupWeeks: undefined });
fs.writeFileSync(path.join(DIR, 'stagioni-bis.json'), JSON.stringify(flat));
console.log(JSON.stringify(strip(R), null, 1).slice(0, Number(process.env.CPM_MAXOUT || 20000)));
