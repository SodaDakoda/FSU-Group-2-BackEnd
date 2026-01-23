import express from "express";
import db from "../db/client.js";
import { requireAdmin } from "../utils/jwt.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `
      SELECT
        f.faculty_id as id,
        f.first_name,
        f.last_name,
        f.first_name || ' ' || f.last_name as name,
        f.title,
        f.bio,
        f.department_id,
        (SELECT image_url FROM faculty_images WHERE faculty_id = f.faculty_id AND is_profile = true LIMIT 1) as profile_image,
        json_build_object(
          'email', fc.email,
          'phone', fc.phone,
          'office_location', fc.office_location,
          'website_url', fc.website_url
        ) as contact_info,
        CASE WHEN d.department_id IS NULL THEN NULL ELSE
          json_build_object('id', d.department_id, 'name', d.name)
        END AS department
      FROM faculty f
      LEFT JOIN faculty_contacts fc ON fc.faculty_id = f.faculty_id
      LEFT JOIN departments d ON d.department_id = f.department_id
      ORDER BY f.last_name ASC, f.first_name ASC
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
        f.faculty_id as id,
        f.first_name,
        f.last_name,
        f.first_name || ' ' || f.last_name as name,
        f.title,
        f.bio,
        f.department_id,
        (SELECT image_url FROM faculty_images WHERE faculty_id = f.faculty_id AND is_profile = true LIMIT 1) as profile_image,
        json_build_object(
          'email', fc.email,
          'phone', fc.phone,
          'office_location', fc.office_location,
          'website_url', fc.website_url
        ) as contact_info,
        CASE WHEN d.department_id IS NULL THEN NULL ELSE
          json_build_object(
            'id', d.department_id,
            'name', d.name,
            'description', d.description,
            'banner_image', (SELECT image_url FROM department_images WHERE department_id = d.department_id AND is_primary = true LIMIT 1),
            'contact_info', json_build_object(
              'email', dc.email,
              'phone', dc.phone,
              'office_location', dc.office_location
            )
          )
        END AS department
      FROM faculty f
      LEFT JOIN faculty_contacts fc ON fc.faculty_id = f.faculty_id
      LEFT JOIN departments d ON d.department_id = f.department_id
      LEFT JOIN department_contacts dc ON dc.department_id = d.department_id
      WHERE f.faculty_id = $1
      `,
      [id],
    );

    const prof = rows[0];
    if (!prof) return res.status(404).json({ error: "Faculty not found" });

    res.json(prof);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAdmin, async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      title = "",
      bio = "",
      profile_image = "",
      contact_info = {},
      department_id = null,
    } = req.body;

    if (!first_name || !last_name) {
      return res
        .status(400)
        .json({ error: "first_name and last_name are required" });
    }

    // Insert faculty
    const { rows } = await db.query(
      `
      INSERT INTO faculty (first_name, last_name, title, bio, department_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING faculty_id as id, first_name, last_name, title, bio, department_id
      `,
      [first_name.trim(), last_name.trim(), title, bio, department_id],
    );

    const faculty = rows[0];

    // Insert contact info if provided
    if (
      contact_info &&
      (contact_info.email ||
        contact_info.phone ||
        contact_info.office_location ||
        contact_info.website_url)
    ) {
      await db.query(
        `
        INSERT INTO faculty_contacts (faculty_id, email, phone, office_location, website_url)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          faculty.id,
          contact_info.email,
          contact_info.phone,
          contact_info.office_location,
          contact_info.website_url,
        ],
      );
    }

    // Insert profile image if provided
    if (profile_image) {
      await db.query(
        `
        INSERT INTO faculty_images (faculty_id, image_url, is_profile)
        VALUES ($1, $2, true)
        `,
        [faculty.id, profile_image],
      );
    }

    // Insert into faculty_departments junction table if department_id provided
    if (department_id) {
      await db.query(
        `
        INSERT INTO faculty_departments (faculty_id, department_id)
        VALUES ($1, $2)
        `,
        [faculty.id, department_id],
      );
    }

    res
      .status(201)
      .json({
        ...faculty,
        profile_image,
        contact_info,
        name: `${faculty.first_name} ${faculty.last_name}`,
      });
  } catch (err) {
    if (err.code === "23503") {
      return res.status(400).json({ error: "Invalid department_id" });
    }
    next(err);
  }
});

