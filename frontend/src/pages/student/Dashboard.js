import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, projRes] = await Promise.all([
          axios.get('/api/students/profile'),
          axios.get('/api/students/projects')
        ]);
        if (profileRes.data.success) setProfile(profileRes.data.student);
        if (projRes.data.success) setProjects(projRes.data.projects);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const profileComplete = profile?.profileCompleted;
  const ongoing = projects.filter(p => p.status === 'ongoing').length;
  const completed = projects.filter(p => p.status === 'completed').length;

  if (loading) return <Layout title="Dashboard"><div className="page-loader"><div className="spinner" style={{ width:32,height:32,borderWidth:3 }} /></div></Layout>;

  return (
    <Layout title="Dashboard">
      {!profileComplete && (
        <div className="completion-banner">
          <div className="completion-banner-text">
            <div className="completion-banner-title">⚠️ Complete Your Profile</div>
            Add your phone, college, course and upload your resume to get the most out of InternTrack.
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/student/profile')}>
            Complete Profile →
          </button>
        </div>
      )}

      <h1 className="section-title">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
      <p className="section-subtitle">Here's an overview of your internship progress.</p>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon blue">📁</div>
          <div className="stat-value">{projects.length}</div>
          <div className="stat-label">Total Projects</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-icon yellow">⏳</div>
          <div className="stat-value">{ongoing}</div>
          <div className="stat-label">Ongoing</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green">✅</div>
          <div className="stat-value">{completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card" style={{ borderTop: 'none' }}>
          <div className="stat-icon" style={{ background:'rgba(148,163,184,0.1)', color:'var(--text2)' }}>📄</div>
          <div className="stat-value" style={{ fontSize:'1.1rem' }}>
            {profile?.resumeUrl ? '✅ Uploaded' : '❌ Missing'}
          </div>
          <div className="stat-label">Resume</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Profile Summary */}
        <div className="card">
          <div className="card-title">👤 Profile Summary</div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {[
              ['Name', user?.name],
              ['Email', user?.email],
              ['Phone', profile?.phone || <span style={{color:'var(--text3)'}}>Not set</span>],
              ['College', profile?.college || <span style={{color:'var(--text3)'}}>Not set</span>],
              ['Course', profile?.course || <span style={{color:'var(--text3)'}}>Not set</span>],
            ].map(([label, val]) => (
              <div key={label} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.87rem', paddingBottom:10, borderBottom:'1px solid var(--border)' }}>
                <span style={{ color:'var(--text3)' }}>{label}</span>
                <span style={{ fontWeight:500, maxWidth:'60%', textAlign:'right' }}>{val}</span>
              </div>
            ))}
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop:16, width:'100%' }} onClick={() => navigate('/student/profile')}>
            Edit Profile
          </button>
        </div>

        {/* Recent Projects */}
        <div className="card">
          <div className="card-title">📁 Recent Projects</div>
          {projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <p className="empty-state-text">No projects yet</p>
              <p className="empty-state-hint">Submit your first project to get started</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop:12 }} onClick={() => navigate('/student/projects')}>
                Add Project
              </button>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {projects.slice(0,4).map(p => (
                <div key={p._id} style={{ padding:12, background:'var(--bg3)', borderRadius:'var(--radius)', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div>
                    <div style={{ fontSize:'0.88rem', fontWeight:600 }}>{p.title}</div>
                    <div style={{ fontSize:'0.76rem', color:'var(--text3)', marginTop:3 }}>{p.techStack?.slice(0,3).join(' · ')}</div>
                  </div>
                  <span className={`badge ${p.status === 'completed' ? 'badge-green' : 'badge-yellow'}`}>
                    {p.status}
                  </span>
                </div>
              ))}
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/student/projects')}>
                View All →
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
