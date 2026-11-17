const { test } = require('node:test');
const assert = require('node:assert/strict');
const { experiment } = require('../function-dynamics.js');
test('map returns B, replaces only the match, and retains other identities',()=>{
  const r=experiment('demo_002','entretien');
  assert.notStrictEqual(r.before,r.next);assert.equal(r.replaced,1);
  assert.strictEqual(r.before[0],r.next[0]);assert.strictEqual(r.before[2],r.next[2]);
  assert.strictEqual(r.next[1],r.argument);assert.notStrictEqual(r.before[1],r.next[1]);
  assert.equal(r.before[1].statut,'acceptee');assert.equal(r.next[1].statut,'entretien');
  assert.deepEqual(r.persisted,r.next);assert.strictEqual(r.cache,r.next);assert.equal(r.notifications,1);
});
test('absent id produces a new array and preserves every item',()=>{
  const r=experiment('missing','entretien');assert.equal(r.replaced,0);assert.notStrictEqual(r.before,r.next);
  r.before.forEach((c,i)=>assert.strictEqual(c,r.next[i]));assert.equal(r.notifications,1);
});
test('failed persistence retains old durable content, new cache and notification',()=>{
  const r=experiment('demo_002','entretien',true);assert.ok(r.error);assert.deepEqual(r.persisted,r.before);
  assert.notDeepEqual(r.cache,r.persisted);assert.equal(r.notifications,1);
});
test('duplicate IDs are both replaced by the same argument reference',()=>{
  const r=experiment('demo_002','refusee',false,true);assert.equal(r.replaced,2);
  assert.strictEqual(r.next[1],r.next[3]);assert.strictEqual(r.next[3],r.argument);
});
test('same status still changes object identity while content stays equal',()=>{
  const r=experiment('demo_002','acceptee',true);assert.equal(r.replaced,1);assert.notStrictEqual(r.before[1],r.next[1]);assert.deepEqual(r.cache,r.persisted);
});
test('failure with no ID match still notifies and content may agree',()=>{
  const r=experiment('missing','entretien',true);assert.ok(r.error);assert.equal(r.notifications,1);assert.deepEqual(r.cache,r.persisted);
});
