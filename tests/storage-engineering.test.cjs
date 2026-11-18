const test = require('node:test');
const assert = require('node:assert/strict');
const {runScenario,isCandidature,seed} = require('../storage-engineering.js');

test('validator uses required keys, enums and discriminant',()=>{
  assert.equal(isCandidature(seed[0]),true);
  assert.equal(isCandidature({...seed[0],statut:'inconnu'}),false);
  assert.equal(isCandidature({...seed[0],contrat:'interdit'}),false);
  assert.equal(isCandidature({...seed[0],mode:'autre'}),false);
  assert.equal(isCandidature(null),false);
  assert.equal(isCandidature([]),false);
});
test('server reference remains stable during initial hydration',()=>{
  const t=runScenario('hydrate');
  assert.equal(t.frames[0].reference,'E0');
  assert.equal(t.frames[1].reference,'E0');
  assert.equal(t.frames[2].reference,'R1');
  assert.equal(t.frames[2].reads,1);
  assert.equal(t.frames[3].reference,'R1');
  assert.equal(t.final.notifications,0);
});
test('successful local save writes, notifies and uses new cache reference',()=>{
  const t=runScenario('save');
  assert.equal(t.final.cache[0].statut,'entretien');
  assert.deepEqual(t.final.cache,JSON.parse(t.final.durable));
  assert.equal(t.final.notifications,1);
  assert.equal(t.final.reference,'R2');
});
test('failed setItem does not rollback cache, but still notifies',()=>{
  const t=runScenario('fail');
  assert.equal(t.final.cache[0].statut,'entretien');
  assert.equal(JSON.parse(t.final.durable)[0].statut,'envoyee');
  assert.equal(t.final.notifications,1);
  assert.match(t.final.error,/QuotaExceeded/);
});
test('external storage event invalidates and rereads snapshot',()=>{
  const t=runScenario('remote');
  assert.equal(t.final.cache[1].statut,'relancee');
  assert.equal(t.final.reads,2);
  assert.equal(t.final.notifications,1);
  assert.equal(t.final.reference,'R2');
  assert.equal(t.frames.find(f=>f.title==='Événement storage reçu').hasHydrated,false);
});
test('corrupt JSON returns empty cache without changing durable raw string',()=>{
  const t=runScenario('broken');
  assert.deepEqual(t.final.cache,[]);
  assert.equal(t.final.durable,'{JSON cassé');
  assert.match(t.final.error,/JSON.parse/);
});
test('filter discards invalid record but does not rewrite durable data',()=>{
  const t=runScenario('invalid');
  assert.equal(t.final.cache.length,2);
  assert.equal(JSON.parse(t.final.durable).length,3);
});
test('input data seed is not mutated across independent scenarios',()=>{
  runScenario('save');runScenario('remote');
  assert.equal(seed[0].statut,'envoyee');
  assert.equal(seed[1].statut,'a_preparer');
});
