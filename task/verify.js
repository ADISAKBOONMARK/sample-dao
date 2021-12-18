/* eslint-disable no-undef */
/* eslint-disable node/no-missing-require */
/* eslint-disable node/no-unpublished-require */
const { task } = require("hardhat/config");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-change-network");

task("verify:rinkeby", "Verifies contract on Etherscan Rinkeby", async () => {
  const contract = require("../artifacts/deployed.json");
  hre.changeNetwork("rinkeby");
  await hre.run(`verify`, {
    address: contract.MyGovernorAddress,
  });
});

task("verify:mainnet", "Verifies contract on Etherscan mainnet", async () => {
  const contract = require("../artifacts/deployed.json");
  hre.changeNetwork("mainnet");
  await hre.run(`verify`, {
    address: contract.MyGovernorAddress,
  });
});
