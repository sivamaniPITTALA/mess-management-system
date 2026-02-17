import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function MealHistory() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async (start, end) => {
    setLoading(true);
    try {
      let url = '/api/meals/my-meals';
      if (start && end) {
        url += `?startDate=${start}&endDate=${end}`;
      }
      const response = await axios.get(url);
      setMeals(response.data);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchMeals(startDate, endDate);
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
        </div>
      </nav>

      <div className="container">
        <h1 className="mb-2">Meal History</h1>

        <div className="card mb-2">
          <h3>Filter Meals</h3>
          <form onSubmit={handleFilter}>
            <div className="grid grid-3">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Filter
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="card">
          <h3>Your Meals</h3>
          {loading ? (
            <p>Loading...</p>
          ) : meals.length === 0 ? (
            <p>No meals found</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Meal Type</th>
                  <th>Specials</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {meals.map(meal => (
                  <tr key={meal._id}>
                    <td>{new Date(meal.timestamp).toLocaleDateString()}</td>
                    <td style={{ textTransform: 'capitalize' }}>{meal.mealType}</td>
                    <td>{meal.specials}</td>
                    <td>₹{meal.totalAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card mt-2">
          <h3>Summary</h3>
          <div className="grid grid-4">
            <div className="stats-card">
              <div className="stats-number">{meals.length}</div>
              <div className="stats-label">Total Meals</div>
            </div>
            <div className="stats-card">
              <div className="stats-number">
                {meals.filter(m => m.mealType === 'breakfast').length}
              </div>
              <div className="stats-label">Breakfast</div>
            </div>
            <div className="stats-card">
              <div className="stats-number">
                {meals.filter(m => m.mealType === 'lunch').length}
              </div>
              <div className="stats-label">Lunch</div>
            </div>
            <div className="stats-card">
              <div className="stats-number">
                {meals.filter(m => m.mealType === 'dinner').length}
              </div>
              <div className="stats-label">Dinner</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MealHistory;
