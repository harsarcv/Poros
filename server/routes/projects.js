const express = require("express");
const router = express.Router();

const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const requireManager = authMiddleware.requireRole(
  "ADMIN",
  "MANAGER"
);

// ==========================================
// GET SEMUA PROJECT
// ADMIN / MANAGER / MEMBER
// ==========================================

router.get("/", authMiddleware, async (req, res) => {
  try {
    const role = String(req.user.role || "").toUpperCase();

    let result;

    if (
      role === "ADMIN" ||
      role === "MANAGER" ||
      role === "ADMIN/MANAGER"
    ) {
      // Admin / Manager melihat semua proyek
      result = await db.query(`
        SELECT
          p.id,
          p.name,
          p.description,
          p.deadline,
          p.status,
          p.created_by,
          p.created_at,
          u.name AS creator_name
        FROM projects p
        JOIN users u ON p.created_by = u.id
        ORDER BY p.id DESC
      `);
    } else if (role === "MEMBER") {
      // Member hanya melihat proyek yang dia ikuti
      result = await db.query(
        `
        SELECT
          p.id,
          p.name,
          p.description,
          p.deadline,
          p.status,
          p.created_by,
          p.created_at,
          u.name AS creator_name
        FROM projects p
        JOIN users u ON p.created_by = u.id
        JOIN project_members pm
          ON pm.project_id = p.id
        WHERE pm.user_id = $1
        ORDER BY p.id DESC
        `,
        [req.user.id]
      );
    } else {
      return res.status(403).json({
        message: "Role tidak memiliki akses",
      });
    }

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal mengambil data proyek",
    });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const role = String(req.user.role || "").toUpperCase();

    let result;

    if (
      role === "ADMIN" ||
      role === "MANAGER" ||
      role === "ADMIN/MANAGER"
    ) {
      result = await db.query(
        `
        SELECT
          p.id,
          p.name,
          p.description,
          p.deadline,
          p.status,
          p.created_by,
          p.created_at,
          u.name AS creator_name
        FROM projects p
        JOIN users u ON p.created_by = u.id
        WHERE p.id = $1
        `,
        [id]
      );
    } else if (role === "MEMBER") {
      result = await db.query(
        `
        SELECT
          p.id,
          p.name,
          p.description,
          p.deadline,
          p.status,
          p.created_by,
          p.created_at,
          u.name AS creator_name
        FROM projects p
        JOIN users u ON p.created_by = u.id
        JOIN project_members pm
          ON pm.project_id = p.id
        WHERE p.id = $1
          AND pm.user_id = $2
        `,
        [id, req.user.id]
      );
    } else {
      return res.status(403).json({
        message: "Role tidak memiliki akses",
      });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Proyek tidak ditemukan",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal mengambil detail proyek",
    });
  }
});

// ==========================================
// CREATE PROJECT
// ADMIN / MANAGER SAJA
// ==========================================

router.post(
  "/",
  authMiddleware,
  requireManager,
  async (req, res) => {
    try {
      const {
        name,
        description,
        deadline,
        status,
      } = req.body;

      if (!name) {
        return res.status(400).json({
          message: "Nama proyek wajib diisi",
        });
      }

      const result = await db.query(
        `
        INSERT INTO projects
          (name, description, deadline, status, created_by)
        VALUES
          ($1, $2, $3, $4, $5)
        RETURNING
          id,
          name,
          description,
          deadline,
          status,
          created_by,
          created_at
        `,
        [
          name,
          description || null,
          deadline || null,
          status || "AKTIF",
          req.user.id,
        ]
      );

      res.status(201).json({
        message: "Proyek berhasil dibuat",
        project: result.rows[0],
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Gagal membuat proyek",
      });
    }
  }
);

// ==========================================
// UPDATE PROJECT
// ADMIN / MANAGER SAJA
// ==========================================

router.put(
  "/:id",
  authMiddleware,
  requireManager,
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        name,
        description,
        deadline,
        status,
      } = req.body;

      if (!name) {
        return res.status(400).json({
          message: "Nama proyek wajib diisi",
        });
      }

      const result = await db.query(
        `
        UPDATE projects
        SET
          name = $1,
          description = $2,
          deadline = $3,
          status = $4
        WHERE id = $5
        RETURNING
          id,
          name,
          description,
          deadline,
          status,
          created_by,
          created_at
        `,
        [
          name,
          description || null,
          deadline || null,
          status || "AKTIF",
          id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Proyek tidak ditemukan",
        });
      }

      res.json({
        message: "Proyek berhasil diperbarui",
        project: result.rows[0],
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Gagal memperbarui proyek",
      });
    }
  }
);

// ==========================================
// DELETE PROJECT
// ADMIN / MANAGER SAJA
// ==========================================

router.delete(
  "/:id",
  authMiddleware,
  requireManager,
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await db.query(
        `
        DELETE FROM projects
        WHERE id = $1
        RETURNING id, name
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Proyek tidak ditemukan",
        });
      }

      res.json({
        message: "Proyek berhasil dihapus",
        project: result.rows[0],
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Gagal menghapus proyek",
      });
    }
  }
);

module.exports = router;