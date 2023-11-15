import {ethers} from "hardhat";
import {CLANS_ADDRESS, ESTFOR_LIBRARY_ADDRESS, PLAYER_NFT_ADDRESS} from "./contractAddresses";
import {allClanTiers, allClanTiersBeta} from "./data/clans";
import {isBeta} from "./utils";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Edit clan tiers using account: ${owner.address}`);

  const network = await ethers.provider.getNetwork();
  console.log(`ChainId: ${network.chainId}`);

  const clanTiers = isBeta ? allClanTiersBeta : allClanTiers;

  const Clans = await ethers.getContractFactory("Clans", {libraries: {EstforLibrary: ESTFOR_LIBRARY_ADDRESS}});
  const clans = Clans.attach(CLANS_ADDRESS);

  const tx = await clans.editTiers(clanTiers);
  await tx.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
