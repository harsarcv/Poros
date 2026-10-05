const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Token tidak ditemukan",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token tidak valid atau sudah kedaluwarsa",
    });
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "User belum terautentikasi",
      });
    }

    const userRole = String(req.user.role || "").toUpperCase();

    const normalizedRoles = allowedRoles.map((role) =>
      String(role).toUpperCase()
    );

    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Anda tidak memiliki akses untuk melakukan tindakan ini",
      });
    }

    next();
  };
};

authMiddleware.requireRole = requireRole;

module.exports = authMiddleware;