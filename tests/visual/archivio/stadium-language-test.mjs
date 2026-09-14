#!/usr/bin/env node
/* [7.281.0 collaudo PO «cori dei tifosi nella lingua sbagliata, in questo caso devono essere in inglese e non
   spagnolo. i cartelloni pubblicitari devono essere nella lingua della squadra ospitante»]
   GUARDIANO della LINGUA dello stadio. Quattro reti statiche:
   (1) ROUTING — per ogni campionato, OGNI categoria di coro deve trovare un pool nella lingua giusta: né buchi
       che ricadono sul pool italiano di base, né categorie scoperte.
   (2) FUGHE DI LINGUA — nessuna riga di un pool può contenere parole che in quella lingua non esistono. I marcatori
       sono volutamente CONSERVATIVI: solo termini che non appartengono alla lingua bersaglio, perché parole come
       «keeper» (olandese), «vamos lá» (portoghese), «árbitro» (spagnolo e portoghese) o «champions» (francese)
       sono legittime e un lint ingenuo le bollerebbe da falsi positivi.
   (3) CARTELLONI — ogni brand deve avere la tagline in TUTTE le lingue del gioco, altrimenti in quello stadio si
       leggerebbe l'italiano.
   (4) COLORE DEL CAMPIONATO — ogni lega deve avere la sua tinta, o il tappeto di centrocampo esce verde per tutti.
   Uso: node stadium-language-test.mjs */
import fs from 'node:fs';
import { ROOT } from './lib/harness.mjs';

const src = fs.readFileSync(ROOT + '/CARRIER-MANAGER-AV.html', 'utf8');
const issues = [];
const block = (tok) => { let i = src.indexOf(tok); i = src.indexOf('{', i); let d = 0; for (let k = i; k < src.length; k++) { if (src[k] === '{') d++; else if (src[k] === '}') { d--; if (!d) return src.slice(i, k + 1); } } return ''; };
const split1 = (b, re) => { const out = {}; let d = 0, cur = null, st = 0; for (let k = 1; k < b.length; k++) { const c = b[k]; if (c === '{') { if (!d) { const m = b.slice(0, k).match(re); cur = m ? m[1] : null; st = k; } d++; } else if (c === '}') { d--; if (!d && cur) out[cur] = b.slice(st, k + 1); } } return out; };
const cats = (seg) => new Set([...seg.matchAll(/(\w+)\s*:\s*\[/g)].map(m => m[1]));

const BASE = cats(block('const CROWD_CHANTS='));
const LANG = split1(block('const LANG_CHANTS='), /(\w+)\s*:\s*$/);
const LG = split1(block('const CROWD_CHANTS_LG='), /"([^"]+)"\s*:\s*$/);
const LG_LANG = Object.fromEntries([...block('const LG_LANG=').matchAll(/"([^"]+)"\s*:\s*"(\w+)"/g)].map(m => [m[1], m[2]]));

// ── (1) routing: nessuna ricaduta sull'italiano
let buchi = 0;
for (const [lg, lang] of Object.entries(LG_LANG)) {
  const have = new Set([...cats(LG[lg] || ''), ...cats(LANG[lang] || '')]);
  const miss = [...BASE].filter(c => !have.has(c));
  if (miss.length) { buchi += miss.length; issues.push(`(1) ${lg} (${lang}): ${miss.length} categorie ricadono sul pool italiano → ${miss.join(', ')}`); }
}
console.log(`(1) routing — campionati ${Object.keys(LG_LANG).length} · categorie ${BASE.size} · buchi ${buchi}`);

// ── (2) fughe: marcatori NON ambigui (assenti dalla lingua bersaglio)
const FOREIGN = {
  en: [/\bCAMPEONES\b/i, /OLÉ/i, /\bFORZA\b/i, /\bVAMOS\b/i, /\bARBITRO\b/i, /\bTOOO?R\b/i, /\bALLEZ\b/i, /\bHAYDİ\b/i],
  it: [/\bCOME ON\b/i, /\bKEEPER\b/i, /\bCAMPEONES\b/i, /\bALLEZ\b/i, /\bSCHIRI\b/i],
  de: [/\bCOME ON\b/i, /\bCHAMPIONS\b/i, /\bFORZA\b/i, /\bVAMOS\b/i, /\bALLEZ\b/i, /\bOLÉ\b/i],
  fr: [/\bCOME ON\b/i, /\bFORZA\b/i, /\bVAMOS\b/i, /\bSCHIRI\b/i, /\bKEEPER\b/i],
  es: [/\bCOME ON\b/i, /\bFORZA\b/i, /\bALLEZ\b/i, /\bSCHIRI\b/i, /\bKEEPER\b/i],
  pt: [/\bCOME ON\b/i, /\bFORZA\b/i, /\bALLEZ\b/i, /\bSCHIRI\b/i, /\bKEEPER\b/i],
  nl: [/\bFORZA\b/i, /\bVAMOS\b/i, /\bALLEZ\b/i, /\bSCHIRI\b/i, /\bCAMPEONES\b/i],
  tr: [/\bCOME ON\b/i, /\bFORZA\b/i, /\bVAMOS\b/i, /\bALLEZ\b/i, /\bSCHIRI\b/i],
};
let fughe = 0;
const scan = (nome, seg, lang) => {
  for (const m of seg.matchAll(/"([^"]{2,90})"/g)) {
    for (const re of (FOREIGN[lang] || [])) if (re.test(m[1])) { fughe++; issues.push(`(2) ${nome} [${lang}]: «${m[1]}» non è ${lang}`); break; }
  }
};
for (const [lg, seg] of Object.entries(LG)) scan('pool ' + lg, seg, LG_LANG[lg] || 'it');
for (const [l, seg] of Object.entries(LANG)) scan('pool lingua ' + l, seg, l);
scan('pool base', block('const CROWD_CHANTS='), 'it');
console.log(`(2) fughe di lingua nei cori: ${fughe}`);

