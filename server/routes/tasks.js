const express = require("express");
const router = express.Router();

const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const requireManager = authMiddleware.requireRole(
    "ADMIN",
    "MANAGER"
);

// ==========================================
// GET TASK DALAM PROJECT
// SEMUA ROLE
// ==========================================

router.get(
    "/projects/:projectId/tasks",
    authMiddleware,
    async (req, res) => {
        try {
            const { projectId } = req.params;

            const result = await db.query(
                `
                SELECT
                    t.id,
                    t.project_id,
                    t.title,
                    t.description,
                    t.assigned_to,
                    u.name AS assigned_name,
                    t.priority,
                    t.status,
                    t.revision_note,
                    t.deadline,
                    t.created_by,
                    t.created_at,
                    t.updated_at

                FROM tasks t

                LEFT JOIN users u
                    ON t.assigned_to = u.id

                WHERE t.project_id = $1

                ORDER BY t.id DESC
                `,
                [projectId]
            );

            res.json(result.rows);
        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Gagal mengambil data tugas",
            });
        }
    }
);

// ==========================================
// CREATE TASK
// ADMIN / MANAGER SAJA
// ==========================================

router.post(
    "/projects/:projectId/tasks",
    authMiddleware,
    requireManager,
    async (req, res) => {
        try {
            const { projectId } = req.params;

            const {
                title,
                description,
                assigned_to,
                priority,
                status,
                deadline,
            } = req.body;

            if (!title) {
                return res.status(400).json({
                    message: "Nama tugas wajib diisi",
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

            if (assigned_to) {
                const user = await db.query(
                    "SELECT id FROM users WHERE id = $1",
                    [assigned_to]
                );

                if (user.rows.length === 0) {
                    return res.status(404).json({
                        message: "User yang ditugaskan tidak ditemukan",
                    });
                }

                // Otomatis masukkan user ke project
                // jika belum menjadi anggota project
                await db.query(
                    `
                    INSERT INTO project_members (project_id, user_id)
                    SELECT $1, $2
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM project_members
                        WHERE project_id = $1
                        AND user_id = $2
                    )
                    `,
                    [projectId, assigned_to]
                );
            }

            // Status awal task selalu TODO
            // agar workflow dimulai dari TODO
            const initialStatus = "TODO";

            const result = await db.query(
                `
                INSERT INTO tasks
                (
                    project_id,
                    title,
                    description,
                    assigned_to,
                    priority,
                    status,
                    deadline,
                    created_by
                )
                VALUES
                ($1, $2, $3, $4, $5, $6, $7, $8)

                RETURNING
                    id,
                    project_id,
                    title,
                    description,
                    assigned_to,
                    priority,
                    status,
                    revision_note,
                    deadline,
                    created_by,
                    created_at,
                    updated_at
                `,
                [
                    projectId,
                    title,
                    description || null,
                    assigned_to || null,
                    priority || "SEDANG",
                    initialStatus,
                    deadline || null,
                    req.user.id,
                ]
            );

            res.status(201).json({
                message: "Tugas berhasil dibuat",
                task: result.rows[0],
            });
        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Gagal membuat tugas",
            });
        }
    }
);

// ==========================================
// GET DETAIL TASK
// SEMUA ROLE
// ==========================================

router.get(
    "/tasks/:id",
    authMiddleware,
    async (req, res) => {
        try {
            const { id } = req.params;

            const result = await db.query(
                `
                SELECT
                    t.id,
                    t.project_id,
                    p.name AS project_name,
                    t.title,
                    t.description,
                    t.assigned_to,
                    u.name AS assigned_name,
                    t.priority,
                    t.status,
                    t.revision_note,
                    t.deadline,
                    t.created_by,
                    creator.name AS creator_name,
                    t.created_at,
                    t.updated_at

                FROM tasks t

                JOIN projects p
                    ON t.project_id = p.id

                LEFT JOIN users u
                    ON t.assigned_to = u.id

                JOIN users creator
                    ON t.created_by = creator.id

                WHERE t.id = $1
                `,
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    message: "Tugas tidak ditemukan",
                });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Gagal mengambil detail tugas",
            });
        }
    }
);

