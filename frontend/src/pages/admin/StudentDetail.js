import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';

export default function AdminStudentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [student, setStudent]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [alert, setAlert]               = useState(null);
  const [editProject, setEditProject]   = useState(null);
  const [projForm, setProjForm]         = useState({});
  const [saving, setSaving]             = useState(false);
  const [emailModal, setEmailModal]     = useState(false);
  const [emailMsg, setEmailMsg]         = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [activeTab, setActiveTab]       = useState('projects');

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 5000);
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
      if (data.success) { setEditProject(null); showAlert('success', 'Project updated successfully!'); fetchStudent(); }
    } catch (e) { showAlert('error', 'Update failed.'); }
    finally { setSaving(false); }
  };

  const handleDeleteStudent = async () => {
    if (!window.confirm(`Permanently delete "${student.userId?.name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`/api/admin/students/${id}`);
      navigate('/admin/students');
    } catch (e) { showAlert('error', 'Delete failed.'); }
  };

  const handleSendEmail = async () => {
    if (!emailMsg.trim()) { showAlert('error', 'Please type a message.'); return; }
    setSendingEmail(true);
    try {
      const { data } = await axios.post('/api/email/send-message', {
        studentUserId: student.userId?._id,
        message: emailMsg.trim(),
      });
      if (data.success) {
        setEmailModal(false); setEmailMsg('');
        showAlert('success', `Email sent to ${student.userId?.email} successfully!`);
      } else { showAlert('error', data.message); }
    } catch (e) { showAlert('error', e.response?.data?.message || 'Failed to send email.'); }
    finally { setSendingEmail(false); }
  };

  const resumeHref = (url) => {
    if (!url) return '#';
    return url.startsWith('http') ? url : `http://localhost:5000${url}`;
  };

  if (loading) return (
    <Layout title="Student Detail">
      <div className="page-loader"><div className="spinner" style={{width:36,height:36,borderWidth:3}}/></div>
    </Layout>
  );

  if (!student) return (
    <Layout title="Student Detail">
      <div className="alert alert-error">⚠️ Student not found.</div>
    </Layout>
  );

  const ongoing   = student.projects?.filter(p => p.status === 'ongoing').length || 0;
  const completed = student.projects?.filter(p => p.status === 'completed').length || 0;
  const initials  = student.userId?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();

  return (
    <Layout title="Student Detail">

      {/* ── Back + Actions Bar ── */}
      <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:28, flexWrap:'wrap'}}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>← Back</button>
        <div style={{flex:1}}/>
        <button
          className="btn btn-sm"
          style={{background:'rgba(59,130,246,0.12)', color:'var(--accent)', border:'1px solid rgba(59,130,246,0.3)'}}
          onClick={() => { setEmailModal(true); setEmailMsg(''); }}
        >
          ✉️ Send Email
        </button>
        {user?.role === 'superadmin' && (
          <button className="btn btn-danger btn-sm" onClick={handleDeleteStudent}>🗑️ Delete Student</button>
        )}
      </div>

      {alert && <div className={`alert alert-${alert.type}`} style={{marginBottom:20}}>{alert.type==='success'?'✅':'⚠️'} {alert.msg}</div>}

      {/* ── Hero Profile Card ── */}
      <div style={{
        background:'var(--bg2)', border:'1px solid var(--border)',
        borderRadius:20, padding:32, marginBottom:20,
        display:'flex', alignItems:'flex-start', gap:28, flexWrap:'wrap'
      }}>
        {/* Avatar */}
        <div style={{
          width:80, height:80, borderRadius:'50%',
          background:'linear-gradient(135deg, var(--accent), #6366f1)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'1.8rem', fontWeight:800, color:'#fff', flexShrink:0,
          boxShadow:'0 8px 24px rgba(59,130,246,0.35)'
        }}>
          {initials}
        </div>

        {/* Name + Email + Status */}
        <div style={{flex:1, minWidth:200}}>
          <div style={{display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:6}}>
            <h1 style={{fontSize:'1.5rem', fontWeight:800, margin:0}}>{student.userId?.name}</h1>
            <span className={`badge ${student.userId?.isActive ? 'badge-green' : 'badge-red'}`}>
              {student.userId?.isActive ? '● Active' : '● Inactive'}
            </span>
          </div>
          <div style={{color:'var(--text3)', fontSize:'0.9rem', marginBottom:16}}>
            📧 {student.userId?.email}
          </div>
          {/* Mini Stats */}
          <div style={{display:'flex', gap:16, flexWrap:'wrap'}}>
            {[
              {icon:'📁', val: student.projects?.length || 0, label:'Projects'},
              {icon:'⏳', val: ongoing,   label:'Ongoing'},
              {icon:'✅', val: completed, label:'Completed'},
              {icon:'📄', val: student.resumeUrl ? 'Yes' : 'No', label:'Resume'},
            ].map(item => (
              <div key={item.label} style={{
                background:'var(--bg3)', borderRadius:12,
                padding:'10px 18px', textAlign:'center', minWidth:70
              }}>
                <div style={{fontSize:'1.1rem'}}>{item.icon}</div>
                <div style={{fontWeight:700, fontSize:'1rem', color:'var(--text)'}}>{item.val}</div>
                <div style={{fontSize:'0.72rem', color:'var(--text3)'}}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Info Grid */}
        <div style={{
          display:'grid', gridTemplateColumns:'1fr 1fr',
          gap:'8px 24px', minWidth:280
        }}>
          {[
            ['📞 Phone',   student.phone,   'Not provided'],
            ['🏫 College', student.college, 'Not provided'],
            ['📚 Course',  student.course,  'Not provided'],
            ['📅 Joined',  student.userId?.createdAt ? new Date(student.userId.createdAt).toLocaleDateString('en-IN') : '—', '—'],
          ].map(([label, val, fallback]) => (
            <div key={label} style={{paddingBottom:8, borderBottom:'1px solid var(--border)'}}>
              <div style={{fontSize:'0.72rem', color:'var(--text3)', marginBottom:2}}>{label}</div>
              <div style={{fontSize:'0.87rem', fontWeight:600, color: val ? 'var(--text)' : 'var(--text3)'}}>
                {val || fallback}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Resume + Tab Row ── */}
      <div style={{display:'grid', gridTemplateColumns:'300px 1fr', gap:20, alignItems:'start'}}>

        {/* Resume Card */}
        <div style={{
          background:'var(--bg2)', border:'1px solid var(--border)',
          borderRadius:16, padding:24
        }}>
          <div style={{fontWeight:700, fontSize:'1rem', marginBottom:16, display:'flex', alignItems:'center', gap:8}}>
            📄 Resume
          </div>

          {student.resumeUrl ? (
            <div>
              {/* File info */}
              <div style={{
                background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)',
                borderRadius:12, padding:'12px 16px', marginBottom:14
              }}>
                <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
                  <span style={{fontSize:'1.2rem'}}>📎</span>
                  <span style={{color:'var(--success)', fontWeight:600, fontSize:'0.85rem'}}>Resume Uploaded</span>
                </div>
                <div style={{
                  fontSize:'0.78rem', color:'var(--text3)',
                  wordBreak:'break-all', paddingLeft:28
                }}>
                  {student.resumeOriginalName || 'Resume file'}
                </div>
              </div>

              {/* View Button */}
              <a
                href={resumeHref(student.resumeUrl)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display:'block', width:'100%',
                  background:'var(--accent)', color:'#fff',
                  borderRadius:10, padding:'11px 0',
                  textAlign:'center', fontWeight:600,
                  fontSize:'0.9rem', textDecoration:'none',
                  transition:'background 0.2s',
                  boxShadow:'0 4px 16px rgba(59,130,246,0.3)'
                }}
                onMouseOver={e => e.target.style.background='var(--accent2)'}
                onMouseOut={e => e.target.style.background='var(--accent)'}
              >
                📂 View / Download Resume
              </a>
            </div>
          ) : (
            <div style={{
              textAlign:'center', padding:'24px 0',
              color:'var(--text3)', fontSize:'0.85rem'
            }}>
              <div style={{fontSize:'2.5rem', marginBottom:8}}>📭</div>
              No resume uploaded yet
            </div>
          )}

          {/* Profile Completeness */}
          <div style={{marginTop:20, paddingTop:20, borderTop:'1px solid var(--border)'}}>
            <div style={{fontSize:'0.8rem', color:'var(--text3)', marginBottom:10, fontWeight:600}}>
              PROFILE COMPLETENESS
            </div>
            {[
              {label:'Name',    done: !!student.userId?.name},
              {label:'Phone',   done: !!student.phone},
              {label:'College', done: !!student.college},
              {label:'Course',  done: !!student.course},
              {label:'Resume',  done: !!student.resumeUrl},
            ].map(item => (
              <div key={item.label} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'6px 0', fontSize:'0.82rem',
                borderBottom:'1px solid rgba(45,63,85,0.4)'
              }}>
                <span style={{color: item.done ? 'var(--text)' : 'var(--text3)'}}>{item.label}</span>
                <span>{item.done ? '✅' : '⭕'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Projects Panel */}
        <div style={{
          background:'var(--bg2)', border:'1px solid var(--border)',
          borderRadius:16, overflow:'hidden'
        }}>
          {/* Tab Header */}
          <div style={{
            padding:'20px 24px 0',
            borderBottom:'1px solid var(--border)',
            display:'flex', alignItems:'center', justifyContent:'space-between'
          }}>
            <div style={{display:'flex', gap:0}}>
              {[
                {key:'projects', label:`📁 Projects (${student.projects?.length||0})`},
              ].map(tab => (
                <button key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    background:'none', border:'none', cursor:'pointer',
                    padding:'10px 16px', fontSize:'0.9rem', fontWeight:600,
                    color: activeTab===tab.key ? 'var(--accent)' : 'var(--text3)',
                    borderBottom: activeTab===tab.key ? '2px solid var(--accent)' : '2px solid transparent',
                    marginBottom:-1, transition:'all 0.2s'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div style={{display:'flex', gap:6}}>
              <span className="badge badge-yellow">{ongoing} ongoing</span>
              <span className="badge badge-green">{completed} completed</span>
            </div>
          </div>

          {/* Projects List */}
          <div style={{padding:20}}>
            {!student.projects?.length ? (
              <div className="empty-state" style={{padding:'40px 0'}}>
                <div className="empty-state-icon">📭</div>
                <p className="empty-state-text">No projects submitted yet</p>
                <p className="empty-state-hint">Student hasn't submitted any projects</p>
              </div>
            ) : (
              <div style={{display:'flex', flexDirection:'column', gap:14}}>
                {student.projects.map((p, idx) => (
                  <div key={p._id} style={{
                    background:'var(--bg3)', borderRadius:14,
                    border:'1px solid var(--border)',
                    overflow:'hidden',
                    transition:'border-color 0.2s'
                  }}>
                    {editProject?._id === p._id ? (
                      /* ── Edit Form ── */
                      <div style={{padding:20}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
                          <span style={{fontWeight:700, color:'var(--accent)'}}>✏️ Editing Project</span>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditProject(null)}>✕ Cancel</button>
                        </div>
                        <form onSubmit={handleSaveProject}>
                          <div className="form-group">
                            <label className="form-label">Project Title</label>
                            <input className="form-control" value={projForm.title}
                              onChange={e => setProjForm({...projForm, title:e.target.value})} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea className="form-control" rows={3} value={projForm.description}
                              onChange={e => setProjForm({...projForm, description:e.target.value})} />
                          </div>
                          <div className="form-grid">
                            <div className="form-group">
                              <label className="form-label">Tech Stack</label>
                              <input className="form-control" placeholder="React, Node.js, ..."
                                value={projForm.techStack}
                                onChange={e => setProjForm({...projForm, techStack:e.target.value})} />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Status</label>
                              <select className="form-control" value={projForm.status}
                                onChange={e => setProjForm({...projForm, status:e.target.value})}>
                                <option value="ongoing">⏳ Ongoing</option>
                                <option value="completed">✅ Completed</option>
                              </select>
                            </div>
                          </div>
                          <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditProject(null)}>Cancel</button>
                            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                              {saving ? <><span className="spinner"/> Saving...</> : '💾 Save Changes'}
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      /* ── Project View ── */
                      <div style={{padding:20}}>
                        {/* Top row */}
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10, gap:10}}>
                          <div style={{display:'flex', alignItems:'center', gap:10, flex:1}}>
                            <div style={{
                              width:32, height:32, borderRadius:8,
                              background: p.status==='completed' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                              display:'flex', alignItems:'center', justifyContent:'center',
                              fontSize:'1rem', flexShrink:0
                            }}>
                              {p.status==='completed' ? '✅' : '⏳'}
                            </div>
                            <div>
                              <div style={{fontWeight:700, fontSize:'0.95rem'}}>{p.title}</div>
                              <div style={{fontSize:'0.74rem', color:'var(--text3)'}}>
                                Submitted: {new Date(p.createdAt).toLocaleDateString('en-IN')}
                              </div>
                            </div>
                          </div>
                          <div style={{display:'flex', gap:6, alignItems:'center', flexShrink:0}}>
                            <span className={`badge ${p.status==='completed'?'badge-green':'badge-yellow'}`}>
                              {p.status==='completed' ? 'Completed' : 'Ongoing'}
                            </span>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleEditProject(p)}
                              style={{padding:'4px 10px'}}
                            >
                              ✏️ Edit
                            </button>
                          </div>
                        </div>

                        {/* Description */}
                        <p style={{
                          fontSize:'0.85rem', color:'var(--text2)',
                          lineHeight:1.65, marginBottom:12,
                          padding:'10px 14px',
                          background:'rgba(15,23,42,0.4)',
                          borderRadius:8
                        }}>
                          {p.description}
                        </p>

                        {/* Tech Stack */}
                        {p.techStack?.length > 0 && (
                          <div>
                            <div style={{fontSize:'0.72rem', color:'var(--text3)', marginBottom:6, fontWeight:600}}>
                              TECHNOLOGIES
                            </div>
                            <div className="tag-list">
                              {p.techStack.map(t => <span key={t} className="tag">{t}</span>)}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Email Modal ── */}
      {emailModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setEmailModal(false)}>
          <div className="modal" style={{maxWidth:500}}>
            <div className="modal-header">
              <h3 className="modal-title">✉️ Send Email</h3>
              <button className="modal-close" onClick={() => setEmailModal(false)}>✕</button>
            </div>
            <div className="modal-body">

              {/* Student info */}
              <div style={{
                display:'flex', alignItems:'center', gap:14,
                background:'var(--bg3)', borderRadius:12,
                padding:'14px 16px', marginBottom:18
              }}>
                <div style={{
                  width:42, height:42, borderRadius:'50%',
                  background:'linear-gradient(135deg, var(--accent), #6366f1)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontWeight:700, color:'#fff', fontSize:'0.9rem', flexShrink:0
                }}>
                  {initials}
                </div>
                <div>
                  <div style={{fontWeight:600, fontSize:'0.9rem'}}>{student.userId?.name}</div>
                  <div style={{fontSize:'0.8rem', color:'var(--accent)'}}>{student.userId?.email}</div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea
                  className="form-control"
                  rows={7}
                  placeholder={`Hi ${student.userId?.name?.split(' ')[0]},\n\nWrite your message here...`}
                  value={emailMsg}
                  onChange={e => setEmailMsg(e.target.value)}
                  autoFocus
                  style={{resize:'vertical'}}
                />
                <p className="form-hint">{emailMsg.length} characters</p>
              </div>

              <div style={{display:'flex', gap:10, justifyContent:'flex-end'}}>
                <button className="btn btn-ghost" onClick={() => { setEmailModal(false); setEmailMsg(''); }} disabled={sendingEmail}>
                  Cancel
                </button>
                <button className="btn btn-primary" disabled={sendingEmail || !emailMsg.trim()} onClick={handleSendEmail}>
                  {sendingEmail ? <><span className="spinner"/> Sending...</> : '📤 Send Email'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}
