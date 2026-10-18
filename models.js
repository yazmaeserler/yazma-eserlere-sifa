/* Tezhip: serlevha (unvan, tepelik, tığ). Ezme altın, lâciverd, lâl, gülkurusu, yeşil ve üstübeç; siyah tahrir.
   Aynı çizim üç kez yapılır: renk, metal (altın maskesi) ve kabartı haritası. Birim çerçeve: unvan 580 × 180. */
(function(){
'use strict';
function rng(s){s=s%2147483647;if(s<=0)s+=2147483646;return function(){s=(s*16807)%2147483647;return (s-1)/2147483646;};}
function cv(w,h){var c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c;}
function rgba(a,al){return 'rgba('+a[0]+','+a[1]+','+a[2]+','+al+')';}

/* ---- pigment desenleri (dikişsiz tekrar eden küçük dokular) ---- */
var PC={};
function grain(key,S,base,blots,dots,seed,extra){if(PC[key])return PC[key];var C=cv(S,S),x=C.getContext('2d'),r=rng(seed),i,dx,dy;x.fillStyle=base;x.fillRect(0,0,S,S);
  blots.forEach(function(b){for(i=0;i<b[2];i++){var bx=r()*S,by=r()*S,br=S*(b[3]+r()*b[4]);for(dx=-1;dx<=1;dx++)for(dy=-1;dy<=1;dy++){var cx=bx+dx*S,cy=by+dy*S;if(cx+br<0||cx-br>S||cy+br<0||cy-br>S)continue;var g=x.createRadialGradient(cx,cy,0,cx,cy,br);g.addColorStop(0,rgba(b[0],b[1]));g.addColorStop(1,rgba(b[0],0));x.fillStyle=g;x.fillRect(cx-br,cy-br,2*br,2*br);}}});
  dots.forEach(function(d){x.fillStyle=d[0];for(i=0;i<d[1];i++){var px=r()*S,py=r()*S,w=.5+r()*d[2],h=.5+r()*d[2];x.fillRect(px,py,w,h);if(px+w>S)x.fillRect(px-S,py,w,h);if(py+h>S)x.fillRect(px,py-S,w,h);}});
  if(extra)extra(x,S,r);return PC[key]=C;}
var PIG={
  gold:function(){return grain('gold',256,'#C69A46',[[[244,212,128],.55,22,.06,.16],[[148,106,44],.5,18,.05,.14],[[255,236,170],.35,8,.03,.06]],
    [['rgba(252,230,156,.5)',2600,1.5],['rgba(118,82,30,.32)',1700,1.3],['rgba(255,244,200,.55)',420,1],['rgba(84,56,18,.5)',90,1.8]],11,
    function(x,S,r){x.lineCap='round';for(var i=0;i<140;i++){var px=r()*S,py=r()*S,l=8+r()*26,a=-.55+(r()-.5)*.35;x.strokeStyle=r()<.6?'rgba(255,240,190,.13)':'rgba(120,85,30,.10)';x.lineWidth=1+r()*2.5;x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(a)*l,py+Math.sin(a)*l);x.stroke();}});},
  lapis:function(){return grain('lapis',160,'#1E3A8C',[[[14,30,84],.55,10,.08,.2],[[52,92,190],.35,8,.06,.14]],
    [['rgba(72,112,218,.55)',2100,1.3],['rgba(10,20,58,.5)',1500,1.3],['rgba(150,178,240,.35)',230,1],['rgba(232,224,204,.65)',26,1.3]],12);},
  red:function(){return grain('red',128,'#A5342A',[[[120,28,20],.5,6,.1,.2],[[200,82,58],.35,6,.08,.14]],[['rgba(206,96,72,.4)',700,1.2],['rgba(80,18,12,.4)',700,1.2]],13);},
  pink:function(){return grain('pink',128,'#C6847A',[[[150,90,84],.4,6,.1,.2]],[['rgba(232,176,166,.45)',600,1.2],['rgba(130,72,66,.35)',500,1.2]],14);},
  green:function(){return grain('green',128,'#4C7F5C',[[[34,72,50],.5,6,.1,.2],[[110,150,108],.3,5,.08,.14]],[['rgba(120,168,128,.4)',600,1.2],['rgba(24,52,36,.4)',600,1.2]],15);},
  white:function(){return grain('white',128,'#F1E9D4',[[[214,200,170],.45,8,.1,.2]],[['rgba(196,182,152,.4)',500,1.2],['rgba(255,255,250,.6)',300,1]],16);},
  paper:function(){return grain('paper',256,'#ECDDB8',[[[214,184,128],.4,26,.08,.22],[[250,242,220],.4,18,.06,.18]],[['rgba(150,120,80,.12)',2200,2.2],['rgba(255,250,236,.2)',1400,2]],17,
    function(x,S,r){for(var i=0;i<260;i++){var a=r()*Math.PI,l=6+r()*18,px=r()*S,py=r()*S;x.strokeStyle='rgba(120,92,56,'+(.05+r()*.08)+')';x.lineWidth=.6;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+r()*8-4,py+r()*8-4,px+Math.cos(a)*l,py+Math.sin(a)*l);x.stroke();}});}
};

/* ---- kalem: yassı uçlu kamış kalemle hat (yatayda kalın, dikeyde ince) ---- */
function bz(p,n){var o=[],i,t,u;for(i=0;i<=n;i++){t=i/n;u=1-t;o.push([u*u*u*p[0][0]+3*u*u*t*p[1][0]+3*u*t*t*p[2][0]+t*t*t*p[3][0],u*u*u*p[0][1]+3*u*u*t*p[1][1]+3*u*t*t*p[2][1]+t*t*t*p[3][1]]);}return o;}
function nibPath(path,pts,w,ang){var nx=Math.cos(ang)*w/2,ny=Math.sin(ang)*w/2;
  for(var i=0;i<pts.length-1;i++){var a=pts[i],b=pts[i+1],q=[[a[0]-nx,a[1]-ny],[a[0]+nx,a[1]+ny],[b[0]+nx,b[1]+ny],[b[0]-nx,b[1]-ny]];
    var ar=0;for(var k=0;k<4;k++){var p1=q[k],p2=q[(k+1)%4];ar+=p1[0]*p2[1]-p2[0]*p1[1];}if(ar<0)q.reverse();
    path.moveTo(q[0][0],q[0][1]);path.lineTo(q[1][0],q[1][1]);path.lineTo(q[2][0],q[2][1]);path.lineTo(q[3][0],q[3][1]);path.closePath();}}
/* sülüs benzeri kompozisyon: elifler, çanaklar, uzun keşideler, noktalar ve harekeler (okunur metin değildir) */
function script(x0,x1,base,h,seed,small,center){var P=new Path2D(),r=rng(seed),w=h*.16,ang=-1.12,x=x1,q;
  function S(pts){nibPath(P,pts,w,ang);}
  function dot(px,py,s){S([[px,py],[px+Math.cos(ang+1.57)*w*.9*(s||1),py+Math.sin(ang+1.57)*w*.9*(s||1)]]);}
  function hareke(px,py){var hw=w;w*=.45;S(bz([[px,py],[px-h*.06,py+h*.04],[px-h*.12,py+h*.06],[px-h*.18,py+h*.1]],6));w=hw;}
  var seq=small?(function(){var L=['alif','bowl','ra','mim','kash','lam','alif','tooth','tooth','alif'],o=[],n=4+Math.floor(r()*6);for(var i=0;i<n;i++)o.push(L[Math.floor(r()*L.length)]);return o;})():(seed%7===3?['alif','lam','bowl','alif','kash','ra','alif','mim','lam','bowl','alif']:(function(){var L=['alif','lam','bowl','alif','kash','ra','mim','alif','lam','tooth','bowl','alif'],o=[],n=8+Math.floor(r()*5);for(var i=0;i<n;i++)o.push(L[Math.floor(r()*L.length)]);if(o.indexOf('kash')<0)o.splice(3,0,'kash');return o;})());
  for(var i=0;i<seq.length&&x>x0+h*.3;i++){var e=seq[i];
    if(e==='alif'){S(bz([[x,base-h],[x-h*.05,base-h*.65],[x-h*.02,base-h*.3],[x-h*.08,base]],10));x-=h*.28;}
    else if(e==='lam'){S(bz([[x,base-h*.95],[x-h*.04,base-h*.5],[x+h*.02,base-h*.1],[x-h*.12,base+h*.08]],10));S(bz([[x-h*.12,base+h*.08],[x-h*.3,base+h*.12],[x-h*.5,base+h*.06],[x-h*.56,base-h*.18]],10));x-=h*.62;}
    else if(e==='bowl'){var bw=h*(.55+r()*.25);S(bz([[x,base-h*.2],[x-bw*.1,base+h*.35],[x-bw*.9,base+h*.38],[x-bw,base-h*.12]],14));dot(x-bw*.5,base-h*.32);x-=bw+h*.12;}
    else if(e==='tooth'){for(var tt=0;tt<3;tt++){S(bz([[x,base-h*.02],[x-h*.04,base-h*.22],[x-h*.1,base-h*.22],[x-h*.14,base]],5));x-=h*.14;}S([[x,base],[x-h*.12,base+h*.01]]);x-=h*.14;if(r()<.5)dot(x+h*.2,base-h*.38);}
    else if(e==='ra'){S(bz([[x,base-h*.18],[x-h*.08,base+h*.05],[x-h*.18,base+h*.2],[x-h*.38,base+h*.3]],8));x-=h*.42;}
    else if(e==='mim'){var mx=x-h*.1;S(bz([[mx,base-h*.02],[mx-h*.16,base-h*.2],[mx-h*.26,base+h*.02],[mx-h*.08,base+h*.04]],10));S(bz([[mx-h*.08,base+h*.04],[mx-h*.1,base+h*.3],[mx-h*.14,base+h*.45],[mx-h*.2,base+h*.55]],6));x-=h*.42;}
    else if(e==='kash'){var kl=Math.min(h*1.9,x-x0-h*.3);if(kl<h*.5)continue;S(bz([[x,base-h*.05],[x-kl*.3,base+h*.16],[x-kl*.75,base+h*.14],[x-kl,base-h*.02]],18));S(bz([[x-kl,base-h*.02],[x-kl-h*.08,base-h*.12],[x-kl-h*.1,base-h*.22],[x-kl-h*.06,base-h*.3]],6));
      // keşidenin üstüne istiflenen küçük harfler (sülüs istifi)
      var sx=x-kl*.15,hh=h;h=hh*.5;w=h*.16;for(var j=0;j<3&&sx>x-kl*.9;j++){var by=base-hh*.3;if(j%2===0){S(bz([[sx,by-h*.9],[sx-h*.05,by-h*.5],[sx-h*.02,by-h*.2],[sx-h*.08,by]],8));sx-=h*.35;}else{S(bz([[sx,by-h*.2],[sx-h*.1,by+h*.3],[sx-h*.7,by+h*.32],[sx-h*.8,by-h*.1]],10));dot(sx-h*.4,by-h*.4);sx-=h*.95;}}h=hh;w=h*.16;
      dot(x-kl*.55,base+h*.36);dot(x-kl*.55-w*1.1,base+h*.36);x-=kl+h*.2;}}
  // harekeler ve süs noktaları
  for(i=0;i<(small?3:6);i++){var hx=x0+h*.3+r()*(x1-x0-h*.6);hareke(hx,base-h*(.75+r()*.25));}
  if(center){var sh=(x-x0)/2-h*.15,Q=new Path2D();Q.addPath(P,new DOMMatrix().translate(-sh,0));return Q;}
  P.left=x;return P;}

/* ---- motif yolları ---- */
function tepelik(s,cx,cy){var P=new Path2D(),f=function(x,y){return [cx+(x-290)*s,cy+(y-0)*s];},a=f(170,0),b=f(172,-52),c=f(262,-48),d=f(290,-92),e=f(318,-48),g=f(408,-52),h=f(410,0);
  P.moveTo(a[0],a[1]);P.bezierCurveTo(b[0],b[1],c[0],c[1],d[0],d[1]);P.bezierCurveTo(e[0],e[1],g[0],g[1],h[0],h[1]);P.closePath();return P;}
var TEP=[[[170,0],[172,-52],[262,-48],[290,-92]],[[290,-92],[318,-48],[408,-52],[410,0]]];
function lobed(cx,cy,rx,ry,n,amp,tip){var P=new Path2D();for(var i=0;i<=360;i++){var t=i/360*Math.PI*2,k=1+amp*Math.abs(Math.sin(t*n/2)),ct=Math.cos(t),st=Math.sin(t);
    var px=cx+ct*rx*k*(1+tip*Math.pow(Math.abs(ct),8)),py=cy+st*ry*k*(1-.35*Math.pow(Math.abs(ct),3));i?P.lineTo(px,py):P.moveTo(px,py);}P.closePath();return P;}
function rumiPath(x,y,s,ang,fl){var P=new Path2D(),M=new DOMMatrix().translate(x,y).rotate(ang*57.2958).scale(s,s*fl);
  var Q=new Path2D();Q.moveTo(0,0);Q.bezierCurveTo(.25,-.38,.72,-.46,1.0,-.16);Q.bezierCurveTo(.84,-.15,.74,-.07,.68,0);Q.bezierCurveTo(.8,.06,.93,.2,.97,.36);Q.bezierCurveTo(.62,.3,.3,.22,0,0);Q.closePath();
  P.addPath(Q,M);return P;}
function rumiCurl(x,y,s,ang,fl){var P=new Path2D(),M=new DOMMatrix().translate(x,y).rotate(ang*57.2958).scale(s,s*fl),Q=new Path2D();Q.moveTo(.1,-.02);Q.bezierCurveTo(.35,-.2,.62,-.22,.78,-.1);Q.moveTo(.55,.02);Q.quadraticCurveTo(.66,.12,.74,.22);P.addPath(Q,M);return P;}
function petal(P,cx,cy,a,R,wd){var ca=Math.cos(a),sa=Math.sin(a),px=-sa,py=ca;P.moveTo(cx,cy);P.bezierCurveTo(cx+ca*R*.35+px*R*wd,cy+sa*R*.35+py*R*wd,cx+ca*R*.95+px*R*wd*.6,cy+sa*R*.95+py*R*wd*.6,cx+ca*R,cy+sa*R);
  P.bezierCurveTo(cx+ca*R*.95-px*R*wd*.6,cy+sa*R*.95-py*R*wd*.6,cx+ca*R*.35-px*R*wd,cy+sa*R*.35-py*R*wd,cx,cy);P.closePath();}
function pencPath(cx,cy,R,n,rot,wd){var P=new Path2D();for(var i=0;i<n;i++)petal(P,cx,cy,rot+i/n*Math.PI*2,R,wd||.42);return P;}
function leafPath(x,y,l,a,wd){var P=new Path2D(),ca=Math.cos(a),sa=Math.sin(a),px=-sa,py=ca,tx=x+ca*l,ty=y+sa*l;P.moveTo(x,y);P.bezierCurveTo(x+ca*l*.3+px*l*wd,y+sa*l*.3+py*l*wd,x+ca*l*.75+px*l*wd*.5,y+sa*l*.75+py*l*wd*.5,tx,ty);
  P.bezierCurveTo(x+ca*l*.75-px*l*wd*.3,y+sa*l*.75-py*l*wd*.3,x+ca*l*.3-px*l*wd*.6,y+sa*l*.3-py*l*wd*.6,x,y);P.closePath();return P;}

/* ---- serlevha çizimi ---- */
function draw(c,mode,o){var r=rng(o.seed||7),pats={},INK='rgba(26,18,10,.92)';
  function F(kind){if(mode==='metal')return kind==='gold'?'#fff':'#000';if(mode==='bump')return kind==='gold'?'#a2a2a2':kind==='paper'?'#808080':'#b6b6b6';
    return pats[kind]||(pats[kind]=c.createPattern(PIG[kind](),'repeat'));}
  function fill(P,kind){c.fillStyle=F(kind);if(mode==='color'&&kind!=='gold'){c.save();c.translate((r()-.5)*.7,(r()-.5)*.7);c.fill(P);c.restore();}else c.fill(P);}
  function ink(P,w){c.lineWidth=w;c.strokeStyle=mode==='color'?INK:mode==='metal'?'#000':'#5c5c5c';c.stroke(P);}
  function goldLine(P,w){c.lineWidth=w;c.strokeStyle=F('gold');c.stroke(P);}
  function rect(x,y,w,h){var P=new Path2D();P.rect(x,y,w,h);return P;}
  c.lineJoin='round';c.lineCap='round';
  var LAP=[]; // lâciverd alanlar (yaşlanma için)

  // TIĞ: tepelik ve unvan kenarlarından dışa ışınlar
  if(mode!=='metal'){var tp=new Path2D(),dots=new Path2D(),n=0;
    function ray(x,y,nx,ny){var L=(n%2?9:16)+(n%4===0?6:0)+r()*2;tp.moveTo(x+nx*2,y+ny*2);tp.lineTo(x+nx*L,y+ny*L);if(n%4===0){dots.moveTo(x+nx*(L+1.2)+.75,y+ny*(L+1.2));dots.arc(x+nx*(L+1.2),y+ny*(L+1.2),.75,0,7);}n++;}
    TEP.forEach(function(seg){var pts=bz(seg,80),i;for(i=0;i<pts.length-1;i++){var a=pts[i],b=pts[i+1],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy);ray(a[0],a[1],dy/L,-dx/L);}});
    for(var x=2;x<580;x+=2.6){if(x>166&&x<414)continue;ray(x,0,0,-1);}
    for(var y=3;y<180;y+=2.6){ray(0,y,-1,0);ray(580,y,1,0);}
    for(var k=0;k<5;k++){n=k%2;ray(290+(k-2)*.8,-114,(k-2)*.16,-1);}
    c.lineWidth=.5;c.strokeStyle=mode==='color'?'rgba(36,66,150,.8)':'#9a9a9a';c.stroke(tp);c.fillStyle=mode==='color'?'rgba(36,66,150,.85)':'#9a9a9a';c.fill(dots);}

  // ÇERÇEVE: altın cetvel, lâciverd zencerek bandı, iç cetvel
  var outer=rect(0,0,580,180);fill(outer,'gold');
  var band=new Path2D();band.rect(6,6,568,168);band.rect(15,15,550,150);c.fillStyle=F('lapis');c.fill(band,'evenodd');LAP.push([band,'evenodd']);
  var ch=new Path2D(),i2,t;function link(x,y,a){var P=new Path2D(),M=new DOMMatrix().translate(x,y).rotate(a);var e=new Path2D();e.ellipse(0,0,4.3,1.9,0,0,7);P.addPath(e,M);ch.addPath(P);}
  for(t=10;t<572;t+=7.2){link(t,10.5,(Math.round(t/7.2)%2?35:-35));link(t,169.5,(Math.round(t/7.2)%2?35:-35));}
  for(t=17;t<165;t+=7.2){link(10.5,t,(Math.round(t/7.2)%2?55:125));link(569.5,t,(Math.round(t/7.2)%2?55:125));}
  fill(ch,'gold');ink(ch,.45);
  ink(rect(.5,.5,579,179),1.1);ink(rect(6,6,568,168),.8);ink(rect(15,15,550,150),.8);ink(rect(19,19,542,142),1);

  // ZEMİN: altın üzerine helezoni saplar ve renkli çiçekler (halkâr)
  var field=rect(19,19,542,142),kit=lobed(290,90,118,46,18,.035,.16),kolL=new Path2D(),kolR=new Path2D();
  kolL.ellipse(19,90,46,52,0,-Math.PI/2,Math.PI/2);kolL.closePath();kolR.ellipse(561,90,46,52,0,Math.PI/2,Math.PI*1.5);kolR.closePath();
  fill(field,'gold');
  c.save();var clip=new Path2D();clip.addPath(field);clip.addPath(kit);clip.addPath(kolL);clip.addPath(kolR);c.clip(clip,'evenodd');
  var stems=new Path2D(),flw=[],lvs=[],buds=[];
  for(var gy=0;gy<5;gy++)for(var gx=0;gx<18;gx++){var sx=19+gx*33+(gy%2?16:0)+(r()-.5)*6,sy=19+gy*34+(r()-.5)*6,R=12+r()*4,dir=r()<.5?1:-1,a0=r()*Math.PI*2,j;
    for(j=0;j<=40;j++){var th=a0+dir*j/40*Math.PI*2.3,rr=R*(1-j/48),px=sx+Math.cos(th)*rr,py=sy+Math.sin(th)*rr;j?stems.lineTo(px,py):stems.moveTo(px,py);}
    // komşu helezona uzanan kuyruk
    var tx=sx+Math.cos(a0)*R,ty=sy+Math.sin(a0)*R,ta=a0-dir*Math.PI/2;stems.moveTo(tx,ty);stems.quadraticCurveTo(tx+Math.cos(ta)*10,ty+Math.sin(ta)*10,tx+Math.cos(ta)*16+Math.cos(a0)*8,ty+Math.sin(ta)*16+Math.sin(a0)*8);
    var ce=a0+dir*Math.PI*2.3,cr=R*(1-40/48);flw.push([sx+Math.cos(ce)*cr,sy+Math.sin(ce)*cr]);
    var la=a0+dir*Math.PI*.9;lvs.push([sx+Math.cos(la)*R*.9,sy+Math.sin(la)*R*.9,la+dir*1.3]);
    if(r()<.5)buds.push([tx+Math.cos(ta)*16+Math.cos(a0)*8,ty+Math.sin(ta)*16+Math.sin(a0)*8,ta]);}
  ink(stems,.7);
  var cols=['red','lapis','pink','white','lapis','red'],LV=new Path2D(),G=new Path2D();
  lvs.forEach(function(l){LV.addPath(leafPath(l[0],l[1],7.5,l[2],.32));});fill(LV,'green');ink(LV,.4);
  buds.forEach(function(b){var P=leafPath(b[0],b[1],5.5,b[2],.5);fill(P,'red');ink(P,.4);});
  flw.forEach(function(f,i){var P=pencPath(f[0],f[1],4.6,5,r()*6,.5);fill(P,cols[i%cols.length]);ink(P,.4);G.moveTo(f[0]+1.3,f[1]);G.arc(f[0],f[1],1.3,0,7);});fill(G,'gold');
  c.restore();

  // KOLTUKLAR: yarım madalyonlarda altın rumiler
  [[kolL,19,1],[kolR,561,-1]].forEach(function(K){fill(K[0],'lapis');LAP.push([K[0]]);var X=K[1],sg=K[2],R=new Path2D(),CU=new Path2D();
    R.addPath(rumiPath(X+4*sg,90,34,sg>0?-.55:Math.PI+.55,sg>0?1:-1));R.addPath(rumiPath(X+4*sg,90,34,sg>0?.55:Math.PI-.55,sg>0?-1:1));
    CU.addPath(rumiCurl(X+4*sg,90,34,sg>0?-.55:Math.PI+.55,sg>0?1:-1));CU.addPath(rumiCurl(X+4*sg,90,34,sg>0?.55:Math.PI-.55,sg>0?-1:1));
    fill(R,'gold');ink(R,.6);ink(CU,.5);var p=pencPath(X+30*sg,90,7,6,.3,.5);fill(p,'red');ink(p,.45);var d=new Path2D();d.arc(X+30*sg,90,2.2,0,7);fill(d,'gold');
    goldLine(K[0],1.6);ink(K[0],.6);});

  // KİTABE: dilimli lâciverd madalyon, üstübeçle (beyaz) yazı
  fill(kit,'lapis');LAP.push([kit]);
  c.save();c.clip(kit);var sm=new Path2D();for(var q=0;q<30;q++){var fx=180+r()*220,fy=52+r()*76,P=pencPath(fx,fy,2.4,5,r()*6,.55);sm.addPath(P);}fill(sm,'gold');
  if(mode==='color'){c.globalAlpha=.9;var txt=script(190,392,107,50,(o.seed||7)+3,false,true);c.lineWidth=1.6;c.strokeStyle=INK;c.stroke(txt);c.fillStyle=F('white');c.fill(txt);c.globalAlpha=1;}
  else{var txt2=script(190,392,107,50,(o.seed||7)+3,false,true);c.fillStyle=mode==='metal'?'#000':'#c0c0c0';c.fill(txt2);}
  c.restore();
  var kin=lobed(290,90,111,41,18,.035,.16);goldLine(kit,3);ink(kit,.8);goldLine(kin,.9);
  // kitabe uçlarında küçük altın tepelikler
  [[290-118*1.16+2,-1],[290+118*1.16-2,1]].forEach(function(e){var P=leafPath(e[0],90,11,e[1]>0?0:Math.PI,.38);fill(P,'lapis');ink(P,.5);var d=new Path2D();d.arc(e[0]+e[1]*14.5,90,1.6,0,7);fill(d,'gold');ink(d,.35);});

  // TEPELİK: altın zemin, lâciverd iç alan, ortada büyük penç, iki yanda rumiler
  var tep=tepelik(1,290,4);fill(tep,'gold');
  var tin=tepelik(.74,290,-2);fill(tin,'lapis');LAP.push([tin]);
  c.save();c.clip(tin);var TR=new Path2D(),TC=new Path2D();TR.addPath(rumiPath(290,-14,30,-.18,-1));TR.addPath(rumiPath(290,-14,30,Math.PI+.18,1));
  TC.addPath(rumiCurl(290,-14,30,-.18,-1));TC.addPath(rumiCurl(290,-14,30,Math.PI+.18,1));fill(TR,'gold');ink(TR,.55);ink(TC,.45);c.restore();
  var big=pencPath(290,-36,12,8,0,.5),mid=pencPath(290,-36,7.5,8,Math.PI/8,.5),cen=new Path2D();cen.arc(290,-36,2.8,0,7);
  fill(big,'red');ink(big,.5);fill(mid,'pink');ink(mid,.4);fill(cen,'gold');ink(cen,.35);
  [[262,-18],[318,-18]].forEach(function(p){var P=pencPath(p[0],p[1],4.5,5,.4,.5);fill(P,'white');ink(P,.4);});
  goldLine(tin,1.3);ink(tin,.6);ink(tep,1);
  var alem=new Path2D();alem.moveTo(290,-90);alem.bezierCurveTo(285,-96,286,-103,290,-108);alem.bezierCurveTo(294,-103,295,-96,290,-90);fill(alem,'lapis');ink(alem,.5);
  var ad=new Path2D();ad.arc(290,-112,1.8,0,7);fill(ad,'gold');ink(ad,.35);

  // YAŞLANMA: lâciverd pul kayıpları, altında incelen altın, kir
  if(mode==='color'&&(o.age==null||o.age>0)){var ag=o.age==null?.5:o.age;
    LAP.forEach(function(L){c.save();c.clip(L[0],L[1]||'nonzero');for(var k=0;k<Math.round(60*ag);k++){var x=r()*580,y=-100+r()*280,s=.6+r()*1.6;c.fillStyle='rgba(226,214,184,'+(.5+r()*.4)+')';c.beginPath();c.ellipse(x,y,s,s*(.5+r()*.5),r()*3,0,7);c.fill();}c.restore();});
    c.save();c.clip(outer);c.globalCompositeOperation='multiply';for(var k2=0;k2<Math.round(14*ag);k2++){var wx=r()*580,wy=r()*180,wr=8+r()*22,wg=c.createRadialGradient(wx,wy,0,wx,wy,wr);wg.addColorStop(0,'rgba(170,120,80,.35)');wg.addColorStop(1,'rgba(170,120,80,0)');c.fillStyle=wg;c.fillRect(wx-wr,wy-wr,2*wr,2*wr);}
    var gg=c.createLinearGradient(0,0,0,180);gg.addColorStop(0,'rgba(200,175,140,.25)');gg.addColorStop(1,'rgba(200,175,140,0)');c.fillStyle=gg;c.fillRect(0,0,580,180);c.restore();}}

/* Serlevha tuvalleri: renk (C), altın maskesi (M), kabartı (B). w: unvan genişliği (px). */
var CACHE={};
function panel(w,o){o=o||{};var key=w+'|'+JSON.stringify(o);if(CACHE[key])return CACHE[key];var k=w/580,ox=32*k,oy=142*k,W=Math.ceil(644*k),H=Math.ceil((142+186)*k),out={k:k,ox:ox,oy:oy,w:W,h:H};
  ['color','metal','bump'].forEach(function(md){var C=cv(W,H),c=C.getContext('2d');c.setTransform(k,0,0,k,ox,oy);draw(c,md,o);out[md==='color'?'C':md==='metal'?'M':'B']=C;});
  // mühreyle perdahlanmış altının parıltısı (yalnız altın üstünde)
  if(o.sheen!==0){var S=cv(W,H),s=S.getContext('2d'),g=s.createLinearGradient(0,0,W,H*.9),sh=o.sheen==null?.5:o.sheen;
    g.addColorStop(0,'rgba(255,240,190,0)');g.addColorStop(.28,'rgba(255,240,190,'+(.55*sh)+')');g.addColorStop(.4,'rgba(255,240,190,0)');g.addColorStop(.62,'rgba(90,60,20,'+(.25*sh)+')');g.addColorStop(.78,'rgba(255,240,190,'+(.35*sh)+')');g.addColorStop(1,'rgba(255,240,190,0)');
    s.fillStyle=g;s.fillRect(0,0,W,H);s.globalCompositeOperation='destination-in';s.drawImage(out.M,0,0);var cx=out.C.getContext('2d');cx.globalCompositeOperation='screen';cx.drawImage(S,0,0);cx.globalCompositeOperation='source-over';}
  return CACHE[key]=out;}

window.Tezhip={panel:panel,motif:{penc:pencPath,leaf:leafPath,rumi:rumiPath,curl:rumiCurl,lobed:lobed},bz:bz,script:script,nib:nibPath,pattern:function(c,kind){return c.createPattern(PIG[kind](),'repeat');},paper:function(){return PIG.paper();},
  // birim koordinatlar (unvan sol üst = 0,0): tedavi canlandırmasındaki hasarların yerleri için
  geo:{kitabe:[290,90,118,46],kolL:[19,90,46,52],kolR:[561,90,46,52],tep:[290,-30]}};
})();

