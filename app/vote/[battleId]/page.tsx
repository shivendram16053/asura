"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getWeb3, getContract } from "../../../utils/web3";
import Navbar from "@/components/Navbar";
import Bottombar from "@/components/Bottombar";

interface BattleDetails {
  title: string;
  description: string;
  songs: string[];
  artists: string[];
  endTime: string;
  voteCount: string[];
}

const BattleDetailsPage = () => {
  const params = useParams();
  const battleId = params?.battleId as string;
  const [battleDetails, setBattleDetails] = useState<BattleDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!battleId || isNaN(Number(battleId))) {
      setError("Battle not available");
      setLoading(false);
      return;
    }

    const fetchBattleDetails = async () => {
      try {
        const web3 = getWeb3();
        const contract = getContract(web3);

        const details = (await contract.methods.getBattleDetails(battleId).call()) as {
          title: string;
          description: string;
          songs: string[];
          artists: string[];
          endTime: string;
          voteCount: string[];
        };
        setBattleDetails({
          title: details.title,
          description: details.description,
          songs: details.songs,
          artists: details.artists,
          endTime: details.endTime,
          voteCount: details.voteCount,
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching battle details:", error);
        setError("Error fetching battle details");
        setLoading(false);
      }
    };

    fetchBattleDetails();
  }, [battleId]);

  const handleVote = async (songIndex: number): Promise<void> => {
    try {
      const web3 = getWeb3();
      const contract = getContract(web3);
      const accounts = await web3.eth.getAccounts();

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please connect your wallet.");
      }

      const fee = (await contract.methods.getBattleDetails(Number(battleId)).call()) as {
        fee: string;
      };
      await contract.methods.vote(Number(battleId), songIndex + 1).send({
        from: accounts[0],
        value: fee.fee,
      });

      alert("Vote submitted successfully!");
    } catch (error) {
      console.error("Error voting:", error);
      alert("Error submitting vote.");
    }
  };

  if (loading) return <p>Loading battle details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="flex overflow-y-auto justify-center items-center h-screen bg-black">
      <div className="min-h-screen bg-[#1e1f1e] w-96 relative">
        <Navbar />
        <h1 className="text-white text-center mt-4 bold text-2xl">{battleDetails?.title}</h1>
        <p className="text-white text-center">{battleDetails?.description}</p>
        <section>
          <h2 className="text-white text-lg font-bold">Songs</h2>
          {battleDetails?.songs.map((song, index) => (
            <div key={index} className="text-white my-4">
              <p>
                {song} by {battleDetails?.artists[index]}
              </p>
              <button
                onClick={() => handleVote(index)}
                className="bg-blue-500 text-white px-4 py-2 mt-2 rounded"
              >
                Vote
              </button>
            </div>
          ))}
        </section>
        <Bottombar />
      </div>
    </div>
  );
};

export default BattleDetailsPage;
