#!/usr/bin/env python3
"""Giro 250 (PO-512): controlli della proposta nomi club. Solo lettura di src/; stampa il verdetto
e, con un percorso come argomento, scrive la tabella markdown per lega (quella di PROPOSTA-giro250.md)."""
import re, sys, unicodedata, os, collections
R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
src02 = open(f"{R}/src/02-club-leghe-albo.jsx", encoding="utf-8").read()
src05 = open(f"{R}/src/05-cronaca-stadi-formazioni.jsx", encoding="utf-8").read()
src09 = open(f"{R}/src/09-audio-scout-anagrafiche.jsx", encoding="utf-8").read()
CL = re.findall(r'mkT\("([^"]+)","([^"]+)","([^"]+)",\d+,"[^"]*","[^"]*","[^"]*","([^"]+)"\)', src02)
assert len(CL) == 252, len(CL)
m = re.search(r'const _CR_BRANDS=\[(.*?)\];', src09, re.S)
BR = re.findall(r'"([^"]+)"', m.group(1))
stad = set(re.findall(r'"([^"]+)"', re.search(r'const STADIUM_POOLS=\[(.*?)\n\];', src05, re.S).group(1)))
cs = dict(re.findall(r'"([a-z0-9]+)":"([^"]+)"', re.search(r'const CLUB_STADIUMS=\{(.*?)\n\};', src05, re.S).group(1)))
stad |= set(cs.values())
# giro 247: già decisi (applicati dal giro 248): nome A scelto, sigla
G247 = {"inter":("FC Milano Brera","MBR"),"milan":("FC Milano Sempione","MSE"),"napoli":("FC Napoli Fuorigrotta","NFG"),
 "lazio":("FC Flaminio","FLM"),"psg":("FC Parigi Ovest","PGO"),"tor":("FC Torino Santa Rita","TSR"),"fio":("FC Firenze","FRZ"),
 "sam":("FC Genova Ponente","GPO"),"sas":("FC Sassolese","SSL"),"bet":("FC Heliópolis","HEL"),"cel":("FC Vigués","VGS"),
 "get":("FC Getafense","GTF"),"esp":("FC Sarrià","SRR"),"bay":("FC Isar","ISR"),"kol":("FC Domstadt","DMS"),"spo":("FC Lisboa Norte","LNO")}
# sigle ufficiali/abbreviazioni note da non usare (dalla memoria: non verificate su una fonte)
UFF = {"INT","MIL","NAP","LAZ","TOR","FIO","SAM","SAS","BET","JUV","BOL","VER","MON","CHE","AVL","WHU","EVE","LEI","CRY","FUL","BRE",
 "VIL","RSO","ALM","BVB","B04","WOB","SVD","BOC","FCU","RCL","MHSC","SDR","FCP","BOA","GIL","FAM","VIZ","ARO","SCL","SPA","EXC","STD",
 "USG","CER","STV","BJK","IBFK","PAL","CTZ","BAR","VEN","FRO","SAL","CIT","COS","BRE","LEC","SWA","SHU","BUR","NOR","WBA","MIL",
 "CAR","WAT","STK","QPR","STP","VAFC","LEV","VLL","ZAR","OVI","COR","FCA","FCN","FCK","FCM","FCS","S04","TWE","UTR","GRO","VOL","EMM",
 "ANN","QRM","ACA","SCB","RFCS","GAL","FB","MUN","MCI","LIV","ARS","TOT","NEW","BHA","WOL","NFO","BOU","RMA","FCB","ATM","SEV"}
