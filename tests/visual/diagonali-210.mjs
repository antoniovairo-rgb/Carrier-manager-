#!/usr/bin/env node
/* [giro 210 PO-401 + PO-471] GUARDIANO diagonali-210 — le diagonali negli highlight dell'eroe e il pad che resta sul telefono.
   Decisione PO 15/11: alternativa A (otto tasti nel pad, le quattro celle d'angolo diventano tasti diagonali, il pad non cresce),
   passo diagonale lungo quanto gli altri (2,5u normalizzato, anche da tastiera), finestra d'accordo sulla tastiera, riga d'aiuto,
   e sul telefono il pad resta dopo la prima mossa finche' ci sono mosse (come sul PC).
   Schermi: telefono 360x640 · 375x667 · 390x844 (tocco vero, touchscreen.tap) e PC 1366x768 (clic + tastiera). GLB spento.
   Per ogni schermo:
     G  geometria: otto tasti a schermo, nessuna sovrapposizione fra loro ne' con gli altri tasti, distanza minima stampata;
     P  per OGNUNA delle otto direzioni un tocco sul suo tasto (scena forzata con >=2 mosse): direzione del passo, UNA mossa,
        lunghezza 2,5u (testimone __CPM_PASSO210 e punto logico dell'eroe), stacco dal marcatore = __CPM_MOVEGAIN(dx,dy) chiesto
        un istante prima del tocco;
     T  (solo telefono) dopo la prima mossa la fase e' hl_choose (come sul PC) e il pad e' ancora a schermo con la scheda delle
        giocate nascosta; a mosse finite il pad se ne va e compaiono le giocate; «Scegli» col pad a schermo porta alle giocate;
     K  (solo PC) tastiera: due frecce con 0/20/40 ms fra l'una e l'altra danno SEMPRE la diagonale lunga 2,5u in una mossa sola;
        una freccia sola da' il passo cardinale da 2,5u; la riga «Diagonali: due frecce insieme» e' a schermo.
   ROSSO window.__CPM_NO_G210 (pad a quattro tasti, diagonale da tastiera 3,54u senza accordo, pad che sparisce sul telefono):
   il guardiano DEVE vederne i difetti. «Non giudicato» = rosso.
   Uso: node diagonali-210.mjs (verde poi rosso) · CPM_PARTE=verde|rosso · CPM_VISTE=360,375,390,1366 */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const PARTE = process.env.CPM_PARTE || 'tutto';
const VISTE = (process.env.CPM_VISTE || '360,375,390,1366').split(',').map(Number);
const VP = { 360: { width: 360, height: 640 }, 375: { width: 375, height: 667 }, 390: { width: 390, height: 844 }, 1366: { width: 1366, height: 768 } };
const N = 2.5 / Math.SQRT2;
/* convenzione del gioco: dx = verso la porta avversaria, dy = verso destra */
const DIR = [['▲', 2.5, 0], ['◥', N, N], ['▶', 0, 2.5], ['◢', -N, N], ['▼', -2.5, 0], ['◣', -N, -N], ['◀', 0, -2.5], ['◤', N, -N]];
const ACCORDI = [['ArrowUp', 'ArrowRight', 1, 1], ['ArrowDown', 'ArrowRight', -1, 1], ['ArrowDown', 'ArrowLeft', -1, -1], ['ArrowUp', 'ArrowLeft', 1, -1]];
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();

