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
    <div className="battle-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="songs">
        {songs.map((song, index) => (
          <div key={index} className="song">
            <p>
              <strong>Song:</strong> {song} by {artists[index]}
            </p>
            {!isEnded && (
              <button onClick={() => handleVote(index)}>Vote for this</button>
            )}
          </div>
        ))}
      </div>
      <p>
        <strong>Ends At:</strong> {new Date(endTime * 1000).toLocaleString()}
      </p>
    </div>
  );
};

export default BattleCard;
