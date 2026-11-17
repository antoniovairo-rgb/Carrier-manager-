#!/usr/bin/env node
/* [giro 233 PO-453 «primo avvio leggero»] GUARDIANO avvio-233. Tre misure, tutte giudicate («non giudicato» = rosso):
   (1) BYTE PRIMA DEL MENU — telefono 375x667, primo avvio senza salvataggi, dalla navigazione al menu + 12 s di ozio, rete letta
       dal protocollo del browser (sonda misura-233, server che comprime i testi come un sito statico). Soglie DICHIARATE:
         · sul filo ≤ 3,5 MB (misurato 2,62: pagina 2,5 MB compressa + icona + indice dei volti; prima 52,1)
         · file ≤ 8,5 MB (misurato 7,4: la pagina non compressa pesa 7,3; prima 57,0)
         · modelli 3D (.glb) e capelli richiesti prima che il giocatore tocchi qualcosa: 0 (prima 33 richieste, 49,5 MB)
   (2) INTRO (prima scena 3D di chi comincia; senza ?cpmtest, rete dei modelli rallentata): alla schermata di creazione compare
       la pillola d'avanzamento (data-cpm="avanzamento233"); nel video, finche' il corpo non c'e', la scena e' coperta dalla
       schermata d'attesa (data-cpm="attesa233", percentuale che sale); mai i fantocci di ripiego; poi i corpi veri.
   (3) PARTITA (salvataggio da professionista, ?cpmtest con GLB e attesa 196 accesi, rete dei modelli rallentata), telefono e PC:
       · nessun modello richiesto prima dell'apertura della partita;
       · dall'apertura in poi, a ogni campione con la scena 3D in vista (fase walkout/playing/hl_*, senza schermata d'attesa ne'
         avviso) i corpi sono PRONTI (__CPM_PRONTI196): nessuna scena 3D senza corpi;
       · l'attesa si e' vista, con una percentuale che sale (avanzamento visibile), e finisce coi corpi pronti;
       · 23 corpi CGTrader coi capelli applicati (le texture WebP), nessun PNG dei capelli, nessuna variante slim/stocky;
       · telefono: il file lod0 (16,4 MB) NON si scarica e i modelli della partita stanno sotto 26 MB (misurato 23,3; prima 53);
         PC: il lod0 si scarica (il livello pieno resta dove serve).
   ROSSO window.__CPM_NO_G233 (CPM_PROVA_ROSSO=1): il guardiano DEVE bocciare almeno (1) e (3); esce 0 solo se li boccia.
   Uso: node avvio-233.mjs · CPM_PROVA_ROSSO=1 node avvio-233.mjs · CPM_PARTE=1|2|3 (per iterare: uscita 1, non giudicato) ·
        CPM_FOTO=<cartella> */
import fs from 'node:fs';
import { launchBrowser, installCdnRoutes, sleep, clickByText } from './lib/harness.mjs';
import { mkSave } from './misura-205.mjs';
import { misura, serverGzip } from './misura-233.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const ROSSO = !!process.env.CPM_PROVA_ROSSO, PARTE = process.env.CPM_PARTE || '', FOTO = process.env.CPM_FOTO || '';
const FLAGS = ROSSO ? ['__CPM_NO_G233'] : [];
const SOGLIA_FILO = 3.5 * 1048576, SOGLIA_FILE = 8.5 * 1048576, SOGLIA_PARTITA_TEL = 26 * 1048576;
fs.mkdirSync('out', { recursive: true }); if (FOTO) fs.mkdirSync(FOTO, { recursive: true });
const MB = b => (b / 1048576).toFixed(2);
const esiti = { 1: [], 2: [], 3: [] }; const g = (n, ok, msg) => { esiti[n].push(!!ok); console.log(`  ${ok ? '✓' : '✗'} (${n}) ${msg}`); };
console.log(`avvio-233 · braccio ${ROSSO ? 'ROSSO (__CPM_NO_G233)' : 'verde'}`);
const eModello = u => /\.glb(\?|$)|HEAD_hair_/.test(u);

