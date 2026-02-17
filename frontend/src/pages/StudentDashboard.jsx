import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function StudentDashboard() {
  const { user, logout } = useAuth();
  const [currentBill, setCurrentBill] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentBill();
    fetchStats();
  }, []);

  const fetchCurrentBill = async () => {
    try {
      const response = await axios.get('/api/bills/current');
      setCurrentBill(response.data);
    } catch (error) {
      console.error('Error fetching bill:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const now = new Date();
      const response = await axios.get(`/api/meals/stats?month=${now.getMonth() + 1}&year=${now.getFullYear()}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardToggle = async () => {
    try {
      const response = await axios.put('/api/users/card-status', { 
        isCardActive: !user.isCardActive 
      });
      alert(`Card ${response.data.isCardActive ? 'activated' : 'deactivated'} successfully`);
      window.location.reload();
    } catch (error) {
      alert('Failed to update card status');
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-brand">Mess Management System</div>
        <div className="navbar-links">
          <Link to="/">Dashboard</Link>
          <Link to="/token-generator">Generate Token</Link>
          <Link to="/bills">Bills</Link>
          <Link to="/meals">Meal History</Link>
          <button onClick={logout} className="btn btn-danger">Logout</button>
        </div>
      </nav>

      <div className="container">
        <h1 className="mb-2">Welcome, {user?.name}</h1>
        
        <div className="grid grid-2 mb-2">
          <div className="card">
            <h3>Card Status</h3>
            <p>Status: <span className={`badge ${user?.isCardActive ? 'badge-success' : 'badge-danger'}`}>
              {user?.isCardActive ? 'Active' : 'Inactive'}
            </span></p>
            <p>Category: <strong>{user?.category}</strong></p>
            <p>Student ID: <strong>{user?.studentId}</strong></p>
            <button 
              onClick={handleCardToggle}
              className={`btn ${user?.isCardActive ? 'btn-danger' : 'btn-success'} mt-1`}
            >
              {user?.isCardActive ? 'Close Card' : 'Activate Card'}
            </button>
          </div>

          <div className="card">
            <h3>Current Month Bill</h3>
            {loading ? (
              <p>Loading...</p>
            ) : currentBill ? (
              <>
                <p>Total: <strong>₹{currentBill.total}</strong></p>
                <p>Due: <strong>₹{currentBill.dueAmount}</strong></p>
                <p>Status: <span className={`badge ${currentBill.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                  {currentBill.paymentStatus}
                </span></p>
                {currentBill.isSemesterFeeApplied && (
                  <p className="alert alert-warning mt-1">
                    Semester Hostel Fee applied: ₹{currentBill.semesterHostelFee}
                  </p>
                )}
                <Link to="/bills" className="btn btn-primary mt-1">View Details</Link>
              </>
            ) : (
              <p>No bill generated yet</p>
            )}
          </div>
        </div>

        <div className="grid grid-4 mb-2">
          <div className="card stats-card">
            <div className="stats-number">{stats?.totalMeals || 0}</div>
            <div className="stats-label">Total Meals</div>
          </div>
          <div className="card stats-card">
            <div className="stats-number">{stats?.breakfast || 0}</div>
            <div className="stats-label">Breakfast</div>
          </div>
          <div className="card stats-card">
            <div className="stats-number">{stats?.lunch || 0}</div>
            <div className="stats-label">Lunch</div>
          </div>
          <div className="card stats-card">
            <div className="stats-number">{stats?.dinner || 0}</div>
            <div className="stats-label">Dinner</div>
          </div>
        </div>

        <div className="grid grid-2">
          <div className="card">
            <h3>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/token-generator" className="btn btn-primary">Generate Meal Token</Link>
              <Link to="/bills" className="btn btn-success">Pay Bill</Link>
              <Link to="/meals" className="btn btn-warning">View Meal History</Link>
            </div>
          </div>

          <div className="card">
            <h3>Information</h3>
            <ul>
              <li>Get breakfast, lunch, or dinner tokens</li>
              <li>Add up to 10 special items per meal</li>
              <li>Pay now or at month end</li>
              <li>View your bill and payment history</li>
              <li>Close your card anytime (basic charges apply)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
