const { body, validationResult } = require('express-validator');

const validateRegistration = [
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('middle_name').optional().trim(),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('age').optional().isInt({ min: 18, max: 100 }).withMessage('Age must be between 18 and 100'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required')
];

const validateLogin = [
  body('login_id')
    .notEmpty().withMessage('Phone number is required')
    .custom((value) => {
      const isPhone = /^\d{10}$/.test(value);
      if (!isPhone) {
        throw new Error('Please enter a valid 10-digit phone number');
      }
      return true;
    }),
  body('password').notEmpty().withMessage('Password is required')
];

const validateProfile = [
  body('height').optional({ values: 'falsy' }).trim(),
  body('weight').optional({ values: 'falsy' }).trim(),
  body('marital_status').optional({ values: 'falsy' }),
  body('city').optional().trim(),
  body('education').optional().trim(),
  body('occupation').optional().trim()
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
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
