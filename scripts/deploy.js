const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const contract = await hre.ethers.getContractFactory("MyGovernor");
  const myGovernor = await contract.deploy();
  await myGovernor.deployed();

  console.log("Deployed to:", myGovernor.address);

  // write address to file
  const obj = {
    MyGovernorAddress: myGovernor.address,
  };

  try {
    fs.writeFileSync("artifacts/deployed.json", JSON.stringify(obj, null, 2));
  } catch (err) {
    console.error(err);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
