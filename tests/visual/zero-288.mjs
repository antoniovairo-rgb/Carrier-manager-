#!/usr/bin/env node
/* [giro 288 PO-547] GUARDIANO zero-288 — «togli lo 0 ovunque dai pulsanti».
   Foto del PO da PC, highlight dell'eroe: il pulsante del riquadro delle mosse diceva «✅ Pronto [0]».
   Il suggerimento del tasto esce dalla scritta; la scorciatoia resta (il tasto 0 in hl_move porta alle giocate,
   in hl_choose esegue la prima giocata).
   S  statico su src/: nessuna scritta (stringa tra virgolette o testo JSX) con «[0]» o «(0)» usato come suggerimento
      di tasto; l'unica eccezione ammessa e' il ramo rosso guardato da window.__CPM_NO_G288.
   B  nel browser (PC 1366x768, GLB spento): scena dell'eroe forzata in hl_move → il pulsante «Pronto» c'e' e NON
      contiene «[0]» (ne' altro pulsante a schermo); tasto 0 → hl_choose; tasto 0 di nuovo → l'azione parte (hl_result).
   ROSSO window.__CPM_NO_G288 (rimette «[0]»): il guardiano DEVE vedere il suggerimento, e il tasto deve funzionare lo stesso.
   «Non giudicato» = rosso. Uso: node zero-288.mjs (verde poi rosso) · CPM_PARTE=verde|rosso */
import fs from 'fs'; import path from 'path';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, ROOT } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const PARTE = process.env.CPM_PARTE || 'tutto';
const out = []; const log = s => { out.push(s); console.log(s); };

