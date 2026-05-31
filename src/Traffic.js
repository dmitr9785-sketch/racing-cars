import * as THREE from 'three';
import { getLanePositions } from './Road.js';

const SPAWN_Z = 25;
const DESPAWN_Z = -2;
const POOL_SIZE = 8;

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

const COLORS = [0xcc4444, 0x44aa44, 0x2266cc, 0xddcc33, 0xdd44aa, 0xffffff, 0x333333, 0xee8833, 0x33bbbb, 0xbb44dd, 0xddaa22, 0x44dd88];

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

function _buildPool(models, modelIds, scene, randomizeColors, scale = 0.8) {
  const pool = [];
  for (let i = 0; i < POOL_SIZE; i++) {
    const idx = Math.floor(Math.random() * models.length);
    const base = models[idx];
    const mesh = cloneWithMaterials(base);
    mesh.userData.modelIdx = idx;
    if (modelIds) mesh.userData.modelId = modelIds[idx];
    mesh.scale.setScalar(scale);
    if (randomizeColors) randomColor(mesh);
    mesh.traverse(c => { if (c.isMesh) { c.castShadow = false; c.receiveShadow = false; } });
    mesh.visible = false;
    pool.push(mesh);
  }
  return pool;
}

export class Traffic {
  constructor(trafficModels, trafficModelIds, scene, ponyModels) {
    this.trafficModels = trafficModels;
    this.scene = scene;
    this.lanePositions = getLanePositions();
    this.speed = 0;
    this.timeSinceSpawn = 0;

    this.carPool = _buildPool(trafficModels, trafficModelIds, scene, false, 0.8);
    this.ponyPool = ponyModels && ponyModels.length ? _buildPool(ponyModels, null, scene, false, 2.5) : [];
    this.isPony = false;
    this.cars = this.carPool;
  }

  setPonyMode(on) {
    if (on === this.isPony) return;
    this.isPony = on;

    const hide = on ? this.carPool : this.ponyPool;
    const show = on ? this.ponyPool : this.carPool;

    for (const car of hide) {
      if (car.visible) {
        car.visible = false;
        this.scene.remove(car);
      }
    }

    this.cars = show;
    this.timeSinceSpawn = 999;
  }

  spawn() {
    const car = this.cars.find(c => !c.visible);
    if (!car) return;

    const lane = Math.floor(Math.random() * this.lanePositions.length);
    const x = this.lanePositions[lane];
    let z = SPAWN_Z + Math.random() * 15;
    let attempts = 0;

    while (attempts < 5) {
      let blocked = false;
      for (const other of this.cars) {
        if (!other.visible || other === car) continue;
        if (Math.abs(other.position.x - x) < 2 && Math.abs(other.position.z - z) < 5) {
          blocked = true;
          break;
        }
      }
      if (!blocked) break;
      z = SPAWN_Z + Math.random() * 15;
      attempts++;
    }

    car.scale.setScalar(0.8);
    car.rotation.set(0, 0, 0);
    car.position.set(x, 0, z);
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

    const closeRate = 1.5 + this.speed * 0.5;
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
    for (const car of this.carPool) {
      if (car.visible) { car.visible = false; this.scene.remove(car); }
    }
    for (const car of this.ponyPool) {
      if (car.visible) { car.visible = false; this.scene.remove(car); }
    }
    this.timeSinceSpawn = 0;
  }
}
