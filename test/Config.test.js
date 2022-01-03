/* eslint-disable node/no-unsupported-features/es-syntax */
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
  time.setSeconds(time.getSeconds() + 25);

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

  const mash = {
    keccak256: hre.ethers.utils.solidityKeccak256,
    abi: {
      encodePacked: hre.ethers.utils.solidityPack,
    },
  };

  const signMsg = async (address, signer) => {
    const hash = mash.keccak256(
      ["bytes"],
      [
        mash.abi.encodePacked(
          ["string", "address"],
          ["register(uint256 _location)", address]
        ),
      ]
    );

    const digest = mash.keccak256(
      ["bytes"],
      [
        mash.abi.encodePacked(
          ["string", "bytes"],
          ["\x19Ethereum Signed Message:\n32", hash]
        ),
      ]
    );

    const signature = await hre.network.provider.send("eth_sign", [
      signer,
      hash,
    ]);

    const sig = hre.ethers.utils.splitSignature(signature);

    return {
      address: address,
      signer: signer,
      hash: hash,
      digest: digest,
      signature: signature,
      sig: sig,
    };
  };

  accountA.signMessage = async (address) => {
    return signMsg(address, accountA.address);
  };
  accountB.signMessage = async (address) => {
    return signMsg(address, accountB.address);
  };
  accountC.signMessage = async (address) => {
    return signMsg(address, accountC.address);
  };
  accountD.signMessage = async (address) => {
    return signMsg(address, accountD.address);
  };

  const accounts = {
    a: {
      ...accountA,
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
      ...accountB,
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
      ...accountC,
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
      ...accountD,
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

  const symbol = "MFW";
  const name = "Move Forward";
  const totalSupply = 10000000;
  const decimals = 18;

  return {
    symbol,
    name,
    totalSupply,
    decimals,
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
