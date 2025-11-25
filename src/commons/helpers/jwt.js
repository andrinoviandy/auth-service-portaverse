/**
 * Helper to encrypt decrypt token
 *
 */

const jwtgen = require("jsonwebtoken");
const key = process.env.JWT_KEY;

function mint(data, expToken) {
  return jwtgen.sign({ ...data, exp: expToken }, key);
}

function check(token) {
  try {
    const decoded = jwtgen.verify(token, key);
    return decoded;
  } catch (err) {
    return undefined;
  }
}

async function checkSso(token) {
  try {
    const decoded = await jwtgen.decode(token);
    return decoded;
  } catch (err) {
    return undefined;
  }
}

module.exports = {
  mint,
  check,
  checkSso,
};
