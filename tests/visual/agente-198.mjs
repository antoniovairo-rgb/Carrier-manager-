#!/usr/bin/env node
/* [giro 198 · PO-456 / PO-446] GUARDIANO agente-198 — sul gioco vero (?cpmtest=1), una pagina nuova per braccio.
   A. PO-456 (G195-08): aprendo la scheda Agente il riquadro «Da fare ora» e' in cima e, senza scorrere, si vedono interi il tasto
      «Negozia rinnovo» e il compito «Prepara rinnovo» (sopra la barra in basso); «Fai girare il nome» sta entro il primo schermo.
      Misurato a 375x667 e 390x844. I tasti fanno cio' che facevano sotto: «Prepara rinnovo» assegna il compito (e la riga sparisce),
      «Fai girare il nome» consuma la ricerca della finestra. Senza nulla in scadenza il riquadro non c'e'.
   B. PO-446: quando il tasto «Vai al prossimo momento» si ferma sul rinnovo, il riquadro dice dove andare e ha il tasto che porta
      alla scheda Agente col riquadro in vista; la riga del motivo sotto il tasto spento («Prima rispondi al rinnovo») fa lo stesso.
   Rosso window.__CPM_NO_G198: niente riquadro, niente tasto nella fermata, motivo non toccabile → DEVE essere bocciato.
   Foto in docs/sviluppo/giro198/. Uscita 0 solo se il verde passa E ogni rosso e' bocciato («non giudicato» = rosso).
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node agente-198.mjs   (CPM_SOLO198=A,B) */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const SOLO = (process.env.CPM_SOLO198 || '').split(',').filter(Boolean);
const fai = (n) => !SOLO.length || SOLO.includes(n);
const FOTO = path.join(ROOT, 'docs', 'sviluppo', 'giro198'); fs.mkdirSync(FOTO, { recursive: true });
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const CLUB = { id: 'liv', n: 'FC Merseyside', a: 'MER', p: 90, c: '#dc2626', c2: '#f5f5f5', nat: '🏴', lg: 'Premier Division' };
const AP = { campDone: true, presidentModalSeason: 3, jerseyNumSeason: 3, drawSeen: 3, mercatoSeen: 3, presentSeason: 3 };
function salva(over = {}) {
  const s = 80;
  return { name: 'Guardiano Agente', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 20, weekLived: false, age: 25, ovr: s, tutorialDone: true, position: 'ATT',
    club: CLUB, stats: { 'velocità': s, tecnica: s, fisico: s, 'mentalità': s, tiro: s, passaggio: s, dribbling: s, posizionamento: s },
    form: 70, morale: 72, fatigue: 10, coachTrust: 80, popularity: 40, contract: { duration: 1, wage: 9000, expiresAtSeason: 3 }, matchHistory: [], bankBalance: 80000, u18Seasons: 1,
    hasAgent: true, agent: { id: 'ag1', name: 'Marco Gestini', style: 'boutique', rapport: 60 }, agentTask: null, richiamo198: { s: 3, n: 2 }, renewWarn94: 3,
    history: [], worldMemory: [], rival: null, totalMatches: 61, totalGoals: 31, log: [], ...AP, ...over };
}
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
async function apri(player, flag, w = 375, h = 667) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await installCdnRoutes(page);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
  await page.addInitScript(([pl, f]) => { window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; if (f) window[f] = 1; localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: pl })); }, [player, flag]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 });
  await sleep(900);
  await page.evaluate(() => { window.__CPM_CAREER.resolveOpening(); window.__CPM_SALTA153 = []; });
  await sleep(700);
  await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.chiudi163(); } catch (e) {} });
  await sleep(400);
  return { page, errors };
}
/* dove sta un elemento: frazione di schermo dall'alto del documento, e se e' intero sopra la barra in basso senza scorrere */
const dove = (page, sel) => page.evaluate((S) => {
  const el = document.querySelector(S); if (!el || !el.offsetParent) return null;
  const sc = document.querySelector('.cpm-scroll'); const off = sc ? sc.scrollTop : window.scrollY;
  const r = el.getBoundingClientRect(); const nav = [...document.querySelectorAll('body *')].filter(n => { const cs = getComputedStyle(n); if (cs.position !== 'fixed' && cs.position !== 'sticky') return false; const b = n.getBoundingClientRect(); return b.height > 30 && b.width > window.innerWidth * 0.6 && b.top > window.innerHeight * 0.5; }).map(n => n.getBoundingClientRect().top);/* la barra in basso (schede + «Sostieni»), fissa */
  const piede = nav.length ? Math.min(...nav) : window.innerHeight;
  return { top: +((r.top + off) / window.innerHeight).toFixed(2), bottom: +((r.bottom + off) / window.innerHeight).toFixed(2), intero: r.top >= 0 && r.bottom <= piede + 0.5, piede: Math.round(piede) };
}, sel);

