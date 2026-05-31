import * as THREE from 'three';
import { getLanePositions } from './Road.js';

export class Player {
  constructor(model, scale = 0.8) {
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
    this.mesh.position.set(this.targetX, 0, this.z);
    this.mesh.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
  }

  switchLane(direction) {
    const newLane = this.currentLane + direction;
    if (newLane < 0 || newLane >= this.lanePositions.length) return;
    this.currentLane = newLane;
    this.targetLane = newLane;
    this.targetX = this.lanePositions[newLane];
  }

  update(delta) {
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
  }

  getBox() {
    const box = new THREE.Box3();
    this.mesh.traverse(child => {
      if (child.isMesh && child.visible) {
        box.expandByObject(child);
      }
    });
    if (box.min.x === Infinity) return new THREE.Box3().setFromObject(this.mesh);
    return box;
  }

  reset() {
    this.currentLane = 1;
    this.targetLane = 1;
    this.targetX = this.lanePositions[1];
    this.mesh.position.set(this.targetX, 0, this.z);
    this.mesh.rotation.set(0, 0, 0);
  }
}
