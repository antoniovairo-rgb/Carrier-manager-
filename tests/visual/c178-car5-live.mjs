/* Collaudo carriera 178 n.5 — gioca UNA partita dal vivo come un giocatore: sceglie le opzioni, tocca a tempi diversi, registra tutto. */
import { sleep, jl, evalSafe, fase, punteggio, clickPos, leggiPannello, leggiEsito, statoHL, foto, FOTO, SCR, bottoni } from './c178-car5-lib.mjs';
import fs from 'node:fs'; import path from 'node:path';
const RITARDI = [0.3, 2.0, 0.45, 1.2, 0.2, 2.5, 0.4, 0.8]; /* secondi dall'apertura del pannello: meta' entro 0,5 s, meta' dopo 2 s */
const DIFENSIVA = /contrast|anticip|pressing|ripieg|copert|spazz|chiusur|tackle|intercett|rinvio|respingi|marca|difes|testa.*(difens|allont)|scivol|raddopp|dai.*(addosso)|sbarra/i;
export async function giocaLive(page, ctx) {
  /* ctx: {tag, stagione, settimana, conta:{n}, tmax} */
  const t0 = Date.now(); const tmax = ctx.tmax || 20 * 60 * 1000;
  const rec = { tag: ctx.tag, stag: ctx.stagione, sett: ctx.settimana, hl: [], mister: [], flags: [], fasi: [] };
  let lastPh = null, panelSeen = null, hlN = 0, intro = 0, resDone = false, contAt = null, nullCnt = 0, curr = null;
  const sc0 = await punteggio(page); rec.sc0 = sc0;
  while (Date.now() - t0 < tmax) {
    const ph = await fase(page);
    if (ph !== lastPh) { rec.fasi.push([Math.round((Date.now() - t0) / 100) / 10, ph]); lastPh = ph; if (ph !== 'hl_choose') panelSeen = null; if (ph !== 'hl_result') { resDone = false; contAt = null; } }
    if (ph === 'ended') break;
    if (ph == null) { nullCnt++; if (nullCnt > 60) { rec.flags.push('fase-null-a-lungo'); break; } await sleep(300); continue; } else nullCnt = 0;
    if (ph === 'matchday' || ph === 'formations' || ph === 'walkout') {
      const r = await clickPos(page, '[data-cpm="salta"],[data-cpm="salta-ingresso"]');
      if (!r) { const bs = await bottoni(page); const m = bs.find(b => /Calcio d.?inizio|Inizia|Gioca|Continua|Avanti|Entra/i.test(b)); if (m) { await evalSafe(page, s => { const b = [...document.querySelectorAll('button')].find(x => x.offsetParent && (x.innerText || '').includes(s)); if (b) b.click(); }, m.slice(0, 20)); } }
      await sleep(700); continue;
    }
    if (ph === 'playing') {
      /* scelte del mister/sostituzioni: bottoni diversi dalla barra alta */
      const bs = await bottoni(page); const extra = bs.filter(b => !/^(⏸|▶|[0-9,.]+×|⚠️|STATISTICHE|PAGELLE|▴|▾|PROVINI)/.test(b));
      if (extra.length) {
        const k = (ctx.conta.n++) % extra.length; ctx.misterN = (ctx.misterN || 0) + 1;
        rec.mister.push({ opz: extra, scelta: extra[k] });
        await evalSafe(page, s => { const b = [...document.querySelectorAll('button')].find(x => x.offsetParent && (x.innerText || '').trim().replace(/\s+/g, ' ').startsWith(s)); if (b) b.click(); }, extra[k].slice(0, 25));
        await sleep(900);
      } else await sleep(400);
      continue;
    }
    if (ph === 'hl_intro' || ph === 'hl_move') {
      const r = await clickPos(page, '[data-cpm="scegli"]'); await sleep(r ? 500 : 250); continue;
    }
    if (ph === 'hl_choose') {
      const pan = await leggiPannello(page);
      if (!pan || pan.__err || !pan.righe || !pan.righe.length) { await sleep(60); continue; }
      if (!panelSeen) {
        panelSeen = { t: Date.now(), ready: null }; hlN++;
        const sc = await punteggio(page); const st = await statoHL(page);
        const idx = await evalSafe(page, (opz) => { try { const nz = x => String(x || '').toLowerCase().replace(/[^a-zà-ù]/g, ''); const o = opz.map(nz); const c = []; window.__CPM_SITS.forEach((q, i) => { if (!q.actions || q.actions.length < o.length) return; if (o.every(t => q.actions.some(a => t.startsWith(nz(a.label))))) c.push(i); }); return { idx: c, type: c.length ? window.__CPM_SITS[c[0]].type : null, text: c.length ? window.__CPM_SITS[c[0]].text : null, tutte: [...new Set(c.map(i => window.__CPM_SITS[i].type))] }; } catch (e) { return { err: String(e) }; } }, pan.righe.map(r => r.txt.replace(/\s*\|\s*/g, ' ')));
        curr = { sitIdx: idx && idx.idx, sitType: idx && idx.type, sitText: idx && idx.text, sitTipiPossibili: idx && idx.tutte, n: hlN, stag: ctx.stagione, sett: ctx.settimana, tag: ctx.tag, head: pan.head, opz: pan.righe.map(r => r.txt), sc_prima: sc, act: st && st.act, dis0: pan.righe.map(r => r.dis), op0: pan.righe.map(r => r.op) };
        const nOp = pan.righe.length; const i = ctx.conta.n++;
        /* difensive: se una opzione e' difensiva la preferisce a rotazione; altrimenti rotazione pura */
        const dif = pan.righe.map((r, j) => DIFENSIVA.test(r.txt) || /DIFES|marc|contrasto/i.test(pan.head) ? j : -1).filter(j => j >= 0);
        curr.scelta = (dif.length && i % 2 === 0) ? dif[(i >> 1) % dif.length] : i % nOp;
        curr.ritardo = RITARDI[i % RITARDI.length]; curr.clickDone = false;
      }
      if (pan.righe.every(r => !r.dis) && panelSeen.ready == null) { panelSeen.ready = (Date.now() - panelSeen.t) / 1000; curr.tPronto = panelSeen.ready; }
      const el = (Date.now() - panelSeen.t) / 1000;
      if (!curr.clickDone && el >= curr.ritardo) {
        curr.clickDone = true; curr.tClick = Math.round(el * 100) / 100; curr.disAlClick = pan.righe[curr.scelta].dis;
        const r = await clickPos(page, '[data-cpm="scelte-righe"] button', curr.scelta);
        curr.clickPos = r && { x: Math.round(r.x), y: Math.round(r.y) };
        curr.t1 = Date.now();
        /* registrata? entro 1,6 s la fase deve uscire da hl_choose */
        let reg = false; for (let k = 0; k < 16; k++) { await sleep(100); const p2 = await fase(page); if (p2 !== 'hl_choose') { reg = true; break; } }
        curr.registrata = reg;
        if (!reg) {
          curr.shot = `nonreg-${ctx.tag}-${hlN}`; await foto(page, curr.shot);
          rec.flags.push(`scelta-non-registrata hl${hlN} t=${curr.tClick}s dis=${curr.disAlClick}`);
          /* riprova come farebbe un giocatore: ritocca dopo un secondo */
          await sleep(1000); const r2 = await clickPos(page, '[data-cpm="scelte-righe"] button', curr.scelta); curr.ritocco = !!r2;
          let reg2 = false; for (let k = 0; k < 16; k++) { await sleep(100); if ((await fase(page)) !== 'hl_choose') { reg2 = true; break; } } curr.registrata2 = reg2;
        }
        continue;
      }
      await sleep(40); continue;
    }
    if (ph === 'hl_result') {
      if (curr && !curr.risultato) {
        /* aspetta il riquadro d'esito */
        let es = null; for (let k = 0; k < 60 && !es; k++) { es = await leggiEsito(page); if (!es || es.__err) { es = null; await sleep(150); } }
        if (!es) { curr.esitoAssente = true; curr.shotEsito = `noesito-${ctx.tag}-${hlN}`; await foto(page, curr.shotEsito); curr.testoBody = await evalSafe(page, () => document.body.innerText.replace(/\n+/g, ' / ').slice(0, 400)); rec.flags.push(`esito-assente hl${hlN}`); }
        const st = await statoHL(page); curr.esito = es; curr.stato1 = st; curr.risultato = true;
        await foto(page, `ultimo-esito`);
        await sleep(1200);
        const st2 = await statoHL(page); curr.stato2 = st2;
      }
      /* continua */
      const r = await evalSafe(page, () => { const b = [...document.querySelectorAll('button')].find(x => x.offsetParent && /^Continua/.test((x.innerText || '').trim())); if (!b) return null; const q = b.getBoundingClientRect(); return { x: q.x + q.width / 2, y: q.y + q.height / 2 }; });
      if (r && !r.__err) await page.mouse.click(r.x, r.y);
      await sleep(900);
      const p3 = await fase(page);
      if (p3 !== 'hl_result' && curr && !curr.chiuso) {
        curr.chiuso = true; curr.sc_dopo = await punteggio(page);
        const sc1 = curr.sc_dopo, sc0h = curr.sc_prima; curr.dGolNostri = sc1 && sc0h ? sc1.home - sc0h.home : null; curr.dGolLoro = sc1 && sc0h ? sc1.away - sc0h.away : null;
        const lab = (curr.opz[curr.scelta] || ''); const txt = (curr.esito || '') + ' ' + ((curr.stato1 && curr.stato1.outcome && curr.stato1.outcome.text) || '');
        curr.difensiva = curr.sitType === 'def' || (curr.sitType == null && DIFENSIVA.test(lab));
        if (/senza fallo|puliti?\b/i.test(lab) && /fallo/i.test(txt) && !/senza fallo/i.test(txt)) curr.flag = 'nome-opzione-vs-esito:fallo';
        const kk = curr.stato1 && curr.stato1.outcome && curr.stato1.outcome.key;
        const goalKey = kk === 'goal' || kk === 'goal_header' || kk === 'penalty_goal';
        if (goalKey && curr.dGolNostri === 0) curr.flag = (curr.flag || '') + ' esito-gol-senza-punteggio';
        if (!goalKey && curr.dGolNostri > 0) curr.flag = (curr.flag || '') + ' punteggio-senza-esito-gol';
        jl('hl.jsonl', curr); rec.hl.push(curr); curr = null;
      }
      continue;
    }
    await sleep(300);
  }
  rec.sc1 = await punteggio(page); rec.ms = Date.now() - t0;
  rec.fine = (await fase(page)) === 'ended';
  rec.testoFine = await evalSafe(page, () => document.body.innerText.replace(/\n+/g, ' / ').slice(0, 900));
  return rec;
}
