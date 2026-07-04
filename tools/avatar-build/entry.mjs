import { createAvatar } from '@dicebear/core';
import { avataaars, micah } from '@dicebear/collection';
const STYLES = { avataaars, micah };
// [6.21.0] Eroe (avataaars) = SEMPRE MASCHILE, pulito e professionale:
//   acconciature corte maschili · niente barba (CH38 beardless) · niente occhiali/benda ·
//   occhi/sopracciglia/bocca neutri-positivi · abbigliamento maschile · colori maglia non-rosa.
// [6.24.0] via "sides" (capelli SOLO ai lati = stempiatura/calvizie → l'eroe sembrava un uomo anziano
//   pelato): l'eroe è un GIOVANE calciatore, tutte le teste hanno capelli pieni.
const MALE_TOP = ["dreads01","dreads02","frizzle","shaggy","shaggyMullet","shortCurly","shortFlat","shortRound","shortWaved","theCaesar","theCaesarAndSidePart","fro","froBand"];
const OK_EYES = ["default","happy","squint","wink","side"];
const OK_BROWS = ["default","defaultNatural","flatNatural","raisedExcited","upDown"];
const OK_MOUTH = ["default","smile","serious","twinkle"];
const OK_CLOTHING = ["shirtCrewNeck","shirtVNeck","hoodie","blazerAndShirt","collarAndSweater"];
const OK_CLOTHESCOL = ["262e33","3c4f5c","5199e4","25557c","929598","2f4858","546e7a","1e88e5","37474f"];
function makeAvatar(seed, opts){
  opts = opts || {};
  var styleName = opts.style || 'avataaars';
  var style = STYLES[styleName] || avataaars;
  var o = { seed: String(seed==null?'x':seed), size: opts.size||96, radius: 0, backgroundColor: ['transparent'] };
  if (opts.skinColor){ o.skinColor = opts.skinColor; if (styleName==='micah') o.baseColor = opts.skinColor; }
  if (opts.hairColor) o.hairColor = opts.hairColor;
  if (styleName==='avataaars'){
    o.top = MALE_TOP; o.facialHairProbability = 0; o.accessoriesProbability = 0;
    o.eyes = OK_EYES; o.eyebrows = OK_BROWS; o.mouth = OK_MOUTH;
    o.clothing = OK_CLOTHING; o.clothesColor = OK_CLOTHESCOL;
  }
  if (opts.bald){ if (styleName==='avataaars') o.topProbability = 0; else o.hairProbability = 0; }
  try { return createAvatar(style, o).toString(); } catch(e){ return ''; }
}
if (typeof window!=='undefined'){ window.DiceBear = { makeAvatar: makeAvatar, styles: Object.keys(STYLES), ready:true }; }
