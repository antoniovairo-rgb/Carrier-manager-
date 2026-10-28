#!/usr/bin/env node
/* [giro 96b] GUARDIANO degli esiti degli highlight e dei comandi della partita trovati dai collaudi 177 n.2 (carriera) e 178
   (grafica). Regola PO: ogni difetto negli highlight vale almeno «medio» e blocca il rilascio.
     D1  ogni tocco su una scelta VISIBILE del pannello viene registrato (ActionResolved) e l'esito e' della scelta toccata.
         Tocco vero col mouse a 200-500 ms dall'apertura del pannello, su molte scene forzate (telefono 412x915). Un tasto
         visibile ma disarmato (il difetto: opacita' 0,45 + disabled) e' un difetto anche se poi il tocco si ripete.
     D2  l'esitazione (auto-anticipo, nessun tocco) si racconta nella famiglia della scena: su una scena DIFENSIVA mai il testo
         d'attacco («il marcatore intercetta»), mai la chiave «intercept», e il titolo dice «Troppo tardi», non un'azione.
     D3  gol del rivale: gala (generateSeasonAwards), cruscotto (rivalSeasonGoals) e albo del rivale sono lo stesso numero, anche
         a stagione chiusa (l'OVR del rivale cambia alla chiusura: salvataggio del collaudo, 61 → 63).
     B15 «Contrasto pulito senza fallo» non finisce mai in fallo (dati + esito forzato fallito giocato davvero).
     D6  al riquadro d'esito (telefono) piedi dell'eroe e pallone non stanno sotto il bordo del riquadro (8 campioni a scena).
     D7  il titolo del riquadro d'esito non e' mai troncato.
     D12 PC 1440x900: l'esito occupa la colonna destra (>= 40% della sua altezza), titolo >= 18 px, «Continua» >= 40 px.
     D15 telefono a tocco: pausa, velocita', ⚠️, «Salta ingresso», «Salta festeggiamenti» ricevono il tocco su >= 40x40 px
         (misura vera con elementFromPoint, come schermate-97).
   Rossi: __CPM_NO_G96B_D1 … __CPM_NO_G96B_D15 (CPM_ARMI=verde,rosso; il rosso li accende tutti e ogni punto deve cadere).
   Uso: node esiti-96.mjs  (CPM_ARMI=verde · CPM_N1=40 scene D1 · CPM_N6=30 scene D6/D7 · CPM_PUNTI=D1,D6 per un sottoinsieme) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ARMI = (process.env.CPM_ARMI || 'verde,rosso').split(',');
const PUNTI = (process.env.CPM_PUNTI || 'D1,D2,D3,B15,D6,D7,D12,D15').split(',');
const N1 = +(process.env.CPM_N1 || 40), N6 = +(process.env.CPM_N6 || 30);
const ROSSI = ['D1', 'D2', 'D3', 'B15', 'D6', 'D7', 'D12', 'D15'].map(k => '__CPM_NO_G96B_' + k);
const FX = (f) => JSON.parse(fs.readFileSync(new URL('./fixtures/' + f, import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const errs = [];
const ha = (k) => PUNTI.includes(k);

async function pagina(rosso, { w = 412, h = 915, touch = false, rec = true } = {}) {
  const opt = { viewport: { width: w, height: h }, deviceScaleFactor: 1 }; if (touch) { opt.isMobile = true; opt.hasTouch = true; }
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  await page.addInitScript(([r, rec, rossi]) => { window.__CPM_GLB = false; if (rec) { window.__CPM_REC = true; } if (r) rossi.forEach(k => window[k] = 1);
    let last = ''; const tick = () => { try { const ph = window.__CPM_PHASE && window.__CPM_PHASE(); if (ph === 'hl_choose' && last !== 'hl_choose') window.__tCh96 = performance.now(); last = ph; } catch (e) {} };
    const raf = () => { tick(); requestAnimationFrame(raf); }; requestAnimationFrame(raf); setInterval(tick, 10); }, [rosso, rec, ROSSI]);
  return { ctx, page };
}
const core = s => String(s || '').replace(/(TIRO|PASSAGGIO|FISICO|TECNICA|VELOCIT|MENTALIT|DRIBBLING|POSIZIONAMENTO|DIFESA)\s*·.*$/u, '').replace(/[^\p{L}\p{N} ]/gu, '').replace(/\s+/g, ' ').trim().toLowerCase();

/* la scelta visibile sotto il dito (una a caso), o «nascosto» se il pannello non mostra ancora le righe */
const SCELTA = () => { const bs = [...document.querySelectorAll('[data-cpm="scelte-righe"] button')]; if (!bs.length) return null;
        const vis = bs.filter(x => { const c = getComputedStyle(x); const q = x.getBoundingClientRect(); return c.visibility !== 'hidden' && +c.opacity >= 0.3 && q.height > 10; });
        const tAt = performance.now() - (window.__tCh96 || 0);
        if (!vis.length) return { nascosto: true, tAt };
        const k = Math.floor(Math.random() * vis.length); const x = vis[k]; const q = x.getBoundingClientRect();
        const lab = (x.children[1] && x.children[1].children[0]) ? x.children[1].children[0].textContent : x.textContent;/* riga: [icona][testo/attributo] */
        return { txt: lab, x: q.left + q.width / 2, y: q.top + q.height / 2, dis: x.disabled, op: +getComputedStyle(x).opacity, tAt, n0: (window.__CPM_TIMELINE ? window.__CPM_TIMELINE() : []).length };
      };
