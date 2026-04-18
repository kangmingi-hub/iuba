/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { CountryState, Player } from '../types';
import { COUNTRY_PRICES, DEFAULT_COUNTRY_PRICE, BUILDING_TIERS, CLUB_IMAGES } from '../constants';
import { Globe as GlobeIcon, ZoomIn, ZoomOut, ArrowLeft, RefreshCcw } from 'lucide-react';

interface WorldMapProps {
  countries: Record<string, CountryState>;
  players: Player[];
  onCountryClick: (countryId: string, countryName: string) => void;
}

type ViewMode = '3d' | '2d';
type Continent = 'world' | 'africa' | 'asia' | 'europe' | 'northAmerica' | 'southAmerica' | 'oceania';

const CONTINENTS: Record<Continent, { name: string; center: [number, number]; scale: number }> = {
  world:         { name: '전체 지도',   center: [0, 0],      scale: 1 },
  africa:        { name: '아프리카',    center: [20, -5],     scale: 3.2 },
  asia:          { name: '아시아',      center: [95, 35],     scale: 2.8 },
  europe:        { name: '유럽',        center: [15, 54],     scale: 6.5 },
  northAmerica:  { name: '북미',        center: [-100, 45],   scale: 2.8 },
  southAmerica:  { name: '남미',        center: [-58, -20],   scale: 3.2 },
  oceania:       { name: '오세아니아',  center: [148, -25],   scale: 5.0 },
};

