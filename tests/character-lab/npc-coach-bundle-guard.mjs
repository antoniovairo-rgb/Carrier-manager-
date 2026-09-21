/* Guards the mobile crash reported from NpcFaceCoach when event modals render. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const html=fs.readFileSync(path.join(here,'..','..','CARRIER-MANAGER-AV.html'),'utf8');
const factory=html.indexOf('function npcCoachAvOpts(');
const component=html.indexOf('function NpcFaceCoach(');
assert.ok(factory>=0,'npcCoachAvOpts is absent from the runnable HTML bundle');
assert.ok(component>factory,'npcCoachAvOpts must be declared before NpcFaceCoach can render');
assert.match(html.slice(factory,component),/return null;/,'bundle fallback must not reference unavailable coach-palette globals');
console.log('NPC COACH BUNDLE GUARD PASS');
