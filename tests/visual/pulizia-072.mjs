#!/usr/bin/env node
/* [giro 63 PO-072] GUARDIANO DELLA PULIZIA: «pulizia = stesso risultato».
   Confronta il codice del gioco di OGGI con quello di una base (default: il commit di pulizia del giro 63 contro il suo genitore; CPM_BASE/CPM_OGGI per altre coppie)
   DOPO averli traspilati con Babel senza commenti (`comments:false, compact:true`): togliere commenti-changelog,
   spazi o righe vuote non cambia nulla; cambiare una sola istruzione si'.
   Le sole differenze ammesse sono le dichiarazioni di primo livello elencate in RIMOSSE (codice morto tolto di
   proposito): si tolgono dalla BASE prima del confronto, e per ciascuna si verifica che nel codice di oggi non
   resti nessun riferimento vivo (ammesso solo dentro `typeof X` o in un `if(typeof X…)` — una guardia che con X assente vale gia' «no-op»).
   ROSSO (CPM_ROSSO072=1): si altera in memoria una sola istruzione del codice di oggi — il guardiano deve uscire 1.
   Uso: node pulizia-072.mjs [CPM_BASE=<ref>] [CPM_OGGI=<ref>|file]                                                                                      */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const Babel = require('@babel/standalone');

/* [giro 72] il default puntava a `origin/lavoro/172`, ramo mai esistito sul remoto: il guardiano non girava senza CPM_BASE.
   Ora le due parti sono COMMIT FISSATI: la base e' il genitore del commit di pulizia del giro 63 (pre-173) e «oggi» e' quel commit.
   Cosi' il guardiano giudica la pulizia e non le funzioni nuove della 173 (giri 60/61/64/68, che cambiano il codice di proposito).
   Per una pulizia futura: CPM_BASE=<commit prima> CPM_OGGI=<commit dopo>, oppure CPM_OGGI=file per il file di lavoro. */
const PULIZIA_63 = '19128217';
const BASE = process.env.CPM_BASE || PULIZIA_63 + '^1';
const OGGI = process.env.CPM_OGGI || PULIZIA_63;
/* la riga GAME_VERSION cambia a ogni rilascio e non e' codice: si normalizza su entrambi i lati prima del confronto */
const senzaVersione = code => code.replace(/const GAME_VERSION="[0-9.]+"/g, 'const GAME_VERSION="X"');
const ROSSO = process.env.CPM_ROSSO072 === '1';
/* giro 63 PO-171: ritratto 3D CH38 dei menu, senza chiamanti dal 7.973 */
const RIMOSSE = ['_heroPhotoCache', '_heroPhotoAssets', '_heroPhotoRenderer', '_disposeHeroPhotoRenderer', '_AV_KIT_COLS',
  '_ensureHeroPhotoAssets', 'renderHeroPhoto', 'AvatarPhoto'];

const ROOT = new URL('../../', import.meta.url);
const leggi = ref => execFileSync('git', ['show', `${ref}:CARRIER-MANAGER-AV.html`], { cwd: ROOT, maxBuffer: 64 << 20, encoding: 'utf8' });
let oggi;
try { oggi = OGGI === 'file' ? readFileSync(new URL('CARRIER-MANAGER-AV.html', ROOT), 'utf8') : leggi(OGGI); }
catch (e) { console.log(`❌ oggi ${OGGI} non leggibile: ${String(e.message).slice(0, 120)}`); process.exit(1); }
let base;
try { base = leggi(BASE); }
catch (e) { console.log(`❌ base ${BASE} non leggibile: ${String(e.message).slice(0, 120)}`); process.exit(1); }

const babelScripts = html => { const out = []; const re = /<script[^>]*type="text\/babel"[^>]*>([\s\S]*?)<\/script>/g; let m; while ((m = re.exec(html))) out.push(m[1]); return out.join('\n;\n'); };
/* il resto della pagina (HTML, CSS, script non-Babel) deve restare identico tolti i commenti HTML/JS: si confronta a parte */
const fuoriBabel = html => html.replace(/<script[^>]*type="text\/babel"[^>]*>[\s\S]*?<\/script>/g, '<BABEL/>');

