import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
export function makeAvatar(seed, opts){ return createAvatar(adventurer, Object.assign({seed, size:96}, opts||{})).toString(); }
if (typeof window!=='undefined'){ window.DiceBear={ makeAvatar }; }
