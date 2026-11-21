#!/usr/bin/env node
/* [giro 314 · PO-601 «nella serata di presentazione non ci devono essere tifosi ospiti»] GUARDIANO NON-gate serata-314, GLB acceso,
   di notte (__CPM_TOD=night), sulla serata vera aperta dalla carriera (stesso salvataggio di presentazione-142, club verde con secondo
   colore salmone come nella foto del PO).
   CAUSA MISURATA: la serata chiamava buildStadium(scene, colore del club, SECONDO colore del club) senza pubblico dichiarato: la Curva Nord
   e lo spicchio della Tribuna Est uscivano come settore OSPITI, col secondo colore e riempiti a 0,5.
   Si legge la folla a sagome che la scena ha costruito davvero (mesh «folla129»: una istanza per tifoso, con posizione, bandiera
   «di casa» e colore della maglia) e si contano le sagome, per settore e per colore:
     1) OSPITI      quota di sagome non «di casa» su tutta la folla                       verde = 0        rosso >= OSP_ROSSO
     2) COLORE      nella Curva Nord, quota di maglie col SECONDO colore del club          verde <= C2_MAX  rosso >= C2_ROSSO
                    e quota di maglie col colore del club                                  verde >= C1_MIN
     3) PIENO       riempimento della Curva Nord rispetto alla Curva Sud (occupati/posti)  verde >= PIENO   rosso <  PIENO
   Rosso window.__CPM_NO_G314 = la serata della 7.999.200. «Non giudicato» (folla non a sagome, meno di N_MIN sagome, Nord vuota) = rosso.
   Soglie fissate dopo la misura (docs/sviluppo/RAPPORTO-giro314.md), mai da abbassare. Verde e rosso stampati per ultimi.
   Uso: node serata-314.mjs   · CPM_SOLO=verde|rosso (corsa parziale: non vale) · CPM_FOTO=1 scrive le foto prima/dopo in docs/sviluppo/giro314/ */
import fs from 'node:fs';
if (!process.env.CPM_CHROME && fs.existsSync('/opt/pw-browsers/chromium')) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const { startServer, launchBrowser, installCdnRoutes, sleep } = await import('./lib/harness.mjs');
fs.mkdirSync('out/g314', { recursive: true });
const OSP_ROSSO = 0.10, C2_MAX = 0.05, C2_ROSSO = 0.30, C1_MIN = 0.35, PIENO = 0.90, N_MIN = 3000, NORD_MIN = 300;
const SOLO = process.env.CPM_SOLO || '', FOTO = !!process.env.CPM_FOTO;
const CLUB = { id: 'parm', n: 'FC Parmense', a: 'PAR', p: 62, c: '#16a34a', c2: '#f87171', nat: '🇮🇹', lg: 'Lega A' };
const SAVE = { phase: 'career', player: { name: 'Presenta Probe', nation: 'Italia', avatarId: 0, proStatus: 'u18', season: 1, week: 1, age: 16, ovr: 60,
  tutorialDone: true, campDone: true, jerseyNum: 9, jerseyNumSeason: 1, presidentModalSeason: 1, drawSeen: 1, mercatoSeen: 1, coachPactSeason: 1, presentedClub: CLUB.id, presentSeason: 1,
  seasonPledge: { season: 1, tone: 'equilibrato' }, squadRole: 'titolare', club: CLUB,
  stats: { 'velocità': 60, tecnica: 60, fisico: 60, 'mentalità': 60, tiro: 60, passaggio: 60, dribbling: 60, posizionamento: 60 },
  form: 70, morale: 70, fatigue: 20, coachTrust: 60, teamChemistry: 60, popularity: 10, bankBalance: 1000, goals: 0, assists: 0, matches: 0, totalMatches: 0, totalGoals: 0, matchHistory: [],
  contract: { duration: 3, wage: 1000, expiresAtSeason: 4 } } };
const srv = await startServer(), port = srv.address().port, browser = await launchBrowser();

