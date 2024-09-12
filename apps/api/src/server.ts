import { json, urlencoded } from "body-parser";
import express, { type Express } from "express";
import cors from "cors";
import { router as transactionsRouter } from "./resources/transactions/routes";
import { router as allowancesRouter } from "./resources/allowances/routes";
import { errorHandler } from "./middleware/error";

export const createServer = (): Express => {
  const app = express();

  app
    .disable("x-powered-by")
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors())
    .use("/api", allowancesRouter)
    .use("/api", transactionsRouter)
    .use(errorHandler);

  return app;
};
