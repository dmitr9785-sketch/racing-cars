import * as THREE from 'three';
import { checkCollision } from './Collision.js';
import { Biome } from './Biome.js';
import { gameplayStart, gameplayStop, saveStars } from './YandexSDK.js';
import { TouchControls } from './TouchControls.js';

export class Game {
  constructor(scene, camera, renderer, traffic, trees, houses, stars, road, ui, sceneSetup, smoke, ponyDecor, sound) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.sceneSetup = sceneSetup;
    this.player = null;
    this.traffic = traffic;
    this.trees = trees;
    this.houses = houses;
    this.stars = stars;
    this.road = road;
    this.ui = ui;
    this.smoke = smoke;
    this.ponyDecor = ponyDecor;
    this.biome = new Biome();
    this.sound = sound;
    this.ponyMode = false;
    this.vehicleId = 'race';
    this._smokeZ = -0.6;

    this.state = 'start_screen';
    this.mode = 'endless';
    this.score = 0;
    this.starCount = 0;
    this.baseSpeed = 1;
    this.actualSpeed = 1;
    this.timeElapsed = 0;
    this.lastTime = performance.now();
    this.gasMultiplier = 1;
    this.gasHeld = false;
    this.brakeHeld = false;
    this.distance = 0;

    this._bindKeys();
    this.touch = new TouchControls(this, renderer.domElement);
    this.controlMode = 'swipe';
    this.ui.restartBtn.addEventListener('click', () => { this.sound.play('click'); this.start(); });
    this.ui.menuBtn.addEventListener('click', () => { this.sound.play('click'); this.goToMainMenu(); });
    if (this.ui.fireBtn) {
      this.ui.fireBtn.addEventListener('click', () => {
        if (this.vehicleId === 'sci_fi') this._flySciFi();
        else this._fireTank();
      });
    }
    this._startLoop();
  }

  setMode(mode) {
    this.mode = mode;
  }

  setPlayer(player) {
    this.player = player;
    this.scene.add(player.mesh);
  }

  _setGas(val) { this.gasHeld = val; }
  _setBrake(val) { this.brakeHeld = val; }

  _switchLane(direction) {
    if (!this.player) return;
    this.player.switchLane(direction);
    if (this.smoke && !this.traffic.isPony) {
      const px = this.player.mesh.position.x;
      const pz = this.player.mesh.position.z;
      this.smoke.emit(px, pz, 1, this._smokeZ);
      this.smoke.emit(px, pz, -1, this._smokeZ);
    }
  }

  goToMainMenu() {
    this.state = 'start_screen';
    gameplayStop();
    this.touch.disable();
    this.sound.stopAll();
    this.sound.stop('crash');
    if (this.player) {
      this.scene.remove(this.player.mesh);
      this.player = null;
    }
    this.ui.hideFireButton();
    this.ui.showMainMenu();
  }

  _bindKeys() {
    const handler = (e) => {
      const pressed = e.type === 'keydown';
      if (this.state === 'start_screen') {
        if (e.key === ' ' || e.key === 'Space') e.preventDefault();
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        this.gasHeld = pressed;
        e.preventDefault();
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        this.brakeHeld = pressed;
        e.preventDefault();
      }
      if (pressed) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          this._switchLane(1);
        }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          this._switchLane(-1);
        }
        if (e.key === ' ' || e.key === 'Space') {
          if (this.vehicleId === 'tank') this._fireTank();
          else if (this.vehicleId === 'sci_fi') this._flySciFi();
          e.preventDefault();
        }
        if (e.key === 'r' || e.key === 'R' || e.key === 'к' || e.key === 'К') {
          if (this.state === 'gameover') this.start();
        }
      }
    };
    window.addEventListener('keydown', handler);
    window.addEventListener('keyup', handler);
  }

  start() {
    this.state = 'playing';
    this.score = 0;
    this.starCount = 0;
    this.baseSpeed = 1;
    this.actualSpeed = 1;
    this.timeElapsed = 0;
    this.gasMultiplier = 1;
    this.gasHeld = false;
    this.brakeHeld = false;
    this.lastTime = performance.now();
    this._lastTick = -1;
    this.traffic.reset();
    this.trees.reset();
    this.houses.reset();
    this.stars.reset();
    this.player.reset();
    this.ui.hideStartScreen();
    this.ui.hideGameOver();
    this.ui.showHUD();

    const modeLabels = { endless: 'Бесконечный', time: '60 Секунд', stars: 'Гонка за звёздами' };
    this.ui.hudMode.textContent = modeLabels[this.mode] || '';

    if (this.mode === 'time') {
      this.timeLimit = 60;
      this.ui.updateScore(this.timeLimit);
    } else {
      this.ui.updateScore(0);
    }
    this.distance = 0;
    this._treeIdx = -1;
    this._lastTick = -1;
    this._wasAtLane = true;
    if (this.vehicleId === 'tank') {
      this.player.ammo = 10;
    }
    this.ui.updateAmmo(this.player.ammo);
    if (this.vehicleId === 'tank') {
      this.sound.setEngine('tank_engine');
    } else {
      this.sound.setEngine('engine');
    }
    if (this.vehicleId === 'sci_fi') {
      this.player.flyCount = 0;
      this.player.maxFlyCount = 3;
      this.ui.ammoLabel.textContent = '⬆ 3/3';
      this.ui.ammoLabel.style.display = 'block';
      this.ui.fireBtn.textContent = '⬆';
      this.ui.fireBtn.style.display = 'flex';
    } else if (this.vehicleId === 'tank') {
      this.ui.fireBtn.textContent = '🔥';
    }
    gameplayStart();
    this.biome.setPonyMode(this.ponyMode);
    this.road.setPonyMode(this.ponyMode);
    if (this.ponyDecor) this.ponyDecor.reset();
    this.ui.updateStars(0);
    this.ui.updateSpeed(1);
    this.sound.stop('crash');
    this.sound.startEngine();
    this.sound.startMusic();
    this.ui.setGameStarted(true);
    this.touch.setMode(this.controlMode);
    this.touch.enable();
  }

  _startLoop() {
    const loop = (now) => {
      requestAnimationFrame(loop);

      if (this.state === 'start_screen') {
        this.renderer.render(this.scene, this.camera);
        return;
      }

      const delta = Math.min((now - this.lastTime) / 1000, 0.05);
      this.lastTime = now;

      this.renderer.render(this.scene, this.camera);

      if (this.state === 'playing') {
        this._update(delta);
      }
    };
    requestAnimationFrame(loop);
  }

  _update(delta) {
    this.timeElapsed += delta;
    this.score = this.timeElapsed * 50;
    this.baseSpeed = 1 + this.timeElapsed * 0.08;

    if (this.gasHeld) {
      this.gasMultiplier = Math.min(8, this.gasMultiplier + delta * 2.0);
    } else if (this.brakeHeld) {
      this.gasMultiplier = Math.max(0.3, this.gasMultiplier - delta * 2.5);
    } else if (this.gasMultiplier > 1) {
      this.gasMultiplier = Math.max(1, this.gasMultiplier - delta * 1.5);
    } else if (this.gasMultiplier < 1) {
      this.gasMultiplier = Math.min(1, this.gasMultiplier + delta * 0.5);
    }

    this.actualSpeed = this.baseSpeed * this.gasMultiplier;
    this.sound.updateEngine(this.actualSpeed);

    this.distance += delta * 30;
    const biomeState = this.biome.update(this.distance, delta);
    this.sceneSetup.setBiome(biomeState);
    this.road.setBiome(biomeState);
    this.ui.updateBiome(biomeState.name);

    if (this.ponyMode) {
      if (this.ponyDecor) {
        this.ponyDecor.setBiome(biomeState.name);
        this.ponyDecor.update(delta, this.actualSpeed);
      }
    } else {
      const treeIdx = biomeState.name === 'Саванна' ? 1 : biomeState.name === 'Пустыня' ? 2 : 0;
      if (treeIdx !== this._treeIdx) {
        this._treeIdx = treeIdx;
        this.trees.setModel(treeIdx);
        this.houses.setEnabled(biomeState.name !== 'Пустыня');
      }
      this.trees.update(delta, this.actualSpeed);
      this.houses.update(delta, this.actualSpeed);
    }

    this.player.update(delta, this.gasHeld, this.brakeHeld);
    const atLane = Math.abs(this.player.mesh.position.x - this.player.targetX) < 0.01;
    if (!atLane && this._wasAtLane) this.sound.play('switch', 0.5);
    this._wasAtLane = atLane;
    this.traffic.update(delta, this.actualSpeed);
    this.stars.update(delta, this.actualSpeed);
    if (this.smoke) this.smoke.update(delta);
    this.road.update(this.actualSpeed, delta);

    const playerBox = this.player.getBox();
    const collected = this.stars.checkCollection(playerBox);
    if (collected > 0) this.sound.play('star', 0.6);
    this.starCount += collected;
    this.ui.updateStars(this.starCount);

    const trafficBoxes = this.traffic.getBoxes();
    const hit = !this.player.isFlying && checkCollision(playerBox, trafficBoxes);

    if (this.mode === 'time') {
      const remaining = Math.max(0, this.timeLimit - this.timeElapsed);
      this.ui.updateScore(remaining);
      if (remaining <= 10 && remaining > 0 && Math.floor(remaining) !== this._lastTick) {
        this._lastTick = Math.floor(remaining);
        this.sound.play('timer', 0.4);
      }
      if (hit || remaining <= 0) {
        this._onGameOver(hit ? 'crash' : 'time', hit || null);
        return;
      }
    } else if (this.mode === 'stars') {
      if (hit) {
        this._onGameOver('crash', hit);
        return;
      }
      if (this.starCount >= 10) {
        this._onGameOver('stars');
        return;
      }
      this.ui.updateScore(this.score);
    } else {
      if (hit) {
        this._onGameOver('crash', hit);
        return;
      }
      this.ui.updateScore(this.score);
    }

    this.ui.updateSpeed(this.gasMultiplier);
  }

  _fireTank() {
    if (this.state !== 'playing') return;
    if (!this.player || this.player.ammo <= 0) return;
    this.player.ammo--;
    this.ui.updateAmmo(this.player.ammo);
    this.sound.play('fire_tank', 0.5);
    const px = this.player.mesh.position.x;
    const pz = this.player.mesh.position.z;
    const _box = new THREE.Box3().setFromObject(this.player.mesh);
    const _cx = (_box.min.x + _box.max.x) / 2;
    const flash = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffff00 }));
    flash.position.set(_cx, _box.max.y - 0.3, _box.max.z + 0.1);
    this.scene.add(flash);
    setTimeout(() => { this.scene.remove(flash); }, 80);
    const target = this.traffic.findCarInFront(px, pz, 15);
    if (target) {
      this.traffic.destroyCar(target);
      if (this.smoke) this.smoke.emitAt(target.position.x, 0.5, target.position.z, 5);
    } else {
      if (this.smoke) this.smoke.emitAt(px, 0.3, pz + 5, 3);
    }
  }

  _flySciFi() {
    if (this.state !== 'playing') return;
    if (!this.player || this.player.flyCount >= this.player.maxFlyCount) return;
    this.player.startFly();
    const remaining = this.player.maxFlyCount - this.player.flyCount;
    this.ui.ammoLabel.textContent = `⬆ ${remaining}/3`;
    if (remaining <= 0) { this.ui.ammoLabel.style.display = 'none'; this.ui.fireBtn.style.display = 'none'; }
    this.sound.play('rocket', 0.5);
  }

  _onGameOver(reason, hitMesh) {
    this.state = 'gameover';
    this.traffic.speed = 0;
    this.ui.setGameStarted(false);
    this.touch.disable();
    gameplayStop();
    this.sound.stopEngine();
    this.sound.stopMusic();
    if (reason === 'crash') {
      this.sound.play('crash', 0.7);
    } else {
      this.sound.play('gameover', 0.6);
    }

    const prev = parseInt(localStorage.getItem('highway_rush_stars') || '0', 10);
    const total = prev + this.starCount;
    saveStars(total);

    setTimeout(() => {
      const displayScore = this.mode === 'stars' ? this.timeElapsed : this.score;
      this.ui.showGameOver(displayScore, this.starCount, this.mode, reason);
    }, 400);
  }
}
