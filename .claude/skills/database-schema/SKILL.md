---
name: database-schema
description: Design and manage databases by creating tables, migrations, and well-structured schemas. Use for backend and data-driven applications.
---

# Database Schema & Migrations

## Instructions

1. **Schema design**

   - Identify core entities
   - Define relationships between tables
   - Normalize data to reduce redundancy

2. **Table creation**

   - Use clear and consistent table names
   - Define primary keys
   - Add foreign keys for relationships
   - Select appropriate data types

3. **Migrations**
   - Create versioned migration files
   - Support forward (up) and rollback (down) operations
   - Apply changes incrementally
   - Keep migrations small and focused

## Best Practices

- Follow consistent naming conventions
- Always use migrations instead of manual database changes
- Enforce data integrity with constraints
- Index frequently queried columns
- Design schemas with scalability in mind

## Example Structure

```sql
-- users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
```
