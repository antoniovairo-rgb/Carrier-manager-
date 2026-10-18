/* [PO-154 giro 66] SONDA DI MISURA (non guardiano): una stagione vissuta con step(), rispondendo alternando la prima e la seconda scelta; verde contro rosso __CPM_NO154+__CPM_NO154C. Uso: node stagione-154.mjs (NOMI=a,b: indice pari = pro S3, dispari = Primavera S1) */
/* misura prima/dopo PO-154: una stagione vissuta (W1..W38) rispondendo sempre a una scelta (alternata), due bracci */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const CLUB = { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' };
const UNIV = ["wi_dieta_ferrea","wi_torneo_padel","wi_extra_portieri","wi_ospedale","wi_recupero_hitech","wi_carita_anonima","wi_cena_squadra","wi_investimento","wi_personal_chef","wi_famiglia_visita","wi_compagno_lite","wi_media","wi_ciclo_forza","wi_intervista_sorpresa","wi_social","wi_sogno","wi_ex_club","wi_staff","wi_podcast","wi_donazione","wi_fan_speciale","wi_analisi_video","wi_crioterapia","wi_giovani_accademia","wi_campo_bagnato","wi_figlia_mister","wi_polemica_social","wi_giornata_libera","wi_genitori_tribuna","wi_cripto","wi_bimbo_sogno","wi_mental_coach","wi_orologi_squadra","wi_primo_mister","wi_tifoso_fisso","wi_compagno_prestito","wi_pioggia_scelta","wi_scommessa_amici","wi_dirigente_idolo","wi_massaggiatore_addio"];
const srv = await startServer(); const b = await launchBrowser(); const out = {};
const NOMI = (process.env.NOMI || 'Luca Neri,Ana Ruiz').split(',');
for (const rosso of [false, true]) for (const [ni, nome] of NOMI.entries()) {
  const ctx = await b.newContext({ viewport: { width: 900, height: 900 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const pro = ni % 2 === 0;
  const save = { phase: 'career', player: { name: nome, nation: 'Italia', avatarId: 0, proStatus: pro ? 'pro' : 'u18', season: pro ? 3 : 1, week: 1, weekLived: false, age: pro ? 22 : 17, ovr: pro ? 72 : 63, tutorialDone: true, club: CLUB, popularity: pro ? 40 : 12,
    stats: { 'velocità': 70, tecnica: 69, fisico: 68, 'mentalità': 70, tiro: 72, passaggio: 69, dribbling: 71, posizionamento: 70 }, form: 70, morale: 72, fatigue: 10, contract: { duration: 3, wage: pro ? 6000 : 300, expiresAtSeason: 6 }, matchHistory: [], bankBalance: pro ? 80000 : 2000 } };
  await page.addInitScript(s => { window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; if (s.r) { window.__CPM_NO154 = 1; window.__CPM_NO154C = 1; } localStorage.setItem('cpm-v3', JSON.stringify(s.save)); }, { r: rosso, save });
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(800);
  const ids = []; let alt = 0;
  for (let i = 0; i < 140; i++) {
    const before = await page.evaluate(() => (window.__CPM_CAREER.snapshot().recentImpulses || []).length);
    const r = await page.evaluate(() => window.__CPM_CAREER.step());
    if (r === 'seasonEnd') break;
    if (String(r).startsWith('blocked')) await page.evaluate(() => window.__CPM_CAREER.clearTournaments());
    await sleep(r === 'lived' ? 450 : 150);
    if (r === 'lived') {
      const s = await page.evaluate(() => window.__CPM_CAREER.snapshot());
      const ri = s.recentImpulses || [];
      if (ri.length > before || (ri.length === 40 && ri.slice(-1)[0] !== ids.slice(-1)[0])) {
        const id = ri.slice(-1)[0]; ids.push(id);
        const k = alt++ % 2;
        await page.evaluate((k) => { const bs = [...document.querySelectorAll('button')].filter(x => /^\s*\S/.test(x.textContent||'') && x.closest('[data-cpm],div') && !x.disabled);
          /* i pulsanti di scelta dell'impulso: quelli dentro la finestra della settimana */
          const box = [...document.querySelectorAll('div')].find(d => /Il seguito|Opportunità|Scelta|Tensione|Conseguenza|Esordio|personale|formazione|sociale|leadership/.test((d.firstChild&&d.firstChild.textContent)||'') && d.parentElement && d.parentElement.querySelectorAll('button').length >= 2);
          const cand = box ? [...box.parentElement.querySelectorAll('button')] : [];
          if (cand[k]) cand[k].click(); else if (cand[0]) cand[0].click(); }, k);
        await sleep(350);
      }
      await page.evaluate(() => window.__CPM_CAREER.dismiss());
    } else await page.evaluate(() => window.__CPM_CAREER.dismiss());
  }
  const s = await page.evaluate(() => window.__CPM_CAREER.snapshot());
  const mem = Object.values(s.impMem || {}).filter(m => m.c >= 0).length;
  const seg = ids.filter(x => /^wi_seg_|wi_carita_anonima/.test(x));
  const dist = new Set(ids).size;
  out[(rosso ? 'rosso' : 'verde') + ':' + nome + (pro ? ':pro' : ':u18')] = { impulsi: ids.length, distinti: dist, ripetuti: ids.length - dist, seguiti: seg.length, seguitiId: seg, exUniversali: ids.filter(x => UNIV.includes(x)).length, scelteRicordate: mem, settimana: s.week, stagione: s.season };
  await ctx.close();
}
await b.close(); srv.close();
console.log(JSON.stringify(out, null, 1));