(function(){
'use strict';
var THREE=window.THREE;
function fallback(id,msg){var c=document.getElementById(id);if(!c)return;var d=document.createElement('div');d.className='fallback';d.textContent=msg;c.appendChild(d);}
if(!THREE){['hero3d','book3d','shelf3d','box3d'].forEach(function(id){fallback(id,'3D model yüklenemedi. İnternet bağlantısını kontrol edin.');});return;}
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var D2R=Math.PI/180;
function damp(c,t,k,dt){return c+(t-c)*(1-Math.exp(-k*dt));}

/* ---------- Doku üreticileri ---------- */
function canvasTex(w,hgt,draw){var c=document.createElement('canvas');c.width=w;c.height=hgt;var x=c.getContext('2d');draw(x,w,hgt);var t=new THREE.CanvasTexture(c);t.anisotropy=4;if(THREE.sRGBEncoding)t.encoding=THREE.sRGBEncoding;return t;}
var seed=3;function rnd(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;}
function noise(x,w,h,n,a){for(var i=0;i<n;i++){x.fillStyle='rgba('+(rnd()>.5?'0,0,0':'255,230,200')+','+(rnd()*a)+')';x.fillRect(rnd()*w,rnd()*h,1+rnd()*3,1+rnd()*3);}}
function leather(opts){opts=opts||{};return canvasTex(512,720,function(x,w,h){
  x.fillStyle=opts.base||'#5A2F22';x.fillRect(0,0,w,h);noise(x,w,h,9000,.12);
  var g='#C9A15A';x.strokeStyle=g;x.lineWidth=5;x.strokeRect(26,26,w-52,h-52);x.lineWidth=2;x.strokeRect(40,40,w-80,h-80);
  if(opts.zencerek!==false){x.setLineDash([6,8]);x.strokeRect(52,52,w-104,h-104);x.setLineDash([]);}
  if(opts.semse!==false){if(opts.half){x.save();x.translate(0,h/2);}else{x.save();x.translate(w/2,h/2);}
  drawSemse(x,g,opts.half);x.restore();}
  if(!opts.half){x.fillStyle=g;[[52,52,1,1],[w-52,52,-1,1],[52,h-52,1,-1],[w-52,h-52,-1,-1]].forEach(function(c){x.beginPath();x.moveTo(c[0],c[1]);x.lineTo(c[0]+90*c[2],c[1]);x.quadraticCurveTo(c[0]+30*c[2],c[1]+30*c[3],c[0],c[1]+90*c[3]);x.fill();});}
});}
function drawSemse(x,g,half){var opts={half:half};
  x.fillStyle=g;x.beginPath();var rx=opts.half?120:110,ry=opts.half?150:150;
  for(var a=0;a<=Math.PI*2+.01;a+=Math.PI/48){var r=1+.07*Math.sin(a*12);var px=Math.cos(a)*rx*r,py=Math.sin(a)*ry*r;if(a===0)x.moveTo(px,py);else x.lineTo(px,py);}
  x.closePath();x.fill();x.fillStyle='#7A4630';x.beginPath();x.ellipse(0,0,rx*.62,ry*.62,0,0,Math.PI*2);x.fill();
  x.strokeStyle=g;x.lineWidth=3;for(var k=0;k<6;k++){x.beginPath();x.ellipse(0,0,rx*(.15+k*.08),ry*(.15+k*.08),0,0,Math.PI*2);x.stroke();}
  x.fillStyle=g;x.beginPath();x.moveTo(0,-ry*1.25);x.lineTo(14,-ry-4);x.lineTo(-14,-ry-4);x.fill();x.beginPath();x.moveTo(0,ry*1.25);x.lineTo(14,ry+4);x.lineTo(-14,ry+4);x.fill();
}
// Şemse: kapaktan ayrı, saydam zeminli madalyon dokusu (kapakla aynı ölçekte)
function semseTex(){return canvasTex(270,400,function(x,w,h){x.save();x.translate(w/2,h/2);drawSemse(x,'#C9A15A',false);x.restore();});}
function ebru(){return canvasTex(512,720,function(x,w,h){x.fillStyle='#E8DCC0';x.fillRect(0,0,w,h);var cols=['#2E4F7A','#9B3B2C','#C99A3E','#2F6B5A','#E8DCC0'];
  for(var k=0;k<5;k++){x.strokeStyle=cols[k];x.lineWidth=10+rnd()*14;x.globalAlpha=.75;for(var y=-40;y<h+40;y+=34+k*6){x.beginPath();for(var xx=0;xx<=w;xx+=8){var yy=y+Math.sin(xx/40+k)*14+Math.sin(xx/13+y)*5;if(xx===0)x.moveTo(xx,yy);else x.lineTo(xx,yy);}x.stroke();}}
  x.globalAlpha=1;for(var i=0;i<60;i++){x.fillStyle=cols[i%4];x.beginPath();x.arc(rnd()*w,rnd()*h,6+rnd()*16,0,7);x.fill();x.fillStyle='#E8DCC0';x.beginPath();x.arc(rnd()*w,rnd()*h,3+rnd()*6,0,7);x.fill();}});}
function page(){return canvasTex(512,720,function(x,w,h){x.fillStyle='#EFE3C2';x.fillRect(0,0,w,h);noise(x,w,h,2500,.05);x.strokeStyle='#9B2D20';x.lineWidth=3;x.strokeRect(54,60,w-108,h-120);x.strokeStyle='#C9A15A';x.lineWidth=1.5;x.strokeRect(60,66,w-120,h-132);
  for(var i=0;i<17;i++){var y=94+i*33,xx=80,end=w-80-(i===16?180:0);if(i%6===0){x.fillStyle='#9B2D20';x.fillRect(xx,y,40,7);xx+=50;}while(xx<end){var ww=18+rnd()*52;if(xx+ww>end)ww=end-xx;x.fillStyle='#2A2420';x.fillRect(xx,y+rnd()*3,ww,7);xx+=ww+7+rnd()*6;}}});}
function edges(){return canvasTex(256,256,function(x,w,h){x.fillStyle='#E9DCB8';x.fillRect(0,0,w,h);for(var y=0;y<h;y+=2){x.fillStyle='rgba(120,95,60,'+(rnd()*.25)+')';x.fillRect(0,y,w,1);}});}
function siraze(){return canvasTex(64,256,function(x,w,h){var c=['#9B2D20','#2F6B5A','#C99A3E','#F2E6C8'];for(var y=0;y<h;y+=16){for(var i=0;i<2;i++){x.fillStyle=c[((y/16)+i)%4];x.beginPath();x.moveTo(i*w/2,y);x.lineTo(i*w/2+w/2,y+8);x.lineTo(i*w/2,y+16);x.fill();x.fillStyle=c[((y/16)+i+1)%4];x.beginPath();x.moveTo(i*w/2+w/2,y);x.lineTo(i*w/2,y+8);x.lineTo(i*w/2+w/2,y+16);x.fill();}}});}
function label(lines,bg){return canvasTex(512,256,function(x,w,h){x.fillStyle=bg||'#F4F1EA';x.fillRect(0,0,w,h);x.strokeStyle='#1B1F1C';x.lineWidth=3;x.strokeRect(10,10,w-20,h-20);x.fillStyle='#1B1F1C';x.textAlign='center';x.font='600 46px "IBM Plex Sans", Arial';x.fillText(lines[0],w/2,110);x.font='400 30px "IBM Plex Sans", Arial';x.fillText(lines[1]||'',w/2,170);});}

/* ---------- Gerçekçi dokular (eskilerin yerini alır: aynı adlı işlevler sonradan tanımlandığı için bunlar geçerlidir) ---------- */
// Her doku: renk haritası + (deri için) kabartma, metal ve pürüzlülük haritaları. Altınlar ışıkta parlar, baskılar çukur görünür.
function _cv(w,h){var c=document.createElement('canvas');c.width=w;c.height=h;return c;}
// Telefon ve tabletlerde büyük dokular yarı boyuta indirilir (bellek sınırı ve hız için)
var _LOW=(function(){try{return matchMedia('(max-width: 760px)').matches||matchMedia('(pointer: coarse)').matches;}catch(e){return false;}})();
function _shrink(c){if(!_LOW||c.__keep||c.width*c.height<=520*520)return c;var s=_cv(Math.round(c.width/2),Math.round(c.height/2)),x=s.getContext('2d');x.drawImage(c,0,0,s.width,s.height);c.width=c.height=1;return s;}
function _tx(c,srgb){c=_shrink(c);var t=new THREE.CanvasTexture(c);t.anisotropy=8;if(srgb!==false&&THREE.sRGBEncoding)t.encoding=THREE.sRGBEncoding;return t;}
function _rng(seed){return function(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};}
// yumuşak lekeler (büyük ölçekli renk dalgalanması)
function _blot(x,w,h,n,cols,rmin,rmax,a,r){for(var i=0;i<n;i++){var cx=r()*w,cy=r()*h,rr=rmin+r()*(rmax-rmin),g=x.createRadialGradient(cx,cy,0,cx,cy,rr);g.addColorStop(0,cols[i%cols.length].replace('A',a));g.addColorStop(1,cols[i%cols.length].replace('A','0'));x.fillStyle=g;x.fillRect(cx-rr,cy-rr,2*rr,2*rr);}}
function _gold(x,x0,y0,x1,y1){var g=x.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,'#8E6A2C');g.addColorStop(.35,'#E2C273');g.addColorStop(.55,'#B8913F');g.addColorStop(.8,'#EED68C');g.addColorStop(1,'#94702F');return g;}
// dilimli (tığlı) şemse dış çizgisi
function _semsePath(x,cx,cy,a,b,lobes,amp){x.beginPath();for(var t=0;t<=Math.PI*2+.001;t+=Math.PI/180){var k=1+amp*Math.pow(Math.abs(Math.cos(t*lobes/2)),.6);var px=cx+Math.sin(t)*a*k,py=cy-Math.cos(t)*b*k;
  // uçlara doğru sivrilen badem biçimi
  var s=Math.abs(Math.cos(t));px=cx+(px-cx)*(1-.18*Math.pow(s,3));if(t===0)x.moveTo(px,py);else x.lineTo(px,py);}x.closePath();}
// rumi / hatayi kıvrımları: dört yönde simetrik helezonlar
function _rumi(x,cx,cy,sx,sy,col,lw){x.save();x.strokeStyle=col;x.lineWidth=lw;x.lineCap='round';
  [[1,1],[-1,1],[1,-1],[-1,-1]].forEach(function(m){x.save();x.translate(cx,cy);x.scale(m[0]*sx,m[1]*sy);
    x.beginPath();x.moveTo(0,0);x.bezierCurveTo(.25,.05,.45,.3,.35,.55);x.bezierCurveTo(.28,.72,.08,.7,.1,.55);x.bezierCurveTo(.12,.42,.28,.45,.26,.56);x.stroke();
    x.beginPath();x.moveTo(.05,.2);x.bezierCurveTo(.4,.15,.7,.2,.78,.05);x.stroke();
    x.beginPath();x.moveTo(.5,.18);x.quadraticCurveTo(.62,.36,.52,.42);x.stroke();
    x.beginPath();x.ellipse(.62,.12,.06,.03,-.4,0,7);x.stroke();x.restore();});x.restore();}
var _leaCache={};
function leather(opts){var k=JSON.stringify(opts||{});return _leaCache[k]||(_leaCache[k]=_leatherRaw(opts));}
function _leatherRaw(opts){opts=opts||{};var W=1024,H=1440,C=_cv(W,H),B=_cv(W,H),M=_cv(W,H),c=C.getContext('2d'),b=B.getContext('2d'),m=M.getContext('2d'),r=_rng(opts.seed||11);
  // deri zemini: koyu vişne-kahve, büyük lekeler, gren ve kırışıklar
  c.fillStyle=opts.base||'#4B1D13';c.fillRect(0,0,W,H);
  _blot(c,W,H,90,['rgba(120,52,30,A)','rgba(30,10,6,A)','rgba(98,40,22,A)'],60,260,.18,r);
  b.fillStyle='rgb(128,128,128)';b.fillRect(0,0,W,H);m.fillStyle='#000';m.fillRect(0,0,W,H);
  for(var i=0;i<26000;i++){var px=r()*W,py=r()*H,s=1+r()*2.2,v=r();c.fillStyle=v<.5?'rgba(0,0,0,'+(.10+r()*.12)+')':'rgba(190,120,80,'+(.04+r()*.06)+')';c.fillRect(px,py,s,s);b.fillStyle=v<.5?'rgba(70,70,70,.5)':'rgba(190,190,190,.4)';b.fillRect(px,py,s,s);}
  c.lineWidth=1;for(i=0;i<260;i++){var x0=r()*W,y0=r()*H,l=8+r()*40,an=r()*Math.PI;c.strokeStyle='rgba(20,6,3,'+(.15+r()*.2)+')';c.beginPath();c.moveTo(x0,y0);c.quadraticCurveTo(x0+Math.cos(an)*l/2+r()*6,y0+Math.sin(an)*l/2+r()*6,x0+Math.cos(an)*l,y0+Math.sin(an)*l);c.stroke();
    b.strokeStyle='rgba(60,60,60,.6)';b.beginPath();b.moveTo(x0,y0);b.lineTo(x0+Math.cos(an)*l,y0+Math.sin(an)*l);b.stroke();}
  // sağrı gren: küçük düzensiz hücreler (deri gözenekleri) ve gözenek noktaları
  for(i=0;i<5200;i++){var gx=r()*W,gy=r()*H,gr=3+r()*6,ga=r()*Math.PI;c.strokeStyle='rgba(18,6,3,'+(.10+r()*.14)+')';c.lineWidth=1;c.beginPath();c.ellipse(gx,gy,gr,gr*(.5+r()*.5),ga,0,Math.PI*(1+r()));c.stroke();
    b.strokeStyle='rgba(40,40,40,.55)';b.lineWidth=1.6;b.beginPath();b.ellipse(gx,gy,gr,gr*.7,ga,0,Math.PI*1.4);b.stroke();}
  for(i=0;i<9000;i++){var qx=r()*W,qy=r()*H;c.fillStyle='rgba(10,3,2,'+(.18+r()*.2)+')';c.fillRect(qx,qy,1.3,1.3);b.fillStyle='rgba(30,30,30,.7)';b.fillRect(qx,qy,1.5,1.5);}
  // iri sağrı taneleri: uzaktan da seçilen kabarık deri tepecikleri (açık üst, koyu kenar)
  for(i=0;i<7000;i++){var tx=r()*W,ty=r()*H,tr=4+r()*7;var tg=c.createRadialGradient(tx-tr*.3,ty-tr*.3,0,tx,ty,tr);tg.addColorStop(0,'rgba(150,80,50,.22)');tg.addColorStop(.7,'rgba(90,40,24,.05)');tg.addColorStop(1,'rgba(10,3,2,.28)');c.fillStyle=tg;c.beginPath();c.arc(tx,ty,tr,0,7);c.fill();
    var hg=b.createRadialGradient(tx,ty,0,tx,ty,tr);hg.addColorStop(0,'rgba(200,200,200,.5)');hg.addColorStop(1,'rgba(40,40,40,.5)');b.fillStyle=hg;b.beginPath();b.arc(tx,ty,tr,0,7);b.fill();}
  // yaşlı derinin kırışık ve çatlak ağı
  function crack(x0,y0,n,len){var px=x0,py=y0,an=r()*Math.PI*2;c.beginPath();c.moveTo(px,py);b.beginPath();b.moveTo(px,py);
    for(var k=0;k<n;k++){an+=(r()-.5)*1.4;px+=Math.cos(an)*len*(.5+r());py+=Math.sin(an)*len*(.5+r());c.lineTo(px,py);b.lineTo(px,py);}
    c.strokeStyle='rgba(12,4,2,'+(.35+r()*.25)+')';c.lineWidth=1.2+r()*1.4;c.stroke();b.strokeStyle='rgba(20,20,20,.9)';b.lineWidth=2.2;b.stroke();
    c.strokeStyle='rgba(185,115,78,.18)';c.lineWidth=1;c.save();c.translate(1.5,1.5);c.stroke();c.restore();}
  for(i=0;i<420;i++)crack(r()*W,r()*H,3+Math.floor(r()*6),10+r()*22);
  // geniş kırışıklar (kapağın bükülmesinden)
  for(i=0;i<14;i++){var wy0=r()*H,wa=(r()-.5)*.5;c.strokeStyle='rgba(15,5,3,.28)';c.lineWidth=3+r()*3;c.beginPath();c.moveTo(-10,wy0);c.bezierCurveTo(W*.3,wy0+Math.sin(wa)*80+r()*40,W*.6,wy0-r()*60,W+10,wy0+(r()-.5)*90);c.stroke();
    b.strokeStyle='rgba(50,50,50,.7)';b.lineWidth=5;b.beginPath();b.moveTo(-10,wy0);b.bezierCurveTo(W*.3,wy0+40,W*.6,wy0-30,W+10,wy0);b.stroke();}
  // çizikler ve sürtünme izleri (açık renkli)
  for(i=0;i<160;i++){var sx=r()*W,sy=r()*H,sl=20+r()*140,sa=r()*Math.PI;c.strokeStyle='rgba(185,115,78,'+(.18+r()*.22)+')';c.lineWidth=.8+r()*1.2;c.beginPath();c.moveTo(sx,sy);c.lineTo(sx+Math.cos(sa)*sl,sy+Math.sin(sa)*sl);c.stroke();
    b.strokeStyle='rgba(95,95,95,.8)';b.lineWidth=1.4;b.beginPath();b.moveTo(sx,sy);b.lineTo(sx+Math.cos(sa)*sl,sy+Math.sin(sa)*sl);b.stroke();}
  _blot(c,W,H,45,['rgba(170,100,62,A)','rgba(15,5,3,A)'],30,140,.22,r);
  // kenar ve köşe aşınması
  var e=c.createLinearGradient(0,0,90,0);e.addColorStop(0,'rgba(150,80,48,.55)');e.addColorStop(1,'rgba(150,80,48,0)');c.fillStyle=e;c.fillRect(0,0,90,H);
  e=c.createLinearGradient(W,0,W-90,0);e.addColorStop(0,'rgba(150,80,48,.55)');e.addColorStop(1,'rgba(150,80,48,0)');c.fillStyle=e;c.fillRect(W-90,0,90,H);
  e=c.createLinearGradient(0,0,0,90);e.addColorStop(0,'rgba(150,80,48,.5)');e.addColorStop(1,'rgba(150,80,48,0)');c.fillStyle=e;c.fillRect(0,0,W,90);
  e=c.createLinearGradient(0,H,0,H-90);e.addColorStop(0,'rgba(150,80,48,.5)');e.addColorStop(1,'rgba(150,80,48,0)');c.fillStyle=e;c.fillRect(0,H-90,W,90);
  if(opts.plain){opts._shine=_wear(c,b,W,H,r,opts);return _leatherOut(C,B,M,opts);}
  // yaldızlı süslemeler: renk + metal maskesi + çukur kabartma aynı yolla çizilir
  function deco(fn){c.save();c.fillStyle=_gold(c,0,0,W,H);c.strokeStyle=_gold(c,0,0,W,H);fn(c,'gold');c.restore();
    m.save();m.fillStyle='#fff';m.strokeStyle='#fff';fn(m,'mask');m.restore();b.save();b.fillStyle='rgb(70,70,70)';b.strokeStyle='rgb(70,70,70)';fn(b,'mask');b.restore();}
  var half=!!opts.half,cx=half?0:W/2,cy=H/2;
  // çerçeve: dış cetvel, zencerek bandı, iç cetvel
  deco(function(x){x.lineWidth=7;x.strokeRect(40,40,W-80,H-80);x.lineWidth=3;x.strokeRect(58,58,W-116,H-116);x.strokeRect(96,96,W-192,H-192);});
  if(opts.zencerek!==false)deco(function(x,mode){x.lineWidth=3;var step=26;function link(px,py,rot){x.save();x.translate(px,py);x.rotate(rot);x.beginPath();x.ellipse(0,0,10,5,0,0,7);x.stroke();x.beginPath();x.arc(0,0,2.2,0,7);x.fill();x.restore();}
    for(var X=70;X<W-70;X+=step){link(X+step/2,77,0);link(X+step/2,H-77,0);}for(var Y=70;Y<H-70;Y+=step){link(77,Y+step/2,Math.PI/2);link(W-77,Y+step/2,Math.PI/2);}});
  if(opts.semse!==false){
    deco(function(x,mode){var A=half?240:200,Bb=half?330:300;_semsePath(x,cx,cy,A,Bb,24,.05);x.fill();
      // salbek ve tepelikler
      [-1,1].forEach(function(sg){var y=cy+sg*(Bb+58);x.beginPath();x.moveTo(cx,cy+sg*(Bb-8));x.lineTo(cx,y-sg*30);x.lineWidth=6;x.stroke();_semsePath(x,cx,y,34,30,10,.12);x.fill();x.beginPath();x.moveTo(cx-8,y+sg*28);x.lineTo(cx,y+sg*58);x.lineTo(cx+8,y+sg*28);x.fill();});});
    // şemse içi: koyu altın rumi kıvrımları ve iç dilim çizgisi (renk haritasında)
    var A=half?240:200,Bb=half?330:300;c.save();_semsePath(c,cx,cy,A,Bb,24,.05);c.clip();_rumi(c,cx,cy,A*.95,Bb*.95,'rgba(92,60,18,.85)',.012);c.restore();
    c.save();c.lineWidth=3;c.strokeStyle='rgba(92,60,18,.8)';_semsePath(c,cx,cy,A*.88,Bb*.9,24,.05);c.stroke();c.restore();
    b.save();_semsePath(b,cx,cy,A,Bb,24,.05);b.clip();_rumi(b,cx,cy,A*.95,Bb*.95,'rgb(40,40,40)',.012);b.restore();}
  if(!half&&opts.kosebent!==false){
    // köşebentler: köşelerde çeyrek dilimli madalyon
    [[96,96,1,1],[W-96,96,-1,1],[96,H-96,1,-1],[W-96,H-96,-1,-1]].forEach(function(k){
      deco(function(x){x.save();x.beginPath();x.rect(k[2]>0?k[0]:k[0]-260,k[3]>0?k[1]:k[1]-260,260,260);x.clip();_semsePath(x,k[0],k[1],210,210,16,.06);x.fill();x.restore();});
      c.save();c.beginPath();c.rect(k[2]>0?k[0]:k[0]-260,k[3]>0?k[1]:k[1]-260,260,260);c.clip();_semsePath(c,k[0],k[1],210,210,16,.06);c.clip();_rumi(c,k[0],k[1],210*k[2],210*k[3],'rgba(92,60,18,.8)',.014);c.restore();});}
  // yer yer aşınmış altın: deri görünür; altında ince çatlaklar
  for(i=0;i<2600;i++){var wx=r()*W,wy=r()*H,ws=1+r()*4;c.fillStyle='rgba(60,24,14,'+(.35+r()*.4)+')';c.fillRect(wx,wy,ws,ws*0.7);m.fillStyle='rgba(0,0,0,.6)';m.fillRect(wx,wy,ws,ws*.7);}
  c.lineWidth=.9;for(i=0;i<500;i++){var kx=r()*W,ky=r()*H;c.strokeStyle='rgba(70,40,15,.35)';c.beginPath();c.moveTo(kx,ky);c.lineTo(kx+r()*14-7,ky+r()*14-7);c.lineTo(kx+r()*20-10,ky+r()*20-10);c.stroke();}
  // kullanım izleri en son: altın da köşede ve katta aşınır
  opts._shine=_wear(c,b,W,H,r,opts);
  return _leatherOut(C,B,M,opts);}

// Kullanım izleri: el yağıyla koyulaşma ve parlama, köşelerde açılan deri, katlama çatlakları, sırtta kırışık
function _wear(c,b,W,H,r,opts){var shine=[],i,j,a;
  // katlama yeri (doku sol kenarı: kapak menteşesi / miklep katı): çatlak ve açılan renk
  if(!opts.plain){var jw=60,jg=c.createLinearGradient(0,0,jw*1.6,0);jg.addColorStop(0,'rgba(165,100,66,.55)');jg.addColorStop(1,'rgba(165,100,66,0)');c.fillStyle=jg;c.fillRect(0,0,jw*1.6,H);
    for(i=0;i<90;i++){var y=r()*H,l=6+r()*26,x0=r()*jw;c.strokeStyle='rgba(12,4,2,.55)';c.lineWidth=1+r()*1.5;c.beginPath();c.moveTo(x0,y);c.lineTo(x0+(r()-.5)*8,y+l);c.stroke();
      b.strokeStyle='rgba(20,20,20,.9)';b.lineWidth=2;b.beginPath();b.moveTo(x0,y);b.lineTo(x0,y+l);b.stroke();
      c.fillStyle='rgba(200,140,100,.35)';c.fillRect(r()*jw,r()*H,2+r()*5,1+r()*3);}
    // el izi: açılan kenarın ortası (doku sağ kenarı) koyulaşır ve parlar
    var hx=W-30,hy=opts.half?H*.5:H*.52,hr=opts.half?300:240,hg=c.createRadialGradient(hx,hy,0,hx,hy,hr);hg.addColorStop(0,'rgba(14,4,2,.72)');hg.addColorStop(.6,'rgba(14,4,2,.3)');hg.addColorStop(1,'rgba(18,6,3,0)');c.fillStyle=hg;c.fillRect(hx-hr,hy-hr,2*hr,2*hr);shine.push([hx,hy,hr]);
    [[W*.7,H-20],[W*.7,20]].forEach(function(p){var g2=c.createRadialGradient(p[0],p[1],0,p[0],p[1],160);g2.addColorStop(0,'rgba(18,6,3,.32)');g2.addColorStop(1,'rgba(18,6,3,0)');c.fillStyle=g2;c.fillRect(p[0]-160,p[1]-160,320,320);shine.push([p[0],p[1],140]);});
    // köşeler: deri incelip açılmış, altta mukavva
    var cs=opts.half?[[W,0],[W,H]]:[[0,0],[W,0],[0,H],[W,H]];
    cs.forEach(function(k){var sx=k[0]?-1:1,sy=k[1]?-1:1,n=16,R0=70+r()*45;c.beginPath();c.moveTo(k[0],k[1]);
      for(j=0;j<=n;j++){a=j/n*Math.PI/2;var rr=R0*(.55+r()*.6);c.lineTo(k[0]+sx*Math.cos(a)*rr,k[1]+sy*Math.sin(a)*rr);}c.closePath();
      c.save();c.fillStyle='#6B5541';c.fill();c.clip();for(var q=0;q<160;q++){c.fillStyle='rgba('+(r()<.5?'40,28,18':'150,125,95')+','+(.25+r()*.3)+')';c.fillRect(k[0]+sx*r()*R0*1.2,k[1]+sy*r()*R0*1.2,1+r()*3,1+r()*2);}c.restore();
      c.strokeStyle='rgba(205,150,110,.6)';c.lineWidth=2.4;c.stroke();
      b.save();b.fillStyle='rgb(55,55,55)';b.beginPath();b.moveTo(k[0],k[1]);for(j=0;j<=n;j++){a=j/n*Math.PI/2;b.lineTo(k[0]+sx*Math.cos(a)*R0*.8,k[1]+sy*Math.sin(a)*R0*.8);}b.closePath();b.fill();b.restore();
      var cg=c.createRadialGradient(k[0],k[1],R0,k[0],k[1],R0*3.2);cg.addColorStop(0,'rgba(170,105,70,.45)');cg.addColorStop(1,'rgba(170,105,70,0)');c.fillStyle=cg;c.fillRect(k[0]-R0*3.2,k[1]-R0*3.2,R0*6.4,R0*6.4);});}
  else{ // sırt (düz deri): enine kırışıklar, baş ve kuyrukta yıpranma
    for(i=0;i<40;i++){var yy=r()*H;c.strokeStyle='rgba(12,4,2,'+(.35+r()*.3)+')';c.lineWidth=1.5+r()*2;c.beginPath();c.moveTo(0,yy);c.bezierCurveTo(W*.3,yy+(r()-.5)*20,W*.7,yy+(r()-.5)*20,W,yy+(r()-.5)*14);c.stroke();
      b.strokeStyle='rgba(30,30,30,.9)';b.lineWidth=3;b.beginPath();b.moveTo(0,yy);b.lineTo(W,yy);b.stroke();}
    [0,H].forEach(function(y0){var g3=c.createLinearGradient(0,y0,0,y0?y0-120:120);g3.addColorStop(0,'rgba(175,110,74,.6)');g3.addColorStop(1,'rgba(175,110,74,0)');c.fillStyle=g3;c.fillRect(0,y0?y0-120:0,W,120);
      for(var q2=0;q2<26;q2++){var px=r()*W,pw=6+r()*28,ph=4+r()*16;c.fillStyle='rgba(107,85,65,.9)';c.fillRect(px,y0?y0-ph:0,pw,ph);}});}
  return shine;}
function _leatherOut(C,B,M,opts){var t=_tx(C);var R=_cv(M.width,M.height),rx=R.getContext('2d');rx.fillStyle='rgb(205,205,205)';rx.fillRect(0,0,R.width,R.height);rx.globalCompositeOperation='difference';rx.globalAlpha=.55;rx.drawImage(M,0,0);rx.globalCompositeOperation='source-over';rx.globalAlpha=1;(opts._shine||[]).forEach(function(s){var g=rx.createRadialGradient(s[0],s[1],0,s[0],s[1],s[2]);g.addColorStop(0,'rgba(90,90,90,.75)');g.addColorStop(1,'rgba(90,90,90,0)');rx.fillStyle=g;rx.fillRect(s[0]-s[2],s[1]-s[2],2*s[2],2*s[2]);});
  t.userData={bump:_tx(B,false),metal:_tx(M,false),rough:_tx(R,false)};return t;}
// Deri ya da şemse dokusundan kabartmalı, altını parlayan malzeme
function leatherMat(t,o){o=o||{};var u=t.userData||{};return new THREE.MeshStandardMaterial({map:t,bumpMap:u.bump||null,bumpScale:o.bump==null?.24:o.bump,metalnessMap:u.metal||null,metalness:u.metal?.42:(o.metalness||.05),roughnessMap:u.rough||null,roughness:u.rough?1:(o.roughness||.8),emissiveMap:u.metal||null,emissive:u.metal?new THREE.Color(.30,.22,.09):new THREE.Color(0,0,0),transparent:!!o.transparent,alphaTest:o.alphaTest||0});}
// Ayrı şemse (anatomi modelinde kapaktan yükselen madalyon): saydam zemin
function semseTex(){var W=540,H=800,C=_cv(W,H),M=_cv(W,H),B=_cv(W,H),c=C.getContext('2d'),m=M.getContext('2d'),b=B.getContext('2d');var cx=W/2,cy=H/2,A=200,Bb=300;
  b.fillStyle='rgb(128,128,128)';b.fillRect(0,0,W,H);
  function shape(x){_semsePath(x,cx,cy,A,Bb,24,.05);x.fill();[-1,1].forEach(function(sg){var y=cy+sg*(Bb+50);x.lineWidth=6;x.beginPath();x.moveTo(cx,cy+sg*(Bb-8));x.lineTo(cx,y-sg*26);x.stroke();_semsePath(x,cx,y,30,26,10,.12);x.fill();});}
  c.fillStyle=_gold(c,0,0,W,H);c.strokeStyle=c.fillStyle;shape(c);m.fillStyle=m.strokeStyle='#fff';shape(m);
  c.save();_semsePath(c,cx,cy,A,Bb,24,.05);c.clip();_rumi(c,cx,cy,A*.95,Bb*.95,'rgba(92,60,18,.85)',.012);c.restore();c.save();c.lineWidth=3;c.strokeStyle='rgba(92,60,18,.8)';_semsePath(c,cx,cy,A*.88,Bb*.9,24,.05);c.stroke();c.restore();
  b.save();_semsePath(b,cx,cy,A,Bb,24,.05);b.clip();_rumi(b,cx,cy,A*.95,Bb*.95,'rgb(60,60,60)',.012);b.restore();
  return _leatherOut(C,B,M,{});}
/* Battal ebru: boya damlalarının birbirini itmesiyle oluşan desen (damla yer değiştirme bağıntısıyla hesaplanır) */
var _ebruCache=null;
function _ebruCanvas(){if(_ebruCache)return _ebruCache;var w=260,h=364,img=_cv(w,h),x=img.getContext('2d'),d=x.createImageData(w,h),r=_rng(29);
  var cols=[[38,58,104],[188,132,52],[150,52,36],[96,122,160],[112,68,40],[38,58,104],[150,52,36]],drops=[];
  for(var i=0;i<700;i++){var rr=3+Math.pow(r(),2.2)*16;drops.push({x:r()*w,y:r()*h,r2:rr*rr,c:cols[Math.floor(r()*cols.length)]});}
  // hafif tarama: damlaların üzerinden yatay dalgalı çekiş
  for(var py=0;py<h;py++)for(var px=0;px<w;px++){var X=px,Y=py,col=null;
      for(var k=drops.length-1;k>=0;k--){var D=drops[k],dx=X-D.x,dy=Y-D.y,q=dx*dx+dy*dy;if(q<=D.r2){col=D.c;break;}var f=Math.sqrt(1-D.r2/q);X=D.x+dx*f;Y=D.y+dy*f;}
      col=col||[233,224,201];var o=(py*w+px)*4,n=(r()-.5)*10;d.data[o]=col[0]+n;d.data[o+1]=col[1]+n;d.data[o+2]=col[2]+n;d.data[o+3]=255;}
  x.putImageData(d,0,0);_ebruCache=img;return img;}
function ebru(opts){opts=opts||{};var W=512,H=720,C=_cv(W,H),c=C.getContext('2d');c.imageSmoothingEnabled=true;c.drawImage(_ebruCanvas(),0,0,W,H);
  // ince damarlar
  var r=_rng(41);c.strokeStyle='rgba(30,20,15,.12)';c.lineWidth=.8;for(var i=0;i<120;i++){var x0=r()*W,y0=r()*H;c.beginPath();c.moveTo(x0,y0);c.quadraticCurveTo(x0+r()*30-15,y0+r()*30-15,x0+r()*50-25,y0+r()*50-25);c.stroke();}
  for(i=0;i<5000;i++){c.fillStyle=r()<.5?'rgba(0,0,0,.06)':'rgba(255,255,255,.07)';c.fillRect(r()*W,r()*H,1.4,1.4);}
  for(var vy=0;vy<H;vy+=3){c.fillStyle='rgba(255,250,235,.03)';c.fillRect(0,vy,W,1);}
  if(opts.doublure){ // iç kapak: kenarlarda kıvrılan deri ve altın cetvel
    c.strokeStyle='#4B1D13';c.lineWidth=60;c.strokeRect(0,0,W,H);c.strokeStyle='#C9A15A';c.lineWidth=3;c.strokeRect(32,32,W-64,H-64);}
  return _tx(C);}
/* Sayfa: aharlı kâğıt, altın cetvel, nesih satırlar, kırmızı başlık, durak gülleri, derkenar ve reklam */
function _word(x,px,base,len,r,ink){var x1=px-len;x.save();x.globalAlpha=.72+r()*.28;x.strokeStyle=ink;x.fillStyle=ink;x.lineWidth=2.6+r()*.9;x.lineCap='round';x.lineJoin='round';
  x.beginPath();x.moveTo(px,base);var cur=px;while(cur>x1){var st=4+r()*7;var t=r();
    if(t<.22){x.lineTo(cur,base);x.lineTo(cur,base-26-r()*8);x.moveTo(cur,base);}            // elif
    else if(t<.4){x.quadraticCurveTo(cur-st/2,base-9,cur-st,base);}                          // diş
    else if(t<.52){x.quadraticCurveTo(cur-st,base+16,cur-st*1.6,base+8);x.moveTo(cur-st,base);} // kuyruk (ra, vav)
    else if(t<.6){x.moveTo(cur-4,base-4);x.arc(cur-4,base-4,4,0,7);x.moveTo(cur,base);}      // göz (mim, fe)
    else x.lineTo(cur-st,base+(r()-.5)*2);
    cur-=st;}
  x.lineTo(x1,base);x.stroke();
  var nd=Math.floor(r()*4);for(var i=0;i<nd;i++){var dx=px-r()*len,dy=r()<.5?base-14-r()*6:base+10+r()*4;x.save();x.translate(dx,dy);x.rotate(.78);x.fillRect(-2.2,-2.2,4.4,4.4);if(r()<.3)x.fillRect(4,-2.2,4.4,4.4);x.restore();}x.restore();}
function _rosette(x,cx,cy,rad){x.fillStyle=_gold(x,cx-rad,cy-rad,cx+rad,cy+rad);x.beginPath();for(var k=0;k<16;k++){var a=k/16*Math.PI*2,rr=k%2?rad*.7:rad;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}x.fill();x.fillStyle='#23458F';x.beginPath();x.arc(cx,cy,rad*.38,0,7);x.fill();x.fillStyle='#B3261E';x.beginPath();x.arc(cx,cy,rad*.16,0,7);x.fill();}
var _pageCache={},_paperBase=null,_pageMaps=null;
// ortak kâğıt: lifler, kalıp çizgileri (her sayfada farklı yönde ve tonda kullanılır)
function _paper(){if(_paperBase)return _paperBase;var W=1024,H=1440,C=_cv(W,H),c=C.getContext('2d'),r=_rng(5),i;
  c.fillStyle='#EEE0BD';c.fillRect(0,0,W,H);
  for(i=0;i<9000;i++){var x0=r()*W,y0=r()*H,l=3+r()*10,an=r()*Math.PI;c.strokeStyle=r()<.5?'rgba(150,120,80,.07)':'rgba(255,250,235,.12)';c.lineWidth=.8;c.beginPath();c.moveTo(x0,y0);c.lineTo(x0+Math.cos(an)*l,y0+Math.sin(an)*l);c.stroke();}
  for(var ly=0;ly<H;ly+=4){c.fillStyle='rgba(120,95,55,'+(.035+r()*.03)+')';c.fillRect(0,ly,W,1);}
  for(var cxl=40;cxl<W;cxl+=88){c.fillStyle='rgba(120,95,55,.07)';c.fillRect(cxl+r()*3,0,2,H);}
  for(i=0;i<1800;i++){var fx0=r()*W,fy0=r()*H,fl=10+r()*28,fa=r()*Math.PI;c.strokeStyle='rgba(110,85,50,'+(.06+r()*.08)+')';c.lineWidth=.6+r()*.6;c.beginPath();c.moveTo(fx0,fy0);c.quadraticCurveTo(fx0+r()*10-5,fy0+r()*10-5,fx0+Math.cos(fa)*fl,fy0+Math.sin(fa)*fl);c.stroke();}
  return _paperBase=C;}
// kabartı/metal/pürüz haritaları: düz sayfalarda ortak (cetvel her sayfada aynı yerde)
function _pageMapsMake(SP,r){var L=150,T=190,W=1024,R=W-150,Bm=1440-230;
  var M=_cv(512,720),mx=M.getContext('2d');mx.fillStyle='#000';mx.fillRect(0,0,512,720);mx.scale(.5,.5);mx.fillStyle='#fff';
  [[L-9,T-9,R-L+18,7],[L-9,Bm+2,R-L+18,7],[L-9,T-9,7,Bm-T+18],[R+2,T-9,7,Bm-T+18]].forEach(function(q){mx.fillRect(q[0],q[1],q[2],q[3]);});
  if(SP)mx.drawImage(SP.M,L-SP.ox,T-SP.oy);
  var B=_cv(512,720),bx=B.getContext('2d'),i;bx.fillStyle='rgb(128,128,128)';bx.fillRect(0,0,512,720);_blot(bx,512,720,30,['rgba(160,160,160,A)','rgba(100,100,100,A)'],60,200,.35,r);
  for(var by=0;by<720;by+=2){bx.fillStyle='rgba(90,90,90,.18)';bx.fillRect(0,by,512,.6);}
  for(i=0;i<2500;i++){bx.strokeStyle=r()<.5?'rgba(80,80,80,.35)':'rgba(180,180,180,.35)';bx.lineWidth=.6;var ax=r()*512,ay=r()*720,al=4+r()*10,aa=r()*Math.PI;bx.beginPath();bx.moveTo(ax,ay);bx.lineTo(ax+Math.cos(aa)*al,ay+Math.sin(aa)*al);bx.stroke();}
  if(SP){bx.save();bx.globalAlpha=.55;bx.drawImage(SP.B,(L-SP.ox)/2,(T-SP.oy)/2,SP.w/2,SP.h/2);bx.restore();}
  var Rg=_cv(512,720),rx=Rg.getContext('2d');rx.fillStyle='rgb(242,242,242)';rx.fillRect(0,0,512,720);rx.globalCompositeOperation='difference';rx.globalAlpha=.6;rx.drawImage(M,0,0);
  return {bump:_tx(B,false),metal:_tx(M,false),rough:_tx(Rg,false)};}
/* Sayfa: her yaprak yüzü kendi tohumuyla farklıdır — ton, leke, su izi, kurt deliği, rubrik, derkenar, reklam.
   opts.verso: sayfanın arka yüzü (dış kenar solda; doku yatayda çevrilerek okunur hâle gelir). */
function page(opts){opts=opts||{};var key=JSON.stringify(opts);if(_pageCache[key])return _pageCache[key];var W=1024,H=1440,C=_cv(W,H),c=C.getContext('2d'),r=_rng((opts.seed||5)*7919%2147483646+1),i;
  r();r();var V=!!opts.verso,OUT=V?0:W; // dış kenar
  // kâğıt: ortak lifli zemin farklı yönde
  var fx=r()<.5,fy=r()<.5;c.save();c.translate(fx?W:0,fy?H:0);c.scale(fx?-1:1,fy?-1:1);c.drawImage(_paper(),0,0);c.restore();
  var tone=[[205,175,120],[214,186,128],[196,168,118],[222,200,150]][Math.floor(r()*4)];
  c.fillStyle='rgba('+tone+','+(.05+r()*.12)+')';c.fillRect(0,0,W,H);
  _blot(c,W,H,30+Math.floor(r()*40),['rgba(205,175,120,A)','rgba(250,240,215,A)','rgba(185,150,100,A)'],80,320,(.12+r()*.16).toFixed(2),r);
  // kenarlara doğru kararma: dış kenarda ve altta daha fazla (el teması)
  var ex=OUT===W?W*.42:W*.58,g=c.createRadialGradient(ex,H*.47,H*(.3+r()*.08),ex,H*.47,H*.78);g.addColorStop(0,'rgba(160,110,50,0)');g.addColorStop(1,'rgba(150,100,45,'+(.25+r()*.2)+')');c.fillStyle=g;c.fillRect(0,0,W,H);
  var th=c.createRadialGradient(OUT,H,0,OUT,H,300+r()*160);th.addColorStop(0,'rgba(110,80,45,'+(.18+r()*.2)+')');th.addColorStop(1,'rgba(110,80,45,0)');c.fillStyle=th;c.fillRect(0,0,W,H);
  // foxing
  var nf=4+Math.floor(r()*r()*45);for(i=0;i<nf;i++){var fxp=r()*W,fyp=r()*H,fr=1.5+r()*r()*12,fg=c.createRadialGradient(fxp,fyp,0,fxp,fyp,fr);fg.addColorStop(0,'rgba(140,85,40,'+(.25+r()*.3)+')');fg.addColorStop(1,'rgba(140,85,40,0)');c.fillStyle=fg;c.fillRect(fxp-fr,fyp-fr,2*fr,2*fr);}
  // su izi (kenardan giren, koyu sınırlı leke)
  if(r()<.35){var wx=r()<.5?0:W,wy=r()<.5?0:H,wr=180+r()*260;c.save();c.beginPath();for(var a=0;a<=64;a++){var t=a/64*Math.PI*2,rr=wr*(.82+.18*Math.sin(t*5+r()*.4)+r()*.05);a?c.lineTo(wx+Math.cos(t)*rr,wy+Math.sin(t)*rr):c.moveTo(wx+Math.cos(t)*rr,wy+Math.sin(t)*rr);}c.closePath();
    c.fillStyle='rgba(175,135,80,.10)';c.fill();c.strokeStyle='rgba(140,95,45,.28)';c.lineWidth=3+r()*3;c.stroke();c.strokeStyle='rgba(140,95,45,.12)';c.lineWidth=12;c.stroke();c.restore();}
  // metin alanı ve altın cetvel
  var L=150,T=190,R=W-150,Bm=H-230,TZ=window.Tezhip;c.fillStyle=TZ?TZ.pattern(c,'gold'):_gold(c,L,T,R,Bm);
  [[L-9,T-9,R-L+18,7],[L-9,Bm+2,R-L+18,7],[L-9,T-9,7,Bm-T+18],[R+2,T-9,7,Bm-T+18]].forEach(function(q){c.fillRect(q[0],q[1],q[2],q[3]);});
  c.strokeStyle='#1C1410';c.lineWidth=1.2;c.strokeRect(L-9,T-9,R-L+18,Bm-T+18);c.strokeRect(L-2,T-2,R-L+4,Bm-T+4);c.strokeStyle='#2B4B9B';c.lineWidth=2;c.strokeRect(L-20,T-20,R-L+40,Bm-T+40);
  var top=T+40,SP=null;
  if(opts.serlevha&&TZ){SP=TZ.panel(R-L,{seed:opts.seed||5,sheen:.2});c.drawImage(SP.C,L-SP.ox,T-SP.oy);top=T+SP.k*180+52;}
  // satırlar: mürekkep tonu, rubrik ve durak gülleri sayfadan sayfaya değişir
  var lines=opts.serlevha?11:15,lh=(Bm-top-20)/(lines-1),ink=['28,20,16','22,18,16','40,26,18','30,22,20'][Math.floor(r()*4)],inkA=.78+r()*.17,pRed=.05+r()*.12,pRos=.02+r()*.09,pRedLine=.1+r()*.2;
  for(var ln=0;ln<lines;ln++){var base=top+ln*lh+(r()-.5)*3,px=R-12-r()*6,first=true;
    while(px>L+40){var len=Math.min(px-L-12,40+r()*110),red=first?r()<pRedLine:r()<pRed*.3;
      if(TZ){c.fillStyle=red?'#A2261A':'rgba('+ink+','+(inkA+(r()-.5)*.12)+')';var wp=TZ.script(px-len,px,base,28+r()*5,Math.floor(r()*99999)+1,true);c.fill(wp);px=wp.left-12-r()*14;}
      else{_word(c,px,base,len,r,red?'#A2261A':'#1C1410');px-=len+14+r()*8;}first=false;
      if(!opts.plainText&&r()<pRos&&px>L+60){_rosette(c,px-6,base-6,8+r()*3);px-=26;}}}
  // derkenar: dış kenarda verev not(lar)
  var nd=r()<.6?1+(r()<.3?1:0):0;for(var d=0;d<nd;d++){var dx=V?75+r()*20:W-75-r()*20,dy=T+120+r()*(Bm-T-360),ang=(V?.75:-.75)+(r()-.5)*.4,nl=3+Math.floor(r()*5);
    c.save();c.translate(dx,dy);c.rotate(ang);for(i=0;i<nl;i++){var ll=150-i*12-r()*30;c.fillStyle='rgba(58,42,30,'+(.7+r()*.2)+')';if(TZ)c.fill(TZ.script(-ll/2,ll/2,i*24,15,Math.floor(r()*99999)+1,true));else _word(c,ll/2,i*24,ll,r,'#3A2A1E');}c.restore();}
  // reklam: arka yüzde, son satırın altında bir sonraki sayfanın ilk kelimesi
  if(V){c.save();c.translate(L+70,Bm+62);c.rotate(-.22);c.fillStyle='rgba('+ink+',.9)';if(TZ)c.fill(TZ.script(-40,40,0,24,Math.floor(r()*99999)+1,true));c.restore();}
  // kurt delikleri: kenarlı küçük boşluklar
  if(r()<.25){var hx=200+r()*(W-400),hy=200+r()*(H-400),nh=1+Math.floor(r()*4);for(i=0;i<nh;i++){var hr=3+r()*5,hxx=hx+(r()-.5)*60,hyy=hy+(r()-.5)*60;c.fillStyle='rgba(95,65,35,.75)';c.beginPath();c.ellipse(hxx,hyy,hr+1.6,hr*.85+1.6,r()*3,0,7);c.fill();c.fillStyle='#CDBB94';c.beginPath();c.ellipse(hxx,hyy,hr,hr*.85,r()*3,0,7);c.fill();}}
  var t=_tx(C);
  if(SP)t.userData=_pageMapsMake(SP,_rng(31));else t.userData=_pageMaps||(_pageMaps=_pageMapsMake(null,_rng(31)));
  if(V){t.repeat.set(-1,1);t.offset.set(1,0);}
  _pageCache[key]=t;return t;}
// Sayfa malzemesi: kâğıt pürüzü, altın cetvel ve tezhip ışıkta parlar
function pageMat(t,o){o=o||{};var u=t.userData||{};return new THREE.MeshStandardMaterial({map:t,bumpMap:u.bump||null,bumpScale:.035,metalnessMap:u.metal||null,metalness:u.metal?.45:0,roughnessMap:u.rough||null,roughness:u.rough?1:.95,
  emissiveMap:u.metal||null,emissive:u.metal?new THREE.Color(.26,.19,.08):new THREE.Color(0,0,0),side:o.side||THREE.FrontSide});}
/* Sayfa kenarları: tek tek kâğıt katmanları, hafif toz */
function edges(){var W=512,H=512,C=_cv(W,H),c=C.getContext('2d'),r=_rng(17);c.fillStyle='#E6D7B2';c.fillRect(0,0,W,H);
  for(var y=0;y<H;y+=1.6){c.fillStyle='rgba('+(110+r()*40|0)+','+(85+r()*30|0)+','+(50+r()*20|0)+','+(.08+r()*.22)+')';c.fillRect(0,y,W,.8);}
  for(var i=0;i<40;i++){var y2=r()*H;c.fillStyle='rgba(255,248,230,.35)';c.fillRect(0,y2,W,1.2);}
  var g=c.createLinearGradient(0,0,W,0);g.addColorStop(0,'rgba(120,90,50,.25)');g.addColorStop(.15,'rgba(120,90,50,0)');g.addColorStop(.85,'rgba(120,90,50,0)');g.addColorStop(1,'rgba(120,90,50,.25)');c.fillStyle=g;c.fillRect(0,0,W,H);
  return _tx(C);}
/* Şiraze: ipek ipliklerle örülmüş balıksırtı */
function siraze(){var W=128,H=512,C=_cv(W,H),c=C.getContext('2d'),cols=['#9B2D20','#2F6B5A','#C99A3E','#EFE3C6'];c.fillStyle='#3A2A1E';c.fillRect(0,0,W,H);
  for(var y=0,k=0;y<H;y+=24,k++){for(var s=0;s<2;s++){var col=cols[(k+s)%4];c.fillStyle=col;var x0=s*W/2;c.beginPath();c.moveTo(x0+2,y+2);c.lineTo(x0+W/2-2,y+12);c.lineTo(x0+2,y+22);c.closePath();c.fill();
      c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=.7;for(var t=4;t<20;t+=2.5){c.beginPath();c.moveTo(x0+3,y+t);c.lineTo(x0+W/2-4,y+12);c.stroke();}
      c.strokeStyle='rgba(255,255,255,.25)';c.beginPath();c.moveTo(x0+4,y+5);c.lineTo(x0+W/2-6,y+12);c.stroke();}}
  return _tx(C);}

// Tedavi canlandırmaları için dokular (treat.js)
window.__TX={leather:function(o){return leather(o).image;}};

// Sahneler görünüme yaklaşınca kurulur: açılış hızlanır, bellek yalnızca gerekince harcanır
function whenNear(id,fn){var el=document.getElementById(id);if(!el)return;if(!('IntersectionObserver' in window)){fn();return;}var done=false,io=new IntersectionObserver(function(es){if(done)return;for(var i=0;i<es.length;i++)if(es[i].isIntersecting){done=true;io.disconnect();fn();return;}},{rootMargin:'700px 0px'});io.observe(el);}

/* ---------- Ferman, murakka, muhafaza kutusu: gerçekçi dokular ---------- */
function _pat(x,k){return window.Tezhip?Tezhip.pattern(x,k):'#EEE0BD';}
function _spots(x,X,Y,w,h,n,r,a){for(var i=0;i<n;i++){var fx=X+r()*w,fy=Y+r()*h,fr=1.5+r()*r()*10,fg=x.createRadialGradient(fx,fy,0,fx,fy,fr);fg.addColorStop(0,'rgba(140,85,40,'+(a||.42)+')');fg.addColorStop(1,'rgba(140,85,40,0)');x.fillStyle=fg;x.fillRect(fx-fr,fy-fr,2*fr,2*fr);}}
function _fib(x,X,Y,w,h,n,col,len,lw,r){x.lineCap='round';for(var i=0;i<n;i++){var a=r()*Math.PI,fx=X+r()*w,fy=Y+r()*h,L=len*(.4+r());x.strokeStyle=col.replace('A',(.15+r()*.45).toFixed(2));x.lineWidth=lw*(.5+r());x.beginPath();x.moveTo(fx,fy);x.quadraticCurveTo(fx+Math.cos(a+.7)*L/2,fy+Math.sin(a+.7)*L/2,fx+Math.cos(a)*L,fy+Math.sin(a)*L);x.stroke();}}
// yassı kalemle kalın çizgi (tuğra kolları): altın kenarlı lâciverd
function _tstroke(x,pts,w,w1){var P=window.Tezhip&&pts.length===4?Tezhip.bz(pts,40):pts,n=P.length;w1=w1==null?w:w1;x.lineCap='round';x.lineJoin='round';
  [['rgba(26,18,10,.9)',5],[_pat(x,'gold'),3.2],[_pat(x,'lapis'),0]].forEach(function(L){x.strokeStyle=L[0];for(var i=0;i<n-1;i++){var t=i/(n-1),lw=w+(w1-w)*t;x.lineWidth=lw+L[1]*(.5+.5*lw/w);x.beginPath();x.moveTo(P[i][0],P[i][1]);x.lineTo(P[i+1][0],P[i+1][1]);x.stroke();}});}

/* Ferman: uzun, eklemeli kâğıt; başta tuğra ve davet, divanî satırlar uca doğru yükselir, altın serpme, rulo kırışıkları */
var _fermanT=null;
function fermanTex(){if(_fermanT)return _fermanT;var DL=3072,DW=936,C=_cv(DL,DW),x=C.getContext('2d'),B=_cv(DL/2,DW/2),b=B.getContext('2d'),r=_rng(301),i,TZ=window.Tezhip;
  b.fillStyle='rgb(128,128,128)';b.fillRect(0,0,DL/2,DW/2);
  x.setTransform(0,-1,1,0,0,DW); // belge koordinatı: u enine (0..DW), v boyuna (0..DL)
  x.fillStyle=_pat(x,'paper');x.fillRect(0,0,DW,DL);x.fillStyle='rgba(236,222,186,.35)';x.fillRect(0,0,DW,DL);
  _blot(x,DW,DL,50,['rgba(205,175,120,A)','rgba(250,240,215,A)'],80,320,.2,r);
  // kenarlar ve dış uç (rulo dışında kalan kısım) daha koyu
  var eg=x.createLinearGradient(0,0,DW,0);eg.addColorStop(0,'rgba(150,100,45,.35)');eg.addColorStop(.08,'rgba(150,100,45,0)');eg.addColorStop(.92,'rgba(150,100,45,0)');eg.addColorStop(1,'rgba(150,100,45,.35)');x.fillStyle=eg;x.fillRect(0,0,DW,DL);
  var sg=x.createLinearGradient(0,0,0,500);sg.addColorStop(0,'rgba(140,95,45,.3)');sg.addColorStop(1,'rgba(140,95,45,0)');x.fillStyle=sg;x.fillRect(0,0,DW,500);
  // vasl: kâğıt ekleri
  [1010,2060].forEach(function(v){x.fillStyle='rgba(160,120,70,.16)';x.fillRect(0,v,DW,14);x.fillStyle='rgba(110,80,40,.35)';x.fillRect(0,v+14,DW,1.5);b.fillStyle='rgb(150,150,150)';b.fillRect(v/2,0,7,DW/2);});
  // rulo kırışıkları: enine, düzensiz aralıklarla
  for(var v=60;v<DL;v+=60+r()*120){var amp=2+r()*4,ph=r()*6;x.beginPath();b.beginPath();for(var u=0;u<=DW;u+=24){var vv=v+Math.sin(u/90+ph)*amp;u?x.lineTo(u,vv):x.moveTo(u,vv);u?b.lineTo(vv/2,(DW-u)/2):b.moveTo(vv/2,(DW-u)/2);}
    x.strokeStyle='rgba(120,90,50,'+(.08+r()*.1)+')';x.lineWidth=1.4;x.stroke();x.save();x.translate(0,2);x.strokeStyle='rgba(255,250,235,.25)';x.stroke();x.restore();b.strokeStyle='rgba(90,90,90,.7)';b.lineWidth=1.2;b.stroke();}
  _spots(x,0,0,DW,DL,40,r,.38);
  if(TZ){
    // metin: divanî satırlar sola doğru yükselir; ilk satır altınla
    var y0=730,lh=64,L=110,R=DW-90;for(var ln=0;y0+ln*lh<DL-260;ln++){var base=y0+ln*lh,px=R-r()*10;
      while(px>L+30){var w=Math.min(px-L,40+r()*90),rise=Math.pow(Math.max(0,(L+240-px)/240),2)*34,p=TZ.script(px-w,px,base-rise,28,Math.floor(r()*99999)+1,true);
        x.fillStyle=r()<.12?'rgba(160,40,30,.9)':'rgba(26,20,16,'+(.84+r()*.12)+')';x.fill(p);px=p.left-10-r()*12;}
      // satır aralarında altın benekler (özgün fermandaki gibi)
      if(ln%2===0)for(var gd=0;gd<4;gd++){x.fillStyle=_pat(x,'gold');x.beginPath();x.arc(L+40+r()*(R-L-80),base+30+r()*8,4+r()*2.5,0,7);x.fill();}}
    // tarih ve yer (sonda, sola kaymış iki kısa satır)
    for(i=0;i<2;i++){x.fillStyle='rgba(26,20,16,.88)';x.fill(TZ.script(L+20,L+260-i*60,DL-170+i*52,24,401+i,true));}
    // altın serpme (zerefşan)
  }
  // kenar çentikleri ve küçük kayıplar
  for(i=0;i<26;i++){var ev=r()*DL,eu=r()<.5?0:DW,es=3+r()*9;x.fillStyle='rgba(196,170,120,.9)';x.beginPath();x.ellipse(eu,ev,es,es*1.6,0,0,7);x.fill();}
  x.setTransform(1,0,0,1,0,0);
  C.__keep=true;var t=_tx(C);t.userData={bump:_tx(B,false)};
  // Gerçek padişah tuğrası (özgün bir fermanın fotoğrafından ayıklanmış): kâğıdın üstüne çarpma kipinde basılır, kâğıt dokusu altından görünür
  var im=new Image();im.onload=function(){var tc=_cv(4,4).getContext('2d');tc.drawImage(im,0,0,4,4);try{tc.getImageData(0,0,1,1);}catch(e){return;} // dosyadan açılınca (file://) güvenlik nedeniyle atlanır
    x.save();x.setTransform(0,-1,1,0,0,DW);x.globalCompositeOperation='multiply';x.drawImage(im,0,72,739,589);x.restore();t.needsUpdate=true;};
  im.src=(window.__U&&window.__U['tugra.jpg'])||'tugra.jpg';
  return _fermanT=t;}
// rulonun dışı: kâğıdın arka yüzü
function rollTex(){var C=_cv(1024,512),x=C.getContext('2d'),r=_rng(303);x.fillStyle=_pat(x,'paper');x.fillRect(0,0,1024,512);x.fillStyle='rgba(205,180,130,.28)';x.fillRect(0,0,1024,512);_blot(x,1024,512,30,['rgba(170,130,80,A)','rgba(240,228,200,A)'],40,180,.22,r);
  for(var i=0;i<60;i++){var u=r()*1024;x.strokeStyle='rgba(120,90,50,'+(.06+r()*.1)+')';x.lineWidth=1+r();x.beginPath();x.moveTo(u,0);x.lineTo(u+(r()-.5)*20,512);x.stroke();}_spots(x,0,0,1024,512,20,r);return _tx(C);}
// rulonun ucu: iç içe kâğıt katları
function capTex(){var S=512,C=_cv(S,S),x=C.getContext('2d'),r=_rng(304);x.fillStyle='#5A4A36';x.fillRect(0,0,S,S);
  for(var R=S/2;R>18;R-=2.2+r()*1.2){x.beginPath();x.arc(S/2+(r()-.5)*2,S/2+(r()-.5)*2,R,0,7);x.fillStyle='rgb('+Math.round(214+r()*22)+','+Math.round(196+r()*20)+','+Math.round(150+r()*24)+')';x.fill();x.strokeStyle='rgba(90,66,40,'+(.35+r()*.35)+')';x.lineWidth=.9;x.stroke();}
  var g=x.createRadialGradient(S/2,S/2,0,S/2,S/2,S/2);g.addColorStop(0,'rgba(60,40,20,.35)');g.addColorStop(.2,'rgba(60,40,20,0)');g.addColorStop(.85,'rgba(60,40,20,0)');g.addColorStop(1,'rgba(90,60,30,.4)');x.fillStyle=g;x.fillRect(0,0,S,S);
  x.fillStyle='#3A2C1E';x.beginPath();x.arc(S/2,S/2,16,0,7);x.fill();return _tx(C);}
// kumaş: keten dokuma (ağırlık kılıfı, kutu bezi)
function weaveTex(col,seed){var S=256,C=_cv(S,S),x=C.getContext('2d'),B=_cv(S,S),b=B.getContext('2d'),r=_rng(seed||305);x.fillStyle=col||'#D6CEBB';x.fillRect(0,0,S,S);b.fillStyle='#808080';b.fillRect(0,0,S,S);
  for(var i=0;i<S;i+=4){var a=.08+r()*.1;x.fillStyle='rgba(90,80,60,'+a+')';x.fillRect(0,i,S,1.6);x.fillStyle='rgba(255,250,235,'+a+')';x.fillRect(i,0,1.6,S);b.fillStyle='rgba(40,40,40,.5)';b.fillRect(0,i+2,S,1);b.fillStyle='rgba(220,220,220,.5)';b.fillRect(i,0,1,S);}
  for(i=0;i<400;i++){x.fillStyle='rgba(80,70,55,'+(r()*.15)+')';x.fillRect(r()*S,r()*S,2+r()*6,1);}
  var t=_tx(C);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,3);var tb=_tx(B,false);tb.wrapS=tb.wrapT=THREE.RepeatWrapping;tb.repeat.set(3,3);t.userData={bump:tb};return t;}

