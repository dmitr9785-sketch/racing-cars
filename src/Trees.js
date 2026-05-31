import * as THREE from 'three';

const SPAWN_Z = 35;
const DESPAWN_Z = -2;
const POOL_SIZE = 8;
const ROAD_HALF = 7;

export class Trees {
  constructor(treeModel, treeModelAlt, scene) {
    this.scene = scene;
    this.models = [treeModel, treeModelAlt || treeModel];
    this.modelIndex = 0;
    this.trees = [];
    this.timeSinceSpawn = 2.0;
    this._buildPool();
  }

  _buildPool() {
    for (const t of this.trees) {
      if (t.visible) { t.visible = false; this.scene.remove(t); }
    }
    this.trees = [];
    const model = this.models[this.modelIndex];
    const baseScale = this.modelIndex === 1 ? 0.35 : 0.8;
    const scaleRange = this.modelIndex === 1 ? 0.1 : 0.2;
    for (let i = 0; i < POOL_SIZE; i++) {
      const mesh = model.clone();
      const s = baseScale + Math.random() * scaleRange;
      mesh.scale.setScalar(s);
      mesh.traverse(c => {
        if (c.isMesh) {
          c.castShadow = false;
          c.receiveShadow = false;
        }
      });
      mesh.visible = false;
      this.trees.push(mesh);
    }
  }

  setModel(index) {
    if (index === this.modelIndex || !this.models[index]) return;
    this.modelIndex = index;
    this._buildPool();
    this.timeSinceSpawn = 2.0;
  }

  spawn() {
    const tree = this.trees.find(t => !t.visible);
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

    for (const tree of this.trees) {
      if (!tree.visible) continue;
      tree.position.z -= (1.5 + speed * 0.25) * delta;

      if (tree.position.z < DESPAWN_Z) {
        tree.visible = false;
        this.scene.remove(tree);
      }
    }
  }

  reset() {
    for (const tree of this.trees) {
      if (tree.visible) {
        tree.visible = false;
        this.scene.remove(tree);
      }
    }
  }
}
