"use client";

import { useState } from "react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const restaurants = [
    {
      id: 1,
      name: "Mama Mia's Trattoria",
      cuisine: "Italian",
      distance: "0.8",
      rating: "4.8",
      image:
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
      features: ["🍸 Cocktails", "⭐ 4.8"],
    },
    {
      id: 2,
      name: "The Rooftop Bar",
      cuisine: "Tapas & Drinks",
      distance: "1.2",
      rating: "4.6",
      image:
        "https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=400&h=300&fit=crop",
      features: ["🍸 Craft Cocktails", "⭐ 4.6"],
    },
    {
      id: 3,
      name: "Vegan Garden",
      cuisine: "Plant Based",
      distance: "0.5",
      rating: "4.9",
      image:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
      features: ["🌱 Vegan", "⭐ 4.9"],
    },
  ];

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      alert("Please enter a search term!");
      return;
    }
    alert(`🔍 You searched for: "${searchQuery}"`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-[#2B2D42] tracking-tight">
          Craving something? <br />
          <span className="text-[#B23A2E]">Match it.</span>
        </h1>
        <p className="text-[#6B6B7B] mt-4 text-lg max-w-2xl mx-auto">
          Post your craving. Your squad joins in 1-click. {"Dinner's"} locked.
        </p>

        <div className="max-w-2xl mx-auto mt-8">
          <div className="flex gap-3 bg-white rounded-full shadow-lg p-2 border border-[#F2CC8F]/30">
            <input
              type="text"
              placeholder="Search for a restaurant... (e.g., Tacos near me)"
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
              className="bg-[#B23A2E] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#9A2E24] transition-colors shadow-lg shadow-[#B23A2E]/20"
            >
              Search
            </button>
          </div>
        </div>
      </div>

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
              />
            </div>
            <div className="p-5">
              <h3 className="text-xl font-bold text-[#2B2D42]">
                {restaurant.name}
              </h3>
              <p className="text-sm text-[#6B6B7B] mt-1">
                {restaurant.cuisine} • {restaurant.distance} miles away
              </p>
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
              <button
                onClick={() => alert(`🍽️ You're craving ${restaurant.name}!`)}
                className="mt-4 w-full bg-[#B23A2E] text-white py-2.5 rounded-full font-semibold hover:bg-[#9A2E24] transition-colors text-sm"
              >
                {"I'm"} Craving This
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}