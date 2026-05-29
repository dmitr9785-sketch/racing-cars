import * as THREE from 'three';

const SPAWN_Z = 35;
const DESPAWN_Z = -2;
const POOL_SIZE = 8;
const ROAD_HALF = 7;

function makeTree() {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.06, 0.3, 4),
    new THREE.MeshStandardMaterial({ color: 0x664422, roughness: 1 })
  );
  trunk.position.y = 0.15;
  group.add(trunk);
  const crown = new THREE.Mesh(
    new THREE.ConeGeometry(0.15, 0.25, 4),
    new THREE.MeshStandardMaterial({ color: 0x4a8c3f, roughness: 0.9 })
  );
  crown.position.y = 0.35;
  group.add(crown);
  return group;
}

const _template = makeTree();

export class Trees {
  constructor(scene) {
    this.scene = scene;
    this.trees = [];
    this.timeSinceSpawn = 2.0;

    for (let i = 0; i < POOL_SIZE; i++) {
      const mesh = _template.clone();
      const s = 0.8 + Math.random() * 0.4;
      mesh.scale.setScalar(s);
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
    this.timeSinceSpawn += delta;
    if (this.timeSinceSpawn >= 2.0) {
      this.spawn();
      this.timeSinceSpawn = 0;
    }

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
