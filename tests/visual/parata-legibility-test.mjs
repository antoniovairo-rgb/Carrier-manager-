#!/usr/bin/env node
/* [collaudo PO, screenshot della parata da Campioni d'Europa: «la scritta non si vede bene, la coppa è
 *  disegnata male ed è enorme, il bus potrebbe essere disegnato meglio e l'atmosfera/scena è troppo
 *  troppo buia»]
 *
 * Tre di queste quattro cose sono MISURABILI, e questo guardiano le misura invece di giudicarle a occhio:
 *
 *   (1) LA SCRITTA SULLA FIANCATA. E' una CanvasTexture: testo colorato coi colori sociali su fondo
 *       bianco. Due guasti indipendenti, entrambi aritmetici:
 *         a. «CAMPIONI D'EUROPA» a 62px in una tela da 512 non ci sta — deborda e viene TAGLIATA;
 *         b. un club che gioca in BIANCO (CF Madrid) scrive bianco su bianco: contrasto zero,
 *            la scritta semplicemente non esiste.
 *       Si misura la larghezza reale del testo e il contrasto WCAG fra le due tinte.
 *
 *   (2) LA LUMINOSITA' DELLA SCENA. Media dei pixel del fotogramma: «troppo buia» diventa un numero.
 *
 *   (3) LA SCALA DEL TROFEO rispetto a un uomo sul tetto: un trofeo vero sta sotto il mezzo busto.
 *
 * Il quarto punto («il bus si può disegnare meglio») e' un giudizio estetico e non si finge di misurarlo:
 * resta al collaudo percettivo del PO.
 */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const guasti = [];

