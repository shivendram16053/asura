"use client";
import Bottombar from "@/components/Bottombar";
import Navbar from "@/components/Navbar";
import { useWallet } from "@/context/useWallet";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import battleContractABI from "@/utils/abi.json";

interface Song {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
}

const Create = () => {
  const { isConnected, connect, ethereum } = useWallet();
  const router = useRouter();
  const [battleTitle, setBattleTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fees, setFees] = useState<number>(0);
  const [songs, setSongs] = useState(["", ""]);
  const [artists, setArtists] = useState<string[]>(["", ""]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Song[]>([]);
  const [activeInput, setActiveInput] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareableLink, setShareableLink] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  if (!isConnected) {
    return (
      <div>
        <button
          onClick={connect}
          className="bg-white text-black px-6 py-2 rounded"
        >
          Connect Wallet
        </button>
      </div>
    );
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

    const updatedArtists = [...artists];
    updatedArtists[index] = song.artists[0]?.name;
    setArtists(updatedArtists);

    setQuery("");
    setSuggestions([]);
    setActiveInput(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      if (!isConnected || !ethereum) {
        throw new Error("Wallet not connected");
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(
        "0x2014bFBBA77e1F8C97ca33021DdDb9Bd49289fcC",
        battleContractABI.abi,
        signer
      );

      // Convert fees from BNB to Wei
      const feesInWei = ethers.utils.parseEther(fees.toString());

      // Convert songs and artists arrays to fixed-size arrays of 2 elements
      const songsArray: [string, string] = [songs[0], songs[1]];
      const artistsArray: [string, string] = [artists[0], artists[1]];

      // Create battle without sending value
      const tx = await contract.createBattle(
        battleTitle,
        description,
        songsArray,
        artistsArray,
        feesInWei
      );

      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      // Get battle ID from the BattleCreated event
      const event = receipt.events?.find(
        (e: { event: string }) => e.event === "BattleCreated"
      );
      if (event) {
        const battleId = event.args?.battleId.toNumber();
        const shareableLink = `t.me/a_Sura_bot/aSura/battle/${battleId}`;
        setShareableLink(shareableLink);
      }
    } catch (error) {
      console.error("Error creating battle on-chain:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black overflow-y-auto ">
      <div className="min-h-screen scrollbar-hide bg-[#1e1f1e] w-96 mx-auto ">
        <Navbar />
        <div className="mb-16 overflow-y-scroll scrollbar-hide">
          <h1 className="text-white text-center mt-4 text-2xl">
            Create Battle
          </h1>
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
                    className="w-full px-4 py-2 rounded bg-black outline-none shadow-sm shadow-white text-white"
                    placeholder={`Search for song ${index + 1}...`}
                    required
                  />
                  {query && activeInput === index && (
                    <ul className="bg-white rounded mt-2 absolute w-full z-10 max-h-48 overflow-y-auto">
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

            <div>
              <label htmlFor="fees" className="block text-white mb-2">
                Fees (In BNB)
              </label>
              <input
                id="fees"
                type="number"
                value={fees}
                onChange={(e) => setFees(Number(e.target.value))}
                className="w-full px-4 py-2 rounded bg-black outline-none shadow-sm shadow-white text-white"
                placeholder="Set Voting fees"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                className="bg-white text-black px-6 py-2 rounded hover:bg-slate-300 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Create Battle"}
              </button>
            </div>
          </form>

          {shareableLink && (
            <div className="text-center text-white mt-4">
              Shareable Link: <a href={shareableLink}>{shareableLink}</a>
            </div>
          )}
        </div>
        <Bottombar />
      </div>
    </div>
  );
};

export default Create;
