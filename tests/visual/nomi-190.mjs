#!/usr/bin/env node
/* [giro 190 · PO-396 «Primavera → U19» · PO-397 «barra a 375 px: prima il nome abbreviato, la sigla solo se non entra»]
   GUARDIANO nomi-190. Sul gioco vero (?cpmtest=1):
   1. SCALA DEI NOMI (pura, funzione unica candidatiSquadra182): «FC Valmora Primavera» → «FC Valmora U19» → «Valmora U19» →
      «Valmora» → «VAL»; «FC Valmora» → «Valmora» → «VAL»; «Selezione Granata» resta → «Sel. Granata» → «GRA» (nessun FC in testa).
      Ogni gradino e' piu' corto o uguale al precedente in caratteri; la sigla e' sempre l'ultimo.
   2. CENSIMENTO SULLA BARRA DELLA PARTITA (provino vero) a 375 e 390 px: con il carattere e lo spazio veri del nome sulla
      barra, per TUTTI i club si sceglie il primo gradino che ci sta; si contano intero / U19-dizionario / abbreviato / sigla.
      Verde: a 375 px le sigle scendono sotto meta' della misura di partenza (216 su 296 → < 108) e nessun club che ha un
      nome abbreviato che ci sta finisce in sigla; il nome mostrato sulla barra e' il primo gradino che ci sta.
   3. PRIMAVERA SULLA BARRA: il nome di un club Primavera, quando l'intero non entra, mostra «U19» prima di scendere oltre.
   Braccio rosso: CPM_ROSSO190=1 accende __CPM_NO_G190D (niente U19) e __CPM_NO_G190E (niente nome abbreviato) → DEVE uscire 1.
   «Non giudicato» = rosso. Foto: CPM_FOTO190=<cartella> (barra a 375/390).
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node nomi-190.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep, openMatch } from './lib/harness.mjs';
import fs from 'fs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROSSO = process.env.CPM_ROSSO190 === '1';
const FOTO = process.env.CPM_FOTO190 || '';
if (FOTO) fs.mkdirSync(FOTO, { recursive: true });
const fails = [], oks = [];
const ok = (c, m) => { (c ? oks : fails).push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const PARTENZA_SIGLE_375 = 216;

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
async function nuovaPagina(vp) {
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: FOTO ? 2 : 1 });
  await installCdnRoutes(page);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
  await page.addInitScript((rosso) => { window.__CPM_GLB = false; if (rosso) { window.__CPM_NO_G190D = 1; window.__CPM_NO_G190E = 1; } }, ROSSO);
  return { page, errors };
}
const cens = {};
try {
  console.log('1) scala dei nomi (funzione unica)');
  {
    const { page } = await nuovaPagina({ width: 412, height: 915 });
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!window.__CPM_NOMI182, null, { timeout: 60000 });
    const casi = [
      [{ n: 'FC Valmora Primavera', a: 'VAL' }, ['FC Valmora Primavera', 'FC Valmora U19', 'Valmora U19', 'Valmora', 'VAL']],
      [{ n: 'FC Valmora', a: 'VAL' }, ['FC Valmora', 'Valmora', 'VAL']],
      [{ n: 'Torino Athletic Primavera', a: 'TAT' }, ['Torino Athletic Primavera', 'Torino Athletic U19', 'TAT']],
      [{ n: 'Selezione Granata', a: 'GRA' }, ['Selezione Granata', 'Sel. Granata', 'GRA']],
      [{ n: 'AC Dorvelli', a: 'ACR' }, ['AC Dorvelli', 'Dorvelli', 'ACR']],
    ];
    const r = await page.evaluate((c) => c.map(([t]) => window.__CPM_NOMI182.candidati(t)), casi);
    casi.forEach(([t, exp], i) => ok(JSON.stringify(r[i]) === JSON.stringify(exp), `«${t.n}»: ${r[i].join(' → ')} (atteso ${exp.join(' → ')})`));
    const tutti = await page.evaluate(() => { const club = [...CLUBS, ...U18_CLUBS, ...U18_CLUBS_P2, ...TRIAL_OPPONENTS]; let male = [];
      for (const c of club) { const k = window.__CPM_NOMI182.candidati(c); for (let i = 1; i < k.length; i++) if (k[i].length > k[i - 1].length) male.push(c.n + ': ' + k.join('→')); if (k[k.length - 1] !== (c.a || c.abbr)) male.push(c.n + ': sigla non ultima'); }
      return { n: club.length, male: male.slice(0, 5), nMale: male.length, primavera: club.filter(c => /Primavera/.test(c.n)).length,
        u19: club.filter(c => /Primavera/.test(c.n) && window.__CPM_NOMI182.candidati(c)[1] === c.n.replace('Primavera', 'U19')).length }; });
    ok(tutti.nMale === 0, `scala dal piu' lungo al piu' corto, sigla ultima, su ${tutti.n} club (${tutti.nMale} storti ${tutti.male.join('; ')})`);
    ok(tutti.primavera > 0 && tutti.u19 === tutti.primavera, `«Primavera» → «U19» come primo gradino: ${tutti.u19}/${tutti.primavera} club Primavera`);
    await page.close();
  }
  for (const vp of [{ width: 375, height: 812 }, { width: 390, height: 844 }]) {
    console.log(`2) barra della partita del provino a ${vp.width}px`);
    const { page, errors } = await nuovaPagina(vp);
    try {
      await openMatch(page, port, { skipLoadAll: true, name: 'Collaudo Barra' });
      let vista = false;
      for (let i = 0; i < 40; i++) { await sleep(500); vista = await page.evaluate(() => !!document.querySelector('[data-cpm="barra-nome-182"]')); if (vista && i > 6) break; }
      await sleep(800);
      if (FOTO) { const el = await page.$('[data-cpm="barra"]'); if (el) await el.screenshot({ path: `${FOTO}/barra-${vp.width}-${ROSSO ? 'prima' : 'dopo'}.png` }); }
      const m = await page.evaluate(() => {
        const club = [...CLUBS, ...U18_CLUBS, ...U18_CLUBS_P2, ...TRIAL_OPPONENTS];
        const out = [];
        for (const el of document.querySelectorAll('[data-cpm="barra-nome-182"]')) {
          const r = el.getBoundingClientRect(); if (r.width < 2) continue;
          const cs = getComputedStyle(el), pe = el.parentElement, pcs = getComputedStyle(pe);
          /* lo spazio disponibile: il contenitore meno i fratelli in riga (stesso criterio di nomi-182) */
          let w = pe.clientWidth - parseFloat(pcs.paddingLeft) - parseFloat(pcs.paddingRight);
          if (pcs.display.includes('flex') && !pcs.flexDirection.startsWith('column')) { const k = [...pe.children].filter(c => c !== el && getComputedStyle(c).position !== 'absolute' && getComputedStyle(c).display !== 'none');
            for (const c of k) { const rr = c.getBoundingClientRect(); const cc = getComputedStyle(c); w -= rr.width + parseFloat(cc.marginLeft) + parseFloat(cc.marginRight); } w -= (parseFloat(pcs.columnGap) || 0) * k.length; }
          const mx = parseFloat(cs.maxWidth); if (!isNaN(mx)) w = Math.min(w, mx); w = Math.floor(w);
          const pr = document.createElement('span'); pr.style.cssText = `position:absolute;left:-9999px;white-space:nowrap;font:${cs.font};letter-spacing:${cs.letterSpacing};text-transform:${cs.textTransform}`; document.body.appendChild(pr);
          const larg = (t) => { pr.textContent = t; return pr.getBoundingClientRect().width; };
          const liv = { intero: 0, u19diz: 0, abbreviato: 0, sigla: 0, nessuno: 0 }; const sigleEvitabili = [];
          for (const c of club) {
            const cand = window.__CPM_NOMI182.candidati(c); const sg = c.a || c.abbr; let i = cand.findIndex(t => larg(t) <= w + 0.5);
            if (i < 0) { liv.nessuno++; continue; }
            const t = cand[i]; const corto = c.n.replace(/Primavera/, 'U19').replace(/^(FC|AC|CF|AT)\s+/, '');
            if (i === 0) liv.intero++; else if (t === sg) { liv.sigla++; if (larg(corto.replace(/\s+U19$/, '')) <= w + 0.5) sigleEvitabili.push(c.n); }
            else if (/^(FC|AC|CF|AT)\s/.test(c.n) && !/^(FC|AC|CF|AT)\s/.test(t)) liv.abbreviato++; else liv.u19diz++;
          }
          /* il nome mostrato e' davvero il primo gradino che ci sta */
          const cand = (el.getAttribute('data-cand182') || '').split('|'); const primo = cand.find(t => larg(t) <= w + 0.5) || cand[cand.length - 1];
          pr.remove();
          out.push({ w, liv, sigleEvitabili: sigleEvitabili.slice(0, 4), nEvit: sigleEvitabili.length, mostrato: el.innerText.trim(), atteso: primo, intero: cand[0], sw: el.scrollWidth, cw: el.clientWidth });
        }
        return out;
      });
      ok(m.length === 2 && errors.length === 0, `${vp.width}px: due nomi sulla barra misurati (${m.length}), errori di pagina ${errors.length} ${errors.slice(0, 1).join('')}`);
      for (const x of m) {
        console.log(`    ${vp.width}px barra (${x.w}px): intero ${x.liv.intero} · U19/dizionario ${x.liv.u19diz} · abbreviato ${x.liv.abbreviato} · sigla ${x.liv.sigla} · nessuno ${x.liv.nessuno}`);
        ok(x.mostrato.toUpperCase() === x.atteso.toUpperCase() && x.sw <= x.cw + 1, `${vp.width}px «${x.intero}» mostrato «${x.mostrato}» = primo gradino che ci sta «${x.atteso}»`);
        ok(x.nEvit === 0, `${vp.width}px: club in sigla che avrebbero il nome abbreviato che ci sta: ${x.nEvit} ${x.sigleEvitabili.join(', ')}`);
        ok(x.liv.nessuno === 0, `${vp.width}px: club senza nessun nome che ci sta: ${x.liv.nessuno}`);
      }
      if (m[0]) cens[vp.width] = m[0].liv;
    } catch (e) { ok(false, `barra ${vp.width}: non giudicato (${String(e.message).slice(0, 160)})`); }
    await page.close();
  }
} catch (e) { ok(false, 'eccezione: ' + String(e && e.message || e).slice(0, 300)); }
await browser.close(); srv.close();
ok(!!cens[375] && cens[375].sigla < PARTENZA_SIGLE_375 / 2, `375px: club in sigla ${cens[375] ? cens[375].sigla : '—'} (partenza ${PARTENZA_SIGLE_375}, soglia < ${PARTENZA_SIGLE_375 / 2})`);
ok(!!cens[390], `390px misurato: ${cens[390] ? JSON.stringify(cens[390]) : 'no'}`);
console.log(`\n${ROSSO ? '[braccio ROSSO __CPM_NO_G190D+E] ' : ''}nomi-190: ${fails.length ? 'ROSSO' : 'VERDE'} (${oks.length} ok · ${fails.length} ko)`);
process.exit(fails.length ? 1 : 0);
