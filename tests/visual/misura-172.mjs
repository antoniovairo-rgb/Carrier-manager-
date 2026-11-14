#!/usr/bin/env node
/* [giro 172 · PO-369/370] MISURA (non giudica) dell'audio di folla e menu, dal gioco vero: `node misura-172.mjs [rosso]`.
   Scrive out/misura-172-<braccio>.json. Il guardiano audio-172 riusa le stesse funzioni (lib/audio-172.mjs) e le soglie.
   1. livello in partita: letto della folla a regime (impostazioni di default, livello d'avvio 0,30) contro gli effetti di gioco
      (calcio, passaggio, testa, parata, fischio, palo, contrasto), loudness MOMENTANEA (400 ms) dalla registrazione del master;
   2. 100 tocchi di navigazione sulla home → quanti suoni di menu partono;
   3. flusso di una partita vera seedata (?cpmtest): quanti eventi di folla arrivano all'AudioMgr. */
import fs from 'node:fs';
import path from 'node:path';
import { sito, apriSito, registra, aMp3, loud, tocchi, flussoPartita, sleep, ROOT } from './lib/audio-172.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const rosso = process.argv.includes('rosso');
const OUT = path.join(ROOT, 'tests/visual/out'); fs.mkdirSync(OUT, { recursive: true });
export const EFFETTI = ['ball.kick', 'ball.pass', 'ball.header', 'gk.save', 'ref.whistle', 'ball.post', 'ball.bounce'];
export async function misuraLivelli(p, tag) {
  const tmp = path.join(OUT, `m172-${tag}`); fs.mkdirSync(tmp, { recursive: true });
  const letto = loud(aMp3(await registra(p, "AudioMgr.enterMatch(1234)", 16000, { dopo: 'AudioMgr.hushMatch()' }), path.join(tmp, 'letto.mp3')), { salta: 5 });
  const eff = {};
  for (const k of EFFETTI) eff[k] = loud(aMp3(await registra(p, `AudioMgr.play('${k}')`, 2200), path.join(tmp, k + '.mp3')));
  const em = Object.values(eff).map(e => e.m_max).filter(v => v != null).sort((a, b) => a - b);
  const effMed = em.length ? em[em.length >> 1] : null;
  return { letto, effetti: eff, effetti_m_max_mediana: effMed, margine_db: (effMed != null && letto.m_mediana != null) ? +(effMed - letto.m_mediana).toFixed(1) : null };
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const { srv, url } = sito();
  const S = await apriSito(url, { rosso });
  const liv = S.monta ? await misuraLivelli(S.p, rosso ? 'rosso' : 'verde') : null;
  await S.p.evaluate(() => { try { AudioMgr.scene('home'); } catch (_e) {} });
  const t = S.monta ? await tocchi(S.p, 100) : null;
  await S.b.close(); srv.close();
  const fl = await flussoPartita({ extra: rosso ? () => { window.__CPM_NO_G172 = true; } : null });
  const cont = {}; for (const e of fl.flusso) { const k = e.type + (e.outKind ? ':' + e.outKind : '') + (e.hlType ? ':' + e.hlType : ''); cont[k] = (cont[k] | 0) + 1; }
  const durata = fl.flusso.length ? (fl.flusso[fl.flusso.length - 1].ms - fl.flusso[0].ms) / 1000 : 0;
  const o = { braccio: rosso ? 'rosso' : 'verde', livelli: liv, tocchi: t, partita: { finita: fl.finita, risultato: fl.score, eventi: fl.flusso.length, durata_registrata_s: durata, conteggio: cont }, errori: [...S.errs, ...fl.errs] };
  fs.writeFileSync(path.join(OUT, `misura-172-${o.braccio}.json`), JSON.stringify(o, null, 1));
  console.log(JSON.stringify({ letto: liv && liv.letto, effetti_m_max_mediana: liv && liv.effetti_m_max_mediana, margine_db: liv && liv.margine_db, effetti: liv && Object.fromEntries(Object.entries(liv.effetti).map(([k, v]) => [k, [v.m_max, v.picco_db]])), tocchi: t, partita: o.partita, errori: o.errori }, null, 1));
}
