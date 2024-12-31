interface RewardCardProps {
    battleId: number;
    title: string;
    rewardAmount: string;
  }
  
  const RewardCard: React.FC<RewardCardProps> = ({ battleId, title, rewardAmount }) => {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        <h2 className="text-white text-xl">{title}</h2>
        <p className="text-gray-400">Reward: {rewardAmount}</p>
      </div>
    );
  };
  
  export default RewardCard;
  