#!/usr/bin/env node
/* [giro 99, chiusura della 178] GUARDIANO DI CHIUSURA.
   Parte D9 — «GOOOOL!» leggibile (collaudo grafico PO-299). Gol veri dell'eroe (scene di tiro forzate, esito riuscito, GLB spento:
   la misura riguarda il sovrimpresso DOM sopra il quadro 3D), colori del club forzati col testimone di sola prova __CPM_G99COL
   (bianco, giallo, rosso, blu, verde, piu' il colore vero del club). Per ogni gol, ad animazione ferma, tre fotografie del
   riquadro della scritta: A composta · B col riempimento delle lettere trasparente (restano alone/contorno/pillola) · C senza
   sovrimpresso (solo il quadro 3D). Maschera delle lettere = pixel dove A e B differiscono. Misure (rapporto di luminanza WCAG):
     locale  = lettera (A sulla maschera) contro cio' che le sta dietro (B sulla maschera): alone dello stesso colore = 1
     quadro  = lettera contro il quadro 3D sotto (C sulla maschera): cartelloni/maglie del club dietro la scritta
   Soglia: mediana di min(locale, quadro) >= 4,5 e nessun gol sotto 3 (WCAG AA testo grande = 3).
   Parte RIC — ricevente dell'assist nel 3D: scene con passaggio d'assist forzate, il cast del motore nomina il ricevente
   (__CPM_B4RIC/__CPM_PT219, solo sonde): il compagno che riceve davvero nel 3D deve essere quello nominato, sempre.
   Rossi: CPM_ARMI=rosso accende __CPM_NO_G99D9 e __CPM_NO_G99RIC (ognuno deve vedersi). CPM_PARTI=D9|RIC per una parte sola.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node chiusura-99.mjs */
import fs from 'node:fs';
import zlib from 'node:zlib';
if (!process.env.CPM_CHROME && fs.existsSync('/opt/pw-browsers/chromium')) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH && fs.existsSync('/opt/pw-browsers')) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } = await import('./lib/harness.mjs');

const ARMI = (process.env.CPM_ARMI || 'verde,rosso').split(',');
const PARTI = (process.env.CPM_PARTI || 'D9,RIC').split(',');
const COLORI = (process.env.CPM_G99_COLORI || 'club,#ffffff,#facc15,#dc2626,#2563eb,#16a34a').split(',');
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();

/* PNG -> RGBA (8 bit, RGB/RGBA, non interlacciato: quello che produce Chromium) */
function png(buf) {
  let o = 8, w = 0, h = 0, ct = 0; const idat = [];
  while (o < buf.length) { const n = buf.readUInt32BE(o), t = buf.toString('ascii', o + 4, o + 8), d = buf.subarray(o + 8, o + 8 + n);
    if (t === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); ct = d[9]; } else if (t === 'IDAT') idat.push(d); else if (t === 'IEND') break; o += 12 + n; }
  const bpp = ct === 6 ? 4 : 3, raw = zlib.inflateSync(Buffer.concat(idat)), st = w * bpp, out = Buffer.alloc(w * h * 4); let prev = Buffer.alloc(st);
  for (let y = 0; y < h; y++) { const f = raw[y * (st + 1)], line = Buffer.from(raw.subarray(y * (st + 1) + 1, (y + 1) * (st + 1)));
    for (let x = 0; x < st; x++) { const a = x >= bpp ? line[x - bpp] : 0, b = prev[x], c = x >= bpp ? prev[x - bpp] : 0;
      const p = f === 1 ? a : f === 2 ? b : f === 3 ? (a + b) >> 1 : f === 4 ? (() => { const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c); return pa <= pb && pa <= pc ? a : pb <= pc ? b : c; })() : 0;
      line[x] = (line[x] + p) & 255; }
    for (let x = 0; x < w; x++) { out[(y * w + x) * 4] = line[x * bpp]; out[(y * w + x) * 4 + 1] = line[x * bpp + 1]; out[(y * w + x) * 4 + 2] = line[x * bpp + 2]; out[(y * w + x) * 4 + 3] = 255; }
    prev = line; }
  return { w, h, d: out };
}
const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const lum = (d, i) => 0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2]);
const med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
const rap = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

async function nuova(rosso) {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const page = await ctx.newPage(); await installCdnRoutes(page); page._errs = []; page.on('pageerror', e => page._errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript(r => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_B4REC = true; if (r) { window.__CPM_NO_G99D9 = 1; window.__CPM_NO_G99RIC = 1; } }, rosso);
  await openMatch(page, port, { name: 'Chiusura Novantanove' }); page._ctx = ctx; return page;
}
const fase = p => p.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);

