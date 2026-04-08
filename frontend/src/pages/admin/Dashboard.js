import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/analytics')
      .then(({ data }) => { if (data.success) setAnalytics(data.analytics); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const roleLabel = { admin: 'Admin', superadmin: 'Super Admin' };

  return (
    <Layout title="Dashboard">
      <h1 className="section-title">Welcome, {user?.name?.split(' ')[0]}!</h1>
      <p className="section-subtitle">
        <span className={`badge ${user?.role === 'superadmin' ? 'badge-blue' : 'badge-green'}`}>
          {roleLabel[user?.role]}
        </span>
        {' '} — InternTrack Management Console
      </p>

      {loading ? (
        <div className="page-loader"><div className="spinner" style={{ width:32,height:32,borderWidth:3 }} /></div>
      ) : analytics ? (
        <>
          <div className="stats-grid">
            <div className="stat-card blue">
              <div className="stat-icon blue">🎓</div>
              <div className="stat-value">{analytics.totalStudents}</div>
              <div className="stat-label">Total Students</div>
            </div>
            <div className="stat-card yellow">
              <div className="stat-icon yellow">⏳</div>
              <div className="stat-value">{analytics.activeProjects}</div>
              <div className="stat-label">Active Projects</div>
            </div>
            <div className="stat-card green">
              <div className="stat-icon green">✅</div>
              <div className="stat-value">{analytics.completedProjects}</div>
              <div className="stat-label">Completed Projects</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background:'rgba(148,163,184,0.1)', color:'var(--text2)' }}>📄</div>
              <div className="stat-value">{analytics.resumesUploaded}</div>
              <div className="stat-label">Resumes Uploaded</div>
            </div>
            {user?.role === 'superadmin' && (
              <div className="stat-card red">
                <div className="stat-icon red">🛡️</div>
                <div className="stat-value">{analytics.totalAdmins}</div>
                <div className="stat-label">Total Admins</div>
              </div>
            )}
            <div className="stat-card">
              <div className="stat-icon" style={{ background:'rgba(59,130,246,0.1)', color:'var(--accent)' }}>📊</div>
              <div className="stat-value">{analytics.profilesCompleted}</div>
              <div className="stat-label">Profiles Completed</div>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            <div className="card">
              <div className="card-title">📊 Project Overview</div>
              {analytics.totalProjects > 0 ? (
                <>
                  <div style={{ marginBottom:16 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.85rem', marginBottom:6 }}>
                      <span style={{ color:'var(--text2)' }}>Ongoing</span>
                      <span style={{ color:'var(--warning)' }}>{analytics.activeProjects} / {analytics.totalProjects}</span>
                    </div>
                    <div style={{ height:8, background:'var(--bg3)', borderRadius:99, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${(analytics.activeProjects/analytics.totalProjects)*100}%`, background:'var(--warning)', borderRadius:99, transition:'width 0.8s ease' }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.85rem', marginBottom:6 }}>
                      <span style={{ color:'var(--text2)' }}>Completed</span>
                      <span style={{ color:'var(--success)' }}>{analytics.completedProjects} / {analytics.totalProjects}</span>
                    </div>
                    <div style={{ height:8, background:'var(--bg3)', borderRadius:99, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${(analytics.completedProjects/analytics.totalProjects)*100}%`, background:'var(--success)', borderRadius:99, transition:'width 0.8s ease' }} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-state" style={{ padding:'20px 0' }}>
                  <p className="empty-state-hint">No projects yet</p>
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-title">🎓 Student Activity</div>
              {[
                { label: 'Total Registered', value: analytics.totalStudents, color: 'var(--accent)' },
                { label: 'Profiles Completed', value: analytics.profilesCompleted, color: 'var(--success)' },
                { label: 'Resumes Uploaded', value: analytics.resumesUploaded, color: 'var(--warning)' },
              ].map(item => (
                <div key={item.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)', fontSize:'0.87rem' }}>
                  <span style={{ color:'var(--text2)' }}>{item.label}</span>
                  <span style={{ fontWeight:700, color: item.color, fontSize:'1.1rem' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="alert alert-error">Failed to load analytics data.</div>
      )}
    </Layout>
  );
}
