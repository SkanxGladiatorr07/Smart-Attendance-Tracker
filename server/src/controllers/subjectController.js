import { SubjectService } from '../services/subjectService.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

/**
 * Controller handlers for Subject REST endpoints
 */

/**
 * @desc    Get all subjects
 * @route   GET /api/subjects
 * @access  Public
 */
export const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await SubjectService.getAllSubjects();
  res.status(200).json({
    status: 'success',
    results: subjects.length,
    data: subjects,
  });
});

/**
 * @desc    Get subject by ID
 * @route   GET /api/subjects/:id
 * @access  Public
 */
export const getSubjectById = asyncHandler(async (req, res) => {
  const subject = await SubjectService.getSubjectById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: subject,
  });
});

/**
 * @desc    Create a new subject
 * @route   POST /api/subjects
 * @access  Public
 */
export const createSubject = asyncHandler(async (req, res) => {
  const newSubject = await SubjectService.createSubject(req.body);
  res.status(201).json({
    status: 'success',
    message: 'Subject created successfully',
    data: newSubject,
  });
});

/**
 * @desc    Update a subject by ID
 * @route   PUT /api/subjects/:id
 * @access  Public
 */
export const updateSubject = asyncHandler(async (req, res) => {
  const updatedSubject = await SubjectService.updateSubject(req.params.id, req.body);
  res.status(200).json({
    status: 'success',
    message: 'Subject updated successfully',
    data: updatedSubject,
  });
});

/**
 * @desc    Delete a subject by ID
 * @route   DELETE /api/subjects/:id
 * @access  Public
 */
export const deleteSubject = asyncHandler(async (req, res) => {
  await SubjectService.deleteSubject(req.params.id);
  res.status(200).json({
    status: 'success',
    message: 'Subject deleted successfully',
  });
});
