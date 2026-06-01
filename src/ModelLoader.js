import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const MODEL_LIST = [
  { id: 'player', file: 'assets/models/race.glb' },
  { id: 'traffic_0', file: 'assets/models/sedan.glb' },
  { id: 'traffic_1', file: 'assets/models/police.glb' },
  { id: 'traffic_2', file: 'assets/models/taxi.glb' },
  { id: 'traffic_3', file: 'assets/models/van.glb' },
  { id: 'traffic_4', file: 'assets/models/hatchback-sports.glb' },
  { id: 'traffic_5', file: 'assets/models/delivery.glb' },
  { id: 'traffic_6', file: 'assets/models/suv.glb' },
  { id: 'traffic_7', file: 'assets/models/ambulance.glb' },
  { id: 'traffic_8', file: 'assets/models/truck.glb' },
  { id: 'traffic_9', file: 'assets/models/low_poly_car_muscle_car_2_stanced.glb' },
  { id: 'traffic_10', file: 'assets/models/low-poly_sedan_car.glb' },
  { id: 'traffic_11', file: 'assets/models/low_poly_car_1.glb' },
  { id: 'obstacle_0', file: 'assets/models/cone.glb' },
  { id: 'obstacle_1', file: 'assets/models/wheel-default.glb' },
  { id: 'pony', file: 'assets/models/pony.glb' },
  { id: 'pony_traffic_0', file: 'assets/models/baby_pony.glb' },
  { id: 'pony_traffic_1', file: 'assets/models/surprise_pony.glb' },
  { id: 'pony_traffic_2', file: 'assets/models/sunset_pony.glb' },
  { id: 'house_0', file: 'assets/models/building-sample-house-a.glb' },
  { id: 'house_1', file: 'assets/models/building-sample-house-b.glb' },
  { id: 'house_2', file: 'assets/models/building-sample-house-c.glb' },
  { id: 'tree', file: 'assets/models/low_poly_tree.glb' },
  { id: 'star', file: 'assets/models/shining_star_low_poly.glb' },
  { id: 'unlock_car', file: 'assets/models/mazda_rx7_veilside_stylized_toon.glb' },
  { id: 'smoke', file: 'assets/models/smoke.glb' },
];

function fixMatColors(obj) {
  obj.traverse(child => {
    if (!child.isMesh) return;
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    for (const mat of mats) {
      if (!mat || !mat.color) continue;
      if (mat.color.getHex() >= 0xf0f0f0) {
        mat.color.setHex(0x8899bb);
      }
      mat.roughness = 0.7;
      mat.metalness = 0.2;
    }
  });
}

export class ModelLoader {
  constructor() {
    this.models = {};
    this.total = MODEL_LIST.length;
    this.loaded = 0;
    this.loadPromise = this._loadAll();
  }

  _loadAll() {
    return new Promise((resolve) => {
      const loader = new GLTFLoader();
      let completed = 0;

      for (const entry of MODEL_LIST) {
        loader.load(
          entry.file,
          (gltf) => {
            const model = gltf.scene;
            const skip = entry.id === 'pony' || entry.id.startsWith('pony_traffic') || entry.id.startsWith('house_') || entry.id === 'tree' || entry.id === 'star' || entry.id === 'unlock_car' || entry.id === 'smoke';
            if (!skip) {
              model.scale.setScalar(0.8);
              model.traverse((child) => {
                if (child.isMesh) {
                  child.castShadow = true;
                  child.receiveShadow = true;
                }
              });
              fixMatColors(model);
            }
            this.models[entry.id] = model.clone();
            this.loaded++;
            completed++;
            if (completed === this.total) resolve();
          },
          undefined,
          () => {
            const fallback = this._createFallback(entry.id);
            this.models[entry.id] = fallback;
            this.loaded++;
            completed++;
            if (completed === this.total) resolve();
          }
        );
      }
    });
  }

