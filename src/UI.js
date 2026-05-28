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
      <p style="font-size:18px;opacity:0.7;margin-bottom:20px;">Overtake traffic. Avoid crashes. Last as long as you can.</p>
      <div class="char-select">
        <div class="char-card" data-char="race">
          <div class="char-icon">🚗</div>
          <div class="char-name">Race Car</div>
        </div>
        <div class="char-card" data-char="pony">
          <div class="char-icon">🦄</div>
          <div class="char-name">Pony</div>
        </div>
      </div>
      <button class="btn" id="start-btn">START</button>
      <p style="font-size:14px;opacity:0.4;margin-top:30px;">
        &larr; &rarr; / A D &mdash; lanes &nbsp;|&nbsp; &uarr; / W &mdash; gas &nbsp;|&nbsp; &darr; / S &mdash; brake
      </p>
    `;
    this.startScreen.style.display = 'none';
    this.container.appendChild(this.startScreen);
    this.startBtn = this.startScreen.querySelector('#start-btn');

    this.selectedChar = 'race';
    const cards = this.startScreen.querySelectorAll('.char-card');
    cards[0].classList.add('selected');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedChar = card.dataset.char;
      });
    });
  }

  _buildHUD() {
    this.hud = document.createElement('div');
    this.hud.className = 'hud';
    this.hud.style.display = 'none';
    this.hud.innerHTML = `
      <div class="hud-score" id="hud-score">0</div>
      <div class="hud-speed" id="hud-speed">Speed: 1x</div>
    `;
    this.container.appendChild(this.hud);
    this.hudScore = this.hud.querySelector('#hud-score');
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
      <button class="btn" id="restart-btn">RESTART</button>
    `;
    this.container.appendChild(this.gameoverScreen);
    this.finalScore = this.gameoverScreen.querySelector('#final-score');
    this.restartBtn = this.gameoverScreen.querySelector('#restart-btn');
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
  }

  getSelectedCharacter() {
    return this.selectedChar;
  }

  hideStartScreen() {
    this.startScreen.style.display = 'none';
  }

  showHUD() {
    this.hud.style.display = 'block';
    this.starCounter.style.display = 'block';
    this.hint.style.display = 'block';
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

  showGameOver(score, stars) {
    this.finalScore.textContent = `Score: ${Math.floor(score)}  ⭐ ${stars}`;
    this.gameoverScreen.classList.add('show');
    this.hud.style.display = 'none';
    this.starCounter.style.display = 'none';
    this.hint.style.display = 'none';
  }

  hideGameOver() {
    this.gameoverScreen.classList.remove('show');
  }
}
