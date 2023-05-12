import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";
import {ethers} from "hardhat";

describe("EstforLibrary", function () {
  async function deployContracts() {
    const PlayersLibrary = await ethers.getContractFactory("PlayersLibrary");
    const playersLibrary = await PlayersLibrary.deploy();
    return {playersLibrary};
  }

  it("GetLevel", async () => {
    const {playersLibrary} = await loadFixture(deployContracts);
    expect(await playersLibrary.getLevel(0)).to.eq(1);
    expect(await playersLibrary.getLevel(1035475)).to.eq(98); // 1 below 99
    expect(await playersLibrary.getLevel(1035476)).to.eq(99); // exactly 99
    expect(await playersLibrary.getLevel(1035477)).to.eq(99); // 1 above
    expect(await playersLibrary.getLevel(1109796)).to.eq(100); // exactly 100
    expect(await playersLibrary.getLevel(1209796)).to.eq(100); // Above 100
  });

  it("GetBoostedTime", async () => {
    const {playersLibrary} = await loadFixture(deployContracts);

    // action start, elapsed, boost start, boost duration

    // action start == boost start and same duration
    expect(await playersLibrary.getBoostedTime(0, 10, 0, 10)).to.eq(10); // boost start == action start, boost end == action end. (boost duration)
    // Boost misses it completely (starts before action and finishes on action start)
    expect(await playersLibrary.getBoostedTime(10, 10, 0, 10)).to.eq(0); // boost start < action start, boost end == action start. (0)
    // Boost misses it completely (starts before action and finishes before action)
    expect(await playersLibrary.getBoostedTime(10, 10, 0, 10)).to.eq(0); // boost start < action start, boost end < action start. (0)
    // Boost misses it completely (starts at action end)
    expect(await playersLibrary.getBoostedTime(0, 10, 10, 10)).to.eq(0); // boost start == action end. (0)
    // Boost misses it completely (starts after action end)
    expect(await playersLibrary.getBoostedTime(0, 10, 11, 10)).to.eq(0); // boost start > action end. (0)
    // Boost starts before action and finishes during action
    expect(await playersLibrary.getBoostedTime(10, 10, 5, 11)).to.eq(6); // boost start < action start, boost end < action end. (boost end - action start)
    // Boost starts before action and finishes after action
    expect(await playersLibrary.getBoostedTime(10, 10, 5, 20)).to.eq(10); // boost start < action start, boost end > action end. (action duration)
    // Boost starts before action and finishes exactly at action end
    expect(await playersLibrary.getBoostedTime(10, 10, 5, 15)).to.eq(10); // boost start < action start, boost end == action end. (action duration)
    // Boost starts at end of action start
    expect(await playersLibrary.getBoostedTime(0, 10, 10, 10)).to.eq(0); // boost end == action start. (0)
    // Boost starts after action starts and finishes during action
    expect(await playersLibrary.getBoostedTime(0, 10, 5, 1)).to.eq(1); // boost start > action start, boost end < action end. (boost duration)
    // Boost starts after action starts and finishes after action
    expect(await playersLibrary.getBoostedTime(0, 10, 6, 11)).to.eq(4); // boost start > action start, boost end > action end. (action end - boost start)
    // Boost starts after action starts and finishes exactly at action end
    expect(await playersLibrary.getBoostedTime(0, 10, 4, 6)).to.eq(6); // boost start > action start, boost end == action end. (boost duration)
    // Boost starts on action start and finishes during action
    expect(await playersLibrary.getBoostedTime(0, 10, 0, 1)).to.eq(1); // boost start == action start, boost end < action end. (boost duration)
    // Boost starts on action start and finishes after action
    expect(await playersLibrary.getBoostedTime(0, 10, 0, 11)).to.eq(10); // boost start == action start, boost end > action end. (action duration)

    // Collapsed view:
    /* if (boost start > action start && boost end <= action end) // boost duration
    if (boost start == action start && boost end <= action end) // boost duration
    if (boost start <= actionstart && boost end >= action end) // action duration
    if boost start < action start, boost end < action end. // (boost end - action start)
    if (boost start > action start, boost end > action end). //(action end - boost start)
*/
  });
});
