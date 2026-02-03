"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavigationBar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  return (
    <nav style={navContainer}>
      <div style={navBrand}>
        <img src="/logo.png" alt="U-FORCE" style={navLogo} />
        <span style={navTitle}>U-FORCE</span>
      </div>

      <div style={navLinks}>
        <Link
          href="/"
          style={navLink(isActive('/'))}
        >
          <span style={navIcon}>🎮</span>
          <span>Simulator</span>
        </Link>

        <Link
          href="/train"
          style={navLink(isActive('/train'))}
        >
          <span style={navIcon}>🎓</span>
          <span>Training</span>
        </Link>
      </div>

      <div style={navStatus}>
        <div style={statusIndicator} />
        <span style={statusText}>SYSTEM ONLINE</span>
      </div>
    </nav>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const navContainer: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: '60px',
  background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)',
  borderBottom: '3px solid #444',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 24px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
  zIndex: 2000,
  fontFamily: "'Share Tech Mono', monospace",
};

const navBrand: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const navLogo: React.CSSProperties = {
  width: '36px',
  height: '36px',
  filter: 'brightness(0) saturate(100%) invert(60%) sepia(98%) saturate(2000%) hue-rotate(0deg) brightness(98%) contrast(101%)',
};

const navTitle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#00ff88',
  letterSpacing: '3px',
  textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
};

const navLinks: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  flex: 1,
  justifyContent: 'center',
};

const navLink = (active: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
  borderRadius: '4px',
  fontSize: '13px',
  fontWeight: 'bold',
  letterSpacing: '1.5px',
  textDecoration: 'none',
  textTransform: 'uppercase',
  background: active
    ? 'linear-gradient(180deg, #00aa00 0%, #008800 100%)'
    : 'linear-gradient(180deg, #333 0%, #222 100%)',
  color: active ? '#000' : '#aaa',
  border: active ? '2px solid #00ff00' : '2px solid #444',
  boxShadow: active
    ? '0 0 15px rgba(0, 255, 0, 0.6), 0 4px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
    : '0 4px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
  cursor: 'pointer',
  transition: 'all 0.2s',
  textShadow: active ? '0 1px 0 rgba(0,0,0,0.5)' : 'none',
});

const navIcon: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: 1,
};

const navStatus: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const statusIndicator: React.CSSProperties = {
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, #00ff00 0%, #00aa00 100%)',
  border: '2px solid #00ff00',
  boxShadow: '0 0 10px #00ff00, 0 0 20px #00ff00',
  animation: 'pulse 2s ease-in-out infinite',
};

const statusText: React.CSSProperties = {
  fontSize: '10px',
  color: '#00ff00',
  letterSpacing: '1.5px',
  fontWeight: 'bold',
  textShadow: '0 0 5px rgba(0, 255, 0, 0.5)',
};
