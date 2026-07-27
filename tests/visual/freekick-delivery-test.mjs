#!/usr/bin/env node
/* [7.216.0 revisione PO «sembra un cross basso»] SULLA PUNIZIONE LA SCELTA DEVE ARRIVARE ALLA CINEMATICA.
   `deriveHL` classificava ogni azione di una punizione come `freekick` senza guardare QUALE azione fosse: «Cross
   alto», «Cross basso teso» e «Giocata corta» producevano lo stesso identico filmato (l'arco del tiro diretto
   verso la porta). Il gameplay la distinzione ce l'aveva già — dal 7.8.9 solo il tiro diretto apre la griglia di
   mira — ma il 3D no.
   La probe legge il motore VERO in pagina (`deriveHL`) su TUTTE le situazioni di punizione e pretende:
     · una CONCLUSIONE (stat "tiro" o reward gol) → `freekick_direct`;
     · una CONSEGNA → mai `freekick_direct`, e le consegne di una stessa punizione devono differire tra loro;
     · nessuna azione senza variante.
   Nessun browser-rendering: si interroga solo la funzione pura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 800, height: 800 } });
await installCdnRoutes(page);
const issues = [];
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port);

const rows = await page.evaluate(() => {
  const out = [];
  (window.__CPM_SITS || []).forEach((s, i) => {
    if (window.deriveHL(s, null).type !== 'freekick') return;
    out.push({
      i, txt: (s.text || '').slice(0, 46),
      acts: (s.actions || []).map(a => ({ l: a.label, stat: a.stat, rew: a.rew, v: window.deriveHL(s, a).variant })),
    });
  });
  return out;
});
await browser.close(); srv.close();

console.log(`situazioni di punizione: ${rows.length}`);
if (rows.length < 5) issues.push(`solo ${rows.length} punizioni trovate — l'estrazione non ha funzionato`);
for (const r of rows) {
  console.log(`gi${r.i} ${r.txt}`);
  const deliveries = [];
  for (const a of r.acts) {
    console.log(`    ${(a.v || '—').padEnd(20)} ${a.l}`);
    if (!a.v) { issues.push(`gi${r.i} «${a.l}»: nessuna variante — la scelta non arriva alla cinematica`); continue; }
    const isShot = (a.stat === 'tiro' || a.rew === 'goal');
    if (isShot && a.v !== 'freekick_direct') issues.push(`gi${r.i} «${a.l}» è una conclusione ma esce come ${a.v}`);
    if (!isShot) {
      if (a.v === 'freekick_direct') issues.push(`gi${r.i} «${a.l}» è una consegna ma esce come tiro diretto in porta`);
      deliveries.push(a.v);
    }
  }
  /* due consegne diverse nella stessa punizione non possono avere la stessa traiettoria: è il difetto segnalato */
  const uniq = new Set(deliveries);
  if (deliveries.length >= 2 && uniq.size < 2)
    issues.push(`gi${r.i}: ${deliveries.length} consegne diverse producono tutte «${deliveries[0]}» — restano indistinguibili a schermo`);
}
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n')
  : '✅ PUNIZIONI LEGGIBILI (conclusione, cross alto, cross teso e giocata corta hanno ciascuna la propria traiettoria)');
process.exit(issues.length ? 1 : 0);
