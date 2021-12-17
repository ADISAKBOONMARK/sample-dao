const { expect } = require("chai");
const { BigNumber } = require("ethers");
const hre = require("hardhat");

describe("MyGovernor", async function () {
  let accounts;
  let token;
  let ipfsUrl;
  before(async () => {
    const contract = await hre.ethers.getContractFactory("MyGovernor");
    const [accountA, accountB, accountC] = await hre.ethers.getSigners();
    accounts = [accountA, accountB, accountC];
    token = await contract.deploy();
    ipfsUrl = "";
    await token.deployed();
  });
  
  it("Can create a snapshot", async function () {
    await token.createSnapshot();
    await token.createSnapshot();

    let snapshot = await token.getSnapshot(0);

    expect(snapshot.voteStart.toNumber() !== 0).to.equal(true);
    expect(snapshot.voteEnd.toNumber() !== 0).to.equal(true);
    expect(snapshot.lastCandidateIndex.toNumber() == 0).to.equal(true);
    expect(snapshot.executed == false).to.equal(true);
    expect(snapshot.canceled == false).to.equal(true);

    snapshot = await token.getSnapshot(1);

    expect(snapshot.voteStart.toNumber() !== 0).to.equal(true);
    expect(snapshot.voteEnd.toNumber() !== 0).to.equal(true);
    expect(snapshot.lastCandidateIndex.toNumber() == 0).to.equal(true);
    expect(snapshot.executed == false).to.equal(true);
    expect(snapshot.canceled == false).to.equal(true);
  });

  it("Can add a candidate", async function () {
    await token.addCandidate(0);
    await token.addCandidate(0);

    let snapshot = await token.getSnapshot(0);

    expect(snapshot.voteStart.toNumber() !== 0).to.equal(true);
    expect(snapshot.voteEnd.toNumber() !== 0).to.equal(true);
    expect(snapshot.lastCandidateIndex.toNumber() == 2).to.equal(true);
    expect(snapshot.executed == false).to.equal(true);
    expect(snapshot.canceled == false).to.equal(true);

    await token.addCandidate(1);
    await token.addCandidate(1);

    snapshot = await token.getSnapshot(1);

    expect(snapshot.voteStart.toNumber() !== 0).to.equal(true);
    expect(snapshot.voteEnd.toNumber() !== 0).to.equal(true);
    expect(snapshot.lastCandidateIndex.toNumber() == 2).to.equal(true);
    expect(snapshot.executed == false).to.equal(true);
    expect(snapshot.canceled == false).to.equal(true);
  });

  it("Check my vote before doing", async function () {
    const myVote = await await token.myVote(0);

    expect(myVote.voted == false).to.equal(true);
    expect(myVote.candidateIndex == 0).to.equal(true);
  });

  it("Check candidate report before voting", async function () {
    const candidateReport = await await token.candidateReport(0,0);

    expect(candidateReport.ipfsUrl == ipfsUrl).to.equal(true);
    expect(candidateReport.countScore == 0).to.equal(true);
  });

  it("Check vote report before voting", async function () {
    const voteReport = await await token.voteReport(0);

    expect(voteReport[0].ipfsUrl == ipfsUrl).to.equal(true);
    expect(voteReport[0].countScore == 0).to.equal(true);

    expect(voteReport[1].ipfsUrl == ipfsUrl).to.equal(true);
    expect(voteReport[1].countScore == 0).to.equal(true);
  });

  it("Can vote", async function () {
    await token.vote(0, 0);
    token = new ethers.Contract(
      token.address,
      token.interface,
      accounts[1]
    );
    await token.vote(0, 0)
    const voteReport = await token.voteReport(0);

    expect(voteReport[0].countScore.toNumber() == 2).to.equal(true);
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
    const snapshot = await token.getSnapshot(0);

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
    const snapshot = await token.getSnapshot(0);

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

  it("Check my vote after doing", async function () {
    const myVote = await await token.myVote(0);

    expect(myVote.voted == true).to.equal(true);
    expect(myVote.candidateIndex == 0).to.equal(true);
  });

  it("Check candidate report after voting", async function () {
    const candidateReport = await await token.candidateReport(0,0);

    expect(candidateReport.ipfsUrl == ipfsUrl).to.equal(true);
    expect(candidateReport.countScore == 2).to.equal(true);
  });

  it("Check vote report after voting", async function () {
    const voteReport = await await token.voteReport(0);

    expect(voteReport[0].ipfsUrl == ipfsUrl).to.equal(true);
    expect(voteReport[0].countScore == 2).to.equal(true);

    expect(voteReport[1].ipfsUrl == ipfsUrl).to.equal(true);
    expect(voteReport[1].countScore == 0).to.equal(true);
  });
});
