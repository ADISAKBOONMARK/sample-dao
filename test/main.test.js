// describe("Contracts", async function () {
before(async () => {
  const config = require("./Config.test.js");
  global._config = await config.setting();
});

require("./MoveForward.test.js");
require("./MyGovernor.test.js");
// });
