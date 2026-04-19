import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Coins, Building2, PlusCircle, Lock } from 'lucide-react';
import { Player, CountryState, User } from '../types';
import { COUNTRY_PRICES, DEFAULT_COUNTRY_PRICE, CLUB_IMAGES, getBuildingTiers } from '../constants';

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
  const tiers = getBuildingTiers(selectedCountry.name);
  const ownerPlayer = players.find(p => p.id === ownedCountry?.ownerId);

  return (
    <AnimatePresence>
      {selectedCountry && (
        <div className="modal-overlay" onClick={onClose}>
          <motion.div
            className="modal-card"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="modal-header">
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>
                  Territory Briefing
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.5px' }}>
                  {selectedCountry.name}
                </h3>
              </div>
              <button className="close-btn" onClick={onClose}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            {/* 본문 */}
            <div style={{ padding: '24px 28px' }}>
              {/* 비용 정보 */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <div style={{ flex: 1, padding: '12px 16px', background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.15)', borderRadius: 12 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Coins style={{ width: 10, height: 10 }} /> Conquer Cost
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--gold2)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {COUNTRY_PRICES[selectedCountry.name] || DEFAULT_COUNTRY_PRICE}
                    <span style={{ fontSize: 12, opacity: 0.6 }}>G</span>
                  </div>
                </div>
                <div style={{ flex: 1, padding: '12px 16px', background: 'rgba(79,125,255,0.08)', border: '1px solid rgba(79,125,255,0.15)', borderRadius: 12 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Building2 style={{ width: 10, height: 10 }} /> Center Cost
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--accent2)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {(() => {
                      const buildings = ownedCountry?.buildings || 0;
                      if (buildings >= 3) return 'MAX';
                      return tiers[buildings].cost;
                    })()}
                    <span style={{ fontSize: 12, opacity: 0.6 }}>P</span>
                  </div>
                </div>
              </div>

              {ownedCountry?.ownerId ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* 점령자 정보 */}
                  <div style={{ padding: '20px', background: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={CLUB_IMAGES?.[ownerPlayer?.name || ''] || ownerPlayer?.characterUrl || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                        alt=""
                        style={{ width: 56, height: 56, borderRadius: '50%', border: `3px solid ${ownerPlayer?.color || 'var(--accent)'}`, background: 'var(--bg)', objectFit: 'cover' }}
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'; }}
                      />
                      {ownedCountry.buildings > 0 && (
                        <div style={{
                          position: 'absolute', top: -6, right: -6,
                          background: 'var(--accent)', color: 'white',
                          fontSize: 9, fontWeight: 800, width: 20, height: 20,
                          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '2px solid var(--surface)'
                        }}>
                          {ownedCountry.buildings}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>점령 중</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: ownerPlayer?.color || 'var(--accent2)', letterSpacing: '-0.3px' }}>
                        {ownerPlayer?.name}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>센터</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>
                        {ownedCountry.buildings === 0 ? '없음' : tiers[ownedCountry.buildings - 1].name}
                      </div>
                    </div>
                  </div>

                  {canBuild ? (
                    <button
                      onClick={() => onBuild(selectedCountry.id)}
                      disabled={ownedCountry.buildings >= 3}
                      className="btn-primary"
                      style={{ borderRadius: 14, padding: '16px', fontSize: 14 }}
                    >
                      <PlusCircle style={{ width: 18, height: 18 }} />
                      {ownedCountry.buildings >= 3 ? '모든 건설 완료' : `${tiers[ownedCountry.buildings].name} 건설`}
                    </button>
                  ) : (
                    <div style={{
                      padding: '16px', borderRadius: 14,
                      background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      color: 'var(--text3)', fontSize: 12, fontWeight: 600
                    }}>
                      <Lock style={{ width: 14, height: 14 }} />
                      본인 동아리 영토만 건설 가능합니다
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{
                    padding: '14px', borderRadius: 12,
                    background: 'rgba(79,125,255,0.06)', border: '1px solid rgba(79,125,255,0.15)',
                    color: 'var(--accent2)', fontSize: 12, fontWeight: 500, textAlign: 'center', fontStyle: 'italic'
                  }}>
                    본 영토는 현재 미점유 상태입니다. 점수를 사용하여 선교 지경을 넓히십시오.
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {players.map(player => {
                      const canBuyThis = isAdmin || player.id === myPlayer?.id;
                      const price = COUNTRY_PRICES[selectedCountry.name] || DEFAULT_COUNTRY_PRICE;
                      return (
                        <button
                          key={player.id}
                          className="country-player-btn"
                          onClick={() => canBuyThis && onBuy(selectedCountry.id, player.id, selectedCountry.name)}
                          disabled={!canBuyThis || player.gold < price}
                          style={{ borderColor: canBuyThis ? `${player.color}44` : 'var(--border)', color: player.color }}
                        >
                          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.3px' }}>
                            {player.name}
                          </div>
                          <div style={{ fontSize: 9, fontWeight: 600, opacity: 0.5, marginTop: 2 }}>
                            {canBuyThis ? `${player.gold.toLocaleString()}P` : 'LOCKED'}
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
