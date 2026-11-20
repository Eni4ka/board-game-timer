import '@testing-library/jest-dom/vitest';

// jsdom не умеет воспроизводить звук
class FakeAudio {
  loop = false; paused = true; currentTime = 0;
  static plays = 0;
  play() { this.paused = false; FakeAudio.plays++; return Promise.resolve(); }
  pause() { this.paused = true; }
}
(globalThis as unknown as { Audio: unknown }).Audio = FakeAudio;

Object.defineProperty(navigator, 'language', { value: 'ru-RU', configurable: true });
