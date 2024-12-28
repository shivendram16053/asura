'use client';

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Music, Users, Trophy, Zap } from "lucide-react";
import { useWallet } from "@/context/useWallet";
import Bottombar from "@/components/Bottombar";
import Link from "next/link";

const Index = () => {
  const { address, isConnected, connect } = useWallet();

  return (
    <div className="min-h-screen bg-[#1e1f1e] w-96">
      <Navbar />

      <div className="mx-auto px-4">
        {!isConnected ? (
          // Landing Page for Disconnected Users
          <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="text-center mt-28">
              <Music className="w-16 h-16 text-slate-100 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-white mb-4">
                Welcome to aSura
              </h1>
              <p className="text-lg text-gray-400 mb-8">
                 A Music Battle Bot That Live on the Blockchain.
              </p>

              <Button
                onClick={connect}
                className=" bg-white text-black px-4 py-2 rounded-lg shadow-md hover:bg-gray-200 transition-colors"
              >
                Connect Wallet
              </Button>
            </div>

            {/* Key Features Section */}
            <div className="mt-16 space-y-8">
              <div className="flex  items-center gap-4">
                <Users className="w-8 h-8 text-indigo-400" />
                <p className="text-gray-300">
                  Engage in exciting song battles with other users.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <p className="text-gray-300">
                  Win battles and earn exclusive NFT rewards.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Zap className="w-8 h-8 text-green-400" />
                <p className="text-gray-300">
                  Climb the leaderboard and showcase your music taste.
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Dashboard Introduction for Connected Users
          <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="text-center space-y-6">
              <Music className="w-16 h-16 text-slate-100 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-white mb-4">
                Hey!! This is aSura
              </h1>
              <p className="text-lg text-gray-400 mb-8">
                A Music Battle Bot That Live on the Blockchain.
              </p>

              <Link href={"/create"}>
              <Button
                className="bg-white text-black mt-5 px-4 py-2 rounded-lg shadow-md hover:bg-gray-200 transition-colors"
              >
                Create Battle
              </Button></Link>
            </div>
          </div>
        )}
      </div>

      {/* Bottombar */}
      <Bottombar />
    </div>
  );
};

export default Index;
