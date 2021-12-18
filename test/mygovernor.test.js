/* eslint-disable eqeqeq */
const { expect } = require("chai");
// const { BigNumber } = require("ethers");
const hre = require("hardhat");

describe("MyGovernor", async function () {
  let accounts;
  let token;
  let ipfsUrl;
  let voteStart;
  let voteEnd1;
  let voteEnd2;

  function delay(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  before(async () => {
    const contract = await hre.ethers.getContractFactory("MyGovernor");
    token = await contract.deploy();
    ipfsUrl = "";

    const time = new Date();
    time.setSeconds(time.getSeconds() + 10);

    voteStart = Math.floor(time.getTime() / 1000.0);
    time.setSeconds(time.getSeconds() + 1);

    voteEnd2 = Math.floor(time.getTime() / 1000.0);
    time.setDate(time.getDate() + 1);

    voteEnd1 = Math.floor(time.getTime() / 1000.0);

    await token.deployed();

    const [accountA, accountB, accountC] = await hre.ethers.getSigners();
    accounts = [
      new hre.ethers.Contract(token.address, token.interface, accountA), // Owner
      new hre.ethers.Contract(token.address, token.interface, accountB),
      new hre.ethers.Contract(token.address, token.interface, accountC),
    ];
  });

  it("Can create a snapshot", async function () {
    await accounts[0].createSnapshot(voteStart, voteEnd1);
    await accounts[0].createSnapshot(voteStart, voteEnd2);

    let snapshot = await accounts[0].getSnapshot(0);

    expect(snapshot.voteStart == voteStart).to.equal(true);
    expect(snapshot.voteEnd == voteEnd1).to.equal(true);
    expect(snapshot.lastCandidateIndex == 0).to.equal(true);
    expect(snapshot.canceled == false).to.equal(true);

    snapshot = await accounts[0].getSnapshot(1);

    expect(snapshot.voteStart == voteStart).to.equal(true);
    expect(snapshot.voteEnd == voteEnd2).to.equal(true);
    expect(snapshot.lastCandidateIndex == 0).to.equal(true);
    expect(snapshot.canceled == false).to.equal(true);
  });

  it("Should allow only owner role to create a snapshot", async function () {
    let allow = true;

    try {
      await accounts[1].createSnapshot(0, 0);
    } catch (err) {
      allow = false;
    }

    expect(allow == false).to.equal(true);
  });

  it("Can add a candidate", async function () {
    await accounts[0].addCandidate(0, ipfsUrl);
    await accounts[0].addCandidate(0, ipfsUrl);

    let snapshot = await accounts[0].getSnapshot(0);

    expect(snapshot.voteStart == voteStart).to.equal(true);
    expect(snapshot.voteEnd == voteEnd1).to.equal(true);
    expect(snapshot.lastCandidateIndex == 2).to.equal(true);
    expect(snapshot.canceled == false).to.equal(true);

    await accounts[0].addCandidate(1, ipfsUrl);
    await accounts[0].addCandidate(1, ipfsUrl);
    await accounts[0].addCandidate(1, ipfsUrl);

    snapshot = await accounts[0].getSnapshot(1);

    expect(snapshot.voteStart == voteStart).to.equal(true);
    expect(snapshot.voteEnd == voteEnd2).to.equal(true);
    expect(snapshot.lastCandidateIndex == 3).to.equal(true);
    expect(snapshot.canceled == false).to.equal(true);
  });

  it("Should allow only owner role to add a candidate", async function () {
    let allow = true;

    try {
      await accounts[1].addCandidate(1, ipfsUrl);
    } catch (err) {
      allow = false;
    }

    expect(allow == false).to.equal(true);
  });

  it("Check my vote before doing", async function () {
    const myVote = await await accounts[0].myVote(0);

    expect(myVote.voted == false).to.equal(true);
    expect(myVote.candidateIndex == 0).to.equal(true);
  });

  it("Check candidate report before voting", async function () {
    const candidateReport = await await accounts[0].candidateReport(0, 0);

    expect(candidateReport.ipfsUrl == ipfsUrl).to.equal(true);
    expect(candidateReport.countScore == 0).to.equal(true);
  });

  it("Check vote report before voting", async function () {
    const voteReport = await await accounts[0].voteReport(0);

    expect(voteReport[0].ipfsUrl == ipfsUrl).to.equal(true);
    expect(voteReport[0].countScore == 0).to.equal(true);

    expect(voteReport[1].ipfsUrl == ipfsUrl).to.equal(true);
    expect(voteReport[1].countScore == 0).to.equal(true);
  });

  it("Can vote", async function () {
    await delay(10000);
    await accounts[0].vote(0, 0);
    await accounts[1].vote(0, 0);
    const voteReport = await token.voteReport(0);
    expect(voteReport[0].countScore == 2).to.equal(true);
  });

  it("Should not allow voting again", async function () {
    let allow = true;

    try {
      await accounts[0].vote(0, 0);
    } catch (err) {
      allow = false;
    }

    expect(allow == false).to.equal(true);
  });

  it("Should not allow voting when expired", async function () {
    let allow = true;

    try {
      await token.vote(1, 0);
    } catch (err) {
      allow = false;
    }

    expect(allow == false).to.equal(true);
  });

  it("Can cancel a snapshot", async function () {
    await accounts[0].cancel(0);
    const snapshot = await token.getSnapshot(0);

    expect(snapshot.canceled == true).to.equal(true);
  });

  it("Should allow only owner role to cancel a snapshot", async function () {
    let allow = true;

    try {
      await accounts[1].cancel(1);
    } catch (err) {
      allow = false;
    }

    expect(allow == false).to.equal(true);
  });

  it("Should not allow vote when canceled", async function () {
    let allow = true;

    try {
      await accounts[2].vote(0, 0);
    } catch (err) {
      allow = false;
    }

    expect(allow == false).to.equal(true);
  });

  it("Check my vote after doing", async function () {
    const myVote = await await accounts[0].myVote(0);

    expect(myVote.voted == true).to.equal(true);
    expect(myVote.candidateIndex == 0).to.equal(true);
  });

  it("Check candidate report after voting", async function () {
    const candidateReport = await await accounts[0].candidateReport(0, 0);

    expect(candidateReport.ipfsUrl == ipfsUrl).to.equal(true);
    expect(candidateReport.countScore == 2).to.equal(true);
  });

  it("Check vote report after voting", async function () {
    const voteReport = await await accounts[0].voteReport(0);

    expect(voteReport[0].ipfsUrl == ipfsUrl).to.equal(true);
    expect(voteReport[0].countScore == 2).to.equal(true);

    expect(voteReport[1].ipfsUrl == ipfsUrl).to.equal(true);
    expect(voteReport[1].countScore == 0).to.equal(true);
  });
});
