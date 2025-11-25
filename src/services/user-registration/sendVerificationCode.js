const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const ClientError = require("../../commons/exceptions/ClientError");
const userRegistrationRepository = require("../../repositories/user-registration");
const { UserRegistrationOtp, UserRegistration } = require("../../models");
const { censorEmail } = require("../../commons/helpers/censor");
const { adminAuth } = require("../firebase.admin");

/**
 * Service to send OTP verification code to user's email
 * @param {object} params - Parameters object
 * @param {number} params.userRegistrationId - The user registration ID
 * @param {string} params.email - Optional email to update before sending OTP
 * @param {object} options - Options object
 * @param {object} options.transaction - Sequelize transaction object
 * @returns {object} - Response data
 */
module.exports = async (params = {}, options = {}) => {
  const { userRegistrationId, email } = params;
  const { transaction } = options;

  // Step 1: Get user registration by ID
  let userRegistration = await userRegistrationRepository.getRegistrationById(
    { userRegistrationId },
    { transaction }
  );

  if (!userRegistration) {
    throw new ClientError("Gagal mengirim kode verifikasi");
  }

  // Step 2: Check status
  if (userRegistration.status === "SUBMITTED") {
    throw new ClientError(
      "Permintaan aktivasi akun Anda sedang dalam proses review. Silahkan tunggu konfirmasi dari admin."
    );
  }

  if (userRegistration.status === "ACCEPTED") {
    throw new ClientError(
      "NIPP Pekerja telah terdaftar di Portaverse. Silahkan hubungi admin."
    );
  }

  if (userRegistration.status !== "DRAFT") {
    throw new ClientError(
      "Pengiriman kode verifikasi hanya dapat dilakukan pada tahap pengajuan."
    );
  }

  // Step 2.5: Update email if provided and different
  if (email && email !== userRegistration.email) {
    await UserRegistration.update(
      {
        email: email,
        is_email_verified: false,
      },
      {
        where: {
          user_registration_id: userRegistrationId,
        },
        transaction,
      }
    );

    // Re-get user registration to get updated email
    userRegistration = await userRegistrationRepository.getRegistrationById(
      { userRegistrationId },
      { transaction }
    );
  }

  // Validate email is not already used in Firebase
  const toBeValidatedEmail = userRegistration.email;
  const auth = adminAuth.auth();
  try {
    const existingFirebaseUser = await auth.getUserByEmail(toBeValidatedEmail);

    // If email exists in Firebase and it's not the current user's Firebase account
    if (
      existingFirebaseUser &&
      existingFirebaseUser.uid !== userRegistration.firebase_account_uid
    ) {
      throw new ClientError(
        "Email sudah digunakan oleh pengguna lain. Silahkan hubungi admin."
      );
    }
  } catch (error) {
    // If user not found, that's good - we can use this email
    if (error.code !== "auth/user-not-found") {
      // Re-throw if it's already a ClientError
      if (error instanceof ClientError) {
        throw error;
      }
      // Log other Firebase errors for debugging
      console.error("Firebase error during email validation:", error);
      throw new ClientError(
        "Terjadi kesalahan saat memvalidasi email. Silahkan coba lagi."
      );
    }
  }

  // Step 3: Check if there's an active OTP and deactivate it
  const activeOtp = await userRegistrationRepository.getActiveOtp(
    { userRegistrationId },
    { transaction }
  );

  if (activeOtp) {
    // Deactivate the old OTP by setting expired_at to the past
    await UserRegistrationOtp.update(
      {
        expired_at: new Date(Date.now() - 1000), // Set to 1 second ago
      },
      {
        where: {
          user_registration_otp_id: activeOtp.user_registration_otp_id,
        },
        transaction,
      }
    );
  }

  // Generate new 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash the OTP
  const saltRounds =
    parseInt(process.env.USER_REGISTRATION_SALT_ROUNDS, 10) || 10;
  const hashedOtp = await bcrypt.hash(otpCode, saltRounds);

  // Calculate expiration (3 minutes from now)
  const expiredAt = new Date(Date.now() + 3 * 60 * 1000);
  const sentAt = new Date();

  // Insert new OTP record
  await UserRegistrationOtp.create(
    {
      user_registration_id: userRegistrationId,
      email: userRegistration.email,
      otp_code: hashedOtp,
      expired_at: expiredAt,
      sent_at: sentAt,
      verification_status: "PENDING",
    },
    { transaction }
  );

  // Step 4: Update is_email_verified to false
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

  // Step 5: Send email
  await sendOtpEmail({
    email: userRegistration.email,
    otpCode,
    employeeName: userRegistration.employee_name,
  });

  return {
    message: "Kode verifikasi telah dikirim ke email Anda",
    email: censorEmail(userRegistration.email),
  };
};

/**
 * Send OTP via email using nodemailer
 * @param {object} params - Parameters object
 * @param {string} params.email - Recipient email
 * @param {string} params.otpCode - OTP code (not hashed)
 * @param {string} params.employeeName - Employee name
 */
async function sendOtpEmail(params = {}) {
  const { email, otpCode, employeeName } = params;

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Email content
  const mailOptions = {
    from: process.env.SMTP_USERNAME,
    to: email,
    subject: "Kode OTP Verifikasi Akun Portaverse",
    html: `
      <body style="margin: 0; padding: 0; background-color: #f7f9fc; font-family: Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f9fc; padding: 20px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 30px 20px 20px; text-align: center;">
                    <h2 style="color: #2d89ef; margin: 0; font-size: 20px; font-weight: bold;">
                      🔐 Kode OTP Verifikasi Anda
                    </h2>
                  </td>
                </tr>

                <!-- Logo Section -->
                <tr>
                  <td style="padding: 10px 20px; text-align: center;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" align="center" style="padding: 10px;">
                          <img src="https://obs-portaverse.ilcs.co.id/files/bbb4eee69a1a456e131704e0f824abaa" alt="Logo" width="180" style="max-width: 180px; height: auto;" />
                        </td>
                        <td width="50%" align="center" style="padding: 10px;">
                          <img src="https://obs-portaverse.ilcs.co.id/files/11235d4bb0b393ee8281062047a1bf7e" alt="Logo" width="180" style="max-width: 180px; height: auto;" />
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 20px 40px;">
                    <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 10px;">
                      Halo <strong>${employeeName}</strong>,
                    </p>
                    <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 20px; text-align: center;">
                      Berikut adalah kode OTP Anda untuk verifikasi email pada sistem <strong>PORTAVERSE</strong>:
                    </p>

                    <!-- OTP Code -->
                    <div style="text-align: center; padding: 20px 0;">
                      <div style="display: inline-block; background-color: #2d89ef; color: #ffffff; font-size: 32px; font-weight: bold; padding: 12px 24px; border-radius: 6px; letter-spacing: 4px;">
                        ${otpCode}
                      </div>
                    </div>

                    <!-- Info -->
                    <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 20px 0; text-align: center;">
                      ⏳ Kode ini berlaku sampai <strong>3 menit</strong> dari waktu diterbitkan.
                    </p>
                    <p style="color: #888; font-size: 13px; line-height: 1.6; margin: 0; text-align: center;">
                      Jika Anda tidak meminta kode ini, abaikan email ini.
                    </p>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding: 25px 40px;">
                    <hr style="border: none; border-top: 1px solid #eee; margin: 0;" />
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 0 40px 30px; text-align: center;">
                    <p style="color: #888; font-size: 12px; margin: 0;">
                      <strong>PORTAVERSE | PT Pelabuhan Indonesia (Persero)</strong>
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    `,
  };

  // Send email
  await transporter.sendMail(mailOptions);
}
