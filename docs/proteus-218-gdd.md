# Proteus 218: Grand Strategy War Game Design

Working title: **Proteus 218: Crown of the Last River**  
Repository codename: **Proteus 218**  
Target experience: land-only, Roman-era-inspired war strategy with chess-like clarity, low-chore economy control, deep civilization asymmetry, and total-victory conquest.

## One-sentence pitch

A drought-stricken, realistic fictional world collapses from river-cooperation into multi-front total war, and the player must master formations, supply, city placement, doctrine trees, and civilization identity without being buried in villager micromanagement.

## Non-negotiable pillars

1. **Easy to pick up, hard to master.** New players can queue doctrine priorities and drag armies into readable formations; expert players can tune logistics, unit specialization, terrain traps, timing pushes, and multi-front pressure.
2. **Land-only warfare.** No naval or airborne units. Rivers, bridges, ferries, canals, cliffs, marshes, passes, roads, and drought beds are strategic terrain rather than transport minigames.
3. **Total victory only.** The main win state is conquest: collapse every rival command by taking capitals, breaking army cohesion, and cutting water/supply lifelines. No culture, science, score, or diplomacy victories.
4. **Low manual chores.** Population works through governor policies, labor pools, and visible bottlenecks. The player chooses priorities; the city executes them.
5. **Chess-like tactical legibility.** Every unit class has clear strengths, weaknesses, ranges, tempo costs, terrain interactions, morale effects, and counters.
6. **Morally complex story.** No faction is purely good or evil. The drought turns rational survival strategies into catastrophe-of-the-commons escalation.
7. **No gore.** Battles show formation breaks, shield splinters, dust, banners falling, exhaustion, capture, rout, and aftermath without graphic violence.
8. **Runs everywhere.** First production path should remain a lean TypeScript/Vite/PWA/Capacitor game, with rendering optimized for Surface Pro 5, iPhone-class devices, and Android.

## World premise

Proteus 218 is a smaller rocky planet with one supercontinent and no oceans. Most potable water comes from the **Aurel**, a colossal planetary river fed by polar meltfields, underground aquifers, and highland storm basins. The Aurel is wider than ancient empires, older than any capital, and effectively the planet's shared bloodstream.

For millennia, the river confederation prevented total war. Each civilization controlled a different climate corridor, crossing, basin, quarry, or floodplain, but all accepted shared river law because the alternative was famine. Their technology, education, architecture, roads, and military culture resemble an advanced Roman/Hellenistic age: disciplined infantry, engineering, roads, siege craft, academies, civic ritual, and tactical command.

The story begins when the **Long Withering** reduces snowmelt, shrinks tributaries, exposes old riverbeds, and turns upstream rationing into downstream panic. Every faction can justify its actions. Upstream states claim survival rights. Downstream states claim treaty theft. Highlanders claim they warned everyone. Desert kingdoms claim they learned scarcity first. The tragedy is that every rational short-term move worsens the global collapse.

## Core game loop

1. **Scout and read the board.** Discover water pressure, routes, city sites, choke points, enemy doctrine, and terrain risks.
2. **Set city priorities.** Governors allocate labor across food, waterworks, recruitment, roads, fortification, research, and recovery.
3. **Shape doctrine.** Choose civilization tree upgrades, commander traits, unit specializations, and economic reforms.
4. **Compose armies.** Build formation groups rather than babysitting individual soldiers.
5. **Attack, feint, or starve out.** Use terrain, logistics, morale, siege, raids, and timing windows.
6. **Exploit consequences.** Captured cities create supply strain, resistance, water obligations, and new front geometry.
7. **Win through total collapse.** Destroy the rival's ability to command, supply, reinforce, and hold capitals.

## Game modes

### Story mode: The Long Withering

A full campaign with honest ramp-up. Each chapter teaches one system through narrative pressure rather than tutorial popups.

- **Act I: River Law Cracks.** Small border interventions, ration disputes, bridge control, and limited formation battles.
- **Act II: The Tributary Wars.** Multi-front decisions, governor automation, supply lines, terrain penalties, and first faction-specific counters.
- **Act III: The Broken Compact.** Major powers commit to total war; siege, morale collapse, scorched roads, and refugee pressure appear.
- **Act IV: Crowns of Dust.** The player sees every civilization's argument. Final missions force brutal tradeoffs between speed, mercy, water access, and long-term stability.
- **Epilogue: The Last River.** The campaign ends with conquest, but the story judges the player's doctrine: stabilizer, tyrant, liberator, opportunist, or exhausted survivor. The victory is total, not necessarily clean.

### Duel mode: generated conquest skirmish

Jump in with any unlocked civilization on a balanced procedural map.

- 1v1, 1v1v1, 2v2, and four-front free-for-all.
- Deterministic seed sharing.
- Symmetric fairness by resource class, not identical terrain.
- Total-victory rules only.
- Short, standard, and marathon lengths.
- Optional draft: choose map biome, starting doctrine, commander, and drought severity.

