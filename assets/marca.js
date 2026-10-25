// SumoSoft: tema claro/oscuro + animaciones suaves de entrada. No toca precios ni botones (ver sitio.js).
(()=>{const d=document.documentElement,b=document.querySelector(".tema");
 const set=t=>{d.dataset.tema=t;try{localStorage.setItem("tema",t)}catch(e){}if(b){b.textContent=t==="claro"?"☾":"☀";b.setAttribute("aria-label",t==="claro"?"Cambiar a tema oscuro":"Cambiar a tema claro")}};
 set(d.dataset.tema||"oscuro");b&&b.addEventListener("click",()=>set(d.dataset.tema==="claro"?"oscuro":"claro"));
 const els=document.querySelectorAll(".card,.conf,.pasos li,.shots,.cols,.app-top,.doc,.sec-t");
 if(!("IntersectionObserver"in window))return;d.classList.add("js");
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("vis");io.unobserve(e.target)}}),{rootMargin:"0px 0px -8% 0px"});
 els.forEach((el,i)=>{el.classList.add("rv");el.style.transitionDelay=(i%4)*60+"ms";io.observe(el)});
})();
// Hero: intro "de estudio de cine". Íconos desenfocados detrás del logo → enfocan y orbitan
// (pasan por delante y por detrás) → vuelven a dispersarse y desenfocarse. Loop continuo.
(()=>{const box=document.querySelector(".hero-arte");if(!box)return;
 const sats=[...box.querySelectorAll(".sat")],svg=box.querySelector(".orbitas"),N=sats.length;if(!N)return;
 // 3 órbitas elípticas inclinadas: [radio x (fracción del ancho), achatamiento, giro°, velocidad]
 const R=[[.33,.58,-18,1],[.42,.46,14,-.8],[.5,.36,-5,.62]],per=[5,5,6],ring=[],ph=[];
 let k=0;per.forEach((n,r)=>{for(let j=0;j<n&&k<N;j++,k++){ring.push(r);ph.push(j/n*2*Math.PI+r*.7)}});while(k<N){ring.push(2);ph.push(k);k++}
 svg.innerHTML=R.map(([rx,f,g])=>`<ellipse cx="0" cy="0" rx="${rx*100}" ry="${rx*f*100}" transform="rotate(${g})"/>`).join("");
 // dispersión inicial/final: detrás del logo, en un anillo irregular (determinista)
 const sc=sats.map((_,i)=>{const a=i*2.399+.4,d=.20+.17*((i*7)%5)/4;return[Math.cos(a)*d,Math.sin(a)*d*.9]});
 const T=12000,ez=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2,cl=x=>Math.max(0,Math.min(1,x));
 let W=box.clientWidth;new ResizeObserver(()=>W=box.clientWidth).observe(box);
 const rm=matchMedia("(prefers-reduced-motion: reduce)");
 function frame(ms){const t=(ms%T)/T;
  // w: 0 = disperso/desenfocado, 1 = en órbita/enfocado
  const w=rm.matches?1:ez(cl((t-.06)/.2))*(1-ez(cl((t-.78)/.18)));
  const spin=rm.matches?0:ms/1000*.55; // rad/s
  svg.style.opacity=(w*.9).toFixed(3);
  for(let i=0;i<N;i++){const [rx,f,g,v]=R[ring[i]],a=ph[i]+spin*v,G=g*Math.PI/180;
   const ox=Math.cos(a)*rx,oy=Math.sin(a)*rx*f,X=ox*Math.cos(G)-oy*Math.sin(G),Y=ox*Math.sin(G)+oy*Math.cos(G);
   const dep=Math.sin(a); // +1 delante (abajo de la elipse), -1 detrás
   const x=(sc[i][0]+(X-sc[i][0])*w)*W,y=(sc[i][1]+(Y-sc[i][1])*w)*W;
   const s=(.82)*(1-w)+(.92+.3*dep)*w, b=(.75)*(1-w)+(1+.15*dep)*w-(dep<0?.25*-dep*w:0);
   const st=sats[i].style;st.transform=`translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${s.toFixed(3)})`;
   st.opacity=(.35+.65*w*(dep<0?1-.35*-dep:1)).toFixed(3);
   st.zIndex=w>.5&&dep>0?30:5;
   const bl=(1-w)*7+(w>.5&&dep<-.3?(-dep-.3)*1.2*w:0);
   st.filter=`blur(${bl.toFixed(2)}px) brightness(${b.toFixed(3)})`}
  if(!rm.matches)requestAnimationFrame(frame)}
 requestAnimationFrame(frame);rm.addEventListener?.("change",()=>requestAnimationFrame(frame));
 window.__heroFrame=frame;
})();
