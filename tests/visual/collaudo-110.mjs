/* [giro 110 · PO-309 · nove difetti BASSI del collaudo grafico 180] guardiano collaudo-110.
   Per ogni difetto una misura che e' VERDE col codice nuovo e ROSSA con l'interruttore __CPM_NO_G110_<NN> (il comportamento della 181).
   Uso: node collaudo-110.mjs [verde|rosso|tutto]  (default tutto = verde poi rosso). CPM_110_SOLO=11,20 limita ai difetti nominati.
   Sessioni: CARRIERA (G11 classifica · G20 fisarmoniche e sottoschede col mouse · G23 «Salta» · G25 raggi dei riquadri)
             PARTITA (G24 caratteri delle formazioni · G23 ardesia nel tabellone e nella cronaca · G33 nome sul giallo nell'ingresso ·
             G27 possesso al 1'-2' · G31 giocate su PC · G17 banner d'esito dentro il campo).
   Il banco e' lo stesso del collaudo 180: club di prova letti da src/02 (rosso = Merseyside, giallo = Wolverhampton), tre formati. Non tocca src/. */
import * as L from './lib/misura-110.mjs';
const MODO = process.argv[2] || 'tutto';
const SOLO = process.env.CPM_110_SOLO ? process.env.CPM_110_SOLO.split(',') : null;
const vuole = n => !SOLO || SOLO.includes(String(n));
const srv = await L.startServer(); const port = srv.address().port; const b = await L.launchBrowser();
const fl = (n) => '__CPM_NO_G110_' + n;
const R = [];/* {arm, id, f, ok, num} */
const reg = (arm, id, f, ok, num) => { R.push({ arm, id, f, ok, num }); console.log(`${arm.toUpperCase().padEnd(6)} G180-${id} ${f.padEnd(4)} ${ok ? 'ok ' : 'NO '} ${num}`); };

