import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Filter, Clock, CheckCircle2, AlertCircle, ChevronRight, MessageSquareOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const Dashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const response = await api.get('/complaints');
            setComplaints(response.data.data);
        } catch (err) {
            console.error('Error fetching complaints:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const className = `badge badge-${status.toLowerCase().replace(' ', '-')}`;
        return <span className={className}>{status}</span>;
    };

    const filteredComplaints = complaints.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard-container" style={{ padding: 'responsive-padding' }}>
            <header className="dashboard-header">
                <div>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 800, marginBottom: '0.5rem' }}>Welcome, {user.name}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {user.role === 'User' ? 'Manage your submitted grievances and track progress.' :
                            user.role === 'Admin' ? 'Administrator portal: Oversee and assign complaints.' :
                                'Support portal: Resolve assigned grievances.'}
                    </p>
                </div>
                {user.role === 'User' && (
                    <button onClick={() => navigate('/submit')} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                        <Plus size={20} />
                        Submit New Complaint
                    </button>
                )}
            </header>

            <style>{`
                .dashboard-container {
                    padding: 2rem;
                }
                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 2.5rem;
                }
                @media (max-width: 768px) {
                    .dashboard-container { padding: 1rem; }
                    .dashboard-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1.5rem;
                    }
                    .dashboard-header .btn {
                        width: 100%;
                    }
                }
            `}</style>


            {/* Stats Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass-morphism card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '1rem', borderRadius: '1rem' }}>
                        <Clock size={28} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Pending</p>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{complaints.filter(c => ['Open', 'Assigned', 'In Progress'].includes(c.status)).length}</h3>
                    </div>
                </div>
                <div className="glass-morphism card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '1rem', borderRadius: '1rem' }}>
                        <CheckCircle2 size={28} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Resolved</p>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length}</h3>
                    </div>
                </div>
                <div className="glass-morphism card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent)', padding: '1rem', borderRadius: '1rem' }}>
                        <Plus size={28} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total</p>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{complaints.length}</h3>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="glass-morphism" style={{ padding: '0.75rem', display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        className="input-field"
                        style={{ paddingLeft: '2.75rem', border: 'none', background: 'transparent' }}
                        placeholder="Search by title or status..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Complaints List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="premium-gradient" style={{ width: '40px', height: '40px', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading complaints...</p>
                </div>
            ) : filteredComplaints.length === 0 ? (
                <div className="glass-morphism card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                    <MessageSquareOff size={48} style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }} />
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No complaints found</h3>
                    <p style={{ color: 'var(--text-muted)' }}>The list is currently empty. Start by submitting a new grievance.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {filteredComplaints.map((complaint, index) => (
                        <motion.div
                            key={complaint._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => navigate(`/complaints/${complaint._id}`)}
                            className="glass-morphism card complaint-item"
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2rem' }}
                        >
                            <div style={{ flex: 1 }}>
                                <div className="complaint-item-header">
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{complaint.title}</h3>
                                    {getStatusBadge(complaint.status)}
                                </div>
                                <div className="complaint-item-footer">
                                    <span>Submitted: {format(new Date(complaint.createdAt), 'PPP')}</span>
                                    {complaint.assignedTo && <span>Assigned: {complaint.assignedTo.name}</span>}
                                </div>
                            </div>
                            <ChevronRight size={20} color="var(--text-muted)" className="chevron-icon" />
                        </motion.div>
                    ))}
                </div>
            )}

            <style>{`
                .dashboard-container {
                    padding: 2rem;
                }
                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 2.5rem;
                }
                .complaint-item {
                    padding: 1.5rem;
                }
                .complaint-item-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 0.5rem;
                }
                .complaint-item-footer {
                    display: flex;
                    gap: 2rem;
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }

                @media (max-width: 768px) {
                    .dashboard-container { padding: 1rem; }
                    .dashboard-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1.5rem;
                    }
                    .dashboard-header .btn {
                        width: 100%;
                    }
                    .complaint-item {
                        gap: 1rem !important;
                    }
                    .complaint-item-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }
                    .complaint-item-footer {
                        flex-direction: column;
                        gap: 0.25rem;
                    }
                    .chevron-icon {
                        display: none;
                    }
                }
            `}</style>

        </div>
    );
};

export default Dashboard;
