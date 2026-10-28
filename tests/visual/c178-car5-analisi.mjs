#!/usr/bin/env node
/* Collaudo carriera 178 n.5 — analisi offline dei dati raccolti (hl.jsonl, partite.jsonl, post-live.jsonl, overlay*.jsonl, ...). Stampa tabelle per il rapporto. */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const DD = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../docs/collaudi/dati-carriera-178-5');
const rd = f => { try { return fs.readFileSync(path.join(DD, f), 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)); } catch (e) { return []; } };
const HL = rd('hl.jsonl'), PART = rd('partite.jsonl'), POST = rd('post-live.jsonl'), OV = rd('overlay.jsonl'), EF = rd('overlay-effetti.jsonl');
const key = h => (h.stato1 && h.stato1.outcome && h.stato1.outcome.key) || (h.esitoAssente ? '(senza esito)' : '(nessuno)');
const label = h => (h.opz[h.scelta] || '').replace(/ \| /g, ' ').replace(/\s+(DRIBBLING|TECNICA|TIRO|PASSAGG[IO]|FISICO|MENTALIT[AÀ]|VELOCIT[AÀ]|POSIZIONAMENTO)\s*·\s*\d+$/i, '').trim();
const DEF_RX = /Ripieg|Pressing|aggredis|Anticip|Contropiede avversario|Muro|Duello|sfida in scivolata|Chiudi|Copri|Recupera|Contrasto|Respingi|Spazza/i;
const isDef = h => (h.act && h.act.ht === 'tackle') || DEF_RX.test((h.head || '').split(' / ')[0]);
const out = []; const P = s => { out.push(s); console.log(s); };
P(`# Analisi automatica — ${HL.length} highlight, ${PART.length} partite dal vivo, ${OV.length} finestre`);
/* 1. conteggi per tipo di scena */
const tipi = {}; for (const h of HL) { const t = isDef(h) ? 'difensiva' : (h.act && h.act.ht) || '?'; tipi[t] = (tipi[t] || 0) + 1; }
P('\n## Scene per tipo (act.ht o difensiva)\n' + Object.entries(tipi).map(([k, v]) => `- ${k}: ${v}`).join('\n'));
/* 2. DIFESA: per opzione ed esito */
const D = HL.filter(isDef); const byO = {};
for (const h of D) { const l = label(h); const k = key(h); byO[l] = byO[l] || { n: 0, k: {} }; byO[l].n++; byO[l].k[k] = (byO[l].k[k] || 0) + 1; }
P(`\n## DIFESA — ${D.length} scene difensive su ${HL.length} (${(100 * D.length / Math.max(1, HL.length)).toFixed(1)}%)\n| opzione | n | esiti |\n|---|---|---|\n` + Object.entries(byO).sort((a, b) => b[1].n - a[1].n).map(([l, v]) => `| ${l} | ${v.n} | ${Object.entries(v.k).map(([k, c]) => k + ' ' + c).join(', ')} |`).join('\n'));
const tot = {}; for (const h of D) { const k = key(h); tot[k] = (tot[k] || 0) + 1; }
P('\nEsiti totali difesa: ' + Object.entries(tot).map(([k, v]) => `${k} ${v}`).join(' · '));
/* 3. controlli nome-opzione vs esito */
const incoerenze = [];
for (const h of HL) {
  const l = label(h), ex = (h.esito || '') + ' ' + ((h.stato1 && h.stato1.outcome && h.stato1.outcome.text) || ''); const k = key(h);
  if (/senza fallo|pulito|pulita/i.test(l) && (k === 'foul' || /^FALLO|Cartellino/i.test(h.esito || ''))) incoerenze.push({ t: 'nome-vs-esito:fallo', h });
  if (/Tiro|Conclusione|Bordata|Volée|Piazzat|Girata|Colpo|Testa|Rovesciata/i.test(l) && /Assist/i.test((h.esito || '').split(' · ')[0])) incoerenze.push({ t: 'tiro-raccontato-assist', h });
  if (/Filtrante|Uno-due|Lancio|Servi|Appoggio|Scarica|Cross|Passaggio/i.test(l) && /Tiro (fuori|murato)|Conclusione/i.test((h.esito || '').split(' · ')[0])) incoerenze.push({ t: 'passaggio-raccontato-tiro', h });
  if (h.esitoAssente) incoerenze.push({ t: 'esito-assente', h });
  if (h.registrata === false) incoerenze.push({ t: 'scelta-non-registrata', h });
  const goalKey = ['goal'].includes(k); if (goalKey && h.dGolNostri === 0) incoerenze.push({ t: 'esito-gol-senza-punteggio', h });
  if (!goalKey && h.dGolNostri > 0 && !h.esitoAssente) incoerenze.push({ t: 'punteggio-senza-esito-gol', h });
  if (h.dGolLoro > 0) incoerenze.push({ t: 'gol-subito-durante-scena', h });
  const b = h.stato2 && h.stato2.ball; if (goalKey && b && !(b.x >= 96 && Math.abs(b.y - 50) <= 12)) incoerenze.push({ t: 'gol-ma-palla-non-in-porta', h });
  if (!goalKey && k !== '(senza esito)' && b && b.x >= 99 && Math.abs(b.y - 50) <= 6 && b.h < 3) incoerenze.push({ t: 'non-gol-ma-palla-in-rete', h });
}
const ci = {}; for (const x of incoerenze) ci[x.t] = (ci[x.t] || []).concat([`${x.h.tag}#${x.h.n}`]);
P('\n## Incoerenze automatiche (candidati, da guardare uno a uno)\n' + Object.entries(ci).map(([k, v]) => `- ${k}: ${v.length} → ${v.slice(0, 12).join(', ')}`).join('\n'));
/* 4. tempi di tocco */
const tc = HL.filter(h => h.tClick != null); const fast = tc.filter(h => h.tClick < 0.5), slow = tc.filter(h => h.tClick >= 1.5);
P(`\n## Tempi di tocco\n- tocchi entro 0,5 s: ${fast.length} (registrati ${fast.filter(h => h.registrata).length}, non registrati ${fast.filter(h => h.registrata === false).length})\n- tocchi dopo 1,5 s: ${slow.length} (registrati ${slow.filter(h => h.registrata).length}, non registrati ${slow.filter(h => h.registrata === false).length})`);
/* 5. tabellino: assist/gol della scena vs matchHistory */
/* 5. tabellino: gol/assist della scena vs matchHistory */
const righeTab = []; let nTab = 0, gOk = 0, aOk = 0, nameBad = 0, minBad = 0, scoreBad = 0;
for (const pl of POST) {
  const u = pl.ult; if (!u) continue; const tag = `s${u.season}w${u.week}`; const hs = HL.filter(h => h.tag === tag); if (!hs.length) continue; nTab++;
  const gScene = hs.filter(h => key(h) === 'goal').length; const gTab = u.goals || 0; if (gScene === gTab) gOk++;
  const mate = hs.filter(h => h.dGolNostri > 0 && key(h) !== 'goal'); const aTab = u.assists || 0;
  if (mate.length >= aTab) aOk++;
  const given = (u.assistLinks && u.assistLinks.given) || [];
  for (const g of given) { const cand = mate.find(h => (h.head.match(/\b[A-ZÀ-Ù]{3,}\b/g) || []).some(n => n.toLowerCase() === (g.name || '').toLowerCase())); if (!cand) { nameBad++; righeTab.push(`${tag}: assist registrato a ${g.name} al ${g.min}' ma nessuna scena con gol del compagno lo nomina (scene con gol compagno: ${mate.map(h => (h.stato1 && h.stato1.clock) + "' " + ((h.head.match(/\b[A-ZÀ-Ù]{4,}\b/g) || []).filter(n => !/PRESSIONE|DRIBBLING|TECNICA|PASSAGGI?|FISICO|TIRO/.test(n)).slice(0, 3).join('/'))).join('; ') || 'nessuna'})`); } else if (cand.stato1 && cand.stato1.clock != null && Math.abs(cand.stato1.clock - g.min) > 2) { minBad++; righeTab.push(`${tag}: ${g.name} segna al ${cand.stato1.clock}' nella scena, il tabellino dice ${g.min}'`); } }
  const sc = pl.sc; if (sc && (u.homeScore !== (u.isHome ? sc.home : sc.away) && u.homeScore !== sc.home)) scoreBad++;
}
P(`\n## Tabellino vs scene (${nTab} partite con dati)\n- gol dell'eroe: scena = tabellino in ${gOk}/${nTab}\n- assist: scene con gol del compagno >= assist del tabellino in ${aOk}/${nTab}\n- assist con nome del marcatore NON presente nelle scene: ${nameBad}\n- assist con minuto diverso (>2'): ${minBad}\n` + righeTab.slice(0, 40).map(x => '  - ' + x).join('\n'));
fs.writeFileSync(path.join(DD, "analisi-automatica.md"), out.join('\n') + '\n');
