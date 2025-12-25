"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import type { EkkoResult, RuleFired, XSignals, YIntent } from "@/src/core/types";
import { extractX } from "@/src/core/xExtractor";
import { applyRules } from "@/src/core/rulesEngine";
import { buildExports } from "@/src/core/exports";
import {
  countLines,
  countStanzas,
  countWords,
  normalizeText,
  textHash
} from "@/src/core/utils";

const steps = ["write", "interpret", "why", "export", "reflect"] as const;

type Step = (typeof steps)[number];

type StoredResult = {
  result: EkkoResult;
  lockedTextHash: string | null;
};

const xLabels: Array<keyof XSignals> = [
  "structure",
  "pace",
  "density",
  "repetition",
  "sentiment",
  "volatility",
  "narrative"
];

const yLabels: Array<keyof YIntent> = [
  "harmony",
  "rhythm",
  "dynamics",
  "texture",
  "space",
  "arrangement",
  "register",
  "tension"
];

export default function SessionWorkspacePage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const variantParam = searchParams.get("variant");
  const variant = variantParam?.toUpperCase() === "B" ? "B" : "A";

  const sessionId = params.id;
  const draftKey = `ekko:draft:${sessionId}`;
  const resultKey = `ekko:result:${sessionId}`;
  const reflectKey = `ekko:reflect:${sessionId}`;

  const [draftText, setDraftText] = useState("");
  const [lockedTextHash, setLockedTextHash] = useState<string | null>(null);
  const [result, setResult] = useState<EkkoResult | null>(null);
  const [step, setStep] = useState<Step>("write");
  const [showModal, setShowModal] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [selectedRule, setSelectedRule] = useState<RuleFired | null>(null);
  const [impact, setImpact] = useState("");
  const [reuse, setReuse] = useState("");
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const storedDraft = window.localStorage.getItem(draftKey);
    if (storedDraft) {
      setDraftText(storedDraft);
    }
    const storedResult = window.localStorage.getItem(resultKey);
    if (storedResult) {
      try {
        const parsed = JSON.parse(storedResult) as StoredResult;
        setResult(parsed.result);
        setLockedTextHash(parsed.lockedTextHash);
      } catch {
        setResult(null);
      }
    }
    const storedReflect = window.localStorage.getItem(reflectKey);
    if (storedReflect) {
      try {
        const parsed = JSON.parse(storedReflect) as {
          impact?: string;
          reuse?: string;
          completed?: boolean;
        };
        if (parsed.impact) setImpact(parsed.impact);
        if (parsed.reuse) setReuse(parsed.reuse);
        if (parsed.completed) setCompleted(parsed.completed);
      } catch {
        setCompleted(false);
      }
    }
  }, [draftKey, reflectKey, resultKey]);

  useEffect(() => {
    window.localStorage.setItem(draftKey, draftText);
  }, [draftKey, draftText]);

  useEffect(() => {
    if (!result) return;
    const payload: StoredResult = { result, lockedTextHash };
    window.localStorage.setItem(resultKey, JSON.stringify(payload));
  }, [lockedTextHash, result, resultKey]);

  useEffect(() => {
    window.localStorage.setItem(
      reflectKey,
      JSON.stringify({ impact, reuse, completed })
    );
  }, [completed, impact, reflectKey, reuse]);

  useEffect(() => {
    if (result?.rules.length) {
      setSelectedRule(result.rules[0]);
    }
  }, [result]);

  const counts = useMemo(() => {
    const normalized = normalizeText(draftText);
    return {
      words: countWords(normalized),
      lines: countLines(normalized),
      stanzas: countStanzas(normalized)
    };
  }, [draftText]);

  const editingLocked = variant === "A" && step !== "write";

  const handleInterpret = () => {
    if (variant === "A") {
      setShowModal(true);
      return;
    }
    runInterpretation();
  };

  const runInterpretation = () => {
    const normalized = normalizeText(draftText);
    const nextHash = textHash(normalized);
    const x = extractX(normalized);
    const nextResult = applyRules(x);
    setLockedTextHash(nextHash);
    setResult(nextResult);
    setStep("interpret");
  };

  const confirmModal = () => {
    setShowModal(false);
    runInterpretation();
  };

  const cancelModal = () => {
    setShowModal(false);
  };

  const handleStepChange = (next: Step) => {
    if (next !== "write" && !result) {
      return;
    }
    setStep(next);
  };

  const handleCopy = async (text: string) => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 1800);
  };

  const finishReflect = () => {
    setCompleted(true);
  };

  const startNewSession = () => {
    router.push("/app");
  };

  const returnToLibrary = () => {
    router.push("/app");
  };

  const renderStepContent = () => {
    if (completed) {
      return (
        <div className="panel rounded-3xl p-8 text-center">
          <p className="panel-title">Session complete</p>
          <h2 className="mt-4 text-2xl font-semibold">
            Ekko finalized the export package.
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            You can start a new session or return to the library.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={startNewSession}
              className="rounded-full bg-amber-400 px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900"
            >
              Start New Session
            </button>
            <button
              onClick={returnToLibrary}
              className="rounded-full border border-white/10 px-6 py-2 text-xs uppercase tracking-[0.2em]"
            >
              Return to Library
            </button>
          </div>
        </div>
      );
    }

    if (step === "write") {
      return (
        <div className="panel rounded-3xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="panel-title">Write</p>
              <h2 className="text-2xl font-semibold">Draft the lyric</h2>
            </div>
            <div className="flex gap-4 text-xs font-mono text-slate-400">
              <span>Words: {counts.words}</span>
              <span>Lines: {counts.lines}</span>
              <span>Stanzas: {counts.stanzas}</span>
            </div>
          </div>
          <textarea
            value={draftText}
            onChange={(event) => setDraftText(event.target.value)}
            disabled={editingLocked}
            className="mt-6 h-64 w-full rounded-2xl border border-white/10 bg-slate-900/40 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
            placeholder="Write lyrics or notes here..."
          />
          {editingLocked && (
            <p className="mt-3 text-xs text-amber-300">
              Editing is locked during interpretation in Variant A.
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em]">
              Detect Sections
            </button>
            <button className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em]">
              Clean Spacing
            </button>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleInterpret}
              className="rounded-full bg-amber-400 px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900"
            >
              Interpret Musically
            </button>
          </div>
        </div>
      );
    }

    if (step === "interpret" && result) {
      return (
        <div className="space-y-6">
          <div className="panel rounded-3xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="panel-title">Interpret</p>
                <h2 className="text-2xl font-semibold">Signal extraction</h2>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep("why")}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em]"
                >
                  Why these decisions?
                </button>
                <button
                  onClick={() => setStep("export")}
                  className="rounded-full bg-amber-400 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900"
                >
                  Export
                </button>
              </div>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            <div className="space-y-4">
              {xLabels.map((label) => (
                <div key={label} className="panel rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {label}
                  </p>
                  <p className="mt-3 text-lg font-semibold text-slate-100">
                    {result.x[label]}
                  </p>
                </div>
              ))}
              {lockedTextHash && (
                <div className="panel rounded-2xl p-4 text-xs text-slate-400">
                  Locked Text Hash: {lockedTextHash}
                </div>
              )}
            </div>
            <div className="space-y-4">
              {yLabels.map((label) => {
                const intent = result.y[label];
                return (
                  <div key={label} className="panel rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold capitalize">
                        {label}
                      </h3>
                      <span className="text-xs uppercase tracking-[0.2em] text-amber-300">
                        Constraint
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-300">
                      {intent.headline}
                    </p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Do
                        </p>
                        <ul className="mt-2 space-y-2 text-sm text-slate-200">
                          {intent.do.map((item) => (
                            <li key={item} className="flex gap-2">
                              <span className="text-amber-300">+</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Do not
                        </p>
                        <ul className="mt-2 space-y-2 text-sm text-slate-200">
                          {intent.dont.map((item) => (
                            <li key={item} className="flex gap-2">
                              <span className="text-purple-400">-</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (step === "why" && result) {
      return (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="panel rounded-3xl p-6">
            <p className="panel-title">Rule trace</p>
            <ul className="mt-4 space-y-3 text-sm">
              {result.rules.map((rule) => (
                <li key={rule.id}>
                  <button
                    onClick={() => setSelectedRule(rule)}
                    className={`w-full rounded-2xl border border-white/10 p-4 text-left transition ${
                      selectedRule?.id === rule.id
                        ? "border-amber-400/60 bg-slate-900/60"
                        : "hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-100">{rule.name}</p>
                      <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        {rule.status} · P{rule.priority}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="panel rounded-3xl p-6">
            <p className="panel-title">Explanation</p>
            {selectedRule ? (
              <div className="mt-4 space-y-4 text-sm text-slate-300">
                <div>
                  <p className="text-slate-100">Why the rule applied</p>
                  <p>{selectedRule.because}</p>
                </div>
                <div>
                  <p className="text-slate-100">What it prevents</p>
                  <p>{selectedRule.prevents}</p>
                </div>
                <div>
                  <p className="text-slate-100">Tradeoff</p>
                  <p>{selectedRule.tradeoff}</p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">
                Select a rule to see details.
              </p>
            )}
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                onClick={() => setStep("interpret")}
                className="rounded-full border border-white/10 px-5 py-2 text-xs uppercase tracking-[0.2em]"
              >
                Back
              </button>
              <button
                onClick={() => setStep("export")}
                className="rounded-full bg-amber-400 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900"
              >
                Continue to Export
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (step === "export" && result) {
      const exportsData = buildExports(result);
      const tiles = [
        { title: "Intent Brief", value: exportsData.intentBrief },
        { title: "Descriptive Guidance", value: exportsData.descriptiveGuidance },
        { title: "Producer Notes", value: exportsData.producerNotes },
        { title: "Learning Summary", value: exportsData.learningSummary }
      ];
      return (
        <div className="space-y-6">
          <div className="panel rounded-3xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="panel-title">Export</p>
                <h2 className="text-2xl font-semibold">Package the output</h2>
              </div>
              <button
                onClick={() => setStep("reflect")}
                className="rounded-full bg-amber-400 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900"
              >
                Continue to Reflect
              </button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {tiles.map((tile) => (
              <div key={tile.title} className="panel rounded-2xl p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {tile.title}
                </p>
                <p className="mt-3 text-sm text-slate-200">{tile.value}</p>
                <button
                  onClick={() => handleCopy(tile.value)}
                  className="mt-4 rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em]"
                >
                  Copy to clipboard
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="panel rounded-3xl p-6">
        <p className="panel-title">Reflect</p>
        <h2 className="mt-2 text-2xl font-semibold">Capture feedback</h2>
        <div className="mt-6 space-y-6 text-sm">
          <div>
            <p className="text-slate-200">
              Did Ekko change how you think about this track?
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {[
                "significant",
                "slight",
                "not_really",
                "no"
              ].map((option) => (
                <label
                  key={option}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs uppercase tracking-[0.2em] ${
                    impact === option
                      ? "border-amber-400 text-amber-300"
                      : "border-white/10 text-slate-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="impact"
                    value={option}
                    checked={impact === option}
                    onChange={() => setImpact(option)}
                    className="accent-amber-400"
                  />
                  {option.replace("_", " ")}
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="text-slate-200">
              Would you use Ekko again on your next track?
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {["yes", "maybe", "no"].map((option) => (
                <label
                  key={option}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs uppercase tracking-[0.2em] ${
                    reuse === option
                      ? "border-purple-400 text-purple-300"
                      : "border-white/10 text-slate-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="reuse"
                    value={option}
                    checked={reuse === option}
                    onChange={() => setReuse(option)}
                    className="accent-purple-400"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={finishReflect}
              className="rounded-full bg-amber-400 px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900"
            >
              Finish
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900/60 to-slate-950 px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="panel flex flex-wrap items-center justify-between gap-4 rounded-2xl px-6 py-4">
          <div className="text-sm font-semibold uppercase tracking-[0.4em] text-amber-300">
            Ekko
          </div>
          <div className="text-xs font-mono text-slate-400">
            Session {sessionId} · Variant {variant}
          </div>
          <div className="flex gap-2">
            {steps.map((item) => {
              const isDisabled = item !== "write" && !result;
              return (
                <button
                  key={item}
                  onClick={() => handleStepChange(item)}
                  disabled={isDisabled}
                  className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] transition ${
                    step === item
                      ? "bg-amber-400 text-slate-900"
                      : "border border-white/10 text-slate-200"
                  } ${isDisabled ? "cursor-not-allowed opacity-40" : ""}`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </header>
        {renderStepContent()}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
          <div className="panel w-full max-w-lg rounded-2xl p-6">
            <h2 className="text-xl font-semibold">
              Lock lyrics and move to production
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Ekko will interpret your words as final and apply musical
              discipline. Editing pauses during interpretation.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={cancelModal}
                className="rounded-full border border-white/10 px-5 py-2 text-xs uppercase tracking-[0.2em]"
              >
                Go back and edit
              </button>
              <button
                onClick={confirmModal}
                className="rounded-full bg-amber-400 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900"
              >
                Interpret Musically
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`fixed bottom-6 right-6 rounded-full bg-amber-400 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900 transition ${
          toastVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        Copied
      </div>
    </div>
  );
}
