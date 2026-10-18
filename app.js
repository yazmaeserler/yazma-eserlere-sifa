(function(){
'use strict';
document.documentElement.classList.add('js');
var $=function(s,r){return (r||document).querySelector(s);},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s));};
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function stop(e){if(e)e.stopPropagation();}
function h(tag,attrs,html){var e=document.createElement(tag);if(attrs)for(var k in attrs){if(k==='class')e.className=attrs[k];else e.setAttribute(k,attrs[k]);}if(html!=null)e.innerHTML=html;return e;}
function visible(el,cb,opts){if(!('IntersectionObserver' in window)){cb(true);return;}new IntersectionObserver(function(es){es.forEach(function(x){cb(x.isIntersecting);});},opts||{threshold:.25}).observe(el);}

/* ---------- Tema ---------- */
(function(){var b=$('#theme');if(!b)return;var root=document.documentElement;
 function cur(){var t=root.getAttribute('data-theme');if(t)return t;return matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
 try{var s=localStorage.getItem('ys-theme');if(s)root.setAttribute('data-theme',s);}catch(e){}
 b.addEventListener('click',function(){var n=cur()==='dark'?'light':'dark';root.setAttribute('data-theme',n);try{localStorage.setItem('ys-theme',n);}catch(e){}window.dispatchEvent(new Event('themechange'));});})();

/* ---------- İlerleme ve gezinme ---------- */
(function(){var p=$('#progress'),links=$$('.nav a'),map={};links.forEach(function(a){map[a.getAttribute('href').slice(1)]=a;});
 addEventListener('scroll',function(){var d=document.documentElement;p.style.width=(d.scrollTop/(d.scrollHeight-d.clientHeight)*100)+'%';},{passive:true});
 if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(a){a.removeAttribute('aria-current');});var a=map[e.target.id];if(a){a.setAttribute('aria-current','true');var nav=a.parentNode;nav.scrollTo({left:a.offsetLeft-nav.clientWidth/2+a.clientWidth/2,behavior:reduce?'auto':'smooth'});}}});},{rootMargin:'-45% 0px -50% 0px'});
 $$('main section[id]').forEach(function(s){io.observe(s);});}
 var rv=$$('.reveal');rv.forEach(function(el){el.classList.add('pre');visible(el,function(v){if(v)el.classList.remove('pre');},{threshold:.1});});})();

/* ---------- Videolar: yalnızca görünürken oynasın ---------- */
$$('video').forEach(function(v){if(reduce){v.removeAttribute('autoplay');v.controls=true;return;}visible(v,function(on){if(on){var p=v.play();if(p&&p.catch)p.catch(function(){});}else v.pause();},{threshold:.2});});

/* ---------- Şifahane modeli ---------- */
(function(){var F=[
 ['Kabul','Eser atölyeye gelir; kaydı yapılır ve ilk gözlem yapılır.','KAYIT'],
 ['Teşhis','Durum tespiti, analiz ve belgeleme: hasar haritası, ölçüm, Ar-Ge incelemesi.','ÇALIŞTAY SALONU · AR-GE'],
 ['Karar','Öncelik derecesi verilir; en az müdahale ilkesiyle tedavi planlanır.','ÖNCELİK DERECESİ'],
 ['Tedavi','Temizlik, eski onarım çıkarma, sağlamlaştırma ve tamamlama.','101 · 102 · 105 · 106 · 108'],
 ['Taburcu','Esere özel koruyucu muhafaza hazırlanır, rapor tamamlanır.','KUTU ATÖLYESİ'],
 ['Kontrol','Önleyici koruma ve düzenli izleme: iklim, zararlılar, kullanım.','DEPO']];
 var box=$('#flow');if(!box)return;
 F.forEach(function(f,i){var b=h('button',{type:'button',role:'tab'},'<b>'+(i+1<10?'0':'')+(i+1)+'</b><span>'+f[0]+'</span>');b.addEventListener('click',function(){sel(i);});box.appendChild(b);});
 var bs=$$('button',box);function sel(i){bs.forEach(function(b,k){b.setAttribute('aria-selected',k===i?'true':'false');});$('#flow-txt').textContent=F[i][1];$('#flow-day').textContent=F[i][2];}
 sel(0);})();

/* ---------- Bozulma etkenleri (çevrilebilir kartlar) ---------- */
(function(){var A=[['Fiziksel kuvvetler','Doğru tutma ve taşıma, esere özel destek ve kutu, sıkıştırılmamış raflar.'],['Hırsızlık, vandalizm','Erişim kontrolü, kamera, kayıtlı okuma salonu ve gözetim.'],['Yangın','Duman dedektörü ve argon gazlı söndürme; su kullanılmaz.'],['Su','Depoda su tesisatı yok, raflar yerden yüksek, düzenli kontrol.'],['Zararlılar','Tuzaklarla izleme, temizlik, karantina ve dondurma.'],['Kirleticiler','Filtreli havalandırma, kapalı bloklar, asitsiz muhafaza.'],['Işık ve UV','Düşük lüks, UV filtresi, sınırlı ve dönüşümlü sergileme.'],['Yanlış sıcaklık','18–20 °C, ani değişim yok; sürekli ölçüm.'],['Yanlış bağıl nem','%45–55 aralığı; %65 üzeri küf, çok kuru ortam kırılganlık.'],['İlişkisizlik','Eksiksiz kayıt, etiket ve yer bilgisi; eser kaybolmaz.']];
 var box=$('#agents');if(!box)return;A.forEach(function(a,i){var b=h('button',{type:'button','class':'agent','aria-label':a[0]+': önlemi göster'},'<div class="in"><div class="f"><b>'+(i<9?'0':'')+(i+1)+'</b><span>'+a[0]+'</span></div><div class="b">'+a[1]+'</div></div>');b.addEventListener('click',function(){b.classList.toggle('flip');});box.appendChild(b);});})();

