const { firebaseAdmin } = require("../");
const { firebaseauth, firebaseappauth } = firebaseAdmin;
const { User, Sequelize, Employee } = require("../../models");
const { adminAuth } = require("../firebase.admin");

module.exports = async (emails) => {
  // const errors = [];
  while (true) {
    try {
      const emailFilters = emails?.length
        ? { email: emails }
        : { email: { [Sequelize.Op.not]: null } };

      const unregisteredUsers = await Employee.findOne({
        attributes: ["employee_number", "employee_id"],
        include: {
          where: {
            uid: { [Sequelize.Op.ne]: null },
            has_update_password_nipp: { [Sequelize.Op.eq]: null },
            // ...emailFilters,
          },
          model: User,
          as: "user",
          attributes: ["email", "uid", "user_id", "has_update_password_nipp"],
        },
        order: [["employee_number", "ASC"]],
      });

      // console.log(unregisteredUsers.length);

      // for (let i = 0; i < unregisteredUsers.length; i++) {
      // const password = `kms-default-password-${new Date().getTime()}`;
      // const userCredential = await firebaseauth.createUserWithEmailAndPassword(
      //   firebaseappauth,
      //   unregisteredUsers[i].email,
      //   password
      // );
      // unregisteredUsers[i].uid = userCredential.user.uid;
      // await unregisteredUsers[i].save();

      // Send email password reset
      // await firebaseauth.sendPasswordResetEmail(
      //   firebaseappauth,
      //   unregisteredUsers.email
      // );
      // change password

      // console.log(unregisteredUsers);
      console.log(unregisteredUsers.user.uid);
      console.log(unregisteredUsers.employee_number);
      await adminAuth.auth().updateUser(unregisteredUsers.user.uid, {
        password: unregisteredUsers.employee_number,
      });
      unregisteredUsers.user.has_update_password_nipp = 1;
      await unregisteredUsers.user.save();
    } catch (error) {
      console.log(error);
      // errors.push({ email: unregisteredUsers[i].email, error });
    }
    // / / }
  }
};
