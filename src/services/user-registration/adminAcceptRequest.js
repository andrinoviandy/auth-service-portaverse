const nodemailer = require("nodemailer");
const ClientError = require("../../commons/exceptions/ClientError");
const userRegistrationRepository = require("../../repositories/user-registration");
const { syncAndAutoApproveEmployee } = require("../mdm");
const {
  UserRegistration,
  UserRegistrationLog,
  User,
  Employee,
  UserRoleCode,
} = require("../../models");
const { adminAuth } = require("../firebase.admin");

/**
 * Service to accept user registration request by admin
 * @param {object} params - Parameters object
 * @param {number} params.userRegistrationId - The user registration ID
 * @param {number} params.acceptedBy - User ID of the admin who accepted
 * @param {number} params.acceptedByEmployeeId - Employee ID of the admin who accepted
 * @param {object} options - Options object
 * @param {object} options.transaction - Sequelize transaction object
 * @returns {object} - Acceptance result
 */
module.exports = async (params = {}, options = {}) => {
  const { userRegistrationId, acceptedBy } = params;
  const { transaction } = options;

  // Step 1: Get user registration by ID
  const userRegistration = await userRegistrationRepository.getRegistrationById(
    { userRegistrationId },
    { transaction }
  );

  if (!userRegistration) {
    throw new ClientError("Data registrasi tidak ditemukan");
  }

  // Step 2: Verify if the status is SUBMITTED
  if (userRegistration.status !== "SUBMITTED") {
    throw new ClientError(
      `Penerimaan hanya dapat dilakukan pada status SUBMITTED. Status saat ini: ${userRegistration.status}`
    );
  }

  // Step 3: Check if email is verified
  if (!userRegistration.is_email_verified) {
    throw new ClientError(
      "Email belum terverifikasi. Tidak dapat menerima permintaan registrasi."
    );
  }

  // Step 4: Check if firebase_account_uid exists in DB
  if (!userRegistration.firebase_account_uid) {
    throw new ClientError("Firebase UID tidak ditemukan di database.");
  }

  // Step 5: Check if firebase account exists in Firebase
  let firebaseUser;
  try {
    firebaseUser = await adminAuth
      .auth()
      .getUser(userRegistration.firebase_account_uid);
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      throw new ClientError("Akun Firebase tidak ditemukan.");
    }
    throw new ClientError(`Error saat mengakses Firebase: ${error.message}`);
  }

  // Step 6: Check if firebase account is disabled, then enable it
  if (firebaseUser.disabled) {
    try {
      await adminAuth.auth().updateUser(userRegistration.firebase_account_uid, {
        disabled: false,
      });
    } catch (error) {
      throw new ClientError(
        `Gagal mengaktifkan akun Firebase: ${error.message}`
      );
    }
  }

  // Step 7: Check if user already exists in tb_user with this email or employee_number
  const existingUser = await User.findOne({
    where: {
      email: userRegistration.email,
    },
    transaction,
  });

  if (existingUser) {
    throw new ClientError(
      "User dengan email tersebut sudah terdaftar di sistem."
    );
  }

  // Step 8: Create User in tb_user
  const newUser = await User.create(
    {
      uid: userRegistration.firebase_account_uid,
      role_code: "USER",
      email: userRegistration.email,
      phone_number: userRegistration.phone_number,
      is_email_otp_required: 1,
    },
    { transaction }
  );

  // Step 9: Create Employee in tb_employee
  const newEmployee = await Employee.create(
    {
      user_id: newUser.user_id,
      file_id: userRegistration.profile_picture_file_id, // Profile picture as file_id
      employee_number: userRegistration.employee_number,
      firstname: userRegistration.employee_name,
      middlename: null,
      lastname: null,
      status_worker: userRegistration.employee_status,
      work_unit: userRegistration.work_unit,
      created_by: acceptedBy,
    },
    { transaction }
  );

  // Step 10: Create UserRoleCode entry with role code "USER"
  await UserRoleCode.create(
    {
      user_id: newUser.user_id,
      role_code: "USER",
    },
    { transaction }
  );

  // Step 11: Update UserRegistration status to ACCEPTED
  const acceptedAt = new Date();
  await UserRegistration.update(
    {
      status: "ACCEPTED",
      accepted_at: acceptedAt,
      accepted_by: acceptedBy,
      success_user_id: newUser.user_id,
      success_employee_id: newEmployee.employee_id,
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

  // Step 13: Insert into UserRegistrationLog
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
      created_user_id: newUser.user_id,
      created_employee_id: newEmployee.employee_id,
    },
    { transaction }
  );

  // Step 14: Send acceptance email
  await sendAcceptanceEmail({
    email: updatedUserRegistration.email,
    employeeName: updatedUserRegistration.employee_name,
  });

  // Step 15: Sync data from MDM
  try {
    await syncAndAutoApproveEmployee({
      employeeNumber: userRegistration.employee_number,
      isTransferKPI: false // Set to true if KPI transfer is needed, but we assume its a new position
    });
  } catch (syncError) {
    // Log the error but don't fail the registration process
    console.error('Failed to sync employee data from MDM:', {
      employeeNumber: userRegistration.employee_number,
      error: syncError.message,
      stack: syncError.stack
    });
  }

  return {
    success: true,
    message: "Permintaan registrasi berhasil diterima",
    data: {
      user_registration_id: userRegistrationId,
      status: "ACCEPTED",
      accepted_at: acceptedAt,
      accepted_by: acceptedBy,
      user_id: newUser.user_id,
      employee_id: newEmployee.employee_id,
    },
  };
};

/**
 * Send acceptance email using nodemailer
 * @param {object} params - Parameters object
 * @param {string} params.email - Recipient email
 * @param {string} params.employeeName - Employee name
 */
async function sendAcceptanceEmail(params = {}) {
  const { email, employeeName } = params;

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
    subject: "Permintaan Akun Portaverse Anda Disetujui",
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
                      ✅ Akun Anda Telah Disetujui
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
                    <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
                      Selamat! Permintaan pembuatan akun <strong>PORTAVERSE</strong> Anda telah disetujui oleh administrator.
                    </p>

                    <!-- Success Box -->
                    <div style="background-color: #e8f4fd; border-left: 4px solid #2d89ef; padding: 15px; margin: 20px 0; border-radius: 4px;">
                      <p style="color: #1a5490; font-size: 14px; font-weight: bold; margin: 0 0 10px;">
                        🎉 Akun Anda Sudah Aktif!
                      </p>
                      <p style="color: #1a5490; font-size: 13px; line-height: 1.6; margin: 0;">
                        Silakan login menggunakan email dan password yang telah Anda buat sebelumnya untuk mengakses sistem PORTAVERSE.
                      </p>
                    </div>
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
