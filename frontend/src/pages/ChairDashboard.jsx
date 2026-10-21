import { useCallback, useEffect, useState } from "react";

const BASE_URL = (import.meta.env.VITE_BASE_URL ?? "").replace(/\/$/, "");
const POLL_MS = 15000;

/**
 * Endpoints used (all relative to VITE_BASE_URL, {c} = /muns/:munId/committees/:committeeId)
 *
 * GET  {c}/marking-scheme
 *      { "criteria": [{ "key": "speeches", "label": "Speeches", "max": 10 }],
 *        "rows": [{ "id": "d1", "country": "India", "delegate": "A. Rao",
 *                   "scores": { "speeches": 7 }, "total": 7 }] }
 * GET  {c}/recognition
 *      [{ "id": "r1", "country": "India", "reason": "Best speaker", "recognisedAt": "2026-11-14T10:30:00Z" }]
 * GET  {c}/moderated-caucus/current
 *      { "topic": "...", "type": "Moderated caucus", "totalMinutes": 10, "speakingSeconds": 60,
 *        "currentSpeaker": "India", "speakersCount": 4 }   (or null when there is none)
 * GET  {c}/roll-call
 *      { "present": 30, "presentAndVoting": 4, "absent": 6, "total": 40, "quorum": 14 }
 * POST {c}/poi   body: { "delegateId": "d1" }
 * POST {c}/poo   body: { "delegateId": "d1" }
 */

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      // no JSON body
    }
    throw new Error(message);
  }
  return res.status === 204 ? null : res.json();
}

function useApi(path, interval) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });

  const load = useCallback(
    async (signal, silent = false) => {
      if (!silent) setState((s) => ({ ...s, loading: true }));
      try {
        const data = await apiFetch(path, { signal });
        setState({ data, loading: false, error: "" });
      } catch (err) {
        if (err.name === "AbortError") return;
        setState((s) => ({ ...s, loading: false, error: err.message }));
      }
    },
    [path]
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    const timer = interval ? setInterval(() => load(controller.signal, true), interval) : null;
    return () => {
      controller.abort();
      if (timer) clearInterval(timer);
    };
  }, [load, interval]);

  return { ...state, reload: () => load(undefined, true) };
}