// ==========================================
// UPDATE TASK
// ADMIN / MANAGER SAJA
// ==========================================

router.put(
    "/tasks/:id",
    authMiddleware,
    requireManager,
    async (req, res) => {
        try {
            const { id } = req.params;

            const {
                title,
                description,
                assigned_to,
                priority,
                status,
                deadline,
            } = req.body;

            if (!title) {
                return res.status(400).json({
                    message: "Nama tugas wajib diisi",
                });
            }

            if (assigned_to) {
                const user = await db.query(
                    "SELECT id FROM users WHERE id = $1",
                    [assigned_to]
                );

                if (user.rows.length === 0) {
                    return res.status(404).json({
                        message: "User yang ditugaskan tidak ditemukan",
                    });
                }
            }

            const result = await db.query(
                `
                UPDATE tasks

                SET
                    title = $1,
                    description = $2,
                    assigned_to = $3,
                    priority = $4,
                    status = $5,
                    deadline = $6,
                    updated_at = CURRENT_TIMESTAMP

                WHERE id = $7

                RETURNING
                    id,
                    project_id,
                    title,
                    description,
                    assigned_to,
                    priority,
                    status,
                    revision_note,
                    deadline,
                    created_by,
                    created_at,
                    updated_at
                `,
                [
                    title,
                    description || null,
                    assigned_to || null,
                    priority || "SEDANG",
                    status || "TODO",
                    deadline || null,
                    id,
                ]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    message: "Tugas tidak ditemukan",
                });
            }

            res.json({
                message: "Tugas berhasil diperbarui",
                task: result.rows[0],
            });
        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Gagal memperbarui tugas",
            });
        }
    }
);

// ==========================================
// DELETE TASK
// ADMIN / MANAGER SAJA
// ==========================================

router.delete(
    "/tasks/:id",
    authMiddleware,
    requireManager,
    async (req, res) => {
        try {
            const { id } = req.params;

            const result = await db.query(
                `
                DELETE FROM tasks
                WHERE id = $1
                RETURNING id, title
                `,
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    message: "Tugas tidak ditemukan",
                });
            }

            res.json({
                message: "Tugas berhasil dihapus",
                task: result.rows[0],
            });
        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Gagal menghapus tugas",
            });
        }
    }
);

// ==========================================
// UPDATE STATUS TASK
//
// MEMBER:
// TODO -> IN PROGRESS
// IN PROGRESS -> REVIEW
// REVISI -> IN PROGRESS
//
// ADMIN / MANAGER:
// REVIEW -> DONE
//
// REVIEW -> REVISI dilakukan melalui
// endpoint khusus /revision
// ==========================================

