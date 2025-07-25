import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert } from 'react-native';

export default function useAttachmentPicker() {
  const [attachments, setAttachments] = useState([]);
  const [attaching, setAttaching] = useState(false);

  const normalize = (file) => ({
    uri: file.uri,
    name: file.name || file.fileName || file.uri?.split('/').pop(),
    type: file.mimeType || file.type || 'application/octet-stream',
    isExisting: false,
  });

  const pickAttachment = async (type) => {
    try {
      setAttaching(true);
      let result;
      let pickedFiles = [];
      if (type === 'photo') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) { setAttaching(false); return []; }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        });
        if (!result.canceled) {
          pickedFiles = result.assets.map(normalize);
          setAttachments(prev => [...prev, ...pickedFiles]);
        }
      } else if (type === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) { setAttaching(false); return []; }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        });
        if (!result.canceled) {
          pickedFiles = result.assets.map(normalize);
          setAttachments(prev => [...prev, ...pickedFiles]);
        }
      } else if (type === 'video') {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        });
        if (!result.canceled) {
          pickedFiles = result.assets.map(normalize);
          setAttachments(prev => [...prev, ...pickedFiles]);
        }
      } else if (type === 'document') {
        result = await DocumentPicker.getDocumentAsync({
          copyToCacheDirectory: true,
          type: "*/*",
        });
        // console.log('DocumentPicker result:', result);
        let fileObj;
        if (result.type === 'success' && result.uri) {
          // Old API: single file
          fileObj = normalize(result);
        } else if (result.assets && result.assets.length > 0) {
          // New API: assets array
          fileObj = normalize(result.assets[0]);
        }
        if (fileObj) {
          pickedFiles = [fileObj];
          setAttachments(prev => [...prev, fileObj]);
        }
      }
      setAttaching(false);
      return pickedFiles; // <-- always return picked files array
    } catch (err) {
      setAttaching(false);
      Alert.alert('Attachment Error', err.message || 'Failed to pick attachment');
      return [];
    }
  };

  const clearAttachments = () => setAttachments([]);

  return { attachments, pickAttachment, clearAttachments, setAttachments, attaching };
}
