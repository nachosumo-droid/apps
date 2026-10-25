// Precios y botón Comprar: todo sale de config/precios.json (fuente única).
(async()=>{
 const raiz=document.documentElement.dataset.raiz||".";
 let cfg; try{cfg=await (await fetch(raiz+"/config/precios.json",{cache:"no-cache"})).json()}catch(e){return}
 const fmt=n=>"$ "+Number(n).toLocaleString("es-AR")+" ARS";
 for(const el of document.querySelectorAll("[data-precio]")){const a=cfg.apps.find(x=>x.id===el.dataset.precio);if(a)el.innerHTML=fmt(a.precioARS)+' <small>pago único · provisorio</small>'}
 for(const el of document.querySelectorAll("[data-descarga]")){const a=cfg.apps.find(x=>x.id===el.dataset.descarga);if(a&&a.descarga){el.href=a.descarga;el.removeAttribute("aria-disabled");el.textContent="⬇ Descargar prueba gratis (7 días)"}}
 if(cfg.contacto&&cfg.contacto.email)for(const el of document.querySelectorAll("[data-email]")){el.href="mailto:"+cfg.contacto.email;el.textContent=cfg.contacto.email;el.parentElement.hidden=false}
 for(const b of document.querySelectorAll("[data-comprar]")){
  b.addEventListener("click",e=>{e.preventDefault();const m=document.getElementById("msg-compra");
   const a=cfg.apps.find(x=>x.id===b.dataset.comprar);
   m.hidden=false;m.textContent=(cfg.ventasActivas&&a&&a.venta)
    ?"Para comprar: instalá la prueba gratis, abrí la app y elegí «Activar» → «Comprar con Mercado Pago». La licencia queda atada a tu equipo y se activa sola al pagar."
    :"Esta app todavía no está a la venta. Muy pronto vas a poder probarla y comprarla desde acá."})}
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
