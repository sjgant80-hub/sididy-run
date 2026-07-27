# sididy-run — specification

## Purpose

The runtime layer — run-local: bring the whole estate up as one persistent, governed live mesh on your own electric. The wisps dance within a power budget, then rest clean.

## Contract

- **RunLocal** — part of the sididy-run public surface; deterministic, total (never throws).
- **default** — part of the sididy-run public surface; deterministic, total (never throws).

## Guarantees

- **Deterministic** — the same input yields the same output on any machine, any run.
- **Total** — hostile or malformed input returns a defined value, never an exception.
- **Zero-dependency** — no third-party runtime code inside the trust boundary.

## Verification

The suite exercises the public surface directly and is mutation-checked: a change to any guarded line makes a
test fail. konomify admits sididy-run only when both the structure rubric (acg-assessor) and the behaviour gate
(witness) pass.
