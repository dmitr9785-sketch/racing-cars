let ysdk = null;

function createMockYSdk() {
  return {
    features: {
      LoadingAPI: { ready() {} },
      GameplayAPI: { start() {}, stop() {} }
    },
    getPlayer() {
      return {
        async getStats(keys) {
          const data = JSON.parse(localStorage.getItem('yandex_sdk_stats') || '{}');
          return keys
            ? keys.reduce((acc, k) => { acc[k] = data[k] ?? null; return acc; }, {})
            : data;
        },
        async setStats(stats) {
          const data = JSON.parse(localStorage.getItem('yandex_sdk_stats') || '{}');
          Object.assign(data, stats);
          localStorage.setItem('yandex_sdk_stats', JSON.stringify(data));
        }
      };
    },
    adv: {
      async showFullscreenAdv() {},
      async showRewardedVideo() {}
    }
  };
}

export async function initYandexSDK() {
  for (let i = 0; i < 10; i++) {
    if (typeof YaGames !== 'undefined') break;
    await new Promise(r => setTimeout(r, 100));
  }
  if (typeof YaGames !== 'undefined') {
    try {
      ysdk = await YaGames.init({ signed: false });
      return;
    } catch (e) {
      console.warn('Yandex SDK init failed:', e);
    }
  }
  console.log('Используется локальный мок SDK');
  ysdk = createMockYSdk();
}

export function getYSdk() { return ysdk; }

export function loadingReady() {
  ysdk?.features?.LoadingAPI?.ready();
}

export function gameplayStart() {
  ysdk?.features?.GameplayAPI?.start();
}

export function gameplayStop() {
  ysdk?.features?.GameplayAPI?.stop();
}

export async function saveStars(total) {
  localStorage.setItem('highway_rush_stars', total.toString());
  try {
    const player = await ysdk.getPlayer();
    await player.setStats({ highway_rush_stars: total });
  } catch (e) {}
}

export async function getStars() {
  try {
    const player = await ysdk.getPlayer();
    const stats = await player.getStats();
    if (stats && stats.highway_rush_stars !== undefined) {
      return stats.highway_rush_stars;
    }
  } catch (e) {}
  return parseInt(localStorage.getItem('highway_rush_stars') || '0', 10);
}
