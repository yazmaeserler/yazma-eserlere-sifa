/* Tedavi sekmeleri: cilt, tezhip, şiraze, mühür, mürekkep — adım adım canlandırma */
(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s);},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s));};
var W=1000,H=808,MONO='"IBM Plex Mono",ui-monospace,monospace';
function ease(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}
function cl(x,a,b){return x<a?a:x>b?b:x;}
function rng(seed){return function(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};}
function mat(c){c.fillStyle='#1E5F51';c.fillRect(0,0,W,H);c.strokeStyle='rgba(255,255,255,.13)';c.lineWidth=1;for(var x=0;x<=W;x+=40){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke();}for(var y=0;y<=H;y+=40){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}}
function tag(c,t,x,y,col){c.font='600 20px '+MONO;c.textAlign='center';var w=c.measureText(t).width+20;c.fillStyle=col||'rgba(16,20,18,.82)';c.beginPath();c.roundRect?c.roundRect(x-w/2,y-17,w,30,15):c.rect(x-w/2,y-17,w,30);c.fill();c.fillStyle='#F3F1EA';c.fillText(t,x,y+5);}
function marker(c,x,y,n,ok,a){c.globalAlpha=a;c.fillStyle=ok?'#2E7D66':'#9B2D20';c.beginPath();c.arc(x,y,17,0,7);c.fill();c.strokeStyle='#F3F1EA';c.lineWidth=3;c.stroke();c.fillStyle='#fff';c.font='600 17px '+MONO;c.textAlign='center';
  if(ok){c.beginPath();c.moveTo(x-7,y);c.lineTo(x-2,y+6);c.lineTo(x+8,y-6);c.stroke();}else c.fillText(n,x,y+6);c.globalAlpha=1;}
function brush(c,x,y,ang){c.save();c.translate(x,y);c.rotate(ang||-.5);c.fillStyle='#8B5A2B';c.fillRect(-9,-130,18,96);c.fillStyle='#B9B3A7';c.fillRect(-12,-40,24,16);c.fillStyle='#EADBB8';c.beginPath();c.moveTo(-14,-24);c.lineTo(14,-24);c.lineTo(18,14);c.lineTo(-18,14);c.fill();c.restore();}
function noiseFill(c,x,y,w,h,col,n,seed,sz){var r=rng(seed);c.fillStyle=col;for(var i=0;i<n;i++)c.fillRect(x+r()*w,y+r()*h,1+r()*(sz||3),1+r()*(sz||3));}
function shadow(c,x,y,w,h){c.fillStyle='rgba(0,0,0,.28)';c.fillRect(x+10,y+12,w,h);}

