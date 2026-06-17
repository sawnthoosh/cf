'use client';
import { useEffect } from 'react';

export default function Cursor() {
  useEffect(() => {
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    if (!cursor || !follower) return;

    let mouseX = 0, mouseY = 0, fX = 0, fY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    };

    const animate = () => {
      fX += (mouseX - fX) * 0.15;
      fY += (mouseY - fY) * 0.15;
      follower.style.transform = `translate3d(${fX}px, ${fY}px, 0)`;
      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove);
    animate();

    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  return (
    <>
      <div id="cursor" style={{ position: 'fixed', top: 0, left: 0, width: '8px', height: '8px', background: 'var(--y)', borderRadius: '50%', pointerEvents: 'none', zIndex: 999999 }} />
      <div id="cursor-follower" style={{ position: 'fixed', top: 0, left: 0, width: '40px', height: '40px', border: '1.5px solid var(--p)', borderRadius: '50%', pointerEvents: 'none', zIndex: 999998, transition: 'transform 0.1s linear' }} />
    </>
  );
}