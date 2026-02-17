import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function BillPayment() {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await axios.get('/api/bills/my-bills');
      setBills(response.data);
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('/api/bills/pay', {
        billId: selectedBill._id,
        amount: parseFloat(paymentAmount),
        method: paymentMethod
      });
      
      setMessage('Payment successful!');
      setSelectedBill(response.data);
      fetchBills();
      setPaymentAmount('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Payment failed');
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
        <h1 className="mb-2">Bill Payment</h1>

        {message && (
          <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-2">
          <div className="card">
            <h3>Your Bills</h3>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Due</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(bill => (
                  <tr key={bill._id}>
                    <td>{bill.month}/{bill.year}</td>
                    <td>₹{bill.total}</td>
                    <td>₹{bill.total - bill.dueAmount}</td>
                    <td>₹{bill.dueAmount}</td>
                    <td>
                      <span className={`badge ${bill.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                        {bill.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => setSelectedBill(bill)}
                        className="btn btn-primary"
                        style={{ padding: '2px 8px', fontSize: '12px' }}
                      >
                        Pay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedBill && (
            <div className="card">
              <h3>Pay Bill - {selectedBill.month}/{selectedBill.year}</h3>
              <div className="mb-2">
                <p><strong>Total Amount:</strong> ₹{selectedBill.total}</p>
                <p><strong>Due Amount:</strong> ₹{selectedBill.dueAmount}</p>
                <p><strong>Meal Count:</strong></p>
                <ul>
                  <li>Breakfast: {selectedBill.mealCount?.breakfast || 0}</li>
                  <li>Lunch: {selectedBill.mealCount?.lunch || 0}</li>
                  <li>Dinner: {selectedBill.mealCount?.dinner || 0}</li>
                </ul>
                {selectedBill.semesterHostelFee > 0 && (
                  <p><strong>Semester Hostel Fee:</strong> ₹{selectedBill.semesterHostelFee}</p>
                )}
              </div>

              <form onSubmit={handlePayment}>
                <div className="form-group">
                  <label>Payment Amount</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedBill.dueAmount}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder={`Max: ₹${selectedBill.dueAmount}`}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Payment Method</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="online">Online Payment</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-success" 
                  style={{ width: '100%' }}
                  disabled={loading || !paymentAmount}
                >
                  {loading ? 'Processing...' : 'Pay Now'}
                </button>
              </form>

              <button 
                onClick={() => setSelectedBill(null)} 
                className="btn btn-warning mt-1"
                style={{ width: '100%' }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="card mt-2">
          <h3>Payment History</h3>
          {bills.filter(b => b.paymentHistory && b.paymentHistory.length > 0).map(bill => (
            <div key={bill._id} className="mb-1">
              <h4>{bill.month}/{bill.year}</h4>
              {bill.paymentHistory.map((payment, index) => (
                <p key={index}>
                  ₹{payment.amount} - {payment.method} - {new Date(payment.date).toLocaleDateString()}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BillPayment;
