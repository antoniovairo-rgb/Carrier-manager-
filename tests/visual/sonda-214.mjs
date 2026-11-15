#!/usr/bin/env node
/* [giro 214 PO-477] sonda: durante la LOTTERIA DEI RIGORI
   (1) quanto del 3D (la scritta «RIGORI» del maxischermo) si vede ATTRAVERSO il tabellone DOM «CALCI DI RIGORE»: nel rettangolo del
       tabellone si fotografa due volte nello stesso istante, con la tela 3D visibile e con la tela nascosta; i pixel che cambiano sono
       3D visto in trasparenza (tabellone opaco = 0 pixel che cambiano). Si contano anche i pixel BIANCHI che compaiono solo con la tela
       (la scritta del maxischermo) nella fascia sotto il punteggio.
   (2) cosa dice la STRISCIA IN ALTO della partita (data-cpm="risultato-v2" / "minuto-v2") a ogni campione, contro lo stato vero della
       serie (__CPM_SO_STATE, orientato come la striscia: la squadra dell'eroe dal suo lato, in casa a sinistra).
   (3) a lotteria finita, la striscia (se c'e' ancora, cioe' in cerimonia) torna al risultato della partita e senza «RIGORI».
   Opzioni: { rosso (__CPM_NO_G214), viewport, foto: prefisso file png (foto a meta' serie e a fine serie), finale: true = finale di
   coppa (se vinta, dopo la serie c'e' la cerimonia con la striscia ancora in vista) }. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
export async function misura214(browser, port, { rosso = false, viewport = { width: 375, height: 667 }, foto = null, finale = false, trasferta = false, nome = 'Lotteria Probe' } = {}) {
  const mkSave = () => ({ phase: 'career', player: { name: nome, nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 12, weekLived: true, age: 24, ovr: 80, tutorialDone: true, campDone: true, jerseyNumSeason: 4, presidentModalSeason: 4, seasonPledge: { season: 4, tone: 'equilibrato' }, drawSeen: 4, coachPactSeason: 4, bondEv: { s: 4, w: 11 }, sponsorDecl: { tier: 'tecnico', season: 4 }, matches: 8, goals: 5,
    cup: { active: true, round: finale ? 4 : 2, eliminated: false, champion: false, results: [{ round: 1, name: 'Sedicesimi', opponent: 'FC Rovigo', homeScore: 2, awayScore: 0, won: true }] },
    calendar: [{ matchday: 992, week: 12, opponentId: 'inter', opponentName: 'FC Internazionale', isHome: !trasferta, played: false, result: null, type: 'cup', competition: 'Coppa Nazionale', cupRound: finale ? 4 : 2, cupRoundName: finale ? 'Finale' : 'Ottavi' }],
    club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 55, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' },
    stats: { 'velocità': 80, tecnica: 79, fisico: 78, 'mentalità': 80, tiro: 82, passaggio: 79, dribbling: 81, posizionamento: 80 },
    form: 70, fatigue: 10, morale: 68, contract: { duration: 3, wage: 12000, expiresAtSeason: 7 } } });
  const pg = await browser.newPage({ viewport }); await installCdnRoutes(pg);
  const errs = []; pg.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await pg.addInitScript(([sv, r]) => { if (r) window.__CPM_NO_G214 = 1; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, [mkSave(), rosso]);
  await pg.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await pg.waitForFunction(() => document.getElementById('root')?.children.length > 0, null, { timeout: 90000 }); await sleep(1500);
  try { await pg.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await pg.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
  for (let a = 0; a < 16; a++) { if (await pg.evaluate(() => typeof window.__CPM_PHASE === 'function')) break;
    await pg.evaluate(() => { const C = window.__CPM_CAREER; C.dismiss(); if (C.playMatch() === true) return; C.step(); }); await sleep(1500); }
  await pg.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 8080, policy: 'seeded', tickMs: 300 }));
  await pg.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await pg.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(false));
  await sleep(1500);
  const prima = await pg.evaluate(() => { const r = document.querySelector('[data-cpm="risultato-v2"]'), m = document.querySelector('[data-cpm="minuto-v2"]'); return { ris: r ? r.textContent : null, min: m ? m.textContent : null }; });
  await pg.evaluate(() => window.__CPM_SO_FORCE && window.__CPM_SO_FORCE());
  await pg.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'shootout', null, { timeout: 20000 }).catch(() => {});
  const leggi = () => pg.evaluate(() => {
    const ph = window.__CPM_PHASE && window.__CPM_PHASE(); const so = window.__CPM_SO_STATE && window.__CPM_SO_STATE();
    const r = document.querySelector('[data-cpm="risultato-v2"]'), m = document.querySelector('[data-cpm="minuto-v2"]');
    const tab = [...document.querySelectorAll('div')].find(d => d.children.length === 0 && /CALCI DI RIGORE/.test(d.textContent));
    const b = tab ? tab.parentElement.getBoundingClientRect() : null;
    return { ph, so: so ? { hs: so.hs, as: so.as, done: so.done } : null, ris: r ? r.textContent.replace(/\s+/g, '') : null, min: m ? m.textContent.trim() : null,
      stacco: !!document.querySelector('[data-cpm="stacco191"]'), box: b ? { x: Math.round(b.left), y: Math.round(b.top), width: Math.round(b.width), height: Math.round(b.height) } : null };
  });
  const tela = (vis) => pg.evaluate((v) => { for (const c of document.querySelectorAll('canvas')) c.style.visibility = v ? '' : 'hidden'; }, vis);
  const confronta = (a, b) => pg.evaluate(async ([A, B]) => {
    const dec = async (b64) => { const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); return x.getImageData(0, 0, c.width, c.height); };
    const p = await dec(A), q = await dec(B); const W = p.width, H = p.height; let diff = 0, bianchi = 0;
    for (let k = 0; k < p.data.length; k += 4) { const d = Math.max(Math.abs(p.data[k] - q.data[k]), Math.abs(p.data[k + 1] - q.data[k + 1]), Math.abs(p.data[k + 2] - q.data[k + 2])); if (d > 24) diff++;
      const X = (k / 4) % W, Y = Math.floor(k / 4 / W); if (X < 0.3 * W || X > 0.8 * W || Y < 0.2 * H || Y > 0.68 * H) continue;
      const R = p.data[k], G = p.data[k + 1], Bl = p.data[k + 2], r0 = q.data[k], g0 = q.data[k + 1], b0 = q.data[k + 2];
      const wc = R > 170 && G > 170 && Bl > 170 && Math.max(R, G, Bl) - Math.min(R, G, Bl) < 40, w0 = r0 > 170 && g0 > 170 && b0 > 170 && Math.max(r0, g0, b0) - Math.min(r0, g0, b0) < 40; if (wc && !w0) bianchi++; }
    return { diff, bianchi, tot: W * H };
  }, [a.toString('base64'), b.toString('base64')]);
  const campioni = []; let fotoMeta = null, fotoFine = false, migliore = -1;
  for (let i = 0; i < 90; i++) {
    await sleep(500);
    const r = await leggi(); if (r.ph !== 'shootout') { campioni.push(r); break; }
    if (r.box && r.box.width > 10 && r.box.height > 10) {
      await pg.evaluate(() => { const a = document.getElementById('cpm-anim-stop214'); if (!a) { const s = document.createElement('style'); s.id = 'cpm-anim-stop214'; s.textContent = '*{animation-play-state:paused!important}'; document.head.appendChild(s); } });
      /* il tabellone si aggiorna da React piu' in fretta di quanto durano le due foto: per la coppia si mette al suo posto una COPIA
         congelata (cloneNode: stessi stili scritti, quindi stessa opacita'), cosi' fra le due foto cambia solo il 3D */
      await pg.evaluate(() => { const t = [...document.querySelectorAll('div')].find(d => d.children.length === 0 && /CALCI DI RIGORE/.test(d.textContent)); if (!t) return; const o = t.parentElement; const c = o.cloneNode(true); c.id = 'cpm-gelo214'; o.style.visibility = 'hidden'; o.setAttribute('data-gelo214', '1'); o.parentElement.insertBefore(c, o.nextSibling); });
      const con = await pg.screenshot({ clip: r.box }); await tela(false); const senza = await pg.screenshot({ clip: r.box }); await tela(true);
      r.fermo = await pg.evaluate(() => (window.__CPM_PHASE && window.__CPM_PHASE()) === 'shootout' && !!document.querySelector('[data-gelo214]'));/* la coppia di foto vale solo se a fine coppia si e' ancora nella lotteria e il tabellone vero c'e' ancora (misurato: la cerimonia partita fra le due foto copriva il campione con «TITOLO VINTO!») */
      await pg.evaluate(() => { const c = document.getElementById('cpm-gelo214'); if (c) c.remove(); const o = document.querySelector('[data-gelo214]'); if (o) { o.style.visibility = ''; o.removeAttribute('data-gelo214'); } });
      await pg.evaluate(() => { const s = document.getElementById('cpm-anim-stop214'); if (s) s.remove(); });
      Object.assign(r, await confronta(con, senza)); if (process.env.CPM_CLIP) { fs.writeFileSync(`${process.env.CPM_CLIP}${i}-con.png`, con); fs.writeFileSync(`${process.env.CPM_CLIP}${i}-senza.png`, senza); }
    }
    campioni.push(r);
    if (foto && !fotoMeta && r.diff != null && !r.stacco && !r.so.done && r.so.hs + r.so.as >= 1 && !(await pg.evaluate(() => !!document.querySelector('[data-cpm="stacco191"]')))) { const png = await pg.screenshot(); if (!(await pg.evaluate(() => !!document.querySelector('[data-cpm="stacco191"]')))) { migliore = r.diff; fotoMeta = png; } }/* la foto della serie: il primo campione con almeno un rigore segnato, fuori dallo stacco nero prima e dopo lo scatto */
    if (foto && r.so && r.so.done && !fotoFine) { fotoFine = true; await pg.screenshot({ path: foto + '-fine.png' }); }
  }
  /* dopo la serie: fase successiva e striscia (presente solo in cerimonia) */
  let dopo = null; for (let i = 0; i < 20; i++) { await sleep(500); dopo = await leggi(); if (dopo.ph !== 'shootout') break; }
  await sleep(1200); dopo = await leggi(); if (foto && dopo.ris) await pg.screenshot({ path: foto + '-dopo.png' });
  if (foto && fotoMeta) fs.writeFileSync(foto + '-serie.png', fotoMeta);
  await pg.close();
  const inSerie = campioni.filter(c => c.ph === 'shootout' && c.so);
  const atteso = (c) => trasferta ? `${c.so.as}–${c.so.hs}` : `${c.so.hs}–${c.so.as}`;/* la striscia ha la squadra di casa a sinistra: in casa l'eroe e' a sinistra, in trasferta a destra (hs = la serie dell'eroe) */
  const pix = inSerie.filter(c => c.diff != null && c.fermo), pixLuce = pix.filter(c => !c.stacco);
  return { errs: errs.length, errTesti: errs.slice(0, 3), prima, campioni: inSerie.length,
    strisciaRigori: inSerie.filter(c => /RIGORI/i.test(c.min || '')).length, strisciaMinuto: inSerie.filter(c => /\d+\s*'/.test(c.min || '')).length,
    strisciaSerie: inSerie.filter(c => c.ris === atteso(c)).length, strisciaPartita: inSerie.filter(c => c.ris === '1–1' && atteso(c) !== '1–1').length, strisciaCapovolta: inSerie.filter(c => trasferta ? c.ris === `${c.so.hs}–${c.so.as}` && c.so.hs !== c.so.as : c.ris === `${c.so.as}–${c.so.hs}` && c.so.hs !== c.so.as).length,
    perCampione: inSerie.map(c => [c.so && `${c.so.hs}-${c.so.as}`, c.stacco ? 'stacco' : '', c.fermo ? '' : 'fase cambiata', c.diff, c.box && `${c.box.x},${c.box.y},${c.box.width}x${c.box.height}`]),
    letture: [...new Set(inSerie.map(c => `${c.min}|${c.ris}|serie ${atteso(c)}`))],
    pixelGiudicati: pix.length, pixelScartatiFase: inSerie.filter(c => c.diff != null && !c.fermo).length, pixelLuceGiudicati: pixLuce.length, diffMax: pix.length ? Math.max(...pix.map(c => c.diff)) : null, diffMaxLuce: pixLuce.length ? Math.max(...pixLuce.map(c => c.diff)) : null,
    diffMinLuce: pixLuce.length ? Math.min(...pixLuce.map(c => c.diff)) : null, bianchiMaxLuce: pixLuce.length ? Math.max(...pixLuce.map(c => c.bianchi)) : null, bianchiMinLuce: pixLuce.length ? Math.min(...pixLuce.map(c => c.bianchi)) : null,
    ultimaSerie: inSerie.length ? atteso(inSerie[inSerie.length - 1]) : null, dopo: dopo ? { ph: dopo.ph, ris: dopo.ris, min: dopo.min } : null };
}
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('/sonda-214.mjs')) {
  const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
  const vp = process.env.CPM_PC ? { width: 1366, height: 768 } : { width: 375, height: 667 };
  const r = await misura214(browser, port, { rosso: !!process.env.CPM_ROSSO, viewport: vp, foto: process.env.CPM_FOTO || null, finale: !!process.env.CPM_FINALE, trasferta: !!process.env.CPM_TRASFERTA });
  console.log(JSON.stringify(r)); await browser.close(); srv.close();
}
