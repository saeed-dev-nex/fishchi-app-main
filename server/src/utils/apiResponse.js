// This class is responsible for creating and sending standardized responses
class ApiResponse {
  /**
   * For sending successful responses
   * @param {object} res - Express response object
   * @param {object} data - Data to be sent
   * @param {number} statusCode - HTTP status code (default 200)
   */
  static success(res, data, message, statusCode = 200) {
    res.status(statusCode).json({
      status: 'success',
      data: data,
      message: message,
    });
  }

  /**
   * For sending client-side errors (Validation errors)
   * @param {object} res - Express response object
   * @param {object} data - Object containing error messages
   * @param {number} statusCode - HTTP status code (default 400)
   */
  static fail(res, data, statusCode = 400) {
    res.status(statusCode).json({
      status: 'fail',
      data: data,
    });
  }

  /**
   * For sending server-side errors
   * @param {object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default 500)
   */
  static error(res, message, statusCode = 500) {
    res.status(statusCode).json({
      status: 'error',
      message: message,
    });
  }
}

export default ApiResponse;
