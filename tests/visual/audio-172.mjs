#!/usr/bin/env node
/* [giro 172 · PO-369 «l'audio del pubblico e' terribile e pure degli effetti sono nel menu» · PO-370 «durante la partita devi dare la
   possibilita' di accedere al setting dell'audio»] GUARDIANO — `npm run audio-172` (costruisce dist-web, poi due bracci).
   SOGLIE (dichiarate prima della correzione, nel rapporto docs/sviluppo/RAPPORTO-giro172.md; nessuna abbassata):
   A. STATICO
      1. i 13 file nuovi sono nel registro, CC0, con pagina/autore/data/sha256 della sorgente (nessun file generato);
      2. peso audio del registro < 6 MB (tetto del giro 149, NON alzato);
      3. LETTO (ogni strato, ogg e mp3): giunto del loop — salto ≤ 1,5 volte il passo tipico fra campioni vicini e |ΔRMS 50 ms| ≤ 1,5 dB;
         fruscio — energia sopra 8 kHz ≤ 1%, sotto 100 Hz ≤ 1%, piattezza spettrale (100-8000 Hz) ≤ 0,025;
         col ROSSO si misura il letto che il rosso suona (brusio sintetico del giro 20);
      4. MENU (suoni che il braccio suona per conferma/finestra/notifiche): durata < 150 ms, energia sopra 8 kHz ≤ 10%;
      5. nel blocco del giro 172 nessun Math.random.
   B. NEL BROWSER, sito servito come GitHub Pages (dist-web, audio vero)
      6. il letto della partita e' quello a grani (due strati, piu' grani in 14 s);
      7. LIVELLO: loudness momentanea del letto a regime ≥ 6 dB sotto la mediana dei massimi degli effetti di gioco;
      8. REATTIVITA': l'occasione alza il letto e accende lo strato caldo; senza eventi per 25 s il letto cala sotto l'avvio; boato e
         livello alto sul gol; «ohh» sul tiro fuori; fischi sul gol subito e sul fallo;
      9. VARIETA': flusso eventi di una PARTITA VERA (seedata, ?cpmtest) suonato 4 volte (~10 minuti di partita) → per ogni evento di
         folla mai lo stesso campione due volte di fila e almeno 2 campioni diversi; piano del letto per 600 s: mai la stessa porzione
         due volte di fila;
     10. MENU: 100 tocchi di navigazione → 0 suoni; un tasto marcato «conferma» e una notifica → suonano (controllo positivo: senza,
         «0 suoni» non giudicherebbe niente); due notifiche a 100 ms → un suono solo; picco in uscita di ogni suono di menu ≤ -18 dBFS.
   C. PARTITA (?cpmtest), telefono 375 px e PC 1280 px
     11. icona audio visibile nella barra in 2D (gioco fluido) e in 3D (highlight); apre il pannello con Pubblico/Effetti/Musica + Muto;
     12. partita in PAUSA col pannello aperto (cronometro fermo 4 s), riparte alla chiusura;
     13. i cursori salvano nelle stesse impostazioni (localStorage 'cpm-audio' = AudioMgr.getCfg) e il Muto pure.
   Bracci: VERDE deve passare tutto; ROSSO (`__CPM_NO_G172`) deve cadere su 3, 4, 6, 7, 8, 9, 10, 11. Verde e rosso stampati per ultimi.
   «Non giudicato» (sonda assente, pagina che non monta, zero eventi di folla, fase mai raggiunta) = rosso.
   Foto in docs/sviluppo/giro172/foto/. */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { sito, apriSito, registra, aMp3, loud, tocchi, flussoPartita, sleep, ROOT } from './lib/audio-172.mjs';
