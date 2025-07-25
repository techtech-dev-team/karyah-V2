import { API_URL } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getUserWeeklyAnalysis(token) {
  try {
    const res = await fetch(`${API_URL}api/auth/analysis`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('Error from API:', errorData); // <-- log error response
      throw errorData;
    }

    const jsonData = await res.json();
    // console.log('Weekly Analysis Response:', jsonData); // <-- log success response
    return jsonData;

  } catch (err) {
    console.error('Fetch failed:', err); // <-- log network or unexpected error
    throw err;
  }
}
