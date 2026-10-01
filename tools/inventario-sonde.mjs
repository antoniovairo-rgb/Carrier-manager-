#!/usr/bin/env node
/* [PO-072] Inventario delle sonde di tests/visual: per ogni .mjs/.js in cima alla cartella dice chi la richiama
   (script di package.json, workflow, altri file vivi di tests/visual, lib/checks, tools). Uscita: tabella in
   docs/governo/INVENTARIO-SONDE.md. Con --archivia sposta con `git mv` in tests/visual/archivio/ le sonde
   che nessuno richiama (mai il gioco, mai lib/checks/fixtures). Solo lettura senza l'opzione. */
import fs from 'fs'; import path from 'path'; import { execSync } from 'child_process';
const R = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), V = path.join(R, 'tests/visual');
const leggi = f => { try { return fs.readFileSync(f, 'utf8'); } catch { return ''; } };
const pkg = JSON.parse(leggi(path.join(V, 'package.json'))).scripts || {};
const wf = fs.readdirSync(path.join(R, '.github/workflows')).map(f => leggi(path.join(R, '.github/workflows', f))).join('\n');
const sotto = d => fs.existsSync(d) ? fs.readdirSync(d, { recursive: true }).filter(f => /\.(m?js|json|sh)$/.test(f)).map(f => leggi(path.join(d, f))).join('\n') : '';
const libchk = sotto(path.join(V, 'lib')) + sotto(path.join(V, 'checks')) + sotto(path.join(R, 'tools')) + leggi(path.join(R, 'package.json'));
const file = fs.readdirSync(V).filter(f => /\.(m?js)$/.test(f) && fs.statSync(path.join(V, f)).isFile());
const testi = Object.fromEntries(file.map(f => [f, leggi(path.join(V, f))]));
const ultimo = f => { try { return execSync(`git log -1 --format=%cs -- "tests/visual/${f}"`, { cwd: R }).toString().trim(); } catch { return ''; } };
const righe = [];
for (const f of file) {
  const base = f.replace(/\.m?js$/, ''), re = new RegExp(`(^|[^\\w-])${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.m?js`);
  const script = Object.entries(pkg).filter(([, v]) => re.test(v)).map(([k]) => k);
  const da = file.filter(g => g !== f && re.test(testi[g]));
  const inWf = re.test(wf), inLib = re.test(libchk);
  const vivo = script.length || da.length || inWf || inLib;
  righe.push({ f, vivo, script, da, inWf, inLib, data: ultimo(f) });
}
// una sonda richiamata solo da sonde morte e' morta anche lei: si ripete finche' l'insieme e' stabile
for (let cambia = true; cambia;) { cambia = false; const morti = new Set(righe.filter(r => !r.vivo).map(r => r.f));
  for (const r of righe) if (r.vivo && !r.script.length && !r.inWf && !r.inLib && r.da.every(g => morti.has(g))) { r.vivo = false; cambia = true; } }
const OGGI = Date.now(), recente = r => r.data && (OGGI - Date.parse(r.data)) / 864e5 < 3, guard = r => /(-test|-guardian|-guard)\.m?js$/.test(r.f);
const orfani = righe.filter(r => !r.vivo && guard(r)), freschi = righe.filter(r => !r.vivo && !guard(r) && recente(r));
const morti = righe.filter(r => !r.vivo && !guard(r) && !recente(r)), vivi = righe.filter(r => r.vivo);
let md = `# Inventario delle sonde di \`tests/visual\` (PO-072)\n\nGenerato da \`node tools/inventario-sonde.mjs\` il ${new Date().toISOString().slice(0, 10)}. `
  + `Una sonda è **viva** se la richiama uno script di \`tests/visual/package.json\`, un workflow, \`lib/\`, \`checks/\`, \`tools/\` o un'altra sonda viva. `
  + `Le altre si spostano in \`tests/visual/archivio/\` con \`--archivia\` (restano nella storia e leggibili; per rieseguirne una si riporta su con \`git mv\`).\n\n`
  + `Totale ${righe.length} · vive ${vivi.length} · da archiviare ${morti.length} · guardiani orfani ${orfani.length} · recenti ${freschi.length}\n\n## Da archiviare\n\n| File | Ultima modifica |\n|---|---|\n`
  + morti.sort((a, b) => a.f.localeCompare(b.f)).map(r => `| \`${r.f}\` | ${r.data} |`).join('\n')
  + `\n\n## Guardiani orfani (nessuno script li lancia: da collegare a uno script o da archiviare, decisione caso per caso)\n\n| File | Ultima modifica |\n|---|---|\n`
  + orfani.sort((a, b) => a.f.localeCompare(b.f)).map(r => `| \`${r.f}\` | ${r.data} |`).join('\n')
  + `\n\n## Sonde recenti non richiamate (meno di 3 giorni: restano finché il lavoro che le ha prodotte è aperto)\n\n| File | Ultima modifica |\n|---|---|\n`
  + freschi.sort((a, b) => a.f.localeCompare(b.f)).map(r => `| \`${r.f}\` | ${r.data} |`).join('\n')
  + `\n\n## Vive\n\n| File | Richiamata da |\n|---|---|\n`
  + vivi.sort((a, b) => a.f.localeCompare(b.f)).map(r => `| \`${r.f}\` | ${[r.script.length ? 'npm: ' + r.script.slice(0, 4).join(', ') + (r.script.length > 4 ? ' …' : '') : '', r.inWf ? 'workflow' : '', r.inLib ? 'lib/checks/tools' : '', r.da.length ? 'sonde: ' + r.da.slice(0, 3).join(', ') + (r.da.length > 3 ? ' …' : '') : ''].filter(Boolean).join(' · ')} |`).join('\n') + '\n';
fs.writeFileSync(path.join(R, 'docs/governo/INVENTARIO-SONDE.md'), md);
console.log(`sonde ${righe.length} · vive ${vivi.length} · da archiviare ${morti.length} · guardiani orfani ${orfani.length} · recenti ${freschi.length}`);
if (process.argv.includes('--archivia')) { for (const r of morti) execSync(`git mv "tests/visual/${r.f}" "tests/visual/archivio/${r.f}"`, { cwd: R }); console.log(`archiviate ${morti.length}`); }
