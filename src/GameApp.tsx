import { useState, useEffect, Component } from 'react';
import type { ReactNode } from 'react';
import type { GameState } from './game/types';
import { createInitialState, dealCards, playCard, startNextRound } from './game/engine';
import { saveGame, loadGame, clearGame } from './game/storage';
import { loadStats, type MatchStats } from './game/stats';
import { loadSettings, saveSettings, type Settings } from './game/settings';
import { initAudio, soundCardPlay, setSoundEnabled } from './game/sound';
import { DEAL_ANIM_MS, HUMAN_SEAT } from './game/config';
import { useGameLoop, hapticTap } from './hooks/useGameLoop';
import HomeScreen from './components/HomeScreen';
import GameTable from './components/GameTable';
import SettingsScreen from './components/SettingsScreen';
import ShopScreen from './components/ShopScreen';
import OnlineLobby from './components/OnlineLobby';
import MatchSetupScreen from './components/MatchSetupScreen';
import ProfileScreen from './components/ProfileScreen';
import { loadProfile, saveProfile, type Profile } from './game/profile';
import { loadCosmetics, saveCosmetics, applyCardBack, type Cosmetics } from './game/cosmetics';

// ── Error boundary ────────────────────────────────────────────

class GameErrorBoundary extends Component<
  { children: ReactNode; onReset: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; onReset: () => void }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="w-full h-full felt-table flex flex-col items-center justify-center gap-6 p-8 text-center">
        <span className="text-5xl">♠</span>
        <h2 className="text-2xl font-bold text-[#f5edd2]" style={{ fontFamily: "'Playfair Display',serif" }}>
          Что-то пошло не так
        </h2>
        <p className="text-[#6a8a72] text-sm max-w-xs">
          Произошла внутренняя ошибка. Игру можно сбросить.
        </p>
        <button
          onClick={() => { this.setState({ hasError: false }); this.props.onReset(); }}
          className="px-8 py-3 rounded-xl bg-[#c9a227] text-[#0d1f10] font-bold tracking-wider uppercase"
        >
          Новая игра
        </button>
      </div>
    );
  }
}

// ── Helpers ───────────────────────────────────────────────────

const BOT_NAMES: [string, string, string] = ['Бот 1', 'Бот 2', 'Бот 3'];

function makeNames(playerName: string): [string, string, string, string] {
  return [playerName, ...BOT_NAMES];
}

function freshState(playerName = 'Вы'): GameState {
  return createInitialState(makeNames(playerName));
}

// ── App ───────────────────────────────────────────────────────

export default function App() {
  const [state, setState] = useState<GameState>(() => {
    const s = loadSettings();
    return loadGame() ?? freshState(s.playerName);
  });
  const [isDealing, setIsDealing] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [stats, setStats] = useState<MatchStats>(() => loadStats());
  const [settings, setSettings] = useState<Settings>(() => {
    const s = loadSettings();
    setSoundEnabled(s.soundEnabled);
    return s;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showOnline, setShowOnline] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState<Profile>(() => loadProfile(loadSettings().playerName));
  const [cosmetics, setCosmetics] = useState<Cosmetics>(() => loadCosmetics());

  useEffect(() => { applyCardBack(cosmetics.cardBack); }, [cosmetics.cardBack]);

  useGameLoop({ state, settings, timeLeft, setState, setTimeLeft, setStats });

  // ── Handlers ──────────────────────────────────────────────

  const handleStartGame = (next?: Settings) => {
    initAudio();
    let names = settings.playerName;
    if (next) {
      saveSettings(next);
      setSoundEnabled(next.soundEnabled);
      setSettings(next);
      names = next.playerName;
    }
    setShowSetup(false);
    setIsDealing(true);
    setState(prev => dealCards({ ...prev, playerNames: makeNames(names) }));
    setTimeout(() => setIsDealing(false), DEAL_ANIM_MS);
  };


  const handlePlayCard = (cardId: string) => {
    initAudio();
    soundCardPlay();
    hapticTap();
    setState(prev => playCard(prev, HUMAN_SEAT, cardId));
  };

  const handleNextRound = () => {
    setIsDealing(true);
    setState(prev => startNextRound(prev));
    setTimeout(() => setIsDealing(false), DEAL_ANIM_MS);
  };

  const handleNewMatch = () => {
    clearGame();
    saveGame(freshState(settings.playerName));
    setState(freshState(settings.playerName));
  };

  const handleSaveSettings = (next: Settings) => {
    saveSettings(next);
    setSoundEnabled(next.soundEnabled);
    setSettings(next);
    setShowSettings(false);
    if (state.phase === 'HOME') {
      setState(prev => ({ ...prev, playerNames: makeNames(next.playerName) }));
    }
  };

  const handleSaveProfile = (next: Profile) => {
    saveProfile(next);
    setProfile(next);
    const nextSettings = { ...settings, playerName: next.nickname || 'Игрок' };
    saveSettings(nextSettings);
    setSettings(nextSettings);
    if (state.phase === 'HOME') {
      setState(prev => ({ ...prev, playerNames: makeNames(nextSettings.playerName) }));
    }
  };

  // ── Render ────────────────────────────────────────────────

  if (showSettings) {
    return (
      <SettingsScreen
        settings={settings}
        onSave={handleSaveSettings}
        onBack={() => setShowSettings(false)}
      />
    );
  }

  if (showShop) {
    return (
      <ShopScreen
        onBack={() => setShowShop(false)}
        tableTheme={settings.tableTheme}
        stats={stats}
        cosmetics={cosmetics}
        onCosmetics={(c) => { saveCosmetics(c); setCosmetics(c); }}
        onTableTheme={(id) => {
          const next = { ...settings, tableTheme: id as Settings['tableTheme'] };
          saveSettings(next);
          setSettings(next);
        }}
      />
    );
  }

  if (showProfile) {
    return (
      <ProfileScreen
        stats={stats}
        profile={profile}
        onSave={handleSaveProfile}
        onBack={() => setShowProfile(false)}
        tableTheme={settings.tableTheme}
      />
    );
  }

  if (showOnline) {
    return (
      <OnlineLobby
        onBack={() => setShowOnline(false)}
        tableTheme={settings.tableTheme}
      />
    );
  }

  if (state.phase === 'HOME' && showSetup) {
    return (
      <MatchSetupScreen
        settings={settings}
        stats={stats}
        onBack={() => setShowSetup(false)}
        onStart={handleStartGame}
      />
    );
  }

  if (state.phase === 'HOME') {
    return (
      <HomeScreen
        onStart={() => setShowSetup(true)}

        stats={stats}
        onSettings={() => setShowSettings(true)}
        onShop={() => setShowShop(true)}
        onOnline={() => setShowOnline(true)}
        onProfile={() => setShowProfile(true)}
        tableTheme={settings.tableTheme}
      />
    );
  }

  return (
    <GameErrorBoundary onReset={handleNewMatch}>
      <GameTable
        state={state}
        isDealing={isDealing}
        timeLeft={timeLeft}
        turnSeconds={settings.turnSeconds}
        tableTheme={settings.tableTheme}
        onPlayCard={handlePlayCard}
        onNextRound={handleNextRound}
        onNewMatch={handleNewMatch}
      />
    </GameErrorBoundary>
  );
}
