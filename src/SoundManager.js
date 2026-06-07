export class SoundManager {
  constructor() {
    this._sounds = {};
    this._engine = null;
    this._music = null;
  }

  init() {
    const files = {
      engine: 'assets/sounds/sound_of_motor.mp3',
      star: 'assets/sounds/starsound.mp3',
      crash: 'assets/sounds/boom_car.mp3',
      switch: 'assets/sounds/povorot_maincar.mp3',
      gameover: 'assets/sounds/gameover (1).mp3',
      click: 'assets/sounds/cartoon-button-click-sound.mp3',
      fanfare: 'assets/sounds/brass-fanfare.mp3',
      timer: 'assets/sounds/timer.mp3',
      music: 'assets/sounds/game_music.mp3',
      rocket: 'assets/sounds/rocket-rocket-sound_1.mp3',
      tank_engine: 'assets/sounds/drive_tank.mp3',
      fire_tank: 'assets/sounds/fire_tank.mp3',
    };
    for (const [key, path] of Object.entries(files)) {
      const audio = new Audio(path);
      audio.preload = 'auto';
      this._sounds[key] = audio;
    }
    this._engine = this._sounds.engine;
    this._music = this._sounds.music;
  }

  play(name, volume = 1) {
    const a = this._sounds[name];
    if (!a) return;
    a.currentTime = 0;
    a.volume = volume;
    a.play().catch(() => {});
  }

  stop(name) {
    const a = this._sounds[name];
    if (!a) return;
    a.pause();
    a.currentTime = 0;
  }

  setEngine(name) {
    if (this._sounds[name]) {
      this._engine = this._sounds[name];
    }
  }

  startEngine() {
    if (!this._engine) return;
    this._engine.loop = true;
    this._engine.volume = 0.5;
    this._engine.playbackRate = 0.8;
    this._engine.play().catch(() => {});
  }

  updateEngine(speed) {
    if (!this._engine || this._engine.paused) return;
    this._engine.playbackRate = 0.8 + speed * 0.15;
    this._engine.volume = Math.min(0.8, 0.3 + speed * 0.08);
  }

  stopEngine() {
    if (!this._engine) return;
    this._engine.pause();
    this._engine.currentTime = 0;
  }

  startMusic() {
    if (!this._music) return;
    this._music.loop = true;
    this._music.volume = 0.2;
    this._music.play().catch(() => {});
  }

  stopMusic() {
    if (!this._music) return;
    this._music.pause();
    this._music.currentTime = 0;
  }

  stopAll() {
    this.stopEngine();
    this.stopMusic();
  }
}
