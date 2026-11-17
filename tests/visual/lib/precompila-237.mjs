/* [giro 237 — PO-504 B, insieme a PO-502] IL BANCO GIOCA LA PAGINA GIA' TRADOTTA, COME IL SITO.
   Il sito pubblicato (deploy-pages → tools/build-dist.mjs --web) serve dal 7.999.11 il gioco col JSX gia'
   tradotto; il banco invece serviva CARRIER-MANAGER-AV.html e faceva tradurre a Babel nel browser ~4 MB di
   JSX a OGNI pagina aperta (giro 219: ~1 GB di scarti, pausa di raccolta ~3 s). Qui la traduzione si fa UNA
   volta per build, in node, con lo stesso Babel e lo stesso preset della build del sito (presets ['react']),
   e il risultato si mette in cache su disco per impronta del sorgente: tutte le pagine di tutti i
   guardiani della stessa build la riusano.
   Cambia SOLO cio' che il server del banco consegna al posto di CARRIER-MANAGER-AV.html: il resto della
   pagina (CDN instradate sui node_modules, ?cpmtest=1, varchi __CPM_*) e' identico al sorgente.
   Ritirata dichiarata: CPM_BABEL_BROWSER=1 → il banco torna a servire il sorgente con Babel nel browser
   (braccio «prima» della tabella del giro 237 e prova del rosso del guardiano web-237). */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
export const BABEL_TAG = '<script type="text/babel" data-presets="react">';
/* le due righe che caricano babel-standalone (primario cdnjs + ripiego jsdelivr): nella pagina tradotta non servono */
const RX_BABEL_CDN = /<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/babel-standalone\/[^"]+"><\/script>\s*<script>window\.Babel\|\|document\.write\([^\n]*\)<\/script>/;

export const babelNelBrowser = () => process.env.CPM_BABEL_BROWSER === '1';

/* Traduzione pura (nessun disco): stessa estrazione di tools/build-dist.mjs (il blocco babel e' l'ultimo script). */
export function traduciPagina(html) {
  const bStart = html.indexOf(BABEL_TAG);
  if (bStart < 0) throw new Error('precompila-237: blocco <script type="text/babel"> non trovato');
  const cStart = bStart + BABEL_TAG.length;
  const bClose = html.lastIndexOf('</script>');
  if (bClose <= cStart) throw new Error('precompila-237: chiusura del blocco babel non trovata');
  const Babel = require(path.join(__dirname, '..', 'node_modules', '@babel', 'standalone'));
  const code = Babel.transform(html.slice(cStart, bClose), { presets: ['react'], compact: false, comments: false, sourceMaps: false }).code;
  let out = html.slice(0, bStart) + '<script>\n' + code + '\n</script>' + html.slice(bClose + '</script>'.length);
  if (!RX_BABEL_CDN.test(out)) throw new Error('precompila-237: righe di caricamento di babel-standalone non trovate (ancora cambiata?)');
  out = out.replace(RX_BABEL_CDN, '<!-- [giro 237] pagina gia\' tradotta dal banco: babel-standalone non serve -->');
  return out;
}

const _mem = new Map();
/* Pagina tradotta per il file `fp`, in cache su disco per impronta (sha256 del sorgente).
   Scrittura atomica (tmp + rename): due guardiani in parallelo non leggono mai un file a meta'. */
export function paginaTradotta(fp) {
  const src = fs.readFileSync(fp);
  const h = crypto.createHash('sha256').update(src).digest('hex').slice(0, 16);
  if (_mem.has(h)) return _mem.get(h);
  const dir = path.join(__dirname, '..', 'out', '.precompilata-237');
  const cf = path.join(dir, h + '.html');
  let buf = null;
  try { buf = fs.readFileSync(cf); } catch (_e) {}
  if (!buf) {
    const t0 = Date.now();
    buf = Buffer.from(traduciPagina(src.toString('utf8')), 'utf8');
    fs.mkdirSync(dir, { recursive: true });
    const tmp = cf + '.' + process.pid + '.tmp';
    fs.writeFileSync(tmp, buf); fs.renameSync(tmp, cf);
    /* tiene solo le ultime 3 build in cache */
    try { const v = fs.readdirSync(dir).filter(f => f.endsWith('.html')).map(f => [f, fs.statSync(path.join(dir, f)).mtimeMs]).sort((a, b) => b[1] - a[1]); for (const [f] of v.slice(3)) fs.rmSync(path.join(dir, f), { force: true }); } catch (_e) {}
    if (process.env.CPM_T237_VERBOSE) console.log(`[precompila-237] tradotta in ${Date.now() - t0} ms → ${cf}`);
  }
  _mem.set(h, buf);
  return buf;
}

/* Registro delle pagine aperte (misura del giro 237): CPM_T237_LOG=<file> → una riga per richiesta della pagina di gioco. */
export function annotaPagina(tipo) {
  const f = process.env.CPM_T237_LOG; if (!f) return;
  try { fs.appendFileSync(f, JSON.stringify({ t: Date.now(), pid: process.pid, tipo }) + '\n'); } catch (_e) {}
}
