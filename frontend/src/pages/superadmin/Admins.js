import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';

export default function SuperAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  const fetchAdmins = async () => {
    try {
      const { data } = await axios.get('/api/admin/admins');
      if (data.success) setAdmins(data.admins);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Valid email required.';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    return errs;
  };

  const handleCreate = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const { data } = await axios.post('/api/auth/create-admin', form);
      if (data.success) {
        setShowModal(false);
        setForm({ name: '', email: '', password: '' });
        setErrors({});
        showAlert('success', 'Admin account created successfully!');
        fetchAdmins();
      }
    } catch (e) {
      showAlert('error', e.response?.data?.message || 'Failed to create admin.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete admin "${name}"?`)) return;
    try {
      await axios.delete(`/api/admin/admins/${id}`);
      showAlert('success', 'Admin deleted.');
      fetchAdmins();
    } catch (e) {
      showAlert('error', e.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <Layout title="Manage Admins">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 className="section-title">Manage Admins</h1>
          <p style={{ color:'var(--text2)', fontSize:'0.9rem' }}>Create and manage admin accounts with limited access.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setForm({ name:'',email:'',password:'' }); setErrors({}); }}>
          + Add Admin
        </button>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.type === 'success' ? '✅' : '⚠️'} {alert.msg}</div>}

      <div className="table-wrapper">
        <div className="table-header">
          <span className="table-header-title">Admins ({admins.length})</span>
        </div>
        {loading ? (
          <div className="page-loader"><div className="spinner" style={{ width:28,height:28,borderWidth:3 }} /></div>
        ) : admins.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛡️</div>
            <p className="empty-state-text">No admins yet</p>
            <p className="empty-state-hint">Create an admin account to delegate management tasks</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Admin</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(a => (
                <tr key={a._id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:34, height:34, borderRadius:'50%', background:'rgba(34,197,94,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.85rem', color:'var(--success)', flexShrink:0 }}>
                        {a.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                      </div>
                      <span style={{ fontWeight:600, fontSize:'0.87rem' }}>{a.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize:'0.85rem', color:'var(--text2)' }}>{a.email}</td>
                  <td><span className="badge badge-green">Admin</span></td>
                  <td><span className={`badge ${a.isActive ? 'badge-blue' : 'badge-red'}`}>{a.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td style={{ fontSize:'0.8rem', color:'var(--text3)' }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a._id, a.name)}>🗑️ Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Admin Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Create Admin Account</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info" style={{ marginBottom:16 }}>
                ℹ️ Admins can view students, resumes, and update project details, but cannot delete students or manage other admins.
              </div>
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    className={`form-control${errors.name ? ' error' : ''}`}
                    placeholder="Admin Full Name"
                    value={form.name}
                    onChange={e => setForm({...form,name:e.target.value})}
                  />
                  {errors.name && <p className="form-error">{errors.name}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    className={`form-control${errors.email ? ' error' : ''}`}
                    type="email"
                    placeholder="admin@company.com"
                    value={form.email}
                    onChange={e => setForm({...form,email:e.target.value})}
                  />
                  {errors.email && <p className="form-error">{errors.email}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input
                    className={`form-control${errors.password ? ' error' : ''}`}
                    type="password"
                    placeholder="At least 6 characters"
                    value={form.password}
                    onChange={e => setForm({...form,password:e.target.value})}
                  />
                  {errors.password && <p className="form-error">{errors.password}</p>}
                </div>
                <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <><span className="spinner" /> Creating...</> : 'Create Admin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