import { launchBrowser, startServer, installCdnRoutes, openMatch } from './lib/harness.mjs';
import { misuraLivelli } from './misura-172.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const AUD = path.join(ROOT, 'assets/audio');
const REG = JSON.parse(fs.readFileSync(path.join(AUD, 'LICENZE.json'), 'utf8'));
const OUT = path.join(ROOT, 'tests/visual/out'); fs.mkdirSync(OUT, { recursive: true });
const FOTO = path.join(ROOT, 'docs/sviluppo/giro172/foto'); fs.mkdirSync(FOTO, { recursive: true });
const SOGLIA = { giuntoRapp: 1.5, giuntoDb: 1.5, sopra8k: 1, sotto100: 1, piatt: 0.025, menuDur: 0.150, menu8k: 10, margine: 6, menuPicco: -18 };
const misuraFile = fl => JSON.parse(execFileSync('python3', ['-I', path.join(ROOT, 'tools/audio-172/misura-file.py'), ...fl.map(f => path.join(AUD, f))]).toString());

/* ---------------- A. statico ---------------- */
const NUOVI = ['sfx/crowd/letto-1', 'sfx/crowd/letto-2', 'sfx/crowd/caldo-1', 'sfx/crowd/caldo-2', 'sfx/crowd/esulta-2', 'sfx/crowd/fischi-2', 'sfx/crowd/ohh-2',
  'sfx/ui/conferma-morbida', 'sfx/ui/apri-morbida', 'sfx/notifications/positiva-morbida', 'sfx/notifications/negativa-morbida', 'sfx/notifications/info-morbida', 'sfx/ui/settimana-morbida'];
