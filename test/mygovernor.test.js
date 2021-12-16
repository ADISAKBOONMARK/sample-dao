const { expect } = require("chai");
const { BigNumber } = require("ethers");
const hre = require("hardhat");

describe("MyGovernor", async function () {
  let accounts;
  let token;
  
  before(async () => {
    const contract = await hre.ethers.getContractFactory("MyGovernor");
    const [accountA, accountB, accountC] = await hre.ethers.getSigners();
    accounts = [accountA, accountB, accountC];
    token = await contract.deploy();
    await token.deployed();
  });
  
  it("Can create a snapshot", async function () {
    await token.createSnapshot();
    const snapshot = await token.snapshotList(0);

    expect(snapshot.voteStart.toNumber() !== 0).to.equal(true);
    expect(snapshot.voteEnd.toNumber() !== 0).to.equal(true);
    expect(snapshot.lastCandidateIndex.toNumber() == 0).to.equal(true);
    expect(snapshot.executed == false).to.equal(true);
    expect(snapshot.canceled == false).to.equal(true);
  });

  it("Can add a candidate", async function () {
    await token.addCandidate(0);
    await token.addCandidate(0);
    const snapshot = await token.snapshotList(0);

    expect(snapshot.voteStart.toNumber() !== 0).to.equal(true);
    expect(snapshot.voteEnd.toNumber() !== 0).to.equal(true);
    expect(snapshot.lastCandidateIndex.toNumber() == 2).to.equal(true);
    expect(snapshot.executed == false).to.equal(true);
    expect(snapshot.canceled == false).to.equal(true);
  });

  it("Can vote", async function () {
    await token.vote(0, 0);
    await token.myVoted(0);
    token = new ethers.Contract(
      token.address,
      token.interface,
      accounts[1]
    );
    await token.myVoted(0);
    const votedReport = await token.votedReport(0);
    console.log(votedReport);
    // expect(snapshot.voteStart.toNumber() !== 0).to.equal(true);
    // expect(snapshot.voteEnd.toNumber() !== 0).to.equal(true);
    // expect(snapshot.lastCandidateIndex.toNumber() == 2).to.equal(true);
    // expect(snapshot.executed == false).to.equal(true);
    // expect(snapshot.canceled == false).to.equal(true);
  });
});