/* Murakka kıtası: ebru pervaz, renkli iç pervaz, altın cetvel, sülüs satır + verev satırlar, koltuklarda tezhip, ketebe */
var _IC=['#BFD0D6','#E3BCA2','#C9D6B2','#D3C6DC','#E8D5A8','#C7C9D9'];
function kitaTex(seed){var w=720,h=1040,C=_cv(w,h),x=C.getContext('2d'),r=_rng(500+seed*37),TZ=window.Tezhip,i;
  var eb=_ebruCanvas(),sx=r()*60,sy=r()*80;x.drawImage(eb,sx,sy,eb.width-sx-20,eb.height-sy-30,0,0,w,h);x.fillStyle='rgba(240,230,205,.12)';x.fillRect(0,0,w,h);
  var ic=_IC[seed%_IC.length];x.fillStyle=ic;x.fillRect(64,64,w-128,h-128);x.fillStyle=_pat(x,'paper');x.globalAlpha=.35;x.fillRect(64,64,w-128,h-128);x.globalAlpha=1;
  if(TZ){x.fillStyle=_pat(x,'gold');for(i=0;i<260;i++){var gx=70+r()*(w-140),gy=70+r()*(h-140);if(gx>104&&gx<w-104&&gy>104&&gy<h-104)continue;x.beginPath();x.arc(gx,gy,.8+r()*1.8,0,7);x.fill();}}
  // cetveller
  x.strokeStyle=_pat(x,'gold');x.lineWidth=6;x.strokeRect(100,100,w-200,h-200);x.strokeStyle='rgba(26,18,10,.85)';x.lineWidth=1;x.strokeRect(96.5,96.5,w-193,h-193);x.strokeRect(103.5,103.5,w-207,h-207);
  x.strokeStyle='rgba(35,69,143,.9)';x.lineWidth=2;x.strokeRect(90,90,w-180,h-180);x.strokeStyle='rgba(155,45,32,.8)';x.lineWidth=1.5;x.strokeRect(110,110,w-220,h-220);
  // kıta kâğıdı
  var KX=114,KY=114,KW=w-228,KH=h-228;x.fillStyle=_pat(x,'paper');x.fillRect(KX,KY,KW,KH);x.fillStyle='rgba(245,236,212,.35)';x.fillRect(KX,KY,KW,KH);
  var g=x.createRadialGradient(w/2,h/2,120,w/2,h/2,520);g.addColorStop(0,'rgba(160,110,50,0)');g.addColorStop(1,'rgba(150,100,45,.25)');x.fillStyle=g;x.fillRect(KX,KY,KW,KH);
  if(TZ){
    // üstte tek sülüs satır (iki ince altın çizgi arasında)
    x.fillStyle='rgba(22,16,12,.95)';x.fill(TZ.script(KX+30,KX+KW-30,KY+150,92,700+seed*11,false,true));
    x.strokeStyle=_pat(x,'gold');x.lineWidth=2;x.beginPath();x.moveTo(KX+12,KY+214);x.lineTo(KX+KW-12,KY+214);x.stroke();
    // verev satırlar
    var oy=KY+250,oh=KH-370;x.save();x.beginPath();x.rect(KX+8,oy,KW-16,oh);x.clip();
    // koltuklar: verev satırların bıraktığı üçgenlerde tezhip
    var M=TZ.motif;[[KX+8,oy,1,1],[KX+KW-8,oy+oh,-1,-1]].forEach(function(k){var tri=new Path2D();tri.moveTo(k[0],k[1]);tri.lineTo(k[0]+k[2]*KW*.42,k[1]);tri.lineTo(k[0],k[1]+k[3]*oh*.48);tri.closePath();x.fillStyle=_pat(x,'gold');x.fill(tri);
      x.save();x.clip(tri);x.strokeStyle='rgba(26,18,10,.75)';x.lineWidth=.7;for(var q=0;q<12;q++){var cx=k[0]+k[2]*r()*KW*.4,cy=k[1]+k[3]*r()*oh*.4,R=9+r()*5,a0=r()*6;x.beginPath();for(var j=0;j<=26;j++){var th=a0+j/26*Math.PI*2,rr=R*(1-j/32);x.lineTo(cx+Math.cos(th)*rr,cy+Math.sin(th)*rr);}x.stroke();var pp=M.penc(cx,cy,3.8,5,r()*6,.5);x.fillStyle=_pat(x,['red','lapis','white'][q%3]);x.fill(pp);x.stroke(pp);}x.restore();
      x.strokeStyle='rgba(26,18,10,.85)';x.lineWidth=1;x.stroke(tri);});
    x.translate(w/2,oy+oh/2);x.rotate(-.42);for(var l=0;l<5;l++){var yy=-124+l*62,half=250-Math.abs(l-2)*18,px=half;while(px>-half+20){var ww=Math.min(px+half,50+r()*80),pw=TZ.script(px-ww,px,yy,30,Math.floor(r()*99999)+1,true);x.fillStyle='rgba(24,18,14,.92)';x.fill(pw);px=pw.left-10-r()*8;}}x.restore();
    // ketebe: hattatın imzası, küçük çerçevede
    x.fillStyle='rgba(155,45,32,.08)';x.fillRect(KX+30,KY+KH-92,170,52);x.strokeStyle=_pat(x,'gold');x.lineWidth=1.5;x.strokeRect(KX+30,KY+KH-92,170,52);x.fillStyle='rgba(24,18,14,.9)';x.fill(TZ.script(KX+40,KX+190,KY+KH-58,20,900+seed,true,true));}
  _spots(x,0,0,w,h,10+Math.floor(r()*20),r,.35);
  // köşelerde aşınma
  [[0,0],[w,0],[0,h],[w,h]].forEach(function(k){var cg=x.createRadialGradient(k[0],k[1],0,k[0],k[1],90);cg.addColorStop(0,'rgba(120,85,50,.35)');cg.addColorStop(1,'rgba(120,85,50,0)');x.fillStyle=cg;x.fillRect(k[0]-90,k[1]-90,180,180);});
  return _tx(C);}
