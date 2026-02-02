-- Migration: Add membership_plans table (MySQL)
-- Run this script if membership_plans table doesn't exist

-- Create Membership Plans table
CREATE TABLE IF NOT EXISTS membership_plans (
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

-- Insert default membership plans (only if table is empty)
INSERT IGNORE INTO membership_plans (name, price, duration_months, profile_views_limit, features, color, is_active)
VALUES
  ('Gold', 2999, 3, 50, '["View 50 Profiles", "Send 25 Interests", "Chat Support"]', 'from-yellow-400 to-yellow-600', true),
  ('Platinum', 4999, 6, 150, '["View 150 Profiles", "Send 75 Interests", "Priority Support", "Profile Highlight"]', 'from-gray-300 to-gray-500', true),
  ('Premium', 7999, 12, NULL, '["Unlimited Profiles", "Unlimited Interests", "24/7 Support", "Verified Badge", "Featured Profile"]', 'from-purple-400 to-purple-600', true);

-- Note: MySQL automatically updates updated_at column with ON UPDATE CURRENT_TIMESTAMP
-- No need for triggers like in PostgreSQL
