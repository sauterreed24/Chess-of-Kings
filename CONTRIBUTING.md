# Contributing

Thank you for considering a contribution to The Calculus of Kings. The
project is solo-authored and intentionally small; that means the bar
for contributions is "fits the existing voice and ships green," not
"matches a 50-page style guide."

## Ground rules

1. **Keep the build green.** `npm run quality:gate` is the required
   deterministic release gate before you open a PR. It runs lint,
   typecheck, the serialized deterministic Vitest suite, UI smoke,
   production build, GitHub Pages path assertions (`assert:pages-build`),
   and the bundle gzip report. CI and GitHub Pages both use this gate.
   A separate optional `e2e-smoke` job runs `npm run test:e2e`
   (Playwright) on `main`.
2. **Add tests for every change.** New behavior gets a unit, property,
   or DOM test; new save fields get a migration test; new UI surfaces
   get a smoke mount test.
3. **Don't break the save format.** `SaveData.version === 3`. If you
   need to evolve it, add a forward migration in
   `src/app/storage*.ts` and a fixture-load test that asserts older
   saves still hydrate.
4. **No new runtime dependencies** unless absolutely necessary. The
   project ships with one (`chess.js`) and intends to keep it that
   way. Justify the addition in the commit message and the README if
   you add another.
5. **Accessibility is additive.** Roving tabindex, ARIA, focus-visible,
   reduced-motion, and the live announcer are part of the product.
   Improvements welcome; regressions blocked.
6. **Voice consistency.** The project reads like one author wrote it
   over a long stretch. Match the existing tone in dialogue, codex
   entries, and the README. Bias toward concrete, prosaic language.

## Repository structure

See [`src/ARCHITECTURE.md`](./src/ARCHITECTURE.md) for the directory
map, data-flow diagram, and a "where do I add X?" recipe table.

## Coding standards

- TypeScript strict; ESLint with `--max-warnings 0`.
- Prefer named const objects + union types over enums.
- No `as any` or `as unknown` in production code (test files reaching
  into private state for assertions are the only exception).
- Filenames camelCase; types PascalCase; SCREAMING_SNAKE only for
  true constants.
- Co-locate tests next to the file they test (`foo.ts` →
  `foo.test.ts`).
- Comments should explain non-obvious intent, trade-offs, or
  constraints. Avoid narration of the code.

## Commit style

Conventional Commits are preferred:

```
feat(scope): <imperative one-line summary>
fix(scope): ...
refactor(scope): ...
test: ...
docs(scope): ...
a11y: ...
perf(scope): ...
```

Use the body to explain *why* and to list deferred items honestly. The
recent maximum-effort commits in `git log` are reasonable templates.

## Pull requests

- One pass = one PR if you can. Smaller is better.
- Paste the final lines of the four gate commands into the PR body.
- Call out any deferred items by name; don't ship them as TODO
  comments.
- Don't push to `main` directly. The maintainer merges PRs with
  squash + a hand-edited subject when needed.

## What we'd love help with

See the shipped **Pass 6** plan: [`docs/PASS6_CONTINUITY_MAX_EFFORT_PLAN.md`](docs/PASS6_CONTINUITY_MAX_EFFORT_PLAN.md) and the playtest checklist [`docs/PASS6_PLAYTEST_CHECKLIST.md`](docs/PASS6_PLAYTEST_CHECKLIST.md).

Current focus (next content / polish):
- Remaining Wikipedia silhouettes (bishop, queen); contrast / accessibility hardening
- Contrast / accessibility hardening and mobile viewport sweeps
- Native TestFlight / Play Internal pipeline (environment-dependent)

Earlier architecture waves (Pass 4–5 GameFlow seams + AI worker) are complete — see [`docs/PASS4_GAMEFLOW_AI_MAX_EFFORT_PLAN.md`](docs/PASS4_GAMEFLOW_AI_MAX_EFFORT_PLAN.md).

## Reporting issues

Open an issue on GitHub with:

- Steps to reproduce.
- Browser / OS / device, including the iPhone 13 Pro Max if relevant.
- Screenshot or short screen-recording when the bug is visual.
- Console output if the bug is JavaScript-thrown.

If you suspect a save-corruption bug, please attach the contents of
`localStorage['calculus-of-kings-progress-v3']` (it is local, has no
PII, and is the most useful thing for reproduction).

## License

Contributions are accepted under the project's existing MIT license
(see [`LICENSE`](./LICENSE)).
