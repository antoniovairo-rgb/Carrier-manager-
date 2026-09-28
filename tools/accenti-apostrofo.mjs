#!/usr/bin/env node
/* [7.999.46 — PARTE A, errori di italiano evidenti autorizzati dal PO] Sostituisce l'accento scritto con l'apostrofo («e'»,
   «perche'», «li'», «cosi'») con la lettera accentata, SOLO dentro i testi (stringhe, template, testo JSX: posizioni date dal
   parser, commenti mai toccati). Esclusi i troncamenti corretti (po', di', fa', va', sta', da', to', mo', be') e le parole fra
   virgolette semplici aperte nello stesso testo. A secco di default; --scrivi applica. Stampa per file e ogni testo cambiato. */
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const require = createRequire(path.resolve('tests/visual/x.mjs')); const Babel = require('@babel/standalone');
const SCRIVI = process.argv.includes('--scrivi'), SRC = path.resolve('src');
const TRONCHI = new Set(['po', 'di', 'fa', 'va', 'sta', 'da', 'to', 'mo', 'be', 'de', 'ne', 'Po', 'Di', 'Fa', 'Va', 'Sta', 'Da', 'To', 'Mo', 'Be', 'De', 'Ne']);
const acc = w => { const last = w.slice(-1), base = w.slice(0, -1), low = w.toLowerCase();
  if (low === 'e') return w === 'E' ? 'È' : 'è';
  if (last === 'e' || last === 'E') { if (/ch[eE]$/.test(w) || low === 'se' || low === 'ne' || /tr[eE]$/.test(w)) return base + (last === 'e' ? 'é' : 'É'); return base + (last === 'e' ? 'è' : 'È'); }
  const m = { a: 'à', i: 'ì', o: 'ò', u: 'ù', A: 'À', I: 'Ì', O: 'Ò', U: 'Ù' }; return m[last] ? base + m[last] : null; };
/* parola che finisce in vocale + apostrofo (anche \' nelle stringhe fra apici) seguita da spazio, punteggiatura, fine o delimitatore */
const RX = /(^|[^A-Za-zÀ-ÿ'\\])([A-Za-zÀ-ÿ]{0,20}[aeiouAEIOU])(\\?')(?=[\s.,;:!?)»"`…—-]|\\n|\\'|'|$)/g;
let tot = 0; const perFile = {}; const esempi = [];
for (const f of fs.readdirSync(SRC).filter(x => x.endsWith(".jsx") && (!process.env.CPM_FILE || x.startsWith(process.env.CPM_FILE))).sort()) { const _t0 = Date.now();
  const code = fs.readFileSync(path.join(SRC, f), 'utf8');
  const ast = Babel.transform(code, { ast: true, code: false, presets: ['react'], sourceType: 'script', parserOpts: { errorRecovery: true, allowReturnOutsideFunction: true } }).ast;
  const spans = [];
  const walk = n => { if (!n || typeof n !== 'object') return; if (Array.isArray(n)) { n.forEach(walk); return; }
    if (n.type === 'StringLiteral' || n.type === 'JSXText' || n.type === 'TemplateElement') spans.push([n.start, n.end, n.type]);
    for (const k in n) if (k !== 'loc' && !/Comments$/.test(k)) walk(n[k]); };
  walk(ast.program); spans.sort((a, b) => b[0] - a[0]);
  let out = code, n = 0;
  for (const [s, e, ty] of spans) {
    const raw = out.slice(s, e); if (!/[aeiouAEIOU]\\?'/.test(raw)) continue;
    const d0 = ty === 'StringLiteral' ? 1 : 0, d1 = ty === 'StringLiteral' ? raw.length - 1 : raw.length;
    const inner = raw.slice(d0, d1);
    if (inner.length > 4000 || !/[a-zà-ù]{2,}\s/i.test(inner) || /sans-serif|system-ui|' in n\b|=>|\bfunction\b|typeof /.test(inner)) continue;/* CSS e codice dentro le stringhe *//* solo testi con parole: niente chiavi, selettori, codice */
    const nuovo = inner.replace(RX, (m0, pre, w, ap, off) => {
      if (TRONCHI.has(w) || w.length > 14) return m0;
      if (!/^[A-ZÀ-Ý]?[a-zà-ÿ]*$/.test(w) || (w.length === 1 && w !== 'e' && w !== 'E')) return m0;/* niente camelCase, sigle o lettere sole (UI, U) */
      if (/[eE]$/.test(w) && !/^(e|che|[a-z]*ch[e]|ne|se|cioe|caffe|ahime|gile|te)$/i.test(w)) return m0;/* in -e solo le forme italiane note: il resto e' inglese (Archive, Promise) */
      const prima = inner.slice(0, off); const aperte = (prima.match(/(^|[\s(«"])'(?=[A-Za-zÀ-ÿ])/g) || []).length; const chiuse = (prima.match(/[A-Za-zÀ-ÿ.!?]'(?=[\s.,;:!?)]|$)/g) || []).length;
      if (aperte > chiuse) return m0;/* chiusura di una citazione fra apici, non un accento */
      const a = acc(w); return a ? pre + a : m0; });
    if (nuovo !== inner) { const rep = raw.slice(0, d0) + nuovo + raw.slice(d1); n++; if (esempi.length < +(process.env.CPM_MAX || 40)) esempi.push(`${f}: ${inner.slice(0, 90)}\n      → ${nuovo.slice(0, 90)}`); out = out.slice(0, s) + rep + out.slice(e); }
  }
  if (process.env.CPM_TEMPI) console.log(f, Date.now() - _t0, "ms", spans.length);
  if (n) { try { Babel.transform(out, { ast: false, code: false, presets: ['react'], sourceType: 'script', parserOpts: { allowReturnOutsideFunction: true } }); } catch (e) { console.log(`!! ${f}: dopo la correzione non si compila piu' (${String(e.message).slice(0, 90)}) — file NON scritto`); continue; }
    perFile[f] = n; tot += n; if (SCRIVI) fs.writeFileSync(path.join(SRC, f), out); }
}
console.log(`testi corretti ${tot} ${SCRIVI ? '(SCRITTI)' : '(a secco)'} · per file ${JSON.stringify(perFile)}`); esempi.forEach(x => console.log('  ' + x));