// Murakka kapağı: lake (Edirnekâri) — koyu zemin, altın zencerek kenar, ortada vazodan çıkan çiçekler, ince çatlaklar
var _lacT=null;
function lacquerTex(){if(_lacT)return _lacT;var w=720,h=1040,C=_cv(w,h),x=C.getContext('2d'),M=_cv(w/2,h/2),m=M.getContext('2d'),r=_rng(601),TZ=window.Tezhip,i;
  var g=x.createRadialGradient(w/2,h*.45,80,w/2,h/2,700);g.addColorStop(0,'#5E1E14');g.addColorStop(1,'#2A0D08');x.fillStyle=g;x.fillRect(0,0,w,h);_blot(x,w,h,40,['rgba(90,30,20,A)','rgba(20,6,4,A)'],40,200,.25,r);
  m.fillStyle='#000';m.fillRect(0,0,w/2,h/2);m.scale(.5,.5);m.fillStyle=m.strokeStyle='#fff';
  function both(fn){fn(x,true);fn(m,false);}
  both(function(c,col){c.strokeStyle=col?_pat(c,'gold'):'#fff';c.lineWidth=5;c.strokeRect(36,36,w-72,h-72);c.lineWidth=2;c.strokeRect(70,70,w-140,h-140);});
  // zencerek: kenar bandında küçük altın halkalar
  both(function(c,col){c.fillStyle=col?_pat(c,'gold'):'#fff';for(var t=48;t<w-48;t+=13){c.beginPath();c.ellipse(t,53,5,2.4,(t/13%2?.7:-.7),0,7);c.fill();c.beginPath();c.ellipse(t,h-53,5,2.4,(t/13%2?.7:-.7),0,7);c.fill();}for(t=66;t<h-66;t+=13){c.beginPath();c.ellipse(53,t,2.4,5,(t/13%2?.7:-.7),0,7);c.fill();c.beginPath();c.ellipse(w-53,t,2.4,5,(t/13%2?.7:-.7),0,7);c.fill();}});
  if(TZ){var Mo=TZ.motif;
    // vazo ve saplar
    var vase=new Path2D();vase.moveTo(w/2-40,h*.78);vase.bezierCurveTo(w/2-90,h*.72,w/2-60,h*.64,w/2-22,h*.62);vase.lineTo(w/2+22,h*.62);vase.bezierCurveTo(w/2+60,h*.64,w/2+90,h*.72,w/2+40,h*.78);vase.closePath();
    x.fillStyle=_pat(x,'gold');x.fill(vase);m.fill(vase);x.strokeStyle='rgba(20,8,4,.8)';x.lineWidth=1.2;x.stroke(vase);
    var st=[];for(i=0;i<9;i++){var a=-Math.PI/2+(i-4)*.2,L=180+r()*160,ex=w/2+Math.cos(a)*L*1.1,ey=h*.62+Math.sin(a)*L;st.push([ex,ey]);x.strokeStyle='#C9A15A';x.lineWidth=2.2;x.beginPath();x.moveTo(w/2+(i-4)*4,h*.62);x.quadraticCurveTo(w/2+(i-4)*20+(r()-.5)*60,h*.5,ex,ey);x.stroke();m.lineWidth=2.2;m.beginPath();m.moveTo(w/2+(i-4)*4,h*.62);m.quadraticCurveTo(w/2+(i-4)*20,h*.5,ex,ey);m.stroke();
      for(var lf=0;lf<3;lf++){var tt=.3+lf*.22,lx=w/2+(ex-w/2)*tt,ly=h*.62+(ey-h*.62)*tt,P=Mo.leaf(lx,ly,22,a+(lf%2?.9:-.9),.3);x.fillStyle='#4E7C4E';x.fill(P);x.strokeStyle='rgba(201,161,90,.8)';x.lineWidth=.8;x.stroke(P);}}
    st.forEach(function(s,k){var P=Mo.penc(s[0],s[1],18+r()*8,k%2?6:5,r()*6,.5),Q=Mo.penc(s[0],s[1],9,6,r()*6,.5);x.fillStyle=['#B83A2A','#E3D2B0','#C46A7A','#D9A440'][k%4];x.fill(P);x.strokeStyle='rgba(201,161,90,.9)';x.lineWidth=1;x.stroke(P);x.fillStyle=_pat(x,'gold');x.fill(Q);m.fill(Q);});}
  // vernik çatlakları ve aşınma
  x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=.7;for(i=0;i<220;i++){var cx=r()*w,cy=r()*h;x.beginPath();x.moveTo(cx,cy);for(var j=0;j<4;j++){cx+=(r()-.5)*30;cy+=(r()-.5)*30;x.lineTo(cx,cy);}x.stroke();}
  x.strokeStyle='rgba(255,220,180,.06)';x.lineWidth=1;for(i=0;i<120;i++){var sx2=r()*w,sy2=r()*h;x.beginPath();x.moveTo(sx2,sy2);x.lineTo(sx2+40*r(),sy2+10*r());x.stroke();}
  [[0,0],[w,0],[0,h],[w,h]].forEach(function(k){var cg=x.createRadialGradient(k[0],k[1],0,k[0],k[1],110);cg.addColorStop(0,'rgba(140,90,60,.45)');cg.addColorStop(1,'rgba(140,90,60,0)');x.fillStyle=cg;x.fillRect(k[0]-110,k[1]-110,220,220);});
  var t=_tx(C);t.userData={metal:_tx(M,false)};return _lacT=t;}

/* Muhafaza: arşiv mukavvası (gri, lifli), asitsiz astar, katlanır karton; basılı ve elle yazılmış etiket */
var _brd={};
function boardTex(kind){if(_brd[kind])return _brd[kind];var S=512,C=_cv(S,S),x=C.getContext('2d'),B=_cv(S,S),b=B.getContext('2d'),r=_rng(kind==='grey'?701:kind==='lining'?702:703),i;
  var col={grey:'#8C938E',lining:'#DCDDD5',card:'#D9D8CE'}[kind];x.fillStyle=col;x.fillRect(0,0,S,S);b.fillStyle='#808080';b.fillRect(0,0,S,S);
  _blot(x,S,S,30,kind==='grey'?['rgba(110,118,112,A)','rgba(160,166,160,A)']:['rgba(200,200,190,A)','rgba(240,240,232,A)'],20,90,.35,r);
  for(i=0;i<9000;i++){var v=r();x.fillStyle=v<.5?'rgba(40,46,42,'+(.05+r()*.12)+')':'rgba(255,255,250,'+(.05+r()*.12)+')';x.fillRect(r()*S,r()*S,1+r()*1.5,1+r()*1.5);}
  x.globalAlpha=.35;_fib(x,0,0,S,S,kind==='grey'?700:300,kind==='grey'?'rgba(70,76,72,A)':'rgba(170,165,150,A)',9,.6,r);x.globalAlpha=1;_fib(b,0,0,S,S,400,'rgba(60,60,60,A)',18,.8,r);
  for(i=0;i<3000;i++){b.fillStyle=r()<.5?'rgba(60,60,60,.3)':'rgba(200,200,200,.3)';b.fillRect(r()*S,r()*S,1.5,1.5);}
  var t=_tx(C);t.wrapS=t.wrapT=THREE.RepeatWrapping;var tb=_tx(B,false);tb.wrapS=tb.wrapT=THREE.RepeatWrapping;t.userData={bump:tb};return _brd[kind]=t;}
function boardMat(kind,o){var t=boardTex(kind);return new THREE.MeshStandardMaterial({map:t,bumpMap:t.userData.bump,bumpScale:(o&&o.bump)||.06,roughness:kind==='lining'?.8:.92});}
function label2(lines){var w=1024,h=512,C=_cv(w,h),x=C.getContext('2d'),r=_rng(801);x.fillStyle='#F3EFE4';x.fillRect(0,0,w,h);_fib(x,0,0,w,h,600,'rgba(200,190,165,A)',20,.6,r);
  x.strokeStyle='#1B1F1C';x.lineWidth=4;x.strokeRect(22,22,w-44,h-44);x.lineWidth=1.5;x.strokeRect(34,34,w-68,h-68);
  x.fillStyle='#1B1F1C';x.textAlign='left';x.font='600 64px "IBM Plex Sans", Arial';x.fillText(lines[0],70,130);x.font='400 40px "IBM Plex Sans", Arial';x.fillStyle='#3A3F44';x.fillText(lines[1]||'',70,192);
  // elle yazılmış envanter numarası ve tarih (kurşun kalem)
  x.font='italic 500 46px "IBM Plex Serif", Georgia, serif';x.fillStyle='rgba(60,62,66,.85)';x.fillText('Env. 2147 / R-101',70,300);x.font='italic 400 36px "IBM Plex Serif", Georgia, serif';x.fillText('Kons. tamam · 03.2026',70,360);
  // barkod
  var bx=640;for(var i=0;i<70;i++){var bw=1+Math.floor(r()*4);if(r()<.55){x.fillStyle='#1B1F1C';x.fillRect(bx,250,bw,150);}bx+=bw+1;if(bx>w-80)break;}x.font='400 24px "IBM Plex Mono", monospace';x.fillStyle='#1B1F1C';x.fillText('RYE 0002147',660,432);
  return _tx(C);}
window.__TX.ferman=function(){return fermanTex().image;};window.__TX.kita=function(s){return kitaTex(s).image;};window.__TX.lacquer=function(){return lacquerTex().image;};

/* ---------- Fizik yardımcıları ---------- */
// Menteşe: yerçekimi torku, motor (PD), sürtünme ve uç noktalarda sekme
function Hinge(o){this.a=o.a||0;this.w=0;this.lo=o.lo;this.hi=o.hi;this.G=o.G||9;this.f=o.f==null?.6:o.f;this.e=o.e==null?.3:o.e;this.tq=o.tq||function(a){return -Math.cos(a);};this.motor=null;this.K=o.K||70;this.C=o.C||14;this.onHit=o.onHit||null;}
Hinge.prototype.step=function(dt){var n=6,h=dt/n;for(var i=0;i<n;i++){var acc=this.G*this.tq(this.a)-this.f*this.w;if(this.motor!==null)acc+=this.K*(this.motor-this.a)-this.C*this.w;this.w+=acc*h;this.a+=this.w*h;
  if(this.a<this.lo){this.a=this.lo;if(this.w<0){var v=-this.w;this.w=v>.5?v*this.e:0;if(this.onHit&&v>.5)this.onHit(v,'lo');}}
  if(this.a>this.hi){this.a=this.hi;if(this.w>0){var u=this.w;this.w=u>.5?-u*this.e:0;if(this.onHit&&u>.5)this.onHit(u,'hi');}}
  if(this.rel&&(this.rel.dir>0?this.a>this.rel.at:this.a<this.rel.at)){this.motor=null;this.rel=null;}}};
Hinge.prototype.kick=function(w){this.motor=null;this.rel=null;this.w=w;};
// Elle tepe noktasının biraz ötesine kaldır, sonra bırak: gerisini yerçekimi yapar
Hinge.prototype.push=function(to,at,dir){this.motor=to;this.rel={at:at,dir:dir};};
// Yay: hafif aşmalı, doğal oturma
function Spring(x,k,z){this.x=x;this.v=0;this.t=x;this.k=k||60;this.c=2*Math.sqrt(this.k)*(z==null?.7:z);}
Spring.prototype.step=function(dt){var n=4,h=dt/n;for(var i=0;i<n;i++){var a=this.k*(this.t-this.x)-this.c*this.v;this.v+=a*h;this.x+=this.v*h;}};
// Koşullu zamanlayıcı
function Seq(){this.q=[];this.t=0;}
Seq.prototype.then=function(cond,fn){this.q.push({c:cond,f:fn,t0:null});return this;};
Seq.prototype.wait=function(s){var self=this;return this.then(function(it){if(it.t0===null)it.t0=self.t;return self.t-it.t0>=s;},function(){});};
Seq.prototype.clear=function(){this.q=[];};
Seq.prototype.step=function(dt){this.t+=dt;var guard=0;while(this.q.length&&guard++<8){var it=this.q[0];if(it.c===true||it.c(it)){this.q.shift();it.f();}else break;}};

/* ---------- Görüntüleyici (ataletli döndürme, tıklama ile seçme) ---------- */
function Viewer(id,opts){
  var host=document.getElementById(id);if(!host)return;var self=this;opts=opts||{};
  var r;try{r=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch(e){fallback(id,'Bu tarayıcıda 3D (WebGL) desteklenmiyor.');return;}
  r.setPixelRatio(Math.min(_LOW?1.5:2,window.devicePixelRatio||1));if(THREE.sRGBEncoding)r.outputEncoding=THREE.sRGBEncoding;r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;
  host.insertBefore(r.domElement,host.firstChild);
  var scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(opts.fov||35,1,.1,500);
  scene.add(new THREE.HemisphereLight(0xfff8ec,0x2a3a34,.75));
  var key=new THREE.DirectionalLight(0xffffff,.95);key.position.set(18,30,22);key.castShadow=true;key.shadow.mapSize.set(_LOW?1024:2048,_LOW?1024:2048);key.shadow.normalBias=.03;var sc=key.shadow.camera;sc.left=-30;sc.right=30;sc.top=30;sc.bottom=-30;sc.far=120;key.shadow.bias=-.0002;scene.add(key);
  var fillL=new THREE.DirectionalLight(0xdfe8ff,.35);fillL.position.set(-20,12,-10);scene.add(fillL);
  if(opts.ground!==false){var g=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.28}));g.rotation.x=-Math.PI/2;g.position.y=opts.groundY||0;g.receiveShadow=true;scene.add(g);}
  var pivot=new THREE.Group();scene.add(pivot);
  this.host=host;this.scene=scene;this.cam=cam;this.pivot=pivot;this.r=r;this.updaters=[];this.overlay=[];this.picks=[];
  var yaw0=opts.yaw==null?-30*D2R:opts.yaw,pitch0=opts.pitch==null?22*D2R:opts.pitch;
  var yaw=yaw0,pitch=pitch0,dist=opts.dist||40,tyaw=yaw,tpitch=pitch,vy=0,vp=0,target=opts.target||new THREE.Vector3(0,2,0);
  var auto=opts.auto!==false&&!reduce,idle=0,drag=null,moved=0,el=r.domElement,ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),grab=null;
  function setRay(e){var rc=el.getBoundingClientRect();ndc.set((e.clientX-rc.left)/rc.width*2-1,-(e.clientY-rc.top)/rc.height*2+1);ray.setFromCamera(ndc,cam);return ray;}
  this.grabbers=[];
  // Dokunmatik: parmak modelin üstündeyse dokunuş tamamen modele aittir (döndürme, sayfa çevirme; sayfa kaymaz).
  // Boş alanda dikey sürükleme sayfayı kaydırır (ataletli), yatay sürükleme modeli döndürür. Karar tarayıcıya değil koda ait: ağır sahnede de tutarlı çalışır.
  var mom=0,momV=0;function momentum(){mom=0;if(Math.abs(momV)<.05)return;window.scrollBy(0,momV*16);momV*=.94;mom=requestAnimationFrame(momentum);}
  el.addEventListener('pointerdown',function(e){moved=0;vy=vp=0;idle=0;el.setPointerCapture(e.pointerId);active=true;
    if(e.pointerType==='touch'){tp[e.pointerId]=[e.clientX,e.clientY];var ks=Object.keys(tp);if(ks.length===2){if(grab){grab.up(false);grab=null;}drag=null;pinch={d:pd(),z:uzt};return;}}
    // önce sahnedeki tutulabilir parçalar (sayfa, kapak, miklep); yoksa görünümü döndür
    for(var i=0;i<self.grabbers.length&&!grab;i++)grab=self.grabbers[i](setRay(e));
    if(grab){drag=null;el.style.cursor='grabbing';e.preventDefault();return;}
    drag={x:e.clientX,y:e.clientY,t:performance.now(),x0:e.clientX,y0:e.clientY,free:false,mode:null};
    if(e.pointerType==='touch'){cancelAnimationFrame(mom);momV=0;setRay(e);drag.free=!ray.intersectObjects(self.pivot.children,true).length;}});
  el.addEventListener('pointermove',function(e){
    if(tp[e.pointerId])tp[e.pointerId]=[e.clientX,e.clientY];if(pinch){var nd=pd();if(nd>0)zoomTo(pinch.z*pinch.d/nd);return;}
    if(grab){moved+=Math.abs(e.movementX||0)+Math.abs(e.movementY||0);idle=0;grab.move(setRay(e));return;}
    if(!drag){if(self.hover&&e.pointerType==='mouse')el.style.cursor=self.hover(setRay(e))?'grab':'move';return;}
    if(drag.free){if(!drag.mode){var tx=e.clientX-drag.x0,ty=e.clientY-drag.y0;if(Math.abs(tx)+Math.abs(ty)<8)return;drag.mode=Math.abs(ty)>Math.abs(tx)*1.1?'scroll':'rot';}
      if(drag.mode==='scroll'){var sy=e.clientY-drag.y,nt=performance.now();window.scrollBy(0,-sy);momV=momV*.4+(-sy/Math.max(8,nt-drag.t))*.6;drag.y=e.clientY;drag.x=e.clientX;drag.t=nt;moved+=Math.abs(sy);return;}}
    var now=performance.now(),dtm=Math.max(8,now-drag.t)/1000,dx=e.clientX-drag.x,dy=e.clientY-drag.y;moved+=Math.abs(dx)+Math.abs(dy);
    var ay=-dx*.008,ap=dy*.006;tyaw+=ay;tpitch=Math.max(6*D2R,Math.min(72*D2R,tpitch+ap));vy=vy*.5+(ay/dtm)*.5;vp=vp*.5+(ap/dtm)*.5;drag={x:e.clientX,y:e.clientY,t:now};});
  function up(e){
    delete tp[e.pointerId];if(pinch){if(Object.keys(tp).length<2)pinch=null;moved=99;drag=null;return;}
    if(grab){var g=grab;grab=null;el.style.cursor='';g.up(moved<5);return;}
    if(!drag)return;if(drag.mode==='scroll'){drag=null;if(performance.now()-0>0)mom=requestAnimationFrame(momentum);return;}if(performance.now()-drag.t>90){vy=0;vp=0;}drag=null;
    if(moved<6&&self.picks.length){setRay(e);
      for(var i=0;i<self.picks.length;i++){var p=self.picks[i];if(ray.intersectObjects(p.objs,true).length){vy=vp=0;p.fn();break;}}}}
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',function(e){delete tp[e.pointerId];pinch=null;if(grab){grab.up(false);grab=null;}drag=null;});
  el.addEventListener('dblclick',function(){tyaw=yaw0;tpitch=pitch0;vy=vp=0;zoomTo(1);if(self.focus)self.focus();});

  // Yakınlaştırma (sınırlı): tekerlek (sahneye tıklandıktan sonra ya da Ctrl/⌘ ile), iki parmak, trackpad kıstırma, +/− düğmeleri
  var ZMIN=opts.zmin||.45,ZMAX=opts.zmax||1.1,uz=1,uzt=1,tp={},pinch=null,active=false,zc=null;
  function pd(){var k=Object.keys(tp);if(k.length<2)return 0;var a=tp[k[0]],b=tp[k[1]];return Math.hypot(a[0]-b[0],a[1]-b[1]);}
  function zoomTo(z){uzt=Math.max(ZMIN,Math.min(ZMAX,z));idle=0;if(zc){zc[0].disabled=uzt<=ZMIN+1e-3;zc[1].disabled=uzt>=ZMAX-1e-3;}}
  el.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse')active=false;});
  el.addEventListener('wheel',function(e){if(!(active||e.ctrlKey||e.metaKey))return;e.preventDefault();zoomTo(uzt*Math.exp(Math.max(-60,Math.min(60,e.deltaY))*(e.ctrlKey?.01:.0022)));},{passive:false});
  var gz=1;el.addEventListener('gesturestart',function(e){e.preventDefault();gz=uzt;});el.addEventListener('gesturechange',function(e){e.preventDefault();zoomTo(gz/e.scale);});
  if(opts.zoomUI!==false){var zd=document.createElement('div');zd.className='zoomctl';zd.innerHTML='<button type="button" aria-label="Yakınlaştır">+</button><button type="button" aria-label="Uzaklaştır">−</button>';host.appendChild(zd);
    zc=zd.querySelectorAll('button');zc[0].addEventListener('click',function(){zoomTo(uzt/1.35);});zc[1].addEventListener('click',function(){zoomTo(uzt*1.35);});}
  // Sığdırma: modelin sınır küresi (fitR) her ekran oranında kadraja tam girer; shift ile kadrajda sağa kaydırılır
  function size(){var w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;r.setSize(w,h,false);cam.aspect=w/h;
    if(opts.fitR){var sx=opts.shift?opts.shift(w,h):0,tv=Math.tan(cam.fov*D2R/2),th=tv*(w/h)*(1-2*Math.abs(sx)),t=Math.min(tv,th);
      dist=opts.fitR/Math.sin(Math.atan(t));cam.zoom=1;if(sx)cam.setViewOffset(w,h,-sx*w,0,w,h);else cam.clearViewOffset();}
    else{var f=opts.fit||1;cam.zoom=w<520?.78*f:f;}
    cam.updateProjectionMatrix();}
  if('ResizeObserver' in window)new ResizeObserver(size).observe(host);else addEventListener('resize',size);size();
  var vis=false,last=performance.now(),raf=0;
  function loop(now){raf=0;if(!vis)return;var dt=Math.min(.05,(now-last)/1000);last=now;idle+=dt;
    if(!drag){tyaw+=vy*dt;tpitch=Math.max(6*D2R,Math.min(72*D2R,tpitch+vp*dt));var dec=Math.exp(-3.2*dt);vy*=dec;vp*=dec;if(auto&&idle>3&&Math.abs(vy)<.05)tyaw+=dt*.22;}
    yaw=damp(yaw,tyaw,10,dt);pitch=damp(pitch,tpitch,10,dt);
    target.x=damp(target.x,tgt.x,4,dt);target.y=damp(target.y,tgt.y,4,dt);target.z=damp(target.z,tgt.z,4,dt);zf=damp(zf,zt,4,dt);uz=damp(uz,uzt,9,dt);var dd=dist*zf*uz;
    cam.position.set(target.x+dd*Math.cos(pitch)*Math.sin(yaw),target.y+dd*Math.sin(pitch),target.z+dd*Math.cos(pitch)*Math.cos(yaw));cam.lookAt(target);
    for(var i=0;i<self.updaters.length;i++)self.updaters[i](dt);r.render(scene,cam);self.project();raf=requestAnimationFrame(loop);}
  // Telefonda ekrandan uzaklaşan sahnenin grafik belleği bırakılır, geri gelince yeniden yüklenir
  var lost=false,lt=0;function lowCtx(v){if(!_LOW)return;clearTimeout(lt);if(!v&&!lost)lt=setTimeout(function(){try{r.forceContextLoss();lost=true;}catch(e){}},1500);else if(v&&lost){try{r.forceContextRestore();}catch(e){}lost=false;}}
  r.domElement.addEventListener('webglcontextlost',function(e){e.preventDefault();});
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){vis=es[0].isIntersecting;lowCtx(vis);if(vis&&!raf){last=performance.now();raf=requestAnimationFrame(loop);}},{threshold:.05}).observe(host);else{vis=true;raf=requestAnimationFrame(loop);}
  this.poke=function(){idle=0;};
  this.look=function(y,p){tyaw=y==null?yaw0:y;tpitch=p==null?pitch0:p;vy=vp=0;idle=0;};
  var tgt0=target.clone(),tgt=target.clone(),zf=1,zt=1;
  // Odaklanma: hedef noktaya, verilen açıya ve yakınlığa yumuşakça git
  this.focus=function(t,y,p,z){tgt.copy(t||tgt0);zt=z||1;if(!t)zoomTo(1);this.look(y,p);};
  this.aim=function(t){tgt.copy(t);};
  this.ok=true;
}
Viewer.prototype.project=function(){var w=this.host.clientWidth,h=this.host.clientHeight,v=new THREE.Vector3(),cam=this.cam;
  this.overlay.forEach(function(o){o.obj.updateWorldMatrix(true,false);v.copy(o.local).applyMatrix4(o.obj.matrixWorld);var d=v.clone().sub(cam.position);var n=o.normal?o.normal.clone().transformDirection(o.obj.matrixWorld):null;v.project(cam);
    o.el.style.left=((v.x+1)/2*w)+'px';o.el.style.top=((1-v.y)/2*h)+'px';var hidden=v.z>1||(n&&n.dot(d)>0)||(o.when&&!o.when());o.el.classList.toggle('hide',!!hidden);});};
