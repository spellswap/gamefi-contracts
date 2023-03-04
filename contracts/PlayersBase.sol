// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./World.sol";
import "./types.sol";
import "./items.sol";
import "./ItemNFT.sol";
import "./PlayerNFT.sol";

import {PlayerLibrary} from "./PlayerLibrary.sol";

contract PlayersBase {
  event ActionUnequip(uint playerId, uint128 queueId, uint16 itemTokenId, uint amount);

  event ClearAll(uint playerId);

  event AddSkillPoints(uint playerId, Skill skill, uint32 points);

  event LevelUp(uint playerId, uint[] itemTokenIdsRewarded, uint[] amountTokenIdsRewarded);

  event SetActionQueue(uint playerId, QueuedAction[] queuedActions);

  event ConsumeBoostVial(uint playerId, PlayerBoostInfo playerBoostInfo);
  event UnconsumeBoostVial(uint playerId);

  event SetActivePlayer(address account, uint oldPlayerId, uint newPlayerId);

  event RemoveQueuedAction(uint playerId, uint128 queueId);

  event AddPendingRandomReward(uint playerId, uint timestamp, uint elapsed);

  // For logging
  event Died(address from, uint playerId, uint128 queueId);
  event Rewards(address from, uint playerId, uint128 queueId, uint[] itemTokenIds, uint[] amounts);
  event Reward(address from, uint playerId, uint128 queueId, uint16 itemTokenId, uint amount); // Used in PlayerLibrary too
  event Consume(address from, uint playerId, uint128 queueId, uint16 itemTokenId, uint amount); // Used in PlayerLibrary too
  event ActionFinished(address from, uint playerId, uint128 queueId);
  event ActionPartiallyFinished(address from, uint playerId, uint128 queueId, uint elapsedTime);
  event ActionAborted(uint playerId, uint128 queueId);

  error SkillsArrayZero();
  error NotOwner();
  error NotActive();
  error EquipSameItem();
  error NotEquipped();
  error ArgumentLengthMismatch();
  error NotPlayerNFT();
  error NotItemNFT();
  error ActionNotAvailable();
  error UnsupportedAttire();
  error InvalidArmEquipment(uint16 itemTokenId);
  error DoNotHaveEnoughQuantityToEquipToAction();
  error NoActiveBoost();
  error BoostTimeAlreadyStarted();
  error TooManyActionsQueued();
  error TooManyActionsQueuedSomeAlreadyExist();
  error ActionTimespanExceedsMaxTime();
  error ActionTimespanZero();

  uint32 public constant MAX_TIME = 1 days;

  uint constant MAX_MAIN_EQUIPMENT_ID = 65536 * 8;

  mapping(uint => uint) internal speedMultiplier; // 0 or 1 is diabled, for testing only

  mapping(address => uint) internal activePlayer;

  mapping(uint => PlayerBoostInfo) public activeBoosts; // player id => boost info

  uint64 internal latestQueueId; // Global queued action id
  World internal world;

  mapping(uint => mapping(Skill => uint32)) public skillPoints; // player -> skill -> points

  mapping(uint => Player) public players;
  ItemNFT internal itemNFT;
  PlayerNFT internal playerNFT;
  mapping(uint => PendingRandomReward[]) internal pendingRandomRewards; // queue, will be sorted by timestamp

  address implQueueActions;
  address implProcessActions;
  address implRewards;
  address reserved1;

  modifier isOwnerOfPlayer(uint playerId) {
    if (playerNFT.balanceOf(msg.sender, playerId) != 1) {
      revert NotOwner();
    }
    _;
  }

  modifier isOwnerOfPlayerAndActive(uint _playerId) {
    if (playerNFT.balanceOf(msg.sender, _playerId) != 1) {
      revert NotOwner();
    }
    if (activePlayer[msg.sender] != _playerId) {
      revert NotActive();
    }
    _;
  }

  modifier onlyPlayerNFT() {
    if (msg.sender != address(playerNFT)) {
      revert NotPlayerNFT();
    }
    _;
  }

  modifier onlyItemNFT() {
    if (msg.sender != address(itemNFT)) {
      revert NotItemNFT();
    }
    _;
  }

  function _extraXPFromBoost(
    uint _playerId,
    bool _isCombatSkill,
    uint _actionStartTime,
    uint _elapsedTime,
    uint16 _xpPerHour
  ) internal view returns (uint32 boostPointsAccrued) {
    return
      PlayerLibrary.extraXPFromBoost(
        _isCombatSkill,
        _actionStartTime,
        _elapsedTime,
        _xpPerHour,
        activeBoosts[_playerId]
      );
  }

  function _isCombat(CombatStyle _combatStyle) internal pure returns (bool) {
    return _combatStyle != CombatStyle.NONE;
  }

  function _getElapsedTime(
    uint _playerId,
    uint _skillEndTime,
    QueuedAction storage _queuedAction
  ) internal view returns (uint elapsedTime) {
    uint _speedMultiplier = speedMultiplier[_playerId];
    bool consumeAll = _skillEndTime <= block.timestamp;

    if (consumeAll) {
      // Fully consume this skill
      elapsedTime = _queuedAction.timespan;
    } else if (block.timestamp > _queuedAction.startTime) {
      // partially consume
      elapsedTime = block.timestamp - _queuedAction.startTime;
      uint modifiedElapsedTime = _speedMultiplier > 1 ? uint(elapsedTime) * _speedMultiplier : elapsedTime;
      // Up to timespan
      if (modifiedElapsedTime > _queuedAction.timespan) {
        elapsedTime = _queuedAction.timespan;
      }
    }
  }

  function _updateCombatStats(address _from, CombatStats memory _stats, Attire storage _attire) internal view {
    uint attireLength;
    uint16[] memory itemTokenIds = new uint16[](6);
    if (_attire.helmet != NONE) {
      itemTokenIds[attireLength] = _attire.helmet;
      ++attireLength;
    }
    if (_attire.amulet != NONE) {
      itemTokenIds[attireLength] = _attire.amulet;
      ++attireLength;
    }
    if (_attire.armor != NONE) {
      itemTokenIds[attireLength] = _attire.armor;
      ++attireLength;
    }
    if (_attire.gauntlets != NONE) {
      itemTokenIds[attireLength] = _attire.gauntlets;
      ++attireLength;
    }
    if (_attire.tassets != NONE) {
      itemTokenIds[attireLength] = _attire.tassets;
      ++attireLength;
    }
    if (_attire.boots != NONE) {
      itemTokenIds[attireLength] = _attire.boots;
      ++attireLength;
    }

    assembly ("memory-safe") {
      mstore(itemTokenIds, attireLength)
    }

    if (attireLength > 0) {
      Item[] memory items = itemNFT.getItems(itemTokenIds);
      uint[] memory balances = itemNFT.balanceOfs(_from, itemTokenIds);
      for (uint i; i < items.length; ++i) {
        if (balances[i] > 0) {
          _updateCombatStatsFromItem(_stats, items[i]);
        }
      }
    }

    // TODO: This isn't correct, should be handled in the calculations elsewhere with a better formula
    if (_stats.attack <= 0) {
      _stats.attack = 1;
    }
    if (_stats.meleeDefence <= 0) {
      _stats.meleeDefence = 1;
    }
    if (_stats.magic <= 0) {
      _stats.magic = 1;
    }
    if (_stats.magicDefence <= 0) {
      _stats.magicDefence = 1;
    }
    if (_stats.range <= 0) {
      _stats.range = 1;
    }
    if (_stats.rangeDefence <= 0) {
      _stats.rangeDefence = 1;
    }
    if (_stats.health <= 0) {
      _stats.health = 1;
    }
  }

  function _updateCombatStatsFromItem(CombatStats memory _stats, Item memory _item) private pure {
    if (_item.attack != 0) {
      _stats.attack += _item.attack;
    }
    if (_item.magic != 0) {
      _stats.magic += _item.magic;
    }
    if (_item.range != 0) {
      _stats.range += _item.range;
    }
    if (_item.meleeDefence != 0) {
      _stats.meleeDefence += _item.meleeDefence;
    }
    if (_item.magicDefence != 0) {
      _stats.magicDefence += _item.magicDefence;
    }
    if (_item.rangeDefence != 0) {
      _stats.rangeDefence += _item.rangeDefence;
    }
    if (_item.health != 0) {
      _stats.health += _item.health;
    }
  }

  function _processActions(address _from, uint _playerId) internal returns (QueuedAction[] memory remainingSkills) {
    (bool success, bytes memory data) = implProcessActions.delegatecall(
      abi.encodeWithSignature("processActions(address,uint256)", _from, _playerId)
    );
    require(success);
    return abi.decode(data, (QueuedAction[]));
  }
}
