#!/usr/bin/env node
/* ============================================================================
   custode-notte-330.mjs — IL TRENO GRANDE DI NOTTE NON SALTA PIU' (giro 330, PO-626 a — decisione PO 22/11)

   Il problema (giro 329, dubbio 1): tutte le corse del treno stanno in UNA concorrenza (`treno-guardiani`, senza annullare). GitHub
   tiene nel gruppo una corsa IN CORSO e una IN ATTESA; una terza corsa sostituisce (annulla) quella in attesa. Il treno grande
   delle 01:07 che trovava un trenino in corsa si metteva in attesa e un push arrivato dopo lo annullava: quella notte niente treno
   grande, niente blocco dei rilasci aggiornato.

   La soluzione: il cron non lancia piu' direttamente il treno grande. Lancia un CUSTODE (.github/workflows/treno-notte-330.yml) che
   sta fuori dal gruppo e ogni minuto guarda le corse di verifica-guardiani.yml:
     1. se stanotte c'e' gia' un treno grande vivo (in corsa, in attesa, finito, o annullato DOPO essere partito) → ha finito;
     2. se il posto in attesa del gruppo e' occupato (una corsa queued/pending/waiting) → aspetta: accodarsi ora annullerebbe
        quella corsa (un trenino, cioe' un rilascio);
     3. altrimenti → avvia verifica-guardiani.yml con tipo=notte (workflow_dispatch, stesso percorso del cron di prima);
     4. se il SUO treno grande viene annullato prima di partire (un push lo ha scalzato dal posto in attesa) → torna al punto 2
        e si rimette in coda da solo;
     5. alla scadenza (default 280 min) dichiara «non accodato» nel riepilogo, senza far fallire la corsa.

   Comandi:
     veglia [--scadenza-min 280] [--entro 05:47] [--passo-s 60] [--ref main] [--esito file.json]   → il ciclo vero (GH_TOKEN, GITHUB_REPOSITORY)
     [giro 333] --entro = fine assoluta della notte (UTC) per tutti i custodi; --esito = dove scrivere partito/non_partito (PO-631)
   Funzioni pure (le prova il guardiano tests/visual/treno-330.mjs con un GitHub finto): decidi(), eNotte(), avviata().
   Rosso del guardiano: CPM_NO_G330=1 = comportamento del giro 329 (si accoda subito, non si rimette mai in coda).
   ============================================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scadenza as scadenza333, notteDi } from './notte-333.mjs';/* [giro 333, PO-630/631] scadenza assoluta della notte + esito scritto */

export const WORKFLOW_TRENO = 'verifica-guardiani.yml';
const BOT = 'github-actions[bot]';
const NO = () => process.env.CPM_NO_G330 === '1';

/** Una corsa del treno e' un «treno grande di notte» se viene dal cron di prima o da un custode (workflow_dispatch del bot). */
export const eNotte = r => r.event === 'schedule' || (r.event === 'workflow_dispatch' && ((r.triggering_actor || r.actor || {}).login === BOT));
/** Partita davvero: almeno un job ha eseguito un passo. Una corsa annullata in attesa non ha job (o job senza passi). */
export const avviata = r => !!r._avviata;
const viva = r => !(r.status === 'completed' && r.conclusion === 'cancelled' && !avviata(r));

/**
 * LA DECISIONE di un giro del custode.
 * runs: corse di verifica-guardiani.yml (oggetti dell'API, con `_avviata` calcolato dal chiamante per le annullate);
 * mia: id della corsa avviata da questo custode (o null); dal: inizio della notte (ISO).
 * → { azione: 'fatto'|'aspetta'|'accoda', perche, mia }
 */
export function decidi({ runs, mia, dal }) {
  if (mia != null) {
    const r = runs.find(x => x.id === mia);
    if (!r) return { azione: 'aspetta', perche: `corsa ${mia} avviata, non ancora nell'elenco`, mia };
    if (r.status === 'in_progress') return { azione: 'fatto', perche: `treno grande ${mia} partito`, mia };
    if (r.status !== 'completed') return { azione: 'aspetta', perche: `treno grande ${mia} in attesa (${r.status})`, mia };
    if (viva(r) || NO()) return { azione: 'fatto', perche: `treno grande ${mia} finito (${r.conclusion})${NO() && !viva(r) ? ' — CPM_NO_G330=1: annullato in attesa e NON rimesso in coda' : ''}`, mia };
    mia = null;/* annullato prima di partire: scalzato dal posto in attesa → si rimette in coda (sotto) */
  }
  const stanotte = runs.filter(r => eNotte(r) && r.created_at >= dal && viva(r));
  const partito = stanotte.find(r => r.status === 'in_progress' || r.status === 'completed');
  if (partito) return { azione: 'fatto', perche: `stanotte c'e' gia' il treno grande ${partito.id} (${partito.status}${partito.conclusion ? '/' + partito.conclusion : ''})`, mia: null, treno: partito.id };
  /* un treno grande di stanotte ancora in attesa (avviato da questo custode senza averne letto l'id, o da un custode prima): lo si
     adotta e lo si segue, cosi' se viene scalzato si rimette in coda */
  if (stanotte.length && !NO()) return { azione: 'aspetta', perche: `treno grande ${stanotte[0].id} di stanotte in attesa (${stanotte[0].status}): lo seguo`, mia: stanotte[0].id };
  if (stanotte.length) return { azione: 'fatto', perche: `stanotte c'e' gia' il treno grande ${stanotte[0].id} (${stanotte[0].status})`, mia: null };
  const attesa = runs.filter(r => r.status !== 'completed' && r.status !== 'in_progress');
  if (attesa.length && !NO()) return { azione: 'aspetta', perche: `posto in attesa occupato dalla corsa ${attesa[0].id} (${attesa[0].event}): accodarsi ora la annullerebbe`, mia: null };
  return { azione: 'accoda', perche: attesa.length ? `CPM_NO_G330=1: accodo subito (annullo la corsa ${attesa[0].id} in attesa)` : 'nessuna corsa in attesa: mi accodo', mia: null };
}