/* ---------- Motor: adım listesi, başlık, oynat/duraklat, görünürken çiz ---------- */
function Treat(pane,cfg){var cv=$('canvas',pane),ctx=cv.getContext('2d'),list=$('.l-steps',pane),cap=$('.l-cap',pane),pb=$('[data-t="play"]',pane),rb=$('[data-t="reset"]',pane);
  var step=0,p=0,hold=0,on=false,vis=false,raf=0,last=0,tm=0;
  cfg.steps.forEach(function(s,i){var b=document.createElement('button');b.type='button';b.className='l-step';b.innerHTML='<i>'+(i+1)+'</i><span>'+s[0]+'</span><small>'+s[1]+'</small>';b.addEventListener('click',function(){halt();set(i);});list.appendChild(b);});
  var bs=$$('.l-step',list);
  function set(n){step=n;p=0;hold=0;bs.forEach(function(b,k){b.classList.toggle('done',k<n);b.classList.toggle('cur',k===n);});
    cap.classList.add('swap');setTimeout(function(){$('b',cap).textContent=cfg.steps[n][1];$('.tx',cap).textContent=cfg.steps[n][2];$('.mt',cap).textContent='Malzeme: '+cfg.steps[n][3];cap.classList.remove('swap');},160);kick();}
  function A(k){return k<step?1:k===step?ease(p):0;}
  function size(){var w=cv.clientWidth||W,r=Math.min(2,window.devicePixelRatio||1);cv.width=Math.round(w*r);cv.height=Math.round(w*H/W*r);}
  if('ResizeObserver' in window)new ResizeObserver(size).observe(cv);size();
  // Sınırlı yakınlaştırma (1–2,5×): tekerlek (tıkladıktan sonra ya da Ctrl/⌘ ile), iki parmak, +/−; yakındayken sürükleyerek gezinme
  var Z={z:1,zt:1,cx:W/2,cy:H/2,clamp:function(){var hw=W/2/this.z,hh=H/2/this.z;this.cx=cl(this.cx,hw,W-hw);this.cy=cl(this.cy,hh,H-hh);}},act=false,tp={},pin=null,pan=null;
  function pt(e){var r=cv.getBoundingClientRect();return [(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height];}
  function zoom(z,f){z=cl(z,1,2.5);if(f){var ux=Z.cx+(f[0]-.5)*W/Z.zt,uy=Z.cy+(f[1]-.5)*H/Z.zt;Z.cx=ux-(f[0]-.5)*W/z;Z.cy=uy-(f[1]-.5)*H/z;}Z.zt=z;Z.z=Z.z;zb[0].disabled=z>=2.5-1e-3;zb[1].disabled=z<=1+1e-3;cv.style.cursor=z>1.01?'grab':'';cv.style.touchAction=z>1.01?'none':'pan-y';kick();}
  var zd=document.createElement('div');zd.className='zoomctl';zd.innerHTML='<button type="button" aria-label="Yakınlaştır">+</button><button type="button" aria-label="Uzaklaştır">−</button>';cv.parentNode.appendChild(zd);
  var zb=zd.querySelectorAll('button');zb[1].disabled=true;zb[0].addEventListener('click',function(){zoom(Z.zt*1.4);});zb[1].addEventListener('click',function(){zoom(Z.zt/1.4);});
  cv.style.touchAction='pan-y';
  cv.addEventListener('wheel',function(e){if(!(act||e.ctrlKey||e.metaKey))return;e.preventDefault();zoom(Z.zt*Math.exp(-cl(e.deltaY,-60,60)*(e.ctrlKey?.01:.0025)),pt(e));},{passive:false});
  cv.addEventListener('pointerdown',function(e){act=true;tp[e.pointerId]=pt(e);var ks=Object.keys(tp);if(ks.length===2){var a=tp[ks[0]],b=tp[ks[1]];pin={d:Math.hypot(a[0]-b[0],a[1]-b[1]),z:Z.zt};pan=null;}else if(Z.zt>1.01){pan={p:pt(e),cx:Z.cx,cy:Z.cy};cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing';}});
  cv.addEventListener('pointermove',function(e){if(!tp[e.pointerId])return;tp[e.pointerId]=pt(e);if(pin){var ks=Object.keys(tp);if(ks.length===2){var a=tp[ks[0]],b=tp[ks[1]],d=Math.hypot(a[0]-b[0],a[1]-b[1]);zoom(pin.z*d/pin.d,[(a[0]+b[0])/2,(a[1]+b[1])/2]);}e.preventDefault();return;}
    if(pan){var q=pt(e);Z.cx=pan.cx-(q[0]-pan.p[0])*W/Z.z;Z.cy=pan.cy-(q[1]-pan.p[1])*H/Z.z;Z.clamp();kick();e.preventDefault();}});
  function pend(e){delete tp[e.pointerId];if(Object.keys(tp).length<2)pin=null;pan=null;cv.style.cursor=Z.zt>1.01?'grab':'';}
  cv.addEventListener('pointerup',pend);cv.addEventListener('pointercancel',pend);cv.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse')act=false;});
  cv.addEventListener('dblclick',function(){zoom(1);Z.cx=W/2;Z.cy=H/2;});
  cv.addEventListener('gesturestart',function(e){e.preventDefault();pin={d:1,z:Z.zt};});cv.addEventListener('gesturechange',function(e){e.preventDefault();if(pin)zoom(pin.z*e.scale);});cv.addEventListener('gestureend',function(){pin=null;});
  function loop(t){raf=0;if(!vis||pane.hidden)return;var dt=Math.max(0,Math.min(.05,(t-last)/1000));last=t;tm+=dt*(window.__trSpeed||1);
    var sp=window.__trSpeed||1;p=Math.min(1,p+dt*sp/1.8);if(p>=1){hold+=dt*sp;if(on&&hold>1.1){if(step<cfg.steps.length-1)set(step+1);else halt();}}
    Z.z+=(Z.zt-Z.z)*Math.min(1,dt*12);Z.clamp();var k=cv.width/W*Z.z;ctx.setTransform(k,0,0,k,cv.width/2-Z.cx*k,cv.height/2-Z.cy*k);cfg.draw(ctx,A,step,p,tm);raf=requestAnimationFrame(loop);}
  function kick(){if(vis&&!pane.hidden&&!raf){last=performance.now();raf=requestAnimationFrame(loop);}}
  function halt(){on=false;pb.textContent='▶ Oynat';}
  pb.addEventListener('click',function(){if(on){halt();return;}on=true;pb.textContent='❚❚ Duraklat';if(step>=cfg.steps.length-1&&p>=1)set(0);else{hold=1;kick();}});
  rb.addEventListener('click',function(){halt();set(0);});
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){vis=es[0].isIntersecting;kick();},{threshold:.05}).observe(cv);else vis=true;
  this.show=function(){size();kick();};set(0);}

/* ---------- Gerçekçi dokular: önbellekli taban görüntüleri ve küçük desenler ---------- */
var BASES={};
// Bölgenin statik hâli bir kez, 2× çözünürlükte çizilir; her karede yalnızca kopyalanır
function base(key,x0,y0,w,h,fn){if(BASES[key])return BASES[key];if(!window.Tezhip)return null;var S=2,C=document.createElement('canvas');C.width=w*S;C.height=h*S;var x=C.getContext('2d');x.setTransform(S,0,0,S,-x0*S,-y0*S);fn(x,S);return BASES[key]={c:C,x0:x0,y0:y0,w:w,h:h};}
function blit(c,b){if(b)c.drawImage(b.c,b.x0,b.y0,b.w,b.h);}
var GR={};
function grainC(key,S,base,dots,seed,fib){if(GR[key])return GR[key];var C=document.createElement('canvas');C.width=C.height=S;var x=C.getContext('2d'),r=rng(seed),i;x.fillStyle=base;x.fillRect(0,0,S,S);
  dots.forEach(function(d){x.fillStyle=d[0];for(i=0;i<d[1];i++){var px=r()*S,py=r()*S,w=.5+r()*d[2],h=.5+r()*d[2];x.fillRect(px,py,w,h);if(px+w>S)x.fillRect(px-S,py,w,h);if(py+h>S)x.fillRect(px,py-S,w,h);}});
  if(fib){x.lineCap='round';for(i=0;i<fib[1];i++){var fx=r()*S,fy=r()*S,a=r()*Math.PI,l=fib[2]*(.4+r());x.strokeStyle=fib[0].replace('A',(.15+r()*.35).toFixed(2));x.lineWidth=fib[3]*(.5+r());x.beginPath();x.moveTo(fx,fy);x.quadraticCurveTo(fx+Math.cos(a+.6)*l/2,fy+Math.sin(a+.6)*l/2,fx+Math.cos(a)*l,fy+Math.sin(a)*l);x.stroke();}}
  return GR[key]=C;}
var PATS={
  board:function(){return grainC('board',128,'#8A7A63',[['rgba(60,48,34,.45)',900,1.6],['rgba(190,175,150,.35)',700,1.4]],21,['rgba(70,58,42,A)',60,18,.8]);},
  tone:function(){return grainC('tone',128,'#7A4A34',[['rgba(50,26,16,.35)',700,1.3],['rgba(160,110,80,.3)',500,1.2]],22,['rgba(200,160,130,A)',70,22,.6]);},
  tissue:function(){return grainC('tissue',160,'rgba(250,246,234,.0)',[],23,['rgba(255,253,246,A)',260,34,1]);},
  grey:function(){return grainC('grey',128,'#8E9590',[['rgba(60,66,62,.25)',900,1.4],['rgba(200,205,200,.25)',700,1.3]],24);},
  rotL:function(){return grainC('rotL',96,'#B8774E',[['rgba(232,176,128,.55)',900,1.6],['rgba(120,60,34,.4)',500,1.4]],25,['rgba(240,190,150,A)',40,10,.6]);},
  rotD:function(){return grainC('rotD',96,'#5A2E1E',[['rgba(30,14,8,.4)',700,1.4],['rgba(120,70,48,.35)',500,1.3]],26);}
};
function pat(c,k){var m=c.__pt||(c.__pt={});return m[k]||(m[k]=c.createPattern(PATS[k](),'repeat'));}
// eski kâğıt: lifli zemin, kenarlara doğru kararma, leke
function paperArea(x,X,Y,w,h,seed,tone){var r=rng(seed);x.fillStyle=Tezhip.pattern(x,'paper');x.fillRect(X,Y,w,h);
  var g=x.createRadialGradient(X+w/2,Y+h/2,Math.min(w,h)*.3,X+w/2,Y+h/2,Math.max(w,h)*.75);g.addColorStop(0,'rgba(170,120,60,0)');g.addColorStop(1,'rgba(150,100,45,'+(tone||.32)+')');x.fillStyle=g;x.fillRect(X,Y,w,h);
  for(var i=0;i<10;i++){var fx=X+r()*w,fy=Y+r()*h,fr=1.5+r()*r()*8,fg=x.createRadialGradient(fx,fy,0,fx,fy,fr);fg.addColorStop(0,'rgba(140,85,40,.4)');fg.addColorStop(1,'rgba(140,85,40,0)');x.fillStyle=fg;x.fillRect(fx-fr,fy-fr,2*fr,2*fr);}}
// kamış kalemle satırlar (sağdan sola); halo: demir-gal mürekkebinin kahverengi çevresi
function scriptLines(x,L,R,ys,hh,seed,ink,halo,S){var r=rng(seed),out=[];ys.forEach(function(y,li){var px=R-r()*8;while(px>L+hh){var w=Math.min(px-L,hh*(2+r()*3.5)),p=Tezhip.script(px-w,px,y,hh,Math.floor(r()*99999)+1,true);
    if(halo){x.save();x.shadowColor=halo;x.shadowBlur=hh*.5*(S||2);x.fillStyle=halo;x.strokeStyle=halo;x.lineWidth=hh*.22;x.lineJoin='round';x.stroke(p);x.fill(p);x.restore();}
    x.fillStyle=typeof ink==='function'?ink(li,r):ink;x.fill(p);out.push([p,px-w,px,y]);px=p.left-hh*(.35+r()*.4);}});return out;}
function blobPath(cx,cy,rx,ry,rot,seed,n){var r=rng(seed),P=new Path2D(),k=n||22,ph=r()*6;for(var i=0;i<=k;i++){var a=i/k*Math.PI*2,q=.78+.18*Math.sin(a*3+ph)+.12*r(),px=Math.cos(a)*rx*q,py=Math.sin(a)*ry*q,ca=Math.cos(rot),sa=Math.sin(rot);var X=cx+px*ca-py*sa,Y=cy+px*sa+py*ca;i?P.lineTo(X,Y):P.moveTo(X,Y);}P.closePath();return P;}

/* ---------- CİLT ---------- */
// Kapak: 3D modeldeki kullanım izli deri (şemse, köşebent, zencerek) — kırmızı çürüme, kayıp ve kopuk menteşe üstte canlı çizilir
var leatherC=null,spineC=null;
function ciltTex(){if(leatherC||!window.__TX)return;var src=window.__TX.leather();leatherC=document.createElement('canvas');leatherC.width=1020;leatherC.height=1220;var x=leatherC.getContext('2d');var sk=src.width/1024;x.drawImage(src,0,108*sk,1024*sk,1224*sk,0,0,1020,1220);
  // kapak kalınlığı: kenarlarda ışık ve gölge
  var g=x.createLinearGradient(0,0,1020,0);g.addColorStop(0,'rgba(0,0,0,.35)');g.addColorStop(.04,'rgba(0,0,0,0)');g.addColorStop(.97,'rgba(255,220,180,0)');g.addColorStop(1,'rgba(255,220,180,.18)');x.fillStyle=g;x.fillRect(0,0,1020,1220);
  var p=window.__TX.leather({plain:true});spineC=document.createElement('canvas');spineC.width=96;spineC.height=1220;var y=spineC.getContext('2d');var pk=p.width/1024;y.drawImage(p,300*pk,0,240*pk,1440*pk,0,0,96,1220);
  var s=y.createLinearGradient(0,0,96,0);s.addColorStop(0,'rgba(0,0,0,.55)');s.addColorStop(.35,'rgba(255,215,170,.12)');s.addColorStop(.6,'rgba(0,0,0,0)');s.addColorStop(1,'rgba(0,0,0,.45)');y.fillStyle=s;y.fillRect(0,0,96,1220);
  // sırtta bantlar (kabartı)
  [200,420,640,860,1080].forEach(function(b){var bg=y.createLinearGradient(0,b-14,0,b+14);bg.addColorStop(0,'rgba(0,0,0,0)');bg.addColorStop(.4,'rgba(255,220,180,.2)');bg.addColorStop(.6,'rgba(0,0,0,.35)');bg.addColorStop(1,'rgba(0,0,0,0)');y.fillStyle=bg;y.fillRect(0,b-14,96,28);});}
var ROT=[[300,630,70],[700,170,55],[330,180,48]],LOSS=[[[700,110],[760,110],[760,200],[735,180],[715,140]],[[480,700],[560,700],[548,676],[512,670],[492,684]]];
var ROTP=ROT.map(function(q,i){return blobPath(0,0,q[2],q[2]*.72,i,40+i,28);});
var cilt={steps:[
  ['Durum tespiti','DURUM TESPİTİ','Kırmızı çürüme (tozuyan deri), kopuk ön kapak, deri kayıpları ve yüzey kiri numaralanarak belgelenir.','Işık kaynağı, fotoğraf, durum formu'],
  ['Yüzey temizliği','KURU TEMİZLİK','Gevşek toz yumuşak fırçayla, yapışmış kir lateks süngerle alınır; tozuyan deri ovalanmaz.','Yumuşak fırça, lateks sünger, HEPA vakum'],
  ['Deri sağlamlaştırma','SAĞLAMLAŞTIRMA','Tozuyan deriye alkolde çözülmüş Klucel G fırçayla sürülür; lifler bağlanır, deri tozumayı bırakır.','Klucel G (%1–2, etanolde), yumuşak fırça'],
  ['Menteşe onarımı','KAPAK BAĞLANTISI','Kopuk ön kapak, tonlanmış Japon kâğıdı şeritle sırta yeniden bağlanır. Eski deri kaldırılıp onarım altına yerleştirilir.','Tonlu Japon kâğıdı, buğday nişastası, spatula'],
  ['Kayıp tamamlama','TAMAMLAMA','Deri kayıpları tonlanmış Japon kâğıdı ya da ince deriyle doldurulur; yakından bakınca ayırt edilebilir kalır.','Tonlu Japon kâğıdı, akrilik ton, nişasta'],
  ['Muhafaza','MUHAFAZA','Onarılan cilt, ölçüsüne göre yapılan asitsiz kutuya yerleştirilir.','Asitsiz, alkali tamponlu mukavva']],
  draw:function(c,A,s,p,tm){mat(c);ciltTex();var g=(1-A(3))*16,rot=(1-A(3))*.025;
    shadow(c,220,100,560,610);
    if(spineC)c.drawImage(spineC,205,100,48,610);else{c.fillStyle='#4A2A1E';c.fillRect(205,100,48,610);}
    // kopuk menteşe: arada sırt kartonu ve kopmuş deri lifleri görünür
    if(g>1){c.fillStyle=pat(c,'board');c.fillRect(250,100,g+6,610);c.strokeStyle='rgba(60,30,18,.8)';c.lineWidth=1;for(var f=0;f<26;f++){var fy=110+f*23;c.beginPath();c.moveTo(252,fy);c.lineTo(252+g*.6+((f*7)%5),fy+4);c.stroke();}}
    c.save();c.translate(255+g,100);c.rotate(rot);if(leatherC)c.drawImage(leatherC,0,0,510,610);c.restore();
    // kırmızı çürüme: tozuyan, süet gibi açık kahve deri → sağlamlaştırılınca koyulaşır
    var a2=A(2);ROT.forEach(function(r,i){c.save();c.translate(r[0]+g,r[1]);c.globalAlpha=.9*(1-a2);c.fillStyle=pat(c,'rotL');c.fill(ROTP[i]);c.globalAlpha=.55*a2;c.fillStyle=pat(c,'rotD');c.fill(ROTP[i]);
      c.globalAlpha=(1-a2)*.6;c.strokeStyle='rgba(240,190,150,.5)';c.lineWidth=1;c.stroke(ROTP[i]);c.restore();});
    // kayıplar: altta mukavva → tonlu Japon kâğıdıyla dolgu
    var a4=A(4);LOSS.forEach(function(L){c.beginPath();L.forEach(function(q,i){var x=q[0]+g;i?c.lineTo(x,q[1]):c.moveTo(x,q[1]);});c.closePath();c.fillStyle=pat(c,'board');c.fill();
      c.save();c.clip();c.strokeStyle='rgba(0,0,0,.45)';c.lineWidth=6;c.stroke();c.restore();
      if(a4>0){c.globalAlpha=a4;c.fillStyle=pat(c,'tone');c.fill();c.globalAlpha=1;}c.strokeStyle='rgba(230,180,140,'+(.55-.3*a4)+')';c.lineWidth=1.4;c.stroke();});
    // menteşe şeridi: tonlu, lifli Japon kâğıdı
    var ja=A(3);if(ja>0){c.save();c.globalAlpha=.92;c.fillStyle=pat(c,'tone');c.beginPath();c.moveTo(233,100);for(var yy=100;yy<=100+610*ja;yy+=10)c.lineTo(233+Math.sin(yy*.7)*1.5,yy);for(yy=100+610*ja;yy>=100;yy-=10)c.lineTo(289+Math.sin(yy*.9)*1.8,yy);c.closePath();c.fill();c.globalAlpha=.6;c.fillStyle=pat(c,'tissue');c.fill();c.restore();}
    // toz: gri tabaka ve tanecikler
    var d=1-A(1);if(d>0){c.fillStyle='rgba(190,182,166,'+(.22*d)+')';c.fillRect(255,100,510,610);c.globalAlpha=d;noiseFill(c,255,100,510,610,'rgba(200,190,170,.5)',2600,21,3);c.globalAlpha=1;}
    var M=[[300,520,1,A(2)],[230,400,2,A(3)],[720,250,3,A(4)],[600,330,4,A(1)]];if(s>=0)M.forEach(function(m){marker(c,m[0],m[1],m[2],m[3]>.98,Math.min(1,s>0?1:p*2));});
    if(s===1&&p<1)brush(c,300+p*420,250+Math.sin(p*14)*60,-.4);
    if(s===2&&p<1){var r=ROT[Math.max(0,Math.min(2,Math.floor(p*3)))];brush(c,r[0]+Math.sin(p*30)*30,r[1],-.6);}
    if(s===4&&p<1){c.fillStyle='#C9C3B5';c.save();c.translate(700+p*40,150+p*400);c.rotate(.6);c.fillRect(-4,-90,8,90);c.fillRect(-12,0,24,26);c.restore();}
    if(s===5){var l=A(5);c.save();c.globalAlpha=l;c.fillStyle=pat(c,'grey');c.fillRect(190,90,620*l,630);c.strokeStyle='rgba(40,46,42,.5)';c.lineWidth=2;c.strokeRect(198,98,620*l-16,614);c.restore();if(l>.6){tag(c,'ASİTSİZ KUTU',500,405,'rgba(16,20,18,.7)');}}}};

/* ---------- TEZHİP ---------- */
// Serlevhalı bir sayfa parçası: unvan + tepelik + tığ (tezhip.js), altında cetvelli iki satır. Hasarlar üstte canlı çizilir.
var TZK=.862,TZX=250,TZY=273,TZS=3;function U(u,v){return [TZX+u*TZK,TZY+v*TZK];}
var FLAKES=[];(function(){var r=rng(5);for(var i=0;i<16;i++){var a=r()*Math.PI*2,q=Math.sqrt(r()),u,v;
    if(i<11){u=290+Math.cos(a)*q*92;v=90+Math.sin(a)*q*30;}else{var L=i%2;u=(L?19+r()*30:561-r()*30);v=60+r()*60;}
    var p=U(u,v),s=4+r()*4.5,pts=[];for(var k=0;k<6;k++){var b=k/6*Math.PI*2+r()*.5,rr=s*(.6+r()*.5);pts.push([Math.cos(b)*rr,Math.sin(b)*rr*.75]);}FLAKES.push([p[0],p[1],s,r()*6,pts]);}})();
var VARAK=[[130,3],[470,30],[372,-26]].map(function(q){return U(q[0],q[1]);}),VERD=U(505,138),LOSSP=[[0,0],[64,0],[57,13],[41,29],[19,39],[0,31]].map(function(q){return U(q[0],q[1]);});
var tzBase=null,tzPat={};
function tzBuild(){if(tzBase||!window.Tezhip)return tzBase;var S=TZS,C=document.createElement('canvas');C.width=660*S;C.height=420*S;var x=C.getContext('2d'),r=rng(77),i;
  x.setTransform(S,0,0,S,-170*S,-150*S);
  x.fillStyle=Tezhip.pattern(x,'paper');x.fillRect(170,150,660,420);
  var g=x.createRadialGradient(500,360,150,500,360,460);g.addColorStop(0,'rgba(170,120,60,0)');g.addColorStop(1,'rgba(150,100,45,.35)');x.fillStyle=g;x.fillRect(170,150,660,420);
  for(i=0;i<12;i++){var fx=180+r()*640,fy=160+r()*400,fr=2+r()*7,fg=x.createRadialGradient(fx,fy,0,fx,fy,fr);fg.addColorStop(0,'rgba(140,85,40,.4)');fg.addColorStop(1,'rgba(140,85,40,0)');x.fillStyle=fg;x.fillRect(fx-fr,fy-fr,2*fr,2*fr);}
  // serlevha
  var P=Tezhip.panel(500*S,{seed:9,sheen:.6});x.save();x.setTransform(1,0,0,1,0,0);x.drawImage(P.C,(TZX-170)*S-P.ox,(TZY-150)*S-P.oy);x.restore();
  // metin: altın cetvel içinde iki satır
  var L=TZX,R=TZX+500,T=TZY+163,B=TZY+275;x.fillStyle=Tezhip.pattern(x,'gold');x.fillRect(L,T,R-L,3);x.fillRect(L,B-3,R-L,3);x.fillRect(L,T,3,B-T);x.fillRect(R-3,T,3,B-T);
  x.strokeStyle='rgba(26,18,10,.9)';x.lineWidth=.7;x.strokeRect(L,T,R-L,B-T);x.strokeRect(L+3,T+3,R-L-6,B-T-6);x.strokeStyle='rgba(36,66,150,.8)';x.strokeRect(L-6,T-1,R-L+12,B-T+7);
  [T+44,T+92].forEach(function(base,ln){var px=R-14;while(px>L+40){var w=Math.min(px-L-14,46+r()*60);x.fillStyle=ln===0&&px>R-70?'#A2261A':'rgba(28,20,14,.92)';var wp=Tezhip.script(px-w,px,base,24,Math.floor(r()*9999)+1,true);x.fill(wp);px=wp.left-9-r()*6;}});
  // bakır yeşili yapraklar: kâğıt arkadan kahverengiye dönmüş
  var vh=x.createRadialGradient(VERD[0],VERD[1],4,VERD[0],VERD[1],34);vh.addColorStop(0,'rgba(95,70,30,.5)');vh.addColorStop(1,'rgba(95,70,30,0)');x.fillStyle=vh;x.fillRect(VERD[0]-34,VERD[1]-34,68,68);
  x.fillStyle='#3E8A6C';var VA=[-2.6,-1.2,.2,1.5];for(i=0;i<4;i++){var a=VA[i]+(r()-.5)*.5,lx=VERD[0]+Math.cos(a)*4,ly=VERD[1]+Math.sin(a)*3;x.save();x.translate(lx,ly);x.rotate(a);x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(8,-5,18,0);x.quadraticCurveTo(8,4,0,0);x.fill();x.strokeStyle='rgba(26,18,10,.85)';x.lineWidth=.5;x.stroke();x.restore();}
  var vg=x.createRadialGradient(VERD[0],VERD[1],0,VERD[0],VERD[1],22);vg.addColorStop(0,'rgba(60,40,15,.25)');vg.addColorStop(1,'rgba(60,40,15,0)');x.fillStyle=vg;x.fillRect(VERD[0]-22,VERD[1]-22,44,44);
  // kayıp altın köşe: bütün katmanlar gitmiş, kâğıt görünür; kenarda kırmızımsı astar izi
  x.beginPath();LOSSP.forEach(function(q,k){var jx=q[0]+(k&&k<5?(r()-.5)*3:0),jy=q[1]+(k&&k<5?(r()-.5)*3:0);k?x.lineTo(jx,jy):x.moveTo(q[0]-2,q[1]-2);});x.closePath();
  x.fillStyle=Tezhip.pattern(x,'paper');x.fill();x.strokeStyle='rgba(150,80,50,.55)';x.lineWidth=1.4;x.stroke();
  return tzBase=C;}
function headpiece(c,A){var b=tzBuild();if(b)c.drawImage(b,170,150,660,420);
  if(!tzPat.l){tzPat.l=Tezhip.pattern(c,'lapis');tzPat.g=Tezhip.pattern(c,'gold');}
  // bakır yeşili çatlakları; desteklenince belirginliği azalır
  var sup=A(3),V=VERD;c.strokeStyle='rgba(40,28,16,'+(.85-.5*sup)+')';c.lineWidth=1.1;c.beginPath();c.moveTo(V[0]-24,V[1]-12);c.lineTo(V[0]-6,V[1]+2);c.lineTo(V[0]-14,V[1]+22);c.moveTo(V[0]-6,V[1]+2);c.lineTo(V[0]+20,V[1]-6);c.lineTo(V[0]+30,V[1]+4);c.moveTo(V[0]+2,V[1]-20);c.lineTo(V[0]-4,V[1]);c.stroke();
  if(sup>0){c.strokeStyle='rgba(243,241,234,'+(.85*sup)+')';c.setLineDash([5,4]);c.lineWidth=1.6;c.beginPath();c.ellipse(V[0],V[1],40,32,0,0,7);c.stroke();c.setLineDash([]);c.fillStyle='rgba(255,252,240,'+(.14*sup)+')';c.fill();}
  // kalkmış varak: kenarı yukarı kıvrık altın parçası, yatırılınca düzleşir
  var lv=A(2);VARAK.forEach(function(q,i){var up=(1-lv);c.save();c.translate(q[0],q[1]);c.rotate(i*1.3);
    if(up>0){c.fillStyle='rgba(0,0,0,'+(.35*up)+')';c.beginPath();c.moveTo(-1,2);c.lineTo(11,2+up*4);c.lineTo(13,7+up*4);c.lineTo(0,7);c.fill();}
    c.fillStyle=tzPat.g;c.beginPath();c.moveTo(0,0);c.lineTo(11,-up*7);c.lineTo(13,5-up*6);c.lineTo(0,5);c.closePath();c.fill();
    c.fillStyle='rgba(255,244,200,'+(.55*up)+')';c.fill();c.strokeStyle='rgba(26,18,10,'+(.35+.3*up)+')';c.lineWidth=.5;c.stroke();c.restore();});
  // kalkmış lâciverd pullar: gölgeleri ve kaymaları yatırıldıkça kaybolur
  var cs=A(1);FLAKES.forEach(function(f){var off=(1-cs)*3.5;c.save();c.translate(f[0],f[1]);c.rotate(f[3]);
    function shp(){c.beginPath();f[4].forEach(function(p,k){k?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]);});c.closePath();}
    if(off>0){c.save();c.translate(off*.6+1,off+1.5);shp();c.fillStyle='rgba(0,0,0,'+(.5*(1-cs))+')';c.fill();c.restore();c.save();c.translate(off*.4,off*.6);shp();c.fillStyle='rgba(226,214,184,'+(.9*(1-cs))+')';c.fill();c.restore();}
    c.translate(-off*.3,-off*.5);shp();c.fillStyle=tzPat.l;c.fill();c.strokeStyle='rgba('+(cs>.98?'10,20,60,.35':'150,180,240,'+(.6*(1-cs)+.15))+')';c.lineWidth=.6;c.stroke();c.restore();});}