export default function WorldMap({ countries, players, onCountryClick }: WorldMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [topology, setTopology] = useState<any>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('3d');
  const [rotation, setRotation] = useState<[number, number, number]>([-10, -20, 0]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedContinent, setSelectedContinent] = useState<Continent>('world');
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>(null);
  const rotationRef = useRef(rotation);
  const zoomLevelRef = useRef(zoomLevel);
  const viewModeRef = useRef(viewMode);
  
  useEffect(() => { rotationRef.current = rotation; }, [rotation]);
  useEffect(() => { zoomLevelRef.current = zoomLevel; }, [zoomLevel]);
  useEffect(() => { viewModeRef.current = viewMode; }, [viewMode]);

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(res => res.json())
      .then(data => setTopology(data));
  }, []);

  useEffect(() => {
    if (!topology || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const rect = svgRef.current.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight * 0.6;

    svg.selectAll('*').remove();

    const minSize = Math.min(width, height);
    
    // Projection setup
    const projection = viewMode === '3d' 
      ? d3.geoOrthographic()
          .scale(minSize / 2.2 * zoomLevel)
          .translate([width / 2, height / 2])
          .rotate(rotation)
      : d3.geoMercator()
          .scale(width / 6.5)
          .translate([width / 2, height / 1.8]);

    const path = d3.geoPath().projection(projection);

    // Features
    const features = topojson.feature(topology, topology.objects.countries) as any;
    const filteredFeatures = features.features.filter((f: any) => f.id !== '010' && f.properties.name !== 'Antarctica');

    const gMain = svg.append('g').attr('class', 'main-group');

    // Drag & Zoom Interactions
  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([1, 15])
    .on('zoom', (event) => {
      if (viewMode === '2d') {
        gMain.attr('transform', event.transform);
      } else {
        setZoomLevel(event.transform.k);
      }
    })
    .filter((event) => {
      return viewMode === '2d' || event.type !== 'mousedown';
    });
        
    // @ts-ignore
    zoomRef.current = zoom;
    svg.call(zoom);

    // Unified Drag Handler
const drag = d3.drag<SVGSVGElement, unknown>()
  .on('drag', (event) => {
    if (viewMode === '3d') {
      const sensitivity = 0.4 / zoomLevel;
      setRotation(prev => [
        prev[0] + event.dx * sensitivity, 
        prev[1] - event.dy * sensitivity, 
        prev[2]
      ]);
    } else {
      const transform = d3.zoomTransform(svg.node() as any);
      svg.call(zoom.transform, transform.translate(event.dx / transform.k, event.dy / transform.k));
    }
  });
    
    svg.call(drag as any);

  
    // Perspective Transformation
    let gPerspective = gMain;
    if (viewMode === '2d') {
      gPerspective = gMain.append('g')
        .attr('transform', 'perspective(1200px) rotateX(45deg)');
      
      // Grid
      const gridSize = 100;
      const gridG = gPerspective.append('g').attr('class', 'grid');
      const gBound = 4000;
      for (let x = -gBound; x < gBound; x += gridSize) {
        gridG.append('line').attr('x1', x).attr('y1', -gBound).attr('x2', x).attr('y2', gBound).attr('stroke', '#e2e8f0').attr('stroke-width', 0.5);
      }
      for (let y = -gBound; y < gBound; y += gridSize) {
        gridG.append('line').attr('x1', -gBound).attr('y1', y).attr('x2', gBound).attr('y2', y).attr('stroke', '#e2e8f0').attr('stroke-width', 0.5);
      }
    }

    if (viewMode === '3d') {
      // Glow/Aura for Globe
      gMain.append('circle')
        .attr('cx', width / 2)
        .attr('cy', height / 2)
        .attr('r', (minSize / 2.2 * zoomLevel))
        .attr('fill', 'url(#globe-gradient)')
        .attr('opacity', 0.4);

      const defs = svg.append('defs');
      const grad = defs.append('radialGradient').attr('id', 'globe-gradient');
      grad.append('stop').attr('offset', '70%').attr('stop-color', '#f1f5f9').attr('stop-opacity', 0);
      grad.append('stop').attr('offset', '100%').attr('stop-color', '#3b82f6').attr('stop-opacity', 0.2);

      gMain.append('path')
        .datum({ type: 'Sphere' })
        .attr('class', 'sphere')
        .attr('d', path as any)
        .attr('fill', '#f8fafc')
        .attr('stroke', '#e2e8f0')
        .attr('stroke-width', 1);
    }

    const gCountries = gPerspective.append('g').attr('class', 'countries');
    
    // Tooltip Helper
    const tooltip = d3.select('body').append('div')
      .attr('class', 'absolute hidden bg-white/95 backdrop-blur-sm text-[#1E293B] p-3 rounded-2xl shadow-xl text-[11px] pointer-events-none z-50 border border-slate-200 font-bold min-w-[120px]');

    const handleMouseOver = (event: any, d: any) => {
      const countryName = d.properties.name;
      const state = countries[countryName];
      const player = state?.ownerId ? players.find(p => p.id === state.ownerId) : null;
      const bCount = state?.buildings || 0;
      const bName = bCount > 0 ? BUILDING_TIERS[bCount - 1].name : '없음';

      tooltip.classed('hidden', false).html(`
        <div class="mb-2 border-b border-slate-100 pb-2 text-blue-600 uppercase tracking-widest text-[9px] font-black">${countryName}</div>
        <div class="space-y-1">
          <div class="flex justify-between gap-4"><span>소유자:</span> <span class="${player ? 'text-blue-600' : 'text-slate-400'}">${player?.name || '공석'}</span></div>
          <div class="flex justify-between gap-4"><span>센터 수준:</span> <span class="text-amber-600">${bName}</span></div>
        </div>
      `);
    };

    const handleMouseMove = (event: any) => {
      tooltip.style('left', (event.pageX + 15) + 'px').style('top', (event.pageY - 15) + 'px');
    };

    const handleMouseOut = () => {
      tooltip.classed('hidden', true);
    };

    // Individual country stacking with "Rising" animation
    if (viewMode === '2d') {
      const unownedFeatures = filteredFeatures.filter((f: any) => {
          const name = f.properties.name;
          const state = countries[name] || countries[f.id] || Object.values(countries).find(c => c.name === name || c.id === name);
          return !(state?.ownerId && players.some(p => p.id === state.ownerId));
        });
        const ownedFeatures = filteredFeatures.filter((f: any) => {
          const name = f.properties.name;
          const state = countries[name] || countries[f.id] || Object.values(countries).find(c => c.name === name || c.id === name);
          return !!(state?.ownerId && players.some(p => p.id === state.ownerId));
        });

      [...unownedFeatures, ...ownedFeatures].forEach((feature: any) => {
        const countryName = feature.properties.name;
        const state = countries[countryName] || countries[feature.id] || 
        Object.values(countries).find(c => c.name === countryName || c.id === countryName);
        const isOwned = !!(state?.ownerId && players.some(p => p.id === state.ownerId));
        const targetDepth = isOwned ? (2 + state.buildings * 2) : 0;

        const countryG = gCountries.append('g').attr('class', 'country-stack');

         if (isOwned) {
            const baseColor = players.find(p => p.id === state.ownerId)?.color || '#cbd5e1';
          
            // 옆면 - 0부터 targetDepth까지 꽉 채워서 솟아오른 느낌
            const wallSteps = 8;
            for (let i = 0; i <= wallSteps; i++) {
              countryG.append('path')
                .datum(feature)
                .attr('d', path as any)
                .attr('transform', `translate(0, ${(i / wallSteps) * targetDepth})`)
                .attr('fill', d3.color(baseColor)?.darker(0.05 + 0.8 * (i / wallSteps))?.toString() || baseColor)
                .attr('class', 'pointer-events-none');
            }
          }

        // Top Surface
        countryG.append('path')
          .datum(feature)
          .attr('d', path as any)
          .attr('class', 'country-top cursor-pointer')
          .attr('fill', isOwned ? players.find(p => p.id === state!.ownerId)?.color || '#e2e8f0' : '#e2e8f0')
          .attr('stroke', '#94a3b8')        
          .attr('stroke-width', '0.5') 
          .attr('vector-effect', 'non-scaling-stroke')
          .on('click', (event, d: any) => onCountryClick(d.properties.name, d.properties.name))
          .on('mouseover', function(event, d: any) {
              handleMouseOver(event, d);
              d3.select(this)
                .attr('fill-opacity', 0.8)
                .attr('stroke', '#3b82f6')
                .attr('stroke-width', '1.5')
                .attr('vector-effect', 'non-scaling-stroke')
            })
            .on('mousemove', handleMouseMove)
            .on('mouseout', function() {
              handleMouseOut();
              d3.select(this)
                .attr('fill-opacity', 1)
                .attr('stroke', '#94a3b8')
                .attr('stroke-width', '0.5')
                .attr('vector-effect', 'non-scaling-stroke');
            });

        // ===== 여기서부터 변경된 부분 (캐릭터 & 건물 지도 위 표시) =====
        // 나라 중심에 이미지 표시 로직
        if (isOwned) {
          const centroid = path.centroid(feature);
          const bounds = path.bounds(feature);
          
          if (centroid && !isNaN(centroid[0]) && !isNaN(centroid[1])) {
            const boundsWidth = bounds[1][0] - bounds[0][0];
            const boundsHeight = bounds[1][1] - bounds[0][1];
            const area = boundsWidth * boundsHeight;
            const imgSize = Math.max(6, Math.min(Math.sqrt(area) * 0.5, 50)); // 최소 6, 최대 50

            const owner = players.find(p => p.id === state!.ownerId);
            const imgSrc = CLUB_IMAGES[owner?.name || ''] || owner?.characterUrl || '';
            
            // 💡 건물 존재 여부 확인
            const hasBuilding = state!.buildings > 0;
            // 💡 건물 이미지 주소 (나중에 실제 가지고 계신 파일 경로로 수정하세요!)
           const BUILDING_IMAGES: Record<number, string> = {
                1: '/buildings/housechurch.png',
                2: '/buildings/branch.png',
                3: '/buildings/church.png',
              };
              const buildingImgSrc = BUILDING_IMAGES[state!.buildings] || '/buildings/building1.png';
            if (hasBuilding) {
              const offset = imgSize * 0.25;
            
              // 1. 건물 먼저 (뒤에 배치)
              countryG.append('image')
                .attr('href', buildingImgSrc)
                .attr('x', centroid[0] - imgSize / 2)
                .attr('y', centroid[1] - imgSize / 2)
                .attr('width', imgSize)
                .attr('height', imgSize)
                .attr('class', 'pointer-events-none')
                .style('filter', 'drop-shadow(0px 2px 4px rgba(0,0,0,0.6))')
                .raise();
            
              // 2. 캐릭터 나중에 (앞에 배치) + 크기 작게
              const charSize = imgSize * 0.65;
              countryG.append('image')
                .attr('href', imgSrc)
                .attr('x', centroid[0] - offset - charSize / 2)
                .attr('y', centroid[1] - imgSize * 0.1)
                .attr('width', charSize)
                .attr('height', charSize)
                .attr('class', 'pointer-events-none')
                .style('filter', 'drop-shadow(0px 2px 4px rgba(0,0,0,0.4))')
                .raise();
            } else {
              // 건물이 없으면 기존처럼 한가운데 캐릭터 하나만 표시
              countryG.append('image')
                .attr('href', imgSrc)
                .attr('x', centroid[0] - imgSize / 2 + 1)
                .attr('y', centroid[1] - imgSize / 2)
                .attr('width', imgSize)
                .attr('height', imgSize)
                .attr('class', 'pointer-events-none')
                .style('filter', 'drop-shadow(0px 2px 4px rgba(0,0,0,0.4))')
                .raise();
            }
          }
        }
        // ===== 변경 부분 끝 =====
  
        // Entrance Animation - 소유 나라만 튀어오르게
        if (isOwned) {
          countryG.attr('opacity', 0)
            .attr('transform', 'translate(0, 0)')
            .transition()
            .duration(1000)
            .delay(Math.random() * 300)
            .ease(d3.easeElasticOut.amplitude(1).period(0.6))
            .attr('opacity', 1)
            .attr('transform', `translate(0, -${targetDepth})`);
        } else {
          countryG.attr('opacity', 1)
            .attr('transform', 'translate(0, 0)');
        }
      });
    } else {
     gCountries.selectAll('path').data(filteredFeatures).enter().append('path').attr('d', path as any)
        .attr('class', 'country-top cursor-pointer')
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 0.5)
        .attr('vector-effect', 'non-scaling-stroke')
        .attr('fill', (d:any) => countries[d.properties.name]?.ownerId ? players.find(p => p.id === countries[d.properties.name].ownerId)?.color || '#CBD5E1' : '#CBD5E1')
        .on('click', (event, d: any) => onCountryClick(d.properties.name, d.properties.name))
        .on('mouseover', function(event, d: any) {
              handleMouseOver(event, d);
              d3.select(this)
                .attr('fill-opacity', 0.8)
                .attr('stroke', '#3b82f6')
                .attr('stroke-width', '1.5')
                .attr('vector-effect', 'non-scaling-stroke')
            })
          .on('mousemove', handleMouseMove)
          .on('mouseout', function() {
              handleMouseOut();
              d3.select(this)
                .attr('fill-opacity', 1)
                .attr('stroke', '#94a3b8')
                .attr('stroke-width', '0.5')
                .attr('vector-effect', 'non-scaling-stroke');
            });
    }

    if (viewMode === '2d') {
      const gClouds = gPerspective.append('g').attr('class', 'clouds');
      [[100, 100], [800, 150]].forEach(([cx, cy]) => {
        gClouds.append('g').attr('transform', `translate(${cx}, ${cy})`).html('<ellipse cx="0" cy="0" rx="40" ry="20" fill="white" opacity="0.4" />');
      });
    }

    function isPointVisible(d: any, proj: d3.GeoProjection) {
      const centroid = d3.geoCentroid(d);
      const rotate = proj.rotate();
      return d3.geoDistance(centroid, [-rotate[0], -rotate[1]]) < Math.PI / 2;
    }

    return () => tooltip.remove();
  }, [topology, countries, players, viewMode, rotation, zoomLevel]);

  // Handle Continent Zooming
  useEffect(() => {
    if (!topology || !svgRef.current || !zoomRef.current || viewMode !== '2d') return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const continent = CONTINENTS[selectedContinent];

    const projection = d3.geoMercator()
            .scale(width / 5.5)
            .center([0, 0])
            .translate([width / 2, height / 2]);

    const center = projection(continent.center);
    if (!center) return;

    const transform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(continent.scale)
      .translate(-center[0], -center[1]);

    svg.transition()
      .duration(1000)
      .ease(d3.easeCubicOut)
      .call(zoomRef.current.transform, transform);

  }, [selectedContinent, topology, viewMode]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      setZoomLevel(prev => prev); 
    });
    if (svgRef.current) observer.observe(svgRef.current);
    return () => observer.disconnect();
  }, []);

