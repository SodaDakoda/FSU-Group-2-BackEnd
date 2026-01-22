import db from "#db/client";
import bcrypt from "bcrypt";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  // Clear existing data
  await db.query("DELETE FROM faculty_departments");
  await db.query("DELETE FROM faculty_contacts");
  await db.query("DELETE FROM department_contacts");
  await db.query("DELETE FROM faculty_images");
  await db.query("DELETE FROM department_images");
  await db.query("DELETE FROM faculty");
  await db.query("DELETE FROM departments");
  await db.query("DELETE FROM users");

  // Seed Users
  const visitorPassword = await bcrypt.hash("visitor123", 10);
  const adminPassword = await bcrypt.hash("admin123", 10);

  await db.query(
    `
    INSERT INTO users (email, password_hash, role)
    VALUES 
      ('visitor@fsu.edu', $1, 'visitor'),
      ('admin@fsu.edu', $2, 'administrator')
  `,
    [visitorPassword, adminPassword],
  );

  console.log("✅ Users seeded");

  // Seed Departments
  const departmentResult = await db.query(`
    INSERT INTO departments (name, description)
    VALUES 
      ('Computer Science', 'The Department of Computer Science offers comprehensive programs in software engineering, artificial intelligence, and computational theory.'),
      ('Mathematics', 'The Mathematics Department provides rigorous training in pure and applied mathematics, statistics, and mathematical modeling.'),
      ('Physics', 'The Physics Department explores fundamental principles of the universe through theoretical and experimental research.'),
      ('Biology', 'The Biology Department studies living organisms and their interactions with the environment at molecular, cellular, and ecosystem levels.'),
      ('Chemistry', 'The Chemistry Department investigates matter, its properties, composition, and transformations.'),
      ('English', 'The English Department explores literature, creative writing, rhetoric, and composition across diverse cultural contexts.'),
      ('History', 'The History Department examines past events, cultures, and societies to understand present and future trends.'),
      ('Psychology', 'The Psychology Department investigates human behavior, cognition, and mental processes through scientific research.'),
      ('Economics', 'The Economics Department analyzes production, distribution, and consumption of goods and services in society.'),
      ('Business Administration', 'The Business Administration Department prepares students for leadership roles in modern organizations.')
    RETURNING department_id, name
  `);

  console.log("✅ Departments seeded");

  const departments = departmentResult.rows;

  // Seed Department Images
  for (const dept of departments) {
    await db.query(
      `
      INSERT INTO department_images (department_id, image_url, alt_text, is_primary)
      VALUES 
        ($1, $2, $3, true),
        ($1, $4, $5, false)
    `,
      [
        dept.department_id,
        `https://picsum.photos/seed/${dept.name.replace(/\s+/g, "")}/800/600`,
        `${dept.name} main building`,
        `https://picsum.photos/seed/${dept.name.replace(/\s+/g, "")}2/800/600`,
        `${dept.name} laboratory`,
      ],
    );
  }

  console.log("✅ Department images seeded");

  // Seed Department Contacts
  for (const dept of departments) {
    await db.query(
      `
      INSERT INTO department_contacts (department_id, email, phone, office_location)
      VALUES ($1, $2, $3, $4)
    `,
      [
        dept.department_id,
        `${dept.name.toLowerCase().replace(/\s+/g, "")}@fsu.edu`,
        `(850) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        `Building ${String.fromCharCode(65 + ((dept.department_id - 1) % 26))}, Room ${100 + dept.department_id * 10}`,
      ],
    );
  }

  console.log("✅ Department contacts seeded");

  // Seed Faculty
  const facultyData = [
    // Computer Science
    {
      first_name: "Sarah",
      last_name: "Johnson",
      title: "Professor of Computer Science",
      bio: "Dr. Johnson specializes in artificial intelligence and machine learning with over 15 years of research experience.",
      dept: "Computer Science",
    },
    {
      first_name: "Michael",
      last_name: "Chen",
      title: "Associate Professor of Software Engineering",
      bio: "Dr. Chen focuses on software architecture and distributed systems.",
      dept: "Computer Science",
    },
    {
      first_name: "Emily",
      last_name: "Rodriguez",
      title: "Assistant Professor of Cybersecurity",
      bio: "Dr. Rodriguez researches network security and cryptography.",
      dept: "Computer Science",
    },

    // Mathematics
    {
      first_name: "David",
      last_name: "Williams",
      title: "Professor of Pure Mathematics",
      bio: "Dr. Williams is an expert in algebraic topology and category theory.",
      dept: "Mathematics",
    },
    {
      first_name: "Lisa",
      last_name: "Anderson",
      title: "Associate Professor of Applied Mathematics",
      bio: "Dr. Anderson works on mathematical modeling and numerical analysis.",
      dept: "Mathematics",
    },

    // Physics
    {
      first_name: "Robert",
      last_name: "Thompson",
      title: "Professor of Theoretical Physics",
      bio: "Dr. Thompson researches quantum mechanics and particle physics.",
      dept: "Physics",
    },
    {
      first_name: "Jennifer",
      last_name: "Martinez",
      title: "Associate Professor of Astrophysics",
      bio: "Dr. Martinez studies stellar evolution and cosmology.",
      dept: "Physics",
    },

    // Biology
    {
      first_name: "James",
      last_name: "Brown",
      title: "Professor of Molecular Biology",
      bio: "Dr. Brown investigates gene expression and cellular mechanisms.",
      dept: "Biology",
    },
    {
      first_name: "Maria",
      last_name: "Garcia",
      title: "Associate Professor of Ecology",
      bio: "Dr. Garcia focuses on ecosystem dynamics and conservation biology.",
      dept: "Biology",
    },
    {
      first_name: "Daniel",
      last_name: "Lee",
      title: "Assistant Professor of Genetics",
      bio: "Dr. Lee researches population genetics and evolutionary biology.",
      dept: "Biology",
    },

    // Chemistry
    {
      first_name: "Patricia",
      last_name: "Wilson",
      title: "Professor of Organic Chemistry",
      bio: "Dr. Wilson specializes in synthetic organic chemistry and drug design.",
      dept: "Chemistry",
    },
    {
      first_name: "Christopher",
      last_name: "Davis",
      title: "Associate Professor of Physical Chemistry",
      bio: "Dr. Davis studies thermodynamics and chemical kinetics.",
      dept: "Chemistry",
    },

    // English
    {
      first_name: "Amanda",
      last_name: "Taylor",
      title: "Professor of American Literature",
      bio: "Dr. Taylor is an expert in 19th-century American fiction and poetry.",
      dept: "English",
    },
    {
      first_name: "Richard",
      last_name: "Moore",
      title: "Associate Professor of Creative Writing",
      bio: "Dr. Moore is an award-winning novelist and poet.",
      dept: "English",
    },

    // History
    {
      first_name: "Barbara",
      last_name: "Jackson",
      title: "Professor of European History",
      bio: "Dr. Jackson specializes in medieval and Renaissance European history.",
      dept: "History",
    },
    {
      first_name: "Kevin",
      last_name: "White",
      title: "Associate Professor of American History",
      bio: "Dr. White researches Civil War and Reconstruction era.",
      dept: "History",
    },

    // Psychology
    {
      first_name: "Nancy",
      last_name: "Harris",
      title: "Professor of Clinical Psychology",
      bio: "Dr. Harris focuses on cognitive behavioral therapy and mental health treatment.",
      dept: "Psychology",
    },
    {
      first_name: "Steven",
      last_name: "Martin",
      title: "Associate Professor of Developmental Psychology",
      bio: "Dr. Martin studies child development and educational psychology.",
      dept: "Psychology",
    },

    // Economics
    {
      first_name: "Michelle",
      last_name: "Clark",
      title: "Professor of Macroeconomics",
      bio: "Dr. Clark researches monetary policy and international economics.",
      dept: "Economics",
    },
    {
      first_name: "Thomas",
      last_name: "Lewis",
      title: "Associate Professor of Behavioral Economics",
      bio: "Dr. Lewis studies decision-making and market behavior.",
      dept: "Economics",
    },

    // Business Administration
    {
      first_name: "Elizabeth",
      last_name: "Walker",
      title: "Professor of Management",
      bio: "Dr. Walker specializes in organizational behavior and strategic management.",
      dept: "Business Administration",
    },
    {
      first_name: "Matthew",
      last_name: "Hall",
      title: "Associate Professor of Finance",
      bio: "Dr. Hall focuses on corporate finance and investment strategies.",
      dept: "Business Administration",
    },
    {
      first_name: "Sandra",
      last_name: "Young",
      title: "Assistant Professor of Marketing",
      bio: "Dr. Young researches digital marketing and consumer behavior.",
      dept: "Business Administration",
    },
  ];

  const facultyIds = [];
  for (const person of facultyData) {
    const dept = departments.find((d) => d.name === person.dept);
    const result = await db.query(
      `
      INSERT INTO faculty (department_id, first_name, last_name, bio, title)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING faculty_id, first_name, last_name
    `,
      [
        dept.department_id,
        person.first_name,
        person.last_name,
        person.bio,
        person.title,
      ],
    );

    facultyIds.push({ ...result.rows[0], dept_id: dept.department_id });
  }

  console.log("✅ Faculty seeded");

  // Seed Faculty Images
  for (const faculty of facultyIds) {
    const seed = `${faculty.first_name}${faculty.last_name}`;
    await db.query(
      `
      INSERT INTO faculty_images (faculty_id, image_url, alt_text, is_profile)
      VALUES ($1, $2, $3, true)
    `,
      [
        faculty.faculty_id,
        `https://i.pravatar.cc/300?u=${seed}`,
        `${faculty.first_name} ${faculty.last_name} profile picture`,
      ],
    );
  }

  console.log("✅ Faculty images seeded");

  // Seed Faculty Contacts
  for (const faculty of facultyIds) {
    const emailPrefix = `${faculty.first_name.toLowerCase()}.${faculty.last_name.toLowerCase()}`;
    await db.query(
      `
      INSERT INTO faculty_contacts (faculty_id, email, phone, office_location, website_url)
      VALUES ($1, $2, $3, $4, $5)
    `,
      [
        faculty.faculty_id,
        `${emailPrefix}@fsu.edu`,
        `(850) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        `Building ${String.fromCharCode(65 + ((faculty.dept_id - 1) % 26))}, Office ${200 + faculty.faculty_id}`,
        `https://www.fsu.edu/faculty/${emailPrefix}`,
      ],
    );
  }

  console.log("✅ Faculty contacts seeded");

  // Seed Faculty Departments (junction table)
  for (const faculty of facultyIds) {
    await db.query(
      `
      INSERT INTO faculty_departments (faculty_id, department_id)
      VALUES ($1, $2)
    `,
      [faculty.faculty_id, faculty.dept_id],
    );

    // Some faculty members are also associated with additional departments
    if (Math.random() > 0.7) {
      const otherDept = departments.find(
        (d) => d.department_id !== faculty.dept_id,
      );
      if (otherDept) {
        await db.query(
          `
          INSERT INTO faculty_departments (faculty_id, department_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `,
          [faculty.faculty_id, otherDept.department_id],
        );
      }
    }
  }

  console.log("✅ Faculty departments seeded");
}
