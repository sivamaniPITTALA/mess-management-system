import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function TokenGenerator() {
  const { user } = useAuth();
  const [mealType, setMealType] = useState('lunch');
  const [specials, setSpecials] = useState(0);
  const [paymentType, setPaymentType] = useState('pay-later');
  const [generatedToken, setGeneratedToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/tokens/generate', {
        mealType,
        specials,
        paymentType
      });
      setGeneratedToken(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate token');
    } finally {
      setLoading(false);
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
        </div>
      </nav>

      <div className="container">
        <h1 className="mb-2">Generate Meal Token</h1>

        {!user?.isCardActive && (
          <div className="alert alert-warning mb-2">
            Your card is inactive. Please activate it from the dashboard to generate tokens.
          </div>
        )}

        {error && <div className="alert alert-error mb-2">{error}</div>}

        <div className="grid grid-2">
          <div className="card">
            <h3>Generate New Token</h3>
            <form onSubmit={handleGenerate}>
              <div className="form-group">
                <label>Meal Type</label>
                <select 
                  value={mealType} 
                  onChange={(e) => setMealType(e.target.value)}
                  disabled={!user?.isCardActive}
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                </select>
              </div>

              <div className="form-group">
                <label>Special Items (0-10)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={specials}
                  onChange={(e) => setSpecials(parseInt(e.target.value) || 0)}
                  disabled={!user?.isCardActive}
                />
                <small>Each special item costs ₹30</small>
              </div>

              <div className="form-group">
                <label>Payment Type</label>
                <select 
                  value={paymentType} 
                  onChange={(e) => setPaymentType(e.target.value)}
                  disabled={!user?.isCardActive}
                >
                  <option value="pay-later">Pay at Month End</option>
                  <option value="pay-now">Pay Now</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                disabled={loading || !user?.isCardActive}
              >
                {loading ? 'Generating...' : 'Generate Token'}
              </button>
            </form>
          </div>

          {generatedToken && (
            <div className="card">
              <h3>Generated Token</h3>
              <div className="qr-code">
                <img src={generatedToken.qrCode} alt="QR Code" />
                <p><strong>Meal Type:</strong> {generatedToken.mealType}</p>
                <p><strong>Specials:</strong> {generatedToken.specials}</p>
                <p><strong>Amount:</strong> ₹{generatedToken.amount}</p>
                <p><strong>Payment Status:</strong> {generatedToken.paymentStatus}</p>
                <p><strong>Expires:</strong> {new Date(generatedToken.expiresAt).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => setGeneratedToken(null)} 
                className="btn btn-primary mt-1"
                style={{ width: '100%' }}
              >
                Generate Another
              </button>
            </div>
          )}
        </div>

        <div className="card mt-2">
          <h3>Instructions</h3>
          <ul>
            <li>Select the meal type (breakfast, lunch, or dinner)</li>
            <li>Add special items if desired (0-10 items, ₹30 each)</li>
            <li>Choose payment type: Pay Now or Pay Later</li>
            <li>Show the QR code to the mess admin for scanning</li>
            <li>The token is valid for 24 hours</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TokenGenerator;
