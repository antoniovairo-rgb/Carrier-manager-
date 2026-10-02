#!/usr/bin/env node
// Riesamina le osservazioni del collaudo carriere 7.999.94 senza avviare Chromium.
// CPM_OLD_CAREERS indica il JSON grezzo salvato sul precedente ramo codex.
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';

const source = process.env.CPM_OLD_CAREERS;
if (!source || !fs.existsSync(source)) throw new Error('Impostare CPM_OLD_CAREERS al grezzo carriere-fase1-sintetiche-a.json');
const old = JSON.parse(fs.readFileSync(source, 'utf8'));
const bySeed = new Map(old.careers.map(c => [c.seed, c]));
const rows = old.anomalies.filter(a => a.type === 'contract').map(a => {
  const c = bySeed.get(a.seed);
  const expiry = Number(/expiresAtSeason=(\d+)/.exec(a.observed)?.[1]);
  const action = c?.contractActions.find(x => x.before?.season === a.season && x.before?.week === a.week);
  return {
    seed: a.seed, season: a.season, week: a.week,
    expiresAtSeason: Number.isFinite(expiry) ? expiry : null,
    proStatus: 'pro', // il banco registrava questo tipo solo nel ramo s.proStatus==='pro'
    pendingOffer: null, // il grezzo non cattura la lista delle offerte a ogni passo
    renewalActionAtSameStep: action?.action ?? null,
    observation: a.observed,
    sourceVersion: old.version,
  };
});
const keys = rows.map(r => `${r.seed}|${r.season}|${r.week}`);
const out = {
  source, sourceVersion: old.version, sourceCommit: old.commit,
  command: 'node tests/codex/banco-contratti.mjs (CPM_OLD_CAREERS=<percorso JSON precedente>)',
  count: rows.length, distinctSeedSeasonWeek: new Set(keys).size,
  repeatedSameStepObservable: false,
  note: 'Il banco precedente deduplicava per seme/stagione/settimana/tipo: ripetizioni nello stesso passo non sono ricostruibili. pendingOffer non era registrato.',
  rows,
};
const dst = path.resolve('tests/codex/banco-contratti-vecchi.json.gz');
fs.writeFileSync(dst, zlib.gzipSync(JSON.stringify(out)));
console.log(JSON.stringify({ output: dst, count: out.count, distinctSeedSeasonWeek: out.distinctSeedSeasonWeek, bySeed: Object.entries(Object.groupBy(rows, r => r.seed)).map(([seed, a]) => [seed, a.length]) }));
