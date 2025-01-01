"use client";

import React, { useEffect, useState } from "react";
import { getWeb3, getContract } from "@/utils/web3";
import BattleCard from "@/components/BattleCard";
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

const vote = () => {
  const { isConnected } = useWallet();
  const router = useRouter();
  const [activeBattles, setActiveBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  useEffect(() => {
    const fetchBattles = async () => {
      try {
        const web3 = getWeb3();
        const contract = getContract(web3);

        const activeBattleIds =
          (await contract.methods.getActiveBattles().call()) || [];
        const endedBattleIds =
          (await contract.methods.getEndedBattles().call()) || [];
        const activeBattlePromises = activeBattleIds.map((id: number) =>
          contract.methods.getBattleDetails(id).call()
        );
        const endedBattlePromises = endedBattleIds.map((id: number) =>
          contract.methods.getBattleDetails(id).call()
        );

        const activeBattlesData = await Promise.all(activeBattlePromises);
        const endedBattlesData = await Promise.all(endedBattlePromises);

        setActiveBattles(
          activeBattlesData.map((battle: any, index: number) => ({
            id: activeBattleIds[index],
            title: battle.title,
            description: battle.description,
            songs: battle.songs,
            artists: battle.artists,
            endTime: parseInt(battle.endTime),
            voteCount: battle.voteCount,
          }))
        );

        setLoading(false);
      } catch (error) {
        console.error("Error fetching battles:", error);
        setLoading(false);
      }
    };

    fetchBattles();
  }, []);

  if (loading)
    return (
      <div className="bg-black">
      <div className="min-h-screen scrollbar-hide bg-[#1e1f1e] w-96 relative mx-auto overflow-y-scroll">
         <Navbar />
          <h1 className="text-white text-center mt-4 bold text-2xl">
            Loading Battles...
          </h1>
          <Bottombar />
        </div>
      </div>
    );
  return (
    <div className="bg-black">
      <div className="min-h-screen scrollbar-hide bg-[#1e1f1e] w-96 relative mx-auto overflow-y-scroll">
          <Navbar />
          <div className="h-screen">
            <h1 className="text-white text-center mt-4 bold text-2xl">
              Vote For Battles
            </h1>
            <section className="mb-50">
              {activeBattles.map((battle) => (
                <Link key={`${battle.id}`} href={`/vote/${battle.id}`}>
                  <BattleCard {...battle} />
                </Link>
              ))}
            </section>

            <Bottombar />
          </div>
        </div>
      </div>
  );
};

export default vote;