Viewer.prototype.pick=function(objs,fn){this.picks.push({objs:objs,fn:fn});};

/* ---------- 3D Yazma eser (fizikli) ---------- */
function buildBook(V){
  var W=14,Dp=20,T=3,c=.28,g=new THREE.Group();V.pivot.add(g);g.position.set(-1,0,0);
  var leatherM=leatherMat(leather()),leatherPlain=leatherMat(leather({plain:true}),{bump:.2}),
      ebruM=new THREE.MeshStandardMaterial({map:ebru({doublure:true}),roughness:.9}),pageTex=page({seed:99}),pageM=pageMat(pageTex),
      edgeM=new THREE.MeshStandardMaterial({map:edges(),roughness:.95}),mikM=leatherMat(leather({half:true,zencerek:false})),frontM=leatherMat(leather({semse:false}));
  function box(w,h,d,m){var x=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);x.castShadow=true;x.receiveShadow=true;return x;}
  var back=box(W,c,Dp,[leatherPlain,leatherPlain,ebruM,leatherM,leatherPlain,leatherPlain]);back.position.set(0,c/2,0);g.add(back);
  var block=box(W-.5,T,Dp-.6,[edgeM,edgeM,pageM,edgeM,edgeM,edgeM]);block.position.set(.05,c+T/2,0);g.add(block);
  var spine=box(c,T+3*c,Dp,leatherPlain);spine.position.set(-W/2-c/2,(T+3*c)/2,0);g.add(spine);
  var sirM=new THREE.MeshStandardMaterial({map:siraze(),roughness:.7});var s1=box(.5,T*.9,.35,sirM);s1.position.set(-W/2+.2,c+T/2,Dp/2-.25);g.add(s1);var s2=s1.clone();s2.position.z=-Dp/2+.25;g.add(s2);
  // Ön kapak menteşesi (sırtta)
  var fp=new THREE.Group();fp.position.set(-W/2,c+T+c,0);g.add(fp);
  var front=box(W,c,Dp,[leatherPlain,leatherPlain,frontM,ebruM,leatherPlain,leatherPlain]);front.position.set(W/2,c/2,0);fp.add(front);
  // Şemse: kalıpla basılmış ayrı madalyon; seçilince kabartma gibi kapaktan yükselir
  var semse=new THREE.Mesh(new THREE.PlaneGeometry(270/512*W,400/720*Dp),leatherMat(semseTex(),{transparent:true,alphaTest:.4,bump:.03}));
  semse.rotation.x=-Math.PI/2;semse.position.y=c/2+.015;semse.castShadow=true;front.add(semse);var semseLift=new Spring(0,90,.5);
  // Sertap (arka kapağın ön kenarında) ve miklep
  var L=T+c,sp=new THREE.Group();sp.position.set(W/2,0,0);g.add(sp);
  var sert=box(L,c,Dp,[leatherPlain,leatherPlain,ebruM,leatherPlain,leatherPlain,leatherPlain]);sert.position.set(L/2,-c/2,0);sp.add(sert);
  var mp=new THREE.Group();mp.position.set(L,0,0);sp.add(mp);
  var Lm=W*.5,Pt=W*.28,sh=new THREE.Shape();sh.moveTo(0,-Dp/2+.3);sh.lineTo(Lm,-Dp/2+.3);sh.lineTo(Lm+Pt,0);sh.lineTo(Lm,Dp/2-.3);sh.lineTo(0,Dp/2-.3);sh.lineTo(0,-Dp/2+.3);
  var mg=new THREE.ExtrudeGeometry(sh,{depth:c,bevelEnabled:false});mg.rotateX(Math.PI/2);var uv=mg.attributes.uv,pos=mg.attributes.position;for(var i=0;i<uv.count;i++)uv.setXY(i,pos.getX(i)/(Lm+Pt),(pos.getZ(i)+Dp/2)/Dp);
  var mik=new THREE.Mesh(mg,[mikM,leatherPlain]);mik.castShadow=true;mik.receiveShadow=true;mp.add(mik);
  // Çevrilebilir sayfalar: eğilen, yerçekimiyle düşen yapraklar
  var NP=5,SEG=22,pw=W-.7,pd=Dp-1.0,pages=[];
  for(var k=0;k<NP;k++){var geo=new THREE.BufferGeometry(),vp=new Float32Array((SEG+1)*2*3),vu=new Float32Array((SEG+1)*2*2),idx=[];
    for(var j=0;j<=SEG;j++){vu[(j*2)*2]=j/SEG;vu[(j*2)*2+1]=1;vu[(j*2+1)*2]=j/SEG;vu[(j*2+1)*2+1]=0;if(j<SEG){var a=j*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}}
    geo.setAttribute('position',new THREE.BufferAttribute(vp,3));geo.setAttribute('uv',new THREE.BufferAttribute(vu,2));geo.setIndex(idx);
    var m=new THREE.Mesh(geo,pageMat(page(k===NP-1?{serlevha:true,seed:7}:{seed:100+k*2})));m.castShadow=true;m.add(new THREE.Mesh(geo,pageMat(page({seed:101+k*2,verso:true}),{side:THREE.BackSide})));var y0=c+T+.012+k*.006;m.position.set(-W/2+.25,y0,0);g.add(m);
    var hi=Math.PI-.03-(NP-k)*.006;
    pages.push({m:m,geo:geo,y0:y0,h:new Hinge({a:0,lo:0,hi:hi,G:9,f:.9,e:.18,K:34,C:10})});}
  function shapePage(p){var a=p.h.a,w=p.h.w,arr=p.geo.attributes.position.array,x=0,y=0,ds=pw/SEG;
    // hava direnci: hareket eden yaprağın ucu geride kalır; kâğıt kendi ağırlığıyla dikeye yakınken sarkar
    var bend=Math.max(-1.2,Math.min(1.2,-w*.2)),sag=.35*Math.max(0,Math.sin(a))*Math.cos(a);
    for(var j=0;j<=SEG;j++){var s=j/SEG,ang=a+bend*Math.pow(s,1.5)-sag*s*s;
      arr[(j*2)*3]=x;arr[(j*2)*3+1]=y;arr[(j*2)*3+2]=-pd/2;arr[(j*2+1)*3]=x;arr[(j*2+1)*3+1]=y;arr[(j*2+1)*3+2]=pd/2;
      x+=Math.cos(ang)*ds;y+=Math.sin(ang)*ds;if(a<.02&&y<0)y=0;}
    p.geo.attributes.position.needsUpdate=true;p.geo.computeVertexNormals();p.geo.computeBoundingSphere();
    p.m.position.y=p.y0+c*Math.min(1,Math.max(0,(a-1.3)/1.4));}
  pages.forEach(shapePage);
  // Menteşeler
  var cover=new THREE.Group();
  var hc=new Hinge({a:0,lo:0,hi:Math.PI-.005,G:9,f:.55,e:.28,K:110,C:15}),hs=new Hinge({a:Math.PI/2,lo:0,hi:Math.PI/2,G:12,f:.35,e:.25}),ms=new Spring(Math.PI/2,80,.55);
  hs.motor=Math.PI/2;
  var seq=new Seq(),state=0,busy=false,listeners=[],pending=null,held=null,settling=false;
  function flipped(){return pages.filter(function(p){return p.h.a>1.5;}).length;}
  // Yaprak ve kapak sırası: alttaki yaprak üsttekinin, üstteki de kapağın "içinden" geçemez.
  // Çakışan parçalar esnek olmayan çarpışmayla birlikte hareket eder (kapak 4 kat ağır). Elle tutulan parça sabittir.
  var chain=pages.map(function(p){return {h:p.h,m:1};}).concat([{h:hc,m:4}]);
  function collide(){for(var it=0;it<3;it++)for(var i=0;i<chain.length-1;i++){var A=chain[i],B=chain[i+1];if(A.h.a<=B.h.a)continue;
    var mA=A.h===held?1e6:A.m,mB=B.h===held?1e6:B.m,a=(A.h.a*mA+B.h.a*mB)/(mA+mB),w=(A.h.w*mA+B.h.w*mB)/(mA+mB);
    A.h.a=Math.min(A.h.hi,a);B.h.a=Math.max(B.h.lo,a);A.h.w=w;B.h.w=w;}}
  function derive(){return (ms.t>.1||hs.a>1)?0:(hc.a>Math.PI/2?2:1);}
  function still(h){return Math.abs(h.w)<.03&&(h.motor!==null||h.a<=h.lo+.02||h.a>=h.hi-.02);}
  V.updaters.push(function(dt){seq.step(dt);hc.step(dt);hs.step(dt);
    // miklep: sertap düşerken açılır, kapanırken katlanır; masanın altına giremez
    ms.step(dt);if(hs.a+ms.x<0){ms.x=-hs.a;ms.v=0;}
    // miklep katlanırken metin bloğuna çarpar ve durur (içine giremez)
    if(ms.x>Math.PI/2){ms.x=Math.PI/2;if(ms.v>0)ms.v=-ms.v*.2;}
    pages.forEach(function(p){p.h.step(dt);});collide();
    fp.rotation.z=hc.a;sp.rotation.z=hs.a;mp.rotation.z=ms.x;
    pages.forEach(function(p){shapePage(p);p.m.visible=hc.a>.25||p.h.a>.01;});
    // elle bırakılan parçalar durulunca durum güncellenir (düğmeler senkron kalır)
    if(settling&&!held&&!busy&&still(hc)&&still(hs)&&Math.abs(ms.v)<.03&&pages.every(function(p){return still(p.h);})){settling=false;state=derive();done();}
  });
  function done(){busy=false;listeners.forEach(function(f){f(state);});if(pending!==null&&pending!==state){var q=pending;pending=null;go(q);}else pending=null;}
  /* ---- Doğrudan tutma: imleç, menteşe eksenine dik düzlemde izlenir; parça açıyı bir yay-sönüm motoruyla takip eder ---- */
  var inv=new THREE.Matrix4(),ro=new THREE.Vector3(),rd=new THREE.Vector3();
  function toLocal(ray){g.updateWorldMatrix(true,false);inv.copy(g.matrixWorld).invert();ro.copy(ray.ray.origin).applyMatrix4(inv);rd.copy(ray.ray.direction).transformDirection(inv);}
  function angleAt(ray,px,py,z){toLocal(ray);if(Math.abs(rd.z)<.06)return null;var t=(z-ro.z)/rd.z;if(t<0)return null;
    var a=Math.atan2(ro.y+rd.y*t-py,ro.x+rd.x*t-px);if(a<0)a=a<-Math.PI/2?Math.PI:0;return a;}
  function clampA(h,a){return Math.max(h.lo,Math.min(h.hi,a));}
  function stopAuto(){seq.clear();busy=false;pending=null;hc.motor=null;pages.forEach(function(p){p.back=false;if(p.h.rel){p.h.motor=null;p.h.rel=null;}});}
  function holdHinge(h,px,py,z,K,C,onMove,onUp){var K0=h.K,C0=h.C;stopAuto();held=h;h.K=K;h.C=C;h.rel=null;h.motor=h.a;
    return {move:function(ray){var a=angleAt(ray,px,py,z);if(a===null)return;h.motor=clampA(h,a);if(onMove)onMove(h.motor);},
      up:function(click){held=null;h.K=K0;h.C=C0;h.motor=null;
        // tepe noktasında hareketsiz bırakılırsa yakın olduğu tarafa düşer
        if(Math.abs(h.a-Math.PI/2)<.12&&Math.abs(h.w)<.4)h.w=h.a>Math.PI/2?.5:-.5;
        settling=true;if(onUp)onUp(click);}};}
  function topRight(){for(var i=NP-1;i>=0;i--)if(pages[i].h.a<Math.PI/2)return pages[i];return null;}
  function topLeft(){for(var i=0;i<NP;i++)if(pages[i].h.a>=Math.PI/2)return pages[i];return null;}
  function holdPage(p,z){return holdHinge(p.h,p.m.position.x,p.m.position.y,z,150,22,null,function(click){if(click){flip(p,p.h.a<Math.PI/2?1:-1);}});}
  function holdCover(z){return holdHinge(hc,fp.position.x,fp.position.y,z,120,16,null,function(click){if(click){state=derive();go(state===2?1:2);}});}
  function holdSertap(z){var lifted=hc.a<.8;
    var hd=holdHinge(hs,sp.position.x,sp.position.y,z,120,20,function(a){ms.t=Math.PI/2*Math.max(0,Math.min(1,(a-.9)/(Math.PI/2-.9)));},null),up=hd.up;
    if(lifted)hc.motor=.8;   // miklep kapağın altından çıkabilsin diye kapak hafifçe kalkar
    hd.up=function(click){up(false);var close=click?hs.a<1:hs.a>1;busy=true;seq.clear();
      if(close){hs.motor=Math.PI/2;ms.t=Math.PI/2;seq.then(function(){return ms.x>1.5;},function(){if(lifted||hc.a<.9){hc.motor=null;hc.w=-.3;}})
        .then(function(){return hc.a<.01||hc.a>1.6;},function(){state=derive();done();});}
      else{hs.motor=null;hs.w=Math.min(hs.w,-.4);ms.t=0;seq.then(function(){return hs.a<.6;},function(){if(hc.motor!==null&&hc.a<.9){hc.motor=null;hc.w=-.2;}})
        .then(function(){return hs.a<.01&&Math.abs(hs.w)<.05&&(hc.a<.01||hc.a>1.6);},function(){state=derive();done();});}};
    return hd;}
  var pickList=pages.map(function(p){return p.m;}).concat([front,block,sert,mik]);
  function grabAt(ray){var hits=ray.intersectObjects(pickList.filter(function(o){return o.visible;}),false);if(!hits.length)return null;
    var o=hits[0].object;ro.copy(hits[0].point);g.updateWorldMatrix(true,false);inv.copy(g.matrixWorld).invert();ro.applyMatrix4(inv);var z=ro.z;
    if(o===sert||o===mik)return holdSertap(z);
    if(ms.x>.3)return o===front?holdCover(z):null;           // miklep sayfaların üstündeyken sayfalar tutulamaz
    for(var i=0;i<NP;i++)if(o===pages[i].m)return holdPage(pages[i],z);
    if(o===block){var p=topRight();return p&&hc.a>.6?holdPage(p,z):null;}
    if(o===front){var q=hc.a>Math.PI/2?topLeft():null;return q?holdPage(q,z):holdCover(z);}
    return null;}
  function setOpen(){seq.clear();busy=false;hc.a=Math.PI-.005;hc.w=0;hc.motor=null;hs.a=0;hs.w=0;hs.motor=null;ms.x=ms.t=0;ms.v=0;state=2;}
  function openMiklep(){busy=true;seq.clear();
    seq.then(true,function(){hc.motor=.8;})
       .then(function(){return hc.a>.6;},function(){ms.t=0;})
       .then(function(){return ms.x<.35;},function(){hs.kick(-1.7);})
       .then(function(){return hs.a<.6;},function(){hc.motor=null;hc.w=-.2;})
       .then(function(){return hc.a<.01&&hs.a<.01&&Math.abs(hs.w)<.05;},function(){state=1;done();});}
  function closeMiklep(){busy=true;seq.clear();
    seq.then(true,function(){hc.motor=.8;})
       .then(function(){return hc.a>.6;},function(){hs.motor=Math.PI/2;hs.C=10;})
       .then(function(){return hs.a>1.38;},function(){ms.t=Math.PI/2;})
       .then(function(){return ms.x>1.5;},function(){hc.motor=null;hc.w=-.3;})
       .then(function(){return hc.a<.01;},function(){state=0;done();});}
  function openBook(){busy=true;seq.clear();
    seq.then(true,function(){hc.motor=1.95;})
       .then(function(){return hc.a>1.72;},function(){hc.motor=null;hc.w=Math.max(hc.w,1.2);})
       .then(function(){return hc.a>Math.PI-.02&&Math.abs(hc.w)<.05;},function(){state=2;done();});}
  function closeBook(){busy=true;seq.clear();
    seq.then(function(){var n=0;pages.forEach(function(p,i){if(p.h.a>1.5&&!p.back){p.back=true;setTimeout(function(){flip(p,-1);},n*260);n++;}});return true;},function(){})
       .then(function(){return pages.every(function(p){return p.h.a<.02;});},function(){pages.forEach(function(p){p.back=false;});hc.motor=1.2;})
       .then(function(){return hc.a<1.45;},function(){hc.motor=null;hc.w=Math.min(hc.w,-.8);})
       .then(function(){return hc.a<.01&&Math.abs(hc.w)<.05;},function(){state=1;done();});}
  function flip(p,dir){var H=Math.PI/2;if(dir>0)p.h.push(H+.4,H+.14,1);else p.h.push(H-.4,H-.14,-1);}
  function flipNext(){if(state!==2||busy)return false;var un=pages.filter(function(p){return p.h.a<.02;});if(!un.length)return false;flip(un[un.length-1],1);V.poke();return true;}
  function flipBack(){if(state!==2||busy)return false;var q=topLeft();if(!q)return false;flip(q,-1);V.poke();return true;}
  function go(n){V.poke();if(busy){pending=n;return;}if(n===state)return;pending=null;
    if(state===0){openMiklep();if(n===2)pending=2;}
    else if(state===1){if(n===2)openBook();else closeMiklep();}
    else{closeBook();if(n===0)pending=0;}}
  function own(m){return Array.isArray(m)?m.map(function(x){return x.clone();}):m.clone();}
  [front,back,block,spine,sert,mik].forEach(function(o){o.material=own(o.material);});s1.material=own(s1.material);s2.material=s1.material;
  var parts={front:front,semse:semse,back:back,block:block,spine:spine,sert:sert,mik:mik,siraze:s1};
  V.updaters.push(function(dt){semseLift.step(dt);semse.position.y=c/2+.015+Math.max(0,semseLift.x);var k=1+Math.max(0,semseLift.x)*.12;semse.scale.set(k,k,1);});
  // Kapağı hafifçe kaldırıp bırakma (yerçekimiyle geri düşer)
  function peek(){if(busy||hc.a>.1)return;busy=true;seq.clear();seq.then(true,function(){hc.motor=.5;}).wait(.9).then(true,function(){hc.motor=null;hc.w=-.2;})
    .then(function(){return hc.a<.01&&Math.abs(hc.w)<.05;},function(){busy=false;});}
  return {group:g,go:go,peek:peek,lift:function(v){semseLift.t=v;},mikOpen:function(){return ms.x<1;},grab:grabAt,hover:function(ray){return ray.intersectObjects(pickList.filter(function(o){return o.visible;}),false).length>0;},setOpen:setOpen,get state(){return state;},get busy(){return busy;},flipNext:flipNext,flipBack:flipBack,flipped:flipped,onDone:function(f){listeners.push(f);},parts:parts,pages:pages,W:W,D:Dp,T:T,c:c,fp:fp,sp:sp,mp:mp,L:L,Lm:Lm};
}

/* Ana sayfa: tam genişlikte, elle çevrilen kitap (kendi kendine oynamaz) */
(function(){var V=new Viewer('hero3d',{pitch:30*D2R,yaw:-18*D2R,target:new THREE.Vector3(-1,2.5,0),auto:false,fitR:22,
    shift:function(w){return w>980?.25:0;}});if(!V.ok)return;var b=buildBook(V);b.setOpen();
  V.grabbers.push(b.grab);V.hover=b.hover;window.__hero={b:b,V:V};})();

/* Anatomi: parçalar, durumlar, sayfa çevirme */
whenNear('book3d',function(){var V=new Viewer('book3d',{pitch:34*D2R,yaw:-28*D2R,target:new THREE.Vector3(-1,2,0),auto:false,fitR:23});if(!V.ok)return;var b=buildBook(V);V.grabbers.push(b.grab);V.hover=b.hover;window.__ana={b:b,V:V};
  var V3=THREE.Vector3,UP=new V3(0,1,0);
  // [ad, nesne, yerel konum, açıklama, parça, yüzey normali, görünürlük koşulu, seçilince yapılan hareket]
  var P=[
   ['Ön kapak',b.fp,new V3(b.W*.8,b.c,-b.D*.34),'Mukavva üzerine deri kaplama. Altın yaldızlı çerçeve (zencerek) ve köşebentlerle süslenir; iç yüzü ebru kâğıdıyla kaplanır.','front',UP,null,
     function(){V.look();if(b.state===2)b.go(1);else b.peek();}],
   ['Şemse',b.parts.semse,new V3(0,0,0),'Kapağın ortasındaki badem biçimli madalyon. Kalıpla basılıp altın yaldızla işlenir; Türk-İslam cildinin en tanınan süsüdür.','semse',new V3(0,0,1),null,
     function(){V.look(-12*D2R,64*D2R);if(b.state===2)b.go(1);b.lift(.55);}],
   ['Sırt',b.parts.spine,new V3(-b.c/2,0,b.D*.28),'Formaların dikildiği kenarı örter. Deri kaybı ve sırtın kopması en sık görülen cilt bozulmalarındandır.','spine',new V3(-1,0,0),null,
     function(){V.look(-82*D2R,16*D2R);}],
   ['Şiraze',b.parts.siraze,new V3(0,0,.2),'Sırtın baş ve kuyruğunda renkli ipek ipliklerle örülen bant. Hem süs hem de formaları bir arada tutan bir destektir.','siraze',null,null,
     function(){V.look(-52*D2R,14*D2R);}],
   ['Sertap',b.sp,new V3(b.L*.55,-b.c,b.D*.3),'Arka kapağa bağlı, kitabın ön kenarını kapatan kanat. Katlama yerinden kopma sık görülür.','sert',null,null,
     function(){V.look(18*D2R,26*D2R);}],
   ['Miklep',b.mp,new V3(b.Lm*.75,-b.c,0),'Sertabın ucundaki beşgen kapak. Kitap kapalıyken ön kapağın altına girer ve sayfaları korur.','mik',null,function(){return b.mikOpen();},
     function(){V.look(10*D2R,40*D2R);if(b.state===0)b.go(1);}],
   ['Metin bloğu',b.parts.block,new V3(b.W*.15,0,(b.D-.6)/2),'Aharlı el yapımı kâğıttan formalar; is ya da demir-gal mürekkep, cetvel, tezhip. Konservasyonun asıl konusu.','block',new V3(0,0,1),null,
     function(){V.look(-20*D2R,30*D2R);if(b.state===0)b.go(1);}]];
  var host=V.host,list=document.getElementById('part-list'),out=document.getElementById('part-out'),btns=[],cur=null,glow=0,tt=0;
  P.forEach(function(p,i){var el=document.createElement('button');el.type='button';el.className='hs';el.innerHTML='<i>'+(i+1)+'</i><span>'+p[0]+'</span>';el.setAttribute('aria-label',p[0]);host.appendChild(el);
    V.overlay.push({el:el,obj:p[1],local:p[2],normal:p[5],when:p[6]});var lb=document.createElement('button');lb.type='button';lb.textContent=p[0];list.appendChild(lb);btns.push([el,lb]);
    el.addEventListener('click',function(){choose(i);});lb.addEventListener('click',function(){choose(i);});});
  function mats(k){return k?[].concat(b.parts[k].material):[];}
  // Seçili parça altın renkte nabız gibi parlar; diğerleri söner
  V.updaters.push(function(dt){tt+=dt;glow=Math.min(1,glow+dt*3);var k=glow*(.55+.45*Math.sin(tt*4.2));
    Object.keys(b.parts).forEach(function(n){mats(n).forEach(function(mt){if(!mt.emissive)return;if(n===cur)mt.emissive.setRGB(.42*k,.27*k,.06*k);else mt.emissive.multiplyScalar(Math.exp(-8*dt));});});});
  function choose(i){var p=P[i];btns.forEach(function(x,k){x[0].classList.toggle('on',k===i);x[1].setAttribute('aria-pressed',k===i);});out.innerHTML='<h3>'+p[0]+'</h3><p class="muted">'+p[3]+'</p>';
    cur=p[4];glow=0;tt=0;if(p[4]!=='semse')b.lift(0);V.poke();p[7]();}
  var sb=[].slice.call(document.querySelectorAll('[data-book]')),fb=document.getElementById('flip-f'),bb=document.getElementById('flip-b');
  function sync(){sb.forEach(function(x){x.setAttribute('aria-pressed',+x.dataset.book===b.state);});var open=b.state===2;if(fb){fb.disabled=!open;bb.disabled=!open||b.flipped()===0;}}
  b.onDone(sync);sb.forEach(function(x){x.addEventListener('click',function(){b.go(+x.dataset.book);});});
  if(fb){fb.addEventListener('click',function(){b.flipNext();setTimeout(sync,900);});bb.addEventListener('click',function(){b.flipBack();setTimeout(sync,900);});}
  V.pick([b.parts.front],function(){b.go(b.state===2?1:2);});V.pick([b.parts.mik,b.parts.sert],function(){b.go(b.state===0?1:0);});V.pick([b.parts.block].concat(b.pages.map(function(p){return p.m;})),function(){if(b.state===2){b.flipNext();setTimeout(sync,900);}});
  sync();});

