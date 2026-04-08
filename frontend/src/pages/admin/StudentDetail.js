import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';

export default function AdminStudentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [projForm, setProjForm] = useState({});
  const [saving, setSaving] = useState(false);

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  const fetchStudent = async () => {
    try {
      const { data } = await axios.get(`/api/admin/students/${id}`);
      if (data.success) setStudent(data.student);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStudent(); }, [id]);

  const handleEditProject = (p) => {
    setEditProject(p);
    setProjForm({ title: p.title, description: p.description, techStack: p.techStack?.join(', ') || '', status: p.status });
  };

  const handleSaveProject = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.put(`/api/admin/projects/${editProject._id}`, projForm);
      if (data.success) {
        setEditProject(null);
        showAlert('success', 'Project updated!');
        fetchStudent();
      }
    } catch (e) {
      showAlert('error', e.response?.data?.message || 'Update failed.');
    } finally { setSaving(false); }
  };

  const handleDeleteStudent = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this student? This cannot be undone.')) return;
    try {
      const { data } = await axios.delete(`/api/admin/students/${id}`);
      if (data.success) navigate('/admin/students');
    } catch (e) {
      showAlert('error', e.response?.data?.message || 'Delete failed.');
    }
  };

  if (loading) return <Layout title="Student Detail"><div className="page-loader"><div className="spinner" style={{ width:32,height:32,borderWidth:3 }} /></div></Layout>;
  if (!student) return <Layout title="Student Detail"><div className="alert alert-error">Student not found.</div></Layout>;

  return (
    <Layout title="Student Detail">
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>← Back</button>
        <h1 style={{ fontSize:'1.3rem', fontWeight:700 }}>Student Profile</h1>
        {user?.role === 'superadmin' && (
          <button className="btn btn-danger btn-sm" style={{ marginLeft:'auto' }} onClick={handleDeleteStudent}>
            🗑️ Delete Student
          </button>
        )}
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.type === 'success' ? '✅' : '⚠️'} {alert.msg}</div>}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:20 }}>
        {/* Profile Card */}
        <div>
          <div className="card" style={{ marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
              <div style={{ width:54, height:54, borderRadius:'50%', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'1.2rem', color:'#fff', flexShrink:0 }}>
                {student.userId?.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:'1.05rem' }}>{student.userId?.name}</div>
                <div style={{ fontSize:'0.8rem', color:'var(--text3)' }}>{student.userId?.email}</div>
              </div>
            </div>
            {[
              ['Phone', student.phone],
              ['College', student.college],
              ['Course', student.course],
              ['Status', student.userId?.isActive ? '✅ Active' : '❌ Inactive'],
              ['Joined', student.userId?.createdAt ? new Date(student.userId.createdAt).toLocaleDateString() : '—'],
            ].map(([label, val]) => (
              <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)', fontSize:'0.85rem' }}>
                <span style={{ color:'var(--text3)' }}>{label}</span>
                <span style={{ fontWeight:500 }}>{val || '—'}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-title">📄 Resume</div>
            {student.resumeUrl ? (
              <div>
                <div style={{ fontSize:'0.82rem', color:'var(--text3)', marginBottom:8 }}>{student.resumeOriginalName}</div>
                <a href={student.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-full btn-sm">
                  📎 View / Download
                </a>
              </div>
            ) : (
              <p style={{ color:'var(--text3)', fontSize:'0.85rem' }}>No resume uploaded.</p>
            )}
          </div>
        </div>

        {/* Projects */}
        <div className="card">
          <div className="card-title">📁 Projects ({student.projects?.length || 0})</div>
          {!student.projects?.length ? (
            <div className="empty-state" style={{ padding:'20px 0' }}>
              <p className="empty-state-hint">No projects submitted yet.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {student.projects.map(p => (
                <div key={p._id} style={{ background:'var(--bg3)', borderRadius:'var(--radius)', padding:16 }}>
                  {editProject?._id === p._id ? (
                    <form onSubmit={handleSaveProject}>
                      <div className="form-group">
                        <label className="form-label">Title</label>
                        <input className="form-control" value={projForm.title} onChange={e => setProjForm({...projForm,title:e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-control" rows={3} value={projForm.description} onChange={e => setProjForm({...projForm,description:e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Tech Stack</label>
                        <input className="form-control" value={projForm.techStack} onChange={e => setProjForm({...projForm,techStack:e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Status</label>
                        <select className="form-control" value={projForm.status} onChange={e => setProjForm({...projForm,status:e.target.value})}>
                          <option value="ongoing">Ongoing</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      <div style={{ display:'flex', gap:8 }}>
                        <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                          {saving ? <><span className="spinner" /> Saving...</> : 'Save'}
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditProject(null)}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                        <h4 style={{ fontWeight:600 }}>{p.title}</h4>
                        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                          <span className={`badge ${p.status==='completed'?'badge-green':'badge-yellow'}`}>{p.status}</span>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleEditProject(p)}>✏️</button>
                        </div>
                      </div>
                      <p style={{ fontSize:'0.83rem', color:'var(--text2)', lineHeight:1.5, marginBottom:10 }}>{p.description}</p>
                      {p.techStack?.length > 0 && (
                        <div className="tag-list">
                          {p.techStack.map(t => <span key={t} className="tag">{t}</span>)}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
