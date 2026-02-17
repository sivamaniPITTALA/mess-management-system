import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function OrganizationSetup() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    messParameters: {
      dailyBreakfastRate: 50,
      dailyLunchRate: 100,
      dailyDinnerRate: 100,
      semesterHostelFee: 500,
      specialItemRate: 30,
      basicMonthlyCharge: 2000
    }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('param_')) {
      const param = name.replace('param_', '');
      setFormData({
        ...formData,
        messParameters: {
          ...formData.messParameters,
          [param]: parseFloat(value)
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'organization',
        address: formData.address,
        messParameters: formData.messParameters
      });

      if (result.success) {
        navigate('/admin');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px', marginTop: '50px' }}>
      <div className="card">
        <h1 className="text-center mb-2">Organization Setup</h1>
        <p className="text-center mb-2">Set up your organization and mess parameters</p>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <h3>Organization Details</h3>
          
          <div className="grid grid-2">
            <div className="form-group">
              <label>Organization Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
            ></textarea>
          </div>

          <h3 className="mt-2">Mess Parameters</h3>
          <p className="mb-1">Configure your mess billing rates</p>

          <div className="grid grid-2">
            <div className="form-group">
              <label>Daily Breakfast Rate (₹)</label>
              <input
                type="number"
                name="param_dailyBreakfastRate"
                value={formData.messParameters.dailyBreakfastRate}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Daily Lunch Rate (₹)</label>
              <input
                type="number"
                name="param_dailyLunchRate"
                value={formData.messParameters.dailyLunchRate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label>Daily Dinner Rate (₹)</label>
              <input
                type="number"
                name="param_dailyDinnerRate"
                value={formData.messParameters.dailyDinnerRate}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Special Item Rate (₹)</label>
              <input
                type="number"
                name="param_specialItemRate"
                value={formData.messParameters.specialItemRate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label>Semester Hostel Fee (₹)</label>
              <input
                type="number"
                name="param_semesterHostelFee"
                value={formData.messParameters.semesterHostelFee}
                onChange={handleChange}
                required
              />
              <small>Applied to General/OBC in 6th month</small>
            </div>
            
            <div className="form-group">
              <label>Basic Monthly Charge (₹)</label>
              <input
                type="number"
                name="param_basicMonthlyCharge"
                value={formData.messParameters.basicMonthlyCharge}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary mt-1" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Setting up...' : 'Setup Organization'}
          </button>
        </form>
        
        <p className="text-center mt-1">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default OrganizationSetup;