const SRCJ = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/audio-149/sorgenti.json'), 'utf8')).sorgenti;
const male = NUOVI.filter(n => { const v = REG.file[n]; return !v || !/CC0/.test(v.sorgente.licenza) || !v.sorgente.pagina || !v.sorgente.autore || !v.sorgente.letta || !/^[0-9a-f]{64}$/.test(v.sorgente.sha256) || !SRCJ[v.sorgente.id] || SRCJ[v.sorgente.id].sha256 !== v.sorgente.sha256; });
const byte = Object.keys(REG.file).reduce((s, n) => s + REG.file[n].formati.reduce((a, f) => a + fs.statSync(path.join(AUD, `${n}.${f}`)).size, 0), 0);
const s09 = fs.readFileSync(path.join(ROOT, 'src/09-audio-scout-anagrafiche.jsx'), 'utf8');
const blocco = (s09.match(/const _g172On=[\s\S]*?function _bedPlan172[\s\S]*?\n  }\n/) || [''])[0] + (s09.match(/\/\/ ---- \[giro 172\] LETTO A GRANI[\s\S]*?function crowdStart/) || [''])[0] + (s09.match(/function tocco\(el\)[\s\S]*?\n  return \{/) || [''])[0];
const statComune = [
  { nome: '1 tredici file nuovi nel registro, CC0, fonte completa (nessun file generato)', ok: male.length === 0, info: `incompleti/assenti ${JSON.stringify(male)}` },
  { nome: '2 peso audio sotto 6 MB (tetto del giro 149, non alzato)', ok: byte < 6 * 1048576, info: `${(byte / 1048576).toFixed(2)} MB (${byte} byte, ${Object.keys(REG.file).length} file)` },
  { nome: '5 nel blocco del giro 172 nessun Math.random', ok: blocco.length > 1500 && !/Math\.random/.test(blocco), info: `blocco ${blocco.length} car.` }];
function statBraccio(rosso) {
  const letti = rosso ? ['sfx/crowd/brusio-folla-korward.wav'] : ['sfx/crowd/letto-1.ogg', 'sfx/crowd/letto-1.mp3', 'sfx/crowd/letto-2.ogg', 'sfx/crowd/letto-2.mp3'];
  const L = misuraFile(letti); const S = SOGLIA;
  const lm = L.filter(m => !(m.giunto_rapporto <= S.giuntoRapp && Math.abs(m.giunto_db) <= S.giuntoDb && m.sopra8k_pct <= S.sopra8k && m.sotto100_pct <= S.sotto100 && m.piattezza <= S.piatt));
  const menu = rosso ? ['sfx/ui/conferma-1.ogg', 'sfx/ui/popup-1.ogg', 'sfx/ui/click-1.ogg', 'sfx/notifications/positiva-1.ogg', 'sfx/notifications/negativa-1.ogg', 'sfx/notifications/info-1.ogg', 'sfx/ui/settimana-1.ogg']
    : ['sfx/ui/conferma-morbida.ogg', 'sfx/ui/apri-morbida.ogg', 'sfx/notifications/positiva-morbida.ogg', 'sfx/notifications/negativa-morbida.ogg', 'sfx/notifications/info-morbida.ogg', 'sfx/ui/settimana-morbida.ogg'];
  const M = misuraFile(menu); const mm = M.filter(m => !(m.durata_s < S.menuDur && m.sopra8k_pct <= S.menu8k));
  const r = x => `${path.basename(x.file)} rapp ${x.giunto_rapporto} ΔdB ${x.giunto_db} >8k ${x.sopra8k_pct}% <100 ${x.sotto100_pct}% piatt ${x.piattezza}`;
  return [
    { nome: '3 letto: giunto senza salto e senza fruscio', ok: lm.length === 0 && L.length > 0, info: L.map(r).join(' | ') },
    { nome: '4 menu: suoni < 150 ms e senza acuti taglienti', ok: mm.length === 0, info: M.map(m => `${path.basename(m.file)} ${Math.round(m.durata_s * 1000)} ms >8k ${m.sopra8k_pct}%`).join(' · ') }];
}

/* ---------------- B. sito ---------------- */
if (!process.env.CPM_NO_BUILD) execFileSync('node', [path.join(ROOT, 'tools/build-dist.mjs'), '--web'], { stdio: 'ignore' });
const FL = await flussoPartita(); /* il flusso degli eventi non dipende dall'audio (misurato: identico verde/rosso, 19 eventi, 0-1) */
const folla = FL.flusso.filter(e => ['CoherenceCheck', 'GoalAgainst', 'GoalHero', 'GoalTeam', 'ActionResolved'].includes(e.type));
async function browser(rosso) {
  const { srv, url } = sito(); const passi = [];
  const S = await apriSito(url, { rosso });
  const p = S.p;
  if (!S.monta) { srv.close(); await S.b.close(); return [{ nome: '6-10 sito', ok: false, info: 'la pagina non monta — NON GIUDICATO' }]; }
  /* 6 */
  const l6 = await p.evaluate(async () => { try { AudioMgr.scene('loading'); AudioMgr.enterMatch(4242); } catch (_e) {} await new Promise(r => setTimeout(r, 14000)); const a = window.__CPM_AUDIO172 ? window.__CPM_AUDIO172() : null; try { AudioMgr.hushMatch(); } catch (_e) {} return a; });
  passi.push({ nome: '6 letto a grani della registrazione vera', ok: !!l6 && l6.on === !rosso && !!l6.letto && l6.letto.g172 && l6.letto.grani >= 2 && new Set(l6.grani.map(g => g.split(':')[0])).size >= 1, info: l6 ? `G172=${l6.on} · letto ${JSON.stringify(l6.letto)} · grani ${JSON.stringify(l6.grani.slice(0, 4))}` : 'sonda assente — NON GIUDICATO' });
  /* 7 */
  const liv = await misuraLivelli(p, rosso ? 'g-rosso' : 'g-verde');
  passi.push({ nome: '7 letto ≥ 6 dB sotto gli effetti di gioco', ok: liv.margine_db != null && liv.margine_db >= SOGLIA.margine, info: `letto M mediana ${liv.letto.m_mediana} LUFS · effetti (max M, mediana) ${liv.effetti_m_max_mediana} · margine ${liv.margine_db} dB` });
  /* 8 */
  const r8 = await p.evaluate(async () => {
    const A = () => window.__CPM_AUDIO172 ? window.__CPM_AUDIO172() : null; if (!A()) return null; const P = k => (A().plays[k] | 0); const o = {};
    try { AudioMgr.scene('loading'); AudioMgr.enterMatch(77); } catch (_e) {} await new Promise(r => setTimeout(r, 1500));
    const L = () => (A().letto ? A().letto.livello : null);
    o.l0 = L(); let a = P('crowd.swell'); AudioMgr.event({ type: 'ActionResolved', hlType: 'shot' }); o.lOcc = L(); o.swell = P('crowd.swell') - a;
    await new Promise(r => setTimeout(r, 25000)); o.lMorto = L();
    a = P('crowd.roar'); AudioMgr.event({ type: 'GoalHero' }); o.roar = P('crowd.roar') - a; o.lGol = L();
    a = P('crowd.ohh'); AudioMgr.event({ type: 'CoherenceCheck', outKind: 'wide' }); o.ohh = P('crowd.ohh') - a;
    a = P('crowd.boo'); golSubito161('guardiano172'); o.booGA = P('crowd.boo') - a;
    a = P('crowd.boo'); AudioMgr.event({ type: 'CoherenceCheck', outKind: 'foul' }); o.booFallo = P('crowd.boo') - a;
    try { AudioMgr.hushMatch(); } catch (_e) {} return o;
  });
  const ok8 = !!r8 && r8.lOcc > r8.l0 && r8.swell === 1 && r8.lMorto < r8.l0 && r8.roar === 1 && r8.lGol >= 0.8 && r8.ohh === 1 && r8.booGA === 1 && r8.booFallo === 1;
  passi.push({ nome: '8 reattivita\': occasione · calo nei momenti morti · gol · fuori · gol subito · fallo', ok: ok8, info: r8 ? JSON.stringify(r8) : 'sonda assente — NON GIUDICATO' });
  /* 9 */
  const r9 = await p.evaluate(async (folla) => {
    const A = () => window.__CPM_AUDIO172 ? window.__CPM_AUDIO172() : null; if (!A()) return null;
    const base = A().scelte.length; const seq = [];
    for (let giro = 0; giro < 4; giro++) { try { AudioMgr.enterMatch(9000 + giro * 17); } catch (_e) {} for (const e of folla) { AudioMgr.event(e); await new Promise(r => setTimeout(r, 30)); } try { AudioMgr.hushMatch(); } catch (_e) {} }
    const sc = A().scelte.slice(base); const per = {}; for (const x of sc) { const [k, i] = x.split(/:(?=\d+$)/); (per[k] = per[k] || []).push(+i); }
    const lens = [20, 11]; const piano = A().piano(9000, 120, lens); let t = 0, n = 0, dop = 0; for (let j = 0; j < piano.length && t < 600; j++) { t += piano[j].d; n++; if (j) { const a = piano[j - 1], b = piano[j]; if (a.li === b.li) { const d = Math.abs(a.o - b.o), dc = Math.min(d, lens[a.li] - d); if (dc < 4) dop++; } } }
    return { per, piano: { grani10min: n, porzioniRipetuteDiFila: dop, strati: [...new Set(piano.map(g => g.li))] } };
  }, folla).catch(e => ({ err: String(e).slice(0, 100) }));
  let dop9 = 0, poveri = []; const det = {};
  if (r9 && r9.per) for (const [k, v] of Object.entries(r9.per)) { let d = 0; for (let j = 1; j < v.length; j++) if (v[j] === v[j - 1]) d++; dop9 += d; const u = new Set(v).size; if (v.length >= 2 && u < 2) poveri.push(k); det[k] = `${v.length} volte, ${u} campioni, ${d} di fila`; }
  const giud9 = r9 && r9.per && Object.values(r9.per).reduce((a, v) => a + v.length, 0) >= 8;
  passi.push({ nome: '9 varieta\' su ~10 minuti di partita vera (4 partite): mai lo stesso campione di fila, letto mai la stessa porzione', ok: !!giud9 && dop9 === 0 && poveri.length === 0 && r9.piano && r9.piano.porzioniRipetuteDiFila === 0 && r9.piano.grani10min > 0,
    info: r9 ? `${JSON.stringify(det)} · letto in 10 min: ${r9.piano ? JSON.stringify(r9.piano) : 'piano assente (un solo file in loop)'}${giud9 ? '' : ' · meno di 8 suoni di folla: NON GIUDICATO'}` : 'sonda assente' });
  /* 10 */
  await p.evaluate(() => { try { AudioMgr.scene('home'); } catch (_e) {} });
  const t10 = await tocchi(p, 100);
  const nav = Object.entries(t10.suoni).filter(([k]) => /^(ui|notify|week)\./.test(k)).reduce((a, [, v]) => a + v, 0);
  const pos = await p.evaluate(async () => {
    /* si contano i nomi CHIAMATI (ui.confirm, notify.pos...): col verde il file suona sotto l'alias «…172» e il contatore registra
       entrambi i nomi — sommarli contava due volte lo stesso suono (misurato: 2 al posto di 1) */
    const P = () => { const x = window.__CPM_AUDIO149().plays; return Object.keys(x).filter(k => /^(ui|notify|week)\./.test(k) && !/172$/.test(k)).reduce((a, k) => a + x[k], 0); };
    const b = document.createElement('button'); b.setAttribute('data-suono', 'conferma'); b.textContent = 'Conferma'; document.body.appendChild(b);
    await new Promise(r => setTimeout(r, 600)); let a = P(); b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); const conf = P() - a; b.remove();
    await new Promise(r => setTimeout(r, 600)); a = P(); AudioMgr.notifyCue('✅ Firma il contratto'); const notif = P() - a;
    await new Promise(r => setTimeout(r, 600)); a = P(); AudioMgr.notifyCue('Info'); await new Promise(r => setTimeout(r, 100)); AudioMgr.notifyCue('Info 2'); const raffica = P() - a;
    return { conf, notif, raffica };
  });
  const picchi = {}; for (const k of ['ui.confirm', 'ui.popup', 'notify.pos', 'notify.neg', 'notify.info']) picchi[k] = loud(aMp3(await registra(p, `AudioMgr.play('${k}')`, 900), path.join(OUT, `m172-${rosso ? 'r' : 'v'}-${k}.mp3`))).picco_db;
  const pk = Object.values(picchi).filter(v => v != null); const pkMax = pk.length ? Math.max(...pk) : null;
  passi.push({ nome: '10 menu: niente suono sulla navigazione, sì sulle conferme e notifiche, mai a raffica, volume basso', ok: t10.sonda && t10.elementi > 0 && t10.tocchi === 100 && nav === 0 && pos.conf === 1 && pos.notif === 1 && pos.raffica === 1 && pk.length === 5 && pkMax <= SOGLIA.menuPicco,
    info: `100 tocchi di navigazione (su ${t10.elementi} elementi non marcati; ${t10.marcati} marcati esclusi) → ${nav} suoni ${JSON.stringify(t10.suoni)} · tasto «conferma» ${pos.conf} · notifica ${pos.notif} · due notifiche a 100 ms ${pos.raffica} · picchi in uscita ${JSON.stringify(picchi)}` });
  passi.push({ nome: '  errori di pagina (sito)', ok: S.errs.length === 0, info: JSON.stringify(S.errs.slice(0, 3)) });
  await S.b.close(); srv.close(); return passi;
}

