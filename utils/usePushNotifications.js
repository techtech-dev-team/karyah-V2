import { useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigationRef } from '../navigation/navigationRef'; // adjust the path

const API_URL = 'https://api.karyah.in/';

async function requestUserPermission() {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      {
        title: 'Notification Permission',
        message: 'Karyah needs notification permission to alert you.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      }
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      console.warn('🛑 Notification permission denied.');
      return false;
    }
  }

  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  return enabled;
}

async function getFCMTokenAndRegister() {
  const hasPermission = await requestUserPermission();
  if (!hasPermission) {
    console.warn('🛑 Notification permission not granted.');
    return;
  }

  const token = await messaging().getToken();
  console.log('📲 FCM Token:', token);

  const userToken = await AsyncStorage.getItem('token');
  if (!userToken || !token) {
    console.warn('⚠️ Missing user or device token.');
    return;
  }

  try {
    const res = await fetch(`${API_URL}api/devices/deviceToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        deviceToken: token,
        platform: Platform.OS === 'ios' ? 'iOS' : 'Android',
      }),
    });

    const data = await res.json();
    console.log('✅ Device token registered:', data);
  } catch (error) {
    console.error('❌ Error sending token:', error);
  }
}

function handleNotificationNavigation(data) {
  if (!data || !data.type) return;

  switch (data.type) {
    case 'project':
      if (data.projectId) {
        navigationRef.navigate('ProjectDetailsScreen', {
          projectId: data.projectId,
        });
      }
      break;
    case 'task':
      if (data.taskId) {
        navigationRef.navigate('TaskDetails', {
          taskId: data.taskId,
        });
      }
      break;
    case 'issue':
      if (data.issueId) {
        navigationRef.navigate('IssueDetails', {
          issueId: data.issueId,
        });
      }
      break;
    default:
      console.warn('📬 Unknown notification type:', data.type);
  }
}

export default function usePushNotifications() {
  useEffect(() => {
    getFCMTokenAndRegister();

    // Background state
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('🔄 Notification tapped (background):', remoteMessage);
      handleNotificationNavigation(remoteMessage?.data);
    });

    // Quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('📲 Notification caused app to open from quit state:', remoteMessage);
          handleNotificationNavigation(remoteMessage?.data);
        }
      });

    // Foreground handling
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('📥 Foreground notification:', remoteMessage);
      // Optional: In-app alert or badge logic here
    });

    return unsubscribe;
  }, []);
}
