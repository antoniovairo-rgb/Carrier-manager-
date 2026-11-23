#!/usr/bin/env node
/* [7.999.144 PO-123, decisione PO 06/10 «al massimo il 30% fermi prima dell'azione»] GUARDIANO: sonda hl-credibilita (flusso vero, teatro
   acceso, tempo di scena); nelle fasi prima dell'azione (hl_intro, hl_move, hl_choose) la quota di compagni e di avversari fermi (sotto
   0,5 m/s) entro 35 m dal pallone. VERDE: entrambe <= 25%. ROSSO (__CPM_NO_ATTIVI147, il respiro di prima): entrambe >= 30%.
   [giro 331 · PO-610] RIPARATO LO STRUMENTO, soglie invariate. MISURATO (banco e treni 199/201): il guardiano raccoglieva per 150 s di
   OROLOGIO a partita, due partite per braccio, e pretendeva 100 campioni: ne trovava 28-77 (treni) e 4-55 (banco) e usciva rosso per
   cecita' in tutti e due i bracci; con 55-77 campioni la quota del verde ballava fra 12 e 22. Ora:
     · si raccoglie A EVENTO: una partita alla volta, seguita fino al fischio finale, finche' i due bracci hanno almeno CAMPIONI campioni
       di compagni e di avversari (tetto MAX_PARTITE partite per braccio; sotto MINIMO = «non giudicato» = rosso);
     · i campioni li prende un registratore dentro la pagina (CPM_IN_PAGINA), non un viaggio node↔pagina ogni 110 ms;
     · la velocita' di un corpo si misura su una base FISSA di tempo di scena (BASE s), non fra due campioni a intervallo variabile;
     · IL TEMPO DI SCENA E' AGGANCIATO ALL'OROLOGIO (__CPM_DTREAL, rapporto scena/orologio = 1, stampato come `scenaSuReale`). MISURATO:
       l'attesa attiva si muove sull'OROLOGIO (sin(now·0,0016)), la velocita' si misurava sul tempo di SCENA, che in headless scorre a una
       frazione dell'orologio diversa da macchina a macchina (banco 0,5-0,8). Stesse partite, stesso codice: compagni fermi 21% a rapporto
       0,5 e 27-30% a rapporto 1; nel braccio rosso 57-77% e 65-86%. A rapporto 1 la misura e' quella che vede chi gioca a 20 fotogrammi
       al secondo o piu', e non dipende dalla macchina.
   ⚠️ ESITO DEL GIRO 331: con lo strumento riparato il braccio verde sta a 27-30% di compagni fermi contro il tetto 25 (avversari 19-21%):
   un moto avanti-e-indietro passa dallo zero di velocita' due volte per giro e sta sotto 0,5 m/s per circa il 22% del tempo PER COSTRUZIONE.
   Non e' piu' un guardiano instabile: e' un rosso vero e ripetibile, dichiarato in ROSSI-DICHIARATI e portato al PO (RAPPORTO-giro331).
   RIPETIZIONE DICHIARATA: da 1 a MAX_PARTITE partite per braccio, tutte contate insieme; verde = le due quote del braccio verde <= 25 e
   le due del braccio rosso >= 30 sull'INSIEME dei campioni. I due bracci girano insieme (due pagine).
   Uso: node movimento-147.mjs   · CPM_SOLO=verde|rosso (solo misura, esce 0) */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
