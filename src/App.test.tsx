import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import App from './App';

const tick = (s: number) => act(() => { vi.advanceTimersByTime(s * 1000); });
const q = (sel: string) => document.querySelector(sel) as HTMLElement;
const activeTime = () => q('.pane-active .pane-time').textContent;
const activeName = () => q('.pane-active .pane-name').textContent;
const miniText = (pos: 'prev' | 'next') => q(`.pane-${pos}`).textContent!;

const startDefault = () => fireEvent.click(screen.getByText(/Начать игру/));
const openSetup = () => fireEvent.click(q('.settings-button'));
function startTimer(min: number) {
  fireEvent.click(screen.getByText('Таймер').closest('button')!);
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: String(min) } });
  startDefault();
}

beforeEach(() => { vi.useFakeTimers(); render(<App />); });
afterEach(() => { vi.useRealTimers(); });

describe('быстрая настройка при запуске', () => {
  it('меню открыто, время не идёт, пока не нажали «Начать игру»', () => {
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    tick(5);
    startDefault();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(activeTime()).toBe('0:00');
  });
  it('в меню есть описания типов и параметры', () => {
    expect(screen.getByText(/Считает вверх/)).toBeInTheDocument();
    expect(screen.getByText(/Шахматные часы/)).toBeInTheDocument();
    expect(screen.getByText(/параметров нет/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Таймер').closest('button')!);
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });
  it('имя и цвет игрока меняются', () => {
    fireEvent.change(screen.getByLabelText('Имя 1'), { target: { value: 'Вася' } });
    fireEvent.change(screen.getByLabelText('Цвет 1'), { target: { value: '#ff0000' } });
    startDefault();
    expect(activeName()).toBe('Вася');
    expect(q('.pane-active').style.backgroundColor).toBe('rgb(255, 0, 0)');
  });
  it('число игроков от 2 до 6', () => {
    for (let i = 0; i < 6; i++) fireEvent.click(screen.getByText(/Добавить игрока/));
    expect(screen.getAllByLabelText(/^Имя /)).toHaveLength(6);
    for (let i = 0; i < 6; i++) fireEvent.click(screen.getByText(/Убрать игрока/));
    expect(screen.getAllByLabelText(/^Имя /)).toHaveLength(2);
  });
});

describe('три окна', () => {
  beforeEach(() => {
    for (let i = 0; i < 2; i++) fireEvent.click(screen.getByText(/Добавить игрока/));
    startDefault(); // Игрок 1, 2, 3, 4
  });
  it('в центре текущий, сверху предыдущий, снизу следующий', () => {
    expect(activeName()).toBe('Игрок 1');
    expect(miniText('prev')).toContain('Игрок 4');
    expect(miniText('next')).toContain('Игрок 2');
  });
  it('после передачи хода окна сдвигаются, активный остаётся в центре', () => {
    fireEvent.click(q('.pane-active'));
    expect(activeName()).toBe('Игрок 2');
    expect(miniText('prev')).toContain('Игрок 1');
    expect(miniText('next')).toContain('Игрок 3');
  });
  it('во всех мини-окнах только имя и время (без кнопок)', () => {
    expect(q('.pane-prev').querySelectorAll('button')).toHaveLength(0);
    expect(q('.pane-next').querySelectorAll('button')).toHaveLength(0);
  });
});

describe('секундомер и правила хода', () => {
  beforeEach(startDefault);
  it('идёт время только у активного', () => {
    tick(5);
    expect(activeTime()).toBe('0:05');
    expect(miniText('next')).toContain('0:00');
  });
  it('«Передать ход» и тап по центру переключают игрока по кругу', () => {
    tick(2);
    fireEvent.click(screen.getByText('Передать ход'));
    tick(3);
    expect(activeName()).toBe('Игрок 2');
    expect(activeTime()).toBe('0:03');
    fireEvent.click(q('.pane-active'));
    expect(activeName()).toBe('Игрок 1');
    expect(activeTime()).toBe('0:02');
  });
  it('пауза останавливает время', () => {
    fireEvent.click(q('.pause-button'));
    tick(5);
    expect(activeTime()).toBe('0:00');
    fireEvent.click(q('.pause-button'));
    tick(2);
    expect(activeTime()).toBe('0:02');
  });
  it('часы формата ч:мм:сс', () => {
    tick(3600 + 62);
    expect(activeTime()).toBe('1:01:02');
  });
  it('корректировка ±1/±5 минут и сброс, не ниже нуля', () => {
    const b = (label: string) => screen.getByText(label);
    fireEvent.click(b('+5')); expect(activeTime()).toBe('5:00');
    fireEvent.click(b('+1')); expect(activeTime()).toBe('6:00');
    fireEvent.click(b('−1')); expect(activeTime()).toBe('5:00');
    fireEvent.click(b('−5')); fireEvent.click(b('−5')); expect(activeTime()).toBe('0:00');
    tick(10);
    fireEvent.click(screen.getByLabelText('Сбросить таймер'));
    expect(activeTime()).toBe('0:00');
  });
});

describe('режим таймера', () => {
  it('обратный отсчёт и остановка на нуле', () => {
    startTimer(1);
    expect(activeTime()).toBe('1:00');
    tick(10);
    expect(activeTime()).toBe('0:50');
    tick(100);
    expect(activeTime()).toBe('0:00');
  });
  it('последняя минута подсвечивается', () => {
    startTimer(2);
    expect(q('.pane-active')).not.toHaveClass('warning');
    tick(61);
    expect(q('.pane-active')).toHaveClass('warning');
  });
  it('сброс возвращает стартовое время', () => {
    startTimer(3);
    tick(30);
    fireEvent.click(screen.getByLabelText('Сбросить таймер'));
    expect(activeTime()).toBe('3:00');
  });
});

describe('повторное открытие настроек', () => {
  it('«Продолжить текущую» не сбрасывает игру, время на паузе пока меню открыто', () => {
    startDefault();
    tick(4);
    openSetup();
    tick(10);
    fireEvent.click(screen.getByText(/Продолжить текущую/));
    expect(activeTime()).toBe('0:04');
  });
  it('«Начать игру» заново обнуляет время', () => {
    startDefault();
    tick(4);
    openSetup();
    startDefault();
    expect(activeTime()).toBe('0:00');
  });
});
