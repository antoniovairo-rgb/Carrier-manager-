#!/usr/bin/env node
/* [giro 188 · PO-400, decisione PO «Gioca e Simula, come sempre»] GUARDIANO gioca-188 — alla fermata «partita chiave» del tasto
   «Vai al prossimo momento» il riquadro della partita mostra il tasto Gioca (con le regole di sempre: convocato, non infortunato,
   non squalificato) e il tasto funziona: la partita parte. Caso della foto: FC Merseyside 3° a 6 punti dalla vetta, da W28.
   Giudica: fermata «partita chiave» raggiunta · riquadro aperto · tasto «Gioca…» presente · nessuna frase «Hai scelto Simula» ·
   tasto Simula presente · clic su Gioca → la partita monta (window.__CPM_PHASE risponde) · nessun errore di pagina.
   Foto 375 px del riquadro in docs/sviluppo/giro188/ (CPM_FOTO188=prima|dopo).
   Braccio rosso: CPM_ROSSO188=1 accende __CPM_NO_G188 (comportamento del giro 187) → il guardiano DEVE uscire 1.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node gioca-188.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const ROSSO = process.env.CPM_ROSSO188 === '1';
const FOTO = process.env.CPM_FOTO188 || '';
const fails = [], oks = [], note = [];
const ok = (c, m) => { (c ? oks : fails).push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const MER = { id: 'liv', n: 'FC Merseyside', a: 'MER', p: 96, c: '#dc2626', c2: '#f5f5f5', nat: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', lg: 'Premier Division' };
const AP = { campDone: true, presidentModalSeason: 3, jerseyNumSeason: 3, drawSeen: 3, mercatoSeen: 3, presentSeason: 3 };
const s = 80;
const PLAYER = { name: 'Guardiano Gioca', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 28, weekLived: false, age: 24, ovr: s, tutorialDone: true, position: 'ATT',
  club: MER, stats: { 'velocità': s, tecnica: s, fisico: s, 'mentalità': s, tiro: s + 2, passaggio: s, dribbling: s, posizionamento: s },
  form: 70, morale: 72, fatigue: 10, coachTrust: 80, popularity: 40, contract: { duration: 3, wage: 9000, expiresAtSeason: 6 }, matchHistory: [], bankBalance: 80000, u18Seasons: 1,
  history: [], worldMemory: [], rival: null, totalMatches: 61, totalGoals: 31, ...AP };
const COSTRUISCI = `(function(cfg){const P=window.__CPM_CAREER.snapshot();const all=(P.standings||[]);const noi=all.find(t=>t.id==='liv');const altri=all.filter(t=>t.id!=='liv');
  const io=cfg.io;const ord=[...altri.slice(0,io),noi,...altri.slice(io)];
  return ord.map((t,i)=>({...t,pts:Math.max(0,cfg.top-i*cfg.passo),gd:0,gf:0,ga:0}));})`;

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
const clicca = async (sel) => { const el = await page.$(sel); if (!el) return false; try { await el.scrollIntoViewIfNeeded(); await el.click({ timeout: 4000 }); return true; } catch (e) { return false; } };
try {
  await page.addInitScript(([pl, r]) => { window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; if (r) window.__CPM_NO_G188 = 1;
    localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: pl })); }, [PLAYER, ROSSO]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 });
  await sleep(1200);
  await page.evaluate((src) => { window.__CPM_CAREER.resolveOpening(); window.__CPM_SALTA153 = []; window.__CPM_CAREER.patch({ standings: eval(src)({ io: 2, top: 60, passo: 3 }) }); }, COSTRUISCI);
  await sleep(800);
  /* corsa del tasto fino alla prima fermata «partita chiave» */
  let fermata = null; const altre = [];
  for (let giro = 0; giro < 15 && !fermata; giro++) {
    if (!(await clicca('[data-cpm="salta163-tasto"]'))) { note.push('tasto non cliccabile al giro ' + giro); break; }
    await sleep(450); if (!(await clicca('[data-cpm="salta163-vai"]'))) { note.push('«vai» non cliccabile al giro ' + giro); break; }
    const t0 = Date.now(); let st = 'corsa';
    while (Date.now() - t0 < 200000) { st = await page.evaluate(() => { const el = document.querySelector('[data-cpm="salta163"]'); return el ? el.getAttribute('data-salta163') : 'assente'; }); if (st !== 'corsa') break; await sleep(400); }
    await sleep(600);
    const f = await page.evaluate(() => { const L = window.__CPM_SALTA153 || []; return L[L.length - 1] || null; });
    const motivo = f ? f.motivo : '?';
    if (motivo === 'partita chiave') { fermata = f; break; }
    altre.push(`W${f && f.w}:${motivo}`);
    if (motivo === 'fine stagione') break;
    await page.evaluate(() => { try { window.__CPM_CAREER.scegli(0); } catch (e) {} window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.chiudi163(); const p = window.__CPM_CAREER.snapshot(); if (p.transferSaga && !p.transferSaga.delivered) window.__CPM_CAREER.patch({ transferSaga: null }); });
    await sleep(900);
    await page.evaluate(() => { const b = [...document.querySelectorAll('[data-cpm="salta163-riepilogo"] button')].pop(); if (b) b.click(); }); await sleep(300);
    for (let k = 0; k < 5; k++) { await sleep(400); const v = await page.evaluate(() => { const v = document.querySelector('.cpm-velo150'); if (!v) return null; const b = [...v.querySelectorAll('button')].find(x => !x.disabled); if (b) b.click(); return 1; }); if (!v) break; }
  }
  note.push('fermate prima della partita chiave: ' + (altre.join(' | ') || '—'));
  ok(!!fermata, `fermata «partita chiave» raggiunta${fermata ? ` (W${fermata.w} · ${fermata.perche})` : ''}`);
  if (fermata) {
    /* il riepilogo della corsa copre il riquadro: lo si chiude come farebbe il giocatore */
    await page.evaluate(() => { const b = [...document.querySelectorAll('[data-cpm="salta163-riepilogo"] button')].pop(); if (b) b.click(); }); await sleep(900);
    const r = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].filter(x => x.offsetParent !== null);
      const t = b.map(x => (x.textContent || '').trim());
      return { gioca: t.filter(x => /^Gioca/.test(x)), simula: !!document.querySelector('[data-cpm="simula-conferma"]'), frase: !!document.querySelector('[data-cpm="simula-scelta"]'),
        titolo: (document.body.innerText.match(/Partita chiave[^\n]*/) || [''])[0], dec: (window.__CPM_CAREER.snapshot() || {}).injured }; });
    note.push(`riquadro: titolo «${r.titolo}» · tasti Gioca ${JSON.stringify(r.gioca)} · Simula ${r.simula} · frase «Hai scelto Simula» ${r.frase}`);
    if (FOTO) { const p = `../../docs/sviluppo/giro188/${FOTO}-375.png`; await page.screenshot({ path: p }); note.push('foto → ' + p); }
    ok(r.simula, 'il tasto «Simula e avanza la settimana» c\'è');
    ok(!r.frase, 'nessuna frase «Hai scelto Simula» alla fermata per partita chiave');
    ok(r.gioca.length > 0, `il tasto Gioca c'è (${r.gioca.join(' / ') || 'assente'})`);
    if (r.gioca.length) {
      await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.offsetParent !== null && /^Gioca la partita|^Gioca · parti/.test((x.textContent || '').trim())); if (b) b.click(); });
      let fase = null; const t0 = Date.now();
      while (Date.now() - t0 < 20000) { fase = await page.evaluate(() => { try { return window.__CPM_PHASE ? window.__CPM_PHASE() : null; } catch (e) { return null; } }); if (fase) break; await sleep(300); }
      ok(!!fase, `clic su Gioca → la partita parte (fase ${fase})`);
      if (FOTO && fase) { await sleep(1500); await page.screenshot({ path: `../../docs/sviluppo/giro188/${FOTO}-partita-375.png` }); }
    }
  }
  ok(errors.length === 0, `nessun errore di pagina${errors.length ? ' — ' + errors[0] : ''}`);
} catch (e) { ok(false, 'eccezione: ' + (e && e.stack || e).toString().slice(0, 300)); }
await browser.close(); srv.close();
console.log('\nNOTE'); for (const n of note) console.log('  · ' + n);
console.log(`\ngioca-188 ${ROSSO ? '[ROSSO __CPM_NO_G188]' : '[verde]'}: ${oks.length} ok, ${fails.length} ko`);
process.exit(fails.length ? 1 : 0);