/* ---------- İklim simülatörü ---------- */
(function(){var t=$('#t'),rh=$('#rh'),lx=$('#lx'),uv=$('#uv');if(!t)return;var sw=$('#swatch');
 // Gerçekçi sayfa: nemle dalgalanır ve küflenir, ışıkla mürekkep solar ve kâğıt sararır, kurulukta kenarlar çatlar ve kıvrılır
 var PW=480,PH=640,cv=document.createElement('canvas');cv.width=PW;cv.height=PH;cv.className='simpage';sw.appendChild(cv);var X=cv.getContext('2d');
 var r7=(function(s){return function(){s=(s*16807)%2147483647;return (s-1)/2147483646;};})(4242);
 function mk(w,h){var c=document.createElement('canvas');c.width=w;c.height=h;return c;}
 var P0=mk(PW,PH),INK=mk(PW,PH),PG=mk(PW,PH),IT=mk(PW,PH),built=false,MOLD=[],FOX=[],CR=[];
 function build(){if(built)return;var TZ=window.Tezhip,x=P0.getContext('2d'),k=INK.getContext('2d');built=true;
   x.fillStyle=TZ?TZ.pattern(x,'paper'):'#EFE4C6';x.fillRect(0,0,PW,PH);x.fillStyle='rgba(240,228,196,.35)';x.fillRect(0,0,PW,PH);
   for(var i=0;i<3000;i++){x.fillStyle=r7()<.5?'rgba(120,95,60,.07)':'rgba(255,250,236,.1)';x.fillRect(r7()*PW,r7()*PH,1+r7()*2,1+r7()*2);}
   k.strokeStyle='rgba(155,45,32,.85)';k.lineWidth=2;k.strokeRect(46,52,PW-92,PH-104);k.strokeStyle='rgba(26,18,12,.75)';k.lineWidth=.8;k.strokeRect(52,58,PW-104,PH-116);
   if(TZ)for(var l=0;l<13;l++){var y=100+l*36,px=PW-70;while(px>80){var w=Math.min(px-74,30+r7()*60),p=TZ.script(px-w,px,y,19,Math.floor(r7()*99999)+1,true);k.fillStyle=(l%6===0&&px>PW-130)?'rgba(155,38,26,.95)':'rgba(30,22,16,.95)';k.fill(p);px=p.left-7-r7()*7;}}
   // küf kolonileri (eşik sırasına göre büyür), lekeler ve kuruma çatlakları
   var sp=[['60,70,55','40,45,35'],['30,30,28','10,10,10'],['150,90,120','120,60,100'],['110,120,70','80,90,50']];
   for(i=0;i<9;i++){var e=r7()<.5;MOLD.push({x:e?(r7()<.5?30+r7()*60:PW-30-r7()*60):60+r7()*(PW-120),y:40+r7()*(PH-80),R:22+r7()*38,th:i/9*.55,s:sp[i%4],seed:Math.floor(r7()*1e6)});}
   for(i=0;i<40;i++)FOX.push({x:r7()*PW,y:r7()*PH,r:1.5+r7()*r7()*7,th:r7()});
   for(i=0;i<26;i++){var side=Math.floor(r7()*4),t=r7(),sx=side%2?(side===1?PW:0):t*PW,sy=side%2?t*PH:(side===2?PH:0),pts=[[sx,sy]],a=Math.atan2(PH/2-sy,PW/2-sx)+(r7()-.5)*.8,L=14+r7()*46;for(var j=0;j<6;j++){var q=pts[pts.length-1];pts.push([q[0]+Math.cos(a)*L/5+(r7()-.5)*3,q[1]+Math.sin(a)*L/5+(r7()-.5)*3]);}CR.push({p:pts,th:r7()});}}
 var S={c:{yel:0,ink:0,mold:0,dry:0,cock:0},t:{yel:0,ink:0,mold:0,dry:0,cock:0},raf:0,tm:0};
 function colony(x,m,a){var r=(function(s){return function(){s=(s*16807)%2147483647;return (s-1)/2147483646;};})(m.seed),R=m.R*a;
   var g=x.createRadialGradient(m.x,m.y,0,m.x,m.y,R*1.6);g.addColorStop(0,'rgba('+m.s[0]+','+(.35*a)+')');g.addColorStop(1,'rgba('+m.s[0]+',0)');x.fillStyle=g;x.fillRect(m.x-R*1.6,m.y-R*1.6,R*3.2,R*3.2);
   // yoğun merkez ve büyüme halkaları
   var cg=x.createRadialGradient(m.x,m.y,0,m.x,m.y,R*.45);cg.addColorStop(0,'rgba('+m.s[1]+','+(.55*a)+')');cg.addColorStop(1,'rgba('+m.s[1]+',0)');x.fillStyle=cg;x.beginPath();x.ellipse(m.x,m.y,R*.45,R*.4,m.seed%3,0,7);x.fill();
   for(var rg=1;rg<=3;rg++){x.strokeStyle='rgba('+m.s[0]+','+(.18*a)+')';x.lineWidth=1.2;x.beginPath();x.ellipse(m.x,m.y,R*rg/3.4,R*rg/3.8,(m.seed%5)*.3,0,7);x.stroke();}
   for(var i=0;i<Math.round(420*a);i++){var an=r()*Math.PI*2,d=Math.pow(r(),.9)*R,px=m.x+Math.cos(an)*d,py=m.y+Math.sin(an)*d*(.8+.2*r());x.fillStyle='rgba('+(r()<.6?m.s[1]:m.s[0])+','+(.25+r()*.5)+')';x.beginPath();x.arc(px,py,.5+r()*1.6*(1-d/R*.6),0,7);x.fill();}
   x.strokeStyle='rgba('+m.s[0]+','+(.25*a)+')';x.lineWidth=.6;for(i=0;i<Math.round(40*a);i++){var a2=r()*Math.PI*2,d2=R*(.8+r()*.5);x.beginPath();x.moveTo(m.x+Math.cos(a2)*R*.6,m.y+Math.sin(a2)*R*.6);x.lineTo(m.x+Math.cos(a2)*d2,m.y+Math.sin(a2)*d2);x.stroke();}}
 function render(){build();var c=S.c,x=PG.getContext('2d');
   x.globalCompositeOperation='source-over';x.drawImage(P0,0,0);
   // sararma: genel ton ve kenarlarda koyulaşma
   if(c.yel>.01){x.globalCompositeOperation='multiply';x.fillStyle='rgba(205,160,90,'+(.55*c.yel)+')';x.fillRect(0,0,PW,PH);var eg=x.createRadialGradient(PW/2,PH/2,PW*.35,PW/2,PH/2,PH*.72);eg.addColorStop(0,'rgba(150,100,40,0)');eg.addColorStop(1,'rgba(150,100,40,'+(.7*c.yel)+')');x.fillStyle=eg;x.fillRect(0,0,PW,PH);x.globalCompositeOperation='source-over';}
   // lekeler (foxing)
   var fx=Math.min(1,c.yel*.7+c.mold*.6);FOX.forEach(function(f){if(f.th>fx)return;var g=x.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r);g.addColorStop(0,'rgba(140,85,40,.55)');g.addColorStop(1,'rgba(140,85,40,0)');x.fillStyle=g;x.fillRect(f.x-f.r,f.y-f.r,2*f.r,2*f.r);});
   // mürekkep: ışıkla solar ve kahverengileşir
   var it=IT.getContext('2d');it.clearRect(0,0,PW,PH);it.globalCompositeOperation='source-over';it.drawImage(INK,0,0);if(c.ink>.01){it.globalCompositeOperation='source-atop';it.fillStyle='rgba(120,80,45,'+(.7*c.ink)+')';it.fillRect(0,0,PW,PH);}
   x.globalAlpha=1-.62*c.ink;x.drawImage(IT,0,0);x.globalAlpha=1;
   // küf: koloniler eşiklerini geçtikçe büyür, arkalarında renkli leke kalır
   MOLD.forEach(function(m){var a=Math.max(0,Math.min(1,(c.mold-m.th)/.35));if(a>0)colony(x,m,a);});
   // kuruluk: kenarlardan içeri çatlaklar
   if(c.dry>.02){x.lineCap='round';CR.forEach(function(k){if(k.th>c.dry)return;x.strokeStyle='rgba(55,35,18,.85)';x.lineWidth=1.5;x.beginPath();k.p.forEach(function(q,i){i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]);});x.stroke();x.strokeStyle='rgba(255,248,230,.6)';x.lineWidth=.6;x.save();x.translate(1,1);x.stroke();x.restore();});}
   // sayfayı ekrana çiz: nemde dalgalanma (kockling), kurulukta kıvrılma
   X.clearRect(0,0,PW,PH);var pad=14,A=c.cock*7,cw=PW-2*pad,chh=PH-2*pad,sc=1-.03*c.dry;
   X.save();X.translate(PW/2,PH/2);X.scale(sc,sc);X.translate(-PW/2,-PH/2);
   X.shadowColor='rgba(0,0,0,.28)';X.shadowBlur=14;X.shadowOffsetY=5;X.fillStyle='#000';X.fillRect(pad+4,pad+4,cw-8,chh-8);X.shadowColor='transparent';
   var strip=4;for(var sx=0;sx<cw;sx+=strip){var ph=sx/cw*Math.PI*5,dy=A*Math.sin(ph)*Math.sin(sx/cw*Math.PI),cl=c.dry*10*Math.pow(Math.abs(sx/cw-.5)*2,3);X.drawImage(PG,sx*PW/cw,0,strip*PW/cw+1,PH,pad+sx,pad+dy-cl,strip+.6,chh+cl*2*.6);}
   if(A>.2){for(sx=0;sx<cw;sx+=strip){var s2=Math.cos(sx/cw*Math.PI*5)*Math.sin(sx/cw*Math.PI);X.fillStyle=s2>0?'rgba(255,255,255,'+(.10*c.cock*s2)+')':'rgba(40,25,10,'+(-.16*c.cock*s2)+')';X.fillRect(pad+sx,pad,strip+.6,chh);}}
   if(c.dry>.05){var eg2=X.createLinearGradient(pad,0,pad+cw,0);eg2.addColorStop(0,'rgba(60,40,20,'+(.55*c.dry)+')');eg2.addColorStop(.12,'rgba(60,40,20,0)');eg2.addColorStop(.88,'rgba(60,40,20,0)');eg2.addColorStop(1,'rgba(60,40,20,'+(.55*c.dry)+')');X.fillStyle=eg2;X.fillRect(pad,pad-20,cw,chh+40);}
   if(c.dry>.05){var cs=40*c.dry;[[pad,pad,1,1],[pad+cw,pad,-1,1],[pad,pad+chh,1,-1],[pad+cw,pad+chh,-1,-1]].forEach(function(k){X.beginPath();X.moveTo(k[0],k[1]);X.lineTo(k[0]+k[2]*cs,k[1]);X.quadraticCurveTo(k[0]+k[2]*cs*.4,k[1]+k[3]*cs*.4,k[0],k[1]+k[3]*cs);X.closePath();
     var cg2=X.createLinearGradient(k[0],k[1],k[0]+k[2]*cs*.6,k[1]+k[3]*cs*.6);cg2.addColorStop(0,'rgba(255,250,235,.55)');cg2.addColorStop(1,'rgba(90,60,30,.35)');X.fillStyle=cg2;X.fill();});}
   X.restore();}
 function step(t){S.raf=0;var c=S.c,T=S.t,moving=false;for(var k in c){var d=T[k]-c[k];if(Math.abs(d)>.002){c[k]+=d*.12;moving=true;}else c[k]=T[k];}render();if(moving)S.raf=requestAnimationFrame(step);}
 function kick(){if(!S.raf)S.raf=requestAnimationFrame(step);}
 function lvl(el,txtEl,v,labels){var c=v<.34?'ok':v<.67?'warn':'bad';el.style.width=Math.max(4,Math.min(100,v*100))+'%';el.style.background='var(--'+c+')';txtEl.className='lv-'+c;txtEl.textContent=labels[c==='ok'?0:c==='warn'?1:2];return c;}
 function upd(){var T=+t.value,R=+rh.value,L=+lx.value,U=uv.getAttribute('aria-pressed')==='true';
  $('#t-o').textContent=T+' °C';$('#rh-o').textContent='%'+R;$('#lx-o').textContent=L+' lüks';
  var rate=Math.pow(2,(T-20)/5)*(R/50);
  var mold=R<60?(R-20)/120:R<65?.45+(R-60)/20:.75+(R-65)/80+(T>22?.1:0);
  var dry=R>=40?Math.max(0,(45-R)/30):.45+(40-R)/30;
  var light=L<=50?L/150:.34+(L-50)/300;if(!U)light+=.35;
  var c1=lvl($('#m-rate'),$('#m-rate-t'),Math.min(1,(rate-.4)/2.6),['×'+rate.toFixed(1),'×'+rate.toFixed(1),'×'+rate.toFixed(1)]);
  var c2=lvl($('#m-mold'),$('#m-mold-t'),mold,['düşük','orta','yüksek']);
  var c3=lvl($('#m-dry'),$('#m-dry-t'),dry,['düşük','orta','yüksek']);
  var c4=lvl($('#m-light'),$('#m-light-t'),light,['uygun','dikkat','yüksek']);
  var bads=[c1,c2,c3,c4].filter(function(c){return c==='bad';}).length,warns=[c1,c2,c3,c4].filter(function(c){return c==='warn';}).length;
  $('#verdict').textContent=bads?'Eser risk altında':warns?'Dikkat: hedef aralığın dışına çıkılıyor':'Koşullar hedef aralıkta';
  S.t={yel:Math.min(1,Math.max(0,(rate-.9)/3)+Math.max(0,light-.3)*.5),ink:Math.min(1,Math.max(0,light-.25)*1.1),mold:Math.max(0,Math.min(1,(mold-.4)*1.5)),dry:Math.max(0,Math.min(1,(dry-.3)*1.6)),cock:Math.max(0,Math.min(1,(R-58)/25))};kick();
  var notes=[];if(R>=65)notes.push('%65 üzerindeki nemde küf ve kitap biti riski belirgin artar.');if(R<40)notes.push('Çok kuru ortamda kâğıt ve deri gerilir, kırılganlaşır.');if(T>24)notes.push('Sıcaklık arttıkça kimyasal bozulma hızlanır; tablo yaklaşık her 5 °C’de iki katı varsayar.');if(L>50)notes.push('Işık hasarı birikimlidir ve geri döndürülemez.');if(!U)notes.push('UV filtresi olmadan selüloz ve boyalar daha hızlı bozulur.');
  $('#sim-note').textContent=notes.join(' ')||'Hedef: 18–20 °C, %45–55 bağıl nem, hassas eserde en fazla 50 lüks ve UV filtresi.';}
 [t,rh,lx].forEach(function(e){e.addEventListener('input',upd);});
 uv.addEventListener('click',function(){var on=uv.getAttribute('aria-pressed')!=='true';uv.setAttribute('aria-pressed',on);uv.textContent=on?'UV filtresi açık':'UV filtresi kapalı';upd();});
 $('#sim-reset').addEventListener('click',function(){t.value=20;rh.value=50;lx.value=50;uv.setAttribute('aria-pressed','true');uv.textContent='UV filtresi açık';upd();});
 upd();})();

