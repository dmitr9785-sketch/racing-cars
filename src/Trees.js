import * as THREE from 'three';

const SPAWN_Z = 35;
const DESPAWN_Z = -2;
const POOL_SIZE = 8;
const ROAD_HALF = 7;

function buildFallbackTree() {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.4, 4), new THREE.MeshStandardMaterial({ color: 0x664422, roughness: 1 }));
  trunk.position.y = 0.2;
  group.add(trunk);
  const crown = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.4, 6), new THREE.MeshStandardMaterial({ color: 0xdd8833, roughness: 0.9 }));
  crown.position.y = 0.6;
  group.add(crown);
  return group;
}

export class Trees {
  constructor(treeModel, scene) {
    this.scene = scene;
    this.pools = [];
    this.activePool = 0;
    this.timeSinceSpawn = 2.0;

    const models = [treeModel, buildFallbackTree()];
    for (let m = 0; m < models.length; m++) {
      const pool = [];
      const s = 0.003 + Math.random() * 0.002;
      for (let i = 0; i < POOL_SIZE; i++) {
        const mesh = models[m].clone();
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
      this.pools.push(pool);
    }
  }

  setModel(index) {
    if (index === this.activePool || index >= this.pools.length) return;
    for (const tree of this.pools[this.activePool]) {
      if (tree.visible) {
        tree.visible = false;
        this.scene.remove(tree);
      }
    }
    this.activePool = index;
    this.timeSinceSpawn = 2.0;
  }

  get pool() {
    return this.pools[this.activePool];
  }

  spawn() {
    const tree = this.pool.find(t => !t.visible);
    if (!tree) return;

    const side = Math.random() < 0.5 ? -1 : 1;
    const x = side * (ROAD_HALF + 1.5 + Math.random() * 3);
    const z = SPAWN_Z + Math.random() * 20;
    const rot = Math.random() * Math.PI * 2;

    tree.position.set(x, -0.2, z);
    tree.rotation.set(0, rot, 0);
    tree.visible = true;
    this.scene.add(tree);
  }

  update(delta, speed) {
    this.timeSinceSpawn += delta;
    if (this.timeSinceSpawn >= 2.0) {
      this.spawn();
      this.timeSinceSpawn = 0;
    }

    for (const tree of this.pool) {
      if (!tree.visible) continue;
      tree.position.z -= (1.5 + speed * 0.25) * delta;

      if (tree.position.z < DESPAWN_Z) {
        tree.visible = false;
        this.scene.remove(tree);
      }
    }
  }

  reset() {
    for (const pool of this.pools) {
      for (const tree of pool) {
        if (tree.visible) {
          tree.visible = false;
          this.scene.remove(tree);
        }
      }
    }
    this.activePool = 0;
  }
}