# ---- proposte: id: (classe, club reale evocato, A, sigla A, B, sigla B, stadio) ----
P = {
 # Lega A
 "juve":("5","Juventus (Torino)","FC Torino Vallette","TVL","FC Vallette","VLT","Stadio Valcolle (resta)"),
 "bol":("3","Bologna","FC Bolognese","BLG","FC Due Torri","DTR","Stadio Felsineo → A: Stadio Bolognese · B: Stadio delle Due Torri"),
 "ver":("4","Hellas Verona («gli Scaligeri»)","FC Veronese","VRN","FC Adige","ADG","Stadio Scaligero → Stadio Veronese (+ pool: «Stadio Scaligero Sud» → «Stadio Veronese Sud»)"),
 "mon2":("4","Monza («i Brianzoli»)","FC Monzese","MZS","FC Lambro","LMB","Brianza Stadium (resta: zona)"),
 # Premier Division
 "mun":("5","Manchester United","FC Manchester West","MWE","FC Stretford","SFD","Northwich Stadium (resta; vedi nota)"),
 "che":("4","Chelsea (Stamford Bridge)","FC Kensington","KSN","FC King's Road","KGR","Riverside Park (resta)"),
 "avl":("4","Aston Villa","FC Birmingham North","BHN","FC Witton","WTN","Aston Park → A: Birmingham North Park · B: Witton Stadium"),
 "whu":("4","West Ham («Hammers»)","FC East London","ELO","FC Stratford","SRF","East Stadium (resta)"),
 "eve":("4","Everton (Goodison Park)","FC Walton","WLT","FC Kirkdale","KRK","Merseyside Park (resta)"),
 "lei":("4","Leicester («Foxes»)","FC Leicester","LCS","FC Aylestone","AYL","Midlands Stadium (resta)"),
 "cry":("4","Crystal Palace (Selhurst Park)","FC Croydon","CYD","FC South Norwood","SNW","Croydon Park (resta)"),
 "ful":("4","Fulham (Craven Cottage)","FC Hammersmith","HMS","FC Bishops Park","BPK","nessuna voce in CLUB_STADIUMS"),
 "bre":("4","Brentford (Griffin Park)","FC Hounslow","HNS","FC Kew","KEW","nessuna voce in CLUB_STADIUMS"),
 # Liga Ibérica
 "vill":("4","Villarreal («Submarino Amarillo»)","FC Plana Baixa","PBX","FC Millars","MLR","Estadio Amarillo (resta)"),
 "rsoc":("4","Real Sociedad","FC Donostiarra","DNT","FC Gipuzkoa","GPZ","Estadio Donostiarra (resta con A; con B → Estadio de Gipuzkoa)"),
 "alm":("3","Almería (vedi doppione con alm2)","FC Almería","FAL","FC Cabo de Gata","CDG","nessuna voce in CLUB_STADIUMS"),
 # Deutsche Liga
 "bvb":("2","Borussia Dortmund","FC Westfalen","WSF","FC Hörde","HRD","Goldwald Stadion → Hörde Stadion"),
 "b04":("2","Bayer Leverkusen","FC Opladen","OPL","FC Wiesdorf","WSD","Werkstadt Arena → A: Opladen Arena · B: Wiesdorf Arena"),
 "wob":("2","Wolfsburg","FC Aller","ALR","FC Fallersleben","FLL","nessuna voce in CLUB_STADIUMS"),
 "dsc":("4","Darmstadt («Die Lilien»)","FC Darmstadt","DMT","FC Bessungen","BSG","nessuna voce in CLUB_STADIUMS"),
 "boc":("5","Bochum (il «Ruhrpott» è anche Dortmund e Gelsenkirchen)","FC Bochum","BCH","FC Grumme","GRM","nessuna voce in CLUB_STADIUMS"),
 "ber":("5","Union Berlin (Köpenick, a sud-est: «Nord» porta fuori strada)","FC Berlin Köpenick","BKP","FC Köpenick","KPN","nessuna voce in CLUB_STADIUMS"),
 # Ligue Nationale
 "len":("3","Lens","FC Lensois","LSO","FC Gohelle","GHL","Lens Stadium (resta)"),
 "mtp":("2","Montpellier (nome troncato)","FC Montpellier","MPL","FC Hérault","HRT","nessuna voce in CLUB_STADIUMS"),
 "rei":("3","Reims","FC Reims","RMS","FC Marne","MRN","nessuna voce in CLUB_STADIUMS"),
 # Liga Lusitana
 "por":("2","FC Porto","FC Portuense","PTN","FC Campanhã","CPH","Estádio Azul (resta)"),
 "bra":("5","Braga (il Minho è anche Guimarães)","FC Bracarense","BRC","FC Dume","DUM","nessuna voce in CLUB_STADIUMS"),
 "rioave":("2","Rio Ave (Vila do Conde)","FC Vila do Conde","VDC","FC Vilacondense","VCE","nessuna voce in CLUB_STADIUMS"),
 "bav":("4","Boavista («As Panteras», Porto)","FC Foz do Douro","FDD","FC Ramalde","RML","nessuna voce in CLUB_STADIUMS"),
 "gviz":("4","Gil Vicente (Barcelos)","FC Barcelos","BCL","FC Cávado","CVD","nessuna voce in CLUB_STADIUMS"),
 "fama":("2","Famalicão","FC Famalicense","FMC","FC Vale do Ave","VDA","nessuna voce in CLUB_STADIUMS"),
 "vize":("2","Vizela","FC Vizelense","VZL","FC Caldas de Vizela","CDV","nessuna voce in CLUB_STADIUMS"),
 "aroca":("2","Arouca","FC Arouquense","ARQ","FC Serra da Freita","SDF","nessuna voce in CLUB_STADIUMS"),
 "scar":("4","Santa Clara (Ponta Delgada, Azzorre)","FC Ponta Delgada","PDG","FC Açoriano","ACO","nessuna voce in CLUB_STADIUMS"),
 # Liga Oranje
 "spa":("2","Sparta Rotterdam","FC Rotterdam Spangen","RSP","FC Spangen","SPG","nessuna voce in CLUB_STADIUMS"),
 "exc":("2","Excelsior Rotterdam","FC Rotterdam Kralingen","RKL","FC Kralingen","KLG","nessuna voce in CLUB_STADIUMS"),
 # Liga Belga
 "std":("3","Standard Liège","FC Liegi","LGI","FC Ourthe","OUR","Stade des Ardennes (resta)"),
 "usj":("4","Union Saint-Gilloise (Bruxelles)","FC Bruxelles Sud","BXS","FC Saint-Gilles","SGL","nessuna voce in CLUB_STADIUMS"),
 "krc":("5","Cercle Brugge (la «Westflandria» contiene la «Fiandria» del Club Brugge)","FC Brugse","BGS","FC Sint-Andries","SAD","nessuna voce in CLUB_STADIUMS"),
 "stu2":("2","Sint-Truiden (nome troncato)","FC Sint-Truiden","SNT","FC Haspengouw","HSP","nessuna voce in CLUB_STADIUMS"),
 # Liga Anatolica
 "bes":("4","Beşiktaş («Kara Kartal»)","FC Boğaziçi","BGZ","FC Ortaköy","ORT","Boğaz Park (resta: coerente con A)"),
 "bas":("5","İstanbul Başakşehir (il Bosforo è di Beşiktaş)","FC Istanbul Ovest","IOV","FC İkitelli","IKT","nessuna voce in CLUB_STADIUMS"),
 # Lega B
 "pal":("3","Palermo","FC Palermitano","PLR","FC Conca d'Oro","CDO","nessuna voce in CLUB_STADIUMS"),
 "cat":("5","Catanzaro («Calabro» vale anche per Cosenza e Reggio)","FC Catanzarese","CTN","FC Tre Colli","TCL","nessuna voce in CLUB_STADIUMS"),
 "bar2":("5","Bari («Pugliese» vale anche per Lecce, Foggia, Taranto)","FC Barese","BSE","FC Terra di Bari","TDB","nessuna voce in CLUB_STADIUMS"),
 "ven":("3","Venezia","FC Veneziano","VNZ","FC Sant'Elena","SEN","nessuna voce in CLUB_STADIUMS"),
 "fro":("3","Frosinone","FC Frusinate","FRS","FC Valle del Sacco","VDS","nessuna voce in CLUB_STADIUMS"),
 "sal":("3","Salernitana","FC Salerno","SLE","FC Irno","IRN","Stadio Salernum → A: Stadio di Salerno · B: Stadio dell'Irno"),
 "cit":("5","Cittadella («Cittadino» = abitante di una città)","FC Cittadellese","CTD","FC Alta Padovana","APD","nessuna voce in CLUB_STADIUMS"),
 "cos":("3","Cosenza","FC Cosentino","CSN","FC Busento","BSN","nessuna voce in CLUB_STADIUMS"),
 "bres":("4","Brescia («Leonessa d'Italia»)","FC Bresciano","BCN","FC Mompiano","MMP","nessuna voce in CLUB_STADIUMS"),
 "lec2":("5","Lecco (il Lario è anche il lago del Como)","FC Lecchese","LCC","FC Resegone","RSG","nessuna voce in CLUB_STADIUMS"),
 # Championship
 "swn":("4","Swansea («Swans»)","FC Swansea","SWS","FC Landore","LDR","nessuna voce in CLUB_STADIUMS"),
 "shu":("5","Sheffield United (gli «Steelers» sono una squadra di hockey di Sheffield)","FC Sheffield South","SHS","FC Sharrow","SRW","nessuna voce in CLUB_STADIUMS"),
 "bur":("4","Burnley («Clarets»)","FC Burnley","BNL","FC Calder","CLD","Lancashire Stadium (resta)"),
 "nor":("4","Norwich («Canaries»)","FC Norwich","NRW","FC Norfolk","NFK","nessuna voce in CLUB_STADIUMS"),
 "wba":("5","West Bromwich Albion («Albion» è anche il Brighton)","FC West Bromwich","WBR","FC Sandwell","SDW","nessuna voce in CLUB_STADIUMS"),
 "milw":("4","Millwall («Dockers»)","FC Bermondsey","BMD","FC Rotherhithe","RTH","nessuna voce in CLUB_STADIUMS"),
 "car":("4","Cardiff («Bluebirds»)","FC Cardiff","CDF","FC Leckwith","LCK","nessuna voce in CLUB_STADIUMS"),
 "wat":("4","Watford («Hornets»)","FC Watford","WFD","FC Hertfordshire","HFS","nessuna voce in CLUB_STADIUMS"),
 "sto":("4","Stoke («Potters»)","FC Stoke","SKE","FC Staffordshire","SFS","nessuna voce in CLUB_STADIUMS"),
 "qpr":("2","Queens Park Rangers (Queensway è a Bayswater)","FC Shepherd's Bush","SBU","FC White City","WCY","nessuna voce in CLUB_STADIUMS"),
 # Deutsche Liga 2
 "stp":("2","St. Pauli (Amburgo)","FC Hamburg Hafen","HHF","FC Reeperbahn","RPB","nessuna voce in CLUB_STADIUMS"),
 # Ligue Nationale 2
 "val2":("5","Valenciennes («Valencien» ricorda Valencia)","FC Valenciennes","VNS","FC Escaut","ESC","nessuna voce in CLUB_STADIUMS"),
 # Liga Ibérica 2
 "lev":("4","Levante («Granota»)","FC València Nord","VNR","FC Orriols","ORR","nessuna voce in CLUB_STADIUMS"),
 "vld":("4","Valladolid («Pucela»)","FC Vallisoletano","VLS","FC Pisuerga","PSR","nessuna voce in CLUB_STADIUMS"),
 "zgz":("4","Real Zaragoza («maños»)","FC Zaragozano","ZRG","FC Ebro","EBR","nessuna voce in CLUB_STADIUMS"),
 "ovi":("4","Real Oviedo («carbayones»)","FC Ovetense","OVT","FC Naranco","NRC","nessuna voce in CLUB_STADIUMS"),
 "cor2":("3","Córdoba («ciudad califal»)","FC Cordobés","CDB","FC Sierra Morena","SMR","nessuna voce in CLUB_STADIUMS"),
}
# classe 1* = per città, ma il nome di oggi coincide (anche come sottostringa) col nome ufficiale del club reale
# (dalla memoria, NON verificato su una fonte in questo giro). Precedente: «FC Köln» rinominato al giro 6.
P1S = {
 "aug":("FC Augsburg 1907","FC Augusta","AGS","FC Lech","LCH"),
 "nub":("1. FC Nürnberg","FC Norimberga","NRB","FC Pegnitz","PGN"),
 "kaa":("1. FC Kaiserslautern","FC Lautern","LTN","FC Pfalz","PFZ"),
 "mag":("1. FC Magdeburg","FC Börde","BRD","FC Elbaue","ELB"),
 "sar":("1. FC Saarbrücken","FC Saarland","SRL","FC Saar","SAA"),
 "s04":("FC Gelsenkirchen-Schalke 04","FC Emscher","EMS","FC Buer","BUE"),
 "twe":("FC Twente","FC Enschede","ENS","FC Enschede Zuid","EZD"),
 "utr":("FC Utrecht","FC Oudegracht","ODG","FC Zuilen","ZUL"),
 "gron":("FC Groningen","FC Groninger","GNR","FC Hunze","HNZ"),
 "volen":("FC Volendam","FC Waterland","WTL","FC Edam","EDM"),
 "emm":("FC Emmen","FC Drenthe","DRT","FC Emmerhout","EMH"),
 "ann":("FC Annecy","FC Annecien","ANC","FC Haute-Savoie","HSV"),
 "que":("FC Rouen 1899","FC Normandia","NMD","FC Seine-Maritime","SMT"),
}
ids = {c[0]: c for c in CL}
for k in list(P) + list(P1S):
    assert k in ids, k
    assert k not in G247, k
