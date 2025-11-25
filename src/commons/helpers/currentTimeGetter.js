const currentTimeGetter = () => {
  const nowDate = new Date();
  const year = nowDate.getFullYear();
  const month =
    nowDate.getMonth() < 10
      ? "0" + +(nowDate.getMonth() + 1)
      : +(nowDate.getMonth() + 1);
  const date =
    nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate.getDate();
  const hours =
    nowDate.getHours() < 10 ? "0" + nowDate.getHours() : nowDate.getHours();
  const minutes =
    nowDate.getMinutes() < 10
      ? "0" + nowDate.getMinutes()
      : nowDate.getMinutes();
  const seconds =
    nowDate.getSeconds() < 10
      ? "0" + nowDate.getSeconds()
      : nowDate.getSeconds();
  return (
    year +
    "-" +
    month +
    "-" +
    date +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds
  );
};

module.exports = {
  currentTimeGetter,
};
