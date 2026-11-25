#!/usr/bin/env node
/* ============================================================================
   notte-333.mjs — IL TRENO GRANDE DI NOTTE LASCIA SEMPRE UNA TRACCIA (giro 333, PO-630 / PO-631 — decisione PO 23/11)

   PO-630: il cron delle 01:07 non ha mai prodotto una corsa «schedule» (API pubblica: 0 corse schedule in tutto il repo). Prove e
   ipotesi in docs/sviluppo/RAPPORTO-giro333.md. Qui stanno le due parti che non dipendono dalla causa:
     1. SCADENZA ASSOLUTA del custode: il custode parte da due orari (rete di riserva se il primo non scatta), ma la notte finisce
        per tutti alla stessa ora (default 05:47 UTC = 01:07 + 280 min). Un custode di riserva partito alle 02:43 non veglia fino
        alle 07:23, e uno partito dopo la scadenza non accoda nulla.
     2. PO-631: il custode scrive l'esito della notte in docs/governo/TRENO-NOTTE.json su main; la pagina di governo
        (tools/governo-html.mjs) mostra «treno grande di stanotte: partito / non partito». Se il custode non scrive affatto (il
        cron non e' scattato), la pagina lo deduce dall'assenza del record dopo la scadenza: anche quello e' «non partito».

   Funzioni pure (le prova tests/visual/notte-333.mjs):
     notteDi(adesso)                → la notte (AAAA-MM-GG UTC) a cui appartiene un istante: dalle 01:07 UTC in poi e' la notte del giorno
     scadenza({avvio, scadenzaMin, entro}) → istante (ms) oltre il quale il custode smette di vegliare
     registra(prec, nuovo)          → il record da scrivere, o null se quello che c'e' gia' basta (niente commit inutili)
     statoNotte(rec, adesso)        → { esito: 'partito'|'in_ritardo'|'non_partito'|'in_attesa', testo, cls }   [in_ritardo: giro 359] per la pagina di governo
   Comando: node tools/notte-333.mjs registra --esito <esito-custode.json> --prec <TRENO-NOTTE.json> --uscita <nuovo.json>
            (uscita 0 sempre; se non c'e' niente da scrivere non crea --uscita)
   Rosso del guardiano: CPM_NO_G333=1 = comportamento del giro 330 (scadenza solo relativa, nessun record, pagina muta).
   ============================================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const FILE_NOTTE = 'docs/governo/TRENO-NOTTE.json';
export const ORA_NOTTE = '01:07';      // primo orario del custode (UTC)
export const ENTRO = '05:47';          // 01:07 + 280 minuti: la notte finisce qui per tutti i custodi
/* [giro 359, PO-630] «in ritardo»: un treno grande avviato dopo l'orario di riserva, o nessun esito ancora dopo quell'ora (rosso CPM_NO_G359=1) */
export const RITARDO = '02:43';
const NO359 = () => process.env.CPM_NO_G359 === '1';
const NO = () => process.env.CPM_NO_G333 === '1';
const min = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
const giorno = ms => new Date(ms).toISOString().slice(0, 10);

export function notteDi(adesso) {
  const t = +new Date(adesso);
  return giorno(t - min(ORA_NOTTE) * 60000);
}

export function scadenza({ avvio, scadenzaMin = 280, entro = ENTRO }) {
  const a = +new Date(avvio), rel = a + scadenzaMin * 60000;
  if (NO() || !entro) return rel;
  const ass = Date.parse(notteDi(a) + 'T' + entro + ':00Z');
  return Math.min(rel, ass);
}

