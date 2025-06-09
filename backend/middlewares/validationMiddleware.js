import { ZodError } from "zod";

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = {};

        error.errors.forEach((err) => {
          const path = err.path.join(".");
          formattedErrors[path] = err.message;
        });

        return res.status(400).json({
          success: false,
          error: "Validation failed",
          errors: formattedErrors,
        });
      }

      next(error); // Other unexpected errors
    }
  };
};
