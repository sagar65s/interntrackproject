import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';

export default function StudentProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ phone: '', college: '', course: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get('/api/students/profile');
        if (data.success) {
          setProfile(data.student);
          setForm({
            phone: data.student.phone || '',
            college: data.student.college || '',
            course: data.student.course || ''
          });
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleProfileSave = async e => {
    e.preventDefault();
    if (!form.phone || !form.college || !form.course) {
      showAlert('error', 'Please fill in all profile fields.');
      return;
    }
    setSaving(true);
    try {
      const { data } = await axios.put('/api/students/profile', form);
      if (data.success) {
        setProfile(data.student);
        showAlert('success', 'Profile updated successfully!');
      }
    } catch (e) {
      showAlert('error', e.response?.data?.message || 'Failed to save profile.');
    } finally { setSaving(false); }
  };

  const handleFileSelect = file => {
    if (!file) return;
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      showAlert('error', 'Only PDF and Word (.doc, .docx) files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showAlert('error', 'File size must not exceed 5MB.');
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = e => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) { showAlert('error', 'Please select a file first.'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('resume', selectedFile);
      const { data } = await axios.post('/api/students/upload-resume', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        setProfile(prev => ({ ...prev, resumeUrl: data.resumeUrl, resumeOriginalName: data.resumeOriginalName }));
        setSelectedFile(null);
        showAlert('success', 'Resume uploaded successfully!');
      }
    } catch (e) {
      showAlert('error', e.response?.data?.message || 'Upload failed.');
    } finally { setUploading(false); }
  };

  if (loading) return <Layout title="My Profile"><div className="page-loader"><div className="spinner" style={{ width:32,height:32,borderWidth:3 }} /></div></Layout>;

  return (
    <Layout title="My Profile">
      <h1 className="section-title">My Profile</h1>
      <p className="section-subtitle">Manage your personal information and resume.</p>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.type === 'success' ? '✅' : '⚠️'} {alert.msg}</div>}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

        {/* Profile Form */}
        <div className="card">
          <div className="card-title">✏️ Profile Details</div>
          <form onSubmit={handleProfileSave}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-control" value={user?.name} disabled style={{ opacity:0.6 }} />
              <p className="form-hint">Name cannot be changed here.</p>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-control" value={user?.email} disabled style={{ opacity:0.6 }} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                className="form-control"
                type="tel"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">College / University *</label>
              <input
                className="form-control"
                placeholder="e.g. IIT Bombay"
                value={form.college}
                onChange={e => setForm({ ...form, college: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Course / Degree *</label>
              <input
                className="form-control"
                placeholder="e.g. B.Tech Computer Science"
                value={form.course}
                onChange={e => setForm({ ...form, course: e.target.value })}
              />
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={saving}>
              {saving ? <><span className="spinner" /> Saving...</> : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Resume Upload */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title">📄 Resume</div>

            {profile?.resumeUrl && (
              <div style={{ background:'var(--bg3)', borderRadius:'var(--radius)', padding:14, marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--success)' }}>✅ Resume Uploaded</div>
                  <div style={{ fontSize:'0.78rem', color:'var(--text3)', marginTop:3 }}>{profile.resumeOriginalName}</div>
                </div>
                <a
                  href={`${profile.resumeUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                >
                  View 📎
                </a>
              </div>
            )}

            <div
              className={`file-upload-zone${dragOver ? ' drag-over' : ''}`}
              onClick={() => fileRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
            >
              <div className="file-upload-icon">📂</div>
              <div className="file-upload-text">Click or drag & drop your resume here</div>
              <div className="file-upload-hint">PDF, DOC, DOCX — Max 5MB</div>
              {selectedFile && <div className="file-selected">✅ {selectedFile.name}</div>}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx"
                style={{ display:'none' }}
                onChange={e => handleFileSelect(e.target.files[0])}
              />
            </div>

            {selectedFile && (
              <button className="btn btn-primary btn-full" style={{ marginTop:12 }} onClick={handleUpload} disabled={uploading}>
                {uploading ? <><span className="spinner" /> Uploading...</> : '⬆️ Upload Resume'}
              </button>
            )}
          </div>

          <div className="card">
            <div className="card-title">📊 Profile Status</div>
            {[
              { label: 'Basic Info', done: !!(user?.name && user?.email) },
              { label: 'Phone Number', done: !!profile?.phone },
              { label: 'College Name', done: !!profile?.college },
              { label: 'Course Name', done: !!profile?.course },
              { label: 'Resume Uploaded', done: !!profile?.resumeUrl },
            ].map(item => (
              <div key={item.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)', fontSize:'0.87rem' }}>
                <span style={{ color: item.done ? 'var(--text)' : 'var(--text3)' }}>{item.label}</span>
                <span>{item.done ? '✅' : '⭕'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
