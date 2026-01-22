import express from "express";
import bcrypt from "bcrypt";
import db from "../db/client.js";
import { createToken } from "../utils/jwt.js";

const router = express.Router();

// POST /api/admin/register
router.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email and password required" });

    const hash = await bcrypt.hash(password, 10);

    const { rows } = await db.query(
      `
      INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, 'administrator')
      RETURNING user_id as id, email, role
      `,
      [email.toLowerCase(), hash],
    );

    const user = rows[0];
    const token = createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({ user, token });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }
    next(err);
  }
});

// POST /api/admin/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { rows } = await db.query(
      `SELECT * FROM users WHERE email = $1 AND role = 'administrator'`,
      [email.toLowerCase()],
    );

    const user = rows[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = createToken({
      userId: user.user_id,
      email: user.email,
      role: user.role,
    });

    res.json({
      user: { id: user.user_id, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
