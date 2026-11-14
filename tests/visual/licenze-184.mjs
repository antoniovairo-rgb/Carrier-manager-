#!/usr/bin/env node
/* [giro 184 — PO-374, decisione PO 12/11 «Toglierli dal repo»] GUARDIANO LICENZE-184.
   Nessun file ORIGINALE di un pacchetto di terzi (CGTrader, Mixamo, Anderson Rohr): FBX, OBJ/MTL, zip/7z/rar dei pacchetti, BVH,
   uasset, e nessun file coi nomi dei pacchetti Rohr (*_ue5.*, *_iclone.*) in assets/, dist/, dist-web/. Nel gioco entrano solo
   i GLB CONVERTITI. Quattro misure, tutte giudicate:
     (1) albero tracciato da git sotto assets/ (git ls-files);
     (2) cartelle su disco assets/, dist/, dist-web/ — dist/ e dist-web/ si RICOSTRUISCONO qui (tools/build-dist.mjs e --web),
         cosi' non si giudica mai una build vecchia; senza build la misura e' «non giudicata» = rosso;
     (3) sorgenti del gioco (CARRIER-MANAGER-AV.html, src/, sw.js): nessun riferimento ad assets/source/ ne' a un'estensione vietata;
     (4) RETE del browser, GLB acceso, contesto nuovo con service worker bloccato: home, plancia di carriera, partita vera; ogni
         richiesta al server locale e' registrata e nessuna puo' toccare assets/source/ o un'estensione vietata. Copertura: almeno
         3 .glb richiesti nella partita, altrimenti la misura non ha guardato niente (= rosso).
   PROVA DEL ROSSO (CPM_PROVA_ROSSO=1): mette per un istante assets/__prova-licenze-184.fbx e dist-web/assets/__prova-184.zip e,
   nella pagina della partita, una richiesta a assets/source/…/HEAD.fbx: il guardiano DEVE essere rosso su (1)/(2)/(4); i file
   di prova si cancellano sempre (finally). Uscita 1 se il rosso non si vede.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node licenze-184.mjs  ·  CPM_PROVA_ROSSO=1 node licenze-184.mjs
        CPM_184_RETE=0 salta la misura (4) (solo per iterare: dichiarato e uscita 1, perche' non giudicata). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, ROOT } from './lib/harness.mjs';
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';

const ROSSO = !!process.env.CPM_PROVA_ROSSO;
const RETE = process.env.CPM_184_RETE !== '0';
const VIETATE = /\.(fbx|obj|mtl|zip|7z|rar|bvh|uasset)$/i;
const NOMI_PACCHETTO = /(_ue5|_iclone)\.[a-z0-9]+$/i;
const vietato = p => VIETATE.test(p) || NOMI_PACCHETTO.test(p);
const g = []; const ok = m => console.log('  ✓ ' + m); const ko = m => { g.push(m); console.log('  ✗ ' + m); };
console.log(`licenze-184 · braccio ${ROSSO ? 'ROSSO (file di prova)' : 'verde'}`);

const PROVE = [path.join(ROOT, 'assets', '__prova-licenze-184.fbx'), path.join(ROOT, 'dist-web', 'assets', '__prova-184.zip')];
function walk(d, out = []) { if (!fs.existsSync(d)) return out; for (const f of fs.readdirSync(d, { withFileTypes: true })) {
  const p = path.join(d, f.name); if (f.isDirectory()) walk(p, out); else out.push(path.relative(ROOT, p)); } return out; }

try {
  // (2a) build fresche
  for (const a of [[], ['--web']]) {
    try { execFileSync(process.execPath, [path.join(ROOT, 'tools', 'build-dist.mjs'), ...a], { cwd: ROOT, stdio: 'pipe' }); }
    catch (e) { ko(`build-dist ${a.join(' ')} fallita: ${String(e.stderr || e.message).slice(0, 200)}`); }
  }
  if (ROSSO) { fs.writeFileSync(PROVE[0], 'prova'); fs.mkdirSync(path.dirname(PROVE[1]), { recursive: true }); fs.writeFileSync(PROVE[1], 'prova');
    execFileSync('git', ['add', '-N', '-f', path.relative(ROOT, PROVE[0])], { cwd: ROOT }); }
  // (1) tracciati da git
  const trac = execFileSync('git', ['ls-files', 'assets'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  const tv = trac.filter(vietato);
  tv.length ? ko(`git: ${tv.length} file originali tracciati sotto assets/: ${tv.slice(0, 6).join(', ')}${tv.length > 6 ? ' …' : ''}`)
    : ok(`git: ${trac.length} file tracciati sotto assets/, nessun originale`);
  // (2b) disco
  for (const d of ['assets', 'dist', 'dist-web']) {
    const tutti = walk(path.join(ROOT, d));
    if (!tutti.length) { ko(`${d}/: vuota o assente — non giudicata`); continue; }
    const v = tutti.filter(vietato);
    v.length ? ko(`${d}/: ${v.length} file originali: ${v.slice(0, 6).join(', ')}`) : ok(`${d}/: ${tutti.length} file, nessun originale`);
    if (d !== 'assets') { const s = tutti.filter(p => /[\\/]assets[\\/]source([\\/]|$)/.test(p));
      s.length ? ko(`${d}/: contiene assets/source (${s.length} file)`) : ok(`${d}/: nessun file di assets/source`); }
  }
  // (3) sorgenti del gioco
  const srcF = ['CARRIER-MANAGER-AV.html', 'sw.js', ...walk(path.join(ROOT, 'src'))];
  const rif = [];
  for (const f of srcF) { const t = fs.readFileSync(path.join(ROOT, f), 'utf8');
    const m = t.match(/assets\/source\/|["'`(][^"'`()\s]*\.(fbx|obj|mtl|bvh|uasset|zip|7z|rar)["'`?)]/gi);   /* solo NOMI DI FILE fra virgolette: «P.obj» e' codice */ if (m) rif.push(`${f}: ${[...new Set(m)].slice(0, 3).join(', ')}`); }
  rif.length ? ko(`sorgenti: riferimenti a originali o assets/source: ${rif.join(' · ')}`) : ok(`sorgenti: ${srcF.length} file, nessun riferimento ad assets/source o a estensioni vietate`);
  // (4) rete del browser
  if (!RETE) ko('rete: misura saltata (CPM_184_RETE=0) — non giudicata');
  else {
    const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
    const PRO = { id: 'tor', n: 'FC Granata', a: 'GRA', p: 70, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega A' };
    const save = { phase: 'career', player: { name: 'Licenze', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 1, age: 24, ovr: 80,
      tutorialDone: true, campDone: true, jerseyNum: 9, jerseyNumSeason: 4, presidentModalSeason: 4, drawSeen: 4, mercatoSeen: 4, coachPactSeason: 4,
      presentedClub: PRO.id, presentSeason: 0, seasonPledge: { season: 4, tone: 'equilibrato' }, squadRole: 'titolare', club: PRO,
      stats: { 'velocità': 78, tecnica: 78, fisico: 76, 'mentalità': 76, tiro: 80, passaggio: 76, dribbling: 79, posizionamento: 78 },
      form: 80, morale: 72, fatigue: 25, coachTrust: 70, teamChemistry: 60, popularity: 45, bankBalance: 1e6, goals: 0, assists: 0, matches: 0,
      totalMatches: 90, totalGoals: 40, matchHistory: [], contract: { duration: 3, wage: 400000, expiresAtSeason: 8 } } };
    const percorsi = {};
    for (const k of ['home', 'carriera', 'partita']) {
      const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' }); const page = await ctx.newPage();
      await installCdnRoutes(page);
      const req = []; page.on('request', r => { const u = r.url(); if (u.startsWith(`http://localhost:${port}/`)) req.push(decodeURIComponent(new URL(u).pathname)); });
      await page.addInitScript(s => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1;
        if (s) { localStorage.setItem('cpm-v3', JSON.stringify(s)); localStorage.setItem('cpm-intro-seen', '1'); } }, k === 'carriera' ? save : null);
      try {
        if (k === 'partita') {
          await openMatch(page, port, { skipLoadAll: true, name: 'Licenze' });
          await page.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 90000 }).catch(() => {}); await sleep(6000);
          if (ROSSO) { await page.evaluate(() => fetch('./assets/source/cgtrader-soccer-player/originals/HEAD.fbx').catch(() => {})); await sleep(800); }
        } else {
          await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
          await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
          await sleep(1500);
          if (k === 'carriera') { try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 4000 }); } catch (e) {}
            await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 }).catch(() => {}); }
          await sleep(8000);
        }
      } catch (e) { ko(`rete/${k}: percorso interrotto — ${e.message.slice(0, 120)}`); }
      const u = [...new Set(req)]; const glb = u.filter(p => /\.glb$/i.test(p));
      const male = u.filter(p => /\/assets\/source\//.test(p) || vietato(p));
      percorsi[k] = { richieste: u.length, glb: glb.length, male };
      male.length ? ko(`rete/${k}: ${male.length} richieste a originali: ${male.slice(0, 4).join(', ')}`)
        : ok(`rete/${k}: ${u.length} richieste distinte (${glb.length} .glb), nessuna ad assets/source o a un originale`);
      await ctx.close();
    }
    if (!(percorsi.partita && percorsi.partita.glb >= 3)) ko(`rete/partita: copertura insufficiente (${percorsi.partita ? percorsi.partita.glb : 0} .glb < 3) — non giudicata`);
    else ok(`rete/partita: copertura ${percorsi.partita.glb} .glb (corpi e clip convertiti)`);
    await b.close(); srv.close();
  }
} finally {
  if (ROSSO) { try { execFileSync('git', ['rm', '--cached', '-q', '-f', path.relative(ROOT, PROVE[0])], { cwd: ROOT, stdio: 'pipe' }); } catch (e) {}
    for (const p of PROVE) { try { fs.unlinkSync(p); } catch (e) {} } }
}

if (ROSSO) {
  // il rosso deve comparire su git, su assets/, su dist-web/ e sulla rete
  const attesi = [/^git: /, /^assets\/: /, /^dist-web\/: \d+ file originali/, /^rete\/partita: \d+ richieste a originali/];
  const visti = attesi.map(rx => g.some(m => rx.test(m)));
  if (visti.every(Boolean)) { console.log(`✅ licenze-184 · prova del rosso: il guardiano vede (${g.length} rossi, 4/4 misure accese)`); process.exit(0); }
  console.log(`❌ licenze-184 · prova del rosso CIECA su ${attesi.filter((_, i) => !visti[i]).map(String).join(', ')}`); process.exit(1);
}
if (g.length) { console.log(`❌ licenze-184 · ${g.length} rossi`); process.exit(1); }
console.log('✅ licenze-184 verde');
