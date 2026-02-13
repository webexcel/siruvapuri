const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seedData() {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: 'main',
    password: 'P@mani4u',
    database: 'matrimonial_db'
  });

  try {
    console.log('Starting database seed...');

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('Test@123', 10);

    // Sample users data - mix of male and female profiles
    const users = [
      // Female profiles
      { first_name: 'Priya', middle_name: null, last_name: 'Sharma', phone: '9840123456', age: 25, gender: 'female' },
      { first_name: 'Ananya', middle_name: null, last_name: 'Krishnan', phone: '9841234567', age: 27, gender: 'female' },
      { first_name: 'Divya', middle_name: 'R', last_name: 'Nair', phone: '9842345678', age: 24, gender: 'female' },
      { first_name: 'Lakshmi', middle_name: null, last_name: 'Sundaram', phone: '9843456789', age: 26, gender: 'female' },
      { first_name: 'Meera', middle_name: 'S', last_name: 'Reddy', phone: '9944567890', age: 28, gender: 'female' },
      { first_name: 'Kavitha', middle_name: null, last_name: 'Murugan', phone: '9845678901', age: 23, gender: 'female' },
      { first_name: 'Deepa', middle_name: 'K', last_name: 'Venkatesh', phone: '9846789012', age: 29, gender: 'female' },
      { first_name: 'Ramya', middle_name: null, last_name: 'Iyer', phone: '9847890123', age: 25, gender: 'female' },
      { first_name: 'Sneha', middle_name: null, last_name: 'Pillai', phone: '9848901234', age: 26, gender: 'female' },
      { first_name: 'Pooja', middle_name: 'M', last_name: 'Balan', phone: '9849012345', age: 24, gender: 'female' },
      // Male profiles
      { first_name: 'Arun', middle_name: null, last_name: 'Kumar', phone: '9962345678', age: 28, gender: 'male' },
      { first_name: 'Vijay', middle_name: 'S', last_name: 'Rajan', phone: '9963456789', age: 30, gender: 'male' },
      { first_name: 'Karthik', middle_name: null, last_name: 'Nathan', phone: '9964567890', age: 27, gender: 'male' },
      { first_name: 'Suresh', middle_name: 'K', last_name: 'Babu', phone: '9965678901', age: 29, gender: 'male' },
      { first_name: 'Rajesh', middle_name: null, last_name: 'Menon', phone: '9966789012', age: 31, gender: 'male' },
      { first_name: 'Ganesh', middle_name: 'V', last_name: 'Naidu', phone: '9967890123', age: 26, gender: 'male' },
      { first_name: 'Mohan', middle_name: null, last_name: 'Raj', phone: '9968901234', age: 28, gender: 'male' },
      { first_name: 'Prasad', middle_name: 'B', last_name: 'Rao', phone: '9969012345', age: 32, gender: 'male' },
      { first_name: 'Dinesh', middle_name: null, last_name: 'Subramanian', phone: '9970123456', age: 27, gender: 'male' },
      { first_name: 'Senthil', middle_name: 'M', last_name: 'Kumar', phone: '9971234567', age: 29, gender: 'male' },
    ];

    // Random profile photos for testing - gender-appropriate portraits
    const femalePhotos = [
      'https://randomuser.me/api/portraits/women/31.jpg',
      'https://randomuser.me/api/portraits/women/32.jpg',
      'https://randomuser.me/api/portraits/women/33.jpg',
      'https://randomuser.me/api/portraits/women/34.jpg',
      'https://randomuser.me/api/portraits/women/35.jpg',
      'https://randomuser.me/api/portraits/women/36.jpg',
      'https://randomuser.me/api/portraits/women/37.jpg',
      'https://randomuser.me/api/portraits/women/38.jpg',
      'https://randomuser.me/api/portraits/women/39.jpg',
      'https://randomuser.me/api/portraits/women/40.jpg',
    ];

    const malePhotos = [
      'https://randomuser.me/api/portraits/men/31.jpg',
      'https://randomuser.me/api/portraits/men/32.jpg',
      'https://randomuser.me/api/portraits/men/33.jpg',
      'https://randomuser.me/api/portraits/men/34.jpg',
      'https://randomuser.me/api/portraits/men/35.jpg',
      'https://randomuser.me/api/portraits/men/36.jpg',
      'https://randomuser.me/api/portraits/men/37.jpg',
      'https://randomuser.me/api/portraits/men/38.jpg',
      'https://randomuser.me/api/portraits/men/39.jpg',
      'https://randomuser.me/api/portraits/men/40.jpg',
    ];

    // Sample profiles data
    const profilesData = [
      // Female profiles
      { height: 160, weight: 55, marital_status: 'never_married', religion: 'Hindu', caste: 'Brahmin', mother_tongue: 'Tamil', education: 'B.Tech Computer Science', occupation: 'Software Engineer', annual_income: '8-10 LPA', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001', address: '12/5, Anna Nagar East, Near Anna Arch', about_me: 'Simple and family-oriented girl looking for a life partner who values traditions.', hobbies: 'Reading, Music, Cooking', profile_picture: femalePhotos[0] },
      { height: 162, weight: 52, marital_status: 'never_married', religion: 'Hindu', caste: 'Nair', mother_tongue: 'Malayalam', education: 'MBA Finance', occupation: 'Bank Manager', annual_income: '12-15 LPA', city: 'Kochi', state: 'Kerala', pincode: '682001', address: '45, Marine Drive, Ernakulam', about_me: 'Career-oriented individual who believes in balancing work and family life.', hobbies: 'Dancing, Traveling, Photography', profile_picture: femalePhotos[1] },
      { height: 158, weight: 50, marital_status: 'never_married', religion: 'Hindu', caste: 'Mudaliar', mother_tongue: 'Tamil', education: 'MBBS', occupation: 'Doctor', annual_income: '15-20 LPA', city: 'Coimbatore', state: 'Tamil Nadu', pincode: '641001', address: '78, RS Puram, Near Brookefields Mall', about_me: 'Dedicated doctor looking for a understanding partner.', hobbies: 'Yoga, Meditation, Music', profile_picture: femalePhotos[2] },
      { height: 165, weight: 58, marital_status: 'never_married', religion: 'Hindu', caste: 'Iyer', mother_tongue: 'Tamil', education: 'M.Sc Chemistry', occupation: 'Lecturer', annual_income: '6-8 LPA', city: 'Madurai', state: 'Tamil Nadu', pincode: '625001', address: '23, KK Nagar, Near Meenakshi Temple', about_me: 'Traditional values with modern outlook. Love teaching.', hobbies: 'Classical Music, Reading, Gardening', profile_picture: femalePhotos[3] },
      { height: 159, weight: 54, marital_status: 'never_married', religion: 'Hindu', caste: 'Reddy', mother_tongue: 'Telugu', education: 'B.Com, CA', occupation: 'Chartered Accountant', annual_income: '18-22 LPA', city: 'Hyderabad', state: 'Telangana', pincode: '500001', address: '56, Banjara Hills, Road No. 12', about_me: 'Independent and ambitious professional seeking like-minded partner.', hobbies: 'Badminton, Movies, Travel', profile_picture: femalePhotos[4] },
      { height: 156, weight: 48, marital_status: 'never_married', religion: 'Hindu', caste: 'Gounder', mother_tongue: 'Tamil', education: 'B.E. Electronics', occupation: 'Software Developer', annual_income: '10-12 LPA', city: 'Tiruchirappalli', state: 'Tamil Nadu', pincode: '620001', address: '34, Thillai Nagar, Main Road', about_me: 'Fun-loving and cheerful person looking for genuine connection.', hobbies: 'Painting, Cooking, Movies', profile_picture: femalePhotos[5] },
      { height: 163, weight: 56, marital_status: 'divorced', religion: 'Hindu', caste: 'Naicker', mother_tongue: 'Tamil', education: 'MBA HR', occupation: 'HR Manager', annual_income: '14-16 LPA', city: 'Bangalore', state: 'Karnataka', pincode: '560001', address: '89, Koramangala, 5th Block', about_me: 'Looking for a second chance at happiness with someone understanding.', hobbies: 'Yoga, Travel, Reading', profile_picture: femalePhotos[6] },
      { height: 157, weight: 51, marital_status: 'never_married', religion: 'Hindu', caste: 'Iyengar', mother_tongue: 'Tamil', education: 'B.Sc Nursing', occupation: 'Nurse', annual_income: '5-6 LPA', city: 'Salem', state: 'Tamil Nadu', pincode: '636001', address: '67, Fairlands, Near Bus Stand', about_me: 'Caring and compassionate by profession and nature.', hobbies: 'Music, Cooking, Social Service', profile_picture: femalePhotos[7] },
      { height: 161, weight: 53, marital_status: 'never_married', religion: 'Hindu', caste: 'Pillai', mother_tongue: 'Malayalam', education: 'M.Tech', occupation: 'Project Manager', annual_income: '20-25 LPA', city: 'Thiruvananthapuram', state: 'Kerala', pincode: '695001', address: '12, Kowdiar, Near Kanakakunnu Palace', about_me: 'Ambitious professional seeking an equally driven partner.', hobbies: 'Reading, Swimming, Technology', profile_picture: femalePhotos[8] },
      { height: 155, weight: 49, marital_status: 'never_married', religion: 'Hindu', caste: 'Menon', mother_tongue: 'Malayalam', education: 'BDS', occupation: 'Dentist', annual_income: '12-14 LPA', city: 'Kozhikode', state: 'Kerala', pincode: '673001', address: '45, Mavoor Road, Near Fathima Hospital', about_me: 'Cheerful and positive person who loves to make people smile.', hobbies: 'Crafts, Baking, Music', profile_picture: femalePhotos[9] },
      // Male profiles
      { height: 175, weight: 72, marital_status: 'never_married', religion: 'Hindu', caste: 'Naidu', mother_tongue: 'Telugu', education: 'B.Tech, MS (USA)', occupation: 'Senior Software Engineer', annual_income: '25-30 LPA', city: 'Bangalore', state: 'Karnataka', pincode: '560037', address: '123, Whitefield, Near ITPL', about_me: 'Settled professional looking for a caring and understanding life partner.', hobbies: 'Cricket, Gym, Movies', profile_picture: malePhotos[0] },
      { height: 172, weight: 68, marital_status: 'never_married', religion: 'Hindu', caste: 'Pillai', mother_tongue: 'Tamil', education: 'MBA', occupation: 'Business Analyst', annual_income: '18-20 LPA', city: 'Chennai', state: 'Tamil Nadu', pincode: '600040', address: '56, Velachery, Near Phoenix Mall', about_me: 'Family-oriented person with traditional values and modern thinking.', hobbies: 'Music, Travel, Photography', profile_picture: malePhotos[1] },
      { height: 178, weight: 75, marital_status: 'never_married', religion: 'Hindu', caste: 'Mudaliar', mother_tongue: 'Tamil', education: 'B.E. Mechanical', occupation: 'Manager - Manufacturing', annual_income: '15-18 LPA', city: 'Coimbatore', state: 'Tamil Nadu', pincode: '641014', address: '78, Saibaba Colony, Near KMCH', about_me: 'Down-to-earth person who values honesty and loyalty.', hobbies: 'Football, Reading, Cooking', profile_picture: malePhotos[2] },
      { height: 170, weight: 65, marital_status: 'never_married', religion: 'Hindu', caste: 'Brahmin', mother_tongue: 'Tamil', education: 'MBBS, MD', occupation: 'Doctor', annual_income: '30-40 LPA', city: 'Chennai', state: 'Tamil Nadu', pincode: '600006', address: '34, Mylapore, Near Kapaleeshwarar Temple', about_me: 'Dedicated doctor looking for a supportive partner.', hobbies: 'Music, Books, Travel', profile_picture: malePhotos[3] },
      { height: 176, weight: 70, marital_status: 'second_marriage', religion: 'Hindu', caste: 'Nair', mother_tongue: 'Malayalam', education: 'M.Tech', occupation: 'Technical Lead', annual_income: '22-25 LPA', city: 'Kochi', state: 'Kerala', pincode: '682020', address: '89, Kakkanad, Infopark Road', about_me: 'Looking for a mature and understanding partner for companionship.', hobbies: 'Reading, Gardening, Music', profile_picture: malePhotos[4] },
      { height: 173, weight: 67, marital_status: 'never_married', religion: 'Hindu', caste: 'Naicker', mother_tongue: 'Tamil', education: 'B.Com, MBA', occupation: 'Finance Manager', annual_income: '16-18 LPA', city: 'Madurai', state: 'Tamil Nadu', pincode: '625020', address: '45, Goripalayam, Near Railway Station', about_me: 'Ambitious and goal-oriented individual seeking life partner.', hobbies: 'Cricket, Chess, Travel', profile_picture: malePhotos[5] },
      { height: 174, weight: 71, marital_status: 'never_married', religion: 'Hindu', caste: 'Gounder', mother_tongue: 'Tamil', education: 'BE, MBA', occupation: 'Entrepreneur', annual_income: '20-30 LPA', city: 'Erode', state: 'Tamil Nadu', pincode: '638001', address: '23, EVN Road, Near Collectorate', about_me: 'Business owner looking for an educated and supportive partner.', hobbies: 'Business, Travel, Sports', profile_picture: malePhotos[6] },
      { height: 177, weight: 73, marital_status: 'never_married', religion: 'Hindu', caste: 'Rao', mother_tongue: 'Telugu', education: 'B.Tech, M.Tech', occupation: 'Data Scientist', annual_income: '28-32 LPA', city: 'Hyderabad', state: 'Telangana', pincode: '500081', address: '67, Gachibowli, Near Microsoft Campus', about_me: 'Tech enthusiast looking for an intellectual companion.', hobbies: 'AI/ML, Reading, Gaming', profile_picture: malePhotos[7] },
      { height: 171, weight: 66, marital_status: 'never_married', religion: 'Hindu', caste: 'Iyer', mother_tongue: 'Tamil', education: 'CA', occupation: 'Chartered Accountant', annual_income: '20-25 LPA', city: 'Chennai', state: 'Tamil Nadu', pincode: '600017', address: '12, T. Nagar, Near Pondy Bazaar', about_me: 'Traditional upbringing with global exposure.', hobbies: 'Carnatic Music, Cricket, Movies', profile_picture: malePhotos[8] },
      { height: 175, weight: 69, marital_status: 'never_married', religion: 'Hindu', caste: 'Thevar', mother_tongue: 'Tamil', education: 'B.Tech CSE', occupation: 'Software Architect', annual_income: '35-40 LPA', city: 'Bangalore', state: 'Karnataka', pincode: '560103', address: '56, Electronic City Phase 1, Near Infosys', about_me: 'Well-settled professional seeking educated life partner.', hobbies: 'Traveling, Photography, Music', profile_picture: malePhotos[9] },
    ];

    // Insert users
    console.log('Inserting users...');
    const userIds = [];
    for (const user of users) {
      const [result] = await pool.execute(
        `INSERT INTO users (password, plain_password, first_name, middle_name, last_name, phone, age, gender, payment_status, is_approved)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'paid', true)`,
        [hashedPassword, 'Test@123', user.first_name, user.middle_name, user.last_name, user.phone, user.age, user.gender]
      );
      userIds.push(result.insertId);
      console.log(`  Created user: ${user.first_name} ${user.last_name} (ID: ${result.insertId})`);
    }

    // Insert profiles
    console.log('Inserting profiles...');
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      const user = users[i];
      const profile = profilesData[i];
      const fullName = user.middle_name
        ? `${user.first_name} ${user.middle_name} ${user.last_name}`
        : `${user.first_name} ${user.last_name}`;

      await pool.execute(
        `INSERT INTO profiles (user_id, full_name, height, weight, marital_status, religion, caste, mother_tongue, education, occupation, annual_income, city, state, country, pincode, address, about_me, hobbies, profile_picture)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'India', ?, ?, ?, ?, ?)`,
        [userId, fullName, profile.height, profile.weight, profile.marital_status, profile.religion, profile.caste, profile.mother_tongue, profile.education, profile.occupation, profile.annual_income, profile.city, profile.state, profile.pincode, profile.address, profile.about_me, profile.hobbies, profile.profile_picture]
      );
      console.log(`  Created profile for: ${fullName}`);
    }

    // Insert preferences for each user
    console.log('Inserting preferences...');
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      const user = users[i];

      // Set preference for opposite gender
      const ageMin = user.gender === 'female' ? user.age : user.age - 5;
      const ageMax = user.gender === 'female' ? user.age + 7 : user.age + 2;
      const heightMin = user.gender === 'female' ? 165 : 150;
      const heightMax = user.gender === 'female' ? 185 : 170;

      await pool.execute(
        `INSERT INTO preferences (user_id, age_min, age_max, height_min, height_max, religion, location)
         VALUES (?, ?, ?, ?, ?, 'Hindu', 'Tamil Nadu, Kerala, Karnataka, Telangana')`,
        [userId, ageMin, ageMax, heightMin, heightMax]
      );
    }

    console.log('\n=== Seed completed successfully! ===');
    console.log(`Created ${users.length} users with profiles`);
    console.log('\nLogin credentials for all users:');
    console.log('Password: Test@123');
    console.log('\nSample phones:');
    console.log('  Female: 9840123456, 9841234567');
    console.log('  Male: 9962345678, 9963456789');

  } catch (error) {
    console.error('Seed error:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('\nNote: Some users may already exist. Run this on a fresh database or delete existing users first.');
    }
  } finally {
    await pool.end();
  }
}

seedData();
