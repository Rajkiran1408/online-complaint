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
        <nav className="navbar-container glass-morphism">
            <Link to="/" className="navbar-logo">
                <div className="premium-gradient logo-wrapper">
                    <img src={logo2} alt="Logo" className="logo-img" />
                </div>
                <span className="logo-text">Redressal System</span>
            </Link>

            <div className="navbar-actions">
                {user ? (
                    <>
                        <div className="user-info">
                            <User size={18} />
                            <span className="user-name">{user.name} <span className="user-role">({user.role})</span></span>
                        </div>
                        <button onClick={handleLogout} className="btn logout-btn">
                            <LogOut size={18} />
                            <span className="logout-text">Logout</span>
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="btn login-link">Login</Link>
                        <Link to="/register" className="btn btn-primary register-link">Register</Link>
                    </>
                )}
            </div>

            <style>{`
                .navbar-container {
                    margin: 1rem;
                    padding: 0.75rem 2.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: sticky;
                    top: 1rem;
                    z-index: 1000;
                    background: #0f172a;
                    color: #ffffff;
                    border: none;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    border-radius: 1rem;
                }
                .navbar-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    text-decoration: none;
                    color: #ffffff;
                }
                .logo-wrapper {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }
                .logo-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .logo-text {
                    fontSize: 1.25rem;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                }
                .navbar-actions {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }
                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: rgba(255,255,255,0.7);
                }
                .user-name {
                    font-size: 0.9rem;
                    font-weight: 500;
                }
                .logout-btn {
                    padding: 0.5rem 1rem;
                    background: rgba(255,255,255,0.1);
                    color: #ffffff;
                    border: 1px solid rgba(255,255,255,0.2) !important;
                    width: auto !important;
                }
                .login-link {
                    text-decoration: none;
                    color: #ffffff;
                    background: transparent;
                    border: 1px solid rgba(255,255,255,0.2) !important;
                    width: auto !important;
                }
                .register-link {
                    text-decoration: none;
                    width: auto !important;
                }

                @media (max-width: 768px) {
                    .navbar-container {
                        padding: 0.75rem 1rem;
                        margin: 0.5rem;
                    }
                    .logo-text {
                        display: none;
                    }
                    .user-name {
                        display: none;
                    }
                    .navbar-actions {
                        gap: 0.5rem;
                    }
                    .logout-text {
                        display: none;
                    }
                    .logout-btn {
                        padding: 0.5rem;
                    }
                }
            `}</style>
        </nav>
    );
};


export default Navbar;
