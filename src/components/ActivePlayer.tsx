import { useEffect, useRef, useState } from 'react';
import { t } from '../i18n';
import { formatTime, textOn } from '../utils/format';
import { smallPlayClick } from '../utils/sound';

type Props = {
    name: string;
    time: number;
    color: string;
    mode: 'stopwatch' | 'timer';
    paused: boolean;
    onPass: () => void;
    onReset: () => void;
    onAdjust: (delta: number) => void;
};

const STEPS: [number, string][] = [[-60, '−1:00'], [-10, '−0:10'], [10, '+0:10'], [60, '+1:00']];

const ActivePlayer = ({ name, time, color, mode, paused, onPass, onReset, onAdjust }: Props) => {
    const fg = textOn(color);
    const timeUp = mode === 'timer' && time === 0;
    const warning = mode === 'timer' && time <= 60;
    const [confirm, setConfirm] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    useEffect(() => () => clearTimeout(timer.current), []);

    const adjust = (e: React.MouseEvent, d: number) => {
        e.stopPropagation();
        smallPlayClick();
        onAdjust(d);
    };
    const reset = (e: React.MouseEvent) => {
        e.stopPropagation();
        smallPlayClick();
        if (!confirm) {
            setConfirm(true);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => setConfirm(false), 3000);
            return;
        }
        clearTimeout(timer.current);
        setConfirm(false);
        onReset();
    };
    return (
        <div
            role="button"
            tabIndex={0}
            className={`pane pane-active ${warning ? 'warning' : ''} ${timeUp ? 'time-up' : ''}`}
            style={{ backgroundColor: color, color: fg }}
            onClick={onPass}
            onKeyDown={(e) => {
                if (e.target !== e.currentTarget) return;
                if (e.key === 'Enter' || e.key === ' ') { onPass(); e.preventDefault(); }
            }}
        >
            <div className="pane-name">{name}</div>
            <div className="pane-time">{formatTime(time)}</div>
            <div className="pane-status" aria-live="polite">
                {timeUp ? t('timeUp') : paused ? `❚❚ ${t('paused')}` : ''}
            </div>
            <div className="adjust-row" style={{ color: fg }} onClick={(e) => e.stopPropagation()}>
                {STEPS.map(([d, label]) => (
                    <button key={label} className="adjust-btn" onClick={(e) => adjust(e, d)}>{label}</button>
                ))}
                <button
                    className={`adjust-btn reset-btn ${confirm ? 'confirm' : ''}`}
                    title={confirm ? t('confirmReset') : t('resetTimer')}
                    aria-label={confirm ? t('confirmReset') : t('resetTimer')}
                    onClick={reset}
                >{confirm ? '?' : '↺'}</button>
            </div>
        </div>
    );
};

export default ActivePlayer;
