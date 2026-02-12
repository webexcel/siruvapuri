-- Run this file to reset the database with the new schema
-- This will delete all existing data!

-- Connect to postgres database first
\c postgres

-- Drop and recreate database
DROP DATABASE IF EXISTS matrimonial_db;
CREATE DATABASE matrimonial_db;

-- Connect to the new database
\c matrimonial_db

-- Run the schema
-- After running this file, run: \i server/config/schema.sql
