import type { Player } from '../types';

const KEY = 'board-game-timer-state-v1';
export const MAX_PLAYERS = 6;
export const MIN_SECONDS = 10;
export const MAX_SECONDS = 600 * 60;

export type Saved = {
    players: Player[];
    activeIndex: number;
    mode: 'stopwatch' | 'timer';
    startTime: number;
    autoPass: boolean;
    started: boolean;
};

export const saveState = (s: Saved) => {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* хранилище недоступно */ }
};

export const loadState = (): Saved | null => {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;
        const d = JSON.parse(raw) as Partial<Saved>;
        if (!Array.isArray(d.players) || d.players.length < 2 || d.players.length > MAX_PLAYERS) return null;
        const players: Player[] = [];
        for (const p of d.players) {
            if (!p || typeof p.name !== 'string' || typeof p.time !== 'number' || !Number.isFinite(p.time)) return null;
            const color = typeof p.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(p.color) ? p.color : undefined;
            players.push({ name: p.name, time: Math.max(0, Math.floor(p.time)), color });
        }
        const mode = d.mode === 'timer' ? 'timer' : 'stopwatch';
        const startTime = typeof d.startTime === 'number' && d.startTime >= MIN_SECONDS && d.startTime <= MAX_SECONDS ? d.startTime : 300;
        const activeIndex = typeof d.activeIndex === 'number' && d.activeIndex >= 0 && d.activeIndex < players.length ? d.activeIndex : 0;
        return { players, activeIndex, mode, startTime, autoPass: !!d.autoPass, started: !!d.started };
    } catch {
        return null;
    }
};
