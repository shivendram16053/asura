"use client";

import React, { useEffect, useState } from "react";
import { getWeb3, getContract } from "@/utils/web3";
import RewardCard from "@/components/RewardCard";
import Navbar from "@/components/Navbar";
import Bottombar from "@/components/Bottombar";
import { useWallet } from "@/context/useWallet";
import { useRouter } from "next/navigation";
import BN from "bn.js";
import Web3 from "web3";

interface ClaimableReward {
  battleId: number;
  title: string;
  rewardAmount: string;
  claimed: boolean;
}

interface BattleDetails {
  title: string;
  prizePool: string;
  voteCount: string[];
  winningSide: number;
  hasClaimedReward: boolean;
}

const page = () => {
  const { isConnected, address } = useWallet();
  const router = useRouter();
  const [claimableRewards, setClaimableRewards] = useState<ClaimableReward[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [claiming, setClaiming] = useState<number | null>(null);

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  useEffect(() => {
    const fetchClaimableRewards = async () => {
      try {
        const web3 = getWeb3();
        const contract = getContract(web3);

        const userWins = await contract.methods.getUserWins(address).call();

        const rewards = await Promise.all(
          (userWins as any[]).map(async (battleId: number) => {
            const battleDetails: BattleDetails = await contract.methods
              .getBattleDetails(battleId)
              .call();

            if (
              !battleDetails ||
              !battleDetails.voteCount ||
              battleDetails.voteCount.length < 2
            ) {
              return null;
            }

            const winningSide = battleDetails.winningSide;
            const prizePool = new BN(battleDetails.prizePool); // Use BN from bn.js
            const voteCountForWinner = new BN(
              battleDetails.voteCount[winningSide - 1]
            ); // Use BN from bn.js

            const rewardAmount = voteCountForWinner.isZero()
              ? "0"
              : prizePool.div(voteCountForWinner).toString();

            return {
              battleId,
              title: battleDetails.title,
              rewardAmount: Web3.utils.fromWei(rewardAmount, "ether"),
              claimed: battleDetails.hasClaimedReward,
            };
          })
        );

        // Filter out null values before setting state
        const validRewards = rewards.filter(
          (reward) => reward !== null
        ) as ClaimableReward[];
        setClaimableRewards(validRewards); // Set state with valid rewards
        setLoading(false);
      } catch (error) {
        console.error("Error fetching claimable rewards:", error);
        setLoading(false);
      }
    };

    fetchClaimableRewards();
  }, [isConnected, address]);

  const handleClaimReward = async (battleId: number) => {
    setClaiming(battleId);

    try {
      const web3 = getWeb3();
      const contract = getContract(web3);
      const result = await contract.methods
        .claimReward(battleId)
        .send({ from: address });

      if (result.status) {
        const updatedRewards = claimableRewards.filter(
          (reward) => reward.battleId !== battleId
        );
        setClaimableRewards(updatedRewards);
        alert(`Reward for Battle ${battleId} claimed successfully!`);
      }
    } catch (error) {
      console.error("Error claiming reward:", error);
      alert("Failed to claim reward. Please try again.");
    } finally {
      setClaiming(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="min-h-screen bg-[#1e1f1e] w-96 relative">
          <Navbar />
          <h1 className="text-white text-center mt-4 bold text-2xl">
            Loading Rewards...
          </h1>
          <Bottombar />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black overflow-y-auto ">
      <div className="min-h-screen scrollbar-hide bg-[#1e1f1e] w-96 mx-auto ">
        <Navbar />
        <div className="overflow-y-scroll scrollbar-hide">
          <h1 className="text-white text-center mt-4 bold text-2xl">
            Claim Your Rewards
          </h1>
          <section >
             {claimableRewards.length === 0 ? (
              <p className="text-white text-center mt-4">
                No rewards available to claim.
              </p>
            ) : (
              claimableRewards.map((reward) => (
                <div key={reward.battleId} className="mt-4">
                  <RewardCard {...reward} />
                  <button
                    onClick={() => handleClaimReward(reward.battleId)}
                    disabled={claiming === reward.battleId}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
                  >
                    {claiming === reward.battleId
                      ? "Claiming..."
                      : "Claim Reward"}
                  </button>
                </div>
              ))
            )}
          </section>
          <Bottombar />
        </div>
      </div>
    </div>
  );
};

export default page;
