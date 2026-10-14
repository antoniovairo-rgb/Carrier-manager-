/* [collaudo 164] Strumenti condivisi (copiati dalla libreria del collaudo 161, ramo collaudo/sessione-collaudatrice-161).
   Sola lettura sul gioco: misurano il DOM e cliccano i pulsanti VISIBILI come farebbe un giocatore.
   scanOverlays(page): ogni overlay fisso in primo piano (z>=900) con il suo pannello, fondo, raggio, ombra,
   bordo (getComputedStyle), esito del confronto con la cornice standard (TH / TH_DARK, finestraStd),
   uscita dallo schermo e testo tagliato.
   closeTop(page): chiude l'overlay in cima cliccando un pulsante visibile del pannello (nessun dismiss). */
import { sleep } from './harness.mjs';

export async function scanOverlays(page) {
  return page.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect(); if (!(r.width > 0 && r.height > 0)) return false;
      const cs = getComputedStyle(el); return cs.visibility !== 'hidden' && cs.display !== 'none' && parseFloat(cs.opacity) > 0.05; };
    const probe = document.createElement('div'); document.body.appendChild(probe);
    const norm = (prop, val) => { probe.style.cssText = ''; probe.style[prop] = val; const v = getComputedStyle(probe)[prop]; probe.style.cssText = ''; return v; };
    const tokenSet = (t, nome) => t ? { nome, bg: norm('backgroundColor', t.surface3), shadow: norm('boxShadow', t.el3),
      bc: norm('borderTopColor', t.divider), radius: (typeof RAD !== 'undefined') ? RAD.xl + 'px' : null } : null;
    const sets = [tokenSet(typeof TH !== 'undefined' ? TH : null, 'TH'), tokenSet(typeof TH_DARK !== 'undefined' ? TH_DARK : null, 'TH_DARK')].filter(Boolean);
    const cornice = bc => { for (const s of sets) {
      if (bc.backgroundColor === s.bg && bc.borderTopWidth === '1px' && bc.borderTopStyle === 'solid' && bc.borderTopColor === s.bc
        && bc.borderTopLeftRadius === s.radius && bc.boxShadow === s.shadow) return s.nome; } return 'no'; };
    const out = [];
    for (const el of document.body.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      if (cs.position !== 'fixed') continue;
      const z = parseInt(cs.zIndex, 10); if (!(z >= 900)) continue;
      if (!vis(el)) continue;
      if (el.querySelector('[title="Ambiente di esecuzione"]')) continue; /* badge TEST/PRODUCTION di localhost, non una finestra */
      let box = null; const q = [[el, 0]];
      while (q.length) { const [n, d] = q.shift();
        if (n !== el) { const r = n.getBoundingClientRect(); const c = getComputedStyle(n);
          const bgOn = c.backgroundColor && c.backgroundColor !== 'rgba(0, 0, 0, 0)' && c.backgroundColor !== 'transparent';
          if (bgOn && r.width > 120 && r.height > 60 && vis(n)) { box = n; break; } }
        if (d < 4) for (const k of n.children) q.push([k, d + 1]); }
      const nopanel = !box; if (!box) box = el;
      const bc = getComputedStyle(box), r = box.getBoundingClientRect();
      const dc = el.getAttribute('data-cpm') || box.getAttribute('data-cpm') || (box.querySelector('[data-cpm]') || { getAttribute: () => null }).getAttribute('data-cpm') || 'anon';
      const trunc = [];
      for (const n of [box, ...box.querySelectorAll('*')]) { if (trunc.length >= 6) break; if (!vis(n)) continue;
        const c = getComputedStyle(n);
        const haTesto = [...n.childNodes].some(x => x.nodeType === 3 && x.textContent.trim());
        if (!haTesto) continue;
        const clipX = c.overflowX !== 'visible' && c.overflowX !== 'auto' && c.overflowX !== 'scroll' && n.scrollWidth > n.clientWidth + 1;
        const clipY = c.overflowY !== 'visible' && c.overflowY !== 'auto' && c.overflowY !== 'scroll' && n.scrollHeight > n.clientHeight + 1;
        const ell = c.textOverflow === 'ellipsis' && n.scrollWidth > n.clientWidth + 1;
        if (clipX || clipY || ell) trunc.push({ t: (n.innerText || '').trim().slice(0, 50), x: clipX, y: clipY, ell });
      }
      const titolo = (box.innerText || '').trim().split('\n')[0].slice(0, 70);
      out.push({ dc, titolo, z, nopanel,
        x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height),
        fuori: r.left < -0.5 || r.right > innerWidth + 0.5 || r.top < -0.5 || r.bottom > innerHeight + 0.5,
        scorrevole: bc.overflowY === 'auto' || bc.overflowY === 'scroll',
        bg: bc.backgroundColor, raggio: bc.borderTopLeftRadius, ombra: bc.boxShadow,
        bordo: `${bc.borderTopWidth} ${bc.borderTopStyle} ${bc.borderTopColor}`, cornice: cornice(bc), trunc,
        pulsanti: box.querySelectorAll('button').length,
        etichette: [...box.querySelectorAll('button')].map(b => (b.textContent || '').trim().slice(0, 32)).filter(Boolean).slice(0, 8),
        orizzScroll: document.documentElement.scrollWidth > innerWidth + 1 });
    }
    probe.remove();
    return out;
  });
}

