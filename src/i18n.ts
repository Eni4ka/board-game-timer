const ru = {
  title: 'Таймер игроков',
  player: 'Игрок',
  passTurn: 'Передать ход',
  resetTimer: 'Сбросить таймер',
  settings: 'Настройки игроков',
  mode: 'Режим:',
  stopwatch: 'Секундомер',
  timer: 'Таймер',
  minutes: 'Время (мин):',
  addPlayer: 'Добавить игрока',
  save: 'Сохранить',
  close: 'Закрыть',
};
const en: typeof ru = {
  title: 'Player Timer',
  player: 'Player',
  passTurn: 'Pass turn',
  resetTimer: 'Reset timer',
  settings: 'Player settings',
  mode: 'Mode:',
  stopwatch: 'Stopwatch',
  timer: 'Timer',
  minutes: 'Time (min):',
  addPlayer: 'Add player',
  save: 'Save',
  close: 'Close',
};

const lang = (typeof navigator !== 'undefined' ? navigator.language : 'en').toLowerCase();
const dict = lang.startsWith('ru') ? ru : en;

export const t = (key: keyof typeof ru): string => dict[key];
