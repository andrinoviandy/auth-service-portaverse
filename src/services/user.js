/**
 * User management with firebase service
 *
 *
 */

const { adminAuth } = require("../services/firebase.admin");
const auth = adminAuth.auth();

/**
 * Synchronize local users (client,member, or admin)
 * with the Firebase Auth Users
 *
 * @param {object} data
 * @param {object} customClaims
 * @returns
 */
const updateUser = async (data, customClaims) => {
  // always like this but in the future should be defined properly
  const userData = {
    emailVerified: true,
    disabled: !data.active,
  };

  if (data.phone_number) {
    userData.phoneNumber = data.phone_number;
  }

  if (data.password) {
    // email and password is required
    userData.email = data.email;
    userData.password = data.password;
  }

  if (data.name) {
    userData.displayName = data.name;
  }

  if (data.photo_url) {
    userData.photoURL = data.photo_url;
  }

  try {
    const userRecord = await auth.getUserByEmail(data.email);

    if (userRecord) {
      try {
        // update existing user with uid
        await auth.updateUser(userRecord.uid, userData);
        await auth.setCustomUserClaims(userRecord.uid, customClaims);
        return {
          ...userRecord,
          ...userData,
        };
      } catch (error) {
        return error;
      }
    }
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      // create new user
      // give new password if not exists
      // @todo: should be random string
      if (!data.password || data.password === "") {
        userData.password = "12345678";
      }

      try {
        const createdUser = await auth.createUser(userData);

        if (createdUser) {
          await auth.setCustomUserClaims(createdUser.uid, customClaims);
          return createdUser;
        }
      } catch (error) {
        return error;
      }
    } else {
      return error;
    }
  }
};

/**
 * Delete firebase users
 *
 * @param {array} uids Array of UID
 */
const deleteUsers = (uids) => {
  auth
    .deleteUsers(uids)
    .then((deleteUsersResult) => {
      console.log(
        `Successfully deleted ${deleteUsersResult.successCount} users`
      );
      console.log(`Failed to delete ${deleteUsersResult.failureCount} users`);
      deleteUsersResult.errors.forEach((err) => {
        console.log(err.error.toJSON());
      });
    })
    .catch((error) => {
      console.log("Error deleting users:", error);
    });
};

module.exports = {
  updateUser,
  deleteUsers,
};