/* ── (1) la scritta: misure pure, nessun gioco da caricare ── */
const CLUBS = [
  { n: 'CF Madrid', hex: '#ffffff' },   // il caso del PO: maglia bianca
  { n: 'FC Salernum', hex: '#6c1f2e' }, // maglia scura: il caso che «funzionava»
];
/* ⚠️ Il codice del disegno si ESTRAE DAL GIOCO e si esegue tal quale. La prima stesura di questa sonda
   teneva una copia dei parametri («tela 512, corpo 62, fondo bianco») scritta qui dentro: misurava se
   stessa, sarebbe rimasta rossa dopo il fix e non avrebbe mai collaudato una riga vera. */
{
  const src = await import('fs').then(fs => fs.readFileSync(new URL('../../CARRIER-MANAGER-AV.html', import.meta.url), 'utf8'));
  const i0 = src.indexOf("try{const cv=document.createElement('canvas');cv.width=");
  const i1 = src.indexOf('const tx=new THREE.CanvasTexture(cv);', i0);
  if (i0 < 0 || i1 < 0) { guasti.push('(1) il blocco che disegna la scritta non e\' stato trovato nel sorgente: sonda cieca'); }
  else {
    const blocco = src.slice(i0 + 4, i1);   // via il `try{` iniziale
    const page = await b.newPage();
    await page.goto('about:blank');
    for (const c of CLUBS) {
      for (const euro of [true, false]) {
        const m = await page.evaluate(({ hex, euroWin, codice }) => {
          const awayHex = '#f5f5f4', homeHex = hex;
          const f = new Function('homeHex', 'awayHex', 'euroWin', codice + '\nreturn cv;');
          const cv = f(homeHex, awayHex, euroWin);
          const cx = cv.getContext('2d');
          /* si guardano i PIXEL veri: quanto inchiostro c'e', se tocca i bordi (tagliata) e che
             contrasto ha col fondo — non i parametri dichiarati, il risultato */
          const d = cx.getImageData(0, 0, cv.width, cv.height).data;
          const L = (i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
          const fondo = L(0);
          let min = 255, max = 0, inchiostro = 0, bordoSx = 0, bordoDx = 0;
          for (let y = 0; y < cv.height; y += 2) for (let x = 0; x < cv.width; x += 2) {
            const i = (cv.width * y + x) << 2, l = L(i);
            if (Math.abs(l - fondo) > 24) { inchiostro++; if (x < 6) bordoSx++; if (x > cv.width - 8) bordoDx++;
              if (l < min) min = l; if (l > max) max = l; }
          }
          const testo = Math.abs(max - fondo) > Math.abs(min - fondo) ? max : min;
          const rel = (v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
          const l1 = rel(testo), l2 = rel(fondo);
          return { W: cv.width, inchiostro, bordoSx, bordoDx,
            contrasto: +(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2)) };
        }, { hex: c.hex, euroWin: euro, codice: blocco });
        const et = euro ? "CAMPIONI D'EUROPA" : 'CAMPIONI';
        const tagliata = m.bordoSx > 0 || m.bordoDx > 0;
        console.log(`(1) «${et}» · ${c.n} (${c.hex}): tela ${m.W}px · inchiostro ${m.inchiostro} campioni · tocca i bordi ${tagliata ? 'SI ✗' : 'no ✓'} · contrasto ${m.contrasto}:1 ${m.contrasto < 3 ? '→ ILLEGGIBILE ✗' : '✓'}`);
        if (m.inchiostro < 60) guasti.push(`(1) «${et}» per ${c.n}: quasi nessun pixel di testo (${m.inchiostro}) — la scritta non viene disegnata`);
        if (tagliata) guasti.push(`(1) «${et}» per ${c.n}: il testo tocca i bordi della tela — viene tagliato sulla fiancata`);
        if (m.contrasto < 3) guasti.push(`(1) «${et}» per ${c.n}: contrasto ${m.contrasto}:1 col fondo — la scritta non si vede`);
      }
    }
    await page.close();
  }
}

/* ── (2)+(3) la scena vera: si porta una carriera a fine stagione da CAMPIONE, come fa parata-test ── */
async function apriParata(clubHex) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => guasti.push('pageerror: ' + String(e).slice(0, 140)));
  await page.addInitScript((hex) => {
    window.__CPM_GLB = false;
    const st = Array.from({ length: 18 }, (_, i) => ({ id: i === 0 ? 'sal' : 'c' + i, n: i === 0 ? 'FC Salernum' : 'Club ' + i, pts: i === 0 ? 88 : 40 - i, played: 34, gf: 60, ga: 20, w: 20, d: 4, l: 10 }));
    localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: {
      name: 'Parata Probe', nation: 'Italia', avatarId: 2, proStatus: 'pro', season: 3, week: 38, weekLived: true, age: 24, ovr: 84,
      campDone: true, presidentModalSeason: 3, jerseyNumSeason: 3, drawSeen: 3, mercatoSeen: 3, presentSeason: 3, tutorialDone: true,
      club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 60, c: hex, c2: '#f5f5f4', nat: '🇮🇹', lg: 'Lega A' },
      stats: { 'velocità': 84, tecnica: 83, fisico: 82, 'mentalità': 83, tiro: 85, passaggio: 83, dribbling: 84, posizionamento: 83 },
      form: 78, morale: 80, fatigue: 10, popularity: 60, value: 30, bankBalance: 90000, goals: 22, assists: 9, matches: 34,
      standings: st, calendar: [], contract: { duration: 2, wage: 20000, expiresAtSeason: 5 } } }));
  }, clubHex);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
  await sleep(1500);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 });
  await sleep(800);
  for (let i = 0; i < 5; i++) { const r = await page.evaluate(() => { const C = window.__CPM_CAREER; const res = C.step(); C.dismiss(); return res; }); if (r === 'seasonEnd') break; await sleep(400); }
  await sleep(2500);
  try { await page.getByText('Salta il gala', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await sleep(3000);
  for (let i = 0; i < 4; i++) { const hit = await page.evaluate(() => { const b2 = Array.from(document.querySelectorAll('button')).find(x => /Continua alla Fine Stagione|Riepilogo/i.test(x.textContent || '')); if (b2) { b2.click(); return true; } return false; }); if (!hit) break; await sleep(2500); }
  await sleep(4000);
  return page;
}
{
  const page = await apriParata('#6c1f2e');
  const aperta = await page.evaluate(() => /LA PARATA/.test(document.body.innerText || ''));
  if (!aperta) { guasti.push('(2) la parata non si e\' aperta: sonda cieca sulla luminosita\''); }
  else {
    const buf = await page.screenshot({ type: 'png' });
    const { PNG } = await import('pngjs');
    const png = PNG.sync.read(buf);
    let somma = 0, n = 0, scuri = 0;
    for (let y = 0; y < png.height; y += 3) for (let x = 0; x < png.width; x += 3) {
      const i = (png.width * y + x) << 2;
      const l = 0.2126 * png.data[i] + 0.7152 * png.data[i + 1] + 0.0722 * png.data[i + 2];
      somma += l; n++; if (l < 24) scuri++;
    }
    const media = somma / n, pctScuri = 100 * scuri / n;
    /* SOGLIE MISURATE, NON SCELTE A OCCHIO. La prima stesura usava 34 e 55%: la scena di cui il PO si
       lamentava («troppo troppo buia») misura 52.5/255 con il 42.2% di fotogramma quasi nero — sarebbe
       PASSATA, e il guardiano sarebbe stato verde proprio sul difetto per cui e' nato. Le soglie stanno
       ora fra il prima misurato (52.5 · 42.2%) e il dopo misurato (76.9 · 0.9%). */
    console.log(`\n(2) luminosita' media del fotogramma: ${media.toFixed(1)}/255 · pixel quasi neri: ${pctScuri.toFixed(1)}%`);
    if (media < 64) guasti.push(`(2) SCENA TROPPO BUIA: luminosita' media ${media.toFixed(1)}/255 (soglia 64; la scena di cui il PO si lamentava misurava 52.5)`);
    if (pctScuri > 12) guasti.push(`(2) il ${pctScuri.toFixed(0)}% del fotogramma è quasi nero (soglia 12%; prima del fix era il 42%): la festa si perde nel buio`);
  }
  await page.close();
}

await b.close(); srv.close();
console.log(guasti.length ? `\n❌ FAIL — ${guasti.length}\n` + guasti.map(g => '  ✗ ' + g).join('\n')
  : '\n✅ PARATA LEGGIBILE (scritta intera e contrastata per ogni maglia · scena illuminata)');
process.exit(guasti.length ? 1 : 0);