/* ---------- 3D Kompakt raf (ivmeli hareket, çarpışma, sallanma) ---------- */
whenNear('shelf3d',function(){var V=new Viewer('shelf3d',{dist:58,pitch:26*D2R,yaw:-38*D2R,target:new THREE.Vector3(0,5,0),ground:false});if(!V.ok)return;
  var N=7,UW=2.2,Lz=16,Hh=11,GAP=4.4,units=[],g=new THREE.Group();V.pivot.add(g);
  // Dokular: fırın boyalı çelik (portakal kabuğu yüzey), uç panel (etiketlik, numara, sürtme izleri), arşiv kutuları ve deri sırtlar, epoksi zemin
  var SR=_rng(910);
  function ctex(w,h,draw,rep){var c=_cv(w,h),bc=_cv(w,h),x=c.getContext('2d'),b=bc.getContext('2d');b.fillStyle='#808080';b.fillRect(0,0,w,h);draw(x,w,h,b);var t=_tx(c),tb=_tx(bc,false);if(rep){t.wrapS=t.wrapT=tb.wrapS=tb.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1]);tb.repeat.set(rep[0],rep[1]);}t.userData={bump:tb};return t;}
  function speck(x,w,h,n,cols,a,b2){for(var i=0;i<n;i++){x.fillStyle=cols[i%cols.length];x.fillRect(SR()*w,SR()*h,a+SR()*(b2-a),a+SR()*(b2-a));}}
  var steelT=ctex(256,256,function(x,w,h,b){x.fillStyle='#E9E7E0';x.fillRect(0,0,w,h);speck(x,w,h,6000,['rgba(0,0,0,.035)','rgba(255,255,255,.06)'],.8,2.2);for(var i=0;i<5000;i++){b.fillStyle=SR()<.5?'rgba(60,60,60,.25)':'rgba(200,200,200,.25)';b.fillRect(SR()*w,SR()*h,2,2);}},[4,4]);
  function steelMat(c){return new THREE.MeshStandardMaterial({map:steelT,bumpMap:steelT.userData.bump,bumpScale:.004,color:c||0xffffff,roughness:.42,metalness:.12});}
  function endTex(k){return ctex(256,1280,function(x,w,h,b){x.fillStyle='#E9E7E0';x.fillRect(0,0,w,h);speck(x,w,h,7000,['rgba(0,0,0,.035)','rgba(255,255,255,.06)'],.8,2.2);
    x.strokeStyle='rgba(90,90,85,.35)';x.lineWidth=3;x.strokeRect(14,14,w-28,h-28);x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=1.5;x.strokeRect(17,17,w-34,h-34);b.strokeStyle='#404040';b.lineWidth=4;b.strokeRect(14,14,w-28,h-28);
    x.fillStyle='#B9BCBC';x.fillRect(40,60,176,104);x.fillStyle='#F7F5EF';x.fillRect(46,66,164,92);x.fillStyle='#1B1F1C';x.textAlign='center';x.font='600 40px "IBM Plex Sans", Arial';x.fillText('R-'+(k+1),128,108);
    x.font='500 15px "IBM Plex Mono", monospace';x.fillText('YE '+String(k*240+1).padStart(4,'0')+'–'+String(k*240+240).padStart(4,'0'),128,140);x.fillStyle='rgba(255,255,255,.35)';x.fillRect(46,66,164,12);b.fillStyle='#b0b0b0';b.fillRect(40,60,176,104);
    x.fillStyle='#C8CBCB';x.fillRect(88,1170,80,20);
    for(var i=0;i<40;i++){var sx=20+SR()*(w-40),sy=h-180+SR()*160;x.strokeStyle='rgba(60,60,55,'+(.08+SR()*.15)+')';x.lineWidth=1+SR()*2;x.beginPath();x.moveTo(sx,sy);x.lineTo(sx+10+SR()*30,sy+(SR()-.5)*4);x.stroke();}
    var dg=x.createLinearGradient(0,h-200,0,h);dg.addColorStop(0,'rgba(80,80,70,0)');dg.addColorStop(1,'rgba(80,80,70,.18)');x.fillStyle=dg;x.fillRect(0,0,w,h);});}
  // raf ekranı: nem, sıcaklık, kilit durumu
  var scrT=ctex(128,192,function(x,w,h){x.fillStyle='#0E1A20';x.fillRect(0,0,w,h);x.fillStyle='#7CE0B4';x.font='600 26px "IBM Plex Mono", monospace';x.textAlign='center';x.fillText('%50',64,58);x.font='500 18px "IBM Plex Mono", monospace';x.fillStyle='#BFD6E2';x.fillText('18 °C',64,92);
    x.fillStyle='#F2A92B';x.font='600 14px "IBM Plex Mono", monospace';x.fillText('KİLİTLİ',64,140);x.strokeStyle='rgba(124,224,180,.5)';x.strokeRect(10,10,w-20,h-20);});
  // arşiv kutusu sırtı: gri asitsiz mukavva, beyaz etiket, mürekkeple numara ve barkod
  function boxTex(){return ctex(128,256,function(x,w,h,b){x.fillStyle='#8E9590';x.fillRect(0,0,w,h);speck(x,w,h,2500,['rgba(40,46,42,.18)','rgba(230,235,230,.15)'],.6,1.8);x.fillStyle='rgba(0,0,0,.25)';x.fillRect(0,0,w,4);x.fillRect(0,h-4,w,4);
    x.fillStyle='#F4F2EA';x.fillRect(18,40,92,96);x.fillStyle='#1B1F1C';x.font='600 22px "IBM Plex Mono", monospace';x.textAlign='center';x.fillText('YE',64,72);x.font='500 18px "IBM Plex Mono", monospace';x.fillText(String(100+Math.floor(SR()*900)),64,98);
    for(var i=0;i<26;i++){if(SR()<.6){x.fillRect(26+i*3,110,2,18);}}b.fillStyle='#a0a0a0';b.fillRect(18,40,92,96);x.fillStyle='rgba(60,60,55,.5)';x.fillRect(52,200,24,10);});}
  var boxTop=new THREE.MeshStandardMaterial({color:0x8A918C,roughness:.9}),boxSide=new THREE.MeshStandardMaterial({color:0x878E89,roughness:.9});
  var boxMs=[0,1,2].map(function(){var t=boxTex(),m=new THREE.MeshStandardMaterial({map:t,bumpMap:t.userData.bump,bumpScale:.01,roughness:.9});return [m,m,boxTop,boxTop,boxSide,boxSide];});
  // deri sırt: kabartma bantlar, altın çizgiler, yıpranmış baş ve kuyruk
  var spT=ctex(128,256,function(x,w,h,b){x.fillStyle='#8A6A52';x.fillRect(0,0,w,h);_blot(x,w,h,20,['rgba(60,40,28,A)','rgba(150,115,85,A)'],8,40,.4,SR);speck(x,w,h,3000,['rgba(30,18,10,.2)','rgba(220,190,160,.12)'],.6,1.6);
    [50,100,150,200].forEach(function(y){var g=x.createLinearGradient(0,y-8,0,y+8);g.addColorStop(0,'rgba(0,0,0,.35)');g.addColorStop(.5,'rgba(255,230,200,.25)');g.addColorStop(1,'rgba(0,0,0,.35)');x.fillStyle=g;x.fillRect(0,y-8,w,16);b.fillStyle='#d0d0d0';b.fillRect(0,y-6,w,12);x.fillStyle='rgba(212,170,80,.8)';x.fillRect(0,y-11,w,1.5);x.fillRect(0,y+10,w,1.5);});
    x.fillStyle='rgba(212,170,80,.7)';x.fillRect(24,64,80,22);var eg=x.createLinearGradient(0,0,0,h);eg.addColorStop(0,'rgba(200,170,140,.35)');eg.addColorStop(.06,'rgba(200,170,140,0)');eg.addColorStop(.94,'rgba(200,170,140,0)');eg.addColorStop(1,'rgba(200,170,140,.35)');x.fillStyle=eg;x.fillRect(0,0,w,h);});
  var bookM=[new THREE.MeshStandardMaterial({map:spT,bumpMap:spT.userData.bump,bumpScale:.015,roughness:.75}),null,new THREE.MeshStandardMaterial({color:0xE2D4B0,roughness:.95})];bookM[1]=bookM[0];bookM[3]=bookM[2];bookM[4]=bookM[5]=new THREE.MeshStandardMaterial({color:0x6E4E3C,roughness:.8});
  // zemin: epoksi kaplama, derz ve hafif yansıma
  var floorT=ctex(512,512,function(x,w,h,b){x.fillStyle='#A9ADA8';x.fillRect(0,0,w,h);_blot(x,w,h,40,['rgba(140,145,140,A)','rgba(190,195,190,A)'],30,120,.3,SR);speck(x,w,h,4000,['rgba(60,60,60,.08)','rgba(255,255,255,.08)'],.6,1.6);x.strokeStyle='rgba(70,72,70,.5)';x.lineWidth=2;x.strokeRect(0,0,w,h);b.strokeStyle='#404040';b.lineWidth=3;b.strokeRect(0,0,w,h);},[8,4]);
  var floor=new THREE.Mesh(new THREE.BoxGeometry(40,.3,Lz+6),new THREE.MeshStandardMaterial({map:floorT,bumpMap:floorT.userData.bump,bumpScale:.01,roughness:.35,metalness:.05}));floor.position.y=-.15;floor.receiveShadow=true;g.add(floor);
  var railM=new THREE.MeshStandardMaterial({color:0x9CA2A0,metalness:.85,roughness:.28});[-Lz/2+1.5,0,Lz/2-1.5].forEach(function(z){var r=new THREE.Mesh(new THREE.BoxGeometry(36,.15,.3),railM);r.position.set(0,.07,z);g.add(r);});
  var bodyM=steelMat(),shelfM=steelMat(0xE2DFD7),endMs=[];for(var ek=0;ek<N;ek++){var et=endTex(ek);endMs.push(new THREE.MeshStandardMaterial({map:et,bumpMap:et.userData.bump,bumpScale:.006,roughness:.42,metalness:.12}));}
  var cols=[0x6B2E22,0x8C5A2B,0x2F4F44,0x5A3A2A,0x7A6A4A,0x3A3F52,0x9A7B4F,0x4B2A20,0xB49A6A],bookGeo=new THREE.BoxGeometry(.9,1,1);
  for(var u=0;u<N;u++){var root=new THREE.Group(),grp=new THREE.Group();root.add(grp);
    var sideA=new THREE.Mesh(new THREE.BoxGeometry(UW,Hh,.2),bodyM);sideA.position.set(0,Hh/2+.3,-Lz/2);grp.add(sideA);
    var endP=new THREE.Mesh(new THREE.BoxGeometry(UW,Hh,.35),[bodyM,bodyM,bodyM,bodyM,endMs[u],bodyM]);endP.position.set(0,Hh/2+.3,Lz/2);grp.add(endP);
    var scrM=new THREE.MeshStandardMaterial({map:scrT,color:0x222222,emissive:0xffffff,emissiveMap:scrT,emissiveIntensity:.85,roughness:.25});var scr=new THREE.Mesh(new THREE.BoxGeometry(.9,1.3,.06),scrM);scr.position.set(0,6.4,Lz/2+.2);grp.add(scr);
    var lampM=new THREE.MeshStandardMaterial({color:0x6b5a2a,emissive:0x000000,roughness:.4});var lamp=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.3,16),lampM);lamp.position.set(0,Hh+.55,Lz/2-.2);grp.add(lamp);
    var top=new THREE.Mesh(new THREE.BoxGeometry(UW,.2,Lz),bodyM);top.position.set(0,Hh+.3,0);grp.add(top);
    var mid=new THREE.Mesh(new THREE.BoxGeometry(.12,Hh,Lz),shelfM);mid.position.set(0,Hh/2+.3,0);grp.add(mid);
    for(var s=0;s<6;s++){var shf=new THREE.Mesh(new THREE.BoxGeometry(UW,.12,Lz),shelfM);shf.position.set(0,.4+s*1.95,0);grp.add(shf);}
    // raflarda çoğunlukla gri arşiv kutuları, aralarda kutulanmamış deri ciltli eserler
    var IBs=boxMs.map(function(m){var im=new THREE.InstancedMesh(bookGeo,m,5*2*22);im.n=0;return im;}),IK=new THREE.InstancedMesh(bookGeo,bookM,5*2*22),nb=0,nk=0,mtx=new THREE.Matrix4(),col=new THREE.Color();
    for(var lv=0;lv<5;lv++)for(var side=-1;side<=1;side+=2){var z=-Lz/2+.6;while(z<Lz/2-.8){var isBox=SR()<.68,th=isBox?.5+SR()*.25:.28+SR()*.35,hh=isBox?1.35+SR()*.12:1.0+SR()*.55,dep=isBox?.95:.8+SR()*.1;if(z+th>Lz/2-.8)break;
        mtx.makeScale(dep,hh,th);mtx.setPosition(side*(.5-(1-dep)/2*0),.46+lv*1.95+hh/2,z+th/2);
        if(isBox){var gv=.92+SR()*.14,IB=IBs[Math.floor(SR()*3)];col.setRGB(gv,gv,gv*1.01);IB.setMatrixAt(IB.n,mtx);IB.setColorAt(IB.n,col);IB.n++;}
        else{col.setHex([0xC08A6A,0x9E6A50,0x8A5040,0xB09070,0x7A5A48,0xA0705A,0x6E4A3A][Math.floor(SR()*7)]);IK.setMatrixAt(nk,mtx);IK.setColorAt(nk,col);nk++;}
        z+=th+.03+(SR()<.08?.25:0);}}
    IBs.forEach(function(im){im.count=im.n;grp.add(im);});IK.count=nk;grp.add(IK);grp.traverse(function(o){if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
    g.add(root);units.push({root:root,body:grp,lamp:lampM,x:0,v:0,a:0,t:0,sway:new Spring(0,90,.35)});}
  // koridor zemin ışığı
  var stripM=new THREE.MeshBasicMaterial({color:0x7CE0B4,transparent:true,opacity:0}),strip=new THREE.Mesh(new THREE.PlaneGeometry(1.2,Lz-1),stripM);strip.rotation.x=-Math.PI/2;strip.position.y=.02;g.add(strip);
  var open=3,total=N*UW+GAP,x0=-total/2+UW/2,VMAX=3.2,ACC=4.5;
  function layout(){units.forEach(function(un,i){un.t=x0+i*UW+(i>=open?GAP:0);});}
  layout();units.forEach(function(un){un.x=un.t;});
  var t=0;
  V.updaters.push(function(dt){t+=dt;var n=4,h=dt/n;
    for(var it=0;it<n;it++){
      units.forEach(function(un){var dx=un.t-un.x,vdes=Math.sign(dx)*Math.min(VMAX,Math.sqrt(2*ACC*Math.abs(dx)));var dv=Math.max(-ACC*h,Math.min(ACC*h,vdes-un.v));un.a=dv/h;un.v+=dv;un.x+=un.v*h;if(Math.abs(dx)<.002&&Math.abs(un.v)<.01){un.x=un.t;un.v=0;un.a=0;}});
      // çarpışma: bloklar birbirinin içinden geçemez, çarpan bloklar birlikte hareket eder
      for(var i=0;i<N-1;i++){var A=units[i],B=units[i+1],ov=A.x+UW-B.x;if(ov>0){A.x-=ov/2;B.x+=ov/2;var vm=(A.v+B.v)/2;A.v=vm;B.v=vm;}}
      var lo=x0-.001,hi=x0+(N-1)*UW+GAP+.001;if(units[0].x<lo){units[0].x=lo;units[0].v=0;}if(units[N-1].x>hi){units[N-1].x=hi;units[N-1].v=0;}}
    units.forEach(function(un){un.root.position.x=un.x;
      // eylemsizlik: hızlanırken üst kısım geride kalır, dururken öne salınır
      un.sway.t=-un.a*.012;un.sway.step(dt);un.body.rotation.z=Math.max(-.03,Math.min(.03,un.sway.x));un.body.position.x=-un.body.rotation.z*.3;
      var moving=Math.abs(un.v)>.05;un.lamp.emissive.setHex(moving&&(Math.floor(t*4)%2===0)?0xF2A92B:0x000000);});
    var gx=open>0?(units[open-1].x+UW/2+units[open].x-UW/2)/2:0,gw=open>0?units[open].x-units[open-1].x-UW:0;strip.position.x=gx;stripM.opacity=Math.max(0,Math.min(.85,(gw-GAP*.8)/(GAP*.2)*.85));});
  var ui=document.getElementById('shelf-ui'),bs=[];
  function setOpen(k){open=k;layout();V.poke();bs.forEach(function(x,j){x.setAttribute('aria-pressed',j+1===k);});}
  for(var k=1;k<N;k++){(function(k){var b=document.createElement('button');b.type='button';b.className='btn sm';b.textContent='Koridor '+k;b.setAttribute('aria-pressed',k===open);b.addEventListener('click',function(){setOpen(k);});ui.appendChild(b);bs.push(b);})(k);}
  units.forEach(function(un,i){V.pick([un.root],function(){setOpen(Math.max(1,Math.min(N-1,i)));});});
});

