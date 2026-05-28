import * as THREE from 'three';
import { SceneSetup } from './SceneSetup.js';
import { Road } from './Road.js';
import { ModelLoader } from './ModelLoader.js';
import { Player } from './Player.js';
import { Traffic } from './Traffic.js';
import { Trees } from './Trees.js';
import { UI } from './UI.js';
import { Game } from './Game.js';

async function init() {
  const ui = new UI();
  const sceneSetup = new SceneSetup();
  const road = new Road(sceneSetup.scene);

  const loader = new ModelLoader();

  const checkLoad = setInterval(() => {
    ui.updateLoading(loader.loaded, loader.total);
    if (loader.loaded >= loader.total) {
      clearInterval(checkLoad);
    }
  }, 100);

  await loader.loadPromise;
  ui.updateLoading(loader.total, loader.total);
  await new Promise(r => setTimeout(r, 300));
  ui.hideLoading();

  const playerModel = loader.getPlayerModel();
  if (!playerModel) {
    console.error('Failed to load player model');
    return;
  }
  const player = new Player(playerModel);

  const trafficModels = loader.getTrafficModels();
  if (trafficModels.length === 0) {
    console.error('No traffic models loaded');
    return;
  }
  const traffic = new Traffic(trafficModels, sceneSetup.scene);

  let treeModel = loader.getTreeModel();
  if (!treeModel) {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 0.8, 6), new THREE.MeshStandardMaterial({ color: 0x664422 }));
    trunk.position.y = 0.4;
    g.add(trunk);
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.8, 6), new THREE.MeshStandardMaterial({ color: 0x3d8c40 }));
    crown.position.y = 1.0;
    g.add(crown);
    treeModel = g;
  }
  const trees = new Trees(treeModel, sceneSetup.scene);

  const game = new Game(
    sceneSetup.scene,
    sceneSetup.camera,
    sceneSetup.renderer,
    player,
    traffic,
    trees,
    road,
    ui
  );

  ui.showStartScreen();
  ui.startBtn.addEventListener('click', () => game.start());
}

init().catch(err => {
  console.error('Init error:', err);
  document.body.innerHTML = `<div style="color:#fff;padding:40px;font-size:18px;">
    Failed to load game: ${err.message}</div>`;
});
