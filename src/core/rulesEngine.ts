import { EkkoResult, XSignals, YIntent } from "./types";
import { BASE_INTENT, RULES, RULESET_VERSION } from "./ruleset";

function cloneIntent(intent: YIntent): YIntent {
  return {
    harmony: { ...intent.harmony, do: [...intent.harmony.do], dont: [...intent.harmony.dont] },
    rhythm: { ...intent.rhythm, do: [...intent.rhythm.do], dont: [...intent.rhythm.dont] },
    dynamics: { ...intent.dynamics, do: [...intent.dynamics.do], dont: [...intent.dynamics.dont] },
    texture: { ...intent.texture, do: [...intent.texture.do], dont: [...intent.texture.dont] },
    space: { ...intent.space, do: [...intent.space.do], dont: [...intent.space.dont] },
    arrangement: {
      ...intent.arrangement,
      do: [...intent.arrangement.do],
      dont: [...intent.arrangement.dont]
    },
    register: { ...intent.register, do: [...intent.register.do], dont: [...intent.register.dont] },
    tension: { ...intent.tension, do: [...intent.tension.do], dont: [...intent.tension.dont] }
  };
}

export function applyRules(x: XSignals): EkkoResult {
  let intent = cloneIntent(BASE_INTENT);
  const fired = RULES.filter((rule) => rule.when(x))
    .sort((a, b) => a.priority - b.priority)
    .map((rule) => {
      intent = rule.apply(intent);
      return {
        id: rule.id,
        name: rule.name,
        status: rule.status,
        priority: rule.priority,
        because: rule.because,
        prevents: rule.prevents,
        tradeoff: rule.tradeoff
      };
    });

  return {
    x,
    y: intent,
    rules: fired,
    version: RULESET_VERSION
  };
}
