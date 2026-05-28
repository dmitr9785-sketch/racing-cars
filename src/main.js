import { SceneSetup } from './SceneSetup.js';
import { Road } from './Road.js';
import { ModelLoader } from './ModelLoader.js';
import { Player } from './Player.js';
import { Traffic } from './Traffic.js';
import { Trees } from './Trees.js';
import { Houses } from './Houses.js';
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
  const traffic = new Traffic(trafficModels, sceneSetup.scene);

  const trees = new Trees(sceneSetup.scene);

  const houseModel = loader.getHouseModel();
  const houses = new Houses(houseModel, sceneSetup.scene);

  const ponyModel = loader.getPonyModel();
  const playerModelRace = loader.getPlayerModel();

  const game = new Game(
    sceneSetup.scene,
    sceneSetup.camera,
    sceneSetup.renderer,
    traffic,
    trees,
    houses,
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
    const player = new Player(model);
    game.setPlayer(player);
    game.start();
  });
}

init().catch(err => {
  console.error('Init error:', err);
  document.body.innerHTML = `<div style="color:#fff;padding:40px;font-size:18px;">
    Failed to load game: ${err.message}</div>`;
});
