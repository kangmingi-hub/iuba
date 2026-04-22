import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Coins, Building2, PlusCircle, Lock, Target, Crosshair } from 'lucide-react';
import { Player, CountryState, User } from '../types';
import { COUNTRY_PRICES, DEFAULT_COUNTRY_PRICE, CLUB_IMAGES, getBuildingTiers } from '../constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

interface Props {
  selectedCountry: { id: string; name: string } | null;
  countries: Record<string, CountryState>;
  players: Player[];
  currentUser: User | null;
  onClose: () => void;
  onBuy: (countryId: string, playerId: string, countryName: string) => void;
  onBuild: (countryId: string) => void;
}

export default function CountryModal({ selectedCountry, countries, players, currentUser, onClose, onBuy, onBuild }: Props) {
  if (!selectedCountry) return null;

  const ownedCountry = countries[selectedCountry.id] || countries[selectedCountry.name];
  const isAdmin = currentUser?.role === 'admin';
  const myPlayer = players.find(p => p.name === currentUser?.username);
  const isMyCountry = !!myPlayer && ownedCountry?.ownerId === myPlayer.id;
  const canBuild = isAdmin || isMyCountry;

  return (
    <AnimatePresence>
      {selectedCountry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
            style={{ 
              background: 'radial-gradient(ellipse at center, rgba(0, 20, 40, 0.9) 0%, rgba(5, 10, 20, 0.95) 100%)',
              backdropFilter: 'blur(10px)'
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-lg overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(10, 25, 50, 0.95) 0%, rgba(15, 30, 60, 0.9) 100%)',
              border: '1px solid rgba(0, 255, 255, 0.3)',
              borderRadius: '2rem',
              boxShadow: '0 0 60px rgba(0, 255, 255, 0.2), inset 0 0 40px rgba(0, 255, 255, 0.03)'
            }}
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-400/50 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-cyan-400/50 rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-cyan-400/50 rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-400/50 rounded-br-2xl" />

            {/* Scan line */}
            <motion.div
              className="absolute left-0 right-0 h-[1px]"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.5), transparent)' }}
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />

            <div className="h-24 flex items-center px-8 relative"
              style={{
                background: 'linear-gradient(90deg, rgba(0, 255, 255, 0.08) 0%, transparent 100%)',
                borderBottom: '1px solid rgba(0, 255, 255, 0.2)'
              }}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4" style={{ color: 'rgba(0, 255, 255, 0.5)' }} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]"
                    style={{ color: 'rgba(0, 255, 255, 0.6)', fontFamily: 'Share Tech Mono, monospace' }}>
                    TERRITORY BRIEFING
                  </span>
                </div>
                <h3 className="text-2xl font-black uppercase"
                  style={{ 
                    fontFamily: 'Orbitron, sans-serif',
                    color: '#00ffff',
                    textShadow: '0 0 20px rgba(0, 255, 255, 0.5)'
                  }}>
                  {selectedCountry.name}
                </h3>
              </div>
              <button onClick={onClose} 
                className="p-2 rounded-full transition-colors"
                style={{ color: 'rgba(0, 255, 255, 0.5)' }}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              <div className="flex gap-6 mb-8">
                <div className="flex flex-col p-4 rounded-xl flex-1"
                  style={{ 
                    background: 'rgba(255, 200, 50, 0.1)',
                    border: '1px solid rgba(255, 200, 50, 0.3)'
                  }}>
                  <span className="text-[9px] font-bold uppercase tracking-widest mb-1"
                    style={{ color: 'rgba(255, 200, 50, 0.7)', fontFamily: 'Share Tech Mono' }}>
                    CONQUER COST
                  </span>
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5" style={{ color: '#ffc832' }} />
                    <span className="text-xl font-black" style={{ color: '#ffd700', fontFamily: 'Orbitron' }}>
                      {COUNTRY_PRICES[selectedCountry.name] || DEFAULT_COUNTRY_PRICE}G
                    </span>
                  </div>
                </div>
                <div className="flex flex-col p-4 rounded-xl flex-1"
                  style={{ 
                    background: 'rgba(0, 200, 255, 0.1)',
                    border: '1px solid rgba(0, 200, 255, 0.3)'
                  }}>
                  <span className="text-[9px] font-bold uppercase tracking-widest mb-1"
                    style={{ color: 'rgba(0, 200, 255, 0.7)', fontFamily: 'Share Tech Mono' }}>
                    CENTER COST
                  </span>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" style={{ color: '#00c8ff' }} />
                    <span className="text-xl font-black font-mono" style={{ color: '#00ffff', fontFamily: 'Orbitron' }}>
                      {(() => {
                        const tiers = getBuildingTiers(selectedCountry.name);
                        const buildings = ownedCountry?.buildings || 0;
                        if (buildings >= 3) return 'MAX';
                        return tiers[buildings].cost;
                      })()}P
                    </span>
                  </div>
                </div>
              </div>

              {ownedCountry?.ownerId ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-center h-28 rounded-2xl relative overflow-hidden"
                    style={{
                      background: 'rgba(0, 20, 40, 0.6)',
                      border: '1px solid rgba(0, 255, 255, 0.2)'
                    }}>
                    {/* Animated grid inside */}
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }} />
                    <div className="flex items-center gap-4 relative z-10">
                      <motion.div layout transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} className="relative">
                        <div className="absolute inset-0 rounded-full blur-lg opacity-50"
                          style={{ backgroundColor: players.find(p => p.id === ownedCountry.ownerId)?.color || '#00ffff' }} />
                        <img
                          src={(() => {
                            const owner = players.find(p => p.id === ownedCountry.ownerId);
                            return owner
                              ? (CLUB_IMAGES[owner.name] || owner.characterUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png")
                              : "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                          })()}
                          alt="캐릭터"
                          className="relative w-16 h-16 rounded-full border-2 object-cover"
                          style={{ 
                            borderColor: players.find(p => p.id === ownedCountry.ownerId)?.color || '#00ffff',
                            boxShadow: `0 0 20px ${players.find(p => p.id === ownedCountry.ownerId)?.color || '#00ffff'}50`
                          }}
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; }}
                        />
                      </motion.div>
                      <AnimatePresence>
                        {ownedCountry.buildings > 0 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0, x: -20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0, x: -20 }}
                            transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
                            className="relative"
                          >
                            <img
                              src="https://cdn-icons-png.flaticon.com/512/2555/2555572.png"
                              alt="건물"
                              className="w-16 h-16 drop-shadow-xl object-contain"
                            />
                            <span className="absolute -top-2 -right-2 text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full"
                              style={{
                                background: 'linear-gradient(135deg, #00c8ff, #00ffff)',
                                color: '#0a1428',
                                boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)'
                              }}>
                              {ownedCountry.buildings}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl flex items-center justify-between"
                    style={{
                      background: 'rgba(0, 255, 255, 0.05)',
                      border: '1px solid rgba(0, 255, 255, 0.2)'
                    }}>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-widest mb-2"
                        style={{ color: 'rgba(0, 255, 255, 0.5)', fontFamily: 'Share Tech Mono' }}>
                        OCCUPYING FORCE
                      </p>
                      <p className="text-2xl font-black"
                        style={{ color: '#00ffff', fontFamily: 'Orbitron', textShadow: '0 0 15px rgba(0, 255, 255, 0.5)' }}>
                        {players.find(p => p.id === ownedCountry.ownerId)?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold tracking-widest mb-2"
                        style={{ color: 'rgba(0, 255, 255, 0.5)', fontFamily: 'Share Tech Mono' }}>
                        BUILDING TIER
                      </p>
                      <p className="text-xl font-black font-mono" style={{ color: '#e0ffff' }}>
                        {ownedCountry.buildings === 0 ? '없음' : getBuildingTiers(selectedCountry.name)[ownedCountry.buildings - 1].name}
                      </p>
                    </div>
                  </div>

                  {canBuild ? (
                    <button
                      onClick={() => onBuild(selectedCountry.id)}
                      disabled={ownedCountry.buildings >= 3}
                      className="w-full py-5 rounded-2xl font-black flex items-center justify-center gap-3 uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-30 relative overflow-hidden group"
                      style={{
                        background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 200, 100, 0.3) 100%)',
                        border: '2px solid rgba(0, 255, 136, 0.5)',
                        color: '#00ff88',
                        boxShadow: '0 0 30px rgba(0, 255, 136, 0.2)',
                        fontFamily: 'Orbitron, sans-serif',
                        textShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
                      }}
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <PlusCircle className="w-6 h-6" />
                      <span className="relative z-10">
                        {ownedCountry.buildings >= 3 ? '모든 건설 완료' : `${getBuildingTiers(selectedCountry.name)[ownedCountry.buildings].name} 건설`}
                      </span>
                    </button>
                  ) : (
                    <div className="w-full py-5 rounded-2xl flex items-center justify-center gap-3"
                      style={{
                        background: 'rgba(100, 100, 120, 0.2)',
                        border: '1px solid rgba(100, 100, 120, 0.3)',
                        color: 'rgba(150, 150, 170, 0.6)'
                      }}>
                      <Lock className="w-5 h-5" />
                      <span className="text-[11px] font-black uppercase tracking-widest">본인 동아리 영토만 건설 가능합니다</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl font-mono text-[11px] text-center"
                    style={{
                      background: 'rgba(0, 255, 255, 0.05)',
                      border: '1px solid rgba(0, 255, 255, 0.2)',
                      color: 'rgba(0, 255, 255, 0.6)'
                    }}>
                    <Crosshair className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    // 본 영토는 현재 미점유 상태입니다. 대원의 점수를 사용하여 선교 지경을 넓히십시오. //
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {players.map(player => {
                      const canBuyThis = isAdmin || player.id === myPlayer?.id;
                      return (
                        <button
                          key={player.id}
                          onClick={() => canBuyThis && onBuy(selectedCountry.id, player.id, selectedCountry.name)}
                          disabled={!canBuyThis || player.gold < (COUNTRY_PRICES[selectedCountry.name] || DEFAULT_COUNTRY_PRICE)}
                          className={cn(
                            "py-4 px-2 rounded-xl transition-all relative overflow-hidden group",
                            canBuyThis ? "hover:scale-[1.05] disabled:opacity-30" : "opacity-20 cursor-not-allowed"
                          )}
                          style={{
                            background: `rgba(${parseInt(player.color.slice(1, 3), 16)}, ${parseInt(player.color.slice(3, 5), 16)}, ${parseInt(player.color.slice(5, 7), 16)}, 0.15)`,
                            border: `1px solid ${player.color}60`,
                            boxShadow: canBuyThis ? `0 0 15px ${player.color}30` : 'none'
                          }}
                        >
                          {canBuyThis && (
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                          )}
                          <div className="text-[10px] font-black uppercase tracking-tight" style={{ color: player.color }}>
                            {player.name}
                          </div>
                          <div className="text-[9px] font-bold opacity-60" style={{ color: player.color }}>
                            {canBuyThis ? 'SELECT' : 'LOCKED'}
                          </div>
                        </button>
                      );
                    })}
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
