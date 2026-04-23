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

    // ── 파티클 ──────────────────────────────────────────────────
    type Particle = {
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; life: number; maxLife: number;
      color: string;
    };
    const particles: Particle[] = [];
    const colors = ['#4f7dff', '#7c9fff', '#a78bfa', '#60a5fa', '#34d399', '#818cf8'];

    const spawnParticle = () => {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 1.8 + 0.4,
        opacity: Math.random() * 0.45 + 0.08,
        life: 0,
        maxLife: Math.random() * 320 + 160,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    };
    for (let i = 0; i < 100; i++) spawnParticle();

    // ── 스캔 라인 ───────────────────────────────────────────────
    const scanLines = Array.from({ length: 5 }, () => ({
      y: Math.random() * window.innerHeight,
      speed: (Math.random() * 0.6 + 0.2) * (Math.random() > 0.5 ? 1 : -1),
      opacity: Math.random() * 0.12 + 0.04,
      width: Math.random() * 2.5 + 0.5,
    }));

    // ── HUD 데이터 라인 ─────────────────────────────────────────
    const hudLines = Array.from({ length: 8 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      w: Math.random() * 100 + 30,
      opacity: Math.random() * 0.07 + 0.02,
      speed: (Math.random() * 0.25 + 0.08) * (Math.random() > 0.5 ? 1 : -1),
    }));

    // ── 플로팅 원형 노드 ─────────────────────────────────────────
    type Node = {
      x: number; y: number; vx: number; vy: number;
      r: number; opacity: number; pulseOffset: number;
    };
    const nodes: Node[] = Array.from({ length: 14 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 3 + 1.5,
      opacity: Math.random() * 0.35 + 0.1,
      pulseOffset: Math.random() * Math.PI * 2,
    }));

    // 노드 연결선 (가까운 것끼리)
    const drawNodeConnections = () => {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 200;
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.08;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(99, 149, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    // ── 지구본 ──────────────────────────────────────────────────
    const drawGlobe = (cx: number, cy: number, radius: number, t: number) => {
      ctx.save();

      // 외부 글로우 (2단계)
      [1.6, 1.25].forEach((mul, i) => {
        const g = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * mul);
        g.addColorStop(0, `rgba(79, 125, 255, ${i === 0 ? 0.02 : 0.05})`);
        g.addColorStop(1, 'rgba(79, 125, 255, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * mul, 0, Math.PI * 2);
        ctx.fill();
      });

      // 클리핑
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      // 내부 미세 그라데이션 (북반구 강조)
      const bodyGrad = ctx.createRadialGradient(
        cx - radius * 0.3, cy - radius * 0.3, 0,
        cx, cy, radius
      );
      bodyGrad.addColorStop(0, 'rgba(100, 140, 255, 0.07)');
      bodyGrad.addColorStop(1, 'rgba(30, 60, 160, 0.03)');
      ctx.fillStyle = bodyGrad;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      // 위도선
      for (let lat = -80; lat <= 80; lat += 20) {
        const latRad = (lat * Math.PI) / 180;
        const y = cy + radius * Math.sin(latRad);
        const r = radius * Math.cos(latRad);
        if (r <= 0) continue;
        ctx.beginPath();
        ctx.ellipse(cx, y, r, r * 0.13, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(79, 125, 255, ${lat === 0 ? 0.3 : 0.1})`;
        ctx.lineWidth = lat === 0 ? 0.9 : 0.4;
        ctx.stroke();
      }

      // 경도선 (회전)
      const numMeridians = 16;
      for (let i = 0; i < numMeridians; i++) {
        const angle = (i / numMeridians) * Math.PI * 2 + t * 0.25;
        const cosA = Math.cos(angle);
        ctx.beginPath();
        for (let lat = -90; lat <= 90; lat += 3) {
          const latRad = (lat * Math.PI) / 180;
          const x = cx + radius * Math.cos(latRad) * cosA;
          const y = cy + radius * Math.sin(latRad);
          lat === -90 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        const opacity = ((cosA + 1) / 2) * 0.18 + 0.03;
        ctx.strokeStyle = `rgba(79, 125, 255, ${opacity})`;
        ctx.lineWidth = 0.35;
        ctx.stroke();
      }

      // 대륙 점 (더 많은 포인트)
      const continentDots = [
        // 유럽
        {lon:0,lat:52},{lon:10,lat:51},{lon:20,lat:52},{lon:15,lat:48},{lon:25,lat:45},
        // 아시아
        {lon:40,lat:45},{lon:60,lat:38},{lon:75,lat:32},{lon:90,lat:28},{lon:105,lat:22},
        {lon:120,lat:30},{lon:130,lat:35},{lon:140,lat:38},{lon:135,lat:45},{lon:125,lat:50},
        // 아프리카
        {lon:15,lat:15},{lon:25,lat:5},{lon:30,lat:-5},{lon:20,lat:-20},{lon:25,lat:-30},
        {lon:10,lat:5},{lon:35,lat:15},
        // 아메리카
        {lon:-75,lat:45},{lon:-80,lat:38},{lon:-70,lat:22},{lon:-65,lat:5},
        {lon:-60,lat:-10},{lon:-65,lat:-25},{lon:-70,lat:-40},{lon:-55,lat:-15},
        // 오세아니아
        {lon:135,lat:-25},{lon:145,lat:-35},{lon:150,lat:-28},{lon:172,lat:-40},
        // 러시아/중앙아
        {lon:50,lat:58},{lon:70,lat:55},{lon:100,lat:55},{lon:130,lat:55},
      ];

      continentDots.forEach(p => {
        const lonRad = (p.lon * Math.PI / 180) + t * 0.25;
        const latRad = p.lat * Math.PI / 180;
        const cosLon = Math.cos(lonRad);
        if (cosLon < 0) return;
        const x = cx + radius * Math.cos(latRad) * cosLon;
        const y = cy + radius * Math.sin(latRad);
        const dotOpacity = cosLon * 0.55;
        ctx.beginPath();
        ctx.arc(x, y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(140, 175, 255, ${dotOpacity})`;
        ctx.fill();
      });

      ctx.restore();

      // 테두리
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(79, 125, 255, 0.22)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 극지방 포인트
      [cy - radius, cy + radius].forEach(py => {
        ctx.beginPath();
        ctx.arc(cx, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(140, 175, 255, 0.45)';
        ctx.fill();
      });

      // 회전 링 1
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.18);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.22, radius * 0.28, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(79, 125, 255, 0.1)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([4, 10]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 회전 링 2 (기울기 다름)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-t * 0.12 + 0.8);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.38, radius * 0.18, 0.4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(160, 120, 255, 0.06)';
      ctx.lineWidth = 0.6;
      ctx.setLineDash([3, 14]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 회전 링 3 (수직)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.08 + 1.2);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 0.2, radius * 1.15, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(79, 125, 255, 0.05)';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([2, 18]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 지구본 위 글로우 점 (마커)
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.5);
      ctx.beginPath();
      ctx.arc(cx + radius * 0.55, cy - radius * 0.38, 3 + pulse * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(99, 210, 255, ${0.5 + pulse * 0.3})`;
      ctx.fill();

      // 마커 연결선
      ctx.beginPath();
      ctx.moveTo(cx + radius * 0.55, cy - radius * 0.38);
      ctx.lineTo(cx + radius * 0.55 + 20, cy - radius * 0.38 - 30);
      ctx.strokeStyle = `rgba(99, 210, 255, ${0.3 + pulse * 0.2})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    };

    // ── 육각형 그리드 (배경 텍스처) ───────────────────────────────
    const drawHexGrid = () => {
      const hexSize = 40;
      const cols = Math.ceil(canvas.width / (hexSize * 1.5)) + 2;
      const rows = Math.ceil(canvas.height / (hexSize * Math.sqrt(3))) + 2;

      ctx.strokeStyle = 'rgba(79, 125, 255, 0.025)';
      ctx.lineWidth = 0.5;

      for (let col = -1; col < cols; col++) {
        for (let row = -1; row < rows; row++) {
          const xOffset = col % 2 === 0 ? 0 : hexSize * Math.sqrt(3) * 0.5;
          const cx = col * hexSize * 1.5;
          const cy = row * hexSize * Math.sqrt(3) + xOffset;

          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const px = cx + hexSize * Math.cos(angle);
            const py = cy + hexSize * Math.sin(angle);
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
    };

    // ── 코너 HUD 데코 ────────────────────────────────────────────
    const drawCornerHUD = () => {
      const corners = [
        { x: 30, y: 30, rx: 1, ry: 1 },
        { x: canvas.width - 30, y: 30, rx: -1, ry: 1 },
        { x: 30, y: canvas.height - 30, rx: 1, ry: -1 },
        { x: canvas.width - 30, y: canvas.height - 30, rx: -1, ry: -1 },
      ];
      ctx.strokeStyle = 'rgba(79, 125, 255, 0.18)';
      ctx.lineWidth = 1;
      corners.forEach(({ x, y, rx, ry }) => {
        const len = 20;
        ctx.beginPath();
        ctx.moveTo(x + rx * len, y);
        ctx.lineTo(x, y);
        ctx.lineTo(x, y + ry * len);
        ctx.stroke();
      });
    };

    // ── 메인 드로우 루프 ─────────────────────────────────────────
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.007;

      // 육각 그리드
      drawHexGrid();

      // 지구본
      const globeX = canvas.width * 0.78;
      const globeY = canvas.height * 0.5;
      const globeR = Math.min(canvas.width, canvas.height) * 0.27;
      drawGlobe(globeX, globeY, globeR, time);

      // 노드 연결선
      drawNodeConnections();

      // 플로팅 노드
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0) n.x = canvas.width;
        if (n.x > canvas.width) n.x = 0;
        if (n.y < 0) n.y = canvas.height;
        if (n.y > canvas.height) n.y = 0;

        const pulse = 0.5 + 0.5 * Math.sin(time * 1.8 + n.pulseOffset);
        const r = n.r + pulse * 1.2;

        // 후광
        const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 4);
        glow.addColorStop(0, `rgba(79, 125, 255, ${n.opacity * 0.6})`);
        glow.addColorStop(1, 'rgba(79, 125, 255, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(120, 160, 255, ${n.opacity})`;
        ctx.fill();
      });

      // 파티클
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        const lifeRatio = p.life / p.maxLife;
        const fade = lifeRatio < 0.2
          ? lifeRatio / 0.2
          : lifeRatio > 0.8
          ? (1 - lifeRatio) / 0.2
          : 1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(fade * p.opacity * 255).toString(16).padStart(2, '0');
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
        grad.addColorStop(0.25, `rgba(79, 125, 255, ${line.opacity})`);
        grad.addColorStop(0.75, `rgba(140, 175, 255, ${line.opacity})`);
        grad.addColorStop(1, 'rgba(79, 125, 255, 0)');

        ctx.beginPath();
        ctx.moveTo(0, line.y);
        ctx.lineTo(canvas.width, line.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = line.width;
        ctx.stroke();
      });

      // HUD 데이터 라인
      hudLines.forEach(el => {
        el.x += el.speed;
        if (el.x > canvas.width + 120) el.x = -120;
        if (el.x < -120) el.x = canvas.width + 120;

        ctx.fillStyle = `rgba(79, 125, 255, ${el.opacity})`;
        ctx.fillRect(el.x, el.y, el.w, 1);
        ctx.fillStyle = `rgba(140, 175, 255, ${el.opacity * 0.5})`;
        ctx.fillRect(el.x + el.w * 0.25, el.y + 4, el.w * 0.5, 0.5);
        ctx.fillRect(el.x + el.w * 0.5, el.y + 7, el.w * 0.25, 0.5);
      });

      // 코너 HUD
      drawCornerHUD();

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
        opacity: 0.9,
  background: 'none',
  mixBlendMode: 'screen',
      }}
    />
  );
}
