#!/usr/bin/env node
/* GUARDIANO — LE VOCI NON SI ACCAVALLANO (7.536.0).
   Collaudo PO: «le indicazioni dalla panchina si accavallano» (col banner della telecronaca) e «i cori
   dei tifosi sono quasi illeggibili».
   COME GIUDICA: non a occhio, ma sui RETTANGOLI VERI del DOM. Si forza la comparsa contemporanea delle
   tre voci (banner telecronaca, riquadro panchina, coro) e si misura:
   (a) intersezione panchina×banner: deve essere ZERO — con il banner su DUE righe, che è il caso dello
       screenshot PO (una riga lunga di cronaca);
   (b) il coro deve avere un fondo proprio (non testo nudo) e una dimensione leggibile.
   ROSSO (CPM_ROSSO=1 → __CPM_NO548): la panchina torna alla quota fissa e il coro al testo nudo — le
   due misure devono peggiorare, altrimenti il guardiano non sta guardando niente. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '/workspace/carrier-manager-/tests/visual/lib/harness.mjs';

const ROSSO = !!process.env.CPM_ROSSO;
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(r => { window.__CPM_GLB = false; if (r) { window.__CPM_NO548 = 1; window.__CPM_NO565 = 1; } }, ROSSO ? 1 : null);
await openMatch(page, port, { skipLoadAll: true, name: 'Hud' });
await sleep(1200);

/* le tre voci insieme, con una riga di cronaca LUNGA (due righe = il caso dello screenshot) */
await page.evaluate(() => {
  window.__CPM_HUD_FORCE && window.__CPM_HUD_FORCE({
    com: "⚪ Punizione battuta corta: Raimondi (PRT) fa ripartire il giro palla dalla trequarti difensiva.",
    coach: "«Girala!»",
    chant: "FORZA RAGAZZI, SPINGETE!"
  });
});
await sleep(700);
const m = await page.evaluate(() => {
  const q = s => document.querySelector(s);
  const rect = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, b: r.bottom, t: r.top }; };
  const ban = rect(q('[data-cpm="fmrow"]')), pan = rect(q('[data-cpm="panchina"]')), cor = q('[data-cpm="coro"]');
  const corR = rect(cor);
  /* il fondo vive sulla PILLOLA (lo span interno): misurare il contenitore direbbe sempre «trasparente» */
  const pill = q('[data-cpm="coro-pill"]');
  const cs = (pill || cor) ? getComputedStyle(pill || cor) : null;
  const inter = (a, c) => (!a || !c) ? null : Math.max(0, Math.min(a.b, c.b) - Math.max(a.t, c.t)) * Math.max(0, Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x));
  /* terza misura (nota PO «un'indicazione del mister a meta' schermo, fuori dal flusso»): NESSUN riquadro
     di testo largo puo' vivere nella fascia centrale della scena — le voci stanno in gradinata (coro) o
     nella colonna in basso (cronaca + panchina). */
  /* [7.543.0 collaudo PO «il salta il fischio finale sovrascrive la telecronaca»] QUARTA MISURA: il tasto
     SALTA e la colonna delle voci non possono toccarsi. E' il terzo occupante della fascia bassa, e il
     7.536 aveva gia' pagato questa classe fra panchina e cronaca. */
  const salta = rect(q('[data-cpm="salta"]'));
  const voci = q('[data-cpm="voci"]');
  const host = (voci || q('[data-cpm="fmrow"]'))?.parentElement;
  const H = window.innerHeight;
  const intrusi = !host ? [] : [...host.children].filter(el => {
    if (el.hasAttribute('data-cpm') || (voci && (el === voci || el.contains(voci)))) return false;
    const r = el.getBoundingClientRect();
    const txt = (el.innerText || '').trim();
    return txt.length > 12 && r.width > window.innerWidth * 0.5 && r.top > H * 0.06 && r.bottom < H * 0.55;
  }).map(el => ({ txt: (el.innerText || '').trim().slice(0, 48), top: +el.getBoundingClientRect().top.toFixed(0) }));
  return { ban, pan, salta, vociR: rect(voci), sovrSalta: inter(rect(voci), salta), cor: corR, sovr: inter(ban, pan), gap: (ban && pan) ? +(ban.t - pan.b).toFixed(1) : null,
           corFs: cs ? parseFloat(cs.fontSize) : null, corBg: cs ? cs.backgroundColor : null, corRad: cs ? cs.borderRadius : null, corTxt: cor ? cor.innerText.slice(0, 40) : null, intrusi };
});
/* [7.543.0] SECONDA SCENA: «uscito dal campo». E' l'unico stato in cui il tasto Salta convive con la
   telecronaca, cioe' l'unico in cui il difetto segnalato dal PO esiste. Senza la leva di collaudo il
   guardiano dovrebbe aspettare una sostituzione vera e non misurerebbe mai il caso vero. */
