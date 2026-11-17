// Keep single-click replacement distinct from double-click insertion.
// Delay only card catalogue single clicks until the browser's double-click window ends.
// Injected scheduler permits deterministic regression tests without a browser.
export function createCardClickController(onReplace,onAdd,{schedule=setTimeout,cancel=clearTimeout,delay=260}={}){
 let pending=null;
 const stop=()=>{if(pending!==null){cancel(pending);pending=null}};
 return {
  click(card,event={}){
   if(event.detail>=2)return;
   if(event.shiftKey){stop();onAdd(card);return}
   stop();
   pending=schedule(()=>{pending=null;onReplace(card)},delay);
  },
  doubleClick(card){stop();onAdd(card)},
  cancel:stop
 };
}
