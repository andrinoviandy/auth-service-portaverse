const ClientError = require("../../commons/exceptions/ClientError");
const ValidationError = require("../../commons/exceptions/ValidationError");
const userRegistrationRepository = require("../../repositories/user-registration");
const { UserRegistration, UserRegistrationLog } = require("../../models");
const { adminAuth } = require("../firebase.admin");
const uploadToRepositorySvc = require("./uploadToRepository");

/**
 * Service to submit user registration request with file uploads
 * @param {object} params - Parameters object
 * @param {number} params.userRegistrationId - The user registration ID
 * @param {object} params.files - Files object containing profile_picture, id_card, and decree
 * @param {object} options - Options object
 * @param {object} options.transaction - Sequelize transaction object
 * @returns {object} - Submission result
 */
module.exports = async (params = {}, options = {}) => {
  const { userRegistrationId, files } = params;
  const { transaction } = options;

  // Step 1: Validate required files
  if (!files || !files.profile_picture || !files.id_card || !files.decree) {
    throw new ValidationError(
      "Semua file wajib diupload (profile_picture, id_card, decree)"
    );
  }

  // Step 2: Validate file types
  const profilePicture = files.profile_picture[0];
  const idCard = files.id_card[0];
  const decree = files.decree[0];

  // Validate profile_picture (PNG only)
  if (!profilePicture.mimetype.includes("png")) {
    throw new ValidationError("Profile picture harus berformat PNG");
  }

  // Validate id_card (PNG or JPG)
  if (
    !idCard.mimetype.includes("png") &&
    !idCard.mimetype.includes("jpeg") &&
    !idCard.mimetype.includes("jpg")
  ) {
    throw new ValidationError("ID Card harus berformat PNG atau JPG");
  }

  // Validate decree (PDF only)
  if (!decree.mimetype.includes("pdf")) {
    throw new ValidationError("Decree harus berformat PDF");
  }

  // Step 3: Get user registration by ID
  const userRegistration = await userRegistrationRepository.getRegistrationById(
    { userRegistrationId },
    { transaction }
  );

  if (!userRegistration) {
    throw new ClientError("Data registrasi tidak ditemukan");
  }

  const { email, is_email_verified, firebase_account_uid, status } =
    userRegistration;

  // Step 4: Check if email is verified
  if (!is_email_verified) {
    throw new ClientError(
      "Email belum diverifikasi. Silahkan verifikasi email terlebih dahulu."
    );
  }

  // Step 5: Check if status is DRAFT
  if (status !== "DRAFT") {
    throw new ClientError(
      "Pengajuan hanya dapat dilakukan pada tahap draft. Status saat ini: " +
        status
    );
  }

  // Step 6: Verify OTP success from database
  const successOtp = await userRegistrationRepository.getSuccessOtp(
    { userRegistrationId, email },
    { transaction }
  );

  if (!successOtp) {
    throw new ClientError(
      "Email belum diverifikasi. Silahkan verifikasi email terlebih dahulu."
    );
  }

  // Step 7: Confirm firebase_account_uid is filled
  if (!firebase_account_uid) {
    throw new ClientError(
      "Firebase account belum dibuat. Silahkan buat password terlebih dahulu."
    );
  }

  // Step 8: Verify Firebase user and match with database
  const auth = adminAuth.auth();
  let firebaseUser;

  try {
    firebaseUser = await auth.getUser(firebase_account_uid);
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      throw new ClientError(
        "Firebase account tidak ditemukan. Silahkan ajukan ulang registrasi."
      );
    }
    throw error;
  }

  // Step 9: Verify email match between database and Firebase
  if (firebaseUser.email !== email) {
    throw new ClientError(
      "Email tidak sesuai dengan Firebase account. Silahkan ajukan ulang registrasi."
    );
  }

  // Step 10: Upload files to repository service
  let profilePictureFileId, idCardFileId, decreeFileId;

  try {
    // Upload profile picture
    const profilePictureRes = await uploadToRepositorySvc(
      profilePicture.buffer,
      profilePicture.originalname
    );
    profilePictureFileId = profilePictureRes?.file_id;

    if (!profilePictureFileId) {
      throw new Error("Failed to get file_id for profile picture");
    }

    // Upload id card
    const idCardRes = await uploadToRepositorySvc(
      idCard.buffer,
      idCard.originalname
    );
    idCardFileId = idCardRes?.file_id;

    if (!idCardFileId) {
      throw new Error("Failed to get file_id for id card");
    }

    // Upload decree
    const decreeRes = await uploadToRepositorySvc(
      decree.buffer,
      decree.originalname
    );
    decreeFileId = decreeRes?.file_id;

    if (!decreeFileId) {
      throw new Error("Failed to get file_id for decree");
    }
  } catch (error) {
    console.error("File upload error:", error);
    throw new ClientError(
      "Gagal mengupload file. Silahkan coba lagi. " +
        (error.message || "Unknown error")
    );
  }

  // Step 11: Update UserRegistration with file IDs and status
  const currentTimestamp = new Date();

  await UserRegistration.update(
    {
      profile_picture_file_id: profilePictureFileId,
      id_card_file_id: idCardFileId,
      sk_file_id: decreeFileId,
      status: "SUBMITTED",
      submitted_at: currentTimestamp,
      last_step: 4, // Assuming step 4 is submission step
    },
    {
      where: {
        user_registration_id: userRegistrationId,
      },
      transaction,
    }
  );

  // Step 12: Get updated user registration data
  const updatedUserRegistration =
    await userRegistrationRepository.getRegistrationById(
      { userRegistrationId },
      { transaction }
    );

  // Step 13: Insert into UserRegistrationLog (log all fields from UserRegistration)
  await UserRegistrationLog.create(
    {
      user_registration_id: updatedUserRegistration.user_registration_id,
      employee_number: updatedUserRegistration.employee_number,
      employee_name: updatedUserRegistration.employee_name,
      email: updatedUserRegistration.email,
      work_unit: updatedUserRegistration.work_unit,
      employee_status: updatedUserRegistration.employee_status,
      superior_employee_number:
        updatedUserRegistration.superior_employee_number,
      superior_employee_name: updatedUserRegistration.superior_employee_name,
      superior_position_name: updatedUserRegistration.superior_position_name,
      firebase_account_uid: updatedUserRegistration.firebase_account_uid,
      status: updatedUserRegistration.status,
      last_step: updatedUserRegistration.last_step,
      profile_picture_file_id: updatedUserRegistration.profile_picture_file_id,
      id_card_file_id: updatedUserRegistration.id_card_file_id,
      sk_file_id: updatedUserRegistration.sk_file_id,
      phone_number: updatedUserRegistration.phone_number,
      birthdate: updatedUserRegistration.birthdate,
      birthplace: updatedUserRegistration.birthplace,
      rejected_at: updatedUserRegistration.rejected_at,
      rejected_by: updatedUserRegistration.rejected_by,
      rejection_notes: updatedUserRegistration.rejection_notes,
      accepted_at: updatedUserRegistration.accepted_at,
      accepted_by: updatedUserRegistration.accepted_by,
      submitted_at: updatedUserRegistration.submitted_at,
      created_user_id: null, // User submitting their own request (not from admin)
      created_employee_id: null, // Can be populated if needed
    },
    { transaction }
  );

  return {
    success: true,
    message: "Pengajuan berhasil disubmit",
    data: {
      user_registration_id: userRegistrationId,
      status: "SUBMITTED",
      submitted_at: currentTimestamp,
      profile_picture_file_id: profilePictureFileId,
      id_card_file_id: idCardFileId,
      sk_file_id: decreeFileId,
    },
  };
};
