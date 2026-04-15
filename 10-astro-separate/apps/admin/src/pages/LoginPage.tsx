import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password123");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg("Signing in…");
    const res = await apiFetch("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, scope: "ADMIN" }),
    });
    if (res.ok) {
      nav("/admin");
    } else {
      setMsg("Invalid credentials");
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <h1 className="text-2xl font-semibold">Admin sign in</h1>
      <p className="mt-2 text-sm text-slate-600">Use seeded admin@example.com / password123 locally.</p>
      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <input
          className="w-full rounded border px-3 py-2 text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
        <input
          className="w-full rounded border px-3 py-2 text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />
        <p className="text-sm text-slate-600">{msg}</p>
        <button className="w-full rounded bg-blue-600 py-2 text-sm font-semibold text-white" type="submit">
          Sign in
        </button>
      </form>
    </div>
  );
}
