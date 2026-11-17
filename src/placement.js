// Put each new item in the middle of the largest free angular interval.
// Existing manually positioned items remain where the player placed them.
// Different tracks (elements on the ring, runes outside) are independent.
export function nextFreeAngle(angles){
 const occupied=angles.filter(Number.isFinite).map(a=>((a%360)+360)%360).sort((a,b)=>a-b);
 if(occupied.length===0)return 0;
 if(occupied.length===1)return (occupied[0]+180)%360;
 let bestStart=occupied[0],bestGap=-1;
 for(let i=0;i<occupied.length;i++){
  const start=occupied[i],end=i===occupied.length-1?occupied[0]+360:occupied[i+1];
  const gap=end-start;
  if(gap>bestGap+1e-9){bestGap=gap;bestStart=start}
 }
 return (bestStart+bestGap/2)%360;
}
export function nextPlacementAngle(spell,ringId,kind,side='after'){
 const items=kind==='element'?spell.elements:kind==='rune'?spell.runes.filter(r=>r.side===side):kind==='card'?(spell.cards||[]):[];
 return nextFreeAngle(items.filter(item=>item.ringId===ringId).map(item=>item.angle));
}
