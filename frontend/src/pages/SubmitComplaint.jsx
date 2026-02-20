import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { Send, FileText, ImagePlus, AlertCircle, ArrowLeft, X, Bus, Utensils, BookOpen, Coins, Building, Bed } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SubmitComplaint = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [step, setStep] = useState(location.state?.title ? 2 : 1);
    const [formData, setFormData] = useState({
        title: location.state?.title || '',
        description: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('Only image files (JPEG, PNG, GIF, WebP) are allowed.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB.');
            return;
        }

        setError('');
        setImageFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            if (imageFile) {
                submitData.append('attachment', imageFile);
            }

            await api.post('/complaints', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit complaint. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { icon: <Bus size={32} />, label: 'Bus Problem', value: 'Bus / Transport Issue', color: 'var(--primary)', desc: 'Transportation, routes, timings' },
        { icon: <Bed size={32} />, label: 'Hostel', value: 'Hostel / Accommodation Issue', color: 'var(--secondary)', desc: 'Rooms, maintenance, facilities' },
        { icon: <Utensils size={32} />, label: 'Food', value: 'Food / Canteen Issue', color: 'var(--accent)', desc: 'Quality, hygiene, service' },
        { icon: <Coins size={32} />, label: 'Fees', value: 'Fees / Finance Issue', color: 'var(--warning)', desc: 'Payments, refunds, scholarships' },
        { icon: <BookOpen size={32} />, label: 'Education', value: 'Academic / Education Issue', color: 'var(--success)', desc: 'Classes, exams, results' },
        { icon: <Building size={32} />, label: 'Campus', value: 'Campus Infrastructure Issue', color: '#ec4899', desc: 'Buildings, lights, roads' },
        { icon: <AlertCircle size={32} />, label: 'General / Other', value: 'General / Other Issue', color: '#64748b', desc: 'Any other issues or suggestions' },
    ];

    const selectCategory = (val) => {
        setFormData({ ...formData, title: val });
        setStep(2);
    };

    return (
        <div className="submit-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <button onClick={() => step === 2 ? setStep(1) : navigate(-1)} className="btn btn-outline" style={{ padding: '0.5rem 1rem', width: 'auto' }}>
                    <ArrowLeft size={18} />
                    {step === 2 ? 'Change Category' : 'Back'}
                </button>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ width: '40px', height: '6px', borderRadius: '3px', background: 'var(--primary)' }}></div>
                    <div style={{ width: '40px', height: '6px', borderRadius: '3px', background: step === 2 ? 'var(--primary)' : 'var(--glass-border)' }}></div>
                </div>
            </div>

            <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-morphism card submission-card"
            >
                <style>{`
                .submit-container {
                    maxWidth: 850px;
                    margin: 2rem auto;
                    padding: 0 1.5rem 5rem;
                }
                .submission-card {
                    padding: 2.5rem;
                }
                @media (max-width: 600px) {
                    .submit-container {
                        padding: 1rem;
                        margin: 0;
                    }
                    .submission-card {
                        padding: 1.5rem;
                    }
                    h1 {
                        font-size: 1.5rem !important;
                    }
                }
            `}</style>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Select Category</h1>
                                <p style={{ color: 'var(--text-muted)' }}>What kind of grievance are you facing today?</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                                {categories.map((cat, idx) => (
                                    <motion.div
                                        key={idx}
                                        whileHover={{ scale: 1.02, y: -5 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => selectCategory(cat.value)}
                                        style={{
                                            padding: '2rem 1.5rem',
                                            borderRadius: '1.25rem',
                                            border: '1px solid var(--glass-border)',
                                            background: 'rgba(255, 255, 255, 0.02)',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '1rem'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = cat.color;
                                            e.currentTarget.style.boxShadow = `0 10px 30px color-mix(in srgb, ${cat.color} 15%, transparent)`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--glass-border)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <div style={{
                                            width: '64px',
                                            height: '64px',
                                            borderRadius: '1rem',
                                            background: `color-mix(in srgb, ${cat.color} 12%, transparent)`,
                                            color: cat.color,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: '0.5rem'
                                        }}>
                                            {cat.icon}
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{cat.label}</h3>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{cat.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div style={{ marginBottom: '2.5rem' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '2rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
                                    {categories.find(c => c.value === formData.title)?.icon || <FileText size={16} />}
                                    {categories.find(c => c.value === formData.title)?.label || 'Other'}
                                </div>
                                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Further Details</h1>
                                <p style={{ color: 'var(--text-muted)' }}>Tell us more about the {formData.title.toLowerCase()} issue.</p>
                            </div>

                            {error && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', borderRadius: '0.75rem', color: 'var(--error)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                    <AlertCircle size={18} />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="input-group">
                                    <label>Complaint Title</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Detailed Description</label>
                                    <textarea
                                        className="input-field"
                                        style={{ minHeight: '180px', resize: 'vertical' }}
                                        placeholder="Please provide as much detail as possible..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Evidence (Optional)</label>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{ display: 'none' }}
                                    />

                                    {!imagePreview ? (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            style={{ border: '2px dashed var(--glass-border)', borderRadius: '1rem', padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.02)', transition: 'all 0.2s ease' }}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                                        >
                                            <ImagePlus size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                                            <p style={{ fontWeight: 600 }}>Click to upload screenshot</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Supports JPG, PNG, WebP (Max 5MB)</p>
                                        </div>
                                    ) : (
                                        <div style={{ position: 'relative', borderRadius: '1rem', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                                            <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', background: '#000' }} />
                                            <button type="button" onClick={removeImage} style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer' }}>
                                                <X size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '3rem' }}>
                                    <button type="button" onClick={() => setStep(1)} className="btn btn-outline" style={{ flex: 1 }}>Back</button>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                                        <Send size={18} />
                                        {loading ? 'Submitting...' : 'Submit Grievance'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default SubmitComplaint;