try {
  if (fai('A')) {
    console.log('A) PO-456 · «Da fare ora» in cima alla scheda Agente');
    for (const [w, h] of [[375, 667], [390, 844]]) {
      for (const [flag, rosso] of [[null, false], ['__CPM_NO_G198', true]]) {
        const { page, errors } = await apri(salva(), flag, w, h);
        await page.evaluate(() => window.__CPM_CAREER.goTab('agente')); await sleep(900);
        const box = await dove(page, '[data-cpm="agente198-ora"]'), rin = await dove(page, '[data-cpm="agente198-rinnovo"]');
        const pre = await dove(page, '[data-cpm="agente198-compito-rinnovo"]'), cer = await dove(page, '[data-cpm="agente198-cerca"]');
        await page.screenshot({ path: path.join(FOTO, `${rosso ? 'prima' : 'dopo'}-agente-${w}x${h}.png`) });
        console.log(`    ${rosso ? 'rosso' : 'verde'} ${w}x${h}: riquadro ${JSON.stringify(box)} · rinnovo ${JSON.stringify(rin)} · prepara ${JSON.stringify(pre)} · cerca ${JSON.stringify(cer)}`);
        const verde = !!box && box.top < 0.6 && !!rin && rin.intero && !!pre && pre.intero && !!cer && cer.top < 1 && !errors.length;
        if (!rosso) ok(verde, `verde A ${w}x${h}: riquadro in cima, «Negozia rinnovo» e «Prepara rinnovo» visibili senza scorrere, «Fai girare il nome» nel primo schermo`);
        else ok(!verde, `rosso A ${w}x${h} bocciato (niente riquadro in cima)`);
        if (!rosso && w === 375 && verde) {
          await page.click('[data-cpm="agente198-compito-rinnovo"]'); await sleep(600);
          const t = await page.evaluate(() => ({ task: window.__CPM_CAREER.snapshot().agentTask, riga: !!document.querySelector('[data-cpm="agente198-compito"]') }));
          ok(t.task === 'rinnovo' && !t.riga, `«Prepara rinnovo» dal riquadro assegna il compito e la riga esce (task ${t.task}, riga ${t.riga})`);
          await page.click('[data-cpm="agente198-cerca"]'); await sleep(800);
          const c = await page.evaluate(() => ({ usato: !!window.__CPM_CAREER.snapshot().windowOfferUsed, riga: !!document.querySelector('[data-cpm="agente198-mercato"]') }));
          ok(c.usato && !c.riga, `«Fai girare il nome» dal riquadro consuma la ricerca della finestra (usata ${c.usato}, riga ${c.riga})`);
          await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(300);
          await page.click('[data-cpm="agente198-rinnovo"]'); await sleep(600);
          const n = await page.evaluate(() => /Accetta l'offerta del club|rinnovo/i.test(document.body.innerText) && !!document.querySelector('.cpm-velo150'));
          ok(n, '«Negozia rinnovo» dal riquadro apre la trattativa');
        }
        await page.close();
      }
    }
    /* niente in scadenza: contratto lungo, mercato chiuso, compito assegnato → nessun riquadro */
    const { page, errors } = await apri(salva({ week: 10, contract: { duration: 3, wage: 9000, expiresAtSeason: 5 }, agentTask: 'immagine' }), null);
    await page.evaluate(() => window.__CPM_CAREER.goTab('agente')); await sleep(900);
    const vuoto = await page.evaluate(() => !document.querySelector('[data-cpm="agente198-ora"]') && (!!document.querySelector('[data-cpm="agente-v2"]') || /^agente$/i.test((document.querySelector('[data-cpm=titolo235]') || {}).textContent || '')));/* [giro 260] titolo solo nella testata */
    ok(vuoto && !errors.length, 'senza nulla in scadenza il riquadro non c\'e\' (scheda Agente aperta)');
    await page.close();
  }

  if (fai('B')) {
    /* [giro 268] un evento settimanale (foglio cpm-foglio114, es. «L'Offerta della Notte») puo' uscire a caso entrando nella settimana e
       coprire il tasto: misurato su lavoro/197 (TimeoutError del clic, «non giudicato»). Il giocatore lo chiude prima; la sonda lo chiude
       con l'aggancio dei modali (__CPM_CAREER.dismiss) e lo DICHIARA nella riga del braccio. */
    var chiudiEvento = async (pg) => { const tt = []; for (let i = 0; i < 4; i++) { const t = await pg.evaluate(() => { const f = document.querySelector('.cpm-foglio114'); if (!f) return null; const x = (f.innerText || '').split('\n')[0].slice(0, 40); try { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.chiudi163(); } catch (e) {} return x; }); if (!t) break; tt.push(t); await sleep(500); } return tt.join(' / ') || null; };/* dismiss: eventi della settimana, offerte; chiudi163: momenti di carriera, mese, traguardi */
    console.log('B) PO-446 · la fermata del tasto porta dove c\'e\' la cosa da fare');
    for (const [flag, rosso] of [[null, false], ['__CPM_NO_G198', true], ['__CPM_NO_G268', 'g268']]) {/* [giro 268] terzo braccio: riquadro senza respiro sopra */
      /* B1: la corsa si ferma entrando nella settimana 28 (rinnovo) */
      const { page, errors } = await apri(salva({ week: 27, weekLived: true }), flag);
      const premuto = await page.evaluate(() => { const t = document.querySelector('[data-cpm="salta163-tasto"]'); if (!t || t.disabled) return false; t.click(); return true; });
      await sleep(450);
      const vai = premuto && await page.evaluate(() => { const v = document.querySelector('[data-cpm="salta163-vai"]'); if (!v) return false; v.click(); return true; });
      const t0 = Date.now(); await sleep(500);
      while (vai && Date.now() - t0 < 60000) { const st = await page.evaluate(() => { const e = document.querySelector('[data-cpm="salta163"]'); return e && e.getAttribute('data-salta163'); }); if (st !== 'corsa') break; await sleep(300); }
      await sleep(600);
      const f = await page.evaluate(() => { const L = window.__CPM_SALTA153 || []; const rp = document.querySelector('[data-cpm="salta163-riepilogo"]'); return { mot: (L[L.length - 1] || {}).motivo, riep: rp ? rp.innerText.replace(/\n/g, ' | ') : null, tasto: !!document.querySelector('[data-cpm="salta198-vai"]') }; });
      if (!rosso) { const card = await page.$('[data-cpm="corsa163"]'); if (card) { await card.scrollIntoViewIfNeeded(); await card.screenshot({ path: path.join(FOTO, 'dopo-fermata-rinnovo-375.png') }); } }
      else { const card = await page.$('[data-cpm="corsa163"]'); if (card) { await card.scrollIntoViewIfNeeded(); await card.screenshot({ path: path.join(FOTO, 'prima-fermata-rinnovo-375.png') }); } }
      let arrivo = null;
      const ev1 = await chiudiEvento(page);
      if (f.tasto) { await page.click('[data-cpm="salta198-vai"]'); await sleep(900); arrivo = await page.evaluate(() => { const b = document.querySelector('[data-cpm="agente198-ora"]'); const r = b && b.getBoundingClientRect(); return { tab: !!document.querySelector('[data-cpm="agente-v2"]') || /^agente$/i.test((document.querySelector('[data-cpm=titolo235]') || {}).textContent || '')/* [giro 268] dal giro 260 il titolo sta solo nella testata, come in A */, vista: !!r && r.top >= 0 && r.top < window.innerHeight * 0.5 }; }); }
      console.log(`    ${rosso ? 'rosso' : 'verde'} B1: premuto ${premuto && vai} · fermata «${f.mot}» · riepilogo «${f.riep}» · tasto ${f.tasto} · arrivo ${JSON.stringify(arrivo)}${ev1 ? ' · evento chiuso dalla sonda «' + ev1 + '»' : ''}`);
      const v1 = f.mot === 'rinnovo' && f.tasto && /scheda Agente/.test(f.riep || '') && !!arrivo && arrivo.tab && arrivo.vista && !errors.length;
      if (rosso === 'g268') { ok(f.tasto && !!arrivo && arrivo.tab && !arrivo.vista, 'rosso __CPM_NO_G268 B1 bocciato (riquadro incollato al bordo, fuori vista di una frazione di pixel)'); await page.close(); continue; }
      if (!rosso) ok(v1, 'verde B1: la fermata sul rinnovo dice dove andare e il tasto porta all\'Agente col riquadro in vista');
      else ok(f.mot === 'rinnovo' && !v1, 'rosso B1 bocciato (fermata sul rinnovo senza tasto)');
      await page.close();
      /* B2: il tasto e' spento col motivo «Prima rispondi al rinnovo»: la riga del motivo porta all'Agente */
      const q = await apri(salva({ week: 29 }), flag);
      const m = await q.page.evaluate(() => { const e = document.querySelector('[data-cpm="salta163-motivo"]'); return e ? { txt: e.innerText, tag: e.tagName } : null; });
      let arr2 = null;
      const ev2 = await chiudiEvento(q.page);
      if (m && m.tag === 'BUTTON') { await q.page.click('[data-cpm="salta163-motivo"]'); await sleep(900); arr2 = await q.page.evaluate(() => { const b = document.querySelector('[data-cpm="agente198-ora"]'); const r = b && b.getBoundingClientRect(); return { tab: !!document.querySelector('[data-cpm="agente-v2"]') || /^agente$/i.test((document.querySelector('[data-cpm=titolo235]') || {}).textContent || '')/* [giro 268] dal giro 260 il titolo sta solo nella testata, come in A */, vista: !!r && r.top >= 0 && r.top < window.innerHeight * 0.5 }; }); }
      console.log(`    ${rosso ? 'rosso' : 'verde'} B2: motivo ${JSON.stringify(m)} · arrivo ${JSON.stringify(arr2)}${ev2 ? ' · evento chiuso dalla sonda «' + ev2 + '»' : ''}`);
      const v2 = !!m && /Prima rispondi al rinnovo/.test(m.txt) && m.tag === 'BUTTON' && !!arr2 && arr2.tab && arr2.vista && !q.errors.length;
      if (!rosso) ok(v2, 'verde B2: il motivo «Prima rispondi al rinnovo» si tocca e porta all\'Agente col riquadro in vista');
      else ok(!!m && !v2, 'rosso B2 bocciato (motivo solo testo)');
      await q.page.close();
    }
  }
} finally { await browser.close(); srv.close(); }
console.log(fails.length ? `❌ ROSSO — ${fails.length} controlli: ${fails.join(' · ')}` : '✅ VERDE — agente-198 (A «Da fare ora» in cima · B la fermata porta all\'Agente), rossi bocciati');
process.exit(fails.length ? 1 : 0);
