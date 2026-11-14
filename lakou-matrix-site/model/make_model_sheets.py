import math
OUT='/home/claude/lakou-site/model/'
K=8.25/430  # inches per web-diagram unit (culture orbit 430 -> 8.25")
LENSES=["LANGUAGE","FAITH","HEALING","FOOD","RHYTHM","IMAGE","MARKET","GATHERING","MEMORY"]
SHELL={3:262,2:316,1:370}
CULT=[("Anglo-Caribbean",8020),("African American",None),("West African",None),("Sudanese",None),("Bangladeshi",4588),("Pakistani",3628),("Uzbek",1761),("Eastern European",4560),("Jewish",None),("Mexican & Central Am.",2529),("Puerto Rican & S. Am.",None),("Latin American",None)]
CUT='stroke="#ff0000" stroke-width="0.003" fill="none"'      # red hairline = cut
ENG='stroke="#0000ff" stroke-width="0.003" fill="none"'      # blue hairline = vector engrave/score
RAS='fill="#000000"'                                         # black fill = raster engrave
def svg(name,w,h,body,title):
    open(OUT+name,'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}in" height="{h}in" viewBox="0 0 {w} {h}">\n<title>{title}</title>\n{body}\n</svg>\n')
def P(cx,cy,r,a): return cx+r*math.cos(a),cy+r*math.sin(a)
def circ(cx,cy,r,st): return f'<circle cx="{cx:.4f}" cy="{cy:.4f}" r="{r:.4f}" {st}/>'
def line(x1,y1,x2,y2,st,w=None): return f'<line x1="{x1:.4f}" y1="{y1:.4f}" x2="{x2:.4f}" y2="{y2:.4f}" {st}/>'
def text(x,y,t,size,anchor="middle",rot=0): return f'<text x="{x:.4f}" y="{y:.4f}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="{size}" text-anchor="{anchor}" {RAS} transform="rotate({rot:.2f} {x:.4f} {y:.4f})">{t}</text>'
def arcslot(cx,cy,r,a,length,width):
    # rounded slot along the circle of radius r centered at angle a
    half=length/2/r; a1,a2=a-half,a+half; ro,ri=r+width/2,r-width/2; cap=width/2
    o1=P(cx,cy,ro,a1);o2=P(cx,cy,ro,a2);i2=P(cx,cy,ri,a2);i1=P(cx,cy,ri,a1)
    return f'<path d="M{o1[0]:.4f},{o1[1]:.4f} A{ro:.4f},{ro:.4f} 0 0 1 {o2[0]:.4f},{o2[1]:.4f} A{cap:.4f},{cap:.4f} 0 0 1 {i2[0]:.4f},{i2[1]:.4f} A{ri:.4f},{ri:.4f} 0 0 0 {i1[0]:.4f},{i1[1]:.4f} A{cap:.4f},{cap:.4f} 0 0 1 {o1[0]:.4f},{o1[1]:.4f} Z" {CUT}/>'
angD=lambda i:(i+.5)/len(LENSES)*2*math.pi-math.pi/2

# ---- Sheet A: inner disc (lenses, spokes, shell slots) ----
R_in=(370+26)*K; W=H=2*R_in+0.5; cx=cy=W/2; b=[]
b.append(circ(cx,cy,R_in,CUT))
b.append(circ(cx,cy,25.4/2/25.4+0.004,CUT))  # 25 mm core magnet hole (r=0.4961")
for s,r in SHELL.items(): b.append(circ(cx,cy,r*K,ENG.replace('fill="none"','fill="none" stroke-dasharray="0.04 0.08"')))
b.append(circ(cx,cy,200*K,ENG)); b.append(circ(cx,cy,62*K,ENG))
for i,name in enumerate(LENSES):
    a=angD(i); p0=P(cx,cy,62*K,a); p1=P(cx,cy,392*K,a)
    b.append(line(*p0,*p1,ENG))
    n=P(cx,cy,200*K,a); b.append(circ(*n,0.16,ENG))
    t=P(cx,cy,152*K,a); deg=math.degrees(a)+90; deg=deg if -90<=((deg+180)%360-180)<=90 else deg+180
    b.append(text(*t,name,0.17,rot=(deg+180)%360-180 if False else deg))
    for s,r in SHELL.items(): b.append(arcslot(cx,cy,r*K,a,1.25,6.6/25.4))
    ip=P(cx,cy,(62+30)*K,a); b.append(circ(*ip,0.02,ENG))
# shell labels
for s,r in SHELL.items():
    p=P(cx,cy,r*K+0.18,-math.pi/2+math.pi/9); b.append(text(*p,f"SHELL {s}",0.11,rot=math.degrees(-math.pi/2+math.pi/9)+90))
svg("A_inner_disc_lenses_shells.svg",W,H,"\n".join(b),"Lakou Matrix model, sheet A: inner disc")

# ---- Sheet B: outer orbit ring, two halves ----
r_o=9.6; r_i=R_in+0.12; W=2*r_o+0.4; H=2*(r_o+0.3)+0.2; parts=[]
for half,oy in ((0,r_o+0.25),(1,r_o+0.35)):
    cx=W/2; cy=oy if half==0 else oy
    s_a,e_a=(math.pi,2*math.pi) if half==0 else (0,math.pi)
    yoff=0 if half==0 else 0.1
    def pt(r,a): return P(cx,cy+(0 if half==0 else r_o*0+0.6),r,a)
    pass
