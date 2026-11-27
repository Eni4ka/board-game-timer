import { t } from '../i18n';
import { formatTime, textOn } from '../utils/format';
import { smallPlayClick } from '../utils/sound';

type Props = {
    name: string;
    time: number;
    color: string;
    mode: 'stopwatch' | 'timer';
    onPass: () => void;
    onReset: () => void;
    onAdjust: (delta: number) => void;
};

const ActivePlayer = ({ name, time, color, mode, onPass, onReset, onAdjust }: Props) => {
    const fg = textOn(color);
    const warning = mode === 'timer' && time <= 60;
    const adjust = (e: React.MouseEvent, d: number) => {
        e.stopPropagation();
        smallPlayClick();
        onAdjust(d);
    };
    return (
        <div
            role="button"
            tabIndex={0}
            className={`pane pane-active ${warning ? 'warning' : ''}`}
            style={{ backgroundColor: color, color: fg }}
            onClick={onPass}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { onPass(); e.preventDefault(); }
            }}
        >
            <div className="pane-name">{name}</div>
            <div className="pane-time">{formatTime(time)}</div>
            <div className="adjust-row" style={{ color: fg }}>
                {[[-300, '−5'], [-60, '−1'], [60, '+1'], [300, '+5']].map(([d, label]) => (
                    <button key={label} className="adjust-btn" onClick={(e) => adjust(e, d as number)}>{label}</button>
                ))}
                <button
                    className="adjust-btn reset-btn"
                    title={t('resetTimer')}
                    aria-label={t('resetTimer')}
                    onClick={(e) => { e.stopPropagation(); smallPlayClick(); onReset(); }}
                >↺</button>
            </div>
        </div>
    );
};

export default ActivePlayer;
