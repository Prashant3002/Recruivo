const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const router = express.Router();

/**
 * @route   POST /api/students/register
 * @desc    Register a new student
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, mobileNumber, gender, dateOfBirth } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this email already exists' });
    }

    // Create new student
    const student = new Student({
      firstName,
      lastName,
      email,
      password,
      mobileNumber,
      gender,
      dateOfBirth
    });

    // Save student to database (password will be hashed by pre-save hook)
    await student.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: student._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    // Send response without password
    res.status(201).json({
      student: {
        id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        mobileNumber: student.mobileNumber,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth,
        createdAt: student.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/students/login
 * @desc    Authenticate student & get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if student exists
    const student = await Student.findOne({ email }).select('+password');
    if (!student) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password is correct
    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: student._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    // Send response without password
    res.status(200).json({
      student: {
        id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        mobileNumber: student.mobileNumber,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth,
        createdAt: student.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/students/:id
 * @desc    Get student by ID
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   PUT /api/students/:id
 * @desc    Update student profile
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  try {
    const { firstName, lastName, mobileNumber, gender, dateOfBirth, skills, education, resumeLink } = req.body;
    
    // Build student object
    const studentFields = {};
    if (firstName) studentFields.firstName = firstName;
    if (lastName) studentFields.lastName = lastName;
    if (mobileNumber) studentFields.mobileNumber = mobileNumber;
    if (gender) studentFields.gender = gender;
    if (dateOfBirth) studentFields.dateOfBirth = dateOfBirth;
    if (skills) studentFields.skills = skills;
    if (education) studentFields.education = education;
    if (resumeLink) studentFields.resumeLink = resumeLink;

    // Update and return the updated student
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: studentFields },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 