/* ---------- S: statico ---------- */
function statico() {
  const dir = path.join(ROOT, 'src'); const hit = []; let rossoVisto = 0;
  for (const f of fs.readdirSync(dir).filter(f => /\.(jsx|html)$/.test(f))) {
    const s = fs.readFileSync(path.join(dir, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ' '));/* commenti spenti a pari lunghezza: righe e posizioni restano quelle del file */
    const re = /(["'`])([^"'`\n]*?[\[(]0[\])][^"'`\n]*?)\1|>([^<>{}\n]*[\[(]0[\])][^<>{}\n]*)</g; let m;
    while ((m = re.exec(s))) {
      const txt = m[2] != null ? m[2] : m[3]; if (!/(^|\s)[\[(]0[\])](\s|$)/.test(txt)) continue;/* solo il suggerimento «[0]»/«(0)» a parola intera */
      const prima = s.slice(Math.max(0, m.index - 40), m.index);
      if (/window\.__CPM_NO_G288\)\?$/.test(prima)) { rossoVisto++; continue; }
      const riga = s.slice(0, m.index).split('\n').length; hit.push(`${f}:${riga} «${txt.trim()}»`);
    }
  }
  return { hit, rossoVisto };
}

/* ---------- B: browser ---------- */
async function browser(port, b, rosso) {
  const ctx = await b.newContext({ viewport: { width: 1366, height: 768 }, serviceWorkers: 'block' });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G288 = 1; }, rosso);
  await openMatch(page, port); await sleep(800);
  const fase = () => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
  const lista = await page.evaluate(() => { const L = []; for (let i = 0; i < SITUATIONS.length; i++) { const s = SITUATIONS[i];
    if (!s.lockMovement && cappedMM(s) >= 1 && !(typeof isAimSit === 'function' && isAimSit(s))) L.push(i); } return L; }).catch(() => []);
  const r = { gi: null, pronto: null, zeroInPulsanti: [], dopoMove: null, dopoChoose: null, errs };
  for (let t = 0; t < Math.min(lista.length, 15); t++) {
    const gi = lista[(t * 7) % lista.length];
    await page.evaluate(g => window.__CPM_FORCE_SIT(g, false), gi).catch(() => {});
    let ph = null; for (let i = 0; i < 40 && (ph = await fase()) !== 'hl_move'; i++) { if (ph === 'hl_choose' && i > 6) break; await sleep(150); }
    if (ph !== 'hl_move') continue;
    const vis = await page.evaluate(() => { const v = e => { const q = e.getBoundingClientRect(), cs = getComputedStyle(e); return q.width > 0 && q.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'; };
      const bs = [...document.querySelectorAll('button')].filter(v).map(e => (e.textContent || '').trim());
      return { pronto: bs.find(t => /Pronto/.test(t)) || null, zero: bs.filter(t => /(^|\s)[\[(]0[\])](\s|$)/.test(t)) }; });
    if (!vis.pronto) continue;
    r.gi = gi; r.pronto = vis.pronto; r.zeroInPulsanti = vis.zero;
    /* comportamento del gioco (keydown di LiveMatch): 0 in hl_move prenota la prima giocata e passa a hl_choose, che la esegue;
       se la scena resta in hl_choose, un secondo 0 esegue la prima giocata. In entrambi i casi l'azione arriva a hl_result. */
    await page.keyboard.press('0');
    for (let i = 0; i < 30 && (r.dopoMove = await fase()) === 'hl_move'; i++) await sleep(100);
    r.dopoChoose = r.dopoMove;
    for (let i = 0; i < 60 && r.dopoChoose === 'hl_choose'; i++) { if (i === 25) { r.secondoZero = true; await page.keyboard.press('0'); } await sleep(100); r.dopoChoose = await fase(); }
    break;
  }
  await ctx.close().catch(() => {});
  return r;
}

const S = statico();
log(`S statico: ${S.hit.length} scritte con il suggerimento del tasto 0 · ramo rosso trovato ${S.rossoVisto}`);
S.hit.forEach(h => log('   ' + h));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
let esito = 0;
const partiFatte = [];
for (const rosso of [false, true]) {
  if ((PARTE === 'verde' && rosso) || (PARTE === 'rosso' && !rosso)) continue;
  const nome = rosso ? 'ROSSO' : 'VERDE';
  const r = await browser(port, b, rosso);
  const tastoOk = (r.dopoMove === 'hl_choose' || r.dopoMove === 'hl_result') && r.dopoChoose === 'hl_result';
  const conZero = !!(r.pronto && /\[0\]/.test(r.pronto)) || r.zeroInPulsanti.length > 0;
  log(`${nome} scena gi${r.gi} · pulsante «${r.pronto}» · pulsanti con [0]: ${JSON.stringify(r.zeroInPulsanti)} · tasto 0: hl_move→${r.dopoMove} · poi→${r.dopoChoose}${r.secondoZero ? ' (secondo 0)' : ''} · errori ${r.errs.length}${r.errs.length ? ' ' + r.errs[0] : ''}`);
  const ko = [];
  if (!r.pronto) ko.push('non giudicato: nessuna scena in hl_move col pulsante «Pronto»');
  if (!tastoOk) ko.push('il tasto 0 non fa partire l\'azione come prima');
  if (r.errs.length) ko.push('errori di pagina');
  if (!rosso) { if (conZero) ko.push('un pulsante mostra ancora «[0]»'); if (S.hit.length) ko.push('scritte con «[0]» in src/'); if (S.rossoVisto !== 1) ko.push('ramo rosso __CPM_NO_G288 non trovato in src/'); }
  else if (!conZero) ko.push('il rosso non rimette «[0]»: il guardiano non vede il difetto');
  log(`${nome}: ${ko.length ? 'ROSSO VERO ✗ ' + ko.join(' · ') : (rosso ? 'il guardiano vede il difetto e il tasto funziona ✓' : 'VERDE ✓')}`);
  if (ko.length) esito = 1; partiFatte.push(nome);
}
await b.close(); srv.close();
fs.mkdirSync(path.join(ROOT, 'tests/visual/out'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'tests/visual/out/zero-288.txt'), out.join('\n') + '\n');
console.log(esito ? `zero-288: ✗ (${partiFatte.join('+')})` : `zero-288: ✓ (${partiFatte.join('+')})`);
process.exit(esito);
