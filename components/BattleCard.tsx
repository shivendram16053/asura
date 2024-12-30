import React from "react";

interface BattleCardProps {
  id: number;
  title: string;
  description: string;
  songs: string[];
  artists: string[];
  endTime: number;
  onVote?: (battleId: number, songIndex: number) => void;
  isEnded: boolean;
}

const BattleCard: React.FC<BattleCardProps> = ({
  id,
  title,
  description,
  songs,
  artists,
  endTime,
  onVote,
  isEnded,
}) => {
  const handleVote = (songIndex: number) => {
    if (onVote) onVote(id, songIndex);
  };

  return (
    <div className="bg-gray-800 text-white rounded-lg shadow-lg p-6 m-4 transition-transform transform hover:scale-105 hover:shadow-2xl">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 mb-4">{description}</p>
      <div className="space-y-4">
        {songs.map((song, index) => (
          <div
            key={index}
            className="bg-gray-700 p-4 rounded-md flex justify-between items-center"
          >
            <p>
              <strong>Song:</strong> {song} by {artists[index]}
            </p>
            {!isEnded && (
              <button
                onClick={() => handleVote(index)}
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md"
              >
                Vote
              </button>
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 text-gray-400">
        <strong>Ends At:</strong>{" "}
        {new Date(endTime * 1000).toLocaleString()}
      </p>
    </div>
  );
};

export default BattleCard;
