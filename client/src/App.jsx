import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { Overview } from './pages/Overview';
import { Traces } from './pages/Traces';
import { Agents } from './pages/Agents';
import { Experiments } from './pages/Experiments';
import { Datasets } from './pages/Datasets';
import { Settings } from './pages/Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState('Overview');
  const canvasRef = useRef(null);

  // High-performance canvas mesh physics simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
    }));

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(34, 211, 238, 0.2)';
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.04)';

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#030303] text-slate-200 flex">
      {/* Dynamic Animated Node Canvas Layer */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-40" />

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 pl-64 min-h-screen flex flex-col relative z-10">
        <Topbar />
        <main className="flex-1 p-8 pt-24 overflow-y-auto max-w-[1600px] w-full mx-auto">
          {activeTab === 'Overview' && <Overview />}
          {activeTab === 'Traces' && <Traces />}
          {activeTab === 'Agents' && <Agents />}
          {activeTab === 'Experiments' && <Experiments />}
          {activeTab === 'Datasets' && <Datasets />}
          {activeTab === 'Settings' && <Settings />}
        </main>
      </div>
    </div>
  );
}