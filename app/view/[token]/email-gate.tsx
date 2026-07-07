"use client";

import { useState, useRef, useEffect } from "react";

export function EmailGate({
  token,
  linkLabel,
  apiPrefix = "/api/view",
}: {
  token: string;
  linkLabel: string;
  apiPrefix?: string;
}) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(`${apiPrefix}/${token}/request-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (res.ok) {
      setStep("code");
      setSent(true);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } else {
      setError(data.error || "Something went wrong");
    }
    setLoading(false);
  }

  async function handleCodeSubmit() {
    const fullCode = code.join("");
    if (fullCode.length !== 6) return;

    setError("");
    setLoading(true);

    const res = await fetch(`${apiPrefix}/${token}/verify-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: fullCode }),
    });

    const data = await res.json();
    if (res.ok) {
      window.location.reload();
    } else {
      setError(data.error || "Invalid code");
      setCode(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
    setLoading(false);
  }

  async function handleResend() {
    setError("");
    setLoading(true);
    const res = await fetch(`${apiPrefix}/${token}/request-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (res.ok) {
      setSent(true);
      setCode(["", "", "", "", "", ""]);
      setTimeout(() => {
        setSent(false);
      }, 3000);
    } else {
      setError(data.error || "Failed to resend");
    }
    setLoading(false);
  }

  function handleCodeChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    const full = newCode.join("");
    if (full.length === 6) {
      setTimeout(() => handleCodeSubmitFromCode(newCode), 100);
    }
  }

  async function handleCodeSubmitFromCode(codeArr: string[]) {
    const fullCode = codeArr.join("");
    if (fullCode.length !== 6) return;

    setError("");
    setLoading(true);

    const res = await fetch(`${apiPrefix}/${token}/verify-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: fullCode }),
    });

    const data = await res.json();
    if (res.ok) {
      window.location.reload();
    } else {
      setError(data.error || "Invalid code");
      setCode(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
    setLoading(false);
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      handleCodeSubmit();
    }
  }

  // Handle paste
  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      const pasted = e.clipboardData?.getData("text")?.trim();
      if (pasted && /^\d{6}$/.test(pasted)) {
        e.preventDefault();
        const digits = pasted.split("");
        setCode(digits);
        inputRefs.current[5]?.focus();
        setTimeout(() => handleCodeSubmitFromCode(digits), 200);
      }
    }
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="mb-10 flex items-center gap-3">
          <span
            className="flex h-[34px] w-[34px] items-center justify-center border border-[#17191c] text-[11px] font-medium tracking-[0.04em]"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            DCC
          </span>
          <span
            className="text-[10.5px] uppercase tracking-[0.22em] text-[#3a3d42]"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {linkLabel}
          </span>
        </div>

        {step === "email" && (
          <form onSubmit={handleEmailSubmit}>
            <h1
              className="mb-3 text-[28px] font-light leading-tight"
              style={{ fontFamily: "'Spectral', Georgia, serif" }}
            >
              Verify your email
            </h1>
            <p className="mb-8 text-[15px] leading-relaxed text-[#5d6168]">
              This data room requires email verification. Enter the email address you were given access with.
            </p>

            <div className="mb-5">
              <label
                className="mb-2 block text-[11px] uppercase tracking-[0.08em] text-[#5d6168]"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="you@company.com"
                className="w-full border border-black/20 bg-[#faf9f6] px-4 py-3 text-[15px] outline-none focus:border-[#8a6d40]"
                style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
              />
            </div>

            {error && (
              <p className="mb-4 text-[14px] text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full cursor-pointer bg-[#17191c] py-3.5 text-[14px] font-medium text-[#f3efe7] hover:bg-[#2c2f34] disabled:cursor-default disabled:opacity-50"
              style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
            >
              {loading ? "Sending code..." : "Continue"}
            </button>
          </form>
        )}

        {step === "code" && (
          <div>
            <h1
              className="mb-3 text-[28px] font-light leading-tight"
              style={{ fontFamily: "'Spectral', Georgia, serif" }}
            >
              Enter verification code
            </h1>
            <p className="mb-8 text-[15px] leading-relaxed text-[#5d6168]">
              We sent a 6-digit code to{" "}
              <strong className="text-[#17191c]">{email}</strong>. Check your inbox.
            </p>

            {/* Code inputs */}
            <div className="mb-6 flex gap-2.5 justify-center">
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="h-14 w-11 border border-black/20 bg-[#faf9f6] text-center text-[22px] font-medium outline-none focus:border-[#8a6d40] focus:bg-white"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                />
              ))}
            </div>

            {error && (
              <p className="mb-4 text-center text-[14px] text-red-600">{error}</p>
            )}

            {loading && (
              <p className="mb-4 text-center text-[13px] text-[#8a6d40]">Verifying...</p>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={() => { setStep("email"); setError(""); setCode(["","","","","",""]); }}
                className="cursor-pointer border-none bg-transparent text-[13px] text-[#5d6168] underline"
              >
                Use a different email
              </button>
              <span className="mx-3 text-[#b9b2a4]">&middot;</span>
              <button
                onClick={handleResend}
                disabled={loading}
                className="cursor-pointer border-none bg-transparent text-[13px] text-[#8a6d40] underline disabled:opacity-50"
              >
                {sent ? "Code sent!" : "Resend code"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
