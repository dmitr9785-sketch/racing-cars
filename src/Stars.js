import * as THREE from 'three';
import { getLanePositions } from './Road.js';

const SPAWN_Z = 30;
const DESPAWN_Z = -3;
const POOL_SIZE = 6;

export class Stars {
  constructor(starModel, scene) {
    this.scene = scene;
    this.stars = [];
    this.timeSinceSpawn = 0;

    for (let i = 0; i < POOL_SIZE; i++) {
      const mesh = starModel.clone();
      const s = 0.3 + Math.random() * 0.2;
      mesh.scale.setScalar(s);
      mesh.traverse(c => {
        if (c.isMesh) {
          c.castShadow = false;
          c.receiveShadow = false;
        }
      });
      mesh.visible = false;
      this.stars.push(mesh);
    }
  }

  spawn() {
    const star = this.stars.find(s => !s.visible);
    if (!star) return;

    const lanes = getLanePositions();
    const lane = Math.floor(Math.random() * lanes.length);
    const x = lanes[lane];
    const z = SPAWN_Z + Math.random() * 15;

    star.position.set(x, 0.3, z);
    star.rotation.set(0, 0, 0);
    star.visible = true;
    this.scene.add(star);
  }

  update(delta, speed) {
    this.timeSinceSpawn += delta;
    const interval = Math.max(1.5, 6 - speed * 0.3);
    if (this.timeSinceSpawn >= interval) {
      this.spawn();
      this.timeSinceSpawn = 0;
    }

    for (const star of this.stars) {
      if (!star.visible) continue;
      star.position.z -= (2 + speed * 0.8) * delta;
      star.rotation.y += delta * 2;
      star.position.y = 0.3 + Math.sin(performance.now() / 300) * 0.15;

      if (star.position.z < DESPAWN_Z) {
        star.visible = false;
        this.scene.remove(star);
      }
    }
  }

  checkCollection(playerBox) {
    let collected = 0;
    for (const star of this.stars) {
      if (!star.visible) continue;
      const box = new THREE.Box3().setFromObject(star);
      if (playerBox.intersectsBox(box)) {
        star.visible = false;
        this.scene.remove(star);
        collected++;
      }
    }
    return collected;
  }

  reset() {
    for (const star of this.stars) {
      if (star.visible) {
        star.visible = false;
        this.scene.remove(star);
      }
    }
    this.timeSinceSpawn = 0;
  }
}
