import express from "express";
import { addDailyRecord } from "../controllers/daily-records.controller.js";

const router = express.Router();

// POST /api/daily-records
router.post("/", addDailyRecord);

export default router;