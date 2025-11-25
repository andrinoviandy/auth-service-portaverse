const registerAllToFirebase = require("../registerAllToFirebase");
const { User } = require("../../../models");
const crypto = require("crypto");

describe("Register all users to firebase", () => {
  it("It should all users to firebase when uid in database is null", async () => {
    const email = `${crypto.randomBytes(5).toString("hex")}@adittgomail.com`;
    await User.create({
      email,
      role_code: "USER",
    }).catch((err) => console.log(err));

    await registerAllToFirebase().catch((err) => console.log(err));

    const afterRegist = await User.findOne({
      attributes: ["uid"],
      where: { email },
    });

    expect(!!afterRegist.uid).toEqual(true);
  });
});
