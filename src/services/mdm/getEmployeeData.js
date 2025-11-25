const axios = require("axios");

/**
 * Get employee data from MDM service via HTTP API call
 * @param {object} params - Parameters object
 * @param {string} params.employeeNumber - Employee number (NIPP)
 * @returns {object} - Employee data from MDM
 */
module.exports = async (params = {}) => {
  const { employeeNumber } = params;

  try {
    // Build query parameters
    const queryParams = new URLSearchParams({
      employee_number: employeeNumber,
    });

    // Make HTTP call to mdm-fetching service
    const mdmServiceUrl =
      process.env.MDM_FETCHING_BASE_URL || "http://localhost:3002";
    const url = `${mdmServiceUrl}/position-sync/check-nipp?${queryParams.toString()}`;
    const response = await axios.get(url, {
      // timeout: 10000, // 10 second timeout
      headers: {
        "Content-Type": "application/json",
        // Add any required authentication headers if needed
      },
    });

    console.log(response.data);

    // Return the data from MDM service
    if (response.data && response.data.status) {
      return {
        ...response.data.data,
        // email:
        //   process.env.NODE_ENV === "production" ||
        //   process.env.NODE_ENV === "staging"
        //     ? response.data.data.email
        //     : "",
        isEmployeeExistInMdm:
          typeof response.data.data.isEmployeeExistInMdm === "boolean"
            ? response.data.data.isEmployeeExistInMdm
            : !!response.data.data.employeeName,
      };
    }

    // Handle unexpected response format
    console.warn("Unexpected response format from MDM service:", response.data);
    return {
      employeeNumber: employeeNumber,
      isEmployeeExistInMdm: false,
      error: "Invalid response from MDM service",
    };
  } catch (error) {
    console.error("Error fetching from MDM service:", error);
    return {
      employeeNumber: employeeNumber,
      isEmployeeExistInMdm: false,
      error: "Error fetching from MDM service",
    };
  }
};
