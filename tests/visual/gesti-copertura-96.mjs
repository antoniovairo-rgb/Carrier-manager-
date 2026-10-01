/* [7.999.96 PO-069] Guardiano della COPERTURA DEI GESTI. Rilancia il censimento delle scene (censimento-scene.mjs: per ogni
   azione, il gesto promesso dal testo contro cio' che il 3D sa disegnare) e confronta con la base salvata:
   rosso se crescono le azioni non disegnabili o le varianti mai raggiunte, o se calano le fedeli.
   Stampa la copertura: % azioni con gesto fedele e % varianti raggiunte. Aggiornare la base: CPM_BASE_UPDATE=1.
   Prova del rosso: CPM_ROSSO96=1 confronta con una base piu' severa di un'unita' (deve fallire). */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const HERE = path.dirname(new URL(import.meta.url).pathname);
execFileSync(process.execPath, [path.join(HERE, 'censimento-scene.mjs')], { cwd: HERE, stdio: 'ignore', env: process.env, timeout: 280000 });
const d = JSON.parse(fs.readFileSync(path.join(HERE, '../character-lab/CENSIMENTO_SCENE.json'), 'utf8'));
const mai = Array.isArray(d.varianti_mai_raggiunte) ? d.varianti_mai_raggiunte.length : Number(d.varianti_mai_raggiunte), tot = d.varianti_dichiarate;
const ora = { azioni: d.azioni, f: d.totali.f, a: d.totali.a, n: d.totali.n, mai, varianti: tot };
const nd = d.righe.filter(r => r.verdetto === 'n').map(r => `#${r.gi} ${r.label}`);
console.log(`azioni ${ora.azioni} · fedeli ${ora.f} (${(100 * ora.f / ora.azioni).toFixed(1)}%) · approssimate ${ora.a} · non disegnabili ${ora.n} · varianti raggiunte ${tot - mai}/${tot} (${(100 * (tot - mai) / tot).toFixed(1)}%)`);
console.log('non disegnabili: ' + nd.join(' · '));
const BF = path.join(HERE, 'gesti-copertura-baseline.json');
if (process.env.CPM_BASE_UPDATE || !fs.existsSync(BF)) { fs.writeFileSync(BF, JSON.stringify(ora, null, 1) + '\n'); console.log('base scritta'); process.exit(0); }
let base = JSON.parse(fs.readFileSync(BF, 'utf8'));
if (process.env.CPM_ROSSO96) base = { ...base, n: base.n - 1, f: base.f + 1, mai: base.mai - 1 };
const peggio = [];
if (ora.n > base.n) peggio.push(`non disegnabili ${base.n} → ${ora.n}`);
if (ora.f < base.f) peggio.push(`fedeli ${base.f} → ${ora.f}`);
if (ora.mai > base.mai) peggio.push(`varianti mai raggiunte ${base.mai} → ${ora.mai}`);
if (process.env.CPM_ROSSO96) { const v = peggio.length > 0; console.log(v ? 'ROSSO OK: il confronto morde (' + peggio.join('; ') + ')' : 'ROSSO KO'); process.exit(v ? 0 : 1); }
if (peggio.length) { console.log('KO: ' + peggio.join('; ')); process.exit(1); }
console.log(`VERDE (base: fedeli ${base.f}, non disegnabili ${base.n}, mai raggiunte ${base.mai})`); process.exit(0);
