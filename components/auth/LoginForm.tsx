"use client";

import { FormEvent, useState } from "react";
import {
  ADMIN_LOGIN_PASSWORD,
  ADMIN_LOGIN_USERNAME
} from "@/lib/constants";

interface LoginFormProps {
  onLogin: (username: string, password: string) => void;
  errorMessage?: string | null;
}

export function LoginForm({ onLogin, errorMessage }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onLogin(username, password);
  };

  return (
    <section className="surface auth-surface">
      <div className="auth-head">
        <h1>Facilities Admin Login</h1>
        <p>Enter credentials to continue.</p>
      </div>

      <form onSubmit={handleSubmit} className="stack-md">
        <label className="field">
          <span>Username</span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Enter username"
            autoComplete="username"
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
            required
          />
        </label>

        {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

        <button type="submit" className="btn btn-primary">
          Login
        </button>
      </form>

      <p className="auth-note">
        Demo credentials: <strong>{ADMIN_LOGIN_USERNAME}</strong> /{" "}
        <strong>{ADMIN_LOGIN_PASSWORD}</strong>
      </p>
    </section>
  );
}

