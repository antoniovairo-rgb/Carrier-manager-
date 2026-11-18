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
export async function misura214(browser, port, { rosso216 = false, rosso = false, viewport = { width: 375, height: 667 }, foto = null, finale = false, trasferta = false, nome = 'Lotteria Probe' } = {}) {
  const mkSave = () => ({ phase: 'career', player: { name: nome, nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 12, weekLived: true, age: 24, ovr: 80, tutorialDone: true, campDone: true, jerseyNumSeason: 4, presidentModalSeason: 4, seasonPledge: { season: 4, tone: 'equilibrato' }, drawSeen: 4, coachPactSeason: 4, bondEv: { s: 4, w: 11 }, sponsorDecl: { tier: 'tecnico', season: 4 }, matches: 8, goals: 5,
    cup: { active: true, round: finale ? 4 : 2, eliminated: false, champion: false, results: [{ round: 1, name: 'Sedicesimi', opponent: 'FC Rovigo', homeScore: 2, awayScore: 0, won: true }] },
    calendar: [{ matchday: 992, week: 12, opponentId: 'inter', opponentName: 'FC Internazionale', isHome: !trasferta, played: false, result: null, type: 'cup', competition: 'Coppa Nazionale', cupRound: finale ? 4 : 2, cupRoundName: finale ? 'Finale' : 'Ottavi' }],
    club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 55, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' },
    stats: { 'velocità': 80, tecnica: 79, fisico: 78, 'mentalità': 80, tiro: 82, passaggio: 79, dribbling: 81, posizionamento: 80 },
    form: 70, fatigue: 10, morale: 68, contract: { duration: 3, wage: 12000, expiresAtSeason: 7 } } });
  const pg = await browser.newPage({ viewport }); await installCdnRoutes(pg);
  const errs = []; pg.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await pg.addInitScript(([sv, r, r216]) => { if (r) window.__CPM_NO_G214 = 1; if (r216) window.__CPM_NO_G216 = 1; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, [mkSave(), rosso, rosso216]);
  await pg.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await pg.waitForFunction(() => document.getElementById('root')?.children.length > 0, null, { timeout: 90000 }); await sleep(1500);
  try { await pg.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await pg.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
  /* [giro 272] la sigla dell'eroe si legge dal gioco: dal giro 251 (PO-512, CLUB_NOMI_251 + migrazione) «FC Salernum»/«SAL» del
     salvataggio di prova e' «FC Salernum 1919»/«SLR» (stesso rimedio di prossima-131 al giro 263). Il nome resta /salern/. */
  const siglaEroe = (await pg.evaluate(() => { try { return window.__CPM_CAREER.snapshot().club.a; } catch (e) { return null; } }).catch(() => null)) || 'SAL';
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
    /* [giro 216] ordine della striscia: il blocco squadra piu' a sinistra sullo schermo (stemma+nome) e il suo testo; e l'ordine del
       tabellone (sigla a sinistra, punteggio). L'eroe e' FC Salernum (sigla SAL), l'avversario no. */
    const bl = [...document.querySelectorAll('[data-cpm="barra"] [data-cpm="scudo-casa"],[data-cpm="barra"] [data-cpm="scudo-ospiti"]')].filter(e => e.getBoundingClientRect().width > 0)
      .map(e => ({ x: e.getBoundingClientRect().left, t: e.textContent.replace(/\s+/g, ' ').trim() })).sort((p, q) => p.x - q.x);
    const blEl = [...document.querySelectorAll('[data-cpm="barra"] [data-cpm="scudo-casa"],[data-cpm="barra"] [data-cpm="scudo-ospiti"]')];
    const scorre = blEl.some(e => e.getAnimations().some(a => a.playState === 'running'));/* lo scorrimento di 0,6 s degli stemmi (cpmSwapCasa905) quando la barra si specchia */
    const sx = bl.length >= 2 ? bl[0].t : null, dx = bl.length >= 2 ? bl[bl.length - 1].t : null;
    const tabSig = tab ? [...tab.parentElement.querySelectorAll('span')].map(x => x.textContent.trim()).filter(t => /^[A-Z]{2,3}$/.test(t)) : [];
    const tabNum = tab ? [...tab.parentElement.querySelectorAll('.cpm-num')].map(x => x.textContent.replace(/\s+/g, ''))[0] || null : null;
    return { scorre, sx, dx, tabSx: tabSig[0] || null, tabNum, ph, so: so ? { hs: so.hs, as: so.as, done: so.done } : null, ris: r ? r.textContent.replace(/\s+/g, '') : null, min: m ? m.textContent.trim() : null,
      stacco: !!document.querySelector('[data-cpm="stacco191"]'), box: b ? { x: Math.round(b.left), y: Math.round(b.top), width: Math.round(b.width), height: Math.round(b.height) } : null };
  });
  /* [giro 272] la seconda foto INVERTE la tela invece di nasconderla: nascosta, Chrome compone il tabellone su un altro livello e
     l'antialiasing degli angoli dei pallini cambia (misurato: 1 pixel a (236,66), verde 0e2a1d contro 0d0f14, su 196 e 197). Invertita,
     i livelli restano quelli e ogni pixel da cui si vede il 3D cambia lo stesso (il rosso C __CPM_NO_G214 resta di decine di migliaia). */
  const tela = (vis) => pg.evaluate((v) => { for (const c of document.querySelectorAll('canvas')) c.style.filter = v ? '' : 'invert(1)'; }, vis);
  /* [giro 272] lettura STABILE: lo stato della serie (__CPM_SO_STATE / __CPM_PHASE) e il DOM possono essere sfasati di un fotogramma
     (misurato: «RIGORI 4–3 | serie 3–3» sulla 197, «🏆 1–1» ancora in shootout sulla 196). Si rilegge dopo due fotogrammi finche' due
     letture coincidono; se non coincidono mai il campione e' segnato instabile e non e' giudicato (conta a parte, i minimi restano). */
  const dueFot = () => pg.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  const chiave = (x) => JSON.stringify([x.ph, x.so, x.ris, x.min, x.sx, x.dx, x.tabSx, x.tabNum, x.scorre, x.stacco]);
  const leggiStabile = async () => { let a = await leggi(); for (let k = 0; k < 6; k++) { await dueFot(); const b2 = await leggi(); if (chiave(a) === chiave(b2)) return b2; a = b2; } a.instabile = true; return a; };
  const confronta = (a, b) => pg.evaluate(async ([A, B]) => {
    const dec = async (b64) => { const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); return x.getImageData(0, 0, c.width, c.height); };
    const p = await dec(A), q = await dec(B); const W = p.width, H = p.height; let diff = 0, bianchi = 0;
    for (let k = 0; k < p.data.length; k += 4) { const d = Math.max(Math.abs(p.data[k] - q.data[k]), Math.abs(p.data[k + 1] - q.data[k + 1]), Math.abs(p.data[k + 2] - q.data[k + 2])); if (d > 24) diff++;
      const X = (k / 4) % W, Y = Math.floor(k / 4 / W); if (X < 0.3 * W || X > 0.8 * W || Y < 0.2 * H || Y > 0.68 * H) continue;
      const R = p.data[k], G = p.data[k + 1], Bl = p.data[k + 2], r0 = q.data[k], g0 = q.data[k + 1], b0 = q.data[k + 2];
      const wc = R > 170 && G > 170 && Bl > 170 && Math.max(R, G, Bl) - Math.min(R, G, Bl) < 40, w0 = r0 > 170 && g0 > 170 && b0 > 170 && Math.max(r0, g0, b0) - Math.min(r0, g0, b0) < 40; if (wc && !w0) bianchi++; }
    return { diff, bianchi, tot: W * H };
  }, [a.toString('base64'), b.toString('base64')]);
  let instabili272 = 0; const campioni = []; let fotoMeta = null, fotoFine = false, migliore = -1;
  for (let i = 0; i < 90; i++) {
    await sleep(+process.env.CPM_PASSO214 || 150);/* [giro 272] era 500: la lettura stabile costa gia' due fotogrammi (headless ~0,3-1 s), cosi' i campioni per serie tornano quelli di prima */
    const r = await leggiStabile(); if (r.ph !== 'shootout') { campioni.push(r); break; } if (r.instabile) { instabili272++; continue; }
    if (r.box && r.box.width > 10 && r.box.height > 10) {
      await pg.evaluate(() => { const a = document.getElementById('cpm-anim-stop214'); if (!a) { const s = document.createElement('style'); s.id = 'cpm-anim-stop214'; s.textContent = '*{animation-play-state:paused!important}'; document.head.appendChild(s); } });
      /* il tabellone si aggiorna da React piu' in fretta di quanto durano le due foto: per la coppia si mette al suo posto una COPIA
         congelata (cloneNode: stessi stili scritti, quindi stessa opacita'), cosi' fra le due foto cambia solo il 3D */
      await pg.evaluate(() => { const t = [...document.querySelectorAll('div')].find(d => d.children.length === 0 && /CALCI DI RIGORE/.test(d.textContent)); if (!t) return; const o = t.parentElement; const c = o.cloneNode(true); c.id = 'cpm-gelo214'; o.style.visibility = 'hidden'; o.setAttribute('data-gelo214', '1'); o.parentElement.insertBefore(c, o.nextSibling); });
      /* [giro 272] il riquadro si prende dalla COPIA congelata: misurato prima, a volte era 2 px piu' alto della copia (la riga «sul dischetto…»/«GOOOL!» cambia altezza) e le due righe scoperte mostravano il 3D (723 pixel su 196 e 197) */
      { const bx = await pg.evaluate(() => { const c = document.getElementById('cpm-gelo214'); if (!c) return null; const q = c.getBoundingClientRect(); return { x: Math.round(q.left), y: Math.round(q.top), width: Math.round(q.width), height: Math.round(q.height) }; }); if (bx && bx.width > 10 && bx.height > 10) r.box = bx; }
      const con = await pg.screenshot({ clip: r.box }); await tela(false); const senza = await pg.screenshot({ clip: r.box }); await tela(true);
      r.fermo = await pg.evaluate(() => (window.__CPM_PHASE && window.__CPM_PHASE()) === 'shootout' && !!document.querySelector('[data-gelo214]'));/* la coppia di foto vale solo se a fine coppia si e' ancora nella lotteria e il tabellone vero c'e' ancora (misurato: la cerimonia partita fra le due foto copriva il campione con «TITOLO VINTO!») */
      await pg.evaluate(() => { const c = document.getElementById('cpm-gelo214'); if (c) c.remove(); const o = document.querySelector('[data-gelo214]'); if (o) { o.style.visibility = ''; o.removeAttribute('data-gelo214'); } });
      await pg.evaluate(() => { const s = document.getElementById('cpm-anim-stop214'); if (s) s.remove(); });
      Object.assign(r, await confronta(con, senza)); if (process.env.CPM_CLIP) { fs.writeFileSync(`${process.env.CPM_CLIP}${i}-con.png`, con); fs.writeFileSync(`${process.env.CPM_CLIP}${i}-senza.png`, senza); }
    }
    campioni.push(r);
    if (foto && !fotoMeta && r.diff != null && !r.stacco && !r.so.done && (process.env.CPM_FOTO_DIVERSA ? r.so.hs !== r.so.as : r.so.hs + r.so.as >= 1) && !(await pg.evaluate(() => !!document.querySelector('[data-cpm="stacco191"]')))) { const png = await pg.screenshot(); if (!(await pg.evaluate(() => !!document.querySelector('[data-cpm="stacco191"]')))) { migliore = r.diff; fotoMeta = png; } }/* la foto della serie: il primo campione con almeno un rigore segnato, fuori dallo stacco nero prima e dopo lo scatto */
    if (foto && r.so && r.so.done && !fotoFine) { fotoFine = true; await pg.screenshot({ path: foto + '-fine.png' }); }
  }
  /* dopo la serie: fase successiva e striscia (presente solo in cerimonia) */
  /* [giro 272] si ATTENDE L'EVENTO, non un tempo fisso (regola PO-311): prima si leggeva a +1,2 s dall'uscita dalla serie, e a volte la
     cerimonia era gia' finita (misurato su 196 e 197, PC in trasferta: «ceremony@3066 ended@6096»). Ora si legge finche' si e' in
     cerimonia con la striscia presente e tornata alla partita (senza «RIGORI»); se la cerimonia finisce prima, l'ultima lettura resta
     quella fuori cerimonia e il verde cade (non giudicato = rosso). fasiDopo272 dice cosa si e' visto e quando. */
  let dopo = null; const fasiDopo272 = []; const tDopo = Date.now();
  for (let i = 0; i < 80; i++) { await sleep(250); dopo = await leggiStabile(); fasiDopo272.push(dopo.ph + (dopo.min ? '/' + dopo.min : '') + '@' + (Date.now() - tDopo));
    if (dopo.ph === 'shootout') continue; if (dopo.ph !== 'ceremony') break; if (dopo.ris && dopo.sx != null && !/RIGORI/i.test(dopo.min || '')) break; }
  if (foto && dopo.ris) await pg.screenshot({ path: foto + '-dopo.png' });
  if (foto && fotoMeta) fs.writeFileSync(foto + '-serie.png', fotoMeta);
  await pg.close();
  const inSerie = campioni.filter(c => c.ph === 'shootout' && c.so);
  const atteso = (c) => (trasferta && rosso216) ? `${c.so.as}–${c.so.hs}` : `${c.so.hs}–${c.so.as}`;/* [giro 216] la serie ha SEMPRE l'eroe a sinistra (hs = la serie dell'eroe), come il tabellone; solo col rosso __CPM_NO_G216 (= 214) in trasferta torna casa a sinistra */
  const pix = inSerie.filter(c => c.diff != null && c.fermo), pixLuce = pix.filter(c => !c.stacco);
  const eroe = (t) => /salern|\bSAL\b/i.test(t || '') || (t || '').includes(siglaEroe);/* [giro 272] anche la sigla del gioco (SLR dal giro 251) */
  const ordine = (c) => ({ strisciaEroeSx: c.ris === `${c.so.hs}–${c.so.as}`, nomeEroeSx: eroe(c.sx) && !eroe(c.dx), nomeEroeDx: eroe(c.dx) && !eroe(c.sx),
    tabEroeSx: c.tabNum === `${c.so.hs}—${c.so.as}` && c.tabSx === siglaEroe });
  /* sigle coerenti coi numeri: la squadra scritta sopra il numero di sinistra e' quella che lo ha segnato (eroe a sx <=> serie eroe a sx) */
  const coerente = (c) => { const o = ordine(c); if (c.so.hs === c.so.as) return o.nomeEroeSx || o.nomeEroeDx; return (o.nomeEroeSx && c.ris === `${c.so.hs}–${c.so.as}`) || (o.nomeEroeDx && c.ris === `${c.so.as}–${c.so.hs}`); };
  const giud = inSerie.filter(c => c.so && c.sx != null && !c.scorre);/* un campione preso mentre gli stemmi scorrono (0,6 s) non e' giudicato sull'ordine: si conta a parte (scorrimento216) */
  const g216 = { giudicati216: giud.length, scorrimento216: inSerie.filter(c => c.so && c.scorre).length, primoCampione216: inSerie.length ? `${inSerie[0].scorre ? 'scorre ' : ''}${inSerie[0].sx} ${inSerie[0].ris} ${inSerie[0].dx}` : null, eroeSxStriscia: giud.filter(c => ordine(c).strisciaEroeSx && ordine(c).nomeEroeSx).length,
    tabelloneEroeSx: giud.filter(c => ordine(c).tabEroeSx).length, stessoOrdine: giud.filter(c => ordine(c).strisciaEroeSx && ordine(c).nomeEroeSx && ordine(c).tabEroeSx).length,
    sigleCoerenti: giud.filter(coerente).length, ordineOpposto: giud.filter(c => c.so.hs !== c.so.as && ordine(c).tabEroeSx && c.ris === `${c.so.as}–${c.so.hs}` && ordine(c).nomeEroeDx).length,
    serieDiverse: giud.filter(c => c.so.hs !== c.so.as).length, ordini: [...new Set(giud.map(c => `${c.sx} ${c.ris} ${c.dx} | tab ${c.tabSx} ${c.tabNum}`))].slice(0, 12),
    dopoSx: dopo ? dopo.sx : null, dopoDx: dopo ? dopo.dx : null };
  return { ...g216, siglaEroe, instabili272, fasiDopo272, ultimoCampione272: campioni.length ? campioni[campioni.length - 1].ph : null, errs: errs.length, errTesti: errs.slice(0, 3), prima, campioni: inSerie.length,
    strisciaRigori: inSerie.filter(c => /RIGORI/i.test(c.min || '')).length, strisciaMinuto: inSerie.filter(c => /\d+\s*'/.test(c.min || '')).length,
    strisciaSerie: inSerie.filter(c => c.ris === atteso(c)).length, strisciaPartita: inSerie.filter(c => c.ris === '1–1' && atteso(c) !== '1–1').length, strisciaCapovolta: inSerie.filter(c => (trasferta && rosso216) ? c.ris === `${c.so.hs}–${c.so.as}` && c.so.hs !== c.so.as : c.ris === `${c.so.as}–${c.so.hs}` && c.so.hs !== c.so.as).length,
    perCampione: inSerie.map(c => [c.so && `${c.so.hs}-${c.so.as}`, c.stacco ? 'stacco' : '', c.fermo ? '' : 'fase cambiata', c.diff, c.box && `${c.box.x},${c.box.y},${c.box.width}x${c.box.height}`]),
    letture: [...new Set(inSerie.map(c => `${c.min}|${c.ris}|serie ${atteso(c)}`))],
    pixelGiudicati: pix.length, pixelScartatiFase: inSerie.filter(c => c.diff != null && !c.fermo).length, pixelLuceGiudicati: pixLuce.length, diffMax: pix.length ? Math.max(...pix.map(c => c.diff)) : null, diffMaxLuce: pixLuce.length ? Math.max(...pixLuce.map(c => c.diff)) : null,
    diffMinLuce: pixLuce.length ? Math.min(...pixLuce.map(c => c.diff)) : null, bianchiMaxLuce: pixLuce.length ? Math.max(...pixLuce.map(c => c.bianchi)) : null, bianchiMinLuce: pixLuce.length ? Math.min(...pixLuce.map(c => c.bianchi)) : null,
    ultimaSerie: inSerie.length ? atteso(inSerie[inSerie.length - 1]) : null, dopo: dopo ? { ph: dopo.ph, ris: dopo.ris, min: dopo.min } : null };
}
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('/sonda-214.mjs')) {
  const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
  const vp = process.env.CPM_PC ? { width: 1366, height: 768 } : { width: 375, height: 667 };
  const r = await misura214(browser, port, { rosso216: !!process.env.CPM_ROSSO216, rosso: !!process.env.CPM_ROSSO, viewport: vp, foto: process.env.CPM_FOTO || null, finale: !!process.env.CPM_FINALE, trasferta: !!process.env.CPM_TRASFERTA });
  console.log(JSON.stringify(r)); await browser.close(); srv.close();
}
