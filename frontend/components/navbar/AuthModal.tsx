"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

export default function AuthModal() {
  const { authModalOpen, authModalMode, closeAuthModal, openAuthModal, login, signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignup = authModalMode === "signup";

  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError(null);
  };

  const handleClose = () => {
    reset();
    closeAuthModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (isSignup) {
        await signup(name, email, password);
        toast.success(`Welcome to Airbnb, ${name.split(" ")[0]}!`);
      } else {
        await login(email, password);
        toast.success("Welcome back!");
      }
      reset();
      closeAuthModal();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={authModalOpen} onClose={handleClose} title={isSignup ? "Sign up" : "Log in"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignup && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">Full name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-transparent px-3 py-3 text-sm outline-none focus:border-foreground"
              placeholder="Jane Doe"
            />
          </div>
        )}
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border bg-transparent px-3 py-3 text-sm outline-none focus:border-foreground"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">Password</label>
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-border bg-transparent px-3 py-3 text-sm outline-none focus:border-foreground"
            placeholder="At least 6 characters"
          />
        </div>

        {error && <p className="text-sm text-primary">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
        >
          {submitting ? "Please wait…" : isSignup ? "Sign up" : "Log in"}
        </button>

        <p className="text-center text-sm text-muted">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              reset();
              openAuthModal(isSignup ? "login" : "signup");
            }}
            className="font-semibold text-foreground underline"
          >
            {isSignup ? "Log in" : "Sign up"}
          </button>
        </p>
        {!isSignup && (
          <p className="rounded-lg bg-black/5 p-3 text-xs text-muted dark:bg-white/10">
            Demo accounts: <b>host1@example.com</b> / <b>guest1@example.com</b> (password: <b>password123</b>)
          </p>
        )}
      </form>
    </Modal>
  );
}
