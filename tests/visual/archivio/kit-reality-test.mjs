#!/usr/bin/env node
/* [7.280.0 collaudo PO «la maglia dell'Ajax deve essere con la striscia verticale rossa larga come nella
   realtà! verifica anche le altre squadre!»] GUARDIANO dei KIT.
   Tre reti, tutte statiche (nessun browser):
   (1) COERENZA DEI RENDERER — ogni nome di pattern usato in KIT_PATTERN deve essere disegnato da TUTTI e tre i
       renderer che lo consumano (icona maglia, stemma, texture 3D) oppure essere dichiarato solo-2D. È la rete
       che avrebbe intercettato il ramo morto dello stemma, che confrontava «half» mentre il motore ritorna
       «halves»: sei club a metà campo avevano lo scudo liscio senza che nessuno se ne accorgesse.
   (2) KIT ICONICI — una tabella di club il cui disegno reale è inconfondibile deve risolvere al pattern giusto.
   (3) COERENZA DEI DATI — nessun club può stare insieme in KIT_PATTERN e nella lista dei tinta unita, e un club
       patternizzato deve avere due colori sociali distinguibili, altrimenti il disegno non si vede.
   Uso: node kit-reality-test.mjs */
import fs from 'node:fs';
import { ROOT } from './lib/harness.mjs';

const src = fs.readFileSync(ROOT + '/CARRIER-MANAGER-AV.html', 'utf8');
const issues = [];

// ── estrazione dei dati
const grab = (start, endTok) => { const i = src.indexOf(start); const j = src.indexOf(endTok, i); return src.slice(i, j + endTok.length); };
const kpSrc = grab('const KIT_PATTERN={', '\n};');
const solidSrc = grab('const _KIT_SOLID_IDS={', '};');
const KIT_PATTERN = {}; for (const m of kpSrc.matchAll(/(\w+)\s*:\s*"(\w+)"/g)) KIT_PATTERN[m[1]] = m[2];
const SOLID = new Set([...solidSrc.matchAll(/(\w+)\s*:\s*1/g)].map(m => m[1]));

// club: mkT("id","nome","ABBR",prestigio,"#col","#col2",…)
const CLUBS = {};
for (const m of src.matchAll(/mkT\("([\w-]+)","([^"]+)","(\w+)",(\d+),"(#[0-9a-fA-F]{3,6})","(#[0-9a-fA-F]{3,6})"/g))
  CLUBS[m[1]] = { id: m[1], n: m[2], c: m[5], c2: m[6] };

console.log(`dati: ${Object.keys(CLUBS).length} club · ${Object.keys(KIT_PATTERN).length} kit curati · ${SOLID.size} tinta unita dichiarate`);

// ── (1) ogni pattern è disegnato da tutti i renderer che lo consumano
const usedIn = (chunk, quote) => new Set([...chunk.matchAll(new RegExp(`pat===${quote}(\\w+)${quote}`, 'g'))].map(m => m[1]));
const iconSrc = grab('function JerseyIcon(', '\n}');
const badgeSrc = grab('const patFill=(()=>{const el=[];', 'return el;})();');
const texSrc = grab('const kitPatternTex=', '_kitTexCache[key]=t;');
const R = {
  'icona maglia': new Set([...usedIn(iconSrc, '"'), ...usedIn(iconSrc, "'")]),
  'stemma': new Set([...usedIn(badgeSrc, '"'), ...usedIn(badgeSrc, "'")]),
  '3D': new Set([...usedIn(texSrc, "'"), ...usedIn(texSrc, '"')]),
};
console.log('(1) pattern per renderer:', Object.entries(R).map(([k, v]) => `${k} {${[...v].sort().join(',')}}`).join(' · '));
/* halves/sash/sleeves in 3D sono una LIMITAZIONE UV nota e documentata (le UV di Ch38_Shirt sono coerenti solo
   sull'asse verticale): restano tinta unita in campo e disegnati in 2D. Non sono un difetto, quindi non falliscono. */
const SOLO_2D = new Set(['halves', 'sash', 'sleeves']);
for (const pat of new Set(Object.values(KIT_PATTERN))) {
  for (const [nome, set] of Object.entries(R)) {
    if (nome === '3D' && SOLO_2D.has(pat)) continue;
    if (!set.has(pat)) issues.push(`(1) il pattern «${pat}» è usato da ${Object.entries(KIT_PATTERN).filter(([, v]) => v === pat).length} club ma il renderer «${nome}» non lo disegna`);
  }
}

// ── (2) i kit inconfondibili
const ICONICI = {
  ajax: 'vband',   // bianco con fascia verticale rossa larga
  sam: 'band',     // fascia orizzontale sul petto
  juve: 'stripes', inter: 'stripes', milan: 'stripes', bar: 'stripes', new: 'stripes', ath: 'stripes',
  mall: 'stripes', pis: 'stripes',
  qpr: 'hoops', spo: 'hoops',
  feye: 'halves', bla: 'halves', gal: 'halves', ver: 'halves', vita: 'halves',
  ray: 'sash',
  avl: 'sleeves', whu: 'sleeves', ars: 'sleeves',
  rma: null, liv: null, napoli: null, bay: null,   // tinta unita nella realtà
};
let ok = 0;
for (const [id, atteso] of Object.entries(ICONICI)) {
  if (!CLUBS[id]) { issues.push(`(2) club «${id}» non trovato nel database`); continue; }
  const reso = KIT_PATTERN[id] || (SOLID.has(id) ? null : '(derivato)');
  if (reso !== atteso) issues.push(`(2) ${CLUBS[id].n} (${id}): atteso ${atteso || 'tinta unita'}, risolve ${reso || 'tinta unita'}`);
  else ok++;
}
console.log(`(2) kit iconici corretti: ${ok}/${Object.keys(ICONICI).length}`);

// ── (3) coerenza dei dati
const dbl = Object.keys(KIT_PATTERN).filter(id => SOLID.has(id));
if (dbl.length) issues.push(`(3) club dichiarati insieme patternizzati e tinta unita: ${dbl.join(', ')}`);
const hex = (x) => { const m = /^#?([0-9a-f]{6})$/i.exec(x); return m ? [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4), 16)] : null; };
const dist = (a, b) => { const A = hex(a), B = hex(b); return (!A || !B) ? 999 : Math.abs(A[0] - B[0]) + Math.abs(A[1] - B[1]) + Math.abs(A[2] - B[2]); };
const invisibili = Object.keys(KIT_PATTERN).filter(id => CLUBS[id] && dist(CLUBS[id].c, CLUBS[id].c2) < 70);
if (invisibili.length) issues.push(`(3) kit patternizzati con due colori troppo simili (il disegno non si vedrebbe): ${invisibili.join(', ')}`);
console.log(`(3) contraddizioni dati: ${dbl.length} · pattern invisibili: ${invisibili.length}`);

if (issues.length) { console.log('\n❌ FAIL\n' + issues.map(x => ' · ' + x).join('\n')); process.exit(1); }
console.log('\n✅ PASS — i kit rispettano il disegno reale e ogni pattern è disegnato da chi lo consuma');
