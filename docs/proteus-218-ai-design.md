# Proteus 218 AI Design Notes

The Proteus AI should feel like a rival commander with doctrine, not a hidden-stat machine.

## AI layers

### 1. Strategic planner

Chooses broad objective:

- Secure crossing
- Defend capital
- Expand to resource site
- Raid supply road
- Prepare siege
- Recover economy
- Force decisive battle

Inputs:

- Civ identity
- Drought severity
- Known enemy army composition
- City shortages
- Map control
- Current victory pressure

### 2. Governor planner

Chooses city policies and projects:

- Bread First during population/food crisis
- Riverworks during water crisis
- War Foundries before timing push
- Road Mandate when supply is exposed
- Quiet Hand after conquest
- Emergency Levy only under threat or rush strategy

### 3. Army composer

Builds armies based on doctrine and scouted enemy:

- Aurelian: balanced shield/spear core with engineers.
- Veyr: cavalry/skirmisher tempo with limited engineers when siege needed.
- Kharu: spears/shields/logistics with late siege.

### 4. Tactical evaluator

Scores commands using:

- Terrain advantage
- Counter matchups
- Cohesion and morale
- Supply risk
- Commander safety
- Objective value
- Retreat paths
- Siege protection

### 5. Explanation layer

After a battle or match, the AI should help teach:

- “The enemy won because it held the crossing with spears before your cavalry arrived.”
- “Your siege cart was abandoned after the road was raided.”
- “You over-recruited during a water shortage, causing order collapse.”

## Difficulty bands

### Learner

- Slower reactions.
- Announces obvious threats.
- Avoids multi-front traps.
- No hidden bonuses.

### Balanced

- Legal deterministic decisions.
- Uses terrain and counters competently.
- No hidden bonuses.

### Veteran

- Better scouting memory.
- Stronger target selection.
- More decisive timing pushes.
- Still no resource cheating by default.

### Ruthless

- Near-optimal priorities.
- May use transparent handicaps if enabled.
- Punishes exposed roads and bad compositions.

## Personality examples

### Aurelian commander: Magistrate Varro

- Prefers secure roads and balanced armies.
- Takes crossings methodically.
- Weakness: slow to pivot after road disruption.

### Veyr commander: Sava of the Dust Mane

- Prefers raids, cavalry pressure, and encirclement.
- Avoids fortified spears unless desperate.
- Weakness: underinvests in siege if early raids succeed.

### Kharu commander: Ledger-Captain Nemet

- Prefers defensive water security and counterattack.
- Punishes overextension.
- Weakness: can concede too much map early.

## AI test requirements

- Same seed and same visible state should produce same decision.
- AI should never issue impossible commands.
- AI should not charge cavalry into braced spears on balanced difficulty unless no better option exists.
- AI should attempt total victory, not endless harassment.
- AI should react to water and supply crises.