/* Chiude l'overlay in cima: prima un pulsante di chiusura/avanzamento del pannello, poi il primo pulsante abilitato.
   Ritorna l'etichetta cliccata o null se non c'e' nulla da cliccare (finestra bloccata). */
export async function closeTop(page) {
  return page.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
    const ov = [...document.body.querySelectorAll('*')].filter(el => { const cs = getComputedStyle(el); return cs.position === 'fixed' && parseInt(cs.zIndex, 10) >= 900 && vis(el) && !el.querySelector('[title="Ambiente di esecuzione"]') && el.querySelector('button'); });
    if (!ov.length) return null;
    const top = ov.sort((a, b) => parseInt(getComputedStyle(b).zIndex, 10) - parseInt(getComputedStyle(a).zIndex, 10))[0];
    const btns = [...top.querySelectorAll('button')].filter(b => vis(b) && !b.disabled);
    const chiudi = /^(Continua|Chiudi|Prosegui|Avanti|OK|Ho capito|Salta|Diplomatico|Siamo pronti|Conferma|Vai|Dopo|Non ora|Accetta|Fine|Torna|Ok|×|X)/i;
    /* priorita': chi vuole GIOCARE la partita clicca «Gioca la partita»; poi un pulsante di avanzamento; il primo pulsante come ultima scelta */
    const b = btns.find(x => /^Gioca/i.test((x.textContent || '').trim())) || btns.find(x => chiudi.test((x.textContent || '').trim())) || btns[0];
    if (!b) return null;
    const etic = (b.textContent || '').trim().slice(0, 40) || '(icona)';
    b.click(); return etic;
  });
}

export async function clickAdvance(page, patterns) {
  return page.evaluate(srcs => {
    const vis = el => { const x = el.getBoundingClientRect(); const cs = getComputedStyle(el); return x.width > 0 && x.height > 0 && cs.visibility !== 'hidden' && !el.disabled; };
    const btns = [...document.querySelectorAll('button')].filter(vis);
    for (const src of srcs) { const r = new RegExp(src, 'i');
      const b = btns.find(x => r.test((x.textContent || '').trim()));
      if (b) { b.click(); return (b.textContent || '').trim().slice(0, 40); } }
    return null;
  }, patterns.map(r => r.source));
}

export { sleep };

/* [collaudo 164] Come clickAdvance, ma un giocatore clicca anche cio' che NON e' un <button>: card e righe con cursore a mano
   (la card «Vivi la Settimana» della home e' un div). Si sceglie l'elemento cliccabile PIU' INTERNO che porta il testo (lezione 7.491:
   l'ultimo nodo col testo giusto e' spesso un contenitore senza handler). Ritorna l'etichetta cliccata o null. */
export async function clickGiocatore(page, patterns) {
  return page.evaluate(srcs => {
    const vis = el => { const x = el.getBoundingClientRect(); const cs = getComputedStyle(el); return x.width > 0 && x.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && !el.disabled; };
    const cand = [...document.querySelectorAll('button,[role=button],a,div,span')].filter(el => {
      if (el.tagName === 'BUTTON' || el.getAttribute('role') === 'button' || el.tagName === 'A') return vis(el);
      return getComputedStyle(el).cursor === 'pointer' && vis(el);
    });
    for (const src of srcs) { const r = new RegExp(src, 'i');
      const hit = cand.filter(x => r.test((x.innerText || x.textContent || '').trim().split('\n')[0].replace(/^[^\p{L}]+/u, '')));/* le emoji in testa (⚽ Gioca, ⚡ Vivi) non contano */
      if (!hit.length) continue;
      const inner = hit.filter(h => !hit.some(o => o !== h && h.contains(o)));
      const el = inner[0]; el.scrollIntoView({ block: 'center' }); el.click(); return (el.innerText || el.textContent || '').trim().split('\n')[0].slice(0, 40); }
    return null;
  }, patterns.map(r => r.source));
}
