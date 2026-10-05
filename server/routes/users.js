const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

// ==========================================
// MULTER - PROFILE IMAGE
// ==========================================

const uploadDir = path.join(
    __dirname,
    "../uploads/profiles"
);

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
        recursive: true,
    });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(
            file.originalname
        );

        const filename =
            `profile-${req.user.id}-${Date.now()}${extension}`;

        cb(null, filename);
    },
});

const upload = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024,
    },

    fileFilter: (
        req,
        file,
        cb
    ) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/webp",
        ];

        if (
            allowedTypes.includes(
                file.mimetype
            )
        ) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Format foto harus JPG, JPEG, PNG, atau WEBP"
                )
            );
        }
    },
});

// ==========================================
// GET CURRENT USER / PROFILE
// ==========================================

router.get("/me", authMiddleware, async (req, res) => {
    try {
        const result = await db.query(
            `
SELECT
  id,
  name,
  email,
  role,
  profile_image,
  created_at
FROM users
      WHERE id = $1
      `,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User tidak ditemukan",
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Gagal mengambil profil user",
        });
    }
});

// ==========================================
// UPDATE CURRENT USER / PROFILE
// ==========================================

router.put("/me", authMiddleware, async (req, res) => {
    try {
        const { name } = req.body;

        // Validasi nama
        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Nama tidak boleh kosong",
            });
        }

        if (name.trim().length < 3) {
            return res.status(400).json({
                message: "Nama minimal 3 karakter",
            });
        }

        const result = await db.query(
            `
      UPDATE users
      SET name = $1
      WHERE id = $2
      RETURNING id, name, email, role, created_at
      `,
            [
                name.trim(),
                req.user.id,
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User tidak ditemukan",
            });
        }

        res.json({
            message: "Profil berhasil diperbarui",
            user: result.rows[0],
        });
    } catch (error) {
        console.error(
            "UPDATE PROFILE ERROR:",
            error
        );

        res.status(500).json({
            message: "Gagal memperbarui profil",
        });
    }
});

// ==========================================
// UPLOAD PROFILE IMAGE
// ==========================================

router.put(
    "/me/photo",
    authMiddleware,
    upload.single("profile_image"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    message: "Foto profil belum dipilih",
                });
            }

            const profileImage =
                `/uploads/profiles/${req.file.filename}`;

            const result = await db.query(
                `
        UPDATE users
        SET profile_image = $1
        WHERE id = $2
        RETURNING
          id,
          name,
          email,
          role,
          profile_image,
          created_at
        `,
                [
                    profileImage,
                    req.user.id,
                ]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    message:
                        "User tidak ditemukan",
                });
            }

            res.json({
                message:
                    "Foto profil berhasil diperbarui",
                user: result.rows[0],
            });
        } catch (error) {
            console.error(
                "UPLOAD PROFILE IMAGE ERROR:",
                error
            );

            res.status(500).json({
                message:
                    "Gagal mengupload foto profil",
            });
        }
    }
);

// ==========================================
// GET ALL USERS
// ==========================================

router.get("/", authMiddleware, async (req, res) => {
    try {
        const result = await db.query(
            "SELECT id, name, email, role, created_at FROM users ORDER BY id"
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Gagal mengambil data users",
        });
    }
});

router.put("/me/password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Password saat ini dan password baru wajib diisi",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password baru minimal 6 karakter",
      });
    }

    const result = await db.query(
      "SELECT password FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatch) {
      return res.status(400).json({
        message: "Password saat ini salah",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [hashedPassword, req.user.id]
    );

    res.json({
      message: "Password berhasil diperbarui",
    });
  } catch (error) {
    console.error("GANTI PASSWORD ERROR:", error);

    res.status(500).json({
      message: "Gagal memperbarui password",
    });
  }
});

module.exports = router;