import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  BannerAdPosition,
  BannerAdSize,
  BannerAdPluginEvents,
} from '@capacitor-community/admob';

// Тестовый баннер Google. Боевой ID задаётся при сборке: VITE_ADMOB_BANNER_ID
const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';
const BANNER_ID = import.meta.env.VITE_ADMOB_BANNER_ID as string | undefined;

export async function initBanner(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await AdMob.initialize();
    await AdMob.addListener(BannerAdPluginEvents.SizeChanged, (size) => {
      document.documentElement.style.setProperty('--ad-h', `${size.height}px`);
    });
    await AdMob.showBanner({
      adId: BANNER_ID || TEST_BANNER_ID,
      isTesting: !BANNER_ID,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
    });
  } catch (e) {
    console.warn('Реклама не загрузилась:', e);
  }
}
