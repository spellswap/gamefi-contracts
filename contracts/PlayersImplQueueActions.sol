// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./PlayersImplBase.sol";

contract PlayersImplQueueActions is PlayersImplBase {
  error NoItemBalance(uint16 itemTokenId);

  function startActions(
    uint _playerId,
    QueuedAction[] memory _queuedActions,
    uint16 _boostItemTokenId,
    ActionQueueStatus _queueStatus
  ) external {
    if (_queuedActions.length == 0) {
      revert SkillsArrayZero();
    }

    address from = msg.sender;
    uint totalTimespan;
    QueuedAction[] memory remainingSkills = _processActions(from, _playerId);

    if (_boostItemTokenId != NONE) {
      consumeBoost(_playerId, _boostItemTokenId, uint40(block.timestamp));
    }

    Player storage player = players[_playerId];
    if (_queueStatus == ActionQueueStatus.NONE) {
      if (player.actionQueue.length > 0) {
        // Clear action queue
        QueuedAction[] memory queuedActions;
        player.actionQueue = queuedActions;
      }
      if (_queuedActions.length > 3) {
        revert TooManyActionsQueued();
      }
    } else {
      if (_queueStatus == ActionQueueStatus.KEEP_LAST_IN_PROGRESS && remainingSkills.length > 1) {
        // Only want one
        assembly ("memory-safe") {
          mstore(remainingSkills, 1)
        }
      }

      // Keep remaining actions
      if (remainingSkills.length + _queuedActions.length > 3) {
        revert TooManyActionsQueuedSomeAlreadyExist();
      }
      player.actionQueue = remainingSkills;

      for (uint i = 0; i < remainingSkills.length; ++i) {
        totalTimespan += remainingSkills[i].timespan;
      }
    }

    uint prevEndTime = block.timestamp + totalTimespan;

    uint256 i;
    uint64 queueId = latestQueueId;
    do {
      QueuedAction memory queuedAction = _queuedActions[i];

      if (totalTimespan + queuedAction.timespan > MAX_TIME) {
        // Must be the last one which will exceed the max time
        if (i != _queuedActions.length - 1) {
          revert ActionTimespanExceedsMaxTime();
        }
        // Shorten it so that it does not extend beyond the max time
        queuedAction.timespan = uint24(MAX_TIME - totalTimespan);
      }

      _addToQueue(from, _playerId, queuedAction, queueId, prevEndTime);
      unchecked {
        ++i;
        ++queueId;
      }
      totalTimespan += queuedAction.timespan;
      prevEndTime += queuedAction.timespan;
    } while (i < _queuedActions.length);

    emit SetActionQueue(_playerId, player.actionQueue);

    assert(totalTimespan <= MAX_TIME); // Should never happen
    latestQueueId = queueId;
  }

  function consumeBoost(uint _playerId, uint16 _itemTokenId, uint40 _startTime) public {
    PlayerBoostInfo storage playerBoost = activeBoosts[_playerId];

    Item memory item = itemNFT.getItem(_itemTokenId);
    require(item.boostType != BoostType.NONE); // , "Not a boost vial");
    require(_startTime < block.timestamp + 7 days); // , "Start time too far in the future");
    if (_startTime < block.timestamp) {
      _startTime = uint40(block.timestamp);
    }

    // Burn it
    address from = msg.sender;
    itemNFT.burn(from, _itemTokenId, 1);

    // If there's an active potion which hasn't been consumed yet, then we can mint it back
    if (playerBoost.itemTokenId != NONE) {
      itemNFT.mint(from, playerBoost.itemTokenId, 1);
    }

    playerBoost.startTime = _startTime;
    playerBoost.duration = item.boostDuration;
    playerBoost.val = item.boostValue;
    playerBoost.boostType = item.boostType;
    playerBoost.itemTokenId = _itemTokenId;

    emit ConsumeBoostVial(_playerId, playerBoost);
  }

  function _addToQueue(
    address _from,
    uint _playerId,
    QueuedAction memory _queuedAction,
    uint128 _queueId,
    uint _startTime
  ) private {
    Player storage _player = players[_playerId];
    //    Skill skill = world.getSkill(_queuedAction.actionId); // Can be combat

    if (_queuedAction.attire.ring != NONE) {
      revert UnsupportedAttire();
    }
    if (_queuedAction.attire.reserved1 != NONE) {
      revert UnsupportedAttire();
    }

    (uint16 itemTokenIdRangeMin, uint16 itemTokenIdRangeMax) = world.getPermissibleItemsForAction(
      _queuedAction.actionId
    );

    if (!world.actionIsAvailable(_queuedAction.actionId)) {
      revert ActionNotAvailable();
    }

    // TODO: Check if it requires an action choice and that a valid one was specified
    _checkEquipActionEquipment(_from, _queuedAction.leftArmEquipmentTokenId, itemTokenIdRangeMin, itemTokenIdRangeMax);
    _checkEquipActionEquipment(_from, _queuedAction.rightArmEquipmentTokenId, itemTokenIdRangeMin, itemTokenIdRangeMax);

    _checkAttire(_from, _queuedAction.attire);
    _checkActionConsumables(_from, _queuedAction);

    _queuedAction.startTime = uint40(_startTime);
    _queuedAction.attire.queueId = _queueId;
    _player.actionQueue.push(_queuedAction);
  }

  function _checkActionConsumables(address _from, QueuedAction memory _queuedAction) private view {
    // Check they have this to equip. Indexer can check actionChoices
    if (_queuedAction.regenerateId != NONE && itemNFT.balanceOf(_from, _queuedAction.regenerateId) == 0) {
      revert NoItemBalance(_queuedAction.regenerateId);
    }

    if (_queuedAction.choiceId != NONE) {
      // Get all items for this
      ActionChoice memory actionChoice = world.getActionChoice(
        _isCombat(_queuedAction.combatStyle) ? NONE : _queuedAction.actionId,
        _queuedAction.choiceId
      );

      // TODO: Can be balance of batch
      if (actionChoice.inputTokenId1 != NONE && itemNFT.balanceOf(_from, actionChoice.inputTokenId1) == 0) {
        revert NoItemBalance(actionChoice.inputTokenId1);
      }
      if (actionChoice.inputTokenId2 != NONE && itemNFT.balanceOf(_from, actionChoice.inputTokenId2) == 0) {
        revert NoItemBalance(actionChoice.inputTokenId2);
      }
      if (actionChoice.inputTokenId3 != NONE && itemNFT.balanceOf(_from, actionChoice.inputTokenId3) == 0) {
        revert NoItemBalance(actionChoice.inputTokenId3);
      }
    }
    //     if (_queuedAction.choiceId1 != NONE) {
    //     if (_queuedAction.choiceId2 != NONE) {
  }

  // Checks they have sufficient balance to equip the items
  function _checkAttire(address _from, Attire memory _attire) private view {
    // Check the user has these items
    //    uint raw = _getEquipmentRawVal(_attire);
    //    if (raw > 0) {
    if (_attire.helmet != NONE && itemNFT.balanceOf(_from, _attire.helmet) == 0) {
      revert NoItemBalance(_attire.helmet);
    }
    if (_attire.amulet != NONE && itemNFT.balanceOf(_from, _attire.amulet) == 0) {
      revert NoItemBalance(_attire.amulet);
    }
    if (_attire.armor != NONE && itemNFT.balanceOf(_from, _attire.armor) == 0) {
      revert NoItemBalance(_attire.armor);
    }
    if (_attire.gauntlets != NONE && itemNFT.balanceOf(_from, _attire.gauntlets) == 0) {
      revert NoItemBalance(_attire.gauntlets);
    }
    if (_attire.tassets != NONE && itemNFT.balanceOf(_from, _attire.tassets) == 0) {
      revert NoItemBalance(_attire.tassets);
    }
    if (_attire.boots != NONE && itemNFT.balanceOf(_from, _attire.boots) == 0) {
      revert NoItemBalance(_attire.boots);
    }
    //    }
  }

  function _isMainEquipped(uint _playerId, uint _itemTokenId) private view returns (bool) {
    EquipPosition position = _getMainEquipPosition(_itemTokenId);
    Player storage player = players[_playerId];
    uint equippedTokenId = _getEquippedTokenId(position, player);
    return equippedTokenId == _itemTokenId;
  }

  function _getMainEquipPosition(uint _itemTokenId) private pure returns (EquipPosition) {
    if (_itemTokenId >= MAX_MAIN_EQUIPMENT_ID) {
      return EquipPosition.NONE;
    }

    return EquipPosition(_itemTokenId / 65536);
  }

  function _getEquippedTokenId(
    EquipPosition _position,
    Player storage _player
  ) private view returns (uint16 equippedTokenId) {
    assembly ("memory-safe") {
      let val := sload(_player.slot)
      equippedTokenId := shr(mul(_position, 16), val)
    }
  }

  function _checkEquipActionEquipment(
    address _from,
    uint16 _itemTokenId,
    uint16 _itemTokenIdRangeMin,
    uint16 _itemTokenIdRangeMax
  ) private view {
    if (_itemTokenId != NONE) {
      if (_itemTokenId < _itemTokenIdRangeMin || _itemTokenId > _itemTokenIdRangeMax) {
        revert InvalidArmEquipment(_itemTokenId);
      }

      uint256 balance = itemNFT.balanceOf(_from, _itemTokenId);
      if (balance == 0) {
        revert DoNotHaveEnoughQuantityToEquipToAction();
      }
    }
  }
}
