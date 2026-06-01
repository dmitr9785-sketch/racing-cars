import * as THREE from 'three';
import { checkCollision } from './Collision.js';
import { Biome } from './Biome.js';

export class Game {
  constructor(scene, camera, renderer, traffic, trees, houses, stars, road, ui, sceneSetup, smoke) {
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
    this.unlockCarModel = null;
    this.biome = new Biome();

    this.unlocked = false;

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
    this.ui.restartBtn.addEventListener('click', () => this.start());
    this.ui.menuBtn.addEventListener('click', () => this.goToMainMenu());
    this._startLoop();
  }

  setUnlockCarModel(model) {
    this.unlockCarModel = model;
  }

  setMode(mode) {
    this.mode = mode;
  }

  setPlayer(player) {
    this.player = player;
    this.scene.add(player.mesh);
  }

  goToMainMenu() {
    this.state = 'start_screen';
    if (this.player) {
      this.scene.remove(this.player.mesh);
      this.player = null;
    }
    this.ui.showMainMenu();
  }

  _bindKeys() {
    const handler = (e) => {
      const pressed = e.type === 'keydown';
      if (this.state === 'start_screen') return;

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
          this.player.switchLane(1);
          if (this.smoke && !this.traffic.isPony) {
            const px = this.player.mesh.position.x;
            const pz = this.player.mesh.position.z;
            this.smoke.emit(px, 0, pz, 1);
            this.smoke.emit(px, 0, pz, -1);
          }
        }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          this.player.switchLane(-1);
          if (this.smoke && !this.traffic.isPony) {
            const px = this.player.mesh.position.x;
            const pz = this.player.mesh.position.z;
            this.smoke.emit(px, 0, pz, 1);
            this.smoke.emit(px, 0, pz, -1);
          }
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
    this.unlocked = false;
    this.baseSpeed = 1;
    this.actualSpeed = 1;
    this.timeElapsed = 0;
    this.gasMultiplier = 1;
    this.gasHeld = false;
    this.brakeHeld = false;
    this.lastTime = performance.now();
    this.traffic.reset();
    this.trees.reset();
    this.houses.reset();
    this.stars.reset();
    this.player.reset();
    this.ui.hideStartScreen();
    this.ui.hideGameOver();
    this.ui.showHUD();

    const modeLabels = { endless: 'Endless', time: '60 Seconds', stars: 'Star Rush' };
    this.ui.hudMode.textContent = modeLabels[this.mode] || '';

    if (this.mode === 'time') {
      this.timeLimit = 60;
      this.ui.updateScore(this.timeLimit);
    } else {
      this.ui.updateScore(0);
    }
    this.distance = 0;
    this._treeIdx = -1;
    this.biome.reset();
    this.ui.updateStars(0);
    this.ui.updateSpeed(1);
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
    this.score = this.timeElapsed;
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

    this.distance += delta * 30;
    const biomeState = this.biome.update(this.distance, delta);
    this.sceneSetup.setBiome(biomeState);
    this.road.setBiome(biomeState);
    this.ui.updateBiome(biomeState.name);

    const treeIdx = biomeState.name === 'Savanna' ? 1 : 0;
    if (treeIdx !== this._treeIdx) {
      this._treeIdx = treeIdx;
      this.trees.setModel(treeIdx);
    }

    this.player.update(delta);
    this.traffic.update(delta, this.actualSpeed);
    this.trees.update(delta, this.actualSpeed);
    this.houses.update(delta, this.actualSpeed);
    this.stars.update(delta, this.actualSpeed);
    if (this.smoke) this.smoke.update(delta);
    this.road.update(this.actualSpeed, delta);

    const playerBox = this.player.getBox();
    this.starCount += this.stars.checkCollection(playerBox);
    this.ui.updateStars(this.starCount);

    if (this.starCount >= 100 && !this.unlocked && this.unlockCarModel) {
      this.unlocked = true;
      const newMesh = this.unlockCarModel.clone();
      newMesh.position.copy(this.player.mesh.position);
      newMesh.rotation.copy(this.player.mesh.rotation);
      newMesh.scale.setScalar(0.8);
      newMesh.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
      this.scene.remove(this.player.mesh);
      this.scene.add(newMesh);
      this.player.mesh = newMesh;
      this.ui.showUnlockMessage();
    }

    const trafficBoxes = this.traffic.getBoxes();
    const hit = checkCollision(playerBox, trafficBoxes);
    if (hit) {
      console.log('CRASH! playerBox:', JSON.stringify({min: playerBox.min.toArray(), max: playerBox.max.toArray()}), 'traffic count:', trafficBoxes.length);
      for (const t of trafficBoxes) {
        if (t.box.intersectsBox(playerBox)) {
          console.log('  hit car:', t.mesh.userData.modelId, 'box:', JSON.stringify({min: t.box.min.toArray(), max: t.box.max.toArray()}));
        }
      }
    }

    if (this.mode === 'time') {
      const remaining = Math.max(0, this.timeLimit - this.timeElapsed);
      this.ui.updateScore(remaining);
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

  _onGameOver(reason, hitMesh) {
    this.state = 'gameover';
    this.traffic.speed = 0;

    if (hitMesh) {
      hitMesh.traverse(child => {
        if (child.isMesh && child.material && child.material.color) {
          child.material.color.setHex(0xff0000);
        }
      });
    }

    const prev = parseInt(localStorage.getItem('highway_rush_stars') || '0', 10);
    const total = prev + this.starCount;
    localStorage.setItem('highway_rush_stars', total.toString());

    setTimeout(() => {
      this.ui.showGameOver(this.score, this.starCount, this.mode, reason);
    }, 400);
  }
}
