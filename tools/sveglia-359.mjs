#!/usr/bin/env node
/* ============================================================================
   sveglia-359.mjs — IL TRENO GRANDE DI NOTTE NON DIPENDE PIU' SOLO DAL CRON (giro 359, PO-630 riaperta il 25/11)

   Misura (API pubblica, rapporto docs/sviluppo/RAPPORTO-giro359.md): in quattro finestre utili del custode (24/11 01:07 e 02:43 —
   la seconda solo dalle 03:54 —, 25/11 01:07 e 02:43) GitHub ha creato UNA sola corsa «schedule», il 24/11 alle 10:49 UTC, fuori da
   ogni orario. Lo schedule su questo repository va trattato come inaffidabile in se'. Le corse che ci sono SEMPRE la sera sono le
   fini dei treni e dei deploy avviati dai push del PO (misurato: almeno una fra le 20:30 e le 05:47 UTC in ogni notte dal 20 al 25/11).

   La sveglia: il custode (treno-notte-330.yml) si avvia anche con `workflow_run` alla fine di «Treno — …» o «Deploy to GitHub
   Pages». Questo job non avvia il treno: decide se e quando avviare il CUSTODE con `workflow_dispatch` (col GITHUB_TOKEN crea
   sempre una corsa — GitHub, «When GITHUB_TOKEN triggers workflow runs»). Il custode resta l'unico che si accoda nel gruppo
   treno-guardiani, con le sue regole (giro 330: mai annullare una corsa in attesa).
     - dentro la notte (01:07 → 05:47 UTC) e nessun custode di stanotte → avvia il custode subito;
     - la sera (dalle 20:30 UTC) → dorme fino alle 01:09 (dopo il cron: se scatta, la sveglia non fa doppioni), poi ricontrolla;
     - di giorno, o se la notte e' gia' coperta (record «partito», custode di stanotte vivo, un'altra sveglia che dorme) → niente.
   Funzione pura: sveglia({ adesso, runs, mio, rec }) → { azione: 'niente'|'dormi'|'avvia', notte, fino?, perche }
   Comando: node tools/sveglia-359.mjs sveglia [--ref main] [--adesso ISO] [--scala N]   (GH_TOKEN, GITHUB_REPOSITORY; uscita 0 sempre)
            --adesso/--scala solo per il guardiano: orologio finto che parte da --adesso e corre N volte piu' in fretta.
   Rosso del guardiano: CPM_NO_G359=1 = comportamento del giro 333 (solo il cron: la sveglia non fa mai nulla).
   ============================================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { notteDi, ORA_NOTTE, ENTRO, FILE_NOTTE } from './notte-333.mjs';

export const WORKFLOW_CUSTODE = 'treno-notte-330.yml';
export const SERA = '20:30';          // da quest'ora una sveglia puo' dormire fino alla notte (01:07 - 20:30 = 4 h 37 < timeout del job)
export const RISVEGLIO_MIN = 2;       // la sveglia si sveglia alle 01:09: se il cron delle 01:07 scatta, trova il suo custode e non raddoppia
export const RITARDO = '02:43';       // un treno grande avviato dopo l'orario di riserva e' «in ritardo» (pagina di governo)
const BOT = 'github-actions[bot]';
const NO = () => process.env.CPM_NO_G359 === '1';
const min = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
const DAY = 86400000;
const iso = ms => new Date(ms).toISOString();

/** Inizio (01:07) e fine (05:47) della notte «n» (AAAA-MM-GG) in ms. */
export const finestra = n => ({ inizio: Date.parse(`${n}T${ORA_NOTTE}:00Z`), fine: Date.parse(`${n}T${ENTRO}:00Z`) });
/** Una corsa del custode che copre la notte: dal cron o avviata dal bot (sveglia), non annullata. */
const custodeVivo = r => (r.event === 'schedule' || (r.event === 'workflow_dispatch' && (r.triggering_actor || r.actor || {}).login === BOT))
  && !(r.status === 'completed' && r.conclusion === 'cancelled');

