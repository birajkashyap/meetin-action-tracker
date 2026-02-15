'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from './ThemeProvider';
import gsap from 'gsap';

export function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  // If theme is not yet mounted/determined, default to dark to match initial SSR state or user preference
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!containerRef.current) return;
    const orbs = containerRef.current.querySelectorAll('.bg-orb');
    
    // Kill any existing animations to prevent conflicts when theme switches
    gsap.killTweensOf(orbs);

    orbs.forEach((orb, i) => {
      gsap.to(orb, {
        x: `random(-60, 60)`,
        y: `random(-50, 50)`,
        scale: `random(0.8, 1.2)`,
        duration: 8 + i * 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 1.2,
      });
    });
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        // Light mode: warmer/softer gradient base
        background: isDark
          ? '#050510'
          : 'linear-gradient(135deg, #fdfbf7 0%, #ebf4ff 50%, #f3e8ff 100%)',
        transition: 'background 0.5s ease',
        transform: 'translate3d(0,0,0)', // Hardware acceleration
        backfaceVisibility: 'hidden',
      }}
    >
      {/* Primary purple orb — top right */}
      <div
        className="bg-orb"
        style={{
          position: 'absolute',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(124, 58, 237, 0.3) 0%, rgba(124, 58, 237, 0.06) 45%, transparent 70%)'
            : 'radial-gradient(circle, rgba(167, 139, 250, 0.4) 0%, rgba(167, 139, 250, 0.1) 45%, transparent 70%)',
          top: '-15%',
          right: '-10%',
          filter: isDark ? 'blur(80px)' : 'blur(90px)',
          transition: 'background 0.5s ease, filter 0.5s ease',
          willChange: 'transform', // 
          transform: 'translate3d(0,0,0)',
        }}
      />

      {/* Teal orb — bottom left */}
      <div
        className="bg-orb"
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(45, 212, 191, 0.15) 0%, rgba(45, 212, 191, 0.03) 45%, transparent 70%)'
            : 'radial-gradient(circle, rgba(45, 212, 191, 0.3) 0%, rgba(45, 212, 191, 0.05) 45%, transparent 70%)',
          bottom: '-10%',
          left: '-8%',
          filter: isDark ? 'blur(70px)' : 'blur(80px)',
          transition: 'background 0.5s ease, filter 0.5s ease',
          willChange: 'transform',
          transform: 'translate3d(0,0,0)',
        }}
      />

      {/* Indigo orb — center left */}
      <div
        className="bg-orb"
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.04) 45%, transparent 70%)'
            : 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0.05) 45%, transparent 70%)',
          top: '35%',
          left: '20%',
          filter: isDark ? 'blur(60px)' : 'blur(70px)',
          transition: 'background 0.5s ease, filter 0.5s ease',
          willChange: 'transform',
          transform: 'translate3d(0,0,0)',
        }}
      />

      {/* Small accent orb — mid-right */}
      <div
        className="bg-orb"
        style={{
          position: 'absolute',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(167, 139, 250, 0.18) 0%, transparent 60%)'
            : 'radial-gradient(circle, rgba(251, 146, 60, 0.15) 0%, transparent 60%)', // Orange pop for light mode
          top: '60%',
          right: '15%',
          filter: isDark ? 'blur(50px)' : 'blur(60px)',
          transition: 'background 0.5s ease, filter 0.5s ease',
          willChange: 'transform',
          transform: 'translate3d(0,0,0)',
        }}
      />
    </div>
  );
}