var tezhip={steps:[
  ['Mikroskop altında inceleme','İNCELEME','Kalkan boya pulları, gevşek altın varak, kayıp alanlar ve bakır yeşilinin kâğıtta açtığı çatlaklar büyüteç altında haritalanır.','Stereo mikroskop, büyüteç, fotoğraf'],
  ['Boya pullarını yatırma','PİGMENT SAĞLAMLAŞTIRMA','Kalkan pulların altına ince fırçayla çok seyreltik tutkal verilir; pul yerine yatırılıp silikonlu kâğıt üzerinden hafifçe bastırılır.','Mersin balığı tutkalı (%1–2), sıfır numara fırça'],
  ['Gevşek varağı sabitleme','VARAK','Kalkmış altın varak kenarları aynı yöntemle yerine yatırılır. Kayıp altın yeniden yapılmaz; özgün olmayan altın eklenmez.','Tutkal, ısıtılmış mikro spatula'],
  ['Bakır yeşili bölgeye destek','KÂĞIT DESTEĞİ','Bakır yeşili pigment kâğıdı zamanla kırılgan yapar. Çatlayan alan arkadan çok ince Japon kâğıdıyla desteklenir.','Japon kâğıdı (3–5 g/m²), Klucel G'],
  ['Muhafaza ve ışık','IŞIK SINIRI','Tezhipli sayfalar ışığa duyarlıdır; sergide en fazla 50 lüks ışık ve kısa süreli gösterim uygulanır.','Lüksmetre, UV filtreli aydınlatma']],
  draw:function(c,A,s,p,tm){mat(c);shadow(c,170,150,660,420);headpiece(c,A);
    if(s===0){var lx=500+Math.sin(tm*.9)*190,ly=340+Math.cos(tm*1.3)*80;c.save();c.beginPath();c.arc(lx,ly,95,0,7);c.clip();c.translate(lx,ly);c.scale(2.2,2.2);c.translate(-lx,-ly);headpiece(c,A);c.restore();
      c.strokeStyle='#F3F1EA';c.lineWidth=6;c.beginPath();c.arc(lx,ly,95,0,7);c.stroke();c.fillStyle='#2A2E2C';c.save();c.translate(lx,ly);c.rotate(.8);c.fillRect(90,-12,120,24);c.restore();}
    if(s===1&&p<1){var f=FLAKES[Math.max(0,Math.min(15,Math.floor(p*16)))];brush(c,f[0],f[1],-.7);}
    if(s===4){var l=A(4);c.fillStyle='rgba(10,20,18,'+(.38*l)+')';c.fillRect(0,0,W,H);tag(c,'≤ 50 lüks',500,640);}
    if(s===3&&p<1)tag(c,'arkadan destek',VERD[0],VERD[1]+62);}};

