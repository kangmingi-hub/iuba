import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Flag, X, MapPin, Layers } from 'lucide-react';
import { Player, CountryState } from '../types';
import { COUNTRY_PRICES, DEFAULT_COUNTRY_PRICE, BUILDING_TIERS } from '../constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

interface Props {
  players: Player[];
  countries: Record<string, CountryState>;
  onCancel: (countryId: string) => void;
  onCancelBuilding: (countryId: string) => void;
  onHealGhosts: () => void;
}

export default function TerritoriesPanel({ players, countries, onCancel, onCancelBuilding, onHealGhosts }: Props) {
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const occupiedCountries = Object.values(countries).filter(c => c.ownerId);

  const handleCancel = (countryId: string) => {
    onCancel(countryId);
    setCancelConfirmId(null);
  };

  const handleCancelBuilding = (countryId: string) => {
    onCancelBuilding(countryId);
  };

  return (
    <motion.div
      key="territories"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="sleek-card flex flex-col"
    >
      <div className="sleek-panel-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h2 className="sleek-panel-title">TERRITORY CONTROL</h2>
          <button type="button" onClick={onHealGhosts}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-black rounded-lg transition-colors"
            style={{
              background: 'rgba(255, 100, 100, 0.15)',
              border: '1px solid rgba(255, 100, 100, 0.4)',
              color: '#ff6b6b'
            }}>
            유령 영토 청소
          </button>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest font-mono"
          style={{ color: 'rgba(0, 255, 255, 0.5)' }}>
          총 {occupiedCountries.length}개 점령 중
        </span>
      </div>

      <div className="p-6 overflow-y-auto custom-scrollbar max-h-[calc(100vh-280px)]">
        {occupiedCountries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20" style={{ color: 'rgba(0, 255, 255, 0.4)' }}>
            <Flag className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-bold font-mono">// NO TERRITORIES OCCUPIED //</p>
          </div>
        ) : (
          <div className="space-y-5">
            {players.map(player => {
              const ownedList = Object.values(countries).filter(c => c.ownerId === player.id);
              if (ownedList.length === 0) return null;

              return (
                <div key={player.id} className="rounded-xl overflow-hidden"
                  style={{
                    background: 'rgba(15, 25, 45, 0.6)',
                    border: `1px solid ${player.color}40`
                  }}>
                  <div className="flex items-center gap-3 px-5 py-3"
                    style={{ 
                      background: `linear-gradient(90deg, ${player.color}20, transparent)`,
                      borderBottom: `1px solid ${player.color}30`
                    }}>
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full blur-md opacity-50"
                        style={{ backgroundColor: player.color }} />
                      <img src={player.characterUrl} alt={player.name} 
                        className="relative w-8 h-8 rounded-full border-2 p-0.5"
                        style={{ borderColor: player.color, backgroundColor: '#0a1428' }} />
                    </div>
                    <span className="font-black text-sm uppercase tracking-tight"
                      style={{ color: player.color, fontFamily: 'Orbitron, sans-serif' }}>
                      {player.name}
                    </span>
                    <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full font-mono"
                      style={{
                        background: `${player.color}20`,
                        border: `1px solid ${player.color}40`,
                        color: player.color
                      }}>
                      {ownedList.length} SECTORS
                    </span>
                  </div>
                  <div>
                    {ownedList.map((country, idx) => {
                      const buildingLabel = country.buildings === 0 ? '센터 없음' : BUILDING_TIERS[country.buildings - 1].name;
                      const refundGold = COUNTRY_PRICES[country.id] || DEFAULT_COUNTRY_PRICE;
                      const isConfirming = cancelConfirmId === country.id;

                      return (
                        <div key={country.id} 
                          className={cn("flex items-center gap-4 px-5 py-3.5 transition-colors")}
                          style={{
                            background: isConfirming ? 'rgba(255, 100, 100, 0.1)' : 'transparent',
                            borderTop: idx > 0 ? '1px solid rgba(0, 255, 255, 0.1)' : 'none'
                          }}>
                          <MapPin className="w-4 h-4" style={{ color: 'rgba(0, 255, 255, 0.4)' }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black truncate uppercase tracking-tight"
                              style={{ color: '#e0ffff' }}>
                              {country.id}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-bold" style={{ color: 'rgba(0, 200, 255, 0.6)' }}>
                                {buildingLabel}
                              </span>
                              <span style={{ color: 'rgba(0, 255, 255, 0.2)' }}>|</span>
                              <span className="text-[10px] font-bold" style={{ color: '#ffc832' }}>
                                환불 {refundGold}G
                              </span>
                            </div>
                          </div>
                          {isConfirming ? (
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleCancel(country.id)} 
                                className="px-3 py-1.5 text-[11px] font-black rounded-lg"
                                style={{
                                  background: 'rgba(255, 100, 100, 0.3)',
                                  border: '1px solid rgba(255, 100, 100, 0.5)',
                                  color: '#ff6b6b'
                                }}>
                                확인
                              </button>
                              <button onClick={() => setCancelConfirmId(null)} 
                                className="px-3 py-1.5 text-[11px] font-black rounded-lg"
                                style={{
                                  background: 'rgba(0, 255, 255, 0.1)',
                                  border: '1px solid rgba(0, 255, 255, 0.3)',
                                  color: 'rgba(0, 255, 255, 0.7)'
                                }}>
                                취소
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              {country.buildings > 0 && (
                                <button onClick={() => handleCancelBuilding(country.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black rounded-lg transition-all"
                                  style={{
                                    background: 'rgba(255, 200, 50, 0.1)',
                                    border: '1px solid rgba(255, 200, 50, 0.3)',
                                    color: '#ffc832'
                                  }}>
                                  건물 -1
                                </button>
                              )}
                              <button onClick={() => setCancelConfirmId(country.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black rounded-lg transition-all"
                                style={{
                                  background: 'rgba(255, 100, 100, 0.1)',
                                  border: '1px solid rgba(255, 100, 100, 0.3)',
                                  color: '#ff6b6b'
                                }}>
                                <X className="w-3 h-3" /> 점령 취소
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
