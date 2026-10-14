#!/usr/bin/env node
/* [PO-252/3 giro 22] GUARDIANO: L'EROE NON E' IMMOBILE NEGLI INTERVENTI DIFENSIVI (banco PO-248 difetto #3: 4 difese su 16 con eroe
   fermo e senza gesto nell'80%+ dei primi 2 s di scena). Stessa grandezza del banco (`fermoQ`: quota di fotogrammi dei primi 2 s di
   scena dopo la scelta con eroe che non si sposta oltre 0,005u E senza gesto GLB di peso > 0,1), GLB acceso, pagina nuova per scena.
   Scene del banco: gi133 «Sprint disperato sulla linea» (riesce/sbaglia), gi31 «Scivolata netta», gi130 «Anticipo sulla traiettoria».
   Verde: nessuna esecuzione ≥ 0,8 nel braccio verde; rosso __CPM_NO_DIF252: almeno 2 esecuzioni ≥ 0,8.                            */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { pagina252, scena252 } from './lib/scena-252.mjs';
const CASI = [[133, 'success'], [133, 'fail'], [31, 'success'], [130, 'success']];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ris = { verde: [], rosso: [] };
for (const br of ['verde', 'rosso']) for (const [gi, out] of CASI) {
  const page = await pagina252(b, port, br === 'rosso' ? { __CPM_NO_DIF252: 1 } : {});
  const r = await scena252(page, { gi, k: 0, out, secondi: 2.5, raccogli: () => ({ fr: window.__S252.fr.slice() }) });
  await page.close();
  const F = ((r && r.fr) || []).filter(f => f.ck != null && f.h); if (F.length < 8) { console.log(`  ${br} gi${gi} ${out}: non giudicata`); continue; }
  const c0 = F[0].ck; const R2 = F.filter(f => f.ck - c0 <= 2.0); let fermi = 0, n = 0, perc = 0;
  for (let i = 1; i < R2.length; i++) { const a = R2[i - 1], c = R2[i]; if (!(c.ck > a.ck)) continue; n++; const d = Math.hypot(c.h[0] - a.h[0], c.h[2] - a.h[2]); perc += d; const gesto = c.g && c.g[0] && (c.g[1] || 0) > 0.1; if (d <= 0.005 && !gesto) fermi++; }
  const q = n ? +(fermi / n).toFixed(2) : null; ris[br].push(q);
  console.log(`  ${br.padEnd(5)} gi${gi} ${out.padEnd(7)} fermo ${q} · percorso nei primi 2 s ${perc.toFixed(1)}u`);
}
await Promise.race([b.close(), new Promise(r => setTimeout(r, 5000))]); srv.close();
const V = ris.verde.filter(x => x != null), R = ris.rosso.filter(x => x != null);
if (V.length < 3) { console.log('❌ CIECO'); setTimeout(() => process.exit(2), 100); }
else { const ok = V.every(x => x < 0.8) && R.filter(x => x >= 0.8).length >= 2;
  console.log(`\nverde: fermi ≥ 0,8 ${V.filter(x => x >= 0.8).length}/${V.length} · rosso: ${R.filter(x => x >= 0.8).length}/${R.length}`);
  console.log(ok ? '✅ difesa-252 VERDE' : '❌ difesa-252 ROSSO'); setTimeout(() => process.exit(ok ? 0 : 1), 100); }
