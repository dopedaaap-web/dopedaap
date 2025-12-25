import { RuleFired, YIntent, YIntentSection, XSignals } from "./types";

export const RULESET_VERSION = "0.1.0";

const section = (
  headline: string,
  doList: string[],
  dontList: string[]
): YIntentSection => ({
  headline,
  do: doList,
  dont: dontList
});

export const BASE_INTENT: YIntent = {
  harmony: section(
    "Keep harmony supportive and centered",
    ["Use stable tonal centers", "Reserve shifts for impact"],
    ["Over-modulate", "Mask the vocal with dense chords"]
  ),
  rhythm: section(
    "Let the lyric set the pulse",
    ["Anchor the groove", "Leave space for phrasing"],
    ["Crowd every bar", "Overcomplicate fills"]
  ),
  dynamics: section(
    "Shape intensity in gradual arcs",
    ["Build in stages", "Use contrast between sections"],
    ["Flatten levels", "Jump to full intensity too early"]
  ),
  texture: section(
    "Favor clarity over saturation",
    ["Blend supportive layers", "Use subtle color"],
    ["Overstack competing tones", "Use harsh top-end"]
  ),
  space: section(
    "Keep a focused spatial field",
    ["Use controlled ambience", "Reserve width for hooks"],
    ["Wash every line", "Pan everything wide"]
  ),
  arrangement: section(
    "Add elements with intention",
    ["Layer progressively", "Use dropouts for contrast"],
    ["Reveal everything at once", "Ignore transitions"]
  ),
  register: section(
    "Place the vocal in a stable register",
    ["Hold the core register", "Lift selectively"],
    ["Shift register constantly", "Overlap conflicting ranges"]
  ),
  tension: section(
    "Use tension to support the narrative",
    ["Delay release", "Create subtle push-pull"],
    ["Resolve too soon", "Overload with dramatic lifts"]
  )
};

export type RuleDefinition = {
  id: string;
  name: string;
  priority: RuleFired["priority"];
  status: RuleFired["status"];
  when: (x: XSignals) => boolean;
  apply: (intent: YIntent) => YIntent;
  because: string;
  prevents: string;
  tradeoff: string;
};

