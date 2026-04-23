import { useEffect, useRef } from 'react';

export default function HologramBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // 파티클
    const particles: {
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; life: number; maxLife: number;
      color: string;
    }[] = [];

    const colors = ['#4f7dff', '#7c9fff', '#a78bfa', '#60a5fa', '#34d399'];

    const spawnParticle = () => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        life: 0,
        maxLife: Math.random() * 300 + 150,
        color
      });
    };

    for (let i = 0; i < 80; i++) spawnParticle();

    // 홀로그램 스캔 라인들
    const scanLines: { y: number; speed: number; opacity: number; width: number }[] = [];
    for (let i = 0; i < 4; i++) {
      scanLines.push({
        y: Math.random() * window.innerHeight,
        speed: (Math.random() * 0.5 + 0.3) * (Math.random() > 0.5 ? 1 : -1),
        opacity: Math.random() * 0.15 + 0.05,
        width: Math.random() * 3 + 1
      });
    }

    // 지구본 그리기
    const drawGlobe = (cx: number, cy: number, radius: number, t: number) => {
      ctx.save();

      // 외부 글로우
      const outerGlow = ctx.createRadialGradient(cx, cy, radius * 0.6, cx, cy, radius * 1.4);
      outerGlow.addColorStop(0, 'rgba(79, 125, 255, 0.04)');
      outerGlow.addColorStop(1, 'rgba(79, 125, 255, 0)');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.4, 0, Math.PI * 2);
      ctx.fill();

      // 지구본 테두리 글로우
      const rimGlow = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius * 1.05);
      rimGlow.addColorStop(0, 'rgba(79, 125, 255, 0)');
      rimGlow.addColorStop(0.7, 'rgba(79, 125, 255, 0.06)');
      rimGlow.addColorStop(1, 'rgba(124, 159, 255, 0.12)');
      ctx.fillStyle = rimGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.05, 0, Math.PI * 2);
      ctx.fill();

      // 클리핑 원
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      // 위도선 (가로선)
      for (let lat = -80; lat <= 80; lat += 20) {
        const latRad = (lat * Math.PI) / 180;
        const y = cy + radius * Math.sin(latRad);
        const r = radius * Math.cos(latRad);
        if (r <= 0) continue;

        ctx.beginPath();
        ctx.ellipse(cx, y, r, r * 0.15, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(79, 125, 255, ${lat === 0 ? 0.25 : 0.1})`;
        ctx.lineWidth = lat === 0 ? 0.8 : 0.4;
        ctx.stroke();
      }

      // 경도선 (세로선) - 회전
      const numMeridians = 12;
      for (let i = 0; i < numMeridians; i++) {
        const angle = (i / numMeridians) * Math.PI * 2 + t * 0.3;
        const cosA = Math.cos(angle);

        ctx.beginPath();
        for (let lat = -90; lat <= 90; lat += 3) {
          const latRad = (lat * Math.PI) / 180;
          const x = cx + radius * Math.cos(latRad) * cosA;
          const y = cy + radius * Math.sin(latRad);
          if (lat === -90) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        const opacity = (cosA + 1) / 2 * 0.2 + 0.05;
        ctx.strokeStyle = `rgba(79, 125, 255, ${opacity})`;
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }

      // 대륙 윤곽 (단순화된 점들)
      const continentPoints = [
        // 유럽/아시아 느낌
        { lon: 20, lat: 50 }, { lon: 30, lat: 55 }, { lon: 40, lat: 45 },
        { lon: 60, lat: 35 }, { lon: 80, lat: 30 }, { lon: 100, lat: 25 },
        { lon: 120, lat: 35 }, { lon: 130, lat: 40 }, { lon: 140, lat: 35 },
        // 아프리카
        { lon: 20, lat: 10 }, { lon: 30, lat: 0 }, { lon: 25, lat: -20 },
        { lon: 20, lat: -30 },
        // 아메리카
        { lon: -80, lat: 40 }, { lon: -70, lat: 20 }, { lon: -60, lat: 0 },
        { lon: -65, lat: -20 }, { lon: -70, lat: -40 },
      ];

      continentPoints.forEach(p => {
        const lonRad = (p.lon * Math.PI / 180) + t * 0.3;
        const latRad = p.lat * Math.PI / 180;
        const cosLon = Math.cos(lonRad);
        if (cosLon < 0) return;

        const x = cx + radius * Math.cos(latRad) * cosLon;
        const y = cy + radius * Math.sin(latRad);
        const dotOpacity = cosLon * 0.6;

        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124, 159, 255, ${dotOpacity})`;
        ctx.fill();
      });

      ctx.restore();

      // 테두리 원
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(79, 125, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 극지방 포인트
      const topY = cy - radius;
      const botY = cy + radius;
      [topY, botY].forEach(py => {
        ctx.beginPath();
        ctx.arc(cx, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(124, 159, 255, 0.4)';
        ctx.fill();
      });

      // 회전 링
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.2);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.2, radius * 0.3, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(79, 125, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 10]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 두 번째 링
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-t * 0.15 + 1);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.35, radius * 0.2, 0.3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(124, 159, 255, 0.05)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([3, 15]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    };

    // 홀로그램 데이터 라인 (떠다니는 HUD 요소)
    const hudElements: { x: number; y: number; w: number; opacity: number; speed: number }[] = [];
    for (let i = 0; i < 6; i++) {
      hudElements.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        w: Math.random() * 80 + 20,
        opacity: Math.random() * 0.08 + 0.02,
        speed: (Math.random() * 0.3 + 0.1) * (Math.random() > 0.5 ? 1 : -1)
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.008;

      // 배경 그라데이션
      const bg = ctx.createRadialGradient(
        canvas.width * 0.5, canvas.height * 0.5, 0,
        canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.8
      );
      bg.addColorStop(0, 'rgba(15, 22, 41, 0.0)');
      bg.addColorStop(1, 'rgba(10, 15, 30, 0.0)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 지구본 (화면 오른쪽 중간)
      const globeX = canvas.width * 0.78;
      const globeY = canvas.height * 0.5;
      const globeR = Math.min(canvas.width, canvas.height) * 0.28;
      drawGlobe(globeX, globeY, globeR, time);

      // 파티클 업데이트 & 그리기
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        const lifeRatio = p.life / p.maxLife;
        const alpha = lifeRatio < 0.2
          ? lifeRatio / 0.2
          : lifeRatio > 0.8
          ? (1 - lifeRatio) / 0.2
          : 1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(alpha * p.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          spawnParticle();
        }
      }

      // 스캔 라인
      scanLines.forEach(line => {
        line.y += line.speed;
        if (line.y > canvas.height + 50) line.y = -50;
        if (line.y < -50) line.y = canvas.height + 50;

        const grad = ctx.createLinearGradient(0, line.y, canvas.width, line.y);
        grad.addColorStop(0, 'rgba(79, 125, 255, 0)');
        grad.addColorStop(0.3, `rgba(79, 125, 255, ${line.opacity})`);
        grad.addColorStop(0.7, `rgba(124, 159, 255, ${line.opacity})`);
        grad.addColorStop(1, 'rgba(79, 125, 255, 0)');

        ctx.beginPath();
        ctx.moveTo(0, line.y);
        ctx.lineTo(canvas.width, line.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = line.width;
        ctx.stroke();
      });

      // HUD 요소
      hudElements.forEach(el => {
        el.x += el.speed;
        if (el.x > canvas.width + 100) el.x = -100;
        if (el.x < -100) el.x = canvas.width + 100;

        ctx.beginPath();
        ctx.rect(el.x, el.y, el.w, 1);
        ctx.fillStyle = `rgba(79, 125, 255, ${el.opacity})`;
        ctx.fill();

        ctx.beginPath();
        ctx.rect(el.x + el.w * 0.3, el.y + 4, el.w * 0.4, 0.5);
        ctx.fillStyle = `rgba(124, 159, 255, ${el.opacity * 0.6})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.85
      }}
    />
  );
}
