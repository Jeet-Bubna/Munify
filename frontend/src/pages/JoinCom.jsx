import { useCallback, useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API;

/**
 * Expected API response for GET /api/debate/get/muns:
 * [
 *   {
 *     "name": "GMUN 2026",
 *     "location": "New Horizon Gurukul",
 *     "date": "2026-10-14",
 *     "description": "New mun",
 *     "image": "https://example.com/logo.png", // Optional image URL
 *     "committees": [
 *       { "name": "AIPPM", "agenda": "loksabha" }
 *     ]
 *   }
 * ]
 */

export async function fetchMuns(signal) {
  const res = await fetch(`${API_BASE}/muns`, { signal });
  const text = await res.text();

  if (!res.ok) throw new Error(`Could not load MUNs (${res.status})`);

  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Server returned invalid JSON - Check if server is down. Error ${err}`);
  }
}

function initials(name) {
  if (!name) return "";
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

function CommitteeList({ committees, onPick }) {
  const safeCommittees = Array.isArray(committees) ? committees : [];
  if (safeCommittees.length === 0) {
    return <p className="text-gray-400 text-sm">No committees have been added to this MUN yet.</p>;
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {safeCommittees.map((c, index) => (
        <li key={c.id || c.name || index}>
          <button
            type="button"
            onClick={() => onPick(c)}
            className="w-full h-full text-left bg-gray-900 border border-gray-700 hover:border-blue-500 rounded px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span className="block font-semibold">{c.name}</span>
            {c.agenda && <span className="block text-sm text-gray-400 mt-0.5">{c.agenda}</span>}
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

  const toggle = (munKey) => {
    setOpenId((prevOpenId) => (prevOpenId === munKey ? null : munKey));
  };

  const safeMuns = Array.isArray(muns) ? muns : [];

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
              onClick={() => {
                const controller = new AbortController();
                loadMuns(controller.signal);
              }}
              className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded"
            >
              Try again
            </button>
          </div>
        )}

        {status === "ready" && safeMuns.length === 0 && (
          <p className="text-gray-400">No muns found</p>
        )}

        {status === "ready" && safeMuns.length > 0 && (
          <ul className="space-y-4">
            {safeMuns.map((mun, index) => {
              const munKey = mun.id || mun.name || index;
              const open = openId === munKey;
              return (
                <li key={munKey} className="bg-gray-800 rounded-lg">
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`committees-${munKey}`}
                    onClick={() => toggle(munKey)}
                    className="w-full flex items-center gap-4 p-5 text-left rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <span
                      aria-hidden="true"
                      className="shrink-0 w-14 h-14 rounded-lg bg-blue-500 flex items-center justify-center text-xl font-bold overflow-hidden"
                    >
                      {mun.image ? (
                        <img
                          src={mun.image}
                          alt={mun.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        initials(mun.name)
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xl font-semibold truncate">{mun.name}</span>
                      {mun.location || mun.date ? (
                        <span className="block text-sm text-gray-400 mt-0.5">
                          {[mun.location, formatDate(mun.date)].filter(Boolean).join(", ")}
                        </span>
                      ) : null}
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
                    <div id={`committees-${munKey}`} className="border-t border-gray-700 p-5">
                      <CommitteeList
                        committees={mun.committees}
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