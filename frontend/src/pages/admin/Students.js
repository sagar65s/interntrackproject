import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState('');
  const navigate = useNavigate();

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
    const timer = setTimeout(fetchStudents, 300);
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  return (
    <Layout title="Students">
      <h1 className="section-title">All Students</h1>
      <p className="section-subtitle">View and manage registered internship students.</p>

      <div className="table-wrapper">
        <div className="table-header">
          <span className="table-header-title">Students ({students.length})</span>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', flex:1, justifyContent:'flex-end' }}>
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                placeholder="Search name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
            <select className="filter-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="">Sort: Newest</option>
              <option value="name">Sort: Name</option>
              <option value="college">Sort: College</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="page-loader"><div className="spinner" style={{ width:28,height:28,borderWidth:3 }} /></div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎓</div>
            <p className="empty-state-text">No students found</p>
            <p className="empty-state-hint">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>College</th>
                  <th>Course</th>
                  <th>Resume</th>
                  <th>Projects</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s._id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.85rem', color:'#fff', flexShrink:0 }}>
                          {s.userId?.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight:600, fontSize:'0.87rem' }}>{s.userId?.name}</div>
                          <div style={{ fontSize:'0.75rem', color:'var(--text3)' }}>{s.userId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize:'0.85rem' }}>{s.college || <span style={{ color:'var(--text3)' }}>—</span>}</td>
                    <td style={{ fontSize:'0.85rem' }}>{s.course || <span style={{ color:'var(--text3)' }}>—</span>}</td>
                    <td>
                      {s.resumeUrl ? (
                        <a href={s.resumeUrl?.startsWith('http') ? s.resumeUrl : `http://localhost:5000${s.resumeUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">📎 View</a>
                      ) : (
                        <span style={{ color:'var(--text3)', fontSize:'0.8rem' }}>No resume</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                        {s.projects?.length > 0 ? (
                          <>
                            {s.projects.filter(p=>p.status==='ongoing').length > 0 &&
                              <span className="badge badge-yellow">{s.projects.filter(p=>p.status==='ongoing').length} ongoing</span>}
                            {s.projects.filter(p=>p.status==='completed').length > 0 &&
                              <span className="badge badge-green">{s.projects.filter(p=>p.status==='completed').length} done</span>}
                          </>
                        ) : <span style={{ color:'var(--text3)', fontSize:'0.8rem' }}>None</span>}
                      </div>
                    </td>
                    <td style={{ fontSize:'0.8rem', color:'var(--text3)' }}>
                      {s.userId?.createdAt ? new Date(s.userId.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/admin/students/${s._id}`)}>
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
