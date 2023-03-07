// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../types.sol";
import "../World.sol";
import "../ItemNFT.sol";
import "./Players.sol"; // Might not even be needed

// Show all the player stats, return metadata json
library PlayerLibrary {
  using Strings for uint32;
  using Strings for bytes32;

  function uri(
    bytes32 name,
    mapping(Skill => uint32) storage skillPoints,
    bytes32 avatarName,
    string calldata avatarDescription,
    string calldata imageURI
  ) external view returns (string memory) {
    string memory attributes = string(
      abi.encodePacked(
        _getTraitStringJSON("Avatar", avatarName),
        ",",
        _getTraitNumberJSON("Attack", getLevel(skillPoints[Skill.ATTACK])),
        ",",
        _getTraitNumberJSON("Magic", getLevel(skillPoints[Skill.MAGIC])),
        ",",
        _getTraitNumberJSON("Defence", getLevel(skillPoints[Skill.DEFENCE])),
        ",",
        _getTraitNumberJSON("Health", getLevel(skillPoints[Skill.HEALTH])),
        ",",
        _getTraitNumberJSON("Mining", getLevel(skillPoints[Skill.MINING])),
        ",",
        _getTraitNumberJSON("WoodCutting", getLevel(skillPoints[Skill.WOODCUTTING])),
        ",",
        _getTraitNumberJSON("Fishing", getLevel(skillPoints[Skill.FISHING])),
        ",",
        _getTraitNumberJSON("Smithing", getLevel(skillPoints[Skill.SMITHING])),
        ",",
        _getTraitNumberJSON("Thieving", getLevel(skillPoints[Skill.THIEVING])),
        ",",
        _getTraitNumberJSON("Crafting", getLevel(skillPoints[Skill.CRAFTING])),
        ",",
        _getTraitNumberJSON("Cooking", getLevel(skillPoints[Skill.COOKING])),
        ",",
        _getTraitNumberJSON("FireMaking", getLevel(skillPoints[Skill.FIREMAKING]))
      )
    );

    string memory json = Base64.encode(
      abi.encodePacked(
        '{"name":"',
        _trimBytes32(name),
        '","description":"',
        avatarDescription,
        '","attributes":[',
        attributes,
        '],"image":"',
        imageURI,
        '"}'
      )
    );

    return string(abi.encodePacked("data:application/json;base64,", json));
  }

  function _trimBytes32(bytes32 _bytes32) private pure returns (bytes memory _bytes) {
    uint256 _len;
    while (_len < 32) {
      if (_bytes32[_len] == 0) {
        break;
      }
      unchecked {
        ++_len;
      }
    }
    _bytes = abi.encodePacked(_bytes32);
    assembly ("memory-safe") {
      mstore(_bytes, _len)
    }
  }

  function _getTraitStringJSON(string memory traitType, bytes32 value) private pure returns (bytes memory) {
    return abi.encodePacked(_getTraitTypeJSON(traitType), '"', _trimBytes32(value), '"}');
  }

  function _getTraitNumberJSON(string memory traitType, uint32 value) private pure returns (bytes memory) {
    return abi.encodePacked(_getTraitTypeJSON(traitType), value.toString(), "}");
  }

  function _getTraitTypeJSON(string memory traitType) private pure returns (bytes memory) {
    return abi.encodePacked('{"trait_type":"', traitType, '","value":');
  }

  // Index not level, add one after (check for > max)
  function getLevel(uint256 _xp) public pure returns (uint16) {
    uint256 low = 0;
    uint256 high = xpBytes.length / 3;

    while (low < high) {
      uint256 mid = (low + high) / 2;

      // Note that mid will always be strictly less than high (i.e. it will be a valid array index)
      // Math.average rounds down (it does integer division with truncation).
      if (_getXP(mid) > _xp) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }

    if (low > 0) {
      return uint16(low);
    } else {
      return 1;
    }
  }

  function _getXP(uint256 _index) private pure returns (uint24) {
    uint256 index = _index * 3;
    return uint24(xpBytes[index] | (bytes3(xpBytes[index + 1]) >> 8) | (bytes3(xpBytes[index + 2]) >> 16));
  }

  function foodConsumedView(
    address _from,
    QueuedAction storage queuedAction,
    uint _combatElapsedTime, // uint _battleTime,
    ItemNFT _itemNFT,
    CombatStats memory _combatStats,
    CombatStats memory _enemyCombatStats
  ) public view returns (uint16 foodConsumed, bool died) {
    int32 totalHealthLost = int32(
      (_enemyCombatStats.attack * _enemyCombatStats.attack * int32(int(_combatElapsedTime))) /
        (_combatStats.meleeDefence * 60)
    ) - _combatStats.health;
    totalHealthLost += int32(
      (_enemyCombatStats.magic * _enemyCombatStats.magic * int32(int(_combatElapsedTime))) /
        (_combatStats.magicDefence * 60)
    );

    uint healthRestored;
    if (queuedAction.regenerateId != NONE) {
      Item memory item = _itemNFT.getItem(queuedAction.regenerateId);
      healthRestored = item.healthRestored;
    }

    if (healthRestored == 0 || totalHealthLost <= 0) {
      // No food attached or didn't lose any health
      died = totalHealthLost > 0;
    } else {
      foodConsumed = uint16(
        uint32(totalHealthLost) / healthRestored + (uint32(totalHealthLost) % healthRestored == 0 ? 0 : 1)
      );
      uint balance = _itemNFT.balanceOf(_from, queuedAction.regenerateId);

      died = foodConsumed > balance;
      if (died) {
        foodConsumed = uint16(balance);
      }
    }
  }

  function _getMaxRequiredRatio(
    address _from,
    ActionChoice memory _actionChoice,
    uint16 _numConsumed,
    ItemNFT _itemNFT
  ) private view returns (uint maxRequiredRatio) {
    maxRequiredRatio = _numConsumed;
    if (_numConsumed > 0) {
      if (_actionChoice.inputTokenId1 != 0) {
        maxRequiredRatio = _getMaxRequiredRatioPartial(
          _from,
          _actionChoice.inputTokenId1,
          _actionChoice.num1,
          _numConsumed,
          maxRequiredRatio,
          _itemNFT
        );
      }
      if (_actionChoice.inputTokenId2 != 0) {
        maxRequiredRatio = _getMaxRequiredRatioPartial(
          _from,
          _actionChoice.inputTokenId2,
          _actionChoice.num2,
          _numConsumed,
          maxRequiredRatio,
          _itemNFT
        );
      }
      if (_actionChoice.inputTokenId3 != 0) {
        maxRequiredRatio = _getMaxRequiredRatioPartial(
          _from,
          _actionChoice.inputTokenId3,
          _actionChoice.num3,
          _numConsumed,
          maxRequiredRatio,
          _itemNFT
        );
      }
    }
  }

  function _getMaxRequiredRatioPartial(
    address _from,
    uint16 _inputTokenId,
    uint16 _num,
    uint16 _numConsumed,
    uint _maxRequiredRatio,
    ItemNFT _itemNFT
  ) private view returns (uint maxRequiredRatio) {
    uint balance = _itemNFT.balanceOf(_from, _inputTokenId);
    uint tempMaxRequiredRatio = _maxRequiredRatio;
    if (_numConsumed > balance / _num) {
      tempMaxRequiredRatio = balance / _num;
    }

    // Could be the first time
    if (tempMaxRequiredRatio < _maxRequiredRatio || _maxRequiredRatio == _numConsumed) {
      maxRequiredRatio = tempMaxRequiredRatio;
    }
  }

  function getAdjustedElapsedTimes(
    address _from,
    ItemNFT _itemNFT,
    World _world,
    uint _elapsedTime,
    ActionChoice memory _actionChoice,
    QueuedAction memory _queuedAction,
    CombatStats memory _combatStats,
    CombatStats memory _enemyCombatStats
  ) public view returns (uint xpElapsedTime, uint combatElapsedTime, uint16 numConsumed) {
    // Update these as necessary
    xpElapsedTime = _elapsedTime;
    combatElapsedTime = _elapsedTime;

    // Figure out how much food should be consumed.
    // This is based on the damage done from battling
    (bool isCombat, CombatStats memory enemyCombatStats) = _world.getCombatStats(_queuedAction.actionId);
    if (isCombat) {
      uint numSpawnedPerHour = _world.getNumSpawn(_queuedAction.actionId);
      uint maxHealthEnemy = (numSpawnedPerHour * _elapsedTime * uint16(enemyCombatStats.health)) / 3600;
      if (maxHealthEnemy > 0) {
        int32 totalHealthDealt;
        if (_actionChoice.skill == Skill.ATTACK) {
          totalHealthDealt =
            ((_combatStats.attack * _combatStats.attack * int32(int(_elapsedTime))) /
              _enemyCombatStats.meleeDefence +
              40) *
            60;
        } else if (_actionChoice.skill == Skill.MAGIC) {
          _combatStats.magic += int16(int32(_actionChoice.diff)); // Extra magic damage

          totalHealthDealt =
            ((_combatStats.magic * _combatStats.magic * int32(int(_elapsedTime))) / _enemyCombatStats.magicDefence) *
            60;
        } else if (_actionChoice.skill == Skill.RANGE) {
          // Add later
          //        totalHealthDealt = (_combatStats.range * _combatStats.range * int32(int(_elapsedTime))) /
          //        _enemyCombatStats.rangeDefence;
        }

        // Work out the ratio of health dealt to the max health they have
        if (uint32(totalHealthDealt) > maxHealthEnemy) {
          // We killed them all, but figure out how long it took
          combatElapsedTime = (_elapsedTime * uint32(totalHealthDealt)) / maxHealthEnemy; // Use this to work out how much food, arrows & spells to consume
          if (combatElapsedTime > _elapsedTime) {
            combatElapsedTime = _elapsedTime;
          }
        } else if (uint32(totalHealthDealt) < maxHealthEnemy) {
          // We didn't kill them all so they don't get the full rewards/xp
          // This correct?
          xpElapsedTime = (_elapsedTime * uint32(totalHealthDealt)) / maxHealthEnemy;
        }

        // Check the max that can be used
        numConsumed = uint16((combatElapsedTime * _actionChoice.rate) / (3600 * 100));
        if (numConsumed != 0) {
          // This checks the balances
          uint maxRequiredRatio = _getMaxRequiredRatio(_from, _actionChoice, numConsumed, _itemNFT);

          if (numConsumed > maxRequiredRatio) {
            numConsumed = uint16(maxRequiredRatio);

            // Work out what the actual elapsedTime should really be because they didn't have enough equipped to gain all the XP
            xpElapsedTime = (combatElapsedTime * maxRequiredRatio) / numConsumed;
          }
        }
      } else {
        xpElapsedTime = 0;
      }
    } else {
      // Non-combat, check the max that can be used
      numConsumed = uint16((_elapsedTime * _actionChoice.rate) / (3600 * 100));
      // This checks the balances
      uint maxRequiredRatio = _getMaxRequiredRatio(_from, _actionChoice, numConsumed, _itemNFT);
      if (numConsumed > maxRequiredRatio) {
        numConsumed = uint16(maxRequiredRatio);

        // Work out what the actual elapsedTime should really be because they didn't have enough equipped to gain all the XP
        xpElapsedTime = (combatElapsedTime * maxRequiredRatio) / numConsumed;
      }
    }
  }

  function _isCombat(CombatStyle _combatStyle) private pure returns (bool) {
    return _combatStyle != CombatStyle.NONE;
  }

  function extraXPFromBoost(
    bool _isCombatSkill,
    uint _actionStartTime,
    uint _elapsedTime,
    uint16 _xpPerHour,
    PlayerBoostInfo storage activeBoost
  ) public view returns (uint32 boostPointsAccrued) {
    if (activeBoost.itemTokenId != NONE && activeBoost.startTime < block.timestamp) {
      // A boost is active
      if (
        (_isCombatSkill && activeBoost.boostType == BoostType.COMBAT_XP) ||
        (!_isCombatSkill && activeBoost.boostType == BoostType.NON_COMBAT_XP)
      ) {
        uint boostedTime;
        // Correct skill for the boost
        if (_actionStartTime + _elapsedTime < activeBoost.startTime + activeBoost.duration) {
          // Consume it all
          boostedTime = _elapsedTime;
        } else {
          boostedTime = activeBoost.duration;
        }
        boostPointsAccrued = uint32((boostedTime * _xpPerHour * activeBoost.val) / (3600 * 100));
      }
    }
  }
}