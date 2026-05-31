export class UI {
  constructor() {
    this.container = document.getElementById('ui-overlay');
    this._buildLoading();
    this._buildStartScreen();
    this._buildHUD();
    this._buildGameOver();
    this._buildControlsHint();
  }

  _buildLoading() {
    this.loadingScreen = document.createElement('div');
    this.loadingScreen.className = 'loading-screen';
    this.loadingScreen.innerHTML = `
      <h1>HIGHWAY RUSH</h1>
      <div class="loading-bar-track"><div class="loading-bar-fill" id="load-fill"></div></div>
      <div class="hint">Loading assets...</div>
    `;
    this.container.appendChild(this.loadingScreen);
    this.loadFill = this.loadingScreen.querySelector('#load-fill');
  }

  _buildStartScreen() {
    this.startScreen = document.createElement('div');
    this.startScreen.className = 'gameover-screen';
    this.startScreen.id = 'start-screen';
    this.startScreen.innerHTML = `
      <h1>HIGHWAY RUSH</h1>
      <p style="font-size:15px;opacity:0.6;margin-bottom:16px;">Choose your vehicle</p>
      <div class="char-select" id="char-select">
        <div class="char-card" data-char="race">
          <div class="char-icon">🚗</div>
          <div class="char-name">Race Car</div>
        </div>
        <div class="char-card" data-char="pony">
          <div class="char-icon">🦄</div>
          <div class="char-name">Pony</div>
        </div>
        <div class="char-card locked" data-char="rx7">
          <div class="char-icon">🏎️</div>
          <div class="char-name">Mazda RX7</div>
          <div class="char-lock">🔒 100⭐</div>
        </div>
      </div>
      <p style="font-size:15px;opacity:0.6;margin:16px 0 12px;">Game Mode</p>
      <div class="mode-select">
        <div class="mode-card" data-mode="endless">
          <div class="mode-name">Endless</div>
          <div class="mode-desc">Survive as long as you can</div>
        </div>
        <div class="mode-card" data-mode="time">
          <div class="mode-name">60 Seconds</div>
          <div class="mode-desc">Survive 60s, collect stars</div>
        </div>
        <div class="mode-card" data-mode="stars">
          <div class="mode-name">Star Rush</div>
          <div class="mode-desc">Collect 10 stars fast</div>
        </div>
      </div>
      <button class="btn" id="start-btn">START</button>
      <p style="font-size:14px;opacity:0.4;margin-top:24px;">
        &larr; &rarr; / A D &mdash; lanes &nbsp;|&nbsp; &uarr; / W &mdash; gas &nbsp;|&nbsp; &darr; / S &mdash; brake
      </p>
    `;
    this.startScreen.style.display = 'none';
    this.container.appendChild(this.startScreen);
    this.startBtn = this.startScreen.querySelector('#start-btn');

    this.totalStars = 0;

    this.starProgress = document.createElement('div');
    this.starProgress.style.cssText = 'font-size:14px;opacity:0.5;margin-bottom:12px;';
    this.starProgress.textContent = '⭐ Total: 0';
    this.startScreen.querySelector('#char-select').after(this.starProgress);

    this.selectedChar = 'race';
    this.selectedMode = 'endless';
    this.startScreen.querySelectorAll('.char-card').forEach(card => {
      card.addEventListener('click', () => {
        if (card.classList.contains('locked')) return;
        this.startScreen.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedChar = card.dataset.char;
      });
    });
    this.startScreen.querySelectorAll('.char-card')[0].classList.add('selected');
    this.startScreen.querySelectorAll('.mode-card').forEach(card => {
      card.addEventListener('click', () => {
        this.startScreen.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedMode = card.dataset.mode;
      });
    });
    this.startScreen.querySelectorAll('.mode-card')[0].classList.add('selected');
  }

  _buildHUD() {
    this.hud = document.createElement('div');
    this.hud.className = 'hud';
    this.hud.style.display = 'none';
    this.hud.innerHTML = `
      <div class="hud-score" id="hud-score">0</div>
      <div class="hud-mode" id="hud-mode"></div>
      <div class="hud-speed" id="hud-speed">Speed: 1x</div>
    `;
    this.container.appendChild(this.hud);
    this.hudScore = this.hud.querySelector('#hud-score');
    this.hudMode = this.hud.querySelector('#hud-mode');
    this.hudSpeed = this.hud.querySelector('#hud-speed');

    this.starCounter = document.createElement('div');
    this.starCounter.className = 'star-counter';
    this.starCounter.textContent = '⭐ 0';
    this.starCounter.style.display = 'none';
    this.container.appendChild(this.starCounter);
  }

  _buildGameOver() {
    this.gameoverScreen = document.createElement('div');
    this.gameoverScreen.className = 'gameover-screen';
    this.gameoverScreen.innerHTML = `
      <h1>CRASHED</h1>
      <div class="final-score" id="final-score">Score: 0</div>
      <div class="gameover-btns">
        <button class="btn" id="restart-btn">RESTART</button>
        <button class="btn btn-secondary" id="menu-btn">MAIN MENU</button>
      </div>
    `;
    this.container.appendChild(this.gameoverScreen);
    this.finalScore = this.gameoverScreen.querySelector('#final-score');
    this.restartBtn = this.gameoverScreen.querySelector('#restart-btn');
    this.menuBtn = this.gameoverScreen.querySelector('#menu-btn');
  }

  _buildControlsHint() {
    this.hint = document.createElement('div');
    this.hint.className = 'controls-hint';
    this.hint.style.display = 'none';
    this.hint.innerHTML = '&larr; &rarr; / A D &mdash; lanes &nbsp;&nbsp; &uarr; / W &mdash; gas &nbsp;&nbsp; &darr; / S &mdash; brake';
    this.container.appendChild(this.hint);
  }

  updateLoading(loaded, total) {
    const pct = Math.round((loaded / total) * 100);
    this.loadFill.style.width = pct + '%';
    if (loaded === total) {
      this.loadingScreen.querySelector('.hint').textContent = 'Ready!';
    }
  }

  hideLoading() {
    this.loadingScreen.style.display = 'none';
  }

  showStartScreen() {
    this.startScreen.style.display = 'flex';
    this.totalStars = parseInt(localStorage.getItem('highway_rush_stars') || '0', 10);
    this.starProgress.textContent = `⭐ Total: ${this.totalStars}`;
    if (this.totalStars >= 100) this.unlockRX7();
  }

  unlockRX7() {
    const card = this.startScreen.querySelector('.char-card[data-char="rx7"]');
    if (card) {
      card.classList.remove('locked');
      const lock = card.querySelector('.char-lock');
      if (lock) lock.remove();
    }
  }

  getSelectedCharacter() {
    return this.selectedChar;
  }

  getSelectedMode() {
    return this.selectedMode;
  }

  hideStartScreen() {
    this.startScreen.style.display = 'none';
  }

  showHUD() {
    this.hud.style.display = 'block';
    this.starCounter.style.display = 'block';
    this.hint.style.display = 'block';
  }

  showUnlockMessage() {
    const el = document.createElement('div');
    el.className = 'unlock-msg';
    el.textContent = '🚗 MAZDA RX7 UNLOCKED! 🚗';
    this.container.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }

  updateStars(count) {
    this.starCounter.textContent = `⭐ ${count}`;
  }

  updateScore(score) {
    this.hudScore.textContent = Math.floor(score);
  }

  updateSpeed(speed) {
    this.hudSpeed.textContent = `Speed: ${speed.toFixed(1)}x`;
  }

  showGameOver(score, stars, mode, reason) {
    const titleEl = this.gameoverScreen.querySelector('h1');
    titleEl.textContent = reason && reason !== 'crash' ? 'CONGRATULATIONS' : 'CRASHED';
    this.finalScore.textContent = mode === 'time' ? `⭐ ${stars} collected` : mode === 'stars' ? `Time: ${Math.floor(score)}s` : `Score: ${Math.floor(score)}  ⭐ ${stars}`;
    this.gameoverScreen.classList.add('show');
    this.hud.style.display = 'none';
    this.starCounter.style.display = 'none';
    this.hint.style.display = 'none';
  }

  hideGameOver() {
    this.gameoverScreen.classList.remove('show');
  }

  showMainMenu() {
    this.gameoverScreen.classList.remove('show');
    this.totalStars = parseInt(localStorage.getItem('highway_rush_stars') || '0', 10);
    this.starProgress.textContent = `⭐ Total: ${this.totalStars}`;
    if (this.totalStars >= 100) this.unlockRX7();
    this.startScreen.style.display = 'flex';
  }
}