async function parteD9(arm) {
  const rosso = arm === 'rosso'; const page = await nuova(rosso); const righe = [];
  const cat = await page.evaluate(() => SITUATIONS.map((s, gi) => ({ gi, a: (s.actions || []).map(a => { let h = {}; try { h = deriveHL(s, a) || {}; } catch (e) {} return { t: h.type || null, r: a.rew || a.reward || null }; }) })));
  const tiri = cat.filter(s => s.a.some(x => x.t === 'shot' && x.r === 'goal')).map(s => ({ gi: s.gi, k: s.a.findIndex(x => x.t === 'shot' && x.r === 'goal') }));
  let ti = 0;
  for (const col of COLORI) {
    let fatto = false;
    for (let tent = 0; tent < 4 && !fatto; tent++, ti += 7) {
      const s = tiri[ti % tiri.length];
      try {
      await page.evaluate(c => { if (c === 'club') delete window.__CPM_G99COL; else window.__CPM_G99COL = c; window.__CPM_FORCE_INTRO = 1; delete window.__CPM_FORCE_KIND; }, col);
      if (!await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), s.gi).catch(() => false)) continue;
      const t0 = Date.now(); while (Date.now() - t0 < 8000 && (await fase(page)) !== 'hl_choose') await sleep(150);
      await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; });
      if (!await page.evaluate(k => window.__CPM_RESOLVE(k), s.k).catch(() => false)) continue;
      const sel = rosso ? 'text=GOOOOL!' : '[data-cpm="gol99"]';
      const h = await page.waitForSelector(sel, { timeout: 20000 }).catch(() => null); if (!h) continue;
      await sleep(650);/* la scritta e' scesa (goalDrop) e sta ferma: si ferma ogni animazione e si fotografa */
      const box = await page.evaluate(sl => { const el = document.querySelector(sl.startsWith('text=') ? 'body' : sl); let e = el;
        if (sl.startsWith('text=')) { e = [...document.querySelectorAll('div')].find(d => d.childNodes.length === 1 && d.textContent === 'GOOOOL!'); }
        if (!e) return null;
        /* [giro 103] COPIA STATICA del sovrimpresso: il gioco smonta «GOOOOL!» con un timer di parete (2,6 s) e sotto carico le tre fotografie
           durano di piu' — l'elemento spariva fra A e C (TypeError su null: il crash della catena 178, 218 s). La copia non appartiene a React,
           quindi resta finche' la sonda la toglie; l'originale si nasconde. */
        let k = e; while (k.parentElement && !(k.style && k.style.zIndex === '22')) k = k.parentElement;
        const cl = k.cloneNode(true); cl.setAttribute('data-g103copia', '1'); k.parentElement.appendChild(cl); k.style.visibility = 'hidden'; k.setAttribute('data-g103orig', '1');
        e = sl.startsWith('text=') ? [...cl.querySelectorAll('div')].find(d => d.childNodes.length === 1 && d.textContent === 'GOOOOL!') : cl.querySelector(sl);
        if (!e) return null; e.setAttribute('data-g99m', '1'); document.querySelectorAll('*').forEach(n => { n.style.animationPlayState = 'paused'; });
        /* [giro 103] fermo-immagine DETERMINISTICO: prima si fotografava la scritta dove la trovava l'attesa (650 ms dopo un selettore che
           sotto carico arriva tardi), e oltre l'80% di goalDrop la scritta sfuma e cresce (scala 1,05): maschera 3.500 px invece di 2.400 e
           contrasto col quadro 2,7. Ora la scritta sta sempre al 65% (opacita' 1, scala 1), lo scossone del contenitore e' finito e il
           quadro 3D e' congelato (__CPM_FROZEN: dt=0) per le tre fotografie. */
        window.__CPM_FROZEN = 1;
        let o = e; while (o) { for (const an of (o.getAnimations ? o.getAnimations() : [])) { try { an.pause(); const nm = an.animationName || ''; const tt = an.effect && an.effect.getTiming ? an.effect.getTiming() : {}; const dur = +tt.duration || 0;
          an.currentTime = nm === 'goalDrop' ? 0.65 * (dur || 2600) : (dur || 0); } catch (_e) {} } o = o.parentElement; }
        const r = e.getBoundingClientRect(); return { x: Math.max(0, r.x - 4), y: Math.max(0, r.y - 4), width: r.width + 8, height: r.height + 8, col: getComputedStyle(e).color }; }, sel);
      if (!box) continue; const clip = { x: box.x, y: box.y, width: box.width, height: box.height };
      const A = png(await page.screenshot({ clip }));
      await page.evaluate(() => { const e = document.querySelector('[data-g99m]'); e.style.webkitTextFillColor = 'transparent'; });
      const B = png(await page.screenshot({ clip }));
      await page.evaluate(() => { const e = document.querySelector('[data-g99m]'); e.style.webkitTextFillColor = ''; document.querySelector('[data-g103copia]').style.visibility = 'hidden'; });
      const C = png(await page.screenshot({ clip }));
      await page.evaluate(() => { delete window.__CPM_FROZEN; document.querySelectorAll('*').forEach(n => { n.style.animationPlayState = ''; }); document.querySelectorAll('[data-g103copia]').forEach(n => n.remove()); document.querySelectorAll('[data-g103orig]').forEach(n => { n.style.visibility = ''; n.removeAttribute('data-g103orig'); }); });
      const tc = (String(box.col).match(/\d+/g) || [255, 255, 255]).map(Number);/* [giro 103] maschera = pixel di RIEMPIMENTO: diversi fra A e B e, in A, del colore della lettera (niente bordi sfumati del contorno) */
      const lt = [], lb = [], lc = []; for (let i = 0; i < A.d.length; i += 4) { const dd = Math.abs(A.d[i] - B.d[i]) + Math.abs(A.d[i + 1] - B.d[i + 1]) + Math.abs(A.d[i + 2] - B.d[i + 2]);
        const df = Math.abs(A.d[i] - tc[0]) + Math.abs(A.d[i + 1] - tc[1]) + Math.abs(A.d[i + 2] - tc[2]);
        if (dd > 90 && df < 120) { lt.push(lum(A.d, i)); lb.push(lum(B.d, i)); lc.push(lum(C.d, i)); } }
      if (lt.length < 60) { righe.push({ col, gi: s.gi, ko: 'maschera vuota ' + lt.length }); fatto = true; continue; }
      const L = med(lt), loc = rap(L, med(lb)), qua = rap(L, med(lc));
      righe.push({ col, gi: s.gi, px: lt.length, testo: box.col, locale: +loc.toFixed(2), quadro: +qua.toFixed(2), min: +Math.min(loc, qua).toFixed(2) }); fatto = true;
      const t1 = Date.now(); while (Date.now() - t1 < 15000 && /^hl_/.test(await fase(page) || '')) await sleep(200);
      } catch (e) { errori.push(`D9 ${arm} ${col} tentativo ${tent}: ${String(e && e.message || e).split('\n')[0].slice(0, 160)}`); await page.evaluate(() => { delete window.__CPM_FROZEN; document.querySelectorAll('*').forEach(n => { n.style.animationPlayState = ''; }); document.querySelectorAll('[data-g103copia]').forEach(n => n.remove()); document.querySelectorAll('[data-g103orig]').forEach(n => { n.style.visibility = ''; n.removeAttribute('data-g103orig'); }); }).catch(() => {}); }
    }
    if (!fatto) righe.push({ col, ko: 'nessun gol misurato' });
  }
  await page._ctx.close();
  const mis = righe.filter(r => r.min != null), m = med(mis.map(r => r.min)), sotto = mis.filter(r => r.min < 3);
  righe.forEach(r => console.log(`  ${arm} D9 ${String(r.col).padEnd(8)} gi${r.gi} ${r.ko ? '✗ ' + r.ko : `locale ${r.locale} · quadro ${r.quadro} · min ${r.min} (${r.px} px, testo ${r.testo})`}`));
  const ok = mis.length >= Math.ceil(COLORI.length * 0.8) && m >= 4.5 && !sotto.length;
  console.log(`${arm.toUpperCase()} D9 · gol misurati ${mis.length}/${COLORI.length} · mediana contrasto ${m == null ? '-' : m.toFixed(2)} · sotto 3: ${sotto.length} → ${ok ? 'VERDE' : 'ROSSO'}`);
  return { ok, cieco: mis.length < Math.ceil(COLORI.length * 0.8), perche: `gol misurati ${mis.length}/${COLORI.length} · mediana ${m == null ? '-' : m.toFixed(2)} · sotto 3: ${sotto.map(r => r.col + ' ' + r.min).join(', ') || 0}` };
}

