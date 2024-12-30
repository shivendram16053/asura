// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Asura {
    struct Battle {
        uint256 id;
        string title;
        string description;
        string[2] songs;
        string[2] artists;
        uint256 endTime;
        uint256 fee;
        address[] voters;
        uint256[2] voteCount; // voteCount[0] = votes for song 1, voteCount[1] = votes for song 2
        uint256 winningSide; // 0 = no winner, 1 = song 1 wins, 2 = song 2 wins
        bool winnerDeclared;
        uint256 prizePool;
        mapping(address => bool) hasClaimedReward; // Tracks reward claims
    }

    mapping(uint256 => Battle) public battles;
    uint256 public battleCount;

    // Events
    event BattleCreated(uint256 battleId, string title, string[2] songs, uint256 endTime);
    event Voted(uint256 battleId, address voter, uint256 songChoice);
    event WinnerDeclared(uint256 battleId, uint256 winningSide);
    event RewardClaimed(uint256 battleId, address claimer);

    // Create a new battle
    function createBattle(
        string memory _title,
        string memory _description,
        string[2] memory _songs,
        string[2] memory _artists,
        uint256 _fee
    ) external {
        uint256 _endTime = block.timestamp + 24 * 60 * 60;

        Battle storage newBattle = battles[battleCount];
        newBattle.id = battleCount;
        newBattle.title = _title;
        newBattle.description = _description;
        newBattle.songs = _songs;
        newBattle.artists = _artists;
        newBattle.endTime = _endTime;
        newBattle.fee = _fee;

        emit BattleCreated(battleCount, _title, _songs, _endTime);

        battleCount++;
    }

    // Vote for a song
    function vote(uint256 _battleId, uint256 _songChoice) external payable {
        Battle storage battle = battles[_battleId];
        require(block.timestamp < battle.endTime, "Battle has ended");
        require(_songChoice == 1 || _songChoice == 2, "Invalid song choice");
        require(msg.value == battle.fee, "Incorrect fee sent");

        battle.voters.push(msg.sender);
        battle.voteCount[_songChoice - 1]++;
        battle.prizePool += msg.value;

        emit Voted(_battleId, msg.sender, _songChoice);
    }

    // Declare the winner of the battle
    function declareWinner(uint256 _battleId) external {
        Battle storage battle = battles[_battleId];
        require(block.timestamp > battle.endTime, "Battle is still ongoing");
        require(!battle.winnerDeclared, "Winner already declared");

        if (battle.voteCount[0] > battle.voteCount[1]) {
            battle.winningSide = 1; // Song 1 wins
        } else if (battle.voteCount[1] > battle.voteCount[0]) {
            battle.winningSide = 2; // Song 2 wins
        } else {
            battle.winningSide = 0; // Draw
        }

        battle.winnerDeclared = true;

        emit WinnerDeclared(_battleId, battle.winningSide);
    }

    // Claim reward for winning
    function claimReward(uint256 _battleId) external {
        Battle storage battle = battles[_battleId];
        require(battle.winnerDeclared, "Winner not declared yet");
        require(battle.winningSide != 0, "No winner in this battle");
        require(!battle.hasClaimedReward[msg.sender], "Reward already claimed");

        uint256 rewardAmount = battle.prizePool / battle.voteCount[battle.winningSide - 1];
        battle.hasClaimedReward[msg.sender] = true;

        payable(msg.sender).transfer(rewardAmount);

        emit RewardClaimed(_battleId, msg.sender);
    }

    // Fetch all active battles
    function getActiveBattles() external view returns (uint256[] memory) {
        uint256[] memory activeBattleIds = new uint256[](battleCount);
        uint256 count = 0;

        for (uint256 i = 0; i < battleCount; i++) {
            if (block.timestamp < battles[i].endTime) {
                activeBattleIds[count] = i;
                count++;
            }
        }

        return activeBattleIds;
    }

    // Fetch all ended battles
    function getEndedBattles() external view returns (uint256[] memory) {
        uint256[] memory endedBattleIds = new uint256[](battleCount);
        uint256 count = 0;

        for (uint256 i = 0; i < battleCount; i++) {
            if (block.timestamp >= battles[i].endTime) {
                endedBattleIds[count] = i;
                count++;
            }
        }

        return endedBattleIds;
    }

    // Fetch battle details by ID
    function getBattleDetails(uint256 _battleId)
        external
        view
        returns (
            string memory title,
            string memory description,
            string[2] memory songs,
            string[2] memory artists,
            uint256 endTime,
            uint256 fee,
            uint256[2] memory voteCount,
            uint256 winningSide,
            uint256 prizePool,
            bool winnerDeclared
        )
    {
        Battle storage battle = battles[_battleId];
        return (
            battle.title,
            battle.description,
            battle.songs,
            battle.artists,
            battle.endTime,
            battle.fee,
            battle.voteCount,
            battle.winningSide,
            battle.prizePool,
            battle.winnerDeclared
        );
    }
}
