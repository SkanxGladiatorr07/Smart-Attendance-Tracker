import { SubjectModel } from '../models/subjectModel.js';
import { AppError } from '../utils/AppError.js';

/**
 * Subject Service - Business logic and validation layer
 */
export const SubjectService = {
  /**
   * Get all subjects
   */
  async getAllSubjects() {
    return await SubjectModel.findAll();
  },

  /**
   * Get single subject by ID
   */
  async getSubjectById(id) {
    const subject = await SubjectModel.findById(id);
    if (!subject) {
      throw new AppError(`Subject with ID ${id} not found`, 404);
    }
    return subject;
  },

  /**
   * Create a new subject with validation
   */
  async createSubject({ subject_name, faculty_name = '', color = '#6366f1' }) {
    // 1. Validation: subject_name is required
    if (!subject_name || typeof subject_name !== 'string' || !subject_name.trim()) {
      throw new AppError('subject_name is required and must be a non-empty string', 400);
    }

    const trimmedName = subject_name.trim();
    const trimmedFaculty = typeof faculty_name === 'string' ? faculty_name.trim() : '';

    // 2. Uniqueness check for subject_name
    const existingSubject = await SubjectModel.findByName(trimmedName);
    if (existingSubject) {
      throw new AppError(`A subject with the name '${trimmedName}' already exists`, 409);
    }

    // 3. Persist subject
    return await SubjectModel.create({
      subject_name: trimmedName,
      faculty_name: trimmedFaculty,
      color: color || '#6366f1',
    });
  },

  /**
   * Update an existing subject
   */
  async updateSubject(id, { subject_name, faculty_name, color }) {
    // 1. Check if subject exists
    const existingSubject = await SubjectModel.findById(id);
    if (!existingSubject) {
      throw new AppError(`Subject with ID ${id} not found`, 404);
    }

    const updatedName =
      subject_name !== undefined ? subject_name.trim() : existingSubject.subject_name;
    const updatedFaculty =
      faculty_name !== undefined
        ? typeof faculty_name === 'string'
          ? faculty_name.trim()
          : ''
        : existingSubject.faculty_name;
    const updatedColor = color !== undefined ? color : existingSubject.color;

    // Validation: subject_name must not be empty if updated
    if (!updatedName) {
      throw new AppError('subject_name cannot be empty', 400);
    }

    // 2. Check uniqueness if subject_name is changed
    if (updatedName.toLowerCase() !== existingSubject.subject_name.toLowerCase()) {
      const duplicate = await SubjectModel.findByNameExcludingId(updatedName, id);
      if (duplicate) {
        throw new AppError(`A subject with the name '${updatedName}' already exists`, 409);
      }
    }

    // 3. Apply update
    return await SubjectModel.update(id, {
      subject_name: updatedName,
      faculty_name: updatedFaculty,
      color: updatedColor,
    });
  },

  /**
   * Delete subject by ID
   */
  async deleteSubject(id) {
    const existingSubject = await SubjectModel.findById(id);
    if (!existingSubject) {
      throw new AppError(`Subject with ID ${id} not found`, 404);
    }

    await SubjectModel.deleteById(id);
    return true;
  },
};
