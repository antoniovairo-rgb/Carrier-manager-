#!/usr/bin/env node
/* [giro 394 PO-529] GUARDIANO: il browser del banco non contatta host che il gioco non ha chiesto.
   Decisione PO (18/11): Chromium del banco che si collega a servizi di Google (mtalk, riempimento automatico, aggiornamenti…) → «Spegnerlo».
   Come misura: due bracci sulla STESSA sonda breve (provino aperto con openMatch, poi CPM_SEC394 secondi di partita, default 25):
     - host DEL GIOCO = quelli delle richieste fatte dalla pagina (page.on('request'): localhost + CDN gia' intercettate);
     - host DEL BROWSER = quelli che compaiono nel NetLog del browser (--log-net-log, vede anche il processo browser) e che la
       pagina non ha chiesto, tolto il loopback.
   Verde: braccio con le opzioni di lib/privacy-394.mjs → ZERO host del browser.
   Rosso (prova): braccio con le opzioni di prima (launchBrowser({privacy394:false})) → deve vederne almeno uno, o il guardiano e' CIECO.
   CPM_NO_G394=1 spegne le opzioni anche nel braccio verde: il guardiano deve uscire rosso.
   Nell'immagine cloud /opt/pw-browsers/chromium e' un wrapper che devia gia' GCM e aggiornamenti: qui si chiede il Chromium «come
   distribuito» (CHROMIUM_FULL_AS_SHIPPED=1, letto solo da quel wrapper), cioe' quello che il treno usa su GitHub (CPM_CHROME =
   chromium di Playwright). «Non giudicato» (NetLog vuoto, sonda non arrivata in partita) = rosso. */
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import { privacySpenta394 } from './lib/privacy-394.mjs';
process.env.CHROMIUM_FULL_AS_SHIPPED = '1';
const SEC = +(process.env.CPM_SEC394 || 25);
const LOOP = h => /^(localhost|127\.\d+\.\d+\.\d+|\[::1\]|::1)$/.test(h);
const hostDi = v => { let h = String(v); try { if (/^[a-z][a-z0-9+.-]*:\/\//i.test(h)) return new URL(h).hostname; } catch {}
  return h.replace(/^\[?([^\]]+?)\]?(:\d+)?$/, '$1'); };

function leggiNetLog(file) {
  const txt = fs.readFileSync(file, 'utf8'); let j;
  try { j = JSON.parse(txt); } catch { j = JSON.parse(txt.replace(/,\s*$/, '') + ']}'); }/* chiusura mancante se il browser muore */
  const tipi = Object.fromEntries(Object.entries(j.constants.logEventTypes).map(([k, v]) => [v, k]));
  const hosts = new Map(), ev = j.events || [];
  for (const e of ev) { const p = e.params || {};
    for (const k of ['url', 'original_url', 'host', 'host_port', 'address', 'origin']) if (typeof p[k] === 'string' && p[k]) {
      const h = hostDi(p[k]); if (!h || h === 'null') continue; const t = tipi[e.type] || e.type;
      const r = hosts.get(h) || { n: 0, tipi: new Set() }; r.n++; r.tipi.add(t); hosts.set(h, r); } }
  return { eventi: ev.length, hosts };
}

async function braccio(nome, privacy394) {
  const log = path.join(os.tmpdir(), `netlog-394-${process.pid}-${nome}.json`);
  const srv = await startServer(); const port = srv.address().port;
  const b = await launchBrowser({ args: [`--log-net-log=${log}`, '--net-log-capture-mode=Default'], privacy394 });
  const pg = await b.newPage(); const delGioco = new Set(); pg.on('request', r => { try { delGioco.add(new URL(r.url()).hostname); } catch {} });
  await installCdnRoutes(pg);
  let inPartita = false; try { await openMatch(pg, port, { skipLoadAll: true }); inPartita = true; } catch (e) { console.log(`   [${nome}] openMatch: ${e.message}`); }
  await sleep(SEC * 1000);
  await b.close(); srv.close();
  let nl = { eventi: 0, hosts: new Map() }; try { nl = leggiNetLog(log); } catch (e) { console.log(`   [${nome}] NetLog illeggibile: ${e.message}`); }
  try { fs.unlinkSync(log); } catch {}
  const browser = [...nl.hosts].filter(([h]) => !LOOP(h) && !delGioco.has(h));
  console.log(`── ${nome}: ${nl.eventi} eventi di rete · host del gioco: ${[...delGioco].join(', ') || '—'}`);
  if (browser.length) for (const [h, r] of browser) console.log(`   host del BROWSER: ${h} ×${r.n} (${[...r.tipi].slice(0, 4).join(', ')})`);
  else console.log('   host del browser: nessuno');
  return { giudicato: inPartita && nl.eventi > 0, browser: browser.map(([h]) => h) };
}

console.log(`privacy-394 · sonda ${SEC} s · CPM_CHROME=${process.env.CPM_CHROME || '(Playwright)'}${privacySpenta394() ? ' · CPM_NO_G394=1 (opzioni di prima anche nel verde)' : ''}`);
const V = await braccio('verde (opzioni 394)', true);
const R = await braccio('rosso (opzioni di prima)', false);
const ok = [];
if (!V.giudicato) ok.push('braccio verde NON GIUDICATO (vale rosso)');
else if (V.browser.length) ok.push(`braccio verde: ${V.browser.length} host del browser (${V.browser.join(', ')})`);
if (!R.giudicato) ok.push('braccio rosso NON GIUDICATO (vale rosso)');
else if (!R.browser.length) ok.push('braccio rosso CIECO: con le opzioni di prima non vede nessun host del browser');
if (ok.length) { for (const m of ok) console.log('❌ ' + m); console.log('❌ privacy-394'); process.exit(1); }
console.log(`✅ privacy-394: zero host del browser con le opzioni 394; con quelle di prima ${R.browser.join(', ')}`); process.exit(0);
