const { selectQuery } = require("../../models");

/**
 * Get user registration request analytics
 * @param {object} params - Parameters object (empty for now)
 * @param {object} options - Options object
 * @param {object} options.transaction - Sequelize transaction object
 * @returns {object} - Analytics data with counts and percentages
 */
module.exports = async (params = {}, options = {}) => {
  const { transaction } = options;

  const query = `
    SELECT 
      SUM(CASE WHEN status = 'ACCEPTED' THEN 1 ELSE 0 END) AS total_accepted,
      SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) AS total_rejected,
      SUM(CASE WHEN status = 'SUBMITTED' THEN 1 ELSE 0 END) AS total_submitted
    FROM tb_user_registration
    WHERE deletedAt IS NULL
  `;

  const result = await selectQuery(query, { transaction });

  if (!result || result.length === 0) {
    return {
      total_request: 0,
      total_accepted: 0,
      accepted_percentage: 0,
      total_rejected: 0,
      rejected_percentage: 0,
      total_submitted: 0,
      submitted_percentage: 0,
    };
  }

  const data = result[0];
  const totalAccepted = parseInt(data.total_accepted) || 0;
  const totalRejected = parseInt(data.total_rejected) || 0;
  const totalSubmitted = parseInt(data.total_submitted) || 0;
  const totalRequest = totalAccepted + totalRejected + totalSubmitted;

  // Calculate percentages
  const acceptedPercentage =
    totalRequest > 0 ? ((totalAccepted / totalRequest) * 100).toFixed(2) : 0;
  const rejectedPercentage =
    totalRequest > 0 ? ((totalRejected / totalRequest) * 100).toFixed(2) : 0;
  const submittedPercentage =
    totalRequest > 0 ? ((totalSubmitted / totalRequest) * 100).toFixed(2) : 0;

  return {
    total_request: totalRequest,
    total_accepted: totalAccepted,
    accepted_percentage: parseFloat(acceptedPercentage),
    total_rejected: totalRejected,
    rejected_percentage: parseFloat(rejectedPercentage),
    total_submitted: totalSubmitted,
    submitted_percentage: parseFloat(submittedPercentage),
  };
};
