/* SPDX-License-Identifier: AGPL-3.0-only */
"use strict";

const test=require("node:test");
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const html=read("index.html");

test("document IDs are unique and controls have labels",()=>{
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(new Set(ids).size,ids.length,"duplicate HTML ID");

  const controls=[...html.matchAll(/<(?:input|select)\b[^>]*\bid="([^"]+)"/g)].map(match=>match[1]);
  const labels=new Set([...html.matchAll(/<label\b[^>]*\bfor="([^"]+)"/g)].map(match=>match[1]));
  assert.deepEqual(controls.filter(id=>!labels.has(id)),[]);
});

test("local script references resolve",()=>{
  const scripts=[...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(match=>match[1]);
  assert.ok(scripts.length>0,"no external processing script found");
  for(const source of scripts){
    assert.ok(!source.includes("://"),`expected a local script, received ${source}`);
    assert.ok(fs.existsSync(path.join(root,source)),`missing script: ${source}`);
  }
});

test("license surfaces consistently select AGPL-3.0-only",()=>{
  const packageMetadata=JSON.parse(read("package.json"));
  const readme=read("README.md");
  const license=fs.readFileSync(path.join(root,"LICENSE"));
  const hash=crypto.createHash("sha256").update(license).digest("hex");

  assert.equal(packageMetadata.license,"AGPL-3.0-only");
  assert.match(html,/SPDX-License-Identifier: AGPL-3\.0-only/);
  assert.match(readme,/`AGPL-3\.0-only`/);
  assert.equal(hash,"0d96a4ff68ad6d4b6f1f30f713b18d5184912ba8dd389f86aa7710db079abcb0");
});

test("legacy custom-license claims do not return",()=>{
  const repositoryText=[html,read("README.md"),read("LICENSE")].join("\n");
  for(const phrase of ["Attribution Required","voids the license","remedies pursued under Nebraska law"]){
    assert.ok(!repositoryText.includes(phrase),`legacy phrase found: ${phrase}`);
  }
});
