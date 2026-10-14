#!/usr/bin/env node
/* [giro 17 PO-068] CENSIMENTO DEI GESTI SULLE SCENE DEL MOTORE. Il censimento storico (censimento-scene.mjs, gesti-copertura-96) conta le
   varianti di GESTI raggiunte dal CATALOGO scritto: 35/35. Ma in partita vera le scene dell'eroe nascono ormai dai generatori del motore
   (Passo 6, src/04: misurato 55/55 col guardiano catalogo-022), quindi le varianti che il giocatore VEDE sono quelle raggiunte dai registri
   P6_*. Qui: occasioni sintetiche per ogni tipo (posizioni, pressioni, compagni liberi si/no) x molti semi, piu' i cinque secondi tempi;
   per ogni opzione generata famiglia/variante da deriveHL (la funzione del gioco) e la preparazione (pre) del doppio gesto.
   Stampa le varianti dichiarate in GESTI e quelle raggiunte dal motore. VERDE: raggiunte >= CPM_MIN068 (default: il valore di base
   gesti-motore-068-base.json) e nessuna variante raggiunta dal catalogo assente dal motore fuori dall'elenco dichiarato NON_RAGGIUNGIBILI.
   ROSSO: CPM_ROSSO068=1 → window.__CPM_NO_REG068 (registri del motore senza le opzioni aggiunte nel giro 17): le raggiunte calano. */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const DIR = path.dirname(fileURLToPath(import.meta.url));
const { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } = await import(path.join(DIR, 'lib/harness.mjs'));
const ROSSO = process.env.CPM_ROSSO068 === '1';
const srv = await startServer(); const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
await page.addInitScript((r) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_REG068 = 1; }, ROSSO);
await openMatch(page, srv.address().port, { skipLoadAll: true, name: 'Censimento068' }); await sleep(1500);
const D = await page.evaluate(() => {
  const G = window.__CPM_GESTI(); const vis = {}; const add = (s, a, src) => { let hl = null; try { hl = deriveHL(s, a); } catch (e) { return; } if (!hl || !hl.type) return;
    const vv = (hl.type === 'tackle' && a.defGesto) ? a.defGesto : hl.variant; const k = hl.type + '/' + (vv && G[hl.type] && G[hl.type][vv] ? vv : 'base');
    (vis[k] = vis[k] || new Set()).add(src + ': ' + a.label); if (hl.pre && G.dribble && G.dribble[hl.pre]) (vis['dribble/' + hl.pre] = vis['dribble/' + hl.pre] || new Set()).add(src + ' (pre): ' + a.label); };
  const nomi = { ricevente: { nome: 'Leo SPENCER' }, difensore: { nome: 'Max BAILEY' }, portiere: { nome: 'Ian CARR' }, crossatore: { nome: 'Tom HAMMOND' }, portatore: { nome: 'Joe MARSHALL' } };
  const OCC = [];
  for (const press of [0, 0.8, 1.6, 2.6, 3.4]) for (const liberi of [0, 2]) {
    OCC.push({ tipo: 'conclusione', zona: 'area', x: 88, y: 50, press, liberi }, { tipo: 'conclusione', zona: 'limite', x: 80, y: 40, press, liberi });
    OCC.push({ tipo: 'spalle', zona: 'area', x: 87, y: 55, press: press + 3, liberi }, { tipo: 'spalle', zona: 'limite', x: 79, y: 45, press: press + 3, liberi });
    OCC.push({ tipo: 'fascia', zona: 'trequarti', x: 72, y: 15, press, liberi }, { tipo: 'fra-le-linee', zona: 'trequarti', x: 70, y: 50, press, liberi });
    OCC.push({ tipo: 'cross', zona: 'area', x: 90, y: 48, press, liberi: 0 }, { tipo: 'angolo', zona: 'area', x: 90, y: 52, press, liberi: 0 });
    OCC.push({ tipo: 'difesa', zona: 'trequarti', x: 72, y: 50, press, liberi }, { tipo: 'difesa', zona: 'centro', x: 50, y: 50, press, liberi });
    OCC.push({ tipo: 'punizione', zona: 'limite', x: 78, y: 50, press: 0, liberi }, { tipo: 'punizione', zona: 'trequarti', x: 66, y: 25, press: 0, liberi }, { tipo: 'rigore', zona: 'area', x: 88, y: 50, press: 0, liberi: 0 });
  }
  let scene = 0; const ND = new Set();
  for (const o0 of OCC) for (let sd = 1; sd <= 60; sd++) { const o = { ...o0, cast: nomi, origine: o0.tipo === 'cross' || o0.tipo === 'angolo' ? { kind: o0.tipo, chi: nomi.crossatore } : null };
    let s = null; try { s = scenaDalMotore(o, { stats: {}, foot: 'R' }, sd * 2654435761 >>> 0); } catch (e) {} if (!s) continue; scene++; for (const a of s.actions) { add(s, a, o.tipo); try { if (!azioneDisegnabile(a)) ND.add(o.tipo + ': ' + a.label); } catch (e) {} } }
  for (const k of Object.keys(CHAIN_SITS)) for (let sd = 1; sd <= 60; sd++) { let s = null; try { s = scenaSecondoTempo({ ...CHAIN_SITS[k], _chainDepth: 1 }, nomi, { stats: {} }, sd * 40503 >>> 0); } catch (e) {} if (!s) continue; scene++; for (const a of s.actions) add(s, a, 'seguito/' + k); }
  const cat = new Set(); for (const s of SITUATIONS) for (const a of (s.actions || [])) { let hl = null; try { hl = deriveHL(s, a); } catch (e) {} if (!hl || !hl.type) continue; const vv = (hl.type === 'tackle' && a.defGesto) ? a.defGesto : hl.variant; cat.add(hl.type + '/' + (vv && G[hl.type] && G[hl.type][vv] ? vv : 'base')); if (hl.pre && G.dribble && G.dribble[hl.pre]) cat.add('dribble/' + hl.pre); }
  const dich = []; for (const f in G) for (const v in G[f]) dich.push(f + '/' + v);
  return { scene, nd: [...ND], dich, cat: [...cat], vis: Object.fromEntries(Object.entries(vis).map(([k, v]) => [k, [...v].slice(0, 3)])) };
});
await b.close(); srv.close();
const dich = D.dich.filter(x => !/\/base$/.test(x)), rag = dich.filter(x => D.vis[x]), mai = dich.filter(x => !D.vis[x]);
const soloCat = mai.filter(x => D.cat.includes(x));
console.log((ROSSO ? 'ROSSO ' : 'VERDE ') + 'scene generate ' + D.scene + ' · varianti dichiarate ' + dich.length + ' · raggiunte dal motore ' + rag.length + ' · dal catalogo ' + dich.filter(x => D.cat.includes(x)).length);
console.log('raggiunte dal motore: ' + rag.map(k => k + ' ← ' + D.vis[k][0]).join('\n  '));
if (D.nd.length) console.log('opzioni NON disegnabili: ' + D.nd.join(' · '));
console.log('MAI raggiunte dal motore (' + mai.length + '): ' + mai.join(', '));
console.log('  di cui raggiunte solo dal catalogo scritto (' + soloCat.length + '): ' + soloCat.join(', '));
fs.mkdirSync(path.join(DIR, 'out'), { recursive: true }); fs.writeFileSync(path.join(DIR, 'out/gesti-motore-068' + (ROSSO ? '-rosso' : '') + '.json'), JSON.stringify({ ...D, rag, mai, soloCat }, null, 1));
if (process.env.CPM_SOLO068 === '1') process.exit(0);
const BF = path.join(DIR, 'gesti-motore-068-base.json'); const base = fs.existsSync(BF) ? JSON.parse(fs.readFileSync(BF, 'utf8')) : null;
if (process.env.CPM_BASE_UPDATE === '1' && !ROSSO) { fs.writeFileSync(BF, JSON.stringify({ raggiunte: rag.length, nonRaggiungibili: soloCat }, null, 1) + '\n'); console.log('base scritta'); process.exit(0); }
if (!base) { console.log('❌ manca la base (CPM_BASE_UPDATE=1)'); process.exit(1); }
if (ROSSO) { const ok = rag.length < base.raggiunte; console.log(ok ? '✅ gesti-motore-068 rosso visibile (' + rag.length + ' < ' + base.raggiunte + ')' : '❌ gesti-motore-068: il rosso non cala (' + rag.length + ')'); process.exit(ok ? 0 : 1); }
const nuove = soloCat.filter(x => !base.nonRaggiungibili.includes(x));
if (D.nd.length) { console.log('❌ gesti-motore-068: opzioni non disegnabili ' + D.nd.join(' · ')); process.exit(1); }
if (rag.length < base.raggiunte || nuove.length) { console.log('❌ gesti-motore-068: raggiunte ' + rag.length + ' (base ' + base.raggiunte + ')' + (nuove.length ? ' · nuove varianti perse dal motore: ' + nuove.join(', ') : '')); process.exit(1); }
console.log('✅ gesti-motore-068 verde (' + rag.length + '/' + dich.length + ')');
