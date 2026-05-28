import * as THREE from 'three';

const SPAWN_Z = 35;
const DESPAWN_Z = -2;
const POOL_SIZE = 6;
const ROAD_HALF = 7;
const HOUSE_SIDES = [-1, 1, -1, 1, -1, 1];

export class Houses {
  constructor(houseModel, scene) {
    this.scene = scene;
    this.houses = [];

    for (let i = 0; i < POOL_SIZE; i++) {
      const mesh = houseModel.clone();
      const s = 0.8 + Math.random() * 0.4;
      mesh.scale.setScalar(s);
      mesh.traverse(c => {
        if (c.isMesh) {
          c.castShadow = false;
          c.receiveShadow = false;
        }
      });
      mesh.visible = false;
      this.houses.push(mesh);
    }
  }

  spawn() {
    const house = this.houses.find(h => !h.visible);
    if (!house) return;

    const side = HOUSE_SIDES[this.houses.indexOf(house) % HOUSE_SIDES.length];
    const x = side * (ROAD_HALF + 10 + Math.random() * 4);
    const z = SPAWN_Z + Math.random() * 15;
    const rot = Math.random() * Math.PI * 2;

    house.position.set(x, 0, z);
    house.rotation.set(0, rot, 0);
    house.visible = true;
    this.scene.add(house);
  }

  update(delta, speed) {
    if (Math.random() < 0.02) this.spawn();

    for (const house of this.houses) {
      if (!house.visible) continue;
      house.position.z -= (2 + speed * 0.4) * delta;

      if (house.position.z < DESPAWN_Z) {
        house.visible = false;
        this.scene.remove(house);
      }
    }
  }

  reset() {
    for (const house of this.houses) {
      if (house.visible) {
        house.visible = false;
        this.scene.remove(house);
      }
    }
  }
}
