CREATE DATABASE IF NOT EXISTS matrimonial_db;
USE matrimonial_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  gender ENUM('male', 'female', 'other') NOT NULL,
  date_of_birth DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  height INT COMMENT 'Height in cm',
  weight INT COMMENT 'Weight in kg',
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
CREATE TABLE IF NOT EXISTS preferences (
  id INT PRIMARY KEY AUTO_INCREMENT,
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
CREATE TABLE IF NOT EXISTS matches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  matched_user_id INT NOT NULL,
  match_score INT DEFAULT 0,
  status ENUM('pending', 'accepted', 'rejected', 'blocked') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (matched_user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_match (user_id, matched_user_id)
);

-- Interest/Likes table
CREATE TABLE IF NOT EXISTS interests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  status ENUM('sent', 'accepted', 'rejected') DEFAULT 'sent',
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_interest (sender_id, receiver_id)
);

-- Views/Profile Visits table
CREATE TABLE IF NOT EXISTS profile_views (
  id INT PRIMARY KEY AUTO_INCREMENT,
  viewer_id INT NOT NULL,
  viewed_id INT NOT NULL,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (viewer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (viewed_id) REFERENCES users(id) ON DELETE CASCADE
);