function Panel({ title, children, className = "" }) {
  return (
    <section className={`bg-gray-800 rounded-lg p-5 lg:p-6 flex flex-col min-w-0 min-h-0 ${className}`}>
      <h2 className="text-xl lg:text-2xl font-semibold mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Status({ loading, error, hasData }) {
  if (error && !hasData) {
    return (
      <p role="alert" className="text-base text-red-400">
        {error}
      </p>
    );
  }
  if (loading && !hasData) return <p className="text-base text-gray-400">Loading…</p>;
  return null;
}

function formatTime(value) {
  if (!value) return "";
  const d = new Date(value);
  return isNaN(d) ? value : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const th = "text-left text-base font-semibold text-gray-400 px-4 py-3 sticky top-0 bg-gray-800";
const td = "px-4 py-3 text-base lg:text-lg border-t border-gray-700";

function MarkingScheme({ scheme, selectedId, onSelect }) {
  const { data, loading, error } = scheme;
  const criteria = data?.criteria ?? [];
  const rows = data?.rows ?? [];

  return (
    <Panel title="Marking scheme">
      <Status loading={loading} error={error} hasData={!!data} />
      {data && rows.length === 0 && <p className="text-base text-gray-400">No delegates yet.</p>}
      {rows.length > 0 && (
        <div className="overflow-auto flex-1 min-h-0 max-h-[70vh] lg:max-h-none">
          <table className="w-full min-w-max">
            <thead>
              <tr>
                <th className={th}>Delegate</th>
                {criteria.map((c) => (
                  <th key={c.key} className={`${th} text-right`}>
                    {c.label}
                    {c.max != null && <span className="font-normal"> /{c.max}</span>}
                  </th>
                ))}
                <th className={`${th} text-right`}>Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const selected = r.id === selectedId;
                return (
                  <tr key={r.id} className={selected ? "bg-blue-500/20" : ""}>
                    <td className={td}>
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onSelect(selected ? null : r.id)}
                        className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                      >
                        <span className="font-semibold">{r.country}</span>
                        {r.delegate && <span className="text-base text-gray-400"> · {r.delegate}</span>}
                      </button>
                    </td>
                    {criteria.map((c) => (
                      <td key={c.key} className={`${td} text-right`}>
                        {r.scores?.[c.key] ?? "–"}
                      </td>
                    ))}
                    <td className={`${td} text-right font-semibold`}>{r.total ?? "–"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

function Recognition({ recognition }) {
  const { data, loading, error } = recognition;
  return (
    <Panel title="Recognition" className="lg:col-span-6">
      <Status loading={loading} error={error} hasData={!!data} />
      {data && data.length === 0 && <p className="text-base text-gray-400">Nothing recognised yet.</p>}
      {data && data.length > 0 && (
        <div className="overflow-auto flex-1 min-h-0 max-h-72 lg:max-h-none">
          <table className="w-full min-w-max">
            <thead>
              <tr>
                <th className={th}>Delegate</th>
                <th className={th}>Reason</th>
                <th className={`${th} text-right`}>Time</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id}>
                  <td className={`${td} font-semibold`}>{r.country}</td>
                  <td className={td}>{r.reason}</td>
                  <td className={`${td} text-right text-gray-400`}>{formatTime(r.recognisedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

function CurrentMod({ mod }) {
  const { data, loading, error } = mod;
  return (
    <Panel title="Current mod" className="lg:col-span-2">
      <Status loading={loading} error={error} hasData={mod.data !== null || !loading} />
      {!loading && !error && !data && <p className="text-base text-gray-400">No caucus running.</p>}
      {data && (
        <dl className="text-base lg:text-lg space-y-3 overflow-auto min-h-0">
          <div>
            <dt className="text-gray-400">Topic</dt>
            <dd className="font-semibold">{data.topic}</dd>
          </div>
          {data.currentSpeaker && (
            <div>
              <dt className="text-gray-400">Speaking</dt>
              <dd className="font-semibold">{data.currentSpeaker}</dd>
            </div>
          )}
          {data.totalMinutes != null && (
            <div>
              <dt className="text-gray-400">Total time</dt>
              <dd>{data.totalMinutes} min</dd>
            </div>
          )}
          {data.speakingSeconds != null && (
            <div>
              <dt className="text-gray-400">Per speaker</dt>
              <dd>{data.speakingSeconds} sec</dd>
            </div>
          )}
        </dl>
      )}
    </Panel>
  );
}

const tileClass =
  "flex-1 min-h-[5rem] bg-gray-800 rounded-lg p-4 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";
const actionClass = `${tileClass} text-xl lg:text-2xl font-semibold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-800`;

function RollCall({ rollCall }) {
  const { data, loading, error } = rollCall;
  return (
    <div className={`${tileClass} text-left min-w-0`}>
      <h2 className="text-lg lg:text-xl font-semibold mb-2 text-center">Roll call</h2>
      <Status loading={loading} error={error} hasData={!!data} />
      {data && (
        <dl className="text-base lg:text-lg grid grid-cols-2 gap-x-2 gap-y-1">
          <dt className="text-gray-400">Present</dt>
          <dd className="text-right">{data.present}</dd>
          <dt className="text-gray-400">P&amp;V</dt>
          <dd className="text-right">{data.presentAndVoting}</dd>
          <dt className="text-gray-400">Absent</dt>
          <dd className="text-right">{data.absent}</dd>
          <dt className="text-gray-400">Quorum</dt>
          <dd className="text-right">{data.quorum}</dd>
        </dl>
      )}
    </div>
  );
}

export default function ChairDashboard({ munId, committeeId, committeeName, onViewChats }) {
  const base = `/muns/${encodeURIComponent(munId)}/committees/${encodeURIComponent(committeeId)}`;

  const scheme = useApi(`${base}/marking-scheme`, POLL_MS);
  const recognition = useApi(`${base}/recognition`, POLL_MS);
  const mod = useApi(`${base}/moderated-caucus/current`, POLL_MS);
  const rollCall = useApi(`${base}/roll-call`, POLL_MS);

  const [selectedId, setSelectedId] = useState(null);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState({ text: "", isError: false });

  const selectedRow = scheme.data?.rows?.find((r) => r.id === selectedId);

  const mark = async (kind) => {
    if (!selectedRow || pending) return;
    setPending(true);
    setFeedback({ text: "", isError: false });
    try {
      await apiFetch(`${base}/${kind}`, {
        method: "POST",
        body: JSON.stringify({ delegateId: selectedRow.id }),
      });
      setFeedback({ text: `${kind.toUpperCase()} marked for ${selectedRow.country}.`, isError: false });
      scheme.reload();
    } catch (err) {
      setFeedback({ text: err.message, isError: true });
    } finally {
      setPending(false);
    }
  };

  const needsDelegate = !selectedRow;

  return (
    <div className="bg-gray-900 text-white w-full p-4 lg:p-6 flex flex-col min-h-[calc(100vh-var(--navbar-height,4rem))] lg:h-[calc(100vh-var(--navbar-height,4rem))]">
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6">
        <h1 className="text-3xl lg:text-4xl font-semibold">
          Chair dashboard
          {committeeName && <span className="text-gray-400 font-normal"> · {committeeName}</span>}
        </h1>
        <p className="text-base lg:text-lg text-gray-400">
          {selectedRow ? `Selected: ${selectedRow.country}` : "Select a delegate in the table to mark a POI or POO."}
        </p>
      </header>

      <div className="flex-1 min-h-0 grid gap-4 lg:grid-rows-[minmax(0,3fr)_minmax(0,2fr)]">
        <MarkingScheme scheme={scheme} selectedId={selectedId} onSelect={setSelectedId} />

        <div className="min-h-0 grid gap-4 lg:grid-cols-12">
          <Recognition recognition={recognition} />
          <CurrentMod mod={mod} />

          <div className="lg:col-span-2 min-h-0 flex flex-col gap-4">
            <button
              type="button"
              disabled={needsDelegate || pending}
              onClick={() => mark("poi")}
              className={actionClass}
            >
              Mark POI
            </button>
            <button type="button" onClick={() => onViewChats?.()} className={actionClass}>
              View chats
            </button>
          </div>

          <div className="lg:col-span-2 min-h-0 flex flex-col gap-4">
            <button
              type="button"
              disabled={needsDelegate || pending}
              onClick={() => mark("poo")}
              className={actionClass}
            >
              Mark POO
            </button>
            <RollCall rollCall={rollCall} />
          </div>
        </div>
      </div>

      <p
        role="status"
        className={`text-base min-h-6 mt-3 ${feedback.isError ? "text-red-400" : "text-gray-400"}`}
      >
        {feedback.text}
      </p>
    </div>
  );
}