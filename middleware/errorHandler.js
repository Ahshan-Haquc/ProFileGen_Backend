// Custom Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;

  const errorMessages = {
    400: "Your request could not be processed because some required information is missing or invalid.",
    401: "You are not authorized. Please log in with valid credentials to access this resource.",
    403: "You do not have permission to access this resource.",
    404: "The resource you are looking for could not be found on the server.",
    500: "An unexpected error occurred on the server. Please try again later.",
  };

  const message = err.message || errorMessages[statusCode] || "Something went wrong, please try again.";

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = errorHandler;
