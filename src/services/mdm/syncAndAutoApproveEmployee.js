const axios = require('axios');

/**
 * Sync and auto-approve employee data from MDM service via HTTP API call
 * @param {object} params - Parameters object
 * @param {string} params.employeeNumber - Employee number (NIPP)
 * @param {boolean} params.isTransferKPI - Whether to transfer KPI data (optional, default false)
 * @returns {object} - Sync result from MDM service
 */
module.exports = async (params = {}) => {
  const { employeeNumber, isTransferKPI = false } = params;

  try {
    // Build request body
    const requestBody = {
      employee_numbers: [employeeNumber],
      is_transfer_kpi: isTransferKPI
    };

    // Make HTTP call to mdm-fetching service
    const mdmServiceUrl = process.env.MDM_FETCHING_BASE_URL || 'http://localhost:3002';
    const url = `${mdmServiceUrl}/position-sync/request/sync-and-auto-approve`;
    const response = await axios.post(url, requestBody, {
      // timeout: 30000, // 30 second timeout for sync operations
      headers: {
        'Content-Type': 'application/json',
        // Add any required authentication headers if needed
      }
    });

    // Return the data from MDM service
    if (response.data && response.data.success) {
      return {
        success: true,
        message: 'Employee data synced and auto-approved successfully',
        data: response.data.data,
        employeeNumber: employeeNumber,
        isTransferKPI: isTransferKPI
      };
    }

    // Handle unexpected response format
    console.warn('Unexpected response format from MDM sync service:', response.data);
    return {
      success: false,
      employeeNumber: employeeNumber,
      isTransferKPI: isTransferKPI,
      error: 'Invalid response from MDM sync service',
      responseData: response.data
    };

  } catch (error) {
    console.error('Error calling MDM sync service:', {
      employeeNumber,
      isTransferKPI,
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    // Return error information for logging purposes
    return {
      success: false,
      employeeNumber: employeeNumber,
      isTransferKPI: isTransferKPI,
      error: error.message,
      errorCode: error.response?.status,
      errorDetails: error.response?.data,
      note: 'MDM sync service call failed - employee registration completed but sync failed'
    };
  }
};
