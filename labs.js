/* Depo sistemleri: iklim kontrolü, argon gazlı söndürme, mikro-XRF
   Fizik: kararlı akışkan çözücü (Stam: yarı-Lagrange taşınım + basınç izdüşümü), kaldırma kuvveti,
   Magnus nem formülü, PI denetleyici, oksijene bağlı yanma, Monte Carlo foton sayımı. */
(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s);},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s));};
var root=$('#labs');if(!root)return;
var LW=760,LH=460,FONT='"IBM Plex Mono",ui-monospace,Menlo,monospace',INK='rgba(243,241,234,',MAT='#16463C';
function clamp(x,a,b){return x<a?a:x>b?b:x;}
function lerp(a,b,t){return a+(b-a)*t;}
function fmt(x,d){return x.toFixed(d==null?1:d).replace('.',',');}
function mix(c1,c2,t){return [lerp(c1[0],c2[0],t),lerp(c1[1],c2[1],t),lerp(c1[2],c2[2],t)];}
function ramp(stops,x){if(x<=stops[0][0])return stops[0][1];for(var i=1;i<stops.length;i++)if(x<=stops[i][0]){var a=stops[i-1],b=stops[i];return mix(a[1],b[1],(x-a[0])/(b[0]-a[0]));}return stops[stops.length-1][1];}
function gauss(){var u=1-Math.random(),v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
// Doymuş buhar basıncı (hPa), Magnus formülü
function es(T){return 6.112*Math.exp(17.62*T/(243.12+T));}

/* ---------- Sahne: retina uyumlu tuval, görünürken çalışan döngü ---------- */
function Stage(cv,frame){var ctx=cv.getContext('2d'),self=this,dpr=1,on=false,vis=false,last=0,raf=0;
  function size(){var w=cv.clientWidth||LW;dpr=Math.min(2,window.devicePixelRatio||1);cv.width=Math.round(w*dpr);cv.height=Math.round(w*LH/LW*dpr);}
  if('ResizeObserver' in window)new ResizeObserver(size).observe(cv);size();
  function loop(t){raf=0;if(!(on&&vis))return;var dt=Math.max(0,Math.min(.05,(t-last)/1000));last=t;
    var k=cv.width/LW;ctx.setTransform(k,0,0,k,0,0);frame(ctx,dt);raf=requestAnimationFrame(loop);}
  function kick(){if(on&&vis&&!raf){last=performance.now();raf=requestAnimationFrame(loop);}}
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){vis=es[0].isIntersecting;kick();},{threshold:.05}).observe(cv);else vis=true;
  this.run=function(v){on=v;kick();};this.ctx=ctx;}

/* ---------- Akışkan çözücü (eşyerleşimli ızgara, hücre/sn birimleri) ---------- */
function Fluid(nx,ny){var n=nx*ny;this.nx=nx;this.ny=ny;this.u=new Float32Array(n);this.v=new Float32Array(n);this.u0=new Float32Array(n);this.v0=new Float32Array(n);
  this.p=new Float32Array(n);this.dv=new Float32Array(n);this.solid=new Uint8Array(n);this.S={};this.tmp=new Float32Array(n);this.fix=[];
  for(var i=0;i<nx;i++){this.solid[i]=1;this.solid[i+(ny-1)*nx]=1;}for(var j=0;j<ny;j++){this.solid[j*nx]=1;this.solid[nx-1+j*nx]=1;}}
Fluid.prototype.rect=function(i0,j0,i1,j1){for(var j=j0;j<j1;j++)for(var i=i0;i<i1;i++)this.solid[i+j*this.nx]=1;};
Fluid.prototype.scalar=function(name,v){var a=new Float32Array(this.nx*this.ny);a.fill(v);this.S[name]=a;return a;};
Fluid.prototype.at=function(f,x,y){var nx=this.nx,ny=this.ny;x=clamp(x,.5,nx-1.5);y=clamp(y,.5,ny-1.5);var i=x|0,j=y|0,fx=x-i,fy=y-j,k=i+j*nx;
  return (f[k]*(1-fx)+f[k+1]*fx)*(1-fy)+(f[k+nx]*(1-fx)+f[k+nx+1]*fx)*fy;};
Fluid.prototype.advect=function(dst,src,dt){var nx=this.nx,ny=this.ny,u=this.u0,v=this.v0,s=this.solid;
  for(var j=1;j<ny-1;j++)for(var i=1;i<nx-1;i++){var k=i+j*nx;if(s[k])continue;dst[k]=this.at(src,i-dt*u[k],j-dt*v[k]);}};
Fluid.prototype.extend=function(f){var nx=this.nx,ny=this.ny,s=this.solid;
  for(var j=0;j<ny;j++)for(var i=0;i<nx;i++){var k=i+j*nx;if(!s[k])continue;var sum=0,c=0;
    if(i>0&&!s[k-1]){sum+=f[k-1];c++;}if(i<nx-1&&!s[k+1]){sum+=f[k+1];c++;}if(j>0&&!s[k-nx]){sum+=f[k-nx];c++;}if(j<ny-1&&!s[k+nx]){sum+=f[k+nx];c++;}if(c)f[k]=sum/c;}};
Fluid.prototype.applyFix=function(){for(var q=0;q<this.fix.length;q++){var f=this.fix[q];this.u[f.k]=f.u;this.v[f.k]=f.v;}};
Fluid.prototype.project=function(it){var nx=this.nx,ny=this.ny,u=this.u,v=this.v,p=this.p,d=this.dv,s=this.solid,j,i,k;
  for(j=1;j<ny-1;j++)for(i=1;i<nx-1;i++){k=i+j*nx;if(s[k])continue;
    d[k]=-.5*((s[k+1]?0:u[k+1])-(s[k-1]?0:u[k-1])+(s[k+nx]?0:v[k+nx])-(s[k-nx]?0:v[k-nx]));}
  for(var n=0;n<it;n++)for(j=1;j<ny-1;j++)for(i=1;i<nx-1;i++){k=i+j*nx;if(s[k])continue;var sum=0,c=0;
    if(!s[k+1]){sum+=p[k+1];c++;}if(!s[k-1]){sum+=p[k-1];c++;}if(!s[k+nx]){sum+=p[k+nx];c++;}if(!s[k-nx]){sum+=p[k-nx];c++;}
    p[k]=c?(d[k]+sum)/c:0;}
  for(j=1;j<ny-1;j++)for(i=1;i<nx-1;i++){k=i+j*nx;if(s[k])continue;var pc=p[k];
    u[k]-=.5*((s[k+1]?pc:p[k+1])-(s[k-1]?pc:p[k-1]));v[k]-=.5*((s[k+nx]?pc:p[k+nx])-(s[k-nx]?pc:p[k-nx]));}};
