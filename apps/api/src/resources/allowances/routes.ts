import express from "express";
import { getAllowances } from "./controller";
import { asyncHandler } from "../../middleware/asyncHandler";

const router = express.Router();

router.get("/allowances", asyncHandler(getAllowances));

export { router };
