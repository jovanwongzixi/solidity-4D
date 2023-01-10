// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

//import "hardhat/console.sol";

error _4D__BetAmountTooLow();
error _4D__BetAmountTooHigh();
error _4D__NoWinningsToSend();
error _4D__NoBetsMade();
error _4D__InsufficientFundsForWithdrawal();
error _4D__NotOwner();

contract _4D {
    struct Bet {
        uint256 betAmount;
        uint16 _4DNumber;
    }

    // temp storing of 4D winning numbers in mapping for O(1) checking
    // could change to chainlink vrf
    // for now all numbers have the same multiplier
    mapping(uint16 => bool) private s_winning4DNumbers;
    mapping(address => Bet[]) private s_addressToBets;

    uint256 private immutable i_minimumBet;
    //i_maximumBet set because i have limited funds :(
    uint256 private immutable i_maximumBet;
    address private immutable i_owner;

    modifier onlyOwner() {
        if (msg.sender != i_owner) revert _4D__NotOwner();
        _;
    }

    constructor() {
        i_owner = msg.sender;
        i_minimumBet = 1 * 1e16;
        i_maximumBet = 15 * 1e16;
        s_winning4DNumbers[1356] = true;
        s_winning4DNumbers[2458] = true;
        s_winning4DNumbers[8888] = true;
    }

    function enter4D(uint16 number) public payable {
        if (msg.value < i_minimumBet) revert _4D__BetAmountTooLow();
        if (msg.value > i_maximumBet) revert _4D__BetAmountTooHigh();
        s_addressToBets[msg.sender].push(Bet(msg.value, number));
    }

    function sendWinnings() public {
        uint256 winnings = calculateWinnings();
        if (winnings > 0) {
            (bool success, ) = msg.sender.call{value: winnings}("");
            require(success);
            delete s_addressToBets[msg.sender];
        } else revert _4D__NoWinningsToSend();
    }

    function fund() public payable onlyOwner {}

    function withdraw(uint256 withdrawValue) public onlyOwner {
        if (withdrawValue > address(this).balance) revert _4D__InsufficientFundsForWithdrawal();
        (bool success, ) = msg.sender.call{value: withdrawValue}("");
        require(success);
    }

    function calculateWinnings() private view returns (uint256) {
        Bet[] memory betArray = s_addressToBets[msg.sender];
        uint256 winnings = 0;
        for (uint256 i = 0; i < betArray.length; i++) {
            if (s_winning4DNumbers[betArray[i]._4DNumber]) winnings += (betArray[i].betAmount) * 2;
        }
        return winnings;
    }

    function getBetDetails() public view returns (Bet memory) {
        uint256 arrayLength = s_addressToBets[msg.sender].length;
        if (arrayLength == 0) revert _4D__NoBetsMade();
        return s_addressToBets[msg.sender][arrayLength - 1];
    }
}
