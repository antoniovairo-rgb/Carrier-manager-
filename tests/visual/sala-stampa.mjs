/* [G18 · 22/09 — «schermata rotta e brutta», rilievo PO dal suo Android sulla SALA STAMPA]
   Questa schermata non e' mai stata nel metro: la griglia misura sedici schermate e l'intervista
   post-partita non e' fra quelle. Il difetto che il PO ha fotografato — il pannello stretto, spinto a
   destra e tagliato fuori schermo — nasceva da un commento in stile C NUDO fra due espressioni JSX,
   cioe' TESTO dentro un contenitore flex.
   Qui si misura quello che la foto mostrava: dove sta la scheda dell'intervista, quanto e' larga, se
   esce dal viewport, e se nel modale c'e' testo che nessuno ha voluto (il commento). */
import fs from 'node:fs';
import path from 'node:path';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const { startServer, launchBrowser, installCdnRoutes, sleep } = await import('./lib/harness.mjs');
const { SAVE, INIT } = await import('./lib/banco-g0.mjs');

/* [G18 b] LA CONTROPROVA. Una misura verde senza il suo rosso non prova niente: con CPM_HTML si punta
   la sonda a un ALTRO build servito dalla stessa radice — per esempio quello del commit precedente — e
   si guarda se la sonda avrebbe visto il difetto che il PO ha fotografato. */
const HTML = process.env.CPM_HTML || 'CARRIER-MANAGER-AV.html';
const TAGLIE = [{ w: 360, h: 800 }, { w: 375, h: 812 }, { w: 390, h: 844 }, { w: 412, h: 915 }, { w: 430, h: 932 }];
const CTX = (process.env.CPM_CTX || 'win,draw,loss').split(',');

const MISURA = (W) => {
  const velo = [...document.querySelectorAll('body > div, body > div *')].find(e => {
    const s = getComputedStyle(e);
    return s.position === 'fixed' && +s.zIndex >= 9999 && e.getBoundingClientRect().width > W * 0.8;
  });
  if (!velo) return { aperto: false };
  /* la scheda e' l'unico figlio del velo che NON e' la scenografia */
  const figli = [...velo.children];
  const scena = velo.querySelector('[data-cpm-scena]');
  const card = figli.find(e => e !== scena && e.getBoundingClientRect().width > 40);
  const r = card ? card.getBoundingClientRect() : null;
  /* testo che vive DIRETTAMENTE nel velo: un commento nudo finisce esattamente li' */
  let nudo = '';
  for (const n of velo.childNodes) if (n.nodeType === 3 && n.textContent.trim()) nudo += n.textContent.trim() + ' ';
  const de = document.documentElement;
  return {
    aperto: true,
    W,
    cardL: r ? Math.round(r.left) : null,
    cardR: r ? Math.round(r.right) : null,
    cardW: r ? Math.round(r.width) : null,
    esceDx: r ? Math.max(0, Math.round(r.right - W)) : null,
    esceSx: r ? Math.max(0, Math.round(-r.left)) : null,
    centrata: r ? Math.abs(Math.round(r.left) - Math.round(W - r.right)) <= 2 : null,
    docOver: Math.max(0, de.scrollWidth - de.clientWidth),
    nudo: nudo.slice(0, 120),
    figurine: velo.querySelectorAll('[data-cpm-figurina]').length,
  };
};

const srv = await startServer();
const port = srv.address().port;
const browser = await launchBrowser();
console.log('=== LA SALA STAMPA ===\n');
const esito = {};
let rossi = 0;

for (const t of TAGLIE) {
  const page = await browser.newPage({ viewport: { width: t.w, height: t.h }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await installCdnRoutes(page);
  await page.addInitScript(INIT, { seme: 959, tema: 'chiaro', rossi: '', save: SAVE });
  await page.goto(`http://localhost:${port}/${HTML}?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
  await sleep(1200);
  /* [G18] il salvataggio in localStorage non entra da solo: la carriera si apre con lo stesso
     «Continua» che preme il giocatore — e' la via della griglia, non una scorciatoia. */
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (_e) {}
  const vivo = await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }).then(() => true).catch(() => false);
  if (!vivo) { console.log(`  ${t.w}px · la carriera non si e' aperta (__CPM_CAREER mai comparso)`); await page.close(); continue; }
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (_e) {}
  await sleep(600);
  for (const ctx of CTX) {
    const ok = await page.evaluate(c => { try { return !!(window.__CPM_CAREER && window.__CPM_CAREER.forceInterview && window.__CPM_CAREER.forceInterview(c)); } catch (_e) { return false; } }, ctx);
    if (!ok) { console.log(`  ${t.w}px · ${ctx} · IMPOSSIBILE APRIRE (varco forceInterview non disponibile)`); rossi++; continue; }
    await sleep(900);
    const m = await page.evaluate(MISURA, t.w);
    esito[`${t.w}-${ctx}`] = m;
    if (!m.aperto) { console.log(`  ${t.w}px · ${ctx} · il modale non e' comparso`); rossi++; continue; }
    const male = (m.esceDx > 0) || (m.esceSx > 0) || !m.centrata || !!m.nudo || m.docOver > 0;
    if (male) rossi++;
    console.log(`  ${String(t.w).padStart(3)}px · ${ctx.padEnd(5)} · scheda ${m.cardL}→${m.cardR} (larga ${m.cardW}) · esce dx ${m.esceDx} sx ${m.esceSx} · centrata ${m.centrata ? 'si' : 'NO'} · doc ${m.docOver}px · figurine ${m.figurine}` + (m.nudo ? `\n        ⚠️ TESTO NON VOLUTO nel velo: «${m.nudo}»` : ''));
    await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Chiudi|✕|Salta/.test(x.textContent || '')); if (b) b.click(); });
    await sleep(400);
  }
  await page.close();
}

console.log(rossi ? `\n❌ ${rossi} casi da sistemare` : '\n✅ PASS — la scheda dell\'intervista sta dentro lo schermo, centrata, e nel velo non c\'e\' testo che nessuno ha scritto');
const f = path.join(process.cwd(), 'docs', 'collaudo-grafico', 'g0', 'sala-stampa.json');
try { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(esito, null, 1)); console.log(`\n→ ${f}`); } catch (_e) {}
await browser.close(); srv.close();
process.exit(rossi ? 1 : 0);
