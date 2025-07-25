import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

async function getToken() {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No token found in storage');
    return token;
  } catch (error) {
    console.error('[getToken] Error:', error.message);
    throw error;
  }
}

export async function fetchMyTasks() {
  const url = `${API_URL}api/tasks/my-tasks`;
  console.log('[fetchMyTasks] URL:', url);

  try {
    const token = await getToken();

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
   

    if (!response.ok) throw new Error(data.message || 'Failed to fetch my tasks');
    return data.tasks || [];
  } catch (error) {
    console.error(' [fetchMyTasks] Error:', error.message);
    throw error;
  }
}

export async function fetchTasksCreatedByMe() {
  const url = `${API_URL}api/tasks/my-created-tasks`;
  console.log('[fetchTasksCreatedByMe] URL:', url);

  try {
    const token = await getToken();

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();


    if (!response.ok) throw new Error(data.message || 'Failed to fetch created tasks');
    return data.tasks || [];
  } catch (error) {
    console.error('[fetchTasksCreatedByMe] Error:', error.message);
    throw error;
  }
}

export async function createTask(taskData) {
  const url = `${API_URL}api/tasks/create`;
 

  try {
    const token = await getToken();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    const data = await response.json();
   
    if (!response.ok) throw new Error(data.message || 'Failed to create task');
    return data;
  } catch (error) {
    console.error('[createTask] Error:', error.message);
    throw error;
  }
}
