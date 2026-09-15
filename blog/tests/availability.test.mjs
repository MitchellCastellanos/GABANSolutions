import { test } from "node:test";
import assert from "node:assert/strict";
import { createPublishedReader } from "../lib/published.mjs";
import snapshot from "../data/published.json" with { type: "json" };
import index from "../../api/blog/index.js";
import article from "../../api/blog/[...segments].js";
import sitemap from "../../api/blog-sitemap.xml.js";

function response() {
  return { headers: {}, statusCode: 200, body: "", setHeader(k,v) { this.headers[k] = v; return this; }, status(n) { this.statusCode=n;return this; }, end(body) {this.body=body;return this;}, json(body) {this.body=body;return this;} };
}

test("monthly quota errors preserve the backup and suppress repeated/concurrent calls", async () => {
  let calls=0, time=100;
  const read=createPublishedReader({ now:()=>time, read:async()=>{calls++;throw new Error("429 PUBLIC_API_BILLING_LIMIT_EXCEEDED");} });
  const results=await Promise.all(Array.from({length:10},()=>read()));
  assert.equal(calls,1);
  assert.equal(results[0].records.length,12);
  assert.equal(results[0].stale,true);
  await read(); assert.equal(calls,1);
  time+=3600001;await read();assert.equal(calls,2);
});

test("recovery replaces stale content, including removals and an empty publication list", async () => {
  let time=100, fail=false, fresh=[snapshot.records[0]];
  const read=createPublishedReader({now:()=>time,read:async()=>{if(fail)throw new Error('offline');return fresh;}});
  assert.equal((await read()).records.length,1);
  time+=3600001;fail=true;assert.equal((await read()).records.length,1);
  time+=3600001;fail=false;fresh=[];
  assert.deepEqual(await read(),{records:[],stale:false});
});

test("cold start without Airtable serves all published pages and sitemap, with zero view writes", async () => {
  const original=globalThis.fetch;
  let calls=0;
  process.env.AIRTABLE_API_KEY='test';process.env.AIRTABLE_BASE_ID='test';
  globalThis.fetch=async()=>{calls++;return {ok:false,status:429,text:async()=>'{"error":"PUBLIC_API_BILLING_LIMIT_EXCEEDED"}'};};
  try {
    const listing=response();await index({method:'GET'},listing);
    assert.equal(listing.statusCode,200);
    assert.match(listing.headers['Cache-Control'],/s-maxage=3600/);
    for(const record of snapshot.records) {
      assert.equal(record.fields.Status,'published');
      const slug=record.fields.Slug;
      assert.ok(listing.body.includes(slug));
      const res=response();await article({method:'GET',query:{'...segments':slug},headers:{}},res);
      assert.equal(res.statusCode,200);assert.ok(res.body.includes(record.fields['Body HTML']));
    }
    const xml=response();await sitemap({method:'GET'},xml);
    assert.equal(xml.statusCode,200);assert.equal((xml.body.match(/<loc>/g)||[]).length,12);
    const missing=response();await article({method:'GET',query:{segments:'missing'},headers:{}},missing);
    assert.equal(missing.statusCode,503);assert.equal(missing.headers['Cache-Control'],'no-store');
    assert.equal(calls,1);
  } finally {globalThis.fetch=original;}
});