/* ---------- ŞİRAZE ---------- */
var SC=['#9B2D20','#2F6B5A','#C99A3E','#F2E6C8'],SCN=['#C46254','#5E9682','#DDB866','#F7EEDA'];
// ipek örgü: her baklava, çekirdeğe sarılmış ince ipliklerden oluşur; ipeğin parlaklığı ve çekirdeğin yuvarlaklığı gölgelenir
function band(c,x0,x1,y,pal,alpha,fade){c.save();c.globalAlpha=alpha;for(var x=x0;x<x1;x+=22){var i=Math.floor((x-200)/22);for(var r=0;r<3;r++){var yy=y+r*28,col=pal[(i+r)%4];
    c.save();c.beginPath();c.moveTo(x,yy);c.lineTo(x+11,yy+14);c.lineTo(x,yy+28);c.lineTo(x-11,yy+14);c.closePath();c.fillStyle=col;c.fill();c.clip();
    c.lineWidth=1.1;for(var k=-14;k<=14;k+=2.6){c.strokeStyle=(Math.round(k)%2?'rgba(255,255,255,.2)':'rgba(0,0,0,.2)');c.beginPath();c.moveTo(x-11,yy+14+k);c.lineTo(x,yy+k);c.lineTo(x+11,yy+14+k);c.stroke();}
    var sh=c.createLinearGradient(x-11,0,x+11,0);sh.addColorStop(0,'rgba(0,0,0,.28)');sh.addColorStop(.45,'rgba(255,255,255,.22)');sh.addColorStop(1,'rgba(0,0,0,.3)');c.fillStyle=sh;c.fillRect(x-11,yy,22,28);c.restore();
    c.strokeStyle='rgba(20,10,6,.4)';c.lineWidth=.8;c.beginPath();c.moveTo(x,yy);c.lineTo(x+11,yy+14);c.lineTo(x,yy+28);c.lineTo(x-11,yy+14);c.closePath();c.stroke();}}
  var cy=c.createLinearGradient(0,y,0,y+84);cy.addColorStop(0,'rgba(255,240,210,.18)');cy.addColorStop(.3,'rgba(0,0,0,0)');cy.addColorStop(1,'rgba(0,0,0,.3)');c.fillStyle=cy;c.fillRect(x0-11,y,x1-x0,84);
  c.restore();if(fade){c.fillStyle='rgba(235,225,205,'+fade+')';c.fillRect(x0-11,y,x1-x0,84);}}
