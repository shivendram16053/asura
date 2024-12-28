// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BattleContract is ERC721URIStorage, Ownable {
    struct Battle {
        string title;
        string description;
        string[2] songs;
        uint256 endTime;
        uint256 fee;
        address[] voters;
        mapping(address => bool) hasVoted;
        uint256 winningSide; // 0 = no winner, 1 = song 1 wins, 2 = song 2 wins
    }

    uint256 public battleIdCounter;
    uint256 public nftIdCounter;
    mapping(uint256 => Battle) public battles;
    uint256 public poolBalance;

    event BattleCreated(uint256 battleId, string title, uint256 endTime);
    event Voted(uint256 battleId, address voter);
    event RewardClaimed(uint256 battleId, address claimer, uint256 amount);

    constructor() ERC721("VotingNFT", "VOTE") {}

    function createBattle(
        string memory _title,
        string memory _description,
        string[2] memory _songs,
        uint256 _timeframe,
        uint256 _fee
    ) external payable {
        require(msg.value >= _fee, "Insufficient fee for the pool");

        uint256 battleId = battleIdCounter++;
        Battle storage newBattle = battles[battleId];

        newBattle.title = _title;
        newBattle.description = _description;
        newBattle.songs = _songs;
        newBattle.endTime = block.timestamp + _timeframe;
        newBattle.fee = _fee;

        poolBalance += msg.value;

        emit BattleCreated(battleId, _title, newBattle.endTime);
    }

    function vote(uint256 _battleId, uint256 _songChoice, string memory _metadataURI) external {
        Battle storage battle = battles[_battleId];
        require(block.timestamp < battle.endTime, "Battle has ended");
        require(!battle.hasVoted[msg.sender], "Already voted");
        require(_songChoice == 1 || _songChoice == 2, "Invalid song choice");

        battle.voters.push(msg.sender);
        battle.hasVoted[msg.sender] = true;

        // Mint NFT as a reward
        uint256 nftId = nftIdCounter++;
        _mint(msg.sender, nftId);
        _setTokenURI(nftId, _metadataURI);

        // Track which song was chosen
        // 1 = song 1, 2 = song 2
        if (_songChoice == 1) {
            battle.winningSide = 1; // Song 1 is winning
        } else if (_songChoice == 2) {
            battle.winningSide = 2; // Song 2 is winning
        }

        emit Voted(_battleId, msg.sender);
    }

    function endBattle(uint256 _battleId, uint256 _winningSide) external onlyOwner {
        Battle storage battle = battles[_battleId];
        require(block.timestamp > battle.endTime, "Battle is still ongoing");
        require(battle.winningSide == 0, "Battle already has a winner");
        require(_winningSide == 1 || _winningSide == 2, "Invalid winning side");

        battle.winningSide = _winningSide;
    }

    function claimReward(uint256 _battleId) external {
        Battle storage battle = battles[_battleId];
        require(block.timestamp > battle.endTime, "Battle is still ongoing");
        require(battle.hasVoted[msg.sender], "You did not participate");

        uint256 reward = poolBalance / battle.voters.length;

        // Ensure the user holds the NFT of the winning side
        bool hasWinningNFT = false;
        if (battle.winningSide == 1) {
            for (uint256 i = 0; i < balanceOf(msg.sender); i++) {
                uint256 tokenId = tokenOfOwnerByIndex(msg.sender, i);
                if (getTokenURI(tokenId) == battle.songs[0]) {
                    hasWinningNFT = true;
                    break;
                }
            }
        } else if (battle.winningSide == 2) {
            for (uint256 i = 0; i < balanceOf(msg.sender); i++) {
                uint256 tokenId = tokenOfOwnerByIndex(msg.sender, i);
                if (getTokenURI(tokenId) == battle.songs[1]) {
                    hasWinningNFT = true;
                    break;
                }
            }
        }

        require(hasWinningNFT, "You do not hold the winning NFT");

        payable(msg.sender).transfer(reward);

        emit RewardClaimed(_battleId, msg.sender, reward);
    }
}