/* ---------- Bütünleşik zararlı yönetimi ---------- */
(function(){var I=[['İzle','yapışkan tuzak','Depo ve atölyelere yapışkan tuzaklar konur, düzenli kontrol edilir.'],['Tanımla','tür ve kayıt','Yakalanan türler tanımlanır ve kaydedilir; hangi sorunun habercisi olduğuna bakılır.'],['Önle','temizlik, iklim','Toz ve organik artık temizlenir, nem düşürülür, yiyecek alanları ayrılır.'],['Müdahale','karantina, dondurma','Enfekte eser ayrılır; kimyasal kullanmadan dondurma ya da oksijensiz ortamla dezenfekte edilir.']];
 var box=$('#ipm');if(!box)return;I.forEach(function(x,i){var b=h('button',{type:'button'},x[0]+'<small>'+x[1]+'</small>');b.addEventListener('click',function(){sel(i);});box.appendChild(b);});
 var bs=$$('button',box);function sel(i){bs.forEach(function(b,k){b.setAttribute('aria-pressed',k===i);});$('#ipm-t').textContent=I[i][2];}sel(0);})();

/* ---------- Hasar kataloğu ---------- */
(function(){var C=[
 {t:'Kâğıt',img:'pamuklasma',cap:'Pamuklaşma örnekleri, bozulma türleri dersinden',items:[['Pamuklaşma','Uzun süre nemde kalan kâğıtta küf ve bakteriler selülozu parçalar; lifler arası bağ çözülür, kâğıt keçeleşir ve dokununca dağılır. Çok ince Japon kâğıdı ve en az nemle sağlamlaştırılır.'],['Asitlenme ve sararma','Asit selüloz zincirlerini kısaltır; kâğıt sararır ve kırılganlaşır.'],['Lekeler','Su lekesi ve dalga izi, foxing denen pas rengi benekler, kir ve yağ lekeleri.'],['Yırtık ve kayıp','Kullanım ve katlanmayla oluşur; en çok kenar, köşe ve sırtta görülür.'],['Deformasyon','Dalgalanma, buruşma; ıslanmış yaprakların birbirine yapışması.']]},
 {t:'Mürekkep ve boya',img:'hero',cap:'Yoğun metinli bir yazma eser sayfası',items:[['Demir-gal korozyonu','Demir ve asit kâğıdı “yakar”: harf çevresinde kahverengi hale, çatlak ve harf biçiminde kayıp. Nem süreci hızlandırır.'],['Bakır yeşili (zencar)','Bakır pigmentli yeşil boyalar kâğıdı kahverengileştirir ve deler; minyatür ve cetvellerde görülür.'],['Dağılma ve dökülme','Suya hassas mürekkep ıslakta yayılır; bağlayıcısı zayıflamış boya pul pul kalkar. Her yaş işlemden önce test yapılır.'],['Yaldız','Altın kararmaz ama aşınır; gümüş oksitlenerek kararır.']]},
 {t:'Cilt',img:'cilt-kaybi',cap:'Cildi kaybolmuş, dikişleri açıkta kalmış bir eser',items:[['Kırmızı çürüme','Deri tozlaşır, elde kızıl bir toz bırakır; Klucel G ile sağlamlaştırılır.'],['Kapak sorunları','Köşe ezilmesi, mukavva katmanlarının ayrılması, kapağın kopması.'],['Yapısal bozulma','Sırt kaybı, dikiş ve şiraze kopması, formaların ayrılması.'],['Miklep ve sertap','Katlama yerinden kopma ve kayıp.']]},
 {t:'Biyolojik',img:'galeriler',cap:'Işıkta beliren böcek galerileri',items:[['Böcek delikleri ve galeriler','Larvalar kâğıdın içinde ilerleyerek kıvrımlı tüneller açar; ışık masasında net görülür.'],['Küf','Renkli lekeler ve yumuşama; sağlık riski nedeniyle maske ve eldivenle çalışılır.'],['Kemirgen hasarı','Kenarlarda kemirme izleri ve kirlenme.']]}];
 var tabs=$('#cat-tabs');if(!tabs)return;C.forEach(function(c,i){var b=h('button',{type:'button',role:'tab'},c.t);b.addEventListener('click',function(){sel(i);});tabs.appendChild(b);});
 var bs=$$('button',tabs),img=$('#cat-img');
 function sel(i){var c=C[i];bs.forEach(function(b,k){b.setAttribute('aria-selected',k===i);});img.style.opacity=0;setTimeout(function(){img.src=''+c.img+'.jpg';img.alt=c.cap;img.style.opacity=1;},180);$('#cat-cap').textContent=c.cap;
  $('#cat-list').innerHTML=c.items.map(function(x,k){return '<details'+(k===0?' open':'')+'><summary>'+x[0]+'</summary><p>'+x[1]+'</p></details>';}).join('');}
 sel(0);})();

/* ---------- Büyüteç ---------- */
(function(){var m=$('#mag'),lens=$('#lens');if(!m)return;var img=$('img',m),Z=2.6;
 function mv(x,y){var r=m.getBoundingClientRect();var px=x-r.left,py=y-r.top;lens.style.left=px+'px';lens.style.top=py+'px';
  lens.style.backgroundImage='url("'+img.currentSrc+'")';lens.style.backgroundSize=(r.width*Z)+'px '+(r.height*Z)+'px';lens.style.backgroundPosition=(-(px*Z-95))+'px '+(-(py*Z-95))+'px';}
 m.addEventListener('pointermove',function(e){mv(e.clientX,e.clientY);});m.addEventListener('pointerdown',function(e){m.classList.add('touch');mv(e.clientX,e.clientY);});
 m.addEventListener('pointerup',function(){m.classList.remove('touch');});m.addEventListener('pointerleave',function(){m.classList.remove('touch');});})();