var SIRAZE_B=null;
function sirazeBase(){return SIRAZE_B||(SIRAZE_B=base('siraze',150,200,700,420,function(x){var r=rng(61),i;
  // metin bloğunun baş kenarı: üst üste binmiş yaprak kenarları, tozla kararmış
  x.fillStyle='#E6D8B2';x.fillRect(150,200,700,420);
  for(var y=200;y<620;y+=1.15){var t=.5+r()*.5;x.fillStyle='rgba('+Math.round(120+40*t)+','+Math.round(95+30*t)+','+Math.round(58+20*t)+','+(.12+r()*.28).toFixed(2)+')';x.fillRect(150,y+Math.sin(y*.13)*.6,700,.7);}
  var dg=x.createLinearGradient(0,200,0,330);dg.addColorStop(0,'rgba(90,70,45,.35)');dg.addColorStop(1,'rgba(90,70,45,0)');x.fillStyle=dg;x.fillRect(150,200,700,130);
  var dg2=x.createLinearGradient(0,620,0,450);dg2.addColorStop(0,'rgba(90,70,45,.3)');dg2.addColorStop(1,'rgba(90,70,45,0)');x.fillStyle=dg2;x.fillRect(150,450,700,170);
  noiseFill(x,150,200,700,420,'rgba(110,90,60,.25)',1600,62,2);
  // sırt derisi ve şirazenin oturduğu deri çekirdek
  var lc=window.__TX&&window.__TX.leather({plain:true});if(lc){var lk=lc.width/1024;x.drawImage(lc,0,300*lk,1024*lk,180*lk,150,330,700,120);}else{x.fillStyle='#5A3324';x.fillRect(150,330,700,120);}
  var sg=x.createLinearGradient(0,330,0,450);sg.addColorStop(0,'rgba(0,0,0,.45)');sg.addColorStop(.15,'rgba(0,0,0,0)');sg.addColorStop(.85,'rgba(0,0,0,0)');sg.addColorStop(1,'rgba(0,0,0,.5)');x.fillStyle=sg;x.fillRect(150,330,700,120);
  x.fillStyle=pat(x,'tone');x.fillRect(180,345,640,90);var cg=x.createLinearGradient(0,345,0,435);cg.addColorStop(0,'rgba(255,220,180,.18)');cg.addColorStop(.5,'rgba(0,0,0,0)');cg.addColorStop(1,'rgba(0,0,0,.45)');x.fillStyle=cg;x.fillRect(180,345,640,90);
  // kayıp kısımda kopmuş iplik uçları
  for(i=0;i<16;i++){var bx=556+r()*150,by=346+r()*84;x.strokeStyle=SC[i%4];x.lineWidth=1.6;x.beginPath();x.moveTo(bx,by);x.quadraticCurveTo(bx+r()*8-4,by+5,bx+r()*10-5,by+8+r()*8);x.stroke();}
  band(x,200,560,348,SC,1,.24);band(x,700,820,348,SC,1,.24);}));}
