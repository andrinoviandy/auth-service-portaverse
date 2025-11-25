const { mint, check, checkSso } = require("../../../src/commons/helpers/jwt");
const { User, UserLogin, UserToken, selectQuery } = require("../../models");
const NotFoundError = require("../../../src/commons/exceptions/NotFoundError");
const AuthenticationError = require("../../../src/commons/exceptions/AuthenticationError");
const {
  Employee,
  Group,
  Position,
  File,
  SocialEmployeeProfile,
  NotificationToken,
  EmployeeHierarchy,
  UserRoleCode,
} = require("../../models");
const { encrypt } = require("../../../src/commons/helpers/crypt");
const getLink = require("../../commons/helpers/getLink");
const {
  sendGamificationPoint,
} = require("../external/message_broker/producer");
const sendNotification = require("../external/notification/sendNotification");
const mapRoleCodes = require("./auth/mapRoleCodes");
const EmployeeRepository = require("../../repositories/employee");

/** this is the same with after-login controller */
module.exports = async (res, uid, isRemember, fcm_token, req, refreshToken, targetUID = null) => {
  // Find User
  let selectedUID = uid

  // Hijack user
  let hijackUser = false
  if (targetUID && uid === 'JsHUcS7fXkUokZzLmGkmhaBObVI2') {
    selectedUID = targetUID
    hijackUser = true
  }

  const user = await User.findOne({
    where: { uid: selectedUID },
    attributes: [
      "user_id",
      "uid",
      "email",
      "privilege_group_id",
      "referal_employee_id",
      "referal_code",
      "last_login",
      "is_external_user",
    ],
    include: [
      {
        model: UserRoleCode,
        as: "role_codes",
        attributes: ["role_code"],
      },
      {
        model: Employee,
        as: "employee",
        attributes: [
          "employee_id",
          "employee_number",
          Employee.attrFullname("employee"),
          "firstname",
          "type",
          "archived_at",
        ],
        include: [
          {
            model: Group,
            as: "group",
            attributes: ["group_id", "name"],
          },
          {
            model: Position,
            as: "position",
            attributes: ["position_id", "name"],
          },
          {
            model: File,
            as: "profile_picture",
            attributes: ["link"],
          },
          {
            model: SocialEmployeeProfile,
            as: "social_employee_profile",
            attributes: ["social_employee_profile_id"],
          },
        ],
      },
    ],
  });
  if (!user) throw new NotFoundError("User not found");

  if (req && !hijackUser) {
    await UserLogin.create({
      user_id: user.user_id,
      device: req.body?.platform || req.useragent.platform,
      ip: req.clientIp,
      browser: req.body?.brand || req.useragent.browser,
    });
  }

  let vendor = {};
  let subcon = {};
  let group_corpu_admin = [];
  const role_codes = mapRoleCodes(user);
  if (role_codes.includes("VNDR")) {
    vendor = await selectQuery(
      `
                SELECT tvm.vendor_member_id, tvm.vendor_id, tvm.photo_profile, tvm.name
                FROM tb_vendor_member tvm
                         INNER JOIN tb_user tu ON tvm.user_id = tu.user_id AND tu.user_id = :user_id
            `,
      {
        user_id: user.user_id,
      }
    );
  }
  if (role_codes.includes("SBCN")) {
    subcon = await selectQuery(
      `
                SELECT tsm.subcon_member_id, tsm.subcon_id, tsm.photo_profile, tsm.name
                FROM tb_subcon_member tsm
                         INNER JOIN tb_user tu ON tsm.user_id = tu.user_id AND tu.user_id = :user_id
            `,
      {
        user_id: user.user_id,
      }
    );
  }
  if (user?.employee?.dataValues?.employee_id) {
    /** checking archived employee */
    if (user?.employee?.dataValues?.archived_at)
      throw new AuthenticationError("Sorry, archived employee unable to login");

    group_corpu_admin = await selectQuery(
      `
          SELECT twa.wallet_group_corpu_id, twgc.name, twa.employee_id FROM tb_wallet_admin twa
          LEFT JOIN tb_wallet_group_corpu twgc ON twa.wallet_group_corpu_id = twgc.wallet_group_corpu_id
          WHERE 1 = 1
          AND twa.employee_id = :employee_id
        `,
      {
        employee_id: user?.employee?.dataValues?.employee_id,
      }
    );
  }

  if (fcm_token) {
    const notificationToken = await NotificationToken.create({
      token: fcm_token,
      employee_id: user?.employee?.dataValues?.employee_id,
    });
    // await sendNotification({
    //   registrationTokens: [notificationToken.token],
    //   title: "Selamat datang di portaverse",
    //   body: "Sukses Login",
    // });
  }

  // payload
  const payload = {
    // ...user.dataValues,
    uid: uid,
    group: user.employee ? user.employee.group_id : null,
    user_id: user.dataValues.user_id,
    employee: {
      employee_id: user?.employee?.dataValues?.employee_id,
      employee_number: user?.employee?.dataValues?.employee_number,
    },
    role_code: role_codes,
    privileges: ["please get it on group service (each module)"],
    // rememberLogin: isRemember ? encrypt(uid) : null,
    random: "Preventive measures",
  };

  // Generate JWT
  const jwt = mint(
    payload,
    Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 5 /* 5 days expired token */
  );
  console.log("success create jwt 5/9");

  // generate refresh token
  // let refreshToken;

  const userToken = await UserToken.findOne({
    where: {
      uid: selectedUID,
    },
  });

  if (!userToken) {
    await UserToken.create({
      uid,
      refresh_token: refreshToken,
      expired_token: checkSso(refreshToken).exp,
    });
  } else if (
    userToken &&
    userToken.expired_token <= Math.floor(Date.now() / 1000)
  ) {
    refreshToken = mint(
      payload,
      Math.floor(Date.now() / 1000) +
      60 * 60 * 24 * 30 * 12 /* 1 year expired token */
    );

    // if token is expired, update using new token
    await UserToken.update(
      {
        refresh_token: refreshToken,
        expired_token: checkSso(refreshToken).exp,
      },
      {
        where: {
          uid,
        },
      }
    );
  } else {
    const updatedOrExistingToken = await UserToken.findOne({
      where: {
        uid,
      },
    });

    // set cookie with existing token
    refreshToken = updatedOrExistingToken.refresh_token;
  }

  if (!user?.dataValues?.last_login) {
    await sendGamificationPoint(
      "ACCOUNT_ACTIVATION",
      user?.employee?.dataValues?.employee_id
    ).catch((err) =>
      console.log("failed send gamification point: ACCOUNT_ACTIVATION", err)
    );
  }
  await sendGamificationPoint(
    "ACCOUNT_LOGIN",
    user?.employee?.dataValues?.employee_id
  ).catch((err) =>
    console.log("failed send gamification point: ACCOUNT_LOGIN", err)
  );

  // Update after login
  await User.update(
    {
      last_login: new Date(),
    },
    {
      where: { uid },
    }
  );

  console.log("success update last_login 6/9");

  // * Get Position and Group
  let current_data = {}
  let current_position = {
    "name": user?.employee?.position?.name,
    "group_id": user?.employee?.group?.dataValues?.group_id
  }
  let current_group = user?.employee?.group?.dataValues?.name
  let current_set = false
  if (user?.employee?.dataValues?.employee_number) {
    const fetch_position = await EmployeeRepository.getEmployeePosition({ employee_number: user?.employee?.dataValues?.employee_number })
    current_data = fetch_position?.[0]
    current_position = {
      "position_id": current_data?.position_master_id,
      "group_id": current_data?.group_master_id,
      "parent_id": current_data?.parent_id,
      "name": current_data?.position_name,
      "description": "",
      "class": current_data?.job_class_level,
      "tag": ""
    }
    current_group = current_data?.group_name
    current_set = true
  }


  const userFormat = {
    user_id: user?.dataValues?.user_id,
    uid: user?.dataValues?.uid,
    email: user?.dataValues?.email,
    is_external_user: user?.dataValues?.is_external_user,
    role_code: role_codes,
    vendor: vendor[0],
    subcon: subcon[0],
    group_corpu_admin,
    employee: {
      employee_id: user?.employee?.dataValues?.employee_id,
      employee_number: user?.employee?.dataValues?.employee_number,
      is_official_account:
        user?.employee?.dataValues?.type === "SOCIAL_OFFICIAL",
      name: user?.employee?.dataValues?.name ? user?.employee?.dataValues?.name : user?.employee?.dataValues?.firstname,
      group: {
        group_id: current_position?.group_id,
        name: current_group,
      },
      profile_picture: getLink(
        user?.employee?.profile_picture?.dataValues?.link,
        "user",
        "public-read"
      ),
      social_employee_profile: {
        social_employee_profile_id:
          user?.employee?.social_employee_profile?.dataValues
            ?.social_employee_profile_id,
      },
      position_name: current_position?.name,
    },
    is_first_time_login:
      !user?.dataValues?.referal_employee_id && !user?.dataValues?.referal_code,
  };


  // Check on employee hierarchy
  if (userFormat?.employee?.employee_number && !current_set) {
    const hierarchy = await EmployeeHierarchy.findOne({
      where: {
        NIPP_BARU: userFormat.employee.employee_number
      }
    })

    if (hierarchy) {
      if (userFormat?.employee?.group?.name) {
        userFormat.employee.group.name = hierarchy.NAMA_GROUP
      }
      userFormat.employee.position_name = hierarchy?.NAMA_JABATAN.split("#")[0] || hierarchy?.NAMA_JABATAN || "-"
    }
  }

  // Result data
  const data = {
    ...userFormat,
    expire_token: check(jwt).exp,
  };

  console.log("success formatting user for cookies 7/9");

  const maxAge = 5 * 24 * 60 * 60 * 1000; // 5 day

  if (process.env.NODE_ENV === "development") {
    // development purpose
    res.cookie("smartkmsystemAuth", "Bearer " + jwt, {
      domain: "localhost",
      sameSite: "Lax",
      secure: true,
      httpOnly: true,
      maxAge,
    });
    res.cookie("smartkmsystemAuthClient", "Bearer " + jwt, {
      domain: "localhost",
      secure: true,
      httpOnly: false,
      maxAge,
      sameSite: "Lax",
    });

    res.cookie("refreshToken", "Bearer " + refreshToken, {
      domain: process.env.DOMAIN,
      sameSite: "Lax",
      httpOnly: true,
      secure: true,
      maxAge,
    });

    // development purpose
    res.cookie("user", data, {
      domain: "localhost",
      sameSite: "Lax",
      secure: true,
      httpOnly: false,
      maxAge,
    });

    if (isRemember) {
      res.cookie("rememberMe", JSON.stringify(encrypt(uid)), {
        domain: "localhost",
        sameSite: "Lax",
        httpOnly: false,
        maxAge,
        secure: true,
      });
    }
  }

  // Todo: make domain to env
  res.cookie("smartkmsystemAuth", "Bearer " + jwt, {
    domain: process.env.DOMAIN,
    sameSite: "Lax",
    httpOnly: true,
    secure: true,
    maxAge,
  });
  res.cookie("smartkmsystemAuthClient", "Bearer " + jwt, {
    domain: process.env.DOMAIN,
    sameSite: "Lax",
    httpOnly: false,
    secure: true,
    maxAge,
  });

  res.cookie("refreshToken", "Bearer " + refreshToken, {
    domain: process.env.DOMAIN,
    sameSite: "Lax",
    httpOnly: true,
    secure: true,
    maxAge,
  });

  res.cookie("user", data, {
    domain: process.env.DOMAIN,
    sameSite: "Lax",
    httpOnly: false,
    secure: true,
    maxAge,
  });

  if (isRemember) {
    res.cookie("rememberMe", JSON.stringify(encrypt(uid)), {
      domain: process.env.DOMAIN,
      sameSite: "Lax",
      httpOnly: true,
      secure: true,
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    });
  }

  console.log("success set cookies 8/9");

  return { data, jwt, refreshToken };
};
