/* SPDX-License-Identifier: AGPL-3.0-only */
"use strict";

const test=require("node:test");
const assert=require("node:assert/strict");
const {hexToRgb,rgbToHsv,angularDistance,processPixels}=require("../chromakey.js");

const pixel=(rgba,options)=>Array.from(processPixels(new Uint8ClampedArray(rgba),options));

test("converts hex colors and primary hues",()=>{
  assert.deepEqual(hexToRgb("#a020f0"),[160,32,240]);
  assert.deepEqual(rgbToHsv(255,0,0),[0,1,1]);
  assert.deepEqual(rgbToHsv(0,255,0),[120,1,1]);
  assert.deepEqual(rgbToHsv(0,0,255),[240,1,1]);
});

test("uses the shortest angular hue distance",()=>{
  assert.equal(angularDistance(350,10),20);
  assert.equal(angularDistance(10,350),20);
  assert.equal(angularDistance(45,225),180);
});

test("zero strength leaves color and alpha untouched",()=>{
  const source=[200,50,200,180];
  assert.deepEqual(pixel(source,{
    mode:"purple",
    strength:0,
    softness:1,
    decontaminate:1,
  }),source);
});

test("fully removes a strong purple-formula match",()=>{
  assert.deepEqual(pixel([255,0,255,255],{
    mode:"purple",
    strength:1,
    softness:0,
    decontaminate:0,
  }),[255,0,255,0]);
});

test("preserves pixels outside the hue tolerance",()=>{
  const source=[255,0,0,128];
  assert.deepEqual(pixel(source,{
    mode:"hue",
    tolerance:35,
    decontaminate:0,
  }),source);
});

test("picked mode removes the selected hue",()=>{
  assert.deepEqual(pixel([0,255,0,255],{
    mode:"picked",
    target:"#00ff00",
    softness:0,
    decontaminate:0,
  }),[0,255,0,0]);
});

test("processing does not mutate its source buffer",()=>{
  const source=new Uint8ClampedArray([255,0,255,255]);
  const before=source.slice();
  processPixels(source,{mode:"purple"});
  assert.deepEqual(source,before);
});

test("rejects malformed pixel buffers and colors",()=>{
  assert.throws(()=>processPixels(new Uint8ClampedArray([0,0,0])),/RGBA/);
  assert.throws(()=>hexToRgb("purple"),/six-digit hex color/);
});
