"use client";

import React, { useEffect, useRef } from 'react';

const SplashCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const points = useRef<{ x: number; y: number; lifetime: number; color: string; size: number }[]>([]);
  const mouse = useRef<{ x: number, y: number }>({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth * 2;
      canvas.height = window.innerHeight * 2;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(2, 2);
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    const addPoint = (x: number, y: number) => {
      points.current.push({
        x,
        y,
        lifetime: 0,
        color: `hsl(${180 + Math.random() * 20}, 100%, ${60 + Math.random() * 20}%)`,
        size: Math.random() * 10 + 5,
      });
    };

    const animate = () => {
      addPoint(mouse.current.x, mouse.current.y);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      points.current = points.current.filter(p => p.lifetime < 80);

      points.current.forEach(point => {
        point.lifetime++;
        const opacity = Math.max(0, 1 - point.lifetime / 80);
        const scale = 1 + point.lifetime / 80;

        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = point.color;
        ctx.globalAlpha = opacity;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 pointer-events-none z-[1000]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default SplashCursor;