# simpler: lay the two half-rings side by side as separate drawings
def half_ring(cx,cy,top):
    a1,a2=(math.pi,2*math.pi) if top else (0,math.pi)
    o1=P(cx,cy,r_o,a1);o2=P(cx,cy,r_o,a2);i2=P(cx,cy,r_i,a2);i1=P(cx,cy,r_i,a1)
    g=[f'<path d="M{o1[0]:.4f},{o1[1]:.4f} A{r_o},{r_o} 0 0 1 {o2[0]:.4f},{o2[1]:.4f} L{i2[0]:.4f},{i2[1]:.4f} A{r_i:.4f},{r_i:.4f} 0 0 0 {i1[0]:.4f},{i1[1]:.4f} Z" {CUT}/>']
    g.append(f'<path d="M{P(cx,cy,8.25,a1+0.002)[0]:.4f},{P(cx,cy,8.25,a1+0.002)[1]:.4f} A8.25,8.25 0 0 1 {P(cx,cy,8.25,a2-0.002)[0]:.4f},{P(cx,cy,8.25,a2-0.002)[1]:.4f}" {ENG}/>')
    for d in range(0,360,5):
        a=math.radians(d-90)
        if not(a1-1e-6<=a%(2*math.pi) or True): pass
        aa=a%(2*math.pi)
        if not (a1<=aa<=a2 or (top and abs(aa)<1e-9)): continue
        L=0.35 if d%45==0 else (0.2 if d%15==0 else 0.1)
        p0=P(cx,cy,r_o-0.08,a);p1=P(cx,cy,r_o-0.08-L,a);g.append(line(*p0,*p1,ENG))
        if d%45==0:
            lab={0:"N",45:"NE",90:"E",135:"SE",180:"S",225:"SW",270:"W",315:"NW"}[d]
            t=P(cx,cy,r_o-0.62,a);g.append(text(*t,lab,0.2,rot=d))
    # ball-transfer / glide marks underneath are drilled by hand; mark 3 per half
    for k in range(3):
        a=a1+(k+.5)*(a2-a1)/3;p=P(cx,cy,(r_o+r_i)/2,a);g.append(circ(*p,0.05,ENG))
    return "\n".join(g)
W=2*r_o+0.6;H=r_o*2+1.0
body=half_ring(W/2,r_o+0.2,True)+"\n"+half_ring(W/2,r_o+0.8,False)
svg("B_outer_orbit_ring_halves.svg",W,H,body,"Lakou Matrix model, sheet B: outer orbit ring (2 halves, compass in degrees for real bearings)")

# ---- Sheet C: core discs, culture pucks (size = population), charge-point tokens ----
b=[];x=0.4;y=0.4
for k in range(3):
    cxx=x+1.25+k*2.7;b.append(circ(cxx,y+1.25,1.2,CUT));b.append(circ(cxx,y+1.25,25.4/2/25.4+0.004,CUT) if k<2 else circ(cxx,y+1.25,0.2,ENG))
    if k==2:b.append(text(cxx,y+1.3,"AYITI",0.32))
mx=max(p for _,p in CULT if p);y2=3.2;x2=0.4;row=[]
for name,pop in CULT:
    d=1.0 if pop is None else 0.9+math.sqrt(pop/mx)*1.1;r=d/2
    if x2+d>15.5:x2=0.4;y2+=2.5
    c=(x2+r,y2+r);b.append(circ(*c,r,CUT));b.append(circ(*c,10.2/2/25.4,ENG) if pop else circ(*c,r*0.55,CUT))
    b.append(circ(c[0],c[1]-r+0.12,0.03,CUT))  # thread eyelet hole
    short=name.upper().replace("MEXICAN & CENTRAL AM.","MEX & C. AM").replace("PUERTO RICAN & S. AM.","PR & S. AM").replace("EASTERN EUROPEAN","E. EUROPEAN").replace("ANGLO-CARIBBEAN","ANGLO-CARIB.").replace("AFRICAN AMERICAN","AFR. AMER.").replace("LATIN AMERICAN","LATIN AM.")
    b.append(text(c[0],c[1]+(r*0.62 if pop else r*0.82)+0.02,short,0.075 if pop else 0.06));x2+=d+0.45
y3=y2+2.7;n=0
for i in range(48):
    cxx=0.6+(i%16)*0.9;cyy=y3+(i//16)*0.9;b.append(circ(cxx,cyy,0.25,CUT));b.append(circ(cxx,cyy+0.17,0.025,CUT))
H=y3+3*0.9+0.4
b.append(text(8,H-0.15,"Core x3 (two with 25 mm magnet hole) · culture pucks (diameter = population; ring = no data yet) · 48 charge-point tokens (glue a 6x3 mm magnet under each)",0.13))
svg("C_core_pucks_tokens.svg",16,H,"\n".join(b),"Lakou Matrix model, sheet C: core, culture pucks, charge-point tokens")
print("ok", round(2*R_in,2), "in inner disc;", round(2*r_o,2),"in outer ring")
