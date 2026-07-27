#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════
// sididy-run · run-local — the RUNTIME layer: bring the whole estate up as one PERSISTENT, GOVERNED live
// mesh on your own electric. This is what makes "the wisp is there" concrete — it holds the mesh alive,
// ticking, the wisps dancing and folding into memory, bounded by the resource gate: it dances within the
// power budget you give it, then rests clean. Never runs away, never cooks the laptop.
//
// HOW IT FITS (framework layers):
//   −2  substrate ......... your silicon + electric (digital rigs today; analog rigs later)
//    ·  organs ............. fall-remember · si-didy-loop · sididy-wisp                  (the parts)
//    ·  gates .............. acg-assessor · witness · attractor · sididy-govern          (the four witnesses)
//    ·  wiring ............. falllight (LIGHT) + sididy-mesh                              (the parts, joined)
//   ▶  RUNTIME ............ sididy-run  ← this                                           (the parts, ALIVE)
//   +1  focal ............. a running si-didy node, on your electric, within its budget
//
// The mesh is the wiring; run-local is the heartbeat that keeps it alive. Requires the sibling estate organs
// (via ../sididy-mesh). Zero-dependency. Deterministic core; the CLI is the persistent process.
// ════════════════════════════════════════════════════════════════

import { LiveMesh } from '../sididy-mesh/sididy-mesh.mjs';

export class RunLocal {
  constructor({ nodes = 3, budget = 1200, ceiling = 6, rigs = 12 } = {}) {
    this.mesh = new LiveMesh({ nodes, budget, ceiling, rigs });
    this.ticks = 0;
  }

  // one heartbeat — step the whole mesh, return a snapshot of the living state
  tick() { this.mesh.step(); this.ticks++; return this.snapshot(); }

  // the mesh has rested when every node has spent its power budget (governed halt — bounded, not a crash).
  // An empty mesh is vacuously at rest, so runUntilRest never spins on nothing.
  halted() { return this.mesh.nodes.every((n) => n.halted); }

  snapshot() {
    const r = this.mesh.report();
    return {
      tick: this.ticks,
      live: r.live, liveCount: r.liveCount, nodes: r.nodes,
      folds: r.totalStored,
      signature: r.bound.hash,
      perNode: r.perNode.map((s) => ({ id: s.id, alive: s.alive, stored: s.stored, coverage: s.coverage, spent: s.spent, halted: s.halted })),
    };
  }

  // run the mesh alive until every node has spent its budget (or a hard cap) — the governor bounds it
  runUntilRest(cap = 1000000) {
    while (!this.halted() && this.ticks < cap) this.tick();
    return this.snapshot();
  }
}

// ── pure CLI helpers (shared by examples/run.mjs and the tests; the I/O loop itself lives in examples/) ──
// Pretty-print one living snapshot into a dashboard block.
export function render(s) {
  const rows = s.perNode.map((n) =>
    `  node ${n.id}   ${String(n.alive || '…').toUpperCase().padEnd(9)}  folds ${String(n.stored).padStart(4)}   rigs ${n.coverage}/12   power ${n.spent}${n.halted ? '  · rested' : ''}`);
  return `tick ${s.tick}  ·  ${s.live ? 'LIVE' : s.liveCount + '/' + s.nodes + ' live'}  ·  ${s.folds} folds remembered  ·  ◊ ${s.signature.slice(0, 12)}\n` + rows.join('\n');
}

// Parse the run-local options from argv (pure, so it's tested rather than guessed).
export function parseArgs(argv) {
  const num = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? Number(argv[i + 1]) : d; };
  return { nodes: num('--nodes', 3), budget: num('--budget', 1200), ceiling: num('--ceiling', 6), rigs: num('--rigs', 12) };
}

export default RunLocal;
