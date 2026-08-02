/* [7.302.0] LINT REFUSI — guardiano permanente sui testi mostrati al giocatore.
 *
 * Collaudo PO: «occhio agli errori nelle frasi, manca una lettera» — «Relativement sì» invece di
 * «Relativamente sì». Un refuso di una lettera è invisibile a ogni check esistente (il gate valida
 * stato/3D, i guardiani carriera validano la logica) e in un file da ~31k righe con decine di pool
 * narrativi si nasconde benissimo. Un dizionario italiano completo non è disponibile offline (rete
 * chiusa) e sarebbe comunque inutile sui nomi propri del gioco → due regole AD ALTA PRECISIONE
 * che non producono rumore e che colpiscono esattamente le due classi trovate sul campo:
 *
 *   R1 · OMOGLIFI — una lettera cirillica/greca in mezzo a una parola italiana. Invisibile a
 *        schermo, ma è dato SBAGLIATO (rompe ricerca, correttore, TTS, e su alcuni font si vede).
 *        Trovato in sessione: «rivedо gli schemi» con la о CIRILLICA (U+043E).
 *   R2 · PAROLE CHE FINISCONO IN CONSONANTE — in italiano non esistono, salvo prestiti
 *        («club», «assist», «sponsor»…), apocopi («buon», «miglior», «aver»…) e sigle. Tutte
 *        censite nell'allowlist qui sotto → una parola NUOVA che finisce in consonante è quasi
 *        sempre un refuso o una parola straniera entrata per sbaglio: «Relativement» cade qui.
 *   R3 · spazi doppi, spazio prima della punteggiatura, parola ripetuta («il il»).
 *
 * Esce ≠0 al primo sospetto.  Uso:  node text-typo-lint.mjs   (statico, niente browser)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const RAW = readFileSync(join(ROOT, 'CARRIER-MANAGER-AV.html'), 'utf8');

/* ── i COMMENTI non sono testo mostrato: via (mantenendo i \n per non falsare i numeri di riga) ── */
const keepNl = (s) => s.replace(/[^\n]/g, ' ');
const SRC = RAW
  .replace(/\/\*[\s\S]*?\*\//g, keepNl)
  .replace(/(^|[^:'"`\\])\/\/[^\n]*/g, (m, p1) => p1 + keepNl(m.slice(p1.length)));

/* ── estrazione delle stringhe di PROSA ─────────────────────────────────────────────────────── */
const LIT = /(["'`])((?:\\.|(?!\1)[^\\\r\n])*)\1/g;
const isProse = (s) => {
  if (s.length < 12 || s.length > 600) return false;
  if (/https?:|\.\/|\.(js|mjs|glb|png|jpg|wav|ogg|html|css)\b/i.test(s)) return false;
  if (/[{}<>]|=>|\$\{|px |rgba?\(|#[0-9a-f]{3,8}\b/i.test(s)) return false;
  if (/\|/.test(s)) return false;            // literal accoppiato male attraverso una regex (rx:/a|b/i, tip:"…")
  if (/^\s*\[CPM\]/.test(s)) return false;   // console.log diagnostici, non testo di gioco
  const words = s.match(/[A-Za-zÀ-ÿ']{3,}/g) || [];
  if (words.length < 3) return false;
  return /\b(il|lo|la|le|gli|un|una|di|del|della|che|con|per|non|sono|hai|ha|si|ti|mi|al|alla|nel|nella|da|dal|come|più|ma|se|è|e)\b/i.test(s);
};

const strings = [];
let m;
while ((m = LIT.exec(SRC)) !== null) {
  if (!isProse(m[2])) continue;
  strings.push({ s: m[2], line: SRC.slice(0, m.index).split('\n').length });
}

const fails = [];
const add = (rule, line, what, ctx) => fails.push({ rule, line, what, ctx: ctx.slice(0, 110) });

/* ── R1 · omoglifi ──────────────────────────────────────────────────────────────────────────── */
const HOMO = /[Ͱ-ϿЀ-ӿ]/;
for (const { s, line } of strings) {
  const h = s.match(HOMO);
  if (h) {
    const w = (s.match(new RegExp(`[A-Za-zÀ-ÿ]*${h[0]}[A-Za-zÀ-ÿ]*`)) || [h[0]])[0];
    add('R1 omoglifo', line, `«${w}» contiene «${h[0]}» (U+${h[0].codePointAt(0).toString(16).toUpperCase()})`, s);
  }
}

/* ── R2 · parole che finiscono in consonante ────────────────────────────────────────────────── */
// Prestiti, apocopi, forme tronche e termini di gioco LEGITTIMI. Si allunga solo dopo aver
// verificato che la parola è scritta bene.
const CONS_OK = new Set([
  // apocopi e tronche italiane
  'buon', 'gran', 'nessun', 'qual', 'tal', 'pur', 'ancor', 'amor', 'cuor', 'signor', 'miglior', 'peggior',
  'aver', 'poter', 'dover', 'voler', 'saper', 'far', 'dar', 'star', 'andar', 'venir', 'dimostrar', 'vuol',
  'quel', 'quell', 'dell', 'nell', 'sull', 'dall', 'all', 'col', 'san', 'don', 'non', 'per', 'con', 'in', 'un', 'il', 'del', 'nel',
  'sett', 'mezz', 'sud', 'nord', 'ovest', 'est', 'gol', 'ad', 'ed', 'od', 'sen',
  // prestiti/termini di gioco correnti
  'mister', 'club', 'cross', 'assist', 'derby', 'social', 'post', 'staff', 'match', 'window', 'stop',
  'sponsor', 'leader', 'pressing', 'build', 'brand', 'sport', 'scout', 'dribbling', 'tunnel', 'corner',
  'feedback', 'scoop', 'bomber', 'record', 'leadership', 'overlay', 'mesh', 'star', 'bonus', 'spot',
  'over', 'dashboard', 'endorsement', 'influencer', 'follower', 'week', 'pass', 'driver', 'banner',
  'highlight', 'executor', 'step', 'root', 'deflect', 'goal', 'zoom', 'transfer', 'ball', 'read',
  'avatar', 'views', 'list', 'session', 'black', 'down', 'stress', 'flash', 'relax', 'gadget', 'team',
  'podcast', 'community', 'camp', 'padel', 'tech', 'chef', 'podcaster', 'sponsorship', 'hotel', 'mental',
  'coach', 'esports', 'sold', 'focus', 'laser', 'reps', 'intent', 'tuning', 'flag', 'factory', 'pocus',
  'sprint', 'monitor', 'pool', 'senior', 'fallback', 'inbound', 'hobby', 'timing', 'feeling', 'gossip',
  'reality', 'slot', 'reload', 'flop', 'audit', 'check', 'readiness', 'kickoff', 'puppets', 'reveal',
  'pull', 'miss', 'trigger', 'reward', 'kick', 'block', 'approach', 'blend', 'snap', 'outfield', 'dugout',
  'punch', 'dolly', 'press', 'caos', 'night', 'roster', 'away', 'sidecar', 'array', 'injection', 'follow',
  'chain', 'shot', 'retry', 'timeout', 'smoking', 'browser', 'input', 'backlog', 'training', 'referendum',
  'slogan', 'ghostwriter', 'standard', 'writer', 'scorer', 'task', 'extremis', 'primis', 'goals', 'assists',
  'recover', 'return', 'hist', 'situations', 'stand', 'top', 'set', 'fair', 'play', 'tour', 'staff',
  'under', 'global',
  // colore locale nelle voci di piazza (spagnolo/francese/tedesco): volutamente in lingua
  'nach', 'peñas', 'sudar', 'ganar', 'tascas', 'avant', 'tout',
  'cachet', 'turnover', 'round', 'clipboard', 'json', 'debug',
  'vous', 'second', 'temps', 'allez', 'reisen', 'aquí',
]);
const seenCons = new Set();
const WORD = /[A-Za-zÀ-ÿ']+/g;
for (const { s, line } of strings) {
  WORD.lastIndex = 0;
  let mw;
  while ((mw = WORD.exec(s)) !== null) {
    const w = mw[0];
    if (w.length < 4) continue;
    /* Una MAIUSCOLA a inizio frase non è un nome proprio: va controllata (è il caso del PO —
       «Relativement sì…» apre la risposta). Maiuscola in mezzo alla frase = nome proprio → skip. */
    if (/^[A-ZÀ-Ý]/.test(w)) {
      const before = s.slice(0, mw.index);
      const sentenceStart = before.trim() === '' || /[.!?:;«"'—-]\s*$/.test(before);
      if (!sentenceStart) continue;
    }
    if (/[aeiouàèéìòóùAEIOU]$/i.test(w)) continue;           // finisce in vocale: italiano ok
    const k = w.toLocaleLowerCase('it-IT');
    if (k.includes("'")) continue;                            // elisioni (dell'ex, l'mvp…)
    if (CONS_OK.has(k) || seenCons.has(k)) continue;
    seenCons.add(k);
    add('R2 consonante finale', line, `«${w}»`, s);
  }
}

/* ── R3 · spaziature e parole ripetute ──────────────────────────────────────────────────────── */
for (const { s, line } of strings) {
  if (/[A-Za-zÀ-ÿ]  +[A-Za-zÀ-ÿ]/.test(s)) add('R3 doppio spazio', line, '«  »', s);
  if (/[A-Za-zÀ-ÿ] [,.;!?](?!\.)/.test(s)) add('R3 spazio prima di punteggiatura', line, '« ,»', s);
  const rep = s.match(/\b([a-zà-ÿ]{3,})\s+\1\b/i);
  if (rep) add('R3 parola ripetuta', line, `«${rep[1]} ${rep[1]}»`, s);
}

console.log(`stringhe di prosa analizzate: ${strings.length}`);
if (!fails.length) { console.log('✅ nessun refuso'); process.exit(0); }
fails.sort((a, b) => a.line - b.line);
console.log(`\n❌ ${fails.length} sospetti:\n`);
for (const f of fails) console.log(`  [${f.rule}] r.${f.line}  ${f.what}\n      ${f.ctx}`);
process.exit(1);
