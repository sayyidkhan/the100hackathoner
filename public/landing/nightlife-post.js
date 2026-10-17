// Small, local HDR glow pass for architectural practical lights. No remote assets.
// Allocated only for a nightlife exhibit; all targets are released with the viewer.
export function createNightlifePost(T,renderer){
  const scene=new T.Scene(),camera=new T.OrthographicCamera(-1,1,1,-1,0,1);
  const geometry=new T.PlaneGeometry(2,2),quad=new T.Mesh(geometry);scene.add(quad);
  const options={type:T.HalfFloatType,minFilter:T.LinearFilter,magFilter:T.LinearFilter,depthBuffer:false};
  const source=new T.WebGLRenderTarget(1,1,{...options,depthBuffer:true,samples:4});
  const bright=new T.WebGLRenderTarget(1,1,options),horizontal=bright.clone(),vertical=bright.clone();
  const vertexShader='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
  const make=(uniforms,fragmentShader)=>new T.ShaderMaterial({uniforms,vertexShader,fragmentShader,depthTest:false,depthWrite:false});
  const threshold=make({map:{value:source.texture}},`varying vec2 vUv;uniform sampler2D map;void main(){vec3 c=texture2D(map,vUv).rgb;float l=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c*smoothstep(1.3,2.5,l),1.);}`);
  const blur=make({map:{value:null},stepSize:{value:new T.Vector2()}},`varying vec2 vUv;uniform sampler2D map;uniform vec2 stepSize;void main(){vec3 c=texture2D(map,vUv).rgb*.227027;for(int i=1;i<5;i++){float weight=i==1?.1945946:i==2?.1216216:i==3?.054054:.016216;vec2 d=stepSize*float(i);c+=(texture2D(map,vUv+d).rgb+texture2D(map,vUv-d).rgb)*weight;}gl_FragColor=vec4(c,1.);}`);
  const composite=make({map:{value:source.texture},glow:{value:vertical.texture}},`varying vec2 vUv;uniform sampler2D map;uniform sampler2D glow;void main(){gl_FragColor=vec4(texture2D(map,vUv).rgb+texture2D(glow,vUv).rgb*.18,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`);
  threshold.toneMapped=blur.toneMapped=false;
  const size=new T.Vector2();let width=0,height=0;
  function pass(target,material){quad.material=material;renderer.setRenderTarget(target);renderer.render(scene,camera);}
  return {
    render(world,view){
      renderer.getDrawingBufferSize(size);
      if(size.x!==width||size.y!==height){width=size.x;height=size.y;source.setSize(width,height);for(const t of [bright,horizontal,vertical])t.setSize(Math.ceil(width/2),Math.ceil(height/2));}
      const previous=renderer.getRenderTarget();
      renderer.setRenderTarget(source);renderer.render(world,view);
      pass(bright,threshold);blur.uniforms.map.value=bright.texture;blur.uniforms.stepSize.value.set(2/bright.width,0);pass(horizontal,blur);
      blur.uniforms.map.value=horizontal.texture;blur.uniforms.stepSize.value.set(0,2/bright.height);pass(vertical,blur);
      pass(previous,composite);
    },
    dispose(){geometry.dispose();for(const m of [threshold,blur,composite])m.dispose();for(const t of [source,bright,horizontal,vertical])t.dispose();}
  };
}
