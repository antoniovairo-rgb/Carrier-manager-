/* [G17 · 22/09 — «la home si muove a destra e sinistra», rilievo PO dal suo Android]
   PERCHE' IL METRO NON L'HA VISTO: la griglia, prima di misurare, CONGELA le animazioni e le transizioni
   (`congela()`). Un elemento che sporge solo mentre si muove — o mentre una transizione e' a meta' — non
   puo' quindi comparire nel rapporto: l'overflow viene fotografato a riposo.
   QUI si fa il contrario: niente congelamento, si campiona per qualche secondo e si tiene il PEGGIO.
   Per ogni campione: scrollWidth-clientWidth di body e documentElement, e l'elenco degli elementi il cui
   rettangolo esce dal viewport, col loro selettore e di quanti pixel escono. Non tocca il gioco. */
import fs from 'node:fs';
import path from 'node:path';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const { startServer, launchBrowser, installCdnRoutes, sleep } = await import('./lib/harness.mjs');
const { SAVE, INIT } = await import('./lib/banco-g0.mjs');/* la STESSA carriera del rapporto (stagione 12), non una copia */

const TAGLIE = (process.env.CPM_W ? [Number(process.env.CPM_W)] : [360, 375, 390, 412, 430]).map(w => ({ w, h: w >= 430 ? 932 : w >= 412 ? 915 : w >= 390 ? 844 : w >= 375 ? 812 : 800 }));
const CAMPIONI = Number(process.env.CPM_CAMPIONI || 24);   /* campioni per taglia */
const PASSO = Number(process.env.CPM_PASSO || 250);        /* ms fra un campione e l'altro */

const SONDA = (W) => {
  const de = document.documentElement, bd = document.body;
  const fuori = [];
  const vis = (el) => { const s = getComputedStyle(el); return s.display !== 'none' && s.visibility !== 'hidden' && +s.opacity > 0.02; };
  const sel = (el) => {
    const p = [];
    for (let n = el, i = 0; n && n.nodeType === 1 && i < 4; n = n.parentElement, i++) {
      let t = n.tagName.toLowerCase();
      if (n.getAttribute && n.getAttribute('data-cpm')) t += `[data-cpm="${n.getAttribute('data-cpm')}"]`;
      else if (n.className && typeof n.className === 'string' && n.className.trim()) t += '.' + n.className.trim().split(/\s+/)[0];
      p.unshift(t);
    }
    return p.join('>');
  };
  /* [G17 b] IL BODY NON E' L'UNICO CHE PUO' SCORRERE. La prima corsa ha trovato un elemento che esce di
     25-27 px a SINISTRA dentro `div.cpm-scroll`, con body e documentElement a zero: il metro ufficiale
     guarda solo il body, e un contenitore intermedio che scorre gli e' invisibile. Qui si censiscono
     anche i contenitori scorrevoli, e del colpevole si dice tutto quello che serve a trovarlo nel
     sorgente: tag, classi, data-cpm, il pezzo di stile inline che lo sposta, e chi e' suo padre. */
  const contenitori = [];
  for (const el of document.querySelectorAll('body *')) {
    if (!vis(el)) continue;
    const s = getComputedStyle(el);
    if (/(auto|scroll)/.test(s.overflowX) && el.scrollWidth - el.clientWidth >= 1)
      contenitori.push({ over: el.scrollWidth - el.clientWidth, sel: sel(el), ox: s.overflowX });
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    /* [G17 c · errore mio, corretto sulla misura] la prima stesura segnalava un anello decorativo con
       `left:-30px` dentro la testata rossa — ma quel padre ha `overflow:hidden`, quindi l'anello e'
       RITAGLIATO e non sposta un pixel di nulla. Un rettangolo che esce dal viewport conta solo se
       nessun antenato lo taglia: qui si risale la catena e si scarta chi e' gia' tagliato. */
    let tagliato = false;
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const sa = getComputedStyle(a);
      if (/(hidden|clip)/.test(sa.overflowX) || /(hidden|clip)/.test(sa.overflowY)) { tagliato = true; break; }
    }
    if (tagliato) continue;
    const oltre = Math.max(0, Math.round(r.right - W), Math.round(-r.left));
    if (oltre >= 1) fuori.push({
      oltre, l: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width),
      sel: sel(el), txt: (el.textContent || '').trim().slice(0, 34),
      tag: el.tagName.toLowerCase(),
      cls: (typeof el.className === 'string' ? el.className : '').trim().slice(0, 60),
      cpm: el.getAttribute && el.getAttribute('data-cpm') || '',
      stile: (el.getAttribute && el.getAttribute('style') || '').slice(0, 220),
      pos: s.position, tras: s.transform === 'none' ? '' : s.transform, anim: s.animationName === 'none' ? '' : s.animationName,
      padre: el.parentElement ? ((el.parentElement.getAttribute && el.parentElement.getAttribute('style') || '').slice(0, 160)) : '',
      figli: el.children.length,
    });
  }
  fuori.sort((a, b) => b.oltre - a.oltre);
  return {
    bodyOver: Math.max(0, bd.scrollWidth - bd.clientWidth),
    docOver: Math.max(0, de.scrollWidth - de.clientWidth),
    scrollX: window.scrollX | 0,
    fuori: fuori.slice(0, 6),
    contenitori: contenitori.slice(0, 5),
  };
};

const srv = await startServer();
const port = srv.address().port;
const browser = await launchBrowser();

