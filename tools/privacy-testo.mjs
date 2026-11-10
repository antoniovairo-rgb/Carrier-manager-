#!/usr/bin/env node
/* ============================================================================
   privacy-testo.mjs — [giro 134 PO-334] FONTE UNICA DELL'INFORMATIVA SULLA PRIVACY

   La pagina pubblica privacy.html (radice del repo, servita da GitHub Pages: e'
   l'indirizzo che Google Play chiede) e' la SOLA fonte del testo. Il pannello
   «Informativa sulla privacy» dentro il gioco (Opzioni) non ha un testo scritto a
   mano: legge la costante PRIVACY134 di src/07-versione-save-interviste.jsx, che
   questo strumento GENERA da privacy.html, fra le righe-marcatore
   PRIVACY134-INIZIO / PRIVACY134-FINE.

   La mail di contatto non entra nel sorgente del gioco: il link mailto di
   privacy.html diventa il segnaposto ["m"] e il gioco lo ricompone a runtime con
   _feedbackTo() (codici di carattere, src/07). Lo strumento PRETENDE che la mail
   della pagina coincida con quella di _feedbackTo(): se la pagina cambiasse
   contatto, la generazione si ferma invece di mostrare nel gioco un indirizzo
   diverso da quello pubblicato.

   Uso:
     node tools/privacy-testo.mjs           riscrive il blocco in src/07
     node tools/privacy-testo.mjs --check   non scrive; esce 1 se il blocco non
                                            corrisponde a privacy.html
   tools/check-src.mjs lancia il --check: un testo divergente blocca la verifica
   dei sorgenti come un byte sbagliato.
   ============================================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGINA = path.join(ROOT, 'privacy.html');
const SRC07 = path.join(ROOT, 'src', '07-versione-save-interviste.jsx');
const INIZIO = '/*PRIVACY134-INIZIO: generato da tools/privacy-testo.mjs da privacy.html — NON modificare a mano*/';
const FINE = '/*PRIVACY134-FINE*/';

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decodifica = s => s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16))).replace(/&([a-z]+);/gi, (m, n) => (n in ENT ? ENT[n] : m));
const spazi = s => s.replace(/\s+/g, ' ');

/** La mail che il gioco usa (codici di carattere di _feedbackTo in src/07). */
export function mailDelGioco(src07 = fs.readFileSync(SRC07, 'utf8')) {
  const m = /const _feedbackTo=\(\)=>String\.fromCharCode\(([\d,\s]+)\)/.exec(src07);
  if (!m) throw new Error('_feedbackTo non trovato in src/07');
  return String.fromCharCode(...m[1].split(',').map(Number));
}

/** Contenuto in linea → segmenti: "testo" | ["b",testo] | ["c",testo] | ["m"]. */
function inLinea(html, mail) {
  const out = []; const rx = /<(strong|code|a)\b([^>]*)>([\s\S]*?)<\/\1>/g; let k = 0, m;
  const piano = t => { const x = spazi(decodifica(t)); if (/[<>]/.test(x)) throw new Error('tag non previsto nel testo: ' + x.slice(0, 80)); if (x) out.push(x); };
  while ((m = rx.exec(html))) {
    piano(html.slice(k, m.index)); k = rx.lastIndex;
    const [, tag, attr, dentro] = m;
    if (tag === 'a') {
      const href = decodifica((/href="([^"]*)"/.exec(attr) || [])[1] || '');
      if (href !== 'mailto:' + mail || spazi(decodifica(dentro)).trim() !== mail) throw new Error('privacy.html: il contatto non coincide con la mail del gioco (_feedbackTo). Generazione fermata.');
      out.push(['m']);
    } else out.push([tag === 'strong' ? 'b' : 'c', spazi(decodifica(dentro))]);
  }
  piano(html.slice(k));
  if (out.length && typeof out[0] === 'string') out[0] = out[0].replace(/^ /, '');
  if (out.length && typeof out[out.length - 1] === 'string') out[out.length - 1] = out[out.length - 1].replace(/ $/, '');
  return out;
}

/** privacy.html → blocchi [tipo, contenuto]. */
export function blocchiDaPagina(html = fs.readFileSync(PAGINA, 'utf8'), mail = mailDelGioco()) {
  const a = html.indexOf('<div class="card">'), b = html.indexOf('</main>');
  if (a < 0 || b < 0) throw new Error('privacy.html: struttura attesa (div.card dentro main) non trovata');
  const card = html.slice(a + '<div class="card">'.length, html.lastIndexOf('</div>', b));
  const blocchi = []; const rx = /<(h1|h2|p|ul|div)\b([^>]*)>([\s\S]*?)<\/\1>/g; let m;
  while ((m = rx.exec(card))) {
    const [, tag, attr, dentro] = m;
    if (tag === 'h1') blocchi.push(['h1', spazi(decodifica(dentro)).trim()]);
    else if (tag === 'h2') blocchi.push(['h2', spazi(decodifica(dentro)).trim()]);
    else if (tag === 'p') blocchi.push(['p', inLinea(dentro, mail)]);
    else if (tag === 'ul') blocchi.push(['ul', [...dentro.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(x => inLinea(x[1], mail))]);
    else if (/class="date"/.test(attr)) blocchi.push(['data', spazi(decodifica(dentro)).trim()]);
    else if (/class="tldr"/.test(attr)) blocchi.push(['tldr', inLinea(dentro, mail)]);
    else throw new Error('privacy.html: blocco non previsto ' + tag + attr);
  }
  const piede = /<footer>([\s\S]*?)<\/footer>/.exec(html);
  if (piede) blocchi.push(['piede', spazi(decodifica(piede[1])).trim()]);
  const json = JSON.stringify(blocchi);
  if (json.includes('@')) throw new Error('un indirizzo e-mail in chiaro resterebbe nel sorgente del gioco');
  return blocchi;
}

/** Testo piano (spazi compattati) dei blocchi, con la mail rimessa: e' cio' che il guardiano confronta con il pannello. */
export function testoPiano(blocchi, mail) {
  const seg = s => (Array.isArray(s) ? (s[0] === 'm' ? mail : s[1]) : s);
  const riga = v => (Array.isArray(v) ? v.map(seg).join('') : v);
  return spazi(blocchi.map(([t, v]) => (t === 'ul' ? v.map(riga).join(' ') : riga(v))).join(' ')).trim();
}

export function bloccoAtteso() { return INIZIO + 'const PRIVACY134=' + JSON.stringify(blocchiDaPagina()) + ';' + FINE; }

function main() {
  const src = fs.readFileSync(SRC07, 'utf8');
  const i = src.indexOf(INIZIO), j = src.indexOf(FINE);
  if (i < 0 || j < 0 || j < i) { console.error('✗ privacy-testo: marcatori PRIVACY134 assenti in src/07'); process.exit(1); }
  const ora = src.slice(i, j + FINE.length), atteso = bloccoAtteso();
  if (process.argv.includes('--check')) {
    if (ora === atteso) { console.log('privacy-testo --check: il testo del gioco corrisponde a privacy.html.'); process.exit(0); }
    console.error('✗ privacy-testo --check: il testo della privacy nel gioco NON corrisponde a privacy.html → node tools/privacy-testo.mjs && node tools/build-src.mjs'); process.exit(1);
  }
  if (ora === atteso) { console.log('privacy-testo: gia\' allineato.'); return; }
  fs.writeFileSync(SRC07, src.slice(0, i) + atteso + src.slice(j + FINE.length));
  console.log('privacy-testo: blocco PRIVACY134 rigenerato da privacy.html (ora: node tools/build-src.mjs).');
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
