/* [giro 417 PO-681] Guardiano «in pausa i comandi della partita non rispondono».
   Verde (gioco com'e'), su PC 1920x1080 e telefono 390x844, GLB acceso:
     A  in pausa, N clic veri + N clic da DOM (Invio/Spazio su un tasto a fuoco) + tasti 1/2/3/Invio/Spazio: 0 scelte eseguite;
     B  i tasti delle scelte in pausa sono spenti: aria-disabled="true", opacita' <= 0,5, pointer-events none;
     C  dopo la ripresa un clic sulla scelta la esegue (la scelta in corso non e' persa);
     D  in pausa il tasto della velocita' e' spento e non cambia la velocita';
     E  il tasto di pausa della barra resta vivo (non spento) e riprende.
   Rosso (window.__CPM_NO_G417, solo PC): deve tornare il difetto della foto del PO — la scelta si esegue in pausa.
   «Non giudicato» (scena mai raggiunta, nessun tasto di scelta trovato, nessun tentativo) = ROSSO. Uscita 0 solo se verde E rosso tornano.
   CPM_SOLO=verde|rosso per un braccio solo (diagnosi; il guardiano vuole entrambi). */
import { misura417 } from './misura-417.mjs';
const SOLO = process.env.CPM_SOLO || '';
const ko = [], log = s => console.log(s);
const giudicaVerde = (r, tag) => {
  if (!r) return ko.push(`${tag}: non giudicato (nessuna misura)`);
  if (r.err) return ko.push(`${tag}: non giudicato (${r.err})`);
  if (r.errs && r.errs.length) ko.push(`${tag}: errori di pagina ${JSON.stringify(r.errs)}`);
  if (!r.inPausa || !r.inPausa.length) return ko.push(`${tag}: non giudicato, nessun tasto di scelta in pausa`);
  const A = r.A || {}; const t = A.tent || {}; const n = (t.mouse || 0) + (t.dom || 0) + (t.tast || 0);
  if (n < 10) ko.push(`${tag}: non giudicato, solo ${n} tentativi in pausa`);
  const es = (A.eseguiteMouse || 0) + (A.eseguiteDom || 0) + (A.eseguiteTast || 0);
  if (es) ko.push(`${tag} A: ${es} scelte ESEGUITE in pausa su ${n} tentativi`);
  if (!A.ancoraPausa) ko.push(`${tag} A: la pausa si e' tolta da sola durante i tentativi`);
  for (const s of r.inPausa) { if (s.ad !== 'true' || s.op > 0.5 || s.pe !== 'none') ko.push(`${tag} B: «${s.t}» non spento in pausa (aria-disabled ${s.ad}, opacita' ${s.op}, pointer-events ${s.pe})`); }
  if (!r.C || !r.C.eseguita) ko.push(`${tag} C: dopo la ripresa la scelta non parte (${JSON.stringify(r.C)})`);
  if ((r.dopo || []).some(s => s.ad === 'true' || s.op < 0.9)) ko.push(`${tag} C: dopo la ripresa i tasti restano spenti`);
  const D = r.D || {}; if (D.fase !== 'playing' || !D.tasto) ko.push(`${tag} D: non giudicato (${JSON.stringify(D)})`); else { if (D.cambiata) ko.push(`${tag} D: la velocita' cambia in pausa`); if (D.tasto.ad !== 'true') ko.push(`${tag} D: tasto velocita' non spento in pausa`); }
  const E = r.E || {}; if (!E.tasto) ko.push(`${tag} E: non giudicato, tasto di pausa non trovato`); else { if (E.ad === 'true') ko.push(`${tag} E: tasto di pausa spento`); if (!E.ripresa) ko.push(`${tag} E: il tasto di pausa non riprende`); }
};
if (SOLO !== 'rosso') {
  const v = await misura417({ log: s => log('[verde] ' + s.slice(0, 400)) });
  giudicaVerde(v.pc, 'verde PC'); giudicaVerde(v.tel, 'verde telefono');
  for (const [k, r] of Object.entries(v)) { if (r && r.A) log(`[verde ${k}] in pausa: ${((r.A.eseguiteMouse||0)+(r.A.eseguiteDom||0)+(r.A.eseguiteTast||0))} eseguite su ${(r.A.tent.mouse||0)+(r.A.tent.dom||0)+(r.A.tent.tast||0)} tentativi · ripresa: ${r.C && r.C.eseguita ? 'scelta eseguita' : 'NO'} · velocita' cambiata in pausa: ${r.D && r.D.cambiata}`); }
}
if (SOLO !== 'verde') {
  const rr = await misura417({ rosso: true, misure: [[1920, 1080, 'pc']], log: s => log('[rosso] ' + s.slice(0, 400)) });
  const r = rr.pc; const A = (r && r.A) || {}; const es = (A.eseguiteMouse || 0) + (A.eseguiteDom || 0) + (A.eseguiteTast || 0);
  if (!r || r.err || !(r.inPausa || []).length) ko.push(`rosso: non giudicato (${r && r.err})`);
  else if (!es) ko.push('rosso: col rimedio spento la scelta NON si esegue in pausa — il guardiano non distingue');
  else log(`[rosso] col rimedio spento: ${es} scelta eseguita in pausa (atteso: difetto della foto del PO)`);
}
log(ko.length ? `❌ pausa-417 ROSSO\n - ${ko.join('\n - ')}` : '✅ pausa-417 VERDE (verde 0 scelte in pausa su PC e telefono, ripresa ok · rosso riproduce il difetto)');
process.exit(ko.length ? 1 : 0);
