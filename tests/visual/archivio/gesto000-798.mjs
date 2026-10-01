/* [7.798 misura] CODICE 000 «GESTO SCOORDINATO»: il corpo CALCIA mentre il testo DRIBBLA.
   Il PO l'ha segnalato QUATTRO volte, sempre su famiglie cross/assist:
     · 7.788 SIT #178 [cross] «Sterzata d'esterno e brucia il terzino» → assist
     · 7.787 SIT #113 «Assist di prima senza guardare» → assist
     · 7.787 SIT #17  [cross] «Cross teso» → chance
     · 7.787 SIT #87  [cross] «Cross cieco di prima» → chance
   IPOTESI, dal codice: il vocabolario delle clip e' minuscolo — kick, volley, header, dribble, tackle,
   penalty — e il riconoscimento della CONDUZIONE (`isCarry` in deriveHL) cerca solo «avanza», «porta
   palla», «palla al piede», «conduci/conduzione». Un'azione che dice «sterzata d'esterno», «hocus
   pocus», «step-over», «elastico», «finta di corpo», «accelerazione», «scatto» non entra in quel
   vocabolario: cade sul ramo cross/pass, la cui clip e' `kick`. Cioe' il corpo esegue una CALCIATA
   mentre il testo racconta un dribbling o una corsa palla al piede. E' il codice 000.
   Qui si contano. Sola lettura, fuori dal browser. */
import { loadSituations } from './lib/situations.mjs';
import { loadCine } from './lib/cine.mjs';

const sits = loadSituations();
const { deriveHL } = loadCine();

/* la tabella dei gesti, come nel motore (src/12 GESTI) */
const CLIP = {
  shot:{base:'kick',shot_volley:'volley'}, penalty:{base:'penalty'}, freekick:{base:'kick'},
  cross:{base:'kick'}, header:{base:'header'}, dribble:{base:'dribble'}, pass:{base:'kick'},
  build:{base:'dribble'},
};
const clipDi=(fam,varn)=>{const f=CLIP[fam];if(!f)return null;return f[varn]||f.base||null;};

/* il lessico di CIO' CHE NON E' UNA CALCIATA: dribbling, finte, corse palla al piede */
const SENZA_CALCIO=/sterzat|hocus|step.?over|elastic|finta|doppio passo|tunnel|sombrero|roulette|veronic|accelera|scatt[oa]|brucia il|salta l'uomo|se lo beve|rientr[oa] secc|cambio di direzione|puntat|dribbl|conduzion|palla al piede|avanza|porta palla|allunga|va via in|si beve/i;
/* ...ma se il testo dice anche che il pallone PARTE, la calciata ci sta */
const CON_CALCIO=/cross|tir[oa]|calcia|conclu|serve|servit|assist|mette dentro|traversone|filtrante|passaggio|lancio|centro basso|scarico|smarca con/i;

/* ⚠️ LA PRIMA MISURA CERCAVA LA COSA SBAGLIATA, e resta a verbale. Avevo inventato un lessico di
   «gesti senza calciata» e contato le etichette che lo usavano con una clip `kick`: 14 casi su 573,
   e NESSUNA delle quattro segnalate dal PO. Guardando quelle quattro il difetto si e' mostrato per
   quello che e', e ha una forma sola: le etichette che dichiarano DUE gesti in sequenza («Hocus pocus
   E cross», «Finta E mancino», «Sterzata d'esterno E brucia il terzino») ricevono UNA CLIP SOLA.
   Il caso piu' grave e' oggettivo e non ha bisogno di lessici miei: un'azione che finisce in RETE o
   in un ASSIST mentre il corpo esegue una clip che NON colpisce il pallone (`dribble`, `tackle`,
   nessuna clip). Se il pallone parte, qualcuno deve averlo toccato: se il gesto non lo tocca, quello
   che si vede e' scoordinato per definizione. */
const COLPISCE=new Set(['kick','volley','header','penalty']);
const casi=[],doppi=[];let tot=0;

sits.forEach((sit,gi)=>{
  (sit.actions||[]).forEach((act,ai)=>{
    if(!act)return;tot++;
    const hl=deriveHL(sit,act)||{};
    const clip=clipDi(hl.type,hl.variant);
    const lbl=String(act.label||'');
    const rew=String(act.rew||'-');
    /* (A) il pallone parte ma il corpo non lo colpisce mai */
    if((rew==='goal'||rew==='assist')&&!COLPISCE.has(clip))
      casi.push({gi,ai,type:hl.type,variant:hl.variant||'base',rew,clip:String(clip),lbl:lbl.slice(0,44)});
    /* (B) l'etichetta dichiara DUE gesti e la clip e' una sola */
    if(/^[^«»]{2,}\s\be\b\s/.test(lbl.replace(/^[^A-Za-z]+/,'')))
      doppi.push({gi,ai,rew,clip:String(clip),lbl:lbl.slice(0,44)});
  });
});
console.log('=== '+sits.length+' situazioni · '+tot+' azioni ===');
console.log('(A) IL PALLONE PARTE MA IL CORPO NON LO COLPISCE (esito goal/assist, clip che non tocca la palla): '+casi.length
  +'  ('+(100*casi.length/Math.max(1,tot)).toFixed(1)+'%)');
console.log('');
casi.slice(0,26).forEach(c=>console.log('  gi'+String(c.gi).padStart(3)+'.'+c.ai+' ['+c.type+'/'+c.variant+' → clip '+c.clip+'] esito '+String(c.rew).padEnd(8)+' «'+c.lbl+'»'));
if(casi.length>26)console.log('  ... e altri '+(casi.length-26));
console.log('');
console.log('(B) ETICHETTE CON DUE GESTI IN SEQUENZA, servite da UNA sola clip: '+doppi.length
  +'  ('+(100*doppi.length/Math.max(1,tot)).toFixed(1)+'%)');
doppi.slice(0,18).forEach(c=>console.log('  gi'+String(c.gi).padStart(3)+'.'+c.ai+' [clip '+c.clip+'] esito '+c.rew.padEnd(8)+' «'+c.lbl+'»'));
if(doppi.length>18)console.log('  ... e altri '+(doppi.length-18));
const perTipo={};casi.forEach(c=>{perTipo[c.type]=(perTipo[c.type]|0)+1;});
console.log('');
console.log('  per famiglia: '+JSON.stringify(perTipo));
const perEsito={};casi.forEach(c=>{perEsito[c.rew]=(perEsito[c.rew]|0)+1;});
console.log('  per esito:    '+JSON.stringify(perEsito));