nrm = lambda t: re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFKD', t).encode('ascii','ignore').decode().lower())
def subseq(a, n):
    i = 0; n = nrm(n)
    for ch in nrm(a):
        i = n.find(ch, i)
        if i < 0: return False
        i += 1
    return bool(a)
err = []
# nomi finali "di riferimento" = oggi, con 247 applicato
fin_n = {k: (G247[k][0] if k in G247 else ids[k][1]) for k in ids}
fin_a = {k: (G247[k][1] if k in G247 else ids[k][2]) for k in ids}
prop = []
for k, v in P.items(): prop += [(k, "A", v[2], v[3]), (k, "B", v[4], v[5])]
for k, v in P1S.items(): prop += [(k, "A", v[1], v[2]), (k, "B", v[3], v[4])]
cambia = set(P) | set(P1S)
altri_n = {fin_n[k] for k in ids if k not in cambia}; altri_a = {fin_a[k] for k in ids if k not in cambia}
seen_n, seen_a = collections.Counter(), collections.Counter()
for k, w, n, a in prop:
    for b in BR:
        if b in n or b in n + " Primavera": err.append(f"BRAND {k}{w} {n} ~ {b}")
    if not subseq(a, n): err.append(f"SIGLA non sottosequenza {k}{w} {a}/{n}")
    if len(a) != 3: err.append(f"SIGLA non di 3 lettere {k}{w} {a}")
    if a in altri_a: err.append(f"SIGLA uguale a un altro club {k}{w} {a}")
    if a in UFF: err.append(f"SIGLA ufficiale nota {k}{w} {a}")
    if n in altri_n: err.append(f"NOME doppione {k}{w} {n}")
    if n in stad: err.append(f"NOME uguale a uno stadio {k}{w} {n}")
    seen_n[n] += 1; seen_a[a] += 1
