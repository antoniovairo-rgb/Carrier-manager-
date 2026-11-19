/* [giro 237 PO-504 B] PILOTA DELLA MISURA DEI TEMPI: ogni guardiano due volte, UNO ALLA VOLTA, braccio «prima» (CPM_BABEL_BROWSER=1:
   sorgente tradotto da Babel nel browser, come il banco fino alla 196) e braccio «dopo» (pagina gia' tradotta, banco dal giro 237).
   Registra secondi, esito (codice d'uscita) e pagine di gioco aperte (CPM_T237_LOG) in out/t237/tempi.jsonl, una riga per corsa.
   Uso: node tempi-237.mjs <guardiano> [<guardiano> ...]   ·   CPM_T237_BRACCI=dopo (o prima) per un braccio solo.
   Riprende: una coppia (guardiano, braccio) gia' registrata non si ripete (CPM_T237_RIFAI=1 per rifarla). */
import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const OUT = path.resolve('out/t237'); fs.mkdirSync(OUT, { recursive: true });
const FILE = path.join(OUT, 'tempi.jsonl');
const bracci = (process.env.CPM_T237_BRACCI || 'prima,dopo').split(',');
const fatti = new Set(); try { for (const l of fs.readFileSync(FILE, 'utf8').split('\n').filter(Boolean)) { const r = JSON.parse(l); fatti.add(r.g + '|' + r.braccio); } } catch (_e) {}
const env0 = { ...process.env, CPM_CHROME: process.env.CPM_CHROME || '/opt/pw-browsers/chromium', PLAYWRIGHT_BROWSERS_PATH: '/opt/pw-browsers', VISION_PROVIDER: 'none', CPM_CI_PAR: '0' };
const corri = (g, braccio) => new Promise(res => {
  const pf = path.join(OUT, `${g.replace(/[:/]/g, '_')}-${braccio}.pagine`); fs.rmSync(pf, { force: true });
  const env = { ...env0, CPM_BABEL_BROWSER: braccio === 'prima' ? '1' : '0', CPM_T237_LOG: pf };
  const lf = path.join(OUT, `${g.replace(/[:/]/g, '_')}-${braccio}.log`); const out = fs.createWriteStream(lf);
  const t0 = Date.now(); const ch = spawn('npm', ['run', '-s', g], { env });
  ch.stdout.pipe(out); ch.stderr.pipe(out);
  ch.on('close', code => { let pagine = 0; try { pagine = fs.readFileSync(pf, 'utf8').split('\n').filter(Boolean).length; } catch (_e) {}
    res({ g, braccio, s: Math.round((Date.now() - t0) / 1000), code, pagine, quando: new Date().toISOString().slice(0, 16) }); });
});
for (const g of process.argv.slice(2)) for (const b of bracci) {
  if (fatti.has(g + '|' + b) && !process.env.CPM_T237_RIFAI) { console.log(`= ${g} ${b}: gia' misurato`); continue; }
  let mem = ''; try { mem = execSync("free -m | awk '/Mem:/{print $7}'").toString().trim() + ' MB liberi'; } catch (_e) {}
  console.log(`> ${g} ${b} (${mem}) ${new Date().toISOString().slice(11, 19)}`);
  const r = await corri(g, b);
  fs.appendFileSync(FILE, JSON.stringify(r) + '\n');
  console.log(`< ${g} ${b}: ${r.s} s · uscita ${r.code} · pagine ${r.pagine}`);
}
console.log('FINE');
