import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import ComplaintDetails from './pages/ComplaintDetails';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />

              <Route path="/submit" element={
                <ProtectedRoute>
                  <SubmitComplaint />
                </ProtectedRoute>
              } />

              <Route path="/complaints/:id" element={
                <ProtectedRoute>
                  <ComplaintDetails />
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          <footer className="footer">
            <p style={{ fontWeight: 500 }}>&copy; 2026 Online Complaint & Grievance Redressal System. All rights reserved.</p>
            <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>Designed for college-wide transparency and efficiency.</p>
          </footer>

          <style>{`
            .footer {
              padding: 3rem 2rem;
              text-align: center;
              color: rgba(255,255,255,0.6);
              font-size: 0.85rem;
              background: #0f172a;
              margin-top: auto;
              border-top: 1px solid rgba(255,255,255,0.1);
            }
            @media (max-width: 600px) {
              .footer {
                padding: 2rem 1rem;
                font-size: 0.75rem;
              }
            }
          `}</style>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