console.log('=== LA HOME SI MUOVE A DESTRA E SINISTRA? ===');
console.log(`  ${CAMPIONI} campioni per taglia, uno ogni ${PASSO} ms, SENZA congelare animazioni e transizioni\n`);

const esito = {};
for (const t of TAGLIE) {
  const page = await browser.newPage({ viewport: { width: t.w, height: t.h }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await installCdnRoutes(page);
  await page.addInitScript(INIT, { seme: 959, tema: 'chiaro', rossi: '', save: SAVE });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
  await sleep(1200);
  /* [G18] il salvataggio in localStorage non entra da solo: la carriera si apre con lo stesso
     «Continua» che preme il giocatore — e' la via della griglia, non una scorciatoia. */
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (_e) {}
  const vivo = await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }).then(() => true).catch(() => false);
  if (!vivo) { console.log(`  ${t.w}px · la carriera non si e' aperta (__CPM_CAREER mai comparso)`); await page.close(); continue; }
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (_e) {}
  await sleep(600);

  let peggio = { bodyOver: 0, docOver: 0, fuori: [] };
  for (let i = 0; i < CAMPIONI; i++) {
    const m = await page.evaluate(SONDA, t.w).catch(() => null);
    if (m) {
      if (m.bodyOver > peggio.bodyOver || m.docOver > peggio.docOver || (m.fuori[0]?.oltre || 0) > (peggio.fuori[0]?.oltre || 0)) peggio = m;
    }
    await sleep(PASSO);
  }
  /* [G17 c] LA PROVA DEL DITO. «Si muove a destra e sinistra» vuol dire che il dito lo muove: un
     contenitore puo' non sporgere a riposo e farsi comunque trascinare. Qui si trascina davvero — tre
     swipe orizzontali sulla home — e poi si legge se QUALCOSA si e' spostato: lo scroll della finestra,
     e lo scrollLeft di ogni contenitore della pagina. */
  const primaDel = await page.evaluate(() => ({ x: window.scrollX | 0, n: [...document.querySelectorAll('body *')].map(e => e.scrollLeft | 0) })).catch(() => null);
  for (const [x0, x1] of [[t.w - 30, 30], [30, t.w - 30], [t.w - 30, 30]]) {
    await page.mouse.move(x0, Math.round(t.h * 0.45));
    await page.mouse.down();
    for (let k = 1; k <= 8; k++) await page.mouse.move(Math.round(x0 + (x1 - x0) * k / 8), Math.round(t.h * 0.45));
    await page.mouse.up();
    await sleep(260);
  }
  const dopoDel = await page.evaluate(() => {
    const mossi = [];
    [...document.querySelectorAll('body *')].forEach(e => { if ((e.scrollLeft | 0) !== 0) mossi.push({ sl: e.scrollLeft | 0, tag: e.tagName.toLowerCase(), cls: (typeof e.className === 'string' ? e.className : '').slice(0, 40) }); });
    return { x: window.scrollX | 0, mossi: mossi.slice(0, 5) };
  }).catch(() => null);
  const trascinato = !!(dopoDel && (dopoDel.x !== (primaDel ? primaDel.x : 0) || (dopoDel.mossi || []).length));
  peggio.trascinamento = dopoDel;
  console.log(`        prova del dito: scrollX ${primaDel ? primaDel.x : '?'} → ${dopoDel ? dopoDel.x : '?'}` +
    ((dopoDel && dopoDel.mossi.length) ? ` · contenitori spostati: ${dopoDel.mossi.map(m => `${m.tag}.${m.cls}=${m.sl}px`).join(', ')}` : ' · nessun contenitore spostato') +
    (trascinato ? '   ← SI MUOVE' : '   ✅ non si muove'));
  esito[t.w] = peggio;
  const capo = peggio.fuori[0];
  console.log(`  ${String(t.w).padStart(3)}px · body ${String(peggio.bodyOver).padStart(3)}px · doc ${String(peggio.docOver).padStart(3)}px` +
    (capo ? `  ← ${capo.sel}  esce di ${capo.oltre}px (left ${capo.l}, right ${capo.r}, largo ${capo.w})  «${capo.txt}»` : '  ✅ niente fuori bordo'));
  for (const f of peggio.fuori.slice(1)) console.log(`        · ${f.sel}  ${f.oltre}px  «${f.txt}»`);
  if (capo) {
    console.log(`        tag ${capo.tag} · classi «${capo.cls}» · data-cpm «${capo.cpm}» · position ${capo.pos}${capo.tras ? ' · transform ' + capo.tras : ''}${capo.anim ? ' · animation ' + capo.anim : ''} · ${capo.figli} figli`);
    console.log(`        style : ${capo.stile}`);
    console.log(`        padre : ${capo.padre}`);
  }
  for (const c of (peggio.contenitori || [])) console.log(`        contenitore che scorre: ${c.sel} · overflow-x ${c.ox} · scorre di ${c.over}px`);
  await page.close();
}

const fuoriFile = path.join(process.cwd(), 'docs', 'collaudo-grafico', 'g0', 'home-scorre.json');
try { fs.mkdirSync(path.dirname(fuoriFile), { recursive: true }); fs.writeFileSync(fuoriFile, JSON.stringify(esito, null, 1)); console.log(`\n→ ${fuoriFile}`); } catch (_e) {}
await browser.close(); srv.close();
