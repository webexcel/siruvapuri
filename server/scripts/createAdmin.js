const bcrypt = require('bcryptjs');
const db = require('../config/database');

const createAdmin = async () => {
  try {
    const email = 'admin@siruvapuri.com';
    const password = 'admin123'; // Change this to a secure password
    const fullName = 'Admin User';

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if admin already exists
    const existingAdmin = await db.query('SELECT id FROM admins WHERE email = ?', [email]);

    if (existingAdmin.rows.length > 0) {
      console.log('Admin user already exists!');
      console.log('Email:', email);
      console.log('You can update the password if needed.');
      process.exit(0);
    }

    // Insert admin
    const result = await db.query(
      'INSERT INTO admins (email, password, full_name) VALUES (?, ?, ?)',
      [email, hashedPassword, fullName]
    );

    console.log('Admin user created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
