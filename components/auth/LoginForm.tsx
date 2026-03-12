"use client";

import { FormEvent, useState } from "react";

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void> | void;
  errorMessage?: string | null;
  isSubmitting?: boolean;
}

export function LoginForm({ onLogin, errorMessage, isSubmitting = false }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onLogin(email, password);
  };

  return (
    <section className="surface auth-surface">
      <div className="auth-head">
        <h1>Facilities Admin Login</h1>
        <p>Enter credentials to continue.</p>
      </div>

      <form onSubmit={handleSubmit} className="stack-md">
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter email"
            autoComplete="email"
            disabled={isSubmitting}
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
            autoComplete="current-password"
            disabled={isSubmitting}
            required
          />
        </label>

        {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
      </form>
    </section>
  );
}
