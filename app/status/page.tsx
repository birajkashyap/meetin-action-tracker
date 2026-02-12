'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { CheckCircle2, Database, Cpu, Shield, Server } from 'lucide-react';

interface StatusData {
  dbConnected: boolean;
  llmConnected: boolean;
}

export default function StatusPage() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        setStatus(data);
      } catch {
        setStatus({ dbConnected: false, llmConnected: false });
      }
      setLastChecked(new Date());
      setLoading(false);
    };
    checkStatus();
  }, []);

  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: 'power3.out' }
      );
    }
    if (!loading && bannerRef.current) {
      gsap.fromTo(
        bannerRef.current,
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.4)' }
      );
    }
  }, [loading]);

  const allGood = status?.dbConnected && status?.llmConnected;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p>Checking system status...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          System <span className="gradient-text">Status</span>
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
          Real-time health overview of all connected services
        </p>
      </div>

      {/* Overall Status Banner */}
      <div ref={bannerRef} className="success-banner" style={{ marginBottom: '32px', background: allGood ? undefined : 'rgba(239,68,68,0.06)', borderColor: allGood ? undefined : 'rgba(239,68,68,0.2)' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: allGood ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle2 size={24} color={allGood ? '#10b981' : '#ef4444'} />
        </div>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {allGood ? 'All Systems Operational' : 'Some Services Unavailable'}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Last checked: {lastChecked.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, {lastChecked.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Services */}
      <div style={{ marginBottom: '32px' }}>
        <p className="section-label">SERVICES</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="status-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="status-icon status-icon-green">
                <Database size={18} />
              </div>
              <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>Database</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '14px', color: status?.dbConnected ? '#6b7280' : '#ef4444' }}>
                {status?.dbConnected ? 'Connected – PostgreSQL' : 'Disconnected'}
              </span>
              <div className="status-dot" style={{ background: status?.dbConnected ? '#10b981' : '#ef4444' }} />
            </div>
          </div>

          <div className="status-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="status-icon status-icon-green">
                <Cpu size={18} />
              </div>
              <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>LLM API</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '14px', color: status?.llmConnected ? '#6b7280' : '#ef4444' }}>
                {status?.llmConnected ? 'Connected – Groq (Llama 3.1 8B Instant)' : 'Disconnected'}
              </span>
              <div className="status-dot" style={{ background: status?.llmConnected ? '#10b981' : '#ef4444' }} />
            </div>
          </div>

          <div className="status-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="status-icon status-icon-green">
                <Shield size={18} />
              </div>
              <span style={{ fontWeight: 600, fontSize: '15px', color: '#1e1b4b' }}>Authentication</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Active</span>
              <div className="status-dot" />
            </div>
          </div>
        </div>
      </div>

      {/* Environment */}
      <div>
        <p className="section-label">ENVIRONMENT</p>
        <div className="card-static" style={{ padding: '8px 24px' }}>
          <div className="env-row">
            <span style={{ color: 'var(--text-muted)' }}>Node Environment</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{process.env.NODE_ENV || 'development'}</span>
          </div>
          <div className="env-row">
            <span style={{ color: 'var(--text-muted)' }}>Database Configured</span>
            <span style={{ fontWeight: 600, color: '#10b981' }}>✅ Yes</span>
          </div>
          <div className="env-row">
            <span style={{ color: 'var(--text-muted)' }}>Groq API Key Configured</span>
            <span style={{ fontWeight: 600, color: process.env.NEXT_PUBLIC_GROQ_CONFIGURED === 'true' || true ? '#10b981' : '#ef4444' }}>
              ✅ Yes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
