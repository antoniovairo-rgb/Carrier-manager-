#!/usr/bin/env node
/* [giro 198 · PO-432 (G193-01)] GUARDIANO svincolato-198 — il club ti richiama prima di perderti. Gioco vero (?cpmtest=1), handler
   veri (step / startNewSeason), una pagina nuova per braccio, salvataggio portato a fine contratto con gli strumenti di prova.
   A. Due richiami del presidente in una FINESTRA se il contratto scade e non hai rinnovato: il 1° entrando nella sett. 19, il 2° nella
      33 (ultime sei settimane, «Mancano 6 settimane»). Ognuno una volta sola. «Parliamo del rinnovo» apre la trattativa vera.
      Nessun richiamo se hai gia' rinnovato, ne' se il club non vuole trattare (fiducia < 40: openNegoModal rifiuterebbe).
   B. A fine stagione, restando svincolato: la schermata «Sei svincolato» (club, perche' non giochi, le due strade), poi la Home lo
      dice per prima cosa (riquadro sopra il tasto del momento), la testata non dice piu' «N° posto» del club ma «Svincolato · ultimo
      club», la card dell'eroe dice «svincolato» e non il ruolo in squadra. Nessuna regola economica cambia (PO-157).
   Rosso window.__CPM_NO_G198: niente richiami, l'avviso che scorre al posto della schermata, Home come prima → DEVE essere bocciato.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node svincolato-198.mjs   (CPM_SOLO198=A,B) */
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
  return { name: 'Guardiano Svincolo', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 18, weekLived: true, age: 27, ovr: s, tutorialDone: true, position: 'ATT',
    club: CLUB, stats: { 'velocità': s, tecnica: s, fisico: s, 'mentalità': s, tiro: s, passaggio: s, dribbling: s, posizionamento: s },
    form: 70, morale: 72, fatigue: 10, coachTrust: 80, popularity: 40, contract: { duration: 1, wage: 9000, expiresAtSeason: 3 }, matchHistory: [], bankBalance: 80000, u18Seasons: 1,
    hasAgent: true, agent: { id: 'ag1', name: 'Marco Gestini', style: 'boutique', rapport: 60 }, agentTask: 'immagine', renewWarn94: 3,
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
  await page.evaluate(() => { window.__CPM_CAREER.resolveOpening(); });
  await sleep(700);
  return { page, errors };
}
const richiamo = (page) => page.evaluate(() => { const e = document.querySelector('[data-cpm="richiamo198-corpo"]'); const p = window.__CPM_CAREER.snapshot();
  return { w: p.week, n: e ? +e.getAttribute('data-n') : 0, txt: e ? e.closest('[data-cpm="richiamo198"]').innerText.replace(/\n/g, ' | ') : null, mem: p.richiamo198 || null }; });
/* avanza di una settimana coi gestori veri: la settimana gia' vissuta si chiude con step (simula o avanza) */
async function avanza(page, w0) { for (let i = 0; i < 4; i++) { await page.evaluate(() => window.__CPM_CAREER.step()); await sleep(900); const w = await page.evaluate(() => window.__CPM_CAREER.snapshot().week); if (w !== w0) return w; } return null; }

