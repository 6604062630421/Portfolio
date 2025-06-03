'use client';

import { useEffect, useRef } from 'react';
import Scrollbar from 'smooth-scrollbar';
import type { ReactNode, CSSProperties } from 'react';

type ScrollWrapperProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export default function ScrollWrapper({ children, className = '', style = {} }: ScrollWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<Scrollbar | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // เพิ่ม class เข้าไปที่ container จริง ๆ
    containerRef.current.classList.add('custom-scroll');

    if (!scrollbarRef.current) {
      scrollbarRef.current = Scrollbar.init(containerRef.current, {
        damping: 0.07,
        alwaysShowTracks: true,
      });
    }

    return () => {
      scrollbarRef.current?.destroy();
      scrollbarRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id='scroll-wrapper'
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={style}
    >
      <div className="scroll-content w-full min-h-full">{children}</div>
    </div>
  );
}