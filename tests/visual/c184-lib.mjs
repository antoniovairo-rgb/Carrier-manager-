/* [collaudo 184 · richiesta PO 07/11 «Sfrutta tutta l'altezza nelle schermate!»] Misura dello SPAZIO VERTICALE VUOTO sotto l'ultimo
   contenuto, quando la schermata NON scorre. Solo lettura sul gioco: non tocca src/.
   Definizioni (dichiarate nel rapporto):
   - RADICE: la finestra fissa piu' alta (z) che copre >= 60% della vista e ha testo; altrimenti la pagina.
   - BARRA: elemento fixed/sticky in basso (top >= 70% della vista, larghezza >= 60%) con >= 3 tasti = barra di navigazione; si toglie
     dall'area utile. Un'azione singola ancorata in basso NON e' barra: e' contenuto.
   - SCORRE: il documento o un contenitore (overflow auto/scroll, alto >= 30% della vista) ha scrollHeight > clientHeight + 2.
   - CONTENUTO: ogni elemento visibile della radice (fuori dalla barra) con testo proprio, oppure tasto/campo/immagine/svg/canvas, oppure
     con fondo o bordo pieno e alto meno dell'85% dell'area utile (le carte contano; i contenitori a tutta altezza no).
   - VUOTO = top della barra (o fondo della vista) - fondo dell'ultimo contenuto; % = vuoto / area utile (vista - barra). */
export function ALTEZZA() {
  const W = innerWidth, H = innerHeight;
  const gcs = e => getComputedStyle(e);
  const vis = e => { const c = gcs(e); return !(c.display === 'none' || c.visibility === 'hidden' || +c.opacity < 0.05); };
  const visCat = e => { for (let a = e; a && a.nodeType === 1; a = a.parentElement) if (!vis(a)) return false; return true; };
  let ovl = null;
  for (const e of document.body.querySelectorAll('*')) { const c = gcs(e); if (c.position !== 'fixed' || !vis(e)) continue; const r = e.getBoundingClientRect();
    if (r.width * r.height < 0.6 * W * H) continue; if (!(e.innerText || '').trim()) continue; const z = parseInt(c.zIndex) || 0; if (!ovl || z >= ovl.z) ovl = { e, z }; }
  const root = ovl ? ovl.e : document.body;
  /* barra di navigazione in basso */
  let bar = null;
  for (const e of document.body.querySelectorAll('*')) { const c = gcs(e); if (c.position !== 'fixed' && c.position !== 'sticky') continue; if (!vis(e)) continue;
    if (ovl && !ovl.e.contains(e) && !e.contains(ovl.e)) { const z = parseInt(c.zIndex) || 0; if (z < ovl.z) continue; }
    const r = e.getBoundingClientRect(); if (r.top < 0.7 * H || r.width < 0.6 * W || r.height > 0.25 * H || r.bottom < H - 4) continue;
    const nb = [...e.querySelectorAll('button,a[href],[role="button"],[role="tab"]')].filter(b => b.getBoundingClientRect().width > 0).length; if (nb < 3) continue;
    if (!bar || r.top < bar.r.top) bar = { e, r }; }
  const barTop = bar ? Math.round(bar.r.top) : H;
  /* scorrimento */
  const de = document.documentElement; let scorre = Math.max(de.scrollHeight, document.body.scrollHeight) > H + 2 ? 'documento' : '';
  if (!scorre) for (const e of root.querySelectorAll('*')) { const c = gcs(e); if (!/(auto|scroll)/.test(c.overflowY)) continue; if (e.clientHeight < 0.3 * H) continue; if (!visCat(e)) continue; if (e.scrollHeight > e.clientHeight + 2) { scorre = (e.getAttribute('data-cpm') || e.className || e.tagName).toString().slice(0, 30); break; } }
  /* ultimo contenuto */
  const area = barTop; let maxB = 0, maxRaw = 0, minT = H, ultimo = null;
  const pieno = s => { const m = /rgba?\(([^)]+)\)/.exec(s || ''); if (!m) return false; const p = m[1].split(',').map(Number); return !(p.length > 3 && p[3] < 0.05); };
  for (const e of root.querySelectorAll('*')) {
    if (bar && bar.e.contains(e)) continue; if (!vis(e)) continue; const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
    if (r.bottom <= 0 || r.right <= 0 || r.left >= W) continue;
    const tag = e.tagName; let ok = /^(BUTTON|INPUT|SELECT|TEXTAREA|IMG|svg|CANVAS|VIDEO)$/.test(tag);
    if (!ok) for (const n of e.childNodes) if (n.nodeType === 3 && /[\p{L}\p{N}]/u.test(n.nodeValue || '')) { ok = true; break; }
    if (!ok) { const c = gcs(e); if (r.height < 0.85 * area && (pieno(c.backgroundColor) || (c.backgroundImage && c.backgroundImage !== 'none') || (parseFloat(c.borderBottomWidth) > 0 && pieno(c.borderBottomColor)))) ok = true; }
    if (!ok) continue; if (e.closest('svg') && tag !== 'svg') continue; if (!visCat(e)) continue;
    if (r.bottom > maxRaw) maxRaw = r.bottom; if (r.top >= barTop) continue;
    const b = Math.min(r.bottom, barTop); if (b > maxB) { maxB = b; ultimo = (e.innerText || e.getAttribute('aria-label') || tag).trim().replace(/\s+/g, ' ').slice(0, 40); }
    if (r.top < minT) minT = Math.max(0, r.top);
  }
  /* scorre davvero solo se del contenuto finisce oltre il bordo utile (un padding di fondo non conta) */
  if (scorre && maxRaw <= barTop + 4) scorre = '';
  const vuoto = Math.max(0, Math.round(barTop - maxB));
  return { W, H, finestra: ovl ? (ovl.e.innerText || '').trim().split('\n')[0].slice(0, 30) : null, barra: bar ? Math.round(H - bar.r.top) : 0, area, scorre: scorre || null,
    ultimoFondo: Math.round(maxB), fondoContenuto: Math.round(maxRaw), ultimo, primoTop: Math.round(minT), vuoto, pct: Math.round(1000 * vuoto / area) / 10 };
}
export const classe = a => a.scorre ? 'scorre' : a.pct > 25 ? 'medio' : a.pct >= 12 ? 'basso' : 'ok';
