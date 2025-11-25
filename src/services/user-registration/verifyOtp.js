const bcrypt = require("bcrypt");
const ClientError = require("../../commons/exceptions/ClientError");
const userRegistrationRepository = require("../../repositories/user-registration");
const { UserRegistrationOtp, UserRegistration } = require("../../models");

/**
 * Service to verify OTP code
 * @param {object} params - Parameters object
 * @param {number} params.userRegistrationId - The user registration ID
 * @param {string} params.verificationCode - The OTP code to verify
 * @param {object} options - Options object
 * @param {object} options.transaction - Sequelize transaction object
 * @returns {object} - Verification result
 */
module.exports = async (params = {}, options = {}) => {
  const { userRegistrationId, verificationCode } = params;
  const { transaction } = options;

  // Step 1: Get user registration by ID
  const userRegistration = await userRegistrationRepository.getRegistrationById(
    { userRegistrationId },
    { transaction }
  );

  if (!userRegistration) {
    throw new ClientError("Data registrasi tidak ditemukan");
  }

  if (userRegistration.status !== "DRAFT") {
    throw new ClientError(
      "Verifikasi kode hanya dapat dilakukan pada tahap pengajuan."
    );
  }

  // Step 2: Get active OTP based on user registration ID
  const activeOtp = await userRegistrationRepository.getActiveOtp(
    { userRegistrationId },
    { transaction }
  );

  if (!activeOtp) {
    throw new ClientError(
      "Kode verifikasi tidak ditemukan atau sudah kadaluarsa"
    );
  }

  // Step 3: Compare email from tb_user_registration with email on the active OTP
  if (userRegistration.email !== activeOtp.email) {
    throw new ClientError(
      "Email tidak sesuai dengan data registrasi. Silahkan kirim ulang kode verifikasi."
    );
  }

  // Step 4: Compare the hash of the received verification code with the active OTP
  const isOtpValid = await bcrypt.compare(verificationCode, activeOtp.otp_code);

  let verificationResult = {
    verified: false,
    message: "",
  };

  if (!isOtpValid) {
    // Step 5a: If failed, update is_email_verified to false but don't invalidate the OTP
    await UserRegistration.update(
      {
        is_email_verified: false,
      },
      {
        where: {
          user_registration_id: userRegistrationId,
        },
        transaction,
      }
    );

    verificationResult = {
      verified: false,
      message: "Kode yang Anda tulis tidak tepat.",
    };
  } else {
    // Step 5b: If success, update the status to SUCCESS
    await UserRegistrationOtp.update(
      {
        verification_status: "SUCCESS",
      },
      {
        where: {
          user_registration_otp_id: activeOtp.user_registration_otp_id,
        },
        transaction,
      }
    );

    // Update is_email_verified to true
    await UserRegistration.update(
      {
        is_email_verified: true,
      },
      {
        where: {
          user_registration_id: userRegistrationId,
        },
        transaction,
      }
    );

    verificationResult = {
      verified: true,
      message: "Email berhasil diverifikasi",
    };
  }

  // Step 6: Return the verification result
  return verificationResult;
};
