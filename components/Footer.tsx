'use client';

import { Github, Linkedin, Globe } from 'lucide-react';

export function Footer() {
  return (
    <footer style={{
      marginTop: 'auto',
      padding: '24px',
      textAlign: 'center',
      borderTop: '1px solid var(--border-light)',
      background: 'var(--bg-nav)', // Use same glass background as nav
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        color: 'var(--text-secondary)',
        fontSize: '14px',
      }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <a
            href="https://birajkashyap.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <Globe size={16} />
            <span>Portfolio</span>
          </a>
          <a
            href="https://www.linkedin.com/in/biraj-kashyap-2194b0226/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#0a66c2')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <Linkedin size={16} />
            <span>LinkedIn</span>
          </a>
          <a
            href="https://github.com/birajkashyap"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <Github size={16} />
            <span>GitHub</span>
          </a>
        </div>
        <div>
          © {new Date().getFullYear()} Biraj Kashyap. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
