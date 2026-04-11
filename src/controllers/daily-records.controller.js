import { neonQuery } from "../db/neonPostgresDB.js";

export const addDailyRecord = async (req, res) => {
    try {
        console.log("--addDailyRecord--");

        const { pushups, pullups } = req.body;
        const userId = req.user?.id || req.user?._id || req.user?.userId;

        if (!userId) {
            return res.status(400).json({ message: "User ID not found in token" });
        }

        const insertSql = `
            INSERT INTO daily_records ("userId", "pushups", "pullups", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, NOW(), NOW())
            RETURNING *
        `;

        const values = [userId, pushups ?? 0, pullups ?? 0];
        const { rows } = await neonQuery(insertSql, values);
        const dailyRecord = rows[0];

        return res.status(201).json({
            message: "Daily record added successfully",
            data: dailyRecord,
        });
    } catch (error) {
        console.error("Error adding daily record:", error);
        res.status(500).json({
            message: "Failed to add daily record",
            error: error.message,
        });
    }
};