const nomiDi = node => {
  if (node.type === 'FunctionDeclaration' || node.type === 'ClassDeclaration') return node.id ? [node.id.name] : [];
  if (node.type === 'VariableDeclaration') return node.declarations.map(d => d.id && d.id.name).filter(Boolean);
  return [];
};
const togliRimosse = () => ({ visitor: { Program(p) {
  for (const st of p.get('body')) { const n = nomiDi(st.node); if (n.length && n.every(x => RIMOSSE.includes(x))) st.remove();
    else if (n.length && n.some(x => RIMOSSE.includes(x))) throw new Error('dichiarazione mista con nomi rimossi: ' + n.join(',')); }
} } });
const vivi = [];
const contaVivi = () => ({ visitor: { Identifier(p) {
  if (!RIMOSSE.includes(p.node.name)) return;
  if (p.parentPath.isUnaryExpression({ operator: 'typeof' })) return;
  if (p.parentPath.isMemberExpression({ property: p.node }) && !p.parentPath.node.computed) return;
  if (p.parentPath.isObjectProperty({ key: p.node })) return;
  /* chiamata protetta da una guardia `typeof X` nella stessa istruzione (es. `if(typeof X==='function')X()`): con X assente non parte */
  const st = p.getStatementParent(); if (st && st.isIfStatement() && /typeof\s+/.test(st.get('test').toString()) && st.get('test').toString().includes(p.node.name)) return;
  const ifp = p.findParent(q => q.isIfStatement()); if (ifp && ifp.get('test').toString().includes('typeof ' + p.node.name)) return;
  vivi.push(p.node.name + '@' + (p.node.loc ? p.node.loc.start.line : '?'));
} } });
const tr = (code, plugins) => Babel.transform(code, { presets: ['react'], plugins, comments: false, compact: true, sourceType: 'script' }).code;

let codOggi = senzaVersione(babelScripts(oggi));
if (ROSSO) { const k = codOggi.indexOf('const SAVE_VERSION=9'); codOggi = codOggi.slice(0, k) + 'const SAVE_VERSION=8' + codOggi.slice(k + 'const SAVE_VERSION=9'.length); }
const t0 = Date.now();
const A = tr(senzaVersione(babelScripts(base)), [togliRimosse]);
const B = tr(codOggi, [contaVivi]);
console.log(`base ${BASE}: ${(base.length / 1024).toFixed(0)} KB di pagina → ${(A.length / 1024).toFixed(0)} KB di codice senza commenti (tolte ${RIMOSSE.length} dichiarazioni morte)`);
console.log(`oggi ${OGGI}: ${(oggi.length / 1024).toFixed(0)} KB di pagina → ${(B.length / 1024).toFixed(0)} KB di codice senza commenti · ${((Date.now() - t0) / 1000).toFixed(1)} s`);
const issues = [];
if (A !== B) { let i = 0; while (i < A.length && A[i] === B[i]) i++; issues.push(`codice traspilato DIVERSO dalla base al carattere ${i}: base «${A.slice(Math.max(0, i - 60), i + 60)}» · oggi «${B.slice(Math.max(0, i - 60), i + 60)}»`); }
if (vivi.length) issues.push(`riferimenti vivi a dichiarazioni rimosse: ${vivi.slice(0, 8).join(', ')}`);
const fa = fuoriBabel(base), fb = fuoriBabel(oggi);
if (fa !== fb) issues.push('la pagina fuori dal blocco Babel (HTML/CSS/script) e\' cambiata');
console.log(`codice identico → ${A === B ? '✓' : '✗'} · riferimenti vivi ai rimossi → ${vivi.length} · pagina fuori da Babel identica → ${fa === fb ? '✓' : '✗'}`);
if (issues.length) { console.log(`\n❌ PULIZIA${ROSSO ? ' (braccio rosso)' : ''} — ${issues.length} problemi:`); issues.forEach(x => console.log('  · ' + x.slice(0, 400))); process.exit(1); }
console.log('\n✅ PULIZIA — stesso codice della base, tolti solo commenti e codice morto dichiarato');
