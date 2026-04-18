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
      countries: {},
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

  // ✅ Supabase에서 점령 현황 불러오기
  const fetchOccupations = async () => {
    try {
      const { data, error } = await supabase.from('country_occupations').select('*');
      if (error) throw error;
      if (data) {
        const countries: Record<string, CountryState> = {};
        (data as any[]).forEach(row => {
          countries[row.country_id] = {
            id: row.country_id,
            name: row.country_name,
            ownerId: row.owner_id,
            buildings: row.buildings || 0
          };
        });
        setGameState(prev => ({ ...prev, countries }));
      }
    } catch (err) {
      console.error('점령 현황 불러오기 오류:', err);
    }
  };

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

      useEffect(() => {
        fetchClubPoints();
        fetchOccupations();
      
        // ✅ Realtime 구독
        const channel = supabase
          .channel('country_occupations_changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'country_occupations' },
            () => {
              fetchOccupations();
            }
          )
          .subscribe();
      
        return () => {
          supabase.removeChannel(channel);
        };
      }, []);

useEffect(() => {
  const { countries, ...rest } = gameState;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
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

  // ✅ 점령 취소 - Supabase에서도 삭제
  const handleCancelOccupation = async (countryId: string) => {
    const country = gameState.countries[countryId];
    if (!country) return;

    const refundGold = COUNTRY_PRICES[country.name] || COUNTRY_PRICES[country.id] || DEFAULT_COUNTRY_PRICE;
    const player = gameState.players.find(p => p.id === country.ownerId);

    await supabase.from('country_occupations').delete().eq('country_id', countryId);

    setGameState(prev => {
      const cleanCountries = { ...prev.countries };
      delete cleanCountries[countryId];
      const updatedPlayers = prev.players.map(p =>
        p.id === country.ownerId ? { ...p, gold: p.gold + refundGold } : p
      );
      const newLog = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        message: `관리자가 ${player?.name || '대원'}의 ${country.name} 점령을 강제 취소했습니다. (${refundGold}G 환불)`,
        type: 'purchase' as any
      };
      return { ...prev, countries: cleanCountries, players: updatedPlayers, logs: [newLog, ...prev.logs].slice(0, 50) };
    });
  };

  const healGhostData = async () => {
    const validPlayerIds = new Set(gameState.players.map(p => p.id));
    const ghostIds = Object.entries(gameState.countries)
      .filter(([_, country]) => !validPlayerIds.has(country.ownerId))
      .map(([key]) => key);

    if (ghostIds.length > 0) {
      for (const id of ghostIds) {
        await supabase.from('country_occupations').delete().eq('country_id', id);
      }
      setGameState(prev => {
        const cleanCountries = { ...prev.countries };
        ghostIds.forEach(id => delete cleanCountries[id]);
        return { ...prev, countries: cleanCountries };
      });
      alert(`치료 완료: ${ghostIds.length}개의 유령 데이터가 삭제되었습니다!`);
    } else {
      alert('발견된 유령 데이터가 없습니다.');
    }
  };

  // ✅ 나라 점령 - Supabase에 저장
  const buyCountry = async (countryId: string, playerId: string, countryName: string) => {
    const player = gameState.players.find(p => p.id === playerId);
    const price = COUNTRY_PRICES[countryName] || DEFAULT_COUNTRY_PRICE;
    if (!player || player.gold < price) { alert('금화가 부족합니다!'); return; }

    await supabase.from('country_occupations').upsert({
      country_id: countryId,
      country_name: countryName,
      owner_id: playerId,
      owner_name: player.name,
      buildings: 0
    });

    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => p.id === playerId ? { ...p, gold: p.gold - price } : p),
      countries: { ...prev.countries, [countryId]: { id: countryId, name: countryName, ownerId: playerId, buildings: 0 } }
    }));
    addLog(`${player.name}님이 ${countryName}를 ${price}G에 점령했습니다!`, 'purchase');
  };

  // ✅ 건물 건설 - Supabase 업데이트
  const buildInCountry = async (countryId: string) => {
    const country = gameState.countries[countryId];
    if (!country?.ownerId || country.buildings >= 3) return;
    const nextTier = BUILDING_TIERS[country.buildings];
    const player = gameState.players.find(p => p.id === country.ownerId);
    if (!player || player.buildingPower < nextTier.cost) return;

    const newBuildings = country.buildings + 1;

    await supabase.from('country_occupations')
      .update({ buildings: newBuildings })
      .eq('country_id', countryId);

    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => p.id === player.id ? { ...p, buildingPower: p.buildingPower - nextTier.cost } : p),
      countries: { ...prev.countries, [countryId]: { ...country, buildings: newBuildings } }
    }));
    addLog(`${player.name}님이 ${countryId}에 '${nextTier.name}'(을)를 건축했습니다!`, 'construction');
  };

  // ✅ 게임 초기화 - Supabase도 초기화
  const resetGame = async () => {
    if (window.confirm('정말 모든 데이터를 초기화하시겠습니까? (멤버는 유지됩니다)')) {
      await supabase.from('country_occupations').delete().neq('country_id', '');
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
