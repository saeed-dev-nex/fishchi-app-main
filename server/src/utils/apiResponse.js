// This class is responsible for creating and sending standardized responses
class ApiResponse {
  /**
   * Constructor for creating response objects
   * @param {number} statusCode - HTTP status code
   * @param {object} data - Data to be sent
   * @param {string} message - Response message
   */
  constructor(statusCode, data, message = "") {
    this.statusCode = statusCode;
    this.success = statusCode >= 200 && statusCode < 300;
    this.status = this.success
      ? "success"
      : statusCode >= 400 && statusCode < 500
        ? "fail"
        : "error";
    this.data = data;
    this.message = message;
  }

  /**
   * For sending successful responses
   * @param {object} res - Express response object
   * @param {object} data - Data to be sent
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code (default 200)
   */
  static success(res, data, message = "", statusCode = 200) {
    res.status(statusCode).json({
      status: "success",
      success: true,
      statusCode: statusCode,
      data: data,
      message: message,
    });
  }

  /**
   * For sending client-side errors (Validation errors)
   * @param {object} res - Express response object
   * @param {object} data - Object containing error messages
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default 400)
   */
  static fail(res, data, message = "Request failed", statusCode = 400) {
    res.status(statusCode).json({
      status: "fail",
      success: false,
      statusCode: statusCode,
      data: data,
      message: message,
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
      status: "error",
      success: false,
      statusCode: statusCode,
      data: null,
      message: message,
    });
  }
}

export default ApiResponse;
