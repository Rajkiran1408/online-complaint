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
        <div style={{ padding: '2rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Welcome, {user.name}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {user.role === 'User' ? 'Manage your submitted grievances and track progress.' :
                            user.role === 'Admin' ? 'Administrator portal: Oversee and assign complaints.' :
                                'Support portal: Resolve assigned grievances.'}
                    </p>
                </div>
                {user.role === 'User' && (
                    <button onClick={() => navigate('/submit')} className="btn btn-primary">
                        <Plus size={20} />
                        Submit New Complaint
                    </button>
                )}
            </header>

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
                            className="glass-morphism card"
                            style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2rem' }}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{complaint.title}</h3>
                                    {getStatusBadge(complaint.status)}
                                </div>
                                <div style={{ display: 'flex', gap: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    <span>Submitted on: {format(new Date(complaint.createdAt), 'PPP')}</span>
                                    {complaint.assignedTo && <span>Assigned to: {complaint.assignedTo.name}</span>}
                                </div>
                            </div>
                            <ChevronRight size={20} color="var(--text-muted)" />
                        </motion.div>
                    ))}
                </div>
            )}

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default Dashboard;