export function sveglia({ adesso, runs = [], mio = null, rec = null }) {
  const t = +new Date(adesso);
  if (NO()) return { azione: 'niente', notte: notteDi(t), perche: 'CPM_NO_G359=1: solo il cron (giro 333)' };
  let n = notteDi(t), { inizio, fine } = finestra(n), dentro = t >= inizio && t < fine;
  if (!dentro) { n = notteDi(t + DAY); ({ inizio, fine } = finestra(n)); }
  const sera = inizio - (min(ORA_NOTTE) + 24 * 60 - min(SERA)) * 60000;
  if (!dentro && t < sera) return { azione: 'niente', notte: n, perche: `fuori finestra (${iso(t).slice(11, 16)} UTC): la sveglia arma dalle ${SERA} UTC` };
  if (rec && rec.notte === n && rec.esito === 'partito') return { azione: 'niente', notte: n, perche: `notte ${n} gia' coperta: treno grande partito (registro)` };
  const altri = runs.filter(r => r.id !== mio);
  const cu = altri.find(r => custodeVivo(r) && r.created_at >= iso(sera));
  if (cu) return { azione: 'niente', notte: n, perche: `notte ${n} gia' coperta: custode ${cu.id} (${cu.event}, ${cu.status}${cu.conclusion ? '/' + cu.conclusion : ''})` };
  if (dentro) return { azione: 'avvia', notte: n, perche: `notte ${n} in corso senza custode: lo avvio` };
  const dorme = altri.find(r => r.event === 'workflow_run' && r.status === 'in_progress');
  if (dorme) return { azione: 'niente', notte: n, perche: `un'altra sveglia (${dorme.id}) dorme gia' per la notte ${n}` };
  const fino = inizio + RISVEGLIO_MIN * 60000;
  return { azione: 'dormi', notte: n, fino, perche: `sera: dormo fino alle ${iso(fino).slice(11, 16)} UTC, poi ricontrollo` };
}

/* ---------------------------------------------------------------- API di GitHub (solo nel comando) */
const API = process.env.GITHUB_API_URL || 'https://api.github.com';
async function gh(metodo, url, corpo) {
  const tok = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  const r = await fetch(API + url, { method: metodo, headers: { Authorization: `Bearer ${tok}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(corpo ? { 'Content-Type': 'application/json' } : {}) }, body: corpo ? JSON.stringify(corpo) : undefined });
  if (!r.ok) throw new Error(`${metodo} ${url}: ${r.status} ${(await r.text()).slice(0, 200)}`);
  return r.status === 204 ? null : r.json();
}
async function registro(repo, ref) {
  try { const j = await gh('GET', `/repos/${repo}/contents/${FILE_NOTTE}?ref=${encodeURIComponent(ref)}`); return JSON.parse(Buffer.from(j.content || '', 'base64').toString('utf8')); } catch { return null; }
}
const riassunto = t => { console.log(t); if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, t + '\n'); };
function args() { const a = process.argv.slice(3), o = {}; for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { const k = a[i].slice(2); o[k] = a[i + 1] && !a[i + 1].startsWith('--') ? a[++i] : true; } return o; }

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const o = args();
  if (process.argv[2] !== 'sveglia') { console.error('uso: node tools/sveglia-359.mjs sveglia [--ref main] [--adesso ISO] [--scala N]'); process.exit(2); }
  const repo = process.env.GITHUB_REPOSITORY, ref = o.ref || 'main', mio = +process.env.GITHUB_RUN_ID || null;
  const t0 = Date.now(), base = o.adesso ? Date.parse(o.adesso) : t0, scala = +o.scala || 1, ora = () => base + (Date.now() - t0) * scala;
  for (let giro = 0; giro < 2; giro++) {
    let d;
    try {
      const runs = (await gh('GET', `/repos/${repo}/actions/workflows/${WORKFLOW_CUSTODE}/runs?per_page=50`)).workflow_runs || [];
      d = sveglia({ adesso: ora(), runs, mio, rec: await registro(repo, ref) });
    } catch (e) { riassunto(`### Sveglia della notte (giro 359): ⚠️ API non leggibile — ${e.message}`); break; }
    if (d.azione === 'niente') { riassunto(`### Sveglia della notte (giro 359): niente da fare — ${d.perche}`); break; }
    if (d.azione === 'avvia') {
      try { await gh('POST', `/repos/${repo}/actions/workflows/${WORKFLOW_CUSTODE}/dispatches`, { ref, inputs: { notte: 'true' } }); riassunto(`### Sveglia della notte (giro 359): ✅ custode avviato — ${d.perche}`); }
      catch (e) { riassunto(`### Sveglia della notte (giro 359): ⛔ custode NON avviato — ${e.message}`); }
      break;
    }
    if (giro === 1) { riassunto(`### Sveglia della notte (giro 359): ancora sera dopo il sonno — mi fermo (${d.perche})`); break; }
    console.log(`${iso(ora())} ${d.perche}`);
    await new Promise(r => setTimeout(r, Math.max(0, (d.fino - ora()) / scala)));
  }
  process.exit(0);/* mai rosso: l'esito sta nel riepilogo */
}