/* ---------------------------------------------------------------- API di GitHub (solo nel ciclo vero) */
const API = process.env.GITHUB_API_URL || 'https://api.github.com';
async function gh(metodo, url, corpo) {
  const tok = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  const r = await fetch(API + url, { method: metodo, headers: { Authorization: `Bearer ${tok}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(corpo ? { 'Content-Type': 'application/json' } : {}) }, body: corpo ? JSON.stringify(corpo) : undefined });
  if (!r.ok) throw new Error(`${metodo} ${url}: ${r.status} ${(await r.text()).slice(0, 200)}`);
  return r.status === 204 ? null : r.json();
}
async function corse(repo) {
  const j = await gh('GET', `/repos/${repo}/actions/workflows/${WORKFLOW_TRENO}/runs?per_page=50`);
  const runs = j.workflow_runs || [];
  for (const r of runs) if (r.status === 'completed' && r.conclusion === 'cancelled' && eNotte(r)) {
    const jj = await gh('GET', `/repos/${repo}/actions/runs/${r.id}/jobs?per_page=100`);
    r._avviata = (jj.jobs || []).some(x => (x.steps || []).length > 0);
  }
  return runs;
}

const riassunto = t => { if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, t + '\n'); };
function args() { const a = process.argv.slice(3), o = {}; for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { const k = a[i].slice(2); o[k] = a[i + 1] && !a[i + 1].startsWith('--') ? a[++i] : true; } return o; }

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const cmd = process.argv[2], o = args();
  if (cmd !== 'veglia') { console.error('uso: node tools/custode-notte-330.mjs veglia [--scadenza-min 280] [--entro 05:47] [--passo-s 60] [--ref main] [--esito file.json]'); process.exit(2); }
  const repo = process.env.GITHUB_REPOSITORY, ref = o.ref || process.env.CPM_REF_NOTTE || 'main';
  /* [giro 333] la notte finisce per tutti alle --entro (UTC): il custode di riserva non veglia oltre, e oltre non accoda */
  const scad = scadenza333({ avvio: Date.now(), scadenzaMin: +o['scadenza-min'] || 280, entro: typeof o.entro === 'string' ? o.entro : (process.env.CPM_ENTRO_NOTTE ?? '05:47') })/* CPM_ENTRO_NOTTE='' = avvio a mano: solo la scadenza relativa */, passo = (+o['passo-s'] || 60) * 1000;
  const esito = (e, perche, treno) => { if (!o.esito) return; try { fs.writeFileSync(o.esito, JSON.stringify({ notte: notteDi(Date.now()), esito: e, perche, treno: treno ?? null, custode: process.env.GITHUB_RUN_ID || null, url: process.env.GITHUB_RUN_ID ? `${process.env.GITHUB_SERVER_URL}/${repo}/actions/runs/${process.env.GITHUB_RUN_ID}` : '', scritto: new Date().toISOString() }) + '\n'); } catch (err) { console.log('esito non scritto: ' + err.message); } };
  const dal = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z').toISOString();
  let mia = null, ultimo = '', accodamenti = 0;
  while (true) {
    let d;
    try { d = decidi({ runs: await corse(repo), mia, dal }); } catch (e) { d = { azione: 'aspetta', perche: 'API: ' + e.message, mia }; }
    if (d.perche !== ultimo) { console.log(`${new Date().toISOString()} ${d.azione}: ${d.perche}`); ultimo = d.perche; }
    mia = d.mia;
    if (d.azione === 'fatto') { esito('partito', d.perche, d.treno ?? mia); riassunto(`### Treno grande di notte (custode giro 330): ✅ ${d.perche} · accodamenti ${accodamenti}`); break; }
    /* [giro 333] la scadenza si guarda PRIMA di accodare: un custode di riserva partito a notte finita non avvia nulla */
    if (Date.now() > scad) { const t = `### Treno grande di notte (custode giro 330): ⛔ NON accodato entro la scadenza — ${d.perche}`; console.log('::warning::' + t.slice(4)); esito('non_partito', `non accodato entro le ${new Date(scad).toISOString().slice(11, 16)} UTC — ${d.perche}`, null); riassunto(t); break; }
    if (d.azione === 'accoda') {
      const t0 = new Date(Date.now() - 5000).toISOString();
      try {
        await gh('POST', `/repos/${repo}/actions/workflows/${WORKFLOW_TRENO}/dispatches`, { ref, inputs: { tipo: 'notte' } }); accodamenti++;
        for (let i = 0; i < 12 && mia == null; i++) { await new Promise(r => setTimeout(r, 10000));
          const r = (await corse(repo)).filter(x => eNotte(x) && x.event === 'workflow_dispatch' && x.created_at >= t0).sort((a, b) => a.id - b.id)[0];
          if (r) mia = r.id; }
        console.log(`${new Date().toISOString()} accodato: corsa ${mia ?? 'non ancora trovata'}`);
      } catch (e) { console.log('avvio non riuscito: ' + e.message); }
    }
    await new Promise(r => setTimeout(r, passo));
  }
  process.exit(0);/* mai rosso: l'esito sta nel riepilogo (ogni corsa rossa = una mail al PO) */
}
