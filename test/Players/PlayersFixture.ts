import {InstantVRFActionType, Skill} from "@paintswap/estfor-definitions/types";
import {ethers, upgrades} from "hardhat";
import {AvatarInfo, createPlayer, setDailyAndWeeklyRewards} from "../../scripts/utils";
import {
  AdminAccess,
  Bank,
  BankFactory,
  BankRegistry,
  ClanBattleLibrary,
  Clans,
  CombatantsHelper,
  EstforLibrary,
  EggInstantVRFActionStrategy,
  GenericInstantVRFActionStrategy,
  InstantActions,
  InstantVRFActions,
  ItemNFT,
  LockedBankVaults,
  MockBrushToken,
  MockOracleClient,
  MockRouter,
  PassiveActions,
  PetNFT,
  PlayerNFT,
  Players,
  Promotions,
  PromotionsLibrary,
  Quests,
  RoyaltyReceiver,
  Shop,
  Territories,
  VRFRequestInfo,
  WishingWell,
  World,
  WorldLibrary,
} from "../../typechain-types";
import {MAX_TIME} from "../utils";
import {allTerritories, allBattleSkills} from "../../scripts/data/territories";

export const playersFixture = async function () {
  const [owner, alice, bob, charlie, dev, erin, frank] = await ethers.getSigners();

  const brush = (await ethers.deployContract("MockBrushToken")) as MockBrushToken;
  const mockOracleClient = (await ethers.deployContract("MockOracleClient")) as MockOracleClient;

  // Add some dummy blocks so that world can access previous blocks for random numbers
  for (let i = 0; i < 5; ++i) {
    await owner.sendTransaction({
      to: owner.address,
      value: 1,
      maxFeePerGas: 1,
    });
  }

  // Create the world
  const worldLibrary = (await ethers.deployContract("WorldLibrary")) as WorldLibrary;
  const subscriptionId = 2;
  const World = await ethers.getContractFactory("World", {libraries: {WorldLibrary: worldLibrary.address}});
  const world = (await upgrades.deployProxy(World, [mockOracleClient.address, subscriptionId], {
    kind: "uups",
    unsafeAllow: ["delegatecall", "external-library-linking"],
  })) as World;

  await setDailyAndWeeklyRewards(world);

  const Shop = await ethers.getContractFactory("Shop");
  const shop = (await upgrades.deployProxy(Shop, [brush.address, dev.address], {
    kind: "uups",
  })) as Shop;

  const router = (await ethers.deployContract("MockRouter")) as MockRouter;
  const RoyaltyReceiver = await ethers.getContractFactory("RoyaltyReceiver");
  const royaltyReceiver = (await upgrades.deployProxy(
    RoyaltyReceiver,
    [router.address, shop.address, dev.address, brush.address, alice.address],
    {
      kind: "uups",
    }
  )) as RoyaltyReceiver;

  const admins = [owner.address, alice.address];
  const AdminAccess = await ethers.getContractFactory("AdminAccess");
  const adminAccess = (await upgrades.deployProxy(AdminAccess, [admins, admins], {
    kind: "uups",
  })) as AdminAccess;

  const isBeta = true;

  const ItemNFTLibrary = await ethers.getContractFactory("ItemNFTLibrary");
  const itemNFTLibrary = await ItemNFTLibrary.deploy();
  const ItemNFT = await ethers.getContractFactory("ItemNFT", {libraries: {ItemNFTLibrary: itemNFTLibrary.address}});
  const itemsUri = "ipfs://";
  const itemNFT = (await upgrades.deployProxy(
    ItemNFT,
    [world.address, shop.address, royaltyReceiver.address, adminAccess.address, itemsUri, isBeta],
    {
      kind: "uups",
      unsafeAllow: ["external-library-linking"],
    }
  )) as ItemNFT;

  await shop.setItemNFT(itemNFT.address);
  // Create NFT contract which contains all the players
  const estforLibrary = (await ethers.deployContract("EstforLibrary")) as EstforLibrary;
  const PlayerNFT = await ethers.getContractFactory("PlayerNFT", {
    libraries: {EstforLibrary: estforLibrary.address},
  });
  const editNameBrushPrice = ethers.utils.parseEther("1");
  const upgradePlayerBrushPrice = ethers.utils.parseEther("1");
  const imageBaseUri = "ipfs://";
  const playerNFT = (await upgrades.deployProxy(
    PlayerNFT,
    [
      brush.address,
      shop.address,
      dev.address,
      royaltyReceiver.address,
      editNameBrushPrice,
      upgradePlayerBrushPrice,
      imageBaseUri,
      isBeta,
    ],
    {
      kind: "uups",
      unsafeAllow: ["external-library-linking"],
    }
  )) as PlayerNFT;

  const promotionsLibrary = (await ethers.deployContract("PromotionsLibrary")) as PromotionsLibrary;
  const Promotions = await ethers.getContractFactory("Promotions", {
    libraries: {PromotionsLibrary: promotionsLibrary.address},
  });
  const promotions = (await upgrades.deployProxy(
    Promotions,
    [adminAccess.address, itemNFT.address, playerNFT.address, isBeta],
    {
      kind: "uups",
      unsafeAllow: ["external-library-linking"],
    }
  )) as Promotions;

  const buyPath: [string, string] = [alice.address, brush.address];
  const Quests = await ethers.getContractFactory("Quests");
  const quests = (await upgrades.deployProxy(Quests, [world.address, router.address, buyPath], {
    kind: "uups",
  })) as Quests;

  const paintSwapMarketplaceWhitelist = await ethers.deployContract("MockPaintSwapMarketplaceWhitelist");

  const Clans = await ethers.getContractFactory("Clans", {
    libraries: {EstforLibrary: estforLibrary.address},
  });
  const clans = (await upgrades.deployProxy(
    Clans,
    [
      brush.address,
      playerNFT.address,
      shop.address,
      dev.address,
      editNameBrushPrice,
      paintSwapMarketplaceWhitelist.address,
    ],
    {
      kind: "uups",
      unsafeAllow: ["external-library-linking"],
    }
  )) as Clans;

  const WishingWell = await ethers.getContractFactory("WishingWell");
  const wishingWell = (await upgrades.deployProxy(
    WishingWell,
    [
      brush.address,
      playerNFT.address,
      shop.address,
      world.address,
      clans.address,
      ethers.utils.parseEther("5"),
      ethers.utils.parseEther("1000"),
      ethers.utils.parseEther("250"),
      isBeta,
    ],
    {
      kind: "uups",
    }
  )) as WishingWell;

  const petNFTLibrary = await ethers.deployContract("PetNFTLibrary");
  const PetNFT = await ethers.getContractFactory("PetNFT", {
    libraries: {EstforLibrary: estforLibrary.address, PetNFTLibrary: petNFTLibrary.address},
  });
  const petNFT = (await upgrades.deployProxy(
    PetNFT,
    [
      brush.address,
      royaltyReceiver.address,
      imageBaseUri,
      dev.address,
      editNameBrushPrice,
      adminAccess.address,
      isBeta,
    ],
    {
      kind: "uups",
      unsafeAllow: ["delegatecall", "external-library-linking"],
    }
  )) as PetNFT;
  await petNFT.deployed();

  // This contains all the player data
  const playersLibrary = await ethers.deployContract("PlayersLibrary");
  const playersImplQueueActions = await ethers.deployContract("PlayersImplQueueActions", {
    libraries: {PlayersLibrary: playersLibrary.address},
  });
  const playersImplProcessActions = await ethers.deployContract("PlayersImplProcessActions", {
    libraries: {PlayersLibrary: playersLibrary.address},
  });
  const playersImplRewards = await ethers.deployContract("PlayersImplRewards", {
    libraries: {PlayersLibrary: playersLibrary.address},
  });
  const playersImplMisc = await ethers.deployContract("PlayersImplMisc", {
    libraries: {PlayersLibrary: playersLibrary.address},
  });
  const playersImplMisc1 = await ethers.deployContract("PlayersImplMisc1", {
    libraries: {PlayersLibrary: playersLibrary.address},
  });

  const Players = await ethers.getContractFactory("Players");
  const players = (await upgrades.deployProxy(
    Players,
    [
      itemNFT.address,
      playerNFT.address,
      petNFT.address,
      world.address,
      adminAccess.address,
      quests.address,
      clans.address,
      wishingWell.address,
      playersImplQueueActions.address,
      playersImplProcessActions.address,
      playersImplRewards.address,
      playersImplMisc.address,
      playersImplMisc1.address,
      isBeta,
    ],
    {
      kind: "uups",
      unsafeAllow: ["delegatecall", "external-library-linking"],
    }
  )) as Players;

  const Bank = await ethers.getContractFactory("Bank");
  const bank = (await upgrades.deployBeacon(Bank)) as Bank;

  const BankRegistry = await ethers.getContractFactory("BankRegistry");
  const bankRegistry = (await upgrades.deployProxy(
    BankRegistry,
    [itemNFT.address, playerNFT.address, clans.address, players.address],
    {
      kind: "uups",
    }
  )) as BankRegistry;

  const BankFactory = await ethers.getContractFactory("BankFactory");
  const bankFactory = (await upgrades.deployProxy(BankFactory, [bankRegistry.address, bank.address], {
    kind: "uups",
  })) as BankFactory;

  const InstantActions = await ethers.getContractFactory("InstantActions");
  const instantActions = (await upgrades.deployProxy(InstantActions, [players.address, itemNFT.address], {
    kind: "uups",
  })) as InstantActions;

  const mockSWVRFOracleClient = (await ethers.deployContract("MockSWVRFOracleClient")) as MockOracleClient;
  const oracleAddress = dev.address;

  const VRFRequestInfo = await ethers.getContractFactory("VRFRequestInfo");
  const vrfRequestInfo = (await upgrades.deployProxy(VRFRequestInfo, [], {
    kind: "uups",
  })) as VRFRequestInfo;

  const InstantVRFActions = await ethers.getContractFactory("InstantVRFActions");
  const instantVRFActions = (await upgrades.deployProxy(
    InstantVRFActions,
    [
      players.address,
      itemNFT.address,
      petNFT.address,
      oracleAddress,
      mockSWVRFOracleClient.address,
      vrfRequestInfo.address,
    ],
    {
      kind: "uups",
    }
  )) as InstantVRFActions;

  const GenericInstantVRFActionStrategy = await ethers.getContractFactory("GenericInstantVRFActionStrategy");
  const genericInstantVRFActionStrategy = (await upgrades.deployProxy(
    GenericInstantVRFActionStrategy,
    [instantVRFActions.address],
    {
      kind: "uups",
    }
  )) as GenericInstantVRFActionStrategy;

  const EggInstantVRFActionStrategy = await ethers.getContractFactory("EggInstantVRFActionStrategy");
  const eggInstantVRFActionStrategy = (await upgrades.deployProxy(
    EggInstantVRFActionStrategy,
    [instantVRFActions.address],
    {
      kind: "uups",
    }
  )) as EggInstantVRFActionStrategy;

  const clanBattleLibrary = (await ethers.deployContract("ClanBattleLibrary")) as ClanBattleLibrary;

  const MockWrappedFantom = await ethers.getContractFactory("MockWrappedFantom");
  const wftm = await MockWrappedFantom.deploy();

  const artGalleryLockPeriod = 3600;
  const artGallery = await ethers.deployContract("TestPaintSwapArtGallery", [brush.address, artGalleryLockPeriod]);
  const brushPerSecond = ethers.utils.parseEther("2");
  const {timestamp: NOW} = await ethers.provider.getBlock("latest");

  const decorator = await ethers.deployContract("TestPaintSwapDecorator", [
    brush.address,
    artGallery.address,
    router.address,
    wftm.address,
    brushPerSecond,
    NOW,
  ]);

  await artGallery.transferOwnership(decorator.address);

  const LockedBankVaults = await ethers.getContractFactory("LockedBankVaults");
  const lockedBankVaults = (await upgrades.deployProxy(
    LockedBankVaults,
    [
      players.address,
      clans.address,
      brush.address,
      bankFactory.address,
      itemNFT.address,
      shop.address,
      dev.address,
      oracleAddress,
      mockSWVRFOracleClient.address,
      allBattleSkills,
      adminAccess.address,
      isBeta,
    ],
    {
      kind: "uups",
      unsafeAllow: ["external-library-linking"],
    }
  )) as LockedBankVaults;

  const Territories = await ethers.getContractFactory("Territories");
  const territories = (await upgrades.deployProxy(
    Territories,
    [
      allTerritories,
      players.address,
      clans.address,
      brush.address,
      lockedBankVaults.address,
      itemNFT.address,
      oracleAddress,
      mockSWVRFOracleClient.address,
      allBattleSkills,
      adminAccess.address,
      isBeta,
    ],
    {
      kind: "uups",
      unsafeAllow: ["external-library-linking"],
    }
  )) as Territories;

  const CombatantsHelper = await ethers.getContractFactory("CombatantsHelper", {
    libraries: {EstforLibrary: estforLibrary.address},
  });
  const combatantsHelper = (await upgrades.deployProxy(
    CombatantsHelper,
    [players.address, clans.address, territories.address, lockedBankVaults.address, adminAccess.address, isBeta],
    {
      kind: "uups",
      unsafeAllow: ["external-library-linking"],
    }
  )) as CombatantsHelper;

  const PassiveActions = await ethers.getContractFactory("PassiveActions", {
    libraries: {WorldLibrary: worldLibrary.address},
  });
  const passiveActions = (await upgrades.deployProxy(
    PassiveActions,
    [players.address, itemNFT.address, world.address],
    {
      kind: "uups",
      unsafeAllow: ["delegatecall", "external-library-linking"],
    }
  )) as PassiveActions;

  await world.setQuests(quests.address);
  await world.setWishingWell(wishingWell.address);

  await itemNFT.setPlayers(players.address);
  await playerNFT.setPlayers(players.address);
  await petNFT.setPlayers(players.address);
  await quests.setPlayers(players.address);
  await clans.setPlayers(players.address);
  await wishingWell.setPlayers(players.address);

  await itemNFT.setBankFactory(bankFactory.address);
  await clans.setBankFactory(bankFactory.address);

  await itemNFT.setPromotions(promotions.address);
  await itemNFT.setPassiveActions(passiveActions.address);
  await itemNFT.setInstantActions(instantActions.address);

  await itemNFT.setInstantVRFActions(instantVRFActions.address);
  await petNFT.setInstantVRFActions(instantVRFActions.address);

  await petNFT.setBrushDistributionPercentages(25, 0, 25, 50);

  await bankRegistry.setLockedBankVaults(lockedBankVaults.address);

  await clans.setTerritoriesAndLockedBankVaults(territories.address, lockedBankVaults.address);
  await itemNFT.setTerritoriesAndLockedBankVaults(territories.address, lockedBankVaults.address);
  await lockedBankVaults.setTerritories(territories.address);
  await royaltyReceiver.setTerritories(territories.address);
  await petNFT.setTerritories(territories.address);
  await territories.setCombatantsHelper(combatantsHelper.address);
  await lockedBankVaults.setCombatantsHelper(combatantsHelper.address);

  const avatarId = 1;
  const avatarInfo: AvatarInfo = {
    name: "Name goes here",
    description: "Hi I'm a description",
    imageURI: "1234.png",
    startSkills: [Skill.MAGIC, Skill.NONE],
  };
  await playerNFT.setAvatars([avatarId], [avatarInfo]);

  const origName = "0xSamWitch";
  const makeActive = true;
  const playerId = await createPlayer(playerNFT, avatarId, alice, origName, makeActive);
  const maxTime = MAX_TIME;

  return {
    playerId,
    players,
    playerNFT,
    itemNFT,
    brush,
    maxTime,
    owner,
    world,
    worldLibrary,
    alice,
    bob,
    charlie,
    dev,
    erin,
    frank,
    origName,
    editNameBrushPrice,
    upgradePlayerBrushPrice,
    mockOracleClient,
    avatarInfo,
    adminAccess,
    shop,
    royaltyReceiver,
    playersImplProcessActions,
    playersImplQueueActions,
    playersImplRewards,
    playersImplMisc,
    playersImplMisc1,
    Players,
    avatarId,
    wishingWell,
    promotionsLibrary,
    promotions,
    quests,
    clans,
    bank,
    Bank,
    bankRegistry,
    bankFactory,
    estforLibrary,
    paintSwapMarketplaceWhitelist,
    passiveActions,
    playersLibrary,
    instantActions,
    clanBattleLibrary,
    artGallery,
    artGalleryLockPeriod,
    decorator,
    brushPerSecond,
    mockSWVRFOracleClient,
    lockedBankVaults,
    territories,
    combatantsHelper,
    vrfRequestInfo,
    instantVRFActions,
    genericInstantVRFActionStrategy,
    eggInstantVRFActionStrategy,
    oracleAddress,
    petNFT,
    PetNFT,
  };
};