async function carriera(arm, f) {
  const flags = arm === 'rosso' ? [11, 20, 23, 25].map(fl) : [];
  const { ctx, page } = await L.apriCarriera(b, port, f, 'rosso', { flags }); if (!page) { reg(arm, '??', f.k, false, 'carriera non aperta'); return; }
  await L.armaMisure(page);
  const vai = async t => { await page.evaluate(x => window.__CPM_CAREER.goTab(x), t); await L.sleep(700); };
  if (vuole(11)) { await vai('standings');
    const r = await page.evaluate(() => { let min = 99, quale = ''; document.querySelectorAll('table.cpm-num tbody tr').forEach((tr, i) => { const td = tr.children[1]; const s = td.firstElementChild || td; const m = window.__m110.testo(s); if (m.cr < min) { min = m.cr; quale = (i + 1) + '° ' + m.col + ' su ' + m.fondo; } }); return { min, quale }; });
    reg(arm, 11, f.k, r.min >= 4.5, `posizione meno leggibile ${r.quale} = ${r.min}:1 (soglia 4,5)`); }
  if (vuole(20) && !f.touch) { let min = 999, quale = '';
    for (const t of ['standings', 'calendar', 'profile']) { await vai(t);
      const r = await page.evaluate(() => { let min = 999, q = ''; document.querySelectorAll('button[aria-expanded], .cpm-tabs40 button').forEach(e => { const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return; if (r.height < min) { min = r.height; q = (e.textContent || '').trim().slice(0, 18); } }); return { min, q }; });
      if (r.min < min) { min = r.min; quale = t + ':' + r.q; } }
    reg(arm, 20, f.k, min >= 36, `riga o sottoscheda piu' bassa «${quale}» = ${Math.round(min)} px (mouse, soglia 36)`); }
  if (vuole(25)) { let tot = 0, sotto = 0; const h = {};
    for (const t of ['dashboard', 'standings', 'calendar', 'profile', 'club']) { await vai(t);
      const r = await page.evaluate(() => { const o = {}; document.querySelectorAll('div,section,article').forEach(e => { const r = e.getBoundingClientRect(); if (r.width < 200 || r.height < 56) return; const c = getComputedStyle(e); const box = (c.backgroundColor !== 'rgba(0, 0, 0, 0)' || c.backgroundImage !== 'none') && (parseFloat(c.borderTopWidth) > 0 || c.boxShadow !== 'none'); if (!box) return; e.__box110 = true; }); document.querySelectorAll('div,section,article').forEach(e => { if (!e.__box110) return; for (let p = e.parentElement; p; p = p.parentElement) if (p.__box110) return;/* solo i riquadri di primo livello: le tessere dentro una carta seguono la carta */ const rad = Math.round(parseFloat(getComputedStyle(e).borderTopLeftRadius) || 0); if (rad > 0) o[rad] = (o[rad] || 0) + 1; }); return o; });
      for (const k in r) { h[k] = (h[k] || 0) + r[k]; tot += r[k]; if (+k < 14) sotto += r[k]; } }
    reg(arm, 25, f.k, tot > 0 && sotto / tot <= 0.10, `riquadri con raggio < 14 px: ${sotto} su ${tot} (${tot ? Math.round(100 * sotto / tot) : 0} %, tetto 10 %) · istogramma ${JSON.stringify(h)}`); }
  if (vuole(23)) { await page.evaluate(() => { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.goTab('dashboard'); }); await L.sleep(400);
    const ap = await page.evaluate(() => { try { return window.__CPM_CAREER.apriPresentazione(0); } catch (e) { return String(e.message); } }); await L.sleep(900);
    const r = await page.evaluate(() => { const o = []; document.querySelectorAll('button').forEach(e => { if (!/^Salta/.test((e.textContent || '').trim()) || !window.__m110.vis(e)) return; o.push(getComputedStyle(e).backgroundColor); }); return o; });
    const v1 = r.filter(c => /rgba?\(15, 23, 42/.test(c));
    reg(arm, 23, f.k + 'S', r.length > 0 && v1.length === 0, `«Salta» della presentazione: ${r.length} tasti, fondi ${JSON.stringify(r)} (ardesia V1 = ${v1.length})`); }
  await ctx.close();
}

async function partita(arm, f) {
  const flags = arm === 'rosso' ? [17, 23, 24, 27, 31].map(fl) : [];
  const { ctx, page } = await L.apriCarriera(b, port, f, 'giallo', { flags, anim: true }); if (!page) { reg(arm, '??', f.k, false, 'carriera non aperta'); return; }
  await L.armaMisure(page);
  const hooks = {
    formations: async () => { if (!vuole(24)) return; await L.sleep(500);
      const r = await page.evaluate(() => { const fam = {}; document.querySelectorAll('svg text').forEach(e => { if (!window.__m110.vis(e)) return; const k = getComputedStyle(e).fontFamily.split(',')[0].replace(/['"]/g, ''); fam[k] = (fam[k] || 0) + 1; }); return fam; });
      reg(arm, 24, f.k, !r.Arial && Object.keys(r).length > 0, `caratteri dei numeri sul campo ${JSON.stringify(r)} (Arial = ${r.Arial || 0})`); },
    walkout: async () => { await L.sleep(600);
      if (vuole(23)) { const r = await page.evaluate(() => { let n = 0; document.querySelectorAll('*').forEach(e => { if (!e.childElementCount && (e.textContent || '').trim() && window.__m110.vis(e) && /rgb\(15, 23, 42\)/.test(getComputedStyle(e).color)) n++; }); return n; });
        reg(arm, 23, f.k + 'I', r === 0, `testi in inchiostro ardesia V1 (#0f172a) nell'ingresso: ${r}`); }
      if (vuole(33)) { const r = await page.evaluate(() => { let min = 99, q = ''; document.querySelectorAll('*').forEach(e => { if (e.childElementCount || e instanceof SVGElement/* la sigla dentro lo scudo sta sul disegno dello scudo, non sulla barra: il fondo analitico non la vede */ || !(e.textContent || '').trim() || !window.__m110.vis(e)) return; const rc = e.getBoundingClientRect(); if (rc.top > 90) return; const top = document.elementFromPoint(rc.left + rc.width / 2, rc.top + rc.height / 2); if (top !== e && !(top && e.contains(top))) return;/* testo coperto da un altro: non si vede, non si misura */ const m = window.__m110.testo(e); if (m.cr < min) { min = m.cr; q = (e.textContent || '').trim().slice(0, 20) + ' ' + m.col + ' su ' + m.fondo; } }); return { min, q }; });
        reg(arm === 'rosso' ? 'rosso' : 'verde', 33, f.k, r.min >= 4.5, `NON RIPRODUCIBILE: testo del tabellone sul giallo nell'ingresso, il piu' basso «${r.q}» = ${r.min}:1 (soglia 4,5; senza interruttore, resta verde anche nel braccio rosso)`); } },
  };
  await L.portaPartita(page, 'playing', hooks);
  if (vuole(27)) { const r = await page.evaluate(() => { const s = document.querySelector('[data-cpm="striscia918"]'); const st = window.__CPM_STATE && window.__CPM_STATE(); return { t: s ? s.innerText.replace(/\s*\n\s*/g, ' | ') : null, min: st && st.clock }; });
    const m = r.t && /POSSESSO \| ([^|]*)\|/i.exec(r.t); const val = m ? m[1].trim() : '?';
    reg(arm, 27, f.k, !!r.t && r.min <= 3 && /^–/.test(val), `al ${r.min}' la striscia dice «${val}» (atteso «–» finche' i passaggi sono < 40)`); }
  if (vuole(23) && f.k !== 'pc') { const r = await page.evaluate(() => { const e = document.querySelector('[data-cpm="colonna-partita-v2"]'); return e ? getComputedStyle(e).backgroundColor : null; });
    reg(arm, 23, f.k + 'C', r === 'rgb(13, 15, 20)', `fondo della colonna di cronaca ${r} (atteso TINTE.bg rgb(13, 15, 20), non l'ardesia rgb(15, 23, 42))`); }
  if (await L.portaScelta(page)) {
    if (vuole(31) && !f.touch) { const r = await page.evaluate(() => { const bt = [...document.querySelectorAll('button')].filter(e => window.__m110.vis(e) && /^[123]\s/.test((e.textContent || '').trim().replace(/^(\d)/, '$1 '))); let h = 999, cr = 99; const nn = []; bt.forEach(e => { const d = e.querySelector('div > div'); if (!d || !/^\d$/.test((d.textContent || '').trim())) return; nn.push(1); h = Math.min(h, e.getBoundingClientRect().height); cr = Math.min(cr, window.__m110.testo(d).cr); }); return { n: nn.length, h, cr }; });
      reg(arm, 31, f.k, r.n >= 2 && r.h >= 44 && r.cr >= 4.5, `${r.n} giocate · la piu' bassa ${Math.round(r.h)} px (soglia 44) · numero meno leggibile ${r.cr}:1 (soglia 4,5)`); }
    if (await L.risolvi(page, 'gol') && vuole(17)) { let fuori = 0, peggio = 0, n = 0, quale = '';
      for (let k = 0; k < 40; k++) { const r = await page.evaluate(() => { const bx = document.querySelector('[data-cpm="vista3d-box"]'), p = document.querySelector('[data-cpm="pillola-esito"]'); if (!bx || !p) return null; const a = bx.getBoundingClientRect(), c = p.getBoundingClientRect(); return { sx: a.left - c.left, dx: c.right - a.right, w: c.width, cw: a.width }; });
        if (r) { n++; const ecc = Math.max(r.sx, r.dx); if (ecc > 0.5) { fuori++; if (ecc > peggio) { peggio = ecc; quale = `${Math.round(r.w)}/${Math.round(r.cw)}`; } } } await L.sleep(170); }
      reg(arm, 17, f.k, n >= 3 && fuori === 0, `banner d'esito: ${n} campioni, ${fuori} con la scatola fuori dal campo (sporge fino a ${peggio.toFixed(1)} px, larghezze ${quale || '–'})`); }
  } else reg(arm, 31, f.k, false, 'scelta non raggiunta');
  await ctx.close();
}

const bracci = MODO === 'verde' ? ['verde'] : MODO === 'rosso' ? ['rosso'] : ['verde', 'rosso'];
const errs = [];
for (const arm of bracci) for (const f of L.FORMATI) { try { await carriera(arm, f); } catch (e) { errs.push(`${arm} ${f.k} carriera: ${String(e.message).slice(0, 100)}`); } try { await partita(arm, f); } catch (e) { errs.push(`${arm} ${f.k} partita: ${String(e.message).slice(0, 100)}`); } }
await b.close(); srv.close();
/* esito: per ogni difetto il braccio verde deve essere tutto ok, il rosso deve avere almeno un formato che cade (G180-33: non riproducibile, solo verde) */
const ids = [...new Set(R.map(r => r.id))].sort(); let tutto = errs.length === 0;
const righe = [];
for (const id of ids) { const v = R.filter(r => r.arm === 'verde' && r.id === id), ro = R.filter(r => r.arm === 'rosso' && r.id === id);
  const vOK = v.length > 0 && v.every(r => r.ok); const rOK = String(id) === '33' ? true : (MODO === 'verde' ? true : ro.some(r => !r.ok));
  if (!vOK || !rOK) tutto = false;
  righe.push(`G180-${id}: verde ${vOK ? 'OK' : 'ROSSO'} (${v.filter(r => r.ok).length}/${v.length}) · rosso ${String(id) === '33' ? 'n/a (non riproducibile)' : MODO === 'verde' ? 'non eseguito' : rOK ? 'cade come deve (' + ro.filter(r => !r.ok).map(r => r.f).join(',') + ')' : 'CIECO: non cade'}`); }
errs.forEach(e => console.log('ERRORE ' + e));
console.log('--- riepilogo ---'); righe.forEach(r => console.log(r));
console.log(tutto ? '✅ collaudo-110 OK' : '❌ collaudo-110 NON OK');
console.log(`braccio: ${bracci.join('+')} · motivo: ${tutto ? 'ogni difetto verde col codice nuovo' + (MODO !== 'verde' ? ' e rosso con il suo interruttore' : '') : 'almeno un difetto non torna (vedi sopra)'}`);
process.exit(tutto ? 0 : 1);
