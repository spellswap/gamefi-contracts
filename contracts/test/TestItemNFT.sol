//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../ItemNFT.sol";
import "../interfaces/IBrushToken.sol";
import "../World.sol";
import "../Users.sol";

contract TestItemNFT is ItemNFT {
  constructor(IBrushToken _brush, World _world, Users _users) ItemNFT(_brush, _world, _users) {}

  function testMint(address _to, Item _tokenId, uint256 _amount) external {
    uint existingBalance = itemBalances[_tokenId];
    if (existingBalance == 0) {
      // Brand new item
      ++numItems;
    }

    itemBalances[_tokenId] = existingBalance + _amount;
    _mint(_to, uint(_tokenId), _amount, "");
  }
}
