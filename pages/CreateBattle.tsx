"use client";

import Bottombar from "@/components/Bottombar";
import Navbar from "@/components/Navbar";
import { useWallet } from "@/context/useWallet";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

// Song type definition
interface Song {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
}

const CreateBattle = () => {
  const { isConnected } = useWallet();
  const router = useRouter();
  const [battleTitle, setBattleTitle] = useState("");
  const [description, setDescription] = useState("");
  const [songs, setSongs] = useState(["", ""]); // Two fixed inputs for songs
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Song[]>([]); // Added proper typing
  const [activeInput, setActiveInput] = useState<number | null>(null); // Track which input is active

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  if (!isConnected) {
    return null;
  }

  // Fetch song suggestions from the backend or music API
  const fetchSuggestions = async (query: string) => {
    try {
      const response = await fetch(`/api/songs?q=${query}`); // Replace with your backend or API endpoint
      const data = await response.json();
      setSuggestions(data.tracks || []);
    } catch (error) {
      console.error("Error fetching music suggestions:", error);
    }
  };

  const handleMusicSearch = (index: number, value: string) => {
    const updatedSongs = [...songs];
    updatedSongs[index] = value;
    setSongs(updatedSongs);

    setQuery(value);
    setActiveInput(index);

    if (value.length > 2) fetchSuggestions(value); // Fetch suggestions when query length > 2
  };

  const handleMusicSelect = (index: number, song: Song) => {
    const updatedSongs = [...songs];
    updatedSongs[index] = `${song.name} by ${song.artists[0]?.name}`;
    setSongs(updatedSongs);

    setQuery("");
    setSuggestions([]);
    setActiveInput(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const battleData = {
      title: battleTitle,
      description,
      songs,
    };

    try {
      const response = await fetch("/api/battles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(battleData),
      });

      if (response.ok) {
        console.log("Battle created successfully");
        router.push("/battles"); // Redirect to battles page
      } else {
        console.error("Error creating battle");
      }
    } catch (error) {
      console.error("Error submitting battle:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1f1e] w-96 relative">
      <Navbar />
      <h1 className="text-white text-center mt-4 text-2xl">Create Battle</h1>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Battle Title */}
        <div>
          <label htmlFor="title" className="block text-white mb-2">
            Battle Title
          </label>
          <input
            id="title"
            type="text"
            value={battleTitle}
            onChange={(e) => setBattleTitle(e.target.value)}
            className="w-full px-4 py-2 rounded bg-black outline-none shadow-sm shadow-white text-white"
            placeholder="Enter battle title"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-white mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 rounded bg-black outline-none shadow-sm shadow-white text-white"
            placeholder="Enter a brief description"
            required
          />
        </div>

        {/* Fixed Inputs for Songs */}
        <div>
          <label className="block text-white mb-2">Select Songs</label>
          {songs.map((song, index) => (
            <div key={index} className="mb-4 relative">
              <input
                type="text"
                value={song}
                onChange={(e) => handleMusicSearch(index, e.target.value)}
                className="w-full px-4 py-2 rounded bg-black outline-none shadow- shadow-white text-white"
                placeholder={`Search for song ${index + 1}...`}
                required
              />
              {query && activeInput === index && (
                <ul className=" bg-white rounded mt-2 absolute w-full z-10 max-h-48 overflow-y-auto">
                  {suggestions.map((song) => (
                    <li
                      key={song.id}
                      onClick={() => handleMusicSelect(index, song)}
                      className="cursor-pointer p-2 hover:bg-slate-300"
                    >
                      {song.name} by {song.artists[0]?.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            className="bg-white text-black px-6 py-2 rounded hover:bg-slate-300 transition-colors"
          >
            Create Battle
          </button>
        </div>
      </form>
      <Bottombar />
    </div>
  );
};

export default CreateBattle;
