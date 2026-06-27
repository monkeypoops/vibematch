"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "@supabase/supabase-js";

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  distance: string;
  rating: string | number;
  image: string;
  address: string;
  place_id: string;
  phone: string | null;
  website: string | null;
  features: string[];
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>("restaurants in NYC");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const router = useRouter();
  const hasSearched = useRef<boolean>(false);

  // Check user session with logging
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session error (home):", sessionError);
      }
      if (session?.user) {
        console.log("Home: User logged in:", session.user.email);
        setUser(session.user);
      } else {
        console.log("Home: No user session");
        setUser(null);
      }
    };
    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Home: Auth state changed:", _event, session?.user?.email);
      setUser(session?.user || null);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  // Auto-search on load (with better logging)
  useEffect(() => {
    if (!hasSearched.current) {
      hasSearched.current = true;
      const doSearch = async () => {
        console.log("Home: Auto-searching for:", searchQuery);
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(
            `/api/search?query=${encodeURIComponent(searchQuery)}`
          );
          const data = await response.json();
          if (response.ok) {
            console.log(`Home: Found ${data.restaurants?.length || 0} restaurants`);
            setRestaurants(data.restaurants);
          } else {
            setError(data.error || "Failed to fetch restaurants.");
            console.error("Home: Search API error:", data.error);
          }
        } catch (err) {
          setError("Something went wrong. Please try again.");
          console.error("Home: Search fetch error:", err);
        } finally {
          setLoading(false);
        }
      };
      doSearch();
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    if (searchQuery.trim() === "") {
      setError("Please enter a search term!");
      return;
    }

    setLoading(true);
    setError(null);
    console.log("Home: Manual search for:", searchQuery);

    try {
      const response = await fetch(
        `/api/search?query=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (response.ok) {
        console.log(`Home: Found ${data.restaurants?.length || 0} restaurants`);
        setRestaurants(data.restaurants);
      } else {
        setError(data.error || "Failed to fetch restaurants.");
        console.error("Home: Search API error:", data.error);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error("Home: Search fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCraving = async (restaurant: Restaurant) => {
    if (!user) {
      alert("Please log in first to create a craving!");
      router.push("/login");
      return;
    }

    console.log("Home: Creating craving for", restaurant.name, "by user", user.email);
    setSaving(true);
    try {
      // Ensure profile exists
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.log("Home: Profile missing, creating one for", user.id);
        const { error: insertError } = await supabase
          .from("profiles")
          .insert([{ id: user.id, full_name: user.email?.split("@")[0] || "User" }]);
        if (insertError) {
          console.error("Home: Failed to create profile:", insertError);
          throw insertError;
        }
        console.log("Home: Profile created successfully");
      }

      const scheduledTime = new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString();

      const { data: craving, error: cravingError } = await supabase
        .from("cravings")
        .insert([
          {
            host_id: user.id,
            restaurant_place_id: restaurant.place_id || restaurant.id,
            restaurant_name: restaurant.name,
            restaurant_address: restaurant.address,
            restaurant_photo: restaurant.image,
            scheduled_time: scheduledTime,
            max_people: 5,
            status: "open",
          },
        ])
        .select()
        .single();

      if (cravingError) {
        console.error("Home: Craving insert error:", cravingError);
        throw cravingError;
      }

      console.log("Home: Craving created:", craving?.id);
      alert(`🎉 Craving created for "${restaurant.name}"!\nShare the link with your friends to join!`);
      router.push("/dashboard");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Home: Craving error:", errorMessage);
      alert("Error saving craving: " + errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* User status bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-[#6B6B7B]">
          {user ? (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Logged in as {user.email}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              <Link href="/login" className="text-[#B23A2E] hover:underline">
                Log in
              </Link>
            </span>
          )}
        </div>
        <Link href="/dashboard" className="text-sm text-[#B23A2E] hover:underline">
          My Cravings →
        </Link>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-[#2B2D42] tracking-tight">
          Craving something? <br />
          <span className="text-[#B23A2E]">Match it.</span>
        </h1>
        <p className="text-[#6B6B7B] mt-4 text-lg max-w-2xl mx-auto">
          Post your craving. Your squad joins in 1-click. Dinner&apos;s locked.
        </p>

        <div className="max-w-2xl mx-auto mt-8">
          <div className="flex gap-3 bg-white rounded-full shadow-lg p-2 border border-[#F2CC8F]/30">
            <input
              type="text"
              placeholder="Search for a restaurant... (e.g., Pizza in Brooklyn)"
              className="flex-1 px-6 py-3 rounded-full outline-none text-[#2B2D42] placeholder-[#6B6B7B]/60"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-[#B23A2E] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#9A2E24] transition-colors shadow-lg shadow-[#B23A2E]/20 disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-[#B23A2E] text-xl">Finding the best spots in NYC...</div>
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center text-[#6B6B7B] py-12">
          No restaurants found. Try a different search!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="glass-card rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="h-48 w-full bg-[#E07A5F]/20 overflow-hidden">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=400&h=300&fit=crop";
                  }}
                />
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold text-[#2B2D42]">
                  {restaurant.name}
                </h3>
                <p className="text-sm text-[#6B6B7B] mt-1">
                  {restaurant.address}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#B23A2E]">
                    ⭐ {restaurant.rating}
                  </span>
                  <span className="text-xs text-[#6B6B7B]">• {restaurant.distance}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {restaurant.features.slice(0, 3).map((feature, idx) => (
                    <span
                      key={idx}
                      className="bg-[#F2CC8F]/30 text-[#B23A2E] text-xs font-semibold px-3 py-1 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => handleCraving(restaurant)}
                  disabled={saving}
                  className="mt-4 w-full bg-[#B23A2E] text-white py-2.5 rounded-full font-semibold hover:bg-[#9A2E24] transition-colors text-sm disabled:opacity-50"
                >
                  {saving ? "Saving..." : "I&apos;m Craving This"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}