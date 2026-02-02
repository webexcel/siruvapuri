-- MySQL Schema for MatriMatch

-- Create database (run separately or use mysql command line)
-- CREATE DATABASE matrimonial_db;
-- USE matrimonial_db;

-- Drop tables if exist (for clean reinstall)
DROP TABLE IF EXISTS profile_views;
DROP TABLE IF EXISTS interests;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS preferences;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS membership_plans;
DROP TABLE IF EXISTS site_settings;

-- Admins table
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255), -- Nullable, set by admin after approval (hashed)
  plain_password VARCHAR(255), -- Plain text password for admin reference
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  age INT NOT NULL,
  gender ENUM('male', 'female', 'other') NOT NULL,
  payment_status ENUM('paid', 'unpaid') DEFAULT 'unpaid',
  membership_type ENUM('gold', 'silver', 'platinum', 'premium') DEFAULT NULL,
  membership_expiry DATE DEFAULT NULL,
  interested_membership ENUM('gold', 'silver', 'platinum', 'premium') DEFAULT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Migration script to add membership columns to existing users table (run if upgrading)
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_type ENUM('gold', 'platinum', 'premium') DEFAULT NULL;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_expiry DATE DEFAULT NULL;

-- Migration script to add full_name column to profiles table (run if upgrading)
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);

-- Profiles table
CREATE TABLE profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  full_name VARCHAR(255),

  -- Primary Information
  date_of_birth DATE,
  birth_place VARCHAR(100),
  height INT, -- Height in cm (e.g., 165 for 5'5")
  weight INT, -- Weight in kg
  complexion ENUM('very_fair', 'fair', 'wheatish', 'brown', 'dark') DEFAULT 'wheatish',
  blood_group VARCHAR(10),
  physical_status ENUM('normal', 'physically_challenged') DEFAULT 'normal',

  -- Background
  marital_status ENUM('never_married', 'second_marriage', 'divorced', 'widowed', 'separated') DEFAULT 'never_married',
  religion VARCHAR(100),
  caste VARCHAR(100),
  sub_caste VARCHAR(100),
  mother_tongue VARCHAR(100),

  -- Education & Career
  education VARCHAR(255),
  education_detail TEXT, -- UG, PG, Diploma, Others details
  occupation VARCHAR(255),
  company_name VARCHAR(255),
  working_place VARCHAR(100),
  annual_income VARCHAR(100),
  monthly_income VARCHAR(100),

  -- Horoscope Details
  time_of_birth VARCHAR(20),
  rasi VARCHAR(50),
  nakshatra VARCHAR(50), -- Star
  lagnam VARCHAR(50),
  kothram VARCHAR(100), -- Gothram
  dosham VARCHAR(100), -- Any dosham like Manglik
  matching_stars TEXT, -- Comma-separated list of matching stars

  -- Family Information
  father_name VARCHAR(255),
  father_occupation VARCHAR(255),
  father_status ENUM('alive', 'deceased') DEFAULT 'alive',
  mother_name VARCHAR(255),
  mother_occupation VARCHAR(255),
  mother_status ENUM('alive', 'deceased') DEFAULT 'alive',
  brothers_count INT DEFAULT 0,
  brothers_married INT DEFAULT 0,
  sisters_count INT DEFAULT 0,
  sisters_married INT DEFAULT 0,
  family_type ENUM('joint', 'nuclear') DEFAULT 'nuclear',
  family_status ENUM('middle_class', 'upper_middle_class', 'rich', 'affluent') DEFAULT 'middle_class',
  own_house ENUM('yes', 'no', 'rented') DEFAULT 'yes',
  native_place VARCHAR(100),

  -- Contact & Address
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  pincode VARCHAR(10),

  -- Alliance Expectations
  expected_age_min INT,
  expected_age_max INT,
  expected_qualification VARCHAR(255),
  expected_location VARCHAR(255),
  expected_income VARCHAR(100),

  -- Other Details
  about_me TEXT,
  profile_picture VARCHAR(255),
  looking_for TEXT,
  hobbies TEXT,

  -- Profile Created By
  created_by ENUM('self', 'parent', 'sibling', 'friend', 'relative') DEFAULT 'self',

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Preferences table
CREATE TABLE preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  age_min INT DEFAULT 21,
  age_max INT DEFAULT 35,
  height_min INT DEFAULT 150,
  height_max INT DEFAULT 200,
  marital_status VARCHAR(255),
  religion VARCHAR(100),
  education VARCHAR(255),
  occupation VARCHAR(255),
  location VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Matches table
CREATE TABLE matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  matched_user_id INT NOT NULL,
  match_score INT DEFAULT 0,
  status ENUM('pending', 'accepted', 'rejected', 'blocked') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_match (user_id, matched_user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (matched_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Interest/Likes table
CREATE TABLE interests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  status ENUM('sent', 'accepted', 'rejected') DEFAULT 'sent',
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_interest (sender_id, receiver_id),
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Views/Profile Visits table
CREATE TABLE profile_views (
  id INT AUTO_INCREMENT PRIMARY KEY,
  viewer_id INT NOT NULL,
  viewed_id INT NOT NULL,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (viewer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (viewed_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Membership Plans table
CREATE TABLE membership_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  price DECIMAL(10,2) NOT NULL,
  duration_months INT NOT NULL,
  profile_views_limit INT DEFAULT NULL,
  features JSON DEFAULT NULL,
  color VARCHAR(100) DEFAULT 'from-gray-400 to-gray-600',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Site Settings table
CREATE TABLE site_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default membership plans
INSERT INTO membership_plans (name, price, duration_months, profile_views_limit, features, color, is_active) VALUES
  ('Gold', 2999, 3, 50, '["View 50 Profiles", "Send 25 Interests", "Chat Support"]', 'from-yellow-400 to-yellow-600', true),
  ('Platinum', 4999, 6, 150, '["View 150 Profiles", "Send 75 Interests", "Priority Support", "Profile Highlight"]', 'from-gray-300 to-gray-500', true),
  ('Premium', 7999, 12, NULL, '["Unlimited Profiles", "Unlimited Interests", "24/7 Support", "Verified Badge", "Featured Profile"]', 'from-purple-400 to-purple-600', true);

-- Insert default theme settings
INSERT INTO site_settings (setting_key, setting_value) VALUES
  ('theme', '{"primary": "#1EA826", "primaryDark": "#0B7813", "primaryLight": "#1f7a4d", "gold": "#FFFFFF", "goldLight": "#f5e6b0", "maroon": "#7a1f2b", "ivory": "#fffaf0"}');

-- Create indexes for better performance
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_gender ON users(gender);
CREATE INDEX idx_users_payment_status ON users(payment_status);
CREATE INDEX idx_users_is_approved ON users(is_approved);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_city ON profiles(city);
CREATE INDEX idx_profiles_religion ON profiles(religion);
CREATE INDEX idx_preferences_user_id ON preferences(user_id);
CREATE INDEX idx_matches_user_id ON matches(user_id);
CREATE INDEX idx_matches_matched_user_id ON matches(matched_user_id);
CREATE INDEX idx_interests_sender_id ON interests(sender_id);
CREATE INDEX idx_interests_receiver_id ON interests(receiver_id);
CREATE INDEX idx_profile_views_viewer_id ON profile_views(viewer_id);
CREATE INDEX idx_profile_views_viewed_id ON profile_views(viewed_id);

-- Note: MySQL automatically updates updated_at column with ON UPDATE CURRENT_TIMESTAMP
-- No need for triggers like in PostgreSQL
