import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { apiFetch } from '@/services/api-client';

let notificationsConfigured = false;

function configureNotificationsIfNeeded() {
  if (notificationsConfigured) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  notificationsConfigured = true;
}

async function configureAndroidNotificationChannelIfNeeded(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#208AEF',
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

async function ensurePermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted || existing.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function registerDeviceForPushNotifications(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  configureNotificationsIfNeeded();

  if (!Device.isDevice) {
    return;
  }

  const hasPermission = await ensurePermission();
  if (!hasPermission) {
    return;
  }

  await configureAndroidNotificationChannelIfNeeded();

  const tokenResponse = await Notifications.getExpoPushTokenAsync();
  const token = tokenResponse.data;

  if (!token) {
    return;
  }

  await apiFetch('/notifications/devices', {
    method: 'POST',
    body: JSON.stringify({
      token,
      platform: Platform.OS,
    }),
  });
}

export async function triggerTestPushNotification(input?: {
  title?: string;
  body?: string;
  category?: 'infrastructure' | 'location' | 'weather';
}): Promise<void> {
  await apiFetch('/notifications/test', {
    method: 'POST',
    body: JSON.stringify({
      title: input?.title,
      body: input?.body,
      category: input?.category,
    }),
  });
}
