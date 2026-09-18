import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import Logo from "../Logo";
import { Lock, Mail, AlertCircle, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);

  const { login, resetPassword } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate("/admin");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Invalid email or password. Please check your credentials.");
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your admin email address first.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await resetPassword(email);
      setMessage("Password reset email sent! Check your inbox.");
      setIsReset(false);
    } catch (err: any) {
      setError(err?.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-crimson selection:text-cream">
      {/* Background grain */}
      <div aria-hidden className="noise pointer-events-none fixed inset-0 z-10 opacity-[0.05]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-20">
        <div className="flex justify-center mb-6">
          <a href="/" className="inline-block group">
            <Logo variant="full" tone="light" className="h-20 w-auto text-cream" />
          </a>
        </div>
        <h2 className="text-center font-display text-2xl md:text-3xl text-cream font-semibold tracking-tight">
          ARJU Management Console
        </h2>
        <p className="mt-2 text-center text-xs uppercase tracking-widest text-stone">
          Authorized Staff & Admin Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-20">
        <div className="bg-coal border border-white/10 py-8 px-6 shadow-2xl rounded-xl sm:px-10">
          {error && (
            <div className="mb-4 bg-crimson/10 border border-crimson/30 rounded-lg p-3 flex items-start gap-2.5 text-cream text-xs">
              <AlertCircle className="w-4 h-4 text-crimson shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-4 bg-emerald-950/40 border border-emerald-500/30 rounded-lg p-3 flex items-start gap-2.5 text-cream text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {!isReset ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone mb-1.5 font-medium">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone/60 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@arju.ca"
                    className="w-full bg-charcoal border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm text-cream placeholder:text-stone/40 focus:outline-none focus:border-crimson focus:ring-1 focus:ring-crimson"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs uppercase tracking-wider text-stone font-medium">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsReset(true)}
                    className="text-xs text-crimson hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone/60 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-charcoal border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm text-cream placeholder:text-stone/40 focus:outline-none focus:border-crimson focus:ring-1 focus:ring-crimson"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-crimson hover:bg-crimson-bright text-cream font-medium py-2.5 px-4 rounded-lg text-sm transition cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In to Console"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone mb-1.5 font-medium">
                  Enter Your Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone/60 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@arju.ca"
                    className="w-full bg-charcoal border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm text-cream placeholder:text-stone/40 focus:outline-none focus:border-crimson"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-crimson hover:bg-crimson-bright text-cream font-medium py-2.5 px-4 rounded-lg text-sm transition cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Instructions"}
              </button>

              <button
                type="button"
                onClick={() => setIsReset(false)}
                className="w-full text-center text-xs text-stone hover:text-cream mt-2"
              >
                Back to Sign In
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center text-xs text-stone">
            <a href="/" className="flex items-center gap-1 hover:text-cream transition">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Website
            </a>
            <span>v2.0 • Firebase</span>
          </div>
        </div>
      </div>
    </div>
  );
}
