/* [collaudo 177 carriera 2] REPL a file: tiene vivo il browser e valuta gli script che compaiono in CMD (solo collaudo). */
import fs from 'fs'; import path from 'path';
import * as L from './c177-car2-lib.mjs';
const CMD = path.join(L.SCRATCH, 'cmd'); fs.mkdirSync(CMD, { recursive: true });
const cp = process.env.CP; // checkpoint opzionale (json di localStorage)
const S = await L.apri();
await S.ctx.addInitScript(([cpData]) => { try { localStorage.setItem('cpm-match-speed', '2'); if (cpData) { const o = JSON.parse(cpData); for (const k in o) localStorage.setItem(k, o[k]); } } catch (e) {} }, [cp ? fs.readFileSync(cp, 'utf8') : null]);
await L.vai(S);
if (cp) { await L.clickTesto(S.page, /CONTINUA/); await L.sleep(2500); }
fs.writeFileSync(path.join(CMD, 'ready'), 'ok');
console.log('REPL pronto');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
for (;;) {
  const f = fs.readdirSync(CMD).filter(x => x.endsWith('.js')).sort()[0];
  if (!f) { await L.sleep(300); continue; }
  const full = path.join(CMD, f); const src = fs.readFileSync(full, 'utf8'); fs.unlinkSync(full);
  let out;
  try { out = await new AsyncFunction('S', 'p', 'L', src)(S, S.page, L); } catch (e) { out = 'ERRORE: ' + (e && e.stack || e); }
  fs.writeFileSync(path.join(CMD, f.replace(/\.js$/, '.out')), typeof out === 'string' ? out : JSON.stringify(out, null, 1));
  if (out === 'EXIT') break;
}
await S.browser.close(); S.srv.close(); process.exit(0);
