'use client';

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Pacifico } from "next/font/google";
import { useWallet } from "@/context/useWallet";
import { Loader2 } from "lucide-react";

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
});

const Navbar = () => {
  const { address, connect, disconnect} = useWallet();
  const [showDialog, setShowDialog] = useState(false);
  
  const copyAddressToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      alert("Wallet address copied to clipboard!");
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    setShowDialog(false);
  };

  const handleConnect = async () => {
    await connect();
  };

  // Click outside to close dialog
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDialog && !(event.target as Element).closest('.wallet-menu')) {
        setShowDialog(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDialog]);

  return (
    <div className="sticky top-0 z-50 bg-stone-800 text-white shadow-lg backdrop-blur-lg bg-opacity-90">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <h1 className={`text-4xl font-bold ${pacifico.className}`}>aSura</h1>
        {address ? (
          <div className="relative wallet-menu">
            <Button
              onClick={() => setShowDialog(!showDialog)}
              variant="outline"
              className="bg-white text-black hover:bg-gray-200"
            >
              {address.slice(0, 6)}...{address.slice(-4)}
            </Button>
            {showDialog && (
              <div className="absolute top-12 right-0 bg-white rounded-lg shadow-lg p-3 text-sm min-w-[160px]">
                <ul className="space-y-2">
                  <li>
                    <Button
                      onClick={copyAddressToClipboard}
                      variant="ghost"
                      className="w-full justify-start"
                    >
                      Copy Address
                    </Button>
                  </li>
                  <li>
                    <Button
                      onClick={handleDisconnect}
                      variant="destructive"
                      className="w-full justify-start"
                    >
                      Disconnect
                    </Button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <Button
            onClick={handleConnect}
            variant="outline"
            className="bg-white text-black hover:bg-gray-200"
          >
            
              'Connect Wallet'
          </Button>
        )}
      </div>
    </div>
  );
};

export default Navbar;