/* RIC su partite vere: salvataggio S12, pilota automatico «assist» (come assist-nome-98). Il cast del motore esiste solo nel flusso vero
   (le scene forzate non hanno cast). Per ogni scena con ricevente nominato e un passaggio servito nella conclusione (__CPM_B4, solo
   sonde) si confronta il compagno servito nel 3D col nominato. */
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
async function partitaVera(sd, rosso) {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
  try { return await partitaVera0(ctx, sd, rosso); } finally { await ctx.close().catch(() => {}); }
}
async function partitaVera0(ctx, sd, rosso) {
  const page = await ctx.newPage(); await installCdnRoutes(page);
  const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' ' + sd;
  await page.addInitScript(([s, r, p1]) => { if (p1) window.__CPM_B4PRIMO = 1;/* [giro 104] CPM_B4PRIMO=1: lettura vecchia del ricevente (primo fotogramma di hl_result), per la prova */ window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_B4REC = true; window.__CPM_G99DIAG = true; window.__CPM_PRESENT = 1; if (r) window.__CPM_NO_G99RIC = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, rosso, !!process.env.CPM_B4PRIMO]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(s => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'assist', tickMs: 150 }), sd);
  const t0 = Date.now(); while (Date.now() - t0 < 420000) { const ph = await fase(page); if (ph === 'ended' || ph === 'ceremony') break; await sleep(1000); }
  return await page.evaluate(() => window.__CPM_B4 || {});
}
async function parteRIC(arm) {
  const rosso = arm === 'rosso'; const T = { n: 0, ok: 0, ko: [] };
  const semi = (process.env.CPM_G99_SEMI || '1234,2021').split(',').map(Number);
  for (const sd of semi) { let B4 = null;
    for (let t = 0; t < 2 && !B4; t++) { try { B4 = await partitaVera(sd, rosso); } catch (e) { errori.push(`RIC ${arm} seme ${sd} tentativo ${t}: ${String(e && e.message || e).split('\n')[0].slice(0, 160)}`); } }
    if (!B4) continue;
    for (const [k, e] of Object.entries(B4)) { const r = e.ricevente; if (r && e.prim104 && e.prim104.idx !== r.idx) T.stantio = (T.stantio | 0) + 1; if (e.prim104 && !e.prim104.conc) T.preConc = (T.preConc | 0) + 1;/* scene in cui il primo fotogramma di hl_result viene PRIMA della conclusione (costruzione in corso) *//* [giro 104] scene che la lettura vecchia (primo fotogramma di hl_result) avrebbe attribuito a un altro compagno */ if (!r || r.brain == null || r.brain === 21) continue;
      T.n++; if (r.idx === r.brain) T.ok++; else T.ko.push(`seme ${sd} scena ${k} (${e.sit}) servito ${r.idx} nominato ${r.brain} a ${r.d}u` + (process.env.CPM_G99_DIAG ? ' ' + JSON.stringify(e.ult99 || []) : '')); }
    console.log(`  ${arm} RIC seme ${sd}: ${T.ok}/${T.n} finora`); }
  const pc = T.n ? (100 * T.ok / T.n).toFixed(1) : '-'; const ok = T.n >= 4 && T.ok === T.n;
  console.log(`${arm.toUpperCase()} RIC · scene col ricevente nominato servito nel 3D ${T.n} · servito = nominato ${T.ok}/${T.n} (${pc}%) · letture stantie evitate ${T.stantio | 0} (primo fotogramma prima della conclusione in ${T.preConc | 0} scene) → ${ok ? 'VERDE' : 'ROSSO'}`);
  T.ko.slice(0, 12).forEach(x => console.log('    · ' + x));
  return { ok, cieco: T.n < 4, perche: `servito = nominato ${T.ok}/${T.n}` + (T.ko.length ? ' · ' + T.ko.slice(0, 2).join(' · ') : '') };
}

