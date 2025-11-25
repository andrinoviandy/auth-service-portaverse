const getUpdatedUserInformation = require("../getUpdatedUserInformation");

describe("Find updated user information", () => {
  it("It should get user information when user exist and employee is not archived", async () => {
    const user_id = 124;
    const user = await getUpdatedUserInformation(user_id);
    expect(user.dataValues.user_id).toBeDefined();
  });
  it("It should get user information login for vendor", async () => {
    const user_id = 5;
    const user = await getUpdatedUserInformation(user_id);
    expect(user.dataValues.user_id).toBeDefined();
    // expect(user.vendor.vendor_id).toBeDefined();
  });

  it("It should get user information with many roles as an array", async () => {
    const user_id = 124;
    const user = await getUpdatedUserInformation(user_id);
    expect(Array.isArray(user.role_code)).toBe(true)
  });
});
