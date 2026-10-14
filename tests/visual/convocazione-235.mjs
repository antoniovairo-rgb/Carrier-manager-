#!/usr/bin/env node
/* [PO-235, 14/10 «Schermata fuori standard»] GUARDIANO GRAFICO DELLA CONVOCAZIONE IN NAZIONALE. Rosso __CPM_NO_235.
   La schermata vera (NationalCallupScreen, src/17) montata dal gioco caricato, con i dati della foto del PO (Spagna-Portogallo,
   presenza 15) e con la prima convocazione, a 360 e 412 px. Giudica cio' che il kit rende oggettivo:
     1. il bottone di gioco e' il PRIMARIO del kit (sfondo = TH.primary, altezza >= 48, cioe' Btn size="lg");
     2. le sezioni sono Card del kit (sfondo TH.card, raggio RAD.md): almeno 3;
     3. nessuno sfondo a gradiente fatto a mano dentro la schermata (fondo leggibile, contrasto calcolabile);
     4. ogni testo ha contrasto >= 4,5:1 (>= 3:1 se >= 18 px o >= 14 px in grassetto) sul suo fondo;
     5. nessuno scorrimento orizzontale.
   Foto in out/convocazione-235/. Uscita 0 solo se il verde passa E il rosso (la schermata di prima) viene bocciato. */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const OUT = path.join(ROOT, 'tests', 'visual', 'out', 'convocazione-235'); fs.mkdirSync(OUT, { recursive: true });
const DATI = [{ nation: 'Spagna', isFirst: false, newCaps: 15, opp: 'Portogallo' }, { nation: 'Italia', isFirst: true, newCaps: 1, opp: 'Germania' }];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const fail = [];
async function misura(larg, rosso, dati, nome) {
  const page = await b.newPage({ viewport: { width: larg, height: 860 } }); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript((r) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_235 = 1; }, rosso);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(800);
  const r = await page.evaluate((d) => {
    const host = document.createElement('div'); host.id = 'host235';
    host.style.cssText = 'position:fixed;inset:0;z-index:99999;overflow:auto;background:' + TH.bg;/* il contenitore della carriera e' sul fondo del tema (foto del PO: margini chiari) */
    document.body.appendChild(host);
    ReactDOM.createRoot(host).render(React.createElement('div', { style: { width: '100%' } }, React.createElement(NationalCallupScreen, { data: d, onPlay: () => {} })));
    return true;
  }, dati);
  await sleep(900);
  const m = await page.evaluate(() => {
    const host = document.getElementById('host235');
    const rgb = (s) => { const m = String(s).match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(x => +x); return { r: p[0], g: p[1], b: p[2], a: p[3] == null ? 1 : p[3] }; };
    const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
    const contr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    const prim = rgb((() => { const d = document.createElement('div'); d.style.color = TH.primary; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; })());
    const card = rgb((() => { const d = document.createElement('div'); d.style.color = TH.card; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; })());
    const all = [...host.querySelectorAll('*')];
    const gradienti = all.filter(e => /gradient/.test(getComputedStyle(e).backgroundImage) && !e.closest('svg')).length;
    const fondo = (e) => { for (let x = e; x; x = x.parentElement) { const c = rgb(getComputedStyle(x).backgroundColor); if (c && c.a > 0.9) return c; if (x === host) break; } return rgb(getComputedStyle(host).backgroundColor); };
    const bassi = [];
    for (const e of all) { if (e.closest('svg')) continue; const t = [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
      if (!t || !/[A-Za-zÀ-ú0-9]/.test(t)) continue; const cs = getComputedStyle(e); const c = rgb(cs.color); if (!c) continue;
      const fs = parseFloat(cs.fontSize), fw = +cs.fontWeight || 400; const soglia = (fs >= 18 || (fs >= 14 && fw >= 700)) ? 3 : 4.5;
      const k = contr(c, fondo(e)); if (k < soglia) bassi.push(t.slice(0, 30) + ' ' + k.toFixed(2)); }
    const bottoni = [...host.querySelectorAll('button')].map(x => { const c = rgb(getComputedStyle(x).backgroundColor); const rr = x.getBoundingClientRect();
      return { t: x.innerText.trim().slice(0, 30), h: Math.round(rr.height), primario: !!(c && prim && Math.abs(c.r - prim.r) + Math.abs(c.g - prim.g) + Math.abs(c.b - prim.b) < 6) }; });
    const cards = all.filter(e => { const c = rgb(getComputedStyle(e).backgroundColor); return c && card && c.a > 0.9 && Math.abs(c.r - card.r) + Math.abs(c.g - card.g) + Math.abs(c.b - card.b) < 6 && parseFloat(getComputedStyle(e).borderTopLeftRadius) === 12; }).length;
    const scroll = Math.max(host.scrollWidth, document.documentElement.scrollWidth) > window.innerWidth + 1;
    return { gradienti, bassi, bottoni, cards, scroll };
  });
  const foto = path.join(OUT, `${rosso ? 'prima' : 'dopo'}-${nome}-${larg}.png`);
  await page.locator('#host235').screenshot({ path: foto });
  await page.close();
  const gioca = m.bottoni.find(x => /gioca/i.test(x.t));
  const ok = !!gioca && gioca.primario && gioca.h >= 48 && m.cards >= 3 && m.gradienti === 0 && m.bassi.length === 0 && !m.scroll && !errs.length;
  console.log(`${rosso ? 'rosso' : 'verde'} ${nome} ${larg}px: bottone ${gioca ? (gioca.primario ? 'primario' : 'NON primario') + ' h' + gioca.h : 'assente'} · card del kit ${m.cards} · gradienti ${m.gradienti} · testi sotto contrasto ${m.bassi.length}${m.bassi.length ? ' (' + m.bassi.slice(0, 3).join(' | ') + ')' : ''} · scorrimento ${m.scroll ? 'SI' : 'no'}${errs.length ? ' ERR ' + errs[0] : ''} → ${ok ? 'OK' : 'NO'} · ${path.relative(ROOT, foto)}`);
  return ok;
}
for (const larg of [360, 412]) for (const [i, d] of DATI.entries()) {
  const nome = i ? 'prima-convocazione' : 'spagna';
  if (!process.env.CPM_SOLO_ROSSO && !(await misura(larg, false, d, nome))) fail.push(`verde ${nome} ${larg}`);
  if (await misura(larg, true, d, nome)) fail.push(`rosso ${nome} ${larg} non bocciato`);
}
await b.close(); srv.close();
console.log(fail.length ? '❌ ROSSO — ' + fail.join(' · ') : '✅ VERDE — convocazione al kit standard (360/412), prova del rosso riconosciuta');
process.exit(fail.length ? 1 : 0);