try {
  if (fai('A')) {
    console.log('A) PO-432 a · i due richiami del presidente');
    for (const [flag, rosso] of [[null, false], ['__CPM_NO_G198', true]]) {
      /* A1: entrando nella settimana 19 */
      const a = await apri(salva(), flag);
      const w1 = await avanza(a.page, 18); const r1 = await richiamo(a.page);
      if (r1.n) await a.page.screenshot({ path: path.join(FOTO, 'dopo-richiamo-1-375.png') });
      let tratta = false;
      if (r1.n) { await a.page.click('[data-cpm="richiamo198-tratta"]'); await sleep(700); tratta = await a.page.evaluate(() => /Accetta l'offerta del club/.test(document.body.innerText) && !document.querySelector('[data-cpm="richiamo198"]')); }
      await a.page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(400);
      const w1b = await avanza(a.page, w1); const r1b = await richiamo(a.page);
      console.log(`    ${rosso ? 'rosso' : 'verde'} A1: sett ${w1} richiamo ${r1.n} «${r1.txt}» · trattativa ${tratta} · sett ${w1b} di nuovo ${r1b.n} · memoria ${JSON.stringify(r1b.mem)}`);
      const v1 = w1 === 19 && r1.n === 1 && /scade a fine stagione/.test(r1.txt || '') && tratta && r1b.n === 0 && !a.errors.length;
      if (!rosso) ok(v1, 'verde A1: 1° richiamo alla sett. 19 in una finestra, «Parliamo del rinnovo» apre la trattativa, non si ripete');
      else ok(w1 === 19 && !v1 && r1.n === 0, 'rosso A1 bocciato (nessun richiamo)');
      await a.page.close();
      /* A2: entrando nella settimana 33, dopo il primo */
      const b = await apri(salva({ week: 32, richiamo198: { s: 3, n: 1 } }), flag);
      const w2 = await avanza(b.page, 32); const r2 = await richiamo(b.page);
      if (r2.n && !rosso) await b.page.screenshot({ path: path.join(FOTO, 'dopo-richiamo-2-375.png') });
      if (r2.n) { await b.page.click('[data-cpm="richiamo198-dopo"]'); await sleep(400); }
      const w2b = await avanza(b.page, w2); const r2b = await richiamo(b.page);
      console.log(`    ${rosso ? 'rosso' : 'verde'} A2: sett ${w2} richiamo ${r2.n} «${r2.txt}» · sett ${w2b} di nuovo ${r2b.n}`);
      const v2 = w2 === 33 && r2.n === 2 && /Mancano 6 settimane/.test(r2.txt || '') && r2b.n === 0 && !b.errors.length;
      if (!rosso) ok(v2, 'verde A2: 2° richiamo alla sett. 33 («Mancano 6 settimane»), «Ci penso» chiude e non torna');
      else ok(w2 === 33 && !v2 && r2.n === 0, 'rosso A2 bocciato (nessun richiamo)');
      await b.page.close();
      if (rosso) continue;
      /* A3: gia' rinnovato → nessun richiamo; A4: il club non vuole trattare (fiducia 30) → nessun richiamo */
      for (const [nome, over] of [['rinnovato', { renewalSeason: 3, contract: { duration: 3, wage: 9000, expiresAtSeason: 5 } }], ['club che rifiuta (fiducia 30)', { coachTrust: 30 }]]) {
        const c = await apri(salva(over), flag);
        const wc = await avanza(c.page, 18); const rc = await richiamo(c.page);
        console.log(`    ${nome}: sett ${wc} richiamo ${rc.n}`);
        ok(wc === 19 && rc.n === 0 && !c.errors.length, `${nome}: nessun richiamo alla sett. 19`);
        await c.page.close();
      }
    }
  }

  if (fai('B')) {
    console.log('B) PO-432 b-c · la schermata dello svincolato e la Home coerente');
    for (const [flag, rosso] of [[null, false], ['__CPM_NO_G198', true]]) {
      const { page, errors } = await apri(salva({ week: 38, richiamo198: { s: 3, n: 2 } }), flag);
      await page.evaluate(() => window.__CPM_CAREER.startNewSeason()); await sleep(2200);
      const s = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); const m = document.querySelector('[data-cpm="svincolato198"]'); return { s: p.season, exp: !!p.contractExpired, wage: p.contract && p.contract.wage, bank: p.bankBalance, txt: m ? m.innerText.replace(/\n/g, ' | ') : null }; });
      if (s.txt) await page.screenshot({ path: path.join(FOTO, 'dopo-schermata-svincolato-375.png') });
      if (s.txt) { await page.click('[data-cpm="svincolato198-casa"]'); await sleep(500); }
      await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.chiudi163(); window.__CPM_CAREER.goTab('dashboard'); } catch (e) {} }); await sleep(1000);
      const h = await page.evaluate(() => { const top = (sel) => { const e = document.querySelector(sel); return e ? e.getBoundingClientRect().top : null; };
        const meta = document.querySelector('[data-cpm="testata-meta106"]'); const root = document.getElementById('root').innerText;
        return { card: top('[data-cpm="svincolato198-home"]'), corsa: top('[data-cpm="corsa163"]'), meta: meta ? meta.innerText : null, ruolo: /·\s*svincolato/.test(root), rotazione: /in rotazione/.test(root) }; });
      await page.screenshot({ path: path.join(FOTO, `${rosso ? 'prima' : 'dopo'}-home-svincolato-375.png`) });
      console.log(`    ${rosso ? 'rosso' : 'verde'}: stagione ${s.s} svincolato ${s.exp} · schermata «${s.txt}» · home ${JSON.stringify(h)}`);
      const verde = s.s === 4 && s.exp && /Sei svincolato/.test(s.txt || '') && /FC Merseyside/.test(s.txt || '') && /non sei convocato/.test(s.txt || '')
        && h.card != null && h.corsa != null && h.card < h.corsa && /^Svincolato/.test(h.meta || '') && !/posto/.test(h.meta || '') && h.ruolo && !h.rotazione && !errors.length;
      if (!rosso) ok(verde, 'verde B: schermata «Sei svincolato» (club, perche\', due strade), riquadro in cima alla Home, testata e ruolo coerenti');
      else ok(s.exp && !verde, 'rosso B bocciato (avviso che scorre, Home che racconta il club)');
      if (!rosso && s.txt) {
        /* le due strade portano davvero: Agente col riquadro in vista */
        await page.click('[data-cpm="svincolato198-home-agente"]').catch(() => {}); await sleep(900);
        const ag = await page.evaluate(() => { const b = document.querySelector('[data-cpm="agente198-contratto"]'); return !!b && /svincolato/.test(b.innerText); });
        ok(ag, 'dalla Home «Cerca una squadra» porta all\'Agente, dove «Da fare ora» dice «Contratto scaduto: sei svincolato»');
      }
      await page.close();
    }
  }
} finally { await browser.close(); srv.close(); }
console.log(fails.length ? `❌ ROSSO — ${fails.length} controlli: ${fails.join(' · ')}` : '✅ VERDE — svincolato-198 (A due richiami del presidente · B schermata dello svincolato e Home coerente), rossi bocciati');
process.exit(fails.length ? 1 : 0);
