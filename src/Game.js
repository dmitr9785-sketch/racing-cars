import * as THREE from 'three';
import { checkCollision } from './Collision.js';

export class Game {
  constructor(scene, camera, renderer, player, traffic, road, ui) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.player = player;
    this.traffic = traffic;
    this.road = road;
    this.ui = ui;

    this.state = 'start_screen';
    this.score = 0;
    this.baseSpeed = 1;
    this.actualSpeed = 1;
    this.timeElapsed = 0;
    this.lastTime = performance.now();
    this.gasMultiplier = 1;
    this.gasHeld = false;
    this.brakeHeld = false;

    scene.add(player.mesh);

    this._bindKeys();
    this.ui.restartBtn.addEventListener('click', () => this.start());
    this._startLoop();
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
        }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          this.player.switchLane(-1);
        }
        if (e.key === 'r' || e.key === 'R') {
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
    this.baseSpeed = 1;
    this.actualSpeed = 1;
    this.timeElapsed = 0;
    this.gasMultiplier = 1;
    this.gasHeld = false;
    this.brakeHeld = false;
    this.lastTime = performance.now();
    this.traffic.reset();
    this.player.reset();
    this.ui.hideStartScreen();
    this.ui.hideGameOver();
    this.ui.showHUD();
    this.ui.updateScore(0);
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
    this.baseSpeed = 1 + this.timeElapsed * 0.15;

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

    this.player.update(delta);
    this.traffic.update(delta, this.actualSpeed);
    this.road.update(this.actualSpeed, delta);

    const playerBox = this.player.getBox();
    const trafficBoxes = this.traffic.getBoxes();
    const hit = checkCollision(playerBox, trafficBoxes);
    if (hit) {
      this._onCollision(hit);
      return;
    }

    this.ui.updateScore(this.score);
    this.ui.updateSpeed(this.gasMultiplier);
  }

  _onCollision(hitMesh) {
    this.state = 'gameover';
    this.traffic.speed = 0;

    hitMesh.traverse(child => {
      if (child.isMesh && child.material && child.material.color) {
        child.material.color.setHex(0xff0000);
      }
    });

    setTimeout(() => {
      this.ui.showGameOver(this.score);
    }, 400);
  }
}
