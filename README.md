# Estfor Kingdom contracts

![image](https://user-images.githubusercontent.com/84033732/223739503-c53a888a-443f-4fb5-98a3-d40f94956799.png)

[![Continuous integration](https://github.com/PaintSwap/estfor-contracts/actions/workflows/ci.yml/badge.svg)](https://github.com/PaintSwap/estfor-contracts/actions/workflows/ci.yml)

All the smart contract code for the Estfor Kingdom RPG game on the Fantom Blockchain.

Make sure `yarn` is installed (or replace with equivalent npm instructions)

These contracts use hardhat and require solidity 0.8.20 at minimum.

Install dependencies:

```shell
yarn install
```

To compile:

```shell
yarn compile
```

To run the tests:

```shell
yarn test
```

To deploy the contracts:

```shell
yarn deploy
```

To verify the contracts on ftmscan:

```shell
yarn verifyContracts
```

To check storage slot packing of the test file:

```shell
yarn umlStorage
```

### Fantom mainnet deployed contract addresses:

WorldLibrary [0xd582da91d0449f93ba7ba477a55dd82689301f1f](https://ftmscan.com/address/0xd582da91d0449f93ba7ba477a55dd82689301f1f)  
World [0x28866bf156152966b5872bee39bc05b5b5eedb02](https://ftmscan.com/address/0x28866bf156152966b5872bee39bc05b5b5eedb02)  
Shop [0x7fb574e4fbe876f751fec90e59686c2776df19f9](https://ftmscan.com/address/0x7fb574e4fbe876f751fec90e59686c2776df19f9)  
RoyaltyReceiver [0xc3d53b81042454aa5fcf5c4e95de3e796dddb28b](https://ftmscan.com/address/0xc3d53b81042454aa5fcf5c4e95de3e796dddb28b)  
AdminAccess [0xe63b7195b301b9313c9e337df4aceac436c3751e](https://ftmscan.com/address/0xe63b7195b301b9313c9e337df4aceac436c3751e)  
ItemNFTLibrary [0x3054399b4b7a362799774e6c5a30ef57de1df5de](https://ftmscan.com/address/0x3054399b4b7a362799774e6c5a30ef57de1df5de)  
ItemNFT [0x4b9c90ebb1fa98d9724db46c4689994b46706f5a](https://ftmscan.com/address/0x4b9c90ebb1fa98d9724db46c4689994b46706f5a)  
EstforLibrary [0x8213fCAD73187A1A4d4cf9a44BF87d919Ca32970](https://ftmscan.com/address/0x8213fCAD73187A1A4d4cf9a44BF87d919Ca32970)  
PlayerNFT [0xb809ed839c691d465e2ec45e1bcb5e5aded50fb9](https://ftmscan.com/address/0xb809ed839c691d465e2ec45e1bcb5e5aded50fb9)  
PromotionsLibrary [0x5494e6a699e8e59e9a6ec3031ab96e35f2476c95](https://ftmscan.com/address/0x5494e6a699e8e59e9a6ec3031ab96e35f2476c95)  
Promotions [0x7d1c598266Dd6Bb0Ed7a76161c11e5073D8A71A4](https://ftmscan.com/address/0x7d1c598266Dd6Bb0Ed7a76161c11e5073D8A71A4)  
Quests [0x17c59f0d2d4f80FD0F906Df53a28272736c7b455](https://ftmscan.com/address/0x17c59f0d2d4f80FD0F906Df53a28272736c7b455)  
Clans [0x334caa8907bdf49470f7b085380c25431ef96f6d](https://ftmscan.com/address/0x334caa8907bdf49470f7b085380c25431ef96f6d)  
WishingWell [0x0a8d80ce4855666b7d7121d75f2a49aac434a918](https://ftmscan.com/address/0x0a8d80ce4855666b7d7121d75f2a49aac434a918)  
Bank Beacon [0xe183a43881eac74808c55bdb2a073929602af4db](https://ftmscan.com/address/0xe183a43881eac74808c55bdb2a073929602af4db)

PlayersLibrary [0x316342122a9ae36de41b231260579b92f4c8be7f](https://ftmscan.com/address/0x316342122a9ae36de41b231260579b92f4c8be7f)  
PlayersImplQueueActions [0x9e2669c43693a0b3c37daa9fbd668d76cfad8cb5](https://ftmscan.com/address/0x9e2669c43693a0b3c37daa9fbd668d76cfad8cb5)  
PlayersImplProcessActions [0x697a41effb1dca9187bca62dc2f5935a2b6749a3](https://ftmscan.com/address/0x697a41effb1dca9187bca62dc2f5935a2b6749a3)  
PlayersImplRewards [0x6b9018c89ac74371cdba443192cd8470cb5721aa](https://ftmscan.com/address/0x6b9018c89ac74371cdba443192cd8470cb5721aa)  
PlayersImplMisc [0x07c072ed042a688e1db6ab3487c51dbd56318136](https://ftmscan.com/address/0x07c072ed042a688e1db6ab3487c51dbd56318136)  
PlayersImplMisc1 [0xf0ec1644ea866a20ceae87cd669325f32f9eb6ab](https://ftmscan.com/address/0xf0ec1644ea866a20ceae87cd669325f32f9eb6ab)  
Players [0x058ec56aba13f7fee3ae9c9b91b3bb03bc336143](https://ftmscan.com/address/0x058ec56aba13f7fee3ae9c9b91b3bb03bc336143)

BankRegistry [0x55a1b0251e1375bd41dd9778c379322e3863a54e](https://ftmscan.com/address/0x55a1b0251e1375bd41dd9778c379322e3863a54e)  
BankFactory [0x4af59427b2aeb66e6f7dca98c366ec66cca4e8d4](https://ftmscan.com/address/0x4af59427b2aeb66e6f7dca98c366ec66cca4e8d4)

InstantActions [0x7e89fe755b546b10ea8372b056ea0d7b26cf36fe](https://ftmscan.com/address/0x7e89fe755b546b10ea8372b056ea0d7b26cf36fe)  
InstantVRFActions [](https://ftmscan.com/address/)

LockedBankVaults [0x65e944795d00cc287bdace77d57571fc4deff3e0](https://ftmscan.com/address/0x65e944795d00cc287bdace77d57571fc4deff3e0)  
Territories [0x2cfd3b9f8b595200d6b4b7f667b2a1bcc6d0c170](https://ftmscan.com/address/0x2cfd3b9f8b595200d6b4b7f667b2a1bcc6d0c170)  
CombatantsHelper [0x8fedf83c55012acff7115b8fa164095721953c39](https://ftmscan.com/address/0x8fedf83c55012acff7115b8fa164095721953c39)  
DecoratorProvider [0xba2f8cff9ea18f3687eb685f0c1bcd509b539963](https://ftmscan.com/address/0xba2f8cff9ea18f3687eb685f0c1bcd509b539963)

Oracle [0x28ade840602d0363a2ab675479f1b590b23b0490](https://ftmscan.com/address/0x28ade840602d0363a2ab675479f1b590b23b0490)  
VRF [0xeF5AC0489fc8ABC1085E8D1f5BEE85e74E6D2cC2](https://ftmscan.com/address/0xeF5AC0489fc8ABC1085E8D1f5BEE85e74E6D2cC2)  
Bazaar [0x6996c519dA4ac7815bEFbd836cf0b78Aa62fdBcE](https://ftmscan.com/address/0x6996c519dA4ac7815bEFbd836cf0b78Aa62fdBcE)

### Fantom mainnet beta deployed contract addresses:

WorldLibrary [0x10f6512db26681700a027b5bd8e3f852351000c4](https://ftmscan.com/address/0x10f6512db26681700a027b5bd8e3f852351000c4)  
World [0xe2f0b5cb118da85be68de1801d40726ce48009aa](https://ftmscan.com/address/0xe2f0b5cb118da85be68de1801d40726ce48009aa)  
Shop [0xc5e24fbaba1a945226ad2f882e14fc7b44dc1f30](https://ftmscan.com/address/0xc5e24fbaba1a945226ad2f882e14fc7b44dc1f30)  
RoyaltyReceiver [0xc5de7625e1b5cb91d92bc65fd4d787f01c43e38e](https://ftmscan.com/address/0xc5de7625e1b5cb91d92bc65fd4d787f01c43e38e)  
AdminAccess [0xa298f1636dacab0db352fec84d2079814e0ce778](https://ftmscan.com/address/0xa298f1636dacab0db352fec84d2079814e0ce778)  
ItemNFTLibrary [0xd24b6994c179817391466372fb2a26440fcc0dd7](https://ftmscan.com/address/0xd24b6994c179817391466372fb2a26440fcc0dd7)  
ItemNFT [0x1dae89b469d15b0ded980007dfdc8e68c363203d](https://ftmscan.com/address/0x1dae89b469d15b0ded980007dfdc8e68c363203d)  
EstforLibrary [0x26f6ad6b30bd8e4203d9be780ce05b44275db929](https://ftmscan.com/address/0x26f6ad6b30bd8e4203d9be780ce05b44275db929)  
PlayerNFT [0xde70e49756322afdf7714d3aca963abcb4547b8d](https://ftmscan.com/address/0xde70e49756322afdf7714d3aca963abcb4547b8d)  
PromotionsLibrary [0x684c6e254df63b9d5a28b29b7e4d0850d158f9f9](https://ftmscan.com/address/0x684c6e254df63b9d5a28b29b7e4d0850d158f9f9)  
Promotions [0xf28cab48e29be56fcc68574b5c147b780c35647c](https://ftmscan.com/address/0xf28cab48e29be56fcc68574b5c147b780c35647c)  
Quests [0x96948a6df3a64cc2eb0a1825fccd26f0c93bfce9](https://ftmscan.com/address/0x96948a6df3a64cc2eb0a1825fccd26f0c93bfce9)  
Clans [0xd35410f526db135f09bb8e2bb066c8a63135d812](https://ftmscan.com/address/0xd35410f526db135f09bb8e2bb066c8a63135d812)  
WishingWell [0xdd1131f57e5e416622fa2b61d4108822e8cc38dc](https://ftmscan.com/address/0xdd1131f57e5e416622fa2b61d4108822e8cc38dc)  
Bank Beacon [0x73d1b1420deaeb6474b8aafb1d8229d392d1a04e](https://ftmscan.com/address/0x73d1b1420deaeb6474b8aafb1d8229d392d1a04e)

PlayersLibrary [0x4f672d0ada398e4cb8c87d01362616223254d3eb](https://ftmscan.com/address/0x4f672d0ada398e4cb8c87d01362616223254d3eb)  
PlayersImplQueueActions [0xff96dd0a32e12004c5f23dd00fd9c842315fe493](https://ftmscan.com/address/0xff96dd0a32e12004c5f23dd00fd9c842315fe493)  
PlayersImplProcessActions [0x521fd120a5bd5b80d6764c9da10b0cf6a3d87019](https://ftmscan.com/address/0x521fd120a5bd5b80d6764c9da10b0cf6a3d87019)  
PlayersImplRewards [0x0338981446c868028f19d1f776a1e0e0afdd8867](https://ftmscan.com/address/0x0338981446c868028f19d1f776a1e0e0afdd8867)  
PlayersImplMisc [0x29fc437bfba1238be711b48a407871184365cf8a](https://ftmscan.com/address/0x29fc437bfba1238be711b48a407871184365cf8a)  
PlayersImplMisc1 [0x4a84c8ff6039823cca4a226bbc531e348f7bdfb2](https://ftmscan.com/address/0x4a84c8ff6039823cca4a226bbc531e348f7bdfb2)  
Players [0x0aac9c0966ad5ea59cd0a47a0d415a68126ab7be](https://ftmscan.com/address/0x0aac9c0966ad5ea59cd0a47a0d415a68126ab7be)

BankRegistry [0xd5da02cee3d9ef0d63d1b79c659df16770c3c4e0](https://ftmscan.com/address/0xd5da02cee3d9ef0d63d1b79c659df16770c3c4e0)  
BankProxy [0xe1998e9bad94716ecf81f3a3bead5fed3fb023cb](https://ftmscan.com/address/0xe1998e9bad94716ecf81f3a3bead5fed3fb023cb)  
BankFactory [0x7b8197e7d7352e8910a7af79a9184f50290403da](https://ftmscan.com/address/0x7b8197e7d7352e8910a7af79a9184f50290403da)

InstantActions [0xe9a1a09be4a64f806a26b33fbdf07a6f3e61af76](https://ftmscan.com/address/0xe9a1a09be4a64f806a26b33fbdf07a6f3e61af76)  
InstantVRFActions [0x528b2f0cc280f6699d0831bcaee2f6ae611eb794](https://ftmscan.com/address/0x528b2f0cc280f6699d0831bcaee2f6ae611eb794)

LockedBankVaults [0x40567ad9cd25c56422807ed67f0e66f1825bdb91](https://ftmscan.com/address/0x40567ad9cd25c56422807ed67f0e66f1825bdb91)  
Territories [0xf31517db9f0987002f3a0fb4f787dfb9e892f184](https://ftmscan.com/address/0xf31517db9f0987002f3a0fb4f787dfb9e892f184)  
CombatantsHelper [0xe8231ac805a88b3c72e9602c2ae14a5d3421bc7c](https://ftmscan.com/address/0xe8231ac805a88b3c72e9602c2ae14a5d3421bc7c)  
DecoratorProvider [0xea8c4d188eb8d9704bc36931d89ba4f8e935cee2](https://ftmscan.com/address/0xea8c4d188eb8d9704bc36931d89ba4f8e935cee2)

RequestVRFInfo [0x2c44d5e0cd0039c83c9c4c24ac5631cfb0219b37](https://ftmscan.com/address/0x2c44d5e0cd0039c83c9c4c24ac5631cfb0219b37)  
Oracle [0x6f7911cbbd4b5a1d2bdaa817a76056e510d728e7](https://ftmscan.com/address/0x6f7911cbbd4b5a1d2bdaa817a76056e510d728e7)  
VRF [0x58E9fd2Fae18c861B9F564200510A88106C05756](https://ftmscan.com/address/0x58E9fd2Fae18c861B9F564200510A88106C05756)  
Bazaar [0x082480aAAF1ac5bb0Db2c241eF8b4230Da85E191](https://ftmscan.com/address/0x082480aAAF1ac5bb0Db2c241eF8b4230Da85E191)

### Other addresses:

Brush [0x85dec8c4b2680793661bca91a8f129607571863d](https://ftmscan.com/address/0x85dec8c4b2680793661bca91a8f129607571863d)
