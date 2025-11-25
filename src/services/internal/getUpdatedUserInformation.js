const AuthenticationError = require("../../../src/commons/exceptions/AuthenticationError");
const NotFoundError = require("../../../src/commons/exceptions/NotFoundError");
const {
  User,
  Employee,
  UserRoleCode,
  PrivilegePrivilegeGroup,
  SocialEmployeeProfile,
  selectQuery,
} = require("../../models");
const mapRoleCodes = require("./auth/mapRoleCodes");

/** use redis, this function gonna always call on middleware */
module.exports = async (user_id, privilegeCode) => {
  const user = await User.findOne({
    attributes: ["user_id", "uid", "role_code", "privilege_group_id"],
    where: { user_id },
    include: [
      {
        model: Employee,
        as: "employee",
        attributes: ["employee_id", "archived_at", "group_id"],
        include: {
          model: SocialEmployeeProfile,
          as: "social_employee_profile",
          attributes: ["social_employee_profile_id"],
        },
      },
      {
        model: UserRoleCode,
        as: "role_codes",
        attributes: ["role_code"],
      },
    ],
  });

  if (!user) {
    throw new NotFoundError("user not found");
  }

  let privileges = [];
  let vendor = {};

  const role_codes = mapRoleCodes(user);

  if (role_codes.includes("VNDR")) {
    vendor = await selectQuery(
      `
      SELECT tvm.vendor_member_id, tvm.vendor_id, tvm.photo_profile, tvm.name FROM tb_vendor_member tvm
      INNER JOIN tb_user tu ON tvm.user_id = tu.user_id AND tu.user_id = :user_id
    `,
      {
        user_id,
      }
    );
  } else {
    if (user?.employee?.archived_at) {
      throw new AuthenticationError("sorry, archived employee unable to login");
    }
    if (privilegeCode) {
      if (user.dataValues.privilege_group_id) {
        const privilegeCodeFilter = privilegeCode
          ? { privilege_code: privilegeCode }
          : {};
        privileges = await PrivilegePrivilegeGroup.findAll({
          attributes: ["privilege_code"],
          where: {
            privilege_group_id: user.dataValues.privilege_group_id,
            ...privilegeCodeFilter,
          },
        });
      }
    }
  }

  return {
    ...user,
    role_code: role_codes,
    vendor: vendor?.[0],
    privileges: privileges.map((e) => e.privilege_code),
  };
};
