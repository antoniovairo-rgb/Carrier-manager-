#!/usr/bin/env node
/* [collaudo PO «il testo è sovrapposto!» — screenshot della home con tre slot]
 *
 * La card di uno slot mette in fila: avatar · testo (nome, stato, data) · anello OVR · bottoni. Nello
 * screenshot del PO il nome va a capo, «Carriera conclusa · S.20» si spezza su piu' righe e l'anello OVR
 * finisce SOPRA il testo. Il difetto non si vede alla dimensione di carattere predefinita: si vede quando
 * il testo e' piu' grande — impostazione di sistema, dimensione carattere di Android, o il «font boosting»
 * del browser mobile. Il testo cresce, avatar/anello/bottoni sono in px fissi e non crescono: la colonna
 * di testo resta senza spazio e le scatole si accavallano.
 *
 * Questo guardiano NON giudica «bello»: misura la SOVRAPPOSIZIONE fra i rettangoli reali del DOM, che e'
 * un fatto. Se due riquadri si intersecano di piu' di 1px, il testo e' addosso a qualcos'altro.
 */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const guasti = [];

const mkSlot = (name, retired, season, ovr) => ({ phase: 'career', player: {
  name, nation: 'Italia', avatarId: 0, proStatus: 'pro', season, week: 1, age: 28, ovr,
  retireAnnounced: retired ? season : 0, careerEnded: retired,
  club: { id: 'mad', n: 'CF Madrid', a: 'CFM', p: 88, c: '#ffffff', c2: '#111111', nat: '🇪🇸', lg: 'Liga Ibérica' },
  stats: { 'velocità': ovr, tecnica: ovr, fisico: ovr, 'mentalità': ovr, tiro: ovr, passaggio: ovr, dribbling: ovr, posizionamento: ovr },
  form: 60, morale: 60, fatigue: 10, popularity: 50, value: 20, bankBalance: 100000,
  goals: 5, assists: 2, matches: 10, contract: { duration: 3, wage: 30000, expiresAtSeason: season + 3 } } });

