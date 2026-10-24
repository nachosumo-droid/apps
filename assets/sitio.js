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
   m.hidden=false;m.textContent=cfg.ventasActivas
    ?"Para comprar: instalá la prueba gratis, abrí la app y elegí «Activar» → «Comprar con Mercado Pago». La licencia queda atada a tu equipo y se activa sola al pagar."
    :"Las compras todavía no están habilitadas. Muy pronto vas a poder pagar con Mercado Pago desde la app. Mientras tanto, probala gratis."})}
})();
