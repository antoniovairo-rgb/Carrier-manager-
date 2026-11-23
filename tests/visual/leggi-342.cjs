const W=JSON.parse(require("fs").readFileSync(process.argv[2]));const F=W.f;console.log(JSON.stringify(W.m));
let c=-1;for(let i=1;i<F.length;i++)if(F[i][27]&&F[i][28]>0&&(!F[i-1][27]||F[i-1][28]<=0)){c=i;break;}
const a=+(process.argv[3]||-0.6),b=+(process.argv[4]||0.8),st=+(process.argv[5]||2);
console.log("rel   hy    by    d     py   ry     g       ct    ts   gw   act   actT arcT  ws vHero minPiede");
for(let i=1;i<F.length;i++){const f=F[i],p=F[i-1],dt=f[0]-p[0];const rel=f[0]-F[c][0];if(rel<a||rel>b||i%st)continue;const d=Math.hypot(f[5]-f[2],f[6]-f[3],f[7]-f[4]);const vh=Math.hypot(f[8]-p[8],f[10]-p[10])/dt;
console.log(rel.toFixed(2).padStart(5),f[3].toFixed(2),f[6].toFixed(2),d.toFixed(2).padStart(5),f[9].toFixed(2),f[11].toFixed(2).padStart(6),String(f[21]).padEnd(7),String(f[22]).padStart(5),String(f[23]).padStart(4),String(f[24]).padStart(4),String(f[25]).padEnd(6),String(f[26]).padStart(5),String(f[28]).padStart(6),String(f[29]).padStart(2),vh.toFixed(1).padStart(5),Math.min(f[16],f[19]).toFixed(2));}
