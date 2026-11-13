#!/usr/bin/env node
/* [giro 187] SONDA (non guardiano): per quali nomi la partita della settimana di solo-highlight-166 ha l'intervista «a sorpresa»
   del giro 183? Apre la carriera sintetica di partita-166 (la settimana e l'avversario non dipendono dal nome: calendario seedato
   su stagione+club) e calcola nella pagina, con hashStr del gioco, la stessa condizione di intervista183 (src/07):
   hashStr(nome|stagione|settimana|avversario|sorpresa183) % 8 === 0. Stampa i nomi candidati; la verifica vera la fa il guardiano. */
import { apriCarriera166 } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const A = await apriCarriera166({ nome: 'Collaudo Salienti' });
const r = await A.page.evaluate(() => { const md = window.__CPM_CAREER.thisWeekMd(); const p = JSON.parse(localStorage.getItem('cpm-v3') || '{}').player || {};
  const nomi = ['Collaudo Salienti', ...Array.from({ length: 60 }, (_, i) => 'Collaudo Sorpresa ' + (i + 1))];
  return { md, season: p.season, week: p.week, si: nomi.filter(n => hashStr(n + '|' + (p.season || 1) + '|' + (md && md.week || p.week || 1) + '|' + (md && md.opp || '') + '|sorpresa183') % 8 === 0) }; });
console.log(JSON.stringify(r)); await A.b.close(); A.srv.close();
