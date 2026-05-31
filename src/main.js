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

  const trafficModels = loader.getTrafficModels();
  if (trafficModels.length === 0) {
    console.error('No traffic models loaded');
    return;
  }
  const ponyTrafficModels = loader.getPonyTrafficModels();
  const traffic = new Traffic(trafficModels, sceneSetup.scene, ponyTrafficModels);

  const treeModel = loader.getTreeModel();
  const trees = new Trees(treeModel, sceneSetup.scene);

  const houseModels = loader.getHouseModels();
  const houses = new Houses(houseModels, sceneSetup.scene);

  const starModel = loader.getStarModel();
  const stars = new Stars(starModel, sceneSetup.scene);

  const unlockCarModel = loader.getUnlockCarModel();

  const ponyModel = loader.getPonyModel();
  const playerModelRace = loader.getPlayerModel();

  const game = new Game(
    sceneSetup.scene,
    sceneSetup.camera,
    sceneSetup.renderer,
    traffic,
    trees,
    houses,
    stars,
    road,
    ui
  );

  ui.showStartScreen();
  ui.startBtn.addEventListener('click', () => {
    const choice = ui.getSelectedCharacter();
    const model = choice === 'pony' ? ponyModel : playerModelRace;
    if (!model) {
      console.error('Failed to get model for', choice);
      return;
    }
    const playerScale = choice === 'pony' ? 0.8 : 0.8;
    const player = new Player(model, playerScale);
    if (choice !== 'pony') {
      player.mesh.traverse(c => {
        if (c.isMesh && c.material && c.material.color) {
          c.material.color.setHex(0xcc2222);
        }
      });
    }
    game.setMode(ui.getSelectedMode());
    game.setPlayer(player);
    game.setUnlockCarModel(unlockCarModel);
    traffic.setPonyMode(choice === 'pony');
    game.start();
  });
}

init().catch(err => {
  console.error('Init error:', err);
  document.body.innerHTML = `<div style="color:#fff;padding:40px;font-size:18px;">
    Failed to load game: ${err.message}</div>`;
});
