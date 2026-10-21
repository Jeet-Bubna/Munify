import { useState } from "react";
import { useAuth } from "../provider/authProvider";

const MAX_COMMITTEES = 20;

/**
 * Expected API
 *
 * POST /api/muns
 *   body: {
 *     "name": "...", "location": "...", "date": "2026-11-14", "description": ".....",
 *     "committees": [{ "name": "UNSC", "agenda": "Maritime security" }]
 *   }
 *   response: the created MUN, e.g. { "id": "1", "name": "...", ... }
 *
 */

export async function createMun(data) {
  const VITE_API = import.meta.env.VITE_API
  console.log(JSON.stringify(data))

  const res = await fetch(`${VITE_API}/muns/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let message = `Could not create the MUN (${res.status}).`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      // response had no JSON body, keep the default message
    }
    throw new Error(message);
  }
  return res.json();
}

const inputClass =
  "w-full bg-gray-900 text-white placeholder-gray-500 border border-gray-700 rounded px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500";

const emptyCommittee = () => ({ name: "", agenda: ""});

function Field({ id, label, hint, children }) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm mb-1.5">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1.5">{hint}</p>}
    </div>
  );
}

export default function MakeMun({ onGoToDashboard }) {
  const [form, setForm] = useState({ name: "", location: "", date: "", description: "" });
  const [countInput, setCountInput] = useState("1");
  const [committees, setCommittees] = useState([emptyCommittee()]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(null);
  const token = useAuth();

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const resizeCommittees = (n) => {
    setCommittees((prev) =>
      n > prev.length
        ? [...prev, ...Array.from({ length: n - prev.length }, emptyCommittee)]
        : prev.slice(0, n)
    );
  };

  const handleCount = (e) => {
    const raw = e.target.value;
    setCountInput(raw);
    const n = parseInt(raw, 10);
    if (n >= 1 && n <= MAX_COMMITTEES) resizeCommittees(n);
  };

  // If the box was left empty or out of range, snap back to the real count
  const handleCountBlur = () => setCountInput(String(committees.length));

  const updateCommittee = (index, key) => (e) => {
    const value = e.target.value;
    setCommittees((prev) => prev.map((c, i) => (i === index ? { ...c, [key]: value } : c)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!form.name.trim()) return setError("Give your MUN a name.");
    if (!form.location.trim()) return setError("Enter where the MUN is held.");
    if (!form.date) return setError("Pick a date.");

    const names = committees.map((c) => c.name.trim().toLowerCase());
    if (names.some((n) => !n)) return setError("Every committee needs a name.");
    if (new Set(names).size !== names.length) return setError("Committee names must be different.");

    setError("");
    setSubmitting(true);
    try {
      const mun = await createMun({
        name: form.name.trim(),
        location: form.location.trim(),
        date: form.date,
        description: form.description.trim(),
        committees: committees.map((c) => ({
          name: c.name.trim(),
          agenda: c.topic.trim(),
        })),
      });
      setCreated(mun);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4 py-12">
      <main className="w-full max-w-2xl bg-gray-800 rounded-lg p-6 sm:p-8">
        {created ? (
          <div className="text-center">
            <h1 className="text-3xl font-semibold mb-2">MUN created</h1>
            <p className="text-gray-400 mb-6">
              <span className="text-white font-semibold">{created.name ?? form.name}</span> is ready
              with {committees.length} {committees.length === 1 ? "committee" : "committees"}. Head to
              the dashboard to set it up.
            </p>
            <button
              type="button"
              onClick={() => onGoToDashboard?.(created)}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold rounded"
            >
              Go to dashboard
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-semibold mb-1">Create a MUN</h1>
            <p className="text-gray-400 mb-6">Fill in the basics. You can change them later.</p>

            <form onSubmit={handleSubmit} noValidate>
              <Field id="mun-name" label="MUN name">
                <input
                  id="mun-name"
                  type="text"
                  placeholder="Bangalore MUN 2026"
                  value={form.name}
                  onChange={update("name")}
                  className={inputClass}
                />
              </Field>

              <div className="grid gap-x-4 sm:grid-cols-2">
                <Field id="mun-location" label="Location">
                  <input
                    id="mun-location"
                    type="text"
                    placeholder="Bengaluru"
                    value={form.location}
                    onChange={update("location")}
                    className={inputClass}
                  />
                </Field>
                <Field id="mun-date" label="Date">
                  <input
                    id="mun-date"
                    type="date"
                    value={form.date}
                    onChange={update("date")}
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field id="mun-description" label="Description (optional)">
                <textarea
                  id="mun-description"
                  rows={3}
                  placeholder="A short note about your conference"
                  value={form.description}
                  onChange={update("description")}
                  className={inputClass}
                />
              </Field>

              <div className="border-t border-gray-700 mt-6 pt-6">
                <h2 className="text-xl font-semibold mb-4">Committees</h2>

                <Field
                  id="committee-count"
                  label="How many committees?"
                  hint={`Between 1 and ${MAX_COMMITTEES}.`}
                >
                  <input
                    id="committee-count"
                    type="number"
                    min={1}
                    max={MAX_COMMITTEES}
                    value={countInput}
                    onChange={handleCount}
                    onBlur={handleCountBlur}
                    className={`${inputClass} sm:w-32`}
                  />
                </Field>

                <ul className="space-y-4">
                  {committees.map((c, i) => (
                    <li key={i} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-3">Committee {i + 1}</p>
                      <div className="grid gap-x-4 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                          <Field id={`c-name-${i}`} label="Name">
                            <input
                              id={`c-name-${i}`}
                              type="text"
                              placeholder="UNSC"
                              value={c.name}
                              onChange={updateCommittee(i, "name")}
                              className={inputClass.replace("bg-gray-900", "bg-gray-800")}
                            />
                          </Field>
                        </div>
                      </div>
                      <Field id={`c-topic-${i}`} label="Agenda / topic (optional)">
                        <input
                          id={`c-topic-${i}`}
                          type="text"
                          placeholder="Maritime security"
                          value={c.topic}
                          onChange={updateCommittee(i, "topic")}
                          className={inputClass.replace("bg-gray-900", "bg-gray-800")}
                        />
                      </Field>
                    </li>
                  ))}
                </ul>
              </div>

              <p role="alert" className="text-sm text-red-400 min-h-5 mt-4 mb-1">
                {error}
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-lg font-bold rounded"
              >
                {submitting ? "Creating…" : "Create MUN"}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}