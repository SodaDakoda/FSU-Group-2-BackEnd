# FSU Database Seed Data Summary

## Overview

This document provides a comprehensive summary of the seed data populated in the FSU database through the `seed.js` file.

## User Accounts

### Visitor Account

- **Email**: `visitor@fsu.edu`
- **Password**: `visitor123`
- **Role**: visitor

### Administrator Account

- **Email**: `admin@fsu.edu`
- **Password**: `admin123`
- **Role**: administrator

> **Note**: Passwords are securely hashed using bcrypt with 10 salt rounds.

---

## Departments (10 Total)

| Department                  | Description                                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Computer Science**        | Offers comprehensive programs in software engineering, artificial intelligence, and computational theory.          |
| **Mathematics**             | Provides rigorous training in pure and applied mathematics, statistics, and mathematical modeling.                 |
| **Physics**                 | Explores fundamental principles of the universe through theoretical and experimental research.                     |
| **Biology**                 | Studies living organisms and their interactions with the environment at molecular, cellular, and ecosystem levels. |
| **Chemistry**               | Investigates matter, its properties, composition, and transformations.                                             |
| **English**                 | Explores literature, creative writing, rhetoric, and composition across diverse cultural contexts.                 |
| **History**                 | Examines past events, cultures, and societies to understand present and future trends.                             |
| **Psychology**              | Investigates human behavior, cognition, and mental processes through scientific research.                          |
| **Economics**               | Analyzes production, distribution, and consumption of goods and services in society.                               |
| **Business Administration** | Prepares students for leadership roles in modern organizations.                                                    |

### Department Resources

Each department includes:

- **2 Images** per department (primary and secondary)
  - Images use placeholder URLs from `picsum.photos`
- **Contact Information**:
  - Department email: `[departmentname]@fsu.edu`
  - Phone number: Random (850) area code
  - Office location: Assigned building and room number

---

## Faculty Members (23 Total)

### Computer Science (3 Faculty)

1. **Dr. Sarah Johnson** - Professor of Computer Science
   - Specializes in artificial intelligence and machine learning
2. **Dr. Michael Chen** - Associate Professor of Software Engineering
   - Focuses on software architecture and distributed systems
3. **Dr. Emily Rodriguez** - Assistant Professor of Cybersecurity
   - Researches network security and cryptography

### Mathematics (2 Faculty)

4. **Dr. David Williams** - Professor of Pure Mathematics
   - Expert in algebraic topology and category theory
5. **Dr. Lisa Anderson** - Associate Professor of Applied Mathematics
   - Works on mathematical modeling and numerical analysis

### Physics (2 Faculty)

6. **Dr. Robert Thompson** - Professor of Theoretical Physics
   - Researches quantum mechanics and particle physics
7. **Dr. Jennifer Martinez** - Associate Professor of Astrophysics
   - Studies stellar evolution and cosmology

### Biology (3 Faculty)

8. **Dr. James Brown** - Professor of Molecular Biology
   - Investigates gene expression and cellular mechanisms
9. **Dr. Maria Garcia** - Associate Professor of Ecology
   - Focuses on ecosystem dynamics and conservation biology
10. **Dr. Daniel Lee** - Assistant Professor of Genetics
    - Researches population genetics and evolutionary biology

### Chemistry (2 Faculty)

11. **Dr. Patricia Wilson** - Professor of Organic Chemistry
    - Specializes in synthetic organic chemistry and drug design
12. **Dr. Christopher Davis** - Associate Professor of Physical Chemistry
    - Studies thermodynamics and chemical kinetics

### English (2 Faculty)

13. **Dr. Amanda Taylor** - Professor of American Literature
    - Expert in 19th-century American fiction and poetry
14. **Dr. Richard Moore** - Associate Professor of Creative Writing
    - Award-winning novelist and poet

### History (2 Faculty)

15. **Dr. Barbara Jackson** - Professor of European History
    - Specializes in medieval and Renaissance European history
16. **Dr. Kevin White** - Associate Professor of American History
    - Researches Civil War and Reconstruction era

### Psychology (2 Faculty)

17. **Dr. Nancy Harris** - Professor of Clinical Psychology
    - Focuses on cognitive behavioral therapy and mental health treatment
18. **Dr. Steven Martin** - Associate Professor of Developmental Psychology
    - Studies child development and educational psychology

### Economics (2 Faculty)

19. **Dr. Michelle Clark** - Professor of Macroeconomics
    - Researches monetary policy and international economics
20. **Dr. Thomas Lewis** - Associate Professor of Behavioral Economics
    - Studies decision-making and market behavior

### Business Administration (3 Faculty)

21. **Dr. Elizabeth Walker** - Professor of Management
    - Specializes in organizational behavior and strategic management
22. **Dr. Matthew Hall** - Associate Professor of Finance
    - Focuses on corporate finance and investment strategies
23. **Dr. Sandra Young** - Assistant Professor of Marketing
    - Researches digital marketing and consumer behavior

### Faculty Resources

Each faculty member includes:

- **Profile Image**: Avatar from `pravatar.cc`
- **Contact Information**:
  - Email: `firstname.lastname@fsu.edu`
  - Phone: Random (850) area code
  - Office location: Building and office number
  - Personal website: `https://www.fsu.edu/faculty/firstname.lastname`
- **Department Associations**: Primary department + potential secondary department affiliations

---

## Database Tables Populated

### Core Tables

- ✅ `users` - 2 accounts (visitor and administrator)
- ✅ `departments` - 10 departments
- ✅ `faculty` - 23 faculty members

### Relationship Tables

- ✅ `department_images` - 20 images (2 per department)
- ✅ `faculty_images` - 23 profile images (1 per faculty)
- ✅ `department_contacts` - 10 contact records (1 per department)
- ✅ `faculty_contacts` - 23 contact records (1 per faculty)
- ✅ `faculty_departments` - Junction table linking faculty to departments

---

## Image Resources

### Department Images

- **Source**: `https://picsum.photos/seed/[departmentname]/800/600`
- **Count**: 2 per department (primary and secondary)
- **Alt Text**: Descriptive text for accessibility

### Faculty Images

- **Source**: `https://i.pravatar.cc/300?u=[facultyname]`
- **Count**: 1 per faculty member
- **Alt Text**: "[Name] profile picture"

---

## Running the Seed File

To populate the database with this seed data:

```bash
node db/seed.js
```

The seed script will:

1. Clear all existing data from tables (in proper order to respect foreign key constraints)
2. Insert user accounts with hashed passwords
3. Create departments with descriptions
4. Add department images and contact information
5. Create faculty members with biographical information
6. Add faculty images and contact information
7. Establish faculty-department relationships

---

## Notes

- All passwords are hashed using bcrypt before storage
- Foreign key relationships are properly maintained
- Some faculty members (~30% chance) are associated with multiple departments
- Phone numbers and office locations are randomly generated for realism
- All email addresses follow the format: `[identifier]@fsu.edu`
- Timestamps (`created_at`, `updated_at`) are automatically set to current time

---

**Last Updated**: January 22, 2026
