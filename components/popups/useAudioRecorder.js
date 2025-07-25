import { useState, useRef } from 'react';
import { Audio } from 'expo-av';
import { Alert } from 'react-native';

export default function useAudioRecorder({ onRecordingFinished }) {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access microphone is required!');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setSeconds(0);
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      Alert.alert('Recording error', err.message);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setIsRecording(false);
      setRecording(null);
      clearInterval(intervalRef.current);
      if (onRecordingFinished && uri) {
        onRecordingFinished({
          uri,
          name: `audio_${Date.now()}.m4a`,
          type: 'audio/m4a',
        });
      }
    } catch (err) {
      Alert.alert('Stop recording error', err.message);
    } finally {
      setSeconds(0);
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
    seconds,
  };
}