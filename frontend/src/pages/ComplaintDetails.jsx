import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
    ArrowLeft, Clock, User, Shield, CheckCircle2,
    MessageSquare, Star, Send, UserCheck, AlertTriangle, ImagePlus, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const ComplaintDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [staffList, setStaffList] = useState([]); // For Admin to assign
    const [updateData, setUpdateData] = useState({
        status: '',
        comment: '',
        assignedTo: ''
    });
    const [feedbackData, setFeedbackData] = useState({
        rating: 5,
        comment: ''
    });
    const [activeTab, setActiveTab] = useState('details'); // 'details' or 'updates'
    const [resolutionImage, setResolutionImage] = useState(null);
    const [resolutionPreview, setResolutionPreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchComplaint();
        if (user.role === 'Admin') {
            fetchStaff();
        }
    }, [id, user.role]);

    const fetchStaff = async () => {
        try {
            const response = await api.get('/auth/staff');
            setStaffList(response.data.data);
        } catch (err) {
            console.error('Error fetching staff:', err);
        }
    };

    const fetchComplaint = async () => {
        try {
            const response = await api.get(`/complaints/${id}`);
            setComplaint(response.data.data);
            setUpdateData(prev => ({ ...prev, status: response.data.data.status }));
        } catch (err) {
            console.error('Error fetching complaint:', err);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setResolutionImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setResolutionPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeResolutionImage = () => {
        setResolutionImage(null);
        setResolutionPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('status', updateData.status);
            formData.append('comment', updateData.comment);
            if (updateData.assignedTo) formData.append('assignedTo', updateData.assignedTo);
            if (resolutionImage) formData.append('resolutionImage', resolutionImage);

            await api.put(`/complaints/${id}/status`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            fetchComplaint();
            setUpdateData({ ...updateData, comment: '' });
            removeResolutionImage();
        } catch (err) {
            alert(err.response?.data?.message || 'Update failed');
        }
    };

    const handleRatingSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/complaints/feedback', {
                complaintId: id,
                ...feedbackData
            });
            fetchComplaint();
        } catch (err) {
            alert(err.response?.data?.message || 'Feedback failed');
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '10rem' }}>Loading details...</div>;
    if (!complaint) return null;

    const statusOrder = ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

    return (
        <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1.5rem pb-5' }}>
            <button onClick={() => navigate('/')} className="btn btn-outline" style={{ marginBottom: '2rem' }}>
                <ArrowLeft size={18} />
                Back to Dashboard
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                {/* Left Column: Complaint Details */}
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-morphism card"
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <span className={`badge badge-${complaint.status.toLowerCase().replace(' ', '-')}`}>
                                {complaint.status}
                            </span>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                {format(new Date(complaint.createdAt), 'PPP')}
                            </span>
                        </div>

                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem' }}>{complaint.title}</h1>

                        <div style={{ marginBottom: '2.5rem' }}>
                            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Description</h4>
                            <p style={{ lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{complaint.description}</p>
                        </div>

                        {complaint.attachmentUrl && (
                            <div style={{ marginBottom: '2.5rem' }}>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Attachment</h4>
                                <a href={`${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}${complaint.attachmentUrl}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid var(--glass-border)', transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'pointer' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    <img
                                        src={`${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}${complaint.attachmentUrl}`}
                                        alt="Complaint Evidence"
                                        style={{ width: '100%', maxHeight: '350px', objectFit: 'contain', display: 'block', background: 'rgba(0,0,0,0.05)' }}
                                    />
                                    <div style={{ padding: '0.6rem 1rem', background: 'rgba(99, 102, 241, 0.08)', textAlign: 'center', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                                        Click to view full size ↗
                                    </div>
                                </a>
                            </div>
                        )}

                        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem', display: 'flex', gap: '3rem' }}>
                            <div>
                                <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Submitted By</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <User size={16} color="var(--primary)" />
                                    <span style={{ fontWeight: 600 }}>{complaint.user.name}</span>
                                </div>
                            </div>
                            {complaint.assignedTo && (
                                <div>
                                    <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Assigned Staff</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Shield size={16} color="var(--secondary)" />
                                        <span style={{ fontWeight: 600 }}>{complaint.assignedTo.name}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Updates/Timeline Section */}
                    <div style={{ marginTop: '2rem' }}>
                        <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                            <button
                                onClick={() => setActiveTab('details')}
                                style={{ padding: '1rem 0', background: 'none', border: 'none', cursor: 'pointer', color: activeTab === 'details' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'details' ? '2px solid var(--primary)' : 'none', fontWeight: 600 }}
                            >
                                Resolution Progress
                            </button>
                            <button
                                onClick={() => setActiveTab('updates')}
                                style={{ padding: '1rem 0', background: 'none', border: 'none', cursor: 'pointer', color: activeTab === 'updates' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'updates' ? '2px solid var(--primary)' : 'none', fontWeight: 600 }}
                            >
                                History ({complaint.updates?.length || 0})
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            {activeTab === 'details' ? (
                                <motion.div
                                    key="resolution"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="glass-morphism card"
                                >
                                    {complaint.feedback ? (
                                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                                            <div className="premium-gradient" style={{ width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                                <Star size={24} color="white" fill="white" />
                                            </div>
                                            <h3 style={{ marginBottom: '0.5rem' }}>User Feedback</h3>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', marginBottom: '1rem' }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={18} color={i < complaint.feedback.rating ? 'var(--warning)' : 'var(--text-muted)'} fill={i < complaint.feedback.rating ? 'var(--warning)' : 'none'} />
                                                ))}
                                            </div>
                                            <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>"{complaint.feedback.comment}"</p>
                                        </div>
                                    ) : complaint.status === 'Closed' || complaint.status === 'Resolved' ? (
                                        <div>
                                            {complaint.resolutionImageUrl && (
                                                <div style={{ marginBottom: '2rem' }}>
                                                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Resolution Proof</h4>
                                                    <a href={`${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}${complaint.resolutionImageUrl}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid var(--glass-border)', transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'pointer' }}>
                                                        <img
                                                            src={`${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}${complaint.resolutionImageUrl}`}
                                                            alt="Resolution Evidence"
                                                            style={{ width: '100%', maxHeight: '250px', objectFit: 'contain', display: 'block', background: 'rgba(0,0,0,0.05)' }}
                                                        />
                                                        <div style={{ padding: '0.5rem', background: 'rgba(34, 197, 94, 0.08)', textAlign: 'center', fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
                                                            Staff uploaded this proof of resolution ↗
                                                        </div>
                                                    </a>
                                                </div>
                                            )}

                                            {user.role === 'User' ? (
                                                <form onSubmit={handleRatingSubmit}>
                                                    <h3 style={{ marginBottom: '1.5rem' }}>Rate our Resolution</h3>
                                                    <div className="input-group">
                                                        <label>Rating (1-5)</label>
                                                        <input
                                                            type="number"
                                                            min="1" max="5"
                                                            className="input-field"
                                                            value={feedbackData.rating}
                                                            onChange={(e) => setFeedbackData({ ...feedbackData, rating: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="input-group">
                                                        <label>Your Feedback</label>
                                                        <textarea
                                                            className="input-field"
                                                            placeholder="How was your experience?"
                                                            value={feedbackData.comment}
                                                            onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                                                            required
                                                        />
                                                    </div>
                                                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Submit Feedback</button>
                                                </form>
                                            ) : (
                                                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                                    <CheckCircle2 size={32} style={{ marginBottom: '1rem' }} />
                                                    <p>Complaint is resolved. {complaint.resolutionImageUrl ? 'Proof has been provided.' : 'Waiting for user feedback.'}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                            <Clock size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                            <p>The resolution process is currently underway.</p>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="history"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    {complaint.updates && complaint.updates.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {complaint.updates.map((update, i) => (
                                                <div key={i} className="glass-morphism" style={{ padding: '1rem 1.5rem', borderLeft: '4px solid var(--primary)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{update.newStatus}</span>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{format(new Date(update.createdAt), 'MMM d, p')}</span>
                                                    </div>
                                                    <p style={{ fontSize: '0.9rem' }}>{update.comment}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No status updates yet.</p>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right Column: Actions (Admin/Staff) */}
                <div>
                    {(user.role === 'Admin' || user.role === 'Support Staff') && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-morphism card"
                            style={{ position: 'sticky', top: '7rem' }}
                        >
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Shield size={20} color="var(--primary)" />
                                Grievance Action
                            </h3>

                            <form onSubmit={handleUpdateStatus}>
                                <div className="input-group">
                                    <label>Update Status</label>
                                    <select
                                        className="input-field"
                                        value={updateData.status}
                                        onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                                    >
                                        {statusOrder.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>

                                {user.role === 'Admin' && updateData.status === 'Assigned' && (
                                    <div className="input-group">
                                        <label>Assign to Support Staff</label>
                                        <div style={{ position: 'relative' }}>
                                            <UserCheck size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <select
                                                className="input-field"
                                                style={{ paddingLeft: '2.75rem' }}
                                                value={updateData.assignedTo}
                                                onChange={(e) => setUpdateData({ ...updateData, assignedTo: e.target.value })}
                                                required={updateData.status === 'Assigned'}
                                            >
                                                <option value="">Select Staff Member</option>
                                                {staffList.map(staff => (
                                                    <option key={staff._id} value={staff._id}>{staff.name} ({staff.email})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Admin: Select a staff member to handle this grievance.</p>
                                    </div>
                                )}

                                {updateData.status === 'Resolved' && (
                                    <div className="input-group">
                                        <label>Resolution Proof (Optional)</label>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            style={{ display: 'none' }}
                                        />
                                        {!resolutionPreview ? (
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                style={{ border: '2px dashed var(--glass-border)', borderRadius: '1rem', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.02)', transition: 'all 0.2s ease' }}
                                                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                                            >
                                                <ImagePlus size={24} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                                                <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>Click to upload solved image</p>
                                            </div>
                                        ) : (
                                            <div style={{ position: 'relative', borderRadius: '1rem', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                                                <img src={resolutionPreview} alt="Preview" style={{ width: '100%', maxHeight: '150px', objectFit: 'contain', background: '#000' }} />
                                                <button type="button" onClick={removeResolutionImage} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', padding: '0.3rem', cursor: 'pointer' }}>
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="input-group">
                                    <label>Internal Comment / Note</label>
                                    <textarea
                                        className="input-field"
                                        style={{ minHeight: '100px' }}
                                        placeholder="Explain the status change..."
                                        value={updateData.comment}
                                        onChange={(e) => setUpdateData({ ...updateData, comment: e.target.value })}
                                        required
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                    <Send size={18} />
                                    Update Complaint
                                </button>
                            </form>

                            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', marginBottom: '0.5rem' }}>
                                    <AlertTriangle size={16} />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Workflow Rule</span>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    Standard flow: Open → Assigned → In Progress → Resolved → Closed. Status updates are logged in the history.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {user.role === 'User' && complaint.status === 'Open' && (
                        <div className="glass-morphism card" style={{ position: 'sticky', top: '7rem', textAlign: 'center' }}>
                            <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '1rem', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <Clock size={32} />
                            </div>
                            <h3>Under Review</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '1rem' }}>
                                Your grievance is being reviewed by the administration. You will be notified once a support staff member is assigned.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComplaintDetails;
