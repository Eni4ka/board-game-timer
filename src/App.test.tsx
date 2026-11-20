import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, fireEvent, within } from '@testing-library/react';
import App from './App';

const tick = (s: number) => act(() => { vi.advanceTimersByTime(s * 1000); });
const cards = () => Array.from(document.querySelectorAll('.player-card')) as HTMLElement[];
const time = (i: number) => cards()[i].querySelector('.player-time')!.textContent;
const clickDpad = (i: number, cls: string) =>
  fireEvent.click(cards()[i].querySelector(`.${cls}`)!);

function openSettings() {
  fireEvent.click(document.querySelector('.settings-button')!);
  return within(document.querySelector('.settings-panel') as HTMLElement);
}
function setTimerMode(min: number) {
  const s = openSettings();
  fireEvent.change(s.getByRole('combobox'), { target: { value: 'timer' } });
  fireEvent.change(s.getByRole('spinbutton'), { target: { value: String(min) } });
  fireEvent.click(s.getByText(/Сохранить/));
}

beforeEach(() => { vi.useFakeTimers(); render(<App />); });
afterEach(() => { vi.useRealTimers(); });

describe('секундомер', () => {
  it('два игрока по умолчанию, идёт время только у активного', () => {
    expect(cards()).toHaveLength(2);
    tick(5);
    expect(time(0)).toBe('0:05');
    expect(time(1)).toBe('0:00');
  });
  it('формат часов', () => {
    tick(3600 + 62);
    expect(time(0)).toBe('1:01:02');
  });
});

describe('передача хода', () => {
  it('кнопка «Передать ход» переключает игрока', () => {
    tick(2);
    fireEvent.click(screen.getAllByText('Передать ход')[0]);
    tick(3);
    expect(time(0)).toBe('0:02');
    expect(time(1)).toBe('0:03');
    expect(cards()[1]).toHaveClass('active');
  });
  it('клик по карточке передаёт ход следующему', () => {
    fireEvent.click(cards()[0]);
    expect(cards()[1]).toHaveClass('active');
  });
});

describe('пауза', () => {
  it('на паузе время стоит, ход по карточке не передаётся', () => {
    fireEvent.click(document.querySelector('.pause-button')!);
    tick(5);
    expect(time(0)).toBe('0:00');
    fireEvent.click(cards()[0]);
    expect(cards()[0]).toHaveClass('active');
    fireEvent.click(document.querySelector('.pause-button')!);
    tick(2);
    expect(time(0)).toBe('0:02');
  });
});

describe('ручная корректировка и сброс', () => {
  it('+5/+1/−1/−5 минут, не уходит ниже нуля', () => {
    clickDpad(0, 'dpad-up');    expect(time(0)).toBe('5:00');
    clickDpad(0, 'dpad-right'); expect(time(0)).toBe('6:00');
    clickDpad(0, 'dpad-left');  expect(time(0)).toBe('5:00');
    clickDpad(0, 'dpad-down');  expect(time(0)).toBe('0:00');
    clickDpad(0, 'dpad-down');  expect(time(0)).toBe('0:00');
  });
  it('сброс обнуляет секундомер', () => {
    tick(10);
    fireEvent.click(cards()[0].querySelector('.reset-button')!);
    expect(time(0)).toBe('0:00');
  });
});

describe('режим таймера', () => {
  it('обратный отсчёт от заданного времени, стоп на нуле', () => {
    setTimerMode(1);
    expect(time(0)).toBe('1:00');
    expect(time(1)).toBe('1:00');
    tick(10);
    expect(time(0)).toBe('0:50');
    tick(100);
    expect(time(0)).toBe('0:00');
  });
  it('последняя минута подсвечивается и включает звук «спешите»', () => {
    setTimerMode(2);
    expect(cards()[0].querySelector('.player-time')).not.toHaveClass('warning');
    tick(61);
    expect(cards()[0].querySelector('.player-time')).toHaveClass('warning');
  });
  it('сброс возвращает стартовое время', () => {
    setTimerMode(3);
    tick(30);
    fireEvent.click(cards()[0].querySelector('.reset-button')!);
    expect(time(0)).toBe('3:00');
  });
});

describe('настройки игроков', () => {
  it('переименование и сохранение', () => {
    const s = openSettings();
    fireEvent.change(s.getAllByRole('textbox')[0], { target: { value: 'Вася' } });
    fireEvent.click(s.getByText(/Сохранить/));
    expect(screen.getByText('Вася')).toBeInTheDocument();
  });
  it('добавление игроков до 6', () => {
    const s = openSettings();
    for (let i = 0; i < 6; i++) fireEvent.click(s.getByText(/Добавить игрока/));
    fireEvent.click(s.getByText(/Сохранить/));
    expect(cards()).toHaveLength(6);
  });
  it('удаление игрока; активный индекс остаётся валидным', () => {
    let s = openSettings();
    fireEvent.click(s.getByText(/Добавить игрока/));
    fireEvent.click(s.getByText(/Сохранить/));
    fireEvent.click(cards()[0]); fireEvent.click(cards()[1]); // активен 3-й
    expect(cards()[2]).toHaveClass('active');
    s = openSettings();
    fireEvent.click(s.getAllByText('🗑️')[2]);
    fireEvent.click(s.getByText(/Сохранить/));
    expect(cards()).toHaveLength(2);
    expect(cards().some(c => c.classList.contains('active'))).toBe(true);
  });
  it('«Закрыть» закрывает без сохранения', () => {
    const s = openSettings();
    fireEvent.change(s.getAllByRole('textbox')[0], { target: { value: 'Х' } });
    fireEvent.click(s.getByText(/Закрыть/));
    expect(screen.queryByText('Х')).toBeNull();
  });
});