router.patch("/:id", requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      title,
      bio,
      profile_image,
      contact_info,
      department_id,
    } = req.body;

    const fields = [];
    const values = [];
    let idx = 1;

    if (first_name !== undefined) {
      fields.push(`first_name = $${idx++}`);
      values.push(String(first_name).trim());
    }
    if (last_name !== undefined) {
      fields.push(`last_name = $${idx++}`);
      values.push(String(last_name).trim());
    }
    if (title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(title);
    }
    if (bio !== undefined) {
      fields.push(`bio = $${idx++}`);
      values.push(bio);
    }
    if (department_id !== undefined) {
      fields.push(`department_id = $${idx++}`);
      values.push(department_id);
    }

    if (fields.length === 0 && !profile_image && !contact_info) {
      return res.status(400).json({ error: "No fields to update" });
    }

    if (fields.length > 0) {
      values.push(id);

      const { rows } = await db.query(
        `
        UPDATE faculty
        SET ${fields.join(", ")}, updated_at = NOW()
        WHERE faculty_id = $${idx}
        RETURNING faculty_id as id, first_name, last_name, title, bio, department_id
        `,
        values,
      );

      const updated = rows[0];
      if (!updated) return res.status(404).json({ error: "Faculty not found" });
    }

    // Update profile image if provided
    if (profile_image !== undefined) {
      // First, unset any existing profile image
      await db.query(
        `UPDATE faculty_images SET is_profile = false WHERE faculty_id = $1`,
        [id],
      );

      if (profile_image) {
        // Insert or update the new profile image
        await db.query(
          `
          INSERT INTO faculty_images (faculty_id, image_url, is_profile)
          VALUES ($1, $2, true)
          ON CONFLICT DO NOTHING
          `,
          [id, profile_image],
        );
      }
    }

    // Update contact info if provided
    if (contact_info !== undefined) {
      await db.query(
        `
        INSERT INTO faculty_contacts (faculty_id, email, phone, office_location, website_url)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (faculty_id) DO UPDATE
        SET email = $2, phone = $3, office_location = $4, website_url = $5
        `,
        [
          id,
          contact_info.email,
          contact_info.phone,
          contact_info.office_location,
          contact_info.website_url,
        ],
      );
    }

    // Fetch and return the updated faculty
    const { rows } = await db.query(
      `
      SELECT
        f.faculty_id as id,
        f.first_name,
        f.last_name,
        f.first_name || ' ' || f.last_name as name,
        f.title,
        f.bio,
        f.department_id,
        (SELECT image_url FROM faculty_images WHERE faculty_id = f.faculty_id AND is_profile = true LIMIT 1) as profile_image,
        json_build_object(
          'email', fc.email,
          'phone', fc.phone,
          'office_location', fc.office_location,
          'website_url', fc.website_url
        ) as contact_info
      FROM faculty f
      LEFT JOIN faculty_contacts fc ON fc.faculty_id = f.faculty_id
      WHERE f.faculty_id = $1
      `,
      [id],
    );

    res.json(rows[0]);
  } catch (err) {
    if (err.code === "23503") {
      return res.status(400).json({ error: "Invalid department_id" });
    }
    next(err);
  }
});

router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      `
      DELETE FROM faculty
      WHERE faculty_id = $1
      RETURNING faculty_id as id, first_name, last_name
      `,
      [id],
    );

    const deleted = rows[0];
    if (!deleted) return res.status(404).json({ error: "Faculty not found" });

    res.json({
      deleted: {
        ...deleted,
        name: `${deleted.first_name} ${deleted.last_name}`,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
