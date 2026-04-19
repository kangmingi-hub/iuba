import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Coins, Building2, PlusCircle } from 'lucide-react';
import { Player, CountryState } from '../types';
import { COUNTRY_PRICES, DEFAULT_COUNTRY_PRICE, BUILDING_TIERS, CLUB_IMAGES } from '../constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

interface Props {
  selectedCountry: { id: string; name: string } | null;
  countries: Record<string, CountryState>;
  players: Player[];
  onClose: () => void;
  onBuy: (countryId: string, playerId: string, countryName: string) => void;
  onBuild: (countryId: string) => void;
}

export default function CountryModal({ selectedCountry, countries, players, onClose, onBuy, onBuild }: Props) {
  if (!selectedCountry) return null;

  const ownedCountry = countries[selectedCountry.id] || countries[selectedCountry.name];

  return (
    <AnimatePresence>
      {selectedCountry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-lg bg-white border border-[#E2E8F0] rounded-[2rem] overflow-hidden shadow-2xl"
          >
            <div className="h-24 bg-[#FAFBFF] border-b border-[#E2E8F0] flex items-center px-8">
              <div className="flex-1">
                <span className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-widest">Territory Briefing</span>
                <h3 className="text-2xl font-black text-[#1E293B] leading-tight uppercase">{selectedCountry.name}</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              <div className="flex gap-6 mb-8">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Conquer Cost</span>
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-amber-500" />
                    <span className="text-xl font-black text-amber-600">{COUNTRY_PRICES[selectedCountry.name] || DEFAULT_COUNTRY_PRICE}G</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Center Cost</span>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-500" />
                    <span className="text-xl font-black text-blue-600 font-mono">
                      {(() => {
                        const buildings = ownedCountry?.buildings || 0;
                        if (buildings >= 3) return 'MAX';
                        return BUILDING_TIERS[buildings].cost;
                      })()}P
                    </span>
                  </div>
                </div>
              </div>

              {/* ===== 여기서부터 변경된 부분입니다 (소유자가 있을 때의 화면) ===== */}
              {ownedCountry?.ownerId ? (
                <div className="space-y-6">
                  
                  {/* 추가된 부분: 캐릭터가 비켜나고 건물이 생기는 애니메이션 구역 */}
                  <div className="flex items-center justify-center h-28 bg-[#FAFBFF] rounded-2xl border border-[#E2E8F0] shadow-inner mb-4">
                    <div className="flex items-center gap-4">
                      {/* 캐릭터 (건물이 생기면 layout 속성에 의해 자연스럽게 왼쪽으로 밀려남) */}
                      <motion.div layout transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} className="relative z-10">
                        <img 
                      src={(() => {
  const owner = players.find(p => p.id === ownedCountry.ownerId);
  return owner ? (CLUB_IMAGES[owner.name] || owner.characterUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png") : "https://cdn-icons-png.flaticon.com/512/149/149071.png";
})()}
                          alt="캐릭터" 
                          className="w-16 h-16 rounded-full border-4 shadow-md bg-white object-cover"
                          style={{ borderColor: players.find(p => p.id === ownedCountry.ownerId)?.color || '#3B82F6' }}
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/149/149071.png" }}
                        />
                      </motion.div>

                      {/* 건물 (건물이 있을 때만 오른쪽에서 팝업되며 등장) */}
                      <AnimatePresence>
                        {ownedCountry.buildings > 0 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0, x: -20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0, x: -20 }}
                            transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
                            className="relative z-20"
                          >
                            {/* 💡여기의 src 주소를 나중에 진짜 건물 이미지로 바꿔주세요! */}
                            <img 
                              src="https://cdn-icons-png.flaticon.com/512/2555/2555572.png" 
                              alt="건물" 
                              className="w-16 h-16 drop-shadow-xl object-contain"
                            />
                            {/* 건물 레벨 뱃지 */}
                            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                              Lv.{ownedCountry.buildings}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  {/* 애니메이션 구역 끝 */}

                  <div className="p-6 bg-[#FAFBFF] rounded-2xl border border-[#E2E8F0] flex items-center justify-between shadow-sm">
                    <div>
                      <p className="text-[10px] text-[#64748B] uppercase font-bold tracking-widest mb-2">Occupying Force</p>
                      <p className="text-2xl font-black text-blue-600">
                        {players.find(p => p.id === ownedCountry.ownerId)?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-[#64748B] uppercase font-bold tracking-widest mb-2">Building Tier</p>
                      <p className="text-xl font-black text-[#1E293B] flex items-center justify-end gap-2 font-mono">
                        {ownedCountry.buildings === 0 ? '없음' : BUILDING_TIERS[ownedCountry.buildings - 1].name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onBuild(selectedCountry.id)}
                    disabled={ownedCountry.buildings >= 3}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 disabled:cursor-not-allowed py-5 rounded-2xl font-black text-white shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest"
                  >
                    <PlusCircle className="w-6 h-6" />
                    {ownedCountry.buildings >= 3 ? '모든 건설 완료' : `${BUILDING_TIERS[ownedCountry.buildings].name} 건설`}
                  </button>
                </div>
              ) : (
              /* ===== 미점유 상태 ===== */
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 italic text-[11px] text-blue-600 font-medium text-center">
                    본 영토는 현재 미점유 상태입니다. 대원의 점수를 사용하여 선교 지경을 넓히십시오.
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {players.map(player => (
                      <button
                        key={player.id}
                        onClick={() => onBuy(selectedCountry.id, player.id, selectedCountry.name)}
                        disabled={player.gold < (COUNTRY_PRICES[selectedCountry.name] || DEFAULT_COUNTRY_PRICE)}
                        className={cn("py-4 px-2 rounded-2xl border transition-all disabled:opacity-30 hover:shadow-md hover:scale-[1.05]")}
                        style={{ borderColor: `${player.color}44`, backgroundColor: `${player.color}05`, color: player.color }}
                      >
                        <div className="text-[10px] font-black uppercase tracking-tight">{player.name}</div>
                        <div className="text-[9px] font-bold opacity-60">SELECT</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