  _createFallback(id) {
    const group = new THREE.Group();
    let mesh;

    if (id.startsWith('pony_traffic')) {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 1.2), new THREE.MeshStandardMaterial({ color: 0xcc88ff, roughness: 0.6 }));
      body.position.y = 0.3;
      group.add(body);
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.3, 6), new THREE.MeshStandardMaterial({ color: 0xcc88ff, roughness: 0.6 }));
      head.position.set(0.5, 0.6, 0);
      head.rotation.z = -0.3;
      group.add(head);
    } else if (id === 'pony') {
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 1.5), new THREE.MeshStandardMaterial({ color: 0xcc88ff, roughness: 0.6 }));
      body.position.y = 0.4;
      group.add(body);
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.4, 6), new THREE.MeshStandardMaterial({ color: 0xcc88ff, roughness: 0.6 }));
      head.position.set(0.7, 0.8, 0);
      head.rotation.z = -0.3;
      group.add(head);
    } else if (id === 'tree') {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.4, 4), new THREE.MeshStandardMaterial({ color: 0x664422, roughness: 1 }));
      trunk.position.y = 0.2;
      group.add(trunk);
      const crown = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.3, 4), new THREE.MeshStandardMaterial({ color: 0x4a8c3f, roughness: 0.9 }));
      crown.position.y = 0.45;
      group.add(crown);
    } else if (id === 'unlock_car') {
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 3.6), new THREE.MeshStandardMaterial({ color: 0xff4444, roughness: 0.4, metalness: 0.6 }));
      body.position.y = 0.25;
      group.add(body);
    } else if (id === 'star') {
      const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), new THREE.MeshStandardMaterial({ color: 0xffdd44, emissive: 0xff8800, emissiveIntensity: 0.5 }));
      group.add(star);
    } else if (id.startsWith('house_')) {
      const walls = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.8, 1.5), new THREE.MeshStandardMaterial({ color: 0xccaa88, roughness: 0.9 }));
      walls.position.y = 0.4;
      group.add(walls);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(1.1, 0.6, 4), new THREE.MeshStandardMaterial({ color: 0xcc4444, roughness: 0.8 }));
      roof.position.y = 1.0;
      roof.rotation.y = Math.PI / 4;
      group.add(roof);
    } else if (id === 'smoke') {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.5, 6, 6), new THREE.MeshStandardMaterial({ color: 0xcccccc, transparent: true, opacity: 0.6, roughness: 1, metalness: 0 }));
      group.add(puff);
    } else if (id.startsWith('player') || id.startsWith('traffic')) {
      const geo = new THREE.BoxGeometry(1.8, 0.6, 3.6);
      const color = id.startsWith('player') ? 0x3388ff : 0x888888;
      mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.6 }));
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    } else {
      const geo = new THREE.CylinderGeometry(0.4, 0.6, 0.8, 8);
      mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xff6600, roughness: 0.6 }));
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }

    return group;
  }

  getTrafficModels() {
    return Object.keys(this.models)
      .filter(k => k.startsWith('traffic_'))
      .sort((a, b) => {
        const na = parseInt(a.split('_')[1], 10);
        const nb = parseInt(b.split('_')[1], 10);
        return na - nb;
      })
      .map(k => this.models[k]);
  }

  getTrafficModelIds() {
    return Object.keys(this.models)
      .filter(k => k.startsWith('traffic_'))
      .sort((a, b) => {
        const na = parseInt(a.split('_')[1], 10);
        const nb = parseInt(b.split('_')[1], 10);
        return na - nb;
      });
  }

  getPlayerModel() {
    return this.models['player'] ? this.models['player'].clone() : null;
  }

  getPonyModel() {
    return this.models['pony'] ? this.models['pony'].clone() : null;
  }

  getPonyTrafficModels() {
    const ids = Object.keys(this.models).filter(k => k.startsWith('pony_traffic'));
    return ids.map(id => this.models[id].clone());
  }

  getHouseModels() {
    const ids = Object.keys(this.models).filter(k => k.startsWith('house_'));
    return ids.map(id => this.models[id].clone());
  }

  getTreeModel() {
    return this.models['tree'] ? this.models['tree'].clone() : null;
  }

  getStarModel() {
    return this.models['star'] ? this.models['star'].clone() : null;
  }

  getUnlockCarModel() {
    return this.models['unlock_car'] ? this.models['unlock_car'].clone() : null;
  }

  getSmokeModel() {
    return this.models['smoke'] ? this.models['smoke'].clone() : null;
  }
}
