import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, _: Request, res: Response, __: NextFunction) {
  console.error(err.stack);

  res.status(500).json({
    message: "Internal Server Error",
    error: err.message,
  });
}
