/*
 * ChromaKey-Forge pixel processing
 * Copyright (c) 2026 Austen J. Green
 * SPDX-License-Identifier: AGPL-3.0-only
 */
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports) module.exports=api;
  if(root) root.ChromaKey=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  function clamp(value,min,max){
    return Math.min(max,Math.max(min,value));
  }

  function hexToRgb(value){
    if(!/^#[0-9a-f]{6}$/i.test(value)) throw new TypeError("Expected a six-digit hex color");
    const number=parseInt(value.slice(1),16);
    return[(number>>16)&255,(number>>8)&255,number&255];
  }

  function rgbToHsv(red,green,blue){
    const r=red/255,g=green/255,b=blue/255;
    const max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min;
    let hue=0;
    if(delta){
      if(max===r) hue=((g-b)/delta)%6;
      else if(max===g) hue=(b-r)/delta+2;
      else hue=(r-g)/delta+4;
      hue*=60;
      if(hue<0) hue+=360;
    }
    return[hue,max?delta/max:0,max];
  }

  function angularDistance(first,second){
    const distance=Math.abs(first-second)%360;
    return distance>180?360-distance:distance;
  }

  function finiteOption(value,fallback,name){
    const number=Number(value??fallback);
    if(!Number.isFinite(number)) throw new TypeError(`${name} must be a finite number`);
    return number;
  }

  function processPixels(source,options={}){
    if(!(source instanceof Uint8ClampedArray)||source.length%4!==0){
      throw new TypeError("source must be an RGBA Uint8ClampedArray");
    }

    const mode=options.mode??"hue";
    if(!["hue","purple","picked"].includes(mode)) throw new TypeError("Unknown removal mode");

    const strength=Math.max(0,finiteOption(options.strength,1,"strength"));
    const softness=clamp(finiteOption(options.softness,0.4,"softness"),0,1);
    const gamma=Math.max(Number.EPSILON,finiteOption(options.gamma,1,"gamma"));
    const decontaminate=clamp(finiteOption(options.decontaminate,0.6,"decontaminate"),0,1);
    const tolerance=Math.max(Number.EPSILON,finiteOption(options.tolerance,35,"tolerance"));
    const [targetRed,targetGreen,targetBlue]=hexToRgb(options.target??"#a020f0");
    const [pickedHue]=rgbToHsv(targetRed,targetGreen,targetBlue);
    const targetHue=mode==="hue"?285:pickedHue;
    const output=new Uint8ClampedArray(source.length);

    for(let index=0;index<source.length;index+=4){
      let red=source[index],green=source[index+1],blue=source[index+2];
      const alpha=source[index+3];
      let mask=0;

      if(mode==="purple"){
        mask=Math.max(0,Math.min(red,blue)-green)/255;
      }else{
        const [hue,saturation,value]=rgbToHsv(red,green,blue);
        const hueScore=Math.max(0,1-angularDistance(hue,targetHue)/tolerance);
        mask=hueScore*saturation*value;
      }

      const removal=Math.min(1,(Math.pow(mask,gamma)+softness*mask)*strength);
      if(decontaminate>0&&removal>0){
        const purple=Math.max(0,Math.min(red,blue)-green);
        red=Math.max(0,red-purple*decontaminate);
        blue=Math.max(0,blue-purple*decontaminate);
      }

      output[index]=red;
      output[index+1]=green;
      output[index+2]=blue;
      output[index+3]=alpha*(1-removal);
    }

    return output;
  }

  return Object.freeze({hexToRgb,rgbToHsv,angularDistance,processPixels});
});
