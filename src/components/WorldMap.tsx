// WorldMap.tsx - 최적화 버전
import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { CountryState, Player } from '../types';
import { BUILDING_TIERS, CLUB_IMAGES } from '../constants';
import { Globe as GlobeIcon, ZoomIn, ArrowLeft, RefreshCcw } from 'lucide-react';

interface WorldMapProps {
  countries: Record<string, CountryState>;
  players: Player[];
  onCountryClick: (countryId: string, countryName: string) => void;
}

type ViewMode = '3d' | '2d';
type Continent = 'world' | 'africa' | 'asia' | 'europe' | 'northAmerica' | 'southAmerica' | 'oceania';

const CONTINENTS: Record<Continent, { name: string; center: [number, number]; scale: number }> = {
  world:        { name: '전체 지도',  center: [0, 0],      scale: 1   },
  africa:       { name: '아프리카',   center: [20, -5],    scale: 3.2 },
  asia:         { name: '아시아',     center: [95, 35],    scale: 2.8 },
  europe:       { name: '유럽',       center: [15, 54],    scale: 6.5 },
  northAmerica: { name: '북미',       center: [-100, 45],  scale: 2.8 },
  southAmerica: { name: '남미',       center: [-58, -20],  scale: 3.2 },
  oceania:      { name: '오세아니아', center: [148, -25],  scale: 5.0 },
};

const BUILDING_IMAGES: Record<number, string> = {
  1: '/buildings/housechurch.png',
  2: '/buildings/branch.png',
  3: '/buildings/church.png',
};

