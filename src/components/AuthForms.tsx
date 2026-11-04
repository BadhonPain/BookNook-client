"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/components/ToastProvider";

function getCallbackUrl(value: string | null) {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/";
}

function GoogleButton({ callbackUrl }: { callbackUrl: string }) {
  const [pending, setPending] = useState(false);
  const { notify } = useToast();

  async function handleGoogleSignIn() {
    setPending(true);
    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: callbackUrl,
      });
      if (error) {
        notify(error.message || "Google sign-in could not be started.", "error");
        setPending(false);
      }
    } catch {
      notify("Google sign-in could not be started. Please try again.", "error");
      setPending(false);
    }
  }

  return (
    <button
      className="button button-outline"
      disabled={pending}
      onClick={handleGoogleSignIn}
      type="button"
    >
      {pending ? "Connecting..." : "Continue with Google"}
    </button>
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = getCallbackUrl(searchParams.get("callbackUrl"));
  const { notify } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const { error: signInError } = await authClient.signIn.email({
        email,
        password,
        callbackURL: callbackUrl,
      });
      if (signInError) {
        setError(signInError.message || "We could not sign you in. Check your details and try again.");
        return;
      }
      notify("Welcome back to BookNook.");
      router.replace(callbackUrl);
    } catch {
      setError("We could not reach the sign-in service. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="auth-layout">
      <aside className="auth-aside">
        <p className="eyebrow">Good to have you back</p>
        <h1>Your next favorite is waiting on the shelf.</h1>
        <p>Sign in to pick up where you left off, borrow a book, or share one with another reader.</p>
      </aside>
      <div className="auth-form-wrap">
        <section className="form-card">
          <h2>Welcome back</h2>
          <p className="form-card-intro">Sign in to your BookNook account.</p>
          <form className="form-stack" onSubmit={handleSubmit}>
            <label className="form-field">
              Email address
              <input
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </label>
            <label className="form-field">
              <span className="field-label-row">
                <span>Password</span>
                <span className="forgot-password" title="Password reset is not enabled.">
                  Forgot password?
                </span>
              </span>
              <input
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button" disabled={pending} type="submit">
              {pending ? "Signing in..." : "Log in"} <ArrowRight size={17} aria-hidden="true" />
            </button>
          </form>
          <div className="form-divider">or</div>
          <GoogleButton callbackUrl={callbackUrl} />
          <p className="form-switch">
            New to BookNook? <Link href="/register">Create an account</Link>
          </p>
        </section>
      </div>
    </div>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = getCallbackUrl(searchParams.get("callbackUrl"));
  const { notify } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  function validatePassword(value: string) {
    if (value.length < 6) return "Use at least 6 characters.";
    if (!/[A-Z]/.test(value)) return "Add at least one uppercase letter.";
    if (!/[a-z]/.test(value)) return "Add at least one lowercase letter.";
    return "";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setPending(true);
    try {
      const { error: signUpError } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        image: image.trim() || undefined,
        password,
      });
      if (signUpError) {
        setError(signUpError.message || "We could not create your account. Please try again.");
        return;
      }
      notify("Your account is ready. Please sign in.");
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    } catch {
      setError("We could not reach the registration service. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="auth-layout">
      <aside className="auth-aside">
        <p className="eyebrow">A shelf with your name on it</p>
        <h1>Make a little space for a new story.</h1>
        <p>Join readers who discover, borrow, and pass along books they love.</p>
      </aside>
      <div className="auth-form-wrap">
        <section className="form-card">
          <h2>Create your account</h2>
          <p className="form-card-intro">It only takes a moment to join BookNook.</p>
          <form className="form-stack" onSubmit={handleSubmit}>
            <label className="form-field">
              Your name
              <input
                autoComplete="name"
                onChange={(event) => setName(event.target.value)}
                required
                value={name}
              />
            </label>
            <label className="form-field">
              Email address
              <input
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </label>
            <label className="form-field">
              Photo URL <span className="form-hint">Optional</span>
              <input
                autoComplete="url"
                onChange={(event) => setImage(event.target.value)}
                placeholder="https://..."
                type="url"
                value={image}
              />
            </label>
            <label className="form-field">
              Password
              <input
                autoComplete="new-password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
              <span className="form-hint">
                At least 6 characters, with one uppercase and one lowercase letter.
              </span>
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button" disabled={pending} type="submit">
              {pending ? "Creating account..." : "Create account"}
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </form>
          <div className="form-divider">or</div>
          <GoogleButton callbackUrl={callbackUrl} />
          <p className="form-switch">
            Already have an account? <Link href="/login">Log in</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
