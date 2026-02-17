import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';

function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [manualToken, setManualToken] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const startScanning = () => {
    setScanning(true);
    setError('');
    setResult(null);

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scannerRef.current = scanner;

    scanner.render(onScanSuccess, onScanFailure);
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText) => {
    stopScanning();
    await validateToken(decodedText);
  };

  const onScanFailure = (error) => {
    // Handle scan failure silently
  };

  const validateToken = async (tokenString) => {
    setError('');
    setResult(null);

    try {
      const response = await axios.post('/api/tokens/validate', {
        tokenString
      });
      setResult(response.data);
    } catch (err) {
      if (err.response?.data?.used) {
        setError('Token already used!');
        setResult({
          used: true,
          user: err.response.data.user,
          mealType: err.response.data.mealType,
          usedAt: err.response.data.usedAt
        });
      } else {
        setError(err.response?.data?.message || 'Invalid token');
      }
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (manualToken) {
      await validateToken(manualToken);
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-brand">Admin Dashboard</div>
        <div className="navbar-links">
          <Link to="/admin">Dashboard</Link>
          <Link to="/scanner">QR Scanner</Link>
        </div>
      </nav>

      <div className="container">
        <h1 className="mb-2">QR Code Scanner</h1>

        <div className="grid grid-2">
          <div className="card">
            <h3>Scan Token</h3>
            
            {!scanning ? (
              <button onClick={startScanning} className="btn btn-primary" style={{ width: '100%' }}>
                Start Scanning
              </button>
            ) : (
              <button onClick={stopScanning} className="btn btn-danger" style={{ width: '100%' }}>
                Stop Scanning
              </button>
            )}

            <div id="reader" className="scanner-container mt-1"></div>

            <div className="mt-2">
              <h4>Or enter token manually:</h4>
              <form onSubmit={handleManualSubmit}>
                <div className="form-group">
                  <input
                    type="text"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="Enter token string"
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Validate Token
                </button>
              </form>
            </div>
          </div>

          <div className="card">
            <h3>Result</h3>
            
            {error && (
              <div className="alert alert-error">{error}</div>
            )}

            {result && !result.valid && result.used && (
              <div className="alert alert-warning">
                <h4>⚠️ Token Already Used</h4>
                <p><strong>Name:</strong> {result.user?.name}</p>
                <p><strong>Student ID:</strong> {result.user?.studentId}</p>
                <p><strong>Meal Type:</strong> {result.mealType}</p>
                <p><strong>Used At:</strong> {new Date(result.usedAt).toLocaleString()}</p>
              </div>
            )}

            {result && result.valid && (
              <div className="alert alert-success">
                <h4>✅ Token Validated</h4>
                <p><strong>Name:</strong> {result.user?.name}</p>
                <p><strong>Student ID:</strong> {result.user?.studentId}</p>
                <p><strong>Category:</strong> {result.user?.category}</p>
                <p><strong>Meal Type:</strong> {result.mealType}</p>
                <p><strong>Specials:</strong> {result.specials}</p>
                <p><strong>Amount:</strong> ₹{result.amount}</p>
              </div>
            )}

            {!result && !error && (
              <p>Scan a QR code or enter token manually to validate</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QRScanner;
