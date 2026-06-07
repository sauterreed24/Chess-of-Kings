# Proteus 218 Codex Issue Prompts

Use these prompts as focused Goal Mode tasks. Each task should produce a small PR with tests and a clear summary.

## 1. Prototype data substrate

Add `src/proteus/` with typed data contracts for the Proteus 218 prototype. Include civilizations, resources, unit classes, terrain, cities, armies, map regions, commands, and match state. Add the first three civilizations and seven initial unit classes. Add integrity tests. Do not replace the current Calculus of Kings game flow.

## 2. Deterministic balanced duel map

Implement a seedable land-only map generator with river spine, crossings, starts, city sites, resources, roads, and terrain tags. Add a fairness validator and tests across many seeds. Include a minimal accessible map summary UI.

## 3. Governor economy simulation

Implement city economy state and governor policies so the player sets priorities instead of controlling workers. Include resource ticks, bottleneck explanations, crisis handling, and tests for deterministic tradeoffs.

## 4. Formation combat resolver

Implement deterministic formation combat with unit counters, morale, cohesion, terrain, command stances, and non-gory outcome logs. Add tests demonstrating counterplay and terrain impact.

## 5. Total-victory duel and basic AI

Add total-victory resolution and a basic AI that can choose city policy, army composition, targets, and tactical commands without hidden cheating on normal difficulty. Add deterministic tests and a victory/defeat explanation panel.

## 6. Story prologue

Add a Proteus story prologue around the first treaty breach at a river crossing. Teach scouting, governor policy, formation command, crossings, and total victory. Keep all sides morally defensible and avoid gore.

## 7. Progression trees and replayability

Add the first civic, military doctrine, engineering, and civilization legacy upgrades. Focus on playstyle-changing choices, prerequisites, pros/cons, and deterministic effects. Add tests for unlock validity.

## 8. UX, save, and performance polish

Add touch-first command cards or radial controls, strategic overlays, reduced-motion-safe animations, save/load for duel seeds, and bundle/performance tests. Keep dependencies lean.
