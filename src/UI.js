export class UI {
  constructor(sound) {
    this.sound = sound;
    this.container = document.getElementById('ui-overlay');
    this._buildLoading();
    this._buildStartScreen();
    this._buildShopScreen();
    this._buildHUD();
    this._buildGameOver();
    this._buildControlsHint();
    this._buildPortraitWarning();
    this._buildFireButton();
  }

  _buildLoading() {
    this.loadingScreen = document.createElement('div');
    this.loadingScreen.className = 'loading-screen';
    this.loadingScreen.innerHTML = `
      <h1>HIGHWAY RUSH</h1>
      <div class="loading-bar-track"><div class="loading-bar-fill" id="load-fill"></div></div>
      <div class="hint">Загрузка...</div>
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
      <div class="current-vehicle" id="current-vehicle">🚗 Транспорт: Гоночная машина</div>
      <div class="star-total" id="star-total">⭐ Всего: 0</div>
      <p style="font-size:15px;opacity:0.6;margin:14px 0 10px;">Режим игры</p>
      <div class="mode-select">
        <div class="mode-card" data-mode="endless">
          <div class="mode-name">Бесконечный</div>
          <div class="mode-desc">Держись как можно дольше</div>
        </div>
        <div class="mode-card" data-mode="time">
          <div class="mode-name">60 Секунд</div>
          <div class="mode-desc">Продержись 60 сек, собери звёзды</div>
        </div>
        <div class="mode-card" data-mode="stars">
          <div class="mode-name">Гонка за звёздами</div>
          <div class="mode-desc">Собери 10 звёзд быстрее</div>
        </div>
      </div>
      <div id="control-mode-select">
        <div class="cm-card" data-control="swipe">👆 Свайпы</div>
        <div class="cm-card" data-control="buttons">🕹️ Кнопки</div>
      </div>
      <div class="start-btns">
        <button class="btn" id="shop-btn">МАГАЗИН</button>
        <button class="btn" id="start-btn">СТАРТ</button>
      </div>
    `;
    this.startScreen.style.display = 'none';
    this.container.appendChild(this.startScreen);
    this.startBtn = this.startScreen.querySelector('#start-btn');
    this.shopBtn = this.startScreen.querySelector('#shop-btn');
    this.currentVehicleEl = this.startScreen.querySelector('#current-vehicle');
    this.starTotalEl = this.startScreen.querySelector('#star-total');

    this.selectedMode = 'endless';
    this.selectedControl = 'swipe';

    this.startScreen.querySelectorAll('.mode-card').forEach(card => {
      card.addEventListener('click', () => {
        if (this.sound) this.sound.play('click', 0.5);
        this.startScreen.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedMode = card.dataset.mode;
      });
    });
    this.startScreen.querySelectorAll('.mode-card')[0].classList.add('selected');

    this.startScreen.querySelectorAll('.cm-card').forEach(card => {
      card.addEventListener('click', () => {
        if (this.sound) this.sound.play('click', 0.5);
        this.startScreen.querySelectorAll('.cm-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedControl = card.dataset.control;
      });
    });
    this.startScreen.querySelectorAll('.cm-card')[0].classList.add('selected');

    this.shopBtn.addEventListener('click', () => {
      if (this.sound) this.sound.play('click', 0.5);
      this._refreshShop();
      this.startScreen.style.display = 'none';
      this.shopScreen.style.display = 'flex';
    });
  }

  setShopVehicles(vehicles) {
    this._shopVehicles = vehicles;
    this._buildShopGrid();
  }

  _buildShopScreen() {
    this.shopScreen = document.createElement('div');
    this.shopScreen.className = 'shop-screen';
    this.shopScreen.id = 'shop-screen';
    this.shopScreen.innerHTML = `
      <div class="shop-header">
        <h2>МАГАЗИН</h2>
        <div class="shop-stars" id="shop-stars">⭐ 0</div>
      </div>
      <div class="shop-grid" id="shop-grid"></div>
      <button class="shop-back" id="shop-back-btn">← НАЗАД</button>
    `;
    this.shopScreen.style.display = 'none';
    this.container.appendChild(this.shopScreen);
    this.shopGrid = this.shopScreen.querySelector('#shop-grid');
    this.shopStarsEl = this.shopScreen.querySelector('#shop-stars');

    this.shopScreen.querySelector('#shop-back-btn').addEventListener('click', () => {
      if (this.sound) this.sound.play('click', 0.5);
      this.shopScreen.style.display = 'none';
      this._updateStartScreen();
      this.startScreen.style.display = 'flex';
    });
  }

  _buildShopGrid() {
    if (!this._shopVehicles) return;
    this.shopGrid.innerHTML = '';
    this._shopVehicles.forEach(v => {
      const card = document.createElement('div');
      card.className = 'shop-card';
      card.dataset.vehicleId = v.id;

      const icon = document.createElement('div');
      icon.className = 'shop-icon';
      icon.textContent = v.id === 'tank' ? '🔫' : '🚗';

      const info = document.createElement('div');
      info.className = 'shop-info';
      info.innerHTML = `<div class="shop-name">${v.name}</div><div class="shop-price">⭐ ${v.price}</div>`;

      const status = document.createElement('div');
      status.className = 'shop-status';

      card.appendChild(icon);
      card.appendChild(info);
      card.appendChild(status);

      card.addEventListener('click', () => this._handleShopClick(v.id));
      this.shopGrid.appendChild(card);
    });
  }

  _handleShopClick(id) {
    if (this.sound) this.sound.play('click', 0.5);
    const v = this._shopVehicles.find(x => x.id === id);
    if (!v) return;
    const purchases = JSON.parse(localStorage.getItem('highway_rush_purchases') || '[]');
    const equipped = localStorage.getItem('highway_rush_equipped') || 'race';
    const stars = parseInt(localStorage.getItem('highway_rush_stars') || '0', 10);

    if (equipped === id) return;

    if (purchases.includes(id) || id === 'race') {
      import('./YandexSDK.js').then(m => m.equipVehicle ? m.equipVehicle(id) : null).catch(() => {});
      localStorage.setItem('highway_rush_equipped', id);
      this._refreshShop();
      return;
    }

    if (stars >= v.price) {
      const remaining = stars - v.price;
      localStorage.setItem('highway_rush_stars', String(remaining));
      const p = JSON.parse(localStorage.getItem('highway_rush_purchases') || '[]');
      p.push(id);
      localStorage.setItem('highway_rush_purchases', JSON.stringify(p));
      import('./YandexSDK.js').then(m => m.saveStars ? m.saveStars(remaining) : null).catch(() => {});
      localStorage.setItem('highway_rush_equipped', id);
      this._refreshShop();
    }
  }

  _refreshShop() {
    this.shopStarsEl.textContent = `⭐ ${localStorage.getItem('highway_rush_stars') || '0'}`;
    const purchases = JSON.parse(localStorage.getItem('highway_rush_purchases') || '[]');
    const equipped = localStorage.getItem('highway_rush_equipped') || 'race';

    this.shopGrid.querySelectorAll('.shop-card').forEach(card => {
      const id = card.dataset.vehicleId;
      const status = card.querySelector('.shop-status');
      const price = this._shopVehicles.find(v => v.id === id)?.price ?? 0;

      if (id === 'race') {
        status.textContent = id === equipped ? 'ВЫБРАНО' : 'ВЫБРАТЬ';
        status.className = 'shop-status ' + (id === equipped ? 'shop-equipped' : 'shop-select');
        card.classList.toggle('shop-selected', id === equipped);
      } else if (purchases.includes(id)) {
        status.textContent = id === equipped ? 'ВЫБРАНО' : 'ВЫБРАТЬ';
        status.className = 'shop-status ' + (id === equipped ? 'shop-equipped' : 'shop-select');
        card.classList.toggle('shop-selected', id === equipped);
      } else {
        const stars = parseInt(localStorage.getItem('highway_rush_stars') || '0', 10);
        const canAfford = stars >= price;
        status.textContent = canAfford ? `⭐ КУПИТЬ` : `⭐ ${price}`;
        status.className = 'shop-status ' + (canAfford ? 'shop-buy' : 'shop-locked');
        card.classList.remove('shop-selected');
      }
    });
  }

  _updateStartScreen() {
    const equipped = localStorage.getItem('highway_rush_equipped') || 'race';
    const v = this._shopVehicles?.find(x => x.id === equipped);
    const name = v?.name || 'Гоночная машина';
    this.currentVehicleEl.textContent = `🚗 Транспорт: ${name}`;
    this.starTotalEl.textContent = `⭐ Всего: ${localStorage.getItem('highway_rush_stars') || '0'}`;
  }

  getEquippedVehicle() {
    return localStorage.getItem('highway_rush_equipped') || 'race';
  }

  getControlMode() {
    return this.selectedControl;
  }

  getSelectedMode() {
    return this.selectedMode;
  }

  _buildFireButton() {
    this.fireBtn = document.createElement('button');
    this.fireBtn.id = 'fire-btn';
    this.fireBtn.textContent = '🔥';
    this.fireBtn.style.display = 'none';
    document.body.appendChild(this.fireBtn);

    this.ammoLabel = document.createElement('div');
    this.ammoLabel.id = 'ammo-label';
    this.ammoLabel.textContent = '🔫 0/10';
    this.ammoLabel.style.display = 'none';
    document.body.appendChild(this.ammoLabel);
  }

  showFireButton(ammo) {
    this.ammoLabel.textContent = `🔫 ${ammo}/10`;
    this.ammoLabel.style.display = 'block';
    this.fireBtn.style.display = 'flex';
  }

  updateAmmo(ammo) {
    if (ammo > 0) {
      this.ammoLabel.textContent = `🔫 ${ammo}/10`;
      this.ammoLabel.style.display = 'block';
      this.fireBtn.style.display = 'flex';
    } else {
      this.ammoLabel.style.display = 'none';
      this.fireBtn.style.display = 'none';
    }
  }

  hideFireButton() {
    this.ammoLabel.style.display = 'none';
    this.fireBtn.style.display = 'none';
  }

  _buildHUD() {
    this.hud = document.createElement('div');
    this.hud.className = 'hud';
    this.hud.style.display = 'none';
    this.hud.innerHTML = `
      <div class="hud-score" id="hud-score">0</div>
      <div class="hud-mode" id="hud-mode"></div>
      <div class="hud-speed" id="hud-speed">Скорость: 1x</div>
    `;
    this.container.appendChild(this.hud);
    this.hudScore = this.hud.querySelector('#hud-score');
    this.hudMode = this.hud.querySelector('#hud-mode');
    this.hudSpeed = this.hud.querySelector('#hud-speed');

    this.biomeLabel = document.createElement('div');
    this.biomeLabel.className = 'hud-biome';
    this.biomeLabel.textContent = 'Highway';
    this.hud.appendChild(this.biomeLabel);

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
      <h1>АВАРИЯ</h1>
      <div class="final-score" id="final-score">Счёт: 0</div>
      <div class="gameover-btns">
        <button class="btn" id="restart-btn">ЗАНОВО</button>
        <button class="btn btn-secondary" id="menu-btn">ГЛАВНОЕ МЕНЮ</button>
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
    this.hint.innerHTML = '&larr; &rarr; / A D &mdash; ряд &nbsp;&nbsp; &uarr; / W &mdash; газ &nbsp;&nbsp; &darr; / S &mdash; тормоз';
    this.container.appendChild(this.hint);
  }

  _buildPortraitWarning() {
    const el = document.createElement('div');
    el.id = 'portrait-warning';
    el.innerHTML = `
      <div class="pw-icon">📱</div>
      <div class="pw-text">Поверните устройство</div>
      <div class="pw-sub">Для игры используйте альбомную ориентацию</div>
    `;
    document.body.appendChild(el);
    this._portraitWarning = el;

    const check = () => {
      if (window.innerHeight > window.innerWidth && this._gameStarted) {
        el.classList.add('show');
      } else {
        el.classList.remove('show');
      }
    };
    window.addEventListener('resize', check);
    this._checkOrientation = check;
  }

  setGameStarted(v) {
    this._gameStarted = v;
    if (this._checkOrientation) this._checkOrientation();
  }

  updateLoading(loaded, total) {
    const pct = Math.round((loaded / total) * 100);
    this.loadFill.style.width = pct + '%';
    if (loaded === total) {
      this.loadingScreen.querySelector('.hint').textContent = 'Готово!';
    }
  }

  hideLoading() {
    this.loadingScreen.style.display = 'none';
  }

  showStartScreen() {
    this._updateStartScreen();
    this.startScreen.style.display = 'flex';
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
    this.hudSpeed.textContent = `Скорость: ${speed.toFixed(1)}x`;
  }

  updateBiome(name) {
    this.biomeLabel.textContent = name;
  }

  showGameOver(score, stars, mode, reason) {
    const titleEl = this.gameoverScreen.querySelector('h1');
    titleEl.textContent = reason && reason !== 'crash' ? 'ПОБЕДА' : 'АВАРИЯ';
    this.finalScore.textContent = mode === 'time' ? `⭐ собрано ${stars}` : mode === 'stars' ? `Время: ${Math.floor(score)}с` : `Счёт: ${Math.floor(score)}  ⭐ ${stars}`;
    this.gameoverScreen.classList.add('show');
    this.hud.style.display = 'none';
    this.starCounter.style.display = 'none';
    this.hint.style.display = 'none';
    this.hideFireButton();
  }

  hideGameOver() {
    this.gameoverScreen.classList.remove('show');
  }

  showMainMenu() {
    this.gameoverScreen.classList.remove('show');
    this._updateStartScreen();
    this.startScreen.style.display = 'flex';
  }

  showUnlockMessage(msg) {
    const el = document.createElement('div');
    el.className = 'unlock-msg';
    el.textContent = msg || '🚗 РАЗБЛОКИРОВАНО! 🚗';
    this.container.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }
}
