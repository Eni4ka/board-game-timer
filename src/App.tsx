import { useRef, useState, useEffect } from 'react';
import './App.css'
import PlayerTimer from './components/PlayerTimer';
import Settings from './components/Settings';
// import { loadPlayers, savePlayers } from './utils/storage';
import type { Player } from './types';
import {playClick, smallPlayClick} from "./utils/sound.ts";
import { t } from './i18n';
import SettingsIcon from "./components/SettingsIcon.tsx";

const defaultPlayers: Player[] = [
    { name: `${t('player')} 1`, time: 0, color: '#90caf9' },
    { name: `${t('player')} 2`, time: 0, color: '#f48fb1' },
];

function App() {
    // const [players, setPlayers] = useState<Player[]>(
    //     () => loadPlayers() || defaultPlayers
    // );

    const [players, setPlayers] = useState<Player[]>(defaultPlayers);



    const [activeIndex, setActiveIndex] = useState<number>(0);

    const [paused, setPaused] = useState<boolean>(false);

    const [showSettings, setShowSettings] = useState(false);

    // const [mode, setMode] = useState<'stopwatch' | 'timer'>(
    //     localStorage.getItem('mode') as 'stopwatch' | 'timer' || 'stopwatch'
    // );
    //
    // const [startTime, setStartTime] = useState(() => {
    //     const saved = localStorage.getItem('startTime');
    //     return saved ? Number(saved) : 300; // по умолчанию 5 мин
    // });

    const [mode, setMode] = useState<'stopwatch' | 'timer'>('stopwatch');

    const [startTime, setStartTime] = useState<number>(300); // 5 минут по умолчанию

    const hurryAudioRef = useRef<HTMLAudioElement | null>(null);
    const isPlayingRef = useRef(false);

    useEffect(() => {
        if (activeIndex >= players.length) setActiveIndex(0);
    }, [players.length, activeIndex]);

    const activeTime = players[activeIndex]?.time || 0;

    const finishAudioRef = useRef<HTMLAudioElement | null>(null);

    const hasPlayedFinishSoundRef = useRef(false);

    // // Сохраняем режим
    // useEffect(() => {
    //     localStorage.setItem('mode', mode);
    // }, [mode]);
    //
    // // Сохраняем стартовое время
    // useEffect(() => {
    //     localStorage.setItem('startTime', startTime.toString());
    // }, [startTime]);

    useEffect(() => {
        if (mode === 'timer') {
            setPlayers((prev) =>
                prev.map((p) => ({
                    ...p,
                    time: startTime,
                }))
            );
        } else {
            setPlayers((prev) =>
                prev.map((p) => ({
                    ...p,
                    time: 0,
                }))
            );
        }
    }, [mode, startTime]);


    // ⏱️ Инкремент таймера активного игрока
    useEffect(() => {
        if (paused) return;

        const interval = setInterval(() => {
            setPlayers((prevPlayers) =>
                prevPlayers.map((player, index) => {
                    if (index !== activeIndex) return player;

                    const newTime =
                        mode === 'timer'
                            ? Math.max(0, player.time - 1)
                            : player.time + 1;

                    return { ...player, time: newTime };
                })
            );
        }, 1000);

        return () => clearInterval(interval);
    }, [activeIndex, paused, mode]);

    // 💾 Сохраняем состояние игроков
    // useEffect(() => {
    //     savePlayers(players);
    // }, [players]);

    //музыка истечения времени
    useEffect(() => {
        if (!hurryAudioRef.current) {
            hurryAudioRef.current = new Audio('sounds/hurry.mp3');
            hurryAudioRef.current.loop = true;
        }

        const shouldPlay =
            mode === 'timer' && !paused && activeTime <= 60 && activeTime > 0;

        if (shouldPlay && !isPlayingRef.current) {
            isPlayingRef.current = true;
            hurryAudioRef.current.currentTime = 0;
            hurryAudioRef.current.play().catch(() => {
                isPlayingRef.current = false;
            });
        }

        if (!shouldPlay && isPlayingRef.current) {
            hurryAudioRef.current?.pause();
            hurryAudioRef.current.currentTime = 0;
            isPlayingRef.current = false;
        }
    }, [activeTime, paused, mode]);

    useEffect(() => {
        return () => {
            if (hurryAudioRef.current) {
                hurryAudioRef.current.pause();
                hurryAudioRef.current.currentTime = 0;
            }
        };
    }, []);

    useEffect(() => {
        if (!finishAudioRef.current) {
            finishAudioRef.current = new Audio('sounds/time-up.mp3');
        }

        const activeTime = players[activeIndex]?.time;

        const shouldPlay =
            mode === 'timer' &&
            !paused &&
            activeTime === 0 &&
            !hasPlayedFinishSoundRef.current;

        if (shouldPlay) {
            hasPlayedFinishSoundRef.current = true;
            finishAudioRef.current.currentTime = 0;
            finishAudioRef.current.play().catch(() => {});
        }

        // Сброс флага при смене игрока или при старте времени
        if (activeTime > 0 && hasPlayedFinishSoundRef.current) {
            hasPlayedFinishSoundRef.current = false;
        }
    }, [players, activeIndex, paused, mode]);

    // 🔁 Переключение активного игрока
    const handleNext = () => {
        playClick();
        setActiveIndex((prev) => (prev + 1) % players.length);
    };

    const handleCardClick = (index: number) => {
        if (!paused) {
            setActiveIndex((index + 1) % players.length);
        }
    };

    return (
        <div className="app">
            <h1>{t('title')}</h1>
            <div className="top-bar">
                <button className="settings-button" onClick={() => {
                    smallPlayClick()
                    setShowSettings(true)
                }}>
                    <SettingsIcon/>
                </button>
            </div>

            {/* Кнопка Паузы */}
            <div className="pause-button-wrapper">
                <button className="pause-button" onClick={() => {
                    playClick();
                    setPaused((prev) => !prev)
                }}>
                    {paused ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <path d="M6 5h4v14H6zm8 0h4v14h-4z"/>
                        </svg>
                    )}
                </button>
            </div>

            {/* Сетка с игроками */}
            <div className="player-grid-wrapper">
                <div className="player-grid">
                {players.map((player, index) => (
                    <PlayerTimer
                        key={index}
                        name={player.name}
                        time={player.time}
                        active={index === activeIndex}
                        color={player.color || '#ccc'}
                        onReset={() => {
                            setPlayers((prev) =>
                                prev.map((p, i) =>
                                    i === index
                                        ? {...p, time: mode === 'timer' ? startTime : 0}
                                        : p
                                )
                            );
                        }}
                        onClick={() => {
                            playClick(); // вот сюда вставляем
                            handleCardClick(index);
                        }}
                        onAdjustTime={(delta) => {
                            setPlayers((prev) =>
                                prev.map((p, i) =>
                                    i === index ? {...p, time: Math.max(0, p.time + delta)} : p
                                )
                            );
                        }}
                        mode={mode}
                    />
                ))}
            </div>
            </div>

            <button className="pass-turn-button"
                    onClick={handleNext}>{t('passTurn')}
            </button>
            {showSettings && (
                <div className="modal-overlay">
                    <Settings
                        players={players}
                        setPlayers={setPlayers}
                        close={() => setShowSettings(false)}
                        mode={mode}
                        setMode={setMode}
                        startTime={startTime}
                        setStartTime={setStartTime}
                    />
                </div>
                    )}


                    <div className="mobile-controls">
                        <button className="pause-button mobile-button" onClick={() => {
                            playClick();
                            setPaused((prev) => !prev)
                        }}>
                            {paused ? (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                    <path d="M8 5v14l11-7z"/>
                                </svg>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                    <path d="M6 5h4v14H6zm8 0h4v14h-4z"/>
                                </svg>
                            )}
                        </button>

                        <button className="pass-turn-button mobile-button next-button"
                                onClick={handleNext}>{t('passTurn')}
                        </button>
                    </div>

                </div>

            );
            }

            export default App
