'use client';

import React, { useState } from 'react';

interface LandingScreenProps {
  onModeSelect: (mode: 'send' | 'receive') => void;
}

export function LandingScreen({ onModeSelect }: LandingScreenProps) {
  const [hovered, setHovered] = useState<'send' | 'receive' | null>(null);
  const [pressed, setPressed] = useState<'send' | 'receive' | null>(null);

  const handleClick = (mode: 'send' | 'receive') => {
    setPressed(mode);
    setTimeout(() => {
      setPressed(null);
      onModeSelect(mode);
    }, 180);
  };

  return (
    <div style={styles.root}>
      {/* Animated background orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      {/* Logo + tagline */}
      <div style={styles.logoSection}>
        <div style={styles.logoMark}>
          <svg width="54" height="54" viewBox="0 0 54 54" fill="none">
            <circle cx="27" cy="27" r="27" fill="url(#lg1)" />
            <path d="M15 27 L27 13 L39 27" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M27 13 L27 41" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
            <defs>
              <linearGradient id="lg1" x1="0" y1="0" x2="54" y2="54" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FF6B6B"/>
                <stop offset="1" stopColor="#FF9494"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 style={styles.logoText}>AirDart</h1>
        <p style={styles.tagline}>Zero-cloud. Zero-fuss. Pure speed.</p>
      </div>

      {/* Send / Receive Cards */}
      <div style={styles.cardsRow}>
        {/* SEND card */}
        <button
          style={{
            ...styles.card,
            ...styles.cardSend,
            ...(hovered === 'send' ? styles.cardHover : {}),
            ...(pressed === 'send' ? styles.cardPressed : {}),
          }}
          onMouseEnter={() => setHovered('send')}
          onMouseLeave={() => setHovered(null)}
          onClick={() => handleClick('send')}
          aria-label="Send files"
        >
          <div style={{ ...styles.cardIconWrap, background: 'rgba(255,107,107,0.15)' }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M8 40 L40 8" stroke="#FF6B6B" strokeWidth="3" strokeLinecap="round"/>
              <path d="M40 8 L40 26" stroke="#FF6B6B" strokeWidth="3" strokeLinecap="round"/>
              <path d="M40 8 L22 8" stroke="#FF6B6B" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={styles.cardTitle}>Send</span>
          <span style={styles.cardSubtitle}>Share files to nearby device</span>
          <div style={styles.cardArrow}>→</div>
        </button>

        {/* Divider */}
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <div style={styles.dividerLine} />
        </div>

        {/* RECEIVE card */}
        <button
          style={{
            ...styles.card,
            ...styles.cardReceive,
            ...(hovered === 'receive' ? styles.cardHoverReceive : {}),
            ...(pressed === 'receive' ? styles.cardPressed : {}),
          }}
          onMouseEnter={() => setHovered('receive')}
          onMouseLeave={() => setHovered(null)}
          onClick={() => handleClick('receive')}
          aria-label="Receive files"
        >
          <div style={{ ...styles.cardIconWrap, background: 'rgba(108,99,255,0.12)' }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M40 8 L8 40" stroke="#6C63FF" strokeWidth="3" strokeLinecap="round"/>
              <path d="M8 40 L8 22" stroke="#6C63FF" strokeWidth="3" strokeLinecap="round"/>
              <path d="M8 40 L26 40" stroke="#6C63FF" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ ...styles.cardTitle, color: '#6C63FF' }}>Receive</span>
          <span style={styles.cardSubtitle}>Accept files from nearby device</span>
          <div style={{ ...styles.cardArrow, color: '#6C63FF' }}>→</div>
        </button>
      </div>

      {/* Bottom hint */}
      <p style={styles.hint}>
        📡 Works on local Wi-Fi &nbsp;·&nbsp; No internet needed &nbsp;·&nbsp; 100% private
      </p>
    </div>
  );
}

// ─── Inline styles ────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    position: 'relative',
    overflow: 'hidden',
    padding: '24px',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  orb1: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,107,107,0.18) 0%, transparent 70%)',
    top: -80,
    left: -100,
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(108,99,255,0.18) 0%, transparent 70%)',
    bottom: -60,
    right: -80,
    pointerEvents: 'none',
  },
  logoSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    marginBottom: 52,
    zIndex: 1,
  },
  logoMark: {
    filter: 'drop-shadow(0 0 24px rgba(255,107,107,0.5))',
  },
  logoText: {
    fontSize: 38,
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '-1px',
    margin: 0,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    margin: 0,
    letterSpacing: '0.5px',
  },
  cardsRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    zIndex: 1,
    width: '100%',
    maxWidth: 700,
  },
  card: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14,
    padding: '40px 32px',
    borderRadius: 24,
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease',
    position: 'relative',
    outline: 'none',
  },
  cardSend: {
    background: 'rgba(255,107,107,0.08)',
    boxShadow: '0 0 0 1.5px rgba(255,107,107,0.25), 0 20px 60px rgba(255,107,107,0.1)',
  },
  cardReceive: {
    background: 'rgba(108,99,255,0.08)',
    boxShadow: '0 0 0 1.5px rgba(108,99,255,0.25), 0 20px 60px rgba(108,99,255,0.1)',
  },
  cardHover: {
    transform: 'translateY(-6px) scale(1.03)',
    background: 'rgba(255,107,107,0.15)',
    boxShadow: '0 0 0 1.5px rgba(255,107,107,0.5), 0 28px 70px rgba(255,107,107,0.2)',
  },
  cardHoverReceive: {
    transform: 'translateY(-6px) scale(1.03)',
    background: 'rgba(108,99,255,0.15)',
    boxShadow: '0 0 0 1.5px rgba(108,99,255,0.5), 0 28px 70px rgba(108,99,255,0.2)',
  },
  cardPressed: {
    transform: 'scale(0.97)',
  },
  cardIconWrap: {
    width: 88,
    height: 88,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: '#FF6B6B',
    letterSpacing: '-0.5px',
  },
  cardSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    lineHeight: 1.5,
  },
  cardArrow: {
    fontSize: 20,
    color: '#FF6B6B',
    fontWeight: 700,
    opacity: 0.7,
  },
  divider: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    padding: '0 20px',
    flexShrink: 0,
  },
  dividerLine: {
    width: 1,
    height: 60,
    background: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  hint: {
    marginTop: 52,
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
    zIndex: 1,
    textAlign: 'center',
  },
};
