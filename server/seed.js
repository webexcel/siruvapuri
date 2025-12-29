const bcrypt = require('bcryptjs');
const db = require('./config/database');

const seedData = async () => {
  try {
    console.log('Starting database seeding...');

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Sample users
    const users = [
      { email: 'john.doe@example.com', password: hashedPassword, full_name: 'John Doe', phone: '9876543210', gender: 'male', date_of_birth: '1995-05-15' },
      { email: 'priya.sharma@example.com', password: hashedPassword, full_name: 'Priya Sharma', phone: '9876543211', gender: 'female', date_of_birth: '1997-08-20' },
      { email: 'rahul.kumar@example.com', password: hashedPassword, full_name: 'Rahul Kumar', phone: '9876543212', gender: 'male', date_of_birth: '1993-03-10' },
      { email: 'anjali.patel@example.com', password: hashedPassword, full_name: 'Anjali Patel', phone: '9876543213', gender: 'female', date_of_birth: '1996-11-25' },
      { email: 'vikram.singh@example.com', password: hashedPassword, full_name: 'Vikram Singh', phone: '9876543214', gender: 'male', date_of_birth: '1994-07-18' },
      { email: 'neha.gupta@example.com', password: hashedPassword, full_name: 'Neha Gupta', phone: '9876543215', gender: 'female', date_of_birth: '1998-01-30' },
      { email: 'amit.verma@example.com', password: hashedPassword, full_name: 'Amit Verma', phone: '9876543216', gender: 'male', date_of_birth: '1992-09-05' },
      { email: 'kavya.reddy@example.com', password: hashedPassword, full_name: 'Kavya Reddy', phone: '9876543217', gender: 'female', date_of_birth: '1995-12-12' }
    ];

    // Insert users
    for (const user of users) {
      const [result] = await db.query(
        'INSERT INTO users (email, password, full_name, phone, gender, date_of_birth) VALUES (?, ?, ?, ?, ?, ?)',
        [user.email, user.password, user.full_name, user.phone, user.gender, user.date_of_birth]
      );

      const userId = result.insertId;

      // Create profile based on gender
      const isMale = user.gender === 'male';
      const profile = {
        user_id: userId,
        height: isMale ? Math.floor(Math.random() * 20) + 165 : Math.floor(Math.random() * 15) + 155,
        weight: isMale ? Math.floor(Math.random() * 20) + 65 : Math.floor(Math.random() * 15) + 50,
        marital_status: 'never_married',
        religion: ['Hindu', 'Muslim', 'Christian', 'Sikh'][Math.floor(Math.random() * 4)],
        caste: ['General', 'OBC', 'SC', 'ST'][Math.floor(Math.random() * 4)],
        mother_tongue: ['Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali'][Math.floor(Math.random() * 5)],
        education: ['B.Tech', 'MBA', 'MBBS', 'M.Sc', 'B.Com', 'CA'][Math.floor(Math.random() * 6)],
        occupation: ['Software Engineer', 'Doctor', 'Chartered Accountant', 'Business Analyst', 'Teacher', 'Entrepreneur'][Math.floor(Math.random() * 6)],
        annual_income: ['5-10 LPA', '10-15 LPA', '15-20 LPA', '20-30 LPA'][Math.floor(Math.random() * 4)],
        city: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune'][Math.floor(Math.random() * 6)],
        state: 'Maharashtra',
        country: 'India',
        about_me: `I am a ${user.full_name.split(' ')[0]} and I'm looking for a life partner who shares similar values and interests.`,
        profile_picture: `https://i.pravatar.cc/300?img=${userId}`,
        looking_for: 'Looking for someone who is honest, caring, and family-oriented.',
        hobbies: ['Reading', 'Traveling', 'Cooking', 'Music', 'Sports'][Math.floor(Math.random() * 5)],
        created_by: 'self'
      };

      await db.query(
        `INSERT INTO profiles (user_id, height, weight, marital_status, religion, caste, mother_tongue,
         education, occupation, annual_income, city, state, country, about_me, profile_picture,
         looking_for, hobbies, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [profile.user_id, profile.height, profile.weight, profile.marital_status, profile.religion,
         profile.caste, profile.mother_tongue, profile.education, profile.occupation, profile.annual_income,
         profile.city, profile.state, profile.country, profile.about_me, profile.profile_picture,
         profile.looking_for, profile.hobbies, profile.created_by]
      );

      // Create preferences
      await db.query(
        `INSERT INTO preferences (user_id, age_min, age_max, height_min, height_max)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, isMale ? 23 : 25, isMale ? 30 : 35, isMale ? 155 : 170, isMale ? 170 : 185]
      );

      console.log(`Created user: ${user.email}`);
    }

    console.log('Database seeding completed successfully!');
    console.log('\nTest credentials:');
    console.log('Email: john.doe@example.com | Password: password123');
    console.log('Email: priya.sharma@example.com | Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
