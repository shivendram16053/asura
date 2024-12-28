"use client";

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Pacifico } from "next/font/google";
import { useWallet } from "@/context/useWallet";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
});

const Navbar = () => {
  const { address, connect, disconnectFunc } = useWallet();
  const [showDialog, setShowDialog] = useState(false);

  const copyAddressToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      alert("Wallet address copied to clipboard!");
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectFunc();
      setShowDialog(false);
      console.log("Disconnected successfully.");
    } catch (err) {
      console.error("Failed to disconnect:", err);
    }
  };

  const handleConnect = async () => {
    try {
      await connect();
    } catch (err) {
      console.error("Failed to connect:", err);
    }
  };

  // Click outside to close dialog
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDialog && !(event.target as Element).closest(".wallet-menu")) {
        setShowDialog(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDialog]);

  return (
    <div className="sticky top-0 z-50 bg-stone-800 text-white shadow-lg backdrop-blur-lg bg-opacity-90">
      <div className="container px-4 h-16 flex justify-between items-center">
        <Link href="/">
          <h1 className={`text-4xl font-bold ${pacifico.className}`}>aSura</h1>
        </Link>
        {address ? (
          <div>
            <Button
              onClick={() => setShowDialog(!showDialog)}
              variant="outline"
              className="bg-white text-black hover:bg-gray-200"
            >
              {address.slice(0, 6)}...{address.slice(-4)}
            </Button>

            {showDialog && (
              <div className="wallet-menu bg-white text-black p-4 absolute right-4 mt-[-10px]  gap-2 w-32  flex flex-col rounded">
                <Button onClick={copyAddressToClipboard}>Copy Address</Button>
                <Button onClick={handleDisconnect}>Disconnect</Button>
              </div>
            )}
          </div>
        ) : (
          <Button
            onClick={handleConnect}
            variant="outline"
            className="bg-white text-black"
          >
            Connect Wallet
          </Button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