var siraze={steps:[
  ['Durum tespiti','DURUM TESPİTİ','Kopan ve sarkan ipek iplikler, solan renkler ve kayıp kısım belgelenir. Örgü deseni ve renk sırası kayda geçirilir.','Büyüteç, fotoğraf, renk kartı'],
  ['Temizlik','KURU TEMİZLİK','Toz, ince bir tül araya konarak düşük güçlü vakumla alınır; böylece gevşek iplikler emilmez.','Düşük güçlü vakum, polyester tül'],
  ['Gevşek iplikleri sabitleme','SABİTLEME','Sarkan iplikler yerine yatırılır ve ince ipek iplikle, kavisli iğneyle mevcut örgüye tutturulur.','İnce ipek iplik, kavisli iğne'],
  ['Kayıp kısmı örme','TAMAMLAMA','Tamamen kaybolmuş kısım, aynı renk sırasıyla ipekle yeniden örülür. Yeni örgü biraz açık tonda kalır ve ayırt edilebilir.','Renkli ipek iplik, iğne'],
  ['Belgeleme','BELGELEME','Önce ve sonra fotoğraflanır; kullanılan iplik ve yöntem rapora işlenir.','Fotoğraf, konservasyon raporu']],
  draw:function(c,A,s,p,tm){mat(c);shadow(c,150,200,700,420);var B=sirazeBase();if(B)blit(c,B);else{c.fillStyle='#EDE1C0';c.fillRect(150,200,700,420);}
    var re=A(3);if(re>0){var xe=560+140*re;c.save();c.beginPath();c.rect(560-11,340,xe-560+11,100);c.clip();band(c,560,700,348,SCN,1,0);c.restore();}
    // sarkan ipek iplikler: parlak, uçları dağılmış
    var lay=A(2);c.lineCap='round';[[430,'#9B2D20'],[460,'#2F6B5A'],[490,'#C99A3E'],[520,'#9B2D20']].forEach(function(t,i){var x=t[0],ex=x+(1-lay)*20,ey=600*(1-lay)+410*lay;
      c.beginPath();c.moveTo(x,400);c.bezierCurveTo(x+(1-lay)*40,480*(1-lay)+400*lay,x-(1-lay)*30+i*4,540*(1-lay)+405*lay,ex,ey);c.strokeStyle='rgba(0,0,0,.3)';c.lineWidth=5;c.stroke();c.strokeStyle=t[1];c.lineWidth=3.6;c.stroke();c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=1;c.stroke();
      if(lay<.95){c.strokeStyle=t[1];c.lineWidth=.9;for(var f=-1;f<=1;f++){c.beginPath();c.moveTo(ex,ey);c.lineTo(ex+f*5*(1-lay),ey+9*(1-lay));c.stroke();}}});
    var d=1-A(1);if(d>0){c.fillStyle='rgba(180,170,150,'+(.2*d)+')';c.fillRect(150,200,700,420);c.globalAlpha=d;noiseFill(c,150,200,700,420,'rgba(200,190,170,.5)',1800,31,3);c.globalAlpha=1;}
    if(s===0){marker(c,480,620,1,false,cl(p*2,0,1));marker(c,630,330,2,false,cl(p*2-.3,0,1));marker(c,250,330,3,false,cl(p*2-.6,0,1));}
    if(s===1&&p<1){var vx=200+p*600;c.fillStyle='rgba(255,255,255,.22)';c.fillRect(vx-60,300,120,180);c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=.8;for(var q=0;q<20;q++){c.beginPath();c.moveTo(vx-60+q*6,300);c.lineTo(vx-60+q*6,480);c.stroke();}for(q=0;q<15;q++){c.beginPath();c.moveTo(vx-60,300+q*12);c.lineTo(vx+60,300+q*12);c.stroke();}
      var ng=c.createLinearGradient(vx-20,0,vx+20,0);ng.addColorStop(0,'#3E4741');ng.addColorStop(.5,'#7B857F');ng.addColorStop(1,'#3E4741');c.fillStyle=ng;c.fillRect(vx-20,180,40,110);c.fillStyle='#2A302C';c.fillRect(vx-24,282,48,10);tag(c,'vakum + tül',vx,160);}
    if(s===2&&p<1){var nx=430+p*100;c.strokeStyle='#9A9C98';c.lineWidth=3;c.beginPath();c.arc(nx,400,30,Math.PI*.2,Math.PI*1.1);c.stroke();c.strokeStyle='#E7E8E3';c.lineWidth=1;c.stroke();c.strokeStyle='rgba(155,45,32,.9)';c.lineWidth=1;c.beginPath();c.moveTo(nx+Math.cos(Math.PI*1.1)*30,400+Math.sin(Math.PI*1.1)*30);c.quadraticCurveTo(nx-60,330,nx-90,360);c.stroke();}
    if(s===3&&p<1)tag(c,'yeni örgü',560+140*A(3),300);
    if(s===4){var a=A(4);c.strokeStyle='rgba(243,241,234,'+a+')';c.lineWidth=5;[[130,180,1,1],[870,180,-1,1],[130,640,1,-1],[870,640,-1,-1]].forEach(function(k){c.beginPath();c.moveTo(k[0],k[1]+40*k[3]);c.lineTo(k[0],k[1]);c.lineTo(k[0]+40*k[2],k[1]);c.stroke();});if(p<.15){c.fillStyle='rgba(255,255,255,'+(1-p/.15)*.6+')';c.fillRect(0,0,W,H);}}}};

