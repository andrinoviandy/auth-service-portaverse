/**
 * Censor email address for privacy
 * Format: a***02@gmail.com (first char + stars + last 2 chars)
 * @param {string} email - Email address to censor
 * @returns {string} - Censored email address
 */
const censorEmail = (email) => {
  if (!email) return "";
  const [localPart, domain] = email.split("@");
  if (!domain) return email; // Invalid email format
  if (localPart.length <= 2) {
    return `${localPart}***@${domain}`;
  }
  const firstChar = localPart[0];
  const lastTwoChars = localPart.slice(-2);
  const starCount = Math.max(localPart.length - 3, 3);
  return `${firstChar}${"*".repeat(starCount)}${lastTwoChars}@${domain}`;
};

/**
 * Censor name for privacy
 * Format: S********g P*****o M***i T******l (first char + stars + last char for each word)
 * @param {string} name - Name to censor
 * @returns {string} - Censored name
 */
const censorName = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => {
      if (word.length <= 1) return word;
      const firstChar = word[0];
      const lastChar = word[word.length - 1];
      const starCount = Math.max(word.length - 2, 1);
      return `${firstChar}${"*".repeat(starCount)}${lastChar}`;
    })
    .join(" ");
};

module.exports = {
  censorEmail,
  censorName,
};
