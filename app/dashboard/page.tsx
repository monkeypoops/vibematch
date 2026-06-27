"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "@supabase/supabase-js";

interface Craving {
  id: string;
  restaurant_name: string;
  restaurant_address: string;
  scheduled_time: string;
  status: string;
  max_people: number;
  created_at: string;
}

export default function Dashboard() {
  const [cravings, setCravings] = useState<Craving[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const fetchCravings = async (userId: string) => {
    setLoading(true);
    console.log("Dashboard: Fetching cravings for user:", userId);

    const { data, error } = await supabase
      .from("cravings")
      .select("*")
      .eq("host_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Dashboard: Error fetching cravings:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      alert(`Error fetching cravings: ${error.message} (Code: ${error.code})`);
    } else {
      console.log(`Dashboard: Found ${data?.length || 0} cravings`);
      setCravings(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    const checkUser = async () => {
      console.log("Dashboard: Checking session...");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Dashboard: Session error:", sessionError);
        router.push("/login");
        return;
      }

      if (!session) {
        console.log("Dashboard: No session found, redirecting to login.");
        router.push("/login");
        return;
      }

      console.log("Dashboard: User is logged in:", session.user.email);
      setUser(session.user);
      await fetchCravings(session.user.id);
    };

    checkUser();

    // Optional: listen for auth changes and redirect if user logs out
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        console.log("Dashboard: User logged out, redirecting.");
        router.push("/login");
      }
    });

    return () => listener?.subscription.unsubscribe();
  }, [router]);

  const handleCloseCraving = async (cravingId: string) => {
    console.log("Dashboard: Closing craving:", cravingId);
    const { error } = await supabase
      .from("cravings")
      .update({ status: "closed" })
      .eq("id", cravingId);

    if (error) {
      console.error("Dashboard: Error closing craving:", error);
      alert("Error closing craving: " + error.message);
    } else {
      console.log("Dashboard: Craving closed successfully");
      setCravings(cravings.map((c) => (c.id === cravingId ? { ...c, status: "closed" } : c)));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#FDFBF7]">
        <div className="text-[#B23A2E] text-xl">Loading your cravings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 bg-[#FDFBF7] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#2B2D42]">
          🍽️ My Cravings
        </h1>
        <Link
          href="/"
          className="bg-[#B23A2E] text-white px-6 py-2 rounded-full hover:bg-[#9A2E24] transition-colors text-sm"
        >
          + New Craving
        </Link>
      </div>

      {cravings.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <p className="text-[#6B6B7B] text-lg">No cravings yet.</p>
          <p className="text-[#6B6B7B] text-sm mt-2">
            Search for a restaurant and click &quot;I&apos;m Craving This&quot; to get started!
          </p>
          <Link
            href="/"
            className="inline-block mt-4 bg-[#B23A2E] text-white px-8 py-3 rounded-full hover:bg-[#9A2E24] transition-colors"
          >
            Find a Restaurant
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {cravings.map((craving) => (
            <div
              key={craving.id}
              className={`glass-card rounded-2xl p-6 border-l-4 ${craving.status === "closed" ? "border-gray-400 opacity-60" : "border-[#B23A2E]"}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-[#2B2D42]">
                    {craving.restaurant_name}
                  </h3>
                  <p className="text-sm text-[#6B6B7B] mt-1">
                    📍 {craving.restaurant_address}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-3 text-sm">
                    <span className="bg-[#F2CC8F]/20 px-3 py-1 rounded-full">
                      🕐 {new Date(craving.scheduled_time).toLocaleString()}
                    </span>
                    <span className="bg-[#F2CC8F]/20 px-3 py-1 rounded-full">
                      👥 Max {craving.max_people} people
                    </span>
                    <span className={`px-3 py-1 rounded-full ${craving.status === "open" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {craving.status === "open" ? "🟢 Open" : "🔒 Closed"}
                    </span>
                  </div>
                </div>
                {craving.status === "open" && (
                  <button
                    onClick={() => handleCloseCraving(craving.id)}
                    className="bg-gray-200 text-[#2B2D42] px-4 py-2 rounded-full hover:bg-gray-300 transition-colors text-sm"
                  >
                    Close Craving
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}