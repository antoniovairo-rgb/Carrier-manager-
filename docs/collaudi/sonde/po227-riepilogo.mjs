// Riepilogo della sonda PO-227: raggruppa i corpi per firma (scala + insieme clip). Sola lettura del JSON grezzo.
import fs from 'fs';
const d = JSON.parse(fs.readFileSync(new URL('../PO227-dati/po227-dati-grezzi.json', import.meta.url)));
const F = d.finale.filter(b => b.scene >= 1);
const gruppi = { bambini: [], giocatoriCH38: [], nonIdentificati: [] };
for (const b of F) {
  if (b.clips.length === 2 && b.clips.includes('idle') && b.clips.includes('jog') && b.scaleY < 0.9) gruppi.bambini.push(b);
  else if (b.clips.some(c => c.startsWith('mx-'))) gruppi.giocatoriCH38.push(b);
  else gruppi.nonIdentificati.push(b);
}
const sum = (arr, k) => arr.reduce((s, x) => s + x[k], 0);
for (const [nome, arr] of Object.entries(gruppi)) {
  if (!arr.length) { console.log(nome, 'n=0'); continue; }
  const fermi = arr.filter(x => x.stillS > 0.5);
  const cFerma = fermi.filter(x => x.runStillS > 0.3 * x.stillS && x.runStillS > 0.5);
  console.log(`${nome}: corpi=${arr.length} · con fermo>0,5s=${fermi.length} · che corrono da fermi (clip jog>0,3 per >50% del fermo)=${cFerma.length}`);
  console.log(`   scena totale=${sum(arr,'scene').toFixed(1)}s · fermo=${sum(arr,'stillS').toFixed(1)}s · jog-da-fermo=${sum(arr,'runStillS').toFixed(1)}s`);
  console.log(`   scaleY medio=${(sum(arr,'scaleY')/arr.length).toFixed(3)} · clip viste: ${[...new Set(arr.flatMap(x=>x.clips))].slice(0,8).join(',')}`);
}
console.log('snapshot:', d.snaps.length, '· foto:', fs.readdirSync(new URL('../PO227-foto/', import.meta.url)).join(' '));
