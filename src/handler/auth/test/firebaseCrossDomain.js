const {
  firebaseauth,
  firebaseappauth,
} = require("../../../services/firebase.admin");
const Hub = require("../../../services/hub");

/** firebase custom token from __session: might we have to test it from client that has set __session cookies from client, but how? */
module.exports = (test) => {
  describe("Firebase cross domain authentication", function () {
    it.only(
      "Post idToken and Getting _seesion cookies from call /session verify custom cookies on client and call /status to return custom token",
      async function () {
        const email = "user1412@gmail.com";
        const pass = "user1412";
        let data = {};
        const userCredential = await firebaseauth.signInWithEmailAndPassword(
          firebaseappauth,
          email,
          pass
        );
        const user = userCredential.user;
        const idTokenGet = await user.getIdToken();
        console.log(idTokenGet);
        const response = await Hub.testRequest({
          _url: "/auth/session",
          method: "POST",
          data: {
            idToken: idTokenGet,
          },
        });
        const status = response.data.success;
        const __session = response.headers["set-cookie"]
          .filter((e) => e.includes("__session"))[0]
          .split(";")[0]
          .split("__session=")[1];
        console.log("cookieHeaders", __session);
        expect(status).to.equal(true);
        const result = await Hub.testRequest({
          _url: "/auth/status",
          method: "GET",
          header: {
            Cookie: `__session=${__session};`,
          },
        });
        data = result.data.data;
        expect(data.token).to.exist;
      }
    ).timeout(10000);
  });
};
