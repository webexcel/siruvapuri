const { body, validationResult } = require('express-validator');

const validateRegistration = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('middle_name').optional().trim(),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('age').optional().isInt({ min: 18, max: 100 }).withMessage('Age must be between 18 and 100'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required')
];

const validateLogin = [
  body('email')
    .notEmpty().withMessage('Email or phone number is required')
    .custom((value) => {
      // Check if it's a valid email or a 10-digit phone number
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      const isPhone = /^\d{10}$/.test(value);
      if (!isEmail && !isPhone) {
        throw new Error('Please enter a valid email address or 10-digit phone number');
      }
      return true;
    }),
  body('password').notEmpty().withMessage('Password is required')
];

const validateProfile = [
  body('height').optional().isInt({ min: 100, max: 250 }).withMessage('Height must be between 100-250 cm'),
  body('weight').optional().isInt({ min: 30, max: 200 }).withMessage('Weight must be between 30-200 kg'),
  body('marital_status').optional().isIn(['never_married', 'divorced', 'widowed', 'separated']),
  body('city').optional().trim(),
  body('education').optional().trim(),
  body('occupation').optional().trim()
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return first error message in a format the client expects
    const firstError = errors.array()[0];
    return res.status(400).json({
      success: false,
      error: firstError.msg,
      message: firstError.msg,
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateProfile,
  handleValidationErrors
};
