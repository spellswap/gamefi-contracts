import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {EstforConstants, EstforTypes} from "@paintswap/estfor-definitions";
import {expect} from "chai";
import {ethers} from "hardhat";
import {playersFixture} from "./PlayersFixture";
import {setupBasicPetMeleeCombat, getXPFromLevel} from "./utils";
import {Skill} from "@paintswap/estfor-definitions/types";
import {allBasePets} from "../../scripts/data/pets";
import {NO_DONATION_AMOUNT} from "../utils";

describe("Pets", function () {
  it("Queue a pet which you don't have a balance for", async function () {
    const {players, playerId, itemNFT, world, alice} = await loadFixture(playersFixture);
    const petId = 1;
    const {queuedAction} = await setupBasicPetMeleeCombat(itemNFT, world, petId);
    await expect(
      players.connect(alice).startActionsV2(playerId, [queuedAction], EstforTypes.ActionQueueStatus.NONE)
    ).to.be.revertedWithCustomError(players, "PetNotOwned");
  });

  it("Queue a pet with combat", async function () {
    const {players, playerId, petNFT, itemNFT, world, alice} = await loadFixture(playersFixture);

    const basePet = {...allBasePets[0]};
    basePet.skillFixedMins = [0, 0];
    basePet.skillPercentageMins = [100, 0];
    basePet.skillPercentageMaxs = [101, 0];
    await petNFT.addBasePets([basePet]);
    await petNFT.mint(alice.address, basePet.baseId, 0);

    await players.testModifyXP(alice.address, playerId, Skill.MELEE, getXPFromLevel(5), true);
    const petId = 1;
    const {queuedAction} = await setupBasicPetMeleeCombat(itemNFT, world, petId);

    // Should be killing 1 every 72 seconds when you have 6 melee. So a melee of 3 with a 100% multiplier will be enough
    await players.connect(alice).startActionsV2(playerId, [queuedAction], EstforTypes.ActionQueueStatus.NONE);
    await ethers.provider.send("evm_increaseTime", [72]);
    await players.connect(alice).processActions(playerId);
    expect(await players.xp(playerId, EstforTypes.Skill.MELEE)).to.eq(getXPFromLevel(5) + 36);
  });

  it("Queue a pet with combat, partial action consumption", async function () {
    const {players, playerId, petNFT, itemNFT, world, alice} = await loadFixture(playersFixture);

    const basePet = {...allBasePets[0]};
    basePet.skillFixedMins = [0, 0];
    basePet.skillPercentageMins = [100, 0];
    basePet.skillPercentageMaxs = [101, 0];
    await petNFT.addBasePets([basePet]);
    await petNFT.mint(alice.address, basePet.baseId, 0);

    await players.testModifyXP(alice.address, playerId, Skill.MELEE, getXPFromLevel(5), true);
    const petId = 1;
    const {queuedAction} = await setupBasicPetMeleeCombat(itemNFT, world, petId);

    // Should be killing 1 every 72 seconds when you have 6 melee. So a melee of 3 with a 100% multiplier will be enough
    await players.connect(alice).startActionsV2(playerId, [queuedAction], EstforTypes.ActionQueueStatus.NONE);
    await ethers.provider.send("evm_increaseTime", [62]);

    await players.connect(alice).processActions(playerId);
    expect(await players.xp(playerId, EstforTypes.Skill.MELEE)).to.eq(getXPFromLevel(5));

    await ethers.provider.send("evm_increaseTime", [10]);
    await players.connect(alice).processActions(playerId);
    expect(await players.xp(playerId, EstforTypes.Skill.MELEE)).to.eq(getXPFromLevel(5) + 36);
  });

  it("Transfer away and back and the pet should no longer be used", async function () {
    const {players, playerId, petNFT, itemNFT, world, owner, alice} = await loadFixture(playersFixture);

    const basePet = {...allBasePets[0]};
    basePet.skillFixedMins = [0, 0];
    basePet.skillPercentageMins = [100, 0];
    basePet.skillPercentageMaxs = [101, 0];
    await petNFT.addBasePets([basePet]);
    await petNFT.mint(alice.address, basePet.baseId, 0);
    const {timestamp: NOW} = await ethers.provider.getBlock("latest");

    await players.testModifyXP(alice.address, playerId, Skill.MELEE, getXPFromLevel(5), true);
    const petId = 1;
    const {queuedAction} = await setupBasicPetMeleeCombat(itemNFT, world, petId);
    await players.connect(alice).startActionsV2(playerId, [queuedAction], EstforTypes.ActionQueueStatus.NONE);
    let pet = await petNFT.getPet(petId);
    expect(pet.lastAssignmentTimestamp).to.eq(NOW);
    await petNFT.connect(alice).safeTransferFrom(alice.address, owner.address, petId, 1, "0x");
    const {timestamp: NOW1} = await ethers.provider.getBlock("latest");
    pet = await petNFT.getPet(petId);
    expect(pet.owner).to.eq(owner.address);
    expect(pet.lastAssignmentTimestamp).to.eq(NOW1);
    await petNFT.safeTransferFrom(owner.address, alice.address, petId, 1, "0x");
    await ethers.provider.send("evm_increaseTime", [72]);
    await players.connect(alice).processActions(playerId);
    expect(await players.xp(playerId, EstforTypes.Skill.MELEE)).to.eq(getXPFromLevel(5)); // No XP gained
  });

  it("Transfer away and back and the pet can should still be used for later queued actions", async function () {
    const {players, playerId, petNFT, itemNFT, world, owner, alice} = await loadFixture(playersFixture);

    const basePet = {...allBasePets[0]};
    basePet.skillFixedMins = [0, 0];
    basePet.skillPercentageMins = [100, 0];
    basePet.skillPercentageMaxs = [101, 0];
    await petNFT.addBasePets([basePet]);
    await petNFT.mint(alice.address, basePet.baseId, 0);

    await players.testModifyXP(alice.address, playerId, Skill.MELEE, getXPFromLevel(5), true);
    const petId = 1;
    const {queuedAction} = await setupBasicPetMeleeCombat(itemNFT, world, petId);
    await players
      .connect(alice)
      .startActionsV2(playerId, [queuedAction, queuedAction], EstforTypes.ActionQueueStatus.NONE);
    await petNFT.connect(alice).safeTransferFrom(alice.address, owner.address, petId, 1, "0x");
    await petNFT.safeTransferFrom(owner.address, alice.address, petId, 1, "0x");
    await itemNFT
      .connect(alice)
      .burn(
        alice.address,
        EstforConstants.COOKED_MINNUS,
        await itemNFT.balanceOf(alice.address, EstforConstants.COOKED_MINNUS)
      );
    // Died so no XP gained
    expect((await players.getActionQueue(playerId)).length).to.eq(2);
    await ethers.provider.send("evm_increaseTime", [queuedAction.timespan]);
    await players.connect(alice).processActions(playerId);

    expect((await players.getActionQueue(playerId)).length).to.eq(1);
    await itemNFT.testMint(alice.address, EstforConstants.COOKED_MINNUS, 20000);
    await ethers.provider.send("evm_increaseTime", [72]);
    await players.connect(alice).processActions(playerId);
    expect(await players.xp(playerId, EstforTypes.Skill.MELEE)).to.eq(getXPFromLevel(5) + 36); // Now gain some XP
  });

  it("Queue a pet with combat and startActionsExtraV2", async function () {
    const {players, playerId, petNFT, itemNFT, world, alice} = await loadFixture(playersFixture);

    const basePet = {...allBasePets[0]};
    basePet.skillFixedMins = [0, 0];
    basePet.skillPercentageMins = [100, 0];
    basePet.skillPercentageMaxs = [101, 0];
    await petNFT.addBasePets([basePet]);
    await petNFT.mint(alice.address, basePet.baseId, 0);

    await players.testModifyXP(alice.address, playerId, Skill.MELEE, getXPFromLevel(5), true);
    const petId = 1;
    const {queuedAction} = await setupBasicPetMeleeCombat(itemNFT, world, petId);

    await players
      .connect(alice)
      .startActionsExtraV2(
        playerId,
        [queuedAction],
        EstforConstants.NONE,
        0,
        0,
        NO_DONATION_AMOUNT,
        EstforTypes.ActionQueueStatus.NONE
      );

    await ethers.provider.send("evm_increaseTime", [72]);
    await players.connect(alice).processActions(playerId);
    expect(await players.xp(playerId, EstforTypes.Skill.MELEE)).to.eq(getXPFromLevel(5) + 36);
  });

  it("Queue a pet with combat, percentage + fixed", async function () {
    const {players, playerId, petNFT, itemNFT, world, alice} = await loadFixture(playersFixture);

    const basePet = {...allBasePets[0]};
    basePet.skillFixedMins = [2, 0];
    basePet.skillFixedMaxs = [2, 0];
    basePet.skillPercentageMins = [60, 0];
    basePet.skillPercentageMaxs = [60, 0];
    await petNFT.addBasePets([basePet]);
    await petNFT.mint(alice.address, basePet.baseId, 0);

    await players.testModifyXP(alice.address, playerId, Skill.MELEE, getXPFromLevel(5), true);
    const petId = 1;
    const {queuedAction} = await setupBasicPetMeleeCombat(itemNFT, world, petId);

    // Should be killing 1 every 72 seconds when you have 6 melee. So a melee of 3 with a 100% multiplier will be enough
    await players.connect(alice).startActionsV2(playerId, [queuedAction], EstforTypes.ActionQueueStatus.NONE);
    await ethers.provider.send("evm_increaseTime", [72]);
    await players.connect(alice).processActions(playerId);
    expect(await players.xp(playerId, EstforTypes.Skill.MELEE)).to.eq(getXPFromLevel(5) + 36);
  });
});
