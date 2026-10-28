/* Collaudo carriera 178 n.5 — giro delle schermate (Stagione, Club, Carriera, Agente, Ufficio) con controlli di sanita' sul telefono. */
import { sleep, clickByText, evalSafe, testo, bottoni, foto, jl, SCR, overlay } from './c178-car5-lib.mjs';
const ANOM = /\bNaN\b|undefined|\[object|\bnull\b|Infinity|\$\{|\{\{|€\s*-|-0\b/;
export const sanita = page => evalSafe(page, () => {
  const t = document.body.innerText; const m = t.match(new RegExp('.{0,40}(\\bNaN\\b|undefined|\\[object|\\bnull\\b|Infinity|\\$\\{).{0,40}')); const de = document.scrollingElement;
  const fuori = [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); if (!r.width || !r.height) return false; const s = getComputedStyle(e); if (s.position === 'fixed' && r.width > 400) return false; return r.right > 414 && (e.innerText || '').trim().length > 0 && e.children.length === 0; }).slice(0, 3).map(e => (e.innerText || '').trim().slice(0, 40));
  return { anom: m ? m[0] : null, scrollX: de.scrollWidth - de.clientWidth, fuori };
});
async function tab(page, nome) { const r = await clickByText(page, '^' + nome + '$', 3000); await sleep(900); return r; }
export async function visita(page, tag, P, log) {
  const out = { tag, s: P.season, w: P.week, tab: {} };
  /* chiudi eventuali finestre prima */
  for (const nome of ['STAGIONE', 'CLUB', 'CARRIERA', 'AGENTE', 'UFFICIO']) {
    if (!(await tab(page, nome))) { out.tab[nome] = { errore: 'tab-non-cliccabile' }; continue; }
    const ov = await overlay(page); const sz = await sanita(page); const tx = (await testo(page)).replace(/\n+/g, ' / ');
    out.tab[nome] = { ov: ov && ov.testo.slice(0, 80), sz, len: tx.length };
    if (nome === 'STAGIONE') {
      const cl = await evalSafe(page, () => { const rows = [...document.querySelectorAll('table tr')].map(r => [...r.children].map(c => (c.innerText || '').trim().replace(/\s+/g, ' '))).filter(r => r.length >= 10); return rows.slice(0, 30); });
      if (Array.isArray(cl) && cl.length) {
        const bad = []; let gf = 0, gs = 0;
        for (const r of cl) { const n = r.slice(-8).map(x => parseInt(String(x).replace('+', ''))); const [g, v, nn, p, f, s2, d, pt] = n; if ([g, v, nn, p, f, s2, d, pt].some(Number.isNaN)) continue; gf += f; gs += s2; if (v + nn + p !== g) bad.push(['G!=V+N+P', r]); if (f - s2 !== d) bad.push(['DIFF', r]); if (3 * v + nn !== pt && Math.abs(3 * v + nn - pt) > 0) bad.push(['PT', r]); }
        out.classifica = { righe: cl.length, gf, gs, bad: bad.slice(0, 4) };
        if (gf !== gs) out.classifica.sbilancio = gf - gs;
      }
    }
    if (!(tag in (visita._foto || (visita._foto = {}))) || true) { /* una foto per tab nelle prime due visite */
      visita._n = visita._n || {}; visita._n[nome] = (visita._n[nome] || 0) + 1; if (visita._n[nome] <= 2) await foto(page, `tab-${nome}-${tag}`, SCR);
    }
  }
  await tab(page, 'HOME');
  jl('visite.jsonl', out); return out;
}

/* ───────── azioni: Nazionale, Agente, Ufficio — con prima/dopo sui numeri ───────── */
const CAMPI = ['bankBalance', 'morale', 'form', 'fatigue', 'popularity', 'coachTrust', 'value', 'ovr', 'nationalCaps'];
const delta = (A, B) => { const d = {}; if (A && B) for (const k of CAMPI) if (JSON.stringify(A[k]) !== JSON.stringify(B[k])) d[k] = [A[k], B[k]]; return d; };
const clickTxt = async (page, rx, idx = 0) => evalSafe(page, ([src, i]) => { const re = new RegExp(src, 'i'); const el = [...document.querySelectorAll('button,[role=button],div,span')].filter(e => e.offsetParent && re.test((e.innerText || '').trim().replace(/\s+/g, ' ')) && (e.innerText || '').length < 140)[i]; if (!el) return false; el.click(); return (el.innerText || '').trim().slice(0, 60); }, [rx, idx]);
export async function azioni(page, P, snap, rot, log) {
  const rec = { s: P.season, w: P.week, nazionale: null, agente: [], ufficio: [] };
  /* Nazionale (dentro Carriera) */
  await clickByText(page, '^CARRIERA$', 2500); await sleep(700);
  const n = await clickTxt(page, '^🌍\\s*Nazionale'); await sleep(900);
  rec.nazionale = { clic: n, testo: (await testo(page)).replace(/\n+/g, ' / ').slice(0, 900), sz: await sanita(page) };
  if (!visita._nz) { visita._nz = 1; await foto(page, 'nazionale-' + P.season + '-' + P.week, SCR); }
  /* Agente: un compito alla settimana, a rotazione */
  await clickByText(page, '^AGENTE$', 2500); await sleep(800);
  const A0 = await snap(); const compiti = ['Cerca offerte', 'Prepara rinnovo', 'Costruisci immagine', 'Silenzio stampa'];
  const c = compiti[(rot.ag++) % 4]; const r = await clickTxt(page, c); await sleep(800);
  const A1 = await snap(); rec.agente.push({ compito: c, clic: r, d: delta(A0, A1), testo: (await testo(page)).replace(/\n+/g, ' / ').slice(300, 700) });
  const neg = (P.contract && P.contract.expiresAtSeason - P.season <= 0);
  if (neg) { const A2 = await snap(); const rr = await clickTxt(page, 'Negozia rinnovo'); await sleep(1200); const ov = await overlay(page); rec.agente.push({ rinnovo: rr, ov: ov && { t: ov.testo.slice(0, 500), o: ov.opz.map(o => o.txt) } }); if (ov && ov.opz.length) { const pick = ov.opz.find(o => /Accetta|Firma|Rinnova|Conferma/i.test(o.txt)) || ov.opz[0]; await page.mouse.click(pick.x, pick.y); await sleep(1000); rec.agente.push({ scelta: pick.txt, d: delta(A2, await snap()) }); } }
  /* Ufficio: trainer +1 (se c'e' il bonifico), un acquisto a rotazione */
  await clickByText(page, '^UFFICIO$', 2500); await sleep(800);
  const U0 = await snap();
  const plus = await evalSafe(page, () => { const b = [...document.querySelectorAll('button')].filter(x => x.offsetParent && (x.innerText || '').trim() === '+')[0]; if (!b) return null; b.click(); return true; }); await sleep(700);
  const U1 = await snap(); rec.ufficio.push({ azione: 'trainer+', clic: plus, d: delta(U0, U1), testo: (await testo(page)).replace(/\n+/g, ' / ').slice(0, 300) });
  const cmp = await evalSafe(page, ([i]) => { const bs = [...document.querySelectorAll('button')].filter(x => x.offsetParent && (x.innerText || '').trim() === 'COMPRA'); const b = bs[i % Math.max(1, bs.length)]; if (!b) return null; b.click(); return bs.length; }, [rot.uf++]); await sleep(900);
  const ovU = await overlay(page); const U2 = await snap(); rec.ufficio.push({ azione: 'compra', clic: cmp, ov: ovU && { t: ovU.testo.slice(0, 400), o: ovU.opz.map(o => o.txt) }, d: delta(U1, U2) });
  if (ovU && ovU.opz.length) { const pick = ovU.opz.find(o => /Conferma|Compra|Acquista|Ok|Sì|Si/i.test(o.txt)) || ovU.opz[0]; await page.mouse.click(pick.x, pick.y); await sleep(900); rec.ufficio.push({ scelta: pick.txt, d: delta(U2, await snap()) }); }
  await clickByText(page, '^HOME$', 2500);
  jl('azioni.jsonl', rec); return rec;
}
