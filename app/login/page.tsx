"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSignUp = async () => {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: email.split("@")[0] },
      },
    });
    if (error) {
      setMessage("Sign up error: " + error.message);
    } else {
      setMessage("Account created! You are now logged in.");
      setTimeout(() => router.push("/"), 1500);
    }
    setLoading(false);
  };

  const handleSignIn = async () => {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setMessage("Login error: " + error.message);
    } else {
      setMessage("Logged in successfully!");
      setTimeout(() => router.push("/"), 1000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-4">
      <div className="max-w-md w-full glass-card rounded-3xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2B2D42]">
            Welcome to <span className="text-[#B23A2E]">VibeMatch</span>
          </h1>
          <p className="text-[#6B6B7B] mt-2">
            Sign in to start craving with your squad
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-xl border border-[#F2CC8F]/30 outline-none focus:border-[#B23A2E] transition-colors"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            className="w-full px-4 py-3 rounded-xl border border-[#F2CC8F]/30 outline-none focus:border-[#B23A2E] transition-colors"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSignIn();
            }}
          />

          {message && (
            <div className={`text-sm p-3 rounded-xl ${message.includes("error") || message.includes("Error") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
              {message}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="flex-1 bg-[#B23A2E] text-white py-3 rounded-xl font-semibold hover:bg-[#9A2E24] transition-colors disabled:opacity-50"
            >
              {loading ? "Loading..." : "Sign In"}
            </button>
            <button
              onClick={handleSignUp}
              disabled={loading}
              className="flex-1 bg-[#F2CC8F] text-[#2B2D42] py-3 rounded-xl font-semibold hover:bg-[#E8C07A] transition-colors disabled:opacity-50"
            >
              Sign Up
            </button>
          </div>

          <p className="text-xs text-[#6B6B7B] text-center mt-4">
            By signing up, you agree to our magical terms of deliciousness.
          </p>
        </div>
      </div>
    </div>
  );
}