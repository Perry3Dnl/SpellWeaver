// Experimental ink compositions: names indicate design goals, not proven magical outcomes.
const source=(center,ingredients,ring='Smooth',rune='F')=>({
 center:{id:center,scale:.75},rings:[{id:1,radius:84,pattern:ring}],
 elements:ingredients.map((elementId,i)=>({id:i+1,elementId,ringId:1,angle:i*360/ingredients.length,scale:.72,rotation:0})),
 runes:rune?[{id:1,letter:rune,ringId:1,angle:45,side:'after'}]:[],
 amps:[],strokes:[],cards:[]
});
// Keep the Water study inscription rotationally balanced: the Oxygen center is
// already the oxygen component, while Hydrogen and Bind occupy opposite pairs.
function balancedWater(){
 const pattern=source(8,[1,1],'Wavy',null);
 pattern.elements[0].angle=90;
 pattern.elements[1].angle=270;
 pattern.elements[1].rotation=180;
 pattern.runes=[
  {id:1,letter:'B',ringId:1,angle:0,side:'after'},
  {id:2,letter:'B',ringId:1,angle:180,side:'after',rotation:180}
 ];
 return pattern;
}
export const STARTER_CARDS=[
 {id:'fire',name:'Fire',ingredients:['Carbon','Oxygen','Focus'],description:'Experimental fuel and oxygen pattern; ignition behavior not yet confirmed.',source:source(6,[8,8,6],'Burst-mark','F')},
 {id:'water',name:'Water',ingredients:['Hydrogen','Oxygen','Bind'],description:'Experimental hydrogen–oxygen water motif; chemical synthesis is not yet a magic rule.',source:balancedWater()},
 {id:'ice',name:'Ice',ingredients:['Hydrogen','Oxygen','Hold'],description:'Experimental water constituents in a containment pattern; cooling behavior unverified.',source:source(8,[1,1,8],'Squared','H')},
 {id:'lava',name:'Lava',ingredients:['Silicon','Oxygen','Carbon'],description:'Experimental silicate and heat-theme composition, not a guaranteed lava spell.',source:source(14,[8,8,6],'Burst-mark','F')},
 {id:'steam',name:'Steam',ingredients:['Hydrogen','Oxygen','Expand'],description:'Experimental volatile water expression; no confirmed steam reaction yet.',source:source(8,[1,1,8],'Wavy','E')},
 {id:'wind',name:'Wind',ingredients:['Nitrogen','Oxygen','Redirect'],description:'Experimental atmospheric-gas flow motif; no guaranteed wind behavior.',source:source(7,[8,7],'Chevron','R')}
];
