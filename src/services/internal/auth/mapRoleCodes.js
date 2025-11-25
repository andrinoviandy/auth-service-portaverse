const mapRoleCodes = (user) => {
  // MAP ROLE CODES INTO ROLE_CODES
  let role_codes = [];
  role_codes = user.role_codes.reduce((arr, e) => {
    arr.push(e?.dataValues?.role_code);
    return arr;
  }, []);

  // ADD MAIN ROLE CODE TO THE ARRAY
  role_codes.push(user.role_code);

  // REMOVE DUPLICATE
  role_codes = Array.from(new Set(role_codes));

  return role_codes;
};

module.exports = mapRoleCodes;
