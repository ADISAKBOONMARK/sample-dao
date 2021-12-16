const { task } = require("hardhat/config");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-change-network");

task("verify:rinkeby", "Verifies contract on Etherscan Rinkeby", async () => {
    const contract = require("../artifacts/deployed.json");
    // adding changeNetwork form args input
    // hre.changeNetwork(`${NETWORKS}`);
    hre.changeNetwork('rinkeby');
    await hre.run(`verify`,{
        address: contract.FactoryAddress,
    });
    await hre.run(`verify`,{
        address: contract.ERC20PresetAddress,
    });
});

task("verify:mainnet", "Verifies contract on Etherscan mainnet", async () => {
    const contract = require("../artifacts/deployed.json");
    hre.changeNetwork('mainnet');
    await hre.run(`verify`,{
        address: contract.FactoryAddress,
    });
    await hre.run(`verify`,{
        address: contract.ERC20PresetAddress,
    });
});