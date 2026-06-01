import * as THREE from 'three';

const POOL_SIZE = 20;
const LIFETIME = 1.2;
const GROW = 4;

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
          c.material.color.setHex(0xffffff);
          c.material.transparent = true;
          c.material.opacity = 0;
          c.material.depthWrite = false;
        }
      });
      this.pool.push({ mesh, life: 0 });
    }
  }

  emit(x, z, side) {
    const puff = this.pool.find(p => p.life <= 0);
    if (!puff) return;

    puff.mesh.position.set(x + side * 0.4, 0.05, z + 0.6);
    puff.mesh.scale.setScalar(0.01);
    puff.mesh.visible = true;
    puff.mesh.traverse(c => {
      if (c.isMesh && c.material) {
        c.material.opacity = 0.7;
      }
    });
    this.scene.add(puff.mesh);
    puff.life = LIFETIME;
    puff.vx = side * 2;
    puff.vz = -5;
  }

  update(delta) {
    for (const puff of this.pool) {
      if (puff.life <= 0) continue;
      puff.life -= delta;
      const t = 1 - puff.life / LIFETIME;
      const s = 0.01 + t * GROW;
      puff.mesh.scale.setScalar(s);
      puff.mesh.position.x += puff.vx * delta;
      puff.mesh.position.z += puff.vz * delta;
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
