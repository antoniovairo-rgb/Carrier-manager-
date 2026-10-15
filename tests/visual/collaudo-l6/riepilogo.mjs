// COLLAUDO L6 — aggregazione dei JSON per carriera (solo lettura). Scrive riepilogo.json e stampa le tabelle.
import fs from 'fs'; import path from 'path'; import { ROOT } from '../lib/harness.mjs';
const DIR = path.join(ROOT, 'docs', 'collaudi', 'dati-carriere-l6');
const files = fs.readdirSync(DIR).filter(f => /^carriera-\d+\.json$/.test(f)).sort();
const C = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf-8')));
const avg = a => a.length ? +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(2) : null;
const med = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const band = age => age <= 20 ? 'gavetta 17-20' : age <= 25 ? 'affermazione 21-25' : age <= 30 ? 'élite 26-30' : 'declino 31+';
const out = { carriere: C.length, stagioniTotali: C.reduce((a, c) => a + c.seasonsDone, 0), fine: {}, errori: C.reduce((a, c) => a + c.pageerrors.length, 0) };
for (const c of C) out.fine[c.endReason] = (out.fine[c.endReason] || 0) + 1;
const S = []; // stagioni flat
for (const c of C) for (const s of c.seasons) {
  const mh = s.mh || [];
  const calH = new Map((s.cal || []).map(x => [x.w, x.h]));
  // VERIFICATO sui dati (riepilogo, sezione «lato»): homeScore = gol della squadra dell'eroe in casa E in trasferta; awayScore = avversario.
  const rows = mh.map(m => { const h = calH.get(m.w); return { ...m, h, team: m.hs, opp: m.as }; });
  const known = rows;
  const incWon = known.filter(r => r.won !== (r.team > r.opp)).length;
  const incDraw = known.filter(r => r.drew !== (r.team === r.opp)).length;
  const dupW = (s.dupWeekKeys || []).length;
  const st = s.standingsRows || [];
  const sumGF = st.reduce((a, r) => a + (r.gf || 0), 0), sumGA = st.reduce((a, r) => a + (r.ga || 0), 0);
  const me = st.find(r => r.id === (s.club && s.club.id));
  const ranked = [...st].sort((a, b) => b.pts - a.pts);
  const pos = me ? ranked.findIndex(r => r.id === me.id) + 1 : null;
  S.push({ c: C.indexOf(c), k: c.cfg.k, tier: c.cfg.tier, role: c.cfg.role, arch: c.cfg.archetype, nation: c.cfg.nation, season: s.season, age: s.age, band: band(s.age), ovr: s.ovr,
    partite: rows.length, golEroe: mh.reduce((a, m) => a + (m.g || 0), 0), assist: mh.reduce((a, m) => a + (m.a || 0), 0), voto: avg(mh.map(m => m.r).filter(x => x != null)),
    golSquadra: known.reduce((a, r) => a + r.team, 0), golSubiti: known.reduce((a, r) => a + r.opp, 0),  
    risultati5: known.filter(r => r.team >= 5).length, risultati7: known.filter(r => r.team >= 7).length, scarto5: known.filter(r => Math.abs(r.team - r.opp) >= 5).length,
    incoerenzaWon: incWon, incoerenzaDrew: incDraw, dupWeek: dupW, standingsGF: sumGF, standingsGA: sumGA, standingsPlayed: me ? me.played : null, pos, pts: me ? me.pts : null, standingsN: st.length,
    natCaps: s.nationalCaps, natCallupScreens: s.natCallupScreens, natGoals: s.nationalGoals, trofei: s.trophies,
    bankStart: s.startBankBalance, bankEnd: s.endBankBalance, impulsi: (c.impEvents || []).filter(e => e.s === s.season).length,
    impUnici: new Set((c.impEvents || []).filter(e => e.s === s.season).map(e => e.id)).size, morale: s.morale, popularity: s.popularity, form: s.form, fiducia: s.coachTrust,
    lega: s.club && s.club.lg, prestigio: s.club && s.club.p });
}
const catOf = c => new Map((c.catalogImpulses ? c.catalog : []).map(x => [x.id, x]));
// impulsi: ripetizioni per carriera, con/senza condizione
const impRep = [];
for (const c of C) {
  const cat = catOf(c); const ev = c.impEvents || [];
  const cnt = {}; ev.forEach(e => { cnt[e.id] = (cnt[e.id] || 0) + 1; });
  const tot = ev.length, uni = Object.keys(cnt).length;
  const senzaCond = ev.filter(e => cat.get(e.id) && !cat.get(e.id).cond).length;
  impRep.push({ k: c.cfg.k, tot, uni, ripetuti: tot - uni, senzaCond, idPiuRipetuto: Object.entries(cnt).sort((a, b) => b[1] - a[1])[0] || null });
}
out.impulsi = { eventiTotali: impRep.reduce((a, x) => a + x.tot, 0), unici: avg(impRep.map(x => x.uni)), ripetuti: impRep.reduce((a, x) => a + x.ripetuti, 0), senzaCondizione: impRep.reduce((a, x) => a + x.senzaCond, 0), catalogo: C[0] ? C[0].catalogImpulses : null,
  senzaCondizioneNelCatalogo: C[0] ? C[0].catalog.filter(x => !x.cond).length : null, perCarriera: impRep };
