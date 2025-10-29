import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import FeedbackForm from './components/FeedbackForm';
import FeedbackList from './components/FeedbackList';
import './App.css';

function App() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Fetch feedback on component mount
  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/feedback');
      setFeedbackList(response.data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackAdded = (newFeedback) => {
    setFeedbackList([newFeedback, ...feedbackList]);
    setActiveTab('view');
  };

  const handleFeedbackDeleted = (deletedId) => {
    setFeedbackList(feedbackList.filter(f => f.id !== deletedId));
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Student Feedback System</h1>
      </header>

      <nav className="app-nav">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={activeTab === 'submit' ? 'active' : ''}
          onClick={() => setActiveTab('submit')}
        >
          Submit Feedback
        </button>
        <button 
          className={activeTab === 'view' ? 'active' : ''}
          onClick={() => setActiveTab('view')}
        >
          View All Feedback
        </button>
      </nav>

      <main className="app-main">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {activeTab === 'dashboard' && <Dashboard feedbackList={feedbackList} />}
            {activeTab === 'submit' && <FeedbackForm onFeedbackAdded={handleFeedbackAdded} />}
            {activeTab === 'view' && (
              <FeedbackList 
                feedbackList={feedbackList} 
                onFeedbackDeleted={handleFeedbackDeleted}
              />
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; 2025 Student Feedback App | Limkokwing University</p>
      </footer>
    </div>
  );
}

export default App;