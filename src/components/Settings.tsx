import { useRef, useState } from 'react';
import { t } from '../i18n';
import { PALETTE } from '../utils/format';
import { clampName, nameLength, NAME_MAX } from '../utils/names';
import { MAX_PLAYERS, MIN_SECONDS, MAX_SECONDS } from '../utils/storage';
import type { Player } from '../types';

export type SetupResult = { players: Player[]; mode: 'stopwatch' | 'timer'; startTime: number; autoPass: boolean };

type Props = {
    players: Player[];
    mode: 'stopwatch' | 'timer';
    startTime: number;
    autoPass: boolean;
    canContinue: boolean;
    onStart: (cfg: SetupResult) => void;
    onClose: () => void;
};

type Row = Player & { id: number };

const QUICK_MINUTES = [1, 3, 5, 10, 15, 30];

const digits = (s: string) => s.replace(/\D/g, '').slice(0, 3);
const clampSeconds = (total: number) => Math.min(MAX_SECONDS, Math.max(MIN_SECONDS, total));

const Settings = ({ players, mode, startTime, autoPass, canContinue, onStart, onClose }: Props) => {
    const nextId = useRef(players.length);
    const [list, setList] = useState<Row[]>(players.map((p, i) => ({ ...p, id: i })));
    const [m, setM] = useState(mode);
    const [mins, setMins] = useState(String(Math.floor(startTime / 60)));
    const [secs, setSecs] = useState(String(startTime % 60));
    const [auto, setAuto] = useState(autoPass);

    const total = () => clampSeconds((parseInt(mins, 10) || 0) * 60 + Math.min(59, parseInt(secs, 10) || 0));
    const normalize = () => {
        const tot = total();
        setMins(String(Math.floor(tot / 60)));
        setSecs(String(tot % 60));
    };
    const setTotal = (tot: number) => { setMins(String(Math.floor(tot / 60))); setSecs(String(tot % 60)); };

    const patch = (i: number, p: Partial<Player>) =>
        setList((prev) => prev.map((x, idx) => (idx === i ? { ...x, ...p } : x)));

    const add = () => {
        if (list.length >= MAX_PLAYERS) return;
        const n = list.length;
        // выбираем первый свободный цвет палитры
        const used = new Set(list.map((p) => p.color));
        const color = PALETTE.find((c) => !used.has(c)) ?? PALETTE[n % PALETTE.length];
        setList([...list, { id: nextId.current++, name: `${t('player')} ${n + 1}`, time: 0, color }]);
    };
    const removeAt = (i: number) => { if (list.length > 2) setList(list.filter((_, idx) => idx !== i)); };
    const move = (i: number, d: -1 | 1) => {
        const j = i + d;
        if (j < 0 || j >= list.length) return;
        const copy = [...list];
        [copy[i], copy[j]] = [copy[j], copy[i]];
        setList(copy);
    };

    const nameKey = (s: string) => s.trim().toLowerCase();
    const nameCounts = new Map<string, number>();
    list.forEach((p) => nameCounts.set(nameKey(p.name), (nameCounts.get(nameKey(p.name)) ?? 0) + 1));
    const colorCounts = new Map<string, number>();
    list.forEach((p) => colorCounts.set(p.color ?? '', (colorCounts.get(p.color ?? '') ?? 0) + 1));

    const start = () => {
        // пустые имена → «Игрок N», дубликаты → добавляем номер
        const seen = new Map<string, number>();
        const result: Player[] = list.map((p, i) => {
            let name = p.name.trim() || `${t('player')} ${i + 1}`;
            const k = nameKey(name);
            const c = (seen.get(k) ?? 0) + 1;
            seen.set(k, c);
            if (c > 1) name = `${name} ${c}`;
            return { name, time: 0, color: p.color };
        });
        onStart({ players: result, mode: m, startTime: total(), autoPass: auto });
    };

    const curTotal = total();

    return (
        <div className="setup" role="dialog" aria-label={t('setupTitle')}>
            <h2>{t('setupTitle')}</h2>

            <section>
                <h3>{t('players')} ({list.length})</h3>
                {list.map((p, i) => {
                    const nameDup = p.name.trim() !== '' && (nameCounts.get(nameKey(p.name)) ?? 0) > 1;
                    const colorDup = (colorCounts.get(p.color ?? '') ?? 0) > 1;
                    return (
                        <div key={p.id} className="setup-player">
                            <div className="setup-name">
                                <input
                                    type="text"
                                    aria-label={`${t('name')} ${i + 1}`}
                                    value={p.name}
                                    placeholder={`${t('player')} ${i + 1}`}
                                    onChange={(e) => patch(i, { name: clampName(e.target.value) })}
                                />
                                <span className="counter">{nameLength(p.name)}/{NAME_MAX}</span>
                            </div>
                            <input
                                type="color"
                                aria-label={`${t('color')} ${i + 1}`}
                                value={p.color || PALETTE[0]}
                                onChange={(e) => patch(i, { color: e.target.value })}
                            />
                            <div className="row-actions">
                                <button aria-label={`${t('moveUp')} ${i + 1}`} disabled={i === 0} onClick={() => move(i, -1)}>▲</button>
                                <button aria-label={`${t('moveDown')} ${i + 1}`} disabled={i === list.length - 1} onClick={() => move(i, 1)}>▼</button>
                                <button aria-label={`${t('removeNamed')} ${i + 1}`} disabled={list.length <= 2} onClick={() => removeAt(i)}>✕</button>
                            </div>
                            <div className="swatches">
                                {PALETTE.map((c) => (
                                    <button key={c} className="swatch" style={{ background: c }}
                                            aria-label={c} onClick={() => patch(i, { color: c })} />
                                ))}
                            </div>
                            {(nameDup || colorDup) && (
                                <div className="hint warn" role="note">
                                    {nameDup && t('nameTaken')}{nameDup && colorDup && ' · '}{colorDup && t('colorTaken')}
                                </div>
                            )}
                        </div>
                    );
                })}
                <div className="setup-row">
                    <button onClick={add} disabled={list.length >= MAX_PLAYERS}>＋ {t('addPlayer')}</button>
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
                        <div className="setup-row">
                            <span>{t('minutes')}</span>
                            <input
                                type="number"
                                inputMode="numeric"
                                className="time-input"
                                aria-label={t('minutesShort')}
                                min={0}
                                max={600}
                                value={mins}
                                onChange={(e) => setMins(digits(e.target.value))}
                                onBlur={normalize}
                            />
                            <span>{t('minutesShort')}</span>
                            <input
                                type="number"
                                inputMode="numeric"
                                className="time-input"
                                aria-label={t('seconds')}
                                min={0}
                                max={59}
                                value={secs}
                                onChange={(e) => setSecs(digits(e.target.value))}
                                onBlur={normalize}
                            />
                            <span>{t('seconds')}</span>
                        </div>
                        <div className="hint">{t('rangeHint')}</div>
                        <div className="setup-row chips">
                            {QUICK_MINUTES.map((q) => (
                                <button key={q} className={curTotal === q * 60 ? 'selected' : ''} onClick={() => setTotal(q * 60)}>{q}</button>
                            ))}
                        </div>
                        <label className="setup-row check">
                            <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
                            {t('autoPass')}
                        </label>
                    </>
                ) : (
                    <p>{t('noParams')}</p>
                )}
            </section>

            <div className="setup-actions">
                <button className="primary" onClick={start}>▶ {t('start')}</button>
                {canContinue && <button onClick={onClose}>{t('close')}</button>}
            </div>
        </div>
    );
};

export default Settings;
