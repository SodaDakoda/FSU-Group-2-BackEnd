import express from "express";
import db from "../db/client.js";
import { requireAdmin } from "../utils/jwt.js";

const router = express.Router();

// GET /api/users - Get all users (admin only)
router.get("/", requireAdmin, async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `
      SELECT user_id as id, email, role, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
      `,
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id - Get a specific user (admin only)
router.get("/:id", requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      `
      SELECT user_id as id, email, role, created_at, updated_at
      FROM users
      WHERE user_id = $1
      `,
      [id],
    );

    const user = rows[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