const byKey = (keyFn) => { const g = {}; S.forEach(s => { const k = keyFn(s); (g[k] = g[k] || []).push(s); }); return Object.fromEntries(Object.entries(g).map(([k, a]) => [k, { n: a.length, ovrMed: med(a.map(x => x.ovr)), golEroe: avg(a.map(x => x.golEroe)), assist: avg(a.map(x => x.assist)), voto: avg(a.map(x => x.voto).filter(x => x != null)), titolariPartite: avg(a.map(x => x.partite)), pos: avg(a.map(x => x.pos)), natCaps: avg(a.map(x => x.natCaps)), natCallup: avg(a.map(x => x.natCallupScreens)), trofei: avg(a.map(x => x.trofei)), bankDelta: avg(a.map(x => x.saldoStagione).filter(x => x != null)), impulsi: avg(a.map(x => x.impulsi)) }])); };
out.perFasciaEta = byKey(s => s.band);
out.perTier = byKey(s => s.tier);
out.perRuolo = byKey(s => s.role);
out.perArchetipo = byKey(s => s.arch);
// Goleade eroe
for (const c of C) { let prevEnd = null; for (const s of c.seasons) { const row = S.find(x => x.c === C.indexOf(c) && x.season === s.season); if (row) { row.saldoStagione = prevEnd == null ? null : (s.endBankBalance ?? 0) - prevEnd; } prevEnd = s.endBankBalance ?? 0; } }
const gS = S.filter(s => s.golSquadra != null && s.partite);
const tot = k => S.reduce((a, s) => a + (s[k] || 0), 0);
out.goleade = { stagioni: S.length, partite: tot('partite'), golEroe: tot('golEroe'), golSquadra: tot('golSquadra'), golSubiti: tot('golSubiti'), quotaGolEroeSuSquadra: +(tot('golEroe') / Math.max(1, tot('golSquadra'))).toFixed(3),
  golEroePerPartita: +(tot('golEroe') / Math.max(1, tot('partite'))).toFixed(2), golSquadraPerPartita: +(tot('golSquadra') / Math.max(1, tot('partite'))).toFixed(2),
  risultati5plus: tot('risultati5'), risultati7plus: tot('risultati7'), scarto5plus: tot('scarto5'), incoerenzaWon: tot('incoerenzaWon'), incoerenzaDrew: tot('incoerenzaDrew'), golEroeMaggioreSquadra: S.reduce((a, s) => a + (s.golEroeOltreSquadra || 0), 0), dupWeek: tot('dupWeek'),
  standingsGFneGA: S.filter(s => s.standingsGF !== s.standingsGA && s.standingsN).length, standingsSenzaRighe: S.filter(s => s.standingsN !== 18).length,
  partiteVsPlayed: S.filter(s => s.standingsPlayed != null && s.standingsPlayed !== s.partite).length };
const sal = S.map(s => s.saldoStagione).filter(x => x != null); out.economia = { stagioniConSaldo: sal.length, saldoMediano: med(sal), saldoMin: Math.min(...sal), saldoMax: Math.max(...sal), saldoMedio: avg(sal) };
out.nazionale = { stagioniConConvocazione: S.filter(s => s.natCallupScreens > 0).length, stagioniConPresenze: S.filter(s => s.natCaps > 0).length, convocazioniSchermate: tot('natCallupScreens'), presenzeCumulateMax: Math.max(...S.map(s => s.natCaps || 0)) };
fs.writeFileSync(path.join(DIR, 'riepilogo.json'), JSON.stringify({ ...out, stagioni: S }, null, 1));
console.log(JSON.stringify({ ...out, perFasciaEta: undefined, perTier: undefined, perRuolo: undefined, perArchetipo: undefined, impulsi: { ...out.impulsi, perCarriera: undefined } }, null, 1));
console.log('perFasciaEta', JSON.stringify(out.perFasciaEta)); console.log('perTier', JSON.stringify(out.perTier)); console.log('perRuolo', JSON.stringify(out.perRuolo)); console.log('perArchetipo', JSON.stringify(out.perArchetipo));