/* scala = quanto il sistema ingrandisce il testo (1 = predefinito, 1.9 = accessibilita' spinta) */
async function misura(scala, larghezza = 412) {
  const page = await b.newPage({ viewport: { width: larghezza, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(cfg => {
    window.__CPM_GLB = false;
    localStorage.setItem('cpm-v3', JSON.stringify(cfg.a));
    localStorage.setItem('cpm-v3-s2', JSON.stringify(cfg.b));
    localStorage.setItem('cpm-v3-s3', JSON.stringify(cfg.c));
  }, {
    a: mkSlot('Hernanes jr', true, 20, 87),
    b: mkSlot('Max Rea Vairo', true, 22, 90),
    c: mkSlot('Samuelito Vairo', false, 1, 69),
  });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
  await sleep(2500);
  /* il testo cresce, il resto no: e' esattamente cio' che fa la dimensione carattere di sistema */
  if (scala !== 1) await page.addStyleTag({ content: `html{-webkit-text-size-adjust:${Math.round(scala * 100)}%;text-size-adjust:${Math.round(scala * 100)}%}
    body,body *{font-size:calc(var(--cpm-fs,1em) * ${scala})}` });
  await sleep(1200);

  const r = await page.evaluate(() => {
    const inter = (a, b2) => Math.max(0, Math.min(a.right, b2.right) - Math.max(a.left, b2.left)) * Math.max(0, Math.min(a.bottom, b2.bottom) - Math.max(a.top, b2.top));
    /* l'anello OVR: un tondo che contiene un numero e la scritta OVR */
    const anelli = Array.from(document.querySelectorAll('div')).filter(d => {
      const s = getComputedStyle(d);
      return s.borderRadius === '50%' && /(^|\s)\d{2,3}\s*OVR\s*$/.test((d.textContent || '').trim());
    });
    const out = [];
    for (const an of anelli) {
      const ra = an.getBoundingClientRect();
      if (ra.width < 5) continue;
      /* i testi della stessa card: si risale al contenitore in riga e si guardano i fratelli */
      let card = an.parentElement; for (let k = 0; k < 3 && card && getComputedStyle(card).display !== 'flex'; k++) card = card.parentElement;
      if (!card) continue;
      const testi = Array.from(card.querySelectorAll('div,span')).filter(t => t !== an && !an.contains(t) && !t.contains(an)
        && (t.textContent || '').trim().length > 2 && t.children.length === 0);
      let peggio = null;
      for (const t of testi) {
        const rt = t.getBoundingClientRect();
        if (rt.width < 2 || rt.height < 2) continue;
        const area = inter(ra, rt);
        if (area > 1 && (!peggio || area > peggio.area)) peggio = { area: Math.round(area), txt: (t.textContent || '').trim().slice(0, 28) };
      }
      /* il contenuto grafico dell'anello deve stare dentro la sua scatola: se la scatola e' stata
         schiacciata dal flex ma il disegno resta a dimensione piena, il disegno esce e invade il testo */
      out.push({ w: Math.round(ra.width), h: Math.round(ra.height), collisione: peggio });
    }
    /* nessun testo deve uscire dalla card verso destra (troncamento invisibile) */
    const fuori = [];
    document.querySelectorAll('div').forEach(d => { if (d.children.length === 0 && (d.textContent || '').trim().length > 3) {
      const p = d.parentElement; if (!p) return; const rd = d.getBoundingClientRect(), rp = p.getBoundingClientRect();
      if (rd.width > 2 && rd.right > rp.right + 1.5) fuori.push((d.textContent || '').trim().slice(0, 24)); } });
    /* quante righe occupa il nome: nello screenshot del PO va a capo e la card diventa una torre */
    const righe = [];
    document.querySelectorAll('div').forEach(d => { if (d.children.length === 0 && /Carriera conclusa|W\.\d+\/38/.test(d.textContent || '')) {
      const r2 = d.getBoundingClientRect(); const lh = parseFloat(getComputedStyle(d).lineHeight) || parseFloat(getComputedStyle(d).fontSize) * 1.2;
      righe.push({ txt: (d.textContent || '').trim().slice(0, 22), n: Math.round(r2.height / lh), w: Math.round(r2.width) }); } });
    return { anelli: out, fuori: fuori.slice(0, 4), righe };
  });
  await page.screenshot({ path: `out/slot-card-${larghezza}-x${scala}.png` }).catch(() => {});
  await page.close();
  return r;
}

for (const [scala, larghezza] of [[1, 412], [1, 360], [1, 320], [1.6, 360]]) {
  const r = await misura(scala, larghezza);
  const colli = r.anelli.filter(a => a.collisione);
  console.log(`\nviewport ${larghezza}px · scala testo ×${scala} — anelli OVR: ${r.anelli.length} · dimensioni ${r.anelli.map(a => a.w + '×' + a.h).join(', ') || '—'}`);
  r.righe.forEach(x => console.log(`   riga di stato «${x.txt}» → ${x.n} righe su ${x.w}px di larghezza${x.n > 1 ? ' ✗' : ''}`));
  if (colli.length) colli.forEach(c => console.log(`   ✗ l'anello (${c.w}×${c.h}) si sovrappone a «${c.collisione.txt}» per ${c.collisione.area}px²`));
  else console.log('   ✓ nessuna sovrapposizione fra anello e testo');
  if (r.fuori.length) console.log(`   ✗ testo che esce dal contenitore: ${r.fuori.map(t => '«' + t + '»').join(' · ')}`);

  if (!r.anelli.length) guasti.push(`(${larghezza}px ×${scala}) nessun anello OVR trovato: sonda cieca`);
  if (colli.length) guasti.push(`(${larghezza}px ×${scala}) L'ANELLO OVR E' SOPRA IL TESTO in ${colli.length} card — è la segnalazione «il testo è sovrapposto»`);
  if (r.fuori.length) guasti.push(`(${larghezza}px ×${scala}) ${r.fuori.length} testi escono dal loro contenitore`);
  if (r.anelli.some(a => a.w < 30)) guasti.push(`(${larghezza}px ×${scala}) l'anello OVR è stato schiacciato dal flex (${r.anelli.map(a => a.w).join(',')}px invece di 40): il disegno resta a dimensione piena e invade il testo`);
}

await b.close(); srv.close();
console.log(guasti.length ? `\n❌ FAIL — ${guasti.length}\n` + guasti.map(g => '  ✗ ' + g).join('\n')
  : '\n✅ CARD DEGLI SLOT OK (nessuna sovrapposizione, nessun testo fuori dal contenitore, anche col testo ingrandito)');
process.exit(guasti.length ? 1 : 0);
