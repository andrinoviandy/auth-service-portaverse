const registerAllToFirebase = require("../../../internal/registerAllToFirebase");

module.exports = {
  queue: "bulk-register-users:userauth",
  listen: async (message) => {
    try {
      const { emails } = JSON.parse(message.content.toString());
      await registerAllToFirebase(emails);
    } catch (error) {
      console.log(error);
    }
  },
};
