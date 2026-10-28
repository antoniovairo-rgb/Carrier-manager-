/* Collaudo carriera 178 n.5 — libreria: apertura pagina telefono 412x915, creazione UI, foto, letture. Solo lettura sul gioco. */
import { startServer, launchBrowser, installCdnRoutes, sleep, clickByText } from './lib/harness.mjs';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
export { sleep, clickByText };
const QUI = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(QUI, '..', '..');
export const DATI = path.join(ROOT, 'docs/collaudi/dati-carriera-178-5');
export const FOTO = path.join(ROOT, 'docs/collaudi/foto-carriera-178-5');
export const SCR = process.env.C178_SCR || '/tmp/claude-0/-home-user-Carrier-manager-/a0f17158-39e0-5c25-a099-08d6e73df7ad/scratchpad';
export async function avvia() {
  const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
  return { srv, port, browser };
}
export async function nuovaPagina(S, { glb = false, query = {} } = {}) {
  const page = await S.browser.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  page._err = []; page.on('pageerror', e => page._err.push(String(e.message).slice(0, 200)));
  page.on('console', m => { if (m.type() === 'error') page._err.push('console:' + m.text().slice(0, 160)); });
  await page.addInitScript(g => { window.__CPM_GLB = g; }, glb);
  if (process.env.C178_STATO) { const dump = JSON.parse(fs.readFileSync(process.env.C178_STATO, 'utf8')); await page.addInitScript(d => { try { if (!sessionStorage.getItem('c178-inj')) { for (const k in d) localStorage.setItem(k, d[k]); sessionStorage.setItem('c178-inj', '1'); } } catch (e) {} }, dump); }
  const q = new URLSearchParams({ cpmtest: '1', ...query });
  await page.goto(`http://localhost:${S.port}/CARRIER-MANAGER-AV.html?${q}`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  return page;
}
export async function foto(page, nome, dir = SCR) { const f = path.join(dir, nome + '.jpg'); await page.screenshot({ path: f, type: 'jpeg', quality: 60 }); return f; }
export async function testo(page) { return page.evaluate(() => document.body.innerText.slice(0, 3000)); }
export async function bottoni(page) { return page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent).map(b => (b.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 60)).filter(Boolean)); }

/* ───────── lettura/scrittura del file dati ───────── */
export const jl = (nome, o) => { fs.mkdirSync(DATI, { recursive: true }); fs.appendFileSync(path.join(DATI, nome), JSON.stringify(o) + '\n'); };
export const evalSafe = async (page, fn, arg) => { try { return await page.evaluate(fn, arg); } catch (e) { return { __err: String(e.message).slice(0, 120) }; } };
export const fase = page => evalSafe(page, () => (window.__CPM_PHASE ? window.__CPM_PHASE() : null)).then(x => (x && x.__err) ? null : x);
export const punteggio = page => evalSafe(page, () => (window.__CPM_SCORE ? window.__CPM_SCORE() : null));
export const clickPos = async (page, sel, idx = 0) => {
  const r = await evalSafe(page, ([s, i]) => { const e = [...document.querySelectorAll(s)].filter(x => x.offsetParent !== null)[i]; if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, dis: !!e.disabled }; }, [sel, idx]);
  if (!r || r.__err) return null; await page.mouse.click(r.x, r.y); return r;
};
export const leggiPannello = page => evalSafe(page, () => {
  const p = document.querySelector('[data-cpm="scelte"]'); if (!p) return null;
  const righe = [...p.querySelectorAll('[data-cpm="scelte-righe"] button')].map(b => ({ txt: (b.innerText || '').trim().replace(/\n+/g, ' | '), dis: !!b.disabled, op: getComputedStyle(b).opacity }));
  return { head: (p.innerText || '').replace(/\n+/g, ' / ').slice(0, 400), righe };
});
export const leggiEsito = page => evalSafe(page, () => { const e = document.querySelector('[data-cpm="esito"]'); return e ? (e.innerText || '').replace(/\n+/g, ' / ').slice(0, 500) : null; });
export const statoHL = page => evalSafe(page, () => { try { const s = window.__CPM_STATE ? window.__CPM_STATE() : null; const o = window.__CPM_OUTCOME || null; return { act: s && s.act, ball: s && s.ball && { x: s.ball.x, y: s.ball.y, h: s.ball.worldY, held: s.ball.heldBy }, clock: s && s.clock, outcome: o && { text: o.text, ok: o.ok, key: o.outKey, label: o.actionLabel } }; } catch (e) { return { err: String(e) }; } });

/* ───────── finestre sovrapposte (modali, interviste, offerte): lettura generica e clic come un giocatore ───────── */
export const overlay = page => evalSafe(page, () => {
  const vis = e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const fx = [...document.querySelectorAll('body *')].filter(e => { const s = getComputedStyle(e); if (s.position !== 'fixed' || !vis(e)) return false; const r = e.getBoundingClientRect(); return r.width >= 280 && r.height >= 220 && (parseInt(s.zIndex) || 0) >= 50; });
  if (!fx.length) return null;
  fx.sort((a, b) => (parseInt(getComputedStyle(b).zIndex) || 0) - (parseInt(getComputedStyle(a).zIndex) || 0));
  const o = fx[0];
  const cand = [...o.querySelectorAll('*')].filter(e => { if (!vis(e)) return false; const s = getComputedStyle(e); const txt = (e.innerText || '').trim(); if (!txt || txt.length > 160) return false; const isBtn = e.tagName === 'BUTTON' || e.getAttribute('role') === 'button'; if (!(isBtn || s.cursor === 'pointer')) return false; const p = e.parentElement; if (p && p !== o && !isBtn && getComputedStyle(p).cursor === 'pointer' && p.tagName !== 'BODY') return false; return true; });
  const opz = cand.map(e => { const r = e.getBoundingClientRect(); return { txt: (e.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 90), x: r.x + r.width / 2, y: r.y + r.height / 2, dis: !!e.disabled, w: r.width }; });
  return { dc: o.dataset.cpm || null, z: parseInt(getComputedStyle(o).zIndex) || 0, testo: (o.innerText || '').replace(/\n+/g, ' / ').slice(0, 700), opz };
});
