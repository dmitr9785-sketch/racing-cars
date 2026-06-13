import { SceneSetup } from './SceneSetup.js';
import { Road } from './Road.js';
import { ModelLoader } from './ModelLoader.js';
import { Player } from './Player.js';
import { Traffic } from './Traffic.js';
import { Trees } from './Trees.js';
import { Houses } from './Houses.js';
import { Stars } from './Stars.js';
import { UI } from './UI.js';
import { Game } from './Game.js';
import { Smoke } from './Smoke.js';
import { PonyDecor } from './PonyDecor.js';
import { initYandexSDK, loadingReady, saveStars, getStars, loadCloud, getLang, setSoundManager } from './YandexSDK.js';
import { SoundManager } from './SoundManager.js';

async function init() {
  await initYandexSDK();
  await loadCloud();
  const lang = getLang();

  const sound = new SoundManager();
  setSoundManager(sound);
  await sound.init();

  const ui = new UI(sound);
  ui.setLang(lang);

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
  loadingReady();
  await new Promise(r => setTimeout(r, 300));
  ui.hideLoading();

  const trafficModels = loader.getTrafficModels();
  const trafficModelIds = loader.getTrafficModelIds();
  if (trafficModels.length === 0) {
    console.error('No traffic models loaded');
    return;
  }
  const ponyTrafficModels = loader.getPonyTrafficModels();
  const traffic = new Traffic(trafficModels, trafficModelIds, sceneSetup.scene, ponyTrafficModels);

  const treeModel = loader.getTreeModel();
  const cactusModel = loader.getCactusModel();
  const piramideModel = loader.getPiramideModel();
  const trees = new Trees([treeModel, cactusModel, piramideModel], sceneSetup.scene);

  const houseModels = loader.getHouseModels();
  const houses = new Houses(houseModels, sceneSetup.scene);

  const starModel = loader.getStarModel();
  const stars = new Stars(starModel, sceneSetup.scene);

  const shopVehicles = loader.getShopVehicles();

  const ponyModel = loader.getPonyModel();
  const playerModelRace = loader.getPlayerModel();

  const smokeModel = loader.getSmokeModel();
  const smoke = new Smoke(smokeModel, sceneSetup.scene);

  const flowerModel = loader.getPonyFlowerModel();
  const flowerTwoModel = loader.getPonyFlowerTwoModel();
  const ponyStarModel = loader.getPonyStarModel();
  const ponySunModel = loader.getPonySunModel();
  const ponyDecor = new PonyDecor(flowerModel, flowerTwoModel, ponyStarModel, ponySunModel, sceneSetup.scene, sceneSetup.camera);

  const game = new Game(
    sceneSetup.scene,
    sceneSetup.camera,
    sceneSetup.renderer,
    traffic,
    trees,
    houses,
    stars,
    road,
    ui,
    sceneSetup,
    smoke,
    ponyDecor,
    sound
  );

  const totalStars = await getStars();
  ui.totalStars = totalStars;

  ui.setShopVehicles(shopVehicles);
  ui.showStartScreen();
  ui.startBtn.addEventListener('click', () => {
    sound.play('click');
    const equipped = ui.getEquippedVehicle();

    let model = loader.getVehicleModel(equipped);
    let vehicleData = shopVehicles.find(v => v.id === equipped);
    let playerScale = vehicleData ? vehicleData.scale : 0.8;

    if (!model) {
      console.error('Failed to get model for', equipped);
      return;
    }

    const off = loader.getVehicleOffsets(equipped);
    const player = new Player(model, playerScale, off.yOffset, off.xOffset, off.rotationY, off.scaleZ, off.zOffset, off.scaleX);
    game.controlMode = ui.getControlMode();
    game.touch.setMode(game.controlMode);
    game.setMode(ui.getSelectedMode());
    game.setPlayer(player);
    const isPony = false;
    traffic.setPonyMode(isPony);
    game.ponyMode = isPony;
    game.vehicleId = equipped;
    game._smokeZ = off.smokeZ || -0.6;
    game.start();
  });
}

init().catch(err => {
  console.error('Init error:', err);
  document.body.innerHTML = `<div style="color:#fff;padding:40px;font-size:18px;">
    Ошибка загрузки игры: ${err.message}</div>`;
});
