import { useWallet } from '@/context/useWallet';
import { PieChart, User, ClipboardList, Vote } from 'lucide-react'; 
import Link from 'next/link';
import React from 'react';

const Bottombar = () => {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return null;
  }

  return (
    <div className="fixed bottom-0 h-16 bg-stone-800 text-white flex items-center justify-evenly w-96">
      <Link href="/create">
      <button className="flex flex-col items-center">
        <ClipboardList className="h-6 w-6" />
        <span className="text-xs">Create</span>
      </button>
      </Link>
      <Link href={"/vote"}>
      <button className="flex flex-col items-center">
        <Vote className="h-7 w-7" />
        <span className="text-xs">Vote</span>
      </button>
      </Link>
      <Link href={"/claim"}>
      <button className="flex flex-col items-center">
        <PieChart className="h-6 w-6" />
        <span className="text-xs">Rewards</span>
      </button>
      </Link>
      <Link href={"/profile"}>
      <button className="flex flex-col items-center">
        <User className="h-6 w-6" />
        <span className="text-xs">Profile</span>
      </button>
      </Link>
    </div>
  );
};

export default Bottombar;