/* ---------- (1) byte prima del menu ---------- */
if (!PARTE || PARTE === '1') {
  const o = await misura({ percorso: 'nuovo', rete: 'libera', ozio: 12000, flags: FLAGS, fino: 'menu', file: '/CARRIER-MANAGER-AV.html' });
  const R = o.richieste; const filo = R.reduce((s, r) => s + r.filo, 0), file = R.reduce((s, r) => s + r.corpo, 0); const M = R.filter(r => eModello(r.url));
  console.log(`  menu dopo ${(o.T.menu / 1000).toFixed(1)} s · ${R.length} richieste nei primi ${((o.T.menuOzio) / 1000).toFixed(0)} s`);
  g(1, R.length >= 2 && R.some(r => /CARRIER-MANAGER-AV\.html/.test(r.url) && r.corpo > 1e6), `misura valida: la pagina e' stata vista dal protocollo (${R.length} richieste)`);
  g(1, filo <= SOGLIA_FILO, `byte sul filo prima del menu + 12 s: ${MB(filo)} MB (soglia ${MB(SOGLIA_FILO)})`);
  g(1, file <= SOGLIA_FILE, `byte di file prima del menu + 12 s: ${MB(file)} MB (soglia ${MB(SOGLIA_FILE)})`);
  g(1, M.length === 0, `modelli 3D e capelli chiesti senza che il giocatore tocchi nulla: ${M.length} richieste, ${MB(M.reduce((s, r) => s + r.corpo, 0))} MB${M.length ? ' · primo a +' + M[0].t + ' ms: ' + M[0].url : ''}`);
  if (o.errs.length) g(1, false, `errori di pagina: ${o.errs.slice(0, 2).join(' | ')}`);
}

const srv = await serverGzip(); const port = srv.address().port; const browser = await launchBrowser();
/* registra chi chiede i modelli e quando; lenta(MBs) rallenta la rete dal protocollo del browser (i byte arrivano a goccia: la
   percentuale puo' salire davvero) */
async function contesto(schermo, mobile) {
  const ctx = await browser.newContext({ viewport: schermo, serviceWorkers: 'block', ...(mobile ? { isMobile: true, hasTouch: true } : {}) }); const pg = await ctx.newPage(); await installCdnRoutes(pg);
  const rete = { L: [], tappa: 'menu' }; const errs = [];
  pg.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await pg.route(/\/assets\/.*(\.glb|HEAD_hair_[a-z]+\.(png|webp))(\?|$)/, async r => { const u = new URL(r.request().url()).pathname; let b = 0; try { b = fs.statSync('../..' + decodeURIComponent(u)).size; } catch (e) {}
    rete.L.push({ u, b, tappa: rete.tappa }); r.fallback().catch(() => {}); });
  const cdp = await ctx.newCDPSession(pg); await cdp.send('Network.enable');
  const lenta = MBs => cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 20, downloadThroughput: MBs * 1048576, uploadThroughput: 1048576 });
  return { ctx, pg, rete, errs, lenta };
}

