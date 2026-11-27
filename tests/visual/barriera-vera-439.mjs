#!/usr/bin/env node
/* [giro 439 PO-638, decisione PO «Tutte le consigliate» dal giro 343, dubbio 4] guardiano: LA BARRIERA C'E' NEL FLUSSO VERO.
   Partite di carriera vere (sonda-barriera-439: salvataggio save-190-s12-ovr93, autoplay seedato, NOME variato a ogni partita: il
   seme di partita nasce da avversario+stagione+settimana+nome), corpi accesi, teatro acceso. Ogni partita si chiude appena la sua
   prima punizione dell'eroe e' stata letta. Su ogni campione delle fasi di lettura, dai corpi (__CPM_PUN343 + __CPM_STATE, stesse mesh):
     VERDE: almeno 3 punizioni giudicate; in ogni campione almeno 3 in barriera, centro a 9,15 ± 0,3 m dal pallone, scarto del centro
            dalla linea pallone -> centro porta <= 0,5 m, nessun uomo di barriera sotto 9 m, avversari fuori barriera >= 10,15 m; ogni
            scena di lettura col testo «punizione» ha il suo testimone (nessuna punizione senza barriera).
     ROSSO (__CPM_NO_G375 + __CPM_NO_G418 = la barriera di prima): almeno 2 punizioni giudicate e TUTTE storte.
   I nomi sono quelli che nelle misure del giro 439 hanno dato una punizione dell'eroe presto (4'-51'); il seme della partita non e'
   garantito identico fra due esecuzioni (misurato: b439-3 l'ha data al 80' una volta e mai la seconda), quindi i nomi sono cinque
   e ne bastano tre. Una partita senza punizione e' dichiarata; meno di tre giudicate = non giudicato = rosso. */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { partite439, giudica } from './sonda-barriera-439.mjs';
const NOMI = ['b439-0', 'c439-5', 'c439-0', 'c439-3', 'b439-1'], NOMI_R = ['b439-0', 'c439-5', 'c439-0'];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const motivi = [];
console.log('— VERDE —'); const V = await partite439({ b, port, nomi: NOMI, par: 3, cap: 600000, ferma: true });
console.log('— ROSSO (__CPM_NO_G375 + __CPM_NO_G418) —'); const R = await partite439({ b, port, nomi: NOMI_R, rosso: true, par: 3, cap: 600000, ferma: true });
await b.close(); srv.close();
const gv = V.flatMap(r => r.scene.map(sc => ({ nome: r.nome, min: sc.min, ...giudica(sc) })));
for (const r of V) { if (r.err) motivi.push(`${r.nome}: ${r.err}`); if (r.errs) motivi.push(`${r.nome}: ${r.errs} errori di pagina`); for (const t of r.senza || []) motivi.push(`${r.nome} ${t.min}': punizione senza barriera («${t.sit}»)`); }
for (const g of gv) { if (g.ng) motivi.push(`${g.nome} ${g.min}': non giudicata`); else if (g.motivi.length) motivi.push(`${g.nome} ${g.min}': ${g.motivi.join(', ')}`); }
const giudV = gv.filter(g => !g.ng).length; if (giudV < 3) motivi.push(`verde cieco: ${giudV} punizioni giudicate su ${V.length} partite`);
const gr = R.flatMap(r => r.scene.map(giudica)).filter(g => !g.ng), storteR = gr.filter(g => g.motivi.length).length;
if (gr.length < 2) motivi.push(`rosso cieco: ${gr.length} punizioni giudicate`); else if (storteR < gr.length) motivi.push(`il rosso non si vede: ${storteR}/${gr.length} storte`);
console.log(`\nverde: ${giudV} punizioni giudicate in ${V.length} partite vere · rosso: ${storteR}/${gr.length} storte`);
console.log(motivi.length ? '❌ barriera-vera-439 ROSSO: ' + motivi.join(' · ') : '✅ barriera-vera-439 verde: in ogni punizione vera dell\'eroe la barriera c\'e\', a 9,15 m sulla linea, e gli altri a 10,15 m (e il rosso si vede)');
process.exit(motivi.length ? 1 : 0);
