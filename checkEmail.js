const registeredUser = require("./registeredUser.json");
const { User } = require("./src/models");
const checkEmail = async () => {
  const success = [];
  const errors = [];

  for (let index = 0; index < registeredUser.length; index++) {
    const element = registeredUser[index];
    try {
      await User.update(
        {
          uid: element.uid,
          email: element.email,
        },
        {
          where: { user_id: element.user_id },
        }
      );
      success.push(element);
    } catch (error) {
      console.log(error);
      errors.push(element);
    }
  }
  console.log(success);
  console.log(errors);
};

module.exports = checkEmail;