/* ---------- (2) intro ---------- */
if (!PARTE || PARTE === '2') {
  const { ctx, pg, rete, errs, lenta } = await contesto({ width: 375, height: 667 }, true);
  await pg.addInitScript(f => { for (const k of f) window[k] = 1; }, FLAGS);
  await pg.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load', timeout: 120000 });
  await pg.waitForFunction(() => /Nuova carriera/.test(document.body.innerText || ''), null, { timeout: 120000 });
  await sleep(1500); rete.tappa = 'creazione'; await lenta(0.6);/* il corpo dell'intro (7 MB) impiega ~12 s: piu' dei 5,5 s oltre i quali, prima, comparivano i fantocci */
  const cl = await clickByText(pg, 'Nuova carriera'); await sleep(900);
  await pg.evaluate(n => { const i = document.querySelector('input[type="text"],input:not([type])'); if (i) { const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(i, n); i.dispatchEvent(new Event('input', { bubbles: true })); } }, 'Avvio');
  const P = []; for (let i = 0; i < 8; i++) { P.push(await pg.evaluate(() => { const e = document.querySelector('[data-cpm="avanzamento233"]'); if (!e) return null; const b = e.getBoundingClientRect(); return { pct: +e.getAttribute('data-pct'), vis: getComputedStyle(e).display !== 'none' && b.width > 40 && b.top >= 0 && b.right <= innerWidth + 1, testo: e.innerText.trim() }; })); await sleep(200); }
  if (FOTO) await pg.screenshot({ path: `${FOTO}/${ROSSO ? 'rosso' : 'verde'}-creazione-pillola.png` });
  const pil = P.filter(Boolean);
  g(2, cl && pil.some(p => p.vis && /3D/.test(p.testo) && /%/.test(p.testo)), `creazione: pillola d'avanzamento visibile ${pil.length}/8 campioni${pil[0] ? ' · «' + pil[0].testo + '»' : ''} · richieste ${rete.L.filter(x => x.tappa === 'creazione').map(x => x.u.split('/').pop()).join(', ') || 'nessuna'}`);
  rete.tappa = 'intro'; const ci = await clickByText(pg, 'INIZIA I PROVINI');
  const C = []; const t0 = Date.now(); let fotoFatta = false;
  while (Date.now() - t0 < 45000) { const s = await pg.evaluate(() => { const a = document.querySelector('[data-cpm="attesa233"]'); const w = window.__CPM_G233 || {}; return { att: !!a, pct: a ? +a.getAttribute('data-pct') : null, glb: !!window.__CPM_INTRO_GLB, fant: !!w.introFantocci, salt: w.introSaltata || null, tela: !!document.querySelector('canvas'), salta: !!document.querySelector('[data-cpm="intro-salta"]') }; }).catch(() => null);
    if (s) { s.t = Date.now() - t0; C.push(s); if (s.att && !fotoFatta && s.t > 1500 && FOTO) { fotoFatta = true; await pg.screenshot({ path: `${FOTO}/${ROSSO ? 'rosso' : 'verde'}-intro-attesa.png` }); } if (s.glb && C.filter(c => c.glb).length > 8) break; if (s.salt) break; } await sleep(200); }
  if (FOTO) await pg.screenshot({ path: `${FOTO}/${ROSSO ? 'rosso' : 'verde'}-intro-corpi.png` });
  const conTela = C.filter(c => c.tela && c.salta); const senza = conTela.filter(c => !c.glb && c.t > 700); const scoperti = senza.filter(c => !c.att); const arr = C.find(c => c.glb);
  const pcts = [...new Set(C.filter(c => c.att).map(c => c.pct))];
  g(2, ci && conTela.length >= 5, `intro: scena 3D osservata (${conTela.length} campioni con la tela)`);
  g(2, !C.some(c => c.fant), `intro: fantocci di ripiego ${C.some(c => c.fant) ? 'COMPARSI' : 'mai comparsi'}`);
  g(2, !!arr && !C.some(c => c.salt), `intro: corpi veri arrivati ${arr ? 'dopo ' + (arr.t / 1000).toFixed(1) + ' s' : 'MAI'}${C.some(c => c.salt) ? ' (video chiuso: ' + C.find(c => c.salt).salt + ')' : ''}`);
  g(2, senza.length >= 3 && scoperti.length === 0, `intro: finche' il corpo manca la scena e' coperta dall'attesa — ${senza.length} campioni senza corpo, ${scoperti.length} scoperti`);
  g(2, pcts.length >= 2 && pcts[pcts.length - 1] > pcts[0], `intro: percentuale dell'attesa che sale: ${pcts.join(' → ') || 'mai vista'}`);
  g(2, arr ? C.filter(c => c.t > arr.t + 600).every(c => !c.att) : false, `intro: arrivati i corpi l'attesa sparisce`);
  if (errs.length) g(2, false, `errori di pagina: ${errs.slice(0, 2).join(' | ')}`);
  await ctx.close();
}

