import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const SHOP_VEHICLES = [
  { id: 'race',            name: 'Гоночная машина',        price: 0,     scale: 0.8,  file: 'assets/models/race.glb' },
  { id: 'lada_2107',       name: 'Лада 2107',              price: 50,    scale: 0.533,  file: 'assets/models/low_poly_lada_2107.glb' },
  { id: 'audi_rs5',        name: 'Audi RS5',               price: 100,   scale: 0.65,  file: 'assets/models/audi_rs5_low_poly.glb' },
  { id: 'bmw_m3',          name: 'BMW M3',                 price: 200,   scale: 0.8,  yOffset: 0.2, file: 'assets/models/bmw_m3_gtr_nfs_low_poly.glb' },
  { id: 'nissan_silvia',   name: 'Nissan Silvia S13',      price: 350,   scale: 0.4,  yOffset: 0.5, scaleZ: 0.85, file: 'assets/models/low_poly_nissan_silvia_s13.glb' },
  { id: 'free_car',        name: 'BMW M5',                 price: 500,   scale: 0.7,  yOffset: -1.25, zOffset: 2.0, smokeZ: -2.5, file: 'assets/models/free_low_poly_car.glb' },
  { id: 'low_poly_car',    name: 'UAZ-452',                price: 750,  scale: 0.8,  file: 'assets/models/uaz-452_soviet_minivan.glb' },
  { id: 'camaro',          name: 'Chevrolet Camaro',       price: 1000,  scale: 1.6,  color: 0xffff00, file: 'assets/models/chevrolet_camaro_low_poly_free.glb' },
  { id: 'low_sports_car',  name: 'Спорткар 1',             price: 1500,  scale: 0.8,  yOffset: 0.2, scaleX: 0.7, file: 'assets/models/low_poly_sports_car.glb' },
  { id: 'lowpoly_sports_car', name: 'Спорткар 2',          price: 2000,  scale: 0.8,  yOffset: 0.6, file: 'assets/models/low-poly_sports_car.glb' },
  { id: 'rx7',             name: 'Mazda RX7',              price: 3000,  scale: 0.55, file: 'assets/models/mazda_rx7_veilside_stylized_toon.glb' },
  { id: 'sci_fi',          name: 'Научная машина',         price: 5000,  scale: 0.8,  yOffset: 0.6, canFly: true, file: 'assets/models/sci-fi_car.glb' },
  { id: 'tank',            name: 'Танк',                   price: 8000,  scale: 1.2,  yOffset: 0.5, file: 'assets/models/tank_low-poly__2.glb' },
];

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
  { id: 'traffic_11', file: 'assets/models/low-poly_tractor.glb' },
  { id: 'traffic_12', file: 'assets/models/low_poly_pickup_truck_2.glb' },
  { id: 'traffic_13', file: 'assets/models/low_poly_pickup_truck_v3.glb' },
  { id: 'traffic_14', file: 'assets/models/free_delivery_truck__vehicle__low_poly.glb' },
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
  { id: 'smoke', file: 'assets/models/smoke.glb' },
  { id: 'cactus', file: 'assets/models/cactus_low_poly.glb' },
  { id: 'piramide', file: 'assets/models/low_poly_khafre.glb' },
  { id: 'pony_flower', file: 'assets/models/low_poly_flowers.glb' },
  { id: 'pony_flower2', file: 'assets/models/low_poly_flowers(1).glb' },
  { id: 'pony_star', file: 'assets/models/star for pony .glb' },
  { id: 'pony_sun', file: 'assets/models/low_poly_sun.glb' },
];

