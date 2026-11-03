/* [PO-302 tappa 2b] misura WCAG/tagli dei riquadri V2, copiata da grafica-v2.mjs (si passa a page.evaluate) */
export function MISURA(sel) {
  const P = s => { const m = String(s).match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1]; };
  const lum = c => { const f = x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const sopra = (a, b) => [0, 1, 2].map(i => a[i] * a[3] + b[i] * (1 - a[3]));
  const fondo = e => { const st = []; for (let x = e; x; x = x.parentElement) { const c = P(getComputedStyle(x).backgroundColor); if (c && c[3] > 0) { st.push(c); if (c[3] >= 1) break; } }
    let b = [13, 15, 20]; for (let i = st.length - 1; i >= 0; i--) b = st[i][3] >= 1 ? st[i].slice(0, 3) : sopra(st[i], b); return b; };
  const out = { n: 0, min: 99, peggiori: [], tagliati: [] };
  for (const root of document.querySelectorAll(sel)) for (const e of [root, ...root.querySelectorAll('*')]) {
    if (e instanceof SVGElement) continue;/* testo disegnato dentro uno stemma SVG: il suo fondo e' la forma dello stemma, non un colore CSS */
    const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.1) continue;
    const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue;
    if (e.scrollWidth > e.clientWidth + 1 && cs.overflow !== 'visible' && cs.overflowX !== 'visible') out.tagliati.push((e.textContent || '').trim().slice(0, 30));
    if (cs.textOverflow === 'ellipsis' && e.scrollWidth > e.clientWidth + 1) out.tagliati.push((e.textContent || '').trim().slice(0, 30));
    const proprio = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 0); if (!proprio) continue;
    if (/^[\p{Extended_Pictographic}\s›·]+$/u.test(e.textContent.trim())) continue;/* solo icone/emoji: non e' testo */
    const b = fondo(e), c = P(cs.color); const t = c[3] < 1 ? sopra(c, b) : c.slice(0, 3);
    const L1 = lum(t), L2 = lum(b), k = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const fs = parseFloat(cs.fontSize), grande = fs >= 24 || (fs >= 18.66 && +cs.fontWeight >= 700), soglia = grande ? 3 : 4.5;
    out.n++; if (k < out.min) out.min = k;
    if (k < soglia) out.peggiori.push(`${(e.textContent || '').trim().slice(0, 24)} ${k.toFixed(2)}:1 (${fs}px)`);
  }
  out.min = +out.min.toFixed(2); return out;
}
