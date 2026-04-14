import { neonQuery } from "../db/neonPostgresDB.js";

export const addDailyRecord = async (req, res) => {
    try {
        console.log("--addOrUpdateDailyRecord--");

        const { pushups, pullups } = req.body;
        const userId = req.user?.id || req.user?._id || req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: user not found",
            });
        }

        // ✅ basic validation
        if (pushups == null && pullups == null) {
            return res.status(400).json({
                message: "At least one of pushups or pullups is required",
            });
        }

        const sql = `
        INSERT INTO daily_records ("userId", "pushups", "pullups", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, NOW(), NOW())
        ON CONFLICT ("userId", "recordDate")
        DO UPDATE SET
            "pushups" = EXCLUDED."pushups",
            "pullups" = EXCLUDED."pullups",
            "updatedAt" = NOW()
        RETURNING *
    `;

        const values = [userId, pushups ?? 0, pullups ?? 0];

        const { rows } = await neonQuery(sql, values);

        return res.status(200).json({
            message: "Daily record saved successfully",
            data: rows[0],
        });

    } catch (error) {
        console.error("Error saving daily record:", error);

        // 🔥 Handle known Postgres errors
        if (error.code === "23505") {
            return res.status(409).json({
                message: "Duplicate record for today",
            });
        }

        if (error.code === "23503") {
            return res.status(400).json({
                message: "Invalid user reference",
            });
        }

        // fallback
        return res.status(500).json({
            message: "Something went wrong. Please try again later.",
        });
    }
};

export const getTodayRecord = async (req, res) => {
    try {
        console.log("--getTodayRecord--");

        const userId = req.user?.id || req.user?._id || req.user?.userId;

        if (!userId) {
            return res.status(400).json({ message: "User ID not found in token" });
        }

        const selectSql = `
        SELECT * FROM daily_records
        WHERE "userId" = $1 AND DATE("createdAt") = CURRENT_DATE
        ORDER BY "createdAt" DESC
        LIMIT 1
        `;

        const { rows } = await neonQuery(selectSql, [userId]);
        const todayRecord = rows[0] || null;

        console.log("--todayRecord--", todayRecord);
        return res.status(200).json({
            message: "Today's record retrieved successfully",
            data: todayRecord,
        });
    } catch (error) {
        console.error("Error getting today's record:", error);
        res.status(500).json({
            message: "Failed to get today's record",
            error: error.message,
        });
    }
};

export const updateDailyRecord = async (req, res) => {
    try {
        console.log("--updateDailyRecord--");

        const { id } = req.params;
        const { pushups, pullups } = req.body;
        const userId = req.user?.id || req.user?._id || req.user?.userId;

        if (!userId) {
            return res.status(400).json({ message: "User ID not found in token" });
        }

        if (!id) {
            return res.status(400).json({ message: "Record ID is required" });
        }

        // Check if the record exists and belongs to the user
        const checkSql = `SELECT * FROM daily_records WHERE id = $1 AND "userId" = $2`;
        const checkResult = await neonQuery(checkSql, [id, userId]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: "Daily record not found or access denied" });
        }

        // Build update query dynamically based on provided fields
        const updateFields = [];
        const values = [];
        let paramIndex = 1;

        if (pushups !== undefined) {
            updateFields.push(`"pushups" = $${paramIndex++}`);
            values.push(pushups);
        }

        if (pullups !== undefined) {
            updateFields.push(`"pullups" = $${paramIndex++}`);
            values.push(pullups);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        // Add updatedAt
        updateFields.push(`"updatedAt" = NOW()`);

        const updateSql = `
            UPDATE daily_records
            SET ${updateFields.join(', ')}
            WHERE id = $${paramIndex++} AND "userId" = $${paramIndex++}
            RETURNING *
        `;

        values.push(id, userId);

        const { rows } = await neonQuery(updateSql, values);
        const updatedRecord = rows[0];

        return res.status(200).json({
            message: "Daily record updated successfully",
            data: updatedRecord,
        });
    } catch (error) {
        console.error("Error updating daily record:", error);
        res.status(500).json({
            message: "Failed to update daily record",
            error: error.message,
        });
    }
};