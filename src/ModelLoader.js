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
  { id: 'obstacle_0', file: 'assets/models/cone.glb' },
  { id: 'obstacle_1', file: 'assets/models/wheel-default.glb' },
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
            model.scale.setScalar(0.8);
            model.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            fixMatColors(model);
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
    let geo, color;

    if (id.startsWith('player') || id.startsWith('traffic')) {
      geo = new THREE.BoxGeometry(1.8, 0.6, 3.6);
      color = id.startsWith('player') ? 0x3388ff : 0x888888;
    } else {
      geo = new THREE.CylinderGeometry(0.4, 0.6, 0.8, 8);
      color = 0xff6600;
    }

    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.6 }));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return group;
  }

  getTrafficModels() {
    return Object.keys(this.models)
      .filter(k => k.startsWith('traffic_'))
      .map(k => this.models[k]);
  }

  getPlayerModel() {
    return this.models['player'] ? this.models['player'].clone() : null;
  }
}
