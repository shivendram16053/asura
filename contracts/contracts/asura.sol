// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Asura {
    struct Battle {
        string title;
        string description;
        string[2] songs;
        uint256 endTime;
        uint256 fee;
        address[] voters;
        mapping(address => uint256) userVotes; // Tracks which side the user voted for
        uint256[2] voteCount; // voteCount[0] = votes for song 1, voteCount[1] = votes for song 2
        uint256 winningSide; // 0 = no winner, 1 = song 1 wins, 2 = song 2 wins
        bool winnerDeclared;
    }

    mapping(uint256 => Battle) public battles;
    uint256 public battleCounter;

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
        uint256 _fee
    ) external {
        uint256 _endTime = block.timestamp + 24 * 60 * 60;
        require(_endTime > block.timestamp, "End time must be in the future");
    
        Battle storage newBattle = battles[battleCounter];
        newBattle.title = _title;
        newBattle.description = _description;
        newBattle.songs = _songs;
        newBattle.endTime = _endTime;
        newBattle.fee = _fee;
    
        emit BattleCreated(battleCounter, _title, _songs, _endTime);
        battleCounter++;
    }

    // Vote for a song
    function vote(uint256 _battleId, uint256 _songChoice) external payable {
        Battle storage battle = battles[_battleId];
        require(block.timestamp < battle.endTime, "Battle has ended");
        require(_songChoice == 1 || _songChoice == 2, "Invalid song choice");
        require(battle.userVotes[msg.sender] == 0, "You have already voted");
        require(msg.value == battle.fee, "Incorrect fee sent");

        battle.userVotes[msg.sender] = _songChoice;
        battle.voteCount[_songChoice - 1]++;
        battle.voters.push(msg.sender);

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

    // Claim reward for voting for the winning side
    function claimReward(uint256 _battleId) external {
        Battle storage battle = battles[_battleId];
        require(battle.winnerDeclared, "Winner not declared yet");
        require(battle.userVotes[msg.sender] == battle.winningSide, "You did not vote for the winning side");

        battle.userVotes[msg.sender] = 0; // Mark reward as claimed to prevent double claiming

        emit RewardClaimed(_battleId, msg.sender);
        // Logic for transferring rewards, such as tokens or native currency
    }

    // Fetch battle details for frontend
    function getBattleDetails(uint256 _battleId) external view returns (
        string memory title,
        string memory description,
        string[2] memory songs,
        uint256 endTime,
        uint256 fee,
        uint256[2] memory voteCount,
        uint256 winningSide,
        bool winnerDeclared
    ) {
        Battle storage battle = battles[_battleId];
        title = battle.title;
        description = battle.description;
        songs = battle.songs;
        endTime = battle.endTime;
        fee = battle.fee;
        voteCount = battle.voteCount;
        winningSide = battle.winningSide;
        winnerDeclared = battle.winnerDeclared;
    }
}
