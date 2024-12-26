'use client';

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Loader2, Music, Plus, Wallet } from "lucide-react";
import { useWallet } from "@/context/useWallet";

const Index = () => {
  const { address, isConnected, connect } = useWallet();

  return (
    <div className="min-h-screen bg-[#1e1f1e]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="text-center space-y-6">
              <Wallet className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-white mb-4">
                Welcome to aSura
              </h1>
              <p className="text-lg text-gray-400 mb-8">
                Connect your wallet to start creating music battles
              </p>

              <Button
                onClick={connect}
                className="bg-white text-black px-4 py-2 rounded-lg shadow-md hover:bg-gray-200 transition-colors"
              >            
                  'Connect Wallet'
              </Button>
            </div>
          </div>
        ) : (
          // Rest of your connected view remains the same
          <div className="pt-20">
            {/* ... existing connected view code ... */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;