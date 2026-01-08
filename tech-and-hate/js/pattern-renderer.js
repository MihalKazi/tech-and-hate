/**
 * Pattern Renderer
 *
 * Provides pattern geometry generation and rendering functions for generative art cards.
 * Can be used standalone in HTML or integrated into WordPress templates.
 *
 * Usage:
 *   // Browser (requires SimplexNoise)
 *   const rand = mulberry32(seed);
 *   const geom = PatternRenderer.createGeometry('phyllo', rand, 260, 364, 80);
 *   const ctx = canvas.getContext('2d');
 *   const noise = new SimplexNoise(seed);
 *   const stroke = (alpha) => `rgba(...)`;  // Color function
 *   PatternRenderer.patterns.phyllo(ctx, geom, 0, stroke, noise);
 *
 *   // Node.js
 *   const { createGeometry, patterns } = require('./pattern-renderer.js');
 */

// ========= Helper Functions =========
function rb(r, a, b) {
  return a + (b - a) * r();
}

function rint(r, a, b) {
  return Math.floor(rb(r, a, b + 1)); // inclusive
}

function pick(r, arr) {
  return arr[Math.floor(r() * arr.length)];
}

// ========= PRNG (needed for some patterns) =========
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ========= Geometry Generation =========
/**
 * Generate geometry data structures for patterns
 * @param {string} key - Pattern name (e.g., 'phyllo', 'dotcloud')
 * @param {function} r - Seeded random function (0-1)
 * @param {number} w - Canvas width (typically 260)
 * @param {number} h - Canvas height (typically 364)
 * @param {number} safeTop - Y-coordinate below which to draw (to avoid text overlap)
 * @returns {object} Pattern-specific geometry data
 */
