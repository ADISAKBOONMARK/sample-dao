/* eslint-disable eqeqeq */
let config = require("./IConfig.test.js");

describe("MyGovernor", async function () {
  before(async () => {
    config = global._config;
  });

  it("Should allow owner only to add signer", async function () {
    let allow = true;

    try {
      await config.accounts.b.MyGovernor.addSigner(config.accounts.a.address);
    } catch (err) {
      allow = false;
    }

    config.expect(allow == false).to.equal(true, "001");
  });

  it("Can add a signer", async function () {
    let allow = true;

    try {
      await config.accounts.a.MyGovernor.addSigner(config.accounts.a.address);
      await config.accounts.a.MyGovernor.addSigner(config.accounts.b.address);
    } catch (err) {
      allow = false;
    }

    config.expect(allow == true).to.equal(true, "001");
  });

  it("Can create a snapshot", async function () {
    await config.accounts.a.MyGovernor.createSnapshot(
      config.voteStart,
      config.voteEnd1,
      config.location1
    );

    await config.accounts.a.MyGovernor.createSnapshot(
      config.voteStart,
      config.voteEnd2,
      config.location2
    );

    await config.accounts.a.MyGovernor.createSnapshot(
      config.voteStart,
      config.voteEnd1,
      config.location3
    );

    let snapshot = await config.accounts.a.MyGovernor.getSnapshot(0);

    config.expect(snapshot.voteStart == config.voteStart).to.equal(true, "001");
    config.expect(snapshot.voteEnd == config.voteEnd1).to.equal(true, "002");
    config.expect(snapshot.location == config.location1).to.equal(true, "003");
    config.expect(snapshot.lastCandidateIndex == 0).to.equal(true, "004");
    config.expect(snapshot.canceled == false).to.equal(true, "005");

    snapshot = await config.accounts.a.MyGovernor.getSnapshot(1);

    config.expect(snapshot.voteStart == config.voteStart).to.equal(true, "006");
    config.expect(snapshot.voteEnd == config.voteEnd2).to.equal(true, "007");
    config.expect(snapshot.location == config.location2).to.equal(true, "008");
    config.expect(snapshot.lastCandidateIndex == 0).to.equal(true, "009");
    config.expect(snapshot.canceled == false).to.equal(true, "010");

    snapshot = await config.accounts.a.MyGovernor.getSnapshot(2);

    config.expect(snapshot.voteStart == config.voteStart).to.equal(true, "011");
    config.expect(snapshot.voteEnd == config.voteEnd1).to.equal(true, "012");
    config.expect(snapshot.location == config.location3).to.equal(true, "013");
    config.expect(snapshot.lastCandidateIndex == 0).to.equal(true, "014");
    config.expect(snapshot.canceled == false).to.equal(true, "015");
  });

  it("Should allow only owner role to create a snapshot", async function () {
    let allow = true;

    try {
      await config.accounts.b.MyGovernor.createSnapshot(0, 0);
    } catch (err) {
      allow = false;
    }

    config.expect(allow == false).to.equal(true, "001");
  });

  it("Can add a candidate", async function () {
    await config.accounts.a.MyGovernor.addCandidate(0, config.ipfsUrl);
    await config.accounts.a.MyGovernor.addCandidate(0, config.ipfsUrl);

    let snapshot = await config.accounts.a.MyGovernor.getSnapshot(0);

    config.expect(snapshot.voteStart == config.voteStart).to.equal(true, "001");
    config.expect(snapshot.voteEnd == config.voteEnd1).to.equal(true, "002");
    config.expect(snapshot.location == config.location1).to.equal(true, "003");
    config.expect(snapshot.lastCandidateIndex == 2).to.equal(true, "004");
    config.expect(snapshot.canceled == false).to.equal(true, "005");

    await config.accounts.a.MyGovernor.addCandidate(1, config.ipfsUrl);
    await config.accounts.a.MyGovernor.addCandidate(1, config.ipfsUrl);
    await config.accounts.a.MyGovernor.addCandidate(1, config.ipfsUrl);

    snapshot = await config.accounts.a.MyGovernor.getSnapshot(1);

    config.expect(snapshot.voteStart == config.voteStart).to.equal(true, "006");
    config.expect(snapshot.voteEnd == config.voteEnd2).to.equal(true, "007");
    config.expect(snapshot.location == config.location2).to.equal(true, "008");
    config.expect(snapshot.lastCandidateIndex == 3).to.equal(true, "009");
    config.expect(snapshot.canceled == false).to.equal(true, "010");

    await config.accounts.a.MyGovernor.addCandidate(2, config.ipfsUrl);

    snapshot = await config.accounts.a.MyGovernor.getSnapshot(2);

    config.expect(snapshot.voteStart == config.voteStart).to.equal(true, "011");
    config.expect(snapshot.voteEnd == config.voteEnd1).to.equal(true, "012");
    config.expect(snapshot.location == config.location3).to.equal(true, "013");
    config.expect(snapshot.lastCandidateIndex == 1).to.equal(true, "014");
    config.expect(snapshot.canceled == false).to.equal(true, "015");
  });

  it("Should allow only owner role to add a candidate", async function () {
    let allow = true;

    try {
      await config.accounts.b.MyGovernor.addCandidate(1, config.ipfsUrl);
    } catch (err) {
      allow = false;
    }

    config.expect(allow == false).to.equal(true, "001");
  });

  it("Should not allow registering if invalid signer", async function () {
    let allow = true;

    try {
      const signMsg = await config.accounts.c.signMessage(
        config.accounts.c.address
      );
      // console.log(signMsg);
      await config.accounts.c.MyGovernor.register(
        signMsg.sig.v,
        signMsg.sig.r,
        signMsg.sig.s,
        config.location1
      );
    } catch (err) {
      allow = false;
    }

    config.expect(allow == false).to.equal(true, "001");
  });

  it("Can register", async function () {
    let signMsg = await config.accounts.a.signMessage(
      config.accounts.a.address
    );
    // console.log(signMsg);
    await config.accounts.a.MyGovernor.register(
      signMsg.sig.v,
      signMsg.sig.r,
      signMsg.sig.s,
      config.location1
    );

    signMsg = await config.accounts.b.signMessage(config.accounts.b.address);
    // console.log(signMsg);
    await config.accounts.b.MyGovernor.register(
      signMsg.sig.v,
      signMsg.sig.r,
      signMsg.sig.s,
      config.location2
    );

    signMsg = await config.accounts.a.signMessage(config.accounts.c.address);
    // console.log(signMsg);
    await config.accounts.c.MyGovernor.register(
      signMsg.sig.v,
      signMsg.sig.r,
      signMsg.sig.s,
      config.location1
    );

    signMsg = await config.accounts.b.signMessage(config.accounts.d.address);
    // console.log(signMsg);
    await config.accounts.d.MyGovernor.register(
      signMsg.sig.v,
      signMsg.sig.r,
      signMsg.sig.s,
      config.location3
    );

    const a = await config.accounts.a.MyGovernor.myInfo();
    const b = await config.accounts.b.MyGovernor.myInfo();
    const c = await config.accounts.c.MyGovernor.myInfo();
    const d = await config.accounts.d.MyGovernor.myInfo();

    config.expect(a.location == config.location1).to.equal(true, "001");
    config.expect(b.location == config.location2).to.equal(true, "002");
    config.expect(c.location == config.location1).to.equal(true, "003");
    config.expect(d.location == config.location3).to.equal(true, "004");
  });

  it("Can set location", async function () {
    await config.accounts.b.MyGovernor.setLocation(1);
    await config.accounts.c.MyGovernor.setLocation(2);

    const b = await config.accounts.b.MyGovernor.myInfo();
    const c = await config.accounts.c.MyGovernor.myInfo();

    config.expect(b.location == config.location1).to.equal(true, "001");
    config.expect(c.location == config.location2).to.equal(true, "002");
  });

  it("Check my vote before doing", async function () {
    const myVote = await config.accounts.a.MyGovernor.myVote(0);

    config.expect(myVote.voted == false).to.equal(true, "001");
    config.expect(myVote.candidateIndex == 0).to.equal(true, "002");
  });

  it("Check candidate report before voting", async function () {
    const candidateReport = await config.accounts.a.MyGovernor.candidateReport(
      0,
      0
    );

    config
      .expect(candidateReport.ipfsUrl == config.ipfsUrl)
      .to.equal(true, "001");
    config.expect(candidateReport.countScore == 0).to.equal(true, "002");
  });

  it("Check vote report before voting", async function () {
    const voteReport = await await config.accounts.a.MyGovernor.voteReport(0);

    config
      .expect(voteReport[0].ipfsUrl == config.ipfsUrl)
      .to.equal(true, "001");
    config.expect(voteReport[0].countScore == 0).to.equal(true, "002");

    config
      .expect(voteReport[1].ipfsUrl == config.ipfsUrl)
      .to.equal(true, "003");
    config.expect(voteReport[1].countScore == 0).to.equal(true, "004");
  });

  it("Delay x sec before an opening vote", async function () {
    let stop = false;
    while (!stop) {
      const snapshot = await config.accounts.a.MyGovernor.getSnapshot(0);
      if (snapshot.voteStart == Math.floor(new Date().getTime() / 1000.0)) {
        stop = true;
      }
      config.delay(1000);
    }
  });

  it("Can vote", async function () {
    await config.accounts.a.MyGovernor.vote(0, 0);
    await config.accounts.b.MyGovernor.vote(0, 0);

    const voteReport = await config.accounts.a.MyGovernor.voteReport(0);

    config.expect(voteReport[0].countScore == 2).to.equal(true, "001");
    config.expect(voteReport[1].countScore == 0).to.equal(true, "002");
  });

  it("Should not allow voting if member doesn't have the feature for voting", async function () {
    let allow = true;

    try {
      await config.accounts.a.MyGovernor.setLocation(config.location3);
      await config.accounts.a.MyGovernor.vote(2, 0);
    } catch (err) {
      allow = false;
    }

    config.expect(allow == false).to.equal(true, "001");
  });

  it("Should not allow voting if member not living in the location", async function () {
    let allow = true;

    try {
      await config.accounts.c.MyGovernor.vote(2, 0);
    } catch (err) {
      allow = false;
    }

    config.expect(allow == false).to.equal(true, "001");
  });

  it("Should not allow voting again", async function () {
    let allow = true;

    try {
      await config.accounts.a.MyGovernor.vote(0, 0);
    } catch (err) {
      allow = false;
    }

    config.expect(allow == false).to.equal(true, "001");
  });

  it("Should not allow voting when expired", async function () {
    let allow = true;

    try {
      await config.accounts.b.vote(1, 0);
    } catch (err) {
      allow = false;
    }

    config.expect(allow == false).to.equal(true, "001");
  });

  it("Can cancel a snapshot", async function () {
    await config.accounts.a.MyGovernor.cancel(0);
    const snapshot = await config.accounts.a.MyGovernor.getSnapshot(0);

    config.expect(snapshot.canceled == true).to.equal(true, "001");
  });

  it("Should allow only owner role to cancel a snapshot", async function () {
    let allow = true;

    try {
      await config.accounts.b.MyGovernor.cancel(1);
    } catch (err) {
      allow = false;
    }

    config.expect(allow == false).to.equal(true, "001");
  });

  it("Should not allow vote when canceled", async function () {
    let allow = true;

    try {
      await config.accounts.c.MyGovernor.vote(0, 0);
    } catch (err) {
      allow = false;
    }

    config.expect(allow == false).to.equal(true, "001");
  });

  it("Check my vote after doing", async function () {
    const myVote = await config.accounts.a.MyGovernor.myVote(0);

    config.expect(myVote.voted == true).to.equal(true, "001");
    config.expect(myVote.candidateIndex == 0).to.equal(true, "002");
  });

  it("Check candidate report after voting", async function () {
    const candidateReport = await config.accounts.a.MyGovernor.candidateReport(
      0,
      0
    );

    config
      .expect(candidateReport.ipfsUrl == config.ipfsUrl)
      .to.equal(true, "001");
    config.expect(candidateReport.countScore == 2).to.equal(true, "002");
  });

  it("Check vote report after voting", async function () {
    const voteReport = await await config.accounts.a.MyGovernor.voteReport(0);

    config
      .expect(voteReport[0].ipfsUrl == config.ipfsUrl)
      .to.equal(true, "001");
    config.expect(voteReport[0].countScore == 2).to.equal(true, "002");

    config
      .expect(voteReport[1].ipfsUrl == config.ipfsUrl)
      .to.equal(true, "003");
    config.expect(voteReport[1].countScore == 0).to.equal(true, "004");
  });
});
