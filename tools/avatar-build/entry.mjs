import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
function makeAvatar(seed, opts){
  var o = Object.assign({ seed:String(seed==null?'x':seed), size:(opts&&opts.size)||96, radius:0, backgroundColor:['transparent'] }, opts||{});
  try { return createAvatar(adventurer, o).toString(); } catch(e){ return ''; }
}
if (typeof window!=='undefined'){ window.DiceBear = { makeAvatar: makeAvatar, style: 'adventurer', ready:true }; }
