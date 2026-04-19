import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Flag, X } from 'lucide-react';
import { Player, CountryState } from '../types';
import { COUNTRY_PRICES, DEFAULT_COUNTRY_PRICE, BUILDING_TIERS } from '../constants';

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

  return (
    <motion.div
      key="territories"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="panel"
      style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 className="panel-title">점령 현황 관리</h2>
          <button
            onClick={onHealGhosts}
            style={{
              padding: '4px 12px', borderRadius: 8,
              background: 'rgba(255,90,110,0.08)', border: '1px solid rgba(255,90,110,0.15)',
              color: 'var(--danger)', fontSize: 11, fontWeight: 700, cursor: 'pointer'
            }}
          >
            🧹 유령 청소
          </button>
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)' }}>
          {occupiedCountries.length}개 점령 중
        </span>
      </div>

      <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {occupiedCountries.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', color: 'var(--text3)' }}>
            <Flag style={{ width: 40, height: 40, opacity: 0.2, marginBottom: 12 }} />
            <p style={{ fontSize: 13, fontWeight: 600 }}>현재 점령된 나라가 없습니다.</p>
          </div>
        ) : (
          players.map(player => {
            const ownedList = Object.values(countries).filter(c => c.ownerId === player.id);
            if (ownedList.length === 0) return null;

            return (
              <div key={player.id} style={{ background: 'var(--surface2)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', borderBottom: '1px solid var(--border)',
                  background: `${player.color}10`
                }}>
                  <img src={player.characterUrl} alt={player.name} style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${player.color}`, background: 'var(--bg)', padding: 2 }} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: player.color, textTransform: 'uppercase', letterSpacing: '-0.3px' }}>{player.name}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: 'var(--text3)', background: 'var(--surface)', padding: '2px 8px', borderRadius: 99, border: '1px solid var(--border)' }}>
                    {ownedList.length}개
                  </span>
                </div>

                {ownedList.map(country => {
                  const buildingLabel = country.buildings === 0 ? '센터 없음' : BUILDING_TIERS[country.buildings - 1].name;
                  const refundGold = COUNTRY_PRICES[country.id] || DEFAULT_COUNTRY_PRICE;
                  const isConfirming = cancelConfirmId === country.id;

                  return (
                    <div key={country.id} className="territory-row" style={{ background: isConfirming ? 'rgba(255,90,110,0.05)' : undefined }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '-0.3px' }}>
                          {country.id}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)' }}>{buildingLabel}</span>
                          <span style={{ fontSize: 10, color: 'var(--border2)' }}>·</span>
                          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--gold)' }}>환불 {refundGold}G</span>
                        </div>
                      </div>

                      {isConfirming ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn-confirm" onClick={() => { onCancel(country.id); setCancelConfirmId(null); }}>확인</button>
                          <button className="btn-cancel" onClick={() => setCancelConfirmId(null)}>취소</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 6 }}>
                          {country.buildings > 0 && (
                            <button className="btn-danger" onClick={() => onCancelBuilding(country.id)} style={{ fontSize: 10 }}>
                              🏚️ 건물 -1
                            </button>
                          )}
                          <button className="btn-danger" onClick={() => setCancelConfirmId(country.id)}>
                            <X style={{ width: 12, height: 12 }} /> 취소
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
