import { formatTime, textOn } from '../utils/format';

type Props = { label: string; name: string; time: number; color: string; position: 'prev' | 'next' };

const MiniPlayer = ({ label, name, time, color, position }: Props) => (
    <div className={`pane pane-mini pane-${position}`} style={{ backgroundColor: color, color: textOn(color) }}>
        <span className="mini-label">{label}</span>
        <span className="mini-name">{name}</span>
        <span className="mini-time">{formatTime(time)}</span>
    </div>
);

export default MiniPlayer;
