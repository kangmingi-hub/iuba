import { useState, useEffect } from 'react';
import { Player, CountryState, GameState, GameLog, User, TEAM_COLORS } from '../types';
import { INITIAL_TEAMS, COUNTRY_PRICES, DEFAULT_COUNTRY_PRICE, BUILDING_TIERS, CHARACTER_SEEDS } from '../constants';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'kingdom_conquerors_save';
const AUTH_KEY = 'kingdom_conquerors_auth';

export function useGameState() {
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

  const [clubPoints, setClubPoints] = useState<{
    club_name: string;
    remaining_evangelism_points: number;
    remaining_speech_points: number;
  }[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

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
          const playersMap = new Map<string, Player>(prev.players.map(p => [p.name, p]));
          const updatedPlayers = (data as any[]).map((club, idx) => {
            const existing = playersMap.get(club.club_name);
            if (existing) {
              return { ...existing, gold: club.remaining_evangelism_points, buildingPower: club.remaining_speech_points } as Player;
            }
            return {
              id: `club-${Math.random().toString(36).substr(2, 5)}`,
              name: club.club_name,
              color: TEAM_COLORS[(prev.players.length + idx) % TEAM_COLORS.length],
              characterUrl: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${club.club_name}`,
              gold: club.remaining_evangelism_points,
              buildingPower: club.remaining_speech_points
            } as Player;
          });
          return { ...prev, players: updatedPlayers };
        });
      }
    } catch (err) {
      console.error('Supabase fetch error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => { fetchClubPoints(); }, []);

  // 🟢 [추가된 부분] 1. 수파베이스 실시간 알림 구독 코드
  useEffect(() => {
    const channel = supabase
      .channel('realtime:countries')
      .on(
        'postgres_changes',
        // 주의: 수파베이스에 만들어둔 나라 정보 테이블 이름이 'countries'가 맞는지 확인해 주세요!
        { event: '*', schema: 'public', table: 'countries' }, 
        (payload) => {
          console.log('데이터베이스 변경 감지!', payload);
          // DB가 바뀌면 점수를 다시 불러와서 화면을 최신화합니다.
          fetchClubPoints();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

  const handleLogin = (username: string) => {
    if (!username.trim()) return false;
    const user = gameState.users.find(u => u.username === username);
    if (user) { setCurrentUser(user); return true; }
    const player = gameState.players.find(p => p.name === username);
    if (player) {
      setCurrentUser({ id: player.id, username: player.name, role: 'member' });
      return true;
    }
    return false;
  };

  const handleLogout = () => setCurrentUser(null);

  const handleAddMember = (name: string) => {
    if (!name) return;
    const playerId = Math.random().toString(36).substr(2, 9);
    const newUser: User = { id: playerId, username: name, role: 'member' };
    const newPlayer: Player = {
      id: playerId,
      name,
      color: TEAM_COLORS[gameState.players.length % TEAM_COLORS.length],
      characterUrl: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${CHARACTER_SEEDS[gameState.players.length % CHARACTER_SEEDS.length]}`,
      gold: 0,
      buildingPower: 0
    };
    setGameState(prev => ({ ...prev, users: [...prev.users, newUser], players: [...prev.players, newPlayer] }));
  };

  const handleDeleteMember = (playerId: string) => {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return;
    setGameState(prev => {
      const updatedCountries = { ...prev.countries };
      Object.keys(updatedCountries).forEach(id => {
        if (updatedCountries[id].ownerId === playerId) delete updatedCountries[id];
      });
      return {
        ...prev,
        users: prev.users.filter(u => u.id !== playerId),
        players: prev.players.filter(p => p.id !== playerId),
        countries: updatedCountries
      };
    });
    addLog(`${player.name} 대원이 삭제되었습니다.`, 'purchase' as any);
  };

  const handleAdminSubmit = (playerId: string, value: number, type: 'evangelism' | 'speech') => {
    if (value <= 0 || !playerId) return;
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => p.id === playerId ? {
        ...p,
        gold: type === 'evangelism' ? p.gold + value : p.gold,
        buildingPower: type === 'speech' ? p.buildingPower + value : p.buildingPower
      } : p)
    }));
    const player = gameState.players.find(p => p.id === playerId);
    addLog(`${player?.name}님이 ${type === 'evangelism' ? '전도' : '발표'} 점수 ${value}점을 획득했습니다.`, type);
  };

  const handleCancelOccupation = (countryId: string) => {
    setGameState(prev => {
      const cleanCountries: Record<string, any> = {};
      let targetOwnerId = '';
      let targetCountryName = '';
      let targetRefundGold = 0;

      Object.entries(prev.countries).forEach(([key, country]) => {
        if (key === countryId || country.id === countryId || country.name === countryId) {
          targetOwnerId = country.ownerId;
          targetCountryName = country.name || country.id;
          targetRefundGold = COUNTRY_PRICES[country.name] || COUNTRY_PRICES[country.id] || DEFAULT_COUNTRY_PRICE;
        } else {
          cleanCountries[key] = country;
        }
      });

      let targetOwnerName = '';
      const updatedPlayers = prev.players.map(p => {
        if (p.id === targetOwnerId) { targetOwnerName = p.name; return { ...p, gold: p.gold + targetRefundGold }; }
        return p;
      });

      const newLog = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        message: `관리자가 ${targetOwnerName || '대원'}의 ${targetCountryName || countryId} 점령을 강제 취소했습니다. (${targetRefundGold}G 환불)`,
        type: 'purchase' as any
      };

      return { ...prev, countries: cleanCountries, players: updatedPlayers, logs: [newLog, ...prev.logs].slice(0, 50) };
    });
  };

  const healGhostData = () => {
    setGameState(prev => {
      const cleanCountries: Record<string, CountryState> = {};
      const seenIds = new Set<string>();
      let removedCount = 0;
      const validPlayerIds = new Set(prev.players.map(p => p.id));

      Object.entries(prev.countries).forEach(([key, country]) => {
        if (validPlayerIds.has(country.ownerId) && !seenIds.has(country.id)) {
          cleanCountries[key] = country;
          seenIds.add(country.id);
        } else {
          removedCount++;
        }
      });

      if (removedCount > 0) alert(`치료 완료: ${removedCount}개의 유령 데이터가 삭제되었습니다!`);
      else alert('발견된 유령 데이터가 없습니다.');

      return { ...prev, countries: cleanCountries };
    });
  };

  // 🟢 [수정된 부분] 2. 수파베이스(DB)에 저장하는 기능 추가
  const buyCountry = async (countryId: string, playerId: string, countryName: string) => {
    const player = gameState.players.find(p => p.id === playerId);
    const price = COUNTRY_PRICES[countryName] || DEFAULT_COUNTRY_PRICE;
    
    if (!player || player.gold < price) { 
      alert('금화가 부족합니다!'); 
      return; 
    }

    // 1. 내 화면 즉시 업데이트
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => p.id === playerId ? { ...p, gold: p.gold - price } : p),
      countries: { ...prev.countries, [countryId]: { id: countryId, name: countryName, ownerId: playerId, buildings: 0 } }
    }));
    addLog(`${player.name}님이 ${countryName}를 ${price}G에 점령했습니다!`, 'purchase');

    // 2. 수파베이스(DB)에 데이터 전송 (테이블 이름 확인 필요!)
    try {
      const { error } = await supabase
        .from('country_purchases')
        .upsert({ 
          id: countryId, 
          name: countryName, 
          owner_id: playerId, 
          buildings: 0 
        });

      if (error) {
        console.error('나라 구매 DB 저장 실패:', error);
      }
    } catch (err) {
      console.error('에러 발생:', err);
    }
  };

  const buildInCountry = (countryId: string) => {
    const country = gameState.countries[countryId];
    if (!country?.ownerId || country.buildings >= 3) return;
    const nextTier = BUILDING_TIERS[country.buildings];
    const player = gameState.players.find(p => p.id === country.ownerId);
    if (!player || player.buildingPower < nextTier.cost) return;

    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => p.id === player.id ? { ...p, buildingPower: p.buildingPower - nextTier.cost } : p),
      countries: { ...prev.countries, [countryId]: { ...country, buildings: country.buildings + 1 } }
    }));
    addLog(`${player.name}님이 ${countryId}에 '${nextTier.name}'(을)를 건축했습니다!`, 'construction');
  };

  const resetGame = () => {
    if (window.confirm('정말 모든 데이터를 초기화하시겠습니까? (멤버는 유지됩니다)')) {
      setGameState(prev => ({
        ...prev,
        players: prev.players.map(p => ({ ...p, gold: 0, buildingPower: 0 })),
        countries: {},
        logs: [{ id: 'reset', timestamp: Date.now(), message: '게임 데이터가 초기화되었습니다.', type: 'purchase' as any }]
      }));
    }
  };

  return {
    gameState, currentUser, clubPoints, isSyncing,
    fetchClubPoints, handleLogin, handleLogout,
    handleAddMember, handleDeleteMember, handleAdminSubmit,
    handleCancelOccupation, healGhostData, buyCountry, buildInCountry, resetGame
  };
}