Fluid.prototype.step=function(dt,force){var n=this.u.length,s=this.solid,k;
  if(force)force(dt);this.applyFix();
  this.u0.set(this.u);this.v0.set(this.v);this.advect(this.u,this.u0,dt);this.advect(this.v,this.v0,dt);
  this.applyFix();this.project(22);this.applyFix();
  for(k=0;k<n;k++)if(s[k]){this.u[k]=0;this.v[k]=0;}
  this.u0.set(this.u);this.v0.set(this.v);
  for(var name in this.S){var f=this.S[name];this.extend(f);this.tmp.set(f);this.advect(f,this.tmp,dt);}
  for(var q=0;q<this.fix.length;q++){var fx=this.fix[q];if(fx.S)for(var nm in fx.S)this.S[nm][fx.k]=fx.S[nm];}};
// Alanı küçük bir görüntüye boyayıp yumuşatarak büyüt
function FieldView(fl){var c=document.createElement('canvas');c.width=fl.nx;c.height=fl.ny;this.c=c;this.x=c.getContext('2d');this.img=this.x.createImageData(fl.nx,fl.ny);this.fl=fl;}
FieldView.prototype.paint=function(ctx,color,ox,oy,cs,alpha){var d=this.img.data,fl=this.fl,n=fl.nx*fl.ny;
  for(var k=0;k<n;k++){var c=color(k);d[k*4]=c[0];d[k*4+1]=c[1];d[k*4+2]=c[2];d[k*4+3]=c[3]==null?255:c[3];}
  this.x.putImageData(this.img,0,0);ctx.save();ctx.imageSmoothingEnabled=true;ctx.globalAlpha=alpha==null?1:alpha;ctx.drawImage(this.c,ox,oy,fl.nx*cs,fl.ny*cs);ctx.restore();};
// İzleyici parçacıklar: hız alanında taşınır, katıya çarparsa yeniden doğar
function tracer(fl,p,dt){var u=fl.at(fl.u,p.x,p.y),v=fl.at(fl.v,p.x,p.y);p.px=p.x;p.py=p.y;p.x+=u*dt;p.y+=v*dt;p.sp=Math.hypot(u,v);
  var i=p.x|0,j=p.y|0;return !(i<1||j<1||i>=fl.nx-1||j>=fl.ny-1||fl.solid[i+j*fl.nx]);}
