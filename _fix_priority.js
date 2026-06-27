// _fix_priority.js — Fix 4 priority bugs + graphical improvements
// NOTE: ball shadow and player shadow are already in the file, skipping G3/G4
const fs=require('fs');
const path='C:/Users/a.vairo/CMP/CARRIER-MANAGER-AV.html';
let html=fs.readFileSync(path,'utf8');
let ok=0,fail=0;
function rep(label,old,neu){
  if(!html.includes(old)){console.log('FAIL:',label,'\n  anchor:',JSON.stringify(old.slice(0,90)));fail++;return false;}
  html=html.replace(old,neu);console.log('OK:',label);ok++;return true;
}

// ══════════════════════════════════════════════════════════════════
// FIX 1a: Invert gy() — home team at BOTTOM, attacks upward (↑)
// ══════════════════════════════════════════════════════════════════
rep('invert gy() — home at bottom',
  `const gx=gy_=>FX+gy_/100*FW;  // game y → canvas x
    const gy=gx_=>FY+gx_/100*FH;  // game x → canvas y`,
  `const gx=gy_=>FX+gy_/100*FW;          // game y → canvas x
    const gy=gx_=>FY+FH*(1-gx_/100);      // game x → canvas y (home BOTTOM, attacks upward ↑)`
);

// FIX 1b: Zone rects — after inversion gy(zx1)>gy(zx2) → swap to avoid negative height
rep('zone fillRect + strokeRect swap for inverted gy',
  `        ctx.fillRect(FX,gy(zx1),FW,gy(zx2)-gy(zx1));
        ctx.strokeStyle=(zCol[z]||"#fff")+"44";ctx.lineWidth=1;
        ctx.strokeRect(FX,gy(zx1),FW,gy(zx2)-gy(zx1));`,
  `        ctx.fillRect(FX,gy(zx2),FW,gy(zx1)-gy(zx2));
        ctx.strokeStyle=(zCol[z]||"#fff")+"44";ctx.lineWidth=1;
        ctx.strokeRect(FX,gy(zx2),FW,gy(zx1)-gy(zx2));`
);

// ══════════════════════════════════════════════════════════════════
// FIX 2: DPad — revert ▲/▼ to original (correct with inverted gy)
//   UP (▲) = +x = move toward opponent goal (canvas TOP)
//   DOWN (▼) = -x = move toward own goal (canvas BOTTOM)
// ══════════════════════════════════════════════════════════════════
rep('DPad ▲ = +x (forward)',
  `btn("▲",-2.5,0)`,
  `btn("▲",+2.5,0)`
);
rep('DPad ▼ = -x (backward)',
  `btn("▼",+2.5,0)`,
  `btn("▼",-2.5,0)`
);

// ══════════════════════════════════════════════════════════════════
// FIX 3: Reduce HL zoom 1.65x → 1.22x (keeps field context visible)
// ══════════════════════════════════════════════════════════════════
rep('reduce zoom 1.65→1.22',
  `const targetZoom=isHL?1.65:1.0;`,
  `const targetZoom=isHL?1.22:1.0;`
);

// ══════════════════════════════════════════════════════════════════
// FIX 4: Tactical AI movement on BG_MATCH possession events
// ══════════════════════════════════════════════════════════════════
rep('tactical formation shift on possession change',
  `if(ev.poss)setPossession(p=>clamp(p+(ev.poss||0),20,80));`,
  `if(ev.poss){
            setPossession(p=>clamp(p+(ev.poss||0),20,80));
            const isHomeGain=ev.poss>0;
            setMatchPlayers(prev=>prev.map((pl)=>{
              if(pl.team==="ref")return pl;
              const r=(Math.random()-0.5)*2.5;
              if(pl.team==="away"){
                // Away defends (x→high toward canvas top) when home has ball
                // Away attacks (x→low toward canvas bottom = home half) when away has ball
                const shift=isHomeGain?Math.random()*5+2:-Math.random()*5-2;
                return{...pl,x:Math.min(92,Math.max(48,pl.x+shift+r))};
              }else{
                // Home attacks (x→high) when home has ball; retreats (x→low) when away attacks
                const shift=isHomeGain?Math.random()*4+1:-Math.random()*4-1;
                return{...pl,x:Math.min(90,Math.max(5,pl.x+shift+r))};
              }
            }));
          }`
);

