import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';

export default function SuperStudents() {
  const [students, setStudents]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [search, setSearch]                 = useState('');
  const [statusFilter, setStatusFilter]     = useState('');
  const [sort, setSort]                     = useState('');
  const [alert, setAlert]                   = useState(null);
  const [editStudent, setEditStudent]       = useState(null);
  const [editForm, setEditForm]             = useState({});
  const [saving, setSaving]                 = useState(false);
  const [emailModal, setEmailModal]         = useState(false);
  const [emailTarget, setEmailTarget]       = useState(null);
  const [emailMsg, setEmailMsg]             = useState('');
  const [sendingEmail, setSendingEmail]     = useState(false);
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [broadcastMsg, setBroadcastMsg]     = useState('');
  const [broadcasting, setBroadcasting]     = useState(false);

  const navigate = useNavigate();

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 5000);
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
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`/api/admin/students/${id}`);
      showAlert('success', 'Student deleted successfully.');
      fetchStudents();
    } catch (e) { showAlert('error', 'Delete failed.'); }
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
      if (data.success) { setEditStudent(null); showAlert('success', 'Student updated!'); fetchStudents(); }
    } catch (e) { showAlert('error', 'Update failed.'); }
    finally { setSaving(false); }
  };

  const openEmailModal = (s) => {
    setEmailTarget({ userId: s.userId?._id, name: s.userId?.name, email: s.userId?.email });
    setEmailMsg('');
    setEmailModal(true);
  };

  const handleSendEmail = async () => {
    if (!emailMsg.trim()) { showAlert('error', 'Please type a message.'); return; }
    setSendingEmail(true);
    try {
      const { data } = await axios.post('/api/email/send-message', {
        studentUserId: emailTarget.userId,
        message: emailMsg.trim(),
      });
      if (data.success) {
        setEmailModal(false); setEmailMsg('');
        showAlert('success', `✅ Email sent to ${emailTarget.email}`);
      } else { showAlert('error', data.message); }
    } catch (e) { showAlert('error', e.response?.data?.message || 'Failed to send email.'); }
    finally { setSendingEmail(false); }
  };

  const handleBroadcast = async () => {
    if (!broadcastMsg.trim()) { showAlert('error', 'Please type a message.'); return; }
    setBroadcasting(true);
    try {
      const { data } = await axios.post('/api/email/send-all', { message: broadcastMsg.trim() });
      if (data.success) {
        setBroadcastModal(false); setBroadcastMsg('');
        showAlert('success', data.message);
      } else { showAlert('error', data.message); }
    } catch (e) { showAlert('error', 'Failed to send broadcast.'); }
    finally { setBroadcasting(false); }
  };

  const resumeHref = (url) => {
    if (!url) return '#';
    return url.startsWith('http') ? url : `http://localhost:5000${url}`;
  };

  const totalProjects  = students.reduce((a, s) => a + (s.projects?.length || 0), 0);
  const totalCompleted = students.reduce((a, s) => a + (s.projects?.filter(p => p.status === 'completed').length || 0), 0);
  const totalResumes   = students.filter(s => s.resumeUrl).length;

  return (
    <Layout title="Manage Students">

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ fontSize:'1.6rem', fontWeight:800, margin:'0 0 4px' }}>Manage Students</h1>
            <p style={{ color:'var(--text3)', fontSize:'0.88rem', margin:0 }}>
              View, edit, email and manage all registered internship students.
            </p>
          </div>
          <button
            onClick={() => { setBroadcastModal(true); setBroadcastMsg(''); }}
            style={{
              display:'flex', alignItems:'center', gap:8,
              background:'rgba(59,130,246,0.1)', color:'var(--accent)',
              border:'1.5px solid rgba(59,130,246,0.3)',
              borderRadius:10, padding:'10px 18px',
              fontWeight:600, fontSize:'0.88rem', cursor:'pointer',
              transition:'all 0.2s'
            }}
          >
            📢 Email All Students
          </button>
        </div>

        {/* ── Summary Stats ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginTop:22 }}>
          {[
            { icon:'🎓', value: students.length, label:'Total Students',    color:'var(--accent)',  bg:'rgba(59,130,246,0.1)'  },
            { icon:'📁', value: totalProjects,   label:'Total Projects',    color:'#a78bfa',        bg:'rgba(167,139,250,0.1)' },
            { icon:'✅', value: totalCompleted,  label:'Completed',         color:'var(--success)', bg:'rgba(34,197,94,0.1)'   },
            { icon:'📄', value: totalResumes,    label:'Resumes Uploaded',  color:'var(--warning)', bg:'rgba(245,158,11,0.1)'  },
          ].map(stat => (
            <div key={stat.label} style={{
              background:'var(--bg2)', border:'1px solid var(--border)',
              borderRadius:14, padding:'16px 20px',
              display:'flex', alignItems:'center', gap:14
            }}>
              <div style={{
                width:44, height:44, borderRadius:12,
                background: stat.bg,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'1.2rem', flexShrink:0
              }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize:'1.5rem', fontWeight:800, color: stat.color, lineHeight:1 }}>{stat.value}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--text3)', marginTop:3 }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`} style={{ marginBottom:20 }}>
          {alert.type==='success' ? '✅' : '⚠️'} {alert.msg}
        </div>
      )}

      {/* ── Search & Filters ── */}
      <div style={{
        background:'var(--bg2)', border:'1px solid var(--border)',
        borderRadius:14, padding:'16px 20px', marginBottom:16,
        display:'flex', alignItems:'center', gap:12, flexWrap:'wrap'
      }}>
        {/* Search */}
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:'0.9rem', color:'var(--text3)' }}>🔍</span>
          <input
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width:'100%', background:'var(--bg3)',
              border:'1.5px solid var(--border)', borderRadius:10,
              color:'var(--text)', padding:'9px 14px 9px 36px',
              fontSize:'0.87rem', outline:'none',
              transition:'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor='var(--accent)'}
            onBlur={e => e.target.style.borderColor='var(--border)'}
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{
            background:'var(--bg3)', border:'1.5px solid var(--border)',
            borderRadius:10, color:'var(--text)',
            padding:'9px 14px', fontSize:'0.87rem', outline:'none', cursor:'pointer'
          }}
        >
          <option value="">All Projects</option>
          <option value="ongoing">Has Ongoing</option>
          <option value="completed">Has Completed</option>
        </select>

        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          style={{
            background:'var(--bg3)', border:'1.5px solid var(--border)',
            borderRadius:10, color:'var(--text)',
            padding:'9px 14px', fontSize:'0.87rem', outline:'none', cursor:'pointer'
          }}
        >
          <option value="">Sort: Newest First</option>
          <option value="name">Sort: Name A–Z</option>
          <option value="college">Sort: College</option>
        </select>

        <div style={{ fontSize:'0.82rem', color:'var(--text3)', whiteSpace:'nowrap' }}>
          {students.length} student{students.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* ── Students Table ── */}
      <div style={{
        background:'var(--bg2)', border:'1px solid var(--border)',
        borderRadius:16, overflow:'hidden'
      }}>
        {loading ? (
          <div className="page-loader"><div className="spinner" style={{width:32,height:32,borderWidth:3}}/></div>
        ) : students.length === 0 ? (
          <div className="empty-state" style={{ padding:'60px 20px' }}>
            <div style={{ fontSize:'3rem', marginBottom:12 }}>🎓</div>
            <p style={{ fontSize:'1rem', color:'var(--text2)', marginBottom:6 }}>No students found</p>
            <p style={{ fontSize:'0.85rem', color:'var(--text3)' }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'var(--bg3)' }}>
                  {['#', 'Student', 'Contact', 'College & Course', 'Projects', 'Resume', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding:'13px 18px', textAlign:'left',
                      fontSize:'0.72rem', fontWeight:700,
                      color:'var(--text3)', letterSpacing:'0.07em',
                      textTransform:'uppercase',
                      borderBottom:'1px solid var(--border)'
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((s, idx) => {
                  const initials = s.userId?.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
                  const ongoingCount   = s.projects?.filter(p=>p.status==='ongoing').length || 0;
                  const completedCount = s.projects?.filter(p=>p.status==='completed').length || 0;

                  return (
                    <tr key={s._id} style={{ borderBottom:'1px solid rgba(45,63,85,0.5)', transition:'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(59,130,246,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}
                    >

                      {/* # */}
                      <td style={{ padding:'14px 18px', fontSize:'0.82rem', color:'var(--text3)', fontFamily:'var(--mono)', width:40 }}>
                        {String(idx + 1).padStart(2, '0')}
                      </td>

                      {/* Student Name + Avatar */}
                      <td style={{ padding:'14px 18px', minWidth:180 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <div style={{
                            width:38, height:38, borderRadius:'50%',
                            background:'linear-gradient(135deg, var(--accent), #6366f1)',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontWeight:700, fontSize:'0.82rem', color:'#fff', flexShrink:0,
                            boxShadow:'0 2px 8px rgba(59,130,246,0.3)'
                          }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight:700, fontSize:'0.88rem', color:'var(--text)' }}>
                              {s.userId?.name}
                            </div>
                            <div style={{ fontSize:'0.73rem', color:'var(--text3)', marginTop:1 }}>
                              Joined {s.userId?.createdAt ? new Date(s.userId.createdAt).toLocaleDateString('en-IN') : '—'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td style={{ padding:'14px 18px', minWidth:180 }}>
                        <div style={{ fontSize:'0.82rem', color:'var(--text2)', marginBottom:3 }}>
                          📧 {s.userId?.email}
                        </div>
                        <div style={{ fontSize:'0.8rem', color:'var(--text3)' }}>
                          📞 {s.phone || <span style={{fontStyle:'italic'}}>Not provided</span>}
                        </div>
                      </td>

                      {/* College & Course */}
                      <td style={{ padding:'14px 18px', minWidth:180 }}>
                        <div style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--text)', marginBottom:2 }}>
                          {s.college || <span style={{color:'var(--text3)',fontWeight:400,fontStyle:'italic'}}>No college</span>}
                        </div>
                        <div style={{ fontSize:'0.78rem', color:'var(--text3)' }}>
                          {s.course || '—'}
                        </div>
                      </td>

                      {/* Projects */}
                      <td style={{ padding:'14px 18px' }}>
                        {s.projects?.length > 0 ? (
                          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                            {ongoingCount > 0 && (
                              <span style={{
                                display:'inline-flex', alignItems:'center', gap:5,
                                background:'rgba(245,158,11,0.12)', color:'var(--warning)',
                                padding:'3px 10px', borderRadius:99,
                                fontSize:'0.74rem', fontWeight:600, width:'fit-content'
                              }}>
                                ⏳ {ongoingCount} Ongoing
                              </span>
                            )}
                            {completedCount > 0 && (
                              <span style={{
                                display:'inline-flex', alignItems:'center', gap:5,
                                background:'rgba(34,197,94,0.12)', color:'var(--success)',
                                padding:'3px 10px', borderRadius:99,
                                fontSize:'0.74rem', fontWeight:600, width:'fit-content'
                              }}>
                                ✅ {completedCount} Done
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize:'0.8rem', color:'var(--text3)', fontStyle:'italic' }}>No projects</span>
                        )}
                      </td>

                      {/* Resume */}
                      <td style={{ padding:'14px 18px' }}>
                        {s.resumeUrl ? (
                          <a
                            href={resumeHref(s.resumeUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display:'inline-flex', alignItems:'center', gap:6,
                              background:'rgba(34,197,94,0.1)', color:'var(--success)',
                              border:'1px solid rgba(34,197,94,0.25)',
                              borderRadius:8, padding:'5px 12px',
                              fontSize:'0.78rem', fontWeight:600,
                              textDecoration:'none', transition:'all 0.2s'
                            }}
                          >
                            📎 View
                          </a>
                        ) : (
                          <span style={{
                            display:'inline-flex', alignItems:'center', gap:5,
                            background:'rgba(100,116,139,0.1)', color:'var(--text3)',
                            border:'1px solid rgba(100,116,139,0.15)',
                            borderRadius:8, padding:'5px 12px',
                            fontSize:'0.78rem'
                          }}>
                            ✗ None
                          </span>
                        )}
                      </td>

                      {/* Profile Status */}
                      <td style={{ padding:'14px 18px' }}>
                        <span style={{
                          display:'inline-flex', alignItems:'center', gap:5,
                          background: s.profileCompleted ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)',
                          color: s.profileCompleted ? 'var(--success)' : 'var(--text3)',
                          border: `1px solid ${s.profileCompleted ? 'rgba(34,197,94,0.25)' : 'rgba(100,116,139,0.2)'}`,
                          padding:'4px 12px', borderRadius:99,
                          fontSize:'0.75rem', fontWeight:600
                        }}>
                          {s.profileCompleted ? ' Complete' : '○ Incomplete'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding:'14px 18px' }}>
                        <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>

                          {/* View */}
                          <button
                            onClick={() => navigate(`/admin/students/${s._id}`)}
                            style={{
                              display:'flex', alignItems:'center', gap:5,
                              background:'var(--bg3)', border:'1px solid var(--border)',
                              color:'var(--text2)', cursor:'pointer',
                              borderRadius:8, padding:'6px 12px',
                              fontSize:'0.78rem', fontWeight:600, transition:'all 0.2s'
                            }}
                          >
                            👁️ View
                          </button>

                          {/* Email */}
                          <button
                            onClick={() => openEmailModal(s)}
                            style={{
                              display:'flex', alignItems:'center', gap:5,
                              background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.25)',
                              color:'var(--accent)', cursor:'pointer',
                              borderRadius:8, padding:'6px 12px',
                              fontSize:'0.78rem', fontWeight:600, transition:'all 0.2s'
                            }}
                          >
                            ✉️ Email
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => openEdit(s)}
                            style={{
                              display:'flex', alignItems:'center', gap:5,
                              background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.25)',
                              color:'var(--warning)', cursor:'pointer',
                              borderRadius:8, padding:'6px 12px',
                              fontSize:'0.78rem', fontWeight:600, transition:'all 0.2s'
                            }}
                          >
                            ✏️ Edit
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(s._id, s.userId?.name)}
                            style={{
                              display:'flex', alignItems:'center', gap:5,
                              background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)',
                              color:'var(--danger)', cursor:'pointer',
                              borderRadius:8, padding:'6px 12px',
                              fontSize:'0.78rem', fontWeight:600, transition:'all 0.2s'
                            }}
                          >
                            🗑️ Delete
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Edit Student Modal ── */}
      {editStudent && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setEditStudent(null)}>
          <div className="modal" style={{ maxWidth:460 }}>
            <div className="modal-header">
              <h3 className="modal-title">✏️ Edit Student</h3>
              <button className="modal-close" onClick={() => setEditStudent(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{
                display:'flex', alignItems:'center', gap:12,
                background:'var(--bg3)', borderRadius:12,
                padding:'12px 16px', marginBottom:20
              }}>
                <div style={{
                  width:40, height:40, borderRadius:'50%',
                  background:'linear-gradient(135deg, var(--accent), #6366f1)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontWeight:700, color:'#fff', fontSize:'0.88rem', flexShrink:0
                }}>
                  {editStudent.userId?.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight:600 }}>{editStudent.userId?.name}</div>
                  <div style={{ fontSize:'0.78rem', color:'var(--text3)' }}>{editStudent.userId?.email}</div>
                </div>
              </div>
              <form onSubmit={handleSaveEdit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-control" value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})}/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-control" value={editForm.phone} onChange={e=>setEditForm({...editForm,phone:e.target.value})}/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">College</label>
                    <input className="form-control" value={editForm.college} onChange={e=>setEditForm({...editForm,college:e.target.value})}/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Course</label>
                    <input className="form-control" value={editForm.course} onChange={e=>setEditForm({...editForm,course:e.target.value})}/>
                  </div>
                </div>
                <div style={{display:'flex', gap:10, justifyContent:'flex-end', marginTop:8}}>
                  <button type="button" className="btn btn-ghost" onClick={() => setEditStudent(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <><span className="spinner"/> Saving...</> : '💾 Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Single Email Modal ── */}
      {emailModal && emailTarget && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setEmailModal(false)}>
          <div className="modal" style={{ maxWidth:480 }}>
            <div className="modal-header">
              <h3 className="modal-title">✉️ Send Email</h3>
              <button className="modal-close" onClick={() => setEmailModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{
                display:'flex', alignItems:'center', gap:12,
                background:'var(--bg3)', borderRadius:12,
                padding:'12px 16px', marginBottom:18
              }}>
                <div style={{
                  width:40, height:40, borderRadius:'50%',
                  background:'linear-gradient(135deg, var(--accent), #6366f1)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontWeight:700, color:'#fff', fontSize:'0.88rem', flexShrink:0
                }}>
                  {emailTarget.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{emailTarget.name}</div>
                  <div style={{ fontSize:'0.8rem', color:'var(--accent)' }}>📧 {emailTarget.email}</div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Your Message *</label>
                <textarea
                  className="form-control"
                  rows={6}
                  placeholder={`Hi ${emailTarget.name?.split(' ')[0]},\n\nWrite your message here...`}
                  value={emailMsg}
                  onChange={e => setEmailMsg(e.target.value)}
                  autoFocus
                  style={{ resize:'vertical' }}
                />
                <p className="form-hint">{emailMsg.length} characters</p>
              </div>
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => { setEmailModal(false); setEmailMsg(''); }} disabled={sendingEmail}>Cancel</button>
                <button className="btn btn-primary" disabled={sendingEmail || !emailMsg.trim()} onClick={handleSendEmail}>
                  {sendingEmail ? <><span className="spinner"/> Sending...</> : '📤 Send Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Broadcast Modal ── */}
      {broadcastModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setBroadcastModal(false)}>
          <div className="modal" style={{ maxWidth:500 }}>
            <div className="modal-header">
              <h3 className="modal-title">📢 Email All Students</h3>
              <button className="modal-close" onClick={() => setBroadcastModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{
                background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)',
                borderRadius:10, padding:'12px 16px', marginBottom:18,
                fontSize:'0.85rem', color:'var(--text2)', display:'flex', gap:8
              }}>
                <span>📢</span>
                <span>This message will be sent to all <strong style={{color:'var(--accent)'}}>{students.length} active students</strong> at their registered emails.</span>
              </div>
              <div className="form-group">
                <label className="form-label">Broadcast Message *</label>
                <textarea
                  className="form-control"
                  rows={7}
                  placeholder={"Dear Students,\n\nWrite your announcement here..."}
                  value={broadcastMsg}
                  onChange={e => setBroadcastMsg(e.target.value)}
                  autoFocus
                  style={{ resize:'vertical' }}
                />
                <p className="form-hint">{broadcastMsg.length} characters · {students.length} recipients</p>
              </div>
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => { setBroadcastModal(false); setBroadcastMsg(''); }} disabled={broadcasting}>Cancel</button>
                <button className="btn btn-primary" disabled={broadcasting || !broadcastMsg.trim()} onClick={handleBroadcast}>
                  {broadcasting ? <><span className="spinner"/> Sending...</> : `📢 Send to All ${students.length} Students`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}
