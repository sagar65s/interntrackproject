import React, { useState } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children, title }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:99,backdropFilter:'blur(2px)' }}
        />
      )}
      <div className="main-content">
        <header className="topbar">
          <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
            <button
              onClick={() => setMobileOpen(true)}
              style={{ display:'none', background:'none', border:'none', color:'#E2E8F0', fontSize:'1.3rem', cursor:'pointer' }}
              className="mobile-menu-btn"
            >
              ☰
            </button>
            <span className="topbar-title">{title}</span>
          </div>
        </header>
        <div className="page-wrapper">
          {children}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </div>
  );
}
