"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "@supabase/supabase-js";

// ---------- REAL NYC RESTAURANTS ----------
const NYC_RESTAURANTS = [
  {
    id: "congee-village",
    name: "Congee Village",
    cuisine: "Cantonese",
    distance: "0.8 mi",
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=300&fit=crop",
    address: "100 Allen St, NYC",
    features: ["🥣 Congee", "🦐 Seafood", "🥢 Dim Sum"],
    vibe: "Casual, bustling, great for groups",
  },
  {
    id: "nom-wah",
    name: "Nom Wah Tea Parlor",
    cuisine: "Dim Sum",
    distance: "0.3 mi",
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&h=300&fit=crop",
    address: "13 Doyers St, NYC",
    features: ["🥟 Dim Sum", "🍵 Tea", "🥢 Dumplings"],
    vibe: "Historic, cozy, perfect for brunch",
  },
  {
    id: "xinjiang",
    name: "Xin Jiang Foods",
    cuisine: "Uyghur",
    distance: "1.2 mi",
    rating: 4.4,
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
    address: "26 Pell St, NYC",
    features: ["🍖 Lamb Skewers", "🥟 Hand-pulled Noodles", "🌶️ Spicy"],
    vibe: "Authentic, bold flavors, lively",
  },
  {
    id: "jing-fong",
    name: "Jing Fong",
    cuisine: "Cantonese",
    distance: "0.6 mi",
    rating: 4.3,
    image:
      "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&h=300&fit=crop",
    address: "20 Elizabeth St, NYC",
    features: ["🥟 Dim Sum", "🥢 Banquet", "🦐 Seafood"],
    vibe: "Grand, traditional, good for large groups",
  },
  {
    id: "wo-hop",
    name: "Wo Hop",
    cuisine: "Cantonese",
    distance: "0.4 mi",
    rating: 4.2,
    image:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=300&fit=crop",
    address: "17 Mott St, NYC",
    features: ["🍜 Noodles", "🥢 Chinese", "🦐 Seafood"],
    vibe: "No-frills, late-night favorite",
  },
  {
    id: "katzs",
    name: "Katz's Delicatessen",
    cuisine: "American",
    distance: "1.5 mi",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1550596334-7a40b711e3e9?w=400&h=300&fit=crop",
    address: "205 E Houston St, NYC",
    features: ["🥩 Pastrami", "🥪 Sandwiches", "🍺 Beer"],
    vibe: "Iconic, bustling, must-visit",
  },
];

// ---------- FAKE FRIENDS ----------
const FRIENDS = [
  { id: "f1", name: "Alice", likes: ["Congee", "Dim Sum"], dislikes: ["Spicy"] },
  { id: "f2", name: "Bob", likes: ["Pastrami", "Beer"], dislikes: ["Seafood"] },
  { id: "f3", name: "Charlie", likes: ["Noodles", "Lamb"], dislikes: [] },
  { id: "f4", name: "Diana", likes: ["Dim Sum", "Tea"], dislikes: ["Crowds"] },
];

// ---------- FAKE USER (SKIPS LOGIN!) ----------
const FAKE_USER: User = {
  id: "fake-user-123",
  email: "demo@vibematch.com",
  created_at: new Date().toISOString(),
  aud: "",
  role: "",
  app_metadata: {},
  user_metadata: {},
  identities: [],
  confirmed_at: "",
  last_sign_in_at: "",
  updated_at: "",
  is_anonymous: false,
} as User;

