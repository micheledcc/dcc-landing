"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      const data = await res.json();
      setError(data.error || "Login failed");
    }
    setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3efe7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: "48px 40px",
          width: "100%",
          maxWidth: 400,
          border: "1px solid rgba(23,25,28,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 32,
          }}
        >
          <span
            style={{
              width: 34,
              height: 34,
              border: "1px solid #17191c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.04em",
            }}
          >
            DCC
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.18em",
              color: "#3a3d42",
              textTransform: "uppercase",
            }}
          >
            Dashboard
          </span>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.08em",
              color: "#5d6168",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px 14px",
              fontSize: 15,
              border: "1px solid rgba(23,25,28,0.2)",
              background: "#faf9f6",
              fontFamily: "'IBM Plex Sans', sans-serif",
              outline: "none",
            }}
          />
        </div>

        <div style={{ marginBottom: 28 }}>
          <label
            style={{
              display: "block",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.08em",
              color: "#5d6168",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px 14px",
              fontSize: 15,
              border: "1px solid rgba(23,25,28,0.2)",
              background: "#faf9f6",
              fontFamily: "'IBM Plex Sans', sans-serif",
              outline: "none",
            }}
          />
        </div>

        {error && (
          <div
            style={{
              color: "#b44",
              fontSize: 14,
              marginBottom: 16,
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            background: "#17191c",
            color: "#f3efe7",
            border: "none",
            fontSize: 14,
            fontWeight: 500,
            fontFamily: "'IBM Plex Sans', sans-serif",
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
