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
      <div class="tb-left">
        <button class="tb-btn tb-btn-left" data-dir="left">&#8592;</button>
      </div>
      <div class="tb-right">
        <button class="tb-btn tb-btn-right" data-dir="right">&#8594;</button>
      </div>
      <div class="tb-pedals">
        <button class="tb-btn tb-brake">ТОРМОЗ</button>
        <button class="tb-btn tb-gas">ГАЗ</button>
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
