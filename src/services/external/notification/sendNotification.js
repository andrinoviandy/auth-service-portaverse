const { adminAuth } = require("../../firebase.admin");

// registrationTokens list containing up to 500 registration tokens.
// These registration tokens come from the client FCM SDKs.
module.exports = async ({ registrationTokens, title, body }) => {
  const message = {
    tokens: registrationTokens,
    notification: {
      title,
      body,
      android: {
        channelId: "default",
        pressAction: {
          id: "default",
        },
      },
    },
    priority: "high",
    content_available: true,
  };

  const result = await adminAuth.messaging().sendMulticast(message);

  return result;
};
