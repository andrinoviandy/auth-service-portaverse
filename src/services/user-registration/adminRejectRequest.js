const nodemailer = require("nodemailer");
const ClientError = require("../../commons/exceptions/ClientError");
const userRegistrationRepository = require("../../repositories/user-registration");
const { UserRegistration, UserRegistrationLog } = require("../../models");

/**
 * Service to reject user registration request by admin
 * @param {object} params - Parameters object
 * @param {number} params.userRegistrationId - The user registration ID
 * @param {string} params.rejectionNotes - Notes/reason for rejection
 * @param {number} params.rejectedBy - User ID of the admin who rejected
 * @param {object} options - Options object
 * @param {object} options.transaction - Sequelize transaction object
 * @returns {object} - Rejection result
 */
module.exports = async (params = {}, options = {}) => {
  const { userRegistrationId, rejectionNotes, rejectedBy } = params;
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
      `Penolakan hanya dapat dilakukan pada status SUBMITTED. Status saat ini: ${userRegistration.status}`
    );
  }

  // Step 3: Update the status to REJECTED
  const rejectedAt = new Date();

  await UserRegistration.update(
    {
      status: "REJECTED",
      rejected_at: rejectedAt,
      rejected_by: rejectedBy,
      rejection_notes: rejectionNotes,
    },
    {
      where: {
        user_registration_id: userRegistrationId,
      },
      transaction,
    }
  );

  // Step 4: Get updated user registration data
  const updatedUserRegistration =
    await userRegistrationRepository.getRegistrationById(
      { userRegistrationId },
      { transaction }
    );

  // Step 5: Insert into UserRegistrationLog (log all fields from UserRegistration)
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
      created_user_id: rejectedBy, // Admin who rejected
      created_employee_id: null, // Can be populated if you have employee_id in res.locals
    },
    { transaction }
  );

  // Step 6: Send rejection email
  await sendRejectionEmail({
    email: updatedUserRegistration.email,
    employeeName: updatedUserRegistration.employee_name,
    rejectionNotes: rejectionNotes,
  });

  return {
    success: true,
    message: "Permintaan registrasi berhasil ditolak",
    data: {
      user_registration_id: userRegistrationId,
      status: "REJECTED",
      rejected_at: rejectedAt,
      rejected_by: rejectedBy,
      rejection_notes: rejectionNotes,
    },
  };
};

/**
 * Send rejection email using nodemailer
 * @param {object} params - Parameters object
 * @param {string} params.email - Recipient email
 * @param {string} params.employeeName - Employee name
 * @param {string} params.rejectionNotes - Rejection reason/notes
 */
async function sendRejectionEmail(params = {}) {
  const { email, employeeName, rejectionNotes } = params;

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
    subject: "Permintaan Akun Portaverse Memerlukan Perbaikan",
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
                      ❌ Permintaan Akun Memerlukan Perbaikan
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
                      Permintaan pembuatan akun <strong>PORTAVERSE</strong> Anda memerlukan perbaikan data atau dokumen.
                    </p>

                    <!-- Info Box -->
                    <div style="background-color: #e8f4fd; border-left: 4px solid #2d89ef; padding: 15px; margin: 20px 0; border-radius: 4px;">
                      <p style="color: #1a5490; font-size: 14px; font-weight: bold; margin: 0 0 10px;">
                        📋 Catatan dari Administrator:
                      </p>
                      <p style="color: #1a5490; font-size: 13px; line-height: 1.6; margin: 0;">
                        ${rejectionNotes}
                      </p>
                    </div>

                    <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 20px 0 0; text-align: center;">
                      💡 <strong>Langkah Selanjutnya:</strong><br>
                      Silakan lakukan pengajuan ulang dengan melengkapi atau memperbaiki data dan dokumen sesuai dengan catatan di atas.
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
