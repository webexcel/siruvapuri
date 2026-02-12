const bcrypt = require('bcryptjs');
const db = require('../config/database');

// Sample data arrays
const firstNamesMale = [
  'Rajesh', 'Amit', 'Suresh', 'Vikram', 'Karthik', 'Arun', 'Ramesh', 'Anand', 'Rohan', 'Vishal',
  'Praveen', 'Mahesh', 'Krishna', 'Dinesh', 'Naveen', 'Sanjay', 'Ravi', 'Manoj', 'Deepak', 'Ashok',
  'Ganesh', 'Vijay', 'Sunil', 'Ajay', 'Nitin', 'Sachin', 'Rahul', 'Varun'
];

const firstNamesFemale = [
  'Priya', 'Anjali', 'Kavya', 'Divya', 'Sneha', 'Pooja', 'Rani', 'Lakshmi', 'Meera', 'Nisha',
  'Radha', 'Sita', 'Geetha', 'Uma', 'Swathi', 'Deepika', 'Nandini', 'Bhavana', 'Rekha', 'Anitha',
  'Ramya', 'Sangeetha', 'Vanitha', 'Padma', 'Lalitha', 'Mythili', 'Shalini', 'Vidya'
];

const lastNames = [
  'Kumar', 'Reddy', 'Sharma', 'Patel', 'Singh', 'Nair', 'Menon', 'Iyer', 'Rao', 'Gupta',
  'Verma', 'Shah', 'Pillai', 'Naidu', 'Joshi', 'Desai', 'Kulkarni', 'Chopra', 'Bhat', 'Agarwal',
  'Srinivasan', 'Krishnan', 'Raman', 'Pandey', 'Mishra', 'Saxena'
];

const cities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
  'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
  'Visakhapatnam', 'Vadodara', 'Coimbatore', 'Kochi', 'Mysore', 'Mangalore'
];

const states = [
  'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Andhra Pradesh', 'Kerala', 'Gujarat',
  'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Madhya Pradesh', 'Punjab', 'Haryana'
];

const religions = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain'];

const castes = [
  'Brahmin', 'Kshatriya', 'Vaishya', 'Reddy', 'Nair', 'Ezhava', 'Patel', 'Jat', 'Maratha',
  'Kamma', 'Yadav', 'Kurmi', 'Scheduled Caste', 'Scheduled Tribe', 'OBC', 'Any'
];

const motherTongues = [
  'Hindi', 'Telugu', 'Tamil', 'Kannada', 'Malayalam', 'Marathi', 'Gujarati', 'Bengali',
  'Punjabi', 'Urdu', 'English'
];

const educations = [
  'B.Tech', 'M.Tech', 'MBA', 'B.Com', 'M.Com', 'BBA', 'B.Sc', 'M.Sc', 'BA', 'MA',
  'MBBS', 'MD', 'BCA', 'MCA', 'B.E', 'M.E', 'B.Pharm', 'M.Pharm', 'LLB', 'LLM'
];

const occupations = [
  'Software Engineer', 'Business Analyst', 'Data Scientist', 'Project Manager', 'Accountant',
  'Doctor', 'Lawyer', 'Teacher', 'Architect', 'Consultant', 'Marketing Manager', 'Sales Executive',
  'HR Manager', 'Finance Manager', 'Civil Engineer', 'Mechanical Engineer', 'Pharmacist',
  'Banker', 'Entrepreneur', 'Government Employee', 'Designer', 'CA'
];

const incomes = [
  '3-5 Lakhs', '5-7 Lakhs', '7-10 Lakhs', '10-15 Lakhs', '15-20 Lakhs', '20-30 Lakhs',
  '30-50 Lakhs', '50 Lakhs - 1 Crore', '1 Crore+'
];

const maritalStatuses = ['never_married', 'divorced', 'widowed'];