// ── (3) cartelloni: tagline in tutte le lingue
const adSrc = src.slice(src.indexOf('const AD_BRANDS='), src.indexOf('const _ultrasLang=') > src.indexOf('const AD_BRANDS=') ? src.indexOf('const _ultrasLang=') : src.indexOf('const AD_BRANDS=') + 12000);
const brands = [...adSrc.matchAll(/\["([^"]+)",\{([^}]*)\}/g)];
const LANGS = [...new Set(Object.values(LG_LANG))].concat('it');
let mancanti = 0;
for (const b of brands) {
  const have = new Set([...b[2].matchAll(/(\w+)\s*:/g)].map(m => m[1]));
  const miss = LANGS.filter(l => !have.has(l));
  if (miss.length) { mancanti++; issues.push(`(3) brand ${b[1]}: tagline mancante in ${miss.join(', ')}`); }
  /* [7.282.0] non basta che la voce ESISTA: se è identica all'italiano, in quello stadio si legge italiano lo stesso
     — è esattamente il caso segnalato («PIZZA IN 5'» uguale in it e in en). */
  const tg = Object.fromEntries([...b[2].matchAll(/(\w+)\s*:\s*"([^"]*)"/g)].map(m => [m[1], m[2]]));
  const uguali = LANGS.filter(l => l !== 'it' && tg[l] && tg[l] === tg.it);
  if (uguali.length) { mancanti++; issues.push(`(3) brand ${b[1]}: tagline «${tg.it}» identica all'italiano in ${uguali.join(', ')}`); }
}
if (!brands.length) issues.push('(3) nessun brand con tagline multilingua trovato: i cartelloni sarebbero ancora monolingua');
console.log(`(3) cartelloni — brand ${brands.length} · lingue richieste ${LANGS.length} · brand incompleti ${mancanti}`);

// ── (4) colore per campionato
const colMap = Object.fromEntries([...block('const LEAGUE_COMP_COL=').matchAll(/"([^"]+)"\s*:\s*"(#[0-9a-f]{6})"/gi)].map(m => [m[1], m[2]]));
/* la rete deve coprire OGNI lega del database, non solo quelle di lingua straniera: le italiane non stanno in
   LG_LANG e resterebbero fuori dal controllo (verificato in negativo: togliendo «Lega A» il test taceva). */
const LEGHE = [...new Set([...src.matchAll(/mkT\("[\w-]+","[^"]+","\w+",\d+,"#[0-9a-fA-F]{3,6}","#[0-9a-fA-F]{3,6}","[^"]*","([^"]+)"/g)].map(m => m[1]))].filter(l => l !== 'Nazionale');
const senzaCol = LEGHE.filter(lg => !colMap[lg]);
if (senzaCol.length) issues.push(`(4) campionati senza tinta propria (tappeto verde generico): ${senzaCol.join(', ')}`);
/* due leghe con la stessa tinta sono indistinguibili a schermo quanto il verde unico di prima */
const dupCol = Object.entries(colMap).reduce((acc, [lg, c]) => { (acc[c] = acc[c] || []).push(lg); return acc; }, {});
const collisioni = Object.entries(dupCol).filter(([, v]) => v.length > 1);
if (collisioni.length) issues.push(`(4) tinte condivise: ${collisioni.map(([c, v]) => v.join('=') + ' ' + c).join(' · ')}`);
console.log(`(4) colore campionato — leghe nel database ${LEGHE.length} · mappate ${Object.keys(colMap).length} · scoperte ${senzaCol.length} · tinte distinte ${new Set(Object.values(colMap)).size}`);

if (issues.length) { console.log('\n❌ FAIL\n' + issues.map(x => ' · ' + x).join('\n')); process.exit(1); }
console.log('\n✅ PASS — cori, cartelloni e colori dello stadio parlano la lingua di chi ospita');
