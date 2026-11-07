// [PO-310] Costo delle sessioni figlie, per versione. Strumento nostro: nessun gancio esterno.
// Dati: docs/governo/COSTI.json, una riga per sessione, copiata dalla sessione madre da get_session
//   (external_metadata.usage.cost_usd, output_tokens, cache_read_tokens, worker_epoch).
// Uso: node tools/costi-sessioni.mjs            -> scrive docs/governo/COSTI.md e stampa il riepilogo
//      node tools/costi-sessioni.mjs --json      -> stampa le righe per la pagina di governo
// ATTENZIONE (misura del 07/11): cost_usd e' quello dichiarato dalla piattaforma e, quando il contenitore
// della sessione e' ripartito (worker_epoch > 1), copre solo l'ultimo avvio: giro 109, 2 avvii, 0,72 $ con
// 4.688 token d'uscita in 2 ore, contro giro 108, 1 avvio, 13,04 $ con 91.480. Quelle righe sono «parziali»
// e il totale della versione e' un minimo, non il costo vero. La sessione madre non e' conteggiata.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const righe = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/governo/COSTI.json'), 'utf8'));
const parziale = r => (r.worker_epoch || 1) > 1;
const ore = r => r.creata && r.chiusa ? (new Date(r.chiusa) - new Date(r.creata)) / 36e5 : null;
const eur = n => n.toFixed(2).replace('.', ',') + ' $';

export function tabella() {
  const cols = ['Versione', 'Sessione', 'Tipo', 'Modello', 'Ore', 'Costo dichiarato', 'Token d\'uscita', 'Avvii', 'Affidabilità'];
  const rows = righe.map(r => [r.versione, r.titolo, r.tipo, r.modello, ore(r) == null ? '' : ore(r).toFixed(1).replace('.', ','),
    eur(r.cost_usd), String(r.output_tokens), String(r.worker_epoch || 1),
    parziale(r) ? 'parziale: solo l\'ultimo avvio del contenitore' : 'completo (un solo avvio)']);
  const perV = {};
  for (const r of righe) { const v = perV[r.versione] ||= { n: 0, usd: 0, parz: 0 }; v.n++; v.usd += r.cost_usd; if (parziale(r)) v.parz++; }
  for (const [v, t] of Object.entries(perV).sort())
    rows.push([v, '**TOTALE ' + v + '** (' + t.n + ' sessioni)', '', '', '', (t.parz ? 'almeno ' : '') + eur(t.usd), '', '',
      t.parz ? t.parz + ' sessioni parziali: totale minimo' : 'tutte complete']);
  return { cols, rows, perV };
}

if (process.argv[1] && process.argv[1].endsWith('costi-sessioni.mjs')) {
  const { cols, rows, perV } = tabella();
  if (process.argv.includes('--json')) { console.log(JSON.stringify({ cols, rows })); process.exit(0); }
  const md = ['# Costi delle sessioni figlie (PO-310)', '',
    'Generato da `node tools/costi-sessioni.mjs` dai dati di `docs/governo/COSTI.json`. Fonte: `get_session` della piattaforma (campo usage.cost_usd).',
    'Una riga con più di un avvio del contenitore copre solo l\'ultimo avvio: il totale della versione è allora un minimo. La sessione madre non è conteggiata.', '',
    '| ' + cols.join(' | ') + ' |', '|' + cols.map(() => '---').join('|') + '|', ...rows.map(r => '| ' + r.join(' | ') + ' |'), ''].join('\n');
  fs.writeFileSync(path.join(ROOT, 'docs/governo/COSTI.md'), md);
  for (const [v, t] of Object.entries(perV).sort()) console.log(`${v}: ${t.n} sessioni, ${t.parz ? 'almeno ' : ''}${eur(t.usd)}${t.parz ? ` (${t.parz} parziali)` : ''}`);
}
