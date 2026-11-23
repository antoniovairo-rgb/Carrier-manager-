#!/usr/bin/env node
/* [giro 199 · PO-408] GUARDIANO home-199 — i riquadri con una scelta da fare stanno IN CIMA alla Home, con un segno «da decidere»,
   senza nessuna finestra in piu'. Gioco vero (?cpmtest=1), salvataggio sintetico + __CPM_CAREER.patch per aprire 1..3 scelte
   (saga di mercato all'offerta, shooting nella settimana europea, fisioterapista a fatica 80). Una pagina nuova per caso.
   Verde, a 375x667 · 390x844 · 1366x768 con 1, 2 e 3 scelte aperte:
     - ogni riquadro di scelta comincia dentro il primo schermo, e il primo ci sta tutto;
     - il segno «Da decidere» (col numero delle scelte) sta sopra la prima scelta, e il numero e' giusto;
     - ordine: «Sei svincolato» (se c'e') → segno → scelte → tasto del momento (corsa163);
     - nessuna finestra aperta in piu' rispetto alla Home senza scelte; zero errori di pagina.
   Con 0 scelte: nessun segno, nessun blocco. Da svincolato con 2 scelte: svincolato sopra il blocco, blocco sopra il tasto.
   Rosso window.__CPM_NO_G199 (i riquadri tornano sotto Fiducia e Popolarita', nessun segno) → DEVE essere bocciato.
   Foto 375x667 (dpr 2) in docs/sviluppo/giro199/. Uscita 0 solo se il verde passa E il rosso e' bocciato.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node home-199.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { salva, apri, accendi, misuraHome } from './misura-199.mjs';

const FOTO = path.join(ROOT, 'docs', 'sviluppo', 'giro199'); fs.mkdirSync(FOTO, { recursive: true });
const fails = [];
/* [giro 335 · PO-615] l'offerta di sponsor e' ora una decisione del blocco: il caso del giro 199 conta le SUE tre scelte, quindi l'offerta
   (popolarita' 40 → fascia «locale») e' declinata per la stagione nel salvataggio. Il blocco con l'offerta lo giudica home-335. */
const _S335 = { sponsorDecl: { tier: 'locale', season: 3 } };
const ok = (c, m) => { if (!c) fails.push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const NOMI = ['saga', 'shooting', 'fisio'];
/* giudizio di un caso: true/false + motivo; «non giudicato» (manca un elemento) = false */
function giudica(m, n, base) {
  const sc = NOMI.slice(0, n).map(k => m.scelte[k]);
  if (sc.some(x => !x)) return [false, 'scelta non trovata'];
  if (!m.momento) return [false, 'tasto del momento non trovato'];
  if (!m.blocco) return [false, 'blocco «Da decidere» assente'];
  if (m.segni !== 1) return [false, `segni «da decidere» ${m.segni}`];
  if (sc.some(x => x.top >= m.H)) return [false, 'una scelta comincia oltre il primo schermo: ' + sc.map(x => x.top).join(',')];
  if (sc[0].bot > m.H) return [false, `la prima scelta non ci sta tutta (${sc[0].bot} > ${m.H})`];
  if (!(m.blocco.top < sc[0].top)) return [false, 'il segno non sta sopra la prima scelta'];
  if (sc.some(x => x.bot > m.momento.top + 1)) return [false, 'una scelta sta sotto il tasto del momento'];
  if (m.svincolato && !(m.svincolato.bot <= m.blocco.top + 1)) return [false, 'il blocco sta sopra «Sei svincolato»'];
  if (m.finestre !== base) return [false, `finestre ${m.finestre} contro ${base} senza scelte`];
  return [true, 'ok'];
}
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
try {
  console.log('A) verde: scelte in cima, segno, nessuna finestra');
  for (const [w, h] of [[375, 667], [390, 844], [1366, 768]]) {
    const z = await apri(browser, port, salva(_S335), [], w, h); await accendi(z.page, 0); const m0 = await misuraHome(z.page);
    ok(!m0.blocco && m0.segni === 0 && !z.errors.length, `${w}x${h} 0 scelte: nessun blocco ne' segno (finestre ${m0.finestre})`); await z.page.close();
    for (const n of [1, 2, 3]) {
      const a = await apri(browser, port, salva(_S335), [], w, h); await accendi(a.page, n); const m = await misuraHome(a.page);
      const testoSegno = await a.page.evaluate(() => { const e = document.querySelector('[data-cpm="scelta199-segno"]'); return e ? e.innerText.replace(/\s+/g, ' ') : null; });
      if (w === 375 && n === 3) await a.page.screenshot({ path: path.join(FOTO, 'dopo-home-3-scelte-375.png') });
      if (w === 1366 && n === 3) await a.page.screenshot({ path: path.join(FOTO, 'dopo-home-3-scelte-pc.png') });
      const [v, mot] = giudica(m, n, m0.finestre);
      ok(v && new RegExp('Da decidere\\s*' + n, 'i').test(testoSegno || '') && !a.errors.length,
        `${w}x${h} ${n} scelte: ${NOMI.slice(0, n).map(k => k + '@' + m.scelte[k]?.top).join(' ')} · segno «${testoSegno}» · momento ${m.momento?.top} · ${mot}`);
      await a.page.close();
    }
  }
  console.log('B) verde da svincolato: svincolato → scelte → tasto del momento');
  { const a = await apri(browser, port, salva(_S335), [], 375, 667); await accendi(a.page, 2);
    await a.page.evaluate(() => window.__CPM_CAREER.patch({ contractExpired: true })); await sleep(900);
    await a.page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); } catch (e) {} }); await sleep(400);
    const m = await misuraHome(a.page); await a.page.screenshot({ path: path.join(FOTO, 'dopo-home-svincolato-375.png') });
    const [v, mot] = giudica(m, 2, m.finestre);
    ok(v && !!m.svincolato && !a.errors.length, `svincolato@${m.svincolato?.top} · blocco@${m.blocco?.top} · momento@${m.momento?.top} · ${mot}`); await a.page.close(); }
  console.log('C) rosso __CPM_NO_G199: deve essere bocciato');
  for (const [w, h, n] of [[375, 667, 3], [1366, 768, 2]]) {
    const a = await apri(browser, port, salva(_S335), ['__CPM_NO_G199'], w, h); await accendi(a.page, n); const m = await misuraHome(a.page);
    if (w === 375) await a.page.screenshot({ path: path.join(FOTO, 'prima-home-3-scelte-375.png') });
    const [v, mot] = giudica(m, n, 0);
    const trovate = NOMI.slice(0, n).every(k => m.scelte[k]);
    ok(!v && trovate, `rosso ${w}x${h} ${n} scelte bocciato (${mot}; ${NOMI.slice(0, n).map(k => k + '@' + m.scelte[k]?.top).join(' ')})`); await a.page.close();
  }
} finally { await browser.close(); srv.close(); }
console.log(fails.length ? `\n✗ home-199 ROSSO (${fails.length})` : '\n✓ home-199 VERDE');
process.exit(fails.length ? 1 : 0);
