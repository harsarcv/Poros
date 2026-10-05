const express = require("express");
const cors = require("cors");

require("dotenv").config();

const db = require("./db");
const usersRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const projectsRoutes = require("./routes/projects");
const membersRoutes = require("./routes/members");
const tasksRoutes = require("./routes/tasks");
const activityRoutes = require("./routes/activity");

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  "/uploads",
  express.static("uploads")
);

app.use("/api/users", usersRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/projects", membersRoutes);
app.use("/api", tasksRoutes);
app.use("/api/activity", activityRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "POROS API berjalan",
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");

    res.json({
      message: "Database POROS terhubung",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal terhubung ke database",
    });
  }
});

module.exports = app;