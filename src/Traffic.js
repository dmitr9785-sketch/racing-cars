import * as THREE from 'three';
import { getLanePositions } from './Road.js';

const SPAWN_Z = 25;
const DESPAWN_Z = -2;
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

function fixVisibility(mesh) {
  mesh.traverse(child => {
    if (!child.isMesh) return;
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    for (const m of mats) {
      if (m.transparent) m.transparent = false;
      if (m.opacity !== undefined) m.opacity = 1;
      if (m.color && m.color.getHex() < 0x111111) m.color.setHex(0x888888);
    }
  });
}

function _buildPool(models, modelIds, scene, randomizeColors, scale = 0.8) {
  const pool = [];
  for (let i = 0; i < models.length; i++) {
    const base = models[i];
    const mesh = cloneWithMaterials(base);
    mesh.userData.modelIdx = i;
    if (modelIds) mesh.userData.modelId = modelIds[i];
    mesh.scale.setScalar(scale);
    if (randomizeColors) randomColor(mesh);
    fixVisibility(mesh);
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
    const invisible = this.cars.filter(c => !c.visible);
    if (!invisible.length) return;
    const car = invisible[Math.floor(Math.random() * invisible.length)];
    console.log('Spawning', car.userData.modelId, 'poolIdx', this.cars.indexOf(car));

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

    const box = new THREE.Box3().setFromObject(car);
    if (box.min.x === Infinity) console.warn('Traffic: empty bounding box for', car.userData.modelId);

    if (car.userData.modelId === 'traffic_9') {
      car.scale.setScalar(0.6);
      car.rotation.set(0, 0, 0);
      car.position.set(x, 0.1, z);
    } else if (car.userData.modelId === 'traffic_10') {
      car.scale.setScalar(0.25);
      car.rotation.set(0, 0, 0);
      car.position.set(x, 0, z);
    } else {
      car.scale.setScalar(0.8);
      car.rotation.set(0, 0, 0);
      car.position.set(x, 0, z);
    }
    car.visible = true;
    this.scene.add(car);
  }

  update(delta, speed) {
    this.speed = speed;
    this.timeSinceSpawn += delta;
    const visibleCars = this.cars.filter(c => c.visible).length;
    if (this.timeSinceSpawn < 0.1) {
      console.log('Traffic update start: visibleCars=', visibleCars, 'cars in pool=', this.cars.length);
    }

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
        console.log('Despawned', car.userData.modelId);
      }
    }
  }

  getBoxes() {
    return this.cars.filter(c => c.visible).map(c => {
      c.updateMatrixWorld(true);
      const box = new THREE.Box3();
      const tmpVec = new THREE.Vector3();
      c.traverse(child => {
        if (child.isMesh && child.visible && child.geometry) {
          const geo = child.geometry;
          if (geo.boundingBox === null) geo.computeBoundingBox();
          const b = geo.boundingBox.clone().applyMatrix4(child.matrixWorld);
          box.expandByPoint(b.min);
          box.expandByPoint(b.max);
        }
      });
      if (box.min.x === Infinity) box.setFromObject(c);
      return { mesh: c, box };
    });
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
