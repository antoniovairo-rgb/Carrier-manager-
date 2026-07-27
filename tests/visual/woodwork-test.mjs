#!/usr/bin/env node
/* [7.217.0 revisione PO «rendere più nitida la parata / traversa / palo»] IL LEGNO DETTO E QUELLO COLPITO.
   Il pool dell'esito «palo» mescolava «Palo!» e «Traversa!» e ne pescava uno a caso, mentre il 3D mostrava
   sempre e comunque un palo laterale: la parola contraddiceva l'immagine una volta su due. Dal 7.215.0 la
   traversa esiste davvero in campo, quindi QUALE legno sia lo decide una volta sola `handleAction` e lo
   consumano insieme 3D, overlay e cronaca (pattern M1, Unified Outcome Model).
   La probe interroga il picker VERO in pagina su molti seed e pretende che le parole seguano la decisione:
   con «bar» non deve mai uscire la parola palo, con «post» non deve mai uscire traversa. Verifica anche che
   la FAMIGLIA visiva resti «post» in entrambi i casi — è l'invariante che il check `timeline` del gate
   controlla (overlay-family ⟺ arc-family): se cambiasse, il gate fallirebbe. */
import { startServer, launchBrowser, installCdnRoutes, openMatch } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 800, height: 800 } });
await installCdnRoutes(page);
const issues = [];
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port);

const res = await page.evaluate(() => {
  const out = { bar: [], post: [], fams: new Set() };
  for (let seed = 0; seed < 60; seed++) {
    for (const wood of ['bar', 'post']) {
      const o = window.hlOverlay('miss', false, '💥 Tiro di potenza', 'Luca', seed, 'post', wood);
      out[wood].push(o.text); out.fams.add(o.fam);
    }
  }
  return { bar: [...new Set(out.bar)], post: [...new Set(out.post)], fams: [...out.fams], barTx: window.__CPM_BAR_TX, postTx: window.__CPM_MISS_TX.post };
});
const RX_BAR = /traversa|legno alto|incrocio/i, RX_POST = /\bpalo\b/i;
console.log(`overlay «traversa»: ${res.bar.join(' · ')}`);
console.log(`overlay «palo»:     ${res.post.join(' · ')}`);
console.log(`cronaca traversa:   ${(res.barTx || []).join(' · ')}`);
console.log(`cronaca palo:       ${(res.postTx || []).join(' · ')}`);
console.log(`famiglia visiva:    ${res.fams.join(',')}`);

for (const t of res.bar) if (RX_POST.test(t)) issues.push(`decisione «traversa» ma l'overlay dice «${t}»`);
for (const t of res.post) if (RX_BAR.test(t)) issues.push(`decisione «palo» ma l'overlay dice «${t}»`);
for (const t of (res.barTx || [])) if (RX_POST.test(t)) issues.push(`cronaca traversa incoerente: «${t}»`);
for (const t of (res.postTx || [])) if (RX_BAR.test(t)) issues.push(`cronaca palo incoerente: «${t}»`);
if (!res.bar.length || !res.post.length) issues.push('nessun testo estratto — il picker non è stato interrogato');
if (res.fams.length !== 1 || res.fams[0] !== 'post')
  issues.push(`la famiglia visiva è cambiata (${res.fams.join(',')}): rompe l'invariante overlay-family ⟺ arc-family del check timeline`);

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n')
  : '✅ LEGNO COERENTE (la parola segue il legno davvero colpito, e la famiglia visiva resta una sola)');
process.exit(issues.length ? 1 : 0);