function createGeometry(key,r,w,h,safeTop){
  const cx=w/2;
  const cy = safeTop + (h-safeTop)/2 + 6;
  const makePts=n=>Array.from({length:n},()=>[rb(r,20,w-20),rb(r,safeTop+20,h-20)]);
  switch(key){
    case 'phyllo':{
      const pts=[];
      const n=rint(r,420,700), ang=Math.PI*(3-Math.sqrt(5));
      const maxR=Math.min(w,h)*rb(r,0.42,0.50);
      const jitter=rb(r,-0.035,0.035);
      for(let i=0;i<n;i++){
        const rr=Math.sqrt(i/n)*maxR, th=i*ang + jitter*i/n;
        pts.push([cx+rr*Math.cos(th),cy+rr*Math.sin(th)]);
      }
      return{pts};
    }
    case 'dotcloud':{
      const clusters=rint(r,6,10), pts=[];
      for(let c=0;c<clusters;c++){
        const ccx=rb(r,40,w-40), ccy=rb(r,safeTop+50,h-40);
        const sigma=rb(r,24,45);
        const dots=rint(r,120,150);
        for(let i=0;i<dots;i++){
          const a=rb(r,0,Math.PI*2), rad=Math.sqrt(rb(r,0,1))*sigma;
          pts.push([ccx+rad*Math.cos(a), ccy+rad*Math.sin(a), rb(r,0.5,0.95)]);
        }
      }
      return{pts};
    }
    case 'flowfield':{
      const grid=[];const step=12;
      for(let x=20;x<w-20;x+=step){
        for(let y=safeTop+12;y<h-20;y+=step){grid.push([x,y]);}
      }
      return{grid,safeTop};
    }
    case 'arcs':{
      const arcs=[];const count=rint(r,10,16);
      for(let i=0;i<count;i++){
        const r0=rb(r,26,118);
        const minSpan=2*Math.PI/3;
        const span=rb(r,minSpan,3.8);
        const a1=rb(r,0,Math.PI*2);
        arcs.push({r:r0,a1,a2:a1+span});
      }
      const twin=(r()<0.45);
      return{cx,cy,arcs,twin};
    }
    case 'voronoi':{
      const pts=makePts(42), lines=[];
      for(let i=0;i<pts.length;i++){
        for(let j=i+1;j<pts.length;j++){
          const [x1,y1]=pts[i],[x2,y2]=pts[j];
          if(Math.hypot(x1-x2,y1-y2)<78)lines.push([x1,y1,x2,y2]);
        }
      }
      return{lines};
    }
    case 'contourmap':{
      const rings=[];let r0=rb(r,20,36);
      const count=rint(r,14,26), step=rb(r,4.5,7.5);
      for(let i=0;i<count;i++){rings.push(r0);r0+=step;}
      const xscale=rb(r,0.85,1.2), yscale=rb(r,0.85,1.2);
      return{cx,cy,rings,xscale,yscale};
    }
    case 'spiral':{
      const pts=[];
      const turns=rint(r,5,10), baseR=Math.min(w,h)*rb(r,0.55,0.72); // larger
      const rot=rb(r,0,Math.PI*2), expo=rb(r,1.0,1.3);
      const dir=(r()<0.5?1:-1);
      for(let i=0;i<900;i++){
        const tt=i/900,ang=rot+dir*tt*6.283*turns, rr=baseR*Math.pow(tt,expo);
        pts.push([cx+rr*Math.cos(ang),cy+rr*Math.sin(ang)]);
      }
      const width=rb(r,0.7,1.3);
      return{pts,width};
    }
    case 'ripples':{
      const rings=[];const sides=rint(r,3,9);
      const count=rint(r,5,8), base=rb(r,16,24), step=rb(r,12,18), rot=rb(r,0,Math.PI*2);
      for(let i=0;i<count;i++){rings.push({rad:base+i*step, sides, rot});}
      return{cx,cy,rings};
    }
    case 'starburst':{
      const rays=rint(r,15,35), jitter=rb(r,0.03,0.09);
      const arr=[];for(let i=0;i<rays;i++){arr.push(i*(6.283/rays)+rb(r,-jitter,jitter));}
      return{cx,cy,rays:arr};
    }
    case 'network':{
      const pts=makePts(26), lines=[];
      for(let i=0;i<pts.length;i++){
        for(let j=i+1;j<pts.length;j++){
          if(r()<0.22) lines.push([...pts[i],...pts[j]]);
        }
      }
      return{lines};
    }
    case 'scribble':{
      const lines=Array.from({length:240},()=>[rb(r,20,w-20),rb(r,safeTop+20,h-20),rb(r,20,w-20),rb(r,safeTop+20,h-20)]);
      return{lines};
    }
    case 'bezweb':{
      const curves=[];const pts=makePts(6);
      for(let i=0;i<14;i++){
        const [x1,y1]=pick(r,pts),[x2,y2]=pick(r,pts);
        const cx1=rb(r,0,w),cy1=rb(r,safeTop,h),cx2=rb(r,0,w),cy2=rb(r,safeTop,h);
        const seg=[];for(let t=0;t<=1;t+=.05){
          const x=(1-t)**3*x1+3*(1-t)**2*t*cx1+3*(1-t)*t*t*cx2+t**3*x2;
          const y=(1-t)**3*y1+3*(1-t)**2*t*cy1+3*(1-t)*t*t*cy2+t**3*y2;
          seg.push([x,y]);
        }
        curves.push(seg);
      }
      return{curves};
    }
    case 'lissajous':{
      const pts=[];const A=rb(r,0.26,0.36)*w,B=rb(r,0.22,0.32)*h,a=rint(r,2,5),b=rint(r,3,6),delta=rb(r,0,Math.PI);
      for(let t=0;t<6.283;t+=0.01){pts.push([cx+A*Math.sin(a*t+delta),cy+B*Math.sin(b*t)]);}return{pts};
    }
    case 'orbits':{
      const rings=Array.from({length:rint(r,3,6)},()=>({r:rb(r,34,115),tilt:rb(r,0,Math.PI)}));
      return{cx,cy,rings};
    }
    case 'wavelattice':{
      const rows=rint(r,7,13), cols=rint(r,7,13);
      const margin=36;
      const availW=w-2*margin, availH=h-safeTop-44;
      const dx=availW/(cols-1), dy=availH/(rows-1);
      const originX=margin, originY=safeTop+20;
      const seed=rint(r,1,1<<30);
      return{rows,cols,dx,dy,originX,originY,seed,safeTop};
    }
    case 'chaoticorbit':{ return{cx,cy,safeTop}; }
    case 'radiantwave':{ const inner=rb(r,40,70), outer=rb(r,120,180), rings=rint(r,6,15); return{cx,cy,inner,outer,rings}; }
    case 'manicspiral':{
      const pts=[];
      const turns=rint(r,5,10);
      // Calculate max radius that keeps spiral below safeTop
      const availableHeight = h - safeTop - 40; // 40px margin from bottom
      const maxR = Math.min(availableHeight / 2, Math.min(w,h)*0.45);
      const baseR = maxR * rb(r,0.85,1.0);
      // Position cy so spiral top stays below safeTop
      const spiralCy = safeTop + baseR + 20; // 20px margin from safeTop
      const rot=rb(r,0,Math.PI*2), expo=rb(r,1.0,1.3);
      const dir=(r()<0.5?1:-1);
      for(let i=0;i<900;i++){
        const tt=i/900,ang=rot+dir*tt*6.283*turns, rr=baseR*Math.pow(tt,expo);
        pts.push([cx+rr*Math.cos(ang),spiralCy+rr*Math.sin(ang)]);
      }
      const width=rb(r,0.55,1.2);
      return{pts,width};
    }
    case 'denseburst':{
      const rays=rint(r,120,180);
      const angles=[];
      const lengthVariation=rb(r,0.3,0.8); // How much rays vary in length
      const lengthPattern=rint(r,0,3); // Different variation patterns
      for(let i=0;i<rays;i++){
        const angle=(i/rays)*Math.PI*2;
        let lengthMult=1.0;
        if(lengthPattern===0){
          // Sinusoidal variation
          lengthMult=0.5+0.5*(1+Math.sin(i*rb(r,0.1,0.3)))*lengthVariation+0.5*(1-lengthVariation);
        }else if(lengthPattern===1){
          // Random grouping
          lengthMult=0.4+rb(r,0,1)*lengthVariation+0.6*(1-lengthVariation);
        }else if(lengthPattern===2){
          // Radial bands
          lengthMult=0.3+0.7*((Math.cos(i*rb(r,0.05,0.15))+1)/2)*lengthVariation+0.3*(1-lengthVariation);
        }else{
          // Alternating long/short
          lengthMult=0.3+(i%rint(r,2,5)===0?1:0.4)*lengthVariation+0.3*(1-lengthVariation);
        }
        angles.push({angle,lengthMult});
      }
      return{cx,cy,rays:angles};
    }
    case 'starbloom':{
      const points=rint(r,16,32);
      const layers=rint(r,8,16);
      return{cx,cy,points,layers};
    }
    case 'noisyring':{
      const rings=[];
      const count=rint(r,14,24);
      let r0=rb(r,30,50);
      const step=rb(r,8,14);
      const skipPattern=rint(r,0,4); // Different skip patterns
      for(let i=0;i<count;i++){
        let shouldDraw=true;
        if(skipPattern===1){
          // Skip every nth ring
          const skipEvery=rint(r,3,5);
          shouldDraw=(i%skipEvery!==0);
        }else if(skipPattern===2){
          // Skip random rings
          shouldDraw=(r()>0.25);
        }else if(skipPattern===3){
          // Skip bands
          const bandSize=rint(r,3,6);
          shouldDraw=Math.floor(i/bandSize)%2===0;
        }
        // skipPattern===0 means no skipping
        if(shouldDraw){rings.push(r0);}
        r0+=step;
      }
      return{cx,cy,rings};
    }
    case 'waveform':{
      const numWaves=rint(r,1,6);
      const waves=[];
      for(let i=0;i<numWaves;i++){
        waves.push({
          samples:rint(r,60,120),
          amplitude:rb(r,25,50),
          frequency:rb(r,0.05,0.15),
          phase:rb(r,0,Math.PI*2)
        });
      }
      return{waves,safeTop};
    }
    case 'dotburst':{
      const rays=rint(r,40,80);
      const dotsPerRay=rint(r,15,30);
      const lengthVariation=rb(r,0.4,0.9);
      const angles=[];
      for(let i=0;i<rays;i++){
        const angle=(i/rays)*Math.PI*2;
        const lengthMult=0.3+rb(r,0,1)*lengthVariation+0.7*(1-lengthVariation);
        angles.push({angle,lengthMult});
      }
      return{cx,cy,rays:angles,dotsPerRay};
    }
    case 'hexgrid':{
      const cellSize=rb(r,18,32);
      const cols=Math.floor((w-40)/cellSize);
      const rows=Math.floor((h-safeTop-40)/(cellSize*0.866));
      const fillPattern=rint(r,0,3);
      const density=rb(r,0.4,0.8);
      const seed=rint(r,1,1<<30);
      return{cellSize,cols,rows,fillPattern,density,safeTop,seed};
    }
    case 'fiberweb':{
      const numFibers=rint(r,8,16);
      const anchors=[];
      for(let i=0;i<numFibers*2;i++){
        anchors.push([rb(r,30,w-30),rb(r,safeTop+30,h-30)]);
      }
      const curvature=rb(r,0.2,0.6);
      return{anchors,curvature};
    }
    case 'particleflow':{
      const numParticles=rint(r,40,80);
      const particles=[];
      const flowAngle=rb(r,0,Math.PI*2);
      const spread=rb(r,0.3,0.8);
      for(let i=0;i<numParticles;i++){
        const x=rb(r,20,w-20);
        const y=rb(r,safeTop+20,h-20);
        const angle=flowAngle+rb(r,-spread,spread);
        const speed=rb(r,20,60);
        particles.push({x,y,angle,speed});
      }
      return{particles};
    }
    case 'magneticfield':{
      const poles=rint(r,1,3);
      const polePositions=[];
      for(let i=0;i<poles;i++){
        polePositions.push({
          x:rb(r,w*0.2,w*0.8),
          y:rb(r,safeTop+50,h-50),
          charge:(r()>0.5?1:-1)
        });
      }
      const numLines=rint(r,24,40);
      return{cx,cy,polePositions,numLines};
    }
    case 'crystalline':{
      const complexity=rint(r,3,6);
      const symmetry=rint(r,4,8);
      const size=rb(r,60,100);
      return{cx,cy,complexity,symmetry,size};
    }
    case 'vortex':{
      const arms=rint(r,2,5);
      const particles=rint(r,200,400);
      const tightness=rb(r,0.1,0.3);
      const rotation=rb(r,0,Math.PI*2);
      return{cx,cy,arms,particles,tightness,rotation};
    }
    case 'branches':{
      const depth=rint(r,4,7);
      const angleVariation=rb(r,0.3,0.6);
      const lengthDecay=rb(r,0.6,0.8);
      const symmetry=(r()>0.5);
      const seed=rint(r,1,1<<30);
      return{cx,cy:h-40,depth,angleVariation,lengthDecay,symmetry,safeTop,seed};
    }
    case 'interference':{
      const sources=rint(r,2,4);
      const sourcePositions=[];
      for(let i=0;i<sources;i++){
        sourcePositions.push([rb(r,50,w-50),rb(r,safeTop+50,h-50)]);
      }
      const wavelength=rb(r,15,35);
      const amplitude=rb(r,8,16);
      return{sourcePositions,wavelength,amplitude};
    }
    case 'constellation':{
      const numStars=rint(r,12,25);
      const stars=[];
      for(let i=0;i<numStars;i++){
        stars.push({
          x:rb(r,30,w-30),
          y:rb(r,safeTop+30,h-30),
          size:rb(r,1.5,3.5)
        });
      }
      const connectivity=rb(r,0.15,0.35);
      const seed=rint(r,1,1<<30);
      return{stars,connectivity,seed};
    }
    case 'weave':{
      const rows=rint(r,8,14);
      const cols=rint(r,8,14);
      const waveAmp=rb(r,8,18);
      const waveFreq=rb(r,0.3,0.7);
      const pattern=rint(r,0,3);
      return{rows,cols,waveAmp,waveFreq,pattern,safeTop};
    }
    default:return{cx,cy};
  }
}

