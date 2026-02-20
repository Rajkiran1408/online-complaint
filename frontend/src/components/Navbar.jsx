import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, MessageSquare, ShieldCheck } from 'lucide-react';
import logo2 from '../assets/logo2.png';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="glass-morphism" style={{
            margin: '1rem',
            padding: '0.75rem 2.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: '1rem',
            zIndex: 1000,
            background: '#0f172a', /* Deep Slate */
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: '#ffffff' }}>
                <div className="premium-gradient" style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img src={logo2} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.5px' }}>Redressal System</span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {user ? (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>
                            <User size={18} />
                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user.name} ({user.role})</span>
                        </div>
                        <button onClick={handleLogout} className="btn" style={{
                            padding: '0.5rem 1rem',
                            background: 'rgba(255,255,255,0.1)',
                            color: '#ffffff',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <LogOut size={18} />
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="btn" style={{ textDecoration: 'none', color: '#ffffff', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>Login</Link>
                        <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
