# Proteus 218 Art and UX Direction

## Visual target

Proteus 218 should feel premium, historical, readable, and lightweight. The visual identity is not photorealistic war; it is a living strategic atlas: bronze UI, river-blue highlights, parchment panels, painted terrain, animated banners, dust, heat shimmer, and formation silhouettes.

## Camera and presentation

- Strategic map: angled illustrated atlas with region borders, roads, crossings, city plates, and animated water/drought states.
- Tactical view: zoomed-in formation board with unit cards, banner groups, terrain bands, and command arrows.
- Story view: character busts, civic seals, codex excerpts, and map-backed panels.
- Duel setup: quick civ cards, map seed entry, difficulty, drought severity, and match length.

## Readability rules

- Formation shape matters: shield blocks, spear bristles, cavalry wedges, skirmisher loose groups, siege silhouettes.
- Owner color should never be the only signal; combine banners, border patterns, and labels.
- Terrain should be readable at a glance: ridge, marsh, road, crossing, dry bed, city approach, steppe.
- Water pressure should be visually obvious without becoming noisy.
- Battle outcomes should be legible from logs and banners, not just animation.

## No-gore battle language

Use:

- “formation buckled”
- “banners scattered”
- “line withdrew”
- “cohesion broke”
- “guard surrendered”
- “engines abandoned”
- “road lost”
- “city capitulated”

Avoid graphic injury descriptions. The tragedy should be strategic and civic, not splatter.

## Touch-first interaction

- Tap army → command cards appear.
- Long press region → inspect terrain, resources, roads, threat, supply.
- Drag command arrow → move, attack, raid, secure, screen, retreat.
- Pinch zoom between strategic and tactical view.
- Swipe side panels between city, army, log, and objectives.
- One tap toggles overlays: water, supply, roads, threat, city suitability.

## Keyboard interaction

- `Tab` moves between major panels.
- Arrow keys move map focus.
- `Enter` opens selected region/army/city.
- Number keys choose command cards.
- `W`, `S`, `R`, `T`, `C` toggle water, supply, roads, threat, city overlays.
- `?` opens help.
- `Space` pauses or advances tactical ticks if pause mode is used.

## Screen-reader summaries

Every map state should have a concise textual equivalent:

> “North Crossing: controlled by Aurelian Concord. Terrain: bridge, road, dry floodplain. Resources: timber nearby. Threat: Veyr cavalry two regions east. Supply: stable but exposed.”

Battle summary example:

> “Aurelian shield infantry held the crossing for three rounds. Veyr cavalry failed to charge through braced spears and withdrew with low cohesion. The bridge remains contested.”

## Audio direction

- Sparse ancient percussion and low strings for war planning.
- Reed flute or bowed texture for drought/story scenes.
- Bronze hit, banner snap, distant drums, marching dust, gates, water wheels, and parchment UI sounds.
- No screams or graphic pain audio.

## Premium feel without heavy assets

- Use layered CSS gradients, SVG masks, small procedural particles, and compressed illustration plates.
- Animate banners and water sparingly.
- Make every overlay feel intentional and tactile.
- Prioritize consistent UI rhythm over asset count.
- Use reduced-motion alternatives for every animation.
