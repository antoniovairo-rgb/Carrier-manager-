#!/usr/bin/env node
/* [giro 228 · PO-493] GUARDIANO rosa-228. Club › Rosa a 360 px: i ruoli si mostrano in SIGLA a tre lettere maiuscole
   (siglaRuolo228, decisione PO 16/11) con il ruolo intero in title/aria-label, e NESSUN nome sotto i 18 caratteri e' tagliato.
   Gioco vero (?cpmtest=1), salvataggio sintetico (misura-199), eroe con ruolo per esteso («Centrocampista»), N club scorsi con
   __CPM_CAREER.patch({club}) — misura condivisa con la sonda misura-228 (misuraRosa).
   Bracci: VERDE (gioco) deve passare; ROSSO window.__CPM_NO_G228 (ruolo per esteso) deve essere bocciato.
   «Non giudicato» (Rosa non trovata, meno righe del minimo, errori di pagina) = rosso. Verde e rosso stampati per ultimi.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node rosa-228.mjs   (CPM_N228R=<club>, default 24) */
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { salva, apri } from './misura-199.mjs';
import { misuraRosa } from './misura-228.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const N = +(process.env.CPM_N228R || 24), W = 360, MIN_RIGHE = N * 20;
async function braccio(browser, port, rosso) {
  const a = await apri(browser, port, salva({ position: 'Centrocampista' }), ['__CPM_FIS_APERTE', ...(rosso ? ['__CPM_NO_G228'] : [])], W, 800);
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
    if (a.errors.length) return [false, 'errori di pagina: ' + a.errors.join(' / ')];
    if (R.righe < MIN_RIGHE) return [false, `non giudicato: ${R.righe} righe < ${MIN_RIGHE} (${R.club} club)`];
    const ok = R.nonSigla === 0 && R.senzaTitolo === 0 && R.tagliatiCorti === 0;
    return [ok, `${R.club} club · ${R.righe} righe · ruoli non in sigla ${R.nonSigla} · senza ruolo intero ${R.senzaTitolo} · nomi <18 tagliati ${R.tagliatiCorti} · nomi ≥18 tagliati ${R.tagliatiLunghi}${R.esempi.length ? ' · es. ' + R.esempi.join(' | ') : ''}`];
  } catch (e) { return [false, 'non giudicato: ' + String(e.message).slice(0, 160)]; }
  finally { await a.page.close(); }
}
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
let v, r;
try { v = await braccio(browser, port, false); r = await braccio(browser, port, true); }
finally { await browser.close(); srv.close(); }
const ok = v[0] && !r[0];
console.log(`VERDE: ${v[0] ? '✓' : '✗'} ${v[1]}`);
console.log(`ROSSO __CPM_NO_G228: ${!r[0] ? '✓ bocciato' : '✗ passa'} ${r[1]}`);
console.log(ok ? '✓ rosa-228 VERDE' : '✗ rosa-228 ROSSO');
process.exit(ok ? 0 : 1);