## Map design

The map is a strategic board with readable regions rather than a cluttered simulation sandbox.

- **River spine:** central water artery, crossings, irrigation districts, exposed drought beds, and floodplain cities.
- **Highland shelves:** strong defensive terrain, ore, stone, slower roads, and water-source leverage.
- **Dry marches:** poor food, fast cavalry movement, ambush visibility penalties, and fragile supply.
- **Reed marshes:** movement disruption, skirmisher bonuses, disease/exhaustion risk, and hidden approaches.
- **Steppe corridors:** open maneuver, cavalry dominance, weak fortifications, and long supply exposure.
- **Urban belts:** dense roads, recruitment, workshops, unrest, and siege chokepoints.

Map generation must guarantee each start has food, buildable water access, defensible fallback terrain, at least two expansion options, and at least one meaningful vulnerability.

## Economy without chore micromanagement

The player does not drag villagers around. Cities use **labor pools** and **governor policies**.

### City resources

- **Water:** drinking, irrigation, sanitation, army supply, siege endurance.
- **Grain:** population growth, army upkeep, emergency reserves.
- **Timber:** buildings, shields, carts, palisades, siege engines.
- **Stone:** walls, roads, aqueducts, civic buildings.
- **Iron:** elite weapons, armor, siege fittings.
- **Civic Order:** morale, resistance control, recruitment quality, corruption resistance.
- **Command:** army cap, formation complexity, commander abilities.

### Governor policy examples

- **Bread First:** maximizes food and population recovery; weak recruitment tempo.
- **War Foundries:** accelerates arms and siege; increases water and order strain.
- **Riverworks:** improves water security and drought resilience; delays army timing.
- **Road Mandate:** improves logistics and reinforcement speed; vulnerable while building.
- **Quiet Hand:** reduces unrest after conquest; slower extraction.
- **Emergency Levy:** fast troops now, worse morale and economy later.

Manual play should mean changing policy, city specialization, queue priority, and emergency orders, not managing each worker.

## Warfare model

Combat is real-time-with-pause or fast tactical real time on a grid/region board. The UI should let players issue formation-level commands: hold ridge, shield advance, wheel left, feigned retreat, protect engines, pin center, raid road, deny crossing.

### Unit classes

- **Shield Infantry:** line holders; strong in formation and at crossings; weak to flank, exhaustion, and missiles over time.
- **Pike/Spear Infantry:** cavalry denial and bridge control; weak if disrupted or attacked from multiple angles.
- **Sword Infantry:** flexible assault and urban fighting; costly against braced spears or heavy missiles.
- **Skirmishers:** harassment, vision, anti-siege crew, marsh control; weak in sustained melee.
- **Archers/Slingers:** pressure and morale erosion; need screens and supply.
- **Cavalry:** scouting, flanks, pursuit, raids, tempo; weak in bad terrain and against prepared spears.
- **Engineers:** bridges, roads, fieldworks, saps, waterworks sabotage/repair; weak in direct combat.
- **Siege Engines:** city cracking, wall pressure, formation disruption; slow, supply-hungry, vulnerable.
- **Command Guard:** morale anchor and tactical ability carrier; losing it causes shock.
- **Auxiliaries:** civilization-specific irregulars that bend rules but require context to shine.

### Tactical counters

- Shield wall beats raw swords frontally, but loses to sustained missile pressure plus flank.
- Spears beat cavalry charges, but mobile infantry can pin and rotate around them.
- Skirmishers punish heavy units in bad terrain, but collapse if caught.
- Cavalry wins tempo and pursuit, but cannot solve fortified crossings alone.
- Siege beats walls, but loses to raids if roads are not secured.
- Engineers create options, but investing in them delays raw combat mass.

## Civilization roster

Each civilization has a regional logic, a powerful identity, and a built-in weakness.

| Civilization | Region | Strength | Weakness | Signature play |
| --- | --- | --- | --- | --- |
| **Aurelian Concord** | Central river cities | Roads, civic order, balanced legions | Predictable doctrine, expensive reforms | Flexible combined arms and fast reinforcement |
| **Veyr Steppe Clans** | Dry grass corridors | Cavalry tempo, raids, mobile supply | Weak sieges and walls | Encircle, starve, and break morale before decisive assault |
| **Kharu Basin League** | Desert reservoirs | Drought resilience, logistics, disciplined spears | Slow population growth | Outlast, fortify wells, punish overextension |
| **Thessari Academies** | Hill academies and observatories | Research, commanders, siege math | Fragile early economy | Tech timing, precise formations, superior engines |
| **Maro Reed Cities** | Marsh deltas and reed belts | Ambush, skirmishers, water control | Poor heavy cavalry and open-field staying power | Bleed enemies through marsh, strike supply, then swarm |
| **Durnic Ironholds** | Mountain quarries | Armor, fortresses, elite infantry | Slow expansion and poor farms | Hold passes, grind forward, win siege attrition |
| **Selene Orchard Principalities** | Temperate terraces | Food, morale, recovery, archers | Iron scarcity | Grow safely, field resilient armies, win long campaigns |
| **Oron Red Marches** | Badlands and salt roads | Cheap levies, shock infantry, intimidation | Order volatility and weak waterworks | Fast conquest, forced tempo, risky collapse pressure |
| **Ilyr Canal Wardens** | Canal-crossing districts | Engineers, bridges, irrigation, defensive mobility | High infrastructure dependency | Shape the battlefield with crossings and fieldworks |
| **Nadir Free Camps** | Displaced frontier cities | Adaptation, mercenary mix, salvage economy | No single elite identity | Counter-draft the enemy and improvise under scarcity |

