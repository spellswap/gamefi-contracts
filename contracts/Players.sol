// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Multicall.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./World.sol";
import "./types.sol";
import "./items.sol";
import "./ItemNFT.sol";
import "./PlayerNFT.sol";
import "./PlayersBase.sol";

import {PlayerLibrary} from "./PlayerLibrary.sol";

// External view functions that are in other implementation files
interface PlayerDelegateView {
  function pending(uint _playerId) external view returns (PendingOutput memory pendingOutput);

  function claimableRandomRewards(
    uint _playerId
  ) external view returns (uint[] memory ids, uint[] memory amounts, uint numRemoved);
}

// Functions to help with delegatecall selectors
interface IPlayerDelegate {
  function startActions(
    uint _playerId,
    QueuedAction[] memory _queuedActions,
    uint16 _boostItemTokenId,
    ActionQueueStatus _queueStatus
  ) external;
}

contract Players is PlayersBase, OwnableUpgradeable, UUPSUpgradeable, Multicall {
  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function initialize(
    ItemNFT _itemNFT,
    PlayerNFT _playerNFT,
    World _world,
    address _implQueueActions,
    address _implProcessActions,
    address _implRewards
  ) public initializer {
    __Ownable_init();
    __UUPSUpgradeable_init();

    itemNFT = _itemNFT;
    playerNFT = _playerNFT;
    world = _world;
    implQueueActions = _implQueueActions;
    implProcessActions = _implProcessActions;
    implRewards = _implRewards;

    latestQueueId = 1;
  }

  function startAction(
    uint _playerId,
    QueuedAction calldata _queuedAction,
    ActionQueueStatus _queueStatus
  ) external isOwnerOfPlayerAndActive(_playerId) {
    QueuedAction[] memory queuedActions = new QueuedAction[](1);
    queuedActions[0] = _queuedAction;
    _startActions(_playerId, queuedActions, NONE, _queueStatus);
  }

  // Queue them up (Skill X for some amount of time, Skill Y for some amount of time, SKill Z for some amount of time)
  function startActions(
    uint _playerId,
    QueuedAction[] calldata _queuedActions,
    uint16 _boostItemTokenId,
    ActionQueueStatus _queueStatus
  ) external isOwnerOfPlayerAndActive(_playerId) {
    _startActions(_playerId, _queuedActions, _boostItemTokenId, _queueStatus);
  }

  function processActions(uint _playerId) external isOwnerOfPlayerAndActive(_playerId) {
    QueuedAction[] memory remainingSkillQueue = _processActions(msg.sender, _playerId);
    _setActionQueue(_playerId, remainingSkillQueue);
  }

  function consumeBoost(
    uint _playerId,
    uint16 _itemTokenId,
    uint40 _startTime
  ) external isOwnerOfPlayerAndActive(_playerId) {
    (bool success, ) = implQueueActions.delegatecall(
      abi.encodeWithSignature("consumeBoost(uint256,uint16,uint40)", _playerId, _itemTokenId, _startTime)
    );
    require(success);
  }

  function unequipBoostVial(uint _playerId) external isOwnerOfPlayerAndActive(_playerId) {
    if (activeBoosts[_playerId].boostType == BoostType.NONE) {
      revert NoActiveBoost();
    }
    if (activeBoosts[_playerId].startTime > block.timestamp) {
      revert BoostTimeAlreadyStarted();
    }
    address from = msg.sender;
    itemNFT.mint(from, activeBoosts[_playerId].itemTokenId, 1);
    emit UnconsumeBoostVial(_playerId);
  }

  function getPendingRandomRewards(uint _playerId) external view returns (PendingRandomReward[] memory) {
    return pendingRandomRewards[_playerId];
  }

  function getActionQueue(uint _playerId) external view returns (QueuedAction[] memory) {
    return players[_playerId].actionQueue;
  }

  function actionQueueLength(uint _playerId) external view returns (uint256) {
    return players[_playerId].actionQueue.length;
  }

  function mintBatch(address _to, uint[] calldata _ids, uint256[] calldata _amounts) external onlyPlayerNFT {
    itemNFT.mintBatch(_to, _ids, _amounts);
  }

  function setSpeedMultiplier(uint _playerId, uint16 multiplier) external {
    // Disable for production code
    speedMultiplier[_playerId] = multiplier;
  }

  function getURI(
    uint _playerId,
    bytes32 _name,
    bytes32 _avatarName,
    string calldata _avatarDescription,
    string calldata imageURI
  ) external view returns (string memory) {
    return PlayerLibrary.uri(_name, skillPoints[_playerId], _avatarName, _avatarDescription, imageURI);
  }

  // Callback after minting a player. If they aren't the active player then set it.
  function mintedPlayer(address _from, uint _playerId, bool makeActive) external onlyPlayerNFT {
    if (makeActive) {
      _setActivePlayer(_from, _playerId);
    }
  }

  function clearEverything(uint _playerId) external isOwnerOfPlayerAndActive(_playerId) {
    _clearEverything(msg.sender, _playerId);
  }

  function clearEverythingBeforeTokenTransfer(address _from, uint _playerId) external onlyPlayerNFT {
    _clearEverything(_from, _playerId);
  }

  function itemBeforeTokenTransfer(
    address _from,
    uint[] calldata _itemTokenIds,
    uint[] calldata _amounts
  ) external onlyItemNFT {
    uint playerId = activePlayer[_from];
    if (playerId == 0) {
      return;
    }
    // Currently not used
  }

  // Consumes all the actions in the queue up to this time.
  // Unequips everything which is just emitting an event
  // Mints the boost vial if it hasn't been consumed at all yet
  // Removes all the actions from the queue
  function _clearEverything(address _from, uint _playerId) private {
    _processActions(_from, _playerId);
    emit ClearAll(_playerId);
    // Can re-mint boost if it hasn't been consumed at all yet
    if (activeBoosts[_playerId].boostType != BoostType.NONE && activeBoosts[_playerId].startTime < block.timestamp) {
      itemNFT.mint(_from, activeBoosts[_playerId].itemTokenId, 1);
      delete activeBoosts[_playerId];
    }
    _clearActionQueue(_playerId);
  }

  function _clearActionQueue(uint _playerId) private {
    QueuedAction[] memory queuedActions;
    _setActionQueue(_playerId, queuedActions);
  }

  function _setActionQueue(uint _playerId, QueuedAction[] memory _queuedActions) private {
    Player storage player = players[_playerId];
    player.actionQueue = _queuedActions;
    emit SetActionQueue(_playerId, player.actionQueue);
  }

  function _startActions(
    uint _playerId,
    QueuedAction[] memory _queuedActions,
    uint16 _boostItemTokenId,
    ActionQueueStatus _queueStatus
  ) private {
    (bool success, ) = implQueueActions.delegatecall(
      abi.encodeWithSelector(
        IPlayerDelegate.startActions.selector,
        _playerId,
        _queuedActions,
        _boostItemTokenId,
        _queueStatus
      )
    );
    require(success);
  }

  /*
  function removeQueuedAction(uint _playerId, uint _queueId) external isOwnerOfPlayer(_playerId) {
    // If the action is in progress, it can't be removed (allow later)
    QueuedAction[] storage actionQueue = players[_playerId].actionQueue;
    for (uint i; i < actionQueue.length; ++i) {
      QueuedAction storage queuedAction = actionQueue[i];
      if (queuedAction.attire.queueId == _queueId) {
        uint skillEndTime = queuedAction.startTime +
          (
            speedMultiplier[_playerId] > 1
              ? uint(queuedAction.timespan) / speedMultiplier[_playerId]
              : queuedAction.timespan
          );

        uint elapsedTime = _getElapsedTime(_playerId, skillEndTime, queuedAction);
        require(elapsedTime == 0, "Elapsed time must be > 0");
        // Action hasn't started yet so allow it to be removed.
        for (uint j = i; j < actionQueue.length - 1; ++j) {
          actionQueue[j] = actionQueue[j + 1];
          // Shift start times
          actionQueue[j].startTime -= queuedAction.timespan;
        }
        actionQueue.pop();
        emit RemoveQueuedAction(_playerId, _queueId);
        return;
      }
    }
  } */

  /*  function getLootBonusMultiplier(uint  _playerId) external view returns (uint256) {
    // The higher the level the higher the multiplier?
    return 2;
  } */

  /*
  function getLoot(uint actionId, uint seed) external view returns (uint[] memory playerIds) {
    if (seed == 0) {
      return playerIds;
    }

    playerIds = new uint[](3); // max
    uint length;
    if (seed % 2 == 0) {
      playerIds[0] = SAPPHIRE_AMULET;
    } else {
      playerIds[0] = BRONZE_PICKAXE;
    }

    assembly ("memory-safe") {
      mstore(playerIds, length)
    }
  } */

  function _setActivePlayer(address _from, uint _playerId) private {
    uint existingActivePlayer = activePlayer[_from];
    if (existingActivePlayer > 0) {
      // If there is an existing active player, unequip all items
      _clearEverything(_from, existingActivePlayer);
    }
    // All attire and actions can be made for this player
    activePlayer[_from] = _playerId;
    emit SetActivePlayer(_from, existingActivePlayer, _playerId);
  }

  function setActivePlayer(uint _playerId) external isOwnerOfPlayer(_playerId) {
    _setActivePlayer(msg.sender, _playerId);
  }

  function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

  function setImpls(address _queueActions, address _processActions, address _rewards) external onlyOwner {
    implQueueActions = _queueActions;
    implProcessActions = _processActions;
    implRewards = _rewards;
  }

  // For the various view functions that require delegatecall
  fallback() external {
    bytes4 selector = bytes4(msg.data);

    address implementation;
    if (
      selector == PlayerDelegateView.pending.selector || selector == PlayerDelegateView.claimableRandomRewards.selector
    ) {
      implementation = implRewards;
    } else {
      require(false);
    }

    assembly ("memory-safe") {
      calldatacopy(0, 0, calldatasize())
      let result := delegatecall(gas(), implementation, 0, calldatasize(), 0, 0)
      returndatacopy(0, 0, returndatasize())
      switch result
      case 0 {
        revert(0, returndatasize())
      }
      default {
        return(0, returndatasize())
      }
    }
  }
}