for k, v in P1S.items():
    uf = re.sub(r'^1\. ', '', v[0]); uf = re.sub(r' \d{2,4}$', '', uf); uf = uf.split('-')[0] if k == "s04" else uf
    for n in (v[1], v[3]):
        if uf in n: err.append(f"NOME contiene il nome ufficiale {k} {n} ~ {uf}")
for n, c in seen_n.items():
    if c > 1: err.append(f"NOME doppio fra le proposte: {n}")
for a, c in seen_a.items():
    if c > 1: err.append(f"SIGLA doppia fra le proposte: {a}")
# stadi nuovi
new_st = []
for k, v in P.items():
    for s in re.findall(r'(?:→|A:|B:|con B →)\s*([^·()]+?)(?=\s*(?:·|\(|$))', v[6]):
        s = s.replace("A:", "").replace("B:", "").strip()
        if s and s not in ("resta",): new_st.append((k, s))
for k, s in new_st:
    for b in BR:
        if b in s: err.append(f"STADIO BRAND {k} {s} ~ {b}")
    if s in stad: err.append(f"STADIO già esistente {k} {s}")
# somiglianze (stesso prefisso dopo FC: segnalate, non errori)
sim = []
for k, w, n, a in prop:
    core = n.split(" ", 1)[1] if " " in n else n
    for o in altri_n:
        oc = o.split(" ", 1)[1] if " " in o else o
        if oc.split()[0] == core.split()[0] and o != n: sim.append(f"{k}{w} «{n}» ~ «{o}»")
