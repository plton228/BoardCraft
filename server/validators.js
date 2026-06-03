const { body, param, validationResult } = require('express-validator');

// Middleware to format validation errors
const validate = (validations) => {
    return async (req, res, next) => {
        for (let validation of validations) {
            await validation.run(req);
        }

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
        });
    };
};

const registerValidator = validate([
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
]);

const loginValidator = validate([
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address'),
    body('password')
        .notEmpty().withMessage('Password is required')
]);

const boardValidator = validate([
    body('title')
        .trim()
        .notEmpty().withMessage('Board title is required')
        .isLength({ max: 100 }).withMessage('Title cannot be longer than 100 characters'),
    body('isPublic')
        .optional()
        .isBoolean().withMessage('isPublic must be a boolean')
]);

const elementValidator = validate([
    body('elements')
        .isArray().withMessage('Elements must be an array'),
    body('elements.*.id')
        .notEmpty().withMessage('Element ID is required'),
    body('elements.*.type')
        .notEmpty().withMessage('Element type is required')
        .isIn(['line', 'text', 'sticky', 'rectangle', 'circle']).withMessage('Invalid element type'),
    body('elements.*.x')
        .isNumeric().withMessage('x coordinate must be a number'),
    body('elements.*.y')
        .isNumeric().withMessage('y coordinate must be a number')
]);

module.exports = {
    registerValidator,
    loginValidator,
    boardValidator,
    elementValidator
};
