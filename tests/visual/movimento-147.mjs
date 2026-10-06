#!/usr/bin/env node
/* [7.999.144 PO-123, decisione PO 06/10 «al massimo il 30% fermi prima dell'azione»] GUARDIANO: sonda hl-credibilita (flusso vero, teatro
   acceso, tempo di scena) su 2 partite per braccio; nelle fasi prima dell'azione (hl_intro, hl_move, hl_choose) la quota di compagni e di
   avversari fermi entro 35 m dal pallone. Misurato su 5 partite: verde 10,2% e 9,0%. VERDE: entrambe <= 25%. ROSSO (__CPM_NO_ATTIVI147,
   il respiro di prima): entrambe >= 30% (misurato 34-43%). Uso: node movimento-147.mjs */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const run = (rosso) => {
  const out = `out/movimento-147-${rosso ? 'rosso' : 'verde'}.json`;
  execFileSync(process.execPath, ['hl-credibilita.mjs'], { stdio: 'ignore', env: { ...process.env, CPM_PARTITE: '2', CPM_OUT: out, CPM_ROSSO: rosso ? '__CPM_NO_ATTIVI147' : '' }, timeout: 1500000 });
  const a = JSON.parse(execFileSync(process.execPath, ['hl-credibilita-analisi.mjs', out], { encoding: 'utf8' }));
  return a.primaAzione;
};
const V = run(false), R = run(true);
console.log('verde ' + JSON.stringify(V)); console.log('rosso ' + JSON.stringify(R));
const g = [];
if (!(V.campioniCompagni >= 100 && V.compagniFermi <= 25 && V.avversariFermi <= 25)) g.push('verde: troppi fermi prima dell\'azione ' + JSON.stringify(V));
if (!(R.campioniCompagni >= 100 && R.compagniFermi >= 30 && R.avversariFermi >= 30)) g.push('rosso: il respiro di prima non si vede ' + JSON.stringify(R));
if (g.length) { console.log('❌ movimento-147'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ movimento-147 verde (e il rosso si vede)');
