const { body, validationResult } = require('express-validator');

const validateRegistration = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
  body('date_of_birth').optional().isDate().withMessage('Valid date of birth is required')
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
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
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateProfile,
  handleValidationErrors
};