/* ---------------- C. partita: icona, pannello, pausa, salvataggio ---------------- */
async function partita(rosso, vp, tag) {
  const s = await startServer(); const port = s.address().port; const b = await launchBrowser();
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2, isMobile: vp.width < 500, hasTouch: vp.width < 500 }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  await page.addInitScript((r) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G172 = true; }, rosso);
  const o = { tag };
  try {
    await openMatch(page, port, { skipLoadAll: true, name: 'Au' });
    o.fase2D = await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing' && (window.__CPM_CLOCK() | 0) >= 2, null, { timeout: 60000, polling: 300 }).then(() => true).catch(() => false);
    const ico = '[data-cpm="audio-partita"]';
    o.icona2D = o.fase2D && await page.locator(ico).first().isVisible().catch(() => false);
    if (o.icona2D) {
      await page.screenshot({ path: path.join(FOTO, `${tag}-2d-icona.png`) });
      const c0 = await page.evaluate(() => window.__CPM_PHASE() + '@' + window.__CPM_CLOCK());
      await page.locator(ico).first().click();
      await sleep(600);
      o.pannello = await page.locator('[data-cpm="audio-pannello"]').isVisible().catch(() => false);
      o.cursori = await page.evaluate(() => ['crowd', 'match', 'music'].filter(k => document.querySelector(`[data-cpm="audio-${k}"]`)).length + (document.querySelector('[data-cpm="audio-muto"]') ? 1 : 0));
      /* lo stato della partita = (fase, minuto): negli highlight il cronometro e' fermo per costruzione, quindi «pausa» vuol dire che
         NESSUNO dei due si muove col pannello aperto, e «riparte» che almeno uno si muove dopo la chiusura (misurato: aprendo al 3'
         parte un highlight, che resta in hl_intro per tutta la pausa e passa a hl_choose alla chiusura) */
      const st = () => page.evaluate(() => window.__CPM_PHASE() + '@' + window.__CPM_CLOCK());
      const c1 = await st(); await sleep(4000); const c2 = await st();
      o.pausa = { prima: c0, apertura: c1, dopo4s: c2, ferma: c2 === c1 };
      await page.screenshot({ path: path.join(FOTO, `${tag}-pannello-aperto${rosso ? '-rosso' : ''}.png`) });
      /* salvataggio: cursore Pubblico a 37, Muto acceso → localStorage e getCfg uguali */
      await page.evaluate(() => { const set = (el, v) => { const d = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; d.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }; set(document.querySelector('[data-cpm="audio-crowd"]'), '37'); });
      await page.locator('[data-cpm="audio-muto"]').click(); await sleep(300);
      o.salvato = await page.evaluate(() => { const j = JSON.parse(localStorage.getItem('cpm-audio') || 'null'); const c = AudioMgr.getCfg(); return { ls: j && { crowd: j.vol.crowd, mute: j.mute }, cfg: { crowd: c.vol.crowd, mute: c.mute } }; });
      await page.locator('[data-cpm="audio-muto"]').click(); await sleep(200);
      await page.locator('[data-cpm="audio-chiudi"]').click(); await sleep(400);
      o.chiuso = !(await page.locator('[data-cpm="audio-pannello"]').isVisible().catch(() => false));
      const cambia = (ms) => page.waitForFunction((c) => (window.__CPM_PHASE() + '@' + window.__CPM_CLOCK()) !== c, c2, { timeout: ms, polling: 300 }).then(() => true).catch(() => false);
      o.riparte = await cambia(6000);
      /* in hl_choose la partita aspetta la scelta del giocatore: la fa l'autoplay (che col pannello aperto e la pausa non agisce), e la
         fase deve avanzare. Senza questo, aprire il pannello durante una scelta dava un «non giudicato» (misurato sul PC) */
      if (!o.riparte && /^hl_choose@/.test(c2)) { o.sceltaAutoplay = true; await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 3, policy: 'seeded', tickMs: 300 })); o.riparte = await cambia(15000); await page.evaluate(() => window.__CPM_AUTOPLAY(false)).catch(() => {}); }
    }
    o.fase3D = await page.waitForFunction(() => /^hl_/.test(window.__CPM_PHASE && window.__CPM_PHASE()), null, { timeout: 90000, polling: 300 }).then(() => true).catch(() => false);
    o.icona3D = o.fase3D && await page.locator(ico).first().isVisible().catch(() => false);
    if (o.fase3D) await page.screenshot({ path: path.join(FOTO, `${tag}-3d-icona${rosso ? '-rosso' : ''}.png`) });
    if (o.icona3D && !rosso) { await page.locator(ico).first().click(); await sleep(500); o.pannello3D = await page.locator('[data-cpm="audio-pannello"]').isVisible().catch(() => false); await page.screenshot({ path: path.join(FOTO, `${tag}-3d-pannello.png`) }); await page.locator('[data-cpm="audio-chiudi"]').click().catch(() => {}); }
  } catch (e) { errs.push('flusso: ' + String(e.message).slice(0, 100)); }
  await b.close(); s.close();
  const sv = o.salvato; const okS = !!sv && sv.ls && sv.ls.crowd === 0.37 && sv.cfg.crowd === 0.37 && sv.ls.mute === true && sv.cfg.mute === true;
  return [
    { nome: `11 [${tag}] icona in 2D e in 3D, pannello Pubblico/Effetti/Musica + Muto`, ok: !!o.icona2D && !!o.icona3D && !!o.pannello && o.cursori === 4 && (rosso || !!o.pannello3D), info: `2D: fase ${o.fase2D} icona ${o.icona2D} · pannello ${o.pannello} (${o.cursori}/4 comandi) · 3D: fase ${o.fase3D} icona ${o.icona3D} pannello ${o.pannello3D}${!o.fase2D || !o.fase3D ? ' · fase mai raggiunta: NON GIUDICATO' : ''}` },
    { nome: `12 [${tag}] pausa col pannello aperto, ripresa alla chiusura`, ok: !!o.pausa && o.pausa.ferma && o.chiuso && o.riparte, info: `${JSON.stringify(o.pausa || null)} · chiuso ${o.chiuso} · riparte ${o.riparte}${o.sceltaAutoplay ? ' (scelta fatta dall\'autoplay)' : ''}` },
    { nome: `13 [${tag}] cursori e Muto salvati nelle stesse impostazioni`, ok: okS, info: JSON.stringify(sv || null) },
    { nome: `   [${tag}] errori di pagina`, ok: errs.length === 0, info: JSON.stringify(errs.slice(0, 3)) }];
}