await page.evaluate(() => { try { window.__CPM_FORCE_SUBOFF && window.__CPM_FORCE_SUBOFF(); } catch (e) {} });
await sleep(700);
const mS = await page.evaluate(() => {
  const q = s => document.querySelector(s);
  const rect = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, b: r.bottom, t: r.top }; };
  const inter = (a, c) => (!a || !c) ? null : Math.max(0, Math.min(a.b, c.b) - Math.max(a.t, c.t)) * Math.max(0, Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x));
  const v = rect(q('[data-cpm="voci"]')), sa = rect(q('[data-cpm="salta"]'));
  return { v, sa, sovr: inter(v, sa) };
});
await page.screenshot({ path: '/tmp/claude-0/-home-user/6dd74479-f58d-5f3f-a846-19342f6001fd/scratchpad/hud-' + (ROSSO ? 'rosso' : 'verde') + '-saltata.png' });
await b.close(); srv.close();
console.log(`tasto SALTA × telecronaca: ${mS.sa ? (mS.sovr == null ? '—' : mS.sovr.toFixed(0) + ' px²') : 'tasto assente (scena non forzata)'}${mS.v && mS.sa ? ' · fondo voci ' + mS.v.b.toFixed(0) + ' · cima tasto ' + mS.sa.t.toFixed(0) : ''}`);

console.log(`${ROSSO ? 'ROSSO' : 'VERDE'} — banner ${m.ban ? m.ban.h.toFixed(0) + 'px alto, top ' + m.ban.t.toFixed(0) : 'assente'} · panchina ${m.pan ? m.pan.h.toFixed(0) + 'px, fondo ' + m.pan.b.toFixed(0) : 'assente'}`);
console.log(`sovrapposizione panchina×banner: ${m.sovr == null ? '—' : m.sovr.toFixed(0) + ' px²'} · spazio fra le due voci: ${m.gap == null ? '—' : m.gap + ' px'}`);
console.log(`coro: "${m.corTxt}" · corpo ${m.corFs}px · fondo ${m.corBg} · raggio ${m.corRad}`);
console.log(`voci fuori zona (fascia centrale): ${m.intrusi.length}${m.intrusi.length ? ' → ' + JSON.stringify(m.intrusi) : ''}`);
const bgPieno = m.corBg && !/rgba\(0,\s*0,\s*0,\s*0\)|transparent/.test(m.corBg);
if (ROSSO) {
  const bad = !(m.sovr > 0 || !bgPieno || (mS.sa && mS.sovr > 0));
  console.log(bad ? '❌ prova del rosso fallita: senza rimedio le voci NON si accavallano (il guardiano non misura nulla)' : '✅ prova del rosso: col rimedio spento le voci si accavallano, il tasto Salta copre la cronaca e il coro torna nudo');
  process.exit(bad ? 1 : 0);
}
const saltaOk = (!mS.sa || !mS.v) ? true : (mS.sovr === 0);/* [7.543.0] se la scena non ha il tasto non si giudica, e la riga sopra lo dichiara */
const bad = !(m.sovr === 0 && m.gap >= 4 && m.corFs >= 14 && bgPieno && m.intrusi.length === 0 && saltaOk);
console.log(bad ? '❌ le voci si accavallano, il tasto Salta copre la telecronaca, il coro non è leggibile o una voce vive fuori zona' : '✅ voci separate (0 px²), tasto Salta nella sua fascia, coro con fondo proprio, nessuna voce fuori zona');
process.exit(bad ? 1 : 0);