// ========= Pattern Rendering Functions =========
const patterns={
  // ——— PHYLLO (v30 style, stronger/varied highlights) ———
  phyllo:(ctx,d,t,stroke,noise)=>{
    const {pts}=d; if(!pts||!pts.length)return;
    const cx=130, cy=182;
    ctx.fillStyle=stroke(.80);
    for(const [x,y] of pts){ctx.beginPath();ctx.arc(x,y,1.05,0,6.283);ctx.fill();}
    const rng=mulberry32((d.seed||1)^0xBEEF);
    const maxR=Math.max(...pts.map(([x,y])=>Math.hypot(x-cx,y-cy)));
    const segments=2+rint(rng,0,2); // 2–4
    for(let i=0;i<segments;i++){
      const target=(0.25+0.6*rng())*maxR;
      const startA=rng()*Math.PI*2;
      const arcSpan=(Math.PI/12)+(Math.PI/3)*rng(); // short-to-medium arcs
      for(const [x,y] of pts){
        const dist=Math.hypot(x-cx,y-cy);
        const ang=(Math.atan2(y-cy,x-cx)-startA+2*Math.PI)%(2*Math.PI);
        if(Math.abs(dist-target)<3.6 && ang<arcSpan){
          ctx.beginPath();
          ctx.arc(x,y,1.45,0,6.283);
          ctx.fillStyle=stroke(.93+0.03*rng());
          ctx.globalAlpha=0.78+0.15*rng();
          ctx.fill();
        }
      }
    }
    ctx.globalAlpha=1;
  },

  dotcloud:(ctx,d,t,stroke,noise)=>{
    const pts = d.pts || [];
    for (const p of pts) {
      const x = Array.isArray(p) ? p[0] : p.x;
      const y = Array.isArray(p) ? p[1] : p.y;
      const n = noise.noise2D(x*0.02, y*0.02 + t) * 0.6;
      ctx.beginPath();
      ctx.arc(x + n, y + n, 2.0, 0, Math.PI * 2);
      ctx.fillStyle = stroke(0.88);
      ctx.globalAlpha = 0.6 + 0.4 * (Math.abs(noise.noise2D(x*0.01, y*0.01)) % 1);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  },

  flowfield:(ctx,d,t,stroke,noise)=>{
    ctx.strokeStyle=stroke(.9);ctx.lineWidth=0.7;
    for(const [x,y] of d.grid){
      const a=noise.noise2D(x*.02,y*.02+t)*6.283;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*7,y+Math.sin(a)*7);ctx.stroke();
    }
  },

  arcs:(ctx,d,t,stroke,noise)=>{
    const {cx,cy,arcs,twin}=d;
    for(const a of arcs){
      ctx.beginPath();
      for(let ang=a.a1;ang<a.a2;ang+=0.03){
        const r=a.r+noise.noise2D(Math.cos(ang),Math.sin(ang)+t)*1.4;
        ctx.lineTo(cx+r*Math.cos(ang),cy+r*Math.sin(ang));
      }
      ctx.lineWidth=0.75;ctx.strokeStyle=stroke(.9);ctx.stroke();
      if(twin){
        ctx.beginPath();
        for(let ang=a.a1;ang<a.a2;ang+=0.03){
          const r=a.r*0.75+noise.noise2D(Math.cos(ang+1.3),Math.sin(ang+1.3)+t)*1.2;
          ctx.lineTo(cx+r*Math.cos(ang),cy+r*Math.sin(ang));
        }
        ctx.lineWidth=0.55;ctx.strokeStyle=stroke(.85);ctx.stroke();
      }
    }
  },

  voronoi:(ctx,d,t,stroke,noise)=>{
    ctx.strokeStyle=stroke(.85);ctx.globalAlpha=0.8;
    for(const [x1,y1,x2,y2] of d.lines){
      const n=noise.noise2D((x1+x2)*.01,(y1+y2)*.01+t)*1.0;ctx.beginPath();ctx.moveTo(x1+n,y1+n);ctx.lineTo(x2+n,y2+n);ctx.lineWidth=0.5;ctx.stroke();
    }
    ctx.globalAlpha=1;
  },

  contourmap:(ctx,d,t,stroke,noise)=>{
    const { cx, cy, rings = [], xscale = 1, yscale = 1 } = d;
    const yOffset = 14;
    for (let i = 0; i < rings.length; i++) {
      const r = rings[i];
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += 0.03) {
        const n = noise.noise2D(Math.cos(a) * r * 0.05, Math.sin(a) * r * 0.05 + t) * 0.9;
        const X = cx + (r + n) * Math.cos(a) * xscale;
        const Y = cy + (r + n) * Math.sin(a) * yscale + yOffset;
        ctx.lineTo(X, Y);
      }
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = (i % 2 ? stroke(0.85) : stroke(0.9));
      ctx.stroke();
    }
  },

  // ——— SPIRAL (v29 hand-drawn feel, larger) ———
  spiral:(ctx,d,t,stroke,noise)=>{
    const {pts,width}=d; if(!pts||!pts.length)return;
    const rng=mulberry32((d.seed||1)^0x51C3);
    const styles=[{dash:[],w:width},{dash:[5,4],w:Math.max(width,1.0)},{dash:[2,3],w:Math.max(0.7,width*0.9)},{dash:[],w:Math.max(1.2,width),double:true}];
    const style=styles[Math.floor(rng()*styles.length)];
    ctx.setLineDash(style.dash);
    ctx.lineWidth=style.w;
    ctx.strokeStyle=stroke(.9);
    ctx.beginPath();
    const rot=rng()*Math.PI*2;
    for(let i=0;i<pts.length;i++){
      const [x,y]=pts[i];
      const tt=i/pts.length;
      // ring spacing irregularity modulated around the circle:
      const irregular=1+0.16*Math.sin(tt*8*Math.PI + rot) + 0.10*Math.sin(tt*5*Math.PI + 2.1*rot);
      const a=Math.atan2(y-182,x-130)+rot;
      const rr=Math.hypot(x-130,y-182)*irregular;
      const nx=130+rr*Math.cos(a),ny=182+rr*Math.sin(a);
      i===0?ctx.moveTo(nx,ny):ctx.lineTo(nx,ny);
    }
    ctx.stroke();
    if(style.double){
      ctx.lineWidth*=.55;ctx.strokeStyle=stroke(.72);
      ctx.save();ctx.translate(1.3,1.3);ctx.stroke();ctx.restore();
    }
    ctx.setLineDash([]);
  },

  ripples:(ctx,d,t,stroke,noise)=>{
    const {cx,cy,rings}=d; if(!rings)return;
    for(const R of rings){
      const {rad,sides,rot}=R;
      const n=Math.max(3,Math.min(9,Math.round(sides||6)));
      ctx.beginPath();
      for(let k=0;k<=n;k++){
        const a=rot+k*(Math.PI*2/n);
        const rr=rad+noise.noise2D(k*0.4,rad*0.1+t)*1.2;
        const x=cx+rr*Math.cos(a),y=cy+rr*Math.sin(a);
        k===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.closePath();
      ctx.lineWidth=0.8;
      ctx.strokeStyle=stroke(.85);
      ctx.stroke();
    }
  },

  starburst:(ctx,d,t,stroke,noise)=>{
    const {cx,cy,rays}=d;
    const rng = mulberry32((d.seed||1)^0xA11C);
    rays.forEach((ang,i)=>{
      const base = 62 + (i%7)*4;
      const len = base * (0.75 + (rng()*0.5));
      ctx.beginPath(); ctx.moveTo(cx,cy);
      ctx.lineTo(cx + len*Math.cos(ang), cy + len*Math.sin(ang));
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = (i%3===0? stroke(0.95): stroke(0.8));
      ctx.stroke();
    });
  },

  network:(ctx,d,t,stroke,noise)=>{
    ctx.strokeStyle=stroke(.9);ctx.lineWidth=0.6;
    for(const [x1,y1,x2,y2] of d.lines){const n=noise.noise2D(x1*.02,y1*.02+t)*0.9;ctx.beginPath();ctx.moveTo(x1+n,y1+n);ctx.lineTo(x2+n,y2+n);ctx.stroke();}
  },

  scribble:(ctx,d,t,stroke,noise)=>{
    ctx.strokeStyle=stroke(.75);
    for(const [x1,y1,x2,y2] of d.lines){const n=noise.noise2D(x1*.02,y1*.02+t)*0.8;ctx.beginPath();ctx.moveTo(x1+n,y1+n);ctx.lineTo(x2+n,y2+n);ctx.lineWidth=0.65;ctx.stroke();}
  },

  bezweb:(ctx,d,t,stroke,noise)=>{
    ctx.strokeStyle=stroke(.85);ctx.lineWidth=0.55;
    for(const seg of d.curves){ctx.beginPath();for(const [x,y] of seg){const n=noise.noise2D(x*.015,y*.015+t)*0.8;ctx.lineTo(x+n,y+n);}ctx.stroke();}
  },

  lissajous:(ctx,d,t,stroke,noise)=>{
    ctx.beginPath();for(const [x,y] of d.pts){const n=noise.noise2D(x*.02,y*.02+t)*0.8;ctx.lineTo(x+n,y+n);}ctx.lineWidth=0.8;ctx.strokeStyle=stroke(.9);ctx.stroke();
  },

  orbits:(ctx,d,t,stroke,noise)=>{
    const {cx,cy,rings}=d;ctx.strokeStyle=stroke(.9);
    for(const ring of rings){ctx.beginPath();for(let a=0;a<6.283;a+=0.02){const rr=ring.r+noise.noise2D(Math.cos(a+ring.tilt),Math.sin(a+ring.tilt)+t)*1.0;ctx.lineTo(cx+rr*Math.cos(a),cy+rr*Math.sin(a));}ctx.lineWidth=0.65;ctx.stroke();}
  },

  // ——— WAVELATTICE (v30 smooth, breezy warp) ———
  wavelattice:(ctx,d,t,stroke,noise)=>{
    const {rows,cols,dx,dy,originX,originY,seed}=d;
    const rand=mulberry32((seed||1)^0x57415645);
    const depth = rb(rand,6,14);
    const fx = rb(rand,0.6,1.2), fy = rb(rand,0.6,1.2);
    const phx = rb(rand,0,Math.PI*2), phy = rb(rand,0,Math.PI*2);
    ctx.lineWidth=0.7; ctx.strokeStyle=stroke(.85);
    function warp(x,y,r,c){
      const wx = Math.sin((y*fy*0.045)+phx + r*0.22)*depth;
      const wy = Math.sin((x*fx*0.045)+phy + c*0.22)*depth;
      return [x+wx, y+wy];
    }
    for(let r=0;r<rows;r++){
      const pts=[];
      for(let c=0;c<cols;c++){
        const x=originX + c*dx, y=originY + r*dy;
        pts.push(warp(x,y,r,c));
      }
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for(let i=1;i<pts.length;i++){
        const p0 = pts[i-1], p1 = pts[i];
        const mx = (p0[0]+p1[0])/2, my=(p0[1]+p1[1])/2;
        if(i===1) ctx.lineTo(mx,my);
        else ctx.quadraticCurveTo(p0[0],p0[1], mx,my);
      }
      const last = pts[pts.length-1];
      ctx.lineTo(last[0], last[1]);
      ctx.stroke();
    }
    for(let c=0;c<cols;c++){
      const pts=[];
      for(let r=0;r<rows;r++){
        const x=originX + c*dx, y=originY + r*dy;
        pts.push(warp(x,y,r,c));
      }
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for(let i=1;i<pts.length;i++){
        const p0 = pts[i-1], p1 = pts[i];
        const mx = (p0[0]+p1[0])/2, my=(p0[1]+p1[1])/2;
        if(i===1) ctx.lineTo(mx,my);
        else ctx.quadraticCurveTo(p0[0],p0[1], mx,my);
      }
      const last = pts[pts.length-1];
      ctx.lineTo(last[0], last[1]);
      ctx.stroke();
    }
  },

  // ——— MANICSPIRAL (from v30 jaggy) ———
  manicspiral:(ctx,d,t,stroke,noise)=>{

  const {pts}=d;
  if(!pts||!pts.length)return;
  const rng=mulberry32(d.seed^0x51C3);
  const styles=[{dash:[],w:0.8},{dash:[5,4],w:1.2},{dash:[2,3],w:0.7},{dash:[],w:1.3,double:true}];
  const style=styles[Math.floor(rng()*styles.length)];
  ctx.setLineDash(style.dash);
  ctx.lineWidth=style.w;
  ctx.strokeStyle=stroke(.9);
  ctx.beginPath();
  const rot=rng()*Math.PI*2;
  const baseR=1.0,exp=1.05+0.15*(rng()-0.5);
  for(let i=0;i<pts.length;i++){
    const [x,y]=pts[i];
    const tt=i/pts.length;
    const irregular=1+0.08*Math.sin(tt*8*Math.PI+rng()*6.28);
    const radius=baseR*Math.pow(tt,exp)*irregular;
    const a=Math.atan2(y-182,x-130)+rot;
    const rr=Math.hypot(x-130,y-182)*radius;
    const nx=130+rr*Math.cos(a),ny=182+rr*Math.sin(a);
    i===0?ctx.moveTo(nx,ny):ctx.lineTo(nx,ny);
  }
  ctx.stroke();
  if(style.double){
    ctx.lineWidth*=.5;ctx.strokeStyle=stroke(.7);
    ctx.save();ctx.translate(1.2,1.2);ctx.stroke();ctx.restore();
  }
  ctx.setLineDash([]);

  },

  ripples:(ctx,d,t,stroke,noise)=>{
    const {cx,cy,rings}=d;
    if(!rings)return;
    for(const R of rings){
      const {rad,sides,rot}=R;
      const n=Math.max(3,Math.min(9,Math.round(sides||6)));
      ctx.beginPath();
      for(let k=0;k<=n;k++){
        const a=rot+k*(Math.PI*2/n);
        const rr=rad+noise.noise2D(k*0.4,rad*0.1+t)*1.2;
        const x=cx+rr*Math.cos(a),y=cy+rr*Math.sin(a);
        k===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.closePath();
      ctx.lineWidth=0.8;
      ctx.strokeStyle=stroke(.85);
      ctx.stroke();
    }
  },

  radiantwave:(ctx,d,t,stroke,noise)=>{
    let {cx,cy,inner,outer,rings,safeTop}=d;
    cy += (safeTop||60)*0.25; // push graphic downward to avoid overlap
    rings=Math.max(6,Math.min(15,Math.round(rings||10)));
    for(let i=0;i<rings;i++){
      const t=i/(rings-1);
      const base=inner+(outer-inner)*t;
      ctx.beginPath();
      for(let a=0;a<Math.PI*2;a+=0.04){
        const wobble=noise.noise2D(a*0.9,(i+1)*0.17)*1.1;
        const rr=base+wobble;
        ctx.lineTo(cx+rr*Math.cos(a),cy+rr*Math.sin(a));
      }
      ctx.lineWidth=(i%4===0)?1.4:0.9;
      ctx.strokeStyle=(i%2===0)?stroke(.9):stroke(.75);
      ctx.stroke();
    }
  },

  chaoticorbit:(ctx,d,t,stroke,noise)=>{
    const rng = mulberry32(d.seed ^ 0xC0DE);
    const walkers=3;const {cx,cy,safeTop}=d;
    const minY=safeTop+10,maxY=344;const minX=20,maxX=240;
    for(let j=0;j<walkers;j++){
      let x=cx+(rng()*60-30), y=minY+10+(maxY-minY-20)*rng(); let a=rng()*Math.PI*2;
      ctx.beginPath();ctx.moveTo(x,y);
      for(let i=0;i<900;i++){
        a += noise.noise2D(x*0.01,y*0.01+j*13)*0.6;
        const step=2.8+Math.abs(noise.noise2D(i*0.05,j*7))*2.2;
        x+=Math.cos(a)*step; y+=Math.sin(a)*step;
        if(x<minX||x>maxX){a=Math.PI-a; x=Math.max(minX,Math.min(maxX,x));}
        if(y<minY||y>maxY){a=-a; y=Math.max(minY,Math.min(maxY,y));}
        ctx.lineTo(x,y);
      }
      ctx.strokeStyle=stroke(.85);
      ctx.lineWidth=0.8;
      ctx.stroke();
    }
  },

  denseburst:(ctx,d,t,stroke,noise)=>{
    const {cx,cy,rays}=d;
    ctx.strokeStyle=stroke(.75);
    ctx.lineWidth=0.4;
    for(const ray of rays){
      const {angle,lengthMult}=ray;
      const baseLen=60+lengthMult*80;
      const len=baseLen+noise.noise2D(Math.cos(angle)*10,Math.sin(angle)*10+t)*10;
      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.lineTo(cx+len*Math.cos(angle),cy+len*Math.sin(angle));
      ctx.stroke();
    }
  },

  starbloom:(ctx,d,t,stroke,noise)=>{
    const {cx,cy,points,layers}=d;
    ctx.strokeStyle=stroke(.85);
    ctx.lineWidth=0.6;
    for(let layer=0;layer<layers;layer++){
      const r=20+layer*8;
      const wobble=noise.noise2D(layer*0.3,t)*2;
      ctx.beginPath();
      for(let i=0;i<=points;i++){
        const ang=(i/points)*Math.PI*2;
        const isPoint=(i%2===0);
        const rr=isPoint ? r+12+wobble : r-8+wobble;
        const x=cx+rr*Math.cos(ang);
        const y=cy+rr*Math.sin(ang);
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.stroke();
    }
  },

  noisyring:(ctx,d,t,stroke,noise)=>{
    const {cx,cy,rings}=d;
    ctx.strokeStyle=stroke(.85);
    ctx.lineWidth=0.75;
    for(const r of rings){
      ctx.beginPath();
      for(let a=0;a<Math.PI*2;a+=0.02){
        const n=noise.noise2D(r*Math.cos(a)*0.05,r*Math.sin(a)*0.05+t)*4;
        const rr=r+n;
        ctx.lineTo(cx+rr*Math.cos(a),cy+rr*Math.sin(a));
      }
      ctx.closePath();
      ctx.stroke();
    }
  },

  waveform:(ctx,d,t,stroke,noise)=>{
    const {waves,safeTop}=d;
    const startX=20;
    const endX=240;
    const availableHeight=364-safeTop-40;
    const spacing=availableHeight/(waves.length+1);

    waves.forEach((wave,waveIdx)=>{
      const {samples,amplitude,frequency,phase}=wave;
      const midY=safeTop+spacing*(waveIdx+1);
      const dx=(endX-startX)/samples;
      ctx.strokeStyle=stroke(.80+waveIdx*0.05);
      ctx.lineWidth=0.9;
      ctx.beginPath();
      for(let i=0;i<=samples;i++){
        const x=startX+i*dx;
        const y=midY+Math.sin(i*frequency+phase+t*10)*amplitude*noise.noise2D(i*0.1+waveIdx*10,t);
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.stroke();
    });
  },

  dotburst:(ctx,d,t,stroke,noise)=>{
    const {cx,cy,rays,dotsPerRay}=d;
    ctx.fillStyle=stroke(.85);
    for(const ray of rays){
      const {angle,lengthMult}=ray;
      const maxR=80+lengthMult*60;
      for(let i=1;i<=dotsPerRay;i++){
        const r=(i/dotsPerRay)*maxR;
        const wobble=noise.noise2D(r*Math.cos(angle)*0.05,r*Math.sin(angle)*0.05+t)*2;
        const x=cx+(r+wobble)*Math.cos(angle);
        const y=cy+(r+wobble)*Math.sin(angle);
        const size=(i%3===0)?1.5:1.0;
        ctx.beginPath();
        ctx.arc(x,y,size,0,Math.PI*2);
        ctx.fill();
      }
    }
  },

  hexgrid:(ctx,d,t,stroke,noise)=>{
    const {cellSize,cols,rows,fillPattern,density,safeTop}=d;
    const hexHeight=cellSize*0.866;
    const rng=mulberry32((d.seed||1)^0xABC1);
    ctx.strokeStyle=stroke(.85);
    ctx.lineWidth=0.7;

    for(let row=0;row<rows;row++){
      for(let col=0;col<cols;col++){
        if(rng()>density && fillPattern!==0)continue;
        const x=20+col*cellSize+(row%2)*cellSize/2;
        const y=safeTop+30+row*hexHeight;
        const shouldFill=(fillPattern===0)?(col+row)%2===0:
                        (fillPattern===1)?rng()>0.6:
                        (fillPattern===2)?(col%3===0&&row%3===0):
                        rng()>0.8;

        ctx.beginPath();
        for(let i=0;i<6;i++){
          const angle=Math.PI/3*i+noise.noise2D(x*0.05,y*0.05+t)*0.1;
          const px=x+cellSize/2*Math.cos(angle);
          const py=y+cellSize/2*Math.sin(angle);
          i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
        }
        ctx.closePath();
        if(shouldFill){
          ctx.fillStyle=stroke(.15);
          ctx.fill();
        }
        ctx.stroke();
      }
    }
  },

  fiberweb:(ctx,d,t,stroke,noise)=>{
    const {anchors,curvature}=d;
    ctx.strokeStyle=stroke(.80);
    ctx.lineWidth=0.6;

    for(let i=0;i<anchors.length-1;i+=2){
      const [x1,y1]=anchors[i];
      const [x2,y2]=anchors[i+1];
      const dx=x2-x1, dy=y2-y1;
      const dist=Math.hypot(dx,dy);
      const perpX=-dy/dist*curvature*dist*0.5;
      const perpY=dx/dist*curvature*dist*0.5;
      const cpx=(x1+x2)/2+perpX+noise.noise2D(i*0.5,t)*20;
      const cpy=(y1+y2)/2+perpY+noise.noise2D(i*0.5+100,t)*20;

      ctx.beginPath();
      ctx.moveTo(x1,y1);
      ctx.quadraticCurveTo(cpx,cpy,x2,y2);
      ctx.stroke();
    }
  },

  particleflow:(ctx,d,t,stroke,noise)=>{
    const {particles}=d;
    ctx.lineWidth=0.8;

    for(let i=0;i<particles.length;i++){
      const p=particles[i];
      const wobble=noise.noise2D(p.x*0.02,p.y*0.02+t)*0.3;
      const angle=p.angle+wobble;
      const len=p.speed*(0.8+noise.noise2D(p.x*0.03,p.y*0.03)*0.4);

      ctx.beginPath();
      ctx.moveTo(p.x,p.y);
      ctx.lineTo(p.x+len*Math.cos(angle),p.y+len*Math.sin(angle));
      ctx.strokeStyle=stroke(.75+i*0.0005);
      ctx.stroke();

      // Add dot at start
      ctx.fillStyle=stroke(.85);
      ctx.beginPath();
      ctx.arc(p.x,p.y,1.2,0,Math.PI*2);
      ctx.fill();
    }
  },

  magneticfield:(ctx,d,t,stroke,noise)=>{
    const {polePositions,numLines}=d;
    ctx.strokeStyle=stroke(.80);
    ctx.lineWidth=0.6;

    for(let i=0;i<numLines;i++){
      const startAngle=(i/numLines)*Math.PI*2;
      const pole=polePositions[i%polePositions.length];
      const startDist=15;
      let x=pole.x+startDist*Math.cos(startAngle);
      let y=pole.y+startDist*Math.sin(startAngle);

      ctx.beginPath();
      ctx.moveTo(x,y);

      for(let step=0;step<50;step++){
        let fx=0,fy=0;
        for(const p of polePositions){
          const dx=x-p.x, dy=y-p.y;
          const dist=Math.hypot(dx,dy)+1;
          const force=p.charge*10/(dist*dist);
          fx+=force*dx/dist;
          fy+=force*dy/dist;
        }
        const fieldNoise=noise.noise2D(x*0.03,y*0.03+t)*2;
        x+=fx+Math.cos(fieldNoise);
        y+=fy+Math.sin(fieldNoise);
        if(x<10||x>250||y<80||y>354)break;
        ctx.lineTo(x,y);
      }
      ctx.stroke();
    }

    // Draw poles
    for(const pole of polePositions){
      ctx.fillStyle=pole.charge>0?stroke(.9):stroke(.5);
      ctx.beginPath();
      ctx.arc(pole.x,pole.y,4,0,Math.PI*2);
      ctx.fill();
    }
  },

  crystalline:(ctx,d,t,stroke,noise)=>{
    const {cx,cy,complexity,symmetry,size}=d;
    ctx.strokeStyle=stroke(.85);
    ctx.lineWidth=0.7;

    for(let layer=0;layer<complexity;layer++){
      const layerSize=size*(layer+1)/complexity;
      const rotation=noise.noise2D(layer*0.5,t)*0.3;

      ctx.beginPath();
      for(let i=0;i<=symmetry;i++){
        const angle=rotation+(i/symmetry)*Math.PI*2;
        const isInner=(i%2===0);
        const r=isInner?layerSize*0.7:layerSize;
        const wobble=noise.noise2D(Math.cos(angle)*5,Math.sin(angle)*5+t)*3;
        const x=cx+(r+wobble)*Math.cos(angle);
        const y=cy+(r+wobble)*Math.sin(angle);
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.closePath();
      ctx.stroke();
    }
  },

  vortex:(ctx,d,t,stroke,noise)=>{
    const {cx,cy,arms,particles,tightness,rotation}=d;
    ctx.fillStyle=stroke(.75);

    for(let i=0;i<particles;i++){
      const angle=rotation+(i/particles)*Math.PI*2*arms;
      const r=Math.sqrt(i/particles)*110;
      const spiralAngle=angle+r*tightness;
      const wobble=noise.noise2D(i*0.02,t)*5;
      const x=cx+(r+wobble)*Math.cos(spiralAngle);
      const y=cy+(r+wobble)*Math.sin(spiralAngle);
      const size=0.8+(particles-i)/particles*1.5;

      ctx.beginPath();
      ctx.arc(x,y,size,0,Math.PI*2);
      ctx.fill();
    }
  },

  branches:(ctx,d,t,stroke,noise)=>{
    const {cx,cy,depth,angleVariation,lengthDecay,symmetry,safeTop,seed}=d;
    const rng=mulberry32(seed^0xBEA4);
    const startLength=60;
    const minY=safeTop+20;

    function drawBranch(x,y,angle,len,d){
      if(d<=0||len<3||y<minY)return;
      const wobble=noise.noise2D(x*0.05,y*0.05+t)*0.2;
      const endX=x+len*Math.cos(angle+wobble);
      const endY=y+len*Math.sin(angle+wobble);

      ctx.beginPath();
      ctx.moveTo(x,y);
      ctx.lineTo(endX,endY);
      ctx.strokeStyle=stroke(.75+d*0.03);
      ctx.lineWidth=d*0.3+0.4;
      ctx.stroke();

      const branchAngle=angleVariation*(Math.PI/4);
      const newLen=len*lengthDecay;
      drawBranch(endX,endY,angle-branchAngle,newLen,d-1);
      if(symmetry||rng()>0.3){
        drawBranch(endX,endY,angle+branchAngle,newLen,d-1);
      }
    }

    drawBranch(cx,cy,-Math.PI/2,startLength,depth);
  },

  interference:(ctx,d,t,stroke,noise)=>{
    const {sourcePositions,wavelength,amplitude}=d;
    ctx.strokeStyle=stroke(.75);
    ctx.lineWidth=0.5;

    const step=5;
    for(let x=20;x<240;x+=step){
      ctx.beginPath();
      let firstPoint=true;
      for(let y=80;y<360;y+=2){
        let phase=0;
        for(const [sx,sy] of sourcePositions){
          const dist=Math.hypot(x-sx,y-sy);
          phase+=Math.sin(dist/wavelength*Math.PI*2+t*5);
        }
        const offset=phase*amplitude+noise.noise2D(x*0.02,y*0.02)*2;
        const px=x+offset;
        if(firstPoint){ctx.moveTo(px,y);firstPoint=false;}else{ctx.lineTo(px,y);}
      }
      ctx.stroke();
    }
  },

  constellation:(ctx,d,t,stroke,noise)=>{
    const {stars,connectivity,seed}=d;
    const rng=mulberry32(seed^0xC045);

    // Draw connections
    ctx.strokeStyle=stroke(.65);
    ctx.lineWidth=0.5;
    for(let i=0;i<stars.length;i++){
      for(let j=i+1;j<stars.length;j++){
        const dist=Math.hypot(stars[i].x-stars[j].x,stars[i].y-stars[j].y);
        if(dist<100&&rng()<connectivity){
          ctx.beginPath();
          ctx.moveTo(stars[i].x,stars[i].y);
          ctx.lineTo(stars[j].x,stars[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw stars
    for(const star of stars){
      const twinkle=noise.noise2D(star.x*0.1,star.y*0.1+t)*0.5+0.5;
      ctx.fillStyle=stroke(.8+twinkle*0.2);
      ctx.beginPath();
      ctx.arc(star.x,star.y,star.size*twinkle,0,Math.PI*2);
      ctx.fill();
    }
  },

  weave:(ctx,d,t,stroke,noise)=>{
    const {rows,cols,waveAmp,waveFreq,pattern,safeTop}=d;
    const cellW=220/cols, cellH=(350-safeTop)/rows;
    const startY=safeTop+20;

    ctx.lineWidth=0.8;

    // Horizontal strands
    for(let r=0;r<rows;r++){
      ctx.beginPath();
      ctx.strokeStyle=stroke(.80);
      for(let c=0;c<=cols;c++){
        const x=20+c*cellW;
        const y=startY+r*cellH+Math.sin(c*waveFreq+t*3+r*0.5)*waveAmp;
        const isOver=(pattern===0)?(r+c)%2===0:
                     (pattern===1)?r%2===0:
                     (pattern===2)?Math.sin(c*0.5+r)>0:
                     (c%3===r%3);
        if(isOver||c===0){
          c===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }else{
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x,y);
        }
      }
      ctx.stroke();
    }

    // Vertical strands
    for(let c=0;c<cols;c++){
      ctx.beginPath();
      ctx.strokeStyle=stroke(.70);
      for(let r=0;r<=rows;r++){
        const x=20+c*cellW+Math.sin(r*waveFreq+t*3+c*0.5)*waveAmp;
        const y=startY+r*cellH;
        const isOver=(pattern===0)?(r+c)%2===1:
                     (pattern===1)?c%2===0:
                     (pattern===2)?Math.sin(r*0.5+c)<0:
                     (r%3!==c%3);
        if(isOver||r===0){
          r===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }else{
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x,y);
        }
      }
      ctx.stroke();
    }
  }
};

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  // Node.js / CommonJS
  module.exports = {
    createGeometry,
    patterns,
    rb,
    rint,
    pick,
    mulberry32
  };
} else if (typeof window !== 'undefined') {
  // Browser global
  window.PatternRenderer = {
    createGeometry,
    patterns,
    rb,
    rint,
    pick,
    mulberry32
  };
}
