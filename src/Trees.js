import * as THREE from 'three';

const SPAWN_Z = 35;
const DESPAWN_Z = -2;
const POOL_SIZE = 15;
const ROAD_HALF = 7;

export class Trees {
  constructor(treeModel, scene) {
    this.scene = scene;
    this.trees = [];

    for (let i = 0; i < POOL_SIZE; i++) {
      const mesh = treeModel.clone();
      const scale = 0.02 + Math.random() * 0.015;
      mesh.scale.setScalar(scale);
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
    if (Math.random() < 0.03) this.spawn();

    for (const tree of this.trees) {
      if (!tree.visible) continue;
      tree.position.z -= (2 + speed * 0.4) * delta;

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
