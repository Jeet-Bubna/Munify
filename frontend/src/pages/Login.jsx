import { useState } from "react";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Field({ id, label, children }) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full bg-gray-900 text-white placeholder-gray-500 border border-gray-700 rounded px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function Login({ onLogin, onSignup }) {
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [doneMessage, setDoneMessage] = useState(null);

  const [login, setLogin] = useState({ email: "", password: "" });
  const [signup, setSignup] = useState({
    name: "",
    email: "",
    role: "delegate",
    password: "",
  });

  const switchMode = (next) => {
    setMode(next);
    setError("");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!emailRe.test(login.email.trim())) return setError("Enter a valid email address.");
    if (!login.password) return setError("Enter your password.");
    setError("");
    // Call your login API here, or pass an onLogin prop
    onLogin?.({ email: login.email.trim(), password: login.password });
    setDoneMessage({ title: "You’re logged in", text: "Taking you to your dashboard." });
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (!signup.name.trim()) return setError("Enter your full name.");
    if (!emailRe.test(signup.email.trim())) return setError("Enter a valid email address.");
    if (signup.password.length < 8)
      return setError("Use a password with at least 8 characters.");
    setError("");
    // Call your signup API here, or pass an onSignup prop
    onSignup?.({ ...signup, name: signup.name.trim(), email: signup.email.trim() });
    setDoneMessage({
      title: "Account created",
      text: `Welcome to JayBlur, ${signup.name.trim().split(" ")[0]}.`,
    });
  };

  const isLogin = mode === "login";

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4 py-12">
      <main className="w-full max-w-md bg-gray-800 rounded-lg p-8">
        {doneMessage ? (
          <div className="text-center">
            <h1 className="text-3xl font-semibold mb-2">{doneMessage.title}</h1>
            <p className="text-gray-400">{doneMessage.text}</p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-semibold mb-1">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-gray-400 mb-6">
              {isLogin ? "Log in to manage your committee." : "Sign up to run a MUN."}
            </p>

            <div className="flex gap-6 border-b border-gray-700 mb-6" role="tablist">
              {[
                ["login", "Login"],
                ["signup", "Signup"],
              ].map(([key, text]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={mode === key}
                  onClick={() => switchMode(key)}
                  className={`pb-2.5 -mb-px border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    mode === key
                      ? "text-white border-blue-500"
                      : "text-gray-400 border-transparent hover:text-white"
                  }`}
                >
                  {text}
                </button>
              ))}
            </div>

            {isLogin ? (
              <form onSubmit={handleLogin} noValidate>
                <Field id="l-email" label="Email">
                  <input
                    id="l-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={login.email}
                    onChange={(e) => setLogin({ ...login, email: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field id="l-pass" label="Password">
                  <input
                    id="l-pass"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Your password"
                    value={login.password}
                    onChange={(e) => setLogin({ ...login, password: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <p role="alert" className="text-sm text-red-400 min-h-5 mb-1">
                  {error}
                </p>
                <button
                  type="submit"
                  className="w-full mt-2 py-3 bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold rounded"
                >
                  Log in
                </button>
                <p className="mt-5 text-center text-sm text-gray-400">
                  New to JayBlur?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("signup")}
                    className="text-blue-400 underline"
                  >
                    Create an account
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleSignup} noValidate>
                <Field id="s-name" label="Full name">
                  <input
                    id="s-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your name"
                    value={signup.name}
                    onChange={(e) => setSignup({ ...signup, name: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field id="s-email" label="Email">
                  <input
                    id="s-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={signup.email}
                    onChange={(e) => setSignup({ ...signup, email: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field id="s-pass" label="Password">
                  <input
                    id="s-pass"
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={signup.password}
                    onChange={(e) => setSignup({ ...signup, password: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <p role="alert" className="text-sm text-red-400 min-h-5 mb-1">
                  {error}
                </p>
                <button
                  type="submit"
                  className="w-full mt-2 py-3 bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold rounded"
                >
                  Create account
                </button>
                <p className="mt-5 text-center text-sm text-gray-400">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="text-blue-400 underline"
                  >
                    Log in
                  </button>
                </p>
              </form>
            )}
          </>
        )}
      </main>
    </div>
  );
}