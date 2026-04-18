/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Coins, 
  Building2, 
  Users, 
  Map as MapIcon, 
  PlusCircle, 
  History,
  TrendingUp,
  X,
  ShieldCheck,
  Sword,
  UserPlus,
  LogIn,
  LogOut,
  User as UserIcon,
  Trash2,
  MapPin,
  RefreshCcw,
  Flag,
  AlertCircle
} from 'lucide-react';
import WorldMap from './components/WorldMap';
import { Player, CountryState, GameState, GameLog, User, TEAM_COLORS } from './types';
import { INITIAL_TEAMS, COUNTRY_PRICES, DEFAULT_COUNTRY_PRICE, BUILDING_TIERS, CHARACTER_SEEDS } from './constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from './lib/supabase';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const STORAGE_KEY = 'kingdom_conquerors_save';
const AUTH_KEY = 'kingdom_conquerors_auth';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : null;
    return {
      players: (parsed?.players || INITIAL_TEAMS).filter((p: any) => 
        !['A to Z', 'TOY', 'Blossom', 'Evergreen', 'The First', 'Perlfect', 'EBS', 'YITC', 'BPM'].includes(p.name) &&
        !/^team-\d+$/.test(p.id) &&
        !/^\d+팀$/.test(p.name)
      ),
      countries: parsed?.countries || {},
      logs: parsed?.logs || [{
        id: 'start',
        timestamp: Date.now(),
        message: '새로운 선교 원정이 시작되었습니다!',
        type: 'purchase' as any
      }],
      users: parsed?.users || [
        { id: 'admin-1', username: 'admin', role: 'admin' }
      ]
    };
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(AUTH_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [loginUsername, setLoginUsername] = useState('');
  const [newMemberName, setNewMemberName] = useState('');

  const [selectedCountry, setSelectedCountry] = useState<{ id: string; name: string } | null>(null);
  // 'map' | 'admin' | 'logs' | 'members' | 'territories'
  const [activeTab, setActiveTab] = useState<'map' | 'admin' | 'logs' | 'members' | 'territories'>('map');
  const [adminPlayerId, setAdminPlayerId] = useState('');
  const [adminValue, setAdminValue] = useState<number>(0);
  const [adminType, setAdminType] = useState<'evangelism' | 'speech'>('evangelism');

  const [clubPoints, setClubPoints] = useState<{ 
    club_name: string; 
    remaining_evangelism_points: number; 
    remaining_speech_points: number; 
  }[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // 취소 확인 중인 나라 ID
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);

  const fetchClubPoints = async () => {
  setIsSyncing(true);
  try {
    const { data, error } = await supabase
      .from('team_wallet_view')
      .select('*')
      .order('club_name', { ascending: true });

    if (error) throw error;
    if (data) {
      setClubPoints(data);
      
      setGameState(prev => {
        const playersMap = new Map(prev.players.map(p => [p.name, p]));
        
        const updatedPlayers = (data as any[]).map((club, idx) => {
          const existing = playersMap.get(club.club_name);
          return existing
            ? { ...existing, gold: club.remaining_evangelism_points, buildingPower: club.remaining_speech_points }
            : {
                id: `club-${Math.random().toString(36).substr(2, 5)}`,
                name: club.club_name,
                color: TEAM_COLORS[(prev.players.length + idx) % TEAM_COLORS.length],
                characterUrl: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${club.club_name}`,
                gold: club.remaining_evangelism_points,
                buildingPower: club.remaining_speech_points
              };
        });

        // ✅ 추가: Supabase 동아리 이름으로 users 목록도 동기화
        const existingAdmins = prev.users.filter(u => u.role === 'admin');
        const clubUsers = updatedPlayers.map(p => ({
          id: p.id,
          username: p.name,
          role: 'member' as const
        }));
        const mergedUsers = [
          ...existingAdmins,
          ...clubUsers.filter(cu => !existingAdmins.find(a => a.username === cu.username))
        ];

        return {
          ...prev,
          players: updatedPlayers,
          users: mergedUsers  // ✅ users도 업데이트
        };
      });
    }
  } catch (err) {
    console.error('Supabase fetch error:', err);
  } finally {
    setIsSyncing(false);
  }
};
  useEffect(() => {
    fetchClubPoints();
  }, []);

  useEffect(() => {
    if (!adminPlayerId && gameState.players.length > 0) {
      setAdminPlayerId(gameState.players[0].id);
    }
  }, [gameState.players]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }, [currentUser]);

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!loginUsername.trim()) return;

  // 1. admin 확인
  const adminUser = gameState.users.find(
    u => u.username === loginUsername && u.role === 'admin'
  );
  if (adminUser) {
    setCurrentUser(adminUser);
    setLoginUsername('');
    return;
  }

  // 2. Supabase에서 직접 조회
  try {
    const { data, error } = await supabase
      .from('team_wallet_view')
      .select('*')
      .eq('club_name', loginUsername)
      .single();

    if (error || !data) {
      alert('등록되지 않은 이름입니다. 관리자에게 문의하세요.');
      return;
    }

    const player = gameState.players.find(p => p.name === loginUsername);
    setCurrentUser({
      id: player?.id || `club-${loginUsername}`,
      username: loginUsername,
      role: 'member'
    });
    setLoginUsername('');

  } catch (err) {
    alert('등록되지 않은 이름입니다. 관리자에게 문의하세요.');
  }
};
  
  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('map');
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName) return;

    const playerId = Math.random().toString(36).substr(2, 9);
    
    const newUser: User = {
      id: playerId,
      username: newMemberName,
      role: 'member'
    };

    const newPlayer: Player = {
      id: playerId,
      name: newMemberName,
      color: TEAM_COLORS[gameState.players.length % TEAM_COLORS.length],
      characterUrl: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${CHARACTER_SEEDS[gameState.players.length % CHARACTER_SEEDS.length]}`,
      gold: 0,
      buildingPower: 0
    };

    setGameState(prev => ({
      ...prev,
      users: [...prev.users, newUser],
      players: [...prev.players, newPlayer]
    }));
    setNewMemberName('');
  };

  const handleDeleteMember = (playerId: string) => {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return;

    setGameState(prev => {
      const updatedCountries = { ...prev.countries };
      Object.keys(updatedCountries).forEach(countryId => {
        if (updatedCountries[countryId].ownerId === playerId) {
          delete updatedCountries[countryId]; 
        }
      });

      return {
        ...prev,
        users: prev.users.filter(u => u.id !== playerId),
        players: prev.players.filter(p => p.id !== playerId),
        countries: updatedCountries
      };
    });
    
    if (adminPlayerId === playerId) {
      setAdminPlayerId('');
    }

    addLog(`${player.name} 대원이 삭제되었습니다.`, 'purchase' as any);
  };

  const addLog = (message: string, type: GameLog['type']) => {
    const newLog: GameLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      message,
      type
    };
    setGameState(prev => ({
      ...prev,
      logs: [newLog, ...prev.logs].slice(0, 50)
    }));
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminValue <= 0 || !adminPlayerId) return;

    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => {
        if (p.id === adminPlayerId) {
          return {
            ...p,
            gold: adminType === 'evangelism' ? p.gold + adminValue : p.gold,
            buildingPower: adminType === 'speech' ? p.buildingPower + adminValue : p.buildingPower
          };
        }
        return p;
      })
    }));

    const player = gameState.players.find(p => p.id === adminPlayerId);
    addLog(
      `${player?.name}님이 ${adminType === 'evangelism' ? '전도' : '발표'} 점수 ${adminValue}점을 획득했습니다.`,
      adminType
    );
    setAdminValue(0);
  };

// ✨ 점령 취소 핸들러 (삭제 안 하고 깨끗하게 다시 만드는 버전)
  const handleCancelOccupation = (countryId: string) => {
    let targetOwnerName = "";
    let targetCountryName = "";
    let targetRefundGold = 0;

    setGameState(prev => {
      // 1. 삭제 대상(countryId)을 제외하고 담을 완전 새로운 빈 객체 준비
      const cleanCountries: Record<string, any> = {};
      let targetOwnerId = "";

      Object.entries(prev.countries).forEach(([key, country]) => {
        // 취소하려는 나라이거나, 이름/ID가 조금이라도 겹치는 유령 데이터라면 담지 않고 버립니다!
        if (key === countryId || country.id === countryId || country.name === countryId) {
          targetOwnerId = country.ownerId;
          targetCountryName = country.name || country.id;
          targetRefundGold = COUNTRY_PRICES[country.name] || COUNTRY_PRICES[country.id] || DEFAULT_COUNTRY_PRICE;
        } else {
          // 삭제 대상이 아닌 정상적인 점령지만 새 객체에 옮겨 담습니다.
          cleanCountries[key] = country;
        }
      });

      // 2. 환불할 골드 지급
      const updatedPlayers = prev.players.map(p => {
        if (p.id === targetOwnerId) {
          targetOwnerName = p.name;
          return { ...p, gold: p.gold + targetRefundGold };
        }
        return p;
      });

      // 3. 활동 기록 추가
      const newLog = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        message: `관리자가 ${targetOwnerName || '대원'}의 ${targetCountryName || countryId} 점령을 강제 취소했습니다. (${targetRefundGold}G 환불)`,
        type: 'purchase' as any
      };

      // 4. 새로운 객체로 기존 상태를 완전히 덮어씌움
      return {
        ...prev,
        countries: cleanCountries,
        players: updatedPlayers,
        logs: [newLog, ...prev.logs].slice(0, 50)
      };
    });

    setCancelConfirmId(null);
  };

  // 🧹 유령 데이터 정밀 청소 함수 (멤버/점수 절대 유지)
  const healGhostData = () => {
    setGameState(prev => {
      const cleanCountries: Record<string, CountryState> = {};
      const seenIds = new Set<string>();
      let removedCount = 0;

      // 현재 존재하는 정상적인 플레이어 ID 목록
      const validPlayerIds = new Set(prev.players.map(p => p.id));

      Object.entries(prev.countries).forEach(([key, country]) => {
        // 조건 1: 주인이 삭제된 플레이어인가? (고아 데이터)
        const isOwnerValid = validPlayerIds.has(country.ownerId);
        // 조건 2: 이미 동일한 나라 ID가 존재하는가? (중복 복제 데이터)
        const isDuplicate = seenIds.has(country.id);

        if (isOwnerValid && !isDuplicate) {
          // 정상 데이터만 새 객체에 보존
          cleanCountries[key] = country;
          seenIds.add(country.id);
        } else {
          // 불량 데이터는 버려짐
          removedCount++;
        }
      });

      if (removedCount > 0) {
        alert(`치료 완료: ${removedCount}개의 유령 데이터가 안전하게 삭제되었습니다! (점수와 명단은 유지됨)`);
      } else {
        alert('발견된 유령 데이터가 없습니다.');
      }

      return {
        ...prev,
        countries: cleanCountries
      };
    });
  };

  const buyCountry = (countryId: string, playerId: string) => {
    const player = gameState.players.find(p => p.id === playerId);
    const price = COUNTRY_PRICES[countryId] || DEFAULT_COUNTRY_PRICE;

    if (!player || player.gold < price) {
      alert('금화가 부족합니다!');
      return;
    }

    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => p.id === playerId ? { ...p, gold: p.gold - price } : p),
      countries: {
        ...prev.countries,
        // ✨ 선택된 나라의 진짜 이름(selectedCountry.name)을 저장하도록 수정했습니다.
        [countryId]: { 
          id: countryId, 
          name: selectedCountry?.name || countryId, 
          ownerId: playerId, 
          buildings: 0 
        }
      }
    }));

    addLog(`${player.name}님이 ${selectedCountry?.name || countryId}를 ${price}G에 점령했습니다!`, 'purchase');
    setSelectedCountry(null);
  };

  const buildInCountry = (countryId: string) => {
    const country = gameState.countries[countryId];
    if (!country?.ownerId) return;

    if (country.buildings >= 3) return;

    const nextTier = BUILDING_TIERS[country.buildings];
    const player = gameState.players.find(p => p.id === country.ownerId);

    if (!player || player.buildingPower < nextTier.cost) return;

    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => p.id === player.id ? { ...p, buildingPower: p.buildingPower - nextTier.cost } : p),
      countries: {
        ...prev.countries,
        [countryId]: { ...country, buildings: country.buildings + 1 }
      }
    }));

    addLog(`${player.name}님이 ${countryId}에 '${nextTier.name}'(을)를 건축했습니다!`, 'construction');
  };

  const resetGame = () => {
    if (window.confirm('정말 모든 데이터를 초기화하시겠습니까? (멤버는 유지됩니다)')) {
      setGameState(prev => ({
        ...prev,
        players: prev.players.map(p => ({ ...p, gold: 0, buildingPower: 0 })),
        countries: {},
        logs: [{
          id: 'reset',
          timestamp: Date.now(),
          message: '게임 데이터가 초기화되었습니다.',
          type: 'purchase' as any
        }]
      }));
    }
  };

  // 점령된 나라 목록 (동아리별 그룹)
  const occupiedCountries = Object.values(gameState.countries as Record<string, CountryState>)
    .filter(c => c.ownerId);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans p-4 md:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-md">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#1E293B]">
              📍 IUBA경상대 <span className="text-blue-600 font-normal">센터 땅따먹기</span>
            </h1>
            <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-widest">하나님 나라의 확장과 선교 미션</p>
          </div>
        </div>

        <div className="flex bg-[#F8FAFC] border border-[#E2E8F0] p-1 rounded-xl flex-wrap gap-1">
          <button 
            onClick={() => setActiveTab('map')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-semibold",
              activeTab === 'map' ? "bg-white text-blue-600 shadow-sm border border-[#E2E8F0]" : "text-[#64748B] hover:text-[#1E293B]"
            )}
          >
            <MapIcon className="w-4 h-4" /> 지도
          </button>
          {currentUser?.role === 'admin' && (
            <>
              <button 
                onClick={() => setActiveTab('admin')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-semibold",
                  activeTab === 'admin' ? "bg-white text-blue-600 shadow-sm border border-[#E2E8F0]" : "text-[#64748B] hover:text-[#1E293B]"
                )}
              >
                <PlusCircle className="w-4 h-4" /> 입력
              </button>
              {/* ✨ 새 탭: 점령 관리 */}
              <button 
                onClick={() => setActiveTab('territories')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-semibold",
                  activeTab === 'territories' ? "bg-white text-red-500 shadow-sm border border-[#E2E8F0]" : "text-[#64748B] hover:text-[#1E293B]"
                )}
              >
                <Flag className="w-4 h-4" /> 점령관리
                {occupiedCountries.length > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-[9px] font-black rounded-full px-1.5 py-0.5 leading-none">
                    {occupiedCountries.length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('members')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-semibold",
                  activeTab === 'members' ? "bg-white text-blue-600 shadow-sm border border-[#E2E8F0]" : "text-[#64748B] hover:text-[#1E293B]"
                )}
              >
                <UserPlus className="w-4 h-4" /> 멤버
              </button>
            </>
          )}
          <button 
            onClick={() => setActiveTab('logs')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-semibold",
              activeTab === 'logs' ? "bg-white text-blue-600 shadow-sm border border-[#E2E8F0]" : "text-[#64748B] hover:text-[#1E293B]"
            )}
          >
            <History className="w-4 h-4" /> 기록
          </button>
        </div>

        <div className="flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-3 pl-4 border-l border-[#E2E8F0]">
              <div className="text-right hidden md:block">
                <p className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-widest leading-none mb-1">Authenticated</p>
                <p className="text-sm font-black text-[#1E293B]">{currentUser.username}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 transition-colors"
                title="로그아웃"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setActiveTab('map')} 
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" /> 로그인하여 참여
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Stats & Leaderboard (4 cols) */}
        <section className="lg:col-span-4 space-y-6">
          <div className="sleek-card flex flex-col h-full overflow-hidden">
            <div className="sleek-panel-header flex justify-between items-center">
              <h2 className="sleek-panel-title">동아리 포인트 현황</h2>
              <button 
                onClick={fetchClubPoints} 
                disabled={isSyncing}
                className={cn("p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400", isSyncing && "animate-spin")}
              >
                <RefreshCcw className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="team-list p-4 space-y-3 custom-scrollbar overflow-y-auto max-h-[calc(100vh-320px)]">
              {clubPoints.length === 0 && !isSyncing && (
                <div className="text-center py-10 text-slate-400">
                  <p className="text-xs">데이터를 불러올 수 없습니다.</p>
                </div>
              )}
              
              {clubPoints.map((club, idx) => {
                const player = gameState.players.find(p => p.name === club.club_name);
                const ownedCount = player ? (Object.values(gameState.countries) as CountryState[]).filter(c => c.ownerId === player.id).length : 0;
                const totalBuildings = player ? (Object.values(gameState.countries) as CountryState[])
                  .filter(c => c.ownerId === player.id)
                  .reduce((sum, c) => sum + c.buildings, 0) : 0;

                return (
                  <motion.div 
                    key={club.club_name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={cn(
                      "flex flex-col gap-2 p-3.5 rounded-2xl border border-[#E2E8F0] bg-white transition-all group hover:shadow-md hover:border-blue-100",
                      ownedCount > 0 ? "border-blue-200 bg-blue-50/10" : ""
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img 
                            src={player?.characterUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${club.club_name}`} 
                            alt={club.club_name} 
                            className="w-9 h-9 rounded-full border-2 p-0.5 bg-white shadow-sm transition-transform"
                            style={{ borderColor: player?.color || '#CBD5E1' }}
                          />
                          <div 
                            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: player?.color || '#CBD5E1' }}
                          />
                        </div>
                        <div>
                          <h3 className="font-black text-[#1E293B] text-sm uppercase tracking-tight">{club.club_name}</h3>
                          <p className="text-[9px] font-bold text-slate-400 capitalize">{ownedCount} Territories • {totalBuildings} Centers</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2 border-t border-slate-100/50">
                      <div className="flex-1 flex flex-col gap-1 bg-amber-50/50 p-2 rounded-xl border border-amber-100/50">
                        <div className="flex items-center gap-1.5 opacity-70">
                          <Users className="w-2.5 h-2.5 text-amber-500" />
                          <span className="text-[8px] font-black text-amber-600 uppercase tracking-tighter">Evangelism</span>
                        </div>
                        <div className="text-sm font-black text-amber-700 flex items-center gap-1">
                          {(player?.gold ?? club.remaining_evangelism_points).toLocaleString()}
                          <span className="text-[9px] font-bold opacity-60">P</span>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col gap-1 bg-blue-50/50 p-2 rounded-xl border border-blue-100/50">
                        <div className="flex items-center gap-1.5 opacity-70">
                          <Building2 className="w-2.5 h-2.5 text-blue-500" />
                          <span className="text-[8px] font-black text-blue-600 uppercase tracking-tighter">Speech</span>
                        </div>
                        <div className="text-sm font-black text-blue-700 flex items-center gap-1">
                          {(player?.buildingPower ?? club.remaining_speech_points).toLocaleString()}
                          <span className="text-[9px] font-bold opacity-60">P</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            <div className="mt-auto p-4 border-t border-[#E2E8F0] bg-slate-50/50">
              <button 
                onClick={resetGame}
                className="w-full py-2.5 text-[9px] font-black text-[#64748B] hover:text-red-500 transition-colors uppercase tracking-[0.2em] bg-white border border-[#E2E8F0] rounded-xl shadow-sm"
              >
                게임 지표 초기화
              </button>
            </div>
          </div>
        </section>

        {/* Right: Main View (8 cols) */}
        <section className="lg:col-span-8 min-h-[600px] flex flex-col">
          <AnimatePresence mode="wait">
            {activeTab === 'map' && (
              <motion.div 
                key="map"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1"
              >
                <WorldMap 
                  countries={gameState.countries} 
                  players={gameState.players} 
                  onCountryClick={(id, name) => setSelectedCountry({ id, name })} 
                />
              </motion.div>
            )}

            {activeTab === 'admin' && (
              <motion.div 
                key="admin"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="sleek-card flex flex-col"
              >
                <div className="sleek-panel-header">
                  <h2 className="sleek-panel-title">선교 실적 입력 센터</h2>
                </div>
                <div className="p-8 max-w-md mx-auto w-full">
                  <form onSubmit={handleAdminSubmit} className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-extrabold text-[#64748B] mb-2 uppercase tracking-widest">대원 선택</label>
                      <select 
                        value={adminPlayerId}
                        onChange={(e) => setAdminPlayerId(e.target.value)}
                        className="w-full bg-[#FAFBFF] border border-[#E2E8F0] rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                      >
                        {gameState.players.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-[#64748B] mb-2 uppercase tracking-widest">활동 항목</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setAdminType('evangelism')}
                          className={cn(
                            "py-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                            adminType === 'evangelism' 
                              ? "bg-amber-50 border-amber-500 text-amber-700 shadow-sm" 
                              : "border-[#E2E8F0] text-[#64748B] hover:border-slate-300"
                          )}
                        >
                          <Users className="w-5 h-5" />
                          <span className="text-[10px] font-bold uppercase tracking-wide">전도 (GOLD)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdminType('speech')}
                          className={cn(
                            "py-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                            adminType === 'speech' 
                              ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm" 
                              : "border-[#E2E8F0] text-[#64748B] hover:border-slate-300"
                          )}
                        >
                          <Building2 className="w-5 h-5" />
                          <span className="text-[10px] font-bold uppercase tracking-wide">발표 (POWER)</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-[#64748B] mb-2 uppercase tracking-widest">실적 점수</label>
                      <input 
                        type="number" 
                        value={adminValue || ''}
                        onChange={(e) => setAdminValue(parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full bg-[#FAFBFF] border border-[#E2E8F0] rounded-xl px-4 py-4 text-3xl font-mono text-center focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={adminValue <= 0}
                      className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-4 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                    >
                      실적 등록하기
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

           {/* ✨ 새 탭: 점령 관리 */}
            {activeTab === 'territories' && currentUser?.role === 'admin' && (
              <motion.div 
                key="territories"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="sleek-card flex flex-col"
              >
                <div className="sleek-panel-header flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="sleek-panel-title">점령 현황 관리</h2>
                    <button
                      type="button"
                      onClick={healGhostData}
                      className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 text-[10px] font-black rounded-lg transition-colors cursor-pointer"
                    >
                      🧹 유령 영토 청소
                    </button>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    총 {occupiedCountries.length}개 나라 점령 중
                  </span>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar max-h-[calc(100vh-280px)]">
                  {occupiedCountries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                      <Flag className="w-10 h-10 mb-3 opacity-30" />
                      <p className="text-sm font-bold">현재 점령된 나라가 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {gameState.players.map(player => {
                        const ownedList = Object.values(gameState.countries as Record<string, CountryState>)
                          .filter(c => c.ownerId === player.id);
                        if (ownedList.length === 0) return null;

                        return (
                          <div key={player.id} className="rounded-2xl border border-[#E2E8F0] overflow-hidden bg-white shadow-sm">
                            <div className="flex items-center gap-3 px-5 py-3 border-b border-[#E2E8F0]" style={{ backgroundColor: `${player.color}12` }}>
                              <img src={player.characterUrl} alt={player.name} className="w-8 h-8 rounded-full border-2 p-0.5 bg-white shadow-sm" style={{ borderColor: player.color }} />
                              <span className="font-black text-sm uppercase tracking-tight" style={{ color: player.color }}>{player.name}</span>
                              <span className="ml-auto text-[10px] font-bold text-slate-400 bg-white border border-[#E2E8F0] px-2 py-0.5 rounded-full">{ownedList.length}개 점령</span>
                            </div>
                            <div className="divide-y divide-[#F1F5F9]">
                              {ownedList.map(country => {
                                const buildingLabel = country.buildings === 0 ? '센터 없음' : BUILDING_TIERS[country.buildings - 1].name;
                                const refundGold = COUNTRY_PRICES[country.id] || DEFAULT_COUNTRY_PRICE;
                                const isConfirming = cancelConfirmId === country.id;
                                return (
                                  <div key={country.id} className={cn("flex items-center gap-4 px-5 py-3.5 transition-colors", isConfirming ? "bg-red-50" : "hover:bg-slate-50")}>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-black text-[#1E293B] truncate uppercase tracking-tight">{country.id}</p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] font-bold text-slate-400">{buildingLabel}</span>
                                        <span className="text-[10px] text-slate-300">|</span>
                                        <span className="text-[10px] font-bold text-amber-500">환불 {refundGold}G</span>
                                      </div>
                                    </div>
                                    {isConfirming ? (
                                      <div className="flex items-center gap-2">
                                        <button onClick={() => handleCancelOccupation(country.id)} className="px-3 py-1.5 bg-red-500 text-white text-[11px] font-black rounded-lg">확인</button>
                                        <button onClick={() => setCancelConfirmId(null)} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-[11px] font-black rounded-lg">아니오</button>
                                      </div>
                                    ) : (
                                      <button onClick={() => setCancelConfirmId(country.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 border border-red-100 rounded-lg text-[11px] font-black transition-all">
                                        <X className="w-3 h-3" /> 점령 취소
                                      </button>
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
            )}

            {activeTab === 'members' && currentUser?.role === 'admin' && (
              <motion.div 
                key="members"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="sleek-card flex flex-col"
              >
                <div className="sleek-panel-header">
                  <h2 className="sleek-panel-title">멤버 관리 시스템</h2>
                </div>
                <div className="p-8">
                  <div className="max-w-md mx-auto mb-10">
                    <p className="text-[10px] font-extrabold text-[#64748B] mb-6 uppercase tracking-widest text-center">새로운 선교대원 등록</p>
                    <form onSubmit={handleAddMember} className="space-y-4">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 mb-2 uppercase tracking-widest ml-1">이름</label>
                        <input 
                          type="text"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          placeholder="새 대원 이름 입력"
                          className="w-full bg-[#FAFBFF] border border-[#E2E8F0] rounded-xl px-6 py-4 text-lg font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black text-white shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                      >
                        <UserPlus className="w-5 h-5" /> 대원 등록하기
                      </button>
                    </form>
                  </div>

                  <div className="border-t border-[#E2E8F0] pt-8">
                    <h3 className="text-[10px] font-extrabold text-[#64748B] mb-6 uppercase tracking-widest text-center">등록된 대원 목록 ({gameState.players.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {gameState.players.map(player => (
                        <div key={player.id} className="p-4 bg-white rounded-2xl border border-[#E2E8F0] flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3">
                            <img src={player.characterUrl} className="w-10 h-10 rounded-full bg-slate-50 p-1 border border-slate-100" />
                            <div>
                              <p className="text-sm font-black text-[#1E293B] uppercase tracking-tight">{player.name}</p>
                              <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Active Member</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteMember(player.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="대원 삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'logs' && (
              <motion.div
                key="logs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="sleek-card flex flex-col"
              >
                <div className="sleek-panel-header">
                  <h2 className="sleek-panel-title">활동 기록</h2>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar max-h-[calc(100vh-280px)] space-y-3">
                  {gameState.logs.map(log => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-[#E2E8F0]">
                      <div className="mt-0.5">
                        {log.type === 'construction' ? (
                          <Building2 className="w-4 h-4 text-blue-400" />
                        ) : log.type === 'evangelism' ? (
                          <Users className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Flag className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1E293B]">{log.message}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(log.timestamp).toLocaleString('ko-KR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Login Overlay */}
      <AnimatePresence>
        {!currentUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#F8FAFC]/90 backdrop-blur-xl" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white border border-[#E2E8F0] rounded-[2.5rem] p-10 shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-500/20">
                <Sword className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-black text-[#1E293B] mb-2 uppercase tracking-tight">Mission Entry</h2>
              <p className="text-slate-500 text-sm font-medium mb-10 italic">"선교의 첫걸음은 참여로부터 시작됩니다."</p>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="text-left">
                  <label className="block text-[10px] font-extrabold text-[#64748B] mb-2 uppercase tracking-widest ml-4">사용자 식별자 (ID)</label>
                  <input 
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="성함 혹은 관리자 아이디"
                    className="w-full bg-[#FAFBFF] border border-[#E2E8F0] rounded-2xl px-6 py-4 text-lg font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300"
                  />
                  <p className="mt-3 text-[10px] text-slate-400 font-medium ml-4">기본 관리자 ID: <span className="text-blue-500 font-bold">admin</span></p>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black text-white shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest"
                >
                  원정대 함선 탑승 <LogIn className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    {/* Country Modal */}
      <AnimatePresence>
        {selectedCountry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCountry(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white border border-[#E2E8F0] rounded-[2rem] overflow-hidden shadow-2xl"
            >
              {(() => {
                const ownedCountry = gameState.countries[selectedCountry.id] || gameState.countries[selectedCountry.name];
                return (
                  <>
                    <div className="h-24 bg-[#FAFBFF] border-b border-[#E2E8F0] flex items-center px-8">
                      <div className="flex-1">
                        <span className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-widest">Territory Briefing</span>
                        <h3 className="text-2xl font-black text-[#1E293B] leading-tight uppercase">{selectedCountry.name}</h3>
                      </div>
                      <button 
                        onClick={() => setSelectedCountry(null)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                      >
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

                      {ownedCountry?.ownerId ? (
                        <div className="space-y-6">
                          <div className="p-6 bg-[#FAFBFF] rounded-2xl border border-[#E2E8F0] flex items-center justify-between shadow-sm">
                            <div>
                              <p className="text-[10px] text-[#64748B] uppercase font-bold tracking-widest mb-2">Occupying Force</p>
                              <p className="text-2xl font-black text-blue-600">
                                {gameState.players.find(p => p.id === ownedCountry.ownerId)?.name}
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
                            onClick={() => buildInCountry(selectedCountry.id)}
                            disabled={ownedCountry.buildings >= 3}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 disabled:cursor-not-allowed py-5 rounded-2xl font-black text-white shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest"
                          >
                            <PlusCircle className="w-6 h-6" /> 
                            {ownedCountry.buildings >= 3 ? '모든 건설 완료' : `${BUILDING_TIERS[ownedCountry.buildings].name} 건설`}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 italic text-[11px] text-blue-600 font-medium text-center">
                            본 영토는 현재 미점유 상태입니다. 대원의 점수를 사용하여 선교 지경을 넓히십시오.
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            {gameState.players.map(player => (
                              <button
                                type="submit"
                                key={player.id}
                                onClick={() => buyCountry(selectedCountry.id, player.id)}
                                disabled={player.gold < (COUNTRY_PRICES[selectedCountry.name] || DEFAULT_COUNTRY_PRICE)}
                                className={cn(
                                  "py-4 px-2 rounded-2xl border transition-all disabled:opacity-30 group",
                                  "hover:shadow-md hover:scale-[1.05]"
                                )}
                                style={{ 
                                  borderColor: `${player.color}44`,
                                  backgroundColor: `${player.color}05`,
                                  color: player.color
                                }}
                              >
                                <div className="text-[10px] font-black uppercase tracking-tight">{player.name}</div>
                                <div className="text-[9px] font-bold opacity-60">SELECT</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
