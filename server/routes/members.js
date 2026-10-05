const express = require("express");
const router = express.Router();

const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/:projectId/members", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID wajib diisi",
      });
    }

    const project = await db.query(
      "SELECT id FROM projects WHERE id = $1",
      [projectId]
    );

    if (project.rows.length === 0) {
      return res.status(404).json({
        message: "Proyek tidak ditemukan",
      });
    }

    const user = await db.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    const existingMember = await db.query(
      `SELECT id
       FROM project_members
       WHERE project_id = $1 AND user_id = $2`,
      [projectId, userId]
    );

    if (existingMember.rows.length > 0) {
      return res.status(409).json({
        message: "User sudah menjadi member proyek",
      });
    }

    const result = await db.query(
      `INSERT INTO project_members (project_id, user_id)
       VALUES ($1, $2)
       RETURNING id, project_id, user_id, joined_at`,
      [projectId, userId]
    );

    res.status(201).json({
      message: "Member berhasil ditambahkan",
      member: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal menambahkan member",
    });
  }
});

router.get("/:projectId/members", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;

    const result = await db.query(
      `
      SELECT
        pm.id,
        pm.project_id,
        u.id AS user_id,
        u.name,
        u.email,
        u.role,
        pm.joined_at
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = $1
      ORDER BY pm.joined_at ASC
      `,
      [projectId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal mengambil daftar member",
    });
  }
});

module.exports = router;