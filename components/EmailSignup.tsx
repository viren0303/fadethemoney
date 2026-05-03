"use client";

import { useState } from "react";

export function EmailSignup({ ctaLabel = "Get streak alerts" }: { ctaLabel?: string }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setDone(true);
  }

  if (done) {
    return <div className="signup-msg">✓ You&apos;re on the list. We&apos;ll email you when a streak hits 2.</div>;
  }

  return (
    <form className="signup-inline" onSubmit={onSubmit}>
      <input
        type="email"
        className="input"
        placeholder="you@example.com"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit" className="btn-primary">{ctaLabel}</button>
    </form>
  );
}