print(f"club in src/02: {len(CL)} · decisi al 247: {len(G247)} · proposte classi 2-5: {len(P)} · classe 1*: {len(P1S)} · nomi proposti: {len(prop)} · stadi nuovi: {len(new_st)} · voci _CR_BRANDS: {len(BR)}")
print("somiglianze di città (volute, da valutare):"); [print("  ", s) for s in sorted(set(sim))]
if err:
    print("ROSSO:"); [print("  ", e) for e in err]; sys.exit(1)
print("VERDE: 0 corrispondenze _CR_BRANDS · sigle sottosequenze, di 3 lettere, uniche, non ufficiali note · nessun doppione di nome/stadio")
# tabella
order = []
for c in CL:
    if c[3] not in order: order.append(c[3])
out = []
cnt = collections.Counter()
for lg in order:
    out.append(f"\n### {lg}\n\n| Q | id | Club reale evocato | Nome di oggi (sigla) | Classe | Proposta A (sigla) | Proposta B (sigla) | Stadio |\n|---|---|---|---|---|---|---|---|")
    nq = 0
    for c in CL:
        if c[3] != lg: continue
        k = c[0]
        if k in G247:
            cnt["247"] += 1; out.append(f"| | `{k}` | — | {c[1]} ({c[2]}) | deciso al 247 | **{G247[k][0]}** ({G247[k][1]}) | — | vedi giro 247 |"); continue
        if k in P:
            v = P[k]; cnt[v[0]] += 1; nq += 1
            out.append(f"| {(nq-1)//4+1}.{(nq-1)%4+1} | `{k}` | {v[1]} | {c[1]} ({c[2]}) | {v[0]} | **{v[2]}** ({v[3]}) | **{v[4]}** ({v[5]}) | {v[6]} |")
        elif k in P1S:
            v = P1S[k]; cnt["1*"] += 1; nq += 1
            out.append(f"| {(nq-1)//4+1}.{(nq-1)%4+1} | `{k}` | {v[0]} | {c[1]} ({c[2]}) | 1* | {v[1]} ({v[2]}) | {v[3]} ({v[4]}) | — |")
        else:
            cnt["1"] += 1
            out.append(f"| | `{k}` | | {c[1]} ({c[2]}) | 1 | resta | | |")
print("conteggio per classe:", dict(cnt))
if len(sys.argv) > 1: open(sys.argv[1], "w", encoding="utf-8").write("\n".join(out) + "\n")
