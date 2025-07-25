import { Poppins_400Regular, Poppins_700Bold, useFonts } from '@expo-google-fonts/poppins';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
// import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import messaging from '@react-native-firebase/messaging';
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider, useThemeContext } from './theme/ThemeContext';
import { configurePushNotifications } from './utils/pushNotification';
// Notification behavior
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: true,
//   }),
// });

// Helper to register and return token
// async function registerForPushNotificationsAsync() {
//   let token;
//   const { status: existingStatus } = await Notifications.getPermissionsAsync();
//   let finalStatus = existingStatus;

//   if (existingStatus !== 'granted') {
//     const { status } = await Notifications.requestPermissionsAsync();
//     finalStatus = status;
//   }

//   if (finalStatus !== 'granted') {
//     alert('Failed to get push token for notifications!');
//     return null;
//   }

//   token = (await Notifications.getExpoPushTokenAsync()).data;
//   return token;
// }

async function requestFCMPermissionAndToken() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) {
    alert('Push notification permission denied');
    return null;
  }

  try {
    const fcmToken = await messaging().getToken();
    console.log('📲 FCM Token:', fcmToken);
    return fcmToken;
  } catch (error) {
    console.error('❌ Error fetching FCM token:', error);
    return null;
  }
}

function AppContent() {
  const { colorMode, theme } = useThemeContext();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });
  const [biometricChecked, setBiometricChecked] = useState(false);
  const [biometricPassed, setBiometricPassed] = useState(false);

  const notificationListenerRef = useRef();
  const responseListenerRef = useRef();

  // useEffect(() => {

  // const setupPush = async () => {
  //   console.log('🔄 Starting push notification setup...');

  //   const token = await registerForPushNotificationsAsync();
  //   console.log('📱 Push token received:', token);

  //   if (token) {
  //     const userToken = await AsyncStorage.getItem('token');
  //     console.log('🔑 User auth token:', userToken);

  //     if (!userToken) {
  //       console.warn('⚠️ No auth token found, skipping device token send.');
  //       return;
  //     }

  //     const url = `${API_URL}api/devices/deviceToken`;
  //     console.log('🌐 Sending device token to:', url);

  //     try {
  //       const response = await fetch(url, {
  //         method: 'POST',
  //         headers: {
  //           Authorization: `Bearer ${userToken}`,
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({
  //           deviceToken: token,
  //           platform: Platform.OS,
  //         }),
  //       });

  //       const data = await response.json();
  //       console.log('✅ Response from backend:', data);
  //     } catch (err) {
  //       console.error('❌ Error sending device token:', err);
  //     }
  //   } else {
  //     console.warn('⚠️ No push token received.');
  //   }
  // };

  // setupPush();

  //   // Notification listeners
  //   notificationListenerRef.current = Notifications.addNotificationReceivedListener((notification) => {
  //     console.log('Foreground push received:', notification);
  //   });

  //   responseListenerRef.current = Notifications.addNotificationResponseReceivedListener((response) => {
  //     console.log('Notification tapped:', response);
  //   });

  //   return () => {
  //     if (notificationListenerRef.current)
  //       Notifications.removeNotificationSubscription(notificationListenerRef.current);
  //     if (responseListenerRef.current)
  //       Notifications.removeNotificationSubscription(responseListenerRef.current);
  //   };
  // }, []);

  useEffect(() => {
  const setupPush = async () => {
    console.log('🔄 Starting FCM push setup...');
    const token = await requestFCMPermissionAndToken();

    if (!token) {
      console.warn('⚠️ No FCM token retrieved.');
      return;
    }

    const userToken = await AsyncStorage.getItem('token');
    console.log('🔑 User auth token:', userToken);

    if (!userToken) {
      console.warn('⚠️ No auth token found, skipping token send.');
      return;
    }

    const url = `${API_URL}api/devices/deviceToken`;
    console.log('🌐 Sending device token to:', url);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceToken: token,
          platform: Platform.OS,
        }),
      });

      const data = await response.json();
      console.log('✅ FCM token registered with backend:', data);
    } catch (err) {
      console.error('❌ Error sending FCM token:', err);
    }
  };

  setupPush();

  // Handle notifications
  const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
    console.log('📩 FCM message received (foreground):', remoteMessage);
    // You can show an in-app alert or local notification here
  });

  const unsubscribeBackground = messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('📦 FCM message received (background):', remoteMessage);
  });

  return () => {
    unsubscribeForeground();
    // Background handler does not need to be unsubscribed
  };
}, []);


  // Biometric check
  useEffect(() => {
    (async () => {
      const bio = await AsyncStorage.getItem('biometricEnabled');
      if (bio === 'true') {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (!hasHardware || !isEnrolled) {
          alert('Biometric not available or not enrolled.');
          setBiometricChecked(true);
          setBiometricPassed(true);
          return;
        }
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to access the app',
          fallbackLabel: 'Enter Passcode',
        });
        setBiometricChecked(true);
        setBiometricPassed(result.success);
        if (!result.success) alert('Biometric auth failed.');
      } else {
        setBiometricChecked(true);
        setBiometricPassed(true);
      }
    })();
  }, []);

  if (!fontsLoaded || !biometricChecked || !biometricPassed) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  return (
    <>
      <StatusBar
        animated
        barStyle={colorMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={Platform.OS === 'android' ? theme.card : undefined}
        translucent={false}
      />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
        <Toast />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}