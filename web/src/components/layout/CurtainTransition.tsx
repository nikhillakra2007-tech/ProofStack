'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface CurtainContextType {
  navigateWithCurtain: (href: string, label?: string, dir?: 'fwd' | 'back') => void;
  isBusy: boolean;
}

const CurtainContext = createContext<CurtainContextType>({
  navigateWithCurtain: () => {},
  isBusy: false,
});

export const useCurtain = () => useContext(CurtainContext);

export function CurtainProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [label, setLabel] = useState('ProofStack');
  const [isBusy, setIsBusy] = useState(false);
  const curtainRef = useRef<HTMLDivElement>(null);

  const navigateWithCurtain = useCallback(
    (href: string, targetLabel = 'ProofStack', dir: 'fwd' | 'back' = 'fwd') => {
      if (isBusy) return;

      if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        router.push(href);
        return;
      }

      setIsBusy(true);
      setLabel(targetLabel);
      setIsOpen(true);

      const curtain = curtainRef.current;
      if (!curtain) {
        router.push(href);
        setIsBusy(false);
        setIsOpen(false);
        return;
      }

      const ease = 'cubic-bezier(.76, 0, .24, 1)';
      const fromY = dir === 'fwd' ? '100%' : '-100%';
      const toY = dir === 'fwd' ? '-100%' : '100%';

      const animIn = curtain.animate(
        [
          { transform: `translateY(${fromY})` },
          { transform: 'translateY(0%)' },
        ],
        { duration: 380, easing: ease, fill: 'forwards' }
      );

      animIn.finished
        .then(() => {
          router.push(href);

          const animOut = curtain.animate(
            [
              { transform: 'translateY(0%)' },
              { transform: `translateY(${toY})` },
            ],
            { duration: 380, easing: ease, fill: 'forwards' }
          );

          animOut.finished
            .then(() => {
              animIn.cancel();
              animOut.cancel();
              setIsOpen(false);
              setIsBusy(false);
            })
            .catch(() => {
              setIsOpen(false);
              setIsBusy(false);
            });
        })
        .catch(() => {
          setIsOpen(false);
          setIsBusy(false);
        });
    },
    [isBusy, router]
  );

  return (
    <CurtainContext.Provider value={{ navigateWithCurtain, isBusy }}>
      {children}
      <div
        ref={curtainRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: isOpen ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #06080F 0%, #0E162B 50%, #171032 100%)',
          color: '#F8FAFC',
          pointerEvents: 'none',
          transform: isOpen ? 'translateY(0%)' : 'translateY(100%)',
          willChange: 'transform',
          boxShadow: '0 0 80px rgba(0, 240, 255, 0.25)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '12px',
              fontFamily: 'var(--f-mono)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#00F0FF',
              marginBottom: '8px',
            }}
          >
            Autonomous Transition
          </div>
          <span
            style={{
              fontFamily: 'var(--f-display)',
              fontWeight: 700,
              fontSize: 'clamp(44px, 8vw, 84px)',
              letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #FFFFFF 20%, #00F0FF 70%, #8B5CF6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              userSelect: 'none',
            }}
          >
            {label}
          </span>
        </div>
      </div>
    </CurtainContext.Provider>
  );
}
