const express = require("express");
const router = express.Router();

const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        a.id,
        a.action,
        a.description,
        a.created_at,
        u.name AS user_name,
        p.name AS project_name,
        t.title AS task_title
      FROM activity_logs a
      JOIN users u ON a.user_id = u.id
      JOIN projects p ON a.project_id = p.id
      LEFT JOIN tasks t ON a.task_id = t.id
      ORDER BY a.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal mengambil aktivitas",
    });
  }
});

module.exports = router;