function label(ctx,t,x,y,al,col){ctx.font='500 11px '+FONT;ctx.textAlign=al||'left';ctx.fillStyle=col||INK+'.82)';ctx.fillText(t,x,y);}
function box(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function shelves(ctx,fl,rects,ox,oy,cs){rects.forEach(function(r){var x=ox+r[0]*cs,y=oy+r[1]*cs,w=(r[2]-r[0])*cs,h=(r[3]-r[1])*cs;
  ctx.fillStyle='#E9E6DE';ctx.fillRect(x,y,w,h);ctx.fillStyle='#CFCAC0';for(var yy=y+12;yy<y+h-4;yy+=19)ctx.fillRect(x+3,yy,w-6,2);
  var cols=['#6B2E22','#8C5A2B','#2F4F44','#7A6A4A','#3A3F52','#9A7B4F'],q=0;for(var yy2=y+3;yy2<y+h-16;yy2+=19)for(var xx=x+4;xx<x+w-5;xx+=6){ctx.fillStyle=cols[(q++*7)%6];ctx.fillRect(xx,yy2+((q*3)%5),4.5,13-((q*3)%5));}});}

/* ======================= 1. İKLİM KONTROLÜ ======================= */
(function(){var cv=$('#lab-iklim-cv');if(!cv)return;
  var NX=74,NY=42,CS=10,OX=10,OY=14,fl=new Fluid(NX,NY),T=fl.scalar('T',19),E=fl.scalar('e',es(19)*.5),view=new FieldView(fl);
  var SH=[[12,17,19,41],[24,17,31,41],[36,17,43,41],[48,17,55,41]];SH.forEach(function(r){fl.rect(r[0],r[1],r[2],r[3]);});
  var DIF=[5,20,32,44,58],TOUT=29,EOUT=es(29)*.7,TSET=19,RHSET=.5,door=false,broken=false,mode='T',It=0,Ie=0,Tsup=16,esup=es(16)*.6,fan=.6,doorA=0;
  var parts=[];function spawn(p){do{p.x=1+Math.random()*(NX-2);p.y=1+Math.random()*(NY-2);}while(fl.solid[(p.x|0)+(p.y|0)*NX]);p.px=p.x;p.py=p.y;return p;}
  for(var i=0;i<340;i++)parts.push(spawn({}));
  var out={t:$('#ik-t'),rh:$('#ik-rh'),sup:$('#ik-sup'),fan:$('#ik-fan'),st:$('#ik-st')},acc=0;
  function avg(){var st=0,se=0,c=0;for(var j=1;j<NY-1;j++)for(var i=1;i<NX-1;i++){var k=i+j*NX;if(fl.solid[k])continue;st+=T[k];se+=E[k];c++;}return {T:st/c,e:se/c};}
  function physics(dt){var m=avg(),rh=m.e/es(m.T);
    // PI denetleyici: besleme havasının sıcaklığı ve nemi; nem ancak soğutma serpantininin çiy noktasına kadar alınabilir
    if(!broken){var eT=TSET-m.T,eS=RHSET*es(TSET)-m.e;It=clamp(It+eT*dt,-8,8);Ie=clamp(Ie+eS*dt,-20,20);
      Tsup=clamp(TSET+3.2*eT+.45*It,10,24);esup=clamp(RHSET*es(TSET)+2.4*eS+.35*Ie,es(Tsup)*.15,es(Tsup)*.95);
      fan=lerp(fan,clamp(.55+.22*Math.abs(eT)+.012*Math.abs(rh-RHSET)*100,.55,1),dt*1.5);}
    else fan=lerp(fan,0,dt*1.2);
    doorA=lerp(doorA,door?1:0,dt*3);
    fl.fix=[];var V=7*fan,Vr=V*20/16;
    // her koridorun üstünde bir besleme menfezi; dönüş havası alttan (sol duvar) ve tavanın sağından emilir
    if(fan>.02){DIF.forEach(function(a){for(var i=a;i<a+4;i++)fl.fix.push({k:i+NX,u:0,v:V,S:{T:Tsup,e:esup}});});
      for(var j=30;j<40;j++)fl.fix.push({k:1+j*NX,u:-Vr,v:0});for(var i=64;i<70;i++)fl.fix.push({k:i+NX,u:0,v:-Vr});}
    if(doorA>.05){var U=7*doorA;for(var j=24;j<32;j++)fl.fix.push({k:NX-2+j*NX,u:-U,v:0,S:{T:TOUT,e:EOUT}});for(j=33;j<41;j++)fl.fix.push({k:NX-2+j*NX,u:U,v:0});}
    fl.step(dt,function(dt){var u=fl.u,v=fl.v,damp=Math.exp(-.35*dt);
      for(var k=0;k<u.length;k++){if(fl.solid[k])continue;v[k]-=.55*(T[k]-m.T)*dt;u[k]*=damp;v[k]*=damp;
        // duvarlardan ısı ve nem kazancı (yalıtım kusursuz değil)
        var i=k%NX,j=(k/NX)|0;if(i===1||i===NX-2||j===1){T[k]+=(TOUT-T[k])*.09*dt;E[k]+=(EOUT-E[k])*.06*dt;}}});
    return {T:m.T,rh:rh};}
  var TS=[[14,[62,110,190]],[17.5,[40,104,140]],[19,[28,86,74]],[21.5,[150,130,60]],[25,[214,140,48]],[30,[196,62,40]]],
      RS=[[.3,[205,165,90]],[.42,[120,120,70]],[.5,[28,86,74]],[.6,[50,110,160]],[.8,[70,110,220]]];
  function frame(ctx,dt){var sub=2,h=dt*1.6/sub,m;for(var s=0;s<sub;s++)m=physics(h);
    ctx.fillStyle=MAT;ctx.fillRect(0,0,LW,LH);
    view.paint(ctx,mode==='T'?function(k){return ramp(TS,T[k]);}:function(k){return ramp(RS,E[k]/es(T[k]));},OX,OY,CS);
    // hava akışı
    ctx.lineCap='round';ctx.lineWidth=1.4;parts.forEach(function(p){if(!tracer(fl,p,h*sub))spawn(p);
      var a=clamp(.18+p.sp*.06,.18,.8);ctx.strokeStyle=INK+a+')';ctx.beginPath();ctx.moveTo(OX+p.px*CS,OY+p.py*CS);ctx.lineTo(OX+p.x*CS+(p.x-p.px)*CS*3,OY+p.y*CS+(p.y-p.py)*CS*3);ctx.stroke();});
    shelves(ctx,fl,SH,OX,OY,CS);
    // duvarlar, menfezler, kapı
    ctx.strokeStyle='#0E2C25';ctx.lineWidth=CS;ctx.strokeRect(OX+CS/2,OY+CS/2,(NX-1)*CS,(NY-1)*CS);
    function grille(x,y,w,h,col){ctx.fillStyle='#9AA39E';ctx.fillRect(x,y,w,h);ctx.fillStyle=col;var n=Math.max(w,h)/CS;for(var g=0;g<n;g++){if(w>h)ctx.fillRect(x+g*CS+2,y+2,6,h-4);else ctx.fillRect(x+2,y+g*CS+2,w-4,6);}}
    DIF.forEach(function(a){grille(OX+a*CS,OY,4*CS,CS,'#5E7C8C');});grille(OX+64*CS,OY,6*CS,CS,'#55605A');grille(OX,OY+30*CS,CS,10*CS,'#55605A');
    label(ctx,'BESLEME '+(fan>.02?fmt(Tsup)+' °C':'—'),OX+5*CS,OY+CS+14);label(ctx,'DÖNÜŞ',OX+70*CS,OY+CS+14,'right');label(ctx,'DÖNÜŞ',OX+CS+6,OY+29*CS-4);
    var dy=OY+24*CS,dh=17*CS;ctx.fillStyle=MAT;ctx.fillRect(OX+(NX-1)*CS-1,dy,CS+2,dh);ctx.strokeStyle='#C9A15A';ctx.lineWidth=3;ctx.beginPath();
    ctx.moveTo(OX+(NX-1)*CS+CS/2,dy);ctx.lineTo(OX+(NX-1)*CS+CS/2-Math.sin(doorA*1.2)*dh*.55,dy+Math.cos(doorA*1.2)*dh*.55+dh*.45*(1-doorA));ctx.stroke();
    label(ctx,'KAPI',OX+(NX-1)*CS-6,dy-8,'right');
    // sensör
    var sx=OX+33*CS,sy=OY+8*CS;ctx.fillStyle='#F3F1EA';ctx.beginPath();ctx.arc(sx,sy,5,0,7);ctx.fill();label(ctx,'SENSÖR '+fmt(m.T)+' °C · %'+Math.round(m.rh*100),sx+10,sy+4);
    // renk ölçeği
    var lx=OX+14,ly=LH-22,lw=150;for(var q=0;q<lw;q++){var c=mode==='T'?ramp(TS,14+16*q/lw):ramp(RS,.3+.5*q/lw);ctx.fillStyle='rgb('+(c[0]|0)+','+(c[1]|0)+','+(c[2]|0)+')';ctx.fillRect(lx+q,ly,1,7);}
    label(ctx,mode==='T'?'14 °C':'%30',lx,ly-4);label(ctx,mode==='T'?'30 °C':'%80',lx+lw,ly-4,'right');
    acc+=dt;if(acc>.25){acc=0;var okT=Math.abs(m.T-TSET)<=1,okR=Math.abs(m.rh-RHSET)<=.05;
      out.t.textContent=fmt(m.T)+' °C';out.rh.textContent='%'+Math.round(m.rh*100);out.sup.textContent=fan>.02?fmt(Tsup)+' °C · %'+Math.round(esup/es(Tsup)*100):'—';out.fan.textContent='%'+Math.round(fan*100);
      out.st.textContent=broken?'Santral kapalı: sıcak hava tavanda birikiyor, depo dış koşullara yaklaşıyor':door?'Kapı açık: sıcak, nemli hava giriyor; santral dengeliyor':okT&&okR?'Hedef aralıkta (18–20 °C, %45–55)':'Sapma var: santral düzeltiyor';
      out.st.dataset.s=broken?'bad':door||!(okT&&okR)?'warn':'ok';}}
  var st=new Stage(cv,frame);
  var bd=$('#ik-door'),bb=$('#ik-fail'),mb=$$('[data-ik-mode]');
  bd.addEventListener('click',function(){door=!door;bd.setAttribute('aria-pressed',door);bd.textContent=door?'Kapıyı kapat':'Kapıyı aç';});
  bb.addEventListener('click',function(){broken=!broken;bb.setAttribute('aria-pressed',broken);bb.textContent=broken?'Santrali çalıştır':'Santrali durdur';It=Ie=0;});
  mb.forEach(function(b){b.addEventListener('click',function(){mode=b.dataset.ikMode;mb.forEach(function(x){x.setAttribute('aria-pressed',x===b);});});});
  root.addEventListener('labshow',function(e){st.run(e.detail==='iklim');});})();

/* ======================= 2. ARGON GAZLI SÖNDÜRME ======================= */
(function(){var cv=$('#lab-argon-cv');if(!cv)return;
  var NX=74,NY=42,CS=10,OX=10,OY=14,fl,T,C,S,view,SH=[[8,15,17,41],[20,15,29,41],[48,15,57,41],[60,15,69,41]],FI=[35,40];
  var phase,I,tt,tp,o2hist,parts,flames,detected,relief,discharged;
  var out={o2:$('#ar-o2'),c:$('#ar-c'),ph:$('#ar-ph'),t:$('#ar-t')},btn=$('#ar-go'),acc=0,gcv=$('#ar-graph'),gctx=gcv&&gcv.getContext('2d');
  // O₂ zaman grafiği (yangın seviyesinde ölçülen oksijen; kesikli çizgi %15 yanma sınırı)
  function graph(){var w=gcv.clientWidth||300,hh=gcv.clientHeight||90,r=Math.min(2,window.devicePixelRatio||1);if(gcv.width!==Math.round(w*r)){gcv.width=Math.round(w*r);gcv.height=Math.round(hh*r);}
    var c=gctx;c.setTransform(r,0,0,r,0,0);c.clearRect(0,0,w,hh);var cs=getComputedStyle(gcv),ink=cs.color,pl=34,pr=8,pt=8,pb=18,gw=w-pl-pr,gh=hh-pt-pb,yy=function(o){return pt+gh-(o-10)/(22-10)*gh;};
    c.font='11px '+FONT;c.fillStyle=ink;c.globalAlpha=.6;c.textAlign='right';[12,15,21].forEach(function(o){c.fillText('%'+o,pl-6,yy(o)+4);});c.textAlign='left';c.fillText('zaman →',pl,hh-4);c.globalAlpha=1;
    c.strokeStyle='#C08A2E';c.setLineDash([4,4]);c.lineWidth=1;c.beginPath();c.moveTo(pl,yy(15));c.lineTo(pl+gw,yy(15));c.stroke();c.setLineDash([]);
    c.strokeStyle=ink;c.globalAlpha=.25;c.beginPath();c.moveTo(pl,pt+gh);c.lineTo(pl+gw,pt+gh);c.stroke();c.globalAlpha=1;
    c.strokeStyle='#2E7D66';c.lineWidth=2;c.beginPath();o2hist.forEach(function(o,i){var x=pl+i/400*gw;if(i)c.lineTo(x,yy(o));else c.moveTo(x,yy(o));});c.stroke();}
  function reset(){fl=new Fluid(NX,NY);T=fl.scalar('T',0);C=fl.scalar('C',0);S=fl.scalar('S',0);view=new FieldView(fl);SH.forEach(function(r){fl.rect(r[0],r[1],r[2],r[3]);});
    phase='idle';I=0;tt=0;tp=0;o2hist=[];parts=[];flames=[];detected=false;relief=0;discharged=0;btn.textContent='Yangın çıkar';btn.disabled=false;}
  reset();
  function fireO2(){var s=0,c=0;for(var j=33;j<41;j++)for(var i=FI[0]-2;i<FI[1]+2;i++){s+=C[i+j*NX];c++;}return 20.9*(1-s/c);}
  function avgC(){var s=0,c=0;for(var k=0;k<C.length;k++)if(!fl.solid[k]){s+=C[k];c++;}return s/c;}
  var NOZ=[[12,15],[31,34],[62,65]];
  function physics(dt){tt+=dt;if(phase!=='idle')tp+=dt;var o2=fireO2(),cav=avgC();
    // yanma: oksijen %15'in altına inince alev sürmez
    var f=clamp((o2-15)/(20.9-15),0,1);
    if(phase==='fire'||phase==='alarm'||phase==='discharge'||phase==='hold'){var target=phase==='fire'||phase==='alarm'?1:f;if(phase!=='fire'&&phase!=='alarm')target=Math.min(target,I+.001);
      I+=(target*(phase==='fire'?.9:1)-I)*(target>I?.6:.9)*dt;if(phase==='hold'&&I<.03){I=0;phase='out';tp=0;}}
    if(phase==='fire'&&S[37+2*NX]>.035&&!detected){detected=true;phase='alarm';tp=0;}
    if(phase==='alarm'&&tp>3.2){phase='discharge';tp=0;}
    if(phase==='discharge'&&(cav>.43||tp>16)){phase='hold';tp=0;}
    fl.fix=[];if(phase==='discharge'){var Vn=22;NOZ.forEach(function(n){for(var i=n[0];i<n[1];i++)fl.fix.push({k:i+NX,u:0,v:Vn,S:{C:1,T:-2}});});
      // basınç tahliye klapesi: içeri basılan gaz kadar karışım dışarı çıkar
      for(var j=4;j<10;j++)fl.fix.push({k:NX-2+j*NX,u:Vn*1.5,v:0});discharged+=dt;}
    relief=lerp(relief,phase==='discharge'?1:0,dt*4);
    fl.step(dt,function(dt){var u=fl.u,v=fl.v,damp=Math.exp(-.3*dt);
      for(var j=FI[1]-1;j>=36;j--)for(var i=FI[0];i<FI[1];i++){var k=i+j*NX;T[k]=Math.min(40,T[k]+90*I*dt);S[k]=Math.min(1.5,S[k]+1.6*I*dt);}
      for(var k=0;k<u.length;k++){if(fl.solid[k])continue;
        // kaldırma: sıcak gaz yükselir; argon havadan ~%38 yoğun olduğu için çöker
        v[k]+=(-98*T[k]/293+98*.38*C[k])*dt;u[k]*=damp;v[k]*=damp;T[k]*=Math.exp(-.22*dt);S[k]*=Math.exp(-.02*dt);}});
    if(phase!=='idle'){o2hist.push(o2);if(o2hist.length>400)o2hist.shift();}
    return {o2:o2,c:cav};}
  function frame(ctx,dt){var sub=2,h=dt*2/sub,m;for(var s=0;s<sub;s++)m=physics(h);
    ctx.fillStyle=MAT;ctx.fillRect(0,0,LW,LH);
    view.paint(ctx,function(k){var c=C[k],sm=clamp(S[k],0,1),t=clamp(T[k]/30,0,1);var col=mix([22,70,60],[96,150,214],clamp(c*1.8,0,1));col=mix(col,[70,72,74],sm*.8);col=mix(col,[226,120,48],t*.7);return col;},OX,OY,CS);
    // argon parçacıkları
    if(phase==='discharge')NOZ.forEach(function(n){for(var q=0;q<3;q++)parts.push({x:n[0]+Math.random()*(n[1]-n[0]),y:1.6,life:7});});
    ctx.fillStyle='rgba(200,225,255,.75)';parts=parts.filter(function(p){p.life-=h*sub;if(!tracer(fl,p,h*sub)||p.life<0)return false;ctx.fillRect(OX+p.x*CS-1,OY+p.y*CS-1,2.2,2.2);return true;});
    // alev parçacıkları (yerel hava akışı + kendi kaldırması)
    var nf=Math.round(I*6);for(var q=0;q<nf;q++)flames.push({x:FI[0]+Math.random()*(FI[1]-FI[0]),y:40.2,vy:-2-Math.random()*3,life:.5+Math.random()*.5,age:0});
    flames=flames.filter(function(p){p.age+=h*sub;if(p.age>p.life)return false;p.x+=fl.at(fl.u,p.x,p.y)*h*sub+(Math.random()-.5)*.25;p.y+=(fl.at(fl.v,p.x,p.y)*.4+p.vy)*h*sub;p.vy-=4*h*sub;
      var a=1-p.age/p.life,r=(3+5*a)*(.4+.6*I);ctx.fillStyle='rgba('+(255)+','+Math.round(120+120*a)+','+Math.round(40*a)+','+(a*.85)+')';ctx.beginPath();ctx.arc(OX+p.x*CS,OY+p.y*CS,r,0,7);ctx.fill();return true;});
    shelves(ctx,fl,SH,OX,OY,CS);
    ctx.fillStyle='#4A3328';ctx.fillRect(OX+FI[0]*CS,OY+40*CS,(FI[1]-FI[0])*CS,CS*.7);
    ctx.strokeStyle='#0E2C25';ctx.lineWidth=CS;ctx.strokeRect(OX+CS/2,OY+CS/2,(NX-1)*CS,(NY-1)*CS);
    // nozullar, dedektör, tahliye klapesi, flaşör
    NOZ.forEach(function(n){var x=OX+(n[0]+n[1])/2*CS;ctx.fillStyle='#B9C0BC';ctx.fillRect(x-7,OY+CS-2,14,7);ctx.fillRect(x-2,OY,4,CS);});
    label(ctx,'NOZUL',OX+13*CS,OY+CS+20,'center');
    var dx=OX+37*CS;ctx.fillStyle=detected?'#E0A040':'#E9E6DE';ctx.beginPath();ctx.arc(dx,OY+CS+4,6,0,7);ctx.fill();label(ctx,'DUMAN DEDEKTÖRÜ',dx+12,OY+CS+8);
    var vy=OY+4*CS,vh=6*CS,vx=OX+(NX-1)*CS;ctx.fillStyle=MAT;ctx.fillRect(vx-1,vy,CS+2,vh);ctx.strokeStyle='#C9A15A';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(vx+CS/2,vy);ctx.lineTo(vx+CS/2+Math.sin(relief*1.1)*vh,vy+Math.cos(relief*1.1)*vh);ctx.stroke();
    label(ctx,'BASINÇ TAHLİYE',vx-6,vy-8,'right');
    if(phase==='alarm'||phase==='discharge'){var on=Math.floor(tt*4)%2===0;ctx.fillStyle=on?'#F2A92B':'#6b5a2a';ctx.fillRect(OX+3*CS,OY+12*CS,10,14);label(ctx,'ALARM',OX+3*CS+16,OY+12*CS+11,'left',on?'#F2A92B':INK+'.6)');}
    if(gctx)graph();
    acc+=dt;if(acc>.2){acc=0;out.o2.textContent='%'+fmt(m.o2);out.c.textContent='%'+Math.round(m.c*100);
      var P={idle:'Hazır',fire:'Yangın büyüyor',alarm:'Alarm: oda boşaltılıyor',discharge:'Argon boşaltılıyor',hold:'Oksijen düştü, alev sönüyor',out:'Söndü'};out.ph.textContent=P[phase];out.ph.dataset.s=phase==='out'?'ok':phase==='idle'?'':phase==='hold'||phase==='discharge'?'warn':'bad';
      out.t.textContent=phase==='idle'?'—':fmt(tp,1)+' s';}}
  var st=new Stage(cv,frame);
  btn.addEventListener('click',function(){if(phase==='idle'){phase='fire';tp=0;I=.3;btn.textContent='Sıfırla';}else reset();});
  root.addEventListener('labshow',function(e){st.run(e.detail==='argon');});})();

/* ======================= 3. MİKRO-XRF ======================= */
(function(){var cv=$('#lab-xrf-cv');if(!cv)return;
  // Karakteristik çizgiler (keV)
  var EL={S:{z:16,K:[2.31,2.46]},K:{z:19,K:[3.31,3.59]},Ca:{z:20,K:[3.69,4.01]},Mn:{z:25,K:[5.90,6.49]},Fe:{z:26,K:[6.40,7.06]},Cu:{z:29,K:[8.05,8.90]},Zn:{z:30,K:[8.64,9.57]},
          Au:{z:79,L:[9.71,11.44]},Hg:{z:80,L:[9.99,11.82]},Pb:{z:82,L:[10.55,12.61]}};
  var PAPER={K:.55,Ca:1,Fe:.12};
  var SAMP={kagit:{n:'Kâğıt (boş alan)',c:PAPER},gal:{n:'Demir-gal mürekkep',c:{K:.9,Ca:1,S:.45,Mn:.35,Fe:5.5,Cu:.8,Zn:.6}},is:{n:'İs mürekkebi',c:{K:.5,Ca:.95,Fe:.1}},
            zen:{n:'Zencefre (kırmızı)',c:{K:.5,Ca:.9,S:1.3,Hg:4.2,Fe:.1}},alt:{n:'Altın yaldız',c:{K:.5,Ca:.9,Au:4.6,Cu:.35,Fe:.1}}};
  var NB=280,EMAX=14,bins=new Float32Array(NB),lines=[],sample='gal',counts=0,mt=0,ev=null,evT=9,acc=0;
  var out={n:$('#xr-n'),t:$('#xr-t'),el:$('#xr-el')};
  // dedektör verimi (hava ve pencere düşük enerjide soğurur) ve enerji çözünürlüğü (Fano)
  function eff(E){return 1-Math.exp(-Math.pow(E/1.9,3));}
  function sigma(E){return Math.sqrt(.085*.085+.0026*E)/2.355;}
  function build(){lines=[];var c=SAMP[sample].c,tot=0;for(var e in c){var d=EL[e],sh=d.K?'K':'L',E=d.K||d.L;
      [[E[0],1,sh==='K'?'Kα':'Lα'],[E[1],sh==='K'?.15:.7,sh==='K'?'Kβ':'Lβ']].forEach(function(l){var w=c[e]*l[1]*eff(l[0]);lines.push({el:e,E:l[0],w:w,nm:l[2],sh:sh});tot+=w;});}
    lines.push({bg:true,w:tot*.32});tot+=tot*.32;lines.forEach(function(l){l.p=l.w/tot;});bins.fill(0);counts=0;mt=0;ev=null;evT=9;}
  build();
  function draw1(){var r=Math.random(),q=0,l;for(var i=0;i<lines.length;i++){q+=lines[i].p;if(r<=q){l=lines[i];break;}}l=l||lines[0];
    var E;if(l.bg){do{E=1+Math.random()*13;}while(Math.random()>.35+.65*Math.sin(Math.PI*(E-1)/14)*eff(E));}else E=l.E+gauss()*sigma(l.E);
    var b=Math.floor(E/EMAX*NB);if(b>=0&&b<NB)bins[b]++;counts++;return l;}
  var COL={S:'#E8D36A',K:'#B48CE0',Ca:'#9AD0F0',Mn:'#E89AB8',Fe:'#E07A4A',Cu:'#5FC9A8',Zn:'#8FA8F0',Au:'#F2C14E',Hg:'#E25A4A',Pb:'#C0C6CE'};
  function shells(z){var cap=[2,8,18,32],r=[],n=z;for(var i=0;i<4&&n>0;i++){var k=Math.min(cap[i],n);r.push(k);n-=k;}if(n>0)r[r.length-1]+=n;return r;}
  function wave(ctx,x0,y0,x1,y1,t,col,amp){var dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L;ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();
    for(var s=0;s<=1.0001;s+=.02){var w=Math.sin(s*L/7-t*14)*amp,x=x0+dx*s+nx*w,y=y0+dy*s+ny*w;if(s)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.stroke();}
  function frame(ctx,dt){mt+=dt;if(mt<60){var n=Math.round(dt*900*(1+mt/8));for(var i=0;i<n;i++)draw1();}
    ctx.fillStyle=MAT;ctx.fillRect(0,0,LW,LH);
    // --- Atom: fotoelektrik soğurma ve floresans ---
    evT+=dt;if(evT>2.4||!ev){evT=0;var l;do{l=lines[Math.floor(Math.random()*lines.length)];}while(l.bg||Math.random()>l.p*6);ev=l;}
    var cx=170,cy=250,R=[34,62,90,116],sh=shells(EL[ev.el].z),inner=ev.sh==='K'?0:1,from=inner+(ev.nm==='Kβ'||ev.nm==='Lβ'?2:1);from=Math.min(from,sh.length-1);
    var t=evT,ph1=Math.min(1,t/.6),ph2=clamp((t-.6)/.5,0,1),ph3=clamp((t-1.0)/.45,0,1),ph4=clamp((t-1.45)/.75,0,1);
    ctx.fillStyle='rgba(10,30,26,.55)';box(ctx,14,40,316,410,10);ctx.fill();
    for(var s=0;s<sh.length;s++){ctx.strokeStyle=INK+'.22)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,R[s],0,7);ctx.stroke();label(ctx,'KLMN'[s],cx+R[s]*.71+4,cy-R[s]*.71-2,'left',INK+'.45)');}
    ctx.fillStyle=COL[ev.el];ctx.beginPath();ctx.arc(cx,cy,15,0,7);ctx.fill();ctx.font='600 13px '+FONT;ctx.fillStyle='#16463C';ctx.textAlign='center';ctx.fillText(ev.el,cx,cy+4.5);
    var rot=mt*.6,vacA=-2.4,fall=null;
    for(s=0;s<sh.length;s++){var ne=Math.min(sh[s],s===0?2:s===1?8:12);for(var e=0;e<ne;e++){var a=rot*(s%2?-1:1)/(s+1)+e/ne*Math.PI*2;
        if(s===inner&&e===0){a=vacA;if(ph1>=1){if(ph2>0&&ph3<1)continue;}}
        if(s===from&&e===0){a=vacA;if(ph3>0){fall={a:a,r:lerp(R[from],R[inner],ph3)};continue;}}
        if(s===inner&&e===0&&ph3>=1)continue;
        ctx.fillStyle='#F3F1EA';ctx.beginPath();ctx.arc(cx+Math.cos(a)*R[s],cy+Math.sin(a)*R[s],3.3,0,7);ctx.fill();}}
    var ix=cx+Math.cos(vacA)*R[inner],iy=cy+Math.sin(vacA)*R[inner];
    if(ph1<1)wave(ctx,20,60,lerp(20,ix,ph1),lerp(60,iy,ph1),mt,'#EFE6C8',4);
    if(ph1>=1&&ph3<1){ctx.strokeStyle='#F2A92B';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(ix,iy,4.5,0,7);ctx.stroke();}
    if(ph2>0&&ph2<1){var ex=lerp(ix,ix-90,ph2),ey=lerp(iy,iy-120,ph2);ctx.fillStyle='#9AD0F0';ctx.beginPath();ctx.arc(ex,ey,3.6,0,7);ctx.fill();label(ctx,'fotoelektron',ex+8,ey,'left',INK+(1-ph2)+')');}
    if(fall){ctx.fillStyle='#F3F1EA';ctx.beginPath();ctx.arc(cx+Math.cos(fall.a)*fall.r,cy+Math.sin(fall.a)*fall.r,3.3,0,7);ctx.fill();}
    if(ph4>0){var fx=cx+Math.cos(vacA)*R[inner],fy=cy+Math.sin(vacA)*R[inner];wave(ctx,fx,fy,lerp(fx,316,ph4),lerp(fy,70,ph4),mt,COL[ev.el],3.5);}
    label(ctx,'X IŞINI',22,54);label(ctx,'→ DEDEKTÖR',322,58,'right');
    ctx.font='500 13px '+FONT;ctx.textAlign='left';ctx.fillStyle=INK+'.92)';ctx.fillText(ev.el+' '+ev.nm+' · '+fmt(ev.E,2)+' keV',28,410);
    label(ctx,ev.sh==='K'?(ev.nm==='Kα'?'L → K geçişi':'M → K geçişi'):(ev.nm==='Lα'?'M → L geçişi':'N → L geçişi'),28,430,'left',INK+'.6)');
    // --- Spektrum ---
    var gx=372,gy=48,gw=366,gh=330,mx=1;for(var b=0;b<NB;b++)if(bins[b]>mx)mx=bins[b];var Y=function(c){return gy+gh-Math.sqrt(c/mx)*gh;};
    ctx.strokeStyle=INK+'.25)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(gx,gy+gh);ctx.lineTo(gx+gw,gy+gh);ctx.stroke();
    for(var k=0;k<=EMAX;k+=2){var x=gx+k/EMAX*gw;ctx.beginPath();ctx.moveTo(x,gy+gh);ctx.lineTo(x,gy+gh+4);ctx.stroke();label(ctx,String(k),x,gy+gh+17,'center',INK+'.6)');}
    label(ctx,'ENERJİ (keV)',gx+gw,gy+gh+34,'right',INK+'.6)');label(ctx,'SAYIM (√)',gx,gy-12,'left',INK+'.6)');
    ctx.beginPath();ctx.moveTo(gx,gy+gh);for(b=0;b<NB;b++){var xb=gx+(b+.5)/NB*gw;ctx.lineTo(xb,Y(bins[b]));}ctx.lineTo(gx+gw,gy+gh);ctx.closePath();
    var gr=ctx.createLinearGradient(0,gy,0,gy+gh);gr.addColorStop(0,'rgba(243,241,234,.55)');gr.addColorStop(1,'rgba(243,241,234,.08)');ctx.fillStyle=gr;ctx.fill();
    ctx.strokeStyle='#F3F1EA';ctx.lineWidth=1.2;ctx.beginPath();for(b=0;b<NB;b++){xb=gx+(b+.5)/NB*gw;if(b)ctx.lineTo(xb,Y(bins[b]));else ctx.moveTo(xb,Y(bins[b]));}ctx.stroke();
    // tepe tanıma: çizgi enerjisindeki sayım, çevre zemininden 3σ büyükse etiketle
    var found={},placed=[];lines.forEach(function(l){if(l.bg||l.nm==='Kβ'||l.nm==='Lβ'&&l.el!=='Hg'&&l.el!=='Au')return;if(lines.some(function(o){return !o.bg&&o!==l&&o.el!==l.el&&Math.abs(o.E-l.E)<.3&&o.w>l.w;}))return;var bi=Math.floor(l.E/EMAX*NB),pk=bins[bi]+bins[bi-1]+bins[bi+1],bg=(bins[bi-7]+bins[bi+7]+bins[bi-8]+bins[bi+8])*.75;
      if(pk-bg>3*Math.sqrt(bg+1)&&pk>25){found[l.el]=1;var x=gx+l.E/EMAX*gw,y=Y(bins[bi])-8;while(placed.some(function(p){return Math.abs(p[0]-x)<30&&Math.abs(p[1]-y)<14;}))y-=14;placed.push([x,y]);
        ctx.fillStyle=COL[l.el];ctx.beginPath();ctx.arc(x,y+4,2.5,0,7);ctx.fill();label(ctx,l.el+' '+l.nm,x,y-2,'center',COL[l.el]);}});
    if(ev&&!ev.bg&&ph4>.9){var xe=gx+ev.E/EMAX*gw;ctx.strokeStyle=COL[ev.el];ctx.globalAlpha=1-(ph4-.9)*10+.2;ctx.beginPath();ctx.moveTo(xe,gy);ctx.lineTo(xe,gy+gh);ctx.stroke();ctx.globalAlpha=1;}
    acc+=dt;if(acc>.2){acc=0;out.n.textContent=counts.toLocaleString('tr-TR');out.t.textContent=fmt(Math.min(mt,60),0)+' s';var f=Object.keys(found);out.el.textContent=f.length?f.join(', '):'—';}}
  var st=new Stage(cv,frame),sb=$$('[data-xrf]');
  sb.forEach(function(b){b.addEventListener('click',function(){sample=b.dataset.xrf;sb.forEach(function(x){x.setAttribute('aria-pressed',x===b);});build();$('#xr-note').hidden=sample!=='is';});});
  $('#xr-reset').addEventListener('click',build);
  root.addEventListener('labshow',function(e){st.run(e.detail==='xrf');});})();

/* ======================= 4. BONUS: TAŞINABİLİR RAMAN ======================= */
(function(){var cv=$('#lab-raman-cv');if(!cv)return;
  // Raman kayması (cm⁻¹), göreli şiddet, bant genişliği
  var LIB={zen:{n:'Zencefre (HgS)',col:'#B3261E',p:[[253,1,7],[285,.25,7],[343,.45,8]]},
           lac:{n:'Lâcivert (lazurit)',col:'#2A4FB0',p:[[258,.35,10],[548,1,10],[822,.12,10],[1096,.45,10]]},
           zir:{n:'Zırnık (As₂S₃)',col:'#E2B43A',p:[[136,.3,6],[154,.35,6],[202,.25,6],[293,.6,7],[311,.75,7],[355,1,7],[384,.3,7]]},
           is:{n:'İs (karbon)',col:'#1E1E1E',p:[[1350,.8,70],[1590,1,38]]}};
  var X0=100,X1=1800,NB=340,bins=new Float32Array(NB),tmpl={},sample='zen',counts=0,mt=0,ph=[],acc=0,best=null;
  var out={n:$('#rm-n'),m:$('#rm-m'),s:$('#rm-s')};
  function sh2b(x){return Math.floor((x-X0)/(X1-X0)*NB);}
  Object.keys(LIB).forEach(function(k){var t=new Float32Array(NB);LIB[k].p.forEach(function(q){for(var b=0;b<NB;b++){var x=X0+(b+.5)*(X1-X0)/NB;t[b]+=q[1]*Math.exp(-.5*Math.pow((x-q[0])/(q[2]*.6+6),2));}});tmpl[k]=t;});
  function reset(){bins.fill(0);counts=0;mt=0;best=null;}
  function draw1(){var L=LIB[sample].p,tot=0;L.forEach(function(q){tot+=q[1];});
    if(Math.random()<.45){var x=X0+Math.random()*(X1-X0);if(Math.random()<.6+.4*(x-X0)/(X1-X0)){var b=sh2b(x);bins[b]++;counts++;}return;}  // floresans zemini
    var r=Math.random()*tot,q=L[0];for(var i=0;i<L.length;i++){r-=L[i][1];if(r<=0){q=L[i];break;}}
    var b2=sh2b(q[0]+gauss()*(q[2]*.6+6));if(b2>=0&&b2<NB){bins[b2]++;counts++;}}
  // Kütüphane eşleştirme: zemin çıkarılmış spektrumla şablonların korelasyonu
  function match(){var sm=new Float32Array(NB),mn=1e9;for(var b=0;b<NB;b++){var a=0,c=0;for(var k=-2;k<=2;k++){var j=b+k;if(j>=0&&j<NB){a+=bins[j];c++;}}sm[b]=a/c;}
    var base=new Float32Array(NB);for(b=0;b<NB;b++){var m=1e9;for(k=-25;k<=25;k++){j=b+k;if(j>=0&&j<NB&&sm[j]<m)m=sm[j];}base[b]=m;}
    var res=Object.keys(LIB).map(function(key){var t=tmpl[key],sxy=0,sxx=0,syy=0,mx=0,my=0;for(b=0;b<NB;b++){mx+=sm[b]-base[b];my+=t[b];}mx/=NB;my/=NB;
      for(b=0;b<NB;b++){var x=sm[b]-base[b]-mx,y=t[b]-my;sxy+=x*y;sxx+=x*x;syy+=y*y;}return {k:key,r:sxy/Math.sqrt(sxx*syy+1e-9)};});
    res.sort(function(a,b){return b.r-a.r;});return res[0];}
  function frame(ctx,dt){mt+=dt;if(mt<40){var n=Math.round(dt*500*(1+mt/6));for(var i=0;i<n;i++)draw1();}
    ctx.fillStyle=MAT;ctx.fillRect(0,0,LW,LH);
    // --- cihaz ve ölçüm noktası ---
    ctx.fillStyle='rgba(10,30,26,.55)';box(ctx,14,40,316,410,10);ctx.fill();
    var px=172,top=74,tip=262,sy=372,col=LIB[sample].col;
    ctx.fillStyle='#E9E6DE';ctx.fillRect(28,sy,288,16);ctx.fillStyle=col;ctx.fillRect(110,sy,124,16);label(ctx,'ESER YÜZEYİ',30,sy+34,'left',INK+'.55)');
    ctx.fillStyle='#2A2E2C';box(ctx,px-52,top,104,150,12);ctx.fill();ctx.beginPath();ctx.moveTo(px-30,top+150);ctx.lineTo(px+30,top+150);ctx.lineTo(px+10,tip);ctx.lineTo(px-10,tip);ctx.closePath();ctx.fill();
    ctx.fillStyle='#C9A15A';ctx.fillRect(px-40,top+12,80,22);ctx.font='600 10px '+FONT;ctx.fillStyle='#16463C';ctx.textAlign='center';ctx.fillText('DEDEKTÖR',px,top+27);
    var fy=top+92;ctx.strokeStyle='#9AD0F0';ctx.setLineDash([5,4]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px-44,fy);ctx.lineTo(px+44,fy);ctx.stroke();ctx.setLineDash([]);
    label(ctx,'FİLTRE',px+58,fy+4);label(ctx,'Texas Instruments · taşınabilir Raman',22,58);
    var pulse=.6+.4*Math.sin(mt*20);ctx.strokeStyle='rgba(230,60,50,'+pulse+')';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(px,tip);ctx.lineTo(px,sy);ctx.stroke();
    ctx.fillStyle='rgba(230,60,50,.35)';ctx.beginPath();ctx.ellipse(px,sy,14,4,0,0,7);ctx.fill();label(ctx,'LAZER',px+10,tip+40);
    // geri saçılan fotonlar: çoğu aynı renk (Rayleigh, filtrede durur), azı kaymış (Raman, dedektöre ulaşır)
    // saçılan fotonlar her yöne dağılır; yalnızca uca girenler toplanır. Filtre aynı renkteki ışığı durdurur, kaymış ışık geçer
    for(var q=0;q<4;q++){var an=(Math.random()-.5)*2.4;ph.push({x:px+(Math.random()-.5)*8,y:sy-3,vx:Math.sin(an)*230,vy:-Math.cos(an)*230,ram:Math.random()<.07,in:false,f:0});}
    ph=ph.filter(function(o){if(o.in){o.y-=230*dt;o.x+=(px-o.x)*Math.min(1,dt*6);}else{o.x+=o.vx*dt;o.y+=o.vy*dt;
        if(o.y<=tip&&o.y>tip-8){if(Math.abs(o.x-px)<11)o.in=true;}if(!o.in&&o.y<tip-8){o.f+=dt*4;if(o.f>1)return false;}if(o.x<20||o.x>324)return false;}
      if(o.in&&!o.ram&&o.y<fy+2){o.y=fy+2;o.f+=dt*4;if(o.f>1)return false;}
      if(o.in&&o.ram&&o.y<top+36)return false;
      ctx.fillStyle=o.ram?'rgba(242,193,78,'+(1-o.f)+')':'rgba(230,80,70,'+(.85*(1-o.f))+')';ctx.beginPath();ctx.arc(o.x,o.y,o.ram?3.2:2.2,0,7);ctx.fill();return true;});
    ctx.fillStyle='rgba(230,80,70,.9)';ctx.beginPath();ctx.arc(30,418,3,0,7);ctx.fill();label(ctx,'aynı renk: filtrede durur',40,422,'left',INK+'.7)');
    ctx.fillStyle='#F2C14E';ctx.beginPath();ctx.arc(30,436,3,0,7);ctx.fill();label(ctx,'renk kaymış: Raman sinyali',40,440,'left',INK+'.7)');
    // --- spektrum ---
    var gx=372,gy=48,gw=366,gh=330,mx=1;for(var b=0;b<NB;b++)if(bins[b]>mx)mx=bins[b];var Y=function(c){return gy+gh-c/mx*gh;};
    ctx.strokeStyle=INK+'.25)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(gx,gy+gh);ctx.lineTo(gx+gw,gy+gh);ctx.stroke();
    for(var k=200;k<=1800;k+=400){var x=gx+(k-X0)/(X1-X0)*gw;ctx.beginPath();ctx.moveTo(x,gy+gh);ctx.lineTo(x,gy+gh+4);ctx.stroke();label(ctx,String(k),x,gy+gh+17,'center',INK+'.6)');}
    label(ctx,'RAMAN KAYMASI (cm⁻¹)',gx+gw,gy+gh+34,'right',INK+'.6)');label(ctx,'ŞİDDET',gx+gw,gy-12,'right',INK+'.6)');
    ctx.beginPath();ctx.moveTo(gx,gy+gh);for(b=0;b<NB;b++)ctx.lineTo(gx+(b+.5)/NB*gw,Y(bins[b]));ctx.lineTo(gx+gw,gy+gh);ctx.closePath();
    var gr=ctx.createLinearGradient(0,gy,0,gy+gh);gr.addColorStop(0,'rgba(242,193,78,.5)');gr.addColorStop(1,'rgba(242,193,78,.06)');ctx.fillStyle=gr;ctx.fill();
    ctx.strokeStyle='#F2C14E';ctx.lineWidth=1.2;ctx.beginPath();for(b=0;b<NB;b++){var xb=gx+(b+.5)/NB*gw;if(b)ctx.lineTo(xb,Y(bins[b]));else ctx.moveTo(xb,Y(bins[b]));}ctx.stroke();
    if(counts>3000){if(!best||Math.floor(mt*4)%4===0)best=match();
      if(best.r>.6){ctx.strokeStyle=INK+'.75)';ctx.setLineDash([3,4]);var t=tmpl[best.k],tm=0;for(b=0;b<NB;b++)if(t[b]>tm)tm=t[b];
        var lastX=-99,row=0;LIB[best.k].p.forEach(function(q){if(q[1]<.4)return;var x=gx+(q[0]-X0)/(X1-X0)*gw;row=x-lastX<34?row+1:0;lastX=x;ctx.beginPath();ctx.moveTo(x,gy+6+row*13);ctx.lineTo(x,gy+gh);ctx.stroke();label(ctx,String(q[0]),x,gy+row*13,'center',INK+'.8)');});ctx.setLineDash([]);}}
    acc+=dt;if(acc>.2){acc=0;out.n.textContent=counts.toLocaleString('tr-TR');
      if(best&&best.r>.6){out.m.textContent=LIB[best.k].n;out.s.textContent='%'+Math.round(best.r*100);}else{out.m.textContent='Ölçülüyor…';out.s.textContent='—';}}}
  var st=new Stage(cv,frame),sb=$$('[data-rm]');
  sb.forEach(function(b){b.addEventListener('click',function(){sample=b.dataset.rm;sb.forEach(function(x){x.setAttribute('aria-pressed',x===b);});reset();});});
  $('#rm-reset').addEventListener('click',reset);
  root.addEventListener('labshow',function(e){st.run(e.detail==='raman');});})();

/* ---------- Sekmeler ---------- */
var tabs=$$('[role="tab"]',root),panes=$$('.lab',root);
function show(id){tabs.forEach(function(t){t.setAttribute('aria-selected',t.dataset.lab===id);});panes.forEach(function(p){p.hidden=p.dataset.lab!==id;});
  root.dispatchEvent(new CustomEvent('labshow',{detail:id}));}
tabs.forEach(function(t){t.addEventListener('click',function(){show(t.dataset.lab);});});
show('iklim');
})();
