import express from "express";
import db from "../db/client.js";
import { requireAdmin } from "../utils/jwt.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `
      SELECT 
        d.department_id as id,
        d.name,
        d.description,
        (SELECT image_url FROM department_images WHERE department_id = d.department_id AND is_primary = true LIMIT 1) as banner_image,
        json_build_object(
          'email', dc.email,
          'phone', dc.phone,
          'office_location', dc.office_location
        ) as contact_info
      FROM departments d
      LEFT JOIN department_contacts dc ON dc.department_id = d.department_id
      ORDER BY d.name ASC
      `,
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      `
      SELECT
        d.department_id as id,
        d.name,
        d.description,
        (SELECT image_url FROM department_images WHERE department_id = d.department_id AND is_primary = true LIMIT 1) as banner_image,
        json_build_object(
          'email', dc.email,
          'phone', dc.phone,
          'office_location', dc.office_location
        ) as contact_info,
        COALESCE(
          json_agg(
            json_build_object(
              'id', f.faculty_id,
              'name', f.first_name || ' ' || f.last_name,
              'first_name', f.first_name,
              'last_name', f.last_name,
              'title', f.title,
              'bio', f.bio,
              'profile_image', (SELECT image_url FROM faculty_images WHERE faculty_id = f.faculty_id AND is_profile = true LIMIT 1),
              'email', fc.email,
              'phone', fc.phone,
              'office_location', fc.office_location,
              'website_url', fc.website_url,
              'department_id', f.department_id
            )
          ) FILTER (WHERE f.faculty_id IS NOT NULL),
          '[]'::json
        ) AS faculty
      FROM departments d
      LEFT JOIN department_contacts dc ON dc.department_id = d.department_id
      LEFT JOIN faculty f ON f.department_id = d.department_id
      LEFT JOIN faculty_contacts fc ON fc.faculty_id = f.faculty_id
      WHERE d.department_id = $1
      GROUP BY d.department_id, d.name, d.description, dc.email, dc.phone, dc.office_location
      `,
      [id],
    );

    const dept = rows[0];
    if (!dept) return res.status(404).json({ error: "Department not found" });

    res.json(dept);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAdmin, async (req, res, next) => {
  try {
    const {
      name,
      description = "",
      banner_image = "",
      contact_info = {},
    } = req.body;

    if (!name) return res.status(400).json({ error: "name is required" });

    // Insert department
    const { rows } = await db.query(
      `
      INSERT INTO departments (name, description)
      VALUES ($1, $2)
      RETURNING department_id as id, name, description
      `,
      [name.trim(), description],
    );

    const dept = rows[0];

    // Insert contact info if provided
    if (
      contact_info &&
      (contact_info.email || contact_info.phone || contact_info.office_location)
    ) {
      await db.query(
        `
        INSERT INTO department_contacts (department_id, email, phone, office_location)
        VALUES ($1, $2, $3, $4)
        `,
        [
          dept.id,
          contact_info.email,
          contact_info.phone,
          contact_info.office_location,
        ],
      );
    }

    // Insert banner image if provided
    if (banner_image) {
      await db.query(
        `
        INSERT INTO department_images (department_id, image_url, is_primary)
        VALUES ($1, $2, true)
        `,
        [dept.id, banner_image],
      );
    }

    res.status(201).json({ ...dept, banner_image, contact_info });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Department name already exists" });
    }
    next(err);
  }
});

router.patch("/:id", requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, banner_image, contact_info } = req.body;

    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(String(name).trim());
    }
    if (description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(description);
    }

    if (fields.length === 0 && !banner_image && !contact_info) {
      return res.status(400).json({ error: "No fields to update" });
    }

    if (fields.length > 0) {
      values.push(id);

      const { rows } = await db.query(
        `
        UPDATE departments
        SET ${fields.join(", ")}, updated_at = NOW()
        WHERE department_id = $${idx}
        RETURNING department_id as id, name, description
        `,
        values,
      );

      const updated = rows[0];
      if (!updated)
        return res.status(404).json({ error: "Department not found" });
    }

    // Update banner image if provided
    if (banner_image !== undefined) {
      // First, unset any existing primary image
      await db.query(
        `UPDATE department_images SET is_primary = false WHERE department_id = $1`,
        [id],
      );

      if (banner_image) {
        // Insert or update the new primary image
        await db.query(
          `
          INSERT INTO department_images (department_id, image_url, is_primary)
          VALUES ($1, $2, true)
          ON CONFLICT DO NOTHING
          `,
          [id, banner_image],
        );
      }
    }

    // Update contact info if provided
    if (contact_info !== undefined) {
      await db.query(
        `
        INSERT INTO department_contacts (department_id, email, phone, office_location)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (department_id) DO UPDATE
        SET email = $2, phone = $3, office_location = $4
        `,
        [
          id,
          contact_info.email,
          contact_info.phone,
          contact_info.office_location,
        ],
      );
    }

    // Fetch and return the updated department
    const { rows } = await db.query(
      `
      SELECT 
        d.department_id as id,
        d.name,
        d.description,
        (SELECT image_url FROM department_images WHERE department_id = d.department_id AND is_primary = true LIMIT 1) as banner_image,
        json_build_object(
          'email', dc.email,
          'phone', dc.phone,
          'office_location', dc.office_location
        ) as contact_info
      FROM departments d
      LEFT JOIN department_contacts dc ON dc.department_id = d.department_id
      WHERE d.department_id = $1
      `,
      [id],
    );

    res.json(rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Department name already exists" });
    }
    next(err);
  }
});

router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      `
      DELETE FROM departments
      WHERE department_id = $1
      RETURNING department_id as id, name
      `,
      [id],
    );

    const deleted = rows[0];
    if (!deleted)
      return res.status(404).json({ error: "Department not found" });

    res.json({ deleted });
  } catch (err) {
    next(err);
  }
});

export default router;