/* ---------- 3D Kutu ve sarmalama (yerçekimli kapak, yaylı kanatlar) ---------- */
whenNear('box3d',function(){var V=new Viewer('box3d',{dist:46,pitch:32*D2R,yaw:-35*D2R,target:new THREE.Vector3(0,2,0)});if(!V.ok)return;
  var greyM=boardMat('grey'),greyIn=boardMat('lining'),labelM=new THREE.MeshStandardMaterial({map:label2(['ASİTSİZ KUTU','Yazma eser · 101 Atölye']),roughness:.85});
  function slab(w,h,d,m){var x=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m||greyM);x.castShadow=true;x.receiveShadow=true;return x;}
  var bW=14,bD=20,bT=3;
  function book(){var gg=new THREE.Group(),lm=leatherMat(leather()),pl=leatherMat(leather({plain:true}),{bump:.2}),em=new THREE.MeshStandardMaterial({map:edges(),roughness:.9});
    var b=new THREE.Mesh(new THREE.BoxGeometry(bW,bT,bD),[em,pl,lm,pl,em,em]);b.castShadow=true;b.position.y=bT/2;gg.add(b);return gg;}
  /* Kapaklı kutu */
  var boxG=new THREE.Group();V.pivot.add(boxG);var IW=bW+.6,ID=bD+.6,IH=bT+.5,t=.25;
  var base=new THREE.Group();boxG.add(base);var bot=slab(IW+2*t,t,ID+2*t,greyIn);bot.position.y=t/2;base.add(bot);
  [ID/2+t/2,-ID/2-t/2].forEach(function(z){var s=slab(IW+2*t,IH,t);s.position.set(0,t+IH/2,z);base.add(s);});
  [IW/2+t/2,-IW/2-t/2].forEach(function(x){var s=slab(t,IH,ID);s.position.set(x,t+IH/2,0);base.add(s);});
  var bk=book();bk.position.y=t+.02;boxG.add(bk);
  var hy=t+IH+t*.5,hinge=new THREE.Group();hinge.position.set(-IW/2-t*2,hy,0);boxG.add(hinge);
  var OW=IW+4*t,OD=ID+4*t,OH=IH+.4;
  var lidTop=slab(OW,t,OD);lidTop.position.set(OW/2,0,0);hinge.add(lidTop);var lab=new THREE.Mesh(new THREE.PlaneGeometry(9,4.5),labelM);lab.rotation.x=-Math.PI/2;lab.position.set(OW/2,t/2+.01,0);hinge.add(lab);
  [OD/2-t/2,-OD/2+t/2].forEach(function(z){var s=slab(OW,OH,t);s.position.set(OW/2,-OH/2,z);hinge.add(s);});
  var lf=slab(t,OH,OD);lf.position.set(OW-t/2,-OH/2,0);hinge.add(lf);
  // Kapak: menteşede yerçekimi; kapalıyken tabana, açıkken masaya oturur ve seker
  var lidH=new Hinge({a:0,lo:0,hi:Math.PI+Math.asin(Math.min(.95,(hy-.1)/OW)),G:9,f:.5,e:.32,K:40,C:11});lidH.a=lidH.hi;
  /* Dört kanatlı sarmalama */
  var wrapG=new THREE.Group();V.pivot.add(wrapG);wrapG.visible=false;
  var board=slab(bW+.4,.12,bD+.4,greyIn);board.position.y=.06;wrapG.add(board);var bk2=book();bk2.position.y=.12;wrapG.add(bk2);
  var flapM=boardMat('card',{bump:.04}),flaps=[];
  function flap(axis,dir,len,width,order){var p=new THREE.Group(),wall=new THREE.Group(),top=new THREE.Group(),lh=bT+.2+order*.1;
    var wm=slab(axis==='x'?lh:width,.08,axis==='x'?width:lh,flapM);wm.position[axis]=dir*lh/2;wall.add(wm);
    var tm=slab(axis==='x'?len:width,.08,axis==='x'?width:len,flapM);tm.position[axis]=dir*len/2;top.add(tm);top.position[axis]=dir*lh;wall.add(top);
    if(axis==='x')p.position.set(dir*(bW/2+.2),.12,0);else p.position.set(0,.12,dir*(bD/2+.2));p.add(wall);wrapG.add(p);
    flaps.push({wall:wall,top:top,axis:axis,dir:dir,order:order,sw:new Spring(0,38,.42),st:new Spring(0,38,.42)});}
  flap('z',1,bD*.9,bW,0);flap('z',-1,bD*.9,bW,1);flap('x',-1,bW*.95,bD,2);flap('x',1,bW*.95,bD,3);
  var mode='box',closed=false,wseq=new Seq();
  V.updaters.push(function(dt){lidH.step(dt);hinge.rotation.z=lidH.a;wseq.step(dt);
    flaps.forEach(function(f){f.sw.step(dt);f.st.step(dt);var a=Math.max(-.05,f.sw.x)*Math.PI/2,b=Math.max(-.05,f.st.x)*Math.PI/2;
      if(f.axis==='z'){f.wall.rotation.x=-f.dir*a;f.top.rotation.x=-f.dir*b;}else{f.wall.rotation.z=f.dir*a;f.top.rotation.z=f.dir*b;}});});
  function wrapClose(){wseq.clear();flaps.forEach(function(f,i){wseq.wait(i?.32:0).then(true,function(){f.sw.t=1;}).then(function(){return f.sw.x>.72;},function(){f.st.t=1;});});}
  function wrapOpen(){wseq.clear();flaps.slice().reverse().forEach(function(f,i){wseq.wait(i?.25:0).then(true,function(){f.st.t=0;}).then(function(){return f.st.x<.35;},function(){f.sw.t=0;});});}
  var tog=document.getElementById('box-toggle'),mb=[].slice.call(document.querySelectorAll('[data-box-mode]'));
  function lidGo(close){var H=Math.PI/2;if(close)lidH.push(H-.35,H-.12,-1);else lidH.push(H+.35,H+.12,1);}
  function toggle(){closed=!closed;V.poke();if(mode==='box')lidGo(closed);else (closed?wrapClose:wrapOpen)();tog.textContent=closed?'Aç':'Kapat';}
  tog.addEventListener('click',toggle);V.pick([hinge,bk],toggle);V.pick([wrapG],toggle);
  mb.forEach(function(b){b.addEventListener('click',function(){mode=b.dataset.boxMode;mb.forEach(function(x){x.setAttribute('aria-pressed',x===b);});boxG.visible=mode==='box';wrapG.visible=mode==='wrap';
    closed=false;tog.textContent='Kapat';flaps.forEach(function(f){f.sw.x=f.st.x=f.sw.t=f.st.t=0;f.sw.v=f.st.v=0;});lidH.a=lidH.hi;lidH.w=0;V.poke();});});
});
/* ---------- 3D Rami yerleşkesi: kanatlar, Hünkâr Kasrı, avlu; atölye ve depo konumları ---------- */
whenNear('campus3d',function(){var host=document.getElementById('campus3d');if(!host)return;
  var V=new Viewer('campus3d',{pitch:36*D2R,yaw:-34*D2R,target:new THREE.Vector3(0,0,0),fitR:15.5,auto:false,ground:false});if(!V.ok)return;
  var g=new THREE.Group();V.pivot.add(g);
  // 1 birim = 10 m. Ana giriş (Hünkâr Kasrı) +Z yönünde; avluya girince sol kanat −X (kuzey) tarafında.
  var X=11.5,Z=10,WD=1.6,H=1.0;
  // Dokular: renk + kabartı haritası. Bir doku tekrarı = bir cephe aksı (iki pencere, iki kat)
  var CR=_rng(77);
  function tex(w,h,draw,rx,ry){var c=document.createElement('canvas');c.width=w;c.height=h;var bc=document.createElement('canvas');bc.width=w;bc.height=h;var b=bc.getContext('2d');b.fillStyle='#808080';b.fillRect(0,0,w,h);
    draw(c.getContext('2d'),w,h,b);c=_shrink(c);bc=_shrink(bc);var t=new THREE.CanvasTexture(c);if(THREE.sRGBEncoding)t.encoding=THREE.sRGBEncoding;t.anisotropy=8;t.wrapS=t.wrapT=THREE.RepeatWrapping;
    var tb=new THREE.CanvasTexture(bc);tb.wrapS=tb.wrapT=THREE.RepeatWrapping;t.userData={bump:tb};return t;}
  function specks(x,w,h,n,cols,s0,s1){for(var i=0;i<n;i++){x.fillStyle=cols[i%cols.length];x.fillRect(CR()*w,CR()*h,s0+CR()*(s1-s0),s0+CR()*(s1-s0));}}
  // sıva: lekeli, alt kısımda nem ve kir
  function plasterBase(x,w,h,col){x.fillStyle=col;x.fillRect(0,0,w,h);_blot(x,w,h,40,['rgba(200,180,140,A)','rgba(250,240,220,A)','rgba(170,150,120,A)'],20,120,.25,CR);
    specks(x,w,h,5000,['rgba(120,100,70,.12)','rgba(255,250,235,.15)'],.6,1.8);
    var dg=x.createLinearGradient(0,h*.6,0,h);dg.addColorStop(0,'rgba(90,75,55,0)');dg.addColorStop(1,'rgba(90,75,55,.28)');x.fillStyle=dg;x.fillRect(0,0,w,h);}
  // saçak silmesi, kat silmesi ve kesme taş kaide
  function bands(x,w,h,b,stone){x.fillStyle='#EFE6D2';x.fillRect(0,0,w,20);x.fillStyle='rgba(60,45,30,.45)';x.fillRect(0,20,w,7);x.fillStyle='rgba(60,45,30,.18)';x.fillRect(0,27,w,8);b.fillStyle='#C8C8C8';b.fillRect(0,0,w,20);b.fillStyle='#404040';b.fillRect(0,20,w,7);
    x.fillStyle='#E9DFCA';x.fillRect(0,248,w,12);x.fillStyle='rgba(60,45,30,.35)';x.fillRect(0,260,w,4);b.fillStyle='#B0B0B0';b.fillRect(0,248,w,12);
    var P=h-58;for(var r=0;r<2;r++){var yy=P+r*29,off=r?32:0;for(var xx=-off;xx<w;xx+=64){var s=150+CR()*30;x.fillStyle='rgb('+Math.round(s)+','+Math.round(s*.9)+','+Math.round(s*.76)+')';x.fillRect(xx+1,yy+1,62,27);
      x.fillStyle='rgba(255,250,235,.15)';x.fillRect(xx+1,yy+1,62,3);b.fillStyle='#9a9a9a';b.fillRect(xx+2,yy+2,60,25);}}
    x.fillStyle='rgba(70,60,45,.55)';for(r=0;r<=2;r++)x.fillRect(0,P+r*29,w,1.5);x.fillStyle='#D5C8AE';x.fillRect(0,P-6,w,6);}
  // pencere: taş söve, iki kanatlı çerçeve, gökyüzünü yansıtan cam; altında yağmur izi
  function win(x,b,cx,top,ww,hh,arch,brickArch){var l=cx-ww/2;
    if(arch){if(brickArch){for(var k=0;k<=12;k++){var a=Math.PI+k/12*Math.PI;x.save();x.translate(cx,top+ww/2);x.rotate(a+Math.PI/2);x.fillStyle=k%2?'#A65B3A':'#B86A45';x.fillRect(-4,ww/2+2,8,16);x.restore();}}
      x.fillStyle='#EFE8DA';x.beginPath();x.arc(cx,top+ww/2,ww/2+8,Math.PI,0);x.lineTo(cx+ww/2+8,top+hh+6);x.lineTo(cx-ww/2-8,top+hh+6);x.closePath();x.fill();}
    else{x.fillStyle='#EFE8DA';x.fillRect(l-9,top-9,ww+18,hh+18);x.fillStyle='rgba(60,45,30,.35)';x.fillRect(l-9,top+hh+9,ww+18,5);}
    b.fillStyle='#B4B4B4';b.fillRect(l-9,top-9,ww+18,hh+18);
    var gl=x.createLinearGradient(l,top,l+ww,top+hh);gl.addColorStop(0,'#5E7684');gl.addColorStop(.45,'#2C3A42');gl.addColorStop(.55,'#3E505A');gl.addColorStop(1,'#1F282D');x.fillStyle=gl;
    x.beginPath();if(arch){x.arc(cx,top+ww/2,ww/2,Math.PI,0);x.lineTo(l+ww,top+hh);x.lineTo(l,top+hh);x.closePath();}else x.rect(l,top,ww,hh);x.fill();
    b.fillStyle='#303030';b.fill();
    x.strokeStyle='#F4F1EA';x.lineWidth=3;x.beginPath();x.moveTo(cx,arch?top+4:top);x.lineTo(cx,top+hh);x.moveTo(l,top+hh*.42);x.lineTo(l+ww,top+hh*.42);x.stroke();x.lineWidth=2;x.strokeRect(l+1,(arch?top+ww/2:top)+1,ww-2,hh-(arch?ww/2:0)-2);
    // denizlik ve yağmur izi
    x.fillStyle='#E4DAC6';x.fillRect(l-12,top+hh+2,ww+24,7);var rs=x.createLinearGradient(0,top+hh+9,0,top+hh+90);rs.addColorStop(0,'rgba(80,70,55,.22)');rs.addColorStop(1,'rgba(80,70,55,0)');x.fillStyle=rs;for(var s=0;s<5;s++)x.fillRect(l-6+s*(ww+12)/5+CR()*6,top+hh+9,3+CR()*5,60+CR()*30);}
  var plaster=tex(512,512,function(x,w,h,b){plasterBase(x,w,h,'#E6D6B4');bands(x,w,h,b);[128,384].forEach(function(cx){win(x,b,cx,62,64,140,false);win(x,b,cx,300,64,140,false);});});
  // Taş cephe: kaba yonu taş sıraları arasında üçer sıra tuğla hatıl (almaşık), kemerli pencereler
  function masonry(x,w,h,b){x.fillStyle='#A99C84';x.fillRect(0,0,w,h);var y=24,course=0;
    while(y<h){if(course%4===3){for(var r=0;r<3;r++){for(var xx=-(r%2)*14;xx<w;xx+=28){var s=CR();x.fillStyle='rgb('+Math.round(160+s*30)+','+Math.round(82+s*20)+','+Math.round(54+s*14)+')';x.fillRect(xx+1,y+1,26,6);b.fillStyle='#909090';b.fillRect(xx+1,y+1,26,6);}y+=8;}}
      else{var ch=26+CR()*12,xx2=-CR()*40;while(xx2<w){var cw=34+CR()*50,s2=CR();x.fillStyle='rgb('+Math.round(175+s2*40)+','+Math.round(160+s2*36)+','+Math.round(130+s2*30)+')';x.beginPath();x.moveTo(xx2+2,y+2+CR()*2);x.lineTo(xx2+cw-2,y+1+CR()*3);x.lineTo(xx2+cw-1-CR()*3,y+ch-2);x.lineTo(xx2+1+CR()*3,y+ch-1);x.closePath();x.fill();
        x.fillStyle='rgba(255,250,235,.12)';x.fillRect(xx2+3,y+3,cw-6,3);b.fillStyle='#a0a0a0';b.fillRect(xx2+3,y+3,cw-6,ch-6);xx2+=cw;}y+=ch;}course++;}
    specks(x,w,h,3000,['rgba(80,70,55,.15)','rgba(255,250,235,.12)'],.6,2);
    var dg=x.createLinearGradient(0,h*.55,0,h);dg.addColorStop(0,'rgba(70,60,45,0)');dg.addColorStop(1,'rgba(70,60,45,.3)');x.fillStyle=dg;x.fillRect(0,0,w,h);
    x.fillStyle='#E4DAC4';x.fillRect(0,0,w,18);x.fillStyle='rgba(50,40,30,.45)';x.fillRect(0,18,w,6);}
  var stone=tex(512,512,function(x,w,h,b){masonry(x,w,h,b);[128,384].forEach(function(cx){win(x,b,cx,70,60,130,true,true);win(x,b,cx,300,60,140,true,true);});});
  var blind=tex(512,512,function(x,w,h,b){masonry(x,w,h,b);[128,384].forEach(function(cx){x.fillStyle='rgba(40,35,30,.7)';x.fillRect(cx-14,140,28,10);x.fillRect(cx-14,380,28,10);});});
  // alaturka kiremit: yarım silindir sıralar, renk farkı, yosun ve kir
  var tiles=tex(256,256,function(x,w,h,b){x.fillStyle='#8E4A32';x.fillRect(0,0,w,h);for(var y=0;y<h;y+=24)for(var c=0;c<w;c+=16){var over=(c/16)%2===0,s=CR(),base=[[176,92,62],[160,78,52],[188,104,70],[150,84,58]][Math.floor(CR()*4)];
      var gx=x.createLinearGradient(c,0,c+16,0),k=over?1:.82;gx.addColorStop(0,'rgb('+Math.round(base[0]*.62*k)+','+Math.round(base[1]*.6*k)+','+Math.round(base[2]*.6*k)+')');gx.addColorStop(.45,'rgb('+Math.round(base[0]*k)+','+Math.round(base[1]*k)+','+Math.round(base[2]*k)+')');gx.addColorStop(1,'rgb('+Math.round(base[0]*.55*k)+','+Math.round(base[1]*.55*k)+','+Math.round(base[2]*.55*k)+')');
      x.fillStyle=gx;x.fillRect(c+(over?0:1),y+(over?0:2),over?16:14,24);x.fillStyle='rgba(30,15,8,.35)';x.fillRect(c,y+22,16,2);
      var gb=b.createLinearGradient(c,0,c+16,0);gb.addColorStop(0,over?'#707070':'#404040');gb.addColorStop(.5,over?'#e0e0e0':'#909090');gb.addColorStop(1,over?'#707070':'#404040');b.fillStyle=gb;b.fillRect(c,y,16,24);
      if(s<.12){x.fillStyle='rgba(80,90,50,.35)';x.fillRect(c+2,y+14,10,9);}}
    specks(x,w,h,1500,['rgba(40,30,20,.18)','rgba(230,200,170,.12)'],.6,1.6);});
  tiles.repeat.set(3,3);tiles.userData.bump.repeat.set(3,3);
  // kurşun örtü: dikey ek yerleri, beyazımsı oksit lekeleri
  var lead=tex(256,256,function(x,w,h,b){x.fillStyle='#868C90';x.fillRect(0,0,w,h);_blot(x,w,h,24,['rgba(200,205,205,A)','rgba(70,75,80,A)'],10,60,.3,CR);for(var c=0;c<w;c+=32){x.fillStyle='rgba(230,232,232,.35)';x.fillRect(c,0,2,h);x.fillStyle='rgba(30,32,34,.35)';x.fillRect(c+2,0,2,h);b.fillStyle='#e0e0e0';b.fillRect(c,0,3,h);}
    for(var y=0;y<h;y+=64){x.fillStyle='rgba(30,32,34,.25)';x.fillRect(0,y,w,1.5);}specks(x,w,h,800,['rgba(255,255,255,.12)','rgba(0,0,0,.1)'],.6,1.6);});
  function wallMat(t,len){var m=t.clone();m.needsUpdate=true;m.repeat.set(Math.max(1,Math.round(len/.9)),1);var bm=t.userData.bump.clone();bm.needsUpdate=true;bm.repeat.copy(m.repeat);return new THREE.MeshStandardMaterial({map:m,bumpMap:bm,bumpScale:.012,roughness:.92});}
  function roofMat_(t,o){o=o||{};return new THREE.MeshStandardMaterial({map:t,bumpMap:t.userData.bump,bumpScale:o.bump||.02,roughness:o.rough||.85,metalness:o.metal||0,transparent:!!o.transparent});}
  var endTex=tex(256,256,function(x,w,h,b){plasterBase(x,w,h,'#E2D2B0');x.fillStyle='#EFE6D2';x.fillRect(0,0,w,10);x.fillStyle='rgba(60,45,30,.4)';x.fillRect(0,10,w,4);});
  var endM=new THREE.MeshStandardMaterial({map:endTex,bumpMap:endTex.userData.bump,bumpScale:.01,roughness:.92});
  // Kırma çatı (dört yana eğimli), saçak taşmalı
  function hipRoof(w,d,h,mat){var o=.14;w+=2*o;d+=2*o;var a=w>=d,r=(a?d:w)/2,P=[],U=[];
    var A=[-w/2,0,-d/2],B=[w/2,0,-d/2],C=[w/2,0,d/2],D=[-w/2,0,d/2],R1=a?[-w/2+r,h,0]:[0,h,-d/2+r],R2=a?[w/2-r,h,0]:[0,h,d/2-r];
    function tri(p,q,s){[p,q,s].forEach(function(v){P.push(v[0],v[1],v[2]);U.push(v[0]*.5,v[2]*.5+v[1]*.8);});}
    if(a){tri(D,C,R2);tri(D,R2,R1);tri(B,A,R1);tri(B,R1,R2);tri(A,D,R1);tri(C,B,R2);}else{tri(A,D,R1);tri(D,R2,R1);tri(C,B,R2);tri(B,R1,R2);tri(D,C,R2);tri(B,A,R1);}
    var geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));geo.computeVertexNormals();
    var m=new THREE.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;return m;}
  // Dolu kanat: uzun kenarlarda pencereli cephe
  function wing(x0,z0,x1,z1,h,face,roofH,roofMat){var w=x1-x0,d=z1-z0,alongX=w>=d,len=alongX?w:d,dep=alongX?d:w,fm=wallMat(face||plaster,len),em=wallMat(face||plaster,dep);
    var mats=alongX?[em,em,endM,endM,fm,fm]:[fm,fm,endM,endM,em,em];var b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mats);b.position.set((x0+x1)/2,h/2,(z0+z1)/2);b.castShadow=b.receiveShadow=true;g.add(b);
    var r=hipRoof(w,d,roofH||.45,roofMat||roofMat_(tiles));r.position.set((x0+x1)/2,h,(z0+z1)/2);g.add(r);return {body:b,roof:r};}
  // İçi görülebilen kanat: ince duvarlar, döşeme; çatısı seçilince saydamlaşır
  function shell(x0,z0,x1,z1,h,outer,inner){var gr=new THREE.Group(),wg=new THREE.Group(),t=.1,w=x1-x0,d=z1-z0;g.add(gr);gr.add(wg);
    var fl=new THREE.Mesh(new THREE.BoxGeometry(w,.04,d),new THREE.MeshStandardMaterial({color:0xD8D2C4,roughness:.9}));fl.position.set((x0+x1)/2,.02,(z0+z1)/2);fl.receiveShadow=true;gr.add(fl);
    function wall(cx,cz,ww,dd,face,len){var m=face?wallMat(face,len):endM;var b=new THREE.Mesh(new THREE.BoxGeometry(ww,h,dd),m);b.position.set(cx,h/2,cz);b.castShadow=b.receiveShadow=true;wg.add(b);}
    wall(x0+t/2,(z0+z1)/2,t,d,outer,d);wall(x1-t/2,(z0+z1)/2,t,d,inner,d);wall((x0+x1)/2,z0+t/2,w,t,null);wall((x0+x1)/2,z1-t/2,w,t,null);
    var rm=roofMat_(tiles,{transparent:true});var r=hipRoof(w,d,.45,rm);r.position.set((x0+x1)/2,h,(z0+z1)/2);g.add(r);
    return {g:gr,wg:wg,floor:fl,roof:r,rm:rm};}

  /* --- Zemin ve avlu --- */
  var groundM;
  // zemin: büyük taş döşeme
  var pave=tex(256,256,function(x,w,h,b){x.fillStyle='#7F7A6D';x.fillRect(0,0,w,h);for(var y=0;y<h;y+=32)for(var xx=-(y/32%2)*24;xx<w;xx+=48){var s=CR();x.fillStyle='rgb('+Math.round(150+s*30)+','+Math.round(144+s*28)+','+Math.round(128+s*26)+')';x.fillRect(xx+1.5,y+1.5,45,29);b.fillStyle='#a8a8a8';b.fillRect(xx+2,y+2,44,28);}
    specks(x,w,h,2500,['rgba(60,55,45,.18)','rgba(240,235,220,.15)'],.6,1.6);});pave.repeat.set(24,24);pave.userData.bump.repeat.set(24,24);
  var groundM;var ground=new THREE.Mesh(new THREE.BoxGeometry(2*X+3,.3,2*Z+3.6),(groundM=new THREE.MeshStandardMaterial({map:pave,bumpMap:pave.userData.bump,bumpScale:.01,roughness:1,transparent:true})));ground.position.set(0,-.17,.3);ground.receiveShadow=true;g.add(ground);
  var CX=X-WD-.05,CZ=Z-WD-.05;
  // avlu: biçilmiş çim, taş döşeli yollar (kenar taşlı), gölgeli kenarlar
  var paveSmall=document.createElement('canvas');paveSmall.width=paveSmall.height=48;(function(){var x=paveSmall.getContext('2d');x.fillStyle='#A69E8C';x.fillRect(0,0,48,48);for(var y=0;y<48;y+=12)for(var xx=-(y/12%2)*8;xx<48;xx+=16){var s=CR();x.fillStyle='rgb('+Math.round(205+s*30)+','+Math.round(196+s*28)+','+Math.round(176+s*24)+')';x.fillRect(xx+1,y+1,14,10);}})();
  var yard=tex(1536,1320,function(x,w,h,b){x.fillStyle='#62803F';x.fillRect(0,0,w,h);_blot(x,w,h,80,['rgba(90,120,60,A)','rgba(70,95,45,A)','rgba(120,140,70,A)'],30,160,.35,CR);
    for(var st=0;st<w;st+=96){x.fillStyle=(st/96)%2?'rgba(255,255,230,.04)':'rgba(0,0,0,.04)';x.fillRect(st,0,96,h);}
    x.lineCap='round';for(var i=0;i<26000;i++){var gx=CR()*w,gy=CR()*h,l=2+CR()*4,a=-1.6+(CR()-.5)*.8;x.strokeStyle=CR()<.5?'rgba(40,70,25,.35)':'rgba(150,180,100,.3)';x.lineWidth=.8;x.beginPath();x.moveTo(gx,gy);x.lineTo(gx+Math.cos(a)*l,gy+Math.sin(a)*l);x.stroke();}
    var sc=w/1024,P=x.createPattern(paveSmall,'repeat');
    function paths(lw){x.lineWidth=lw;x.strokeRect(40*sc,40*sc,w-80*sc,h-80*sc);x.beginPath();x.moveTo(w/2,40*sc);x.lineTo(w/2,h-40*sc);x.stroke();x.beginPath();x.ellipse(w/2,h/2,w*.36,h*.34,0,0,Math.PI*2);x.stroke();
      [[0,0],[w,0],[0,h],[w,h]].forEach(function(c){x.beginPath();x.moveTo(c[0]?w-40*sc:40*sc,c[1]?h-40*sc:40*sc);x.quadraticCurveTo(w/2+(c[0]?140:-140)*sc,h/2+(c[1]?60:-60)*sc,w/2+(c[0]?60:-60)*sc,h/2+(c[1]?30:-30)*sc);x.stroke();});}
    function paths2(lw){x.lineWidth=lw;for(var k=0;k<6;k++){var y=(120+k*120)*h/880;x.beginPath();x.moveTo(120*sc,y);x.bezierCurveTo(300*sc,y-80*sc,420*sc,y+90*sc,w/2-70*sc,y);x.stroke();x.beginPath();x.moveTo(w-120*sc,y);x.bezierCurveTo(w-300*sc,y+80*sc,w-420*sc,y-90*sc,w/2+70*sc,y);x.stroke();}}
    x.strokeStyle='rgba(40,50,30,.35)';paths(16*sc+10);paths2(8*sc+8);x.strokeStyle='#8C8676';paths(16*sc+4);paths2(8*sc+4);x.strokeStyle=P;paths(16*sc);paths2(8*sc);});
  yard.wrapS=yard.wrapT=THREE.ClampToEdgeWrapping;
  var yardM=new THREE.MeshStandardMaterial({map:yard,roughness:1,transparent:true});var yardP=new THREE.Mesh(new THREE.PlaneGeometry(2*CX,2*CZ),yardM);yardP.rotation.x=-Math.PI/2;yardP.position.y=.01;yardP.receiveShadow=true;g.add(yardP);
  // ağaçlar: yumrulu taç, gövde, her ağaçta farklı yeşil tonu
  var crownG=new THREE.SphereGeometry(.3,18,14),cp=crownG.attributes.position;for(var vi=0;vi<cp.count;vi++){var vx=cp.getX(vi),vy=cp.getY(vi),vz=cp.getZ(vi),n=1+.16*Math.sin(vx*19+vy*11)*Math.cos(vz*17-vy*7)+.08*Math.sin(vx*41+vz*37);cp.setXYZ(vi,vx*n,vy*n*.92,vz*n);}crownG.computeVertexNormals();
  var tg=new THREE.InstancedMesh(crownG,new THREE.MeshStandardMaterial({color:0xffffff,roughness:.95}),70),tk=new THREE.InstancedMesh(new THREE.CylinderGeometry(.035,.05,.4,7),new THREE.MeshStandardMaterial({color:0x5A4634,roughness:1}),70),mt=new THREE.Matrix4(),q=0,tcol=new THREE.Color();tg.castShadow=true;tk.castShadow=true;
  for(var i=0;i<70;i++){var a=i/70*Math.PI*2,rx=CX*.72+Math.sin(i*7.3)*.6,rz=CZ*.68+Math.cos(i*5.1)*.6,px=Math.cos(a)*rx,pz=Math.sin(a)*rz;if(Math.abs(px)<3.6&&Math.abs(pz)<3)continue;var s=.8+((i*37)%10)/20;
    mt.makeRotationY(i*1.7);mt.scale(new THREE.Vector3(s,s*1.1,s));mt.setPosition(px,.5*s,pz);tg.setMatrixAt(q,mt);tcol.setHSL(.25+CR()*.07,.35+CR()*.15,.24+CR()*.1);tg.setColorAt(q,tcol);
    mt.makeScale(s,s,s);mt.setPosition(px,.2*s,pz);tk.setMatrixAt(q,mt);q++;}tg.count=tk.count=q;g.add(tg);g.add(tk);

  /* --- Avlunun ortasındaki yeni yapı: toprağa gömülü arşiv, iki eğimli çatı plakası --- */
  var arch=new THREE.Group();g.add(arch);var grassT=tex(256,256,function(x,w,h,b){x.fillStyle='#5E7B3C';x.fillRect(0,0,w,h);_blot(x,w,h,20,['rgba(90,120,60,A)','rgba(60,85,40,A)'],10,60,.4,CR);for(var i=0;i<5000;i++){var gx=CR()*w,gy=CR()*h;x.fillStyle=CR()<.5?'rgba(35,60,22,.4)':'rgba(150,180,100,.3)';x.fillRect(gx,gy,1,3);}}),plateM=new THREE.MeshStandardMaterial({map:grassT,roughness:1,transparent:true}),edgeM=new THREE.MeshStandardMaterial({color:0xBDB8AE,roughness:.7,transparent:true});
  [-1,1].forEach(function(sd){var p=new THREE.Mesh(new THREE.BoxGeometry(2.5,.12,5.2),[edgeM,edgeM,plateM,edgeM,edgeM,edgeM]);p.position.set(sd*1.55,.32,0);p.rotation.z=sd*-.12;p.castShadow=p.receiveShadow=true;arch.add(p);});
  var glassM=new THREE.MeshStandardMaterial({color:0x9FC3D0,roughness:.15,metalness:.2,transparent:true,opacity:.75});var allee=new THREE.Mesh(new THREE.BoxGeometry(.5,.06,5.2),glassM);allee.position.y=.05;arch.add(allee);
  var under=new THREE.Group();under.visible=false;g.add(under);
  var ub=new THREE.Mesh(new THREE.BoxGeometry(5.6,1.3,5.4),new THREE.MeshStandardMaterial({color:0x173B47,transparent:true,opacity:.55,depthWrite:false}));ub.position.y=-.66;under.add(ub);
  var shM=new THREE.MeshStandardMaterial({color:0xE9E6DE,roughness:.6,emissive:0x2a5a70,emissiveIntensity:.6});for(var r=0;r<9;r++){var sh=new THREE.Mesh(new THREE.BoxGeometry(.22,.9,4.6),shM);sh.position.set(-2.3+r*.58,-.75,0);under.add(sh);}

  /* --- Kanatlar (plan: kare avlu çevresinde kanatlar, köşe ve orta köşkler) --- */
  var roofT=roofMat_(tiles);
  wing(-X+2.2,Z-WD,-1.7,Z,H,plaster);wing(1.7,Z-WD,X-2.2,Z,H,plaster);            // ön kanat (Hünkâr Kasrı iki yanı)
  wing(-X+2.2,-Z,X-2.2,-Z+WD,H,plaster);                                          // arka kanat
  wing(X-WD,-Z+2.2,X,-1.4,H,plaster);wing(X-WD,1.4,X,Z-2.2,H,plaster);             // sağ kanat
  wing(X-WD-.25,-1.4,X+.25,1.4,H*1.22,plaster,.5);wing(-1.4,-Z-.25,1.4,-Z+WD+.25,H*1.22,plaster,.5); // orta köşkler
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(c){var cx=c[0]*(X-1.1),cz=c[1]*(Z-1.1);wing(cx-1.2,cz-1.2,cx+1.2,cz+1.2,H*1.3,plaster,.6);});   // köşe köşkleri
  // Sol (kuzey) kanat, iki şerit: avlu tarafında atölyeler + cam koridor, arkada depolar
  var LX0=-X,LX1=-X+1.35,IX0=-X+1.55,IX1=-X+3.0,LZ0=-Z+2.2,LZ1=Z-2.2;
  var dep=shell(LX0,LZ0,LX1,LZ1,H,blind,stone),lab=shell(IX0,LZ0,IX1,LZ1,H,stone,stone);
  var link=new THREE.Mesh(new THREE.BoxGeometry(IX0-LX1+.02,H*.9,LZ1-LZ0),new THREE.MeshStandardMaterial({color:0xC9BCA0,roughness:.9}));link.position.set((LX1+IX0)/2,H*.45,0);g.add(link);
  // atölye odaları (101, 102, 105, 106, 108) ve avlu yanındaki koridor
  // atölye → sitedeki ilgili bölüm
  var ROOMS=[['101','Cilt ve kutu','#uygulamalar'],['102','Tamamlama','#tedavi'],['105','Temizlik ve malzeme hazırlığı','#malzemeler'],['106','Durum tespiti ve sağlamlaştırma','#belgeleme'],['108','Eski onarım çıkarma','#uygulamalar']],roomG=[],roomM=[];
  var rooms=ROOMS.map(function(r){return r[0];}),RL=(LZ1-LZ0-.3)/5,benchM=new THREE.MeshStandardMaterial({color:0xF2F0EA,roughness:.6}),labGlow=new THREE.MeshStandardMaterial({color:0xE9D7A9,roughness:.8,emissive:0x000000});
  rooms.forEach(function(nm,k){var z0=LZ0+.15+k*RL,cz=z0+RL/2,rg=new THREE.Group(),rgm=labGlow.clone();lab.g.add(rg);roomG.push({g:rg,cz:cz});roomM.push(rgm);
    var part=new THREE.Mesh(new THREE.BoxGeometry(IX1-IX0-.45,H,.06),endM);part.position.set(IX0+(IX1-IX0-.45)/2,H/2,z0);lab.wg.add(part);
    var fl=new THREE.Mesh(new THREE.BoxGeometry(IX1-IX0-.55,.03,RL-.1),labGlow);fl.material=rgm;fl.position.set(IX0+.05+(IX1-IX0-.55)/2,.05,cz);rg.add(fl);
    for(var b=0;b<2;b++){var bn=new THREE.Mesh(new THREE.BoxGeometry(.32,.18,.7),benchM);bn.position.set(IX0+.3,.12,cz+(b?.45:-.45)*RL/2);bn.castShadow=true;rg.add(bn);}
    var lb=document.createElement('canvas');lb.width=128;lb.height=64;var c2=lb.getContext('2d');c2.fillStyle='#1E5F51';c2.font='600 40px "IBM Plex Mono",monospace';c2.textAlign='center';c2.fillText(nm,64,46);
    var tx=new THREE.CanvasTexture(lb);var pl=new THREE.Mesh(new THREE.PlaneGeometry(.9,.45),new THREE.MeshBasicMaterial({map:tx,transparent:true}));pl.rotation.x=-Math.PI/2;pl.rotation.z=Math.PI/2;pl.position.set(IX0+.95,.09,cz);rg.add(pl);});
  var corr=new THREE.Mesh(new THREE.BoxGeometry(.4,.03,LZ1-LZ0-.2),new THREE.MeshStandardMaterial({color:0x9FC3D0,roughness:.3,emissive:0x000000}));corr.position.set(IX1-.3,.05,0);lab.g.add(corr);
  // depolar: kompakt raf blokları, sabit iklimli kapalı bölmeler
  var depGlow=new THREE.MeshStandardMaterial({color:0xBFD6E2,roughness:.8,emissive:0x000000});var df=new THREE.Mesh(new THREE.BoxGeometry(LX1-LX0-.2,.03,LZ1-LZ0-.2),depGlow);df.position.set((LX0+LX1)/2,.05,0);dep.g.add(df);
  var rackM=new THREE.MeshStandardMaterial({color:0xEDEBE4,roughness:.55});for(var zz=LZ0+.5;zz<LZ1-.4;zz+=.32){var rk=new THREE.Mesh(new THREE.BoxGeometry(LX1-LX0-.45,.62,.2),rackM);rk.position.set((LX0+LX1)/2,.36,zz);rk.castShadow=true;dep.g.add(rk);}

  /* --- Hünkâr Kasrı: beyaz, alınlıklı, sütunlu ana giriş --- */
  var kasr=new THREE.Group();kasr.position.set(0,0,Z-.6);g.add(kasr);
  var white=tex(512,512,function(x,w,h,b){plasterBase(x,w,h,'#F1ECE1');bands(x,w,h,b);x.fillStyle='rgba(255,255,255,.25)';x.fillRect(0,0,w,h);[128,384].forEach(function(cx){win(x,b,cx,70,58,130,true);win(x,b,cx,300,58,140,true);});});
  var km=[],kw=wallMat(white,3.4),kd=wallMat(white,2.6);km.push(kw,kd);
  var kb=new THREE.Mesh(new THREE.BoxGeometry(3.4,1.8,2.6),[kd,kd,endM,endM,kw,kw]);kb.position.y=.9;kb.castShadow=kb.receiveShadow=true;kasr.add(kb);
  var leadM=roofMat_(lead,{metal:.35,rough:.55,bump:.015});km.push(leadM);var kr=hipRoof(3.4,2.6,.35,leadM);kr.position.y=1.8;kasr.add(kr);
  var ashlar=tex(256,256,function(x,w,h,b){plasterBase(x,w,h,'#EEE9DE');x.fillStyle='rgba(255,255,255,.3)';x.fillRect(0,0,w,h);x.strokeStyle='rgba(120,110,95,.35)';x.lineWidth=1.2;for(var y=0;y<h;y+=32){x.beginPath();x.moveTo(0,y);x.lineTo(w,y);x.stroke();for(var xx=(y/32%2)*40;xx<w;xx+=80){x.beginPath();x.moveTo(xx,y);x.lineTo(xx,y+32);x.stroke();}b.fillStyle='#606060';b.fillRect(0,y,w,1.5);}});ashlar.repeat.set(2,2);ashlar.userData.bump.repeat.set(2,2);
  var whiteM=new THREE.MeshStandardMaterial({map:ashlar,bumpMap:ashlar.userData.bump,bumpScale:.008,roughness:.75});km.push(whiteM);
  var ris=new THREE.Mesh(new THREE.BoxGeometry(1.5,1.95,.35),whiteM);ris.position.set(0,.975,1.45);ris.castShadow=true;kasr.add(ris);
  var ped=new THREE.Shape();ped.moveTo(-.85,0);ped.lineTo(.85,0);ped.lineTo(0,.42);ped.lineTo(-.85,0);var pg=new THREE.ExtrudeGeometry(ped,{depth:.4,bevelEnabled:false});var pm=new THREE.Mesh(pg,whiteM);pm.position.set(0,1.95,1.25);pm.castShadow=true;kasr.add(pm);
  var flute=tex(128,64,function(x,w,h,b){x.fillStyle='#F4F1E9';x.fillRect(0,0,w,h);for(var i=0;i<w;i+=8){var gg=x.createLinearGradient(i,0,i+8,0);gg.addColorStop(0,'rgba(120,110,95,.25)');gg.addColorStop(.5,'rgba(255,255,255,.2)');gg.addColorStop(1,'rgba(120,110,95,.25)');x.fillStyle=gg;x.fillRect(i,0,8,h);b.fillStyle=gg;}specks(x,w,h,300,['rgba(120,110,95,.15)'],.5,1.4);}),colM=new THREE.MeshStandardMaterial({map:flute,roughness:.55});for(var cI=0;cI<4;cI++){var col=new THREE.Mesh(new THREE.CylinderGeometry(.07,.08,1.15,12),colM);col.position.set(-.66+cI*.44,.575,2.0);col.castShadow=true;kasr.add(col);}
  var ent=new THREE.Mesh(new THREE.BoxGeometry(1.6,.1,.75),whiteM);ent.position.set(0,1.2,1.85);ent.castShadow=true;kasr.add(ent);
  var door=new THREE.Mesh(new THREE.PlaneGeometry(.36,.6),new THREE.MeshStandardMaterial({color:0x3A2A22}));door.position.set(0,.3,1.63);kasr.add(door);

  /* --- Pusula --- */
  var cm=document.createElement('canvas');cm.width=cm.height=128;var cc=cm.getContext('2d');cc.strokeStyle='#2A2E2C';cc.fillStyle='#2A2E2C';cc.lineWidth=3;cc.beginPath();cc.arc(64,64,40,0,7);cc.stroke();
  cc.beginPath();cc.moveTo(64,16);cc.lineTo(74,64);cc.lineTo(54,64);cc.fill();cc.font='600 26px "IBM Plex Mono",monospace';cc.textAlign='center';cc.fillText('K',64,122);
  var comp=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cm),transparent:true,depthWrite:false}));comp.rotation.x=-Math.PI/2;comp.rotation.z=Math.PI/2;comp.position.set(-X-.2,.012,Z+1.15);comp.scale.set(.55,.55,.55);g.add(comp);

  /* --- Bölgeler: seçilince parlar, çatı saydamlaşır, kamera odaklanır --- */
  var Z3=THREE.Vector3,ZN=[
   {id:'kasr',n:'Hünkâr Kasrı · ana giriş',pin:new Z3(0,2.42,Z+.85),mats:km,look:[new Z3(0,1,Z-1),8*D2R,22*D2R,.62]},
   {id:'lab',n:'Kitap Şifahanesi atölyeleri',pin:new Z3((IX0+IX1)/2,H+.42,-5.6),shell:lab,mats:roomM.concat([corr.material]),look:[new Z3(-X+2.3,0,0),62*D2R,64*D2R,.4]},
   {id:'dep',n:'Yazma eser depoları',pin:new Z3((LX0+LX1)/2,H+.4,5.4),shell:dep,mats:[depGlow],look:[new Z3(-X+.7,0,0),-62*D2R,64*D2R,.4]},
   {id:'arc',n:'Avlu altı arşiv',pin:new Z3(0,.45,1.4),mats:[shM],look:[new Z3(0,-.4,0),-24*D2R,40*D2R,.55]}];
  var cur=null,tt=0,hl=new THREE.Color(0x6a4a10);
  V.updaters.push(function(dt){tt+=dt;var k=.55+.45*Math.sin(tt*4);
    ZN.forEach(function(z){var on=cur===z;z.mats.forEach(function(m){if(m.emissive){if(on)m.emissive.setRGB(.5*k,.33*k,.08*k);else if(m!==shM)m.emissive.multiplyScalar(Math.exp(-6*dt));}});
      if(z.shell){var o=on?0:1;z.shell.rm.opacity=damp(z.shell.rm.opacity,o,6,dt);z.shell.rm.depthWrite=z.shell.rm.opacity>.5;z.shell.roof.visible=z.shell.rm.opacity>.02;z.shell.wg.scale.y=damp(z.shell.wg.scale.y,on?.3:1,5,dt);}});
    var ua=cur&&cur.id==='arc';under.visible=ua||yardM.opacity<.97;yardM.opacity=damp(yardM.opacity,ua?.18:1,5,dt);plateM.opacity=edgeM.opacity=damp(plateM.opacity,ua?.35:1,5,dt);groundM.opacity=damp(groundM.opacity,ua?.25:1,5,dt);groundM.depthWrite=groundM.opacity>.9;yardM.depthWrite=yardM.opacity>.9;});
  var list=document.getElementById('campus-list'),btns=[];
  ZN.forEach(function(z,i){var el=document.createElement('button');el.type='button';el.className='hs';el.innerHTML='<i>'+(i+1)+'</i><span>'+z.n+'</span>';el.setAttribute('aria-label',z.n);host.appendChild(el);
    V.overlay.push({el:el,obj:g,local:z.pin});el.addEventListener('click',function(){select(i);});z.el=el;});
  [].slice.call(list.querySelectorAll('[data-zone]')).forEach(function(card){var i=+card.dataset.zone;card.querySelector('.zn-h').addEventListener('click',function(){select(i);});btns.push(card);});
  // bilgi kutusu: seçili bölgeye göre değişir
  var FK=['Hünkâr Kasrı','Atölyeler','Depolar','Avlu altı arşiv'],fls=[].slice.call(document.querySelectorAll('#campus-facts ul')),fk=document.getElementById('facts-k');
  function facts(k){fls.forEach(function(u){u.hidden=u.dataset.f!==String(k);});if(fk)fk.textContent=k==='all'?'Tüm yerleşke':FK[k];}
  function select(i){cur=ZN[i];facts(i);V.poke();V.focus(cur.look[0],cur.look[1],cur.look[2],cur.look[3]);
    ZN.forEach(function(z,k){z.el.classList.toggle('on',k===i);});btns.forEach(function(b){b.classList.toggle('on',+b.dataset.zone===i);b.querySelector('.zn-h').setAttribute('aria-expanded',+b.dataset.zone===i);});}
  var reset=document.getElementById('campus-reset');if(reset)reset.addEventListener('click',function(){cur=null;facts('all');V.focus();ZN.forEach(function(z){z.el.classList.remove('on');});btns.forEach(function(b){b.classList.remove('on');b.querySelector('.zn-h').setAttribute('aria-expanded','false');});});
  // tıklama: sahnedeki bölgeye tıklanınca seç
  function goTo(sel){var el=document.querySelector(sel);if(el)el.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});}
  var hot=-1;
  ROOMS.forEach(function(r,k){var el=document.createElement('button');el.type='button';el.className='hs room';el.innerHTML='<i>'+r[0]+'</i><span>'+r[1]+' →</span>';el.setAttribute('aria-label',r[0]+' atölyesi: '+r[1]+' bölümüne git');host.appendChild(el);
    V.overlay.push({el:el,obj:g,local:new THREE.Vector3(IX0+.95,.32,roomG[k].cz),when:function(){return cur===ZN[1];}});
    el.addEventListener('click',function(){goTo(r[2]);});el.addEventListener('mouseenter',function(){hot=k;});el.addEventListener('mouseleave',function(){hot=-1;});
    V.pick([roomG[k].g],function(){if(cur===ZN[1])goTo(r[2]);else select(1);});});
  V.updaters.push(function(dt){roomM.forEach(function(m,k){if(cur===ZN[1]&&k===hot)m.emissive.setRGB(.55,.36,.08);});});
  V.pick([kasr],function(){select(0);});V.pick([lab.g,lab.roof],function(){select(1);});V.pick([dep.g,dep.roof],function(){select(2);});V.pick([arch],function(){select(3);});
});
/* ---------- Diğer yazma eser biçimleri: ferman (tomar), murakka, cönk ---------- */
// Ortak: parça listesi, sahnedeki iğneler, seçilen parçanın parlaması
function partsUI(V,host,list,out,P){var btns=[],cur=-1,tt=0;
  P.forEach(function(p,i){var el=document.createElement('button');el.type='button';el.className='hs';el.innerHTML='<i>'+(i+1)+'</i><span>'+p.n+'</span>';el.setAttribute('aria-label',p.n);host.appendChild(el);
    V.overlay.push({el:el,obj:p.obj,local:p.at,normal:p.normal||null,when:p.when||null});var lb=document.createElement('button');lb.type='button';lb.textContent=p.n;list.appendChild(lb);btns.push([el,lb]);
    function go(){choose(i);}el.addEventListener('click',go);lb.addEventListener('click',go);});
  V.updaters.push(function(dt){tt+=dt;var k=.55+.45*Math.sin(tt*4.2);P.forEach(function(p,i){(p.mats||[]).forEach(function(m){if(!m.emissive)return;var e0=m.userData.e0||(m.userData.e0=m.emissive.clone());if(i===cur)m.emissive.setRGB(e0.r+.42*k,e0.g+.27*k,e0.b+.06*k);else m.emissive.lerp(e0,1-Math.exp(-8*dt));});});});
  function choose(i){cur=i;var p=P[i];btns.forEach(function(x,k){x[0].classList.toggle('on',k===i);x[1].setAttribute('aria-pressed',k===i);});out.innerHTML='<h3>'+p.n+'</h3><p class="muted">'+p.d+'</p>';V.poke();if(p.act)p.act();}
  return {choose:choose};}
