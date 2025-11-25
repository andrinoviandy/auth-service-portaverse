module.exports = (item) =>
  (Array.isArray(item) && !item?.length) || (!Array.isArray(item) && !item);
