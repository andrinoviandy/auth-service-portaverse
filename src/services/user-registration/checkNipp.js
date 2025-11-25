const ClientError = require("../../commons/exceptions/ClientError");
const userRegistrationRepository = require("../../repositories/user-registration");
const mdmService = require("../mdm");
const { UserRegistration, UserRegistrationLog } = require("../../models");
const { censorEmail, censorName } = require("../../commons/helpers/censor");

/**
 * Service to check NIPP and handle user registration logic
 * @param {object} params - Parameters object
 * @param {string} params.employeeNumber - The employee number (NIPP)
 * @param {object} options - Options object
 * @param {object} options.transaction - Sequelize transaction object
 * @returns {object} - Censored user registration data
 */
module.exports = async (params = {}, options = {}) => {
  const { employeeNumber } = params;
  const { transaction } = options;

  // Step 1: Verify from MDM service
  const mdmData = await mdmService.getEmployeeData({ employeeNumber });

  if (!mdmData.isEmployeeExistInMdm) {
    throw new ClientError("NIPP ini tidak terdaftar dalam MDM.");
  }

  // Step 2: Check if employee exists in tb_employee
  const existingEmployee = await userRegistrationRepository.getEmployeeByNipp(
    { employeeNumber },
    { transaction }
  );

  if (existingEmployee) {
    throw new ClientError(
      "NIPP Pekerja telah terdaftar di Portaverse. Silahkan hubungi admin."
    );
  }

  // Step 3: Check if there's a SUBMITTED or ACCEPTED registration in tb_user_registration
  const submittedOrAcceptedRegistration =
    await userRegistrationRepository.getSubmittedOrAcceptedRegistrationByNipp(
      { employeeNumber },
      { transaction }
    );

  if (submittedOrAcceptedRegistration) {
    if (submittedOrAcceptedRegistration.status === "SUBMITTED") {
      throw new ClientError(
        "Permintaan aktivasi akun Anda sedang dalam proses review. Silahkan tunggu konfirmasi dari admin."
      );
    }
    if (submittedOrAcceptedRegistration.status === "ACCEPTED") {
      throw new ClientError(
        "NIPP Pekerja telah terdaftar di Portaverse. Silahkan hubungi admin."
      );
    }
  }

  // Step 4 & 5: Get existing registration or create new one
  const existingRegistration =
    await userRegistrationRepository.getRegistrationByNipp(
      { employeeNumber },
      { transaction }
    );

  let userRegistration;

  if (existingRegistration) {
    // Step 4: If exists (non-ACCEPTED status), log it and reset the row (log all fields from UserRegistration)
    await UserRegistrationLog.create(
      {
        user_registration_id: existingRegistration.user_registration_id,
        employee_number: existingRegistration.employee_number,
        employee_name: existingRegistration.employee_name,
        email: existingRegistration.email,
        work_unit: existingRegistration.work_unit,
        employee_status: existingRegistration.employee_status,
        superior_employee_number: existingRegistration.superior_employee_number,
        superior_employee_name: existingRegistration.superior_employee_name,
        superior_position_name: existingRegistration.superior_position_name,
        firebase_account_uid: existingRegistration.firebase_account_uid,
        status: existingRegistration.status,
        last_step: existingRegistration.last_step,
        profile_picture_file_id: existingRegistration.profile_picture_file_id,
        id_card_file_id: existingRegistration.id_card_file_id,
        sk_file_id: existingRegistration.sk_file_id,
        phone_number: existingRegistration.phone_number,
        birthdate: existingRegistration.birthdate,
        birthplace: existingRegistration.birthplace,
        rejected_at: existingRegistration.rejected_at,
        rejected_by: existingRegistration.rejected_by,
        rejection_notes: existingRegistration.rejection_notes,
        accepted_at: existingRegistration.accepted_at,
        accepted_by: existingRegistration.accepted_by,
        submitted_at: existingRegistration.submitted_at,
        created_user_id: null, // User checking their own NIPP (not from admin)
        created_employee_id: null, // Can be populated if needed
      },
      { transaction }
    );

    // Reset the row (keep: user_registration_id, employee_number, firebase_account_uid)
    await UserRegistration.update(
      {
        employee_name: mdmData.employeeName,
        email: mdmData.email,
        is_email_verified: false,
        work_unit: mdmData.workUnit,
        employee_status: mdmData.employeeStatus,
        superior_employee_number: mdmData.superiorEmployeeNumber,
        superior_employee_name: mdmData.superiorEmployeeName,
        superior_position_name: mdmData.superiorPositionName,
        status: "DRAFT",
        last_step: 0,
        profile_picture_file_id: null,
        id_card_file_id: null,
        sk_file_id: null,
        phone_number: mdmData.phoneNumber,
        birthdate: mdmData.birthdate,
        birthplace: mdmData.birthplace,
        success_user_id: null,
        success_employee_id: null,
        rejected_at: null,
        rejected_by: null,
        rejection_notes: null,
        accepted_at: null,
        accepted_by: null,
        submitted_at: null,
      },
      {
        where: {
          user_registration_id: existingRegistration.user_registration_id,
        },
        transaction,
      }
    );

    // Fetch updated registration
    userRegistration = await userRegistrationRepository.getRegistrationByNipp(
      { employeeNumber },
      { transaction }
    );
  } else {
    // Step 5: Create new registration
    userRegistration = await UserRegistration.create(
      {
        employee_number: employeeNumber,
        employee_name: mdmData.employeeName,
        email: mdmData.email,
        is_email_verified: false,
        work_unit: mdmData.workUnit,
        employee_status: mdmData.employeeStatus,
        superior_employee_number: mdmData.superiorEmployeeNumber,
        superior_employee_name: mdmData.superiorEmployeeName,
        superior_position_name: mdmData.superiorPositionName,
        status: "DRAFT",
        phone_number: mdmData.phoneNumber,
        birthdate: mdmData.birthdate,
        birthplace: mdmData.birthplace,
        last_step: 0,
      },
      { transaction }
    );
  }

  // Step 6: Return censored data
  return censorUserRegistrationData({ userRegistration });
};

/**
 * Helper function to censor sensitive data
 * @param {object} params - Parameters object
 * @param {object} params.userRegistration - User registration object
 * @returns {object} - Censored user registration data
 */
function censorUserRegistrationData(params = {}) {
  const { userRegistration } = params;

  return {
    user_registration_id: userRegistration.user_registration_id,
    employee_name: censorName(userRegistration.employee_name),
    employee_number: userRegistration.employee_number,
    email: censorEmail(userRegistration.email),
    work_unit: censorName(userRegistration.work_unit),
    employee_status: censorName(userRegistration.employee_status),
    superior_employee_name: censorName(userRegistration.superior_employee_name),
    superior_position_name: censorName(userRegistration.superior_position_name),
  };
}
