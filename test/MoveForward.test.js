/* eslint-disable eqeqeq */
let config = require("./IConfig.test.js");

describe("MoveForward", async function () {
  before(async () => {
    config = global._config;
  });

  it("Can check name", async function () {
    const name = await config.accounts.a.MoveForward.name();

    config.expect(name == config.name).to.equal(true, "001");
  });

  it("Can check symbol", async function () {
    const symbol = await config.accounts.a.MoveForward.symbol();

    config.expect(symbol == config.symbol).to.equal(true, "001");
  });

  it("Can check total supply", async function () {
    const totalSupply = await config.accounts.a.MoveForward.totalSupply();

    config
      .expect(
        config.hre.ethers.utils.formatEther(totalSupply) == config.totalSupply
      )
      .to.equal(true, "001");
  });

  it("Can check balanceOf", async function () {
    const balance = await config.accounts.a.MoveForward.balanceOf(
      config.accounts.a.address
    );

    config
      .expect(
        config.hre.ethers.utils.formatEther(balance) == config.totalSupply
      )
      .to.equal(true, "001");
  });

  it("Can check owner", async function () {
    const owner = await config.accounts.a.MoveForward.owner();

    config.expect(owner == config.accounts.a.address).to.equal(true, "001");
  });

  it("Can check pause", async function () {
    const pause = await config.accounts.a.MoveForward.paused();

    config.expect(pause == false).to.equal(true, "001");
  });

  it("Can approve token to another address", async function () {
    await config.accounts.a.MoveForward.approve(
      config.accounts.b.address,
      config.hre.ethers.utils.parseUnits("10", config.decimals)
    );

    const amount = await config.accounts.a.MoveForward.allowance(
      config.accounts.a.address,
      config.accounts.b.address
    );

    config
      .expect(config.hre.ethers.utils.formatEther(amount) == 10)
      .to.equal(true, "001");
  });

  it("Can increase token approval to another address", async function () {
    await config.accounts.a.MoveForward.increaseAllowance(
      config.accounts.b.address,
      config.hre.ethers.utils.parseUnits("10", config.decimals)
    );

    const amount = await config.accounts.a.MoveForward.allowance(
      config.accounts.a.address,
      config.accounts.b.address
    );

    config
      .expect(config.hre.ethers.utils.formatEther(amount) == 20)
      .to.equal(true, "001");
  });

  it("Can decrease token approval to another address", async function () {
    await config.accounts.a.MoveForward.decreaseAllowance(
      config.accounts.b.address,
      config.hre.ethers.utils.parseUnits("10", config.decimals)
    );

    const amount = await config.accounts.a.MoveForward.allowance(
      config.accounts.a.address,
      config.accounts.b.address
    );

    config
      .expect(config.hre.ethers.utils.formatEther(amount) == 10)
      .to.equal(true, "001");
  });

  it("Can transfer token of address that approval to another address", async function () {
    await config.accounts.b.MoveForward.transferFrom(
      config.accounts.a.address,
      config.accounts.c.address,
      config.hre.ethers.utils.parseUnits("10", config.decimals)
    );

    let balance = await config.accounts.a.MoveForward.balanceOf(
      config.accounts.a.address
    );

    config
      .expect(
        config.hre.ethers.utils.formatEther(balance) == config.totalSupply - 10
      )
      .to.equal(true, "001");

    balance = await config.accounts.a.MoveForward.balanceOf(
      config.accounts.c.address
    );

    config
      .expect(config.hre.ethers.utils.formatEther(balance) == 10)
      .to.equal(true, "002");
  });

  it("Can transfer token to another address", async function () {
    await config.accounts.a.MoveForward.transfer(
      config.accounts.b.address,
      config.hre.ethers.utils.parseUnits("10", config.decimals)
    );

    let balance = await config.accounts.a.MoveForward.balanceOf(
      config.accounts.a.address
    );

    config
      .expect(
        config.hre.ethers.utils.formatEther(balance) == config.totalSupply - 20
      )
      .to.equal(true, "001");

    balance = await config.accounts.b.MoveForward.balanceOf(
      config.accounts.b.address
    );

    config
      .expect(config.hre.ethers.utils.formatEther(balance) == 10)
      .to.equal(true, "002");
  });

  it("Can mint token to another address", async function () {
    await config.accounts.a.MoveForward.mint(
      config.accounts.b.address,
      config.hre.ethers.utils.parseUnits("10", config.decimals)
    );

    const balance = await config.accounts.b.MoveForward.balanceOf(
      config.accounts.b.address
    );

    config
      .expect(config.hre.ethers.utils.formatEther(balance) == 20)
      .to.equal(true, "001");
  });

  it("Should allow only owner role to mint the token", async function () {
    let allow = true;

    try {
      await config.accounts.b.MoveForward.mint(
        config.accounts.b.address,
        config.hre.ethers.utils.parseUnits("10", config.decimals)
      );
    } catch (err) {
      allow = false;
    }

    config.expect(allow == false).to.equal(true, "001");
  });

  it("Can burn token from another address", async function () {
    await config.accounts.a.MoveForward.burn(
      config.accounts.b.address,
      config.hre.ethers.utils.parseUnits("10", config.decimals)
    );

    const balance = await config.accounts.b.MoveForward.balanceOf(
      config.accounts.b.address
    );

    config
      .expect(config.hre.ethers.utils.formatEther(balance) == 10)
      .to.equal(true, "001");
  });

  it("Should allow only owner role to burn the token", async function () {
    let allow = true;

    try {
      await config.accounts.b.MoveForward.burn(
        config.accounts.b.address,
        config.hre.ethers.utils.parseUnits("10", config.decimals)
      );
    } catch (err) {
      allow = false;
    }

    config.expect(allow == false).to.equal(true, "001");
  });

  it("Should allow only owner role to pause", async function () {
    let allow = true;

    try {
      await config.accounts.b.MoveForward.pause();
    } catch (err) {
      allow = false;
    }

    config.expect(allow == false).to.equal(true, "001");
  });

  it("Can pause", async function () {
    await config.accounts.a.MoveForward.pause();
    const pause = await config.accounts.a.MoveForward.paused();

    config.expect(pause == true).to.equal(true, "001");
  });

  it("Should allow only owner role to unpause", async function () {
    let allow = true;

    try {
      await config.accounts.b.MoveForward.unpause();
    } catch (err) {
      allow = false;
    }

    config.expect(allow == false).to.equal(true, "001");
  });

  it("Can unpause", async function () {
    await config.accounts.a.MoveForward.unpause();
    const pause = await config.accounts.a.MoveForward.paused();

    config.expect(pause == false).to.equal(true, "001");
  });

  it("Can transfer ownership", async function () {
    config.accounts.a.MoveForward.transferOwnership(config.accounts.b.address);
    const owner = await config.accounts.b.MoveForward.owner();

    config.expect(owner == config.accounts.b.address).to.equal(true, "001");
  });
});
