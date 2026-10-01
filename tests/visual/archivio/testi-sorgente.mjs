#!/usr/bin/env node
/* [7.999.46 — PARTE A, «estraete i testi da script, non a mano»] Estrae dai sorgenti src/*.jsx ogni testo che puo' finire a
   schermo (stringhe, template, testo JSX: con lettere e almeno uno spazio, commenti esclusi dal parser) con file e riga, e ci
   applica le regole di lint-italiano. Scrive docs/collaudo-testi/testi-sorgente.json. Sola lettura. */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url); const Babel = require('@babel/standalone');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC = path.join(ROOT, 'src'); const out = []; const errs = [];
for (const f of fs.readdirSync(SRC).filter(x => x.endsWith('.jsx')).sort()) {
  const code = fs.readFileSync(path.join(SRC, f), 'utf8'); let ast;
  try { ast = Babel.transform(code, { ast: true, code: false, presets: ['react'], sourceType: 'script', parserOpts: { errorRecovery: true, allowReturnOutsideFunction: true } }).ast; } catch (e) { errs.push(f + ': ' + String(e.message).slice(0, 80)); continue; }
  const walk = n => { if (!n || typeof n !== 'object') return; if (Array.isArray(n)) { n.forEach(walk); return; }
    if (n.type === 'StringLiteral' || n.type === 'JSXText') { const v = n.value; if (/[a-zà-ù]{2,}\s+[a-zà-ù]/i.test(v)) out.push({ f, r: n.loc && n.loc.start.line, t: v.replace(/\s+/g, ' ').trim() }); }
    else if (n.type === 'TemplateLiteral') { const v = n.quasis.map(q => q.value.cooked).join('{…}'); if (/[a-zà-ù]{2,}\s+[a-zà-ù]/i.test(v)) out.push({ f, r: n.loc && n.loc.start.line, t: v.replace(/\s+/g, ' ').trim() }); }
    for (const k in n) if (k !== 'loc' && k !== 'leadingComments' && k !== 'trailingComments' && k !== 'innerComments') walk(n[k]); };
  walk(ast.program);
}
const RX = { 'accento con apostrofo': /(^|[^A-Za-zÀ-ÿ'])((?:[Ee]|[Pp]erch[e]|[Pp]i[u]|[Gg]i[a]|[Pp]u[o]|[Cc]os[i]|[Cc]itt[a]|[Vv]erit[a]|[Mm]et[a]|[Ll]ibert[a]|[Ss]ociet[a]|[Qq]ualit[a]|[Aa]ttivit[a]|[Nn]ovit[a]|[Pp]er[o]|[Pp]oich[e]|[Ff]inch[e]|[Ee]t[a]|[Ss]ar[ao]|[Ff]ar[ao]|[Aa]vr[ao]|[Pp]otr[ao]|[Dd]ovr[ao]|[Vv]err[ao]|[Tt]orner[ao]|[Gg]iocher[ao]))'(?=[\s.,;:!?)»"]|$)/,
  'segnaposto': /undefined|NaN|\[object/, 'spazio prima della punteggiatura': /[A-Za-zÀ-ÿ0-9] +[,;:!?](?![.\d])/, 'manca lo spazio dopo la virgola': /[a-zà-ÿ],[A-Za-zÀ-ÿ]/ };
const hit = {}; for (const x of out) for (const [n, rx] of Object.entries(RX)) if (rx.test(x.t)) (hit[n] = hit[n] || []).push(x);
fs.writeFileSync(path.join(ROOT, 'docs/collaudo-testi/testi-sorgente.json'), JSON.stringify({ testi: out.length, errori: errs, hit }, null, 1));
console.log(`testi estratti ${out.length} · file non letti ${errs.length} ${JSON.stringify(errs)}`);
for (const [n, v] of Object.entries(hit)) { const perFile = {}; v.forEach(x => perFile[x.f] = (perFile[x.f] || 0) + 1); console.log(`\n## ${n}: ${v.length} testi · per file ${JSON.stringify(perFile)}`); v.slice(0, +(process.env.CPM_MAX || 12)).forEach(x => console.log(`  ${x.f}:${x.r} — ${x.t.slice(0, 130)}`)); }