// ---------- HELPER: compute likelihood ----------
function getLikelihood(friend: any, restaurant: any): number {
  let score = 50;
  const features = restaurant.features.map((f: string) => f.split(" ")[1] || f);
  for (const like of friend.likes) {
    if (features.some((f: string) => f.toLowerCase().includes(like.toLowerCase()))) {
      score += 20;
    }
  }
  for (const dislike of friend.dislikes) {
    if (features.some((f: string) => f.toLowerCase().includes(dislike.toLowerCase()))) {
      score -= 30;
    }
  }
  return Math.max(0, Math.min(100, score));
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurants, setRestaurants] = useState(NYC_RESTAURANTS);
  const [user, setUser] = useState<User | null>(FAKE_USER); // FAKE USER ALWAYS LOGGED IN
  const [saving, setSaving] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const router = useRouter();

  // No real auth needed — we have fake user!

  const handleSearch = () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setRestaurants(NYC_RESTAURANTS);
      return;
    }
    const filtered = NYC_RESTAURANTS.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.features.some((f) => f.toLowerCase().includes(q)) ||
        r.address.toLowerCase().includes(q)
    );
    setRestaurants(filtered);
  };

  const handleCraving = async (restaurant: any) => {
    // No login check needed — fake user is always logged in
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    alert(`✅ Craving for "${restaurant.name}" saved! (Demo)`);
    setSaving(false);
    setSelectedRestaurant(restaurant);
    setShowInviteModal(true);
  };

  const handleSendInvite = () => {
    if (!selectedRestaurant) return;
    const sorted = [...FRIENDS].sort(
      (a, b) =>
        getLikelihood(b, selectedRestaurant) - getLikelihood(a, selectedRestaurant)
    );
    const topFriend = sorted[0];
    alert(
      `📨 Invite sent to friends!\n\n` +
      `Restaurant: ${selectedRestaurant.name}\n` +
      `Vibe: ${selectedRestaurant.vibe}\n\n` +
      `🔝 Most likely to join: ${topFriend.name} (${getLikelihood(topFriend, selectedRestaurant)}% match)\n\n` +
      `✅ SMS sent to: ${sorted.map(f => f.name).join(", ")}\n` +
      `📱 All friends have been notified (demo).`
    );
    setShowInviteModal(false);
  };

  const handleVibeCheck = (restaurant: any) => {
    const friendsList = FRIENDS.map(
      (f) =>
        `${f.name}: ${getLikelihood(f, restaurant)}% match`
    ).join("\n");
    alert(
      `🧘 Vibe Check for ${restaurant.name}\n\n` +
      `✨ ${restaurant.vibe}\n\n` +
      `👥 Friends' likelihood to join:\n${friendsList}\n\n` +
      `🍽️ Tonight at 7:30 PM? Let's go!`
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header with fake user */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-[#6B6B7B]">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            🎬 Demo Mode: {user?.email || "demo@vibematch.com"}
          </span>
        </div>
        <Link href="/dashboard" className="text-sm text-[#B23A2E] hover:underline">
          My Cravings →
        </Link>
      </div>

      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-[#2B2D42] tracking-tight">
          Craving something? <br />
          <span className="text-[#B23A2E]">Match it.</span>
        </h1>
        <p className="text-[#6B6B7B] mt-4 text-lg max-w-2xl mx-auto">
          Post your craving. Your squad joins in 1-click.
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mt-8">
          <div className="flex gap-3 bg-white rounded-full shadow-lg p-2 border border-[#F2CC8F]/30">
            <input
              type="text"
              placeholder="Search for a restaurant... (try 'congee' or 'dim sum')"
              className="flex-1 px-6 py-3 rounded-full outline-none text-[#2B2D42] placeholder-[#6B6B7B]/60"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="bg-[#B23A2E] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#9A2E24] transition-colors shadow-lg shadow-[#B23A2E]/20"
            >
              Search
            </button>
          </div>
          <div className="text-xs text-[#6B6B7B] mt-2">
            🎬 Demo Mode: try "congee", "dim sum", "noodles", "pastrami", or leave empty to see all
          </div>
        </div>
      </div>

      {/* Restaurant Grid */}
      {restaurants.length === 0 ? (
        <div className="text-center text-[#6B6B7B] py-12">
          No restaurants match your search. Try something else!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="glass-card rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300"
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
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-[#2B2D42]">
                    {restaurant.name}
                  </h3>
                  <span className="bg-[#F2CC8F]/30 text-[#B23A2E] text-xs font-semibold px-2 py-1 rounded-full">
                    ⭐ {restaurant.rating}
                  </span>
                </div>
                <p className="text-sm text-[#6B6B7B] mt-1">{restaurant.address}</p>
                <p className="text-xs text-[#6B6B7B]">{restaurant.distance} • {restaurant.cuisine}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {restaurant.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="bg-[#F2CC8F]/30 text-[#B23A2E] text-xs font-semibold px-3 py-1 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={() => handleCraving(restaurant)}
                    disabled={saving}
                    className="w-full bg-[#B23A2E] text-white py-2.5 rounded-full font-semibold hover:bg-[#9A2E24] transition-colors text-sm disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "🍽️ I'm Craving This"}
                  </button>
                  <button
                    onClick={() => handleVibeCheck(restaurant)}
                    className="w-full bg-[#2B2D42] text-white py-2 rounded-full font-semibold hover:bg-[#3A3C52] transition-colors text-sm"
                  >
                    🧘 Vibe Check
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && selectedRestaurant && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-[#2B2D42]">📨 Invite Your Squad</h2>
            <p className="text-sm text-[#6B6B7B] mt-2">
              {selectedRestaurant.name} – {selectedRestaurant.vibe}
            </p>
            <div className="mt-4 space-y-2">
              <p className="font-semibold">👥 Friends (sorted by match):</p>
              {[...FRIENDS]
                .sort((a, b) => getLikelihood(b, selectedRestaurant) - getLikelihood(a, selectedRestaurant))
                .map((f) => (
                  <div key={f.id} className="flex justify-between text-sm border-b border-gray-100 py-1">
                    <span>{f.name}</span>
                    <span className="text-[#B23A2E] font-semibold">{getLikelihood(f, selectedRestaurant)}% match</span>
                  </div>
                ))}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSendInvite}
                className="flex-1 bg-[#B23A2E] text-white py-2.5 rounded-full font-semibold hover:bg-[#9A2E24] transition-colors"
              >
                📱 Send Invites
              </button>
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 bg-gray-200 text-[#2B2D42] py-2.5 rounded-full font-semibold hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
            <p className="text-xs text-[#6B6B7B] mt-3 text-center">
              🎬 Demo: No login needed. All notifications are simulated.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}