const hobbiesOptions = [
  'Reading, Traveling, Music',
  'Cooking, Dancing, Yoga',
  'Sports, Fitness, Photography',
  'Movies, Music, Art',
  'Gardening, Painting, Writing',
  'Trekking, Adventure Sports, Cycling',
  'Chess, Gaming, Technology',
  'Volunteering, Social Work, Teaching'
];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateUser(index, gender) {
  const firstName = gender === 'male' ? getRandomElement(firstNamesMale) : getRandomElement(firstNamesFemale);
  const lastName = getRandomElement(lastNames);
  const age = getRandomNumber(21, 45);
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@test.com`;
  const phone = `98${getRandomNumber(10000000, 99999999)}`;

  return {
    email,
    password: null, // Will be set by admin
    first_name: firstName,
    middle_name: Math.random() > 0.5 ? getRandomElement(firstNamesMale.concat(firstNamesFemale)) : null,
    last_name: lastName,
    phone,
    age,
    gender,
    is_approved: true, // Set to true so users can be matched
    payment_status: 'paid' // Set to paid so users show up in assign matches
  };
}

// Random profile photo URLs for testing (gender-appropriate portraits from picsum/ui-avatars)
function getRandomProfilePhoto(gender, index) {
  const malePhotos = [
    'https://randomuser.me/api/portraits/men/1.jpg',
    'https://randomuser.me/api/portraits/men/2.jpg',
    'https://randomuser.me/api/portraits/men/3.jpg',
    'https://randomuser.me/api/portraits/men/4.jpg',
    'https://randomuser.me/api/portraits/men/5.jpg',
    'https://randomuser.me/api/portraits/men/6.jpg',
    'https://randomuser.me/api/portraits/men/7.jpg',
    'https://randomuser.me/api/portraits/men/8.jpg',
    'https://randomuser.me/api/portraits/men/9.jpg',
    'https://randomuser.me/api/portraits/men/10.jpg',
    'https://randomuser.me/api/portraits/men/11.jpg',
    'https://randomuser.me/api/portraits/men/12.jpg',
    'https://randomuser.me/api/portraits/men/13.jpg',
    'https://randomuser.me/api/portraits/men/14.jpg',
    'https://randomuser.me/api/portraits/men/15.jpg',
    'https://randomuser.me/api/portraits/men/16.jpg',
    'https://randomuser.me/api/portraits/men/17.jpg',
    'https://randomuser.me/api/portraits/men/18.jpg',
    'https://randomuser.me/api/portraits/men/19.jpg',
    'https://randomuser.me/api/portraits/men/20.jpg',
    'https://randomuser.me/api/portraits/men/21.jpg',
    'https://randomuser.me/api/portraits/men/22.jpg',
    'https://randomuser.me/api/portraits/men/23.jpg',
    'https://randomuser.me/api/portraits/men/24.jpg',
    'https://randomuser.me/api/portraits/men/25.jpg',
  ];

  const femalePhotos = [
    'https://randomuser.me/api/portraits/women/1.jpg',
    'https://randomuser.me/api/portraits/women/2.jpg',
    'https://randomuser.me/api/portraits/women/3.jpg',
    'https://randomuser.me/api/portraits/women/4.jpg',
    'https://randomuser.me/api/portraits/women/5.jpg',
    'https://randomuser.me/api/portraits/women/6.jpg',
    'https://randomuser.me/api/portraits/women/7.jpg',
    'https://randomuser.me/api/portraits/women/8.jpg',
    'https://randomuser.me/api/portraits/women/9.jpg',
    'https://randomuser.me/api/portraits/women/10.jpg',
    'https://randomuser.me/api/portraits/women/11.jpg',
    'https://randomuser.me/api/portraits/women/12.jpg',
    'https://randomuser.me/api/portraits/women/13.jpg',
    'https://randomuser.me/api/portraits/women/14.jpg',
    'https://randomuser.me/api/portraits/women/15.jpg',
    'https://randomuser.me/api/portraits/women/16.jpg',
    'https://randomuser.me/api/portraits/women/17.jpg',
    'https://randomuser.me/api/portraits/women/18.jpg',
    'https://randomuser.me/api/portraits/women/19.jpg',
    'https://randomuser.me/api/portraits/women/20.jpg',
    'https://randomuser.me/api/portraits/women/21.jpg',
    'https://randomuser.me/api/portraits/women/22.jpg',
    'https://randomuser.me/api/portraits/women/23.jpg',
    'https://randomuser.me/api/portraits/women/24.jpg',
    'https://randomuser.me/api/portraits/women/25.jpg',
  ];

  const photos = gender === 'male' ? malePhotos : femalePhotos;
  return photos[index % photos.length];
}

function generateProfile(gender, age, index) {
  const heightMale = getRandomNumber(165, 185);
  const heightFemale = getRandomNumber(152, 172);
  const city = getRandomElement(cities);
  const state = getRandomElement(states);

  return {
    height: gender === 'male' ? heightMale : heightFemale,
    weight: gender === 'male' ? getRandomNumber(60, 90) : getRandomNumber(45, 70),
    marital_status: getRandomElement(maritalStatuses),
    religion: getRandomElement(religions),
    caste: getRandomElement(castes),
    mother_tongue: getRandomElement(motherTongues),
    education: getRandomElement(educations),
    occupation: getRandomElement(occupations),
    annual_income: getRandomElement(incomes),
    city,
    state,
    country: 'India',
    about_me: `I am a ${age} year old professional from ${city}. Looking for a life partner who shares similar values and aspirations.`,
    profile_picture: getRandomProfilePhoto(gender, index),
    looking_for: gender === 'male'
      ? 'Looking for an educated, family-oriented woman with good values'
      : 'Looking for an educated, well-settled man with good family values',
    hobbies: getRandomElement(hobbiesOptions),
    created_by: getRandomElement(['self', 'parent', 'sibling'])
  };
}

function generatePreferences(gender, age) {
  const ageMin = Math.max(21, age - 5);
  const ageMax = Math.min(45, age + 5);

  return {
    age_min: ageMin,
    age_max: ageMax,
    height_min: gender === 'male' ? 150 : 165,
    height_max: gender === 'male' ? 175 : 190,
    marital_status: 'never_married,divorced',
    religion: getRandomElement(religions),
    education: getRandomElement(educations),
    occupation: getRandomElement(occupations),
    location: getRandomElement(cities)
  };
}

async function seedUsers() {
  const client = await db.connect();

  try {
    await client.query('START TRANSACTION');

    console.log('Starting to seed 50 test users...');

    // Generate 25 male and 25 female users
    for (let i = 1; i <= 50; i++) {
      const gender = i <= 25 ? 'male' : 'female';
      const user = generateUser(i, gender);

      // Insert user
      const userResult = await client.query(
        `INSERT INTO users (email, password, first_name, middle_name, last_name, phone, age, gender, is_approved, payment_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user.email, user.password, user.first_name, user.middle_name, user.last_name,
         user.phone, user.age, user.gender, user.is_approved, user.payment_status]
      );

      const userId = userResult.rows.insertId;

      // Insert profile
      const profile = generateProfile(gender, user.age, i);
      await client.query(
        `INSERT INTO profiles (user_id, height, weight, marital_status, religion, caste,
         mother_tongue, education, occupation, annual_income, city, state, country,
         about_me, profile_picture, looking_for, hobbies, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, profile.height, profile.weight, profile.marital_status, profile.religion,
         profile.caste, profile.mother_tongue, profile.education, profile.occupation,
         profile.annual_income, profile.city, profile.state, profile.country,
         profile.about_me, profile.profile_picture, profile.looking_for, profile.hobbies, profile.created_by]
      );

      // Insert preferences
      const preferences = generatePreferences(gender, user.age);
      await client.query(
        `INSERT INTO preferences (user_id, age_min, age_max, height_min, height_max,
         marital_status, religion, education, occupation, location)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, preferences.age_min, preferences.age_max, preferences.height_min,
         preferences.height_max, preferences.marital_status, preferences.religion,
         preferences.education, preferences.occupation, preferences.location]
      );

      console.log(`Created user ${i}/50: ${user.first_name} ${user.last_name} (${gender})`);
    }

    await client.query('COMMIT');
    console.log('\nSuccessfully seeded 50 users with profiles and preferences!');
    console.log('Note: Users do not have passwords yet. Use Admin Panel > Set Password to assign passwords.');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding users:', error);
    throw error;
  } finally {
    client.release();
    process.exit(0);
  }
}

// Run the seed script
seedUsers()
  .then(() => {
    console.log('Seeding completed successfully!');
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
