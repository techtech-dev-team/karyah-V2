import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import DateBox from 'components/task details/DateBox';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { getProjectById } from '../../utils/project';
import { createTask } from '../../utils/task';
import AttachmentSheet from '../popups/AttachmentSheet';
import CustomPickerDrawer from '../popups/CustomPickerDrawer';
import useAttachmentPicker from '../popups/useAttachmentPicker';
import useAudioRecorder from '../popups/useAudioRecorder';
export default function TaskForm({
  values,
  onChange,
  onSubmit,
  theme,
  projectId,
  worklistId,
  worklistName,
  users = [],
  projectTasks = [],

}) {
  const [projectName, setProjectName] = useState('');
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [showDepPicker, setShowDepPicker] = useState(false);
  const [showAttachmentSheet, setShowAttachmentSheet] = useState(false);
  const [loading, setLoading] = useState(false);

  const { attachments, pickAttachment, setAttachments } = useAttachmentPicker();
  const { isRecording, startRecording, stopRecording, seconds } = useAudioRecorder({
    onRecordingFinished: (audioFile) => {
      setAttachments(prev => [...prev, audioFile]);
      Alert.alert('Audio recorded and attached!');
    }
  });
  const taskValueKey = projectTasks.length && projectTasks[0]?.id !== undefined ? 'id' : 'taskId';

  const selectedDepIds = Array.isArray(values.taskDeps)
    ? values.taskDeps.map(String)
    : [];


  const selectedDeps = selectedDepIds
    .map(id => projectTasks.find(t => String(t[taskValueKey]) === id))
    .filter(Boolean);

  useEffect(() => {
    if (projectId) {
      onChange('taskProject', projectId);

      const fetchProject = async () => {
        try {
          const res = await getProjectById(projectId);
          console.log('Fetched project:', res);
          const name = res.name || res.projectName || 'Project';
          setProjectName(name);
        } catch (err) {
          console.error('Failed to fetch project:', err.message);
          setProjectName('Project Not Found');
        }
      };

      fetchProject();
    }

    if (worklistId) {
      onChange('taskWorklist', worklistId);
    }
  }, [projectId, worklistId]);

  const isValidDate = (date) => {
    return date && !isNaN(new Date(date).getTime());
  };

  const handleTaskCreate = async () => {
    try {
      const startDate = isValidDate(values.startDate)
        ? new Date(values.startDate).toISOString().slice(0, 19).replace('T', ' ')
        : null;

      const endDate = isValidDate(values.endDate)
        ? new Date(values.endDate).toISOString().slice(0, 19).replace('T', ' ')
        : null;

      const assignedUserIds = Array.isArray(values.assignTo)
        ? values.assignTo.map(id => Number(id)).filter(Boolean)
        : [];

      const dependentTaskIds = Array.isArray(values.taskDeps)
        ? values.taskDeps.map((id) => String(id))
        : [];

      const parentId = values.parentId ? Number(values.parentId) : undefined;
      const images = attachments.map(att => ({
        uri: att.uri,
        name: att.name || att.uri?.split('/').pop(),
        type: att.mimeType || att.type || 'application/octet-stream',
      }));
      const taskData = {
        name: values.taskName,
        description: values.taskDesc,
        assignedUserIds,
        dependentTaskIds,
        startDate,
        endDate,
        worklistId: values.taskWorklist,
        projectId: values.taskProject,
        status: 'Pending',
        progress: 0,
        images,
        ...(parentId && { parentId }),
      };

      await createTask(taskData);
      Alert.alert('Success', 'Task created successfully!');
      onSubmit();
    } catch (error) {
      console.error('Create task failed:', error.message);
      Alert.alert('Error', error.message || 'Failed to create task');
    }
  };

  const handleUserToggle = (userId) => {
    const current = values.assignTo || [];
    const updated = current.includes(userId)
      ? current.filter(id => id !== userId)
      : [...current, userId];
    onChange('assignTo', updated);
  };

  const handleDepToggle = (taskId) => {
    const current = Array.isArray(values.taskDeps) ? [...values.taskDeps] : [];
    const id = String(taskId);

    const updated = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id];

    onChange('taskDeps', updated); // ✅ Save as array
  };

  return (
    <>
      {/* Task Name */}
      <View style={[styles.inputBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Task Name"
          placeholderTextColor="#bbb"
          value={values.taskName}
          onChangeText={(t) => onChange('taskName', t)}
        />
      </View>

      {/* Project Name */}
      <View style={[styles.inputBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={projectName || 'Fetching Project...'}
          editable={false}
        />
      </View>

      {/* Worklist Name */}
      <View style={[styles.inputBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={worklistName || 'Fetching Worklist...'}
          editable={false}
        />
      </View>

      {/* Dependencies Multi-select */}
      <View style={[styles.inputBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TouchableOpacity
          style={{ flex: 1, justifyContent: 'center', paddingVertical: 12 }}
          onPress={() => setShowDepPicker(true)}
          activeOpacity={0.8}
        >
          <Text style={{
            color: selectedDeps.length ? theme.text : theme.secondaryText,
            fontWeight: '400',
            fontSize: 16,
          }}>
            {selectedDeps.length
              ? selectedDeps.map(t => t.name || t.taskName || `Task ${t[taskValueKey]}`).join(', ')
              : 'Select Dependencies'}
          </Text>
        </TouchableOpacity>
        <Feather name="chevron-down" size={20} color="#bbb" style={styles.inputIcon} />
      </View>
      <CustomPickerDrawer
        visible={showDepPicker}
        onClose={() => setShowDepPicker(false)}
        data={projectTasks}
        valueKey={taskValueKey}
        labelKey="name"
        selectedValue={selectedDepIds}
        onSelect={handleDepToggle}
        multiSelect={true}
        theme={theme}
        placeholder="Search task..."
        showImage={false}
      />

      {/* Date Pickers */}
      <View style={styles.dateRow}>
        <DateBox
          theme={theme}
          label="Start Date"
          value={values.startDate}
          onChange={(date) => onChange('startDate', date)} // ✅ crucial
        />
        <DateBox
          theme={theme}
          label="End Date"
          value={values.endDate}
          onChange={(date) => onChange('endDate', date)} // ✅ crucial
        />
      </View>

      {/* Assigned Users Multi-select */}
      <View style={[styles.inputBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TouchableOpacity
          style={{ flex: 1, justifyContent: 'center', paddingVertical: 12 }}
          onPress={() => setShowUserPicker(true)}
          activeOpacity={0.8}
        >
          <Text style={{
            color: values.assignTo?.length ? theme.text : theme.secondaryText,
            fontSize: 16,
            fontWeight: '400',
          }}>
            {values.assignTo?.length
              ? values.assignTo.map(uid =>
                users.find(u => u.userId === uid)?.name || 'Unknown'
              ).join(', ')
              : 'Assign To'}
          </Text>
        </TouchableOpacity>
      </View>
      <CustomPickerDrawer
        visible={showUserPicker}
        onClose={() => setShowUserPicker(false)}
        data={users}
        valueKey="userId"
        labelKey="name"
        imageKey="profilePhoto"
        selectedValue={values.assignTo}
        onSelect={handleUserToggle}
        multiSelect={true}
        theme={theme}
        placeholder="Search user..."
        showImage={true}
      />

      {/* Attachment & Audio Recorder Input */}
      <View style={[styles.inputBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Add Attachments"
          placeholderTextColor={theme.secondaryText}
          editable={false}
        />
        {/* Attachment Icon */}
        <Feather
          name="paperclip"
          size={20}
          color="#888"
          style={styles.inputIcon}
          onPress={() => setShowAttachmentSheet(true)}
        />

        {/* Microphone Icon */}
        <MaterialCommunityIcons
          name={isRecording ? "microphone" : "microphone-outline"}
          size={20}
          color={isRecording ? "#E53935" : "#888"}
          style={styles.inputIcon}
          onPress={isRecording ? stopRecording : startRecording}
        />

        {/* Recording Timer */}
        {isRecording && (
          <Text style={{ color: "#E53935", marginLeft: 8 }}>{seconds}s</Text>
        )}
      </View>

      {/* Attachment Preview Grid */}
      {attachments.length > 0 && (
        <View style={{ marginHorizontal: 16, marginBottom: 10 }}>
          {Array.from({ length: Math.ceil(attachments.length / 2) }).map((_, rowIdx) => (
            <View
              key={rowIdx}
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}
            >
              {[0, 1].map(colIdx => {
                const idx = rowIdx * 2 + colIdx;
                const att = attachments[idx];
                if (!att) return <View key={colIdx} style={{ flex: 1 }} />;

                return (
                  <View
                    key={att.uri || att.name || idx}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      padding: 8,
                      borderWidth: 1,
                      borderColor: '#ccc',
                      borderRadius: 10,
                      backgroundColor: '#F9FAFB',
                      marginRight: colIdx === 0 ? 12 : 0,
                    }}
                  >
                    {/* Image Preview */}
                    {att.type?.startsWith('image') && (
                      <TouchableOpacity onPress={() => {/* optional modal */ }}>
                        <Image
                          source={{ uri: att.uri }}
                          style={{ width: 25, height: 25, borderRadius: 6, marginRight: 8 }}
                        />
                      </TouchableOpacity>
                    )}

                    {/* Audio Playback */}
                    {att.type?.startsWith('audio') && (
                      <TouchableOpacity
                        onPress={async () => {
                          const { Sound } = await import('expo-av');
                          const { sound } = await Sound.createAsync({ uri: att.uri });
                          await sound.playAsync();
                        }}
                        style={{ marginRight: 8 }}
                      >
                        <MaterialCommunityIcons name="play-circle-outline" size={28} color="#1D4ED8" />
                      </TouchableOpacity>
                    )}

                    {/* Fallback File Icon */}
                    {!att.type?.startsWith('image') && !att.type?.startsWith('audio') && (
                      <MaterialCommunityIcons name="file-document-outline" size={28} color="#888" style={{ marginRight: 8 }} />
                    )}

                    {/* File Name */}
                    <Text style={{ color: '#444', fontSize: 13, flex: 1 }}>
                      {(att.name || att.uri?.split('/').pop() || 'Attachment').length > 20
                        ? (att.name || att.uri?.split('/').pop()).slice(0, 15) + '...'
                        : (att.name || att.uri?.split('/').pop())}
                    </Text>

                    {/* Delete Button */}
                    <TouchableOpacity
                      onPress={() => {
                        setAttachments(prev => prev.filter((_, i) => i !== idx));
                      }}
                      style={{ marginLeft: 8 }}
                    >
                      <MaterialCommunityIcons name="close-circle" size={22} color="#E53935" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      )}

      {/* Attachment Picker Bottom Sheet */}
      <AttachmentSheet
        visible={showAttachmentSheet}
        onClose={() => setShowAttachmentSheet(false)}
        onPick={async (type) => {
          await pickAttachment(type);
          setShowAttachmentSheet(false);
        }}
      />

      {/* Description */}
      <View style={[styles.inputBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TextInput
          style={[styles.input, { color: theme.text, height: 70 }]}
          placeholder="Description"
          placeholderTextColor="#bbb"
          value={values.taskDesc}
          onChangeText={(t) => onChange('taskDesc', t)}
          multiline
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.drawerBtn} onPress={handleTaskCreate}>
        <LinearGradient
          colors={['#011F53', '#366CD9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.drawerBtnGradient}
        >
          <Text style={styles.drawerBtnText}>Add Task</Text>
        </LinearGradient>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  inputBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    marginHorizontal: 22,
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingVertical: 0,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    fontWeight: '400',
    backgroundColor: 'transparent',
    paddingVertical: 12,
  },
  inputIcon: {
    marginLeft: 8,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 22,
    marginBottom: 14,
    gap: 10,
  },
  dateBox: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginRight: 0,
    gap: 8,
  },
  dateLabel: {
    fontSize: 13,
    color: '#888',
    marginLeft: 4,
  },
  dateValue: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
    marginLeft: 6,
  },
  drawerBtn: {
    marginHorizontal: 22,
    marginTop: 10,
    marginBottom: 0,
    borderRadius: 16,
    overflow: 'hidden',
  },
  drawerBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 16,
  },
  drawerBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
  },
});