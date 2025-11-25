/**
 *
 * @param {Array} array
 * @param {String} keyName
 * @param {String('Object' || 'Array')} type
 * @returns hashTable with the keys and the values
 */
module.exports = (array, keyName, type = "Object") => {
  const table = {};
  array?.forEach((e) => {
    if (type === "Array") {
      if (table[e[keyName]]) {
        table[e[keyName]] = [...table[e[keyName]], e];
      } else {
        table[e[keyName]] = [e];
      }
    } else {
      if (!table[e[keyName]]) {
        table[e[keyName]] = e;
      }
    }
  });

  return table;
};
