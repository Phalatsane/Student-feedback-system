import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalFeedback: 0,
    averageRating: 0,
    feedbackByCourse: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/dashboard/stats`);
      setStats(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-container">
      <h2>Feedback Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <h3>Total Feedback</h3>
            <p className="stat-number">{stats.totalFeedback}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>Average Rating</h3>
            <p className="stat-number">{stats.averageRating}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>Courses Reviewed</h3>
            <p className="stat-number">{stats.feedbackByCourse.length}</p>
          </div>
        </div>
      </div>

      <div className="course-breakdown">
        <h3>Feedback by Course</h3>
        {stats.feedbackByCourse.length === 0 ? (
          <p className="no-data">No feedback data available yet.</p>
        ) : (
          <div className="course-list">
            {stats.feedbackByCourse.map((course, index) => (
              <div key={index} className="course-item">
                <div className="course-name">{course.coursecode}</div>
                <div className="course-count">
                  <span className="count-badge">{course.count}</span>
                  <span className="count-label">
                    {course.count === 1 ? 'feedback' : 'feedbacks'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
