/* [giro 299 · PO-564 «angoli non arrotondati correttamente, fai un check su tutti i box»] LA MISURA DEGLI ANGOLI, in un posto solo:
   la usano il censimento e il guardiano `rosa-angoli-299.mjs`. Gira DENTRO la pagina (page.evaluate) e legge il DOM reso.
   RIQUADRO = elemento visibile, largo >= 48 e alto >= 20, con un fondo o un bordo dipinti (non dentro svg, non aria-hidden).
   Per ogni riquadro i quattro raggi resi (px, limitati a meta' del lato corto come fa il browser).
   DIFETTI
     T  ATTACCO INCOERENTE: due riquadri impilati a filo (stessi fianchi entro 2 px, distanza <= 1,5 px) dove sul lato che si tocca
        uno ha gli angoli squadrati e l'altro tondi (>= 2 px). E' la foto del PO: testata «ROSA 24» squadrata sotto, riquadro tondo sopra.
        Vale anche per due riquadri affiancati a filo (stesso alto e basso).
     D  TESTA E CORPO CON RAGGI DIVERSI: coppia attaccata bene (lato comune squadrato da tutti e due) ma gli angoli ESTERNI differiscono
        di piu' di 2 px (testata 6, corpo 16).
     S  FIGLIO CHE SBORDA: un riquadro figlio dipinto esce dall'angolo tondo del padre (padre senza ritaglio) per piu' di 1 px.
     Q  ANGOLO SQUADRATO SENZA MOTIVO: riquadro con angoli misti (alcuni tondi, alcuni a zero) il cui angolo squadrato non tocca
        ne' il bordo dello schermo, ne' un altro riquadro, ne' il bordo del padre.
     N  FIGLIO PIU' TONDO DEL PADRE: riquadro annidato (largo >= 100, alto >= 36, non una pillola) col raggio maggiore di quello del
        riquadro che lo contiene (padre con raggio > 0) di piu' di 1 px.
   Ogni difetto porta una descrizione leggibile dei due riquadri. Nessuna soglia e' regolabile dall'esterno. */