// ══════════════════════════════════════════════════════════════════
// GRAPHICAL — G1: 10 stripes + radial vignette (richer grass)
// ══════════════════════════════════════════════════════════════════
rep('grass 10 stripes + vignette',
  `    const stripeH=FH/8;
    for(let i=0;i<8;i++){
      gc.fillStyle=i%2===0?"#1a6b2a":"#1e7a30";
      gc.fillRect(FX,FY+i*stripeH,FW,stripeH);
    }
    for(let i=0;i<2000;i++){
      const nx=FX+Math.random()*FW,ny=FY+Math.random()*FH;
      gc.fillStyle=\`rgba(0,0,0,\${Math.random()*0.05})\`;gc.fillRect(nx,ny,1,1);
    }`,
  `    const stripeH=FH/10;
    for(let i=0;i<10;i++){
      gc.fillStyle=i%2===0?"#1a6b28":"#1d7530";
      gc.fillRect(FX,FY+i*stripeH,FW,stripeH);
    }
    for(let i=0;i<2200;i++){
      const nx=FX+Math.random()*FW,ny=FY+Math.random()*FH;
      gc.fillStyle=\`rgba(0,0,0,\${Math.random()*0.04})\`;gc.fillRect(nx,ny,1,1);
    }
    const pgv=gc.createRadialGradient(FCX,FCY,FH*0.12,FCX,FCY,FH*0.7);
    pgv.addColorStop(0,"rgba(0,0,0,0)");pgv.addColorStop(1,"rgba(0,0,0,0.2)");
    gc.fillStyle=pgv;gc.fillRect(FX,FY,FW,FH);`
);

// GRAPHICAL — G2: Sharper lines (1.5px) + corner arcs
rep('sharper pitch lines + corner arcs',
  `      // Centre line (horizontal in portrait = vertical on field)
      ctx.strokeStyle="rgba(255,255,255,0.7)";ctx.lineWidth=1.2;
      ctx.beginPath();ctx.moveTo(FX,FCY);ctx.lineTo(FX+FW,FCY);ctx.stroke();
      // Centre circle
      ctx.beginPath();ctx.arc(FCX,FCY,FH*0.10,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(FCX,FCY,2.5,0,Math.PI*2);ctx.fill();`,
  `      // Centre line
      ctx.strokeStyle="rgba(255,255,255,0.78)";ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(FX,FCY);ctx.lineTo(FX+FW,FCY);ctx.stroke();
      // Centre circle + dot
      ctx.beginPath();ctx.arc(FCX,FCY,FH*0.10,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(FCX,FCY,3,0,Math.PI*2);ctx.fill();
      // Corner arcs
      const cAR=FH*0.024;
      ctx.beginPath();ctx.arc(FX,FY,cAR,0,Math.PI/2);ctx.stroke();
      ctx.beginPath();ctx.arc(FX+FW,FY,cAR,Math.PI/2,Math.PI);ctx.stroke();
      ctx.beginPath();ctx.arc(FX,FY+FH,cAR,-Math.PI/2,0);ctx.stroke();
      ctx.beginPath();ctx.arc(FX+FW,FY+FH,cAR,Math.PI,-Math.PI/2);ctx.stroke();`
);

// GRAPHICAL — G3: Amber zone heatmap wash during HL phases
rep('zone amber heatmap during highlights',
  `        if(p.matchPhase!=="walkout"){`,
  `        if(p.matchPhase!=="walkout"){
          const isHLph=["hl_move","hl_choose","hl_result","hl_intro"].includes(p.matchPhase);
          if(isHLph&&p.zone){
            const zM2={propria:[0,25],difesa:[25,42],centro:[42,58],trequarti:[58,75],bordo:[75,88],area:[88,100]};
            const zr2=zM2[p.zone];
            if(zr2){
              const y1=gy(zr2[1]),y2=gy(zr2[0]); // after inversion: y1<y2
              const zG=ctx.createLinearGradient(FX,y1,FX,y2);
              zG.addColorStop(0,"rgba(245,158,11,0)");
              zG.addColorStop(0.5,"rgba(245,158,11,0.09)");
              zG.addColorStop(1,"rgba(245,158,11,0)");
              ctx.fillStyle=zG;ctx.fillRect(FX,y1,FW,y2-y1);
            }
          }`
);

// ── Brace balance check + save ──
let b=0;for(const c of html){if(c==='{')b++;else if(c==='}')b--;}
console.log('\n=== RESULT ===');
console.log('Applied:',ok,'  Failed:',fail,'  Brace balance:',b);
if(b!==0){console.error('BRACE IMBALANCE — NOT saved!');process.exit(1);}
fs.writeFileSync(path,html,'utf8');
console.log('Saved.',Math.round(html.length/1024),'KB');
