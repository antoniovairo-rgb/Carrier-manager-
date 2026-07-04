import { createAvatar } from '@dicebear/core';
import { avataaars, micah } from '@dicebear/collection';
const STYLES = { avataaars, micah };
// [6.18.0] makeAvatar(seed, {style,size,skinColor,hairColor,bald}) → mappa le opzioni sui nomi giusti per stile.
//   Eroe = 'avataaars' con match colori dal CH38; NPC/staff = 'micah'.
function makeAvatar(seed, opts){
  opts = opts || {};
  var styleName = opts.style || 'avataaars';
  var style = STYLES[styleName] || avataaars;
  var o = { seed: String(seed==null?'x':seed), size: opts.size||96, radius: 0, backgroundColor: ['transparent'] };
  if (opts.skinColor){ o.skinColor = opts.skinColor; if (styleName==='micah') o.baseColor = opts.skinColor; }
  if (styleName==='avataaars'){ o.accessoriesProbability = 0; o.mouth = ['smile','default','twinkle','serious']; o.eyes = ['default','happy','wink','squint']; o.eyebrows = ['default','defaultNatural','raisedExcited','flatNatural','upDown']; }
  if (opts.hairColor) o.hairColor = opts.hairColor;
  if (opts.bald){ if (styleName==='avataaars') o.topProbability = 0; else o.hairProbability = 0; }
  try { return createAvatar(style, o).toString(); } catch(e){ return ''; }
}
if (typeof window!=='undefined'){ window.DiceBear = { makeAvatar: makeAvatar, styles: Object.keys(STYLES), ready:true }; }
