import express from "express";
import { addDailyRecord, getTodayRecord } from "../controllers/daily-records.controller.js";

const router = express.Router();

// POST /api/daily-records
router.post("/", addDailyRecord);

// GET /api/daily-records/today
router.get("/today", getTodayRecord);

export default router;