export default function WorldMap({ countries, players, onCountryClick }: WorldMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [topology, setTopology] = useState<any>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('3d');
  const [selectedContinent, setSelectedContinent] = useState<Continent>('world');

  // ✅ 핵심: rotation/zoom을 ref로 관리 → state 변경 없이 rAF 루프에서만 사용
  const rotationRef = useRef<[number, number, number]>([-10, -20, 0]);
  const zoomLevelRef = useRef(1);
  const viewModeRef = useRef<ViewMode>('3d');
  const rafRef = useRef<number>(0);
  const isDirtyRef = useRef(false); // 회전값 바뀌었을 때만 재그림

  // 2D 모드용
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // UI 표시용 (리셋 버튼 등에만 필요)
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(r => r.json())
      .then(setTopology);
  }, []);

  // ✅ 3D 회전 애니메이션 루프 (SVG 재생성 없이 path d만 업데이트)
  const startRenderLoop = useCallback((
    svgEl: SVGSVGElement,
    projection: d3.GeoOrthographicProjection,
    path: d3.GeoPath,
    features: any[]
  ) => {
    const svg = d3.select(svgEl);

    const loop = () => {
      if (isDirtyRef.current) {
        projection.rotate(rotationRef.current).scale(
          Math.min(svgEl.clientWidth, svgEl.clientHeight) / 2.2 * zoomLevelRef.current
        );
        // 기존 path 요소의 d 속성만 업데이트 (DOM 재생성 없음)
        svg.selectAll<SVGPathElement, any>('path.country-top')
          .attr('d', path as any);
        svg.select<SVGPathElement>('path.sphere')
          .attr('d', path({ type: 'Sphere' } as any) || '');
        svg.select('circle.globe-bg')
          .attr('r', Math.min(svgEl.clientWidth, svgEl.clientHeight) / 2.2 * zoomLevelRef.current);
        isDirtyRef.current = false;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  // ✅ SVG는 topology/viewMode/countries/players 바뀔 때만 재생성
  useEffect(() => {
    if (!topology || !svgRef.current) return;
    cancelAnimationFrame(rafRef.current);

    const svg = d3.select(svgRef.current);
    const rect = svgRef.current.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight * 0.6;
    const minSize = Math.min(width, height);

    svg.selectAll('*').remove();

    const features = (topojson.feature(topology, topology.objects.countries) as any).features
      .filter((f: any) => f.id !== '010' && f.properties?.name !== 'Antarctica');

    if (viewModeRef.current === '3d') {
      // --- 3D 모드 ---
      const projection = d3.geoOrthographic()
        .scale(minSize / 2.2 * zoomLevelRef.current)
        .translate([width / 2, height / 2])
        .rotate(rotationRef.current);
      const path = d3.geoPath().projection(projection);

      // defs
      const defs = svg.append('defs');
      const grad = defs.append('radialGradient').attr('id', 'globe-gradient');
      grad.append('stop').attr('offset', '70%').attr('stop-color', '#f1f5f9').attr('stop-opacity', 0);
      grad.append('stop').attr('offset', '100%').attr('stop-color', '#3b82f6').attr('stop-opacity', 0.2);

      const gMain = svg.append('g').attr('class', 'main-group');

      gMain.append('circle')
        .attr('class', 'globe-bg')
        .attr('cx', width / 2).attr('cy', height / 2)
        .attr('r', minSize / 2.2 * zoomLevelRef.current)
        .attr('fill', 'url(#globe-gradient)').attr('opacity', 0.4);

      gMain.append('path')
        .datum({ type: 'Sphere' })
        .attr('class', 'sphere')
        .attr('d', path as any)
        .attr('fill', '#f8fafc').attr('stroke', '#e2e8f0').attr('stroke-width', 1);

      gMain.selectAll<SVGPathElement, any>('path.country-top')
        .data(features).enter().append('path')
        .attr('class', 'country-top cursor-pointer')
        .attr('d', path as any)
        .attr('stroke', '#94a3b8').attr('stroke-width', 0.5)
        .attr('vector-effect', 'non-scaling-stroke')
        .attr('fill', (d: any) => {
          const state = countries[d.properties.name];
          return state?.ownerId ? players.find(p => p.id === state.ownerId)?.color || '#CBD5E1' : '#CBD5E1';
        })
        .on('click', (_e: any, d: any) => onCountryClick(d.properties.name, d.properties.name));

      // ✅ rAF 루프 시작 (드래그 중에도 SVG 재생성 없이 부드럽게)
      startRenderLoop(svgRef.current, projection as d3.GeoOrthographicProjection, path, features);

      // ✅ Pinch-to-zoom (2 fingers)
      let lastDist = 0;
      const onTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 2) {
          lastDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
        }
      };
      const onTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        if (e.touches.length === 2) {
          const dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          if (lastDist > 0) {
            zoomLevelRef.current = Math.max(0.5, Math.min(8, zoomLevelRef.current * (dist / lastDist)));
          }
          lastDist = dist;
          isDirtyRef.current = true;
          return;
        }
        if (e.touches.length !== 1) return;
        // 단일 터치 드래그는 아래 drag에서 처리
      };
      svgRef.current.addEventListener('touchstart', onTouchStart, { passive: true });
      svgRef.current.addEventListener('touchmove', onTouchMove, { passive: false });

    } else {
      // --- 2D 모드 ---
      const projection = d3.geoMercator()
        .scale(width / 6.5)
        .translate([width / 2, height / 1.8]);
      const path = d3.geoPath().projection(projection);

      const gMain = svg.append('g').attr('class', 'main-group');

      // perspective 컨테이너
      const gP = gMain.append('g')
        .attr('transform', 'perspective(1200px) rotateX(45deg)');

      // 그리드
      const gridSize = 100, gBound = 4000;
      const gridG = gP.append('g');
      for (let x = -gBound; x < gBound; x += gridSize)
        gridG.append('line').attr('x1', x).attr('y1', -gBound).attr('x2', x).attr('y2', gBound).attr('stroke', '#e2e8f0').attr('stroke-width', 0.5);
      for (let y = -gBound; y < gBound; y += gridSize)
        gridG.append('line').attr('x1', -gBound).attr('y1', y).attr('x2', gBound).attr('y2', y).attr('stroke', '#e2e8f0').attr('stroke-width', 0.5);

      const unowned = features.filter((f: any) => {
        const s = countries[f.properties.name];
        return !(s?.ownerId && players.some(p => p.id === s.ownerId));
      });
      const owned = features.filter((f: any) => {
        const s = countries[f.properties.name];
        return !!(s?.ownerId && players.some(p => p.id === s.ownerId));
      });

      const gC = gP.append('g').attr('class', 'countries');
      const tooltip = d3.select('body').append('div')
        .attr('class', 'absolute hidden bg-white/95 backdrop-blur-sm text-[#1E293B] p-3 rounded-2xl shadow-xl text-[11px] pointer-events-none z-50 border border-slate-200 font-bold min-w-[120px]');

      [...unowned, ...owned].forEach((feature: any) => {
        const name = feature.properties.name;
        const state = countries[name];
        const isOwned = !!(state?.ownerId && players.some(p => p.id === state.ownerId));
        const targetDepth = isOwned ? 2 + (state.buildings || 0) * 2 : 0;
        const countryG = gC.append('g').attr('class', 'country-stack');
        const owner = isOwned ? players.find(p => p.id === state!.ownerId) : null;

        if (isOwned && owner) {
          for (let i = 0; i <= 8; i++) {
            countryG.append('path').datum(feature).attr('d', path as any)
              .attr('transform', `translate(0, ${(i / 8) * targetDepth})`)
              .attr('fill', d3.color(owner.color || '#cbd5e1')?.darker(0.05 + 0.8 * (i / 8))?.toString() || owner.color || '#cbd5e1')
              .attr('class', 'pointer-events-none');
          }
        }

        countryG.append('path').datum(feature).attr('d', path as any)
          .attr('class', 'country-top cursor-pointer')
          .attr('fill', isOwned ? owner?.color || '#e2e8f0' : '#e2e8f0')
          .attr('stroke', '#94a3b8').attr('stroke-width', '0.5').attr('vector-effect', 'non-scaling-stroke')
          .on('click', (_e: any, d: any) => onCountryClick(d.properties.name, d.properties.name))
          .on('mouseover', function(event: any, d: any) {
            const s = countries[d.properties.name];
            const p = s?.ownerId ? players.find(pl => pl.id === s.ownerId) : null;
            tooltip.classed('hidden', false).html(`
              <div class="mb-2 border-b border-slate-100 pb-2 text-blue-600 uppercase tracking-widest text-[9px] font-black">${d.properties.name}</div>
              <div class="space-y-1">
                <div class="flex justify-between gap-4"><span>소유자:</span><span class="${p ? 'text-blue-600' : 'text-slate-400'}">${p?.name || '공석'}</span></div>
                <div class="flex justify-between gap-4"><span>센터 수준:</span><span class="text-amber-600">${s?.buildings ? BUILDING_TIERS[(s.buildings) - 1]?.name : '없음'}</span></div>
              </div>
            `);
            d3.select(this).attr('fill-opacity', 0.8).attr('stroke', '#3b82f6').attr('stroke-width', '1.5');
          })
          .on('mousemove', (event: any) => tooltip.style('left', (event.pageX + 15) + 'px').style('top', (event.pageY - 15) + 'px'))
          .on('mouseout', function() {
            tooltip.classed('hidden', true);
            d3.select(this).attr('fill-opacity', 1).attr('stroke', '#94a3b8').attr('stroke-width', '0.5');
          });

        if (isOwned && owner) {
          const centroid = path.centroid(feature);
          if (centroid && !isNaN(centroid[0]) && !isNaN(centroid[1])) {
            const bounds = path.bounds(feature);
            const area = (bounds[1][0] - bounds[0][0]) * (bounds[1][1] - bounds[0][1]);
            const imgSize = Math.max(6, Math.min(Math.sqrt(area) * 0.5, 50));
            const imgSrc = CLUB_IMAGES[owner.name] || owner.characterUrl || '';
            const hasBuilding = (state?.buildings || 0) > 0;
            const buildingImgSrc = BUILDING_IMAGES[state!.buildings] || '/buildings/building1.png';

            if (hasBuilding) {
              const offset = imgSize * 0.25;
              countryG.append('image').attr('href', buildingImgSrc)
                .attr('x', centroid[0] - imgSize / 2).attr('y', centroid[1] - imgSize / 2)
                .attr('width', imgSize).attr('height', imgSize)
                .attr('class', 'pointer-events-none').raise();
              const charSize = imgSize * 0.65;
              countryG.append('image').attr('href', imgSrc)
                .attr('x', centroid[0] - offset - charSize / 2).attr('y', centroid[1] - imgSize * 0.1)
                .attr('width', charSize).attr('height', charSize)
                .attr('class', 'pointer-events-none').raise();
            } else {
              countryG.append('image').attr('href', imgSrc)
                .attr('x', centroid[0] - imgSize / 2 + 1).attr('y', centroid[1] - imgSize / 2)
                .attr('width', imgSize).attr('height', imgSize)
                .attr('class', 'pointer-events-none').raise();
            }
          }
        }

        if (isOwned) {
          countryG.attr('opacity', 0).transition().duration(1000)
            .delay(Math.random() * 300).ease(d3.easeElasticOut.amplitude(1).period(0.6))
            .attr('opacity', 1).attr('transform', `translate(0, -${targetDepth})`);
        }
      });

      // Zoom + drag (2D)
      const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([1, 15])
        .on('zoom', (event) => gMain.attr('transform', event.transform));
      zoomBehaviorRef.current = zoom;
      svg.call(zoom);

      const drag = d3.drag<SVGSVGElement, unknown>().on('drag', (event) => {
        const t = d3.zoomTransform(svg.node() as any);
        svg.call(zoom.transform, t.translate(event.dx / t.k, event.dy / t.k));
      });
      svg.call(drag as any);

      return () => { tooltip.remove(); };
    }

    // ✅ 공통 드래그 (3D 회전) - D3 drag 대신 pointer events로 통일
    const svgEl = svgRef.current!;

    // 마우스 드래그 (3D)
    if (viewModeRef.current === '3d') {
      let dragging = false, lastMX = 0, lastMY = 0;
      const onMouseDown = (e: MouseEvent) => { dragging = true; lastMX = e.clientX; lastMY = e.clientY; };
      const onMouseMove = (e: MouseEvent) => {
        if (!dragging) return;
        const sens = 0.4 / zoomLevelRef.current;
        rotationRef.current = [
          rotationRef.current[0] + (e.clientX - lastMX) * sens,
          rotationRef.current[1] - (e.clientY - lastMY) * sens,
          rotationRef.current[2],
        ];
        lastMX = e.clientX; lastMY = e.clientY;
        isDirtyRef.current = true;
      };
      const onMouseUp = () => { dragging = false; };

      // 터치 단일 드래그 (3D)
      // ✅ 수정 - 하나의 핸들러로 통합, lastT를 touchstart에서 항상 갱신
let lastTX = 0, lastTY = 0;
let touchStarted = false;

const onTouchStart = (e: TouchEvent) => {
  // 핀치 줌
  if (e.touches.length === 2) {
    lastDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    touchStarted = false; // 핀치 중엔 드래그 비활성화
    return;
  }
  // 단일 터치 - 항상 여기서 초기화
  if (e.touches.length === 1) {
    lastTX = e.touches[0].clientX;
    lastTY = e.touches[0].clientY;
    touchStarted = true;
  }
};

const onTouchMove = (e: TouchEvent) => {
  e.preventDefault();

  // 핀치 줌
  if (e.touches.length === 2) {
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    if (lastDist > 0) {
      zoomLevelRef.current = Math.max(0.5, Math.min(8, zoomLevelRef.current * (dist / lastDist)));
    }
    lastDist = dist;
    isDirtyRef.current = true;
    return;
  }

  // 단일 터치 드래그
  if (e.touches.length === 1 && touchStarted) {
    const dx = e.touches[0].clientX - lastTX;
    const dy = e.touches[0].clientY - lastTY;
    
    // ✅ 업데이트를 dx/dy 계산 직후 즉시
    lastTX = e.touches[0].clientX;
    lastTY = e.touches[0].clientY;

    const sens = 0.3 / (zoomLevelRef.current * (window.devicePixelRatio || 1));
    rotationRef.current = [
      rotationRef.current[0] + dx * sens,
      rotationRef.current[1] - dy * sens,
      rotationRef.current[2],
    ];
    isDirtyRef.current = true;
  }
};

const onTouchEnd = () => {
  touchStarted = false;
  lastDist = 0;
};

svgEl.addEventListener('touchstart', onTouchStart, { passive: true });
svgEl.addEventListener('touchmove', onTouchMove, { passive: false });
svgEl.addEventListener('touchend', onTouchEnd, { passive: true });

// cleanup에도 추가
return () => {
  cancelAnimationFrame(rafRef.current);
  svgEl.removeEventListener('mousedown', onMouseDown);
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
  svgEl.removeEventListener('touchstart', onTouchStart);
  svgEl.removeEventListener('touchmove', onTouchMove);
  svgEl.removeEventListener('touchend', onTouchEnd);
  svgEl.removeEventListener('wheel', onWheel);
};

      // 마우스 휠 줌 (3D)
      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        zoomLevelRef.current = Math.max(0.5, Math.min(8, zoomLevelRef.current * (e.deltaY < 0 ? 1.1 : 0.9)));
        isDirtyRef.current = true;
      };

      svgEl.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      svgEl.addEventListener('touchstart', onTouchStartDrag, { passive: true });
      svgEl.addEventListener('touchmove', onTouchMoveDrag, { passive: false });
      svgEl.addEventListener('wheel', onWheel, { passive: false });

      return () => {
        cancelAnimationFrame(rafRef.current);
        svgEl.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        svgEl.removeEventListener('touchstart', onTouchStartDrag);
        svgEl.removeEventListener('touchmove', onTouchMoveDrag);
        svgEl.removeEventListener('wheel', onWheel);
      };
    }
  // countries/players 바뀌면 2D만 다시 그림, 3D는 rAF가 알아서 반영
  }, [topology, viewMode, countries, players, onCountryClick, startRenderLoop]);

  // 2D 대륙 이동
  useEffect(() => {
    if (!topology || !svgRef.current || !zoomBehaviorRef.current || viewMode !== '2d') return;
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth, height = svgRef.current.clientHeight;
    const cont = CONTINENTS[selectedContinent];
    const proj = d3.geoMercator().scale(width / 5.5).center([0, 0]).translate([width / 2, height / 2]);
    const center = proj(cont.center);
    if (!center) return;
    const t = d3.zoomIdentity.translate(width / 2, height / 2).scale(cont.scale).translate(-center[0], -center[1]);
    svg.transition().duration(1000).ease(d3.easeCubicOut).call(zoomBehaviorRef.current.transform, t);
  }, [selectedContinent, topology, viewMode]);

  const handleReset = () => {
    rotationRef.current = [-10, -20, 0];
    zoomLevelRef.current = 1;
    isDirtyRef.current = true;
    forceUpdate(n => n + 1);
  };

  return (
    <div className="w-full h-full bg-[#f8fafc] overflow-hidden relative rounded-[2rem] border border-[#E2E8F0] shadow-sm">
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }} // ✅ 브라우저 기본 터치 스크롤 비활성화
      />

      <div className="absolute top-6 left-6 flex flex-col gap-3 pointer-events-auto">
        <div className="flex bg-white/90 backdrop-blur-md p-1 rounded-2xl border border-slate-200 shadow-lg">
          <button
            onClick={() => { viewModeRef.current = '3d'; setViewMode('3d'); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === '3d' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <GlobeIcon className="w-3.5 h-3.5" /> 3D Globe
          </button>
          <button
            onClick={() => { viewModeRef.current = '2d'; setViewMode('2d'); setSelectedContinent('world'); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === '2d' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> 3D Map
          </button>
        </div>

        {viewMode === '2d' && (
          <div className="flex flex-wrap gap-2 max-w-[400px]">
            {(Object.keys(CONTINENTS) as Continent[]).map(key => (
              <button key={key} onClick={() => setSelectedContinent(key)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border shadow-sm ${selectedContinent === key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/90 text-slate-600 border-slate-200 hover:bg-white'}`}>
                {CONTINENTS[key].name}
              </button>
            ))}
          </div>
        )}

        {viewMode === '3d' && (
          <button onClick={handleReset}
            className="flex items-center justify-center w-12 h-12 bg-white/90 hover:bg-white text-slate-500 rounded-2xl border border-slate-200 shadow-md transition-all active:scale-95">
            <RefreshCcw className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-200 text-[10px] text-slate-500 space-y-1.5 shadow-sm font-bold uppercase tracking-tight">
        <p className="flex items-center gap-2 text-blue-600"><GlobeIcon className="w-3 h-3" /> {viewMode === '3d' ? 'DRAG TO ROTATE' : 'DRAG TO MOVE'}</p>
        <p className="flex items-center gap-2"><ZoomIn className="w-3 h-3" /> PINCH / WHEEL TO ZOOM</p>
      </div>

      <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md px-6 py-4 rounded-3xl border border-slate-200 shadow-xl max-w-[150px]">
        <p className="text-[9px] font-black text-slate-400 mb-3 uppercase tracking-widest text-center">Center Tiers</p>
        <div className="space-y-3">
          {BUILDING_TIERS.map(tier => (
            <div key={tier.level} className="flex items-center gap-3">
              <div className="w-3 rounded-sm border border-slate-300 shadow-sm" style={{ height: `${tier.level * 4 + 4}px`, backgroundColor: '#475569' }} />
              <span className="text-[10px] font-bold text-slate-600">{tier.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
