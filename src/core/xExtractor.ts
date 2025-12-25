import { XSignals } from "./types";
import {
  bucketize,
  clamp,
  countLines,
  countStanzas,
  countWords,
  normalizeText
} from "./utils";

const brightLexicon = new Set([
  "light",
  "gold",
  "sun",
  "shine",
  "rise",
  "glow",
  "open",
  "warm",
  "alive",
  "breathe",
  "hope",
  "lift",
  "clear",
  "day",
  "summer",
  "sweet",
  "soft",
  "bright",
  "peace",
  "calm",
  "yes",
  "up",
  "dream",
  "wide",
  "free",
  "bloom",
  "steady",
  "hold",
  "grace",
  "faith"
]);

const darkLexicon = new Set([
  "dark",
  "cold",
  "night",
  "shadow",
  "fall",
  "down",
  "alone",
  "lose",
  "broken",
  "hurt",
  "pain",
  "dust",
  "grave",
  "ash",
  "storm",
  "fear",
  "empty",
  "bleed",
  "heavy",
  "quiet",
  "fade",
  "no",
  "gone",
  "crash",
  "low",
  "wound",
  "drift",
  "burn",
  "wait",
  "weak"
]);

const pronouns = new Set(["i", "me", "we", "you", "he", "she", "they"]);

function lineStats(lines: string[]) {
  const lengths = lines.map((line) => line.length);
  const avg = lengths.reduce((sum, value) => sum + value, 0) / (lengths.length || 1);
  const variance =
    lengths.reduce((sum, value) => sum + (value - avg) ** 2, 0) /
    (lengths.length || 1);
  return { avg, variance };
}

function repetitionScore(lines: string[], words: string[]) {
  if (lines.length === 0 || words.length === 0) return 0;
  const normalizedLines = lines.map((line) => line.toLowerCase().trim());
  const uniqueLines = new Set(normalizedLines);
  const lineRepeatRatio = (lines.length - uniqueLines.size) / lines.length;

  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i += 1) {
    bigrams.push(`${words[i]} ${words[i + 1]}`);
  }
  const uniqueBigrams = new Set(bigrams);
  const bigramRepeatRatio = bigrams.length
    ? (bigrams.length - uniqueBigrams.size) / bigrams.length
    : 0;

  return clamp((lineRepeatRatio + bigramRepeatRatio) / 2, 0, 1);
}

export function extractX(rawText: string): XSignals {
  const normalized = normalizeText(rawText);
  const lines = normalized ? normalized.split("\n") : [];
  const wordList = normalized
    ? normalized
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
    : [];

  const wordCount = countWords(normalized);
  const lineCount = countLines(normalized);
  const stanzaCount = countStanzas(normalized);
  const wordsPerLine = lineCount > 0 ? wordCount / lineCount : 0;

  const { avg, variance } = lineStats(lines);
  const avgLineLength = avg;

  const punctuationMatches = normalized.match(/[.!?;,]/g) ?? [];
  const punctuationRate = wordCount ? punctuationMatches.length / wordCount : 0;

  const repeatScore = repetitionScore(lines, wordList);

  const densityBucket = bucketize(wordsPerLine + wordCount / 60, [6, 10], [
    "low",
    "medium",
    "high"
  ]) as XSignals["density"];

  const paceScore = clamp(
    0.5 + (punctuationRate - 0.08) * 2 - variance / 400,
    0,
    1
  );
  const paceBucket = bucketize(paceScore, [0.35, 0.65], [
    "slow",
    "medium",
    "fast"
  ]) as XSignals["pace"];

  const volatilityScore = clamp(punctuationRate * 4 + variance / 300, 0, 1);
  const volatilityBucket = bucketize(volatilityScore, [0.35, 0.7], [
    "low",
    "medium",
    "high"
  ]) as XSignals["volatility"];

  let brightScore = 0;
  let darkScore = 0;
  let pronounScore = 0;
  let pastTenseScore = 0;

  wordList.forEach((word) => {
    if (brightLexicon.has(word)) brightScore += 1;
    if (darkLexicon.has(word)) darkScore += 1;
    if (pronouns.has(word)) pronounScore += 1;
    if (word.endsWith("ed")) pastTenseScore += 1;
  });

  const sentimentValue = brightScore - darkScore;
  const sentimentBucket = bucketize(sentimentValue, [-2, 2], [
    "dark",
    "neutral",
    "bright"
  ]) as XSignals["sentiment"];

  const narrativeScore =
    pronounScore / (wordCount || 1) + pastTenseScore / (wordCount || 1);
  const narrativeBucket = narrativeScore > 0.18 ? "linear" : "fragmented";

  const registerScore = clamp(
    avgLineLength / 48 + (brightScore + darkScore) / (wordCount || 1),
    0,
    1
  );
  const registerBucket = bucketize(registerScore, [0.35, 0.7], [
    "low",
    "mid",
    "high"
  ]) as XSignals["register"];

  const structureBucket = bucketize(
    stanzaCount + lineCount / 8,
    [2, 4],
    ["short", "balanced", "extended"]
  ) as XSignals["structure"];

  const repetitionBucket = bucketize(repeatScore, [0.3, 0.6], [
    "low",
    "medium",
    "high"
  ]) as XSignals["repetition"];

  return {
    structure: structureBucket,
    pace: paceBucket,
    density: densityBucket,
    repetition: repetitionBucket,
    sentiment: sentimentBucket,
    volatility: volatilityBucket,
    narrative: narrativeBucket,
    register: registerBucket
  };
}
