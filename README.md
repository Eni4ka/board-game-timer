# ⏱️ Player Timer

A sleek and customizable timer app for turn-based games. Perfect for tracking time and moves per player in casual or competitive matches. Designed for mobile-first experience and inspired by chess clocks, but flexible for various activities.

## 🚀 Features

* 🕹️ Два режима:

  * **Секундомер** — считает вверх.
  * **Таймер** — шахматные часы: обратный отсчёт (от 0:10 до 600:00), опционально автопередача хода при нуле.
* 👆 Тап по центральному окну или кнопка «Передать ход» — следующий игрок.
* 🪟 Три окна: предыдущий / текущий / следующий игрок (в альбомной ориентации — слева текущий, справа остальные).
* ⏱ Коррекция времени ±10 с / ±1 мин, сброс с подтверждением.
* 🎨 Имена (до 15 символов) и цвета игроков, порядок ходов можно менять.
* ➕ От 2 до 6 игроков.
* 💾 Партия и настройки сохраняются; при сворачивании игра ставится на паузу, экран не гаснет.

## 🛠️ Technologies Used

* **React** (Vite)
* **TypeScript**
* **HTML5 / CSS3**
* **PWA-ready**

## 🎮 Usage Instructions

1. **Start Screen**

   * Choose between **Stopwatch** or **Timer** mode.
   * In Timer mode, set the starting time and optional bonus time per turn.

2. **During Game**

   * Tap anywhere to switch turn (Play mode).
   * Tap a player's card (Pause mode) to change active player.
   * Adjust time with the D-pad during pause.
   * Reset a player’s time and moves with the reset button.

3. **Pause / Resume**

   * Toggle pause to freeze time or make changes.

## 🌐 Live Demo

Try it now: [https://smokenspanish.github.io/player-timer/](https://smokenspanish.github.io/player-timer/)

## ⚙️ How to Run Locally

```bash
git clone https://github.com/your-username/player-timer.git
cd player-timer
npm install
npm run dev
```

## 🧪 Testing on iPhone and macOS

Although the app is designed mobile-first, if you don't have access to Apple devices:

* Use Chrome or Safari's mobile device emulation (`DevTools > Toggle device toolbar`)
* Test PWA install behavior using "Add to Home Screen" in mobile browser
* Preview on Mac via online emulators (e.g. BrowserStack, Responsively App)

## 🙌 Contributing

Contributions are welcome! If you have ideas for improvements, feel free to open an issue or submit a pull request.

## 📄 License

MIT License — free for personal and commercial use.

---

© 2025 Basov Maksim
