// Prevent electric border color animations at runtime
(function(){
  function fixBorders(){
    const fixed = '#1a0097';
    document.querySelectorAll('.electric-border').forEach(el=>{
      try{
        el.style.setProperty('--electric-border-color', fixed, 'important');
      }catch(e){}

      // remove SVG <animate> elements inside the electric border SVGs
      el.querySelectorAll('svg defs animate, svg defs [elementName="animate"]').forEach(a=>{
        try{ a.remove(); }catch(e){}
      });

      // observe inline style changes and re-apply the fixed color
      const mo = new MutationObserver(muts=>{
        for(const m of muts){
          if(m.type==='attributes' && m.attributeName==='style'){
            try{ el.style.setProperty('--electric-border-color', fixed, 'important'); }catch(e){}
          }
        }
      });
      mo.observe(el, { attributes: true, attributeFilter: ['style'] });
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fixBorders);else fixBorders();

  // Also apply globally to root for any missed elements
  try{ document.documentElement.style.setProperty('--electric-border-color','#1a0097'); }catch(e){}
})();
