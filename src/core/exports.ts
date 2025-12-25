import { EkkoResult } from "./types";

export function buildExports(result: EkkoResult) {
  const { x, y } = result;

  const intentBrief = `Structure: ${x.structure}, pace: ${x.pace}, density: ${x.density}. Keep harmony ${y.harmony.headline.toLowerCase()}. Focus on ${y.arrangement.headline.toLowerCase()}.`;

  const descriptiveGuidance = `Dynamics: ${y.dynamics.headline}. Rhythm: ${y.rhythm.headline}. Texture stays ${y.texture.headline.toLowerCase()}.`;

  const producerNotes = `Do: ${y.harmony.do[0]}; ${y.rhythm.do[0]}; ${y.dynamics.do[0]}. Avoid: ${y.harmony.dont[0]}; ${y.space.dont[0]}.`;

  const learningSummary = `Ekko flagged ${x.sentiment} sentiment with ${x.volatility} volatility. Rules fired: ${result.rules.length}. Primary focus: ${y.tension.headline.toLowerCase()}.`;

  return {
    intentBrief,
    descriptiveGuidance,
    producerNotes,
    learningSummary
  };
}
