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

let fixedHeight = window.innerHeight;
const resize = () => {
  canvas.width = window.innerWidth;
  canvas.height = fixedHeight; // 높이는 처음 값 고정
};
    
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#88aaff', '#aac4ff', '#c4b5fd', '#93c5fd', '#6ee7b7', '#ffffff', '#e0eaff'];

    const toHex = (opacity: number) =>
      Math.max(0, Math.min(255, Math.floor(opacity * 255))).toString(16).padStart(2, '0');

    // 파티클
    const particles: {
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; life: number; maxLife: number;
      color: string; glow: boolean;
    }[] = [];

    const spawnParticle = () => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const glow = Math.random() > 0.6;
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: glow ? Math.random() * 3 + 1.5 : Math.random() * 1.5 + 0.5,
        opacity: glow ? Math.random() * 0.6 + 0.4 : Math.random() * 0.4 + 0.2,
        life: 0,
        maxLife: Math.random() * 300 + 150,
        color,
        glow,
      });
    };

    for (let i = 0; i < 100; i++) spawnParticle();

    // 스캔 라인
    const scanLines: { y: number; speed: number; opacity: number; width: number }[] = [];
    for (let i = 0; i < 5; i++) {
      scanLines.push({
        y: Math.random() * window.innerHeight,
        speed: (Math.random() * 0.6 + 0.4) * (Math.random() > 0.5 ? 1 : -1),
        opacity: Math.random() * 0.45 + 0.25,
        width: Math.random() * 2 + 1,
      });
    }

    // 흐르는 연결선 — 시작/끝이 동일하지 않도록 보장
    const flowLines: {
      x: number; y: number; angle: number; length: number;
      speed: number; opacity: number; progress: number;
    }[] = [];

    const makeFlowLine = () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      angle: Math.random() * Math.PI * 2,
      length: Math.random() * 120 + 80, // 최소 80 보장
      speed: Math.random() * 0.008 + 0.004,
      opacity: Math.random() * 0.5 + 0.3,
      progress: Math.random(),
    });

    for (let i = 0; i < 12; i++) flowLines.push(makeFlowLine());

    // HUD 요소
    const hudElements: { x: number; y: number; w: number; opacity: number; speed: number }[] = [];
    for (let i = 0; i < 8; i++) {
      hudElements.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        w: Math.random() * 100 + 30,
        opacity: Math.random() * 0.25 + 0.12,
        speed: (Math.random() * 0.4 + 0.15) * (Math.random() > 0.5 ? 1 : -1),
      });
    }

    // 지구본
    const drawGlobe = (cx: number, cy: number, radius: number, t: number) => {
      ctx.save();

      // 외부 글로우
      const outerGlow = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * 1.6);
      outerGlow.addColorStop(0, 'rgba(100, 150, 255, 0.18)');
      outerGlow.addColorStop(0.5, 'rgba(80, 120, 255, 0.08)');
      outerGlow.addColorStop(1, 'rgba(80, 120, 255, 0)');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // 림 글로우
      const rimGlow = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.08);
      rimGlow.addColorStop(0, 'rgba(100, 150, 255, 0)');
      rimGlow.addColorStop(0.7, 'rgba(100, 150, 255, 0.2)');
      rimGlow.addColorStop(1, 'rgba(180, 210, 255, 0.4)');
      ctx.fillStyle = rimGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.08, 0, Math.PI * 2);
      ctx.fill();

      // 클리핑
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      // 위도선
      for (let lat = -80; lat <= 80; lat += 20) {
        const latRad = (lat * Math.PI) / 180;
        const y = cy + radius * Math.sin(latRad);
        const r = radius * Math.cos(latRad);
        if (r <= 0) continue;
        ctx.beginPath();
        ctx.ellipse(cx, y, r, r * 0.15, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(140, 190, 255, ${lat === 0 ? 0.75 : 0.4})`;
        ctx.lineWidth = lat === 0 ? 1.5 : 0.8;
        ctx.stroke();
      }

      // 경도선
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
        const opacity = (cosA + 1) / 2 * 0.55 + 0.2;
        ctx.strokeStyle = `rgba(140, 190, 255, ${opacity})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // 대륙 점
      const continentPoints = [
        { lon: 20, lat: 50 }, { lon: 30, lat: 55 }, { lon: 40, lat: 45 },
        { lon: 60, lat: 35 }, { lon: 80, lat: 30 }, { lon: 100, lat: 25 },
        { lon: 120, lat: 35 }, { lon: 130, lat: 40 }, { lon: 140, lat: 35 },
        { lon: 20, lat: 10 }, { lon: 30, lat: 0 }, { lon: 25, lat: -20 },
        { lon: 20, lat: -30 },
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
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 230, 255, ${cosLon * 0.9})`;
        ctx.fill();
      });

      ctx.restore();

      // 테두리
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(140, 190, 255, 0.55)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 극지방 포인트
      [cy - radius, cy + radius].forEach(py => {
        ctx.beginPath();
        ctx.arc(cx, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200, 230, 255, 0.8)';
        ctx.fill();
      });

      // 회전 링 1
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.2);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.25, radius * 0.3, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(120, 170, 255, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([6, 10]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 회전 링 2
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-t * 0.15 + 1);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.4, radius * 0.22, 0.3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(160, 200, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 14]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.008;

      // 왼쪽 상단 어둡게
      const dark1 = ctx.createRadialGradient(
        0, 0, 0,
        canvas.width * 0.3, canvas.height * 0.3, canvas.width * 0.6
      );
      dark1.addColorStop(0, 'rgba(3, 6, 18, 0.72)');
      dark1.addColorStop(1, 'rgba(3, 6, 18, 0)');
      ctx.fillStyle = dark1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 하단 어둡게
      const dark2 = ctx.createRadialGradient(
        canvas.width * 0.2, canvas.height, 0,
        canvas.width * 0.2, canvas.height, canvas.width * 0.5
      );
      dark2.addColorStop(0, 'rgba(3, 6, 18, 0.5)');
      dark2.addColorStop(1, 'rgba(3, 6, 18, 0)');
      ctx.fillStyle = dark2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 중앙~오른쪽 밝게
      const light1 = ctx.createRadialGradient(
        canvas.width * 0.58, canvas.height * 0.5, canvas.width * 0.05,
        canvas.width * 0.58, canvas.height * 0.5, canvas.width * 0.5
      );
      light1.addColorStop(0, 'rgba(140, 190, 255, 0.38)');
      light1.addColorStop(0.4, 'rgba(100, 150, 230, 0.16)');
      light1.addColorStop(1, 'rgba(80, 120, 200, 0)');
      ctx.fillStyle = light1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 오른쪽 상단 보조 빛
      const light2 = ctx.createRadialGradient(
        canvas.width * 0.88, canvas.height * 0.18, canvas.width * 0.02,
        canvas.width * 0.88, canvas.height * 0.18, canvas.width * 0.32
      );
      light2.addColorStop(0, 'rgba(160, 200, 255, 0.22)');
      light2.addColorStop(1, 'rgba(160, 200, 255, 0)');
      ctx.fillStyle = light2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 지구본
      const globeX = canvas.width * 0.78;
const globeY = fixedHeight * 0.5;
const globeR = Math.min(canvas.width, fixedHeight) * 0.28;
      drawGlobe(globeX, globeY, globeR, time);

      // 흐르는 연결선
      flowLines.forEach(line => {
        line.progress += line.speed;
        if (line.progress > 1) {
          Object.assign(line, makeFlowLine());
          line.progress = 0;
        }

        const endX = line.x + Math.cos(line.angle) * line.length;
        const endY = line.y + Math.sin(line.angle) * line.length;
        const curX = line.x + (endX - line.x) * line.progress;
        const curY = line.y + (endY - line.y) * line.progress;

        // 시작~현재 거리가 충분할 때만 그라데이션 선 그리기
        const dist = Math.hypot(curX - line.x, curY - line.y);
        if (dist > 2) {
          const grad = ctx.createLinearGradient(line.x, line.y, curX, curY);
          grad.addColorStop(0, 'rgba(160, 200, 255, 0)');
          grad.addColorStop(0.6, `rgba(180, 215, 255, ${line.opacity * 0.5})`);
          grad.addColorStop(1, `rgba(220, 240, 255, ${line.opacity})`);
          ctx.beginPath();
          ctx.moveTo(line.x, line.y);
          ctx.lineTo(curX, curY);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        // 끝점 빛나는 점
        ctx.beginPath();
        ctx.arc(curX, curY, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 240, 255, ${line.opacity * 0.9})`;
        ctx.fill();
      });

      // 파티클
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

        const finalOpacity = alpha * p.opacity;

        if (p.glow) {
          const glowR = p.size * 4;
          const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
          glowGrad.addColorStop(0, p.color + toHex(finalOpacity));
          glowGrad.addColorStop(1, p.color + '00');
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = glowGrad;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + toHex(finalOpacity);
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

        const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
        grad.addColorStop(0, 'rgba(140, 190, 255, 0)');
        grad.addColorStop(0.2, `rgba(160, 200, 255, ${line.opacity})`);
        grad.addColorStop(0.5, `rgba(200, 225, 255, ${Math.min(1, line.opacity * 1.3)})`);
        grad.addColorStop(0.8, `rgba(160, 200, 255, ${line.opacity})`);
        grad.addColorStop(1, 'rgba(140, 190, 255, 0)');

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

        ctx.fillStyle = `rgba(160, 200, 255, ${el.opacity})`;
        ctx.fillRect(el.x, el.y, el.w, 1.5);

        ctx.fillStyle = `rgba(200, 225, 255, ${el.opacity * 0.7})`;
        ctx.fillRect(el.x + el.w * 0.3, el.y + 5, el.w * 0.4, 0.8);
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
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 1,
      }}
    />
  );
}
