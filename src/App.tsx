import { useRef, useState, useEffect } from 'react';
import './App.css';
import ActivePlayer from './components/ActivePlayer';
import MiniPlayer from './components/MiniPlayer';
import Settings, { type SetupResult } from './components/Settings';
import SettingsIcon from './components/SettingsIcon';
import type { Player } from './types';
import { playClick, smallPlayClick } from './utils/sound';
import { PALETTE } from './utils/format';
import { t } from './i18n';

const defaultPlayers: Player[] = [
    { name: `${t('player')} 1`, time: 0, color: PALETTE[0] },
    { name: `${t('player')} 2`, time: 0, color: PALETTE[1] },
];

function App() {
    const [players, setPlayers] = useState<Player[]>(defaultPlayers);
    const [activeIndex, setActiveIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const [showSetup, setShowSetup] = useState(true); // при запуске сразу открывается быстрая настройка
    const [started, setStarted] = useState(false);
    const [mode, setMode] = useState<'stopwatch' | 'timer'>('stopwatch');
    const [startTime, setStartTime] = useState(300);

    const running = !paused && !showSetup;
    const n = players.length;
    const active = players[activeIndex] ?? players[0];
    const prev = players[(activeIndex - 1 + n) % n];
    const next = players[(activeIndex + 1) % n];

    // Ход времени: считаем по часам устройства, чтобы время не «плыло» при задержках
    useEffect(() => {
        if (!running) return;
        let last = Date.now();
        let acc = 0;
        const id = setInterval(() => {
            const now = Date.now();
            acc += now - last;
            last = now;
            const secs = Math.floor(acc / 1000);
            if (secs < 1) return;
            acc -= secs * 1000;
            setPlayers((ps) =>
                ps.map((p, i) =>
                    i !== activeIndex
                        ? p
                        : { ...p, time: mode === 'timer' ? Math.max(0, p.time - secs) : p.time + secs }
                )
            );
        }, 250);
        return () => clearInterval(id);
    }, [running, activeIndex, mode]);

    // Звуки: «спешите» в последнюю минуту и сигнал окончания времени
    const hurryRef = useRef<HTMLAudioElement | null>(null);
    const hurryOn = useRef(false);
    const finishRef = useRef<HTMLAudioElement | null>(null);
    const finishPlayed = useRef(false);
    const activeTime = active?.time ?? 0;

    useEffect(() => {
        if (!hurryRef.current) {
            hurryRef.current = new Audio('sounds/hurry.mp3');
            hurryRef.current.loop = true;
        }
        const should = mode === 'timer' && running && activeTime <= 60 && activeTime > 0;
        if (should && !hurryOn.current) {
            hurryOn.current = true;
            hurryRef.current.currentTime = 0;
            hurryRef.current.play().catch(() => { hurryOn.current = false; });
        }
        if (!should && hurryOn.current) {
            hurryRef.current.pause();
            hurryRef.current.currentTime = 0;
            hurryOn.current = false;
        }
    }, [activeTime, running, mode]);

    useEffect(() => () => { hurryRef.current?.pause(); }, []);

    useEffect(() => {
        if (!finishRef.current) finishRef.current = new Audio('sounds/time-up.mp3');
        if (mode === 'timer' && running && activeTime === 0 && !finishPlayed.current) {
            finishPlayed.current = true;
            finishRef.current.currentTime = 0;
            finishRef.current.play().catch(() => {});
        }
        if (activeTime > 0) finishPlayed.current = false;
    }, [activeTime, activeIndex, running, mode]);

    const pass = () => {
        playClick();
        setActiveIndex((i) => (i + 1) % n);
    };

    const startGame = (cfg: SetupResult) => {
        setMode(cfg.mode);
        setStartTime(cfg.startTime);
        setPlayers(cfg.players.map((p) => ({ ...p, time: cfg.mode === 'timer' ? cfg.startTime : 0 })));
        setActiveIndex(0);
        setPaused(false);
        setStarted(true);
        setShowSetup(false);
    };

    const adjust = (delta: number) =>
        setPlayers((ps) => ps.map((p, i) => (i === activeIndex ? { ...p, time: Math.max(0, p.time + delta) } : p)));

    const reset = () =>
        setPlayers((ps) => ps.map((p, i) => (i === activeIndex ? { ...p, time: mode === 'timer' ? startTime : 0 } : p)));

    return (
        <div className="app">
            <MiniPlayer position="prev" label={t('previous')} name={prev.name} time={prev.time} color={prev.color || PALETTE[0]} />
            <ActivePlayer
                name={active.name}
                time={active.time}
                color={active.color || PALETTE[0]}
                mode={mode}
                onPass={pass}
                onReset={reset}
                onAdjust={adjust}
            />
            <MiniPlayer position="next" label={t('next')} name={next.name} time={next.time} color={next.color || PALETTE[1]} />

            <div className="controls">
                <button
                    className="settings-button ctl"
                    aria-label={t('settings')}
                    onClick={() => { smallPlayClick(); setShowSetup(true); }}
                >
                    <SettingsIcon />
                </button>
                <button className="pause-button ctl" onClick={() => { playClick(); setPaused((p) => !p); }}
                        aria-label={paused ? t('resume') : t('pause')}>
                    {paused ? '▶' : '❚❚'}
                </button>
                <button className="pass-turn-button ctl" onClick={pass}>{t('passTurn')}</button>
            </div>

            {showSetup && (
                <div className="modal-overlay">
                    <Settings
                        players={players}
                        mode={mode}
                        startTime={startTime}
                        canContinue={started}
                        onStart={startGame}
                        onClose={() => setShowSetup(false)}
                    />
                </div>
            )}
        </div>
    );
}

export default App;