export function ANGOLI() {
  const W = document.documentElement.clientWidth, H = innerHeight;
  const trasp = c => !c || c === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(c);
  const vis = e => { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.left < W && r.top < H * 40; };
  const bordo = cs => ['Top', 'Right', 'Bottom', 'Left'].some(k => parseFloat(cs['border' + k + 'Width']) > 0 && cs['border' + k + 'Style'] !== 'none' && !trasp(cs['border' + k + 'Color']));
  const fondo = cs => !trasp(cs.backgroundColor) || (cs.backgroundImage && cs.backgroundImage !== 'none');
  const desc = e => { const t = e.getAttribute('data-cpm') || e.getAttribute('data-cpm-fis') && 'fisarmonica' || ''; return (e.tagName.toLowerCase() + (t ? '.' + t : '') + ' «' + (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 34) + '»'); };
  const raggiD = (cs, r) => ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'].map(k => { const v = String(cs[k]).split(' ')[0]; return /%/.test(v) ? parseFloat(v) / 100 * Math.min(r.width, r.height) : (parseFloat(v) || 0); });/* dichiarati: senza il limite di meta' lato */
  const raggi = (cs, r) => { const m = Math.min(r.width, r.height) / 2; return ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'].map(k => { const v = String(cs[k]).split(' ')[0]; const n = /%/.test(v) ? parseFloat(v) / 100 * Math.min(r.width, r.height) : (parseFloat(v) || 0); return Math.round(Math.min(n, m) * 10) / 10; }); };
  /* radice: lo strato fisso in primo piano che copre lo schermo, altrimenti la pagina */
  let RAD = document.body; { const veli = [...document.body.querySelectorAll('*')].filter(e => { const cs = getComputedStyle(e); if (cs.position !== 'fixed' || !vis(e)) return false; const r = e.getBoundingClientRect(); return r.width >= W * 0.95 && r.height >= H * 0.9 && +cs.zIndex >= 100; }); if (veli.length) RAD = veli[veli.length - 1]; }
  const B = [];
  for (const e of RAD.querySelectorAll('div,section,article,aside,main,button,li,a,label,header,footer,nav,ul,p,span')) {
    if (e.closest('svg') || e.closest('[aria-hidden="true"]')) continue; const r = e.getBoundingClientRect(); if (r.width < 48 || r.height < 20) continue; if (!vis(e)) continue;
    const cs = getComputedStyle(e); const f = fondo(cs), b = bordo(cs); if (!f && !b) continue; if (cs.pointerEvents === 'none' && cs.position === 'absolute') continue;/* velini di luce */
    if (cs.display === 'inline') continue;
    B.push({ e, r, cs, R: raggi(cs, r), Rd: raggiD(cs, r), f, b, bg: cs.backgroundColor + '|' + cs.backgroundImage, clip: /(hidden|clip|auto|scroll)/.test(cs.overflowX + cs.overflowY), pieno: r.width >= W * 0.97 && r.height >= H * 0.85 });
  }
  const idx = new Map(B.map((x, i) => [x.e, i]));
  const padre = x => { for (let a = x.e.parentElement; a && a !== document.documentElement; a = a.parentElement) { const i = idx.get(a); if (i != null) return B[i]; } return null; };
  for (const x of B) x.p = padre(x);
  const T = [], D = [], S = [], Q = [], N = [];
  const fuoriVista = r => r.bottom < 0 || r.top > H * 40;
  /* T / D : coppie a filo */
  const cand = B.filter(x => !x.pieno && !fuoriVista(x.r));
  const ord = [...cand].sort((a, b) => a.r.top - b.r.top);
  for (let i = 0; i < ord.length; i++) { const a = ord[i];
    for (let j = 0; j < ord.length; j++) { if (i === j) continue; const b = ord[j]; if (a.e.contains(b.e) || b.e.contains(a.e)) continue;
      /* impilati: a sopra b */
      if (Math.abs(a.r.bottom - b.r.top) <= 1.5 && Math.abs(a.r.left - b.r.left) <= 2 && Math.abs(a.r.right - b.r.right) <= 2) {
        const sotto = [a.R[2], a.R[3]], sopra = [b.R[0], b.R[1]]; const q = v => v < 2;
        const tutti0 = sotto.every(q) && sopra.every(q), tuttiTondi = !sotto.some(q) && !sopra.some(q);
        if (!tutti0 && !tuttiTondi) T.push({ verso: 'sopra/sotto', a: desc(a.e), b: desc(b.e), ra: a.R.join('/'), rb: b.R.join('/') });
        else if (tutti0) { const ea = Math.max(a.Rd[0], a.Rd[1]), eb = Math.max(b.Rd[2], b.Rd[3]);/* raggi DICHIARATI: una striscia bassa ha il raggio reso limitato dall'altezza, non e' un'incoerenza */ const filoP = p => p && Math.abs(p.r.bottom - b.r.bottom) <= 1.5;/* il corpo arriva al bordo del padre: l'angolo esterno e' del padre */
          if (Math.abs(ea - eb) > 2 && !(eb < 2 && filoP(b.p)) && !(a.e.parentElement !== b.e.parentElement && eb < 2)) D.push({ a: desc(a.e), b: desc(b.e), ra: a.R.join('/'), rb: b.R.join('/') }); }
      }
      /* affiancati: a a sinistra di b (i due fratelli) */
      if (a.e.parentElement === b.e.parentElement && Math.abs(a.r.right - b.r.left) <= 1.5 && Math.abs(a.r.top - b.r.top) <= 2 && Math.abs(a.r.bottom - b.r.bottom) <= 2) {
        const dx = [a.R[1], a.R[2]], sx = [b.R[0], b.R[3]]; const q = v => v < 2; const tutti0 = dx.every(q) && sx.every(q), tuttiTondi = !dx.some(q) && !sx.some(q);
        if (!tutti0 && !tuttiTondi) T.push({ verso: 'fianco', a: desc(a.e), b: desc(b.e), ra: a.R.join('/'), rb: b.R.join('/') });
      }
    } }
  /* S : il figlio esce dall'angolo tondo del padre */
  for (const x of cand) { const p = x.p; if (!p || p.pieno || p.clip) continue; const dipF = x.f && x.bg !== p.bg;/* il fondo del figlio si vede solo se diverso da quello del padre */
    const lato = k => parseFloat(x.cs['border' + k + 'Width']) > 0 && x.cs['border' + k + 'Style'] !== 'none' && !trasp(x.cs['border' + k + 'Color']);
    const dipK = [dipF || lato('Top') || lato('Left'), dipF || lato('Top') || lato('Right'), dipF || lato('Bottom') || lato('Right'), dipF || lato('Bottom') || lato('Left')];/* il figlio dipinge qualcosa in quell'angolo? */
    if (!dipK.some(Boolean)) continue;
    const bw = parseFloat(p.cs.borderTopWidth) || 0; const ang = [[p.r.left, p.r.top, 1, 1, 0], [p.r.right, p.r.top, -1, 1, 1], [p.r.right, p.r.bottom, -1, -1, 2], [p.r.left, p.r.bottom, 1, -1, 3]];
    let peggio = 0, quale = -1; ang.forEach(([px, py, sx, sy, k]) => { const Rp = p.R[k]; if (Rp < 2 || !dipK[k]) return; const cx0 = px, cy0 = py;/* angolo del padre */
      const fx = (sx > 0 ? x.r.left - cx0 : cx0 - x.r.right), fy = (sy > 0 ? x.r.top - cy0 : cy0 - x.r.bottom);/* distanza dell'angolo del figlio dall'angolo del padre */
      if (fx >= Rp || fy >= Rp || fx < -1 || fy < -1) return; const rc = x.R[k]; const ccx = fx + rc, ccy = fy + rc; if (ccx >= Rp || ccy >= Rp) return;
      const fuori = Math.hypot(Rp - ccx, Rp - ccy) + rc - Rp; if (fuori > peggio) { peggio = fuori; quale = k; } });
    if (peggio > 1) S.push({ px: Math.round(peggio * 10) / 10, angolo: ['alto-sx', 'alto-dx', 'basso-dx', 'basso-sx'][quale], figlio: desc(x.e), padre: desc(p.e), rf: x.R.join('/'), rp: p.R.join('/') });
    void bw; }
  /* Q : angoli misti con lo squadrato senza motivo */
  for (const x of cand) { const z = x.R.map(v => v < 2); if (!z.some(Boolean) || z.every(Boolean)) continue; if (Math.max(...x.R) < 4) continue;
    const pt = [[x.r.left, x.r.top], [x.r.right, x.r.top], [x.r.right, x.r.bottom], [x.r.left, x.r.bottom]]; const senza = [];
    z.forEach((sq, k) => { if (!sq) return; const [px, py] = pt[k]; if (px <= 1.5 || px >= W - 1.5 || py <= 1.5 || py >= H - 1.5) return;
      let ok = false; for (const o of B) { if (o === x || x.e.contains(o.e)) continue; const anc = o.e.contains(x.e);
        if (anc) { if (Math.abs(px - o.r.left) <= 2 || Math.abs(px - o.r.right) <= 2 || Math.abs(py - o.r.top) <= 2 || Math.abs(py - o.r.bottom) <= 2) { ok = true; break; } }
        else if (px >= o.r.left - 1.5 && px <= o.r.right + 1.5 && py >= o.r.top - 1.5 && py <= o.r.bottom + 1.5) { ok = true; break; } }
      /* antenato NON dipinto che ritaglia a filo (scorrimento, contenitore con overflow) */
      if (!ok) for (let a = x.e.parentElement; a && a !== document.body; a = a.parentElement) { const r = a.getBoundingClientRect(); const cs = getComputedStyle(a); if (/(hidden|clip|auto|scroll)/.test(cs.overflowX + cs.overflowY) && (Math.abs(px - r.left) <= 2 || Math.abs(px - r.right) <= 2 || Math.abs(py - r.top) <= 2 || Math.abs(py - r.bottom) <= 2)) { ok = true; break; } }
      if (!ok) senza.push(['alto-sx', 'alto-dx', 'basso-dx', 'basso-sx'][k]); });
    if (senza.length) Q.push({ d: desc(x.e), r: x.R.join('/'), angoli: senza.join(',') }); }
  /* N : figlio piu' tondo del padre */
  for (const x of cand) { const p = x.p; if (!p || p.pieno) continue; if (x.r.width < 100 || x.r.height < 36) continue; const rf = Math.max(...x.R), rp = Math.max(...p.R); if (rp < 2) continue; if (rf >= Math.min(x.r.width, x.r.height) / 2 - 1) continue;/* pillola */
    if (rf > rp + 1) N.push({ figlio: desc(x.e), padre: desc(p.e), rf, rp }); }
  const uniq = (arr) => { const s = new Set(); return arr.filter(o => { const k = JSON.stringify(o); if (s.has(k)) return false; s.add(k); return true; }); };
  const o = { W, H, rad: RAD === document.body ? 'pagina' : 'strato', riquadri: cand.length, T: uniq(T), D: uniq(D), S: uniq(S), Q: uniq(Q), N: uniq(N) };
  o.tot = o.T.length + o.D.length + o.S.length + o.Q.length + o.N.length; return o;
}
