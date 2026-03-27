/**
 * Handle API errors and format error messages
 */
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      status: error.response.status,
      message: error.response.data?.message || "Server error occurred",
      data: error.response.data,
    };
  } else if (error.request) {
    // Request made but no response
    return {
      status: 0,
      message: "No response from server",
      data: null,
    };
  } else {
    // Error in request setup
    return {
      status: -1,
      message: error.message || "An error occurred",
      data: null,
    };
  }
};

export default handleApiError;
