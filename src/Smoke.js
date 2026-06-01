import * as THREE from 'three';

const POOL_SIZE = 12;
const LIFETIME = 0.5;
const GROW = 3;

export class Smoke {
  constructor(model, scene) {
    this.scene = scene;
    this.pool = [];

    for (let i = 0; i < POOL_SIZE; i++) {
      const mesh = model.clone();
      mesh.scale.setScalar(0.01);
      mesh.visible = false;
      mesh.traverse(c => {
        if (c.isMesh && c.material) {
          c.material.transparent = true;
          c.material.opacity = 0;
          c.material.depthWrite = false;
        }
      });
      this.pool.push({ mesh, life: 0 });
    }
  }

  emit(x, y, z, side) {
    const puff = this.pool.find(p => p.life <= 0);
    if (!puff) return;

    puff.mesh.position.set(x + side * 0.3, y + 0.05, z - side * 0.2);
    puff.mesh.scale.setScalar(0.01);
    puff.mesh.visible = true;
    puff.mesh.traverse(c => {
      if (c.isMesh && c.material) {
        c.material.opacity = 0.7;
      }
    });
    this.scene.add(puff.mesh);
    puff.life = LIFETIME;
  }

  update(delta) {
    for (const puff of this.pool) {
      if (puff.life <= 0) continue;
      puff.life -= delta;
      const t = 1 - puff.life / LIFETIME;
      const s = 0.01 + t * GROW;
      puff.mesh.scale.setScalar(s);
      puff.mesh.traverse(c => {
        if (c.isMesh && c.material) {
          c.material.opacity = 0.7 * (1 - t);
        }
      });
      if (puff.life <= 0) {
        puff.mesh.visible = false;
        this.scene.remove(puff.mesh);
      }
    }
  }
}
