const db = require('../config/database');

async function updatePaymentStatus() {
  try {
    const result = await db.query(
      "UPDATE users SET payment_status = 'paid' WHERE is_approved = true"
    );

    console.log(`Updated users to paid status`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating payment status:', error);
    process.exit(1);
  }
}

updatePaymentStatus();