/* ---------- MÜHÜR ---------- */
// Mühür baskısı: mürekkepli zemin, yazı kâğıt renginde kalır (kazıma mühür); basınç farkı yüzünden mürekkep yer yer eksik, kırmızı mühür hafifçe dağılmış
function seal(c,x,y,rx,ry,col,seed){var r=rng(seed),i,P=new Path2D();P.ellipse(x,y,rx,ry,0,0,7);
  c.save();if(col!=='#1E1A16'){c.shadowColor='rgba(142,42,30,.45)';c.shadowBlur=10;}c.globalAlpha=.9;c.fillStyle=col;c.fill(P);c.restore();
  c.save();c.clip(P);var pap='rgba(236,224,192,';
  // basınç: bir yanı daha soluk, kenarlarda koyu birikinti
  var pg=c.createLinearGradient(x-rx,y-ry,x+rx,y+ry);pg.addColorStop(0,pap+'0)');pg.addColorStop(1,pap+(.18+r()*.15)+')');c.fillStyle=pg;c.fillRect(x-rx,y-ry,2*rx,2*ry);
  c.lineWidth=3;c.strokeStyle='rgba(0,0,0,.25)';c.stroke(P);
  // iç çerçeve ve yazı (kâğıt rengi)
  c.strokeStyle=pap+'.95)';c.lineWidth=1.6;c.beginPath();c.ellipse(x,y,rx-6,ry-6,0,0,7);c.stroke();
  var nl=ry>50?3:2,lh=(ry*1.3)/nl;c.fillStyle=pap+'.95)';for(i=0;i<nl;i++){var yy=y-ry*.42+lh*(i+.75),hw=Math.sqrt(Math.max(0,1-Math.pow((yy-y)/ry,2)))*rx*.72;if(hw<10)continue;var p=Tezhip.script(x-hw,x+hw,yy,Math.min(lh*.8,22),Math.floor(r()*9999)+seed*13,true,true);c.fill(p);}
  for(i=0;i<5;i++){c.beginPath();c.arc(x-rx*.5+r()*rx,y-ry*.65+r()*ry*.15,1.2,0,7);c.fill();}
  // mürekkebin tutmadığı benekler
  for(i=0;i<120;i++){var a=r()*Math.PI*2,q=Math.sqrt(r()),bx=x+Math.cos(a)*rx*q,by=y+Math.sin(a)*ry*q;c.fillStyle=pap+(.3+r()*.5)+')';c.fillRect(bx,by,.6+r()*1.8,.6+r()*1.4);}
  c.restore();}
var MS=[[370,540,62,62,'#1E1A16',4],[600,480,56,76,'#8E2A1E',8],[500,640,34,34,'#1E1A16',2]];
var TEAR=(function(){var r=rng(71),pts=[[585,740],[596,690],[588,640],[604,580],[594,520],[610,450]],o=[];for(var i=0;i<pts.length-1;i++){var a=pts[i],b=pts[i+1];for(var k=0;k<6;k++){var t=k/6;o.push([a[0]+(b[0]-a[0])*t+(r()-.5)*4,a[1]+(b[1]-a[1])*t]);}}o.push(pts[pts.length-1]);
  var fib=o.map(function(q){return [q[0],q[1],(r()-.5)*10,(r()-.5)*6];});return {pts:o,fib:fib};})();
var MUHUR_B=null;
function muhurBase(){return MUHUR_B||(MUHUR_B=base('muhur',220,100,560,640,function(x){paperArea(x,220,100,560,640,81,.3);
  var ys=[];for(var y=158;y<430;y+=30)ys.push(y);scriptLines(x,260,740,ys,17,82,function(li,r){return 'rgba(30,22,16,'+(.82+r()*.12)+')';});
  MS.forEach(function(m){seal(x,m[0],m[1],m[2],m[3],m[4],m[5]);});}));}
var muhur={steps:[
  ['Okuma ve belgeleme','BELGELEME','Mühürler fotoğraflanır, okunur ve kimin, hangi tarihte basıldığı kayda geçer. Mühürler eserin el değiştirme tarihidir.','Fotoğraf, büyüteç, mühür kataloğu'],
  ['Çözünürlük testi','TEST','Görünmeyen bir kenarda nemli pamuklu çubukla mürekkebin suya dayanımı denenir. Kırmızı mühür hafifçe dağılırsa suya duyarlıdır.','Pamuklu çubuk, saf su, kurutma kâğıdı'],
  ['Mühür alanını koruma','KORUMA','Suya duyarlı mühür, nemli işlemlerden yalıtılır; o bölgede yalnızca kuru ve yerel işlem yapılır.','Kurutma kâğıdı, yerel nem kontrolü'],
  ['Mürekkebi sağlamlaştırma','SAĞLAMLAŞTIRMA','Tozuyan mühür mürekkebi ince fırçayla çok seyreltik tutkal verilerek yerinde tutturulur.','Jelatin ya da metilselüloz (%0,5–1)'],
  ['Yırtık onarımı','YIRTIK ONARIMI','Mühürden geçen yırtık arkadan ince Japon kâğıdıyla birleştirilir; mührün ön yüzü kapatılmaz.','Japon kâğıdı (6–9 g/m²), buğday nişastası']],
  draw:function(c,A,s,p,tm){mat(c);shadow(c,220,100,560,640);var B=muhurBase();if(B)blit(c,B);else{c.fillStyle='#EFE3C2';c.fillRect(220,100,560,640);}
    // yırtık: lifli kenarlar ve gölge; arkadan desteklenince kapanır
    var tr=A(4),gap=2.6*(1-tr*.8);c.lineJoin='round';c.beginPath();TEAR.pts.forEach(function(q,i){i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]);});c.strokeStyle='rgba(30,95,81,'+(1-tr*.9)+')';c.lineWidth=gap;c.stroke();
    c.strokeStyle='rgba(60,45,30,'+(.6-.4*tr)+')';c.lineWidth=.8;c.stroke();c.strokeStyle='rgba(250,244,226,'+(.7*(1-tr))+')';c.lineWidth=.7;TEAR.fib.forEach(function(f){c.beginPath();c.moveTo(f[0],f[1]);c.lineTo(f[0]+f[2],f[1]+f[3]);c.stroke();});
    if(tr>0){c.save();c.globalAlpha=.5*tr;c.fillStyle=pat(c,'tissue');c.beginPath();c.rect(574,450+290*(1-tr),48,290*tr);c.fill();c.fillStyle='rgba(255,253,244,.25)';c.fill();c.restore();}
    // test noktası ve dağılma
    var ts=A(1);if(ts>0){var tg=c.createRadialGradient(648,540,0,648,540,6+12*ts);tg.addColorStop(0,'rgba(142,42,30,'+(.35*ts)+')');tg.addColorStop(1,'rgba(142,42,30,0)');c.fillStyle=tg;c.beginPath();c.arc(648,540,6+12*ts,0,7);c.fill();}
    // tozuyan mürekkep pulları
    var cs=A(3),rr=rng(9);for(var i=0;i<14;i++){var fx=330+rr()*80,fy=500+rr()*80,o=(1-cs)*4,sz=3+rr()*3,an=rr()*3;c.save();c.translate(fx,fy);c.rotate(an);if(o>0){c.fillStyle='rgba(0,0,0,'+(.4*(1-cs))+')';c.fillRect(o-sz/2,o-sz/3,sz,sz*.66);}c.fillStyle='#1E1A16';c.beginPath();c.moveTo(-o-sz/2,-o);c.lineTo(-o,-o-sz/3);c.lineTo(-o+sz/2,-o+sz*.1);c.lineTo(-o,-o+sz/3);c.closePath();c.fill();c.restore();}
    if(s===0){MS.forEach(function(m,i){var a=cl(p*2-i*.3,0,1);c.strokeStyle='rgba(243,241,234,'+a+')';c.setLineDash([6,6]);c.lineWidth=2;c.strokeRect(m[0]-m[2]-14,m[1]-m[3]-14,2*m[2]+28,2*m[3]+28);c.setLineDash([]);});tag(c,'sahip · tarih',600,370);}
    if(s===1&&p<1){c.save();c.translate(648+20,540-20);c.rotate(.7);c.fillStyle='#E9E3D3';c.fillRect(-4,-150,8,140);c.fillStyle='#F7F5EF';c.beginPath();c.ellipse(0,-6,12,16,0,0,7);c.fill();c.fillStyle=pat(c,'tissue');c.fill();c.restore();}
    if(s===1&&p>.6)tag(c,'suya duyarlı',648,600,'rgba(155,45,32,.9)');
    var bz=A(2);if(bz>0){c.strokeStyle='rgba(120,180,220,'+bz+')';c.lineWidth=4;c.setLineDash([10,8]);c.beginPath();c.ellipse(600,480,92,112,0,0,7);c.stroke();c.setLineDash([]);if(s===2)tag(c,'nemden korunur',600,330);}
    if(s===3&&p<1)brush(c,330+p*80,500+Math.sin(p*20)*30,-.6);}};

