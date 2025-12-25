"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const draftPrefix = "ekko:draft:";
const resultPrefix = "ekko:result:";

type SessionSummary = {
  id: string;
  hasDraft: boolean;
  hasResult: boolean;
};

function createSessionId() {
  return `sess_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

export default function AppEntryPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);

  useEffect(() => {
    const keys = Object.keys(window.localStorage);
    const ids = new Set<string>();
    keys.forEach((key) => {
      if (key.startsWith(draftPrefix)) {
        ids.add(key.replace(draftPrefix, ""));
      }
      if (key.startsWith(resultPrefix)) {
        ids.add(key.replace(resultPrefix, ""));
      }
    });

    const nextSessions = Array.from(ids).map((id) => ({
      id,
      hasDraft: window.localStorage.getItem(`${draftPrefix}${id}`) !== null,
      hasResult: window.localStorage.getItem(`${resultPrefix}${id}`) !== null
    }));
    setSessions(nextSessions);
  }, []);

  const newSessionId = useMemo(() => createSessionId(), []);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="panel-title">Entry</p>
            <h1 className="text-2xl font-semibold">Start an Ekko session</h1>
          </div>
          <Link
            href={`/app/session/${newSessionId}`}
            className="rounded-full bg-amber-400 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900"
          >
            New Session
          </Link>
        </header>

        <section className="panel rounded-3xl p-6">
          <p className="panel-title">Recent Sessions</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {sessions.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-slate-400">
                No sessions saved yet.
              </div>
            )}
            {sessions.map((session) => (
              <Link
                key={session.id}
                href={`/app/session/${session.id}`}
                className="panel rounded-2xl p-5 transition hover:border-amber-400/40"
              >
                <h3 className="text-lg font-semibold">Session {session.id}</h3>
                <p className="mt-2 text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
                  Draft {session.hasDraft ? "present" : "empty"} · Result {session.hasResult ? "ready" : "none"}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