router.patch(
    "/tasks/:id/status",
    authMiddleware,
    async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const allowedStatus = [
                "TODO",
                "IN PROGRESS",
                "REVIEW",
                "REVISI",
                "DONE",
            ];

            if (!allowedStatus.includes(status)) {
                return res.status(400).json({
                    message: "Status task tidak valid",
                });
            }

            const taskResult = await db.query(
                `
                SELECT
                    id,
                    project_id,
                    assigned_to,
                    status,
                    title
                FROM tasks
                WHERE id = $1
                `,
                [id]
            );

            if (taskResult.rows.length === 0) {
                return res.status(404).json({
                    message: "Tugas tidak ditemukan",
                });
            }

            const task = taskResult.rows[0];

            const userRole = String(
                req.user.role || ""
            ).toUpperCase();

            const isManager =
                userRole === "ADMIN" ||
                userRole === "MANAGER";

            const isAssignedMember =
                userRole === "MEMBER" &&
                Number(task.assigned_to) === Number(req.user.id);

            if (!isManager && !isAssignedMember) {
                return res.status(403).json({
                    message:
                        "Anda hanya dapat mengubah status tugas yang ditugaskan kepada Anda",
                });
            }

            const oldStatus = task.status;

            // ==========================================
            // ATURAN MEMBER
            // ==========================================

            if (isAssignedMember) {
                const allowedMemberTransitions = {
                    "TODO": ["IN PROGRESS"],
                    "IN PROGRESS": ["REVIEW"],
                    "REVISI": ["IN PROGRESS"],
                };

                const allowedNextStatuses =
                    allowedMemberTransitions[oldStatus] || [];

                if (!allowedNextStatuses.includes(status)) {
                    return res.status(403).json({
                        message:
                            `Member tidak dapat mengubah status dari ${oldStatus} menjadi ${status}`,
                    });
                }
            }

            // ==========================================
            // ATURAN ADMIN / MANAGER
            // ==========================================

            if (isManager) {
                const allowedManagerTransitions = {
                    "REVIEW": ["DONE"],
                };

                const allowedNextStatuses =
                    allowedManagerTransitions[oldStatus] || [];

                if (!allowedNextStatuses.includes(status)) {
                    return res.status(403).json({
                        message:
                            `Admin/Manager tidak dapat mengubah status dari ${oldStatus} menjadi ${status}`,
                    });
                }
            }

            // ==========================================
            // UPDATE STATUS
            // ==========================================

            const result = await db.query(
                `
                UPDATE tasks

                SET
                    status = $1,
                    updated_at = CURRENT_TIMESTAMP

                WHERE id = $2

                RETURNING
                    id,
                    project_id,
                    title,
                    status,
                    revision_note,
                    updated_at
                `,
                [status, id]
            );

            // ==========================================
            // ACTIVITY LOG
            // ==========================================

            await db.query(
                `
                INSERT INTO activity_logs
                (
                    user_id,
                    project_id,
                    task_id,
                    action,
                    description
                )
                VALUES
                ($1, $2, $3, $4, $5)
                `,
                [
                    req.user.id,
                    task.project_id,
                    task.id,
                    "UPDATE_STATUS",
                    `Mengubah status "${task.title}" dari ${oldStatus} menjadi ${status}`,
                ]
            );

            res.json({
                message: "Status tugas berhasil diperbarui",
                task: result.rows[0],
            });
        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Gagal memperbarui status tugas",
            });
        }
    }
);

// ==========================================
// REQUEST REVISION
// ADMIN / MANAGER SAJA
//
// REVIEW -> REVISI
// Menyimpan catatan revisi
// ==========================================

router.patch(
    "/tasks/:id/revision",
    authMiddleware,
    requireManager,
    async (req, res) => {
        try {
            const { id } = req.params;
            const { revision_note } = req.body;

            if (!revision_note || !revision_note.trim()) {
                return res.status(400).json({
                    message: "Catatan revisi wajib diisi",
                });
            }

            const taskResult = await db.query(
                `
                SELECT
                    id,
                    project_id,
                    title,
                    status
                FROM tasks
                WHERE id = $1
                `,
                [id]
            );

            if (taskResult.rows.length === 0) {
                return res.status(404).json({
                    message: "Tugas tidak ditemukan",
                });
            }

            const task = taskResult.rows[0];

            if (task.status !== "REVIEW") {
                return res.status(400).json({
                    message:
                        "Tugas hanya dapat diminta revisi ketika statusnya REVIEW",
                });
            }

            const result = await db.query(
                `
                UPDATE tasks

                SET
                    status = 'REVISI',
                    revision_note = $1,
                    updated_at = CURRENT_TIMESTAMP

                WHERE id = $2

                RETURNING
                    id,
                    project_id,
                    title,
                    status,
                    revision_note,
                    updated_at
                `,
                [
                    revision_note.trim(),
                    id,
                ]
            );

            // ==========================================
            // ACTIVITY LOG
            // ==========================================

            await db.query(
                `
                INSERT INTO activity_logs
                (
                    user_id,
                    project_id,
                    task_id,
                    action,
                    description
                )
                VALUES
                ($1, $2, $3, $4, $5)
                `,
                [
                    req.user.id,
                    task.project_id,
                    task.id,
                    "REQUEST_REVISION",
                    `Meminta revisi untuk tugas "${task.title}": ${revision_note.trim()}`,
                ]
            );

            res.json({
                message: "Revisi berhasil dikirim",
                task: result.rows[0],
            });
        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Gagal mengirim revisi",
            });
        }
    }
);

module.exports = router;