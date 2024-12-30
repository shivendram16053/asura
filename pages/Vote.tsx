import React, { useEffect, useState } from "react";
import { getWeb3, getContract } from "../utils/web3";
import BattleCard from "../components/BattleCard";

interface Battle {
  id: number;
  title: string;
  description: string;
  songs: string[];
  artists: string[];
  endTime: number;
  voteCount: number[];
}

const VotePage: React.FC = () => {
  const [activeBattles, setActiveBattles] = useState<Battle[]>([]);
  const [endedBattles, setEndedBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBattles = async () => {
      try {
        const web3 = getWeb3();
        const contract = getContract(web3);
        const accounts = await web3.eth.getAccounts();

        // Fetch active and ended battle IDs
        const activeBattleIds = (await contract.methods.getActiveBattles().call()) || [];
        const endedBattleIds = (await contract.methods.getEndedBattles().call()) || [];

        // Fetch details for active battles
        const activeBattlePromises = (activeBattleIds as number[]).map((id: number) =>
          contract.methods.getBattleDetails(id).call()
        );
        const endedBattlePromises = (endedBattleIds as number[]).map((id: number) =>
          contract.methods.getBattleDetails(id).call()
        );

        const activeBattlesData = await Promise.all(activeBattlePromises);
        const endedBattlesData = await Promise.all(endedBattlePromises);

        setActiveBattles(
          activeBattlesData.map((battle: any, index: number) => ({
            id: activeBattleIds[index],
            title: battle.title,
            description: battle.description,
            songs: battle.songs,
            artists: battle.artists,
            endTime: parseInt(battle.endTime),
            voteCount: battle.voteCount,
          }))
        );

        setEndedBattles(
          endedBattlesData.map((battle: any, index: number) => ({
            id: endedBattleIds[index],
            title: battle.title,
            description: battle.description,
            songs: battle.songs,
            artists: battle.artists,
            endTime: parseInt(battle.endTime),
            voteCount: battle.voteCount,
          }))
        );

        setLoading(false);
      } catch (error) {
        console.error("Error fetching battles:", error);
        setLoading(false);
      }
    };

    fetchBattles();
  }, []);

  const handleVote = async (battleId: number, songIndex: number) => {
    try {
      const web3 = getWeb3();
      const contract = getContract(web3);
      const accounts = await web3.eth.getAccounts();

      await contract.methods.vote(battleId, songIndex + 1).send({
        from: accounts[0],
        value: web3.utils.toWei("0.01", "ether"), // Replace with the fee required
      });

      alert("Vote submitted successfully!");
    } catch (error) {
      console.error("Error voting:", error);
      alert("Error submitting vote.");
    }
  };

  if (loading) return <p>Loading battles...</p>;

  return (
    <div>
      <h1>Vote for Battles</h1>
      <section>
        <h2>Active Battles</h2>
        {activeBattles.map((battle) => (
          <BattleCard
            key={battle.id}
            {...battle}
            isEnded={false}
            onVote={handleVote}
          />
        ))}
      </section>
      <section>
        <h2>Ended Battles</h2>
        {endedBattles.map((battle) => (
          <BattleCard key={battle.id} {...battle} isEnded={true} />
        ))}
      </section>
    </div>
  );
};

export default VotePage;