const errori = [];
process.on('unhandledRejection', e => { console.log('✗ chiusura-99 eccezione non gestita: ' + String(e && e.stack || e).slice(0, 600)); process.exit(3); });
const esito = {};
for (const arm of ARMI) { esito[arm] = {}; if (PARTI.includes('D9')) esito[arm].D9 = await parteD9(arm); if (PARTI.includes('RIC')) esito[arm].RIC = await parteRIC(arm); }
await browser.close(); srv.close();
errori.forEach(x => console.log('  ⚠ ' + x));
let fail = 0;
/* [giro 104] il verde fallito DICHIARA il motivo, e lo dichiara per ultimo: prima il suo fail++ era muto e le ultime righe del log (quelle
   che il runner riporta come «primo rosso») erano i difetti ATTESI del braccio rosso. Nella catena 178-finale il rosso riportato
   «servito 9 nominato 8» era quello del braccio rosso: il motivo vero del verde non e' mai stato scritto. */
if (esito.rosso) for (const [k, v] of Object.entries(esito.rosso)) { if (v.cieco) { console.log(`✗ rosso ${k} cieco (${v.perche})`); fail++; } else if (v.ok) { console.log(`✗ il rosso di ${k} non si vede: il guardiano non giudica (${v.perche})`); fail++; } }
if (esito.verde) for (const [k, v] of Object.entries(esito.verde)) { if (v.cieco) { console.log(`✗ verde ${k} passata cieca (${v.perche})`); fail++; } else if (!v.ok) { console.log(`✗ verde ${k} ROSSO: ${v.perche}`); fail++; } }
console.log(fail ? `✗ chiusura-99 ROSSO (${fail})` : '✓ chiusura-99 VERDE'); process.exit(fail ? 1 : 0);
