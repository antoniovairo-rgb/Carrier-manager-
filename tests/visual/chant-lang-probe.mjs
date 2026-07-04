/* Verifica 6.39.0: i cori escono nella LINGUA giusta (chantPoolFor). I tipi comuni pressure/save/half/
   urgenza/away_goal non devono più cadere sull'italiano nelle leghe straniere. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
page.on('pageerror', e => console.log('PAGEERR', String(e.message).slice(0,160)));
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil:'load', timeout:30000 });
await page.waitForFunction(()=>typeof chantPoolFor==='function'&&typeof LANG_CHANTS!=='undefined',{timeout:40000});

const R = await page.evaluate(()=>{
  const fails=[]; const F=(c,m)=>{ if(!c) fails.push(m); };
  const has=(arr,re)=>Array.isArray(arr)&&arr.some(s=>re.test(s));
  const italianMarkers=/Dai dai daiii|MIRACOLO|FORZA FORZA|Intervallo|Silenzio in curva|DAI! CI SIAMO/i;
  const types=["pressure","save","half","urgenza","away_goal"];
  // per ogni lega straniera, i 5 tipi comuni NON devono essere i literal italiani
  const cases=[
    {lg:"Deutsche Liga",lang:"de",mark:/LOS!|PARADE|HALBZEIT|JETZT|Stille/i},
    {lg:"Premier Division",lang:"en",mark:/COME ON|SAVE|SECOND HALF|NOT LONG|Silence/i},
    {lg:"Ligue Nationale",lang:"fr",mark:/ALLEZ|ARRÊT|MI-TEMPS|MAINTENANT|tribunes/i},
    {lg:"Liga Ibérica",lang:"es",mark:/VAMOS|PARADÓN|SEGUNDA PARTE|AHORA|grada/i},
    {lg:"Liga Lusitana",lang:"pt",mark:/VAMOS|DEFESA|SEGUNDA PARTE|AGORA|bancadas/i},
    {lg:"Liga Oranje",lang:"nl",mark:/KOM OP|REDDING|TWEEDE HELFT|NU!|tribunes/i},
    {lg:"Liga Anatolica",lang:"tr",mark:/HADİ|KURTARIŞ|İKİNCİ YARI|ŞİMDİ|sessizlik/i},
  ];
  cases.forEach(c=>{
    types.forEach(t=>{
      const pool=chantPoolFor(t,false,null,c.lg);
      F(!has(pool,italianMarkers), `${c.lg}/${t}: contiene un coro ITALIANO (${JSON.stringify(pool).slice(0,60)})`);
    });
    // almeno un tipo deve contenere un marker della lingua giusta (sanity)
    const anyLang = types.some(t=>has(chantPoolFor(t,false,null,c.lg),c.mark));
    F(anyLang, `${c.lg}: nessun coro nella lingua ${c.lang} tra i tipi comuni`);
  });
  // Italia DEVE restare italiana
  F(has(chantPoolFor("pressure",false,null,"Lega A"),/Dai|FORZA|ANDIAMO/i), `Lega A/pressure: non è italiano`);
  // Nazionale straniera (Germania) → tedesco
  F(!has(chantPoolFor("save",true,"Germania",null),italianMarkers), `Nazionale Germania/save: coro italiano`);
  // i pool per-lega esistenti restano intatti (goal tedesco = TOOOOOR)
  F(has(chantPoolFor("goal",false,null,"Deutsche Liga"),/TOOOOOOR|WAHNSINN/i), `Deutsche Liga/goal: pool per-lega perso`);
  return { fails };
});

console.log('=== CHANT-LANG ===');
if(R.fails.length){ console.log(`❌ ${R.fails.length} problemi:`); R.fails.forEach(f=>console.log('  ✗ '+f)); }
else console.log('✅ cori nella lingua giusta per tutte le leghe testate');
await browser.close(); srv.close();
process.exit(R.fails.length?1:0);
