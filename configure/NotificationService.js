// 📁 NotificationService.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

// export async function registerForPushNotificationsAsync() {
//   let token;
//   if (Device.isDevice) {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;

//     if (existingStatus !== 'granted') {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }

//     if (finalStatus !== 'granted') {
//       Alert.alert('Failed to get push token for push notification!');
//       return;
//     }

//     token = (await Notifications.getExpoPushTokenAsync()).data;
//     console.log('Expo Push Token:', token);
//     await AsyncStorage.setItem('expoPushToken', token);
//   } else {
//     Alert.alert('Must use physical device for Push Notifications');
//   }

//   if (Platform.OS === 'android') {
//     await Notifications.setNotificationChannelAsync('default', {
//       name: 'default',
//       importance: Notifications.AndroidImportance.MAX,
//       sound: 'default',
//     });
//   }

//   return token;
// }
// NotificationService.js

export async function registerForPushNotificationsAsync(authToken) {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Failed to get push token for push notification!');
      return;
    }

    // ✅ Get native device push token (APNs or FCM)
    const { data: nativeToken } = await Notifications.getDevicePushTokenAsync();
    token = nativeToken;

    console.log('📱 Native Device Push Token:', token);

    // Store locally for reference
    await AsyncStorage.setItem('nativePushToken', token);

    // Send to backend
    await fetch('https://api.karyah.in/api/devices/deviceToken', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deviceToken: token,
        platform: Platform.OS,
      }),
    });
  } else {
    Alert.alert('Must use physical device for Push Notifications');
  }

  // Android channel setup
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
    });
  }

  return token;
}


export async function setupNotificationListener(onReceive, onTap) {
  const notificationSound = new Audio.Sound();
  await notificationSound.loadAsync(require('../assets/sounds/refresh.wav'));

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    })
  });

  const foregroundSub = Notifications.addNotificationReceivedListener(async (notification) => {
    console.log('Notification received:', notification);
    await notificationSound.replayAsync();
    onReceive?.(notification);
  });

  const tappedSub = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Tapped Notification:', response);
    onTap?.(response);
  });

  return [foregroundSub, tappedSub];
}
