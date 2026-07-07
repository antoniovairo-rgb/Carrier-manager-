import { loadSituations } from './lib/situations.mjs';
const sits=loadSituations();
for(const gi of [28,29,30,118,120,121,123,125,140,154]){
  const s=sits[gi]; console.log(`gi${gi} intent=${s.intent} [${s.zones.join(',')}] "${s.text}"`);
}
