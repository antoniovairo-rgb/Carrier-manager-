/* PO-228 — aggregazione del tabellino di partita (sola lettura). Legge i .jsonl di po228-partite.mjs e produce
   media/mediana/min/max per voce e per squadra, più i controlli di coerenza. Uso: node po228-analisi.mjs f1.jsonl f2.jsonl ... */
import fs from 'node:fs';
const recs = [];
for (const f of process.argv.slice(2)) for (const l of fs.readFileSync(f, 'utf8').split('\n')) if (l.trim()) recs.push(JSON.parse(l));
const ok = recs.filter(r => r.stats && Object.keys(r.stats).length > 0);
const VOCI = ['Gol','Possesso','Tiri','Tiri in porta','Gol attesi (xG)','Azioni dalle fasce','Cross','Dribbling riusciti','Passaggi','Precisione passaggi','Recuperi','Parate',"Calci d'angolo",'Falli','Ammonizioni','Espulsioni','Rimesse laterali'];
const PCT = new Set(['Possesso','Dribbling riusciti','Precisione passaggi']);
const num = s => (s === undefined ? null : parseFloat(String(s).replace('%', '')));
const st = (a) => { const v = a.filter(x => x != null).sort((p, q) => p - q); if (!v.length) return null; const m = v.reduce((s, x) => s + x, 0) / v.length;
  const med = v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2; return { n: v.length, media: +m.toFixed(2), mediana: +med.toFixed(2), min: v[0], max: v[v.length - 1] }; };
const out = { partite: ok.length, voci: {}, coerenza: {}, assenti: {}, casa: {} };
for (const v of VOCI) {
  const sx = ok.map(r => r.stats[v] ? num(r.stats[v].mine) : 0), dx = ok.map(r => r.stats[v] ? num(r.stats[v].loro) : 0);
  const assenti = ok.filter(r => !r.stats[v]).length;
  out.assenti[v] = assenti;
  out.voci[v] = { casa: st(sx), trasferta: st(dx) };
  if (!PCT.has(v) && v !== 'Gol attesi (xG)') out.voci[v].totale = st(ok.map((r, i) => sx[i] + dx[i]));
  if (v === 'Gol attesi (xG)') out.voci[v].totale = st(ok.map((r, i) => sx[i] + dx[i]));
}
// coerenza
let golMis = 0, possNo100 = 0, portaGtTiri = 0, crossGtPass = 0; const dettagli = [];
for (const r of ok) {
  const g = r.stats.Gol ? [num(r.stats.Gol.mine), num(r.stats.Gol.loro)] : [0, 0];
  if (r.score && (g[0] !== r.score.home || g[1] !== r.score.away)) { golMis++; dettagli.push({ k: r.k, tip: 'gol≠tabellone', tab: g, score: r.score }); }
  if (r.stats.Possesso) { const p = num(r.stats.Possesso.mine) + num(r.stats.Possesso.loro); if (p !== 100) { possNo100++; dettagli.push({ k: r.k, tip: 'possesso≠100', p }); } }
  for (const s of ['mine', 'loro']) {
    const t = r.stats.Tiri ? num(r.stats.Tiri[s]) : 0, p = r.stats['Tiri in porta'] ? num(r.stats['Tiri in porta'][s]) : 0;
    if (p > t) { portaGtTiri++; dettagli.push({ k: r.k, tip: 'in porta>tiri', s }); }
    const c = r.stats.Cross ? num(r.stats.Cross[s]) : 0, pa = r.stats.Passaggi ? num(r.stats.Passaggi[s]) : 0;
    if (c > pa) { crossGtPass++; dettagli.push({ k: r.k, tip: 'cross>passaggi', s }); }
  }
}
out.coerenza = { partite: ok.length, gol_diversi_dal_tabellone: golMis, possesso_non_100: possNo100, in_porta_maggiore_di_tiri: portaGtTiri, cross_maggiore_di_passaggi: crossGtPass, dettagli };
// squadra di casa (colonna sinistra) vs squadra del giocatore
const CLUB = JSON.parse(fs.readFileSync(new URL('../../tests/visual/fixtures/save-190-s12-ovr93.json', import.meta.url))).player.club.n; /* squadra del giocatore nel salvataggio (club.n) */
out.casa = ok.map(r => ({ k: r.k, squadraSalvataggio: CLUB, colonnaSinistra: r.teams ? r.teams[0] : null, colonnaDestra: r.teams ? r.teams[1] : null, giocatoreInCasa: r.teams ? r.teams[0] === CLUB : null }));
out.casa_riepilogo = { giocatoreInCasa: out.casa.filter(x => x.giocatoreInCasa === true).length, giocatoreInTrasferta: out.casa.filter(x => x.giocatoreInCasa === false).length, nonVerificabile: out.casa.filter(x => x.giocatoreInCasa === null).length };
console.log(JSON.stringify(out, null, 1));