for (const v of SHOP_VEHICLES) {
  if (v.id === 'race') continue;
  MODEL_LIST.push({ id: v.id, file: v.file });
}

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
            const skip = entry.id === 'pony' || entry.id.startsWith('pony_traffic') || entry.id.startsWith('house_') || entry.id === 'tree' || entry.id === 'star' || entry.id === 'smoke' || entry.id === 'cactus' || entry.id === 'piramide' || entry.id.startsWith('pony_');
            if (!skip) {
              model.scale.setScalar(0.8);
              model.traverse((child) => {
                if (child.isMesh) {
                  child.castShadow = true;
                  child.receiveShadow = true;
                }
              });
              fixMatColors(model);
              const sv = SHOP_VEHICLES.find(v => v.id === entry.id);
              if (sv && sv.color !== undefined) {
                model.traverse(ch => { if (ch.isMesh && ch.material) { ch.material.color.setHex(sv.color); } });
              }
              const _b = new THREE.Box3().setFromObject(model);
              const _c = _b.getCenter(new THREE.Vector3());
              model.traverse(ch => { if (ch.isMesh) { ch.position.x -= _c.x; ch.position.z -= _c.z; } });
              if (entry.id === 'nissan_silvia') {
                const pivot = new THREE.Group();
                const kids = [...model.children];
                kids.forEach(k => { model.remove(k); pivot.add(k); });
                pivot.rotation.y = -Math.PI / 2;
                pivot.updateMatrixWorld(true);
                const _b2 = new THREE.Box3().setFromObject(pivot);
                const _c2 = _b2.getCenter(new THREE.Vector3());
                pivot.children.slice().forEach(k => {
                  const wp = new THREE.Vector3();
                  k.getWorldPosition(wp);
                  const wq = new THREE.Quaternion();
                  k.getWorldQuaternion(wq);
                  pivot.remove(k);
                  k.position.copy(wp.sub(_c2));
                  k.quaternion.copy(wq);
                  model.add(k);
                });
              }
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
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.5, 6, 6), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, roughness: 1, metalness: 0 }));
      group.add(puff);
    } else if (id === 'cactus') {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.8, 6), new THREE.MeshStandardMaterial({ color: 0x44aa44, roughness: 0.9 }));
      trunk.position.y = 0.4;
      group.add(trunk);
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.4, 6), new THREE.MeshStandardMaterial({ color: 0x44aa44, roughness: 0.9 }));
      arm.position.set(0.2, 0.7, 0);
      arm.rotation.z = -0.5;
      group.add(arm);
    } else if (id === 'piramide') {
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.4), new THREE.MeshStandardMaterial({ color: 0xccaa66, roughness: 0.9 }));
      base.position.y = 0.15;
      group.add(base);
      const mid = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.3), new THREE.MeshStandardMaterial({ color: 0xccaa66, roughness: 0.9 }));
      mid.position.y = 0.4;
      group.add(mid);
      const top = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.2, 4), new THREE.MeshStandardMaterial({ color: 0xddbb77, roughness: 0.9 }));
      top.position.y = 0.6;
      group.add(top);
    } else if (id.startsWith('player') || id.startsWith('traffic') || SHOP_VEHICLES.some(v => v.id === id)) {
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

  getShopVehicles() {
    return SHOP_VEHICLES.map(v => ({
      id: v.id,
      name: v.name,
      price: v.price,
      scale: v.scale,
      yOffset: v.yOffset || 0,
      model: this.models[v.id === 'race' ? 'player' : v.id]?.clone() || null,
    }));
  }

  getVehicleModel(id) {
    const key = id === 'race' ? 'player' : id;
    return this.models[key]?.clone() || null;
  }

  getVehicleYOffset(id) {
    const v = SHOP_VEHICLES.find(x => x.id === id);
    return v?.yOffset || 0;
  }

  getVehicleOffsets(id) {
    const v = SHOP_VEHICLES.find(x => x.id === id);
    return { yOffset: v?.yOffset || 0, xOffset: v?.xOffset || 0, zOffset: v?.zOffset || 0, rotationY: v?.rotationY || 0, scaleX: v?.scaleX || 1, scaleZ: v?.scaleZ || 1, smokeZ: v?.smokeZ };
  }

  getSmokeModel() {
    return this.models['smoke'] ? this.models['smoke'].clone() : null;
  }

  getCactusModel() {
    return this.models['cactus'] ? this.models['cactus'].clone() : null;
  }

  getPiramideModel() {
    return this.models['piramide'] ? this.models['piramide'].clone() : null;
  }

  getPonyFlowerModel() {
    return this.models['pony_flower'] ? this.models['pony_flower'].clone() : null;
  }

  getPonyFlowerTwoModel() {
    return this.models['pony_flower2'] ? this.models['pony_flower2'].clone() : null;
  }

  getPonyStarModel() {
    return this.models['pony_star'] ? this.models['pony_star'].clone() : null;
  }

  getPonySunModel() {
    return this.models['pony_sun'] ? this.models['pony_sun'].clone() : null;
  }
}
