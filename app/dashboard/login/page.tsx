"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/dashboard-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      setError("Incorrect password");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(160deg, #FFF8F0 0%, #FDEEE0 60%, #FDE4CC 100%)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-script text-5xl mb-1" style={{ color: "#D4437A" }}>Signs by Sophia</p>
          <p className="font-display text-sm font-semibold" style={{ color: "#9A607A" }}>Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl shadow-xl overflow-hidden" style={{ background: "white" }}>
          <div className="px-8 py-8 space-y-4">
            <div>
              <label className="font-display text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: "#9A607A" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                autoFocus
                className="w-full font-display text-sm px-4 py-3 rounded-xl border outline-none focus:border-[#D4437A] transition-colors"
                style={{ borderColor: "#E8B0C8" }}
              />
            </div>

            {error && (
              <p className="font-display text-xs font-semibold text-center" style={{ color: "#D4437A" }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full font-display font-bold text-sm py-3 rounded-xl text-white transition-all disabled:opacity-50"
              style={{ background: "#D4437A" }}
            >
              {loading ? "Checking…" : "Enter"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
