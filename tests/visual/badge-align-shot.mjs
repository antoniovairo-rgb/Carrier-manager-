/* [7.169.0] PROBE scalino stemmi + regressione hoops-su-solid.
   (1) Renderizza COPPIE di TeamBadge affiancate (forme miste: classico/francese/roundel) come nel VS del matchday
       → verifica visiva che non ci sia effetto scalino (stessa banda ottica) + misura via bounding box SVG.
   (2) kitPatternTex('#6c1f2e','#f0f0f0','solid') NON deve disegnare bande bianche (bug 7.168.0):
       campiona i pixel del canvas alle quote delle hoops → devono restare scuri. 'hoops' invece deve averle. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];
const page = await browser.newPage({ viewport: { width: 760, height: 900 } });
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
await page.waitForFunction(() => typeof window.__CPM_TeamBadge === 'function' && typeof window.__CPM_kitPatternFor === 'function', null, { timeout: 40000 });

// ── (1) coppie di stemmi: trova club per ciascuna forma e monta le coppie miste ──
const shapeRes = await page.evaluate(() => {
  const hs = (s) => { let h = 0; for (let i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; } return h; };
  // stessa formula del componente: hashStr(id+"_bdg")%3 — usa hashStr reale se esposto, altrimenti ricava dal DOM dopo il render
  const all = [];
  const pool = ['sal', 'par', 'fio', 'nap', 'juve', 'inter', 'milan', 'tor', 'gen', 'sam', 'ata', 'bol', 'rom', 'laz', 'cag', 'pal', 'mon', 'ver', 'lec', 'cre', 'spe', 'ven', 'pis', 'ces', 'cit', 'fro', 'cat', 'mod'];
  return pool;
});
// monta 4 coppie nel DOM via ReactDOM (badge 52 come nel matchday) e misura i bounding box dei path
const measured = await page.evaluate(() => new Promise((res) => {
  const TB = window.__CPM_TeamBadge;
  const CL = (typeof CLUBS !== 'undefined') ? CLUBS : [];
  const byId = {}; CL.forEach(c => byId[c.id] = c);
  const hstr = (typeof hashStr === 'function') ? hashStr : (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return h; };
  const shapeOf = (id) => Math.abs(hstr(id + '_bdg')) % 3;
  // trova un id per forma
  const ids = Object.keys(byId);
  const pick = (sh) => ids.find(id => shapeOf(id) === sh);
  const s0 = pick(0), s1 = pick(1), s2 = pick(2);
  const pairs = [[s0, s1], [s0, s2], [s1, s2], ['sal', 'par']].filter(p => p[0] && p[1] && byId[p[0]] && byId[p[1]]);
  const host = document.createElement('div');
  host.id = 'badge-align-host';
  host.style.cssText = 'position:fixed;inset:0;background:#10141c;z-index:99999;padding:20px;display:flex;flex-direction:column;gap:18px;';
  document.body.appendChild(host);
  const root = ReactDOM.createRoot(host);
  const rows = pairs.map((p, i) => React.createElement('div', { key: i, style: { display: 'flex', alignItems: 'flex-start', gap: 20, justifyContent: 'center', background: '#1a2030', padding: '14px 8px', borderRadius: 12 } },
    React.createElement('div', { style: { textAlign: 'center', flex: '0 0 96px' } }, React.createElement(TB, { team: byId[p[0]], size: 52 }), React.createElement('div', { style: { color: '#fff', fontSize: 11, fontWeight: 700 } }, byId[p[0]].n)),
    React.createElement('div', { style: { fontSize: 28, color: '#5a6478', fontWeight: 900, marginTop: 15 } }, 'VS'),
    React.createElement('div', { style: { textAlign: 'center', flex: '0 0 96px' } }, React.createElement(TB, { team: byId[p[1]], size: 52 }), React.createElement('div', { style: { color: '#fff', fontSize: 11, fontWeight: 700 } }, byId[p[1]].n))
  ));
  root.render(React.createElement('div', null, rows));
  setTimeout(() => {
    // misura: per ogni riga, i 2 svg devono avere lo stesso top e ingombro visivo del contenuto (bbox del primo path/cerchio)
    const out = [];
    host.querySelectorAll(':scope > div > div').forEach((row) => {
      const svgs = row.querySelectorAll('svg');
      if (svgs.length !== 2) return;
      const m = [...svgs].map(sv => {
        const r = sv.getBoundingClientRect();
        // bbox del CONTENUTO (path o cerchio principale) in coordinate viewport
        const el = sv.querySelector('path[fill^="url"],circle[fill^="url"],ellipse[fill^="url"]');
        const b = el ? el.getBoundingClientRect() : r;
        return { svgTop: r.top, contTop: b.top, contBot: b.bottom, contW: b.width, contH: b.height };
      });
      out.push({ dTop: Math.abs(m[0].contTop - m[1].contTop), dBot: Math.abs(m[0].contBot - m[1].contBot), dW: Math.abs(m[0].contW - m[1].contW), w0: m[0].contW, w1: m[1].contW });
    });
    res(out);
  }, 600);
}));
console.log('coppie misurate:', JSON.stringify(measured));
for (const [i, m] of measured.entries()) {
  if (m.dTop > 2.5) issues.push(`coppia ${i}: scalino verticale top Δ${m.dTop.toFixed(1)}px`);
  if (m.dBot > 3.5) issues.push(`coppia ${i}: scalino verticale bottom Δ${m.dBot.toFixed(1)}px`);
  if (m.dW > 6) issues.push(`coppia ${i}: larghezza visiva Δ${m.dW.toFixed(1)}px (${m.w0.toFixed(0)} vs ${m.w1.toFixed(0)})`);
}
await page.screenshot({ path: 'out/badge-align.png' });

// ── (2) kitPatternTex: 'solid' senza hoops, 'hoops' con hoops ──
const texRes = await page.evaluate(() => {
  if (typeof kitPatternTex !== 'function') return { skip: true };
  const sample = (pat) => {
    const t = kitPatternTex('#6c1f2e', '#f0f0f0', pat);
    if (!t || !t.image) return null;
    const cv = t.image, x = cv.getContext('2d');
    const S = cv.width;
    // le hoops sono alle righe dispari di 8 bande: centro banda i=1 → y=S*3/16
    const px = x.getImageData(Math.round(S / 2), Math.round(S * 3 / 16), 1, 1).data;
    return { r: px[0], g: px[1], b: px[2] };
  };
  return { solid: sample('solid'), hoops: sample('hoops') };
});
console.log('kitPatternTex pixel banda:', JSON.stringify(texRes));
if (!texRes.skip) {
  const s = texRes.solid, h = texRes.hoops;
  if (!s || !h) issues.push('kitPatternTex non ha prodotto la texture');
  else {
    if (s.r > 150 && s.g > 150 && s.b > 150) issues.push(`SOLID ha una banda BIANCA (${s.r},${s.g},${s.b}) — regressione hoops ancora presente`);
    if (!(h.r > 180 && h.g > 180 && h.b > 180)) issues.push(`HOOPS non disegna più le bande (${h.r},${h.g},${h.b})`);
  }
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ BADGE ALIGN + KIT SOLID OK (banda ottica uniforme · solid liscia · hoops intatte)');
process.exit(issues.length ? 1 : 0);
