import {ethers} from "hardhat";
import {PLAYER_NFT_ADDRESS} from "./contractAddresses";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Set upgrade player costs on PlayerNFT using account: ${owner.address}`);

  const network = await ethers.provider.getNetwork();
  console.log(`ChainId: ${network.chainId}`);

  const playerNFT = await ethers.getContractAt("PlayerNFT", PLAYER_NFT_ADDRESS);
  const tx = await playerNFT.setUpgradeCost(ethers.utils.parseEther("1"));
  await tx.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
