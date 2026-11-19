#!/usr/bin/env node
/* [giro 228 · PO-493] GUARDIANO rosa-228. Club › Rosa a 360 px: i ruoli si mostrano in SIGLA a tre lettere maiuscole
   (siglaRuolo228, decisione PO 16/11) con il ruolo intero in title/aria-label, e NESSUN nome sotto i 18 caratteri e' tagliato.
   Gioco vero (?cpmtest=1), salvataggio sintetico (misura-199), eroe con ruolo per esteso («Centrocampista»), N club scorsi con
   __CPM_CAREER.patch({club}) — misura condivisa con la sonda misura-228 (misuraRosa).
   Bracci: VERDE (gioco) deve passare; ROSSO window.__CPM_NO_G228 (ruolo per esteso) deve essere bocciato.
   «Non giudicato» (Rosa non trovata, meno righe del minimo, errori di pagina) = rosso. Verde e rosso stampati per ultimi.
   [giro 239 · PO-507a] IL RUOLO INTERO AL TOCCO: nel braccio verde si toccano (clic del mouse a 360 px: la pagina non ha il tocco) le sigle di 6 righe
   di club diversi: deve aprirsi il fumetto (data-cpm fumetto239) col ruolo intero = l'aria-label senza «Ruolo: », sopra la sigla e
   dentro lo schermo; un secondo tocco altrove lo chiude; il testo della riga resta la sigla. Convive con la «R» del rigorista (giro
   257): il fumetto non la tocca. ROSSO window.__CPM_NO_G239: nessun fumetto → DEVE essere bocciato.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node rosa-228.mjs   (CPM_N228R=<club>, default 24) */
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { salva, apri } from './misura-199.mjs';
import { misuraRosa } from './misura-228.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const N = +(process.env.CPM_N228R || 24), W = 360, MIN_RIGHE = N * 20;
/* [giro 239] il fumetto del ruolo al tocco: tocca le sigle di qualche riga e legge fumetto, posizione e chiusura */
async function fumetti(page) {
  const out = { provati: 0, aperti: 0, giusti: 0, dentro: 0, chiusi: 0, rigaInvariata: 0, es: [] };
  const n = await page.evaluate(() => document.querySelectorAll('[data-cpm="rosa-ruolo228"]').length);
  for (const i of [0, 3, 7, 11, 15, 19].filter(x => x < n)) {
    const el = page.locator('[data-cpm="rosa-ruolo228"]').nth(i); await el.evaluate(e => e.scrollIntoView({ block: 'center' })).catch(() => {}); await sleep(300);/* al centro: in fondo allo schermo il pulsante flottante «Idee e feedback» copre l'ultima riga (misurato: elementFromPoint) */
    const prima = await el.evaluate(e => ({ t: (e.innerText || '').trim(), al: e.getAttribute('aria-label') || '' }));
    if (process.env.CPM_DBG239) console.log(i, JSON.stringify(await el.evaluate(e => { const b = e.getBoundingClientRect(); const h = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return { b: [b.left, b.top, b.width, b.height].map(Math.round), vh: innerHeight, mio: e.contains(h), h: h && (h.tagName + ' ' + (h.getAttribute('data-cpm') || '') + ' ' + (h.textContent || '').slice(0, 30)) }; })));
    out.provati++; await el.tap().catch(async () => { await el.click().catch(() => {}); }); await sleep(250);
    const f = await page.evaluate((i) => { const q = document.querySelector('[data-cpm="fumetto239"]'); const s = document.querySelectorAll('[data-cpm="rosa-ruolo228"]')[i];
      if (!q) return null; const r = q.getBoundingClientRect(), b = s.getBoundingClientRect();
      return { t: (q.textContent || '').trim(), sopra: r.bottom <= b.top + 2, dentro: r.left >= 0 && r.right <= window.innerWidth && r.top >= 0, riga: (s.innerText || '').trim() }; }, i);
    if (f) { out.aperti++; const att = prima.al.replace(/^Ruolo: /, ''); if (f.t === att) out.giusti++; else if (out.es.length < 3) out.es.push(`«${f.t}» atteso «${att}»`);
      if (f.dentro && f.sopra) out.dentro++; if (f.riga === prima.t) out.rigaInvariata++; } else if (out.es.length < 3) out.es.push(`riga ${i} «${prima.t}»: fumetto non aperto`);
    await page.mouse.click(5, 5).catch(() => {}); await sleep(200);
    if (!(await page.evaluate(() => !!document.querySelector('[data-cpm="fumetto239"]')))) out.chiusi++;
  }
  return out;
}
async function braccio(browser, port, rosso, rosso239) {
  const a = await apri(browser, port, salva({ position: 'Centrocampista' }), ['__CPM_FIS_APERTE', ...(rosso ? ['__CPM_NO_G228'] : []), ...(rosso239 ? ['__CPM_NO_G239'] : [])], W, 800);
  try {
    const clubs = await a.page.evaluate(() => window.__CPM_CLUBS || []);
    const step = Math.max(1, Math.floor(clubs.length / N)); const R = { club: 0, righe: 0, nonSigla: 0, senzaTitolo: 0, tagliatiCorti: 0, tagliatiLunghi: 0, esempi: [] };
    for (let k = 0; k < clubs.length && R.club < N; k += step) {
      await a.page.evaluate((c) => { window.__CPM_CAREER.patch({ club: c }); window.__CPM_CAREER.goTab('club'); }, clubs[k]); await sleep(350);
      const m = await misuraRosa(a.page); if (!m || !m.length) continue; R.club++;
      for (const r of m) {
        R.righe++;
        const sg = (r.ruolo || '').replace(/(jolly|U21)$/, '');
        if (!/^[A-Z0-9]{3}$/.test(sg)) { R.nonSigla++; if (R.esempi.length < 6) R.esempi.push(`ruolo «${r.ruolo}»`); }
        if (!r.ruoloTitolo || !/^Ruolo: \S/.test(r.ruoloTitolo) || !r.ruoloTitle) R.senzaTitolo++;
        if (r.tagliato) { if (r.nome.length < 18) { R.tagliatiCorti++; if (R.esempi.length < 6) R.esempi.push(`tagliato «${r.nome}» ${r.w}/${r.sw} [${r.ruolo}]`); } else R.tagliatiLunghi++; }
      }
    }
    if (rosso239) { const F = await fumetti(a.page); return [F.provati >= 5 && F.aperti === F.provati && F.giusti === F.provati, `fumetti ${F.aperti}/${F.provati} aperti (giudicato ${F.provati >= 5})`]; }
    const F = rosso ? null : await fumetti(a.page);
    if (F) R.fum = F;
    if (a.errors.length) return [false, 'errori di pagina: ' + a.errors.join(' / ')];
    if (R.righe < MIN_RIGHE) return [false, `non giudicato: ${R.righe} righe < ${MIN_RIGHE} (${R.club} club)`];
    const okF = !R.fum || (R.fum.provati >= 5 && R.fum.aperti === R.fum.provati && R.fum.giusti === R.fum.provati && R.fum.dentro === R.fum.provati && R.fum.chiusi === R.fum.provati && R.fum.rigaInvariata === R.fum.provati);
    const ok = R.nonSigla === 0 && R.senzaTitolo === 0 && R.tagliatiCorti === 0 && okF;
    return [ok, (R.fum ? `[giro 239] fumetto: aperti ${R.fum.aperti}/${R.fum.provati} · ruolo giusto ${R.fum.giusti} · sopra la sigla e dentro lo schermo ${R.fum.dentro} · chiusi da un tocco altrove ${R.fum.chiusi} · riga invariata ${R.fum.rigaInvariata}${R.fum.es.length ? ' · ' + R.fum.es.join(' | ') : ''} · ` : '') + `${R.club} club · ${R.righe} righe · ruoli non in sigla ${R.nonSigla} · senza ruolo intero ${R.senzaTitolo} · nomi <18 tagliati ${R.tagliatiCorti} · nomi ≥18 tagliati ${R.tagliatiLunghi}${R.esempi.length ? ' · es. ' + R.esempi.join(' | ') : ''}`];
  } catch (e) { return [false, 'non giudicato: ' + String(e.message).slice(0, 160)]; }
  finally { await a.page.close(); }
}
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
let v, r, r239;
try { v = await braccio(browser, port, false); r = await braccio(browser, port, true); r239 = await braccio(browser, port, false, true); }
finally { await browser.close(); srv.close(); }
const ok = v[0] && !r[0] && !r239[0];
console.log(`VERDE: ${v[0] ? '✓' : '✗'} ${v[1]}`);
console.log(`ROSSO __CPM_NO_G228: ${!r[0] ? '✓ bocciato' : '✗ passa'} ${r[1]}`);
console.log(`ROSSO __CPM_NO_G239: ${!r239[0] ? '✓ bocciato' : '✗ passa'} ${r239[1]}`);
console.log(ok ? '✓ rosa-228 VERDE' : '✗ rosa-228 ROSSO');
process.exit(ok ? 0 : 1);
