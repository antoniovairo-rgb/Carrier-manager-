/* ========================================================================
 * KORWARD ELITE — frammento n° 14  (dei 20, numerati da 00 a 19)
 * src/14-live-match.jsx
 *
 * LiveMatch — IL MOTORE DELLA PARTITA
 *
 * Il metronomo (MATCH_TICK_MS, MATCH_SPEEDS) col suo diario di taratura e il componente
 * LiveMatch per intero (originale r.19215-24670): orologio, cronaca, highlight,
 * situazioni, ordini del mister, sostituzioni, cartellini, statistiche, fine gara.
 * ⚠ È UN SOLO componente da ~5.400 righe con 113 useRef e 75 useState: questo
 * frangimento lo ISOLA, non riduce lo stato condiviso via chiusura. Vedi src/README.md.
 *
 * ----------------------------------------------------------------------
 * RIGHE DELL'ORIGINALE: 19169-24671   ·   5503 righe di 41427
 * La prima riga dopo questa intestazione è la riga 19169 di CARRIER-MANAGER-AV.html.
 * CONVERSIONE: riga N di questo file  =  riga N + 19143 del file generato.
 *
 * NON si modifica CARRIER-MANAGER-AV.html: è GENERATO. Si modifica QUESTO file,
 * poi si esegue `node tools/build-src.mjs`. La prova che nulla è cambiato per
 * sbaglio è `node tools/check-src.mjs`: il ricomposto deve essere identico byte
 * per byte. La riga qui sotto chiude l'intestazione — la build taglia tutto fino
 * a essa compresa, ed è per questo che il risultato torna identico.
 * ========================================================================
 */
/* CMAV-SRC-HEADER-END */
/* [7.662.0 — L2 DELLA LIBRERIA AZIONI SALIENTI: IL COMPOSITORE, DIETRO IL VETRO.
   Direttiva PO 29/08 («libreria ampia, mai ripetitiva») → docs/LIBRERIA-AZIONI-SALIENTI.md +
   docs/MODULI-AZIONI-SALIENTI.md (le 58 schede). Questo blocco e' il MOTORE DI COMPOSIZIONE:
   dato un seme e il registro anti-ripetizione, cammina il grafo degli SBOCCHI (identico
   all'enumeratore tools/enumera-strutture.mjs: 418 sequenze, 587 con corsie) e produce una
   STRUTTURA (catena di moduli + corsia). E' INERTE PER IL GIOCATORE: nessun percorso di
   partita lo chiama — si raggiunge solo dall'hook di test __CPM_LIB_COMPOSE (cpmtest), che
   serve alla sonda dei metri (deja-vu, classi, copertura). Deterministico: hash FNV, zero
   Math.random. L'aggancio alla partita vera arriva in L5, a metri verdi, col suo rosso. */
const LIB662={
  C1:{cl:0,s:["C3","C5","C6","A4"],z:'retreat',zi:'defend_goal'},C2:{cl:1,s:["A4","F1","F7","T6"],z:'midfield',zi:'retreat'},C3:{cl:0,s:["C4","C5","A3","A4"],z:'midfield',zi:'midfield'},
  C4:{cl:0,fa:1,s:["F2","F1","F4","F8"],z:'attack',zi:'midfield'},C5:{cl:0,s:["A1","A3","A5","Z1"],z:'attack',zi:'midfield'},C6:{cl:0,fa:1,s:["F1","F3","F8","D6"],z:'attack',zi:'retreat'},
  C7:{cl:0,s:["C1","C3","C4"],z:'retreat',zi:'attack'},C8:{cl:1,s:["A3","A7","C4"],z:'midfield',zi:'retreat'},
  A1:{cl:0,s:["Z2","Z4","D7","A8"],z:'attack_goal',zi:'attack'},A2:{cl:0,s:["A7","Z1","Z2","F4"],z:'attack',zi:'midfield'},A3:{cl:0,s:["A7","Z1","Z4","D1"],z:'attack',zi:'midfield'},
  A4:{cl:0,s:["A6","D6","A8"],z:'attack',zi:'midfield'},A5:{cl:0,s:["Z3","Z6","D7"],z:'attack_goal',zi:'attack'},A6:{cl:0,s:["Z2","A8","D4"],z:'attack_goal',zi:'attack'},
  A7:{cl:0,s:["Z4","Z6","D7"],z:'attack_goal',zi:'attack'},A8:{cl:1,s:["Z4","Z6","Z3"],z:'attack_goal',zi:'attack'},
  F1:{cl:0,fa:1,s:["F4","F5","F6"],z:'attack',zi:'attack'},F2:{cl:0,fa:1,s:["D1","D2"],z:'attack',zi:'attack'},F3:{cl:1,fa:1,s:["F4","F6"],z:'attack',zi:'attack'},
  F4:{cl:0,fa:1,t:1,s:[],z:'attack_goal',zi:'attack'},F5:{cl:0,fa:1,t:1,s:[],z:'attack_goal',zi:'attack'},F6:{cl:1,fa:1,s:["Z2","Z3"],z:'attack_goal',zi:'attack'},
  F7:{cl:0,fa:1,s:["F1","F2","F4"],z:'attack',zi:'attack'},F8:{cl:1,fa:1,s:["Z1","A1","F1"],z:'attack_goal',zi:'attack'},
  T1:{cl:2,s:["D4"],z:'attack_goal',zi:'retreat'},T2:{cl:1,s:["Z1","Z2","A1"],z:'attack',zi:'attack'},T3:{cl:0,s:["A2","A7","F7"],z:'attack',zi:'midfield'},
  T4:{cl:1,s:["T1","A2","F4"],z:'midfield',zi:'defend_goal'},T5:{cl:1,t:1,s:[],z:'defend_goal',zi:'attack'},T6:{cl:1,s:["A7","Z4","F4"],z:'attack',zi:'midfield'},T7:{cl:1,s:["T1","A2","F4"],z:'midfield',zi:'defend_goal'},
  D1:{cl:0,s:["Z4","F4","F6","A1"],z:'attack',zi:'attack'},D2:{cl:0,t:1,s:[],z:'midfield',zi:'attack'},D3:{cl:0,s:["T3"],z:'midfield',zi:'midfield'},D4:{cl:1,s:["Z4","Z6"],z:'attack_goal',zi:'attack'},
  D5:{cl:0,s:["Z5","A6","Z7"],z:'attack_goal',zi:'attack_goal'},D6:{cl:0,s:["A6","C7","D7"],z:'attack',zi:'attack'},D7:{cl:0,s:["P1","P2","P3","P8"],z:'attack',zi:'attack'},D8:{cl:0,t:1,s:[],z:'retreat',zi:'retreat'},
  Z1:{cl:0,t:1,s:[],z:'attack_goal',zi:'attack'},Z2:{cl:0,t:1,s:[],z:'attack_goal',zi:'attack_goal'},Z3:{cl:1,t:1,s:[],z:'attack_goal',zi:'attack_goal'},Z4:{cl:0,t:1,s:[],z:'attack_goal',zi:'attack_goal'},Z5:{cl:0,t:1,s:[],z:'attack_goal',zi:'attack_goal'},
  Z6:{cl:1,t:1,s:[],z:'attack_goal',zi:'attack_goal'},Z7:{cl:0,s:["Z2","Z6","P7"],z:'attack_goal',zi:'attack_goal'},Z8:{cl:2,s:["Z7"],z:'attack_goal',zi:'attack_goal'},Z9:{cl:1,s:["P4","P5","P6","T7"],z:'attack_goal',zi:'attack_goal'},Z10:{cl:9,t:1,s:[],z:'attack_goal',zi:'attack_goal'},
  P1:{cl:2,t:1,s:[],z:'attack_goal',zi:'attack_goal'},P2:{cl:1,t:1,s:[],z:'attack',zi:'attack'},P3:{cl:0,s:["D5"],z:'attack_goal',zi:'attack'},P4:{cl:1,fa:1,s:["F4","F5","F6"],z:'attack_goal',zi:'attack_goal'},
  P5:{cl:0,s:["D5"],z:'attack_goal',zi:'attack_goal'},P6:{cl:1,s:["Z1"],z:'attack_goal',zi:'attack_goal'},P7:{cl:1,s:["Z6","D8","D7"],z:'attack_goal',zi:'attack_goal'},P8:{cl:2,t:1,s:[],z:'attack_goal',zi:'attack_goal'},
};
const LIB662_START=["C1","C2","C3","C4","C5","C6","C7","C8","T1","T2","T3","T4","T6","T7","P1","P2","P3","P4","P5","P6","P8"];
const _libH662=(str)=>{let h=2166136261>>>0;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}/* [7.664.0] FINALIZZAZIONE A VALANGA: FNV-1a lascia CORRELATI i bit bassi fra semi quasi identici ("...|es0" vs "...|es1"), e il selettore usa proprio quelli (modulo 100000) — misurato: 2 esiti distinti su 8 tiri sulla stessa struttura, dove la tabella ne offriva quattro. Tre passate di mescola e i bit bassi diventano indipendenti; resta deterministico. */h^=h>>>16;h=Math.imul(h,2246822507);h^=h>>>13;h=Math.imul(h,3266489909);h^=h>>>16;return h>>>0;};
/* reg = { partita: [strutture di QUESTA partita], recenti: [array per partita, 0=la piu' recente] }
   Regole del §5 della libreria: stessa struttura mai 2 volte in partita; penalita' 0,15/0,4/0,7
   sulle ultime 3 partite; penalita' di PREFISSO (primi 2 moduli) dentro la partita (x0,4). */
/* [L3] IL CONTESTO COMANDA (§3 della libreria): ctx={stile,blocco,pressingLoro,dominio,mn,diff}.
   Le condizioni DURE azzerano (C3 senza dominio; C3 sotto di 2 dopo l'80'; T1 senza avversario
   sbilanciato); gli stili RIPESANO le categorie nel verso delle schede. Direzione misurata dalla
   sonda lib663 (banda: per ogni stile, la sua categoria di firma cresce vs equilibrato). */
function _libCtxW662(id,ctx){if(!ctx)return 1;const m=LIB662[id];let w=1;const cat=id[0];
  const st=ctx.stile||"equilibrato";
  if(st==="possesso"){if(id==="C1"||id==="C3"||id==="C5"||id==="C7"||id==="P4")w*=2.2;if(cat==="T")w*=0.55;}
  else if(st==="fasce"){if(cat==="F"||id==="C4"||id==="C6")w*=2.2;}
  else if(st==="diretta"){if(id==="A4"||id==="T7"||id==="C8"||id==="A6")w*=2.2;if(id==="C3")w*=0.5;}
  else if(st==="contropiede"){if(cat==="T")w*=2.5;if(id==="C3"||id==="C7")w*=0.45;}
  if(ctx.blocco){if(id==="Z1"||id==="P6")w*=3;if(cat==="P")w*=1.4;if(id==="A7"||id==="T1")w*=0.3;}
  if(ctx.pressingLoro){if(id==="C2")w*=3;if(id==="T6")w*=2;if(id==="T2")w*=0.6;}
  if(id==="C3"&&((ctx.dominio!=null&&ctx.dominio<1)||((ctx.mn||0)>80&&(ctx.diff!=null&&ctx.diff<=-2))))return 0;
  if(id==="T1"&&ctx.dominio!=null&&ctx.dominio>0&&!ctx.pressingLoro)w*=0.35;
  return w;}
function libCompose662(seme,reg,ctx){
  reg=reg||{partita:[],recenti:[]};
  /* [metro deja-vu §10: ZERO ripetizioni su 4 partite consecutive, nessuna struttura >2 su 10.
     Una penalita' probabilistica non puo' GARANTIRE lo zero (misurato: 2 violazioni su 10 partite
     sonda): le ultime 3 partite escludono DURO, e oltre vale un tetto di 2 occorrenze sulle
     ultime 9 — le bande diventano vere per costruzione, non per fortuna. */
  const _pen=(sig)=>{if((reg.partita||[]).includes(sig))return 0;
    const _r=reg.recenti||[];for(let k=0;k<Math.min(3,_r.length);k++){if((_r[k]||[]).includes(sig))return 0;}
    let _occ=0;for(let k=0;k<Math.min(9,_r.length);k++){if((_r[k]||[]).includes(sig))_occ++;}
    if(_occ>=2)return 0;
    return _occ?0.5:1;};
  const _pesoCl=[1,0.32,0.15,0.04];
  /* [7.669.0] L'AZIONE NASCE DOVE STA IL PALLONE. Le due misure contrarie del 7.666/7.667 (fondatezza
     74,5 -> 56,3 -> 32,9%) hanno un'unica radice: la struttura si sceglieva senza guardare il campo, e
     poi il racconto chiedeva al pallone di essere altrove. Qui l'innesco si filtra sulla ZONA CORRENTE:
     se in quella zona nessun modulo puo' aprire, non si apre nessuna azione — meglio tacere che mentire. */
  const _start669=(ctx&&ctx.zona)?LIB662_START.filter(id=>LIB662[id].zi===ctx.zona):LIB662_START;
  if(!_start669.length)return null;/* [7.664.0] ritarato dopo la valanga dell'hash e la chiusura sui terminali: la quota dei COMUNI era scesa al 48% (banda 50-70) */
  for(let tent=0;tent<10;tent++){
    const _salt=seme+"#"+tent;
    const _pick=(cands,salt2,path)=>{const _pref=path.length===1?path[0]+">":null;
      const w=cands.map(id=>{const m=LIB662[id];let x=(_pesoCl[Math.min(m.cl,3)]||0.02)*_libCtxW662(id,ctx);
        if(_pref&&(reg.partita||[]).some(s2=>s2.startsWith(_pref+id)))x*=0.4;/* prefisso gia' visto in partita */
        return x;});
      let tot=0;for(const x of w)tot+=x;if(tot<=0)return cands[0];
      let r=(_libH662(_salt+"|"+salt2)%100000)/100000*tot;
      for(let i=0;i<cands.length;i++){r-=w[i];if(r<=0)return cands[i];}return cands[cands.length-1];};
    let cur=_pick(_start669,"start",[]);const path=[cur];
    while(path.length<5&&!LIB662[cur].t){let nxt=(LIB662[cur].s||[]).filter(id=>!path.includes(id));
      if(!nxt.length)break;
      /* [7.664.0] L'AZIONE DEVE CHIUDERSI. Sei strutture su cinquanta finivano su un nodo di passaggio
         (niente tabella d'esito = azione senza finale): all'ultimo passo utile si scelgono SOLO gli
         sbocchi terminali, se ce ne sono. Nessuna banda toccata, una regola in piu'. */
      if(path.length>=4){const _t=nxt.filter(id=>LIB662[id].t);if(_t.length)nxt=_t;}
      cur=_pick(nxt,"n"+path.length,path);path.push(cur);}
    if(path.length<2||!LIB662[cur].t)continue;/* catena monca o senza finale: si ritenta col sale */
    const corsia=path.some(id=>LIB662[id].fa)?((_libH662(_salt+"|lato")%2)?"dx":"sx"):null;
    const sig=path.join(">")+(corsia?"|"+corsia:"");
    if(_pen(sig)===0)continue;/* gia' vista in partita: MAI due volte (regola dura) */
    if(_pen(sig)<1&&(_libH662(_salt+"|rec")%100)/100>_pen(sig))continue;/* penalita' recenti */
    return {sig,path,corsia,cls:Math.max(...path.map(id=>Math.min(LIB662[id].cl,3)))};
  }
  return null;/* dieci tentativi respinti dall'anti-ripetizione: il chiamante allarga il registro */
}
if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{window.__CPM_LIB_COMPOSE=libCompose662;window.__CPM_LIB_GRAFO=LIB662;}catch(_e){}}
/* [7.664.0 — L4 DELLA LIBRERIA: I BEAT E I BRANCH. La grammatica smette di essere solo una
   sequenza di sigle e diventa CRONACA: ogni modulo porta le sue battute scritte a mano (dalle
   schede di docs/MODULI-AZIONI-SALIENTI.md) coi segnaposto dei ruoli, e ogni FINALIZZAZIONE
   porta la sua tabella di esiti pesata sul contesto — l'esito non e' mai annunciato prima, e
   il GOL entra in tabella SOLO se il budget del microsim lo ha ordinato (autorita' intoccabile).
   Ogni esito NOMINA la sua conseguenza: la riga dopo la raccoglie, mai un applauso generico.
   Sempre dietro il vetro: si raggiunge solo da __CPM_LIB_RENDER (cpmtest). */
/* [7.669.0 — LE SCHEDE DELLE INTERAZIONI (EROE PROTAGONISTA). Direttiva PO: «niente frasi generiche
   ripetute: contesto, varieta', personalita', conseguenze, memoria, impatto». Ogni scheda dichiara
   QUANDO puo' uscire (cond, sullo stato vero della partita), COSA dice, e la CONSEGUENZA che lascia
   nello stato — cosi' il seguito cambia davvero e non e' solo una battuta. Tre famiglie piu' le
   iniziative dell'eroe; l'anti-ripetizione e' sulla SITUAZIONE, non sulla frase (§4 della proposta):
   una scheda gia' uscita non torna, e fra due interazioni passano almeno dodici minuti. */
/* [7.719.0 collaudo PO «il compagno che segna al tiro successivo ma non e' vero!» — REGOLA DURA,
   direttiva §13 «la telecronaca non inventa il calcio» + autorita' del microsim sul punteggio]
   NESSUN TESTO DI SCHEDA PUO' AFFERMARE UN FATTO DI PARTITA CHE IL MOTORE NON PRODUCE: niente gol
   raccontati («la mette dentro»), niente cartellini o recuperi decretati, niente sostituzioni o
   cambi modulo («esce a testa alta» con l'eroe che resta in campo!), niente azioni concluse e
   CONTATE («due volte di fila», «alla terza gliela danno», «lo fanno davvero»). Censite e
   riscritte VENTI affermazioni falsificabili su 38 schede: il testo racconta il gesto e
   l'intenzione, il campo racconta il resto. Le promesse vere (er_sprona#0, co_inc#0) ora si
   ARMANO nello stato e la cronaca le richiama SOLO se il punteggio le mantiene (watcher 719,
   rosso __CPM_NO719). Le premesse delle schede-eco (lo spazio che si apre, lo schema che
   funziona) restano narrazione NON ancorata allo stato: le aggancera' la Fase 6B, qui a verbale. */
const INTX669=[
 /* [7.669.0 v2 — MISURATO: una sola interazione a partita contro la banda 2-4, perche' quasi tutte
    le schede aspettavano che l'eroe avesse gia' inciso (duelli, occasioni). Ma una partita ha momenti
    suoi anche prima: la consegna tattica, la parola all'intervallo, la tensione che sale nel finale.
    Queste vivono sul MOMENTO della gara — restano contestuali, non generiche. */
 /* [7.682.0 — MISURATO: SEI SCHEDE SU DICIANNOVE, E LA STESSA APRIVA SETTE PARTITE SU OTTO.
    Censimento su 8 partite seedate con scelte casuali: 24 scelte, 6 schede distinte, 13 mai uscite,
    e tre coppie (scheda, ramo) ripetute CINQUE volte — «mi_cons#1», «co_pal#0», «co_disc#0». La causa
    non e' la selezione ma il PANIERE: nella finestra d'apertura (18-34') l'unica scheda eleggibile
    era una, perche' tutte le altre aspettano contatori che si riempiono giocando (duelli, occasioni
    fallite, giocate riuscite). Con il tetto di tre a partita, le prime eleggibili si prendevano tutti
    gli slot. Queste NOVE schede vivono sul MOMENTO della gara — l'inizio, l'intervallo, il finale,
    il punteggio, il pubblico — e non chiedono nessun contatore: sono quelle che aprono il paniere.
    Restano contestuali: ognuna sa in che minuto e con che risultato si sta giocando. */
 /* [7.689.0 direttiva PO, due richieste in una: «le interazioni in telecronaca sono ripetitive, devono
    essere collegate anche alle indicazioni del mister» e «l eroe deve spronare anche i compagni in base
    alle situazioni». Le prime ventotto schede avevano due buchi che il PO ha visto subito: (1) ogni
    momento era un ISOLA — la consegna del mister non tornava mai, qualunque cosa il giocatore avesse
    scelto, e tre momenti scollegati si assomigliano tutti; (2) le schede COMPAGNI erano quasi tutte
    «loro parlano a te», mancava il verso opposto, l eroe che carica il gruppo. Queste dieci chiudono
    entrambi: le prime cinque RISPONDONO a una scelta gia' fatta (`c.scelto`), le altre cinque sono
    l eroe che si rivolge alla squadra a seconda di come sta andando. */
 {id:"mi_eco1",fam:"MISTER",cond:c=>c.mn>=34&&c.scelto("mi_cons",0),
  txt:c=>"\ud83d\udce3 Quello spazio si apre davvero: il mister indica di nuovo la fascia e batte le mani. «Adesso ci sei.»",cons:{fiducia:1},
  sc:[{et:"Ci vado ancora",es:c=>c.eroe+" ci torna appena la palla gira: il terzino avversario comincia a guardarsi le spalle.",cons:{zona:1,coinv:1}},{et:"Adesso mi aspettano",es:c=>c.eroe+" legge che l hanno capito e cambia zona: il mister annuisce, e' la lettura giusta.",cons:{zona:1,fiducia:1}},{et:"Chiamo un compagno li'",es:c=>c.eroe+" manda un compagno in quello spazio e resta lui a dare l appoggio: due teste sulla stessa idea.",cons:{intesa:2}}]},
 {id:"mi_eco2",fam:"MISTER",cond:c=>c.mn>=40&&c.scelto("mi_cons",1),
  txt:c=>"\ud83d\udce3 Il mister non ha dimenticato: lo richiama a bordo campo e stavolta non chiede, dice. «Quella zona. Ora.»",cons:{},
  sc:[{et:"Va bene, ci vado",es:c=>c.eroe+" esegue senza discutere: la panchina si rilassa e il pallone comincia ad arrivargli.",cons:{fiducia:2,coinv:1}},{et:"Gli spiego cosa vedo",es:c=>c.eroe+" indica il campo e spiega perche' non funziona: il mister ascolta, poi cambia lui l indicazione.",cons:{fiducia:1,intesa:1}},{et:"Faccio finta di niente",es:c=>c.eroe+" torna in campo senza rispondere. Alla panchina non e' sfuggito.",cons:{fiducia:-2,coinv:1}}]},
 {id:"co_eco1",fam:"COMPAGNI",cond:c=>c.mn>=50&&c.scelto("co_int",0),
  txt:c=>"\ud83e\udd1d Lo schema concordato funziona: "+c.compagno+" taglia dentro e trova "+c.eroe+" largo, esattamente come si erano detti.",cons:{intesa:1},
  sc:[{et:"Rifacciamolo",es:c=>"Se lo tengono in tasca per la prossima palla buona: gli avversari ancora non l'hanno letto.",cons:{intesa:2,coinv:1}},{et:"Cambiamo, ci hanno capito",es:c=>"Invertono i ruoli al volo: stavolta e' "+c.eroe+" a tagliare dentro.",cons:{zona:1,intesa:1}},{et:"Basta cosi', giochiamo semplice",es:c=>"Tornano al gioco semplice: meno spettacolo, meno rischi.",cons:{fiducia:1}}]},
 {id:"av_eco1",fam:"AVVERSARI",cond:c=>c.mn>=55&&(c.scelto("av_pres",1)||c.scelto("av_pro",1)),
  txt:c=>"\ud83d\ude20 Il difensore non ha dimenticato lo scambio di prima: entra durissimo sul primo pallone e si prende la predica dell arbitro, a un passo dal giallo.",cons:{marcatura:1},
  sc:[{et:"Lo guardo e basta",es:c=>c.eroe+" si rialza e lo fissa in silenzio: adesso e' l altro a dover stare attento.",cons:{fiducia:1,marcatura:-1}},{et:"Provo a saltarlo subito",es:c=>c.eroe+" lo punta al primo pallone utile: dopo quella predica, il difensore il fallo non se lo puo' piu' permettere.",cons:{coinv:2}},{et:"Cambio fascia",es:c=>c.eroe+" si sposta dall altra parte e lo lascia li' con il suo nervosismo.",cons:{zona:1,marcatura:-1}}]},
 {id:"er_eco1",fam:"EROE",cond:c=>c.mn>=60&&c.scelto("er_prende",0),
  txt:c=>"\u270a "+c.eroe+" si e preso la squadra sulle spalle da venti minuti: adesso i compagni lo cercano anche quando non e' smarcato.",cons:{coinv:1},
  sc:[{et:"Continuo cosi'",es:c=>"Ogni pallone passa da lui: la squadra ha un solo riferimento, nel bene e nel male.",cons:{coinv:2,fiducia:-1}},{et:"Ridistribuisco il gioco",es:c=>c.eroe+" comincia a giocare di prima e ad allargare: la squadra respira e attacca in cinque.",cons:{intesa:2}},{et:"Chiedo aiuto al mister",es:c=>"Un cenno alla panchina: il messaggio arriva, e dalla linea cominciano a dare indicazioni anche agli altri.",cons:{fiducia:1,intesa:1}}]},
 {id:"er_carica",fam:"EROE",cond:c=>c.golSubDaPoco,
  txt:c=>"\u270a Gol subito, e "+c.eroe+" e' il primo ad andare a prendere il pallone in rete: lo porta a centrocampo di corsa.",cons:{},
  sc:[{et:"Carico tutti a voce",es:c=>c.eroe+" urla ai compagni di rialzare la testa: la squadra riparte con un altro piglio.",cons:{intesa:2,coinv:1}},{et:"Parlo solo alla difesa",es:c=>c.eroe+" va dai difensori e sistema le distanze: dietro non si concede piu' niente.",cons:{intesa:1,fiducia:1}},{et:"Rispondo giocando",es:c=>c.eroe+" non dice una parola e si mette a giocare ogni pallone: chi vuole capire, capisce.",cons:{coinv:2}}]},
 {id:"er_sprona",fam:"EROE",cond:c=>c.occFallite>=1&&c.mn>=35,
  txt:c=>"\u270a Occasione buttata, e il compagno resta a terra a mangiarsi le mani: "+c.eroe+" lo va a tirare su.",cons:{},
  sc:[{et:"«La prossima entra»",es:c=>"Due parole e una pacca: il compagno si rialza e torna a chiamarla — la prossima la vuole lui.",cons:{intesa:2,fiducia:1}},{et:"«Dovevi darmela»",es:c=>c.eroe+" glielo dice in faccia. Ha ragione, ma da adesso quel compagno lo cerca meno.",cons:{coinv:1,intesa:-2}},{et:"Non dico niente e vado",es:c=>c.eroe+" torna in posizione senza fermarsi: c e' ancora mezz ora da giocare.",cons:{}}]},
 {id:"er_richiama",fam:"EROE",cond:c=>c.diff<0&&c.mn>=70,
  txt:c=>"\u270a Sotto di un gol a venti minuti dalla fine: "+c.eroe+" raduna i compagni prima della rimessa.",cons:{},
  sc:[{et:"«Alziamo tutti di venti metri»",es:c=>"La squadra sale e comincia a pressare alto: rischioso, ma gli avversari non escono piu'.",cons:{coinv:1,intesa:1}},{et:"«Palla a me e state larghi»",es:c=>c.eroe+" si prende la responsabilita' e chiede spazio: la squadra lo asseconda.",cons:{coinv:2,fiducia:-1}},{et:"«Con calma, c e' tempo»",es:c=>c.eroe+" invita tutti a non buttarla lunga: la manovra si ordina e il gioco torna a filare.",cons:{intesa:2,fiducia:1}}]},
 {id:"er_difesa",fam:"EROE",cond:c=>c.diff>=1&&c.mn>=80,
  txt:c=>"\u270a Si difende un vantaggio, e "+c.eroe+" vede due compagni che non rientrano: li chiama con un gesto secco.",cons:{},
  sc:[{et:"Li rimetto in riga",es:c=>"Rientrano tutti: la squadra si compatta, e adesso gli ultimi minuti si difendono in undici.",cons:{intesa:2,fiducia:1}},{et:"Rientro io per loro",es:c=>c.eroe+" copre lui lo spazio scoperto: corre il doppio, ma il risultato regge.",cons:{fiducia:1,coinv:-1}},{et:"Li lascio avanti a cercare il secondo",es:c=>c.eroe+" fa segno di restare alti: chi vince la partita non la difende, la chiude.",cons:{coinv:1}}]},
 {id:"er_giovane",fam:"EROE",cond:c=>c.mn>=25&&c.giocate>=1&&c.intesa<=0,
  txt:c=>"\u270a Un compagno piu' giovane sbaglia due appoggi di fila e comincia a nascondersi: "+c.eroe+" se ne accorge e va da lui.",cons:{},
  sc:[{et:"«Chiedimela ancora»",es:c=>"Il ragazzo torna a farsi vedere: la testa e' di nuovo alta, e adesso la palla la chiama lui.",cons:{intesa:2}},{et:"Gli semplifico il compito",es:c=>c.eroe+" gli si mette accanto e gli offre sempre l appoggio corto: niente piu' scelte difficili.",cons:{intesa:1,coinv:1}},{et:"Lo lascio sfogare da solo",es:c=>c.eroe+" decide che deve cavarsela: il ragazzo resta in ombra fino alla fine.",cons:{coinv:1}}]},
 {id:"mi_avv",fam:"MISTER",cond:c=>c.mn>=18&&c.mn<=28,
  txt:c=>"\ud83d\udce3 Il mister lo ferma mentre rientra: «Il loro numero sei esce sempre sul portatore. Quando esce, quello spazio e' tuo.»",cons:{zona:1},
  sc:[{et:"Attacco quello spazio",es:c=>"Alla prima uscita del sei, "+c.eroe+" e' gia' partito: adesso e' li' che bisogna guardare.",cons:{zona:1,fiducia:1}},{et:"Prima guardo come si muovono",es:c=>c.eroe+" studia per qualche minuto prima di muoversi: si perde due occasioni ma capisce il meccanismo.",cons:{intesa:1,coinv:-1}},{et:"Lo dico ai compagni",es:c=>c.eroe+" gira l'indicazione a tutto il reparto: adesso quello spazio lo attaccano in tre a turno.",cons:{intesa:2}}]},
 {id:"co_prima",fam:"COMPAGNI",cond:c=>c.mn>=19&&c.mn<=30,
  txt:c=>"\ud83e\udd1d "+c.compagno+" gli passa accanto: «Prima palla che tocchi, tienila. Facciamo salire la squadra.»",cons:{},
  sc:[{et:"La tengo e faccio salire",es:c=>c.eroe+" protegge il primo pallone e aspetta i compagni: la squadra sale di venti metri.",cons:{intesa:1,fiducia:1}},{et:"Verticalizzo subito",es:c=>c.eroe+" cerca la giocata in profondita' al primo tocco: rischiosa, ma se passa saltano in tre.",cons:{coinv:1,intesa:-1}},{et:"Gliela restituisco subito",es:c=>"Tocco di prima e via: "+c.compagno+" riparte lanciato e la squadra sale comunque.",cons:{intesa:1,coinv:1}}]},
 {id:"av_pres",fam:"AVVERSARI",cond:c=>c.mn>=22&&c.mn<=36,
  txt:c=>"\ud83d\ude20 Il loro centrale gli si presenta al primo pallone: una spallata e due parole. E' il benvenuto.",cons:{marcatura:1},
  sc:[{et:"Incasso e vado",es:c=>c.eroe+" non batte ciglio: il centrale resta li' ad aspettare una reazione che non arriva.",cons:{fiducia:1}},{et:"Gli faccio capire subito",es:c=>c.eroe+" regge la spallata e gliela restituisce: da adesso e' guerra, e l'arbitro li ha visti.",cons:{marcatura:1,coinv:1}},{et:"Chiamo l'arbitro",es:c=>c.eroe+" indica il centrale all'arbitro: richiamo verbale, e da adesso quel duello e' sorvegliato.",cons:{marcatura:-1}}]},
 {id:"mi_int",fam:"MISTER",cond:c=>c.mn>=45&&c.mn<=52,
  txt:c=>"\ud83d\udce3 Nello spogliatoio il mister disegna: «Secondo tempo alto. "+c.eroe+", ti voglio dentro il campo, non sulla riga.»",cons:{zona:1},
  sc:[{et:"Gioco dentro il campo",es:c=>"Nella ripresa "+c.eroe+" gioca fra le linee: tocca meno palloni ma li tocca dove pesano.",cons:{zona:1,fiducia:1}},{et:"Sto largo, e' la mia zona",es:c=>c.eroe+" resta sulla fascia dove si sente: piu' palloni, piu' lontano dalla porta.",cons:{coinv:1,fiducia:-1}},{et:"Chiedo di cambiare modulo",es:c=>c.eroe+" propone di alzare il terzino: il mister ci pensa su — l'idea non gli dispiace.",cons:{fiducia:1,coinv:1}}]},
 {id:"co_ripr",fam:"COMPAGNI",cond:c=>c.mn>=46&&c.mn<=56&&c.diff<0,
  txt:c=>"\ud83e\udd1d Il capitano raduna tutti prima di ripartire: «Venti minuti come si deve e la raddrizziamo.»",cons:{},
  sc:[{et:"Parlo anch'io",es:c=>c.eroe+" dice due parole al gruppo: nessun discorso, ma da li' in poi lo cercano di piu'.",cons:{coinv:1,intesa:1}},{et:"Rispondo sul campo",es:c=>c.eroe+" non dice niente e va a mettersi in posizione: parlera' con le gambe.",cons:{fiducia:1}},{et:"Chiedo io la palla sempre",es:c=>c.eroe+" dice al gruppo di cercarlo a ogni recupero: se si perde, si perde con lui in mezzo.",cons:{coinv:2,fiducia:-1}}]},
 {id:"pu_spinge",fam:"COMPAGNI",cond:c=>c.mn>=58&&c.mn<=70&&c.diff<=0,
  txt:c=>"\ud83d\udce3 La curva comincia a spingere: il boato copre le indicazioni della panchina e lo stadio si alza in piedi.",cons:{},
  sc:[{et:"Mi carico e vado a prendermela",es:c=>c.eroe+" si fa trascinare: va a prendersi il primo pallone con tutto lo stadio addosso.",cons:{coinv:2}},{et:"Tengo la calma",es:c=>c.eroe+" abbassa il ritmo e ragiona mentre intorno tutti corrono: la squadra si ricompatta.",cons:{intesa:1,fiducia:1}},{et:"Trascino la curva",es:c=>c.eroe+" si gira verso i tifosi e chiede di alzare la voce: lo stadio risponde e la squadra spinge.",cons:{coinv:1,fiducia:1}}]},
 {id:"mi_cam",fam:"MISTER",cond:c=>c.mn>=62&&c.mn<=74,
  txt:c=>"\ud83d\udce3 Il mister prepara un cambio e lo guarda: sta decidendo se toglie lui o il compagno di reparto.",cons:{},
  sc:[{et:"Chiedo di restare in campo",es:c=>c.eroe+" fa segno di no con la testa verso la panchina: resta, e adesso deve dimostrarlo.",cons:{coinv:1,fiducia:-1}},{et:"Accetto quello che decide",es:c=>c.eroe+" non guarda nemmeno la panchina e torna in posizione: il mister rimette la lavagnetta sotto il braccio, per ora si continua cosi'.",cons:{fiducia:1}},{et:"Chiedo il cambio io",es:c=>c.eroe+" fa segno che le gambe sono al limite: la panchina apprezza l'onesta' e gli chiede di stringere i denti ancora un po'.",cons:{fiducia:2,coinv:-2}}]},
 {id:"av_temp",fam:"AVVERSARI",cond:c=>c.mn>=76&&c.diff<=0,
  txt:c=>"\ud83d\ude20 Loro cominciano a perdere tempo: rimesse lente, il portiere a terra, l'arbitro che guarda l'orologio.",cons:{},
  sc:[{et:"Protesto con l'arbitro",es:c=>c.eroe+" corre dall'arbitro a chiedere il recupero: il quarto uomo prende nota, e le rimesse tornano a battersi in fretta.",cons:{coinv:1,marcatura:1}},{et:"Recupero io il pallone",es:c=>c.eroe+" va a prendersi il pallone e lo riporta sul dischetto di corsa: lo stadio capisce e spinge.",cons:{fiducia:1,coinv:1}},{et:"Faccio finta di niente",es:c=>c.eroe+" non guarda nemmeno l'orologio e resta concentrato: pensa solo al prossimo pallone.",cons:{fiducia:1}}]},
 {id:"er_ulti",fam:"EROE",cond:c=>c.mn>=82,
  txt:c=>"\u270a Ultimi minuti: "+c.eroe+" guarda il tabellone e poi la porta avversaria. Sa che restano due o tre palloni.",cons:{},
  sc:[{et:"Li gioco tutti io",es:c=>c.eroe+" si prende ogni pallone dell'ultimo assalto: se finisce, finisce con la sua firma.",cons:{coinv:2,fiducia:1}},{et:"Cerco l'uomo giusto",es:c=>c.eroe+" alza la testa e serve chi e' messo meglio: nessuna gloria personale, la scelta giusta.",cons:{intesa:2}},{et:"Chiedo palla lunga sulla testa",es:c=>c.eroe+" indica il cielo: si va a nozze con i cross, e vinca il migliore in area.",cons:{zona:1,coinv:1}}]},
 {id:"mi_cons",fam:"MISTER",cond:c=>c.mn>=20&&c.mn<=34,
  txt:c=>"📣 Il mister chiama "+c.eroe+" a bordo campo e gli indica lo spazio alle spalle del loro terzino: «Li'. Vacci ogni volta che la palla gira.»",cons:{zona:1},sc:[{et:"Vado a cercare quello spazio",es:c=>"Alla prima palla che gira "+c.eroe+" parte alle spalle del terzino: il mister annuisce senza smettere di urlare.",cons:{zona:1,fiducia:1}},{et:"Resto dove mi trovo bene",es:c=>c.eroe+" resta dov'e', in mezzo al campo. Il mister allarga le braccia e torna in panchina.",cons:{coinv:1,fiducia:-1}},{et:"Chiedo prima di capire",es:c=>c.eroe+" torna a bordo campo e si fa spiegare meglio: perde trenta secondi, ma poi sa cosa fare.",cons:{intesa:1,fiducia:1}}]},
 {id:"co_int",fam:"COMPAGNI",cond:c=>c.mn>=46&&c.mn<=58,
  txt:c=>"🤝 Si riparte, e "+c.compagno+" gli dice due parole camminando: «Io taglio dentro, tu resta largo. Ci troviamo.»",cons:{intesa:1},sc:[{et:"Ci sto: tu dentro, io largo",es:c=>"L'accordo e' preso: "+c.compagno+" cerchera' il taglio, "+c.eroe+" tiene la larghezza — appena la palla gira, si va.",cons:{intesa:2}},{et:"Facciamo il contrario",es:c=>c.eroe+" indica l'interno: taglia lui e lascia la fascia a "+c.compagno+". Ci mettono un po' a capirsi.",cons:{coinv:1,intesa:-1}},{et:"Ci pensiamo mentre giochiamo",es:c=>"Nessun accordo: giocano a sentimento e per due volte si trovano lo stesso.",cons:{coinv:1}}]},
 {id:"av_fin",fam:"AVVERSARI",cond:c=>c.mn>=74&&Math.abs(c.diff)<=1,
  txt:c=>"😠 Ultimi venti minuti e il gioco si e' fatto ruvido: il difensore lo aspetta un metro piu' avanti, adesso ogni pallone e' un duello.",cons:{marcatura:1},sc:[{et:"Gli tengo testa",es:c=>c.eroe+" non arretra di un metro: il primo pallone lo protegge di corpo e si prende il fallo.",cons:{fiducia:1,marcatura:1}},{et:"Mi allargo, cerco spazio",es:c=>c.eroe+" si sfila e va a cercarsi il pallone lontano dal duello: il difensore lo segue meno volentieri.",cons:{zona:1,marcatura:-1}},{et:"Cerco il fallo",es:c=>c.eroe+" si mette col corpo davanti e aspetta il contatto: fallo, e la squadra rifiata.",cons:{coinv:1}}]},
 {id:"er_prende",fam:"EROE",cond:c=>c.mn>=60&&c.diff<0,
  txt:c=>"✊ Sotto di un gol, "+c.eroe+" comincia a scendere a prendersi il pallone da solo: se la partita non passa da lui, ce la porta lui.",cons:{coinv:2},sc:[{et:"Me la prendo io",es:c=>c.eroe+" scende a prendersi ogni pallone: la squadra passa da lui, nel bene e nel male.",cons:{coinv:2}},{et:"Resto avanti e aspetto",es:c=>c.eroe+" resta alto: se arriva, arriva buona. Ma per qualche minuto non arriva niente.",cons:{coinv:-1,zona:1}},{et:"Parlo col centrocampo",es:c=>c.eroe+" chiede ai mediani di alzare il ritmo invece di scendere lui: la squadra accelera.",cons:{intesa:2}}]},
 {id:"mi_acc",fam:"MISTER",cond:c=>c.mn>=68&&c.diff===0,
  txt:c=>"📣 Il mister a bordo campo: «Cosi' non basta! Alzate il baricentro, "+c.eroe+", vai a prendertela tu la palla!»",cons:{coinv:1},sc:[{et:"Alzo il baricentro",es:c=>c.eroe+" sale di venti metri: la squadra lo segue e la partita si sposta.",cons:{coinv:1,fiducia:1}},{et:"Gioco come so",es:c=>c.eroe+" fa spallucce e continua a giocare la sua partita. Dalla panchina non arrivano piu' indicazioni.",cons:{fiducia:-1}},{et:"Alzo io, ma da solo",es:c=>c.eroe+" sale senza aspettare nessuno: si ritrova spesso isolato, ma il difensore ora ha paura.",cons:{coinv:1,marcatura:1}}]},
 {id:"mi_ges",fam:"MISTER",cond:c=>c.mn>=78&&c.diff>=1,
  txt:c=>"📣 Dalla panchina: «Gestione! Palla lunga e sui piedi, non regaliamo niente adesso.»",cons:{},sc:[{et:"Gestisco io il pallone",es:c=>c.eroe+" tiene palla vicino alla bandierina e fa scorrere il tempo: la panchina applaude.",cons:{fiducia:1,coinv:1}},{et:"Non ci sto: si attacca",es:c=>c.eroe+" prova comunque a servire chi parte: bello da vedere, il mister meno d'accordo.",cons:{fiducia:-1,coinv:1}},{et:"Gestisco ma resto pronto",es:c=>c.eroe+" tiene palla e intanto guarda la profondita': se si aprono, riparte.",cons:{fiducia:1,zona:1}}]},
 {id:"mi_rea",fam:"MISTER",cond:c=>c.golSubDaPoco,
  txt:c=>"📣 Il mister richiama la squadra: «Testa alta, ci sono venti minuti. "+c.eroe+", tu resta alto.»",cons:{coinv:1},sc:[{et:"Testa alta, resto alto",es:c=>c.eroe+" resta sul difensore centrale e richiama i compagni: si riparte da subito.",cons:{coinv:1,fiducia:1}},{et:"Scendo a dare una mano",es:c=>c.eroe+" torna a centrocampo per far respirare la squadra: piu' palloni toccati, meno vicino alla porta.",cons:{coinv:1,zona:-1}},{et:"Vado a caricare il gruppo",es:c=>c.eroe+" gira per il campo a battere le mani sui compagni: la squadra si ricompatta.",cons:{intesa:2}}]},
 {id:"mi_lato",fam:"MISTER",cond:c=>c.duelliP>=2,
  txt:c=>"📣 Indicazione dalla panchina: «Ti hanno preso le misure, "+c.eroe+" — cambia lato, vai a cercarli dall'altra parte.»",cons:{zona:1},sc:[{et:"Cambio lato",es:c=>c.eroe+" si sposta dall'altra parte: il terzino che lo aveva in consegna resta a marcare l'aria.",cons:{zona:1,marcatura:-1}},{et:"Insisto da questa parte",es:c=>c.eroe+" ci riprova dallo stesso lato: prima o poi quel difensore lo salta.",cons:{marcatura:1,fiducia:1}},{et:"Chiedo un compagno vicino",es:c=>c.eroe+" chiama un appoggio sulla sua fascia: in due contro uno il difensore non basta piu'.",cons:{intesa:1,marcatura:-1}}]},
 {id:"co_inc",fam:"COMPAGNI",cond:c=>c.occFallite>=1,
  txt:c=>"🤝 Il capitano lo raggiunge e gli batte una mano sul petto: «La prossima entra. Continua a metterti li'.»",cons:{fiducia:1},sc:[{et:"Continuo a mettermi li'",es:c=>c.eroe+" torna nella stessa posizione al cross successivo. Il capitano lo cerca subito.",cons:{fiducia:1,coinv:1}},{et:"Cambio movimento",es:c=>c.eroe+" attacca il primo palo invece del secondo: i compagni ci mettono un attimo a trovarlo.",cons:{zona:1,intesa:-1}},{et:"Chiedo io il pallone prima",es:c=>c.eroe+" scende a prendersela e la mette lui dal fondo: cambia il ruolo, non l'obiettivo.",cons:{coinv:1}}]},
 {id:"co_pal",fam:"COMPAGNI",cond:c=>c.giocate>=1&&c.mn>=30,
  txt:c=>"🤝 "+c.compagno+" allarga le braccia e lo chiama: adesso lo cercano tutti, "+c.eroe+" e' diventato il riferimento.",cons:{coinv:2},sc:[{et:"Mi prendo la responsabilita'",es:c=>c.eroe+" chiede palla ogni volta: la squadra gioca su di lui e la manovra rallenta ma passa da lui.",cons:{coinv:2}},{et:"Faccio giocare gli altri",es:c=>c.eroe+" gioca di prima e apre per i compagni: meno palloni suoi, squadra piu' rapida.",cons:{intesa:2,coinv:-1}},{et:"Alterno: uno per uno",es:c=>c.eroe+" tiene un pallone e ne gioca uno: la squadra non diventa prevedibile.",cons:{intesa:1,coinv:1}}]},
 {id:"co_tri",fam:"COMPAGNI",cond:c=>c.giocate>=2,
  txt:c=>"🤝 Intesa a memoria con "+c.compagno+": si guardano una volta sola e sanno gia' cosa fare.",cons:{intesa:1},sc:[{et:"Andiamo a memoria",es:c=>"Si cercano a occhi chiusi: fra "+c.compagno+" e "+c.eroe+" il prossimo triangolo e' gia' scritto nelle gambe.",cons:{intesa:2}},{et:"Provo la giocata da solo",es:c=>c.eroe+" tenta l'iniziativa personale: "+c.compagno+" era libero e allarga le braccia.",cons:{coinv:1,intesa:-1}},{et:"Cambiamo schema",es:c=>c.eroe+" e "+c.compagno+" invertono le posizioni: gli avversari perdono i riferimenti.",cons:{zona:1,intesa:1}}]},
 {id:"co_disc",fam:"COMPAGNI",cond:c=>c.duelliP>=1&&c.diff<0,
  txt:c=>"🤝 Scambio acceso a centrocampo: "+c.compagno+" voleva la palla prima, "+c.eroe+" allarga le braccia. Dura un attimo, poi si riparte.",cons:{},sc:[{et:"Chiedo scusa e vado avanti",es:c=>c.eroe+" alza una mano verso "+c.compagno+": chiusa li', si torna a giocare.",cons:{intesa:1}},{et:"Gliela dico anche io",es:c=>"Botta e risposta acceso: si separano ancora nervosi e per un po' non si cercano.",cons:{intesa:-2,coinv:1}},{et:"Lascio perdere e vado",es:c=>c.eroe+" non risponde e torna in posizione: la cosa si sgonfia da sola.",cons:{}}]},
 {id:"av_str",fam:"AVVERSARI",cond:c=>c.duelliV>=2,
  txt:c=>"😠 Il difensore avversario non lo molla piu' di un metro: da adesso "+c.eroe+" ha un'ombra addosso.",cons:{marcatura:1},sc:[{et:"Lo porto a spasso",es:c=>c.eroe+" comincia a muoversi lontano dalla palla e si trascina dietro l'ombra: si apre uno spazio per gli altri.",cons:{marcatura:-1,intesa:1}},{et:"Cerco il duello",es:c=>c.eroe+" gli va addosso ogni volta: sono botte, e l'arbitro comincia a guardarli.",cons:{marcatura:1,fiducia:1}},{et:"Chiedo aiuto ai compagni",es:c=>c.eroe+" fa segno di venire a prendersi la palla vicino: due passaggi e l'ombra e' saltata.",cons:{intesa:1,marcatura:-1}}]},
 {id:"av_pro",fam:"AVVERSARI",cond:c=>c.duelliV>=1&&c.mn>=40,
  txt:c=>"😠 Parole in faccia dopo il contrasto: il difensore gli dice qualcosa, "+c.eroe+" non risponde e si rialza.",cons:{},sc:[{et:"Non rispondo",es:c=>c.eroe+" si rialza e va via senza voltarsi. Il difensore resta li' a parlare da solo.",cons:{fiducia:1}},{et:"Rispondo per le rime",es:c=>"Faccia a faccia: l'arbitro arriva di corsa e li divide. Adesso e' una questione personale.",cons:{marcatura:1,coinv:1}},{et:"Rido e vado via",es:c=>c.eroe+" gli sorride in faccia e si allontana: e' la risposta che il difensore sopporta peggio.",cons:{fiducia:1,marcatura:1}}]},
 {id:"av_ris",fam:"AVVERSARI",cond:c=>c.giocate>=3,
  txt:c=>"👏 Anche l'avversario che lo marca allarga le braccia verso la panchina: quella giocata non si poteva difendere.",cons:{fiducia:1},sc:[{et:"Ringrazio e vado",es:c=>c.eroe+" alza una mano verso l'avversario: rispetto, e si torna in posizione.",cons:{fiducia:1}},{et:"Me la godo",es:c=>c.eroe+" si gira verso la curva a braccia larghe: lo stadio esplode, la panchina avversaria molto meno.",cons:{coinv:1,marcatura:1}},{et:"Indico il compagno",es:c=>c.eroe+" indica chi gli ha dato il pallone: l'applauso se lo prende in due.",cons:{intesa:2}}]},
 {id:"av_fal",fam:"AVVERSARI",cond:c=>c.duelliV>=3,
  txt:c=>"😠 Lo prendono in ritardo, stavolta e' fallo netto: il difensore aveva gia' capito che non lo teneva.",cons:{},sc:[{et:"Mi rialzo subito",es:c=>c.eroe+" si rimette in piedi prima che l'arbitro fischi: la squadra riparte veloce.",cons:{fiducia:1,coinv:1}},{et:"Resto a terra, chiedo il cartellino",es:c=>c.eroe+" resta giu' e indica il taschino: l'arbitro richiama il difensore a muso duro, e il pubblico avversario ha trovato il suo bersaglio.",cons:{marcatura:1}},{et:"Batto veloce la punizione",es:c=>c.eroe+" rimette in gioco prima che si schierino: la squadra riparte con tre uomini avanti.",cons:{coinv:1,intesa:1}}]},
 {id:"er_chi",fam:"EROE",cond:c=>c.mn>=25&&c.giocate===0,
  txt:c=>"✊ "+c.eroe+" va a prendersi la palla venti metri piu' indietro: se non arriva, se la va a cercare.",cons:{coinv:2},sc:[{et:"Vado a prendermela",es:c=>c.eroe+" arretra fino alla linea di centrocampo e comincia a toccare palloni: la partita si accende.",cons:{coinv:2}},{et:"Aspetto il mio momento",es:c=>c.eroe+" resta la' davanti e aspetta. Passano altri minuti senza che la palla arrivi.",cons:{coinv:-1,fiducia:-1}},{et:"Chiedo al mister di scendere",es:c=>c.eroe+" guarda la panchina e indica il centrocampo: il mister annuisce, ed e' una scelta condivisa.",cons:{coinv:1,fiducia:1}}]},
 {id:"er_zona",fam:"EROE",cond:c=>c.marcatura>=1,
  txt:c=>"✊ "+c.eroe+" si sposta dall'altra parte senza dire niente: l'ombra addosso resta a marcare uno spazio vuoto.",cons:{zona:1,marcatura:-1},sc:[{et:"Cambio zona in silenzio",es:c=>"Nessuno se ne accorge subito: quando la palla arriva dall'altra parte, "+c.eroe+" e' solo.",cons:{zona:1,marcatura:-1}},{et:"Resto e me la gioco",es:c=>c.eroe+" resta dov'e' con l'ombra addosso: ogni pallone sara' un corpo a corpo.",cons:{marcatura:1,fiducia:1}},{et:"Lo dico al mister",es:c=>c.eroe+" segnala la marcatura alla panchina: arriva l'indicazione di scambiare posizione con l'ala.",cons:{zona:1,fiducia:1}}]},
 {id:"er_reaz",fam:"EROE",cond:c=>c.occFallite>=2,
  txt:c=>"✊ Non abbassa la testa: "+c.eroe+" chiama la palla un'altra volta, e la chiama forte.",cons:{fiducia:1},sc:[{et:"La chiamo ancora",es:c=>c.eroe+" alza la mano e la chiama forte: adesso tutto lo stadio sa che la vuole.",cons:{fiducia:1,coinv:1}},{et:"Abbasso la testa e corro",es:c=>c.eroe+" smette di chiedere e comincia a correre per la squadra: meno palloni, piu' chilometri.",cons:{coinv:-1,intesa:1}},{et:"Cambio zona e riprovo",es:c=>c.eroe+" si sposta di venti metri e chiama da un'altra parte: nuovo angolo, nuova occasione.",cons:{zona:1,coinv:1}}]},
 /* [7.721.0 — LE SCHEDE DEL TABELLONE. Il momento piu' forte della partita — il gol, fatto o
    subito, dell'eroe o della squadra — passava senza una parola: le uniche due schede «gol subito»
    erano morte (golSub mai scritto) e nessuna esisteva per il gol fatto. Otto schede su quei
    momenti: il gol dell'eroe, il gol di un compagno, il mister e l'avversario dopo la rete, il
    pareggio riacciuffato, la rimonta compiuta, il doppio vantaggio da gestire, i nervi di chi
    perde. Regola 7.719: gesti e intenzioni, mai fatti che il motore non produce. */
 {id:"er_gol",fam:"EROE",cond:c=>c.eroeGolDaPoco,
  txt:c=>"✊ Ha segnato lui. "+c.eroe+" si ferma un attimo davanti alla curva prima di tornare a centrocampo: adesso la partita ha il suo nome sopra.",cons:{fiducia:1},
  sc:[{et:"Vado da chi mi ha servito",es:c=>c.eroe+" corre ad abbracciare "+c.compagno+" e gli indica il pubblico: il gol e' di tutti e due.",cons:{intesa:2}},{et:"Zitti tutti: torno a centrocampo",es:c=>c.eroe+" non esulta quasi: raccoglie il pallone e lo porta al centro. Ne vuole un altro.",cons:{coinv:2,fiducia:1}},{et:"Sotto la curva con la squadra",es:c=>c.eroe+" chiama tutti sotto la curva: i compagni lo raggiungono e lo stadio salta.",cons:{intesa:1,coinv:1}}]},
 {id:"co_gol",fam:"COMPAGNI",cond:c=>c.golFattoDaPoco&&!c.eroeGolDaPoco,
  txt:c=>"🤝 Gol della squadra: "+c.compagno+" esce dal mucchio dell'esultanza e va a cercare "+c.eroe+". «Adesso ne facciamo un altro, e lo fai tu.»",cons:{intesa:1},
  sc:[{et:"«Portamela, ci penso io»",es:c=>c.eroe+" gli risponde battendo la mano sul petto: da adesso "+c.compagno+" lo cerchera' per primo.",cons:{coinv:2,intesa:1}},{et:"«Prima la teniamo»",es:c=>c.eroe+" gli chiede calma: il vantaggio si gestisce, il secondo gol si cerca senza scoprirsi.",cons:{fiducia:1,intesa:1}},{et:"Esulto e basta",es:c=>c.eroe+" ride e corre al centro: nessuna promessa, solo la voglia di ricominciare.",cons:{fiducia:1}}]},
 {id:"mi_gol",fam:"MISTER",cond:c=>c.golFattoDaPoco&&c.diff>=1,
  txt:c=>"📣 Il mister non esulta: batte le mani due volte e indica il centrocampo. «Non e' finita. "+c.eroe+", riparti come prima.»",cons:{},
  sc:[{et:"Riparto come prima",es:c=>c.eroe+" annuisce e si rimette in posizione senza guardare il tabellone: la panchina lo apprezza.",cons:{fiducia:2}},{et:"Chiedo di abbassarci",es:c=>c.eroe+" propone di gestire: il mister scuote la testa, ma l'idea la tiene in mente.",cons:{fiducia:-1,intesa:1}},{et:"Carico i compagni",es:c=>c.eroe+" gira fra i compagni battendo le mani: il gol e' fatto, ora si difende in avanti.",cons:{intesa:2,coinv:1}}]},
 {id:"av_gol",fam:"AVVERSARI",cond:c=>c.golFattoDaPoco&&c.mn>=30,
  txt:c=>"😠 Dopo il gol il difensore che lo marca spinge il pallone verso il centro con rabbia e gli dice qualcosa passando: per lui la partita e' diventata personale.",cons:{marcatura:1},
  sc:[{et:"Lo ignoro",es:c=>c.eroe+" non lo guarda nemmeno: chi e' in vantaggio non ha bisogno di rispondere.",cons:{fiducia:1}},{et:"Gli sorrido",es:c=>c.eroe+" gli sorride e indica il tabellone: il difensore adesso gioca con il sangue agli occhi.",cons:{marcatura:1,coinv:1}},{et:"Gli tendo la mano",es:c=>c.eroe+" gli batte una mano sulla spalla: il difensore la scansa, ma il tono si abbassa.",cons:{marcatura:-1,fiducia:1}}]},
 {id:"co_pari",fam:"COMPAGNI",cond:c=>c.golFattoDaPoco&&c.diff===0&&c.golSub>=1,
  txt:c=>"🤝 Pareggio riacciuffato: il capitano raduna tutti mentre gli avversari battono. «Adesso la vinciamo. "+c.eroe+", stai alto.»",cons:{coinv:1},
  sc:[{et:"Sto alto e la chiamo",es:c=>c.eroe+" resta sul difensore centrale e chiede ogni pallone: la squadra sa dove guardare.",cons:{coinv:2}},{et:"«Non prendiamo il terzo»",es:c=>c.eroe+" chiede prima l'equilibrio: un punto in tasca, poi si vede.",cons:{fiducia:1,coinv:-1}},{et:"Chiedo il cambio di ritmo",es:c=>c.eroe+" fa segno di accelerare: si prova a spingere finche' gli avversari sono storditi.",cons:{intesa:1,coinv:1}}]},
 {id:"er_rimonta",fam:"EROE",cond:c=>c.diff>0&&c.golSub>=1&&c.golFatti>=2&&c.mn>=60,
  txt:c=>"✊ Erano andati sotto e adesso sono avanti: "+c.eroe+" guarda il tabellone e capisce che questi minuti valgono una stagione.",cons:{fiducia:1},
  sc:[{et:"Chiudo io la partita",es:c=>c.eroe+" chiede ogni pallone in uscita: vuole essere lui la sponda che fa passare i minuti.",cons:{coinv:2,fiducia:1}},{et:"Tutti dietro la linea della palla",es:c=>c.eroe+" richiama i compagni a rientrare: si difende in undici, e lui e' il primo.",cons:{intesa:2,coinv:-1}},{et:"Cerco il gol che chiude",es:c=>c.eroe+" resta alto a cercare il colpo che spegne la partita: rischio e coraggio.",cons:{coinv:1,zona:1}}]},
 {id:"mi_dom",fam:"MISTER",cond:c=>c.diff>=2&&c.mn>=55&&c.mn<=75,
  txt:c=>"📣 Due gol di vantaggio e il mister chiama "+c.eroe+" a bordo campo: «Adesso non regaliamo niente: tieni la palla, fai respirare la squadra.»",cons:{},
  sc:[{et:"Gestisco il ritmo",es:c=>c.eroe+" rallenta il gioco e tiene il pallone lontano dall'area: il mister annuisce.",cons:{fiducia:2,coinv:-1}},{et:"Voglio il terzo",es:c=>c.eroe+" fa segno che vuole ancora attaccare: il mister allarga le braccia, ma non lo ferma.",cons:{coinv:2,fiducia:-1}},{et:"Faccio giocare gli altri",es:c=>c.eroe+" comincia a servire chi ha toccato meno palloni: la squadra cresce tutta insieme.",cons:{intesa:2}}]},
 {id:"av_nerv",fam:"AVVERSARI",cond:c=>c.diff>=2&&c.mn>=70,
  txt:c=>"😠 Sotto di due, gli avversari hanno smesso di parlarsi: il loro capitano urla contro il terzino, e "+c.eroe+" lo sente.",cons:{marcatura:-1},
  sc:[{et:"Ci vado sopra",es:c=>c.eroe+" punta proprio quel terzino: chi litiga con i suoi non difende con la testa.",cons:{coinv:2,marcatura:-1}},{et:"Rispetto: gioco pulito",es:c=>c.eroe+" abbassa i toni e gioca semplice: nessuna provocazione, nessun rischio.",cons:{fiducia:1}},{et:"Tengo palla vicino alla bandierina",es:c=>c.eroe+" porta il pallone all'angolo e li fa correre: i nervi degli avversari fanno il resto.",cons:{fiducia:1,coinv:1}}]},
]

const BEAT664={
  C1:["{portiere} rifiuta il rilancio lungo e apre corto per {centrale}.","{regista} si abbassa fra i centrali e riceve fronte al campo: l'uscita e' impostata."],
  C2:["Due maglie addosso a {centrale}: qui si esce solo giocando.","{mediano} si smarca sul lato cieco e la protegge con un controllo orientato.","Scarico di prima per {terzino}, libero: la pressione e' saltata."],
  C3:["Giro palla lungo, {regista} detta i tempi: otto passaggi, nove, l'avversario rincorre.","La squadra sale di venti metri col pallone tra i piedi."],
  C4:["{regista} alza la testa: la difesa e' tutta schiacciata sul lato palla.","Traversone di quaranta metri sul lato debole, {esterno} la addomestica di petto."],
  C5:["Triangolo veloce {mediano}-{mezzala}-{regista}, tre tocchi tutti di prima.","La palla esce dal traffico sui piedi di {mezzala}, fronte alla trequarti."],
  C6:["{terzino} avanza palla al piede fino alla trequarti.","Appoggio verticale per {esterno}, che viene incontro spalle alla porta."],
  C7:["La strada e' chiusa: {portatore} torna indietro su {centrale}, e lo stadio mugugna.","Si ricomincia dall'altra parte: la pazienza e' una scelta."],
  C8:["Nessuno esce su {centrale}: si prende venti metri palla al piede.","La linea avversaria si rompe, una maglia esce e dietro si apre lo spazio."],
  A1:["{punta} viene incontro col marcatore addosso e apre il triangolo con {mezzala}.","Dai e vai: {mezzala} la restituisce nello spazio, il marcatore e' tagliato fuori."],
  A2:["{portatore} appoggia su {punta} e SCATTA.","Tocco di ritorno di prima: il centrocampo avversario e' alle spalle."],
  A3:["{regista} aspetta che {trequartista} esca dal cono d'ombra del mediano.","Filtrante rasoterra fra le linee: ricezione fronte alla porta, la difesa si alza di colpo."],
  A4:["Un tocco solo: verticale di venticinque metri di {regista} per {punta}, che protegge."],
  A5:["{punta} fa da sponda bassa, il centrocampo avversario segue la palla.","{mezzala} parte alle spalle del mediano: e' servito dentro l'area."],
  A6:["Palla addosso a {punta}, spalle alla porta: sponda di petto.","{mezzala} rifinisce di prima, la restituzione arriva sul lato cieco del marcatore."],
  A7:["La linea avversaria sale di due passi: il varco e' dietro.","Palla nel corridoio, {punta} parte sul filo del fuorigioco — la bandierina resta giu'."],
  A8:["{punta} taglia forte sul primo palo e si porta via il centrale.","Nel corridoio che si apre entra {mezzala}: la difesa deve scegliere, e sceglie male."],
  F1:["{esterno} punta il terzino e si ferma sul piu' bello: aspetta.","Sovrapposizione di {terzino}, che riceve sull'out: fondo guadagnato."],
  F2:["Isolamento sulla fascia: {esterno} contro il suo uomo, uno contro uno."],
  F3:["Dai e vai stretto {esterno}-{terzino} sulla riga laterale.","Il secondo scambio libera il fondo: il raddoppio e' saltato in velocita'."],
  F4:["Cross rasoterra teso sul primo palo: la palla attraversa lo specchio."],
  F5:["Parabola sul secondo palo, dove {centrale} ha attaccato lo spazio."],
  F6:["Sul fondo la difesa si schiaccia sulla porta aspettando il cross.","Palla dietro rasoterra: {mezzala} arriva frontale al limite dell'area piccola."],
  F7:["Palla dentro a {regista}, che la gira subito sull'altro lato.","Il lato debole attacca in superiorita': il terzino avversario e' solo contro due."],
  F8:["{esterno} non va sul fondo: rientra sul piede forte verso il centro.","Due avversari convergono, e lo spazio si apre alle loro spalle."],
  T1:["Palla recuperata bassa mentre gli avversari sono tutti nella nostra meta'.","Sessanta metri di corsa di {esterno}, la difesa rincula: adesso si gioca."],
  T2:["Pressing alto: {punta} e {mezzala} chiudono le due uscite.","L'appoggio avversario e' corto, palla strappata a venticinque metri dalla porta."],
  T3:["{mediano} legge la traiettoria e intercetta a centrocampo.","Primo passaggio immediato in verticale: la transizione e' viva."],
  T4:["Corner avversario spazzato di testa da {centrale}: la palla esce su {esterno}, rimasto alto.","Campo aperto, tre contro due: si va."],
  T5:["Palla persa in avanti da {portatore}, e adesso si torna indietro tutti.","Ribaltamento in due passaggi: il campo si apre alle nostre spalle."],
  T6:["Il centrale avversario esce a pressare: il buco e' ai suoi lati.","Palla immediata nel mezzo spazio, {mezzala} ci si infila prima che la linea scali."],
  T7:["{portiere} blocca e rilancia con le mani in un secondo: niente pausa.","{esterno} riceve in corsa a centrocampo, meta' avversari sono ancora in area nostra."],
  D1:["Finta di corpo e cambio di passo: {portatore} lo salta di netto."],
  D2:["Il difensore non ci casca: corpo fra palla e uomo, sfera portata via pulita."],
  D3:["Contrasto franco sul pallone conteso: il piu' deciso se la porta via."],
  D4:["Spalla a spalla in velocita': l'inseguitore prova a portarlo fuori strada."],
  D5:["Stacco a due sul punto di caduta: chi sale prima la tocca."],
  D6:["{portatore} mette il corpo: la palla e' coperta, il difensore morde e non trova niente."],
  D7:["Il difensore arriva in ritardo: FISCHIO, punizione per noi."],
  D8:["Ritardo nostro: fischio contro, e non c'e' niente da discutere."],
  Z1:["Sistemata e collo pieno dai venticinque metri."],
  Z2:["La combinazione consegna il tiro pulito dal limite: piazzato d'interno."],
  Z3:["Botta di prima intenzione, senza controllo: solo tempismo."],
  Z4:["L'angolo si apre: conclusione sul palo lontano."],
  Z5:["Incornata schiacciata verso il basso."],
  Z6:["La palla arriva sporca a due metri: conta solo l'istinto."],
  Z7:["La respinta e' corta: la seconda palla e' viva."],
  Z8:["LEGNO PIENO: il suono si sente fin quassu'."],
  Z9:["Il portiere vola e la toglie da sotto l'incrocio."],
  Z10:["E' DENTRO. GOL."],
  P1:["Barriera a quattro, il portiere la sistema urlando.","{specialista} sulla palla: lo stadio trattiene il fiato."],
  P2:["Due uomini sulla palla, lo schema parte solo quando parte il tocco corto."],
  P3:["Palla ferma sul punto del fallo: traiettoria tesa in area, stacchi armati."],
  P4:["Corner battuto corto: il primo uomo e' saltato, la difesa deve rifare le marcature."],
  P5:["Parabola lunga sul secondo palo, dove {centrale} e' salito col suo marcatore."],
  P6:["Corner giu' dal cielo, palla arretrata al limite dove non marca nessuno."],
  P7:["Flipper in area: respinta corta, rimpallo, un tocco a testa."],
  P8:["Fischio, e l'area si svuota: sul dischetto restano solo {specialista} e il portiere."],
};
/* le TABELLE DEGLI ESITI: [id, testo, conseguenza dichiarata, peso base]. `gol` entra solo col
   budget. La conseguenza e' il gancio che la riga successiva deve raccogliere (metro di L4). */
const ESITI664={
  Z1:[["gol","La palla si infila sotto l'incrocio: GOL.","rete",1],["parata","Il portiere ci arriva con la punta delle dita: in angolo.","corner",1.1],["legno","Traversa piena!","seconda-palla",0.35],["murato","Murata dal corpo del difensore.","mischia",0.9],["fuori","Di poco alto sopra la traversa.","rinvio",1.2]],
  Z2:[["gol","Piatto preciso, palo interno e dentro: GOL.","rete",1],["parata","Il portiere respinge coi pugni.","seconda-palla",1.2],["deviata","Deviazione decisiva in angolo.","corner",1],["fuori","Larga di un soffio.","rinvio",1]],
  Z3:[["gol","Al volo, senza pensarci: GOL.","rete",1],["parata","Riflesso del portiere a botta sicura.","corner",1.3],["murato","Il difensore ci mette il corpo.","mischia",1.1],["fuori","La spara sopra la traversa.","rinvio",0.9]],
  Z4:[["gol","Palo lontano, imprendibile: GOL.","rete",1],["parata","Il portiere si distende e la devia.","corner",1.2],["chiusa","Il difensore in recupero la sporca.","rimessa",1.1],["fuori","Fuori di un niente.","rinvio",0.9]],
  Z5:[["gol","Incornata secca: GOL.","rete",1],["parata","Il portiere la alza sopra la traversa.","corner",1.2],["fuori","Di testa, a lato.","rinvio",1.1],["salvata","Salvataggio sulla linea!","seconda-palla",0.4]],
  Z6:[["gol","Da due metri non sbaglia: GOL.","rete",1],["parata","Il portiere gli chiude lo specchio addosso.","seconda-palla",1.2],["divorata","LA DIVORA! Da posizione impossibile da sbagliare.","rinvio",1],["murata","Murata sulla linea.","corner",0.8]],
  F4:[["gol","Tocco vincente sul primo palo: GOL.","rete",1],["anticipo","Il difensore anticipa tutti e mette in angolo.","corner",1.2],["volo","Conclusione al volo, respinta corta.","seconda-palla",1],["nessuno","Nessuno ci arriva, la palla attraversa l'area e muore sul fondo.","rimessa",1.1],["portiere","Uscita bassa del portiere, presa sicura.","ripartenza-loro",0.9]],
  F5:[["gol","Stacco imperioso: GOL.","rete",1],["respinta","Il marcatore la respinge di testa.","seconda-palla",1.2],["uscita","Il portiere esce coi pugni e libera.","rinvio",1],["fallo","Fallo in attacco nella spinta: fischio.","punizione-loro",0.8]],
  T5:[["golsubito","Non li prendiamo piu': GOL SUBITO.","rete-loro",1],["parata","Il nostro portiere ci mette una pezza.","corner-loro",1.2],["rientro","{mediano} rientra e la spazza in fallo laterale.","rimessa-loro",1.1]],
  D2:[["persa","Palla persa, si riparte dall'altra parte.","ripartenza-loro",1.2],["fallo","Il difensore lo stende: punizione per noi.","punizione",0.9],["rimessa","La palla schizza in fallo laterale.","rimessa",1]],
  D8:[["punizione","Punizione da posizione pericolosa.","punizione-loro",1.2],["giallo","Fallo tattico: cartellino giallo.","punizione-loro",0.6],["nulla","L'arbitro lascia correre: vantaggio.","vantaggio",0.5]],
  P1:[["gol","La parabola scavalca la barriera e si infila all'incrocio: GOL.","rete",1],["barriera","La barriera respinge.","seconda-palla",1.2],["parata","Il portiere la toglie dall'angolino.","corner",1],["fuori","Sopra la traversa.","rinvio",1.1]],
  P2:[["gol","Lo schema funziona: GOL.","rete",1],["murata","Muro della barriera in uscita.","mischia",1.2],["parata","Presa a terra del portiere.","ripartenza-loro",1]],
  P8:[["gol","Angolo scelto, portiere spiazzato: GOL.","rete",1],["parata","PARATO! Il portiere indovina l'angolo.","seconda-palla",0.9],["palo","Palo pieno dal dischetto.","seconda-palla",0.3],["fuori","Alto sopra la traversa: incredibile.","rinvio",0.2]],
};
function libRender664(struct,ctx,ruoli,budgetGol,seme){
  if(!struct||!struct.path)return null;
  const R=ruoli||{};const _nome=(k)=>R[k]||("il "+k);
  const righe=[];
  for(let i=0;i<struct.path.length;i++){const id=struct.path[i];const bs=BEAT664[id]||[];
    for(const b of bs)righe.push({mod:id,txt:String(b).replace(/\{(\w+)\}/g,(m,k)=>_nome(k))});}
  const ult=struct.path[struct.path.length-1];
  const tab=ESITI664[ult];
  let esito=null;
  if(tab){const cands=tab.filter(e=>(e[0]!=="gol"&&e[0]!=="golsubito")||budgetGol);
    let tot=0;for(const c of cands)tot+=c[3];
    let r=(_libH662(seme+"|esito")%100000)/100000*tot;let pick=cands[cands.length-1];
    for(const c of cands){r-=c[3];if(r<=0){pick=c;break;}}
    esito={id:pick[0],txt:String(pick[1]).replace(/\{(\w+)\}/g,(m,k)=>_nome(k)),cons:pick[2]};
    righe.push({mod:ult,txt:esito.txt,esito:esito.id,cons:esito.cons});}
  return {sig:struct.sig,corsia:struct.corsia,righe,esito};
}
if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{window.__CPM_LIB_RENDER=libRender664;window.__CPM_LIB_BEAT=BEAT664;window.__CPM_LIB_ESITI=ESITI664;}catch(_e){}}
/* [7.484.0 direttiva PO «le partite devono essere piu' serene, tranquille, meno frenetiche — fai
   decidere al giocatore la velocita' 1x 1,25x 2x»] IL RITMO DELLA PARTITA HA UNA COSTANTE E UNA MANOPOLA.
   Il tick del clock e' il metronomo di tutto cio' che scorre in `playing`: un minuto di gioco per tick,
   e su quel tick girano la cronaca di sfondo, le grida del mister, il micro-simulatore e il lerp del
   pallone. MISURATO PRIMA DI TOCCARLO (sonda sul flusso vero, contando solo i tratti in `playing` perche'
   il clock e' FERMO durante gli highlight): 307 ms per minuto contro i 300 nominali — il tick teneva, il
   ritmo frenetico non era una deriva ma la taratura. Base portata a 420 ms: 90' di gioco fluido passano
   da 28 a 38 secondi d'orologio, e con essi rallentano cronaca e ordini del mister, che vivono li'.
   La MANOPOLA divide il tick: 1x = 420, 1,25x = 336 (il ritmo di prima), 2x = 210. La preferenza sta in
   `localStorage`, non nel salvataggio: e' un'impostazione della persona, non dello stato della carriera —
   nessun `SAVE_VERSION` da alzare, e vale su tutte e tre le carriere.
   ⚠️ La manopola muove il FLUSSO della partita, non le finestre d'esito degli highlight: quelle restano
   quelle che sono, perche' sono il tempo di LEGGERE (e il check `post-highlight` del gate le tiene dentro
   [1800,4000] — accelerarle sarebbe insieme una regressione di leggibilita' e un gate rosso). Si scorre
   in fretta il riempimento, non i momenti da guardare. */
/* [7.489.0 direttiva PO «molto piu' lenta, leggibile, immersiva — 1x / 1,5x / 2x, elimina 1,25x»]
   Il tick e' il metronomo di tutto cio' che scorre in `playing`. Base 420 -> 900 ms per minuto di gioco:
   a 1x novanta minuti di gioco fluido durano 81 secondi d'orologio invece di 38, e fra una riga di
   cronaca e l'altra passa il tempo di leggerla. Le tre velocita' sono RAPPORTI onesti sulla stessa base
   (900 · 600 · 450), non tre costanti scollegate: e' cio' che rende «1,5x» una promessa verificabile.
   ⚠️ Il 2x che ne esce (450 ms) e' piu' lento del 2x di ieri (210): ieri la base era meno della meta'.
   Chi vuole il ritmo vecchio ha 2x; chi voleva quello di ieri a 1x ha 1,5x. */
/* [7.543.0 direttiva PO, scelta esplicita fra tre opzioni: «~2,5 minuti»] IL METRONOMO DELLA PARTITA.
   E' il numero che decide quanto dura la parte AMBIENTALE di una gara: un tick avanza il cronometro di un
   minuto (invariante 7.538), quindi 90 tick x 900 ms facevano 81 secondi reali per 90 minuti di gioco —
   un minuto di partita ogni 0,9 secondi.
   E' da li' che nasceva il collaudo «parecchi giro giro tondo con il pallone»: la sonda ha misurato che in
   ~10 secondi di visione passavano UNDICI minuti di gioco, mentre uno spell di possesso ne dura 4-9. Dentro
   una sola occhiata la palla cambiava padrone e risaliva il campo nei due versi — non per un difetto del
   modello, ma perche' il modello veniva guardato a una velocita' che non e' quella del calcio. Nel 7.542
   sono state provate e BUTTATE due tarature che cercavano di curare il sintomo (ricevente obbligato in
   avanti, spell portato a 9-19 minuti): la scala del tempo non si aggiusta con una manopola del possesso.
   1700 ms = un minuto di gioco ogni 1,7 secondi, cioe' ~2,5 minuti di parte ambientale. Conseguenze
   misurabili: il bersaglio del pallone passa da 7,2 a 3,9 unita' al secondo (dalla velocita' di un lancio
   a quella di una conduzione) e le stesse ~25 righe di cronaca si distribuiscono su 153 secondi invece che
   su 81. ⚠️ Le tre velocita' continuano a dividere questo tempo: a 2x si torna a 850 ms, cioe' al ritmo di
   prima per chi lo preferisce — la scelta resta in mano a chi gioca. __CPM_NO564 ripristina i 900 ms per la
   prova del rosso e per le sonde tarate sul mondo vecchio. */
const MATCH_TICK_MS=(typeof window!=='undefined'&&window.__CPM_NO564)?900:1700;
const MATCH_SPEEDS=[1,1.5,2];
/* MIGRAZIONE: chi aveva scelto 1,25x trova un valore che non esiste piu'. Non si lascia una preferenza
   invalida in giro (tornerebbe a galla a ogni caricamento): si riscrive su 1x, il default sicuro. */
function readMatchSpeed(){try{const raw=localStorage.getItem("cpm-match-speed");const v=parseFloat(raw);
  if(MATCH_SPEEDS.indexOf(v)>=0)return v;
  if(raw!=null){try{localStorage.setItem("cpm-match-speed","1");}catch(_e2){}}
  return 1;}catch(_e){return 1;}}
function LiveMatch({player,opponent,context="career",onMatchEnd,isMatchHome=true,benchStart,benchReason="",entryMinute=60,titleStakes=null,mdEuroPhase=null,onQuit=null,onSimulateNat=null,resumeState=null}){/* [7.150.0] resumeState: ripresa DENTRO la partita dopo background (clock/punteggio salvati → rientra in fase playing) *//* [7.14.0] onSimulateNat: Simula dal pre-partita per le gare di Nazionale (entrate dal CTA, senza altra uscita) *//* [6.77.0] onQuit: uscita pulita dal matchday (pre-partita, nessuno stato toccato) *//* [6.74.0 QA-28] mdEuroPhase: fase KO della voce calendario → il banner rigori usa lo STESSO seed della risoluzione */
  const _rsCk138=resumeState?clamp(resumeState.clock|0,1,88):0;/* [7.150.0] minuto di ripresa dopo background (0 = partita normale) */
  // Dynamic HL count — based on match conditions, NOT random
  const numHLRef=useRef(0);
  const hlTimesRef=useRef([]);
  const [numHL,setNumHL]=useState(()=>{
    if(resumeState){/* [7.150.0] ripresa: gli HL si rischedulano nella SOLA finestra rimanente [clock..88] → conteggio ridotto */
      var _c0=Math.max(0,Math.min(86,resumeState.clock|0));var _nR=clamp(Math.round((88-_c0)/16),1,4);numHLRef.current=_nR;return _nR;}
    var oppP=opponent?.p||opponent?.prestige||65;
    var form=player.form||70;
    var fat=player.fatigue||0;
    var mwv=context==="trial"?1:calcMatchWeight(player,opponent?.id||opponent?.n,player.standings||[],player.week||1);
    var n=2;
    if(mwv>=8)n+=2;else if(mwv>=5)n+=1;  // big match = more moments
    if(oppP>=78)n+=1;else if(oppP<=40)n-=1; // top opp = more contested
    if(form>=82)n+=1;else if(form<55)n-=1;  // in-form = more involved
    if(fat>75)n-=1;                           // tired = fewer moments
    var v=clamp(n,2,context==="trial"?3:7);
    numHLRef.current=v;
    return v;
  });
  const [hlTimes,setHlTimes]=useState(()=>{
    if(resumeState){/* [7.150.0] tempi HL SOLO dopo il clock di ripresa (finestra [clock+4 .. 88]) */
      var c0=Math.max(0,Math.min(86,resumeState.clock|0));var nR=numHLRef.current;
      var stepR=Math.max(4,Math.floor((88-(c0+4))/nR)||6);
      var vr=Array.from({length:nR},function(_,i){return Math.min(88,(c0+4)+stepR*i);});
      hlTimesRef.current=vr;return vr;
    }
    var n=numHLRef.current;
    /* [7.500.0 F4] SPALMATI SU TUTTA LA PARTITA. Il passo era `82/n` a partire dal minuto 8, quindi
       l'ULTIMO highlight cadeva fra il 62' e il 74' — e siccome fino al 7.499 il fischio finale arrivava
       quando gli highlight finivano, la partita moriva li'. Ora che si gioca fino al 90' quel passo
       lascerebbe venti minuti di coda senza un solo momento del giocatore: si distribuisce su [8, 84]. */
    /* ⚠️ LA PROVA DEL ROSSO DEVE SPEGNERE TUTTO IL RIMEDIO, NON META'. Il primo tentativo metteva
       `__CPM_NO500` solo sullo sgancio del fischio e FALLIVA: con gli highlight gia' spalmati fino
       all'84', l'ultimo cadeva comunque a ridosso della fine e anche il vecchio comportamento arrivava
       al 90'. Le due modifiche sono un rimedio solo — spostare il fischio senza spalmare lascerebbe venti
       minuti di coda vuota — quindi l'interruttore le spegne insieme, e solo cosi' il rosso riproduce
       davvero la partita che moriva al 50'. */
    var _no500=(typeof window!=='undefined'&&window.__CPM_NO500);
    var step=_no500?(Math.floor(82/n)||12):Math.max(6,Math.round((84-8)/Math.max(1,n-1)));
    /* [7.489.0] I MINUTI DEGLI HIGHLIGHT SONO EVENTI, e devono cadere identici a tutte le velocita':
       usavano `rng()` non seedato, quindi cambiavano a ogni partita. Stesso seed della catena cronaca —
       qui `bgSimSeedRef` non esiste ancora (e' dichiarato piu' sotto), quindi si ricalcola dalla stessa
       espressione invece di spostare la dichiarazione e rischiare un ordine di inizializzazione rotto. */
    var _sdHL=hashStr(String(opponent?.id||opponent?.n||"opp")+"|"+(player?.season||1)+"|"+(player?.week||1)+"|"+(player?.name||""))>>>0;
    var _rHL=seededRng((_sdHL^0x5bf03635)>>>0);
    var v=Array.from({length:n},function(_,i){return _no500?(8+step*i+Math.floor(_rHL()*Math.max(2,step-3))):Math.min(86,8+step*i+Math.floor(_rHL()*Math.max(2,Math.min(10,step-3))));});/* [7.500.0] tetto all'86': un highlight al 90' non avrebbe il tempo di essere giocato */
    hlTimesRef.current=v;
    return v;
  });
  // [7.117.0] situations useState spostato SOTTO weather/oppRedRef (vedi più giù) così il set iniziale può gating su meteo (is_wet) e uomo in più (is_opp_red).
  useEffect(()=>{numHLRef.current=numHL;},[numHL]);
  useEffect(()=>{hlTimesRef.current=hlTimes;},[hlTimes]);
  // Sprint 33 C7 / Sprint 118 — bench start mechanic
  const [onBench,setOnBench]=useState(resumeState?false:benchStart);/* [7.150.0] ripresa: sempre in campo */
  const onBenchRef=useRef(resumeState?false:benchStart);
  /* [7.38.0 Sezione 8] SOSTITUZIONE IN USCITA: minuto pre-calcolato dalla fatica d'ingresso (deterministico
     per partita) — un titolare stanco viene richiamato tra ~58' e ~86'; + gestione risultato (avanti di 2+
     dopo il 78' esci tra gli applausi). Solo career/cup, mai chi è ENTRATO dalla panchina. */
  const subbedOffRef=useRef(false);
  const [subbedOff,setSubbedOff]=useState(false);
  /* [7.137.0 collaudo PO «la squalifica per espulsione deve essere REALE, deve arrivare dalla partita e non essere
     randomica ed inventata»] cartellini dell'EROE tracciati DAL VIVO: ogni fallo commesso (key "foul") può portare un
     giallo SEEDATO; alla 2ª ammonizione (o rosso diretto raro) → ESPULSIONE reale in campo (evento + uscita). A fine
     partita la squalifica deriva da QUESTI fatti, non da un Math.random. */
  const heroYellowsRef=useRef((resumeState&&resumeState.yc)|0);/* [7.163.0 LIVE-F3] ripresa: l'ammonizione presa prima del background non evapora (rischio doppio giallo reale) */
  const heroRedRef=useRef(!!(resumeState&&resumeState.rc));
  const heroFoulCntRef=useRef(0);
  const sentOffRef=useRef(false);
  const subOffMinRef=useRef(0);
  const subOffWhyRef=useRef("");
  const subOffAtRef=useRef((()=>{const _v=(!benchStart&&(context==="career"||context==="cup")&&(player.fatigue||0)>=60)?clamp(56+Math.round((80-(player.fatigue||0))*1.1),56,80):null;return (_v!=null&&_rsCk138>0&&_v<=_rsCk138)?null:_v;})());/* [7.38.0] più sei stanco, prima esci (60→78' · 70→67' · 78→58') · [7.150.0] ripresa: se il minuto d'uscita è GIÀ passato, niente sostituzione immediata (sei appena rientrato) */
  useEffect(()=>{onBenchRef.current=onBench;},[onBench]);
  const [benchMinute]=useState(()=>benchStart?entryMinute:0);
  // Sprint 121 — randomized warmup timing (player can't predict entry minute)
  const [benchWarmupAt]=useState(()=>benchStart?Math.max(1,entryMinute-Math.floor(Math.random()*10+5)):0);
  const [benchPhase,setBenchPhase]=useState("watching"); // Sprint 118: "watching"|"warmup"|"entering"
  const [subEntryKey,setSubEntryKey]=useState(0); // item 2 (5.49.6): trigger della cerimonia 3D d'ingresso del subentrante (edge → ThreeMatchView)
  // [7.126.0] VARIANTE d'ingresso (0-4), SEEDATA (alterna tra partite) + AWARE dell'IMPORTANZA (collaudo PO «alternanza
  //   anche in base all'importanza»): big match → carica/showman/esplosivo · routine → concentrato/veterano/carica.
  const [subEntryVar]=useState(()=>{try{const _mw=context==="trial"?1:calcMatchWeight(player,opponent?.id||opponent?.n,player.standings||[],player.week||1);
    const _s=Math.abs(hashStr((player.name||"x")+"_ent_"+(entryMinute||60)+"_"+(player.season||1)+"_"+(opponent?.id||opponent?.n||"")));
    const set=(_mw>=8)?[0,2,4]:[1,3,0];return set[_s%set.length];}catch(_e){return 0;}});
  // [7.127.0] trigger + variante d'USCITA (sostituzione): 0-4, SEEDATA + aware del MOTIVO (applausi vs stanco) e dell'importanza.
  const [subExitKey,setSubExitKey]=useState(0);
  const [subExitVar,setSubExitVar]=useState(0);
  // Sprint 34 — tactic moments + chained highlights + sub events
  const tacticBonusRef=useRef(0);
  const tacticFiredRef=useRef([_rsCk138>=28,_rsCk138>=63,_rsCk138>=75,_rsCk138>=85]); // Sprint 113: 4 slots (28', 63', 75', 85') · [7.150.0] ripresa: gli ordini già passati non ri-scattano
  const [subEvent,setSubEvent]=useState(null); // string or null
  const subFiredRef=useRef(false);
  // Dynamic HL — reactive queue (opp_goal) + desperate flag (losing 0-2 at 72')
  const reactiveHLQueueRef=useRef([]);
  const desperateFiredRef=useRef(false);
  const earlyDespRef=useRef(false);
  const halfFiredRef=useRef(_rsCk138>=45);const oppRedRef=useRef(false);/* [6.0.0 MP-5] */// [5.77.0 MOT-4] l'intervallo scatta UNA volta garantita al 45' · [7.150.0] ripresa dopo il 45' → intervallo già passato (niente falso «fine primo tempo» né reset momentum)
  useEffect(()=>{try{AudioMgr.enterMatch();}catch(_a){}return()=>{try{AudioMgr.exitMatch();}catch(_a){}};},[]);/* [7.62.0 AUDIO] al mount/unmount del match: musica menu OFF + letto-folla ON, e viceversa al ritorno */
  const bgSimSeedRef=useRef(hashStr(String(opponent?.id||opponent?.n||"opp")+"|"+(player?.season||1)+"|"+(player?.week||1)+"|"+(player?.name||""))>>>0);// [5.77.0 MOT-1] seed del micro-sim: stabile per partita
  // Sprint 81 — use correct club stadium for pro matches
  // [6.78.0 direttiva PO] TUTTE LE FINALI si giocano in CAMPO NEUTRO (stadio internazionale, non l'impianto
  //   di nessuna delle due squadre) con TIFO 50/50: Coppa Nazionale (round>=4), finale di coppa europea,
  //   finale di Europeo/Mondiale. Consumato da: nome stadio, crowdCtx (venue+derby), settori folla (50/50).
  const _isNeutralFinal=(context==="cup"&&(player.cup?.round||1)>=4)
    ||(context==="euro_ko"&&player.euro?.phase==="final")
    ||(context==="euroMondiale_ko"&&player.euroMondiale?.koPhase==="final")
    ||(context==="nationsCup"&&!!player.nationsCupQueue?.isFinal&&(player.nationsCupQueue?.matchIdx||0)>=((player.nationsCupQueue?.opponents||[]).length-1));/* [7.41.0] la FINALE della Coppa delle Nazioni (ultima gara della coda estesa) è in campo neutro come le altre finali (6.78) */
  /* [7.686.0] i contesti in cui in campo c'e' la NAZIONALE e non il club. */
  const _natCtx686=(context==="nationsCup"||context==="euro_ko"||context==="euroMondiale_ko"||context==="nazionale"||context==="euroMondiale");
  const [stadium]=useState(()=>{
    if(context==="trial"||(player.club?.isU18))return pick(STADIUMS);
    if(_isNeutralFinal)return "Stadio Internazionale — Finale";
    // [6.31.0 collaudo PO «la nazionale gioca nello stadio del club dell'eroe»]: nei contesti NAZIONALE il nome
    //   dello stadio deve essere quello NAZIONALE (Stadio Nazionale — <Nazione>), non l'arena del club. Coerente
    //   con crowdCtx (che già normalizza hClub a lg:"Nazionale"). Casa = nazione dell'eroe, trasferta = avversario.
    const _natCtx=context==="national"||context==="nationsCup"||context==="euroMondiale_group"||context==="euroMondiale_ko"||context==="euroMondiale"||context==="euroMondiale_qualif";
    /* [7.41.0] girone e KO di Europeo/Mondiale si giocano nel PAESE OSPITANTE (euroMondiale.host, seedato al
       trigger): il nome dello stadio è il suo. Le QUALIFICAZIONI restano casa/trasferta (realistico). */
    if((context==="euroMondiale_group"||context==="euroMondiale_ko")&&player.euroMondiale?.host)return getStadiumName({lg:"Nazionale",n:player.euroMondiale.host});
    if(_natCtx){const _hn=isMatchHome?(player.nation||"Italia"):((opponent&&(opponent.n||opponent.name))||player.nation||"Italia");return getStadiumName({lg:"Nazionale",n:_hn});}
    const hClub=isMatchHome?(player.club||opponent):opponent;
    return getStadiumName(hClub);
  });
  // Sprint 169: kickoff hour determines atmosphere (< 19:00 = day, 19-20 = dusk, 21+ = night)
  const [timeOfDay]=useState(()=>{
    if(typeof window!=='undefined'&&!window.__CPM_STORE_BUILD){const _ft=window.__CPM_TOD||(/[?&]cpmtod=(day|dusk|night)/.exec(window.location.search||"")||[])[1];if(_ft==="day"||_ft==="dusk"||_ft==="night")return _ft;}/* [7.278.0] hook di COLLAUDO dell'orario (?cpmtod=night o window.__CPM_TOD) — gemello di ?cpmwx=, spento nella store build: senza, la sonda di luminosita' misurerebbe solo i provini, che sono sempre diurni */
    if(context==="trial")return "day";// CROWD 2.0 §8: i provini si svolgono SEMPRE di giorno
    const wk=player.week||1,ss=player.season||1;
    const h=Math.abs(hashStr("koh_"+(wk*37+ss*7+wk)));
    const hours=[12,14,15,15,15,17,18,20,20,21,21];
    const hr=hours[h%hours.length];
    return hr<19?"day":hr<21?"dusk":"night";
  });
  const [kickoffHour]=useState(()=>{
    if(context==="trial")return 11;// §8: seduta di osservazione mattutina
    const wk=player.week||1,ss=player.season||1;
    const h=Math.abs(hashStr("koh_"+(wk*37+ss*7+wk)));
    return [12,14,15,15,15,17,18,20,20,21,21][h%11];
  });
  // Sprint 16+82 — weather seeded by week + club; time-specific conditions filtered
  const [weather]=useState(()=>{
    const wk=player.week||1;
    if(typeof window!=='undefined'&&!window.__CPM_STORE_BUILD){const _fw=(/[?&]cpmwx=([a-z]+)/.exec(window.location.search||"")||[])[1];if(_fw){const _w=WEATHER_TYPES.find(w=>w.id===_fw);if(_w)return _w;}}/* [5.99.0] hook di COLLAUDO meteo (?cpmwx=snow) — spento nella store build */
    if(context==="trial"){// CROWD 2.0 §8: meteo dei provini SEMPRE sereno o poco nuvoloso
      const _tw=WEATHER_TYPES.filter(w=>w.id==="sunny"||w.id==="partly");
      return _tw[Math.abs(hashStr("tw_"+wk+"_"+(player.season||1)))%_tw.length]||WEATHER_TYPES[0];
    }
    const seed=hashStr((player.club?.id||"x")+wk+(player.season||1));
    // [7.0.0 collaudo PO] il meteo rispetta il CLIMA della sede (padrone di casa reale; nazionali neutre)
    const _venue70=(isMatchHome===false)?(opponent||player.club):(player.club||opponent);
    const _clim70=(/^(national|nationsCup|euroMondiale)/.test(context||""))?{}:climateWeights(_venue70);
    // [7.147.0] STAGIONALITÀ vera al posto del vecchio isWinter invertito (wk<=10||wk>=33 ×3 precipitazioni
    //   = pioggia/neve a fine agosto e alla 38ª di maggio): peso = base × stagione × clima sede.
    const _seas47=seasonalWeights(wk);
    const pool=WEATHER_TYPES
      .filter(wt=>!wt.tod||(Array.isArray(wt.tod)?wt.tod.includes(timeOfDay):wt.tod===timeOfDay))
      .map(wt=>({...wt,w:wt.w*(_seas47[wt.id]!=null?_seas47[wt.id]:1)*(_clim70[wt.id]!=null?_clim70[wt.id]:1)}));
    let tot=pool.reduce((s,e)=>s+e.w,0);let r=(seed%10000)/10000*tot;
    for(const wt of pool){r-=wt.w;if(r<=0)return wt;}return pool[0];
  });
  // Sprint 159: include opponent+context in seed so consecutive national matches never share situations
  // [7.117.0] qui (dopo weather/oppRedRef) → il set iniziale gata su meteo (is_wet) e uomo in più (is_opp_red, false al fischio d'inizio)
  const [situations,setSituations]=useState(()=>selectContextualSituations([...SITUATIONS],numHLRef.current,player,(player.season||1)*1000+(player.week||1)*13+hashStr((opponent?.n||opponent?.id||context||"")),{opponentId:opponent?.id||opponent?.n||null,weatherFx:(weather&&weather.pitchFx)||null,oppRed:oppRedRef.current}));
  const situationsRef=useRef(situations);
  useEffect(()=>{situationsRef.current=situations;},[situations]);
  // Sprint 16 — crowd chant overlay state
  const [crowdChant,setCrowdChant]=useState(null); // {text,type,key}
  // Sprint 17
  const [momentum,setMomentum]=useState(resumeState&&typeof resumeState.momentum==="number"?clamp(resumeState.momentum,0,100):50); // 0=away dominance, 100=home dominance
  const momentumRef=useRef(resumeState&&typeof resumeState.momentum==="number"?clamp(resumeState.momentum,0,100):50);
  useEffect(()=>{momentumRef.current=momentum;},[momentum]);
  /* [7.711.0 — FASE 2 MISSIONE DEFINITIVA: IL MATCH STATE UNICO NASCE QUI]
     La direttiva PO (01/09) vuole una sola realta' al tick logico che alimenti ogni decisione.
     L'audit (docs/AUDIT-PARTITA.md) ha misurato che il Football State attuale vive nel renderer,
     e' derivato dalle mesh e ha UN consumatore: qui si costruisce il sostituto al posto giusto —
     assemblato ogni tick (300ms) SOLO da autorita' logiche (possTurnRef/ballPosRef/matchPlayersRef/
     scoreRef/momentumRef/pPosRef), con memoria degli eventi (anello alimentato da setTurn616).
     Alla nascita ha ZERO consumatori: prima le fondamenta, poi i piani (strangler). */
  const matchStateRef=useRef(null);const msMemRef=useRef([]);
  /* [7.718.0] decidi715 ESTRATTA come funzione chiamabile (il disegno FASE3-SCAMBIO impone: riusata,
     non copiata): la stessa mente decide per l'ombra E per le macchine che via via le si consegnano. */
  const decidi715=(turno)=>{try{
    const _att=turno>0?"home":"away",_def=turno>0?"away":"home",_sgn=turno>0?1:-1;
    const _b=ballPosRef.current||{x:50,y:50};const _bx=_b.x,_by=_b.y;
    const _pl=(matchPlayersRef&&matchPlayersRef.current)?matchPlayersRef.current:[];
    let _best=null,_bs=-1e9;
    for(let _i=0;_i<_pl.length;_i++){const _q=_pl[_i];if(!_q||_q.gk||_q.team!==_att)continue;
      const _dx=(_q.x||50)-_bx,_dy=(_q.y||50)-_by,_dd=Math.hypot(_dx,_dy);if(_dd<3||_dd>45)continue;
      const _fw=_dx*_sgn;
      let _blk=0,_mk=0;
      for(let _j=0;_j<_pl.length;_j++){const _o=_pl[_j];if(!_o||_o.gk||_o.team!==_def)continue;
        const _t=Math.max(0,Math.min(1,(((_o.x||50)-_bx)*_dx+((_o.y||50)-_by)*_dy)/(_dd*_dd)));
        const _px=_bx+_dx*_t,_py=_by+_dy*_t;
        if(Math.hypot((_o.x||50)-_px,(_o.y||50)-_py)<3.5)_blk=1;
        if(Math.hypot((_o.x||50)-(_q.x||50),(_o.y||50)-(_q.y||50))<5)_mk=1;}
      const _sc=Math.min(_fw,14)*1.2-Math.abs(_dd-16)*0.4-_blk*25-_mk*6;
      if(_sc>_bs){_bs=_sc;_best={i:_i,x:+(_q.x||50).toFixed(1),y:+(_q.y||50).toFixed(1),fw:+_fw.toFixed(1),d:+_dd.toFixed(1),blk:_blk,mk:_mk};}}
    const _adv=turno>0?_bx:100-_bx;
    const _thr=(matchStateRef.current&&matchStateRef.current.threat)|0;
    const _act=(_adv>=75&&_thr>=55)?"tira":(_best&&(_best.fw>2?_bs>-10:_bs>-4))?"passa":"conduci";
    return {act:_act,rcv:_act==="passa"?_best:null,score:+_bs.toFixed(1)};
  }catch(_e){return {act:"conduci",rcv:null,score:0};}};
  const phaseRef=useRef(context==="trial"?"playing":"matchday");
  const heatPointsRef=useRef([]); // {x,y}[] — sampled every 4 playing ticks
  const [showHeatMap,setShowHeatMap]=useState(false);
  const gkDiveRef=useRef(null); // GK dive direction for rigore
  // CROWD 2.0 (§6/§7) — contesto folla deterministico: UNICA sorgente per numero spettatori (card),
  // riempimento visivo degli spalti 3D e intensità dell'atmosfera. Seedato → riproducibile (gate-safe).
  const [crowdCtx]=useState(()=>{
    try{
      // [6.5.1 BUG stadio nazionale] le gare della NAZIONALE si giocano nello stadio del PAESE, non del club dell'eroe:
      //   casa → stadio della nazione dell'eroe (NAT_CLUB_DATA); trasferta → stadio della nazione avversaria (opponent).
      //   (Mondiali/Europei: stadio nazionale del lato di casa — l'approssimazione più vicina finché non c'è un
      //   campo `host` nel model di euroMondiale.)
      const _isNatC=context==="national"||context==="nationsCup"||context==="euroMondiale_group"||context==="euroMondiale_ko"||context==="euroMondiale"||context==="euroMondiale_qualif";
      const _myNatC=_isNatC?(NAT_CLUB_DATA[player.nation||"Italia"]||{id:"nt-"+((player.nation||"it").slice(0,3).toLowerCase()),a:(player.nation||"NAZ").slice(0,3).toUpperCase(),p:82,c:"#003399",c2:"#ffffff",nat:"🇮🇹"}):null;
      // le entry NAT_CLUB_DATA non hanno `lg`/`n`: normalizzo a lg:"Nazionale" (→ stadiumConfigFor sceglie lo
      //   stadio nazionale grande, moderno_it ≥62k) e nome dal paese, così lo stadio del paese è coerente.
      const _mkNatClub=(c,natName)=>c?{...c,lg:"Nazionale",n:c.n||natName||c.a||"Nazionale"}:c;
      const _isFinal=_isNeutralFinal;// [6.78.0] flag unico (vedi sopra): finale ⇒ campo neutro + tifo 50/50
      // [6.78.0] FINALE = VENUE NEUTRA: pseudo-club ospitante con stadio internazionale grande (lg:"Nazionale"
      //   → stadiumConfigFor sceglie il template nazionale ≥58k), id stabile → stesso impianto per ogni finale.
      const _finVenue=_isFinal?{id:"neutral-final-venue",n:"Finale",a:"FIN",p:93,lg:"Nazionale",c:"#8e1f33",c2:"#f0b33a"}:null;
      /* [7.41.0] Europeo/Mondiale col PAESE OSPITANTE: girone e KO nello stadio dell'HOST (euroMondiale.host,
         seedato) — le qualificazioni restano casa/trasferta; la finale tiene la venue neutra 6.78. */
      const _emHostC41=((context==="euroMondiale_group"||context==="euroMondiale_ko")&&player.euroMondiale?.host)?_mkNatClub(NAT_CLUB_DATA[player.euroMondiale.host]||_myNatC,player.euroMondiale.host):null;
      const hClub=context==="trial"?null:(_finVenue||_emHostC41||(_isNatC?_mkNatClub(isMatchHome?_myNatC:(opponent||_myNatC),isMatchHome?(player.nation||"Italia"):(opponent&&(opponent.n||opponent.name))):(isMatchHome?(player.club||opponent):opponent)));
      const _drby=(context==="trial"||_isFinal)?null:isDerby(player.club?.id,opponent?.id);// in campo neutro niente logica derby
      const _mw=context==="trial"?1:calcMatchWeight(player,opponent?.id||opponent?.n,player.standings||[],player.week||1);
      // [5.89.0 S3] config stadio del PADRONE DI CASA REALE (trasferta = stadio dell'avversario, già
      //   garantito da hClub/homeTeamObj) con EVOLUZIONE automatica dal prestigio accumulato del club
      //   (clubPrestigeShifts, persistito) e ATMOSFERA per club che scala l'intensità del tifo.
      const _evoHome89=(hClub&&player.club&&(hClub.id||hClub.n)===(player.club.id||player.club.n)&&player.clubEvo&&player.clubEvo.clubId===(player.club.id||player.club.n))?player.clubEvo:null;/* [7.6.0 FASE 2] evoluzione del club solo se casa=tuo club */const _stCfg89=(typeof stadiumConfigFor==="function")?stadiumConfigFor(hClub,{prestigeShift:(player.clubPrestigeShifts||{})[hClub?.id||hClub?.n]||0,stadiumTier:_evoHome89?_evoHome89.stadiumTier:0}):null;
      // [7.4.0 FASE 1] fattori di CONTESTO dell'affluenza (oltre alla struttura del club): posizione in classifica,
      //   forma recente (solo se la casa è il TUO club), corsa a fine stagione, prestigio dell'ospite, giorno/orario.
      let _standPos=null,_standN=null,_formStreak=null,_raceBoost=null,_oppPres=null,_midweek=false,_badHour=false;
      try{ if(context==="career"&&hClub){
        const _st=player.standings||[];
        if(_st.length){const _sorted=[..._st].sort((x,y)=>(y.pts||0)-(x.pts||0)||(((y.gf||0)-(y.ga||0))-((x.gf||0)-(x.ga||0))));
          const _i=_sorted.findIndex(s=>s.id===hClub.id);if(_i>=0){_standPos=_i+1;_standN=_sorted.length;
            if((player.week||1)>26){const _topGap=_standPos-1,_botGap=_standN-_standPos;if(_topGap<=3||_botGap<=3)_raceBoost=clamp(0.5+(3-Math.min(_topGap,_botGap))*0.17,0,1);}}}
        if(isMatchHome&&hClub.id===player.club?.id){const _mh=(player.matchHistory||[]).filter(m=>m&&!m.cup&&!m.euro&&!m.national).slice(-5);if(_mh.length)_formStreak=clamp(_mh.reduce((s,m)=>s+(m.won?1:m.drew?0:-1),0),-5,5);}/* [7.8.1] le entry di matchHistory hanno won/drew, non result → prima _formStreak era SEMPRE 0 (modificatore affluenza da forma mai applicato) */
        const _vis=isMatchHome?opponent:player.club;_oppPres=(_vis&&(_vis.p||_vis.prestige))||null;
        if(typeof kickoffHour==="number")_badHour=(kickoffHour<=13||kickoffHour>=21);
      }}catch(_e){}
      const _cc89=computeCrowdContext({context,homeClub:hClub,matchWeight:_mw,derby:!!_drby,isFinal:_isFinal,
        weather,week:player.week||1,season:player.season||1,
        standPos:_standPos,standN:_standN,formStreak:_formStreak,raceBoost:_raceBoost,oppPrestige:_oppPres,midweek:_midweek,badHour:_badHour,fanbaseBonus:_evoHome89?_evoHome89.fanbase:0,
        capacity:_stCfg89?_stCfg89.capacity:null});// [5.87.0 STADI S1]
      return _stCfg89?{..._cc89,intensity:clamp(_cc89.intensity*(_stCfg89.atmo||1),0,1),stadiumTpl:_stCfg89}:_cc89;
    }catch(e){return {tier:"league",fill:0.7,awayFill:0.35,intensity:0.55,capacity:20000,attendance:14000,seed:1};}
  });
  // Sprint 81 — attendance uses the HOME club (not always player.club) · ora derivato dal crowdCtx (coerenza card↔spalti)
  const [attendance]=useState(()=>crowdCtx.attendance);
  // responsive layout: narrow = stacked vertically (phones + tablets up to 640px)
  const [isNarrow,setIsNarrow]=useState(()=>window.innerWidth<640);
  useEffect(()=>{const fn=()=>setIsNarrow(window.innerWidth<640);window.addEventListener("resize",fn);return()=>window.removeEventListener("resize",fn);},[]);
  // persistent seeded rosters for both teams
  // homeRoster = football home team; awayRoster = football away team (player is in the correct side)
  /* [7.173.0 collaudo PO «partita con il rivale Pablo Bernard, ma non gioca»] quando il calendario ti mette contro
     il club del RIVALE di carriera (arco «Gli eterni rivali»), il rivale DEVE essere in campo: sostituisce lo slot
     d attaccante (10) della rosa generata → formazioni, cronaca ({A}/marcatori) e pagelle lo vedono davvero. */
  const _rvInXI=!!(player.rival&&player.rival.name&&!/^(national|nationsCup|euroMondiale)/.test(context||"")&&(player.rival.club?.id===opponent?.id||player.rival.club?.n===opponent?.n));
  const [homeRoster]=useState(()=>{
    const isNatCtxR=context==="national"||context==="nationsCup"||context==="euroMondiale_group"||context==="euroMondiale_ko"||context==="euroMondiale"||context==="euroMondiale_qualif";
    if(!isMatchHome){const r=generateTeamRoster(opponent,player.season||1).slice(0,11);if(_rvInXI)r[10]={...r[10],name:player.rival.name};return r;}/* [7.173.0 collaudo PO «partita col rivale ma non gioca»] il RIVALE di carriera è nell XI del suo club */
    const _hRosterClub=isNatCtxR?(NAT_CLUB_DATA[player.nation||"Italia"]||player.club):player.club||opponent;
    const r=generateTeamRoster(_hRosterClub,player.season||1).slice(0,11);if(!benchStart)r[10]={name:player.name,role:"Centravanti"};return r;
  });
  const [awayRoster]=useState(()=>{
    const isNatCtxR=context==="national"||context==="nationsCup"||context==="euroMondiale_group"||context==="euroMondiale_ko"||context==="euroMondiale"||context==="euroMondiale_qualif";
    if(!isMatchHome){const _aClub=isNatCtxR?(NAT_CLUB_DATA[player.nation||"Italia"]||player.club):player.club||opponent;const r=generateTeamRoster(_aClub,player.season||1).slice(0,11);if(!benchStart)r[10]={name:player.name,role:"Centravanti"};return r;}
    const r=generateTeamRoster(opponent,player.season||1).slice(0,11);if(_rvInXI)r[10]={...r[10],name:player.rival.name};return r;/* [7.173.0] rivale nell XI avversario */
  });
  // [7.118.0 collaudo PO «compagni di squadra in nazionale errati, sono quelli del club!»] In una gara di
  //   NAZIONALE i nomi/sigla dei compagni nella cronaca e negli assist devono venire dalla NAZIONALE, non
  //   dal club dell'eroe (SAL). Il roster è già nazionale (NAT_CLUB_DATA) → deriviamo da lì sigla e pool
  //   compagni. In gara di CLUB tutto invariato (player.club / player.teammates).
  const _isNatCtx=/^(national|nationsCup|euroMondiale)/.test(context||"");
  const _heroSideClub=_isNatCtx?(NAT_CLUB_DATA[player.nation||"Italia"]||player.club):(player.club||opponent);// squadra dell'eroe (nazione in nat-ctx)
  const _homeClubObj=isMatchHome?_heroSideClub:opponent;// vera squadra di casa (per sigla {H})
  const _awayClubObj=isMatchHome?opponent:_heroSideClub;// vera squadra ospite (per sigla {A})
  const _heroSideRoster=isMatchHome?homeRoster:awayRoster;// rosa del lato dell'eroe (già nazionale in nat-ctx)
  const _matePool=_isNatCtx?_heroSideRoster.filter(r=>r&&r.name&&r.name!==player.name).map(r=>({name:r.name,archetype:null})):(player.teammates||[]);// compagni per assist-link: nazionali in nat-ctx, club altrimenti
  // 22 players + referee — generated once per match
  const matchPlayersRef=useRef(null);/* [BL-07] specchio live per l'hook diagnostico __CPM_MP (pattern ref standard) */
  /* [7.186.0 collaudo PO «punizione senza barriera e giocatori mal posizionati»] predicato UNICO di set-piece:
     lo schieramento (muro/area) e la sospensione del pressing erano legati a `lockMovement`, che copre solo una
     parte delle punizioni → tutte le altre restavano nell'assetto di gioco aperto. */
  const isSetPieceSit=(s)=>{if(!s)return false;if(s.lockMovement)return true;
    try{if(typeof isPenaltySit==="function"&&isPenaltySit(s))return true;}catch(_e){}
    return s.intent==="freekick";};
  /* [7.456.0 codice 007 «ad inizio scena traballa tutto»] IL COMMIT DI STAGING SI DICHIARA.
     Il taglio di scena vive nel render-loop e scatta al cambio di `hlSitKey`; lo staging vero
     (continuita' + stageSitPositions) e' un altro commit React — quello in cui `matchPlayers`
     cambia. Finora il renderer poteva solo INDOVINARE quando fosse arrivato (il setaccio 7.401:
     «meta' squadra oltre 8 unita' dal bersaglio»), e lo indovinava tardi. Questo contatore viene
     bumpato insieme alle nuove posizioni, quindi ATTERRA NELLO STESSO COMMIT: quando il renderer
     vede il numero cambiare, i bersagli freschi sono gia' nei props — non un fotogramma prima. */
  const [stageStamp,setStageStamp]=useState(0);
  const [matchPlayers,_setMPraw]=useState(()=>{
    const j=(x,y,d=4)=>({x:clamp(x+rng(-d,d),3,97),y:clamp(y+rng(-d,d),3,97)});
    // Sprint 79 — prestige-aware away formation: elite teams press higher (lower x = closer to home goal)
    const _oppP79=opponent?.p||opponent?.prestige||65;
    const aOff=_oppP79>=75?-6:_oppP79>=60?0:6; // high prestige presses, low prestige sits deep
    const _mp=[
      // Home team (10 outfield + GK, protagonist is separate)
      {...j(8,50),team:"home",gk:true},{...j(18,12),team:"home"},{...j(18,38),team:"home"},
      {...j(18,62),team:"home"},{...j(18,88),team:"home"},{...j(38,25),team:"home"},
      {...j(38,50),team:"home"},{...j(38,75),team:"home"},{...j(55,22),team:"home"},{...j(55,78),team:"home"},
      // Away team (prestige-shifted)
      {...j(95,50),team:"away",gk:true},{...j(82+aOff,12),team:"away"},{...j(82+aOff,38),team:"away"},
      {...j(82+aOff,62),team:"away"},{...j(82+aOff,88),team:"away"},{...j(62+aOff,25),team:"away"},
      {...j(62+aOff,50),team:"away"},{...j(62+aOff,75),team:"away"},{...j(48+aOff,20),team:"away"},
      {...j(48+aOff,50),team:"away"},{...j(48+aOff,80),team:"away"},
    ];
    // [7.130.0 collaudo PO «i cognomi dietro la maglia nel live match»] COGNOME per ogni giocatore, dai roster VERI:
    //   le 3D-home sono i COMPAGNI dell'eroe (roster con r[10]=hero → indici 0-9), le 3D-away gli AVVERSARI. L'eroe
    //   (mesh separato) usa il proprio cognome. _heroRoster/_oppRoster aware di isMatchHome (homeRoster/awayRoster =
    //   squadre REALI home/away; l'eroe è sempre reso «home» nel 3D).
    try{const _heroRoster=isMatchHome?homeRoster:awayRoster,_oppRoster=isMatchHome?awayRoster:homeRoster;
      const _surn=(r,idx)=>{const nm=((r&&r[idx]&&r[idx].name)||"").trim();const pp=nm.split(/\s+/);return (pp[pp.length-1]||"").toUpperCase();};
      let _hi=0,_ai=0;_mp.forEach(e=>{e.name=(e.team==="home")?_surn(_heroRoster,_hi++):_surn(_oppRoster,_ai++);});}catch(_e){}
    /* [7.641.0 — F1a del piano B: I VENTUNO HANNO UN RUOLO] Decisione strategica (docs/SPRINT §B):
       l'analisi ha censito che i giocatori di sfondo non hanno campo ruolo — slot per indice e
       basta — e il motore del possesso non puo' scegliere un ricevente «da regista» o «da ala».
       Il ruolo nasce dallo SLOT di formazione (la disposizione qui sopra e' gia' per reparti):
       0/10 GK · 1-4/11-14 DF · 5-7/15-17 MF · 8-9/18-20 AT. E' l'anagrafe del Match Engine. */
    _mp.forEach((e,i)=>{const _k=(i===0||i===10)?"GK":((i>=1&&i<=4)||(i>=11&&i<=14))?"DF":((i>=5&&i<=7)||(i>=15&&i<=17))?"MF":"AT";e.rl=_k;});
    return _mp;
  });
  /* [7.588.0 SOLO COLLAUDO, spento se manca la bandiera] CHI RIMETTE INDIETRO GLI OSPITI.
     Il censimento della ripresa dice una cosa che la mia spiegazione non regge: il ripiegamento vede
     bersaglio 62 e trova il giocatore a 44, PASSATA DOPO PASSATA, con guadagno 0,92 — dopo una sola
     passata dovrebbe stare a 60,6. Qualcuno lo riporta indietro fra una passata e l'altra, e i dodici
     scrittori usano tutti `prev.map`, quindi non e' un elenco ricostruito: e' una SCRITTURA. Qui il
     setter si annota da QUALE RIGA parte ogni aggiornamento e quanto sposta l'indice sorvegliato: la
     riga colpevole si legge, non si indovina. Nessun costo a bandiera spenta. */
  const setMatchPlayers=React.useMemo(()=>{
    if(typeof window==='undefined'||!window.__CPM_W588)return _setMPraw;
    return (u)=>{const st=(new Error()).stack||"";return _setMPraw(prev=>{
      const nx=(typeof u==='function')?u(prev):u;
      try{const W=window.__CPM_W588,I=W.idx|0;
        const a=prev&&prev[I],b=nx&&nx[I];
        if(a&&b&&Math.abs((b.x||0)-(a.x||0))>1.5){
          const m=st.split('\n').slice(1,6).join(' | ');
          /* l'IMPRONTA dello scrittore e' il suo stesso codice: la pila di Babel non torna alle righe del
             sorgente, il testo dell'aggiornamento si'. */
          /* [7.589.0] e SE IL CANCELLO ERA APERTO: senza questo non si distingue una scrittura durante la
             ripresa da una a gioco vivo, e la colpa torna a essere un'opinione. */
          const _ko=((kickRef.current|0)>0||(kickoffRef.current|0)>0);
          (W.mosse=W.mosse||[]).push({da:+Number(a.x).toFixed(1),a:+Number(b.x).toFixed(1),ko:_ko,fn:String(u).replace(/\s+/g,' ').slice(0,420),st:m.slice(0,160)});
          if(W.mosse.length>120)W.mosse.shift();
        }
      }catch(_e){}
      return nx;
    });};
  },[_setMPraw]);
  useEffect(()=>{matchPlayersRef.current=matchPlayers;},[matchPlayers]);/* [BL-07] specchio live per __CPM_MP */

  // Sprint 3D-1 — renderer 3D (default; resta dentro il sistema HL). 2D Classic/Phaser selezionabili dal toggle.
  const render3D=true;// 5.46.3: solo motore 3D (PitchCanvas/Phaser rimossi)

  // AI states
  const [oppTactic,setOppTactic]=useState(null);
  const oppTacticRef=useRef(null);
  useEffect(()=>{oppTacticRef.current=oppTactic;},[oppTactic]);
  const [oppTacticLoading,setOppTacticLoading]=useState(false);
  const [scoutReport,setScoutReport]=useState(null);
  const [scoutLoading,setScoutLoading]=useState(false);
  const [showScout,setShowScout]=useState(false);
  const [aiCommentary,setAiCommentary]=useState(null);

  const _rsClock=resumeState?clamp(resumeState.clock|0,1,88):0;/* [7.150.0] clock/punteggio ripresi dallo snapshot pre-background */
  const _rsScore=(resumeState&&resumeState.score&&typeof resumeState.score.home==="number")?{home:resumeState.score.home|0,away:resumeState.score.away|0}:{home:0,away:0};
  const [clock,setClock]=useState(_rsClock);
  const clockRef=useRef(_rsClock);
  useEffect(()=>{clockRef.current=clock;},[clock]);
  const [score,setScore]=useState(_rsScore);
  const scoreRef=useRef(_rsScore);
  const wasBehindRef=useRef(false);/* [7.8.28 QA] «eri in svantaggio a un certo punto» — serve all'achievement Rimonta (prima confrontava won&&homeScore<awayScore = contraddizione, mai sbloccabile) */
  useEffect(()=>{scoreRef.current=score;if(score.away>score.home)wasBehindRef.current=true;},[score]);
  // Sprint 118/121 — bench phase progression (watching→warmup→entering), warmup at randomized benchWarmupAt
  useEffect(()=>{
    if(!onBench||phase!=="playing"||subbedOffRef.current)return;/* [7.38.0] chi è USCITO non rientra */
    if(clock>=benchMinute&&benchPhase!=="entering")setBenchPhase("entering");
    else if(clock>=benchWarmupAt&&benchPhase==="watching")setBenchPhase("warmup");
  },[clock]);// eslint-disable-line
  // Sprint 118 — auto-dismiss bench overlay at entry time
  useEffect(()=>{
    if(benchPhase!=="entering"||!onBench)return;
    setSubEntryKey(k=>k+1);// item 2: avvia la sequenza 3D d'ingresso (eroe si alza → indicazioni → linea laterale → entra)
    const t=setTimeout(()=>{setOnBench(false);setBenchPhase("watching");},4600);// durata cinematica (era 2000)
    return()=>clearTimeout(t);
  },[benchPhase,onBench]);
  const [phase,setPhase]=useState(resumeState?"playing":(context==="trial"?"playing":"matchday"));/* [7.150.0] ripresa: dritto in campo, salta matchday/formations/walkout */
  /* [7.179.0] zoom tipografico: OFF solo quando il canvas 3D è vivo (walkout→rigori/cerimonia) — matchday,
     formazioni e giornale (ended) sono DOM puro e restano ingranditi come il resto del gioco. */
  const _zoomDom184=!["walkout","playing","hl_intro","hl_move","hl_choose","hl_result","shootout","ceremony"].includes(phase);/* fasi DOM (matchday/formazioni/giornale) vs fasi col canvas 3D vivo */
  /* [7.184.3 CAUSA RADICE del «pulsante ingresso in campo non visibile»] l'effect Sprint 45j di CareerApp imposta
     `overflowY:hidden` sullo .cpm-scroll per TUTTA la durata del match su mobile (<640px) — giusto per le fasi col
     campo 3D (che riempie lo schermo: niente da scorrere, zero spazio bianco), FATALE per le fasi DOM: prepartita,
     FORMAZIONI e giornale post-partita sono più alti dello schermo, quindi «Salta» e «⚽ Ingresso in campo» venivano
     TAGLIATI e resi irraggiungibili (nessuno scroll possibile). Lo zoom tipografico 7.179 ha solo peggiorato il caso
     (+12% di altezza). Qui lo scroll si RIABILITA nelle fasi DOM (con padding di sicurezza per la safe-area) e resta
     bloccato solo quando il 3D è vivo. Lo zoom vive sul wrapper interno (7.184.1), non sullo scroller. */
  useEffect(()=>{const el=document.querySelector('.cpm-scroll');if(!el)return;
    el.style.zoom="1";
    /* [7.184.4 collaudo PO «regressione grafica su queste 2 schermate»] il fondo scuro NON va su tutte le fasi:
       matchday e giornale post-partita hanno card CHIARE con testo scuro (tema normale) → su fondo scuro
       diventavano illeggibili. Resta solo dove il contenuto è nativamente broadcast-dark (formazioni) o c'è il
       canvas 3D (dove serviva a togliere la banda bianca). */
    /* [7.184.4b] il fondo deve COMBACIARE col contenuto, o sotto l'ultima card si vede una «fascia»: in formazioni
       è il colore finale del gradiente del pannello broadcast (#0d1528), nelle fasi 3D il nero-blu del canvas. */
    el.style.background=(phase==="matchday"||phase==="ended")?"":(phase==="formations"?"#0d1528":"#050810");/* [7.184.2] fondo scuro: sotto le card broadcast si vedeva il chiaro della pagina («spazio bianco inutile») · [7.184.3] zoom 1 per TUTTA la partita: `zoom` NON propaga l'altezza al contenitore di scroll (proprietà non-standard) → lo scroller credeva che il contenuto stesse nello schermo, non scrollava, e il CTA in eccesso restava irraggiungibile (misurato: bottone a y=733 su viewport 620 con scrollHeight==clientHeight) */
    const wr=document.querySelector('.cpm-match-wrap');/* [7.184.3] la finestra ad altezza fissa del match (flex:1+overflow:hidden) va APERTA nelle fasi DOM, o il contenuto in eccesso non entra nemmeno nel calcolo dello scroll */
    if(_zoomDom184){el.style.overflowY="auto";el.style.paddingBottom="calc(28px + env(safe-area-inset-bottom,0px))";if(wr){wr.style.overflow="visible";wr.style.flex="0 0 auto";}}
    else{el.style.overflowY="hidden";el.style.paddingBottom="0px";if(wr){wr.style.overflow="hidden";wr.style.flex="1";}}
    return()=>{el.style.zoom="1.12";el.style.background="";el.style.overflowY="";el.style.paddingBottom="";if(wr){wr.style.overflow="";wr.style.flex="";}};},[phase,_zoomDom184]);
  useEffect(()=>{phaseRef.current=phase;},[phase]);
  // [7.150.0 direttiva PO «riprendere anche DENTRO la partita»] SNAPSHOT per la ripresa dopo background: su
  //   visibilitychange(hidden)/pagehide salvo clock+punteggio+momentum della partita in corso → se la WebView si
  //   ricarica (background mobile) si rientra in campo allo stesso minuto/punteggio (vedi CareerApp). SOLO contesti di
  //   CLUB (career/cup/euro), mai sotto test/provino/panchina, solo in gioco reale e con clock nel vivo [3..86].
  //   Fedeltà onesta: ripresa COARSE (gli highlight rimanenti si rigenerano dal minuto di ripresa; l'esatto highlight
  //   in corso non è congelato). Lo snapshot si azzera a partita conclusa e in onMatchEnd (CareerApp).
  useEffect(()=>{
    const _resumable=(context==="career"||context==="cup"||context==="euro_group"||context==="euro_ko");
    if(!_resumable||_CPM_TEST||_SIT_TEST)return;
    const _sig=(player.name||"")+"|"+(player.season||1)+"|"+(player.week||1)+"|"+context+"|"+(isMatchHome?"H":"A");/* [7.178.0 RC-2] +nome: due slot alla stessa S/W non si scambiano più lo snapshot *//* season|week|context|sede identifica univocamente la gara della settimana (fixture deterministico) */
    const _snap=()=>{try{const ph=phaseRef.current,ck=clockRef.current|0;
      const live=(ph==="playing"||ph==="hl_intro"||ph==="hl_move"||ph==="hl_choose"||ph==="hl_result");
      if(live&&!onBenchRef.current&&!subbedOffRef.current&&ck>=3&&ck<=86)safeLS.set("cpm-match-resume",JSON.stringify({v:1,sig:_sig,context,isHome:isMatchHome,clock:ck,score:scoreRef.current,momentum:momentumRef.current,ms:{goals:mStatsSnapRef.current.goals||0,assists:mStatsSnapRef.current.assists||0,rb:mStatsSnapRef.current.rb||0,xg:mStatsSnapRef.current.xg||0},yc:heroYellowsRef.current||0,rc:!!heroRedRef.current}));/* [7.163.0 super-test LIVE-F3] il punteggio tornava ma la TUA doppietta spariva (matchHistory goals:0, gialli evaporati) → lo snapshot porta il tabellino personale */
    }catch(_e){}};
    const vh=()=>{if(document.visibilityState==="hidden")_snap();};
    document.addEventListener("visibilitychange",vh);window.addEventListener("pagehide",_snap);
    return()=>{document.removeEventListener("visibilitychange",vh);window.removeEventListener("pagehide",_snap);};
  },[]);// eslint-disable-line
  useEffect(()=>{if(phase==="ended"||phase==="ceremony"||phase==="shootout"){try{safeLS.set("cpm-match-resume","");}catch(_e){}}},[phase]);/* [7.150.0] partita conclusa → snapshot non più ripristinabile */
  useEffect(()=>{if(phase==="ended"){try{AudioMgr.hushMatch&&AudioMgr.hushMatch();}catch(_a){}}},[phase]);/* [7.102.0 collaudo PO] nella schermata GIORNALE (ended) il rumore folla/effetti partita si spengono */
  // 5.49.23 / [7.2.0]: CERIMONIA TROFEO 3D — quando la partita appena vinta assegna un titolo (titleStakes!=null),
  //   al fischio finale si entra nella FASE DEDICATA "ceremony" (il 3D resta montato: premiazione SUL CAMPO con
  //   giro di campo, sotto la curva e podio a centrocampo — vedi ThreeMatchView) e SOLO dopo si va a "ended" (card
  //   di uscita + onMatchEnd). Prima la cerimonia era codice morto: lo stato partiva a "ended" ma il 3D era già
  //   smontato (show3D escludeva "ended"). Solo visivo, gate-cieco (il gate non raggiunge mai fine partita reale).
  const [ceremony,setCeremony]=useState(null);
  const ceremonyEndRef=useRef(null);
  const CEREMONY_DUR=14000;// durata cerimonia 3D prima della card di uscita (skippabile con tap/Enter)
  useEffect(()=>{
    if(phase==="ceremony"){
      if(titleStakes&&!ceremony)setCeremony({name:titleStakes.name||"TITOLO",kind:titleStakes.kind||"cup"});
      if(ceremonyEndRef.current)clearTimeout(ceremonyEndRef.current);
      ceremonyEndRef.current=setTimeout(()=>{setPhase("ended");},(ceremony&&ceremony.light)?9500:(ceremony&&ceremony.kind==="int")?26500:(ceremony&&ceremony.kind==="cup")?17500:(ceremony&&ceremony.kind==="promo")?19500:23500);/* [7.425.0 evolutiva celebrazioni] LA DURATA SEGUE LO SCRIPT: il timer fisso (CEREMONY_DUR) tagliava lo script per competizione a meta' — la coppa non arrivava al sollevamento, lo scudetto mai alla festa. Le durate coprono la somma dei beat col loro jitter (±25%) piu' un margine: coppa ~15s, promo ~17s, scudetto ~20s, internazionale ~24s. */
      return()=>{if(ceremonyEndRef.current){clearTimeout(ceremonyEndRef.current);ceremonyEndRef.current=null;}};
    }
  },[phase]);
  // decide a fine partita: se è stato vinto un titolo → premiazione 3D, altrimenti direttamente la card di fine gara.
  //   Hoisted (function decl) → richiamabile dai callback del clock/handleContinue definiti più sopra nel corpo.
  function _goEndOrCeremony(){
    try{AudioMgr.event({type:'MatchEnd'});}catch(_a){}/* [7.62.0 AUDIO] triplice fischio finale */
    try{setClock(c=>Math.max(c,90));clockRef.current=Math.max(clockRef.current||0,90);}catch(_ck){}/* [7.327.0 collaudo PO «i rigori non devono essere al 69esimo minuto!»] il fischio finale arriva all'ULTIMO highlight (7.2.0), che sul cronometro puo' essere il 69': da qui in poi (rigori, premiazione, ended) l'orologio DEVE dire 90' — header e maxischermo leggono entrambi da qui. Il hook di test __CPM_SO_FORCE lo faceva gia'; il path vero no */
    // [7.24.3 BUG GRAVE collaudo PO «di nuovo loop nelle ultime giornate, partita già giocata e vinta con
    //   tanto di premiazione»] il risultato veniva COMMITTATO solo al tap del post-partita (onMatchEnd):
    //   tra fischio finale → premiazione (14s) → ended c'è una LUNGA finestra in cui chiudere/perdere l'app
    //   CANCELLAVA l'intera partita → riproposta al reload (loop). Ora al FISCHIO FINALE il risultato viene
    //   scritto in un SIDECAR (localStorage 'cpm-pending-mr'): onMatchEnd lo consuma/azzera al commit vero;
    //   se l'app muore prima, CareerApp lo RECUPERA al mount e ri-dispatcha lo STESSO onMatchEnd (una volta,
    //   validato su nome/stagione/settimana + voce di calendario ancora non giocata). Provini esclusi.
    try{if(context!=="trial"&&!_SIT_TEST){
      const _r=_buildEndResult();
      localStorage.setItem('cpm-pending-mr',JSON.stringify({v:1,n:player?.name||"",s:(player?.season||1),w:(player?.week||1),oid:(opponent&&opponent.id)||null,on:(opponent&&(opponent.n||opponent.name))||null,ih:(isMatchHome!==false),result:_r}));/* [7.326.0] chiavi RICCHE (id+nome+sede): il recovery ritrovava la voce SOLO per uguaglianza di nome alla settimana corrente — ogni mismatch cancellava l'unica prova della partita giocata */
      try{safeLS.set('cpm-match-resume','');}catch(_e){}/* [7.163.0 super-test LIVE-F5] mutua esclusione: col risultato già nel sidecar uno snapshot in-match stantio farebbe RIGIOCARE la partita mentre il recovery la committa (doppio conteggio) */
    }}catch(_e){}
    try{/* [7.31.0] turno KO pareggiato → CALCI DI RIGORE 3D prima del post-partita (l'esito non si scopre più
        all'uscita). Solo presentazione: stesso seed/esito della risoluzione in onMatchEnd (6.48). */
      const _scS=(scoreRef&&scoreRef.current)?scoreRef.current:score;
      if(!soDoneRef.current&&_koSeed&&_scS.home===_scS.away&&context!=="trial"){_startShootout();return;}
    }catch(_e){}
    try{const _sc=(scoreRef&&scoreRef.current)?scoreRef.current:score;
      if(titleStakes&&((_sc.home>_sc.away)||titleStakes.late)){setPhase("ceremony");return;}
      /* [7.42.0 Sprint 5 — chiude il follow-up 6.88 «coreografie 3D VERE post-partita»] BIG WIN senza titolo:
         vittoria in una finale KO o in un big match (mw≥9) → festa BREVE sotto la curva in 3D prima del
         post-partita (cerimonia LIGHT: niente trofeo/podio, ~9.5s, skippabile). Provini esclusi. */
      if(_sc.home>_sc.away&&(_isFinalKO||mw>=9)&&context!=="trial"){
        setCeremony({name:_isFinalKO?"Trionfo in finale":"Notte da grandi",kind:"bigwin",light:true});
        setPhase("ceremony");return;
      }
    }catch(_e){}
    setPhase("ended");
  }
  const skipCeremony=()=>{if(ceremonyEndRef.current){clearTimeout(ceremonyEndRef.current);ceremonyEndRef.current=null;}setPhase("ended");};
  // [7.31.0 direttiva PO «rigori 3D nelle coppe pareggiate: suspense + esito IN partita»] CALCI DI RIGORE
  //   dal dischetto al fischio finale dei turni KO pareggiati (cup/euro_ko/euroMondiale_ko). PURA PRESENTAZIONE:
  //   l'esito è quello che onMatchEnd deciderà comunque (koShootoutWin sullo STESSO seed 6.48 → coerente per
  //   costruzione, zero nuovi campi save); la SERIE è generata seedata e vincolata a quell'esito (early-stop
  //   reale, sudden death, nomi VERI dai roster, l'eroe calcia l'ultimo della serie). Il sidecar 7.24.3 è già
  //   scritto PRIMA dello shootout → chiudere l'app a metà serie non perde nulla.
  const [soState,setSoState]=useState(null);
  const soStateRef=useRef(null);useEffect(()=>{soStateRef.current=soState;},[soState]);
  const [soFx,setSoFx]=useState(null);
  const soDoneRef=useRef(false);
  function _startShootout(){
    try{
      const won=!!(_koSeed&&typeof koShootoutWin==="function"&&koShootoutWin(player,_koSeed));
      const seed=(Math.abs(hashStr(String(_koSeed)+"|serie"))>>>0)||1;const r=seededRng(seed);
      let seq=null;
      for(let t=0;t<80&&!seq;t++){
        const cand=[];let h=0,a=0;
        for(let i=0;i<5;i++){const sH=r()<0.78;cand.push({side:"H",scored:sH});if(sH)h++;const sA=r()<0.74;cand.push({side:"A",scored:sA});if(sA)a++;}
        let j=0;while(h===a&&j<6){const sH=r()<0.78;cand.push({side:"H",scored:sH});if(sH)h++;const sA=r()<0.74;cand.push({side:"A",scored:sA});if(sA)a++;j++;}
        if(h===a){cand.push({side:"H",scored:won});if(won)h++;cand.push({side:"A",scored:!won});if(!won)a++;}
        if((h>a)===won)seq=cand;
      }
      if(!seq){seq=[];for(let i=0;i<5;i++){seq.push({side:"H",scored:won?i<4:i<2});seq.push({side:"A",scored:won?i<2:i<4});}}
      /* EARLY-STOP reale: la serie si ferma quando è matematicamente decisa (entro i 5 regolamentari) */
      {let h=0,a=0,hn=0,an=0,cut=seq.length;
       for(let i=0;i<seq.length;i++){const k=seq[i];if(k.side==="H"){hn++;if(k.scored)h++;}else{an++;if(k.scored)a++;}
         if(hn<=5&&an<=5){const hL=5-hn,aL=5-an;if(h>a+aL||a>h+hL){cut=i+1;break;}}}
       seq=seq.slice(0,cut);}
      const r2=seededRng((seed^0x9e3779b9)>>>0);
      seq.forEach(k=>{k.dir=[-1,0,1][Math.floor(r2()*3)];k.high=r2()<0.38;k.wide=!k.scored&&r2()<0.30;});
      /* nomi VERI: i tuoi dal roster (l'eroe calcia l'ULTIMO della tua serie — suspense), i loro dal roster
         avversario (generateTeamRoster funziona anche sulle nazionali: pesca i nomi dalla nat del club) */
      const _rosH=(typeof generateTeamRoster==="function")?generateTeamRoster(player.club||{id:"x",nat:"🇮🇹"},player.season||1):null;
      const _rosA=(typeof generateTeamRoster==="function")?generateTeamRoster(opponent||{id:"y",nat:"🇮🇹"},player.season||1):null;
      const _nH=(_rosH||[]).slice(1).map(x=>x&&x.name).filter(Boolean).slice(-9);
      const _nA=(_rosA||[]).slice(1).map(x=>x&&x.name).filter(Boolean).slice(-9);
      const _hLast=seq.filter(k=>k.side==="H").length-1;
      let hi=0,ai=0,hIx=0;
      const _heroOut178=!!(heroRedRef.current||subbedOffRef.current);/* [7.178.0 RC-16] espulso/sostituito ⇒ NON calcia la serie (regolamento: solo chi è in campo al 120) */
      seq.forEach(k=>{if(k.side==="H"){k.hero=(hIx===_hLast)&&!_heroOut178;k.kicker=k.hero?(player.name||"Tu"):(_nH[hi++]||("Compagno "+(hi+1)));hIx++;}else{k.kicker=_nA[ai++]||("Avversario "+(ai+1));}});
      soDoneRef.current=false;
      setSoState({seq,won,step:-2,hs:0,as:0,cur:null,done:false});
      setSoFx(null);
      setPhase("shootout");
    }catch(_e){setPhase("ended");}
  }
  const skipShootout=()=>{try{setSoState(s=>{if(!s)return s;const hs=s.seq.filter(k=>k.side==="H"&&k.scored).length,as=s.seq.filter(k=>k.side==="A"&&k.scored).length;return{...s,step:s.seq.length*2,hs,as,cur:null,done:true};});setSoFx(null);}catch(_e){}};
  useEffect(()=>{/* [7.31.0] motore della serie: intro → (setup 3D → reveal) per ogni rigore → banner finale → continua */
    if(phase!=="shootout"||!soState)return;
    if(soState.done){
      const t=setTimeout(()=>{soDoneRef.current=true;
        const _fin=(context==="euroMondiale_ko"&&player.euroMondiale?.koPhase==="final")||(context==="euro_ko"&&player.euro?.phase==="final")||(context==="cup"&&(player.cup?.round||0)>=4)||(context==="nationsCup"&&!!player.nationsCupQueue?.isFinal);/* [7.327.0 collaudo PO «ho vinto ai rigori e non e' partito il festeggiamento 3D»] la finale di Coppa delle Nazioni mancava dal cancello: il 7.72.2 le aveva dato i RIGORI (_koSeed natcup|final) ma nessuno le aveva dato la CERIMONIA — vinta ai rigori si andava dritti a ended */
        if(soState.won&&_fin){setCeremony({name:context==="cup"?"COPPA NAZIONALE":context==="nationsCup"?"COPPA DELLE NAZIONI":"CAMPIONI!",kind:context==="cup"?"cup":context==="nationsCup"?"int":"euro"});setPhase("ceremony");}
        else setPhase("ended");
      },3600);
      return()=>clearTimeout(t);
    }
    const st=soState.step+1;
    const kickN=Math.floor(Math.max(0,st)/2);
    const delay=soState.step<-1?1500:(soState.step<0?1500:(st%2===0?1250:1950));
    const t=setTimeout(()=>{
      if(st>=0&&kickN>=soState.seq.length){setSoState(s=>({...s,step:st,cur:null,done:true}));return;}
      if(st<0){setSoState(s=>({...s,step:st}));return;}
      if(st%2===0){const k=soState.seq[kickN];setSoFx({key:kickN,side:k.side,dir:k.dir,high:k.high,scored:k.scored,wide:k.wide});setSoState(s=>({...s,step:st,cur:kickN}));}
      else{const k=soState.seq[kickN];setSoState(s=>({...s,step:st,hs:s.hs+(k.side==="H"&&k.scored?1:0),as:s.as+(k.side==="A"&&k.scored?1:0)}));}
    },delay);
    return()=>clearTimeout(t);
  },[phase,soState]);// eslint-disable-line
  const [hlIdx,setHlIdx]=useState(0);
  const hlIdxRef=useRef(0);useEffect(()=>{hlIdxRef.current=hlIdx;},[hlIdx]);// VISUAL-TEST: indice HL corrente per gli hook
  const handleActionRef=useRef(null);// VISUAL-TEST: riferimento sempre aggiornato a handleAction (evita closure stale)
  const handleRigoreRef=useRef(null);// [6.3.0 R0] idem per il rigore (l AUTOPLAY del validator risolve anche i penalty)
  const handleContinueRef=useRef(null);/* [7.227.0 #44] idem per handleContinue: in REVISIONE la continuazione della catena parte da un effect (pattern anti-closure-stale) */
  const _rvwChainOkRef=useRef(true),_rvwChainArmRef=useRef(false);/* [7.227.0 #44] esito da propagare al secondo tempo + armamento one-shot per ciclo di revisione */
  // position resets to situation startZone on each new highlight
  const [pPos,setPPos]=useState(()=>getStartPos(situations[0])||{x:58,y:50});
  const pPosRef=useRef({x:58,y:50});
  const _contKeyRef=useRef(null);/* [7.399.0 codice 002] chiave «continuita' gia' applicata» per scena (hlIdx+forceSeq) */
  const _stagedSpotRef=useRef(null);/* [7.402.0 codice 001] il punto-palla che lo staging ha usato per piazzare il battitore: il piazzamento della palla lo RIUSA — una sorgente sola, niente doppio calcolo di hlBallSpot con esiti diversi */
  const deliverRef=useRef(null);/* [7.383.0] la CASSETTA POSTALE della consegna: React ci lascia cosa serve, il renderer ci mette l'origine vera quando ha i ventidue in posizione */
  const _dlvSeenRef=useRef(null);/* [7.383.0] una consegna per scena: l'effetto che la contiene dipende da `pPos` e si ri-esegue di continuo */
  const _batRef=useRef({arm:null,done:null});/* [7.538.0] il piazzato battuto: `arm` = scena in cui il timer e' partito, `done` = scena in cui la palla ha gia' lasciato la bandierina (da li' in poi il ramo NON la rimette piu' li') */
  const meshDefRef=useRef(null);/* [7.322.0] ponte verso le posizioni VERE dei difensori nella scena 3D (lettura a richiesta, nessun costo per frame) — il marcatore dev'essere quello che l'utente vede */
  useEffect(()=>{pPosRef.current=pPos;},[pPos]);
  const [mStats,setMStats]=useState((resumeState&&resumeState.ms&&typeof resumeState.ms.goals==="number")?{goals:resumeState.ms.goals||0,assists:resumeState.ms.assists||0,rb:resumeState.ms.rb||0,xg:resumeState.ms.xg||0}:{goals:0,assists:0,rb:0,xg:0});
  const mStatsSnapRef=useRef(mStats);useEffect(()=>{mStatsSnapRef.current=mStats;},[mStats]);/* [7.178.0 RC-1] lo snapshot di ripresa leggeva mStats dalla CLOSURE del mount (deps []) → doppietta salvata come 0 gol: specchio in ref, sempre fresco *//* [7.163.0 LIVE-F3] ripresa: tabellino personale ripristinato */
  const assistLinksRef=useRef({given:[],received:[]});/* [7.110.0 collaudo PO «memorizza a chi ho fatto l'assist e chi mi ha fatto l'assist»] connessioni coi compagni VERI, seedate, persistite in matchHistory per gli sbocchi narrativi */
  const [energy,setEnergy]=useState(100);
  const [coms,setComs]=useState([]);
  const [outcome,setOutcome]=useState(null);
  const [resultReveal,setResultReveal]=useState(true);// [5.92.0 FIX PO «niente suspense»] l'esito si LEGGE solo dopo che il 3D l'ha mostrato
  const [chosenAct,setChosenAct]=useState(null);
  const [selectedActionIdx,setSelectedActionIdx]=useState(0);
  // Possession: based on player OVR vs opponent prestige (read directly from prop, not from oppPrestige var)
  const [possession,setPossession]=useState(()=>{
    const opp=opponent?.p||opponent?.prestige||65;
    const diff=(player.ovr||65)-opp;
    return clamp(Math.round(50+diff*0.28+rng(-5,5)),22,78);
  });
  const possessionRef=useRef(50);
  useEffect(()=>{possessionRef.current=possession;},[possession]);
  const lastShoutRef=useRef({ck:-99,txt:""});// MISTER #5: spaziatura + anti-ripetizione delle grida da bordo campo
  const [ballPos,setBallPos]=useState({x:50,y:50});
  const ballPosRef=useRef({x:50,y:50});
  useEffect(()=>{ballPosRef.current=ballPos;},[ballPos]);
  const [mxStats,setMxStats]=useState({shots:0,oppShots:0,fouls:0,corners:0});
  const [matchEvents,setMatchEvents]=useState([]); // Sprint 113: {min,type,txt} key events for ended screen
  // [6.5.0 R2-residuo] LEDGER UNICO degli eventi partita: unica via di scrittura del match-event feed.
  //   Applica in UN SOLO posto il clamp MONOTÒNO del minuto (mai a ritroso / mai collisione) + cap 90' + slice(-12).
  //   Prima 6 siti duplicavano la logica con semantiche diverse (handleAction/handleRigore monotòni; bgMicro con
  //   `nx` grezzo → i minuti dei gol ambientali potevano non essere monotòni). Ora tutti coerenti per costruzione.
  const pushMatchEvent=(min,type,txt)=>setMatchEvents(prev=>{const _lm=prev.length>0?prev[prev.length-1].min:-1;const _em=Math.min(90,_lm>=min?_lm+1:min);return[...prev,{min:_em,type,txt:(typeof txt==="function"?txt(_em):txt)}].slice(-12);});
  const lastBGEvtRef=useRef([]); // Sprint 113: ultimi txt BG_MATCH esclusi dal picker — dedup (finestra 3→6 in 7.48.0: col pool a ~135 voci l'eligible resta ampio)
  /* [7.666.0 L5] l'azione della libreria in corso e il registro anti-ripetizione (partita + recenti) */
  /* [7.669.0 — EROE PROTAGONISTA, prima release. Direttiva PO: «interazioni eroe con mister,
     compagni ed avversari zero». Questo e' lo STATO NARRATIVO della proposta (docs/PROPOSTA-EROE-
     PROTAGONISTA.md §1), tenuto leggero: quel che serve per scegliere con criterio e non ripetersi.
     Nessun campo tocca il punteggio: il microsim resta l'unica autorita' del risultato. */
  const narrRef669=useRef({duelliV:0,duelliP:0,occFallite:0,giocate:0,golSub:0,golFatti:0,
    ultima:-99,fatte:[],marcatura:0,intesa:0});
  /* [7.681.0] LA SCELTA IN SOSPESO: quale scheda ha appena parlato, con che opzioni e con quale
     contesto era stata scritta la frase. Vive in un ref e non in uno stato perche' il banner la legge
     durante il render e il tick la scrive: uno stato in piu' rifarebbe il render della partita a ogni
     riga di cronaca. */
  const intxPendRef681=useRef(null),intxCtxRef681=useRef({});
  const libAzRef666=useRef(null);
  const libRegRef666=useRef({partita:[],recenti:[],ultima:-99});
  const [waveEvent,setWaveEvent]=useState(null);
  const [bgAction,setBgAction]=useState(null); // ATE-1: tipo azione corrente per arco palla 3D
  const [actionEffect,setActionEffect]=useState(null);
  const [screenFlash,setScreenFlash]=useState(null);
  // [6.5.1 SICUREZZA — rischio epilessia] GOVERNOR anti-strobo dei flash a schermo intero: intervallo MINIMO
  //   fra due flash (≥750ms → max ~1.3 flash/s, ben sotto la soglia delle linee guida WCAG di 3/s) + CAP
  //   dell'opacità di picco a 0.42 (niente lampi accecanti). La luminanza a tutto schermo — la vera fonte di
  //   rischio — non può più susseguirsi rapidamente né saturare. Tutti i setScreenFlash della partita passano di qui.
  const _lastFlashRef=useRef(0);
  const flashScreen=(cfg)=>{const now=Date.now();if(now-_lastFlashRef.current<750)return;_lastFlashRef.current=now;
    let c=cfg&&cfg.col;try{if(c){const _m=c.match(/rgba?\(([^)]+)\)/);if(_m){const _p=_m[1].split(",").map(s=>s.trim());if(_p.length>=4){const _a=Math.min(parseFloat(_p[3])||0,0.42);c=`rgba(${_p[0]},${_p[1]},${_p[2]},${_a})`;}}}}catch(_e){}
    setScreenFlash({...cfg,col:c});};
  const [cutFx,setCutFx]=useState(null);// stacco nero di transizione sull'esito positivo
  const [floatGoal,setFloatGoal]=useState(null);
  const [goalCinema,setGoalCinema]=useState(null); // Sprint 95: {text,col,key,shakeKey}
  // 5.43.4 — REGOLA GENERALE: l'esultanza ("GOL"+grafica+coriandoli+boato) parte SOLO quando la palla ENTRA in
  //   rete (callback onGoalInNet dal renderer 3D), non al momento della scelta → niente accavallamento con l'azione.
  //   Fallback di sicurezza (timeout) se il segnale d'ingresso non arriva (es. renderer 2D / arco anomalo).
  const festa587=useRef(null);/* [7.587.0] la festa del gol in attesa che il pallone ENTRI: {home,stadiumHome,gx,ticks} */
  const golAttesa575=useRef(null);/* [7.575.0] il gol che il micro-simulatore ha gia' deciso ma che non puo' ancora essere scritto: aspetta il calcio d'inizio del gol precedente. Non si perde mai — il tabellino resta quello del microsim */
  const kickAtt573=useRef(0),kickGx573=useRef(null),kickIn573=useRef(false);/* [7.573.0] la ripartenza aspetta che il pallone sia ENTRATO: quale porta, quanti tick ha gia' atteso (tetto dieci), e se l'ingresso e' gia' avvenuto (latch: un rimbalzo fuori non riapre l'attesa) *//* [7.573.0] quanti tick la ripartenza ha gia' aspettato che il pallone arrivasse in rete (tetto: dieci) */
  const cineBusyRef=useRef(null);/* [7.461.0 direttiva PO «le azioni/scene/highlights possono prendersi anche piu' tempo»] IL RENDERER DICHIARA SE HA ANCORA QUALCOSA DA MOSTRARE. Il 7.460 aveva lasciato aperto, e portato al PO, un conflitto fra due sistemi: la finestra d'esito e' un `setTimeout` in tempo REALE mentre la catena cinematica (build-up → arco → post-arco) gira sul CLOCK DI SCENA, che `dt` tappa a 0.05 — a fps bassi, headless o telefono lento, il clock di scena avanza meno della meta' del reale e la finestra si chiudeva con l'arco ancora in volo, lasciando il pallone a meta' campo su un gol contato. La precedenza l'ha decisa il PO: e' la SCENA ad avere la precedenza. Qui il renderer scrive, ogni fotogramma, se build-up/arco/post-arco sono vivi; l'auto-avanzamento (r.~20360) non chiude finche' non ha finito. */
  const goalCelebRef=useRef(null);
  const [celebPlan,setCelebPlan]=useState(null);/* [7.371.0] il PIANO d'esultanza deciso alla conferma del gol */
  const _celEndRef=useRef(0);/* [7.384.0] QUANDO l'esultanza finisce, in tempo reale: l'auto-avanzamento deve saperlo per non tagliarla */
  const _celKillRef392=useRef(null);/* [7.392.0] l'azzeramento DIFFERITO del piano: uno solo in volo, cosi' due gol ravvicinati non si spengono a vicenda */
  const celebRecentRef=useRef([]);/* [7.371.0] ultime esultanze della partita: se l'eroe segna due volte non rifa la stessa */
  /* [7.373.0 direttiva PO §14/§15 «gestire specificamente rigori e punizioni»] LA COSTRUZIONE DEL
     PIANO E' UNA FUNZIONE, NON UN PEZZO DI `fireGoalCeleb`.
     MISURATO: 3 gol da piazzato su 3 non producevano NESSUNA esultanza. Il ramo dei piazzati
     (`handleSetPiece`) non attraversa `fireGoalCeleb` — il commento nel codice lo dichiara da sempre
     («boato sul gol da rigore (non passa da fireGoalCeleb)») — e siccome il Celebration System del
     7.371 ha in quella funzione la sua unica porta, rigori e punizioni restavano fuori: niente piano,
     niente boato, niente coriandoli, niente `celebT` (che si arma dal cambio di `waveEvent`). Non era
     una lacuna della feature nuova: era un buco piu' vecchio che la feature nuova ha reso visibile.
     Estrarre la costruzione del piano invece di duplicarla e' anche cio' che la direttiva §20 chiede:
     GOAL CONTEXT e CELEBRATION SELECTION non appartengono al flusso degli highlight, appartengono al
     gol. Le due strade restano distinte in tutto il resto (il piazzato ha overlay, cronaca e punteggio
     suoi): condividono solo il pezzo che decide COME si esulta. */
  const buildCelebPlan=useCallback((_o)=>{
    const _oo=_o||{};
    try{
      const _rd=meshDefRef.current&&meshDefRef.current();
      const _sc=scoreRef.current||{home:0,away:0};
      const _min=Math.round(+clockRef.current||0);
      const _hx=(_rd&&_rd.hero)?_rd.hero.x:pPosRef.current.x,_hy=(_rd&&_rd.hero)?_rd.hero.y:pPosRef.current.y;
      const _mates=(_rd&&_rd.home)||[];
      let _dMate=1e9,_near=0;
      for(let _i=0;_i<_mates.length;_i++){const _d=Math.hypot(_mates[_i].x-_hx,_mates[_i].y-_hy);if(_d<_dMate)_dMate=_d;if(_d<28)_near++;}
      const _ctx=goalContext({by:_oo.by||"hero",minute:_min,usBefore:_sc.home||0,themBefore:_sc.away||0,setPiece:_oo.setPiece||null,bigMatch:!!_oo.bigMatch});
      /* SPAZIO REALE: quanto campo c'e' davvero prima della linea di fondo e della bandierina. Serve a
         non scegliere una corsa che finirebbe dentro un palo o fuori dal campo (direttiva §11). */
      const _space={toCrowd:Math.max(0,92-_hx),toCorner:Math.max(0,92-_hx),toMates:(_dMate<1e9?_dMate:99),matesNear:_near};
      const _pick=pickCelebration(_ctx,{clips:{lift:true},space:_space,recent:celebRecentRef.current,seed:(_min*31+(_sc.home||0)*7+Math.round(_hy))});
      const _rec=celebRecentRef.current;_rec.push(_pick.id);if(_rec.length>3)_rec.shift();
      /* DURATA: scala con l'intensita' ma resta un'esultanza, non una cinematica. §12: «NON creare una
         cinematica di 10-15 secondi per ogni gol». 2,2s normale → 4,2s sul gol che decide la partita. */
      const _dur=[2.2,2.8,3.5,4.2][Math.max(0,Math.min(3,_ctx.heat))];
      setCelebPlan({id:_pick.id,clip:_pick.clip||null,run:_pick.run||0,toward:_pick.toward||null,jump:_pick.jump||0,slide:_pick.slide||0,quiet:_pick.quiet||0,
        dur:_dur,heat:_ctx.heat,tier:_ctx.tier,by:_ctx.by,key:_oo.key||Date.now(),
        /* §9: l'esultanza NON parte mentre l'eroe sta ancora calciando — si lascia finire il
           follow-through del tiro prima di muovere qualsiasi cosa. */
        delay:0.38});
      try{_celEndRef.current=performance.now()+(0.38+_dur)*1000+300;}catch(_e84){}/* [7.384.0] vedi l'auto-avanzamento */
      if(typeof window!=="undefined"&&(_CPM_TEST||_SIT_TEST)){try{window.__CPM_CELEB={ctx:_ctx,pick:_pick.id,dur:_dur};}catch(_e){}}
    }catch(_e){}
  },[]);// eslint-disable-line
  const fireGoalCeleb=useCallback(()=>{
    const g=goalCelebRef.current; if(!g||g.fired)return; g.fired=true;
    /* [7.371.0 direttiva PO «esultanze dopo i gol»] QUI, E SOLO QUI, IL GOL E' CONFERMATO.
       `fireGoalCeleb` e' gia' l'unico punto in cui il gioco dichiara la palla in rete (lo chiama il
       renderer con `onGoalInNet`), ed e' gia' idempotente: percio' e' la porta del Celebration System,
       invece di una porta nuova. Nessuna celebrazione puo' partire da nessun altro posto — e' cio' che
       rende impossibile festeggiare un gol annullato o non ancora determinato.
       Il piano si decide ORA con i due pezzi puri: `goalContext` pesa il gol sul RISULTATO (non sul
       minuto), `pickCelebration` sceglie fra le voci compatibili con lo spazio reale attorno al
       marcatore e con le clip davvero montate. Le posizioni si leggono dal ponte `meshDef` — le MESH,
       non l'array logico: la lezione del 7.322, ripagata nel 7.370. */
    buildCelebPlan({by:g.assist?"mate":"hero",setPiece:g.setPiece||null,bigMatch:!!g.bigMatch,key:g.gk});
    try{AudioMgr.event({type:'GoalHero',assist:!!g.assist});}catch(_a){}/* [7.62.0 AUDIO] boato SINCRONO all'ingresso in rete (non alla scelta) */
    // [6.5.1 Polish A] il TABELLONE si aggiorna ORA (palla in rete), non all'istante della scelta:
    //   lo score-increment del gol dell'eroe è differito qui → scoreboard + esultanza + rete SINCRONI.
    if(g.scoreHome){cpmEv("goal",{min:clockRef.current,side:"home",src:"highlight"});/* [7.496.0 F1b] il gol dell'EROE da gioco aperto */scoreRef.current={home:(scoreRef.current.home||0)+1,away:scoreRef.current.away||0};/* [7.120.0 audit live · Alta] il gol da GIOCO APERTO incrementa lo score LOGICO (scoreRef) SUBITO, come già fa il set-piece (fix C1 7.113.0): prima solo setScore differito → se era l'ULTIMO HL di un KO in parità e si toccava «Continua» nella finestra 800ms→ingresso-rete, `_goEndOrCeremony` leggeva ancora il pari → RIGORI FASULLI / sidecar con risultato stantìo. Il setScore resta per la sincronia visiva. L'useEffect([score]) riconcilia scoreRef al valore committato (stesso numero → nessun doppio conteggio). */setScore(sc=>({...sc,home:sc.home+1}));}
    setResultReveal(true);// [6.5.4] l'ESITO IN BASSO si rivela ORA (ingresso in rete = sovraimpressione GOL): pannello risultato + floatGoal/goalCinema SINCRONI (prima il pannello usciva a _rd92, spesso PRIMA dell'overlay col build-up R5)
    if(g.com)try{g.com();}catch(_e){}// [7.54.0 BL-15] anche la CRONACA del gol/assist esce all'ingresso in rete (prima a _rd92 fisso: la riga poteva precedere la palla in volo)
    flashScreen({col:"rgba(255,255,255,0.42)",dur:600});// [6.5.1 SICUREZZA] via il lampo 0.75 → 0.42 governato
    setFloatGoal({text:g.assist?"🎯 ASSIST!":"⚽ GOL!",col:"#f59e0b",key:g.gk});
    setGoalCinema({text:g.assist?"ASSIST!":"GOOOOL!",col:g.clubCol,key:g.gk,shakeKey:g.gk,assist:!!g.assist,scorer:g.scorerName,assister:g.assisterName});
    setWaveEvent({t:g.gk,home:true,stadiumHome:isMatchHome});// [6.24.0] home=lato-mesh (eroe=casa mesh) per esultanza giocatori/coriandoli; stadiumHome=lato TRIBUNA reale (l'eroe segna in trasferta → esulta la curva OSPITE, non quella di casa)
    setActionEffect({type:"goal",key:g.gk});
    fxTimeout(()=>setGoalCinema(null),2600);
    if(g.domino){setPressureCinema({text:"⚡ DOMINIO!",col:"#22c55e",key:g.gk+7});fxTimeout(()=>setPressureCinema(null),1800);}// 5.43.8: DOMINIO insieme all'esultanza (palla in rete), non più timer fisso che mancava la finestra
  },[]);// eslint-disable-line
  // [7.54.0 BL-15 · AC-049/050] SYNC ESITO↔ANIMAZIONE sui NON-gol (pattern onGoalInNet): overlay/cronaca/flash
  //   degli esiti senza rete (parata/palo/fuori/intercetto/recupero/chance) non escono più a timer FISSO
  //   (1800ms — col build-up R5 l'impatto 3D può arrivare DOPO, e sulle azioni rapide molto PRIMA) ma quando
  //   l'ARCO D'ESITO si conclude (onOutcomeShown dal renderer = impatto/assestamento). Floor di suspense
  //   minAt (=_rd92, la 5.92.0 resta) + fallback timer (2600ms) se il segnale non arriva (azione senza arco /
  //   renderer degradato). handleContinue marca il pendente come consumato (skip = niente reveal postumo).
  const outcomeRevealRef=useRef(null);
  const fireOutcomeReveal=useCallback(function _for(){const o=outcomeRevealRef.current;if(!o||o.fired)return;
    const _left=(o.minAt||0)-Date.now();
    if(_left>40){fxTimeout(()=>_for(),_left);return;}/* il 3D è arrivato prima del floor di suspense → rimanda al floor */
    o.fired=true;try{o.cb();}catch(_e){}},[]);// eslint-disable-line
  const [pressureCinema,setPressureCinema]=useState(null); // Sprint 97: {text,col,key}
  const streakRef=useRef(0); // Sprint 97: consecutive HL successes
  // M2 · MATCH MEMORY (effimera, NON salvata): memoria narrativa della partita → continuità cronaca (Manifesto Cap.5.6).
  //   Solo contatori derivati da esiti già deterministici; nessun campo in `player`, nessun bump SAVE_VERSION.
  const matchMemRef=useRef({goals:0,assists:0,misses:0,gkSaves:0,byFlank:{L:0,C:0,R:0}});
  const [movesLeft,setMovesLeft]=useState(0);
  // VISUAL-TEST: mirror esito/mosse su window (solo ?cpmtest=1) per validare stato finale e cap movimenti
  useEffect(()=>{ if(typeof window!=='undefined'&&!window.__CPM_STORE_BUILD&&/[?&]cpmtest=1\b/.test(window.location.search||"")){window.__CPM_OUTCOME=outcome;window.__CPM_MOVES=movesLeft;window.__CPM_DEFDIST=()=>defDistRef.current;window.__CPM_MOVEGAIN=(dx,dy)=>_moveGain317(dx,dy);window.__CPM_MARKER=()=>_marker317();/* [7.317.0] la probe misura il guadagno per direzione */} });/* [7.317.0] SENZA dep array: con `[outcome,movesLeft]` i gancetti restavano appesi a una closure VECCHIA — `__CPM_MOVEGAIN` misurava la posizione dell'eroe di parecchi render prima (32,53 invece di 90,59) e la direzione usciva INVERTITA. Il gioco usava la closure fresca ed era corretto: era la probe a leggere il passato. */// eslint-disable-line
  const [pressureBar,setPressureBar]=useState(1);
  const [paused,setPaused]=useState(false);
  /* [7.682.0 direttiva PO «le scelte interattive devono freezare la partita per almeno qualche secondo
     (almeno 20 secondi) cosi' ho modo di leggere e scegliere»] LA PARTITA SI FERMA DAVVERO.
     Nel 7.681 avevo messo il paletto opposto — «la partita non aspetta mai» — e il collaudo l'ha
     smentito: su un telefono, una domanda che scorre via mentre la leggi non e' una scelta. Non si usa
     `paused`, che blurra la scena e congela il lerp della camera falsando la regia (nota 7.211): si
     ferma il TICK della partita, e basta. La via d'uscita resta, ma a venti secondi: se nessuno tocca,
     parte l'opzione neutra e la gara riprende da sola. */
  const [scFreeze681,setScFreeze681]=useState(false);
  const [matchSpeed,setMatchSpeed]=useState(readMatchSpeed);/* [7.484.0] ritmo scelto dal giocatore */
  /* [7.338.0 direttiva PO «prevedere un pulsante di warning per niente invasivo durante il live match che
     permetta di prendere appunti sull'azione sbagliata … la partita deve essere messa in PAUSA finché non mi
     segno l'appunto in un campo in sovraimpressione dedicato»] TACCUINO DI COLLAUDO. Il tasto ⚠️ vive accanto
     alla pausa (stessa discrezione), FERMA la partita e apre il campo note; il CONTESTO dell'azione viene
     catturato da solo (minuto, fase, situation, azione scelta, esito, versione) così l'appunto è già un bug
     report completo e al PO resta da scrivere solo cosa non va. Gli appunti si salvano in locale e si copiano
     con un tocco (anche in blocco, dal Profilo). Mai in store build: è uno strumento di collaudo. */
  const [bugNote,setBugNote]=useState(null);/* {ctx, txt} */
  /* [7.347.0 collaudo PO «e' poco fruibile, la cronaca non si puo' temporaneamente nascondere?»] Il pannello
     riservava SEMPRE quattro righe piu' l'intestazione, anche a inizio partita quando ne ha una sola, e con la
     tastiera aperta sul campo appunti restavano due righe di testo visibili. Ora si richiude con un tocco
     sull'intestazione e la scelta resta sul dispositivo. */
  const [cronacaOpen,setCronacaOpen]=useState(()=>{try{return safeLS.get("cpm-cronaca")!=="0";}catch(_e){return true;}});
  const toggleCronaca=()=>setCronacaOpen(v=>{const n=!v;try{safeLS.set("cpm-cronaca",n?"1":"0");}catch(_e){}return n;});
  /* [7.340.0] REGISTRO DELLE SCENE della partita: ogni highlight lascia una riga (chiave di scena, minuto,
     situation, intento, e — appena si sa — azione scelta ed esito). Serve a due cose: dare un nome alle azioni
     nel campo appunti e permettere di annotarne una PASSATA, non solo quella a schermo. */
  const sceneLogRef=useRef([]);
  useEffect(()=>{try{
    if(!devToolsOn())return;/* [7.344.0] era `__CPM_STORE_BUILD`: sul telefono il registro restava VUOTO e il selettore «quale azione» non compariva mai — il difetto che il PO ha segnalato («a volte l'azione sfugge perche' parte quella successiva») */
    if(!["hl_intro","hl_move","hl_choose","hl_result"].includes(phase))return;
    const key=hlIdx+(_forceSeqRef.current||0)*10000;
    const L=sceneLogRef.current;
    if(L.length&&L[L.length-1].key===key)return;
    const sit=(situations||[])[hlIdx]||null;
    L.push({key,min:clockRef.current|0,sit:sit?String(sit.text||"").slice(0,70):null,
      gi:sit&&typeof SITUATIONS!=="undefined"?SITUATIONS.indexOf(sit):-1,
      intent:sit?((typeof deriveIntent==="function"?deriveIntent(sit,null):null)||sit.it||null):null,act:null,out:null,ok:null});
    if(L.length>40)L.shift();
  }catch(_e){}},[phase,hlIdx]);// eslint-disable-line
  useEffect(()=>{try{
    if(!outcome)return;const L=sceneLogRef.current;if(!L.length)return;
    const e=L[L.length-1];e.act=outcome.actionLabel||outcome.label||e.act;e.out=outcome.outKey||outcome.outKind||e.out;e.ok=outcome.ok;
  }catch(_e){}},[outcome]);// eslint-disable-line
  const _bugCtx=(sc)=>{try{
    if(sc)return{v:GAME_VERSION,when:`S.${player.season||1} W.${player.week||1}`,min:sc.min,phase:"hl",
      opp:(opponent&&(opponent.n||opponent.a))||"?",score:`${score.home}-${score.away}`,
      sit:sc.sit,gi:sc.gi,intent:sc.intent,act:sc.act,out:sc.out,ok:sc.ok,sceneKey:sc.key};
    const sit=(situations||[])[hlIdx]||null,o=outcome||null;
    const _act=(o&&(o.actionLabel||o.label))||null;
    return{v:GAME_VERSION,when:`S.${player.season||1} W.${player.week||1}`,fps:(typeof window!=='undefined'&&window.__CPM_FPS708)?Math.round(window.__CPM_FPS708):null,/* [7.708.0] il frame-rate REALE del dispositivo nella nota: e' il numero che decide se i difetti da basso-fps (camera in tempo-di-scena, verbale ai lerp) esistono dal PO */min:clock,phase,
      opp:(opponent&&(opponent.n||opponent.a))||"?",score:`${score.home}-${score.away}`,
      sit:sit?String(sit.text||"").slice(0,90):null,gi:sit?((typeof SITUATIONS!=="undefined"?SITUATIONS.indexOf(sit):-1)):-1,
      intent:sit?((typeof deriveIntent==="function"?deriveIntent(sit,null):null)||sit.it||null):null,
      act:_act,out:o?(o.outKey||o.outKind||null):null,ok:o?!!o.ok:null,def:!!(sit&&sit.type==="def"),
      sceneKey:["hl_intro","hl_move","hl_choose","hl_result"].includes(phase)?(hlIdx+(_forceSeqRef.current||0)*10000):null};
  }catch(_e){return{v:GAME_VERSION,min:clock,phase};}};
  if(typeof window!=='undefined'){try{window.__CPM_BUGCTX=_bugCtx;}catch(_e){}}/* [7.698 strumentazione] LA SONDA DEVE CHIAMARE IL DETECTOR COME LO CHIAMA IL GIOCO. Censendo i codici del PO ho passato a `draftBugNote` la sola chiave di scena: senza `intent`/`out` il test «e' una scena difensiva?» e' sempre falso, e il codice 001 — che per progetto esce SOLO sulle offensive — scattava anche su una scena `recover`. Il falso positivo era nel mio strumento, non nel gioco, e mi avrebbe fatto inseguire un difetto inesistente su meta' del campione. Esposto il costruttore vero: una fonte sola per il gioco e per la misura. */
  /* [7.344.0 collaudo PO «a volte l'azione sfugge perche' parte quella successiva»] QUALE AZIONE PROPORRE.
     Il momento in cui si preme ⚠️ non e' il momento dell'azione da segnalare: quando ci si accorge del
     difetto la scena e' finita, ne e' partita un'altra e la camera si e' allargata. Quindi:
       · fuori da un highlight (fase «playing») -> l'ULTIMA azione giocata, non il nulla in corso;
       · dentro una scena appena iniziata e non ancora conclusa -> quella PRIMA, che e' l'unica di cui ci
         sia qualcosa da dire.
     Resta tutto scegliebile a mano coi tasti ◀ ▶. */
  const _pickDefaultScene=()=>{try{
    const L=sceneLogRef.current||[];
    const inHL=["hl_intro","hl_move","hl_choose","hl_result"].includes(phase);
    if(!inHL&&L.length)return _bugCtx(L[L.length-1]);
    if(L.length>=2&&L[L.length-1].out==null&&L[L.length-2].out!=null)return _bugCtx(L[L.length-2]);
  }catch(_e){}return _bugCtx();};
  const _bugFmt=(n)=>`[KE ${n.ctx.v}] ${n.ctx.when||""} · ${n.ctx.min}' · ${n.ctx.phase}${n.ctx.fps?` · ${n.ctx.fps}fps`:""}${n.ctx.opp?` · vs ${n.ctx.opp} (${n.ctx.score||"-"})`:""}\n`/* [7.708.1] gli fps nel TESTO della nota: il 7.708.0 li aveva messi nel contesto ma non nella stampa — le prime note dal telefono sono arrivate senza il numero per cui la release era nata */
    +(n.ctx.sit?`SIT${n.ctx.gi>=0?` #${n.ctx.gi}`:""}${n.ctx.intent?` [${n.ctx.intent}]`:""}: «${n.ctx.sit}»\n`:"")
    +(n.ctx.act?`AZIONE: «${n.ctx.act}» → esito ${n.ctx.out||"?"}${n.ctx.ok===false?" (fallita)":n.ctx.ok===true?" (riuscita)":""}\n`:"")
    +`NOTA: ${n.txt}`;
  const _bugSave=(copy)=>{const n=bugNote;if(!n)return;
    const rec={...n,t:Date.now()};
    try{const cur=JSON.parse(safeLS.get("cpm-bugnotes")||"[]");cur.unshift(rec);safeLS.set("cpm-bugnotes",JSON.stringify(cur.slice(0,60)));}catch(_e){}
    if(copy){try{navigator.clipboard.writeText(_bugFmt(rec)).catch(()=>{});}catch(_e){}}
    setBugNote(null);setPaused(false);};
  // [7.9.3 direttiva PO «basta burattini: se CH38 non è pronto NON si gioca — prendi tempo in maniera paracula»]
  //   il backstop 3s del 7.8.25 rimandava in campo i procedurali su rete lenta e la partita PARTIVA coi burattini
  //   (screenshot PO al 20'). Ora il KICKOFF è TRATTENUTO finché il CH38 non è agganciato: overlay broadcast
  //   («le squadre si schierano…», righe che ruotano) sopra il campo, clock fermo, niente HL. Sblocco: GLB pronto
  //   (__CPM_GLB_READY, settato da ThreeMatchView) oppure cap 30s (ultima risorsa: burattini, mai deadlock).
  //   Sotto ?cpmtest=1 la trattenuta è SPENTA (è presentazione: il gate/validator campionano a tempi fissi —
  //   stesso pattern del read-freeze 5.47.12).
  const [kickoffHold,setKickoffHold]=useState(true);
  const [holdTick,setHoldTick]=useState(0);
  /* [7.264.0 direttiva PO «burattini non ne voglio mai vedere in campo, piuttosto messaggio di errore/warning»]
     glbFail: il CH38 non e' arrivato (lento o errore). Prima il fischio partiva comunque dopo 30s e la partita
     si giocava coi modelli procedurali; ora l'attesa diventa un AVVISO esplicito con «Riprova» (rimonta la
     scena 3D via glbTry, che e' la key di ThreeMatchView) e, come uscita dichiarata dall'utente, la scelta di
     giocare senza modelli 3D — che resta una SUA decisione, mai un ripiego silenzioso del gioco. */
  const [glbFail,setGlbFail]=useState(null);
  const [glbTry,setGlbTry]=useState(0);
  /* [7.535.0 collaudo PO «cartelloni, striscioni, bandiere, sciarpe non ci sono più» + «alla partita
     successiva si vedono»] IL CONTESTO GRAFICO PUO' MORIRE, E NESSUNO LO SAPEVA. Il browser di un telefono
     revoca il contesto WebGL quando la memoria stringe (`webglcontextlost`): le mesh restano in scena ma le
     loro texture no — un piano con texture perduta e materiale opaco si vede NERO, ed e' esattamente il
     quadro dello screenshot (stadio abitato, arredo nero o assente). Finora il gioco non ascoltava
     l'evento: senza `preventDefault()` il browser non ripristina nemmeno il contesto, e la scena restava
     monca fino alla partita dopo — che infatti «si vede». Ora la perdita si INTERCETTA e il ripristino
     RIMONTA la scena riusando la stessa chiave del «Riprova» 7.264: stessa partita, stadio ricostruito. */
  useEffect(()=>{const _onRestore=()=>{try{setGlbTry(t=>t+1);}catch(_e){}};
    window.addEventListener('cpm-gl-restored',_onRestore);
    return()=>window.removeEventListener('cpm-gl-restored',_onRestore);},[]);
  // [7.13.0 Sprint «Presentazione» — backlog PO] SERATA DI PRESENTAZIONE: il PRIMO match CASALINGO di lega
  //   della stagione (S≥2) apre con lo speaker che annuncia la squadra durante il walkout (che è già la scena
  //   3D con orbita a 360° sullo stadio) + fuochi d'artificio (riuso pirotecnica big-match). Per costruzione
  //   capita UNA volta a stagione (niente flag salvati). Sequenza annunci = roster REALE del club.
  // [7.15.0 collaudo PO «ero infortunato alla prima giornata! ho perso la presentazione?»] la condizione
  //   week===prima-casalinga PERDEVA la serata se la 1ª casalinga era saltata (infortunio/SIMULA). Ora la
  //   presentazione apre la PRIMA casalinga di lega GIOCATA DAL VIVO della stagione, qualunque settimana sia:
  //   nessuna voce di lega casalinga già giocata senza simulated (i path sim/skip marcano simulated:true; il
  //   path live no) ⇒ questa è la tua prima uscita davanti al pubblico. Per costruzione UNA volta a stagione.
  /* [7.292.0 direttiva PO «non mi piace che e' alla prima giornata del campionato»] la serata di
     presentazione NON e' piu' un contorno della prima gara casalinga: e' un evento pre-campionato a se'
     (wizard d'apertura → PresentationStage3D). Qui resta spento. */
  const _presNight=false;
  const [presN,setPresN]=useState(0);
  useEffect(()=>{
    if(phase!=="walkout"||!_presNight){setPresN(0);return;}
    const iv=setInterval(()=>setPresN(n=>Math.min(n+1,5)),1650);
    return ()=>clearInterval(iv);
  },[phase,_presNight]);
  useEffect(()=>{
    if(phase!=="playing")return;
    // GLB atteso? replica leggera di _useGLB (ThreeMatchView può non aver ancora settato __CPM_GLB_READY quando
    // phase diventa playing → `undefined` va trattato come «in attesa del segnale», MAI come pronto: sbloccare
    // su undefined ri-creava la race del backstop). Sblocco SOLO su ===true o cap 30s.
    const _glbExp=(typeof window!=='undefined')&&window.__CPM_GLB!==false&&(function(){try{return localStorage.getItem('cpm-glb')!=='0';}catch(e){return true;}})();
    if(_CPM_TEST||!_glbExp||(typeof window!=='undefined'&&window.__CPM_GLB_READY===true)){setKickoffHold(false);return;}
    const t0=Date.now();
    const iv=setInterval(()=>{
      setHoldTick(t=>t+1);
      if(typeof window!=='undefined'&&window.__CPM_GLB_READY===true){setGlbFail(null);setKickoffHold(false);clearInterval(iv);return;}
      /* [7.264.0] niente piu' sblocco automatico a 30s (giocava coi burattini): dopo 12s, o subito su errore
         duro del caricamento, si passa all'AVVISO e la partita resta ferma finche' l'utente non decide. */
      const _f=(typeof window!=='undefined')?window.__CPM_GLB_FAIL:null;
      if(_f==="error"||Date.now()-t0>12000)setGlbFail(_f==="error"?"error":"slow");
    },400);
    return ()=>clearInterval(iv);
  },[phase,glbTry]);
  // VISUAL-TEST (4.82.0): force-situation per validare TUTTE le SITUATIONS in 3D.
  // Attivo SOLO con ?cpmtest=1 → in produzione non viene mai registrato. Phase 2 dell'harness.
  useEffect(()=>{
    if(typeof window==='undefined'||!(/[?&]cpmtest=1\b/.test(window.location.search||"")||/[?&]sit=\d/.test(window.location.search||"")||window.__CPM_REVIEW))return;/* [7.211.0] +modalità REVISIONE: stessi hook di forzatura, presentazione INTATTA (nessun reseed, nessun freeze saltato) */// 5.43.1: ?sit=N attiva gli stessi hook di forzatura SENZA cpmtest → il build-up live (es. BALL_CARRY) NON viene bypassato (Situation Test Mode)
    window.__CPM_SIT_COUNT=SITUATIONS.length;
    // sostituisce le situazioni del match con l'intero DB (indice = indice globale) e congela il clock
    // entrando in un highlight (phase!=="playing" → il clock non avanza). NON usa paused: l'overlay
    // PAUSA blurra la scena e congela il lerp camera, falsando la regia.
    window.__CPM_LOAD_ALL=()=>{ cpmTimelineReset(); setSituations(SITUATIONS.slice()); setHlIdx(0); setPhase("hl_choose"); return SITUATIONS.length; };
    // forza la situation gi: posiziona l'eroe alla startZone e va DIRETTO al framing interattivo
    // (salta hl_intro, cinematico). Replica la transizione reale: mm===0 (e non lock) → hl_choose, altrimenti hl_move.
    window.__CPM_PPOS=()=>pPosRef.current;/* [7.399.0 codice 002] sonda test-only: lo stato LOGICO vivo dell'eroe, senza passare dai props del renderer (che possono essere stantii — ed e' esattamente cio' che si sta misurando) */
    window.__CPM_NARR669=()=>narrRef669.current;/* [7.720.0] sonda test-only: lo stato narrativo delle interazioni (marcatura, intesa, coinv...) — serve al banco ombra-720 per pilotare la marcatura senza aspettare la pesca delle schede. Ritorna il ref vivo: il banco lo puo' mutare, il gioco non lo legge mai da qui. */
    /* [7.580.0] LO STATO DI TRATTENUTA DEL PALLONE, per le sonde. Dal 7.559 il gioco ha le interruzioni:
       durante una rimessa, un angolo o un rinvio il pallone STA FERMO, ed e' giusto che stia fermo — e'
       calcio. Il guardiano `ball-alive` scusa gia' il calcio d'inizio per la stessa ragione, ma non
       poteva scusare le interruzioni perche' non aveva modo di sapere quando ce n'era una in corso.
       Senza questo, «il pallone e' fermo 4 secondi» non distingue il difetto dalla regola del gioco.
       Sola strumentazione: legge dei ref, non tocca stato ne' render. */
    window.__CPM_HOLD=()=>{try{return{fermo:!!fermoRef.current,out:!!outRef.current,sp:!!spRef.current,ko:(kickoffRef.current|0)>0,kick:(kickRef.current|0)>0,pg:!!pendingGoalRef.current,pgStep:(pendingGoalRef.current&&pendingGoalRef.current.piano)?(pendingGoalRef.current.step|0):null,pgLen:(pendingGoalRef.current&&pendingGoalRef.current.piano)?pendingGoalRef.current.piano.length:null,pgTicks:pendingGoalRef.current?(pendingGoalRef.current.ticks|0):null,pgDir:pendingGoalRef.current?(pendingGoalRef.current.dir|0):null};}catch(_e){return null;}};/* [7.693 strumentazione] pgStep/pgLen/pgTicks: a che punto del PIANO e' la costruzione. Senza, «la scena si chiude prima del tiro» resta un'impressione. *//* [7.587.0] +pg: la finestra in cui il gol si COSTRUISCE, per poter chiedere «e mentre si costruisce, qualcuno tocca il pallone?» */
    window.__CPM_BG_INJECT=(ty,x,y)=>{setHlIdx(99999);setPhase("playing");setBgAction({type:ty,t:Date.now(),ballEnd:{x:x,y:y}});return true;};/* [collaudo PO «il portiere sembra imbabolato»] iniettore test-only di un'azione di CRONACA (stesso setBgAction del feed reale, r.19015): gli archi BG veri arrivano ~3/minuto — il guardiano gk-bg-react non puo' aspettarli. setHlIdx oltre hlTimes: raggiunto l'orario di un highlight, OGNI tick di clock in "playing" rientrava in hl_intro azzerando bgAction — l'iniezione rimbalzava senza mai lanciare l'arco */
    window.__CPM_CURSIT=()=>{try{const _s=(situationsRef.current||[])[hlIdxRef.current|0];if(!_s)return null;
      return{i:hlIdxRef.current|0,t:String(_s.text||"").slice(0,60),type:_s.type||null,def:!!_s.def,intent:(typeof deriveIntent==="function"?(deriveIntent(_s)||null):null),offBall:!!_s.offBall,gi:(typeof SITUATIONS!=='undefined'?SITUATIONS.indexOf(_s):-1)};}catch(_e){return null;}};/* [7.698 strumentazione] QUALE situazione sta girando: senza, il censimento dei codici del PO dice QUANTE scene hanno il difetto e non QUALI — e la nota del 7.391 accusa proprio una famiglia (le scene off-ball, che piazzano il pallone in un punto geometrico cieco a dove siano i compagni). Sola lettura. */
    window.__CPM_FORCE_SIT=(gi,choose,ppos)=>{ const sit=SITUATIONS[gi]; if(!sit)return false;
      /* [7.212.0 collaudo PO «tra un rivedi e un altro il portiere e un altro giocatore non si fermano mai»]
         lo snap di scena (7.194.0) si arma al CAMBIO di `hlSitKey`, che è l'indice della situation: rigiocando
         la STESSA scena la chiave non cambiava, lo snap non scattava e i 22 restavano dove li aveva lasciati
         la scena precedente — con il portiere ancora in movimento verso un bersaglio vecchio. Un contatore
         monotòno rende ogni forzatura una scena NUOVA anche a parità di indice. */
      _forceSeqRef.current=(_forceSeqRef.current||0)+1;
      if(typeof window!=='undefined'&&window.__CPM_REVIEW){setScore({home:0,away:0});scoreRef.current={home:0,away:0};setClock(0);clockRef.current=0;setMatchEvents([]);}/* [7.212.0] in REVISIONE ogni scena riparte da 0-0: il punteggio non deve accumularsi fra una combinazione e l'altra */
      window.__CPM_FORCED_MODE=true;// [6.77.0 FLAKE-FIX] in force-mode la partita non deve MAI finire: l'auto-advance
      //   portava a "ended" → unmount del 3D con la PALLA A MEZZ'ARIA → il poller final-state catturava il fermo-immagine
      //   (fail intermittenti su sit borderline, dipendenti dal timing del run). Solo path forzato: autoplay/live-smoke intatti.
      window.__CPM_LAST_FORCED_GI=gi;// [5.94.0 ARC-1c] la probe __CPM_STATE deriva i campi puri della sit corrente
      if(window.__CPM_RESEED)window.__CPM_RESEED(gi); // start position deterministica per indice
      _hlActionFiredRef.current=false; setOutcome(null); setChosenAct(null); pendingChainSitRef.current=null; pendingActionRef.current=null; _rvwChainArmRef.current=false;/* [7.227.0 #44] una nuova forzatura disinnesca la continuazione-catena della scena precedente */
      setSituations(SITUATIONS.slice());// [5.90.0] le CHAIN (assist-chance/dribbling) splice-ano l'array tra un force e l'altro → gli indici slittavano e la timeline confrontava sit diverse: riparti sempre dalla base statica // reset (consenti nuova risoluzione, niente azione "pending" residua che si auto-risolverebbe entrando in hl_choose)
      setHlIdx(gi); const _sp224=ppos||getStartPos(sit)||{x:58,y:50}; setPPos(_sp224);// 5.43.1: ppos opzionale (Situation Test Mode → avanza l'eroe per rivelare le azioni rew=goal filtrate da px<55). Gate usa 2 arg → retro-compatibile.
      stageSitPositions(sit,_sp224);/* [7.224.0] il wizard/gate entra a hl_choose saltando hl_intro: senza questa chiamata la scena forzata NON aveva regia posizionale (attori della scena a 30-43u dall'eroe) */
      cpmEmit("HighlightForced",{gi:gi,intent:sit.intent||null,zone:(sit.zones&&sit.zones[0])||null});// LMQP-1
      const mm=cappedMM(sit); const _dst=choose?"hl_choose":(mm===0&&!sit.lockMovement?"hl_choose":"hl_move");
      /* [7.353.0] PASSAGGIO DA `hl_intro`, OPZIONALE. La forzatura salta l'intro e va dritta alla fase di
         lettura: comodo per il gate, ma l'intro e' dove si ARMANO le cose legate al cambio scena — in
         particolare `preActionT`, la regia delle corse pre-azione. Percio' OGNI misura dello schieramento
         fatta col force-sit vede quel sistema spento e lo fa sembrare morto: misurato preActionT=-1 in ogni
         scena forzata, contro 1,50 all'ingresso vero e 2,86 in lettura. Spento di default: il percorso del
         gate resta identico. */
      /* [7.388.0] LA SCENA FORZATA DEVE AVERE ANCHE IL BUDGET DI MOVIMENTO. `__CPM_FORCE_SIT` saltava
         `startHL`, cioe' l'unico posto in cui il budget dei passi viene riempito: ogni sonda vedeva
         `movesLeft` a ZERO mentre la situazione ne dichiarava uno, due o tre. Finche' il ramo tastiera
         non controllava il budget la cosa non si notava — si camminava lo stesso — ma significa che
         nessun collaudo ha mai potuto misurare il movimento vero. Test-only, e non tocca il percorso
         del gioco: `startHL` continua a essere l'unico a decidere il valore. */
      try{if(typeof window!=='undefined'&&window.__CPM_FILL_MOVES)window.__CPM_FILL_MOVES(sit);}catch(_e388){}
      if(typeof window!=='undefined'&&window.__CPM_FORCE_INTRO){setPhase("hl_intro");setTimeout(()=>{try{setPhase(_dst);}catch(_e){}},Math.max(60,+window.__CPM_FORCE_INTRO_MS||300));}
      else setPhase(_dst);
      return true; };
    // risolve l'azione k della Situation corrente in modo deterministico → hl_result (validazione stato finale)
    /* [7.458.0 «esito dichiarato ≠ 3D»] LE AZIONI DELLA SCENA APERTA, test-only. Forzare il successo
       sull'azione 0 non produce un GOL ma quasi sempre una CHANCE (misurato: outKey="chance"), e una
       chance non mette la palla in rete per definizione — quindi si misurava un caso che non e' quello
       del PO. Serve poter scegliere l'azione la cui ricompensa E' il gol. */
    window.__CPM_ACTS=()=>{try{const sit=situationsRef.current[hlIdxRef.current];
      return (sit&&sit.actions)?sit.actions.map((a,i)=>({i,label:a.label,rew:a.rew})):null;}catch(e){return null;}};
    window.__CPM_ACTS=()=>{try{const s0=situationsRef.current[hlIdxRef.current];return (s0&&s0.actions)?s0.actions.map(a=>String((a&&a.label)||'')):[];}catch(_e){return [];}}; /* [7.553 sonda] le etichette delle azioni della scena corrente: serve a trovare da fuori la scena che offre una rovesciata o un tiro al volo, senza leggere il DOM. */
    window.__CPM_RESOLVE=(k)=>{ const sit=situationsRef.current[hlIdxRef.current]; if(!sit||!sit.actions||!sit.actions[k])return false;
      if(window.__CPM_RESEED)window.__CPM_RESEED(hlIdxRef.current*131+((k|0)+50000));
      if(handleActionRef.current)handleActionRef.current(sit.actions[k]); return true; };
    // [5.76.0 ARC-1a] hook per il LIVE-SMOKE del gate: arma la coda degli HL reattivi (il path del tick
    //   `playing` dove viveva il soft-lock BLK-1, che nessun check eseguiva) + sonda numHL. Test-only.
    window.__CPM_QUEUE_REACTIVE=(m)=>{try{reactiveHLQueueRef.current.push(m!=null?m:((clockRef.current||0)+1));return true;}catch(e){return false;}};
    window.__CPM_NUMHL=()=>{try{return numHLRef.current;}catch(e){return null;}};
    // [7.2.0] hook di collaudo della PREMIAZIONE 3D: salta direttamente alla fase ceremony (test-only). Il runner
    //   ceremony-visual.mjs monta LiveMatch (?sit=) e chiama questo per catturare i 4 beat senza dover vincere un titolo.
    window.__CPM_FORCE_CEREMONY=(o)=>{try{setCeremony({name:(o&&o.name)||"CAMPIONI D'ITALIA",kind:(o&&o.kind)||"league"});setPhase("ceremony");return true;}catch(e){return false;}};
    window.__CPM_PHASE=()=>{try{return phaseRef.current;}catch(e){return null;}};// [7.2.0] fase corrente per il collaudo cerimonia
    window.__CPM_RIPBREVE=()=>{try{const _e0=+ripT0Ref.current||0;const _ms=_e0?(Date.now()-_e0):-1;return{tick:(ripTickRef.current|0),ms:_ms,breve:(_e0>0&&_ms<=4500)};}catch(e){return null;}};/* [7.590.0] la finestra BREVE, per le sonde */
    window.__CPM_KO544=()=>{try{return (kickRef.current>0)||(kickoffRef.current>0);}catch(e){return false;}};/* [7.544.0] la FINESTRA vera della ripartenza: la prima sonda filtrava su «palla vicino al centro» e contava 35 riprese in due partite (i gol sono 3-4) — misurava il gioco normale che passa dal cerchio, non i calci d'inizio */
    window.__CPM_HLTIMES=()=>{try{return (hlTimesRef.current||[]).slice();}catch(e){return[];}};/* [7.500.0 F4] il CALENDARIO degli highlight: e' la parte deterministica del rimedio, quindi e' quella su cui una prova del rosso puo' davvero separare */
    window.__CPM_CLOCK=()=>{try{return clockRef.current|0;}catch(e){return null;}};/* [7.500.0 F4] il MINUTO dal ref di LiveMatch: come fase e tabellone, sopravvive allo smontaggio del 3D al fischio finale — `__CPM_STATE().clock` li' resta congelato, ed e' la trappola gia' pagata tre volte */
    window.__CPM_SCORE=()=>{try{return{home:scoreRef.current.home|0,away:scoreRef.current.away|0};}catch(e){return null;}};
    window.__CPM_KO536=()=>{try{return (kickRef.current|0)>0||(kickoffRef.current|0)>0||!!(spRef.current&&spRef.current.kind==="pen_for")||!!(counterRef.current&&counterRef.current.fin);}catch(e){return false;}};/* [7.532.0 v2] il FERMO DICHIARATO include anche il rigore sul dischetto e l'attesa di risoluzione del contropiede: teatro con copione, come il kickoff (striscia 2,3s misurata oltre grazia) *//* [7.532.0] testimone della FINESTRA DI KICKOFF per ball-alive: al calcio d'inizio la palla E' ferma per regolamento — il guardiano grazia la finestra dichiarata (tetto 6s), col rosso NO536 la macchina non esiste e la grazia muore da sola */
    /* [7.536.0] LE TRE VOCI INSIEME, A COMANDO (test-only): telecronaca, panchina e coro hanno gate
       diversi (la riga esce dalla trama, la panchina dai momenti del mister, il coro dai tick quieti) e
       coincidono di rado — senza questo hook il guardiano dell'accavallamento dovrebbe aspettare una
       combinazione fortunata invece di misurare il caso che il PO ha fotografato. */
    window.__CPM_HUD_FORCE=(o)=>{try{o=o||{};if(o.com)addCom(o.com,"#f8fafc",clockRef.current|0);
      if(o.coach)addCoach(o.coach,clockRef.current|0);
      if(o.chant)setCrowdChant({text:o.chant,type:o.type||"support",key:Date.now(),clubCol:"#4ade80"});
      return true;}catch(e){return "error:"+(e&&e.message);}};
    window.__CPM_IDMAP538=(dir,u)=>{try{if(window.__CPM_NO538)return u<0.34?0:u<0.67?-1:1;return _corPick538(u,_prof538(dir));}catch(e){return null;}};/* [7.531.0] sweep di collaudo: percorre profilo+mappa VERI (il corridoio in volo nasce ~2,5 volte a partita — troppo raro per qualsiasi statistica: la mappa si giudica per enumerazione, il volo solo per cablaggio) *//* [7.496.0 F1b] il TABELLONE dal ref di LiveMatch: come la fase, sopravvive allo smontaggio del 3D al fischio finale — leggerlo da `__CPM_STATE` avrebbe la stessa malattia gia' pagata tre volte. `scoreRef` e' anche il punteggio LOGICO, quello che i gol incrementano SUBITO (7.113/7.120), non il `setScore` differito. */
    // [7.31.0] hook di collaudo RIGORI: forza pareggio+90' e chiama _goEndOrCeremony (il contesto KO deve
    //   essere vero: si usa da una partita di Coppa reale). Test-only, spento in store build.
    window.__CPM_SO_FORCE=(ck)=>{try{setScore({home:1,away:1});scoreRef.current={home:1,away:1};const _c=(ck==null?90:ck);setClock(_c);clockRef.current=_c;_goEndOrCeremony();return true;}catch(e){return false;}};/* [7.327.0] clock opzionale: la probe passa 69 per provare che il fischio finale lo ALZA a 90 (il fix sta in _goEndOrCeremony, non qui) */
    window.__CPM_SO_STATE=()=>{try{const s=soStateRef.current;return{phase:phaseRef.current,step:s?s.step:null,hs:s?s.hs:null,as:s?s.as:null,done:s?s.done:null,won:s?s.won:null,len:s?s.seq.length:null};}catch(e){return null;}};
    /* [6.3.0 R0/LMQP-10] AUTOPLAY del Live Match Validator: gioca la partita VERA (selezione contestuale,
       catene, clock, tick playing) scegliendo le azioni con policy SEEDATA — niente force-sit, esercita
       esattamente il path del giocatore. Test-only (il blocco intero vive sotto ?cpmtest=1). */
    let _apT=null;
    window.__CPM_SUBOFF=()=>({at:subOffAtRef.current,off:subbedOffRef.current,min:subOffMinRef.current,bench:onBenchRef.current,fat:player.fatigue,ctx:context,bs:!!benchStart});/* [7.38.0] hook test sub-off (solo cpmtest, cleanup sotto) */
    window.__CPM_FORCE_SUBOFF=()=>{try{subbedOffRef.current=true;setSubbedOff(true);setOnBench(true);subOffMinRef.current=clockRef.current|0;return true;}catch(e){return false;}};/* [7.543.0] leva di COLLAUDO: mette la scena nello stato «uscito dal campo», l'unico in cui il tasto Salta convive con la telecronaca. Senza, il guardiano dell'accavallamento dovrebbe aspettare una sostituzione vera — cioe' non misurare mai il caso che il PO ha segnalato. */
    window.__CPM_FORCE_BENCH=(warm)=>{try{setOnBench(true);setBenchPhase(warm?"warmup":"watch");}catch(_e){}return true;};/* [7.135.0] hook test: forza la panchina d'attesa (A DISPOSIZIONE / RISCALDAMENTO) per il collaudo visivo */
    window.__CPM_MM=()=>{try{return JSON.parse(JSON.stringify(matchMemRef.current||null));}catch(e){return null;}};/* [BL-07 diagnosi cpmadapt] memoria narrativa (byFlank) */
    /* [7.545.0] I TRE PALLONI: bersaglio (dove il gioco lo manda), logico (dove il modello lo
       crede) e mesh (dove lo spettatore lo vede). Servono INSIEME per capire se un pallone che non
       arriva e' un bersaglio sbagliato o una corsa troppo lenta. */
    window.__CPM_BALL3=()=>{try{const m=(window.__CPM_BALL&&window.__CPM_BALL())||null;
      return{t:{x:+ballTargetRef.current.x.toFixed(2),y:+ballTargetRef.current.y.toFixed(2)},
             l:{x:+ballPosRef.current.x.toFixed(2),y:+ballPosRef.current.y.toFixed(2)},
             m:m?{x:m.x,y:m.y}:null,ko:(kickRef.current|0),kf:(kickoffRef.current|0),c:clockRef.current|0,g:(typeof window!=='undefined'&&window.__CPM_COLLA)?1:0};}catch(e){return null;}};
    window.__CPM_MP=()=>{try{return (matchPlayersRef&&matchPlayersRef.current?matchPlayersRef.current:matchPlayers||[]).map(q=>q?{t:q.team,x:Math.round(q.x*10)/10,y:Math.round(q.y*10)/10,n:q.name||"",gk:!!q.gk,m720:q._m720?1:0}:null);}catch(e){return null;}};/* [7.130.0] +n (cognome dorso) +gk per la verifica *//* [BL-07] stato LOGICO LiveMatch (pre-3D) per isolare lo strato che perde lo shading */
    window.__CPM_MS=()=>{try{return matchStateRef.current;}catch(e){return null;}};/* [7.711.0] il testimone del Match State unico */
    window.__CPM_FERMO_NOW=()=>{try{const _f=fermoRef.current;return _f?{x:_f.x,y:_f.y,kind:_f.kind||null,t:_f.t}:null;}catch(e){return null;}};/* [7.633.0] gancio di sola lettura: il fermo corrente, per la sonda dello schieramento da palla inattiva */
    window.__CPM_FERMO_SET=(k,x,y,t)=>{try{fermoRef.current={x:+x,y:+y,t:(t|0)||12,kind:String(k)};return true;}catch(e){return false;}};/* [7.633.0 SOLO COLLAUDO] forza un fermo per misurare lo schieramento da palla inattiva senza aspettare la lotteria dei sorteggi (pattern __CPM_FORCE_SIT) */
    window.__CPM_AUTOPLAY=(on,opts)=>{try{
      if(_apT){clearInterval(_apT);_apT=null;}
      if(!on){try{window.__CPM_AUTOPLAY_ON=false;}catch(_e){}return true;}
      /* [7.682.0] IL FREEZE DELLA SCELTA E' PER CHI LEGGE, e sotto pilota automatico non legge nessuno.
         Il guardiano partita-vera raccoglie per un tempo REALE fisso: tre scelte da venti secondi gli
         mangiavano un minuto di partita, i turni scendevano da 26 a 22 e la banda «catena-viva >=5»
         andava rossa a 4 — un rosso causato dalla misura, non dal gioco. Allentare la banda per far
         passare la release e' esattamente cio' che non si fa, quindi si toglie la causa: in autoplay il
         tempo non si ferma. `__CPM_SCFREEZE_TEST` lo riaccende per la sonda che DEVE misurarlo. */
      window.__CPM_AUTOPLAY_ON=true;
      window.__CPM_FORCED_MODE=false;// [6.77.0 FLAKE-FIX] l'autoplay gioca la partita VERA → il fischio finale deve arrivare
      const o=opts||{};let _as=((o.seed|0)||1)>>>0;const _ar=()=>{_as=(_as*1664525+1013904223)>>>0;return _as/4294967296;};
      let lastKey="";
      _apT=setInterval(()=>{try{
        const ph=phaseRef.current;
        const key=ph+"#"+(hlIdxRef.current||0)+"#"+(numHLRef.current||0);
        if(ph==="matchday"||ph==="formations"||ph==="walkout"){if(key!==lastKey){lastKey=key;setPhase("playing");}}// stesso path del bottone Salta
        else if(ph==="hl_move"){if(key!==lastKey){lastKey=key;setPhase("hl_choose");}}
        else if(ph==="hl_choose"){
          if(key===lastKey||_hlActionFiredRef.current)return;
          lastKey=key;
          const sit=situationsRef.current[hlIdxRef.current];if(!sit)return;
          if(sit.intent==="penalty"&&handleRigoreRef.current){const _dd=["tl","tc","tr","bl","bc","br"];handleRigoreRef.current(_dd[Math.floor(_ar()*6)%6]);return;}
          if(!sit.actions||!sit.actions.length)return;
          const pol=o.policy||"seeded",n=sit.actions.length;
          const k=pol==="first"?0:pol==="last"?(n-1):Math.floor(_ar()*n)%n;
          if(handleActionRef.current)handleActionRef.current(sit.actions[Math.max(0,Math.min(n-1,k))]);
        }
      }catch(_e){}},(o.tickMs|0)||350);
      return true;
    }catch(e){return false;}};
    return()=>{ try{if(_apT)clearInterval(_apT);delete window.__CPM_AUTOPLAY;delete window.__CPM_FORCE_SIT;delete window.__CPM_LOAD_ALL;delete window.__CPM_SIT_COUNT;delete window.__CPM_QUEUE_REACTIVE;delete window.__CPM_NUMHL;delete window.__CPM_SUBOFF;delete window.__CPM_FORCE_BENCH;delete window.__CPM_MM;delete window.__CPM_MP;}catch(e){} };
  },[]);// eslint-disable-line
  const [debugMode,setDebugMode]=useState(false); // ATE-5: Shift+D toggle
  const pressureRef=useRef(1);
  const [defDist,setDefDist]=useState(100); // 0=on you 100=far
  const defDistRef=useRef(100);
  const movesLeftRef=useRef(0);
  const moveCoolRef=useRef(0);
  const driftTargetsRef=useRef(null);
  const ballTargetRef=useRef({x:50,y:50});
  const ballRngRef=useRef(0);/* [7.511.0 R1] flusso seedato DEDICATO al moto di possesso: usare _rndM qui avrebbe spostato tutti i sorteggi della cronaca e rotto il replay */
  const tramaRef=useRef(null);/* [7.524.0 LA TRAMA] piano del possesso: {dir,cor,wp,fase} — corridoio persistente e giocata corrente del drift */
  /* [7.531.0 direttiva PO «ogni squadra deve avere in base a tattica/formazione/mentalita' il suo sviluppo:
     un 433 e' diverso da un 352» — rosso __CPM_NO538] L'IDENTITA' DELLA TRAMA: quattro pomelli per modulo
     (pesi corridoio sx/centro/dx · probabilita' cambio gioco · passo di sviluppo · scarico in rifinitura).
     L'avversario ha il modulo dichiarato (oppTactic); la nostra squadra lo DERIVA dai ruoli della rosa.
     ⚠️ INVARIANTE DI FERRO: i pomelli cambiano SOLO soglie e scale — mai il numero o l'ordine dei sorteggi
     _r511 (replay/determinismo, lezione 7.511). `window.__CPM_FORCE_FORM538={home,away}` = gancio collaudo. */
  const TRAMA_ID538={
    "4-3-3":{corW:[1.25,0.70,1.25],cambio:0.17,passo:1.00,scarico:0.30},/* ali larghe, cambio gioco frequente */
    "4-4-2":{corW:[1.10,0.90,1.10],cambio:0.14,passo:1.12,scarico:0.24},/* diretto, fasce oneste */
    "3-5-2":{corW:[0.85,1.35,0.85],cambio:0.10,passo:0.92,scarico:0.36},/* palleggio centrale, quinti a sostegno */
    "4-2-3-1":{corW:[0.90,1.30,0.90],cambio:0.12,passo:0.95,scarico:0.34},/* trequartista, rifinitura ragionata */
    "5-3-2":{corW:[0.90,1.05,0.90],cambio:0.09,passo:1.28,scarico:0.20},/* blocco basso, ripartenze lunghe */
    dflt:{corW:[1,1,1],cambio:0.14,passo:1.00,scarico:0.30}};
  const _formRosterRef=useRef({});
  const _formFromRoster538=(roster,key)=>{const _c=_formRosterRef.current;if(_c[key])return _c[key];
    let d=0,m=0,a=0;(roster||[]).forEach(r=>{const ro=String((r&&r.role)||"");if(/portiere|goalkeeper|^gk$/i.test(ro))return;
      if(/difens|terzino|braccetto|central/i.test(ro))d++;else if(/attacc|punta|ala|esterno alto/i.test(ro))a++;else m++;});
    const f=(d>=5)?"5-3-2":(d<=3)?"3-5-2":(a>=3)?"4-3-3":(m>=4&&a<=1)?"4-2-3-1":"4-4-2";
    _c[key]=f;return f;};
  const _corPick538=(u,p)=>{const _w=p.corW,_T=_w[0]+_w[1]+_w[2],_v=u*_T;return _v<_w[1]?0:_v<_w[1]+_w[0]?-1:1;};/* [7.531.0] LA mappa corridoio pesata — unica, usata dal drift E dal gancio di collaudo __CPM_IDMAP538: cosi' lo sweep del guardiano percorre il codice vero */
  const corY528=(c)=>{/* [7.630.0 — LE FASCE ESISTONO DA DOVE PASSA IL PALLONE. Rosso __CPM_NO630]
     MAPPA AMPIEZZA 7.627 + censimento tick 7.628: i centri di corridoio laterale stavano INCHIODATI
     a y 24/76 in TRE siti gemelli (richiamo riga, waypoint trama, cambio di fronte) — undicesima
     istanza del pattern «piu' autorita' sulla stessa grandezza», qui sanata con l'helper unico.
     L'aritmetica del confinamento: il richiamo converge al 35% verso 76 DA SOTTO, quindi il pallone
     tocca y>=74 per caso e la fascia vera (74-98) non esiste per costruzione — zona.fascia 0/16 tick
     liberi, rimesse ambientali quasi mai, cross dalla linea mai. Centri a 18/82: meta' strada fra il
     vecchio binario e la linea, dentro la banda dei corridoi veri (il quinto di campo esterno). */
    const _lat=(typeof window!=='undefined'&&window.__CPM_NO630)?[24,76]:[18,82];
    return c<0?_lat[0]:c>0?_lat[1]:50;};
  const _prof538=(dir)=>{/* dir>0 = attacca la squadra di CASA (stadio), dir<0 = ospiti */
    const _f5=(typeof window!=='undefined'&&window.__CPM_FORCE_FORM538)||null;
    const _homeIsHero=isMatchHome;const _ot=oppTacticRef.current;
    let form;
    if(dir>0)form=(_f5&&_f5.home)||(_homeIsHero?_formFromRoster538(homeRoster,"h"):(_ot&&_ot.formation));
    else form=(_f5&&_f5.away)||(_homeIsHero?(_ot&&_ot.formation):_formFromRoster538(awayRoster,"a"));
    return TRAMA_ID538[form]||TRAMA_ID538.dflt;};
  const kickRef=useRef(0);
  const kickoffRef=useRef(0),kickoffSideRef=useRef("away");
  /* [7.590.0 — LA RIPRESA DUREVA MEZZO MINUTO, rosso __CPM_NO590] MISURATO, e smentisce una cosa che
     avevo appena riferito: `kickoffRef` e `kickRef` NON sono un tempo, sono contatori di eventi che
     scendono solo quando la cronaca aggancia. In partita restano sopra zero per 19,6 e 27,8 secondi
     (kickRef 10,2 e 18,8). Per tutto quel tempo il 7.544 schiaccia i ventidue nella propria meta'
     (clamp 46/54, guadagno 0,92) e il 7.589 spegne la macchina delle corsie: mezzo minuto dopo OGNI gol
     la partita non e' una partita — niente trame, niente pressing, ventidue pinnati dietro la linea.
     E la misura dice anche che la ripresa vera FUNZIONA GIA': nei primi 3 secondi — cio' che il PO vede —
     i fuori posto sono 0,0 sia nel modello logico sia nelle mesh; il 4,4 che avevo riportato viene tutto
     da OLTRE i 3 secondi, cioe' da gioco gia' ripreso, dove i ventidue DEVONO essere sparsi.
     Quindi la finestra della ripresa diventa un TEMPO: i primi 14 tick (~4,2 s) da quando si apre. Dopo,
     il gioco riprende davvero. */
  const ripTickRef=useRef(0),ripT0Ref=useRef(0);
  /* ⚠️ [7.590.0] SECONDO ERRORE MIO NELLA STESSA STESURA, e l'ha trovato lo strumento non io: avevo
     scritto `ripT0Ref.current|0` per difendermi dai valori nulli. Ma `|0` tronca a 32 bit, e un istante
     di `Date.now()` vale ~1,78e12: il confronto lavorava su un numero corrotto e la finestra non si
     apriva MAI (breve=true in 0 campioni su 469, con «eta'» stampata a 1786706395183 ms). Su un
     timestamp non si usa un operatore bit a bit. */
  /* ⚠️ [7.590.0] PRIMA STESURA SBAGLIATA, e l'ha detto lo strumento: avevo contato la finestra in TICK
     (soglia 14). Misurato: il contatore arriva a mediana 8 e MAX 14 mentre la finestra dura 23-26
     secondi — cioe' durante una ripresa il tick di gioco gira una volta ogni ~1,6 s invece che ogni
     300 ms, cinque volte piu' lento. Quattordici tick non erano 4,2 secondi: erano ventitre. La soglia
     a tick era un no-op travestito da rimedio. La finestra e' quindi un TEMPO VERO in millisecondi.
     (E il rallentamento del tick durante la ripresa resta un fatto MISURATO e NON spiegato: annotato
     perche' tocca anche «il pallone rimbalza senza portatore», che e' un altro appunto del PO.) */
  const holdArrRef=useRef(0);/* [7.642.0 v4] la sosta d'arrivo: tick in cui il bersaglio resta sui piedi dell'eletto */
  const pendingBtRef=useRef(null);/* [7.643.0] la proposta di bersaglio in coda: parte quando la consegna corrente si completa */
  const ballLagRef=useRef(false);/* [7.642.0 v5 — IL BERSAGLIO ASPETTA LA PALLA] misurato in v4: la palla e' entro 2,5u di un uomo solo 3 tick su 36 — le marce delle macchine avanzano il bersaglio anche con la palla lontana e il viaggio non si completa mai. Con la palla a >6u dal bersaglio, le quattro marce (gol-in-costruzione, contropiede, catena, trama) NON avanzano quel tick: prima si arriva, poi si riparte. */
  const carrierRef=useRef(null);/* [7.641.0 — F1a: IL PORTATORE E' UNO STATO, NON UNA DEDUZIONE] Decisione B:
     il portatore persistente {i} (indice in matchPlayers) scritto SOLO agli EVENTI — passaggio della
     trama (ricevente), aggancio riga->uomo, passo di catena — e azzerato quando il possesso cambia per
     evento o il gioco si ferma. In questa release e' PASSIVO (anagrafe + testimone __CPM_CARRIER641):
     la baseline di copertura si misura PRIMA che il motore lo usi. Rosso __CPM_NO641. */
  const outStoryRef=useRef(0);/* [7.632.0 v7 — IL RACCONTO CAMPIONA I FISCHI] righe d'arbitro emesse in questa partita: col fischio sempre-raccontato le ~30 righe/90' andavano sature (8 d'arbitro) e la catena e' crollata a 1 riga (guardiano rosso). In TV non ogni rimessa ha la sua riga: oltre il tetto (~1 ogni 12 minuti) il fischio nasce muto — ferma il gioco, scrive registro e turno, si risolve in silenzio (7.572) — e la telecronaca resta alle altre voci. */
  const outRef=useRef(null);/* [7.559.0 missione, blocco 4 — LE INTERRUZIONI ESISTONO]
     Il guardiano `fermo-559` non riusciva nemmeno a MISURARE il rimedio del fermo: in cinque minuti di
     partita accelerata si annunciavano UNO o DUE piazzati, sempre dello stesso tipo (`foul_for`). La causa
     e' a monte e si legge in una riga sola: il bersaglio del pallone di cronaca e' `ev.bpos` clampato a
     2..98 (r.~2576) — LA PALLA NON PUO' USCIRE DAL CAMPO, PER COSTRUZIONE. Senza uscite non esistono
     rimesse laterali, calci d'angolo ne' rinvii dal fondo, e le uniche interruzioni possibili sono quelle
     che il repertorio sorteggia (rare) e che le altre macchine spesso mangiano (misurato: 2 righe su 2
     bloccate da `pendingGoal`). Il conto: 2,3 interruzioni a partita contro le 25 dichiarate come obiettivo.
     Non era un difetto di taratura, era un pezzo di calcio che mancava. Qui l'interruzione diventa un
     ESITO della giocata appena raccontata — rimessa, angolo, rinvio, fallo — con il suo punto di battuta,
     il suo fermo e la sua battuta recitata. __CPM_NO559 = rosso. */
  const fermoRef=useRef(null);/* [7.559.0 missione — IL GIOCO FERMO E' UNO STATO, NON UNA FRASE] Il giudice
     della cronaca (`fondate-558`) ha messo un numero sul difetto piu' vecchio della lista: `fermo 0/4` —
     OGNI riga che annuncia una palla ferma e' smentita, la palla non si ferma MAI. La causa non era
     nell'annuncio: la macchina `spRef` (r.~2303) recita corner, punizione e rigore in due battute e
     dichiara un `bpos` per ognuna, ma NESSUNO trattiene il pallone — il bersaglio di cronaca continua a
     essere riscritto ogni tick dalla trama del possesso, e la mesh lo insegue senza sosta. Un piazzato
     era un testo sopra un gioco che non si era fermato. Qui il fermo diventa uno STATO con una durata:
     {x,y,t} — il pallone sta li' e nessun altro lo muove finche' i tick non sono finiti o la battuta non
     lo rimette in gioco. __CPM_NO559 = rosso. */
  const spRef=useRef(null);const recVarRef=useRef(0);/* [7.532.0] contatore di recita: le varianti delle battute di macchina erano legate al MINUTO (due righe nello stesso minuto = stessa variante; ogni gol ripeteva la stessa rimessa) — varieta' bg-decision 54,5%<55 *//* [7.530.0 NO537] giocata piazzata in recita: {kind,step,x,y} */
  const counterRef=useRef(null);/* [7.532.0 NO542] ribaltamento di fronte in recita: {dir,ticks,fin} — collaudo PO «il gioco e' troppo concentrato a centrocampo, non ci sono ribaltamenti di fronte» */
  const possTurnRef=useRef(1);/* [7.532.0 NO543] il TURNO di possesso: chi ha la palla ADESSO (1=casa) — la trama consuma questo, non la statistica % */
  const possSpellRef=useRef(35);const possExtRef=useRef(0);/* [7.532.0 NO543 v2] durata dello spell di possesso in tick: il censimento ha mostrato che le righe di recupero NON bastano a passare il turno (i pesi di zona le schiacciano a palla alta → 0 flip anche coi turni): nel calcio vero il possesso si alterna ogni 30-60s comunque — lo spell seedato (10-17 tick, pesato sulla % di possesso) garantisce l'alternanza, le righe di recupero restano gli override narrativi */
  const counterArmRef=useRef(null),counterCoolRef=useRef(-99);
  /* [7.616.0 — SPRINT PO «PARTITA VERA», Fase A — IL TURNO HA UN SOLO SCRITTORE, E OGNI SCRITTURA UNA CAUSA]
     L'audit del motore ha contato SEI siti che scrivono possTurnRef, di cui UNO solo causale (la riga di
     recupero) — e il cuore era la ri-estrazione a orologio: una Bernoulli senza memoria che a possesso 50%
     meta' delle volte non cambia nulla ma resetta lo spell, e che poteva REVOCARE un recupero narrato il
     tick dopo, perche' i flip causali non azzeravano lo spell. Da qui in poi ogni scrittura passa da
     setTurn616(dir, causa): azzera spell/estensioni (salvo keepSpell, per il sito a orologio che ha il suo
     sorteggio da non spostare — invariante 7.511), registra la causa nel libro mastro (cpmEv "turn") e in
     __CPM_TURN616, cosi' il rapporto flip-causali/flip-a-orologio diventa UN NUMERO misurabile — il
     numero-guida dello sprint. Le cause nuove (interruzioni, esiti di scena) e la sospensione dello spell
     durante i fermi stanno sotto il rosso __CPM_NO616; la registrazione e' strumentazione e resta sempre. */
  const setTurn616=(dir,causa,opts)=>{try{
    const _d=dir>0?1:-1;const _prev=possTurnRef.current;
    if(!(typeof window!=='undefined'&&window.__CPM_NO646)&&pendingGoalRef.current&&_d!==pendingGoalRef.current.dir&&String(causa||"")!=="gol-in-costruzione"){/* [7.646.0 — SOTTO COSTRUZIONE IL TURNO E' INVIOLABILE. Rosso __CPM_NO646] MISURATO (golback644b post-7.645): TUTTI i gol nudi restanti erano costruzioni AWAY con la finestra PIENA di righe del lato sbagliato — le righe di repertorio con poss di casa (27:2 il rapporto del repertorio), forzate proprio durante la costruzione, RISCRIVEVANO il turno; da li' la catena si apriva per il lato sbagliato e righeLato restava 0 fino al tetto. L'azione pendente e' DI CHI SEGNERA' (7.532): finche' vive, nessuna causa puo' togliergli il pallone. Il rifiuto non e' una scrittura: __CPM_TURN616 non lo conta, il testimone __CPM_TURN646 si'. */
      if(typeof window!=='undefined'&&window.__CPM_REC){try{const _w=(window.__CPM_TURN646=window.__CPM_TURN646||{rifiuti:0,per:{}});_w.rifiuti++;const _k646=String(causa||"?");_w.per[_k646]=(_w.per[_k646]|0)+1;}catch(_e){}}
      return;}
    possTurnRef.current=_d;
    if(_prev!==_d&&!(typeof window!=='undefined'&&window.__CPM_NO641)){carrierRef.current=null;pendingBtRef.current=null;/* [7.641/7.643] al cambio di possesso decadono portatore E proposta in coda */}
    if(!(opts&&opts.keepSpell)){possSpellRef.current=6;possExtRef.current=0;}
    cpmEv("turn",{min:clockRef.current|0,dir:_d,flip:_prev!==_d?1:0,causa:String(causa||"?")});
    if(_prev!==_d){try{const _mm=msMemRef.current;_mm.push({min:clockRef.current|0,ev:"turn",dir:_d,causa:String(causa||"?")});if(_mm.length>8)_mm.shift();}catch(_e){}}/* [7.711.0] la MEMORIA del Match State: gli ultimi 8 eventi che hanno cambiato il possesso, con la causa */
    if(typeof window!=='undefined'&&window.__CPM_TURN616){const _g=window.__CPM_TURN616;
      _g.n=(_g.n|0)+1;const _k=String(causa||"?");(_g.per=_g.per||{})[_k]=((_g.per||{})[_k]|0)+1;
      if(_prev!==_d)_g.flip=(_g.flip|0)+1;}
  }catch(_e){}};
  /* [7.537.0 collaudo PO «molto possesso a centrocampo, a volte anche troppo da fermo su un singolo
     giocatore» — rosso __CPM_NO551] LA CATENA DI POSSESSO (MP-2 applicato alla cronaca). La MISURA prima
     del rimedio (sonda possesso-550, partita intera): la palla sta a piu' di 2,5u da CHIUNQUE per il
     **77% del tempo** e vive nella fascia centrale per l'**80%**, toccata da 9 uomini su 21 — non e'
     «ferma su un giocatore», e' una palla che VAGA DA SOLA a centrocampo, ed e' esattamente cio' che
     toglie l'aria di partita vera. Il rimedio non e' un altro pomello sul drift: e' dare alla cronaca
     una CATENA — 3-5 tocchi fra uomini REALI del lato in possesso, ognuno con passatore e ricevente
     nominati, la palla che punta il ricevente (non una zona vuota) e il ricevente che le va incontro.
     E' il primo pezzo del linguaggio Beat: l'evento porta gia' actor/ballEnd veri dal canale MP-0 e il
     gesto dal vocabolario MP-1, quindi il 3D segue la stessa catena che il testo racconta. */
  const azioneRef=useRef(null),_lastCatRef=useRef(-1);/* [7.537.0 v4] minuto dell'ultima battuta di catena: serve per alternare con il repertorio */
  const ponteRef=useRef(null),ponteIdxRef=useRef(-1);/* [7.532.0 NO544 — collaudo PO «da centrocampo in cronaca all'improvviso highlights di attacco: nessuna concatenazione»] IL PONTE: ~2' prima dell'highlight in calendario la cronaca SCORTA la palla verso il punto di nascita della scena (hlBallSpot della situation in arrivo) e le righe raccontano l'avvicinamento — l'highlight si apre dove il racconto ha portato il gioco *//* [7.532.0 v2] l'innesco vive nella TRAMA (flip di possesso con palla nel terzo difensivo del nuovo padrone), NON nel sorteggio di una riga poss: i pesi di zona 7.525 schiacciano le righe di recupero proprio quando la palla e' alta (misurato: 0 lanci in 2 partite). Cooldown 6' di gioco. *//* [7.530.0 collaudo PO «Non si riparte dal centro dopo un gol!» — rosso __CPM_NO536] il 7.525 toccava il centro per UN tick (300ms): un lampo, non una ripartenza. Ora allo scadere del conto kickRef nasce una RIPARTENZA RECITATA: kickoffRef tick di attesa al centro, le righe gia' sorteggiate vengono DIROTTATE su battute di calcio d'inizio (ordine sorteggi intatto), side = chi rimette in gioco (chi ha subito) */
  const gkSave695=useRef({t:0,side:null});/* [7.695.0] IL SEGNALE DELLA PARATA. Identita' stabile: il renderer lo legge a ogni fotogramma e si arma sul cambio di `t`, senza che una parata costi un re-render (stesso pattern di stagedSpot e cineBusy). */
  const occCool695=useRef(-99);/* [7.695.0] minuto dell'ultima occasione: una ogni undici minuti al massimo, o la partita diventa un tiro al bersaglio */
  const pianoLock693=useRef(0);/* [7.693.0 — IL PIANO DEL GOL POSSIEDE IL PALLONE. Rosso __CPM_NO693]
     MISURATO (traccia-693, tre costruzioni in una partita): il piano ESCE tutto (3/3, 2/2, 3/3) e le sue
     righe propongono davvero il limite dell'area (bx 84, e il freno non le tocca: bex 84). Ma il pallone
     LOGICO in quelle stesse finestre resta a 37-48: non si muove di un metro verso la porta. La proposta
     del piano viene cancellata NELLO STESSO TICK da altri due scrittori che arrivano dopo — l'elezione del
     portatore (7.642) riscrive il bersaglio sui piedi dell'uomo piu' vicino alla palla, e la trama (7.538)
     lo riscrive sul proprio waypoint. Il PO lo descrive esattamente: «si vede solo gioco finto a
     centrocampo». Questo contatore e' la stessa regola del 7.646 applicata al PALLONE invece che al turno:
     finche' il piano ha una parola da dire, nessun altro scrittore tocca il bersaglio. */
  const pendingGoalRef=useRef(null);/* [7.528.0 IL GOL SI COSTRUISCE] {ev,dir,ticks}: il gol del microsim aspetta che la palla arrivi nell'ultimo terzo *//* [7.525.0] tick al CALCIO D'INIZIO dopo un gol ambientale: col pallone che ora vola DENTRO lo specchio (bpos 98/2), senza ripresa dal centro restava parcheggiato in rete dove l'unico uomo e' il portiere (non-portatore per regola) — ball-attended misurato 45,8% < 52 al primo giro */
  const direttoreRef=useRef({f:null,l:0,dal:0});/* [7.647.0 F1a] la scena narrativa corrente {f,l,dal}: il direttore di partita della roadmap narrativa */
  const golCoda645=useRef([]);/* [7.645.0] LA CODA DEI GOL SOVRAPPOSTI: il microsim e' un budget, le costruzioni escono una alla volta */
  /* [7.485.0 direttiva PO «la cronaca deve rispecchiare ed essere sincronizzata con i movimenti sul campo»]
     PAUSA MINIMA FRA DUE RIGHE DI CRONACA. Ogni riga DICHIARA dove va il pallone (`bpos`) e come si
     dispone la squadra (`pd`): testo e movimento nascono dalla stessa sorgente, quindi la desincronia non
     e' di contenuto ma di TEMPO. Misurato sul flusso vero (testimone `__CPM_BGSYNC`): la frazione del
     tragitto dichiarato percorsa prima che la riga dopo sposti il bersaglio ha mediana 64%, ma 5 coppie
     su 12 stanno sotto un terzo — e quelle stanno TUTTE a 418-420 ms l'una dall'altra, cioe' UN TICK: il
     pallone fa un solo passo di lerp (0,25 della distanza = 25%) e il testo successivo lo smentisce.
     Non e' la densita' media a rompere la sincronia, e' il RAGGRUPPAMENTO. Con un pavimento di 3 tick
     ogni movimento dichiarato e' percorso almeno per ~58% (1-0,75^3) prima che qualcuno lo contraddica.
     ⚠️ Il gol del micro-simulatore e' ESENTE: un gol si racconta quando accade, non quando la pausa lo
     consente. */
  const bgCoolRef=useRef(0);
  /* [7.486.0] LA COPPIA DI QUESTA PARTITA, seedata su avversario+stagione+settimana: stessa gara, stesse
     voci, come un palinsesto — e nessun campo nuovo da salvare. */
  const telecronistiRef=useRef(null);
  if(!telecronistiRef.current)telecronistiRef.current=pickTelecronisti((opponent&&(opponent.id||opponent.n))+"_"+(player.season||1)+"_"+(player.week||1));
  const tcPresRef=useRef(false);/* la presentazione esce una volta sola */
  const tcCountRef=useRef(0);/* ogni quante righe la seconda voce interviene */
  const bgSubjRef=useRef(null);/* [7.487.0] il protagonista corrente della cronaca: e' il filo dell'azione */
  const chantTimersRef=useRef([]);
  // [5.75.0 BUG-3] fxTimersRef+fxTimeout: timer effimeri (cinema gol/pressione, float label, celebrazioni)
  //   tracciati e cancellati su unmount → niente setState su componente smontato / lavoro fantasma.
  const fxTimersRef=useRef([]);
  const resultShownRef=useRef(0);// [5.84.0 UX-3] guardia anti-tap-accidentale sul result
  const _contLockRef=useRef(false);// [6.76.0 LMV-L7] lock anti-doppio handleContinue
  const fxTimeout=(fn,ms)=>{const id=setTimeout(fn,ms);fxTimersRef.current.push(id);return id;};
  const pendingChainSitRef=useRef(null); // Sprint 77
  const _forceSeqRef=useRef(0);// [7.212.0] progressivo delle forzature → ogni «Rivedi» è una scena nuova per lo snap
  const velRef=useRef({});
  const hlTickRef=useRef(0); // 3DV-MOV: contatore tick per oscillazione lenta deterministica nei movimenti HL
  /* [7.499.0 F3b] LE FAMIGLIE CONFINANTI. Il campo e' un continuo: una riga di centrocampo raccontata
     mentre si sta ripiegando non e' una bugia, una riga di area avversaria si'. Questa mappa dice quali
     famiglie restano credibili accanto a quella decisa — le altre si smorzano, ma non spariscono (un
     filtro secco affamerebbe il repertorio: vedi la nota del 7.486). */
  const _VIC499={defend_goal:["retreat"],retreat:["defend_goal","midfield"],midfield:["retreat","attack","wide_right"],
    attack:["midfield","wide_right","attack_goal"],wide_right:["attack","midfield"],attack_goal:["attack","wide_right"],opp_goal:["defend_goal"]};
  const DRIFT_PRESETS={
    // index 0 = home GK (always fixed in goal centre), indices 1-9 = home outfield
    attack:    [{x:5,y:50},{x:22,y:18},{x:22,y:38},{x:22,y:62},{x:22,y:82},{x:44,y:25},{x:44,y:75},{x:64,y:22},{x:64,y:50},{x:64,y:78}],
    attack_goal:[{x:5,y:50},{x:25,y:20},{x:25,y:42},{x:25,y:58},{x:25,y:80},{x:44,y:22},{x:44,y:78},{x:65,y:16},{x:78,y:50},{x:65,y:84}],
    wide_right: [{x:5,y:50},{x:22,y:18},{x:22,y:38},{x:22,y:62},{x:22,y:82},{x:44,y:25},{x:44,y:75},{x:62,y:88},{x:70,y:72},{x:76,y:92}],
    /* [7.634.0 — GLI ESTERNI ALTI TENGONO L'AMPIEZZA. Rosso __CPM_NO634] Mappa 7.627: nel preset
       DOMINANTE gli uomini piu' avanzati (x57) stavano a y 30/70 — l'ampiezza vera (18/82) era solo
       dei difensori a x22, lontani dai punti d'arrivo dei voli; gli ospiti tengono gia' 20/80.
       A 22/78 gli esterni abitano il corridoio largo (centri 18/82 dal 7.630): il cambio campo
       del 7.631 ha finalmente un uomo da trovare. */
    midfield:  [{x:5,y:50},{x:22,y:18},{x:22,y:38},{x:22,y:62},{x:22,y:82},{x:44,y:25},{x:44,y:50},{x:44,y:75},{x:57,y:(typeof window!=='undefined'&&window.__CPM_NO634)?30:22},{x:57,y:(typeof window!=='undefined'&&window.__CPM_NO634)?70:78}],
    retreat:   [{x:5,y:50},{x:12,y:25},{x:12,y:50},{x:12,y:75},{x:25,y:15},{x:25,y:50},{x:25,y:85},{x:35,y:30},{x:35,y:55},{x:35,y:70}],
    defend_goal:[{x:5,y:50},{x:8,y:20},{x:8,y:42},{x:8,y:58},{x:8,y:80},{x:16,y:30},{x:16,y:50},{x:16,y:70},{x:26,y:38},{x:26,y:62}],
    opp_goal:  [{x:5,y:50},{x:75,y:18},{x:75,y:38},{x:75,y:62},{x:75,y:82},{x:64,y:25},{x:64,y:75},{x:52,y:22},{x:52,y:50},{x:52,y:78}],
  };
  // ATE-1: mappa preset drift → tipo arco palla per ThreeMatchView durante "playing"
  const BG_ARC_MAP={attack_goal:"shot",attack:"shot",wide_right:"cross",opp_goal:"save",defend_goal:"save",retreat:"tackle",midfield:"pass"};

  const keysRef=useRef(new Set());
  const moveRef=useRef(null);
  const zone=getZone(pPos.x);
  const oppPrestige=opponent?.p||opponent?.prestige||65;
  const opponents=useRef([{x:76,y:35},{x:82,y:50},{x:79,y:65}]);

  const lastComWallRef=useRef(0);/* [7.532.0] orologio di parete dell'ultima battuta: i cori si armonizzano sui tick quieti */
  /* [7.681.0 direttiva PO «L'eroe non interagisce per niente durante la telecronaca, deve essere
     interattiva, a scelta!»] LA RIGA PUO' PORTARE DELLE SCELTE. Quarto argomento opzionale: quando
     c'e', il banner in campo disegna i bottoni sotto la frase. Nessuna riga esistente cambia — chi
     chiama addCom con tre argomenti si comporta esattamente come prima. */
  /* [7.681.0] SCEGLIERE. Applica le conseguenze allo stato narrativo, scrive la riga d'esito e
     marca la riga come gia' scelta (cosi' i bottoni spariscono e non si puo' rispondere due volte).
     ⚠️ IL PUNTEGGIO NON SI TOCCA: il microsim resta l'autorita' del risultato. Qui si muovono soltanto
     coinvolgimento, intesa, fiducia, zona e marcatura — cioe' chi ti cerca e chi ti marca. */
  const scegli681=useCallback((idx,auto)=>{
    const P=intxPendRef681.current; if(!P||!P.sc||!P.sc[idx]){if(typeof window!=='undefined'){try{window.__CPM_SC681_NOPEND=(window.__CPM_SC681_NOPEND||0)+1;}catch(_e){}}return;}/* [7.721 strumentazione] scelte arrivate SENZA scheda in sospeso */
    intxPendRef681.current=null;setScFreeze681(false);
    const opt=P.sc[idx],N=narrRef669.current||{};
    try{const c=opt.cons||{};
      if(c.marcatura)N.marcatura=Math.max(0,(N.marcatura|0)+c.marcatura);
      if(c.intesa)N.intesa=(N.intesa|0)+c.intesa;
      if(c.coinv)N.coinv=(N.coinv|0)+c.coinv;
      if(c.fiducia)N.fiducia=(N.fiducia|0)+c.fiducia;
      if(c.zona)N.zona=(N.zona|0)+c.zona;
      (N.scelte=N.scelte||[]).push(P.id+"#"+idx);
      /* [7.719.0] LA PROMESSA E' UN FATTO DA VERIFICARE, NON UNA RIGA DI COLORE. «La prossima
         entra» (er_sprona#0: l'eroe rialza il compagno · co_inc#0: il capitano carica l'eroe) non
         racconta piu' un gol inventato: arma una promessa nello stato col punteggio del momento.
         Il watcher nel tick di gioco la richiama SOLO se la squadra segna davvero entro 25 minuti
         — se non segna, silenzio: la storia emerge dai fatti (§6/§13). Rosso __CPM_NO719. */
      if(!(typeof window!=='undefined'&&window.__CPM_NO719)&&((P.id==="er_sprona"&&idx===0)||(P.id==="co_inc"&&idx===0))){
        const _scP=scoreRef.current||{home:0,away:0};
        N.prom719={id:P.id,min:P.min|0,mio:isMatchHome?(_scP.home|0):(_scP.away|0)};
        if(typeof window!=='undefined'){try{(window.__CPM_PROM719=window.__CPM_PROM719||{armate:0,mantenute:0,scadute:0}).armate++;}catch(_e){}}}
      /* [7.682.0] e si scrive nella memoria fra partite: le ultime quattro gare, in testa la piu' recente. */
      try{if(typeof localStorage!=='undefined'){let _r=[];try{_r=JSON.parse(localStorage.getItem('cpm-intx-recenti')||'[]')||[];}catch(_e){_r=[];}
        if(!_r._apertaDaQuestaGara){}
        if(!Array.isArray(_r[0])||N._mem682!==1){_r.unshift([]);N._mem682=1;}
        _r[0].push(P.id+"#"+idx);localStorage.setItem('cpm-intx-recenti',JSON.stringify(_r.slice(0,5)));}}catch(_e){}/* [7.690.0] cinque partite di storia: due di esclusione dura + tre di penalizzazione *//* [7.681.0] la chiave anti-ripetizione include il RAMO: la stessa scheda, un'altra partita, si apre su un ramo diverso */
    }catch(_e){}
    let _t=null;try{_t=opt.es(P.ctx||{});}catch(_e){_t=null;}
    setComs(p=>{const q=p.slice();if(q[0])q[0]={...q[0],sci:idx,scAuto:!!auto};return q;});
    if(_t)setTimeout(()=>{try{addComRef681.current&&addComRef681.current(_t,"#c4b5fd",clockRef.current);}catch(_e){}},260);
    if(typeof window!=='undefined'){try{(window.__CPM_SC681=window.__CPM_SC681||[]).push({id:P.id,idx,auto:!!auto,min:P.min});}catch(_e){}}
  },[]);
  const addComRef681=useRef(null),scegli681Ref=useRef(null);
  const addCom=useCallback((text,color,t,sc)=>{lastComWallRef.current=Date.now();
    /* ⚠️ [7.686.0 collaudo PO: «le interazioni in cronaca devono freezare piu' a lungo, a volte non ho
       il tempo nemmeno di leggere»] LA RIGA NUOVA ASPETTA, LA DOMANDA NO.
       Nel 7.681 avevo scritto il contrario: se arrivava una riga mentre la scelta era aperta, chiudevo
       la scelta sull'opzione neutra per non lasciarla in sospeso. Sembrava prudenza, ed era il motivo
       per cui la domanda spariva prima che il PO potesse leggerla — con il tick fermo di righe nuove
       ne arrivano pochissime (solo quelle gia' programmate da un timer), ma bastava una per portarsi
       via la scelta. Adesso e' la riga a farsi da parte: finche' c'e' una domanda aperta, la cronaca
       non scrive. La scelta si chiude quando il giocatore decide o quando scade il suo tempo — che
       sono gli unici due modi in cui deve chiudersi. */
    if(!sc&&intxPendRef681.current){if(typeof window!=='undefined'){try{window.__CPM_SC681_REF=(window.__CPM_SC681_REF||0)+1;}catch(_e){}}return;}/* [7.721 strumentazione] righe RIFIUTATE perche' c'e' una scelta aperta */
    if(sc&&typeof window!=='undefined'){try{window.__CPM_SC681_IN=(window.__CPM_SC681_IN||0)+1;}catch(_e){}}/* [7.721 strumentazione] righe con scelta ENTRATE nel banner */
    if(sc)setScFreeze681(true);/* [7.682.0] la partita si ferma qui, e riparte quando la scelta e' presa */setComs(p=>[{text,color,t:t??clockRef.current,sc:sc||null,sci:null},...p].slice(0,16));},[]);
  addComRef681.current=addCom;scegli681Ref.current=scegli681;
  /* [7.681.0] IL RESPIRO DELLA SCELTA. Nove secondi: poco piu' del respiro che la cronaca gia' concede
     agli eventi importanti (7 tick, 6,3 s a velocita' 1), abbastanza per leggere due righe e decidere.
     Scaduto il tempo si applica la PRIMA opzione della scheda — quella scritta per essere neutra — e
     la riga lo dichiara («scelta da sola») invece di far finta che il giocatore avesse deciso. */
  useEffect(()=>{
    const c0=coms&&coms[0];
    if(typeof window!=='undefined'&&intxPendRef681.current&&c0&&!c0.sc){try{window.__CPM_SC681_TOP=(window.__CPM_SC681_TOP||[]);window.__CPM_SC681_TOP.push(String(c0.text||"").slice(0,50));}catch(_e){}}/* [7.721 strumentazione] righe salite SOPRA una scelta in sospeso */
    if(!c0||!c0.sc||c0.sci!=null)return;
    /* [7.682.0 direttiva PO «almeno 20 secondi»] con la partita ferma il tempo di lettura non costa
       piu' ritmo alla cronaca: si puo' dare quello che serve per leggere tre opzioni e sceglierne una. */
    /* [7.686.0] da venti a trentacinque secondi: il PO ha collaudato i venti e ha detto che a volte non
       bastano. Con la partita ferma il tempo di lettura non costa niente a nessuno. */
    const ms=(typeof window!=='undefined'&&+window.__CPM_SCMS681)||35000;
    if(typeof window!=='undefined'){try{window.__CPM_SC681_TMR=(window.__CPM_SC681_TMR||0)+1;}catch(_e){}}/* [7.721 strumentazione] timer di scadenza ARMATI */
    const h=setTimeout(()=>{if(typeof window!=='undefined'){try{window.__CPM_SC681_FIRE=(window.__CPM_SC681_FIRE||0)+1;}catch(_e){}}try{scegli681(0,true);}catch(_e){}},ms);
    return()=>{clearTimeout(h);if(typeof window!=='undefined'){try{window.__CPM_SC681_CLR=(window.__CPM_SC681_CLR||0)+1;}catch(_e){}}};
  },[coms,scegli681]); // stable — clockRef via ref, non dipende da clock state
  /* [7.532.0 collaudo PO «nella cronaca testuale sono mischiati telecronaca ed indicazioni del mister, vanno
     divise in maniera armoniosa» — rosso __CPM_NO540] LA VOCE DELLA PANCHINA HA IL SUO POSTO: le battute del
     mister non entrano piu' nel flusso della telecronaca (e quindi nel banner FM) — vivono in un riquadro
     PANCHINA dedicato, con la loro faccia grafica e la loro dissolvenza. Col rosso tornano nel feed. */
  const [coachMsg,setCoachMsg]=useState(null);const coachTimerRef=useRef(null);
  const addCoach=useCallback((text,t)=>{
    if(typeof window!=='undefined'&&window.__CPM_NO540){addCom(text,"#86efac",t);return;}
    setCoachMsg({text,t:t??clockRef.current,key:Date.now()});
    clearTimeout(coachTimerRef.current);coachTimerRef.current=setTimeout(()=>setCoachMsg(null),6000);
  },[addCom]);
  // Component-scope chantFor — tracks timer IDs so they can be cleared on phase exit
  const chantFor=(type,dur=2800,_rt541=0)=>{/* [7.532.0] _rt541: tentativo di rinvio del coro (arrow function: niente `arguments`) */
    // Auto-contextualize generic "home" calls based on score gap + momentum
    let _type=type;
    if(_type==="home"){
      const _sc=scoreRef.current;const _gap=_sc.home-_sc.away;
      if(drby&&Math.random()<0.38)_type="derby";
      else if(_gap>0&&momentumRef.current>60)_type="winning";
      else if(_gap<0&&momentumRef.current<40)_type="comeback";
    }
    // Escalate "losing" to "boo" when crowd is genuinely hostile (losing by 2+ with low momentum)
    if(_type==="losing"){const _sc=scoreRef.current;if((_sc.away-_sc.home)>=2&&momentumRef.current<25)_type="boo";}
    // Sprint 155: national team identity; Sprint 156: language-congruent chant pool
    const _isNat=context==="national"||context==="nationsCup"||context==="euroMondiale_group"||context==="euroMondiale_ko"||context==="euroMondiale"||context==="euroMondiale_qualif";
    const _natD=_isNat?(NAT_CLUB_DATA[player.nation||"Italia"]||{a:"ITA",c:"#003399"}):null;
    const clubN=_isNat?(_natD?.a||player.nation||"Nazionale"):(player.club?.a||player.club?.n||player.club?.name||"la squadra");
    // [6.39.0] pool nella LINGUA giusta: per-lega/nazione → per-lingua (riempie i buchi) → base IT
    const pool=chantPoolFor(_type,_isNat,player.nation,player.club?.lg);
    const t=pick(pool);
    const clubCol=_isNat?(_natD?.c||"#003399"):(player.club?.c||"#4ade80");
    /* [7.532.0 collaudo PO «i cori si accavallano con la cronaca» — rosso __CPM_NO541] I CORI AMBIENTALI
       ASPETTANO IL VARCO: se una battuta di telecronaca e' fresca (<1,8s) il coro si RINVIA di 1,2s (fino a
       3 tentativi), non si scarta — le battute escono ogni 1-3s e uno scarto secco avrebbe zittito la curva
       (nota PO «non ho visto i cori»). Il tifo da GOL resta immediato: quello DEVE sovrastare tutto. */
    if(!/goal/.test(String(_type))&&!(typeof window!=='undefined'&&window.__CPM_NO541)&&(Date.now()-lastComWallRef.current)<1800){
      if(_rt541<3){const _tid541=setTimeout(()=>{try{chantFor(_type,dur,_rt541+1);}catch(_e){}},1200);chantTimersRef.current.push(_tid541);}
      return;}
    setCrowdChant({text:t.replace(/\[CLUB\]/g,clubN),type:_type,key:Date.now(),clubCol});
    const tid=setTimeout(()=>setCrowdChant(null),dur);
    chantTimersRef.current.push(tid);
  };

  // Sprint 34 — tactic choice handler
  // Load scout report on mount (career matches only)
  useEffect(()=>{
    if(context==="trial")return;
    let _alive=true;/* [7.121.0 rifiniture robustezza] guardia unmount: con una API key configurata lo scout impiega secondi; se si torna alla dashboard prima del resolve, il setState su componente smontato dava un warning React */
    setScoutLoading(true);
    generateScoutReport(opponent,player.stats,player.matchHistory||[],player).then(r=>{if(_alive){setScoutReport(r);setScoutLoading(false);}});
    return ()=>{_alive=false;};
  },[]);// eslint-disable-line

  // Async handler: load opponent tactic then go to formations
  const handleGoToFormations=async()=>{
    cpmTimelineReset(); cpmEmit("MatchStart",{opponent:(opponent&&(opponent.n||opponent.name))||null});// LMQP-1
    cpmEvReset();/* [7.496.0 F1b] il libro mastro parte vuoto a ogni partita: senza, due partite di fila si sommano e il conto dei gol non torna per un motivo che non c'entra col gioco */
    matchMemRef.current={goals:0,assists:0,misses:0,gkSaves:0,corners:0,foulsWon:0,byFlank:{L:0,C:0,R:0}};// M2: azzera la memoria narrativa a inizio partita
    setOppTacticLoading(true);
    setPhase("formations");
    const tactic=await generateOpponentTactic(opponent,player.stats,player.week||1);
    if(!_lmAliveRef.current)return;/* [7.121.0 rifiniture] guardia unmount anche sul tactic AI */
    setOppTactic(tactic);
    setOppTacticLoading(false);
    // save tactic to player via callback if available (handled by parent via onMatchEnd context)
    if(typeof window!=='undefined'&&window.__CPM_AI_DEBUG)console.log("[CPM-AI] Opponent tactic:",tactic);/* [6.45.0 RC] gate: prima loggava a OGNI partita e finiva anche nell'AAB store */
  };

  // Cleanup: cancella cori pendenti e blocca il target del pallone quando si esce dal "playing"
  useEffect(()=>{
    if(phase!=="playing"){
      chantTimersRef.current.forEach(clearTimeout);
      chantTimersRef.current=[];
      setCrowdChant(null);
      setSubEvent(null);
      ballTargetRef.current=ballPosRef.current; // congela target durante highlight/ended
    }
    // [6.76.0 LMV-L5] a FINE PARTITA muoiono anche i timer fx pendenti (floatGoal/cronaca/celeb-fallback
    //   schedulati nell'ultimo HL): prima facevano setState sopra la schermata finale (float/cinema fantasma).
    if(phase==="ended"){fxTimersRef.current.forEach(clearTimeout);fxTimersRef.current=[];}
  },[phase]);// eslint-disable-line
  // [5.75.0 BUG-3] cleanup su UNMOUNT: cori + timer effimeri (fxTimeout) muoiono col componente —
  //   prima restavano vivi → setState su LiveMatch smontato (warning React + lavoro fantasma).
  const _lmAliveRef=useRef(true);/* [7.121.0 rifiniture robustezza] LiveMatch montato? → guardia per i setState delle chiamate AI async (commentary) che possono risolvere dopo il fischio finale/uscita */
  useEffect(()=>()=>{
    _lmAliveRef.current=false;
    chantTimersRef.current.forEach(clearTimeout);chantTimersRef.current=[];
    fxTimersRef.current.forEach(clearTimeout);fxTimersRef.current=[];
  },[]);// eslint-disable-line

  // reset position + selectedActionIdx when highlight changes
  /* [7.224.0 revisione PO «manca l'avversario» · «non c'è il compagno» · «blocchi il tiro di nessuno»]
     LA REGIA DEGLI ATTORI ESTRATTA IN UN HELPER. Il setup posizionale (set-piece / area / TACT-POS) girava
     SOLO entrando da hl_intro/hl_move: il percorso di FORZATURA (`__CPM_FORCE_SIT` con choose=true — cioè il
     WIZARD DI REVISIONE e il gate) salta dritto a hl_choose e quindi NON lo eseguiva MAI. Ogni scena del
     wizard nasceva coi 21 dove li aveva lasciati la scena precedente: misurato, su «Muro in area! Blocca il
     tiro» l'avversario più vicino stava a 43 unità GIÀ NELLO STRATO LOGICO (e i mesh, che dalla logica
     derivano, a 42) — si bloccava il tiro di nessuno, si scambiava con nessuno. La regia lenta di pressing
     (tick 550-700ms, tetto 5u) non poteva recuperare in una scena da un secondo, e il primo tentativo di
     correzione (snap sugli attori DENTRO quella regia) falliva proprio perché correggeva lo strato sbagliato
     al momento sbagliato. Ora il setup è un chokepoint unico (pattern STAB) e il force-sit lo chiama. */
  const stageSitPositions=(sit0,hp)=>{if(!sit0)return;
    /* [7.456.0] il bump sta QUI, non ai punti di chiamata: React 18 accorpa questo `set` con i
       `setMatchPlayers` che seguono, quindi numero nuovo e posizioni nuove arrivano insieme. */
    setStageStamp(s=>s+1);
    /* hp = posizione REALE dell'eroe: la regia si ancora a LUI,
     non al centro della zona — l'eroe può nascere sul bordo (continuità/seed) e un ancoraggio al centro lasciava
     gli attori a 12-17u. I set-piece restano ancorati al punto palla (szX/szY): lì è la palla a comandare. */
      // Sprint 117b/124: realistic positioning for lockMovement (rigore/punizione)
      /* [7.186.0 collaudo PO «punizione senza barriera e giocatori mal posizionati»] lo schieramento da set-piece
         girava SOLO per le situation con lockMovement: le punizioni CON movimento (la maggior parte — «a effetto»,
         «muro a 9 metri», dalla trequarti…) restavano col posizionamento di gioco aperto ereditato, quindi senza
         barriera e con i giocatori sparsi. Ora vale per OGNI set-piece (rigore o intent freekick). */
      if(isSetPieceSit(sit0)){
        const sit=sit0;
        const szX=(sit.startZone.x[0]+sit.startZone.x[1])/2;
        const szY=(sit.startZone.y[0]+sit.startZone.y[1])/2;
        // Sprint 159: text-based detection so rovesciata (lockMovement+area) isn't misclassified as penalty
        const isPenalty=isPenaltySit(sit);/* [6.3.2 R1a] intent, non testo (equivalenza verificata) */
        const isFlankFK=!isPenalty&&(szY<22||szY>78);
        const isAreaPlay=!isPenalty&&!isFlankFK&&sit.zones?.[0]==="area";
        setMatchPlayers(prev=>prev.map((pl,idx)=>{
          if(pl.team==="ref")return pl;
          if(pl.team==="away"){
            const ai=idx-10;
            if(ai===0)return{...pl,x:97,y:50}; // Away GK on goal line
            if(isPenalty){const _no657=(typeof window!=='undefined'&&window.__CPM_NO657);return{...pl,x:_no657?(82+(ai%3)*5):(75+(ai%4)*2),y:20+ai*7};}/* [7.657.0 - SUL RIGORE SI STA FUORI DALL'AREA. Collaudo PO (screenshot, SIT #5): un avversario dentro l'area accanto alla porta durante il rigore. Lo staging metteva TUTTI a x 82-92 - in piena area (limite ~82, rete 84+). Ora al limite: x 75-81, pronti al rimbalzo, come da regolamento. Rosso __CPM_NO657. */
            if(isFlankFK){
              // Pack the box for flank/corner FK
              const bx=[84,87,90,82,86,88,79,83,77,75];
              const by=[32,50,68,40,57,42,24,66,38,62];
              return{...pl,x:bx[ai-1]||82,y:by[ai-1]||50};
            }
            if(isAreaPlay){
              // crowded box — rovesciata, cross, open-play area situations (all x≥82, inside area)
              const rx=[92,88,85,90,82,86,82,83,94,84];
              const ry=[szY-12,szY+10,szY-4,szY+16,szY,szY-18,szY+8,szY-6,szY+20,szY-14];
              return{...pl,x:clamp(rx[ai-1]||88,82,97),y:clamp(ry[ai-1]??szY,4,96)};
            }
            /* [7.186.0] MURO RELATIVO alla palla (prima x:70 FISSO → su una punizione dalla trequarti finiva
               dietro/lontano dal pallone): 4 uomini a ~9-10u davanti alla palla sulla linea palla→porta, gli altri
               a marcare in area. Così la barriera c'è sempre e sta dove deve. */
            const _wX=clamp(szX+9.5,szX+7,90),_wY=szY+(50-szY)*0.28;
            if(ai<=4)return{...pl,x:_wX,y:clamp(_wY+(ai-2.5)*1.7,10,90)};
            const _mx=[84,88,91,86,89,93],_my=[36,50,64,26,74,44];
            return{...pl,x:clamp(_mx[ai-5]||87,szX+11,95),y:_my[ai-5]||50};
          }else{
            if(idx===0)return{...pl,x:4,y:50}; // Home GK
            if(isPenalty){const _no657b=(typeof window!=='undefined'&&window.__CPM_NO657);return{...pl,x:_no657b?(82+(idx%3)*5):(75+(idx%4)*2),y:20+idx*7};}/* [7.657.0] stessi limiti per i compagni del battitore */
            if(isFlankFK){
              // Runners in box + wide support
              const bx=[88,91,88,84,82,76,76,72,68];
              const by=[36,50,64,42,58,30,70,45,55];
              return{...pl,x:bx[idx-1]||82,y:by[idx-1]||50};
            }
            if(isAreaPlay){
              // crowded box — attackers inside area (offsets capped to stay x≥82)
              const hx=[szX,szX-3,szX+3,szX-6,szX+4,szX-5,szX-2,szX-7,szX+2];
              const hy=[szY-10,szY+10,szY,szY-16,szY+16,szY-4,szY+4,szY-22,szY+22];
              return{...pl,x:clamp(hx[idx-1]||szX,82,97),y:clamp(hy[idx-1]??szY,4,96)};
            }
            // Direct FK: attackers attacking box, midfield cover
            const ax=[87,89,85,82,80,76,72,68,65];
            const ay=[38,50,62,32,68,44,56,36,64];
            return{...pl,x:ax[idx-1]||80,y:ay[idx-1]||50};
          }
        }));
      // Sprint 157: non-lockMovement area highlights — place players in the box so it never
      // looks like a penalty (players outside the area) due to inherited BG_MATCH positions
      }else if(sit0?.zones?.[0]==="area"){
        const sit=sit0;
        const szX=(hp&&hp.x!=null)?hp.x:(sit.startZone.x[0]+sit.startZone.x[1])/2;
        const szY=(hp&&hp.y!=null)?hp.y:(sit.startZone.y[0]+sit.startZone.y[1])/2;
        setMatchPlayers(prev=>prev.map((pl,idx)=>{
          if(pl.team==="ref")return pl;
          if(pl.team==="away"){
            const ai=idx-10;
            if(ai===0)return{...pl,x:97,y:50}; // Away GK on goal line
            // Defenders packed inside the area (all x≥82)
            const rx=[92,88,85,90,82,86,82,83,94,84];
            const ry=[szY-12,szY+10,szY-4,szY+16,szY,szY-18,szY+8,szY-6,szY+20,szY-14];
            return{...pl,x:clamp(rx[ai-1]||88,82,97),y:clamp(ry[ai-1]??szY,4,96)};
          }else{
            if(idx===0)return{...pl,x:4,y:50}; // Home GK
            // Attackers crowding the box, all x≥82 (inside area)
            const hx=[szX,szX-3,szX+3,szX-6,szX+4,szX-5,szX-2,szX-7,szX+2];
            const hy=[szY-10,szY+10,szY,szY-16,szY+16,szY-4,szY+4,szY-22,szY+22];
            return{...pl,x:clamp(hx[idx-1]||szX,82,97),y:clamp(hy[idx-1]??szY,4,96)};
          }
        }));
      // TACT-POS (4.74.0): posizionamento tattico per zone non-area (trequarti/bordo/fascia/centro/difesa/propria)
      // Prima di questo fix le 129 situazioni non-lockMovement fuori area ereditavano posizioni casuali da BG_MATCH.
      }else{
        const sit=sit0;
        if(sit){
          const z0=sit.zones?.[0]||"trequarti";
          const szX=(hp&&hp.x!=null)?hp.x:((sit.startZone?.x[0]+sit.startZone?.x[1])/2||65);
          const szY=(hp&&hp.y!=null)?hp.y:((sit.startZone?.y[0]+sit.startZone?.y[1])/2||50);
          const isDef=sit.type==="def";
          const isWide=z0==="fascia"||(sit.startZone?.y&&((sit.startZone.y[0]+sit.startZone.y[1])/2<28||(sit.startZone.y[0]+sit.startZone.y[1])/2>72));
          setMatchPlayers(prev=>prev.map((pl,idx)=>{
            if(pl.team==="ref")return pl;
            if(pl.team==="away"){
              const ai=idx-10;
              if(ai===0)return{...pl,x:clamp(97,88,99),y:clamp(pl.y+(50-pl.y)*0.2,30,70)};// GK portiere
              if(isDef){
                // azione difensiva: avversario porta palla attorno a szX/szY, difensori supportano
                const ox=[szX,szX+4,szX-3,szX+2,szX+6,szX-5,szX+8,szX-6,szX+3,szX+10];
                const oy=[szY,szY+7,szY-7,szY+14,szY-14,szY+20,szY-20,szY+4,szY-4,szY+10];
                return{...pl,x:clamp(ox[ai-1]??szX,15,95),y:clamp(oy[ai-1]??szY,4,96)};
              }
              // zona offensiva: difensori avversari formano linea difensiva tra eroe e porta
              const depthOff=z0==="centro"?62:z0==="trequarti"?72:z0==="bordo"?78:70;
              if(isWide){
                // wide: terzino vicino all'eroe + blocco difensivo in area
                const wx=[szX+3,depthOff,depthOff+4,depthOff-3,depthOff+7,depthOff-5,depthOff+10,depthOff-7,depthOff+2];
                const wy=[szY+(szY<50?6:-6),40,60,50,30,70,45,55,35];
                return{...pl,x:clamp(wx[ai-1]??depthOff,40,95),y:clamp(wy[ai-1]??szY,4,96)};
              }
              // centrale: difensori compatti in blocco tra eroe e porta
              const cx=[szX+4,depthOff,depthOff+5,depthOff-4,depthOff+3,depthOff-3,depthOff+8,depthOff-6,depthOff+1];
              const cy=[szY,szY+8,szY-8,szY+16,szY-16,szY+4,szY-4,szY+20,szY-20];
              return{...pl,x:clamp(cx[ai-1]??depthOff,40,95),y:clamp(cy[ai-1]??szY,4,96)};
            }else{
              if(idx===0)return{...pl,x:clamp(4,2,10),y:clamp(pl.y+(50-pl.y)*0.15,30,70)};// GK di casa
              if(isDef){
                // azione difensiva: compagni formano blocco difensivo attorno all'eroe
                const dx=[szX-2,szX-5,szX-8,szX-3,szX-10,szX-6,szX-12,szX-4,szX-9];
                const dy=[szY,szY+7,szY-7,szY+14,szY-14,szY+3,szY-3,szY+20,szY-20];
                return{...pl,x:clamp(dx[idx-1]??szX,5,85),y:clamp(dy[idx-1]??szY,4,96)};
              }
              // zona offensiva: compagni in posizioni di supporto (dietro/lato eroe, 1 runner avanzato)
              if(isWide){
                /* [7.230.0 #49 — il critico (esiti ora davvero forzati) ha misurato gi16 «Cross dalla fascia»
                   senza NESSUN compagno oltre x=76] LO STAGING CONSUMA `tactic.box`. Le situations di cross
                   dichiarano da sempre quanti attaccanti stanno in area (`box:{att,near,far}`) ma il campo era
                   LETTO SOLO da deriveIntent: il "destinatario" era un runner RELATIVO all'eroe (szX+10), che
                   con l'eroe a x 62-70 restava FUORI area — il cross partiva verso nessuno. Ora i primi
                   `box.att` compagni sono ANCORATI in area (x 83-89), al palo dichiarato (near = stesso lato
                   del cross, far = lato opposto), qualunque sia la profondità del battitore. */
                const _bx49=(sit.tactic&&sit.tactic.box)||null;const _nb49=_bx49?clamp(_bx49.att||0,0,3):0;
                if(_nb49&&idx>=1&&idx<=_nb49){
                  const _far49=!!(_bx49.far&&!_bx49.near);
                  const _py49=(szY<50)===!_far49?38:62;/* near = lato del cross · far = palo lontano */
                  return{...pl,x:clamp(83+(idx-1)*3,82,92),y:clamp(_py49+(idx-1)*14*(_py49<50?1:-1),20,80)};
                }
                // wide: 1 giocatore in area (destinatario cross potenziale), resto in supporto
                const wx2=[szX+10,szX-5,szX-8,szX-3,szX+4,szX-12,szX-6,szX-10,szX-15];
                const wy2=[szY>50?40:60,szY+(szY<50?8:-8),szY,szY+(szY<50?16:-16),50,szY,szY+(szY<50?24:-24),szY-5,szY+5];
                return{...pl,x:clamp(wx2[idx-1]??szX,5,95),y:clamp(wy2[idx-1]??szY,4,96)};
              }
              // centrale: 1 runner avanzato, supporto laterale, copertura dietro
              const cx2=[szX+8,szX-6,szX-3,szX+2,szX-10,szX+5,szX-14,szX-8,szX-5];
              const cy2=[szY,szY+10,szY-10,szY+18,szY-18,szY+5,szY-5,szY+25,szY-25];
              return{...pl,x:clamp(cx2[idx-1]??szX,5,92),y:clamp(cy2[idx-1]??szY,4,96)};
            }
          }));
        }
      }
      /* [7.402.0 collaudo PO codice 001 «la scena non parte dai piedi del compagno» — quattro note aeree in
         un lotto (gi64/gi53/gi7/gi108) piu' le orfane misurate gi6/gi50/gi76] AL PUNTO-PALLA CI VA UN UOMO.
         Sulle scene offensive con palla che NON nasce al piede dell'eroe (fascia, bandierina, rimessa) il
         pallone veniva messo su un punto geometrico dove non c'era nessuno — misurato: il compagno piu'
         vicino a 10-16 unita'. Il tentativo del 7.391 spostava la PALLA verso un compagno (cassetta
         postale) e la misura non si mosse; qui si fa il contrario, che e' anche il calcio vero: si porta
         IL COMPAGNO sul punto-palla, in staging — il corner vuole il battitore alla bandierina, il cross
         vuole il crossatore sulla fascia col pallone tra i piedi. Lo staging e' la stessa sorgente da cui
         i mesh snappano al taglio (e al ri-taglio 7.401): uomo e pallone nascono insieme. */
      try{
        if(sit0.type!=="def"&&typeof hlBallSpot==="function"){
          const _bs402=hlBallSpot(sit0,(hp&&hp.x!=null)?hp.x:58,(hp&&hp.y!=null)?hp.y:50);
          if(_bs402&&_bs402.at!=="hero"&&_bs402.at!=="gk"&&_bs402.x!=null){
            _stagedSpotRef.current={sit:sit0,at:_bs402.at,x:_bs402.x,y:_bs402.y};
            setMatchPlayers(prev=>{
              let _bi402=-1,_bd402=1e9;
              prev.forEach((pl,idx)=>{if(pl.team!=="home"||pl.gk||idx===0)return;
                const _d=Math.hypot(pl.x-_bs402.x,pl.y-_bs402.y);if(_d<_bd402){_bd402=_d;_bi402=idx;}});
              if(_bi402<0||_bd402<=3)return prev;/* qualcuno c'e' gia': non si tocca niente */
              return prev.map((pl,idx)=>idx===_bi402?{...pl,x:clamp(_bs402.x,2,98),y:clamp(_bs402.y,2,98),rx:0,ry:0,_taker402:true}:(pl._taker402?{...pl,_taker402:false}:pl));/* rx/ry azzerati + CONTRASSEGNO del battitore: la colla del renderer (7.405) incolla la mesh di chi lo porta al punto staggiato — il match per coordinate non scattava mai, i bersagli dell'AI off-ball non sono i logici grezzi */
            });
          }
        }
      }catch(_e402){}
  };
  useEffect(()=>{
    if(phase==="hl_move"||phase==="hl_intro"){
      // CONTINUITÀ (4.86.0): la nuova Situation nasce dalla posizione FINALE dell'azione precedente,
      // agganciata (clamp) alla sua startZone → niente teletrasporto, l'eroe scivola di poco e la
      // camera (che segue la mesh) resta fluida. I set-piece (lockMovement) mantengono lo spot fisso.
      const _curSit=situations[hlIdx];
      /* [7.399.0 collaudo PO codice 002 «l'eroe non e' gia' posizionato nella posizione giusta, con il
         pallone tra i piedi ad inizio scena»] LA CONTINUITA' SI APPLICA UNA VOLTA PER SCENA, E GUARDA
         DOVE LA PALLA VA — NON DOVE STA PER CASO. Due difetti in uno, misurati fotogramma per fotogramma
         su gi92: (a) all'ingresso dell'intro questo effetto leggeva `ballPosRef`, cioe' la palla A META'
         VOLO, fuori dalla startZone → ripiegava su un punto casuale, e l'eroe veniva snappato li'; (b) al
         passaggio intro→move l'effetto RI-SCATTAVA (la condizione e' sulla fase, che cambia dentro la
         stessa scena), stavolta trovava la palla assestata in zona e RISCRIVEVA pPos dove sta la palla —
         bersaglio spostato di 36 unita' DOPO lo snap, eroe in marcia a piedi per tutta la lettura. Su 96
         aperture assestate: 17 scene offensive con la palla di nessuno (gi92 a 22u, gi152 a 21u, gi96 —
         il «si muove solo il pallone» mai spiegato — con un avversario piu' vicino alla palla dell'eroe).
         Ora: si continua dal BERSAGLIO della palla (dov'e' diretta: e' noto fin dal primo fotogramma, ed
         e' cio' che la nota 4.86 intendeva con «posizione FINALE dell'azione precedente»), e la chiave di
         scena fa applicare la continuita' UNA volta — le transizioni di fase interne non spostano piu'
         il punto di partenza. */
      {const _k002=hlIdx+':'+(_forceSeqRef.current||0);
       if(_contKeyRef.current===_k002)return;
       _contKeyRef.current=_k002;}
      let sp;
      if(_curSit?.lockMovement){ sp=getStartPos(_curSit); }
      else { const _sz=_curSit?.startZone||{x:[55,72],y:[30,70]};
             /* [7.34.1 collaudo PO «BUG/INCOERENZA CATENA: l'azione a cascata deve riprendere più o meno dal
                punto X dove è finita la palla (che per le chance è al limite dell'area), non a caso»] per le
                sit INCATENATE (_chainDepth): (a) il punto di partenza è l'ASSESTAMENTO finale della palla
                (ballTargetRef — al cambio HL ballPosRef è ancora in volo a metà lerp); (b) se X è fuori dalla
                startZone si fa un CLAMP MINIMO dentro la zona (slide di pochi passi) invece del fallback
                getStartPos casuale — era quello il «punto a caso». Le sit NON incatenate mantengono il
                comportamento 4.86 (fallback allo spot corretto sui salti di campo legittimi). */
             const _isChain=!!(_curSit&&_curSit._chainDepth);
             const _pv=ballTargetRef.current||ballPosRef.current||{x:58,y:50};/* [7.399.0 codice 002] il bersaglio, non la posizione a meta' volo: leggere `ballPosRef` qui trovava la palla fuori zona e ripiegava sul punto casuale (vedi il commento sopra) — il privilegio del bersaglio era gia' riconosciuto alle catene dal 7.34.1, e la ragione vale per tutte */
             const _in=_pv.x>=_sz.x[0]&&_pv.x<=_sz.x[1]&&_pv.y>=_sz.y[0]&&_pv.y<=_sz.y[1];
             /* [7.621.0 — SPRINT «PARTITA VERA»: LA SCENA NASCE DOV'ERA DIRETTO IL GIOCO. Rosso __CPM_NO621]
                L'audit highlights (punto 2): «la continuita' butta via il ponte» — bersaglio fuori dalla
                startZone e la scena nasceva su un punto SORTEGGIATO della zona (getStartPos), cioe' il
                «salto di campo» che spezza il racconto. Il rimedio esiste nel codice dal 7.34.1, ma solo
                per le catene: il CLAMP MINIMO dentro la zona («slide di pochi passi invece del punto a
                caso»). Qui si estende a tutte le scene: il punto di nascita e' il punto della zona piu'
                vicino a dove la palla era diretta. E' anche la strada indicata dalla revoca del verso
                (7.579/7.621-muta, entrambe piatte): a tenere il gioco al centro sono le SCENE che
                nascono altrove, non il comando delle righe — l'80% partiva nel corridoio centrale. */
             sp=_in?{x:_pv.x,y:_pv.y}
               :(_isChain||!(typeof window!=='undefined'&&window.__CPM_NO621))?{x:clamp(_pv.x,_sz.x[0],_sz.x[1]),y:clamp(_pv.y,_sz.y[0],_sz.y[1])}
               :(getStartPos(_curSit)||{x:(_sz.x[0]+_sz.x[1])/2,y:(_sz.y[0]+_sz.y[1])/2});
             if(typeof window!=='undefined'&&window.__CPM_CONT621!==undefined){try{const _c1=window.__CPM_CONT621;
               if(_c1.length<300)_c1.push({d:+Math.hypot(sp.x-_pv.x,sp.y-_pv.y).toFixed(1),in:_in?1:0,ch:_isChain?1:0});}catch(_e){}} }
      setPPos(sp);
      stageSitPositions(situations[hlIdx],sp);/* [7.224.0] estratto in helper — lo chiama anche __CPM_FORCE_SIT */
    }
    // Coro folla all'ingresso del momento clou
    if(phase==="hl_intro"){
      const tid=setTimeout(()=>chantFor("home",1500),200);
      chantTimersRef.current.push(tid);
    }
    if(phase==="hl_choose"){
      setSelectedActionIdx(0);
      // Sprint 17: if rigore, pre-compute GK dive direction
      if(isPenaltySit(situations[hlIdx])){/* [6.3.2 R1a] intent, non testo */
        const dirs=["tl","tc","tr","bl","bc","br"];
        const w=[18,8,18,22,12,22];let r=Math.random()*100;
        for(let i=0;i<dirs.length;i++){r-=w[i];if(r<=0){gkDiveRef.current=dirs[i];break;}}
        if(!gkDiveRef.current)gkDiveRef.current="bc";
      }
    }
  },[hlIdx,phase]);// eslint-disable-line

  // ATE-5: debug mode toggle — Shift+D
  useEffect(()=>{
    const fn=(e)=>{if(_scrive386(e))return;if(e.shiftKey&&e.key==="D")setDebugMode(d=>!d);};
    window.addEventListener("keydown",fn);return()=>window.removeEventListener("keydown",fn);
  },[]);

  // [5.75.0 UX-1/BUG-10] startHL: UNICO punto d'ingresso nell'highlight (timeout intro, tastiera, tap) —
  // prima il tap-skip duplicava questa logica con maxMoves grezzo (ignorava il cap da tactic.pressure) e senza reset di defDist.
  const startHL=()=>{
    const sit=situations[hlIdx];
    const mm=hideDirCursor(sit)?0:cappedMM(sit);// item 3: in area (non rigore) niente passo di movimento → conclusione diretta
    /* [6.4.0 R2.1] la proximità del marcatore parte dalla PRESSIONE REALE della situation (nearby_def 0-3),
       non piu da un Math.random 80-100 scollegato: una situazione «difensore addosso» inizia col difensore
       vicino → barra pressione e malus onesti al momento. Deterministico (jitter seedato), penalità d'avvio
       capata a ~0.08 (mai il tier 0.15 al via) per non stravolgere il bilanciamento. */
    const _nd21=(sit&&sit.tactic&&sit.tactic.nearby_def!=null)?sit.tactic.nearby_def:({none:0,low:1,medium:2,high:3}[sit&&sit.tactic&&sit.tactic.pressure]||1);
    const _ddBase21=[88,74,58,44][clamp(Math.round(_nd21),0,3)];
    const _ddJit21=(Math.abs(hashStr(((sit&&sit.text)||"")+"|dd|"+hlIdx))%13)-6;
    movesLeftRef.current=mm;setMovesLeft(mm);moveCoolRef.current=0;pressureRef.current=1;setPressureBar(1);defDistRef.current=clamp(_ddBase21+_ddJit21,26,99);setDefDist(defDistRef.current);
    // CINE-TAC: aerial/immediate situations skip hl_move and go straight to action choice
    if(mm===0&&!sit?.lockMovement){setPhase("hl_choose");}else{setPhase("hl_move");}
  };
  // [5.75.0 UX-1] condizione UNICA di visibilità del pad di movimento (4 mount: mobile/desktop × hl_move/hl_choose)
  const showDPad=(sit)=>!!sit&&!sit.lockMovement&&!hideDirCursor(sit)&&movesLeft>0;
  /* [7.388.0] il budget dei passi, riempito su richiesta della scena FORZATA (test-only). `startHL`
     resta l'unico a deciderlo nel gioco: qui si riusa la stessa regola, non se ne inventa un'altra. */
  if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST))window.__CPM_FILL_MOVES=(st)=>{try{
    const _mm=hideDirCursor(st)?0:cappedMM(st);movesLeftRef.current=_mm;setMovesLeft(_mm);return _mm;}catch(_e){return null;}};
  // hl_intro auto-advance → hl_move after 2.5s (tap/key to skip)
  useEffect(()=>{
    if(phase!=="hl_intro"||paused)return;
    const go=startHL;
    const _introMs51=(typeof window!=='undefined'&&window.__CPM_REVIEW&&situations[hlIdx]&&situations[hlIdx]._chainDepth)?1200:2500;/* [7.234.0 #51] in REVISIONE l'intro del SECONDO TEMPO è metà: il contesto è già noto, la conclusione deve arrivare mentre il PO sta ancora guardando */
    const t=setTimeout(go,_introMs51);
    const onKey=e=>{if(_scrive386(e))return;if(e.key===" "||e.key==="Enter"){clearTimeout(t);go();}};
    document.addEventListener("keydown",onKey);
    return()=>{clearTimeout(t);document.removeEventListener("keydown",onKey);};
  },[phase,hlIdx,situations,paused]);// eslint-disable-line

  // Pressure timer during hl_move — depletes over ~8s, auto-advances on expiry
  useEffect(()=>{
    if(phase!=="hl_move"||paused)return;
    const sit=situations[hlIdx];
    if(sit?.lockMovement||sit?.maxMoves===0)return; // no pressure on penalty/free kick
    const TOTAL=8000,STEP=100;
    const iv=setInterval(()=>{
      // Defender closes in
      const speed=0.025+(oppPrestige/99)*0.02; // faster for better teams
      defDistRef.current=Math.max(0,defDistRef.current-speed*STEP/10);
      setDefDist(defDistRef.current);
      // Pressure drains faster when defender is on you
      const pressureMult=defDistRef.current<25?2.2:defDistRef.current<50?1.5:1;
      pressureRef.current=Math.max(0,pressureRef.current-(STEP/TOTAL)*pressureMult);
      setPressureBar(pressureRef.current);
      if(pressureRef.current<=0){clearInterval(iv);setPhase("hl_choose");}
    },STEP);
    return()=>clearInterval(iv);
  },[phase,hlIdx,situations,paused]);// eslint-disable-line
  /* [7.227.0 #44 collaudo PO «non si vede poi la conclusione del compagno / in porta» — gi18/gi19 ×6]
     IN REVISIONE LA CATENA SI GIOCA. Il successo su dribbling/cross/assist converte in CHANCE e la
     conclusione vive nel SECONDO TEMPO (catena) che il wizard non giocava mai: il force-mode blocca
     handleContinue, quindi il PO vedeva solo il primo tempo — la palla respinta — e bocciava un'azione
     che in partita vera si conclude davvero. SOLO in revisione: (1) dopo l'esito con catena pendente si
     avanza da soli nel secondo tempo (banner «⚡ CATENA!» + intro reali, presentazione identica alla
     partita); (2) la conclusione della catena si risolve da sola con lo STESSO esito forzato della
     combinazione in giudizio (riuscito → si vede il gol; fallito → si vede il tentativo). Zero logica
     nuova: passa da handleContinue e __CPM_RESOLVE, gli stessi binari del gioco. Partita vera e gate
     INTATTI per costruzione (tutto gated su __CPM_REVIEW, che né il gioco né il gate settano). */
  useEffect(()=>{
    if(!(typeof window!=='undefined'&&window.__CPM_REVIEW))return;
    if(phase!=="hl_result"||!outcome||!pendingChainSitRef.current)return;
    _rvwChainOkRef.current=!!outcome.ok;_rvwChainArmRef.current=true;
    const t=setTimeout(()=>{try{handleContinueRef.current&&handleContinueRef.current();}catch(_e){}},1100);/* [7.234.0 #51 misura: la conclusione della catena arrivava a 6.5s dal tap — il PO aveva già votato] in revisione il secondo tempo INCALZA */
    return ()=>clearTimeout(t);
  },[phase,outcome]);// eslint-disable-line
  useEffect(()=>{
    if(!(typeof window!=='undefined'&&window.__CPM_REVIEW))return;
    const _s=situations[hlIdx];
    if(!_s||!_s._chainDepth||!_rvwChainArmRef.current)return;
    if(phase!=="hl_move"&&phase!=="hl_choose")return;
    _rvwChainArmRef.current=false;
    const t=setTimeout(()=>{try{
      const _acts=_s.actions||[];let _k=_acts.findIndex(a=>a&&a.rew==="goal");if(_k<0)_k=0;
      window.__CPM_FORCE_OUTCOME=_rvwChainOkRef.current?'success':'fail';
      window.__CPM_RESOLVE&&window.__CPM_RESOLVE(_k);
    }catch(_e){}},700);
    return ()=>clearTimeout(t);
  },[phase,hlIdx,situations]);// eslint-disable-line

  // Continuous AI pressing during all HL phases — opponents and teammates always move
  useEffect(()=>{
    if(!["hl_intro","hl_move","hl_choose"].includes(phase)||paused)return;
    const sit=situations[hlIdx];
    const isDef=sit?.type==="def";
    const isNearGoal=["area","bordo"].includes(sit?.zones?.[0]);
    const pressingMs=isNearGoal?550:isDef?700:650;
    const iv=setInterval(()=>{
      // Rigore / punizione: area libera, avversari in fila fuori dal box
      if(isSetPieceSit(sit)){/* [7.186.0] era `sit?.lockMovement`: sulle punizioni CON movimento il loop di pressing riscriveva le posizioni ogni ~600ms e CANCELLAVA la barriera appena schierata */
        // 3DV-MOV2 (fix posizioni sballate): set piece (rigore/punizione) — i giocatori TENGONO
        // le posizioni corrette già impostate dal reset effect (muro/barriera/area in base al tipo
        // di punizione). Prima un override generico li riallineava a centrocampo ogni 550ms
        // (x:52-70 incolonnati) ignorando il tipo di calcio piazzato → posizioni completamente sballate.
        // Ora il loop NON sovrascrive più: solo i portieri fanno un micro-assestamento verso il centro porta.
        setMatchPlayers(prev=>prev.map((pl,idx)=>{
          if(pl.team==="ref")return pl;
          if(pl.team==="away"&&idx-10===0)return{...pl,y:clamp(pl.y+(50-pl.y)*0.06,38,62)};// away GK micro-tracking
          if(pl.team==="home"&&idx===0)return{...pl,y:clamp(pl.y+(50-pl.y)*0.06,38,62)};// home GK micro-tracking
          return pl;// giocatori di movimento: mantieni le posizioni del set piece (muro/area)
        }));
        return;
      }
      // 3DV-MOV: target DETERMINISTICI per giocatore (angolo/spread seeded da idx, NON ri-randomizzati ogni tick)
      // + smoothing su velocità (velRef) → niente scatti/teletrasporti schizofrenici. Oscillazione lenta via sin/cos.
      hlTickRef.current++;const _T=hlTickRef.current*0.5;
      /* [7.310.0 collaudo PO «azione chip millimetrico a centrocampo/trequarti ha dato vita ad una scena
         surreale con assist ad un compagno che ha segnato, la palla ha fatto un cerchio su se stesso!»]
         L'ATTORE DELL'ASSIST DEVE ESSERE IN SCENA. Misurato su gi106 «Chip pass oltre la difesa»: al momento
         della consegna l'eroe era il giocatore di casa PIÙ AVANZATO (world x 13.8) e il compagno più avanti
         stava 8.6u DIETRO di lui — quindi un chip «oltre la difesa» non aveva nessuno su cui cadere: la palla
         faceva il suo arco in avanti e poi derivava lateralmente verso il punto d'assestamento, cioe' girava
         attorno a se stessa, mentre il tabellone assegnava assist e gol a un compagno che non toccava palla.
         Qui, quando la situation PREMIA un assist, si garantisce che almeno un compagno sia DAVANTI all'eroe:
         il più avanzato viene mandato a fare il movimento in profondità (8-15u davanti, sulla corsia libera).
         È lo stesso principio del fix «gli attori dell'azione non sono in scena»: chi la storia nomina, il
         campo lo deve avere. Solo posizionamento off-ball → fuori dalla firma golden per costruzione. */

      let _defBd=1e9,_defBx=pPos.x,_defBy=pPos.y;// 3DV-FIX3: traccia l'avversario più vicino all'eroe → porta-palla in azione difensiva
      // [6.75.0 DEF-1] IL PRESSING RISPETTA LA TATTICA: prima TUTTI e 9 gli avversari di movimento convergevano
      //   e stazionavano ad anello attorno all'eroe (raggio 9-16u), qualunque fosse la pressione della situation
      //   («difensore addosso» = 1, la scena ne mostrava 9) → ammucchiata irreale + zone di campo abbandonate.
      //   Ora il numero di avversari INGAGGIATI sull'eroe deriva da tactic.nearby_def (fallback: pressure) —
      //   gli stessi dati che guidano barra pressione e Decision Engine (coerenza logica⟺scena) — e sono i più
      //   LOGICI (i più vicini); gli altri TENGONO il blocco di zona (linea difensiva tra palla e porta, corsie
      //   per ruolo). In HL difensivo la squadra in possesso non circonda il difensore-eroe: un PORTATORE
      //   ingaggiato + 2 linee di passaggio, il resto tiene la forma d'attacco. Deterministico (rank/lane da idx).
      const _sitT=situations[hlIdx];
      const _ndHL=(_sitT&&_sitT.tactic&&_sitT.tactic.nearby_def!=null)?_sitT.tactic.nearby_def:({none:0,low:1,medium:2,high:3}[_sitT&&_sitT.tactic&&_sitT.tactic.pressure]??1);
      const _nEng=clamp(Math.round(_ndHL)+(isNearGoal?1:0),1,4);// ingaggiati sull'eroe: mai 0 (c'è sempre un avversario), mai più di 4
      const _z0T=_sitT?.zones?.[0]||"trequarti";
      const _bkDepth=_z0T==="centro"?62:_z0T==="trequarti"?72:_z0T==="bordo"?78:_z0T==="area"?84:70;// profondità del blocco (come il setup TACT-POS)
      const _laneY=[38,62,50,26,74,44,56,32,68,50];// corsie y per ruolo/slot (copertura ampiezza) — 10 entry: l'away ha 10 giocatori di movimento (ai 1..10)
      // cpmadapt (Cap.4.12) anche sul BLOCCO DI ZONA: la difesa che «si aspetta» lo schema ripetuto SCORRE come
      //   blocco verso la fascia calda (stessa sorgente/formula del shading 3D: matchMem.byFlank, ±6u, deterministico).
      //   Senza questo, il passaggio dall'anello al blocco (DEF-1) avrebbe DILUITO l'adattamento tattico misurato da adapt-test.
      let _adSHL=0;
      if(_CPM_ADAPT&&matchMemRef.current){const _bfH=matchMemRef.current.byFlank||{L:0,C:0,R:0};const _btH=_bfH.L+_bfH.C+_bfH.R;
        if(_btH>=3){const _tp=Math.max(_bfH.L,_bfH.C,_bfH.R);const _st=clamp((_tp/_btH-0.34)/0.4,0,1);const _hy=_bfH.R===_tp?75:(_bfH.L===_tp?25:50);_adSHL=(_hy-50)*_st*0.24;}}
      setMatchPlayers(prev=>{
        // rank avversari di movimento per distanza dall'eroe → i primi _nEng sono gli ingaggiati (stabile: le posizioni convergono)
        const _rk=[];
        for(let k=0;k<prev.length;k++){const q=prev[k];if(!q||q.team!=="away"||(k-10)===0)continue;_rk.push([Math.hypot(pPos.x-q.x,pPos.y-q.y),k]);}
        _rk.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
        const _eng=new Set(_rk.slice(0,_nEng).map(e=>e[1]));
        const _carrierIdx=_rk.length?_rk[0][1]:-1;// HL difensivo: il più vicino è il PORTATORE avversario
        const _supIdx=new Set(_rk.slice(1,3).map(e=>e[1]));// HL difensivo: 2 linee di passaggio
        /* [7.194.0 S1] battitore del set-piece: compagno di movimento più vicino al punto di nascita della palla */
        const _bSpot=hlBallSpot(_sitT,pPos.x,pPos.y);
        let _taker=-1;
        if(_bSpot.at==="corner"||_bSpot.at==="throw"||_bSpot.at==="gk"||_bSpot.at==="wing"){
          if(_bSpot.at==="gk")_taker=0;/* il rinvio lo batte il PORTIERE */
          else{let _bd=1e9;for(let k=1;k<prev.length;k++){const q=prev[k];if(!q||q.team!=="home")continue;const _d=Math.hypot(_bSpot.x-q.x,_bSpot.y-q.y);if(_d<_bd){_bd=_d;_taker=k;}}}
        }
        return prev.map((pl,idx)=>{
        if(pl.team==="ref")return pl;
        let tx,ty;
        if(pl.team==="away"){
          const ai=idx-10;
          // Away GK: stays in goal, tracks ball laterally
          if(ai===0){const tyStep=clamp((pPos.y-pl.y)*0.08,-2,2);return{...pl,x:clamp(pl.x,88,98),y:clamp(pl.y+tyStep,28,72)};}
          if(isDef){
            // HL DIFENSIVO: gli avversari HANNO palla → portatore ingaggiato + opzioni di passaggio, non un anello sull'eroe
            if(idx===_carrierIdx){// portatore: protegge palla davanti all'eroe, lato porta propria dell'eroe (attacca verso x-)
              tx=clamp(pPos.x-4+Math.sin(_T+ai)*1.1,5,97);
              ty=clamp(pPos.y+Math.cos(_T+ai*1.3)*1.1,3,97);
            }else if(_supIdx.has(idx)){// 2 compagni a supporto: linee di passaggio avanti-lato rispetto al portatore
              const _sd=(ai%2)?1:-1;
              tx=clamp(pPos.x-11+Math.sin(_T*0.8+ai)*1.4,5,95);
              ty=clamp(pPos.y+_sd*13+Math.cos(_T*0.7+ai)*1.4,3,97);
            }else{// resto: forma d'attacco distesa AVANTI al portatore verso la porta di casa (target assoluto,
              // ancorato alla palla — niente drift cumulativo né ammucchiata sul difensore-eroe)
              tx=clamp(pPos.x-14-((ai%3)*6)+Math.sin(_T*0.6+ai)*1.3,8,90);
              ty=clamp(_laneY[ai-1]*0.7+pPos.y*0.3+Math.cos(_T*0.5+ai)*1.3,3,97);
            }
          }else if(_eng.has(idx)){
            // INGAGGIATO (il più logico: vicino + coerente con nearby_def): chiude GOAL-SIDE tra eroe e porta,
            // il 1° addosso, gli altri scalati — non più cerchio equidistante
            let _r=0;for(const e of _rk){if(e[1]===idx)break;_r++;}
            /* [7.248.0 gi60 «Doppia marcatura: non si capisce niente»] quando la situation DICHIARA ≥2
               marcatori (nearby_def) il raddoppio deve LEGGERSI: i primi due ADDOSSO (3.2/5.2u) ai due lati,
               non un anello largo a 5/9u — con un solo marcatore le distanze storiche restano. */
            const _dbl48=_ndHL>=2;
            const _gd=_dbl48?(_r===0?3.2:_r===1?5.2:5+_r*4):(5+_r*4);// 1° a 5u, poi 9/13/17 (raddoppio: 3.2/5.2)
            const _ang=ai*1.4;
            /* [7.531.0 rosso __CPM_NO539 — gate motion gi0 «Scatto in profondita'»: minDist palla-difensore
               24,2-27,5 con defNear 0] Il pressing ingaggia sull'EROE, ma sulla palla FILTRANTE il pallone
               sta 15-25u davanti a lui: nel calcio vero il difensore RINCORRE la palla profonda, non l'uomo.
               Il primo ingaggiato insegue il pallone quando e' oltre l'eroe e in zona profonda. */
            const _bp539=(_bSpot&&!["corner","throw","gk"].includes(_bSpot.at))?_bSpot:{x:pPos.x,y:pPos.y};/* ⚠️ la palla di SCENA (hlBallSpot), NON ballPosRef: il logico di cronaca resta congelato dov'era (misurato: x46 con scena a x90 — la rincorsa non partiva mai) */
            if(_r===0&&_bp539.x>pPos.x+8&&_bp539.x>65&&!(typeof window!=='undefined'&&window.__CPM_NO539)){
              tx=clamp(_bp539.x+2.5+Math.sin(_T+ai)*0.8,40,97);ty=clamp(_bp539.y+Math.cos(_T+ai)*0.8,3,97);
            }else{
            tx=clamp(pPos.x+_gd*0.85+Math.sin(_T+ai)*1.4,40,97);// goal-side: tra eroe e porta (x+)
            ty=clamp(pPos.y+(_dbl48&&_r<=1?(_r===0?-3.4:3.4):Math.sin(_ang)*(3+_r*3))+Math.cos(_T+ai*1.3)*1.4,3,97);}
          }else{
            // NON ingaggiato: TIENE il blocco di zona — linea difensiva tra palla e porta, corsia per slot,
            // scorrimento col lato palla + shading adattivo verso la fascia calda (mai convergere sull'eroe)
            const _bkX=Math.max(pPos.x+10,_bkDepth)+((ai%3)-1)*3;
            tx=clamp(_bkX+Math.sin(_T*0.6+ai)*1.4,40,96);
            ty=clamp(_laneY[ai-1]*0.72+pPos.y*0.28+_adSHL+Math.cos(_T*0.5+ai*1.1)*1.4,3,97);
          }
        }else{
          // Home GK: stays in goal, tracks ball laterally
          if(idx===0){const tyStep=clamp((pPos.y-pl.y)*0.06,-1.5,1.5);return{...pl,x:clamp(pl.x,2,8),y:clamp(pl.y+tyStep,30,70)};}
          if(idx>=1&&idx<=4&&!isDef){
            // [6.75.0 DEF-1] DIFENSORI di casa: NON si ammassano attorno all'eroe in attacco — tengono la linea
            // arretrata (copertura per la transizione), scorrendo col lato palla
            tx=clamp(pPos.x-26+((idx%2)*4)+Math.sin(_T*0.6+idx)*1.3,6,55);
            ty=clamp(_laneY[idx-1]*0.75+pPos.y*0.25+Math.cos(_T*0.5+idx)*1.3,3,97);
          }else if(isDef&&idx>=1&&idx<=4){
            // HL difensivo: la linea difensiva copre l'AMPIEZZA dietro/accanto all'eroe (blocco, non nube)
            tx=clamp(pPos.x-7+((idx%2)*3)+Math.sin(_T*0.6+idx)*1.2,4,88);
            ty=clamp(_laneY[idx-1]*0.62+pPos.y*0.38+Math.cos(_T*0.5+idx)*1.2,3,97);
          }else if(_taker>=0&&idx===_taker){
            /* [7.194.0 S1] IL BATTITORE: su corner/rimessa/rinvio il pallone non è più orfano alla bandierina —
               il compagno designato (lo stesso a ogni tick: scelto per prossimità al pallone, deterministico)
               ci va davvero e resta lì a metterlo in gioco. */
            tx=clamp(_bSpot.x+(_bSpot.at==="corner"?-1.2:_bSpot.at==="gk"?1.5:0),2,98);
            ty=clamp(_bSpot.y+(_bSpot.y<50?1.6:-1.6),3,97);
          }else{
            // CEN/ATT: supporto attorno all'eroe (dietro/lato), come prima
            const _angS=idx*0.9+1.2,_sprS=11+(idx%4)*4;
            tx=clamp(pPos.x-Math.abs(Math.cos(_angS))*_sprS+Math.sin(_T*0.8+idx)*1.6,3,85);
            ty=clamp(pPos.y+Math.sin(_angS)*_sprS+Math.cos(_T*0.7+idx)*1.6,3,97);
          }
        }
        // smoothing su velocità — inerzia, convergenza dolce verso il target stabile
        const v=velRef.current[idx]||{vx:0,vy:0};
        const nvx=clamp(v.vx*0.72+(tx-pl.x)*0.12,-5,5);
        const nvy=clamp(v.vy*0.72+(ty-pl.y)*0.10,-5,5);
        velRef.current[idx]={vx:nvx,vy:nvy};
        const _np={...pl,x:clamp(pl.x+nvx,2,98),y:clamp(pl.y+nvy,3,97)};
        if(isDef&&pl.team==="away"){const _d=Math.hypot(_np.x-pPos.x,_np.y-pPos.y);if(_d<_defBd){_defBd=_d;_defBx=_np.x;_defBy=_np.y;}}
        return _np;
      });});
      if(isDef)setBallPos({x:_defBx,y:_defBy});// 3DV-FIX3: azione difensiva → la palla è sull'avversario portatore, non sull'eroe
    },pressingMs);
    return()=>clearInterval(iv);
  },[phase,hlIdx,situations,pPos.x,pPos.y,paused]);// eslint-disable-line

  // Formation drift during playing phase — ball-reactive + patrol oscillation
  useEffect(()=>{
    if(phase!=="playing"||paused||kickoffHold)return;/* [7.9.3] kickoff trattenuto finché CH38 non è pronto */
    let tick=0;
    const iv=setInterval(()=>{
      tick++;
      const poss=possessionRef.current;
      const ball=ballPosRef.current; // ball.x 0-100 (0=home goal, 100=away goal)
      const T=tick*0.55;
      // depth modulated by opp tactic pressure: high-press = deeper line
      const pressBias=(oppTacticRef.current?.pressure||50)/100*8-4; // -4..+4
      const awayDepth=clamp(62+(poss-50)*0.4+(ball.x-50)*0.25+pressBias,48,92);
      /* [7.194.0 S1] SEGNO INVERTITO (bug storico): la linea della squadra dell'eroe ARRETRAVA quando attaccava e
         SALIVA quando difendeva — l'esatto contrario del calcio e l'opposto della convenzione già corretta di
         awayDepth (che sale col possesso avversario). Con la palla nella propria area i difensori risalivano a
         centrocampo lasciando la porta scoperta. */
      const homeDepth=clamp(38+(poss-50)*0.3+(ball.x-50)*0.18,8,55);
      // lateral anchor: players cluster around ball Y
      const ballY=ball.y;
      /* [7.202.0 direttiva PO «l'utente non deve pensare "questa è un'animazione" ma "sembra davvero una
         partita di calcio"» — LA SQUADRA HA UNA FORMA] la posizione laterale di OGNI giocatore era
         `ballY + offset_fisso`: un RETICOLO RIGIDO che traslava incollato al pallone, con lo stesso identico
         disegno qualunque cosa succedesse. Due conseguenze, misurate col nuovo `shape-analyzer` su partite
         vere: (a) con la palla vicino a una fascia il clamp [8,92] SCHIACCIAVA la linea contro il bordo —
         nel 56% dei frame due difensori della squadra dell'eroe stavano entro 3u, con distanza minima ZERO
         (letteralmente sovrapposti); (b) nessuna AMPIEZZA in fase offensiva: l'ala lontana seguiva la palla
         sulla fascia opposta invece di tenere il campo largo, che è il primo gesto tattico che si nota.
         Ora ogni slot ha una CORSIA DI COMPETENZA (ancora fissa sul campo) e la palla la fa SCORRERE solo
         in parte: la linea difensiva scivola ball-side ~0.55 e si stringe (compattezza 0.74), la squadra in
         possesso scivola poco (0.18-0.34) e si allarga (1.02) → distanze fra reparti che restano leggibili,
         nessun collasso al bordo, e la classica scena della squadra che si allunga quando riparte. */
      const _LN_B=[24,42,58,76],_LN_M=[30,50,70],_LN_F=[26,50,74];// corsie: difesa · centrocampo · attacco
      const _bSh=ballY-50;// spostamento della palla dal centro del campo
      const _lane=(anchor,comp,k)=>clamp(50+(anchor-50)*comp+_bSh*k,6,94);
      const _awDef=poss>=50;// la squadra ospite difende quando il possesso è dell'eroe
      const _cA=_awDef?0.74:1.02,_kAB=_awDef?0.55:0.34,_kAM=_awDef?0.48:0.34,_kAF=_awDef?0.30:0.18;
      const _hmDef=poss<50;
      const _cH=_hmDef?0.74:1.02,_kHB=_hmDef?0.55:0.34,_kHM=_hmDef?0.48:0.34,_kHF=_hmDef?0.30:0.18;
      /* [7.589.0 — DUE AUTORITA' SULLA STESSA POSIZIONE, rosso __CPM_NO589]
         COLLAUDO PO: «dopo un gol le squadre non tornano nelle meta' campo proprie».
         SEI IPOTESI MIE CADUTE, ognuna con la sua misura (non e' un ritardo · il ripiegamento gira · gli
         slot sono in coordinate di campo · non e' la catena di gioco · nessuno ricostruisce l'elenco · non
         basta farlo girare a ogni tick). Il censimento diceva una cosa che nessuna di quelle spiegazioni
         regge: il ripiegamento legge bersaglio 62 e trova il giocatore a 44 PASSATA DOPO PASSATA, con
         guadagno 0,92 — dopo una sola passata dovrebbe stare a 60,6.
         Allora ho smesso di dedurre e ho messo un TESTIMONE sul setter, che si annota l'impronta di chi
         scrive. Il colpevole si e' nominato da solo: sull'ospite i19, in una partita, 78 scritture da QUI
         (media -4,0u, 77 su 78 all'INDIETRO) contro 35 dello schieramento della ripresa (media +7,5u).
         Non e' un difetto di taratura: sono DUE AUTORITA' sulla stessa coordinata che tirano in direzioni
         opposte, e vince quella che scrive piu' spesso. Questo blocco insegue le corsie con `awayDepth-30`
         — durante una ripresa awayDepth vale ~62, quindi le punte ospiti hanno bersaglio x~32, cioe' la
         META' SBAGLIATA.
         E c'e' di peggio della frequenza: `velRef` e' una MEMORIA di velocita'. Lo schieramento sposta la
         posizione ma non la velocita', quindi appena finito lo snap questo blocco riprende con la sua
         spinta negativa gia' carica e se lo riporta indietro.
         RIMEDIO STRUTTURALE, non un rattoppo: durante la ripresa comanda UNO SOLO. Una ripresa e'
         un'interruzione — il pallone e' fermo al centro, non c'e' nessuna corsia da inseguire — quindi la
         macchina delle corsie si ferma e AZZERA la memoria di velocita', cosi' che alla ripartenza nessuno
         riparta con la spinta di prima. Fuori dalla ripresa non cambia niente. */
      /* [7.590.0] la finestra e' quella BREVE (primi 14 tick): spegnere le corsie per i 20-28 secondi in
         cui il contatore resta sopra zero significava togliere il gioco per mezzo minuto dopo ogni gol. */
      const _ripresa589=!(typeof window!=='undefined'&&window.__CPM_NO589)&&((kickRef.current|0)>0||(kickoffRef.current|0)>0)&&(!(typeof window!=='undefined'&&window.__CPM_NO590)?(ripT0Ref.current>0&&(Date.now()-ripT0Ref.current)<=4500):true);
      if(_ripresa589){try{const _V=velRef.current;for(const _k in _V){const _v=_V[_k];if(_v){_v.vx=0;_v.vy=0;}}}catch(_e){}}
      else setMatchPlayers(prev=>{
        /* [7.706.0 — LA MISCHIA E' CONTESA. Rosso __CPM_NO706]
           Collaudo PO: «le azioni pericolose sono confusionarie, irreali... non ci sono azioni ben
           manovrate». MISURATO (arrivi-705 v4): gli arrivi del piano sono gia' CUSTODITI dagli
           attaccanti (14/16 sotto 5u, mediana ~2u) ma la CONTESA non c'e' — mediana 2 difensori entro
           12u dal pallone, e il filmstrip mostra la mischia recitata tra soli attaccanti: da qui
           l'aria da allenamento. Mentre un piano e' vivo, i TRE difensori piu' vicini del lato che
           difende convergono goal-side sul pallone (anello a 4,5u, ventaglio di 3u): solo bersagli
           del deployment — pallone, righe e microsim intoccati. */
        let _mark706=null;
        if(!(typeof window!=='undefined'&&window.__CPM_NO706)&&pendingGoalRef.current&&pendingGoalRef.current.piano&&!fermoRef.current&&!outRef.current){
          const _pgD706=pendingGoalRef.current.dir|0;const _defT706=_pgD706>0?"away":"home";
          const _c706=[];prev.forEach((q,qi)=>{if(q&&q.team===_defT706&&!q.gk)_c706.push({qi,d:Math.hypot((q.x||50)-ball.x,(q.y||50)-ball.y)});});
          _c706.sort((a,b)=>a.d-b.d);
          _mark706={set:new Set(_c706.slice(0,3).map(c=>c.qi)),gx:_pgD706>0?97:3};
          if(typeof window!=='undefined'&&window.__CPM_REC){try{window.__CPM_N706=(window.__CPM_N706||0)+1;window.__CPM_D706=_c706.slice(0,3).map(c=>+c.d.toFixed(1));}catch(_e){}}/* [7.706 strumentazione] +D706: le distanze dei tre eletti dal pallone al momento dell'elezione — dice se non arrivano perche' partono da lontano o perche' non si muovono *//* [7.706 strumentazione] tick con elezione attiva: distingue «non gira» da «gira ma il righello non lo vede» */
        }
        /* [7.720.0 — L'OMBRA ADDOSSO E' UN AVVERSARIO VERO. Rosso __CPM_NO720]
           Fase 6B della missione (§7 «interazioni con conseguenze REALI»): finora la conseguenza
           `marcatura` delle schede viveva solo nello stato narrativo, letta dai soli `cond` — le
           carte dicevano «hai un'ombra addosso» e in campo NESSUNO marcava l'eroe (l'eroe e' un
           sistema parallelo ai 22: nessun bersaglio del deployment lo guardava). Ora, quando la
           marcatura narrativa e' stretta (>=2), l'avversario di movimento piu' vicino all'eroe
           viene eletto OMBRA: il suo bersaglio diventa il punto goal-side a 3u dall'eroe, finche'
           la marcatura non cala (le carte che la sciolgono — «lo porto a spasso», «cambio fascia»
           — ora liberano DAVVERO). Cancello: solo con l'eroe nella meta' offensiva (il clamp di
           corsia degli ospiti ferma comunque a x44), mai un eletto della contesa 706, mai a palla
           ferma/out. Solo bersagli del deployment: pallone, righe e microsim intoccati. */
        let _mk720=null;
        if(!(typeof window!=='undefined'&&window.__CPM_NO720)&&(((narrRef669.current||{}).marcatura|0)>=2)&&!fermoRef.current&&!outRef.current){
          const _hp720=pPosRef.current||{x:58,y:50};
          if(isMatchHome?_hp720.x>40:_hp720.x<60){
            const _oppT720=isMatchHome?"away":"home";
            let _bi720=-1,_bd720=1e9;
            prev.forEach((q,qi)=>{if(!q||q.team!==_oppT720||q.gk)return;if(_mark706&&_mark706.set.has(qi))return;const _d=Math.hypot((q.x||50)-_hp720.x,(q.y||50)-_hp720.y);if(_d<_bd720){_bd720=_d;_bi720=qi;}});
            if(_bi720>=0&&_bd720<30){const _gx720=isMatchHome?97:3;const _dx=_gx720-_hp720.x,_dy=50-_hp720.y,_dn=Math.hypot(_dx,_dy)||1;
              _mk720={qi:_bi720,tx:clamp(_hp720.x+_dx/_dn*3,4,96),ty:clamp(_hp720.y+_dy/_dn*3,4,96)};
              if(typeof window!=='undefined'&&window.__CPM_REC){try{window.__CPM_MK720={qi:_bi720,d:+_bd720.toFixed(1)};}catch(_e){}}}}
        }
        return prev.map((pl,idx)=>{
        if(pl.team==="ref")return pl;
        if(pl.team==="away"){
          const ai=idx-10;
          let tx,ty;
          if(ai===0){// [6.76.0 LMV-M3] GK ospite con RITORNO dedicato e bound stretti (simmetrico al GK di casa,
            //   che li aveva già): prima cadeva nel clamp generico x∈[44,98] → violazione possibile del bound
            //   del gate (away GK x≥75) su transizioni con velocità residua.
            const vg=velRef.current[idx]||{vx:0,vy:0};
            /* [7.705.0 — IL PORTIERE TIENE LO SPECCHIO. Rosso __CPM_NO705]
               Collaudo PO: «il portiere sembra che sta in piscina». MISURATO (piscina-705, traccia logica
               vs mesh su una parata con esito corner): il pallone parcheggiato all'angolo (2,94) dalla
               palla morta 7.702 e' comunque `ballY`, e questo inseguimento — guadagno 0,35 — portava il
               portiere OSPITE, a novanta unita' dall'azione, a farsi 15u di passeggiata laterale
               (y 49→65,6, combacia con clamp(50+(94-50)*0.35)=65,4). Un portiere vero si allinea al
               pallone solo quando il pallone e' nella sua zona: a palla morta, o con la palla oltre
               il centrocampo lontano dalla sua porta, sta al centro dello specchio. */
            const _spec705=!(typeof window!=='undefined'&&window.__CPM_NO705)&&(!!fermoRef.current||!!outRef.current||ball.x<62);
            const gvx=clamp(vg.vx*0.70+(97-pl.x)*0.14,-6,6),gvy=clamp(vg.vy*0.70+((_spec705?50:clamp(50+(ballY-50)*0.35,30,70))-pl.y)*0.11,-6,6);
            velRef.current[idx]={vx:gvx,vy:gvy};
            return{...pl,x:clamp(pl.x+gvx,88,98),y:clamp(pl.y+gvy,33,67)};
          }
          let _lnA;
          if(ai<=4){tx=awayDepth+4;ty=_lane(_LN_B[ai-1],_cA,_kAB);_lnA=0;}
          else if(ai<=7){tx=awayDepth-14;ty=_lane(_LN_M[ai-5],_cA,_kAM);_lnA=1;}
          else{tx=awayDepth-30;ty=_lane(_LN_F[ai-8],_cA,_kAF);_lnA=2;}
          tx+=Math.sin(T+ai*1.7)*5;// il RESPIRO in profondità resta per-giocatore (le linee sono lontane in x: non si toccano)
          /* [7.202.0] l'oscillazione LATERALE era per-giocatore e di ±6u: due compagni della stessa linea
             potevano sfasarsi di 12u e chiudere il varco fra le corsie → sovrapposizioni. Nel calcio una
             linea scorre COME UN BLOCCO: stessa fase per reparto e ampiezza ridotta ⇒ i varchi non si chiudono. */
          ty+=Math.cos(T*0.9+_lnA*2.1)*2.6;
          const _el706a=_mark706&&_mark706.set.has(idx);
          if(_el706a){const _dxm=_mark706.gx-ball.x,_dym=50-ball.y,_dn=Math.hypot(_dxm,_dym)||1;tx=clamp(ball.x+_dxm/_dn*4.5,4,96);ty=clamp(ball.y+_dym/_dn*4.5+((idx%3)-1)*3,4,96);}/* [7.706.0] eletto alla contesa: anello goal-side */
          const _sh720a=_mk720&&_mk720.qi===idx&&!_el706a;
          if(_sh720a){tx=_mk720.tx;ty=_mk720.ty;}/* [7.720.0] ombra dell'eroe: goal-side a 3u */
          const va=velRef.current[idx]||{vx:0,vy:0};
          const nvxa=clamp(va.vx*0.70+(tx-pl.x)*(_el706a?0.35:_sh720a?0.30:0.14),-6,6);
          const nvya=clamp(va.vy*0.70+(ty-pl.y)*(_el706a?0.35:_sh720a?0.30:0.11),-6,6);/* [7.706.0] MISURATO (v6): coi guadagni di corsia gli eletti restavano a 4-15u dal pallone — il passo dell'eletto e' quello del primo pressore (0,35), o l'anello non si forma prima che la riga cambi *//* [7.720.0] l'ombra cammina col passo del marcatore (0,30): meno del pressore, piu' della corsia */
          velRef.current[idx]={vx:nvxa,vy:nvya};
          return{...pl,_m706:(_mark706&&_mark706.set.has(idx))?1:0,_m720:_sh720a?1:0,x:clamp(pl.x+nvxa,44,98),y:clamp(pl.y+nvya,3,97)};/* [7.706.0] il marchio viaggia col giocatore: il renderer lo legge da allPlayers e non riveste il suo bersaglio */
        }else{
          const hi=idx;
          let tx,ty;
          if(hi===0){
            // GK: stays within goal posts (game_y 36-64), minimal lateral tracking
            /* [7.705.0] lo specchio vale anche per il GK di casa (guadagno 0,10: deriva minore, stessa regola) */
            const _spec705h=!(typeof window!=='undefined'&&window.__CPM_NO705)&&(!!fermoRef.current||!!outRef.current||ball.x>38);
            tx=3;ty=_spec705h?50:clamp(50+(ballY-50)*0.10,38,62);
          }else{
            let _lnH=2;
            if(hi<=4){tx=homeDepth-4;ty=_lane(_LN_B[hi-1],_cH,_kHB);_lnH=0;}
            else if(hi<=7){tx=homeDepth+12;ty=_lane(_LN_M[hi-5],_cH,_kHM);_lnH=1;}
            else{
              const runBonus=poss>60?clamp((poss-60)*0.5,0,12):0;
              tx=homeDepth+26+runBonus;
              /* con più del 60% di possesso gli esterni offensivi APRONO ancora di più (ampiezza dichiarata) */
              ty=_lane(_LN_F[hi-8],_cH*(poss>60?1.10:1),_kHF);
            }
            tx+=Math.sin(T*0.85+hi*1.5)*4;
            ty+=Math.cos(T*0.75+_lnH*2.1)*2.4;// [7.202.0] sway laterale per REPARTO (vedi nota sul lato ospite)
            if(_mark706&&_mark706.set.has(idx)){const _dxm=_mark706.gx-ball.x,_dym=50-ball.y,_dn=Math.hypot(_dxm,_dym)||1;tx=clamp(ball.x+_dxm/_dn*4.5,4,96);ty=clamp(ball.y+_dym/_dn*4.5+((idx%3)-1)*3,4,96);}/* [7.706.0] eletto alla contesa: anello goal-side */
          }
          const _el706h=_mark706&&_mark706.set.has(idx)&&hi!==0;
          const _sh720h=_mk720&&_mk720.qi===idx&&hi!==0&&!_el706h;
          if(_sh720h){tx=_mk720.tx;ty=_mk720.ty;}/* [7.720.0] ombra dell'eroe (eroe in trasferta): goal-side a 3u */
          const vh=velRef.current[idx]||{vx:0,vy:0};
          const nvxh=clamp(vh.vx*0.70+(tx-pl.x)*(_el706h?0.35:_sh720h?0.30:0.12),-6,6);
          const nvyh=clamp(vh.vy*0.70+(ty-pl.y)*(_el706h?0.35:_sh720h?0.30:0.10),-6,6);/* [7.706.0] passo del pressore per l'eletto (vedi lato ospite) */
          velRef.current[idx]={vx:nvxh,vy:nvyh};
          if(hi===0)return{...pl,x:clamp(pl.x+nvxh,2,12),y:clamp(pl.y+nvyh,33,67)};
          return{...pl,_m706:(_mark706&&_mark706.set.has(idx))?1:0,_m720:_sh720h?1:0,x:clamp(pl.x+nvxh,2,92),y:clamp(pl.y+nvyh,3,97)};/* [7.706.0] idem lato casa */
        }
      });});
      /* [7.711.0 — L'ASSEMBLAGGIO DEL MATCH STATE, ogni tick, solo da autorita' logiche.
         matchPlayersRef puo' essere indietro di UN tick (il commit di React e' asincrono): dichiarato,
         irrilevante per decisioni a 300ms. I campi mancanti rispetto al §1 della direttiva sono
         dichiarati nel campo `manca` finche' non esistono davvero (modulo/metodologia/atteggiamento). */
      try{
        const _pl711=(matchPlayersRef&&matchPlayersRef.current)?matchPlayersRef.current:[];
        const _bx711=ball.x,_by711=ball.y,_turn711=possTurnRef.current|0;
        const _defT711=_turn711>0?"away":"home",_attT711=_turn711>0?"home":"away";
        let _nH711=0,_nA711=0,_pd711=1e9,_press711=0;
        const _linee711={home:{def:[],mid:[],att:[]},away:{def:[],mid:[],att:[]}};
        for(let _i711=0;_i711<_pl711.length;_i711++){const _q=_pl711[_i711];if(!_q||_q.team==="ref")continue;
          const _dq=Math.hypot((_q.x||50)-_bx711,(_q.y||50)-_by711);
          if(_dq<12){if(_q.team==="home")_nH711++;else _nA711++;}
          if(!_q.gk&&_q.team===_defT711){if(_dq<_pd711)_pd711=_dq;if(_dq<8)_press711++;}
          const _li711=_q.team==="home"?_i711:_i711-10;
          if(!_q.gk&&_linee711[_q.team]){const _rep=_li711<=4?"def":_li711<=7?"mid":"att";_linee711[_q.team][_rep].push(_q.x||50);}}
        const _med711=(a)=>a.length?+(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1):null;
        let _marc711=0,_lib711=0;
        for(let _i711=0;_i711<_pl711.length;_i711++){const _q=_pl711[_i711];if(!_q||_q.gk||_q.team!==_attT711)continue;
          let _md711=1e9;for(let _j711=0;_j711<_pl711.length;_j711++){const _o=_pl711[_j711];if(!_o||_o.gk||_o.team!==_defT711)continue;
            const _dd=Math.hypot((_q.x||50)-(_o.x||50),(_q.y||50)-(_o.y||50));if(_dd<_md711)_md711=_dd;}
          if(_md711<6)_marc711++;else if(_md711>10)_lib711++;}
        matchStateRef.current={v:1,min:clockRef.current|0,score:{h:scoreRef.current.home|0,a:scoreRef.current.away|0},
          turn:_turn711,poss:poss|0,momentum:momentumRef.current|0,
          ball:{x:+_bx711.toFixed(1),y:+_by711.toFixed(1)},carrier:(carrierRef.current&&carrierRef.current.i!=null)?carrierRef.current.i:null,
          fermo:!!fermoRef.current,out:!!outRef.current,costruzione:!!pendingGoalRef.current,
          pressione:{addosso:_press711,vicino:+( _pd711===1e9?99:_pd711).toFixed(1)},
          marcature:{presi:_marc711,liberi:_lib711},
          linee:{home:{def:_med711(_linee711.home.def),mid:_med711(_linee711.home.mid),att:_med711(_linee711.home.att)},
                 away:{def:_med711(_linee711.away.def),mid:_med711(_linee711.away.mid),att:_med711(_linee711.away.att)}},
          superiorita:_nH711-_nA711,
          eroe:{x:+(pPosRef.current.x||50).toFixed(1),y:+(pPosRef.current.y||50).toFixed(1)},
          mem:msMemRef.current.slice(),
          manca:["modulo","metodologia","atteggiamento","spazi-per-corsia"]};
        /* [7.712.0 — IL DANGER SYSTEM IN MODALITA' OMBRA (§10 della missione). Primo consumatore del
           Match State. Calcola un threat 0-100 da SOLE grandezze di stato — avanzata, ultimo quarto,
           velocita' della spinta, attaccanti liberi, superiorita', pressione assente — e lo LOGGA
           soltanto: nessuna decisione, nessun comportamento. Il banco ombra confrontera' i suoi picchi
           con le finestre che oggi i piani aprono a dado (adv>=48 + dado<72%): se l'ombra nomina le
           occasioni meglio del dado, i ruoli si scambiano (strangler). Formula v1 trasparente e
           tarabile, pesi dichiarati; la storia del threat resta sul MS (threat + comp). */
        try{const _ms712=matchStateRef.current;
          const _adv712=_ms712.turn>0?_ms712.ball.x:100-_ms712.ball.x;
          const _pAdv712=(matchStateRef._prevAdv712!=null&&matchStateRef._prevTurn712===_ms712.turn)?matchStateRef._prevAdv712:_adv712;
          matchStateRef._prevAdv712=_adv712;matchStateRef._prevTurn712=_ms712.turn;
          const _cl712=(v)=>Math.max(0,Math.min(1,v));
          const _zona=_cl712((_adv712-50)/50),_porta=_cl712((_adv712-75)/25);
          const _spinta=_cl712((_adv712-_pAdv712)/3);
          const _lib=_cl712((_ms712.marcature.liberi||0)/3);
          const _sup=_cl712((_ms712.turn>0?_ms712.superiorita:-_ms712.superiorita)/2);
          const _noPress=_ms712.fermo||_ms712.out?0:_cl712(1-(_ms712.pressione.addosso||0)/3);
          const _thr712=Math.round(100*_cl712(0.30*_zona+0.25*_porta+0.15*_spinta+0.15*_lib+0.10*_sup+0.05*_noPress));
          _ms712.threat=_thr712;_ms712.threatComp={zona:+_zona.toFixed(2),porta:+_porta.toFixed(2),spinta:+_spinta.toFixed(2),lib:+_lib.toFixed(2),sup:+_sup.toFixed(2),noPress:+_noPress.toFixed(2)};
          if(typeof window!=='undefined'&&window.__CPM_REC){const _tr=(window.__CPM_THREAT=window.__CPM_THREAT||[]);if(_tr.length<1200)_tr.push({min:_ms712.min,t:_thr712,turn:_ms712.turn});}
          /* [7.715.0 — FASE 3 IN OMBRA: LA DECISIONE NASCE DALLO STATO. Secondo consumatore del Match
             State, solo log. A ogni tick di gioco aperto si calcola la decisione del lato in possesso:
             ogni compagno e' un candidato ricevente con un punteggio di LINEA (avanzamento pesato 1,2,
             distanza ideale 16u, linea intercettabile -25 se un avversario sta entro 3,5u dal segmento,
             ricevente marcato -6 se un difensore entro 5u); tiro se ultimo quarto e threat alto; conduci
             se nessuna linea avanza. Il banco misurera' l'ACCORDO fra queste decisioni e le righe del
             copione, e la qualita' dei riceventi scelti: lo scambio (le righe raccontano la decisione
             invece di inventarla) avverra' solo quando l'ombra batte il copione in misura. */
          if(!_ms712.fermo&&!_ms712.out&&!_ms712.costruzione){try{
            const _dec715=decidi715(_ms712.turn);/* [7.718.0] la mente e' UNA: la stessa funzione per l'ombra e per le macchine consegnate */
            _ms712.decisione=_dec715;
            if(typeof window!=='undefined'&&window.__CPM_REC){const _dc=(window.__CPM_DEC=window.__CPM_DEC||[]);if(_dc.length<1200)_dc.push({ts:Date.now(),min:_ms712.min,turn:_ms712.turn,act:_dec715.act,rcv:_dec715.rcv,thr:_thr712});}
          }catch(_e715){}}
        }catch(_e712){}
      }catch(_e711){}
      /* [7.719.0 — IL WATCHER DELLA PROMESSA: LA CRONACA RICHIAMA SOLO I FATTI. Se una scheda ha
         promesso «la prossima entra» (er_sprona#0/co_inc#0), qui si guarda il PUNTEGGIO VERO: se
         la squadra dell'eroe ha segnato entro 25 minuti dalla promessa, la telecronaca chiude il
         cerchio (2,6s dopo la riga del gol, per non accavallarsi); se la finestra scade, silenzio
         e la promessa muore senza bugie. Il punteggio resta del microsim: qui si LEGGE soltanto.
         Rosso __CPM_NO719 · testimone __CPM_PROM719{armate,mantenute,scadute}. */
      /* [7.721.0 — IL TABELLONE ALIMENTA LA STORIA. Rosso __CPM_NO721] Trovato leggendo: `golSub`
         non era MAI scritto, quindi le due schede «gol subito» (er_carica, mi_rea) erano morte dalla
         nascita, e nessuna scheda sapeva che la squadra avesse SEGNATO. Qui il punteggio vero (sola
         lettura, autorita' del microsim) alimenta lo stato narrativo: gol fatti/subiti e il minuto
         dell'ultimo. Il primo tick fissa la base (una partita ripresa da resumeState non conta i gol
         gia' avvenuti come «da poco»). */
      if(!(typeof window!=='undefined'&&window.__CPM_NO721)){try{
        const _N1=narrRef669.current;
        if(_N1){const _s1=scoreRef.current||{home:0,away:0};
          const _mio1=isMatchHome?(_s1.home|0):(_s1.away|0),_suo1=isMatchHome?(_s1.away|0):(_s1.home|0),_mn1=clockRef.current|0;
          if(_N1._scMio721==null){_N1._scMio721=_mio1;_N1._scSuo721=_suo1;}
          if(_mio1>_N1._scMio721){_N1.golFatti=(_N1.golFatti|0)+(_mio1-_N1._scMio721);_N1.golFattoMn=_mn1;_N1._scMio721=_mio1;}
          if(_suo1>_N1._scSuo721){_N1.golSub=(_N1.golSub|0)+(_suo1-_N1._scSuo721);_N1.golSubMn=_mn1;_N1._scSuo721=_suo1;}}
      }catch(_e721){}}
      if(!(typeof window!=='undefined'&&window.__CPM_NO719)){try{
        const _N7=narrRef669.current,_p7=_N7&&_N7.prom719;
        if(_p7){const _sc7=scoreRef.current||{home:0,away:0};
          const _mio7=isMatchHome?(_sc7.home|0):(_sc7.away|0);
          const _mn7=clockRef.current|0;
          if(_mio7>_p7.mio){_N7.prom719=null;
            const _tx7=_p7.id==="co_inc"?"🤝 Il capitano l'aveva promesso a bordo campo: «la prossima entra». Ed e' entrata davvero.":"✊ Gliel'aveva detto rialzandolo da terra: «la prossima entra». La squadra l'ha messa dentro davvero.";
            setTimeout(()=>{try{addComRef681.current&&addComRef681.current(_tx7,"#22c55e",clockRef.current);}catch(_e){}},2600);
            if(typeof window!=='undefined'){try{(window.__CPM_PROM719=window.__CPM_PROM719||{armate:0,mantenute:0,scadute:0}).mantenute++;}catch(_e){}}}
          else if(_mn7-(_p7.min|0)>25){_N7.prom719=null;
            if(typeof window!=='undefined'){try{(window.__CPM_PROM719=window.__CPM_PROM719||{armate:0,mantenute:0,scadute:0}).scadute++;}catch(_e){}}}}
      }catch(_e719){}}
    },300);
    return()=>clearInterval(iv);
  },[phase,paused,kickoffHold]);

  // Flash cleanup
  useEffect(()=>{
    if(!screenFlash)return;
    const t=setTimeout(()=>setScreenFlash(null),screenFlash.dur+100);
    return()=>clearTimeout(t);
  },[screenFlash]);

  // Stacco nero di transizione (cover→reveal) sull'esito positivo
  useEffect(()=>{
    if(!cutFx)return;
    try{_CUT471.at=performance.now();_CUT471.dur=cutFx.dur||360;}catch(_e471){}/* [7.471.0] il nero e' vivo: il render-loop lo legge per non chiederne un secondo sopra a questo */
    const t=setTimeout(()=>setCutFx(null),cutFx.dur+80);
    return()=>clearTimeout(t);
  },[cutFx]);

  // Float label cleanup
  useEffect(()=>{
    if(!floatGoal)return;
    const t=setTimeout(()=>setFloatGoal(null),1400);
    return()=>clearTimeout(t);
  },[floatGoal]);

  // Clock — more commentary, possession updates
  useEffect(()=>{
    if(phase!=="playing"||paused||kickoffHold)return;/* [7.9.3] kickoff trattenuto finché CH38 non è pronto */
    if(scFreeze681&&!(typeof window!=='undefined'&&window.__CPM_NO682F)
       &&!(typeof window!=='undefined'&&window.__CPM_AUTOPLAY_ON&&!window.__CPM_SCFREEZE_TEST))return;/* [7.682.0] c'e' una scelta aperta: il tempo di gioco si ferma finche' non e' presa (o finche' non scadono i venti secondi) */
    const iv=setInterval(()=>{
      // Sprint 34 — tactic moments + sub events (checked via clockRef, outside setClock)
      const ck=clockRef.current;
      /* [7.494.0 F0 — CHIUDE IL BORDO NON MISURATO DEL 7.489] Il 7.489 ha reso la cronaca funzione pura di
         (seed di partita, minuto) dentro il callback di `setClock`, dove vive `_rndM`. Ma i rami che girano
         QUI SOPRA — sostituzione (65-70') e highlight dinamici (60' e 72') — sono fuori da quella closure e
         usavano ancora `Math.random()`/`rng()`. Erano invisibili al guardiano: `match-sequence` non fa
         autoplay, quindi al primo highlight il clock si congela e la finestra di 60 s copriva i minuti
         1-46 (MISURATO su pagina vera: 12 righe, fase finale `hl_choose` al 50'). I tre generatori stavano
         tutti OLTRE quel confine. Stessa sorgente della catena cronaca; il tag separa i flussi cosi' che
         due rami sullo stesso minuto non estraggano lo stesso numero. */
      const _rndTick=(mn,tag)=>((typeof window!=='undefined'&&window.__CPM_NO489)?Math.random():seededRng((((bgSimSeedRef.current>>>0)+(mn>>>0)*2654435761+(tag>>>0))>>>0)||1)());
      if(ck>=28&&!tacticFiredRef.current[0]){// [5.95.0 QW audit MP-2] soglia >= : lo skip non brucia più l'ordine
        tacticFiredRef.current[0]=true;
        var key0=selectCoachOrder(ck,scoreRef.current,momentumRef.current,player.fatigue||0);
        var ord0=COACH_ORDERS[key0]||COACH_ORDERS.pressing;
        tacticBonusRef.current=ord0.bonus;
        if(ord0.poss!==0)setPossession(function(p){return clamp(p+ord0.poss,20,80);});
        setMomentum(function(m){return clamp(m+(ord0.mom||0),0,100);});
        if(ord0.drift&&DRIFT_PRESETS[ord0.drift])driftTargetsRef.current=DRIFT_PRESETS[ord0.drift];
        addCoach("📢 "+ord0.e+" «"+ord0.ctx+"»",ck);
      }
      if(ck>=63&&!tacticFiredRef.current[1]){
        tacticFiredRef.current[1]=true;
        var key1=selectCoachOrder(ck,scoreRef.current,momentumRef.current,player.fatigue||0);
        var ord1=COACH_ORDERS[key1]||COACH_ORDERS.verticale;
        tacticBonusRef.current=ord1.bonus;
        if(ord1.poss!==0)setPossession(function(p){return clamp(p+ord1.poss,20,80);});
        setMomentum(function(m){return clamp(m+(ord1.mom||0),0,100);});
        if(ord1.drift&&DRIFT_PRESETS[ord1.drift])driftTargetsRef.current=DRIFT_PRESETS[ord1.drift];
        addCoach("📢 "+ord1.e+" «"+ord1.ctx+"»",ck);
      }
      /* [7.494.0 F0] SEEDATO: questo ramo sta FUORI dal callback di setClock, quindi non vede `_rndM`
         (dichiarato la' dentro) — e con `Math.random()` era il buco piu' costoso dei cinque, perche' muove
         `momentum` ed `energy`, che alimentano la lambda del micro-simulatore: cioe' poteva cambiare il
         RISULTATO fra due partite con lo stesso seed. Stessa sorgente della catena cronaca (seed di partita
         + minuto), quindi resta funzione pura del minuto e identica a tutte e tre le velocita'. */
      if(ck>=65&&ck<=70&&!subFiredRef.current&&_rndTick(ck,0x5b01)<0.38){
        subFiredRef.current=true;
        // 5.49.18: messaggio COLLEGATO all'andamento reale (punteggio + momentum), non più generico
        const _scS=scoreRef.current,_gapS=(_scS.home||0)-(_scS.away||0),_momS=momentumRef.current||50;
        /* [7.536.0] due testi, uno per voce: la telecronaca RACCONTA il cambio, il mister CHIEDE — in prima
           persona, come le altre battute di panchina («Il mister chiede…» detto dal mister era la spia che
           questa voce veniva da un altro mondo). */
        const sub=_gapS>0?{txt:"🛡️ Il mister chiede di gestire il vantaggio: equilibrio e attenzione.",com:"🔁 Cambio in campo: si passa alla gestione del vantaggio.",coach:"«Equilibrio e attenzione — questo vantaggio ce lo teniamo!»",energy:5,mom:4}
          :_gapS<0?{txt:"🎯 Cambio offensivo: serve il gol, spingi sull'acceleratore!",com:"🔁 Cambio offensivo: entra forza fresca davanti.",coach:"«Serve il gol — spingete sull'acceleratore!»",energy:10,mom:12}
          :(_momS>=55?{txt:"🔥 Il momento è nostro: il mister chiede l'ultimo sforzo per il gol!",com:"🔁 Cambio mentre la squadra spinge: forze fresche in avanti.",coach:"«Il momento è nostro: ancora uno sforzo e la sblocchiamo!»",energy:8,mom:10}
                     :{txt:"💪 Cambio per dare energia fresca alla manovra.",com:"🔁 Cambio: gambe fresche in mezzo al campo.",coach:"«Dentro energia nuova — muovete palla più veloce!»",energy:8,mom:8});
        /* [7.536.0 collaudo PO «c'e' un'indicazione del mister che compare a meta' schermo ogni tanto, che
           non rientra nel flusso specifico» — rosso __CPM_NO549] LA SETTIMA VOCE TORNA NEL CORO DELLE TRE.
           Il censimento 7.532 aveva ricondotto SEI siti di voce del mister al riquadro panchina; questo
           settimo e' sfuggito perche' non passava da `addCom`: aveva una UI tutta sua — un banner a
           `top:12%`, largo quasi quanto lo schermo, in mezzo alla scena per 3,5s. Ora vale la regola delle
           tre voci, la stessa dell'intervallo 7.532: l'EVENTO (il cambio) lo racconta la telecronaca, la
           RICHIESTA del mister vive in panchina, e il banner centrale sparisce. Col rosso ricompare. */
        if(typeof window!=='undefined'&&window.__CPM_NO549)setSubEvent(sub.txt);
        else{addCom(sub.com,"#93c5fd",ck);addCoach("📢 "+sub.coach,ck);}
        if(sub.energy>0)setEnergy(e=>clamp(e+sub.energy,0,100));
        setMomentum(m=>clamp(m+sub.mom,0,100));
        const tid3=setTimeout(()=>setSubEvent(null),3500);
        chantTimersRef.current.push(tid3);
      }
      // Sprint 113 — 75' coach order (3rd tactical moment)
      if(ck>=75&&!tacticFiredRef.current[2]){
        tacticFiredRef.current[2]=true;
        var _sc75=scoreRef.current;var _diff75=_sc75.home-_sc75.away;
        var key2=_diff75<=0?"urgenza_75":_diff75>=2?"blocca_ora":"gestisci_1";
        var ord2=COACH_ORDERS[key2]||COACH_ORDERS.verticale;
        tacticBonusRef.current=ord2.bonus;
        if(ord2.poss!==0)setPossession(function(p){return clamp(p+ord2.poss,20,80);});
        setMomentum(function(m){return clamp(m+(ord2.mom||0),0,100);});
        if(ord2.drift&&DRIFT_PRESETS[ord2.drift])driftTargetsRef.current=DRIFT_PRESETS[ord2.drift];
        addCoach("📢 "+ord2.e+" «"+ord2.ctx+"»",ck);
        if(_diff75<=0)chantTimersRef.current.push(setTimeout(()=>chantFor("urgenza",2600),400));
      }
      // Sprint 113 — 85' coach order (final assault if close game)
      if(ck>=85&&!tacticFiredRef.current[3]){
        tacticFiredRef.current[3]=true;
        var _sc85=scoreRef.current;var _diff85=_sc85.home-_sc85.away;
        if(Math.abs(_diff85)<=1){
          var ord3=_diff85<=0?COACH_ORDERS.assalto_85:COACH_ORDERS.consolida;
          tacticBonusRef.current=ord3.bonus;
          if(ord3.poss!==0)setPossession(function(p){return clamp(p+ord3.poss,20,80);});
          setMomentum(function(m){return clamp(m+(ord3.mom||0),0,100);});
          if(ord3.drift&&DRIFT_PRESETS[ord3.drift])driftTargetsRef.current=DRIFT_PRESETS[ord3.drift];
          addCoach("📢 "+ord3.e+" «"+ord3.ctx+"»",ck);
        }
      }
      // Dynamic HL — process reactive queue (e.g. queued after opp_goal)
      if(reactiveHLQueueRef.current.length>0&&numHLRef.current<8){
        var nxtMn=reactiveHLQueueRef.current[0];
        if(ck>=nxtMn){
          reactiveHLQueueRef.current.shift();
          // [5.75.0 BLK-1] _sctx76 era fuori scope (vive solo nel callback di setClock) → ReferenceError = clock congelato al primo HL reattivo. Contesto calcolato inline.
          var _scRQ=scoreRef.current;var _ctxRQ=_scRQ.home>_scRQ.away?"winning":_scRQ.home<_scRQ.away?"losing":"drawing";
          var _exRQ=situationsRef.current.map(function(s2){return s2&&s2.text;}).filter(Boolean);// [6.76.0 LMV-L2] anti-ripetizione anche sugli HL dinamici
          var extras=selectContextualSituations([...SITUATIONS],1,player,((bgSimSeedRef.current^(ck*8191))>>>0),{scoreCtx:_ctxRQ,clock:ck,momentum:momentumRef.current,possession:possessionRef.current,opponentId:opponent?.id||opponent?.n||null,weatherFx:(weather&&weather.pitchFx)||null,oppRed:oppRedRef.current,ballX:((ballTargetRef.current||ballPosRef.current||{}).x),/* [7.204.0] continuità territoriale: la prossima azione nasce vicino a dove il gioco si è fermato */exclude:_exRQ});// [5.79.0] seed deterministico + contesto vivo
          if(extras.length>0){
            // [6.76.0 LMV-L1] inserimento ORDINATO all'indice corrente (come le catene), non append in coda:
            //   prima la «risposta immediata» del 30' finiva DOPO l'ultimo HL scriptato (giocata all'80' col
            //   tempo 32 → clock all'indietro sullo skip). Ora è davvero il PROSSIMO highlight.
            var addT=ck+2;
            setSituations(function(prev){var c=[...prev];c.splice(hlIdx,0,extras[0]);return c;});
            setHlTimes(function(prev){var v=[...prev];v.splice(hlIdx,0,addT);hlTimesRef.current=v;return v;});
            setNumHL(function(prev){var v=prev+1;numHLRef.current=v;return v;});
            addCom("⚡ Risposta immediata — il momento è tuo!",TH.primary,ck);
          }
        }
      }
      // Dynamic HL — early reactive: losing by exactly 1 at 60', push extra chance
      if(ck===60&&!earlyDespRef.current&&numHLRef.current<8){
        var sc60=scoreRef.current;
        if(sc60.away-sc60.home===1){
          earlyDespRef.current=true;
          var eextra=selectContextualSituations([...SITUATIONS],1,player,((bgSimSeedRef.current^60607)>>>0),{scoreCtx:"losing",clock:ck,momentum:momentumRef.current,possession:possessionRef.current,opponentId:opponent?.id||opponent?.n||null,weatherFx:(weather&&weather.pitchFx)||null,oppRed:oppRedRef.current,ballX:((ballTargetRef.current||ballPosRef.current||{}).x),/* [7.204.0] continuità territoriale: la prossima azione nasce vicino a dove il gioco si è fermato */exclude:situationsRef.current.map(function(s2){return s2&&s2.text;}).filter(Boolean)});
          if(eextra.length>0){
            var etime=63+Math.floor(_rndTick(ck,0x60a1)*5);/* [7.494.0 F0] seedato: il MINUTO di un highlight e' un evento (stessa regola del 7.489 su hlTimes) *//* [6.76.0 LMV-L1] inserimento ordinato (vedi HL reattivi) */
            setSituations(function(prev){var c=[...prev];c.splice(hlIdx,0,eextra[0]);return c;});
            setHlTimes(function(prev){var v=[...prev];v.splice(hlIdx,0,etime);hlTimesRef.current=v;return v;});
            setNumHL(function(prev){var v=prev+1;numHLRef.current=v;return v;});
            addCom("⚠️ Sotto di uno — è il momento di svegliarsi!","#f59e0b",ck);
          }
        }
      }
      // Dynamic HL — desperate situation: losing by ≥2 at 72', add one last chance
      if(ck===72&&!desperateFiredRef.current&&numHLRef.current<8){
        var sc=scoreRef.current;
        if(sc.away-sc.home>=2){
          desperateFiredRef.current=true;
          var dextra=selectContextualSituations([...SITUATIONS],1,player,((bgSimSeedRef.current^72997)>>>0),{scoreCtx:"losing",clock:ck,momentum:momentumRef.current,possession:possessionRef.current,opponentId:opponent?.id||opponent?.n||null,weatherFx:(weather&&weather.pitchFx)||null,oppRed:oppRedRef.current,ballX:((ballTargetRef.current||ballPosRef.current||{}).x),/* [7.204.0] continuità territoriale: la prossima azione nasce vicino a dove il gioco si è fermato */exclude:situationsRef.current.map(function(s2){return s2&&s2.text;}).filter(Boolean)});
          if(dextra.length>0){
            var dtime=76+Math.floor(_rndTick(ck,0x72a1)*5);/* [7.494.0 F0] seedato, come sopra *//* [6.76.0 LMV-L1] inserimento ordinato (vedi HL reattivi) */
            setSituations(function(prev){var c=[...prev];c.splice(hlIdx,0,dextra[0]);return c;});
            setHlTimes(function(prev){var v=[...prev];v.splice(hlIdx,0,dtime);hlTimesRef.current=v;return v;});
            setNumHL(function(prev){var v=prev+1;numHLRef.current=v;return v;});
            addCom("🆘 Situazione disperata — serve un miracolo!","#ef4444",ck);
          }
        }
      }
      setClock(c=>{
        const nx=c+1;
        /* [7.489.0 direttiva PO «le tre velocita' devono essere la stessa partita»] IL GENERATORE DELLA
           CRONACA E' UNA FUNZIONE DEL MINUTO, NON DEL CASO. L'audit ha misurato che la stessa partita
           giocata due volte produceva lo 0% di sequenza identica gia' dal primo evento: il tiro
           ambientale, la scelta della riga, il nome estratto e il drift di momentum/possesso usavano tutti
           generatori non seedati — e momentum e possesso alimentano anche la lambda dei gol, quindi
           nemmeno il risultato era riproducibile. Con un generatore seedato su (seed di partita, minuto)
           la sequenza diventa una FUNZIONE PURA del minuto: identica a 1x, 1,5x e 2x per costruzione,
           non per verifica a posteriori. La velocita' cambia solo QUANDO gli eventi vengono presentati.
           ⚠️ Il seed di partita e' lo stesso del micro-simulatore dei gol (`bgSimSeedRef`), che era gia'
           deterministico per minuto: ora tutta la catena condivide la stessa sorgente. */
        const _rndM=(typeof window!=='undefined'&&window.__CPM_NO489)?(()=>Math.random()):seededRng(((bgSimSeedRef.current>>>0)+nx*2654435761)>>>0);/* prova del rosso: torna ai generatori non seedati */

        if(nx>=90){const _no645=(typeof window!=='undefined'&&window.__CPM_NO645);if(!_no645&&nx<96&&(pendingGoalRef.current||golCoda645.current.length)){if(nx>=92&&pendingGoalRef.current){pendingGoalRef.current.ticks=999;if(typeof window!=='undefined'&&window.__CPM_REC){try{const _w=(window.__CPM_REC645=window.__CPM_REC645||{coda:0,codaMax:0,dir:0,rec:0,forza92:0});_w.forza92++;}catch(_e){}}}if(typeof window!=='undefined'&&window.__CPM_REC){try{const _w=(window.__CPM_REC645=window.__CPM_REC645||{coda:0,codaMax:0,dir:0,rec:0,forza92:0});_w.rec++;}catch(_e){}}/* [7.645.0 — IL FISCHIO NON AMMAZZA L'AZIONE VIVA] BUCO LATENTE censito col 7.644: qui si tornava a 90 SENZA svuotare pendingGoalRef — una costruzione viva al fischio perdeva il suo gol dal tabellone in silenzio. Ora la partita va in RECUPERO (fino al 95'): la costruzione si chiude (a 92' d'ufficio, via tetto) e i gol in coda entrano diretti, POI il fischio. Frequenza del buco: non misurata prima (caso raro); testimone __CPM_REC645.rec la conta d'ora in poi. */}else{cpmEv("fine",{min:90,causa:"clock"});/* [7.500.0 F4] */if(!_SIT_TEST)_goEndOrCeremony();return 90;}}/* [7.2.0] titolo vinto → premiazione 3D, altrimenti "ended" */
        /* [7.268.0 batteria di regressione — sub-off] LA SOSTITUZIONE HA LA PRECEDENZA SULL'HIGHLIGHT.
           Il dispatch dell'highlight qui sotto fa un RETURN anticipato: su ogni minuto che coincide con un
           highlight il resto del tick — cronaca, mister, e la sostituzione in uscita — non veniva mai
           raggiunto. Con gli highlight fitti nel finale la finestra d'uscita veniva scavalcata minuto per
           minuto fino al fischio finale (misurato: uscita prevista al 63', partita finita al 68' con l'eroe
           ancora in campo) → la funzionalità era di fatto morta. Ora la condizione si valuta PRIMA e, quando
           l'uscita è dovuta, l'highlight di quel minuto cede il passo: al tick successivo l'eroe è fuori e
           l'highlight viene saltato dal binario panchina, come deve. */
        const _lead38=scoreRef.current.home-scoreRef.current.away;
        const _mgmt38=_lead38>=2&&nx>=78&&(hashStr((player.name||"x")+"|mg38|"+(player.season||1)+"_"+(player.week||0))%5)<3;/* seedato ~60%: mai routine fissa */
        const _subDue38=!onBenchRef.current&&!subbedOffRef.current&&!benchStart&&(context==="career"||context==="cup")&&((subOffAtRef.current!=null&&nx>=subOffAtRef.current)||_mgmt38);
        if(!_subDue38&&hlIdx<hlTimesRef.current.length&&nx>=hlTimesRef.current[hlIdx]){
          if(onBenchRef.current||subbedOffRef.current){setHlIdx(hi=>hi+1);}else{
            const _sc=scoreRef.current;
            const _realCtx=_sc.home>_sc.away?"winning":_sc.home<_sc.away?"losing":"drawing";
            // [5.79.0 SIT-1] SELEZIONE LAZY: la situation si sceglie ADESSO, col contesto VIVO (punteggio,
            //   minuto, momentum, possesso) — non più tutta al calcio d'inizio con ctx neutro. Le sit
            //   incatenate (_chainDepth) si giocano come sono. Il vecchio skip su ctx-mismatch sparisce:
            //   il filtro a monte rende il mismatch impossibile → nessun highlight più bruciato (SIT-5).
            const _cur79=situationsRef.current[hlIdx];
            if(!(_cur79&&_cur79._chainDepth)){
              const _lzSeed=(((bgSimSeedRef.current^(hlIdx*2654435761))>>>0)+nx*97)>>>0;
              const _used79=situationsRef.current.slice(0,hlIdx).map(s2=>s2&&s2.text).filter(Boolean);
              const _fresh79=selectContextualSituations([...SITUATIONS],1,player,_lzSeed,{scoreCtx:_realCtx,clock:nx,momentum:momentumRef.current,possession:possessionRef.current,opponentId:opponent?.id||opponent?.n||null,weatherFx:(weather&&weather.pitchFx)||null,oppRed:oppRedRef.current,ballX:((ballTargetRef.current||ballPosRef.current||{}).x),/* [7.204.0] continuità territoriale: la prossima azione nasce vicino a dove il gioco si è fermato */exclude:_used79});
              if(_fresh79.length>0)setSituations(prev=>{const c=[...prev];c[hlIdx]=_fresh79[0];return c;});
            }
            setBgAction(null);setPhase("hl_intro");// COERENZA: spegni la cronaca BG (testo+arco) entrando nell'highlight
          }
          return nx;
        }
        // Sprint 94 — Weather commentary (15% chance when bad weather)
        const _wfx94=weather?.pitchFx;
        if(_wfx94&&_rndM()<0.15/* [7.489.0] anche la riga meteo e' cronaca: entra nella sequenza deterministica */){
          const _wCom94={
            rain:["⛈️ Terreno scivoloso — il pallone rimbalza imprevedibile!","🌧️ La pioggia rende difficile il controllo del pallone.","💧 Campo bagnato — i falli aumentano su questo manto.","🌧️ Il portiere deve fare attenzione ai palloni scivolosi!","⛈️ L'erba bagnata rallenta le combinazioni."],
            storm:["⛈️ TEMPORALE IN CAMPO! Visibilità ridotta — condizioni estreme.","🌩️ I calci piazzati diventano imprevedibili col vento!","⛈️ Partita durissima — le condizioni mettono a dura prova chiunque.","🌩️ Il pallone scivola ovunque — errori tecnici inevitabili.","⛈️ Atmosfera surreale — pioggia battente, fulmini in lontananza."],
            fog:["🌫️ La nebbia avvolge il campo — fatica a seguire il pallone!","🌁 Visibilità ridotta: il portiere non vede bene l'azione!","🌫️ In queste condizioni ogni lancio è un'avventura.","🌁 Il fumo si alza dal terreno — partita fiabesca ma complicata."],
            snow:["❄️ Campo innevato — il pallone quasi scompare!","⛄ La neve rende ogni dribbling un rischio altissimo.","❄️ Linee del campo a malapena visibili sotto la neve.","⛄ Le scarpe scivolano — difficile tenere l'equilibrio!"],
            wind:["💨 Vento forte — il pallone devia a ogni calcio!","🌬️ La traversa fischia con questo vento — partita pazzesca.","💨 I cross diventano imprevedibili con queste raffiche.","🌬️ Il portiere fa fatica a calcolare traiettorie col vento."],
          };
          const _pool94=_wCom94[_wfx94]||_wCom94.rain;
          addCom(_pool94[Math.floor(_rndM()*_pool94.length)],"#64748b",nx);
        }
        // MISTER #5: grida BREVI da bordo campo, sincronizzate alla FASE reale (tattica/possesso/momentum/minuto/punteggio).
        //   Spaziate ≥6', anti-ripetizione, mai durante un HL → contestuali e mai in contraddizione con l'azione.
        if(!["hl_intro","hl_move","hl_choose","hl_result"].includes(phaseRef.current)&&nx-lastShoutRef.current.ck>=6&&_rndM()<0.34){
          const _scS=scoreRef.current,_diffS=_scS.home-_scS.away;
          const _dkS=Object.keys(DRIFT_PRESETS).find(k=>DRIFT_PRESETS[k]===driftTargetsRef.current)||null;
          /* ⚠️ LA FASE SI RICALCOLA QUI, NON SI PRENDE IN PRESTITO. Prima stesura: passavo `_fase501`, che pero'
             e' dichiarato QUARANTA righe piu' sotto — `const` in zona morta temporale, cioe' ReferenceError alla
             prima grida del mister. Lo smoke non l'ha visto perche' questo ramo scatta una volta ogni sei minuti
             di gioco con probabilita' 34%: un difetto che si presenta raramente e' un difetto che arriva al PO.
             Stessa formula della cronaca (soglie 58/78 sull'avanzamento del lato in possesso), calcolata da qui. */
          const _bC542=ballPosRef.current||{x:50,y:50};const _tnC542=(possTurnRef.current>0?1:-1);
          const _advC542=(_tnC542<0)?(100-_bC542.x):_bC542.x;
          const _faseC542=_advC542>=78?"pericolo":_advC542>=58?"sviluppo":"costruzione";
          const _shout=pickCoachShout(nx,_diffS,momentumRef.current,possessionRef.current,_dkS,player.coach?.style||null,lastShoutRef.current.txt,_tnC542,_faseC542);/* [7.542.0] turno e fase: gli stessi due fatti che la cronaca consuma */
          if(_shout){lastShoutRef.current={ck:nx,txt:_shout};addCoach("📣 «"+_shout+"»",nx);}/* [7.532.0 NO540] la voce del mister va nel riquadro panchina, non in telecronaca */
        }
        // 3DV-FIX3: cronaca meno fitta — base 18%/tick — sospesa durante gli HL.
        // Fase 6 (NEXT-GEN ritmo): la densità scala con l'estremità del momentum → 18% in equilibrio,
        //   fino a ~30% nei picchi (dominio/assedio) → il flusso non è più piatto, accelera nei momenti caldi.
        /* [7.485.0] LA DENSITA' SALE PERCHE' IL PAVIMENTO TIENE. Con 0,18-0,30 per tick e nessuna pausa
           minima, le righe si RAGGRUPPAVANO (due su tick consecutivi: la seconda smentiva un movimento
           percorso al 25%) e nel resto del tempo la cronaca taceva. Messo il pavimento di 3 tick, il solo
           effetto di quella probabilita' bassa era il silenzio: misurata dopo il pavimento, la cronaca era
           crollata da 15 righe a 4 su 40 secondi — l'opposto di una telecronaca. Ora la probabilita' e'
           alta e a governare il ritmo e' il pavimento: si parla spesso, ma mai sopra il movimento appena
           annunciato. Attesa: 3 tick di pausa + ~1/0,55 di attesa = ~3,8 tick fra due righe, cioe' la
           densita' di prima senza i grumi. */
        /* [7.499.0 F3b] LA DECISIONE. Funzione pura dello stato reale — dove sta il pallone e su che corsia.
           La casa attacca verso x=100, quindi la mappa e' la lettura calcistica del campo: nella propria
           area si spazza, sulla propria trequarti si ripiega, in mezzo si palleggia, sulla trequarti
           avversaria si attacca, e con la palla larga l'azione e' di fascia. Nessun generatore: e' una
           lettura, non un sorteggio, quindi non tocca l'invariante di determinismo del 7.489.
           [7.501.0 F5] Calcolata QUI, prima della densita' della cronaca, perche' ora serve a entrambe:
           QUALE riga esce (F3b) e QUANTO FITTO si racconta (sotto). */
        const _bx499=(ballPosRef.current&&ballPosRef.current.x!=null)?ballPosRef.current.x:50;
        const _by499=(ballPosRef.current&&ballPosRef.current.y!=null)?ballPosRef.current.y:50;
        const _dec499=_bx499<25?"defend_goal":_bx499<42?"retreat":_bx499<60?"midfield":_bx499<78?(Math.abs(_by499-50)>22?"wide_right":"attack"):"attack_goal";
        /* [7.501.0 F5 — LA PARTITA HA UN RITMO, NON UNA CADENZA — direttiva PO «fase normale → costruzione
           → sviluppo → azione pericolosa → attesa»] Fino a qui `playing` non aveva stati: la cronaca usciva
           con la STESSA probabilita' per tutti i novanta minuti (0,55 + momentum) e con lo stesso pavimento
           di 3 tick, quindi una rimessa laterale a centrocampo e un pallone in area avevano lo stesso
           respiro. In un feed di testo il respiro E' il ritmo: senza differenza non c'e' attesa, e senza
           attesa non c'e' «cosa succedera' adesso».
           La fase si LEGGE dalla decisione, non si sorteggia: pallone in una delle due aree = PERICOLO,
           sulla trequarti avversaria o largo = SVILUPPO, in mezzo o in ripiegamento = COSTRUZIONE. */
        /* [7.532.0 NO543 v2] LA FASE HA IL PADRONE DEL TURNO (principio 7.523) — e si calcola
           dall'AVANZAMENTO RELATIVO al possessore, non dalla decisione: la v1 (retreat∩turno-loro →
           sviluppo) non scattava MAI (censimento: 0 casi — coi turni la palla vive attorno al centro nei
           due versi e la decisione dice `midfield` 10/17). adv = x per noi, 100−x per loro; le soglie
           58/78 ricalcano la trama. La decisione resta casa-centrica: le famiglie di riga raccontano cosa
           VIVIAMO a quella x, ed e' gia' side-corretto. */
        const _advT501=(!(typeof window!=='undefined'&&window.__CPM_NO553)&&possTurnRef.current<0)?(100-_bx499):_bx499;
        const _fase501=(!(typeof window!=='undefined'&&window.__CPM_NO553))?(_advT501>=78?"pericolo":_advT501>=58?"sviluppo":"costruzione"):((_dec499==="attack_goal"||_dec499==="defend_goal")?"pericolo":(_dec499==="attack"||_dec499==="wide_right")?"sviluppo":"costruzione");
        const _rit501=(typeof window!=='undefined'&&window.__CPM_NO501)?1:((pendingGoalRef.current||counterRef.current||kickoffRef.current>0)?1.30:(_fase501==="pericolo"?1.30:_fase501==="sviluppo"?1.08:0.56));/* [7.532.0 NO542] anche il ribaltamento e' telecronaca CALDA *//* [7.531.0] taratura in DUE mosse misurate: (a) costruzione 0,60→0,56 (cartello del guardiano: «ritmo piu' marcato, non soglia piu' bassa») — non bastava, 1,25→1,27×, perche' il collo era l'ALTRO capo: l'identita' di modulo attraversa lo sviluppo col passo 1,12/1,28 e la fase restava povera (9 coppie, intervallo 4,67 vs 3,90 storico); (b) sviluppo 1,00→1,08 — arricchisce la fase affamata invece di affamare l'altra (la strada 0,52 e' gia' stata revocata per questo) e racconta l'avanzata piu' fitta, in linea con la direttiva FM del PO *//* [7.528.0 v5] Due lezioni misurate in un giro solo: (a) il taglio 0,52 della costruzione e' REVOCATO — ha strafatto (costruzione 45 coppie, sviluppo affamato a 5: guardiano cieco); (b) il buco vero era che l'AZIONE PENDENTE attraversa lo sviluppo in 3-4 tick sparando una riga isolata (v2: sviluppo 12 coppie ma intervallo 4,50 vs 3,90 storico, rapporto 1,27): durante l'avanzata la telecronaca ora e' FITTA come nel pericolo (1,30) — piu' righe consecutive nella fase calda, coppie vere, ed e' la telecronaca dell'azione che il PO chiede (stile FM). */
        const _momX=Math.abs(momentumRef.current-50)/50,_bgProb=((typeof window!=='undefined'&&window.__CPM_NO485)?(0.18+_momX*0.12):(0.55+_momX*0.25))*_rit501;
        const _inHL77=["hl_intro","hl_move","hl_choose","hl_result"].includes(phaseRef.current);
        /* [7.647.0 — IL DIRETTORE DI PARTITA OSSERVA. FASE 1a della roadmap narrativa (docs/ROADMAP-PARTITA-NARRATIVA.md)]
           Lo stato NARRATIVO della partita, per minuto: una scena e' cio' che uno spettatore direbbe
           stia succedendo (quiete, costruzione, sviluppo, pericolo, pressione, transizione, palla
           inattiva, attacco obbligato dal punteggio, ripresa, scena dell'eroe). In F1a il direttore
           DERIVA la scena dalle macchine esistenti e la registra (__CPM_SCENE, su cambio scena):
           nessun effetto sul gioco — e' il fondamento su cui F2 (event grammar) agganciera' le
           produzioni. Le fasi TRANQUILLE sono cittadine di prima classe: quiete = giro palla nella
           propria meta' senza spinta. Rosso non necessario: effetto zero per costruzione. */
        {const _d647=(function(){
          if((kickRef.current|0)>0||(kickoffRef.current|0)>0)return{f:'ripresa',l:possTurnRef.current};
          if(pendingGoalRef.current)return{f:'attacco-obbligato',l:pendingGoalRef.current.dir};
          if(counterRef.current)return{f:'transizione',l:counterRef.current.dir>0?1:-1};
          if(spRef.current||outRef.current||fermoRef.current)return{f:'palla-inattiva',l:possTurnRef.current};
          if(_inHL77)return{f:'scena-eroe',l:1};
          if(_fase501==='pericolo')return{f:'pericolo',l:possTurnRef.current};
          if(typeof window!=='undefined'&&window.__CPM_NO648){/* rosso F1b: torna il derivatore completo (osservatore 7.647) */
            if(_fase501==='sviluppo')return{f:'sviluppo',l:possTurnRef.current};
            if(Math.abs((momentumRef.current||50)-50)>=20)return{f:'pressione',l:(momentumRef.current||50)>50?1:-1};
            if(_advT501<42)return{f:'quiete',l:possTurnRef.current};
            return{f:'costruzione',l:possTurnRef.current};
          }
          /* [7.648.0 - IL DIRETTORE DECIDE LE SCENE LIBERE (FASE 1b). Rosso __CPM_NO648]
             Quando nessuna macchina comanda, la scena non si DERIVA piu' dalla x della palla: la
             DECIDE il direttore, con durata propria (1-4') ed estrazione deterministica (hashStr
             sul minuto: replay-safe, flusso _rndM intoccato, invariante 7.511). Pesi dal
             contesto: momentum sbilanciato spinge la pressione, il finale spinge lo sviluppo,
             dopo una scena calda la quiete respira (direttiva PO: "devono esistere anche fasi
             tranquille"). La scena decisa comanda la FASE DELLA TRAMA (sito waypoint): la palla
             SEGUE la scena, non il contrario, e famiglie/ritmo si allineano dalla geografia
             senza doppio comando. */
          const _cur648=direttoreRef.current;
          if(_cur648.lib&&(_cur648.fino|0)>nx)return{f:_cur648.f,l:possTurnRef.current,lib:1,fino:_cur648.fino};
          const _h648=(Math.abs(hashStr("dir648|"+nx))%1000)/1000;
          const _mo648=momentumRef.current||50;
          let _w648={quiete:0.30,costruzione:0.30,sviluppo:0.25,pressione:0.15};
          if(Math.abs(_mo648-50)>=15){_w648.pressione*=2;_w648.quiete*=0.5;}
          if(nx>=78)_w648.sviluppo*=1.4;
          if(/attacco|transizione|pericolo|scena-eroe/.test(String(_cur648.f||'')))_w648.quiete*=1.6;
          const _tot648=_w648.quiete+_w648.costruzione+_w648.sviluppo+_w648.pressione;
          let _acc648=0,_sc648='costruzione';
          for(const _k of ['quiete','costruzione','sviluppo','pressione']){_acc648+=_w648[_k]/_tot648;if(_h648<_acc648){_sc648=_k;break;}}
          const _du648=({quiete:[2,4],costruzione:[2,3],sviluppo:[1,3],pressione:[1,3]})[_sc648];
          const _dv648=_du648[0]+Math.abs(hashStr("dur648|"+nx))%(_du648[1]-_du648[0]+1);
          return{f:_sc648,l:possTurnRef.current,lib:1,fino:nx+_dv648};
        })();
        const _dp647=direttoreRef.current;
        if(_dp647.f!==_d647.f||_dp647.l!==_d647.l){
          direttoreRef.current={f:_d647.f,l:_d647.l,dal:nx,lib:_d647.lib?1:0,fino:_d647.fino|0,ann:0};/* [7.653.0] la scena decisa non e' ancora stata DICHIARATA in cronaca */
          if(typeof window!=='undefined'&&window.__CPM_REC){try{const _S=(window.__CPM_SCENE=window.__CPM_SCENE||[]);if(_S.length<300)_S.push({m:nx,f:_d647.f,l:_d647.l,d:_d647.lib?1:0});}catch(_e647){}}
        }else if(_d647.lib&&!_dp647.lib){direttoreRef.current={..._dp647,lib:1,fino:_d647.fino|0};}}
        // [5.77.0 MOT-4] INTERVALLO REALE: prima riassunto/coro/reset scattavano SOLO se un evento BG usciva
        //   esattamente al tick 45 (~25% delle partite). Ora il 45' è un momento garantito, una volta sola.
        if(nx>=45&&!halfFiredRef.current){
          halfFiredRef.current=true;
          try{AudioMgr.event({type:'HalfTime'});}catch(_a){}/* [7.62.0 AUDIO] fischio d'intervallo */
          const _htD77=scoreRef.current.home-scoreRef.current.away;
          /* [7.637.0 — L'INTERVALLO E' UNO STACCO, NON UNA RIGA. Rosso __CPM_NO637] Collaudo PO:
             «tra il primo e secondo tempo non c'e' uno stacco di camera». Il duplice fischio aveva
             fischio audio, riga e discorso del mister, ma la CAMERA continuava come se nulla fosse —
             in TV l'intervallo e' una cesura. Stesso stacco della catena (7.620), tenuto piu' a lungo. */
          if(!(typeof window!=='undefined'&&window.__CPM_NO637)){setCutFx({key:Date.now(),dur:700});
            if(typeof window!=='undefined'&&window.__CPM_REC){try{window.__CPM_HT637=(window.__CPM_HT637||0)+1;}catch(_e){}}}
          addCom("⏸️ Duplice fischio: squadre negli spogliatoi.","#93c5fd",45);
          addCoach(_htD77>0?"⏸️ «Siamo in vantaggio — testa dritta nel secondo!»":_htD77<0?"⏸️ «Reagiamo nel secondo tempo — ci crediamo!»":"⏸️ «Tutto ancora aperto — il gol cambia tutto.»",45);/* [7.532.0 NO540] l'evento resta in telecronaca, il DISCORSO e' del mister */
          if(!(typeof window!=='undefined'&&window.__CPM_NO536)){kickRef.current=3;ripT0Ref.current=Date.now();/* [7.590.0] anche il duplice fischio e' una ripresa */kickoffSideRef.current=(isMatchHome?"away":"home");if(!(typeof window!=='undefined'&&window.__CPM_NO543))setTurn616(isMatchHome?-1:1,"secondo-tempo");}/* [7.532.0 collaudo PO «a fine primo tempo, il secondo non riparte da centrocampo»] IL SECONDO TEMPO HA IL SUO CALCIO D'INIZIO: stessa macchina della ripartenza (conto → palla al centro → 2 battute recitate); convenzione: il secondo lo batte l'altra squadra */
          if(!_inHL77)chantFor("half",2000);
          setMomentum(m=>clamp(Math.round(m+(50-m)*0.5+_htD77*5),0,100));
          streakRef.current=0;
        }
        // [5.77.0 MOT-1] MICRO-SIM DI SFONDO: i GOL di compagni/avversari li decide il simulatore (bgMicroTick:
        //   prestigio/OVR/momentum/possesso, seedato per partita+minuto) — la voce di cronaca della famiglia giusta
        //   viene FORZATA (testo ← esito, mai il contrario). Il roll ambientale sotto NON può più muovere il punteggio.
        /* [7.38.0 Sezione 8] SOSTITUZIONE IN USCITA dell'eroe (fatica pre-gara alta → minuto pre-calcolato;
           o GESTIONE del risultato: +2 dopo il 78'). Riusa il binario panchina (HL saltati, cronaca senza {P}). */
        if(_subDue38){
          {
            subbedOffRef.current=true;subOffMinRef.current=nx;setSubbedOff(true);setOnBench(true);
            // [7.127.0] avvia la coreografia 3D d'USCITA con variante seedata: applausi (_mgmt38) → applauso/saluto/thumbs-up · stanco → mani-fianchi/deluso/thumbs-up
            {try{const _exS=Math.abs(hashStr((player.name||"x")+"_ext_"+nx+"_"+(player.season||1)+"_"+(opponent?.id||opponent?.n||"")));const _exSet=_mgmt38?[0,1,2]:[4,3,2];setSubExitVar(_exSet[_exS%_exSet.length]);}catch(_e){setSubExitVar(0);}setSubExitKey(k=>k+1);}
            const _why38=_mgmt38?"il mister ti risparmia per la prossima — esci tra gli applausi":"sei senza benzina, il mister ti richiama";
            subOffWhyRef.current=_why38;
            pushMatchEvent(nx,"sub",(em)=>`🔁 ${em}' Sostituzione: ${player.name} esce — ${_why38}.`);
            addCom(`🔁 Sostituito al ${nx}': ${_why38}.`,"#94a3b8",nx);
          }
        }
        let _simEv77=null;
        if(!_inHL77){
          const _sg77=bgMicroTick({min:nx,homePrestige:(/^(national|nationsCup|euroMondiale)/.test(context||"")?((NAT_CLUB_DATA[player.nation||"Italia"]||{}).p||80):player.club?.p),oppPrestige:oppPrestige,heroOvr:player.ovr,momentum:momentumRef.current,possession:possessionRef.current,seed:bgSimSeedRef.current,oppRed:oppRedRef.current,lead:(scoreRef.current.home-scoreRef.current.away)});/* [6.54.0] passa il margine → gestione del vantaggio (meno blowout) · [6.87.0 collaudo PO] in NAZIONALE il prestigio di casa è quello della NAZIONE, non del club dell'eroe (CF Madrid 90 gonfiava i gol dell'Italia 82) */
          if(_sg77)_simEv77=BG_MATCH.find(e=>e.ef===(_sg77.side==="home"?"team_goal":"opp_goal"))||null;
        }
        /* [7.528.0 — IL GOL SI COSTRUISCE: collaudo PO «i gol spesso arrivano da centrocampo senza azioni
           di attacco, non ci sono schemi»] Il gol del microsim non spara piu' la riga da dove capita (il
           7.525, rendendolo visibile, l'aveva reso un LANCIO da centrocampo in rete): diventa un'AZIONE
           PENDENTE — una riga di lancio fissa (niente sorteggi: l'ordine dei draw non cambia), poi la
           palla avanza 4u/tick verso l'ultimo terzo lungo il corridoio, e il tiro parte solo quando e' in
           zona rifinitura (x>=72 / x<=28) o dopo 8 tick di sicurezza. Un highlight in corso mette in
           pausa l'avanzata. Rosso __CPM_NO532 = gol immediato (comportamento 7.525-7.527). */
        /* [7.575.0 — DUE GOL A UN TICK DI DISTANZA, SENZA CALCIO D'INIZIO IN MEZZO, rosso __CPM_NO575]
           MISURATO col tracciato tick per tick di `gol-573`: al 49' segniamo noi, la riga dichiara la porta
           e il pallone parte davvero (50 -> 81,2 in un tick). Al tick DOPO la cronaca scrive il gol
           AVVERSARIO — con il pallone a 81, cioe' dentro l'area di chi avrebbe appena segnato. Il volo del
           nostro gol viene abortito a meta' strada e il pallone riparte nel verso opposto: da fuori si legge
           come «esito goal ma la palla non e' mai arrivata in porta», che e' la nota storica del PO.
           NON ERA UN DIFETTO DEL VOLO: era che il gol successivo non aspettava il calcio d'inizio del
           precedente. Nel calcio quell'invariante non si discute — fra due reti c'e' SEMPRE una ripresa dal
           centro. Qui il gol gia' deciso dal micro-simulatore viene PARCHEGGIATO e riproposto al primo tick
           in cui non c'e' piu' una ripartenza in sospeso: non si perde (il tabellino resta quello del
           microsim) e, rientrando dalla porta principale, si prende anche la sua azione costruita (7.528).
           Il tetto di sicurezza del gol pendente resta l'ultima parola, ma neanche lui puo' scavalcare la
           ripartenza: altrimenti l'invariante avrebbe un'eccezione, e un'eccezione la annulla. */
        /* [7.587.0 — LA FESTA PARTIVA VENTISEI METRI PRIMA DEL GOL, rosso __CPM_NO587]
           COLLAUDO PO (appunti 7.584, due volte): «il gol non si vede». Cinque ipotesi mie, tutte SMENTITE
           dalla misura: il pallone non arriva (arriva, 8 su 8) · la camera guarda altrove (scarto mediano
           1,8u) · la traiettoria e' a L (rettilineita' 0,96) · l'azione non ha passaggi (ne ha 3 e 1) ·
           nessuno tocca il pallone (il piu' vicino sta a 1,5u di mediana). Ogni misura MECCANICA era verde.
           LA SESTA HA UN NUMERO: il boato parte con il pallone a x27,8 — VENTISEI UNITA' dalla linea di
           porta. Coriandoli, scossa e «GOL!» si armano sulla RIGA di cronaca, mentre il pallone deve ancora
           percorrere quei ventisei metri (due tick, misurati col 7.573). Quando entra, la festa e' finita:
           il giocatore vede l'annuncio e poi un pallone che arriva in ritardo, e non vede MAI il gol.
           E' esattamente il difetto che il 7.573 ha chiuso per la RIPARTENZA — «e' la scena ad avere la
           precedenza» — lasciato aperto sull'esultanza. Ora la festa aspetta che il pallone sia ENTRATO,
           col solito tetto di dieci tick perche' nulla resti appeso. */
        if(festa587.current&&!(typeof window!=='undefined'&&window.__CPM_NO587)){
          const _f=festa587.current;const _b587=ballPosRef.current||{x:50};
          const _dentro=(_f.gx>50)?((_b587.x||50)>=95):((_b587.x||50)<=5);
          _f.ticks=(_f.ticks|0)+1;
          if(_dentro||_f.ticks>=10){festa587.current=null;setWaveEvent({t:Date.now(),home:_f.home,stadiumHome:_f.stadiumHome});
            if(typeof window!=='undefined'&&(_CPM_TEST||window.__CPM_REC)){try{(window.__CPM_FESTA2=window.__CPM_FESTA2||[]).push({bx:+(_b587.x||50).toFixed(1),att:_f.ticks,tetto:_dentro?0:1});}catch(_e587b){}}}
        }
        /* [7.644.0 — IL COSTRUTTORE DELLA CATENA E' UNA FUNZIONE, NON UN SITO. Rosso __CPM_NO644]
           FOTOGRAFATO (golback644b, 3 realizzazioni, seed 7300): 4 gol su 10 chiusi senza UNA riga
           del lato che segna. Cause: il costruttore viveva SOLO dentro l'emissione-riga (se la riga
           non usciva, la catena non si apriva), `righe` contava righe di chiunque, e il tetto
           scavalcava muto. Qui il costruttore estratto VERBATIM (solo hashStr, mai _rndM:
           l'invariante 7.511 sull'ordine dei sorteggi non si tocca), chiamato dal sito-riga come
           prima E dall'armamento del pendingGoal. */
        /* [7.649.0 - LA SCENA-GOL E' UNA CATENA NARRATIVA (FASE 2a roadmap). Rosso __CPM_NO649]
           MISURATO (registro scene 7.647): attacco-obbligato 35 minuti su 90 - la marcia geometrica
           (4u/tick verso l'area, tetto 7-14) faceva della costruzione una processione. La scena-gol
           ora e' un PIANO di 2-3 eventi calcistici composti all'armamento (protagonisti VERI del
           lato, zone dichiarate, tre famiglie: manovra centrale / fasce e cross / ripartenza corta):
           ogni tick della scena la riga RENDE un evento del piano e il pallone va DOVE LA RIGA DICE
           (nessuna apparizione: ogni salto ha la sua causa nel testo). Consumato il piano, la rete
           si scrive. Tetto di sicurezza = piano+4 tick: NESSUN GOL RESTA IN SOSPESO, il punteggio
           del microsim e' intoccato. Composizione solo hashStr (invariante 7.511). */
        /* ⚠️ [7.694.0 — IL TEMPO CHE MANCAVA: LA CONCLUSIONE. Collaudo PO: «tiro pericoloso, gol,
           parata del portiere, punizione»] Col 7.693 il pallone arriva finalmente dove il racconto lo
           manda, ma il racconto si fermava un tempo prima: l'ultimo passo NOMINA il limite dell'area e
           li' si chiudeva, con la rete che arrivava senza che nessuno avesse calciato. Misurato: le
           costruzioni che portano il pallone IN AREA erano 2 su 9, e non si erano mosse ne' col 7.692
           ne' col 7.693 — il tetto non era il motore, era il PIANO, che non nominava mai il tiro.
           Ogni famiglia ha ora il suo quarto tempo, e il pallone ci va davvero: 92-94, dentro l'area.
           Il tiro nel tabellino si sposta SULLA CONCLUSIONE: resta uno per gol, ma ora sta sulla riga
           che lo racconta invece che su quella che prepara. */
        /* ⚠️ [7.699.0 — «VIENE SIMULATO MOLTO IL CENTROCAMPO»: era nel PIANO, non nella regia. Terza
           direttiva del PO sulla stessa cosa, e le prime due volte ho curato il capo sbagliato.]
           Ho provato a togliere il centrocampo regolando la FINESTRA: prima ritardandone l'apertura, poi
           chiudendola quando l'azione muore. Misurate tutt'e due contro il rosso: quota di centrocampo da
           21,0% a 23,0% e a 23,4% — le finestre si accorciano e non si puliscono, perche' tolgono tanto
           gioco pericoloso quanto morto. Revocate entrambe.
           Poi ho scomposto la misura per TIPO di finestra, con un metro che conta TUTTI i campioni (fascia
           centrale gx 35-65, senza bisogno di sapere chi attacca — il precedente escludeva dal numeratore
           proprio la coda dopo il gol e i cartellini, che sono centrocampo puro: quel 21-contro-23
           confrontava due numeri che non misuravano la stessa cosa; ripetibile, 21,1% e 21,0% su due
           passate). Il risultato nomina il colpevole: le finestre di OCCASIONE stanno a 0-15% di
           centrocampo, quelle di GOL a 24-65%. La differenza non e' la regia, e' il piano: quello
           dell'occasione (7.695) parte col pallone gia' a 78-84, quello del gol partiva a 40-52, cioe' a
           meta' campo per progetto. Il primo tempo del racconto del gol ERA il centrocampo che il PO vede.
           Ora i primi tempi si alzano nella meta' avversaria (62/66/64 invece di 40/54/52, e il secondo
           della prima famiglia da 58 a 72): la costruzione si ACCORCIA invece di essere guardata per
           intero, e il palleggio nella propria meta' resta in telecronaca, dove sta bene. Il numero dei
           tempi non cambia, quindi la banda `gol-con-manovra` continua a trovare le sue righe. */
        const _pianoGol649=(_latoN)=>{
          const _mpA=(matchPlayersRef.current||[]).map((q,i)=>({q,i})).filter(o=>o.q&&o.q.team===_latoN&&!o.q.gk);
          if(_mpA.length<4)return null;
          const _dirP=_latoN==='home'?1:-1;
          const _hp=(k)=>Math.abs(hashStr("p649|"+nx+"|"+k));
          const _pk=(k)=>_mpA[_hp("u"+k)%_mpA.length];
          const _X=(x)=>_dirP>0?x:100-x;
          const _cgN=(n)=>{const t=String(n||"").trim();return t?t.charAt(0)+t.slice(1).toLowerCase():"un compagno";};
          const _fam=_hp("fam")%3;
          const _a=_pk(1);let _b=_pk(2);if(_b.i===_a.i)_b=_mpA[(_hp("u2")+1)%_mpA.length];
          let _c=_pk(3);if(_c.i===_a.i||_c.i===_b.i)_c=_mpA[(_hp("u3")+2)%_mpA.length];
          const _na=_cgN(_a.q.name),_nb=_cgN(_b.q.name),_nc=_cgN(_c.q.name);
          const _fy=(_hp("fy")%2)?22:78;
          const _J=(k,a)=>((_hp("j"+k)%100)/100-0.5)*a;
          if(_fam===0)return[
            {t:"⚙️ "+_na+" alza il ritmo nella meta' avversaria: la squadra sale in blocco.",x:_X(62+_J(1,8)),y:50+_J(2,20),chi:_a.i},
            {t:"📈 "+_na+" verticalizza per "+_nb+" fra le linee: la manovra si accende.",x:_X(72+_J(3,8)),y:50+_J(4,24),chi:_b.i},
            {t:"🎯 Filtrante di "+_nb+": "+_nc+" attacca il limite dell'area!",x:_X(77+_J(5,6)),y:50+_J(6,18),chi:_c.i},
            {t:"💥 Conclusione secca di "+_nc+" dal limite: il pallone parte teso verso la porta!",x:_X(93+_J(7,3)),y:50+_J(8,10),chi:_c.i,ms:1},
          ];
          if(_fam===1)return[
            {t:"↔️ "+_na+" apre sulla corsia: "+_nb+" ha campo davanti a se'.",x:_X(66+_J(1,8)),y:_fy+_J(2,8),chi:_b.i},
            {t:"💨 "+_nb+" affonda sulla fascia e guadagna il fondo.",x:_X(81+_J(3,5)),y:_fy+_J(4,6),chi:_b.i},
            {t:"🎯 Cross teso di "+_nb+": "+_nc+" stacca sul secondo palo!",x:_X(86+_J(5,4)),y:50+_J(6,14),chi:_c.i},
            {t:"💥 Incornata di "+_nc+" a botta sicura!",x:_X(94+_J(7,2)),y:50+_J(8,8),chi:_c.i,ms:1},
          ];
          return[
            {t:"⚡ "+_na+" ruba il tempo alla trequarti: si riparte in verticale!",x:_X(64+_J(1,8)),y:50+_J(2,22),chi:_a.i},
            {t:"🏃 Transizione rapida: "+_nb+" conduce e scarica su "+_nc+" al limite dell'area.",x:_X(79+_J(3,6)),y:50+_J(4,20),chi:_c.i},/* [7.693.0] 74→79: il testo dice «al limite dell'area» e il limite sta a 78-84 — a 74 il racconto mandava il pallone tre metri prima di cio' che nominava, e con la custodia del piano quella differenza ora si VEDE */
            {t:"💥 "+_nc+" calcia di prima, senza controllare!",x:_X(92+_J(7,3)),y:50+_J(8,10),chi:_c.i,ms:1},
          ];
        };
        /* ⚠️ [7.695.0 — LA PARATA. Collaudo PO: «tiro pericoloso, gol, parata del portiere, punizione»]
           Fino al 7.694 il PIANO esisteva solo per i gol: ogni costruzione finiva in rete, e le occasioni
           FALLITE — che in una partita vera sono la maggioranza — non avevano nessuna scena. Il portiere,
           in 3D, non si tuffava mai fuori dalle scene dell'eroe: i cinque siti che armano `gk_dive` sono
           tutti dentro il ramo highlight. Qui nasce l'azione che NON diventa gol: stessa macchina del piano
           (quindi stessa custodia del pallone del 7.693 e stessa finestra 3D del 7.689), ma senza evento
           del microsim in fondo — il punteggio non lo tocca nessuno, e il tabellino prende un tiro, che e'
           quello che e' successo. L'ultimo tempo NOMINA il portiere e accende il tuffo. Rosso __CPM_NO695. */
        const _pianoOcc695=(_latoN)=>{
          const _mpO=(matchPlayersRef.current||[]).map((q,i)=>({q,i})).filter(o=>o.q&&o.q.team===_latoN&&!o.q.gk);
          if(_mpO.length<3)return null;
          const _dirO=_latoN==='home'?1:-1;
          const _hpO=(k)=>Math.abs(hashStr("o695|"+nx+"|"+k));
          const _XO=(x)=>_dirO>0?x:100-x;
          const _cgO=(n)=>{const t=String(n||"").trim();return t?t.charAt(0)+t.slice(1).toLowerCase():"un compagno";};
          const _JO=(k,a)=>((_hpO("j"+k)%100)/100-0.5)*a;
          const _a=_mpO[_hpO("u1")%_mpO.length];let _b=_mpO[_hpO("u2")%_mpO.length];if(_b.i===_a.i)_b=_mpO[(_hpO("u2")+1)%_mpO.length];
          const _na=_cgO(_a.q.name),_nb=_cgO(_b.q.name);
          const _gkO=(matchPlayersRef.current||[]).find(q=>q&&q.team===(_latoN==='home'?'away':'home')&&q.gk);
          const _ngk=_cgO(_gkO&&_gkO.name)||"Il portiere";
          const _fO=_hpO("fam")%3;
          if(_fO===0)return[
            {t:"\u26a1 "+_na+" guadagna il fondo e mette dentro: mischia in area!",x:_XO(84+_JO(1,5)),y:50+_JO(2,16),chi:_a.i},
            {t:"\ud83d\udca5 "+_nb+" calcia da due passi!",x:_XO(93+_JO(3,3)),y:50+_JO(4,8),chi:_b.i,ms:1},
            {t:"\ud83e\udde4 "+_ngk+" ci mette il corpo e la devia in angolo: che parata!",x:_XO(96),y:50+_JO(5,6),gk:1,esito:"corner"},
          ];
          if(_fO===1)return[
            {t:"\ud83c\udfaf "+_na+" si accentra e cerca il giro sul secondo palo.",x:_XO(78+_JO(1,6)),y:50+_JO(2,18),chi:_a.i},
            {t:"\ud83d\udca5 Conclusione a giro di "+_na+": palla verso l'incrocio!",x:_XO(94+_JO(3,2)),y:50+_JO(4,10),chi:_a.i,ms:1},
            {t:"\ud83e\udde4 "+_ngk+" vola e la toglie da sotto l'incrocio: in angolo!",x:_XO(96),y:50+_JO(5,8),gk:1,esito:"corner"},
          ];
          return[
            {t:"\ud83d\udcc8 "+_na+" verticalizza per "+_nb+": e' solo davanti al portiere!",x:_XO(80+_JO(1,6)),y:50+_JO(2,14),chi:_b.i},
            {t:"\ud83d\udca5 "+_nb+" a tu per tu, calcia di prima!",x:_XO(92+_JO(3,3)),y:50+_JO(4,8),chi:_b.i,ms:1},
            {t:"\ud83e\udde4 Uscita bassa di "+_ngk+": blocca a terra e fa ripartire i suoi.",x:_XO(95),y:50+_JO(5,6),gk:1,esito:"goal_kick"},
          ];
        };
        const _apriCatena644=(_lato551)=>{
          const _mp551=(matchPlayersRef.current||[]);
          if(azioneRef.current||_mp551.length<11)return false;
          const _mio551=(i)=>{const q=_mp551[i];return !!q&&q.team===_lato551&&!q.gk;};
          const _cg615=(typeof window!=='undefined'&&window.__CPM_CAT615)||null;
          if(_cg615)_cg615.gate=(_cg615.gate|0)+1;
              /* si apre solo se c'e' un portatore plausibile vicino alla palla */
              const _b551=ballPosRef.current||{x:50,y:50};
              let _hold=-1,_hd=1e9;_mp551.forEach((q,i)=>{if(!_mio551(i))return;const d=Math.hypot(q.x-_b551.x,q.y-_b551.y);if(d<_hd){_hd=d;_hold=i;}});
              if(_cg615&&!(_hold>=0&&_hd<26)){_cg615.farHold=(_cg615.farHold|0)+1;if((_cg615.fh=_cg615.fh||[]).length<40)_cg615.fh.push(+_hd.toFixed(1));}
              if(_hold>=0&&_hd<26){
                const _dir551=(_lato551==="home")?1:-1;
                const _n551=2+(Math.abs(hashStr("cat|"+nx+"|"+_hold))%2);/* [7.537.0 v6] 2-3 tocchi, non 3-5: col confronto diretto (guardiano acceso/spento) la catena da 5 passi alternati occupava circa meta' della telecronaca e affamava il repertorio pescato — 14 righe utili contro le 15 minime CON la catena, verde SENZA. Una giocata di due-tre tocchi si racconta meglio e lascia parlare il commento. */
                const passi=[];let _cur=_hold;
                for(let k=0;k<_n551;k++){
                  const _cq=_mp551[_cur];if(!_cq)break;
                  /* il ricevente e' un compagno PIU' AVANTI (o in appoggio laterale al cambio gioco),
                     entro un raggio da passaggio: la catena guadagna campo senza teletrasporti */
                  let _best=-1,_bs=-1e9;
                  _mp551.forEach((q,i)=>{if(i===_cur||!_mio551(i))return;
                    const _fw=(q.x-_cq.x)*_dir551,_dd=Math.hypot(q.x-_cq.x,q.y-_cq.y);
                    if(_dd<4||_dd>40)return;
                    if(_fw<2)return;/* [7.537.0 v7] il passo DEVE guadagnare campo: col vincolo a -1 la catena
                       accettava appoggi laterali e teneva la palla al centro — il guardiano `bg-rhythm` e'
                       andato cieco sulla fase SVILUPPO (4 coppie contro le 8 minime, costruzione 51): una
                       telecronaca che parla solo di costruzione non ha piu' respiro. *//* [7.537.0 v2] OGNI PASSO GUADAGNA CAMPO: la v1 pesava l'avanzamento (x1,6) ma non lo pretendeva, e con la formazione compatta al centro la catena girava in orizzontale — misurato: tempo nella fascia centrale 80%→93%, cioe' il contrario di cio' che serviva. Un passaggio all'indietro non e' vietato nel calcio, ma questa macchina esiste per PORTARE la palla: se non c'e' nessuno piu' avanti, la catena si chiude e lascia parlare le altre voci. */
                    /* [7.615.0 — LA CATENA NON SI MANGIA IL CAMPO IN UN BOCCONE. Rosso __CPM_NO615]
                       MISURATO col censimento del cancello (__CPM_CAT615): il portatore c'e' SEMPRE
                       (farHold 0/17) e il cancello passa (16/17), ma la catena apriva 1 volta su 16 —
                       QUINDICI morti al secondo passo, quattordici con ESATTAMENTE un passo costruito.
                       L'aritmetica: il punteggio premiava l'avanzamento con peso 4,5 SENZA tetto, quindi
                       il primo passo saltava sull'uomo piu' avanzato (anche +30-40u, il limite era il
                       raggio dd<40) e da li' davanti non restava nessuno con fw>=2: la macchina degli
                       schemi si affamava da sola al primo boccone — ed e' il perche' del «catena: 0
                       righe» su intere passate (manovra-615) e dell'1% di fotogrammi (scrittori-601).
                       Col tetto a 12 il passo ideale resta la verticale corta (8-18u, la stessa banda
                       del repertorio 7.549) e lo spazio davanti avanza per i passi successivi. */
                    const _fwS615=(typeof window!=='undefined'&&window.__CPM_NO615)?_fw:Math.min(_fw,12);
                    const _sc=_fwS615*4.5-Math.abs(_dd-22)*0.35+((Math.abs(hashStr("rx|"+nx+"|"+k+"|"+i))%100)/100)*3;
                    if(_sc>_bs){_bs=_sc;_best=i;}});
                  /* [7.718.0 — IL PRIMO PASSO DELLA CATENA E' UNA DECISIONE VERA. Rosso __CPM_NO718]
                     Primo bisturi del disegno FASE3-SCAMBIO: al passo d'apertura (k=0, portatore vicino
                     alla palla, quindi origine≈pallone come vuole la mente) il ricevente lo indica
                     decidi715 — la stessa funzione dell'ombra, misurata a profilo-calcio (mediana 13,6u,
                     linee pulite 90%). I cancelli DURI della catena restano la rete di sicurezza: il
                     candidato deve essere del lato, non il portatore, avanti di 2u e in raggio 4-40 —
                     se la decisione non li passa (o dice conduci/tira), vale l'euristica di prima. Ai
                     passi successivi (origine avanti al pallone logico: la mente li giudicherebbe dal
                     punto sbagliato) resta l'euristica finche' il pallone non seguira' la catena tick
                     per tick. Bersaglio dichiarato: il coseno decisione<->pallone di accordo-717 sale
                     da -0,26. */
                  if(k===0&&!(typeof window!=='undefined'&&window.__CPM_NO718)){try{
                    const _d718=decidi715(_dir551);
                    if(_d718.act==="passa"&&_d718.rcv&&_d718.rcv.i!==_cur&&_mio551(_d718.rcv.i)){
                      const _q718=_mp551[_d718.rcv.i];
                      const _fw718=(_q718.x-_cq.x)*_dir551,_dd718=Math.hypot(_q718.x-_cq.x,_q718.y-_cq.y);
                      if(_fw718>=2&&_dd718>=4&&_dd718<=40){_best=_d718.rcv.i;_bs=999;
                        if(typeof window!=='undefined'&&window.__CPM_REC){try{const _w=(window.__CPM_CAT718=window.__CPM_CAT718||{decisi:0,ripieghi:0});_w.decisi++;}catch(_e){}}}
                      else if(typeof window!=='undefined'&&window.__CPM_REC){try{const _w=(window.__CPM_CAT718=window.__CPM_CAT718||{decisi:0,ripieghi:0});_w.ripieghi++;}catch(_e){}}
                    }else if(typeof window!=='undefined'&&window.__CPM_REC){try{const _w=(window.__CPM_CAT718=window.__CPM_CAT718||{decisi:0,ripieghi:0});_w.ripieghi++;}catch(_e){}}
                  }catch(_e718){}}
                  let _last615=false;
                  if(_best<0){
                    /* [7.615.0 — L'ULTIMO PASSO PUO' ESSERE UNO SCARICO. Rosso __CPM_NO615B]
                       Anche col tetto sull'avanzamento, 10 tentativi su 14 morivano al secondo passo:
                       dal ricevente avanzato nessuno sta piu' davanti con fw>=2, e una catena da UN passo
                       non e' una catena (serve passi>=2). Nel calcio la manovra si chiude cosi': verticale,
                       e SCARICO corto d'appoggio (anche all'indietro fino a 4u, raggio 4-26). Ammesso solo
                       DOPO almeno un passo in avanti (k>=1) e come passo FINALE — il vincolo v7 sul
                       guadagno di campo resta la regola, questo e' il suo punto e virgola. Il dai-e-vai
                       (tornare sul primo passatore) e' compreso: e' calcio vero. */
                    if(k<1){
                      /* [7.633.0 — IL PRIMO PASSO PUO' USCIRE DAL TRAFFICO. Rosso __CPM_NO633B]
                         CENSIMENTO nella realizzazione del guardiano (name Pv): 5 morti su 9 occasioni a
                         steps0, portatore AVANZATO (x 65-72) — davanti nessuno con fw>=2, e a passo zero
                         nemmeno lo scarico 7.623 e' concesso (k>=1): la catena moriva sul nascere.
                         Nel calcio l'uscita dal traffico e' l'appoggio laterale, POI la verticale.
                         Concesso solo come PRIMO passo e la catena PROSEGUE (non e' una chiusura):
                         la legge v7 sul guadagno di campo torna dal passo successivo. */
                      if(typeof window!=='undefined'&&window.__CPM_NO633B)break;
                      _mp551.forEach((q,i)=>{if(i===_cur||!_mio551(i))return;
                        const _fwL=(q.x-_cq.x)*_dir551,_ddL=Math.hypot(q.x-_cq.x,q.y-_cq.y);
                        if(_ddL<4||_ddL>26||_fwL<-8)return;
                        const _scL=-Math.abs(_ddL-12)*0.5+((Math.abs(hashStr("lx|"+nx+"|"+k+"|"+i))%100)/100)*3;
                        if(_scL>_bs){_bs=_scL;_best=i;}});
                      if(_best<0)break;
                    }else{
                    if(typeof window!=='undefined'&&window.__CPM_NO615B)break;
                    /* [7.623.0 — LA CHIUSURA E' UN RETROPASSAGGIO VERO. Rosso __CPM_NO623]
                       MISURATO col registro s0 (dopo il 7.615): meta' delle morti residue e' «n:1» —
                       la verticale c'e', ma il ricevente e' l'uomo PIU' avanzato e la finestra dello
                       scarico (fino a 4u indietro, raggio 26) e' VUOTA quando tutti i compagni stanno
                       8-20u dietro. Nel calcio quello si chiama retropassaggio, ed e' nella lista §2
                       della direttiva PO. La chiusura ammette fino a 14u all'indietro, raggio 30 —
                       SOLO come ultimo passo dopo una verticale: v7 resta la legge dei passi veri. */
                    const _bkw623=(typeof window!=='undefined'&&window.__CPM_NO623)?-4:-14;
                    const _bkr623=(typeof window!=='undefined'&&window.__CPM_NO623)?26:30;
                    _mp551.forEach((q,i)=>{if(i===_cur||!_mio551(i))return;
                      const _fw=(q.x-_cq.x)*_dir551,_dd=Math.hypot(q.x-_cq.x,q.y-_cq.y);
                      if(_dd<4||_dd>_bkr623||_fw<_bkw623)return;
                      const _sc=-Math.abs(_dd-14)*0.5+((Math.abs(hashStr("sx|"+nx+"|"+k+"|"+i))%100)/100)*3;
                      if(_sc>_bs){_bs=_sc;_best=i;}});
                    if(_best<0)break;
                    _last615=true;
                    }
                  }
                  const _bq=_mp551[_best];
                  const _fw2=(_bq.x-_cq.x)*_dir551;
                  const _kind=(_fw2>13)?"filtrante":(Math.abs(_bq.y-_cq.y)>22)?"cambio":(_fw2>4)?"verticale":"appoggio";
                  passi.push({daIdx:_cur,rcvIdx:_best,da:String(_cq.name||"").trim(),a:String(_bq.name||"").trim(),kind:_kind,to:{x:_bq.x,y:_bq.y}});
                  _cur=_best;
                  if(_last615)break;
                }
                if(_cg615){if(passi.length>=2)_cg615.opened=(_cg615.opened|0)+1;else{_cg615.steps0=(_cg615.steps0|0)+1;if((_cg615.s0=_cg615.s0||[]).length<40)_cg615.s0.push({n:passi.length,hx:+(_mp551[_hold].x||0).toFixed(1),hy:+(_mp551[_hold].y||0).toFixed(1)});}}
                if(passi.length>=2){azioneRef.current={passi,i:0,nostra:_lato551==="home",arrivato:false,t0:nx};
                  /* [7.537.0 v3] LA CATENA APRE LA PROFONDITA'. Le v1/v2 sono state buttate con le loro
                     misure: pretendere l'avanzamento a ogni passo (v2) non basta se davanti non c'e'
                     NESSUNO — in cronaca i ventidue vivono ammassati attorno al cerchio (misura: 80-93%
                     del tempo in fascia centrale), quindi la catena non trovava riceventi e si chiudeva
                     subito. All'apertura i tre uomini piu' avanzati del lato in possesso ATTACCANO lo
                     spazio (+7u verso la porta): e' lo stesso principio dello staging pre-azione degli
                     highlight, portato nella cronaca — prima si crea la giocata, poi la si racconta. */
                  const _d3=(_lato551==="home")?1:-1;
                  setMatchPlayers(prev=>{const idxs=prev.map((q,i)=>({q,i})).filter(o=>o.q&&o.q.team===_lato551&&!o.q.gk)
                      .sort((a,c)=>((c.q.x-a.q.x)*_d3)).slice(0,3).map(o=>o.i);
                    return prev.map((pl,idx)=>(idxs.indexOf(idx)>=0&&pl)?{...pl,x:clamp(pl.x+_d3*7,4,94)}:pl);});}
              }
          return !!azioneRef.current;
        };
        const _rip575=!(typeof window!=='undefined'&&window.__CPM_NO575)&&((kickRef.current|0)>0||(kickoffRef.current|0)>0);
        if(!(typeof window!=='undefined'&&window.__CPM_NO575)){
          if(_simEv77&&_rip575){if(!golAttesa575.current)golAttesa575.current=_simEv77;_simEv77=null;}
          else if(!_simEv77&&!_rip575&&golAttesa575.current){_simEv77=golAttesa575.current;golAttesa575.current=null;}
          if(!(typeof window!=='undefined'&&window.__CPM_NO645)&&!_simEv77&&!_rip575&&!pendingGoalRef.current&&golCoda645.current.length){_simEv77=golCoda645.current.shift();if(nx<90)_simEv77={..._simEv77,_cap645:7};/* [7.645 v2] la costruzione del gol accodato ha un tetto DIMEZZATO (7): meta' saturazione, stessa regola d'area */if(nx>=90){_simEv77={..._simEv77,_diretto645:true};if(typeof window!=='undefined'&&window.__CPM_REC){try{const _w=(window.__CPM_REC645=window.__CPM_REC645||{coda:0,codaMax:0,dir:0,rec:0,forza92:0});_w.dir++;}catch(_e){}}}}/* [7.645.0] il gol in coda entra quando il campo e' libero e si costruisce come gli altri; nel RECUPERO entra diretto (copia marcata: il template BG_MATCH e' condiviso, non si muta) perche' il recupero e' bordato */
        }
        if(!(typeof window!=='undefined'&&window.__CPM_NO532)){
          /* [7.695.0] L'OCCASIONE SI ARMA QUANDO IL CAMPO E' LIBERO E LA SQUADRA E' AVANTI: nessun'altra
             macchina in corso, pallone gia' oltre meta' campo nel verso di chi ha il turno, e non piu' di
             una ogni otto minuti — un'azione pericolosa e' un evento, non il ritmo della partita. */
          if(typeof window!=='undefined'&&window.__CPM_REC){try{const _g=(window.__CPM_OCC695G=window.__CPM_OCC695G||{giri:0,ev:0,pg:0,ct:0,hl:0,out:0,sp:0,fermo:0,ko:0,min:0,cool:0,adv:0,dado:0,piano:0,ok:0});_g.giri++;
            if(_simEv77)_g.ev++;else if(pendingGoalRef.current)_g.pg++;else if(counterRef.current)_g.ct++;else if(_inHL77)_g.hl++;else if(outRef.current)_g.out++;else if(spRef.current)_g.sp++;else if(fermoRef.current)_g.fermo++;else if(kickoffRef.current>0||kickRef.current>0)_g.ko++;else if(!(nx>6&&nx<86))_g.min++;else if((nx-(occCool695.current|0))<8)_g.cool++;else{const _b=ballPosRef.current||{x:50,y:50};const _d=(possTurnRef.current>0)?1:-1;const _a=_d>0?(_b.x||50):100-(_b.x||50);if(_a<48)_g.adv++;else if((Math.abs(hashStr("occ695|"+nx+"|"+((bgSimSeedRef.current|0))))%100)>=72)_g.dado++;else _g.ok++;}}catch(_e){}}/* [7.695 strumento] QUALE cancello ferma l'occasione, tick per tick: senza, «zero occasioni armate» non si spiega */
          if(!(typeof window!=='undefined'&&window.__CPM_NO695)&&!_simEv77&&!pendingGoalRef.current&&!counterRef.current&&!_inHL77&&!outRef.current&&!spRef.current&&!fermoRef.current&&kickoffRef.current<=0&&kickRef.current<=0&&nx>6&&nx<86&&(nx-(occCool695.current|0))>=8){try{
            const _bO695=ballPosRef.current||{x:50,y:50};const _dO695=(possTurnRef.current>0)?1:-1;
            const _advO695=_dO695>0?(_bO695.x||50):100-(_bO695.x||50);
            /* [7.714.0 — LO SCAMBIO: IL TRIGGER DELLE OCCASIONI PASSA DAL DADO ALLO STATO. Rosso __CPM_NO714]
               §9 della missione: «SE NON E' REALMENTE PERICOLOSO, NON DIVENTA EXTRA 3D». MISURATO in ombra
               su 5 partite (3 percorsi + 2 mondi): le finestre aperte dal dado hanno threat mediano 21-27,
               IL FONDO di cronaca 21-30 — il dado non seleziona pericolo; e ogni mondo ha 3-8 picchi >=70
               mai mostrati. Ora l'occasione si apre quando lo STATO dice pericolo: threat >= 58 (sopra il
               p90 del fondo, 54-58). Restano campo-libero e cooldown 8'; resta ANCHE adv>=48 come vincolo
               di compatibilita' dichiarato — le famiglie del piano presuppongono palla avanzata, e cade
               quando le Fasi 3-5 faranno nascere l'azione dai 22 invece che dal copione. Il dado muore. */
            const _thr714=(matchStateRef.current&&matchStateRef.current.threat)|0;
            const _apri714=(typeof window!=='undefined'&&window.__CPM_NO714)
              ?(_advO695>=48&&(Math.abs(hashStr("occ695|"+nx+"|"+((bgSimSeedRef.current|0))))%100)<72)
              :(_advO695>=48&&_thr714>=58);
            if(_apri714){
              const _piO695=_pianoOcc695(_dO695>0?"home":"away");
              if(_piO695){occCool695.current=nx;pendingGoalRef.current={ev:null,occ:1,dir:_dO695,ticks:0,righe:0,righeLato:0,cap:0,piano:_piO695,step:0};
                if(typeof window!=='undefined'&&window.__CPM_REC){try{const _w=(window.__CPM_OCC695=window.__CPM_OCC695||{armate:0,parate:0,min:[],thr:[]});_w.armate++;if(_w.min.length<40)_w.min.push(nx);if(_w.thr.length<40)_w.thr.push(_thr714);}catch(_e){}}}}
          }catch(_eO695){}}
          let _pg532=pendingGoalRef.current;
          /* ⚠️ [7.695.0 — UN'OCCASIONE NON PUO' RITARDARE UN GOL. Misurato nel rituale, non temuto.]
             Con le occasioni che occupano la stessa macchina del piano, un gol del microsim arrivato
             mentre un'occasione era in corso finiva in CODA (7.645) e usciva minuti dopo: il guardiano
             `gol-con-manovra` e' sceso a DUE gol su due partite, sotto il minimo del campione, cioe' e'
             diventato cieco. Una banda che non puo' giudicare e' peggio di una banda rossa, ed e' la
             seconda volta che questa lezione mi si presenta in due release. La gerarchia e' ovvia una
             volta scritta: il gol e' un FATTO del microsim, l'occasione e' solo racconto. Se arrivano
             insieme, e' l'occasione a farsi da parte, subito e senza coda. */
          if(_simEv77&&_pg532&&_pg532.occ&&!(typeof window!=='undefined'&&window.__CPM_NO695)){pendingGoalRef.current=null;_pg532=null;
            if(typeof window!=='undefined'&&window.__CPM_REC){try{const _w=(window.__CPM_OCC695=window.__CPM_OCC695||{armate:0,parate:0,min:[]});_w.cedute=(_w.cedute|0)+1;}catch(_e){}}}
          if(_simEv77&&_pg532&&!(typeof window!=='undefined'&&window.__CPM_NO645)&&!_simEv77._diretto645&&golCoda645.current.length<1){golCoda645.current.push(_simEv77);_simEv77=null;/* [7.645 v2] coda MAX 1: il guardiano e' andato rosso (arbitro 3<6, causali 84%) con le costruzioni serializzate — ogni gol in coda paga ~14 tick di pendingGoal e sotto costruzione l'arbitro tace per progetto. Un solo gol aspetta; un eventuale terzo entra diretto, com'era prima del 7.645. */if(typeof window!=='undefined'&&window.__CPM_REC){try{const _w=(window.__CPM_REC645=window.__CPM_REC645||{coda:0,codaMax:0,dir:0,rec:0,forza92:0});_w.coda++;if(golCoda645.current.length>_w.codaMax)_w.codaMax=golCoda645.current.length;}catch(_e){}}}/* [7.645.0 — UN GOL ALLA VOLTA. Rosso __CPM_NO645] FOTOGRAFATO (golback644b): un gol rotolato MENTRE un'altra costruzione e' pendente non aveva NESSUN ramo — si applicava diretto senza racconto (50' Pv) e la sua festa+kickoff calpestavano il finale della costruzione viva (56' Pv, nudo). Ora si mette in CODA e avra' la sua costruzione quando il campo e' libero. */
          if(_simEv77&&!_pg532&&!_simEv77._diretto645){
            const _nostro532=_simEv77.ef==="team_goal";
            pendingGoalRef.current={ev:_simEv77,dir:_nostro532?1:-1,ticks:0,righe:0,righeLato:0,cap:(_simEv77._cap645|0)||0};
            if(!(typeof window!=='undefined'&&window.__CPM_NO543))setTurn616(_nostro532?1:-1,"gol-in-costruzione");/* [7.532.0 NO543] l'azione pendente e' di chi segnera' */
            _simEv77=null;
            addCom(_nostro532?"⚡ Azione manovrata: la squadra sale in blocco verso l'area!":"⚠️ L'avversario avanza compatto — pericolo in costruzione…",_nostro532?"#4ade80":"#f87171",nx);
            if(!(typeof window!=='undefined'&&window.__CPM_NO649)){pendingGoalRef.current.piano=_pianoGol649(_nostro532?"home":"away");pendingGoalRef.current.step=0;if(!pendingGoalRef.current.piano&&!(typeof window!=='undefined'&&window.__CPM_NO644))_apriCatena644(_nostro532?"home":"away");}/* [7.649.0] la scena-gol nasce col suo PIANO di eventi; senza piano (rosa corta) il fallback resta la catena 7.644 */
            else if(!(typeof window!=='undefined'&&window.__CPM_NO644))_apriCatena644(_nostro532?"home":"away");/* [7.644.0] LA COSTRUZIONE NASCE COL SUO RACCONTO: la catena si apre all'armamento, non aspetta che il sorteggio peschi una riga — fotografato il contrario su 4 gol su 10 (zero righe del lato) */
          }else if(_pg532&&!_inHL77&&_pg532.piano&&!(typeof window!=='undefined'&&window.__CPM_NO649)){
            _pg532.ticks++;
            if(typeof window!=='undefined'&&(_CPM_TEST||window.__CPM_REC)){try{const _P=(window.__CPM_PG587=window.__CPM_PG587||{azioni:[]});const _a=_P.azioni[_P.azioni.length-1];
              if(_a&&_a.p649&&_a.tick===(_pg532.ticks|0)-1){_a.tick=_pg532.ticks|0;_a.mn=nx;_a.passaggi=_pg532.step|0;}
              else _P.azioni.push({p649:1,tick:_pg532.ticks|0,mn:nx,mn0:nx,passaggi:0,max:0,perc:0,lx:0,ly:0,da:"piano"});}catch(_e649){}}
            const _arr693=(()=>{try{if(typeof window!=='undefined'&&window.__CPM_NO693)return true;const _lt=_pg532.lastTg;if(!_lt)return true;if(((_pg532.att693|0))>=1)return true;const _b=ballPosRef.current||{x:50,y:50};if(Math.hypot((_b.x||50)-_lt.x,(_b.y||50)-_lt.y)<=8)return true;_pg532.att693=(_pg532.att693|0)+1;return false;}catch(_e){return true;}})();/* [7.693.0 v2] l'attesa vale UN tick solo: alla prima stesura consumava tutto il tetto piano+4 e il gol scivolava fuori dai quattro minuti in cui il guardiano cerca la riga di macchina (gol-con-manovra 3/4 -> 1/4). E a due tick il testimone della custodia — che esclude la costruzione per progetto — scendeva a 5 campioni su 8, sotto il minimo del guardiano: una banda che non puo' giudicare e' peggio di una banda rossa. *//* [7.693.0 — LA RETE ASPETTA IL PALLONE] Col piano finalmente padrone del bersaglio, l'ultimo passo manda la palla al limite dell'area: ma il lerp ne copre il 65% per tick e la rete arrivava il tick dopo, con il pallone ancora a meta' strada. Il tetto piano+4 resta l'ultima parola, quindi l'attesa e' limitata per costruzione. */
            if(!_rip575&&(((_pg532.step|0)>=_pg532.piano.length&&_arr693)||_pg532.ticks>=_pg532.piano.length+4)){if(_pg532.ev)_simEv77=_pg532.ev;
              /* ⚠️ [7.702.0 — DOPO LA PARATA C'E' UNA PALLA MORTA, NON UN FLIPPER. Rosso __CPM_NO702B]
                 Collaudo PO: «ping pong di 4-5 volte tra il portiere scoordinato e un avversario, davvero
                 poco realistico». Avevo costruito la parata (7.695) ma non il DOPO-parata: l'occasione si
                 chiudeva lasciando il pallone VIVO sulla linea di porta, l'elezione del portatore lo dava
                 all'attaccante piu' vicino, le reti lo ritiravano, e via cosi'. Nel calcio vero dopo una
                 parata c'e' una transizione morta: angolo, o il portiere blocca e rinvia. La transizione
                 esiste gia' nel motore (outRef+fermoRef, 7.559) e qui la si usa: l'esito lo dichiara il
                 TESTO dell'ultimo tempo (una fonte sola, come per il tuffo), il possesso va a chi
                 difendeva per il rinvio e a chi attaccava per l'angolo, come da regolamento. */
              if(_pg532.occ&&_pg532.esito703&&!(typeof window!=='undefined'&&window.__CPM_NO702B)){try{
                const _es702=_pg532.esito703;const _atk702=(_pg532.dir|0)>0;
                const _no702=_es702==="corner"?_atk702:!_atk702;
                const _ox702=_es702==="corner"?(_atk702?98:2):(_atk702?94:6);
                const _oy702=_es702==="corner"?((Math.abs(hashStr("occ702|"+nx))%2)?96:4):50;
                outRef.current={kind:_es702,nostra:_no702,x:_ox702,y:_oy702,step:0,ttl:4};
                if(!(typeof window!=='undefined'&&window.__CPM_NO616))setTurn616(_no702?1:-1,"interruzione-"+_es702);
                fermoRef.current={x:_ox702,y:_oy702,t:4,kind:_es702};
              }catch(_e702){}}
              pendingGoalRef.current=null;}/* [7.695.0] senza evento del microsim in fondo (l'occasione) la macchina si chiude e basta: il punteggio non lo tocca nessuno *//* [7.649.0] la rete arriva quando il piano e' stato RACCONTATO; il tetto piano+4 resta l'ultima parola (mai un gol in sospeso) */
          }else if(_pg532&&!_inHL77){
            _pg532.ticks++;
            const _t532=ballTargetRef.current;const _b532=ballPosRef.current||{x:50,y:50};
            /* [7.587.0 — QUANTI BERSAGLI ATTRAVERSA IL PALLONE MENTRE IL GOL SI COSTRUISCE.
               Collaudo PO: «il gol non si vede» e «non ci sono trame di gioco, passaggi». Misurato con
               `golvisto-587`: un ingresso in rete va IN LINEA RETTA dal dischetto di centrocampo alla porta
               (46 unita', rettilineita' 0,96) senza che nessuno tocchi il pallone. La riga qui sotto e' il
               perche': il bersaglio avanza di tre unita' a tick lungo la x, con la y tirata al centro — una
               marcia, non un'azione. Un'azione vera ha dei BERSAGLI, uno per passaggio; una marcia ne ha
               uno solo che si sposta. Contarli separa le due cose, e la rettilineita' no: anche una catena
               di passaggi in avanti e' quasi rettilinea. Sola strumentazione. */
            /* ⚠️ un passaggio e' un SALTO del bersaglio, non uno scorrimento: la marcia lo sposta di tre
               unita' a ogni tick, quindi contare «e' cambiato» conterebbe otto passaggi in una scivolata.
               Si contano solo i salti oltre le sei unita' — piu' del doppio del passo della marcia. */
            if(typeof window!=='undefined'&&(_CPM_TEST||window.__CPM_REC)){try{const _P=(window.__CPM_PG587=window.__CPM_PG587||{azioni:[]});const _a=_P.azioni[_P.azioni.length-1];const _px=_t532.x,_py=_t532.y;
              if(_a&&_a.tick===(_pg532.ticks|0)-1){_a.tick=_pg532.ticks|0;_a.mn=nx;const _sal=Math.hypot(_px-_a.lx,_py-_a.ly);if(_sal>6){_a.passaggi++;if(_sal>_a.max)_a.max=+_sal.toFixed(1);}_a.lx=_px;_a.ly=_py;_a.perc+=_sal;}
              else _P.azioni.push({tick:_pg532.ticks|0,mn:nx,mn0:nx,passaggi:0,max:0,perc:0,lx:_px,ly:_py,da:Math.round(_px)+","+Math.round(_py)});/* [7.644 strumentazione] mn/mn0: minuto d'inizio e ultimo minuto — servono ad agganciare azione e gol nel metro */}catch(_e587){}}
            if(!(azioneRef.current&&!(typeof window!=='undefined'&&window.__CPM_NO559))&&!ballLagRef.current)_t532.x=clamp(_t532.x+_pg532.dir*4,2,98);/* [7.645 v3] passo 3->4: MISURATO (TICKBLK nel run del guardiano) che a passo 3 OGNI costruzione muore a tetto-14 e 47 tick su 86 del sito-righe stanno sotto pendingGoal (ok:3, fischi 3<6): la partita e' TUTTA costruzione. A 4u/tick la stessa geografia (34u dall'armamento all'area) chiude in ~9 tick. Il vincolo 7.541 (palla oltre il passo dell'uomo) era misurato SENZA portatore persistente: oggi il portatore conduce (7.641/7.642) e la banda custodia del guardiano fa da sentinella. *//* [7.642 v5] il bersaglio aspetta la palla *//* [7.541.0] se la catena sta raccontando, e' LEI a portare la palla: due scrittori sullo stesso pallone si annullano, e quello cieco (+3u verso la porta) non nomina nessuno *//* [v3] 4->3 u/tick (~7u/s): a 4 la palla correva a 9,5u/s, oltre il passo del portatore (7-9u/s) — ball-attended crollato a 46,8% (<52): l'azione manovrata viaggia CON la squadra, non davanti a tutti */_t532.y=clamp(_t532.y+(50-_t532.y)*0.25,6,94);
            /* [7.542.0 v4 — collaudo PO «non si vedono i gol»] LA RETE ASPETTA LA SUA AZIONE. Tre
               iterazioni sulla FINESTRA del racconto (forzatura ovunque: 6/8 ma ritmo rotto a 1,29x;
               solo oltre l'avanzamento 58: 4/7; da meta' campo: 5/8) hanno sempre lasciato fuori un gol
               su tre, perche' la rete si scrive ad avanzamento 72 mentre la finestra piena parte prima:
               certi attacchi hanno solo due o tre tick per farsi raccontare, e nessuna taratura della
               finestra puo' dare tre battute a un'azione che ne dura due. Il verso giusto e' l'opposto —
               non allargare la finestra, ma far ASPETTARE la rete: un gol si scrive quando la sua azione
               e' stata raccontata (tre righe), non quando la palla tocca una coordinata. Il tetto di
               sicurezza dei 10 tick resta ed e' l'ultima parola: nessun gol puo' restare in sospeso. */
            const _rg532=(typeof window!=='undefined'&&window.__CPM_NO563)?true:(((_pg532.righe|0)>=3)&&((typeof window!=='undefined'&&window.__CPM_NO644)||((_pg532.righeLato|0)>=1)));/* [7.644.0] tre righe qualsiasi E almeno UNA del lato che segna: prima bastavano tre righe di chiunque. Il tetto resta l'ultima parola (nessun gol in sospeso). */
            /* [7.638.0 — IL GOL NASCE IN AREA, NON A META' STRADA. Rosso __CPM_NO638]
               Collaudo PO: «i gol arrivano da oltre 30 metri senza azioni». MISURATO (golpos-637, due
               partite): la riga di gol si scrive con la palla a 23-24u dalla porta, SEMPRE — perche'
               la soglia qui sotto era x72/28, scelta al 7.542 per il racconto (le 3 righe) e mai per la
               geografia. La rete ora aspetta l'AREA (x84/16): il volo finale scende da ~26u a ~14u, la
               festa (7.587, che gia' aspetta il pallone in rete) arriva a palla vicina, e l'azione
               attraversa davvero l'ultimo terzo. Il tetto di sicurezza sale in proporzione (10->14
               tick: al passo di 3u/tick da centrocampo all'area servono ~11 tick) e resta l'ultima
               parola: nessun gol puo' restare in sospeso. */
            const _no638=(typeof window!=='undefined'&&window.__CPM_NO638);
            const _gx638=_no638?72:84,_gxb638=_no638?28:16,_cap638=(_pg532.cap|0)>0?(_pg532.cap|0):(_no638?10:10);/* [7.645 v3] tetto 14->10, proporzionato al passo 4 (7.638: il tetto segue il passo) *//* [7.645 v2] il gol accodato porta il suo tetto corto */
            if(!_rip575&&((((_pg532.dir>0&&_b532.x>=_gx638)||(_pg532.dir<0&&_b532.x<=_gxb638))&&_rg532)||_pg532.ticks>=_cap638)){_simEv77=_pg532.ev;pendingGoalRef.current=null;}/* [7.575.0] nemmeno il tetto di sicurezza scavalca la ripartenza: l'azione resta pendente un tick in piu' *//* [v3] tetto 8->10, coerente col passo ridotto */
          }
        }
        /* [7.532.0 collaudo PO «non ci sono molti ribaltamenti di fronte, non sembra una vera partita» —
           rosso __CPM_NO542] LA TRANSIZIONE VOLA: quando un recupero in zona profonda apre il contropiede
           (trigger nel sito delle righe), la palla attraversa il campo a 5u/tick — il doppio del passo del
           gol costruito: una ripartenza CORRE. All'arrivo si arma la risoluzione (fin), che la prossima riga
           recita. Un highlight mette in pausa, come per l'azione pendente. */
        if(!(typeof window!=='undefined'&&window.__CPM_NO542)&&counterRef.current&&!pendingGoalRef.current&&!_inHL77){
          const _ct542=counterRef.current;
          if(!_ct542.fin){_ct542.ticks++;
            const _t542=ballTargetRef.current;
            if(!ballLagRef.current){_t542.x=clamp(_t542.x+_ct542.dir*5,4,96);_t542.y=clamp(_t542.y+(50-_t542.y)*0.20,6,94);}/* [7.642 v5] il bersaglio aspetta la palla */
            const _b542=ballPosRef.current||{x:50,y:50};
            if((_ct542.dir>0&&_b542.x>=76)||(_ct542.dir<0&&_b542.x<=24)||_ct542.ticks>=9)_ct542.fin=true;}
        }
        /* [7.532.0 NO544 — IL PONTE] due minuti prima dell'highlight in calendario, la cronaca scorta la
           palla verso il punto di nascita della scena: l'highlight si apre DOVE il racconto ha portato il
           gioco, non dal nulla. Il turno passa alla squadra della scena (attacco=nostro, difesa=loro). */
        if(!(typeof window!=='undefined'&&window.__CPM_NO544)&&!_inHL77&&kickoffRef.current<=0&&!pendingGoalRef.current&&!counterRef.current){
          const _nt544=(hlTimesRef.current||[])[hlIdx];
          if(_nt544!=null&&clockRef.current>=_nt544-2&&clockRef.current<_nt544&&ponteIdxRef.current!==hlIdx){
            ponteIdxRef.current=hlIdx;
            const _s544=situations[hlIdx];
            if(_s544){try{const _spb=hlBallSpot(_s544,(pPosRef.current&&pPosRef.current.x)||60,(pPosRef.current&&pPosRef.current.y)||50);
              ponteRef.current={x:_spb.x,y:_spb.y,def:_s544.type==="def"};
              if(!(typeof window!=='undefined'&&window.__CPM_NO543))setTurn616(_s544.type==="def"?-1:1,"ponte-scena");}catch(_e){}}
          }
          if(ponteRef.current){const _tp=ballTargetRef.current;
            const _pdx=ponteRef.current.x-_tp.x,_pdy=ponteRef.current.y-_tp.y;const _pd=Math.hypot(_pdx,_pdy);
            if(_pd<6)ponteRef.current.arrived=true;
            else{_tp.x=clamp(_tp.x+_pdx/_pd*4,2,98);_tp.y=clamp(_tp.y+_pdy/_pd*4,4,96);}}
        }
        /* [7.537.0 NO551] AVANZAMENTO DELLA CATENA: mentre un passo e' in volo la palla punta il
           RICEVENTE (non una zona), e il ricevente le va incontro — e' qui che muore il «77% del tempo
           senza padrone». Un highlight in corso mette in pausa, come per le altre macchine. */
        /* [7.541.0 collaudo PO «la partita e' ancora confusionaria, non ci sono vere azioni e non si
           vedono i gol» — rosso __CPM_NO559] LA CATENA RACCONTA ANCHE IL GOL. Censimento su partite vere:
           6 gol su 8 arrivano senza NESSUNA riga di pericolo prima, e fra due righe consecutive passano
           cinque minuti di gioco in cui la palla attraversa 40-50 unita' di campo senza che nessuno lo
           dica (dump: 43' palla a x42 · 48' palla a x50 · 50' GOL con palla a x2). Due cause, e sono
           entrambe qui: (a) la catena — l'unica macchina che racconta una giocata come SEQUENZA di uomini
           nominati — era esclusa proprio quando c'e' un gol in arrivo, cioe' nel momento che merita di
           essere raccontato piu' di ogni altro; (b) la pausa d'enfasi vale 7 TICK, che in tempo reale
           sono i 6,3 secondi di lettura per cui era stata scelta ma in tempo di GIOCO sono SETTE MINUTI
           (stessa classe dell'invariante 7.538: una costante tarata sul lettore dentro un motore che
           batte a minuti). Ora, mentre il gol e' in costruzione, la catena PARLA — e parla a ogni tick,
           senza cedere il turno al repertorio — cosi' la rete arriva in fondo alla sua azione invece che
           dopo un silenzio. Il contropiede resta escluso: ha gia' la sua recita. */
        const _cat559=!(typeof window!=='undefined'&&window.__CPM_NO559);
        /* ⚠️ [7.588.0] PROVATO E REVOCATO CON LA SUA MISURA: durante la ripresa togliere ai ventidue lo
           scrittore della CATENA di gioco, per lasciare campo libero al ripiegamento (l'idea del padrone
           unico, 7.556). La misura dice il contrario — giocatori nella meta' sbagliata: mediana 5 -> 6,
           e nei primi 900 ms 9 -> 10. Silenziando la catena i ventidue restano fermi DI PIU': il
           ripiegamento, da solo, non li muove affatto. E questo e' il dato che conta, perche' restringe
           la caccia: il suo aggiornamento (bersaglio 78, guadagno 0,92, quindi 44 -> 75 in un tick) viene
           SCARTATO da qualcun altro fra una passata e l'altra. Il colpevole non e' la catena. */
        if(!(typeof window!=='undefined'&&window.__CPM_NO551)&&azioneRef.current&&!_inHL77&&(_cat559||!pendingGoalRef.current)&&!counterRef.current){
          const _az=azioneRef.current,_p=_az.passi[_az.i];
          if(_p){const _t551=ballTargetRef.current;
            const _dx=_p.to.x-_t551.x,_dy=_p.to.y-_t551.y,_d=Math.hypot(_dx,_dy);
            if(_d>1.2&&!ballLagRef.current){_t551.x=clamp(_t551.x+_dx/_d*Math.min(6,_d),2,98);_t551.y=clamp(_t551.y+_dy/_d*Math.min(6,_d),4,96);}/* [7.642 v5] il bersaglio aspetta la palla */
            else _az.arrivato=true;
            /* il ricevente accorcia sulla palla: senza questo la palla arriva in una zona vuota e resta
               orfana (il difetto misurato), con questo il possesso ha sempre un uomo */
            /* [7.537.0 v2] LA SQUADRA ACCOMPAGNA: il ricevente accorcia sulla palla e il resto del reparto
               in possesso GUADAGNA CAMPO (1,1u/tick verso la porta attaccata). Senza questo la catena non
               trova mai un uomo piu' avanti — la formazione resta compatta al centro e il possesso ruota
               attorno al cerchio: e' la misura che ha bocciato la v1 (93% del tempo in fascia centrale). */
            const _dir2=_az.nostra?1:-1,_lt=_az.nostra?"home":"away";
            setMatchPlayers(prev=>prev.map((pl,idx)=>{if(!pl||pl.team==="ref")return pl;
              if(idx===_p.rcvIdx){const _ddx=_t551.x-pl.x,_ddy=_t551.y-pl.y,_dd=Math.hypot(_ddx,_ddy);
                if(_dd<1.4)return pl;const _st=Math.min(3.2,_dd);
                return{...pl,x:clamp(pl.x+_ddx/_dd*_st,2,98),y:clamp(pl.y+_ddy/_dd*_st,3,97)};}
              if(pl.team!==_lt||pl.gk)return pl;
              return{...pl,x:clamp(pl.x+_dir2*1.1,2,96)};}));
          }
        }
        if(bgCoolRef.current>0)bgCoolRef.current--;
        const _pausa485=(typeof window!=='undefined'&&window.__CPM_NO485)?false:(bgCoolRef.current>0);/* prova del rosso: `__CPM_NO485` toglie il pavimento */
        /* [7.541.0] LA PAUSA D'ENFASI NON PUO' COPRIRE L'AZIONE DEL GOL. `bgCoolRef` vale 7 tick dopo
           un evento importante: sono i 6,3 secondi di lettura per cui fu scelta (7.490) e in tempo reale
           sono giusti, ma un tick e' un MINUTO di gioco — quindi dopo un tiro la telecronaca tace per
           SETTE MINUTI di partita, ed e' li' dentro che il gol si costruisce e nessuno lo racconta.
           Mentre il gol e' pendente la pausa si scavalca. ⚠️ `_rndM()` resta estratto COMUNQUE una volta
           per tick: e' il flusso seedato della cronaca (invariante 7.511) e saltarne un'estrazione
           sposterebbe tutti i sorteggi a valle — cioe' cambierebbe la partita, non solo la sua pausa. */
        const _draw541=_rndM()<_bgProb;
        /* ⚠️ RI-TARATO DOPO IL GUARDIANO, non contro di lui. La prima stesura forzava la riga per TUTTA
           l'azione pendente, costruzione compresa: `bg-rhythm` e' sceso a 1,29x contro la soglia 1,30
           (costruzione da 5,77 a 2,91 minuti d'intervallo, sviluppo da 3,86 a 2,26) — cioe' la
           costruzione aveva smesso di respirare e scorreva come lo sviluppo. Il guardiano aveva ragione,
           e la correzione e' anche piu' vera: una telecronaca non si accende quando il pallone e' ancora
           nella propria meta', si accende quando l'azione ARRIVA. Da qui la forzatura vale solo fuori
           dalla costruzione — la rete continua ad arrivare in fondo alla sua azione, ma l'attesa prima
           resta. */
        const _forza541=(_cat559&&!!pendingGoalRef.current&&!_inHL77&&((pendingGoalRef.current.piano&&!(typeof window!=='undefined'&&window.__CPM_NO649)&&(pendingGoalRef.current.step|0)<pendingGoalRef.current.piano.length)||_advT501>=45||(!(typeof window!=='undefined'&&window.__CPM_NO644)&&(pendingGoalRef.current.righeLato|0)===0&&(pendingGoalRef.current.ticks|0)>=4)));/* [7.644.0] LA COSTRUZIONE MUTA NON RESTA MUTA: da 4 tick senza una riga del suo lato, la riga esce comunque (con la catena aperta dall'armamento e' un passo nominato). Il caso fotografato: armamento profondo + tetto-14 = gol senza NESSUNA riga del lato. *//* [7.542.0 v3] LA FINESTRA DEL RACCONTO COMINCIA A META' CAMPO, NON AL LIMITE DELL'AREA. La v2 apriva la forzatura solo fuori dalla costruzione, cioe' da avanzamento 58: ma il gol si scrive a 72, quindi l'attacco aveva solo la striscia 58-72 per farsi raccontare — due o tre tick, proprio sul filo della soglia «tre righe nei quattro minuti prima», e la misura infatti restava a 4/7. Ora la finestra si apre quando l'azione supera la meta' campo (45), che e' anche quando una telecronaca vera alza la voce. Resta fuori il palleggio nella propria meta', che e' il respiro che bg-rhythm difende. */
        const _annScena653=(!(typeof window!=='undefined'&&window.__CPM_NO653)&&!_inHL77&&direttoreRef.current&&direttoreRef.current.lib&&!direttoreRef.current.ann&&!pendingGoalRef.current&&!counterRef.current&&!outRef.current&&!spRef.current&&!ponteRef.current&&!azioneRef.current&&kickoffRef.current<=0);/* [7.653 v3: +azioneRef — le guardie della forzatura DEVONO essere le stesse del hijack, o la riga si forza e l annuncio non la prende (misurato: 1 annuncio su 5 scene) */ /* [7.653 v2] MISURATO 0 annunci su 10 scene decise: l'annuncio aspettava la lotteria delle righe con tutte le macchine libere (3-8 tick a partita). La riga della dichiarazione di scena si FORZA al primo tick buono (pattern forza541): il sorteggio resta consumato nell'ordine. */
        /* [7.666.0 — IL RITMO DELL'AZIONE. Misurato con la libreria appena innestata: l'azione
           ESCE (corner corto → la difesa si schiaccia → palla dietro → tiro dal limite → deviazione
           in angolo) ma spalmata su TREDICI minuti, perche' ogni beat aspettava il sorteggio del
           ritmo — un'azione a puntate, non un'azione. Finche' una sequenza e' aperta la riga esce a
           ogni tick: cinque beat = cinque minuti, che e' la durata dichiarata nel catalogo. La
           forzatura vale solo fuori dagli highlight e muore con l'ultimo beat. */
        /* [7.669.0 v3 — MISURATO: una sola interazione a partita, e non per mancanza di schede (ne
           bastavano quattro delle diciannove) ma per mancanza di OCCASIONI: la cronaca emette una
           ventina di righe in tutta la gara e quasi tutte se le prendono le macchine di recita. Cosi'
           l'interazione decide PRIMA se ha diritto di parlare, e in quel caso si prende il suo tick —
           come gia' fanno gli annunci di scena (7.653). Resta rara per costruzione: tetto tre, dodici
           minuti di distanza, mai dentro un highlight o sopra una scena-gol. */
        var _intxK669=null;
        if(!(typeof window!=='undefined'&&window.__CPM_NO670)&&!_inHL77&&!pendingGoalRef.current&&!_recHij545
           &&!((typeof window!=='undefined'&&window.__CPM_SAL689_ON)&&!(typeof window!=='undefined'&&window.__CPM_NO695))/* [7.695.0] NIENTE SCHEDE NUOVE SOPRA L'AZIONE: una scheda di scelta occupa mezzo telefono, e fotografata sopra l'area copriva esattamente cio' che il PO diceva di non vedere. Le interazioni erano gia' escluse durante il gol in costruzione; ora lo sono per tutta la finestra saliente, contropiedi e rigori compresi. */
           &&nx>=18&&nx<=88&&typeof INTX669!=='undefined'){try{
          const _N=narrRef669.current;
          /* [7.690.0 decisione PO: «quattro e con memoria piu' lunga»] IL TETTO SALE A QUATTRO.
             La misura diceva che il collo di bottiglia non era piu' il paniere ma il tetto: con
             trentotto schede e tre momenti a partita servivano tredici partite per vederle tutte, e le
             tre schede della finestra d'apertura tornavano di continuo. Il costo e' una pausa in piu'
             (ogni interazione ferma la gara per 35 s, tempo che il PO ha scelto lui): messa in conto,
             la distanza minima scende a 10 minuti perche' quattro momenti stiano dentro i settanta
             minuti utili della finestra 18-88. */
          if(_N.fatte.length<4&&(nx-(_N.ultima|0))>=10){
            const _sc=scoreRef.current||{home:0,away:0};
            const _mio=isMatchHome?_sc.home:_sc.away,_suo=isMatchHome?_sc.away:_sc.home;
            /* [7.689.0 direttiva PO: «le interazioni devono essere collegate anche alle indicazioni del
               mister»] IL CONTESTO SA COSA E' GIA' SUCCESSO. Finora una scheda poteva guardare solo lo
               stato della partita (minuto, punteggio, duelli); non sapeva quali schede fossero gia'
               uscite ne' quale RAMO il giocatore avesse scelto, e cosi' ogni momento era un'isola.
               Con `fatte` e `scelte` una scheda puo' rispondere a una precedente: la consegna del
               mister accettata torna quando quello spazio si apre davvero, e quella ignorata torna
               quando la panchina se ne accorge. E' cio' che trasforma tre momenti sparsi in un filo. */
            const _c669={mn:nx,diff:_mio-_suo,duelliV:_N.duelliV,duelliP:_N.duelliP,occFallite:_N.occFallite,
              giocate:_N.giocate,marcatura:_N.marcatura,golSubDaPoco:(_N.golSub>0&&(nx-(_N.golSubMn|0))<=6),eroe:"",compagno:"",
              golFatti:(_N.golFatti|0),golSub:(_N.golSub|0),eroeGol:(_N.eroeGol|0),golFattoDaPoco:((_N.golFatti|0)>0&&(nx-(_N.golFattoMn|0))<=6),eroeGolDaPoco:((_N.eroeGol|0)>0&&(nx-(_N.eroeGolMn|0))<=6),/* [7.721.0] il tabellone nel contesto delle schede */
              fatte:(_N.fatte||[]),scelte:(_N.scelte||[]),
              scelto:(id,ramo)=>{try{return (_N.scelte||[]).indexOf(id+"#"+ramo)>=0;}catch(_e){return false;}},
              haFatto:(id)=>{try{return (_N.fatte||[]).indexOf(id)>=0;}catch(_e){return false;}},
              coinv:(_N.coinv|0),fiducia:(_N.fiducia|0),intesa:(_N.intesa|0),zona:(_N.zona|0)};
            let _el=INTX669.filter(k=>_N.fatte.indexOf(k.id)<0&&(function(){try{return !!k.cond(_c669);}catch(_e){return false;}})());
            /* [7.682.0 — LA MEMORIA FRA UNA PARTITA E L'ALTRA, che nel 7.681 avevo promesso e non fatto.
               Lo stato narrativo riparte da zero a ogni gara, quindi la stessa scheda poteva ripresentarsi
               all'infinito: misurato su 8 partite, «mi_cons» apriva SETTE partite su otto e tre coppie
               (scheda, ramo) uscivano cinque volte. Qui le schede uscite nell'ULTIMA partita vengono
               escluse del tutto (se restano candidate), e quelle delle tre partite precedenti passano in
               fondo. Vive in una chiave di storage SUA: non tocca il salvataggio della carriera, e se il
               browser la nega — o e' vuota alla prima gara — la selezione si comporta esattamente come
               prima. */
            let _rec682=[];
            try{if(typeof localStorage!=='undefined'){const _r=localStorage.getItem('cpm-intx-recenti');if(_r)_rec682=JSON.parse(_r)||[];}}catch(_e682){_rec682=[];}
            if(!(typeof window!=='undefined'&&window.__CPM_NO682)&&_rec682.length&&_el.length>1){
              /* [7.690.0] MEMORIA PIU' LUNGA: l'esclusione dura copre le ULTIME DUE partite, non una.
                 Con una sola, le schede d'apertura si alternavano a coppie e tornavano ogni due gare —
                 misurato: mi_avv in tre partite su sei, mi_cons in tre, co_prima in tre. Due partite di
                 memoria le mandano in fondo abbastanza a lungo perche' le altre abbiano il loro turno. */
              const _ult=[].concat((_rec682[0]||[]),(_rec682[1]||[])).map(x=>String(x).split('#')[0]);
              const _prima=_el.filter(k=>_ult.indexOf(k.id)<0);
              if(_prima.length)_el=_prima;
              else{/* tutte gia' viste ieri: si tiene il paniere pieno, meglio una ripetizione che il silenzio */}
              const _vecchi={};for(let _i=2;_i<Math.min(5,_rec682.length);_i++)for(const _x of (_rec682[_i]||[]))_vecchi[String(_x).split('#')[0]]=1;
              const _fresche=_el.filter(k=>!_vecchi[k.id]);
              if(_fresche.length)_el=_fresche;
            }
            if(_el.length)_intxK669=_el[Math.floor(_rndM()*_el.length)];
          }
        }catch(_e){}}
        if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{window.__CPM_INTX_N=INTX669.length;}catch(_e){}}/* [7.682.0] quante schede esistono, letto dal gioco: le sonde non devono cablare un numero che cambia a ogni release */
        const _forzaIntx669=!!_intxK669;
        const _forzaLib666=!!(libAzRef666.current&&!_inHL77&&(typeof window!=='undefined'&&window.__CPM_LIB666_ON));
        if(_simEv77||(_draw541&&!_inHL77&&!_pausa485)||_forza541||_annScena653||_forzaLib666||_forzaIntx669){/* [7.528.0 v2] durante l'azione pendente le righe ESCONO e raccontano l'avanzata (la decisione F3b segue la palla che sale: sviluppo/pericolo emergono da soli — la prima stesura le sopprimeva e il guardiano bg-rhythm e' diventato CIECO: sviluppo 6 coppie, pericolo 2, contro 14/13 storici); a non muovere il pallone ci pensa il blocco _bt498 qui sotto */
          /* [7.490.0 direttiva PO §9 «eventi importanti: piu' enfasi e tempo di lettura»] LA PAUSA SI ARMA
             DOPO, E PESA L'EVENTO. Fino a qui era uniforme: un gol aveva lo stesso respiro di una rimessa
             laterale, e in un feed di testo il respiro E' l'enfasi — non c'e' altro modo di dire «questo
             conta» a chi legge. Il valore vero si assegna piu' sotto, quando l'evento e' noto (qui non lo
             e' ancora): questa riga tiene solo il minimo, cosi' nessun percorso resta senza pausa. */
          bgCoolRef.current=3;
          try{if(pendingGoalRef.current)pendingGoalRef.current.righe=(pendingGoalRef.current.righe|0)+1;}catch(_e563){}/* [7.542.0 v4] quante righe ha gia' avuto questa azione: e' la condizione perche' la rete si scriva */
          const _sc76=scoreRef.current;const _sd76=_sc76.home-_sc76.away;const _sctx76=_sd76>0?"winning":_sd76<0?"losing":"drawing";
          // Sprint 113: dedup — exclude last 3 BG events to avoid repetition
          const _lastBG=lastBGEvtRef.current;
          // G-3: detect active coach tactic from driftTargetsRef to bias BG_MATCH weights
          const _activeDriftKey=Object.keys(DRIFT_PRESETS).find(k=>DRIFT_PRESETS[k]===driftTargetsRef.current)||null;
          const _atkPd=["attack","attack_goal","wide_right"];const _defPd=["retreat","defend_goal"];
          const _isAtkTactic=_activeDriftKey&&(_atkPd.includes(_activeDriftKey)||_activeDriftKey==="attack_goal");
          const _isDefTactic=_activeDriftKey&&(_defPd.includes(_activeDriftKey)||_activeDriftKey==="retreat");
          const _noGoal77=e=>e.ef!=="team_goal"&&e.ef!=="opp_goal";// [5.77.0 MOT-1] i gol li decide SOLO il micro-sim
          /* [7.570.0 missione — NON SI ANNUNCIA UN FATTO CHE IL MOTORE NON PUO' FAR ACCADERE]
             Il giudice della cronaca (`fondate-558`) tiene aperta da tre release la famiglia peggiore:
             `fermo 0/4` — OGNI riga che annuncia un piazzato viene smentita, la palla non si ferma. Il
             7.559 ha reso il fermo un fatto vero, ma quelle righe restavano smentite lo stesso, e il
             censimento dei cancelli ha detto perche' senza lasciare dubbi: su quattro righe con `sp`,
             QUATTRO erano bloccate da `pendingGoal`. La macchina dei piazzati (7.537) non si arma mentre
             un'azione da gol e' pendente — ed e' giusto cosi': un corner in mezzo a un attacco che sta per
             concludersi non ha senso. Il difetto non e' il cancello, e' che la riga ESCE COMUNQUE: la
             telecronaca annuncia una punizione che nessuno battera' mai.
             Il rimedio sta a monte, nella pesca: finche' il motore non puo' onorare un piazzato, le righe
             che ne annunciano uno non entrano nel sorteggio. Restano UN FILTRO e non un peso — al
             contrario delle famiglie di zona (7.486/7.499, dove un filtro affamerebbe il repertorio) —
             perche' qui non si sta scegliendo COME raccontare, si sta togliendo di mezzo un'affermazione
             che sarebbe falsa in partenza; e sono 4 righe su 223, quindi il repertorio non si assottiglia.
             __CPM_NO570 = rosso: le righe di piazzato escono comunque, com'era. */
          const _spOff570=!(typeof window!=='undefined'&&window.__CPM_NO570)&&(!!pendingGoalRef.current||!!counterRef.current||kickoffRef.current>0||!!spRef.current||!!outRef.current);
          if(typeof window!=='undefined'&&(window.__CPM_REC||_CPM_TEST)){try{const _g=(window.__CPM_SP570=window.__CPM_SP570||{tick:0,off:0});_g.tick++;if(_spOff570)_g.off++;}catch(_e){}}
          /* [7.656.0 - DURANTE UN FERMO LA CRONACA NON DICHIARA VIAGGI. Rosso __CPM_NO656]
             FOTOGRAFATO (fondate-558, cluster 41'-43' su ENTRAMBI i semi): durante un fermo il
             pallone sta correttamente sul punto del fischio, ma la riga pescata dichiara
             destinazioni a 20-30u - una bugia per costruzione, e il giudice la boccia (e' la
             famiglia dominante delle 15 smentite residue). Stesso rimedio del 7.570 (filtro alla
             pesca, non peso): con un fermo vivo le righe con bpos oltre 15u dal punto escono dal
             sorteggio; passano le righe senza destinazione (commento) e quelle vicine. */
          const _fermo656=(!(typeof window!=='undefined'&&window.__CPM_NO656)&&fermoRef.current)?fermoRef.current:null;
          let eligible=BG_MATCH.filter(e=>_noGoal77(e)&&(!_spOff570||!e.sp)&&(!_fermo656||!e.bpos||Math.hypot(e.bpos.x-_fermo656.x,e.bpos.y-_fermo656.y)<=15)&&((typeof window!=='undefined'&&window.__CPM_NO646)||!pendingGoalRef.current||!e.poss||((e.poss>0?1:-1)===pendingGoalRef.current.dir))&&/* [7.646.0] durante la costruzione una riga che sposta il possesso all'ALTRO lato sarebbe una bugia (e prima del writer-guard ribaltava il turno): fuori dal sorteggio, come i piazzati del 7.570 — filtro, non peso: sono ~31 righe su 223 */(!e.minClock||nx>=e.minClock)&&(!e.maxClock||nx<=e.maxClock)&&(!e.derbyOnly||!!drby)&&(!e.ctx||e.ctx===_sctx76)&&!_lastBG.includes(e.txt)&&(!onBenchRef.current||!e.txt.includes("{P}"))&&(!e.momThreshold||(momentumRef.current>=e.momThreshold[0]&&momentumRef.current<=e.momThreshold[1])))
            .map(e=>{if(!_activeDriftKey||!e.pd)return e;if(_isAtkTactic&&_atkPd.includes(e.pd))return{...e,w:e.w*1.8};if(_isDefTactic&&_defPd.includes(e.pd))return{...e,w:e.w*1.8};return e;})
            /* [7.486.0 direttiva PO «la cronaca deve descrivere effettivamente cio' che accade»] LA RIGA
               SI SCEGLIE DA DOVE SI STA GIOCANDO. Fino a qui la selezione guardava minuto, punteggio,
               momentum e tattica del mister — mai il pallone. MISURATO su 71 righe: le voci DIFENSIVE
               uscivano con la palla nella meta' avversaria 4 volte su 6, e la zona dichiarata distava
               dalla zona vera 52,8 (defend_goal: dichiara x=9 con la palla a 61,8), 66,3 (retreat), 49,4.
               Cioe' la telecronaca raccontava un'altra partita, e poi TRASCINAVA il pallone dall'altra
               parte del campo per darsi ragione. Ora la distanza fra la zona dichiarata e quella vera
               pesa: vicino si premia, lontano si smorza — un peso e non un filtro, perche' un filtro
               affamerebbe il repertorio e ricomparirebbero le ripetizioni. */
            .map(e=>{
              /* [7.576.0 — LA RIGA SI SCEGLIE DA DOVE IL PALLONE STA ANDANDO, NON DA DOV'E' RIMASTO,
                 rosso __CPM_NO576] Il peso di zona del 7.486 misura la distanza dal pallone. Giusto quando
                 il pallone e' fermo o lo muove la riga stessa; SBAGLIATO mentre un gol e' in costruzione,
                 perche' li' e' la recita a guidarlo (+3u a tick verso l'area) e la destinazione dichiarata
                 dalla riga viene SCARTATA per scelta (r. ~2650). La riga finiva cosi' a descrivere il punto
                 che il pallone sta lasciando, e la sua promessa non veniva mantenuta da nessuno.
                 MISURATO col registro esteso del 7.576 (`bex/bey`: dove il motore manda DAVVERO il pallone)
                 su 6 partite: 70 righe su 128 dichiarano una destinazione che il motore non applica mai, e
                 29 di quelle risultano bugiarde al giudice. Di quelle 70, QUARANTOTTO sono righe normali —
                 non recitate, non piazzate: sono proprio queste, emesse durante un'azione pendente.
                 Ora, mentre il gol si costruisce, il peso guarda il BERSAGLIO della recita invece della
                 posizione: la riga scelta descrive dove il pallone sta effettivamente per arrivare. */
              const _bp528=(!(typeof window!=='undefined'&&window.__CPM_NO576)&&pendingGoalRef.current&&ballTargetRef.current)?{x:ballTargetRef.current.x,y:ballTargetRef.current.y}:(ballPosRef.current||{x:50,y:50});
              if(typeof window!=='undefined'&&window.__CPM_NO486)return e;/* prova del rosso 7.486: nessun peso di zona */
              if(typeof window!=='undefined'&&window.__CPM_NO528){const _dzx=Math.abs((e.bpos?e.bpos.x:50)-_bp528.x);return{...e,w:e.w*(_dzx<=18?2.4:_dzx<=32?1:_dzx<=48?0.35:0.12)};}/* rosso 7.525: pesi 7.486 storici, solo-x */
              /* [7.525.0 collaudo PO «la palla va sbattendo, non ci sono schemi») LE RIGHE SEGUONO LA TRAMA.
                 Il peso 7.486 era solo-x: una riga di fascia OPPOSTA (stessa x, y a 60u) pesava come una
                 vicina, e ogni estrazione lontana e' uno strattone attraverso il campo. Ora la distanza e'
                 2D (y compresso 0,6: il campo e' largo la meta') e le bande lontane crollano (0,35→0,18 ·
                 0,12→0,05): la riga racconta dove il gioco STA, gli spostamenti grossi restano ai gol. */
              const _d2528=Math.hypot((e.bpos?e.bpos.x:50)-_bp528.x,((e.bpos?e.bpos.y:50)-_bp528.y)*0.6);
              return{...e,w:e.w*(_d2528<=18?3.0:_d2528<=32?1:_d2528<=48?0.18:0.05)};})
            /* [7.499.0 F3b — LA SIMULAZIONE DECIDE L'EVENTO, LA CRONACA LO DESCRIVE]
               Il 7.486 aveva gia' fatto pesare la DISTANZA fra la zona dichiarata dalla riga e quella
               vera del pallone. Restava pero' che nessuno DECIDESSE prima cosa sta succedendo: la riga
               usciva da un sorteggio e poi la sua `pd` diventava la verita' — muove la forma della
               squadra, sceglie l'arco, nomina il reparto. Qui la decisione viene PRIMA ed e' funzione
               dello stato reale, e la riga si pesca per DESCRIVERLA. E' l'inversione che F3a aveva
               iniziato sul «dove va il pallone», portata al «cosa sta succedendo».
               ⚠️ RESTA UN PESO, NON UN FILTRO, per la ragione gia' scritta nel 7.486: un filtro
               affamerebbe il repertorio (73 righe su 188 sono `midfield`, `wide_right` ne ha 11 e
               `opp_goal` una sola) e le ripetizioni tornerebbero. La famiglia decisa si premia, le
               confinanti restano possibili, le opposte si smorzano. */
            /* ⚠️ [7.501.0 F5] IL PREMIO SCALA COL REPERTORIO. Un moltiplicatore unico (era x3) non regge
               quando le famiglie hanno taglie molto diverse: `midfield` ha 73 righe, `attack_goal` 27,
               `defend_goal` 17, `wide_right` 11 — e la massa del centrocampo vinceva comunque. Finche' la
               cronaca era spalmata uniformemente non si vedeva; appena F5 ha spostato le righe verso la
               fase PERICOLO (densita' x1,30, dove le famiglie sono le piu' sottili) l'accordo esatto e'
               crollato da 69,0% a 51,3% e il guardiano `bg-decision` e' diventato rosso. Non si abbassa
               la soglia: si corregge la causa — le famiglie piccole hanno bisogno di un premio piu' alto
               per competere, ed e' esattamente cio' che «descrivere l'evento deciso» richiede. */
            .map(e=>{if(typeof window!=='undefined'&&window.__CPM_NO499)return e;/* prova del rosso */
              if(!e.pd||!_dec499)return e;
              if(e.pd===_dec499)return{...e,w:e.w*((_dec499==="attack_goal"||_dec499==="defend_goal"||_dec499==="wide_right")?7.0:3.0)};
              return{...e,w:e.w*((_VIC499[_dec499]||[]).indexOf(e.pd)>=0?0.8:0.14)};});
          /* [7.577.0 — UNA RIGA CHE CHIEDE PIU' DI QUANTO IL MOTORE CONCEDE E' FALSA IN PARTENZA,
             rosso __CPM_NO577] Il peso di zona del 7.486/7.525 rende IMPROBABILI le righe lontane, non
             impossibili: oltre le 32 unita' il peso e' 0,18, e su sei partite QUATTORDICI righe sono
             uscite comunque dichiarando 36-66u di spostamento. Ma il motore ne concede al massimo 30 per
             riga (freno 7.498/7.528): quelle righe non potevano essere mantenute NEMMENO IN LINEA DI
             PRINCIPIO — la cronaca annunciava una parata del portiere col pallone a meta' campo.
             Qui vale la stessa distinzione gia' scritta nel 7.570 per i piazzati: il PESO sceglie COME
             raccontare, il FILTRO toglie di mezzo un'affermazione falsa in partenza. E come li', il
             filtro e' l'unico strumento onesto, perche' un peso basso non e' zero.
             DUE ESENZIONI, entrambe per ragioni gia' scritte altrove: i GOL (esenti dal freno per scelta
             del 7.525, «il volo fino in rete e' suo di diritto») e le righe senza destinazione, che non
             affermano niente da smentire. E una GUARDIA: se il filtro svuotasse il repertorio, non si
             applica — meglio una riga lontana che nessuna riga (il ripiego del 7.486 vale ancora). */
          if(!(typeof window!=='undefined'&&window.__CPM_NO577)){
            const _bp577=(!(typeof window!=='undefined'&&window.__CPM_NO576)&&pendingGoalRef.current&&ballTargetRef.current)?{x:ballTargetRef.current.x,y:ballTargetRef.current.y}:(ballPosRef.current||{x:50,y:50});
            /* ⚠️ [7.579.0] PROVATO E REVOCATO CON LA SUA MISURA: stringere il raggio della pesca da 30u a
               14u quando la riga non comanda piu' il pallone («una riga che descrive deve descrivere da
               vicino»). Sembrava il completamento naturale dell'inversione; la misura dice il contrario —
               scarto MEDIANO 6,9u -> 8,4u, p90 21,2 -> 31,7, peggiore 35,3 -> 61,7. Il raggio stretto
               affama il repertorio e la guardia ripiega troppo spesso sul pool intero, che non ha filtro
               affatto: stringere il cancello lo apriva. Il raggio resta quello del tetto. */
const _vic577=eligible.filter(e=>!!e.ef||!e.bpos||Math.hypot(e.bpos.x-_bp577.x,(e.bpos.y-_bp577.y)*0.6)<=30);
            if(typeof window!=='undefined'&&(window.__CPM_REC||_CPM_TEST)){try{const _g=(window.__CPM_F577=window.__CPM_F577||{tick:0,tolte:0,vuoto:0});_g.tick++;_g.tolte+=(eligible.length-_vic577.length);if(!_vic577.length)_g.vuoto++;}catch(_e){}}
            if(_vic577.length)eligible=_vic577;
          }
          if(typeof window!=='undefined'&&window.__CPM_SPBOOST)eligible=eligible.map(e=>e.sp?{...e,w:e.w*30}:e);/* [7.530.0 SOLO COLLAUDO] gonfia le righe `sp` per testare le recite in volo senza aspettare la pesca: flag spento = mappa identica */
          let ev=_simEv77||wPick(eligible.length>0?eligible:BG_MATCH.filter(e=>_noGoal77(e)&&(!e.minClock||nx>=e.minClock)&&(!e.maxClock||nx<=e.maxClock)&&(!onBenchRef.current||!e.txt.includes("{P}"))),_rndM);
          /* [7.530.0 collaudo PO «Non si riparte dal centro dopo un gol!» — rosso __CPM_NO536] LA RIPARTENZA
             SI RECITA: durante la finestra kickoff la riga GIA' SORTEGGIATA (il sorteggio e' consumato: ordine
             intatto, lezione 7.511) viene dirottata su una battuta di calcio d'inizio con palla al centro.
             La riga pescata si scarta: niente sue statistiche/formazione in una fase in cui il gioco e' fermo.
             I gol del microsim restano esenti (come nel gol costruito 7.528). */
          var _koHij536=false;var _recHij545=false;var _recKind546=null,_recSide546=null;/* [7.533.0 MP-0a] la macchina che dirotta DICHIARA chi e' (kind) e per chi gioca (side): il lato non si indovina piu' a valle con una regex su ef *//* [7.532.0] riga DIROTTATA da una macchina questo tick: nel registro va marcata (rec:1) — le recite hanno pd=dec per costruzione e pool finiti: dentro le metriche gonfiavano l'accordo (88,6%) e affamavano la varieta' (54,3%<55) del repertorio PESCATO */
          if(kickoffRef.current>0&&!/goal$/.test(String(ev.ef||""))&&!(typeof window!=='undefined'&&window.__CPM_NO536)){
            const _ko536=kickoffRef.current;kickoffRef.current=_ko536-1;_koHij536=true;_recHij545=true;_recKind546="kickoff";_recSide546=kickoffSideRef.current;
            {const _rv536=(recVarRef.current=(recVarRef.current+1)|0);/* pool 4: il guardiano varieta' mette in fila PIU' partite e i pool da 2 si ripetevano fra match (54,5%<55) */
            const _K1=["🔁 La palla torna al centro: si riparte dal calcio d'inizio.","⭕ Tutto fermo un istante: palla sul cerchio, si ricomincia.","🟢 Le squadre si ridispongono: nuovo possesso dal centrocampo.","⚽ Palla al centro e arbitro pronto: si torna a giocare."];
            const _K2H=["⚪ Tocca a noi ricominciare — primo appoggio corto dal cerchio.","⚪ Palla nostra al centro: si riparte con ordine.","⚪ Ripartiamo noi: giro palla basso per riprendere fiducia.","⚪ Il nostro regista tocca per primo: possesso e pazienza."];
            const _K2A=["⚪ Gli avversari rimettono in gioco dal centro.","⚪ Rimessa dal centro per loro: pressione subito alta.","⚪ Riparte {A}: la nostra prima linea va subito a schermare.","⚪ {A} tocca dal cerchio e prova a scuotersi."];
            ev={txt:_ko536===2?_K1[_rv536%4]:(kickoffSideRef.current==="home"?_K2H[_rv536%4]:_K2A[_rv536%4]),ef:null,w:1,bpos:{x:50,y:50},pd:_dec499};}}
          /* [7.530.0 collaudo PO «non ci sono calci d'angolo, rigori, punizioni, falli in cronaca — è ancora
             molto trigger di passaggi quasi casuali» — rosso __CPM_NO537] LE GIOCATE PIAZZATE SI RECITANO.
             Una riga marcata `sp` APRE una giocata; le righe successive gia' sorteggiate vengono dirottate
             sui passi della recita (stesso pattern del kickoff: sorteggio consumato, ordine intatto, la riga
             pescata si scarta). La risoluzione e' DETERMINISTICA (hashStr su testo sorteggiato+minuto: stesso
             save → stessa recita) e NON SEGNA MAI: i gol restano monopolio del microsim (integrita' del
             punteggio) — l'esito massimo e' l'occasione. Il rigore ambientale quindi esce solo parato/alto:
             dichiarato, non nascosto. */
          {const _no537=(typeof window!=='undefined'&&window.__CPM_NO537);
          /* ⚠️ `!_koHij536`: il dirottamento kickoff decrementa il conto A ZERO nello stesso giro — senza il
             flag la macchina sp vedeva via libera e SOVRASCRIVEVA la seconda battuta di ripartenza (misurato
             in sonda: riga [22], «Tocca a noi ricominciare» mangiata da «Punizione battuta corta») */
          /* [7.559.0 blocco 4 — LA BATTUTA DELL'INTERRUZIONE. Stesso schema collaudato di kickoff e sp:
             il sorteggio della riga e' gia' avvenuto (l'ordine dei sorteggi resta intatto), la battuta
             DIROTTA il testo. Due tempi: (1) il fischio — la palla e' sul punto e il gioco e' fermo;
             (2) la rimessa in gioco — la palla riparte da li'. Il fermo vero lo tiene `fermoRef`. */
          if(outRef.current&&!outRef.current.mute632&&!_recHij545&&!(typeof window!=='undefined'&&window.__CPM_NO559)&&kickoffRef.current<=0&&!pendingGoalRef.current&&!/goal$/.test(String(ev.ef||""))){/* [7.632 v7] il fischio muto non prende righe: si risolve in silenzio */
            const _o=outRef.current;_o.step++;if(_o.step===1)outStoryRef.current++;_recHij545=true;_recKind546="out_"+_o.kind;_recSide546=_o.nostra?"home":"away";
            const _ro=(Math.abs(hashStr("out|"+nx+"|"+_o.kind+"|"+_o.step))%100)/100;
            const _N=_o.nostra?"{H}":"{A}";
            if(_o.step===1){
              ev=_o.kind==="throw"?{txt:"⏸️ Palla sul fondo della fascia: rimessa laterale per "+_N+".",ef:null,w:1,bpos:{x:_o.x,y:_o.y},pd:_dec499}
               :_o.kind==="corner"?{txt:"🚩 Calcio d'angolo per "+_N+": palla sulla bandierina.",ef:null,w:1,bpos:{x:_o.x,y:_o.y},ms:{corners:1},pd:_dec499}
               :_o.kind==="goal_kick"?{txt:"🧤 Pallone sul fondo: rinvio dal fondo per "+_N+".",ef:null,w:1,bpos:{x:_o.x,y:_o.y},pd:_dec499}
               :_o.pen629?(_o.nostra?{txt:"📢 RIGORE! Fallo in piena area su di noi: l'arbitro indica il dischetto.",ef:null,w:1,bpos:{x:94,y:50},ms:{fouls:1},sp:"pen_for",pd:_dec499}
                                    :{txt:"😨 Rigore per {A}: fallo in area nostra, il fischio non lascia dubbi.",ef:null,w:1,bpos:{x:6,y:50},ms:{fouls:1},sp:"pen_against",pd:_dec499})
               :{txt:"🟡 Fischia l'arbitro: fallo, punizione per "+_N+".",ef:null,w:1,bpos:{x:_o.x,y:_o.y},ms:{fouls:1},pd:_dec499};
              /* [7.629.0 — IL RIGORE NASCE DAL FALLO, NON DAL SORTEGGIO. Rosso __CPM_NO629 (a monte).
                 Collaudo PO 7.627: «ZERO schemi, punizioni, rigori». Il fallo in area E' un rigore — regola
                 del calcio, non probabilita' extra: quando l'armamento ha marcato `pen629` la riga del
                 fischio annuncia il rigore e porta `sp`, cosi' la macchina dei piazzati ESISTENTE recita
                 dischetto ed esito (parato/alto — i gol restano al microsim, vincolo 7.530 dichiarato).
                 Un solo binario, nessuna seconda macchina: qui si spegne solo la battuta di punizione. */
              if(_o.pen629){outRef.current=null;_recKind546="out_pen";
                /* [7.629.0 v2 — IL TESTIMONE PASSA DI MANO, NON PER POSTA] La v1 lasciava armare la
                   macchina sp al giro generico su `ev.sp` (r.~2633 piu' in basso), che pretende un tick
                   con contropiede e gol-pendente spenti: misurato su seed 512, il fischio «RIGORE!»
                   usciva al 32' e il dischetto MAI — la riga annunciava e spariva. Qui l'armamento e'
                   ATOMICO col fischio (pattern kickoff 7.530): il gioco e' gia' fermo per definizione,
                   non c'e' precedenza da contendere. Catena e armamento counter cedono da soli
                   (`!spRef.current` nei loro cancelli); il dirottamento sp NON mangia questa stessa
                   riga grazie alla guardia `!_recHij545` sul suo cancello. */
                const _pk629=_o.nostra?"pen_for":"pen_against",_px629=_o.nostra?94:6;
                spRef.current={kind:_pk629,step:0,y:50,x:_px629,sx:_px629,sy:50,t0:Date.now()};
                fermoRef.current={x:_px629,y:50,t:5,kind:_pk629};
                ballTargetRef.current={x:_px629,y:50};}
            } else {
              outRef.current=null;fermoRef.current=null;
              /* [7.572.0 — LA RIMESSA LATERALE RIMANDA IL PALLONE DENTRO IL CAMPO, e questo difetto l'ho
                 introdotto io al 7.559 e trovato con il giudice che ho riparato un'ora fa.
                 La misura: le destinazioni piu' sbagliate della cronaca erano TUTTE righe `defend_goal`, e
                 confrontando il punto dichiarato con dove sta il pallone il difetto si legge in chiaro —
                 dichiara (6,50) e il pallone sta a (8,98); dichiara (16,48) e sta a (8,99). La x e' giusta,
                 la Y E' INCHIODATA ALLA LINEA LATERALE. L'unica riga in tutto il gioco che porta la y a 98
                 e' la mia rimessa (r.~2926), e la sua battuta la rimetteva in gioco con uno scarto
                 simmetrico di +-15: da 98 restava fra 83 e 94, cioe' ancora sulla linea. Il pallone
                 rimaneva a bordo campo per minuti mentre la telecronaca raccontava il centro dell'area.
                 Una rimessa vera va DENTRO: lo scarto qui e' orientato verso il campo, non simmetrico.
                 ⚠️ MA QUESTO DA SOLO NON BASTAVA, e la misura l'ha detto subito: con la sola correzione
                 dello scarto il pallone restava a (8,98) agli stessi minuti. Perche' questa battuta si
                 prende solo una RIGA LIBERA — e quando la riga libera non arriva, l'interruzione scade per
                 ttl e nessuno rimette il pallone in gioco: `fermoRef` si spegne ma `ballTargetRef` resta
                 puntato sul punto della rimessa. Il vero rimedio sta nella SCADENZA (vedi la rimessa
                 silenziosa nel tick), non qui. __CPM_NO572 = rosso: lo scarto simmetrico di prima. */
              const _dentro572=!(typeof window!=='undefined'&&window.__CPM_NO572)&&_o.kind==="throw";
              const _rx=clamp(_o.x+(_o.nostra?14:-14),6,94);
              const _ry=_dentro572?clamp(_o.y>=50?_o.y-(16+_ro*26):_o.y+(16+_ro*26),8,92):clamp(_o.y+(_ro-0.5)*30,6,94);
              ev=_o.kind==="throw"?{txt:"↩️ Rimessa in gioco, "+_N+" riparte dalla linea laterale.",ef:null,w:1,bpos:{x:_rx,y:_ry},at:"pass",pd:_dec499}
               :_o.kind==="corner"?(_ro<0.5?{txt:"💥 Traversone dalla bandierina: mischia in area!",ef:null,w:1,bpos:{x:_o.nostra?92:8,y:50},at:"cross",pd:_dec499}
                                            :{txt:"⚡ Angolo battuto corto: si riparte dal possesso.",ef:null,w:1,bpos:{x:_o.nostra?84:16,y:_ry},pd:_dec499})
               :_o.kind==="goal_kick"?{txt:"🦶 Rinvio lungo del portiere: si torna a giocare.",ef:null,w:1,bpos:{x:_o.nostra?52:48,y:_ry},at:"pass",pd:_dec499}
               :{txt:"⚪ Punizione battuta: il gioco riprende.",ef:null,w:1,bpos:{x:_rx,y:_ry},at:"pass",pd:_dec499};
            }
          }
          /* [7.559.0] L'INTERRUZIONE NON PUO' RESTARE APPESA. La battuta si prende solo una riga libera, e
             una riga libera puo' non arrivare: senza scadenza `outRef` resterebbe armato per sempre e
             bloccherebbe ogni interruzione successiva. Quattro tick e decade — il fermo c'e' stato comunque. */
          if(outRef.current&&!(typeof window!=='undefined'&&window.__CPM_NO559)){
            /* [7.632.0 v2] IL FISCHIO NON PAGA LE RIGHE CHE NON POTEVA PRENDERE: prima misura del cap
               20s = out_foul fermo a 3/8, e il perche' e' questa riga — il ttl scala su OGNI riga
               sorteggiata, anche quelle negate all'hijack da gol-pendente/kickoff/riga-goal. Quattro
               righe negate e il fischio moriva muto nonostante il cap. Ora il conto scala solo sulle
               righe che l'hijack poteva davvero prendere; il cap 20s resta la rete di sicurezza. */
            const _nega632=(typeof window!=='undefined'&&window.__CPM_NO632)?false:(pendingGoalRef.current||kickoffRef.current>0||_koHij536||/goal$/.test(String(ev.ef||"")));
            if(typeof window!=='undefined'&&window.__CPM_REC){try{const _w=(window.__CPM_OUTDIE632=window.__CPM_OUTDIE632||{righe:0,negate:0,ttl:0});_w.righe++;if(_nega632)_w.negate++;}catch(_e){}}
            if(!_nega632&&(--outRef.current.ttl<=0)){if(typeof window!=='undefined'&&window.__CPM_REC){try{window.__CPM_OUTDIE632.ttl++;}catch(_e){}}outRef.current=null;fermoRef.current=null;}}
          /* [7.559.0 strumento] PERCHE' IL FISCHIO NON ARRIVA. Il primo giro del guardiano `fermo-559` ha
             dato «fermi armati: 0» con quattro righe che dichiaravano un piazzato: il ramo di armamento non
             e' mai scattato, e i cancelli sono cinque. Qui si conta QUALE lo ferma, invece di indovinare. */
          if(typeof window!=='undefined'&&window.__CPM_REC&&ev.sp){try{const _g=(window.__CPM_SPGATE559=window.__CPM_SPGATE559||{visti:0,no537:0,gia:0,kickoff:0,gol:0,counter:0,passa:0});
            _g.visti++;
            if(_no537)_g.no537++;else if(spRef.current)_g.gia++;else if(kickoffRef.current>0)_g.kickoff++;else if(pendingGoalRef.current)_g.gol++;else if(counterRef.current)_g.counter++;else _g.passa++;}catch(_e){}}
          if(typeof window!=='undefined'&&window.__CPM_REC&&spRef.current){try{const _g=(window.__CPM_SPHIJ629=window.__CPM_SPHIJ629||{visti:0,no537:0,ko:0,rec:0,goal:0,kickoff:0,pg:0,passa:0,min:[]});_g.visti++;if(_no537)_g.no537++;else if(_koHij536)_g.ko++;else if(_recHij545)_g.rec++;else if(/goal$/.test(String(ev.ef||"")))_g.goal++;else if(kickoffRef.current>0)_g.kickoff++;else if(pendingGoalRef.current)_g.pg++;else _g.passa++;if(_g.min.length<40)_g.min.push({m:nx,st:spRef.current.step,k:spRef.current.kind});}catch(_e){}}/* [7.629.0 strumento] QUALE cancello ferma la recita piazzata, riga per riga: il dischetto senza esito (seed 512) non si spiega a occhio */
          if(!_no537&&!_koHij536&&!_recHij545&&spRef.current&&!/goal$/.test(String(ev.ef||""))&&kickoffRef.current<=0&&(!(typeof window!=='undefined'&&window.__CPM_NO629B)||!pendingGoalRef.current)){/* [7.629.0] `!_recHij545`: se la macchina out ha appena scritto questa riga (il fischio del rigore arma spRef NELLO STESSO giro), il dischetto aspetta la riga dopo — prima il fischio si legge, poi si recita */
            /* [7.629.0 — LA CERIMONIA ARMATA HA PRECEDENZA SULLA COSTRUZIONE DEL GOL. Stesso rosso NO629B.
               CENSIMENTO DEL CANCELLO (seed 512): dischetto al 39', poi pg=4 — il pendingGoal del gol
               microsim (away, 50') chiude il cancello dal 40' e la valvola stacca al 57': esito MAI.
               La precedenza e' sicura per una garanzia d'ordine gia' scolpita: spRef NON PUO' armarsi
               sopra un pendingGoal attivo (lo vietano il fischio out, r.~2557, e l'armamento su ev.sp,
               r.~2633). Se la macchina sp e' viva, era li' PRIMA: si chiude in una-due righe e la
               costruzione riprende con tutte le sue. Il gol resta del microsim, sempre. */
            const _sp=spRef.current;_sp.step++;if(!(typeof window!=='undefined'&&window.__CPM_NO629B))_sp.t0=Date.now();/* [7.629.0 — LA RECITA CHE AVANZA NON SCADE] la scadenza 7.602 conta l'INATTIVITA', non la vita intera: ogni passo rinfresca l'orologio */_recHij545=true;_recKind546="sp_"+_sp.kind;_recSide546=(_sp.kind==="corner_against"||_sp.kind==="pen_against")?"away":"home";/* [7.629.0] anche il rigore contro gioca per loro */
            const _r537=(Math.abs(hashStr(String(ev.txt||"")+"|"+nx+"|sp"))%100)/100;
            if(_sp.kind==="corner_for"){
              if(_sp.step===1)ev={txt:"⚪ {H} si incarica del traversone: palla sistemata sul vertice.",ef:null,w:1,bpos:{x:98,y:_sp.y},pd:_dec499};
              else{spRef.current=null;
                ev=_r537<0.30?{txt:"💥 Traversone dal corner: incornata di {H2}! Fuori di un soffio.",ef:null,w:1,bpos:{x:96,y:44},ms:{shots:1},at:"cross",pd:_dec499,tn617:-1}
                 :_r537<0.58?{txt:"🧤 Corner in mezzo: esce il portiere di {A} e fa sua la palla.",ef:null,w:1,bpos:{x:94,y:50},at:"cross",pd:_dec499,tn617:-1}
                 :_r537<0.85?{txt:"🛡️ Cross dal vertice respinto: la difesa di {A} libera ai margini dell'area.",ef:null,w:1,bpos:{x:74,y:52},at:"cross",pd:_dec499,tn617:-1}
                 :{txt:"⚡ Corner battuto corto: {H} e {H2} tengono il possesso sulla fascia.",ef:null,w:1,bpos:{x:84,y:78},pd:_dec499,tn617:1};}}
            else if(_sp.kind==="corner_against"){
              if(_sp.step===1)ev={txt:"⚠️ Corner per {A}: palla al vertice, la nostra area si affolla.",ef:null,w:1,bpos:{x:2,y:_sp.y},pd:_dec499};
              else{spRef.current=null;
                ev=_r537<0.35?{txt:"🧤 Il nostro portiere esce sul cross e smanaccia: pericolo sventato.",ef:null,w:1,bpos:{x:8,y:46},pd:_dec499,tn617:1}
                 :_r537<0.70?{txt:"🛡️ Testa della difesa: spazzata lunga fuori area.",ef:null,w:1,bpos:{x:28,y:50},pd:_dec499,tn617:1}
                 :{txt:"😨 Incornata di {A} sugli sviluppi del corner! Alta di un soffio.",ef:null,w:1,bpos:{x:4,y:52},ms:{oppShots:1},at:"shot",pd:_dec499,tn617:1};}}
            else if(_sp.kind==="foul_for"){
              spRef.current=null;/* un passo: la punizione si batte */
              ev=(_sp.x>=68)?(_r537<0.45?{txt:"🎯 Punizione dal limite: {H} calcia forte — deviazione in angolo!",ef:null,w:1,bpos:{x:90,y:60},ms:{shots:1},at:"shot",pd:_dec499,tn617:1}
                     :_r537<0.75?{txt:"↗ Punizione pennellata in area: la difesa di {A} respinge di testa.",ef:null,w:1,bpos:{x:80,y:50},at:"cross",pd:_dec499,tn617:-1}
                     :{txt:"💨 Punizione alta sopra la barriera, sopra la traversa.",ef:null,w:1,bpos:{x:95,y:42},ms:{shots:1},at:"shot",pd:_dec499,tn617:-1})
                 :{txt:((recVarRef.current=(recVarRef.current+1)|0)%2)?"⚪ Punizione battuta corta: {H} fa ripartire il giro palla.":"⚪ {H} sceglie la gestione: punizione rapida e possesso consolidato.",ef:null,w:1,bpos:{x:clamp(_sp.x,20,70),y:55},pd:_dec499};}
            else if(_sp.kind==="pen_for"){
              if(_sp.step===1)ev={txt:"😶 {H} sul dischetto. Lo stadio trattiene il fiato…",ef:null,w:1,bpos:{x:94,y:50},pd:_dec499};
              else{spRef.current=null;
                ev=_r537<0.60?{txt:"🧤 PARATO! Il portiere di {A} intuisce l'angolo e respinge il rigore!",ef:null,w:1,bpos:{x:90,y:47},ms:{shots:1},at:"shot",pd:_dec499,tn617:-1}
                 :{txt:"😱 Rigore alto! {H} si prende la testa fra le mani.",ef:null,w:1,bpos:{x:97,y:45},ms:{shots:1},at:"shot",pd:_dec499,tn617:-1};}}
            else if(_sp.kind==="pen_against"){/* [7.629.0] il rigore CONTRO: prima d'ora l'arbitro fischiava rigori solo per noi — mezza regola. Stesso vincolo: mai gol per costruzione */
              if(_sp.step===1)ev={txt:"😶 {A} dal dischetto: il nostro portiere resta sulla linea, occhi negli occhi…",ef:null,w:1,bpos:{x:6,y:50},pd:_dec499};
              else{spRef.current=null;
                ev=_r537<0.60?{txt:"🧤 PARATO! Il nostro portiere vola sull'angolo e respinge il rigore di {A}!",ef:null,w:1,bpos:{x:10,y:53},ms:{oppShots:1},at:"shot",pd:_dec499,tn617:1}
                 :{txt:"😮‍💨 Dal dischetto {A} calcia alto! Il pericolo piu' grande sfuma da solo.",ef:null,w:1,bpos:{x:3,y:55},ms:{oppShots:1},at:"shot",pd:_dec499,tn617:1};}}
            else spRef.current=null;
            if(!spRef.current)fermoRef.current=null;/* [7.559.0] la battuta rimette in gioco: il fermo finisce qui, e il `bpos` della battuta e' la nuova destinazione */}
          else if(!_no537&&!spRef.current&&ev.sp&&kickoffRef.current<=0&&!pendingGoalRef.current&&!counterRef.current){
            spRef.current={kind:ev.sp,step:0,y:(ev.bpos&&ev.bpos.y>=50)?95:5,x:(ev.bpos&&ev.bpos.x)||60,t0:Date.now()};/* [7.602.0] anche l'ora */
            /* [7.559.0] IL FISCHIO FERMA IL GIOCO. Il punto e' lo stesso che la battuta usera' un tick dopo
               (bandierina, dischetto, punto del fallo): cosi' il pallone non fa due viaggi, ne fa uno e
               aspetta li'. Cinque tick sono ~1,5s reali: il tempo di arrivarci e di STARE fermo per almeno
               due minuti di gioco pieni — che e' quello che il giudice pretende per dire «si e' fermata». */
            if(!(typeof window!=='undefined'&&window.__CPM_NO559)){
              const _sy559=(ev.bpos&&ev.bpos.y>=50)?95:5;
              const _fsp559=(ev.sp==="corner_for")?{x:98,y:_sy559}
                :(ev.sp==="corner_against")?{x:2,y:_sy559}
                :(ev.sp==="pen_for")?{x:94,y:50}
                :(ev.sp==="pen_against")?{x:6,y:50}/* [7.629.0] dischetto nostro */
                :{x:clamp((ev.bpos&&ev.bpos.x)||60,10,90),y:clamp((ev.bpos&&ev.bpos.y)||50,6,94)};
              fermoRef.current={x:_fsp559.x,y:_fsp559.y,t:5,kind:ev.sp};
              if(spRef.current){spRef.current.sx=_fsp559.x;spRef.current.sy=_fsp559.y;}/* [7.629.0] il punto della cerimonia viaggia con la macchina: serve a ri-tenere la palla se il fermo scade prima della riga dopo */
              if(typeof window!=='undefined'&&window.__CPM_REC){try{const _w=(window.__CPM_FERMO559=window.__CPM_FERMO559||{n:0,tipi:{}});_w.n++;_w.tipi[ev.sp]=(_w.tipi[ev.sp]||0)+1;}catch(_e){}}}}}
          /* [7.532.0 collaudo PO «troppo centrocampo, niente ribaltamenti» — rosso __CPM_NO542] IL RIBALTAMENTO
             SI RECITA: un recupero (riga con poss di segno opposto) in zona PROFONDA apre il contropiede — la
             riga sorteggiata diventa la battuta di lancio (pattern kickoff/sp: sorteggio consumato, ordine
             intatto), la palla vola nel blocco d'avanzata (5u/tick), le righe in volo raccontano la corsa e
             all'arrivo la risoluzione NON SEGNA MAI (i gol restano al microsim). Gate deterministico al 45%
             dei recuperi profondi (hash su testo+minuto), mai sopra un'altra macchina. */
          {const _pgH649=pendingGoalRef.current;/* [7.649.0] LA RIGA RENDE L'EVENTO DEL PIANO: precedenza sotto kickoff e fischi vivi, sopra contropiede e catena */
          if(_pgH649&&_pgH649.piano&&!(typeof window!=='undefined'&&window.__CPM_NO649)&&(_pgH649.step|0)<_pgH649.piano.length&&!/goal$/.test(String(ev.ef||""))&&!_koHij536&&kickoffRef.current<=0&&!outRef.current&&!spRef.current&&!fermoRef.current){
            const _pe649=_pgH649.piano[_pgH649.step|0];_pgH649.step=(_pgH649.step|0)+1;
            _recHij545=true;_recKind546="manovra-gol";_recSide546=_pgH649.dir>0?"home":"away";
            ev={txt:_pe649.t,ef:null,w:1,bpos:{x:clamp(_pe649.x,4,96),y:clamp(_pe649.y,6,94)},pd:_dec499,at:"pass",_piano649:1,ms:_pe649.ms?(_pgH649.dir>0?{shots:1}:{oppShots:1}):null};
            if(_pe649.gk&&!(typeof window!=='undefined'&&window.__CPM_NO695)){gkSave695.current={t:Date.now(),side:_pgH649.dir>0?"home":"away"};_pgH649.esito703=_pe649.esito||null;/* [7.702.0] l'esito da regolamento dichiarato dal TESTO: alla chiusura arma la palla morta corrispondente *//* [7.695.0] la riga che NOMINA il portiere accende il tuffo: una sola fonte, il testo e il gesto non possono divergere */
              if(typeof window!=='undefined'&&window.__CPM_REC){try{const _w=(window.__CPM_OCC695=window.__CPM_OCC695||{armate:0,parate:0,min:[]});_w.parate++;}catch(_e){}}}
            if(_pe649.chi!=null&&!(typeof window!=='undefined'&&window.__CPM_NO641))carrierRef.current={i:_pe649.chi};/* il protagonista dell'evento e' il portatore */
            if(!(typeof window!=='undefined'&&window.__CPM_NO693)){pianoLock693.current=3;_pgH649.lastTg={x:clamp(_pe649.x,4,96),y:clamp(_pe649.y,6,94)};/* [7.693.0] dove il racconto ha mandato il pallone l'ultima volta: la rete aspetta che ci ARRIVI *//* [7.693.0] tre tick di custodia: questo, piu' i due in cui il pallone viaggia */
              /* [7.693.0] IL RICEVENTE VA DOVE VA LA PALLA. Spostare solo il pallone lo lascerebbe senza
                 padrone (e la banda custodia del guardiano andrebbe giu' per un difetto che non c'e'):
                 l'uomo che il testo NOMINA si porta sul punto d'arrivo, come farebbe in campo. */
              }
          }}
          {const _no542=(typeof window!=='undefined'&&window.__CPM_NO542);
          const _ct=counterRef.current;
          if(!_no542&&_ct&&!/goal$/.test(String(ev.ef||""))&&!_koHij536&&kickoffRef.current<=0&&!pendingGoalRef.current){
            _recHij545=true;_recKind546="counter";_recSide546=_ct.dir>0?"home":"away";const _rc542=(Math.abs(hashStr(String(ev.txt||"")+"|"+nx+"|ct"))%100)/100;
            if(_ct.fin){counterRef.current=null;
              ev=_ct.dir>0?(_rc542<0.4?{txt:"💥 La ripartenza si chiude col tiro di {H}: il portiere di {A} devia in tuffo!",ef:null,w:1,bpos:{x:88,y:52},ms:{shots:1},at:"shot",pd:_dec499,tn617:-1}
                 :_rc542<0.7?{txt:"↗ Contropiede: cross basso di {H} — la difesa di {A} spazza in extremis.",ef:null,w:1,bpos:{x:82,y:60},at:"cross",pd:_dec499,tn617:-1}
                 :{txt:"⚡ La ripartenza sfuma: {A} raddoppia su {H} e chiude al limite.",ef:null,w:1,bpos:{x:74,y:48},pd:_dec499,tn617:-1})
               :(_rc542<0.4?{txt:"😨 Ripartenza di {A}: tiro dal limite — il nostro portiere respinge coi pugni!",ef:null,w:1,bpos:{x:10,y:48},ms:{oppShots:1},at:"shot",pd:_dec499,tn617:1}
                 :_rc542<0.7?{txt:"🛡️ Contropiede avversario: {H} rincula e chiude in scivolata al momento giusto.",ef:null,w:1,bpos:{x:18,y:52},at:"tackle",pd:_dec499,tn617:1}
                 :{txt:"😮‍💨 {A} sciupa la ripartenza: ultimo passaggio lungo, rimessa dal fondo.",ef:null,w:1,bpos:{x:14,y:40},pd:_dec499,tn617:1});}
            else{const _cv542=(recVarRef.current=(recVarRef.current+1)|0)%4;
            const _CF=_ct.dir>0?["🏃 {H} brucia il centrocampo in conduzione — campo aperto!","⚡ Ripartiamo in verticale: {H} lancia {H2} oltre la linea!","💨 Tre tocchi e via: {H} porta il contropiede oltre la meta' campo.","🎯 {H2} accompagna la ripartenza: due contro due, che occasione!"]
              :["⚠️ {A} attraversa il centrocampo a tutta velocita'!","😰 Ripartenza fulminea di {A} — la difesa rincula!","🚨 Campo aperto per {A}: rincorsa disperata dei nostri.","⛔ {A} galoppa in transizione: serve un fallo tattico o una diagonale."];
            ev={txt:_CF[_cv542],ef:null,w:1,bpos:null,pd:_dec499};}}
          else if(!_no542&&!_ct&&!_koHij536&&counterArmRef.current&&!ev.ef&&!spRef.current&&kickoffRef.current<=0&&!pendingGoalRef.current&&(!outRef.current||(typeof window!=='undefined'&&window.__CPM_NO632))){/* [7.632.0 v4] niente ripartenza recitata sopra un fischio vivo: la palla e' ferma */
            const _arm542=counterArmRef.current;counterArmRef.current=null;
            counterRef.current={dir:_arm542.dir,ticks:0,fin:false};_recHij545=true;_recKind546="counter";_recSide546=_arm542.dir>0?"home":"away";
            ev=_arm542.dir<0?{txt:"⚡ Palla persa alta! {A} riparte in campo aperto — che pericolo!",ef:null,w:1,bpos:null,pd:_dec499}
               :{txt:"⚡ Recupero altissimo di {H}! Si ribalta il fronte in un lampo!",ef:null,w:1,bpos:null,pd:_dec499};}
          else if(counterArmRef.current&&(_no542||ev.ef))counterArmRef.current=null;/* armato ma il momento e' passato (gol in mezzo / rosso): si disarma senza recitare */}
          /* [7.653.0 - LA SCENA DECISA SI DICHIARA (FASE 5a roadmap). Rosso __CPM_NO653]
             Direttiva PO: la cronaca deve far percepire ritmo, possesso, costruzione, pressione -
             E le fasi tranquille. Il direttore (7.648) decide le scene libere ma erano INVISIBILI:
             nessuna riga le nominava. Ora la PRIMA riga libera di ogni scena decisa la dichiara
             (pattern kickoff: sorteggio consumato, ordine dei sorteggi intatto), col lato giusto.
             Un annuncio per scena (2-4 a partita): il repertorio non si affama. */
          if(!(typeof window!=='undefined'&&window.__CPM_NO653)&&!_koHij536&&!/goal$/.test(String(ev.ef||""))&&kickoffRef.current<=0&&!pendingGoalRef.current&&!counterRef.current&&!spRef.current&&!ponteRef.current&&!outRef.current&&!azioneRef.current){
            const _sc653=direttoreRef.current;
            if(_sc653&&_sc653.lib&&!_sc653.ann){_sc653.ann=1;
              const _n653=_sc653.l>=0;
              const _T653=({quiete:[_n653?"⚪ Fase di studio: {H} e compagni fanno girare il pallone senza forzare.":"⚪ {A} addormenta il ritmo: giro palla ragionato nella propria meta'."],
                costruzione:[_n653?"⚙️ {H} imposta da dietro: la squadra sale compatta, senza fretta.":"⚙️ {A} costruisce con pazienza dalla difesa."],
                sviluppo:[_n653?"📈 La manovra si accende: {H} guadagna metri fra le linee.":"📈 {A} alza il baricentro: la giocata si sposta nella nostra meta'."],
                pressione:[_n653?"🔥 Pressing alto dei nostri: {A} fatica a uscire dal basso.":"⚠️ {A} alza il pressing: serve lucidita' per uscire dal basso."]})[_sc653.f];
              if(_T653){_recHij545=true;_recKind546="scena";_recSide546=_n653?"home":"away";
                ev={txt:_T653[0],ef:null,w:1,bpos:null,pd:_dec499};}
            }
          }
          /* [7.537.0 NO551] LA CATENA DI POSSESSO SI RECITA. Ultima delle macchine per precedenza (cede a
             kickoff, gol costruito, giocate piazzate, contropiede e ponte): quando nessun'altra parla, la
             cronaca costruisce una CATENA di 3-5 tocchi fra uomini VERI del lato in possesso. Ogni passo
             nomina passatore e ricevente presi da `matchPlayers` (gli stessi cognomi che il 3D ha sulle
             maglie: il canale MP-0 li usa per far calciare l'uomo giusto), la palla punta la posizione
             del ricevente e il ricevente le va incontro. Deterministico: la scelta esce da hashStr su
             minuto+passo, mai da `_rndM` (invariante 7.511 sull'ordine dei sorteggi). */
          if(!(typeof window!=='undefined'&&window.__CPM_NO551)&&!/goal$/.test(String(ev.ef||""))&&!_koHij536&&kickoffRef.current<=0&&(_cat559||!pendingGoalRef.current)&&!counterRef.current&&!spRef.current&&!ponteRef.current&&(!outRef.current||(typeof window!=='undefined'&&window.__CPM_NO632))){/* [7.632.0 v4] la catena cede anche all'ARBITRO: col fischio vivo piu' a lungo rubava le sue righe (misurato: out_* 3->0, catena 3->14) — «ultima delle macchine per precedenza» ora e' vero anche per out */
            const _mp551=(matchPlayersRef.current||[]);
            const _lato551=(possTurnRef.current<0)?"away":"home";
            const _mio551=(i)=>{const q=_mp551[i];return !!q&&q.team===_lato551&&!q.gk;};
            /* [7.537.0 v5] LA CATENA HA UN INTERVALLO. Con l'alternanza (v4) il guardiano `bg-decision`
               restava sul filo — 17 righe utili in isolamento, 14 (sotto il minimo di 15) dentro la
               corsia: il numero di righe dirottate OSCILLA perche' la catena si arma dalle posizioni dei
               giocatori, che portano un jitter casuale (debito noto r.21058). Un guardiano che passa o no
               a seconda del jitter non e' un guardiano: la catena si apre al massimo una volta ogni 3
               minuti di gioco, cosi' il repertorio pescato ha sempre il suo spazio e la telecronaca
               alterna azione e commento invece di essere un elenco di passaggi. */
            const _urg559=_cat559&&!!pendingGoalRef.current&&!(pendingGoalRef.current.piano&&!(typeof window!=='undefined'&&window.__CPM_NO649));/* [7.649.0] col piano la catena tace: un racconto solo *//* [7.542.0 v2] LA CATENA SI APRE IN OGNI FASE, LA PAUSA SI SCAVALCA SOLO FUORI DALLA COSTRUZIONE. La v1 gate-ava tutt'e tre le cose sulla fase e ha pagato il ritmo col racconto: bg-rhythm da 1,29x a 2,89x (soglia 1,30) ma i gol raccontati da 6/8 a 4/7, sotto la soglia dichiarata. Col ritmo a piu' del doppio del minimo c'e' margine per restituire: qui si separa cio' che detta il RESPIRO (la pausa d'enfasi, che in costruzione resta) da cio' che detta il RACCONTO (che la catena sia aperta e non ceda il turno, e quello serve sempre). *//* [7.541.0] vedi la nota sulla forzatura: in costruzione la cronaca prende tempo, come prima *//* [7.541.0] il gol in arrivo non aspetta il turno: la catena si apre subito e non alterna */
            const _cg615=(typeof window!=='undefined'&&window.__CPM_CAT615)||null;/* [7.615.0 strumentazione] il cancello della catena si racconta: quante volte prova, e dove muore */
            if(_cg615){_cg615.tick=(_cg615.tick|0)+1;if(pendingGoalRef.current){_cg615.pgTick=(_cg615.pgTick|0)+1;if(azioneRef.current)_cg615.pgConCat=(_cg615.pgConCat|0)+1;}}/* [7.622.0] quanti tick di COSTRUZIONE DEL GOL vedono questo sito, e quanti hanno gia' una catena aperta: e' il buco dei «gol nudi» */
            if(!azioneRef.current&&_mp551.length>=11&&(_urg559||nx-(_lastCatRef.current|0)>=6||_lastCatRef.current<0)){/* [7.537.0 v6] intervallo 3'→6' *//* [7.644.0] il costruttore vive in _apriCatena644, condiviso con l'armamento del pendingGoal: MAI due copie */
              _apriCatena644(_lato551);
            }
            /* [7.537.0 v4] LA CATENA ALTERNA CON IL REPERTORIO. La v3 dirottava OGNI riga finche' i passi
               finivano: tre-cinque battute consecutive tutte di macchina, e il guardiano `bg-decision`
               (che misura il repertorio PESCATO, escluse le recite) e' diventato CIECO — 14 righe utili
               contro le 15 minime. E' anche un difetto di racconto, non solo di misura: una telecronaca
               che per mezzo minuto dice solo «X per Y» smette di essere la telecronaca ampia chiesta dal
               PO. Ora un passo si recita SOLO se la battuta precedente non era di catena: il passaggio e
               il commento si alternano, come in televisione. */
            if(azioneRef.current&&_lastCatRef.current===nx&&!(_cat559&&pendingGoalRef.current)){if(_cg615)_cg615.skipAlt=(_cg615.skipAlt|0)+1;/* battuta precedente gia' di catena in questo giro: si lascia parlare il repertorio — ma non mentre il gol si costruisce, li' la catena e' il racconto */}
            else if(azioneRef.current&&!(typeof window!=='undefined'&&window.__CPM_NO684C)&&_recKind546!=="scena"){/* [7.684.0 SOLO COLLAUDO] `__CPM_NO684C` spegne la CATENA: serve alla prova del rosso della banda «manovra-viva», che copre due sistemi e senza questo non avrebbe modo di fallire — un guardiano che non sa andare rosso non fa la guardia a niente. ⚠️ la prima stesura lo metteva DENTRO il ramo, dopo che la riga era gia' decisa: il rosso non spegneva nulla e misurava dieci righe di catena come se fosse acceso. *//* [7.653 v4] la catena NON ruba la dichiarazione di scena appena armata (misurato: ann bruciato senza riga, 1 annuncio su 9) */
              const _az=azioneRef.current,_p=_az.passi[_az.i];
              if(!_p||(_az.t0!=null&&nx-_az.t0>6&&!(_cat559&&pendingGoalRef.current))){azioneRef.current=null;if(_cg615)_cg615.dead=(_cg615.dead|0)+1;}/* la catena non vive piu' di 6 minuti di gioco */
              else{
                _recHij545=true;_recKind546="catena";_recSide546=_az.nostra?"home":"away";
                const _cog=(n)=>{const t=String(n||"").trim();return t?t.charAt(0)+t.slice(1).toLowerCase():"un compagno";};
                const _da=_cog(_p.da),_a=_cog(_p.a);
                const _V=_p.kind==="filtrante"?["🎯 "+_da+" verticalizza per "+_a+": la difesa si allunga!","⚡ Filtrante di "+_da+" — "+_a+" attacca lo spazio!"]
                  :_p.kind==="cambio"?["↔️ "+_da+" cambia gioco: la palla vola dall'altra parte per "+_a+".","🧭 Apertura di "+_da+" a scavalcare il campo: la riceve "+_a+"."]
                  :_p.kind==="verticale"?["⚙️ "+_da+" appoggia in avanti per "+_a+", la manovra sale.","📈 "+_da+" trova "+_a+" fra le linee: si guadagna campo."]
                  :["🔁 "+_da+" scarica su "+_a+" e la squadra riprende posizione.","⚪ Giro palla: "+_da+" per "+_a+", si cerca il varco."];
                const _vi=Math.abs(hashStr("cv|"+nx+"|"+_az.i))%_V.length;
                ev={txt:_V[_vi],ef:null,w:1,bpos:{x:_p.to.x,y:_p.to.y},at:(_p.kind==="filtrante"?"pass":"pass"),pd:_dec499,_az551:_p};
                if(_p.rcvIdx!=null&&!(typeof window!=='undefined'&&window.__CPM_NO641))carrierRef.current={i:_p.rcvIdx};/* [7.641.0 F1a] il passo di catena elegge il portatore: il ricevente nominato */
                _az.i++;_lastCatRef.current=nx;if(_cg615)_cg615.rec=(_cg615.rec|0)+1;if(_az.i>=_az.passi.length)azioneRef.current=null;
              }
            }
          }
          /* [7.532.0 NO544] LE RIGHE DEL PONTE: durante la scorta verso la scena imminente, la battuta
             sorteggiata racconta l'avvicinamento (pattern kickoff: sorteggio consumato, si scarta la riga). */
          if(!(typeof window!=='undefined'&&window.__CPM_NO544)&&ponteRef.current&&!ponteRef.current.arrived&&!/goal$/.test(String(ev.ef||""))&&!_koHij536&&kickoffRef.current<=0&&!pendingGoalRef.current&&!counterRef.current&&!spRef.current){
            {const _pv544=(recVarRef.current=(recVarRef.current+1)|0)%4;/* varieta': il guardiano bg-decision ha misurato l'accordo comprato con le ripetizioni (54,5%<55 di righe distinte) — 4 varianti per verso, scelte dal minuto */
            const _pp544=ponteRef.current.def
              ?["⚠️ Gli avversari guadagnano metri: il nostro blocco si abbassa.","😤 {A} muove il pallone con pazienza verso la nostra trequarti.","🛑 {A} cambia lato e accelera: la nostra linea scala all'indietro.","📢 Il capitano richiama tutti dietro la linea della palla: {A} spinge."]
              :["⚙️ La squadra accompagna l'azione: si sale verso l'area di {A}.","🏃 {H} detta i tempi: la manovra si sposta nell'ultimo terzo.","🧭 {H} e {H2} scambiano corto e guadagnano campo, metro dopo metro.","📈 Baricentro alto: {H} orchestra e la squadra lo segue in blocco."];
            ev={txt:_pp544[_pv544],ef:null,w:1,bpos:null,pd:_dec499};_recHij545=true;_recKind546="ponte";_recSide546=ponteRef.current.def?"away":"home";}}/* [7.532.0] pd=_dec499: la riga di scorta DESCRIVE il momento (palla ancora in viaggio), non la destinazione — con pd:"attack" fisso l'accordo bg-decision crollava (famiglia attack 0/4, esatto 59,4%<60) */
          /* [7.669.0 — LE INTERAZIONI DELL'EROE ENTRANO IN CRONACA (rosso __CPM_NO670).
             Direttiva PO: «interazioni eroe con mister, compagni ed avversari zero». Ecco le prime.
             RITMO: rare per costruzione — al massimo TRE a partita, almeno dodici minuti fra una e
             l'altra, mai dentro un highlight ne' sopra una scena-gol. E' la banda «2-4 momenti
             significativi» della proposta: se diventassero frequenti sarebbe il GDR di dialoghi che il
             PO non vuole.
             CONTESTO: ogni scheda decide da se' se ha diritto di uscire, guardando lo stato vero
             (minuto, differenza reti, duelli vinti e persi dall'eroe, occasioni fallite, giocate
             riuscite, marcatura). Se nessuna ha le condizioni, non si dice niente.
             CONSEGUENZA: la scheda lascia una traccia nello stato (coinvolgimento, fiducia, intesa,
             marcatura stretta, cambio di zona) — ed e' quella traccia che apre le schede successive:
             due dribbling vinti fanno stringere la marcatura, la marcatura stretta abilita il cambio
             di zona dell'eroe. La catena del PO, per intero.
             ONESTA' DELLA CRONACA: queste righe NON dichiarano zone ne' destinazioni del pallone, e
             non muovono niente in campo — raccontano quello che succede attorno al gioco. Percio' non
             possono mentire sul pallone, ed e' anche la ragione per cui posso spedirle mentre la
             libreria delle azioni resta ferma. */
          if(_intxK669){try{
            const _N=narrRef669.current;
            const _sc=scoreRef.current||{home:0,away:0};
            const _mio=isMatchHome?_sc.home:_sc.away,_suo=isMatchHome?_sc.away:_sc.home;
            const _eroe=((player&&player.name)||"").trim().split(/\s+/).pop()||"il numero dieci";
            /* [7.669.0] il nome del compagno viene dalla ROSA vera. La prima stesura leggeva
               `_ourR170`, che a questo punto del tick non e' ancora dichiarato (nasce settecento righe
               piu' sotto): il catch restituiva sempre «il compagno», e una frase con un nome generico
               e' esattamente la genericita' che il PO non vuole. Qui si legge la rosa alla fonte. */
            const _cmp=(function(){try{const _rr=((isMatchHome?homeRoster:awayRoster)||homeRoster||[]);
              const _r=_rr.filter(m=>m&&m.name&&m.name!==player.name);
              const _m=_r[Math.floor(_rndM()*_r.length)];return _m?(_surnBG(_m.name)||"il compagno"):"il compagno";}catch(_e){return "il compagno";}})();
            const _ctx={mn:nx,diff:_mio-_suo,eroe:_eroe,compagno:_cmp,duelliV:_N.duelliV,duelliP:_N.duelliP,
              occFallite:_N.occFallite,giocate:_N.giocate,marcatura:_N.marcatura,
              golSubDaPoco:(_N.golSub>0&&(nx-(_N.golSubMn|0))<=6),
              golFatti:(_N.golFatti|0),golSub:(_N.golSub|0),eroeGol:(_N.eroeGol|0),golFattoDaPoco:((_N.golFatti|0)>0&&(nx-(_N.golFattoMn|0))<=6),eroeGolDaPoco:((_N.eroeGol|0)>0&&(nx-(_N.eroeGolMn|0))<=6)};/* [7.721.0] stessi campi del contesto di selezione, cosi' txt/es non divergono */
            try{intxCtxRef681.current=_ctx;}catch(_e681){}
            let _t=null;try{_t=_intxK669.txt(_ctx);}catch(_e){_t=null;}
            if(_t){
              _N.fatte.push(_intxK669.id);_N.ultima=nx;
              const _c=_intxK669.cons||{};
              if(_c.marcatura)_N.marcatura=Math.max(0,(_N.marcatura|0)+_c.marcatura);
              if(_c.intesa)_N.intesa=(_N.intesa|0)+_c.intesa;
              ev={...ev,txt:_t,ef:null,ms:null,bpos:null,pd:null,_intx669:_intxK669.fam,_intxSc681:(_intxK669.sc||null),_intxId681:_intxK669.id};
              if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{(window.__CPM_INTX669=window.__CPM_INTX669||[]).push({min:nx,id:_intxK669.id,fam:_intxK669.fam,txt:_t});}catch(_e){}}
            }
          }catch(_e670){}}
          /* [7.666.0 v2 — DOVE si innesta, e perche' proprio qui. La v1 stava a valle, appena prima
             della costruzione del testo, e BLOCCAVA LA PARTITA al 68' (misurato: «Cannot read properties
             of null (reading shots)», orologio fermo, prova del rosso pulita col NO666). Causa: la riga
             che accumula le statistiche registra un aggiornamento DIFFERITO che legge `ev.ms` piu' tardi,
             in fase di render — e nel frattempo io riassegnavo `ev`. Una closure sulla VARIABILE, non sul
             valore: il difetto classico del `let` riassegnato sotto i piedi di chi l'ha catturato. Ora la
             sostituzione avviene QUI, dopo che tutte le macchine hanno dirottato e PRIMA che chiunque
             catturi `ev`: da qui in giu' la riga della libreria e' l'unica verita' del tick. */
          /* [7.666.0 — L5: LA LIBRERIA SCRIVE IN CRONACA (rosso __CPM_NO666).
             LA MISURA CHE HA APERTO IL CANTIERE (collaudo PO «le azioni salienti extra eroe non
             scattano»): una partita intera produce 17 righe in 89 minuti, una ogni cinque, e ZERO
             minuti con piu' di una riga — nessuna sequenza, solo frasi isolate: «recupero altissimo!»
             e poi silenzio. Le macchine si armavano 22 volte ma scrivevano 1,1 righe a testa: non
             erano azioni, erano annunci. Qui l'azione DIVENTA sequenza: il compositore sceglie una
             struttura di 2-5 moduli col contesto della partita, la rende in battute, e le battute
             escono UNA PER TICK, di fila, chiuse dall'esito che nomina la sua conseguenza.
             DOVE si innesta: QUI, a valle di tutte le macchine — se una recita ha parlato, o se una
             scena-gol e' armata, la libreria TACE. Il sorteggio del repertorio resta consumato
             (ordine intatto, lezione 7.511): la riga viene sostituita, non saltata.
             I NOMI: i beat non portano nomi propri ma i segnaposto del gioco ({H}, {H2}, {A}), che
             la riga sotto riempie con la rosa vera e coerente per zona. LIMITE DICHIARATO: il nome e'
             pescato per ZONA, non per RUOLO — il «regista» del beat non e' garantito essere il regista
             della rosa. Il ruolo vero arriva in L6.
             LA ZONA: ogni riga porta la zona d'uscita del suo modulo, quindi resta causale per il
             guardiano e giudicabile dal giudice di fondatezza. */
          /* [7.667.0 — REVOCA IN PRODUZIONE DELL'AGGANCIO 7.666, con la sua misura contraria.
             DIRETTIVA PO: «la telecronaca non deve inventare cavolate ma raccontare la realta' in
             maniera credibile». Ho misurato la 7.666 col giudice di fondatezza: le righe fondate sono
             CROLLATE dal 74,5% al 56,3%. Il racconto e' piu' fitto (31 righe contro 17, sequenze che si
             leggono) ma piu' BUGIARDO, ed e' esattamente il contrario di cio' che serve — tanto piu'
             adesso che il pallone e' l'unico attore in campo (7.665) e nessuno copre la bugia.
             CAUSA: ho agganciato il TESTO e non il PALLONE. La libreria racconta «cross rasoterra sul
             primo palo» mentre la palla vive la sua vita a centrocampo.
             TENTATIVO DI CURA, PROVATO E REVOCATO NELLO STESSO GIRO: dare a ogni beat la destinazione
             della sua zona (bpos) perche' il motore ci portasse la palla. Misura: fondatezza 32,9%,
             ANCORA PEGGIO — la zona del modulo e' ASSOLUTA (attack_goal = x85) e la palla sta dove sta,
             quindi ogni riga chiedeva 45-75 unita' di spostamento contro un tetto di 30: bugie
             garantite per costruzione. Le due misure insieme dicono la cosa giusta da fare, e non e'
             una pezza: l'azione deve NASCERE da dove il pallone si trova (innesco compatibile con la
             zona corrente) e avanzare per TAPPE dentro il tetto del motore. E' il contratto che avevo
             scritto nel catalogo e non ho onorato nel codice.
             Fino ad allora la libreria non parla al giocatore: si accende solo con __CPM_LIB666_ON
             (collaudo). Restano in gioco, misurati e verdi, il compositore e i suoi metri. */
          /* [7.683.0 — LA LIBRERIA SI ACCENDE: le azioni salienti extra-eroe arrivano al giocatore.
             Quarta segnalazione del PO («le azioni salienti extra eroe non partono»), ed era vera alla
             lettera: la libreria stava dietro un interruttore SPENTO dal 7.667, revocata per una misura
             — fondatezza 74,5% -> 56,3% — fatta su un codice che nel frattempo era cambiato due volte
             (l'innesco vincolato alla zona del pallone, 7.669, e la tappa da 26 unita'). Dopo quelle due
             cure non ho mai rifatto il confronto: e' rimasta spenta per inerzia, non per una prova.
             MISURA APPAIATA DI OGGI, tre partite sugli stessi semi, stesso strumento — con la libreria
             in modalita' «segue il pallone» (7.683): righe giudicate 70 -> 117, fondate 64,3% -> 89,7%,
             e soprattutto le SMENTITE da 19 a 10 IN VALORE ASSOLUTO, con quarantasette righe in piu'.
             Parte del guadagno e' per costruzione — una riga che dichiara la zona in cui il pallone si
             trova e' vera per definizione — ma il numero di bugie CALA: la libreria si prende gli slot
             che prima erano di righe di recita bugiarde.
             E le azioni arrivano: 4 a partita (banda 3-5), da 4 a 10 righe l'una, 4 strutture distinte
             su 4. `__CPM_NO683` la rispegne per la prova del rosso. */
          /* [7.721.0 — LA LIBRERIA TACE NEL TICK DELLA SCHEDA. Rosso __CPM_NO721L] Per lettura: la
             libreria apriva una nuova azione (o consumava una riga) senza guardare se il tick portava
             gia' una scheda, e riassegnava `ev` — la scheda sarebbe stata consumata (fatte, ultima,
             cons) ma MAI mostrata. Collisione reale nel codice, ma RARA: l'avevo accusata dello «una
             scelta su quattro» del censimento e la misura appaiata l'ha smentita (scelte 6 -> 7 su 24,
             rumore). Quel difetto era un ARTEFATTO del banco: in autoplay il freeze della scelta e'
             bypassato (r.~2651), il clock corre a ~2 s/minuto e la scheda successiva (10') arrivava
             prima dei 35 s del timer, sovrascrivendo la sospesa — misurato coi contatori della catena:
             timer armati 4, scattati 1, cancellati 4, righe sopra la scelta 0. Al giocatore vero il clock
             si ferma e questo non accade. Il cancello resta come protezione a costo zero, senza
             vantarsi di numeri che non ha. */
          if(!(typeof window!=='undefined'&&window.__CPM_NO683)&&typeof libCompose662==='function'&&!(_intxK669&&!(typeof window!=='undefined'&&window.__CPM_NO721L))){try{
            const _LR=libRegRef666.current;const _LA=libAzRef666.current;
            /* i NOMI: due segnaposto distinti, e i ruoli che compaiono INSIEME in uno stesso beat
               non possono condividerlo — misurato: «Bruno rifiuta il rilancio e apre corto per Bruno».
               {H} e {H2} sono due uomini diversi per costruzione (H2 esclude H). */
            const _RUOLI666={portiere:'{H}',centrale:'{H2}',regista:'{H}',mediano:'{H2}',mezzala:'{H2}',
              terzino:'{H}',esterno:'{H2}',punta:'{H}',trequartista:'{H2}',portatore:'{H}',specialista:'{H}'};
            /* [7.669.0] LA TAPPA. Il motore sposta al massimo 30 unita' per riga (freno 7.498/7.528):
               una destinazione assoluta come «area avversaria» chiede 45-75 unita' quando la palla e'
               nella nostra meta', ed e' una bugia garantita — misurata, 32,9% di fondatezza. La riga
               dichiara quindi un PASSO verso la zona del suo modulo, lungo al massimo 26 unita': il
               pallone ci arriva davvero, e l'azione avanza di tappa in tappa come una vera manovra. */
            /* [7.687.0] I NOMI PER LE RIGHE PROGRAMMATE. La riga che passa dal tick li prende da
               `_pickN` piu' a valle, fuori dalla portata del timer: qui si legge il roster ALLA FONTE,
               come gia' fanno le interazioni dal 7.669 (dove leggere una variabile dichiarata settecento
               righe piu' sotto mi aveva dato «il compagno» al posto di un nome). k=1 e 2 sono due dei
               nostri, sempre diversi fra loro; k=0 e' un avversario. */
            const _nm687=(k)=>{try{
              const _R=(isMatchHome?homeRoster:awayRoster)||homeRoster||[],_O=(isMatchHome?awayRoster:homeRoster)||awayRoster||[];
              const _L=(k===0?_O:_R)||[];if(!_L.length)return k===0?"un avversario":"un compagno";
              const _i=(k===2?1:0)+Math.floor(((nx||1)*7+k*13)%Math.max(1,_L.length-1));
              const _p=_L[_i%_L.length]||{};const _n=String(_p.n||_p.name||"").trim();
              return _n?_n.split(/\s+/).pop():(k===0?"un avversario":"un compagno");}catch(_e){return k===0?"un avversario":"un compagno";}};
            const _ZX669={defend_goal:18,retreat:34,midfield:50,attack:68,attack_goal:85};
            /* ⚠️ [7.683.0 — LA LIBRERIA SEGUE IL PALLONE, NON GLI COMANDA DOVE ANDARE.
               Misura appaiata, tre partite sugli stessi semi, libreria spenta contro accesa: le righe
               con una destinazione passano da 40 a 98, ma quelle che il motore deve ACCORCIARE passano
               da 11 (27%) a 72 (73%), con un accorciamento mediano di ventotto unita', e le righe
               sbagliate da 12/40 a 74/98. Anche con la tappa da 26 unita' del 7.669 la libreria chiede
               al pallone piu' di quanto il motore conceda: tre righe su quattro raccontavano una palla
               che va dove la palla non va. Accenderla cosi' significava dare al giocatore piu' azioni
               salienti E una telecronaca che mente — e la regola del PO che sta sopra le altre e' che
               la telecronaca non deve inventare.
               Qui l'azione smette di comandare: la riga dichiara la zona in cui il pallone SI TROVA
               (non quella del modulo) e non dichiara nessuna destinazione. Il racconto segue la palla
               invece di promettere dove andra': meno ambizioso del contratto che avevo scritto nel
               catalogo, ma e' l'unica versione che puo' arrivare al giocatore senza mentirgli.
               `__CPM_LIB683_GUIDA` ripristina il comportamento che comanda, per la misura appaiata. */
            const _zonaDi683=(_x)=>_x<26?'defend_goal':_x<42?'retreat':_x<58?'midfield':_x<76?'attack':'attack_goal';
            const _segue683=()=>{try{if(typeof window!=='undefined'&&window.__CPM_LIB683_GUIDA)return null;
              const _b=ballPosRef.current;return _b?_zonaDi683(_b.x):null;}catch(_e){return null;}};
            const _bpos683=(_z,_c)=>{try{if(typeof window!=='undefined'&&window.__CPM_LIB683_GUIDA)return _tappa669(_z,_c);return null;}catch(_e){return null;}};
            const _tappa669=(_z,_corsia)=>{try{if(!_z)return null;
              const _b=ballPosRef.current||{x:50,y:50};
              const _tx=_ZX669[_z]||50,_ty=(_z==='attack_goal'||_z==='defend_goal')?50:(_corsia==='sx'?30:_corsia==='dx'?70:50);
              const _dx=_tx-_b.x,_dy=_ty-_b.y,_d=Math.hypot(_dx,_dy);
              if(_d<=26)return{x:+_tx.toFixed(1),y:+_ty.toFixed(1)};
              const _k=26/_d;return{x:+(_b.x+_dx*_k).toFixed(1),y:+(_b.y+_dy*_k).toFixed(1)};}catch(_e){return null;}};
            if(_LA&&_LA.i<_LA.righe.length){
              /* ⚠️ [7.687.0 — L'AZIONE SALIENTE SI RACCONTA IN SECONDI, NON IN MINUTI. Quarta segnalazione
                 del PO, e le mie misure dicevano tutte «ci sono»: quattro azioni a partita, 4-10 righe
                 l'una, strutture mai ripetute. Erano vere e non servivano a niente. Guardando il BANNER
                 invece del registro: l'azione si apriva all'8' e le sue righe uscivano al 12', 17', 18' —
                 una per TICK, e la cronaca emette una riga ogni tre o quattro minuti di gioco. Cinque
                 righe diventavano un quarto d'ora, con cori e commenti tecnici in mezzo: da fuori non e'
                 un'azione, sono frasi sconnesse. Ed e' esattamente cio' che il PO vedeva.
                 Ora l'azione, appena si apre, PROGRAMMA le sue righe a 1,3 secondi l'una dall'altra e
                 se le porta a casa in una decina di secondi reali — come la si guarderebbe in TV. Il
                 tick non la governa piu': governa solo QUANDO comincia. */
              /* ⚠️ [7.687.0] se le righe sono state PROGRAMMATE (`auto`), il tick non ne consuma: la
                 prima stesura faceva entrambe le cose e nel banner e' uscita una riga DOPPIA. */
              if(_LA.auto){/* le porta a casa il timer */}
              else{
                const _r=_LA.righe[_LA.i++];
                ev={...ev,txt:_r.txt,pd:_segue683()||_r.pd||ev.pd||null,bpos:_bpos683(_r.pd,_LA.corsia),ef:null,ms:null,_lib666:1};
                if(_LA.i>=_LA.righe.length){libAzRef666.current=null;_LR.ultima=nx;}
              }
            } else if(!_LA&&!pendingGoalRef.current&&!_recHij545&&!_koHij536&&nx>2&&nx<88&&(nx-(_LR.ultima|0))>=4){
              const _seme666=String((opponent&&(opponent.n||opponent.name))||'x')+'|'+((player&&player.week)||0)+'|'+nx;
              const _ctx666={stile:'equilibrato',dominio:0,mn:nx,zona:_dec499||null,
                diff:((scoreRef.current&&scoreRef.current.home)||0)-((scoreRef.current&&scoreRef.current.away)||0)};
              const _st666=libCompose662(_seme666,_LR,_ctx666);
              if(_st666&&typeof libRender664==='function'){
                const _rd666=libRender664(_st666,_ctx666,_RUOLI666,false,_seme666);
                if(_rd666&&_rd666.righe&&_rd666.righe.length>1){
                  const _rr666=_rd666.righe.map(r2=>({txt:r2.txt,pd:(LIB662[r2.mod]&&LIB662[r2.mod].z)||null,cons:r2.cons||null}));
                  libAzRef666.current={righe:_rr666,i:1,sig:_st666.sig,corsia:_st666.corsia||null,auto:!(typeof window!=='undefined'&&window.__CPM_NO687)};
                  /* [7.687.0] le righe restanti dell'azione escono SUBITO DOPO, a 1,3 s l'una: e' la
                     differenza fra un'azione e un elenco di frasi. `__CPM_NO687` torna al vecchio ritmo
                     (una riga per tick) per la prova del rosso. */
                  if(!(typeof window!=='undefined'&&window.__CPM_NO687)){
                    for(let _k687=1;_k687<_rr666.length;_k687++){
                      chantTimersRef.current.push(setTimeout(((_ix)=>()=>{try{
                        const _LA2=libAzRef666.current;if(!_LA2||_LA2.sig!==_st666.sig)return;
                        const _r2=_LA2.righe[_ix];if(!_r2)return;
                        _LA2.i=_ix+1;
                        /* ⚠️ [7.687.0] I SEGNAPOSTO VANNO SOSTITUITI ANCHE QUI. La riga che passa dal
                           tick attraversa la sostituzione dei nomi ({H}, {H2}, {A}...); le righe che
                           programmo io la saltavano, e nel banner e' comparso «Palla dentro a {H}, che
                           la gira subito sull'altro lato» — un segnaposto crudo davanti al giocatore.
                           Stessa tabella della riga normale, presa da qui. */
                        let _t687=String(_r2.txt||"");
                        try{_t687=_t687.replace(/\{H2\}/g,_nm687(2)).replace(/\{H\}/g,_nm687(1)).replace(/\{A\}/g,_nm687(0));}catch(_e){}
                        addComRef681.current&&addComRef681.current(_t687,"#dbeafe",clockRef.current);
                        /* ⚠️ [7.687.0] LA RIGA PROGRAMMATA DEVE ENTRARE NEL REGISTRO come quella del tick.
                           Senza, il guardiano contava «libreria 6» dove prima erano 28: non era il gioco
                           a essere peggiorato, era la misura a non vedere piu' le righe che non passano
                           dal tick. Una misura che sottostima e' una misura che mente, e questa l'avrei
                           spedita insieme al rimedio che la rende cieca. */
                        try{cpmEv("chronicle",{min:clockRef.current,lib:1,rk:"libreria",txt:_t687});}catch(_e){}
                        if(_LA2.i>=_LA2.righe.length){libAzRef666.current=null;_LR.ultima=clockRef.current;}
                      }catch(_e687){}})(_k687),1300*_k687));
                    }
                  }
                  _LR.partita.push(_st666.sig);
                  ev={...ev,txt:_rr666[0].txt,pd:_segue683()||_rr666[0].pd||ev.pd||null,bpos:_bpos683(_rr666[0].pd,_st666.corsia),ef:null,ms:null,_lib666:1};
                  if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{(window.__CPM_LIB666=window.__CPM_LIB666||[]).push({min:nx,sig:_st666.sig,n:_rr666.length});}catch(_e){}}
                }
              }
            }
          }catch(_e666){}}
          /* [7.617.0 — SPRINT A3: LE RISOLUZIONI NARRATE PASSANO IL TURNO. Rosso __CPM_NO617]
             L'audit (punto D): le risoluzioni di contropiede e piazzati raccontano passaggi di possesso
             espliciti («il portiere fa sua la palla», «la difesa spazza», «{A} sciupa: rimessa dal
             fondo») e non spostavano nulla — il turno restava al sorteggio, in contraddizione col testo
             appena stampato. Ogni letterale di risoluzione ora dichiara il suo esito (tn617, deciso ramo
             per ramo leggendo il testo: il contropiede finisce SEMPRE con la palla all'altro lato, tutti
             e sei i rami); qui il fatto diventa il turno, con la causa della macchina che l'ha scritto. */
          if(ev&&ev.tn617&&!(typeof window!=='undefined'&&window.__CPM_NO617))setTurn616(ev.tn617,"risoluzione-"+(_recKind546||"macchina"));
          // Sprint 113: record event in dedup buffer
          lastBGEvtRef.current=[ev.txt,..._lastBG].slice(0,6);
          /* [7.486.0] LA TELECRONACA SI PRESENTA, una volta, come in televisione. */
          if(!tcPresRef.current){tcPresRef.current=true;const _tc=telecronistiRef.current;
            if(_tc)addCom("🎙️ "+_tc.em+": la telecronaca di "+_tc.v+", con "+_tc.t+" al commento tecnico.","#a5b4fc",nx);}
          let _evName170=null;/* [7.170.0] il marcatore scelto dall'handler firma anche il token {H}/{A} del testo → badge, MOMENTI CHIAVE e cronaca raccontano lo STESSO nome */
          if(ev.ef==="team_goal"){cpmEv("goal",{min:nx,side:"home",src:_simEv77?"microsim":"cronaca"});/* [7.496.0 F1b] il gol AMBIENTALE: `src` distingue il roll del micro-simulatore dalla riga pescata a caso, che oggi possono entrambe segnare */setScore(s=>({...s,home:s.home+1}));const _myR=(isMatchHome?homeRoster:awayRoster)||homeRoster;const _sc76=_myR.filter(function(r){return r&&!/portiere|goalkeeper|^gk$/i.test(r.role||"")&&r.name!==player.name;});const _pool76=_sc76.length?_sc76:_myR.filter(function(r){return r&&r.name!==player.name;});/* [7.8.28 QA] EROE escluso dal pool marcatori ambientali: la cronaca poteva stampare «Gol di <Eroe>» per un gol del microsim che NON contava nelle sue statistiche (tabellino 2 gol, pagella 1) */const _tmScorer=_surnBG(((_pool76[Math.floor(_rndM()*Math.min(10,_pool76.length))]||{}).name)||"")||"un compagno";/* [7.170.0] cognome suffisso-aware (mai «jr» nudo) */_evName170=_tmScorer;pushMatchEvent(nx,"goal","⚽ Gol di "+_tmScorer);setFloatGoal({text:"⚽ GOL — "+_tmScorer,col:"#22c55e",key:Date.now()});}/* [7.112.0 collaudo PO «mostra i marcatori anche durante il live match»] badge col nome del marcatore compagno *//* [6.76.0 LMV-S3] il PORTIERE escluso dal pool marcatori dei gol ambientali *//* [6.49.0 RC] COLLAUDO PO «marcatori inventati, non in linea con la rosa»: il gol della TUA squadra pescava dalla rosa fisica di CASA → in trasferta mostrava un giocatore AVVERSARIO. Ora usa la rosa dell'EROE (isMatchHome?home:away). */
          if(ev.ef==="opp_goal"){setScore(s=>{
            cpmEv("goal",{min:nx,side:"away",src:_simEv77?"microsim":"cronaca"});/* [7.496.0 F1b] */
            var newAway=s.away+1;var newDiff=s.home-newAway;
            var reactKey=newDiff<=-2?"all_in":newDiff===-1?"cerca_gol":"pressing";
            var reactOrd=COACH_ORDERS[reactKey];
            if(reactOrd){
              tacticBonusRef.current=reactOrd.bonus;
              if(reactOrd.drift&&DRIFT_PRESETS[reactOrd.drift])driftTargetsRef.current=DRIFT_PRESETS[reactOrd.drift];
              fxTimeout(function(){addCoach("📢 "+reactOrd.e+" «"+reactOrd.ctx+"»",nx);},300);/* [7.532.0 NO540] reazione del mister → riquadro panchina */
            }
            return{...s,away:newAway};
          });setPossession(p=>clamp(p-4,20,80));flashScreen({col:"rgba(239,68,68,0.22)",dur:500});
            // Sprint 113: away fan chant when opponent scores
            chantTimersRef.current.push(setTimeout(()=>{const _awayC=pick(chantPoolFor("away_goal",/^(national|nationsCup|euroMondiale)/.test(context||""),player.nation,player.club?.lg)||["..."]);/* [6.39.0] reazione allo 0-1 nella lingua della curva */setCrowdChant({text:_awayC,type:"away_goal",key:Date.now(),clubCol:"#9ca3af"});const _tid=setTimeout(()=>setCrowdChant(null),2200);chantTimersRef.current.push(_tid);},300));
            {const _oppR0=(isMatchHome?awayRoster:homeRoster)||awayRoster;const _oppR=_oppR0.filter(r=>r&&!/portiere|goalkeeper|^gk$/i.test(r.role||""));const _oppScorer=_surnBG((((_oppR.length?_oppR:_oppR0)[Math.floor(_rndM()*Math.min(11,(_oppR.length||_oppR0.length)))]||{}).name)||"")||"avversario";/* [7.178.0 RC-3] il PORTIERE avversario non firma più i gol ambientali (slot 0 del roster era in pool) *//* [7.170.0] cognome suffisso-aware */_evName170=_oppScorer;pushMatchEvent(nx,"opp_goal","😨 Gol di "+_oppScorer);setFloatGoal({text:"⚽ GOL — "+_oppScorer,col:"#94a3b8",key:Date.now()});}/* [6.49.0 RC] il gol AVVERSARIO usa la rosa dell'OPPONENTE (isMatchHome?away:home) · [7.112.0] badge col nome del marcatore avversario */
            // Dynamic HL — queue a reactive highlight a few minutes after conceding
            if(nx<75&&numHLRef.current<8&&!onBenchRef.current&&!subbedOffRef.current&&!heroRedRef.current)reactiveHLQueueRef.current.push(/* [7.178.0 RC-17] niente «il momento è tuo» a eroe fuori dal campo *//* [7.489.0] minuto SEEDATO: un highlight e' un evento, e deve cadere allo stesso minuto a tutte le velocita' */nx+4+Math.floor(_rndM()*5));}
          if(/red|injury/.test(String(ev.ef||""))){try{salIstRef691.current=Date.now()+6000;}catch(_e691){}}/* [7.691.0] rosso o infortunio: sei secondi di scena */
          if(ev.ef==="opp_red"){if(oppRedRef.current){setMomentum(m=>clamp(m+6,0,100));/* [7.178.0 RC-5] SECONDO rosso estratto: solo un filo di momentum — niente evento/flash/possesso duplicati (il modello ha UN rosso) */}else{oppRedRef.current=true;setMomentum(m=>clamp(m+20,0,100));setPossession(p=>clamp(p+8,20,80));flashScreen({col:"rgba(22,163,74,0.20)",dur:600});pushMatchEvent(nx,"red",em=>"🟥 Espulsione avversaria al "+em+"'");}}
          if(ev.ef==="opp_injury"){setMomentum(m=>clamp(m+8,0,100));flashScreen({col:"rgba(245,158,11,0.15)",dur:400});}
          // Sprint 113: track palo/traversa in match events
          if(ev.txt&&(ev.txt.includes("PALO")||ev.txt.includes("TRAVERSA"))&&ev.ms?.shots)pushMatchEvent(nx,"post",em=>"🔩 Palo/traversa al "+em+"'");
          if(ev.poss){
            setPossession(p=>clamp(p+(ev.poss||0),20,80));
            if(!(typeof window!=='undefined'&&window.__CPM_NO543))setTurn616(ev.poss>0?1:-1,"riga-recupero");/* [7.532.0 NO543] la riga di recupero passa il TURNO: e' il «chi ha la palla adesso» che la trama consumera' */
            const isHomeGain=ev.poss>0;
            const ball=ballPosRef.current;
            setMatchPlayers(prev=>prev.map((pl,idx)=>{
              if(pl.team==="ref")return pl;
              if(pl.team==="away"){
                const ai=idx-10; // 0=GK,1-4=DEF,5-7=MID,8-10=FWD
                // Away GK: lateral tracking only, stays in goal
                if(ai===0){const tyGk=clamp((ball.y-pl.y)*0.12,-2,2);return{...pl,x:clamp(pl.x,90,98),y:clamp(pl.y+tyGk,30,70)};}
                // when home gains ball, away pushes up to press; when away gains, they advance
                let txBias=isHomeGain?-3:4;
                let tyBias=(ball.y-pl.y)*0.15; // track ball laterally
                if(ai<=4){txBias*=0.7;
                  /* [7.531.0 rosso __CPM_NO539 — il gate motion su gi0: «palla in meta' offensiva (x90) ma
                     difensori lontani (minDist 25-27 > 24)»] LA LINEA ARRETRA CON LA PALLA PROFONDA: oltre
                     x72 i difensori ospiti convergono verso il pallone (le scene ereditano queste posizioni
                     dalla cronaca: e' QUI che nasceva l'ingresso coi difensori a 25u dal portatore — il
                     marginale storico che carico/isolamento spostavano di ±2u attorno alla soglia). */
                  const _deep539=ball.x-72;
                  if(_deep539>0&&!(typeof window!=='undefined'&&window.__CPM_NO539)){txBias+=Math.min(_deep539*0.5,9);tyBias=(ball.y-pl.y)*0.35;}
                } // DEF: moderate press
                else if(ai<=7){txBias*=1.0;} // MID: full press
                else{txBias*=1.3;} // FWD: aggressive press
                const jitter=(Math.random()-0.5)*2;
                return{...pl,x:clamp(pl.x+txBias+jitter,44,98),y:clamp(pl.y+tyBias+(Math.random()-0.5)*3,3,97)};
              }else{
                // Home GK: lateral tracking only, stays in goal
                if(idx===0){const tyGk=clamp((ball.y-pl.y)*0.12,-2,2);return{...pl,x:clamp(pl.x,2,8),y:clamp(pl.y+tyGk,30,70)};}
                // home team: when home gains ball, push forward
                let shift=isHomeGain?Math.random()*3+1:-Math.random()*3-1;
                let tyBias=(ball.y-pl.y)*0.1;
                if(idx>=1&&idx<=4&&ball.x<28&&!(typeof window!=='undefined'&&window.__CPM_NO539)){shift-=Math.min((28-ball.x)*0.5,9);tyBias=(ball.y-pl.y)*0.35;}/* [7.531.0 NO539] specularmente: la NOSTRA linea arretra sulla palla profonda avversaria */
                return{...pl,x:clamp(pl.x+shift,2,90),y:clamp(pl.y+tyBias+(Math.random()-0.5)*3,3,97)};
              }
            }));
          }
            /* [7.498.0 F3a — IL TESTO PROPONE, LO STATO REALE LIMITA] Prima riga in cui il verso si gira.
               Fino a qui `ballTargetRef.current=ev.bpos` faceva ASSEGNARE la destinazione del pallone a una
               frase pescata da una tabella, qualunque fosse la posizione reale: misurato sul flusso vero,
               mediana 17,6 unita' ma p90 52,7 e massimo 71,9 — cioe' il gioco che si sposta da una
               trequarti all'altra fra due frasi, che in una partita non succede. Ora la destinazione
               dichiarata e' una PROPOSTA e lo stato reale la limita alla continuita': oltre il tetto, si
               va nella direzione chiesta ma solo fin dove il gioco poteva arrivare.
               ⚠️ I GOL SONO ESENTI: un gol subito porta davvero il pallone nella propria rete, e due delle
               cinque righe oltre mezzo campo della prima misura erano `opp_goal`. Frenare anche quelle
               avrebbe corretto l'unico evento che ha il diritto di spostare il gioco da parte a parte.
               ⚠️ Questo NON e' tutto F3: e' il primo punto in cui lo stato reale prevale sul testo. La
               selezione della riga resta una pesca pesata (col peso di zona del 7.486). */
          /* [7.574.0 — IL REPERTORIO DELLA CRONACA SI RISCRIVEVA DA SOLO, rosso __CPM_NO574]
             `ev.bpos` e' un oggetto del repertorio, che e' una COSTANTE LETTERALE. Passandolo cosi' com'e'
             a `ballTargetRef.current` (r. piu' sotto) il bersaglio del pallone diventava LO STESSO OGGETTO
             della riga — e il motore del possesso muove il bersaglio SUL POSTO (`_t.x = _t.x + ...`).
             Risultato: ogni deriva riscriveva la destinazione DICHIARATA dalla riga, per il resto della
             partita e per tutte le successive nella stessa sessione.
             PERCHE' TOCCAVA PROPRIO I GOL, ed e' l'esenzione del 7.525 a farlo: quasi tutte le righe
             passano dal tetto di spostamento qui sotto, che RICOSTRUISCE l'oggetto e quindi spezza
             l'alias per caso. Le righe di gol no — sono esenti per scelta («il volo fino in rete e' suo
             di diritto»), quindi erano le uniche a restare agganciate al repertorio.
             MISURATO (sonda nuova `repertorio-574`, fotografia di `__CPM_BG` prima e dopo una partita):
             1 riga riscritta su 223, ed e' la riga del gol subito — dichiarava (2,50), a fine partita
             dichiarava (25,5 · 51,0), spostata di 23,5u. E' l'origine dei `bpos` bugiardi che `gol-573`
             contava come «il pallone non entra mai».
             IL RIMEDIO E' UNA COPIA, e vale per ogni riga: il repertorio torna a essere una costante. */
          var _bt498=(typeof window!=='undefined'&&window.__CPM_NO574)?(ev.bpos||null):(ev.bpos?{x:ev.bpos.x,y:ev.bpos.y}:null);
          if(pendingGoalRef.current&&!/goal$/.test(String(ev.ef||""))&&!ev._piano649)_bt498=null;/* [7.649.0] la riga del piano MUOVE il pallone: la causa dello spostamento e' dichiarata nel testo *//* [7.528.0 v2] azione pendente: guida la pendenza (4u/tick verso l'area), la riga DESCRIVE senza strattonare il pallone altrove */
          /* [7.578.0 — UN PALLONE FERMO SI PIAZZA, NON SI PASSA, rosso __CPM_NO578]
             Il tetto di spostamento del 7.498 esiste per una ragione giusta: impedire che una riga di
             cronaca STRATTONI il pallone attraverso il campo. Ma vale per il gioco APERTO. Una rimessa,
             un angolo, un rinvio dal fondo e un calcio d'inizio non passano il pallone: lo RICOLLOCANO —
             e' la natura stessa del pallone fermo, ed e' quello che le macchine del 7.530/7.559 sono state
             scritte per fare. Il tetto le smentiva: la riga diceva «palla sulla bandierina» e il motore la
             lasciava a meta' strada.
             MISURATO col registro esteso del 7.576, sei partite, separando recitate e non recitate:
                 recitate   8/16 frenate, accorciamento MEDIANO 41,3u
                 normali   24/43 frenate, accorciamento mediano 12,6u
             Il freno morde le recite piu' del triplo. Non e' la recita a mentire: e' il tetto a smentirla.
             L'esenzione e' la stessa forma gia' scritta per i GOL nel 7.525 («il volo fino in rete e' suo
             di diritto»), e si ferma dove finisce il pallone fermo: contropiede, catena e ponte restano
             sotto il tetto, perche' li' il pallone si gioca, non si piazza. */
          const _fermo578=(typeof window!=='undefined'&&window.__CPM_NO578)?false:(_koHij536||/^(out_|sp_)/.test(String(_recKind546||"")));
          if(_bt498&&!(typeof window!=='undefined'&&window.__CPM_NO498)&&!ev.ef&&!_fermo578){
            var _cb498=ballPosRef.current||{x:50,y:50};
            /* [7.525.0 «le righe seguono la trama», rosso __CPM_NO528] due morbidezze sul punto d'arrivo
               (i GOL restano esenti, come nel 7.498): (a) il tetto di spostamento per riga scende 45→30 —
               una consegna di cronaca e' un passaggio, non un lancio da porta a porta; (b) la y d'arrivo
               si ammorbidisce verso il CORRIDOIO corrente della trama (35%): il gioco resta sul binario
               che il possesso sta raccontando invece di sbattere da una fascia all'altra. */
            var _no528=(typeof window!=='undefined'&&window.__CPM_NO528);
            /* [7.655.0 - LA RECITA DICHIARA IL SUO PUNTO, E IL PUNTO SI ONORA. Rosso __CPM_NO655]
               MISURATO (fondate-558, 2 partite): fondate 63%, e il collo e' la DESTINAZIONE — le
               righe RECITATE (contropiede, catena, piano-gol, arbitro, kickoff) venivano frenate
               nell'86% dei casi con accorciamento mediano di 29,4u (5 smentite su 6): il richiamo
               di corridoio e il cap 30u esistono per le righe PESCATE dal repertorio (che
               strattonavano il pallone), ma la recita E' il motore che gioca — il suo bpos e' il
               piano della giocata (la corsa del counter, il piede del ricevente), e frenarlo
               significa SMENTIRE cio' che la cronaca ha appena detto. Stessa esenzione gia' data
               alle palle ferme dal 7.578. */
            /* [7.669.0 — IPOTESI PROVATA E REVOCATA, con la sua misura: esentare le righe della
               libreria dal richiamo di corridoio (come le recite) perche' dichiarano la loro corsia.
               Fondatezza 55,1% PRIMA e 55,1% DOPO: nessun guadagno, quindi la riga non resta. Il
               problema e' piu' a monte, ed e' scritto nel diario: la libreria scrive il testo ma non
               PILOTA il pallone come fanno le macchine di recita. */
            var _recita655=!(typeof window!=='undefined'&&window.__CPM_NO655)&&_recHij545;
            if(!_no528&&!_recita655){const _tr528=tramaRef.current;
              if(_tr528&&_tr528.cor!=null){const _cy528=corY528(_tr528.cor);/* [7.630.0] helper unico dei centri di corridoio */
                /* [7.612.0 — IL CORRIDOIO SI CONSEGNA, NON SI ACCENNA. Rosso __CPM_NO612]
                   COLLAUDO PO (piu' volte): «il pallone viaggia sempre in verticale in mezzo al campo,
                   mai sulle fasce». MISURATO (fasce-600): corridoio centrale 78% del tempo, 0,4 cambi di
                   lato/min, quarto basso della y a 40 — e il 40 non e' un caso, e' l'EQUILIBRIO di questo
                   richiamo: ogni riga ripropone il centro (y≈50) e il 35% verso cy=24 converge a
                   0,65·50+0,35·24 ≈ 41. Il corridoio veniva sorteggiato e mai raggiunto PER ARITMETICA.
                   (Prima ipotesi caduta con misura appaiata: l'inversione del verso 7.579 — fasce e
                   scrittori identici nei due bracci, vedi la sua nota.) Qui, quando la trama e' su una
                   FASCIA, il richiamo diventa 0,8: equilibrio ≈29, dentro la fascia vera. Al centro resta
                   0,35 (rafforzarlo li' ricentralizzerebbe, cioe' il contrario del difetto). */
                const _k612=(!(typeof window!=='undefined'&&window.__CPM_NO612)&&_tr528.cor!==0)?0.8:0.35;
                _bt498={x:_bt498.x,y:clamp(_bt498.y+(_cy528-_bt498.y)*_k612,2,98)};}}
            var _dx498=_bt498.x-_cb498.x,_dy498=_bt498.y-_cb498.y,_dd498=Math.hypot(_dx498,_dy498);
            var _cap528=_no528?45:30;
            if(_dd498>_cap528&&!_recita655)_bt498={x:clamp(_cb498.x+_dx498/_dd498*_cap528,2,98),y:clamp(_cb498.y+_dy498/_dd498*_cap528,2,98)};/* [7.655.0] il cap resta per il repertorio pescato */
            /* [7.639.0 — LA RIGA CONSEGNA AI PIEDI DI UN UOMO. Rosso __CPM_NO639]
               CENSIMENTO A4 (a4count, 63' di gioco): la TRAMA apre 4 giocate e fa 1 passaggio vero a
               partita — il pallone lo muovono le RIGHE (una ogni 2-3 tick, fino a 30u), ed e' sulle
               righe che «la palla rimbalza senza portatore e ricevente» (collaudo PO). Stessa cura del
               7.538.1: il punto d'arrivo della riga di GIOCO APERTO (fermi, gol e azione pendente sono
               gia' esclusi da questo blocco) si aggancia ai piedi del compagno del lato in possesso piu'
               vicino entro 8u — il raggio del 7.544, che non tira l'intenzione verso grappoli lontani.
               Nessun sorteggio nuovo (invariante 7.511). La sosta e' implicita: il bersaglio agganciato
               resta sui piedi finche' la prossima riga non muove il gioco. */
            if(!(typeof window!=='undefined'&&window.__CPM_NO639)){try{
              const _mp639=matchPlayersRef.current||[];const _lt639=(possTurnRef.current>0)?"home":"away";
              let _bi639=-1,_bd639=8;
              for(let _i9=0;_i9<_mp639.length;_i9++){const _p9=_mp639[_i9];if(!_p9||_p9.team!==_lt639||_p9.gk)continue;
                const _d9=Math.hypot((_p9.x||50)-_bt498.x,(_p9.y||50)-_bt498.y);if(_d9<_bd639){_bd639=_d9;_bi639=_i9;}}
              if(typeof window!=='undefined'&&window.__CPM_REC){try{const _w=(window.__CPM_A4=window.__CPM_A4||{pass:0,agg:0,wp:0});if(_bi639>=0)_w.riga=(_w.riga|0)+1;else _w.rigaN=(_w.rigaN|0)+1;}catch(_e){}}
              if(_bi639>=0){_bt498={x:clamp(_mp639[_bi639].x,2,98),y:clamp(_mp639[_bi639].y,2,98)};
                if(!(typeof window!=='undefined'&&window.__CPM_NO641))carrierRef.current={i:_bi639};/* [7.641.0 F1a] la consegna della riga elegge il portatore */}
            }catch(_e639){}}
          }
          if(/goal$/.test(String(ev.ef||""))&&!(typeof window!=='undefined'&&window.__CPM_NO528)){kickRef.current=(typeof window!=='undefined'&&window.__CPM_NO569)?4:5;ripT0Ref.current=Date.now();/* [7.590.0] QUI nasce la ripresa dopo un gol: e' l'istante da cui contano i suoi pochi secondi */kickGx573.current=(ev.ef==="team_goal")?100:0;kickIn573.current=false;kickAtt573.current=0;/* [7.573.0] da qui la ripartenza sa DOVE il pallone deve arrivare prima di tornare al centro */kickoffSideRef.current=(ev.ef==="team_goal")?"away":"home";if(!(typeof window!=='undefined'&&window.__CPM_NO543))setTurn616((ev.ef==="team_goal")?-1:1,"calcio-inizio");/* [7.532.0 NO543] il calcio d'inizio passa il turno a chi ha subito */}/* [7.545.0 — collaudo PO «non si vedono i gol», rosso __CPM_NO569] 4->6 TICK: MISURATO coi tre palloni
   insieme (hook __CPM_BALL3). Il BERSAGLIO del pallone va in rete sempre, 3/3 a 2,0u dalla linea: la
   riga del gol porta bpos x98 e il gol del microsim riusa quella riga. E' la MESH a non arrivarci —
   3,9 / 14,1 / 4,0u. Il motivo sta nell'invariante delle due sorgenti: il gol si scrive quando il
   pallone LOGICO raggiunge x>=72, ma la mesh in quel momento e' a 45-59 (quindici-venticinque unita'
   indietro), e deve coprire 40-53u nei tick che restano prima che il calcio d'inizio la richiami al
   centro. Non e' un bersaglio sbagliato ne' una corsa lenta: e' una finestra troppo corta per la
   distanza che la mesh ha ancora davanti. Sei tick sono ~5,4 secondi: il volo in rete ci sta, e
   l'attesa in piu' e' quella dell'esultanza. */
/* [7.525.0] dopo il gol ambientale, come nel calcio vero: tick di volo in rete + respiro e si RIPARTE DAL CENTRO · [7.530.0 NO536] chi ha subito rimette in gioco */
          /* [7.559.0] FINCHE' IL GIOCO E' FERMO, IL BERSAGLIO NON SI MUOVE. Va DOPO il clamp del passo
             (_cap528): un piazzato E' una discontinuita' — l'arbitro porta il pallone sul punto, non lo
             fa rotolare per trenta metri alla volta. */
          /* [7.559.0 blocco 4 — L'INTERRUZIONE E' UN ESITO DELLA GIOCATA, NON UN SORTEGGIO DEL REPERTORIO.
             Nel calcio vero il gioco si ferma ~90 volte in novanta minuti e quasi mai perche' «capita una
             riga»: si ferma perche' la palla ESCE o perche' l'arbitro fischia. Qui l'esito si legge da dove
             la giocata ha portato il pallone e da cosa la riga ha dichiarato: un tiro che non e' gol vicino
             al fondo diventa angolo o rinvio, una palla larga diventa rimessa, un contrasto a centrocampo
             diventa fallo. Il sorteggio e' SEEDATO su testo+minuto (`hashStr`), mai `Math.random`: il replay
             non si rompe. Le altre macchine hanno la precedenza — questa non si mette mai sopra un gol
             pendente, una ripartenza, un contropiede o un piazzato gia' in corso. */
          if(typeof window!=='undefined'&&window.__CPM_REC){try{const _y=(window.__CPM_INTBLK559=window.__CPM_INTBLK559||{righe:0,out:0,fermo:0,sp:0,hij:0,ef:0,gol:0,counter:0,ko:0,kick:0,ok:0});
            _y.righe++;
            if(outRef.current)_y.out++;else if(fermoRef.current)_y.fermo++;else if(spRef.current)_y.sp++;else if(_recHij545)_y.hij++;else if(ev.ef)_y.ef++;else if(pendingGoalRef.current)_y.gol++;else if(counterRef.current)_y.counter++;else if(kickoffRef.current>0)_y.ko++;else if(kickRef.current>0)_y.kick++;else _y.ok++;}catch(_e){}}
          if(!outRef.current&&!fermoRef.current&&!spRef.current&&!ev.ef&&!pendingGoalRef.current&&!counterRef.current&&kickoffRef.current<=0&&kickRef.current<=0
             &&!(typeof window!=='undefined'&&window.__CPM_NO559)){
            /* ⚠️ IL CANCELLO NON CHIEDE PIU' UNA RIGA LIBERA, ED E' LA CORREZIONE CHE IL CENSIMENTO HA
               IMPOSTO. Prima stava dietro a `!_recHij545` — cioe' l'interruzione poteva accadere solo se
               nessun'altra macchina stava gia' recitando — e il conto (`__CPM_INTBLK559`, 25 righe reali)
               diceva: 11 righe gia' dirottate, 7 con un gol pendente, 2 con un esito, e SOLO TRE arrivate
               qui. Un fischio che aspetta il permesso del racconto non e' un fischio.
               La separazione giusta e' questa: IL FERMO E' UN FATTO DEL PALLONE (si ferma, viene messo sul
               punto, riparte), IL RACCONTO E' UN DI PIU' — la battuta si prende solo una riga libera, cosi'
               il repertorio non si svuota e il guardiano della varieta' resta vivo. Gol, ripartenza,
               contropiede e piazzato restano avanti: sono fatti anche loro. */
            const _bx559=_bt498?_bt498.x:(ballPosRef.current.x||50),_by559=_bt498?_bt498.y:(ballPosRef.current.y||50);
            const _ri559=(Math.abs(hashStr("int|"+nx+"|"+String(ev.txt||"")))%1000)/1000;
            const _rj559=(Math.abs(hashStr("int2|"+nx+"|"+String(ev.txt||"")))%1000)/1000;
            const _tiro559=!!(ev.ms&&ev.ms.shots),_tiroLoro559=!!(ev.ms&&ev.ms.oppShots);
            let _k559=null,_no559b=true;
            /* la zona decide quando ha qualcosa da dire: un tiro che non e' gol vicino al fondo esce sul
               fondo — angolo o rinvio. Altrimenti la distribuzione di una partita vera, normalizzata:
               rimessa 48% · fallo 28% · rinvio 16% · angolo 8%. */
            if(_tiro559&&_bx559>=76){_k559=_rj559<0.34?"corner":"goal_kick";_no559b=(_k559==="corner");}
            else if(_tiroLoro559&&_bx559<=24){_k559=_rj559<0.34?"corner":"goal_kick";_no559b=(_k559==="goal_kick");}
            else if(_ri559<0.74){/* [7.559.0 taratura misurata] a 0,52 il conto era 5,0 interruzioni a partita. Il tetto NON e' la probabilita': la cronaca emette ~25 righe in novanta minuti e il pallone logico si muove solo su quelle — «25 interruzioni a partita», la soglia scritta in roadmap, pretenderebbe un fischio a ogni riga. La soglia era tarata su un calcio vero (~90 fermi) contro una cronaca che ha un quarto degli eventi: si rivede a >=8, che e' gia' tre-quattro volte le 2,3 di oggi. */
              _k559=_rj559<0.48?"throw":_rj559<0.76?"foul":_rj559<0.92?"goal_kick":"corner";
              _no559b=((Math.abs(hashStr("int3|"+nx))%100)/100)<((possessionRef.current||50)/100);
              if(_k559==="goal_kick")_no559b=(_bx559<50);/* il rinvio lo batte chi difende quella porta */
              if(_k559==="corner")_no559b=(_bx559>=50);
            }
            if(_k559){
              const _ox559=_k559==="throw"?clamp(_bx559,8,92):_k559==="corner"?(_no559b?98:2):_k559==="goal_kick"?(_no559b?6:94):clamp(_bx559,8,92);
              const _oy559=_k559==="throw"?(_by559>=50?98:2):_k559==="corner"?(_by559>=50?96:4):_k559==="goal_kick"?50:clamp(_by559,6,94);
              outRef.current={kind:_k559,nostra:_no559b,x:_ox559,y:_oy559,step:0,ttl:4};
              if(!(typeof window!=='undefined'&&window.__CPM_NO616))setTurn616(_no559b?1:-1,"interruzione-"+_k559);/* [7.616.0] l'interruzione SA di chi e' la palla (lo scrive in outRef.nostra da sempre) e finora lo buttava via: da qui il fatto diventa il turno */
              fermoRef.current={x:_ox559,y:_oy559,t:4,kind:_k559};
            /* [7.608.0 — IL PALLONE VIAGGIA VERSO LA BATTUTA, NON SI TELETRASPORTA. Rosso __CPM_NO608]
               COLLAUDO PO, due appunti con la stessa causa: «il pallone si muove come calamitato ma non ci
               sono portatori» e «il portiere fa giro giro tondo». MISURATO (teleball-607/giro-gk-607):
               2,5 teletrasporti del pallone al minuto (>10 u in UN fotogramma), 4 su 5 verso il punto del
               rinvio dal fondo (94,50); e i portieri, che si rigirano a ogni salto per guardare il
               pallone, fanno 3,2 e 4,7 GIRI COMPLETI al minuto. La causa era il setBallPos istantaneo di
               questa riga (7.559: «il logico ci arriva subito») da QUALUNQUE punto del campo.
               Ora: se il punto di battuta e' lontano piu' di 8 unita', si consegna solo il BERSAGLIO e il
               lerp del pallone ce lo porta (~1 s per mezzo campo) — un raccattapalle di fatto; da vicino
               resta lo snap, che a corto raggio l'occhio non vede. Il fermo dichiarato parte comunque:
               arriva il pallone, e ci resta. */
              ballTargetRef.current={x:_ox559,y:_oy559};
              {const _b608=ballPosRef.current||{x:50,y:50};const _lont608=Math.hypot(_ox559-_b608.x,_oy559-_b608.y)>8;
               if((typeof window!=='undefined'&&window.__CPM_NO608)||!_lont608)setBallPos({x:_ox559,y:_oy559});}
              if(typeof window!=='undefined'&&window.__CPM_REC){try{const _w=(window.__CPM_INT559=window.__CPM_INT559||{n:0,tipi:{},min:[]});_w.n++;_w.tipi[_k559]=(_w.tipi[_k559]||0)+1;if(_w.min&&_w.min.length<400)_w.min.push({m:nx,k:_k559});}catch(_e){}}
            }
          }
          if(fermoRef.current&&!(typeof window!=='undefined'&&window.__CPM_NO559)){
            const _f559=fermoRef.current;_bt498={x:_f559.x,y:_f559.y};
            _f559.t--;if(_f559.t<=0)fermoRef.current=null;}
          if(kickRef.current>0||kickoffRef.current>0)fermoRef.current=null;/* la ripartenza dal centro ha la precedenza */
          /* [7.579.0 — L'INVERSIONE DEL VERSO, IN PROVA: opt-in `__CPM_INV579`]
             MP-4/6 della roadmap, ed e' l'unico pezzo strutturale rimasto della missione «partita vera».
             Oggi la riga di cronaca COMANDA il pallone: `ballTargetRef = ev.bpos`. Per questo puo' mentire —
             e infatti mente, misurato: `destinazione` sta attorno al 70%, e la meta' delle righe dichiara un
             punto che il motore non applica nemmeno. Nessuna taratura di pesi o filtri puo' chiudere quel
             divario, perche' il divario E' il verso: chi parla decide.
             Nel verso giusto la SIMULAZIONE muove il pallone e la riga DESCRIVE cio' che e' accaduto — il
             `bpos` smette di essere un comando e resta solo un SELETTORE per la pesca (7.486/7.577), che
             gia' sceglie la riga piu' vicina a dove il gioco sta.
             RESTANO COMANDI, e non e' un'eccezione ma la stessa regola: il pallone FERMO si piazza (7.578) e
             il GOL vola in rete di diritto (7.525). Li' non c'e' niente da descrivere, c'e' da eseguire.
             MISURA APPAIATA, sulla DISTRIBUZIONE dello scarto (che non ha soglie, al contrario della
             percentuale di righe fondate, che dipende da dove si mette il taglio):
                 scarto mediano   6,7u -> 6,9u      (fermo)
                 p90             22,5u -> 21,2u
                 PEGGIORE        66,5u -> 35,3u     (dimezzato)
                 spread fra semi  40-94%  ->  67,9-77,8%
             Il totale delle righe fondate NON si muove (73,2% -> 72,0%), e non deve stupire: l'inversione
             toglie alla riga il COMANDO, non la PRETESA — la riga smette di strattonare il pallone, ma
             continua a dichiarare un punto.
             NON E' ATTIVA, ED E' UNA DECISIONE PRESA CONTRO IL MIO STESSO ENTUSIASMO. L'evidenza e' sottile:
             un valore ESTREMO dimezzato su sei partite, con p90 che migliora di poco e mediana ferma, su un
             metro che so oscillare di sette punti fra passate identiche. La regola che mi sono dato dopo il
             7.578 e' di decidere sui contatori deterministici, e questo non lo e'. Resta opt-in
             (`__CPM_INV579`) finche' non avro' una misura che regga: il codice c'e', provato e strumentato.
             ⚠️ E UNA MISURA DA CESTINARE, perche' non voglio che qualcuno la ritrovi e ci creda: avevo
             riferito che l'inversione RADDOPPIAVA il movimento del pallone (43,3% -> 57,9%, fermo 45,7s ->
             22,0s). Era un artefatto: la revoca del raggio stretto aveva lasciato un riferimento a una
             costante cancellata, la cronaca lanciava a ogni tick e il pallone lo muoveva solo la deriva —
             in ENTRAMBI i bracci. Su codice sano non c'e' differenza: 63,9% -> 65,5% in moto, fermo 4,4s ->
             4,9s. Il guardiano `ball-alive` resta rosso in tutt'e due (soglia 2s): difetto preesistente.
             [7.612.0 — ARCHIVIATA ANCHE COL METRO NUOVO] Rimisurata appaiata (stesso seed 7300) con le
             sonde nate dopo (scrittori-601, fasce-600), che misurano ESATTAMENTE i difetti del PO:
                 fasce bassa/centro/alta   13/78/8%  ->  20/71/8%   (dentro il rumore dichiarato)
                 cambi di lato              0,4/min  ->  0,4/min    (identico)
                 scivolamento (ws=3)            16%  ->  16%        (identico)
                 portatore / catena          42%/1%  ->  41%/1%     (identici)
             Togliere il comando alla riga non sposta il possesso: il pallone resta centrale perche' la
             y d'arrivo di OGNI proposta e' centrale e il richiamo di corridoio (35%, qui sopra) converge
             a y≈41 per aritmetica — 0,65·50+0,35·24 — che e' il «quarto basso 40» misurato. Il rimedio
             giusto sta nel richiamo, non nel verso: vedi 7.612. Resta opt-in per studio. */
          const _inv579=(typeof window!=='undefined'&&window.__CPM_INV579)&&!ev.ef&&!_fermo578&&!fermoRef.current&&!pendingGoalRef.current;
          if(_bt498&&_inv579){
            if(typeof window!=='undefined'&&(window.__CPM_REC||_CPM_TEST)){try{const _g=(window.__CPM_INV=window.__CPM_INV||{descrive:0,comanda:0});_g.descrive++;}catch(_e){}}
            _bt498=null;/* la riga DESCRIVE: non tocca il pallone */
          }
          /* ⚠️ [7.621.0 — FASE B/1] PROVATO E REVOCATO CON LA SUA MISURA, come l'inversione intera:
             togliere il comando del pallone alle SOLE righe MUTE (le 107 su 223 che non affermano alcun
             fatto, eppure propongono centri all'86%). Misura appaiata sulle fasce, stesso seed:
             centrale 77% contro 74% del rosso — PIATTA, dentro il rumore, identico esito del 7.579.
             La lezione, terza dello stesso filo: il comando delle righe NON e' cio' che tiene il pallone
             al centro — a dominare la posizione sono gli ALTRI scrittori (le scene, che partono nel
             corridoio centrale nell'80% dei casi, e la trama che guida solo il 5% del tempo). La Fase B
             sul verso non paga finche' il MOTORE non possiede il pallone (A2) e le SCENE non nascono
             dove il gioco sta: e' li' che va il prossimo colpo, non su questo interruttore. */
          if(_bt498){
            if(typeof window!=='undefined'&&(window.__CPM_REC||_CPM_TEST)){try{const _g=(window.__CPM_INV=window.__CPM_INV||{descrive:0,comanda:0});_g.comanda++;}catch(_e){}}
            /* [7.643.0 — LA CODA DELLE CONSEGNE. Rosso __CPM_NO643] Collo misurato del 7.642: la palla
               e' entro 2,5u di un uomo solo 3 tick su 36 perche' le RIGHE riscrivono il bersaglio ogni
               ~2 tick e il viaggio non si completa mai. Una riga di GIOCO APERTO non scavalca una
               consegna in corso: se la palla e' ancora a >6u dal bersaglio corrente, la proposta si
               ACCODA (coda da 1: l'ultima vince) e parte quando la consegna si completa. I gol e i
               fermi restano esenti (non passano da qui o hanno le loro macchine). */
            const _inFlight643=!(typeof window!=='undefined'&&window.__CPM_NO643)&&!ev.ef&&!_fermo578&&!(ev._piano649&&!(typeof window!=='undefined'&&window.__CPM_NO693))/* [7.693.0] la riga del piano non si mette in coda dietro una consegna: e' LEI la consegna */
              &&Math.hypot((ballPosRef.current.x||50)-(ballTargetRef.current.x||50),(ballPosRef.current.y||50)-(ballTargetRef.current.y||50))>6;
            if(_inFlight643){pendingBtRef.current=_bt498;
              if(typeof window!=='undefined'&&window.__CPM_REC){try{const _q=(window.__CPM_CODA643=window.__CPM_CODA643||{acc:0,diretti:0,part:0});_q.acc++;}catch(_e){}}}
            else{ballTargetRef.current=_bt498;
              if(typeof window!=='undefined'&&window.__CPM_REC){try{const _q=(window.__CPM_CODA643=window.__CPM_CODA643||{acc:0,diretti:0,part:0});_q.diretti++;}catch(_e){}}}
            /* [7.498.0] e il micro-scarto dell'eroe passa alla catena seedata: era un `Math.random()`
               rimasto dentro il tick dopo il giro F0, dove `_rndM` e' in scope. */
            if(!onBenchRef.current)setPPos(p=>({x:clamp(p.x+(_bt498.x-p.x)*0.08+(_rndM()-0.5)*1.5,3,97),y:clamp(p.y+(_bt498.y-p.y)*0.06+(_rndM()-0.5)*1.5,3,97)}));
          }
          if(ev.ms)setMxStats(s=>({shots:s.shots+(ev.ms.shots||0),oppShots:s.oppShots+(ev.ms.oppShots||0),fouls:s.fouls+(ev.ms.fouls||0),corners:s.corners+(ev.ms.corners||0)}));
          if(ev.pd&&DRIFT_PRESETS[ev.pd])driftTargetsRef.current=DRIFT_PRESETS[ev.pd];
          // A: 'at' opzionale (action type) sovrascrive LABEL + ARCO in modo indipendente da 'pd' (che resta per la FORMA della
          //   squadra) → la scritta a schermo (TIRO/CROSS/PARATA/CONTRASTO/PASSAGGIO) è sempre coerente con l'azione del testo.
          /* [7.485.0] TESTIMONE CRONACA↔CAMPO (test-only). Direttiva PO: «la cronaca deve rispecchiare
             ed essere sincronizzata con i movimenti sul campo». La riga di cronaca GUIDA il campo — dichiara
             dove va la palla (`bpos`), sposta la forma della squadra (`pd`) e lancia l'arco — quindi testo e
             movimento nascono dalla stessa sorgente e la desincronia, se c'e', e' di TEMPO: qui si registra
             l'istante d'uscita, cio' che la riga dichiara e DOVE STA il pallone in quel momento, per poter
             misurare quanta parte del tragitto dichiarato viene davvero percorsa prima della riga dopo. */
          if(typeof window!=='undefined'&&window.__CPM_BGSYNC!==undefined){try{const _g=(window.__CPM_BGSYNC=window.__CPM_BGSYNC||[]);
            if(_g.length<300)_g.push({t:Math.round(performance.now()),min:nx,txt:(ev.txt||"").slice(0,44),pd:ev.pd||null,at:ev.at||null,
              dec:_dec499,bp:_bt498?{x:+_bt498.x.toFixed(1),y:+_bt498.y.toFixed(1)}:null,da:{x:+ballPosRef.current.x.toFixed(1),y:+ballPosRef.current.y.toFixed(1)}});}catch(_e){}}/* [7.498.0] il testimone registra la destinazione EFFETTIVA (dopo il freno), non la proposta: e' quella che il pallone percorre davvero, ed e' quella che i guardiani devono giudicare *//* ⚠️ niente soggetto qui: questo varco gira PRIMA che il nome sia scelto (r.~20166) e registrerebbe il protagonista della riga PRECEDENTE. La continuita' si misura sul testo che il giocatore legge. */
          const _arcType=ev.at||BG_ARC_MAP[ev.pd]||null;
          /* [7.511.0 R1] `setBgAction` NON parte piu' qui: questo punto gira PRIMA che i nomi siano risolti
             (nota 7.485 sul testimone) e l'audit ha misurato che il 3D perdeva attore e origine. La chiamata
             vive ora DOPO la risoluzione dei nomi, col payload completo. */
          if(ev.ef==="team_goal"||ev.ef==="opp_goal"){if(typeof window!=='undefined'&&(_CPM_TEST||window.__CPM_REC)){try{(window.__CPM_FESTA=window.__CPM_FESTA||[]).push({t:Date.now(),bx:+(ballPosRef.current.x||50).toFixed(1)});}catch(_ef){}}
          if(!(typeof window!=='undefined'&&window.__CPM_NO587)){festa587.current={home:ev.ef==="team_goal",stadiumHome:(ev.ef==="team_goal")===isMatchHome,gx:(ev.ef==="team_goal")?100:0,ticks:0};} else /* [7.587.0] QUANDO parte la festa, e dov'era il pallone in quel momento. L'esultanza si arma sulla RIGA; il pallone ci mette due tick ad arrivare in rete (misurato col 7.573). Se la festa parte col pallone ancora a meta' strada, il momento e' finito prima che il gol accada — ed e' un'ipotesi che si controlla con un numero, non a naso. */setWaveEvent({t:Date.now(),home:ev.ef==="team_goal",stadiumHome:(ev.ef==="team_goal")===isMatchHome});}// [6.24.0] stadiumHome = lato TRIBUNA reale che ha segnato (team_goal=eroe → casa iff isMatchHome; opp_goal → casa iff !isMatchHome)
          // Crowd chant triggers — tutti i setTimeout tracciati in chantTimersRef
          if(ev.ef==="team_goal"){
            chantTimersRef.current.push(setTimeout(()=>chantFor("goal",3800),200));
            setScore(prev=>{chantTimersRef.current.push(setTimeout(()=>{if(prev.home>prev.away)chantFor("winning",2400);else if(prev.home<prev.away)chantFor("comeback",2600);},1800));return prev;});
          }else if(ev.ef==="opp_goal"){
            chantTimersRef.current.push(setTimeout(()=>chantFor("danger",2400),200));
            setScore(prev=>{chantTimersRef.current.push(setTimeout(()=>{if(prev.home<prev.away)chantFor("losing",2600);},1200));return prev;});
          }else if(ev.ms?.shots>0&&Math.random()<0.45)chantFor("near_miss",2000);
          else if(ev.ms?.fouls>0&&Math.random()<0.5)chantFor("foul",1800);
          else if(nx>75&&scoreRef.current.home>scoreRef.current.away&&Math.random()<0.12)chantFor("winning",2500);/* [6.0.0 MP-6] scoreRef: la closure era stantia */
          else if(nx>75&&scoreRef.current.home<scoreRef.current.away&&Math.random()<0.10)chantFor("comeback",2600);
          else if(Math.random()<0.04)chantFor("home",2500);
          // [5.77.0 MOT-4] i blocchi intervallo (Sprint 79/97) sono stati spostati FUORI dal roll BG:
          //   vivevano qui dentro e scattavano solo se un evento usciva esattamente al tick 45 (~25% delle partite).
          // Sprint 97 — extreme momentum commentary
          /* [7.494.0 F0] LA PORTA ERA SEEDATA, LA PAROLA NO. `_rndM()<0.12` decideva SE la riga usciva —
             quindi il minuto era gia' riproducibile — ma `pick()` sceglieva QUALE delle tre con un
             generatore non seedato: la stessa partita rigiocata stampava la stessa riga al minuto giusto
             con parole diverse, e il guardiano confronta `minuto|testo`. Un mezzo seed non e' un seed. */
          if(momentumRef.current>=80&&_rndM()<0.12){const _p94=["🔥 Stiamo dominando — teniamo alta l'intensità!","💪 La squadra è in fiamme, il pubblico è in piedi!","⚡ Momento magico — ogni pallone è nostro!"];addCom(_p94[Math.floor(_rndM()*_p94.length)],"#22c55e",nx);}
          else if(momentumRef.current<=20&&_rndM()<0.12){const _p94b=["😤 Reggiamo! Difendiamo compatti e aspettiamo il momento.","🛡️ Sotto pressione — serve carattere adesso.","⚠️ Stanno spingendo forte, ma noi teniamo duro!"];addCom(_p94b[Math.floor(_rndM()*_p94b.length)],"#f87171",nx);}
          // Sprint 17: momentum swings from BG events
          if(ev.ef==="team_goal")setMomentum(m=>clamp(m+25,0,100));
          else if(ev.ef==="opp_goal")setMomentum(m=>clamp(m-25,0,100));
          else if(ev.ms?.shots>0)setMomentum(m=>clamp(m+4,0,100));
          else if(ev.ms?.oppShots>0)setMomentum(m=>clamp(m-4,0,100));
          // Resolve {H},{H2},{A} name tokens from rosters
          const hAbbr=_homeClubObj?.a||_homeClubObj?.id?.slice(0,3).toUpperCase()||"HOME";/* [7.118.0] sigla NAZIONALE (ITA) in nat-ctx, non del club */
          const aAbbr=_awayClubObj?.a||_awayClubObj?.id?.slice(0,3).toUpperCase()||"AWAY";
          // [7.120.0 audit robustezza] helper unico: usa TUTTA la lunghezza del roster (prima `length-1` escludeva
          //   sempre l'ultimo giocatore da {H}/{H2}) + guardia su roster vuoto (length 0 → index -1 → .name su
          //   undefined = pageerror in partita). {A} era già corretto.
          /* [7.487.0 direttiva PO «deve descrivere effettivamente cio' che accade»] CHI NOMINA LA CRONACA.
             Fino a qui ogni riga pescava un nome A CASO dalla rosa: il centravanti spazzava in area
             propria, il portiere crossava, e soprattutto ogni riga presentava un ESTRANEO — nessun filo,
             che e' il contrario di una telecronaca («palla a Rossi… Rossi apre a destra… cross di Rossi»).
             Due correzioni, entrambe misurabili: il RUOLO coerente con la zona dichiarata, e la
             CONTINUITA' del soggetto per qualche riga. */
          const _RUOLI487={attack_goal:/centravanti|attaccante|ala|trequartista/i,attack:/attaccante|centravanti|ala|trequartista|mezzala/i,
            wide_right:/ala|terzino/i,midfield:/mediano|centrocampista|mezzala|trequartista|jolly/i,
            retreat:/difensore|terzino|mediano/i,defend_goal:/difensore|terzino|portiere/i};
          const _perZona487=(r,pd)=>{const re=_RUOLI487[pd];if(!re||!r||!r.length)return r;
            if(typeof window!=='undefined'&&window.__CPM_NO488)return r;/* prova del rosso: nessun filtro per reparto → il nome torna a essere un sorteggio */const f=r.filter(m=>m&&re.test(m.role||""));return f.length?f:r;};
          const _pickN=(r,ab,pd,escl)=>{if(!r||!r.length)return "il compagno ("+ab+")";
            let pool=_perZona487(r,pd);if(escl)pool=pool.filter(m=>m&&_surnBG(m.name||"")!==escl).length?pool.filter(m=>m&&_surnBG(m.name||"")!==escl):pool;
            const m=pool[Math.floor(_rndM()*pool.length)];/* [7.489.0] anche CHI viene nominato e' funzione del minuto */
            /* [7.488.0] il RUOLO scelto si registra QUI, dove la scelta avviene: il 7.487 aveva lasciato
               la coerenza nome↔ruolo «implementata ma non misurata» perche' la sonda cercava di risolvere
               i ruoli delle rose dal browser e non ci riusciva. Il dato nasce in questa riga. */
            if(typeof window!=='undefined'&&window.__CPM_ROLE487!==undefined){try{const _r=(window.__CPM_ROLE487=window.__CPM_ROLE487||[]);if(_r.length<400)_r.push({pd:pd||null,role:(m&&m.role)||null,pool:pool.length,tot:r.length});}catch(_e){}}
            return (_surnBG((m&&m.name)||"")||"il compagno")+" ("+ab+")";};
          /* [7.170.0 collaudo PO «Gol avversario. jr (SAL) buca la nostra difesa» ×2 screenshot] DUE bug qui:
             (a) i template BG_MATCH sono scritti in PROSPETTIVA EROE ({H}=noi · {A}=l'avversario, come ef team_goal/opp_goal)
                 ma i token venivano risolti per SEDE (homeRoster/awayRoster) → in TRASFERTA {A} pescava dalla rosa
                 dell'EROE e {H} da quella avversaria (gol avversario firmato da un NOSTRO giocatore, fallo tattico
                 attribuito a noi col beneficio all'avversario). Ora la risoluzione è hero-relative via isMatchHome.
             (b) il cognome era split(' ').pop() → i nomi con suffisso («Rossi jr») stampavano solo «jr». */
          const _ourR170=(isMatchHome?homeRoster:awayRoster)||homeRoster, _oppR170=(isMatchHome?awayRoster:homeRoster)||awayRoster;
          const _ourAb170=isMatchHome?hAbbr:aAbbr, _oppAb170=isMatchHome?aAbbr:hAbbr;
          /* CONTINUITA' DEL SOGGETTO: chi la cronaca ha appena nominato resta il protagonista per qualche
             riga, finche' la zona non cambia reparto o non succede un gol. E' cio' che trasforma una
             sequenza di frasi in un'AZIONE raccontata. Il filo si spezza da solo: dopo 3 righe, su un gol,
             o quando si passa dall'attacco alla difesa. */
          const _rep487=pd=>/attack|wide_right/.test(String(pd||""))?"att":/retreat|defend_goal/.test(String(pd||""))?"dif":"med";
          const _rp=_rep487(ev.pd);const _sub=bgSubjRef.current;
          const _tieni=_sub&&_sub.rep===_rp&&_sub.left>0&&!/goal/.test(String(ev.ef||""));
          const hN=(ev.ef==="team_goal"&&_evName170)?(_evName170+" ("+_ourAb170+")"):(_tieni?_sub.n:_pickN(_ourR170,_ourAb170,ev.pd));
          if(ev.ef==="team_goal"&&_evName170)bgSubjRef.current=null;
          else if(_tieni)bgSubjRef.current={n:_sub.n,rep:_rp,left:_sub.left-1};
          else bgSubjRef.current={n:hN,rep:_rp,left:3};
          const hN2=_pickN(_ourR170,_ourAb170,ev.pd,_surnBG(String(hN).replace(/\s*\(.*$/,"")));
          /* l'avversario si nomina con la zona SPECULARE: se noi ci difendiamo, chi attacca e' un loro
             attaccante — non un loro difensore, che era l'effetto del sorteggio cieco. */
          const _pdOpp=({attack_goal:"defend_goal",attack:"retreat",wide_right:"retreat",midfield:"midfield",retreat:"attack",defend_goal:"attack_goal"})[ev.pd]||ev.pd;
          const aN=(ev.ef==="opp_goal"&&_evName170)?(_evName170+" ("+_oppAb170+")"):_pickN(_oppR170,_oppAb170,_pdOpp);
          const _pN76=_surnBG(player.name)||player.name.split(" ").pop();/* [7.173.0] {P} suffisso-aware */
          let evTxt=ev.txt.replace(/{H2}/g,hN2).replace(/{H}/g,hN).replace(/{A}/g,aN).replace(/{P}/g,_pN76).replace(/{DERBY}/g,drby?.name||"Derby");
          if(ev.ef==="team_goal"){const _h4=((scoreRef.current&&scoreRef.current.home)||0)+1,_a4=(scoreRef.current&&scoreRef.current.away)||0;evTxt=evTxt.replace("Squadra in vantaggio!",_h4>_a4?"Squadra in vantaggio!":_h4===_a4?"Pareggio ristabilito!":"La riapriamo!");}/* [7.178.0 RC-4] il template unico diceva «in vantaggio!» anche sotto 1-3 */
          // ATE-3: colore commentary tipo-specifico + C: il testo appare all'APICE ESATTO dell'arco → delay = metà della
          //   durata REALE dell'arco (ATE3_TYPEMS[arco]/2), derivata dal tipo d'azione risolto (con 'at') invece della vecchia
          //   tabella per-pd → label, arco e cronaca combaciano nel tempo anche quando 'at' cambia il tipo rispetto a 'pd'.
          /* [7.487.0] testimone del TESTO RISOLTO (test-only): e' la riga che il giocatore legge, coi nomi
             gia' sostituiti — leggerla dal DOM si e' rivelato inaffidabile tre volte, qui e' la sorgente. */
          /* [7.511.0 R1 — L'EVENTO ARRIVA AL 3D INTERO: audit «l'evento logico arriva dimezzato»] La chiamata
             era a monte dei nomi con tre campi ({type,t,ballEnd}): il 3D non sapeva CHI agisce, per quale
             squadra, ne' DA DOVE parte il pallone — e l'arco partiva «da dove la mesh si trova per caso».
             Ora il payload porta origine (la posizione logica al momento dell'evento), lato e attore: e' il
             primo tratto della spina dorsale MatchEvent del restyling. Stesso tick sincrono di prima: nessun
             cambio di tempi, solo piu' verita' nel canale. */
          /* [7.533.0 MP-0 — IL CANALE DICE LA VERITA', rosso __CPM_NO546] tre bugie del canale cronaca→3D
             chiuse alla sorgente (audit pipeline §5, misura in sonda):
             (a) SIDE: era una regex su ef (/^opp_/) + oppShots — il contropiede AVVERSARIO e il ponte
                 difensivo arrivavano al 3D come side:"home", e gesto+ricevente si cercavano fra i NOSTRI;
                 ora il lato lo dichiara la macchina di recita (_recSide546) o il verso dell'azione pendente,
                 e la regex resta solo per le righe libere.
             (b) BALLEND: le righe in volo (pending/counter/ponte, _bt498 null) mandavano l'arco a (50,50) —
                 il CENTRO del campo — mentre la palla logica correva in area: il retarget 7.523 agganciava
                 un ricevente vicino al centro e il 3D contraddiceva la recita. Ora l'arco insegue il
                 bersaglio VERO della macchina (ballTargetRef, che le macchine avanzano ogni tick).
             (c) la recita entra nel REGISTRO: cpmEv("recita") con kind/side/destinazione — le macchine
                 7.528-7.532 non emettevano nulla e i guardiani non potevano vederle. */
          const _no546=(typeof window!=='undefined'&&window.__CPM_NO546);
          const _side511=(/^opp_/.test(ev.ef||"")||(ev.ms&&(ev.ms.oppShots||0)>0))?"away":"home";
          const _side546=_no546?_side511:(_recSide546||(pendingGoalRef.current?(pendingGoalRef.current.dir>0?"home":"away"):_side511));
          const _end546=_bt498||((!_no546&&(_recHij545||pendingGoalRef.current))?{x:+(ballTargetRef.current.x||50).toFixed(1),y:+(ballTargetRef.current.y||50).toFixed(1)}:{x:50,y:50});
          const _rk546=_recKind546||(pendingGoalRef.current?"pending":null);
          if(_rk546)cpmEv("recita",{min:nx,kind:_rk546,side:_side546,ex:_end546.x,ey:_end546.y,arc:_arcType||null});
          if(_arcType){
            /* [7.537.0 NO551] quando parla la CATENA, l'attore non e' un nome pescato dal testo ma il
               passatore dichiarato, e il ricevente viaggia con l'evento (`rcv`): l'audit MP segnalava
               che il 3D lo indovinava per prossimita' (7.523) — ora la palla vola all'uomo NOMINATO. */
            const _az551=ev._az551||null;
            const _act511=_az551?String(_az551.da||"").trim():(String((_side546==="away"?aN:hN)||"").replace(/\s*\(.*$/,"")||null);
            setBgAction({type:_arcType,t:Date.now(),ballEnd:_end546,
              from:{x:+(ballPosRef.current.x||50).toFixed(1),y:+(ballPosRef.current.y||50).toFixed(1)},
              side:_side546,actor:_act511,rcv:_az551?String(_az551.a||"").trim():null,ef:ev.ef||null,pd:ev.pd||null});
          }
          if(typeof window!=='undefined'&&window.__CPM_TXT487!==undefined){try{const _t=(window.__CPM_TXT487=window.__CPM_TXT487||[]);if(_t.length<300)_t.push({m:nx,txt:evTxt,pd:ev.pd||null,ef:ev.ef||null});}catch(_e){}}
          /* [7.496.0 F1b] LA RIGA DI CRONACA NEL REGISTRO, con cio' che DICHIARA: la zona (`pd`), dove
             manda il pallone (`bpos`) e quali statistiche si porta dietro (`ms`). E' il verso invertito
             che l'audit ha misurato — il testo che comanda il campo e il box-score — e serve poterlo
             contare prima di raddrizzarlo in F3. Registrato alla SORGENTE, non dal DOM (nota 7.487). */
          if(pendingGoalRef.current&&!(typeof window!=='undefined'&&window.__CPM_NO644)){try{const _pgL644=pendingGoalRef.current;const _ltN644=_pgL644.dir>0?"home":"away";if((_recHij545&&_recSide546===_ltN644)||(!_recHij545&&possTurnRef.current===_pgL644.dir))_pgL644.righeLato=(_pgL644.righeLato|0)+1;}catch(_e644){}}/* [7.644.0] LA RIGA CONTA PER LA RETE SOLO SE E' DEL LATO CHE SEGNA: macchina che dichiara il lato giusto, o repertorio emesso col turno del lato. FOTOGRAFATO (golback644b): `righe` contava righe di CHIUNQUE — costruzioni chiuse regolari (righe>=3) con ZERO racconto del lato che poi segnava. */
          cpmEv("chronicle",{min:nx,lib:(ev._lib666?1:0),/* [7.684.0] la riga viene dalla LIBRERIA delle azioni salienti: senza questo campo il guardiano non poteva distinguere «la catena e' morta» da «la catena e' stata sostituita da un altro sistema che racconta la stessa cosa meglio» */dec:_dec499,fase:_fase501,tn:possTurnRef.current,rec:_recHij545?1:0,poss:(ev.poss||0),muta:(!ev.ef&&!ev.ms&&!ev.poss&&!ev.sp)?1:0,/* [7.554.0 MISSIONE — IL REGISTRO DICE TUTTO QUELLO CHE LA RIGA FA] Il registro portava esito, tabellino, palla ferma e zona, ma NON il possesso: due famiglie di verdetti della sonda `fatti-546` leggevano campi inesistenti e stampavano ZERO in silenzio a ogni passata, perche' una famiglia assente non fa rumore. Con 31 righe su 223 che spostano il possesso, oggi NESSUNA sonda puo' dire quante righe lo muovono. E `muta` dichiara in chiaro cio' che finora si deduceva per esclusione: la riga non afferma NIENTE — ne' un esito, ne' una statistica, ne' un possesso, ne' una palla ferma. Sono 107 su 223, e muovono comunque pallone, schieramento e gesto. Sola strumentazione: `cpmEv` non tocca stato ne' render. */pd:ev.pd||null,rk:_recKind546||null,/* [7.578.0] QUALE macchina ha scritto la riga (kickoff · out_* · sp_* · counter · catena · ponte). Senza, `rec:1` mette nello stesso mucchio il pallone fermo e il gioco aperto, che hanno regole opposte: il primo RICOLLOCA il pallone per natura, il secondo no. Una sonda che li somma non puo' dire se il tetto del 7.498 stia proteggendo o smentendo. */concorda:(ev.pd===_dec499),ef:ev.ef||null,bx:ev.bpos?ev.bpos.x:null,by:ev.bpos?ev.bpos.y:null,bex:_bt498?+_bt498.x.toFixed(1):null,bey:_bt498?+_bt498.y.toFixed(1):null,bax:+ballPosRef.current.x.toFixed(1),bay:+ballPosRef.current.y.toFixed(1),npd:(function(){try{const _b=ballPosRef.current;const _lt=(possTurnRef.current>0)?"home":"away";let _d=null;(matchPlayersRef.current||[]).forEach(q=>{if(!q||q.team!==_lt||q.gk)return;const _dd=Math.hypot((q.x||50)-_b.x,(q.y||50)-_b.y);if(_d==null||_dd<_d)_d=_dd;});return _d==null?null:+_d.toFixed(1);}catch(_e){return null;}})(),/* [7.624.0 strumentazione] CUSTODIA LOGICA alla riga: distanza del piu' vicino uomo del lato in possesso dalla palla logica. Serve il metro per il redesign A2: due metri a fotogrammi (POR526 e l'anello ws) sono stati SQUALIFICATI con lo studio di ripetibilita' (±10-15 punti fra run a codice identico — campionamento a orologio su renderer col jitter); questo campiona un EVENTO del tick logico, quasi-seedato. cpmEv e' inerte per costruzione. *//* [7.576.0 — IL REGISTRO SEPARA CIO' CHE LA RIGA DICE DA CIO' CHE IL MOTORE FA] Finora il registro portava solo `bx/by`, cioe' la destinazione PROPOSTA dalla riga. Ma fra la proposta e il pallone ci sono due passaggi: il FRENO del 7.498 (tetto 30u per riga, piu' il richiamo verso il corridoio del 7.528) puo' accorciare la proposta, e poi il motore del possesso puo' portare il pallone altrove. Con un solo numero le tre cose sono indistinguibili, e il giudice della cronaca non puo' dire di CHI e' la colpa: se la riga ha mentito, se il freno l'ha smentita, o se qualcun altro ha spostato il pallone dopo. `bex/bey` = dove il motore manda DAVVERO il pallone (dopo il freno); `bax/bay` = dov'era il pallone quando la riga e' uscita. Sola strumentazione: `cpmEv` non tocca stato ne' render. */shots:(ev.ms&&ev.ms.shots)||0,oppShots:(ev.ms&&ev.ms.oppShots)||0,sp:ev.sp||null,at:ev.at||null}/* [7.545.0] `sp` e `at` nel registro: senza, una riga che ANNUNCIA una palla ferma non e' distinguibile da una che non lo fa, e il pezzo «gli eventi fermi esistono» non ha come misurarsi */);/* [7.532.0] tn: il turno al momento della riga — strumentazione permanente per il ritmo side-aware */
          let cColor=ev._intx669?(ev._intx669==="MISTER"?"#f0b33a":ev._intx669==="AVVERSARI"?"#f87171":ev._intx669==="EROE"?"#93c5fd":"#86efac"):ev.ef==="team_goal"?"#16a34a":ev.ef==="opp_goal"?"#dc2626":ev.ef==="opp_red"?"#16a34a":ev.ef==="opp_injury"?"#f59e0b":ATE3_ARCCOL[_arcType]||TH.faint;
          if(pendingGoalRef.current&&!ev.ef)cColor="#fbbf24";/* [7.530.0 collaudo PO «quando c'è un'azione offensiva che può portare al gol ci deve essere maggiore enfasi/suspance»] durante l'azione pendente il banner scala sull'ambra calda: si VEDE che sta montando qualcosa (la densita' 1,30 del 7.528 gia' incalza il ritmo) */
          else if(counterRef.current&&!ev.ef)cColor=counterRef.current.dir>0?"#fbbf24":"#f87171";/* [7.532.0 NO542] il ribaltamento ha il suo colore: ambra il nostro, rosso il loro */
          const _sc681=ev._intxSc681||null;
          if(_arcType&&ATE3_TYPEMS[_arcType]){chantTimersRef.current.push(setTimeout(()=>addCom(evTxt,cColor,nx,_sc681),Math.round(ATE3_TYPEMS[_arcType]/2)));}
          else addCom(evTxt,cColor,nx,_sc681);
          /* [7.681.0] il contesto della scheda serve anche DOPO, per scrivere l'esito della scelta:
             lo si mette da parte insieme all'id, cosi' il ramo che applica la scelta non deve
             ricostruirlo (e non puo' divergere da quello con cui la frase e' stata scritta). */
          if(_sc681){try{intxPendRef681.current={id:ev._intxId681,sc:_sc681,ctx:intxCtxRef681.current,min:nx};if(typeof window!=='undefined'){window.__CPM_SC681_PEND=(window.__CPM_SC681_PEND||0)+1;window.__CPM_SC681_ARC=(window.__CPM_SC681_ARC||[]);window.__CPM_SC681_ARC.push(String(_arcType||"-"));}}catch(_e681){}}/* [7.721 strumentazione] schede messe in sospeso + arco della riga */
          /* [7.486.0] LA SECONDA VOCE. Non racconta l'azione: la LEGGE, e parla DOPO la prima — e' cio'
             che distingue un commento tecnico da una riga di cronaca in piu'. Una volta ogni cinque, mai
             sui gol (li' la scena ha gia' la sua voce), e agganciata all'apice dell'arco come la prima
             cosi' non si accavallano. La frase e' scelta col seed del testo+minuto: deterministica, quindi
             la stessa azione non cambia commento fra due passate. */
          /* [7.490.0] IL PESO DELL'EVENTO decide quanto respiro lasciare prima della riga successiva.
             Importanti sono quelli che la direttiva nomina e che il motore produce davvero: gol,
             espulsione, infortunio, rigore, palo/traversa, parata (l'arco `save`). 7 tick = 6,3 secondi a
             1x: il tempo di leggere due volte e di guardare la scena. Gli altri restano a 3 (2,7 s).
             ⚠️ Nessun evento NUOVO viene inventato per dare enfasi: si cambia solo quanto dura il
             silenzio dopo quelli che il motore ha gia' prodotto. */
          /* ⚠️ LA PRIMA DEFINIZIONE ERA TROPPO STRETTA e la misura l'ha detto subito: ZERO eventi importanti
             su 15 righe: gol, espulsioni e infortuni sono rari per costruzione (la lambda del micro-sim
             da' ~0,7 gol a partita), quindi l'enfasi non si sarebbe mai vista. La direttiva pero' nomina
             anche «grandi occasioni» e «parate importanti», e quelle il motore le produce eccome: sono i
             TIRI, che ogni riga dichiara nel suo `ms`. Contarli non inventa nulla — sono statistiche gia'
             prodotte, non eventi aggiunti per fare scena. */
          {const _ms=ev.ms||{};
           const _imp=/goal|red|injury/.test(String(ev.ef||""))||/PALO|TRAVERSA|RIGORE|ESPULS/i.test(String(ev.txt||""))||_arcType==="save"||(_ms.shots|0)>0||(_ms.oppShots|0)>0;
           /* [7.501.0 F5] IL PAVIMENTO SEGUE LA FASE. L'enfasi dopo un evento importante (7 tick, 7.490)
              resta e ha la PRECEDENZA: e' il momento in cui si deve leggere. Sotto, il respiro cambia — si
              incalza in area, si prende tempo in costruzione. */
           const _cool501=(typeof window!=='undefined'&&window.__CPM_NO501)?3:(_fase501==="pericolo"?2:_fase501==="sviluppo"?3:5);
           /* [7.681.0] UNA RIGA CHE CHIEDE DI DECIDERE HA IL RESPIRO PIU' LUNGO DI TUTTI. Misurato alla
              prima stesura: su tre interazioni una sola arrivava a produrre una scelta, perche' le altre
              due venivano spinte fuori dal banner da una riga di cronaca successiva prima che il timer
              scattasse — i bottoni sparivano dallo schermo e la decisione restava li' in sospeso.
              ⚠️ [7.682.0] DODICI TICK ERANO TROPPI, e ci sono arrivato dopo una diagnosi SBAGLIATA.
              Il guardiano dava «catena-viva 4 righe» contro la banda di 5, coi turni scesi da 26 a 22, e
              avevo incolpato il FREEZE: raccogliendo per un tempo reale fisso, tre pause da venti secondi
              gli mangiavano un minuto di partita. Tolto il freeze dall'autoplay, i turni sono rimasti 22:
              ipotesi smentita. La causa sono questi tick — tre righe da dodici, su una cronaca che ne ha
              ventisei in tutta la gara, fanno ventisette tick di silenzio in piu', e la catena degli
              schemi e' la prima a pagarli. Sette, come un gol: il tempo per LEGGERE non serve piu' qui,
              perche' adesso lo da' il freeze, che ferma la partita di suo. */
           /* ⚠️ [7.687.0 — LE AZIONI SALIENTI USCIVANO A RATE, e per questo il PO non le vedeva.
              Quarta segnalazione, e le misure precedenti dicevano tutte «ci sono»: 4 azioni composte a
              partita, 4-10 righe l'una, strutture distinte. Erano vere e non servivano a niente.
              Guardando il BANNER invece del registro, riga per riga: la libreria apre un'azione all'8',
              al 43' e all'84', ma le sue righe compaiono al 12', 17', 18', 45', 84' — una ogni tre o
              quattro minuti, con altre frasi in mezzo. La cronaca emette una riga ogni ~3,5 minuti di
              gioco, quindi un'azione da cinque righe si spalma su quindici minuti: nessuno la puo'
              riconoscere come un'azione, e da fuori sono frasi sconnesse.
              Una mini-sequenza calcistica dura dieci secondi. Finche' un'azione della libreria e' in
              corso il respiro scende al minimo: le sue righe si incalzano come l'azione che raccontano,
              e l'azione finisce prima che ne cominci un'altra. */
           const _libVivo687=!!(libAzRef666.current&&libAzRef666.current.i<(libAzRef666.current.righe||[]).length);
           bgCoolRef.current=(typeof window!=='undefined'&&window.__CPM_NO490)?3:((_libVivo687&&!(typeof window!=='undefined'&&window.__CPM_NO687))?1:(_sc681?7:(_imp?7:_cool501)));
           if(typeof window!=='undefined'&&window.__CPM_IMP490!==undefined){try{const _w=(window.__CPM_IMP490=window.__CPM_IMP490||[]);if(_w.length<200)_w.push({m:nx,imp:!!_imp,t:Math.round(performance.now())});}catch(_e){}}}
          tcCountRef.current++;
          /* ⚠️ RITARDO E FREQUENZA CORRETTI DOPO LA MISURA: la prima stesura usava 950 ms e una riga su
             cinque, e in 60 secondi non e' MAI comparsa. La causa non era la probabilita': uscendo da
             `playing` il gioco azzera tutti i timer dei cori (regola di coerenza 5.47.5 — la cronaca non
             parla sopra un highlight), e con gli HL che occupano due terzi del tempo un commento a quasi
             un secondo di distanza veniva quasi sempre cancellato. La regola e' giusta; sbagliati erano i
             numeri. Ora 1 riga su 3 e mezzo secondo dopo: il commento sta attaccato alla sua azione. */
          if(tcCountRef.current%3===0&&ev.pd&&COMMENTO_TECNICO[ev.pd]&&!/goal/.test(String(ev.ef||""))){
            const _tcv=telecronistiRef.current,_poolT=COMMENTO_TECNICO[ev.pd];
            const _fr=_poolT[Math.abs(hashStr(String(ev.txt)+nx))%_poolT.length];
            const _dlyT=(_arcType&&ATE3_TYPEMS[_arcType]?Math.round(ATE3_TYPEMS[_arcType]/2):0)+260;
            /* testimone test-only: distingue «mai programmato» da «programmato e cancellato», che
               vogliono rimedi opposti — la prima volta ho corretto la frequenza quando il problema era
               la cancellazione, e la seconda ho corretto il ritardo senza sapere quale dei due fosse. */
            if(typeof window!=='undefined'&&window.__CPM_TC486!==undefined){try{const _w=(window.__CPM_TC486=window.__CPM_TC486||{prog:0,usc:0});_w.prog++;}catch(_e){}}
            chantTimersRef.current.push(setTimeout(()=>{try{if(typeof window!=='undefined'&&window.__CPM_TC486)window.__CPM_TC486.usc++;}catch(_e){}addCom("🎧 "+(_tcv?_tcv.t:"Commento tecnico")+": «"+_fr+"»","#c4b5fd",nx);},_dlyT));
          }
        }
        /* [7.566.0 missione — L'INTERRUZIONE SI STACCA DALLA RIGA DI CRONACA]
           Il 7.559 ha reso il fermo un fatto del pallone, ma l'ha fatto nascere DENTRO il blocco che emette
           una riga di telecronaca — e quel blocco gira ~25 volte a partita, non a ogni minuto. Da li' il
           tetto misurato: 3,0-4,5 interruzioni a partita, e alzare la probabilita' da 0,52 a 0,74 non
           spostava il conto perche' il collo di bottiglia non era il sorteggio, era la CADENZA DEL RACCONTO.
           Un fischio non aspetta che il telecronista abbia qualcosa da dire. Qui l'armamento vive nel TICK,
           dove batte il minuto di gioco: ~90 occasioni invece di ~25. Il tipo si legge da DOVE sta il
           pallone (fondo -> angolo o rinvio · fascia -> rimessa · resto -> fallo), non piu' da cosa
           dichiarava la riga: cosi' non serve nemmeno che una riga esista. Il racconto resta un di piu' e
           si prende una riga libera quando c'e'. Sorteggio seedato su `nx`: il replay non si rompe.
           DURATA: due tick. Un tick e' un minuto di gioco — una rimessa che ne dura quattro sarebbe una
           partita ferma piu' che giocata (25 interruzioni x 4 tick = 100 tick su 90 di partita). */
        /* [7.566 strumento] QUANTE OCCASIONI ARRIVANO DAVVERO AL FISCHIO. Il primo giro per tick ha reso
           5,0 interruzioni a partita invece delle ~12 che il conto prometteva (~90 tick x probabilita').
           Prima di rialzare il sorteggio — l'ho gia' fatto una volta, da 0,52 a 0,74, e non sposto' nulla —
           si conta QUANTI tick arrivano qui e chi li ferma. */
        if(typeof window!=='undefined'&&window.__CPM_REC){try{const _y=(window.__CPM_TICKBLK566=window.__CPM_TICKBLK566||{tick:0,fase:0,out:0,fermo:0,sp:0,gol:0,counter:0,ko:0,kick:0,ok:0,zona:{fondo:0,fascia:0,centro:0},esce:0});
          _y.tick++;
          if(phaseRef.current!=="playing")_y.fase++;else if(outRef.current)_y.out++;else if(fermoRef.current)_y.fermo++;else if(spRef.current)_y.sp++;else if(pendingGoalRef.current)_y.gol++;else if(counterRef.current)_y.counter++;else if(kickoffRef.current>0)_y.ko++;else if(kickRef.current>0)_y.kick++;else{
            _y.ok++;const _b=ballPosRef.current||{x:50,y:50};const _bx2=_b.x==null?50:_b.x,_by2=_b.y==null?50:_b.y;
            if(_bx2>=80||_bx2<=20)_y.zona.fondo++;else if(_by2>=74||_by2<=26)_y.zona.fascia++;else _y.zona.centro++;/* [7.628 v2] bin allineati alle soglie del trigger: il testimone non deve mentire sulla fascia */}
        }catch(_e){}}
        /* [7.628.0 v2 — IL FALLO TATTICO FERMA LA RIPARTENZA. stesso rosso __CPM_NO628]
           Il censimento dei tick: il contropiede tiene 6 minuti a partita intoccabili dall'arbitro — ma
           nel calcio la ripartenza che muore per fallo (tattico) e' un classico. p 0,30 sul minuto: il
           contropiede si chiude, il fallo arma punizione+fermo, il turno passa a chi l'ha subito. */
        if(!(typeof window!=='undefined'&&window.__CPM_NO628)&&!(typeof window!=='undefined'&&window.__CPM_NO566)&&counterRef.current&&!counterRef.current.fin&&!outRef.current&&!fermoRef.current&&!spRef.current&&!pendingGoalRef.current&&kickoffRef.current<=0&&kickRef.current<=0&&phaseRef.current==="playing"){
          const _rT=(Math.abs(hashStr("tackfoul|"+nx))%1000)/1000;
          if(_rT<0.30){const _dirC=counterRef.current.dir;counterRef.current=null;
            const _bpT=ballPosRef.current||{x:50,y:50};
            const _oxT=clamp(_bpT.x,8,92),_oyT=clamp(_bpT.y,6,94);
            /* [7.629.0] il fallo tattico che arriva TARDI — contropiede gia' in area — e' rigore: il caso
               da manuale (chi rincorre stende chi ripartiva davanti al portiere). Stesso rosso __CPM_NO629. */
            const _penT629=!(typeof window!=='undefined'&&window.__CPM_NO629)&&_oyT>=30&&_oyT<=70&&((_dirC>0&&_oxT>=84)||(_dirC<0&&_oxT<=16));
            const _muteT632=!(typeof window!=='undefined'&&window.__CPM_NO632)&&!_penT629&&outStoryRef.current>=(1+Math.floor(nx/12));/* [7.632 v7] stesso tetto di racconto */
            outRef.current={kind:"foul",nostra:_dirC>0,x:_oxT,y:_oyT,step:0,ttl:4,t0:Date.now(),pen629:_penT629,mute632:_muteT632};/* il fallo tattico lo commette chi rincorre: la punizione e' di chi RIPARTIVA (dir del counter) */
            fermoRef.current={x:_oxT,y:_oyT,t:4,kind:"foul"};
            ballTargetRef.current={x:_oxT,y:_oyT};
            if(!(typeof window!=='undefined'&&window.__CPM_NO616))setTurn616(_dirC>0?1:-1,"interruzione-foul-tattico");
            if(typeof window!=='undefined'&&window.__CPM_REC){try{const _w=(window.__CPM_INT559=window.__CPM_INT559||{n:0,tipi:{},min:[]});_w.n++;const _ktT629=_penT629?"pen_tattico":"foul_tattico";_w.tipi[_ktT629]=(_w.tipi[_ktT629]||0)+1;}catch(_e){}}
          }
        }
        if(!(typeof window!=='undefined'&&window.__CPM_NO566)&&!outRef.current&&!fermoRef.current&&!spRef.current
           &&!pendingGoalRef.current&&!counterRef.current&&kickoffRef.current<=0&&kickRef.current<=0&&phaseRef.current==="playing"){
          const _bp=ballPosRef.current||{x:50,y:50};
          const _bx=_bp.x==null?50:_bp.x,_by=_bp.y==null?50:_bp.y;
          const _r1=(Math.abs(hashStr("tick|"+nx))%1000)/1000,_r2=(Math.abs(hashStr("tick2|"+nx))%1000)/1000;
          let _k=null,_no=true;
          /* [7.628.0 — L'ARBITRO ESISTE: le soglie di zona diventano RAGGIUNGIBILI. Rosso __CPM_NO628]
             COLLAUDO PO su 7.627: «ZERO schemi, punizioni, rigori — non e' una partita vera». MISURATO
             (bilancio-628 + censimento tick 7.566): 2 interruzioni in 90' contro le 15-25 vere, e il
             perche' e' geometrico — dei 45 tick ambientali, 18 li mangia la costruzione del gol e 6 il
             contropiede; i 16 liberi sono TUTTI al centro (fondo 0, fascia 0), perche' la rimessa chiedeva
             y>=84 ma i corridoi della trama arrivano a cy 76, e il corner chiedeva x>=88 col rimbalzo
             storico a 82: soglie IRRAGGIUNGIBILI per costruzione. Tre viti: rimessa dal bordo corridoio
             (74/26), corner ambientale da x>=80 (prob 0,10), fallo 0,20->0,35 sui tick centrali.
             Atteso ~10-15 fischi/90' (banda reale minima), misurato sotto. */
          const _no628=(typeof window!=='undefined'&&window.__CPM_NO628);
          const _thF628=_no628?84:74,_thF628b=_no628?16:26,_cx628=_no628?88:80,_foul628=_no628?0.20:0.55;/* [7.628 v2] 0,35 non bastava: sui ~16 minuti superstiti il sorteggio per-minuto a seed fisso e' una lotteria a estrazioni bloccate, e ogni fischio congela 4 tick (tetto strutturale ~3-4). A 0,55 l'atteso sui superstiti e' ~8, auto-limitato dal fermo a ~5 */
          if(_bx>=88){_k=_r2<0.38?"corner":"goal_kick";_no=(_k==="corner");}
          else if(_bx<=12){_k=_r2<0.38?"corner":"goal_kick";_no=(_k==="goal_kick");}
          else if(!_no628&&_bx>=_cx628&&_r1<0.10){_k=_r2<0.55?"corner":"goal_kick";_no=(_k==="corner");}
          else if(!_no628&&_bx<=100-_cx628&&_r1<0.10){_k=_r2<0.55?"corner":"goal_kick";_no=(_k==="goal_kick");}
          else if(_by>=_thF628||_by<=_thF628b){if(_r1<0.55)_k="throw",_no=_r2<((possessionRef.current||50)/100);}
          else if(_r1<_foul628)_k="foul",_no=_r2<0.5;
          if(_k){
            const _ox=_k==="throw"?clamp(_bx,8,92):_k==="corner"?(_no?98:2):_k==="goal_kick"?(_no?6:94):clamp(_bx,8,92);
            const _oy=_k==="throw"?(_by>=50?98:2):_k==="corner"?(_by>=50?96:4):_k==="goal_kick"?50:clamp(_by,6,94);
            /* [7.629.0 — FALLO IN AREA = RIGORE, rosso __CPM_NO629] Non un sorteggio in piu': la REGOLA.
               Area: x oltre 84 (o sotto 16) con y centrale 30-70. `nostra` dice di chi e' la punizione:
               se e' nostra dentro l'area LORO e' rigore per noi; se e' loro dentro l'area NOSTRA e' rigore
               per loro. La riga del fischio (macchina out, step 1) lo annuncia e passa il testimone alla
               macchina sp. Atteso raro per costruzione (~86% dei tick liberi sta al centro): giusto cosi'. */
            const _pen629=!(typeof window!=='undefined'&&window.__CPM_NO629)&&_k==="foul"&&_oy>=30&&_oy<=70&&((_no&&_ox>=84)||(!_no&&_ox<=16));
            const _mute632=!(typeof window!=='undefined'&&window.__CPM_NO632)&&!_pen629&&outStoryRef.current>=(1+Math.floor(nx/12));/* [7.632 v7] oltre il tetto di racconto il fischio nasce muto (il rigore mai) */
            outRef.current={kind:_k,nostra:_no,x:_ox,y:_oy,step:0,ttl:4,t0:Date.now(),pen629:_pen629,mute632:_mute632};
            if(!(typeof window!=='undefined'&&window.__CPM_NO616))setTurn616(_no?1:-1,"interruzione-"+_k);/* [7.616.0] vedi il sito gemello della riga *//* [7.602.0] anche l'ora: vedi la scadenza in tempo vero nel clock tick */
            fermoRef.current={x:_ox,y:_oy,t:4,kind:_k};/* [7.566] DUE TICK NON BASTAVANO, e la misura lo ha detto: col fermo a 2 il pallone stava davvero fermo solo 5 volte su 10 (a 4 era 6 su 6). Il motivo non e' il tempo di GIOCO ma quello REALE: la mesh deve arrivare sul punto, e il conto scorre ora nel tick — che passa quando passa. */
            /* [7.608.0] stessa regola del sito 559: da lontano il pallone VIAGGIA verso la battuta. */
            ballTargetRef.current={x:_ox,y:_oy};
            {const _b608b=ballPosRef.current||{x:50,y:50};const _lont608b=Math.hypot(_ox-_b608b.x,_oy-_b608b.y)>8;
             if((typeof window!=='undefined'&&window.__CPM_NO608)||!_lont608b)setBallPos({x:_ox,y:_oy});}
            if(typeof window!=='undefined'&&window.__CPM_REC){try{const _w=(window.__CPM_INT559=window.__CPM_INT559||{n:0,tipi:{},min:[]});_w.n++;const _kT629=_pen629?"pen":_k;_w.tipi[_kT629]=(_w.tipi[_kT629]||0)+1;if(_w.min&&_w.min.length<400)_w.min.push({m:nx,k:_kT629});}catch(_e){}}
          }
        }
        /* [7.566.0] e il FERMO scorre nel tick, non nella riga: altrimenti un'interruzione nata fra due
           battute resterebbe congelata finche' il telecronista non riapre bocca. */
        if(fermoRef.current&&!(typeof window!=='undefined'&&window.__CPM_NO559)){
          const _f=fermoRef.current;ballTargetRef.current={x:_f.x,y:_f.y};
          _f.t--;if(_f.t<=0)fermoRef.current=null;}
        if(outRef.current&&!(typeof window!=='undefined'&&window.__CPM_NO566)){
          /* [7.632.0 v3 — IL FISCHIO HA DUE OROLOGI E QUI BATTEVA IL PIU' CRUDELE] Il testimone
             OUTDIE632 ha scagionato il ttl per riga (0 morti) e mostrato solo 5 righe con fischio vivo
             su ~20 attese: QUESTO sito decrementava lo STESSO ttl a ogni TICK — 4 tick e via, rimessa
             silenziosa, ben prima del cap 20s e della prossima riga (~ogni 3 tick). I conti si separano:
             per riga resta ttl 4 (contratto 7.559), per tick un budget dedicato di 10 piu' il cap 20s
             in tempo vero — ed ENTRAMBI sfociano nella rimessa silenziosa (il gioco riprende comunque,
             contratto 7.572). Rosso __CPM_NO632: torna il ttl condiviso a 4 tick. */
          const _no632t=(typeof window!=='undefined'&&window.__CPM_NO632);
          const _mor632=_no632t?(--outRef.current.ttl<=0)
            :((outRef.current.tk632=(outRef.current.tk632|0)+1)>=4||(outRef.current.t0&&(Date.now()-outRef.current.t0)>20000)||(!!pendingGoalRef.current&&!outRef.current.pen629));/* [7.632 v8 — IL VANTAGGIO] se la costruzione del gol parte, l'arbitro lascia correre: il fischio minore (mai il rigore) si risolve subito in silenzio — tenerlo vivo sopra il pendingGoal bloccava la catena col suo gate proprio nei minuti del gol (guardiano: gol-con-manovra 0/4) *//* [7.632 v6] budget 10->6->4: TARATO DAL GUARDIANO — a 6 tick il fermo mangiava i tick del sorteggio e arbitro-esiste e' andato rosso (5<6 fischi). A 4 tick il costo per fischio torna quello storico ma con i conti separati, la catena che cede e la palla tenuta: ~1,5 occasioni di riga per fischio, racconto ~50% — la coperta corta fra fischi e racconto e' il tetto dei tick ambientali (18 li mangia il gol-in-costruzione, voce in coda), non questa vite */
          if(_mor632){
          /* [7.572.0] LA RIMESSA SILENZIOSA. La battuta dell'interruzione si prende solo una riga libera:
             se quella riga non arriva, l'interruzione scade e finora NESSUNO rimetteva il pallone in gioco.
             `fermoRef` si spegneva, ma `ballTargetRef` restava puntato sul punto della rimessa — e il
             pallone rimaneva li' finche' una riga di cronaca non ne dichiarava un altro, cioe' per minuti.
             Misurato dal giudice della cronaca: le destinazioni piu' sbagliate erano tutte righe
             `defend_goal` con la x giusta e la y inchiodata a 98, cioe' sulla linea laterale.
             Il gioco riprende comunque: il pallone torna DENTRO il campo anche quando il telecronista non
             ha avuto modo di dirlo. Un arbitro non aspetta che qualcuno commenti. */
          const _o572=outRef.current;outRef.current=null;fermoRef.current=null;
          if(!(typeof window!=='undefined'&&window.__CPM_NO572)){
            const _q572=(Math.abs(hashStr("rip|"+nx))%100)/100;
            const _rx572=clamp(_o572.x+(_o572.nostra?14:-14),8,92);
            const _ry572=_o572.kind==="throw"?clamp(_o572.y>=50?_o572.y-(16+_q572*26):_o572.y+(16+_q572*26),8,92)
                        :_o572.kind==="corner"?clamp(50+(_q572-0.5)*30,10,90)
                        :clamp(_o572.y+(_q572-0.5)*24,8,92);
            ballTargetRef.current={x:_rx572,y:_ry572};setBallPos({x:_rx572,y:_ry572});
            if(typeof window!=='undefined'&&window.__CPM_REC){try{const _w=(window.__CPM_RIP572=window.__CPM_RIP572||{n:0});_w.n++;}catch(_e){}}
          }
        }}
        // Possession drift + momentum drift every ~8 ticks
        if(nx%8===0){
          setPossession(p=>clamp(p+(Math.floor(_rndM()*5)-2),20,80));/* [7.489.0] seedato: alimenta la lambda del micro-sim, quindi il RISULTATO */
          setMomentum(m=>clamp(Math.round(m+(50-m)*0.08),0,100));
        }
        // Formation micro-drift — ogni 3 tick i giocatori si avvicinano lentamente al preset corrente
        /* [7.538.0 missione «partita vera» — rosso __CPM_NO553] I REPARTI SEGUONO LA PALLA, E LA PALLA HA UN
           PADRONE. Questo blocco era l'UNICO movimento dei ventidue durante il gioco ambientale, e il suo
           bersaglio e' uno SLOT FISSO di formazione: i giocatori tornavano sempre allo stesso punto del campo
           qualunque cosa facesse il pallone. Il solo legame con la palla stava nel renderer (`_lineShift`,
           +-9u al massimo): ecco perche' l'utente vede ventidue che non giocano e un pallone che vaga da
           solo. MISURATO prima del rimedio, con palla e giocatori letti dalla STESSA sorgente (__CPM_OWN):
           palla senza padrone il 22% dei minuti, 12 uomini su 22 la toccano, 15 cambi di portatore in 90'.
           Ora lo slot TRASLA con l'avanzamento del pallone (il reparto sale e scende come una linea, e lo
           fanno entrambe le squadre: il gioco si comprime attorno alla palla come in una partita vera) e
           l'uomo piu' vicino del lato in possesso ci va DAVVERO — e' lui il portatore, e quando la palla si
           sposta il portatore cambia. Solo a gioco vivo: durante un highlight la scena e' dell'executor. */
        /* [7.544.0 — LA SCOPERTA CHE VALE PIU' DEL RIMEDIO] QUESTO BLOCCO NON GIRAVA QUASI MAI.
           `driftTargetsRef` nasce a `null` e viene assegnato SOLO quando il mister da' un ordine tattico
           con un preset di movimento: fino ad allora il cancello `&&driftTargetsRef.current` spegneva
           l'INTERO movimento dei ventidue — compresa la traslazione dei reparti col pallone (7.538) e il
           portatore che va sulla palla (7.538/7.539).
           E' emerso misurando la ripartenza dopo il gol: il rimedio non spostava il numero nemmeno di un
           punto (33% → 25% → 25%), e il confronto fra le DUE sorgenti ha escluso il renderer — anche il
           modello LOGICO non era schierato. Un rimedio che non muove NIENTE non e' un rimedio sbagliato:
           e' codice che non viene percorso.
           ⚠️ E OBBLIGA A CORREGGERE UNA CONCLUSIONE PRECEDENTE: nel 7.542, misurando il «giro giro tondo»,
           verde e rosso erano risultati IDENTICI (21,8u contro 21,6u) e ne avevo dedotto «la traslazione
           dei reparti del 7.538 non c'entra». Erano identici perche' in NESSUNO dei due bracci quel codice
           girava. La conclusione era giusta per la ragione sbagliata, ed e' peggio che sbagliata.
           Ora il preset di partenza e' lo schieramento di riposo: il blocco gira dal calcio d'inizio. */
        /* [7.588.0 — LA RIPRESA NON HA IL TEMPO DI SCHIERARSI, rosso __CPM_NO588]
           COLLAUDO PO: «dopo un gol le squadre non tornano nelle meta' campo proprie». Misurato mediana
           CINQUE giocatori nella meta' sbagliata, tutti ospiti fra x30 e x45.
           CINQUE IPOTESI MIE CADUTE, ognuna con la sua misura: non e' un ritardo · non e' che il
           ripiegamento non giri · non e' un sistema di riferimento sbagliato (i bersagli sono 78 e 62,
           giusti) · non e' la catena di gioco (silenziarla PEGGIORA: 5 -> 6) · non e' uno scrittore che
           ricostruisce l'elenco (tutti e dodici usano `prev.map`, nessuno scarta il lavoro altrui).
           RESTA L'UNICA SPIEGAZIONE COMPATIBILE, e il codice se l'era gia' scritta nel 7.544: «lo
           schieramento gira ogni TRE tick e la finestra ne dura ~6 — due sole occasioni di muoversi».
           Con un guadagno di 0,92 due occasioni basterebbero; una sola no, e quando la finestra si chiude
           prima della seconda i ventidue restano dov'erano. Durante una ripresa lo schieramento gira
           dunque a OGNI tick: la ripresa e' un'interruzione, non un inseguimento, e le squadre si
           schierano mentre l'arbitro aspetta. Fuori dalla ripresa il passo resta di tre tick — quello
           regola il costo, e non c'e' ragione di toccarlo. */
        /* [7.602.0 — LE BANDIERE DELL'INTERRUZIONE SCADONO IN TEMPO VERO, rosso __CPM_NO602]
           TERZA ISTANZA DELLA STESSA PATOLOGIA in due giorni, dopo kickRef (7.590) e la finestra della
           ripresa: il ttl di `outRef` scala PER RIGA DI CRONACA («la battuta si prende solo una riga
           libera», 7.559) e le righe arrivano ogni parecchi secondi. MISURATO: la partita passa il 40% del
           tempo con le bandiere out/sp alzate, e in 26 punti su 40 il pallone SI MUOVE (>2 u/s) mentre lo
           stato dice «palla ferma». In quel quarto di partita i ventidue si comportano da rimessa, la
           catena degli schemi non gira (e' una delle ragioni del suo 5%), e il pallone insegue bersagli di
           battuta stantii. La scadenza per righe RESTA (e' il contratto con la cronaca); qui si aggiunge
           il tetto che mancava: un'interruzione dura al massimo cinque secondi VERI. Nel calcio una
           rimessa si batte in quattro-cinque secondi; qui e' anche il tempo oltre il quale lo stato
           mentirebbe al resto del motore. */
        if(!(typeof window!=='undefined'&&window.__CPM_NO602)){
          const _now602=Date.now();
          /* [7.629.0 — LA GHIGLIOTTINA DEI 5 SECONDI AFFAMAVA LE RECITE PIAZZATE. Rosso __CPM_NO629B]
             MISURATO (seed 512): fischio «RIGORE!» al 32', dischetto MAI — e nei censimenti 7.628 le righe
             sp_* sono ZERO su intere partite. Il perche' e' aritmetico: la macchina sp avanza solo quando
             la cronaca le porta una riga, e le righe arrivano ogni 10-20 secondi reali; una scadenza a 5s
             sulla VITA INTERA uccide ogni recita prima della seconda battuta. E' la radice del «ZERO
             schemi, punizioni, rigori» del PO: le macchine esistono dal 7.530, ma dal 7.602 muoiono di
             fame in silenzio. Il contratto 7.602 («lo stato non mente») si onora al contrario: finche' il
             piazzato e' armato la palla si TIENE al punto della cerimonia (fermo ri-armato) — palla ferma
             VERA, stato onesto — e la valvola di sicurezza scatta a 30s di inattivita' (l'orologio si
             rinfresca a ogni passo della recita). Il fischio-rigore in attesa della sua riga vive 20s:
             un rigore fischiato non evapora. */
          const _no629b=(typeof window!=='undefined'&&window.__CPM_NO629B);
          /* [7.632.0 — OGNI FISCHIO VIVE FINCHE' NON SI RACCONTA. Rosso __CPM_NO632]
             COLLAUDO PO su 7.631: «ancora non vedo corner, punizioni, rigori, falli laterale». Il gap
             fra registro e occhi e' MISURATO: 8-10 fischi armati per 90' nel registro del turno, ma
             1-3 righe out_* in cronaca — il fischio si arma nel tick e la ghigliottina dei 5s lo fa
             evaporare prima che la cronaca (righe ogni 10-20s) gli dia una riga. Il PO legge le RIGHE:
             un fischio senza riga per lui non esiste. Stessa cura del rigore (7.629B), estesa a tutte
             le interruzioni: cap 20s e palla TENUTA al punto di battuta finche' la bandiera vive — nel
             calcio vero una rimessa costa 10-20 secondi reali di palla ferma, e' la banda giusta. */
          const _no632=(typeof window!=='undefined'&&window.__CPM_NO632);
          const _capOut629=(outRef.current&&!_no629b&&(outRef.current.pen629||!_no632))?20000:5000;
          if(outRef.current&&outRef.current.t0&&(_now602-outRef.current.t0)>_capOut629){outRef.current=null;fermoRef.current=null;}
          else if(!_no629b&&outRef.current&&(outRef.current.pen629||!_no632)&&!fermoRef.current){fermoRef.current={x:outRef.current.x,y:outRef.current.y,t:4,kind:outRef.current.kind||"foul"};}
          const _capSp629=_no629b?5000:30000;
          if(spRef.current&&spRef.current.t0&&(_now602-spRef.current.t0)>_capSp629){if(typeof window!=='undefined'&&window.__CPM_REC){try{const _v=(window.__CPM_SPVALV629=window.__CPM_SPVALV629||{n:0,verb:[]});_v.n++;if(_v.verb.length<20)_v.verb.push({m:nx,st:spRef.current.step,k:spRef.current.kind});}catch(_e){}}spRef.current=null;if(!_no629b)fermoRef.current=null;}
          else if(!_no629b&&spRef.current&&!fermoRef.current){fermoRef.current={x:spRef.current.sx!=null?spRef.current.sx:spRef.current.x,y:spRef.current.sy!=null?spRef.current.sy:50,t:4,kind:spRef.current.kind};}
        }
        /* [7.610.0 — ANCHE LA RIPRESA SCADE IN TEMPO VERO, rosso __CPM_NO610]
           Il gemello dichiarato del 7.602, gia' misurato nel 7.590 e rimasto aperto: `kickRef` e
           `kickoffRef` scendono solo quando la cronaca aggancia una riga, e restano sopra zero per 19-28
           SECONDI a ogni gol. Il censimento degli stati dice che questo vale il 21% DELLA PARTITA — piu'
           di highlight e fermi messi insieme — e per tutto quel tempo il gol resta parcheggiabile
           (7.575), la palla esente dai guardiani del fermo (7.578) e il gioco in un limbo che non e' ne'
           festa ne' partita. La recita vera (pallone in rete, boato, rientro) sta nei primi secondi:
           MISURATO nel 7.590, la finestra utile dura 2-4,5 s. Otto secondi dall'armamento bastano a
           qualunque recita; oltre, i contatori mentono. `ripT0Ref` e' gia' armato nei tre siti giusti
           (gol, duplice fischio, calcio d'inizio recitato) dal 7.590. */
        if(!(typeof window!=='undefined'&&window.__CPM_NO610)&&ripT0Ref.current>0&&(Date.now()-ripT0Ref.current)>8000&&((kickRef.current|0)>0||(kickoffRef.current|0)>0)){
          kickRef.current=0;kickoffRef.current=0;ripT0Ref.current=0;
        }
        const _koNow590=((kickRef.current|0)>0||(kickoffRef.current|0)>0);
        ripTickRef.current=_koNow590?((ripTickRef.current|0)+1):0;
        /* [7.590.0] la finestra si apre SOLO dove la ripresa viene ARMATA (gol, duplice fischio, calcio
           d'inizio recitato) e non si riapre da sola. Prima la aprivo qui, al primo tick con un contatore
           sopra zero: e i contatori NON tornano quasi mai a zero — misurato, l'eta' della finestra
           arrivava a 46,4 s con mediana 19,1 s, cioe' era aperta per meta' partita. Qui si CHIUDE soltanto. */
        if(!_koNow590)ripT0Ref.current=0;
        const _breve590=_koNow590&&(!(typeof window!=='undefined'&&window.__CPM_NO590)?(ripT0Ref.current>0&&(Date.now()-ripT0Ref.current)<=4500):true);
        const _ognitick588=!(typeof window!=='undefined'&&window.__CPM_NO588)&&_breve590;
        /* ⚠️ [7.702.0 — IL TESTIMONE DELLA CUSTODIA TRADIVA LA PROPRIA DICHIARAZIONE, DAL 7.625.]
           Il suo commento promette «si campiona ogni tick di gioco vivo, ~150 campioni/run», ma il
           blocco stava DENTRO il cancello dello schieramento (un tick su tre) e dopo le esclusioni
           restavano 5-8 campioni per run: la banda ha giudicato per settanta release su un campione
           venti volte piu' piccolo del progettato, e le palle morte regolamentari del 7.702 (angolo o
           rinvio dopo la parata) l'hanno fatta scendere sotto il minimo — due giri identici a 5
           campioni, «non giudicabile». Un metro che una transizione da regolamento rende cieco e' un
           metro rotto: il prelievo torna dove il suo commento ha sempre detto che stava, fuori dal
           cancello, a ogni tick di gioco vivo. Le esclusioni (fermo, out, costruzione, calci) restano
           identiche: cambia il QUANDO si guarda, non il COSA. */
        if(typeof window!=='undefined'&&window.__CPM_NPD!==undefined&&phaseRef.current==='playing'&&!fermoRef.current&&!outRef.current&&!pendingGoalRef.current&&kickRef.current<=0&&kickoffRef.current<=0){try{/* [7.649.0] +pendingGoal fra le esclusioni: il campione dichiara FASE 0 (gioco libero) e gia' esclude le macchine — la scena-gol ora e' una scena a salti DICHIARATI (lanci/aperture nel testo), non custodia libera; includerla misurava il disegno, non il difetto. La banda <=12 resta identica sul gioco libero. */
            const _bN=ballPosRef.current;const _ltN=possTurnRef.current>0?"home":"away";let _dN=null;
            (matchPlayersRef.current||[]).forEach(q=>{if(!q||q.team!==_ltN||q.gk)return;const _dd=Math.hypot((q.x||50)-_bN.x,(q.y||50)-_bN.y);if(_dN==null||_dd<_dN)_dN=_dd;});
            if(_dN!=null&&window.__CPM_NPD.length<4000)window.__CPM_NPD.push(+_dN.toFixed(1));}catch(_e){}}
        if(nx%3===0||_ognitick588){
          const dt=driftTargetsRef.current||DRIFT_PRESETS.midfield;
          /* [7.625.1 strumentazione] CUSTODIA PER TICK, non alla riga: il metro npd-alla-riga (7.624) e'
             SQUALIFICATO anche lui — campiona l'istante del lancio (la riga muove il bersaglio, la palla
             parte) e quindi misura la GITTATA dei passaggi, non la custodia: per questo ne' il guadagno
             dell'inseguitore ne' l'inversione del verso lo muovevano — quarta cattura della classe
             «campione condizionato» (7.594). Qui si campiona ogni tick di gioco vivo, ~150 campioni/run. */
          if(!(typeof window!=='undefined'&&window.__CPM_NO642)&&carrierRef.current&&carrierRef.current.i!=null){try{
            const _qd642=(matchPlayersRef.current||[])[carrierRef.current.i];const _bt642=ballTargetRef.current;
            if(_qd642&&_bt642&&Math.hypot((_qd642.x||50)-(_bt642.x||50),(_qd642.y||50)-(_bt642.y||50))>12)carrierRef.current=null;/* [7.642.0 v2] DECADENZA: la palla mandata oltre 12u dal portatore lo scavalca — non e' piu' suo, finche' un arrivo non elegge il prossimo */
          }catch(_e){}}
          if(typeof window!=='undefined'&&window.__CPM_CARRIER641!==undefined&&phaseRef.current==='playing'&&!fermoRef.current&&!outRef.current){try{
            const _c641=carrierRef.current;const _b641=ballPosRef.current;let _d641=null;
            if(_c641&&_c641.i!=null){const _q641=(matchPlayersRef.current||[])[_c641.i];if(_q641)_d641=+Math.hypot((_q641.x||50)-_b641.x,(_q641.y||50)-_b641.y).toFixed(1);}
            const _W641=window.__CPM_CARRIER641;if(_W641.length<4000)_W641.push({c:_c641?1:0,d:_d641});}catch(_e){}}/* [7.641.0 F1a strumento] copertura del portatore-stato e distanza dal pallone: la BASELINE prima che il motore lo usi */
          const _q553=!(typeof window!=='undefined'&&window.__CPM_NO553)&&phaseRef.current==='playing';
          const _bb553=(_q553&&ballTargetRef.current)?ballTargetRef.current:null;
          const _av553=_bb553?clamp(_bb553.x-50,-46,46):0;
          setMatchPlayers(prev=>{
            /* [7.544.0] finestra della ripartenza: dal conto dopo il gol fino all'ultima battuta recitata */
            /* [7.590.0] la finestra e' quella BREVE: vedi la nota sul contatore. Fuori dai primi 14 tick
               il ramo della ripresa non deve piu' schiacciare nessuno nella propria meta'. */
            const _ko544=_breve590;
            if(typeof window!=='undefined'&&window.__CPM_KOC!==undefined){try{window.__CPM_KOC.blocco=(window.__CPM_KOC.blocco||0)+1;if(_ko544)window.__CPM_KOC.ko=(window.__CPM_KOC.ko||0)+1;}catch(_e){}}
            const _koLato544=kickoffSideRef.current||"home";
            const _cerchio544=[];
            if(_ko544){let _bd=[];prev.forEach((pl,i)=>{if(!pl||pl.gk||pl.team==="ref")return;
              if((pl.team==="home")!==(_koLato544==="home"))return;
              _bd.push({i,d:Math.hypot((pl.x||50)-50,(pl.y||50)-50)});});
              _bd.sort((a,c)=>a.d-c.d);_bd.slice(0,2).forEach(q=>_cerchio544.push(q.i));}
            let _cI553=-1;
            /* ⚠️ [7.538.0] PROVATA E REVOCATA CON LA SUA MISURA: la ROTAZIONE del portatore. Il portatore
               e' sempre l'uomo piu' vicino, quindi la palla la toccano sempre gli stessi (12 su 22 in 90
               minuti, contro i 16-20 di una partita vera). Ho provato a ruotare fra i quattro candidati
               entro 22u, col minuto come indice — deterministico, nessun sorteggio nuovo. Misura su sei
               partite intere: uomini diversi 12 → 12 (nessun guadagno), cambi di portatore 15 → 13,
               palla senza padrone 33% → 36%. Il motivo si legge nei numeri: designare un uomo lontano non
               gli mette il pallone tra i piedi, gli chiede di ANDARE a prenderlo — e mentre ci va la palla
               non e' di nessuno. Il conteggio «uomini diversi» resta quindi DICHIARATO NON CENTRATO (12
               contro i 15 promessi): si sposta dando ai compagni un ruolo nella giocata (appoggio, taglio,
               scarico), non cambiando l'etichetta di chi ce l'ha. */
            /* ⚠️ [7.539.1] PROVATO E REVOCATO CON LA SUA MISURA: gli APPOGGI attorno al portatore.
               Terzo tentativo sul conteggio «uomini diversi che toccano palla» (12 su 22 contro i 16-20
               veri), e il terzo a cadere. I tre compagni piu' vicini lasciavano lo slot di formazione per
               prendere un appoggio geometrico attorno al portatore — uno alle spalle, due davanti sui lati.
               Misura su sei partite: uomini 12 → 11, cambi di portatore 16 → 12, palla senza padrone
               27% → 31%, fascia centrale 58% → 60%. Peggiora TUTTO, e il perche' si legge nei numeri:
               tirare i tre compagni piu' vicini ADDOSSO al pallone li toglie da dove la squadra vuole
               andare — la giocata successiva li ritrova ammucchiati al centro, quindi le giocate si
               accorciano e il gioco torna a centrocampo.
               LEZIONE, scritta perche' e' costata tre stesure: questo numero non si sposta ne' cambiando
               CHI riceve (7.538) ne' DOVE stanno gli altri (qui). Si sposta solo rendendo il possesso una
               SEQUENZA DI PASSAGGI DISCRETI — la palla lascia i piedi di un uomo NOMINATO e arriva ai
               piedi di un altro uomo NOMINATO — invece di un bersaglio che scivola. E' il pezzo che manca,
               ed e' piu' grande di una taratura: la catena della cronaca (7.537) lo fa gia' per tre tocchi
               ogni sei minuti, e la strada e' farne il motore del possesso invece di un ornamento. */
            if(_bb553){let _cD=1e9;const _lt=(possTurnRef.current>0)?"home":"away";
              prev.forEach((pl,i)=>{if(!pl||pl.team!==_lt||pl.gk)return;const d=Math.hypot((pl.x||50)-_bb553.x,(pl.y||50)-_bb553.y);if(d<_cD){_cD=d;_cI553=i;}});}
            return prev.map((pl,idx)=>{
            if(pl.team==="ref")return pl;
            let sx,sy,k;
            if(pl.team==="home"){
              const s=dt[Math.min(idx,dt.length-1)];
              sx=s.x;sy=s.y;k=0.04;// 4.85.0: micro-jitter ridotto (era 0.6) → movimento verso lo slot, niente twitch casuale
            }else{
              // Away (difensori): mantengono la LINEA verso lo slot di formazione, jitter minimo (era 0.7, puro random)
              const as=FORMATION_AWAY[Math.min(Math.max(idx-11,0),FORMATION_AWAY.length-1)]||{};
              sx=as[0]!=null?as[0]:pl.x;sy=as[1]!=null?as[1]:pl.y;k=0.03;
            }
            if(_ko544&&!pl.gk){
              /* [7.544.0 direttiva PO «dopo un gol i giocatori devono rientrare verso il centrocampo,
                 disporsi nuovamente e riprendere il gioco dalla propria meta' campo, invece di continuare
                 con movimenti scollegati»] LA RIPARTENZA E' UNO SCHIERAMENTO, NON UN'ATTESA.
                 MISURA del difetto: dopo il gol il PALLONE torna al centro (7.525) ma i ventidue no —
                 continuano a inseguire lo slot TRASLATO con la palla, con guadagno 0,04/0,03 ogni tre tick,
                 cioe' ~25 minuti di gioco per ritrovare la posizione. Il pallone e' fermo a centrocampo e
                 attorno la squadra si muove come se l'azione continuasse: e' il «movimenti scollegati».
                 Qui, per tutta la finestra della ripartenza, lo slot torna quello BASE (nessuna traslazione:
                 il pallone e' al centro, non c'e' niente da seguire) e il guadagno sale a 0,35 — i ventidue
                 rientrano nella propria meta' e si dispongono in una manciata di secondi, come in una
                 partita vera. Chi batte resta al centro: i due piu' avanzati del lato che riparte si
                 piazzano sul cerchio. */
              /* ⚠️ RI-TARATO DAL GUARDIANO. Riportare i ventidue allo slot BASE non bastava: 40% di riprese
                 schierate contro la soglia dell'80%, mediana 7 uomini su 10 nella propria meta'. Il motivo
                 e' che lo schieramento base NON e' uno schieramento da calcio d'inizio — le punte stanno a
                 cavallo della linea di meta' campo (gli ospiti le hanno a x 40-45, cioe' gia' dall'altra
                 parte). In una partita vera al calcio d'inizio TUTTI stanno dalla propria meta', e solo i
                 due che battono sono nel cerchio. Qui lo slot si RIPIEGA nella propria meta': la squadra
                 tiene la sua forma ma la comprime dietro la linea, che e' esattamente cio' che si vede in
                 televisione un istante prima del fischio. */
              /* [7.588.0 SOLO COLLAUDO] cosa vede DAVVERO il ripiegamento, giocatore per giocatore. Tre
                 ipotesi mie sulla causa sono gia' cadute (non e' un ritardo, il blocco gira otto volte per
                 ripresa, gli slot sono in coordinate di campo): resta da guardare cosa arriva QUI. */
              const _casa544=(pl.team==="home");
              const _post589=_casa544?Math.min(sx,46):Math.max(sx,54);
              if(typeof window!=='undefined'&&window.__CPM_RIP544){/* [7.589.0] FINESTRA SCORREVOLE, non un tetto: con un tetto fisso il registro si riempiva alla PRIMA
                 ripresa (190+210 = 400 voci in una sola) e poi taceva — gli esempi raccontavano il calcio d'inizio
                 e li ho quasi presi per la ripresa dopo il gol. Uno strumento che si riempie e' uno strumento che
                 mente per omissione. */
              try{const _R=window.__CPM_RIP544;_R.push({i:idx,t:String(pl.team||"?"),gk:!!pl.gk,pre:+Number(sx).toFixed(1),x:+Number(pl.x).toFixed(1),post:_post589});if(_R.length>400)_R.shift();}catch(_e){}}
              sx=_post589;
              const _mia544=_casa544===(_koLato544==="home");
              if(_mia544&&_cerchio544.indexOf(idx)>=0){sx=_casa544?48:52;sy=_cerchio544.indexOf(idx)===0?50:(_casa544?46:54);}
              /* ⚠️ SECONDA TARATURA DAL GUARDIANO, e stavolta e' aritmetica: lo schieramento gira ogni TRE
                 tick e la finestra della ripartenza ne dura ~6 — due sole occasioni di muoversi. Con
                 guadagno 0,35 i ventidue coprivano meta' strada e la misura restava al 33% contro l'80%.
                 Ma una ripartenza NON e' un inseguimento: e' un'interruzione, e in televisione le squadre
                 sono gia' schierate quando l'arbitro fischia. Qui e' uno SNAP, come lo snap di scena degli
                 highlight — il riposizionamento e' voluto e istantaneo, non un movimento da guardare. */
              k=0.92;
            }
            else if((function(){const _f=fermoRef.current;return _f&&!pl.gk&&!(typeof window!=='undefined'&&window.__CPM_NO633)&&(/corner/.test(String(_f.kind||""))||/pen/.test(String(_f.kind||"")));})()){
              /* [7.633.0 — SULLE PALLE INATTIVE LE SQUADRE SI SCHIERANO. Rosso __CPM_NO633]
                 Direttiva PO su 7.631: «sulle palle inattive le squadre devono essere posizionate /
                 schierate in maniera corretta». Finora durante il fermo i ventidue restavano negli slot
                 di formazione: un corner con l'area vuota, un rigore con la difesa dentro l'area. Qui,
                 finche' il fermo vive (e col 7.632 vive finche' non si racconta), gli slot si
                 SOVRASCRIVONO per tipo — pattern dello schieramento di ripresa 7.544, guadagno 0,35 a
                 tick (si VEDONO camminare in posizione, niente teletrasporto). Deterministico per
                 indice: nessun sorteggio nuovo (invariante 7.511).
                 CORNER: chi attacca manda 4 uomini in area piu' il battitore alla bandierina; chi
                 difende ne schiera 5 in area. RIGORE: tutti ad arco FUORI area (limite 84/16), il
                 dischetto resta al battitore e al portiere. */
              const _f633=fermoRef.current;const _atkR633=_f633.x>50;/* il punto sta nel campo di destra: attacca chi tira verso destra (home) */
              if(typeof window!=='undefined'&&window.__CPM_REC){try{const _w=(window.__CPM_SCH633=window.__CPM_SCH633||{n:0,kinds:{}});_w.n++;_w.kinds[String(_f633.kind)]=(_w.kinds[String(_f633.kind)]||0)+1;}catch(_e){}}/* [7.633 strumento] il ramo gira davvero? */
              const _mine633=(pl.team==="home")===_atkR633;
              const _pen633=/pen/.test(String(_f633.kind||""));
              const _gx633=_atkR633?92:8,_sgn633=_atkR633?-1:1;
              const _ri633=idx%11;/* indice stabile dentro la squadra (0-10, gk escluso dal ramo) */
              if(_pen633){
                sx=_atkR633?(80+(_ri633%2)*2):(20-(_ri633%2)*2);sy=18+_ri633*6.4;/* arco fuori area, entrambe le squadre */
              }else if(_mine633){
                if(_ri633===1){sx=_atkR633?97:3;sy=_f633.y>=50?95:5;}/* battitore alla bandierina */
                else if(_ri633<=5){sx=_gx633+_sgn633*(2+(_ri633-2)*2);sy=36+(_ri633-2)*9;}/* 4 in area */
                else{sx=_atkR633?64:36;sy=30+(_ri633-6)*10;}/* i rimanenti sul limite, pronti alla respinta */
              }else{
                if(_ri633<=5){sx=_gx633+_sgn633*(0.5+(_ri633-1)*1.5);sy=32+(_ri633-1)*8;}/* 5 a difendere l'area */
                else{sx=_atkR633?70:30;sy=34+(_ri633-6)*11;}
              }
              k=0.35;
            }
            else if(!(typeof window!=='undefined'&&window.__CPM_NO642)&&carrierRef.current&&carrierRef.current.i===idx&&!pl.gk&&phaseRef.current==='playing'&&tramaRef.current&&tramaRef.current.wp&&!fermoRef.current&&Math.hypot((pl.x||50)-(ballTargetRef.current.x||50),(pl.y||50)-(ballTargetRef.current.y||50))<8){
              /* [7.642.0 F1b-1 v2] IL PORTATORE CONDUCE SOLO CON LA PALLA AI PIEDI (<8u dal bersaglio):
                 la v1 senza questo gate lo faceva correre al waypoint anche quando una riga aveva mandato
                 la palla altrove — misurato: distanza portatore-palla 16,3->28u, PEGGIO. Con la palla sua,
                 il suo slot e' l'intenzione della trama (waypoint), a passo umano (k 0,5 sul ciclo). */
              sx=clamp(tramaRef.current.wp.x,4,96);sy=clamp(tramaRef.current.wp.y,6,94);k=0.5;
            }
            else if(_bb553&&!pl.gk){
              /* ⚠️ [7.703 — PROVATO E REVOCATO IN UN'ORA: LA MANOPOLA NON E' COLLEGATA AL VOLANTE.]
                 Il codice 006 quantificato (baricentro difensivo a 37,5u dal pallone, correlazione 0,336)
                 indicava questo termine come leva ovvia: tira gli slot verso la x del pallone, 0,62 per
                 tutti. Alzarlo a 0,85 per il lato che difende — +37% — NON HA MOSSO NIENTE: correlazione
                 0,314 contro 0,313, distanza 38,2 contro 37,5. Su 37 unita' di distanza, zero. Quindi la
                 posizione del blocco e' governata ALTROVE e questo termine e' cosmetico: prima di provare
                 la prossima manopola serve il censimento di quale ramo decide davvero il bersaglio di ogni
                 difensore (il testimone __CPM_SCH703 qui sotto), o si ricomincia a girare manopole a caso. */
              if(typeof window!=='undefined'&&window.__CPM_REC){try{const _w=(window.__CPM_SCH703=window.__CPM_SCH703||{ball:0,avSum:0,avN:0});_w.ball++;_w.avSum+=Math.abs(_av553);_w.avN++;}catch(_e){}}
              sx=clamp(sx+_av553*0.62,4,96);
              if(idx===_cI553){sx=_bb553.x;sy=_bb553.y;k=0.55;}/* [7.625.0] k 0,85 RIGIUDICATO anche sul metro qualificato (custodia per-tick): 6,1/6,8/6,1/4,2 contro banda rossa 6,0-6,4 — in banda, revoca DEFINITIVA. Idem l'inversione del verso (6,2/6,4/6,0/4,2). La lettura strutturale: con le righe che ricollocano il pallone ogni 2-3 tick l'ambientale e' quasi sempre IN VOLO — la custodia non si vince inseguendo, si vince alla RICEZIONE (lo stato mancante A4 dell'audit: l'arrivo ai piedi di un uomo). *//* ⚠️ [7.625.0] PROVATO E REVOCATO CON LA SUA MISURA: k 0,55->0,85 sul portatore logico per «tenere il passo» — npd mediana 6,8-10,3 contro banda rossa 6,4-10,3: IN BANDA, nessun effetto. Il modello d'equilibrio era sbagliato: il sistema non e' mai a equilibrio, perche' le righe di cronaca ricollocano il bersaglio (fino a 30u) piu' in fretta di quanto qualsiasi inseguitore converga — npd misura transitori perpetui. Il guadagno del correttore non puo' nulla contro i salti del comando: la pista giusta e' misurare npd con l'inversione del verso (INV579), mai giudicata su QUESTO metro. */
            }
            return{...pl,x:clamp(pl.x+(sx-pl.x)*k+(Math.random()-0.5)*0.2,2,98),y:clamp(pl.y+(sy-pl.y)*k+(Math.random()-0.5)*0.2,2,98)};
          });});
        }
        // Heat map: sample player position every 4 ticks
        if(nx%4===0){
          heatPointsRef.current.push({x:pPosRef.current.x,y:pPosRef.current.y});
          if(heatPointsRef.current.length>300)heatPointsRef.current.shift();
        }
        return nx;
      });
      /* [7.642.0 v4 — L'ARRIVO SI VEDE SOLO GUARDANDO OGNI TICK] Le v1-v3 sono cadute con le loro
         misure (28u; 13%; 13% identico): la lezione finale e' che l'elezione all'arrivo girava ogni
         3 tick mentre la finestra d'arrivo (palla <2,5u da un uomo) dura MENO di un tick — il
         campione la mancava per costruzione, sesta cattura della classe «campione cieco». Qui
         l'elezione gira A OGNI TICK, a valle di macchine e trama e prima del moto della palla, e
         l'arrivo apre una SOSTA: 2 tick col bersaglio sui piedi dell'eletto (1 durante la
         costruzione del gol, che ha il suo tetto) — il ciclo controllo->passaggio del calcio. */
      if((pianoLock693.current|0)>0)pianoLock693.current--;/* [7.693.0] la custodia del piano dura in tick, e scade qui: a valle delle righe (che la accendono) e a monte del moto della palla */
      if(typeof window!=='undefined'&&window.__CPM_REC){try{const _z=(window.__CPM_ELEZ642=window.__CPM_ELEZ642||{giri:0,liberi:0,elez:0,md:[]});_z.giri++;if(phaseRef.current==='playing'&&!fermoRef.current&&!outRef.current&&!spRef.current&&kickoffRef.current<=0&&kickRef.current<=0)_z.liberi++;}catch(_e){}}
      if(!(typeof window!=='undefined'&&window.__CPM_NO642)&&phaseRef.current==='playing'&&!fermoRef.current&&!outRef.current&&!spRef.current&&kickoffRef.current<=0&&kickRef.current<=0){try{
        const _bA=ballPosRef.current;const _ltA=possTurnRef.current>0?"home":"away";let _biA=-1,_bdA=2.5;
        ballLagRef.current=Math.hypot((_bA.x||50)-(ballTargetRef.current.x||50),(_bA.y||50)-(ballTargetRef.current.y||50))>6;/* [v5] la palla e' in ritardo sul bersaglio: le marce aspettano */
        (matchPlayersRef.current||[]).forEach((q,i)=>{if(!q||q.team!==_ltA||q.gk)return;const _d=Math.hypot((q.x||50)-_bA.x,(q.y||50)-_bA.y);if(_d<_bdA){_bdA=_d;_biA=i;}});
        if(typeof window!=='undefined'&&window.__CPM_ELEZ642){try{const _z=window.__CPM_ELEZ642;if(_z.md.length<300)_z.md.push(+_bdA.toFixed(1));}catch(_e){}}
        if(_biA>=0&&(!carrierRef.current||carrierRef.current.i!==_biA)){carrierRef.current={i:_biA};holdArrRef.current=pendingGoalRef.current?1:2;if(typeof window!=='undefined'&&window.__CPM_ELEZ642){try{window.__CPM_ELEZ642.elez++;}catch(_e){}}}
        if((holdArrRef.current|0)>0&&carrierRef.current&&carrierRef.current.i!=null){
          const _qh=(matchPlayersRef.current||[])[carrierRef.current.i];
          if(_qh&&!((pianoLock693.current|0)>0&&!!pendingGoalRef.current&&!(typeof window!=='undefined'&&window.__CPM_NO693)))ballTargetRef.current={x:clamp(_qh.x,2,98),y:clamp(_qh.y,2,98)};/* [7.693.0] sotto il piano del gol il bersaglio non torna sui piedi del portatore: e' li' che la costruzione moriva a centrocampo */
          holdArrRef.current--;}
        else if(!ballLagRef.current&&pendingBtRef.current&&!(typeof window!=='undefined'&&window.__CPM_NO643)){
          /* [7.643.0] SCODAMENTO: consegna completata e sosta finita — la proposta accodata parte ora */
          ballTargetRef.current=pendingBtRef.current;pendingBtRef.current=null;
          if(typeof window!=='undefined'&&window.__CPM_REC){try{const _q=(window.__CPM_CODA643=window.__CPM_CODA643||{acc:0,diretti:0,part:0});_q.part++;}catch(_e){}}}
      }catch(_e){}}
      // Ball lerp — interpolazione continua verso il target ad ogni tick (300ms)
      /* [7.478.0 «esito dichiarato != 3D», e il difetto NON era quello che la nota diceva] IL PALLONE NON
         ESCE DAL CAMPO. Misurato su gi55/gi80 col percorso forzato: la palla LOGICA arriva a 103,5 su un
         campo che va da 0 a 100, e la mesh la segue fino a x 56,6 — oltre il piano dei pali (48,6), oltre
         il prato, dentro i cartelloni pubblicitari (53,2). Nessun clamp c'e' mai stato: questo lerp insegue
         un bersaglio che qualche consegna mette fuori scala e non ha un fondo campo che lo fermi. Il
         bersaglio si lascia dov'e' (e' di chi lo scrive); e' la POSIZIONE che non puo' stare fuori dal
         rettangolo di gioco. Da qui in poi un pallone che esce si ferma sulla riga, come in una partita.
         ⚠️ E il difetto che la nota denunciava — «esito CHANCE ma la palla e' finita IN RETE» — su queste
         tre scene NON c'e': i campioni oltre la linea hanno z da -18,4 a +32,3 e i pali stanno a +-3,35,
         cioe' zero palloni dentro la porta. Era il criterio del guardiano a chiamare «rete» qualunque
         pallone oltre una x, senza guardare i pali (e con la x sbagliata per giunta). */
      setBallPos(b=>{
        /* [7.525.0] CALCIO D'INIZIO ambientale: allo scadere del conto il pallone RIPARTE dal centro
           (riposizionamento voluto, come lo snap di scena) e la trama rinasce col possesso nuovo. */
        /* [7.573.0 — LA RIPARTENZA DAL CENTRO ASPETTA CHE IL GOL SI SIA VISTO]
           Il conto della ripartenza scorreva a tick fissi: cinque tick, ~1,5 s. Ma quando il gol si scrive
           la mesh del pallone sta 40-53 unita' dalla linea e viaggia al massimo a 34 u/s — le servono ~1,3 s,
           e qualunque rallentamento se li mangia. Da qui il difetto che il giudice misura: la riga dichiara
           la porta (98,50) e il pallone si vede a 27 unita' dalla linea, sempre allo stesso minuto.
           Alzare il conto sarebbe un rattoppo su una costante: il numero giusto dipende da quanto e' lontana
           la mesh, che cambia ogni volta. Qui il conto si FERMA finche' il renderer dichiara che il pallone
           e' ancora in volo verso la rete — lo stesso schema del 7.461, dove la simulazione aspetta la
           scena. Con un tetto, perche' nulla resti appeso se il volo non finisce mai. */
        if(kickRef.current>0){
          const _no573=(typeof window!=='undefined'&&window.__CPM_NO573);
          /* [7.573.0] IL PALLONE E' GIA' ENTRATO? Due testimoni, e basta che uno dica di no.
             (a) LA SIMULAZIONE: il pallone logico deve aver toccato la linea (x>=95 o x<=5). Misurato con
                 `gol-573` su sei partite: dalla riga di gol il pallone ci mette 2-3 tick, non zero.
             (b) LA SCENA: il renderer dichiara `rete` finche' la mesh e' a piu' di 3,2u dalla porta —
                 sul telefono la mesh insegue il logico e puo' restare indietro anche quando il logico
                 e' arrivato. Headless non lo vede: quel testimone resta NON VERIFICATO in laboratorio. */
          const _gx573=kickGx573.current;
          if(_gx573!=null&&(_gx573>50?(b.x>=95):(b.x<=5)))kickIn573.current=true;
          /* [7.575.0 — IL GOL VOLAVA IN RETE E QUALCUN ALTRO GLI SPOSTAVA LA RETE SOTTO, rosso __CPM_NO575]
             Il 7.573 tratteneva il CONTO della ripartenza finche' il pallone non era entrato, e non bastava:
             a essere contesa non era la ripartenza, era la DESTINAZIONE. Misurato con `gol-573`, partita 2:
             al 49' segniamo noi (la riga dichiara 98), il pallone risale fino a 72 e poi TORNA INDIETRO fino
             a 4 — perche' al 51' segnano loro, e la macchina del gol pendente avversaria (7.528) stava gia'
             trascinando il pallone verso la loro area a 4u/tick. Il gol nostro non e' mai arrivato in rete:
             gliel'hanno portata via mentre era in volo.
             Il rimedio e' lo stesso principio del 7.461 applicato al bersaglio invece che al conto: finche'
             il pallone di un gol non e' ENTRATO, la sua destinazione e' la porta e nessun'altra macchina la
             puo' cambiare. Dura quanto la finestra del 7.573 (tetto dieci tick), quindi non puo' incantarsi. */
          if(!_no573&&_gx573!=null&&!kickIn573.current&&!(typeof window!=='undefined'&&window.__CPM_NO575))ballTargetRef.current={x:_gx573>50?98:2,y:50};
          if(typeof window!=='undefined'&&window.__CPM_K573&&window.__CPM_K573.log)window.__CPM_K573.log.push({c:clockRef.current|0,kr:kickRef.current|0,gx:_gx573,in:kickIn573.current?1:0,bx:+b.x.toFixed(1),tx:+(ballTargetRef.current.x||0).toFixed(1)});/* strumentazione: cosa vede la ripartenza, tick per tick */
          const _simFuori573=(_gx573!=null&&!kickIn573.current);
          const _cb573=_no573?null:cineBusyRef.current;
          const _meshFuori573=!!(_cb573&&_cb573.rete);
          if(!_no573&&(_simFuori573||_meshFuori573)&&(kickAtt573.current|0)<10){
            /* il pallone e' ancora in volo verso la rete: il conto ATTENDE, la scena ha la precedenza
               (stesso schema del 7.461). Col tetto, perche' nulla resti appeso se il volo non finisce mai. */
            kickAtt573.current=(kickAtt573.current|0)+1;
            if(typeof window!=='undefined'&&window.__CPM_K573)window.__CPM_K573.att=(window.__CPM_K573.att|0)+1;
          }else{
            kickAtt573.current=0;kickRef.current--;
            if(kickRef.current===0){kickGx573.current=null;kickIn573.current=false;ballTargetRef.current={x:50,y:50};tramaRef.current=null;
              if(!(typeof window!=='undefined'&&window.__CPM_NO536)){kickoffRef.current=2;ripT0Ref.current=Date.now();}/* [7.530.0] parte la ripartenza recitata: 2 battute di calcio d'inizio · [7.590.0] e da qui contano i suoi secondi */
              return{x:50,y:50};}
          }
        }
        if(kickoffRef.current>0&&!(typeof window!=='undefined'&&window.__CPM_NO536)){
          /* [7.530.0 NO536] TENUTA al centro finche' le battute di ripartenza non sono uscite: niente drift,
             niente strattoni delle righe (le righe in questa finestra sono dirottate su battute di kickoff
             con bpos 50,50). Il conto scala nel sito delle righe, non qui: la tenuta dura quanto il racconto. */
          ballTargetRef.current={x:50,y:50};
          return{x:b.x+(50-b.x)*0.65,y:b.y+(50-b.y)*0.65};}
        /* [7.511.0 R1 — IL PALLONE VIVE: restyling, audit «il pallone resta fermo» + «vola e torna indietro»]
           Due difetti misurati, un motore nuovo. (1) FERMO: lerp 25% con banda morta 0,3 — dopo 2-3 tick il
           pallone si spegneva, e fra due righe di cronaca (2-7 tick di pausa) restava immobile per la maggior
           parte del tempo di lettura (baseline sonda ball-alive). (2) RITORNO INDIETRO: l'arco visivo arrivava
           al bersaglio in 0,35-0,68s, il lerp logico al 25% no — a fine arco la mesh ricadeva sull'inseguimento
           del logico rimasto indietro e tornava indietro del 56-75%. Rimedio: passo 0,65 senza banda morta
           (3 tick ≈ 96% del tragitto: il logico arriva col tempo dell'arco a ogni velocita', perche' il passo
           e' PER TICK e i tick per minuto sono costanti — determinismo fra velocita' conservato); e quando non
           c'e' piu' nulla da inseguire il POSSESSO AVANZA: il bersaglio deriva verso la meta' d'attacco di chi
           ha palla, con flusso seedato dedicato (mai _rndM: avrebbe spostato i sorteggi della cronaca e rotto
           il replay). Rientro morbido oltre x82/x18: un pallone respinto, non un binario. __CPM_NO511 = rosso. */
        /* [7.532.0 NO543 v2b] LO SPELL DI POSSESSO gira A OGNI TICK PALLA (la v2 stava dentro il ramo del
           drift, che scatta solo a bersaglio raggiunto: nell'era delle macchine i bersagli si muovono di
           continuo — censimento: 0 flip anche con lo spell). Pesato sulla % (60% possesso ≈ 60% di spell
           nostri), flusso seedato dedicato, mai _rndM (invariante 7.511). Fermo durante kickoff/azione
           pendente/contropiede: li' il padrone lo dice la recita. */
        if(!(typeof window!=='undefined'&&window.__CPM_NO553)&&phaseRef.current==='playing'&&kickoffRef.current<=0&&!pendingGoalRef.current&&!counterRef.current&&((typeof window!=='undefined'&&window.__CPM_NO616)||(!fermoRef.current&&!outRef.current&&!spRef.current))){/* [7.616.0] lo spell NON corre a palla ferma: il turno cambiava a orologio mentre outRef.nostra dichiarava il contrario — le due verita' divergevano senza riconciliazione *//* [7.532.0] TURNI IN TARATURA: opt-in __CPM_TURNI543 — il modello a turni ha acceso 3 guardiani (trama 22,5°/33,8°, bg-rhythm cieco x4) e si tara in un ramo dedicato, non in produzione */
          possSpellRef.current--;
          if(possSpellRef.current<=0){
            if(!ballRngRef.current)ballRngRef.current=(((bgSimSeedRef.current||1)>>>0)^0x9e3779b9)>>>0;
            let _s543=ballRngRef.current;const _rr543=()=>{_s543=((_s543*1664525)+1013904223)>>>0;ballRngRef.current=_s543;return _s543/4294967296;};
            /* [7.532.0 v3c] L'AZIONE AVANZATA NON SCADE A OROLOGIO: se il possessore ha la palla oltre
               l'avanzamento 58 (il suo ultimo terzo abbondante), lo spell si ESTENDE (max 2 volte) e
               l'attacco si gioca fino in fondo — i cambi possesso veri avvengono in costruzione. Senza
               questo, coi turni la palla viveva attorno al centro per entrambi e lo sviluppo non
               accumulava mai (bg-rhythm cieco: 5-6 coppie, censimento fasi 13/15 costruzione). */
            const _bAdv543=(possTurnRef.current>0)?b.x:100-b.x;
            if(_bAdv543>=58&&(possExtRef.current|0)<2){possExtRef.current=(possExtRef.current|0)+1;possSpellRef.current=(typeof window!=='undefined'&&window.__CPM_NO553)?(8+Math.floor(_rr543()*8)):(2+Math.floor(_rr543()*3));}
            else{possExtRef.current=0;
            const _pb543=clamp((possessionRef.current||50)/100,0.30,0.70);
            const _prevT543=possTurnRef.current;
            setTurn616((_rr543()<_pb543)?1:-1,"orologio",{keepSpell:true});/* [7.616.0] il sorteggio e la durata dello spell restano QUI (invariante 7.511 sull'ordine dei sorteggi): il writer registra soltanto */
            possSpellRef.current=(typeof window!=='undefined'&&window.__CPM_NO553)?(30+Math.floor(_rr543()*25)):(4+Math.floor(_rr543()*6));/* ⚠️ [7.542.0] PROVATO E REVOCATO CON LA SUA MISURA: portare lo spell a 9-19 minuti perche' coprisse una finestra di visione. Rettilineita' del pallone 0,27->0,31 nel giro isolato, ma col ripiego sul ricevente il guadagno sparisce (0,26) e il possesso peggiora (fascia centrale 61%->65%, senza padrone 30%->40%). Il numero che conta resta quello sotto. *//* [7.542.0 collaudo PO «parecchi giro giro tondo col pallone» — rosso __CPM_NO561] LO SPELL DEVE DURARE PIU' DI UNA FINESTRA DI VISIONE. Misura che chiude la diagnosi: in ~10 secondi di visione passano ELEVEN minuti di gioco (la sonda li conta dal cronometro), mentre uno spell di possesso durava 4-9 minuti — quindi dentro una sola occhiata la palla cambiava padrone una o due volte e risaliva il campo nei due versi. Non era un difetto del modello: era il modello giusto guardato a velocita' sbagliata, e da fuori si legge «giro giro tondo». Portato a 9-19 minuti, uno spell copre almeno una finestra: chi guarda vede UNA squadra che attacca, non due che si scambiano il pallone sotto gli occhi. Restano ~5-7 ribaltamenti a partita, che e' quello che il 7.532 cercava quando i turni erano fermi a uno solo. *//* [7.538.0] 4-9 TICK = 4-9 MINUTI DI GIOCO: il 30-55 era stato scelto leggendo i tick come secondi reali («13-23s»), ma un tick E' un minuto — quello spell teneva la palla alla stessa squadra per mezzo tempo. *//* [7.532.0 v3b] 10-17→30-55 tick (≈13-23s reali): a 4-7s il possesso cambiava troppo fitto e SPEZZAVA le giocate — guardiano trama rosso a 22,5°/passo (soglia 20, storico 11°). Uno spell vero dura 15-25s. */
            /* [7.532.0 NO542 v3] il CONTROPIEDE si arma QUI, al flip vero (la v2 armava alla nascita-trama,
               ramo che scatta di rado: 1 armato e 0 recitati su partita intera): flip col pallone nel terzo
               difensivo del nuovo padrone + cooldown 6'. */
            if(!(typeof window!=='undefined'&&window.__CPM_NO542)&&possTurnRef.current!==_prevT543){
              if(((possTurnRef.current>0&&b.x<42)||(possTurnRef.current<0&&b.x>58))&&((clockRef.current|0)-counterCoolRef.current>=6)){
                counterCoolRef.current=clockRef.current|0;counterArmRef.current={dir:possTurnRef.current};
                if(typeof window!=='undefined'&&window.__CPM_CT542)window.__CPM_CT542.arm=(window.__CPM_CT542.arm||0)+1;}}
            }
          }
        }
        if(typeof window!=='undefined'&&window.__CPM_NO511){
          const bx0=ballTargetRef.current.x,by0=ballTargetRef.current.y;
          const dx0=bx0-b.x,dy0=by0-b.y;
          if(Math.abs(dx0)<0.3&&Math.abs(dy0)<0.3)return b;
          return{x:clamp(b.x+dx0*0.25,0,100),y:clamp(b.y+dy0*0.25,0,100)};
        }
        const _t=ballTargetRef.current;
        let dx=_t.x-b.x,dy=_t.y-b.y;
        /* [7.525.0 — OGNI FASE HA UN PADRONE DELLA PALLA, principio 7.523] Il drift di possesso gira SOLO
           in `playing`: dentro una scena la palla e' della scena. Il motore vecchio derivava anche negli
           highlight — col rimbalzo a x82 il danno restava sotto soglia; la trama, direzionale, accumulava
           e trascinava il pallone staged fino a x90-93, dove i difensori di formazione non arrivano piu'
           (guardiano `motion`: minDist 25,7-26,3 > 24, due giri rossi del gate 7.525). */
        /* [7.538.0 missione «partita vera»] LA SOGLIA DI «PALLA ARRIVATA» E' RELATIVA AL PASSO.
           Questo cancello esiste per una ragione giusta: se qualcun altro (una recita della cronaca, una
           scena, un calcio d'inizio) ha spostato il bersaglio lontano, il drift non deve mettersi in mezzo
           — aspetta che il pallone ci arrivi. Ma la soglia era 0,6 unita' su un passo di 0,8: bastava, a
           malapena. Col passo portato alla scala del MINUTO il pallone resta a 1,4-2,5u dal bersaglio per
           due o tre tick, e il drift non avanzava. MISURATO col testimone della trama: 40 tick di piano in
           TRE partite (≈13 a partita su 88 minuti) — il motore del possesso ambientale girava una volta
           ogni sette minuti di gioco, e tutto il resto del tempo la palla la muovevano gli altri.
           Ora la soglia scala col passo: «arrivata» vuol dire arrivata rispetto a quanto le si e' chiesto
           di percorrere. Col rosso __CPM_NO553 la soglia torna 0,6 esatta. */
        const _k553=(typeof window!=='undefined'&&window.__CPM_NO553)?1:6.5;
        const _gate553=Math.max(0.6,_k553*0.42);
        /* ⚠️ [7.693.0 — SILENZIARE LA TRAMA: PROVATO E REVOCATO CON LA MISURA CONTRARIA.] Avevo contato la
           trama fra i ladri del bersaglio, e in astratto lo e'. Ma questo cancello si apre solo quando il
           pallone e' ARRIVATO (entro ~2,7u dal bersaglio): durante il volo di un passo del piano la trama
           non tocca niente, e non era lei a cancellare la proposta. Spegnerla ha pagato caro e misurato:
           custodia da 7,4-7,7u (banda 12, otto campioni, due giri di riferimento) a 12,8-18u, e copertura
           del portatore da 14-16% a ZERO. Il ladro vero e' uno solo — l'elezione del portatore, che
           riscrive il bersaglio A OGNI TICK senza aspettare nessun arrivo — e a quello basta il freno
           mirato. Revocato invece di tenerlo: un rimedio che rompe una banda non e' un rimedio. */
        if(Math.abs(dx)<_gate553&&Math.abs(dy)<_gate553&&phaseRef.current==='playing'){
          if(!ballRngRef.current)ballRngRef.current=(((bgSimSeedRef.current||1)>>>0)^0x9e3779b9)>>>0;
          const _r511=()=>{let _s=ballRngRef.current;_s=((_s*1664525)+1013904223)>>>0;ballRngRef.current=_s;return _s/4294967296;};
          /* [7.532.0 collaudo PO «il gioco e' troppo concentrato a centrocampo, non ci sono ribaltamenti» —
             rosso __CPM_NO543] LA RADICE MISURATA: `possession>=50` e' la STATISTICA cumulativa (clamp 20-80,
             ±1-2 a riga) — con una squadra sopra il 50% la trama raccontava 90 minuti di possesso NOSTRO:
             censimento su partita intera, UN solo flip (a x49). Ora il drift consuma il TURNO (possTurnRef,
             passato dalle righe di recupero e dai calci d'inizio): la palla vive nei due versi, e i pesi di
             zona 7.525 si auto-bilanciano (quando il possesso e' loro la palla scende, e le righe difensive
             — recuperi compresi — tornano pescabili). La % resta la statistica per la UI. */
          const _dir=(!(typeof window!=='undefined'&&window.__CPM_NO553))?(possTurnRef.current||1):(possessionRef.current>=50?1:-1);/* [7.532.0] turni opt-in per la taratura */
          /* [7.524.0 LA TRAMA — collaudo PO «non ci sono schemi, azioni ragionate, e' tutto un po'
             confusionario»] Il possesso 7.511 era un random-walk: passo avanti sorteggiato + jitter
             laterale A OGNI TICK — la rotta cambiava di continuo, e la cronaca (che dal 7.499 DESCRIVE
             dove sta la palla) raccontava quel vagare. Ora il possesso ha un PIANO: una fase letta
             dalla posizione (palleggio nel proprio terzo → avanzata → rifinitura, stessa lettura-non-
             sorteggio di F3b), un CORRIDOIO persistente (sx/centro/dx, cambio gioco raro), e GIOCATE a
             waypoint — la rotta resta FISSA finche' la giocata non arriva, poi se ne sorteggia un'altra
             dal piano. Stesso flusso seedato dedicato (mai _rndM: sposterebbe i sorteggi della cronaca
             e romperebbe il replay — invariante 7.511). __CPM_NO527 = rosso (motore 7.511). */
          if(typeof window!=='undefined'&&window.__CPM_NO527){
            let _step=0.35+_r511()*0.55;
            if((_dir>0&&_t.x>82)||(_dir<0&&_t.x<18))_step*=-0.3;
            _t.x=clamp(_t.x+_dir*_step,4,96);_t.y=clamp(_t.y+(_r511()-0.5)*1.4,6,94);
          }else{
            let _tr=tramaRef.current;
            /* [7.538.0 missione «partita vera» — rosso __CPM_NO553] IL MINUTO E' UNA GIOCATA, NON UN PASSO.
               MISURA che apre il lotto: il metronomo della partita batte un tick ogni MATCH_TICK_MS e ogni
               tick avanza il cronometro di UN MINUTO (setClock c=>c+1) — ma tutte le costanti del possesso
               ambientale erano state scelte leggendo il tick come un secondo reale: passo 0,55-1,05u,
               waypoint a 8-13u, spell di possesso 30-55 tick. Tradotto in minuti di gioco: il pallone
               avanzava ~0,8 unita' AL MINUTO (68u in 90') e la stessa squadra teneva palla per mezzo tempo.
               Ecco perche' «gira sempre a centrocampo»: in novanta minuti la palla non attraversava il campo
               nemmeno una volta, e nessuna corsa dei ventidue poteva rimediare a un bersaglio che non si
               muove. Qui la scala del PASSO e della GIOCATA passa ai minuti (K=6,5 sul passo, waypoint x2,2:
               ~3-4 passi interni per giocata, cosi' il guardiano della trama continua ad avere materiale su
               cui giudicare la rotta). __CPM_NO553 ripristina la taratura a secondi per la prova del rosso. */
            const _no538=(typeof window!=='undefined'&&window.__CPM_NO538);const _idp=_no538?null:_prof538(_dir);/* [7.531.0] identita' di modulo */
            if(!_tr||_tr.dir!==_dir){
              /* [7.532.0 NO542 — v2 dell'innesco contropiede] flip di possesso con palla nel terzo difensivo
                 del NUOVO padrone = ripartenza da recitare: si ARMA qui (dove il flip e' un fatto della trama)
                 e il sito delle righe la consuma alla prossima battuta. */
              if(_tr&&_tr.dir!==_dir&&!(typeof window!=='undefined'&&window.__CPM_NO542)){
                if(typeof window!=='undefined'&&window.__CPM_CT542){const _w=window.__CPM_CT542;_w.flips=(_w.flips||0)+1;(_w.fx=_w.fx||[]).length<60&&_w.fx.push(+_t.x.toFixed(1));}/* [7.532.0 collaudo] censimento flip/profondita' */
                if(((_dir>0&&_t.x<40)||(_dir<0&&_t.x>60))&&((clockRef.current|0)-counterCoolRef.current>=6)){
                  counterCoolRef.current=clockRef.current|0;counterArmRef.current={dir:_dir};
                  if(typeof window!=='undefined'&&window.__CPM_CT542)window.__CPM_CT542.arm=(window.__CPM_CT542.arm||0)+1;}}
              const _c0=_r511();
              let _cor0;if(_no538){_cor0=_c0<0.34?0:_c0<0.67?-1:1;}
              else{_cor0=_corPick538(_c0,_idp);}/* stesso singolo sorteggio, soglie pesate (ordine centro/sx/dx del 7.524) */
              if(typeof window!=='undefined'&&window.__CPM_IDPICK538){try{const _a5=window.__CPM_IDPICK538;if(_a5.length<400)_a5.push({u:+_c0.toFixed(4),cor:_cor0,d:_dir,on:_no538?0:1,w:_no538?null:_idp.corW.slice()});}catch(_e){}}/* [7.531.0] testimone della SCELTA di corridoio: il guardiano identita' verifica ogni pick contro la mappa — il dwell e' troppo correlato per la statistica (corridoio persistente: ~5 scelte effettive a partita) */
              _tr=tramaRef.current={dir:_dir,cor:_cor0,wp:null,fase:null};}
            if(_tr.chase){_tr.chase=0;_tr.ng=1;}/* [7.524.0] ripresa dopo un inseguimento (una riga di cronaca ha spostato il bersaglio): la rotta verso il waypoint riparte da un altro punto — svolta legittima, marcata per il testimone */
            const _adv=_dir>0?_t.x:100-_t.x;
            const _fase=(function(){const _f0=_adv<45?"costruzione":_adv<72?"sviluppo":"rifinitura";
              if(typeof window!=='undefined'&&window.__CPM_NO648)return _f0;
              const _sc=direttoreRef.current;if(!_sc||!_sc.lib)return _f0;/* [7.648.0] solo le scene LIBERE comandano la trama: quelle di macchina hanno gia' i loro scrittori */
              if(_sc.f==='quiete')return "quiete648";
              if(_sc.f==='pressione')return "costruzione";/* il possessore schiacciato palleggia basso */
              if(_sc.f==='costruzione')return "costruzione";
              if(_sc.f==='sviluppo')return _adv<72?"sviluppo":"rifinitura";
              return _f0;})();
            if(!_tr.wp||(Math.abs(_tr.wp.x-_t.x)<1.2&&Math.abs(_tr.wp.y-_t.y)<1.2)){
              const _cy=corY528(_tr.cor);/* [7.630.0] helper unico dei centri di corridoio */
              let _wx,_wy;
              if(_fase==="quiete648"){_wx=_t.x+_dir*(-7+_r511()*10);_wy=_cy+(_r511()-0.5)*30;}/* [7.648.0] QUIETE: giro palla, anche all'indietro - la scena tranquilla della direttiva PO */
              else if(_fase==="costruzione"){_wx=_t.x+_dir*(_k553<1.5?(-2+_r511()*8):(-4+_r511()*24));_wy=_cy+(_r511()-0.5)*(_k553<1.5?26:32);}
              else if(_fase==="sviluppo"){_wx=_t.x+_dir*(((_k553<1.5?5:12)+_r511()*(_k553<1.5?7:16))*(_no538?1:_idp.passo));_wy=_cy+(_r511()-0.5)*(_k553<1.5?18:24);/* ⚠️ [7.542.0] PROVATO E REVOCATO CON LA SUA MISURA: stringere lo scarto laterale della giocata da +-12u a +-5,5u per «percorrere il corridoio invece di zigzagarlo». Non sposta il difetto: rettilineita' del pallone 0,27 -> 0,24, finestre in cui torna su se stesso 5/8 -> 5/8, giro attorno alla palla 36% -> 42%. Il ping-pong laterale non era la causa. VECCHIA NOTA: IL CORRIDOIO E' UN CORRIDOIO. Ogni nuova giocata pescava la sua meta con uno scarto di +-12u attorno al centro del corridoio: sommato al passo in avanti, la rotta cambiava lato a ogni giocata e la palla attraversava il campo di traverso invece di risalirlo. Misurato su finestre di ~10s di scena: 89-96 unita' di percorso per tornare quasi al punto di partenza. Lo scarto laterale scende a +-5,5u: il corridoio si percorre, non si zigzaga. *//* [7.531.0] passo di modulo: il 5-3-2 riparte lungo (1,28), il 3-5-2 palleggia (0,92) */
                if(_r511()<(_no538?0.14:_idp.cambio)){const _c1=_r511();
                  /* [7.631.0 — IL CAMBIO GIOCO PUO' ATTRAVERSARE. Rosso __CPM_NO631]
                     MISURATO (fasce-600 dopo il 7.630): ZERO cambi di lato, permanenza mediana ~2 minuti
                     sullo stesso lato, fascia bassa 0-1%. L'aritmetica: il corridoio si elegge solo al
                     flip di possesso (~5 estrazioni a partita, lotteria bloccata dal seed) e questo
                     cambio gioco da laterale andava SOLO verso il centro (cor!=0 -> 0) — il lato opposto
                     era raggiungibile solo dal cambio di fronte in rifinitura (p0,16 di un ramo raro).
                     Nel calcio il cambio campo da fascia a fascia e' LA giocata che apre la difesa
                     schierata: da laterale ora 50% centro, 50% lato opposto. Stesso sorteggio _c1,
                     nessuna estrazione nuova (invariante 7.511). */
                  _tr.cor=_tr.cor===0?(_c1<0.5?-1:1):((typeof window!=='undefined'&&window.__CPM_NO631)?0:(_c1<0.5?0:-_tr.cor));}/* cambio gioco — frequenza di modulo (433 0,17 · 532 0,09) */}
              else{
                /* [7.549.0 — pezzo 4 della roadmap, nella sua forma VERA · rosso __CPM_NO573]
                   IL REPERTORIO AVEVA DUE VOCI, ENTRAMBE AGLI ESTREMI. In rifinitura il pallone poteva solo
                   tornare INDIETRO di 7-19 unita' (scarico, 30%) o essere lanciato DENTRO L'AREA a x 80-88.
                   Niente in mezzo. MISURATO tentando di vietare due scarichi di fila: la rettilineita' su due
                   giocate saliva (0,42->0,49, soglia centrata) ma il possesso CROLLAVA — palla senza padrone
                   22%->55% e cambi di portatore 16->6 — perche' togliendo l'appoggio il pallone finiva per
                   forza nel lancio lungo, e atterrava dove non c'era nessuno. Seconda stesura con una
                   ripartenza corta dopo lo scarico: ancora 48%. ENTRAMBE REVOCATE.
                   La causa non era la taratura: con due sole opzioni agli estremi uno SCHEMA non e' nemmeno
                   rappresentabile — ed e' il «non ci sono schemi» del PO. Qui si scrivono le due giocate
                   intermedie che reggono qualunque manovra vera:
                     VERTICALIZZAZIONE CORTA — avanti 8-18u dentro il proprio corridoio: il pallone progredisce
                       restando a portata di un compagno, invece di scavalcare tutti.
                     CAMBIO DI FRONTE — stessa altezza, corridoio opposto: sposta il gioco senza perderlo, ed
                       e' la giocata che apre l'area quando la difesa e' schierata.
                   Il lancio in area RESTA ma smette di essere l'unica alternativa all'indietro: e' la sua
                   quota a scendere, ed e' li' che il possesso si guadagna. */
                const _g573=(typeof window!=='undefined'&&window.__CPM_NO573)?0:_r511();
                if(!(typeof window!=='undefined'&&window.__CPM_NO573)&&_g573<0.30){/* verticalizzazione corta */
                  _wx=_t.x+_dir*(8+_r511()*10);_wy=_cy+(_r511()-0.5)*18;}
                else if(!(typeof window!=='undefined'&&window.__CPM_NO573)&&_g573<0.46){/* cambio di fronte */
                  _tr.cor=_tr.cor===0?(_r511()<0.5?-1:1):(_tr.cor>0?-1:1);
                  _wx=_t.x+_dir*(2+_r511()*6);_wy=corY528(_tr.cor)+(_r511()-0.5)*14;}
                else if(_r511()<(_no538?0.30:_idp.scarico)){_wx=_t.x-_dir*(_k553<1.5?(3+_r511()*5):(7+_r511()*12));_wy=_cy+(_r511()-0.5)*20;}/* scarico — di modulo: il 4231 rifinisce ragionando (0,34), il 532 va dentro (0,20) */
                else{_wx=_dir>0?80+_r511()*8:20-_r511()*8;_wy=50+(_r511()-0.5)*24;}/* dentro l'area — tetto 88/12, NON 90: il motore 7.511 rimbalzava a x>82 e l'inviluppo storico (staging, reattivita' difensori) e' tarato li'; a x93 il guardiano motion ha misurato difensori a 26,3u dal portatore (soglia 24, gate rosso al primo giro 7.525) */}
              /* [7.538.1 missione «partita vera», MP-3b — rosso __CPM_NO555] LA GIOCATA FINISCE SU UN UOMO,
                 NON SU UNA COORDINATA. Il waypoint qui sopra e' l'INTENZIONE della squadra (fase, corridoio,
                 identita' di modulo: e' lui che fa palleggiare il 3-5-2 e allargare il 4-3-3, e non si
                 tocca). Ma finora era anche la DESTINAZIONE finale del pallone: un punto vuoto del prato.
                 Percio' la palla arrivava dove non c'era nessuno, e il conteggio degli uomini che la toccano
                 restava a 12 su 22 (7.538: obiettivo 15, dichiarato non centrato). Il tentativo precedente
                 — ruotare l'ETICHETTA del portatore — e' stato buttato con la sua misura: designare un uomo
                 lontano non gli mette il pallone tra i piedi, gli chiede di andare a prenderlo.
                 Qui si fa il contrario: l'intenzione resta quella del modulo, e poi si cerca il COMPAGNO
                 piu' vicino a quell'intenzione (entro 18u, portiere escluso, lato in possesso). Se c'e', il
                 waypoint diventa la SUA posizione: la giocata e' un passaggio a un uomo vero, e quando la
                 palla arriva il piu' vicino e' lui. Se non c'e' nessuno in zona resta il punto geometrico —
                 meglio una giocata verso lo spazio che nessuna giocata. Sorgente unica (`matchPlayers`, lo
                 stesso array che questo tick sta muovendo) e nessun sorteggio nuovo: l'invariante 7.511 sul
                 flusso seedato resta intatta. */
              /* [7.540.0 missione «partita vera» — rosso __CPM_NO558] IL PASSAGGIO E' UN EVENTO, LA
                 CONDUZIONE E' UN PERCORSO. Il conteggio «uomini diversi che toccano palla» (12 su 22 contro
                 i 16-20 veri) ha resistito a TRE tentativi, tutti misurati e due dei quali buttati:
                 ruotare l'etichetta del portatore (7.538), far finire la giocata su un uomo invece che su
                 una coordinata (7.539: tenuto, perche' ha spostato la palla senza padrone da 33% a 26-27%,
                 ma non questo numero) e tirare i compagni ad appoggiare attorno al portatore (7.539.1:
                 peggiorava tutto, il gioco tornava a centrocampo).
                 La lezione delle tre e' una sola: finche' il pallone SCIVOLA da un punto all'altro, per tre
                 o quattro tick attraversa erba vuota e «chi ce l'ha» resta indefinito. In una partita vera
                 il possesso e' fatto di due cose diverse: una CONDUZIONE (l'uomo corre col pallone: e' un
                 percorso, e la rotta si giudica su quello) e un PASSAGGIO (la palla LASCIA un uomo e ARRIVA
                 a un altro: e' un evento, non un percorso).
                 Qui la giocata diventa esattamente questo: alla fine di una conduzione la palla PASSA — il
                 bersaglio salta in un tick sulla posizione del ricevente scelto vicino all'intenzione — e
                 poi il nuovo portatore CONDUCE verso l'intenzione successiva. I passi interni restano
                 quelli della conduzione, quindi il guardiano della trama continua ad avere la sua materia.
                 Tetto di 22u sul passaggio: oltre e' un lancio, e un lancio va raccontato, non subito. */
              const _no558=(typeof window!=='undefined'&&window.__CPM_NO558);
              if(!(typeof window!=='undefined'&&window.__CPM_NO555)){try{
                /* [7.542.0 collaudo PO «parecchi giro giro tondo con il pallone sia a centrocampo che in
                   area avversaria» — rosso __CPM_NO560] IL PASSAGGIO NON TORNA INDIETRO. Il ricevente si
                   sceglieva come il compagno piu' VICINO all'intenzione, senza chiedergli di stare avanti:
                   se il piu' vicino era alle spalle del pallone, la giocata seguente lo riportava indietro
                   e la successiva di nuovo avanti — il pallone zigzagava fra tre uomini senza andare da
                   nessuna parte. MISURATO su finestre di ~10 secondi di scena: il pallone percorre 96,5
                   unita' e torna quasi al punto di partenza (rettilineita' 0,22), in 6 finestre su 8; il
                   41% delle tracce dei giocatori descrive un giro attorno alla palla (200° di angolo).
                   Il vincolo esiste gia' — e per la stessa ragione — nella catena della cronaca (7.537 v7:
                   «il passo DEVE guadagnare campo»): qui mancava. Si ammette un piccolo scarico
                   all'indietro (fino a 4u) perche' nel calcio esiste, ma non un passaggio che rinuncia al
                   campo guadagnato.
                   ⚠️ LEZIONE SULLO STRUMENTO, la quarta di questa serie: con una finestra di 3 secondi la
                   stessa sonda dava rettilineita' 0,90 e «l'1% gira in tondo» — cioe' NESSUN difetto. A 3
                   secondi si vede una sola gamba dello zigzag e tutto sembra dritto. La lunghezza della
                   finestra era la differenza fra «non c'e' niente» e «il difetto e' enorme». */
                const _mp555=matchPlayersRef.current||[];const _lt555=(_dir>0)?"home":"away";
                /* ⚠️ [7.542.0] PROVATO E REVOCATO CON LA SUA MISURA: pretendere che il ricevente stia
                   AVANTI (come fa la catena della cronaca dal 7.537 v7). Da solo alzava la rettilineita' del
                   pallone da 0,22 a 0,27 ma lasciava la palla su erba vuota quando davanti non c'era nessuno:
                   senza padrone dal 30% al 40%, intervalli disgiunti. Col ripiego «se non c'e' nessuno avanti,
                   il piu' vicino qualunque» il possesso tornava a posto (33%) ma il guadagno di rettilineita'
                   spariva del tutto (0,26, giro in tondo 40%): il vincolo funzionava solo finche' faceva danno
                   altrove. Revocato tutto invece di tenere un pezzo che non misura niente. */
                let _bi555=-1,_bd555=8;/* [7.544.0] RAGGIO 18→8. Con il cancello del movimento aperto (vedi la nota
                   sopra) i ventidue seguono davvero il pallone, e l'aggancio del waypoint al compagno piu'
                   vicino e' diventato un ANELLO: i giocatori si stringono attorno alla palla, la palla si
                   aggancia a loro, e il gioco torna a centrocampo — misurato, fascia centrale dal 61% al
                   78% e quinto centrale dal 47% al 63%. A 8 unita' l'aggancio fa quello per cui era nato
                   (la giocata finisce sui piedi di un uomo invece che su erba vuota) senza poter TIRARE
                   l'intenzione del modulo verso un grappolo lontano. */
                for(let _i5=0;_i5<_mp555.length;_i5++){const _pl=_mp555[_i5];
                  if(!_pl||_pl.team!==_lt555||_pl.gk)continue;
                  const _dd=Math.hypot((_pl.x||50)-_wx,(_pl.y||50)-_wy);
                  if(_dd<_bd555){_bd555=_dd;_bi555=_i5;}}
                if(typeof window!=='undefined'&&window.__CPM_REC){try{const _w=(window.__CPM_A4=window.__CPM_A4||{pass:0,agg:0,wp:0});_w.wp++;if(_bi555>=0)_w.agg++;}catch(_e){}}/* [7.639 strumento] quante giocate trovano un uomo (agg) e quante diventano passaggio vero (pass) */
                if(_bi555>=0){
                  const _rx=_mp555[_bi555].x,_ry=_mp555[_bi555].y;
                  if(_no558){_wx=_rx;_wy=_ry;}
                  else{
                    /* IL PASSAGGIO: la palla lascia il portatore e arriva ai piedi del ricevente in un tick */
                    const _pd=Math.hypot(_rx-_t.x,_ry-_t.y);
                    if(_pd<=22&&_pd>1.5){_t.x=clamp(_rx,4,96);_t.y=clamp(_ry,6,94);
                      /* [7.639.0 — LA RICEZIONE E' UNA SOSTA. Rosso __CPM_NO639] La definizione operativa
                         di A4 e' a verbale dal 7.626: «il pallone ambientale e' piu' veloce di un uomo, la
                         custodia si vince SOLO AGLI ARRIVI: il volo termina su un uomo vivo e vi sosta».
                         Il passaggio del 7.540 portava la palla ai piedi del ricevente — e la marcia
                         ripartiva il tick DOPO: mai un istante di controllo, ed e' il «rimbalza senza
                         portatore e ricevente» del PO. Due tick di sosta: la palla ARRIVA, sta ai piedi,
                         poi la giocata successiva parte. */
                      if(!(typeof window!=='undefined'&&window.__CPM_NO639))_tr.hold639=2;
                      if(typeof window!=='undefined'&&window.__CPM_REC){try{const _w=(window.__CPM_A4=window.__CPM_A4||{pass:0,agg:0,wp:0});_w.pass++;}catch(_e){}}}
                    else{_wx=_rx;_wy=_ry;}
                  }
                  _tr.rcv=_bi555;if(!(typeof window!=='undefined'&&window.__CPM_NO641))carrierRef.current={i:_bi555};/* [7.641.0 F1a] il passaggio elegge il portatore */}
                else _tr.rcv=null;
              }catch(_e555){}}
              _tr.wp={x:clamp(_wx,4,96),y:clamp(_wy,6,94)};_tr.fase=_fase;_tr.ng=1;/* [7.524.0] tick di NUOVA GIOCATA: la svolta qui e' voluta (fine giocata) — il guardiano giudica la rotta sui passi INTERNI */
            }
            if(!(typeof window!=='undefined'&&window.__CPM_NO639)&&(_tr.hold639|0)>0){_tr.hold639--;}/* [7.639.0] la sosta di ricezione: il bersaglio resta sui piedi del ricevente, la marcia aspetta */
            else{
            /* [7.642.0 — F1b-1 del piano B: LA PALLA VIAGGIA COL PORTATORE. Rosso __CPM_NO642]
               Il verdetto aritmetico del 7.626 («il pallone ambientale e' piu' veloce di un uomo: la
               custodia in volo e' impossibile per costruzione») si chiude qui: quando il portatore-stato
               (7.641) e' vivo e del lato in possesso, NON marcia piu' il bersaglio verso il waypoint —
               marcia L'UOMO (vedi il ramo nello schieramento) e il bersaglio della palla sono i suoi
               piedi. Un'autorita' sola: questo ramo si biforca, non si duplica. Baseline da demolire:
               copertura 43%, distanza portatore-palla 16,3u. */
            const _cw642=(!(typeof window!=='undefined'&&window.__CPM_NO642)&&carrierRef.current&&carrierRef.current.i!=null)?(matchPlayersRef.current||[])[carrierRef.current.i]:null;
            if(_cw642&&_cw642.team===((_dir>0)?"home":"away")&&!_cw642.gk){
              _t.x=clamp(_cw642.x,4,96);_t.y=clamp(_cw642.y,6,94);
            }else{
            const _wdx=_tr.wp.x-_t.x,_wdy=_tr.wp.y-_t.y;const _wd=Math.hypot(_wdx,_wdy)||1;
            const _st=Math.min(_wd,(0.55+_r511()*0.5)*_k553);/* [7.532.0 NO543] PASSO x2 NELL'ERA DEI TURNI: misurato — il drift muoveva ~0,8u x 85 passi = ~68u di viaggio in 90', e col possesso spalmato nei due versi la palla non raggiungeva mai le aree (bg-rhythm cieco 3 volte: sviluppo 2-6 coppie). Il possessore ora AVANZA davvero durante il suo spell (~4,7u/s di bersaglio, sotto il passo del portatore). La rotta non cambia: cambia quanta strada si fa per giocata. */
            if(!ballLagRef.current){_t.x=clamp(_t.x+_wdx/_wd*_st,4,96);_t.y=clamp(_t.y+_wdy/_wd*_st,6,94);}/* [7.642 v5] il bersaglio aspetta la palla */
            }
            }
          }
          if(typeof window!=='undefined'&&window.__CPM_TRAMA527!==undefined){try{const _tw=window.__CPM_TRAMA527;const _tr7=tramaRef.current;const _ng7=(!window.__CPM_NO527&&_tr7&&_tr7.ng)?1:0;if(_tr7)_tr7.ng=0;if(_tw.length<9000)_tw.push({x:+_t.x.toFixed(2),y:+_t.y.toFixed(2),f:(!window.__CPM_NO527&&_tr7)?_tr7.fase:null,c:(!window.__CPM_NO527&&_tr7)?_tr7.cor:null,ng:_ng7,ph:phaseRef.current,d:(_tr7&&_tr7.dir)||0});/* [7.531.0] d: a chi appartiene il possesso — il guardiano identita' separa i moduli */}catch(_e){}}
          dx=_t.x-b.x;dy=_t.y-b.y;
        }else if(tramaRef.current)tramaRef.current.chase=1;/* [7.524.0] c'e' un bersaglio da inseguire: al ritorno del drift la prima rotta e' nuova per costruzione */
        /* [7.626.0 — IL PORTATORE LOGICO AVANZA A OGNI TICK DI PALLA. Rosso __CPM_NO626]
           Giudicato stavolta sul testimone per-tick A FASE PIENA (il metro precedente campionava solo la
           fase 0 del ciclo di schieramento — cieco proprio dove la cadenza morde: fase 0 9,1u ma fasi
           1-2 a 13,3-13,7u, mediana piena 10,1u). Un uomo solo, passo umano. */
        /* ⚠️ [7.626.0 — A4/1] QUATTRO RIMEDI E CINQUE CATTURE DI METODO, TUTTO REVOCATO TRANNE IL TESTIMONE.
           La sequenza, a verbale perche' e' il lavoro della notte: (1) k 0,85 sul portatore — in banda;
           (2) inversione del verso — in banda (definitiva); (3) waypoint sul ricevente vivo — in banda;
           (4) portatore che avanza A OGNI tick — GIRAVA (19 esecuzioni/60s, contatore) ed effetto di
           DECIMALI. Il metro «qualificato» campionava solo la fase 0 del ciclo di schieramento (quinta
           cattura: cieco di fase — il testimone qui sotto misura il ciclo pieno: fase 0 9,1u, fasi 1-2
           13,3-13,7u, mediana vera 10,1u). E il verdetto finale e' aritmetico: il bersaglio-palla avanza
           4-5u/tick (riscala 7.538), un uomo ne fa ~2,6 — IL PALLONE AMBIENTALE E' PIU' VELOCE DI UN UOMO:
           la custodia in volo e' impossibile per costruzione, si vince SOLO AGLI ARRIVI. La ricezione come
           stato (A4) ha ora la sua definizione operativa: il volo termina su un uomo vivo e vi SOSTA. */
        /* [testimone 7.626, SOLO MISURA non spedita finche' non produce un verdetto] custodia a OGNI
           tick di palla, con la fase del ciclo di schieramento: se d oscilla con la fase, la diagnosi
           di cadenza e' giusta; se e' piatta, il generatore e' altrove. */
        if(typeof window!=='undefined'&&window.__CPM_NPDT!==undefined&&phaseRef.current==='playing'&&!fermoRef.current&&kickRef.current<=0&&kickoffRef.current<=0){try{
          const _ltT=possTurnRef.current>0?"home":"away";let _dT=null,_iT=-1;
          (matchPlayersRef.current||[]).forEach((q,i)=>{if(!q||q.team!==_ltT||q.gk)return;const _dd=Math.hypot((q.x||50)-b.x,(q.y||50)-b.y);if(_dT==null||_dd<_dT){_dT=_dd;_iT=i;}});
          if(_dT!=null&&window.__CPM_NPDT.length<3000)window.__CPM_NPDT.push({c:clockRef.current|0,ph:(clockRef.current|0)%3,d:+_dT.toFixed(1),i:_iT,bx:+b.x.toFixed(1),tx:+(ballTargetRef.current?ballTargetRef.current.x:0).toFixed(1)});}catch(_e){}}
        const _nx=b.x+dx*0.65,_ny=b.y+dy*0.65;
        if(typeof window!=='undefined'&&window.__CPM_NO478D)return{x:_nx,y:_ny};/* prova del rosso 7.478 */
        return{x:clamp(_nx,0,100),y:clamp(_ny,0,100)};
      });
    },Math.max(120,Math.round(MATCH_TICK_MS/((typeof window!=='undefined'&&window.__CPM_NO484)?1:(matchSpeed||1)))));/* `__CPM_NO484` ignora la scelta (prova del rosso: le tre velocita' collassano su una) *//* [7.484.0] il metronomo della partita: base 420 ms, diviso per la velocita' scelta (fondo di 120 ms perche' un tick piu' corto del fotogramma non accelera piu' nulla, accumula solo lavoro) */
    return()=>clearInterval(iv);
  },[phase,hlIdx,oppPrestige,player.ovr,paused,kickoffHold,matchSpeed,scFreeze681]); // [7.682.0] +scFreeze681: senza, il gate del freeze verrebbe valutato una volta sola e la partita non si fermerebbe mai // addCom rimosso: ora stabile (clockRef) · [7.484.0] matchSpeed in deps: senza, cambiare velocita' non rifonda l'intervallo e la scelta non ha effetto fino al cambio di fase

  // Ball attachment — la palla sta sull'eroe PRIMA dell'azione (intro/move/choose). FIX boomerang: NON
  //   durante hl_result — lì la palla vola verso l'esito (rete/compagno/fuori) e non va più richiamata sull'eroe.
  // 3DV-FIX3: NON per le azioni difensive — lì la palla è sull'avversario portatore (gestita nel loop di pressing HL)
  useEffect(()=>{
    if(phase!=="playing")ponteRef.current=null;/* [7.532.0 NO544] la scena e' aperta: il ponte ha fatto il suo lavoro */
    if(["hl_intro","hl_move","hl_choose"].includes(phase)&&situations[hlIdx]?.type!=="def"){
      /* [7.194.0 S1] la palla nasce DOVE DICE LA SITUATION (hlBallSpot), non più sempre sui piedi dell'eroe:
         corner alla bandierina, rimessa sulla linea, rinvio dal portiere, consegna aerea su chi crossa. */
      const _s=situations[hlIdx];
      const _sp=(_stagedSpotRef.current&&_stagedSpotRef.current.sit===_s)?{at:_stagedSpotRef.current.at,x:_stagedSpotRef.current.x,y:_stagedSpotRef.current.y}:hlBallSpot(_s,pPos.x,pPos.y);/* [7.402.0 codice 001] il punto dello STAGING, se c'e': il battitore e' stato piazzato li', e ricalcolare hlBallSpot dava un punto diverso di 4-6 unita' — misurato su gi50/gi76, il pallone accanto all'uomo invece che nei piedi */
      /* [7.367.0 collaudo PO #79 «Rimessa rapida dal portiere» + «Scatto in profondita' e ultimo passaggio»:
         «il pallone non arriva all'eroe, viene lanciata a nessuno a centrocampo. E' giusto?»] NO, E NON LO ERA.
         Questo blocco ha tre rami e il primo cortocircuita gli altri due: se la palla NASCE altrove la si
         mette li' e basta. Per un CORNER e' giusto — resta sulla bandierina finche' non la batti — ma il
         rilancio del portiere non e' un posto dove la palla riposa, e' una CONSEGNA.
         MISURATO su gi79: pallone fermo a x=7 (i piedi del portiere) con l'eroe a x=22; alla risoluzione
         l'arco parte da DOVE STA IL PALLONE, cioe' dal portiere, vola fino a x=41,7 e si ferma, mentre
         l'eroe non si muove da x=24,5. Il «passaggio dell'eroe» era fisicamente il rilancio del portiere, e
         l'eroe il pallone non lo toccava mai: sedici metri fra lui e la palla a fine azione.
         Ora l'origine `gk` entra nello stesso percorso della ricezione (7.350/7.351): la palla nasce dal
         portiere e ARRIVA all'eroe dentro `hl_intro`, cosi' quando l'azione parte il pallone e' suo. Nessuna
         traiettoria nuova — si riusa la consegna gia' collaudata, si cambia solo da dove parte. */
      /* ⚠️ [7.391.0] PROVATO E REVOCATO. Le scene OFF-BALL — cross dalla fascia, palla su un compagno —
         prendono questo ramo e mettono il pallone in un PUNTO GEOMETRICO calcolato da `hlBallSpot`, cieco
         a dove siano i compagni: e' lo stesso difetto che il 7.383 ha chiuso per l'altro ramo, quello
         delle scene che nascono al piede, e qui e' rimasto aperto. Ho provato a instradare anche questo
         ramo nella cassetta postale della consegna, ma la misura NON si e' mossa: gi41 resta a 3,6 unita'
         dal compagno piu' vicino, identica, e sul campione intero la variazione (10 orfani su 42 contro 8)
         cade dentro la banda di rumore gia' dichiarata nel 7.384. Revocato invece di spedirlo: un fix che
         non so dimostrare non e' un fix. Il difetto resta REALE e misurato — vedi il criterio nuovo in
         delivery-origin-test.mjs — e va ripreso capendo PERCHE' la spinta del renderer non arriva su
         questo ramo, non aggiungendone un'altra. */
      if(_sp.at!=="hero"&&_sp.at!=="gk"){
        const _kb554=hlIdx+(_forceSeqRef.current||0)*10000;
        const _bat554=(_sp.at==="corner"||_sp.at==="throw")&&!(typeof window!=="undefined"&&window.__CPM_NO554);
        /* ⚠️ IL PIAZZAMENTO SI RI-ASSERISCE A OGNI RI-ESECUZIONE. E' questa la ragione vera per cui il
           corner non partiva: l'effetto dipende da `pPos` e gira decine di volte per scena, e ogni giro
           RIMETTEVA la palla sulla bandierina — misurato dopo aver armato la battuta: il pallone si
           spostava di 2,6-7,2u e veniva risucchiato indietro. Da quando la battuta e' partita, la palla
           non si ripiazza piu': la scena e' in mano a chi l'ha calciata. */
        if(!_bat554||_batRef.current.done!==_kb554){ballTargetRef.current={x:_sp.x,y:_sp.y};setBallPos({x:_sp.x,y:_sp.y});}
        /* [7.538.0 missione «partita vera» — rosso __CPM_NO554] IL CORNER NON LO BATTEVA NESSUNO.
           Trovato censendo le scene in cui il pallone non viaggia (<3u dall'apertura all'esito): quattro
           di esse sono calci d'angolo (gi6, gi50, gi76, gi77) e il difetto NON e' la conclusione ne' la
           nascita del pallone — `hlBallSpot` lo mette correttamente sulla bandierina (97; 2,5). E' che
           questo ramo PIAZZA la palla e basta: la consegna d'apertura (7.350/7.383) vive nell'`else if`
           qui sotto, quindi per i piazzati non viene mai armata. Risultato misurato: la palla resta sulla
           bandierina per tutta la scena, si sposta di 2,1 unita' e due volte su quattro finisce in rete da
           li' — mentre il piano costruito da `buildHLTimeline` per quelle stesse scene parte da 47-59 unita'
           piu' indietro: il piano e il pallone erano due partite diverse. Ora il piazzato si BATTE: la palla
           parte dalla bandierina e vola sull'eroe, che e' esattamente cio' che la scena promette. Origine
           FISSA (la bandierina), quindi niente cassetta postale del 7.383 — quella serve a trovare un
           compagno d'appoggio, e su un corner l'appoggio e' la bandierina stessa. */
        if(phase==="hl_intro"&&_bat554){
          if(_batRef.current.arm!==_kb554){
            _batRef.current.arm=_kb554;
            const _tb554=setTimeout(()=>{try{
              /* ⚠️ NIENTE CLEANUP RESTITUITA. Questo effetto dipende da `pPos` e si ri-esegue di continuo:
                 la prima stesura restituiva `()=>clearTimeout(_tb554)` e la ri-esecuzione successiva —
                 che esce subito dalla guardia «una battuta per scena» — faceva scattare quella pulizia
                 uccidendo il timer prima dei 620 ms. MISURATO: 0 battute armate su 4 corner. Al posto
                 della pulizia, il timer verifica DA SOLO di appartenere ancora alla scena corrente. */
              if(hlIdx+(_forceSeqRef.current||0)*10000!==_kb554)return;
              _batRef.current.done=_kb554;
              /* DOVE ARRIVA IL CROSS: la mesh dell'eroe e' la sorgente giusta (e' quella che l'utente vede,
                 lezione 7.322/7.428) MA solo quando ha finito di raggiungere il suo posto — a 620 ms dallo
                 stacco di scena puo' ancora venire da dove stava nella scena precedente. MISURATO su gi6:
                 mesh a (34;48) contro uno schieramento che la vuole a (80;42), cioe' un corner battuto
                 verso il cerchio di centrocampo. Quando la mesh e' ancora lontana dal posto assegnato si
                 usa il posto assegnato: e' li' che l'eroe sara' quando la palla arriva. */
              let _d554=null;const _pl554=(pPosRef&&pPosRef.current)?pPosRef.current:{x:pPos.x,y:pPos.y};
              try{const _rd=meshDefRef.current&&meshDefRef.current();
                if(_rd&&_rd.hero&&_rd.hero.x!=null&&Math.hypot(_rd.hero.x-_pl554.x,_rd.hero.y-_pl554.y)<=12)_d554={x:clamp(_rd.hero.x,2,98),y:clamp(_rd.hero.y,2,98)};}catch(_e){}
              if(!_d554)_d554={x:_pl554.x,y:_pl554.y};
              ballTargetRef.current=_d554;setBallPos(_d554);
              if(typeof window!=="undefined"&&window.__CPM_BAT554)window.__CPM_BAT554.push({k:_kb554,at:_sp.at,fx:+_sp.x.toFixed(1),fy:+_sp.y.toFixed(1),tx:+_d554.x.toFixed(1),ty:+_d554.y.toFixed(1)});
            }catch(_e){}},620);
          }
        }
      }
      /* [7.350.0] LA CONSEGNA. Su una RICEZIONE la scena non si apre col pallone gia' tra i piedi: nasce da
         CHI CE L'HA — la fascia da cui parte il cross — e ARRIVA all'eroe. Tutto dentro `hl_intro`, che dura
         2,5s: alla fine dell'intro la palla e' arrivata, quindi da `hl_move` in poi nulla cambia rispetto a
         prima. Il gate entra direttamente in `hl_choose` saltando l'intro, percio' vede lo stato di sempre —
         verificato col fingerprint. Il viaggio lo fa lo smorzamento del pallone che gia' esiste: qui si
         spostano solo i due estremi, nessuna traiettoria nuova da mantenere. */
      else if(phase==="hl_intro"&&(isReceptionSit(_s)||_sp.at==="gk")){
        /* [7.351.0] da DOVE arriva dipende da COM'E' la palla: una consegna aerea nasce dalla fascia (chi
           crossa), una rasoterra dal COMPAGNO in appoggio — mandare un appoggio a terra dalla corsia laterale
           avrebbe fatto attraversare mezzo campo a un pallone che nel calcio vero fa dieci metri. */
        /* [7.370.0 collaudo PO «la palla deve essere nei piedi del compagno che effettua il passaggio»
           («L'uomo e' saltato — campo aperto davanti a te!») e «la palla INIZIALMENTE deve essere nei piedi
           del compagno che effettua il passaggio» (gi180 «Triangolo al limite»); stessa famiglia delle note
           aperte #87/#82/#97] LA CONSEGNA PARTIVA DA UN PUNTO, NON DA UN UOMO.
           Il 7.350/7.351 ha dato alla palla un'origine invece di farla comparire sui piedi dell'eroe — ma
           quell'origine e' un PUNTO GEOMETRICO calcolato da `hlBallSpot` (`ballAt:'mate'` → x = hx-16,
           y = hy±8): un offset fisso dall'eroe, che non guarda dove siano i compagni. Se li' non c'e'
           nessuno — ed e' il caso normale — la scena si apre con un pallone che parte dal nulla e vola
           verso l'eroe da solo. E' lo stesso errore del residuo di gi79 chiuso in 7.369 visto dall'altro
           capo dell'azione: li' la palla ARRIVAVA in un punto vuoto, qui ci NASCE.
           MISURATO su 42 consegne (21 scene x 2 repliche): distanza mediana fra il pallone appena nato e il
           compagno piu' vicino 12,4 unita' di gioco, 34 consegne su 42 oltre i 6u da CHIUNQUE — gi84 a 38u,
           gi17 a 37u, gi53 a 28u. Non e' un caso limite, e' la regola.
           ⚠️ Il primo tentativo di correzione ha usato `matchPlayers`, l'array LOGICO, e la misura non si e'
           mossa (12,4u → 16,5u): e' la trappola delle DUE SORGENTI gia' pagata nel 7.322 sul marcatore —
           le mesh in campo stanno anche 20u lontano dalle posizioni logiche, e il giocatore vede le mesh.
           Ora si legge il ponte `meshDef`, la stessa sorgente su cui il 7.322 aveva spostato il marcatore.
           CORREZIONE: l'origine e' la posizione REALE di un compagno in campo, scelto per RUOLO nella
           giocata — su palla aerea il piu' LARGO sulla corsia dell'eroe (chi crossa), su palla rasoterra
           quello in APPOGGIO alle sue spalle, cercando i ~12u che nel calcio vero separano portatore e
           sostegno. Il punto geometrico resta come rete di sicurezza quando il 3D non e' montato o nessun
           compagno e' utilizzabile: meglio l'origine vecchia che nessuna origine. Col portiere si usa la
           sua posizione VERA invece della costante {7,50}. Nessuna traiettoria nuova: cambia solo da dove
           parte quella che c'e' gia'. */
        /* [7.383.0] QUI NON SI SCEGLIE PIU' NIENTE: si dichiara COSA serve e si lascia una cassetta
           postale. Il renderer, nel fotogramma in cui ha appena piazzato i ventidue, ci mette dentro
           l'origine vera (vedi il blocco dello snap). La geometria di prima resta come rete di sicurezza
           a 110 ms: se il 3D non e' montato — o se per qualunque ragione nessuno bussa — la scena si apre
           come si apriva ieri, mai senza pallone.
           L'effetto e' reso IDEMPOTENTE per scena: dipende da `pPos`, che cambia di continuo, e senza
           questo guardarobo ogni ri-esecuzione rimetterebbe il pallone all'origine dopo che e' gia'
           partito verso l'eroe. E' la stessa dipendenza che aveva fatto fallire i quattro tentativi
           precedenti, presa questa volta dal verso giusto. */
        const _key383=hlIdx+(_forceSeqRef.current||0)*10000;/* la stessa chiave che il renderer riceve in `hlSitKey` */
        if(_dlvSeenRef.current===_key383)return;
        _dlvSeenRef.current=_key383;
        const _geo383=(_sp.at==="gk")?{x:_sp.x,y:_sp.y}:hlBallSpot(Object.assign({},_s,{ballAt:hlBallState(_s)==="aerial"?"wing":"mate"}),pPos.x,pPos.y);
        let _fatto383=false,_t2383=null;
        const _put383=(pt)=>{if(_fatto383)return;_fatto383=true;
          try{setBallPos({x:pt.x,y:pt.y});}catch(_e){}
          /* [7.428.0 collaudo PO gi86 «codice 001 MISURATO: compagno piu' vicino 11.7u, eroe ≥31.5u per 66
             campioni» + «CAMERA salta 9.7u»] LA DESTINAZIONE SI LEGGE ALLO SPARO, NON ALLA CHIUSURA.
             La consegna d'apertura (7.350/7.383) porta la palla all'eroe — ma «l'eroe» era il `pPos`
             catturato dalla CHIUSURA di questo effetto, che gira PRIMA della continuita' 4.86: un istante
             dopo il clamp allo startZone sposta l'eroe anche di 30-48 unita', l'effetto si ri-esegue ma la
             guardia «una consegna per scena» (giusta) lo fa uscire subito, e il timer resta armato sul
             bersaglio VECCHIO. MISURATO su gi86 (recv aerea, vivo emulato con ppos lontano): palla
             consegnata a (40,40) con l'eroe VERO a (88,80), hover aereo a quota 1,8 su un punto vuoto per
             tutta l'intro, poi al passaggio in hl_choose la sincronizzazione palla→eroe la strattona:
             60 unita' di deriva lenta a mezz'aria in piena finestra di lettura, palla di NESSUNO (mesh piu'
             vicina 6,8-8,2u, a tratti possesso AWAY) e camera a inseguire — sono esattamente il 001 e il
             salto camera del collaudo. Qui la destinazione si legge QUANDO IL TIMER SPARA: l'eroe MESH dal
             ponte 7.322 (la stessa sorgente che vede l'utente), con `pPosRef` fresco come rete. L'interruttore
             `__CPM_NO428` (test-only) ripristina la chiusura stantia per la prova rosso/verde del guardiano. */
          _t2383=setTimeout(()=>{try{
            let _dst428=null;
            if(!(typeof window!=='undefined'&&window.__CPM_NO428)){
              try{const _rd428=meshDefRef.current&&meshDefRef.current();if(_rd428&&_rd428.hero&&_rd428.hero.x!=null)_dst428={x:clamp(_rd428.hero.x,2,98),y:clamp(_rd428.hero.y,2,98)};}catch(_e428){}
              if(!_dst428&&pPosRef&&pPosRef.current)_dst428={x:pPosRef.current.x,y:pPosRef.current.y};
            }
            if(!_dst428)_dst428={x:pPos.x,y:pPos.y};
            ballTargetRef.current=_dst428;setBallPos(_dst428);
          }catch(_e){}},520);};
        deliverRef.current={key:_key383,kind:(_sp.at==="gk")?"gk":(hlBallState(_s)==="aerial"?"aerial":"ground"),put:_put383};
        const _t=setTimeout(()=>{try{if(typeof window!=='undefined'&&window.__CPM_DLV383&&!_fatto383)window.__CPM_DLV383.geo=(window.__CPM_DLV383.geo||0)+1;}catch(_e){}_put383(_geo383);},400);/* [7.383.0] la rete di sicurezza deve PERDERE contro il renderer, non batterlo sul tempo: a 110 ms vinceva lei su meta' delle scene (tre fotogrammi headless) e la consegna vera non arrivava mai. Quattrocento millisecondi restano un sesto dell'intro. */
        /* ⚠️ LA PULIZIA NON TOCCA LA CASSETTA POSTALE. Azzerarla qui sembrava igiene e invece spegneva
           tutto: l'effetto dipende da `pPos`, si ri-esegue, la pulizia cancella il descrittore e la
           ri-esecuzione esce subito dalla guardia «una consegna per scena» senza riscriverlo — il renderer
           trovava la cassetta vuota per sempre. Misurato con un contatore in pagina: 302 tentativi del
           renderer, 302 volte nessun descrittore, zero consegne vere. Il descrittore e' gia' protetto dalla
           chiave di scena: lasciarlo li' non fa danno, cancellarlo si'. */
        return()=>{clearTimeout(_t);if(_t2383)clearTimeout(_t2383);};
      }
      else setBallPos({x:pPos.x,y:pPos.y});
    }
  },[pPos.x,pPos.y,phase,hlIdx]);

  // Idle drift — player keeps moving during "playing" phase, formation-aware
  useEffect(()=>{
    if(phase!=="playing"||paused||kickoffHold)return;/* [7.9.3] kickoff trattenuto finché CH38 non è pronto */
    const pos=player.position||"ATT";
    const isGK=["POR","GK","Portiere"].includes(pos);
    const isDef=["DC","TD","TS","DEF","Difensore","Terzino"].includes(pos);
    const isMid=["CC","CEN","MED","MID","TC","Centrocampista","Mediano","Trequartista"].includes(pos);
    const iv=setInterval(()=>{
      setPPos(p=>{
        const dt=driftTargetsRef.current;
        let nx,ny;
        if(dt){
          // Protagonist smoothly tracks role-appropriate formation slots each 500ms tick
          // GK→slot 0, DEF→slots 1-4, MID→slots 5-7, ATT→slots 8-9
          const slots=isGK?[0]:isDef?[1,2,3,4]:isMid?[5,6,7]:[8,9];
          const tgX=slots.reduce((s,i)=>s+(dt[i]?.x||50),0)/slots.length;
          const tgY=slots.reduce((s,i)=>s+(dt[i]?.y||50),0)/slots.length;
          // 6% pull per 500ms tick — matches canvas livePos lerp speed
          nx=clamp(p.x+(tgX-p.x)*0.06+rng(-1,1),3,97);
          ny=clamp(p.y+(tgY-p.y)*0.06+rng(-1.5,1.5),3,97);
        }else{
          // Sprint 113: tighter role-based fallback ranges (more realistic positioning)
          const poss=possessionRef.current;
          const attackBonus=poss>60?4:0; // push up when team dominates possession
          const defBonus=poss<40?-4:0;   // pull back when team under pressure
          if(isGK){nx=clamp(p.x+rng(-0.5,0.5),6,16);ny=clamp(p.y+rng(-1,1),36,64);}
          else if(isDef){nx=clamp(p.x+rng(-1.5,1.5),14+defBonus,36+attackBonus);ny=clamp(p.y+rng(-2,2),12,88);}
          else if(isMid){nx=clamp(p.x+rng(-2,2),32+defBonus,62+attackBonus);ny=clamp(p.y+rng(-2.5,2.5),10,90);}
          else{nx=clamp(p.x+rng(-2,2),50+defBonus,82+attackBonus);ny=clamp(p.y+rng(-2.5,2.5),10,90);}
        }
        return{x:nx,y:ny};
      });
    },500);
    return()=>clearInterval(iv);
  },[phase,player.position,paused,kickoffHold]);// eslint-disable-line

  const selectedActionIdxRef=useRef(0);
  selectedActionIdxRef.current=selectedActionIdx;
  const pendingActionRef=useRef(null);
  const _hlActionFiredRef=useRef(false); // guard: prevent double-fire in same HL

  // Movement RAF — keyboard input with movesLeft check, 400ms cooldown per move
  const lastKbdMoveRef=useRef(0);
  useEffect(()=>{
    if(phase!=="hl_move"&&phase!=="hl_choose"){if(moveRef.current)cancelAnimationFrame(moveRef.current);return;}
    const sit=situations[hlIdx];
    const mz=sit?.moveZone||{x:[0,100],y:[0,100]};
    const loop=()=>{
      const k=keysRef.current;let dx=0,dy=0;
      if(k.has("ArrowUp")   ||k.has("w"))dx=+2.5;
      if(k.has("ArrowDown") ||k.has("s"))dx=-2.5;
      if(k.has("ArrowRight")||k.has("d"))dy=+2.5;
      if(k.has("ArrowLeft") ||k.has("a"))dy=-2.5;
      /* [7.388.0 collaudo PO «troppi movimenti concessi all'eroe» · «sono riuscito a muovermi piu' volte
         del previsto»] IL BUDGET DI MOVIMENTO NON ERA UN BUDGET. Questo ramo — frecce e WASD da desktop —
         consumava la mossa con `Math.max(0,...)`, cioe' fermava il CONTATORE a zero ma faceva il passo lo
         stesso, per sempre. Col pad non si vedeva perche' il pad sparisce a budget esaurito (`showDPad`
         richiede `movesLeft>0`): era un privilegio della tastiera, cioe' esattamente di come gioca il PO.
         E non e' comodita': ogni passo alza la distanza dal marcatore, che decide un malus fino a QUINDICI
         punti percentuali di probabilita' di riuscita — tenendo premuto un tasto si comprava il successo.
         MISURATO col nuovo guardiano moves-budget-test.mjs su dieci scene su dieci: dove il budget concede
         UN passo l'Eroe ne faceva 9,6; dove non ne concede NESSUNO ne faceva 4,9; e la distanza dal
         marcatore arrivava al massimo di 100, azzerando il malus. */
      if(!sit?.lockMovement&&movesLeftRef.current>0&&(dx||dy)&&(phase==="hl_move"||phase==="hl_choose")){
        const now=Date.now();
        if(now-lastKbdMoveRef.current>400){
          lastKbdMoveRef.current=now;
          /* [7.315.0 domanda PO «i movimenti contano nella percentuale di probabilita' di successo?» —
             trovato rispondendo] LO STESSO MOVIMENTO DEVE VALERE UGUALE DA TASTIERA E DA PAD. Muoversi
             serve soprattutto a STACCARSI DAL MARCATORE: `handleDPad` alza `defDist` di 12, e defDist
             decide il malus (−15 punti percentuali sotto 25, −8 sotto 50, 0 sopra). Ma questo ramo — le
             frecce/WASD da desktop — spostava l'eroe e consumava la mossa SENZA toccare defDist: la stessa
             azione valeva fino a 15 punti col pad del telefono e zero con la tastiera. Ora i due ingressi
             fanno la stessa cosa. */
          defDistRef.current=Math.min(100,defDistRef.current+_moveGain317(dx,dy));/* [7.317.0] stessa regola direzionale del pad */
          setDefDist(defDistRef.current);
          setPPos(p=>({x:clamp(p.x+dx,mz.x[0],mz.x[1]),y:clamp(p.y+dy,mz.y[0],mz.y[1])}));
          const nm=Math.max(0,movesLeftRef.current-1);
          movesLeftRef.current=nm;setMovesLeft(nm);
          if(phase==="hl_move")fxTimeout(()=>setPhase("hl_choose"),200);
        }
      }
      moveRef.current=requestAnimationFrame(loop);
    };
    moveRef.current=requestAnimationFrame(loop);
    return()=>{if(moveRef.current)cancelAnimationFrame(moveRef.current);};
  },[phase,hlIdx,situations]);

  /* [7.317.0 direttiva PO «implementa!» dopo la domanda sui movimenti] LA DIREZIONE DELLA MOSSA CONTA.
     Fino al 7.316 ogni mossa valeva +12 di stacco dal marcatore, IDENTICI in tutte e quattro le direzioni:
     andare incontro al difensore ti liberava esattamente quanto scappargli via. Conseguenza: la giocata
     ottimale non era una scelta di calcio ma un trucco di tempismo — aspetti che ti arrivi addosso, poi
     premi una direzione qualunque. Ora il guadagno dipende da QUANTO ti allontani da lui: si prende il
     marcatore piu' vicino (dalle posizioni VERE dei giocatori, non da un valore astratto), si confronta la
     direzione della mossa con la direzione che porta via da lui, e il guadagno scala di conseguenza —
     ~20 se gli scappi via netto, ~12 di traverso, ~4 se gli vai addosso.
     BILANCIAMENTO NEUTRO PER COSTRUZIONE: la media sulle quattro direzioni resta 12, cioe' esattamente il
     valore fisso di prima. Non cambia quanto e' difficile: cambia che la direzione e' una decisione.
     Se non si trova un marcatore (nessun avversario in scena) si torna al +12 storico. */
  /* il marcatore e' quello del modello LOGICO (`matchPlayers`) — lo stesso layer in cui vivono `defDist`,
     `nearby_def` e la barra pressione. ⚠️ Le mesh 3D in fase highlight hanno un proprio pass off-ball e
     possono indicare un avversario DIVERSO come piu' vicino: e' una divergenza nota fra i due modelli
     (stessa classe emersa su gi158) e va chiusa a parte; qui si sceglie la fonte coerente col resto della
     marcatura, ed e' quella che la probe deve interrogare. */
  const _marker317=()=>{try{
    /* [7.322.0] IL MARCATORE E' QUELLO CHE SI VEDE. Prima si leggeva `matchPlayers`, l'array LOGICO: un
       insieme di 22 giocatori diverso dalle mesh in campo, con scarti misurati fino a 20 unita'. Ora si
       chiede al renderer dove sono davvero i difensori (ponte `meshDefRef`, lettura a richiesta) e si usa
       la posizione dell'eroe della STESSA sorgente. Il vecchio array resta come rete: se il 3D non e'
       montato — schermate senza scena — il comportamento e' quello di prima invece di sparire. */
    const _rd=meshDefRef.current&&meshDefRef.current();
    if(_rd&&_rd.away&&_rd.away.length){
      const _hx=_rd.hero.x,_hy=_rd.hero.y;let _bd=1e9,_o=null;
      _rd.away.forEach(q=>{const d=Math.hypot(q.x-_hx,q.y-_hy);if(d<_bd){_bd=d;_o={x:q.x,y:q.y,d:d};}});
      if(_o){_o.hx=_hx;_o.hy=_hy;_o.src="mesh";}
      return _o;
    }
    const _hx=pPos.x,_hy=pPos.y;let _bd=1e9,_o=null;
    (matchPlayers||[]).forEach((q,ix)=>{if(!q||q.team!=="away"||(ix-10)===0)return;
      const d=Math.hypot(q.x-_hx,q.y-_hy);if(d<_bd){_bd=d;_o={x:q.x,y:q.y,d:d};}});if(_o){_o.hx=_hx;_o.hy=_hy;_o.src="logic";}return _o;}catch(_e){return null;}};/* [7.317.0] la probe ha bisogno ANCHE della posizione LOGICA dell'eroe: quella delle mesh 3D e' un'altra (stessa divergenza) e misurare la direzione con due fonti diverse dava il risultato invertito */
  const _moveGain317=(dx,dy)=>{try{
    const _hx=pPos.x,_hy=pPos.y;
    const _m=_marker317();
    if(!_m)return 12;
    const _ox=_m.x,_oy=_m.y;
    const _ax=_hx-_ox,_ay=_hy-_oy,_al=Math.hypot(_ax,_ay);if(_al<0.001)return 12;/* sovrapposti: direzione indefinita */
    const _ml=Math.hypot(dx,dy);if(_ml<0.001)return 12;
    const _dot=((dx/_ml)*(_ax/_al))+((dy/_ml)*(_ay/_al));/* +1 = gli scappi via · −1 = gli vai addosso */
    return clamp(12+8*_dot,3,20);
  }catch(_e){return 12;}};
  const handleDPad=(dx,dy)=>{
    if(phase!=="hl_move"&&phase!=="hl_choose")return;
    const sit=situations[hlIdx];
    if(sit?.lockMovement)return;
    const mz=sit?.moveZone||{x:[0,100],y:[0,100]};
    defDistRef.current=Math.min(100,defDistRef.current+_moveGain317(dx,dy));/* [7.317.0] il guadagno dipende dalla DIREZIONE */
    setDefDist(defDistRef.current);
    setPPos(p=>({x:clamp(p.x+dx,mz.x[0],mz.x[1]),y:clamp(p.y+dy,mz.y[0],mz.y[1])}));
    const nm=Math.max(0,movesLeftRef.current-1);
    movesLeftRef.current=nm;setMovesLeft(nm);
    if(phase==="hl_move")fxTimeout(()=>setPhase("hl_choose"),200);
  };

  const handleAction=useCallback((action)=>{
    if(phase!=="hl_choose")return;
    if(_hlActionFiredRef.current)return; // prevent double-fire (tap bleed / stale closure)
    _hlActionFiredRef.current=true;
    /* [7.194.0 S1] LA CONSEGNA È COMPLETATA. Prima dell'azione la palla ora vive dove deve (bandierina, fascia,
       piedi del portiere): è il guadagno visibile della slice. Ma tutta la macchina d'esito a valle — arco,
       post-arco, assestamento — è tarata sul pallone che parte DALL'EROE; con la palla a 20-40u di distanza la
       mesh finiva per essere inseguita da un lerp lento invece che da un arco, e un gol poteva chiudersi con il
       pallone ancora a metà strada (rilevato dal Live Match Validator: «GOL ma la palla non va verso la porta»).
       Al momento della scelta la consegna si considera arrivata: la palla logica torna sull'eroe e da lì in poi
       la fisica d'esito è IDENTICA a prima della slice (zero regressione sugli esiti). */
    {const _s0=situations[hlIdx];const _sp0=_s0?hlBallSpot(_s0,pPos.x,pPos.y):null;
     if(_sp0&&_sp0.at!=="hero"&&_sp0.at!=="opp"){ballPosRef.current={x:pPos.x,y:pPos.y};setBallPos({x:pPos.x,y:pPos.y});}}
    /* [7.316.0 domanda PO «e' corretto o dovrebbe incidere di piu'?»] LA MARCATURA E' UNA RAMPA, NON UNO
       SCALINO. Il peso non cambia — la media del malus sull'intero arco di `defDist` resta la stessa
       (5.71 contro 5.72 punti percentuali, verificata numericamente) — cambia la FORMA. Con i tre gradini
       (−15 sotto 25 · −8 sotto 50 · 0 sopra) la stessa mossa valeva 7 punti o ZERO a seconda di quale lato
       di una soglia INVISIBILE ti lasciava, e stare a 51 era identico a essere completamente libero: il
       gioco premiava chi indovinava la soglia, non chi si smarcava. Ora il malus scala con continuita' da
       −15 quando ce l'hai addosso a 0 quando sei fuori dalla sua portata: ogni passo che guadagni vale
       qualcosa, e il colore del bottone lo mostra muoversi invece di scattare. */
    const defPenalty=0.15*clamp((64-defDistRef.current)/52,0,1);
    // Sprint 16: weather modifier on success rate
    const wef=weather?.ef||{};
    const weatherPenalty=(action.stat==="passaggio"&&wef.pass?(-wef.pass/100):0)+
                         (action.stat==="tiro"&&wef.tiro?(-wef.tiro/100):0)+
                         (action.stat==="velocità"&&wef.spd?(-wef.spd/100):0);
    const momentumBonus=(momentumRef.current-50)/500; // [5.77.0 MOT-2] ±10% agli estremi (era ±5%: leva impercettibile — il momentum ora è un attuatore, non un widget)
    const fatiguePenalty=Math.max(0,(player.fatigue||0)-65)/350; // up to -10% at 100 fatigue
    const tacticMod=tacticBonusRef.current||0;
    // 5.43.17: penalità PUNIZIONI — le punizioni dirette nel calcio reale sono a bassissima conversione; con bonus +8 e cap 0.84 i tiratori bravi segnavano "quasi sempre". Tiered: tiro diretto fortemente penalizzato, cross su punizione meno. Si applica a TUTTE le situations "punizione" (globale).
    const _fkSit=situations[hlIdx];
    const fkPenalty=(_fkSit&&(function(){try{return deriveIntent(_fkSit)==="freekick";}catch(_e){return /punizion/i.test(_fkSit.text||"");}})())?(action.rew==="goal"?0.45:action.rew==="assist"?0.18:0):0;/* [6.0.0 MP-7] intent-driven */
    // [5.80.0 BIL-3a] form e morale entrano FINALMENTE nel roll d'azione (±4% / ±2.5%): metà del dashboard
    //   non era più scenografia — il loop «gioco bene → sto meglio → gioco meglio» ora esiste in campo.
    const formMod=clamp(((player.form||60)-62)/33,-1,1)*0.04;
    const moraleMod=clamp(((player.morale||70)-60)/40,-1,1)*0.025;
    // [7.7.0 FASE 3] ATMOSFERA → prestazione: uno stadio CALDO conta. In CASA il pubblico ti spinge (+), in TRASFERTA
    //   il tifo ostile ti mette PRESSIONE (−). Scala con l'intensità reale (fill×passione) del pubblico di QUESTA gara,
    //   moderata dalla mentalità (un giocatore forte di testa sente meno la pressione). Deterministica, bounded ±~3.5%.
    const atmoMod=(()=>{try{const _int=(crowdCtx&&crowdCtx.intensity)||0.5;const _push=(_int-0.5)*0.07;const _ment=clamp(((player.stats?.mentalità||60)-60)/40,0,1);const _dir=isMatchHome?1:(-1*(1-_ment*0.5));/* la mentalità dimezza la pressione da trasferta */return _push*_dir;}catch(_e){return 0;}})();
    // [7.88.0 collaudo PO] ANALISI DEL MISTER = vantaggio REALE: se l'azione scelta colpisce il PUNTO DEBOLE
    //   avversario (profilo tattico seedato, mostrato nel prematch) la conversione sale (+9%); se attacca il loro
    //   reparto più FORTE, cala (−5%). Seguire il consiglio del mister aumenta davvero la probabilità di riuscita.
    //   NEUTRO in FORCE-MODE (il gate non ha un avversario reale) → fingerprint invariato (pattern _hgD86).
    const _scout88=(typeof window!=="undefined"&&window.__CPM_FORCED_MODE)?{mod:0,cause:null}:scoutActionMod(action,oppMatchProfile(opponent,player.season));
    const rate=Math.max(0.05,succRate(action,player.stats,pPos.x,oppPrestige,player.archetype?.id||player.archetype)/100-defPenalty-weatherPenalty+momentumBonus+formMod+moraleMod-fatiguePenalty+tacticMod-fkPenalty+atmoMod+_scout88.mod);
    try{const _tc84=+(safeLS.get("cpm-hl-tips")||0);if(_tc84<5)safeLS.set("cpm-hl-tips",String(_tc84+1));}catch(_e){}// [5.84.0 UX-2c] contatore onboarding
    // [5.84.0 UX-2b] FEEDBACK CAUSALE: il fattore dominante dell'esito arriva a schermo — il motore lo
    //   sapeva già (pressione/fatica/forma/meteo/momentum), il giocatore no. Ora il fallimento INSEGNA.
    const _negC84=[[defPenalty,"🏃 Difensore addosso −"+Math.round(defPenalty*100)+"%"],[fkPenalty,"🧱 Conclusione su punizione: difficilissima"],[fatiguePenalty,"💧 Stanchezza −"+Math.round(fatiguePenalty*100)+"%"],[weatherPenalty,"🌧️ Meteo avverso"],[-formMod,"📉 Fuori forma"],[-momentumBonus,"⚠️ Momento difficile"],[-moraleMod,"😔 Morale a terra"],[-atmoMod,"🔊 Pressione del pubblico ostile"]].filter(c=>c[0]>0.03).sort((a,b)=>b[0]-a[0]);
    const _posC84=[[momentumBonus,"🔥 Momento d'oro +"+Math.round(momentumBonus*100)+"%"],[formMod,"⭐ In grande forma"],[tacticMod,"📢 Spinta tattica del mister"],[atmoMod,"📣 Spinta del tuo pubblico"]].filter(c=>c[0]>0.03).sort((a,b)=>b[0]-a[0]);
    // [7.88.0] il consiglio del mister è il fattore da INSEGNARE per primo: quando l'azione colpisce il punto debole
    //   (o attacca il reparto forte) la spiegazione va in testa alla causa mostrata nell'hl_result.
    if(_scout88.mod>0&&_scout88.cause)_posC84.unshift([_scout88.mod,_scout88.cause]);
    else if(_scout88.mod<0&&_scout88.cause)_negC84.unshift([-_scout88.mod,_scout88.cause]);
    const adapt=adaptiveDifficulty(player);
    // [6.80.0 collaudo PO «le goleade sono troppo frequenti»] GESTIONE DEL VANTAGGIO anche per l'EROE:
    //   in vantaggio largo il ritmo cala (turnover mentale, l'avversario si chiude) → l'azione dell'highlight
    //   converte meno. Deterministico (dipende solo dal punteggio corrente); a 0-0/vantaggi brevi nessun effetto.
    const _cruise80=(()=>{const _ld=(score.home||0)-(score.away||0);return _ld>=4?0.65:_ld>=3?0.78:_ld>=2?0.90:1;})();/* [6.83.0] 0.94/0.85/0.74 da +2 · [6.87.0 collaudo PO «ancora di più»] →0.90/0.78/0.65 */
    // [6.86.0 collaudo PO «troppe goleade!!!» (triplette/manite di fila in Nazionale)] GESTIONE DEL PROTAGONISTA:
    //   il damper sul PUNTEGGIO non basta quando è l'EROE a segnare tutto — dopo una doppietta i difensori ti
    //   raddoppiano e il mister ti gestisce: la conversione personale CALA con i gol già segnati IN QUESTA partita
    //   (G + 0.5·assist: 2→×0.82 · 3→×0.66 · 4+→×0.5). Deterministico (memoria narrativa M2), doppietta viva,
    //   tripletta guadagnata, poker/manita eccezionali. I rigori restano onesti (handleRigore non passa di qui).
    //   ⚠️ In FORCE-MODE (gate: 179 sit risolte in UNA partita) matchMem accumula decine di gol = stato
    //   artificiale che nessuna partita reale raggiunge → damper neutro lì (autoplay/live-smoke lo esercitano).
    const _hgD86=(typeof window!=="undefined"&&window.__CPM_FORCED_MODE)?1:(()=>{try{const _mm=matchMemRef.current||{};const _hx=(_mm.goals||0)+(_mm.assists||0)*0.5;return _hx>=4?0.42:_hx>=3?0.60:_hx>=2?0.78:1;}catch(_e){return 1;}})();/* [6.87.0 collaudo PO «ancora di più»] 0.82/0.66/0.5→0.78/0.60/0.42 */
    // [5.78.0 F10] ROLL D'ESITO SEEDATO: era l'unico Math.random() nudo del momento centrale di gameplay
    //   (esito non riproducibile → replay/telemetria impossibili). STESSA curva di probabilità di prima,
    //   rng seedato con la ricetta del Decision Engine (sit+azione+indice+punteggio+minuto).
    const _okR78=seededRng((Math.abs(hashStr(((situationsRef.current[hlIdxRef.current]||{}).text||"")+"|"+(action.label||"")+"|"+hlIdxRef.current+"|"+score.home+"-"+score.away+"|"+clockRef.current))>>>0)||1);
    let ok=_okR78()<clamp((rate*_cruise80*_hgD86/adapt)+(_okR78()-.5)*.06,0.05,0.76);/* [6.78.0] 0.84→0.82 · [6.83.0] →0.79 · [6.87.0] →0.76 (coerente con succRate) · [6.86.0] ×_hgD86 (gestione del protagonista) */
    if((_SIT_TEST||_CPM_TEST||(typeof window!=='undefined'&&window.__CPM_REVIEW))&&typeof window!=='undefined'){ if(window.__CPM_FORCE_OUTCOME){/* [7.211.0] esito forzato anche in revisione · [7.229.0 #47] +cpmtest: il CRITICO automatico gira sotto ?cpmtest=1 e credeva di forzare successo/fallimento — il flag NON veniva mai consumato (solo ?sit=N e revisione lo leggevano) → ogni coppia RIUSCITO/FALLITO del critico misurava DUE VOLTE lo stesso roll naturale seedato, e i falsi «gol senza rete» erano fallimenti naturali etichettati successo. Il GATE resta intatto per costruzione: non setta mai questo flag */ok=(window.__CPM_FORCE_OUTCOME==='success');window.__CPM_FORCE_OUTCOME=null;} try{window.__CPM_LAST_K=(situationsRef.current[hlIdxRef.current].actions||[]).indexOf(action);}catch(e){} }// 5.43.8: Situation Test Mode — Ripeti SUCCESS/FAIL forza l'esito; memorizza l'ultima azione scelta
    let key=ok?action.rew:action.fail;
    // M1 · UNIFIED OUTCOME MODEL: su un'azione FALLITA il TIPO di esito (palo/parata/murato/fuori) lo decide
    //   UNA sola volta il motore (decideExecution) con lo STESSO ctx/seed del render 3D → identico valore →
    //   3D byte-identico (golden stabile) MA ora overlay + cronaca leggono lo stesso esito. Fine divergenza.
    let _outKind=null,_wood=null;
    if(!ok){try{
      const _cn=(typeof deriveHL==="function"&&deriveHL(_fkSit,action))||{};
      const _htp=_cn.type,_hpp=_cn.pattern;
      const _tac=(_fkSit&&_fkSit.tactic)||{},_pmap={none:0,low:1,medium:2,high:3};
      const _livePx=defDistRef.current<25?1:defDistRef.current<45?0.5:defDistRef.current>78?-0.5:0;/* [6.4.0 R2.1] la proximità REALE del marcatore plasma il TIPO d'esito: addosso→piu murato, libero→piu largo/parato (colore, non ok/fail) */
      const _press=(_tac.nearby_def!=null?_tac.nearby_def:(_pmap[_tac.pressure]||1))+(((oppTactic&&oppTactic.pressure)||50)>65?1:(((oppTactic&&oppTactic.pressure)||50)<35?-1:0))+_livePx;
      const _ctx={attrs:player.stats||{},pressure:clamp(_press,0,5),support:_tac.support||0,fatigue:player.fatigue||0,morale:player.morale||60,x:pPos.x,weather:(weather&&weather.id)||"clear",
        foot:player.foot||"R",side:(pPos.y<50?"L":"R"),
        seed:hashStr(((_fkSit&&_fkSit.text)||"")+"|"+((action.label)||"")+"|"+hlIdx+"|"+Math.round(player.fatigue||0)+"|"+Math.round(player.form||0))};
      const _di=_htp==="cross"?"cross":_htp==="dribble"?"dribble":_htp==="pass"?(_hpp==="THROUGH_BALL"?"through":"onetwo"):_htp==="tackle"?"intercept":"shot";
      const _neg=["saved","blocked","wide","post","intercepted","out","corner","dispossessed","fouled","win_freekick","overhit","offside","missed","lost","stopped","deflected_out","shielded_out"];
      const _dd=decideExecution(_di,{..._ctx,seed:(_ctx.seed^0x5f3759df)>>>0}).outcome;
      _outKind=_neg.indexOf(_dd)>=0?_dd:(_di==="dribble"?"dispossessed":(_di==="through"||_di==="onetwo")?"intercepted":_di==="intercept"?"beaten":"saved");/* [7.115.0 audit · fix D4/B1] fallback fuori-whitelist NON più «saved» (parata del portiere) su un fallimento OFFENSIVO al piede: dribbling→dispossessed · passaggio→intercetto (famiglia «murato/fermato», nessun portiere in scena) · difensivo→beaten. «saved» resta solo per tiro/cross (dove il portiere c'è). Coerente col CoherenceCheck (overlay-fam = arc-fam via _missKindNorm) + 3D più corretto (dispossessed/intercepted = perdita possesso, non deflect verso l'area) */
      /* [7.247.0 gi37/38 «troppo distante il tiro»/«non si vede il portiere» — MISURATO: i fail dei TAGLI
         (hlType build) prendevano esiti dalla LENTE-TIRO (_di fallback "shot" → saved/post/wide) e il 3D
         rendeva un tiro da 35m col portiere: una CORSA fallita lontano dalla porta (game <70) è una PALLA
         PERSA nel duello — il remap sta QUI (chokepoint M1: 3D+overlay+cronaca derivano tutti da _outKind),
         decideExecution intatto (decision-baseline invariata). In area (x≥70) il taglio può davvero finire
         in tiro parato/palo: lente-tiro legittima, invariata. */
      if(_htp==="build"&&(_ctx.x!=null?_ctx.x:50)<70&&!/intercept|dispos|fouled|win_freekick|foul|offside|lost|stopped|overhit|shielded|beaten/i.test(_outKind||""))_outKind=(key==="intercept")?"intercepted":"dispossessed";/* [7.249.0 gi37/38 «tiro da distanza impossibile» PERSISTENTE su 7.248] il seed dell'outKind include fatica/forma che DERIVANO nella sessione wizard → uscivano kind fuori dalla lista chiusa saved/post/wide/out (es. blocked). Ora WHITELIST: se il fail di una corsa lontano dalla porta NON è una perdita di possesso, LO DIVENTA — robusto a ogni seed */
      /* [7.217.0] QUALE LEGNO: deciso qui, una volta sola, e consumato da 3D + overlay + cronaca (pattern M1).
         Un colpo di testa, un tiro in 1v1 o un cross a rientrare finiscono sul palo per geometria (sono giocate
         basse): la traversa resta alle conclusioni che vanno in alto. Seedato → riproducibile. */
      if(_outKind==="post"){
        const _hv=_cn.variant,_lowG=(_htp==="header"||_hv==="shot_one_on_one"||_hv==="cross_cutback"||_hv==="cross_low_driven"||_hv==="freekick_cross_low");
        _wood=(!_lowG&&(Math.abs(hashStr("wood|"+((action.label)||"")+"|"+hlIdx+"|"+((_fkSit&&_fkSit.text)||"")))%100)<40)?"bar":"post";
      }
    }catch(_e){_outKind=null;}}
    /* [7.669.0] LO STATO NARRATIVO IMPARA DA CIO' CHE L'EROE FA: e' l'unico modo perche' le
       interazioni abbiano memoria vera (il difensore che stringe la marcatura DOPO due dribbling
       subiti, il compagno che incoraggia DOPO un'occasione divorata). Solo conteggi, nessun effetto
       sul risultato. */
    try{const _N=narrRef669.current;
      if(ok&&/dribble|onetwo|progression/.test(String(action&&action.stat||""))) _N.duelliV++;
      if(!ok&&/dispossessed|blocked|beaten/.test(String(_outKind||""))) _N.duelliP++;
      if(!ok&&/miss|saved|wide|post/.test(String(_outKind||""))) _N.occFallite++;
      if(ok) _N.giocate++;
      if(ok&&key==="goal"){_N.eroeGol=(_N.eroeGol|0)+1;_N.eroeGolMn=clockRef.current|0;}/* [7.721.0] il gol dell'EROE entra nello stato narrativo: finora nessuna scheda sapeva che aveva segnato */
    }catch(_e669){}
    if(_outKind==="corner")setMxStats(s=>({...s,corners:(s.corners||0)+1}));/* [6.4.1 R2.2] l angolo guadagnato dall azione dell eroe entra nel box-score (prima solo la cronaca BG) */
    if(_outKind==="fouled"||_outKind==="win_freekick")setMxStats(s=>({...s,fouls:(s.fouls||0)+1}));/* [6.4.2 R2.3] fallo subito → conta tra i falli avversari */
    // [5.78.0 SIT-4] L'ASSIST NON È PIÙ UN GOL GARANTITO: sui passaggi chiave (through/onetwo) il Decision
    //   Engine decide se il filtrante diventa GOL del compagno (assist) o OCCASIONE da finalizzare (esito
    //   `chance`, finora inutilizzato): la palla è buona ma la conclusione va giocata — il chaining inietta
    //   il "secondo tempo" e in 3D il tocco del ricevente produce un RIMBALZO (deflect), non la rete.
    let _chance78=false,_crossChain704=false;
    if(ok&&key==="assist"&&!(situations[hlIdx]&&situations[hlIdx]._chainDepth)){try{/* [7.113.0 audit massivo · fix C3] la conversione assist→chance NON scatta su una sit già di CATENA (_chainDepth): l'injection del «secondo tempo» è essa stessa _chainDepth-guardata → altrimenti la chance non genera follow-up e l'assist si perdeva nel nulla (dead-end). Allineato alla guardia della conversione dribble (sotto) e dell'injection */
      const _cnA=(typeof deriveHL==="function"&&deriveHL(_fkSit,action))||{};
      if(situations[hlIdx]?.chainOn==="aerial"){
        // [7.0.4 · 7.8.4 collaudo PO «alcune azioni a CATENA hanno ancora il finto gol alla PRIMA azione»] QUALSIASI
        //   consegna che APRE il secondo tempo aereo (chainOn) NON è un gol già fatto: la palla è CONSEGNATA in area
        //   (chance → deflect, niente rete/score/esultanza nel primo tempo), poi la catena (stacco/mischia) decide il
        //   gol. Il 7.0.4 convertiva SOLO il cross → le PUNIZIONI/tiri «palla in area» (gi13-15/51: type freekick/shot,
        //   rew assist, chainOn aerial) segnavano (assist_recv/cross_goal → rete del compagno) E aprivano la catena =
        //   doppio conteggio + finto gol. Ora l'esito è «chance» per OGNI tipo con chainOn aerial → il primo tempo
        //   consegna soltanto (assist_shot/cross_goal rispettano il flag chance → respinti prima della linea).
        _chance78=true;_crossChain704=true;key="chance";_outKind="chance";
      } else if(_cnA.type==="pass"){// famiglia passaggio: through/onetwo → chance (deflect + secondo tempo)
        const _diA=(_cnA.pattern==="THROUGH_BALL")?"through":"onetwo";
        const _tacA=(_fkSit&&_fkSit.tactic)||{},_pmA={none:0,low:1,medium:2,high:3};
        const _dA=decideExecution(_diA,{attrs:player.stats||{},pressure:clamp((_tacA.nearby_def!=null?_tacA.nearby_def:(_pmA[_tacA.pressure]||1)),0,5),fatigue:player.fatigue||0,morale:player.morale||60,x:pPos.x,weather:(weather&&weather.id)||"clear",foot:player.foot||"R",side:(pPos.y<50?"L":"R"),seed:(Math.abs(hashStr("cha|"+((_fkSit&&_fkSit.text)||"")+"|"+(action.label||"")+"|"+hlIdx))>>>0)});
        if(_dA&&_dA.outcome==="chance"){_chance78=true;key="chance";_outKind="chance";}
      }
    }catch(_e){}}
    // [5.90.0 BLK-2 · DUELLO DRIBBLING] «saltare l'uomo e concludere» non sono più UN solo roll:
    //   un dribbling "da gol" riuscito diventa UOMO SALTATO (palla al piede, esito chance) e la
    //   conclusione arriva dalla chain dedicata (dopo_dribbling) — due momenti di gioco, come in campo.
    let _chanceDrb=false;
    if(ok&&key==="goal"&&!(situations[hlIdx]&&situations[hlIdx]._chainDepth)){try{
      const _cnD=(typeof deriveHL==="function"&&deriveHL(_fkSit,action))||{};
      // [7.8.10 collaudo PO «il problema della catena è su passaggi/dribbling: alla prima il pallone entra in
      //   porta erroneamente»] un DRIBBLING/una CORSA su lancio (build)/una COMBINAZIONE «dai e vai» (pass) che
      //   vale GOL non è un tiro istantaneo: la palla NON deve entrare in rete sul primo tocco. Diventa CHANCE
      //   (palla al piede, niente rete) e la conclusione arriva dalla CATENA (dopo_dribbling = «ora concludi»),
      //   così si vede la sequenza: salti/ricevi/scambi → POI tiri e segni. Prima solo il dribbling era coperto →
      //   «Scatta in profondità» (build) e «dai, ricevi, TIRA» (pass) segnavano sulla corsa/sul passaggio.
      if(_cnD.type==="dribble"||_cnD.type==="build"||_cnD.type==="pass"){_chanceDrb=true;_chance78=true;key="chance";_outKind="chance";}
    }catch(_e){}}
    // DEFENSIVE OUTCOME (5.65.0): per un highlight DIFENSIVO decidi UNA sola volta (stesso seed → coerenza
    //   3D/overlay/cronaca) l'esito realistico della respinta/recupero. Elimina il rinvio lungo automatico
    //   verso la porta avversaria: la traiettoria diventa varia (tieni possesso / passa / riparti / respinta
    //   corta / spazzata larga eccezionale / rimessa / angolo). Il render-loop mappa il descrittore su
    //   posizioni vive. È defensive-HL se la situation è type:"def" oppure l'azione risolta è un contrasto
    //   che NON vale gol/assist (una conclusione difensiva "da gol" resta offensiva, non va toccata).
    let _defTraj=null,_isDefHL76=false;// [6.76.0 LMV-S1] flag difensivo visibile anche FUORI dal try (routing coerenza)
    try{
      const _cnAll=(typeof deriveHL==="function"&&deriveHL(_fkSit,action))||{};
      const _isDefHL=(_fkSit&&_fkSit.type==="def")||(_cnAll.type==="tackle"&&action.rew!=="goal"&&action.rew!=="assist");
      _isDefHL76=_isDefHL;
      if(_isDefHL&&typeof resolveDefensiveOutcome==="function"){
        const _tacD=(_fkSit&&_fkSit.tactic)||{},_pmD={none:0,low:1,medium:2,high:3};
        const _pressD=(_tacD.nearby_def!=null?_tacD.nearby_def:(_pmD[_tacD.pressure]||1))+(((oppTactic&&oppTactic.pressure)||50)>65?1:(((oppTactic&&oppTactic.pressure)||50)<35?-1:0));
        _defTraj=resolveDefensiveOutcome({success:ok,x:pPos.x,y:((pPosRef.current&&pPosRef.current.y)!=null?pPosRef.current.y:pPos.y),
          pressure:clamp(_pressD,0,5),attrs:player.stats||{},foot:player.foot||"R",
          seed:hashStr(((_fkSit&&_fkSit.text)||"")+"|"+((action.label)||"")+"|"+hlIdx+"|"+key+"|DEF")});
      }
    }catch(_e){_defTraj=null;}
    // [5.75.0 IA-2c] GOL SUBITO reale anche in 3D: su goal_against il descrittore manda la palla NELLA propria
    //   porta (prima restava sul beaten/loose a centrocampo → cronaca «gol subito» con palla lontana dalla rete).
    if(!ok&&key==="goal_against")_defTraj={kind:"goal_against",poss:"opp",toOwnGoal:true,arcH:0.8,arcDur:0.55};
    /* [7.238.0 gi44 «Non c'è intervento del portiere!»] azione «Chiama il portiere» RIUSCITA → il descrittore
       consegna la palla al PORTIERE DI CASA che esce in presa (gesto gk_catch nel post-guard 3D), invece
       della spazzata anonima di resolveDefensiveOutcome. Flag strutturale bakato in S(), mai testo a runtime. */
    if(ok&&action.gkCall&&_isDefHL76)_defTraj={kind:"gk_claim",poss:"home",gkClaim:true,arcH:2.4,arcDur:0.62};
    /* [7.239.0 #55 batch PO gi45 «Non si vede la parata/il tackle» + cluster storico gi31-36] LA SCENA
       DIFENSIVA HA UN PRIMA: finora la minaccia era implicita (la palla nasceva accanto all'eroe e si
       spostava di 4u) e l'intervento non aveva nulla contro cui leggersi. Due famiglie STRUTTURALI
       ricevono il pallone IN ARRIVO prima del gesto: bs aerial (cross/lancio/corner avversario → arco
       alto) e maxMoves===0 (tiro in arrivo sulla linea → sassata rasa). La famiglia «portatore»
       (mm≥1, gi31/34) ha già il tackle-carrier che conduce e resta com'è. Campi derivati, mai testo. */
    if(_isDefHL76){try{const _sit55=situationsRef.current[hlIdxRef.current];
      const _inb55=(_sit55&&(_sit55.ballState==="aerial"||(_sit55.tactic&&_sit55.tactic.bs==="aerial")))?"aerial":((_sit55&&_sit55.maxMoves===0)?"shot":null);
      if(_inb55&&_defTraj)_defTraj.inbound=_inb55;}catch(_e){}}
    const _seedOvl=Math.abs(hashStr((action.label||"")+key+hlIdx+score.home+score.away));
    const _nkTx=(key==="miss"||(!ok&&!_isDefHL76&&(key==="intercept"||key==="through"||key==="miss_easy")))?_missKindNorm(_outKind):null;// [6.76.0 LMV-S1] cronaca coerente con l'esito del motore anche sui fail non-"miss" (HL difensivi esclusi: lì parla _defTraj)
    const _woodTx=(_nkTx==="post"&&_wood==="bar")?_BAR_TX:null;/* [7.217.0] la cronaca nomina il legno che il 3D colpisce davvero */
    const txt=_woodTx?_woodTx[_seedOvl%_woodTx.length]:(_nkTx&&_MISS_TX[_nkTx])?_MISS_TX[_nkTx][_seedOvl%_MISS_TX[_nkTx].length]:(_chanceDrb?OUTCOME_TX.chance_dribble[_seedOvl%OUTCOME_TX.chance_dribble.length]:pick(OUTCOME_TX[key]||["Azione completata."]));// [5.90.0] cronaca dedicata all'uomo saltato
    const _ovl=hlOverlay(key,ok,action.label,(player.name||"").split(" ")[0],_seedOvl,_isDefHL76?null:_outKind,_isDefHL76?null:_wood);/* [7.113.0 audit massivo · fix D1] HL DIFENSIVO fallito: l'overlay NON usa più l'esito OFFENSIVO del motore (_outKind da decideExecution('intercept') → mappato a «parata/fuori») ma il pool def_fail coerente («L'avversario passa») — allineato al gate del `!_isDefHL76` che già escludeva cronaca/memoria/CoherenceCheck. Prima l'overlay diceva «Grande parata del portiere» su un contrasto perso, senza portiere in scena */
    // [7.137.0 collaudo PO «la squalifica per espulsione deve essere REALE, dalla partita, non randomica»] CARTELLINO REALE:
    //   un fallo COMMESSO dall'eroe (key "foul") può portare un giallo SEEDATO; alla 2ª ammonizione o (raro) rosso diretto →
    //   ESPULSIONE reale in campo (evento cronaca + flash + uscita dal campo riusando il binario SOSTITUITO). A fine partita
    //   la squalifica deriva da heroRedRef/heroYellowsRef (fatti veri), non più da Math.random. Spento sotto test/force-sit.
    if(!ok&&key==="foul"&&!heroRedRef.current&&!subbedOffRef.current&&!benchStart&&(context==="career"||context==="cup")&&!_CPM_TEST&&!_SIT_TEST){
      const _ckC=clockRef.current;heroFoulCntRef.current++;
      const _cardSeed=Math.abs(hashStr("card|"+(player.name||"")+"|"+(player.season||1)+"|"+(player.week||1)+"|"+(opponent?.id||opponent?.n||"x")+"|"+_ckC+"|"+heroFoulCntRef.current))%100;
      const _hadYellow=heroYellowsRef.current>=1;
      let _card=null;
      if(_cardSeed<3)_card="red_direct";               // rosso diretto (raro: fallo da ultimo uomo/brutale)
      else if(_hadYellow&&_cardSeed<46)_card="red_2y";  // 2ª ammonizione
      else if(_cardSeed<32)_card="yellow";              // ammonizione
      if(_card==="yellow"){heroYellowsRef.current++;flashScreen({col:"rgba(250,204,21,0.22)",dur:600});pushMatchEvent(_ckC,"yellow",em=>"🟨 Ammonizione al "+em+"'"+(heroYellowsRef.current>=2?" — attento!":""));try{notify("🟨 Ammonito al "+_ckC+"'","#f59e0b");}catch(_e){}}
      else if(_card){heroRedRef.current=true;sentOffRef.current=true;flashScreen({col:"rgba(220,38,38,0.30)",dur:800});
        pushMatchEvent(_ckC,"red",em=>(_card==="red_2y"?"🟥 ESPULSO! Doppia ammonizione al ":"🟥 ESPULSO! Rosso diretto al ")+em+"'");
        try{notify("🟥 ESPULSO al "+_ckC+"'! Lasci il campo — squalifica in arrivo.","#dc2626");}catch(_e){}
        // uscita dal campo: riusa il binario SOSTITUITO (l'eroe esce, la squadra chiude in 10)
        subbedOffRef.current=true;setSubbedOff(true);setOnBench(true);subOffMinRef.current=_ckC;subOffWhyRef.current="Espulso al "+_ckC+"'";}
    }
    setEnergy(e=>clamp(e-action.nrg,0,100));
    if(action.rew==="goal")setMxStats(s=>({...s,shots:s.shots+1}));// [5.95.0 QW audit MP-3/MOT-6] la conclusione dell'eroe è un TIRO nelle statistiche (prima solo gli eventi BG incrementavano shots)
    // [7.111.0 collaudo PO «manca il riferimento del compagno che ha fatto/ricevuto l'assist»] la connessione si calcola
    //   PRIMA di emettere il momento chiave, così il gol/assist NOMINA il compagno (⚽ … assist di X · 🎯 Assist per X).
    //   Nomi VERI da player.teammates, seedati per minuto → deterministici; salvati anche in assistLinks. Rate assist ~66% (realistico).
    let _assistBy=null,_assistTo=null;
    if(ok&&(key==="goal"||key==="assist")){const _ckC=clockRef.current;const _tm=_matePool||[];/* [7.118.0] compagni NAZIONALI in gara di nazionale, non del club */
      if(_tm.length){const _pk=slt=>{const m=_tm[Math.abs(hashStr("al|"+(player.season||1)+"|"+(player.week||1)+"|"+_ckC+"|"+slt))%_tm.length];const nm=(m&&m.name)||"";return{name:(((typeof _surnBG==="function"&&_surnBG(nm))||nm.split(" ").pop())||nm||"un compagno"),full:nm,archetype:m&&m.archetype};/* [7.304.0 collaudo PO «non è Luca ma De Luca!»] SECONDO sito di troncamento, mai toccato dal 7.299.0: qui il cognome si ricavava ancora con split(" ").pop(), che sui cognomi con particella tiene solo l'ultimo token */};
        if(key==="assist"){const r=_pk("to");_assistTo=r.name;assistLinksRef.current.given.push({min:_ckC,name:r.name,full:r.full,archetype:r.archetype});}
        else if(key==="goal"){const _assisted=(Math.abs(hashStr("ga|"+(player.season||1)+"|"+(player.week||1)+"|"+_ckC))%100)<66;if(_assisted){const r=_pk("by");_assistBy=r.name;assistLinksRef.current.received.push({min:_ckC,name:r.name,full:r.full,archetype:r.archetype});}}
      }}
    setMStats(s=>{let{goals,assists,rb,xg}={...s};const _xgAdd=calcXG(action,pPos.x);xg=Math.round((xg+_xgAdd)*100)/100;const _ck=clockRef.current;if(ok){if(key==="goal"){goals++;rb+=5;pushMatchEvent(_ck,"player_goal",em=>"⚽ Tuo gol al "+em+"'"+(_assistBy?" (assist di "+_assistBy+")":""));}if(key==="assist"){assists++;rb+=3;pushMatchEvent(_ck,"player_assist",em=>"🎯 Assist"+(_assistTo?" per "+_assistTo:"")+" al "+em+"'");}/* [6.5.1 Polish A] score differito a fireGoalCeleb (palla in rete) */if(!["goal","assist"].includes(key))rb+=1;}else{if(key==="goal_against"){rb-=3;setScore(sc=>({...sc,away:sc.away+1}));setMxStats(x=>({...x,oppShots:(x.oppShots||0)+1}));/* [7.163.0 LIVE-F8] il gol subito È un tiro avversario: il box-score non può avere più gol che tiri */pushMatchEvent(_ck,"opp_goal",em=>"😨 Gol subito al "+em+"'");}if(key==="miss_easy"){rb-=2;pushMatchEvent(_ck,"miss",em=>"😱 Gol clamorosamente sprecato al "+em+"'");}}return{goals,assists,rb,xg};});
    // [6.41.0 collaudo PO «hanno festeggiato i tifosi ospiti anziché quelli di casa»] GOL SUBITO via highlight
    //   DIFENSIVO (goal_against): segna l'AVVERSARIO → devono esultare i SUOI tifosi. Prima questo path
    //   incrementava il punteggio ma NON emetteva alcun wave-event → nessuna esultanza sul gol subito (la
    //   curva che vedevi esultare era di un evento precedente/microsim, sul lato sbagliato per l'occhio).
    //   Ora emette l'esultanza sul lato GIUSTO: mesh avversario (home:false) + tribuna dell'avversario
    //   (stadiumHome=!isMatchHome → se l'eroe gioca in TRASFERTA, l'avversario è la squadra di CASA).
    if(!ok&&key==="goal_against")setWaveEvent({t:Date.now(),home:false,stadiumHome:!isMatchHome});
    if(ok&&(key==="recovery"||key==="intercept"))setPossession(p=>clamp(p+1,20,80));
    // [5.92.0 FIX PO] SUSPENSE: prima la simulazione 3D, POI la scritta — cronaca dell'esito, riga
    //   difensiva e flash rosso si rivelano quando l'arco è arrivato (gol/assist ~1.25s, conclusioni 1.1s, resto 0.85s).
    const _rd92=(key==="goal"||key==="assist"||key==="chance")?1650:(_isDefHL76&&(_defTraj&&_defTraj.inbound))?2250:(_isDefHL76?1900:(!ok&&/dribbl|sterzat|doppio passo|elastic|tunnel|scatto|finta|taglio|inseriment/i.test(action.label||""))?2100:(/tir|conclus|rovesciat|vol[eé]|testa|punizion|rigor|bordata|missile/i.test(action.label||"")?1500:1200));/* [7.8.24] reveal/cronaca più ritardati: il 3D dell'azione si svolge prima dell'esito · [7.235.0 #51] sui DRIBBLING FALLITI il verdetto aspetta il duello · [7.242.0 #56] il verdetto DIFENSIVO aspetta l'azione: con l'inbound (7.239) il pallone deve ancora ARRIVARE quando prima usciva l'overlay (misurato ~0.9s sul foglio gi31) → 2250ms con inbound, 1900 senza — dentro il cap [1800,4000] del check post-highlight */
    setResultReveal(false);
    // [6.5.4] ESITO IN BASSO ⟺ SOVRAIMPRESSIONE: il pannello risultato NON si rivela più a _rd92 (spesso PRIMA
    //   dell'overlay). Per goal/assist lo rivela fireGoalCeleb (ingresso in rete); per gli altri esiti lo rivela
    //   il timeout del floatGoal (stessa callback → stesso istante). Qui resta solo la cronaca (log scorrevole).
    // [7.54.0 BL-15 · AC-049/050] la cronaca dell'esito (+ riga difensiva 5.65.0, coerente con ciò che la palla
    //   fa in 3D: rimessa/angolo/ripartenza/rilancio) non esce più a timer fisso _rd92 ma DENTRO il reveal
    //   sincronizzato all'animazione (fireOutcomeReveal per i non-gol · fireGoalCeleb per gol/assist).
    const _comFn15=()=>{addCom(txt,ok?"#16a34a":"#dc2626",clock);
      if(_defTraj){const _dk=_defTraj.kind,_dtx={
          throw_in:"↔️ Deviata in rimessa laterale.",corner_conceded:"🚩 Deviata in calcio d'angolo.",
          counter:"⚡ Recupera e lancia la ripartenza!",pass_start:"🎯 Recupera e riparte dal basso.",
          safe_clear:"🛡️ Spazzata lunga per allontanare il pericolo."}[_dk];
        if(_dtx)fxTimeout(()=>addCom(_dtx,_dk==="corner_conceded"?"#f59e0b":"#60a5fa",clock),220);}};
    // M2 · MATCH MEMORY → CONTINUITÀ NARRATIVA (Cap.5.6): aggiorna la memoria e, se una condizione VERA lo
    //   giustifica, aggiunge UNA riga di cronaca che collega l'azione al passato della partita. Solo eventi
    //   realmente accaduti (mai riferimenti falsi). Deterministica (nessun random). Additiva, effimera.
    {const _mm=matchMemRef.current;const _priorMiss=_mm.misses>0;let _cont=null;
      if(ok&&key==="goal"){_mm.goals++;
        if(_priorMiss&&_mm.goals===1)_cont="💪 Si riscatta dopo l'occasione fallita di poco fa!";
        else if(_mm.goals===2)_cont="🔥 Doppietta personale!";
        else if(_mm.goals===3)_cont="⚽ Tripletta! Serata da ricordare.";
        else if(_mm.goals>=4)_cont="🌟 "+_mm.goals+" gol in una sola partita!";}
      else if(ok&&key==="assist"){_mm.assists++;
        if(_mm.assists===2)_cont="🎯 Secondo assist della partita!";
        else if(_mm.assists>=3)_cont="🎯 "+_mm.assists+"° assist — è in cattedra!";}
      else if(!ok&&(key==="miss"||key==="miss_easy"||(!_isDefHL76&&(key==="intercept"||key==="through")))){_mm.misses++;// [6.76.0 LMV-S1] la memoria narrativa vede corner/falli anche sui fail non-"miss"
        const _nk84=_missKindNorm(_outKind);
        if(_nk84==="saved"){_mm.gkSaves++;if(_mm.gkSaves>=2)_cont="🧤 Il portiere avversario è in serata di grazia.";}
        else if(_nk84==="corner"){_mm.corners=(_mm.corners||0)+1;if(_mm.corners>=2)_cont="🚩 Pressione totale — un altro angolo guadagnato!";}/* [6.4.8 R5.4] la memoria narrativa coglie la pressione crescente */
        else if(_nk84==="foul"){_mm.foulsWon=(_mm.foulsWon||0)+1;if(_mm.foulsWon>=2)_cont="🎯 Un'altra punizione conquistata: l'avversario è in affanno.";}}
      if(_cont)addCom(_cont,ok?"#22c55e":"#f59e0b",clock);
      // cpmadapt: registra la FASCIA da cui l'Eroe agisce (y logico) → l'IA off-ball ci "ombreggia" (Cap.4.12).
      //   USA pPosRef.current (valore LIVE): pPos dalla closure è stale (la dep list di handleAction ha pPos.x, non .y).
      {const _fy=(pPosRef.current&&pPosRef.current.y)!=null?pPosRef.current.y:pPos.y;const _bf=_mm.byFlank||(_mm.byFlank={L:0,C:0,R:0});if(_fy<33)_bf.L++;else if(_fy>67)_bf.R++;else _bf.C++;}}
    setAiCommentary(null);
    if(ok)setCutFx({key:Date.now(),dur:key==="goal"?560:360});// stacco nero di transizione su azione riuscita / gol
    // Visual feedback
    if(ok&&(key==="goal"||key==="assist")){
      // 5.43.8 — l'esultanza (GOL + eventuale DOMINIO) parte quando la palla ENTRA in rete (onGoalInNet),
      //   sia per i GOL diretti sia per gli ASSIST (il compagno segna) → messaggio SEMPRE presente e mai
      //   accavallato all'azione. Fallback timeout solo se l'ingresso non viene rilevato.
      const _gk=Date.now();
      /* [7.371.0] rigore/punizione: il tipo si legge dalla situation corrente. Serve al piano
         d'esultanza (§14/§15) — non cambia quando la celebrazione parte, solo come e' fatta. */
      const _sp371=(()=>{try{const _s=situations[hlIdx];if(!_s)return null;const _t=(typeof deriveIntent==="function"?deriveIntent(_s):null)||"";
        if(/penalty|rigore/i.test(String(_t)+" "+String(_s.text||"")))return "penalty";
        if(/freekick|punizione/i.test(String(_t)+" "+String(_s.text||"")))return "freekick";return null;}catch(_e){return null;}})();
      const _heroSurn=((typeof _surnBG==="function"&&_surnBG(player.name||""))||(player.name||"L'eroe").trim().split(/\s+/).pop())||(player.name||"L'eroe");/* [7.304.0] particella inclusa *//* [7.112.0] nomi marcatore/assist-man anche nell'overlay LIVE */
      goalCelebRef.current={/* [7.371.0] il TIPO di gol serve al Celebration System: rigore e punizione hanno una sequenza propria (direttiva §14/§15) e la celebrazione parte comunque solo dalla conferma */setPiece:_sp371,bigMatch:false,/* [7.371.0] l'importanza della partita entrera' col prossimo giro: qui non e' in ambito e non si inventa un riferimento */gk:_gk,clubCol:player.club?.c||"#f59e0b",assist:(key==="assist"),scorerName:(key==="assist"?(_assistTo||null):_heroSurn),assisterName:(key==="assist"?_heroSurn:(_assistBy||null)),domino:false,fired:false,scoreHome:true,com:_comFn15};// [6.5.1 Polish A] scoreHome → il tabellone si aggiorna all'ingresso in rete · [7.54.0 BL-15] com → cronaca all'ingresso · [7.112.0] scorer/assister per l'overlay
      fxTimeout(()=>fireGoalCeleb(),5200);// [6.5.1 Polish B] fallback più generoso (3200→5200): con il build-up R5 su cross/testa il tempo palla→rete è cresciuto; così l'esultanza non parte PRIMA dell'ingresso (onGoalInNet vince sempre nel caso normale)
    } else if(ok&&key==="recovery"){
      outcomeRevealRef.current={fired:false,minAt:Date.now()+_rd92,cb:()=>{setFloatGoal({text:(_ovl.icon?_ovl.icon+" ":"")+_ovl.text,col:"#60a5fa",key:Date.now()});setResultReveal(true);_comFn15();}};// [7.54.0 BL-15] bottom + sovraimpressione + cronaca all'ASSESTAMENTO reale della palla (onOutcomeShown), non più a 1800 fisso
      fxTimeout(()=>fireOutcomeReveal(),2600);
    } else if(ok&&!["goal","assist"].includes(key)){
      outcomeRevealRef.current={fired:false,minAt:Date.now()+_rd92,cb:()=>{setFloatGoal({text:(_ovl.icon?_ovl.icon+" ":"")+_ovl.text,col:"#a78bfa",key:Date.now()});setResultReveal(true);_comFn15();}};
      fxTimeout(()=>fireOutcomeReveal(),2600);
    } else if(!ok){
      outcomeRevealRef.current={fired:false,minAt:Date.now()+_rd92,cb:()=>{setFloatGoal({text:(_ovl.icon?_ovl.icon+" ":"")+_ovl.text,col:_ovl.tone==="neutral"?"#cbd5e1":"#f87171",key:Date.now()});setResultReveal(true);_comFn15();
        if(key==="miss_easy"||key==="goal_against")flashScreen({col:"rgba(239,68,68,0.35)",dur:400});}};// [7.54.0 BL-15] overlay/cronaca/flash all'IMPATTO reale (parata/palo/fuori dal 3D), non più a 1800 fisso
      fxTimeout(()=>fireOutcomeReveal(),2600);
    }
    // Particle effect based on action outcome
    const shotActions=["tiro","shot","cross","punizione","rigore","volée","colpo di testa","tiro a giro","tocco sotto"];
    const tackleActions=["tackle","contrasto","intercetta","pressing","anticipo","recupero","scivolata"];
    const isShot=shotActions.some(w=>action.label?.toLowerCase().includes(w));
    const isTackle=tackleActions.some(w=>action.label?.toLowerCase().includes(w));
    if(ok&&key==="goal"){/* 5.43.4: actionEffect 'goal' differito in fireGoalCeleb (parte all'ingresso della palla in rete) */}
    else if(isShot&&ok)setActionEffect({type:"spark",col:homeKitCol,key:Date.now()});
    else if(isShot&&!ok)setActionEffect({type:"spark",col:"#ef4444",key:Date.now()});
    else if(isTackle)setActionEffect({type:"dust",key:Date.now()});
    /* [7.349.0] GANCIO DI MISURA: il tipo d'esito (chance/saved/blocked…) lo decide il motore dal contesto
       — fatica, pressione, qualita' — quindi una probe non puo' riprodurre a comando quello che il PO ha
       visto in partita. Senza, l'unica alternativa e' dedurre dal codice, cioe' indovinare. Test-only. */
    if((_SIT_TEST||_CPM_TEST)&&typeof window!=='undefined'&&window.__CPM_FORCE_KIND){key=window.__CPM_FORCE_KIND;_outKind=window.__CPM_FORCE_KIND;}
    setOutcome({text:txt,ok,actionLabel:action.label,outKey:key,overlay:_ovl.text,overlayIcon:_ovl.icon,overlayTone:_ovl.tone,outKind:_outKind,woodwork:_wood,/* [7.217.0] palo o traversa: deciso qui, il 3D lo obbedisce invece di dedurlo per conto suo */revealMs:_rd92,defTraj:_defTraj,cause:(ok?(_posC84[0]&&_posC84[0][1]):(_negC84[0]&&_negC84[0][1]))||null});setChosenAct(action);// [5.84.0 UX-2b] · [7.136.0] overlayIcon
    // LMQP-1/3: registra l'esito risolto + i fatti cinematici DECISI A RUNTIME (deriveHL/hlBallState),
    //   così il check timeline valida gli invarianti CINE sulla decisione LIVE (testa⟹aerea, volée⟹aerea, set-piece⟹palla ferma).
    let _cine={};try{const _s=situationsRef.current[hlIdxRef.current];if(_s){const _h=(typeof deriveHL==="function"&&deriveHL(_s,action))||{};_cine={type:_h.type||null,variant:_h.variant||null,pattern:_h.pattern||null,ballState:(typeof hlBallState==="function"?hlBallState(_s):null)};}}catch(_e){}
    cpmEmit("ActionResolved",{gi:hlIdxRef.current,intent:(situationsRef.current[hlIdxRef.current]?.intent)||null,label:action.label,stat:action.stat||null,ok:!!ok,key:key,hlType:_cine.type,hlVariant:_cine.variant,hlPattern:_cine.pattern,ballState:_cine.ballState});
    // M3 · COHERENCE ASSERTION LAYER (passiva, osservabile — Cap.11 nell'idioma offline): su un tiro fallito
    //   la FAMIGLIA dell'overlay (_ovl.fam, scelta indipendentemente da hlOverlay) deve coincidere con la
    //   FAMIGLIA d'arco del 3D (_missKindNorm(outKind)). Se divergono → il check `timeline` del gate FALLISCE.
    //   Solo push su ring buffer + try/catch → nessuna mutazione di stato/render (gate-safe, no-op se rompe).
    try{ if(key==="miss"||(!ok&&!_isDefHL76&&(key==="intercept"||key==="through"||key==="miss_easy"))){ const _arcFam=_missKindNorm(_outKind);// [6.76.0 LMV-S1] il check M3 copre anche i fail non-"miss"
      const _coh=_arcFam?(_ovl.fam===_arcFam):true;
      cpmEmit("CoherenceCheck",{gi:hlIdxRef.current,kind:"overlay_arc",outKey:key,outKind:_outKind||null,arcFam:_arcFam||null,overlayFam:_ovl.fam||null,ok:!!_coh,detail:_coh?null:("overlayFam="+(_ovl.fam||"flat")+" ≠ arcFam="+_arcFam)}); } }catch(_e){}
    // LMQP B1 (5.38.0) — BACKBONE NARRATIVO per-beat: emette la timeline pianificata dell'highlight
    //   (buildHLTimeline, pura/deterministica) + le sue violazioni di invariante (validateHLTimeline).
    //   Abilita il Semantic/Narrative Validator (#16) a livello di beat. Push-only/try-catch → gate-safe,
    //   nessuna mutazione di stato/render, fuori dalla firma golden/determinism (solo ring buffer MATCH_TL).
    try{ if(_cine.type&&typeof buildHLTimeline==="function"){ const _pp=pPosRef.current||{x:50,y:50};
      const _tl=buildHLTimeline(_cine,{x:_pp.x,y:_pp.y,reward:key});
      const _viol=(typeof validateHLTimeline==="function")?validateHLTimeline(_tl,_cine):[];
      const _beats=(_tl.beats||[]);
      cpmEmit("HighlightTimeline",{gi:hlIdxRef.current,htType:_cine.type,pattern:_cine.pattern,
        beats:_beats.map(b=>({tag:b.tag,kind:b.ball&&b.ball.kind})),
        passes:_beats.filter(b=>['pass','give','through','cross'].includes(b.ball&&b.ball.kind)).length,
        last:(_beats[_beats.length-1]||{}).tag||null, violations:_viol});
    } }catch(_e){}
    // Sprint 97 — streak bonus: consecutive successes amplify momentum
    if(ok){streakRef.current=Math.min(streakRef.current+1,5);}
    else{streakRef.current=0;}
    const _streakBonus97=ok?streakRef.current*4:0;
    /* [6.4.5 R5.1] LE OCCASIONI CONTANO: un corner/palo/fallo guadagnato in attacco è un fallimento
       SOLO sul tabellino — stai pressando. Non crolli (delta +2 invece di -8): il momentum riflette la
       pericolosità reale dell'azione, non solo goal/non-goal. */
    const _dangerFail=(!ok)&&(_outKind==="corner"||_outKind==="post"||((_outKind==="fouled"||_outKind==="win_freekick")&&pPos.x>=60));
    setMomentum(m=>{
      const nm=clamp(m+(ok?10:(_dangerFail?2:-8))+_streakBonus97,0,100);
      // Trigger pressure cinema at thresholds
      if(nm>=85&&m<85){// 5.43.8: su gol/assist il DOMINIO parte con l'esultanza (palla in rete, via fireGoalCeleb); altrimenti differito breve
        if(goalCelebRef.current&&!goalCelebRef.current.fired){goalCelebRef.current.domino=true;}
        else{const _k97=Date.now();fxTimeout(()=>{setPressureCinema({text:"⚡ DOMINIO!",col:"#22c55e",key:_k97});fxTimeout(()=>setPressureCinema(null),1800);},1200);}}
      else if(nm<=15&&m>15){const _k97=Date.now();setPressureCinema({text:"🔴 PRESSIONE!",col:"#ef4444",key:_k97});fxTimeout(()=>setPressureCinema(null),1800);}
      return nm;
    });
    // Sprint 77 + Fase 6 (NEXT-GEN chaining robusto): un assist da palla messa in area innesca un
    //   secondo tempo (testa/mischia/rimbalzo). Rilevamento via regex case-insensitive ampia (non più
    //   catena fragile di .includes) + guardia di profondità (niente stacking di catene).
    if(ok&&(action.rew==="assist"||_chanceDrb)&&!pendingChainSitRef.current&&!(situations[hlIdx]&&situations[hlIdx]._chainDepth)){// [5.78.0 BUG-14] guardia di profondità REALE: una catena non può incatenarne un'altra
      if(_chanceDrb)pendingChainSitRef.current={...CHAIN_SITS.dopo_dribbling,_chainDepth:1};// [5.90.0 BLK-2] uomo saltato → conclusione da giocare
      else if(_crossChain704)pendingChainSitRef.current={...pick([CHAIN_SITS.sponda,CHAIN_SITS.mischia,CHAIN_SITS.second_ball]),_chainDepth:1};/* [7.0.4] cross consegnato in area → il secondo tempo finalizza (il cross non era gol) · [7.201.0] MAI `header`: il cross l'ha messo l'EROE, non può incornarlo lui — o lo prolunga un compagno (sponda) o nasce una mischia/un rimbalzo */
      else if(_chance78)pendingChainSitRef.current={...pick([CHAIN_SITS.mischia,CHAIN_SITS.second_ball]),_chainDepth:1};// [5.78.0 SIT-4] la chance APRE SEMPRE il secondo tempo: la conclusione va giocata
      else if(situations[hlIdx]?.chainOn==="aerial")/* [6.3.2 R1a] campo dichiarativo bakato in S(), non piu regex sul testo */
        pendingChainSitRef.current={...pick([CHAIN_SITS.sponda,CHAIN_SITS.mischia,CHAIN_SITS.second_ball]),_chainDepth:1};/* [7.201.0] `header` fuori: la consegna aerea (cross/corner/punizione/rimessa) l'ha battuta l'eroe */
    }
    /* [6.4.7 R5.3] IL CORNER CONQUISTATO (R2.2) È UNA VERA OCCASIONE: la conclusione deviata in angolo incatena
       l'attacco del calcio d'angolo (cross in area → stacco di testa) — la sequenza calcistica reale, non un
       vicolo cieco. Bounded da _chainDepth (un corner nato da una catena non ne apre un'altra). */
    if(!ok&&_outKind==="corner"&&!pendingChainSitRef.current&&!(situations[hlIdx]&&situations[hlIdx]._chainDepth)){
      /* [7.201.0] QUI `header` è corretto e resta: il corner nasce da una CONCLUSIONE dell'eroe deviata, quindi
         a batterlo è un compagno → l'eroe può salire a incornare. È l'unico caso in cui la consegna non è sua. */
      pendingChainSitRef.current={...pick([CHAIN_SITS.header,CHAIN_SITS.mischia]),_chainDepth:1};}
    // Sprint 79 — ball moves toward outcome position for visual coherence
    const _by79=pPosRef.current.y;
    if(key==="goal")ballTargetRef.current={x:97,y:clamp(_by79+rng(-12,12),22,78)};
    else if(key==="miss"||key==="miss_easy")ballTargetRef.current={x:rng(89,98),y:ok?clamp(_by79+rng(-10,10),22,78):rng(5,95)};
    else if(key==="assist")ballTargetRef.current={x:rng(86,95),y:clamp(_by79+rng(-18,18),12,88)};
    else if(key==="chance")ballTargetRef.current={x:rng(74,84),y:clamp(_by79+rng(-18,18),12,88)};/* [6.93.0 collaudo PO] la CHANCE si assesta al limite dell'area (respinta), NON sulla linea di porta come l'assist-gol — era metà del «pallone in porta senza gol» */
    else if(key==="intercept"||key==="through"){const _fam79=(!_isDefHL76&&_missKindNorm(_outKind))||null;// [6.76.0 LMV-S2] se il motore ha deciso corner/fuori/palo, il punto-palla logico è in ZONA PORTA (coerente con arco 3D e box-score), non a centrocampo
      ballTargetRef.current=(_fam79==="corner"||_fam79==="wide"||_fam79==="post")?{x:rng(84,96),y:clamp(_by79+rng(-16,16),8,92)}:{x:rng(45,72),y:clamp(_by79+rng(-20,20),8,92)};}
    else if(key==="recovery"||key==="save")ballTargetRef.current={x:rng(18,45),y:clamp(_by79+rng(-15,15),10,90)};
    else if(key==="goal_against")ballTargetRef.current={x:rng(2,12),y:clamp(_by79+rng(-15,15),20,80)};
    /* [7.57.0 PHASE 3 · collaudo PO «la 1ª azione fa cadere la palla in punti irrealistici, incompatibili con
       l'azione a catena guadagnata»] COERENZA CATENA per costruzione: se è stata iniettata una chain-sit, l'ASSESTAMENTO
       della palla è ancorato alla sua startZone (dove la 2ª azione REALMENTE comincia) invece del settle generico
       (chance=limite area) calcolato INDIPENDENTEMENTE dalla chain-sit → causa radice del problema. Effetto: (1) la
       palla arriva DOVE il secondo tempo si gioca — cross→header/mischia = IN AREA (x~84), dribbling/rimbalzo = al
       LIMITE (x~80) → realistico per il tipo di follow-up; (2) il punto è DENTRO la startZone → l'`_in` della
       continuità (11744) passa → NIENTE snap del clamp (era metà del «cade al limite ma lo stacco parte più profondo»).
       Deterministico (rng seedato). Copre TUTTE le famiglie di catena (dribble/cross/chance/corner). */
    {const _pcs=pendingChainSitRef.current;
     if(_pcs&&_pcs.startZone&&_pcs.startZone.x&&_pcs.startZone.y){const _psz=_pcs.startZone;
       ballTargetRef.current={
         x:clamp(_psz.x[0]+(_psz.x[1]-_psz.x[0])*0.42+rng(-3,3),_psz.x[0],_psz.x[1]),
         y:clamp((_psz.y[0]+_psz.y[1])/2+rng(-8,8),_psz.y[0],_psz.y[1])};
       /* [7.57.0] hook di osservabilità (test-only): coerenza assestamento↔startZone della chain-sit */
       if(_CPM_TEST){try{const _s=ballTargetRef.current,_z=_psz;window.__CPM_CHAIN_COH={settle:{x:_s.x,y:_s.y},sz:{x:[..._z.x],y:[..._z.y]},inZone:_s.x>=_z.x[0]&&_s.x<=_z.x[1]&&_s.y>=_z.y[0]&&_s.y<=_z.y[1],key,chainText:(_pcs&&_pcs.text)||null,srcText:(situations[hlIdx]&&situations[hlIdx].text)||null};}catch(_e){}}}}/* [7.201.0] +testo della chain-sit e della sit d'origine: la probe verifica che l'eroe non incorni MAI il proprio cross */
    // [7.91.0 collaudo PO «la palla della 1ª azione si ferma nel nulla SENZA GIOCATORI che ricevono, scollegata
    //   dalla 2ª»] CONTINUITÀ: se una catena è pendente, il COMPAGNO più vicino al punto d'assestamento ci si porta
    //   SUBITO → durante l'esito della 1ª azione la palla è RICEVUTA da un giocatore reale (non resta «nel nulla»),
    //   e il 2° tempo riparte da lì con l'eroe come finalizzatore. La palla logica settle è già ancorata alla
    //   startZone della chain-sit (7.57.0), quindi il ricevitore e il pallone convergono per costruzione.
    if(pendingChainSitRef.current&&ballTargetRef.current){const _st=ballTargetRef.current;
      setMatchPlayers(prev=>{let _bi=-1,_bd=1e9;prev.forEach((pl,i)=>{if(pl.team!=="home"||i===0)return;const d=Math.hypot((pl.x||50)-_st.x,(pl.y||50)-_st.y);if(d<_bd){_bd=d;_bi=i;}});
        if(_bi<0)return prev;return prev.map((pl,i)=>i===_bi?{...pl,x:clamp(_st.x-2,2,98),y:clamp(_st.y,2,98)}:pl);});}
    setPhase("hl_result");
    // Generate AI commentary async (non-blocking)
    generateHighlightCommentary(situations[hlIdx],action,{ok},player.stats,zone).then(c=>{
      if(_lmAliveRef.current&&c?.commentary)setAiCommentary(c);/* [7.121.0] guardia unmount */
    });
  },[phase,player.stats,pPos.x,clock,addCom,oppPrestige]);
  handleActionRef.current=handleAction;// VISUAL-TEST: riferimento aggiornato per __CPM_RESOLVE

  const RIGORE_DIRS={tl:"alto sinistra",tc:"alto centro",tr:"alto destra",bl:"basso sinistra",bc:"basso centro",br:"basso destra"};
  const RIGORE_ARROWS={tl:"↖",tc:"⬆",tr:"↗",bl:"↙",bc:"⬇",br:"↘"};
  const RIGORE_LABELS={tl:"Alto SX",tc:"Alto CTR",tr:"Alto DX",bl:"Basso SX",bc:"Basso CTR",br:"Basso DX"};
  /* [7.51.0 SET-PIECE 2.0] il resolver a SCELTE sostituisce il minigioco di mira: lo stile scelto +
     il motore puro (resolveSetPieceShot: stat non lineari, pressione, profilo GK seedato) decidono
     l'esito. La CONSEGNA (cross/palla in area) è delegata ad handleAction → pipeline chance/catena
     esistente. Emissioni timeline/coerenza IDENTICHE al vecchio handleRigore (taxonomy invariata). */
  const handleSetPiece=(opt)=>{
    if(phase!=="hl_choose")return;
    if(_hlActionFiredRef.current)return;
    const _sitAim=situationsRef.current[hlIdxRef.current];
    if(opt&&opt.kind==="delivery"&&opt.act){handleAction(opt.act);return;}/* la guardia doppio-tap la mette handleAction */
    _hlActionFiredRef.current=true;/* [6.44.0 RC-crit] guardia sincrona anti doppio-tap (reset in handleContinue) */
    const _isPenK=!!(typeof isPenaltySit==="function"&&isPenaltySit(_sitAim));
    const _kickWord=_isPenK?"Rigore":"Punizione",_kickWordLow=_isPenK?"rigore":"punizione",_aimIntent=_isPenK?"penalty":"freekick";
    const shotLabel=`${_kickWord} — ${opt.label}`;
    const _seed=(Math.abs(hashStr("sp|"+opt.id+"|"+clockRef.current+"|"+score.home+"-"+score.away+"|"+(player.name||"")))>>>0)||1;
    const _sd=score.home-score.away;
    const res=resolveSetPieceShot(opt.spKind||(_isPenK?"penalty":"fk_near"),opt,{attrs:player.stats||{},fatigue:100-(energy||70),morale:player.morale||60,form:player.form||70,oppPrestige:oppPrestige,clock:clockRef.current||0,scoreDiff:_sd,mw:(typeof mw!=="undefined"?mw:5),decisive:_isPenK&&(clockRef.current||0)>=85&&Math.abs(_sd)<=1,seed:_seed});
    gkDiveRef.current=res.gkDir;const gkLabel=RIGORE_DIRS[res.gkDir]||"";
    setEnergy(e=>clamp(e-(opt.nrg||8),0,100));
    setMxStats(st=>({...st,shots:st.shots+1}));
    const _tx=(pool)=>pool[(Math.abs(hashStr("tx|"+opt.id+"|"+_seed))>>>0)%pool.length];
    if(res.outKind==="saved"){
      const txt=opt.chip&&res.chipStay
        ?`🧤 Il portiere NON si muove! Legge il cucchiaio e raccoglie il pallone — che freddezza la SUA.`
        :_tx([`🧤 PARATA! Il portiere vola ${gkLabel} e ci arriva!`,`🧤 Respinge! Intervento super del portiere, disteso ${gkLabel}.`,`🧤 C'è arrivato! Il portiere legge la traiettoria e la toglie ${gkLabel}.`]);
      setResultReveal(false);fxTimeout(()=>setResultReveal(true),1450);
      fxTimeout(()=>{addCom(txt,"#f87171",clock);flashScreen({col:"rgba(239,68,68,0.4)",dur:500});},1000);
      setOutcome({text:txt,ok:false,actionLabel:shotLabel,revealMs:1450,outKind:"saved",outKey:"save"});setChosenAct({label:shotLabel,stat:"tiro",nrg:opt.nrg||8});
      try{cpmEmit("ActionResolved",{gi:hlIdxRef.current,intent:_aimIntent,label:shotLabel,stat:"tiro",ok:false,key:"miss",outKind:"saved"});}catch(_e){}
      try{const _af=_missKindNorm("saved");cpmEmit("CoherenceCheck",{gi:hlIdxRef.current,kind:"overlay_arc",outKey:"miss",outKind:"saved",arcFam:_af,overlayFam:_af,ok:true});}catch(_e){}
      setMomentum(m=>clamp(m-15,0,100));
      try{const _mm=matchMemRef.current;if(_mm){_mm.misses=(_mm.misses||0)+1;_mm.gkSaves=(_mm.gkSaves||0)+1;}}catch(_e){}
    }else if(res.outKind==="goal"){
      const txt=opt.chip?`🥄 CUCCHIAIO! Il portiere si tuffa ${gkLabel} e la palla scende dolcissima in rete. Gelo, poi boato.`
        :opt.id==="pen_top"||opt.id==="fk_curl"?_tx([`🚀 ALL'INCROCIO! Traiettoria perfetta — imprendibile. Il portiere ${gkLabel} può solo guardare.`,`⚽ Sotto l'incrocio! Esecuzione da fuoriclasse.`])
        :opt.id==="pen_power"||opt.id==="fk_power"||opt.id==="fk_far"?_tx([`💥 POTENZA PURA! Il portiere la tocca ma non basta — dentro!`,`⚽ Fucilata! Troppo forte per chiunque.`])
        :_tx([`⚽ GOOOAL! Piazzato all'angolo — il portiere va ${gkLabel}, la palla dall'altra parte.`,`⚽ Freddezza glaciale: angolo scelto, portiere battuto.`]);
      /* [7.373.0 §14/§15] IL PIAZZATO ORA ESULTA. Il piano si costruisce PRIMA dell'incremento del
         punteggio: `goalContext` pesa il gol sul risultato di PARTENZA, e leggerlo dopo l'incremento
         avrebbe classificato ogni rigore come se il vantaggio ci fosse gia'. E si arma anche `waveEvent`,
         che e' cio' da cui il render-loop fa partire `celebT`, il boato e i coriandoli: senza, il gol da
         rigore restava l'unico gol muto del gioco. */
      const _spKind373=/^pen/i.test(String(opt.id||""))?"penalty":"freekick";
      try{buildCelebPlan({by:"hero",setPiece:_spKind373,key:Date.now()});}catch(_e373){}
      try{setWaveEvent({t:Date.now(),home:true,stadiumHome:isMatchHome});}catch(_e374){}
      cpmEv("goal",{min:clockRef.current,side:"home",src:"setpiece"});/* [7.496.0 F1b] il gol dell'EROE su palla ferma: e' l'UNICO che non passa da `handleContinue` (nota 7.392), quindi va registrato qui */
      scoreRef.current={home:(scoreRef.current.home||0)+1,away:scoreRef.current.away||0};/* [7.113.0 audit massivo · fix C1] il gol da set-piece incrementa il punteggio LOGICO (scoreRef) SUBITO, non solo col setScore differito a 1450ms: prima, se la punizione/rigore era l'ULTIMO HL di un KO in parità e si toccava «Continua» nella finestra 800-1450ms, `_goEndOrCeremony` leggeva ancora il pari → RIGORI FASULLI o risultato registrato incoerente (goals:1 ma homeScore:0/pari). Il setScore resta a 1450 per la sincronia visiva col pallone in rete */
      setResultReveal(false);fxTimeout(()=>setResultReveal(true),1450);
      fxTimeout(()=>{try{AudioMgr.event({type:'GoalTeam'});}catch(_a){}/* [7.62.0 AUDIO] boato sul gol da rigore (non passa da fireGoalCeleb) */addCom(txt,"#16a34a",clock);flashScreen({col:"rgba(255,255,255,0.42)",dur:500});setCutFx({key:Date.now(),dur:560});setFloatGoal({text:"⚽ GOL!",col:"#f59e0b",key:Date.now()});setScore(sc=>({...sc,home:sc.home+1}));},1450);
      pushMatchEvent(clockRef.current,"player_goal",em=>"⚽ Tuo "+_kickWordLow+" al "+em+"'");
      setMStats(st=>({...st,goals:st.goals+1,rb:st.rb+5}));
      try{const _mm=matchMemRef.current;if(_mm)_mm.goals=(_mm.goals||0)+1;}catch(_e){}
      setActionEffect({type:"goal",key:Date.now()});
      setOutcome({text:txt,ok:true,actionLabel:shotLabel,revealMs:1450,outKind:"goal",outKey:"goal"});
      try{cpmEmit("ActionResolved",{gi:hlIdxRef.current,intent:_aimIntent,label:shotLabel,stat:"tiro",ok:true,key:"goal"});}catch(_e){}
      setMomentum(m=>clamp(m+20,0,100));
      setChosenAct({label:shotLabel,stat:"tiro",nrg:opt.nrg||8});
    }else{
      const _missK=res.outKind;/* post|wide, deciso dal motore */
      const txt=_missK==="post"?_tx([`❌ PALO! Un urlo strozzato — centimetri dal gol.`,`❌ TRAVERSA piena! Che sfortuna.`,`❌ Sul legno! Il portiere era battuto ${gkLabel}.`])
        :opt.chip?`❌ Cucchiaio LUNGO — scavalca anche la traversa. Coraggio sprecato.`
        :_tx([`❌ Fuori! La cerca troppo precisa e la manda a lato.`,`❌ Alta! La potenza c'era, la mira no.`,`❌ Non trova lo specchio — occasione sprecata.`]);
      setResultReveal(false);fxTimeout(()=>setResultReveal(true),1450);
      fxTimeout(()=>{addCom(txt,"#f87171",clock);flashScreen({col:"rgba(239,68,68,0.3)",dur:400});},1000);
      setMStats(st=>({...st,rb:st.rb-2}));
      setOutcome({text:txt,ok:false,actionLabel:shotLabel,revealMs:1450,outKind:_missK,outKey:_missK});
      try{cpmEmit("ActionResolved",{gi:hlIdxRef.current,intent:_aimIntent,label:shotLabel,stat:"tiro",ok:false,key:"miss",outKind:_missK});}catch(_e){}
      try{const _af=_missKindNorm(_missK);cpmEmit("CoherenceCheck",{gi:hlIdxRef.current,kind:"overlay_arc",outKey:"miss",outKind:_missK,arcFam:_af,overlayFam:_af,ok:true});}catch(_e){}
      setMomentum(m=>clamp(m-10,0,100));
      setChosenAct({label:shotLabel,stat:"tiro",nrg:opt.nrg||8});
    }
    setPhase("hl_result");
  };
  handleRigoreRef.current=(_legacyDir)=>{/* [7.51.0] shim per l'AUTOPLAY del Live Match Validator: la vecchia direzione è ignorata, la SCELTA la fa l'IA (stesso sistema del giocatore) */
    try{const _sit=situationsRef.current[hlIdxRef.current];const _px=(pPosRef.current&&pPosRef.current.x)||66;
      const _opts=setPieceOptions(_sit,player,_px);if(!_opts.length)return;
      const _kind=isPenaltySit(_sit)?"penalty":((_opts[0]&&_opts[0].spKind)||"fk_near");
      const _ai=pickSetPieceChoiceAI(_kind,player.stats||{},{clock:clockRef.current||0,scoreDiff:score.home-score.away,mw:(typeof mw!=="undefined"?mw:5)},(Math.abs(hashStr("ai|"+String(_legacyDir)+"|"+clockRef.current))>>>0)||1);
      const _pick=_opts.find(o=>o.id===(_ai&&_ai.id))||_opts[0];handleSetPiece(_pick);}catch(_e){}};
  const handleContinue=()=>{
    // [6.78.0 FLAKE-FIX 2] in FORCE-MODE (gate) l'highlight forzato e' un CAMPIONE STATICO: nessun avanzamento
    //   (ne' "ended" ne' ripresa dal centro ne' catene) — il prossimo stato arriva dal prossimo __CPM_FORCE_SIT.
    //   Prima l'auto-advance sul GOL faceva la ripresa (palla→50,50, phase→playing) MENTRE il poller final-state
    //   campionava ancora → sui run freddi il check leggeva la palla a centrocampo («goal ma palla @37»).
    if(typeof window!=='undefined'&&window.__CPM_FORCED_MODE&&!(window.__CPM_REVIEW&&pendingChainSitRef.current))return;/* [7.227.0 #44] in REVISIONE la CATENA si gioca: con un secondo tempo pendente il wizard può avanzarci dentro (il ramo catena ritorna prima di ogni fine-partita; _goEndOrCeremony resta comunque guardato dal force-mode) */
    // [6.76.0 LMV-L7] guardia anti-rientro: auto-timer + Enter/tap nello stesso burst chiamavano handleContinue
    //   due volte — la 1ª consumava la CATENA (pendingChainSitRef→null), la 2ª cadeva nel ramo else e poteva
    //   avanzare con lo stato sbagliato. Lock breve (300ms), trasparente per l'uso normale.
    if(!_CPM_TEST&&!_SIT_TEST){if(_contLockRef.current)return;_contLockRef.current=true;setTimeout(()=>{_contLockRef.current=false;},300);}
    // [6.5.1 Polish A/B] se l'utente avanza PRIMA che la palla entri in rete (skip veloce), conta comunque
    //   il gol e fai partire l'esultanza ora (idempotente via g.fired) → niente gol non contato né tabellone «fermo».
    if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{const _h=(window.__CPM_CONT461=window.__CPM_CONT461||[]);if(_h.length<40)_h.push({ph:phaseRef.current||null,st:(new Error()).stack.split('\n').slice(1,5).join(' | ').slice(0,300)});}catch(_e){}}
    if(goalCelebRef.current&&!goalCelebRef.current.fired)fireGoalCeleb();
    /* [7.392.0 collaudo PO «continuo a non vedere esultanze, l'unica e' quella su rigore»] IL PIANO
       APPARTIENE ALL'ESULTANZA, NON ALLA TRANSIZIONE DI SCENA.
       La frase del PO e' la diagnosi: il rigore e' l'UNICO gol che non passa da qui. Su un piazzato il
       piano nasce in `handleSetPiece` e nessuno lo tocca; in gioco aperto `handleContinue` lo azzerava
       IMMEDIATAMENTE, e dal 7.384 il piano non e' un accessorio — e' cio' che tiene in vita la clip, la
       corsa e la durata. Azzerarlo mentre l'esultanza e' in corso la riduce a quello che era prima del
       7.371: un saltello muto, cioe' «non vedo esultanze».
       Il 7.384 aveva gia' insegnato all'AUTO-avanzamento ad aspettare, ma qui si arriva anche dal TOCCO
       del giocatore su «CONTINUA» e dal tasto Invio, che non passano di li'. La regola giusta non e'
       aggiungere un'altra attesa: e' che il piano viva quanto l'esultanza, chiunque chiuda la scena.
       Restano intatti i due motivi per cui l'azzeramento esiste — niente esultanza trascinata nella scena
       dopo, e nessun piano stantio: semplicemente arriva quando l'esultanza e' finita davvero. */
    try{const _rem392=(typeof window!=='undefined'&&window.__CPM_NO392)?0:((_celEndRef.current||0)-performance.now());
      if(_rem392>80){const _kill392=setTimeout(()=>{try{setCelebPlan(null);}catch(_e){}},Math.min(_rem392,4600));
        if(_celKillRef392.current)clearTimeout(_celKillRef392.current);_celKillRef392.current=_kill392;}
      else setCelebPlan(null);}catch(_e392){setCelebPlan(null);}
    goalCelebRef.current=null;// [6.76.0 LMV-L4] niente celeb stantio trascinato all'HL successivo
    if(outcomeRevealRef.current)outcomeRevealRef.current.fired=true;// [7.54.0 BL-15] lo skip CONSUMA il reveal non-gol pendente (mai overlay/cronaca postumi sull'HL successivo)
    _hlActionFiredRef.current=false; // reset for next HL
    gkDiveRef.current=null; // Bug #10: clear GK dive so penalty arrows don't persist
    cpmEmit("HighlightAdvance",{from:hlIdx,chained:!!pendingChainSitRef.current});// LMQP-1
    const nx=hlIdx+1;
    // Sprint 77 — Situation Chaining: inject chain before advancing
    if(pendingChainSitRef.current){
      const chain=pendingChainSitRef.current;
      pendingChainSitRef.current=null;
      setSituations(prev=>{const c=[...prev];c.splice(nx,0,chain);return c;});
      setHlTimes(prev=>{const c=[...prev];c.splice(nx,0,9999);hlTimesRef.current=c;return c;});
      setNumHL(prev=>{const v=prev+1;numHLRef.current=v;return v;});
      setHlIdx(nx);setOutcome(null);setChosenAct(null);
      /* [7.620.0 — ANCHE LA CATENA STACCA. Rosso __CPM_NO620]
         COLLAUDO PO su 7.615 (SIT #84, cross -> chance riuscita): «la CAMERA salta: passo di 4,0 unita'
         fra due fotogrammi a scena in corso (188 u/s), a 13,8 s dall'inizio». L'audit highlights l'aveva
         gia' inchiodato (punto 7): il ramo catena era L'UNICA uscita di scena SENZA stacco — gol 420 ms,
         «SI CONTINUA» 380, montaggio 360, catena NIENTE — e in piu' RI-STAGIA i 22 (l'effetto staging
         scatta sulla nuova situation): corpi e camera saltavano a vista. Il tempo del PO combacia: un
         cross riuscito innesca sponda/mischia/second_ball proprio da qui. Uno stacco corto (300 ms)
         maschera il ri-staging senza rompere il ritmo della catena — il float «CATENA!» resta. */
      if(!(typeof window!=='undefined'&&window.__CPM_NO620))setCutFx({key:Date.now(),dur:300});
      setFloatGoal({text:"⚡ CATENA!",col:"#f59e0b",key:Date.now()});
      setPhase("hl_intro");
      return;
    }
    /* [7.500.0 F4 — LA PARTITA FINISCE AL 90', NON QUANDO FINISCONO GLI HIGHLIGHT — direttiva PO «90 veri»]
       Fino al 7.499 questa riga chiudeva la gara appena l'ultimo highlight era stato giocato, qualunque
       fosse il cronometro: misurato sul flusso vero, il fischio arrivava al 50' e il ramo «cronometro a
       90» (r.~19942) non si raggiungeva quasi mai. «Sto assistendo a una partita» e «la partita dura
       finche' ci sono i miei momenti» sono due cose diverse, e questa era la seconda. Ora gli highlight
       esauriti riportano al GIOCO FLUIDO — con lo stesso punto di ripresa coerente e lo stesso stacco del
       ramo montaggio — e a chiudere resta solo il 90'. */
    var _esaur500=(nx>=numHLRef.current);
    var _fine500=_esaur500&&(((clockRef.current|0)>=90)||(typeof window!=='undefined'&&window.__CPM_NO500));/* prova del rosso: torna a finire con gli highlight */
    if(_fine500){cpmEv("fine",{min:clockRef.current|0,causa:((clockRef.current|0)>=90)?"clock":"highlight"});/* [7.500.0 F4] LA CAUSA DEL FISCHIO, non solo il minuto. Tre prove del rosso di fila sono fallite misurando il minuto finale, il calendario degli highlight e la loro coda: nessuno dei tre separa, perche' la coda REATTIVA fa crescere `numHL` in corsa e il vecchio jitter era largo fino a 38 minuti. Cio' che il rimedio cambia per DEFINIZIONE e' chi decide la fine — il cronometro o l'esaurimento dei momenti — e quello si registra. */
      if(!_SIT_TEST&&!(typeof window!=='undefined'&&window.__CPM_FORCED_MODE))_goEndOrCeremony();}// [6.77.0 FLAKE-FIX] mai "ended" (unmount 3D) sotto force-sit; [7.2.0] titolo → premiazione 3D
    else{
      var didSucceed=outcome&&outcome.ok;
      var wasGoal=outcome&&outcome.outKey==="goal";
      setHlIdx(nx);setOutcome(null);setChosenAct(null);
      if(wasGoal){
        // Fase 5 (NEXT-GEN ripresa): dopo il gol si riparte dal centro — palla a centrocampo,
        //   squadre richiamate nelle proprie metà (preset midfield), poi il gioco riprende naturale.
        //   Riusa drift+lerp palla (sistemi già testati) anziché una nuova fase → zero rischio state-machine.
        ballTargetRef.current={x:50,y:50};setBallPos({x:50,y:50});
        driftTargetsRef.current=DRIFT_PRESETS.midfield;
        setCutFx({key:Date.now(),dur:420});/* [6.74.0 3D-16] stacco di regia anche sul GOL: prima la mesh palla LERPAVA in piena vista ~48u dalla rete al cerchio di centrocampo (rotolamento surreale); il path "montaggio" lo mascherava già col cut */
        setFloatGoal({text:"⚽ Si riparte dal centro",col:"#ffffff",key:Date.now()});
        setPhase("playing");
      }else if(didSucceed&&!_esaur500/* [7.500.0] esauriti gli highlight non c'e' una scena successiva da incatenare: la catena manderebbe `hl_intro` su una situation inesistente */&&seededRng((Math.abs(hashStr("catena|"+nx+"|"+clockRef.current+"|"+scoreRef.current.home+"-"+scoreRef.current.away))>>>0)||1)()<0.25){
        // [5.97.0 MP-1] la CATENA passa dalla stessa porta della selezione lazy (5.79): situation
        //   RI-PESCATA col contesto VIVO (punteggio/minuto/momentum) + exclude anti-ripetizione,
        //   e il clock AVANZA allo slot dell'HL — prima si giocava la sit pre-kickoff a ctx neutro
        //   al minuto dell'HL precedente (bypass che reintroduceva la classe di bug chiusa da 5.79).
        var _scCH=scoreRef.current;var _ctxCH=_scCH.home>_scCH.away?"winning":_scCH.home<_scCH.away?"losing":"drawing";
        var _slotCH=(hlTimesRef.current[nx]&&hlTimesRef.current[nx]<9000)?hlTimesRef.current[nx]:clockRef.current;
        var _ckCH=Math.max(clockRef.current,_slotCH);
        try{
          var _reCH=selectContextualSituations([...SITUATIONS],1,player,((bgSimSeedRef.current^(_ckCH*331+nx*17))>>>0),{scoreCtx:_ctxCH,clock:_ckCH,momentum:momentumRef.current,possession:possessionRef.current,opponentId:opponent?.id||opponent?.n||null,weatherFx:(weather&&weather.pitchFx)||null,oppRed:oppRedRef.current,ballX:((ballTargetRef.current||ballPosRef.current||{}).x),/* [7.204.0] continuità territoriale: la prossima azione nasce vicino a dove il gioco si è fermato */exclude:situationsRef.current.slice(0,nx).map(function(x){return x&&x.text;})});
          if(_reCH&&_reCH.length>0)setSituations(function(prev){var c=[...prev];c[nx]=_reCH[0];return c;});
        }catch(_e){}
        setClock(function(c){return Math.max(c,_ckCH);});
        /* [7.201.0 direttiva PO «sembra davvero una partita di calcio»] DUE BUGIE IN UNA RIGA, entrambe corrette:
           (a) il banner diceva «CATENA!» ma questa NON è una catena — la catena vera (`pendingChainSitRef`, sopra)
               è il secondo tempo della STESSA azione, con la palla assestata nella startZone del follow-up (7.57.0);
               qui si passa a una situation NUOVA, ripescata dal pool: è la squadra che continua a spingere, non lo
               stesso pallone. Chiamarla catena preparava l'utente a una continuità che non poteva vedere;
           (b) mancava lo STACCO: il ramo «montaggio» qui sotto snappa palla+formazione con un `setCutFx` (regia TV),
               questo ramo saltava dritto in `hl_intro` → il salto alla nuova azione si vedeva tutto. Ora lo stesso
               cut copre anche la ripresa d'attacco, come in una regia vera. */
        setCutFx({key:Date.now(),dur:380});
        setFloatGoal({text:"⚡ SI CONTINUA!",col:"#f59e0b",key:Date.now()});
        setPhase("hl_intro");
      }else{
        // MONTAGGIO (transizioni): l'azione si è EVOLUTA → scegli un punto di ripresa COERENTE con l'esito e SNAPpa palla+formazione lì,
        //   con uno STACCO (cut) → la cronaca riprende come una regia TV. Elimina il "boomerang" (la palla che scivola indietro verso l'eroe).
        /* [7.195.0 S2 · direttiva PO «credibilità calcistica»] IL PUNTO DI RIPRESA HA UNA LOGICA.
           Tre difetti, tutti visibili: (a) la corsia era `30+Math.random()*40`, cioè una y qualunque scollegata da
           dove l'azione era davvero finita — un'azione chiusa sulla fascia destra ripartiva al centro o a sinistra,
           mezzo campo di traslazione laterale mascherata da uno stacco di 360ms; (b) la PARATA DELL'EROE (outKey
           "save" → save_hero: sei TU che salvi sulla TUA porta, e infatti l'assestamento la mette a x 18-45)
           finiva nello stesso ramo del tiro parato dal portiere avversario e faceva ripartire il gioco a x 72-86,
           cioè nell'area avversaria; (c) i sorteggi erano Math.random NUDI, quindi la stessa azione rigiocata
           ripartiva ogni volta da un punto diverso (Determinism First). Ora: corsia EREDITATA dalla y reale di fine
           azione con rientro parziale al centro, ramo dedicato alla parata dell'eroe (si riparte dalle proprie
           retrovie), e tutti i sorteggi SEEDATI su highlight+minuto+punteggio. */
        const _ok=outcome&&outcome.outKey;
        const _bEnd=ballTargetRef.current||ballPosRef.current||{x:50,y:50};
        let _rs=(Math.abs(hashStr("resume|"+hlIdx+"|"+(clockRef.current|0)+"|"+score.h+"-"+score.a))>>>0)||1;
        const _rr=()=>{_rs=(Math.imul(_rs,1664525)+1013904223)>>>0;return _rs/4294967296;};
        let _rx,_drift="midfield";
        /* la corsia resta quella dove l'azione è finita, con un rientro parziale verso il centro (come una squadra
           che si ricompatta): mai più il salto di fascia. */
        let _ry=clamp((_bEnd.y||50)*0.62+50*0.38+(_rr()*10-5),8,92);
        if(_ok==="save"){_rx=16+_rr()*12;_drift="midfield";}// PARATA DELL'EROE: la palla è tua, nelle tue retrovie → si riparte da dietro
        else if(_ok==="recovery"||_ok==="intercept"){_rx=42+_rr()*12;_drift="midfield";}// palla recuperata/intercettata → si gioca da metà campo
        else if(_ok==="wide"||_ok==="miss"||_ok==="post"){_rx=72+_rr()*14;_drift="retreat";}// tiro parato/fuori → l'avversario rilancia dalla sua trequarti, la tua squadra si ricompatta
        else if(_ok==="assist"||_ok==="through"){_rx=56+_rr()*16;_drift="attack";}// azione offensiva proseguita
        else{_rx=44+_rr()*12;_drift="midfield";}
        ballTargetRef.current={x:_rx,y:_ry};setBallPos({x:_rx,y:_ry});// SNAP immediato (target=pos) → niente lerp/scivolamento all'indietro
        driftTargetsRef.current=DRIFT_PRESETS[_drift]||DRIFT_PRESETS.midfield;
        /* [7.616.0] L'ESITO DELLA SCENA CLASSIFICA GIA' IL TURNOVER E NON LO PROPAGAVA: questo stesso
           ramo sceglie il punto di ripresa PROPRIO per outKey (parata → retrovie nostre, tiro fuori →
           l'avversario rilancia) ma il turno ambientale restava quello del sorteggio a orologio — in
           contraddizione con la scena appena vista. Ora il fatto scrive anche il turno, con la sua causa. */
        if(!(typeof window!=='undefined'&&window.__CPM_NO616)){
          const _t616=(_ok==="save"||_ok==="recovery"||_ok==="intercept"||_ok==="assist"||_ok==="through")?1:(_ok==="wide"||_ok==="miss"||_ok==="post")?-1:0;
          if(_t616)setTurn616(_t616,"esito-scena-"+_ok);
        }
        setCutFx({key:Date.now(),dur:360});// stacco cinematografico che maschera il riposizionamento
        setPhase("playing");
      }
    }
  };
  handleContinueRef.current=handleContinue;/* [7.227.0 #44] riferimento fresco per la continuazione-catena in revisione */
  const _buildEndResult=()=>{/* [7.24.3] risultato UNICO condiviso: consumato da handleEnd (tap post-partita) E dal sidecar al FISCHIO FINALE */
    const rbCapped=Math.min(mStats.rb,30);/* [7.8.28 QA] cap 20→30 e slope 0.115→0.13: la vecchia scala cappava il voto live a 8.45 — «voto 10»/«Prestazione storica» (≥9) e l'achievement perfect erano MATEMATICAMENTE irraggiungibili, e una tripletta+2 assist (21 punti) valeva quanto un gol+2 assist. Ora 9+ ~ tripletta+2 assist in vittoria, 10 solo su prestazioni epiche (rb≥30). Scala media quasi invariata (rb10: 7.30→7.45). */
    const _sc=(scoreRef&&scoreRef.current)?scoreRef.current:score;/* [7.113.0 audit massivo · fix C1] il risultato REGISTRATO usa il punteggio LOGICO immediato (scoreRef, come già `_goEndOrCeremony`), non lo `score` state che ritarda fino al setScore differito del set-piece → homeScore/won/drew coerenti con la decisione rigori-o-no */
    const resultBonus=_sc.home>_sc.away?0.35:_sc.home===_sc.away?0.0:-0.30;
    const raw=clamp(5.8+rbCapped*0.13+resultBonus,4.0,10.0);
    return {goals:mStats.goals,assists:mStats.assists,minutesPlayed:benchStart?Math.max(0,90-(benchMinute||60)):(subbedOffRef.current?subOffMinRef.current:90),matchStatus:benchStart?"bench":(sentOffRef.current||heroRedRef.current)?"sent_off":subbedOffRef.current?"subbed_off":"starter",/* [7.38.0 Sezione 8] · [7.163.0 LIVE-F7] l'espulsione non è più archiviata come «sostituzione» */homeScore:_sc.home,awayScore:_sc.away,won:_sc.home>_sc.away,drew:_sc.home===_sc.away,wasBehind:wasBehindRef.current,/* [7.8.28 QA] per l'achievement Rimonta */opponent:opponent?.name||opponent?.n,oppAbbr:opponent?.abbr||opponent?.a,oppCol:opponent?.col||opponent?.c,rating:Math.round(raw*10)/10,context,isHome:isMatchHome,attendance:attendance,/* [7.1.3] luogo · [7.6.0 FASE 2] affluenza → ricavi matchday */oppTactic:oppTactic||null,scoutReport:scoutReport||null,homeRoster,heroRoster:(isMatchHome?homeRoster:awayRoster),shots:mxStats.shots,oppShots:mxStats.oppShots,fouls:mxStats.fouls,corners:mxStats.corners,possession:Math.round(possession),redCard:heroRedRef.current,yellowCards:heroYellowsRef.current,sentOff:sentOffRef.current,heroFouls:heroFoulCntRef.current,/* [7.137.0] cartellini REALI dell'eroe dal vivo → la squalifica ne deriva */assistLinks:{given:[...(assistLinksRef.current.given||[])],received:[...(assistLinksRef.current.received||[])]}};/* [6.45.0 RC] heroRoster = rosa dell'EROE (in trasferta homeRoster è la squadra AVVERSARIA → il «Migliore in campo» della rassegna finiva agli ospiti) · [7.110.0] assistLinks: connessioni assist coi compagni */
  };
  const handleEnd=()=>{onMatchEnd(_buildEndResult());};

  // Always-current refs so the keyboard handler never uses a stale closure
  const _kbAction=useRef(handleAction);_kbAction.current=handleAction;
  const _kbContinue=useRef(handleContinue);_kbContinue.current=handleContinue;
  const _kbEnd=useRef(handleEnd);_kbEnd.current=handleEnd;

  useEffect(()=>{
    const sit=situations[hlIdx];
    const onD=e=>{
      if(_scrive386(e))return;/* [7.386.0] il fuoco e' in una casella di testo: la tastiera non e' del gioco */
      keysRef.current.add(e.key);
      // Pause toggle: Escape or P during active match
      if((e.key==="Escape"||e.key==="p"||e.key==="P")&&["playing","hl_intro","hl_move","hl_choose","hl_result"].includes(phase)){
        e.preventDefault();e.stopImmediatePropagation();setPaused(v=>!v);return;
      }
      if(paused)return; // block all other input while paused
      if((phase==="hl_move"||phase==="hl_choose")&&["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","w","a","s","d"].includes(e.key))e.preventDefault();
      // [6.44.0 RC] la tastiera deve rispecchiare ESATTAMENTE i bottoni a schermo:
      //   (a) le azioni sono la lista FILTRATA (filterSitActions scarta/riordina — es. testa su palla a terra) →
      //       il tasto numero risolve l'azione ETICHETTATA, non una scartata; (b) su rigori/punizioni (isAimSit)
      //       i bottoni sono il minigioco di MIRA (handleRigore): la tastiera non deve bypassare in handleAction.
      const _kbOpts=(sit&&typeof filterSitActions==="function")?filterSitActions(sit.actions||[],(pPosRef.current&&pPosRef.current.x)||50,sit):((sit&&sit.actions)||[]);
      const _kbAim=!!(sit&&typeof isAimSit==="function"&&isAimSit(sit));
      // In hl_move: 0/1/2/3 skip movement and go straight to action
      if(phase==="hl_move"&&(["0","1","2","3"].includes(e.key)||e.key==="Numpad0")){
        e.preventDefault();
        if(_kbAim){setPhase("hl_choose");return;}
        const idx=e.key==="0"||e.key==="Numpad0"?0:parseInt(e.key)-1;
        if(_kbOpts[idx])pendingActionRef.current=_kbOpts[idx];
        setPhase("hl_choose");
        return;
      }
      if(phase==="hl_choose"&&!_kbAim){
        if(["1","2","3"].includes(e.key)){
          e.preventDefault();
          const idx=parseInt(e.key)-1;
          if(_kbOpts[idx])_kbAction.current(_kbOpts[idx]);
          return;
        }
        if(e.key==="0"||e.key==="Numpad0"){
          e.preventDefault();
          if(_kbOpts[0])_kbAction.current(_kbOpts[0]);
          return;
        }
        if(e.key==="Enter"||e.key===" "){
          e.preventDefault();
          if(_kbOpts[0])_kbAction.current(_kbOpts[0]);
          return;
        }
      }
      if(phase==="hl_intro"&&(e.key===" "||e.key==="Enter")){e.preventDefault();return;}
      if(phase==="hl_result"&&(e.key==="Enter"||e.key===" ")){e.preventDefault();if(Date.now()-(resultShownRef.current||0)>800)_kbContinue.current();return;}// [6.76.0 LMV-L6] anche la tastiera rispetta la guardia anti-skip-accidentale del tap (rigore: score/float a 1000ms non più scavalcati da Enter immediato)
      if(phase==="ceremony"&&(e.key==="Enter"||e.key===" ")){e.preventDefault();skipCeremony();return;}/* [7.2.0] Enter/Space salta la premiazione → card di fine gara */
      if(phase==="ended"&&(e.key==="Enter"||e.key===" ")){e.preventDefault();_kbEnd.current();return;}
      if((phase==="matchday"||phase==="formations")&&(e.key==="Enter"||e.key===" ")){e.preventDefault();setPhase(p=>p==="matchday"?"formations":"walkout");return;}
      if(e.key==="0"||e.key==="Numpad0"){
        e.preventDefault();
        if(phase==="hl_move")setPhase("hl_choose");
        else if(phase==="hl_result"){if(Date.now()-(resultShownRef.current||0)>800)_kbContinue.current();}// [6.76.0 LMV-L6] guardia anti-skip (come il tap)
        // [5.75.0 BUG-9] lo skip da playing saltava DIRETTO a hl_move senza il routing/reset di startHL → DPad e mosse dell'HL precedente. Ora entra da hl_intro come il flusso naturale (che azzera anche la cronaca BG).
        else if(phase==="playing"&&hlIdx<hlTimes.length){setClock(c=>Math.max(c,hlTimes[hlIdx]));setBgAction(null);setPhase("hl_intro");}// [6.76.0 LMV-L3] il clock non torna MAI indietro (un HL dinamico con tempo già passato non regredisce il minuto)
      }
    };
    const onU=e=>keysRef.current.delete(e.key);
    document.addEventListener("keydown",onD);
    document.addEventListener("keyup",onU);
    return()=>{document.removeEventListener("keydown",onD);document.removeEventListener("keyup",onU);};
  },[phase,hlIdx,situations,paused]);// eslint-disable-line

  // Fire pending action when hl_choose becomes active (from 0/1/2/3 in hl_move)
  useEffect(()=>{
    if(phase!=="hl_choose")return;
    if(!pendingActionRef.current)return;
    const a=pendingActionRef.current;pendingActionRef.current=null;
    handleAction(a);
  },[phase,handleAction]);// eslint-disable-line

  // Post-highlight: durata DINAMICA in base ad azione/esito (4.85.0) — sostituisce il fisso 1s che
  // tagliava palla in volo e slow-mo. Sempre ≥ durata arco/slow-mo + tempo di lettura dell'esito.
  useEffect(()=>{
    if(phase!=="hl_result"||paused)return;
    resultShownRef.current=Date.now()+((outcome&&outcome.revealMs)||0);// [5.84.0 UX-3 · 5.92.0] la guardia anti-tap parte dal REVEAL
    const dur=postHighlightDuration(outcome,chosenAct)+Math.min((((outcome&&outcome.revealMs)||0)*0.5)|0,950);// [5.92.1] la suspense vive DENTRO la finestra del result: compensa solo metà reveal, cap 950ms — durata totale sempre <4000 (guardia UX del check post-highlight)
    if(typeof window!=='undefined'&&/[?&]cpmtest=1\b/.test(window.location.search||""))window.__CPM_RESULT_DUR=dur;// VISUAL-TEST
    // [6.76.0 LMV-L4] gol/assist con palla ANCORA in volo (build-up lunghi: cross/testa fino a ~5.2s):
    //   l'auto-advance non taglia più reveal+esultanza — se la celebrazione non è ancora partita rinvia UNA
    //   volta (~1.9s) e poi avanza (handleContinue resta idempotente via g.fired). Skip manuale invariato.
    let t2=null;
    /* [7.461.0 direttiva PO «le azioni/scene/highlights possono prendersi anche piu' tempo — non c'e' fretta»]
       LA SCENA HA LA PRECEDENZA SUL CRONOMETRO. Questa finestra e' un `setTimeout` in tempo REALE, ma la
       catena cinematica (build-up → arco → post-arco) gira sul CLOCK DI SCENA, che `dt` tappa a 0.05
       (r.~12176): a 9-10 fps — headless E telefono lento — il clock di scena avanza meno della meta' del
       tempo reale, e il 7.460 aveva MISURATO la conseguenza sul flusso vero (finestra 3,47s reali contro
       1,35s di clock di scena, arco ancora in volo, pallone abbandonato a x 30,8 su un gol contato a
       tabellone). Ora l'auto-avanzamento non chiude finche' il renderer dichiara di avere ancora qualcosa
       da mostrare (`cineBusyRef`, scritto ogni fotogramma). Il TETTO esiste perche' nulla resti appeso se
       la catena non si spegne mai; lo skip MANUALE resta libero — se il giocatore tocca CONTINUA sta
       chiedendo di saltare, ed e' un'altra cosa. */
    let _att461=0;
    const _avanza461=()=>{
      try{
        const _c=cineBusyRef.current;
        const _on=(typeof window!=='undefined')&&!window.__CPM_NO461&&((!_CPM_TEST&&!_SIT_TEST)||!!window.__CPM_CINE||!!window.__CPM_REALWAIT);/* sotto il gate (`?cpmtest=1` senza opt-in cine) la finestra resta quella di sempre: il check post-highlight misura durate fisse e il percorso del gate va lasciato bit-identico */
        if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{const _w=(window.__CPM_WAIT461=window.__CPM_WAIT461||[]);if(_w.length<80)_w.push({on:_on,c:_c?{on:_c.on,tl:_c.tl,arc:_c.arc,pa:_c.pa}:null,att:_att461});}catch(_e){}}
        if(_on&&_c&&_c.on&&(_c.tl||_c.arc||_c.pa)&&_att461<6000){_att461+=180;t2=setTimeout(_avanza461,180);return;}
      }catch(_e461){}
      handleContinue();
    };
    const t=setTimeout(()=>{
      const _gk76=(!_CPM_TEST&&!_SIT_TEST||(typeof window!=='undefined'&&window.__CPM_REALWAIT))&&outcome&&(outcome.outKey==="goal"||outcome.outKey==="assist");/* [7.460.0] `__CPM_REALWAIT` (test-only, mai settato dal gate) apre SOTTO TEST la stessa attesa che il gioco vero concede al gol: senza, ogni misura sulla finestra d'esito misurerebbe una finestra che il giocatore non ha mai — la trappola gemella di quelle gia' pagate. */// SOLO per l'esito corrente (mai su un celeb stantio di un HL precedente); presentazione -> spenta sotto test (il gate campiona a tempi fissi)
      if(_gk76&&goalCelebRef.current&&!goalCelebRef.current.fired){let _n163=0;const _rt163=()=>{if(_n163<3&&goalCelebRef.current&&!goalCelebRef.current.fired){_n163++;t2=setTimeout(_rt163,1900);}else _avanza461();};/* [7.461.0] anche la coda dell'attesa-esultanza passa dal cancello della scena */t2=setTimeout(_rt163,1900);return;}/* [7.163.0 super-test · replay live-validator seed 108] sui gol da insertion/cross il build-up R5 (~3.4s) satura la finestra result e l'arco partiva al taglio di fase → il rinvio one-shot diventa retry (max 3×1.9s): l'auto-advance aspetta la palla DENTRO la rete (onGoalInNet), lo skip manuale resta libero */
      /* [7.384.0 collaudo PO «le esultanze non funzionano»] L'AUTO-AVANZAMENTO ASPETTAVA CHE
         L'ESULTANZA PARTISSE, NON CHE FINISSE. Il rinvio del 6.76 (sopra) copre il caso «la palla e'
         ancora in volo»: appena il gol e' confermato, pero', si chiamava subito `handleContinue`, che
         azzera il piano (`setCelebPlan(null)`) e stacca la scena. Da li' in poi l'esultanza restava
         viva nel renderer ma SENZA piano: niente clip, niente corsa, solo un saltello muto — cioe'
         esattamente il difetto che il 7.371 doveva chiudere. Peggio: sul gol l'highlight riparte dal
         centrocampo, e l'eroe veniva richiamato in posizione MENTRE esultava (misurate fino a 27 unita'
         percorse durante `arms_up`, che ha corsa zero). I collaudi non lo vedevano perche' sotto
         `__CPM_FORCE_SIT` la modalita' forzata fa uscire `handleContinue` alla prima riga.
         Ora si aspetta la fine dichiarata dal piano, con un tetto perche' nulla resti appeso. */
      try{const _rem84=(_celEndRef.current||0)-performance.now();
        if(_gk76&&_rem84>80){t2=setTimeout(()=>{try{_avanza461();}catch(_e){}},Math.min(_rem84,4600));return;}}catch(_e84){}
      _avanza461();
    },dur);
    return()=>{clearTimeout(t);if(t2)clearTimeout(t2);};
  },[phase,hlIdx,paused]);// eslint-disable-line

  // Auto-tackle: if player takes too long in hl_choose, defender steals
  useEffect(()=>{
    if(phase!=="hl_choose"||paused)return;
    const sit=situations[hlIdx];
    if(!sit)return;
    if(sit.lockMovement)return; // no auto-tackle for set pieces (penalty/free kick)
    // Delay scales with defDist: far defender = more time (6-10s), close = less (3-5s)
    const baseDelay=defDistRef.current>60?9000:defDistRef.current>35?6000:4000;
    const t=setTimeout(()=>{
      // Find worst action (lowest success) and fail it — defender tackles
      const actions=sit.actions||[];
      if(!actions.length)return;
      const _arcId107=player.archetype?.id||player.archetype;const worst=actions.reduce((a,b)=>succRate(a,player.stats,pPos.x,oppPrestige,_arcId107)<=succRate(b,player.stats,pPos.x,oppPrestige,_arcId107)?a:b);
      if(_hlActionFiredRef.current)return;_hlActionFiredRef.current=true;/* [7.163.0 super-test LIVE-F2] stessa guardia di handleAction: niente doppia risoluzione tap⇄timeout */
      const tackleTexts=["Il difensore anticipa e recupera palla.","Intervento difensivo! Palla persa.","Il pressing paga: il difensore chiude l'azione.","Troppo lento — il marcatore intercetta."];
      const txt=pick(tackleTexts);
      addCom(txt,"#f87171",clock);
      flashScreen({col:"rgba(239,68,68,0.3)",dur:400});
      setOutcome({text:txt,ok:false,actionLabel:worst.label,outKey:"intercept",outKind:"intercepted"});/* [7.163.0 LIVE-F2] l'auto-tackle entra nel Unified Outcome Model: outKind onesto → il 3D mostra l'INTERCETTO (prima ricalcolava un esito di famiglia tiro: cronaca «recupera palla» col portiere che parava = divergenza M1) */
      try{setMomentum(m=>clamp(m-8,0,100));}catch(_e){}/* esitare non è più gratis: stesso costo-momentum di un'azione fallita */
      try{const _mm=matchMemRef.current;if(_mm)_mm.misses=(_mm.misses||0)+1;}catch(_e){}
      setChosenAct(worst);
      setPhase("hl_result");
    },baseDelay);
    return()=>clearTimeout(t);
  },[phase,hlIdx,situations,clock,paused]);// eslint-disable-line

  const curSit=situations[hlIdx];
  const winning=score.home>score.away,losing=score.home<score.away;
  // [6.48.0 RC] COLLAUDO PO «finale pareggiata 0-0 ma non si sa se ho vinto o perso!»: sui turni a ELIMINAZIONE
  //   un pareggio si decide ai RIGORI (koShootoutWin, seedato in CareerApp). La schermata FISCHIO FINALE mostrava
  //   solo il pari neutro. Ora ricalcola lo STESSO esito (stesso seed) e lo mostra chiaro (VITTORIA/SCONFITTA ai rigori).
  const _koSeed=context==="euroMondiale_ko"?("natko|"+(player.season||1)+"|"+(player.euroMondiale?.koPhase||"r16"))
    :context==="euro_ko"?("euroko|"+(player.season||1)+"|"+(mdEuroPhase||player.euro?.phase||"r16"))/* [6.74.0 QA-28] preferisci la fase della voce calendario (stessa priorità della risoluzione in onMatchEnd) */
    :context==="cup"?("cupko|"+(player.season||1)+"|"+(player.cup?.round||1))
    :(context==="nationsCup"&&_isNeutralFinal)?("natcup|"+(player.season||1)+"|final"):null;/* [7.72.2 collaudo PO «i rigori nella finale non ci sono stati»] la FINALE della Coppa delle Nazioni pareggiata va ai rigori come le altre finali KO */
  /* [7.293.0 #120 collaudo PO «l'articolo non deve essere pareggio combattuto ma ELIMINAZIONE dalla coppa!»]
     Il flag di DISPLAY chiedeva `clock>=90`, ma dal 7.38.0 il fischio finale arriva all'ULTIMO HIGHLIGHT e non
     al 90' — e `_goEndOrCeremony` i rigori li fa partire SENZA condizione sul cronometro. Le due condizioni
     divergevano: la serie si giocava davvero (il PO ha pure sbagliato il suo rigore) e poi il tabellone e il
     giornale la NEGAVANO, titolando «pareggio combattuto» su un quarto di finale che era un'eliminazione.
     Ora il flag segue il FATTO: la serie e' stata giocata (`soDoneRef`) oppure il pari e' arrivato al 90'. */
  const _drawShootout=!!_koSeed&&score.home===score.away&&(clock>=90||(soDoneRef.current===true));
  const _shootoutWon=_drawShootout&&typeof koShootoutWin==="function"&&koShootoutWin(player,_koSeed);
  /* [7.689.0 direttiva PO: «le azioni salienti extra eroe devono essere visualizzate in 3D non solo in
     telecronaca — azioni da gol pericolose, espulsioni, rigori — logica stile The Manager 1991»]
     LA FINESTRA DELLA SCENA SALIENTE. Non si inventa niente: quando il microsim decide un gol, il gioco
     lo sa IN ANTICIPO e arma un piano (`pendingGoalRef`) che porta il pallone verso la porta raccontando
     l'avvicinamento. Quella finestra — dal «gol in costruzione» alla rete — e' l'azione saliente, ed e'
     gia' li': mancava soltanto di FARLA VEDERE, perche' in telecronaca i corpi sono spenti (7.660, che
     il PO aveva chiesto per vedere solo il pallone) e la camera guarda dall'alto.
     Durante la finestra il renderer riaccende i ventidue e scende in tribuna est, orizzontale. La regola
     che tiene tutto onesto: la scena ILLUSTRA un evento gia' deciso dal microsim, non ne crea uno — se
     si vede un gol, quel gol e' gia' nel tabellone. `__CPM_NO689` la spegne per la prova del rosso. */
  /* [7.691.0 — RIGORI ED ESPULSIONI: gli eventi ISTANTANEI vogliono una finestra loro. Nel 7.690 la
     scena saliente si apriva su gol in costruzione e contropiedi, cioe' su stati che DURANO; un rigore
     fischiato e un rosso estratto invece succedono e sono gia' finiti, e senza una finestra propria non
     si vedrebbero mai — che e' proprio la meta' della richiesta del PO («azioni da gol pericolose,
     espulsioni, rigori»). Qui l'evento arma una finestra a tempo: sei secondi per guardare il dischetto
     o il cartellino, e poi si torna alla telecronaca. */
  const salIstRef691=useRef(0),salPgRef692=useRef(false),salT692=useRef(0);
  /* [7.691.0 SOLO COLLAUDO] la finestra istantanea si arma anche da fuori. Su quattro partite seedate
     non e' capitato NE' un rigore NE' un rosso — sono eventi rari — e senza questo il ramo nuovo
     resterebbe non provato: spedirlo perche' «il codice sembra giusto» e' esattamente il modo in cui
     due regole contraddittorie hanno convissuto per release nella Coppa delle Nazioni. */
  useEffect(()=>{try{if(typeof window==='undefined')return;
    window.__CPM_FORCE_SAL691=(ms)=>{try{salIstRef691.current=Date.now()+(+ms||6000);return true;}catch(_e){return false;}};
  }catch(_e){}},[]);
  const _sal689=(()=>{try{
    if(typeof window!=='undefined'&&window.__CPM_NO689)return false;
    if(phase!=="playing"||paused)return false;
    /* [7.689.0] QUALI MOMENTI MERITANO LA SCENA. Il gol in costruzione e' il primo, ed e' raro per
       costruzione (uno o due a partita): da solo darebbe una scena sola e il PO ne vedrebbe quanto
       niente. Si aggiunge il RIBALTAMENTO — il contropiede che il gioco gia' riconosce e racconta
       («palla persa alta, riparte in campo aperto»): e' l'azione pericolosa per definizione, e vale
       tanto quando la subiamo quanto quando la facciamo noi. Restano fuori i momenti morti: qui si
       apre solo su cio' che il motore ha gia' dichiarato pericoloso, mai su un minuto qualunque. */
    /* ⚠️ [7.692.0 collaudo PO: «sono comparse azioni 3D extra eroe ma non erano assolutamente salienti,
       non ha portato a nulla... tiro pericoloso, gol, parata del portiere, punizione ecc»]
       MOSTRAVO L'ATTESA E NASCONDEVO LA CONCLUSIONE. Misurato su tre partite, otto finestre: solo due
       portavano a qualcosa, e sulle scene di GOL erano ZERO SU TRE — col pallone che dentro la finestra
       non superava mai gx 58, cioe' non entrava mai in area. La causa e' che la finestra era governata
       dallo STESSO stato che segna la fine: `pendingGoalRef` si azzera QUANDO la rete arriva, quindi la
       scena si chiudeva un istante PRIMA del gol. Sette secondi di uomini che girano a centrocampo, poi
       il campo si svuota: «non ha portato a nulla» era la descrizione esatta.
       Ora la conclusione sta DENTRO: quando il gol pendente si chiude, la finestra resta aperta altri
       cinque secondi — il tempo della rete, della parata, dell'esultanza. */
    const _ist691=(salIstRef691.current||0)>Date.now();
    const _rig691=!!(outRef.current&&outRef.current.pen629);
    const _pg692=!!pendingGoalRef.current;
    if(_pg692)salPgRef692.current=true;
    else if(salPgRef692.current){salPgRef692.current=false;try{salIstRef691.current=Math.max(salIstRef691.current||0,Date.now()+5000);}catch(_e){}}
    /* ⚠️ [7.692.0 — RESTRIZIONE REVOCATA CON LA MISURA CONTRARIA. Avevo stretto il contropiede «solo
       oltre la trequarti», ragionando che un ribaltamento spento a meta' campo non e' un'azione. La
       misura ha detto il contrario: le due sole finestre che portavano a qualcosa erano proprio
       ribaltamenti, e ci arrivavano perche' la scena si apriva PRESTO e restava aperta fino all'area.
       Stringendo, le ho tagliate: da 2 su 8 a ZERO su 6. Il contropiede torna com'era, e a decidere se
       la scena vale non e' il momento in cui si apre ma se il pallone ARRIVA da qualche parte —
       per questo la finestra ora resta aperta finche' la palla e' in un terzo estremo. */
    /* ⚠️ [7.697.0 — «FAI VEDERE SOLO LE AZIONI PERICOLOSE!». Direttiva PO, e la misura le da' ragione.]
       Il ribaltamento apriva la scena per il fatto di ESSERE un ribaltamento, ovunque fosse il pallone:
       misurato, e' la causa piu' frequente di tutte — 184-215 campioni a partita contro gli 80-99 del gol
       e dell'occasione — ed e' esattamente la finestra che mostra gioco a meta' campo. Ora un ribaltamento
       apre la scena solo quando ARRIVA: pallone oltre il 70 nel verso di chi riparte, cioe' dentro
       l'ultimo quarto. Sotto quella soglia il contropiede resta in telecronaca e basta.
       ⚠️ NON E' LA RESTRIZIONE REVOCATA NEL 7.692, e la differenza va detta o fra un mese la rifaccio
       uguale. Quella tagliava sulla soglia della TREQUARTI (45) e all'epoca era l'unica causa che
       portasse a qualcosa, perche' ne' i gol ne' le occasioni avevano una conclusione: toglierla ha
       portato le finestre utili da 2/8 a ZERO su 6. Oggi il gol arriva in area (7.694) e l'occasione
       finisce in parata (7.695): le cause che concludono ci sono, e il ribaltamento spento a meta' campo
       non e' piu' l'unica cosa da guardare, e' rumore in mezzo alle altre. */
    const _cnt692=(()=>{try{const _ct=counterRef.current;if(!_ct)return false;
      if(typeof window!=='undefined'&&window.__CPM_NO697)return true;
      const _bx=(ballPosRef.current&&ballPosRef.current.x);if(_bx==null)return false;
      return ((_ct.dir>0)?_bx:100-_bx)>=70;}catch(_e){return false;}})();
    const _terzo692=(()=>{try{const bx=(ballPosRef.current&&ballPosRef.current.x);
      return bx!=null&&(bx>=70||bx<=30);}catch(_e){return false;}})();
    /* [7.692.0] la scena non si chiude mentre il pallone e' ancora in una zona dove puo' succedere
       qualcosa: se sta in un terzo estremo, si resta a guardare. */
    const _era692=!!(window&&window.__CPM_SAL689_ON);
    /* ⚠️ [7.692.0] IL TETTO DI DURATA. Tenere la scena aperta finche' il pallone sta in un terzo estremo
       ha portato le finestre che concludono da 0 a 3 su 6 — ma le ha fatte durare QUARANTA-CINQUANTA
       SECONDI, e per chi ha chiesto «in telecronaca si deve vedere solo il pallone» quaranta secondi di
       ventidue uomini in campo non sono una scena, sono un altro film. Diciotto secondi: il tempo di
       un'azione vera, e poi si torna alla cronaca anche se la palla e' ancora la'. */
    if(!_era692)salT692.current=Date.now();
    const _troppo692=(Date.now()-(salT692.current||0))>18000;
    const _on=(_pg692||_cnt692||_rig691||_ist691||(_era692&&_terzo692))&&!_troppo692;
    if(typeof window!=='undefined'){window.__CPM_SAL689_ON=_on;
      /* [7.691.0] la CAUSA della finestra, non solo il fatto che sia aperta: senza, il ramo nuovo
         (rigori ed espulsioni) resta invisibile alla misura e potrei spedirlo senza saperlo. */
      window.__CPM_SAL689_WHY=_on?(_rig691?"rigore":(_ist691?"cartellino":(pendingGoalRef.current?(pendingGoalRef.current.occ?"occasione":"gol"):"contropiede"))):null;}
    return _on;
  }catch(_e){return false;}})();
  const _sot695=_sal689&&!(typeof window!=='undefined'&&window.__CPM_NO695);/* [7.695.0] la cronaca in sottopancia: acceso solo dentro la scena saliente */
  const _isFinalKO=(context==="euroMondiale_ko"&&player.euroMondiale?.koPhase==="final")||(context==="euro_ko"&&player.euro?.phase==="final")||(context==="cup"&&(player.cup?.round||0)>=4)||(context==="nationsCup"&&_isNeutralFinal);/* [7.72.2] finale Coppa delle Nazioni → festa big-win */
  const pct=Math.round((clock/90)*100);
  const show3D=["playing","hl_move","hl_choose","hl_result","hl_intro","ceremony","shootout"].includes(phase);/* [7.2.0] ceremony: il 3D resta montato per la premiazione · [7.31.0] shootout: rigori 3D dal dischetto */
  const matchPhase3D=["walkout","hl_move","hl_choose","hl_result","hl_intro","playing"].includes(phase)?phase:"match";
  const hlZone=situations[hlIdx]?.zones?.[0]||null; // ATE-4: zona corrente per zone ring
  // National context — derive home team from player's national team data
  const isNatCtx=context==="national"||context==="nationsCup"||context==="euroMondiale_group"||context==="euroMondiale_ko"||context==="euroMondiale"||context==="euroMondiale_qualif";
  const _myNatData=isNatCtx?(NAT_CLUB_DATA[player.nation||"Italia"]||{id:"it-nt",a:"ITA",p:82,c:"#003399",c2:"#ffffff",nat:"🇮🇹"}):null;
  // [6.2.0 KIT-1] Guardaroba per club + selezione automatica pre-partita: la VERA squadra di casa veste
  // la Home; l ospite la prima divisa del suo guardaroba che garantisce contrasto (Home poi Away poi Third).
  const _kitTrueHome=isNatCtx?{id:_myNatData?.id||"nt",n:player.nation||"Italia",c:_myNatData?.c||"#003399",c2:_myNatData?.c2||"#ffffff"}:isMatchHome?(player.club||opponent||{}):(opponent||{});
  const _kitTrueAway=isNatCtx?(opponent||{}):isMatchHome?(opponent||{}):(player.club||opponent||{});
  const _mkits=selectMatchKits(_kitTrueHome,_kitTrueAway);
  const _plIsKitHome=isNatCtx||isMatchHome;
  // [7.8.3 collaudo PO «le strisce non ci sono nel 3D»] club dell'EROE e dell'AVVERSARIO per il PATTERN in campo:
  //   il 3D rendeva il pattern solo alla squadra «home», quindi l'avversario a strisce (es. Inter in trasferta)
  //   restava tinta unita. Passiamo entrambi i club → entrambe le maglie 3D ricevono il loro kit reale.
  const _heroClubObj=_plIsKitHome?_kitTrueHome:_kitTrueAway;
  const _oppClubObj=_plIsKitHome?_kitTrueAway:_kitTrueHome;
  // heroKitCol: la divisa INDOSSATA dalla squadra dell eroe in QUESTA partita (in trasferta puo essere Away/Third)
  const heroKitCol=(_CPM_TEST&&typeof window!=='undefined'&&window.__CPM_FORCE_HEROKIT)||(_plIsKitHome?_mkits.homeShirt:_mkits.awayShirt);/* [7.8.2] hook test per misurare un colore kit sotto le luci reali (spento in store build) */
  const heroKitCol2=_plIsKitHome?_mkits.homeAccent:_mkits.awayAccent;
  // Pitch kit colors: homeCol=squadra dell eroe (attacca sempre dal lato "home"), oppCol=avversario
  const homeKitCol=heroKitCol;
  const awayKitCol=_plIsKitHome?_mkits.awayShirt:_mkits.homeShirt;
  // Scoreboard display colors: left=TRUE home team, right=TRUE away team → SEMPRE le maglie indossate in campo
  const scoreHomeCol=_mkits.homeShirt;
  const scoreAwayCol=_mkits.awayShirt;
  // homeTeamObj/awayTeamObj: teams displayed in MatchdayCard/FormationView
  // isMatchHome=true  → home=playerClub, away=opponent
  // isMatchHome=false → home=opponent,    away=playerClub
  /* [7.207.0 collaudo PO «perché la Salernitana vale solo 2 pallini? ora ha un prestigio più alto»] i pallini
     del pre-partita leggevano `team.p`, cioè il prestigio BASE del database — congelato per sempre. Ma il
     prestigio del club EVOLVE (`clubPrestigeShifts`, fino a +50 con l'albo d'oro dal 7.199.0) ed è il valore
     effettivo che governa la classifica (`updateStandings`), la simulazione delle partite (7.200.0) e la
     scheda Club (7.5.4): il pre-partita era l'ultima schermata rimasta indietro, e diceva all'utente che il
     suo club bicampione d'Europa vale ancora quanto la matricola che era. Stesso clamp 1-99 degli altri siti. */
  const _effP207=(t)=>{try{if(!t)return t;const _sh=(player.clubPrestigeShifts||{})[t.id||t.n]||0;return _sh?{...t,p:clamp((t.p||60)+_sh,1,99)}:t;}catch(_e){return t;}};
  const homeTeamObj=_effP207(isNatCtx?{id:_myNatData.id,n:player.nation||"Italia",a:_myNatData.a,p:_myNatData.p,c:_myNatData.c,c2:_myNatData.c2,nat:_myNatData.nat,lg:"Nazionale"}:isMatchHome?(player.club||opponent):opponent);
  const awayTeamObj=_effP207(isNatCtx?opponent:isMatchHome?opponent:(player.club||opponent));
  // walkout canvas colors: actual home team color for the tunnel walk (not from player's perspective)
  const walkoutHomeCol=_mkits.homeShirt; /* [6.2.0 KIT-1] tunnel con le maglie realmente indossate */
  const walkoutAwayCol=_mkits.awayShirt;
  // Derby + big-game detection (used by WalkoutOverlay and MatchdayCard)
  const drby=isDerby(player.club?.id,opponent?.id);
  const mw=context==="trial"?1:calcMatchWeight(player,opponent?.id||opponent?.n,player.standings||[],player.week||1);
  // item 4 (5.49.2): grafica TV pre-partita — statistiche di classifica delle due squadre (posizione/punti/V-N-P/GF-GS + forma ultime 5).
  //   Forma deterministica dal record (seed club+stagione) → coerente per tutta la partita. Dashes se la squadra non è in classifica (provino/coppa/nazionale).
  const _tvTeamStat=(team)=>{
    const _st=(player.standings||[]);const _sorted=[..._st].sort((a,b)=>(b.pts-a.pts)||(b.gd-a.gd)||(b.gf-a.gf));
    const _idx=team?_sorted.findIndex(s=>s.id===team.id):-1;const e=_idx>=0?_sorted[_idx]:null;
    const _seed=hashStr((team?.id||team?.n||"x")+"_"+(player.season||1));const w=e?e.wins:0,d=e?e.draws:0,l=e?e.losses:0,tot=w+d+l;
    // [6.79.0 collaudo PO «all'esordio il cammino delle due squadre è completamente falso»] con 0 partite
    //   giocate NIENTE forma sintetica (usciva L·L·L·L·L) e NIENTE posizione (la classifica a zero è ordine
    //   arbitrario → «3ª/1ª in classifica» alla 1ª giornata). Forma solo sulle gare realmente giocate (max 5).
    // [7.8.1 collaudo PO «il cammino pre partita è quasi sempre sballato»] il vecchio campionamento INDIPENDENTE
    //   (Bernoulli su w/tot,d/tot) produceva forme INCOERENTI col record (una squadra con 3V-2N-5S usciva LLLLL).
    //   Ora: (a) il PROPRIO club usa la forma REALE dalle ultime gare di LEGA (l'utente le conosce → deve
    //   combaciare); (b) gli altri usano il MULTISET ESATTO (w×W,d×D,l×L) mescolato deterministicamente → le 5
    //   mostrate sono SEMPRE un sottoinsieme reale del record (mai più sconfitte di quante ne ha).
    let form=[];
    if(tot>0){
      if(team&&player.club&&team.id===player.club.id){
        form=(player.matchHistory||[]).filter(m=>m&&!m.cup&&!m.euro&&!m.national&&!m.friendly).slice(-5).map(m=>m.won?"W":m.drew?"D":"L");
      }
      if(!form.length){
        const bag=[];for(let i=0;i<w;i++)bag.push("W");for(let i=0;i<d;i++)bag.push("D");for(let i=0;i<l;i++)bag.push("L");
        let s=(_seed>>>0)||1;const rnd=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};
        for(let i=bag.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const t=bag[i];bag[i]=bag[j];bag[j]=t;}
        form=bag.slice(-5);
      }
    }
    return{name:team?.n||team?.name||"–",pos:(tot>0&&_idx>=0)?_idx+1:null,pts:e?e.pts:null,w,d,l,gf:e?e.gf:null,ga:e?e.ga:null,form};
  };
  const _tvHome=_tvTeamStat(homeTeamObj),_tvAway=_tvTeamStat(awayTeamObj);
  // [6.81.0 collaudo PO] alla PRIMA giornata (nessuna delle due ha ancora giocato) la tabella 0-0-0-0-0-0
  //   è inutile e sembra rotta → una riga di esordio al posto delle sei righe di zeri.
  const _tvOpener81=(_tvHome.w+_tvHome.d+_tvHome.l+_tvAway.w+_tvAway.d+_tvAway.l)===0;
  const _formCol=r=>r==="W"?"#22c55e":r==="D"?"#f59e0b":"#ef4444";
  // [6.88.0 collaudo PO «per ogni competizione, colore diverso anziché tutto verde»] identità COLORE per
  //   competizione — consumata da tappeto 3D a centrocampo (anello+tagline), pannello walkout e post-partita.
  const _compCol=context==="cup"?"#f59e0b"
    :(context==="euro_group"||context==="euro_ko")?(({UCL:"#60a5fa",UEL:"#fb923c",UECL:"#a78bfa"})[player.euro?.competition]||"#60a5fa")
    :((context||"").indexOf("euroMondiale")>=0)?((player.euroMondiale?.type==="Mondiale")?"#fbbf24":"#818cf8")
    :context==="nationsCup"?"#2dd4bf"
    :context==="national"?"#38bdf8"
    :context==="trial"?"#94a3b8"
    /* [7.281.0 collaudo PO «il cerchio di centrocampo e la relativa bandiera, linea e scritta verde, deve essere
       ricolorata in base al campionato»] il ramo campionato era UN solo verde per tutte e quattordici le leghe:
       il tappeto a centrocampo, l'anello e il wordmark uscivano identici in Italia, in Inghilterra e in Spagna.
       Ora ogni lega ha la sua tinta (la seconda divisione è la variante chiara della prima); il verde resta il
       ripiego per una lega non mappata. */
    :(LEAGUE_COMP_COL[(player.club&&player.club.lg)||""]||"#22c55e");
  // item 8: nome ufficiale della competizione (per il cartellone 3D sulla tribuna Est) — dipende dal contesto.
  /* [7.129.0 collaudo PO «coppa nazionale specifica della serie B, distinguerle»] nome DISPLAY della Coppa Nazionale
     tier-aware: seconda divisione (lato basso di LEAGUE_PAIRS) → «Coppa Nazionale <Lega>» (il campo DATI competition
     resta "Coppa Nazionale" per il matching — qui cambia solo l'etichetta mostrata) */
  const _cupDisp=(typeof LEAGUE_PAIRS!=="undefined"&&LEAGUE_PAIRS.some(pr=>pr[1]===(player.club?.lg)))?`Coppa Nazionale ${player.club.lg}`:"Coppa Nazionale";
  const _compLabel=isNatCtx?((context||"").indexOf("euroMondiale")>=0?((context==="euroMondiale_qualif"?"Qualif. ":"")+((player.euroMondiale?.type==="Mondiale")?"Mondiale":"Europeo")):context==="nationsCup"?"Coppa delle Nazioni":"Nazionale")/* [6.47.0] nationsCup → etichetta specifica */
    :context==="cup"?_cupDisp
    :(context==="euro_group"||context==="euro_ko")?({UCL:"Korward Champions Cup",UEL:"Korward Europa Cup",UECL:"Korward Conference Cup"}[player.euro?.competition]||"Coppa Continentale")
    :(player.club?.lg||(player.club?.isU18||context==="trial"?"Primavera":"Campionato"));
  // item 4 (5.49.9): le statistiche pre-partita devono riguardare la COMPETIZIONE in corso, non il campionato.
  //   League/provino → tabella di campionato (le due squadre). Altre competizioni → contesto della competizione (fase/turno + andamento dell'eroe IN quella competizione).
  const _leagueCtx=(context==="career"||context==="trial");
  let _tvComp=null;
  if(!_leagueCtx){
    if((context==="euro_group"||context==="euro_ko")&&player.euro){
      const e=player.euro,gr=e.groupResults||[],kr=e.koResults||[];
      const form=[...gr,...kr].map(r=>r.won?"W":r.drew?"D":"L").slice(-5);
      /* [7.108.0 collaudo PO «è la semifinale, non la finale»] la fase KO deriva dalla VOCE DI CALENDARIO della gara
         in corso (euroPhase, campo affidabile e coerente col CTA/matchday) e non da player.euro.phase (puntatore mutabile
         che poteva restare avanti di un turno → semifinale mostrata come «Finale»). */
      const _euMd=context==="euro_ko"?((player.calendar||[]).find(m=>m&&m.type==="euro"&&!m.played&&m.week===(player.week||1))||(player.calendar||[]).find(m=>m&&m.type==="euro"&&!m.played)):null;
      const _koPh=(_euMd&&_euMd.euroPhase)||e.phase;
      _tvComp={phase:(context==="euro_group")?`Fase a gironi · Giornata ${gr.length+1}/6`:({r16:"Ottavi di Finale",quarti:"Quarti di Finale",sf:"Semifinale",final:"Finale"}[_koPh]||"Fase a eliminazione"),pts:(context==="euro_group")?(e.pts||0):null,played:gr.length+kr.length,form};
    } else if(context==="cup"&&player.cup){
      /* [7.108.0] il turno di Coppa deriva dal cupRound della VOCE DI CALENDARIO della gara in corso (fonte unica col
         CTA/matchday), non da player.cup.round → mai più semifinale (round 3) mostrata come «Finale». */
      const _cupMd=(player.calendar||[]).find(m=>m&&m.type==="cup"&&!m.played&&m.week===(player.week||1))||(player.calendar||[]).find(m=>m&&m.type==="cup"&&!m.played);
      const cr=(_cupMd&&_cupMd.cupRound)||player.cup.round||1,_names={1:"Ottavi di Finale",2:"Quarti di Finale",3:"Semifinale",4:"Finale"};/* [6.45.0 RC] la Coppa ha 4 turni canonici (_CRN R16/Quarti/Semi/FINALE) */
      const cres=player.cup.results||[];const form=cres.map(r=>r.won?"W":r.drew?"D":"L").slice(-5);
      _tvComp={phase:_names[cr]||`Turno ${cr}`,pts:null,played:cres.length,form};
    } else if(isNatCtx&&player.euroMondiale){
      // [6.56.0 collaudo PO «le statistiche pre partita non sono veritiere»] il cammino contava SOLO le gare del
      //   girone → in FINALE mostrava «3 gare · WWW» ignorando i turni KO (ottavi/quarti/semifinale) già vinti.
      //   Ora somma girone + KO (le qualificazioni non hanno record per-gara → non conteggiabili).
      const em=player.euroMondiale,gr=em.groupResults||em.groupMatches||[],kr=em.koResults||[];
      const _allNat=[...gr,...kr];const form=_allNat.map(r=>r.won?"W":r.drew?"D":"L").slice(-5);
      _tvComp={phase:em.phase==="qualificazioni"?`Qualificazioni · Gara ${(em.qualMatchIdx||0)+1}`:em.phase==="group"?`Fase a gironi · Giornata ${(em.groupMatchIdx||0)+1}/${(em.groupOpponents||[]).length||3}`:(EM_KO_LABEL[em.koPhase]||"Fase a eliminazione"),pts:em.phase==="group"?(em.groupPts||0):null,played:_allNat.length,form};
    } else if(context==="nationsCup"&&player.nationsCupQueue){
      // [7.72.2 collaudo PO «nel cammino diceva sempre esordio, e non specificava la FINALE»] la Coppa delle Nazioni
      //   cadeva nel fallback (played:0 → «Esordio» sempre; phase=nome competizione → «... · ...» duplicato). Ora ramo
      //   dedicato: gare disputate REALI + forma + fase «Fase a gironi · Giornata N/3» oppure «Finale».
      const q=player.nationsCupQueue,ms=q.matches||[];
      const form=ms.map(r=>r.won?"W":r.drew?"D":"L").slice(-5);
      const _isFin=!!q.isFinal&&(q.matchIdx||0)>=((q.opponents||[]).length-1);/* stessa condizione di _isNeutralFinal */
      const _gN=q.isFinal?(q.opponents||[]).length-1:(q.opponents||[]).length;
      _tvComp={phase:_isFin?"Finale":`Fase a gironi · Giornata ${Math.min((q.matchIdx||0)+1,_gN)}/${_gN}`,pts:_isFin?null:(q.pts||0),played:ms.length,form};
    } else {_tvComp={phase:_compLabel,pts:null,played:0,form:[]};}
  }
  /* [7.32.7 collaudo PO «specifica la giornata/turno campionato/coppa in TUTTE le schermate pre-partita»]
     etichetta UNICA del turno: campionato = «Giornata N di M» dal calendario REALE; coppe/europee/nazionali
     = la stessa fase già calcolata per il pannello walkout (_tvComp.phase — una sola fonte). */
  const _roundLabel=(()=>{try{
    if(context==="career"){const lg=(player.calendar||[]).filter(m=>m&&(!m.type||m.type==="league"));
      /* [7.566.0 collaudo PO «partita gia' giocata! di nuovo!» — 9a ricorrenza, su «Giornata 34 di 34»]
         (1) L'ETICHETTA NOMINA LA GARA CHE SI STA GIOCANDO, non la prima che capita. Fin qui derivava la
         giornata da sola — «la prima voce di lega non giocata di questa settimana» — senza guardare CHI si
         ha di fronte: se il calendario porta una voce stantia (il difetto che tutte le reti A→H combattono),
         l'etichetta poteva dire un numero di giornata DIVERSO da quello della gara servita. Un'etichetta che
         sbaglia numero e' essa stessa una segnalazione di «gia' giocata». Ora la voce si cerca prima per
         AVVERSARIO, che qui e' noto: cosi' il numero e' quello della partita che si sta per giocare. */
      const _oid=(opponent&&(opponent.id||opponent.n))||null,_onm=(opponent&&opponent.n)||null;
      const _wk=(player.week||1);
      const cur=lg.find(m=>!m.played&&m.week===_wk&&((_oid&&(m.opponentId===_oid))||(_onm&&m.opponentName===_onm)))
        ||lg.find(m=>!m.played&&((_oid&&(m.opponentId===_oid))||(_onm&&m.opponentName===_onm)))
        ||lg.find(m=>m.week===_wk&&!m.played)||lg.find(m=>!m.played);
      if(!cur)return null;
      /* (2) LA SPIA CHE MI SERVE, e che finora non avevo. La classe «partita gia' giocata» ha nove
         ricorrenze e otto reti (A→H), e ogni rete si appoggia a un REGISTRO: la voce gemella marcata, lo
         storico, il numero di giornata, il registro persistente, la classifica. Se il commit del risultato
         non atterra, NESSUN registro sa che la gara e' stata giocata e nessuna rete puo' accorgersene —
         e da un telefono io non ho modo di sapere quale dei due casi sia. L'invariante sano e' semplice:
         la giornata N si gioca con N-1 gare gia' in classifica. Quando non torna, l'etichetta lo dice in
         chiaro — cosi' il prossimo collaudo porta il NUMERO invece dell'impressione, e si sapra' subito se
         a mancare e' il commit (classifica indietro) o la rete (classifica avanti). Se torna, non appare
         nulla. */
      let _sp="";
      try{const _st=player.standings||[];const _cid=player.club&&(player.club.id||player.club.n);
        const _me=_st.find(r=>r&&(r.id===_cid||r.clubId===_cid||r.n===(player.club&&player.club.n)));
        if(_me&&cur.matchday!=null){const _pl=_me.played||0;if(_pl!==cur.matchday-1)_sp=` ⚠︎ ${_pl}g`;}
        else if(!_me&&_st.length>=2)_sp=" ⚠︎ ?g";/* la mia riga in classifica non si trova: e' proprio la cecita' che spegne le reti (E) e (H) */
      }catch(_e){}
      return `Giornata ${cur.matchday} di ${lg.length}${_sp}`;}
    if(context==="trial")return null;
    if(context==="national")return"Amichevole internazionale";/* [7.72.2] nationsCup: cade su _tvComp.phase (13798) → «Fase a gironi · Giornata N/3» o «Finale» (prima leggeva player.nationsCup inesistente → sempre «Giornata 1 di 3») */
    return(_tvComp&&_tvComp.phase&&_tvComp.phase!==_compLabel)?_tvComp.phase:null;
  }catch(_e){return null;}})();

  return(
    <div style={{width:"100%",maxWidth:isNarrow?undefined:1100,marginLeft:"auto",marginRight:"auto",...((phase==="ended")?{flex:1,minHeight:0,display:"flex",flexDirection:"column"}:(isNarrow&&(show3D||phase==="walkout"))?{flex:1,minHeight:0,display:"flex",flexDirection:"column",background:"#050810"}:{})}}>
      {phase==="matchday"&&!showScout&&(()=>{
        const mw=context==="trial"?1:calcMatchWeight(player,opponent?.id||opponent?.n,player.standings||[],player.week||1);
        const drby=isDerby(player.club?.id,opponent?.id);
        const isExCl=(player.history||[]).some(h=>h.club===opponent?.n||h.clubId===opponent?.id)||(player.worldMemory||[]).some(m=>m.type==="ex_club"&&m.clubId===opponent?.id);
        const rivalMatch=player.rival&&(player.rival.club?.id===opponent?.id||player.rival.club?.n===opponent?.n);
        const mCtx=drby?`${drby.e} ${drby.name}`:isExCl?"🏠 Ritorno al passato — ex squadra":rivalMatch?`🆚 La squadra di ${player.rival?.name||"il tuo rivale"}`:(mw>=8)?"Partita decisiva per il titolo":(mw>=6)?"Scontro diretto in classifica":null;
        /* [7.313.0 collaudo PO «dovrebbe specificare per dare maggiore pathos che e' contro la ex squadra»]
           l'avversario e' un club della STORIA dell'eroe? Si riconosce per id (robusto ai rinomini) o per
           nome, escludendo il club attuale — la stessa sorgente `player.history` con cui l'arco narrativo
           «Il ritorno da ex» costruisce il capitolo nel diario, cosi' le due cose non possono divergere.
           La riga riassume il passato VERO: stagioni, presenze e gol con quella maglia. */
        const _ex313=(function(){try{
          const _me=player.club||{},_meId=_me.id,_meN=_me.name||_me.n;
          const _opp=((homeTeamObj&&(homeTeamObj.id===_meId||(homeTeamObj.name||homeTeamObj.n)===_meN))?awayTeamObj:homeTeamObj)||null;
          if(!_opp)return null;
          const _oid=_opp.id,_on=_opp.name||_opp.n;
          if((_oid&&_oid===_meId)||(_on&&_on===_meN))return null;/* non e' «ex» il club in cui giochi ora */
          const _rows=(player.history||[]).filter(h=>h&&((_oid&&h.clubId===_oid)||(_on&&h.club===_on)));
          if(!_rows.length)return null;
          const _st=_rows.length,_g=_rows.reduce((a,h)=>a+(h.goals||0),0),_mt=_rows.reduce((a,h)=>a+(h.matches||0),0);
          const _side=(homeTeamObj&&((_oid&&homeTeamObj.id===_oid)||(_on&&(homeTeamObj.name||homeTeamObj.n)===_on)))?"home":"away";
          const _pl=(n,a,b)=>n===1?a:b;
          const _line=`${_on} — ${_st} ${_pl(_st,"stagione","stagioni")}, ${_mt} ${_pl(_mt,"presenza","presenze")} e ${_g} ${_pl(_g,"gol","gol")} con quella maglia. Quella curva non ti ha dimenticato.`;
          return{name:_on,side:_side,line:_line};
        }catch(_e){return null;}})();
        return<MatchdayCard exClub={_ex313} homeTeam={homeTeamObj} awayTeam={awayTeamObj} stadium={stadium} attendance={attendance} league={isNatCtx?_compLabel:(context==="euro_group"||context==="euro_ko")?euroSig(player.euro?.competition||"UCL"):context==="cup"?_cupDisp:player.club?.lg||(player.club?.isU18||context==="trial"?(player.club?.lg||"Primavera"):null)}/* [6.47.0] la prepartita nazionale mostra la competizione SPECIFICA (Europeo/Mondiale/Coppa delle Nazioni) invece del generico «Nazionale» */ onContinue={handleGoToFormations} onSkip={()=>setPhase("playing")} scoutReport={scoutReport} scoutLoading={scoutLoading} onShowScout={()=>setShowScout(true)} matchWeight={mw} matchContext={mCtx} weatherObj={weather} kickoffHour={kickoffHour} onBack={context==="trial"?null:onQuit}/* [7.118.0 collaudo PO «manca pulsante torna alla dashboard!»] il ritorno alla dashboard c'è ora anche per nazionale/coppe/europee (prima solo career): onQuit è pura NAVIGAZIONE — la gara resta una voce di calendario PENDENTE (mai saltata: Avanza auto-simula le nazionali, 6.81.0), quindi non re-introduce lo skip del 6.80.0. Solo i provini restano senza uscita. */ onSimulate={(["national","nationsCup","euroMondiale_qualif","euroMondiale_group","euroMondiale_ko"].includes(context)&&onSimulateNat)?onSimulateNat:null} roundLabel={_roundLabel}/>;/* [6.80.0 collaudo PO «sono riuscito a saltare l'amichevole con la nazionale»] il ritorno alla dashboard esiste SOLO per il campionato: nazionale/coppe/europee non si abbandonano */
      })()}
      {phase==="matchday"&&showScout&&<ScoutReportScreen report={scoutReport} opponent={opponent?{...opponent,lg:(((player.leagueOverrides||{})[opponent.id])||opponent.lg)}:opponent}/* [7.170.0] lega avversaria override-aware (neopromosse/retrocesse) anche nell'analisi prematch */ loading={scoutLoading} onClose={()=>setShowScout(false)}/>}
      {phase==="formations"&&<FormationView homeTeam={homeTeamObj} awayTeam={awayTeamObj} player={player} homeRoster={homeRoster} awayRoster={awayRoster} onContinue={()=>setPhase("walkout")} onSkip={()=>setPhase("playing")} oppTactic={oppTactic} oppTacticLoading={oppTacticLoading} homeKitCol={scoreHomeCol} awayKitCol={scoreAwayCol} competition={(context==="euro_group"||context==="euro_ko")?(player.euro?.competition||null):null} euroRound={_roundLabel}/* [7.32.7] etichetta turno UNIFICATA (giornata campionato · turno coppa · fase euro/nazionale) — per euro produce le stesse stringhe di prima */ contextLabel={(!_leagueCtx&&context!=="euro_group"&&context!=="euro_ko")?_compLabel:null}/>}{/* [6.42.0] passa l'etichetta competizione per coppa/nazionale (euro ha già il suo path via competition) */}

      {(show3D||phase==="walkout")&&(
        <Card style={{padding:0,overflow:"hidden",display:"flex",flexDirection:"column",...isNarrow?{flex:1,minHeight:0}:{height:"calc(100vh - 80px)",minHeight:500}}} shadow>
          {/* ── Scoreboard Premium ── */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 12px",borderBottom:"1px solid rgba(255,255,255,0.08)",background:"linear-gradient(135deg,#060d1e 0%,#0f1e3a 100%)",flex:"0 0 auto"}}>
            {/* Home team */}
            <div style={{display:"flex",alignItems:"center",gap:7,minWidth:0,flex:1}}>
              <TeamBadge team={homeTeamObj} size={28}/>
              <div style={{minWidth:0}}>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.55)",fontWeight:700,letterSpacing:.8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:70}}>{homeTeamObj?.n||homeTeamObj?.name||"Squadra"}</div>
                <div style={{fontSize:32,fontWeight:900,color:(isMatchHome?winning:losing)?"#4ade80":(isMatchHome?losing:winning)?"#f87171":"#f1f5f9",lineHeight:1}}>{isMatchHome?score.home:score.away}</div>
              </div>
            </div>
            {/* Centre — clock, possession, context */}
            <div style={{textAlign:"center",flex:"0 0 auto",padding:"0 8px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,marginBottom:2}}>
                {phase==="playing"&&!paused&&<div style={{width:6,height:6,borderRadius:"50%",background:"#ef4444",boxShadow:"0 0 6px #ef4444",animation:"pulse 1s infinite",flexShrink:0}}/>}
                {paused&&["playing","hl_intro","hl_move","hl_choose","hl_result"].includes(phase)&&<div style={{width:6,height:6,borderRadius:"50%",background:"#f59e0b",flexShrink:0}}/>}
                <div style={{padding:"2px 10px",borderRadius:14,fontSize:12,fontWeight:900,background:winning?"rgba(34,197,94,0.18)":losing?"rgba(239,68,68,0.18)":"rgba(255,255,255,0.09)",color:winning?"#4ade80":losing?"#f87171":"#f1f5f9",letterSpacing:.5}}>
                  {phase==="walkout"?"🏃":phase==="ceremony"?"🏆":phase==="ended"?"FT":`${clock}'`}
                </div>
                <div style={{fontSize:11}} title={weatherNightDisp(weather,timeOfDay==="night")?.name}>{weatherNightDisp(weather,timeOfDay==="night")?.e||(timeOfDay==="day"?"☀️":"🌙")}</div>{/* [7.260.0] mai il sole su una notturna */}
                {["playing","hl_intro","hl_move","hl_choose","hl_result"].includes(phase)&&(
                  <button onClick={()=>setPaused(v=>!v)} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,padding:"14px 12px",margin:"-12px -8px",color:"rgba(255,255,255,0.6)",lineHeight:1}} title={paused?"Riprendi (P)":"Pausa (P)"}>
                    {paused?"▶":"⏸"}
                  </button>
                )}
                {/* [7.484.0] VELOCITA' DELLA PARTITA, scelta dal giocatore. Sta accanto alla pausa perche'
                    e' lo stesso gesto — «quanto in fretta scorre» — e perche' l'intestazione e' l'unica
                    zona sempre visibile in tutte le fasi. Bersagli da 30px d'altezza utile: si tocca col
                    pollice su un telefono, che e' dove si gioca. */}
                {["playing","hl_intro","hl_move","hl_choose","hl_result"].includes(phase)&&(
                  /* [7.494.0 collaudo PO «il pulsante della velocita' deve essere unico, non 3 che prendono
                      troppo spazio»] UN SOLO BERSAGLIO CHE RUOTA. I tre bottoni occupavano ~78px di una
                      barra che su telefono stretto ospita gia' cronometro, punteggio, pausa e taccuino: il
                      terzo finiva compresso. Ora e' UNO che mostra la velocita' ATTIVA e al tocco passa alla
                      successiva ciclando su MATCH_SPEEDS (1 → 1,5 → 2 → 1). L'area di tocco resta piena
                      (44px di larghezza, 30px utili in altezza) invece di essere divisa in tre bersagli
                      stretti, quindi il pollice ha piu' bersaglio di prima, non meno. La scrittura della
                      preferenza e' la STESSA riga di prima: nessun cambio al modello, solo al comando. */
                  <button
                    onClick={()=>{const _i=MATCH_SPEEDS.indexOf(matchSpeed);const _n=MATCH_SPEEDS[(_i<0?0:(_i+1)%MATCH_SPEEDS.length)];setMatchSpeed(_n);try{localStorage.setItem("cpm-match-speed",String(_n));}catch(_e){}}}
                    title={"Velocità della partita — tocca per passare a "+((()=>{const _i=MATCH_SPEEDS.indexOf(matchSpeed);const _n=MATCH_SPEEDS[(_i<0?0:(_i+1)%MATCH_SPEEDS.length)];return _n===1.5?"1,5×":_n+"×";})())}
                    aria-label={"Velocità della partita: "+(matchSpeed===1.5?"1,5×":matchSpeed+"×")+". Tocca per cambiare."}
                    style={{background:"rgba(255,255,255,0.16)",border:"none",borderRadius:8,cursor:"pointer",marginLeft:2,
                      fontSize:11,fontWeight:900,letterSpacing:.2,padding:"9px 8px",minWidth:44,lineHeight:1,fontFamily:"inherit",
                      color:"#f1f5f9",fontVariantNumeric:"tabular-nums"}}>
                    {matchSpeed===1.5?"1,5×":matchSpeed+"×"}
                  </button>
                )}
                {/* [7.352.0 collaudo PO «non riesco a prendere appunti sull'ultimo highlight perche' poi
                    termina la partita»] IL TACCUINO SOPRAVVIVE AL FISCHIO FINALE. Il tasto viveva solo nelle
                    fasi di gioco: sull'ULTIMA azione la partita passa a `ended` e il tasto spariva prima che
                    si potesse scrivere — cioe' proprio l'azione che si voleva segnalare andava sempre persa.
                    L'intestazione esiste anche a fine partita (mostra «FT») e il testimone regge: l'anello
                    vive nel ref del componente e la closure di __CPM_WATCH_SNAP continua a leggerlo. */}
                {devToolsOn()&&["playing","hl_intro","hl_move","hl_choose","hl_result","ended","ceremony"].includes(phase)&&(
                  <button onClick={()=>{setPaused(true);const _c=_pickDefaultScene();let _d="";try{_d=(typeof draftBugNote==="function")?draftBugNote((window.__CPM_WATCH_SNAP&&window.__CPM_WATCH_SNAP())||null,_c):"";}catch(_e){}setBugNote({ctx:_c,txt:_d,auto:!!_d});}} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,padding:"14px 10px",margin:"-12px -6px",color:"rgba(255,255,255,0.38)",lineHeight:1}} title="Segna un'azione sbagliata (mette in pausa)">⚠️</button>
                )}
              </div>
              <div style={{fontSize:7,color:"rgba(255,255,255,0.25)",letterSpacing:1,textTransform:"uppercase",marginBottom:3}}>
{(()=>{
                  if(phase==="walkout")return"Ingresso in campo";
                  if(phase==="ceremony")return"Premiazione";
                  if(phase==="ended")return"Fine partita";
                  const _lbl=isNatCtx?((context||"").indexOf("euroMondiale")>=0?("🌍 "+((player.euroMondiale?.type)||"Mondiale")):"🌍 Nazionale"):(context==="euro_group"||context==="euro_ko"||context==="euro")?{UCL:"⭐ "+EURO_SIGLA.UCL,UEL:"🌍 "+EURO_SIGLA.UEL,UECL:"🌍 "+EURO_SIGLA.UECL}[player.euro?.competition||"UCL"]||"🌍 Europa":context==="cup"?"🏆 Coppa":(((player.leagueOverrides||{})[player.club?.id])||player.club?.lg||homeTeamObj?.lg||"Campionato");/* [7.170.0 collaudo PO «era una partita di serie A, il Venezia è neopromossa»] in campionato l'etichetta è la lega DEL GIOCATORE (override-aware): prima era homeTeamObj.lg → in trasferta da una NEOPROMOSSA usciva la lega del DB (Lega B) perché la promozione vive solo in leagueOverrides */
                  return _lbl;
                })()}
              </div>
              <div style={{height:5,background:"rgba(255,255,255,0.08)",borderRadius:3,overflow:"hidden",display:"flex",width:80,margin:"0 auto"}}>
                <div style={{width:`${possession}%`,background:scoreHomeCol,transition:"width .8s",borderRadius:"3px 0 0 3px"}}/>
                <div style={{flex:1,background:scoreAwayCol,borderRadius:"0 3px 3px 0"}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:7,color:"rgba(255,255,255,0.28)",width:80,margin:"2px auto 0"}}>
                <span style={{fontWeight:700,color:"rgba(255,255,255,0.5)"}}>{possession}%</span><span>poss.</span><span style={{fontWeight:700,color:"rgba(255,255,255,0.5)"}}>{100-possession}%</span>
              </div>
              <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden",display:"flex",width:80,margin:"4px auto 0"}}>
                <div style={{width:`${momentum}%`,background:scoreHomeCol,transition:"width .7s ease",borderRadius:"3px 0 0 3px"}}/>
                <div style={{flex:1,background:scoreAwayCol,borderRadius:"0 3px 3px 0"}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:7,color:"rgba(255,255,255,0.22)",width:80,margin:"1px auto 0"}}>
                <span>⚡</span><span style={{letterSpacing:.5}}>momentum</span><span>⚡</span>
              </div>
            </div>
            {/* Away team */}
            <div style={{display:"flex",alignItems:"center",gap:7,flexDirection:"row-reverse",minWidth:0,flex:1,justifyContent:"flex-start"}}>
              <TeamBadge team={awayTeamObj} size={28}/>
              <div style={{minWidth:0,textAlign:"right"}}>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.55)",fontWeight:700,letterSpacing:.8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:70,marginLeft:"auto"}}>{awayTeamObj?.n||awayTeamObj?.name||"Avversario"}</div>
                <div style={{fontSize:32,fontWeight:900,color:(isMatchHome?losing:winning)?"#f87171":(isMatchHome?winning:losing)?"#4ade80":"#f1f5f9",lineHeight:1,textAlign:"right"}}>{isMatchHome?score.away:score.home}</div>
              </div>
            </div>
          </div>

          {/* ── Field + Panel: responsive layout ── */}
          {(()=>{const _isHL=["hl_move","hl_choose","hl_result","hl_intro"].includes(phase);
          // CINE-1: contesto cinematografico centralizzato — type (legacy) + pattern + variant
          let _hlType=null,_hlPattern=null,_hlVariant=null,_hlOneTwo=false,_hlThrough=false,_hlOutcomeKind=null,_hlQuality=null,_isDefHL=false,_hlSetPiece=null,_hlBall=null,_hlWood=null,_hlGkOut=null;
          // cpmadapt: bias di "shading" difensivo verso la fascia più attaccata dall'Eroe. Deterministico, bounded (±4u).
          //   Parte solo dopo ≥3 azioni (serve un pattern) e cresce con la dominanza della fascia. 0 se off/nessun pattern.
          let _adaptShift=0,_adaptHotY=50,_adaptStr=0;
          if(_CPM_ADAPT){const _bf=matchMemRef.current.byFlank||{L:0,C:0,R:0};const _tot=_bf.L+_bf.C+_bf.R;
            if(_tot>=3){const _top=Math.max(_bf.L,_bf.C,_bf.R);_adaptStr=clamp((_top/_tot-0.34)/0.4,0,1);
              _adaptHotY=_bf.R===_top?75:(_bf.L===_top?25:50);_adaptShift=(_adaptHotY-50)*_adaptStr*0.24;}}// (b) ±6u max
          const _scoreDiff=isMatchHome?((score.home||0)-(score.away||0)):((score.away||0)-(score.home||0));// per la coerenza-stato dei titoli
          if(_isHL){const _sit=situations[hlIdx];const _d=deriveHL(_sit,chosenAct);_hlType=_d.type;_hlPattern=_d.pattern;_hlVariant=_d.variant;_hlOneTwo=(_sit&&_sit.intent==="onetwo");_hlThrough=!!(_sit&&_sit.intent==="through");
            // [7.8.8 collaudo PO «punizione senza barriera e giocatori mal posizionati»] flag SET-PIECE derivato dalla
            //   SITUATION (intent) → AFFIDABILE in OGNI fase HL (anche in AIMING/hl_choose, quando chosenAct è null e la
            //   regia della barriera dovrebbe già essere schierata). Il 3D lo usa per formare il muro fin dalla mira.
            _hlSetPiece=_sit?(((typeof isPenaltySit==="function")&&isPenaltySit(_sit))?"penalty":((_sit.intent==="freekick"||_hlType==="freekick")?"freekick":null)):null;
            _hlGkOut=_sit?(_sit.gkOutSit||null):null;/* [7.248.0 gi52] la scena «il portiere esce» piazza il GK avversario fuori dalla linea */
            /* [7.214.0 revisione PO «la rovesciata deve partire col pallone ancora in aria», «il colpo di testa
               non è sincronizzato con il pallone in aria, scende a terra», «la volée non parte con la palla in
               aria»] STATO-PALLA AL RENDER. Il motore sa da sempre quali situazioni hanno il pallone per aria
               (`hlBallState`: è l'invariante CINE che autorizza testa/rovesciata/volée) ma il 3D non lo sapeva:
               la mesh riposava a 0.65 = sull'erba, e la conclusione aerea partiva da lì. Ora lo stato viaggia
               come prop e il render tiene il pallone alla quota di contatto. */
            _hlBall=(typeof hlBallState==="function"&&_sit)?hlBallState(_sit):null;
            // 5.65.0: un highlight è DIFENSIVO se la situation è type:"def" oppure l'azione risolta è un contrasto
            //   che NON vale gol/assist (una conclusione difensiva "da gol" resta offensiva) → attiva la traiettoria difensiva varia.
            _isDefHL=(_sit&&_sit.type==="def")||(_hlType==="tackle"&&chosenAct&&chosenAct.rew!=="goal"&&chosenAct.rew!=="assist");
            // ENGINE Fase 1 (Intent→Decision): l'ESECUZIONE (variante) è decisa dinamicamente dal Decision Engine
            //   in base ad attributi/pressione/contesto + casualità controllata (seed stabile → niente flicker,
            //   gate deterministico), NON più fissata dalla label. Applicato a tiri DA TERRA e cross: le invarianti
            //   cinematiche aeree (testa/volée) restano gestite da deriveHL (data-coherence intatto).
            if(typeof decideExecution==="function"&&_sit&&chosenAct){
              const _tac=_sit.tactic||{},_pm={none:0,low:1,medium:2,high:3};
              // Step 2: contesto ARRICCHITO — pressione (situation + tattica avversaria), meteo reale; l'intento
              //   strutturale (_sit.intent) radica la decisione, il tipo risolto sceglie quale famiglia d'esecuzione.
              const _press=(_tac.nearby_def!=null?_tac.nearby_def:(_pm[_tac.pressure]||1))+(((oppTactic&&oppTactic.pressure)||50)>65?1:(((oppTactic&&oppTactic.pressure)||50)<35?-1:0));
              const _1v1=!!(_tac&&_tac.cn&&_tac.cn.oneOnOne);// P1: contesto in cui il portiere esce/si scopre → pallonetto coerente
              const _ctx={attrs:player.stats||{},pressure:clamp(_press,0,5),support:_tac.support||0,fatigue:player.fatigue||0,morale:player.morale||60,x:pPos.x,weather:(weather&&weather.id)||"clear",
                foot:player.foot||"R",side:(pPos.y<50?"L":"R"),gkOut:_1v1,// F8: piede preferito + fascia laterale → cross/tiro di piede debole penalizzati; P1: gkOut onesto (solo 1v1) → il motore alza il peso del chip SOLO quando il portiere può uscire
                seed:hashStr((_sit.text||"")+"|"+((chosenAct.label)||"")+"|"+hlIdx+"|"+Math.round(player.fatigue||0)+"|"+Math.round(player.form||0))};
              const _di=_hlType==="cross"?"cross":_hlType==="dribble"?"dribble":_hlType==="pass"?(_hlPattern==="THROUGH_BALL"?"through":"onetwo"):_hlType==="tackle"?"intercept":"shot";
              if(_hlType==="shot"&&hlBallState(_sit)!=="aerial"){const _d2=decideExecution("shot",_ctx);_hlQuality=_d2.quality;const _m={shot_power:"shot_power",shot_curled:"shot_curled",shot_first_time:"shot_first_time",shot_chip:"shot_chip",shot_placed:"shot_one_on_one"};/* [7.222.0 revisione PO «Piazzato basso: pallonetto!»] LA TECNICA LA SCEGLIE IL GIOCATORE, il motore decide quanto bene riesce: quando l azione NOMINA la tecnica («piazzato basso», «pallonetto», «a giro», «di potenza», «al volo»…) la variante della label VINCE, altrimenti il motore poteva trasformare un piazzato basso in un cucchiaio. Senza tecnica dichiarata l esecuzione resta del motore, come prima. */const _txL222=((chosenAct&&chosenAct.label)||"").toLowerCase();if(!/pallonett|cucchiaio|scavin|piazzat|a giro|angolat|potenza|collo pieno|rasoterra|\bbass|di prima|prima intenzione|vol[eé]e|al volo|esterno|interno|tacco/.test(_txL222))_hlVariant=_m[_d2.execution]||_hlVariant;
                // Polish P1: se il motore ha scelto un PALLONETTO ma il portiere è FERMO (niente 1v1) e il giocatore non l'ha chiesto esplicitamente → rimappa a conclusione a terra (scavetto su GK fermo = incoerente, Manifesto Cap.7.2/7.5). Il chip resta in 1v1 o su scelta esplicita.
                if(_CPM_CHIP_GUARD&&_hlVariant==="shot_chip"&&!_1v1&&!/pallonett|cucchiaio|scavin|scavetto/i.test((chosenAct&&chosenAct.label)||""))_hlVariant="shot_curled";}
              else if(_hlType==="shot"){_hlQuality=decideExecution("shot",_ctx).quality;}/* F12: tiro AEREO (volée su cross/inserimento) → SOLO qualità → precisione+pace dell'arco; variant aerea (volley) INTATTA (invariante CINE, altezza già esclusa in F4). Chiude l'insertion §2 */
              else if(_hlType==="cross"){const _d2=decideExecution("cross",_ctx);_hlQuality=_d2.quality;const _m={cross_far_post:"cross_far_post",cross_near_post:"cross_near_post",cross_low_driven:"cross_low_driven",cross_cutback:"cross_cutback",cross_deep:"cross_far_post"};_hlVariant=_m[_d2.execution]||_hlVariant;}
              else if(_hlType==="dribble"){const _d2=decideExecution("dribble",_ctx);_hlQuality=_d2.quality;const _m={dribble_feint:"dribble_feint",dribble_inside:"dribble_inside",dribble_outside:"dribble_outside",dribble_knock:"dribble_outside"};_hlVariant=_m[_d2.execution]||_hlVariant;}
              else if(_hlType==="penalty"){_hlQuality=decideExecution("penalty",_ctx).quality;}/* F6: solo QUALITÀ → traiettoria; la variant (panenka) resta scelta della situation */
              else if(_hlType==="freekick"){_hlQuality=decideExecution("freekick",_ctx).quality;}/* F6: solo QUALITÀ → traiettoria */
              else if(_hlType==="header"){_hlQuality=decideExecution("header",_ctx).quality;}/* F7: solo QUALITÀ → arco; variant e stato-palla aereo INTATTI (invariante CINE testa⇒aerea) */
              else if(_hlType==="pass"){_hlQuality=decideExecution(_hlPattern==="THROUGH_BALL"?"through":"onetwo",_ctx).quality;}/* F9: QUALITÀ del passaggio → profondità scatto + pace (convergenza palla↔ricevente intatta) */
              // FUSIONE: su un'azione FALLITA il TIPO di esito lo decide il motore (per OGNI intento), non un dado.
              if(outcome&&outcome.ok===false){
                // M1: SORGENTE UNICA — usa l'outKind già deciso in handleAction (stesso ctx/seed) così 3D, overlay
                //   e cronaca raccontano lo STESSO esito. Fallback al calcolo inline se assente (robustezza).
                /* [7.249.0 gi37/38 «tiro da distanza impossibile» PERSISTENTE — ROOT CAUSE] l'else del fallback
                   era legato a `if(outcome.woodwork)` invece che a `if(outcome.outKind)`: senza legno (quasi
                   sempre) il ricalcolo inline SOVRASCRIVEVA l'outKind della sorgente unica — mascherato da
                   sempre perché i due calcoli coincidevano per seed, ESPOSTO dal remap 7.247 (handleAction dice
                   «intercepted/duello», l'inline diceva «post» → il 3D lanciava il volo sul palo da 35m). */
                if(outcome.outKind){_hlOutcomeKind=outcome.outKind;}
                else{const _neg=["saved","blocked","wide","post","intercepted","out","corner","dispossessed","fouled","win_freekick","overhit","offside","missed","lost","stopped","deflected_out","shielded_out"];
                const _dd=decideExecution(_di,{...(_ctx),seed:(_ctx.seed^0x5f3759df)>>>0}).outcome;_hlOutcomeKind=_neg.indexOf(_dd)>=0?_dd:(_di==="dribble"?"dispossessed":(_di==="through"||_di==="onetwo")?"intercepted":_di==="intercept"?"beaten":"saved");/* [7.115.0 fix D4/B1] idem lato 3D-props (fallback quando outcome.outKind assente) */}
                if(outcome.woodwork)_hlWood=outcome.woodwork;}
              // [7.8.20 collaudo tester «azione a catena: gol finto alla PRIMA azione dopo un dribbling netto»] ROOT
              //   CAUSE del residuo (perché i fix in handleAction non bastavano): _hlOutcomeKind veniva popolato da
              //   outcome.outKind SOLO su ok===false. Un'azione RIUSCITA convertita a CHANCE (dribble/build/pass: il
              //   primo tocco NON è gol, la CATENA finalizza) arrivava al 3D con hlOutcomeKind=null → il ramo chance
              //   (fist/deflect) NON scattava → ramo in_net → la palla ENTRAVA in porta (finto gol) prima della catena.
              //   Ora la chance su SUCCESSO è propagata al 3D → il primo tocco resta al piede, niente rete.
              if(outcome&&outcome.ok===true&&outcome.outKind==="chance")_hlOutcomeKind="chance";
              /* [7.604.0 SOLO COLLAUDO, attivo solo in test/review come FORCE_OUTCOME (7.211)] il gancio
                 sul KIND: senza, il ramo «gol vero» dei piazzati non e' riproducibile — FORCE_OUTCOME forza
                 il successo ma il kind resta «chance», e il difetto del PO (SIT #51, gol dichiarato con la
                 palla ferma a 15,6u) vive proprio nel ramo che qui non si riesce a percorrere. */
              if((_SIT_TEST||_CPM_TEST||(typeof window!=='undefined'&&window.__CPM_REVIEW))&&typeof window!=='undefined'&&window.__CPM_FORCE_KIND!==undefined){_hlOutcomeKind=window.__CPM_FORCE_KIND;}
            }
          }
          return(
          <div style={isNarrow?{display:"flex",flexDirection:"column",flex:1,minHeight:0}:{display:"flex",flexDirection:"row",alignItems:"stretch",flex:1,minHeight:0,overflow:"hidden"}}>

            {/* FIELD — height-constrained on desktop, full width on narrow */}
            <div style={isNarrow?{position:"relative",overflow:"hidden",cursor:"default",flex:1,minHeight:0,display:"flex",flexDirection:"column"}:{flex:"0 0 62%",position:"relative",overflow:"hidden",alignSelf:"stretch",cursor:"default"}}>
              <ThreeMatchView key={"tmv"+glbTry}/* [7.264.0] «Riprova» rimonta la scena 3D → il caricatore del CH38 riparte da zero senza perdere la partita */ playerX={pPos.x} playerY={pPos.y} zone={zone}
                homeCol={homeKitCol} oppCol={awayKitCol}
                opponents={opponents.current} matchPhase={matchPhase3D} matchClock={clock} avatarId={player.avatarId||0}
                allPlayers={matchPlayers} homeClub={homeTeamObj} competitionLabel={_compLabel} competitionColor={_compCol} matchImportance={mw} isFinal={_isNeutralFinal} seasonPresentation={_presNight} heroNum={player.jerseyNum||10} heroName={player.name} subEntry={subEntryKey} subEntryVar={subEntryVar} subExit={subExitKey} subExitVar={subExitVar}
                heroStandHome={isMatchHome!==false}/* [7.278.0] lato-TRIBUNA: serve alla premiazione per festeggiare sotto la PROPRIA curva */ scoreHome={isMatchHome?score.home:score.away} scoreAway={isMatchHome?score.away:score.home} homeAbbr={(homeTeamObj?.a||homeTeamObj?.n||"HOM").slice(0,3).toUpperCase()} awayAbbr={(awayTeamObj?.a||awayTeamObj?.n||"AWA").slice(0,3).toUpperCase()}
                heroKitCol={heroKitCol} heroKitCol2={heroKitCol2} heroClub={_heroClubObj} oppClub={_oppClubObj} adSeed={(Math.abs(hashStr((player.club?.id||"x")+"|ads|"+(player.season||1)+"|"+((homeTeamObj&&homeTeamObj.nat)||player.nation||""))))>>>0}/* [7.44.0] pubblicità seedate per club+stagione+nazione */
                stadiumHomeCol={homeTeamObj?.c||scoreHomeCol} stadiumAwayCol={awayTeamObj?.c||scoreAwayCol} stadiumHomeName={homeTeamObj?.n||homeTeamObj?.name||null} stadiumAwayName={awayTeamObj?.n||awayTeamObj?.name||null} stadiumHomeAbbr={homeTeamObj?.a||null} stadiumAwayAbbr={awayTeamObj?.a||null}/* [7.175.0] sigle reali per le bandiere */ stadiumHomeNat={homeTeamObj?.nat||null} stadiumAwayNat={awayTeamObj?.nat||null}/* [7.180.0] lingua degli striscioni */ stadiumHomeId={homeTeamObj?.id||null} stadiumVenue={(function(){try{return getStadiumName(homeTeamObj)||null;}catch(_e){return null;}})()}/* [7.658.0] il NOME DELLO STADIO (es. Stadio Meneghino) per il cartellone LED — precisazione PO: e' LUI il cartellone da fare piccolo e a scorrimento, non gli striscioni dei tifosi */ stadiumAwayId={awayTeamObj?.id||null}/* [7.181.0] anno di fondazione per NUCLEO <anno> *//* [7.171.0 TIFO 2.0] nomi REALI casa/ospite per gli striscioni dei gruppi ultras */ /* [6.2.0 KIT-1] tifo coi colori SOCIALI, non con la divisa indossata */
                stadiumStyle={getStadiumStyle(homeTeamObj)}
                ballX={ballPos.x} ballY={ballPos.y} half={clock>=45?2:1}/* [7.561.0 richiesta PO «opterei anche per il cambio campo tra il primo ed il secondo tempo come nella realta'»] La simulazione NON scambia le porte — toccarla vorrebbe dire rimettere mano al segno di ogni gol, e non si fa per un'inquadratura. Cambia la CAMERA: nella ripresa la regia larga di cronaca ruota di 180 gradi attorno all'asse verticale, cosi' chi attaccava verso destra ora attacca verso sinistra e le tribune si scambiano di posto — che e' esattamente cio' che si vede in TV dopo il cambio campo. */ fermo={fermoRef}/* [7.559.0] LA SCENA DEVE SAPERE CHE IL GIOCO E' FERMO. Il primo giro del guardiano ha misurato 0 fermi su 9 interruzioni armate: bloccare il BERSAGLIO logico non basta, perche' nel 3D la palla ha altri padroni — il portatore la tiene ai piedi e cammina, e la palla cammina con lui. Il fermo viaggia come ref (stesso schema di `deliver`/`meshDef`: il renderer lo legge ogni fotogramma senza un re-render per tick). */ hlSitKey={phase==="playing"||phase==="matchday"?-1:(hlIdx+(_forceSeqRef.current||0)*10000)}/* [7.212.0] +progressivo: rigiocare la stessa situation riarma lo snap di scena */ stageStamp={stageStamp}/* [7.456.0 codice 007] il commit in cui atterra lo staging fresco — vedi il ri-taglio nel render-loop */ meshDef={meshDefRef} deliver={deliverRef} hlType={_hlType} hlSetPiece={_hlSetPiece} hlBall={_hlBall} hlWood={_hlWood} hlVariant={_hlVariant} hlPattern={_hlPattern} hlThrough={_hlThrough} hlOneTwo={_hlOneTwo} hlChain={!!(situations[hlIdx]&&situations[hlIdx]._chainDepth)}/* [7.234.0 #51] il 3D sa se la scena è un SECONDO TEMPO (catena) */ hlOutcomeKind={_hlOutcomeKind} hlQuality={_hlQuality} hlGkOut={_hlGkOut} adaptShift={_adaptShift} adaptHotY={_adaptHotY} adaptStr={_adaptStr} bgAction={bgAction} hlZone={hlZone}
                timeOfDay={timeOfDay} weather={weather} kickoffHour={kickoffHour} attendance={attendance} crowd={crowdCtx}
                waveEvent={waveEvent} isDerby={!!drby} isBigGame={mw>=7}
                hlSuccess={outcome?.ok??null} hlReward={chosenAct?.rew||null} hlActLbl={chosenAct?.label||null} salienteOn={_sal689} gkSave={gkSave695}/* [7.695.0] il segnale della parata: ref stabile, letto dal renderer a ogni fotogramma *//* [7.689.0] scena saliente extra-eroe in corso: il renderer riaccende i corpi e va in tribuna est */ hlDef={_isDefHL} hlDefTraj={outcome?.defTraj||null} hlDefGesto={chosenAct?.defGesto||null} hlOffBall={!!situations[hlIdx]?.offBall} stagedSpot={_stagedSpotRef} cineBusy={cineBusyRef}/* [7.405.0 codice 001] il punto-palla staggiato: il renderer tiene la MESH del battitore sul punto (vedi la colla nel blocco giocatori) */                isDesktop={!isNarrow} ceremony={ceremony} shootout={phase==="shootout"?{kick:soFx}:null} onWalkoutDone={()=>{if(benchStart)setOnBench(true);
                  // [6.88.0 collaudo PO «maggiore pathos durante la cronaca»] il calcio d'inizio dei BIG MATCH
                  //   apre con una riga d'atmosfera dedicata (finale > big match), scelta deterministica.
                  if(mw>=7||_isNeutralFinal){const _bmPool=_isNeutralFinal
                    ?["🏆 È LA FINALE. Novanta minuti per la storia — lo stadio è una bolgia.","🏆 Notte da leggenda: le due squadre si giocano tutto. Che finale sia!","🏆 L'attesa è finita: la finale comincia ORA. Brividi sugli spalti."]
                    :["🔥 Big match! L'atmosfera è elettrica, lo stadio spinge dal primo secondo.","🔥 Partita da dentro o fuori: intensità altissima già dal fischio d'inizio.","🔥 Sfida al vertice: ogni pallone peserà come un macigno."];
                    addCom(_bmPool[Math.abs(hashStr("bm88|"+(player.season||1)+"|"+(player.week||1)))%_bmPool.length],"#f59e0b",0);}
                  setPhase("playing");}} celebPlan={celebPlan} onGoalInNet={fireGoalCeleb} onOutcomeShown={fireOutcomeReveal} onCutNeeded={()=>{try{setCutFx({key:Date.now(),dur:340});}catch(_e){}}}/* [7.471.0 codice 007] IL RENDERER PUO' CHIEDERE LO STACCO. Il taglio nero e' uno stato React di LiveMatch, ma chi SA che la camera sta per teletrasportarsi e' il render-loop: senza questo filo poteva solo subirlo. */ />
              {/* [7.65.0 Phase 4 · POST-PROCESSING] VIGNETTE cinematografica sul 3D — bordi scuri morbidi (look da broadcast) + micro-grana ai bordi. Overlay DOM (pointer-events off) → zero recolor del 3D, zero costo GPU, invisibile al gate (che cattura il canvas). */}
              <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:3,background:"radial-gradient(ellipse 118% 96% at 50% 44%, rgba(0,0,0,0) 56%, rgba(0,0,0,0.14) 82%, rgba(0,0,0,0.30) 100%)"}}/>
               {/* [7.661.0 - LA CRONACA IN PRIMO PIANO, GRANDE E CENTRALE. Richiesta PO in collaudo: «il testo della cronaca quando non ci sono azioni deve essere piu grande e centrale e carino, deve emozionare». Con la cronaca visuale spenta (7.660) lo stadio e il palcoscenico e il TESTO e lo spettacolo: l ultima riga appare grande al centro, col suo colore, ombra da broadcast e ingresso morbido (remount su key). Il feed sotto resta la storia completa. Rosso __CPM_NO661. */}
               {/* ⚠️ [7.695.0 — LA TELECRONACA NON DEVE COPRIRE L'AZIONE. Domanda del PO: «durante le azioni
                   salienti/pericolose come possiamo mostrare la telecronaca senza che sia invadente?»]
                   FOTOGRAFATO: col pallone dentro l'area il banner sedeva al 38% dell'altezza, cioe' in
                   mezzo alla porta, e una scheda di scelta aperta al 28' era ancora a schermo al 36' con
                   tre bottoni che occupavano meta' telefono. Il gioco c'era e non si vedeva.
                   Durante la scena la cronaca diventa SOTTOPANCIA: fascia bassa, una riga sola, corpo 14,
                   niente minuto e niente bottoni — la grafica di una partita in TV. Fuori dalla scena
                   resta esattamente com'era (grande e centrale, com'e' stato chiesto nel 7.661). */}
               {/* ⚠️ [7.697.0 collaudo PO: «durante la telecronaca non si capisce bene chi attacca e chi
                   difende, mostra qualcosa che faccia capire chi gioca in una meta' campo e chi
                   nell'altra»] Fotografia del PO al 57': un angolo di prato, nessun giocatore in quadro,
                   nessun segno di verso. La regia in tribuna est guarda il campo di lato e il pallone puo'
                   stare ovunque: senza un riferimento fisso, chi legge non ha modo di sapere da che parte
                   si sta andando. Qui c'e' la convenzione della TV: una fascia che RISPECCHIA il campo,
                   meta' e meta' coi colori delle due squadre, ognuna con la sigla nella meta' che
                   DIFENDE e la freccia verso la porta che attacca. Nel motore la casa attacca sempre a
                   destra (portieri fissi a gx 4 e 97), quindi la mappa e' stabile e non mente.
                   Rosso __CPM_NO697B. */}
               {phase==="playing"&&!(typeof window!=="undefined"&&window.__CPM_NO697B)&&(()=>{
                 const _sgH=String((homeTeamObj&&(homeTeamObj.a||homeTeamObj.n))||"").slice(0,3).toUpperCase();
                 const _sgA=String((awayTeamObj&&(awayTeamObj.a||awayTeamObj.n))||"").slice(0,3).toUpperCase();
                 const _cH=(homeTeamObj&&homeTeamObj.c)||"#ef4444",_cA=(awayTeamObj&&awayTeamObj.c)||"#3b82f6";
                 /* ⚠️ [7.698.0 collaudo PO: «nuovo pannello con le frecce televisivo, meno invadente e
                     piu' moderno»] La prima stesura (7.697) era una fascia piena da bordo a bordo coi due
                     colori a tutta altezza: leggibile ma pesante — in fotografia sembra un cartello
                     appiccicato sopra lo stadio, non una grafica di partita. Ora e' una capsula piccola e
                     centrata, vetro scuro traslucido con bordo a filo, il colore della squadra ridotto a
                     un accento verticale di tre pixel e le frecce come chevron tenui: la sigla sta nella
                     meta' che DIFENDE e il chevron indica la porta che ATTACCA. Stessa informazione,
                     un decimo dell'inchiostro. */
                 const _pill={display:"flex",alignItems:"center",gap:5};
                 const _sg={fontSize:9.5,fontWeight:800,letterSpacing:1.4,color:"rgba(241,245,249,0.92)"};
                 const _ch={fontSize:11,lineHeight:1,fontWeight:700,color:"rgba(241,245,249,0.42)"};
                 const _acc=(c)=>({width:3,height:11,borderRadius:2,background:c,display:"inline-block",flex:"0 0 auto"});
                 return(
                 <div data-cpm="verso697" style={{position:"absolute",left:0,right:0,top:"1.8%",zIndex:5,pointerEvents:"none",display:"flex",justifyContent:"center"}}>
                   <div style={{display:"flex",alignItems:"center",gap:9,padding:"3px 11px",borderRadius:999,background:"rgba(9,13,22,0.44)",backdropFilter:"blur(6px)",WebkitBackdropFilter:"blur(6px)",border:"1px solid rgba(255,255,255,0.10)",boxShadow:"0 1px 8px rgba(0,0,0,0.32)"}}>
                     <span style={_pill}><i style={_acc(_cH)}/><span style={_sg}>{_sgH}</span><span style={_ch}>&#8250;</span></span>
                     <span style={{width:22,height:1,background:"rgba(255,255,255,0.16)"}}/>
                     <span style={_pill}><span style={_ch}>&#8249;</span><span style={_sg}>{_sgA}</span><i style={_acc(_cA)}/></span>
                   </div>
                 </div>);})()}
               {phase==="playing"&&coms[0]&&!(typeof window!=="undefined"&&window.__CPM_NO661)&&(
                 <div data-cpm="com661"/* [7.681.0] etichetta stabile: senza, per misurare il banner servivano selettori sullo STILE, che si rompono al primo ritocco grafico */ key={"com661-"+coms[0].t+"-"+String(coms[0].text||"").slice(0,18)} style={_sot695?{position:"absolute",left:"4%",right:"4%",bottom:"11%",zIndex:5,pointerEvents:"none",textAlign:"center",animation:"cpmComIn661 .55s ease-out"}:{position:"absolute",left:"7%",right:"7%",top:"38%",zIndex:5,pointerEvents:"none",textAlign:"center",animation:"cpmComIn661 .55s ease-out"}}>
                   <style>{"@keyframes cpmComIn661{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}"}</style>
                   <div /* [7.695.0] sottopancia: il contenitore prende tutta la larghezza e la riga si taglia con i puntini, invece di uscire dallo schermo come faceva la prima stesura (fotografata) */ style={_sot695?{display:"block",width:"100%",boxSizing:"border-box",padding:"7px 12px",borderRadius:10,background:"linear-gradient(90deg, rgba(5,8,16,0) 0%, rgba(5,8,16,0.78) 12%, rgba(5,8,16,0.78) 88%, rgba(5,8,16,0) 100%)"}:{display:"inline-block",padding:"10px 16px",borderRadius:14,background:"radial-gradient(ellipse at center, rgba(5,8,16,0.62) 0%, rgba(5,8,16,0.28) 70%, transparent 100%)"}}>
                     <div /* ⚠️ [7.697.0 collaudo PO: «la telecronaca durante le azioni pericolose e' tagliata, deve leggersi per intera»] IL DIFETTO ERA MIO E DI MEZZA GIORNATA FA: per tenere il sottopancia su una riga avevo messo `nowrap` piu' i puntini, e una riga di telecronaca sta in una riga sola quasi mai. Il sottopancia serve a NON coprire l'azione, non a nascondere il testo: ora va a capo fino a tre righe, resta in basso e il testo si legge tutto. */ style={_sot695?{fontSize:14,lineHeight:1.32,fontWeight:800,color:coms[0].color||"#e8edf6",textShadow:"0 2px 10px rgba(0,0,0,0.9)",letterSpacing:0.1,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden",maxWidth:"100%"}:{fontSize:19,lineHeight:1.35,fontWeight:800,color:coms[0].color||"#e8edf6",textShadow:"0 2px 10px rgba(0,0,0,0.85), 0 0 26px rgba(0,0,0,0.5)",letterSpacing:0.2}}>{coms[0].text}</div>
                     {!_sot695&&(<div style={{marginTop:5,fontSize:11,fontWeight:700,color:"rgba(232,237,246,0.55)"}}>{(coms[0].t??clock)}′</div>)}
                     {/* [7.681.0 direttiva PO «deve essere interattiva, a scelta!»] I BOTTONI SOTTO LA FRASE.
                         Appaiono solo sulle righe che portano delle scelte (le interazioni dell'eroe: due o
                         tre a partita), e solo finche' nessuno ha risposto. Nessuna schermata nuova, nessuna
                         modale: la decisione sta dov'e' gia' il racconto.
                         ⚠️ LA PARTITA NON ASPETTA. Se non si sceglie entro il respiro della riga, il timer
                         qui sotto applica l'opzione NEUTRA (la prima della scheda) e la gara prosegue: si
                         gioca sul telefono, a volte guardando altro, e un gioco che si blocca in attesa di
                         un tocco e' un gioco rotto. */}
                     {coms[0].sc&&coms[0].sci==null&&(/* [7.695.0] i bottoni NON si nascondono durante la scena: una scelta gia' aperta deve restare rispondibile, o resterebbe appesa. A non farne nascere di nuove ci pensa il cancello qui sopra. */
                       <div style={{marginTop:9,display:"flex",flexDirection:"column",gap:6,pointerEvents:"auto"}}>
                         {coms[0].sc.map((o,oi)=>(
                           <button key={oi} onClick={()=>scegli681(oi,false)}
                             style={{padding:"9px 12px",borderRadius:11,border:"1px solid rgba(196,181,253,0.45)",background:"rgba(24,20,48,0.86)",color:"#e9e4ff",fontSize:14,fontWeight:800,lineHeight:1.25,textAlign:"left",cursor:"pointer"}}>{o.et}</button>
                         ))}
                       </div>
                     )}
                     {coms[0].sc&&coms[0].sci!=null&&(
                       <div style={{marginTop:7,fontSize:12.5,fontWeight:700,color:"rgba(196,181,253,0.9)"}}>
                         {"\u2713 "+String(coms[0].sc[coms[0].sci]&&coms[0].sc[coms[0].sci].et||"")+(coms[0].scAuto?"  (scelta da sola)":"")}
                       </div>
                     )}
                   </div>
                 </div>
               )}
              {screenFlash&&<div style={{position:"absolute",inset:0,background:screenFlash.col,zIndex:20,pointerEvents:"none",animation:`fadeFlash ${screenFlash.dur}ms ease-out forwards`}}/>}
              {cutFx&&<div key={cutFx.key} style={{position:"absolute",inset:0,background:"#000",zIndex:30,pointerEvents:"none",animation:`blackCut ${cutFx.dur}ms ease-in-out forwards`}}/>}
              {/* [7.2.0] PREMIAZIONE — banner celebrativo + skip. Il 3D sotto mostra giro di campo/curva/podio. */}
              {phase==="ceremony"&&(<React.Fragment>
                <div style={{position:"absolute",top:0,left:0,right:0,zIndex:24,pointerEvents:"none",padding:"14px 12px",textAlign:"center",background:"linear-gradient(180deg,rgba(94,15,29,0.72),rgba(94,15,29,0))"}}>
                  <div style={{fontSize:11,letterSpacing:3,color:"#f0b33a",fontWeight:800}}>🏆 PREMIAZIONE</div>
                  <div style={{fontSize:isNarrow?20:26,fontWeight:900,color:"#fff",letterSpacing:1,marginTop:2,textShadow:"0 2px 10px rgba(0,0,0,0.6)"}}>{ceremony?.kind==="league"?"CAMPIONI!":ceremony?.kind==="int"?"TRIONFO!":"TITOLO VINTO!"}</div>
                  {ceremony?.name&&<div style={{fontSize:isNarrow?12:14,color:"#ffe9b8",fontWeight:700,marginTop:1}}>{ceremony.name}</div>}
                </div>
                {/* [7.31.0] chiusura blocco premiazione qui sotto; l'overlay RIGORI è il Fragment successivo */}
                <button onClick={skipCeremony} data-cpm="salta" style={{position:"absolute",bottom:14,right:14,zIndex:25,padding:"9px 16px",borderRadius:22,border:"1px solid rgba(255,255,255,0.35)",background:"rgba(0,0,0,0.45)",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",backdropFilter:"blur(4px)"}}>{ceremony&&ceremony.light?"Salta festeggiamenti →":"Salta premiazione →"}</button>
              </React.Fragment>)}
              {/* [7.31.0 direttiva PO] OVERLAY CALCI DI RIGORE — tabellino broadcast ✓/✗ kick-by-kick, suspense
                  sul kicker, banner finale (passi il turno / eliminati). Il 3D sotto anima i rigori veri. */}
              {phase==="shootout"&&soState&&(()=>{
                const _revealed=Math.floor(Math.max(0,soState.step+1)/2);/* rigori col REVEAL già mostrato */
                const _dots=(side)=>{const ks=soState.seq.filter(k=>k.side===side);let seen=0;const out=[];
                  soState.seq.forEach((k,i)=>{if(k.side!==side)return;const _revN=soState.seq.slice(0,_revealed).filter(x=>x.side===side).length;const idx=out.length;
                    out.push(idx<_revN?(k.scored?"✓":"✗"):"·");});
                  return out;};
                const _dH=_dots("H"),_dA=_dots("A");
                const _cur=(soState.cur!=null&&soState.step%2===0&&!soState.done)?soState.seq[soState.cur]:null;
                const _lastRev=(!_cur&&_revealed>0&&!soState.done)?soState.seq[_revealed-1]:null;
                const _finTxt=soState.won?((context==="cup"&&(player.cup?.round||0)>=4)||((context==="euro_ko"&&player.euro?.phase==="final"))||((context==="euroMondiale_ko"&&player.euroMondiale?.koPhase==="final"))||((context==="nationsCup"&&!!player.nationsCupQueue?.isFinal))?"🏆 DAL DISCHETTO ALLA GLORIA!":"✅ PASSI IL TURNO!"):"❌ ELIMINATI AI RIGORI";
                return(<React.Fragment>
                <div style={{position:"absolute",top:0,left:0,right:0,zIndex:24,pointerEvents:"none",padding:"12px 10px",textAlign:"center",background:"linear-gradient(180deg,rgba(5,10,22,0.86),rgba(5,10,22,0))"}}>
                  <div style={{fontSize:11,letterSpacing:3,color:"#fbbf24",fontWeight:800}}>⚽ CALCI DI RIGORE</div>
                  <div className="cpm-num" style={{fontSize:isNarrow?24:30,fontWeight:900,color:"#fff",marginTop:2,textShadow:"0 2px 10px rgba(0,0,0,0.6)"}}>{soState.hs} — {soState.as}</div>
                  <div style={{display:"flex",justifyContent:"center",gap:14,marginTop:6}}>
                    {[["H",_dH],["A",_dA]].map(([sd,dd])=>(
                      <div key={sd} style={{display:"flex",alignItems:"center",gap:5}}>
                        <span style={{fontSize:10,fontWeight:900,color:sd==="H"?"#fbbf24":"rgba(255,255,255,0.75)"}}>{sd==="H"?(/^(national|nationsCup|euroMondiale)/.test(context||"")?((NAT_CLUB_DATA[player.nation]||{}).a||(player.nation||"NAZ").slice(0,3).toUpperCase()):(player.club?.a||"TU")):((opponent&&(opponent.a||opponent.n))||"AVV").toString().slice(0,3).toUpperCase()}</span>{/* [7.327.0 collaudo PO, dallo screenshot: «PRS» nella serie Italia-Spagna] in NAZIONALE la sigla di casa e' la NAZIONE, non il club dell'eroe — [7.529.0] commento chiuso in graffe: da figlio JSX nudo veniva RENDERIZZATO nella testata della serie rigori */}
                        {dd.map((d,i)=>(<span key={i} style={{width:16,height:16,lineHeight:"16px",borderRadius:8,fontSize:10,fontWeight:900,textAlign:"center",background:d==="✓"?"#16a34a":d==="✗"?"#dc2626":"rgba(255,255,255,0.14)",color:"#fff"}}>{d==="·"?"":d}</span>))}
                      </div>))}
                  </div>
                  {soState.done
                    ?<div style={{fontSize:isNarrow?17:21,fontWeight:900,color:soState.won?"#4ade80":"#f87171",marginTop:8,textShadow:"0 2px 10px rgba(0,0,0,0.7)"}}>{_finTxt}</div>
                    :_cur?<div style={{fontSize:12.5,color:"#fde68a",fontWeight:800,marginTop:7}}>{_cur.hero?"⭐ ":""}{_cur.kicker} sul dischetto…</div>
                    :_lastRev?<div style={{fontSize:13,fontWeight:900,marginTop:7,color:_lastRev.scored?"#4ade80":"#f87171"}}>{_lastRev.scored?"GOOOL!":( _lastRev.wide?"FUORI!":"PARATO!")}</div>
                    :<div style={{fontSize:12,color:"rgba(255,255,255,0.8)",fontWeight:700,marginTop:7}}>Si decide tutto dagli undici metri…</div>}
                </div>
                {!soState.done&&<button onClick={skipShootout} data-cpm="salta" style={{position:"absolute",bottom:14,right:14,zIndex:25,padding:"9px 16px",borderRadius:22,border:"1px solid rgba(255,255,255,0.35)",background:"rgba(0,0,0,0.45)",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Salta la serie ⏩</button>}
                </React.Fragment>);})()}
              {/* item 4 (5.49.2): GRAFICA TV PRE-PARTITA — confronto classifica delle due squadre, stile broadcast. Solo durante l'ingresso (walkout). */}
              {/* [7.13.0] SERATA DI PRESENTAZIONE — lo speaker annuncia la squadra sul walkout del 1° match in casa */}
              {phase==="walkout"&&_presNight&&(()=>{
                let _ros=[];try{_ros=generateTeamRoster(player.club,player.season||1);}catch(_e){}
                const _picks=[_ros[2],_ros[6],_ros[7],_ros[10]].filter(Boolean);
                const _beats=[{t:"Signore e signori… ecco a voi",n:`LA VOSTRA ${(player.club?.n||"SQUADRA").toUpperCase()}!`},
                  ..._picks.map(r=>({t:r.role,n:r.name})),
                  {t:`…e il vostro numero ${player.jerseyNum||10}`,n:(player.name||"").toUpperCase()+"!"}];
                const _b=_beats[Math.min(presN,_beats.length-1)];const _isHero=presN>=_beats.length-1;
                return(
                <div style={{position:"absolute",left:0,right:0,top:"12%",zIndex:15,pointerEvents:"none",display:"flex",justifyContent:"center",padding:"0 14px"}}>
                  <div key={presN} style={{textAlign:"center",animation:"logoIn 0.45s ease-out"}}>
                    <div style={{fontSize:10,fontWeight:800,letterSpacing:3,textTransform:"uppercase",color:_isHero?"#fde68a":"rgba(255,255,255,0.75)",textShadow:"0 2px 10px rgba(0,0,0,0.8)",marginBottom:4}}>🎤 {_b.t}</div>
                    <div style={{fontSize:_isHero?24:18,fontWeight:900,letterSpacing:1.5,color:_isHero?"#f59e0b":"#fff",textShadow:"0 3px 16px rgba(0,0,0,0.9)"}}>{_b.n}</div>
                    {_isHero&&<div style={{fontSize:10,fontWeight:800,letterSpacing:2,color:"rgba(255,255,255,0.85)",marginTop:4,textShadow:"0 2px 8px rgba(0,0,0,0.8)"}}>🏟️ La serata di presentazione — la tua gente ti chiama</div>}
                  </div>
                </div>);})()}
              {phase==="walkout"&&(
                <div style={{position:"absolute",left:0,right:0,bottom:"6%",zIndex:14,pointerEvents:"none",display:"flex",justifyContent:"center",padding:"0 10px",animation:"logoIn 0.6s ease-out"}}>
                  <div style={{width:"100%",maxWidth:440,background:"linear-gradient(180deg,rgba(8,12,24,0.92),rgba(8,12,24,0.82))",border:"1px solid rgba(255,255,255,0.12)",borderRadius:14,overflow:"hidden",boxShadow:"0 12px 40px rgba(0,0,0,0.55)",backdropFilter:"blur(6px)"}}>
                    {/* barra competizione in corso */}
                    <div style={{padding:"5px 12px",textAlign:"center",fontSize:9.5,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:_compCol,background:"rgba(255,255,255,0.04)",borderBottom:`1px solid ${_compCol}44`}}>{_compLabel}{!_leagueCtx&&_tvComp?` · ${_tvComp.phase}`:""}</div>{/* [6.88.0] header walkout nel colore della competizione */}
                    {/* header: nomi squadre con barra colore */}
                    <div style={{display:"flex",alignItems:"stretch"}}>
                      <div style={{flex:1,padding:"9px 12px",borderTop:`3px solid ${scoreHomeCol||"#3b82f6"}`,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:900,color:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{_tvHome.name}</div>
                        <div style={{fontSize:9,color:"rgba(255,255,255,0.55)",fontWeight:600}}>{_leagueCtx?(_tvHome.pos?`${_tvHome.pos}ª in classifica`:"Casa"):"Casa"}</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",padding:"0 10px",fontSize:11,fontWeight:800,color:"rgba(255,255,255,0.5)",letterSpacing:1}}>VS</div>
                      <div style={{flex:1,padding:"9px 12px",borderTop:`3px solid ${scoreAwayCol||"#ef4444"}`,minWidth:0,textAlign:"right"}}>
                        <div style={{fontSize:13,fontWeight:900,color:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{_tvAway.name}</div>
                        <div style={{fontSize:9,color:"rgba(255,255,255,0.55)",fontWeight:600}}>{_leagueCtx?(_tvAway.pos?`${_tvAway.pos}ª in classifica`:"Ospite"):"Ospite"}</div>
                      </div>
                    </div>
                    {_leagueCtx&&_tvOpener81?(
                    /* [6.81.0] PRIMA GIORNATA: niente tabella di zeri — il cammino inizia oggi */
                    <div style={{padding:"12px 14px",textAlign:"center"}}>
                      <div style={{fontSize:12,fontWeight:900,color:"#fff",letterSpacing:1,textTransform:"uppercase"}}>1ª giornata</div>
                      <div style={{fontSize:9.5,color:"rgba(255,255,255,0.55)",fontWeight:600,marginTop:3}}>Esordio stagionale — il cammino delle due squadre inizia oggi</div>
                    </div>
                    ):_leagueCtx?(<React.Fragment>
                    {/* CAMPIONATO: righe statistiche delle due squadre */}
                    {[["Punti",_tvHome.pts,_tvAway.pts],["Vittorie",_tvHome.w,_tvAway.w],["Pareggi",_tvHome.d,_tvAway.d],["Sconfitte",_tvHome.l,_tvAway.l],["Gol fatti",_tvHome.gf,_tvAway.gf],["Gol subiti",_tvHome.ga,_tvAway.ga]].map(([lab,hv,av],i)=>(
                      <div key={lab} style={{display:"flex",alignItems:"center",padding:"4px 12px",background:i%2?"rgba(255,255,255,0.03)":"transparent"}}>
                        <div style={{flex:1,fontSize:12,fontWeight:800,color:"#fff",textAlign:"left"}}>{hv==null?"–":hv}</div>
                        <div style={{flex:1.4,fontSize:9,fontWeight:600,color:"rgba(255,255,255,0.5)",textAlign:"center",textTransform:"uppercase",letterSpacing:0.5}}>{lab}</div>
                        <div style={{flex:1,fontSize:12,fontWeight:800,color:"#fff",textAlign:"right"}}>{av==null?"–":av}</div>
                      </div>
                    ))}
                    <div style={{display:"flex",alignItems:"center",padding:"7px 12px",borderTop:"1px solid rgba(255,255,255,0.08)"}}>
                      <div style={{flex:1,display:"flex",gap:3}}>{_tvHome.form.length===0&&<span style={{fontSize:9,color:"rgba(255,255,255,0.4)"}}>— esordio stagionale</span>}{_tvHome.form.map((r,i)=><span key={i} style={{width:11,height:11,borderRadius:3,background:_formCol(r),fontSize:7,color:"#0b1020",fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center"}}>{r}</span>)}</div>
                      <div style={{flex:1.4,fontSize:9,fontWeight:600,color:"rgba(255,255,255,0.5)",textAlign:"center",textTransform:"uppercase",letterSpacing:0.5}}>Forma · ultime 5</div>
                      <div style={{flex:1,display:"flex",gap:3,justifyContent:"flex-end"}}>{_tvAway.form.length===0&&<span style={{fontSize:9,color:"rgba(255,255,255,0.4)"}}>—</span>}{_tvAway.form.map((r,i)=><span key={i} style={{width:11,height:11,borderRadius:3,background:_formCol(r),fontSize:7,color:"#0b1020",fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center"}}>{r}</span>)}</div>
                    </div>
                    </React.Fragment>):(
                    /* COMPETIZIONE (coppa/europa/nazionale): fase/turno + il cammino dell'eroe IN questa competizione */
                    <div style={{padding:"10px 14px"}}>
                      <div style={{display:"flex",justifyContent:"space-around",textAlign:"center",marginBottom:_tvComp&&_tvComp.form&&_tvComp.form.length?10:0}}>
                        {_tvComp&&_tvComp.pts!=null&&<div><div style={{fontSize:20,fontWeight:900,color:"#fff"}}>{_tvComp.pts}</div><div style={{fontSize:8.5,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:1}}>Punti nel girone</div></div>}
                        <div><div style={{fontSize:20,fontWeight:900,color:"#fff"}}>{_tvComp?_tvComp.played:0}</div><div style={{fontSize:8.5,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:1}}>Gare disputate</div></div>
                      </div>
                      {_tvComp&&_tvComp.form&&_tvComp.form.length>0&&(
                        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:8}}>
                          <div style={{fontSize:9,fontWeight:600,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:0.5}}>Cammino</div>
                          <div style={{display:"flex",gap:3}}>{_tvComp.form.map((r,i)=><span key={i} style={{width:13,height:13,borderRadius:3,background:_formCol(r),fontSize:8,color:"#0b1020",fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center"}}>{r}</span>)}</div>
                        </div>
                      )}
                      {(!_tvComp||!_tvComp.played)&&<div style={{textAlign:"center",fontSize:10,color:"rgba(255,255,255,0.45)",fontStyle:"italic"}}>Esordio in questa competizione</div>}
                    </div>
                    )}
                    {/* [6.5.1 Polish E] LOWER-THIRD broadcast: strip "in diretta" con stadio, spettatori e orario — look TV moderno */}
                    <div style={{display:"flex",alignItems:"center",gap:7,padding:"6px 12px",background:"rgba(0,0,0,0.32)",borderTop:"1px solid rgba(255,255,255,0.08)",fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.62)"}}>
                      <span style={{display:"inline-flex",alignItems:"center",gap:4,color:"#ff6b6b",letterSpacing:1}}><span style={{width:7,height:7,borderRadius:"50%",background:"#ff3b3b",animation:"pulse 1.1s ease-in-out infinite",display:"inline-block"}}/>DIRETTA</span>
                      <span style={{opacity:0.3}}>·</span>
                      <span style={{flex:1,minWidth:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{(crowdCtx&&crowdCtx.stadiumTpl&&crowdCtx.stadiumTpl.name)||"Stadio"}</span>
                      {attendance?<span style={{whiteSpace:"nowrap"}}>👥 {attendance.toLocaleString("it-IT")}</span>:null}
                      {kickoffHour!=null?<span style={{whiteSpace:"nowrap"}}>🕐 {kickoffHour}:00</span>:null}
                    </div>
                  </div>
                </div>
              )}
              {floatGoal&&<div key={floatGoal.key} style={{position:"absolute",top:"7%",left:0,right:0,display:"flex",justifyContent:"center",zIndex:21,pointerEvents:"none",animation:"floatUp 1.4s ease-out forwards"}}>{/* [7.112.0 collaudo PO «la grafica del testo è basilare»] i messaggi degli highlight sono un BADGE broadcast (pill scura + bordo/glow nel colore d'esito + tipografia pulita) invece del testo piatto */}
                <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"6px 15px",borderRadius:999,background:"linear-gradient(180deg,rgba(9,13,20,0.88),rgba(9,13,20,0.7))",border:`1.5px solid ${floatGoal.col}`,boxShadow:`0 0 20px ${floatGoal.col}55,0 4px 14px rgba(0,0,0,0.5)`,maxWidth:"90%"}}>
                  <span style={{fontSize:isNarrow?15:18,fontWeight:900,letterSpacing:1.2,color:floatGoal.col,textShadow:`0 0 12px ${floatGoal.col},0 1px 3px rgba(0,0,0,0.9)`,textTransform:"uppercase",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}><EmoText>{floatGoal.text}</EmoText></span>{/* [7.170.0] emoji fuori dal glow (box su Android) */}
                </div>
              </div>}
              {/* Sprint 97 — pressure border */}
              {momentum<=12&&show3D&&<div style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",borderRadius:4,animation:"pressureBorderRed 2.6s ease-in-out infinite"}}/>}
              {momentum>=88&&show3D&&<div style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",borderRadius:4,animation:"pressureBorderHome 2.8s ease-in-out infinite","--ph-col":(c=>{try{const h=String(c||"#2563eb").replace("#","");const x=h.length===3?h.split("").map(q=>q+q).join(""):h;const n=parseInt(x,16);return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},0.16)`;}catch(e){return "rgba(37,99,235,0.16)";}})(scoreHomeCol||homeKitCol)}}/>}{/* [6.74.0 3D-14] alpha 0.16 come il lato rosso: prima il colore kit PIENO → pulse casa molto più marcato di quello che il PO aveva chiesto di attenuare (6.72.0) */}
              {/* Sprint 97 — pressure cinema */}
              {pressureCinema&&<div key={pressureCinema.key} style={{position:"absolute",inset:0,zIndex:23,pointerEvents:"none",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{fontSize:isNarrow?28:40,fontWeight:900,color:pressureCinema.col,letterSpacing:4,animation:"pressureDrop 1.8s ease-out forwards",textShadow:`0 0 24px ${pressureCinema.col}`,fontStyle:"italic",WebkitTextStroke:"1px rgba(255,255,255,0.5)"}}>{pressureCinema.text}</div>
              </div>}
              {goalCinema&&<div key={goalCinema.key} style={{position:"absolute",inset:0,zIndex:22,pointerEvents:"none",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:`goalShake 0.55s ease-out`}}>
                <div style={{fontSize:isNarrow?38:52,fontWeight:900,color:goalCinema.col,letterSpacing:6,animation:"goalDrop 2.6s ease-out forwards",textShadow:`0 0 30px ${goalCinema.col},0 0 60px ${goalCinema.col}`,fontStyle:"italic",WebkitTextStroke:"1px rgba(255,255,255,0.6)"}}>{goalCinema.text}</div>
                <div style={{marginTop:8,display:"flex",flexDirection:"column",alignItems:"center",gap:2,animation:"goalDrop 2.6s ease-out forwards",animationDelay:"0.15s"}}>{/* [7.112.0 collaudo PO «mostra i nomi di marcatore e assist-man durante il live match»] */}
                  <div style={{fontSize:isNarrow?16:20,color:"#fff",fontWeight:900,letterSpacing:2,textShadow:"0 2px 12px rgba(0,0,0,0.92)"}}><EmoText>{"⚽ "+(goalCinema.scorer||_surnBG(player.name||"")||"GOL")}</EmoText></div>
                  {goalCinema.assister&&<div style={{fontSize:isNarrow?11:13,color:"rgba(255,255,255,0.85)",fontWeight:700,letterSpacing:1.5,textShadow:"0 1px 7px rgba(0,0,0,0.92)"}}><EmoText>{"🅰️ Assist: "+goalCinema.assister}</EmoText></div>}
                </div>
              </div>}
              {/* [7.528.0 direttiva PO «il testo della cronaca non e' protagonista, come Football Manager»] LA RIGA
                  CORRENTE E' IN CAMPO: banner a tutta larghezza sopra il prato durante la cronaca — la telecronaca
                  si LEGGE guardando la partita, non in un feed laterale. Solo in `playing` (gli highlight hanno la
                  loro drammaturgia); la chiave sulla riga fa ripartire la dissolvenza a ogni battuta. */}
              {/* [7.536.0 collaudo PO «le indicazioni dalla panchina si accavallano» — rosso __CPM_NO548]
                  LA FASCIA BASSA E' UNA COLONNA, NON DUE QUOTE FISSE. Il banner della telecronaca ha
                  altezza VARIABILE (una riga lunga ne occupa due: e' il caso dello screenshot) mentre il
                  riquadro panchina stava a un `bottom` FISSO dell'8,5%: due scatole assolute che si
                  contendono la stessa fascia, quindi prima o poi si toccano. Ora vivono nello STESSO
                  contenitore in colonna — la panchina si appoggia SOPRA la cronaca qualunque altezza essa
                  abbia: l'accavallamento non e' corretto, e' reso IMPOSSIBILE. Col rosso la panchina torna
                  fuori dal flusso e si sovrappone di nuovo (prova del difetto). */}
              {phase==="playing"&&!paused&&(coms.length>0||coachMsg)&&(()=>{
                const _no548=(typeof window!=='undefined'&&window.__CPM_NO548);
                /* [7.543.0 collaudo PO «il salta il fischio finale sovrascrive la telecronaca»] IL TERZO
                   OCCUPANTE DELLA FASCIA BASSA. Il 7.536 aveva gia' risolto questa identica classe fra la
                   panchina e la cronaca, e la nota qui sopra lo dice: «contendono la stessa fascia, quindi
                   prima o poi si toccano — ora vivono nello STESSO contenitore in colonna, l'accavallamento
                   non e' corretto, e' reso IMPOSSIBILE». Ma il tasto SALTA non era mai stato portato dentro
                   quel ragionamento: sta in `position:absolute` a bottom 14 / right 14 con `zIndex:25`,
                   cioe' SOPRA la cronaca (zIndex 21) e nello stesso angolo. Nelle due fasi in cui compare —
                   uscito per sostituzione, oppure in panchina in attesa di entrare — copre l'ultima riga di
                   telecronaca, che e' proprio quella appena scritta.
                   Qui la fascia del tasto diventa SUA: la colonna delle voci si ferma sopra, invece di
                   passarci sotto. Nel gioco normale (nessun tasto) non cambia un pixel.
                   ⚠️ Il tasto NON si sposta: e' l'unico modo di uscire da quelle due fasi (7.132/7.135) e
                   muoverlo significherebbe rimettere le mani su due percorsi gia' collaudati dal PO. */
                const _salta543=!!(subbedOff||(benchStart&&onBench));
                return <div data-cpm="voci" style={{position:"absolute",left:"3%",right:"3%",bottom:(_salta543&&!(typeof window!=='undefined'&&window.__CPM_NO565))?60:"1.5%",zIndex:21,pointerEvents:"none",display:"flex",flexDirection:"column",alignItems:"stretch",gap:6}}>
                {coachMsg&&(
                  <div data-cpm="panchina" key={coachMsg.key} style={{...(_no548?{position:"absolute",left:0,bottom:0}:{alignSelf:"flex-start"}),pointerEvents:"none",animation:"chantPulse 6s ease-out forwards"}}>
                    <div style={{display:"inline-block",background:"rgba(10,18,12,0.9)",border:"1px solid rgba(134,239,172,0.35)",borderLeft:"3px solid #4ade80",borderRadius:8,padding:"5px 11px",maxWidth:"74vw",textAlign:"left"}}>
                      <span style={{fontSize:9,fontWeight:800,color:"#86efac",letterSpacing:1.2,textTransform:"uppercase",marginRight:7}}>Panchina</span>
                      <span style={{fontSize:12.5,fontWeight:600,color:"#d1fae5",lineHeight:1.3}}><EmoText>{coachMsg.text}</EmoText></span>
                    </div>
                  </div>
                )}
                {/* [7.669.0 collaudo PO «la telecronaca testuale sotto va eliminata»] LA STRISCIA IN
                   BASSO ESCE DI SCENA quando c'e' il racconto grande al centro (7.661): erano due volte
                   la stessa frase nello stesso schermo, e la seconda rubava spazio al campo. Resta viva
                   dove il testo centrale non c'e' (highlight, cerimonie, rigori) e sotto il rosso
                   __CPM_NO669, che la riaccende per il confronto. */}
                {coms.length>0&&coms[0]&&!(phase==="playing"&&!(typeof window!=="undefined"&&window.__CPM_NO661)&&!(typeof window!=="undefined"&&window.__CPM_NO669))&&(
                <div data-cpm="fmrow" key={"fmrow"+coms[0].t+String(coms[0].text||"").slice(0,18)} style={{pointerEvents:"none",textAlign:"center",animation:"chantPulse 5s ease-out forwards"}}>
                  <div style={{display:"inline-block",maxWidth:"100%",background:"linear-gradient(90deg,rgba(3,6,16,0),rgba(3,6,16,0.88) 12%,rgba(3,6,16,0.88) 88%,rgba(3,6,16,0))",borderRadius:10,padding:"6px 16px"}}>
                    <span style={{fontSize:10,fontWeight:800,color:"rgba(255,255,255,0.45)",marginRight:7}}>{coms[0].t}&apos;</span>
                    <span style={{fontSize:15,fontWeight:700,color:coms[0].color||"#f8fafc",lineHeight:1.35,textShadow:"0 2px 8px rgba(0,0,0,0.9)"}}>{coms[0].text}</span>{/* [7.529.0 collaudo PO «leggermente ridotto e abbassato»] 17->15, bottom 4%->1,5% — ⚠️ il commento DEVE stare in graffe: come figlio JSX nudo Babel lo rende TESTO nel banner (visto in foto cronaca-534) */}
                  </div>
                </div>
                )}
                </div>;
              })()}
              {/* [7.532.0 collaudo PO «i cori si accavallano quasi o del tutto con la cronaca testuale» — rosso
                  __CPM_NO541] IL CORO VIENE DALLA CURVA: sale nella fascia gradinate (top 20%), non piu' a
                  bottom 8% incollato al banner (bottom 1,5%). Col rosso torna dov'era. Il gate dei tick quieti
                  vive alla sorgente (fireChant). */}
              {crowdChant&&(()=>{
                const isGoal=crowdChant.type==="goal";
                const isDanger=crowdChant.type==="danger";
                const isFoul=crowdChant.type==="foul";
                const col=isGoal?(crowdChant.clubCol||"#4ade80"):isDanger?"#f87171":isFoul?"#fb923c":"#f8fafc";
                const fs=isGoal?20:13;
                const _up541=!(typeof window!=='undefined'&&window.__CPM_NO541);
                const _pos541=_up541?{top:"20%"}:{bottom:"8%"};
                /* [7.536.0 collaudo PO «i cori dei tifosi devono avere un'iconcina e scritte piu' carine,
                   sono quasi illeggibili» — rosso __CPM_NO548] IL CORO DIVENTA UNA PILLOLA. Era testo NUDO
                   (nessun fondo, 13px, maiuscole con letterSpacing 1,5) sopra le gradinate: il contrasto lo
                   reggeva solo l'alone del textShadow, e su una curva chiara e affollata l'alone non basta —
                   nella foto del PO la frase si perde nella folla. Ora: fondo scuro proprio + bordo nel
                   colore del momento + ICONCINA per tipo (la curva ha una voce riconoscibile a colpo
                   d'occhio) + corpo 15px con letterSpacing 0,8: le maiuscole molto spaziate erano parte del
                   problema di lettura, non della resa. Col rosso torna il testo nudo. */
                const _ico536=isGoal?"🎉":isDanger?"😱":isFoul?"😠":(crowdChant.type==="urgenza"?"📣":crowdChant.type==="away_goal"?"😞":"🧣");
                const _no548c=(typeof window!=='undefined'&&window.__CPM_NO548);
                const _fs536=_no548c?fs:(isGoal?20:15);
                return <div data-cpm="coro" key={crowdChant.key} style={{position:"absolute",..._pos541,left:"5%",right:"5%",textAlign:"center",animation:"chantPulse 2.8s ease-out forwards",zIndex:22,pointerEvents:"none",...(_no548c?{fontSize:fs,fontWeight:900,color:col,textShadow:`0 0 22px ${col},0 2px 10px rgba(0,0,0,0.95)`,letterSpacing:1.5,textTransform:"uppercase",padding:"5px 10px",background:isGoal?`linear-gradient(90deg,transparent,rgba(0,0,0,0.55),transparent)`:"transparent",borderRadius:8}:{})}}>
                  {_no548c?<EmoText>{crowdChant.text}</EmoText>:(
                    <span data-cpm="coro-pill" style={{display:"inline-flex",alignItems:"center",gap:8,maxWidth:"92%",background:"rgba(8,12,20,0.72)",border:`1px solid ${col}`,boxShadow:`0 2px 14px rgba(0,0,0,0.55),0 0 18px ${col}44`,borderRadius:999,padding:"6px 15px"}}>
                      <span style={{fontSize:_fs536+1,lineHeight:1}}>{_ico536}</span>
                      <span style={{fontSize:_fs536,fontWeight:900,color:col,letterSpacing:0.8,textTransform:"uppercase",lineHeight:1.25,textShadow:"0 2px 8px rgba(0,0,0,0.9)"}}><EmoText>{crowdChant.text}</EmoText></span>
                    </span>
                  )}
                </div>;
              })()}
              {/* [7.532.0 NO540 · 7.536.0] IL RIQUADRO PANCHINA vive ora nella colonna delle voci qui sopra:
                  restare qui, fuori dal flusso, era la causa dell'accavallamento segnalato dal PO. */}
              {/* [7.9.3] Kickoff hold — attesa elegante finché il CH38 non è agganciato (mai burattini in campo) */}
              {kickoffHold&&!paused&&phase==="playing"&&glbFail&&(
                <div style={{position:"absolute",inset:0,background:"rgba(5,8,20,0.94)",backdropFilter:"blur(6px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:41,padding:"0 26px",textAlign:"center"}}>
                  <div style={{fontSize:38,marginBottom:10}}>⚠️</div>
                  <div style={{fontSize:15,fontWeight:900,color:"#f59e0b",letterSpacing:1.6,textTransform:"uppercase",marginBottom:8}}>Modelli 3D non caricati</div>
                  <div style={{fontSize:12.5,color:"rgba(255,255,255,0.82)",lineHeight:1.55,maxWidth:330,marginBottom:16}}>
                    {glbFail==="error"?"Il caricamento dei giocatori non è riuscito. Controlla la connessione e riprova: la partita non parte con i modelli di ripiego.":"I giocatori ci stanno mettendo troppo a caricare (connessione lenta). Puoi riprovare senza perdere la partita."}
                  </div>
                  <button onClick={()=>{try{window.__CPM_GLB_FAIL=null;window.__CPM_GLB_READY=false;}catch(_e){}setGlbFail(null);setGlbTry(t=>t+1);}}
                    style={{padding:"12px 26px",borderRadius:11,border:"none",background:"#f59e0b",color:"#1a1206",fontWeight:900,fontSize:14,cursor:"pointer",fontFamily:"inherit",marginBottom:10}}>↻ Riprova il caricamento</button>
                  <button onClick={()=>{try{window.__CPM_GLB_FAIL=null;}catch(_e){}setGlbFail(null);setKickoffHold(false);try{if(typeof window!=='undefined'&&window.__CPM_SHOW_PROC)window.__CPM_SHOW_PROC();}catch(_e2){}}}
                    style={{padding:"9px 18px",borderRadius:9,border:"1px solid rgba(255,255,255,0.22)",background:"transparent",color:"rgba(255,255,255,0.62)",fontWeight:700,fontSize:11.5,cursor:"pointer",fontFamily:"inherit"}}>Gioca comunque senza modelli 3D</button>
                </div>)}
              {kickoffHold&&!paused&&phase==="playing"&&!glbFail&&(()=>{
                const _kh=["🟢 Le squadre completano il riscaldamento…","📋 Ultime indicazioni dei mister…","🤝 L'arbitro chiama i capitani per il sorteggio…","📸 Foto di rito e strette di mano…","🏟️ Il pubblico si prepara: ci siamo quasi…"];
                return(
                <div style={{position:"absolute",inset:0,background:"rgba(5,8,20,0.88)",backdropFilter:"blur(5px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:40}}>
                  <div style={{fontSize:34,marginBottom:8,filter:"drop-shadow(0 0 14px rgba(245,158,11,0.7))"}}>⚽</div>
                  <div style={{fontSize:15,fontWeight:900,color:"#f59e0b",letterSpacing:2.5,textTransform:"uppercase",marginBottom:10}}>Verso il fischio d'inizio</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.75)",letterSpacing:0.5,minHeight:18,textAlign:"center",padding:"0 20px"}}>{_kh[holdTick%_kh.length]}</div>
                  <div style={{marginTop:14,width:120,height:3,background:"rgba(255,255,255,0.12)",borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",width:"40%",background:"#f59e0b",borderRadius:2,animation:"pulse 1.1s ease-in-out infinite alternate"}}/>
                  </div>
                </div>);})()}
              {/* [7.338.0] TACCUINO DI COLLAUDO — campo appunti in sovraimpressione, partita ferma finché non chiudi.
                  Sta SOPRA l'overlay di pausa (z 41) e ne blocca il tap-per-riprendere: la nota viene prima. */}
              {bugNote&&(
                <div style={{position:"absolute",inset:0,background:"rgba(3,6,16,0.92)",backdropFilter:"blur(6px)",zIndex:41,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:14}} onClick={e=>e.stopPropagation()}>
                  <div style={{width:"100%",maxWidth:430,background:"#0e1524",border:"1px solid rgba(245,158,11,0.42)",borderRadius:14,padding:"14px 14px 12px",boxShadow:"0 18px 50px rgba(0,0,0,0.6)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                      <span style={{fontSize:18}}>⚠️</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12.5,fontWeight:900,color:"#f59e0b"}}>Appunto sull'azione</div>
                        <div style={{fontSize:9.5,color:"rgba(255,255,255,0.5)"}}>{bugNote.auto?"Partita in pausa · ho già abbozzato cosa ho visto":"Partita in pausa · il contesto è già registrato"}</div>
                      </div>
                    </div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,0.62)",lineHeight:1.5,background:"rgba(255,255,255,0.05)",borderRadius:8,padding:"7px 9px",marginBottom:9,fontFamily:"ui-monospace,Menlo,monospace",whiteSpace:"pre-wrap",maxHeight:120,overflowY:"auto"}}>{_bugFmt({...bugNote,txt:"…"}).replace(/\nNOTA: …$/,"")}</div>
                    {(()=>{const L=(sceneLogRef.current||[]).slice(-14).reverse();if(!L.length)return null;
                      const cur=bugNote.ctx&&bugNote.ctx.sceneKey;
                      const pick=(sc)=>{const c=_bugCtx(sc);let d="";try{d=(typeof draftBugNote==="function")?draftBugNote((window.__CPM_WATCH_SNAP&&window.__CPM_WATCH_SNAP())||null,c):"";}catch(_e){}
                        setBugNote(n=>({...n,ctx:c,txt:d,auto:!!d}));};
                      /* [7.344.0 collaudo PO «dammi la possibilita' di scegliere anche l'azione precedente: a
                         volte sfugge perche' parte quella successiva ed allarga la schermata»] Le chip stanno
                         in una striscia che scorre, e su un telefono la seconda e' gia' fuori campo: chi non sa
                         che c'e' non la cerca. I due tasti ◀ ▶ rendono il passo indietro esplicito e a portata
                         di pollice, e la riga sotto dice sempre QUALE azione stai annotando e com'e' finita. */
                      const _i=Math.max(0,L.findIndex(x=>x.key===cur));
                      const _sel=L[_i]||L[0];
                      const _lab=(sc)=>sc?`${sc.min}' ${(sc.sit||"azione").replace(/^[^\w«]+/,"").slice(0,30)}`:"";
                      return(<div style={{marginBottom:8}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                          <button onClick={()=>{if(_i<L.length-1)pick(L[_i+1]);}} disabled={_i>=L.length-1}
                            style={{flexShrink:0,padding:"7px 10px",borderRadius:9,border:"1px solid rgba(255,255,255,0.18)",background:_i>=L.length-1?"rgba(255,255,255,0.03)":"rgba(245,158,11,0.14)",color:_i>=L.length-1?"rgba(255,255,255,0.22)":"#f59e0b",fontSize:11,fontWeight:800,cursor:_i>=L.length-1?"default":"pointer"}}>◀ prec.</button>
                          <div style={{flex:1,minWidth:0,textAlign:"center"}}>
                            <div style={{fontSize:10.5,color:"#e8edf7",fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{_lab(_sel)}</div>
                            <div style={{fontSize:8.5,color:"rgba(255,255,255,0.4)"}}>{_i===0?"l'ultima":`${_i} azion${_i===1?"e":"i"} fa`}{_sel&&_sel.out?` · ${_sel.out}`:_sel&&_sel.act?" · non conclusa":""}</div>
                          </div>
                          <button onClick={()=>{if(_i>0)pick(L[_i-1]);}} disabled={_i<=0}
                            style={{flexShrink:0,padding:"7px 10px",borderRadius:9,border:"1px solid rgba(255,255,255,0.18)",background:_i<=0?"rgba(255,255,255,0.03)":"rgba(245,158,11,0.14)",color:_i<=0?"rgba(255,255,255,0.22)":"#f59e0b",fontSize:11,fontWeight:800,cursor:_i<=0?"default":"pointer"}}>succ. ▶</button>
                        </div>
                        <div style={{fontSize:9,color:"rgba(255,255,255,0.42)",marginBottom:4}}>Quale azione? (la registrazione copre tutta la partita)</div>
                        <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:2}}>
                          {L.map((sc,i)=>(
                            <button key={sc.key} onClick={()=>pick(sc)} style={{flexShrink:0,padding:"5px 9px",borderRadius:14,border:`1px solid ${sc.key===cur?"#f59e0b":"rgba(255,255,255,0.18)"}`,background:sc.key===cur?"rgba(245,158,11,0.16)":"transparent",color:sc.key===cur?"#fbbf24":"rgba(255,255,255,0.62)",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",maxWidth:170,overflow:"hidden",textOverflow:"ellipsis"}}>
                              {sc.min}&apos; {i===0?"(ora) ":""}{(sc.sit||"azione").replace(/^[^\w«]+/,"").slice(0,22)}
                            </button>))}
                        </div>
                      </div>);})()}
                    {/* [7.508.0 collaudo PO «creami dei pulsanti rapidi nel taccuino»] I CODICI SONO CHIP.
                        La legenda dei codici e' del PO (000 gesti · 001 apertura · 002 posizione eroe ·
                        007 traballa · 008 palla da sola · 111 portiere) e finora andava scritta a mano
                        sul telefono, in pausa, a memoria. Un tocco appende la riga etichettata alla nota
                        — e siccome la nota diventa non-vuota, il flusso minimo e' TRE tocchi:
                        ⚠️ → codice → salva. Il testo resta editabile: la chip aiuta, non ingabbia.
                        Idempotente per codice (secondo tocco: nessun doppione), evidenziata se il codice
                        e' gia' nel testo (anche se ce l'ha messo l'auto-bozza del 007). */}
                    {(()=>{const _CODES94=[["007","camera traballa"],["003","esito bugiardo"],["011","palla congelata"],["012","verticalizzazione all'indietro"],["004","gesto senza preparazione"],["005","palla da biliardo"],["006","reparto fermo"],["009","direzione sbagliata"],["010","pattinata"],["001","apertura scena"],["002","eroe fuori posizione"],["000","gesto scoordinato"],["014","palla flipper"],["111","portiere fuori tempo"],["113","portiere doppio gesto"],["008","palla da sola (chiuso)"]];/* [7.524.0 direttiva PO «aggiungi anche nuovi codici: es. azione confusa: palla si freeza e poi riprende la corsa in maniera anomala. verticalizzazione all'indietro ecc»] DUE CODICI NUOVI, in testa tra i caldi: 011 PALLA CONGELATA (freeze + ripresa anomala — la bozza etichetta gia' 011 la riga «palla FERMA con arco vivo») · 012 VERTICALIZZAZIONE ALL'INDIETRO (lancio/consegna dichiarati in avanti che viaggiano verso la propria porta — la bozza etichetta 012 la riga «tornato INDIETRO»). *//* [7.521.0 collaudo PO, OK esplicito] SETTE CODICI NUOVI dalla lettura del taccuino reale: 003 esito!=3D («goal_against ma palla a 52u» · «miss in rete») · 004 preRoll assente · 005 traiettorie innaturali · 006 nessuna reazione di reparto · 009 gesto specchiato (la sforbiciata al contrario) · 010 locomozione che scivola (collauda il 7.518) · 113 tuffo doppio (distinto da 111/112: gesto ripetuto vs fuori tempo). Ordine: i collaudi CALDI per primi (007+famiglie restyling); 008 in coda marcato chiuso — se ricompare e' una REGRESSIONE e la nota vale doppio. */
                      return(<div style={{marginBottom:6}}>
                        <div style={{fontSize:9,color:"rgba(255,255,255,0.42)",marginBottom:4}}>Codici rapidi (un tocco aggiunge la riga)</div>
                        <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:2}}>
                          {_CODES94.map(([cd,lb])=>{const _on94=(bugNote.txt||"").indexOf("codice "+cd)>=0;
                            return(<button key={cd} onClick={()=>{setBugNote(n=>{const t=n.txt||"";if(t.indexOf("codice "+cd)>=0)return n;const _r94="codice "+cd+" — "+lb;return{...n,txt:t.trim()?t.replace(/\s+$/,"")+"\n"+_r94:_r94};});}}
                              style={{flexShrink:0,padding:"7px 10px",borderRadius:14,border:`1px solid ${_on94?"#f59e0b":"rgba(255,255,255,0.16)"}`,background:_on94?"rgba(245,158,11,0.16)":"rgba(255,255,255,0.05)",color:_on94?"#fbbf24":"rgba(255,255,255,0.72)",fontSize:9.5,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit",lineHeight:1}}>
                              {cd} · {lb}</button>);})}
                        </div>
                      </div>);})()}
                    <textarea autoFocus value={bugNote.txt} onChange={e=>setBugNote(n=>({...n,txt:e.target.value}))} rows={3}
                      placeholder="Cosa non va in questa azione? (es. il pallone torna indietro dopo il cross)"
                      style={{width:"100%",boxSizing:"border-box",background:"#060b16",color:"#e8edf7",border:"1px solid rgba(255,255,255,0.16)",borderRadius:9,padding:"9px 10px",fontSize:12.5,fontFamily:"inherit",resize:"vertical",lineHeight:1.45}}/>
                    <div style={{display:"flex",gap:7,marginTop:9}}>
                      <button onClick={()=>_bugSave(true)} disabled={!bugNote.txt.trim()} style={{flex:1,padding:"10px 8px",borderRadius:9,border:"none",background:bugNote.txt.trim()?"#f59e0b":"rgba(255,255,255,0.10)",color:bugNote.txt.trim()?"#1a1206":"rgba(255,255,255,0.35)",fontWeight:800,fontSize:12,cursor:bugNote.txt.trim()?"pointer":"default",fontFamily:"inherit"}}>📋 Salva e copia</button>
                      <button onClick={()=>_bugSave(false)} disabled={!bugNote.txt.trim()} style={{flex:1,padding:"10px 8px",borderRadius:9,border:"1px solid rgba(255,255,255,0.22)",background:"transparent",color:bugNote.txt.trim()?"#e8edf7":"rgba(255,255,255,0.35)",fontWeight:700,fontSize:12,cursor:bugNote.txt.trim()?"pointer":"default",fontFamily:"inherit"}}>Salva</button>
                      <button onClick={()=>{setBugNote(null);setPaused(false);}} style={{padding:"10px 12px",borderRadius:9,border:"1px solid rgba(255,255,255,0.16)",background:"transparent",color:"rgba(255,255,255,0.55)",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Annulla</button>
                    </div>
                    <div style={{fontSize:9,color:"rgba(255,255,255,0.34)",marginTop:7,textAlign:"center"}}>Li ritrovi tutti in Carriera → Profilo → 🐞 Appunti di collaudo</div>
                  </div>
                </div>)}
              {/* Pause overlay */}
              {paused&&!bugNote&&["playing","hl_intro","hl_move","hl_choose","hl_result"].includes(phase)&&(
                <div style={{position:"absolute",inset:0,background:"rgba(5,8,20,0.78)",backdropFilter:"blur(4px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:30,cursor:"pointer"}} onClick={()=>setPaused(false)}>
                  <div style={{fontSize:38,marginBottom:6,filter:"drop-shadow(0 0 16px rgba(245,158,11,0.8))"}}>⏸</div>
                  <div style={{fontSize:18,fontWeight:900,color:"#f59e0b",letterSpacing:3,textTransform:"uppercase",marginBottom:8}}>PAUSA</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.45)",letterSpacing:1}}>Premi P o tocca per riprendere</div>
                </div>
              )}
              {/* HL intro stays on field as cinematic overlay */}
              {phase==="hl_intro"&&curSit&&(
                <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at center, rgba(5,8,20,0.42) 0%, rgba(5,8,20,0.74) 100%)",backdropFilter:"blur(2px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:8,padding:"0 14px",cursor:"pointer"}} onClick={startHL}>
                  <div style={{fontSize:22,marginBottom:8}}>⚽</div>
                  <div style={{fontSize:15,fontWeight:900,color:"#f59e0b",textAlign:"center",marginBottom:8,textShadow:"0 0 20px #f59e0b"}}>{intentTitle(curSit.text,curSit.intent,_scoreDiff)}</div>
                  {intentIntro(curSit.intro,_scoreDiff)&&<div style={{fontSize:11,color:"rgba(255,255,255,0.75)",textAlign:"center",fontStyle:"italic",marginBottom:10,lineHeight:1.4}}>{intentIntro(curSit.intro,_scoreDiff)}</div>}
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>{curSit.type==="def"?"🛡️ DIFESA":"⚔️ ATTACCO"}</div>
                  <div style={{width:90,height:2,background:"rgba(255,255,255,0.15)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",background:"#f59e0b",animation:"shrinkBar 2.5s linear forwards"}}/></div>
                  <div style={{fontSize:8,color:"rgba(255,255,255,0.2)",marginTop:6}}>{isNarrow?"Tocca per iniziare":"Tocca / Enter per iniziare"}</div>
                </div>
              )}
              {/* Sprint 118 — Bench experience: live watching → warmup → entry instructions */}
              {phase==="playing"&&onBench&&(()=>{
                const isEntering=benchPhase==="entering";
                const isWarmup=benchPhase==="warmup";
                const obsMsg=_BENCH_OBS[clock%_BENCH_OBS.length];
                const warmMsg=_BENCH_WARMUP[Math.floor(clock/3)%_BENCH_WARMUP.length];
                // [6.68.0] la riga del mister era pick() RANDOM → rigenerata a OGNI render (tick 300ms + update di stato) durante i ~4.6s d'ingresso
                //   → le indicazioni «scorrevano velocissime». Ora scelta STABILE (seed nome+minuto d'ingresso): UNA sola indicazione, ferma per tutta la scena.
                const entryMsg=_BENCH_ENTRY[hashStr((player.name||"x")+"_"+benchMinute)%_BENCH_ENTRY.length];
                /* [7.145.0 collaudo PO «incongruenza nel sotto-risultato pre sostituzione, tra l'altro ridondante: già
                   scritto sopra!»] la riga punteggio dei banner panchina/sostituito è RIMOSSA: era ridondante (lo
                   scoreboard in alto mostra già punteggio e minuto) e per giunta INVERTITA in trasferta — i nomi erano
                   mappati per sede (isMatchHome) ma score.home/away sono in convenzione MESH (home = squadra dell'eroe,
                   lezione 7.52.2 sulle due convenzioni «home») → «BRG 0–2 SAL» con il tabellone a 2–0. */
                // item 2 (5.49.6): durante l'ingresso l'overlay NON copre più il 3D — la sequenza dell'eroe (si alza → indicazioni → linea → entra)
                //   si vede in campo. Solo un lower-third cinematografico con i "beat" narrativi temporizzati.
                if(isEntering)return(
                  <div style={{position:"absolute",left:0,right:0,bottom:"9%",zIndex:9,pointerEvents:"none",display:"flex",justifyContent:"center",padding:"0 18px",animation:"logoIn 0.5s ease-out"}}>
                    <div style={{background:"linear-gradient(180deg,rgba(8,12,24,0.78),rgba(8,12,24,0.62))",border:"1px solid rgba(245,158,11,0.35)",borderRadius:12,padding:"10px 18px",textAlign:"center",maxWidth:340,boxShadow:"0 8px 30px rgba(0,0,0,0.5)"}}>
                      <div style={{fontSize:10,fontWeight:800,color:"#f59e0b",letterSpacing:2,textTransform:"uppercase",marginBottom:3}}>⚡ Sostituzione · {clock}'</div>
                      <div style={{fontSize:14,fontWeight:900,color:"#fff",marginBottom:2}}>Entri in campo, #{player.jerseyNum||10} {_surnBG(player.name||"")||""}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,0.72)",fontStyle:"italic",lineHeight:1.5}}>{entryMsg}</div>
                    </div>
                  </div>
                );
                // [7.132.0 collaudo PO «la scena 3D è coperta dal livello nero col tasto Salta; gestiscilo come la premiazione»]
                //   da SOSTITUITO NIENTE overlay nero a schermo pieno: banner in alto (pointer-events off, non copre il campo)
                //   + tasto Salta in basso a destra IDENTICO a quello della premiazione → il finale si vede in 3D.
                if(subbedOff)return(
                  <React.Fragment>
                    <div style={{position:"absolute",top:0,left:0,right:0,zIndex:9,pointerEvents:"none",padding:"12px 12px",textAlign:"center",background:"linear-gradient(180deg,rgba(8,12,24,0.82),rgba(8,12,24,0))"}}>
                      <div style={{fontSize:isNarrow?13:15,letterSpacing:2.5,color:sentOffRef.current?"#fca5a5":"#e2e8f0",fontWeight:900,textTransform:"uppercase",textShadow:"0 2px 10px rgba(0,0,0,0.6)"}}>{sentOffRef.current?"🟥 ESPULSO AL":"🔁 SOSTITUITO AL"} {subOffMinRef.current}'</div>{/* [7.137.0] espulsione reale → ESPULSO · [7.145.0] via la riga punteggio (ridondante + invertita in trasferta) */}
                      <div style={{fontSize:11,color:"rgba(255,255,255,0.72)",fontStyle:"italic",marginTop:3}}>{sentOffRef.current?"Lasci il campo — la squadra chiude in dieci. Squalifica in arrivo.":"Segui il finale dalla panchina — la squadra chiude la partita per te."}</div>
                    </div>
                    <button onClick={()=>{clockRef.current=Math.max(clockRef.current,89);setClock(c=>Math.max(c,89));}} data-cpm="salta" style={{position:"absolute",bottom:14,right:14,zIndex:25,padding:"9px 16px",borderRadius:22,border:"1px solid rgba(255,255,255,0.35)",background:"rgba(0,0,0,0.45)",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",backdropFilter:"blur(4px)",fontFamily:"inherit"}}>Salta al fischio finale →</button>
                  </React.Fragment>
                );
                // [7.135.0 collaudo PO «anche quando inizio dalla panchina togliere il livello nero e fare il tasto salta
                //   come la premiazione e uscita dal campo»] la panchina di PARTENZA (A DISPOSIZIONE / RISCALDAMENTO)
                //   non copre più il campo con l'overlay nero: banner in alto (pointer-events off) + tasto «Salta» in basso
                //   a destra IDENTICO a premiazione/uscita → guardi il match in 3D mentre aspetti di entrare. (subbedOff
                //   è già gestito sopra → qui è sempre la panchina d'attesa).
                return(
                  <React.Fragment>
                    <div style={{position:"absolute",top:0,left:0,right:0,zIndex:9,pointerEvents:"none",padding:"12px 12px",textAlign:"center",background:"linear-gradient(180deg,rgba(8,12,24,0.82),rgba(8,12,24,0))"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:3}}>
                        <div style={{width:8,height:8,borderRadius:"50%",background:isWarmup?"#f59e0b":"#94a3b8",boxShadow:isWarmup?"0 0 8px #f59e0b":undefined,animation:isWarmup?"pulse 1.2s infinite":undefined}}/>
                        <div style={{fontSize:isNarrow?12:14,letterSpacing:2.5,fontWeight:900,textTransform:"uppercase",color:isWarmup?"#f59e0b":"#e2e8f0",textShadow:"0 2px 10px rgba(0,0,0,0.6)"}}>{isWarmup?"RISCALDAMENTO":"A DISPOSIZIONE"}</div>
                      </div>{/* [7.145.0] via la riga punteggio (ridondante + invertita in trasferta) */}
                      <div style={{fontSize:11,color:"rgba(255,255,255,0.72)",fontStyle:"italic",lineHeight:1.4,maxWidth:340,margin:"3px auto 0"}}>{isWarmup?warmMsg:(benchReason||obsMsg)}</div>
                    </div>
                    <button onClick={()=>{clockRef.current=benchMinute;setClock(benchMinute);setBenchPhase("entering");}} data-cpm="salta" style={{position:"absolute",bottom:14,right:14,zIndex:25,padding:"9px 16px",borderRadius:22,border:"1px solid rgba(255,255,255,0.35)",background:"rgba(0,0,0,0.45)",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",backdropFilter:"blur(4px)",fontFamily:"inherit"}}>Salta l'attesa →</button>
                  </React.Fragment>
                );
              })()}
              {/* Sprint 34 — Sub event banner */}
              {phase==="playing"&&subEvent&&(
                <div style={{position:"absolute",top:"12%",left:"4%",right:"4%",zIndex:7,background:"rgba(5,8,20,0.84)",backdropFilter:"blur(4px)",borderRadius:10,padding:"8px 12px",border:"1px solid rgba(255,255,255,0.10)",textAlign:"center",pointerEvents:"none"}}>
                  <div style={{fontSize:11,color:"#e2e8f0",fontWeight:700,lineHeight:1.4}}>{subEvent}</div>
                </div>
              )}
              {/* Tactic moment: il mister decide in automatico, notifica via addCom */}
              {/* Progress bar inside field bottom */}
              {show3D&&<div style={{position:"absolute",bottom:0,left:0,right:0,height:3,background:"rgba(255,255,255,0.1)"}}>
                <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,"+TH.success+","+TH.warning+")",transition:"width .3s"}}/>
              </div>}

              {/* Mobile HL overlay — DPad + actions on canvas, narrow only */}
              {isNarrow&&phase==="hl_move"&&curSit&&(
                <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:16,background:"rgba(5,8,20,0.28)",padding:"8px 10px 10px"}}>
                  <div style={{color:"#f59e0b",fontSize:10,fontWeight:800,textShadow:"0 1px 4px rgba(0,0,0,0.9)",marginBottom:5}}>{clock}' — {intentTitle(curSit.text,curSit.intent,_scoreDiff)}</div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    {showDPad(curSit)&&<DPad onMove={handleDPad} dark size={40}/>}
                    <div style={{flex:1}}>
                      {curSit.maxMoves>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:"rgba(255,255,255,0.7)",textShadow:"0 1px 3px rgba(0,0,0,0.8)",marginBottom:3}}><span>{"●".repeat(movesLeft)}{"○".repeat(Math.max(0,curSit.maxMoves-movesLeft))} {movesLeft} mov</span><span>⏱ {Math.round(pressureBar*100)}%</span></div>}
                      {curSit.maxMoves>0&&<div style={{height:3,background:"rgba(255,255,255,0.2)",borderRadius:2}}><div style={{height:"100%",width:(pressureBar*100)+"%",background:pressureBar>0.4?"#f59e0b":pressureBar>0.2?"#f97316":"#ef4444",borderRadius:2,transition:"width 0.1s"}}/></div>}
                      <div style={{fontSize:8,color:"rgba(255,255,255,0.6)",textShadow:"0 1px 3px rgba(0,0,0,0.8)",marginTop:3}}>📍 {ZONES[zone]?.label}</div>
                    </div>
                    <button onClick={()=>setPhase("hl_choose")} style={{padding:"10px 12px",borderRadius:8,border:"none",background:"#2563eb",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit",flexShrink:0,boxShadow:"0 2px 8px rgba(0,0,0,0.5)"}}>✅</button>
                  </div>
                </div>
              )}
              {isNarrow&&phase==="hl_choose"&&curSit&&(
                <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:16,background:"rgba(5,8,20,0.28)",padding:"8px 10px 10px"}}>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.75)",fontWeight:700,textShadow:"0 1px 3px rgba(0,0,0,0.9)",marginBottom:5}}>{clock}' — {intentTitle(curSit.text,curSit.intent,_scoreDiff)} &nbsp;·&nbsp; <span style={{color:defDist<25?"#f87171":defDist<50?"#f97316":"#4ade80"}}>{defDist<25?"⚠ Addosso":defDist<50?"Vicino":"Libero"}</span>&nbsp;·&nbsp;<span style={{color:energy>50?"#4ade80":energy>25?"#f59e0b":"#f87171"}}>⚡{energy}</span></div>
                  {(+(safeLS.get("cpm-hl-tips")||0))<5&&<div style={{fontSize:9,color:"rgba(255,255,255,0.75)",background:"rgba(37,99,235,0.35)",borderRadius:6,padding:"5px 8px",marginBottom:6}}>💡 Muoviti col pad per cambiare le opzioni d'azione.</div>}{/* [5.84.0 UX-2c] micro-onboarding one-shot (primi 5 HL del device) */}
                  <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                    {!curSit.lockMovement&&!hideDirCursor(curSit)&&<div style={{flexShrink:0,opacity:movesLeft>0?1:0.35,filter:movesLeft>0?"none":"grayscale(1)"}}><DPad onMove={movesLeft>0?handleDPad:()=>{}} dark size={40}/></div>}{/* [5.90.0 FIX PO] a mosse esaurite il pad resta come SCUDO disabilitato: smontarlo faceva slittare i bottoni azione sotto il dito → l'azione partiva "da sola" */}
                    {isAimSit(curSit)?(
                      <div style={{flex:1,display:"flex",flexDirection:"column",gap:5}}>{/* [7.51.0 SET-PIECE 2.0] scelte di STILE al posto della griglia di mira */}
                        {setPieceOptions(curSit,player,pPos.x).map((o)=>(
                          <button key={o.id} onClick={()=>handleSetPiece(o)} style={{padding:"8px 10px",background:"rgba(0,0,0,0.55)",border:"1px solid rgba(255,255,255,0.25)",borderRadius:8,color:"#fff",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                            <div style={{fontSize:11,fontWeight:800}}>{o.icon} {o.label}</div>
                            <div style={{fontSize:8.5,color:"rgba(255,255,255,0.65)",marginTop:2,lineHeight:1.35}}>{o.desc}</div>
                          </button>
                        ))}
                      </div>
                    ):(
                      <div style={{flex:1,display:"flex",flexDirection:"column",gap:5}}>
                        {filterSitActions(curSit.actions||[],pPos.x,curSit).map((a,_oi,_arr)=>{
                          const _dp2=defDist<25?15:defDist<50?8:0;
                          const _rt2=Math.max(5,succRate(a,player.stats,pPos.x,oppPrestige,player.archetype?.id||player.archetype)-_dp2);
                          const _rc2=_rt2>70?"#4ade80":_rt2>50?"#f59e0b":"#f87171";
                          const _sel2=_oi===selectedActionIdx;
                          return(
                            <button key={_oi} onClick={()=>handleAction(a)}
                              style={{padding:"10px",background:_sel2?"rgba(37,99,235,0.65)":"rgba(0,0,0,0.55)",border:_sel2?`1.5px solid ${_rc2}88`:`1px solid ${_rc2}44`,borderRadius:8,color:"#fff",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:8,transition:"all .1s",boxShadow:"0 2px 6px rgba(0,0,0,0.4)"}}>
                              <div style={{width:18,height:18,borderRadius:"50%",background:_sel2?"#2563eb":"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:"#fff",flexShrink:0}}>{_oi+1}</div>
                              <div style={{fontSize:11,fontWeight:700,color:"#fff",flex:1,textAlign:"left",textShadow:"0 1px 3px rgba(0,0,0,0.7)"}}>{intentLabelDedup(a.label,_oi,_arr)}</div>
                              {/* [5.93.0] pallini probabilita RIMOSSI su direttiva PO: condizionavano il player */}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {isNarrow&&phase==="hl_result"&&outcome&&!resultReveal&&(
                <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:16,background:"rgba(5,8,20,0.45)",padding:"12px 12px 14px"}}>
                  <div style={{fontSize:12,fontWeight:800,color:"rgba(255,255,255,0.85)",textShadow:"0 1px 4px rgba(0,0,0,0.8)"}}>⏳ {chosenAct?.label}<span style={{opacity:0.5}}>…</span></div>
                </div>
              )}{/* [5.92.0 FIX PO] SUSPENSE: prima si guarda il 3D, l'esito appare al reveal */}
              {isNarrow&&phase==="hl_result"&&outcome&&resultReveal&&(
                <div onClick={()=>{if(Date.now()-(resultShownRef.current||0)>800)handleContinue();}} style={{position:"absolute",bottom:0,left:0,right:0,zIndex:16,background:outcome.outKey==="foul"?"rgba(40,20,0,0.72)":outcome.ok?"rgba(5,50,20,0.55)":"rgba(50,5,5,0.55)",padding:"10px 12px 12px",cursor:"pointer"}}>{/* [5.84.0 UX-3] tap per continuare (prima solo attesa forzata 2-3.4s ×8 HL) */}
                  {outcome.outKey==="foul"&&<div style={{display:"flex",alignItems:"center",gap:5,marginBottom:5}}><div style={{width:10,height:14,background:"#fb923c",borderRadius:2,boxShadow:"0 0 8px rgba(251,146,60,0.9)",animation:"goalDrop 0.3s ease-out"}}/><span style={{fontSize:11,fontWeight:900,color:"#fb923c",letterSpacing:1,textTransform:"uppercase"}}>FALLO</span></div>}
                  {outcome.overlay&&<div style={{fontSize:16,fontWeight:900,letterSpacing:0.3,color:outcome.outKey==="foul"?"#fb923c":outcome.ok?"#4ade80":outcome.overlayTone==="neutral"?"#cbd5e1":"#fca5a5",marginBottom:2,textShadow:"0 1px 5px rgba(0,0,0,0.85)"}}><EmoText>{(outcome.outKey!=="foul"&&outcome.overlayIcon?outcome.overlayIcon+" ":"")+outcome.overlay}</EmoText></div>}{/* [7.136.0] iconcina d'esito prima del titolo (foul ha già il badge FALLO) · [7.170.0] emoji senza box-shadow Android */}
                  <div style={{fontSize:12,fontWeight:700,color:outcome.outKey==="foul"?"#fb923c":outcome.ok?"#4ade80":"#f87171",marginBottom:3,opacity:0.92,textShadow:"0 1px 4px rgba(0,0,0,0.8)"}}><EmoText>{(outcome.ok?"✅ ":"❌ ")+(chosenAct?.label||"")}</EmoText></div>
                  <div style={{fontSize:11,color:"#fff",lineHeight:1.4,marginBottom:4,textShadow:"0 1px 3px rgba(0,0,0,0.7)"}}><EmoText>{outcome.text}</EmoText></div>
                  {outcome.cause&&<div style={{fontSize:10,fontWeight:700,color:outcome.ok?"#86efac":"#fdba74",marginBottom:3,textShadow:"0 1px 3px rgba(0,0,0,0.8)"}}><EmoText>{outcome.cause}</EmoText></div>}{/* [5.84.0 UX-2b] */}
                  {aiCommentary&&<div style={{fontSize:10,color:"rgba(255,255,255,0.8)",fontStyle:"italic",textShadow:"0 1px 3px rgba(0,0,0,0.7)"}}><EmoText>{(aiCommentary.reaction||"")+" "+(aiCommentary.commentary||"")}</EmoText></div>}
                </div>
              )}

            </div>

            {/* RIGHT: info + action panel — desktop only for HL controls */}
            <div style={isNarrow?(["hl_move","hl_choose","hl_result","hl_intro"].includes(phase)?{display:"none"}:{background:"#0f172a",borderTop:"1px solid rgba(255,255,255,0.10)"}):{flex:1,display:"flex",flexDirection:"column",background:"#0f172a",borderLeft:"1px solid rgba(255,255,255,0.08)",minWidth:180,overflow:"hidden"}}>

              {/* Action zone — desktop only (mobile has overlay on canvas) */}
              {!isNarrow&&phase==="hl_move"&&curSit&&(
                <div style={{padding:"8px 10px",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                  <div style={{color:"#f59e0b",fontSize:10,fontWeight:700,marginBottom:5}}>{clock}' — {intentTitle(curSit.text,curSit.intent,_scoreDiff)}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                    {showDPad(curSit)&&<DPad onMove={handleDPad} dark size={isNarrow?52:42}/>}
                    <div style={{flex:1}}>
                      <div style={{fontSize:8,color:"rgba(255,255,255,0.4)",marginBottom:3}}>📍 {ZONES[zone]?.label}{!isNarrow?" · WASD":""}</div>
                      {curSit.maxMoves>0&&<div style={{fontSize:10,color:"#60a5fa",fontWeight:700,marginBottom:3}}>{"●".repeat(movesLeft)}{"○".repeat(Math.max(0,curSit.maxMoves-movesLeft))} {movesLeft} mov</div>}
                      {curSit.maxMoves>0&&(
                        <div style={{marginBottom:4}}>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:7,color:"rgba(255,255,255,0.3)",marginBottom:2}}><span>⏱ Pressione</span><span>{Math.round(pressureBar*100)}%</span></div>
                          <div style={{height:3,background:"rgba(255,255,255,0.12)",borderRadius:2}}>
                            <div style={{height:"100%",width:(pressureBar*100)+"%",background:pressureBar>0.4?"#f59e0b":pressureBar>0.2?"#f97316":"#ef4444",borderRadius:2,transition:"width 0.1s"}}/>
                          </div>
                        </div>
                      )}
                      {curSit.maxMoves>0&&(
                        <div>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:7,color:"rgba(255,255,255,0.3)",marginBottom:2}}>
                            <span>🏃 Difensore</span>
                            <span style={{color:defDist<25?"#f87171":defDist<50?"#f97316":"#4ade80"}}>{defDist<25?"⚠ Addosso":defDist<50?"Vicino":"Lontano"}</span>
                          </div>
                          <div style={{height:3,background:"rgba(255,255,255,0.12)",borderRadius:2}}>
                            <div style={{height:"100%",width:(defDist)+"%",background:defDist>50?"#4ade80":defDist>25?"#f97316":"#ef4444",borderRadius:2,transition:"width 0.1s"}}/>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {phase==="hl_move"&&<button onClick={()=>setPhase("hl_choose")} style={{width:"100%",padding:"7px",borderRadius:7,border:"none",background:"#2563eb",color:"#fff",fontWeight:800,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>✅ Pronto [0]</button>}
                </div>
              )}

              {/* hl_choose — desktop only (mobile has overlay on canvas) */}
              {!isNarrow&&phase==="hl_choose"&&curSit&&(
                <div style={{padding:"8px 8px",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                  <div style={{fontSize:8,color:"rgba(255,255,255,0.45)",marginBottom:4}}>{clock}' — {intentTitle(curSit.text,curSit.intent,_scoreDiff)}</div>
                  {/* DPad still visible in hl_choose when moves remain */}
                  {showDPad(curSit)&&(
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                      <DPad onMove={handleDPad} dark size={isNarrow?52:42}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:8,color:"rgba(255,255,255,0.4)",marginBottom:2}}>📍 {ZONES[zone]?.label}</div>
                        <div style={{fontSize:10,color:"#60a5fa",fontWeight:700}}>{"●".repeat(movesLeft)}{"○".repeat(Math.max(0,curSit.maxMoves-movesLeft))} {movesLeft} mov</div>
                      </div>
                    </div>
                  )}
                  {/* Defender pressure badge */}
                  <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:5,padding:"3px 6px",borderRadius:5,background:defDist<25?"rgba(239,68,68,0.2)":defDist<50?"rgba(249,115,22,0.15)":"rgba(74,222,128,0.1)",border:`1px solid ${defDist<25?"rgba(239,68,68,0.4)":defDist<50?"rgba(249,115,22,0.3)":"rgba(74,222,128,0.2)"}`}}>
                    <span style={{fontSize:10}}>{defDist<25?"⚠️":"🏃"}</span>
                    <span style={{fontSize:8,color:defDist<25?"#f87171":defDist<50?"#f97316":"#4ade80",fontWeight:700}}>{defDist<25?"Difensore addosso!":defDist<50?"Pressione alta":"Spazio libero"}</span>
                    {defDist<50&&<span style={{fontSize:7,color:"rgba(255,255,255,0.3)",marginLeft:"auto"}}>–{Math.round((100-defDist)*0.15)}% azioni</span>}
                  </div>
                  {!isNarrow&&!isAimSit(curSit)&&<div style={{fontSize:8,color:"rgba(255,255,255,0.3)",marginBottom:5,textAlign:"center"}}>
                    <strong style={{color:"#f59e0b"}}>1 · 2 · 3</strong> &nbsp;|&nbsp; Enter
                  </div>}{/* [6.44.0] niente hint tastiera sui rigori/punizioni · [6.45.0 RC] via «←→»: la navigazione con le frecce non era mai stata implementata (selectedActionIdx mai aggiornato) → hint fuorviante */}
                  {(+(safeLS.get("cpm-hl-tips")||0))<5&&<div style={{fontSize:9,color:"rgba(255,255,255,0.7)",background:"rgba(37,99,235,0.25)",borderRadius:6,padding:"5px 8px",marginBottom:6}}>💡 Muoviti (WASD) per cambiare le opzioni d'azione.</div>}{/* [5.84.0 UX-2c] */}
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {isAimSit(curSit)?(
                      <div>
                        <div style={{fontSize:10,color:"rgba(255,255,255,0.45)",textAlign:"center",marginBottom:8,fontStyle:"italic"}}>🤫 Silenzio. Solo tu e il portiere.</div>
                        <div style={{display:"flex",flexDirection:"column",gap:5}}>{/* [7.51.0 SET-PIECE 2.0] scelte di STILE al posto della griglia di mira */}
                          {setPieceOptions(curSit,player,pPos.x).map((o)=>(
                            <button key={o.id} onClick={()=>handleSetPiece(o)}
                              style={{padding:"9px 12px",background:"rgba(0,0,0,0.6)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:8,color:"#fff",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                              <div style={{fontSize:12,fontWeight:800}}>{o.icon} {o.label}</div>
                              <div style={{fontSize:9,color:"rgba(255,255,255,0.55)",marginTop:2,lineHeight:1.35}}>{o.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ):filterSitActions(curSit.actions||[],pPos.x,curSit).map((a,i,_arr)=>{
                      // Defender proximity reduces success rate
                      const defPenalty=Math.round(15*clamp((64-defDist)/52,0,1));/* [7.316.0] stessa rampa continua del motore (era la scala a gradini 15/8/0): il colore del bottone segue la marcatura invece di scattare a soglie invisibili */
                      const rate=Math.max(5,succRate(a,player.stats,pPos.x,oppPrestige,player.archetype?.id||player.archetype)-defPenalty);
                      const rc=rate>70?"#4ade80":rate>50?"#f59e0b":"#f87171";
                      const isSel=i===selectedActionIdx;
                      return(
                        <button key={i} onClick={()=>handleAction(a)}
                          style={{padding:isNarrow?"12px 10px":"8px 10px",background:isSel?"rgba(37,99,235,0.45)":"rgba(0,0,0,0.52)",border:isSel?`1.5px solid ${rc}66`:`1px solid ${rc}33`,borderRadius:8,color:"#fff",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"space-between",transition:"all .1s",transform:isSel?"scale(1.02)":"scale(1)"}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <div style={{width:18,height:18,borderRadius:"50%",background:isSel?"#2563eb":"rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:isSel?"#fff":"rgba(255,255,255,0.5)",flexShrink:0}}>{i+1}</div>
                            <div style={{fontSize:11,fontWeight:isSel?700:400,color:"#e2e8f0",textAlign:"left"}}>{intentLabelDedup(a.label,i,_arr)}</div>
                          </div>
                          {/* [5.93.0] pallini probabilita RIMOSSI su direttiva PO */}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* hl_result — desktop only (mobile has overlay on canvas) */}
              {!isNarrow&&phase==="hl_result"&&outcome&&!resultReveal&&(
                <div style={{padding:"12px 10px"}}><div style={{fontSize:12,fontWeight:800,color:TH.text,opacity:0.8}}>⏳ {chosenAct?.label}<span style={{opacity:0.5}}>…</span></div></div>
              )}
              {!isNarrow&&phase==="hl_result"&&outcome&&resultReveal&&(
                <div style={{padding:"10px",background:outcome.ok?"rgba(5,50,20,0.7)":"rgba(50,5,5,0.7)",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                  <div style={{fontSize:14,fontWeight:900,color:outcome.ok?"#4ade80":"#f87171",marginBottom:4}}>{outcome.ok?"✅":"❌"} {chosenAct?.label}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.8)",lineHeight:1.4,marginBottom:4}}>{outcome.text}</div>
                  {outcome.cause&&<div style={{fontSize:10,fontWeight:700,color:outcome.ok?"#86efac":"#fdba74",marginBottom:4}}>{outcome.cause}</div>}{/* [5.84.0 UX-2b] */}
                  {aiCommentary&&<div style={{fontSize:10,color:"rgba(255,255,255,0.55)",fontStyle:"italic",marginBottom:4}}>{aiCommentary.reaction} {aiCommentary.commentary}</div>}
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>{isNarrow?"auto →":"auto / Enter →"}</div>
                </div>
              )}

              {/* Stats grid — desktop only (mobile has compact stats bar in cronaca section below) */}
              {!isNarrow&&<div style={{padding:"8px 10px",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 8px"}}>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:18,fontWeight:900,color:"#4ade80",lineHeight:1}}>{mStats.goals}</div>
                    <div style={{fontSize:7,color:"rgba(255,255,255,0.35)"}}>⚽ GOL</div>
                  </div>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:18,fontWeight:900,color:"#60a5fa",lineHeight:1}}>{mStats.assists}</div>
                    <div style={{fontSize:7,color:"rgba(255,255,255,0.35)"}}>🎯 ASSIST</div>
                  </div>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:13,fontWeight:700,color:energy>50?"#4ade80":energy>25?"#f59e0b":"#f87171",lineHeight:1}}>{energy}%</div>
                    <div style={{fontSize:7,color:"rgba(255,255,255,0.35)"}}>⚡ ENERG.</div>
                  </div>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#a78bfa",lineHeight:1.1}}>{mxStats.shots}–{mxStats.oppShots}</div>
                    <div style={{fontSize:7,color:"rgba(255,255,255,0.35)"}}>💥 TIRI</div>
                  </div>
                  <div style={{textAlign:"center",gridColumn:"span 2"}}>
                    {(()=>{const _rb108=Math.min(mStats.rb,30);const _raw108=clamp(5.8+_rb108*0.13+(score.home>score.away?0.35:score.home<score.away?-0.30:0),4.0,10.0);const _r108=Math.round(_raw108*10)/10;const _rc108=_r108>=8?"#4ade80":_r108>=6.5?"#f59e0b":"#f87171";return<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5}}><span style={{fontSize:15,fontWeight:900,color:_rc108,lineHeight:1}}>{_r108}</span><span style={{fontSize:7,color:"rgba(255,255,255,0.35)"}}>⭐ RATING</span></div>;})()}
                  </div>
                </div>
                <div style={{marginTop:5,fontSize:7,color:"rgba(255,255,255,0.25)"}}>
                  📍 {ZONES[zone]?.label||zone} &nbsp;·&nbsp; 🟡 {mxStats.fouls} &nbsp;·&nbsp; 🏳️ {mxStats.corners} &nbsp;·&nbsp; <span style={{color:"#f59e0b"}}>xG {(mStats.xg||0).toFixed(2)}</span>
                </div>
              </div>}

              {/* Live commentary feed — hidden on mobile overlay */}
              <div style={{flex:1,padding:"6px 10px",overflowY:"auto",minHeight:0,display:"none"}}>{/* [7.529.0 collaudo PO «il box cronaca esterno e' ridondante: nascondilo» — il banner in campo e' la telecronaca */}
                {/* [7.524.0 collaudo PO «la riga di testo della cronaca è illegibile, troppo piccola»] righe 10→13.
                    [7.525.0] 13→15. [7.528.0 PO «troppo piccolo, non protagonista»] terzo giro: 15→17 + banner in campo. */}
                <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>📻 CRONACA</div>
                {coms.length===0
                  ?<div style={{fontSize:15,color:"rgba(255,255,255,0.2)",fontStyle:"italic"}}>In attesa…</div>
                  :coms.slice(0,8).map((c,i)=>(
                    <div key={i} style={{fontSize:17,color:c.color,padding:"3px 0",borderBottom:i<7?"1px solid rgba(255,255,255,0.05)":"none",lineHeight:1.4}}>
                      <span style={{color:"rgba(255,255,255,0.25)",marginRight:4,fontSize:12,fontWeight:700}}>{c.t}'</span>{c.text}
                    </div>
                  ))
                }
              </div>

            </div>{/* end right panel */}
          </div>);})()}{/* end field+panel row */}
        </Card>
      )}

      {/* Mobile cronaca + compact stats — below the card, hidden during HL to free space for DPad */}
      {isNarrow&&!["hl_move","hl_choose","hl_result","hl_intro","ceremony"].includes(phase)&&(show3D||phase==="walkout")&&(
        <div style={{flexShrink:0,background:"#050810",padding:"5px 10px 8px",borderTop:"1px solid rgba(255,255,255,0.07)"}}>
          {/* Compact stats bar */}
          {(()=>{const _rb_cs=Math.min(mStats.rb,30);const _raw_cs=clamp(5.8+_rb_cs*0.13+(score.home>score.away?0.35:score.home<score.away?-0.30:0),4.0,10.0);const _r_cs=Math.round(_raw_cs*10)/10;const _rc_cs=_r_cs>=8?"#4ade80":_r_cs>=6.5?"#f59e0b":"#f87171";return(
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:5,paddingBottom:4,borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
              <span style={{fontSize:10,fontWeight:900,color:"#4ade80"}}>⚽ {mStats.goals}</span>
              <span style={{fontSize:10,fontWeight:900,color:"#60a5fa"}}>🎯 {mStats.assists}</span>
              <span style={{fontSize:10,fontWeight:700,color:energy>50?"#4ade80":energy>25?"#f59e0b":"#f87171"}}>⚡ {energy}%</span>
              <span style={{fontSize:10,fontWeight:900,color:_rc_cs}}>⭐ {_r_cs}</span>
              <span style={{fontSize:8,color:"rgba(255,255,255,0.3)",marginLeft:"auto"}}>📍 {ZONES[zone]?.label||zone}</span>
            </div>
          );})()}
          {(()=>{/* [7.347.0] auto-chiusura col taccuino aperto. [7.529.0 collaudo PO «il box cronaca esterno
             e' ridondante: nascondilo» — il banner in campo e' la telecronaca: il ticker mobile sparisce. */
            if(true)return null;
            const _open=cronacaOpen&&!bugNote;
            const _n=coms.filter(Boolean).length;
            return(<>
              <button onClick={toggleCronaca} style={{display:"flex",alignItems:"center",gap:5,width:"100%",background:"none",border:"none",padding:"3px 0",margin:0,cursor:"pointer",textAlign:"left"}}
                title={_open?"Nascondi la cronaca":"Mostra la cronaca"}>
                {/* [7.524.0 collaudo PO] anteprima 8→11. [7.525.0 PO «aumenterei»] 11→12, etichetta 10. */}
                <span style={{fontSize:10,color:"rgba(255,255,255,0.28)",fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>📻 CRONACA</span>
                <span style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>{cronacaOpen?"▾":"▸"}</span>
                {!_open&&_n>0&&<span style={{fontSize:13,color:"rgba(255,255,255,0.22)",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",flex:1,minWidth:0}}>{coms[0].t}&apos; {coms[0].text}</span>}
              </button>
              {_open&&coms.filter(Boolean).slice(0,4).map((c,i)=>(
            <div key={i} style={{fontSize:17,color:c?(i===0?c.color:"rgba(255,255,255,0.45)"):"rgba(255,255,255,0.1)",lineHeight:1.4,
              padding:i<3?"0 0 3px":"0",
              borderBottom:i<3?"1px solid rgba(255,255,255,0.05)":"none",
              overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>
              {c&&<><span style={{color:"rgba(255,255,255,0.3)",marginRight:3,fontSize:11,fontWeight:700}}>{c.t}'</span>{c.text}</>}
            </div>
          ))}</>);})()}
        </div>
      )}

      {/* ENDED — [6.55.0 collaudo PO «non compare il pulsante in basso / se non lo premo il risultato è annullato»]
         corpo SCROLLABILE + bottone di conferma PINNATO in basso (sempre visibile e raggiungibile): committa il
         risultato via handleEnd. Prima la card poteva traboccare oltre il viewport (wrapper overflow:hidden) →
         bottone irraggiungibile → l'utente usciva dal tasto Home in alto perdendo la partita. */}
      {phase==="ended"&&(
        <div style={{display:"flex",flexDirection:"column",height:"100%",minHeight:0,width:"100%"}}>
        <div style={{flex:1,minHeight:0,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:isNarrow?"0":"0 0 4px"}}>
        <Card style={{textAlign:"center",padding:"22px"}}>
          {/* [7.95.0 collaudo PO «schermata post-partita ridondante + il "giornale" non sembra un giornale: comprimile
              in un'unica schermata giornale»] la 2ª schermata post-partita (rassegna stampa) è RIMOSSA (onMatchEnd →
              dashboard): il riepilogo ended È ora il GIORNALE — testata serif + data + TITOLONE derivato dal risultato. */}
          {(()=>{const _pw=(player.name||"L'eroe").trim().split(/\s+/).filter(w=>!/^(jr|sr|ii|iii|iv)\.?$/i.test(w));const _hn=(_pw[_pw.length-1]||player.name||"L'EROE").toUpperCase();const _g=mStats.goals,_a=mStats.assists;
            /* [7.293.0 #120] su un turno KO deciso dal dischetto il titolo racconta il TURNO, non il punteggio */
            const _hl=_drawShootout?(_shootoutWon?`DAL DISCHETTO ALLA GLORIA: ${_hn} E COMPAGNI PASSANO`:`FUORI AI RIGORI: ${_hn} E COMPAGNI ELIMINATI`)
              :winning?(_g>=4?`POKER DI ${_hn}!`:_g>=2?`${_hn} SHOW: ${_g} GOL`:_g>=1?`${_hn} DECIDE IL MATCH`:_a>=1?`${_hn} ILLUMINA: ${_a} ASSIST`:"VITTORIA DI CARATTERE"):(!winning&&!losing)?(_g>=1?`${_hn} SEGNA, FINISCE PARI`:"PAREGGIO COMBATTUTO"):(_g>=1?`${_hn} NON BASTA`:"KO AMARO");
            const _paper=((player.journalists||[])[0]&&(player.journalists[0].paper||player.journalists[0].name))||((typeof NEWSPAPERS!=="undefined"&&NEWSPAPERS[0]&&NEWSPAPERS[0].name)||"Sport Korward");
            const _serif="Georgia,'Times New Roman',serif";
            return(<div style={{margin:"-22px -22px 14px",padding:"14px 18px 12px",background:TH.card,borderBottom:`3px double ${TH.text}`,textAlign:"left"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",borderBottom:`1px solid ${TH.divider}`,paddingBottom:5,marginBottom:9}}>
                <div style={{fontFamily:_serif,fontSize:19,fontWeight:900,letterSpacing:-0.4,color:TH.text}}>📰 {_paper}</div>
                <div style={{fontSize:9,color:TH.muted,letterSpacing:0.4,whiteSpace:"nowrap"}}>Stag. {player.season||1} · G. {player.week||1}</div>
              </div>
              <div style={{fontFamily:_serif,fontSize:23,fontWeight:900,lineHeight:1.14,color:TH.text,letterSpacing:-0.3}}>{_hl}</div>
            </div>);})()}
          {ceremony&&!ceremony.light&&(<div style={{margin:"-8px -8px 16px",padding:"16px 12px",borderRadius:14,background:"linear-gradient(135deg,#7a1f30,#8e1f33 55%,#f0b33a)",boxShadow:"0 6px 28px rgba(94,15,29,0.45)",position:"relative",overflow:"hidden"}}>
            <div style={{fontSize:46,lineHeight:1,animation:"trophyRise 1s ease-out, trophyGlow 1.6s ease-in-out infinite 1s"}}>🏆</div>
            <div style={{fontSize:20,fontWeight:900,color:"#fff",letterSpacing:1,marginTop:6,textShadow:"0 2px 8px rgba(0,0,0,0.4)"}}>{ceremony.kind==="league"?"CAMPIONI!":ceremony.kind==="int"?"TRIONFO!":"TITOLO VINTO!"}</div>
            <div style={{fontSize:13,fontWeight:700,color:"#ffe9b0",marginTop:3}}>{ceremony.name}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.85)",marginTop:2}}>{/* [7.686.0 collaudo PO con screenshot: sotto «Coppa delle Nazioni» c'era scritto «FC Merseyside»] CHI ALZA IL TROFEO. Il sottotitolo della premiazione mostrava SEMPRE il club, anche quando il trofeo e' della NAZIONALE: in una Coppa delle Nazioni vinta con la Spagna leggere il nome del club inglese e' una cosa che non sta ne' in cielo ne' in terra. Nei contesti di nazionale si scrive la NAZIONE. */}{_natCtx686?(player.nation||"Nazionale"):(player.club?.n||player.club?.name||"")} · Stagione {player.season||1}</div>
          </div>)}
          {/* [6.88.0 collaudo PO «post-partita più moderno, in linea con prematch/rassegna»] HERO BROADCAST:
              banda scura con hairline nel colore della competizione, squadre con spina-colore, esito chiaro +
              CELEBRAZIONE scalata sull'importanza (coriandoli sui big win, curva citata; il titolo ha la sua cerimonia). */}
          {(()=>{
            const _hWon=winning||(_drawShootout&&_shootoutWon);
            const _hDrew=!winning&&!losing;
            const _celebTier=_hWon?((ceremony&&!ceremony.light)?3:(_isFinalKO||mw>=8)?2:(mw>=6||!!drby)?1:0):0;/* [7.42.0] la festa light non alza trofei */
            const _confN=(_celebTier>=1&&!_CPM_TEST)?(_celebTier>=2?18:10):0;
            return(
            <div style={{margin:"0 -22px 16px",paddingBottom:14,background:"linear-gradient(165deg,#0b1224,#101a33 55%,#0d1526)",position:"relative",overflow:"hidden"}}>{/* [7.95.0] no top-margin: segue il masthead del giornale */}
              {_confN>0&&<div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden"}}>{Array.from({length:_confN}).map((_,i)=>{const _cc=["#f59e0b","#22c55e","#60a5fa","#f472b6","#facc15",_compCol];return <span key={i} style={{position:"absolute",left:((i*53)%100)+"%",top:"-8%",width:7,height:11,borderRadius:2,background:_cc[i%_cc.length],animation:`confettiFall ${(2.8+(i%5)*0.7).toFixed(1)}s linear ${((i%7)*0.45).toFixed(2)}s infinite`,opacity:0.9}}/>;})}</div>}
              <div style={{height:3,background:`linear-gradient(90deg,transparent,${_compCol},transparent)`}}/>
              <div style={{padding:"12px 14px 0"}}>
                <div style={{fontSize:9.5,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:_compCol}}>{_compLabel}{!_leagueCtx&&_tvComp?` · ${_tvComp.phase}`:""}</div>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.45)",letterSpacing:3,marginTop:5}}>FISCHIO FINALE</div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginTop:10}}>
                  <div style={{flex:1,minWidth:0,textAlign:"right"}}>
                    <div style={{fontSize:13,fontWeight:900,color:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{homeTeamObj?.name||homeTeamObj?.n||"Casa"}</div>
                    <div style={{height:3,borderRadius:2,background:scoreHomeCol||"#3b82f6",marginTop:4,marginLeft:"auto",width:"56%"}}/>
                  </div>
                  <div className="cpm-num" style={{fontSize:42,fontWeight:900,lineHeight:1,color:_hWon?"#4ade80":losing?"#f87171":"#e2e8f0",flexShrink:0}}>{isMatchHome?score.home:score.away}<span style={{color:"rgba(255,255,255,0.35)",fontSize:22,padding:"0 6px"}}>–</span>{isMatchHome?score.away:score.home}</div>
                  <div style={{flex:1,minWidth:0,textAlign:"left"}}>
                    <div style={{fontSize:13,fontWeight:900,color:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{awayTeamObj?.name||awayTeamObj?.n||"Ospite"}</div>
                    <div style={{height:3,borderRadius:2,background:scoreAwayCol||"#ef4444",marginTop:4,width:"56%"}}/>
                  </div>
                </div>
                <div style={{display:"inline-block",marginTop:10,padding:"4px 14px",borderRadius:20,fontSize:11,fontWeight:800,letterSpacing:1,background:_hWon?"rgba(34,197,94,0.16)":_hDrew?"rgba(245,158,11,0.14)":"rgba(239,68,68,0.14)",border:`1px solid ${_hWon?"#22c55e":_hDrew?"#f59e0b":"#ef4444"}55`,color:_hWon?"#4ade80":_hDrew?"#fbbf24":"#f87171"}}>{winning?"VITTORIA":_hDrew?(_drawShootout?(_shootoutWon?"VITTORIA AI RIGORI":"SCONFITTA AI RIGORI"):"PAREGGIO"):"SCONFITTA"}</div>
                {(subbedOff||benchStart)&&<div style={{marginTop:8,fontSize:10.5,fontWeight:700,color:"rgba(255,255,255,0.6)"}}>{/* [7.38.0 Sezione 8] minuti giocati quando non è un 90' pieno */}
                  ⏱ {benchStart?`Entrato al ${benchMinute}' · ${Math.max(0,90-(benchMinute||60))}' giocati`:`Sostituito al ${subOffMinRef.current}' · ${subOffMinRef.current}' giocati`}
                </div>}
                {_celebTier>=1&&<div style={{marginTop:10,fontSize:11,fontWeight:700,color:"#ffe9b0"}}>{_celebTier>=3?"🏆 Fuochi d'artificio: la squadra alza il trofeo sotto la curva!":_celebTier>=2?"🎆 Che notte! Tutti sotto la curva ad abbracciare i tifosi!":"🎉 La squadra festeggia sotto la curva!"}</div>}
              </div>
            </div>);
          })()}
          {_drawShootout&&(<div style={{margin:"0 0 16px",padding:"10px 14px",borderRadius:RAD.md,background:_shootoutWon?"rgba(22,163,74,0.12)":"rgba(220,38,38,0.10)",border:`1.5px solid ${_shootoutWon?TH.success:TH.danger}`,textAlign:"center"}}>
            <div style={{fontSize:11,color:TH.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:2}}>🎲 Si decide ai rigori</div>
            <div style={{fontSize:16,fontWeight:900,color:_shootoutWon?TH.success:TH.danger}}>{_shootoutWon?(_isFinalKO?"🏆 VITTORIA AI RIGORI — CAMPIONE!":"✅ VITTORIA AI RIGORI — PASSI IL TURNO"):(_isFinalKO?"😔 SCONFITTA AI RIGORI — 2° POSTO":"😔 SCONFITTA AI RIGORI — ELIMINATO")}</div>
          </div>)}{/* [6.48.0 RC] esito rigori chiaro (prima il pari neutro non diceva se avevi vinto/perso l'Europeo) */}
          {/* [7.86.0 collaudo PO «standardizza UX/UI»] etichette di sezione sui due blocchi statistiche (kit) */}
          <div style={{fontSize:10,color:TH.muted,fontWeight:700,letterSpacing:1,marginBottom:6,textAlign:"left"}}>IL TUO TABELLINO</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:12}}>
            {[{l:"Gol",v:mStats.goals,e:"⚽",c:TH.warning},{l:"Assist",v:mStats.assists,e:"🎯",c:TH.primary},{l:"Tiri",v:mxStats.shots,e:"💥",c:TH.accent},{l:"Poss.",v:(Math.round(possession))+'%',e:"🔵",c:TH.success}].map(s=>(
              <Card key={s.l} style={{padding:"8px 4px",textAlign:"center"}}>
                <div style={{fontSize:13,marginBottom:1}}>{s.e}</div><div className="cpm-num" style={{fontSize:20,fontWeight:900,color:s.c,lineHeight:1}}>{s.v}</div><div style={{fontSize:10,color:TH.muted}}>{s.l}</div>
              </Card>
            ))}
          </div>
          {(()=>{/* [7.110.0 collaudo PO «memorizza a chi ho fatto l'assist e chi mi ha fatto l'assist»] le connessioni della gara */
            const _al=assistLinksRef.current||{given:[],received:[]};const _gv=_al.given||[],_rc=_al.received||[];
            if(!_gv.length&&!_rc.length)return null;
            const _row=(icon,lbl,arr,col)=>arr.length?(<div style={{display:"flex",alignItems:"flex-start",gap:8,padding:"7px 9px",background:TH.surface2,borderRadius:RAD.sm,border:`1px solid ${TH.divider}`,marginBottom:6}}>
              <span style={{fontSize:14,flexShrink:0}}>{icon}</span>
              <div style={{minWidth:0}}><div style={{fontSize:10,color:TH.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5}}>{lbl}</div>
                <div style={{fontSize:12,color:TH.text,fontWeight:700,lineHeight:1.5}}>{arr.map((x,i)=>(<span key={i}><span style={{color:col}}>{x.name}</span> <span className="cpm-num" style={{color:TH.muted,fontWeight:600}}>{x.min}'</span>{i<arr.length-1?"   ·   ":""}</span>))}</div></div>
            </div>):null;
            return(<div style={{marginBottom:14}}>
              <div style={{fontSize:10,color:TH.muted,fontWeight:700,letterSpacing:1,marginBottom:6,textAlign:"left"}}>🔗 LE CONNESSIONI</div>
              {_row("🎯","Assist serviti a",_gv,TH.primary)}
              {_row("⚽","Gol su assist di",_rc,TH.warning)}
            </div>);
          })()}
          <div style={{fontSize:10,color:TH.muted,fontWeight:700,letterSpacing:1,marginBottom:6,textAlign:"left"}}>STATISTICHE GARA</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:14}}>
            {[{l:"Falli avversari",v:mxStats.fouls,e:"🟡"},{l:"Calci d'angolo",v:mxStats.corners,e:"🏳️"},{l:"Tiri avversari",v:mxStats.oppShots,e:"🔴"},{l:"Tiro medio",v:mxStats.shots>0?`${mStats.goals}/${mxStats.shots}`:"0/0",e:"🎯"}].map(s=>(
              <div key={s.l} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 8px",background:TH.surface2,borderRadius:RAD.sm,border:`1px solid ${TH.divider}`}}>
                <span style={{fontSize:13}}>{s.e}</span>
                <div><div className="cpm-num" style={{fontSize:12,fontWeight:700,color:TH.text}}>{s.v}</div><div style={{fontSize:10,color:TH.muted}}>{s.l}</div></div>
              </div>
            ))}
          </div>
          {(()=>{const rbC=Math.min(mStats.rb,30);const raw=clamp(5.8+rbC*0.13+(winning?0.35:losing?-0.30:0),4.0,10.0);const rating=Math.round(raw*10)/10;const rc=rating>=8?TH.success:rating>=6.5?TH.warning:TH.danger;return(<div style={{marginBottom:14}}>
            {/* [7.86.0 collaudo PO «standardizza UX/UI»] PAGELLA: voto + meter (voto/10) in un pannello del kit */}
            <div style={{fontSize:10,color:TH.muted,fontWeight:700,letterSpacing:1,marginBottom:6,textAlign:"left"}}>PAGELLA</div>
            <div style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",background:TH.surface2,border:`1px solid ${TH.divider}`,borderRadius:RAD.md,textAlign:"left"}}>
              <div className="cpm-num" style={{fontSize:46,fontWeight:900,color:rc,lineHeight:1,flexShrink:0}}>{rating}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:700,color:rc,marginBottom:6}}>{rating>=9?"Prestazione storica!":rating>=8?"Eccellente!":rating>=7?"Buona partita":rating>=6?"Sufficiente":"Da migliorare"}</div>
                <div style={{height:6,background:TH.track,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.round(rating*10)}%`,background:rc,borderRadius:3,transition:"width .5s"}}/></div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:TH.faint,marginTop:3}}><span>4.0</span><span>10.0</span></div>
              </div>
            </div>
            {/* Sprint 113 — Coach post-match evaluation */}
            {context!=="trial"&&<div style={{marginTop:12,padding:"10px 12px",background:TH.bgBlue,border:`1px solid ${TH.bdBlue}`,borderRadius:RAD.md,textAlign:"left",display:"flex",gap:10,alignItems:"flex-start"}}>
              <NpcFaceCoach coachName={player.club?.n||"mister"} size={34}/>
              <div style={{flex:1}}>
                <div style={{fontSize:10,fontWeight:FW.bold,color:TH.txBlue,letterSpacing:1,marginBottom:4}}>MISTER DOPO LA PARTITA</div>
                <div style={{fontSize:11,color:TH.text,lineHeight:1.5}}>{coachPostMatch(winning,!winning&&!losing,mStats.goals,mStats.assists,rating,opponent?.p||opponent?.prestige||65)}</div>
              </div>
            </div>}
            {/* Sprint 113 — Key match events timeline */}
            {matchEvents.length>0&&<div style={{marginTop:10,textAlign:"left"}}>
              <div style={{fontSize:10,color:TH.muted,fontWeight:700,letterSpacing:1,marginBottom:4}}>MOMENTI CHIAVE</div>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                {matchEvents.map((ev,i)=><div key={i} style={{display:"flex",gap:6,alignItems:"center",fontSize:10,color:ev.type==="player_goal"||ev.type==="player_assist"?TH.success:ev.type==="opp_goal"?TH.danger:ev.type==="red"?"#f59e0b":TH.muted}}>
                  <span style={{fontSize:10,fontWeight:700,minWidth:22,color:TH.faint}}>{ev.min}'</span>
                  <span>{ev.txt}</span>
                </div>)}
              </div>
            </div>}
          </div>);})()}
          {/* [7.99.0 collaudo PO «il giornale post-partita deve sembrare un vero giornale, più ricco: considerazioni reali del giornalista/mister/tifosi, eventi per importanza/prestigio, pagelle, commenti dell'eroe»] RASSEGNA STAMPA integrata nel riepilogo ended — tutto DERIVATO da generateLocalPressAnalysis (headline multi-testata, analisi tattica, MVP/flop, voci mister+eroe, curva) + occhiello per importanza/prestigio della gara. Solo carriera (i provini restano sobri). */}
          {context!=="trial"&&(()=>{
            const _rbP=Math.min(mStats.rb,30),_ratP=Math.round(clamp(5.8+_rbP*0.13+(winning?0.35:losing?-0.30:0),4.0,10.0)*10)/10;
            const _oppN=(opponent&&(opponent.n||opponent.name))||"l'avversario";
            // [7.118.0 collaudo PO «l'Italia ha vinto ai rigori ma non si capisce che ha passato il turno»]: su un
            //   KO pareggiato deciso ai rigori la rassegna diceva «0-0, la classifica non sorride» (falso: non c'è
            //   classifica in un KO, e il turno è stato SUPERATO). Passo koPen → headline «RIGORI SENZA FIATO… superati il turno!».
            const _koPhaseLbl=context==="cup"?(["","gli Ottavi","i Quarti","la Semifinale","la Finale"][player.cup?.round||1]||"il turno"):((({r16:"gli Ottavi",quarti:"i Quarti",sf:"la Semifinale",final:"la Finale"})[(context==="euroMondiale_ko"?player.euroMondiale?.koPhase:context==="euro_ko"?(mdEuroPhase||player.euro?.phase):"r16")||"r16"])||"il turno");
            const _koPenEnded=_drawShootout?{won:_shootoutWon,label:_koPhaseLbl}:null;
            const _press=generateLocalPressAnalysis(
              {won:winning,drew:!winning&&!losing,opponent:_oppN,homeScore:score.home,awayScore:score.away,isDerby:!!drby},
              {goals:mStats.goals,assists:mStats.assists,rating:_ratP,name:player.name,club:(_isNatCtx?(player.nation||"Italia"):(player.club?.n||player.club?.name||"la squadra")),homeRoster:(isMatchHome?homeRoster:awayRoster)||[]},/* [7.118.0 collaudo PO «FC Salernum–Germania in una gara di nazionale!»] squadra = NAZIONE in nat-ctx, non il club */
              {season:player.season,week:player.week,age:player.age,matchHistory:player.matchHistory,isDerby:!!drby,archetype:player.archetype,records:{topSeasonGoals:0,topSeasonAssists:0,topOvr:player.ovr||60},koPen:_koPenEnded}
            );
            const _serif="Georgia,'Times New Roman',serif";
            const _clubP=player.club?.p||player.club?.prestige||60,_oppP=opponent?.p||opponent?.prestige||65;
            const _kick=drby?"Un derby sentitissimo: in palio molto più di tre punti.":(mw>=8||_isFinalKO)?"Una sfida da dentro-o-fuori, di quelle che segnano una stagione.":(winning&&_oppP-_clubP>=12)?"Impresa di prestigio: piegata una squadra di categoria superiore.":((!winning)&&_clubP-_oppP>=12)?"Passo falso contro un avversario alla portata.":(mw>=6)?"Big match dal peso specifico enorme in classifica.":"";
            const _sub=(_press.headlines||[]).slice(1,4);
            const _hero=(_press.quotes||[]).find(q=>!/—\s*Mister\s*$/.test(q));
            const _hd={fontSize:9.5,color:TH.muted,fontWeight:800,letterSpacing:1.5,marginBottom:6,textTransform:"uppercase",fontFamily:_serif};
            return(<div style={{marginTop:14,borderTop:`3px double ${TH.text}`,paddingTop:12,textAlign:"left"}}>
              {/* Il pezzo del giornalista: occhiello (importanza/prestigio) + analisi tattica */}
              <div style={_hd}>L'analisi</div>
              {_kick&&<div style={{fontFamily:_serif,fontSize:12.5,fontWeight:700,fontStyle:"italic",color:TH.text,marginBottom:5,lineHeight:1.4}}>{_kick}</div>}
              <div style={{fontFamily:_serif,fontSize:12.5,color:TH.text,lineHeight:1.55}}>{_press.tacticalNote}</div>
              {/* Dalle altre testate — headline multi-giornale = colpo d'occhio da vero quotidiano */}
              {_sub.length>0&&<div style={{marginTop:14}}>
                <div style={_hd}>Dalle altre testate</div>
                {_sub.map((h,i)=>(<div key={i} style={{display:"flex",gap:9,padding:"7px 0",borderTop:i>0?`1px solid ${TH.divider}`:"none"}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:(_press.paperColors||[])[i+1]||TH.primary,flexShrink:0,marginTop:5}}/>
                  <div style={{minWidth:0}}><div style={{fontSize:8.5,letterSpacing:1,color:(_press.paperColors||[])[i+1]||TH.faint,fontWeight:800,textTransform:"uppercase"}}>{(_press.papers||[])[i+1]||"Cronaca"}</div><div style={{fontFamily:_serif,fontSize:13,color:TH.text,lineHeight:1.32,fontWeight:700}}>{h}</div></div>
                </div>))}
              </div>}
              {/* Le parole del protagonista (commento dell'eroe) */}
              {_hero&&<div style={{marginTop:14,borderLeft:`3px solid ${TH.primary}`,paddingLeft:11}}>
                <div style={{fontSize:8.5,letterSpacing:1,color:TH.primary,fontWeight:800,marginBottom:3,textTransform:"uppercase"}}>Le parole del protagonista</div>
                <div style={{fontFamily:_serif,fontSize:13,fontStyle:"italic",color:TH.text,lineHeight:1.5}}>{_hero.replace(/\s*—\s*[^—]+$/,"")}</div>
              </div>}
              {/* MIGLIORE IN CAMPO + LA CURVA (tifosi) */}
              <div style={{marginTop:14,display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div style={{background:TH.surface2,border:`1px solid ${TH.divider}`,borderRadius:RAD.sm,padding:"9px 11px"}}>
                  <div style={{fontSize:8.5,letterSpacing:1,color:TH.success,fontWeight:800,marginBottom:3}}>⭐ MIGLIORE IN CAMPO</div>
                  <div style={{fontSize:12,fontWeight:800,color:TH.text}}>{_press.motm}</div>
                </div>
                <div style={{background:TH.surface2,border:`1px solid ${TH.divider}`,borderRadius:RAD.sm,padding:"9px 11px"}}>
                  <div style={{fontSize:8.5,letterSpacing:1,color:TH.warning,fontWeight:800,marginBottom:3}}>📣 LA CURVA</div>
                  <div style={{fontSize:11,color:TH.muted,fontStyle:"italic",lineHeight:1.35}}>«{(_press.fanReactions||[])[0]||""}»</div>
                </div>
              </div>
              {(_press.memoriaTag||_press.trending)&&<div style={{marginTop:12,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                {_press.memoriaTag&&<span style={{fontSize:10,color:TH.accent,fontWeight:700}}>{_press.memoriaTag}</span>}
                {_press.trending&&<span style={{fontSize:10,fontWeight:800,color:TH.primary,background:TH.primary+"18",padding:"3px 10px",borderRadius:20}}>#{String(_press.trending).replace(/^#/,"")}</span>}
              </div>}
            </div>);
          })()}
        </Card>
        </div>
        {/* footer PINNATO — sempre visibile: SALVA il risultato e torna alla dashboard (bottone GRANATA di brand) */}
        <div style={{flexShrink:0,padding:isNarrow?"10px 12px":"12px 0 4px",background:TH.bg,borderTop:isNarrow?`1px solid ${TH.border}`:"none",boxShadow:isNarrow?"0 -4px 16px rgba(0,0,0,0.07)":"none"}}>
          <Btn onClick={handleEnd} v="primary" fw style={{padding:"14px",fontSize:15,background:`linear-gradient(135deg,${TH.primary},${TH.primaryDk})`,color:"#fff"}}>
            {context==="trial"?"📋 Risultati provino":"🏟️ Torna alla dashboard"} {!isNarrow&&<span className="kbd" style={{opacity:0.7,fontSize:11}}>Enter</span>}
          </Btn>
        </div>
        </div>
      )}
      {/* ATE-5: debug overlay — Shift+D */}
      {debugMode&&<div style={{position:"fixed",bottom:8,left:8,background:"rgba(0,0,0,0.82)",
        color:"#a3e635",fontFamily:"monospace",fontSize:9,padding:"7px 11px",borderRadius:7,
        zIndex:9999,lineHeight:1.8,pointerEvents:"none",border:"1px solid rgba(163,230,53,0.25)"}}>
        <div style={{color:"#f97316",fontWeight:700,marginBottom:2}}>◉ CPM DEBUG {GAME_VERSION}</div>
        <div>phase: <b style={{color:"#fff"}}>{phase}</b></div>
        <div>bg_action: <b style={{color:ATE3_ARCCOL[bgAction?.type]||"#fff"}}>{bgAction?.type||"—"}</b></div>
        <div>ball: <b style={{color:"#fff"}}>{ballPos.x.toFixed(1)} / {ballPos.y.toFixed(1)}</b></div>
        <div>momentum: <b style={{color:"#fff"}}>{momentum}</b> · poss: <b style={{color:"#fff"}}>{possession}%</b></div>
        <div>clock: <b style={{color:"#fff"}}>{clock}'</b> · hl_zone: <b style={{color:"#22d3ee"}}>{hlZone||"—"}</b></div>
        {(()=>{const _d=deriveHL(situations[hlIdx],chosenAct);return <div>pattern: <b style={{color:"#f472b6"}}>{_d.pattern||"—"}</b> · var: <b style={{color:"#fbbf24"}}>{_d.variant||"—"}</b></div>;})()}
        <div style={{color:"rgba(163,230,53,0.4)",marginTop:2,fontSize:8}}>Shift+D per chiudere</div>
      </div>}
    </div>
  );
}

