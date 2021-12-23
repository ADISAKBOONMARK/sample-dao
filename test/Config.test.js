/* eslint-disable eqeqeq */
const setting = async function () {
  const hre = require("hardhat");
  const { expect } = require("chai");

  const delay = function (ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  const contracts = {};
  const MoveForward = await hre.ethers.getContractFactory("MoveForward");
  contracts.MoveForward = await MoveForward.deploy();
  const MyGovernor = await hre.ethers.getContractFactory("MyGovernor");
  contracts.MyGovernor = await MyGovernor.deploy();

  const ipfsUrl = "";

  const time = new Date();
  time.setSeconds(time.getSeconds() + 10);

  const voteStart = Math.floor(time.getTime() / 1000.0);
  time.setSeconds(time.getSeconds() + 1);

  const voteEnd2 = Math.floor(time.getTime() / 1000.0);
  time.setDate(time.getDate() + 1);

  const voteEnd1 = Math.floor(time.getTime() / 1000.0);

  const location1 = 1;
  const location2 = 2;
  const location3 = 3;

  await contracts.MyGovernor.deployed();

  const [accountA, accountB, accountC, accountD] =
    await hre.ethers.getSigners();

  const accounts = {
    a: {
      MoveForward: new hre.ethers.Contract(
        contracts.MoveForward.address,
        contracts.MoveForward.interface,
        accountA
      ),
      MyGovernor: new hre.ethers.Contract(
        contracts.MyGovernor.address,
        contracts.MyGovernor.interface,
        accountA
      ),
    },
    b: {
      MoveForward: new hre.ethers.Contract(
        contracts.MoveForward.address,
        contracts.MoveForward.interface,
        accountB
      ),
      MyGovernor: new hre.ethers.Contract(
        contracts.MyGovernor.address,
        contracts.MyGovernor.interface,
        accountB
      ),
    },
    c: {
      MoveForward: new hre.ethers.Contract(
        contracts.MoveForward.address,
        contracts.MoveForward.interface,
        accountC
      ),
      MyGovernor: new hre.ethers.Contract(
        contracts.MyGovernor.address,
        contracts.MyGovernor.interface,
        accountC
      ),
    },
    d: {
      MoveForward: new hre.ethers.Contract(
        contracts.MoveForward.address,
        contracts.MoveForward.interface,
        accountD
      ),
      MyGovernor: new hre.ethers.Contract(
        contracts.MyGovernor.address,
        contracts.MyGovernor.interface,
        accountD
      ),
    },
  };

  return {
    hre,
    expect,
    delay,
    accounts,
    contracts,
    ipfsUrl,
    voteStart,
    voteEnd1,
    voteEnd2,
    location1,
    location2,
    location3,
  };
};

module.exports = {
  setting,
};