/* ---------- D1 · D2 · B15 · D3 (telefono, scene forzate) ---------- */
async function blocco1(rosso) {
  const f = { D1: [], D2: [], D3: [], B15: [] }, visti = { D1: 0, D2: 0, D3: 0, B15: 0 }, info = {};
  const { ctx, page } = await pagina(rosso);
  const { total } = await openMatch(page, port, { name: 'Esiti96' });
  if (ha('D1')) {
    const DEL = [200, 280, 360, 440, 500]; let persi = 0, sbagliati = 0, nascosti = 0, ok = 0;
    for (let i = 0; i < N1; i++) {
      const gi = (i * 191 / N1 | 0 + 3) % total; const d = DEL[i % DEL.length];
      await page.evaluate(g => { window.__CPM_FORCE_SIT(g, true); window.__tCh96 = performance.now(); }, gi);/* tra due scene forzate la fase resta hl_choose: l'apertura del pannello e' la forzatura (scena e indice cambiano insieme) */
      const t0 = Date.now(); let st = null;
      while (Date.now() - t0 < 4000) { st = await page.evaluate(() => ({ t: window.__tCh96 || 0, now: performance.now() })); if (st.t) break; await sleep(10); }
      if (!st || !st.t) continue;
      const wait = d - (st.now - st.t); if (wait > 0) await sleep(wait);
      let r = await page.evaluate(SCELTA).catch(() => null);
      if (!r) continue;
      if (r.nascosto) {/* nessuna scelta a schermo: il tocco non cade su un tasto (e' cio' che il PO chiede). Il dito riprova appena la scelta compare: e' l'istante piu' stretto */
        nascosti++; let r2 = null; const t2 = Date.now();
        while (Date.now() - t2 < 2500) { r2 = await page.evaluate(SCELTA).catch(() => null); if (r2 && !r2.nascosto) break; await sleep(15); }
        if (!r2 || r2.nascosto) continue; r = r2; r.subito = 1;
      }
      visti.D1++;
      await page.mouse.click(r.x, r.y);
      let ev = []; const t1 = Date.now();
      while (Date.now() - t1 < 2500) { ev = await page.evaluate(n => (window.__CPM_TIMELINE ? window.__CPM_TIMELINE() : []).slice(n).filter(e => e.type === 'ActionResolved').map(e => ({ label: e.label, il: (typeof intentLabel === 'function') ? intentLabel(e.label) : e.label })), r.n0).catch(() => []); if (ev.length) break; await sleep(80); }
      const t = core(r.txt); if (!t) { f.D1.push(`gi${gi}: testo della scelta non leggibile`); continue; }
      if (!ev.length) { persi++; f.D1.push(`gi${gi} tocco a ${Math.round(r.tAt)} ms su «${r.txt.trim().slice(0, 34)}» (visibile, opacita' ${r.op}${r.dis ? ', disabilitato' : ''}): nessun ActionResolved`); }
      else if (!ev.some(e => core(e.label) === t || core(e.il) === t || core(e.label).startsWith(t.slice(0, 10)) || core(e.il).startsWith(t.slice(0, 10)))) { sbagliati++; f.D1.push(`gi${gi} toccato «${r.txt.trim().slice(0, 30)}» → risolto «${ev[0].label}»`); }
      else ok++;
      await sleep(250);
    }
    info.D1 = `tocchi su scelta visibile ${visti.D1} · registrati giusti ${ok} · persi ${persi} · esito d'altra azione ${sbagliati} · pannello ancora nascosto al primo tocco ${nascosti} (ritoccato appena visibile)`;
  }
  if (ha('D2')) {
    /* esitazione su scene difensive: nessun tocco, si aspetta l'auto-anticipo (9-16 s) */
    const defs = await page.evaluate(() => { const L = []; try { SITUATIONS.forEach((s, i) => { if (s && s.type === 'def' && !s.lockMovement && (s.actions || []).length) L.push(i); }); } catch (e) {} return L; });
    const scelte = defs.filter((_, i) => i % Math.max(1, Math.floor(defs.length / 3)) === 0).slice(0, 3);
    for (const gi of scelte) {
      await page.evaluate(g => { window.__CPM_FORCE_SIT(g, true); }, gi);
      const t0 = Date.now(); let o = null;
      while (Date.now() - t0 < 26000) { o = await page.evaluate(() => (window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_result') ? window.__CPM_OUTCOME : null).catch(() => null); if (o) break; await sleep(250); }
      if (!o) { f.D2.push(`gi${gi}: l'esitazione non si e' risolta in 26 s`); continue; }
      visti.D2++;
      await sleep(4500);/* il titolo arriva al reveal */
      const tit = await page.evaluate(() => { const e = document.querySelector('[data-cpm="esito-titolo"]'); return e ? e.textContent : ''; }).catch(() => '');
      const att = /marcatore intercetta|recupera palla|Palla persa|chiude l'azione/i.test(o.text || '');
      if (att || o.outKey === 'intercept') f.D2.push(`gi${gi} difensiva: esito d'attacco «${o.text}» (${o.outKey})`);
      if (!/Troppo tardi/.test(tit + ' ' + (o.timeout ? 'Troppo tardi' : ''))) f.D2.push(`gi${gi}: il titolo dell'esitazione porta un'azione non scelta («${tit.slice(0, 50)}»)`);
    }
    info.D2 = `scene difensive lasciate scadere ${visti.D2}`;
  }
  if (ha('B15')) {
    const dati = await page.evaluate(() => { const L = []; try { SITUATIONS.forEach((s, i) => (s.actions || []).forEach((a, k) => { if (/Contrasto pulito senza fallo/.test(a.label || '')) L.push({ gi: i, k, fail: a.fail }); })); } catch (e) {} try { (P6_DIFESA || []).forEach(a => { if (/Contrasto pulito senza fallo/.test(a.l || '')) L.push({ p6: 1, fail: a.fail }); }); } catch (e) {} return L; });
    dati.forEach(d => { visti.B15++; if (d.fail === 'foul') f.B15.push(`dati: ${d.p6 ? 'P6_DIFESA' : 'gi' + d.gi} fail=foul`); });
    for (const d of dati.filter(x => x.gi != null)) {
      for (let rip = 0; rip < 3; rip++) {
        await page.evaluate(g => { window.__CPM_FORCE_SIT(g, true); }, d.gi); await sleep(600);
        await page.evaluate(k => { window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_RESOLVE(k); }, d.k); await sleep(700);
        const o = await page.evaluate(() => window.__CPM_OUTCOME).catch(() => null); visti.B15++;
        if (!o) f.B15.push(`gi${d.gi}: nessun esito`); else if (o.outKey === 'foul' || /fallo|ammonit|cartellin/i.test(o.text || '')) f.B15.push(`gi${d.gi} «Contrasto pulito senza fallo» fallito → ${o.outKey} «${o.text}»`);
      }
    }
    info.B15 = `voci «Contrasto pulito senza fallo» ${dati.length} · esiti forzati falliti giocati ${dati.filter(x => x.gi != null).length * 3}`;
  }
  if (ha('D3')) {
    /* il caso del collaudo (cp-s2w39gala): rivale Phil Dupont, OVR 61 durante la stagione, 63 dopo la chiusura; archiviati 10 */
    const r = await page.evaluate(() => {
      const cal = Array.from({ length: 34 }, (_, k) => ({ matchday: k + 1, played: true }));
      const base = { name: 'Prova', season: 2, week: 39, proStatus: 'pro', club: { id: 'x', n: 'FC X', lg: 'Lega A' }, goals: 12, totalGoals: 20, calendar: cal, standings: [] };
      const prima = { ...base, rival: { name: 'Phil Dupont', ovr: 61, goals: 10, history: [{ season: 1, goals: 10 }] } };
      const gala = (p) => { try { return generateSeasonAwards(p, []).rival.goals; } catch (e) { return 'err:' + String(e).slice(0, 60); } };
      const archivio = rivalSeasonGoals(prima, { full: true });
      const dopo = { ...base, seasonClosedAt: 2, rival: { name: 'Phil Dupont', ovr: 63, goals: archivio, history: [{ season: 1, goals: 10 }, { season: 2, goals: archivio }] } };
      return { galaPrima: gala(prima), cruscottoPrima: rivalSeasonGoals(prima), archivio, galaDopo: gala(dopo), cruscottoDopo: rivalSeasonGoals(dopo) };
    }).catch(e => ({ err: String(e).slice(0, 120) }));
    visti.D3++;
    if (r.err) f.D3.push('valutazione: ' + r.err);
    else { const v = [r.galaPrima, r.cruscottoPrima, r.archivio, r.galaDopo, r.cruscottoDopo]; if (new Set(v.map(String)).size !== 1) f.D3.push(`gala/cruscotto/albo diversi: ${JSON.stringify(r)}`); }
    info.D3 = JSON.stringify(r);
  }
  await ctx.close();
  return { f, visti, info };
}

/* ---------- D6 · D7 (telefono) ---------- */
async function blocco6(rosso) {
  const f = { D6: [], D7: [] }, visti = { D6: 0, D7: 0 };
  const { ctx, page } = await pagina(rosso);
  await page.addInitScript(() => { window.__CPM_FR73 = []; window.__CPM_CAMT767ON = 1; });
  const { total } = await openMatch(page, port, { name: 'Esiti96' });
  let altezze = [];
  for (let i = 0; i < N6; i++) {
    const gi = (i * 191 / N6 | 0) % total;
    await page.evaluate(g => { window.__CPM_REVAT95 = 0; window.__CPM_FORCE_SIT(g, true); }, gi); await sleep(700);
    await page.evaluate(() => window.__CPM_RESOLVE(0));
    const t0 = Date.now(); while (Date.now() - t0 < 9000) { const rv = await page.evaluate(() => window.__CPM_REVAT95 || 0); if (rv) break; await sleep(150); }
    let piedi = 0, palla = 0, n = 0, tronco = null, h = 0;
    for (let k = 0; k < 8; k++) {
      await page.evaluate(() => { window.__CPM_FR73 = []; }); await sleep(300);
      const m = await page.evaluate(() => {
        const e = document.querySelector('[data-cpm="esito"]'); const cv = [...document.querySelectorAll('canvas')].sort((a, b) => b.width * b.height - a.width * a.height)[0];
        if (!e || !cv) return null; const er = e.getBoundingClientRect(), cr = cv.getBoundingClientRect();
        const fr = (window.__CPM_FR73 || []).slice(-1)[0]; if (!fr) return null;
        const toY = y => cr.top + (1 - y) / 2 * cr.height; let ballY = null;
        if (window.__CPM_PROJ767 && fr.bx != null) { const p = window.__CPM_PROJ767(fr.bx, 0.22, fr.bz); if (Math.abs(p.x) <= 1 && Math.abs(p.y) <= 1 && p.z < 1) ballY = toY(p.y); }
        const t = e.querySelector('[data-cpm="esito-titolo"]');
        return { top: er.top, h: er.height, feetY: toY(fr.ay), feetIn: Math.abs(fr.ax) <= 1 && Math.abs(fr.ay) <= 1, ballY, tr: t && { sw: t.scrollWidth, cw: t.clientWidth, sh: t.scrollHeight, ch: t.clientHeight, txt: t.textContent.slice(0, 70) } };
      }).catch(() => null);
      if (!m) continue; n++; h = m.h;
      if (m.feetIn && m.feetY > m.top) piedi++; if (m.ballY != null && m.ballY > m.top) palla++;
      if (m.tr && (m.tr.sw > m.tr.cw + 1 || m.tr.sh > m.tr.ch + 1)) tronco = m.tr.txt;
    }
    if (!n) continue; visti.D6++; visti.D7++; altezze.push(h);
    if (piedi >= 2 || palla >= 3) f.D6.push(`gi${gi}: sotto il riquadro piedi ${piedi}/${n} · pallone ${palla}/${n}`);
    if (tronco) f.D7.push(`gi${gi}: titolo troncato «${tronco}»`);
  }
  altezze.sort((a, b) => a - b);
  await ctx.close();
  return { f, visti, info: { D6: `scene ${visti.D6} · altezza mediana del riquadro ${Math.round(altezze[altezze.length >> 1] || 0)} px` } };
}

/* ---------- D12 (PC 1440x900) ---------- */
async function blocco12(rosso) {
  const f = { D12: [] }, visti = { D12: 0 };
  const { ctx, page } = await pagina(rosso, { w: 1440, h: 900 });
  await page.addInitScript(() => { window.__CPM_FR73 = []; });
  const { total } = await openMatch(page, port, { name: 'Esiti96' });
  for (let i = 0; i < 5; i++) {
    const gi = (i * 37 + 11) % total;
    await page.evaluate(g => { window.__CPM_REVAT95 = 0; window.__CPM_FORCE_SIT(g, true); }, gi); await sleep(700);
    await page.evaluate(() => window.__CPM_RESOLVE(0));
    const t0 = Date.now(); while (Date.now() - t0 < 9000) { const rv = await page.evaluate(() => window.__CPM_REVAT95 || 0); if (rv) break; await sleep(150); }
    await sleep(700);
    const m = await page.evaluate(() => {
      const e = document.querySelector('[data-cpm="esito-pc"]'); if (!e) return { manca: true };
      const col = e.parentElement.getBoundingClientRect(), r = e.getBoundingClientRect();
      const t = e.querySelector('[data-cpm="esito-titolo"]'); const bt = [...e.querySelectorAll('button')].find(x => /Continua/.test(x.textContent));
      return { quota: r.height / col.height, fs: t ? parseFloat(getComputedStyle(t).fontSize) : 0, bh: bt ? bt.getBoundingClientRect().height : 0, tronco: t ? (t.scrollWidth > t.clientWidth + 1) : true };
    }).catch(() => null);
    if (!m) continue; visti.D12++;
    if (m.manca) { f.D12.push(`gi${gi}: nessuna scheda d'esito nella colonna destra (striscia)`); continue; }
    if (m.quota < 0.4 || m.fs < 18 || m.bh < 40 || m.tronco) f.D12.push(`gi${gi}: quota colonna ${(m.quota * 100).toFixed(0)}% · titolo ${m.fs}px · Continua ${Math.round(m.bh)}px${m.tronco ? ' · titolo troncato' : ''}`);
  }
  await ctx.close();
  return { f, visti, info: {} };
}

/* ---------- D15 (telefono a tocco) ---------- */
function TOCCO(re) {
  const H = innerHeight, W = innerWidth, out = [];
  for (const e of [...document.querySelectorAll('button')]) {
    const t = (e.textContent || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ');
    if (!new RegExp(re).test(t)) continue;
    const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = e.getBoundingClientRect(); if (r.width < 1) continue;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const dentro = (x, y) => { const k = document.elementFromPoint(x, y); return !!k && (k === e || e.contains(k)); };
    if (!dentro(cx, cy)) { out.push({ t: t.slice(0, 24), coperto: true }); continue; }
    let su = 0, giu = 0, sx = 0, dx = 0;
    while (su < 30 && cy - su - 1 >= 0 && dentro(cx, cy - su - 1)) su++; while (giu < 30 && cy + giu + 1 < H && dentro(cx, cy + giu + 1)) giu++;
    while (sx < 30 && cx - sx - 1 >= 0 && dentro(cx - sx - 1, cy)) sx++; while (dx < 30 && cx + dx + 1 < W && dentro(cx + dx + 1, cy)) dx++;
    out.push({ t: t.slice(0, 24), w: Math.round(r.width), h: Math.round(r.height), hw: sx + dx + 1, hh: su + giu + 1 });
  }
  return out;
}
async function blocco15(rosso) {
  const f = { D15: [] }, visti = { D15: 0 }, misure = [];
  const { ctx, page } = await pagina(rosso, { touch: true, rec: false });
  const raw = FX('save-c177-s1w15.json'); const ls = raw['cpm-v3'] ? { ...raw } : { 'cpm-v3': JSON.stringify(raw) }; delete ls['cpm-v3-riserva']; delete ls['cpm-match-resume'];
  await page.addInitScript(l => { for (const k in l) localStorage.setItem(k, l[k]); localStorage.setItem('cpm-devtools', '1'); }, ls);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  const giudica = (lista, cosa) => { for (const x of lista) { if (x.coperto) continue; visti.D15++; misure.push(`${x.t} ${x.hw}x${x.hh}`); if (x.hw < 40 || x.hh < 40) f.D15.push(`${cosa} «${x.t}»: tocco ${x.hw}x${x.hh} (disegno ${x.w}x${x.h})`); } };
  /* ingresso in campo */
  const t0 = Date.now(); let ing = false;
  while (Date.now() - t0 < 60000) {
    const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
    if (ph === 'matchday') await page.getByText('Vedi le formazioni', { exact: false }).first().click({ timeout: 3000 }).catch(() => {});
    if (ph === 'formations') await page.getByText('Ingresso in campo', { exact: false }).first().click({ timeout: 3000 }).catch(() => {});
    if (ph === 'walkout') { await sleep(1200); const l = await page.evaluate(TOCCO, 'Salta ingresso'); if (l.length) { giudica(l, 'ingresso'); ing = true; } break; }
    if (ph === 'playing') break;
    await sleep(500);
  }
  if (!ing) f.D15.push('«Salta ingresso» non raggiunto');
  await page.evaluate(() => { try { window.__CPM_SKIPWALK277 = true; } catch (e) {} });
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await sleep(1500);
  const l2 = await page.evaluate(TOCCO, '^(⏸|▶|1×|1,5×|2×|⚠️)$');
  if (l2.length < 3) f.D15.push(`comandi della barra trovati ${l2.length} su 3 (pausa, velocita', ⚠️)`); giudica(l2, 'barra');
  await page.evaluate(() => { window.__CPM_CER_HOLD = true; return window.__CPM_FORCE_CEREMONY({ light: true, name: 'Colpo fuori casa', festa: { titolo: 'Colpo fuori casa', punteggio: '2 – 3', avversario: 'FC Prova', casa: false, voci: [{ n: 1, et: 'gol', oro: true }] } }); });
  await sleep(1500);
  const l3 = await page.evaluate(TOCCO, 'Salta festeggiamenti'); if (!l3.length) f.D15.push('«Salta festeggiamenti» non raggiunto'); giudica(l3, 'cerimonia');
  await ctx.close();
  return { f, visti, info: { D15: misure.join(' · ') } };
}

const esiti = {};
for (const arm of ARMI) {
  const rosso = arm === 'rosso'; const F = {}, V = {}, I = {};
  const unisci = (r) => { Object.assign(I, r.info); for (const k in r.f) { F[k] = (F[k] || []).concat(r.f[k]); V[k] = (V[k] || 0) + (r.visti[k] || 0); } };
  if (['D1', 'D2', 'D3', 'B15'].some(ha)) unisci(await blocco1(rosso));
  if (['D6', 'D7'].some(ha)) unisci(await blocco6(rosso));
  if (ha('D12')) unisci(await blocco12(rosso));
  if (ha('D15')) unisci(await blocco15(rosso));
  console.log(`\n=== braccio ${arm.toUpperCase()} ===`);
  for (const k of PUNTI) {
    console.log(`  ${k.padEnd(4)} visti ${String(V[k] || 0).padStart(3)} · difetti ${String((F[k] || []).length).padStart(3)}${I[k] ? '  — ' + I[k] : ''}`);
    (F[k] || []).slice(0, 4).forEach(s => console.log('       ✗ ' + s));
  }
  esiti[arm] = { F, V };
}
if (errs.length) console.log('errori di pagina: ' + [...new Set(errs)].slice(0, 4).join(' | '));
let ok = true;
if (esiti.verde) {
  const ciechi = PUNTI.filter(k => !(esiti.verde.V[k] > 0)); const rossi = PUNTI.filter(k => (esiti.verde.F[k] || []).length);
  if (ciechi.length) console.log('VERDE CIECO su: ' + ciechi.join(', '));
  if (rossi.length) console.log('VERDE CON DIFETTI su: ' + rossi.join(', '));
  if (ciechi.length || rossi.length || errs.length) ok = false; else console.log('VERDE OK: ' + PUNTI.join(', '));
}
if (esiti.rosso) {
  const nonCaduti = PUNTI.filter(k => !(esiti.rosso.F[k] || []).length);
  if (nonCaduti.length) { ok = false; console.log('ROSSO NON RIUSCITO: non cadono ' + nonCaduti.join(', ')); } else console.log('ROSSO ATTESO OK: con __CPM_NO_G96B_* cadono ' + PUNTI.join(', '));
}
await b.close(); srv.close();
console.log(ok ? '✅ esiti-96 PASS' : '❌ esiti-96 FAIL');
process.exit(ok ? 0 : 1);
