import * as THREE from 'three';

const POOL_SIZE = 8;
const SPAWN_Z = 35;
const DESPAWN_Z = -2;

const SUN_OFFSET = new THREE.Vector3(8, 6, 5);

export class PonyDecor {
  constructor(flowerModel, flowerTwoModel, starModel, sunModel, scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.activePool = 0;
    this.timeSinceSpawn = 2.0;
    this._sunMesh = null;
    this._sunInScene = false;

    if (sunModel) {
      this._sunMesh = sunModel.clone();
      this._sunMesh.scale.setScalar(0.0025);
      this._sunMesh.traverse(c => {
        if (c.isMesh && c.material) {
          c.material.emissive = new THREE.Color(0xffaa44);
          c.material.emissiveIntensity = 1.5;
        }
      });
    }

    this.pools = [
      this._buildPool([flowerModel, flowerTwoModel], 0.027),
      this._buildPool([starModel], 0.6),
    ];

    for (const obj of this.pools[1]) {
      obj.traverse(c => {
        if (c.isMesh && c.material) {
          c.material.emissive = new THREE.Color(0xffcc44);
          c.material.emissiveIntensity = 0.8;
        }
      });
    }
  }

  _buildPool(models, baseScale) {
    const pool = [];
    for (let i = 0; i < POOL_SIZE; i++) {
      const m = models[i % models.length];
      if (!m) continue;
      const mesh = m.clone();
      const s = baseScale + Math.random() * baseScale * 0.5;
      mesh.scale.setScalar(s);
      mesh.traverse(c => {
        if (c.isMesh) {
          c.castShadow = false;
          c.receiveShadow = false;
        }
      });
      mesh.visible = false;
      pool.push(mesh);
    }
    return pool;
  }

  setBiome(name) {
    const idx = name === 'Pony-Sky' ? 1 : 0;
    if (idx === this.activePool && name !== 'Pony-Sky') return;

    if (idx === 1 && !this._sunInScene && this._sunMesh && this.camera) {
      this._sunMesh.position.copy(this.camera.position).add(SUN_OFFSET);
      this.scene.add(this._sunMesh);
      this._sunInScene = true;
    } else if (idx === 0 && this._sunInScene && this._sunMesh) {
      this.scene.remove(this._sunMesh);
      this._sunInScene = false;
    }

    if (idx === this.activePool) return;
    for (const obj of this.pools[this.activePool]) {
      if (obj.visible) {
        obj.visible = false;
        this.scene.remove(obj);
      }
    }
    this.activePool = idx;
    this.timeSinceSpawn = 2.0;
  }

  get pool() {
    return this.pools[this.activePool];
  }

  spawn() {
    const obj = this.pool.find(o => !o.visible);
    if (!obj) return;

    const side = Math.random() < 0.5 ? -1 : 1;
    const x = side * (12 + Math.random() * 8);
    const z = SPAWN_Z + Math.random() * 20;

    obj.position.set(x, 0, z);
    obj.rotation.set(0, Math.random() * Math.PI * 2, 0);
    obj.visible = true;
    this.scene.add(obj);
  }

  update(delta, speed) {
    this.timeSinceSpawn += delta;
    if (this.timeSinceSpawn >= 2.0) {
      this.spawn();
      this.timeSinceSpawn = 0;
    }

    if (this._sunMesh && this._sunInScene && this.camera) {
      this._sunMesh.position.copy(this.camera.position).add(SUN_OFFSET);
    }

    for (const obj of this.pool) {
      if (!obj.visible) continue;
      obj.position.z -= (1.5 + speed * 0.25) * delta;
      if (obj.position.z < DESPAWN_Z) {
        obj.visible = false;
        this.scene.remove(obj);
      }
    }
  }

  reset() {
    for (const pool of this.pools) {
      for (const obj of pool) {
        if (obj.visible) {
          obj.visible = false;
          this.scene.remove(obj);
        }
      }
    }
    if (this._sunInScene && this._sunMesh) {
      this.scene.remove(this._sunMesh);
      this._sunInScene = false;
    }
    this.activePool = 0;
  }
}