async function apri(vp, rosso, touch) {
  const ctx = await browser.newContext({ viewport: vp, serviceWorkers: 'block', hasTouch: !!touch, isMobile: !!touch });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G210 = 1; window.__KD210 = []; document.addEventListener('keydown', e => { if (!e.repeat) window.__KD210.push([e.key, Math.round(performance.now()), window.__CPM_PHASE && window.__CPM_PHASE()]); }, true); }, rosso);
  await openMatch(page, port); await sleep(800);
  return { ctx, page, errs };
}
const fase = (p) => p.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
const stato = (p) => p.evaluate(() => { const s = window.__CPM_STATE && window.__CPM_STATE(); const P = window.__CPM_PASSO210 || [];
  const vis = e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && r.top < innerHeight && r.bottom > 0; };
  const tasti = [...document.querySelectorAll('[data-cpm="dpad"] button, button[aria-label]')].filter(vis).filter(e => /^[▲▼◀▶◤◥◣◢]$/.test(e.getAttribute('aria-label') || ''));
  return { ph: window.__CPM_PHASE && window.__CPM_PHASE(), moves: window.__CPM_MOVES, dd: window.__CPM_DEFDIST ? window.__CPM_DEFDIST() : null, ht: s && s.heroTarget, nP: P.length, ultimo: P[P.length - 1] || null,
    tasti: tasti.map(e => { const r = e.getBoundingClientRect(); return { lab: e.getAttribute('aria-label'), x: r.left, y: r.top, w: r.width, h: r.height }; }),
    scelte: !!document.querySelector('[data-cpm="scelte"]'), scegli: (() => { const b = document.querySelector('[data-cpm="scegli"]'); return b && vis(b) ? (() => { const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })() : null; })(),
    aiutoDiag: !!document.querySelector('[data-cpm="aiuto-diagonali"]') }; }).catch(() => null);
/* scene con almeno due mosse e il pad non nascosto (stessa regola del gioco) */
const sceneMm2 = (p) => p.evaluate(() => { const L = []; for (let i = 0; i < SITUATIONS.length; i++) { const s = SITUATIONS[i]; const mm = cappedMM(s); if (!s.lockMovement && mm >= 2 && !hideDirCursor(s)) L.push({ gi: i, mm, mz: s.moveZone || { x: [0, 100], y: [0, 100] } }); } return L; });
/* forza una scena e aspetta hl_move con le mosse caricate e il punto dell'eroe abbastanza dentro la zona perche' nessun passo venga tagliato.
   ⚠️ LIMITE DELLO STRUMENTO (non del gioco): la scena forzata non riazzera la barra della pressione (lo fa solo startHL, il percorso vero),
   quindi dopo qualche secondo cumulato di hl_move sulla stessa pagina le scene forzate entrano gia' «a tempo scaduto» e passano subito a
   hl_choose. Quando succede si riapre la pagina (H.riapri) invece di dichiarare il difetto (sul PC la scena a tempo scaduto vale lo
   stesso: li' pad e tastiera funzionano anche in hl_choose). */
async function forza(H, lista, k0, pc) {
  for (let t = 0, riaperture = 0; t < Math.min(lista.length, 20); t++) { const sc = lista[(k0 + t) % lista.length]; const p = H.page;
    await p.evaluate(g => window.__CPM_FORCE_SIT(g, false), sc.gi).catch(() => {});
    let ph = null; for (let i = 0; i < 40 && (ph = await fase(p)) !== 'hl_move'; i++) { if (ph === 'hl_choose' && i > 6) break; await sleep(150); }
    /* sul PC il pad e la tastiera valgono anche in hl_choose (pad accanto alle giocate): li' la scena a tempo scaduto si usa lo stesso */
    if (ph !== 'hl_move' && !(pc && ph === 'hl_choose')) { if (riaperture < 3) { riaperture++; await H.riapri(); t--; } continue; }
    const s = await stato(p);
    if (!s || !(s.ph === 'hl_move' || (pc && s.ph === 'hl_choose')) || !(s.moves >= 2) || !s.ht || s.ht.x == null) continue;
    const z = sc.mz; if (s.ht.x - 2.6 < z.x[0] || s.ht.x + 2.6 > z.x[1] || s.ht.y - 2.6 < z.y[0] || s.ht.y + 2.6 > z.y[1]) continue;
    return { sc, s, k: (k0 + t) % lista.length };
  }
  return null;
}
const sovrapposti = (a, b) => a.x < b.x + b.w - 0.5 && b.x < a.x + a.w - 0.5 && a.y < b.y + b.h - 0.5 && b.y < a.y + a.h - 0.5;
const gap = (a, c) => { const dx = Math.max(0, Math.max(a.x, c.x) - Math.min(a.x + a.w, c.x + c.w)), dy = Math.max(0, Math.max(a.y, c.y) - Math.min(a.y + a.h, c.y + c.h)); return Math.hypot(dx, dy); };

