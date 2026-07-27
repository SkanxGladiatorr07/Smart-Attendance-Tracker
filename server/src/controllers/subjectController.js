import { SubjectService } from '../services/subjectService.js';

/**
 * Controller handlers for Subject REST endpoints
 */

/**
 * @desc    Get all subjects
 * @route   GET /api/subjects
 * @access  Public
 */
export const getSubjects = async (req, res, next) => {
  try {
    const subjects = await SubjectService.getAllSubjects();
    res.status(200).json({
      status: 'success',
      results: subjects.length,
      data: subjects,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get subject by ID
 * @route   GET /api/subjects/:id
 * @access  Public
 */
export const getSubjectById = async (req, res, next) => {
  try {
    const subject = await SubjectService.getSubjectById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new subject
 * @route   POST /api/subjects
 * @access  Public
 */
export const createSubject = async (req, res, next) => {
  try {
    const newSubject = await SubjectService.createSubject(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Subject created successfully',
      data: newSubject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a subject by ID
 * @route   PUT /api/subjects/:id
 * @access  Public
 */
export const updateSubject = async (req, res, next) => {
  try {
    const updatedSubject = await SubjectService.updateSubject(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Subject updated successfully',
      data: updatedSubject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a subject by ID
 * @route   DELETE /api/subjects/:id
 * @access  Public
 */
export const deleteSubject = async (req, res, next) => {
  try {
    await SubjectService.deleteSubject(req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'Subject deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