// Işını grubun yerel uzayına çevirip eksene dik bir düzlemle kesiştir
var _inv=new THREE.Matrix4(),_o=new THREE.Vector3(),_d=new THREE.Vector3();
function hitPlane(ray,grp,axis,c){grp.updateWorldMatrix(true,false);_inv.copy(grp.matrixWorld).invert();_o.copy(ray.ray.origin).applyMatrix4(_inv);_d.copy(ray.ray.direction).transformDirection(_inv);
  if(Math.abs(_d[axis])<.04)return null;var t=(c-_o[axis])/_d[axis];if(t<0)return null;return new THREE.Vector3(_o.x+_d.x*t,_o.y+_d.y*t,_o.z+_d.z*t);}

/* ===== 1. FERMAN (TOMAR): sarılı kâğıdın “hafızası”, yuvarlanma, ağırlıklar ===== */
whenNear('ferman3d',function(){var host=document.getElementById('ferman3d');if(!host)return;
  var V=new Viewer('ferman3d',{pitch:40*D2R,yaw:-24*D2R,target:new THREE.Vector3(0,0,0),fitR:16,auto:false});if(!V.ok)return;
  var g=new THREE.Group();V.pivot.add(g);var LT=28,WZ=8.5,TH=.05,RC=.35,X0=-14;
  var ftex=fermanTex();
  var fm=new THREE.MeshStandardMaterial({map:ftex,bumpMap:ftex.userData.bump,bumpScale:.035,roughness:.9,side:THREE.DoubleSide});
  var flat=new THREE.Mesh(new THREE.PlaneGeometry(1,WZ),fm);flat.rotation.x=-Math.PI/2;flat.receiveShadow=true;g.add(flat);
  var rollM=new THREE.MeshStandardMaterial({map:rollTex(),roughness:.92});
  var capM=new THREE.MeshStandardMaterial({map:capTex(),roughness:.95});
  var roll=new THREE.Mesh(new THREE.CylinderGeometry(1,1,WZ,40,1,false),[rollM,capM,capM]);roll.rotation.x=Math.PI/2;roll.castShadow=true;g.add(roll);
  var rr=function(s){return Math.sqrt(Math.max(RC*RC,RC*RC+(LT-s)*TH/Math.PI));};
  // ağırlıklar (kum dolu kumaş “yılan” ağırlıklar)
  var wT=weaveTex('#D9D1BE'),wM=new THREE.MeshStandardMaterial({map:wT,bumpMap:wT.userData.bump,bumpScale:.03,roughness:1});function weight(){var gr=new THREE.Group(),cy=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,WZ+.6,16),wM);cy.rotation.x=Math.PI/2;cy.castShadow=true;gr.add(cy);
    [-1,1].forEach(function(e){var sp=new THREE.Mesh(new THREE.SphereGeometry(.32,14,10),wM);sp.position.z=e*(WZ+.6)/2;gr.add(sp);});g.add(gr);return gr;}
  var W=[{g:weight(),x:X0+9.5,y:7,v:0,on:false},{g:weight(),x:X0+19.5,y:7,v:0,on:false}];W.forEach(function(w){w.g.position.set(w.x,w.y,0);w.g.visible=false;});
  var s=.0,v=0,ang=0,motor=null,held=false;
  function hold(){var h=0;W.forEach(function(w){if(w.on&&w.rest&&w.x-X0<s+.05)h=Math.max(h,w.x-X0+.4);});return h;}
  V.updaters.push(function(dt){var n=4,h=dt/n;for(var i=0;i<n;i++){
      // kâğıdın sarılma eğilimi: açık kısım rulonun içine geri çeker; ağırlığın altındaki kısım sabit kalır
      var sh=hold(),F=s>sh?-(5+6*(s-sh)/LT):0,m=.6+1.6*(LT-s)/LT;if(motor!==null)F+=26*(motor-s)-8*v;
      v+=(F/m-1.1*v)*h;s+=v*h;if(s<sh&&v<0){s=sh;v=0;}if(s<0){s=0;v=0;}if(s>LT-.6){s=LT-.6;v=Math.min(v,0);}
      ang-=v*h/rr(s);}
    W.forEach(function(w){if(!w.g.visible)return;var floor=(w.x-X0<s?.33+.012:.32);w.v-=30*dt;w.y+=w.v*dt;if(w.y<floor){w.y=floor;if(w.v<-2){w.v=-w.v*.25;}else{w.v=0;w.rest=true;}}w.g.position.y=w.y;});
    var r=rr(s);flat.scale.x=Math.max(.001,s);flat.position.set(X0+s/2,.012,0);ftex.repeat.set(Math.max(.001,s)/LT,1);ftex.offset.set(0,0);
    roll.scale.set(r,1,r);roll.position.set(X0+s,r,0);roll.rotation.y=ang;V.aim(new THREE.Vector3(X0+Math.max(s,8)/2+1,0,0));});
  ftex.wrapS=THREE.ClampToEdgeWrapping;
  V.grabbers.push(function(ray){if(!ray.intersectObject(roll,false).length)return null;held=true;motor=s;var x0=null;
    return {move:function(r){var p=hitPlane(r,g,'y',rr(s));if(!p)return;motor=clamp(p.x-X0,0,LT-.6);},up:function(click){held=false;motor=null;if(click){openTo();}}};});
  V.hover=function(ray){return ray.intersectObject(roll,false).length>0;};
  function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
  function openTo(){motor=LT-.6;setTimeout(function(){motor=null;},1600);}
  var ui=host.querySelector('.ui'),bo=ui.querySelector('[data-f="open"]'),bw=ui.querySelector('[data-f="weights"]'),bc=ui.querySelector('[data-f="close"]');
  bo.addEventListener('click',function(){openTo();V.poke();});
  bw.addEventListener('click',function(){W.forEach(function(w,i){w.g.visible=true;w.on=true;w.rest=false;w.y=6+i*1.5;w.v=0;});V.poke();});
  bc.addEventListener('click',function(){W.forEach(function(w){w.on=false;w.g.visible=false;});motor=null;V.poke();});
  partsUI(V,host,document.getElementById('ferman-list'),document.getElementById('ferman-out'),[
    {n:'Tuğra',obj:g,at:new THREE.Vector3(X0+3.6,.05,0),d:'Padişahın adını taşıyan, fermanın başındaki imza niteliğindeki işaret. Çoğu zaman lacivert ve altınla çekilir.',mats:[fm],when:function(){return s>2.5;},act:function(){if(s<6)openTo();}},
    {n:'Divanî metin',obj:g,at:new THREE.Vector3(X0+12,.05,0),d:'Fermanlar divanî hatla yazılır; satırlar uca doğru hafifçe yükselir. Metin, sarılı kâğıdın içinde kalarak korunur.',mats:[fm],when:function(){return s>12;},act:function(){if(s<14)openTo();}},
    {n:'Tomar',obj:roll,at:new THREE.Vector3(0,1,0),d:'Uç uca eklenmiş uzun kâğıt şerit sarılarak saklanır. Sarıldığı yöne “hafıza” kazanır: açılınca kendiliğinden geri sarılmak ister.',mats:[rollM,capM]},
    {n:'Kum ağırlıklar',obj:W[0].g,at:new THREE.Vector3(0,.4,0),d:'Konservasyonda tomar zorlanmadan, kumaş kaplı kum ağırlıklarla düz tutulur. Ağırlığın altında kalan kısım sabitlenir, ötesi yine sarılmak ister.',mats:[wM],when:function(){return W[0].g.visible;}}]);
  window.__ferman={get s(){return s;}};});

/* ===== 2. MURAKKA: akordeon gibi katlanan albüm, menteşelerde gecikmeli açılma ===== */
whenNear('murakka3d',function(){var host=document.getElementById('murakka3d');if(!host)return;
  var V=new Viewer('murakka3d',{pitch:24*D2R,yaw:-18*D2R,target:new THREE.Vector3(0,3,0),fitR:15,auto:false});if(!V.ok)return;
  var g=new THREE.Group();V.pivot.add(g);var N=6,PW=4.4,PH=6.4,PT=.14;
  var borderT=ebru(),kitaM=[],panels=[];
  function kita(seed){return kitaTex(seed);}
  var lacT=lacquerTex(),coverM=new THREE.MeshStandardMaterial({map:lacT,metalnessMap:lacT.userData.metal,metalness:.55,roughness:.3}),edgeM=new THREE.MeshStandardMaterial({map:edges(),roughness:.9});
  for(var i=0;i<N;i++){var pg=new THREE.Group(),km=new THREE.MeshStandardMaterial({map:kita(i+1),roughness:.8});kitaM.push(km);
    var faceA=i===0?coverM:km,faceB=i===N-1?coverM:km;
    var b=new THREE.Mesh(new THREE.BoxGeometry(PW,PH,PT),[edgeM,edgeM,edgeM,edgeM,faceA,faceB]);b.position.set(PW/2,PH/2,0);b.castShadow=b.receiveShadow=true;pg.add(b);g.add(pg);panels.push({g:pg,sp:new Spring(.12,40+i*6,.8)});}
  var th=.12,tv=0,motor=null;
  V.updaters.push(function(dt){var n=4,h=dt/n;for(var q=0;q<n;q++){var F=motor!==null?20*(motor-th)-7*tv:0;tv+=(F-2.5*tv)*h;th+=tv*h;if(th<.12){th=.12;tv=0;}if(th>Math.PI*.92){th=Math.PI*.92;tv=0;}}
    // her menteşe ana açıyı biraz gecikmeyle izler (kâğıt menteşelerin esnekliği)
    var x=0,z=0,lx=0;panels.forEach(function(p,i){p.sp.t=th;p.sp.step(dt);var t=p.sp.x,phi=(Math.PI-t)/2,dir=(i%2?-1:1)*phi;
      p.g.position.set(x,0,z);p.g.rotation.y=dir;x+=Math.cos(dir)*PW+PT*1.1;z-=Math.sin(dir)*PW;lx=x;});
    var mid=lx/2;g.position.x=-mid;});
  V.grabbers.push(function(ray){var last=panels[N-1].g;if(!ray.intersectObjects(last.children,false).length&&!ray.intersectObjects(panels[N-2].g.children,false).length)return null;motor=th;
    return {move:function(r){var p=hitPlane(r,g,'y',PH/2);if(!p)return;var ext=Math.max(.5,p.x);motor=2*Math.asin(Math.min(.999,ext/(N*PW)));if(!isFinite(motor))motor=th;},up:function(click){motor=null;if(click)toggle();}};});
  V.hover=function(ray){return ray.intersectObjects(panels[N-1].g.children.concat(panels[N-2].g.children),false).length>0;};
  function toggle(){motor=th<1.4?Math.PI*.82:.12;setTimeout(function(){motor=null;},1800);V.poke();}
  host.querySelector('[data-m="toggle"]').addEventListener('click',toggle);
  partsUI(V,host,document.getElementById('murakka-list'),document.getElementById('murakka-out'),[
    {n:'Kıta',obj:panels[2].g,at:new THREE.Vector3(PW/2,PH*.62,PT/2+.02),d:'Hattatın yazdığı, genellikle büyük bir satır ve altında verev satırlardan oluşan yazı parçası. Murakka bu kıtaları bir araya getirir.',mats:kitaM},
    {n:'Pervaz',obj:panels[1].g,at:new THREE.Vector3(.35,PH*.25,PT/2+.02),d:'Kıtanın çevresindeki ebru ya da halkârlı kenar kâğıdı. Kıtayı taşıyan kartona bu kenarla yapıştırılır.',mats:kitaM},
    {n:'Körük',obj:panels[3].g,at:new THREE.Vector3(0,PH*.5,0),d:'Kartonlar bez ya da kâğıt şeritlerle akordeon gibi birbirine bağlanır. Katlama yerleri sık açılıp kapandığı için en çok yıpranan kısımdır.',mats:[edgeM]},
    {n:'Kapak',obj:panels[0].g,at:new THREE.Vector3(PW/2,PH*.5,-PT/2-.02),d:'Murakkanın iki ucundaki sert kapaklar çoğunlukla lake ya da deridir; kapalıyken bütün körüğü korur.',mats:[coverM]}]);
  window.__murakka={get th(){return th;}};});

/* ===== 3. CÖNK: dar ve uzun, kısa kenarından ciltli, yukarıya açılan defter ===== */
whenNear('conk3d',function(){var host=document.getElementById('conk3d');if(!host)return;
  var V=new Viewer('conk3d',{pitch:30*D2R,yaw:-58*D2R,target:new THREE.Vector3(0,2,-3),fitR:14,auto:false});if(!V.ok)return;
  var g=new THREE.Group();V.pivot.add(g);var BW=5.6,BL=15,T=1.6,c=.22,ZH=-BL/2;
  var lM=leatherMat(leather({plain:true}),{bump:.2}),lTex=leather({semse:false,zencerek:false}),lF=leatherMat(lTex),
      edgeM2=new THREE.MeshStandardMaterial({map:edges(),roughness:.95}),
      pT=conkPage(1),pM=new THREE.MeshStandardMaterial({map:pT,roughness:.95,side:THREE.DoubleSide});
  function conkPage(sd){var r=_rng(900+sd*31);return canvasTex(512,1440,function(x,w,h){x.fillStyle=_pat(x,'paper');x.fillRect(0,0,w,h);x.fillStyle='rgba(225,205,160,.25)';x.fillRect(0,0,w,h);_blot(x,w,h,20,['rgba(190,150,95,A)','rgba(245,235,210,A)'],30,160,.22,r);_spots(x,0,0,w,h,6+Math.floor(r()*20),r);
    x.strokeStyle='rgba(155,45,32,.85)';x.lineWidth=2;x.strokeRect(36,44,w-72,h-88);var y=110,TZ=window.Tezhip;
    while(y<h-120){if(TZ){x.fillStyle='rgba(155,38,26,.9)';x.fill(TZ.script(150,w-150,y,24,Math.floor(r()*99999)+1,true,true));}y+=48;for(var k=0;k<4&&y<h-90;k++){var px=w-64;while(px>90&&TZ){var ww=Math.min(px-64,40+r()*80),p=TZ.script(px-ww,px,y,22,Math.floor(r()*99999)+1,true);x.fillStyle='rgba(28,20,16,'+(.82+r()*.12)+')';x.fill(p);px=p.left-10-r()*10;}y+=40;}y+=34;}});}
  var back=new THREE.Mesh(new THREE.BoxGeometry(BW,c,BL),lM);back.position.y=c/2;back.castShadow=back.receiveShadow=true;g.add(back);
  var block=new THREE.Mesh(new THREE.BoxGeometry(BW-.3,T,BL-.4),[edgeM2,edgeM2,new THREE.MeshStandardMaterial({map:pT,roughness:.95}),edgeM2,edgeM2,edgeM2]);block.position.set(0,c+T/2,.1);block.castShadow=true;g.add(block);
  var spine=new THREE.Mesh(new THREE.BoxGeometry(BW,T+2*c,c),lM);spine.position.set(0,(T+2*c)/2,ZH-c/2);spine.castShadow=true;g.add(spine);
  var fp=new THREE.Group();fp.position.set(0,c+T+c,ZH);g.add(fp);var front=new THREE.Mesh(new THREE.BoxGeometry(BW,c,BL),[lM,lM,lF,lM,lM,lM]);front.position.set(0,c/2,BL/2);front.castShadow=true;fp.add(front);
  // yapraklar: kısa kenardaki menteşe etrafında yukarı ve öteye çevrilir
  var NP=5,SEG=20,pl=BL-.6,pw=BW-.5,pages=[];
  for(var k=0;k<NP;k++){var geo=new THREE.BufferGeometry(),vp=new Float32Array((SEG+1)*6),vu=new Float32Array((SEG+1)*4),idx=[];
    for(var j=0;j<=SEG;j++){vu[j*4]=0;vu[j*4+1]=1-j/SEG;vu[j*4+2]=1;vu[j*4+3]=1-j/SEG;if(j<SEG){var a=j*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}}
    geo.setAttribute('position',new THREE.BufferAttribute(vp,3));geo.setAttribute('uv',new THREE.BufferAttribute(vu,2));geo.setIndex(idx);
    var m=new THREE.Mesh(geo,k===NP-1?pM:new THREE.MeshStandardMaterial({map:conkPage(k+2),roughness:.95,side:THREE.DoubleSide}));m.castShadow=true;var y0=c+T+.012+k*.006;m.position.set(0,y0,ZH+.2);g.add(m);
    pages.push({m:m,geo:geo,y0:y0,h:new Hinge({a:0,lo:0,hi:Math.PI-.03-(NP-k)*.006,G:9,f:.9,e:.18,K:34,C:10})});}
  function shape(p){var a=p.h.a,w=p.h.w,arr=p.geo.attributes.position.array,y=0,z=0,ds=pl/SEG,bend=Math.max(-1.2,Math.min(1.2,-w*.2)),sag=.35*Math.max(0,Math.sin(a))*Math.cos(a);
    for(var j=0;j<=SEG;j++){var s=j/SEG,an=a+bend*Math.pow(s,1.5)-sag*s*s;arr[j*6]=-pw/2;arr[j*6+1]=y;arr[j*6+2]=z;arr[j*6+3]=pw/2;arr[j*6+4]=y;arr[j*6+5]=z;y+=Math.sin(an)*ds;z+=Math.cos(an)*ds;if(a<.02&&y<0)y=0;}
    p.geo.attributes.position.needsUpdate=true;p.geo.computeVertexNormals();p.geo.computeBoundingSphere();p.m.position.y=p.y0+c*Math.min(1,Math.max(0,(a-1.3)/1.4));}
  var hc=new Hinge({a:0,lo:0,hi:Math.PI-.005,G:9,f:.55,e:.28,K:110,C:15}),held=null;
  var chain=pages.map(function(p){return {h:p.h,m:1};}).concat([{h:hc,m:4}]);
  V.updaters.push(function(dt){hc.step(dt);pages.forEach(function(p){p.h.step(dt);});
    for(var it=0;it<3;it++)for(var i=0;i<chain.length-1;i++){var A=chain[i],B=chain[i+1];if(A.h.a<=B.h.a)continue;var mA=A.h===held?1e6:A.m,mB=B.h===held?1e6:B.m,a=(A.h.a*mA+B.h.a*mB)/(mA+mB),w=(A.h.w*mA+B.h.w*mB)/(mA+mB);A.h.a=Math.min(A.h.hi,a);B.h.a=Math.max(B.h.lo,a);A.h.w=B.h.w=w;}
    fp.rotation.x=-hc.a;pages.forEach(function(p){shape(p);p.m.visible=hc.a>.25||p.h.a>.01;});});
  function holdH(h,py,pz,K,C,onClick){var K0=h.K,C0=h.C;held=h;h.K=K;h.C=C;h.rel=null;h.motor=h.a;
    return {move:function(r){var p=hitPlane(r,g,'x',0);if(!p)return;var a=Math.atan2(p.y-py,p.z-pz);if(a<0)a=a<-Math.PI/2?Math.PI:0;h.motor=Math.max(h.lo,Math.min(h.hi,a));},
      up:function(click){held=null;h.K=K0;h.C=C0;h.motor=null;if(Math.abs(h.a-Math.PI/2)<.12&&Math.abs(h.w)<.4)h.w=h.a>Math.PI/2?.5:-.5;if(click&&onClick)onClick();}};}
  function flip(p,dir){var H=Math.PI/2;if(dir>0)p.h.push(H+.4,H+.14,1);else p.h.push(H-.4,H-.14,-1);}
  function topR(){for(var i=NP-1;i>=0;i--)if(pages[i].h.a<Math.PI/2)return pages[i];return null;}
  function topL(){for(var i=0;i<NP;i++)if(pages[i].h.a>=Math.PI/2)return pages[i];return null;}
  function openC(){if(hc.a<Math.PI/2)hc.push(Math.PI/2+.4,Math.PI/2+.15,1);else{pages.forEach(function(p,i){if(p.h.a>1.5)setTimeout(function(){flip(p,-1);},i*200);});setTimeout(function(){hc.push(Math.PI/2-.4,Math.PI/2-.15,-1);},1400);}V.poke();}
  V.grabbers.push(function(ray){var objs=pages.filter(function(p){return p.m.visible;}).map(function(p){return p.m;}).concat([front,block]);var hit=ray.intersectObjects(objs,false);if(!hit.length)return null;var o=hit[0].object;
    for(var i=0;i<NP;i++)if(o===pages[i].m){var pp=pages[i];return holdH(pp.h,pp.m.position.y,pp.m.position.z,150,22,function(){flip(pp,pp.h.a<Math.PI/2?1:-1);});}
    if(o===block){var r=topR();return r&&hc.a>.6?holdH(r.h,r.m.position.y,r.m.position.z,150,22,function(){flip(r,1);}):null;}
    var l=hc.a>Math.PI/2?topL():null;if(l)return holdH(l.h,l.m.position.y,l.m.position.z,150,22,function(){flip(l,-1);});
    return holdH(hc,fp.position.y,fp.position.z,120,16,openC);});
  V.hover=function(ray){return ray.intersectObjects([front,block].concat(pages.map(function(p){return p.m;})),false).length>0;};
  var ui=host.querySelector('.ui');ui.querySelector('[data-c="open"]').addEventListener('click',openC);
  ui.querySelector('[data-c="next"]').addEventListener('click',function(){if(hc.a<Math.PI/2){openC();return;}var r=topR();if(r)flip(r,1);V.poke();});
  ui.querySelector('[data-c="prev"]').addEventListener('click',function(){var l=topL();if(l)flip(l,-1);V.poke();});
  partsUI(V,host,document.getElementById('conk-list'),document.getElementById('conk-out'),[
    {n:'Sırt (kısa kenar)',obj:spine,at:new THREE.Vector3(0,0,-c/2-.01),d:'Cönk, uzun kenarından değil kısa kenarından ciltlenir; bu yüzden sayfalar yana değil yukarıya doğru çevrilir.',normal:new THREE.Vector3(0,0,-1),mats:[lM]},
    {n:'Kapak',obj:fp,at:new THREE.Vector3(0,c,BL*.6),d:'Çoğunlukla sade deri ya da mukavva kapak. Gündelik kullanıma dayanacak, süssüz ve sağlam bir cilttir.',normal:new THREE.Vector3(0,1,0),mats:[lF],act:function(){if(hc.a>1)openC();}},
    {n:'Şiir sayfaları',obj:block,at:new THREE.Vector3(0,T/2,BL*.2),d:'Cönklerde halk şiirleri, türküler ve ilahiler derlenir. Dörtlükler kırmızı başlıklarla ayrılır.',mats:[pM],when:function(){return hc.a>1;},act:function(){if(hc.a<1)openC();}},
    {n:'Biçim',obj:g,at:new THREE.Vector3(BW/2+.2,c+T/2,BL*.35),d:'Uzun ve dar “sefine” biçimi cepte ya da koynunda taşınmaya uygundur; âşıklar ve derleyiciler yanlarında taşırdı.',mats:[lM,lF]}]);
  window.__conk={hc:hc,pages:pages};});
})();