/* ---------- Japon kâğıdı gramaj ---------- */
(function(){var cv=$('#gram-cv');if(!cv)return;var ctx=cv.getContext('2d'),r=$('#g-range'),fiber='kozo',seed=1;
 function rnd(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;}
 var lines=[];(function(){seed=11;for(var i=0;i<13;i++){var y=70+i*38,x=90,segs=[];while(x<700){var w=24+rnd()*70;segs.push([x,w,rnd()*3]);x+=w+10+rnd()*8;}lines.push([y,segs,i%6===0]);}})();
 var USE=[[5,'Yüzey sağlamlaştırma','Pamuklaşmış ve kırılgan alanlar; metin rahatça okunur.'],[12,'Yırtık onarımı','Yırtık, menteşe ve kenar sağlamlaştırma için ince ama dayanıklı.'],[25,'Kayıp tamamlama (ince kâğıt)','İnce yazma eser kâğıtlarında kayıp alanların tamamlanması.'],[41,'Kalın kâğıt ve cilt işleri','Kalın kâğıtta tamamlama, sırt astarları ve cilt işleri; metni örter.']];
 var gramB=null,gramT=null;
 // alttaki yaprak: eski kâğıt, cetvel, kalemle satırlar
 function gramBase(W,H){if(gramB)return gramB;gramB=document.createElement('canvas');gramB.width=W;gramB.height=H;var x=gramB.getContext('2d'),TZ=window.Tezhip,sv=seed;seed=31;
  x.fillStyle=TZ?TZ.pattern(x,'paper'):'#EFE4C6';x.fillRect(0,0,W,H);var gg=x.createRadialGradient(W/2,H/2,150,W/2,H/2,560);gg.addColorStop(0,'rgba(170,120,60,0)');gg.addColorStop(1,'rgba(150,100,45,.35)');x.fillStyle=gg;x.fillRect(0,0,W,H);
  for(var i=0;i<14;i++){var fx=rnd()*W,fy=rnd()*H,fr=2+rnd()*8,fg=x.createRadialGradient(fx,fy,0,fx,fy,fr);fg.addColorStop(0,'rgba(140,85,40,.45)');fg.addColorStop(1,'rgba(140,85,40,0)');x.fillStyle=fg;x.fillRect(fx-fr,fy-fr,2*fr,2*fr);}
  x.strokeStyle='rgba(155,45,32,.85)';x.lineWidth=2;x.strokeRect(70,50,W-140,H-100);if(TZ){x.strokeStyle=TZ.pattern(x,'gold');x.lineWidth=3;x.strokeRect(77,57,W-154,H-114);}
  if(TZ)for(var l=0;l<12;l++){var y=100+l*38,px=W-96;while(px>110){var w=Math.min(px-100,36+rnd()*70),p=TZ.script(px-w,px,y,22,Math.floor(rnd()*99999)+1,true);x.fillStyle=(l%6===0&&px>W-170)?'rgba(155,38,26,.92)':'rgba(30,22,16,'+(.82+rnd()*.12)+')';x.fill(p);px=p.left-9-rnd()*9;}}
  else lines.forEach(function(L){L[1].forEach(function(s,k){x.fillStyle=(L[2]&&k===0)?'#9B2D20':'#2A2420';x.fillRect(s[0],L[0]+s[2],s[1],9);});});
  seed=sv;return gramB;}
 // Kâğıt, piksel piksel bir "kalınlık haritası"ndan çizilir: lif kümeleri, bambu elek (su) izleri, kabuk benekleri.
 // Yansıyan ışıkta örtücülük, arkadan ışıkta geçirgenlik bu kalınlıktan hesaplanır; ıslakken kâğıt saydamlaşır.
 var mode={back:false,wet:false},TM=null,BD=null,EDGE=null,OUT=null;
 var FT={kozo:{len:110,lw:1.6,n:1,cloud:.55,bund:3,chiri:70,col:[249,245,234]},mitsumata:{len:42,lw:.95,n:1.7,cloud:.3,bund:1,chiri:12,col:[251,246,230]},gampi:{len:24,lw:.6,n:2.6,cloud:.14,bund:1,chiri:4,col:[252,248,238]}};
 function edgePts(W,H){if(EDGE)return EDGE;var e=[],s0=seed;seed=77;for(var y=-10;y<=H+10;y+=7)e.push([W*.32+Math.sin(y*.018)*16+(rnd()-.5)*9,y]);seed=s0;return EDGE=e;}
 function region(c,W,H){var e=edgePts(W,H);c.beginPath();c.moveTo(W+10,-10);e.forEach(function(q){c.lineTo(q[0],q[1]);});c.lineTo(W+10,H+10);c.closePath();}
 function thickness(W,H,g,F){var C=TM||(TM=document.createElement('canvas'));C.width=W;C.height=H;var t=C.getContext('2d');seed=7+g*13+F.len;
   t.fillStyle='#000';t.fillRect(0,0,W,H);t.save();region(t,W,H);t.clip();t.globalCompositeOperation='lighter';
   t.fillStyle='rgba(255,255,255,.42)';t.fillRect(0,0,W,H);
   // oluşum: lif kümeleri bulut gibi kalın-ince alanlar bırakır
   for(var i=0;i<110;i++){var cx=rnd()*W,cy=rnd()*H,cr=12+rnd()*55,a=F.cloud*.28*rnd(),cg=t.createRadialGradient(cx,cy,0,cx,cy,cr);cg.addColorStop(0,'rgba(255,255,255,'+a+')');cg.addColorStop(1,'rgba(255,255,255,0)');t.fillStyle=cg;t.fillRect(cx-cr,cy-cr,2*cr,2*cr);}
   // bambu elekten kalan sık yatay çizgiler ve seyrek zincir çizgileri
   for(var y=0;y<H;y+=3.2){t.fillStyle='rgba(255,255,255,'+(.025+rnd()*.02)+')';t.fillRect(0,y,W,1.1);}
   for(var x=W*.3;x<W;x+=64+rnd()*6){t.fillStyle='rgba(255,255,255,.05)';t.fillRect(x,0,1.6,H);}
   t.restore();t.globalCompositeOperation='lighter';t.lineCap='round';
   // lifler: kozo uzun ve kıvrımlı demetler, mitsumata kısa ve düzgün, gampi çok ince ve kısa
   var n=Math.round((220+g*22)*F.n),e=edgePts(W,H);
   for(i=0;i<n;i++){var px=W*.28+rnd()*W*.74,py=rnd()*H,L=F.len*(.4+rnd()),an=rnd()*Math.PI,cu=(rnd()-.5)*(F.bund>1?1.4:.7),al=.035+rnd()*.075;
     for(var b=0;b<F.bund;b++){var o=(b-(F.bund-1)/2)*F.lw*1.3;t.strokeStyle='rgba(255,255,255,'+al+')';t.lineWidth=F.lw*(.6+rnd()*.7);t.beginPath();t.moveTo(px+o*Math.sin(an),py-o*Math.cos(an));t.quadraticCurveTo(px+Math.cos(an+cu)*L/2,py+Math.sin(an+cu)*L/2,px+Math.cos(an)*L+o*Math.sin(an),py+Math.sin(an)*L-o*Math.cos(an));t.stroke();}}
   // suyla koparılmış kenardan taşan lifler
   e.forEach(function(q){for(var j=0;j<3;j++){var L2=F.len*(.25+rnd()*.5),a2=Math.PI+(rnd()-.5)*1.5;t.strokeStyle='rgba(255,255,255,'+(.18+rnd()*.2)+')';t.lineWidth=F.lw*.8;t.beginPath();t.moveTo(q[0]+5,q[1]+(rnd()-.5)*7);t.quadraticCurveTo(q[0]+Math.cos(a2)*L2/2,q[1]+Math.sin(a2)*L2/2+(rnd()-.5)*8,q[0]+Math.cos(a2)*L2,q[1]+Math.sin(a2)*L2);t.stroke();}});
   t.globalCompositeOperation='source-over';
   // kabuk benekleri (chiri)
   var ch=[];for(i=0;i<F.chiri*(.5+g/40);i++){var cx2=W*.34+rnd()*W*.66,cy2=rnd()*H;ch.push([cx2,cy2,.6+rnd()*1.8,rnd()*3]);}
   return {d:t.getImageData(0,0,W,H).data,chiri:ch};}
 var cache={key:''};
 function draw(){var g=+r.value;$('#g-val').textContent=g;var u=USE.filter(function(x){return g<=x[0];})[0];$('#g-use').textContent=u[1];$('#g-desc').textContent=u[2];
  var W=cv.width,H=cv.height,F=FT[fiber],key=g+fiber;
  if(!BD){var b0=gramBase(W,H);BD=b0.getContext('2d').getImageData(0,0,W,H).data;}
  if(cache.key!==key){cache=thickness(W,H,g,F);cache.key=key;}
  var T=cache.d,img=OUT||(OUT=ctx.createImageData(W,H)),o=img.data,gk=.28+g/14,col=F.col,wet=mode.wet,back=mode.back;
  var kr=wet?.75:1.45,kb=wet?.45:.8;
  for(var i=0,n=W*H*4;i<n;i+=4){var th=T[i]/255*gk,pr=BD[i],pg=BD[i+1],pb=BD[i+2];
    if(back){var L=(pr*.3+pg*.59+pb*.11)/255,tp=.12+.95*Math.pow(L,1.6),tt=Math.exp(-kb*th)*(wet?1.05:1),px=(i>>2)%W,py=(i>>2)/W|0,vg=1-.25*(Math.pow((px-W/2)/W*2,2)+Math.pow((py-H/2)/H*2,2));var v=tp*tt*vg*1.12;o[i]=Math.min(255,255*v*1.05);o[i+1]=Math.min(255,244*v*1.03);o[i+2]=Math.min(255,214*v);}
    else{var a=1-Math.exp(-kr*th);var cr=col[0],cg2=col[1],cb=col[2];if(wet&&T[i]>2){pr*=.86;pg*=.85;pb*=.82;cr=226;cg2=222;cb=212;}o[i]=pr*(1-a)+cr*a;o[i+1]=pg*(1-a)+cg2*a;o[i+2]=pb*(1-a)+cb*a;}
    o[i+3]=255;}
  ctx.putImageData(img,0,0);
  // kabuk benekleri
  cache.chiri.forEach(function(c){ctx.fillStyle=back?'rgba(40,25,10,.75)':'rgba(95,70,40,'+(wet?.35:.6)+')';ctx.beginPath();ctx.ellipse(c[0],c[1],c[2],c[2]*.6,c[3],0,7);ctx.fill();});
  if(wet&&!back){ctx.save();region(ctx,W,H);ctx.clip();var gl=ctx.createLinearGradient(W*.3,0,W,H);gl.addColorStop(0,'rgba(255,255,255,0)');gl.addColorStop(.45,'rgba(255,255,255,.10)');gl.addColorStop(.55,'rgba(255,255,255,0)');ctx.fillStyle=gl;ctx.fillRect(0,0,W,H);ctx.restore();}
  if(fiber==='gampi'&&!back&&!wet){ctx.save();region(ctx,W,H);ctx.clip();var sh=ctx.createLinearGradient(W*.3,0,W,H);sh.addColorStop(0,'rgba(255,255,255,0)');sh.addColorStop(.5,'rgba(255,255,255,.09)');sh.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=sh;ctx.fillRect(0,0,W,H);ctx.restore();}
  // kalkık köşe: kalın kâğıt sertleşir ve köşesi kalkar; ince ve ıslak kâğıt yapışık kalır
  var s=wet?0:Math.round(10+g*2.6);if(s>12){var A=[W-s,H],B=[W,H-s],Cn=[W,H],Fp=[W-s*.86,H-s*.86];
    ctx.save();ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(B[0],B[1]);ctx.lineTo(Cn[0],Cn[1]);ctx.closePath();ctx.clip();ctx.drawImage(gramBase(W,H),0,0);
    if(back){ctx.fillStyle='rgba(255,240,210,.35)';ctx.fillRect(W-s,H-s,s,s);}ctx.restore();
    ctx.save();ctx.shadowColor='rgba(40,30,15,'+(back?.0:.35)+')';ctx.shadowBlur=10;ctx.shadowOffsetX=4;ctx.shadowOffsetY=4;ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(B[0],B[1]);ctx.lineTo(Fp[0],Fp[1]);ctx.closePath();
    var ff=ctx.createLinearGradient((A[0]+B[0])/2,(A[1]+B[1])/2,Fp[0],Fp[1]),fa=Math.min(.96,.35+g/50);
    if(back){ff.addColorStop(0,'rgba(120,100,70,'+fa*.6+')');ff.addColorStop(1,'rgba(160,140,105,'+fa*.5+')');}else{ff.addColorStop(0,'rgba(222,214,196,'+fa+')');ff.addColorStop(1,'rgba(252,249,241,'+fa+')');}
    ctx.fillStyle=ff;ctx.fill();ctx.restore();ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(B[0],B[1]);ctx.lineTo(Fp[0],Fp[1]);ctx.lineTo(A[0],A[1]);ctx.stroke();}
  var lab=g+' g/m² · '+fiber+(back?' · ışığa karşı':'')+(wet?' · ıslak':'');ctx.font='500 22px "IBM Plex Mono", monospace';var tw=ctx.measureText(lab).width;ctx.fillStyle=back?'rgba(0,0,0,.5)':'rgba(243,241,234,.75)';ctx.fillRect(14,H-50,tw+20,36);ctx.fillStyle=back?'#F3F1EA':'rgba(27,31,28,.85)';ctx.fillText(lab,24,H-24);}
 $$('#g-mode button').forEach(function(b){b.addEventListener('click',function(){var k=b.dataset.m;mode[k]=!mode[k];b.setAttribute('aria-pressed',mode[k]);draw();});});
 r.addEventListener('input',draw);$$('#fiber button').forEach(function(b){b.addEventListener('click',function(){fiber=b.dataset.f;$$('#fiber button').forEach(function(x){x.setAttribute('aria-selected',x===b);});draw();});});
 if(document.fonts&&document.fonts.ready)document.fonts.ready.then(draw);draw();})();

