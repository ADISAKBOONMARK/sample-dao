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
    await token.createSnapshot();

    let snapshot = await token.snapshotList(0);

    expect(snapshot.voteStart.toNumber() !== 0).to.equal(true);
    expect(snapshot.voteEnd.toNumber() !== 0).to.equal(true);
    expect(snapshot.lastCandidateIndex.toNumber() == 0).to.equal(true);
    expect(snapshot.executed == false).to.equal(true);
    expect(snapshot.canceled == false).to.equal(true);

    snapshot = await token.snapshotList(1);

    expect(snapshot.voteStart.toNumber() !== 0).to.equal(true);
    expect(snapshot.voteEnd.toNumber() !== 0).to.equal(true);
    expect(snapshot.lastCandidateIndex.toNumber() == 0).to.equal(true);
    expect(snapshot.executed == false).to.equal(true);
    expect(snapshot.canceled == false).to.equal(true);
  });

  it("Can add a candidate", async function () {
    await token.addCandidate(0);
    await token.addCandidate(0);

    let snapshot = await token.snapshotList(0);

    expect(snapshot.voteStart.toNumber() !== 0).to.equal(true);
    expect(snapshot.voteEnd.toNumber() !== 0).to.equal(true);
    expect(snapshot.lastCandidateIndex.toNumber() == 2).to.equal(true);
    expect(snapshot.executed == false).to.equal(true);
    expect(snapshot.canceled == false).to.equal(true);

    await token.addCandidate(1);
    await token.addCandidate(1);

    snapshot = await token.snapshotList(1);

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
    await token.vote(0, 0)
    const votedReport = await token.votedReport(0);

    expect(votedReport[0].countScore.toNumber() == 2).to.equal(true);
  });

  it("Should not allow voting again", async function () {
    let allow = true; 

    try {
      await token.vote(0, 0);
    }
    catch(err) {
      allow = false;
    }

    expect(allow == false).to.equal(true);
  });

  it("Can cancel a snapshot", async function () {
    await token.cancel(0);
    const snapshot = await token.snapshotList(0);

    expect(snapshot.canceled == true).to.equal(true);
  });

  it("Should not allow execute when canceled", async function () {
    let allow = true; 

    try {
      await token.execute(0);
    }
    catch(err) {
      allow = false;
    }

    expect(allow == false).to.equal(true);
  });

  it("Should not allow vote when canceled", async function () {
    let allow = true; 

    try {
      await token.vote(0,0);
    }
    catch(err) {
      allow = false;
    }

    expect(allow == false).to.equal(true);
  });

  it("Can execute a snapshot", async function () {
    await token.execute(1);
    const snapshot = await token.snapshotList(0);

    expect(snapshot.canceled == true).to.equal(true);
  });

  it("Should not allow cancel when executed", async function () {
    let allow = true; 

    try {
      await token.cancel(1);
    }
    catch(err) {
      allow = false;
    }

    expect(allow == false).to.equal(true);
  });

  it("Should not allow vote when executed", async function () {
    let allow = true; 

    try {
      await token.vote(1,0);
    }
    catch(err) {
      allow = false;
    }

    expect(allow == false).to.equal(true);
  });
});
