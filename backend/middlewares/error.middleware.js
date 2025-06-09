const errorMiddleware = (err, req, res, next) => {
  try {
    let error = { ...err };
    error.message = err.message;

    console.error(err); // Log the full error for debugging

    // Sequelize unique constraint error
    if (err.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      err.errors.forEach((e) => {
        // Use a more user-friendly message
        errors[e.path] = `A record with this ${e.path.replace(
          /_/g,
          " "
        )} already exists`;
      });

      return res.status(409).json({
        // Using 409 Conflict for duplicate entries
        success: false,
        error: "Duplicate record",
        errors,
      });
    }

    // Sequelize validation error
    if (err.name === "SequelizeValidationError") {
      const errors = {};
      err.errors.forEach((e) => {
        errors[e.path] = e.message;
      });

      return res.status(400).json({
        success: false,
        error: "Validation error",
        errors,
      });
    }

    // Foreign key constraint error
    if (err.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        success: false,
        error: "Referenced record not found",
        errors: {
          [err.fields[0]]: `The referenced ${err.fields[0].replace(
            /_id$/,
            ""
          )} does not exist`,
        },
      });
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
        message: "Please log in again",
      });
    }

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired",
        message: "Please log in again",
      });
    }

    // Zod validation errors
    if (err.name === "ZodError") {
      const errors = {};
      err.errors.forEach((e) => {
        errors[e.path.join(".")] = e.message;
      });

      return res.status(400).json({
        success: false,
        error: "Validation error",
        errors,
      });
    }

    // Default error response
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || "Server Error",
    });
  } catch (error) {
    console.error("Error in error middleware:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

export default errorMiddleware;