/* ---------- Yapıştırıcı tarifleri ---------- */
(function(){var R=[
 {t:'Buğday nişastası',img:'yapistiricilar',cap:'Hazırlanmış yapıştırıcılar',kv:[['YAPI','Doğal polisakkarit'],['ÇÖZÜCÜ','Su'],['ÖZELLİK','Güçlü, esnek, tersinir'],['KULLANIM','Yırtık onarımı, tamamlama, cilt']],s:['Nişasta tartılır, suda bekletilir','Sürekli karıştırarak pişirilir; şeffaflaşınca ocaktan alınır','Soğuyunca süzgeçten geçirilir','Kullanım kıvamına seyreltilir; taze kullanılır'],n:'Kavanoza içerik, oran ve hazırlayan kişi yazılır.'},
 {t:'Metilselüloz',img:'tartim',cap:'Hassas terazide tartım',kv:[['YAPI','Selüloz eteri'],['ÇÖZÜCÜ','Su'],['ÖZELLİK','Zayıf-orta yapışma, uzun açık süre'],['KULLANIM','Nemlendirme jeli, eski onarım çıkarma']],s:['Toz hassas terazide tartılır','Suya yavaş yavaş serpilir','Topaklanmadan karıştırılır','Şişmesi için dinlendirilir'],n:'Eski onarımları yumuşatmak için jel olarak da kullanılır.'},
 {t:'Klucel G',img:'remoist-1',cap:'Re-moistenable doku hazırlığı',kv:[['YAPI','Hidroksipropil selüloz'],['ÇÖZÜCÜ','Su ve alkol'],['ÖZELLİK','Çok az nemle çalışır'],['KULLANIM','Deri sağlamlaştırma, suya hassas mürekkep']],s:['Toz tartılır','Alkole serpilir','Topaklanmadan çözülene kadar karıştırılır','Re-moistenable doku için Japon kâğıdına sürülüp film üzerinde kurutulur'],n:'Alkolle çalışırken havalandırma ve koruyucu ekipman kullanılır.'}];
 var tabs=$('#rec-tabs');if(!tabs)return;R.forEach(function(x,i){var b=h('button',{type:'button',role:'tab'},x.t);b.addEventListener('click',function(){sel(i);});tabs.appendChild(b);});
 var bs=$$('button',tabs);function sel(i){var x=R[i];bs.forEach(function(b,k){b.setAttribute('aria-selected',k===i);});
  $('#rec-kv').innerHTML=x.kv.map(function(k){return '<dt>'+k[0]+'</dt><dd>'+k[1]+'</dd>';}).join('');$('#rec-img').src=''+x.img+'.jpg';$('#rec-img').alt=x.cap;$('#rec-cap').textContent=x.cap;$('#rec-note').textContent=x.n;
  var ol=$('#rec-steps');ol.innerHTML='';x.s.forEach(function(s){var li=h('li',{tabindex:'0',role:'checkbox','aria-checked':'false'},'<span>'+s+'</span>');function tg(){li.classList.toggle('ok');li.setAttribute('aria-checked',li.classList.contains('ok'));}li.addEventListener('click',tg);li.addEventListener('keydown',function(e){if(e.key===' '||e.key==='Enter'){e.preventDefault();tg();}});ol.appendChild(li);});}
 sel(0);})();

