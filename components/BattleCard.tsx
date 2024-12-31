import React from "react";

interface BattleCardProps {
  id: number;
  title: string;
  description: string;
  songs: string[];
  artists: string[];
  endTime: number;
  onVote?: (battleId: number, songIndex: number) => void;
}

const BattleCard: React.FC<BattleCardProps> = ({
  id,
  title,
  description,
  songs,
  endTime,
}) => {

  return (
    <div className=" text-white rounded-lg p-6 m-4 border border-slate-200 transition-transform transform  shadow-md  hover:shadow-slate-500">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 mb-4">{description}</p>
      <div className="space-y-4">
        
      </div>
      <p className="mt-4 text-gray-400">
        <strong>Ends At:</strong>{" "}
        {new Date(endTime * 1000).toLocaleString()}
      </p>
    </div>
  );
};

export default BattleCard;
