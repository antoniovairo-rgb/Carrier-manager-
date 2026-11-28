#!/usr/bin/env node
/* [giro 444 · PO-686 ter] FOTO per il PO (non guardiano): PRIMA (= giro 440: baffi del 440 e stempiato/lunghi raccolti accesi) e DOPO,
   notte e giorno, all'ingresso in campo, formato del 440 (figurina | corpo in campo | primo piano del viso), piu' la testa di lato e di
   tre quarti da dietro per gli stempiati. Il PRIMA e' il gioco con window.__CPM_NO_G444 (baffi del 440) e la tabella del 440
   (window.__CPM_TAB444_PRIMA: i due tagli spenti riaccesi solo per la foto, solo ?cpmtest=1).
   Uscita out/g444/foto/{tod}-{prima|dopo}-*.png; tools/foto-444.py le monta in docs/collaudo-po/444-*.png.
   Nessun taglio forzato dal banco: ognuno ha il suo. CPM_NOMI="a,b", CPM_TODS="night". */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { foto414 } from './misura-414.mjs';
import { apriEPronti } from './misura-432.mjs';
import { fotoDietro } from './foto-440.mjs';
import fs from 'node:fs';
export const NOMI444 = ['Connor Quinn', 'Declan Russell', 'Keith Carr', 'Samuelito Vairo', 'Sebastian Maxwell', 'Norman Bailey', 'Noah Marshall', 'Aaron Lane'];
const NOMI = process.env.CPM_NOMI ? process.env.CPM_NOMI.split(',') : NOMI444;
const D = 'out/g444/foto'; fs.mkdirSync(D, { recursive: true });
if (import.meta.url === `file://${process.argv[1]}`) {
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  async function giro(tod, braccio, flags) {
    const { ctx, p, ok } = await apriEPronti(b, port, flags, tod, { width: 1000, height: 640 });
    if (!ok) { console.log('ingresso non raggiunto', tod, braccio); await ctx.close(); return; }
    await p.screenshot({ path: `${D}/${tod}-${braccio}-ingresso.png` });
    const t = `${braccio === 'prima' ? 'prima (giro 440)' : 'dopo (giro 444)'} · ${tod === 'night' ? 'notte' : 'giorno'}`;
    for (const n of NOMI) if (/Carr|Marshall/.test(n)) await fotoDietro(p, n, `${D}/${tod}-${braccio}-${n.replace(/\W+/g, '_')}-dietro.png`, t);
    for (const n of NOMI) await foto414(p, n, `${D}/${tod}-${braccio}-${n.replace(/\W+/g, '_')}.png`, t);
    await ctx.close();
  }
  for (const tod of (process.env.CPM_TODS || 'night,day').split(',')) await Promise.all([giro(tod, 'prima', ['__CPM_NO_G444', '__CPM_TAB444_PRIMA']), giro(tod, 'dopo', [])]);
  await b.close(); srv.close(); console.log('foto in', D);
}
