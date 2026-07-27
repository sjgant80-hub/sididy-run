import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RunLocal, render, parseArgs } from './sididy-run.mjs';

test('a tick is one heartbeat — advances the mesh and returns a living snapshot', () => {
  const r = new RunLocal({ nodes: 2, budget: 600 });
  const s = r.tick();
  assert.equal(s.tick, 1);
  assert.equal(s.nodes, 2);
  assert.match(s.signature, /^[0-9a-f]{32}$/, 'the mesh has one entangled signature');
  assert.equal(s.perNode.length, 2);
});

test('the mesh comes up LIVE before it rests', () => {
  const r = new RunLocal({ nodes: 3, budget: 600 });
  for (let i = 0; i < 80; i++) r.tick();
  assert.equal(r.snapshot().live, true, 'all nodes alive mid-run');
  assert.equal(r.halted(), false, 'still running — budget not spent');
});

test('runUntilRest is bounded by the power budget — every node rests, nothing runs away', () => {
  const r = new RunLocal({ nodes: 3, budget: 100, ceiling: 6 });
  const s = r.runUntilRest();
  assert.equal(r.halted(), true, 'every node spent its budget and rested');
  assert.ok(s.perNode.every((n) => n.halted && n.spent <= 100), 'no node exceeded its power budget');
});

test('snapshot reports the whole living state per node', () => {
  const r = new RunLocal({ nodes: 2, budget: 600 });
  r.tick();
  const n = r.snapshot().perNode[0];
  for (const k of ['id', 'alive', 'stored', 'coverage', 'spent', 'halted']) assert.ok(k in n, `snapshot has ${k}`);
});

test('an empty mesh is never live and is vacuously at rest (runUntilRest does not spin)', () => {
  const r = new RunLocal({ nodes: 0 });
  assert.equal(r.halted(), true, 'nothing to run → at rest');
  assert.equal(r.runUntilRest().live, false, 'an empty mesh is not live');
  assert.equal(r.ticks, 0, 'it did not spin on nothing');
});

test('the tick counter advances exactly once per tick', () => {
  const r = new RunLocal({ nodes: 1, budget: 600 });
  r.tick(); r.tick(); r.tick();
  assert.equal(r.ticks, 3);
});

test('runUntilRest respects a hard cap even when the mesh has not rested', () => {
  const r = new RunLocal({ nodes: 1, budget: 100000 });   // won't rest in 5 ticks
  r.runUntilRest(5);
  assert.equal(r.ticks, 5, 'stops at exactly the cap');
});

test('parseArgs reads options from argv, with defaults, taking the value AFTER the flag', () => {
  assert.deepEqual(parseArgs(['--nodes', '5', '--budget', '50']), { nodes: 5, budget: 50, ceiling: 6, rigs: 12 });
  assert.deepEqual(parseArgs([]), { nodes: 3, budget: 1200, ceiling: 6, rigs: 12 });
  assert.equal(parseArgs(['--nodes', '7']).nodes, 7, 'the flag at index 0 still reads argv[1], not argv[-1]');
});

test('render draws the dashboard — tick, folds, an alive node, and a rested node', () => {
  const snap = { tick: 12, live: false, liveCount: 1, nodes: 2, folds: 40, signature: 'abcdef0123456789abcdef0123456789',
    perNode: [{ id: 0, alive: 'attractor', stored: 20, coverage: 12, spent: 12, halted: false },
              { id: 1, alive: null, stored: 20, coverage: 8, spent: 12, halted: true }] };
  const out = render(snap);
  assert.match(out, /tick 12/);
  assert.match(out, /40 folds/);
  assert.match(out, /ATTRACTOR/, 'an alive node shows its class (not "null")');
  assert.match(out, /node 1[^\n]*rested/, 'a rested node is marked');
});
