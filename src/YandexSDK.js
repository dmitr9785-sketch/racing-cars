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

export async function saveStars(total) {
  localStorage.setItem('highway_rush_stars', String(total));
  if (ysdk && !ysdk.mock) {
    try { await ysdk.setLeaderboardScore?.('stars', total); } catch {}
  }
}

export async function getStars() {
  const local = parseInt(localStorage.getItem('highway_rush_stars') || '0', 10);
  if (ysdk && !ysdk.mock) {
    try {
      const data = await ysdk.getPlayer?.();
      return data?.stars ?? local;
    } catch {}
  }
  return local;
}

export function savePurchase(id) {
  const purchases = JSON.parse(localStorage.getItem('highway_rush_purchases') || '[]');
  if (!purchases.includes(id)) purchases.push(id);
  localStorage.setItem('highway_rush_purchases', JSON.stringify(purchases));
}

export function getPurchases() {
  return JSON.parse(localStorage.getItem('highway_rush_purchases') || '[]');
}

export function equipVehicle(id) {
  localStorage.setItem('highway_rush_equipped', id);
}

export function getEquippedVehicle() {
  const stored = localStorage.getItem('highway_rush_equipped');
  const purchases = getPurchases();
  const valid = stored && (stored === 'race' || purchases.includes(stored));
  return valid ? stored : 'race';
}
