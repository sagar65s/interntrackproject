import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';

const emptyForm = { title: '', description: '', techStack: '', status: 'ongoing' };

export default function StudentProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [errors, setErrors] = useState({});

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get('/api/students/projects');
      if (data.success) setProjects(data.projects);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  const openAdd = () => {
    setEditProject(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditProject(p);
    setForm({ title: p.title, description: p.description, techStack: p.techStack?.join(', ') || '', status: p.status });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Project title is required.';
    if (!form.description.trim()) errs.description = 'Description is required.';
    return errs;
  };

  const handleSave = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      let data;
      if (editProject) {
        const res = await axios.put(`/api/students/projects/${editProject._id}`, form);
        data = res.data;
      } else {
        const res = await axios.post('/api/students/projects', form);
        data = res.data;
      }
      if (data.success) {
        setShowModal(false);
        showAlert('success', editProject ? 'Project updated!' : 'Project submitted!');
        fetchProjects();
      }
    } catch (e) {
      showAlert('error', e.response?.data?.message || 'Failed to save project.');
    } finally { setSaving(false); }
  };

  return (
    <Layout title="My Projects">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 className="section-title">My Projects</h1>
          <p style={{ color:'var(--text2)', fontSize:'0.9rem' }}>Track and manage your internship projects.</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Project</button>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.type === 'success' ? '✅' : '⚠️'} {alert.msg}</div>}

      {loading ? (
        <div className="page-loader"><div className="spinner" style={{ width:32,height:32,borderWidth:3 }} /></div>
      ) : projects.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p className="empty-state-text">No projects submitted yet</p>
            <p className="empty-state-hint">Add your first internship project to get started</p>
            <button className="btn btn-primary" style={{ marginTop:16 }} onClick={openAdd}>Submit First Project</button>
          </div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:16 }}>
          {projects.map(p => (
            <div key={p._id} className="card" style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <h3 style={{ fontSize:'1rem', fontWeight:600, flex:1 }}>{p.title}</h3>
                <span className={`badge ${p.status === 'completed' ? 'badge-green' : 'badge-yellow'}`}>
                  {p.status}
                </span>
              </div>
              <p style={{ fontSize:'0.85rem', color:'var(--text2)', lineHeight:1.5 }}>{p.description}</p>
              {p.techStack?.length > 0 && (
                <div className="tag-list">
                  {p.techStack.map(t => <span key={t} className="tag">{t}</span>)}
                </div>
              )}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'auto', paddingTop:12, borderTop:'1px solid var(--border)' }}>
                <span style={{ fontSize:'0.75rem', color:'var(--text3)' }}>
                  {new Date(p.createdAt).toLocaleDateString()}
                </span>
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>✏️ Edit</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editProject ? 'Edit Project' : 'Add New Project'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label className="form-label">Project Title *</label>
                  <input
                    className={`form-control${errors.title ? ' error' : ''}`}
                    placeholder="e.g. E-Commerce Web App"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                  />
                  {errors.title && <p className="form-error">{errors.title}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    className={`form-control${errors.description ? ' error' : ''}`}
                    placeholder="Describe what this project does, your role, key features..."
                    rows={4}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                  />
                  {errors.description && <p className="form-error">{errors.description}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Technologies Used</label>
                  <input
                    className="form-control"
                    placeholder="React, Node.js, MongoDB (comma separated)"
                    value={form.techStack}
                    onChange={e => setForm({ ...form, techStack: e.target.value })}
                  />
                  <p className="form-hint">Separate technologies with commas</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <><span className="spinner" /> Saving...</> : (editProject ? 'Update Project' : 'Submit Project')}
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
