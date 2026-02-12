'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Clock, Activity, Sparkles, Sun, Moon, BarChart3, Search } from 'lucide-react';
import gsap from 'gsap';
import { useTheme } from './ThemeProvider';

const navItems = [
  { href: '/', label: 'Home', icon: FileText },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/history', label: 'History', icon: Clock },
  { href: '/stats', label: 'Stats', icon: BarChart3 },
  { href: '/status', label: 'Status', icon: Activity },
];

export function Navigation() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  
  const dockRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  // 1. DOCK ENTRANCE ANIMATION
  useEffect(() => {
    if (!dockRef.current) return;
    gsap.set(dockRef.current, { y: -50, opacity: 0 });
    gsap.to(dockRef.current, {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: 'power3.out',
    });
  }, []);

  // 2. HANDLE PATH CHANGES (Expand active, collapse others)
  useEffect(() => {
    navItems.forEach(({ href, label }) => {
      const el = linkRefs.current[label];
      if (el && pathname !== href) {
        // Collapse non-active items
        gsap.to(el, { width: '40px', duration: 0.3, ease: 'power2.out' });
        gsap.to(el.querySelector('.nav-label'), { opacity: 0, duration: 0.2 });
      }
    });

    // Expand active item
    navItems.forEach(({ href, label }) => {
      if (pathname === href) {
        const activeLinkEl = linkRefs.current[label];
        if (activeLinkEl) {
          const textWidth = activeLinkEl.querySelector('.nav-label')?.scrollWidth || 0;
          gsap.to(activeLinkEl, {
            width: `${40 + textWidth + 12}px`, // 40px icon + text + padding
            duration: 0.4,
            ease: 'power2.out',
          });
          gsap.to(activeLinkEl.querySelector('.nav-label'), { opacity: 1, duration: 0.3, delay: 0.1 });
        }
      }
    });
  }, [pathname]);

  // 3. HOVER HANDLERS
  const handleMouseEnter = useCallback((label: string) => {
    const item = navItems.find((i) => i.label === label);
    const el = linkRefs.current[label];
    if (!el || pathname === item?.href) return; // Don't animate if already active

    const textWidth = el.querySelector('.nav-label')?.scrollWidth || 0;

    gsap.to(el, {
      width: `${40 + textWidth + 12}px`,
      duration: 0.3,
      ease: 'power2.out',
    });
    gsap.to(el.querySelector('.nav-label'), {
      opacity: 1,
      duration: 0.2,
    });
  }, [pathname]);

  const handleMouseLeave = useCallback((label: string) => {
    const item = navItems.find((i) => i.label === label);
    const el = linkRefs.current[label];
    if (!el || pathname === item?.href) return; // Don't collapse if active

    gsap.to(el, {
      width: '40px',
      duration: 0.3,
      ease: 'power2.out',
    });
    gsap.to(el.querySelector('.nav-label'), {
      opacity: 0,
      duration: 0.2,
    });
  }, [pathname]);

  return (
    <div
      ref={dockRef}
      style={{
        position: 'fixed',
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
        width: 'fit-content',
        maxWidth: '95%',
      }}
    >
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '100px',
          background: 'var(--bg-nav)', // High opacity from previous step
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        }}
      >
        {/* Logo Icon (Static) */}
        <Link href="/" style={{ marginRight: '8px', display: 'flex' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #2dd4bf)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(124, 58, 237, 0.3)',
            flexShrink: 0,
          }}>
            <Sparkles size={18} color="white" />
          </div>
        </Link>
        <div style={{ width: '1px', height: '24px', background: 'var(--border-default)', opacity: 0.5, marginRight: '4px' }} />

        {/* Floating Icons */}
        <ul style={{ display: 'flex', alignItems: 'center', gap: '6px', listStyle: 'none', padding: 0, margin: 0 }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;

            return (
              <li
                key={href}
                onMouseEnter={() => handleMouseEnter(label)}
                onMouseLeave={() => handleMouseLeave(label)}
              >
                <Link
                  href={href}
                  ref={(el) => { linkRefs.current[label] = el; }}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    height: '40px',
                    width: isActive ? 'auto' : '40px', // Initial width handled by GSAP mostly
                    padding: '0 10px', // fixed padding for icon center
                    borderRadius: '100px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textDecoration: 'none',
                    background: isActive ? 'var(--brand-100)' : 'transparent',
                    color: isActive ? 'var(--text-brand)' : 'var(--text-secondary)',
                    border: isActive ? '1px solid var(--brand-200)' : '1px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  <Icon
                    size={20}
                    style={{
                      minWidth: '20px', // Ensure icon doesn't shrink
                      opacity: isActive ? 1 : 0.7,
                      transition: 'opacity 0.2s',
                    }}
                  />
                  
                  <span
                    className="nav-label"
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      marginLeft: '8px',
                      opacity: isActive ? 1 : 0, // Initial state
                      color: 'var(--text-primary)',
                    }}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-default)', opacity: 0.5, margin: '0 4px' }} />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '1px solid var(--border-default)',
            background: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </nav>
    </div>
  );
}
