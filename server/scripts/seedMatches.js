const db = require('../config/database');

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedMatches() {
  const client = await db.connect();

  try {
    await client.query('START TRANSACTION');

    console.log('Creating sample matches...');

    // Get all male and female users
    const males = await client.query(
      'SELECT id FROM users WHERE gender = ? AND is_approved = true LIMIT 20',
      ['male']
    );

    const females = await client.query(
      'SELECT id FROM users WHERE gender = ? AND is_approved = true LIMIT 20',
      ['female']
    );

    if (males.rows.length === 0 || females.rows.length === 0) {
      console.log('Not enough users to create matches');
      await client.query('ROLLBACK');
      return;
    }

    const statuses = ['pending', 'accepted', 'rejected'];
    let matchCount = 0;

    // Create 15 random matches
    for (let i = 0; i < 15; i++) {
      const maleUser = males.rows[getRandomNumber(0, males.rows.length - 1)];
      const femaleUser = females.rows[getRandomNumber(0, females.rows.length - 1)];
      const matchScore = getRandomNumber(50, 95);
      const status = statuses[getRandomNumber(0, statuses.length - 1)];

      try {
        await client.query(
          `INSERT INTO matches (user_id, matched_user_id, match_score, status)
           VALUES (?, ?, ?, ?)`,
          [maleUser.id, femaleUser.id, matchScore, status]
        );
        matchCount++;
        console.log(`Created match ${matchCount}/15: Score ${matchScore}%, Status: ${status}`);
      } catch (error) {
        // Skip if match already exists
        console.log(`Skipped duplicate match`);
      }
    }

    await client.query('COMMIT');
    console.log(`\nSuccessfully created ${matchCount} sample matches!`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding matches:', error);
    throw error;
  } finally {
    client.release();
    process.exit(0);
  }
}

// Run the seed script
seedMatches()
  .then(() => {
    console.log('Match seeding completed successfully!');
  })
  .catch((error) => {
    console.error('Match seeding failed:', error);
    process.exit(1);
  });