const xf = promisify(execFile);
const CAMPIONI = +(process.env.CPM_CAMPIONI || 180), MINIMO = 100, MAX_PARTITE = +(process.env.CPM_MAX_PARTITE || 4), BASE = process.env.CPM_BASE || '0.3';
const SOLO = process.env.CPM_SOLO || '';
fs.mkdirSync('out', { recursive: true });
async function braccio(rosso, nome = rosso ? 'rosso' : 'verde', gancio = rosso ? '__CPM_NO_ATTIVI147' : '') { const files = []; let a = null, partite = [];
  for (let k = 0; k < MAX_PARTITE; k++) { const out = `out/movimento-147-${nome}-${k}.json`;
    try { await xf(process.execPath, ['hl-credibilita.mjs'], { env: { ...process.env, CPM_PARTITE: '1', CPM_K0: String(k), CPM_OUT: out, CPM_IN_PAGINA: '1', CPM_FINO_FINE: '1', CPM_DTREAL: process.env.CPM_SENZA_DTREAL ? '' : '1', CPM_MS: '600000', CPM_ROSSO: gancio }, timeout: 700000, maxBuffer: 1 << 24 }); }
    catch (e) { partite.push({ k, errore: String(e && e.message || e).slice(0, 120) }); continue; }
    files.push(out); try { partite.push(JSON.parse(fs.readFileSync(out + '.esiti.json'))[0]); } catch (e) {}
    a = JSON.parse((await xf(process.execPath, ['hl-credibilita-analisi.mjs', ...files], { env: { ...process.env, CPM_BASE_SCENA: BASE }, maxBuffer: 1 << 26 })).stdout).primaAzione;
    console.log(`  ${nome} dopo ${files.length} partite: ${JSON.stringify(a)}`);
    if (a.campioniCompagni >= CAMPIONI && a.campioniAvversari >= CAMPIONI) break; }
  return { ...(a || { compagniFermi: null, avversariFermi: null, campioniCompagni: 0, campioniAvversari: 0 }), partite: files.length, esiti: partite.map(p => p.errore ? `${p.k}:errore` : `${p.k}:${p.fine}/${p.s}s`).join(' ') }; }
/* [giro 334] CPM_SOLO=prima334: misura il braccio «avanti-e-indietro di prima» (__CPM_NO_G334) accanto al verde, senza giudicare */
if (SOLO === 'prima334') { const [a, b] = await Promise.all([braccio(false), braccio(false, 'prima334', '__CPM_NO_G334')]); console.log('verde ' + JSON.stringify(a)); console.log('prima334 ' + JSON.stringify(b)); process.exit(0); }
const [V, R] = await Promise.all([SOLO === 'rosso' ? null : braccio(false), SOLO === 'verde' ? null : braccio(true)]);
if (V) console.log('verde ' + JSON.stringify(V)); if (R) console.log('rosso ' + JSON.stringify(R));
if (SOLO) process.exit(0);
const g = [];
const cieco = x => !(x.campioniCompagni >= MINIMO && x.campioniAvversari >= MINIMO);
if (cieco(V)) g.push(`verde: non giudicato — campioni ${V.campioniCompagni}/${V.campioniAvversari} sotto ${MINIMO} dopo ${V.partite} partite`);
else if (!(V.compagniFermi <= 25 && V.avversariFermi <= 25)) g.push(`verde: troppi fermi prima dell'azione (compagni ${V.compagniFermi}%, avversari ${V.avversariFermi}%, tetto 25)`);
if (cieco(R)) g.push(`rosso: non giudicato — campioni ${R.campioniCompagni}/${R.campioniAvversari} sotto ${MINIMO} dopo ${R.partite} partite`);
else if (!(R.compagniFermi >= 30 && R.avversariFermi >= 30)) g.push(`rosso: il respiro di prima non si vede (compagni ${R.compagniFermi}%, avversari ${R.avversariFermi}%, minimo 30)`);
if (g.length) { console.log('❌ movimento-147 — ' + g.join(' · ')); process.exit(1); }
console.log(`✅ movimento-147 verde (fermi: compagni ${V.compagniFermi}%, avversari ${V.avversariFermi}% su ${V.campioniCompagni}/${V.campioniAvversari} campioni) e il rosso si vede (${R.compagniFermi}% / ${R.avversariFermi}% su ${R.campioniCompagni}/${R.campioniAvversari})`);
