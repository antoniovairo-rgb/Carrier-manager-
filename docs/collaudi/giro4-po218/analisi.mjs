#!/usr/bin/env node
/* GIRO 4 · PO-218 · analisi dei dati grezzi in dati/*.json (nessuna partita giocata qui).
   Per ogni scena NON riuscita confronta tre racconti: riquadro (fam/ovl), motore (ev, da __CPM_RES218),
   e cronaca successiva (__CPM_TXT487 alla sorgente). Il motore è ridotto alla sua famiglia d'esito:
   tiro:fuori→wide, tiro:saved→saved, tiro:blocked→blocked, tiro:post→post, intercetto→intercepted, fallo→foul.
   «Non verificabile» = il motore non registra un esito (solo passaggio/conduzione/pronto). */
import fs from 'node:fs';
const DIR = new URL('./dati/', import.meta.url);
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort();
const partite = files.map(f => JSON.parse(fs.readFileSync(new URL(f, DIR))))
  .filter(p => p.scene && p.scene.length);

// Famiglia d'azione dall'etichetta (regole esplicite, pubblicate in questo file).
const famAzione = (label = '') => {
  const L = label.toLowerCase();
  if (/punizione/.test(L)) return 'punizione';
  if (/cross|traversone|palla in area|rimetti/.test(L)) return 'cross';
  if (/finta|conduc|proteggi|anticipa|chiusura|scivolata|contrasto|dribbl|cambio/.test(L)) return 'dribbling/finta';
  if (/uno-due|filtrante|sponda|scarico|passaggio/.test(L)) return 'passaggio';
  if (/tiro|girata|volée|volee|botta|conclusione|controllo e tiro|incornata|testa|piazzato|curva/.test(L)) return 'tiro';
  return 'altro';
};
// Famiglia del motore dagli eventi registrati.
const famMotore = (ev = []) => {
  const t = ev.find(e => e.startsWith('tiro:'));
  if (t) { const es = t.split(':')[1].split('(')[0]; return { fuori: 'wide', saved: 'saved', blocked: 'blocked', post: 'post' }[es] || es; }
  if (ev.some(e => e.startsWith('intercetto'))) return 'intercepted';
  if (ev.some(e => e.startsWith('fallo'))) return 'foul';
  return null; // non verificabile
};
// Famiglia del riquadro: fam, altrimenti dal testo (per le voci senza fam).
const famRiquadro = s => s.fam || (s.ovl && /fallo/i.test(s.ovl) ? 'foul' : null);
const famCronaca = (txt = '') => {
  if (/fuorigioco|bandierina|offside/i.test(txt)) return 'offside';
  if (/intercett|ruba palla|ruba/i.test(txt)) return 'intercepted';
  if (/murat|respint|si oppone|chiuso|mette in mezzo/i.test(txt)) return 'blocked';
  if (/parat|di no|portiere/i.test(txt)) return 'saved';
  if (/palo|traversa/i.test(txt)) return 'post';
  if (/fuori|esce|allarga/i.test(txt)) return 'wide';
  if (/fallo|stende|punizione/i.test(txt)) return 'foul';
  return null;
};

const righe = [];
for (const p of partite) for (const s of p.scene) {
  if (s.ok) continue;
  const fa = famAzione(s.label);
  const fr = famRiquadro(s);
  const fm = famMotore(s.ev);
  const succ = s.successiva ? s.successiva.txt : '';
  righe.push({ partita: p.id, nome: p.name, hl: s.hl, label: s.label, key: s.key, fa, fr, fm,
    ovl: s.ovl, ev: (s.ev || []).map(e => e.replace(/\(.*/, '')).join('+'), outKind: s.outKind,
    succ: succ, fc: famCronaca(succ) });
}

// 1) Tabella per famiglia d'azione: concordi / totali fra riquadro e motore; cronaca concorde come colonna a parte.
const tab = {};
for (const r of righe) {
  const t = tab[r.fa] || (tab[r.fa] = { totali: 0, verificabili: 0, concordi: 0, nonVerif: 0, cronacaVerif: 0, cronacaConcorde: 0 });
  t.totali++;
  if (r.fm == null) t.nonVerif++; else if (r.fr == null) t.senzaFamiglia = (t.senzaFamiglia||0)+1; else { t.verificabili++; if (r.fr === r.fm) t.concordi++; }
  if (r.fc) { t.cronacaVerif++; if (r.fc === (r.fm || r.fr)) t.cronacaConcorde++; }
}

// 2) Le tre classi nominate dal PO / da Codex.
const classi = {
  // A: il riquadro parla di passaggio mentre il motore registra un tiro
  passaggioSuTiro: righe.filter(r => /assaggio|Passaggio|passaggio|Palla regalat|Letto dalla difesa/.test(r.ovl || '') && /tiro:/.test(r.ev)),
  // B: «passaggio respinto» (o simile) su tiro murato
  respintoSuMurato: righe.filter(r => /respint/i.test(r.ovl || '') && /tiro:blocked/.test(r.ev)),
  // C: fuorigioco nel riquadro (o nella cronaca) contro intercetto nel motore
  fuorigiocoVsIntercetto: righe.filter(r => (r.fr === 'offside' || r.fc === 'offside') && /intercetto/.test(r.ev)),
  // D: fuorigioco nel riquadro, motore senza intercetto né fuorigioco
  fuorigiocoSenzaRiscontro: righe.filter(r => r.fr === 'offside' && !/intercetto/.test(r.ev)),
};

// 3) Discordanze generiche riquadro vs motore (sulle verificabili).
const discordanze = righe.filter(r => r.fm != null && r.fr != null && r.fr !== r.fm);

const out = {
  partite: partite.map(p => ({ id: p.id, nome: p.name, fixture: p.fixture, fine: p.fine, scene: p.scene.length, nonRiuscite: p.scene.filter(s => !s.ok).length })),
  scene_non_riuscite: righe.length,
  per_famiglia: tab,
  classi: Object.fromEntries(Object.entries(classi).map(([k, v]) => [k, v.length])),
  discordanze_generiche: discordanze.length,
  dettaglio_classi: classi,
  discordanze: discordanze.map(r => ({ partita: r.partita, hl: r.hl, label: r.label, fa: r.fa, riquadro: r.fr, ovl: r.ovl, motore: r.fm, ev: r.ev, cronaca_succ: r.succ, fc: r.fc })),
  tutte: righe,
};
fs.writeFileSync(new URL('./analisi-output.json', import.meta.url), JSON.stringify(out, null, 1));
console.log('partite valide', partite.length, '· scene non riuscite', righe.length);
console.log('famiglia | totali | verificabili | concordi riquadro/motore | non verificabili | cronaca verificabile | cronaca concorde');
for (const [k, t] of Object.entries(tab)) console.log(`${k} | ${t.totali} | ${t.verificabili} | ${t.concordi} | ${t.nonVerif} | ${t.cronacaVerif} | ${t.cronacaConcorde}`);
console.log('classi', out.classi, '· discordanze generiche', discordanze.length);
