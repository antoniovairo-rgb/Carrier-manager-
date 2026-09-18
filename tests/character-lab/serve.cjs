const fs=require('fs');const path=require('path');const http=require('http');const root=__dirname;
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');const relative=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname);const file=path.resolve(root,'.'+relative);
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('Not found');return}
 const type={'.html':'text/html; charset=utf-8','.js':'text/javascript','.glb':'model/gltf-binary','.json':'application/json','.png':'image/png'}[path.extname(file)]||'application/octet-stream';
 res.setHeader('Content-Type',type);fs.createReadStream(file).pipe(res);
});
server.listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log('Character Lab: http://127.0.0.1:'+server.address().port));
