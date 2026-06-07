export class TouchControls {
  constructor(game, canvas) {
    this.game = game;
    this.canvas = canvas;
    this.mode = 'swipe';
    this._enabled = false;
    this._touchId = null;
    this._startX = 0;
    this._swipeTriggered = false;
    this._zone = null;

    this._buttonsContainer = null;
    this._gasBtn = null;
    this._brakeBtn = null;
    this._leftBtn = null;
    this._rightBtn = null;
    this._gasTouchId = null;
    this._brakeTouchId = null;

    this._fullscreenBtn = null;

    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);

    this._onTouchCancel = this._onTouchCancel.bind(this);
    this.canvas.addEventListener('touchstart', this._onTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this._onTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this._onTouchEnd, { passive: false });
    this.canvas.addEventListener('touchcancel', this._onTouchCancel, { passive: false });

    this._buildFullscreenBtn();
  }

  setMode(mode) {
    this.mode = mode;
    if (mode === 'buttons') {
      this._buildButtons();
    } else {
      this._removeButtons();
    }
  }

  enable() { this._enabled = true; }
  disable() { this._enabled = false; }
  isEnabled() { return this._enabled; }

  _onTouchStart(e) {
    if (!this._enabled || this.game.state === 'start_screen') return;
    e.preventDefault();

    if (this.mode === 'swipe') {
      this._handleSwipeStart(e);
    }
  }

  _onTouchMove(e) {
    if (!this._enabled) return;
    if (this.mode === 'swipe') {
      this._handleSwipeMove(e);
    }
  }

  _onTouchEnd(e) {
    if (this.mode === 'swipe') {
      this._handleSwipeEnd(e);
    }
  }

  _onTouchCancel(e) {
    if (this._zone === 'gas') this.game._setGas(false);
    else if (this._zone === 'brake') this.game._setBrake(false);
    this._zone = null;
    this._touchId = null;
  }

  _handleSwipeStart(e) {
    const t = e.changedTouches[0];
    this._touchId = t.identifier;
    this._startX = t.clientX;
    this._swipeTriggered = false;

    const halfW = window.innerWidth / 2;
    if (t.clientX < halfW) {
      this._zone = 'brake';
      this.game._setBrake(true);
    } else {
      this._zone = 'gas';
      this.game._setGas(true);
    }
  }

  _handleSwipeMove(e) {
    const t = this._findTouch(e.changedTouches);
    if (!t) return;
    const dx = t.clientX - this._startX;
    if (!this._swipeTriggered && Math.abs(dx) > 30) {
      this._swipeTriggered = true;
      this.game._switchLane(dx > 0 ? -1 : 1);
    }
  }

  _handleSwipeEnd(e) {
    const t = this._findTouch(e.changedTouches);
    if (t && this._zone) {
      if (this._zone === 'gas') this.game._setGas(false);
      else this.game._setBrake(false);
      this._zone = null;
    }
    this._touchId = null;
  }

  _findTouch(list) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].identifier === this._touchId) return list[i];
    }
    return null;
  }

  _buildButtons() {
    if (this._buttonsContainer) return;
    const c = document.createElement('div');
    c.id = 'touch-buttons';
    c.innerHTML = `
      <div class="tb-corner tb-corner-left">
        <button class="tb-btn tb-btn-left">&#8592;</button>
        <button class="tb-btn tb-btn-right">&#8594;</button>
      </div>
      <div class="tb-corner tb-corner-right">
        <button class="tb-btn tb-gas"><svg viewBox="0 0 113 256" width="20" height="44"><g transform="translate(0,256) scale(0.1,-0.1)" fill="#4ade80" stroke="#166534" stroke-width="8"><path d="M440 2240 l0 -271 158 3 157 3 0 265 0 265 -157 3 -158 3 0 -271z"/><path d="M334 1851 c-18 -11 -36 -25 -40 -33 -5 -7 -11 -191 -14 -409 l-5 -395 -105 -159 -105 -160 -3 -272 c-3 -307 0 -328 63 -357 49 -24 681 -24 730 0 68 32 65 -6 65 894 0 900 3 862 -65 894 -27 13 -74 16 -262 16 -207 0 -231 -2 -259 -19z m412 -226 c15 -23 15 -27 0 -50 -16 -25 -19 -25 -149 -25 -143 0 -157 5 -157 50 0 45 14 50 157 50 130 0 133 0 149 -25z m-2 -207 c21 -30 20 -44 -4 -68 -18 -18 -33 -20 -138 -20 -129 0 -162 11 -162 55 0 48 21 55 160 55 122 0 130 -1 144 -22z m-4 -208 c24 -24 25 -38 4 -68 -14 -21 -22 -22 -144 -22 -139 0 -160 7 -160 55 0 44 33 55 162 55 105 0 120 -2 138 -20z m6 -225 c15 -23 15 -27 0 -50 -16 -25 -19 -25 -149 -25 -143 0 -157 5 -157 50 0 45 14 50 157 50 130 0 133 0 149 -25z m-2 -207 c21 -30 20 -44 -4 -68 -18 -18 -33 -20 -193 -20 -140 0 -177 3 -195 16 -26 18 -28 50 -5 76 14 16 35 18 199 18 178 0 183 -1 198 -22z m-4 -208 c24 -24 25 -38 4 -68 -15 -22 -18 -22 -254 -22 -236 0 -239 0 -254 22 -21 30 -20 44 4 68 19 19 33 20 250 20 217 0 231 -1 250 -20z m6 -225 c15 -23 15 -27 0 -50 l-16 -25 -240 0 -240 0 -16 25 c-15 23 -15 27 0 50 l16 25 240 0 240 0 16 -25z"/></g></svg></button>
        <button class="tb-btn tb-brake"><svg viewBox="0 0 146 256" width="22" height="44"><g transform="translate(0,256) scale(0.1,-0.1)" fill="#f87171" stroke="#991b1b" stroke-width="8"><path d="M640 2240 l0 -270 160 0 160 0 0 270 0 270 -160 0 -160 0 0 -270z"/><path d="M273 1854 c-59 -29 -63 -52 -63 -353 l0 -272 91 -136 c51 -75 103 -147 117 -160 l25 -23 354 0 c216 0 362 4 373 10 10 5 64 77 119 159 l101 150 0 271 c0 227 -3 277 -16 305 -31 65 -27 65 -576 65 -427 0 -497 -3 -525 -16z m943 -229 c15 -23 15 -27 0 -50 l-16 -25 -400 0 -400 0 -16 25 c-15 23 -15 27 0 50 l16 25 400 0 400 0 16 -25z m-2 -207 c21 -30 20 -44 -4 -68 -19 -19 -33 -20 -410 -20 -377 0 -391 1 -410 20 -24 24 -25 38 -4 68 l15 22 399 0 399 0 15 -22z m-66 -204 c26 -18 29 -56 6 -78 -13 -14 -60 -16 -354 -16 -368 0 -370 0 -370 55 0 53 17 55 370 55 278 0 329 -2 348 -16z"/></g></svg></button>
      </div>
    `;
    document.body.appendChild(c);
    this._buttonsContainer = c;

    this._leftBtn = c.querySelector('.tb-btn-left');
    this._rightBtn = c.querySelector('.tb-btn-right');
    this._gasBtn = c.querySelector('.tb-gas');
    this._brakeBtn = c.querySelector('.tb-brake');

    this._leftBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.game._switchLane(1);
    }, { passive: false });

    this._rightBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.game._switchLane(-1);
    }, { passive: false });

    this._gasBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this._gasTouchId = e.changedTouches[0].identifier;
      this.game._setGas(true);
    }, { passive: false });
    this._gasBtn.addEventListener('touchend', (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === this._gasTouchId) {
          this.game._setGas(false);
          this._gasTouchId = null;
        }
      }
    }, { passive: false });
    this._gasBtn.addEventListener('touchcancel', () => {
      this.game._setGas(false);
      this._gasTouchId = null;
    }, { passive: false });

    this._brakeBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this._brakeTouchId = e.changedTouches[0].identifier;
      this.game._setBrake(true);
    }, { passive: false });
    this._brakeBtn.addEventListener('touchend', (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === this._brakeTouchId) {
          this.game._setBrake(false);
          this._brakeTouchId = null;
        }
      }
    }, { passive: false });
    this._brakeBtn.addEventListener('touchcancel', () => {
      this.game._setBrake(false);
      this._brakeTouchId = null;
    }, { passive: false });
  }

  _removeButtons() {
    if (this._buttonsContainer) {
      this._buttonsContainer.remove();
      this._buttonsContainer = null;
      this._gasBtn = null;
      this._brakeBtn = null;
      this._leftBtn = null;
      this._rightBtn = null;
    }
  }

  _buildFullscreenBtn() {
    this._fullscreenBtn = document.createElement('button');
    this._fullscreenBtn.id = 'fs-btn';
    this._fullscreenBtn.textContent = '⛶';
    this._fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    });
    document.body.appendChild(this._fullscreenBtn);
  }

  destroy() {
    this.disable();
    this.canvas.removeEventListener('touchstart', this._onTouchStart);
    this.canvas.removeEventListener('touchmove', this._onTouchMove);
    this.canvas.removeEventListener('touchend', this._onTouchEnd);
    this.canvas.removeEventListener('touchcancel', this._onTouchCancel);
    this._removeButtons();
    this._fullscreenBtn?.remove();
  }
}
