let ysdk = null;
let _soundManager = null;

export function setSoundManager(sm) {
  _soundManager = sm;
}

export function initYandexSDK() {
  if (typeof YaGames !== 'undefined') {
    return YaGames.init().then(y => {
      ysdk = y;
    }).catch(e => {
      console.warn('Yandex SDK init failed, using mock:', e);
      ysdk = { mock: true };
    });
  }
  ysdk = { mock: true };
  return Promise.resolve();
}

export function getLang() {
  if (ysdk && !ysdk.mock) {
    try {
      return ysdk.environment.i18n.lang;
    } catch {}
  }
  const nav = navigator.language || navigator.userLanguage || '';
  return nav.startsWith('ru') ? 'ru' : 'en';
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
        if (data.stars != null) localStorage.setItem('highway_rush_stars', String(data.stars));
        if (data.purchases) localStorage.setItem('highway_rush_purchases', JSON.stringify(data.purchases));
        if (data.equipped) localStorage.setItem('highway_rush_equipped', data.equipped);
        _setPlayerData(data);
      }
    } catch {}
  }
}

export async function showAd() {
  if (_soundManager) _soundManager.pauseForAd();
  if (ysdk && !ysdk.mock && ysdk.adv) {
    try {
      await ysdk.adv.showFullscreenAdv();
    } catch (e) {
      console.warn('Fullscreen ad failed:', e);
    }
  }
  if (_soundManager) _soundManager.resumeFromAd();
}

export async function showRewarded() {
  if (_soundManager) _soundManager.pauseForAd();
  if (ysdk && !ysdk.mock && ysdk.adv && typeof ysdk.adv.showRewardedVideo === 'function') {
    try {
      await ysdk.adv.showRewardedVideo({
        callbacks: { onRewarded: () => {} }
      });
    } catch (e) {
      console.warn('[YandexSDK] showRewardedVideo failed:', e);
      if (_soundManager) _soundManager.resumeFromAd();
      return false;
    }
    if (_soundManager) _soundManager.resumeFromAd();
    return true;
  }
  await new Promise(r => setTimeout(r, 500));
  if (_soundManager) _soundManager.resumeFromAd();
  return true;
}
