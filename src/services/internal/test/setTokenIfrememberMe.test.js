require("dotenv").config();
const mockResponse = require("../../../commons/mocks/mockResponse");
const setTokenIfrememberMe = require("../setTokenIfrememberMe");

describe("Set Token functionality", () => {
  it("It should get user information when user exist and employee is not archived", async () => {
    const res = mockResponse();
    const uid = "GQEwYC73dhamIIKu1kuYBTxNuZw2";
    const isRemember = false;
    const user = await setTokenIfrememberMe(res, uid, isRemember);

    expect(user.data).toBeDefined();
    expect(user.jwt).toBeDefined();
  });
});
