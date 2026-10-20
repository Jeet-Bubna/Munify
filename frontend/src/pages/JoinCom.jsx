import { useCallback, useEffect, useState } from "react";

const API_BASE = "/api";

/**
 * Expected API responses
 *
 * GET /api/muns
 *   [{ "id": "1", "name": "Bangalore MUN 2026", "location": "Bengaluru",
 *      "date": "2026-11-14", "description": "Annual inter-school conference." }]
 *
 * GET /api/muns/:id/committees
 *   [{ "id": "10", "name": "UNSC", "topic": "Maritime security" }]
 */

export async function fetchMuns(signal) {
  const res = await fetch(`${API_BASE}/muns`, { signal });
  if (!res.ok) throw new Error(`Could not load MUNs (${res.status})`);
  return res.json();
}

export async function fetchCommittees(munId, signal) {
  const res = await fetch(`${API_BASE}/muns/${encodeURIComponent(munId)}/committees`, { signal });
  if (!res.ok) throw new Error(`Could not load committees (${res.status})`);
  return res.json();
}

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  return isNaN(d) ? value : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function CommitteeList({ state, onPick }) {
  if (!state || state.loading) {
    return <p className="text-gray-400 text-sm">Loading committees…</p>;
  }
  if (state.error) {
    return (
      <p role="alert" className="text-red-400 text-sm">
        {state.error}
      </p>
    );
  }
  if (state.items.length === 0) {
    return <p className="text-gray-400 text-sm">No committees have been added to this MUN yet.</p>;
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {state.items.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            onClick={() => onPick(c)}
            className="w-full h-full text-left bg-gray-900 border border-gray-700 hover:border-blue-500 rounded px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span className="block font-semibold">{c.name}</span>
            {c.topic && <span className="block text-sm text-gray-400 mt-0.5">{c.topic}</span>}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function JoinCom({ onSelectCommittee }) {
  const [muns, setMuns] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [loadError, setLoadError] = useState("");
  const [openId, setOpenId] = useState(null);
  const [committees, setCommittees] = useState({}); // munId -> { loading, error, items }

  const loadMuns = useCallback((signal) => {
    setStatus("loading");
    fetchMuns(signal)
      .then((data) => {
        setMuns(data);
        setStatus("ready");
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setLoadError(err.message);
        setStatus("error");
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadMuns(controller.signal);
    return () => controller.abort();
  }, [loadMuns]);

  const toggle = (mun) => {
    if (openId === mun.id) {
      setOpenId(null);
      return;
    }
    setOpenId(mun.id);
    if (committees[mun.id]?.items) return; // already loaded

    setCommittees((prev) => ({ ...prev, [mun.id]: { loading: true } }));
    fetchCommittees(mun.id)
      .then((items) => setCommittees((prev) => ({ ...prev, [mun.id]: { items } })))
      .catch((err) => setCommittees((prev) => ({ ...prev, [mun.id]: { error: err.message } })));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white px-3 sm:px-8 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="text-3xl font-semibold mb-1">Choose your MUN</h1>
        <p className="text-gray-400 mb-8">Pick a conference, then the committee you’re part of.</p>

        {status === "loading" && <p className="text-gray-400">Loading MUNs…</p>}

        {status === "error" && (
          <div role="alert" className="bg-gray-800 rounded-lg p-6">
            <p className="text-red-400 mb-4">{loadError}</p>
            <button
              type="button"
              onClick={() => loadMuns()}
              className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded"
            >
              Try again
            </button>
          </div>
        )}

        {status === "ready" && muns.length === 0 && (
          <p className="text-gray-400">There are no MUNs to join yet.</p>
        )}

        {status === "ready" && (
          <ul className="space-y-4">
            {muns.map((mun) => {
              const open = openId === mun.id;
              return (
                <li key={mun.id} className="bg-gray-800 rounded-lg">
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`committees-${mun.id}`}
                    onClick={() => toggle(mun)}
                    className="w-full flex items-center gap-4 p-5 text-left rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <span
                      aria-hidden="true"
                      className="shrink-0 w-14 h-14 rounded-lg bg-blue-500 flex items-center justify-center text-xl font-bold"
                    >
                      {initials(mun.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xl font-semibold truncate">{mun.name}</span>
                      <span className="block text-sm text-gray-400 mt-0.5">
                        {[mun.location, formatDate(mun.date)].filter(Boolean).join(", ")}
                      </span>
                      {mun.description && (
                        <span className="block text-sm text-gray-300 mt-1 line-clamp-2">
                          {mun.description}
                        </span>
                      )}
                    </span>
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      className={`shrink-0 w-5 h-5 text-gray-400 ${open ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {open && (
                    <div id={`committees-${mun.id}`} className="border-t border-gray-700 p-5">
                      <CommitteeList
                        state={committees[mun.id]}
                        onPick={(committee) => onSelectCommittee?.(mun, committee)}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}