/* ---------- Bir yaprağın tedavisi ---------- */
(function(){var leaf=$('#leaf');if(!leaf)return;var NS='http://www.w3.org/2000/svg';
 function el(t,a,p){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
 var s=7;function rnd(){s=(s*9301+49297)%233280;return s/233280;}
 var mt=$('#matTicks');for(var x=40;x<1000;x+=40)el('line',{x1:x,y1:0,x2:x,y2:(x%200===0?18:10),stroke:'#F6F4EF','stroke-opacity':.55,'stroke-width':1.5},mt);
 var lines=$('#lines');for(var i=0;i<11;i++){var y=190+i*36,end=700-Math.round(rnd()*60)-(i===10?220:0),xx=296;if(i===0||i===6){el('rect',{x:xx,y:y,width:52,height:11,rx:5,fill:'#9B2D20'},lines);xx+=64;}
  while(xx<end){var w=30+Math.round(rnd()*70);if(xx+w>end)w=end-xx;if(w>8)el('rect',{x:xx,y:y+Math.round(rnd()*3),width:w,height:10,rx:5,fill:'#2A2420','fill-opacity':.88},lines);xx+=w+10+Math.round(rnd()*8);}}
 var holes=$('#holes'),H=[[300,170,7],[322,186,5],[344,162,6],[290,214,4],[365,200,5],[312,240,6],[388,176,4],[270,262,5],[352,262,4],[240,190,5],[620,470,5],[640,492,4],[602,505,6]];
 H.forEach(function(q){el('circle',{cx:q[0],cy:q[1],r:q[2],fill:'#1E5F51'},holes);});H.forEach(function(q,i){var hf=el('circle',{'class':'holefill',cx:q[0],cy:q[1],r:q[2]+1.5,fill:'#F2E7CA'},holes);hf.style.transitionDelay=(.5+i*.07).toFixed(2)+'s';});
 var dust=$('#dust');for(var k=0;k<70;k++){var dx=235+rnd()*530,dy=125+rnd()*420;var c=el('circle',{'class':'dust',cx:dx.toFixed(1),cy:dy.toFixed(1),r:(1.2+rnd()*2.6).toFixed(1),fill:rnd()>.5?'#6B5A45':'#857F72','fill-opacity':.75},dust);
  // fırçanın geçtiği yöne savrulur: satır sırası fırçanın zikzak yolunu izler
  var row=Math.floor((dy-120)/108),dir=row%2===0?1:-1;c.style.setProperty('--dx',(dir*(40+rnd()*90)).toFixed(0)+'px');c.style.setProperty('--dy',(10+rnd()*40).toFixed(0)+'px');c.style.transitionDelay=(.15+(dy-120)/430*1.7+(dir>0?(dx-235)/530:(765-dx)/530)*.35).toFixed(2)+'s';}
 var mk=$('#markers'),M=[['m5',318,150,'1','Böcek delikleri',-1],['m2',568,96,'2','Selobant',1],['m3',470,300,'3','Yırtık',-1],['m1',330,420,'4','Toz ve kir',-1],['m4',760,640,'5','Kayıp',1]];
 M.forEach(function(m,j){var g=el('g',{'class':'marker '+m[0]},mk);g.style.transitionDelay=(j*.18)+'s';var lw=m[4].length*12+28,lx=m[5]>0?m[1]+26:m[1]-26-lw;
  el('rect',{x:lx,y:m[2]-18,width:lw,height:36,rx:18,fill:'#16181D','fill-opacity':.88},g);var tx=el('text',{x:lx+lw/2,y:m[2]+7,'text-anchor':'middle',fill:'#F6F4EF','font-family':'IBM Plex Sans, Arial','font-size':20,'font-weight':600},g);tx.textContent=m[4];
  el('circle',{'class':'bad',cx:m[1],cy:m[2],r:20,fill:'#9B2D20',stroke:'#F6F4EF','stroke-width':3},g);el('circle',{'class':'ok',cx:m[1],cy:m[2],r:20,fill:'#2F7D67',stroke:'#F6F4EF','stroke-width':3},g);
  var n=el('text',{'class':'num',x:m[1],y:m[2]+7,'text-anchor':'middle',fill:'#FFFFFF','font-family':'IBM Plex Mono, monospace','font-size':20,'font-weight':600},g);n.textContent=m[3];
  el('path',{'class':'ok',d:'M'+(m[1]-8)+','+m[2]+' l6,6 l11,-12',fill:'none',stroke:'#FFFFFF','stroke-width':4,'stroke-linecap':'round','stroke-linejoin':'round'},g);});
 var S=[['Kabul','KAYIT · ŞİFAHANE MODELİ','Eser atölyeye gelir; kaydı ve ilk gözlemi yapılır. Toz, selobant, yırtık, kayıp köşe ve böcek delikleri dikkat çeker.','Eldiven, temiz çalışma yüzeyi'],
 ['Belgeleme','106 ATÖLYE · DURUM TESPİTİ','Yaprak ölçülür, fotoğraflanır; hasarlar numaralanarak haritalanır.','Işık masası, kalınlık ölçer, ölçek kartı'],
 ['Temizlik','105 ATÖLYE · KURU TEMİZLİK','Gevşek toz yumuşak fırça ve elek üzerinden HEPA vakumla alınır.','Keçi kılı fırça, HEPA vakum, temizlik pedi'],
 ['Eski onarım çıkarma','108 ATÖLYE · ESKİ ONARIM','Niteliksiz selobant metilselüloz jeliyle yumuşatılır ve spatülle kaldırılır.','Metilselüloz jeli, spatül, kurutma kâğıdı'],
 ['Sağlamlaştırma','106 ATÖLYE · YIRTIK ONARIMI','Yırtık, saçaklı kenarlı ince Japon kâğıdı şeritle nişastayla birleştirilir.','Japon kâğıdı (6–12 g/m²), buğday nişastası'],
 ['Tamamlama','102 ATÖLYE · TAMAMLAMA','Kayıp köşe ve delikler tonu uygun Japon kâğıdıyla tamamlanır; metin yeniden yazılmaz.','Tonlu Japon kâğıdı, su kalemi, nişasta'],
 ['Muhafaza','101 ATÖLYE · KUTU','Yaprak, ölçüsüne göre yapılan asitsiz kutuya yerleştirilir ve depoya hazırlanır.','Asitsiz, alkali tamponlu mukavva']];
 var list=$('#l-steps');S.forEach(function(x,i){var b=h('button',{type:'button','class':'l-step'},'<i>'+(i+1)+'</i><span>'+x[0]+'</span><small>'+x[1].split(' · ')[0]+'</small>');b.addEventListener('click',function(){halt();set(i);});list.appendChild(b);});
 var bs=$$('.l-step',list),step=-1,t=null,on=false,pb=$('#l-play'),cap=$('#l-cap');
 function spd(){return window.__trSpeed||1;}
 function rate(){if(!leaf.getAnimations)return;requestAnimationFrame(function(){leaf.getAnimations({subtree:true}).forEach(function(x){x.playbackRate=spd();});});}
 window.addEventListener('trspeed',function(){rate();if(on){clearTimeout(t);tick();}});
 function set(n){var prev=step;step=n;var c=[];for(var j=1;j<=n;j++)c.push('d'+j);if(n>prev&&n>=1)c.push('a'+n);leaf.setAttribute('class',c.join(' '));rate();
  bs.forEach(function(b,k){b.classList.toggle('done',k<n);b.classList.toggle('cur',k===n);});
  cap.classList.add('swap');setTimeout(function(){$('#l-tag').textContent=S[n][1];$('#l-txt').textContent=S[n][2];$('#l-mat').textContent='Malzeme: '+S[n][3];cap.classList.remove('swap');},180);}
 function tick(){t=setTimeout(function(){if(!on)return;if(step>=S.length-1){halt();return;}set(step+1);tick();},2900/spd());}
 function run(){if(on)return;if(step>=S.length-1)reset();on=true;pb.textContent='❚❚ Duraklat';tick();}
 function halt(){on=false;clearTimeout(t);pb.textContent='▶ Oynat';}
 function reset(){leaf.setAttribute('class','pre');step=-1;void leaf.getBoundingClientRect();set(0);}
 pb.addEventListener('click',function(){on?halt():run();});$('#l-reset').addEventListener('click',function(){halt();reset();});
 leaf.setAttribute('class','pre');var started=false;visible($('.leaf-stage'),function(v){if(v&&!started){started=true;setTimeout(function(){set(0);if(!reduce)setTimeout(run,1200);},100);}if(!v)halt();},{threshold:.4});})();

/* ---------- Önce / sonra ---------- */
(function(){var ba=$('#ba');if(!ba)return;var drag=false;function set(x){var r=ba.getBoundingClientRect();var p=Math.max(0,Math.min(100,(x-r.left)/r.width*100));ba.style.setProperty('--pos',p+'%');}
 ba.addEventListener('pointerdown',function(e){drag=true;ba.setPointerCapture(e.pointerId);set(e.clientX);});ba.addEventListener('pointermove',function(e){if(drag)set(e.clientX);});ba.addEventListener('pointerup',function(){drag=false;});
 ba.tabIndex=0;ba.setAttribute('role','slider');ba.setAttribute('aria-label','Önce ve sonra karşılaştırması');ba.addEventListener('keydown',function(e){var v=parseFloat(getComputedStyle(ba).getPropertyValue('--pos'))||50;if(e.key==='ArrowLeft')v-=5;else if(e.key==='ArrowRight')v+=5;else return;e.preventDefault();ba.style.setProperty('--pos',Math.max(0,Math.min(100,v))+'%');});})();

/* ---------- Cilt modeli adımları ---------- */
(function(){var B=[['dikis','Formaların dikilmesi','Kâğıtlar forma halinde katlanır ve dikilir; dikiş metin bloğunun omurgasıdır.'],['tulbent','Sırta tülbent','Sırt tutkallanır ve tülbentle kaplanır; formalar birlikte çalışır.'],['pres','Preste sabitleme','Blok preste sıkıştırılır, sırt düzgün kurur.'],['siraze','İpekle şiraze örme','Sırt başlarına renkli ipek ipliklerle şiraze örülür; hem süs hem destek.']];
 var img=$('#bind-img'),dots=$('#bind-dots'),pb=$('#bind-play');if(!img)return;var i=-1,t=null,on=false;
 B.forEach(function(b,k){var im=h('img',{src:''+b[0]+'.jpg',alt:b[1],loading:'lazy'});img.appendChild(im);var d=h('button',{type:'button','aria-label':(k+1)+'. adım: '+b[1]},'<i></i>');d.addEventListener('click',function(){halt();show(k);});dots.appendChild(d);});
 var ims=$$('img',img),ds=$$('button',dots);
 function show(k){i=k;ims.forEach(function(m,j){m.classList.toggle('on',j===k);});ds.forEach(function(d,j){d.classList.toggle('done',j<=k);});$('#bind-t').textContent=(k+1)+' · '+B[k][1];$('#bind-d').textContent=B[k][2];}
 function run(){on=true;pb.textContent='❚❚ Duraklat';t=setInterval(function(){show((i+1)%B.length);},2600);}function halt(){on=false;clearInterval(t);pb.textContent='▶ Oynat';}
 pb.addEventListener('click',function(){on?halt():run();});show(0);})();

/* ---------- İlkeler ---------- */
(function(){var P=[['En az müdahale','Pamuklaşmış yaprak yeniden yapılmaz; yalnızca çok ince bir dokuyla desteklenir.'],['Tersinirlik','Nişasta ve metilselüloz su ile geri alınabilir; sentetik tutkal kullanılmaz.'],['Uyumluluk','Onarım kâğıdı orijinalden ince ve zayıf seçilir: zorlanırsa onarım kopar.'],['Belgeleme','Her işlem öncesi, sırası ve sonrasında fotoğraflanır ve kaydedilir.'],['Özgünlüğe saygı','Böcek delikleri ve lekeler eserin tarihidir; kayıp metin yeniden yazılmaz.'],['Ayırt edilebilirlik','Tamamlama kâğıdı uyumlu tonda ama yakından bakınca fark edilir.']];
 var box=$('#principles');if(!box)return;P.forEach(function(p){var b=h('button',{type:'button','class':'agent'},'<div class="in"><div class="f"><b>İLKE</b><span>'+p[0]+'</span></div><div class="b">'+p[1]+'</div></div>');b.addEventListener('click',function(){b.classList.toggle('flip');});box.appendChild(b);});})();

/* ---------- Yazma eser biçimi sekmeleri ---------- */
(function(){var root=$('#type-tabs');if(!root)return;var tabs=$$('[role="tab"]',root),panes=$$('.tpane');
 tabs.forEach(function(t){t.addEventListener('click',function(){tabs.forEach(function(x){x.setAttribute('aria-selected',x===t);});panes.forEach(function(p){p.hidden=p.dataset.type!==t.dataset.k;});window.dispatchEvent(new Event('resize'));});});})();

/* ---------- Tedavi oynatma hızı ---------- */
(function(){var box=$('#tr-speed');if(!box)return;var bs=$$('button',box);window.__trSpeed=1;
 bs.forEach(function(b){b.addEventListener('click',function(){window.__trSpeed=+b.dataset.s;bs.forEach(function(x){x.setAttribute('aria-pressed',x===b);});window.dispatchEvent(new Event('trspeed'));});});})();

/* ---------- Arka plan müziği: iki taksim sırayla, sürekli; ses %25 ---------- */
(function(){var btn=$('#sound'),vol=$('#vol'),pop=$('#snd-pop'),mb=$('#mute'),vo=$('#vol-o'),A=[$('#bgm-0'),$('#bgm-1')];if(!btn||!A[0])return;var i=0,muted=false;
 // ses kaydırıcısı: algıya uygun karesel ölçek; yarıda (%50) başlar, bu da %25 çalma düzeyine denk gelir
 // iPhone/iPad Safari ses öğesinin volume değerini yok sayar: ses Web Audio kazanç düğümünden geçirilir (ilk dokunuşta kurulur)
 var AC=null,G=null;
 function graph(){if(AC)return;var C=window.AudioContext||window.webkitAudioContext;if(!C)return;try{AC=new C();G=AC.createGain();G.connect(AC.destination);A.forEach(function(a){AC.createMediaElementSource(a).connect(G);});}catch(e){AC=null;G=null;}setVol();}
 function wake(){if(AC&&AC.state==='suspended'&&AC.resume)AC.resume();}
 function setVol(){var v=vol?+vol.value/100:.5,g=v*v;if(G){G.gain.value=g;A.forEach(function(a){a.volume=1;});}else A.forEach(function(a){a.volume=g;});if(vol){vol.style.setProperty('--v',vol.value+'%');if(vo)vo.textContent='%'+vol.value;}}
 if(vol)vol.addEventListener('input',function(){setVol();if(+vol.value>0&&muted){muted=false;try{localStorage.setItem('ys-mute','0');}catch(e){}play();ui();}});
 try{muted=localStorage.getItem('ys-mute')==='1';}catch(e){}
 setVol();A.forEach(function(a,k){a.addEventListener('ended',function(){i=(k+1)%A.length;A.forEach(function(x,j){if(j!==i)x.pause();});A[i].preload='auto';A[i].currentTime=0;play();});
   a.addEventListener('play',ui);a.addEventListener('pause',ui);});
 function ui(){btn.setAttribute('aria-pressed',muted);if(mb)mb.textContent=muted?'Müziği aç':'Müziği kapat';btn.classList.toggle('playing',!A[i].paused);}
 function play(){if(muted)return;wake();var p=A[i].play();if(p&&p.catch)p.catch(function(){});}
 // tarayıcılar sesli otomatik oynatmayı ilk etkileşime kadar engeller: ilk dokunuşta başlat
 function first(){['pointerdown','keydown','touchstart'].forEach(function(ev){removeEventListener(ev,first,true);});graph();wake();if(!muted&&A[i].paused)play();}
 ['pointerdown','keydown','touchstart'].forEach(function(ev){addEventListener(ev,first,true);});
 // hoparlör düğmesi ses panelini açar; kapatma/açma ve ses düzeyi panelde
 function openPop(o){if(!pop)return;pop.hidden=!o;btn.setAttribute('aria-expanded',o);}
 btn.addEventListener('click',function(e){e.stopPropagation();openPop(pop.hidden);});
 if(pop)pop.addEventListener('click',function(e){e.stopPropagation();});
 var dragV=false;if(vol){vol.addEventListener('pointerdown',function(){dragV=true;graph();wake();});addEventListener('pointerup',function(){setTimeout(function(){dragV=false;},0);});}
 document.addEventListener('click',function(){if(!dragV)openPop(false);});
 document.addEventListener('keydown',function(e){if(e.key==='Escape')openPop(false);});
 if(mb)mb.addEventListener('click',function(){muted=!muted;try{localStorage.setItem('ys-mute',muted?'1':'0');}catch(err){}if(muted)A[i].pause();else play();ui();});
 ui();play();})();
/* ---------- Yaprak: gerçekçi kâğıt, kalemle yazı, su izi; onarım malzemeleri dokulu ---------- */
(function(){var svg=$('#leaf'),TZ=window.Tezhip;if(!svg||!TZ)return;var NS='http://www.w3.org/2000/svg',S=2;
 function cv(w,h){var c=document.createElement('canvas');c.width=w;c.height=h;return c;}
 function rn(s){return function(){s=(s*16807)%2147483647;return (s-1)/2147483646;};}
 function mk(t,a,p){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
 // yaprak (220..780 × 110..690)
 var C=cv(560*S,580*S),x=C.getContext('2d'),r=rn(57),i;x.setTransform(S,0,0,S,-220*S,-110*S);
 x.fillStyle=TZ.pattern(x,'paper');x.fillRect(220,110,560,580);
 var g=x.createRadialGradient(500,400,160,500,400,470);g.addColorStop(0,'rgba(170,120,60,0)');g.addColorStop(1,'rgba(150,100,45,.38)');x.fillStyle=g;x.fillRect(220,110,560,580);
 // su izi: alt kısım lekeli, sınırında koyu çizgi
 var st=new Path2D('M220,560 C300,520 380,600 460,560 C540,520 600,640 700,600 L780,600 L780,690 L220,690 Z');x.fillStyle='rgba(170,125,70,.16)';x.fill(st);
 var ln=new Path2D('M220,560 C300,520 380,600 460,560 C540,520 600,640 700,600 L780,590');x.strokeStyle='rgba(140,92,40,.42)';x.lineWidth=2.4;x.stroke(ln);x.strokeStyle='rgba(140,92,40,.14)';x.lineWidth=9;x.stroke(ln);
 for(i=0;i<16;i++){var fx=230+r()*540,fy=120+r()*560,fr=1.5+r()*r()*9,fg=x.createRadialGradient(fx,fy,0,fx,fy,fr);fg.addColorStop(0,'rgba(140,85,40,.45)');fg.addColorStop(1,'rgba(140,85,40,0)');x.fillStyle=fg;x.fillRect(fx-fr,fy-fr,2*fr,2*fr);}
 // cetvel: dışta lâl, içte altın (siyah tahrirli)
 x.strokeStyle='rgba(155,45,32,.85)';x.lineWidth=1.8;x.strokeRect(262,152,476,436);
 x.strokeStyle=TZ.pattern(x,'gold');x.lineWidth=3.4;x.strokeRect(268,158,464,424);x.strokeStyle='rgba(28,20,12,.8)';x.lineWidth=.6;x.strokeRect(266.3,156.3,467.4,427.4);x.strokeRect(269.7,159.7,460.6,420.6);
 // satırlar: sağdan sola, ilk ve yedinci satır kırmızı başlıkla başlar, son satır kısa
 for(var l=0;l<11;l++){var y=200+l*36,R=704-r()*4,L=l===10?520:296,px=R,first=l===0||l===6;
   while(px>L+20){var w=Math.min(px-L,30+r()*70),p=TZ.script(px-w,px,y,20,Math.floor(r()*99999)+1,true);x.fillStyle=first?'rgba(155,38,26,.92)':'rgba(32,22,16,'+(.8+r()*.15)+')';x.fill(p);px=p.left-8-r()*8;first=false;}}
 var url=C.toDataURL('image/jpeg',.9);
 var paper=svg.querySelector('.enter > path');var img=mk('image',{href:url,x:220,y:110,width:560,height:580,preserveAspectRatio:'none','clip-path':'url(#leafClip)'});img.setAttributeNS('http://www.w3.org/1999/xlink','href',url);paper.parentNode.insertBefore(img,paper.nextSibling);
 var old=svg.querySelector('.enter > g[clip-path]');if(old)old.style.display='none';
 // desenler
 var defs=svg.querySelector('defs');
 function patt(id,w,h,draw){var c=cv(w,h),q=c.getContext('2d');draw(q,w,h);var P=mk('pattern',{id:id,width:w/2,height:h/2,patternUnits:'userSpaceOnUse'},defs);var im=mk('image',{href:c.toDataURL('image/png'),width:w/2,height:h/2},P);im.setAttributeNS('http://www.w3.org/1999/xlink','href',c.toDataURL('image/png'));}
 function fibers(q,w,h,n,col,len,lw,seed){var rr=rn(seed);q.lineCap='round';for(var k=0;k<n;k++){var a=rr()*Math.PI,fx=rr()*w,fy=rr()*h,L=len*(.4+rr());q.strokeStyle=col.replace('A',(.2+rr()*.5).toFixed(2));q.lineWidth=lw*(.5+rr());q.beginPath();q.moveTo(fx,fy);q.quadraticCurveTo(fx+Math.cos(a+.7)*L/2,fy+Math.sin(a+.7)*L/2,fx+Math.cos(a)*L,fy+Math.sin(a)*L);q.stroke();}}
 patt('tisP',240,240,function(q,w,h){q.fillStyle='#FBF7EA';q.fillRect(0,0,w,h);fibers(q,w,h,420,'rgba(255,255,255,A)',60,1.4,3);fibers(q,w,h,160,'rgba(205,190,155,A)',40,.8,4);});
 patt('lossP',240,240,function(q,w,h){q.fillStyle='#E9DAB3';q.fillRect(0,0,w,h);fibers(q,w,h,300,'rgba(250,242,220,A)',50,1.2,5);fibers(q,w,h,200,'rgba(170,140,95,A)',30,.8,6);});
 patt('greyP',200,200,function(q,w,h){q.fillStyle='#7F8681';q.fillRect(0,0,w,h);var rr=rn(9);for(var k=0;k<2600;k++){q.fillStyle=rr()<.5?'rgba(50,56,52,.25)':'rgba(200,205,200,.22)';q.fillRect(rr()*w,rr()*h,1+rr()*2,1+rr()*2);}fibers(q,w,h,80,'rgba(60,64,60,A)',24,.8,7);});
 var tg=mk('linearGradient',{id:'tapeG',x1:0,y1:0,x2:1,y2:0},defs);[[0,'#B9862A',.75],[.08,'#D9AE4E',.5],[.5,'#E3BC5E',.45],[.92,'#D3A443',.5],[1,'#A87622',.8]].forEach(function(s){mk('stop',{offset:s[0],'stop-color':s[1],'stop-opacity':s[2]},tg);});
 var t=svg.querySelector('.tissue');if(t){t.setAttribute('fill','url(#tisP)');t.setAttribute('fill-opacity','.78');t.setAttribute('stroke','none');}
 var lf=svg.querySelector('.lossfill');if(lf){lf.setAttribute('fill','url(#lossP)');lf.setAttribute('stroke','#CDB98C');}
 $$('.holefill',svg).forEach(function(h){h.setAttribute('fill','url(#lossP)');});
 var tp=svg.querySelector('.tape');if(tp){tp.setAttribute('fill','url(#tapeG)');tp.setAttribute('fill-opacity','1');tp.setAttribute('stroke','#7A5414');tp.setAttribute('stroke-opacity','.5');}
 // yırtık: lifli, girintili kenar
 var tr=svg.querySelector('.tear');if(tr){var d='M500,110',yy=110,xx=500,rr2=rn(13);while(yy<276){yy+=5+rr2()*6;xx=500+(rr2()-.5)*16+(yy%60<30?-4:4);d+=' L'+xx.toFixed(1)+','+yy.toFixed(1);}tr.setAttribute('d',d);tr.setAttribute('stroke-width','2.2');tr.setAttribute('stroke','#3E2F20');
   var fg2=mk('path',{d:d,fill:'none',stroke:'#FBF3DD','stroke-width':'.8','stroke-dasharray':'2 3','stroke-opacity':'.9',transform:'translate(1.6,0)'});tr.parentNode.insertBefore(fg2,tr.nextSibling);}
 $$('.boxbase rect, .lid > rect',svg).forEach(function(rc,k){if(rc.getAttribute('fill')!=='none'&&rc.getAttribute('fill')!=='#F6F4EF')rc.setAttribute('fill','url(#greyP)');});
})();
/* ---------- Giriş: pencereden süzülen ışık huzmesi ve içinde uçuşan toz ----------
   Huzme piksel piksel hesaplanır: pencere kenarlarının yumuşak gölgesi (penumbra), orta kayıtın gölgesi, havadaki tozun
   oluşturduğu boyuna ışık şeritleri ve yavaşça değişen yoğunluk. Toz zerreleri hava akımıyla süzülür, yalnızca ışığın
   içinde görünür; odak dışındakiler bulanık, döndükçe ışığı yakalayan pullar parıldar. */
(function(){var st=$('#hero3d');if(!st)return;var cv=document.createElement('canvas');cv.className='beam';cv.setAttribute('aria-hidden','true');st.appendChild(cv);
 var x=cv.getContext('2d'),W=0,H=0,geo=null,B1=null,B2=null,IM=null,iw=0,ih=0,P=[],vis=true,raf=0,last=0,mob=false,SP={},T0=performance.now();
 function vn(seed){var a=[];for(var i=0;i<512;i++)a.push(Math.random());return function(v){v=v*1;var i=Math.floor(v),f=v-i,u=f*f*(3-2*f);return a[(i%512+512)%512]*(1-u)+a[((i+1)%512+512)%512]*u;};}
 function sm(a,b,v){var t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);}
 // ortak geometri: huzmenin her yükseklikteki merkezi ve yarı genişliği
 function at(t){return [geo.x0+(geo.x1-geo.x0)*t,geo.w0+(geo.w1-geo.w0)*t];}
 // ışık yoğunluğu haritası (yarım çözünürlük) ve iki şerit katmanı (yavaşça birbirine geçer)
 function build(){var s=mob?.5:.5;iw=Math.max(2,Math.round(W*s));ih=Math.max(2,Math.round(H*s));IM=new Float32Array(iw*ih);
   var n1=vn(),n2=vn(),n3=vn(),n4=vn(),fade=mob?.26:.05;
   function layer(phase){var c=document.createElement('canvas');c.width=iw;c.height=ih;var g=c.getContext('2d'),img=g.createImageData(iw,ih),d=img.data;
     for(var j=0;j<ih;j++){var t=j/ih,a=at(t),cx=a[0]*s,hw=a[1]*s,pen=.18+.5*t;
       for(var i=0;i<iw;i++){var u=(i-cx)/hw,au=Math.abs(u);if(au>1+pen){continue;}
         var edge=sm(1+pen,1-pen*.6,au),
             mul=1-.5*Math.exp(-Math.pow((u+.05)/(.045+.05*t),2)),                                   // pencere kayıtının gölgesi
             str=.62+.28*n1(u*7+phase*3)+.18*n2(u*26-phase*5)+.1*n3(u*61),                            // boyuna ışık şeritleri
             haze=.78+.22*n4(u*2.2+t*3.4+phase*2),                                                   // havadaki toz yoğunluğu
             along=(.55+.45*(1-t))*sm(0,fade,t)*(1-.35*sm(.75,1,t)),
             I=edge*mul*str*haze*along,k=(j*iw+i)*4;
         d[k]=255;d[k+1]=Math.round(232+10*(1-t));d[k+2]=Math.round(192+18*(1-t));d[k+3]=Math.min(255,Math.round(255*I*(mob?.44:.4)));
         if(!phase)IM[j*iw+i]=I;}}
     g.putImageData(img,0,0);return c;}
   B1=layer(0);B2=layer(.37);}
 function inten(px,py){var i=Math.round(px*iw/W),j=Math.round(py*ih/H);if(i<0||j<0||i>=iw||j>=ih)return 0;return IM[j*iw+i];}
 // zerre görüntüleri: keskin nokta, yumuşak bulanık disk (kenarı hafif parlak), ince lif
 function spr(){if(SP.a)return;function mk(f){var c=document.createElement('canvas');c.width=c.height=64;f(c.getContext('2d'));return c;}
   SP.a=mk(function(c){var g=c.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,248,226,1)');g.addColorStop(.12,'rgba(255,244,214,.9)');g.addColorStop(.3,'rgba(255,236,196,.25)');g.addColorStop(1,'rgba(255,230,190,0)');c.fillStyle=g;c.fillRect(0,0,64,64);});
   SP.b=mk(function(c){var g=c.createRadialGradient(32,32,0,32,32,30);g.addColorStop(0,'rgba(255,240,205,.32)');g.addColorStop(.78,'rgba(255,240,205,.42)');g.addColorStop(.9,'rgba(255,244,215,.55)');g.addColorStop(1,'rgba(255,240,205,0)');c.fillStyle=g;c.beginPath();c.arc(32,32,30,0,7);c.fill();});
   SP.f=mk(function(c){c.strokeStyle='rgba(255,246,222,.9)';c.lineWidth=1.4;c.lineCap='round';c.beginPath();c.moveTo(14,36);c.bezierCurveTo(24,22,38,44,50,28);c.stroke();});}
 function spawn(any){var t=Math.random(),a=at(t),z=Math.random(),r=Math.random();
   return {x:a[0]+(Math.random()*2-1)*a[1]*1.1,y:any?t*H:-10-Math.random()*40,z:z,s:.5+Math.random()*1.3,fib:r<.05,flake:r<.4,rot:Math.random()*6,wr:(Math.random()-.5)*3,ph:Math.random()*100};}
 function seed(){var n=mob?90:230;P=[];for(var i=0;i<n;i++)P.push(spawn(true));}
 function size(){W=st.clientWidth;H=st.clientHeight;if(!W||!H)return;cv.width=W;cv.height=H;mob=W<980;
   geo=mob?{x0:.28*W,x1:.55*W,w0:.075*W,w1:.21*W}:{x0:.55*W,x1:.75*W,w0:.05*W,w1:.13*W};build();spr();seed();draw(0);}
 // hava akımı: yavaş, girdaplı (iki katmanlı sinüs alanı); sıcak hava hafifçe yükselir
 function flow(px,py,tm){var k1=.006,k2=.011;return [9*Math.sin(py*k1+tm*.21)+5*Math.sin((px+py)*k2-tm*.33),-2.5+6*Math.cos(px*k1*1.3-tm*.17)+3*Math.sin(py*k2*1.7+tm*.29)];}
 function draw(dt){if(!geo)return;var tm=(performance.now()-T0)/1000;x.clearRect(0,0,W,H);
   // huzme: iki şerit katmanı yavaşça yer değiştirir, bulut geçer gibi yoğunluk hafifçe dalgalanır
   var br=.88+.12*Math.sin(tm*.13)*Math.sin(tm*.071+1),mix=.5+.5*Math.sin(tm*.09);
   x.globalAlpha=br*(1-mix*.6);x.drawImage(B1,0,0,W,H);x.globalAlpha=br*mix*.6;x.drawImage(B2,0,0,W,H);x.globalAlpha=1;
   P.forEach(function(p,i){var f=flow(p.x,p.y,tm),dep=.45+p.z*.9;p.x+=(f[0]+Math.sin(tm*1.3+p.ph)*1.5)*dt*dep;p.y+=(f[1]+3)*dt*dep;p.rot+=p.wr*dt;
     if(p.y>H+20||p.x<-40||p.x>W+40){P[i]=spawn(false);return;}
     var I=inten(p.x,p.y);if(I<.03)return;
     var blur=Math.abs(p.z-.5)*2,near=p.z>.5,sz=(near?2.2+blur*9:1.6+blur*3)*p.s,al=I*(near&&blur>.35?.35:.95)*(1-blur*.45);
     if(p.flake)al*=.35+.65*Math.pow(Math.abs(Math.sin(p.rot)),6);                       // dönen pul ışığı yakaladıkça parlar
     al*=.8+.2*Math.sin(tm*2.3+p.ph);if(al<.02)return;x.globalAlpha=Math.min(1,al);
     if(p.fib&&blur<.4){x.save();x.translate(p.x,p.y);x.rotate(p.rot);x.drawImage(SP.f,-10*p.s,-10*p.s,20*p.s,20*p.s);x.restore();}
     else if(blur>.35){x.drawImage(SP.b,p.x-sz,p.y-sz,sz*2,sz*2);}
     else{var s2=sz*3.2;x.drawImage(SP.a,p.x-s2/2,p.y-s2/2,s2,s2);}});
   x.globalAlpha=1;}
 function loop(t){raf=0;if(!vis)return;var dt=Math.min(.05,(t-last)/1000||0);last=t;draw(dt);raf=requestAnimationFrame(loop);}
 if('ResizeObserver' in window)new ResizeObserver(size).observe(st);else addEventListener('resize',size);size();
 if(!reduce){if('IntersectionObserver' in window)new IntersectionObserver(function(es){vis=es[0].isIntersecting;if(vis&&!raf){last=performance.now();raf=requestAnimationFrame(loop);}}).observe(st);else{raf=requestAnimationFrame(loop);}}
})();
})();
