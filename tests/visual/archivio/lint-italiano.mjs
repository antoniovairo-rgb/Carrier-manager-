#!/usr/bin/env node
/* [7.999.46 — PARTE A, punto 6 «Italiano»] Controllo automatico del testo VISIBILE raccolto da censimento-schermate
   (docs/collaudo-testi/testi.json, larghezza 412). Regole: accento scritto con l'apostrofo, spazi e punteggiatura,
   segnaposto non sostituiti, parole inglesi, tu/voi misti. Stampa per regola le occorrenze con la schermata. Sola lettura. */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const T = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/collaudo-testi/testi.json'), 'utf8'));
const R = [
  ['accento con apostrofo', /(^|[^A-Za-zÀ-ÿ'])((?:[Ee]|[Pp]erch[e]|[Pp]i[u]|[Gg]i[a]|[Pp]u[o]|[Cc]os[i]|[Cc]itt[a]|[Vv]erit[a]|[Mm]et[a]|[Ll]ibert[a]|[Ss]ociet[a]|[Qq]ualit[a]|[Aa]ttivit[a]|[Cc]apacit[a]|[Nn]ovit[a]|[Pp]er[o]|[Pp]oich[e]|[Ff]inch[e]|[Aa]ffinch[e]|[Nn]ient[e]|[Cc]ompet[e]|[Ee]t[a]|[Uu]nivers[i]t[a]|[Ss]ar[a]|[Ff]ar[a]|[Aa]vr[a]|[Pp]otr[a]|[Dd]ovr[a]|[Vv]err[a]|[Tt]orner[a]|[Gg]iocher[a]|[Ss]ar[o]|[Ff]ar[o]|[Aa]vr[o]))'(?=[\s.,;:!?)»"]|$)/g],
  ['segnaposto non sostituito', /undefined|NaN|\bnull\b|\[object|\$\{|\{\{|\}\}/g],
  ['spazio prima della punteggiatura', /[A-Za-zÀ-ÿ0-9] +[,.;:!?](?![.\d])/g],
  ['manca lo spazio dopo la virgola', /[A-Za-zÀ-ÿ],[A-Za-zÀ-ÿ]/g],
  ['doppio spazio', /[^\s]  +[^\s]/g],
  ['parola inglese', /\b(Loading|Error|Save|Continue|Settings|Skip|Next|Back|Close|Cancel|Match|Player|Team|Score|Rating|Overall|Level up|Stats|Home|Dashboard|Unlock|Locked|Reward|Coming soon|Tap|Click)\b/g],
  ['voi di cortesia verso il giocatore', /\b(avete|siete|vostr[oaie]|potete|dovete|volete)\b/g],
];
const out = {}; let tot = 0;
for (const [id, s] of Object.entries(T.schermate)) {
  const txt = (s.w[412] && s.w[412].testo) || ''; const righe = txt.split('\n');
  for (const [nome, rx] of R) for (const r of righe) { rx.lastIndex = 0; let m; while ((m = rx.exec(r))) { (out[nome] = out[nome] || []).push({ id, frase: r.trim().slice(0, 140), trovato: m[0].trim() }); tot++; if (!rx.global) break; } }
}
for (const [nome, v] of Object.entries(out)) { const uniche = [...new Map(v.map(x => [x.frase, x])).values()]; console.log(`\n## ${nome}: ${v.length} occorrenze, ${uniche.length} frasi diverse`); uniche.slice(0, +(process.env.CPM_MAX || 25)).forEach(x => console.log(`  [${x.id}] «${x.trovato}» — ${x.frase}`)); }
fs.writeFileSync(path.join(ROOT, 'docs/collaudo-testi/lint-italiano.json'), JSON.stringify(out, null, 1));
console.log(`\ntotale ${tot} occorrenze su ${Object.keys(T.schermate).length} schermate (versione ${T.versione})`);
