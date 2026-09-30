#!/usr/bin/env node
/* [7.999.70 guardiano — collaudo Codex 30/09, codice 003 su gi30 «Dribbling centrale e conduci» e gi123 «Giratone e conduci»]
   Azioni d'attacco col premio `recovery`: l'esito pescava i testi del recupero difensivo («Recupero decisivo», «Riaggressione
   immediata») e, sul fallimento, quelli del tiro murato («La difesa mura la conclusione»).
   VERDE → 4/4 casi (2 scene × successo/fallimento) senza testi difensivi o di conclusione, e con un testo da conduzione.
   ROSSO (__CPM_NO_COND70) → almeno 2 casi mostrano il difetto. Uso: node conduzione-70.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv=await startServer();const b=await launchBrowser();
async function run(gi,es,rosso){const p=await b.newPage({viewport:{width:412,height:915}});await installCdnRoutes(p);
 await p.addInitScript(r=>{window.__CPM_PRESENT=1;if(r)window.__CPM_NO_COND70=1;},rosso);
 await openMatch(p,srv.address().port,{skipLoadAll:true,name:'Cond'+gi+es});await sleep(800);
 await p.evaluate(g=>{window.__CPM_FORCE_SIT(g,true);},gi);
 await p.waitForFunction(()=>window.__CPM_PHASE&&window.__CPM_PHASE()==='hl_choose',null,{timeout:30000}).catch(()=>{});await sleep(500);
 await p.evaluate(e=>{window.__CPM_FORCE_OUTCOME=e;window.__CPM_RESOLVE(0);},es);await p.waitForFunction(()=>!/⏳/.test(document.body.innerText),null,{timeout:30000}).catch(()=>{});await sleep(800);
 const t=await p.evaluate(()=>document.body.innerText);const ph=await p.evaluate(()=>window.__CPM_PHASE&&window.__CPM_PHASE());await p.close();
 const bad=/Recupero decisivo|Intercetto perfetto|Palla riconquistata|Letta alla perfezione|Pressing che paga|Riaggressione immediata|Pallone recuperato|Grande intervento|Anticipo perfetto|Muro invalicabile|Intercetto netto|conclusione|Conclusione/.exec(t);
 const good=/Salta l'uomo|Supera il diretto|Dribbling riuscito|lo chiude|Prova la conduzione|Il dribbling non riesce|Dribbling vincente|Salta l'uomo!|Grande giocata|Numero di classe|Che finta|Lo manda al bar|Accelerazione irresistibile|Tunnel di prima|Fermato dall|Dribbling murato|Palla persa nel dribbling|Difesa attenta|Ci prova ma viene chiuso/.exec(t);
 return `${bad?'SBAGLIATO «'+bad[0]+'»':'ok'} · ${good?'conduzione «'+good[0]+'»':'nessun testo di conduzione'}`;}
let okV=0,badR=0;
for(const gi of [30,123])for(const es of ['success','fail']){const v=await run(gi,es,false),r=await run(gi,es,true);console.log(`gi${gi} ${es}: verde ${v} | rosso ${r}`);if(/^ok · conduzione/.test(v))okV++;if(/^SBAGLIATO/.test(r))badR++;}
await b.close();srv.close();
const ok=okV===4&&badR>=2;console.log(ok?`✅ conduzione-70 verde (${okV}/4) e il rosso si vede (${badR}/4)`:`❌ conduzione-70 ROSSO (verde ${okV}/4, rosso ${badR}/4)`);process.exit(ok?0:1);