const out = {};
for (const rosso of [false, true]) {
  const nomeB = rosso ? 'ROSSO' : 'VERDE';
  out[nomeB] = [...statBraccio(rosso), ...await browser(rosso), ...await partita(rosso, { width: 375, height: 812 }, 'tel375'), ...await partita(rosso, { width: 1280, height: 800 }, 'pc1280')];
}
console.log(`flusso della partita vera (seme 7300): ${FL.flusso.length} eventi, ${folla.length} verso la folla, finita ${FL.finita}, risultato ${JSON.stringify(FL.score)}`);
console.log('A. STATICO (comune)'); for (const x of statComune) console.log(`  ${x.ok ? '✓' : '✗'} ${x.nome} — ${x.info}`);
for (const k of ['VERDE', 'ROSSO']) { console.log(`braccio ${k}${k === 'ROSSO' ? ' (__CPM_NO_G172 = audio di prima)' : ''}`); for (const x of out[k]) console.log(`  ${x.ok ? '✓' : '✗'} ${x.nome} — ${x.info}`); }
const verde = FL.finita && folla.length > 0 && statComune.every(x => x.ok) && out.VERDE.every(x => x.ok);
const deveCadere = /^(3|4|6|7|8|9|10|11) /;
const R = out.ROSSO.filter(x => deveCadere.test(x.nome.replace(/^\s*/, '').replace(/^(\d+) \[[^\]]+\]/, '$1')));
const rossoCade = R.length >= 8 && R.every(x => !x.ok);
fs.writeFileSync(path.join(OUT, 'audio-172.json'), JSON.stringify({ flusso: { n: FL.flusso.length, folla: folla.length, finita: FL.finita, score: FL.score }, statComune, ...out }, null, 1));
console.log(`VERDE: ${verde ? 'PASSA' : 'NON PASSA'}`);
console.log(`ROSSO: ${rossoCade ? 'CADE (come deve) su 3, 4, 6, 7, 8, 9, 10, 11' : 'NON CADE come deve — il guardiano e\' cieco: ' + R.filter(x => x.ok).map(x => x.nome).join(' | ')}`);
process.exit(verde && rossoCade ? 0 : 1);
