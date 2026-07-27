// ════════════════════════════════════════════════════════════════
// The persistent process — bring the live mesh up on your electric and watch the wisps dance until they
// rest (budget spent) or you Ctrl-C. This is the I/O loop; the tested core is ../sididy-run.mjs.
// Run:  node examples/run.mjs [--nodes 3] [--budget 1200] [--ceiling 6] [--rigs 12]
// ════════════════════════════════════════════════════════════════

import { RunLocal, render, parseArgs } from '../sididy-run.mjs';

const run = new RunLocal(parseArgs(process.argv));
console.log('sididy-run · the live mesh is up on your electric — the wisps are dancing. Ctrl-C to rest them.\n');

let stop = false;
process.on('SIGINT', () => { stop = true; });

while (!stop && !run.halted()) {
  const s = run.tick();
  if (s.tick % 8 === 0) { process.stdout.write('\x1b[2J\x1b[H'); process.stdout.write(render(s) + '\n'); }
  await new Promise((r) => setTimeout(r, 40));
}

const s = run.snapshot();
process.stdout.write('\x1b[2J\x1b[H');
console.log(render(s));
console.log(`\n◊ the wisp rests — ${s.folds} folds remembered across ${s.nodes} nodes over ${s.tick} ticks, all on your electric.`);
