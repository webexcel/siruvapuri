-- PostgreSQL Schema for MatriMatch

-- Create database (run separately or use psql command line)
-- CREATE DATABASE matrimonial_db;
-- \c matrimonial_db;

-- Drop tables if exist (for clean reinstall)
DROP TABLE IF EXISTS profile_views CASCADE;
DROP TABLE IF EXISTS interests CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS preferences CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profiles table
CREATE TABLE profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  height INTEGER, -- Height in cm
  weight INTEGER, -- Weight in kg
  marital_status VARCHAR(20) DEFAULT 'never_married' CHECK (marital_status IN ('never_married', 'divorced', 'widowed', 'separated')),
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
  created_by VARCHAR(20) DEFAULT 'self' CHECK (created_by IN ('self', 'parent', 'sibling', 'friend'))
);

-- Preferences table
CREATE TABLE preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  age_min INTEGER DEFAULT 21,
  age_max INTEGER DEFAULT 35,
  height_min INTEGER DEFAULT 150,
  height_max INTEGER DEFAULT 200,
  marital_status VARCHAR(255),
  religion VARCHAR(100),
  education VARCHAR(255),
  occupation VARCHAR(255),
  location VARCHAR(255)
);

-- Matches table
CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  matched_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_score INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, matched_user_id)
);

-- Interest/Likes table
CREATE TABLE interests (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'accepted', 'rejected')),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (sender_id, receiver_id)
);

-- Views/Profile Visits table
CREATE TABLE profile_views (
  id SERIAL PRIMARY KEY,
  viewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_gender ON users(gender);
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interests_updated_at BEFORE UPDATE ON interests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
