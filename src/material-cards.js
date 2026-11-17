// Thirty experimental material ink templates, not predefined or interpreter-guaranteed substances.
// Each embeds only existing v37 elemental signatures, a ring shape and a provisional rune.
// Its name is search/display metadata; only the final composited ink can determine an effect.
const definitions=[["rock","Rock",[14,8,20,13],"Squared","B","Mineral aggregate"],["dirt","Dirt",[14,8,6,20],"Inward-mark","J","Loose soil mixture"],["sand","Sand",[14,8,8],"Sieve","S","Silica-rich grains"],["gravel","Gravel",[14,8,20],"Toothed","S","Coarse mineral fragments"],["clay","Clay",[14,8,13,1],"Braided","B","Aluminosilicate mineral"],["granite","Granite",[14,8,13,19],"Lattice","B","Granite-like silicate mixture"],["basalt","Basalt",[14,8,26,12],"Squared","B","Iron-rich volcanic rock"],["limestone","Limestone",[20,6,8,8],"Linked-circle","B","Calcium-carbonate material"],["marble","Marble",[20,6,8,8],"Double","F","Dense calcium carbonate"],["obsidian","Obsidian",[14,8,26],"Smooth","H","Volcanic glass-like silicate"],["quartz","Quartz",[14,8,8],"Prism","F","Crystalline silicon dioxide"],["glass","Glass",[14,8,11,20],"Smooth","B","Silica-based glass"],["salt","Salt",[11,17],"Lattice","B","Sodium chloride"],["coal","Coal",[6,6,16],"Reservoir","H","Carbon-rich fuel"],["charcoal","Charcoal",[6,6,8],"Sieve","H","Carbon-rich porous solid"],["iron","Iron",[26],"Double","B","Metallic iron"],["copper","Copper",[29],"Double","B","Metallic copper"],["gold","Gold",[79],"Double","B","Metallic gold"],["silver","Silver",[47],"Double","B","Metallic silver"],["aluminium","Aluminium",[13],"Double","B","Metallic aluminium"],["tin","Tin",[50],"Double","B","Metallic tin"],["lead","Lead",[82],"Squared","B","Metallic lead"],["titanium","Titanium",[22],"Double","B","Metallic titanium"],["nickel","Nickel",[28],"Double","B","Metallic nickel"],["zinc","Zinc",[30],"Double","B","Metallic zinc"],["steel","Steel",[26,6,26],"Lattice","J","Iron-carbon alloy motif"],["bronze","Bronze",[29,50,29],"Lattice","J","Copper-tin alloy motif"],["brass","Brass",[29,30,29],"Lattice","J","Copper-zinc alloy motif"],["concrete","Concrete",[20,14,8,6],"Linked-circle","J","Cementitious composite motif"],["brick","Brick",[14,13,8,26],"Squared","H","Fired-clay masonry motif"]];
export const MATERIAL_CARDS=definitions.map(([id,name,atoms,pattern,rune,description])=>({
 id:'material-'+id,
 name,
 kind:'material',
 category:atoms.length===1?'Elemental metal': 'Composite material',
 ingredients:atoms.map(String),
 description:'Experimental '+description+' drawing. Material synthesis and properties are not verified by the current interpreter.',
 source:{
  center:{id:atoms[0],scale:1},
  rings:[{id:1,radius:84,pattern}],
  elements:atoms.slice(1).map((elementId,i,rest)=>({
   id:i+1,elementId,ringId:1,angle:(i*360/rest.length)%360,scale:.8,rotation:0
  })),
  runes:[{id:1,letter:rune,ringId:1,angle:45,side:'after'}],
  amps:[],strokes:[],cards:[]
 }
}));