async function schermo(w, rosso) {
  const vp = VP[w]; const tel = w < 800; const D = []; const nonG = []; const note = [];
  const H = { ...(await apri(vp, rosso, tel)), errs0: [], aperture: 1 };
  H.riapri = async () => { H.errs0.push(...H.errs); await H.ctx.close().catch(() => {}); Object.assign(H, await apri(vp, rosso, tel)); H.aperture++; };
  
  const lista = await sceneMm2(H.page).catch(() => []);
  if (!lista.length) { nonG.push('nessuna scena con 2 mosse'); await H.ctx.close(); return { w, D, nonG, note }; }
  const DIRB = rosso ? DIR.filter(d => d[0] === '▲' || d[0] === '◥') : DIR;/* il rosso deve solo vedere i difetti: un cardinale e una diagonale bastano */
  let k = 0;
  /* G + P: un tocco per direzione */
  let geomFatta = false;
  for (const [lab, edx, edy] of DIRB) {
    const f = await forza(H, lista, k, !tel); if (!f) { nonG.push(`${lab}: nessuna scena forzata in hl_move con 2 mosse`); continue; } k = f.k + 1;
    const s0 = f.s;
    if (!geomFatta) { geomFatta = true;
      const T = s0.tasti; const labs = new Set(T.map(t => t.lab));
      if (labs.size !== 8) D.push(`G: ${labs.size} tasti di direzione a schermo invece di 8 (${[...labs].join('')})`);
      let sov = 0, gMin = 1e9; for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) { if (sovrapposti(T[i], T[j])) sov++; gMin = Math.min(gMin, gap(T[i], T[j])); }
      const altri = await H.page.evaluate(() => [...document.querySelectorAll('button')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !/^[▲▼◀▶◤◥◣◢]$/.test(e.getAttribute('aria-label') || ''); }).map(e => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }));
      let sovA = 0; for (const t of T) for (const a of altri) if (sovrapposti(t, a)) sovA++;
      if (sov) D.push(`G: ${sov} coppie di tasti del pad sovrapposte`); if (sovA) D.push(`G: ${sovA} sovrapposizioni fra tasti del pad e altri tasti`);
      const lato = T.length ? Math.min(...T.map(t => Math.min(t.w, t.h))) : 0;
      note.push(`G: tasti ${T.length} · lato minimo ${lato.toFixed(1)} px · distanza minima fra tasti ${gMin === 1e9 ? '—' : gMin.toFixed(1)} px · sovrapposizioni ${sov}+${sovA}`);
    }
    const t = s0.tasti.find(x => x.lab === lab);
    if (!t) { D.push(`P ${lab}: tasto assente`); continue; }
    /* stacco atteso: __CPM_MOVEGAIN (la funzione del gioco) chiesta un istante prima del tocco, col marcatore di quell'istante */
    const pr = await H.page.evaluate(([dx, dy]) => { const m = window.__CPM_MARKER && window.__CPM_MARKER(); return { g: window.__CPM_MOVEGAIN ? window.__CPM_MOVEGAIN(dx, dy) : null, mk: m ? { x: m.x, y: m.y } : null }; }, [edx, edy]);
    const atteso = pr.g;
    const cx = t.x + t.w / 2, cy = t.y + t.h / 2;
    if (tel) await H.page.touchscreen.tap(cx, cy); else await H.page.mouse.click(cx, cy);
    await sleep(700); const s1 = await stato(H.page);
    if (!s1 || s1.nP <= s0.nP || !s1.ultimo) { D.push(`P ${lab}: nessun passo registrato`); continue; }
    const u = s1.ultimo; const fatti = s1.nP - s0.nP;
    const okDir = Math.abs(u.dx - edx) < 0.01 && Math.abs(u.dy - edy) < 0.01;
    const lung = Math.hypot(s1.ht.x - s0.ht.x, s1.ht.y - s0.ht.y);
    if (!okDir) D.push(`P ${lab}: passo (${u.dx},${u.dy}) invece di (${edx.toFixed(3)},${edy.toFixed(3)})`);
    if (Math.abs(u.len - 2.5) > 0.01) D.push(`P ${lab}: passo lungo ${u.len}u invece di 2,5u`);
    if (Math.abs(lung - 2.5) > 0.2) D.push(`P ${lab}: l'eroe si e' spostato di ${lung.toFixed(2)}u invece di 2,5u`);
    if (fatti !== 1 || s0.moves - s1.moves !== 1) D.push(`P ${lab}: ${fatti} passi e ${s0.moves - s1.moves} mosse consumate per un tocco`);
    /* (a) se fra la domanda e il tocco il marcatore non si e' mosso, lo stacco applicato DEVE essere __CPM_MOVEGAIN; (b) in ogni caso deve
       essere la regola del 7.317 (12 + 8·coseno, fra 3 e 20) sul marcatore e sul punto dell'eroe dell'istante del tocco (testimone) */
    const mk = u.mk; const mosso = mk && pr.mk ? Math.hypot(mk.x - pr.mk.x, mk.y - pr.mk.y) : null;
    let regola = null; if (mk) { const ax = mk.hx - mk.x, ay = mk.hy - mk.y, al = Math.hypot(ax, ay), ml = Math.hypot(u.dx, u.dy); regola = al < 0.001 ? 12 : Math.max(3, Math.min(20, 12 + 8 * ((u.dx / ml) * (ax / al) + (u.dy / ml) * (ay / al)))); }
    if (u.gain == null || regola == null || Math.abs(u.gain - regola) > 0.05) D.push(`P ${lab}: stacco ${u.gain} fuori dalla regola del 7.317 (${regola == null ? '—' : regola.toFixed(3)})`);
    if (atteso == null || (mosso != null && mosso < 0.05 && Math.abs(u.gain - atteso) > 0.05)) D.push(`P ${lab}: stacco ${u.gain} contro __CPM_MOVEGAIN ${atteso == null ? '—' : atteso.toFixed(3)} col marcatore fermo`);
    note.push(`P ${lab}: passo (${u.dx},${u.dy}) lungo ${u.len}u · eroe ${lung.toFixed(2)}u · mosse ${s0.moves}→${s1.moves} · stacco ${u.gain} (MOVEGAIN ${atteso == null ? '—' : atteso.toFixed(2)}, regola ${regola == null ? '—' : regola.toFixed(2)}, marcatore mosso ${mosso == null ? '—' : mosso.toFixed(2)}u) · gi${f.sc.gi}`);
    /* T: sul telefono il pad resta dopo la prima mossa finche' ci sono mosse */
    if (tel) {
      if (s1.ph !== 'hl_choose') D.push(`T ${lab}: dopo la prima mossa fase ${s1.ph} invece di hl_choose (quella del PC)`);
      if (s1.moves > 0 && s1.tasti.length < 4) D.push(`T ${lab}: pad sparito dopo la prima mossa con ${s1.moves} mosse rimaste`);
      if (s1.moves > 0 && s1.scelte) D.push(`T ${lab}: scheda delle giocate a schermo col pad ancora utile`);
    }
  }
  /* T: catena intera sul telefono (mosse fino a zero) e «Scegli» col pad a schermo */
  if (tel && !rosso) {
    const f = await forza(H, lista, k, !tel); if (!f) nonG.push('T: nessuna scena per la catena'); else { k = f.k + 1;
      let s = f.s; let giri = 0; const traccia = [];
      while (s && s.moves > 0 && giri < 5) { const t = s.tasti.find(x => x.lab === '▶') || s.tasti[0]; if (!t) break; await H.page.touchscreen.tap(t.x + t.w / 2, t.y + t.h / 2); await sleep(800); s = await stato(H.page); giri++; traccia.push(`${s && s.moves} mosse/${s && s.tasti.length} tasti/${s && s.scelte ? 'giocate' : '-'}`); }
      if (!s || s.moves !== 0) D.push(`T: catena non arrivata a zero mosse (${traccia.join(' · ')})`);
      else { if (s.tasti.length) D.push('T: a mosse finite il pad e\' ancora a schermo'); if (!s.scelte) D.push('T: a mosse finite la scheda delle giocate non c\'e\''); }
      note.push(`T catena gi${f.sc.gi} (${f.sc.mm} mosse): ${traccia.join(' · ')}`);
    }
    const f2 = await forza(H, lista, k, !tel); if (!f2) nonG.push('T: nessuna scena per «Scegli»'); else { k = f2.k + 1;
      const t = f2.s.tasti.find(x => x.lab === '▲'); if (t) { await H.page.touchscreen.tap(t.x + t.w / 2, t.y + t.h / 2); await sleep(800); }
      const s1 = await stato(H.page);
      if (!s1 || !s1.scegli) { if (!rosso) D.push('T: dopo la prima mossa manca «Scegli» accanto al pad'); else D.push('T: dopo la prima mossa il pad (e «Scegli») non ci sono piu\''); }
      else { await H.page.touchscreen.tap(s1.scegli.x, s1.scegli.y); await sleep(700); const s2 = await stato(H.page);
        if (!s2 || !s2.scelte || s2.tasti.length) D.push(`T: «Scegli» non porta alle giocate (giocate ${s2 && s2.scelte} · tasti ${s2 && s2.tasti.length})`);
        note.push(`T «Scegli»: mosse ${s1.moves} → giocate ${s2 && s2.scelte} · tasti ${s2 && s2.tasti.length}`); }
    }
  } else if (!tel) {
    /* PC: il pad resta accanto alle giocate dopo la prima mossa (com'era) */
    const f = await forza(H, lista, k, !tel); if (!f) nonG.push('PC: nessuna scena per il pad dopo la prima mossa'); else { k = f.k + 1;
      const t = f.s.tasti.find(x => x.lab === '▲'); if (t) { await H.page.mouse.click(t.x + t.w / 2, t.y + t.h / 2); await sleep(800); }
      const s1 = await stato(H.page); if (!s1 || s1.moves < 1 || s1.tasti.length < 4) D.push(`PC: pad assente dopo la prima mossa (mosse ${s1 && s1.moves})`);
      if (!s1 || !s1.aiutoDiag) D.push('K: riga «Diagonali: due frecce insieme» assente');
      note.push(`PC dopo la prima mossa: fase ${s1 && s1.ph} · mosse ${s1 && s1.moves} · tasti ${s1 && s1.tasti.length} · aiuto diagonali ${s1 && s1.aiutoDiag}`); }
    /* K: tastiera — accordo di due frecce con 0/20/40 ms fra l'una e l'altra, e una freccia sola */
    let tot = 0, buoni = 0;
    for (const delta of (rosso ? [0] : [0, 20, 40])) for (const [a, b2, sx, sy] of ACCORDI) {
      const f3 = await forza(H, lista, k, !tel); if (!f3) { nonG.push(`K ${a}+${b2} ${delta}ms: nessuna scena`); continue; } k = f3.k + 1; tot++;
      await H.page.keyboard.down(a); if (delta) await sleep(delta); await H.page.keyboard.down(b2); await sleep(220); await H.page.keyboard.up(a); await H.page.keyboard.up(b2);
      await sleep(600); const s1 = await stato(H.page);
      const nuovi = s1 ? s1.nP - f3.s.nP : 0; const u = s1 && s1.ultimo;
      const ok = nuovi === 1 && u && u.src === 'tasti' && Math.sign(u.dx) === sx && Math.sign(u.dy) === sy && Math.abs(u.len - 2.5) < 0.01 && f3.s.moves - s1.moves === 1;
      if (ok) buoni++; else D.push(`K ${a}+${b2} a ${delta} ms: ${nuovi} passi, ultimo ${u ? '(' + u.dx + ',' + u.dy + ') ' + u.len + 'u' : '—'}, mosse ${f3.s.moves}→${s1 && s1.moves} (fase ${f3.s.ph}→${s1 && s1.ph}, gi${f3.sc.gi}, pagina ${H.aperture}, tasti visti dalla pagina ${JSON.stringify(await H.page.evaluate(() => (window.__KD210 || []).slice(-4)).catch(() => null))})`);
    }
    note.push(`K accordi: ${buoni}/${tot} diagonali da 2,5u in una mossa`);
    const f4 = await forza(H, lista, k, !tel); if (!f4) nonG.push('K: nessuna scena per la freccia sola'); else { k = f4.k + 1;
      await H.page.keyboard.down('ArrowUp'); await sleep(220); await H.page.keyboard.up('ArrowUp'); await sleep(600); const s1 = await stato(H.page); const u = s1 && s1.ultimo;
      if (!(s1 && s1.nP - f4.s.nP === 1 && u && u.dx === 2.5 && u.dy === 0)) D.push(`K freccia sola: ${s1 ? s1.nP - f4.s.nP : '—'} passi, ultimo ${u ? '(' + u.dx + ',' + u.dy + ')' : '—'}`);
      note.push(`K freccia sola: ${u ? '(' + u.dx + ',' + u.dy + ') ' + u.len + 'u' : '—'}`); }
  }
  const errs = [...H.errs0, ...H.errs]; if (errs.length) D.push(`errori di pagina: ${errs.slice(0, 3).join(' | ')}`);
  note.push(`pagine aperte: ${H.aperture}`);
  await H.ctx.close();
  return { w, D, nonG, note };
}

