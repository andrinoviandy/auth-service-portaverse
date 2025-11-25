/**
 * Firebase connection admin
 *
 */

const admin = require("firebase-admin");
const firebase = require("firebase/app");
const firebaseauth = require("firebase/auth");
const serviceAccount = require("../../config/config.firebase-client.js");
const serviceAccountAdmin = require("../../config/config.firebase-admin.js");

const client = firebase.initializeApp(
  {
    // credential: admin.credential.cert(serviceAccountAdmin),
    apiKey: serviceAccount.apiKey,
    authDomain: serviceAccount.authDomain,
    projectId: serviceAccount.projectId,
    storageBucket: serviceAccount.storageBucket,
    messagingSenderId: serviceAccount.messagingSenderId,
    appId: serviceAccount.appId,
  },
  "client"
);

const adminAuth = admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccountAdmin),
  },
  "admin"
);

module.exports = {
  firebaseauth: firebaseauth,
  firebaseappauth: firebaseauth.getAuth(client),
  adminAuth,
};
