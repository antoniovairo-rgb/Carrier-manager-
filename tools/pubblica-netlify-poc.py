# Copia il build nella cartella di pubblicazione Netlify e toglie il badge «Powered by Netlify»:
# lo script del badge (/.netlify/scripts/hud) si ferma se trova gia' un elemento #nl-badge-frame (letto nel suo sorgente).
import shutil,sys
S='/tmp/claude-0/-home-user/394ea3c3-9288-5fc6-bf47-a074e31528b0/scratchpad/netlify-poc/'
h=open('/home/user/cm-poc/CARRIER-MANAGER-AV.html',encoding='utf-8').read()
snip='<div id="nl-badge-frame" hidden aria-hidden="true"></div><style>#nl-hud-frame,#nl-badge-frame{display:none!important}</style>'
i=h.index('<body'); j=h.index('>',i)+1
h2=h[:j]+snip+h[j:]
for n in ('CARRIER-MANAGER-AV.html','index.html'): open(S+n,'w',encoding='utf-8').write(h2)
print('iniettati',len(snip),'byte dopo <body>')
