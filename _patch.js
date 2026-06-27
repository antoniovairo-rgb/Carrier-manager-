const fs=require('fs');
let html=fs.readFileSync('C:/Users/a.vairo/CMP/CARRIER-MANAGER-AV.html','utf8');

const MARKER_START='    // Pre-bake grass stripes';
const MARKER_END='    return function(){cancelAnimationFrame(s.fid);};';

const si=html.indexOf(MARKER_START);
const ei=html.indexOf(MARKER_END)+MARKER_END.length;
if(si<0||ei<MARKER_END.length){console.error('MARKERS NOT FOUND',si,ei);process.exit(1);}

const NEW_CODE=`    // Pre-bake grass stripes
    const grassOff=document.createElement("canvas");grassOff.width=PW;grassOff.height=PH;
    const gc=grassOff.getContext("2d");
    for(var si=0;si<12;si++){
      gc.fillStyle=si%2===0?"#1d7a32":"#247a38";
      gc.fillRect(FX,FY+si*(FH/12),FW,FH/12+1.5);
    }
    gc.globalAlpha=0.055;
    for(var di=-FH;di<FW+20;di+=22){
      gc.fillStyle="#a8f5a8";
      gc.beginPath();gc.moveTo(FX+di,FY);gc.lineTo(FX+di+11,FY);
      gc.lineTo(FX+di+11-FH,FY+FH);gc.lineTo(FX+di-FH,FY+FH);gc.closePath();gc.fill();
    }
    gc.globalAlpha=1;
    const standsOff=document.createElement("canvas");standsOff.width=PW;standsOff.height=PH;
    const sc=standsOff.getContext("2d");
    sc.fillStyle="#060911";sc.fillRect(0,0,PW,PH);
    var pitchGlow=sc.createRadialGradient(FCX,FCY,50,FCX,FCY,230);
    pitchGlow.addColorStop(0,"rgba(20,90,40,0.22)");pitchGlow.addColorStop(1,"rgba(0,0,0,0)");
    sc.fillStyle=pitchGlow;sc.fillRect(0,0,PW,PH);
    var fanPal=["#dc2626","#1e40af","#f59e0b","#166534","#7c3aed","#db2777","#e5e7eb","#ea580c","#0e7490","#4d7c0f","#1e293b","#7f1d1d"];
    function bakeStand(x,y,w,h,nearPitch){
      if(w<3||h<3)return;
      var cw=4.5,rh=4.5,cols=Math.ceil(w/cw),rows=Math.ceil(h/rh);
      for(var r=0;r<rows;r++){
        var da=nearPitch?0.6-r*(0.35/Math.max(rows,1)):0.28+r*(0.3/Math.max(rows,1));
        for(var c=0;c<cols;c++){
          var ci=((r*17+c*13)^(r*c+7))%fanPal.length;
          sc.fillStyle=fanPal[ci];sc.globalAlpha=da*0.72;
          sc.fillRect(x+c*cw,y+r*rh,cw-1,rh-1);
        }
        if(r%2===0){sc.fillStyle="#000";sc.globalAlpha=0.22;sc.fillRect(x,y+r*rh+rh-1,w,1);}
      }
      sc.globalAlpha=1;
    }
    bakeStand(FX,2,FW,FY-3,true);
    bakeStand(FX,FY+FH+2,FW,PH-FY-FH-4,true);
    bakeStand(0,FY,FX-1,FH,true);
    bakeStand(FX+FW+1,FY,PW-FX-FW-1,FH,true);
    [[FX-4,FY-2],[FX+FW+4,FY-2],[FX-4,FY+FH+2],[FX+FW+4,FY+FH+2]].forEach(function(m){
      sc.strokeStyle="#6b7280";sc.lineWidth=1.5;sc.beginPath();sc.moveTo(m[0],m[1]+16);sc.lineTo(m[0],m[1]);sc.stroke();
      sc.fillStyle="#9ca3af";sc.fillRect(m[0]-4,m[1]-2,8,3);
    });
    function rRect(ctx,x,y,w,h,r){
      ctx.beginPath();
      ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
      ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
      ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
      ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);
      ctx.closePath();
    }
    function drawBg(ctx,t){
      ctx.drawImage(standsOff,0,0);
      var wave=Math.sin(t*0.0009)*2.5;
      ctx.save();ctx.globalAlpha=0.07;ctx.fillStyle="#fff";
      ctx.fillRect(FX,2+(wave>0?wave:0),FW,Math.abs(wave));
      ctx.fillRect(FX,FY+FH+2+(wave<0?Math.abs(wave):0),FW,Math.abs(wave));
      ctx.restore();
      var flicker=0.9+Math.sin(t*0.063)*0.05+Math.sin(t*0.11)*0.05;
      [[FX,FY],[FX+FW,FY],[FX,FY+FH],[FX+FW,FY+FH]].forEach(function(pt){
        var g=ctx.createRadialGradient(pt[0],pt[1],0,pt[0],pt[1],72);
        g.addColorStop(0,"rgba(255,252,210,"+(0.2*flicker)+")");g.addColorStop(1,"rgba(255,252,210,0)");
        ctx.fillStyle=g;ctx.fillRect(pt[0]-72,pt[1]-72,144,144);
      });
    }
    function drawPitch(ctx){
      ctx.drawImage(grassOff,0,0);
      ctx.save();ctx.shadowColor="rgba(255,255,255,0.3)";ctx.shadowBlur=7;
      ctx.strokeStyle="#fff";ctx.lineWidth=2.2;ctx.strokeRect(FX,FY,FW,FH);ctx.restore();
      ctx.strokeStyle="rgba(255,255,255,0.85)";ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(FX,FCY);ctx.lineTo(FX+FW,FCY);ctx.stroke();
      ctx.beginPath();ctx.arc(FCX,FCY,FH*0.088,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(FCX,FCY,2.5,0,Math.PI*2);ctx.fill();
      var paW=FW*0.56,paH=FH*0.155,paX=FCX-paW/2;
      ctx.strokeRect(paX,FY,paW,paH);ctx.strokeRect(paX,FY+FH-paH,paW,paH);
      var gaW=FW*0.30,gaH=FH*0.058,gaX=FCX-gaW/2;
      ctx.strokeRect(gaX,FY,gaW,gaH);ctx.strokeRect(gaX,FY+FH-gaH,gaW,gaH);
      ctx.fillStyle="#fff";
      ctx.beginPath();ctx.arc(FCX,FY+FH*0.115,2.5,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(FCX,FY+FH*0.885,2.5,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="rgba(255,255,255,0.78)";ctx.lineWidth=1.5;
      ctx.save();ctx.beginPath();ctx.arc(FCX,FY+FH*0.115,FH*0.068,Math.PI*1.15,Math.PI*1.85);ctx.stroke();ctx.restore();
      ctx.save();ctx.beginPath();ctx.arc(FCX,FY+FH*0.885,FH*0.068,Math.PI*0.15,Math.PI*0.85);ctx.stroke();ctx.restore();
      [[FX,FY,0,Math.PI*0.5],[FX+FW,FY,Math.PI*0.5,Math.PI],[FX,FY+FH,Math.PI*1.5,0],[FX+FW,FY+FH,Math.PI,Math.PI*1.5]].forEach(function(c){
        ctx.save();ctx.beginPath();ctx.arc(c[0],c[1],7,c[2],c[3]);ctx.stroke();ctx.restore();
      });
      var gW=FW*0.27,gD=11,gX=FCX-gW/2;
      ctx.fillStyle="rgba(255,255,255,0.06)";ctx.fillRect(gX,FY-gD,gW,gD);ctx.fillRect(gX,FY+FH,gW,gD);
      ctx.strokeStyle="rgba(255,255,255,0.6)";ctx.lineWidth=1.3;
      ctx.strokeRect(gX,FY-gD,gW,gD);ctx.strokeRect(gX,FY+FH,gW,gD);
      ctx.strokeStyle="#fff";ctx.lineWidth=2.8;
      ctx.beginPath();ctx.moveTo(gX,FY);ctx.lineTo(gX,FY-gD);ctx.lineTo(gX+gW,FY-gD);ctx.lineTo(gX+gW,FY);ctx.stroke();
      ctx.beginPath();ctx.moveTo(gX,FY+FH);ctx.lineTo(gX,FY+FH+gD);ctx.lineTo(gX+gW,FY+FH+gD);ctx.lineTo(gX+gW,FY+FH);ctx.stroke();
      var z=propsRef.current.zone;
      var zm={area:[0,0.12],bordo:[0.12,0.25],trequarti:[0.25,0.42],centro:[0.42,0.58],difesa:[0.58,0.75],propria:[0.75,1]};
      var zc={area:"#dc2626",bordo:"#f97316",trequarti:"#f59e0b",centro:"#10b981",difesa:"#3b82f6",propria:"#6366f1"};
      if(zm[z]){var zy1=FY+FH*zm[z][0],zy2=FY+FH*zm[z][1];ctx.fillStyle=(zc[z]||"#fff")+"1a";ctx.fillRect(FX+1,zy1,FW-2,zy2-zy1);}
    }
    function drawSpr(ctx,cx,cy,col,isHero,num,t){
      var bH=isHero?20:14;var bW=isHero?13:9;var hR=isHero?5.2:3.8;
      var bTop=cy-bH*0.35;var by=bTop+hR*0.5;var bh=bH*0.8;var bx=cx-bW/2;var br=bW*0.4;
      ctx.save();ctx.globalAlpha=0.32;ctx.fillStyle="#000";
      ctx.beginPath();ctx.ellipse(cx+1.5,by+bh+1.5,bW*0.55,bH*0.07,0,0,Math.PI*2);ctx.fill();ctx.restore();
      if(isHero){
        var pulse=0.6+Math.sin(t*0.004)*0.4;
        ctx.save();ctx.globalAlpha=pulse*0.78;ctx.strokeStyle="#f59e0b";ctx.lineWidth=2.8;
        ctx.shadowColor="#f59e0b";ctx.shadowBlur=18;
        ctx.beginPath();ctx.ellipse(cx,by+bh*0.45,bW*0.5+8,bH*0.5+5,0,0,Math.PI*2);ctx.stroke();ctx.restore();
      }
      rRect(ctx,bx,by,bW,bh,br);
      var kg=ctx.createLinearGradient(bx,by,bx+bW,by+bh);
      kg.addColorStop(0,col+"ff");kg.addColorStop(0.35,col+"ee");kg.addColorStop(1,col+"99");
      ctx.fillStyle=kg;ctx.fill();
      ctx.strokeStyle="rgba(255,255,255,"+(isHero?"0.7":"0.48")+")";ctx.lineWidth=isHero?1.4:1;ctx.stroke();
      ctx.strokeStyle="rgba(255,255,255,0.5)";ctx.lineWidth=isHero?1.4:1;
      ctx.beginPath();ctx.moveTo(bx+br,by+bh*0.1);ctx.lineTo(bx+bW-br,by+bh*0.1);ctx.stroke();
      ctx.fillStyle="#fff";ctx.font="bold "+(isHero?8:6)+"px Arial";
      ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillText(String(num||""),cx,by+bh*0.52);
      var aW=isHero?3:2.2,aH=isHero?5.5:4,aY=by+bh*0.28;
      ctx.fillStyle=col;ctx.globalAlpha=0.9;
      ctx.beginPath();ctx.ellipse(bx-aW*0.4,aY,aW,aH,0.18,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(bx+bW+aW*0.4,aY,aW,aH,-0.18,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=1;
      ctx.fillStyle="rgba(0,0,0,0.5)";
      ctx.beginPath();ctx.ellipse(cx-bW*0.22,by+bh-bH*0.035,bW*0.16,bH*0.045,0,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(cx+bW*0.22,by+bh-bH*0.035,bW*0.16,bH*0.045,0,0,Math.PI*2);ctx.fill();
      var headY=bTop+hR;
      var hg=ctx.createRadialGradient(cx-hR*0.3,headY-hR*0.3,hR*0.05,cx,headY,hR);
      hg.addColorStop(0,"#f8d4a0");hg.addColorStop(1,"#c78040");
      ctx.fillStyle=hg;ctx.beginPath();ctx.arc(cx,headY,hR,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="rgba(0,0,0,0.2)";ctx.lineWidth=0.6;ctx.stroke();
      ctx.fillStyle=isHero?"#4a1808":"#1e0a02";
      ctx.beginPath();ctx.arc(cx,headY,hR,Math.PI,0);ctx.fill();
      ctx.save();ctx.globalAlpha=0.45;ctx.fillStyle="#fff";
      ctx.beginPath();ctx.ellipse(cx-hR*0.3,headY-hR*0.28,hR*0.3,hR*0.18,-0.4,0,Math.PI*2);ctx.fill();ctx.restore();
    }
    function drawBall(ctx,bx,by,t){
      var sp=t*0.0025;
      ctx.save();ctx.globalAlpha=0.25;ctx.fillStyle="#000";
      ctx.beginPath();ctx.ellipse(bx+1.5,by+6,5,1.8,0,0,Math.PI*2);ctx.fill();ctx.restore();
      var bg=ctx.createRadialGradient(bx-2,by-2,0.5,bx,by,6);
      bg.addColorStop(0,"#ffffff");bg.addColorStop(0.55,"#f0ede6");bg.addColorStop(1,"#c4c0b4");
      ctx.fillStyle=bg;ctx.beginPath();ctx.arc(bx,by,6,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#1a1a1a";
      [[0,1],[0.95,0.31],[0.59,-0.81],[-0.59,-0.81],[-0.95,0.31]].forEach(function(p){
        var nx=Math.cos(sp)*p[0]-Math.sin(sp)*p[1],ny=Math.sin(sp)*p[0]+Math.cos(sp)*p[1];
        ctx.beginPath();ctx.arc(bx+nx*3.5,by+ny*3.5,1.7,0,Math.PI*2);ctx.fill();
      });
      ctx.save();ctx.globalAlpha=0.52;ctx.fillStyle="#fff";
      ctx.beginPath();ctx.ellipse(bx-2,by-2,1.8,1.1,0.3,0,Math.PI*2);ctx.fill();ctx.restore();
    }
    function drawParts(ctx){
      s.particles=s.particles.filter(function(p){
        p.life-=0.022;p.x+=p.vx;p.y+=p.vy;p.vy+=0.07;
        if(p.life<=0)return false;
        ctx.save();ctx.globalAlpha=p.life*0.9;ctx.fillStyle=p.col;
        ctx.beginPath();ctx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2);ctx.fill();ctx.restore();
        return true;
      });
    }
    function drawCtxPlayers(ctx,p,hcx,hcy,t){
      var list=PC_CTX[p.zone]||PC_CTX.centro;
      for(var i=0;i<list.length;i++){
        var c=list[i];
        var bob=Math.sin(t*0.0025+i*1.2)*2;
        var col=c.t==="opp"?(p.oppCol||"#ef4444"):(p.homeCol||"#22c55e");
        drawSpr(ctx,hcx+c.dx,hcy+c.dy+bob,col,false,c.t==="opp"?i+11:i+2,t);
      }
    }
    function drawWalkout(ctx,t){
      var p=propsRef.current;
      s.walkP=Math.min(1,s.walkP+0.005);
      ctx.fillStyle="rgba(3,6,16,0.74)";ctx.fillRect(0,0,PW,PH);
      var tX=FCX,tY=FY+FH-10;
      var tBeam=ctx.createRadialGradient(tX,tY,0,tX,tY,55);
      tBeam.addColorStop(0,"rgba(255,242,150,0.32)");tBeam.addColorStop(1,"rgba(255,242,150,0)");
      ctx.fillStyle=tBeam;ctx.fillRect(tX-55,tY-55,110,65);
      ctx.fillStyle="#040810";ctx.beginPath();ctx.ellipse(tX,tY,20,26,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#f59e0b";ctx.lineWidth=1.8;ctx.beginPath();ctx.ellipse(tX,tY,20,26,0,0,Math.PI*2);ctx.stroke();
      var np=Math.min(11,Math.floor(s.walkP*14));
      for(var i=0;i<np;i++){
        var pr=Math.min(1,(s.walkP*14-i)/10);
        var isH=i%2===0;
        var col=isH?(p.homeCol||"#22c55e"):(p.oppCol||"#ef4444");
        drawSpr(ctx,tX+(isH?-14:14),tY+(FCY-tY)*pr-2,col,false,i+1,t);
      }
      if(s.walkP>0.55){
        var pp2=Math.min(1,(s.walkP-0.55)/0.45);
        var heroWY=tY+(FCY-tY)*pp2;
        var spot=ctx.createRadialGradient(tX,heroWY,0,tX,heroWY,42);
        spot.addColorStop(0,"rgba(255,242,100,0.2)");spot.addColorStop(1,"rgba(255,242,100,0)");
        ctx.fillStyle=spot;ctx.fillRect(tX-42,heroWY-42,84,84);
        drawSpr(ctx,tX,heroWY,p.homeCol||"#22c55e",true,10,t);
      }
      var hN=(p.homeClub&&(p.homeClub.n||p.homeClub.name))||"HOME";
      var oN=(p.opponents&&p.opponents[0]&&p.opponents[0].name)||"AWAY";
      ctx.save();ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.shadowColor="#f59e0b";ctx.shadowBlur=22;
      ctx.fillStyle="#f59e0b";ctx.font="bold 15px sans-serif";ctx.fillText(hN+"  ⚽  "+oN,PW/2,20);
      ctx.shadowBlur=0;ctx.fillStyle="rgba(255,255,255,0.38)";ctx.font="10px sans-serif";ctx.fillText("KICK OFF",PW/2,34);
      ctx.restore();
      if(s.walkP>=1&&!s.walkDone){s.walkDone=true;if(propsRef.current.onWalkoutDone)propsRef.current.onWalkoutDone();}
    }
    function render(t){
      s.fid=requestAnimationFrame(render);
      var p=propsRef.current;
      var dm=Math.abs(p.playerX-s.prevPX)+Math.abs(p.playerY-s.prevPY);
      if(dm>0.08){s.isMoving=true;s.movT=20;}
      else if(s.movT>0){s.movT--;if(!s.movT)s.isMoving=false;}
      s.prevPX=p.playerX;s.prevPY=p.playerY;
      var hcx=toX(p.playerY),hcy=toY(p.playerX);
      var iz=p.actionZoom;
      var tZ=iz?2.4:1,tCX=iz?hcx:FCX,tCY=iz?hcy:FCY,ls=iz?0.08:0.05;
      s.camZ+=(tZ-s.camZ)*ls;s.camX+=(tCX-s.camX)*ls;s.camY+=(tCY-s.camY)*ls;
      s.ballCx+=(hcx+(iz?6:2)-s.ballCx)*0.12;
      s.ballCy+=(hcy+(iz?3:1)-s.ballCy)*0.12;
      ctx.clearRect(0,0,PW,PH);
      ctx.save();
      ctx.translate(PW/2-s.camZ*s.camX,PH/2-s.camZ*s.camY);
      ctx.scale(s.camZ,s.camZ);
      drawBg(ctx,t);
      if(p.matchPhase!=="walkout"){
        drawPitch(ctx);
        if(iz&&s.isMoving){
          ctx.save();ctx.globalAlpha=0.16;ctx.strokeStyle="#fff";ctx.lineWidth=1;
          for(var li=0;li<6;li++){
            var la=Math.sin(t*0.01+li)*Math.PI;
            var ld=28+li*9;
            ctx.beginPath();ctx.moveTo(hcx+Math.cos(la)*ld,hcy+Math.sin(la)*ld);
            ctx.lineTo(hcx+Math.cos(la)*(ld+14),hcy+Math.sin(la)*(ld+14));ctx.stroke();
          }
          ctx.restore();
        }
        if(iz){
          drawCtxPlayers(ctx,p,hcx,hcy,t);
        } else {
          var allP=p.allPlayers||[];
          allP.forEach(function(pl,i){
            if(!pl)return;
            var col=pl.team==="home"?(p.homeCol||"#22c55e"):pl.team==="ref"?"#0d0d0d":(p.oppCol||"#ef4444");
            drawSpr(ctx,toX(pl.y||50),toY(pl.x||50),col,false,i+1,t);
          });
        }
        drawSpr(ctx,hcx,hcy,p.homeCol||"#22c55e",true,10,t);
        drawBall(ctx,s.ballCx,s.ballCy,t);
        drawParts(ctx);
      }
      ctx.restore();
      if(p.matchPhase==="walkout")drawWalkout(ctx,t);
      var vg=ctx.createRadialGradient(PW/2,PH/2,PH*0.22,PW/2,PH/2,PH*0.72);
      vg.addColorStop(0,"rgba(0,0,0,0)");vg.addColorStop(1,"rgba(0,0,0,0.5)");
      ctx.fillStyle=vg;ctx.fillRect(0,0,PW,PH);
      if(iz){
        var fg=ctx.createRadialGradient(PW/2,PH/2,28,PW/2,PH/2,165);
        fg.addColorStop(0,"rgba(0,0,0,0)");fg.addColorStop(1,"rgba(0,0,0,0.48)");
        ctx.fillStyle=fg;ctx.fillRect(0,0,PW,PH);
        ctx.save();ctx.globalAlpha=0.07;ctx.fillStyle="#f59e0b";ctx.fillRect(0,0,PW,PH);ctx.restore();
        ctx.save();ctx.globalAlpha=0.55;ctx.fillStyle="#000";
        ctx.fillRect(0,0,PW,10);ctx.fillRect(0,PH-10,PW,10);ctx.restore();
      }
    }
    s.fid=requestAnimationFrame(render);
    return function(){cancelAnimationFrame(s.fid);};`;

html=html.slice(0,si)+NEW_CODE+html.slice(ei);
fs.writeFileSync('C:/Users/a.vairo/CMP/CARRIER-MANAGER-AV.html',html);
console.log('Done. File size:',html.length);
