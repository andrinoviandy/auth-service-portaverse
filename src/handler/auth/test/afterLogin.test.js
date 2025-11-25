// eslint-disable-next-line node/no-unpublished-require
const setCookie = require("set-cookie-parser");
const request = require("supertest");
const app = require("../../../../app");
const { check } = require("../../../commons/helpers/jwt");
const {
  firebaseauth,
  firebaseappauth,
} = require("../../../services/firebase.admin");

describe("Auth Test Config", function () {
  const email = "userb@kmplus.co.id";
  const pass = "KMPlus@2022";
  const data = {};
  const header = {};

  describe("Login to FB", function () {
    it("Test login firebase", async function () {
      const userCredentials = await firebaseauth.signInWithEmailAndPassword(
        firebaseappauth,
        email,
        pass
      );
      const user = userCredentials.user;
      header.authorization = user.accessToken;
      console.log("AUTH: ", user.accessToken);
      data.uid = user.uid;
      expect(data.uid).toBeDefined();
    });

    /**
     * employee service running required
     */
    it("Test after login ", async function () {
      const response = await request(app)
        .post("/auth/after-login")
        .set("authorization", `Bearer ${header.authorization}`)
        .set("Content-Type", "application/json")
        .send({
          isRemember: true,
        });
      const data = response.body.data;
      console.log(data.user.subcon);
      const cookies = setCookie.parse(response);

      const token = cookies[0].value.split("Bearer ")[1];
      const decoded = check(token);

      const userCookie = cookies[1].value;
      const user = JSON.parse(userCookie.replace(/^j:/, ""));

      const rememberToken = JSON.parse(cookies[2].value);

      expect(data.jwt).toBeDefined();
      expect(rememberToken.content).toBeDefined();
      expect(user.uid).toBeDefined();
      expect(decoded.uid).toBeDefined();
      expect(response.status).toBe(200);
    });
  });
});
