import {ethers, upgrades} from "hardhat";
import {
  BRUSH_ADDRESS,
  COMBATANTS_HELPER_ADDRESS,
  DECORATOR_ADDRESS,
  DECORATOR_PROVIDER_ADDRESS,
  LOCKED_BANK_VAULT_ADDRESS,
  TERRITORIES_ADDRESS,
} from "./contractAddresses";
import {
  CombatantsHelper,
  DecoratorProvider,
  LockedBankVault,
  MockBrushToken,
  Territories,
  TestPaintSwapDecorator,
} from "../typechain-types";

async function main() {
  const [owner, alice] = await ethers.getSigners();
  console.log(`Deploying clan wars test data: ${owner.address} on chain id ${await owner.getChainId()}`);
  // const owner = await ethers.getImpersonatedSigner("0x316342122A9ae36de41B231260579b92F4C8Be7f");
  // const alice = await ethers.getImpersonatedSigner("0xBa00694692267ed0B5154d48Fcb4D435D0B24d3F");

  const brush = (await ethers.getContractAt("MockBrushToken", BRUSH_ADDRESS)) as MockBrushToken;

  const territories = (await ethers.getContractAt("Territories", TERRITORIES_ADDRESS)) as Territories;
  const lockedBankVault = (await ethers.getContractAt("LockedBankVault", LOCKED_BANK_VAULT_ADDRESS)) as LockedBankVault;
  const decorator = (await ethers.getContractAt("TestPaintSwapDecorator", DECORATOR_ADDRESS)) as TestPaintSwapDecorator;
  const combatantsHelper = (await ethers.getContractAt(
    "CombatantsHelper",
    COMBATANTS_HELPER_ADDRESS
  )) as CombatantsHelper;

  const decoratorProvider = (await ethers.getContractAt(
    "DecoratorProvider",
    DECORATOR_PROVIDER_ADDRESS
  )) as DecoratorProvider;

  const pid = 22;
  const playerId = 1;

  const pendingBrush = await decorator.pendingBrush(pid, decoratorProvider.address);
  console.log("Pending", pendingBrush);

  let tx = await brush.connect(owner).transfer(decoratorProvider.address, pendingBrush.add(pendingBrush.div(2)));
  await tx.wait();
  console.log("Transferred brush");

  tx = await decoratorProvider.connect(owner).harvest(playerId);
  await tx.wait();
  console.log("Harvest");

  // Lock some brush in a vault
  tx = await lockedBankVault.connect(owner).setTerritories(owner.address);
  await tx.wait();
  console.log("set territories");
  tx = await brush.connect(owner).approve(lockedBankVault.address, ethers.utils.parseEther("100"));
  await tx.wait();
  console.log("Approve");
  tx = await lockedBankVault.connect(owner).lockFunds(1, owner.address, 1, ethers.utils.parseEther("100"));
  await tx.wait();
  console.log("LockFunds");
  tx = await lockedBankVault.connect(owner).setTerritories(territories.address);
  await tx.wait();
  console.log("SetTerritories");

  let territoryAttackCost = await territories.attackCost();
  // Claim the territory
  tx = await combatantsHelper.connect(owner).assignCombatants(1, true, [1], false, [], 1);
  await tx.wait();
  console.log("assign combatants for territories");
  tx = await territories.connect(owner).attackTerritory(1, 1, 1, {value: territoryAttackCost}); // Unclaimed
  await tx.wait();
  console.log("attack territory");

  tx = await territories.connect(owner).harvest(1, 1);
  await tx.wait();
  console.log("Harvest unclaimed emissions from the territory");

  const aliceClanId = 26;

  tx = await combatantsHelper.connect(alice).assignCombatants(aliceClanId, true, [532], true, [2], 2);
  await tx.wait();
  console.log("assign combatants for territories & locked bank vaults");

  tx = await lockedBankVault.connect(alice).clearCooldowns(aliceClanId, [1]);
  await tx.wait();
  console.log("clear cooldowns");
  const vaultAttackCost = await territories.attackCost();
  tx = await lockedBankVault.connect(alice).attackVaults(aliceClanId, 1, 2, {value: vaultAttackCost});
  await tx.wait();
  console.log("attack vaults");

  await tx.wait();
  console.log("assign combatants for territories");

  territoryAttackCost = await territories.attackCost();
  tx = await territories.connect(alice).attackTerritory(aliceClanId, 1, 2, {value: territoryAttackCost});
  await tx.wait();
  console.log("attack territory");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
