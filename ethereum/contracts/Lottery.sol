// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.19;
// linter warnings (red underline) about pragma version can igonored!


contract Lottery {
    address public manager;
    address payable[] public players;

    constructor() {
        manager = msg.sender;
    }
    
    function enter() public payable {
        require(msg.value > .01 ether);
        players.push(payable(msg.sender));
    }
    
    function random() private view returns (uint) {
          return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
    }
    
    function pickWinner() public restricted {
        uint index = random() % players.length;
        players[index].transfer(address(this).balance);
        //lastWinner = players[index];
        players = new address payable[](0);
    }
    
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
    
    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }

    function convertAddress(address addr) public pure returns (address payable) {
        // Convert address to address payable
        return payable(address(uint160(addr)));
    }


    // payable owner

    // address payable public owner;

    // constructor() {
    //     owner = payable(msg.sender);
    // }

    // function sendEther(address payable recipient) public {
    //     require(msg.sender == owner, "Only owner can send Ether");
    //     recipient.transfer(1 ether);
    // }
}   