Balance rule: no civilization gets a universal advantage. Every power must create a decision cost, map dependency, timing vulnerability, or counter-window.

## Progression and trees

Progression should be fun, experimental, and replayable without forcing grind.

### Four-layer tree system

1. **Civic tree:** governance, governors, order, water law, conquest integration.
2. **Military doctrine tree:** formations, unit unlocks, morale tools, army cap, commander commands.
3. **Engineering tree:** roads, bridges, aqueducts, siege, drought mitigation, fortifications.
4. **Civilization legacy tree:** unique faction mechanics that change how a civ solves problems.

Tree choices should be mutually tempting. Avoid generic +5% upgrades unless attached to a playstyle change. Good upgrade: “Shield infantry can lock shields while moving slowly, but command cooldowns increase.” Bad upgrade: “Swords do 3% more damage.”

## Commander and troop specialization

Armies gain identity through commanders and veteran formations.

- **Commander traits:** patient siege master, reckless charger, river engineer, morale reformer, counter-raider, supply tyrant.
- **Formation veterancy:** choose one specialization after battlefield proof: hold, assault, pursuit, anti-cavalry, siege escort, road guard, urban fighter.
- **Exhaustion and cohesion:** armies are not blobs of hit points. Bad marches, thirst, flank shock, leader loss, and broken roads degrade cohesion before destruction.
- **Rout and capture:** defeat is readable and non-gory. Units rout, surrender, scatter, or lose banners.

## AI design

AI should feel like a rival strategist, not a stat-cheating wall.

- **Economic planner:** chooses city policies based on drought, army goals, and front pressure.
- **Army composer:** builds counters based on scouting and civilization identity.
- **Tactical evaluator:** values terrain, flanks, crossing denial, siege protection, supply, and morale.
- **Campaign personality:** each rival has doctrine preferences, panic thresholds, and risk tolerance.
- **Transparency:** on lower difficulties, the UI explains why the AI move was dangerous after the fact. On higher difficulties, hints become briefer.

## User experience

- **Strategic overlay first:** water, supply, threat, roads, unrest, and buildable sites are single-key overlays.
- **Intent commands:** “secure crossing,” “raid supply,” “hold ridge,” “screen siege,” “pressure city,” rather than excessive click spam.
- **Autopause triggers:** army ambushed, city water crisis, wall breach, commander routed, enemy enters capital zone.
- **Touch-first UI:** large radial commands, formation cards, pinch zoom, one-tap overlays.
- **Controller/keyboard path:** every tactical command has keyboard access.
- **Readable battlefield:** silhouettes, banners, formation shapes, and terrain iconography matter more than visual clutter.

## Art and tone

AAA ambition with lean execution: painted strategy map, animated banners, parallax cities, stylized 2.5D formations, dust, heat shimmer, parchment UI, bronze and river-blue accents, orchestral/ancient percussion-inspired score. Avoid gore and photorealistic violence. Brutality comes from decisions, scarcity, reversals, and consequences.

## First vertical slice

The first playable slice should be small but honest:

- Three civilizations: Aurelian Concord, Veyr Steppe Clans, Kharu Basin League.
- One procedural duel map family: river-crossing basin with highland, steppe, and dry floodplain variants.
- Core resources: water, grain, timber, iron, civic order, command.
- Units: shield infantry, spears, skirmishers, cavalry, engineers, siege cart, command guard.
- Governor automation: three city policies plus emergency levy.
- Combat: formation movement, morale/cohesion, terrain modifiers, total-victory capture.
- AI: basic economy planner, army composer, tactical attack/defend/raid modes.
- Story: one prologue mission showing the first treaty breach without a villain.

## Definition of fun

A match is working when the player can lose and immediately understand the better idea: scout earlier, protect roads, take the crossing before drought season, punish cavalry with spears, avoid over-recruiting during a water crisis, or attack the enemy's logistics instead of their strongest city. Mastery should feel like solving a living chessboard under ecological pressure.
