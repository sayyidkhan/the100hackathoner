// Motion stays on the GPU, so the finely modelled miniature keeps its original
// material batches and geometry/AO signatures. The gallery owns the only clock:
// pause, reduced motion, hidden tabs and offscreen exhibits all freeze it.
export function coastalMotion(T) {
  const time = { value: 0 };
  const walkers = { value: [new T.Vector4(),new T.Vector4()] };
  const steps = { value: new T.Vector4() };
  const declarations = `
    uniform float uCoastTime;
    uniform vec4 uCoastWalkers[2];
    uniform vec4 uCoastSteps;
    attribute vec2 coastMotion;
    attribute vec3 coastPivot;
    varying float vCoastPulse;
    vec3 coastRotate(vec3 p, float x, float z) {
      float cx=cos(x), sx=sin(x), cz=cos(z), sz=sin(z);
      p=vec3(p.x,cx*p.y-sx*p.z,sx*p.y+cx*p.z);
      return vec3(cz*p.x-sz*p.y,sz*p.x+cz*p.y,p.z);
    }
    vec3 coastYaw(vec3 p,float a) {
      return vec3(cos(a)*p.x+sin(a)*p.z,p.y,-sin(a)*p.x+cos(a)*p.z);
    }
    bool coastChild() { return coastMotion.x==10.0 || coastMotion.x>=15.0; }
    float coastLimbAngle() {
      float kind=coastMotion.x;
      if(kind<11.0) return 0.0;
      bool child=coastChild();
      float gait=child?uCoastSteps.z:uCoastSteps.x;
      float stride=child?uCoastSteps.w:uCoastSteps.y;
      float side=(kind==11.0 || kind==13.0 || kind==15.0 || kind==17.0)?-1.0:1.0;
      bool leg=kind==11.0 || kind==12.0 || kind==15.0 || kind==16.0;
      return sin(gait)*stride*side*(leg?.44:-.36);
    }
    vec2 coastAngles() {
      float phase=coastMotion.y;
      if(coastMotion.x==2.0) return vec2(.045*(sin(uCoastTime*.71+phase)-sin(phase)), .085*(sin(uCoastTime*.91+phase)-sin(phase)));
      if(coastMotion.x==3.0) return vec2(0.0,.030*(sin(uCoastTime*.65+phase)-sin(phase)));
      if(coastMotion.x==4.0) return vec2(.025*sin(uCoastTime*.8),.075*sin(uCoastTime*1.05));
      if(coastMotion.x==8.0) return vec2(.025*(sin(uCoastTime*.75+phase)-sin(phase)),.045*(sin(uCoastTime*.95+phase)-sin(phase)));
      return vec2(0.0);
    }
    vec3 coastPosition(vec3 p) {
      float kind=coastMotion.x, phase=coastMotion.y;
      if(kind==1.0) {
        float wave=sin(uCoastTime*1.24+phase)-sin(phase);
        float h=p.y-coastPivot.y;
        p.x+=h*.075*wave; p.y+=h*.075*wave;
      } else if(kind==2.0 || kind==3.0 || kind==4.0 || kind==8.0) {
        vec2 angles=coastAngles();
        p=coastPivot+coastRotate(p-coastPivot,angles.x,angles.y);
        if(kind==3.0) {
          p.x+=.13*(sin(uCoastTime*.54+phase)-sin(phase));
          p.y+=.045*(sin(uCoastTime*.83+phase)-sin(phase));
        }
        if(kind==4.0) p.y+=.045*(1.0-cos(uCoastTime*1.3));
      } else if(kind==5.0) {
        p.y+=.029*(sin(uCoastTime*3.1+phase)-sin(phase));
      } else if(kind==6.0) {
        float crease=p.x*3.0+p.z*5.0;
        float edge=clamp((p.z-coastPivot.z+.43)/.86,0.0,1.0);
        p.y+=.020*(sin(uCoastTime*1.8+crease)-sin(crease))*edge;
      } else if(kind>=9.0) {
        bool child=coastChild();
        float scale=child?.57:.86;
        vec3 local=coastYaw(p-coastPivot,child?.55:.70);
        if(kind>=11.0) {
          float side=(kind==11.0 || kind==13.0 || kind==15.0 || kind==17.0)?-1.0:1.0;
          bool leg=kind==11.0 || kind==12.0 || kind==15.0 || kind==16.0;
          vec3 joint=vec3(side*(leg?.10:.14),leg?.44:.77,0.0)*scale;
          local=joint+coastRotate(local-joint,coastLimbAngle(),0.0);
        }
        vec4 pose=child?uCoastWalkers[1]:uCoastWalkers[0];
        p=pose.xyz+coastYaw(local,pose.w);
      }
      return p;
    }
    vec3 coastNormal(vec3 n) {
      if(coastMotion.x==1.0) {
        float wave=sin(uCoastTime*1.24+coastMotion.y)-sin(coastMotion.y);
        n.y=(n.y-.075*wave*n.x)/(1.0+.075*wave);
      } else if(coastMotion.x==2.0 || coastMotion.x==3.0 || coastMotion.x==4.0 || coastMotion.x==8.0) {
        vec2 angles=coastAngles(); n=coastRotate(n,angles.x,angles.y);
      } else if(coastMotion.x>=9.0) {
        bool child=coastChild();
        n=coastYaw(n,child?.55:.70);
        n=coastRotate(n,coastLimbAngle(),0.0);
        n=coastYaw(n,child?uCoastWalkers[1].w:uCoastWalkers[0].w);
      }
      return normalize(n);
    }
  `;
  function vertex(shader) {
    shader.uniforms.uCoastTime = time;
    shader.uniforms.uCoastWalkers = walkers;
    shader.uniforms.uCoastSteps = steps;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\n' + declarations)
      .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\nobjectNormal = coastNormal(objectNormal);')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        transformed=coastPosition(transformed);
        vCoastPulse=0.0;
        if(coastMotion.x==7.0) {
          float progress=fract(uCoastTime/15.0);
          float gap=abs(fract(coastMotion.y-progress+.5)-.5);
          vCoastPulse=pow(max(0.0,1.0-gap/.09),2.0)*smoothstep(0.0,1.2,uCoastTime);
        }
      `);
  }
  function install(material) {
    const previous = material.onBeforeCompile;
    const cacheKey = material.customProgramCacheKey();
    material.onBeforeCompile = function(shader, renderer) {
      previous.call(this, shader, renderer);
      vertex(shader);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vCoastPulse;')
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          totalEmissiveRadiance += vec3(.16,.48,.64)*vCoastPulse;
          diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.34,.68,.78),vCoastPulse*.65);
        `);
    };
    material.customProgramCacheKey = () => cacheKey + ':coastal-motion-v2';
  }
  // Match silhouettes in the live-shadow fallback while the AO asset loads.
  const depthMaterial = new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking });
  depthMaterial.onBeforeCompile = vertex;
  depthMaterial.customProgramCacheKey = () => 'coastal-motion-depth-v2';
  function mark(object, kind, phase = 0, anchor = object) {
    object.userData.coastalMotion = { kind, phase, anchor };
    return object;
  }
  function attributes(object) {
    let owner = object;
    while (owner && !owner.userData.coastalMotion) owner = owner.parent;
    if (!owner) return [0, 0, 0, 0, 0];
    const { kind, phase, anchor } = owner.userData.coastalMotion;
    const pivot = new T.Vector3().setFromMatrixPosition(anchor.matrixWorld);
    return [kind, phase, pivot.x, pivot.y, pivot.z];
  }
  return {
    install, mark, attributes, depthMaterial,
    setWalkers(poses) {
      poses.forEach((pose,i)=>walkers.value[i].set(pose.x,pose.y,pose.z,pose.yaw));
      steps.value.set(poses[0].gait,poses[0].stride,poses[1].gait,poses[1].stride);
    },
    animate(seconds) { time.value = Number.isFinite(seconds) ? Math.max(0, seconds) : 0; },
  };
}
