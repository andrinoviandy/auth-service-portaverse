require("dotenv").config();

const { adminAuth } = require("./src/services/firebase.admin");

function deleteUser(uid) {
  adminAuth
    .auth()
    .deleteUser(uid)
    .then(function () {
      console.log("Successfully deleted user", uid);
    })
    .catch(function (error) {
      console.log("Error deleting user:", error);
    });
}

function getAllUsers(nextPageToken) {
  adminAuth
    .auth()
    .listUsers(100, nextPageToken)
    .then(function (listUsersResult) {
      listUsersResult.users.forEach(function (userRecord) {
        const uid = userRecord.toJSON().uid;
        deleteUser(uid);
      });
      if (listUsersResult.pageToken) {
        getAllUsers(listUsersResult.pageToken);
      }
    })
    .catch(function (error) {
      console.log("Error listing users:", error);
    });
}

getAllUsers();
