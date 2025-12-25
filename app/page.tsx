import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="space-y-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300">
          Ekko
        </p>
        <h1 className="text-3xl font-semibold">Landing placeholder</h1>
        <p className="text-sm text-slate-400">
          The full studio experience will load inside the app shell.
        </p>
        <Link
          href="/app"
          className="inline-flex rounded-full border border-white/10 px-6 py-2 text-xs uppercase tracking-[0.2em]"
        >
          Enter App
        </Link>
      </div>
    </main>
  );
}
