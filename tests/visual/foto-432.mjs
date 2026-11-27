#!/usr/bin/env node
/* [giro 432 · PO-686] FOTO per il PO (non guardiano): prima (rosso __CPM_NO_G432) e dopo, notte e giorno, all'ingresso in campo.
   Per sei giocatori scelti per coprire i tipi (rasato+pizzetto, ricci+piena, ricci medi rossi+piena, rasato biondo+piena,
   corto+corta, afro+baffi) la foto affiancata del giro 414 (figurina | corpo | primo piano del viso), e la fila dell'ingresso come la
   vede il gioco (schermata della pagina). Uscita: out/g432/foto/{tod}-{prima|dopo}-*.png; tools/foto-432.py le monta in docs/collaudo-po. */
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { foto414 } from './misura-414.mjs';
import { apriEPronti } from './misura-432.mjs';
import fs from 'node:fs';
const NOMI = ['Samuelito Vairo', 'Sebastian Maxwell', 'Norman Bailey', 'Trevor Smith', 'Keith Thornton', 'Connor Quinn'];
const D = 'out/g432/foto'; fs.mkdirSync(D, { recursive: true });
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function giro(tod, braccio, flags) {
  const { ctx, p, ok } = await apriEPronti(b, port, flags, tod, { width: 1000, height: 640 });
  if (!ok) { console.log('ingresso non raggiunto', tod, braccio); await ctx.close(); return; }
  await p.screenshot({ path: `${D}/${tod}-${braccio}-ingresso.png` });
  for (const n of NOMI) await foto414(p, n, `${D}/${tod}-${braccio}-${n.replace(/\W+/g, '_')}.png`, `${braccio} · ${tod === 'night' ? 'notte' : 'giorno'}`);
  await ctx.close();
}
await Promise.all([giro('night', 'prima', ['__CPM_NO_G432']), giro('night', 'dopo', [])]);
await Promise.all([giro('day', 'prima', ['__CPM_NO_G432']), giro('day', 'dopo', [])]);
await b.close(); srv.close(); console.log('foto in', D);
