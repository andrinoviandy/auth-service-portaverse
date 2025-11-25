const ClientError = require("../../commons/exceptions/ClientError");
const ValidationError = require("../../commons/exceptions/ValidationError");
const userRegistrationRepository = require("../../repositories/user-registration");
const { UserRegistration } = require("../../models");
const { adminAuth } = require("../firebase.admin");

/**
 * Validate password requirements
 * @param {string} password - Password to validate
 * @returns {object} - Validation result
 */
const validatePassword = (password) => {
  const errors = [];

  // Minimal 12 karakter
  if (password.length < 12) {
    errors.push("Password harus minimal 12 karakter");
  }

  // Huruf kapital
  if (!/[A-Z]/.test(password)) {
    errors.push("Password harus mengandung huruf kapital");
  }

  // Angka
  if (!/[0-9]/.test(password)) {
    errors.push("Password harus mengandung angka");
  }

  // Simbol atau karakter spesial (!, @, $, %, ^, &, *, +, #)
  if (!/[!@$%^&*+#]/.test(password)) {
    errors.push(
      "Password harus mengandung simbol atau karakter spesial (!, @, $, %, ^, &, *, +, #)"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Service to create password for user registration
 * @param {object} params - Parameters object
 * @param {number} params.userRegistrationId - The user registration ID
 * @param {string} params.password - The password to set
 * @param {object} options - Options object
 * @param {object} options.transaction - Sequelize transaction object
 * @returns {object} - Creation result
 */
module.exports = async (params = {}, options = {}) => {
  const { userRegistrationId, password } = params;
  const { transaction } = options;

  // Step 1: Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    throw new ValidationError(passwordValidation.errors.join(", "));
  }

  // Step 2: Get user registration by ID
  const userRegistration = await userRegistrationRepository.getRegistrationById(
    { userRegistrationId },
    { transaction }
  );

  if (!userRegistration) {
    throw new ClientError("Data registrasi tidak ditemukan");
  }

  const { email, is_email_verified, firebase_account_uid, status } =
    userRegistration;

  // Step 3: Check if email is verified
  if (!is_email_verified) {
    throw new ClientError(
      "Email belum diverifikasi. Silahkan verifikasi email terlebih dahulu."
    );
  }

  if (status !== "DRAFT") {
    throw new ClientError(
      "Pembuatan password hanya dapat dilakukan pada tahap pengajuan."
    );
  }

  // Step 4: Verify OTP success from database
  const successOtp = await userRegistrationRepository.getSuccessOtp(
    { userRegistrationId, email },
    { transaction }
  );

  if (!successOtp) {
    throw new ClientError(
      "Email belum diverifikasi. Silahkan verifikasi email terlebih dahulu."
    );
  }

  const auth = adminAuth.auth();

  try {
    // Step 5: Case 1 - Check if email already exists in Firebase
    // (untuk menghindari penyalahgunaan fitur untuk hacking)
    let existingUser = null;
    try {
      existingUser = await auth.getUserByEmail(email);
    } catch (error) {
      // If user not found, existingUser will remain null
      if (error.code !== "auth/user-not-found") {
        throw error;
      }
    }

    // If user exists in Firebase but firebase_account_uid is empty in DB
    // This could be a security issue - someone trying to hijack an existing account
    if (existingUser && !firebase_account_uid) {
      // Throw error untuk menghindari penyalahgunaan fitur untuk hacking
      throw new ClientError("Email sudah digunakan. Silahkan hubungi admin.");
    }

    // Step 6: Case 2 - User registration already has firebase_account_uid
    if (firebase_account_uid) {
      // Update existing Firebase user
      // Verify that the UID matches the existing user (security check)
      if (existingUser && existingUser.uid !== firebase_account_uid) {
        // Throw error untuk menghindari penyalahgunaan fitur untuk hacking
        throw new ClientError(
          "Email sudah digunakan oleh pengguna lain. Silahkan hubungi admin."
        );
      }

      // Update Firebase user with new password and ensure disabled status
      await auth.updateUser(firebase_account_uid, {
        email: email,
        password: password,
        disabled: true, // Keep the account disabled until admin approval
      });

      return {
        success: true,
        message: "Password berhasil diperbarui",
        firebase_uid: firebase_account_uid,
      };
    }

    // Step 7: Create new Firebase user if firebase_account_uid doesn't exist
    const newFirebaseUser = await auth.createUser({
      email: email,
      password: password,
      disabled: true, // Account remains disabled until admin approval
      emailVerified: true, // Email is already verified through OTP
    });

    // Step 8: Update UserRegistration with Firebase UID
    await UserRegistration.update(
      {
        firebase_account_uid: newFirebaseUser.uid,
      },
      {
        where: {
          user_registration_id: userRegistrationId,
        },
        transaction,
      }
    );

    return {
      success: true,
      message: "Password berhasil dibuat",
      firebase_uid: newFirebaseUser.uid,
    };
  } catch (error) {
    // Handle Firebase errors
    if (error.code === "auth/email-already-exists") {
      // Throw error untuk menghindari penyalahgunaan fitur untuk hacking
      throw new ClientError("Email sudah digunakan. Silahkan hubungi admin.");
    }

    // Re-throw if it's already a ClientError or ValidationError
    if (error instanceof ClientError || error instanceof ValidationError) {
      throw error;
    }

    // Log the error for debugging
    console.error("Firebase error during password creation:", error);
    throw new ClientError(
      "Terjadi kesalahan saat membuat password. Silahkan coba lagi."
    );
  }
};
