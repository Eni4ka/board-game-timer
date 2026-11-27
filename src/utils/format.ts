export function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const mm = h > 0 ? m.toString().padStart(2, '0') : m.toString();
    return (h > 0 ? `${h}:` : '') + `${mm}:${s.toString().padStart(2, '0')}`;
}

/** Чёрный или белый текст, в зависимости от яркости фона (#rrggbb). */
export function textOn(hex: string): string {
    const c = (i: number) => {
        const v = parseInt(hex.substr(i, 2), 16) / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    const lum = 0.2126 * c(1) + 0.7152 * c(3) + 0.0722 * c(5);
    return lum > 0.35 ? '#111111' : '#ffffff';
}

export const PALETTE = ['#4FC3F7', '#F06292', '#81C784', '#FFD54F', '#BA68C8', '#FF8A65'];