/* ---------- MÜREKKEP (demir-gal korozyonu) ---------- */
// Demir-gal mürekkebi: kahverengiye dönmüş harfler, çevresinde hale, harf içinde çatlak ve delikler (delikten altındaki masa görünür)
var CRACKS=[],MUREKKEP_B=null;
function murekkepBase(){return MUREKKEP_B||(MUREKKEP_B=base('murekkep',220,100,560,640,function(x,S){paperArea(x,220,100,560,640,91,.28);
  var ys=[];for(var row=0;row<9;row++)ys.push(176+row*60);
  var W=scriptLines(x,262,738,ys,30,92,function(li,r){var k=r();return k<.5?'rgba(52,34,20,.94)':k<.8?'rgba(70,44,24,.9)':'rgba(34,24,16,.95)';},'rgba(150,92,38,.5)',S);
  // çatlak ve delikler: yalnızca mürekkebin üstünde
  var r=rng(93),tries=0;while(CRACKS.length<34&&tries<6000){tries++;var w=W[Math.floor(r()*W.length)],cx=w[1]+r()*(w[2]-w[1]),cy=w[3]-r()*26+4;
    var inside=x.isPointInPath(w[0],(cx-220)*S,(cy-100)*S);if(!inside)continue;
    var hole=r()<.4;CRACKS.push([cx,cy,hole]);
    if(hole){x.save();x.globalCompositeOperation='destination-out';x.beginPath();var hr=2.6+r()*3;x.ellipse(cx,cy,hr,hr*.75,r()*3,0,7);x.fill();x.restore();x.strokeStyle='rgba(90,55,25,.75)';x.lineWidth=1;x.beginPath();x.ellipse(cx,cy,hr+1,hr*.75+1,0,0,7);x.stroke();}
    else{x.strokeStyle='rgba(225,210,178,.95)';x.lineWidth=1;x.beginPath();x.moveTo(cx,cy-5);x.lineTo(cx+2,cy-1);x.lineTo(cx-1,cy+2);x.lineTo(cx+2,cy+6);x.stroke();}}}));}
var murekkep={steps:[
  ['Belirtiler','DURUM TESPİTİ','Demir-gal mürekkebi zamanla kâğıdı asitlendirir: harflerin çevresinde kahverengi hale, harf içlerinde çatlak ve delikler oluşur.','Işık masası, büyüteç, fotoğraf'],
  ['Demir iyonu testi','TEST','Nemli batofenantrolin test kâğıdı harfe kısaca değdirilir. Pembe-kırmızı renk, bozulmayı hızlandıran serbest demir(II) iyonlarını gösterir.','Batofenantrolin test kâğıdı'],
  ['Sulu işlem','KİMYASAL KARARLILIK','Kâğıt ve mürekkep uygunsa yaprak kalsiyum fitat banyosundan geçirilir; ardından kalsiyum bikarbonat alkali bir rezerv bırakır. Hale geri gitmez ama bozulma yavaşlar.','Kalsiyum fitat, kalsiyum bikarbonat'],
  ['Çatlaklara destek','DESTEK','Çatlak ve delikli harfler arkadan, az nemle çalışan hazır (re-moistenable) Japon kâğıdıyla desteklenir.','Klucel G ya da jelatin kaplı Japon kâğıdı'],
  ['Kararlı iklim','MUHAFAZA','Nem, demir-gal bozulmasını hızlandırır. Eser %45–55 bağıl nemde, sabit iklimde saklanır.','Kutu, iklim kontrollü depo']],
  draw:function(c,A,s,p,tm){mat(c);shadow(c,220,100,560,640);var B=murekkepBase();if(B)blit(c,B);else{c.fillStyle='#EFE3C2';c.fillRect(220,100,560,640);}
    // arkadan Japon kâğıdı yamaları: delikler kapanır, yama lifleri görünür
    var ds=A(3);if(ds>0)CRACKS.forEach(function(q,i){c.save();c.globalAlpha=ds;var P=blobPath(q[0],q[1],13,11,i,300+i,14);c.fillStyle='rgba(238,228,200,'+(q[2]?.85:.3)+')';c.fill(P);c.fillStyle=pat(c,'tissue');c.fill(P);c.strokeStyle='rgba(150,125,90,.35)';c.lineWidth=.8;c.stroke(P);c.restore();});
    if(s===0){marker(c,300,178,1,false,cl(p*2,0,1));marker(c,560,358,2,false,cl(p*2-.4,0,1));}
    var ts=A(1);if(s===1&&ts>0){c.save();c.translate(515,315);c.rotate(-.06);c.fillStyle='#FBFAF6';c.fillRect(-36,-36,72,72);c.fillStyle=pat(c,'tissue');c.fillRect(-36,-36,72,72);c.strokeStyle='rgba(0,0,0,.12)';c.strokeRect(-36,-36,72,72);
      var pg=c.createRadialGradient(0,0,2,0,0,28);pg.addColorStop(0,'rgba(200,30,90,'+(.8*ts)+')');pg.addColorStop(1,'rgba(200,30,90,0)');c.fillStyle=pg;c.beginPath();c.ellipse(0,0,28,15,0,0,7);c.fill();c.restore();if(p>.5)tag(c,'Fe²⁺ var',515,385,'rgba(194,24,91,.9)');}
    if(s===2){c.fillStyle='rgba(120,180,220,'+(.22*Math.sin(Math.PI*p))+')';c.fillRect(220,100,560,640);c.strokeStyle='rgba(255,255,255,'+(.5*Math.sin(Math.PI*p))+')';c.lineWidth=2;for(var k=0;k<6;k++){c.beginPath();for(var xx=220;xx<=780;xx+=10)c.lineTo(xx,140+k*110+Math.sin(xx/30+tm*3+k)*8);c.stroke();}if(p>.7)tag(c,'kararlı',500,130,'rgba(46,125,102,.95)');}
    if(s===4){var a=A(4);c.fillStyle='rgba(16,20,18,'+(.85*a)+')';c.beginPath();c.roundRect?c.roundRect(780,620,190,120,12):c.rect(780,620,190,120);c.fill();c.fillStyle='rgba(243,241,234,'+a+')';c.font='600 40px '+MONO;c.textAlign='center';c.fillText('%50',875,690);c.font='500 18px '+MONO;c.fillText('BAĞIL NEM',875,722);}}};


var CFG={cilt:cilt,tezhip:tezhip,siraze:siraze,muhur:muhur,murekkep:murekkep},T={};
$$('[data-tr]').forEach(function(p){var k=p.dataset.tr;if(CFG[k])T[k]=new Treat(p,CFG[k]);});
// sekmeler
var root=$('#tr-tabs');if(root){var tabs=$$('[role="tab"]',root),panes=$$('[data-trpane]');
  tabs.forEach(function(t){t.addEventListener('click',function(){var k=t.dataset.k;tabs.forEach(function(x){x.setAttribute('aria-selected',x===t);});panes.forEach(function(p){p.hidden=p.dataset.trpane!==k;});if(T[k])T[k].show();});});}
})();
