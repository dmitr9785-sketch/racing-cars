import * as THREE from 'three';
import { getLanePositions } from './Road.js';

const SPAWN_Z = 50;
const DESPAWN_Z = -4;
const POOL_SIZE = 12;

function cloneWithMaterials(src) {
  const clone = src.clone();
  clone.traverse(child => {
    if (child.isMesh && child.material) {
      if (Array.isArray(child.material)) {
        child.material = child.material.map(m => m.clone());
      } else {
        child.material = child.material.clone();
      }
    }
  });
  return clone;
}

const COLORS = [0xcc4444, 0x44aa44, 0x4488cc, 0xcccc44, 0xcc44cc, 0xffffff, 0x444444, 0xdd8833];

function randomColor(mesh) {
  const c = COLORS[Math.floor(Math.random() * COLORS.length)];
  mesh.traverse(child => {
    if (child.isMesh && child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      for (const m of mats) {
        if (m.color) m.color.setHex(c);
      }
    }
  });
}

export class Traffic {
  constructor(trafficModels, scene) {
    this.trafficModels = trafficModels;
    this.scene = scene;
    this.lanePositions = getLanePositions();
    this.cars = [];
    this.speed = 0;
    this.timeSinceSpawn = 0;

    for (let i = 0; i < POOL_SIZE; i++) {
      const base = this._randomModel();
      const mesh = cloneWithMaterials(base);
      mesh.scale.setScalar(0.8);
      randomColor(mesh);
      mesh.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
      mesh.visible = false;
      this.cars.push(mesh);
    }
  }

  _randomModel() {
    return this.trafficModels[Math.floor(Math.random() * this.trafficModels.length)];
  }

  spawn() {
    const car = this.cars.find(c => !c.visible);
    if (!car) return;

    const lane = Math.floor(Math.random() * this.lanePositions.length);
    const x = this.lanePositions[lane];
    const z = SPAWN_Z + Math.random() * 15;

    car.position.set(x, 0, z);
    car.rotation.set(0, 0, 0);
    car.visible = true;
    this.scene.add(car);
  }

  update(delta, speed) {
    this.speed = speed;
    this.timeSinceSpawn += delta;

    const interval = Math.max(0.6, 4 - this.speed * 0.2);
    if (this.timeSinceSpawn >= interval) {
      this.spawn();
      this.timeSinceSpawn = 0;
    }

    const closeRate = 2 + this.speed * 0.8;
    for (const car of this.cars) {
      if (!car.visible) continue;
      car.position.z -= closeRate * delta;

      if (car.position.z < DESPAWN_Z) {
        car.visible = false;
        this.scene.remove(car);
      }
    }
  }

  getBoxes() {
    return this.cars.filter(c => c.visible).map(c => ({
      mesh: c,
      box: new THREE.Box3().setFromObject(c),
    }));
  }

  reset() {
    for (const car of this.cars) {
      if (car.visible) {
        car.visible = false;
        this.scene.remove(car);
      }
    }
    this.timeSinceSpawn = 0;
  }
}
