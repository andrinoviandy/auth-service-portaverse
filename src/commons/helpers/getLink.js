module.exports = (fromDBLinkField, type = "user", ACL = "private") => {
  const userDefault =
      `${process.env.OBS_GET_ENDPOINT}/files/default-user.jpeg`;
  const imageDefault =
      `${process.env.OBS_GET_ENDPOINT}/files/default.jpg`;

  if (!fromDBLinkField) {
    switch (type) {
      case "user":
        return userDefault;
      case "file_uri":
        return null;
      default:
        return imageDefault;
    }
  }

  if (ACL === "public-read") {
    return `${process.env.OBS_GET_ENDPOINT}/${fromDBLinkField}`;
  }

  if (ACL === "private") {
    if (fromDBLinkField){
      return `${process.env.OBS_GET_ENDPOINT}/${fromDBLinkField}`;
    }
    switch (type) {
      case "user":
        return userDefault;
      default:
        return imageDefault;
    }
  }
};
