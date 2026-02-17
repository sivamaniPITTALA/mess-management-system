import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [bills, setBills] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchBills();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchBills = async () => {
    try {
      const now = new Date();
      const response = await axios.get(`/api/bills/all?month=${now.getMonth() + 1}&year=${now.getFullYear()}`);
      setBills(response.data);
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/users');
      const allBills = await axios.get('/api/bills/all');
      
      setStats({
        totalUsers: response.data.length,
        activeCards: response.data.filter(u => u.isCardActive).length,
        totalBills: allBills.data.length,
        pendingPayments: allBills.data.filter(b => b.paymentStatus === 'pending').length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId, isVerified, isPwDVerified) => {
    try {
      await axios.put(`/api/users/verify/${userId}`, { isVerified, isPwDVerified });
      fetchUsers();
      alert('User verified successfully');
    } catch (error) {
      alert('Failed to verify user');
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-brand">Admin Dashboard</div>
        <div className="navbar-links">
          <Link to="/admin">Dashboard</Link>
          <Link to="/scanner">QR Scanner</Link>
          <button onClick={logout} className="btn btn-danger">Logout</button>
        </div>
      </nav>

      <div className="container">
        <h1 className="mb-2">Admin Dashboard</h1>
        
        <div className="grid grid-4 mb-2">
          <div className="card stats-card">
            <div className="stats-number">{stats?.totalUsers || 0}</div>
            <div className="stats-label">Total Users</div>
          </div>
          <div className="card stats-card">
            <div className="stats-number">{stats?.activeCards || 0}</div>
            <div className="stats-label">Active Cards</div>
          </div>
          <div className="card stats-card">
            <div className="stats-number">{stats?.totalBills || 0}</div>
            <div className="stats-label">Total Bills</div>
          </div>
          <div className="card stats-card">
            <div className="stats-number">{stats?.pendingPayments || 0}</div>
            <div className="stats-label">Pending Payments</div>
          </div>
        </div>

        <div className="grid grid-2">
          <div className="card">
            <h3>Recent Users</h3>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Student ID</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 5).map(u => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.studentId || 'N/A'}</td>
                    <td>{u.category}</td>
                    <td>
                      <span className={`badge ${u.isVerified ? 'badge-success' : 'badge-warning'}`}>
                        {u.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      {!u.isVerified && (
                        <button 
                          onClick={() => handleVerifyUser(u._id, true, u.category === 'PwD')}
                          className="btn btn-success"
                          style={{ padding: '2px 8px', fontSize: '12px' }}
                        >
                          Verify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h3>Recent Bills</h3>
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Month</th>
                </tr>
              </thead>
              <tbody>
                {bills.slice(0, 5).map(bill => (
                  <tr key={bill._id}>
                    <td>{bill.user?.name || 'N/A'}</td>
                    <td>₹{bill.total}</td>
                    <td>
                      <span className={`badge ${bill.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                        {bill.paymentStatus}
                      </span>
                    </td>
                    <td>{bill.month}/{bill.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card mt-2">
          <h3>Quick Actions</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link to="/scanner" className="btn btn-primary">Scan Token</Link>
            <button className="btn btn-success">Generate Report</button>
            <button className="btn btn-warning">Manage Parameters</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
