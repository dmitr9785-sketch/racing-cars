let ysdk = null;

export async function initYandexSDK() {
  if (typeof YaGames !== 'undefined') {
    try {
      ysdk = await YaGames.init();
      return;
    } catch (e) {
      console.warn('Yandex SDK init failed, using mock:', e);
    }
  }
  ysdk = { mock: true };
}

export function loadingReady() {
  if (ysdk && !ysdk.mock) ysdk.features.LoadingAPI?.ready();
}

export function gameplayStart() {
  if (ysdk && !ysdk.mock) ysdk.features.GameplayAPI?.start();
}

export function gameplayStop() {
  if (ysdk && !ysdk.mock) ysdk.features.GameplayAPI?.stop();
}

function _getPlayerData() {
  return JSON.parse(localStorage.getItem('highway_rush_cloud') || 'null') || {};
}
function _setPlayerData(data) {
  localStorage.setItem('highway_rush_cloud', JSON.stringify(data));
}

export async function saveStars(total) {
  localStorage.setItem('highway_rush_stars', String(total));
  const d = _getPlayerData();
  d.stars = total;
  _setPlayerData(d);
  if (ysdk && !ysdk.mock) {
    try {
      await ysdk.setLeaderboardScore?.('stars', total);
      await ysdk.getPlayer?.().setData?.(d);
    } catch {}
  }
}

export async function getStars() {
  return parseInt(localStorage.getItem('highway_rush_stars') || '0', 10);
}

export function savePurchase(id) {
  const purchases = JSON.parse(localStorage.getItem('highway_rush_purchases') || '[]');
  if (!purchases.includes(id)) purchases.push(id);
  localStorage.setItem('highway_rush_purchases', JSON.stringify(purchases));
  const d = _getPlayerData();
  d.purchases = purchases;
  _setPlayerData(d);
  _pushCloud();
}

export function getPurchases() {
  return JSON.parse(localStorage.getItem('highway_rush_purchases') || '[]');
}

export function equipVehicle(id) {
  localStorage.setItem('highway_rush_equipped', id);
  const d = _getPlayerData();
  d.equipped = id;
  _setPlayerData(d);
  _pushCloud();
}

export function getEquippedVehicle() {
  const stored = localStorage.getItem('highway_rush_equipped');
  const purchases = getPurchases();
  const valid = stored && (stored === 'race' || purchases.includes(stored));
  return valid ? stored : 'race';
}

async function _pushCloud() {
  if (!ysdk || ysdk.mock) return;
  try {
    await ysdk.getPlayer?.().setData?.(_getPlayerData());
  } catch {}
}

export async function loadCloud() {
  if (ysdk && !ysdk.mock) {
    try {
      const data = await ysdk.getPlayer?.().getData?.();
      if (data) {
        if (data.stars != null) {
          localStorage.setItem('highway_rush_stars', String(data.stars));
        }
        if (data.purchases) {
          localStorage.setItem('highway_rush_purchases', JSON.stringify(data.purchases));
        }
        if (data.equipped) {
          localStorage.setItem('highway_rush_equipped', data.equipped);
        }
        _setPlayerData(data);
      }
    } catch {}
  }
}

export async function showAd() {
  if (ysdk && !ysdk.mock && ysdk.adv) {
    try {
      await ysdk.adv.showFullscreenAdv();
    } catch (e) {
      console.warn('Fullscreen ad failed:', e);
    }
  }
}

export async function showRewarded() {
  if (ysdk && !ysdk.mock && ysdk.adv) {
    try {
      const result = await ysdk.adv.showRewardedVideo();
      return result === 'rewarded';
    } catch (e) {
      console.warn('Rewarded ad failed:', e);
    }
  }
  return false;
}
