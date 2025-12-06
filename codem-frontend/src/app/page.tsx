"use client";

import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";

type Problem = {
  id: string;
  title: string;
  description: string;
  classSkeleton: string;
  testSuite: string;
  constraints: string;
  sampleInputs: string[];
  sampleOutputs: string[];
};

type JudgeResult = {
  success: boolean;
  passedTests: string[];
  failedTests: string[];
  stdout: string;
  stderr: string;
  executionTimeMs: number;
};

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(
    null
  );
  const [code, setCode] = useState<string>("public class Solution {\n}\n");
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [result, setResult] = useState<JudgeResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isTimerRunning) return;
    const id = setInterval(() => {
      setTimerSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [isTimerRunning]);

  const selectedProblem = problems.find((p) => p.id === selectedProblemId);

  async function handleGenerate() {
    setLoading(true);
    setResult(null);
    setTimerSeconds(0);
    setIsTimerRunning(false);
    try {
      const res = await fetch(`${BACKEND_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 5 }),
      });
      const data = await res.json();
      const probs: Problem[] = data.problems ?? [];
      setProblems(probs);
      if (probs.length > 0) {
        setSelectedProblemId(probs[0].id);
        setCode(probs[0].classSkeleton || "public class Solution {\n}\n");
      }
      setIsTimerRunning(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!selectedProblem) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          testSuite: selectedProblem.testSuite,
        }),
      });
      const data: JudgeResult = await res.json();
      setResult(data);
      setIsTimerRunning(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  function formatTime(totalSeconds: number) {
    const m = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Codem</h1>
            <p className="text-sm text-slate-300">
              Autonomous Java OOP problem generator with Docker-based judge.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-slate-800 px-4 py-1 text-sm font-mono">
              Timer: {formatTime(timerSeconds)}
            </div>
            <button
              onClick={handleGenerate}
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 shadow hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Problems"}
            </button>
          </div>
        </header>

        <main className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <section className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="text-sm font-semibold text-slate-200">Problems</h2>
            <div className="flex flex-col gap-2">
              {problems.length === 0 && (
                <p className="text-sm text-slate-400">
                  Click "Generate Problems" to start.
                </p>
              )}
              {problems.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProblemId(p.id);
                    setCode(p.classSkeleton || "public class Solution {\n}\n");
                    setResult(null);
                    setTimerSeconds(0);
                    setIsTimerRunning(true);
                  }}
                  className={`flex flex-col rounded-md border px-3 py-2 text-left text-sm transition ${
                    selectedProblemId === p.id
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                  }`}
                >
                  <span className="font-medium text-slate-50">
                    {p.title}
                  </span>
                  <span className="line-clamp-2 text-xs text-slate-400">
                    {p.description}
                  </span>
                </button>
              ))}
            </div>

            {selectedProblem && (
              <div className="mt-2 space-y-2 rounded-md border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-200">
                <h3 className="text-sm font-semibold">Description</h3>
                <p className="whitespace-pre-line text-xs text-slate-300">
                  {selectedProblem.description}
                </p>
                {selectedProblem.constraints && (
                  <>
                    <h4 className="pt-2 text-xs font-semibold text-slate-200">
                      Constraints
                    </h4>
                    <p className="text-xs text-slate-300">
                      {selectedProblem.constraints}
                    </p>
                  </>
                )}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200">
                Code Editor
              </h2>
              <button
                onClick={handleSubmit}
                disabled={!selectedProblem || submitting}
                className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 shadow hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Running..." : "Submit & Run Tests"}
              </button>
            </div>
            <div className="h-72 overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
              <Editor
                height="100%"
                defaultLanguage="java"
                value={code}
                onChange={(value) => setCode(value ?? "")}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                }}
              />
            </div>

            <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/70 p-3 text-xs">
              <h2 className="text-sm font-semibold text-slate-200">Results</h2>
              {!result && (
                <p className="text-slate-400">
                  Results will appear here after you submit.
                </p>
              )}
              {result && (
                <>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        result.success
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-rose-500/20 text-rose-300"
                      }`}
                    >
                      {result.success ? "All tests passed" : "Tests failed"}
                    </span>
                    <span className="rounded-full bg-slate-800 px-3 py-1 font-mono text-xs text-slate-200">
                      {result.executionTimeMs.toFixed(0)} ms
                    </span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <h3 className="mb-1 text-xs font-semibold text-emerald-300">
                        Passed tests
                      </h3>
                      {result.passedTests.length === 0 && (
                        <p className="text-xs text-slate-400">None</p>
                      )}
                      <ul className="space-y-1 text-xs text-slate-200">
                        {result.passedTests.map((t) => (
                          <li key={t}>✓ {t}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="mb-1 text-xs font-semibold text-rose-300">
                        Failed tests
                      </h3>
                      {result.failedTests.length === 0 && (
                        <p className="text-xs text-slate-400">None</p>
                      )}
                      <ul className="space-y-1 text-xs text-slate-200">
                        {result.failedTests.map((t) => (
                          <li key={t}>✗ {t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-1 text-xs font-semibold text-slate-200">
                      Stdout
                    </h3>
                    <pre className="max-h-40 overflow-auto rounded bg-slate-950 p-2 font-mono text-[11px] text-slate-200">
                      {result.stdout || "(empty)"}
                    </pre>
                  </div>
                  <div>
                    <h3 className="mb-1 text-xs font-semibold text-slate-200">
                      Stderr / Hints
                    </h3>
                    <pre className="max-h-40 overflow-auto rounded bg-slate-950 p-2 font-mono text-[11px] text-rose-200">
                      {result.stderr || "(empty)"}
                    </pre>
                  </div>
                </>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