export const RULES: RuleDefinition[] = [
  {
    id: "density-cap",
    name: "Cap density to protect clarity",
    priority: 1,
    status: "capped",
    when: (x) => x.density === "high",
    apply: (intent) => ({
      ...intent,
      harmony: {
        ...intent.harmony,
        headline: "Keep harmony sparse and supportive",
        do: [...intent.harmony.do, "Limit chord changes per phrase"],
        dont: [...intent.harmony.dont, "Add busy inner movement"]
      },
      arrangement: {
        ...intent.arrangement,
        headline: "Reduce layers to keep focus",
        do: [...intent.arrangement.do, "Mute secondary motifs"],
        dont: [...intent.arrangement.dont, "Stack dense counterlines"]
      }
    }),
    because: "High word density needs more space around the vocal.",
    prevents: "Overcrowding the mix with harmonic motion.",
    tradeoff: "Less harmonic drama in exchange for clarity."
  },
  {
    id: "repetition-hook",
    name: "Repetition strengthens hook focus",
    priority: 2,
    status: "applied",
    when: (x) => x.repetition === "high",
    apply: (intent) => ({
      ...intent,
      rhythm: {
        ...intent.rhythm,
        headline: "Reinforce the hook with steady pulse",
        do: [...intent.rhythm.do, "Keep chorus groove consistent"],
        dont: [...intent.rhythm.dont, "Overcomplicate the hook rhythm"]
      },
      arrangement: {
        ...intent.arrangement,
        do: [...intent.arrangement.do, "Introduce a clear hook marker"],
        dont: [...intent.arrangement.dont, "Bury the chorus theme"]
      }
    }),
    because: "High repetition suggests the hook needs an obvious anchor.",
    prevents: "Listeners missing the main refrain.",
    tradeoff: "Less rhythmic variation in exchange for memorability."
  },
  {
    id: "slow-pace",
    name: "Slow pace needs spacious groove",
    priority: 3,
    status: "applied",
    when: (x) => x.pace === "slow",
    apply: (intent) => ({
      ...intent,
      rhythm: {
        ...intent.rhythm,
        headline: "Let slow phrasing breathe",
        do: [...intent.rhythm.do, "Use longer rests"],
        dont: [...intent.rhythm.dont, "Force busy percussion"]
      },
      space: {
        ...intent.space,
        do: [...intent.space.do, "Use controlled tails"],
        dont: [...intent.space.dont, "Clamp everything dry"]
      }
    }),
    because: "Slow pacing benefits from breathing room.",
    prevents: "Rushed delivery that conflicts with the lyric cadence.",
    tradeoff: "Sparser rhythmic motion in exchange for weight."
  },
  {
    id: "fast-pace",
    name: "Fast pace needs rhythmic discipline",
    priority: 2,
    status: "applied",
    when: (x) => x.pace === "fast",
    apply: (intent) => ({
      ...intent,
      rhythm: {
        ...intent.rhythm,
        headline: "Keep fast phrasing locked",
        do: [...intent.rhythm.do, "Use tight subdivisions"],
        dont: [...intent.rhythm.dont, "Let tempo drift"]
      },
      dynamics: {
        ...intent.dynamics,
        do: [...intent.dynamics.do, "Control peak transients"],
        dont: [...intent.dynamics.dont, "Over-compress the vocal"]
      }
    }),
    because: "Fast lines need precise rhythmic anchoring.",
    prevents: "Loss of intelligibility during rapid sections.",
    tradeoff: "Less dynamic swing in exchange for clarity."
  },
  {
    id: "high-volatility",
    name: "Volatility calls for restrained resolution",
    priority: 1,
    status: "blocked",
    when: (x) => x.volatility === "high",
    apply: (intent) => ({
      ...intent,
      tension: {
        ...intent.tension,
        headline: "Keep tension unresolved longer",
        do: [...intent.tension.do, "Use suspended tones"],
        dont: [...intent.tension.dont, "Offer clean closure too early"]
      },
      dynamics: {
        ...intent.dynamics,
        do: [...intent.dynamics.do, "Resist full release"],
        dont: [...intent.dynamics.dont, "Spike intensity abruptly"]
      }
    }),
    because: "High volatility indicates abrupt shifts that benefit from control.",
    prevents: "A tidy resolution that undercuts the lyric tension.",
    tradeoff: "Reduced closure in favor of lingering friction."
  },
  {
    id: "dark-sentiment",
    name: "Dark sentiment delays resolution",
    priority: 2,
    status: "applied",
    when: (x) => x.sentiment === "dark",
    apply: (intent) => ({
      ...intent,
      harmony: {
        ...intent.harmony,
        headline: "Lean into minor or ambiguous harmony",
        do: [...intent.harmony.do, "Use modal colors"],
        dont: [...intent.harmony.dont, "Use triumphant lifts"]
      },
      tension: {
        ...intent.tension,
        do: [...intent.tension.do, "Delay resolution"],
        dont: [...intent.tension.dont, "Resolve to bright cadences"]
      }
    }),
    because: "Dark language suggests unresolved emotional weight.",
    prevents: "An overly bright arc that conflicts with the lyric.",
    tradeoff: "Less immediate uplift in exchange for authenticity."
  },
  {
    id: "bright-sentiment",
    name: "Bright sentiment supports lift",
    priority: 3,
    status: "applied",
    when: (x) => x.sentiment === "bright",
    apply: (intent) => ({
      ...intent,
      dynamics: {
        ...intent.dynamics,
        headline: "Allow a gentle lift in energy",
        do: [...intent.dynamics.do, "Open the chorus gradually"],
        dont: [...intent.dynamics.dont, "Stay flat throughout"]
      },
      space: {
        ...intent.space,
        do: [...intent.space.do, "Let the hook breathe wider"],
        dont: [...intent.space.dont, "Collapse the stereo field"]
      }
    }),
    because: "Bright sentiment implies openness and lift.",
    prevents: "A closed-in mix that feels muted.",
    tradeoff: "More exposure in exchange for glow."
  },
  {
    id: "fragmented-narrative",
    name: "Fragmented narrative needs anchor",
    priority: 2,
    status: "applied",
    when: (x) => x.narrative === "fragmented",
    apply: (intent) => ({
      ...intent,
      arrangement: {
        ...intent.arrangement,
        headline: "Keep arrangement predictable",
        do: [...intent.arrangement.do, "Repeat a motif"],
        dont: [...intent.arrangement.dont, "Introduce constant new themes"]
      }
    }),
    because: "Fragmented storytelling benefits from a musical anchor.",
    prevents: "Listener disorientation across sections.",
    tradeoff: "Less narrative surprise in exchange for cohesion."
  },
  {
    id: "extended-structure",
    name: "Extended structure needs pacing",
    priority: 4,
    status: "applied",
    when: (x) => x.structure === "extended",
    apply: (intent) => ({
      ...intent,
      arrangement: {
        ...intent.arrangement,
        do: [...intent.arrangement.do, "Plan sectional escalation"],
        dont: [...intent.arrangement.dont, "Peak too early"]
      },
      dynamics: {
        ...intent.dynamics,
        do: [...intent.dynamics.do, "Stage multiple lifts"],
        dont: [...intent.dynamics.dont, "Use a single huge drop"]
      }
    }),
    because: "Longer structures require pacing across sections.",
    prevents: "Running out of energy before the end.",
    tradeoff: "More gradual growth in exchange for endurance."
  },
  {
    id: "high-register",
    name: "High register needs support",
    priority: 5,
    status: "applied",
    when: (x) => x.register === "high",
    apply: (intent) => ({
      ...intent,
      register: {
        ...intent.register,
        headline: "Support the higher register",
        do: [...intent.register.do, "Clear the midrange"],
        dont: [...intent.register.dont, "Compete in the same band"]
      },
      texture: {
        ...intent.texture,
        do: [...intent.texture.do, "Use softer textures"],
        dont: [...intent.texture.dont, "Add harsh brightness"]
      }
    }),
    because: "High register vocals need room to shine.",
    prevents: "Harshness or masking in the upper band.",
    tradeoff: "Less aggressive texture in exchange for clarity."
  }
];