async function braccio(rosso) {
  console.log(`\n== ${rosso ? 'ROSSO (__CPM_NO_G210)' : 'VERDE'} ==`);
  const R = []; for (const w of VISTE) { const r = await schermo(w, rosso); R.push(r);
    console.log(`-- ${w < 800 ? 'telefono' : 'PC'} ${VP[w].width}x${VP[w].height}`); for (const n of r.note) console.log('   ' + n);
    for (const n of r.nonG) console.log('   ⚠️ non giudicato: ' + n); for (const d of r.D) console.log('   ❌ ' + d); }
  return R;
}
let esito = 0;
try {
  if (PARTE !== 'rosso') { const R = await braccio(false); const dif = R.reduce((s, r) => s + r.D.length, 0), ng = R.reduce((s, r) => s + r.nonG.length, 0);
    console.log(`VERDE: difetti ${dif} · non giudicati ${ng}`); if (dif || ng) esito = 1; }
  if (PARTE !== 'verde') { const R = await braccio(true); const ng = R.reduce((s, r) => s + r.nonG.length, 0);
    /* nel rosso il guardiano deve vedere: sul telefono i tasti diagonali assenti e il pad sparito dopo la prima mossa; sul PC la diagonale da tastiera lunga 3,54u */
    const tel = R.filter(r => r.w < 800), pc = R.filter(r => r.w >= 800);
    const vistoG = R.every(r => r.D.some(d => /^G: \d tasti di direzione/.test(d)));
    const vistoT = tel.every(r => r.D.some(d => /^T .*pad sparito/.test(d)));
    const vistoK = pc.every(r => r.D.some(d => /^K /.test(d) && /3\.5[34]\d*u/.test(d)));
    console.log(`ROSSO: tasti diagonali assenti visti ${vistoG} · pad sparito sul telefono visto ${vistoT} · diagonale 3,54u da tastiera vista ${vistoK} · non giudicati ${ng}`);
    if (!(vistoG && vistoT && vistoK) || ng) { console.log('❌ il braccio rosso non e\' stato bocciato come doveva'); esito = 1; } }
} finally { await browser.close(); srv.close(); }
console.log(esito ? '❌ diagonali-210 ROSSO' : '✅ diagonali-210 VERDE');
process.exit(esito);
