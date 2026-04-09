import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';

export default function SuperStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState('');
  const [alert, setAlert] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (sort) params.set('sort', sort);
      const { data } = await axios.get(`/api/admin/students?${params}`);
      if (data.success) setStudents(data.students);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, statusFilter, sort]);

  useEffect(() => {
    const t = setTimeout(fetchStudents, 300);
    return () => clearTimeout(t);
  }, [fetchStudents]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    try {
      await axios.delete(`/api/admin/students/${id}`);
      showAlert('success', 'Student deleted successfully.');
      fetchStudents();
    } catch (e) {
      showAlert('error', e.response?.data?.message || 'Delete failed.');
    }
  };

  const openEdit = (s) => {
    setEditStudent(s);
    setEditForm({ name: s.userId?.name || '', phone: s.phone || '', college: s.college || '', course: s.course || '' });
  };

  const handleSaveEdit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.put(`/api/admin/students/${editStudent._id}`, editForm);
      if (data.success) {
        setEditStudent(null);
        showAlert('success', 'Student updated!');
        fetchStudents();
      }
    } catch (e) {
      showAlert('error', 'Update failed.');
    } finally { setSaving(false); }
  };

  return (
    <Layout title="Manage Students">
      <h1 className="section-title">Manage Students</h1>
      <p className="section-subtitle">Full control over all student records.</p>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.type === 'success' ? '✅' : '⚠️'} {alert.msg}</div>}

      <div className="table-wrapper">
        <div className="table-header">
          <span className="table-header-title">Students ({students.length})</span>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', flex:1, justifyContent:'flex-end' }}>
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input placeholder="Search name or email..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
            <select className="filter-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="">Sort: Newest</option>
              <option value="name">Name</option>
              <option value="college">College</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="page-loader"><div className="spinner" style={{ width:28,height:28,borderWidth:3 }} /></div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎓</div>
            <p className="empty-state-text">No students found</p>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>College / Course</th>
                  <th>Resume</th>
                  <th>Projects</th>
                  <th>Profile</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s._id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.8rem', color:'#fff', flexShrink:0 }}>
                          {s.userId?.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight:600, fontSize:'0.87rem' }}>{s.userId?.name}</div>
                          <div style={{ fontSize:'0.74rem', color:'var(--text3)' }}>{s.userId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize:'0.84rem' }}>{s.college || '—'}</div>
                      <div style={{ fontSize:'0.74rem', color:'var(--text3)' }}>{s.course || ''}</div>
                    </td>
                    <td>
                      {s.resumeUrl ? (
                        <a href={s.resumeUrl?.startsWith('http') ? s.resumeUrl : `http://localhost:5000${s.resumeUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">📎 View</a>
                      ) : <span style={{ color:'var(--text3)', fontSize:'0.8rem' }}>—</span>}
                    </td>
                    <td>
                      <span className="badge badge-blue">{s.projects?.length || 0} projects</span>
                    </td>
                    <td>
                      <span className={`badge ${s.profileCompleted ? 'badge-green' : 'badge-gray'}`}>
                        {s.profileCompleted ? 'Complete' : 'Incomplete'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/admin/students/${s._id}`)}>View</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id, s.userId?.name)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editStudent && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditStudent(null)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Edit Student</h3>
              <button className="modal-close" onClick={() => setEditStudent(null)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSaveEdit}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-control" value={editForm.name} onChange={e => setEditForm({...editForm, name:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-control" value={editForm.phone} onChange={e => setEditForm({...editForm, phone:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">College</label>
                  <input className="form-control" value={editForm.college} onChange={e => setEditForm({...editForm, college:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Course</label>
                  <input className="form-control" value={editForm.course} onChange={e => setEditForm({...editForm, course:e.target.value})} />
                </div>
                <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setEditStudent(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <><span className="spinner" /> Saving...</> : 'Save Changes'}
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
