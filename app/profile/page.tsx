"use client";

import React, { useEffect, useState } from "react";
import { getWeb3, getContract } from "@/utils/web3";
import Navbar from "@/components/Navbar";
import Bottombar from "@/components/Bottombar";
import { useWallet } from "@/context/useWallet";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Battle {
  id: number;
  title: string;
  description: string;
  songs: string[];
  artists: string[];
  endTime: number;
  voteCount: number[];
}

interface BattleDetails {
  title: string;
  description: string;
  songs: string[];
  artists: string[];
  endTime: number;
  voteCount: number[];
}

const page = () => {
  const { isConnected, address, disconnectFunc } = useWallet();
  const router = useRouter();
  const [votedBattles, setVotedBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isConnected || !address) {
      router.push("/");
    }
  }, [isConnected, address, router]);

  useEffect(() => {
    const fetchVotedBattles = async () => {
      try {
        const web3 = getWeb3();
        const contract = getContract(web3);
    
        const userVotedBattles: number[] =
          (await contract.methods.getVotedBattles(address).call()) || [];
    
        const uniqueBattleIds = Array.from(new Set(userVotedBattles));
    
        if (uniqueBattleIds.length === 0) {
          console.warn("No battles found:", uniqueBattleIds);
          setVotedBattles([]);
          setLoading(false);
          return;
        }
    
        const battles = await Promise.all(
          uniqueBattleIds.map(async (battleId) => {
            try {
              const battleDetails: BattleDetails = await contract.methods
                .getBattleDetails(battleId)
                .call();
    
              return {
                id: battleId,
                title: battleDetails.title,
                description: battleDetails.description,
                songs: battleDetails.songs,
                artists: battleDetails.artists,
                endTime: battleDetails.endTime,
                voteCount: battleDetails.voteCount,
              };
            } catch (error) {
              console.warn(`Failed to fetch details for battle ID ${battleId}:`, error);
              return null; 
            }
          })
        );
    
        
        setVotedBattles(battles.filter((battle) => battle !== null));
      } catch (error) {
        console.error("Error fetching voted battles:", error);
      } finally {
        setLoading(false);
      }
    };
    

    fetchVotedBattles();
  }, [isConnected, address]);

  const handledisconnectFunc = () => {
    disconnectFunc();
    router.push("/"); // Redirect to home after disconnectFunc
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex justify-center items-center">
        <div className="min-h-screen bg-[#1e1f1e] w-96 relative">
          <Navbar />
          <h1 className="text-white text-center mt-4 bold text-2xl">
            Loading Profile...
          </h1>
          <Bottombar />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      <div className="min-h-screen scrollbar-hide bg-[#1e1f1e] w-96 relative mx-auto overflow-y-scroll">
        <Navbar />
        <div className="h-screen mb-40 p-4">
          <div className="rounded-lg">
            <div className="flex items-center justify-between">
              <img
                src={`/profile.webp`}
                alt="Avatar"
                className="w-16 h-16 rounded-full"
              />
              <div className="flex-1 ml-4">
                {address && (
                  <div className="text-white text-lg">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </div>
                )}
                <button
                  onClick={() =>
                    address && navigator.clipboard.writeText(address)
                  }
                  className="text-blue-400 text-sm"
                >
                  Copy Address
                </button>
              </div>
            </div>

            <button
              onClick={handledisconnectFunc}
              className="w-full mt-4 bg-red-500 text-white py-2 rounded-lg"
            >
              Disconnect
            </button>
          </div>

          <hr className="my-4 border-t-2 border-gray-600" />

          <h2 className="text-white text-2xl text-center mt-4">
            Battles You've Voted In
          </h2>
          <div className="mt-4 overflow-y-auto scrollbar-hide max-h-[450px]">
            {votedBattles.length === 0 ? (
              <p className="text-white text-center">No battles found</p>
            ) : (
              votedBattles.map((battle) => (
                <Link key={battle.id} href={`/vote/${battle.id}`}>
                  <div className="text-white rounded-lg p-6 m-4 border border-slate-200 transition-transform transform shadow-md hover:shadow-slate-500">
                    <h3 className="text-xl font-bold text-white">
                      {battle.title}
                    </h3>
                    <p className="text-gray-300">{battle.description}</p>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-gray-400">
                        End Time:{" "}
                        {new Date(
                          Number(battle.endTime) * 1000
                        ).toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-400">
                        Total Votes:{" "}
                        {battle.voteCount
                          .reduce((a, b) => a + BigInt(b), BigInt(0))
                          .toString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
        <Bottombar />
      </div>
    </div>
  );
};

export default page;
