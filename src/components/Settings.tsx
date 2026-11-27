import { useState } from 'react';
import { t } from '../i18n';
import { PALETTE } from '../utils/format';
import type { Player } from '../types';

export type SetupResult = { players: Player[]; mode: 'stopwatch' | 'timer'; startTime: number };

type Props = {
    players: Player[];
    mode: 'stopwatch' | 'timer';
    startTime: number;
    canContinue: boolean;
    onStart: (cfg: SetupResult) => void;
    onClose: () => void;
};

const QUICK_MINUTES = [1, 3, 5, 10, 15, 30];

const Settings = ({ players, mode, startTime, canContinue, onStart, onClose }: Props) => {
    const [list, setList] = useState<Player[]>(players.map((p) => ({ ...p })));
    const [m, setM] = useState(mode);
    const [minutes, setMinutes] = useState(Math.max(1, Math.round(startTime / 60)));

    const patch = (i: number, p: Partial<Player>) =>
        setList((prev) => prev.map((x, idx) => (idx === i ? { ...x, ...p } : x)));

    const add = () => {
        if (list.length >= 6) return;
        const n = list.length;
        setList([...list, { name: `${t('player')} ${n + 1}`, time: 0, color: PALETTE[n % PALETTE.length] }]);
    };
    const remove = () => { if (list.length > 2) setList(list.slice(0, -1)); };

    return (
        <div className="setup" role="dialog" aria-label={t('setupTitle')}>
            <h2>{t('setupTitle')}</h2>

            <section>
                <h3>{t('players')} ({list.length})</h3>
                {list.map((p, i) => (
                    <div key={i} className="setup-player">
                        <input
                            type="text"
                            aria-label={`${t('name')} ${i + 1}`}
                            value={p.name}
                            maxLength={15}
                            onChange={(e) => patch(i, { name: e.target.value })}
                        />
                        <input
                            type="color"
                            aria-label={`${t('color')} ${i + 1}`}
                            value={p.color || PALETTE[0]}
                            onChange={(e) => patch(i, { color: e.target.value })}
                        />
                        <div className="swatches">
                            {PALETTE.map((c) => (
                                <button key={c} className="swatch" style={{ background: c }}
                                        aria-label={c} onClick={() => patch(i, { color: c })} />
                            ))}
                        </div>
                    </div>
                ))}
                <div className="setup-row">
                    <button onClick={add} disabled={list.length >= 6}>＋ {t('addPlayer')}</button>
                    <button onClick={remove} disabled={list.length <= 2}>− {t('removePlayer')}</button>
                </div>
            </section>

            <section>
                <h3>{t('type')}</h3>
                <button className={`type-card ${m === 'stopwatch' ? 'selected' : ''}`} onClick={() => setM('stopwatch')}>
                    <b>{t('stopwatch')}</b><span>{t('stopwatchDesc')}</span>
                </button>
                <button className={`type-card ${m === 'timer' ? 'selected' : ''}`} onClick={() => setM('timer')}>
                    <b>{t('timer')}</b><span>{t('timerDesc')}</span>
                </button>
            </section>

            <section>
                <h3>{t('params')}</h3>
                {m === 'timer' ? (
                    <>
                        <label className="setup-row">
                            {t('minutes')}
                            <input
                                type="number"
                                min={1}
                                max={600}
                                value={minutes}
                                onChange={(e) => setMinutes(Math.max(1, Math.floor(Number(e.target.value)) || 1))}
                            />
                        </label>
                        <div className="setup-row chips">
                            {QUICK_MINUTES.map((q) => (
                                <button key={q} className={minutes === q ? 'selected' : ''} onClick={() => setMinutes(q)}>{q}</button>
                            ))}
                        </div>
                    </>
                ) : (
                    <p>{t('noParams')}</p>
                )}
            </section>

            <div className="setup-actions">
                <button className="primary" onClick={() => onStart({ players: list, mode: m, startTime: minutes * 60 })}>
                    ▶ {t('start')}
                </button>
                {canContinue && <button onClick={onClose}>{t('close')}</button>}
            </div>
        </div>
    );
};

export default Settings;
