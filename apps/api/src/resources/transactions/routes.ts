import express from "express";
import { deleteTransactions, getDailyVolume, getTransactions } from "./controller";
import { asyncHandler } from "../../middleware/asyncHandler";

const router = express.Router();

router.get("/transactions", asyncHandler(getTransactions));
router.get("/daily-volume", asyncHandler(getDailyVolume));
router.delete("/transactions", asyncHandler(deleteTransactions));

export { router };