useEffect(() => {
  const svgEl = svgRef.current;
  if (!svgEl) return;

  let lastX = 0;
  let lastY = 0;
  let rafId: number | null = null;  // requestAnimationFrame ID

  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    }
  };

  const onTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length !== 1) return;

    const dx = e.touches[0].clientX - lastX;
    const dy = e.touches[0].clientY - lastY;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;

    if (viewModeRef.current === '3d') {
      const sensitivity = 0.5 / zoomLevelRef.current;
      const newRotation: [number, number, number] = [
        rotationRef.current[0] + dx * sensitivity,
        rotationRef.current[1] - dy * sensitivity,
        rotationRef.current[2]
      ];
    rotationRef.current = newRotation;
    setRotation(newRotation);

  svgEl.addEventListener('touchstart', onTouchStart, { passive: true });
  svgEl.addEventListener('touchmove', onTouchMove, { passive: false });

  return () => {
    svgEl.removeEventListener('touchstart', onTouchStart);
    svgEl.removeEventListener('touchmove', onTouchMove);
    if (rafId) cancelAnimationFrame(rafId);
  };
}, []);
  
  return (
    <div className="w-full h-full bg-[#f8fafc] overflow-hidden relative rounded-[2rem] border border-[#E2E8F0] shadow-sm">
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      
      <div className="absolute top-6 left-6 flex flex-col gap-3 pointer-events-auto">
        <div className="flex bg-white/90 backdrop-blur-md p-1 rounded-2xl border border-slate-200 shadow-lg">
          <button
            onClick={() => { setViewMode('3d'); setZoomLevel(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === '3d' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <GlobeIcon className="w-3.5 h-3.5" /> 3D Globe
          </button>
          <button
            onClick={() => { setViewMode('2d'); setZoomLevel(1); setSelectedContinent('world'); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === '2d' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> 3D Map
          </button>
        </div>

        {viewMode === '2d' && (
          <div className="flex flex-wrap gap-2 max-w-[400px]">
            {(Object.keys(CONTINENTS) as Continent[]).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedContinent(key)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border shadow-sm ${selectedContinent === key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/90 text-slate-600 border-slate-200 hover:bg-white'}`}
              >
                {CONTINENTS[key].name}
              </button>
            ))}
          </div>
        )}

        {viewMode === '3d' && (
          <button
            onClick={() => { setRotation([-10, -20, 0]); setZoomLevel(1); }}
            className="flex items-center justify-center w-12 h-12 bg-white/90 hover:bg-white text-slate-500 rounded-2xl border border-slate-200 shadow-md transition-all active:scale-95"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-200 text-[10px] text-slate-500 space-y-1.5 shadow-sm font-bold uppercase tracking-tight">
        <p className="flex items-center gap-2 text-blue-600"><GlobeIcon className="w-3 h-3" /> {viewMode === '3d' ? 'DRAG TO ROTATE' : 'DRAG TO MOVE'}</p>
        <p className="flex items-center gap-2"><ZoomIn className="w-3 h-3" /> MOUSE WHEEL TO ZOOM</p>
      </div>

      <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md px-6 py-4 rounded-3xl border border-slate-200 shadow-xl max-w-[150px]">
        <p className="text-[9px] font-black text-slate-400 mb-3 uppercase tracking-widest text-center">Center Tiers</p>
        <div className="space-y-3">
          {BUILDING_TIERS.map(tier => (
            <div key={tier.level} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-sm border border-slate-300 shadow-sm" style={{ height: `${tier.level * 4 + 4}px`, backgroundColor: '#475569' }} />
              <span className="text-[10px] font-bold text-slate-600">{tier.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
