import { useWallet } from '@/context/useWallet';
import { PieChart, User, ClipboardList, Vote } from 'lucide-react'; // Importing icons from Lucide
import Link from 'next/link';
import React from 'react';

const Bottombar = () => {
  const { isConnected } = useWallet();

  if (!isConnected) {
    // Do not render the bottombar if the wallet is not connected
    return null;
  }

  return (
    <div className="absolute bottom-0 h-16 bg-stone-800 text-white flex items-center justify-evenly w-96">
      <Link href="/create">
      <button className="flex flex-col items-center">
        <ClipboardList className="h-6 w-6" />
        <span className="text-xs">Create</span>
      </button>
      </Link>
      <button className="flex flex-col items-center">
        <Vote className="h-7 w-7" />
        <span className="text-xs">Vote</span>
      </button>
      <button className="flex flex-col items-center">
        <PieChart className="h-6 w-6" />
        <span className="text-xs">Leaderboard</span>
      </button>
      <button className="flex flex-col items-center">
        <User className="h-6 w-6" />
        <span className="text-xs">Profile</span>
      </button>
    </div>
  );
};

export default Bottombar;