/* ---------- (3) partita ---------- */
async function partita(nome, schermo, mobile) {
  const { ctx, pg, rete, errs, lenta } = await contesto(schermo, mobile);
  await pg.addInitScript(([sv, f]) => { window.__CPM_GLB = true; window.__CPM_T196ON = 1; for (const k of f) window[k] = 1; if (!sessionStorage.getItem('g233')) { sessionStorage.setItem('g233', '1'); localStorage.setItem('cpm-v3', JSON.stringify(sv)); } }, [mkSave(2, 9090), FLAGS]);
  await pg.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await pg.waitForFunction(() => document.getElementById('root')?.children.length > 0, null, { timeout: 90000 }); await lenta(mobile ? 2.5 : 4); await sleep(6000);/* ozio sul menu: il vecchio precaricamento parte a 2,5 s */
  rete.tappa = 'carriera'; try { await pg.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await pg.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(3000);
  const prima = rete.L.filter(x => x.tappa !== 'partita').length; rete.tappa = 'partita';
  for (let a = 0; a < 16; a++) { if (await pg.evaluate(() => typeof window.__CPM_PHASE === 'function')) break; await pg.evaluate(() => { const C = window.__CPM_CAREER; C.dismiss(); if (C.playMatch() === true) return; C.step(); }); await sleep(1500); }
  await pg.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 9090, policy: 'seeded', tickMs: 300 }));
  const C = []; const t0 = Date.now(); let nPronti = 0, fotoA = false;
  while (Date.now() - t0 < 150000) { const s = await pg.evaluate(() => { const q = s => document.querySelector(s); let pr = null; try { const x = window.__CPM_PRONTI196 && window.__CPM_PRONTI196(); pr = x ? (x.pronti ? 'pronti' : x.motivo) : null; } catch (e) { pr = 'err'; }
      const a = q('[data-cpm="attesa196"]'), b = q('[data-cpm="attesa196-barra"]'), pil = q('[data-cpm="avanzamento233"]'); return { ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null, pr, att: !!a, pct: b ? parseFloat(b.style.width) : null, avv: !!q('[data-cpm="avviso3d209"]'), d2: !!window.__CPM_2D196, pil: pil ? +pil.getAttribute('data-pct') : null, pilVis: !!pil && getComputedStyle(pil).display !== 'none' }; }).catch(() => null);
    if (s) { s.t = Date.now() - t0; C.push(s); if (FOTO && !fotoA && (s.att || s.pilVis)) { fotoA = true; await pg.screenshot({ path: `${FOTO}/${ROSSO ? 'rosso' : 'verde'}-${nome}-partita-attesa.png` }); } if (s.avv || s.d2) break; if (s.pr === 'pronti' && /^(playing|hl_)/.test(s.ph || '') && !s.att) { if (++nPronti >= 12) break; } } await sleep(250); }
  await sleep(1500); if (FOTO) await pg.screenshot({ path: `${FOTO}/${ROSSO ? 'rosso' : 'verde'}-${nome}-partita-corpi.png` });
  const aud = await pg.evaluate(() => { try { const x = window.__CPM_CGTRADER_LOD_AUDIT && window.__CPM_CGTRADER_LOD_AUDIT(); return x ? { n: x.avatars, a: x.active, eroe: x.heroLod, capelli: x.nativeHair, leggero: !!window.__CPM_LEGGERO233 } : null; } catch (e) { return { err: String(e.message) }; } });
  await pg.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(false)).catch(() => {});
  const in3D = C.filter(c => /^(walkout|playing|hl_)/.test(c.ph || '') && !c.att && !c.avv); const nudi = in3D.filter(c => c.pr !== 'pronti');
  const pctA = [...new Set(C.filter(c => c.att && c.pct != null).map(c => c.pct))], pctP = [...new Set(C.filter(c => c.pilVis && c.pil != null).map(c => c.pil))]; const visto = C.filter(c => c.att || c.pilVis).length;
  const Lp = rete.L.filter(x => x.tappa === 'partita'); const byte = Lp.reduce((s, x) => s + x.b, 0); const nomi = rete.L.map(x => x.u.split('/').pop());
  console.log(`  [${nome}] fasi: ${C.filter((c, i) => i === 0 || c.ph !== C[i - 1].ph || c.att !== C[i - 1].att || c.pr !== C[i - 1].pr).map(c => `${(c.t / 1000).toFixed(0)}s ${c.ph}${c.att ? ' ATTESA ' + c.pct + '%' : ''} ${c.pr || ''}`).join(' → ').slice(0, 600)}`);
  g(3, prima === 0, `${nome}: modelli chiesti prima dell'apertura della partita: ${prima}${prima ? ' (' + rete.L.filter(x => x.tappa !== 'partita').slice(0, 3).map(x => x.u.split('/').pop()).join(', ') + '…)' : ''}`);
  g(3, Lp.filter(x => /\.glb$/.test(x.u)).length >= 5, `${nome}: modelli chiesti all'apertura della partita: ${Lp.length} file, ${MB(byte)} MB`);
  g(3, in3D.length >= 12 && nudi.length === 0, `${nome}: scena 3D in vista senza corpi pronti: ${nudi.length} campioni su ${in3D.length}${nudi[0] ? ' (primo: ' + nudi[0].ph + ' ' + nudi[0].pr + ')' : ''}`);
  g(3, !C.some(c => c.avv || c.d2), `${nome}: nessun avviso «3D non caricabile» ne' 2D`);
  g(3, visto >= 3 && (pctA.length >= 2 || pctP.length >= 2), `${nome}: avanzamento visibile durante lo scaricamento — ${visto} campioni; pillola ${pctP.join('→') || '-'} · attesa ${pctA.join('→') || '-'}`);
  g(3, !!aud && aud.n === 23 && aud.capelli && aud.capelli.missing === 0, `${nome}: corpi CGTrader ${aud ? aud.n : '?'} · capelli ${aud ? JSON.stringify(aud.capelli) : '?'} · livelli ${aud ? JSON.stringify(aud.a) : '?'}`);
  g(3, !nomi.some(n => /HEAD_hair_.*\.png/.test(n)) && nomi.filter(n => /HEAD_hair_.*\.webp/.test(n)).length >= 1, `${nome}: capelli in WebP (${nomi.filter(n => /HEAD_hair_.*\.webp/.test(n)).length} file), PNG ${nomi.filter(n => /HEAD_hair_.*\.png/.test(n)).length}`);
  g(3, !nomi.some(n => /regular-player-(slim|stocky)/.test(n)), `${nome}: varianti slim/stocky del corpo «regular» non scaricate`);
  const lod0 = nomi.includes('cgtrader-review-lod0-kit-adapter.glb');
  if (mobile) { g(3, !lod0 && aud && aud.leggero, `${nome}: dispositivo leggero — il file lod0 non si scarica (${lod0 ? 'SCARICATO' : 'no'}), l'eroe usa il lod1`); g(3, byte <= SOGLIA_PARTITA_TEL, `${nome}: modelli della partita ${MB(byte)} MB (soglia ${MB(SOGLIA_PARTITA_TEL)})`); }
  else g(3, lod0 && aud && !aud.leggero, `${nome}: schermo grande — il livello pieno lod0 si scarica (${lod0 ? 'si' : 'NO'})`);
  if (errs.length) g(3, false, `${nome}: errori di pagina: ${errs.slice(0, 2).join(' | ')}`);
  await ctx.close();
}
if (!PARTE || PARTE === '3') { await partita('telefono', { width: 375, height: 667 }, true); if (!ROSSO) await partita('pc', { width: 1366, height: 768 }, false); }
await browser.close(); srv.close();

const giud = n => esiti[n].length > 0, verde = n => giud(n) && esiti[n].every(Boolean);
console.log(`  esito: (1) ${giud(1) ? (verde(1) ? 'verde' : 'ROSSO') : 'non giudicato'} · (2) ${giud(2) ? (verde(2) ? 'verde' : 'ROSSO') : 'non giudicato'} · (3) ${giud(3) ? (verde(3) ? 'verde' : 'ROSSO') : 'non giudicato'}`);
if (PARTE) { console.log(`avvio-233 · solo la parte ${PARTE}: NON GIUDICATO (uscita 1)`); process.exit(1); }
if (ROSSO) { const visto = giud(1) && !verde(1) && giud(3) && !verde(3) && giud(2); console.log(visto ? 'avvio-233 · braccio ROSSO: il guardiano boccia il comportamento della 7.999.196 (byte prima del menu e modelli prima della partita) — prova del rosso riuscita' : 'avvio-233 · braccio ROSSO: il guardiano NON ha bocciato — prova del rosso FALLITA'); process.exit(visto ? 0 : 1); }
const ok = verde(1) && verde(2) && verde(3); console.log(ok ? 'avvio-233 · VERDE' : 'avvio-233 · ROSSO'); process.exit(ok ? 0 : 1);
