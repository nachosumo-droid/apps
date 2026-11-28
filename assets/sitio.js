// Precios y botón Comprar: todo sale de config/precios.json (fuente única).
(async()=>{
 const raiz=document.documentElement.dataset.raiz||".";
 const aviso=(t)=>{const m=document.getElementById("msg-compra");if(!m)return;m.hidden=false;m.textContent=t;try{m.scrollIntoView({block:"nearest",behavior:"smooth"})}catch(e){}};
 const devId=pkg=>{
  const k="ss_dev:"+pkg;
  try{const g=localStorage.getItem(k);if(g&&/^[a-f0-9]{32,64}$/.test(g))return g}catch(e){}
  const b=crypto.getRandomValues(new Uint8Array(16));
  const id=[...b].map(x=>x.toString(16).padStart(2,"0")).join("");
  try{localStorage.setItem(k,id)}catch(e){}
  return id;
 };
 let cfg; try{cfg=await (await fetch(raiz+"/config/precios.json",{cache:"no-cache"})).json()}catch(e){
  for(const b of document.querySelectorAll("[data-comprar]")) b.addEventListener("click",ev=>{ev.preventDefault();aviso("No se pudieron cargar los datos de compra. Recargá la página y probá de nuevo.")});
  return;
 }
 const fmt=n=>"$ "+Number(n).toLocaleString("es-AR")+" ARS";
 for(const el of document.querySelectorAll("[data-precio]")){const a=cfg.apps.find(x=>x.id===el.dataset.precio);if(a)el.innerHTML=fmt(a.precioARS)+' <small>pago único</small>'}
 for(const el of document.querySelectorAll("[data-descarga]")){const a=cfg.apps.find(x=>x.id===el.dataset.descarga);if(a&&a.descarga){el.href=a.descarga;el.removeAttribute("aria-disabled");if(!el.querySelector(".btn-sub")){const t=(el.querySelector(".btn-txt")?el.querySelector(".btn-txt").textContent:el.textContent).trim()||"⬇ Descargar";el.classList.add("btn-prueba");el.innerHTML='<span class="btn-txt">'+t+'</span><span class="btn-sub">Prueba gratis de 7 días · después comprás si te gusta</span>'}}}
 if(cfg.contacto&&cfg.contacto.email)for(const el of document.querySelectorAll("[data-email]")){el.href="mailto:"+cfg.contacto.email;el.textContent=cfg.contacto.email;el.parentElement.hidden=false}
 if(/gracias\.html$/.test(location.pathname.replace(/\/+$/,""))){
  const q=new URLSearchParams(location.search);
  const ok=/^(approved|success)$/i.test(q.get("status")||"")||/^(approved|success)$/i.test(q.get("collection_status")||"");
  let c=null; try{c=JSON.parse(localStorage.getItem("ss_checkout")||"null")}catch(e){}
  const ext=(q.get("external_reference")||"").split("|");
  const pkg=(c&&c.app)||ext[0]||"";
  const dev=(c&&c.device_id)||(/^[a-f0-9]{32,64}$/.test(ext[1]||"")?ext[1]:"");
  const a=(c&&c.id&&cfg.apps.find(x=>x.id===c.id))||(pkg&&cfg.apps.find(x=>(x.paquetes||[]).includes(pkg)));
  const btn=document.getElementById("descarga-compra");
  if(btn){
   if(a&&a.descarga){btn.href=a.descarga;btn.setAttribute("download","");btn.hidden=false;btn.textContent="⬇ Descargar "+a.nombre}
   else{btn.href="index.html#apps";btn.hidden=false;btn.textContent="⬇ Ir a las apps para descargar";btn.removeAttribute("download")}
  }
  const mostrar=cod=>{
   const p=document.getElementById("codigo-compra");
   if(!p||!cod)return;
   p.hidden=false;p.textContent="";
   p.append("Tu código de compra es ");
   const b=document.createElement("b");b.textContent=cod;p.append(b);
   p.append(". Ingresalo en la app, en «Activar».");
  };
  const srv=(cfg.servidorLicencias||"").replace(/\/$/,"");
  if(pkg&&dev&&srv&&ok){
   let n=0;
   const tick=async()=>{
    n++;
    try{
     const r=await fetch(srv+"/api/licencia",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({app:pkg,device_id:dev})});
     const d=await r.json();
     if(d&&d.encontrada&&d.codigo){clearInterval(t);mostrar(d.codigo);return}
    }catch(e){}
    if(n>=15)clearInterval(t);
   };
   const t=setInterval(tick,2000);tick();
  }
 }
 for(const b of document.querySelectorAll("[data-comprar]")){
  b.addEventListener("click",async ev=>{
   ev.preventDefault();
   if(b.dataset.busy)return;
   const a=cfg.apps.find(x=>x.id===b.dataset.comprar);
   if(!(cfg.ventasActivas&&a&&a.venta)){aviso("Esta app todavía no está a la venta. Muy pronto vas a poder probarla y comprarla desde acá.");return}
   const pkgs=a.paquetes||[];
   const pkg=pkgs.find(p=>/\.web$/.test(p))||pkgs[0];
   const srv=(cfg.servidorLicencias||"").replace(/\/$/,"");
   const dev=pkg&&devId(pkg);
   if(!pkg||!srv||!dev){aviso("No se pudo iniciar el pago. Probá de nuevo o comprá desde la app en «Activar».");return}
   b.dataset.busy="1";
   aviso("Abriendo Mercado Pago…");
   try{
    let canal="";
    try{const g=JSON.parse(localStorage.getItem("ss_ref")||"null");if(g&&g.r)canal=g.r}catch(e){}
    try{localStorage.setItem("ss_checkout",JSON.stringify({app:pkg,device_id:dev,id:a.id,t:Date.now()}))}catch(e){}
    const r=await fetch(srv+"/api/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(canal?{app:pkg,device_id:dev,ref:canal}:{app:pkg,device_id:dev})});
    const d=await r.json().catch(()=>({}));
    if(r.ok&&d.init_point){location.href=d.init_point;return}
    aviso(d.mensaje||"No se pudo abrir Mercado Pago. Probá de nuevo o comprá desde la app en «Activar».");
   }catch(e){aviso("No se pudo abrir Mercado Pago. Revisá la conexión y probá de nuevo.")}
   finally{delete b.dataset.busy}
  });
 }
})();
// Visor de capturas ampliadas (lightbox) — imágenes HD, Esc/flechas/deslizar, accesible
(()=>{const ls=[...document.querySelectorAll("a.lb")];if(!ls.length)return;
 const d=document.createElement("div");d.className="lbx";d.hidden=true;d.setAttribute("role","dialog");d.setAttribute("aria-modal","true");d.setAttribute("aria-label","Captura ampliada");
 d.innerHTML='<img alt=""><button class="x" aria-label="Cerrar">×</button><button class="pv" aria-label="Anterior">‹</button><button class="nx" aria-label="Siguiente">›</button><div class="ct" aria-live="polite"></div>';
 document.body.appendChild(d);const im=d.querySelector("img"),ct=d.querySelector(".ct");let i=0,ant=null,x0=null;
 const ver=n=>{i=(n+ls.length)%ls.length;im.src=ls[i].href;im.alt=ls[i].querySelector("img").alt.replace(" (tocá para ampliar)","");const cp=ls[i].querySelector(".cap");ct.textContent=(cp?cp.textContent+" · ":"")+(i+1)+" / "+ls.length};
 const abrir=n=>{ant=document.activeElement;ver(n);d.hidden=false;document.body.style.overflow="hidden";d.querySelector(".x").focus()};
 const cerrar=()=>{d.hidden=true;im.src="";document.body.style.overflow="";ant&&ant.focus()};
 ls.forEach((a,n)=>a.addEventListener("click",e=>{e.preventDefault();abrir(n)}));
 d.querySelector(".x").onclick=cerrar;d.querySelector(".pv").onclick=()=>ver(i-1);d.querySelector(".nx").onclick=()=>ver(i+1);
 d.addEventListener("click",e=>{if(e.target===d)cerrar()});
 document.addEventListener("keydown",e=>{if(d.hidden)return;if(e.key==="Escape")cerrar();else if(e.key==="ArrowLeft")ver(i-1);else if(e.key==="ArrowRight")ver(i+1);
  else if(e.key==="Tab"){const b=[...d.querySelectorAll("button")],k=b.indexOf(document.activeElement);e.preventDefault();b[(k+(e.shiftKey?-1:1)+b.length)%b.length].focus()}});
 d.addEventListener("touchstart",e=>{x0=e.touches.length===1?e.touches[0].clientX:null},{passive:true});
 d.addEventListener("touchend",e=>{if(x0===null||(window.visualViewport&&visualViewport.scale>1.05))return;const dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>50)ver(i+(dx<0?1:-1));x0=null});
})();
// Contadores anónimos y sin cookies (sólo totales diarios por página/botón en el servidor de licencias).
(()=>{
 if(location.protocol!=="https:")return;
 const ep="https://licencias-apps.nachosumo.workers.dev/api/evento";
 // Canal de origen (?ref=x, fb, ig, wa, li…): se guarda en este navegador (localStorage, sin cookies) 30 días, sólo el nombre del canal.
 let ref="";
 try{
  const q=(new URLSearchParams(location.search).get("ref")||"").toLowerCase();
  const ok=/^[a-z0-9_-]{1,32}$/.test(q);
  const g=JSON.parse(localStorage.getItem("ss_ref")||"null");
  if(g&&g.r&&Date.now()-g.t<2592e6)ref=g.r;
  else if(ok){ref=q;localStorage.setItem("ss_ref",JSON.stringify({r:q,t:Date.now()}))}
  if(ok)sessionStorage.setItem("ss_ref_ses",q);
 }catch(e){}
 const enviar=(evento,app)=>{
  if(!app||!/^[a-z0-9_-]{1,48}$/.test(app))return;
  const body=JSON.stringify(ref?{evento,app,ref}:{evento,app});
  if(navigator.sendBeacon){try{if(navigator.sendBeacon(ep,new Blob([body],{type:"text/plain"})))return}catch(e){}}
  fetch(ep,{method:"POST",headers:{"Content-Type":"text/plain"},body,keepalive:true,mode:"cors"}).catch(()=>{});
 };
 const p=location.pathname.replace(/\/+$/,"");
 let pag="home";
 const m=p.match(/\/apps\/([a-z0-9-]+)\.html$/);
 if(m)pag=m[1];
 else{const d=p.match(/\/([a-z0-9-]+)\.html$/);if(d&&d[1]!=="index")pag=d[1];}
 enviar("vista",pag);
 document.addEventListener("click",e=>{
  const c=e.target.closest("[data-comprar]");
  if(c){enviar("clic_comprar",c.dataset.comprar);return}
  const d=e.target.closest("[data-descarga], .descargas a[href], a[download][href]");
  if(d){const id=d.dataset.descarga||(m?m[1]:"");if(id)enviar("clic_probar",id);return}
 },{passive:true});
})();
