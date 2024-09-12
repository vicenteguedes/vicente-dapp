import express from "express";
import { getTransactions } from "./controller";
import { asyncHandler } from "../../middleware/asyncHandler";

const router = express.Router();

router.get("/transactions", asyncHandler(getTransactions));

export { router };
