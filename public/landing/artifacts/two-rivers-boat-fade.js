const smooth=(start,end,value)=>{
  const t=Math.max(0,Math.min(1,(value-start)/(end-start)));
  return t*t*(3-2*t);
};

// The 40-second route fades in over 3 seconds, then fades out over its last
// 5 seconds. A short invisible interval hides the move back to the entrance.
export function boatOpacity(phase) {
  return smooth(0,.075,phase)*(1-smooth(.86,.985,phase));
}

export function prepareBoatFade(group) {
  const materials=new Map(),parts=[];
  group.traverse(part=>{
    if(!part.isMesh)return;
    const clone=source=>{
      if(!materials.has(source)){
        const target=source.clone();target.transparent=true;
        materials.set(source,target);
      }
      return materials.get(source);
    };
    part.material=Array.isArray(part.material)?part.material.map(clone):clone(part.material);
    parts.push(part);
  });
  return {
    setOpacity(opacity){
      group.visible=opacity>0;
      for(const target of materials.values()){
        target.opacity=opacity;
        target.depthWrite=opacity>=1;
      }
      // A transparent boat must not leave an opaque shadow at the river exit.
      for(const part of parts)part.castShadow=opacity>=1;
    },
    syncTheme(){
      for(const [source,target] of materials){
        target.color?.copy(source.color);
        target.emissive?.copy(source.emissive);
        if('emissiveIntensity' in source)target.emissiveIntensity=source.emissiveIntensity;
      }
    }
  };
}
