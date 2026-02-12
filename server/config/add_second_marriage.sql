-- Migration to add 'second_marriage' to marital_status ENUM
-- Run this on existing database to add the new option

ALTER TABLE profiles
MODIFY COLUMN marital_status ENUM('never_married', 'second_marriage', 'divorced', 'widowed', 'separated') DEFAULT 'never_married';
