export class SoundManager {
  constructor() {
    this._ctx = null;
    this._buffers = {};
    this._engineSource = null;
    this._engineGain = null;
    this._musicSource = null;
    this._musicGain = null;
    this._engineId = 'engine';
    this._suspendedForAd = false;
    this._onVisibility = this._onVisibilityChange.bind(this);
  }

  async init() {
    this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    const files = {
      engine: 'assets/sounds/sound_of_motor.mp3',
      star: 'assets/sounds/starsound.mp3',
      crash: 'assets/sounds/boom_car.mp3',
      switch: 'assets/sounds/povorot_maincar.mp3',
      gameover: 'assets/sounds/gameover.mp3',
      click: 'assets/sounds/cartoon-button-click-sound.mp3',
      fanfare: 'assets/sounds/brass-fanfare.mp3',
      timer: 'assets/sounds/timer.mp3',
      music: 'assets/sounds/game_music.mp3',
      rocket: 'assets/sounds/rocket-rocket-sound_1.mp3',
      tank_engine: 'assets/sounds/drive_tank.mp3',
      fire_tank: 'assets/sounds/fire_tank.mp3',
    };
    const entries = Object.entries(files);
    this._total = entries.length;
    this._loaded = 0;
    const promises = entries.map(([key, path]) =>
      fetch(path)
        .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.arrayBuffer(); })
        .then(buf => this._ctx.decodeAudioData(buf))
        .then(ab => { this._buffers[key] = ab; })
        .catch(() => {})
        .finally(() => { this._loaded++; })
    );
    document.addEventListener('visibilitychange', this._onVisibility);
    document.addEventListener('pagehide', this._onVisibility);
    return Promise.all(promises);
  }

  get loaded() { return this._loaded; }
  get total() { return this._total; }

  _ensureRunning() {
    if (this._ctx && this._ctx.state === 'suspended') {
      this._ctx.resume().catch(() => {});
    }
  }

  _onVisibilityChange() {
    if (document.hidden || document.visibilityState === 'hidden') {
      if (this._ctx && this._ctx.state === 'running') {
        this._ctx.suspend().catch(() => {});
      }
    } else {
      if (this._ctx && this._ctx.state === 'suspended' && !this._suspendedForAd) {
        this._ctx.resume().catch(() => {});
      }
    }
  }

  pauseForAd() {
    this._suspendedForAd = true;
    if (this._ctx && this._ctx.state === 'running') {
      this._ctx.suspend().catch(() => {});
    }
  }

  resumeFromAd() {
    this._suspendedForAd = false;
    if (this._ctx && this._ctx.state === 'suspended') {
      this._ctx.resume().catch(() => {});
    }
  }

  play(name, volume = 1) {
    this._ensureRunning();
    const buf = this._buffers[name];
    if (!buf || !this._ctx) return;
    const source = this._ctx.createBufferSource();
    source.buffer = buf;
    const gain = this._ctx.createGain();
    gain.gain.value = volume;
    source.connect(gain);
    gain.connect(this._ctx.destination);
    source.start(0);
  }

  stop(name) {}

  setEngine(name) {
    this._engineId = name;
  }

  startEngine() {
    this._ensureRunning();
    const id = this._engineId;
    const buf = this._buffers[id];
    if (!buf || !this._ctx) return;
    this._stop('_engineSource', '_engineGain');
    const source = this._ctx.createBufferSource();
    source.buffer = buf;
    source.loop = true;
    source.playbackRate.value = 0.8;
    const gain = this._ctx.createGain();
    gain.gain.value = 0.5;
    source.connect(gain);
    gain.connect(this._ctx.destination);
    source.start(0);
    this._engineSource = source;
    this._engineGain = gain;
  }

  updateEngine(speed) {
    if (this._engineSource && this._engineSource.playbackRate) {
      this._engineSource.playbackRate.value = 0.8 + speed * 0.15;
    }
    if (this._engineGain) {
      this._engineGain.gain.value = Math.min(0.8, 0.3 + speed * 0.08);
    }
  }

  stopEngine() {
    this._stop('_engineSource', '_engineGain');
  }

  startMusic() {
    this._ensureRunning();
    const buf = this._buffers.music;
    if (!buf || !this._ctx) return;
    this._stop('_musicSource', '_musicGain');
    const source = this._ctx.createBufferSource();
    source.buffer = buf;
    source.loop = true;
    const gain = this._ctx.createGain();
    gain.gain.value = 0.2;
    source.connect(gain);
    gain.connect(this._ctx.destination);
    source.start(0);
    this._musicSource = source;
    this._musicGain = gain;
  }

  stopMusic() {
    this._stop('_musicSource', '_musicGain');
  }

  stopAll() {
    this.stopEngine();
    this.stopMusic();
  }

  _stop(sourceKey, gainKey) {
    try { this[sourceKey]?.stop(); } catch {}
    this[sourceKey] = null;
    this[gainKey] = null;
  }
}
