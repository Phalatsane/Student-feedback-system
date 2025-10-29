import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FeedbackList.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const FeedbackList = ({ onFeedbackDeleted }) => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/feedback`);
      setFeedbackList(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('Failed to load feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/feedback/${id}`);
      setFeedbackList(prev => prev.filter(item => item.id !== id));
      
      if (onFeedbackDeleted) {
        onFeedbackDeleted();
      }
    } catch (err) {
      console.error('Error deleting feedback:', err);
      alert('Failed to delete feedback. Please try again.');
    }
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return <div className="loading">Loading feedback...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="feedback-list-container">
      <h2>All Feedback ({feedbackList.length})</h2>
      
      {feedbackList.length === 0 ? (
        <div className="no-feedback">
          <p>No feedback submitted yet.</p>
        </div>
      ) : (
        <div className="feedback-grid">
          {feedbackList.map((feedback) => (
            <div key={feedback.id} className="feedback-card">
              <div className="feedback-header">
                <div>
                  <h3>{feedback.studentname}</h3>
                  <span className="course-code">{feedback.coursecode}</span>
                </div>
                <div className="rating">
                  <span className="stars">{renderStars(feedback.rating)}</span>
                  <span className="rating-number">{feedback.rating}/5</span>
                </div>
              </div>
              
              <div className="feedback-body">
                <p className="comments">{feedback.comments}</p>
              </div>
              
              <div className="feedback-footer">
                <span className="date">
                  {new Date(feedback.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <button 
                  className="delete-btn" 
                  onClick={() => handleDelete(feedback.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackList;