"use client";

import Bottombar from "@/components/Bottombar";
import Navbar from "@/components/Navbar";
import { useWallet } from "@/context/useWallet";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const CreateBattle = () => {
  const { isConnected } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  if (!isConnected) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1e1f1e] w-96">
      <Navbar />
      <h1 className="text-white text-center mt-4">Create Battle</h1>
      <Bottombar/>
    </div>
  );
};

export default CreateBattle;
