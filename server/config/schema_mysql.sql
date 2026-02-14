-- MySQL Schema for MatriMatch

-- Create database (run separately)
-- CREATE DATABASE matrimonial_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
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
  membership_type VARCHAR(50) DEFAULT NULL,
  membership_expiry DATE DEFAULT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Profiles table
CREATE TABLE profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  full_name VARCHAR(255),
  height INT, -- Height in cm
  weight INT, -- Weight in kg
  marital_status ENUM('never_married', 'divorced', 'widowed', 'separated') DEFAULT 'never_married',
  religion VARCHAR(100),
  caste VARCHAR(100),
  mother_tongue VARCHAR(100),
  education VARCHAR(255),
  occupation VARCHAR(255),
  annual_income VARCHAR(100),
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  about_me TEXT,
  profile_picture VARCHAR(255),
  looking_for TEXT,
  hobbies TEXT,
  created_by ENUM('self', 'parent', 'sibling', 'friend') DEFAULT 'self',
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
  features JSON DEFAULT NULL, -- MySQL uses JSON instead of TEXT[]
  color VARCHAR(100) DEFAULT 'from-gray-400 to-gray-600',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default membership plans
INSERT INTO membership_plans (name, price, duration_months, features, color, is_active) VALUES
  ('Gold', 2999, 3, '["View 50 Profiles", "Send 25 Interests", "Chat Support"]', 'from-yellow-400 to-yellow-600', true),
  ('Platinum', 4999, 6, '["View 150 Profiles", "Send 75 Interests", "Priority Support", "Profile Highlight"]', 'from-gray-300 to-gray-500', true),
  ('Premium', 7999, 12, '["Unlimited Profiles", "Unlimited Interests", "24/7 Support", "Verified Badge", "Featured Profile"]', 'from-purple-400 to-purple-600', true);

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