async function braccio(NO) {
  const ctx = await browser.newContext({ viewport: { width: 932, height: 462 }, deviceScaleFactor: FOTO ? 2 : 1 }), page = await ctx.newPage();
  await installCdnRoutes(page);
  await page.addInitScript(([o, no]) => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_TOD = 'night'; for (const k of no) window[k] = 1;
    localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, [SAVE, NO]);
  let out;
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); await sleep(1500);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }); await sleep(1000);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.apriPresentazione(0));
    /* si aspetta la scena con la fila in campo (GLB caricati): dopo quel punto la prova di disegno del giro 225 ha gia' scelto sagome o dipinti */
    await page.waitForFunction(() => window.__CPM_PRES_SCENE && window.__CPM_PRES142 && window.__CPM_PRES142.men && window.__CPM_PRES142.men.length >= 2, null, { timeout: 90000 });
    await page.waitForFunction(() => window.__CPM_PRES142.el > 1.5, null, { timeout: 60000 }).catch(() => {});
    out = await page.evaluate(([c1, c2]) => {
      const S = window.__CPM_PRES_SCENE; let im = null; S.traverse(o => { if (o.name === 'folla129' && o.isInstancedMesh && o.parent) im = o; });
      if (!im) return { errore: 'la serata non ha la folla a sagome (mesh folla129 assente)' };
      const g = im.geometry, iB = g.getAttribute('iB'), cSh = g.getAttribute('cSh'), n = im.count, M = new THREE.Matrix4(), v = new THREE.Vector3();
      const hsv = (r, gg, b) => { const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), d = mx - mn; let h = 0; if (d > 0) { h = mx === r ? ((gg - b) / d) % 6 : mx === gg ? (b - r) / d + 2 : (r - gg) / d + 4; h *= 60; if (h < 0) h += 360; } return [h, mx ? d / mx : 0, mx]; };
      const hx = s => { const k = parseInt(s.slice(1), 16); return hsv((k >> 16 & 255) / 255, (k >> 8 & 255) / 255, (k & 255) / 255); };
      const H1 = hx(c1)[0], H2 = hx(c2)[0], dh = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
      /* settore dalla posizione: le curve stanno oltre le linee di fondo (|x| > 54), le tribune oltre le linee laterali */
      const sett = { nord: { n: 0, osp: 0, c1: 0, c2: 0 }, sud: { n: 0, osp: 0, c1: 0, c2: 0 }, est: { n: 0, osp: 0, c1: 0, c2: 0 }, ovest: { n: 0, osp: 0, c1: 0, c2: 0 } };
      let osp = 0;
      for (let k = 0; k < n; k++) { im.getMatrixAt(k, M); v.setFromMatrixPosition(M);
        const s = v.x < -54 ? sett.nord : v.x > 54 ? sett.sud : v.z > 0 ? sett.est : sett.ovest; s.n++;
        if (iB.getX(k) < 0.5) { osp++; s.osp++; }
        const [h, sa, va] = hsv(cSh.getX(k), cSh.getY(k), cSh.getZ(k));
        if (sa > 0.30 && va > 0.12) { if (dh(h, H1) <= 22) s.c1++; else if (dh(h, H2) <= 22) s.c2++; } }
      const per = (window.__CPM_FOLLA129 || {}).per || {}, rie = {}; for (const k in per) rie[k] = { posti: per[k].slots, occupati: per[k].occ, quota: per[k].slots ? +(per[k].occ / per[k].slots).toFixed(3) : null };
      const q = (a, b) => b ? +(a / b).toFixed(4) : null;
      return { n, ospiti: osp, quotaOspiti: q(osp, n), settori: sett, nordC1: q(sett.nord.c1, sett.nord.n), nordC2: q(sett.nord.c2, sett.nord.n), sudC1: q(sett.sud.c1, sett.sud.n), sudC2: q(sett.sud.c2, sett.sud.n), riempimento: rie, modo: (window.__CPM_PRES192 || null) };
    }, [CLUB.c, CLUB.c2]);
    if (out && !out.errore) { const r = out.riempimento, kN = Object.keys(r).find(k => /nord/i.test(k)), kS = Object.keys(r).find(k => /sud/i.test(k));
      out.fillNord = kN ? r[kN].quota : null; out.fillSud = kS ? r[kS].quota : null; out.pieno = (out.fillNord != null && out.fillSud) ? +(out.fillNord / out.fillSud).toFixed(3) : null; }
    if (FOTO) { fs.mkdirSync('../../docs/sviluppo/giro314', { recursive: true }); await sleep(800); await page.screenshot({ path: `../../docs/sviluppo/giro314/${NO.length ? 'prima' : 'dopo'}-serata-notte.png` }); }
  } catch (e) { out = { errore: String(e.message || e).slice(0, 220) }; }
  await ctx.close();
  const ko = [];
  if (out.errore) ko.push('non giudicato: ' + out.errore);
  else if (!(out.n >= N_MIN && out.settori.nord.n >= NORD_MIN && out.pieno != null)) ko.push(`non giudicato: sagome ${out.n} (minimo ${N_MIN}), Curva Nord ${out.settori.nord.n} (minimo ${NORD_MIN}), riempimento ${out.pieno}`);
  else {
    if (out.ospiti > 0) ko.push(`tifosi OSPITI nella serata: ${out.ospiti} sagome su ${out.n} (${(out.quotaOspiti * 100).toFixed(1)}%), Nord ${out.settori.nord.osp}, Est ${out.settori.est.osp}`);
    if (!(out.nordC2 <= C2_MAX)) ko.push(`Curva Nord col secondo colore: ${(out.nordC2 * 100).toFixed(1)}% delle maglie > ${C2_MAX * 100}%`);
    if (!(out.nordC1 >= C1_MIN)) ko.push(`Curva Nord senza i colori del club: ${(out.nordC1 * 100).toFixed(1)}% delle maglie < ${C1_MIN * 100}%`);
    if (!(out.pieno >= PIENO)) ko.push(`Curva Nord meno piena della Sud: ${out.fillNord} contro ${out.fillSud} (rapporto ${out.pieno} < ${PIENO})`);
  }
  return { misura: out, ko };
}
const V = SOLO === 'rosso' ? null : await braccio([]), R = SOLO === 'verde' ? null : await braccio(['__CPM_NO_G314']);
await browser.close(); srv.close();
let ok = true; const motivi = [];
if (V && V.ko.length) { ok = false; motivi.push('verde con rilievi: ' + V.ko.join(' · ')); }
if (R) { const m = R.misura; const cade = !m.errore && R.ko.length > 0 && !R.ko.every(s => /^non giudicato/.test(s)) && m.quotaOspiti >= OSP_ROSSO && m.nordC2 >= C2_ROSSO && m.pieno < PIENO;
  if (!cade) { ok = false; motivi.push('il rosso __CPM_NO_G314 non cade su tutte e tre le misure' + (R.ko.length ? ' (' + R.ko.join(' · ') + ')' : '')); } }
if (SOLO) { ok = false; motivi.push('corsa parziale: non vale come guardiano'); }
const breve = x => x && (x.misura.errore ? { errore: x.misura.errore } : { sagome: x.misura.n, ospiti: x.misura.ospiti, quotaOspiti: x.misura.quotaOspiti, nordC1: x.misura.nordC1, nordC2: x.misura.nordC2, sudC1: x.misura.sudC1, sudC2: x.misura.sudC2,
  fillNord: x.misura.fillNord, fillSud: x.misura.fillSud, pieno: x.misura.pieno, perSettore: Object.fromEntries(Object.entries(x.misura.settori).map(([k, s]) => [k, s.n + ' (ospiti ' + s.osp + ')'])), rilievi: x.ko });
fs.writeFileSync('out/g314/serata-314.json', JSON.stringify({ verde: V, rosso: R }, null, 1));
console.log('verde ' + JSON.stringify(breve(V)));
console.log('rosso (__CPM_NO_G314) ' + JSON.stringify(breve(R)));
if (!ok) { console.log('❌ serata-314 — ' + motivi.join(' · ')); process.exit(1); }
console.log('✅ serata-314 verde (e il rosso __CPM_NO_G314 cade: ospiti, secondo colore e curva mezza vuota)');
