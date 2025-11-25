const { HubBase } = require("../hub");
const { Readable } = require("stream");
const FormData = require("form-data");

/**
 * Upload file to repository service
 * @param {Buffer} fileBuffer - File buffer to upload
 * @param {string} filename - Filename with extension
 * @returns {object} - Upload result with file_id
 */
const uploadToRepositorySvc = async (fileBuffer, filename) => {
  const form = new FormData();
  const stream = Readable.from(fileBuffer);
  form.append("file", stream, { filename });

  try {
    const RepoService = new HubBase("REPO_SERVICES");

    const res = await RepoService.requestTo({
      endpoint: `/file`,
      data: form,
      method: "POST",
      headers: {
        ...form.getHeaders(),
      },
      configs: {
        maxBodyLength: Infinity,
      },
    });

    return res.data?.data;
  } catch (error) {
    console.error("Upload failed:", error.response?.data || error.message);
    throw error;
  }
};

module.exports = uploadToRepositorySvc;
