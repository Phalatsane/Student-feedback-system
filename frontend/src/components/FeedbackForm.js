import React, { useState } from 'react';
import axios from 'axios';
import './FeedbackForm.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const FeedbackForm = ({ onFeedbackSubmitted }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    courseCode: '',
    comments: '',
    rating: ''
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Prevent numbers in studentName
    if (name === 'studentName') {
      value = value.replace(/[0-9]/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.studentName.trim()) {
      newErrors.studentName = 'Student name is required';
    }

    if (!formData.courseCode.trim()) {
      newErrors.courseCode = 'Course code is required';
    }

    if (!formData.comments.trim()) {
      newErrors.comments = 'Comments are required';
    }

    if (!formData.rating) {
      newErrors.rating = 'Rating is required';
    } else if (Number(formData.rating) < 1 || Number(formData.rating) > 5) {
      newErrors.rating = 'Rating must be between 1 and 5';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post(`${API_URL}/api/feedback`, {
        studentname: formData.studentName, // lowercase to match DB
        coursecode: formData.courseCode,   // lowercase to match DB
        comments: formData.comments,
        rating: parseInt(formData.rating)
      });

      setSuccessMessage('Feedback submitted successfully!');
      setFormData({
        studentName: '',
        courseCode: '',
        comments: '',
        rating: ''
      });
      setErrors({});

      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setErrors({
        submit: error.response?.data?.error || 'Failed to submit feedback. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feedback-form-container">
      <h2>Submit Course Feedback</h2>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      {errors.submit && (
        <div className="error-message">{errors.submit}</div>
      )}

      <form onSubmit={handleSubmit} className="feedback-form">
        <div className="form-group">
          <label htmlFor="studentName">Student Name *</label>
          <input
            type="text"
            id="studentName"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            className={errors.studentName ? 'error' : ''}
            placeholder="Enter your full name"
          />
          {errors.studentName && (
            <span className="error-text">{errors.studentName}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="courseCode">Course Code *</label>
          <input
            type="text"
            id="courseCode"
            name="courseCode"
            value={formData.courseCode}
            onChange={handleChange}
            className={errors.courseCode ? 'error' : ''}
            placeholder="e.g., WIBS1210"
          />
          {errors.courseCode && (
            <span className="error-text">{errors.courseCode}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="comments">Comments *</label>
          <textarea
            id="comments"
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            className={errors.comments ? 'error' : ''}
            placeholder="Share your feedback about the course..."
            rows="5"
          />
          {errors.comments && (
            <span className="error-text">{errors.comments}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="rating">Rating (1-5) *</label>
          <select
            id="rating"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            className={errors.rating ? 'error' : ''}
          >
            <option value="">Select a rating</option>
            <option value="1">1 - Poor</option>
            <option value="2">2 - Fair</option>
            <option value="3">3 - Good</option>
            <option value="4">4 - Very Good</option>
            <option value="5">5 - Excellent</option>
          </select>
          {errors.rating && (
            <span className="error-text">{errors.rating}</span>
          )}
        </div>

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
