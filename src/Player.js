import * as THREE from 'three';
import { getLanePositions } from './Road.js';

export class Player {
  constructor(model, scale = 0.8, yOffset = 0, xOffset = 0, rotationY = 0, scaleZ = 1, zOffset = 0, scaleX = 1) {
    this.ammo = 0;
    this.yOffset = yOffset;
    this.xOffset = xOffset;
    this.zOffset = zOffset;
    this.rotationY = rotationY;
    this.lanePositions = getLanePositions();
    this.currentLane = 1;
    this.targetLane = 1;
    this.targetX = this.lanePositions[1];
    this.z = 0;
    this.switchSpeed = 8;

    this.mesh = model.clone();
    this.mesh.traverse(child => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map(m => m.clone());
        } else {
          child.material = child.material.clone();
        }
      }
    });
    this.mesh.scale.setScalar(scale);
    if (scaleX !== 1) this.mesh.scale.x *= scaleX;
    if (scaleZ !== 1) this.mesh.scale.z *= scaleZ;
    this.mesh.position.set(this.targetX, 0, this.z);
    this.mesh.position.x += this.xOffset;
    this.mesh.position.y = this.yOffset;
    this.mesh.position.z += this.zOffset;
    this.mesh.rotation.y = this.rotationY;
    this.mesh.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
    this._pitch = 0;
    this.flyTime = 0;
    this.flyCount = 0;
    this.maxFlyCount = 3;
    this.isFlying = false;
    this._flyBaseY = this.yOffset;
  }

  switchLane(direction) {
    const newLane = this.currentLane + direction;
    if (newLane < 0 || newLane >= this.lanePositions.length) return;
    this.currentLane = newLane;
    this.targetLane = newLane;
    this.targetX = this.lanePositions[newLane];
  }

  startFly() {
    if (this.flyCount >= this.maxFlyCount) return;
    this.flyCount++;
    this.flyTime = 1.5;
    this.isFlying = true;
  }

  update(delta, gasHeld, brakeHeld) {
    const dx = this.targetX - this.mesh.position.x;
    if (Math.abs(dx) > 0.01) {
      const step = this.switchSpeed * delta;
      this.mesh.position.x += Math.sign(dx) * Math.min(step, Math.abs(dx));
      const lean = THREE.MathUtils.clamp(-dx * 0.6, -0.3, 0.3);
      this.mesh.rotation.z = lean;
    } else {
      this.mesh.position.x = this.targetX;
      this.mesh.rotation.z *= 0.9;
    }

    if (this.isFlying) {
      this.flyTime -= delta;
      const t = 1 - this.flyTime / 1.5;
      if (t < 0.3) {
        this.mesh.position.y = this._flyBaseY + t / 0.3 * 3;
      } else if (t < 0.7) {
        this.mesh.position.y = this._flyBaseY + 3;
      } else {
        this.mesh.position.y = this._flyBaseY + 3 * (1 - (t - 0.7) / 0.3);
      }
      if (this.flyTime <= 0) {
        this.isFlying = false;
        this.mesh.position.y = this._flyBaseY;
      }
    }

    const targetPitch = gasHeld ? -0.12 : brakeHeld ? 0.08 : 0;
    this._pitch += (targetPitch - this._pitch) * Math.min(1, delta * 5);
    this.mesh.rotation.x = this._pitch;
  }

  getBox() {
    this.mesh.updateMatrixWorld(true);
    const box = new THREE.Box3();
    this.mesh.traverse(child => {
      if (child.isMesh && child.visible && child.geometry) {
        const geo = child.geometry;
        if (geo.boundingBox === null) geo.computeBoundingBox();
        const b = geo.boundingBox.clone().applyMatrix4(child.matrixWorld);
        box.expandByPoint(b.min);
        box.expandByPoint(b.max);
      }
    });
    if (box.min.x === Infinity) return new THREE.Box3().setFromObject(this.mesh);
    return box;
  }

  reset() {
    this.ammo = 0;
    this.flyTime = 0;
    this.flyCount = 0;
    this.isFlying = false;
    this._flyBaseY = this.yOffset;
    this.currentLane = 1;
    this.targetLane = 1;
    this.targetX = this.lanePositions[1];
    this.mesh.position.set(this.targetX + this.xOffset, this.yOffset, this.z + this.zOffset);
    this.mesh.rotation.set(0, this.rotationY, 0);
  }
}