export function registra(prec, nuovo) {
  if (NO()) return null;
  if (!nuovo || !nuovo.notte || !nuovo.esito) return null;
  if (prec && prec.notte === nuovo.notte && (prec.esito === 'partito' || prec.esito === nuovo.esito)) return null;
  const storia = [{ notte: nuovo.notte, esito: nuovo.esito, treno: nuovo.treno ?? null },
    ...((prec && prec.storia) || []).filter(s => s.notte !== nuovo.notte)].slice(0, 14);
  return {
    _: 'giro 333 (PO-631): esito del treno grande di notte, scritto dal custode (.github/workflows/treno-notte-330.yml) su main. Lo legge tools/governo-html.mjs. «non_partito» = il custode non e\' riuscito ad accodarsi entro la scadenza; un record che manca dopo la scadenza vuol dire che il custode non e\' nemmeno partito.',
    notte: nuovo.notte, esito: nuovo.esito, perche: nuovo.perche || '', treno: nuovo.treno ?? null,
    custode: nuovo.custode ?? null, url: nuovo.url || '', scritto: nuovo.scritto || new Date().toISOString(), storia,
  };
}

export function statoNotte(rec, adesso) {
  if (NO()) return null;
  const t = +new Date(adesso), n = notteDi(t), fine = Date.parse(n + 'T' + ENTRO + ':00Z') + 15 * 60000;
  if (rec && rec.notte === n) {
    const tardi = !NO359() && rec.esito === 'partito' && rec.scritto && Date.parse(rec.scritto) > Date.parse(n + 'T' + RITARDO + ':00Z');
    if (tardi) return { esito: 'in_ritardo', cls: 'c-run', testo: `treno grande di stanotte (${n}): partito in ritardo — alle ${new Date(rec.scritto).toISOString().slice(11, 16)} UTC, dopo le ${RITARDO}${rec.treno ? ' — corsa ' + rec.treno : ''}` };
    if (rec.esito === 'partito') return { esito: 'partito', cls: 'c-ok', testo: `treno grande di stanotte (${n}): partito${rec.treno ? ' — corsa ' + rec.treno : ''}` };
    return { esito: 'non_partito', cls: 'c-open', testo: `treno grande di stanotte (${n}): non partito — ${rec.perche || 'il custode non si e\' accodato entro la scadenza'}` };
  }
  if (t < fine && !NO359() && t > Date.parse(n + 'T' + RITARDO + ':00Z')) return { esito: 'in_ritardo', cls: 'c-run', testo: `treno grande di stanotte (${n}): in ritardo — nessun treno grande alle ${RITARDO} UTC, custode e sveglia al lavoro fino alle ${ENTRO} UTC${rec ? ' · ultima notte registrata ' + rec.notte + ' (' + rec.esito + ')' : ''}` };
  if (t < fine) return { esito: 'in_attesa', cls: 'c-wait', testo: `treno grande di stanotte (${n}): custode al lavoro fino alle ${ENTRO} UTC${rec ? ' · ultima notte registrata ' + rec.notte + ' (' + rec.esito + ')' : ''}` };
  return { esito: 'non_partito', cls: 'c-open', testo: `treno grande di stanotte (${n}): non partito — nessun esito scritto dal custode (il cron non e' scattato?)${rec ? ' · ultima notte registrata ' + rec.notte + ' (' + rec.esito + ')' : ''}` };
}

function args() { const a = process.argv.slice(3), o = {}; for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { const k = a[i].slice(2); o[k] = a[i + 1] && !a[i + 1].startsWith('--') ? a[++i] : true; } return o; }
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const o = args();
  if (process.argv[2] !== 'registra' || !o.esito || !o.uscita) { console.error('uso: node tools/notte-333.mjs registra --esito <file> --prec <file> --uscita <file>'); process.exit(2); }
  let prec = null, nuovo = null;
  try { prec = JSON.parse(fs.readFileSync(o.prec, 'utf8')); } catch {}
  try { nuovo = JSON.parse(fs.readFileSync(o.esito, 'utf8')); } catch (e) { console.log('esito del custode illeggibile: ' + e.message); }
  const r = registra(prec, nuovo);
  if (r) { fs.writeFileSync(o.uscita, JSON.stringify(r, null, 2) + '\n'); console.log(`da scrivere: notte ${r.notte} ${r.esito}`); }
  else console.log('niente da scrivere (record gia\' presente per questa notte, o esito mancante)');
  process.exit(0);
}
