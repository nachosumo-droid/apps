// NachoSumoSoft: tema claro/oscuro + animaciones suaves de entrada. No toca precios ni botones (ver sitio.js).
(()=>{const d=document.documentElement,b=document.querySelector(".tema");
 const set=t=>{d.dataset.tema=t;try{localStorage.setItem("tema",t)}catch(e){}if(b){b.textContent=t==="claro"?"☾":"☀";b.setAttribute("aria-label",t==="claro"?"Cambiar a tema oscuro":"Cambiar a tema claro")}};
 set(d.dataset.tema||"oscuro");b&&b.addEventListener("click",()=>set(d.dataset.tema==="claro"?"oscuro":"claro"));
 const els=document.querySelectorAll(".card,.conf,.pasos li,.shots,.cols,.app-top,.doc,.sec-t");
 if(!("IntersectionObserver"in window))return;d.classList.add("js");
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("vis");io.unobserve(e.target)}}),{rootMargin:"0px 0px -8% 0px"});
 els.forEach((el,i)=>{el.classList.add("rv");el.style.transitionDelay=(i%4)*60+"ms";io.observe(el)});
})();
